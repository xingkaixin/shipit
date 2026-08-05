import { Icon } from "@/components/ui/icon"
import {
  INSPECTOR_PANELS,
  panelShortKey,
  panelTitleKey,
  type InspectorPanelId,
} from "@/components/editor/inspector-panels"
import { useI18n } from "@/i18n/i18n"
import { cn } from "@/lib/utils"

type InspectorRailProps = {
  activePanel: InspectorPanelId
  onSelect: (panelId: InspectorPanelId) => void
}

export function InspectorRail({ activePanel, onSelect }: InspectorRailProps) {
  const { t } = useI18n()

  return (
    <nav
      aria-label={t("inspector.rail")}
      className="flex shrink-0 items-center gap-1 overflow-x-auto border-b bg-background px-2 py-1.5 lg:w-16 lg:flex-col lg:overflow-visible lg:border-r lg:border-b-0 lg:px-0 lg:py-2.5"
    >
      {INSPECTOR_PANELS.map((panel, index) => {
        const isActive = panel.id === activePanel
        const title = t(panelTitleKey(panel.id))

        return (
          <button
            key={panel.id}
            type="button"
            aria-pressed={isActive}
            title={`${title} · ${index + 1}`}
            className={cn(
              "relative flex h-12 shrink-0 flex-col items-center justify-center gap-[3px] rounded-[11px] px-3 transition-colors duration-150 outline-none focus-visible:ring-3 focus-visible:ring-ring/30 lg:h-[50px] lg:w-12 lg:px-0",
              isActive
                ? "bg-brand/12 text-brand-strong"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
            onClick={() => onSelect(panel.id)}
          >
            <Icon
              icon={panel.icon}
              className="size-[19px]"
              strokeWidth={isActive ? 1.9 : 1.7}
            />
            <span
              className={cn(
                "text-[9px] leading-none tracking-[0.02em]",
                isActive ? "font-semibold" : "font-medium"
              )}
            >
              {t(panelShortKey(panel.id))}
            </span>
            {isActive ? (
              <span
                aria-hidden="true"
                className="absolute inset-x-3 -bottom-1.5 h-[3px] rounded-t-[3px] bg-brand lg:inset-x-auto lg:inset-y-3 lg:bottom-auto lg:-left-2 lg:h-auto lg:w-[3px] lg:rounded-[0_3px_3px_0]"
              />
            ) : null}
          </button>
        )
      })}
    </nav>
  )
}
