import {
  Column, Float32, Float64,
  Int16, Int32, Int64, Int8,
  Uint16, Uint32, Uint64, Uint8, Vector
} from 'apache-arrow';
import profiler from './profiler';
import builder from '../builder';
import resolveType from '../builder/resolve-type';
import { arrowData, ceil64Bytes } from '../builder/util';
import isTypedArray from '../util/is-typed-array';
import scan from '../util/scan-column';

export default function(table, name, type, nullable = true) {
  type = resolveType(type);
  const column = table.column(name);
  const reified = !(table.isFiltered() || table.isOrdered());

  // use existing arrow data if types match
  if (reified && isArrowColumn(column) && typeCompatible(column.type, type)) {
    return Column.new(name, column.chunks || column);
  }

  // if backing data is a typed array, leverage that
  const data = column.data;
  if (isTypedArray(data)) {
    const dtype = typeFromArray(data);
    if (reified && dtype && typeCompatible(dtype, type)) {
      return Column.new(name, dataFromArray(data, dtype));
    } else {
      type = type || dtype;
      nullable = false;
    }
  }

  // perform type inference if needed
  if (!type) {
    const p = profile(table, column);
    nullable = p.nulls > 0;
    type = p.type();
  }

  return Column.new(name, dataFromTable(table, column, type, nullable));
}

function profile(table, column) {
  const p = profiler();
  scan(table, column, p.add);
  return p;
}

function isArrowColumn(value) {
  return value instanceof Column || value instanceof Vector;
}

const types = {
  Float32Array:    Float32,
  Float64Array:    Float64,
  Int8Array:       Int8,
  Int16Array:      Int16,
  Int32Array:      Int32,
  Uint8Array:      Uint8,
  Uint16Array:     Uint16,
  Uint32Array:     Uint32,
  BigInt64Array:   Int64,
  BigUint64Array:  Uint64
};

function typeFromArray(data) {
  const Type = types[data.constructor.name];
  return Type ? new Type() : null;
}

function typeCompatible(a, b) {
  return !a || !b ? true : a.compareTo(b);
}

function dataFromArray(array, type) {
  const length = array.length;
  const size = ceil64Bytes(length, array.BYTES_PER_ELEMENT);

  let data = array;
  if (length !== size) {
    data = new array.constructor(size);
    data.set(array);
  }

  return arrowData({ type, length, buffers: [null, data] });
}

export function dataFromTable(table, column, type, nullable = true) {
  const b = builder(type, table.numRows(), nullable);
  scan(table, column, b.set);
  return arrowData(b.data());
}