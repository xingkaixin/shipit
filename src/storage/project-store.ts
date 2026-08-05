import { INITIAL_RELEASE_DRAFT } from "@/state/release-draft-reducer"
import { isBackgroundId } from "@/video/background-registry"
import {
  isAspectRatio,
  isFrameRate,
  isResolution,
} from "@/video/output-settings"
import { isFontId } from "@/video/font-registry"
import {
  defaultAccentOf,
  isPaletteId,
  paletteById,
} from "@/video/palette-registry"
import {
  detailValueForKind,
  isDetailKind,
  isLogoTreatment,
  isProductFrame,
  PRODUCT_SCREENSHOT_SCALE_MAX,
  PRODUCT_SCREENSHOT_SCALE_MIN,
  PRODUCT_SHADOW_STRENGTH_MAX,
  PRODUCT_SHADOW_STRENGTH_MIN,
  PRODUCT_SHOT_SCALE_MAX,
  PRODUCT_SHOT_SCALE_MIN,
  type ReleaseDraft,
} from "@/video/release-video"

const DATABASE_NAME = "shipit-projects"
const DATABASE_VERSION = 1
const PROJECT_STORE_NAME = "projects"
const PROJECT_SCHEMA_VERSION = 1
const MAX_PROJECT_NAME_LENGTH = 80

type StoredImage = {
  blob: Blob
  name: string
  type: string
  lastModified: number
}

type StoredReleaseDraft = Omit<ReleaseDraft, "content"> & {
  content: Omit<ReleaseDraft["content"], "logoFile" | "screenshotFile"> & {
    logoFile: StoredImage | null
    screenshotFile: StoredImage | null
  }
}

type StoredProject = {
  schemaVersion: number
  id: string
  name: string
  createdAt: number
  updatedAt: number
  draft: StoredReleaseDraft
}

export type ProjectSummary = Pick<
  StoredProject,
  "id" | "name" | "createdAt" | "updatedAt"
> & {
  /** The saved logo, so the list can show what each project looks like. */
  logo: Blob | null
}

export type SaveProjectInput = {
  id: string | null
  name: string
  draft: ReleaseDraft
}

export async function listProjects(): Promise<ProjectSummary[]> {
  return runTransaction("readonly", (store, setResult) => {
    const request = store.getAll()
    request.onsuccess = () => {
      const summaries = request.result
        .map(projectSummaryFrom)
        .filter((project): project is ProjectSummary => project !== null)
        .sort((left, right) => right.updatedAt - left.updatedAt)
      setResult(summaries)
    }
  })
}

export async function getProject(id: string): Promise<ReleaseDraft | null> {
  return runTransaction("readonly", (store, setResult) => {
    const request = store.get(id)
    request.onsuccess = () => {
      const project = request.result as StoredProject | undefined
      setResult(project ? restoreProjectDraft(project.draft) : null)
    }
  })
}

export async function saveProject(
  input: SaveProjectInput
): Promise<ProjectSummary> {
  return runTransaction("readwrite", (store, setResult) => {
    const id = input.id ?? createProjectId()
    const name = projectNameFor(input.name, input.draft)
    const now = Date.now()
    const draft = serializeProjectDraft(input.draft)

    if (!input.id) {
      store.put({
        schemaVersion: PROJECT_SCHEMA_VERSION,
        id,
        name,
        createdAt: now,
        updatedAt: now,
        draft,
      } satisfies StoredProject)
      setResult({
        id,
        name,
        createdAt: now,
        updatedAt: now,
        logo: logoOf(draft),
      })
      return
    }

    const request = store.get(input.id)
    request.onsuccess = () => {
      const existing = request.result as StoredProject | undefined
      const project = {
        schemaVersion: PROJECT_SCHEMA_VERSION,
        id,
        name,
        createdAt: existing?.createdAt ?? now,
        updatedAt: now,
        draft,
      } satisfies StoredProject
      store.put(project)
      setResult({
        id,
        name,
        createdAt: project.createdAt,
        updatedAt: project.updatedAt,
        logo: logoOf(draft),
      })
    }
  })
}

export async function deleteProject(id: string): Promise<void> {
  return runTransaction("readwrite", (store) => {
    store.delete(id)
  })
}

