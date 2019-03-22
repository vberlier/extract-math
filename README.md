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
//   { type: 'text', math: false, value: 'hello ' },
//   { type: 'inline', math: true, value: 'e^{i\\pi}' }
// ]
```

## Installation

You can install `extract-math` with your `npm` client of choice.

```bash
$ npm install extract-math
```

## Usage

### extractMath(input)

Parse the input string and return an array of `Segment` objects. `Segment` objects are defined by the following typescript interface:

```ts
interface Segment {
  type: 'text' | 'display' | 'inline'
  math: boolean
  value: string
}
```

> The `Segment` interface can be imported with `import { Segment } from 'extract-math'`

The function splits the input string into 3 different types of segments:

- Plain text segments have a `text` type and the `math` property set to `false`
- Displayed equations have a `display` type and the `math` property set to `true`
- Inline formulas have an `inline` type and the `math` property set to `true`

### Escaping

Any dollar sign `$` immediately preceded by a backslash `\` will be automatically escaped.

```js
const segments = extractMath('in plain \\$ text $$in \\$ equation$$')
console.log(segments)
// Output: [
//   { type: 'text', math: false, value: 'in plain $ text ' },
//   { type: 'display', math: true, value: 'in $ equation' }
// ]
```

## Contributing

Contributions are welcome. This project uses [jest](https://jestjs.io/) for testing.

```bash
$ npm test
```

The code follows the [javascript standard](https://standardjs.com/) style guide [adapted for typescript](https://github.com/blakeembrey/tslint-config-standard).

```bash
$ npm run lint
```

---

License - [MIT](https://github.com/vberlier/extract-math/blob/master/LICENSE)
