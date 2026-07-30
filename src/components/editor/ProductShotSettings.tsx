import type * as React from "react"
import {
  BrowserIcon,
  LaptopIcon,
  SmartPhone01Icon,
  SparklesIcon,
  ViewIcon,
} from "@hugeicons/core-free-icons"
import type { HugeiconsIconProps } from "@hugeicons/react"

import { ColorInput } from "@/components/editor/ColorInput"
import { ImageField, type ImageFieldCopy } from "@/components/editor/ImageField"
import { RangeField } from "@/components/editor/RangeField"
import { Icon } from "@/components/ui/icon"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { OptionButton } from "@/components/ui/option-button"
import type { ImageFileState } from "@/hooks/use-image-file"
import { useI18n } from "@/i18n/i18n"
import type { MessageKey } from "@/i18n/messages"
import type { ReleaseDraftAction } from "@/state/release-draft-reducer"
import {
  PRODUCT_FRAMES,
  PRODUCT_SCREENSHOT_SCALE_MAX,
  PRODUCT_SCREENSHOT_SCALE_MIN,
  PRODUCT_SHADOW_STRENGTH_MAX,
  PRODUCT_SHADOW_STRENGTH_MIN,
  PRODUCT_SHOT_SCALE_MAX,
  PRODUCT_SHOT_SCALE_MIN,
  type ProductFrame,
  type ReleaseDraft,
} from "@/video/release-video"

type ProductShotSettingsProps = {
  draft: ReleaseDraft
  screenshotState: ImageFileState
  dispatch: React.Dispatch<ReleaseDraftAction>
}

export function ProductShotSettings({
  draft,
  screenshotState,
  dispatch,
}: ProductShotSettingsProps) {
  const { t } = useI18n()
  const { screenshotFile } = draft.content
  const { productShot } = draft.style

  return (
    <div className="space-y-4">
      <ImageField
        id="screenshot-upload"
        name="productScreenshot"
        file={screenshotFile}
        state={screenshotState}
        copy={screenshotFieldCopy(t)}
        onChange={(value) => {
          dispatch({ type: "set-screenshot-file", value })
        }}
      />

      {screenshotState.status === "ready" ? (
        <>
          <fieldset>
            <legend className="mb-2 text-[12px] leading-none font-semibold text-foreground/85">
              {t("productShot.frame")}
            </legend>
            <div className="grid grid-cols-2 gap-2">
              {PRODUCT_FRAMES.map((frame) => (
                <OptionButton
                  key={frame}
                  isSelected={productShot.frame === frame}
                  className="h-10 text-[12px]"
                  onClick={() => {
                    dispatch({ type: "set-product-frame", value: frame })
                  }}
                >
                  <Icon icon={productFrameIcon(frame)} className="size-3.5" />
                  {t(productFrameKey(frame))}
                </OptionButton>
              ))}
            </div>
          </fieldset>

          {productShot.frame === "browser" ? (
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="browser-tab-title">
                  {t("productShot.browserTabTitle")}
                </Label>
                <Input
                  id="browser-tab-title"
                  name="browserTabTitle"
                  value={productShot.browser.tabTitle}
                  maxLength={48}
                  autoComplete="off"
                  placeholder={t("productShot.browserTabTitle.placeholder")}
                  onChange={(event) => {
                    dispatch({
                      type: "set-browser-tab-title",
                      value: event.target.value,
                    })
                  }}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="browser-url">
                  {t("productShot.browserUrl")}
                </Label>
                <Input
                  id="browser-url"
                  name="browserUrl"
                  value={productShot.browser.url}
                  maxLength={120}
                  autoComplete="off"
                  spellCheck={false}
                  placeholder={t("productShot.browserUrl.placeholder")}
                  onChange={(event) => {
                    dispatch({
                      type: "set-browser-url",
                      value: event.target.value,
                    })
                  }}
                />
              </div>
            </div>
          ) : null}

          {supportsScreenshotScale(productShot.frame) ? (
            <RangeField
              id="product-screenshot-scale"
              label={t("productShot.screenshotScale")}
              valueLabel={`${Math.round(productShot.screenshotScale * 100)}%`}
              value={productShot.screenshotScale}
              minimum={PRODUCT_SCREENSHOT_SCALE_MIN}
              maximum={PRODUCT_SCREENSHOT_SCALE_MAX}
              step={0.05}
              onChange={(value) => {
                dispatch({ type: "set-product-screenshot-scale", value })
              }}
            />
          ) : null}

          {productShot.frame !== "none" ? (
            <>
              <div className="space-y-1.5">
                <Label htmlFor="product-screen-color">
                  {t("productShot.screenColor")}
                </Label>
                <ColorInput
                  id="product-screen-color"
                  label={t("productShot.screenColor")}
                  value={productShot.screenColor}
                  onChange={(value) => {
                    dispatch({ type: "set-product-screen-color", value })
                  }}
                />
              </div>

              <RangeField
                id="product-shadow-strength"
                label={t("productShot.shadowStrength")}
                valueLabel={`${Math.round(productShot.shadowStrength * 100)}%`}
                value={productShot.shadowStrength}
                minimum={PRODUCT_SHADOW_STRENGTH_MIN}
                maximum={PRODUCT_SHADOW_STRENGTH_MAX}
                step={0.05}
                onChange={(value) => {
                  dispatch({ type: "set-product-shadow-strength", value })
                }}
              />
            </>
          ) : null}

          <RangeField
            id="product-shot-scale"
            label={t("productShot.size")}
            valueLabel={`${Math.round(productShot.scale * 100)}%`}
            value={productShot.scale}
            minimum={PRODUCT_SHOT_SCALE_MIN}
            maximum={PRODUCT_SHOT_SCALE_MAX}
            step={0.05}
            onChange={(value) => {
              dispatch({ type: "set-product-shot-scale", value })
            }}
          />

          <OptionButton
            isSelected={productShot.shimmer}
            className="h-10 w-full text-[12px]"
            onClick={() => {
              dispatch({
                type: "set-product-shot-shimmer",
                value: !productShot.shimmer,
              })
            }}
          >
            <Icon icon={SparklesIcon} className="size-3.5" />
            {t("productShot.shimmer")}
          </OptionButton>
        </>
      ) : null}
    </div>
  )
}

function supportsScreenshotScale(frame: ProductFrame): boolean {
  return frame !== "none"
}

function screenshotFieldCopy(t: (key: MessageKey) => string): ImageFieldCopy {
  return {
    drop: t("content.screenshot.drop"),
    dropActive: t("content.screenshot.dropActive"),
    loading: t("content.screenshot.loading"),
    remove: t("content.screenshot.remove"),
    help: t("content.screenshot.help"),
    errors: {
      type: t("screenshot.error.type"),
      bytes: t("screenshot.error.bytes"),
      dimensions: t("screenshot.error.dimensions"),
      decode: t("screenshot.error.decode"),
    },
  }
}

function productFrameKey(frame: ProductFrame): MessageKey {
  return `productShot.frame.${frame}`
}

function productFrameIcon(frame: ProductFrame): HugeiconsIconProps["icon"] {
  switch (frame) {
    case "none":
      return ViewIcon
    case "browser":
      return BrowserIcon
    case "macbook":
      return LaptopIcon
    case "iphone":
      return SmartPhone01Icon
  }
}
