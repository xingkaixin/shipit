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

import { Button } from "@/components/ui/button"
import { Icon } from "@/components/ui/icon"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useVideoExport, type VideoExportState } from "@/hooks/use-video-export"
import { useI18n } from "@/i18n/i18n"
import { cn } from "@/lib/utils"
import { fontById } from "@/video/font-registry"
import { outputDimensions, PREVIEW_DIMENSIONS } from "@/video/output-settings"
import { renderReleaseFrame } from "@/video/render-release-frame"
import {
  VIDEO_DURATION_SECONDS,
  type ReleaseComposition,
} from "@/video/release-video"

const PROGRESS_UPDATE_INTERVAL_MS = 80

type VideoPreviewProps = {
  composition: ReleaseComposition
  canExport: boolean
}

export function VideoPreview({ composition, canExport }: VideoPreviewProps) {
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
  const previewDimensions = PREVIEW_DIMENSIONS[composition.output.aspectRatio]
  const dimensions = outputDimensions(
    composition.output.aspectRatio,
    composition.output.resolution
  )
  const summary = t("output.summary", {
    seconds: VIDEO_DURATION_SECONDS,
    width: dimensions.width,
    height: dimensions.height,
    frameRate: composition.output.frameRate,
  })
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
    <section className="flex min-h-0 flex-1 flex-col bg-workspace">
      <div className="flex h-16 shrink-0 items-center justify-between gap-4 border-b bg-background/70 px-4 sm:px-6">
        <div>
          <h2 className="font-heading text-sm font-semibold tracking-[-0.01em]">
            {t("preview.title")}
          </h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {t("preview.description")}
          </p>
        </div>
        <span className="shrink-0 rounded-full border bg-card px-3 py-1.5 font-mono text-[10px] text-muted-foreground shadow-[0_1px_2px_color-mix(in_oklch,var(--foreground),transparent_94%)]">
          {summary}
        </span>
      </div>

      <div className="flex min-h-0 flex-1 items-start justify-center p-3 py-6 sm:p-5 lg:items-center lg:p-7">
        <div
          className={cn(
            "preview-stage flex max-w-full min-w-0 flex-col rounded-[24px] bg-stage p-2 text-stage-foreground shadow-[0_24px_70px_color-mix(in_oklch,var(--stage),transparent_72%),inset_0_1px_0_color-mix(in_oklch,var(--stage-foreground),transparent_90%)] ring-1 ring-stage-foreground/8",
            composition.output.aspectRatio === "landscape"
              ? "w-full max-w-5xl lg:w-[min(100%,calc((100svh-19rem)*16/9))]"
              : "w-fit max-w-full"
          )}
        >
          <figure
            className={cn(
              "relative mx-auto overflow-hidden rounded-[18px] bg-[#0b0e0c] ring-1 ring-stage-foreground/8",
              composition.output.aspectRatio === "landscape"
                ? "aspect-video w-full"
                : "aspect-[9/16] h-[min(58vh,640px)] max-h-full max-w-full"
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

          <div className="px-1 pt-2">
            <div className="flex items-center gap-2 px-1 py-1.5">
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
                className="w-[84px] text-right font-mono text-[11px] text-stage-foreground/55 tabular-nums"
              >
                0.0 / {VIDEO_DURATION_SECONDS.toFixed(1)}s
              </span>
            </div>

            <div className="mt-1 flex flex-col gap-3 border-t border-stage-foreground/10 px-1 pt-3 pb-1 sm:flex-row sm:items-center sm:justify-between">
              <ExportFeedback state={exportState} />
              <Button
                type="button"
                size="lg"
                className="w-full bg-brand text-brand-foreground shadow-none hover:bg-brand/90 sm:w-auto sm:min-w-40"
                disabled={!canExport || exportState.status === "exporting"}
                onClick={() => {
                  void exportVideo()
                }}
              >
                {exportState.status === "exporting" ? (
                  <Icon
                    icon={Loading03Icon}
                    className="animate-spin"
                    data-icon="inline-start"
                  />
                ) : (
                  <Icon icon={Download04Icon} data-icon="inline-start" />
                )}
                {exportState.status === "exporting"
                  ? t("preview.exporting")
                  : t("preview.export")}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function ExportFeedback({ state }: { state: VideoExportState }) {
  const { t } = useI18n()

  if (state.status === "completed") {
    return (
      <div
        className="flex items-center gap-2 text-sm text-brand"
        aria-live="polite"
      >
        <Icon icon={CheckmarkCircle02Icon} className="size-4 shrink-0" />
        {t("preview.downloaded")}
      </div>
    )
  }

  if (state.status === "failed") {
    return (
      <div
        className="flex min-w-0 items-center gap-2 text-sm text-red-300"
        aria-live="polite"
      >
        <Icon icon={Alert02Icon} className="size-4 shrink-0" />
        <span className="truncate">{state.message}</span>
      </div>
    )
  }

  return (
    <div className="min-w-0">
      <p className="text-sm font-semibold text-stage-foreground/90">
        {t("preview.localOnly")}
      </p>
      <p className="truncate text-xs text-stage-foreground/45">
        {t("preview.sameRenderer")}
      </p>
    </div>
  )
}

function shouldAutoplayPreview(): boolean {
  return !window.matchMedia("(prefers-reduced-motion: reduce)").matches
}
