import { describe, expect, it } from "vitest"

import { fitSingleLineText } from "@/video/text-layout"

describe("fitSingleLineText", () => {
  it("keeps short text at the maximum font size", () => {
    const context = createTextContext()

    expect(
      fitSingleLineText(context, {
        text: "Shipit",
        maximumWidth: 600,
        maximumFontSize: 100,
        minimumFontSize: 50,
        fontWeight: 700,
        fontFamily: "sans-serif",
      })
    ).toEqual({ text: "Shipit", fontSize: 100 })
  })

  it("shrinks before truncating", () => {
    const context = createTextContext()

    expect(
      fitSingleLineText(context, {
        text: "Release",
        maximumWidth: 280,
        maximumFontSize: 80,
        minimumFontSize: 40,
        fontWeight: 700,
        fontFamily: "sans-serif",
      })
    ).toEqual({ text: "Release", fontSize: 40 })
  })

  it("truncates at grapheme boundaries when minimum size still overflows", () => {
    const context = createTextContext()
    const fitted = fitSingleLineText(context, {
      text: "Shipit 👨‍👩‍👧‍👦 Release Studio",
      maximumWidth: 200,
      maximumFontSize: 60,
      minimumFontSize: 40,
      fontWeight: 700,
      fontFamily: "sans-serif",
    })

    expect(fitted.fontSize).toBe(40)
    expect(fitted.text).toMatch(/…$/)
    expect(fitted.text).not.toContain("�")
    expect(context.measureText(fitted.text).width).toBeLessThanOrEqual(200)
  })
})

function createTextContext() {
  return {
    font: "",
    measureText(text: string) {
      const fontSize = Number.parseFloat(
        /\s(\d+)px/.exec(this.font)?.[1] ?? "16"
      )
      const graphemeCount = Array.from(
        new Intl.Segmenter(undefined, { granularity: "grapheme" }).segment(text)
      ).length

      return { width: graphemeCount * fontSize }
    },
  }
}
