import path from 'node:path';
/** @import { OutputOptions, RollupOptions, Plugin } from 'rollup' */
import commonjs from '@rollup/plugin-commonjs';
import image from '@rollup/plugin-image';
import json from '@rollup/plugin-json';
import nodeResolve from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';
import terser from '@rollup/plugin-terser';
import swc from 'rollup-plugin-swc3';

const createEntryCode = (fileName) => `'use strict';
if (process.env.NODE_ENV === 'production') {
  module.exports = require('./${fileName}.production.min.js');
} else {
  module.exports = require('./${fileName}.development.js');
}`;

/**
 * Generates an entry file that will load the production or development build
 * depending on the user's NODE_ENV.
 * @type {Plugin}
 */
const generateEntryFile = {
  name: 'generate-entry-file',
  async generateBundle(options, bundle) {
    if (options.format !== 'cjs') {
      return;
    }

    let name = 'index';

    for (const info of Object.values(bundle)) {
      if (info.isEntry) {
        name = info.name;
      }
    }

    this.emitFile({
      type: 'asset',
      fileName: `${name}.js`,
      source: createEntryCode(name),
    });
  },
};

export default ({
  outputExports = 'auto',
  input = ['./src/index.ts'],
  outputDir = './dist/',
  preserveModules = false,
  preserveModulesRoot = 'src',
  external = [],
  options = {},
  plugins = [],
} = {}) => {
  /**
   *
   * @param {string} format 'esm' | 'cjs'
   * @param {string} fileNameSuffix
   * @returns {OutputOptions}
   */
  const createOutput = (format, fileNameSuffix) => ({
    dir:
      typeof outputDir === 'function'
        ? outputDir(format)
        : path.join(outputDir, format),
    preserveModules,
    preserveModulesRoot,
    entryFileNames: `[name]${fileNameSuffix ? `.${fileNameSuffix}` : ''}.${format === 'esm' ? 'mjs' : 'js'}`,
    assetFileNames: ({ names }) =>
      names.map((name) => name.replace(/^src\//, '') ?? ''),
    format,
    exports: outputExports,
  });

  /**
   * @type {RollupOptions}
   */
  const commonOptions = {
    ...options,
    input,
    external,
    plugins: [
      ...plugins,
      commonjs(),
      nodeResolve({ browser: true }),
      image(),
      json(),
      swc({
        include: /\.[mc]?[jt]sx?$/, // default
      }),
    ],
  };

  const prodOptions = {
    ...commonOptions,
    output: [
      createOutput('esm', 'production.min'),
      createOutput('cjs', 'production.min'),
    ],
    plugins: [
      ...commonOptions.plugins,
      replace({
        values: {
          'process.env.NODE_ENV': JSON.stringify('production'),
        },
        preventAssignment: true,
      }),
      terser(),
      generateEntryFile,
    ],
  };

  const devOptions = {
    ...commonOptions,
    output: [createOutput('esm'), createOutput('cjs', 'development')],
  };

  return [prodOptions, devOptions];
};
