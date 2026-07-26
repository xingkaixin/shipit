import * as React from "react"

import { ReleaseSidebar } from "@/components/editor/ReleaseSidebar"
import { VideoPreview } from "@/components/editor/VideoPreview"
import { isLogoStateExportable, useLogoImage } from "@/hooks/use-logo-image"
import { useOutputCapability } from "@/hooks/use-output-capability"
import {
  INITIAL_RELEASE_DRAFT,
  releaseDraftReducer,
} from "@/state/release-draft-reducer"
import type { ReleaseComposition } from "@/video/release-video"

export function ReleaseEditor() {
  const [draft, dispatch] = React.useReducer(
    releaseDraftReducer,
    INITIAL_RELEASE_DRAFT
  )
  const logoState = useLogoImage(draft.content.logoFile)
  const outputCapability = useOutputCapability(draft.output)

  const composition = React.useMemo<ReleaseComposition>(
    () => ({
      content: {
        productName: draft.content.productName,
        version: draft.content.version,
        detail: draft.content.detail,
        logoImage: logoState.image,
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
      logoState.image,
    ]
  )
  const canExport =
    draft.content.productName.trim().length > 0 &&
    isLogoStateExportable(logoState) &&
    outputCapability.status === "supported"

  return (
    <main
      id="release-editor"
      className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[23rem_minmax(0,1fr)] lg:overflow-hidden"
    >
      <ReleaseSidebar
        draft={draft}
        logoState={logoState}
        outputCapability={outputCapability}
        dispatch={dispatch}
      />
      <VideoPreview composition={composition} canExport={canExport} />
    </main>
  )
}
