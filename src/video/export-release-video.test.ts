// @vitest-environment happy-dom

import { beforeEach, describe, expect, it, vi } from "vitest"

import { exportReleaseVideo } from "@/video/export-release-video"
import { renderReleaseFrame } from "@/video/render-release-frame"
import type { ReleaseComposition } from "@/video/release-video"

const mediaMocks = vi.hoisted(() => ({
  outputs: [] as Array<{
    options: unknown
    metadata: unknown
    cancel: () => Promise<void>
  }>,
  streamTargets: [] as unknown[],
  bufferTargets: [] as Array<{ buffer: ArrayBuffer | null }>,
  addFrame: vi.fn<(timestamp: number, duration: number) => Promise<void>>(
    async () => undefined
  ),
  trackMetadata: null as unknown,
}))

vi.mock("mediabunny", () => {
  class BufferTarget {
    buffer: ArrayBuffer | null = new ArrayBuffer(4)

    constructor() {
      mediaMocks.bufferTargets.push(this)
    }
  }

  class StreamTarget {
    constructor(writable: unknown, options: unknown) {
      mediaMocks.streamTargets.push({ writable, options })
    }
  }

  class Mp4OutputFormat {
    options: unknown

    constructor(options: unknown) {
      this.options = options
    }
  }

  class CanvasSource {
    add = mediaMocks.addFrame
  }

  class Output {
    cancel = vi.fn<() => Promise<void>>(async () => undefined)
    options: unknown
    metadata: unknown

    constructor(options: unknown) {
      this.options = options
      mediaMocks.outputs.push(this)
    }

    addVideoTrack(_source: unknown, metadata: unknown) {
      mediaMocks.trackMetadata = metadata
    }

    setMetadataTags(metadata: unknown) {
      this.metadata = metadata
    }

    async start() {}

    async finalize() {}
  }

  return {
    BufferTarget,
    CanvasSource,
    Mp4OutputFormat,
    Output,
    StreamTarget,
  }
})

vi.mock("@/video/render-release-frame", () => ({
  renderReleaseFrame:
    vi.fn<
      (
        context: CanvasRenderingContext2D,
        composition: ReleaseComposition,
        time: number
      ) => void
    >(),
}))

vi.mock("@/video/video-encoding-support", () => ({
  assertOutputEncodingSupport: vi.fn<
    (output: ReleaseComposition["output"]) => Promise<void>
  >(async () => undefined),
}))

const BASE_COMPOSITION: ReleaseComposition = {
  locale: "en",
  content: {
    productName: "Shipit",
    version: "v1.0.0",
    detail: { kind: "none" },
    logoImage: null,
    screenshotImage: null,
  },
  style: {
    backgroundId: "midnight-burst",
    paletteId: "midnight",
    accentColor: "#B7FF5A",
    logoTreatment: "card-glow",
    titleFontId: "geist",
    titleColor: { useCustom: false, value: "#F7F8FF" },
    titleShimmer: false,
    productShot: {
      frame: "browser",
      scale: 1,
      tilt: -4,
      shimmer: true,
    },
  },
  output: {
    aspectRatio: "landscape",
    resolution: "1080p",
    frameRate: 30,
  },
}

beforeEach(() => {
  mediaMocks.outputs.length = 0
  mediaMocks.streamTargets.length = 0
  mediaMocks.bufferTargets.length = 0
  mediaMocks.trackMetadata = null
  mediaMocks.addFrame.mockReset()
  mediaMocks.addFrame.mockResolvedValue(undefined)
  vi.mocked(renderReleaseFrame).mockClear()

  Object.defineProperty(document, "fonts", {
    configurable: true,
    value: { ready: Promise.resolve() },
  })
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(
    {} as CanvasRenderingContext2D
  )
})

describe("exportReleaseVideo", () => {
  it("uses OPFS streaming for 4K output", async () => {
    const removeEntry = vi.fn<(name: string) => Promise<void>>(
      async () => undefined
    )
    const writable = new WritableStream()
    const file = new File(["video"], "release.mp4", { type: "video/mp4" })
    const fileHandle = {
      createWritable: vi.fn<() => Promise<WritableStream>>(
        async () => writable
      ),
      getFile: vi.fn<() => Promise<File>>(async () => file),
    }
    const root = {
      getFileHandle: vi.fn<(name: string) => Promise<typeof fileHandle>>(
        async () => fileHandle
      ),
      removeEntry,
    }
    Object.defineProperty(navigator, "storage", {
      configurable: true,
      value: {
        getDirectory: vi.fn<() => Promise<FileSystemDirectoryHandle>>(
          async () => {
            return root as unknown as FileSystemDirectoryHandle
          }
        ),
      },
    })

    const result = await exportReleaseVideo({
      composition: {
        ...BASE_COMPOSITION,
        output: {
          ...BASE_COMPOSITION.output,
          resolution: "4k",
          frameRate: 60,
        },
      },
      onProgress: vi.fn<(progress: number) => void>(),
    })

    expect(result.video).toBe(file)
    expect(mediaMocks.streamTargets).toHaveLength(1)
    expect(mediaMocks.bufferTargets).toHaveLength(0)
    expect(mediaMocks.trackMetadata).toMatchObject({
      frameRate: 60,
      maximumPacketCount: 300,
    })

    await result.cleanup()
    expect(removeEntry).toHaveBeenCalledOnce()
  })

  it("cancels the encoder when the export is aborted", async () => {
    const abortController = new AbortController()
    mediaMocks.addFrame.mockImplementationOnce(async () => {
      abortController.abort(new DOMException("cancelled", "AbortError"))
    })

    await expect(
      exportReleaseVideo({
        composition: BASE_COMPOSITION,
        onProgress: vi.fn<(progress: number) => void>(),
        signal: abortController.signal,
      })
    ).rejects.toMatchObject({ name: "AbortError" })

    expect(mediaMocks.outputs[0]?.cancel).toHaveBeenCalledOnce()
  })

  it("snapshots a product screenshot before encoding", async () => {
    const drawImage = vi.fn<(...args: unknown[]) => void>()
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue({
      drawImage,
    } as unknown as CanvasRenderingContext2D)
    const screenshotSource = document.createElement("canvas")

    await exportReleaseVideo({
      composition: {
        ...BASE_COMPOSITION,
        content: {
          ...BASE_COMPOSITION.content,
          screenshotImage: {
            source: screenshotSource,
            width: 2_880,
            height: 1_800,
          },
        },
      },
      onProgress: vi.fn<(progress: number) => void>(),
    })

    const renderedComposition = vi.mocked(renderReleaseFrame).mock.calls[0]?.[1]
    expect(drawImage).toHaveBeenCalledOnce()
    expect(renderedComposition?.content.screenshotImage).toMatchObject({
      width: 2_048,
      height: 1_280,
    })
  })
})
