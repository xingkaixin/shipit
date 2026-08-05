import {
  ColorsIcon,
  Film01Icon,
  ImageCompositionIcon,
  PackageIcon,
  TextFontIcon,
} from "@hugeicons/core-free-icons"
import type { HugeiconsIconProps } from "@hugeicons/react"

import type { MessageKey } from "@/i18n/messages"

type InspectorPanel = {
  id: string
  icon: HugeiconsIconProps["icon"]
}

/** The inspector shows one of these at a time; the rail order is the shortcut order. */
export const INSPECTOR_PANELS = [
  { id: "content", icon: PackageIcon },
  { id: "productShot", icon: ImageCompositionIcon },
  { id: "background", icon: Film01Icon },
  { id: "theme", icon: ColorsIcon },
  { id: "type", icon: TextFontIcon },
] as const satisfies readonly InspectorPanel[]

export type InspectorPanelId = (typeof INSPECTOR_PANELS)[number]["id"]

export function panelTitleKey(panelId: InspectorPanelId): MessageKey {
  return `inspector.${panelId}`
}

export function panelShortKey(panelId: InspectorPanelId): MessageKey {
  return `inspector.${panelId}.short`
}
