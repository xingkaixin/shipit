export const BACKGROUND_IDS = [
  "midnight-burst",
  "aurora-launch",
  "paper-parade",
  "kinetic-signal",
  "studio-spotlight",
] as const

export type BackgroundId = (typeof BACKGROUND_IDS)[number]
export type BackgroundPattern =
  | "grid"
  | "aurora"
  | "rays"
  | "stripes"
  | "spotlight"
export type BackgroundLayout = "stacked" | "type-forward" | "spotlight"

export type BackgroundDefinition = {
  id: BackgroundId
  name: string
  pattern: BackgroundPattern
  layout: BackgroundLayout
  seed: number
}

export const BACKGROUND_REGISTRY: readonly BackgroundDefinition[] = [
  {
    id: "midnight-burst",
    name: "Midnight Burst",
    pattern: "grid",
    layout: "stacked",
    seed: 721,
  },
  {
    id: "aurora-launch",
    name: "Aurora Launch",
    pattern: "aurora",
    layout: "stacked",
    seed: 1439,
  },
  {
    id: "paper-parade",
    name: "Paper Parade",
    pattern: "rays",
    layout: "stacked",
    seed: 2861,
  },
  {
    id: "kinetic-signal",
    name: "Kinetic Signal",
    pattern: "stripes",
    layout: "type-forward",
    seed: 3929,
  },
  {
    id: "studio-spotlight",
    name: "Studio Spotlight",
    pattern: "spotlight",
    layout: "spotlight",
    seed: 5107,
  },
]

export function backgroundById(
  backgroundId: BackgroundId
): BackgroundDefinition {
  const background = BACKGROUND_REGISTRY.find(({ id }) => id === backgroundId)

  if (!background) {
    throw new Error(`Unknown background: ${backgroundId}`)
  }

  return background
}

export function isBackgroundId(value: string): value is BackgroundId {
  return BACKGROUND_IDS.some((backgroundId) => backgroundId === value)
}
