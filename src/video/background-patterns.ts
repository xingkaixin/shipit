import type { BackgroundPattern } from "@/video/background-registry"
import { colorWithAlpha, mixHexColors } from "@/video/color"
import type { VideoDimensions } from "@/video/output-settings"
import type { PaletteDefinition } from "@/video/palette-registry"

export type BackgroundPatternOptions = {
  context: CanvasRenderingContext2D
  pattern: BackgroundPattern
  palette: PaletteDefinition
  viewport: VideoDimensions
  centerX: number
  centerY: number
  accentColor: string
  time: number
}

/** Fills the frame with the palette colour, then draws the chosen pattern over it. */
export function drawBackgroundPattern(options: BackgroundPatternOptions): void {
  const { context, palette, viewport } = options

  context.fillStyle = palette.background
  context.fillRect(0, 0, viewport.width, viewport.height)

  switch (options.pattern) {
    case "plain":
      return drawPlain(options)
    case "grid":
      return drawGrid(options)
    case "dots":
      return drawDots(options)
    case "aurora":
      return drawAurora(options)
    case "rays":
      return drawRays(options)
    case "stripes":
      return drawStripes(options)
    case "spotlight":
      return drawSpotlight(options)
    case "rings":
      return drawRings(options)
    case "beams":
      return drawBeams(options)
    case "wash":
      return drawWash(options)
  }
}

function drawPlain(options: BackgroundPatternOptions): void {
  const { context, viewport, centerX, centerY, accentColor } = options
  const radius = Math.max(viewport.width, viewport.height) * 0.62
  const lift = context.createRadialGradient(
    centerX,
    centerY,
    0,
    centerX,
    centerY,
    radius
  )
  lift.addColorStop(0, colorWithAlpha(accentColor, 0.12))
  lift.addColorStop(1, colorWithAlpha(accentColor, 0))
  context.fillStyle = lift
  context.fillRect(0, 0, viewport.width, viewport.height)
  drawVignette(options, 0.9)
}

function drawGrid(options: BackgroundPatternOptions): void {
  const { context, palette, viewport, centerX, centerY, accentColor, time } =
    options
  const radius = Math.max(viewport.width, viewport.height) * 0.62
  const glow = context.createRadialGradient(
    centerX,
    centerY,
    0,
    centerX,
    centerY,
    radius
  )
  glow.addColorStop(0, colorWithAlpha(accentColor, 0.22))
  glow.addColorStop(0.5, colorWithAlpha(accentColor, 0.05))
  glow.addColorStop(1, colorWithAlpha(palette.background, 0))
  context.fillStyle = glow
  context.fillRect(0, 0, viewport.width, viewport.height)

  context.save()
  context.strokeStyle = colorWithAlpha(palette.foreground, 0.11)
  context.lineWidth = 2
  const spacing = 96
  const offset = (time * 20) % spacing

  for (let x = -spacing + offset; x < viewport.width + spacing; x += spacing) {
    context.beginPath()
    context.moveTo(x, 0)
    context.lineTo(x, viewport.height)
    context.stroke()
  }

  for (let y = -spacing + offset; y < viewport.height + spacing; y += spacing) {
    context.beginPath()
    context.moveTo(0, y)
    context.lineTo(viewport.width, y)
    context.stroke()
  }

  context.restore()
  drawVignette(options, 0.7)
}

function drawDots(options: BackgroundPatternOptions): void {
  const { context, viewport, centerX, centerY, accentColor, time } = options
  const spacing = 84
  const drift = (time * 14) % spacing
  const reach = Math.hypot(viewport.width, viewport.height) / 2

  context.save()
  for (let y = -spacing + drift; y < viewport.height + spacing; y += spacing) {
    for (let x = -spacing + drift; x < viewport.width + spacing; x += spacing) {
      const closeness =
        1 - Math.min(Math.hypot(x - centerX, y - centerY) / reach, 1)
      context.fillStyle = colorWithAlpha(accentColor, 0.1 + closeness * 0.34)
      context.beginPath()
      context.arc(x, y, 2.5 + closeness * 9, 0, Math.PI * 2)
      context.fill()
    }
  }
  context.restore()
}

