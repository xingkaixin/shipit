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
  paletteForTemplate,
  templateById,
  type TemplateId,
  type ThemeTone,
} from "@/video/template-registry"

const INITIAL_TEMPLATE_ID = "midnight-burst"
const INITIAL_THEME_TONE = "dark"
const INITIAL_TEMPLATE = templateById(INITIAL_TEMPLATE_ID)
const INITIAL_PALETTE = paletteForTemplate(INITIAL_TEMPLATE, INITIAL_THEME_TONE)

export const INITIAL_RELEASE_DRAFT: ReleaseDraft = {
  content: {
    productName: "Shipit",
    version: "v1.0.0",
    detail: { kind: "install", value: "pnpm add shipit" },
    logoFile: null,
  },
  style: {
    templateId: INITIAL_TEMPLATE_ID,
    themeTone: INITIAL_THEME_TONE,
    accentColor: INITIAL_PALETTE.defaultAccent,
    logoTreatment: "card-glow",
    titleFontId: "geist",
    titleColor: { mode: "template" },
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
  | { type: "set-template"; value: TemplateId }
  | { type: "set-theme-tone"; value: ThemeTone }
  | { type: "set-accent-color"; value: string }
  | { type: "set-logo-file"; value: File | null }
  | { type: "set-logo-treatment"; value: LogoTreatment }
  | { type: "set-title-font"; value: FontId }
  | { type: "use-template-title-color" }
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
    case "set-template": {
      const template = templateById(action.value)
      const palette = paletteForTemplate(template, draft.style.themeTone)
      return withStyle(draft, {
        templateId: action.value,
        accentColor: palette.defaultAccent,
      })
    }
    case "set-theme-tone": {
      const template = templateById(draft.style.templateId)
      const palette = paletteForTemplate(template, action.value)
      return withStyle(draft, {
        themeTone: action.value,
        accentColor: palette.defaultAccent,
      })
    }
    case "set-accent-color":
      return withStyle(draft, { accentColor: action.value })
    case "set-logo-file":
      return withContent(draft, { logoFile: action.value })
    case "set-logo-treatment":
      return withStyle(draft, { logoTreatment: action.value })
    case "set-title-font":
      return withStyle(draft, { titleFontId: action.value })
    case "use-template-title-color":
      return withStyle(draft, { titleColor: { mode: "template" } })
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
