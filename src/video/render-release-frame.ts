import {
  easeInOutCubic,
  easeOutBack,
  easeOutCubic,
  interpolate,
  progress,
} from "@/video/animation"
import { drawBackgroundPattern } from "@/video/background-patterns"
import { colorWithAlpha, mixHexColors } from "@/video/color"
import { translate } from "@/i18n/i18n"
import {
  drawConfetti,
  prepareConfetti,
  type ConfettiPlan,
} from "@/video/confetti"
import { fontById } from "@/video/font-registry"
import {
  LOGICAL_VIEWPORTS,
  type VideoDimensions,
} from "@/video/output-settings"
import { releaseLayout, type ReleaseLayout } from "@/video/release-layout"
import {
  detailValue,
  VIDEO_DURATION_SECONDS,
  type ReleaseComposition,
  type ReleaseImage,
} from "@/video/release-video"
import { paletteById, type PaletteDefinition } from "@/video/palette-registry"
import {
  backgroundById,
  type BackgroundDefinition,
} from "@/video/background-registry"
import { fitSingleLineText, type FittedCanvasText } from "@/video/text-layout"

const DETAIL_MAX_FONT_SIZE = 34
const DETAIL_MIN_FONT_SIZE = 23
const UI_FONT_FAMILY = '"Geist Variable", "Helvetica Neue", sans-serif'
const MONO_FONT_FAMILY = '"SFMono-Regular", Consolas, monospace'

type FrameStyle = {
  background: BackgroundDefinition
  palette: PaletteDefinition
  layout: ReleaseLayout
  viewport: VideoDimensions
}

type ReleaseFramePlan = {
  frameStyle: FrameStyle
  confetti: ConfettiPlan
  badge: string
  title: FittedCanvasText & {
    color: string
    fontFamily: string
  }
  version: {
    label: string
    width: number
  }
  detail:
    | (FittedCanvasText & {
        fontFamily: string
        fontWeight: number
        width: number
      })
    | null
}

type CachedFramePlan = {
  composition: ReleaseComposition
  fontsReady: boolean
  plan: ReleaseFramePlan
}

const FRAME_PLAN_CACHE = new WeakMap<
  CanvasRenderingContext2D,
  CachedFramePlan
>()

export function renderReleaseFrame(
  context: CanvasRenderingContext2D,
  composition: ReleaseComposition,
  time: number
): void {
  context.save()
  const plan = framePlanFor(context, composition)
  const { frameStyle } = plan
  const clampedTime = Math.min(Math.max(time, 0), VIDEO_DURATION_SECONDS)
  const widthScale = context.canvas.width / frameStyle.viewport.width
  const heightScale = context.canvas.height / frameStyle.viewport.height

  context.clearRect(0, 0, context.canvas.width, context.canvas.height)
  context.scale(widthScale, heightScale)
  drawBackground(context, composition, frameStyle, clampedTime)
  drawConfetti({
    context,
    time: clampedTime,
    plan: plan.confetti,
    accentColor: composition.style.accentColor,
    viewport: frameStyle.viewport,
    originY: frameStyle.layout.confettiOriginY,
    layer: "back",
  })
  drawReleaseContent(context, composition, plan, clampedTime)
  drawConfetti({
    context,
    time: clampedTime,
    plan: plan.confetti,
    accentColor: composition.style.accentColor,
    viewport: frameStyle.viewport,
    originY: frameStyle.layout.confettiOriginY,
    layer: "front",
  })
  context.restore()
}

