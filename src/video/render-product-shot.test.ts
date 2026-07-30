import { describe, expect, it } from "vitest"

import { productShotGeometry } from "@/video/render-product-shot"
import { PRODUCT_FRAMES } from "@/video/release-video"

const AREA = {
  centerX: 1_400,
  centerY: 520,
  maximumWidth: 700,
  maximumHeight: 650,
}

describe("product shot geometry", () => {
  it("keeps every frame within its configured area", () => {
    for (const frame of PRODUCT_FRAMES) {
      const geometry = productShotGeometry(
        { width: 1_440, height: 900 },
        frame,
        AREA,
        1
      )

      expect(geometry.outer.width).toBeLessThanOrEqual(AREA.maximumWidth)
      expect(geometry.outer.height).toBeLessThanOrEqual(AREA.maximumHeight)
      expect(geometry.screen.width).toBeGreaterThan(0)
      expect(geometry.screen.height).toBeGreaterThan(0)
      expect(geometry.asset === null).toBe(frame === "none")
    }
  })

  it("uses a portrait screen for the iPhone frame", () => {
    const geometry = productShotGeometry(
      { width: 1_440, height: 900 },
      "iphone",
      AREA,
      1
    )

    expect(geometry.screen.height).toBeGreaterThan(geometry.screen.width)
  })

  it("reserves browser chrome above the screenshot", () => {
    const geometry = productShotGeometry(
      { width: 1_440, height: 900 },
      "browser",
      AREA,
      1
    )

    expect(geometry.screen.y).toBeGreaterThan(geometry.outer.y)
    expect(geometry.asset?.x).toBeLessThan(geometry.outer.x)
  })

  it("uses frame geometry instead of uploaded image dimensions", () => {
    const landscape = productShotGeometry(
      { width: 1_440, height: 900 },
      "macbook",
      AREA,
      1
    )
    const portrait = productShotGeometry(
      { width: 900, height: 1_440 },
      "macbook",
      AREA,
      1
    )

    expect(portrait).toEqual(landscape)
  })

  it("falls back to finite geometry for invalid dimensions and scale", () => {
    const geometry = productShotGeometry(
      { width: 1_440, height: 0 },
      "browser",
      AREA,
      Number.NaN
    )

    expect(Number.isFinite(geometry.outer.width)).toBe(true)
    expect(Number.isFinite(geometry.outer.height)).toBe(true)
  })
})
