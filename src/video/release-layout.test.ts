import { describe, expect, it } from "vitest"

import { LOGICAL_VIEWPORTS } from "@/video/output-settings"
import { releaseLayout } from "@/video/release-layout"

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
