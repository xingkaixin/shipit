import { easeOutCubic, interpolate, progress } from "@/video/animation"
import {
  roundedRectangle,
  setHighQualityImageSmoothing,
} from "@/video/canvas-drawing"
import { colorWithAlpha } from "@/video/color"
import {
  CHROME_FRAME_TEXT_LAYOUT,
  productFrameDefinition,
  type ProductFrameDefinition,
  type ProductFrameRectangle,
} from "@/video/product-frame-registry"
import type { ProductShotArea } from "@/video/release-layout"
import {
  PRODUCT_SCREENSHOT_SCALE_MAX,
  PRODUCT_SCREENSHOT_SCALE_MIN,
  PRODUCT_SHADOW_STRENGTH_MAX,
  PRODUCT_SHADOW_STRENGTH_MIN,
  PRODUCT_SHOT_SCALE_MAX,
  PRODUCT_SHOT_SCALE_MIN,
  type ProductFrame,
  type ProductShotStyle,
  type ReleaseImage,
} from "@/video/release-video"
import type { PaletteDefinition } from "@/video/palette-registry"
import { shimmerGradient } from "@/video/shimmer"
import { fitSingleLineText } from "@/video/text-layout"

const BROWSER_FONT_FAMILY = 'Arial, "Helvetica Neue", sans-serif'

type Rectangle = ProductFrameRectangle

export type ProductShotGeometry = {
  outer: Rectangle
  asset: Rectangle | null
  screen: Rectangle
  screenCornerRadius: number
  sourceScale: number
}

type DrawProductShotOptions = {
  context: CanvasRenderingContext2D
  image: ReleaseImage
  frameImage: ReleaseImage | null
  style: ProductShotStyle
  area: ProductShotArea
  palette: PaletteDefinition
  time: number
}

export function drawProductShot({
  context,
  image,
  frameImage,
  style,
  area,
  palette,
  time,
}: DrawProductShotOptions): void {
  const reveal = easeOutCubic(progress(time, 0.62, 0.86))
  const geometry = productShotGeometry(image, style.frame, area, style.scale)
  const definition = productFrameDefinition(style.frame)

  context.save()
  context.globalAlpha = reveal
  context.translate(area.centerX, area.centerY + interpolate(54, 0, reveal))
  context.scale(interpolate(0.94, 1, reveal), interpolate(0.94, 1, reveal))

  if (!definition) {
    drawUnframedScreenshot(context, image, geometry, style, palette, time)
    context.restore()
    return
  }

  if (frameImage) {
    drawFrameAsset(context, frameImage, geometry, style.shadowStrength, true)
  }

  drawScreenSurface(context, geometry, style.screenColor)
  const imageRectangle = drawScreenshot(
    context,
    image,
    geometry,
    screenshotScaleFor(style)
  )

  if (style.shimmer) {
    drawScreenshotShimmer(context, geometry, imageRectangle, time)
  }

  if (definition.assetLayer === "over-screen" && frameImage) {
    drawFrameAsset(context, frameImage, geometry, style.shadowStrength, false)
  }

  if (style.frame === "browser") {
    drawBrowserChromeText(context, geometry, style)
  }

  context.restore()
}

export function productShotGeometry(
  image: Pick<ReleaseImage, "height" | "width">,
  frame: ProductFrame,
  area: ProductShotArea,
  scale: number
): ProductShotGeometry {
  const safeScale = Number.isFinite(scale)
    ? clamp(scale, PRODUCT_SHOT_SCALE_MIN, PRODUCT_SHOT_SCALE_MAX)
    : 1
  const maximumWidth = area.maximumWidth * safeScale
  const maximumHeight = area.maximumHeight * safeScale
  const definition = productFrameDefinition(frame)

  if (!definition) {
    return unframedGeometry(image, maximumWidth, maximumHeight)
  }

  return framedGeometry(definition, maximumWidth, maximumHeight)
}

