import { Column } from 'apache-arrow';
import profiler from './profiler';
import builder from '../builder';
import resolveType from '../builder/resolve-type';
import { arrowData } from '../builder/util';

export default function(values, name, type, nullable = true) {
  type = resolveType(type);

  // perform type inference if needed
  if (!type) {
    const p = profile(values, name);
    nullable = p.nulls > 0;
    type = p.type();
  }

  return Column.new(
    name,
    dataFrom(values, name, type, nullable)
  );
}

function dataFrom(values, name, type, nullable = true) {
  const b = builder(type, values.length, nullable);
  values.forEach((obj, index) => b.set(obj[name], index));
  return arrowData(b.data());
}

function profile(values, name) {
  const p = profiler();
  values.forEach(obj => p.add(obj[name]));
  return p;
}