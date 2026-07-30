import { VIDEO_DURATION_SECONDS } from "@/video/release-video"

export const ASPECT_RATIOS = ["landscape", "portrait"] as const
export const RESOLUTIONS = ["1080p", "4k"] as const
export const FRAME_RATES = [30, 60] as const

export type AspectRatio = (typeof ASPECT_RATIOS)[number]
export type Resolution = (typeof RESOLUTIONS)[number]
export type FrameRate = (typeof FRAME_RATES)[number]

export type VideoDimensions = {
  width: number
  height: number
}

type OutputResolutionDefinition = {
  id: Resolution
  name: string
  landscape: VideoDimensions
  portrait: VideoDimensions
}

const OUTPUT_RESOLUTIONS: readonly OutputResolutionDefinition[] = [
  {
    id: "1080p",
    name: "1080p",
    landscape: { width: 1920, height: 1080 },
    portrait: { width: 1080, height: 1920 },
  },
  {
    id: "4k",
    name: "4K",
    landscape: { width: 3840, height: 2160 },
    portrait: { width: 2160, height: 3840 },
  },
]

export const LOGICAL_VIEWPORTS: Record<AspectRatio, VideoDimensions> = {
  landscape: { width: 1920, height: 1080 },
  portrait: { width: 1080, height: 1920 },
}

export const PREVIEW_DIMENSIONS: Record<AspectRatio, VideoDimensions> = {
  landscape: { width: 1920, height: 1080 },
  portrait: { width: 1080, height: 1920 },
}

export function outputDimensions(
  aspectRatio: AspectRatio,
  resolution: Resolution
): VideoDimensions {
  const definition = resolutionById(resolution)
  return definition[aspectRatio]
}

export function outputFrameCount(frameRate: FrameRate): number {
  return frameRate * VIDEO_DURATION_SECONDS
}

export function outputBitrate(
  dimensions: VideoDimensions,
  frameRate: FrameRate
): number {
  const pixelsPerSecond = dimensions.width * dimensions.height * frameRate
  return Math.round(pixelsPerSecond * 0.12)
}

export function isAspectRatio(value: string | null): value is AspectRatio {
  return ASPECT_RATIOS.some((aspectRatio) => aspectRatio === value)
}

export function isResolution(value: string | null): value is Resolution {
  return RESOLUTIONS.some((resolution) => resolution === value)
}

export function isFrameRate(value: number): value is FrameRate {
  return FRAME_RATES.some((frameRate) => frameRate === value)
}

function resolutionById(resolution: Resolution): OutputResolutionDefinition {
  const definition = OUTPUT_RESOLUTIONS.find(({ id }) => id === resolution)

  if (!definition) {
    throw new Error(`Unknown resolution: ${resolution}`)
  }

  return definition
}