export function productScreenshotRectangle(
  image: Pick<ReleaseImage, "height" | "width">,
  screen: Rectangle,
  scale: number
): Rectangle {
  const safeImageWidth = image.width > 0 ? image.width : 1
  const safeImageHeight = image.height > 0 ? image.height : 1
  const safeScale = Number.isFinite(scale)
    ? clamp(scale, PRODUCT_SCREENSHOT_SCALE_MIN, PRODUCT_SCREENSHOT_SCALE_MAX)
    : 1
  const coverScale =
    Math.max(screen.width / safeImageWidth, screen.height / safeImageHeight) *
    safeScale
  const width = safeImageWidth * coverScale
  const height = safeImageHeight * coverScale

  return {
    x: screen.x + (screen.width - width) / 2,
    y: screen.y + (screen.height - height) / 2,
    width,
    height,
  }
}

function unframedGeometry(
  image: Pick<ReleaseImage, "height" | "width">,
  maximumWidth: number,
  maximumHeight: number
): ProductShotGeometry {
  const aspectRatio =
    image.width > 0 && image.height > 0
      ? clamp(image.width / image.height, 0.45, 2.4)
      : 1
  const fitScale = Math.min(maximumWidth / aspectRatio, maximumHeight)
  const screen = centeredRectangle(aspectRatio * fitScale, fitScale)

  return {
    outer: screen,
    asset: null,
    screen,
    screenCornerRadius: fitScale * 0.045,
    sourceScale: fitScale,
  }
}

function framedGeometry(
  definition: ProductFrameDefinition,
  maximumWidth: number,
  maximumHeight: number
): ProductShotGeometry {
  const sourceScale = Math.min(
    maximumWidth / definition.bounds.width,
    maximumHeight / definition.bounds.height
  )
  const outer = centeredRectangle(
    definition.bounds.width * sourceScale,
    definition.bounds.height * sourceScale
  )

  return {
    outer,
    asset: sourceRectangleToCanvas(
      {
        x: 0,
        y: 0,
        width: definition.source.width,
        height: definition.source.height,
      },
      definition.bounds,
      outer,
      sourceScale
    ),
    screen: sourceRectangleToCanvas(
      definition.screen,
      definition.bounds,
      outer,
      sourceScale
    ),
    screenCornerRadius: definition.screenCornerRadius * sourceScale,
    sourceScale,
  }
}

function sourceRectangleToCanvas(
  rectangle: Rectangle,
  bounds: Rectangle,
  outer: Rectangle,
  scale: number
): Rectangle {
  return {
    x: outer.x + (rectangle.x - bounds.x) * scale,
    y: outer.y + (rectangle.y - bounds.y) * scale,
    width: rectangle.width * scale,
    height: rectangle.height * scale,
  }
}

function centeredRectangle(width: number, height: number): Rectangle {
  return { x: -width / 2, y: -height / 2, width, height }
}

function drawUnframedScreenshot(
  context: CanvasRenderingContext2D,
  image: ReleaseImage,
  geometry: ProductShotGeometry,
  style: ProductShotStyle,
  palette: PaletteDefinition,
  time: number
): void {
  context.save()
  context.shadowColor = colorWithAlpha("#000000", 0.3)
  context.shadowBlur = 54
  context.shadowOffsetY = 28
  drawScreenSurface(context, geometry, palette.surface)
  context.restore()

  const imageRectangle = drawScreenshot(context, image, geometry, 1)

  if (style.shimmer) {
    drawScreenshotShimmer(context, geometry, imageRectangle, time)
  }

  context.strokeStyle = colorWithAlpha(palette.foreground, 0.2)
  context.lineWidth = Math.max(1.5, geometry.outer.width * 0.0025)
  roundedRectangle(
    context,
    geometry.outer.x,
    geometry.outer.y,
    geometry.outer.width,
    geometry.outer.height,
    geometry.screenCornerRadius
  )
  context.stroke()
}

function drawFrameAsset(
  context: CanvasRenderingContext2D,
  image: ReleaseImage,
  geometry: ProductShotGeometry,
  shadowStrength: number,
  withShadow: boolean
): void {
  if (!geometry.asset) {
    return
  }

  const safeShadowStrength = Number.isFinite(shadowStrength)
    ? clamp(
        shadowStrength,
        PRODUCT_SHADOW_STRENGTH_MIN,
        PRODUCT_SHADOW_STRENGTH_MAX
      )
    : 0.65

  context.save()
  if (withShadow && safeShadowStrength > 0) {
    context.shadowColor = colorWithAlpha("#000000", 0.48 * safeShadowStrength)
    context.shadowBlur = geometry.outer.width * 0.06 * safeShadowStrength
    context.shadowOffsetY = geometry.outer.height * 0.045 * safeShadowStrength
  }
  setHighQualityImageSmoothing(context)
  context.drawImage(
    image.source,
    geometry.asset.x,
    geometry.asset.y,
    geometry.asset.width,
    geometry.asset.height
  )
  context.restore()
}

