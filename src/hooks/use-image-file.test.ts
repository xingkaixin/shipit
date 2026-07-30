import { describe, expect, it } from "vitest"

import {
  imageDimensionValidationError,
  imageFileValidationError,
  isImageStateExportable,
  MAX_IMAGE_BYTES,
} from "@/hooks/use-image-file"

describe("image file validation", () => {
  it.each([
    ["logo.png", "image/png"],
    ["logo.jpg", "image/jpeg"],
    ["logo.webp", "image/webp"],
    ["logo.svg", "image/svg+xml"],
  ])("accepts %s within the byte limit", (name, type) => {
    const file = new File(["logo"], name, { type })

    expect(imageFileValidationError(file)).toBeNull()
  })

  it("rejects unsupported and oversized files before decoding", () => {
    const unsupported = new File(["logo"], "logo.gif", {
      type: "image/gif",
    })
    const oversized = new File(
      [new Uint8Array(MAX_IMAGE_BYTES + 1)],
      "logo.png",
      { type: "image/png" }
    )

    expect(imageFileValidationError(unsupported)).toBe("type")
    expect(imageFileValidationError(oversized)).toBe("bytes")
  })

  it("rejects excessive decoded dimensions", () => {
    expect(imageDimensionValidationError(4_096, 4_096)).toBeNull()
    expect(imageDimensionValidationError(8_192, 8_192)).toBe("dimensions")
    expect(imageDimensionValidationError(9_000, 1_000)).toBe("dimensions")
  })

  it("allows an optional or decoded image but blocks failed decoding", () => {
    expect(isImageStateExportable({ status: "empty", image: null })).toBe(true)
    expect(isImageStateExportable({ status: "loading", image: null })).toBe(
      false
    )
    expect(
      isImageStateExportable({
        status: "failed",
        image: null,
        error: "decode",
      })
    ).toBe(false)
  })
})
