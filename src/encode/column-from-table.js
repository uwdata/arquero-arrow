import {
  Column, Float32, Float64,
  Int16, Int32, Int64, Int8,
  Uint16, Uint32, Uint64, Uint8, Vector
} from 'apache-arrow';
import { dataFromArray, dataFromScan } from './data-from';
import { profile } from './profiler';
import resolveType from '../builder/resolve-type';
import isTypedArray from '../util/is-typed-array';

export default function(table, name, nrows, scan, type, nullable = true) {
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
    const p = profile(scan, column);
    nullable = p.nulls > 0;
    type = p.type();
  }

  return Column.new(
    name,
    dataFromScan(nrows, scan, column, type, nullable)
  );
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