function drawAurora(options: BackgroundPatternOptions): void {
  const { context, palette, viewport, accentColor, time } = options
  const travel = Math.sin(time * 0.8) * viewport.width * 0.075

  drawOrb(
    context,
    viewport.width * 0.22 + travel,
    viewport.height * 0.17,
    viewport.width * 0.34,
    colorWithAlpha(accentColor, 0.34)
  )
  drawOrb(
    context,
    viewport.width * 0.78 - travel,
    viewport.height * 0.76,
    viewport.width * 0.38,
    colorWithAlpha(mixHexColors(accentColor, palette.foreground, 0.5), 0.26)
  )
  drawOrb(
    context,
    viewport.width / 2,
    viewport.height * 0.48,
    viewport.width * 0.24,
    colorWithAlpha(palette.foreground, 0.07)
  )

  context.save()
  context.globalAlpha = 0.2
  context.strokeStyle = mixHexColors(accentColor, "#FFFFFF", 0.35)
  context.lineWidth = 4

  for (let index = 0; index < 7; index += 1) {
    const y = viewport.height * 0.15 + index * viewport.height * 0.12
    context.beginPath()
    context.moveTo(-viewport.width * 0.05, y)
    context.bezierCurveTo(
      viewport.width * 0.23,
      y + Math.sin(time + index) * 90,
      viewport.width * 0.72,
      y - Math.cos(time * 0.8 + index) * 100,
      viewport.width * 1.05,
      y + 30
    )
    context.stroke()
  }

  context.restore()
}

function drawRays(options: BackgroundPatternOptions): void {
  const { context, palette, viewport, centerX, centerY, accentColor, time } =
    options
  const wedges = 24

  context.save()
  context.translate(centerX, centerY)
  context.rotate(time * 0.05)

  for (let index = 0; index < wedges; index += 1) {
    const angle = (index / wedges) * Math.PI * 2
    context.fillStyle =
      index % 2 === 0
        ? colorWithAlpha(accentColor, 0.14)
        : colorWithAlpha(palette.foreground, 0.05)
    context.beginPath()
    context.moveTo(0, 0)
    context.arc(
      0,
      0,
      Math.max(viewport.width, viewport.height) * 1.15,
      angle,
      angle + Math.PI / wedges
    )
    context.closePath()
    context.fill()
  }

  context.restore()
  drawVignette(options, 0.8)
}

function drawStripes(options: BackgroundPatternOptions): void {
  const { context, palette, viewport, accentColor, time } = options
  const stripeWidth = Math.max(90, viewport.width * 0.08)
  const offset = (time * 62) % (stripeWidth * 2)

  context.save()
  context.translate(offset - stripeWidth * 2, 0)
  context.rotate(-0.18)
  context.fillStyle = colorWithAlpha(accentColor, 0.17)

  for (
    let x = -viewport.height;
    x < viewport.width + viewport.height;
    x += stripeWidth * 2
  ) {
    context.fillRect(
      x,
      -viewport.height * 0.25,
      stripeWidth,
      viewport.height * 1.5
    )
  }

  context.restore()
  context.fillStyle = colorWithAlpha(palette.foreground, 0.14)
  context.fillRect(0, viewport.height * 0.12, viewport.width, 4)
  context.fillRect(0, viewport.height * 0.88, viewport.width, 4)
}

function drawSpotlight(options: BackgroundPatternOptions): void {
  const { context, palette, viewport, centerX, centerY, accentColor } = options
  const radius = Math.max(viewport.width, viewport.height) * 0.55
  const spotlight = context.createRadialGradient(
    centerX,
    centerY,
    0,
    centerX,
    centerY,
    radius
  )
  spotlight.addColorStop(0, colorWithAlpha(accentColor, 0.3))
  spotlight.addColorStop(0.44, colorWithAlpha(accentColor, 0.08))
  spotlight.addColorStop(1, colorWithAlpha(palette.background, 0))
  context.fillStyle = spotlight
  context.fillRect(0, 0, viewport.width, viewport.height)

  context.save()
  context.strokeStyle = colorWithAlpha(palette.foreground, 0.12)
  context.lineWidth = 3
  context.beginPath()
  context.ellipse(
    centerX,
    centerY,
    viewport.width * 0.34,
    viewport.height * 0.36,
    0,
    0,
    Math.PI * 2
  )
  context.stroke()
  context.restore()
  drawVignette(options, 1.25)
}

