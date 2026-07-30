import { describe, expect, it } from "vitest"

import {
  isLogoStateExportable,
  logoDimensionValidationError,
  logoFileValidationError,
  MAX_LOGO_BYTES,
} from "@/hooks/use-logo-image"

describe("logo validation", () => {
  it.each([
    ["logo.png", "image/png"],
    ["logo.jpg", "image/jpeg"],
    ["logo.webp", "image/webp"],
    ["logo.svg", "image/svg+xml"],
  ])("accepts %s within the byte limit", (name, type) => {
    const file = new File(["logo"], name, { type })

    expect(logoFileValidationError(file)).toBeNull()
  })

  it("rejects unsupported and oversized files before decoding", () => {
    const unsupported = new File(["logo"], "logo.gif", {
      type: "image/gif",
    })
    const oversized = new File(
      [new Uint8Array(MAX_LOGO_BYTES + 1)],
      "logo.png",
      { type: "image/png" }
    )

    expect(logoFileValidationError(unsupported)).toBe("type")
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
