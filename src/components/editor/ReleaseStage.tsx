import * as React from "react"
import {
  Alert02Icon,
  CheckmarkCircle02Icon,
  CircleArrowReload01Icon,
  Download04Icon,
  Loading03Icon,
  PauseIcon,
  PlayIcon,
} from "@hugeicons/core-free-icons"

import { OutputToolbar } from "@/components/editor/OutputToolbar"
import { Button } from "@/components/ui/button"
import { Icon } from "@/components/ui/icon"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import type { OutputCapabilityState } from "@/hooks/use-output-capability"
import { useVideoExport, type VideoExportState } from "@/hooks/use-video-export"
import { useI18n } from "@/i18n/i18n"
import { cn } from "@/lib/utils"
import type { ReleaseDraftAction } from "@/state/release-draft-reducer"
import { fontById } from "@/video/font-registry"
import { outputDimensions, PREVIEW_DIMENSIONS } from "@/video/output-settings"
import { renderReleaseFrame } from "@/video/render-release-frame"
import {
  VIDEO_DURATION_SECONDS,
  type ReleaseComposition,
} from "@/video/release-video"

const PROGRESS_UPDATE_INTERVAL_MS = 80

type ReleaseStageProps = {
  composition: ReleaseComposition
  capability: OutputCapabilityState
  canExport: boolean
  dispatch: React.Dispatch<ReleaseDraftAction>
}