export function restoreProjectDraft(value: unknown): ReleaseDraft {
  const source = asRecord(value)
  const sourceContent = asRecord(source.content)
  const sourceStyle = asRecord(source.style)
  const sourceTitleColor = asRecord(sourceStyle.titleColor)
  const sourceProductShot = asRecord(sourceStyle.productShot)
  const sourceBrowser = asRecord(sourceProductShot.browser)
  const sourceOutput = asRecord(source.output)

  const backgroundId = stringValue(sourceStyle.backgroundId)
  const paletteValue = stringValue(sourceStyle.paletteId)
  const logoTreatment = stringValue(sourceStyle.logoTreatment)
  const titleFontId = stringValue(sourceStyle.titleFontId)
  const productFrame = stringValue(sourceProductShot.frame)
  const aspectRatio = stringValue(sourceOutput.aspectRatio)
  const resolution = stringValue(sourceOutput.resolution)
  const frameRate = numberValue(sourceOutput.frameRate)
  const paletteId = isPaletteId(paletteValue)
    ? paletteValue
    : INITIAL_RELEASE_DRAFT.style.paletteId
  const palette = paletteById(paletteId)

  return {
    content: {
      productName: stringValue(
        sourceContent.productName,
        INITIAL_RELEASE_DRAFT.content.productName
      ),
      version: stringValue(
        sourceContent.version,
        INITIAL_RELEASE_DRAFT.content.version
      ),
      detail: restoreDetail(sourceContent.detail),
      logoFile: restoreImage(sourceContent.logoFile),
      screenshotFile: restoreImage(sourceContent.screenshotFile),
    },
    style: {
      backgroundId: isBackgroundId(backgroundId)
        ? backgroundId
        : INITIAL_RELEASE_DRAFT.style.backgroundId,
      paletteId,
      accentColor: stringValue(
        sourceStyle.accentColor,
        defaultAccentOf(palette)
      ),
      logoTreatment: isLogoTreatment(logoTreatment)
        ? logoTreatment
        : INITIAL_RELEASE_DRAFT.style.logoTreatment,
      titleFontId: isFontId(titleFontId)
        ? titleFontId
        : INITIAL_RELEASE_DRAFT.style.titleFontId,
      titleColor: {
        useCustom: booleanValue(
          sourceTitleColor.useCustom,
          INITIAL_RELEASE_DRAFT.style.titleColor.useCustom
        ),
        value: stringValue(sourceTitleColor.value, palette.foreground),
      },
      titleShimmer: booleanValue(
        sourceStyle.titleShimmer,
        INITIAL_RELEASE_DRAFT.style.titleShimmer
      ),
      productShot: {
        frame: isProductFrame(productFrame)
          ? productFrame
          : INITIAL_RELEASE_DRAFT.style.productShot.frame,
        scale: boundedNumber(
          sourceProductShot.scale,
          INITIAL_RELEASE_DRAFT.style.productShot.scale,
          PRODUCT_SHOT_SCALE_MIN,
          PRODUCT_SHOT_SCALE_MAX
        ),
        screenshotScale: boundedNumber(
          sourceProductShot.screenshotScale,
          INITIAL_RELEASE_DRAFT.style.productShot.screenshotScale,
          PRODUCT_SCREENSHOT_SCALE_MIN,
          PRODUCT_SCREENSHOT_SCALE_MAX
        ),
        screenColor: stringValue(
          sourceProductShot.screenColor,
          INITIAL_RELEASE_DRAFT.style.productShot.screenColor
        ),
        shadowStrength: boundedNumber(
          sourceProductShot.shadowStrength,
          INITIAL_RELEASE_DRAFT.style.productShot.shadowStrength,
          PRODUCT_SHADOW_STRENGTH_MIN,
          PRODUCT_SHADOW_STRENGTH_MAX
        ),
        browser: {
          tabTitle: stringValue(
            sourceBrowser.tabTitle,
            INITIAL_RELEASE_DRAFT.style.productShot.browser.tabTitle
          ),
          url: stringValue(
            sourceBrowser.url,
            INITIAL_RELEASE_DRAFT.style.productShot.browser.url
          ),
        },
        shimmer: booleanValue(
          sourceProductShot.shimmer,
          INITIAL_RELEASE_DRAFT.style.productShot.shimmer
        ),
      },
    },
    output: {
      aspectRatio: isAspectRatio(aspectRatio)
        ? aspectRatio
        : INITIAL_RELEASE_DRAFT.output.aspectRatio,
      resolution: isResolution(resolution)
        ? resolution
        : INITIAL_RELEASE_DRAFT.output.resolution,
      frameRate: isFrameRate(frameRate)
        ? frameRate
        : INITIAL_RELEASE_DRAFT.output.frameRate,
    },
  }
}

function serializeProjectDraft(draft: ReleaseDraft): StoredReleaseDraft {
  return {
    ...draft,
    content: {
      ...draft.content,
      logoFile: serializeImage(draft.content.logoFile),
      screenshotFile: serializeImage(draft.content.screenshotFile),
    },
  }
}

