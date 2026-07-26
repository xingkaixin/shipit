import { describe, expect, it, vi } from "vitest"

import { LOGICAL_VIEWPORTS } from "@/video/output-settings"
import { renderReleaseFrame } from "@/video/render-release-frame"
import type { ReleaseComposition } from "@/video/release-video"
import { TEMPLATE_REGISTRY, THEME_TONES } from "@/video/template-registry"

describe("renderReleaseFrame", () => {
  it("renders every template, tone, and aspect combination", () => {
    for (const template of TEMPLATE_REGISTRY) {
      for (const themeTone of THEME_TONES) {
        for (const aspectRatio of ["landscape", "portrait"] as const) {
          const context = createCanvasContext(
            LOGICAL_VIEWPORTS[aspectRatio].width,
            LOGICAL_VIEWPORTS[aspectRatio].height
          )

          expect(() => {
            renderReleaseFrame(
              context,
              createComposition(template.id, themeTone, aspectRatio),
              2.62
            )
          }).not.toThrow()
        }
      }
    }
  })

  it("renders bounded text for long valid input", () => {
    const context = createCanvasContext(1_080, 1_920)
    const composition = createComposition("kinetic-signal", "dark", "portrait")
    composition.content.productName = "发".repeat(48)
    composition.content.detail = {
      kind: "custom",
      value: "Release".repeat(12).slice(0, 80),
    }

    renderReleaseFrame(context, composition, 2.62)

    const renderedText = context.fillText.mock.calls.map(([text]) => text)
    expect(renderedText.some((text) => text.endsWith("…"))).toBe(true)
  })

  it("reuses static text measurements across frames", () => {
    const context = createCanvasContext(1_920, 1_080)
    const composition = createComposition("midnight-burst", "dark", "landscape")

    renderReleaseFrame(context, composition, 1)
    const firstFrameMeasurements = context.measureText.mock.calls.length
    renderReleaseFrame(context, composition, 2)

    expect(firstFrameMeasurements).toBeGreaterThan(0)
    expect(context.measureText).toHaveBeenCalledTimes(firstFrameMeasurements)
  })
})

function createComposition(
  templateId: ReleaseComposition["style"]["templateId"],
  themeTone: ReleaseComposition["style"]["themeTone"],
  aspectRatio: ReleaseComposition["output"]["aspectRatio"]
): ReleaseComposition {
  return {
    content: {
      productName: "Shipit",
      version: "v1.0.0",
      detail: { kind: "install", value: "pnpm add shipit" },
      logoImage: null,
    },
    style: {
      templateId,
      themeTone,
      accentColor: "#B7FF5A",
      logoTreatment: "card-glow",
      titleFontId: "geist",
      titleColor: { mode: "template" },
    },
    output: {
      aspectRatio,
      resolution: "1080p",
      frameRate: 30,
    },
  }
}

function createCanvasContext(width: number, height: number) {
  const gradient = {
    addColorStop: () => undefined,
  }
  const context = {
    canvas: { width, height },
    save: () => undefined,
    restore: () => undefined,
    clearRect: () => undefined,
    scale: () => undefined,
    fillRect: () => undefined,
    createRadialGradient: () => gradient,
    beginPath: () => undefined,
    moveTo: () => undefined,
    lineTo: () => undefined,
    stroke: () => undefined,
    bezierCurveTo: () => undefined,
    translate: () => undefined,
    rotate: () => undefined,
    arc: () => undefined,
    closePath: () => undefined,
    fill: () => undefined,
    ellipse: () => undefined,
    roundRect: () => undefined,
    drawImage: () => undefined,
    measureText: vi.fn<(text: string) => { width: number }>((text) => {
      const fontSize = Number.parseFloat(
        /\s(\d+(?:\.\d+)?)px/.exec(context.font)?.[1] ?? "16"
      )
      return { width: Array.from(text).length * fontSize * 0.62 }
    }),
    fillText: vi.fn<(text: string, x: number, y: number) => void>(),
    font: "",
    fillStyle: "",
    strokeStyle: "",
    globalAlpha: 1,
    lineWidth: 1,
    lineCap: "butt",
    textAlign: "start",
    textBaseline: "alphabetic",
    letterSpacing: "0px",
    shadowColor: "",
    shadowBlur: 0,
  }

  return context as unknown as CanvasRenderingContext2D & {
    fillText: ReturnType<typeof vi.fn>
    measureText: ReturnType<typeof vi.fn>
  }
}
