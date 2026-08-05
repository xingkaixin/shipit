import * as React from "react"

import { InspectorRail } from "@/components/editor/InspectorRail"
import { ReleaseInspector } from "@/components/editor/ReleaseInspector"
import { ReleaseStage } from "@/components/editor/ReleaseStage"
import type { InspectorPanelId } from "@/components/editor/inspector-panels"
import type { ReleaseCompositionState } from "@/hooks/use-release-composition"
import type { VideoExportState } from "@/hooks/use-video-export"
import { type ReleaseDraftAction } from "@/state/release-draft-reducer"
import type { ReleaseDraft } from "@/video/release-video"

type ReleaseEditorProps = {
  draft: ReleaseDraft
  release: ReleaseCompositionState
  exportState: VideoExportState
  onCancelExport: () => void
  dispatch: React.Dispatch<ReleaseDraftAction>
}

export function ReleaseEditor({
  draft,
  release,
  exportState,
  onCancelExport,
  dispatch,
}: ReleaseEditorProps) {
  const [activePanel, setActivePanel] =
    React.useState<InspectorPanelId>("content")

  return (
    <main
      id="release-editor"
      className="flex min-h-0 flex-1 flex-col lg:flex-row desk:overflow-hidden"
    >
      <InspectorRail activePanel={activePanel} onSelect={setActivePanel} />
      <ReleaseInspector
        activePanel={activePanel}
        draft={draft}
        composition={release.composition}
        logoState={release.logoState}
        screenshotState={release.screenshotState}
        dispatch={dispatch}
      />
      <ReleaseStage
        composition={release.composition}
        capability={release.capability}
        exportState={exportState}
        onCancelExport={onCancelExport}
        dispatch={dispatch}
      />
    </main>
  )
}