function framePlanFor(
  context: CanvasRenderingContext2D,
  composition: ReleaseComposition
): ReleaseFramePlan {
  const fontsReady = areCompositionFontsReady(composition)
  const cachedPlan = FRAME_PLAN_CACHE.get(context)

  if (
    cachedPlan?.composition === composition &&
    (cachedPlan.fontsReady || !fontsReady)
  ) {
    return cachedPlan.plan
  }

  const frameStyle = frameStyleFor(composition)
  const titleText =
    composition.content.productName.trim() ||
    translate(composition.locale, "video.untitled")
  const badge = translate(composition.locale, "video.badge")
  const titleFontFamily = fontById(composition.style.titleFontId).family
  const title = fitSingleLineText(context, {
    text: titleText,
    maximumWidth: frameStyle.layout.titleMaximumWidth,
    maximumFontSize: frameStyle.layout.titleMaximumFontSize,
    minimumFontSize: frameStyle.layout.titleMinimumFontSize,
    fontWeight: 760,
    fontFamily: titleFontFamily,
  })
  const titleColor = composition.style.titleColor.useCustom
    ? composition.style.titleColor.value
    : frameStyle.palette.foreground
  const versionLabel = composition.content.version.trim() || "v1.0.0"

  context.font = `680 36px ${MONO_FONT_FAMILY}`
  const versionWidth = context.measureText(versionLabel).width + 64

  const detailText = detailValue(composition.content.detail)
  const isInstallCommand = composition.content.detail.kind === "install"
  const detailFontFamily = isInstallCommand ? MONO_FONT_FAMILY : UI_FONT_FAMILY
  const detailFontWeight = isInstallCommand ? 560 : 580
  const fittedDetail = detailText
    ? fitSingleLineText(context, {
        text: detailText,
        maximumWidth: frameStyle.layout.detailMaximumWidth,
        maximumFontSize: DETAIL_MAX_FONT_SIZE,
        minimumFontSize: DETAIL_MIN_FONT_SIZE,
        fontWeight: detailFontWeight,
        fontFamily: detailFontFamily,
      })
    : null

  if (fittedDetail) {
    context.font = `${detailFontWeight} ${fittedDetail.fontSize}px ${detailFontFamily}`
  }

  const plan: ReleaseFramePlan = {
    frameStyle,
    badge,
    confetti: prepareConfetti(
      frameStyle.background.seed,
      frameStyle.palette,
      composition.style.accentColor
    ),
    title: {
      ...title,
      color: titleColor,
      fontFamily: titleFontFamily,
    },
    version: {
      label: versionLabel,
      width: versionWidth,
    },
    detail: fittedDetail
      ? {
          ...fittedDetail,
          fontFamily: detailFontFamily,
          fontWeight: detailFontWeight,
          width: context.measureText(fittedDetail.text).width + 78,
        }
      : null,
  }

  FRAME_PLAN_CACHE.set(context, {
    composition,
    fontsReady,
    plan,
  })
  return plan
}

function areCompositionFontsReady(composition: ReleaseComposition): boolean {
  if (typeof document === "undefined") {
    return true
  }

  const title =
    composition.content.productName.trim() ||
    translate(composition.locale, "video.untitled")
  const badge = translate(composition.locale, "video.badge")
  const titleFontFamily = fontById(composition.style.titleFontId).family

  return (
    document.fonts.check(`760 16px ${titleFontFamily}`, title) &&
    document.fonts.check(`650 16px ${UI_FONT_FAMILY}`, badge)
  )
}

function frameStyleFor(composition: ReleaseComposition): FrameStyle {
  const background = backgroundById(composition.style.backgroundId)
  const palette = paletteById(composition.style.paletteId)
  const viewport = LOGICAL_VIEWPORTS[composition.output.aspectRatio]
  const layout = releaseLayout(
    composition.output.aspectRatio,
    background.layout,
    viewport
  )

  return { background, palette, viewport, layout }
}

function drawBackground(
  context: CanvasRenderingContext2D,
  composition: ReleaseComposition,
  frameStyle: FrameStyle,
  time: number
): void {
  drawBackgroundPattern({
    context,
    pattern: frameStyle.background.pattern,
    palette: frameStyle.palette,
    viewport: frameStyle.viewport,
    centerX: frameStyle.layout.centerX,
    centerY: frameStyle.layout.backgroundCenterY,
    accentColor: composition.style.accentColor,
    time,
  })
}

