import * as React from "react"

import { ReleaseInspector } from "@/components/editor/ReleaseInspector"
import { ReleaseStage } from "@/components/editor/ReleaseStage"
import { isImageStateExportable, useImageFile } from "@/hooks/use-image-file"
import {
  isOutputExportable,
  useOutputCapability,
} from "@/hooks/use-output-capability"
import { useI18n } from "@/i18n/i18n"
import {
  INITIAL_RELEASE_DRAFT,
  releaseDraftReducer,
} from "@/state/release-draft-reducer"
import type { ReleaseComposition } from "@/video/release-video"

export function ReleaseEditor() {
  const { locale } = useI18n()
  const [draft, dispatch] = React.useReducer(
    releaseDraftReducer,
    INITIAL_RELEASE_DRAFT
  )
  const logoState = useImageFile(draft.content.logoFile)
  const screenshotState = useImageFile(draft.content.screenshotFile)
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
      screenshotState.image,
    ]
  )
  const canExport =
    draft.content.productName.trim().length > 0 &&
    isImageStateExportable(logoState) &&
    isImageStateExportable(screenshotState) &&
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
