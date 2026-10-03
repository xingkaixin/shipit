type ExportEvent =
  | "export-start"
  | "export-complete"
  | "export-failed"
  | "export-cancelled"
type EventData = Record<string, string | number | boolean>

declare global {
  interface Window {
    umami?: {
      track: (name: ExportEvent, data: EventData) => Promise<unknown> | void
    }
  }
}

export function trackExport(name: ExportEvent, data: EventData): void {
  try {
    void Promise.resolve(window.umami?.track(name, data)).catch(() => {})
  } catch {
    // Analytics must never interrupt an export, including when a tracker is blocked.
  }
}
