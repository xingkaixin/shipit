import { ColorInput } from "@/components/editor/ColorInput"
import { Label } from "@/components/ui/label"
import { useI18n } from "@/i18n/i18n"
import { cn } from "@/lib/utils"
import type { PaletteDefinition } from "@/video/palette-registry"

type AccentFieldProps = {
  palette: PaletteDefinition
  value: string
  onChange: (accentColor: string) => void
}

export function AccentField({ palette, value, onChange }: AccentFieldProps) {
  const { t } = useI18n()

  return (
    <div className="space-y-2">
      <Label htmlFor="accent-color">{t("style.color.accent")}</Label>
      <div className="flex items-center gap-1.5">
        {palette.accents.map((accent) => (
          <button
            key={accent}
            type="button"
            aria-label={accent}
            aria-pressed={accent.toLowerCase() === value.toLowerCase()}
            className={cn(
              "size-6 shrink-0 rounded-full transition-[box-shadow,transform] duration-150 ease-[var(--ease-out)] outline-none focus-visible:ring-3 focus-visible:ring-ring/30 active:scale-[0.92]",
              accent.toLowerCase() === value.toLowerCase()
                ? "shadow-[0_0_0_2px_var(--background),0_0_0_4px_var(--foreground)]"
                : "shadow-[inset_0_0_0_1px_color-mix(in_oklch,var(--foreground),transparent_88%)] hover:scale-110"
            )}
            style={{ backgroundColor: accent }}
            onClick={() => onChange(accent)}
          />
        ))}
        <span aria-hidden="true" className="mx-0.5 h-5 w-px bg-border" />
        <ColorInput
          id="accent-color"
          label={t("style.color.accent")}
          value={value}
          onChange={onChange}
        />
      </div>
    </div>
  )
}
