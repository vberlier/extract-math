import { extractMath } from "../src"

test("empty input", () => {
  const segments = extractMath("")
  expect(segments).toEqual([
    {
      type: "text",
      math: false,
      value: ""
    }
  ])
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
