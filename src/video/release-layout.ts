import type { VideoDimensions } from "@/video/output-settings"
import type { AspectRatio } from "@/video/output-settings"
import type { BackgroundLayout } from "@/video/background-registry"

export type ReleaseLayout = {
  centerX: number
  eyebrowY: number
  logoY: number
  logoSize: number
  titleY: number
  titleMaximumWidth: number
  titleMaximumFontSize: number
  titleMinimumFontSize: number
  versionY: number
  detailY: number
  detailMaximumWidth: number
  backgroundCenterY: number
  confettiOriginY: number
}

export function releaseLayout(
  aspectRatio: AspectRatio,
  backgroundLayout: BackgroundLayout,
  viewport: VideoDimensions
): ReleaseLayout {
  if (aspectRatio === "portrait") {
    return portraitLayout(backgroundLayout, viewport)
  }

  return landscapeLayout(backgroundLayout, viewport)
}

function landscapeLayout(
  backgroundLayout: BackgroundLayout,
  viewport: VideoDimensions
): ReleaseLayout {
  const base = {
    centerX: viewport.width / 2,
    eyebrowY: 124,
    logoY: 282,
    logoSize: 176,
    titleY: 526,
    titleMaximumWidth: 1180,
    titleMaximumFontSize: 112,
    titleMinimumFontSize: 58,
    versionY: 636,
    detailY: 715,
    detailMaximumWidth: 910,
    backgroundCenterY: 510,
    confettiOriginY: viewport.height - 64,
  }

  switch (backgroundLayout) {
    case "stacked":
      return base
    case "type-forward":
      return {
        ...base,
        logoY: 266,
        logoSize: 142,
        titleY: 514,
        titleMaximumWidth: 1480,
        titleMaximumFontSize: 142,
        versionY: 650,
        detailY: 740,
      }
    case "spotlight":
      return {
        ...base,
        logoY: 300,
        logoSize: 204,
        titleY: 558,
        versionY: 676,
        detailY: 758,
      }
  }
}

function portraitLayout(
  backgroundLayout: BackgroundLayout,
  viewport: VideoDimensions
): ReleaseLayout {
  const base = {
    centerX: viewport.width / 2,
    eyebrowY: 210,
    logoY: 630,
    logoSize: 190,
    titleY: 990,
    titleMaximumWidth: 900,
    titleMaximumFontSize: 116,
    titleMinimumFontSize: 54,
    versionY: 1160,
    detailY: 1280,
    detailMaximumWidth: 840,
    backgroundCenterY: 960,
    confettiOriginY: viewport.height * 0.88,
  }

  switch (backgroundLayout) {
    case "stacked":
      return base
    case "type-forward":
      return {
        ...base,
        logoY: 520,
        logoSize: 150,
        titleY: 900,
        titleMaximumFontSize: 136,
        versionY: 1140,
        detailY: 1270,
      }
    case "spotlight":
      return {
        ...base,
        logoY: 680,
        logoSize: 228,
        titleY: 1050,
        versionY: 1240,
        detailY: 1370,
      }
  }
}
