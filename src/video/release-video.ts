import type { FontId } from "@/video/font-registry"
import type { AppLocale } from "@/i18n/i18n"
import type {
  AspectRatio,
  FrameRate,
  Resolution,
} from "@/video/output-settings"
import type { PaletteId } from "@/video/palette-registry"
import type { TemplateId } from "@/video/template-registry"

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

export type LogoTreatment = "plain" | "card" | "card-glow"

export type TitleColor =
  | { mode: "template" }
  | { mode: "custom"; value: string }

export type ReleaseStyle = {
  templateId: TemplateId
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
  return value === "plain" || value === "card" || value === "card-glow"
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
