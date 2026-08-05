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
      if (!handler || ownsKey(event.target, combo)) {
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

/**
 * A focused control answers some keys itself: fields swallow every plain key,
 * while buttons and links only claim Space and Enter.
 */
function ownsKey(target: EventTarget | null, combo: string): boolean {
  if (combo.startsWith("mod+") || !(target instanceof HTMLElement)) {
    return false
  }

  if (
    target.isContentEditable ||
    target.closest("input, textarea, select, [contenteditable='true']")
  ) {
    return true
  }

  return (
    (combo === "Space" || combo === "Enter") &&
    target.closest("button, a[href], [role='button']") !== null
  )
}
