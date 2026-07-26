import * as React from "react"

import { renderReleaseFrame } from "@/video/render-release-frame"
import type { ReleaseComposition } from "@/video/release-video"
import type { TemplateId } from "@/video/template-registry"

/** All three confetti bursts are in the air, and every reveal has landed. */
const THUMBNAIL_TIME_SECONDS = 2.62
const THUMBNAIL_WIDTH = 320
const THUMBNAIL_HEIGHT = 180

type TemplateThumbnailProps = {
  composition: ReleaseComposition
  templateId: TemplateId
}

export function TemplateThumbnail({
  composition,
  templateId,
}: TemplateThumbnailProps) {
  const canvasReference = React.useRef<HTMLCanvasElement>(null)
  const thumbnailComposition = React.useMemo<ReleaseComposition>(
    () => ({
      locale: composition.locale,
      content: {
        productName: composition.content.productName,
        version: composition.content.version,
        detail: { kind: "none" },
        logoImage: composition.content.logoImage,
      },
      style: { ...composition.style, templateId },
      output: { aspectRatio: "landscape", resolution: "1080p", frameRate: 30 },
    }),
    [
      composition.content.logoImage,
      composition.content.productName,
      composition.content.version,
      composition.locale,
      composition.style,
      templateId,
    ]
  )

  React.useEffect(() => {
    const context = canvasReference.current?.getContext("2d", { alpha: false })
    if (!context) {
      return
    }

    renderReleaseFrame(context, thumbnailComposition, THUMBNAIL_TIME_SECONDS)
  }, [thumbnailComposition])

  return (
    <canvas
      ref={canvasReference}
      width={THUMBNAIL_WIDTH}
      height={THUMBNAIL_HEIGHT}
      aria-hidden="true"
      className="block size-full"
    />
  )
}
