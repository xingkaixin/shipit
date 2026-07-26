export const PALETTE_IDS = [
  "midnight",
  "graphite",
  "cobalt",
  "aurora",
  "forest",
  "ember",
  "signal",
  "violet",
  "daylight",
  "porcelain",
  "azure",
  "mint",
  "paper",
  "bone",
  "blush",
  "lilac",
] as const

export const THEME_TONES = ["dark", "light"] as const

export type PaletteId = (typeof PALETTE_IDS)[number]
export type ThemeTone = (typeof THEME_TONES)[number]

export type PaletteDefinition = {
  id: PaletteId
  tone: ThemeTone
  background: string
  foreground: string
  surface: string
  /** Harmonised swatches. The first entry is the palette's default accent. */
  accents: readonly [string, ...string[]]
}

export const PALETTE_REGISTRY: readonly PaletteDefinition[] = [
  {
    id: "midnight",
    tone: "dark",
    background: "#070912",
    foreground: "#F7F8FF",
    surface: "#15182A",
    accents: ["#B7FF5A", "#FF5ACD", "#FFCA5A", "#7E8CFF", "#FFFFFF"],
  },
  {
    id: "graphite",
    tone: "dark",
    background: "#0C0D0F",
    foreground: "#F4F5F6",
    surface: "#1A1C20",
    accents: ["#F5F6F7", "#FF4B2B", "#8E96A3", "#4DD0E1", "#D8DEE6"],
  },
  {
    id: "cobalt",
    tone: "dark",
    background: "#050B1E",
    foreground: "#EAF1FF",
    surface: "#101B3A",
    accents: ["#4C8DFF", "#9EC1FF", "#FFB020", "#38E5C4", "#EAF1FF"],
  },
  {
    id: "aurora",
    tone: "dark",
    background: "#061512",
    foreground: "#F2FFF9",
    surface: "#0E2922",
    accents: ["#62F6B5", "#B9FFF0", "#7BB8FF", "#D2FF78", "#FFFFFF"],
  },
  {
    id: "forest",
    tone: "dark",
    background: "#08140E",
    foreground: "#EEF7F0",
    surface: "#12281B",
    accents: ["#E8B33A", "#7ED694", "#F2F7F0", "#4FA9E8", "#D96B3A"],
  },
  {
    id: "ember",
    tone: "dark",
    background: "#20130E",
    foreground: "#FFF8EC",
    surface: "#382019",
    accents: ["#FF7048", "#4C8DFF", "#FFD257", "#52D394", "#FFF8EC"],
  },
  {
    id: "signal",
    tone: "dark",
    background: "#0B0B0A",
    foreground: "#FFFDF5",
    surface: "#20201D",
    accents: ["#FFDF3D", "#FF574D", "#52A8FF", "#FBF8E9", "#7BE070"],
  },
  {
    id: "violet",
    tone: "dark",
    background: "#100A1C",
    foreground: "#FBF7FF",
    surface: "#241637",
    accents: ["#C27BFF", "#FF78B7", "#7BE7FF", "#FFE17B", "#FBF7FF"],
  },
  {
    id: "daylight",
    tone: "light",
    background: "#F4F5F7",
    foreground: "#11131A",
    surface: "#FFFFFF",
    accents: ["#5C2CFF", "#F238A0", "#F8A900", "#2768E8", "#11131A"],
  },
  {
    id: "porcelain",
    tone: "light",
    background: "#FAFAFA",
    foreground: "#101012",
    surface: "#FFFFFF",
    accents: ["#111113", "#E5484D", "#3A6DF0", "#7C7C82", "#0F9D58"],
  },
  {
    id: "azure",
    tone: "light",
    background: "#EEF3FF",
    foreground: "#0B1B3A",
    surface: "#FFFFFF",
    accents: ["#1D4ED8", "#0EA5B7", "#F2680C", "#5B21B6", "#0B1B3A"],
  },
  {
    id: "mint",
    tone: "light",
    background: "#EDFFF8",
    foreground: "#09241C",
    surface: "#FFFFFF",
    accents: ["#00A971", "#18B8D8", "#4B6FFF", "#96C900", "#09241C"],
  },
  {
    id: "paper",
    tone: "light",
    background: "#F2EBDD",
    foreground: "#191713",
    surface: "#FFFDF8",
    accents: ["#FF5E3A", "#146BFF", "#FFC933", "#22A06B", "#191713"],
  },
  {
    id: "bone",
    tone: "light",
    background: "#FFFDF5",
    foreground: "#11110F",
    surface: "#FFFFFF",
    accents: ["#F04C3C", "#135BD8", "#F7C622", "#11110F", "#1FA66A"],
  },
  {
    id: "blush",
    tone: "light",
    background: "#FDECEF",
    foreground: "#2A1119",
    surface: "#FFFFFF",
    accents: ["#D6336C", "#7048E8", "#0CA678", "#F08C00", "#2A1119"],
  },
  {
    id: "lilac",
    tone: "light",
    background: "#F8F2FF",
    foreground: "#21162F",
    surface: "#FFFFFF",
    accents: ["#7B3EE4", "#E3428A", "#198DAA", "#E1A400", "#21162F"],
  },
]

export function paletteById(paletteId: PaletteId): PaletteDefinition {
  const palette = PALETTE_REGISTRY.find(({ id }) => id === paletteId)

  if (!palette) {
    throw new Error(`Unknown palette: ${paletteId}`)
  }

  return palette
}

export function palettesByTone(tone: ThemeTone): readonly PaletteDefinition[] {
  return PALETTE_REGISTRY.filter((palette) => palette.tone === tone)
}

export function defaultAccentOf(palette: PaletteDefinition): string {
  return palette.accents[0]
}

export function isPaletteId(value: string | null): value is PaletteId {
  return PALETTE_IDS.some((paletteId) => paletteId === value)
}

export function isThemeTone(value: string | null): value is ThemeTone {
  return THEME_TONES.some((tone) => tone === value)
}
