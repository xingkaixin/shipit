import { Icon } from "@/components/ui/icon"
import { Tick02Icon } from "@hugeicons/core-free-icons"

import { useI18n } from "@/i18n/i18n"
import type { MessageKey } from "@/i18n/messages"
import { cn } from "@/lib/utils"
import {
  PALETTE_REGISTRY,
  type PaletteDefinition,
  type PaletteId,
} from "@/video/palette-registry"

type PalettePickerProps = {
  selectedPaletteId: PaletteId
  onSelect: (paletteId: PaletteId) => void
}

export function PalettePicker({
  selectedPaletteId,
  onSelect,
}: PalettePickerProps) {
  const { t } = useI18n()

  return (
    <div className="grid grid-cols-4 gap-2">
      {PALETTE_REGISTRY.map((palette) => {
        const isSelected = palette.id === selectedPaletteId

        return (
          <button
            key={palette.id}
            type="button"
            aria-pressed={isSelected}
            title={t(paletteNameKey(palette.id))}
            className={cn(
              "group relative block rounded-lg p-0.5 transition-[box-shadow,transform] duration-150 ease-[var(--ease-out)] outline-none focus-visible:ring-3 focus-visible:ring-ring/30 active:scale-[0.96]",
              isSelected
                ? "shadow-[0_0_0_2px_var(--foreground)]"
                : "shadow-[0_0_0_1px_var(--border)] hover:shadow-[0_0_0_1px_color-mix(in_oklch,var(--foreground),transparent_60%)]"
            )}
            onClick={() => onSelect(palette.id)}
          >
            <span className="sr-only">{t(paletteNameKey(palette.id))}</span>
            <PaletteChip palette={palette} isSelected={isSelected} />
          </button>
        )
      })}
    </div>
  )
}

/** A miniature of the release frame: surface card, title bar, accent pill. */
function PaletteChip({
  palette,
  isSelected,
}: {
  palette: PaletteDefinition
  isSelected: boolean
}) {
  return (
    <span
      aria-hidden="true"
      className="relative flex aspect-[4/3] flex-col items-center justify-center gap-1 overflow-hidden rounded-[7px]"
      style={{ backgroundColor: palette.background }}
    >
      <span
        className="size-3 rounded-[3px]"
        style={{
          backgroundColor: palette.surface,
          boxShadow: `0 0 0 1px ${palette.foreground}22`,
        }}
      />
      <span
        className="h-[3px] w-6 rounded-full"
        style={{ backgroundColor: palette.foreground }}
      />
      <span
        className="h-[5px] w-3.5 rounded-full"
        style={{ backgroundColor: palette.accents[0] }}
      />
      {isSelected ? (
        <span
          className="absolute top-1 right-1 flex size-3.5 items-center justify-center rounded-full"
          style={{
            backgroundColor: palette.accents[0],
            color: palette.background,
          }}
        >
          <Icon icon={Tick02Icon} className="size-2.5" strokeWidth={3} />
        </span>
      ) : null}
    </span>
  )
}

export function paletteNameKey(paletteId: PaletteId): MessageKey {
  return `palette.${paletteId}`
}
