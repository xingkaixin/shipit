import * as React from "react"
import {
  Cancel01Icon,
  Delete02Icon,
  FloppyDiskIcon,
  FolderOpenIcon,
  Loading03Icon,
} from "@hugeicons/core-free-icons"

import { Button } from "@/components/ui/button"
import { Icon } from "@/components/ui/icon"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  useProjectAutosave,
  type AutosaveStatus,
} from "@/hooks/use-project-autosave"
import { useProjectStorage } from "@/hooks/use-project-storage"
import { useI18n } from "@/i18n/i18n"
import { cn } from "@/lib/utils"
import type { ProjectSummary } from "@/storage/project-store"
import type { ReleaseDraft } from "@/video/release-video"

type ProjectManagerProps = {
  draft: ReleaseDraft
  activeProject: ProjectSummary | null
  onProjectSaved: (project: ProjectSummary) => void
  onProjectLoaded: (draft: ReleaseDraft, project: ProjectSummary) => void
  onProjectDeleted: (id: string) => void
}

export function ProjectManager({
  draft,
  activeProject,
  onProjectSaved,
  onProjectLoaded,
  onProjectDeleted,
}: ProjectManagerProps) {
  const { locale, t } = useI18n()
  const storage = useProjectStorage()
  const [isOpen, setIsOpen] = React.useState(false)
  const [projectName, setProjectName] = React.useState("")
  const [busyAction, setBusyAction] = React.useState<string | null>(null)
  const [error, setError] = React.useState<string | null>(null)
  const [notice, setNotice] = React.useState<string | null>(null)
  const autosaveStatus = useProjectAutosave({
    project: activeProject,
    draft,
    save: storage.save,
    onSaved: onProjectSaved,
  })

  function openManager() {
    setProjectName(activeProject?.name ?? defaultProjectName(draft))
    setError(null)
    setNotice(null)
    setIsOpen(true)
    void storage.refresh().catch(() => {
      setError(errorMessage(t))
    })
  }

  function closeManager() {
    if (busyAction) {
      return
    }

    setIsOpen(false)
  }

  React.useEffect(() => {
    if (!isOpen) {
      return undefined
    }

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeManager()
      }
    }

    window.addEventListener("keydown", closeOnEscape)
    return () => window.removeEventListener("keydown", closeOnEscape)
  })

  async function saveCurrent(asNew: boolean) {
    const name = projectName.trim()
    if (!name) {
      setError(t("projects.invalidName"))
      return
    }

    setBusyAction(asNew ? "save-new" : "save")
    setError(null)
    setNotice(null)

    try {
      const project = await storage.save({
        id: asNew ? null : (activeProject?.id ?? null),
        name,
        draft,
      })
      onProjectSaved(project)
      setProjectName(project.name)
      setNotice(t("projects.saved"))
    } catch {
      setError(errorMessage(t))
    } finally {
      setBusyAction(null)
    }
  }

  async function loadSavedProject(project: ProjectSummary) {
    setBusyAction(`load:${project.id}`)
    setError(null)
    setNotice(null)

    try {
      const savedDraft = await storage.load(project.id)
      if (!savedDraft) {
        setError(t("projects.missing"))
        return
      }

      onProjectLoaded(savedDraft, project)
      setIsOpen(false)
    } catch {
      setError(errorMessage(t))
    } finally {
      setBusyAction(null)
    }
  }

  async function deleteSavedProject(project: ProjectSummary) {
    if (!window.confirm(t("projects.confirmDelete", { name: project.name }))) {
      return
    }

    setBusyAction(`delete:${project.id}`)
    setError(null)
    setNotice(null)

    try {
      await storage.remove(project.id)
      onProjectDeleted(project.id)
      if (activeProject?.id === project.id) {
        setProjectName(defaultProjectName(draft))
      }
      setNotice(t("projects.deleted"))
    } catch {
      setError(errorMessage(t))
    } finally {
      setBusyAction(null)
    }
  }

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="min-w-0 font-medium text-muted-foreground hover:text-foreground"
        aria-label={t("projects.open")}
        onClick={openManager}
      >
        <Icon icon={FolderOpenIcon} data-icon="inline-start" />
        <span className="hidden max-w-40 truncate text-foreground sm:inline">
          {activeProject?.name ?? t("projects.unsaved")}
        </span>
      </Button>
      <AutosaveBadge status={autosaveStatus} />

      {isOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/35 p-4 backdrop-blur-[2px]"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeManager()
            }
          }}
        >
          <dialog
            open
            aria-modal="true"
            aria-labelledby="projects-dialog-title"
            /* Static, because the UA's absolute dialog escapes the centering flexbox. */
            className="static max-h-[min(720px,calc(100svh-2rem))] w-full max-w-xl overflow-y-auto rounded-2xl border bg-background p-5 shadow-[0_24px_80px_color-mix(in_oklch,var(--foreground),transparent_78%)] sm:p-6"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2
                  id="projects-dialog-title"
                  className="font-heading text-lg font-semibold tracking-[-0.02em]"
                >
                  {t("projects.dialogTitle")}
                </h2>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  {t("projects.description")}
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label={t("projects.close")}
                onClick={closeManager}
              >
                <Icon icon={Cancel01Icon} />
              </Button>
            </div>

            <form
              className="mt-5 rounded-xl border bg-card p-4"
              onSubmit={(event) => {
                event.preventDefault()
                void saveCurrent(false)
              }}
            >
              <Label htmlFor="project-name">{t("projects.name")}</Label>
              <div className="mt-2 flex flex-col gap-2 sm:flex-row">
                <Input
                  id="project-name"
                  value={projectName}
                  maxLength={80}
                  autoComplete="off"
                  placeholder={t("projects.namePlaceholder")}
                  onChange={(event) => setProjectName(event.target.value)}
                />
                <Button
                  type="submit"
                  className="shrink-0 sm:min-w-32"
                  disabled={busyAction !== null || storage.status !== "ready"}
                >
                  <Icon
                    icon={
                      busyAction === "save" ? Loading03Icon : FloppyDiskIcon
                    }
                    className={
                      busyAction === "save" ? "animate-spin" : undefined
                    }
                    data-icon="inline-start"
                  />
                  {busyAction === "save"
                    ? t("projects.saving")
                    : t("projects.save")}
                </Button>
              </div>
              {activeProject ? (
                <Button
                  type="button"
                  variant="link"
                  size="xs"
                  className="mt-2 px-0"
                  disabled={busyAction !== null || storage.status !== "ready"}
                  onClick={() => void saveCurrent(true)}
                >
                  {t("projects.saveAsNew")}
                </Button>
              ) : null}
            </form>

            {error ? (
              <p
                className="mt-3 rounded-lg border border-destructive/25 bg-destructive/8 px-3 py-2 text-xs leading-5 text-destructive"
                role="alert"
              >
                {error}
              </p>
            ) : null}
            {notice ? (
              <output className="mt-3 rounded-lg border border-emerald-500/25 bg-emerald-500/8 px-3 py-2 text-xs leading-5 text-emerald-700 dark:text-emerald-400">
                {notice}
              </output>
            ) : null}

            <div className="mt-6 border-t pt-5">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-sm font-semibold">
                  {t("projects.savedList")}
                </h3>
                {storage.status === "loading" ? (
                  <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Icon
                      icon={Loading03Icon}
                      className="size-3.5 animate-spin"
                    />
                    {t("projects.loading")}
                  </span>
                ) : null}
              </div>

              {storage.status === "error" ? (
                <p className="mt-3 text-xs leading-5 text-muted-foreground">
                  {t("projects.unavailable")}
                </p>
              ) : storage.projects.length === 0 ? (
                <p className="mt-3 text-xs leading-5 text-muted-foreground">
                  {t("projects.empty")}
                </p>
              ) : (
                <ul className="mt-3 space-y-2">
                  {storage.projects.map((project) => (
                    <li
                      key={project.id}
                      className="flex items-center gap-3 rounded-xl border bg-card px-3 py-2.5"
                    >
                      <ProjectLogo project={project} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">
                          {project.name}
                        </p>
                        <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
                          {project.id === activeProject?.id
                            ? `${t("projects.current")} · `
                            : ""}
                          {t("projects.updated", {
                            date: formatUpdatedAt(project.updatedAt, locale),
                          })}
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-1.5">
                        <Button
                          type="button"
                          variant="secondary"
                          size="xs"
                          disabled={busyAction !== null}
                          onClick={() => void loadSavedProject(project)}
                        >
                          {busyAction === `load:${project.id}` ? (
                            <Icon
                              icon={Loading03Icon}
                              className="animate-spin"
                            />
                          ) : null}
                          {t("projects.load")}
                        </Button>
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon-xs"
                          aria-label={t("projects.deleteNamed", {
                            name: project.name,
                          })}
                          disabled={busyAction !== null}
                          onClick={() => void deleteSavedProject(project)}
                        >
                          <Icon icon={Delete02Icon} />
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </dialog>
        </div>
      ) : null}
    </>
  )
}

/** Projects without a logo fall back to their initial, so the row never shifts. */
function ProjectLogo({ project }: { project: ProjectSummary }) {
  const [source, setSource] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (!project.logo) {
      setSource(null)
      return undefined
    }

    const objectUrl = URL.createObjectURL(project.logo)
    setSource(objectUrl)
    return () => URL.revokeObjectURL(objectUrl)
  }, [project.logo])

  return (
    <span className="image-preview-tile flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-[10px] ring-1 ring-foreground/8">
      {source ? (
        <img src={source} alt="" className="size-8 object-contain" />
      ) : (
        <span className="text-sm font-semibold text-muted-foreground uppercase">
          {Array.from(project.name)[0] ?? "?"}
        </span>
      )}
    </span>
  )
}

function AutosaveBadge({ status }: { status: AutosaveStatus }) {
  const { t } = useI18n()

  if (status === "off") {
    return null
  }

  return (
    <span
      className="hidden items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-[11px] text-muted-foreground md:inline-flex"
      aria-live="polite"
    >
      <span
        aria-hidden="true"
        className={cn(
          "size-1.5 rounded-full",
          status === "failed" ? "bg-destructive" : "bg-brand",
          status === "saving" && "animate-pulse"
        )}
      />
      {t(autosaveMessageKey(status))}
    </span>
  )
}

function autosaveMessageKey(status: Exclude<AutosaveStatus, "off">) {
  switch (status) {
    case "saving":
      return "projects.saving" as const
    case "saved":
      return "projects.autosaved" as const
    case "failed":
      return "projects.autosaveFailed" as const
  }
}

function defaultProjectName(draft: ReleaseDraft): string {
  return draft.content.productName.trim() || "Untitled project"
}

function formatUpdatedAt(timestamp: number, locale: string): string {
  return new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(timestamp))
}

function errorMessage(t: ReturnType<typeof useI18n>["t"]): string {
  return t("projects.error")
}
