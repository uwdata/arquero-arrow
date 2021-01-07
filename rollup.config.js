import json from '@rollup/plugin-json';
import bundleSize from 'rollup-plugin-bundle-size';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import { terser } from 'rollup-plugin-terser';

function onwarn(warning, defaultHandler) {
  if (warning.code !== 'CIRCULAR_DEPENDENCY') {
    defaultHandler(warning);
  }
}

const globals = {
  'apache-arrow': 'arrow'
};

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
      name: 'aq',
      format: 'umd',
      globals
    },
    {
      file: 'dist/arquero-arrow.min.js',
      name: 'aq',
      format: 'umd',
      sourcemap: true,
      plugins: [ terser({ ecma: 2018 }) ],
      globals
    },
    {
      file: 'dist/arquero-arrow.mjs',
      format: 'es',
      globals
    }
  ]
};