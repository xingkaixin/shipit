import { describe, expect, it } from "vitest"

import { translate } from "@/i18n/i18n"
import { localeFromPath } from "@/i18n/locales"

describe("i18n", () => {
  it("uses the language of the requested page", () => {
    expect(localeFromPath("/zh-cn/")).toBe("zh-CN")
    expect(localeFromPath("/ja/")).toBe("ja")
    expect(localeFromPath("/")).toBe("en")
  })

  it("translates both locales and interpolates variables", () => {
    expect(translate("en", "inspector.theme")).toBe("Color theme")
    expect(translate("zh-CN", "inspector.theme")).toBe("配色主题")
    expect(translate("ja", "inspector.theme")).toBe("カラーテーマ")
    expect(translate("en", "preview.figureLabel", { product: "Shipit" })).toBe(
      "Shipit release film preview"
    )
  })
})
