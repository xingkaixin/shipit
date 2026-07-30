// @vitest-environment happy-dom

import { act, renderHook, waitFor } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"

import { useVideoExport } from "@/hooks/use-video-export"
import type { ReleaseComposition } from "@/video/release-video"

const { exportReleaseVideoMock } = vi.hoisted(() => ({
  exportReleaseVideoMock:
    vi.fn<(options: { signal?: AbortSignal }) => Promise<never>>(),
}))

vi.mock("@/video/export-release-video", () => ({
  exportReleaseVideo: exportReleaseVideoMock,
}))

const BASE_COMPOSITION: ReleaseComposition = {
  locale: "en",
  content: {
    productName: "Shipit",
    version: "v1.0.0",
    detail: { kind: "none" },
    logoImage: null,
    screenshotImage: null,
    productFrameImage: null,
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
      shimmer: true,
    },
  },
  output: {
    aspectRatio: "landscape",
    resolution: "1080p",
    frameRate: 30,
  },
}

afterEach(() => {
  exportReleaseVideoMock.mockReset()
})

describe("useVideoExport", () => {
  it("cancels an in-flight export when the composition changes", async () => {
    let receivedSignal: AbortSignal | undefined
    exportReleaseVideoMock.mockImplementation(
      ({ signal }: { signal?: AbortSignal }) =>
        new Promise((_resolve, reject) => {
          receivedSignal = signal
          signal?.addEventListener("abort", () => reject(signal.reason), {
            once: true,
          })
        })
    )
    const { result, rerender } = renderHook(
      ({ composition }) => useVideoExport(composition),
      { initialProps: { composition: BASE_COMPOSITION } }
    )

    act(() => {
      void result.current.exportVideo()
    })
    await waitFor(() => {
      expect(result.current.state.status).toBe("exporting")
      expect(receivedSignal).toBeDefined()
    })

    rerender({
      composition: {
        ...BASE_COMPOSITION,
        content: {
          ...BASE_COMPOSITION.content,
          productName: "Updated",
        },
      },
    })

    await waitFor(() => {
      expect(receivedSignal?.aborted).toBe(true)
      expect(result.current.state.status).toBe("idle")
    })
  })

  it("exposes explicit cancellation", async () => {
    let receivedSignal: AbortSignal | undefined
    exportReleaseVideoMock.mockImplementation(
      ({ signal }: { signal?: AbortSignal }) =>
        new Promise((_resolve, reject) => {
          receivedSignal = signal
          signal?.addEventListener("abort", () => reject(signal.reason), {
            once: true,
          })
        })
    )
    const { result } = renderHook(() => useVideoExport(BASE_COMPOSITION))

    act(() => {
      void result.current.exportVideo()
    })
    await waitFor(() => {
      expect(receivedSignal).toBeDefined()
    })

    act(() => {
      result.current.cancelExport()
    })

    await waitFor(() => {
      expect(receivedSignal?.aborted).toBe(true)
      expect(result.current.state.status).toBe("idle")
    })
  })
})
