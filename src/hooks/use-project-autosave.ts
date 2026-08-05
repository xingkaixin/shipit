import * as React from "react"

import type { ProjectSummary, SaveProjectInput } from "@/storage/project-store"
import type { ReleaseDraft } from "@/video/release-video"

/** Long enough to batch a slider drag, short enough to feel automatic. */
const AUTOSAVE_DELAY_MS = 800

export type AutosaveStatus = "off" | "saving" | "saved" | "failed"

type ProjectAutosaveOptions = {
  project: ProjectSummary | null
  draft: ReleaseDraft
  save: (input: SaveProjectInput) => Promise<ProjectSummary>
  onSaved: (project: ProjectSummary) => void
}

/**
 * Once a draft has a project to belong to, every later edit writes itself back.
 * Until then there is nothing to write to, so saving stays a deliberate act.
 */
export function useProjectAutosave({
  project,
  draft,
  save,
  onSaved,
}: ProjectAutosaveOptions): AutosaveStatus {
  const [status, setStatus] = React.useState<AutosaveStatus>("off")
  const projectId = project?.id ?? null
  const savedReference = React.useRef({ projectId, draft })
  const saveReference = React.useRef({ save, onSaved })
  saveReference.current = { save, onSaved }

  React.useEffect(() => {
    if (!projectId) {
      savedReference.current = { projectId, draft }
      setStatus("off")
      return undefined
    }

    // Loading or saving a project makes the stored draft the new baseline.
    if (savedReference.current.projectId !== projectId) {
      savedReference.current = { projectId, draft }
      setStatus("saved")
      return undefined
    }

    if (savedReference.current.draft === draft) {
      return undefined
    }

    const name = project?.name ?? ""
    const timer = setTimeout(() => {
      setStatus("saving")
      saveReference.current
        .save({ id: projectId, name, draft })
        .then((saved) => {
          savedReference.current = { projectId, draft }
          setStatus("saved")
          saveReference.current.onSaved(saved)
        })
        .catch((error: unknown) => {
          console.error("[projects] Autosave failed", error)
          setStatus("failed")
        })
    }, AUTOSAVE_DELAY_MS)

    return () => clearTimeout(timer)
  }, [draft, project?.name, projectId])

  return status
}
