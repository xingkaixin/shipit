import * as React from "react"

import { ReleaseEditor } from "@/components/editor/ReleaseEditor"
import { WorkbenchHeader } from "@/components/editor/WorkbenchHeader"
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts"
import { useReleaseComposition } from "@/hooks/use-release-composition"
import { useVideoExport } from "@/hooks/use-video-export"
import { useI18n } from "@/i18n/i18n"
import {
  INITIAL_RELEASE_DRAFT,
  releaseDraftReducer,
} from "@/state/release-draft-reducer"
import type { ProjectSummary } from "@/storage/project-store"
import type { ReleaseDraft } from "@/video/release-video"

export function App() {
  const { t } = useI18n()
  const [draft, dispatch] = React.useReducer(
    releaseDraftReducer,
    INITIAL_RELEASE_DRAFT
  )
  const [activeProject, setActiveProject] =
    React.useState<ProjectSummary | null>(null)
  const release = useReleaseComposition(draft)
  const {
    state: exportState,
    exportVideo,
    cancelExport,
  } = useVideoExport(release.composition)

  function handleProjectLoaded(
    nextDraft: ReleaseDraft,
    project: ProjectSummary
  ) {
    dispatch({ type: "load-draft", value: nextDraft })
    setActiveProject(project)
  }

  function startExport() {
    if (release.canExport && exportState.status !== "exporting") {
      void exportVideo()
    }
  }

  useKeyboardShortcuts({ "mod+Enter": startExport })

  return (
    <div className="flex min-h-svh flex-col bg-workspace desk:h-svh desk:overflow-hidden">
      <a
        href="#release-editor"
        className="sr-only z-50 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-brand-foreground focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        {t("app.skipToEditor")}
      </a>
      <WorkbenchHeader
        draft={draft}
        activeProject={activeProject}
        onProjectSaved={setActiveProject}
        onProjectLoaded={handleProjectLoaded}
        onProjectDeleted={(projectId) => {
          setActiveProject((current) =>
            current?.id === projectId ? null : current
          )
        }}
        canExport={release.canExport}
        exportState={exportState}
        onExport={startExport}
      />
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-x-4 gap-y-1 border-b bg-background px-3 py-2 text-xs sm:px-4">
        <p className="text-muted-foreground">{t("guide.summary")}</p>
        <a
          href="#product-guide"
          className="inline-flex min-h-6 items-center font-medium underline underline-offset-4"
        >
          {t("guide.link")}
        </a>
      </div>
      <ReleaseEditor
        draft={draft}
        release={release}
        exportState={exportState}
        onCancelExport={cancelExport}
        dispatch={dispatch}
      />
    </div>
  )
}

export default App
