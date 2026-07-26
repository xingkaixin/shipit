export const BACKGROUND_IDS = [
  "clean-slate",
  "dusk-wash",
  "midnight-burst",
  "halftone-pop",
  "aurora-launch",
  "signal-rings",
  "paper-parade",
  "daybreak-beams",
  "kinetic-signal",
  "studio-spotlight",
] as const

export type BackgroundId = (typeof BACKGROUND_IDS)[number]
export type BackgroundPattern =
  | "plain"
  | "wash"
  | "grid"
  | "dots"
  | "aurora"
  | "rings"
  | "rays"
  | "beams"
  | "stripes"
  | "spotlight"
export type BackgroundLayout = "stacked" | "type-forward" | "spotlight"

export type BackgroundDefinition = {
  id: BackgroundId
  name: string
  pattern: BackgroundPattern
  /** Composition the pattern is tuned for: title scale, logo size, spacing. */
  layout: BackgroundLayout
  /** Keeps each background's confetti burst recognisably its own. */
  seed: number
}

export const BACKGROUND_REGISTRY: readonly BackgroundDefinition[] = [
  {
    id: "clean-slate",
    name: "Clean Slate",
    pattern: "plain",
    layout: "stacked",
    seed: 613,
  },
  {
    id: "dusk-wash",
    name: "Dusk Wash",
    pattern: "wash",
    layout: "stacked",
    seed: 8419,
  },
  {
    id: "midnight-burst",
    name: "Midnight Burst",
    pattern: "grid",
    layout: "stacked",
    seed: 721,
  },
  {
    id: "halftone-pop",
    name: "Halftone Pop",
    pattern: "dots",
    layout: "type-forward",
    seed: 1153,
  },
  {
    id: "aurora-launch",
    name: "Aurora Launch",
    pattern: "aurora",
    layout: "stacked",
    seed: 1439,
  },
  {
    id: "signal-rings",
    name: "Signal Rings",
    pattern: "rings",
    layout: "spotlight",
    seed: 6221,
  },
  {
    id: "paper-parade",
    name: "Paper Parade",
    pattern: "rays",
    layout: "stacked",
    seed: 2861,
  },
  {
    id: "daybreak-beams",
    name: "Daybreak Beams",
    pattern: "beams",
    layout: "type-forward",
    seed: 7333,
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
