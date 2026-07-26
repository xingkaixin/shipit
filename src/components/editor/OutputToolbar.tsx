import type * as React from "react"
import { Alert02Icon, Loading03Icon } from "@hugeicons/core-free-icons"

import { Icon } from "@/components/ui/icon"
import { SegmentedControl } from "@/components/ui/segmented-control"
import type { OutputCapabilityState } from "@/hooks/use-output-capability"
import { useI18n } from "@/i18n/i18n"
import type { ReleaseDraftAction } from "@/state/release-draft-reducer"
import {
  isAspectRatio,
  isFrameRate,
  isResolution,
  outputDimensions,
} from "@/video/output-settings"
import type { OutputSettings } from "@/video/release-video"

type OutputToolbarProps = {
  output: OutputSettings
  capability: OutputCapabilityState
  dispatch: React.Dispatch<ReleaseDraftAction>
}

export function OutputToolbar({
  output,
  capability,
  dispatch,
}: OutputToolbarProps) {
  const { t } = useI18n()
  const dimensions = outputDimensions(output.aspectRatio, output.resolution)

  return (
    <div className="flex shrink-0 flex-wrap items-center gap-x-3 gap-y-2 border-b bg-background/70 px-4 py-3.5 sm:px-6">
      <SegmentedControl
        label={t("output.aspect.title")}
        value={output.aspectRatio}
        options={[
          {
            value: "landscape",
            label: t("output.aspect.landscape"),
            text: "16:9",
          },
          {
            value: "portrait",
            label: t("output.aspect.portrait"),
            text: "9:16",
          },
        ]}
        onChange={(value) => {
          if (isAspectRatio(value)) {
            dispatch({ type: "set-aspect-ratio", value })
          }
        }}
      />
      <SegmentedControl
        label={t("output.resolution.title")}
        value={output.resolution}
        options={[
          { value: "1080p", label: "1080p" },
          { value: "4k", label: "4K" },
        ]}
        onChange={(value) => {
          if (isResolution(value)) {
            dispatch({ type: "set-resolution", value })
          }
        }}
      />
      <SegmentedControl
        label={t("output.frameRate.title")}
        value={String(output.frameRate)}
        options={[
          { value: "30", label: "30 FPS" },
          { value: "60", label: "60 FPS" },
        ]}
        onChange={(value) => {
          const frameRate = Number(value)
          if (isFrameRate(frameRate)) {
            dispatch({ type: "set-frame-rate", value: frameRate })
          }
        }}
      />
      <div className="ml-auto flex items-center gap-3">
        <CapabilityNotice state={capability} />
        <span className="font-mono text-[11px] text-muted-foreground tabular-nums">
          {dimensions.width}×{dimensions.height}
        </span>
      </div>
    </div>
  )
}

/** Silent while the browser can encode the selection: an enabled export button says it better. */
function CapabilityNotice({ state }: { state: OutputCapabilityState }) {
  const { t } = useI18n()

  if (state.status === "supported") {
    return null
  }

  if (state.status === "checking") {
    return (
      <span
        className="flex items-center gap-1.5 text-[11px] text-muted-foreground"
        aria-live="polite"
      >
        <Icon icon={Loading03Icon} className="size-3.5 animate-spin" />
        {t("output.capability.checking")}
      </span>
    )
  }

  return (
    <span
      className="flex items-center gap-1.5 text-[11px] font-medium text-destructive"
      aria-live="polite"
    >
      <Icon icon={Alert02Icon} className="size-3.5 shrink-0" />
      {state.status === "unsupported"
        ? t("output.capability.unsupported")
        : t("output.capability.failed")}
    </span>
  )
}
