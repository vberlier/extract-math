import escapeStringRegexp from 'escape-string-regexp'

export interface Segment {
  type: 'text' | 'display' | 'inline'
  math: boolean
  value: string
  raw: string
}

export interface ExtractMathOptions {
  escape?: string
  delimiters?: {
    inline?: [string, string]
    display?: [string, string]
  }
  allowSurroundingSpace?: Array<'display' | 'inline'>
}

class Context {
  private readonly delimiters: {
    inline: [string, string]
    display: [string, string]
  }

  private readonly allowSurroundingSpace: Set<'display' | 'inline'>

  private readonly regex: RegExp
  private readonly escapedDelimiter: RegExp

  public readonly segments: Segment[] = []

  constructor (options?: ExtractMathOptions) {
    const escape = options?.escape ?? '\\'

    this.delimiters = {
      inline: options?.delimiters?.inline ?? ['$', '$'],
      display: options?.delimiters?.display ?? ['$$', '$$']
    }

    this.allowSurroundingSpace = new Set(options?.allowSurroundingSpace ?? ['display'])

    const [escEscape, escInlineBegin, escInlineEnd, escDisplayBegin, escDisplayEnd] = [
      escape,
      this.delimiters.inline[0],
      this.delimiters.inline[1],
      this.delimiters.display[0],
      this.delimiters.display[1]
    ].map(escapeStringRegexp)

    const escapedDelimiter = `${escEscape}(${escDisplayBegin}|${escDisplayEnd}|${escInlineBegin}|${escInlineEnd})`
    const displayMath = `${escDisplayBegin}(.*?[^${escEscape}])${escDisplayEnd}`
    const inlineMath = `${escInlineBegin}(.*?[^${escEscape}])${escInlineEnd}`

    this.regex = new RegExp([escapedDelimiter, displayMath, inlineMath].join('|'))
    this.escapedDelimiter = new RegExp(escapedDelimiter, 'g')
  }

  public split (input: string) {
    return input.split(this.regex)
  }

  public wrap (input: string, mode: 'inline' | 'display') {
    return this.delimiters[mode].join(input)
  }

  public pushText (text: string) {
    if (!text) {
      return
    }

    const last = this.segments[this.segments.length - 1]

    if (last && last.type === 'text') {
      last.value += text
      last.raw += text
    } else {
      this.segments.push({ type: 'text', math: false, value: text, raw: text })
    }
  }

  public pushMath (mode: 'inline' | 'display', text: string) {
    if (!text) {
      return
    }

    if (!this.allowSurroundingSpace.has(mode) && text.match(/^\s|\s$/)) {
      this.pushText(this.wrap(text, mode))
    } else {
      this.segments.push({ type: mode, math: true, value: text.replace(this.escapedDelimiter, '$1'), raw: text })
    }
  }
}

export function extractMath (input: string, options?: ExtractMathOptions): Segment[] {
  const ctx = new Context(options)

  let [text, ...parts] = ctx.split(input)

  ctx.pushText(text)

  while (parts.length > 0) {
    const [delimiter, display, inline, ...rest] = parts

    if (delimiter) {
      ctx.pushText(delimiter)
    } else {
      const mode = display ? 'display' : 'inline'
      const math = display || inline

      if (rest[0].match(/^\d/)) {
        ctx.pushText(ctx.wrap(math, mode))
      } else {
        ctx.pushMath(mode, math)
      }
    }

    [text, ...parts] = rest

    ctx.pushText(text)
  }

  return ctx.segments
}
