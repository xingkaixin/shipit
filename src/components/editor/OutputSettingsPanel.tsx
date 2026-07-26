import type * as React from "react"
import {
  Alert02Icon,
  CheckmarkCircle02Icon,
  ClapperboardIcon,
  Loading03Icon,
  RectangleHorizontal,
  RectangleVertical,
} from "@hugeicons/core-free-icons"

import { SettingsSection } from "@/components/editor/SettingsSection"
import { Icon } from "@/components/ui/icon"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { OutputCapabilityState } from "@/hooks/use-output-capability"
import { useI18n } from "@/i18n/i18n"
import { cn } from "@/lib/utils"
import type { ReleaseDraftAction } from "@/state/release-draft-reducer"
import {
  FRAME_RATES,
  isFrameRate,
  isResolution,
  outputDimensions,
  type AspectRatio,
  type FrameRate,
} from "@/video/output-settings"
import {
  VIDEO_DURATION_SECONDS,
  type ReleaseDraft,
} from "@/video/release-video"

type OutputSettingsPanelProps = {
  draft: ReleaseDraft
  outputCapability: OutputCapabilityState
  dispatch: React.Dispatch<ReleaseDraftAction>
}

export function OutputSettingsPanel({
  draft,
  outputCapability,
  dispatch,
}: OutputSettingsPanelProps) {
  const { t } = useI18n()
  const { output } = draft
  const dimensions = outputDimensions(output.aspectRatio, output.resolution)
  const isMaximumLoad = output.resolution === "4k" && output.frameRate === 60
  const usesMemoryFallback =
    output.resolution === "4k" &&
    outputCapability.status === "supported" &&
    outputCapability.storage === "memory"

  return (
    <div className="space-y-7">
      <SettingsSection
        title={t("output.aspect.title")}
        description={t("output.aspect.description")}
      >
        <div className="grid grid-cols-2 gap-2">
          <AspectButton
            aspectRatio="landscape"
            isSelected={output.aspectRatio === "landscape"}
            onSelect={(value) => {
              dispatch({ type: "set-aspect-ratio", value })
            }}
          />
          <AspectButton
            aspectRatio="portrait"
            isSelected={output.aspectRatio === "portrait"}
            onSelect={(value) => {
              dispatch({ type: "set-aspect-ratio", value })
            }}
          />
        </div>
      </SettingsSection>

      <SettingsSection title={t("output.resolution.title")}>
        <Label htmlFor="resolution">{t("output.resolution.label")}</Label>
        <Select
          value={output.resolution}
          onValueChange={(value) => {
            if (isResolution(value)) {
              dispatch({ type: "set-resolution", value })
            }
          }}
        >
          <SelectTrigger id="resolution" className="w-full">
            <SelectValue>
              {output.resolution === "4k" ? "4K" : "1080p"}
            </SelectValue>
          </SelectTrigger>
          <SelectContent alignItemWithTrigger={false}>
            <SelectItem value="1080p">
              {t("output.resolution.recommended")}
            </SelectItem>
            <SelectItem value="4k">{t("output.resolution.4k")}</SelectItem>
          </SelectContent>
        </Select>
        <p className="font-mono text-xs text-muted-foreground">
          {dimensions.width} × {dimensions.height}
        </p>
      </SettingsSection>

      <SettingsSection title={t("output.frameRate.title")}>
        <div className="grid grid-cols-2 gap-2">
          {FRAME_RATES.map((frameRate) => (
            <FrameRateButton
              key={frameRate}
              frameRate={frameRate}
              isSelected={output.frameRate === frameRate}
              onSelect={(value) => {
                if (isFrameRate(value)) {
                  dispatch({ type: "set-frame-rate", value })
                }
              }}
            />
          ))}
        </div>
      </SettingsSection>

      <SettingsSection
        title={t("output.capability.title")}
        description={t("output.summary", {
          seconds: VIDEO_DURATION_SECONDS,
          width: dimensions.width,
          height: dimensions.height,
          frameRate: output.frameRate,
        })}
      >
        <CapabilityMessage state={outputCapability} />
        {usesMemoryFallback ? (
          <div className="rounded-[10px] border border-amber-500/30 bg-amber-500/10 p-3 text-xs leading-5 text-amber-800 dark:text-amber-300">
            {t("output.warning.memory")}
          </div>
        ) : null}
        {isMaximumLoad ? (
          <div className="rounded-[10px] border border-amber-500/30 bg-amber-500/10 p-3 text-xs leading-5 text-amber-800 dark:text-amber-300">
            {t("output.warning.maximum")}
          </div>
        ) : null}
      </SettingsSection>
    </div>
  )
}

