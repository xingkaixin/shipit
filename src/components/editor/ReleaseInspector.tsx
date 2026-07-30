import type * as React from "react"
import {
  ColorsIcon,
  Film01Icon,
  ImageCompositionIcon,
  PackageIcon,
  TextFontIcon,
} from "@hugeicons/core-free-icons"

import { ContentSettings } from "@/components/editor/ContentSettings"
import { InspectorSection } from "@/components/editor/InspectorSection"
import { paletteNameKey } from "@/components/editor/PalettePicker"
import { ProductShotSettings } from "@/components/editor/ProductShotSettings"
import { BackgroundPicker } from "@/components/editor/BackgroundPicker"
import { ThemeSettings } from "@/components/editor/ThemeSettings"
import { TypeSettings } from "@/components/editor/TypeSettings"
import type { ImageFileState } from "@/hooks/use-image-file"
import { useI18n } from "@/i18n/i18n"
import type { ReleaseDraftAction } from "@/state/release-draft-reducer"
import { paletteById } from "@/video/palette-registry"
import type { ReleaseComposition, ReleaseDraft } from "@/video/release-video"

type ReleaseInspectorProps = {
  draft: ReleaseDraft
  composition: ReleaseComposition
  logoState: ImageFileState
  screenshotState: ImageFileState
  dispatch: React.Dispatch<ReleaseDraftAction>
}

export function ReleaseInspector({
  draft,
  composition,
  logoState,
  screenshotState,
  dispatch,
}: ReleaseInspectorProps) {
  const { t } = useI18n()
  const palette = paletteById(draft.style.paletteId)

  return (
    <aside className="flex min-h-0 scrollbar-thin flex-col overscroll-contain border-b bg-background lg:border-r lg:border-b-0 desk:overflow-y-auto">
      <InspectorSection icon={PackageIcon} title={t("inspector.content")}>
        <ContentSettings
          draft={draft}
          logoState={logoState}
          dispatch={dispatch}
        />
      </InspectorSection>

      <InspectorSection
        icon={ImageCompositionIcon}
        title={t("inspector.productShot")}
        hint={t("productShot.hint")}
      >
        <ProductShotSettings
          draft={draft}
          screenshotState={screenshotState}
          dispatch={dispatch}
        />
      </InspectorSection>

      <InspectorSection icon={Film01Icon} title={t("inspector.background")}>
        <BackgroundPicker
          composition={composition}
          onSelect={(backgroundId) => {
            dispatch({ type: "set-background", value: backgroundId })
          }}
        />
      </InspectorSection>

      <InspectorSection
        icon={ColorsIcon}
        title={t("inspector.theme")}
        hint={t(paletteNameKey(palette.id))}
      >
        <ThemeSettings
          style={draft.style}
          palette={palette}
          dispatch={dispatch}
        />
      </InspectorSection>

      <InspectorSection icon={TextFontIcon} title={t("inspector.type")}>
        <TypeSettings style={draft.style} dispatch={dispatch} />
      </InspectorSection>
    </aside>
  )
}
