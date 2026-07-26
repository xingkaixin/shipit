import type * as React from "react"

import { Label } from "@/components/ui/label"
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
  const customTitleColor =
    style.titleColor.mode === "custom" ? style.titleColor.value : "#FFFFFF"

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

      <div className="space-y-2">
        <Label htmlFor="custom-title-color">
          {t("style.color.titleColor")}
        </Label>
        <div className="grid grid-cols-2 gap-2">
          <OptionButton
            isSelected={style.titleColor.mode === "template"}
            className="h-10"
            onClick={() => {
              dispatch({ type: "use-template-title-color" })
            }}
          >
            {t("style.color.theme")}
          </OptionButton>
          <label
            className={cn(
              "flex h-10 cursor-pointer items-center justify-center gap-2 rounded-[10px] border px-3 text-sm font-semibold transition-[color,background-color,border-color,transform] duration-150 ease-[var(--ease-out)] focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/20 active:scale-[0.98]",
              style.titleColor.mode === "custom"
                ? "border-foreground bg-foreground text-background"
                : "border-border bg-card hover:border-foreground/20 hover:bg-muted"
            )}
          >
            <span
              className="size-3.5 shrink-0 rounded-full shadow-[inset_0_0_0_1px_rgb(0_0_0/0.12)]"
              style={{ backgroundColor: customTitleColor }}
            />
            {t("style.color.custom")}
            <input
              id="custom-title-color"
              name="titleColor"
              type="color"
              className="sr-only"
              value={customTitleColor}
              onChange={(event) => {
                dispatch({
                  type: "set-custom-title-color",
                  value: event.target.value,
                })
              }}
            />
          </label>
        </div>
      </div>

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