type AspectButtonProps = {
  aspectRatio: AspectRatio
  isSelected: boolean
  onSelect: (aspectRatio: AspectRatio) => void
}

function AspectButton({
  aspectRatio,
  isSelected,
  onSelect,
}: AspectButtonProps) {
  const { t } = useI18n()
  const icon =
    aspectRatio === "landscape" ? RectangleHorizontal : RectangleVertical
  const label =
    aspectRatio === "landscape"
      ? t("output.aspect.landscape")
      : t("output.aspect.portrait")

  return (
    <button
      type="button"
      aria-pressed={isSelected}
      className={cn(
        "flex h-[68px] flex-col items-center justify-center gap-1.5 rounded-[10px] border text-xs font-semibold transition-[color,background-color,border-color,box-shadow,transform] duration-150 ease-[var(--ease-out)] outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/20 active:scale-[0.98]",
        isSelected
          ? "border-foreground bg-foreground text-background"
          : "border-border bg-card hover:border-foreground/20 hover:bg-muted"
      )}
      onClick={() => onSelect(aspectRatio)}
    >
      <Icon icon={icon} className="size-5" />
      {label}
    </button>
  )
}

type FrameRateButtonProps = {
  frameRate: FrameRate
  isSelected: boolean
  onSelect: (frameRate: FrameRate) => void
}

function FrameRateButton({
  frameRate,
  isSelected,
  onSelect,
}: FrameRateButtonProps) {
  return (
    <button
      type="button"
      aria-pressed={isSelected}
      className={cn(
        "flex h-12 items-center justify-center gap-2 rounded-[10px] border text-sm font-semibold transition-[color,background-color,border-color,box-shadow,transform] duration-150 ease-[var(--ease-out)] outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/20 active:scale-[0.98]",
        isSelected
          ? "border-foreground bg-foreground text-background"
          : "border-border bg-card hover:border-foreground/20 hover:bg-muted"
      )}
      onClick={() => onSelect(frameRate)}
    >
      <Icon icon={ClapperboardIcon} className="size-4" />
      {frameRate} FPS
    </button>
  )
}

function CapabilityMessage({ state }: { state: OutputCapabilityState }) {
  const { t } = useI18n()

  switch (state.status) {
    case "checking":
      return (
        <div
          className="flex items-center gap-2 text-xs text-muted-foreground"
          aria-live="polite"
        >
          <Icon icon={Loading03Icon} className="size-4 animate-spin" />
          {t("output.capability.checking")}
        </div>
      )
    case "supported":
      return (
        <div
          className="flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-400"
          aria-live="polite"
        >
          <Icon icon={CheckmarkCircle02Icon} className="size-4" />
          {state.storage === "file"
            ? t("output.capability.file")
            : t("output.capability.memory")}
        </div>
      )
    case "unsupported":
      return (
        <div
          className="flex items-center gap-2 text-xs text-destructive"
          aria-live="polite"
        >
          <Icon icon={Alert02Icon} className="size-4" />
          {t("output.capability.unsupported")}
        </div>
      )
    case "failed":
      return (
        <div
          className="flex items-start gap-2 text-xs text-destructive"
          aria-live="polite"
        >
          <Icon icon={Alert02Icon} className="mt-0.5 size-4 shrink-0" />
          {t("output.capability.failed")}
        </div>
      )
  }
}
