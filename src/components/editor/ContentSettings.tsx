import * as React from "react"
import {
  Cancel01Icon,
  ImageAdd02Icon,
  Link01Icon,
  PackageIcon,
  TextFontIcon,
} from "@hugeicons/core-free-icons"

import { Button } from "@/components/ui/button"
import { Icon } from "@/components/ui/icon"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ACCEPTED_LOGO_TYPES,
  logoFileValidationError,
  type LogoImageState,
  type LogoValidationError,
} from "@/hooks/use-logo-image"
import { useI18n } from "@/i18n/i18n"
import type { MessageKey } from "@/i18n/messages"
import type { ReleaseDraftAction } from "@/state/release-draft-reducer"
import { isDetailKind, type ReleaseDraft } from "@/video/release-video"

type ContentSettingsProps = {
  draft: ReleaseDraft
  logoState: LogoImageState
  dispatch: React.Dispatch<ReleaseDraftAction>
}

export function ContentSettings({
  draft,
  logoState,
  dispatch,
}: ContentSettingsProps) {
  const { t } = useI18n()
  const [logoValidationError, setLogoValidationError] =
    React.useState<LogoValidationError | null>(null)
  const { content } = draft
  const logoError =
    logoValidationError ||
    (logoState.status === "failed" ? logoState.error : null)

  function selectLogo(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null
    event.target.value = ""

    if (!file) {
      return
    }

    const validationError = logoFileValidationError(file)
    if (validationError) {
      setLogoValidationError(validationError)
      return
    }

    setLogoValidationError(null)
    dispatch({ type: "set-logo-file", value: file })
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <label
            htmlFor="logo-upload"
            className="flex h-11 min-w-0 flex-1 cursor-pointer items-center gap-2.5 rounded-[10px] border border-dashed border-input bg-card px-3 text-sm transition-[border-color,background-color,transform] duration-150 ease-[var(--ease-out)] focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/20 hover:border-foreground/25 hover:bg-muted/60 active:scale-[0.99]"
          >
            <input
              id="logo-upload"
              name="productLogo"
              type="file"
              className="sr-only"
              accept={ACCEPTED_LOGO_TYPES.join(",")}
              onChange={selectLogo}
            />
            <Icon
              icon={ImageAdd02Icon}
              className="size-4 shrink-0 text-muted-foreground"
            />
            <span className="truncate">
              {content.logoFile?.name ?? t("content.logo.upload")}
            </span>
          </label>
          {content.logoFile ? (
            <Button
              type="button"
              variant="outline"
              size="icon"
              aria-label={t("content.logo.remove")}
              onClick={() => {
                dispatch({ type: "set-logo-file", value: null })
              }}
            >
              <Icon icon={Cancel01Icon} />
            </Button>
          ) : null}
        </div>
        {logoError ? (
          <p className="text-xs text-destructive" aria-live="polite">
            {t(logoErrorMessageKey(logoError))}
          </p>
        ) : (
          <p className="text-[11px] leading-4 text-muted-foreground">
            {t("content.logo.help")}
          </p>
        )}
      </div>

      <div className="grid grid-cols-[minmax(0,1fr)_112px] gap-3">
        <div className="space-y-2">
          <Label htmlFor="product-name">
            <Icon icon={TextFontIcon} className="size-3.5" />
            {t("content.productName")}
          </Label>
          <Input
            id="product-name"
            name="productName"
            value={content.productName}
            maxLength={48}
            autoComplete="off"
            placeholder={t("content.productName.placeholder")}
            onChange={(event) => {
              dispatch({
                type: "set-product-name",
                value: event.target.value,
              })
            }}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="version">
            <Icon icon={PackageIcon} className="size-3.5" />
            {t("content.version")}
          </Label>
          <Input
            id="version"
            name="releaseVersion"
            value={content.version}
            maxLength={24}
            autoComplete="off"
            spellCheck={false}
            placeholder={t("content.version.placeholder")}
            onChange={(event) => {
              dispatch({ type: "set-version", value: event.target.value })
            }}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="detail-kind">
          <Icon icon={Link01Icon} className="size-3.5" />
          {t("content.detail.kind")}
        </Label>
        <Select
          value={content.detail.kind}
          onValueChange={(value) => {
            if (isDetailKind(value)) {
              dispatch({ type: "set-detail-kind", value })
            }
          }}
        >
          <SelectTrigger id="detail-kind" className="w-full">
            <SelectValue>{detailKindLabel(content.detail.kind, t)}</SelectValue>
          </SelectTrigger>
          <SelectContent alignItemWithTrigger={false}>
            <SelectItem value="none">{t("content.detail.none")}</SelectItem>
            <SelectItem value="website">
              {t("content.detail.website")}
            </SelectItem>
            <SelectItem value="install">
              {t("content.detail.install")}
            </SelectItem>
            <SelectItem value="custom">{t("content.detail.custom")}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {content.detail.kind !== "none" ? (
        <div className="space-y-2">
          <Label htmlFor="detail-value">{t("content.detail.value")}</Label>
          <Input
            id="detail-value"
            name="releaseDetail"
            className={
              content.detail.kind === "install" ? "font-mono" : undefined
            }
            value={content.detail.value}
            maxLength={80}
            autoComplete="off"
            spellCheck={content.detail.kind === "custom"}
            placeholder={detailInputPlaceholder(content.detail.kind, t)}
            onChange={(event) => {
              dispatch({
                type: "set-detail-value",
                value: event.target.value,
              })
            }}
          />
        </div>
      ) : null}
    </div>
  )
}

function detailKindLabel(
  kind: ReleaseDraft["content"]["detail"]["kind"],
  t: (key: MessageKey) => string
): string {
  switch (kind) {
    case "none":
      return t("content.detail.none")
    case "website":
      return t("content.detail.website")
    case "install":
      return t("content.detail.install")
    case "custom":
      return t("content.detail.custom")
  }
}

function detailInputPlaceholder(
  kind: ReleaseDraft["content"]["detail"]["kind"],
  t: (key: MessageKey) => string
): string {
  switch (kind) {
    case "none":
      return ""
    case "website":
      return t("content.detail.websitePlaceholder")
    case "install":
      return t("content.detail.installPlaceholder")
    case "custom":
      return t("content.detail.customPlaceholder")
  }
}

function logoErrorMessageKey(error: LogoValidationError): MessageKey {
  return `logo.error.${error}`
}
