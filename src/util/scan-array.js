export default function(data, limit, offset) {
  const n = Math.min(data.length, offset + limit);
  return (name, visit) => {
    for (let i = offset; i < n; ++i) {
      visit(data[i][name], i);
    }
  };
}