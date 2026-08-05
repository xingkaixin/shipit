import * as React from "react"

import { ReleaseEditor } from "@/components/editor/ReleaseEditor"
import { WorkbenchHeader } from "@/components/editor/WorkbenchHeader"
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
    void exportVideo()
  }

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
