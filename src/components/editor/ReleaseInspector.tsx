import type * as React from "react"

import { ContentSettings } from "@/components/editor/ContentSettings"
import { paletteNameKey } from "@/components/editor/PalettePicker"
import { ProductShotSettings } from "@/components/editor/ProductShotSettings"
import { BackgroundPicker } from "@/components/editor/BackgroundPicker"
import { ThemeSettings } from "@/components/editor/ThemeSettings"
import { TypeSettings } from "@/components/editor/TypeSettings"
import {
  panelTitleKey,
  type InspectorPanelId,
} from "@/components/editor/inspector-panels"
import type { ImageFileState } from "@/hooks/use-image-file"
import { useI18n } from "@/i18n/i18n"
import type { ReleaseDraftAction } from "@/state/release-draft-reducer"
import { BACKGROUND_REGISTRY } from "@/video/background-registry"
import { paletteById } from "@/video/palette-registry"
import type { ReleaseComposition, ReleaseDraft } from "@/video/release-video"

type ReleaseInspectorProps = {
  activePanel: InspectorPanelId
  draft: ReleaseDraft
  composition: ReleaseComposition
  logoState: ImageFileState
  screenshotState: ImageFileState
  dispatch: React.Dispatch<ReleaseDraftAction>
}

export function ReleaseInspector({
  activePanel,
  draft,
  composition,
  logoState,
  screenshotState,
  dispatch,
}: ReleaseInspectorProps) {
  const { t } = useI18n()
  const palette = paletteById(draft.style.paletteId)

  return (
    <aside className="flex min-h-0 flex-col border-b bg-background wide:w-[19.75rem] wide:shrink-0 wide:border-r wide:border-b-0 xl:w-[21.5rem]">
      <div className="sticky top-0 z-10 flex min-h-[2.875rem] shrink-0 items-center justify-between gap-3 border-b border-border/70 bg-background px-4 wide:static">
        <div className="flex min-w-0 flex-1 flex-wrap items-center justify-between gap-x-2 gap-y-1 py-2">
          <h2 className="truncate font-heading text-[13px] leading-none font-semibold tracking-[-0.01em]">
            {t(panelTitleKey(activePanel))}
          </h2>
          <span className="font-mono text-[10px] tracking-[0.04em] text-muted-foreground">
            {activePanel === "theme"
              ? t(paletteNameKey(palette.id))
              : t(`inspector.${activePanel}.meta`, {
                  count: BACKGROUND_REGISTRY.length,
                })}
          </span>
        </div>
        <a
          href="#film-preview"
          className="inline-flex min-h-11 shrink-0 items-center text-xs font-medium underline underline-offset-4 focus-visible:rounded-sm focus-visible:ring-3 focus-visible:ring-ring/30 focus-visible:outline-none wide:hidden"
        >
          {t("preview.backToPreview")}
        </a>
      </div>
      <div className="min-h-0 flex-1 scrollbar-thin overscroll-contain p-4 wide:overflow-y-auto">
        {activePanel === "content" ? (
          <ContentSettings
            draft={draft}
            logoState={logoState}
            dispatch={dispatch}
          />
        ) : null}
        {activePanel === "productShot" ? (
          <ProductShotSettings
            draft={draft}
            screenshotState={screenshotState}
            dispatch={dispatch}
          />
        ) : null}
        {activePanel === "background" ? (
          <BackgroundPicker
            composition={composition}
            onSelect={(backgroundId) => {
              dispatch({ type: "set-background", value: backgroundId })
            }}
          />
        ) : null}
        {activePanel === "theme" ? (
          <ThemeSettings
            style={draft.style}
            palette={palette}
            dispatch={dispatch}
          />
        ) : null}
        {activePanel === "type" ? (
          <TypeSettings style={draft.style} dispatch={dispatch} />
        ) : null}
      </div>
    </aside>
  )
}
