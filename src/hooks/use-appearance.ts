import * as React from "react"

export const APPEARANCES = ["system", "light", "dark"] as const

export type Appearance = (typeof APPEARANCES)[number]

export const APPEARANCE_STORAGE_KEY = "shipit-appearance"

/** Kept in sync with --workspace in index.css. */
const BROWSER_CHROME_COLOR = { light: "#f4f6f2", dark: "#0a0b0a" } as const

export function resolveAppearance(
  appearance: Appearance,
  prefersDark: boolean
): "light" | "dark" {
  if (appearance === "system") {
    return prefersDark ? "dark" : "light"
  }

  return appearance
}

export function useAppearance() {
  const [appearance, setAppearance] =
    React.useState<Appearance>(readStoredAppearance)

  React.useEffect(() => {
    const darkMedia = window.matchMedia("(prefers-color-scheme: dark)")
    const applyCurrentAppearance = () => {
      applyAppearance(resolveAppearance(appearance, darkMedia.matches))
    }

    applyCurrentAppearance()
    darkMedia.addEventListener("change", applyCurrentAppearance)
    return () => darkMedia.removeEventListener("change", applyCurrentAppearance)
  }, [appearance])

  const changeAppearance = React.useCallback((next: Appearance) => {
    setAppearance(next)
    storeAppearance(next)
  }, [])

  return { appearance, setAppearance: changeAppearance }
}

export function isAppearance(value: string | null): value is Appearance {
  return APPEARANCES.some((option) => option === value)
}

function applyAppearance(resolved: "light" | "dark"): void {
  const root = document.documentElement
  root.classList.toggle("dark", resolved === "dark")
  root.classList.toggle("light", resolved === "light")
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute("content", BROWSER_CHROME_COLOR[resolved])
}

function readStoredAppearance(): Appearance {
  try {
    const stored = window.localStorage.getItem(APPEARANCE_STORAGE_KEY)
    return isAppearance(stored) ? stored : "system"
  } catch {
    return "system"
  }
}

function storeAppearance(appearance: Appearance): void {
  try {
    window.localStorage.setItem(APPEARANCE_STORAGE_KEY, appearance)
  } catch {
    return
  }
}