export function ReleaseStage({
  composition,
  capability,
  canExport,
  dispatch,
}: ReleaseStageProps) {
  const { t } = useI18n()
  const canvasReference = React.useRef<HTMLCanvasElement>(null)
  const timelineReference = React.useRef<HTMLInputElement>(null)
  const timeLabelReference = React.useRef<HTMLSpanElement>(null)
  const currentTimeReference = React.useRef(0)
  const loopStartedAtReference = React.useRef(performance.now())
  const [isPlaying, setIsPlaying] = React.useState(shouldAutoplayPreview)
  const {
    state: exportState,
    exportVideo,
    cancelExport,
  } = useVideoExport(composition)
  const isLandscape = composition.output.aspectRatio === "landscape"
  const previewDimensions = PREVIEW_DIMENSIONS[composition.output.aspectRatio]
  const drawFrame = React.useCallback(
    (time: number) => {
      const context = canvasReference.current?.getContext("2d", {
        alpha: false,
      })
      if (!context) {
        return
      }

      renderReleaseFrame(context, composition, time)
    },
    [composition]
  )

  const updatePlaybackControls = React.useCallback((time: number) => {
    if (timelineReference.current) {
      timelineReference.current.value = String(time)
      timelineReference.current.style.setProperty(
        "--timeline-progress",
        `${(time / VIDEO_DURATION_SECONDS) * 100}%`
      )
    }

    if (timeLabelReference.current) {
      timeLabelReference.current.textContent = `${time.toFixed(
        1
      )} / ${VIDEO_DURATION_SECONDS.toFixed(1)}s`
    }
  }, [])

  React.useEffect(() => {
    drawFrame(currentTimeReference.current)
  }, [drawFrame])

  React.useEffect(() => {
    let isCurrentFontRequest = true
    const title = composition.content.productName.trim() || "Untitled"
    const titleFont = fontById(composition.style.titleFontId)

    void Promise.all([
      document.fonts.load(`760 16px ${titleFont.family}`, title),
      document.fonts.load(
        '650 16px "Geist Variable", "Helvetica Neue", sans-serif',
        t("video.badge")
      ),
    ])
      .then(() => {
        if (isCurrentFontRequest) {
          drawFrame(currentTimeReference.current)
        }
      })
      .catch((error: unknown) => {
        console.error("[preview] Failed to load release font", error)
      })

    return () => {
      isCurrentFontRequest = false
    }
  }, [
    composition.content.productName,
    composition.style.titleFontId,
    drawFrame,
    t,
  ])

  React.useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)")
    const updateAutoplay = (event: MediaQueryListEvent) => {
      if (event.matches) {
        setIsPlaying(false)
      }
    }

    reducedMotion.addEventListener("change", updateAutoplay)
    return () => reducedMotion.removeEventListener("change", updateAutoplay)
  }, [])

  React.useEffect(() => {
    if (!isPlaying || exportState.status === "exporting") {
      return undefined
    }

    loopStartedAtReference.current =
      performance.now() - currentTimeReference.current * 1_000
    let animationFrameId = 0
    let lastProgressUpdate = 0

    const renderNextFrame = (now: number) => {
      const elapsedSeconds = (now - loopStartedAtReference.current) / 1_000
      const nextTime = Math.max(0, elapsedSeconds % VIDEO_DURATION_SECONDS)

      currentTimeReference.current = nextTime
      drawFrame(nextTime)

      if (now - lastProgressUpdate >= PROGRESS_UPDATE_INTERVAL_MS) {
        updatePlaybackControls(nextTime)
        lastProgressUpdate = now
      }

      animationFrameId = requestAnimationFrame(renderNextFrame)
    }

    animationFrameId = requestAnimationFrame(renderNextFrame)
    return () => cancelAnimationFrame(animationFrameId)
  }, [drawFrame, exportState.status, isPlaying, updatePlaybackControls])

  function togglePlayback() {
    if (!isPlaying) {
      loopStartedAtReference.current =
        performance.now() - currentTimeReference.current * 1_000
    }

    setIsPlaying((currentValue) => !currentValue)
  }

  function restartPlayback() {
    currentTimeReference.current = 0
    loopStartedAtReference.current = performance.now()
    updatePlaybackControls(0)
    drawFrame(0)
  }

  function seekVideo(event: React.ChangeEvent<HTMLInputElement>) {
    const nextTime = Number(event.target.value)
    currentTimeReference.current = nextTime
    loopStartedAtReference.current = performance.now() - nextTime * 1_000
    updatePlaybackControls(nextTime)
    drawFrame(nextTime)
  }

  return (
    <section className="order-first flex min-h-0 flex-col bg-workspace lg:order-none">
      <h2 className="sr-only">{t("preview.title")}</h2>

      <OutputToolbar
        output={composition.output}
        capability={capability}
        dispatch={dispatch}
      />

      <div className="flex min-h-0 flex-1 items-center justify-center p-4 sm:p-6 lg:p-8">
        <div
          className={cn(
            "preview-stage flex max-w-full min-w-0 flex-col rounded-[22px] bg-stage p-2 text-stage-foreground shadow-[0_24px_70px_color-mix(in_oklch,var(--stage),transparent_72%),inset_0_1px_0_color-mix(in_oklch,var(--stage-foreground),transparent_90%)] ring-1 ring-stage-foreground/8",
            isLandscape
              ? "w-full max-w-5xl desk:w-[min(100%,calc((100svh-var(--stage-chrome))*16/9))]"
              : "w-fit max-w-full"
          )}
        >
          <figure
            className={cn(
              "relative mx-auto overflow-hidden rounded-[16px] bg-[#0b0e0c] ring-1 ring-stage-foreground/8",
              isLandscape
                ? "aspect-video w-full"
                : "aspect-[9/16] h-[min(56vh,620px)] max-h-full max-w-full"
            )}
            aria-label={t("preview.figureLabel", {
              product:
                composition.content.productName || t("preview.unnamedProduct"),
            })}
          >
            <canvas
              ref={canvasReference}
              width={previewDimensions.width}
              height={previewDimensions.height}
              className="block size-full"
              aria-hidden="true"
            />
            {exportState.status === "exporting" ? (
              <output
                className="export-overlay absolute inset-0 flex items-center justify-center bg-stage/80 p-4"
                aria-live="polite"
              >
                <div className="w-full max-w-72 rounded-2xl border border-stage-foreground/12 bg-[#202420] p-5 text-stage-foreground shadow-[0_18px_50px_color-mix(in_oklch,var(--stage),transparent_28%)] transition-transform duration-200 ease-[var(--ease-out)]">
                  <div className="mb-3 flex items-center gap-2">
                    <Icon
                      icon={Loading03Icon}
                      className="size-4 animate-spin text-brand"
                    />
                    <span className="text-sm font-semibold">
                      {t("preview.generating")}
                    </span>
                    <span className="ml-auto font-mono text-xs text-stage-foreground/60 tabular-nums">
                      {Math.round(exportState.progress * 100)}%
                    </span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-stage-foreground/12">
                    <div
                      className="h-full origin-left rounded-full bg-brand transition-transform duration-150 ease-linear"
                      style={{
                        transform: `scaleX(${exportState.progress})`,
                      }}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-4 w-full border-stage-foreground/15 bg-transparent text-stage-foreground hover:bg-stage-foreground/10 hover:text-stage-foreground"
                    onClick={cancelExport}
                  >
                    {t("preview.cancelExport")}
                  </Button>
                </div>
              </output>
            ) : null}
          </figure>

          <div className="flex items-center gap-2 px-1 py-1.5 pt-2.5">
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="border border-stage-foreground/10 bg-stage-foreground/[0.055] text-stage-foreground hover:bg-stage-foreground/12 hover:text-stage-foreground"
                    aria-label={
                      isPlaying
                        ? t("preview.pausePreview")
                        : t("preview.playPreview")
                    }
                    onClick={togglePlayback}
                  />
                }
              >
                <Icon icon={isPlaying ? PauseIcon : PlayIcon} />
              </TooltipTrigger>
              <TooltipContent>
                {isPlaying ? t("preview.pause") : t("preview.play")}
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="border border-stage-foreground/10 bg-stage-foreground/[0.055] text-stage-foreground hover:bg-stage-foreground/12 hover:text-stage-foreground"
                    aria-label={t("preview.restart")}
                    onClick={restartPlayback}
                  />
                }
              >
                <Icon icon={CircleArrowReload01Icon} />
              </TooltipTrigger>
              <TooltipContent>{t("preview.restart")}</TooltipContent>
            </Tooltip>

            <input
              ref={timelineReference}
              type="range"
              name="videoTime"
              aria-label={t("preview.timeline")}
              className="h-11 min-w-0 flex-1 cursor-pointer appearance-none rounded-full focus-visible:ring-3 focus-visible:ring-brand/35 focus-visible:ring-offset-2 focus-visible:ring-offset-stage focus-visible:outline-none sm:h-9"
              min={0}
              max={VIDEO_DURATION_SECONDS}
              step={0.01}
              defaultValue={0}
              onChange={seekVideo}
            />
            <span
              ref={timeLabelReference}
              className="w-[76px] text-right font-mono text-[11px] text-stage-foreground/55 tabular-nums"
            >
              0.0 / {VIDEO_DURATION_SECONDS.toFixed(1)}s
            </span>
          </div>
        </div>
      </div>

      <ExportBar
        composition={composition}
        capability={capability}
        canExport={canExport}
        exportState={exportState}
        onExport={() => {
          void exportVideo()
        }}
      />
    </section>
  )
}

