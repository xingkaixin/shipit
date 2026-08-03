import * as React from "react"

import { ReleaseInspector } from "@/components/editor/ReleaseInspector"
import { ReleaseStage } from "@/components/editor/ReleaseStage"
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
import { type ReleaseDraftAction } from "@/state/release-draft-reducer"
import type { ReleaseComposition, ReleaseDraft } from "@/video/release-video"

type ReleaseEditorProps = {
  draft: ReleaseDraft
  dispatch: React.Dispatch<ReleaseDraftAction>
}

export function ReleaseEditor({ draft, dispatch }: ReleaseEditorProps) {
  const { locale } = useI18n()
  const logoState = useImageFile(draft.content.logoFile)
  const screenshotState = useImageFile(draft.content.screenshotFile)
  const productFrameState = useProductFrameAssets()
  const outputCapability = useOutputCapability(draft.output)

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
  const canExport =
    draft.content.productName.trim().length > 0 &&
    isImageStateExportable(logoState) &&
    isImageStateExportable(screenshotState) &&
    isProductFrameReady &&
    isOutputExportable(outputCapability)

  return (
    <main
      id="release-editor"
      className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[22rem_minmax(0,1fr)] desk:overflow-hidden"
    >
      <ReleaseInspector
        draft={draft}
        composition={composition}
        logoState={logoState}
        screenshotState={screenshotState}
        dispatch={dispatch}
      />
      <ReleaseStage
        composition={composition}
        capability={outputCapability}
        canExport={canExport}
        dispatch={dispatch}
      />
    </main>
  )
}
