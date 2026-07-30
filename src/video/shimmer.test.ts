import { describe, expect, it, vi } from "vitest"

import { shimmerGradient } from "@/video/shimmer"

describe("shimmerGradient", () => {
  it("does not call Canvas with invalid bounds", () => {
    const createLinearGradient =
      vi.fn<
        (x0: number, y0: number, x1: number, y1: number) => CanvasGradient
      >()
    const context = {
      createLinearGradient,
    } as unknown as CanvasRenderingContext2D

    expect(
      shimmerGradient(
        context,
        { x: 0, y: 0, width: Number.NaN, height: 100 },
        2,
        1,
        2
      )
    ).toBeNull()
    expect(createLinearGradient).not.toHaveBeenCalled()
  })
})
