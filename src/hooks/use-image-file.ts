import * as React from "react"

import type { ReleaseImage } from "@/video/release-video"

export const MAX_IMAGE_BYTES = 10 * 1024 * 1024
export const MAX_IMAGE_EDGE = 8_192
export const MAX_IMAGE_PIXELS = 16_777_216
export const ACCEPTED_IMAGE_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/svg+xml",
] as const

export type ImageFileState =
  | { status: "empty"; image: null }
  | { status: "loading"; image: null }
  | { status: "ready"; image: ReleaseImage; previewUrl: string }
  | { status: "failed"; image: null; error: ImageValidationError }

export type ImageValidationError = "bytes" | "decode" | "dimensions" | "type"

export function isImageStateExportable(state: ImageFileState): boolean {
  return state.status === "empty" || state.status === "ready"
}

export function imageFileValidationError(
  file: File
): ImageValidationError | null {
  if (!(ACCEPTED_IMAGE_TYPES as readonly string[]).includes(file.type)) {
    return "type"
  }

  if (file.size > MAX_IMAGE_BYTES) {
    return "bytes"
  }

  return null
}

export function imageDimensionValidationError(
  width: number,
  height: number
): ImageValidationError | null {
  if (
    width <= 0 ||
    height <= 0 ||
    width > MAX_IMAGE_EDGE ||
    height > MAX_IMAGE_EDGE ||
    width * height > MAX_IMAGE_PIXELS
  ) {
    return "dimensions"
  }

  return null
}

export function useImageFile(file: File | null): ImageFileState {
  const [state, setState] = React.useState<ImageFileState>({
    status: "empty",
    image: null,
  })

  React.useEffect(() => {
    if (!file) {
      setState({ status: "empty", image: null })
      return undefined
    }

    const imageUrl = URL.createObjectURL(file)
    const image = new Image()
    setState({ status: "loading", image: null })

    image.onload = () => {
      const validationError = imageDimensionValidationError(
        image.naturalWidth,
        image.naturalHeight
      )

      if (validationError) {
        console.error("[image] Dimensions exceed limits", {
          fileName: file.name,
          width: image.naturalWidth,
          height: image.naturalHeight,
        })
        setState({
          status: "failed",
          image: null,
          error: validationError,
        })
        return
      }

      setState({
        status: "ready",
        previewUrl: imageUrl,
        image: {
          source: image,
          width: image.naturalWidth,
          height: image.naturalHeight,
        },
      })
    }
    image.onerror = () => {
      console.error("[image] Failed to decode file", {
        fileName: file.name,
        fileType: file.type,
      })
      setState({
        status: "failed",
        image: null,
        error: "decode",
      })
    }
    image.src = imageUrl

    return () => {
      image.onload = null
      image.onerror = null
      image.src = ""
      URL.revokeObjectURL(imageUrl)
    }
  }, [file])

  return state
}