function serializeImage(file: File | null): StoredImage | null {
  if (!file) {
    return null
  }

  return {
    blob: file.slice(0, file.size, file.type),
    name: file.name,
    type: file.type,
    lastModified: file.lastModified,
  }
}

function restoreImage(value: unknown): File | null {
  if (typeof File === "undefined") {
    return null
  }

  if (value instanceof File) {
    return value
  }

  if (value instanceof Blob) {
    return fileFromBlob(value, "image")
  }

  const source = asRecord(value)
  if (!(source.blob instanceof Blob)) {
    return null
  }

  return fileFromBlob(
    source.blob,
    stringValue(source.name, "image"),
    stringValue(source.type, source.blob.type),
    numberValue(source.lastModified, Date.now())
  )
}

function fileFromBlob(
  blob: Blob,
  name: string,
  type = blob.type,
  lastModified = Date.now()
): File | null {
  try {
    return new File([blob], name, { type, lastModified })
  } catch {
    return null
  }
}

function restoreDetail(value: unknown): ReleaseDraft["content"]["detail"] {
  const source = asRecord(value)
  const kind = stringValue(source.kind)
  if (!isDetailKind(kind)) {
    return { ...INITIAL_RELEASE_DRAFT.content.detail }
  }

  if (kind === "none") {
    return { kind }
  }

  return {
    kind,
    value: stringValue(source.value, detailValueForKind(kind)),
  }
}

function projectSummaryFrom(value: unknown): ProjectSummary | null {
  const source = asRecord(value)
  const id = stringValue(source.id)
  const name = stringValue(source.name)
  const createdAt = numberValue(source.createdAt)
  const updatedAt = numberValue(source.updatedAt)

  if (
    !id ||
    !name ||
    !Number.isFinite(createdAt) ||
    !Number.isFinite(updatedAt)
  ) {
    return null
  }

  return {
    id,
    name,
    createdAt,
    updatedAt,
    logo: logoOf(asRecord(source.draft)),
  }
}

function logoOf(draft: unknown): Blob | null {
  const logo = asRecord(asRecord(asRecord(draft).content).logoFile)
  return logo.blob instanceof Blob ? logo.blob : null
}

function projectNameFor(name: string, draft: ReleaseDraft): string {
  const trimmedName = name.trim()
  if (trimmedName) {
    return trimmedName.slice(0, MAX_PROJECT_NAME_LENGTH)
  }

  const productName = draft.content.productName.trim()
  return (productName || "Untitled project").slice(0, MAX_PROJECT_NAME_LENGTH)
}

function createProjectId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID()
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

function runTransaction<T>(
  mode: IDBTransactionMode,
  operation: (
    store: IDBObjectStore,
    setResult: (result: T) => void
  ) => void = () => undefined
): Promise<T> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(new Error("IndexedDB is not available"))
      return
    }

    const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION)
    request.onupgradeneeded = () => {
      const database = request.result
      if (!database.objectStoreNames.contains(PROJECT_STORE_NAME)) {
        database.createObjectStore(PROJECT_STORE_NAME, { keyPath: "id" })
      }
    }
    request.onerror = () =>
      reject(request.error ?? new Error("Could not open project storage"))
    request.onsuccess = () => {
      const database = request.result
      database.onversionchange = () => database.close()
      let result: T
      let hasResult = false

      try {
        const transaction = database.transaction(PROJECT_STORE_NAME, mode)
        transaction.oncomplete = () => {
          database.close()
          if (hasResult) {
            resolve(result)
          } else {
            resolve(undefined as T)
          }
        }
        transaction.onerror = () => {
          database.close()
          reject(
            transaction.error ?? new Error("Project storage transaction failed")
          )
        }
        transaction.onabort = () => {
          database.close()
          reject(
            transaction.error ??
              new Error("Project storage transaction aborted")
          )
        }
        operation(transaction.objectStore(PROJECT_STORE_NAME), (value) => {
          result = value
          hasResult = true
        })
      } catch (error) {
        database.close()
        reject(error)
      }
    }
  })
}

function asRecord(value: unknown): Record<string, unknown> {
  return typeof value === "object" && value !== null
    ? (value as Record<string, unknown>)
    : {}
}

function stringValue(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback
}

function booleanValue(value: unknown, fallback: boolean): boolean {
  return typeof value === "boolean" ? value : fallback
}

function numberValue(value: unknown, fallback = Number.NaN): number {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value
  }

  return fallback
}

function boundedNumber(
  value: unknown,
  fallback: number,
  minimum: number,
  maximum: number
): number {
  return Math.min(Math.max(numberValue(value, fallback), minimum), maximum)
}
