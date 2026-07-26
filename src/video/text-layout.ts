type CanvasTextMetricsContext = {
  font: string
  measureText: (text: string) => { width: number }
}

type FitSingleLineTextOptions = {
  text: string
  maximumWidth: number
  maximumFontSize: number
  minimumFontSize: number
  fontWeight: number
  fontFamily: string
}

export type FittedCanvasText = {
  text: string
  fontSize: number
}

export function fitSingleLineText(
  context: CanvasTextMetricsContext,
  options: FitSingleLineTextOptions
): FittedCanvasText {
  for (
    let fontSize = options.maximumFontSize;
    fontSize >= options.minimumFontSize;
    fontSize -= 2
  ) {
    if (
      measureText(context, options, options.text, fontSize) <=
      options.maximumWidth
    ) {
      return { text: options.text, fontSize }
    }
  }

  const graphemes = segmentGraphemes(options.text)
  let lowerBound = 0
  let upperBound = graphemes.length

  while (lowerBound < upperBound) {
    const midpoint = Math.ceil((lowerBound + upperBound) / 2)
    const candidate = `${graphemes.slice(0, midpoint).join("")}…`

    if (
      measureText(context, options, candidate, options.minimumFontSize) <=
      options.maximumWidth
    ) {
      lowerBound = midpoint
    } else {
      upperBound = midpoint - 1
    }
  }

  return {
    text: `${graphemes.slice(0, lowerBound).join("")}…`,
    fontSize: options.minimumFontSize,
  }
}

function measureText(
  context: CanvasTextMetricsContext,
  options: FitSingleLineTextOptions,
  text: string,
  fontSize: number
): number {
  context.font = `${options.fontWeight} ${fontSize}px ${options.fontFamily}`
  return context.measureText(text).width
}

function segmentGraphemes(text: string): string[] {
  return Array.from(
    new Intl.Segmenter(undefined, { granularity: "grapheme" }).segment(text),
    ({ segment }) => segment
  )
}
