# extract-math

[![Build Status](https://travis-ci.com/vberlier/extract-math.svg?branch=master)](https://travis-ci.com/vberlier/extract-math)
[![npm](https://img.shields.io/npm/v/extract-math.svg)](https://www.npmjs.com/package/extract-math)

> Extract TeX math environments.

This package parses Tex shorthands for mathematics environments and extracts inlined formulas (e.g.: `$x + 1$`) and displayed equations (e.g.: `$$\sum_{i=1}^n 2^i$$`).

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

TODO...

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