function drawScreenSurface(
  context: CanvasRenderingContext2D,
  geometry: ProductShotGeometry,
  color: string
): void {
  const { screen } = geometry
  roundedRectangle(
    context,
    screen.x,
    screen.y,
    screen.width,
    screen.height,
    geometry.screenCornerRadius
  )
  context.fillStyle = color
  context.fill()
}

function drawScreenshot(
  context: CanvasRenderingContext2D,
  image: ReleaseImage,
  geometry: ProductShotGeometry,
  scale: number
): Rectangle {
  const { screen } = geometry
  const imageRectangle = productScreenshotRectangle(image, screen, scale)

  context.save()
  roundedRectangle(
    context,
    screen.x,
    screen.y,
    screen.width,
    screen.height,
    geometry.screenCornerRadius
  )
  context.clip()
  setHighQualityImageSmoothing(context)
  context.drawImage(
    image.source,
    imageRectangle.x,
    imageRectangle.y,
    imageRectangle.width,
    imageRectangle.height
  )
  context.restore()

  return imageRectangle
}

function screenshotScaleFor(style: ProductShotStyle): number {
  return style.frame === "macbook" || style.frame === "iphone"
    ? style.screenshotScale
    : 1
}

function drawBrowserChromeText(
  context: CanvasRenderingContext2D,
  geometry: ProductShotGeometry,
  style: ProductShotStyle
): void {
  if (!geometry.asset) {
    return
  }

  const tabTitle = style.browser.tabTitle.trim()
  const url = style.browser.url.trim()
  if (!tabTitle && !url) {
    return
  }

  context.save()
  context.translate(geometry.asset.x, geometry.asset.y)
  context.scale(geometry.sourceScale, geometry.sourceScale)
  context.fillStyle = "#3D4043"
  context.textAlign = "left"
  context.textBaseline = "middle"

  if (tabTitle) {
    drawBrowserText(context, tabTitle, CHROME_FRAME_TEXT_LAYOUT.tabTitle, 500)
  }

  if (url) {
    drawBrowserText(context, url, CHROME_FRAME_TEXT_LAYOUT.url, 400)
  }

  context.restore()
}

function drawBrowserText(
  context: CanvasRenderingContext2D,
  text: string,
  layout: { x: number; y: number; width: number; fontSize: number },
  fontWeight: number
): void {
  const fitted = fitSingleLineText(context, {
    text,
    maximumWidth: layout.width,
    maximumFontSize: layout.fontSize,
    minimumFontSize: layout.fontSize,
    fontWeight,
    fontFamily: BROWSER_FONT_FAMILY,
  })
  context.font = `${fontWeight} ${fitted.fontSize}px ${BROWSER_FONT_FAMILY}`
  context.fillText(fitted.text, layout.x, layout.y)
}

function drawScreenshotShimmer(
  context: CanvasRenderingContext2D,
  geometry: ProductShotGeometry,
  imageRectangle: Rectangle,
  time: number
): void {
  const { screen } = geometry
  const visibleImage = intersectRectangles(screen, imageRectangle)
  const gradient = shimmerGradient(context, visibleImage, time, 2.05, 1.35)
  if (!gradient) {
    return
  }

  context.save()
  roundedRectangle(
    context,
    screen.x,
    screen.y,
    screen.width,
    screen.height,
    geometry.screenCornerRadius
  )
  context.clip()
  context.fillStyle = gradient
  context.fillRect(
    visibleImage.x,
    visibleImage.y,
    visibleImage.width,
    visibleImage.height
  )
  context.restore()
}

function intersectRectangles(first: Rectangle, second: Rectangle): Rectangle {
  const x = Math.max(first.x, second.x)
  const y = Math.max(first.y, second.y)
  const right = Math.min(first.x + first.width, second.x + second.width)
  const bottom = Math.min(first.y + first.height, second.y + second.height)

  return {
    x,
    y,
    width: Math.max(0, right - x),
    height: Math.max(0, bottom - y),
  }
}

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(Math.max(value, minimum), maximum)
}
