const tape = require('tape');
const {
  Float64, Int8, Int16, Int32, Int64,
  Uint8, Uint16, Uint32, Uint64
} = require('apache-arrow');
const { profiler } = require('..');

function profile(array) {
  const p = profiler();
  array.forEach(value => p.add(value));
  return p;
}

tape('dataFrom infers integer types', t => {
  const types = {
    uint8:   new Uint8(),
    uint16:  new Uint16(),
    uint32:  new Uint32(),
    int8:    new Int8(),
    int16:   new Int16(),
    int32:   new Int32()
  };

  const dt = {
    uint8:   [0, 1 << 7, 1 << 8 - 1],
    uint16:  [0, 1 << 15, 1 << 16 - 1],
    uint32:  [0, 2 ** 31 - 1, 2 ** 32 - 1],
    int8:    [-(1 << 7), 0, (1 << 7) - 1],
    int16:   [-(1 << 15), 0, (1 << 15) - 1],
    int32:   [(1 << 31), 0, 2 ** 31 - 1]
  };

  Object.keys(dt).forEach(name => {
    const type = profile(dt[name]).type();
    t.ok(types[name].compareTo(type), `${name} type`);
  });

  const float = new Float64();
  t.ok(
    float.compareTo(profile([0, 1, 2 ** 32]).type()),
    'overflow to float64 type'
  );
  t.ok(
    float.compareTo(profile([(1 << 31), 0, 2 ** 32 - 1]).type()),
    'overflow to float64 type'
  );
  t.ok(
    float.compareTo(profile([(1 << 31) - 1, 0, 1]).type()),
    'underflow to float64 type'
  );

  t.end();
});

tape('dataFrom infers bigint types', t => {
  const types = {
    int64:   new Int64(),
    uint64:  new Uint64()
  };

  const dt = {
    int64:   [-(2n ** 63n), 0n, (2n ** 63n) - 1n],
    uint64:  [0n, 1n, 2n ** 64n - 1n]
  };

  Object.keys(dt).forEach(name => {
    const type = profile(dt[name]).type();
    t.ok(types[name].compareTo(type), `${name} type`);
  });

  t.throws(
    () => profile([0n, 1n, 2n ** 64n]).type(),
    'throws on overflow'
  );
  t.throws(
    () => profile([-(2n ** 63n), 0n, 2n ** 63n]).type(),
    'throws on underflow'
  );

  t.end();
});