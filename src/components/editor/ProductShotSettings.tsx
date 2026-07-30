import type * as React from "react"
import {
  BrowserIcon,
  LaptopIcon,
  SmartPhone01Icon,
  SparklesIcon,
  ViewIcon,
} from "@hugeicons/core-free-icons"
import type { HugeiconsIconProps } from "@hugeicons/react"

import { ImageField, type ImageFieldCopy } from "@/components/editor/ImageField"
import { RangeField } from "@/components/editor/RangeField"
import { Icon } from "@/components/ui/icon"
import { OptionButton } from "@/components/ui/option-button"
import type { ImageFileState } from "@/hooks/use-image-file"
import { useI18n } from "@/i18n/i18n"
import type { MessageKey } from "@/i18n/messages"
import type { ReleaseDraftAction } from "@/state/release-draft-reducer"
import {
  PRODUCT_FRAMES,
  PRODUCT_SHOT_SCALE_MAX,
  PRODUCT_SHOT_SCALE_MIN,
  PRODUCT_SHOT_TILT_MAX,
  PRODUCT_SHOT_TILT_MIN,
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

          <RangeField
            id="product-shot-tilt"
            label={t("productShot.tilt")}
            valueLabel={`${productShot.tilt}°`}
            value={productShot.tilt}
            minimum={PRODUCT_SHOT_TILT_MIN}
            maximum={PRODUCT_SHOT_TILT_MAX}
            step={1}
            onChange={(value) => {
              dispatch({ type: "set-product-shot-tilt", value })
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
