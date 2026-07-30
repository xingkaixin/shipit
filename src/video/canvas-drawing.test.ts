import { describe, expect, it, vi } from "vitest"

import { drawImageCover } from "@/video/canvas-drawing"

describe("canvas image drawing", () => {
  it("uses high-quality interpolation for raster assets", () => {
    const context = {
      drawImage: vi.fn<(...args: unknown[]) => void>(),
      imageSmoothingEnabled: false,
      imageSmoothingQuality: "low",
    } as unknown as CanvasRenderingContext2D

    drawImageCover(
      context,
      {
        source: {} as CanvasImageSource,
        width: 2_400,
        height: 1_200,
      },
      0,
      0,
      800,
      400
    )

    expect(context.imageSmoothingEnabled).toBe(true)
    expect(context.imageSmoothingQuality).toBe("high")
  })
})
