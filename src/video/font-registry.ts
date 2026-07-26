export const FONT_IDS = [
  "geist",
  "space-grotesk",
  "archivo",
  "playfair-display",
] as const

export type FontId = (typeof FONT_IDS)[number]

export type FontDefinition = {
  id: FontId
  name: string
  family: string
}

export const FONT_REGISTRY: readonly FontDefinition[] = [
  {
    id: "geist",
    name: "Geist",
    family: '"Geist Variable", sans-serif',
  },
  {
    id: "space-grotesk",
    name: "Space Grotesk",
    family: '"Space Grotesk Variable", sans-serif',
  },
  {
    id: "archivo",
    name: "Archivo",
    family: '"Archivo Variable", sans-serif',
  },
  {
    id: "playfair-display",
    name: "Playfair Display",
    family: '"Playfair Display Variable", serif',
  },
]

export function fontById(fontId: FontId): FontDefinition {
  const font = FONT_REGISTRY.find(({ id }) => id === fontId)

  if (!font) {
    throw new Error(`Unknown font: ${fontId}`)
  }

  return font
}

export function isFontId(value: string | null): value is FontId {
  return FONT_IDS.some((fontId) => fontId === value)
}
