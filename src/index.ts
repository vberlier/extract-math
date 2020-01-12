import { default as escapeStringRegexp } from 'escape-string-regexp'

export interface Segment {
  type: 'text' | 'display' | 'inline'
  math: boolean
  value: string
  raw: string
}
const ESCAPE_DELIMITER = escapeStringRegexp('\\')

export function extractMath (input: string, inlineDelimiter: string = '$', displayDelimiter: string = '$$'): Segment[] {
  const segments: Segment[] = []
  const pattern: RegExp = buildRegExp(inlineDelimiter, displayDelimiter)

  let textWithInline: string
  let textWithDisplay: string
  let display: string
  let inline: string

  let [text, ...parts] = input.split(pattern)

  pushText(segments, text)

  while (parts.length > 0) {
    [textWithInline, textWithDisplay, display, inline, ...parts] = parts

    if (textWithInline) {
      pushText(segments, inlineDelimiter)
    } else if (textWithDisplay) {
      pushText(segments, displayDelimiter)
    } else if (display) {
      pushMath(segments, 'display', display, inlineDelimiter, displayDelimiter)
    } else if (inline) {
      pushMath(segments, 'inline', inline, inlineDelimiter, displayDelimiter)
    }

    [text, ...parts] = parts

    pushText(segments, text)
  }

  return segments
}

function buildRegExp (inlineDelimiter: string, displayDelimiter: string): RegExp {
  const textWithInline = buildTextWithInlineRegExp(inlineDelimiter)
  const textWithDisplay = buildTextWithDisplayRegExp(displayDelimiter)
  const display = buildDisplayRegExp(displayDelimiter)
  const inline = buildInlineRegExp(inlineDelimiter)

  return new RegExp([textWithInline.source, textWithDisplay.source, display.source, inline.source].join('|'))
}

function buildTextWithInlineRegExp (inlineDelimiter: string): RegExp {
  inlineDelimiter = escapeStringRegexp(inlineDelimiter)
  return new RegExp(`(${ESCAPE_DELIMITER}${inlineDelimiter})`)
}

function buildTextWithDisplayRegExp (displayDelimiter: string): RegExp {
  displayDelimiter = escapeStringRegexp(displayDelimiter)
  return new RegExp(`(${ESCAPE_DELIMITER}${displayDelimiter})`)
}

function buildDisplayRegExp (displayDelimiter: string): RegExp {
  displayDelimiter = escapeStringRegexp(displayDelimiter)
  return new RegExp(`${displayDelimiter}(.*?[^${ESCAPE_DELIMITER}])${displayDelimiter}`)
}

function buildInlineRegExp (inlineDelimiter: string): RegExp {
  inlineDelimiter = escapeStringRegexp(inlineDelimiter)
  return new RegExp(`${inlineDelimiter}(.*?[^${ESCAPE_DELIMITER}])${inlineDelimiter}`)
}

function pushText (segments: Segment[], text: string) {
  if (!text) {
    return
  }

  const last = segments[segments.length - 1]

  if (last && last.type === 'text') {
    last.value += text
    last.raw += text
  } else {
    segments.push({ type: 'text', math: false, value: text, raw: text })
  }
}

function pushMath (segments: Segment[], mode: 'inline' | 'display', text: string,
                   inlineDelimiter: string, displayDelimiter: string) {
  if (!text) {
    return
  }

  const value = cleanValue(text, inlineDelimiter, displayDelimiter)

  segments.push({ type: mode, math: true, value: value, raw: text })
}

function cleanValue (text: string, inlineDelimiter: string, displayDelimiter: string) {
  return text
    .replace(buildReplaceDisplayRegExp(displayDelimiter), displayDelimiter)
    .replace(buildReplaceInlineRegExp(inlineDelimiter), inlineDelimiter)
}

function buildReplaceDisplayRegExp (displayDelimiter: string) {
  displayDelimiter = escapeStringRegexp(displayDelimiter)
  return new RegExp(`${ESCAPE_DELIMITER}${displayDelimiter}`, 'g')
}

function buildReplaceInlineRegExp (inlineDelimiter: string) {
  inlineDelimiter = escapeStringRegexp(inlineDelimiter)
  return new RegExp(`${ESCAPE_DELIMITER}${inlineDelimiter}`, 'g')
}
