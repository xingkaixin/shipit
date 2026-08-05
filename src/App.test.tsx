// @vitest-environment happy-dom

import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { App } from "@/App"
import { TooltipProvider } from "@/components/ui/tooltip"
import { I18nProvider } from "@/i18n/i18n"
import { EN_MESSAGES } from "@/i18n/messages"
import { PALETTE_REGISTRY } from "@/video/palette-registry"
import { BACKGROUND_REGISTRY } from "@/video/background-registry"

function renderApp() {
  return render(
    <I18nProvider>
      <TooltipProvider>
        <App />
      </TooltipProvider>
    </I18nProvider>
  )
}

beforeEach(() => {
  window.localStorage.clear()
  document.documentElement.className = ""
  Object.defineProperty(document, "fonts", {
    configurable: true,
    value: { check: () => true, load: () => Promise.resolve([]) },
  })
})

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

describe("App", () => {
  it("shows one inspector panel at a time and switches from the rail", () => {
    renderApp()

    const rail = screen.getByRole("navigation", {
      name: EN_MESSAGES["inspector.rail"],
    })

    expect(
      screen.queryByRole("button", {
        name: new RegExp(`^${BACKGROUND_REGISTRY[0].name}\\.`),
      })
    ).toBeNull()

    fireEvent.click(
      within(rail).getByRole("button", {
        name: EN_MESSAGES["inspector.background.short"],
      })
    )

    for (const background of BACKGROUND_REGISTRY) {
      expect(
        screen.getByRole("button", {
          name: new RegExp(`^${background.name}\\.`),
        })
      ).toBeTruthy()
    }

    fireEvent.click(
      within(rail).getByRole("button", {
        name: EN_MESSAGES["inspector.theme.short"],
      })
    )

    for (const palette of PALETTE_REGISTRY) {
      expect(
        screen.getByRole("button", {
          name: EN_MESSAGES[`palette.${palette.id}`],
        })
      ).toBeTruthy()
    }
  })

  it("keeps the export controls reachable without switching panels", () => {
    renderApp()

    expect(screen.getByRole("button", { name: /Export MP4/ })).toBeTruthy()
    expect(
      screen.getByLabelText(EN_MESSAGES["output.aspect.title"])
    ).toBeTruthy()
    expect(
      screen.getByLabelText(EN_MESSAGES["content.productName"])
    ).toBeTruthy()
  })

  it("offers a local project manager", () => {
    renderApp()

    fireEvent.click(
      screen.getByRole("button", { name: EN_MESSAGES["projects.open"] })
    )

    expect(
      screen.getByRole("dialog", {
        name: EN_MESSAGES["projects.dialogTitle"],
      })
    ).toBeTruthy()
    expect(
      screen.getByRole("button", { name: EN_MESSAGES["projects.save"] })
    ).toBeTruthy()
  })

  it("applies the resolved appearance to the document element", () => {
    vi.spyOn(window, "matchMedia").mockImplementation(
      (query) =>
        ({
          matches: query === "(prefers-color-scheme: dark)",
          media: query,
          addEventListener: () => undefined,
          removeEventListener: () => undefined,
        }) as unknown as MediaQueryList
    )

    renderApp()

    expect(document.documentElement.classList.contains("dark")).toBe(true)

    const appearance = screen.getByRole("group", {
      name: EN_MESSAGES["appearance.label"],
    })
    fireEvent.click(
      within(appearance).getByRole("button", {
        name: EN_MESSAGES["appearance.light"],
      })
    )

    expect(document.documentElement.classList.contains("light")).toBe(true)
    expect(window.localStorage.getItem("shipit-appearance")).toBe("light")
  })
})
