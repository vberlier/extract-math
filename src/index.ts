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
}

class Context {
  private readonly regex: RegExp
  private readonly escapedDelimiter: RegExp

  public readonly segments: Segment[] = []

  constructor (options?: ExtractMathOptions) {
    const escape = options?.escape ?? '\\'

    const [inlineBegin, inlineEnd] = options?.delimiters?.inline ?? ['$', '$']
    const [displayBegin, displayEnd] = options?.delimiters?.display ?? ['$$', '$$']

    const [escEscape, escInlineBegin, escInlineEnd, escDisplayBegin, escDisplayEnd] = [
      escape, inlineBegin, inlineEnd, displayBegin, displayEnd
    ].map(escapeStringRegexp)

    const escapedDelimiter = `${escEscape}(${escDisplayBegin}|${escDisplayEnd}|${escInlineBegin}|${escInlineEnd})`
    const displayMath = `${escDisplayBegin}(.*?[^${escEscape}])${escDisplayEnd}`
    const inlineMath = `${escInlineBegin}(.*?[^${escEscape}])${escInlineEnd}`

    this.regex = new RegExp(`${escapedDelimiter}|${displayMath}|${inlineMath}`)
    this.escapedDelimiter = new RegExp(escapedDelimiter, 'g')
  }

  public split (input: string) {
    return input.split(this.regex)
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

    this.segments.push({ type: mode, math: true, value: text.replace(this.escapedDelimiter, '$1'), raw: text })
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
    } else if (display) {
      ctx.pushMath('display', display)
    } else if (inline) {
      ctx.pushMath('inline', inline)
    }

    [text, ...parts] = rest

    ctx.pushText(text)
  }

  return ctx.segments
}
