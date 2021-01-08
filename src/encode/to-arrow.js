import { Table } from 'apache-arrow';
import columnFromObjects from './column-from-objects';
import columnFromTable from './column-from-table';
import error from '../util/error';
import isArray from '../util/is-array';
import isFunction from '../util/is-function';
import scanArray from '../util/scan-array';
import scanTable from '../util/scan-table';

/**
 * Options for Arrow encoding.
 * @typedef {object} ArrowFormatOptions
 * @property {number} [limit=Infinity] The maximum number of rows to include.
 * @property {number} [offset=0] The row offset indicating how many initial
 *  rows to skip.
 * @property {string[]} [columns] Ordered list of column names to include.
 *  If function-valued, the function should accept a dataset as input and
 *  return an array of column name strings.
 * @property {object} [types] The Arrow data types to use. If specified,
 *  theinput should be an object with column names for keys and Arrow data
 *  types for values. If a column type is not explicitly provided, type
 *  inference will be performed to guess an appropriate type.
 */

/**
 * Create an Apache Arrow table for an input dataset.
 * @param {Array|object} data An input dataset to convert to Arrow format.
 *  If array-valued, the data should consist of an array of objects where
 *  each entry represents a row and named properties represent columns.
 *  Otherwise, the input data should be an Arquero table.
 * @param {ArrowFormatOptions} [options] Encoding options, including
 *  column data types.
 * @return {Table} An Apache Arrow Table instance.
 */
export default function(data, options = {}) {
  const types = options.types || {};
  const { columnFrom, names, nrows, scan } = init(data, options);
  return Table.new(
    names.map(name => {
      const col = columnFrom(data, name, nrows, scan, types[name]);
      return col.length === nrows
        ? col
        : error('Column length mismatch');
    })
  );
}

function init(data, options) {
  const { columns, limit = Infinity, offset = 0 } = options;
  const names = isFunction(columns) ? columns(data)
    : isArray(columns) ? columns
    : null;
  if (isArray(data)) {
    return {
      columnFrom: columnFromObjects,
      names: names || Object.keys(data[0]),
      nrows: Math.min(limit, data.length - offset),
      scan: scanArray(data, limit, offset)
    };
  } else if (isTable(data)) {
    return {
      columnFrom: columnFromTable,
      names: names || data.columnNames(),
      nrows: Math.min(limit, data.numRows() - offset),
      scan: scanTable(data, limit, offset)
    };
  } else {
    error('Unsupported input data type');
  }
}

function isTable(data) {
  return data && isFunction(data.reify);
}