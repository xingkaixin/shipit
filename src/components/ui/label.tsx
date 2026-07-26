import * as React from "react"

import { cn } from "@/lib/utils"

type LabelProps = React.ComponentProps<"label"> & {
  htmlFor: string
}

function Label({ className, htmlFor, ...props }: LabelProps) {
  return (
    <label
      data-slot="label"
      htmlFor={htmlFor}
      className={cn(
        "flex items-center gap-1.5 text-[12px] leading-none font-semibold text-foreground/85 select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}

export { Label }