type ExportBarProps = {
  composition: ReleaseComposition
  capability: OutputCapabilityState
  canExport: boolean
  exportState: VideoExportState
  onExport: () => void
}

function ExportBar({
  composition,
  capability,
  canExport,
  exportState,
  onExport,
}: ExportBarProps) {
  const { t } = useI18n()
  const { output } = composition
  const dimensions = outputDimensions(output.aspectRatio, output.resolution)
  const warning = exportWarningKey(capability, output)

  return (
    <div className="shrink-0 border-t bg-background px-4 py-3 sm:px-6">
      {warning ? (
        <p className="mb-3 rounded-[10px] border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-[11px] leading-4 text-amber-800 dark:text-amber-300">
          {t(warning)}
        </p>
      ) : null}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <ExportFeedback state={exportState} />
          <p className="mt-0.5 font-mono text-[11px] text-muted-foreground tabular-nums">
            {t("output.summary", {
              seconds: VIDEO_DURATION_SECONDS,
              width: dimensions.width,
              height: dimensions.height,
              frameRate: output.frameRate,
            })}
          </p>
        </div>
        <Button
          type="button"
          size="lg"
          className="w-full shrink-0 bg-brand text-brand-foreground shadow-none hover:bg-brand/90 sm:w-auto sm:min-w-40"
          disabled={!canExport || exportState.status === "exporting"}
          onClick={onExport}
        >
          <Icon
            icon={
              exportState.status === "exporting"
                ? Loading03Icon
                : Download04Icon
            }
            className={
              exportState.status === "exporting" ? "animate-spin" : undefined
            }
            data-icon="inline-start"
          />
          {exportState.status === "exporting"
            ? t("preview.exporting")
            : t("preview.export")}
        </Button>
      </div>
    </div>
  )
}

function ExportFeedback({ state }: { state: VideoExportState }) {
  const { t } = useI18n()

  if (state.status === "completed") {
    return (
      <p
        className="flex items-center gap-1.5 text-sm font-semibold text-emerald-700 dark:text-emerald-400"
        aria-live="polite"
      >
        <Icon icon={CheckmarkCircle02Icon} className="size-4 shrink-0" />
        {t("preview.downloaded")}
      </p>
    )
  }

  if (state.status === "failed") {
    return (
      <p
        className="flex min-w-0 items-center gap-1.5 text-sm font-semibold text-destructive"
        aria-live="polite"
      >
        <Icon icon={Alert02Icon} className="size-4 shrink-0" />
        <span className="truncate">{state.message}</span>
      </p>
    )
  }

  return <p className="text-sm font-semibold">{t("preview.localOnly")}</p>
}

function exportWarningKey(
  capability: OutputCapabilityState,
  output: ReleaseComposition["output"]
) {
  if (output.resolution !== "4k") {
    return null
  }

  if (capability.status === "supported" && capability.storage === "memory") {
    return "output.warning.memory" as const
  }

  return output.frameRate === 60 ? ("output.warning.maximum" as const) : null
}

function shouldAutoplayPreview(): boolean {
  return !window.matchMedia("(prefers-reduced-motion: reduce)").matches
}
