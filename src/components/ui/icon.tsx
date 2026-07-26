import { HugeiconsIcon, type HugeiconsIconProps } from "@hugeicons/react"

export function Icon({ strokeWidth = 1.8, ...props }: HugeiconsIconProps) {
  return (
    <HugeiconsIcon
      aria-hidden={props["aria-label"] ? undefined : true}
      strokeWidth={strokeWidth}
      {...props}
    />
  )
}
