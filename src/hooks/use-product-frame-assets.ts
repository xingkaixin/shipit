import * as React from "react"

import {
  PRODUCT_FRAME_DEFINITIONS,
  type FramedProductFrame,
} from "@/video/product-frame-registry"
import type { ProductFrame, ReleaseImage } from "@/video/release-video"

export type ProductFrameAssetState =
  | { status: "loading"; image: null }
  | { status: "ready"; image: ReleaseImage | null }
  | { status: "failed"; image: null }

const NO_FRAME: ProductFrameAssetState = { status: "ready", image: null }
const decodedFrames = new Map<FramedProductFrame, ReleaseImage>()
const pendingFrames = new Map<FramedProductFrame, Promise<ReleaseImage>>()

/**
 * Frame artwork is megabytes of PNG and WebP, so it is fetched per frame and
 * only once a screenshot actually needs one.
 */
export function useProductFrameAsset(
  frame: ProductFrame
): ProductFrameAssetState {
  const [state, setState] = React.useState<ProductFrameAssetState>(() =>
    initialFrameState(frame)
  )

  React.useEffect(() => {
    const initial = initialFrameState(frame)
    setState(initial)
    if (initial.status === "ready") {
      return undefined
    }

    let isCurrentRequest = true
    void loadProductFrame(frame as FramedProductFrame)
      .then((image) => {
        if (isCurrentRequest) {
          setState({ status: "ready", image })
        }
      })
      .catch((error: unknown) => {
        console.error("[product-frame] Failed to load frame asset", error)
        if (isCurrentRequest) {
          setState({ status: "failed", image: null })
        }
      })

    return () => {
      isCurrentRequest = false
    }
  }, [frame])

  return state
}

function initialFrameState(frame: ProductFrame): ProductFrameAssetState {
  if (frame === "none") {
    return NO_FRAME
  }

  const decoded = decodedFrames.get(frame)
  return decoded
    ? { status: "ready", image: decoded }
    : { status: "loading", image: null }
}

function loadProductFrame(frame: FramedProductFrame): Promise<ReleaseImage> {
  const decoded = decodedFrames.get(frame)
  if (decoded) {
    return Promise.resolve(decoded)
  }

  let pending = pendingFrames.get(frame)
  if (!pending) {
    pending = loadImage(PRODUCT_FRAME_DEFINITIONS[frame].assetUrl).then(
      (image) => {
        decodedFrames.set(frame, image)
        return image
      }
    )
    pendingFrames.set(frame, pending)
  }

  return pending
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
