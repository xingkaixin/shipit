import * as React from "react"

import {
  PRODUCT_FRAME_DEFINITIONS,
  type FramedProductFrame,
} from "@/video/product-frame-registry"
import type { ProductFrame, ReleaseImage } from "@/video/release-video"

export type ProductFrameImages = Record<FramedProductFrame, ReleaseImage>

export type ProductFrameAssetState =
  | { status: "loading"; images: null }
  | { status: "ready"; images: ProductFrameImages }
  | { status: "failed"; images: null }

let cachedImages: ProductFrameImages | null = null
let pendingImages: Promise<ProductFrameImages> | null = null

export function useProductFrameAssets(): ProductFrameAssetState {
  const [state, setState] = React.useState<ProductFrameAssetState>(() =>
    cachedImages
      ? { status: "ready", images: cachedImages }
      : { status: "loading", images: null }
  )

  React.useEffect(() => {
    let isCurrentRequest = true
    void loadProductFrameAssets()
      .then((images) => {
        if (isCurrentRequest) {
          setState({ status: "ready", images })
        }
      })
      .catch((error: unknown) => {
        console.error("[product-frame] Failed to load frame assets", error)
        if (isCurrentRequest) {
          setState({ status: "failed", images: null })
        }
      })

    return () => {
      isCurrentRequest = false
    }
  }, [])

  return state
}

export function productFrameImageFor(
  images: ProductFrameImages | null,
  frame: ProductFrame
): ReleaseImage | null {
  return frame === "none" || !images ? null : images[frame]
}

function loadProductFrameAssets(): Promise<ProductFrameImages> {
  if (cachedImages) {
    return Promise.resolve(cachedImages)
  }

  pendingImages ??= Promise.all([
    loadImage(PRODUCT_FRAME_DEFINITIONS.browser.assetUrl),
    loadImage(PRODUCT_FRAME_DEFINITIONS.macbook.assetUrl),
    loadImage(PRODUCT_FRAME_DEFINITIONS.iphone.assetUrl),
  ]).then(([browser, macbook, iphone]) => {
    cachedImages = { browser, macbook, iphone }
    return cachedImages
  })

  return pendingImages
}

function loadImage(source: string): Promise<ReleaseImage> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.decoding = "async"
    image.onload = () => {
      resolve({
        source: image,
        width: image.naturalWidth,
        height: image.naturalHeight,
      })
    }
    image.onerror = () => {
      reject(new Error(`Unable to decode product frame: ${source}`))
    }
    image.src = source
  })
}
