// @vitest-environment happy-dom

import { describe, expect, it } from "vitest"

import { INITIAL_RELEASE_DRAFT } from "@/state/release-draft-reducer"
import { restoreProjectDraft } from "@/storage/project-store"

describe("restoreProjectDraft", () => {
  it("fills fields introduced by newer versions with current defaults", () => {
    const draft = restoreProjectDraft({
      content: { productName: "Acme" },
      style: {
        backgroundId: "removed-background",
        productShot: {
          scale: 10,
          screenshotScale: 0,
          shadowStrength: -1,
        },
      },
      output: { frameRate: 120 },
    })

    expect(draft.content.productName).toBe("Acme")
    expect(draft.content.version).toBe(INITIAL_RELEASE_DRAFT.content.version)
    expect(draft.style.backgroundId).toBe(
      INITIAL_RELEASE_DRAFT.style.backgroundId
    )
    expect(draft.style.productShot.scale).toBe(1.2)
    expect(draft.style.productShot.screenshotScale).toBe(0.25)
    expect(draft.style.productShot.shadowStrength).toBe(0)
    expect(draft.output.frameRate).toBe(INITIAL_RELEASE_DRAFT.output.frameRate)
  })

  it("restores image metadata saved as a Blob", () => {
    const source = new File(["logo"], "brand.svg", {
      type: "image/svg+xml",
      lastModified: 123,
    })

    const draft = restoreProjectDraft({
      content: {
        logoFile: {
          blob: source.slice(0, source.size, source.type),
          name: source.name,
          type: source.type,
          lastModified: source.lastModified,
        },
      },
    })

    expect(draft.content.logoFile).toBeInstanceOf(File)
    expect(draft.content.logoFile?.name).toBe("brand.svg")
    expect(draft.content.logoFile?.type).toBe("image/svg+xml")
    expect(draft.content.logoFile?.lastModified).toBe(123)
  })
})
