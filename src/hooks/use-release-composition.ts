import * as React from "react"

import { isImageStateExportable, useImageFile } from "@/hooks/use-image-file"
import {
  productFrameImageFor,
  useProductFrameAssets,
} from "@/hooks/use-product-frame-assets"
import {
  isOutputExportable,
  useOutputCapability,
} from "@/hooks/use-output-capability"
import { useI18n } from "@/i18n/i18n"
import type { ReleaseComposition, ReleaseDraft } from "@/video/release-video"

export type ReleaseCompositionState = {
  composition: ReleaseComposition
  logoState: ReturnType<typeof useImageFile>
  screenshotState: ReturnType<typeof useImageFile>
  capability: ReturnType<typeof useOutputCapability>
  canExport: boolean
}

/** Resolves the draft plus its decoded assets into the composition every renderer reads. */
export function useReleaseComposition(
  draft: ReleaseDraft
): ReleaseCompositionState {
  const { locale } = useI18n()
  const logoState = useImageFile(draft.content.logoFile)
  const screenshotState = useImageFile(draft.content.screenshotFile)
  const productFrameState = useProductFrameAssets()
  const capability = useOutputCapability(draft.output)

  const composition = React.useMemo<ReleaseComposition>(
    () => ({
      locale,
      content: {
        productName: draft.content.productName,
        version: draft.content.version,
        detail: draft.content.detail,
        logoImage: logoState.image,
        screenshotImage: screenshotState.image,
        productFrameImage: productFrameImageFor(
          productFrameState.images,
          draft.style.productShot.frame
        ),
      },
      style: draft.style,
      output: draft.output,
    }),
    [
      draft.content.detail,
      draft.content.productName,
      draft.content.version,
      draft.output,
      draft.style,
      locale,
      logoState.image,
      productFrameState.images,
      screenshotState.image,
    ]
  )

  const isProductFrameReady =
    !screenshotState.image ||
    draft.style.productShot.frame === "none" ||
    productFrameState.status === "ready"

  return {
    composition,
    logoState,
    screenshotState,
    capability,
    canExport:
      draft.content.productName.trim().length > 0 &&
      isImageStateExportable(logoState) &&
      isImageStateExportable(screenshotState) &&
      isProductFrameReady &&
      isOutputExportable(capability),
  }
}
