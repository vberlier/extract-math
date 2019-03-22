import { extractMath } from "../src"

test("empty input", () => {
  const segments = extractMath("")
  expect(segments).toEqual([])
})

test("plain text", () => {
  const segments = extractMath("hello world")
  expect(segments).toEqual([
    {
      type: "text",
      math: false,
      value: "hello world"
    }
  ])
})

test("escaped dollar", () => {
  const segments = extractMath("\\$")
  expect(segments).toEqual([
    {
      type: "text",
      math: false,
      value: "$"
    }
  ])
})

test("inline math", () => {
  const segments = extractMath("$123 + \\$1$")
  expect(segments).toEqual([
    {
      type: "inline",
      math: true,
      value: "123 + $1"
    }
  ])
})

test("display math", () => {
  const segments = extractMath("$$123 + \\$1$$")
  expect(segments).toEqual([
    {
      type: "display",
      math: true,
      value: "123 + $1"
    }
  ])
})
