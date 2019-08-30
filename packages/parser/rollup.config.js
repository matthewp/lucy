// rollup.config.js
import replace from 'rollup-plugin-replace';
import pkg from './package.json';

export default {
  input: pkg.module,
  output: {
    file: 'dist/lucy-parser.cjs',
    format: 'cjs'
  },
  plugins: [
    replace({
      'process.env.NODE_ENV': JSON.stringify('production')
    })
  ]
};