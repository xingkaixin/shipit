import { describe, expect, it } from "vitest"

import type { ReleaseComposition } from "@/video/release-video"
import { releaseVideoFileName } from "@/video/release-video-file-name"

const BASE_COMPOSITION: ReleaseComposition = {
  content: {
    productName: "Shipit Studio",
    version: "v1.0.0",
    detail: { kind: "none" },
    logoImage: null,
  },
  style: {
    templateId: "midnight-burst",
    themeTone: "dark",
    accentColor: "#B7FF5A",
    logoTreatment: "card-glow",
    titleFontId: "geist",
    titleColor: { mode: "template" },
  },
  output: {
    aspectRatio: "landscape",
    resolution: "1080p",
    frameRate: 30,
  },
}

describe("releaseVideoFileName", () => {
  it("creates a portable release filename", () => {
    expect(releaseVideoFileName(BASE_COMPOSITION)).toBe(
      "shipit-studio-v1-0-0.mp4"
    )
  })

  it("preserves Chinese product names", () => {
    expect(
      releaseVideoFileName({
        ...BASE_COMPOSITION,
        content: {
          ...BASE_COMPOSITION.content,
          productName: "发布助手",
          version: "2.0",
        },
      })
    ).toBe("发布助手-2-0.mp4")
  })
})
