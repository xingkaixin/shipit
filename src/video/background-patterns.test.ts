import { describe, expect, it } from "vitest"

import { drawBackgroundPattern } from "@/video/background-patterns"
import { BACKGROUND_REGISTRY } from "@/video/background-registry"
import { paletteById } from "@/video/palette-registry"

describe("drawBackgroundPattern", () => {
  it("draws a distinct figure for every background", () => {
    const drawings = new Map<string, string>()

    for (const background of BACKGROUND_REGISTRY) {
      const { context, calls } = createRecordingContext()

      drawBackgroundPattern({
        context,
        pattern: background.pattern,
        palette: paletteById("midnight"),
        viewport: { width: 1_920, height: 1_080 },
        centerX: 960,
        centerY: 510,
        accentColor: "#B7FF5A",
        time: 2.62,
      })

      drawings.set(background.id, calls.join("|"))
    }

    // A pattern that only paints the palette fill would be invisible.
    const barelyDrawn = [...drawings]
      .filter(([, drawing]) => drawing.split("|").length <= 2)
      .map(([id]) => id)
    expect(barelyDrawn).toEqual([])

    expect(new Set(drawings.values()).size).toBe(BACKGROUND_REGISTRY.length)
  })
})

function createRecordingContext() {
  const calls: string[] = []
  const record =
    (name: string) =>
    (...args: unknown[]) => {
      calls.push(`${name}(${args.map((value) => String(value)).join(",")})`)
    }
  const gradient = { addColorStop: record("addColorStop") }
  const context = {
    save: record("save"),
    restore: record("restore"),
    beginPath: record("beginPath"),
    closePath: record("closePath"),
    moveTo: record("moveTo"),
    lineTo: record("lineTo"),
    bezierCurveTo: record("bezierCurveTo"),
    arc: record("arc"),
    ellipse: record("ellipse"),
    fill: record("fill"),
    stroke: record("stroke"),
    fillRect: record("fillRect"),
    translate: record("translate"),
    rotate: record("rotate"),
    createRadialGradient: (...args: unknown[]) => {
      record("createRadialGradient")(...args)
      return gradient
    },
    createLinearGradient: (...args: unknown[]) => {
      record("createLinearGradient")(...args)
      return gradient
    },
    fillStyle: "",
    strokeStyle: "",
    lineWidth: 1,
    globalAlpha: 1,
  }

  return { context: context as unknown as CanvasRenderingContext2D, calls }
}
