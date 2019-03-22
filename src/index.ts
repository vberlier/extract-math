export interface Segment {
  type: 'text' | 'display' | 'inline'
  math: boolean
  value: string
}

export const SEGMENTS_REGEX = /(\\\$)|\$\$(.*?[^\\])\$\$|\$(.*?[^\\])\$/

export function extractMath (input: string): Segment[] {
  const segments: Segment[] = []

  let dollar: string
  let display: string
  let inline: string

  let [text, ...parts] = input.split(SEGMENTS_REGEX)

  pushText(segments, text)

  while (parts.length > 0) {
    [dollar, display, inline, ...parts] = parts

    if (dollar) {
      pushText(segments, '$')
    } else if (display) {
      pushMath(segments, 'display', display)
    } else if (inline) {
      pushMath(segments, 'inline', inline)
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
  } else {
    segments.push({
      type: 'text',
      math: false,
      value: text
    })
  }
}

function pushMath (
  segments: Segment[],
  mode: 'inline' | 'display',
  text: string
) {
  if (!text) {
    return
  }

  segments.push({
    type: mode,
    math: true,
    value: text.replace(/\\\$/g, '$')
  })
}
