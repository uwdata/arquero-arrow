import json from '@rollup/plugin-json';
import bundleSize from 'rollup-plugin-bundle-size';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import { terser } from 'rollup-plugin-terser';

function onwarn(warning, defaultHandler) {
  if (warning.code !== 'CIRCULAR_DEPENDENCY') {
    defaultHandler(warning);
  }
}

const name = 'aq.arrow';
const globals = { 'apache-arrow': 'Arrow' };

export default {
  input: 'src/index.js',
  external: ['apache-arrow'],
  plugins: [
    json(),
    bundleSize(),
    nodeResolve({ modulesOnly: true })
  ],
  onwarn,
  output: [
    {
      file: 'dist/arquero-arrow.js',
      format: 'umd',
      globals,
      name
    },
    {
      file: 'dist/arquero-arrow.min.js',
      format: 'umd',
      sourcemap: true,
      plugins: [ terser({ ecma: 2018 }) ],
      globals,
      name
    },
    {
      file: 'dist/arquero-arrow.mjs',
      format: 'es',
      globals
    }
  ]
};