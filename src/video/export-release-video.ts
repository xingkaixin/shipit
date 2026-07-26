import {
  BufferTarget,
  CanvasSource,
  Mp4OutputFormat,
  Output,
  StreamTarget,
  type Target,
} from "mediabunny"

import {
  outputBitrate,
  outputDimensions,
  outputFrameCount,
} from "@/video/output-settings"
import { renderReleaseFrame } from "@/video/render-release-frame"
import { ReleaseExportError } from "@/video/release-export-error"
import type {
  ReleaseComposition,
  ReleaseLogoImage,
} from "@/video/release-video"
import { assertOutputEncodingSupport } from "@/video/video-encoding-support"

type ExportReleaseVideoOptions = {
  composition: ReleaseComposition
  onProgress: (progress: number) => void
  signal?: AbortSignal
}

export type ExportedReleaseVideo = {
  video: Blob
  cleanup: () => Promise<void>
}

type OutputStorage = {
  target: Target
  fastStart: "in-memory" | "reserve"
  video: () => Promise<Blob>
  cleanup: () => Promise<void>
}

export async function exportReleaseVideo({
  composition,
  onProgress,
  signal,
}: ExportReleaseVideoOptions): Promise<ExportedReleaseVideo> {
  throwIfAborted(signal)
  await document.fonts.ready
  throwIfAborted(signal)
  await assertOutputEncodingSupport(composition.output)
  throwIfAborted(signal)

  const dimensions = outputDimensions(
    composition.output.aspectRatio,
    composition.output.resolution
  )
  const frameCount = outputFrameCount(composition.output.frameRate)
  const bitrate = outputBitrate(dimensions, composition.output.frameRate)
  const canvas = document.createElement("canvas")
  canvas.width = dimensions.width
  canvas.height = dimensions.height

  const context = canvas.getContext("2d", { alpha: false })
  if (!context) {
    throw new ReleaseExportError("canvas")
  }

  const compositionSnapshot = snapshotComposition(composition)
  const storage = await createOutputStorage(
    composition.output.resolution === "4k"
  )
  let output: Output | null = null

  try {
    output = new Output({
      format: new Mp4OutputFormat({ fastStart: storage.fastStart }),
      target: storage.target,
    })
    const videoSource = new CanvasSource(canvas, {
      codec: "avc",
      bitrate,
      keyFrameInterval: 2,
    })

    output.addVideoTrack(videoSource, {
      frameRate: composition.output.frameRate,
      maximumPacketCount: frameCount,
    })
    output.setMetadataTags({
      title: `${composition.content.productName} ${composition.content.version}`,
      comment: "Created with Shipit",
    })

    await output.start()

    for (let frameIndex = 0; frameIndex < frameCount; frameIndex += 1) {
      throwIfAborted(signal)
      const timestamp = frameIndex / composition.output.frameRate
      renderReleaseFrame(context, compositionSnapshot.composition, timestamp)
      await videoSource.add(timestamp, 1 / composition.output.frameRate)
      onProgress((frameIndex + 1) / frameCount)
    }

    throwIfAborted(signal)
    await output.finalize()
    throwIfAborted(signal)

    return {
      video: await storage.video(),
      cleanup: storage.cleanup,
    }
  } catch (error) {
    if (output) {
      await cancelOutput(output)
    }
    await storage.cleanup()
    throw error
  } finally {
    compositionSnapshot.dispose()
  }
}

async function cancelOutput(output: Output): Promise<void> {
  try {
    await output.cancel()
  } catch (error) {
    console.error("[video-export] Failed to cancel output", error)
  }
}

async function createOutputStorage(
  preferFileStorage: boolean
): Promise<OutputStorage> {
  if (preferFileStorage) {
    let root: FileSystemDirectoryHandle | null = null
    let fileName: string | null = null

    try {
      const directory = await navigator.storage.getDirectory()
      const temporaryFileName = `shipit-export-${uniqueId()}.mp4`
      root = directory
      fileName = temporaryFileName
      const fileHandle = await directory.getFileHandle(temporaryFileName, {
        create: true,
      })
      const writable = await fileHandle.createWritable()

      return {
        target: new StreamTarget(writable, {
          chunked: true,
          chunkSize: 4 * 1024 * 1024,
        }),
        fastStart: "reserve",
        video: () => fileHandle.getFile(),
        cleanup: () => removeTemporaryFile(directory, temporaryFileName),
      }
    } catch (error) {
      if (root && fileName) {
        await removeTemporaryFile(root, fileName)
      }
      console.warn(
        "[video-export] OPFS unavailable, falling back to memory",
        error
      )
    }
  }

  const target = new BufferTarget()
  return {
    target,
    fastStart: "in-memory",
    video: async () => {
      if (!target.buffer) {
        throw new ReleaseExportError("empty")
      }

      return new Blob([target.buffer], { type: "video/mp4" })
    },
    cleanup: async () => undefined,
  }
}

async function removeTemporaryFile(
  root: FileSystemDirectoryHandle,
  fileName: string
): Promise<void> {
  try {
    await root.removeEntry(fileName)
  } catch (error) {
    console.error("[video-export] Failed to remove temporary file", error)
  }
}

function snapshotComposition(composition: ReleaseComposition): {
  composition: ReleaseComposition
  dispose: () => void
} {
  const logoSnapshot = snapshotLogo(composition.content.logoImage)
  if (!logoSnapshot) {
    return {
      composition,
      dispose: () => undefined,
    }
  }

  return {
    composition: {
      ...composition,
      content: {
        ...composition.content,
        logoImage: logoSnapshot,
      },
    },
    dispose: () => {
      if (logoSnapshot.source instanceof HTMLCanvasElement) {
        logoSnapshot.source.width = 0
        logoSnapshot.source.height = 0
      }
    },
  }
}

function snapshotLogo(image: ReleaseLogoImage | null): ReleaseLogoImage | null {
  if (!image) {
    return null
  }

  const maximumEdge = 1_024
  const scale = Math.min(1, maximumEdge / Math.max(image.width, image.height))
  const canvas = document.createElement("canvas")
  canvas.width = Math.max(1, Math.round(image.width * scale))
  canvas.height = Math.max(1, Math.round(image.height * scale))
  const context = canvas.getContext("2d")

  if (!context) {
    throw new ReleaseExportError("logo")
  }

  context.drawImage(image.source, 0, 0, canvas.width, canvas.height)
  return {
    source: canvas,
    width: canvas.width,
    height: canvas.height,
  }
}

function throwIfAborted(signal?: AbortSignal): void {
  if (signal?.aborted) {
    throw signal.reason ?? new DOMException("Export cancelled", "AbortError")
  }
}

function uniqueId(): string {
  return typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`
}
