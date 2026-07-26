import { describe, expect, it } from "vitest"

import { colorWithAlpha, mixHexColors, parseHexColor } from "@/video/color"

describe("color helpers", () => {
  it("parses six-digit hex colors", () => {
    expect(parseHexColor("#B7FF5A")).toEqual({
      red: 183,
      green: 255,
      blue: 90,
    })
  })

  it("rejects malformed colors", () => {
    expect(() => parseHexColor("#fff")).toThrow("Invalid hex color")
  })

  it("mixes and adds alpha without losing channels", () => {
    expect(mixHexColors("#000000", "#FFFFFF", 0.5)).toBe("#808080")
    expect(colorWithAlpha("#FF8000", 0.4)).toBe("rgba(255, 128, 0, 0.4)")
  })
})
