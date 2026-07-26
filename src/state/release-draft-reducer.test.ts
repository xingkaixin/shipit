import { describe, expect, it } from "vitest"

import {
  INITIAL_RELEASE_DRAFT,
  releaseDraftReducer,
} from "@/state/release-draft-reducer"

describe("releaseDraftReducer", () => {
  it("keeps the accent color when only the motion template changes", () => {
    const nextDraft = releaseDraftReducer(INITIAL_RELEASE_DRAFT, {
      type: "set-template",
      value: "paper-parade",
    })

    expect(nextDraft.style.templateId).toBe("paper-parade")
    expect(nextDraft.style.accentColor).toBe(
      INITIAL_RELEASE_DRAFT.style.accentColor
    )
  })

  it("models hidden detail without stale value state", () => {
    const nextDraft = releaseDraftReducer(INITIAL_RELEASE_DRAFT, {
      type: "set-detail-kind",
      value: "none",
    })

    expect(nextDraft.content.detail).toEqual({ kind: "none" })
  })

  it("ignores detail text updates while detail is hidden", () => {
    const hiddenDraft = releaseDraftReducer(INITIAL_RELEASE_DRAFT, {
      type: "set-detail-kind",
      value: "none",
    })

    expect(
      releaseDraftReducer(hiddenDraft, {
        type: "set-detail-value",
        value: "ignored",
      })
    ).toBe(hiddenDraft)
  })

  it("adopts the default accent when the color theme changes", () => {
    const nextDraft = releaseDraftReducer(INITIAL_RELEASE_DRAFT, {
      type: "set-palette",
      value: "daylight",
    })

    expect(nextDraft.style.templateId).toBe("midnight-burst")
    expect(nextDraft.style.paletteId).toBe("daylight")
    expect(nextDraft.style.accentColor).toBe("#5C2CFF")
  })

  it("stores custom title color as an explicit mode", () => {
    const nextDraft = releaseDraftReducer(INITIAL_RELEASE_DRAFT, {
      type: "set-custom-title-color",
      value: "#123456",
    })

    expect(nextDraft.style.titleColor).toEqual({
      mode: "custom",
      value: "#123456",
    })
  })
})
