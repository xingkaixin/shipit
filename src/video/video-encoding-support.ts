import { canEncodeVideo } from "mediabunny"

import { outputBitrate, outputDimensions } from "@/video/output-settings"
import { ReleaseExportError } from "@/video/release-export-error"
import type { OutputSettings } from "@/video/release-video"

export async function canEncodeOutput(
  output: OutputSettings
): Promise<boolean> {
  const dimensions = outputDimensions(output.aspectRatio, output.resolution)
  const bitrate = outputBitrate(dimensions, output.frameRate)

  return canEncodeVideo("avc", {
    width: dimensions.width,
    height: dimensions.height,
    bitrate,
  })
}

export async function assertOutputEncodingSupport(
  output: OutputSettings
): Promise<void> {
  const isSupported = await canEncodeOutput(output)

  if (!isSupported) {
    throw new ReleaseExportError("unsupported")
  }
}
