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
    Text with an inline formula $x ^ 2 + 5$ and a displayed equation:

    $$\\sum_{i=1}^n(x_i^2 - \\overline{x}^2)$$

    The inline formula is represented as \\$expression\\$ and the displayed equation as \\$\\$expression\\$\\$.
    The \\$ symbol can be escaped like this: \\\\$
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
