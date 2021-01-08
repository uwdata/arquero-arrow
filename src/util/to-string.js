export default function(v) {
  return v === undefined ? v + ''
    : typeof v === 'bigint' ? v + 'n'
    : JSON.stringify(v);
}