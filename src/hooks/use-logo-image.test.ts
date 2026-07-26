import { describe, expect, it } from "vitest"

import {
  isLogoStateExportable,
  logoDimensionValidationMessage,
  logoFileValidationMessage,
  MAX_LOGO_BYTES,
} from "@/hooks/use-logo-image"

describe("logo validation", () => {
  it("accepts supported images within the byte limit", () => {
    const file = new File(["logo"], "logo.png", { type: "image/png" })

    expect(logoFileValidationMessage(file)).toBeNull()
  })

  it("rejects SVG and oversized files before decoding", () => {
    const svg = new File(["<svg/>"], "logo.svg", {
      type: "image/svg+xml",
    })
    const oversized = new File(
      [new Uint8Array(MAX_LOGO_BYTES + 1)],
      "logo.png",
      { type: "image/png" }
    )

    expect(logoFileValidationMessage(svg)).toContain("PNG")
    expect(logoFileValidationMessage(oversized)).toContain("10 MB")
  })

  it("rejects excessive decoded dimensions", () => {
    expect(logoDimensionValidationMessage(4_096, 4_096)).toBeNull()
    expect(logoDimensionValidationMessage(8_192, 8_192)).toContain("1600 万")
    expect(logoDimensionValidationMessage(9_000, 1_000)).toContain("8192")
  })

  it("allows an optional or decoded Logo but blocks failed decoding", () => {
    expect(isLogoStateExportable({ status: "empty", image: null })).toBe(true)
    expect(isLogoStateExportable({ status: "loading", image: null })).toBe(
      false
    )
    expect(
      isLogoStateExportable({
        status: "failed",
        image: null,
        message: "failed",
      })
    ).toBe(false)
  })
})
