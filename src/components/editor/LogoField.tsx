import * as React from "react"
import {
  Alert02Icon,
  CloudUploadIcon,
  Delete02Icon,
  Loading03Icon,
} from "@hugeicons/core-free-icons"

import { Button } from "@/components/ui/button"
import { Icon } from "@/components/ui/icon"
import {
  ACCEPTED_LOGO_TYPES,
  logoFileValidationError,
  type LogoImageState,
  type LogoValidationError,
} from "@/hooks/use-logo-image"
import { useFileDrop } from "@/hooks/use-file-drop"
import { useI18n } from "@/i18n/i18n"
import type { MessageKey } from "@/i18n/messages"
import { cn } from "@/lib/utils"

type LogoFieldProps = {
  file: File | null
  state: LogoImageState
  onChange: (file: File | null) => void
}

export function LogoField({ file, state, onChange }: LogoFieldProps) {
  const { t } = useI18n()
  const [rejectionError, setRejectionError] =
    React.useState<LogoValidationError | null>(null)
  const error =
    rejectionError || (state.status === "failed" ? state.error : null)

  function acceptFile(candidate: File | null) {
    if (!candidate) {
      return
    }

    const validationError = logoFileValidationError(candidate)
    setRejectionError(validationError)

    if (!validationError) {
      onChange(candidate)
    }
  }

  const { zoneReference, isDraggedOver } =
    useFileDrop<HTMLLabelElement>(acceptFile)

  if (file && state.status !== "failed") {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-3 rounded-[10px] border border-border bg-card p-2">
          <span className="logo-preview-tile flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-lg">
            {state.status === "ready" ? (
              <img
                src={state.previewUrl}
                alt=""
                className="size-9 object-contain"
              />
            ) : (
              <Icon
                icon={Loading03Icon}
                className="size-4 animate-spin text-muted-foreground"
              />
            )}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[13px] font-medium">
              {file.name}
            </span>
            <span className="mt-0.5 block font-mono text-[11px] text-muted-foreground">
              {state.status === "ready"
                ? `${state.image.width}×${state.image.height} · ${formatFileSize(file.size)}`
                : t("content.logo.loading")}
            </span>
          </span>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label={t("content.logo.remove")}
            onClick={() => {
              setRejectionError(null)
              onChange(null)
            }}
          >
            <Icon icon={Delete02Icon} />
          </Button>
        </div>
        {error ? <LogoError error={error} /> : null}
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <label
        ref={zoneReference}
        htmlFor="logo-upload"
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-[10px] border border-dashed px-4 py-5 text-center transition-[border-color,background-color,transform] duration-150 ease-[var(--ease-out)] focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/20 active:scale-[0.99]",
          isDraggedOver
            ? "border-ring bg-ring/8"
            : "border-input bg-card hover:border-foreground/25 hover:bg-muted/60"
        )}
      >
        <input
          id="logo-upload"
          name="productLogo"
          type="file"
          className="sr-only"
          accept={ACCEPTED_LOGO_TYPES.join(",")}
          onChange={(event) => {
            const selected = event.target.files?.[0] ?? null
            event.target.value = ""
            acceptFile(selected)
          }}
        />
        <Icon
          icon={CloudUploadIcon}
          className="size-5 text-muted-foreground"
          strokeWidth={1.6}
        />
        <span className="text-[13px] font-medium">
          {isDraggedOver
            ? t("content.logo.dropActive")
            : t("content.logo.drop")}
        </span>
        <span className="text-[11px] leading-4 text-muted-foreground">
          {t("content.logo.help")}
        </span>
      </label>
      {error ? <LogoError error={error} /> : null}
    </div>
  )
}

function LogoError({ error }: { error: LogoValidationError }) {
  const { t } = useI18n()

  return (
    <p
      className="flex items-start gap-1.5 text-xs text-destructive"
      aria-live="polite"
    >
      <Icon icon={Alert02Icon} className="mt-px size-3.5 shrink-0" />
      {t(logoErrorMessageKey(error))}
    </p>
  )
}

function formatFileSize(bytes: number): string {
  const kilobytes = bytes / 1024
  return kilobytes < 1024
    ? `${Math.round(kilobytes)} KB`
    : `${(kilobytes / 1024).toFixed(1)} MB`
}

function logoErrorMessageKey(error: LogoValidationError): MessageKey {
  return `logo.error.${error}`
}
