# arquero-arrow <a href="https://github.com/uwdata/arquero"><img align="right" src="https://github.com/uwdata/arquero/blob/master/docs/assets/logo.svg?raw=true" height="38"></img></a>

Arrow serialization support for [Arquero](https://github.com/uwdata/arquero). The `toArrow(data)` method encodes either an Arquero table or an array of objects into the [Apache Arrow](https://arrow.apache.org/) format.

## Example

Encode Arrow data from an input Arquero table:

```js
import { table } from 'arquero';
import { toArrow, Type } from 'arquero-arrow';

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

Register a `toArrow()` method for all Arquero tables:

```js
import { internal, table } from 'arquero';
import { toArrow } from 'arquero-arrow';

// add new method to Arquero tables
internal.ColumnTable.prototype.toArrow = function(types) {
  return toArrow(this, types);
};

// create Arquero table, encode as an Arrow table (infer data types)
const at = table({
  x: [1, 2, 3, 4, 5],
  y: [3.4, 1.6, 5.4, 7.1, 2.9]
}).toArrow();
```

Encode Arrow data from an input object array:

```js
import { toArrow } from 'arquero-arrow';

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
