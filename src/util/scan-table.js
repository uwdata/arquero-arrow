import isArrayType from './is-array-type';

export default function(table, limit, offset) {
  const scanAll = offset === 0 && table.numRows() <= limit
               && !table.isFiltered() && !table.isOrdered();

  return (column, visit) => {
    let i = -1;
    scanAll && isArrayType(column.data)
      ? column.data.forEach(visit)
      : table.scan(
          row => visit(column.get(row), ++i),
          true, limit, offset
        );
  };
}