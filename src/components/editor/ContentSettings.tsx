import type * as React from "react"
import {
  Link01Icon,
  PackageIcon,
  TextFontIcon,
} from "@hugeicons/core-free-icons"

import { ImageField, type ImageFieldCopy } from "@/components/editor/ImageField"
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
import type { ImageFileState } from "@/hooks/use-image-file"
import { useI18n } from "@/i18n/i18n"
import type { MessageKey } from "@/i18n/messages"
import type { ReleaseDraftAction } from "@/state/release-draft-reducer"
import { isDetailKind, type ReleaseDraft } from "@/video/release-video"

type ContentSettingsProps = {
  draft: ReleaseDraft
  logoState: ImageFileState
  dispatch: React.Dispatch<ReleaseDraftAction>
}

export function ContentSettings({
  draft,
  logoState,
  dispatch,
}: ContentSettingsProps) {
  const { t } = useI18n()
  const { content } = draft

  return (
    <div className="space-y-4">
      <ImageField
        id="logo-upload"
        name="productLogo"
        file={content.logoFile}
        state={logoState}
        copy={logoFieldCopy(t)}
        onChange={(value) => {
          dispatch({ type: "set-logo-file", value })
        }}
      />

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

function logoFieldCopy(t: (key: MessageKey) => string): ImageFieldCopy {
  return {
    drop: t("content.logo.drop"),
    dropActive: t("content.logo.dropActive"),
    loading: t("content.logo.loading"),
    remove: t("content.logo.remove"),
    help: t("content.logo.help"),
    errors: {
      type: t("logo.error.type"),
      bytes: t("logo.error.bytes"),
      dimensions: t("logo.error.dimensions"),
      decode: t("logo.error.decode"),
    },
  }
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
