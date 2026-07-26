import type * as React from "react"

import { cn } from "@/lib/utils"

type OptionButtonProps = React.ComponentProps<"button"> & {
  isSelected: boolean
}

/** A selectable tile used wherever a small closed set is picked directly. */
export function OptionButton({
  isSelected,
  className,
  ...props
}: OptionButtonProps) {
  return (
    <button
      type="button"
      aria-pressed={isSelected}
      className={cn(
        "flex min-w-0 items-center justify-center gap-2 rounded-[10px] border px-3 text-sm font-semibold transition-[color,background-color,border-color,box-shadow,transform] duration-150 ease-[var(--ease-out)] outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/20 active:scale-[0.98]",
        isSelected
          ? "border-foreground bg-foreground text-background"
          : "border-border bg-card hover:border-foreground/20 hover:bg-muted",
        className
      )}
      {...props}
    />
  )
}
