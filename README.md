# extract-math

[![Build Status](https://travis-ci.com/vberlier/extract-math.svg?branch=master)](https://travis-ci.com/vberlier/extract-math)
[![npm](https://img.shields.io/npm/v/extract-math.svg)](https://www.npmjs.com/package/extract-math)
[![npm bundle size](https://img.shields.io/bundlephobia/minzip/extract-math.svg)](https://bundlephobia.com/result?p=extract-math)

> Extract TeX math environments.

This package parses [TeX shorthands](https://en.wikibooks.org/wiki/LaTeX/Mathematics#Mathematics_environments) for mathematics environments and extracts inline formulas (e.g.: `$x + 1$`) and displayed equations (e.g.: `$$\sum_{i=1}^n 2^i$$`).

```js
import { extractMath } from 'extract-math'

const segments = extractMath('hello $e^{i\\pi}$')

console.log(segments)
// Output: [
//   { type: 'text', math: false, value: 'hello ', raw: 'hello ' },
//   { type: 'inline', math: true, value: 'e^{i\\pi}', raw: 'e^{i\\pi}' }
// ]
```

The primary use-case is to process the math segments with a math typesetting library like [KaTeX](https://katex.org/).

## Installation

You can install `extract-math` with your `npm` client of choice.

```bash
$ npm install extract-math
```

## Usage

### extractMath(input, options?)

Parse the input string and return an array of `Segment` objects. `Segment` objects are defined by the following typescript interface:

```ts
interface Segment {
  type: 'text' | 'display' | 'inline'
  math: boolean
  value: string
  raw: string
}
```

> The `Segment` interface can be imported with `import { Segment } from 'extract-math'`

The function splits the input string into 3 different types of segments:

- Plain text segments have a `text` type and the `math` property set to `false`
- Displayed equations have a `display` type and the `math` property set to `true`
- Inline formulas have an `inline` type and the `math` property set to `true`

The function will check that the closing delimiter isn't immediately followed by a digit before extracting a math segment. This prevents input like `$20,000 and $30,000` from being interpreted as inline math.

The second parameter is optional and lets you specify custom options:

```ts
interface ExtractMathOptions {
  escape?: string
  delimiters?: {
    inline?: [string, string]
    display?: [string, string]
  }
  allowSurroundingSpace?: Array<'display' | 'inline'>
}
```

> The `ExtractMathOptions` interface can be imported with `import { ExtractMathOptions } from 'extract-math'`

Here are the default values:

```js
{
  escape: '\\',
  delimiters: {
    inline: ['$', '$'],
    display: ['$$', '$$']
  },
  allowSurroundingSpace: ['display']
}
```

You can extract formulas that use LaTeX math delimiters with the following options:

```js
const segments = extractMath('hello \\(e^{i\\pi}\\)', {
  delimiters: {
    inline: ['\\(', '\\)'],
    display: ['\\[', '\\]']
  }
})

console.log(segments)
// Output: [
//   { type: 'text', math: false, value: 'hello ', raw: 'hello ' },
//   { type: 'inline', math: true, value: 'e^{i\\pi}', raw: 'e^{i\\pi}' }
// ]
```

By default, only the `display` mode allows the formula to be surrounded by space. You can change this with the `allowSurroundingSpace` option:

```js
segments = extractMath('$ 42 $$$ 42 $$', {
  allowSurroundingSpace: ['inline', 'display']
})

console.log(segments)
// Output: [
//   { type: 'inline', math: true, value: ' 42 ', raw: ' 42 ' },
//   { type: 'display', math: true, value: ' 42 ', raw: ' 42 ' }
// ]
```

### Escaping

Any delimiter immediately preceded by a backslash `\` will be automatically escaped.

```js
const segments = extractMath('in plain \\$ text $$in \\$ equation$$')

console.log(segments)
// Output: [
//   { type: 'text', math: false, value: 'in plain $ text ', raw: 'in plain $ text ' },
//   { type: 'display', math: true, value: 'in $ equation', raw: 'in \\$ equation' }
// ]
```

The `raw` property is set to the original string without interpreting the escape sequences. For plain text segments, the property is equal to the `value` property.

This comes in handy if you're feeding the math expressions to a math typesetting library like [KaTeX](https://katex.org/) that expects dollar signs to be escaped.

```js
katex.render(segments[1].raw, ...)
```

## Contributing

Contributions are welcome. This project uses [jest](https://jestjs.io/) for testing.

```bash
$ npm test
```

The code follows the [javascript standard](https://standardjs.com/) style guide [adapted for typescript](https://github.com/standard/eslint-config-standard-with-typescript).

```bash
$ npm run lint
```

---

License - [MIT](https://github.com/vberlier/extract-math/blob/master/LICENSE)