function drawReleaseContent(
  context: CanvasRenderingContext2D,
  composition: ReleaseComposition,
  plan: ReleaseFramePlan,
  time: number
): void {
  drawEyebrow(context, plan.frameStyle, plan.badge, time)
  drawLogo(context, composition, plan.frameStyle, time)
  drawProductName(context, plan, time)
  drawVersion(context, composition, plan, time)
  drawDetail(context, plan, time)
}

function drawEyebrow(
  context: CanvasRenderingContext2D,
  frameStyle: FrameStyle,
  label: string,
  time: number
): void {
  const reveal = easeOutCubic(progress(time, 0.5, 0.55))

  context.save()
  context.globalAlpha = reveal * 0.72
  context.fillStyle = frameStyle.palette.foreground
  context.font = `650 24px ${UI_FONT_FAMILY}`
  context.textAlign = "center"
  context.textBaseline = "middle"
  context.letterSpacing = "9px"
  context.fillText(label, frameStyle.layout.centerX, frameStyle.layout.eyebrowY)
  context.restore()
}

function drawLogo(
  context: CanvasRenderingContext2D,
  composition: ReleaseComposition,
  frameStyle: FrameStyle,
  time: number
): void {
  const reveal = easeOutBack(progress(time, 0.28, 0.72))
  const { layout, palette } = frameStyle
  const startY = layout.logoY + layout.logoSize * 0.28
  const y = interpolate(
    startY,
    layout.logoY,
    easeOutCubic(progress(time, 0.28, 0.72))
  )

  context.save()
  context.globalAlpha = Math.min(reveal, 1)
  context.translate(layout.centerX, y)
  context.scale(reveal, reveal)
  drawLogoSurface(
    context,
    composition.style.logoTreatment,
    layout.logoSize,
    palette,
    composition.style.accentColor
  )

  if (composition.content.logoImage) {
    const inset =
      composition.style.logoTreatment === "plain"
        ? layout.logoSize
        : layout.logoSize - 52
    drawImageContain(context, composition.content.logoImage, inset)
  } else {
    drawLogoFallback(
      context,
      composition.content.productName,
      composition.style.accentColor,
      layout.logoSize
    )
  }

  context.restore()
}

function drawLogoSurface(
  context: CanvasRenderingContext2D,
  treatment: ReleaseComposition["style"]["logoTreatment"],
  logoSize: number,
  palette: PaletteDefinition,
  accentColor: string
): void {
  if (treatment === "plain") {
    return
  }

  if (treatment === "card-glow") {
    context.shadowColor = colorWithAlpha(accentColor, 0.34)
    context.shadowBlur = 58
  }

  roundedRectangle(
    context,
    -logoSize / 2,
    -logoSize / 2,
    logoSize,
    logoSize,
    logoSize * 0.24
  )
  context.fillStyle = palette.surface
  context.fill()
  context.shadowBlur = 0
  context.strokeStyle = colorWithAlpha(palette.foreground, 0.13)
  context.lineWidth = 2
  context.stroke()
}

function drawImageContain(
  context: CanvasRenderingContext2D,
  image: ReleaseImage,
  maximumSize: number
): void {
  const scale = Math.min(maximumSize / image.width, maximumSize / image.height)
  const width = image.width * scale
  const height = image.height * scale
  context.drawImage(image.source, -width / 2, -height / 2, width, height)
}

function drawLogoFallback(
  context: CanvasRenderingContext2D,
  productName: string,
  accentColor: string,
  logoSize: number
): void {
  context.fillStyle = accentColor
  context.font = `760 ${logoSize * 0.39}px ${UI_FONT_FAMILY}`
  context.textAlign = "center"
  context.textBaseline = "middle"
  context.fillText(productInitials(productName), 0, logoSize * 0.02)
}

