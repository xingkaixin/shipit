import { easeInOutCubic, interpolate, progress } from "@/video/animation"

type ShimmerBounds = {
  x: number
  y: number
  width: number
  height: number
}

export function shimmerGradient(
  context: CanvasRenderingContext2D,
  bounds: ShimmerBounds,
  time: number,
  start: number,
  duration: number
): CanvasGradient | null {
  if (
    !Number.isFinite(bounds.x) ||
    !Number.isFinite(bounds.y) ||
    !Number.isFinite(bounds.width) ||
    !Number.isFinite(bounds.height) ||
    bounds.width <= 0 ||
    bounds.height <= 0
  ) {
    return null
  }

  const linearProgress = progress(time, start, duration)
  if (linearProgress <= 0 || linearProgress >= 1) {
    return null
  }

  const phase = easeInOutCubic(linearProgress)
  const center = interpolate(
    bounds.x - bounds.width * 0.35,
    bounds.x + bounds.width * 1.35,
    phase
  )
  const band = Math.max(52, bounds.width * 0.16)
  const gradient = context.createLinearGradient(
    center - band,
    bounds.y + bounds.height,
    center + band,
    bounds.y
  )
  gradient.addColorStop(0, "rgba(255, 255, 255, 0)")
  gradient.addColorStop(0.42, "rgba(255, 255, 255, 0)")
  gradient.addColorStop(0.5, "rgba(255, 255, 255, 0.72)")
  gradient.addColorStop(0.58, "rgba(255, 255, 255, 0)")
  gradient.addColorStop(1, "rgba(255, 255, 255, 0)")
  return gradient
}
