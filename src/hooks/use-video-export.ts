import * as React from "react"

import { useI18n } from "@/i18n/i18n"
import type { MessageKey } from "@/i18n/messages"
import {
  ReleaseExportError,
  type ReleaseExportErrorCode,
} from "@/video/release-export-error"
import { releaseVideoFileName } from "@/video/release-video-file-name"
import type { ReleaseComposition } from "@/video/release-video"

const PROGRESS_UPDATE_INTERVAL_MS = 80

export type VideoExportState =
  | { status: "idle" }
  | { status: "exporting"; progress: number }
  | { status: "completed" }
  | { status: "failed"; message: string }

export function useVideoExport(composition: ReleaseComposition) {
  const { t } = useI18n()
  const [state, setState] = React.useState<VideoExportState>({
    status: "idle",
  })
  const currentCompositionReference = React.useRef(composition)
  const exportedCompositionReference = React.useRef<ReleaseComposition | null>(
    null
  )
  const isExportingReference = React.useRef(false)
  const abortControllerReference = React.useRef<AbortController | null>(null)
  const isMountedReference = React.useRef(true)
  currentCompositionReference.current = composition

  React.useEffect(() => {
    if (
      isExportingReference.current &&
      exportedCompositionReference.current !== composition
    ) {
      abortControllerReference.current?.abort(
        new DOMException("Configuration changed", "AbortError")
      )
      return
    }

    setState((currentState) =>
      currentState.status === "exporting" ? currentState : { status: "idle" }
    )
  }, [composition])

  React.useEffect(() => {
    isMountedReference.current = true
    return () => {
      isMountedReference.current = false
      abortControllerReference.current?.abort(
        new DOMException("Page closed", "AbortError")
      )
    }
  }, [])

  const exportVideo = React.useCallback(async () => {
    if (isExportingReference.current) {
      return
    }

    isExportingReference.current = true
    const exportedComposition = currentCompositionReference.current
    const abortController = new AbortController()
    abortControllerReference.current = abortController
    exportedCompositionReference.current = exportedComposition
    let lastProgressUpdate = 0

    setState({ status: "exporting", progress: 0 })

    try {
      const { exportReleaseVideo } =
        await import("@/video/export-release-video")
      const result = await exportReleaseVideo({
        composition: exportedComposition,
        onProgress: (progress) => {
          const now = performance.now()
          if (
            progress < 1 &&
            now - lastProgressUpdate < PROGRESS_UPDATE_INTERVAL_MS
          ) {
            return
          }

          lastProgressUpdate = now
          if (isMountedReference.current) {
            setState({ status: "exporting", progress })
          }
        },
        signal: abortController.signal,
      })

      if (
        abortController.signal.aborted ||
        currentCompositionReference.current !== exportedComposition
      ) {
        await result.cleanup()
        if (isMountedReference.current) {
          setState({ status: "idle" })
        }
        return
      }

      downloadVideo(
        result.video,
        releaseVideoFileName(exportedComposition),
        result.cleanup
      )
      setState({ status: "completed" })
    } catch (error) {
      if (isAbortError(error)) {
        if (isMountedReference.current) {
          setState({ status: "idle" })
        }
        return
      }

      console.error("[video-export] Export failed", error)

      if (currentCompositionReference.current !== exportedComposition) {
        if (isMountedReference.current) {
          setState({ status: "idle" })
        }
        return
      }

      if (isMountedReference.current) {
        setState({
          status: "failed",
          message:
            error instanceof ReleaseExportError
              ? t(exportErrorMessageKey(error.code))
              : t("export.error.generic"),
        })
      }
    } finally {
      if (abortControllerReference.current === abortController) {
        abortControllerReference.current = null
        exportedCompositionReference.current = null
        isExportingReference.current = false
      }
    }
  }, [t])

  const cancelExport = React.useCallback(() => {
    abortControllerReference.current?.abort(
      new DOMException("Export cancelled", "AbortError")
    )
  }, [])

  return { state, exportVideo, cancelExport }
}

function exportErrorMessageKey(code: ReleaseExportErrorCode): MessageKey {
  return `export.error.${code}`
}

function downloadVideo(
  video: Blob,
  fileName: string,
  cleanup: () => Promise<void>
): void {
  let videoUrl: string | null = null

  try {
    videoUrl = URL.createObjectURL(video)
    const downloadLink = document.createElement("a")
    downloadLink.href = videoUrl
    downloadLink.download = fileName
    downloadLink.click()
  } finally {
    if (videoUrl) {
      const createdVideoUrl = videoUrl
      window.setTimeout(() => {
        URL.revokeObjectURL(createdVideoUrl)
        void cleanup()
      }, 1_000)
    } else {
      void cleanup()
    }
  }
}

function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === "AbortError"
}
