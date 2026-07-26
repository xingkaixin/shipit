import type * as React from "react"
import type { HugeiconsIconProps } from "@hugeicons/react"

import { Icon } from "@/components/ui/icon"

type InspectorSectionProps = {
  icon: HugeiconsIconProps["icon"]
  title: string
  hint?: string
  children: React.ReactNode
}

export function InspectorSection({
  icon,
  title,
  hint,
  children,
}: InspectorSectionProps) {
  return (
    <section className="border-b border-border/70 px-5 py-6 last:border-b-0 sm:px-6">
      <div className="mb-4 flex items-start gap-2.5">
        <Icon
          icon={icon}
          className="mt-px size-4 shrink-0 text-muted-foreground"
        />
        <div className="min-w-0">
          <h2 className="font-heading text-[13px] leading-none font-semibold tracking-[-0.01em]">
            {title}
          </h2>
          {hint ? (
            <p className="mt-1.5 text-[11px] leading-4 text-pretty text-muted-foreground">
              {hint}
            </p>
          ) : null}
        </div>
      </div>
      {children}
    </section>
  )
}
