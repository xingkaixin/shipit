import type * as React from "react"
import { PaintBoardIcon, TextFontIcon } from "@hugeicons/core-free-icons"

import {
  PalettePicker,
  paletteNameKey,
} from "@/components/editor/PalettePicker"
import { SettingsSection } from "@/components/editor/SettingsSection"
import { TemplatePicker } from "@/components/editor/TemplatePicker"
import { Button } from "@/components/ui/button"
import { Icon } from "@/components/ui/icon"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { useI18n } from "@/i18n/i18n"
import type { MessageKey } from "@/i18n/messages"
import type { ReleaseDraftAction } from "@/state/release-draft-reducer"
import { FONT_REGISTRY, fontById, isFontId } from "@/video/font-registry"
import { paletteById } from "@/video/palette-registry"
import {
  isLogoTreatment,
  type LogoTreatment,
  type ReleaseDraft,
} from "@/video/release-video"

type StyleSettingsProps = {
  draft: ReleaseDraft
  dispatch: React.Dispatch<ReleaseDraftAction>
}

export function StyleSettings({ draft, dispatch }: StyleSettingsProps) {
  const { t } = useI18n()
  const { style } = draft
  const palette = paletteById(style.paletteId)
  const selectedFont = fontById(style.titleFontId)
  const customTitleColor =
    style.titleColor.mode === "custom" ? style.titleColor.value : "#FFFFFF"

  return (
    <div className="space-y-7">
      <SettingsSection
        title={t("style.palette.title")}
        description={`${t(paletteNameKey(palette.id))} · ${t("style.palette.description")}`}
      >
        <PalettePicker
          selectedPaletteId={style.paletteId}
          onSelect={(paletteId) => {
            dispatch({ type: "set-palette", value: paletteId })
          }}
        />
      </SettingsSection>

      <SettingsSection title={t("style.template.title")}>
        <TemplatePicker
          selectedTemplateId={style.templateId}
          palette={palette}
          onSelect={(templateId) => {
            dispatch({ type: "set-template", value: templateId })
          }}
        />
      </SettingsSection>

      <SettingsSection title={t("style.logo.title")}>
        <Select
          value={style.logoTreatment}
          onValueChange={(value) => {
            if (isLogoTreatment(value)) {
              dispatch({ type: "set-logo-treatment", value })
            }
          }}
        >
          <SelectTrigger className="w-full">
            <SelectValue>
              {logoTreatmentLabel(style.logoTreatment, t)}
            </SelectValue>
          </SelectTrigger>
          <SelectContent alignItemWithTrigger={false}>
            <SelectItem value="plain">{t("style.logo.plain")}</SelectItem>
            <SelectItem value="card">{t("style.logo.card")}</SelectItem>
            <SelectItem value="card-glow">
              {t("style.logo.cardGlow")}
            </SelectItem>
          </SelectContent>
        </Select>
      </SettingsSection>

      <SettingsSection
        title={t("style.font.title")}
        description={`${selectedFont.name} · ${t(fontCategoryKey(selectedFont.id))}`}
      >
        <Label htmlFor="title-font">
          <Icon icon={TextFontIcon} className="size-3.5" />
          {t("style.font.family")}
        </Label>
        <Select
          value={style.titleFontId}
          onValueChange={(value) => {
            if (isFontId(value)) {
              dispatch({ type: "set-title-font", value })
            }
          }}
        >
          <SelectTrigger id="title-font" className="w-full">
            <SelectValue>{selectedFont.name}</SelectValue>
          </SelectTrigger>
          <SelectContent alignItemWithTrigger={false}>
            {FONT_REGISTRY.map((font) => (
              <SelectItem key={font.id} value={font.id}>
                {font.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </SettingsSection>

      <SettingsSection title={t("style.color.title")}>
        <div className="flex items-center gap-3">
          <ColorInput
            id="accent-color"
            label={t("style.color.accent")}
            value={style.accentColor}
            onChange={(value) => {
              dispatch({ type: "set-accent-color", value })
            }}
          />
          <div className="min-w-0 flex-1">
            <Label htmlFor="accent-color" className="mb-1">
              <Icon icon={PaintBoardIcon} className="size-3.5" />
              {t("style.color.accent")}
            </Label>
            <p className="font-mono text-xs text-muted-foreground uppercase">
              {style.accentColor}
            </p>
          </div>
        </div>

        <div className="space-y-2 pt-1">
          <Label htmlFor="custom-title-color">
            {t("style.color.titleColor")}
          </Label>
          <div className="grid grid-cols-2 gap-2">
            <Button
              type="button"
              variant={
                style.titleColor.mode === "template" ? "default" : "outline"
              }
              onClick={() => {
                dispatch({ type: "use-template-title-color" })
              }}
            >
              {t("style.color.template")}
            </Button>
            <label
              className={cn(
                "flex h-10 cursor-pointer items-center justify-center gap-2 rounded-[10px] border px-3 text-sm font-semibold transition-[color,background-color,border-color,box-shadow,transform] duration-150 ease-[var(--ease-out)] focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/20 active:scale-[0.98]",
                style.titleColor.mode === "custom"
                  ? "border-foreground bg-foreground text-background"
                  : "border-border bg-card hover:border-foreground/20 hover:bg-muted"
              )}
            >
              <span
                className="size-3.5 rounded-full border border-black/10"
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
      </SettingsSection>
    </div>
  )
}

function logoTreatmentLabel(
  treatment: LogoTreatment,
  t: (key: MessageKey) => string
): string {
  switch (treatment) {
    case "plain":
      return t("style.logo.plain")
    case "card":
      return t("style.logo.card")
    case "card-glow":
      return t("style.logo.cardGlow")
  }
}

function fontCategoryKey(
  fontId: (typeof FONT_REGISTRY)[number]["id"]
): MessageKey {
  return `font.category.${fontId}`
}

type ColorInputProps = {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
}

function ColorInput({ id, label, value, onChange }: ColorInputProps) {
  return (
    <label
      htmlFor={id}
      className="relative size-11 shrink-0 cursor-pointer overflow-hidden rounded-full border-4 border-background shadow-[0_0_0_1px_var(--border)] transition-[box-shadow,transform] duration-150 ease-[var(--ease-out)] focus-within:ring-3 focus-within:ring-ring/25 active:scale-[0.97]"
      style={{ backgroundColor: value }}
    >
      <span className="sr-only">{label}</span>
      <input
        id={id}
        name={id}
        type="color"
        className="absolute inset-0 size-full cursor-pointer opacity-0"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  )
}
