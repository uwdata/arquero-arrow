import isArrayType from './is-array-type';

export default function(table, column, visit) {
  let i = -1;
  isArrayType(column.data) && !table.isFiltered() && !table.isOrdered()
    ? column.data.forEach(visit)
    : table.scan(row => visit(column.get(row), ++i));
}