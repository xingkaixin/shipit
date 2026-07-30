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
  PRODUCT_SCREENSHOT_SCALE_MAX,
  PRODUCT_SCREENSHOT_SCALE_MIN,
  PRODUCT_SHADOW_STRENGTH_MAX,
  PRODUCT_SHADOW_STRENGTH_MIN,
  PRODUCT_SHOT_SCALE_MAX,
  PRODUCT_SHOT_SCALE_MIN,
  type ProductFrame,
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
    screenshotFile: null,
  },
  style: {
    backgroundId: "midnight-burst",
    paletteId: INITIAL_PALETTE_ID,
    accentColor: defaultAccentOf(paletteById(INITIAL_PALETTE_ID)),
    logoTreatment: "card-glow",
    titleFontId: "geist",
    titleColor: {
      useCustom: false,
      value: paletteById(INITIAL_PALETTE_ID).foreground,
    },
    titleShimmer: false,
    productShot: {
      frame: "browser",
      scale: 1,
      screenshotScale: 1,
      screenColor: "#FFFFFF",
      shadowStrength: 0.65,
      browser: {
        tabTitle: "",
        url: "",
      },
      shimmer: true,
    },
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
  | { type: "set-screenshot-file"; value: File | null }
  | { type: "set-logo-treatment"; value: LogoTreatment }
  | { type: "set-title-shimmer"; value: boolean }
  | { type: "set-product-frame"; value: ProductFrame }
  | { type: "set-product-shot-scale"; value: number }
  | { type: "set-product-screenshot-scale"; value: number }
  | { type: "set-product-screen-color"; value: string }
  | { type: "set-product-shadow-strength"; value: number }
  | { type: "set-browser-tab-title"; value: string }
  | { type: "set-browser-url"; value: string }
  | { type: "set-product-shot-shimmer"; value: boolean }
  | { type: "set-title-font"; value: FontId }
  | { type: "use-custom-title-color"; value: boolean }
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
    case "set-palette": {
      const palette = paletteById(action.value)
      return withStyle(draft, {
        paletteId: action.value,
        accentColor: defaultAccentOf(palette),
        // Keep the custom seed on the theme until the title is customised.
        titleColor: draft.style.titleColor.useCustom
          ? draft.style.titleColor
          : { useCustom: false, value: palette.foreground },
      })
    }
    case "set-accent-color":
      return withStyle(draft, { accentColor: action.value })
    case "set-logo-file":
      return withContent(draft, { logoFile: action.value })
    case "set-screenshot-file":
      return withContent(draft, { screenshotFile: action.value })
    case "set-logo-treatment":
      return withStyle(draft, { logoTreatment: action.value })
    case "set-title-shimmer":
      return withStyle(draft, { titleShimmer: action.value })
    case "set-product-frame":
      return withProductShot(draft, { frame: action.value })
    case "set-product-shot-scale":
      if (!Number.isFinite(action.value)) {
        return draft
      }

      return withProductShot(draft, {
        scale: clamp(
          action.value,
          PRODUCT_SHOT_SCALE_MIN,
          PRODUCT_SHOT_SCALE_MAX
        ),
      })
    case "set-product-screenshot-scale":
      if (!Number.isFinite(action.value)) {
        return draft
      }

      return withProductShot(draft, {
        screenshotScale: clamp(
          action.value,
          PRODUCT_SCREENSHOT_SCALE_MIN,
          PRODUCT_SCREENSHOT_SCALE_MAX
        ),
      })
    case "set-product-screen-color":
      return withProductShot(draft, { screenColor: action.value })
    case "set-product-shadow-strength":
      if (!Number.isFinite(action.value)) {
        return draft
      }

      return withProductShot(draft, {
        shadowStrength: clamp(
          action.value,
          PRODUCT_SHADOW_STRENGTH_MIN,
          PRODUCT_SHADOW_STRENGTH_MAX
        ),
      })
    case "set-browser-tab-title":
      return withBrowserFrame(draft, { tabTitle: action.value })
    case "set-browser-url":
      return withBrowserFrame(draft, { url: action.value })
    case "set-product-shot-shimmer":
      return withProductShot(draft, { shimmer: action.value })
    case "set-title-font":
      return withStyle(draft, { titleFontId: action.value })
    case "use-custom-title-color":
      return withStyle(draft, {
        titleColor: { ...draft.style.titleColor, useCustom: action.value },
      })
    case "set-custom-title-color":
      return withStyle(draft, {
        titleColor: { useCustom: true, value: action.value },
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

function withProductShot(
  draft: ReleaseDraft,
  productShot: Partial<ReleaseDraft["style"]["productShot"]>
): ReleaseDraft {
  return withStyle(draft, {
    productShot: { ...draft.style.productShot, ...productShot },
  })
}

function withBrowserFrame(
  draft: ReleaseDraft,
  browser: Partial<ReleaseDraft["style"]["productShot"]["browser"]>
): ReleaseDraft {
  return withProductShot(draft, {
    browser: { ...draft.style.productShot.browser, ...browser },
  })
}

function withOutput(
  draft: ReleaseDraft,
  output: Partial<ReleaseDraft["output"]>
): ReleaseDraft {
  return { ...draft, output: { ...draft.output, ...output } }
}

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(Math.max(value, minimum), maximum)
}
