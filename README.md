# arquero-arrow <a href="https://github.com/uwdata/arquero"><img align="right" src="https://github.com/uwdata/arquero/blob/master/docs/assets/logo.svg?raw=true" height="38"></img></a>

Arrow serialization support for [Arquero](https://github.com/uwdata/arquero). The `toArrow(data)` method encodes either an Arquero table or an array of objects into the [Apache Arrow](https://arrow.apache.org/) format. This package provides a convenient interface to the [apache-arrow](https://arrow.apache.org/docs/js/) JavaScript library, while also providing more performant encoders for standard integer, float, date, boolean, and string dictionary types.

## API Documentation

<a id="toArrow" href="#toArrow">#</a>
<em>aq</em>.<b>toArrow</b>(<i>input</i>, <i>types</i>) · [Source](https://github.com/uwdata/arquero-arrow/blob/master/src/encode/to-arrow.js)

Create an [Apache Arrow](https://arrow.apache.org/docs/js/) table for an *input* dataset. The input data can be either an [Arquero table](https://uwdata.github.io/arquero/api/#table) or an array of standard JavaScript objects. This method will throw an error if type inference fails or if the generated columns have differing lengths.

* *input*: An input dataset to convert to Arrow format. If array-valued, the data should consist of an array of objects where each entry represents a row and named properties represent columns. Otherwise, the input data should be an [Arquero table](https://uwdata.github.io/arquero/api/#table).
* *types*: An optional object indicating the [Arrow data type](https://arrow.apache.org/docs/js/enums/type.html) to use for named columns. If specified, the input should be an object with column names for keys and Arrow data types for values. If a column's data type is not explicitly provided, type inference will be performed.

  Type values can either be instantiated Arrow [DataType](https://arrow.apache.org/docs/js/classes/datatype.html) instances (for example, `new Float64()`,`new DateMilliseconds()`, *etc.*) or type enum codes (`Type.Float64`, `Type.Date`, `Type.Dictionary`). For convenience, arquero-arrow re-exports the apache-arrow `Type` enum object (see examples below). High-level types map to specific data type instances as follows:

  * `Type.Date` → `new DateMilliseconds()`
  * `Type.Dictionary` → `new Dictionary(new Utf8(), new Uint32())`
  * `Type.Float` → `new Float64()`
  * `Type.Int` → `new Int32()`
  * `Type.Interval` → `new IntervalYearMonth()`
  * `Type.Time` → `new TimeMillisecond()`

  Types that require additional parameters (including `List`, `Struct`, and `Timestamp`) can not be specified using type codes. Instead, use data type constructors from apache-arrow, such as `new List(new Int32())`.

*Examples*

```js
// Encode Arrow data from an input Arquero table
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
const at2 = toArrow(dt, { x: Type.Uint16, y: Type.Float32 });

// serialize Arrow table to a transferable byte array
const bytes = at1.serialize();
```

```js
// Register a `toArrow()` method for all Arquero tables
const { internal: { ColumnTable }, table } = require('arquero');
const { toArrow } = require('arquero-arrow');

// add new method to Arquero tables
ColumnTable.prototype.toArrow = function(types) {
  return toArrow(this, types);
};

// create Arquero table, encode as an Arrow table (infer data types)
const at = table({
  x: [1, 2, 3, 4, 5],
  y: [3.4, 1.6, 5.4, 7.1, 2.9]
}).toArrow();
```

```js
// Encode Arrow data from an input object array
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
