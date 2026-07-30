import { easeOutCubic, interpolate, progress } from "@/video/animation"
import { drawImageCover, roundedRectangle } from "@/video/canvas-drawing"
import { colorWithAlpha, mixHexColors } from "@/video/color"
import type { ProductShotArea } from "@/video/release-layout"
import {
  PRODUCT_SHOT_SCALE_MAX,
  PRODUCT_SHOT_SCALE_MIN,
  type ProductFrame,
  type ProductShotStyle,
  type ReleaseImage,
} from "@/video/release-video"
import type { PaletteDefinition } from "@/video/palette-registry"
import { shimmerGradient } from "@/video/shimmer"

type Rectangle = {
  x: number
  y: number
  width: number
  height: number
}

export type ProductShotGeometry = {
  outer: Rectangle
  screen: Rectangle
  cornerRadius: number
}

type DrawProductShotOptions = {
  context: CanvasRenderingContext2D
  image: ReleaseImage
  style: ProductShotStyle
  area: ProductShotArea
  palette: PaletteDefinition
  accentColor: string
  time: number
}

export function drawProductShot({
  context,
  image,
  style,
  area,
  palette,
  accentColor,
  time,
}: DrawProductShotOptions): void {
  const reveal = easeOutCubic(progress(time, 0.62, 0.86))
  const geometry = productShotGeometry(image, style.frame, area, style.scale)
  const tiltRadians = (style.tilt * Math.PI) / 180
  const shear = Math.tan(tiltRadians) * 0.34
  const horizontalScale = 1 - Math.abs(style.tilt) * 0.006

  context.save()
  context.globalAlpha = reveal
  context.translate(area.centerX, area.centerY + interpolate(54, 0, reveal))
  context.scale(interpolate(0.94, 1, reveal), interpolate(0.94, 1, reveal))
  context.transform(horizontalScale, shear, 0, 1, 0, 0)
  context.rotate(tiltRadians * 0.12)

  drawProductShadow(context, geometry, style.frame, palette)
  drawFrame(context, geometry, style.frame, palette, accentColor)
  drawScreenshot(context, image, geometry, style.frame)

  if (style.shimmer) {
    drawScreenshotShimmer(context, geometry, style.frame, time)
  }

  drawFrameDetails(context, geometry, style.frame, palette)
  context.restore()
}

export function productShotGeometry(
  image: Pick<ReleaseImage, "height" | "width">,
  frame: ProductFrame,
  area: ProductShotArea,
  scale: number
): ProductShotGeometry {
  const imageAspectRatio =
    image.width > 0 && image.height > 0
      ? clamp(image.width / image.height, 0.45, 2.4)
      : 1
  const safeScale = Number.isFinite(scale)
    ? clamp(scale, PRODUCT_SHOT_SCALE_MIN, PRODUCT_SHOT_SCALE_MAX)
    : 1
  const maximumWidth = area.maximumWidth * safeScale
  const maximumHeight = area.maximumHeight * safeScale
  const normalized = normalizedGeometry(imageAspectRatio, frame)
  const fitScale = Math.min(
    maximumWidth / normalized.outer.width,
    maximumHeight / normalized.outer.height
  )

  return {
    outer: scaleRectangle(normalized.outer, fitScale),
    screen: scaleRectangle(normalized.screen, fitScale),
    cornerRadius: normalized.cornerRadius * fitScale,
  }
}

function normalizedGeometry(
  imageAspectRatio: number,
  frame: ProductFrame
): ProductShotGeometry {
  switch (frame) {
    case "none": {
      const screen = centeredRectangle(imageAspectRatio, 1)
      return { outer: screen, screen, cornerRadius: 0.045 }
    }
    case "browser": {
      const headerHeight = 0.11
      const outer = centeredRectangle(imageAspectRatio, 1 + headerHeight)
      return {
        outer,
        screen: {
          x: outer.x,
          y: outer.y + headerHeight,
          width: imageAspectRatio,
          height: 1,
        },
        cornerRadius: 0.045,
      }
    }
    case "macbook": {
      const bezel = 0.035
      const topBezel = 0.04
      const bottomBezel = 0.065
      const baseHeight = 0.055
      const outer = centeredRectangle(
        imageAspectRatio + bezel * 2,
        1 + topBezel + bottomBezel + baseHeight
      )
      return {
        outer,
        screen: {
          x: -imageAspectRatio / 2,
          y: outer.y + topBezel,
          width: imageAspectRatio,
          height: 1,
        },
        cornerRadius: 0.035,
      }
    }
    case "iphone": {
      const outer = centeredRectangle(0.49, 1)
      return {
        outer,
        screen: {
          x: outer.x + 0.022,
          y: outer.y + 0.022,
          width: outer.width - 0.044,
          height: outer.height - 0.044,
        },
        cornerRadius: 0.085,
      }
    }
  }
}

function centeredRectangle(width: number, height: number): Rectangle {
  return { x: -width / 2, y: -height / 2, width, height }
}

function scaleRectangle(rectangle: Rectangle, scale: number): Rectangle {
  return {
    x: rectangle.x * scale,
    y: rectangle.y * scale,
    width: rectangle.width * scale,
    height: rectangle.height * scale,
  }
}

