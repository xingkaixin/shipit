import { clamp } from "@/video/animation"
import { colorWithAlpha, mixHexColors } from "@/video/color"
import type { VideoDimensions } from "@/video/output-settings"
import type {
  TemplateDefinition,
  TemplatePalette,
} from "@/video/template-registry"

const GRAVITY = 640
const BURSTS = [
  { time: 0.32, particlesPerSide: 30, strength: 0.82 },
  { time: 1.45, particlesPerSide: 52, strength: 1.05 },
  { time: 2.62, particlesPerSide: 78, strength: 1.24 },
] as const

type ConfettiLayer = "back" | "front"

type PreparedParticle = {
  launchDelay: number
  horizontalVelocity: number
  verticalVelocity: number
  wind: number
  width: number
  height: number
  initialRotation: number
  rotationSpeed: number
  color: string
  shape: number
}

type PreparedBurstSide = {
  time: number
  side: "left" | "right"
  particles: Record<ConfettiLayer, readonly PreparedParticle[]>
}

export type ConfettiPlan = readonly PreparedBurstSide[]

type ConfettiRenderOptions = {
  context: CanvasRenderingContext2D
  time: number
  plan: ConfettiPlan
  accentColor: string
  viewport: VideoDimensions
  originY: number
  layer: ConfettiLayer
}

export function prepareConfetti(
  template: TemplateDefinition,
  palette: TemplatePalette,
  accentColor: string
): ConfettiPlan {
  return BURSTS.flatMap((burst, burstIndex) =>
    (["left", "right"] as const).map((side) => {
      const sideDirection = side === "left" ? 1 : -1
      const sideSeed = side === "left" ? 17 : 53
      const particles: Record<ConfettiLayer, PreparedParticle[]> = {
        back: [],
        front: [],
      }

      for (let index = 0; index < burst.particlesPerSide; index += 1) {
        const particleSeed =
          template.seed + burstIndex * 10_000 + sideSeed * 101 + index * 31
        const speed =
          (760 + randomUnit(particleSeed + 2) * 470) * burst.strength
        const layer = index % 4 === 0 ? "front" : "back"

        particles[layer].push({
          launchDelay: randomUnit(particleSeed + 1) * 0.17,
          horizontalVelocity:
            sideDirection * speed * (0.42 + randomUnit(particleSeed + 3) * 0.4),
          verticalVelocity:
            -speed * (0.72 + randomUnit(particleSeed + 4) * 0.38),
          wind: sideDirection * (18 + randomUnit(particleSeed + 5) * 42),
          width: 10 + randomUnit(particleSeed + 6) * 14,
          height: 6 + randomUnit(particleSeed + 7) * 19,
          initialRotation: randomUnit(particleSeed + 8) * Math.PI,
          rotationSpeed: 3 + randomUnit(particleSeed + 9) * 8,
          color: particleColor(
            palette,
            accentColor,
            Math.floor(randomUnit(particleSeed + 10) * 7)
          ),
          shape: Math.floor(randomUnit(particleSeed + 11) * 3),
        })
      }

      return {
        time: burst.time,
        side,
        particles,
      }
    })
  )
}

export function drawConfetti(options: ConfettiRenderOptions): void {
  options.plan.forEach((burstSide) => {
    drawBurstSide(options, burstSide)
  })
}

export function activeBurstCount(time: number): number {
  return BURSTS.filter((burst) => burst.time <= time).length
}

function drawBurstSide(
  options: ConfettiRenderOptions,
  burstSide: PreparedBurstSide
): void {
  const { context, time, accentColor, viewport, originY, layer } = options
  const originX = burstSide.side === "left" ? -24 : viewport.width + 24

  for (const particle of burstSide.particles[layer]) {
    const age = time - burstSide.time - particle.launchDelay

    if (age < 0 || age > 4.2) {
      continue
    }

    const x =
      originX + particle.horizontalVelocity * age + particle.wind * age * age
    const y =
      originY + particle.verticalVelocity * age + 0.5 * GRAVITY * age * age

    if (x < -80 || x > viewport.width + 80 || y > viewport.height + 80) {
      continue
    }

    const fade = 1 - clamp((age - 3.25) / 0.85)
    const rotation = particle.initialRotation + age * particle.rotationSpeed

    context.save()
    context.globalAlpha = fade
    context.translate(x, y)
    context.rotate(rotation)
    context.fillStyle = particle.color
    context.strokeStyle = particle.color

    if (particle.shape === 0) {
      context.fillRect(
        -particle.width / 2,
        -particle.height / 2,
        particle.width,
        particle.height
      )
    } else if (particle.shape === 1) {
      context.beginPath()
      context.ellipse(
        0,
        0,
        particle.width / 2,
        particle.height / 2,
        0,
        0,
        Math.PI * 2
      )
      context.fill()
    } else {
      context.lineWidth = Math.max(4, particle.width * 0.35)
      context.lineCap = "round"
      context.beginPath()
      context.moveTo(-particle.width, -particle.height * 0.35)
      context.bezierCurveTo(
        -particle.width * 0.25,
        particle.height,
        particle.width * 0.3,
        -particle.height,
        particle.width,
        particle.height * 0.35
      )
      context.stroke()
    }

    context.restore()
  }

  if (layer === "back") {
    drawBurstFlash(
      context,
      time - burstSide.time,
      originX,
      originY,
      accentColor
    )
  }
}

function drawBurstFlash(
  context: CanvasRenderingContext2D,
  burstAge: number,
  x: number,
  y: number,
  accentColor: string
): void {
  if (burstAge < 0 || burstAge > 0.42) {
    return
  }

  const flashProgress = clamp(burstAge / 0.42)
  const radius = 32 + flashProgress * 118

  context.save()
  context.strokeStyle = colorWithAlpha(accentColor, (1 - flashProgress) * 0.72)
  context.lineWidth = 10 * (1 - flashProgress) + 2
  context.beginPath()
  context.arc(x, y, radius, Math.PI * 1.05, Math.PI * 1.95)
  context.stroke()
  context.restore()
}

function particleColor(
  palette: TemplatePalette,
  accentColor: string,
  index: number
): string {
  if (index === 0) {
    return accentColor
  }

  if (index === 1) {
    return mixHexColors(accentColor, "#FFFFFF", 0.45)
  }

  return palette.confetti[index % palette.confetti.length]!
}

function randomUnit(seed: number): number {
  let hashedSeed = seed | 0
  hashedSeed = Math.imul(hashedSeed ^ (hashedSeed >>> 16), 0x45d9f3b)
  hashedSeed = Math.imul(hashedSeed ^ (hashedSeed >>> 16), 0x45d9f3b)
  hashedSeed ^= hashedSeed >>> 16

  return (hashedSeed >>> 0) / 4_294_967_296
}
