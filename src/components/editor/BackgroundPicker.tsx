import * as React from "react"
import { Tick02Icon } from "@hugeicons/core-free-icons"

import { BackgroundThumbnail } from "@/components/editor/BackgroundThumbnail"
import { Icon } from "@/components/ui/icon"
import { useI18n } from "@/i18n/i18n"
import type { MessageKey } from "@/i18n/messages"
import { cn } from "@/lib/utils"
import type { ReleaseComposition } from "@/video/release-video"
import {
  BACKGROUND_REGISTRY,
  type BackgroundId,
} from "@/video/background-registry"

type BackgroundPickerProps = {
  composition: ReleaseComposition
  onSelect: (backgroundId: BackgroundId) => void
}

export function BackgroundPicker({
  composition,
  onSelect,
}: BackgroundPickerProps) {
  const { t } = useI18n()
  // Thumbnails redraw five frames; let typing and colour dragging land first.
  const deferredComposition = React.useDeferredValue(composition)

  return (
    <div className="grid grid-cols-2 gap-2">
      {BACKGROUND_REGISTRY.map((background) => {
        const isSelected = background.id === composition.style.backgroundId
        const description = t(backgroundDescriptionKey(background.id))

        return (
          <button
            key={background.id}
            type="button"
            aria-pressed={isSelected}
            aria-label={`${background.name}. ${description}`}
            title={description}
            className={cn(
              "background-option group relative min-w-0 rounded-xl border p-1.5 text-left transition-[border-color,background-color,box-shadow,transform] duration-200 ease-[var(--ease-out)] outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/20 active:scale-[0.98]",
              isSelected
                ? "border-foreground/25 bg-foreground/[0.045] shadow-[0_3px_10px_color-mix(in_oklch,var(--foreground),transparent_93%)]"
                : "border-border bg-card hover:border-foreground/20 hover:bg-muted/50"
            )}
            onClick={() => onSelect(background.id)}
          >
            <span className="relative mb-1.5 block aspect-video overflow-hidden rounded-lg ring-1 ring-foreground/8">
              <BackgroundThumbnail
                composition={deferredComposition}
                backgroundId={background.id}
              />
              {isSelected ? (
                <span className="absolute top-1.5 right-1.5 flex size-4 items-center justify-center rounded-full bg-brand text-brand-foreground shadow-sm">
                  <Icon
                    icon={Tick02Icon}
                    className="size-2.5"
                    strokeWidth={3}
                  />
                </span>
              ) : null}
            </span>
            <span
              className="block truncate px-0.5 text-[11px] leading-4 font-medium"
              translate="no"
            >
              {background.name}
            </span>
          </button>
        )
      })}
    </div>
  )
}

function backgroundDescriptionKey(backgroundId: BackgroundId): MessageKey {
  return `background.${backgroundId}`
}
