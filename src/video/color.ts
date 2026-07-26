export type RgbColor = {
  red: number
  green: number
  blue: number
}

export function parseHexColor(hexColor: string): RgbColor {
  const normalizedHex = hexColor.replace("#", "")

  if (!/^[0-9a-f]{6}$/i.test(normalizedHex)) {
    throw new Error(`Invalid hex color: ${hexColor}`)
  }

  return {
    red: Number.parseInt(normalizedHex.slice(0, 2), 16),
    green: Number.parseInt(normalizedHex.slice(2, 4), 16),
    blue: Number.parseInt(normalizedHex.slice(4, 6), 16),
  }
}

export function colorWithAlpha(hexColor: string, alpha: number): string {
  const { red, green, blue } = parseHexColor(hexColor)
  return `rgba(${red}, ${green}, ${blue}, ${alpha})`
}

export function mixHexColors(
  firstHexColor: string,
  secondHexColor: string,
  secondColorWeight: number
): string {
  const firstColor = parseHexColor(firstHexColor)
  const secondColor = parseHexColor(secondHexColor)
  const weight = Math.min(Math.max(secondColorWeight, 0), 1)

  return rgbToHex({
    red: mixChannel(firstColor.red, secondColor.red, weight),
    green: mixChannel(firstColor.green, secondColor.green, weight),
    blue: mixChannel(firstColor.blue, secondColor.blue, weight),
  })
}

function mixChannel(first: number, second: number, weight: number): number {
  return Math.round(first + (second - first) * weight)
}

function rgbToHex(color: RgbColor): string {
  return `#${[color.red, color.green, color.blue]
    .map((channel) => channel.toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase()}`
}
