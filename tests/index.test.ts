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
      value: 'hello world',
      raw: 'hello world'
    }
  ])
})

test('escaped dollar', () => {
  const segments = extractMath('\\$')
  expect(segments).toEqual([
    {
      type: 'text',
      math: false,
      value: '$',
      raw: '$'
    }
  ])
})

test('inline math', () => {
  const segments = extractMath('$123 + \\$1$')
  expect(segments).toEqual([
    {
      type: 'inline',
      math: true,
      value: '123 + $1',
      raw: '123 + \\$1'
    }
  ])
})

test('display math', () => {
  const segments = extractMath('$$123 + \\$1$$')
  expect(segments).toEqual([
    {
      type: 'display',
      math: true,
      value: '123 + $1',
      raw: '123 + \\$1'
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
  const segments = extractMath('$$hello\\$$$$t\\$hing\\$$\\$\\$a$a$a')
  expect(segments).toEqual([
    { type: 'display', math: true, value: 'hello$', raw: 'hello\\$' },
    { type: 'inline', math: true, value: 't$hing$', raw: 't\\$hing\\$' },
    { type: 'text', math: false, value: '$$a', raw: '$$a' },
    { type: 'inline', math: true, value: 'a', raw: 'a' },
    { type: 'text', math: false, value: 'a', raw: 'a' }
  ])
})

test('custom delimiters', () => {
  const segments = extractMath('#foo bar@', { delimiters: { inline: ['#', '@'] } })
  expect(segments).toEqual([
    {
      type: 'inline',
      math: true,
      value: 'foo bar',
      raw: 'foo bar'
    }
  ])
})

test('custom delimiters and custom escape', () => {
  const segments = extractMath('*[hello.*)*]*(t.*)hing.*)*).*(.*(a*(a*)a', {
    escape: '.',
    delimiters: {
      inline: ['*(', '*)'],
      display: ['*[', '*]']
    }
  })
  expect(segments).toEqual([
    { type: 'display', math: true, value: 'hello*)', raw: 'hello.*)' },
    { type: 'inline', math: true, value: 't*)hing*)', raw: 't.*)hing.*)' },
    { type: 'text', math: false, value: '*(*(a', raw: '*(*(a' },
    { type: 'inline', math: true, value: 'a', raw: 'a' },
    { type: 'text', math: false, value: 'a', raw: 'a' }
  ])
})

test('combined text custom delimiters', () => {
  const segments = extractMath(`
    Text with an inline formula @x ^ 2 + 5@ and a displayed equation:

    &\\sum_{i=1}^n(x_i^2 - \\overline{x}^2)&

    The inline formula is represented as \\@expression\\@ and the displayed equation as \\&expression\\&.
    The \\@ symbol can be escaped like this: \\\\@
    The \\& symbol can be escaped like this: \\\\&
  `, {
    delimiters: {
      inline: ['@', '@'],
      display: ['&', '&']
    }
  })
  expect(segments).toMatchSnapshot()
})

test('combined text custom opening and closing delimiters', () => {
  const segments = extractMath(`
    Text with an inline formula \\(x ^ 2 + 5\\) and a displayed equation:

    \\[\\sum_{i=1}^n(x_i^2 - \\overline{x}^2)\\]

    The inline formula is represented as \\\\(expression\\\\) and the displayed equation as \\\\[expression\\\\].
    The \\\\( symbol can be escaped like this: \\\\\\(
    The \\\\) symbol can be escaped like this: \\\\\\)
    The \\\\[ symbol can be escaped like this: \\\\\\[
    The \\\\] symbol can be escaped like this: \\\\\\]
  `, {
    delimiters: {
      inline: ['\\(', '\\)'],
      display: ['\\[', '\\]']
    }
  })
  expect(segments).toMatchSnapshot()
})
