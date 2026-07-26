import type * as React from "react"

import { AccentField } from "@/components/editor/AccentField"
import { PalettePicker } from "@/components/editor/PalettePicker"
import type { ReleaseDraftAction } from "@/state/release-draft-reducer"
import type { PaletteDefinition } from "@/video/palette-registry"
import type { ReleaseStyle } from "@/video/release-video"

type ThemeSettingsProps = {
  style: ReleaseStyle
  palette: PaletteDefinition
  dispatch: React.Dispatch<ReleaseDraftAction>
}

export function ThemeSettings({
  style,
  palette,
  dispatch,
}: ThemeSettingsProps) {
  return (
    <div className="space-y-4">
      <PalettePicker
        selectedPaletteId={style.paletteId}
        onSelect={(paletteId) => {
          dispatch({ type: "set-palette", value: paletteId })
        }}
      />
      <AccentField
        palette={palette}
        value={style.accentColor}
        onChange={(value) => {
          dispatch({ type: "set-accent-color", value })
        }}
      />
    </div>
  )
}
