const tape = require('tape');
const {
  Bool, Table, Vector, Uint32, Int32, Float64, Dictionary, Utf8
} = require('apache-arrow');
const { table } = require('arquero');
const { dataFromTable } = require('..');

function rint(min, max) {
  let delta = min;
  if (max === undefined) {
    min = 0;
  } else {
    delta = max - min;
  }
  return (min + delta * Math.random()) | 0;
}

function ints(n, min, max, nullf) {
  const data = [];
  for (let i = 0; i < n; ++i) {
    const v = nullf && Math.random() < nullf ? null : rint(min, max);
    data.push(v);
  }
  return data;
}

function floats(n, min, max, nullf) {
  const data = [];
  const delta = max - min;
  for (let i = 0; i < n; ++i) {
    const v = nullf && Math.random() < nullf
      ? null
      : (min + delta * Math.random());
    data.push(v);
  }
  return data;
}

function sample(n, values, nullf) {
  const data = [];
  for (let i = 0; i < n; ++i) {
    const v = nullf && Math.random() < nullf
      ? null
      : values[~~(values.length * Math.random())];
    data.push(v);
  }
  return data;
}

function strings(n) {
  const c = 'bcdfghjlmpqrstvwxyz';
  const v = 'aeiou';
  const cn = c.length;
  const vn = v.length;
  const data = [];
  const map = {};
  while (data.length < n) {
    const s = c[rint(cn)] + v[rint(vn)] + c[rint(cn)] + c[rint(cn)];
    if (!map[s]) {
      data.push(s);
      map[s] = 1;
    }
  }
  return data;
}

function bools(n, nullf) {
  const data = [];
  for (let i = 0; i < n; ++i) {
    const v = nullf && Math.random() < nullf ? null : (Math.random() < 0.5);
    data.push(v);
  }
  return data;
}

function encode(t, type, values, nulls = true) {
  const dt = table({ values });

  const u0 = Date.now();
  const u = dataFromTable(dt, dt.column('values'), type, nulls);
  const a = Table.new([u], ['values']).serialize();
  const ut = Date.now() - u0;

  const v0 = Date.now();
  const v = Vector.from({ type, values, highWaterMark: 1e12 });
  const b = Table.new([v], ['values']).serialize();
  const vt = Date.now() - v0;

  const j0 = Date.now();
  const js = JSON.stringify(values);
  const jt = Date.now() - j0;
  const j = (new TextEncoder().encode(js));

  console.table([ // eslint-disable-line
    { method: 'json',  time: jt, bytes: j.length },
    { method: 'this',  time: ut, bytes: a.length },
    { method: 'arrow', time: vt, bytes: b.length }
  ]);

  t.end();
}

function run(N, nulls, msg) {
  const nullable = nulls !== 0;

  tape(`boolean: ${msg}`, t => {
    encode(t, new Bool(), bools(N, nulls), nullable);
  });

  tape(`integer: ${msg}`, t => {
    encode(t, new Int32(), ints(N, -10000, 10000, nulls), nullable);
  });

  tape(`float: ${msg}`, t => {
    encode(t, new Float64(), floats(N, -10000, 10000, nulls), nullable);
  });

  tape(`dictionary: ${msg}`, t => {
    encode(t,
      new Dictionary(new Utf8(), new Uint32(), 0),
      sample(N, strings(100), nulls),
      nullable
    );
  });
}

run(1e6, 0, '1M values');
run(1e6, 0.05, '1M values, 5% nulls');