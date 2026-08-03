import * as React from "react"

import {
  deleteProject,
  getProject,
  listProjects,
  saveProject,
  type ProjectSummary,
  type SaveProjectInput,
} from "@/storage/project-store"
import type { ReleaseDraft } from "@/video/release-video"

type ProjectStorageStatus = "loading" | "ready" | "error"

type ProjectStorageState = {
  projects: ProjectSummary[]
  status: ProjectStorageStatus
  error: Error | null
}

export function useProjectStorage() {
  const [state, setState] = React.useState<ProjectStorageState>({
    projects: [],
    status: "loading",
    error: null,
  })

  const refresh = React.useCallback(async () => {
    setState((current) => ({ ...current, status: "loading", error: null }))

    try {
      const projects = await listProjects()
      setState({ projects, status: "ready", error: null })
      return projects
    } catch (error) {
      const nextError = toError(error)
      console.error("[projects] Failed to read local projects", nextError)
      setState((current) => ({
        ...current,
        status: "error",
        error: nextError,
      }))
      throw nextError
    }
  }, [])

  React.useEffect(() => {
    void refresh().catch(() => undefined)
  }, [refresh])

  const save = React.useCallback(
    async (input: SaveProjectInput) => {
      const project = await saveProject(input)
      await refresh()
      return project
    },
    [refresh]
  )

  const load = React.useCallback(
    async (id: string): Promise<ReleaseDraft | null> => {
      return getProject(id)
    },
    []
  )

  const remove = React.useCallback(
    async (id: string) => {
      await deleteProject(id)
      await refresh()
    },
    [refresh]
  )

  return {
    ...state,
    refresh,
    save,
    load,
    remove,
  }
}

function toError(error: unknown): Error {
  return error instanceof Error ? error : new Error(String(error))
}
