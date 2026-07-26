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
  category: string
}

export const FONT_REGISTRY: readonly FontDefinition[] = [
  {
    id: "geist",
    name: "Geist",
    family: '"Geist Variable", sans-serif',
    category: "现代无衬线",
  },
  {
    id: "space-grotesk",
    name: "Space Grotesk",
    family: '"Space Grotesk Variable", sans-serif',
    category: "科技几何",
  },
  {
    id: "archivo",
    name: "Archivo",
    family: '"Archivo Variable", sans-serif',
    category: "紧凑醒目",
  },
  {
    id: "playfair-display",
    name: "Playfair Display",
    family: '"Playfair Display Variable", serif',
    category: "编辑衬线",
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
