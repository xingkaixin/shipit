import * as React from "react"

export type ShortcutMap = Record<string, () => void>

/**
 * Binds window-level shortcuts keyed by combo, for example `"Space"`, `"3"` or
 * `"mod+Enter"`. Unmodified keys are ignored while a control has focus, so
 * typing a version number or pressing Space on a button still does its own job.
 */
export function useKeyboardShortcuts(shortcuts: ShortcutMap): void {
  const shortcutsReference = React.useRef(shortcuts)
  shortcutsReference.current = shortcuts

  React.useEffect(() => {
    const runShortcut = (event: KeyboardEvent) => {
      const combo = comboOf(event)
      const handler = shortcutsReference.current[combo]
      if (
        !handler ||
        (!combo.startsWith("mod+") && ownsKeyboard(event.target))
      ) {
        return
      }

      event.preventDefault()
      handler()
    }

    window.addEventListener("keydown", runShortcut)
    return () => window.removeEventListener("keydown", runShortcut)
  }, [])
}

export function isAppleKeyboard(): boolean {
  return /Mac|iPhone|iPad/.test(navigator.userAgent)
}

function comboOf(event: KeyboardEvent): string {
  const key = event.code === "Space" ? "Space" : event.key
  return event.metaKey || event.ctrlKey ? `mod+${key}` : key
}

/** Focused controls answer plain keys themselves: Space clicks, digits type. */
function ownsKeyboard(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) {
    return false
  }

  return (
    target.isContentEditable ||
    target.closest(
      "input, textarea, select, button, a[href], [role='button'], [role='slider'], [contenteditable='true']"
    ) !== null
  )
}
