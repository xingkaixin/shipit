import type * as React from "react"

import { ColorInput } from "@/components/editor/ColorInput"
import { OptionButton } from "@/components/ui/option-button"
import { useI18n } from "@/i18n/i18n"
import type { MessageKey } from "@/i18n/messages"
import { cn } from "@/lib/utils"
import type { ReleaseDraftAction } from "@/state/release-draft-reducer"
import { FONT_REGISTRY, type FontId } from "@/video/font-registry"
import {
  LOGO_TREATMENTS,
  type LogoTreatment,
  type ReleaseStyle,
} from "@/video/release-video"

type TypeSettingsProps = {
  style: ReleaseStyle
  dispatch: React.Dispatch<ReleaseDraftAction>
}

export function TypeSettings({ style, dispatch }: TypeSettingsProps) {
  const { t } = useI18n()

  return (
    <div className="space-y-4">
      <fieldset>
        <legend className="mb-2 text-[12px] leading-none font-semibold text-foreground/85">
          {t("style.font.family")}
        </legend>
        <div className="grid grid-cols-2 gap-2">
          {FONT_REGISTRY.map((font) => (
            <OptionButton
              key={font.id}
              isSelected={style.titleFontId === font.id}
              className="h-14 flex-col items-start justify-center gap-0.5 px-3 text-left"
              onClick={() => {
                dispatch({ type: "set-title-font", value: font.id })
              }}
            >
              <span
                className="w-full truncate text-[15px] leading-tight font-semibold"
                style={{ fontFamily: font.family }}
              >
                {font.name}
              </span>
              <span
                className={cn(
                  "w-full truncate text-[10px] leading-tight font-medium",
                  style.titleFontId === font.id
                    ? "text-background/65"
                    : "text-muted-foreground"
                )}
              >
                {t(fontCategoryKey(font.id))}
              </span>
            </OptionButton>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="mb-2 text-[12px] leading-none font-semibold text-foreground/85">
          {t("style.color.titleColor")}
        </legend>
        <div className="grid grid-cols-2 gap-2">
          <OptionButton
            isSelected={!style.titleColor.useCustom}
            className="h-10"
            onClick={() => {
              dispatch({ type: "use-custom-title-color", value: false })
            }}
          >
            {t("style.color.theme")}
          </OptionButton>
          <OptionButton
            isSelected={style.titleColor.useCustom}
            className="h-10"
            onClick={() => {
              dispatch({ type: "use-custom-title-color", value: true })
            }}
          >
            {t("style.color.custom")}
          </OptionButton>
        </div>
        {style.titleColor.useCustom ? (
          <ColorInput
            id="custom-title-color"
            label={t("style.color.titleColor")}
            className="mt-2"
            value={style.titleColor.value}
            onChange={(value) => {
              dispatch({ type: "set-custom-title-color", value })
            }}
          />
        ) : null}
      </fieldset>

      <fieldset>
        <legend className="mb-2 text-[12px] leading-none font-semibold text-foreground/85">
          {t("style.logo.title")}
        </legend>
        <div className="grid grid-cols-3 gap-2">
          {LOGO_TREATMENTS.map((treatment) => (
            <OptionButton
              key={treatment}
              isSelected={style.logoTreatment === treatment}
              className="h-10 text-[13px]"
              onClick={() => {
                dispatch({ type: "set-logo-treatment", value: treatment })
              }}
            >
              {t(logoTreatmentKey(treatment))}
            </OptionButton>
          ))}
        </div>
      </fieldset>
    </div>
  )
}

function fontCategoryKey(fontId: FontId): MessageKey {
  return `font.category.${fontId}`
}

function logoTreatmentKey(treatment: LogoTreatment): MessageKey {
  return `style.logo.${treatment}`
}
