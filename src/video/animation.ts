export function clamp(value: number, minimum = 0, maximum = 1): number {
  return Math.min(Math.max(value, minimum), maximum)
}

export function progress(
  time: number,
  startTime: number,
  duration: number
): number {
  return clamp((time - startTime) / duration)
}

export function easeOutCubic(value: number): number {
  return 1 - Math.pow(1 - clamp(value), 3)
}

export function easeInOutCubic(value: number): number {
  const clampedValue = clamp(value)

  if (clampedValue < 0.5) {
    return 4 * clampedValue * clampedValue * clampedValue
  }

  return 1 - Math.pow(-2 * clampedValue + 2, 3) / 2
}

export function easeOutBack(value: number): number {
  const overshoot = 1.70158
  const shiftedValue = clamp(value) - 1

  return (
    1 +
    (overshoot + 1) * shiftedValue * shiftedValue * shiftedValue +
    overshoot * shiftedValue * shiftedValue
  )
}

export function interpolate(from: number, to: number, amount: number): number {
  return from + (to - from) * amount
}
