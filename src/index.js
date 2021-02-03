import { dataFromScan } from './encode/data-from';
import scanTable from './util/scan-table';
import toArrow from './encode/to-arrow';

// export for testing only
export { profiler } from './encode/profiler';
export function dataFromTable(table, column, type, nullable) {
  const nrows = table.numRows();
  const scan = scanTable(table, Infinity, 0);
  return dataFromScan(nrows, scan, column, type, nullable);
}

// public API
const arquero_package = {
  tableMethods: { toArrow }
};
export { arquero_package, toArrow };
export { Type } from 'apache-arrow';