import { describe, expect, it } from "vitest"

import { localeFromLanguages, translate } from "@/i18n/i18n"

describe("i18n", () => {
  it("detects Chinese from the browser language list", () => {
    expect(localeFromLanguages(["en-US", "zh-Hans-CN"])).toBe("zh-CN")
    expect(localeFromLanguages(["en-US"])).toBe("en")
  })

  it("translates both locales and interpolates variables", () => {
    expect(translate("en", "sidebar.title")).toBe("Create a release film")
    expect(translate("zh-CN", "sidebar.title")).toBe("制作发布短片")
    expect(translate("en", "preview.figureLabel", { product: "Shipit" })).toBe(
      "Shipit release film preview"
    )
  })
})
