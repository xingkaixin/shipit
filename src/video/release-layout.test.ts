import { describe, expect, it } from "vitest"

import { LOGICAL_VIEWPORTS } from "@/video/output-settings"
import { releaseLayout } from "@/video/release-layout"
import { PRODUCT_SHOT_SCALE_MAX } from "@/video/release-video"

describe("release layout", () => {
  it("uses the vertical canvas instead of scaling the landscape layout", () => {
    const landscape = releaseLayout(
      "landscape",
      "stacked",
      LOGICAL_VIEWPORTS.landscape
    )
    const portrait = releaseLayout(
      "portrait",
      "stacked",
      LOGICAL_VIEWPORTS.portrait
    )

    expect(portrait.titleY).toBeGreaterThan(landscape.titleY)
    expect(portrait.detailY).toBeGreaterThan(landscape.detailY)
    expect(portrait.confettiOriginY).toBeGreaterThan(landscape.confettiOriginY)
  })

  it("derives an asymmetric landscape layout from screenshot presence", () => {
    const layout = releaseLayout(
      "landscape",
      "stacked",
      LOGICAL_VIEWPORTS.landscape,
      "product-shot"
    )

    expect(layout.centerX).toBeLessThan(layout.backgroundCenterX)
    expect(layout.productShotArea?.centerX).toBeGreaterThan(
      layout.backgroundCenterX
    )
    expect(layout.titleMaximumWidth).toBeLessThan(1_000)

    const productShotArea = layout.productShotArea
    expect(productShotArea).not.toBeNull()
    if (!productShotArea) {
      return
    }

    const titleRight = layout.centerX + layout.titleMaximumWidth / 2
    const productShotLeft =
      productShotArea.centerX -
      (productShotArea.maximumWidth * PRODUCT_SHOT_SCALE_MAX) / 2

    expect(productShotArea.maximumWidth).toBeGreaterThanOrEqual(
      LOGICAL_VIEWPORTS.landscape.width * 0.4
    )
    expect(productShotLeft).toBeGreaterThan(titleRight)
  })

  it("stacks the screenshot below content in portrait output", () => {
    const layout = releaseLayout(
      "portrait",
      "stacked",
      LOGICAL_VIEWPORTS.portrait,
      "product-shot"
    )

    expect(layout.centerX).toBe(layout.backgroundCenterX)
    expect(layout.productShotArea?.centerY).toBeGreaterThan(layout.detailY)
  })
})
