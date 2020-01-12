import { default as escapeStringRegexp } from 'escape-string-regexp'

export interface Segment {
  type: 'text' | 'display' | 'inline'
  math: boolean
  value: string
  raw: string
}

export class Delimiters {
  public inlineOpening: string
  public inlineClosing: string
  public displayOpening: string
  public displayClosing: string

  constructor (inline: string, display: string)
  constructor (inlineOpening: string, inlineClosing: string, displayOpening: string, displayClosing: string)
  constructor (inlineOrInlineOpening: string, displayOrInlineClosing: string,
               displayOpening?: string, displayClosing?: string) {
    this.inlineOpening = inlineOrInlineOpening
    this.inlineClosing = displayOpening ? displayOrInlineClosing : inlineOrInlineOpening

    this.displayOpening = displayOpening ? displayOpening : displayOrInlineClosing
    this.displayClosing = displayClosing ? displayClosing : displayOrInlineClosing
  }

  get escapedInlineOpening (): string {
    return escapeStringRegexp(this.inlineOpening)
  }

  get escapedInlineClosing (): string {
    return escapeStringRegexp(this.inlineClosing)
  }

  get escapedDisplayOpening (): string {
    return escapeStringRegexp(this.displayOpening)
  }

  get escapedDisplayClosing (): string {
    return escapeStringRegexp(this.displayClosing)
  }

  get inlineRegExp (): RegExp {
    // language=JSRegexp
    return new RegExp(`${this.escapedInlineOpening}(.*?[^${ESCAPE_DELIMITER}])${this.escapedInlineClosing}`)
  }

  get displayRegExp (): RegExp {
    // language=JSRegexp
    return new RegExp(`${this.escapedDisplayOpening}(.*?[^${ESCAPE_DELIMITER}])${this.escapedDisplayClosing}`)
  }

  get textWithInlineOpeningRegExp (): RegExp {
    return new RegExp(`(${ESCAPE_DELIMITER}${this.escapedInlineOpening})`)
  }

  get textWithInlineClosingRegExp (): RegExp {
    return new RegExp(`(${ESCAPE_DELIMITER}${this.escapedInlineClosing})`)
  }

  get textWithDisplayOpeningRegExp (): RegExp {
    return new RegExp(`(${ESCAPE_DELIMITER}${this.escapedDisplayOpening})`)
  }

  get textWithDisplayClosingRegExp (): RegExp {
    return new RegExp(`(${ESCAPE_DELIMITER}${this.escapedDisplayClosing})`)
  }

  get regExp (): RegExp {
    return new RegExp([
      this.textWithInlineOpeningRegExp.source,
      this.textWithInlineClosingRegExp.source,
      this.textWithDisplayOpeningRegExp.source,
      this.textWithDisplayClosingRegExp.source,
      this.displayRegExp.source,
      this.inlineRegExp.source
    ].join('|'))
  }

  get replaceDisplayOpeningRegExp () {
    return new RegExp(`${ESCAPE_DELIMITER}${this.escapedDisplayOpening}`, 'g')
  }

  get replaceDisplayClosingRegExp () {
    return new RegExp(`${ESCAPE_DELIMITER}${this.escapedDisplayClosing}`, 'g')
  }

  get replaceInlineOpeningRegExp () {
    return new RegExp(`${ESCAPE_DELIMITER}${this.escapedInlineOpening}`, 'g')
  }

  get replaceInlineClosingRegExp () {
    return new RegExp(`${ESCAPE_DELIMITER}${this.escapedInlineClosing}`, 'g')
  }

  cleanValue (text: string) {
    return text
      .replace(this.replaceDisplayOpeningRegExp, this.displayOpening)
      .replace(this.replaceDisplayClosingRegExp, this.displayClosing)
      .replace(this.replaceInlineOpeningRegExp, this.inlineOpening)
      .replace(this.replaceInlineClosingRegExp, this.inlineClosing)
  }

}

const ESCAPE_DELIMITER = escapeStringRegexp('\\')

export const TEX_DELIMITERS = new Delimiters('$', '$$')
export const LATEX_DELIMITERS = new Delimiters('\\(', '\\)', '\\[', '\\]')

export function extractMath (input: string, delimiters: Delimiters = TEX_DELIMITERS): Segment[] {
  const segments: Segment[] = []
  const pattern: RegExp = delimiters.regExp

  let textWithInlineOpening: string
  let textWithInlineClosing: string
  let textWithDisplayOpening: string
  let textWithDisplayClosing: string
  let display: string
  let inline: string

  let [text, ...parts] = input.split(pattern)

  pushText(segments, text)

  while (parts.length > 0) {
    [textWithInlineOpening, textWithInlineClosing, textWithDisplayOpening, textWithDisplayClosing,
      display, inline, ...parts] = parts

    if (textWithInlineOpening) {
      pushText(segments, delimiters.inlineOpening)
    } else if (textWithInlineClosing) {
      pushText(segments, delimiters.inlineClosing)
    } else if (textWithDisplayOpening) {
      pushText(segments, delimiters.displayOpening)
    } else if (textWithDisplayClosing) {
      pushText(segments, delimiters.displayClosing)
    } else if (display) {
      pushMath(segments, 'display', display, delimiters)
    } else if (inline) {
      pushMath(segments, 'inline', inline, delimiters)
    }

    [text, ...parts] = parts

    pushText(segments, text)
  }

  return segments
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

function pushMath (segments: Segment[], mode: 'inline' | 'display', text: string, delimiters: Delimiters) {
  if (!text) {
    return
  }

  segments.push({ type: mode, math: true, value: delimiters.cleanValue(text), raw: text })
}
