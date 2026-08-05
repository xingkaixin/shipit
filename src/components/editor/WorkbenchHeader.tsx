import {
  ComputerIcon,
  Download04Icon,
  Loading03Icon,
  Moon02Icon,
  Sun03Icon,
} from "@hugeicons/core-free-icons"

import { ProjectManager } from "@/components/projects/ProjectManager"
import { Button } from "@/components/ui/button"
import { Icon } from "@/components/ui/icon"
import { SegmentedControl } from "@/components/ui/segmented-control"
import { useAppearance } from "@/hooks/use-appearance"
import type { VideoExportState } from "@/hooks/use-video-export"
import { useI18n, type AppLocale } from "@/i18n/i18n"
import type { ProjectSummary } from "@/storage/project-store"
import type { ReleaseDraft } from "@/video/release-video"
import shipitLogo from "../../../assets/shipit-logo-header.png"

type WorkbenchHeaderProps = {
  draft: ReleaseDraft
  activeProject: ProjectSummary | null
  onProjectSaved: (project: ProjectSummary) => void
  onProjectLoaded: (draft: ReleaseDraft, project: ProjectSummary) => void
  onProjectDeleted: (id: string) => void
  canExport: boolean
  exportState: VideoExportState
  onExport: () => void
}

export function WorkbenchHeader({
  draft,
  activeProject,
  onProjectSaved,
  onProjectLoaded,
  onProjectDeleted,
  canExport,
  exportState,
  onExport,
}: WorkbenchHeaderProps) {
  const { locale, setLocale, t } = useI18n()
  const { appearance, setAppearance } = useAppearance()
  const isExporting = exportState.status === "exporting"

  return (
    <header className="flex h-13 shrink-0 items-center justify-between gap-3 border-b bg-background px-3 sm:px-4">
      <div className="flex min-w-0 items-center gap-2.5">
        <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-[#fdfefb] ring-1 ring-foreground/8">
          <img
            className="size-[22px] object-contain"
            src={shipitLogo}
            alt=""
            width="22"
            height="22"
            fetchPriority="high"
          />
        </span>
        <h1
          className="font-heading text-sm leading-none font-semibold tracking-[-0.02em]"
          translate="no"
        >
          Shipit
        </h1>
        <span aria-hidden="true" className="h-4.5 w-px shrink-0 bg-border" />
        <ProjectManager
          draft={draft}
          activeProject={activeProject}
          onProjectSaved={onProjectSaved}
          onProjectLoaded={onProjectLoaded}
          onProjectDeleted={onProjectDeleted}
        />
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <SegmentedControl
          className="hidden sm:inline-flex"
          label={t("appearance.label")}
          value={appearance}
          onChange={setAppearance}
          options={[
            {
              value: "system",
              label: t("appearance.system"),
              icon: ComputerIcon,
            },
            { value: "light", label: t("appearance.light"), icon: Sun03Icon },
            { value: "dark", label: t("appearance.dark"), icon: Moon02Icon },
          ]}
        />
        <SegmentedControl<AppLocale>
          label={t("language.label")}
          value={locale}
          onChange={setLocale}
          options={[
            { value: "zh-CN", label: t("language.chinese"), text: "中" },
            { value: "en", label: t("language.english"), text: "EN" },
          ]}
        />
        <span
          aria-hidden="true"
          className="hidden h-5 w-px shrink-0 bg-border sm:block"
        />
        <Button
          type="button"
          className="shrink-0 bg-brand text-brand-foreground shadow-[0_8px_22px_-10px_color-mix(in_oklch,var(--brand),transparent_30%)] hover:bg-brand/90"
          disabled={!canExport || isExporting}
          onClick={onExport}
        >
          <Icon
            icon={isExporting ? Loading03Icon : Download04Icon}
            className={isExporting ? "animate-spin" : undefined}
            data-icon="inline-start"
          />
          <span className="hidden sm:inline">
            {isExporting ? t("preview.exporting") : t("preview.export")}
          </span>
        </Button>
      </div>
    </header>
  )
}