function drawProductShadow(
  context: CanvasRenderingContext2D,
  geometry: ProductShotGeometry,
  frame: ProductFrame,
  palette: PaletteDefinition
): void {
  const { outer } = geometry
  context.save()
  context.shadowColor = colorWithAlpha(palette.foreground, 0.28)
  context.shadowBlur = 54
  context.shadowOffsetY = 28
  roundedRectangle(
    context,
    outer.x,
    outer.y,
    outer.width,
    outer.height,
    geometry.cornerRadius
  )
  context.fillStyle =
    frame === "none"
      ? colorWithAlpha(palette.surface, 0.98)
      : deviceShellColor(palette)
  context.fill()
  context.restore()
}

function drawFrame(
  context: CanvasRenderingContext2D,
  geometry: ProductShotGeometry,
  frame: ProductFrame,
  palette: PaletteDefinition,
  accentColor: string
): void {
  const { outer, screen } = geometry

  roundedRectangle(
    context,
    outer.x,
    outer.y,
    outer.width,
    outer.height,
    geometry.cornerRadius
  )
  context.fillStyle =
    frame === "none"
      ? palette.surface
      : frame === "browser"
        ? mixHexColors(palette.surface, accentColor, 0.04)
        : deviceShellColor(palette)
  context.fill()

  if (frame === "browser") {
    const headerHeight = screen.y - outer.y
    const dotRadius = headerHeight * 0.09
    const dotY = outer.y + headerHeight / 2

    for (let index = 0; index < 3; index += 1) {
      context.beginPath()
      context.arc(
        outer.x + headerHeight * (0.42 + index * 0.3),
        dotY,
        dotRadius,
        0,
        Math.PI * 2
      )
      context.fillStyle = colorWithAlpha(palette.foreground, 0.26)
      context.fill()
    }

    roundedRectangle(
      context,
      outer.x + headerHeight * 1.55,
      outer.y + headerHeight * 0.27,
      outer.width - headerHeight * 1.9,
      headerHeight * 0.46,
      headerHeight * 0.23
    )
    context.fillStyle = colorWithAlpha(palette.foreground, 0.09)
    context.fill()
  }
}

function drawScreenshot(
  context: CanvasRenderingContext2D,
  image: ReleaseImage,
  geometry: ProductShotGeometry,
  frame: ProductFrame
): void {
  const { screen } = geometry
  context.save()
  roundedRectangle(
    context,
    screen.x,
    screen.y,
    screen.width,
    screen.height,
    screenCornerRadius(geometry, frame)
  )
  context.clip()
  drawImageCover(
    context,
    image,
    screen.x,
    screen.y,
    screen.width,
    screen.height
  )
  context.restore()
}

function drawScreenshotShimmer(
  context: CanvasRenderingContext2D,
  geometry: ProductShotGeometry,
  frame: ProductFrame,
  time: number
): void {
  const { screen } = geometry
  const gradient = shimmerGradient(context, screen, time, 2.05, 1.35)
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
    screenCornerRadius(geometry, frame)
  )
  context.clip()
  context.fillStyle = gradient
  context.fillRect(screen.x, screen.y, screen.width, screen.height)
  context.restore()
}

function drawFrameDetails(
  context: CanvasRenderingContext2D,
  geometry: ProductShotGeometry,
  frame: ProductFrame,
  palette: PaletteDefinition
): void {
  const { outer, screen } = geometry

  context.strokeStyle = colorWithAlpha(palette.foreground, 0.2)
  context.lineWidth = Math.max(1.5, outer.width * 0.0025)
  roundedRectangle(
    context,
    outer.x,
    outer.y,
    outer.width,
    outer.height,
    geometry.cornerRadius
  )
  context.stroke()

  if (frame === "macbook") {
    const baseTop = screen.y + screen.height + outer.height * 0.055
    const baseHeight = outer.y + outer.height - baseTop
    const baseWidth = outer.width * 1.09
    roundedRectangle(
      context,
      -baseWidth / 2,
      baseTop,
      baseWidth,
      baseHeight,
      baseHeight * 0.42
    )
    context.fillStyle = mixHexColors(
      deviceShellColor(palette),
      palette.foreground,
      0.1
    )
    context.fill()

    context.beginPath()
    context.arc(
      0,
      outer.y + (screen.y - outer.y) * 0.48,
      Math.max(1.5, outer.width * 0.0035),
      0,
      Math.PI * 2
    )
    context.fillStyle = colorWithAlpha(palette.foreground, 0.38)
    context.fill()
  }

  if (frame === "iphone") {
    const islandWidth = screen.width * 0.31
    const islandHeight = screen.height * 0.027
    roundedRectangle(
      context,
      -islandWidth / 2,
      screen.y + screen.height * 0.022,
      islandWidth,
      islandHeight,
      islandHeight / 2
    )
    context.fillStyle = colorWithAlpha("#050608", 0.92)
    context.fill()
  }
}

function screenCornerRadius(
  geometry: ProductShotGeometry,
  frame: ProductFrame
): number {
  if (frame === "browser") {
    return geometry.cornerRadius * 0.48
  }

  if (frame === "macbook") {
    return geometry.cornerRadius * 0.42
  }

  if (frame === "iphone") {
    return geometry.cornerRadius * 0.78
  }

  return geometry.cornerRadius
}

function deviceShellColor(palette: PaletteDefinition): string {
  return mixHexColors(palette.surface, "#111318", 0.7)
}

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(Math.max(value, minimum), maximum)
}
