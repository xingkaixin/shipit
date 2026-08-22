import { describe, expect, it } from "vitest"

import { localeFromLanguages, translate } from "@/i18n/i18n"

describe("i18n", () => {
  it("picks the first supported browser language", () => {
    expect(localeFromLanguages(["zh-Hans-CN", "en-US"])).toBe("zh-CN")
    expect(localeFromLanguages(["en-US", "zh-Hans-CN"])).toBe("en")
    expect(localeFromLanguages(["fr-FR"])).toBe("en")
  })

  it("translates both locales and interpolates variables", () => {
    expect(translate("en", "inspector.theme")).toBe("Color theme")
    expect(translate("zh-CN", "inspector.theme")).toBe("配色主题")
    expect(translate("en", "preview.figureLabel", { product: "Shipit" })).toBe(
      "Shipit release film preview"
    )
  })
})
