import { canEncodeVideo } from "mediabunny"

import { outputBitrate, outputDimensions } from "@/video/output-settings"
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
    throw new Error("当前浏览器不支持所选 H.264 输出规格，请降低分辨率")
  }
}
