export const TEMPLATE_IDS = [
  "midnight-burst",
  "aurora-launch",
  "paper-parade",
  "kinetic-signal",
  "studio-spotlight",
] as const

export const THEME_TONES = ["dark", "light"] as const

export type TemplateId = (typeof TEMPLATE_IDS)[number]
export type ThemeTone = (typeof THEME_TONES)[number]
export type TemplatePattern =
  | "grid"
  | "aurora"
  | "rays"
  | "stripes"
  | "spotlight"
export type TemplateLayout = "stacked" | "type-forward" | "spotlight"

export type TemplatePalette = {
  background: string
  foreground: string
  surface: string
  defaultAccent: string
  confetti: readonly string[]
}

export type TemplateDefinition = {
  id: TemplateId
  name: string
  description: string
  pattern: TemplatePattern
  layout: TemplateLayout
  seed: number
  palettes: Record<ThemeTone, TemplatePalette>
}

export const TEMPLATE_REGISTRY: readonly TemplateDefinition[] = [
  {
    id: "midnight-burst",
    name: "Midnight Burst",
    description: "高对比网格礼花",
    pattern: "grid",
    layout: "stacked",
    seed: 721,
    palettes: {
      dark: {
        background: "#070912",
        foreground: "#F7F8FF",
        surface: "#15182A",
        defaultAccent: "#B7FF5A",
        confetti: ["#B7FF5A", "#FF5ACD", "#FFCA5A", "#7E8CFF", "#FFFFFF"],
      },
      light: {
        background: "#F4F5F7",
        foreground: "#11131A",
        surface: "#FFFFFF",
        defaultAccent: "#5C2CFF",
        confetti: ["#5C2CFF", "#F238A0", "#F8A900", "#2768E8", "#11131A"],
      },
    },
  },
  {
    id: "aurora-launch",
    name: "Aurora Launch",
    description: "流动极光与光点",
    pattern: "aurora",
    layout: "stacked",
    seed: 1439,
    palettes: {
      dark: {
        background: "#061512",
        foreground: "#F2FFF9",
        surface: "#0E2922",
        defaultAccent: "#62F6B5",
        confetti: ["#62F6B5", "#B9FFF0", "#7BB8FF", "#D2FF78", "#FFFFFF"],
      },
      light: {
        background: "#EDFFF8",
        foreground: "#09241C",
        surface: "#FFFFFF",
        defaultAccent: "#00A971",
        confetti: ["#00A971", "#18B8D8", "#4B6FFF", "#96C900", "#09241C"],
      },
    },
  },
  {
    id: "paper-parade",
    name: "Paper Parade",
    description: "温暖纸张放射线",
    pattern: "rays",
    layout: "stacked",
    seed: 2861,
    palettes: {
      dark: {
        background: "#20130E",
        foreground: "#FFF8EC",
        surface: "#382019",
        defaultAccent: "#FF7048",
        confetti: ["#FF7048", "#4C8DFF", "#FFD257", "#52D394", "#FFF8EC"],
      },
      light: {
        background: "#F2EBDD",
        foreground: "#191713",
        surface: "#FFFDF8",
        defaultAccent: "#FF5E3A",
        confetti: ["#FF5E3A", "#146BFF", "#FFC933", "#22A06B", "#191713"],
      },
    },
  },
  {
    id: "kinetic-signal",
    name: "Kinetic Signal",
    description: "大胆排版与速度线",
    pattern: "stripes",
    layout: "type-forward",
    seed: 3929,
    palettes: {
      dark: {
        background: "#0B0B0A",
        foreground: "#FFFDF5",
        surface: "#20201D",
        defaultAccent: "#FFDF3D",
        confetti: ["#FFDF3D", "#FF574D", "#52A8FF", "#FBF8E9", "#7BE070"],
      },
      light: {
        background: "#FFFDF5",
        foreground: "#11110F",
        surface: "#FFFFFF",
        defaultAccent: "#F04C3C",
        confetti: ["#F04C3C", "#135BD8", "#F7C622", "#11110F", "#1FA66A"],
      },
    },
  },
  {
    id: "studio-spotlight",
    name: "Studio Spotlight",
    description: "舞台聚光与悬浮卡片",
    pattern: "spotlight",
    layout: "spotlight",
    seed: 5107,
    palettes: {
      dark: {
        background: "#100A1C",
        foreground: "#FBF7FF",
        surface: "#241637",
        defaultAccent: "#C27BFF",
        confetti: ["#C27BFF", "#FF78B7", "#7BE7FF", "#FFE17B", "#FBF7FF"],
      },
      light: {
        background: "#F8F2FF",
        foreground: "#21162F",
        surface: "#FFFFFF",
        defaultAccent: "#7B3EE4",
        confetti: ["#7B3EE4", "#E3428A", "#198DAA", "#E1A400", "#21162F"],
      },
    },
  },
]

export function templateById(templateId: TemplateId): TemplateDefinition {
  const template = TEMPLATE_REGISTRY.find(({ id }) => id === templateId)

  if (!template) {
    throw new Error(`Unknown template: ${templateId}`)
  }

  return template
}

export function paletteForTemplate(
  template: TemplateDefinition,
  tone: ThemeTone
): TemplatePalette {
  return template.palettes[tone]
}

export function isTemplateId(value: string): value is TemplateId {
  return TEMPLATE_IDS.some((templateId) => templateId === value)
}

export function isThemeTone(value: string | null): value is ThemeTone {
  return THEME_TONES.some((tone) => tone === value)
}
