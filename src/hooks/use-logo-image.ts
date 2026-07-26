import * as React from "react"

import type { ReleaseLogoImage } from "@/video/release-video"

export const MAX_LOGO_BYTES = 10 * 1024 * 1024
export const MAX_LOGO_EDGE = 8_192
export const MAX_LOGO_PIXELS = 16_777_216
export const ACCEPTED_LOGO_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
] as const

export type LogoImageState =
  | { status: "empty"; image: null }
  | { status: "loading"; image: null }
  | { status: "ready"; image: ReleaseLogoImage }
  | { status: "failed"; image: null; error: LogoValidationError }

export type LogoValidationError = "bytes" | "decode" | "dimensions" | "type"

export function isLogoStateExportable(state: LogoImageState): boolean {
  return state.status === "empty" || state.status === "ready"
}

export function logoFileValidationError(
  file: File
): LogoValidationError | null {
  if (!(ACCEPTED_LOGO_TYPES as readonly string[]).includes(file.type)) {
    return "type"
  }

  if (file.size > MAX_LOGO_BYTES) {
    return "bytes"
  }

  return null
}

export function logoDimensionValidationError(
  width: number,
  height: number
): LogoValidationError | null {
  if (
    width <= 0 ||
    height <= 0 ||
    width > MAX_LOGO_EDGE ||
    height > MAX_LOGO_EDGE ||
    width * height > MAX_LOGO_PIXELS
  ) {
    return "dimensions"
  }

  return null
}

export function useLogoImage(file: File | null): LogoImageState {
  const [state, setState] = React.useState<LogoImageState>({
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
      const validationError = logoDimensionValidationError(
        image.naturalWidth,
        image.naturalHeight
      )

      if (validationError) {
        console.error("[logo] Image dimensions exceed limits", {
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
        image: {
          source: image,
          width: image.naturalWidth,
          height: image.naturalHeight,
        },
      })
    }
    image.onerror = () => {
      console.error("[logo] Failed to decode image", {
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
