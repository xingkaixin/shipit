import type { FontId } from "@/video/font-registry"
import type { AppLocale } from "@/i18n/i18n"
import type {
  AspectRatio,
  FrameRate,
  Resolution,
} from "@/video/output-settings"
import type { PaletteId } from "@/video/palette-registry"
import type { BackgroundId } from "@/video/background-registry"

export const VIDEO_DURATION_SECONDS = 5

export type ReleaseDetail =
  | { kind: "none" }
  | { kind: "website"; value: string }
  | { kind: "install"; value: string }
  | { kind: "custom"; value: string }

export type ReleaseContentDraft = {
  productName: string
  version: string
  detail: ReleaseDetail
  logoFile: File | null
}

export const LOGO_TREATMENTS = ["plain", "card", "card-glow"] as const

export type LogoTreatment = (typeof LOGO_TREATMENTS)[number]

/**
 * Whether the title follows the color theme is independent of which custom
 * color was picked, so the picked color survives toggling between the two.
 */
export type TitleColor = {
  useCustom: boolean
  value: string
}

export type ReleaseStyle = {
  backgroundId: BackgroundId
  paletteId: PaletteId
  accentColor: string
  logoTreatment: LogoTreatment
  titleFontId: FontId
  titleColor: TitleColor
}

export type OutputSettings = {
  aspectRatio: AspectRatio
  resolution: Resolution
  frameRate: FrameRate
}

export type ReleaseDraft = {
  content: ReleaseContentDraft
  style: ReleaseStyle
  output: OutputSettings
}

export type ReleaseLogoImage = {
  source: CanvasImageSource
  width: number
  height: number
}

export type ReleaseComposition = {
  locale: AppLocale
  content: Omit<ReleaseContentDraft, "logoFile"> & {
    logoImage: ReleaseLogoImage | null
  }
  style: ReleaseStyle
  output: OutputSettings
}

export type DetailKind = ReleaseDetail["kind"]

export function isDetailKind(value: string | null): value is DetailKind {
  return (
    value === "none" ||
    value === "website" ||
    value === "install" ||
    value === "custom"
  )
}

export function isLogoTreatment(value: string | null): value is LogoTreatment {
  return LOGO_TREATMENTS.some((treatment) => treatment === value)
}

export function detailValue(detail: ReleaseDetail): string {
  return detail.kind === "none" ? "" : detail.value.trim()
}

export function detailValueForKind(kind: DetailKind): string {
  switch (kind) {
    case "none":
      return ""
    case "website":
      return "shipit.dev"
    case "install":
      return "pnpm add shipit"
    case "custom":
      return "Available now"
  }
}
