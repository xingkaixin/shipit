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
import { cn } from "@/lib/utils"
import type { ReleaseDraftAction } from "@/state/release-draft-reducer"
import {
  FRAME_RATES,
  isFrameRate,
  isResolution,
  outputDimensions,
  outputSummary,
  type AspectRatio,
  type FrameRate,
} from "@/video/output-settings"
import type { ReleaseDraft } from "@/video/release-video"

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
        title="画面方向"
        description="竖屏采用独立构图，不会裁切横屏画面。"
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

      <SettingsSection title="清晰度">
        <Label htmlFor="resolution">导出分辨率</Label>
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
            <SelectItem value="1080p">1080p · 推荐</SelectItem>
            <SelectItem value="4k">4K · 更慢且占用更多内存</SelectItem>
          </SelectContent>
        </Select>
        <p className="font-mono text-xs text-muted-foreground">
          {dimensions.width} × {dimensions.height}
        </p>
      </SettingsSection>

      <SettingsSection title="帧率">
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
        title="浏览器能力"
        description={outputSummary(
          output.aspectRatio,
          output.resolution,
          output.frameRate
        )}
      >
        <CapabilityMessage state={outputCapability} />
        {usesMemoryFallback ? (
          <div className="rounded-[10px] border border-amber-500/30 bg-amber-500/10 p-3 text-xs leading-5 text-amber-800 dark:text-amber-300">
            当前浏览器不支持本地临时文件，4K
            将回退到内存导出；低内存设备建议改用 1080p。
          </div>
        ) : null}
        {isMaximumLoad ? (
          <div className="rounded-[10px] border border-amber-500/30 bg-amber-500/10 p-3 text-xs leading-5 text-amber-800 dark:text-amber-300">
            4K 60 FPS 的像素处理量约为 1080p 30 FPS 的 8
            倍，导出时间与内存占用会明显增加。
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
  const icon =
    aspectRatio === "landscape" ? RectangleHorizontal : RectangleVertical
  const label = aspectRatio === "landscape" ? "横屏 16:9" : "竖屏 9:16"

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
  switch (state.status) {
    case "checking":
      return (
        <div
          className="flex items-center gap-2 text-xs text-muted-foreground"
          aria-live="polite"
        >
          <Icon icon={Loading03Icon} className="size-4 animate-spin" />
          正在检查当前规格…
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
            ? "支持此规格，导出将使用浏览器本地临时文件"
            : "当前浏览器支持此输出规格"}
        </div>
      )
    case "unsupported":
      return (
        <div
          className="flex items-center gap-2 text-xs text-destructive"
          aria-live="polite"
        >
          <Icon icon={Alert02Icon} className="size-4" />
          当前浏览器不支持此规格，请降低分辨率
        </div>
      )
    case "failed":
      return (
        <div
          className="flex items-start gap-2 text-xs text-destructive"
          aria-live="polite"
        >
          <Icon icon={Alert02Icon} className="mt-0.5 size-4 shrink-0" />
          {state.message}
        </div>
      )
  }
}
