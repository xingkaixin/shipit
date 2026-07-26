import * as React from "react"
import { ColorPickerIcon } from "@hugeicons/core-free-icons"

import { Icon } from "@/components/ui/icon"
import { Label } from "@/components/ui/label"
import { useI18n } from "@/i18n/i18n"
import { cn } from "@/lib/utils"
import type { PaletteDefinition } from "@/video/palette-registry"

const HEX_COLOR_PATTERN = /^#[0-9a-f]{6}$/i

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
        <label
          htmlFor="accent-color"
          title={t("style.color.custom")}
          className="flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition-[color,border-color,transform] duration-150 ease-[var(--ease-out)] focus-within:ring-3 focus-within:ring-ring/30 hover:border-foreground/25 hover:text-foreground active:scale-[0.92]"
        >
          <span className="sr-only">{t("style.color.custom")}</span>
          <Icon icon={ColorPickerIcon} className="size-3.5" />
          <input
            id="accent-color"
            name="accentColor"
            type="color"
            className="sr-only"
            value={value}
            onChange={(event) => onChange(event.target.value)}
          />
        </label>
        <HexInput value={value} onChange={onChange} />
      </div>
    </div>
  )
}

/** Accepts partial typing and only reports a value once it parses as a hex color. */
function HexInput({
  value,
  onChange,
}: {
  value: string
  onChange: (accentColor: string) => void
}) {
  const { t } = useI18n()
  const [draft, setDraft] = React.useState(value)
  const [lastCommitted, setLastCommitted] = React.useState(value)

  if (value !== lastCommitted) {
    setLastCommitted(value)
    setDraft(value)
  }

  return (
    <input
      type="text"
      name="accentColorHex"
      aria-label={t("style.color.hex")}
      spellCheck={false}
      autoComplete="off"
      maxLength={7}
      value={draft}
      className="h-7 w-[86px] min-w-0 rounded-md border border-input bg-card px-1.5 text-center font-mono text-[11px] uppercase transition-[border-color,box-shadow] duration-150 outline-none hover:border-foreground/20 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/20"
      onChange={(event) => {
        const nextDraft = event.target.value.startsWith("#")
          ? event.target.value
          : `#${event.target.value}`
        setDraft(nextDraft)

        if (HEX_COLOR_PATTERN.test(nextDraft)) {
          setLastCommitted(nextDraft)
          onChange(nextDraft)
        }
      }}
      onBlur={() => setDraft(lastCommitted)}
    />
  )
}
