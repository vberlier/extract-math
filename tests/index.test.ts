import { extractMath } from '../src'

test('empty input', () => {
  const segments = extractMath('')
  expect(segments).toEqual([])
})

test('plain text', () => {
  const segments = extractMath('hello world')
  expect(segments).toEqual([
    {
      type: 'text',
      math: false,
      value: 'hello world'
    }
  ])
})

test('escaped dollar', () => {
  const segments = extractMath('\\$')
  expect(segments).toEqual([
    {
      type: 'text',
      math: false,
      value: '$'
    }
  ])
})

test('inline math', () => {
  const segments = extractMath('$123 + \\$1$')
  expect(segments).toEqual([
    {
      type: 'inline',
      math: true,
      value: '123 + $1'
    }
  ])
})

test('display math', () => {
  const segments = extractMath('$$123 + \\$1$$')
  expect(segments).toEqual([
    {
      type: 'display',
      math: true,
      value: '123 + $1'
    }
  ])
})

test('combined text', () => {
  const segments = extractMath(`
    You can write text, that contains expressions like this: $x ^ 2 + 5$ inside them. As you probably know.
    You also can write expressions in display mode as follows: $$\\sum_{i=1}^n(x_i^2 - \\overline{x}^2)$$.
    In first case you will need to use \\$expression\\$ and in the second one \\$\\$expression\\$\\$.
    To scape the \\$ symbol it's mandatory to write as follows: \\\\$
  `)
  expect(segments).toMatchSnapshot()
})

test('escaped dollar in math', () => {
  const segments = extractMath(`$$hello\\$$$$t\\$hing\\$$\\$\\$$a$a`)
  expect(segments).toEqual([
    { type: 'display', math: true, value: 'hello$' },
    { type: 'inline', math: true, value: 't$hing$' },
    { type: 'text', math: false, value: '$$' },
    { type: 'inline', math: true, value: 'a' },
    { type: 'text', math: false, value: 'a' }
  ])
})
