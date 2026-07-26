import { Tick02Icon } from "@hugeicons/core-free-icons"

import { Icon } from "@/components/ui/icon"
import { useI18n } from "@/i18n/i18n"
import type { MessageKey } from "@/i18n/messages"
import { cn } from "@/lib/utils"
import type { PaletteDefinition } from "@/video/palette-registry"
import { TEMPLATE_REGISTRY, type TemplateId } from "@/video/template-registry"

type TemplatePickerProps = {
  selectedTemplateId: TemplateId
  palette: PaletteDefinition
  onSelect: (templateId: TemplateId) => void
}

export function TemplatePicker({
  selectedTemplateId,
  palette,
  onSelect,
}: TemplatePickerProps) {
  const { t } = useI18n()

  return (
    <div className="grid grid-cols-2 gap-2">
      {TEMPLATE_REGISTRY.map((template) => {
        const isSelected = template.id === selectedTemplateId

        return (
          <button
            key={template.id}
            type="button"
            aria-pressed={isSelected}
            className={cn(
              "template-option group relative min-w-0 rounded-xl border p-1.5 text-left transition-[border-color,background-color,box-shadow,transform] duration-200 ease-[var(--ease-out)] outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/20 active:scale-[0.98]",
              isSelected
                ? "border-foreground/25 bg-foreground/[0.045] shadow-[0_3px_10px_color-mix(in_oklch,var(--foreground),transparent_93%)]"
                : "border-border bg-card hover:border-foreground/20 hover:bg-muted/50"
            )}
            onClick={() => onSelect(template.id)}
          >
            <span
              className="relative mb-2 block aspect-[16/10] overflow-hidden rounded-lg"
              style={{ backgroundColor: palette.background }}
            >
              <span
                className="absolute top-1/2 left-1/2 size-6 -translate-x-1/2 -translate-y-1/2 rounded-md shadow-lg"
                style={{ backgroundColor: palette.surface }}
              />
              <span
                className="absolute top-2 left-2 size-1.5 rounded-full"
                style={{ backgroundColor: palette.accents[0] }}
              />
              <span
                className="absolute top-3 right-3 size-1 rotate-45"
                style={{ backgroundColor: palette.accents[1] }}
              />
              <span
                className="absolute bottom-3 left-5 h-1 w-1.5 -rotate-12"
                style={{ backgroundColor: palette.accents[2] }}
              />
              <span
                className="absolute right-6 bottom-2 size-1 rounded-full"
                style={{ backgroundColor: palette.accents[3] }}
              />
              {isSelected ? (
                <span className="absolute top-1.5 right-1.5 flex size-4 items-center justify-center rounded-full bg-brand text-brand-foreground shadow-sm">
                  <Icon icon={Tick02Icon} className="size-2.5" />
                </span>
              ) : null}
            </span>
            <span className="block truncate text-[11px] leading-4 font-medium">
              {template.name}
            </span>
            <span className="block truncate text-[10px] text-muted-foreground">
              {t(templateDescriptionKey(template.id))}
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
