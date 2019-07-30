// rollup.config.js
import resolve from 'rollup-plugin-node-resolve';
import replace from 'rollup-plugin-replace';
import pkg from './package.json';

export default {
  input: pkg.module,
  output: {
    file: 'bundle.js',
    format: 'es'
  },
  plugins: [
    resolve({}),
    replace({
      'process.env.NODE_ENV': JSON.stringify('production')
    })
  ]
};