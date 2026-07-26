import * as React from "react"
import { ColorPickerIcon } from "@hugeicons/core-free-icons"

import { Icon } from "@/components/ui/icon"
import { useI18n } from "@/i18n/i18n"
import { cn } from "@/lib/utils"

const HEX_COLOR_PATTERN = /^#[0-9a-f]{6}$/i

type ColorInputProps = {
  id: string
  label: string
  value: string
  onChange: (color: string) => void
  className?: string
}

/** A native colour picker paired with an editable hex field, so a brand
 * colour can be pasted in rather than hunted for on a wheel. */
export function ColorInput({
  id,
  label,
  value,
  onChange,
  className,
}: ColorInputProps) {
  const { t } = useI18n()

  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      <label
        htmlFor={id}
        title={label}
        className="relative flex size-7 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-full shadow-[inset_0_0_0_1px_color-mix(in_oklch,var(--foreground),transparent_82%)] transition-transform duration-150 ease-[var(--ease-out)] focus-within:ring-3 focus-within:ring-ring/30 hover:scale-105 active:scale-[0.94]"
        style={{ backgroundColor: value }}
      >
        <span className="sr-only">{label}</span>
        <Icon
          icon={ColorPickerIcon}
          className="size-3.5 text-white mix-blend-difference"
        />
        <input
          id={id}
          name={id}
          type="color"
          className="absolute inset-0 size-full cursor-pointer opacity-0"
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
      </label>
      <HexInput
        value={value}
        onChange={onChange}
        label={t("style.color.hex")}
      />
    </div>
  )
}

/** Accepts partial typing and only reports a value once it parses as a hex colour. */
function HexInput({
  value,
  onChange,
  label,
}: {
  value: string
  onChange: (color: string) => void
  label: string
}) {
  const [draft, setDraft] = React.useState(value)
  const [lastCommitted, setLastCommitted] = React.useState(value)

  if (value !== lastCommitted) {
    setLastCommitted(value)
    setDraft(value)
  }

  return (
    <input
      type="text"
      aria-label={label}
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
