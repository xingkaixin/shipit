import { describe, expect, it, vi } from "vitest"

import { LOGICAL_VIEWPORTS } from "@/video/output-settings"
import { renderReleaseFrame } from "@/video/render-release-frame"
import type { ReleaseComposition } from "@/video/release-video"
import { PALETTE_REGISTRY } from "@/video/palette-registry"
import { BACKGROUND_REGISTRY } from "@/video/background-registry"

describe("renderReleaseFrame", () => {
  it("renders every background, palette, and aspect combination", () => {
    for (const background of BACKGROUND_REGISTRY) {
      for (const palette of PALETTE_REGISTRY) {
        for (const aspectRatio of ["landscape", "portrait"] as const) {
          const context = createCanvasContext(
            LOGICAL_VIEWPORTS[aspectRatio].width,
            LOGICAL_VIEWPORTS[aspectRatio].height
          )

          expect(() => {
            renderReleaseFrame(
              context,
              createComposition(background.id, palette.id, aspectRatio),
              2.62
            )
          }).not.toThrow()
        }
      }
    }
  })

  it("renders bounded text for long valid input", () => {
    const context = createCanvasContext(1_080, 1_920)
    const composition = createComposition(
      "kinetic-signal",
      "signal",
      "portrait"
    )
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
    const composition = createComposition(
      "midnight-burst",
      "midnight",
      "landscape"
    )

    renderReleaseFrame(context, composition, 1)
    const firstFrameMeasurements = context.measureText.mock.calls.length
    renderReleaseFrame(context, composition, 2)

    expect(firstFrameMeasurements).toBeGreaterThan(0)
    expect(context.measureText).toHaveBeenCalledTimes(firstFrameMeasurements)
  })

  it("renders every product frame with shimmer", () => {
    for (const frame of ["none", "browser", "macbook", "iphone"] as const) {
      const context = createCanvasContext(1_920, 1_080)
      const composition = createComposition(
        "midnight-burst",
        "midnight",
        "landscape"
      )
      composition.content.screenshotImage = {
        source: {} as CanvasImageSource,
        width: 1_440,
        height: 900,
      }
      composition.content.productFrameImage =
        frame === "none"
          ? null
          : {
              source: {} as CanvasImageSource,
              width: 1_440,
              height: 900,
            }
      composition.style.productShot.frame = frame
      composition.style.titleShimmer = true

      expect(() => {
        renderReleaseFrame(context, composition, 2.62)
      }).not.toThrow()
      expect(context.drawImage).toHaveBeenCalled()
    }
  })

  it("adds a title highlight only when enabled", () => {
    const staticContext = createCanvasContext(1_920, 1_080)
    const shimmerContext = createCanvasContext(1_920, 1_080)
    const staticComposition = createComposition(
      "clean-slate",
      "midnight",
      "landscape"
    )
    const shimmerComposition = {
      ...staticComposition,
      style: { ...staticComposition.style, titleShimmer: true },
    }

    renderReleaseFrame(staticContext, staticComposition, 2.1)
    renderReleaseFrame(shimmerContext, shimmerComposition, 2.1)

    expect(shimmerContext.fillText.mock.calls.length).toBe(
      staticContext.fillText.mock.calls.length + 1
    )
  })

  it("renders custom Chrome tab and URL text", () => {
    const context = createCanvasContext(1_920, 1_080)
    const composition = createComposition(
      "midnight-burst",
      "midnight",
      "landscape"
    )
    composition.content.screenshotImage = {
      source: {} as CanvasImageSource,
      width: 1_440,
      height: 900,
    }
    composition.content.productFrameImage = {
      source: {} as CanvasImageSource,
      width: 1_536,
      height: 895,
    }
    composition.style.productShot.browser = {
      tabTitle: "Shipit release",
      url: "shipit.dev/releases",
    }

    renderReleaseFrame(context, composition, 2.62)

    const renderedText = context.fillText.mock.calls.map(([text]) => text)
    expect(renderedText).toContain("Shipit release")
    expect(renderedText).toContain("shipit.dev/releases")
  })

  it("applies screenshot scale inside the Chrome frame", () => {
    const screenshotSource = {} as CanvasImageSource
    const frameSource = {} as CanvasImageSource
    const defaultContext = createCanvasContext(1_920, 1_080)
    const scaledContext = createCanvasContext(1_920, 1_080)
    const defaultComposition = createComposition(
      "midnight-burst",
      "midnight",
      "landscape"
    )
    const scaledComposition = createComposition(
      "midnight-burst",
      "midnight",
      "landscape"
    )

    for (const composition of [defaultComposition, scaledComposition]) {
      composition.content.screenshotImage = {
        source: screenshotSource,
        width: 1_440,
        height: 900,
      }
      composition.content.productFrameImage = {
        source: frameSource,
        width: 1_536,
        height: 895,
      }
    }
    scaledComposition.style.productShot.screenshotScale = 0.5

    renderReleaseFrame(defaultContext, defaultComposition, 2.62)
    renderReleaseFrame(scaledContext, scaledComposition, 2.62)

    const defaultScreenshot = defaultContext.drawImage.mock.calls.find(
      ([source]) => source === screenshotSource
    )
    const scaledScreenshot = scaledContext.drawImage.mock.calls.find(
      ([source]) => source === screenshotSource
    )

    expect(Number(scaledScreenshot?.[3])).toBeCloseTo(
      Number(defaultScreenshot?.[3]) * 0.5
    )
  })
})

function createComposition(
  backgroundId: ReleaseComposition["style"]["backgroundId"],
  paletteId: ReleaseComposition["style"]["paletteId"],
  aspectRatio: ReleaseComposition["output"]["aspectRatio"]
): ReleaseComposition {
  return {
    locale: "en",
    content: {
      productName: "Shipit",
      version: "v1.0.0",
      detail: { kind: "install", value: "pnpm add shipit" },
      logoImage: null,
      screenshotImage: null,
      productFrameImage: null,
    },
    style: {
      backgroundId,
      paletteId,
      accentColor: "#B7FF5A",
      logoTreatment: "card-glow",
      titleFontId: "geist",
      titleColor: { useCustom: false, value: "#F7F8FF" },
      titleShimmer: false,
      productShot: {
        frame: "browser",
        scale: 1,
        screenshotScale: 1,
        screenColor: "#FFFFFF",
        shadowStrength: 0.65,
        browser: { tabTitle: "", url: "" },
        shimmer: true,
      },
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
    transform: () => undefined,
    fillRect: () => undefined,
    createRadialGradient: () => gradient,
    createLinearGradient: () => gradient,
    beginPath: () => undefined,
    moveTo: () => undefined,
    lineTo: () => undefined,
    stroke: () => undefined,
    bezierCurveTo: () => undefined,
    translate: () => undefined,
    rotate: () => undefined,
    arc: () => undefined,
    closePath: () => undefined,
    clip: () => undefined,
    fill: () => undefined,
    ellipse: () => undefined,
    roundRect: () => undefined,
    drawImage: vi.fn<(...args: unknown[]) => void>(),
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
    shadowOffsetX: 0,
    shadowOffsetY: 0,
  }

  return context as unknown as CanvasRenderingContext2D & {
    fillText: ReturnType<typeof vi.fn>
    measureText: ReturnType<typeof vi.fn>
    drawImage: ReturnType<typeof vi.fn>
  }
}
