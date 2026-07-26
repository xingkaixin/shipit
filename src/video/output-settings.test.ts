import { describe, expect, it } from "vitest"

import {
  outputBitrate,
  outputDimensions,
  outputFrameCount,
} from "@/video/output-settings"

describe("output settings", () => {
  it("maps landscape and portrait to distinct dimensions", () => {
    expect(outputDimensions("landscape", "1080p")).toEqual({
      width: 1920,
      height: 1080,
    })
    expect(outputDimensions("portrait", "4k")).toEqual({
      width: 2160,
      height: 3840,
    })
  })

  it("derives frame count from the selected frame rate", () => {
    expect(outputFrameCount(30)).toBe(150)
    expect(outputFrameCount(60)).toBe(300)
  })

  it("scales bitrate with pixels per second", () => {
    const fullHd30 = outputBitrate({ width: 1920, height: 1080 }, 30)
    const ultraHd60 = outputBitrate({ width: 3840, height: 2160 }, 60)

    expect(ultraHd60).toBe(fullHd30 * 8)
  })
})
