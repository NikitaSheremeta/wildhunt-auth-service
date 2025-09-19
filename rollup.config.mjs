import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const pkg = require('./package.json');

import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import terser from '@rollup/plugin-terser';
import copy from 'rollup-plugin-copy';

export default {
  input: 'src/api/v1/index.js',
  output: {
    dir: 'dist',
    format: 'cjs',
    sourcemap: false,
    preserveModules: true,
    preserveModulesRoot: '.',
    entryFileNames: '[name].cjs',
    chunkFileNames: 'chunks/[name]-[hash].cjs'
  },
  external: Object.keys(pkg.dependencies || {}),
  plugins: [
    resolve({ preferBuiltins: true }),
    commonjs(),
    json(),
    terser(),
    copy({
      targets: [
        { 
            src: 'src/api/v1/templates', 
            dest: 'dist/src/api/v1' 
        }
      ],
      copyOnce: true
    })
  ]
};