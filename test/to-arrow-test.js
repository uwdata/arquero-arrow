const tape = require('tape');
const { readFileSync } = require('fs');
const { Int8Vector, Table } = require('apache-arrow');
const { fromArrow, fromCSV, fromJSON, table } = require('arquero');
const { toArrow } = require('..');

function date(year, month=0, date=1, hours=0, minutes=0, seconds=0, ms=0) {
  return new Date(year, month, date, hours, minutes, seconds, ms);
}

function utc(year, month=0, date=1, hours=0, minutes=0, seconds=0, ms=0) {
  return new Date(Date.UTC(year, month, date, hours, minutes, seconds, ms));
}

function isArrayType(value) {
  return Array.isArray(value)
    || (value && value.map === Int8Array.prototype.map);
}

function compareTables(aqt, art) {
  const err = aqt.columnNames()
    .map(name => compareColumns(name, aqt, art))
    .filter(a => a.length);
  return err.length;
}

function compareColumns(name, aqt, art) {
  const normalize = v => v === undefined ? null : v instanceof Date ? +v : v;
  const idx = aqt.indices();
  const aqc = aqt.column(name);
  const arc = art.getColumn(name);
  const err = [];
  for (let i = 0; i < idx.length; ++i) {
    let v1 = normalize(aqc.get(idx[i]));
    let v2 = normalize(arc.get(i));
    if (isArrayType(v1)) {
      v1 = v1.join();
      v2 = [...v2].join();
    } else if (typeof v1 === 'object') {
      v1 = JSON.stringify(v1);
      v2 = JSON.stringify(v2);
    }
    if (v1 !== v2) {
      err.push({ name, index: i, v1, v2 });
    }
  }
  return err;
}

tape('toArrow produces Arrow data for an input table', t => {
  const dt = table({
    i: [1, 2, 3, undefined, 4, 5],
    f: Float32Array.from([1.2, 2.3, 3.0, 3.4, null, 4.5]),
    n: [4.5, 4.4, 3.4, 3.0, 2.3, 1.2],
    b: [true, true, false, true, null, false],
    s: ['foo', null, 'bar', 'baz', 'baz', 'bar'],
    d: [date(2000,0,1), date(2000,1,2), null, date(2010,6,9), date(2018,0,1), date(2020,10,3)],
    u: [utc(2000,0,1), utc(2000,1,2), null, utc(2010,6,9), utc(2018,0,1), utc(2020,10,3)],
    e: [null, null, null, null, null, null],
    v: Int8Vector.from([10, 9, 8, 7, 6, 5]),
    a: [[1, null, 3], [4, 5], null, [6, 7], [8, 9], []],
    l: [[1], [2], [3], [4], [5], [6]],
    o: [1, 2, 3, null, 5, 6].map(v => v ? { key: v } : null)
  });

  const at = toArrow(dt);

  t.equal(
    compareTables(dt, at), 0,
    'arquero and arrow tables match'
  );

  t.equal(
    compareTables(dt, toArrow(dt.objects())), 0,
    'object array and arrow tables match'
  );

  const buffer = at.serialize();
  const bt = Table.from(buffer);

  t.equal(
    compareTables(dt, bt), 0,
    'arquero and serialized arrow tables match'
  );

  t.equal(
    compareTables(fromArrow(bt), at), 0,
    'serialized arquero and arrow tables match'
  );

  t.end();
});

tape('toArrow produces Arrow data for an input CSV', async t => {
  const dt = fromCSV(readFileSync('test/data/beers.csv', 'utf8'));
  const st = dt.derive({ name: d => d.name + '' });
  const at = toArrow(dt);

  t.equal(
    compareTables(st, at), 0,
    'arquero and arrow tables match'
  );

  t.equal(
    compareTables(st, toArrow(st.objects())), 0,
    'object array and arrow tables match'
  );

  const buffer = at.serialize();

  t.equal(
    compareTables(st, Table.from(buffer)), 0,
    'arquero and serialized arrow tables match'
  );

  t.equal(
    compareTables(fromArrow(Table.from(buffer)), at), 0,
    'serialized arquero and arrow tables match'
  );

  t.end();
});

tape('toArrow handles ambiguously typed data', async t => {
  const at = toArrow(table({ x: [1, 2, 3, 'foo'] }));
  t.deepEqual(
    [...at.getColumn('x')],
    ['1', '2', '3', 'foo'],
    'fallback to string type if a string is observed'
  );

  t.throws(
    () => toArrow(table({ x: [1, 2, 3, true] })),
    'fail on mixed types'
  );

  t.end();
});

tape('toArrow result produces serialized arrow data', t => {
  const dt = fromCSV(readFileSync('test/data/beers.csv', 'utf8'))
    .derive({ name: d => d.name + '' });

  const json = dt.toJSON();
  const jt = fromJSON(json);

  const bytes = toArrow(dt).serialize();
  const bt = fromArrow(Table.from(bytes));

  t.deepEqual(
    [bt.toJSON(), jt.toJSON()],
    [json, json],
    'arrow and json round trips match'
  );

  t.end();
});