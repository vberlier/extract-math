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
  const segments = extractMath('$$hello\\$$$$$t\\$hing\\$$\\$\\$a$a$a')
  expect(segments).toEqual([
    { type: 'display', math: true, value: 'hello$$', raw: 'hello\\$$' },
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

test('inline with surrounding space', () => {
  const segments = extractMath('hello $ 1 + 2 $')
  expect(segments).toEqual([
    { type: 'text', math: false, value: 'hello $ 1 + 2 $', raw: 'hello $ 1 + 2 $' }
  ])
})

test('display with surrounding space', () => {
  const segments = extractMath('hello $$ 1 + 2 $$')
  expect(segments).toEqual([
    { type: 'text', math: false, value: 'hello ', raw: 'hello ' },
    { type: 'display', math: true, value: ' 1 + 2 ', raw: ' 1 + 2 ' }
  ])
})

test('custom delimiters and inline with surrounding space', () => {
  const segments = extractMath('hello =| 1 + 2 |=', {
    delimiters: {
      inline: ['=|', '|=']
    }
  })
  expect(segments).toEqual([
    { type: 'text', math: false, value: 'hello =| 1 + 2 |=', raw: 'hello =| 1 + 2 |=' }
  ])
})

test('custom delimiters and inline with surrounding space and inline allowed', () => {
  const segments = extractMath('hello =| 1 + 2 |=', {
    delimiters: {
      inline: ['=|', '|=']
    },
    allowSurroundingSpace: ['inline']
  })
  expect(segments).toEqual([
    { type: 'text', math: false, value: 'hello ', raw: 'hello ' },
    { type: 'inline', math: true, value: ' 1 + 2 ', raw: ' 1 + 2 ' }
  ])
})

test('pandoc example', () => {
  const segments = extractMath('math $here$ 1 but not for $20,000 and $30,000')
  expect(segments).toEqual([
    { type: 'text', math: false, value: 'math ', raw: 'math ' },
    { type: 'inline', math: true, value: 'here', raw: 'here' },
    { type: 'text', math: false, value: ' 1 but not for $20,000 and $30,000', raw: ' 1 but not for $20,000 and $30,000' }
  ])
})

test('just text with prices', () => {
  const segments = extractMath('John had $5 in his pocket while Jane had $6.')
  expect(segments).toEqual([
    {
      type: 'text',
      math: false,
      value: 'John had $5 in his pocket while Jane had $6.',
      raw: 'John had $5 in his pocket while Jane had $6.'
    }
  ])
})

test('text with prices and inline math', () => {
  const segments = extractMath('John had $5 in his $pocket$ while Jane had $6.')
  expect(segments).toEqual([
    {
      type: 'text',
      math: false,
      value: 'John had $5 in his ',
      raw: 'John had $5 in his '
    },
    { type: 'inline', math: true, value: 'pocket', raw: 'pocket' },
    {
      type: 'text',
      math: false,
      value: ' while Jane had $6.',
      raw: ' while Jane had $6.'
    }
  ])
})
