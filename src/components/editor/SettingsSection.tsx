import type * as React from "react"

type SettingsSectionProps = {
  title: string
  description?: string
  children: React.ReactNode
}

export function SettingsSection({
  title,
  description,
  children,
}: SettingsSectionProps) {
  return (
    <section className="space-y-4 border-b border-border/75 pb-7 last:border-b-0 last:pb-0">
      <div>
        <h2 className="font-heading text-[13px] font-semibold tracking-[-0.01em] text-balance">
          {title}
        </h2>
        {description ? (
          <p className="mt-1 text-xs leading-5 text-pretty text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>
      {children}
    </section>
  )
}
