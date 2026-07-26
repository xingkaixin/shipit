export const TEMPLATE_IDS = [
  "midnight-burst",
  "aurora-launch",
  "paper-parade",
  "kinetic-signal",
  "studio-spotlight",
] as const

export type TemplateId = (typeof TEMPLATE_IDS)[number]
export type TemplatePattern =
  | "grid"
  | "aurora"
  | "rays"
  | "stripes"
  | "spotlight"
export type TemplateLayout = "stacked" | "type-forward" | "spotlight"

export type TemplateDefinition = {
  id: TemplateId
  name: string
  pattern: TemplatePattern
  layout: TemplateLayout
  seed: number
}

export const TEMPLATE_REGISTRY: readonly TemplateDefinition[] = [
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

export function templateById(templateId: TemplateId): TemplateDefinition {
  const template = TEMPLATE_REGISTRY.find(({ id }) => id === templateId)

  if (!template) {
    throw new Error(`Unknown template: ${templateId}`)
  }

  return template
}

export function isTemplateId(value: string): value is TemplateId {
  return TEMPLATE_IDS.some((templateId) => templateId === value)
}
