import { describe, expect, it } from "vitest"

import { isOutputExportable } from "@/hooks/use-output-capability"

describe("isOutputExportable", () => {
  it("allows an export when the probe could not reach a verdict", () => {
    expect(isOutputExportable({ status: "unknown" })).toBe(true)
  })

  it("blocks only on positive evidence that encoding will fail", () => {
    expect(isOutputExportable({ status: "unsupported" })).toBe(false)
    expect(isOutputExportable({ status: "checking" })).toBe(false)
    expect(isOutputExportable({ status: "supported", storage: "file" })).toBe(
      true
    )
  })
})
