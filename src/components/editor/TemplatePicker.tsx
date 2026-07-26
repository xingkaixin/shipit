import * as React from "react"
import { Tick02Icon } from "@hugeicons/core-free-icons"

import { TemplateThumbnail } from "@/components/editor/TemplateThumbnail"
import { Icon } from "@/components/ui/icon"
import { useI18n } from "@/i18n/i18n"
import type { MessageKey } from "@/i18n/messages"
import { cn } from "@/lib/utils"
import type { ReleaseComposition } from "@/video/release-video"
import { TEMPLATE_REGISTRY, type TemplateId } from "@/video/template-registry"

type TemplatePickerProps = {
  composition: ReleaseComposition
  onSelect: (templateId: TemplateId) => void
}

export function TemplatePicker({ composition, onSelect }: TemplatePickerProps) {
  const { t } = useI18n()
  // Thumbnails redraw five frames; let typing and colour dragging land first.
  const deferredComposition = React.useDeferredValue(composition)

  return (
    <div className="grid grid-cols-2 gap-2">
      {TEMPLATE_REGISTRY.map((template) => {
        const isSelected = template.id === composition.style.templateId
        const description = t(templateDescriptionKey(template.id))

        return (
          <button
            key={template.id}
            type="button"
            aria-pressed={isSelected}
            aria-label={`${template.name}. ${description}`}
            title={description}
            className={cn(
              "template-option group relative min-w-0 rounded-xl border p-1.5 text-left transition-[border-color,background-color,box-shadow,transform] duration-200 ease-[var(--ease-out)] outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/20 active:scale-[0.98]",
              isSelected
                ? "border-foreground/25 bg-foreground/[0.045] shadow-[0_3px_10px_color-mix(in_oklch,var(--foreground),transparent_93%)]"
                : "border-border bg-card hover:border-foreground/20 hover:bg-muted/50"
            )}
            onClick={() => onSelect(template.id)}
          >
            <span className="relative mb-1.5 block aspect-video overflow-hidden rounded-lg ring-1 ring-foreground/8">
              <TemplateThumbnail
                composition={deferredComposition}
                templateId={template.id}
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
              {template.name}
            </span>
          </button>
        )
      })}
    </div>
  )
}

function templateDescriptionKey(templateId: TemplateId): MessageKey {
  return `template.${templateId}`
}
