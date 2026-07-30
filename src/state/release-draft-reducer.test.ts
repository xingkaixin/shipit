import { describe, expect, it } from "vitest"

import {
  INITIAL_RELEASE_DRAFT,
  releaseDraftReducer,
} from "@/state/release-draft-reducer"

describe("releaseDraftReducer", () => {
  it("keeps the accent color when only the background changes", () => {
    const nextDraft = releaseDraftReducer(INITIAL_RELEASE_DRAFT, {
      type: "set-background",
      value: "paper-parade",
    })

    expect(nextDraft.style.backgroundId).toBe("paper-parade")
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

    expect(nextDraft.style.backgroundId).toBe("midnight-burst")
    expect(nextDraft.style.paletteId).toBe("daylight")
    expect(nextDraft.style.accentColor).toBe("#5C2CFF")
  })

  it("stores a custom title color and switches to it", () => {
    const nextDraft = releaseDraftReducer(INITIAL_RELEASE_DRAFT, {
      type: "set-custom-title-color",
      value: "#123456",
    })

    expect(nextDraft.style.titleColor).toEqual({
      useCustom: true,
      value: "#123456",
    })
  })

  it("keeps the custom title color while following the theme", () => {
    const customised = releaseDraftReducer(INITIAL_RELEASE_DRAFT, {
      type: "set-custom-title-color",
      value: "#123456",
    })
    const followingTheme = releaseDraftReducer(customised, {
      type: "use-custom-title-color",
      value: false,
    })
    const customisedAgain = releaseDraftReducer(followingTheme, {
      type: "use-custom-title-color",
      value: true,
    })

    expect(followingTheme.style.titleColor.value).toBe("#123456")
    expect(customisedAgain.style.titleColor).toEqual({
      useCustom: true,
      value: "#123456",
    })
  })

  it("reseeds the untouched title color from the new theme", () => {
    const onDaylight = releaseDraftReducer(INITIAL_RELEASE_DRAFT, {
      type: "set-palette",
      value: "daylight",
    })

    expect(onDaylight.style.titleColor).toEqual({
      useCustom: false,
      value: "#11131A",
    })
  })

  it("leaves a customised title color alone when the theme changes", () => {
    const customised = releaseDraftReducer(INITIAL_RELEASE_DRAFT, {
      type: "set-custom-title-color",
      value: "#123456",
    })
    const onDaylight = releaseDraftReducer(customised, {
      type: "set-palette",
      value: "daylight",
    })

    expect(onDaylight.style.titleColor).toEqual({
      useCustom: true,
      value: "#123456",
    })
  })

  it("clamps product shot controls to renderable bounds", () => {
    const oversized = releaseDraftReducer(INITIAL_RELEASE_DRAFT, {
      type: "set-product-shot-scale",
      value: 10,
    })

    expect(oversized.style.productShot.scale).toBe(1.2)
  })

  it("ignores non-finite product shot values", () => {
    expect(
      releaseDraftReducer(INITIAL_RELEASE_DRAFT, {
        type: "set-product-shot-scale",
        value: Number.NaN,
      })
    ).toBe(INITIAL_RELEASE_DRAFT)
  })
})
