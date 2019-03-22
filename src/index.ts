export interface Segment {
  type: "text" | "display" | "inline"
  math: boolean
  value: string
}

export function extractMath(text: string): Segment[] {
  return [
    {
      type: "text",
      math: false,
      value: text
    }
  ]
}
