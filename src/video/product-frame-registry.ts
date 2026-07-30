import chromeFrameUrl from "@/assets/product-frames/chrome.svg"
import iphoneFrameUrl from "@/assets/product-frames/iphone.webp"
import macbookFrameUrl from "@/assets/product-frames/macbook.svg"
import type { ProductFrame } from "@/video/release-video"

export type ProductFrameRectangle = {
  x: number
  y: number
  width: number
  height: number
}

export type FramedProductFrame = Exclude<ProductFrame, "none">

export type ProductFrameDefinition = {
  id: FramedProductFrame
  assetUrl: string
  source: {
    width: number
    height: number
  }
  bounds: ProductFrameRectangle
  screen: ProductFrameRectangle
  screenCornerRadius: number
  assetLayer: "behind-screen" | "over-screen"
}

export const PRODUCT_FRAME_DEFINITIONS: Record<
  FramedProductFrame,
  ProductFrameDefinition
> = {
  browser: {
    id: "browser",
    assetUrl: chromeFrameUrl,
    source: { width: 1_536, height: 895 },
    bounds: { x: 48, y: 32, width: 1_440, height: 799 },
    screen: { x: 49, y: 111, width: 1_438, height: 719 },
    screenCornerRadius: 9,
    assetLayer: "behind-screen",
  },
  macbook: {
    id: "macbook",
    assetUrl: macbookFrameUrl,
    source: { width: 1_216, height: 735 },
    bounds: { x: 0, y: 0, width: 1_216, height: 735 },
    screen: { x: 112, y: 4, width: 992.5, height: 653 },
    screenCornerRadius: 26,
    assetLayer: "over-screen",
  },
  iphone: {
    id: "iphone",
    assetUrl: iphoneFrameUrl,
    source: { width: 421, height: 850 },
    bounds: { x: 0, y: 0, width: 421, height: 850 },
    screen: { x: 24, y: 20, width: 373, height: 809 },
    screenCornerRadius: 50,
    assetLayer: "over-screen",
  },
}

export function productFrameDefinition(
  frame: ProductFrame
): ProductFrameDefinition | null {
  return frame === "none" ? null : PRODUCT_FRAME_DEFINITIONS[frame]
}