function drawProductName(
  context: CanvasRenderingContext2D,
  plan: ReleaseFramePlan,
  time: number
): void {
  const reveal = easeOutCubic(progress(time, 0.78, 0.62))
  const { layout } = plan.frameStyle

  context.save()
  context.globalAlpha = reveal
  context.translate(0, interpolate(40, 0, reveal))
  context.fillStyle = plan.title.color
  context.font = `760 ${plan.title.fontSize}px ${plan.title.fontFamily}`
  context.textAlign = "center"
  context.textBaseline = "middle"
  context.fillText(plan.title.text, layout.centerX, layout.titleY)
  context.restore()
}

function drawVersion(
  context: CanvasRenderingContext2D,
  composition: ReleaseComposition,
  plan: ReleaseFramePlan,
  time: number
): void {
  const reveal = easeOutBack(progress(time, 1.02, 0.55))
  const { layout, palette } = plan.frameStyle

  context.save()
  context.globalAlpha = Math.min(reveal, 1)
  context.font = `680 36px ${MONO_FONT_FAMILY}`
  const height = 66
  context.translate(layout.centerX, layout.versionY)
  context.scale(reveal, reveal)
  roundedRectangle(
    context,
    -plan.version.width / 2,
    -height / 2,
    plan.version.width,
    height,
    33
  )
  context.fillStyle = composition.style.accentColor
  context.fill()
  context.fillStyle = readableAccentForeground(composition.style.accentColor)
  context.textAlign = "center"
  context.textBaseline = "middle"
  context.fillText(plan.version.label, 0, 2)
  context.strokeStyle = colorWithAlpha(palette.foreground, 0.08)
  context.lineWidth = 1
  context.stroke()
  context.restore()
}

function drawDetail(
  context: CanvasRenderingContext2D,
  plan: ReleaseFramePlan,
  time: number
): void {
  if (!plan.detail) {
    return
  }

  const reveal = easeInOutCubic(progress(time, 1.42, 0.58))
  const { layout, palette } = plan.frameStyle

  context.save()
  context.globalAlpha = reveal
  context.translate(0, interpolate(28, 0, reveal))
  context.font = `${plan.detail.fontWeight} ${plan.detail.fontSize}px ${plan.detail.fontFamily}`
  const height = 76
  roundedRectangle(
    context,
    layout.centerX - plan.detail.width / 2,
    layout.detailY,
    plan.detail.width,
    height,
    22
  )
  context.fillStyle = colorWithAlpha(palette.surface, 0.92)
  context.fill()
  context.strokeStyle = colorWithAlpha(palette.foreground, 0.13)
  context.lineWidth = 2
  context.stroke()
  context.fillStyle = colorWithAlpha(palette.foreground, 0.88)
  context.textAlign = "center"
  context.textBaseline = "middle"
  context.fillText(
    plan.detail.text,
    layout.centerX,
    layout.detailY + height / 2 + 1
  )
  context.restore()
}

function productInitials(productName: string): string {
  const words = productName.trim().split(/\s+/).filter(Boolean)

  if (words.length === 0) {
    return "S"
  }

  return words
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join("")
}

function readableAccentForeground(accentColor: string): string {
  const lightMix = mixHexColors(accentColor, "#FFFFFF", 0.76)
  const darkMix = mixHexColors(accentColor, "#000000", 0.72)
  const red = Number.parseInt(accentColor.slice(1, 3), 16)
  const green = Number.parseInt(accentColor.slice(3, 5), 16)
  const blue = Number.parseInt(accentColor.slice(5, 7), 16)
  const luminance = 0.2126 * red + 0.7152 * green + 0.0722 * blue

  return luminance > 150 ? darkMix : lightMix
}

function roundedRectangle(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
): void {
  const clampedRadius = Math.min(radius, width / 2, height / 2)
  context.beginPath()
  context.roundRect(x, y, width, height, clampedRadius)
}
