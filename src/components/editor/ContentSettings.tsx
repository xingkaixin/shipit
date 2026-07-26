import * as React from "react"
import {
  Cancel01Icon,
  ImageAdd02Icon,
  Link01Icon,
  PackageIcon,
  TextFontIcon,
} from "@hugeicons/core-free-icons"

import { SettingsSection } from "@/components/editor/SettingsSection"
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
  logoFileValidationMessage,
  type LogoImageState,
} from "@/hooks/use-logo-image"
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
  const [logoValidationMessage, setLogoValidationMessage] = React.useState("")
  const { content } = draft
  const logoMessage =
    logoValidationMessage ||
    (logoState.status === "failed" ? logoState.message : "")

  function selectLogo(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null
    event.target.value = ""

    if (!file) {
      return
    }

    const validationMessage = logoFileValidationMessage(file)
    if (validationMessage) {
      setLogoValidationMessage(validationMessage)
      return
    }

    setLogoValidationMessage("")
    dispatch({ type: "set-logo-file", value: file })
  }

  return (
    <div className="space-y-7">
      <SettingsSection
        title="产品标识"
        description="透明背景 Logo 在纯净模式下效果最佳。"
      >
        <div className="flex items-center gap-2">
          <label
            htmlFor="logo-upload"
            className="flex h-12 min-w-0 flex-1 cursor-pointer items-center gap-2.5 rounded-[10px] border border-dashed border-input bg-card px-3 text-sm transition-[border-color,background-color,box-shadow,transform] duration-150 ease-[var(--ease-out)] focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/20 hover:border-foreground/20 hover:bg-muted/60 active:scale-[0.99]"
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
              {content.logoFile?.name ?? "上传产品 Logo"}
            </span>
          </label>
          {content.logoFile ? (
            <Button
              type="button"
              variant="outline"
              size="icon"
              aria-label="移除 Logo"
              onClick={() => {
                dispatch({ type: "set-logo-file", value: null })
              }}
            >
              <Icon icon={Cancel01Icon} />
            </Button>
          ) : null}
        </div>
        {logoMessage ? (
          <p className="text-xs text-destructive" aria-live="polite">
            {logoMessage}
          </p>
        ) : (
          <p className="text-xs text-muted-foreground">
            PNG、JPG 或 WebP，最大 10&nbsp;MB，最多 1600 万像素
          </p>
        )}
      </SettingsSection>

      <SettingsSection title="发布信息">
        <div className="grid grid-cols-[minmax(0,1fr)_112px] gap-3">
          <div className="space-y-2">
            <Label htmlFor="product-name">
              <Icon icon={TextFontIcon} className="size-3.5" />
              产品名称
            </Label>
            <Input
              id="product-name"
              name="productName"
              value={content.productName}
              maxLength={48}
              autoComplete="off"
              placeholder="例如 Shipit…"
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
              版本
            </Label>
            <Input
              id="version"
              name="releaseVersion"
              value={content.version}
              maxLength={24}
              autoComplete="off"
              spellCheck={false}
              placeholder="例如 v1.0.0…"
              onChange={(event) => {
                dispatch({ type: "set-version", value: event.target.value })
              }}
            />
          </div>
        </div>
      </SettingsSection>

      <SettingsSection
        title="补充信息"
        description="可展示域名、安装命令或一句发布说明。"
      >
        <div className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="detail-kind">
              <Icon icon={Link01Icon} className="size-3.5" />
              信息类型
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
                <SelectValue>
                  {detailKindLabel(content.detail.kind)}
                </SelectValue>
              </SelectTrigger>
              <SelectContent alignItemWithTrigger={false}>
                <SelectItem value="none">不显示</SelectItem>
                <SelectItem value="website">产品域名</SelectItem>
                <SelectItem value="install">安装命令</SelectItem>
                <SelectItem value="custom">自定义文字</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {content.detail.kind !== "none" ? (
            <div className="space-y-2">
              <Label htmlFor="detail-value">显示内容</Label>
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
                placeholder={detailInputPlaceholder(content.detail.kind)}
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
      </SettingsSection>
    </div>
  )
}

function detailKindLabel(
  kind: ReleaseDraft["content"]["detail"]["kind"]
): string {
  switch (kind) {
    case "none":
      return "不显示"
    case "website":
      return "产品域名"
    case "install":
      return "安装命令"
    case "custom":
      return "自定义文字"
  }
}

function detailInputPlaceholder(
  kind: ReleaseDraft["content"]["detail"]["kind"]
): string {
  switch (kind) {
    case "none":
      return ""
    case "website":
      return "例如 shipit.dev…"
    case "install":
      return "例如 pnpm add shipit…"
    case "custom":
      return "例如 Available now…"
  }
}
