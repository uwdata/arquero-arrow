import { Table } from 'apache-arrow';
import columnFromObjects from './column-from-objects';
import columnFromTable from './column-from-table';
import error from '../util/error';
import isArray from '../util/is-array';
import isFunction from '../util/is-function';

/**
 * Create an Apache Arrow table for an input dataset.
 * @param {Array|object} data An input dataset to convert to Arrow format.
 *  If array-valued, the data should consist of an array of objects where
 *  each entry represents a row and named properties represent columns.
 *  Otherwise, the input data should be an Arquero table.
 * @param {object} [types] The Arrow data types to use. If specified, the
 *  input should be an object with column names for keys and Arrow data
 *  types for values. If a column type is not explicitly provided, type
 *  inference will be performed to guess an appropriate type.
 * @return {Table} An Apache Arrow Table instance.
 */
export default function(data, types = {}) {
  const { columnFrom, nrows, names } = init(data);
  return Table.new(
    names.map(name => {
      const col = columnFrom(data, name, types[name]);
      return col.length === nrows
        ? col
        : error('Column length mismatch');
    })
  );
}

function init(data) {
  if (isArray(data)) {
    return {
      columnFrom: columnFromObjects,
      names: Object.keys(data[0]),
      nrows: data.length
    };
  } else if (isTable(data)) {
    return {
      columnFrom: columnFromTable,
      names: data.columnNames(),
      nrows: data.numRows()
    };
  } else {
    error('Unsupported input data type');
  }
}

function isTable(data) {
  return data && isFunction(data.reify);
}