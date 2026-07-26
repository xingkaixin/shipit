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
})
