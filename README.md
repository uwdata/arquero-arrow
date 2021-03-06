# arquero-arrow <a href="https://github.com/uwdata/arquero"><img align="right" src="https://github.com/uwdata/arquero/blob/master/docs/assets/logo.svg?raw=true" height="38"></img></a>

**NOTE: This package has been consolidated into the [uwdata/arquero](https://github.com/uwdata/arquero) package, where future development and issues will be handled. This repository has been archived and is now read-only.**

<hr/>

Arrow serialization support for [Arquero](https://github.com/uwdata/arquero). The `toArrow(data)` method encodes either an Arquero table or an array of objects into the [Apache Arrow](https://arrow.apache.org/) format. This package provides a convenient interface to the [apache-arrow](https://arrow.apache.org/docs/js/) JavaScript library, while also providing more performant encoders for standard integer, float, date, boolean, and string dictionary types.

For more examples and context, see the [Arquero and Apache Arrow notebook](https://observablehq.com/@uwdata/arquero-and-apache-arrow).

## API Documentation

<a id="toArrow" href="#toArrow">#</a>
<em>aq</em>.<b>toArrow</b>(<i>input</i>, <i>types</i>) · [Source](https://github.com/uwdata/arquero-arrow/blob/master/src/encode/to-arrow.js)

Create an [Apache Arrow](https://arrow.apache.org/docs/js/) table for an *input* dataset. The input data can be either an [Arquero table](https://uwdata.github.io/arquero/api/#table) or an array of standard JavaScript objects. This method will throw an error if type inference fails or if the generated columns have differing lengths.

* *input*: An input dataset to convert to Arrow format. If array-valued, the data should consist of an array of objects where each entry represents a row and named properties represent columns. Otherwise, the input data should be an [Arquero table](https://uwdata.github.io/arquero/api/#table).
* *options*: Options for Arrow encoding.
  * *columns*: Ordered list of column names to include. If function-valued, the function should accept the *input* data as a single argument and return an array of column name strings.
  * *limit*: The maximum number of rows to include (default `Infinity`).
  * *offset*: The row offset indicating how many initial rows to skip (default `0`).
  * *types*: An optional object indicating the [Arrow data type](https://arrow.apache.org/docs/js/enums/type.html) to use for named columns. If specified, the input should be an object with column names for keys and Arrow data types for values. If a column's data type is not explicitly provided, type inference will be performed.

    Type values can either be instantiated Arrow [DataType](https://arrow.apache.org/docs/js/classes/datatype.html) instances (for example, `new Float64()`,`new DateMilliseconds()`, *etc.*) or type enum codes (`Type.Float64`, `Type.Date`, `Type.Dictionary`). For convenience, arquero-arrow re-exports the apache-arrow `Type` enum object (see examples below). High-level types map to specific data type instances as follows:

    * `Type.Date` → `new DateMilliseconds()`
    * `Type.Dictionary` → `new Dictionary(new Utf8(), new Int32())`
    * `Type.Float` → `new Float64()`
    * `Type.Int` → `new Int32()`
    * `Type.Interval` → `new IntervalYearMonth()`
    * `Type.Time` → `new TimeMillisecond()`

    Types that require additional parameters (including `List`, `Struct`, and `Timestamp`) can not be specified using type codes. Instead, use data type constructors from apache-arrow, such as `new List(new Int32())`.

*Examples*

Encode Arrow data from an input Arquero table:

```js
const { table } = require('arquero');
const { toArrow, Type } = require('arquero-arrow');

// create Arquero table
const dt = table({
  x: [1, 2, 3, 4, 5],
  y: [3.4, 1.6, 5.4, 7.1, 2.9]
});

// encode as an Arrow table (infer data types)
// here, infers Uint8 for 'x' and Float64 for 'y'
const at1 = toArrow(dt);

// encode into Arrow table (set explicit data types)
const at2 = toArrow(dt, {
  types: {
    x: Type.Uint16,
    y: Type.Float32
  }
});

// serialize Arrow table to a transferable byte array
const bytes = at1.serialize();
```

Register a `toArrow()` method for all Arquero tables (requires Arquero v2.3 or higher):

```js
const { addPackage, table } = require('arquero');

// install the package bundle exported by arquero-arrow,
// adding a toArrow method to all Arquero tables
addPackage(require('arquero-arrow'));

// create Arquero table, encode as an Arrow table (infer data types)
const at = table({
  x: [1, 2, 3, 4, 5],
  y: [3.4, 1.6, 5.4, 7.1, 2.9]
}).toArrow();
```

Encode Arrow data from an input object array:

```js
const { toArrow } = require('arquero-arrow');

// encode object array as an Arrow table (infer data types)
const at = toArrow([
  { x: 1, y: 3.4 },
  { x: 2, y: 1.6 },
  { x: 3, y: 5.4 },
  { x: 4, y: 7.1 },
  { x: 5, y: 2.9 }
]);
```

## Build Instructions

To build and develop locally:

- Clone [https://github.com/uwdata/arquero-arrow](https://github.com/uwdata/arquero-arrow).
- Run `yarn` to install dependencies for all packages. If you don't have yarn installed, see [https://yarnpkg.com/en/docs/install](https://yarnpkg.com/en/docs/install).
- Run `yarn test` to run test cases, `yarn perf` to run performance benchmarks, and `yarn build` to build output files.
