import type { ReleaseImage } from "@/video/release-video"

export function roundedRectangle(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
): void {
  const clampedRadius = Math.min(radius, width / 2, height / 2)
  context.beginPath()
  context.roundRect(x, y, width, height, clampedRadius)
}

export function drawImageContain(
  context: CanvasRenderingContext2D,
  image: ReleaseImage,
  maximumWidth: number,
  maximumHeight: number = maximumWidth
): void {
  const scale = Math.min(
    maximumWidth / image.width,
    maximumHeight / image.height
  )
  const width = image.width * scale
  const height = image.height * scale
  context.drawImage(image.source, -width / 2, -height / 2, width, height)
}

export function drawImageCover(
  context: CanvasRenderingContext2D,
  image: ReleaseImage,
  x: number,
  y: number,
  width: number,
  height: number
): void {
  const scale = Math.max(width / image.width, height / image.height)
  const sourceWidth = width / scale
  const sourceHeight = height / scale
  const sourceX = (image.width - sourceWidth) / 2
  const sourceY = (image.height - sourceHeight) / 2

  context.drawImage(
    image.source,
    sourceX,
    sourceY,
    sourceWidth,
    sourceHeight,
    x,
    y,
    width,
    height
  )
}
