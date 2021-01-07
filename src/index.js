export { Type } from 'apache-arrow';
export { default as toArrow } from './encode/to-arrow';

// exposed for testing only
export { dataFromTable as dataFrom } from './encode/column-from-table';
export { default as profiler } from './encode/profiler';