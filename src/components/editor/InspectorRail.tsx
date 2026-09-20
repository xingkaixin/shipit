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
      className="flex shrink-0 items-center gap-1 overflow-x-auto border-b bg-background px-2 py-1.5 wide:w-16 wide:flex-col wide:overflow-visible wide:border-r wide:border-b-0 wide:px-0 wide:py-2.5"
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
              "relative flex h-12 shrink-0 flex-col items-center justify-center gap-[3px] rounded-[11px] px-3 transition-colors duration-150 outline-none focus-visible:ring-3 focus-visible:ring-ring/30 wide:h-[50px] wide:w-12 wide:px-0",
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
            <span
              aria-hidden="true"
              className={cn(
                "absolute top-1 right-1.5 hidden font-mono text-[9px] leading-none wide:block",
                isActive ? "text-brand-strong/70" : "text-muted-foreground/50"
              )}
            >
              {index + 1}
            </span>
            {isActive ? (
              <span
                aria-hidden="true"
                className="absolute inset-x-3 -bottom-1.5 h-[3px] rounded-t-[3px] bg-brand wide:inset-x-auto wide:inset-y-3 wide:bottom-auto wide:-left-2 wide:h-auto wide:w-[3px] wide:rounded-[0_3px_3px_0]"
              />
            ) : null}
          </button>
        )
      })}
    </nav>
  )
}
