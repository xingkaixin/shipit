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
import { TEMPLATE_REGISTRY } from "@/video/template-registry"

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
  it("offers every template and color theme in one inspector", () => {
    renderApp()

    for (const template of TEMPLATE_REGISTRY) {
      expect(
        screen.getByRole("button", {
          name: new RegExp(`^${template.name}\\.`),
        })
      ).toBeTruthy()
    }

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
