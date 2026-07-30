import type * as React from "react"

type RangeFieldProps = {
  id: string
  label: string
  valueLabel: string
  value: number
  minimum: number
  maximum: number
  step: number
  onChange: (value: number) => void
}

export function RangeField({
  id,
  label,
  valueLabel,
  value,
  minimum,
  maximum,
  step,
  onChange,
}: RangeFieldProps) {
  const progress =
    maximum === minimum ? 0 : ((value - minimum) / (maximum - minimum)) * 100
  const style = {
    "--range-progress": `${Math.min(Math.max(progress, 0), 100)}%`,
  } as React.CSSProperties

  return (
    <div className="space-y-1.5">
      <label
        htmlFor={id}
        className="flex items-center justify-between text-[12px] font-semibold text-foreground/85"
      >
        <span>{label}</span>
        <output
          htmlFor={id}
          className="font-mono text-[11px] font-medium text-muted-foreground tabular-nums"
        >
          {valueLabel}
        </output>
      </label>
      <input
        id={id}
        type="range"
        className="settings-range h-6 w-full cursor-pointer appearance-none rounded-full focus-visible:ring-3 focus-visible:ring-ring/25 focus-visible:outline-none"
        min={minimum}
        max={maximum}
        step={step}
        value={value}
        style={style}
        onChange={(event) => {
          onChange(event.currentTarget.valueAsNumber)
        }}
      />
    </div>
  )
}
