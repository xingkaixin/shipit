export type ReleaseExportErrorCode = "canvas" | "empty" | "logo" | "unsupported"

export class ReleaseExportError extends Error {
  readonly code: ReleaseExportErrorCode

  constructor(code: ReleaseExportErrorCode) {
    super(code)
    this.code = code
    this.name = "ReleaseExportError"
  }
}
