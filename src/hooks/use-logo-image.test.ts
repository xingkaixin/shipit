import { describe, expect, it } from "vitest"

import {
  isLogoStateExportable,
  logoDimensionValidationError,
  logoFileValidationError,
  MAX_LOGO_BYTES,
} from "@/hooks/use-logo-image"

describe("logo validation", () => {
  it("accepts supported images within the byte limit", () => {
    const file = new File(["logo"], "logo.png", { type: "image/png" })

    expect(logoFileValidationError(file)).toBeNull()
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

    expect(logoFileValidationError(svg)).toBe("type")
    expect(logoFileValidationError(oversized)).toBe("bytes")
  })

  it("rejects excessive decoded dimensions", () => {
    expect(logoDimensionValidationError(4_096, 4_096)).toBeNull()
    expect(logoDimensionValidationError(8_192, 8_192)).toBe("dimensions")
    expect(logoDimensionValidationError(9_000, 1_000)).toBe("dimensions")
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
        error: "decode",
      })
    ).toBe(false)
  })
})
