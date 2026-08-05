import type { HugeiconsIconProps } from "@hugeicons/react"

import { Icon } from "@/components/ui/icon"
import { cn } from "@/lib/utils"

export type SegmentedOption<TValue extends string> = {
  value: TValue
  /** Accessible name, and the visible text unless `text` or `icon` is set. */
  label: string
  text?: string
  icon?: HugeiconsIconProps["icon"]
}

type SegmentedControlProps<TValue extends string> = {
  label: string
  value: TValue
  options: readonly SegmentedOption<TValue>[]
  onChange: (value: TValue) => void
  size?: "default" | "sm"
  className?: string
}

export function SegmentedControl<TValue extends string>({
  label,
  value,
  options,
  onChange,
  size = "default",
  className,
}: SegmentedControlProps<TValue>) {
  const selectedIndex = options.findIndex((option) => option.value === value)
  const isCompact = size === "sm"

  return (
    <fieldset
      aria-label={label}
      className={cn(
        "relative isolate inline-grid items-center rounded-full bg-muted p-0.5 ring-1 ring-foreground/6 ring-inset",
        isCompact ? "h-7" : "h-9",
        className
      )}
      /* Equal columns, because the sliding indicator assumes equal widths. */
      style={{
        gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))`,
      }}
    >
      {selectedIndex >= 0 ? (
        <span
          aria-hidden="true"
          className="absolute inset-y-0.5 left-0.5 -z-10 rounded-full bg-card shadow-[0_1px_2px_color-mix(in_oklch,var(--foreground),transparent_88%)] ring-1 ring-foreground/8 transition-transform duration-200 ease-[var(--ease-out)]"
          style={{
            width: `calc((100% - 4px) / ${options.length})`,
            transform: `translateX(${selectedIndex * 100}%)`,
          }}
        />
      ) : null}
      {options.map((option) => {
        const visibleText = option.icon ? null : (option.text ?? option.label)

        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={option.value === value}
            aria-label={visibleText === option.label ? undefined : option.label}
            title={visibleText === option.label ? undefined : option.label}
            className={cn(
              "flex w-full items-center justify-center gap-1.5 rounded-full text-[11px] font-semibold whitespace-nowrap transition-colors duration-150 outline-none focus-visible:ring-3 focus-visible:ring-ring/30",
              isCompact ? "h-6 px-3.5" : "h-8 px-4",
              option.value === value
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
            onClick={() => onChange(option.value)}
          >
            {option.icon ? (
              <Icon icon={option.icon} className="size-4" />
            ) : (
              visibleText
            )}
          </button>
        )
      })}
    </fieldset>
  )
}
