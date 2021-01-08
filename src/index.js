import { dataFromScan } from './encode/data-from';
import scanTable from './util/scan-table';

// export for testing only
export { profiler } from './encode/profiler';
export function dataFromTable(table, column, type, nullable) {
  const nrows = table.numRows();
  const scan = scanTable(table, Infinity, 0);
  return dataFromScan(nrows, scan, column, type, nullable);
}

// public API
export { Type } from 'apache-arrow';
export { default as toArrow } from './encode/to-arrow';