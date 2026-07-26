import type { HugeiconsIconProps } from "@hugeicons/react"

import { Icon } from "@/components/ui/icon"
import { cn } from "@/lib/utils"

export type SegmentedOption<TValue extends string> = {
  value: TValue
  /** Accessible name. Also rendered when the option has no icon. */
  label: string
  icon?: HugeiconsIconProps["icon"]
}

type SegmentedControlProps<TValue extends string> = {
  label: string
  value: TValue
  options: readonly SegmentedOption<TValue>[]
  onChange: (value: TValue) => void
  className?: string
}

export function SegmentedControl<TValue extends string>({
  label,
  value,
  options,
  onChange,
  className,
}: SegmentedControlProps<TValue>) {
  const selectedIndex = options.findIndex((option) => option.value === value)

  return (
    <fieldset
      aria-label={label}
      className={cn(
        "relative isolate inline-flex h-9 items-center rounded-full bg-muted p-0.5 ring-1 ring-foreground/6 ring-inset",
        className
      )}
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
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          aria-pressed={option.value === value}
          title={option.label}
          className={cn(
            "flex h-8 flex-1 items-center justify-center gap-1.5 rounded-full px-2.5 text-[11px] font-semibold whitespace-nowrap transition-colors duration-150 outline-none focus-visible:ring-3 focus-visible:ring-ring/30",
            option.value === value
              ? "text-foreground"
              : "text-muted-foreground hover:text-foreground"
          )}
          onClick={() => onChange(option.value)}
        >
          {option.icon ? (
            <>
              <Icon icon={option.icon} className="size-4" />
              <span className="sr-only">{option.label}</span>
            </>
          ) : (
            option.label
          )}
        </button>
      ))}
    </fieldset>
  )
}
