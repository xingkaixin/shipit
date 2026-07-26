import type { FontId } from "@/video/font-registry"
import type {
  AspectRatio,
  FrameRate,
  Resolution,
} from "@/video/output-settings"
import {
  detailValueForKind,
  type DetailKind,
  type LogoTreatment,
  type ReleaseDraft,
} from "@/video/release-video"
import {
  defaultAccentOf,
  paletteById,
  type PaletteId,
} from "@/video/palette-registry"
import type { BackgroundId } from "@/video/background-registry"

const INITIAL_PALETTE_ID = "midnight"

export const INITIAL_RELEASE_DRAFT: ReleaseDraft = {
  content: {
    productName: "Shipit",
    version: "v1.0.0",
    detail: { kind: "install", value: "pnpm add shipit" },
    logoFile: null,
  },
  style: {
    backgroundId: "midnight-burst",
    paletteId: INITIAL_PALETTE_ID,
    accentColor: defaultAccentOf(paletteById(INITIAL_PALETTE_ID)),
    logoTreatment: "card-glow",
    titleFontId: "geist",
    titleColor: { mode: "theme" },
  },
  output: {
    aspectRatio: "landscape",
    resolution: "1080p",
    frameRate: 30,
  },
}

export type ReleaseDraftAction =
  | { type: "set-product-name"; value: string }
  | { type: "set-version"; value: string }
  | { type: "set-detail-kind"; value: DetailKind }
  | { type: "set-detail-value"; value: string }
  | { type: "set-background"; value: BackgroundId }
  | { type: "set-palette"; value: PaletteId }
  | { type: "set-accent-color"; value: string }
  | { type: "set-logo-file"; value: File | null }
  | { type: "set-logo-treatment"; value: LogoTreatment }
  | { type: "set-title-font"; value: FontId }
  | { type: "use-theme-title-color" }
  | { type: "set-custom-title-color"; value: string }
  | { type: "set-aspect-ratio"; value: AspectRatio }
  | { type: "set-resolution"; value: Resolution }
  | { type: "set-frame-rate"; value: FrameRate }

export function releaseDraftReducer(
  draft: ReleaseDraft,
  action: ReleaseDraftAction
): ReleaseDraft {
  switch (action.type) {
    case "set-product-name":
      return withContent(draft, { productName: action.value })
    case "set-version":
      return withContent(draft, { version: action.value })
    case "set-detail-kind":
      return withContent(draft, {
        detail:
          action.value === "none"
            ? { kind: "none" }
            : {
                kind: action.value,
                value: detailValueForKind(action.value),
              },
      })
    case "set-detail-value":
      if (draft.content.detail.kind === "none") {
        return draft
      }

      return withContent(draft, {
        detail: { ...draft.content.detail, value: action.value },
      })
    case "set-background":
      return withStyle(draft, { backgroundId: action.value })
    case "set-palette":
      return withStyle(draft, {
        paletteId: action.value,
        accentColor: defaultAccentOf(paletteById(action.value)),
      })
    case "set-accent-color":
      return withStyle(draft, { accentColor: action.value })
    case "set-logo-file":
      return withContent(draft, { logoFile: action.value })
    case "set-logo-treatment":
      return withStyle(draft, { logoTreatment: action.value })
    case "set-title-font":
      return withStyle(draft, { titleFontId: action.value })
    case "use-theme-title-color":
      return withStyle(draft, { titleColor: { mode: "theme" } })
    case "set-custom-title-color":
      return withStyle(draft, {
        titleColor: { mode: "custom", value: action.value },
      })
    case "set-aspect-ratio":
      return withOutput(draft, { aspectRatio: action.value })
    case "set-resolution":
      return withOutput(draft, { resolution: action.value })
    case "set-frame-rate":
      return withOutput(draft, { frameRate: action.value })
  }
}

function withContent(
  draft: ReleaseDraft,
  content: Partial<ReleaseDraft["content"]>
): ReleaseDraft {
  return { ...draft, content: { ...draft.content, ...content } }
}

function withStyle(
  draft: ReleaseDraft,
  style: Partial<ReleaseDraft["style"]>
): ReleaseDraft {
  return { ...draft, style: { ...draft.style, ...style } }
}

function withOutput(
  draft: ReleaseDraft,
  output: Partial<ReleaseDraft["output"]>
): ReleaseDraft {
  return { ...draft, output: { ...draft.output, ...output } }
}