function drawRings(options: BackgroundPatternOptions): void {
  const { context, viewport, centerX, centerY, accentColor, time } = options
  const reach = Math.hypot(viewport.width, viewport.height) * 0.62
  const gap = 104
  const offset = (time * 30) % gap

  context.save()
  context.lineWidth = 4
  for (let radius = offset; radius < reach; radius += gap) {
    const fade = 1 - radius / reach
    context.strokeStyle = colorWithAlpha(accentColor, 0.08 + fade * 0.3)
    context.beginPath()
    context.arc(centerX, centerY, radius, 0, Math.PI * 2)
    context.stroke()
  }
  context.restore()
  drawVignette(options, 0.7)
}

function drawBeams(options: BackgroundPatternOptions): void {
  const { context, viewport, accentColor, time } = options
  const beamCount = 7

  context.save()
  context.translate(viewport.width * 0.5, 0)
  context.rotate(-0.2)

  for (let index = 0; index < beamCount; index += 1) {
    const phase = (Math.sin(time * 0.9 + index * 0.8) + 1) / 2
    const width = viewport.width * (0.045 + phase * 0.045)
    const x = (index - (beamCount - 1) / 2) * viewport.width * 0.17
    const beam = context.createLinearGradient(
      0,
      -viewport.height * 0.3,
      0,
      viewport.height * 1.1
    )
    beam.addColorStop(0, colorWithAlpha(accentColor, 0.3 + phase * 0.2))
    beam.addColorStop(1, colorWithAlpha(accentColor, 0))
    context.fillStyle = beam
    context.fillRect(
      x - width / 2,
      -viewport.height * 0.3,
      width,
      viewport.height * 1.6
    )
  }

  context.restore()
}

function drawWash(options: BackgroundPatternOptions): void {
  const { context, palette, viewport, accentColor, time } = options
  const sweep = Math.sin(time * 0.55) * viewport.width * 0.12
  const wash = context.createLinearGradient(
    sweep,
    0,
    viewport.width - sweep,
    viewport.height
  )
  wash.addColorStop(0, colorWithAlpha(accentColor, 0.42))
  wash.addColorStop(0.55, colorWithAlpha(accentColor, 0.07))
  wash.addColorStop(
    1,
    colorWithAlpha(mixHexColors(accentColor, palette.foreground, 0.65), 0.22)
  )
  context.fillStyle = wash
  context.fillRect(0, 0, viewport.width, viewport.height)
}

/**
 * Darkens the edges so the centred composition keeps its weight. Light
 * palettes need far less of it before the frame reads as dirty.
 */
function drawVignette(
  options: BackgroundPatternOptions,
  strength: number
): void {
  const { context, palette, viewport, centerX, centerY } = options
  const radius = Math.max(viewport.width, viewport.height) * 0.82
  const shade = context.createRadialGradient(
    centerX,
    centerY,
    radius * 0.35,
    centerX,
    centerY,
    radius
  )
  shade.addColorStop(0, "rgba(0, 0, 0, 0)")
  shade.addColorStop(
    1,
    colorWithAlpha("#000000", (palette.tone === "dark" ? 0.4 : 0.1) * strength)
  )
  context.fillStyle = shade
  context.fillRect(0, 0, viewport.width, viewport.height)
}

function drawOrb(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  color: string
): void {
  const gradient = context.createRadialGradient(x, y, 0, x, y, radius)
  gradient.addColorStop(0, color)
  gradient.addColorStop(1, "rgba(0, 0, 0, 0)")
  context.fillStyle = gradient
  context.fillRect(x - radius, y - radius, radius * 2, radius * 2)
}
