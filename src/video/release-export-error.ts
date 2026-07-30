export type ReleaseExportErrorCode =
  | "asset"
  | "canvas"
  | "empty"
  | "unsupported"

export class ReleaseExportError extends Error {
  readonly code: ReleaseExportErrorCode

  constructor(code: ReleaseExportErrorCode) {
    super(code)
    this.code = code
    this.name = "ReleaseExportError"
  }
}
