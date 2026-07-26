import type * as React from "react"
import {
  Moon02Icon,
  PaintBoardIcon,
  Sun03Icon,
  TextFontIcon,
} from "@hugeicons/core-free-icons"

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
import type { ReleaseDraftAction } from "@/state/release-draft-reducer"
import { FONT_REGISTRY, fontById, isFontId } from "@/video/font-registry"
import {
  isLogoTreatment,
  type LogoTreatment,
  type ReleaseDraft,
} from "@/video/release-video"
import type { ThemeTone } from "@/video/template-registry"

type StyleSettingsProps = {
  draft: ReleaseDraft
  dispatch: React.Dispatch<ReleaseDraftAction>
}

export function StyleSettings({ draft, dispatch }: StyleSettingsProps) {
  const { style } = draft
  const selectedFont = fontById(style.titleFontId)
  const customTitleColor =
    style.titleColor.mode === "custom" ? style.titleColor.value : "#FFFFFF"

  return (
    <div className="space-y-7">
      <SettingsSection
        title="主题明暗"
        description="模板决定动效，明暗主题只替换配色。"
      >
        <div className="grid grid-cols-2 gap-2">
          <ToneButton
            tone="dark"
            isSelected={style.themeTone === "dark"}
            onSelect={(tone) => {
              dispatch({ type: "set-theme-tone", value: tone })
            }}
          />
          <ToneButton
            tone="light"
            isSelected={style.themeTone === "light"}
            onSelect={(tone) => {
              dispatch({ type: "set-theme-tone", value: tone })
            }}
          />
        </div>
      </SettingsSection>

      <SettingsSection title="动效模板">
        <TemplatePicker
          selectedTemplateId={style.templateId}
          themeTone={style.themeTone}
          onSelect={(templateId) => {
            dispatch({ type: "set-template", value: templateId })
          }}
        />
      </SettingsSection>

      <SettingsSection title="Logo 外观">
        <Select
          value={style.logoTreatment}
          onValueChange={(value) => {
            if (isLogoTreatment(value)) {
              dispatch({ type: "set-logo-treatment", value })
            }
          }}
        >
          <SelectTrigger className="w-full">
            <SelectValue>{logoTreatmentLabel(style.logoTreatment)}</SelectValue>
          </SelectTrigger>
          <SelectContent alignItemWithTrigger={false}>
            <SelectItem value="plain">纯净 · 不加外框</SelectItem>
            <SelectItem value="card">卡片 · 边框底板</SelectItem>
            <SelectItem value="card-glow">高光卡片 · 边框与光晕</SelectItem>
          </SelectContent>
        </Select>
      </SettingsSection>

      <SettingsSection
        title="标题字体"
        description={`${selectedFont.name} · ${selectedFont.category}`}
      >
        <Label htmlFor="title-font">
          <Icon icon={TextFontIcon} className="size-3.5" />
          字体家族
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

      <SettingsSection title="品牌与标题颜色">
        <div className="flex items-center gap-3">
          <ColorInput
            id="accent-color"
            label="强调色"
            value={style.accentColor}
            onChange={(value) => {
              dispatch({ type: "set-accent-color", value })
            }}
          />
          <div className="min-w-0 flex-1">
            <Label htmlFor="accent-color" className="mb-1">
              <Icon icon={PaintBoardIcon} className="size-3.5" />
              强调色
            </Label>
            <p className="font-mono text-xs text-muted-foreground uppercase">
              {style.accentColor}
            </p>
          </div>
        </div>

        <div className="space-y-2 pt-1">
          <Label htmlFor="custom-title-color">标题颜色</Label>
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
              跟随模板
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
              自定义
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

function logoTreatmentLabel(treatment: LogoTreatment): string {
  switch (treatment) {
    case "plain":
      return "纯净 · 不加外框"
    case "card":
      return "卡片 · 边框底板"
    case "card-glow":
      return "高光卡片 · 边框与光晕"
  }
}

type ToneButtonProps = {
  tone: ThemeTone
  isSelected: boolean
  onSelect: (tone: ThemeTone) => void
}

function ToneButton({ tone, isSelected, onSelect }: ToneButtonProps) {
  const icon = tone === "dark" ? Moon02Icon : Sun03Icon
  const label = tone === "dark" ? "暗色主题" : "亮色主题"

  return (
    <button
      type="button"
      aria-pressed={isSelected}
      className={cn(
        "flex h-11 items-center justify-center gap-2 rounded-[10px] border text-sm font-semibold transition-[color,background-color,border-color,box-shadow,transform] duration-150 ease-[var(--ease-out)] outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/20 active:scale-[0.98]",
        isSelected
          ? "border-foreground bg-foreground text-background"
          : "border-border bg-card hover:border-foreground/20 hover:bg-muted"
      )}
      onClick={() => onSelect(tone)}
    >
      <Icon icon={icon} className="size-4" />
      {label}
    </button>
  )
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
