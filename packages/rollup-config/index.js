/** @import { RollupOptions, Plugin } from 'rollup' */
import commonjs from '@rollup/plugin-commonjs';
import image from '@rollup/plugin-image';
import json from '@rollup/plugin-json';
import nodeResolve from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';
import terser from '@rollup/plugin-terser';
import banner from 'rollup-plugin-banner2';
import swc from 'rollup-plugin-swc3';

const cjsEntry = `if (process.env.NODE_ENV === 'production') {
  module.exports = require('./index.production.min.js');
} else {
  module.exports = require('./index.development.js');
}`;

/**
 * @param {string[]} exports
 */
function esm(exports) {
  // Move star exports to its own line
  const starExports = [];
  const namedExports = [];

  for (const e of exports) {
    if (e.startsWith('*')) {
      starExports.push(e);
    } else {
      namedExports.push(e);
    }
  }

  const namedExportsString = namedExports.join(', ');
  const starExportsString = starExports
    .map((e) => `export * from '${e.replace('*', '')}';`)
    .join('\n');

  return `let moduleToExport;
if (process.env.NODE_ENV === 'production') {
  moduleToExport = await import('./index.production.min.mjs');
} else {
  moduleToExport = await import('./index.development.mjs');
}
const { ${namedExportsString} } = moduleToExport;
${starExportsString}
export { ${namedExportsString} };`;
}

/**
 * Generates an entry file that will load the production or development build
 * depending on the user's NODE_ENV.
 * @type {Plugin}
 */
const generateEntryFile = {
  name: 'generate-entry-file',
  async generateBundle(options, bundle) {
    const ext = options.format === 'cjs' ? 'js' : 'mjs';
    const exports = Object.values(bundle)
      .filter((b) => b.isEntry)
      .flatMap((entry) => entry.exports);
    const entryCode = options.format === 'cjs' ? cjsEntry : esm(exports);
    const code = `'use strict';\n\n${entryCode}\n`;

    this.emitFile({
      type: 'asset',
      fileName: `index.${ext}`,
      source: code,
    });
  },
};

export default ({
  useClient = false,
  createDevBuilds = false,
  preserveModules = false,
  outputExports = 'auto',
  input = ['./src/index.ts'],
  external = [],
  options = {},
  output,
  plugins = [],
} = {}) => {
  /**
   * @type {RollupOptions}
   */
  const commonOptions = {
    ...options,
    input,
    output: output ?? [
      {
        dir: './dist/esm',
        entryFileNames: '[name].mjs',
        preserveModules,
        preserveModulesRoot: './src',
        assetFileNames({ name }) {
          return name?.replace(/^src\//, '') ?? '';
        },
        format: 'esm',
        exports: outputExports,
      },
      {
        dir: './dist/cjs',
        assetFileNames({ name }) {
          return name?.replace(/^src\//, '') ?? '';
        },
        format: 'cjs',
        exports: outputExports,
      },
    ],
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
      useClient ? banner(() => `'use client';\n`) : undefined,
    ],
  };
  const replacePluginOptions = {
    values: {
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
      __DEV__: JSON.stringify(process.env.NODE_ENV === 'development'),
    },
    preventAssignment: true,
  };

  if (!createDevBuilds) {
    commonOptions.plugins.push(replace(replacePluginOptions), terser());

    return commonOptions;
  }

  const prodOptions = {
    ...commonOptions,
    output: [
      {
        ...commonOptions.output[0],
        entryFileNames: '[name].production.min.mjs',
      },
      {
        ...commonOptions.output[1],
        entryFileNames: '[name].production.min.js',
      },
    ],
    plugins: [
      ...commonOptions.plugins,
      replace({
        ...replacePluginOptions,
        values: {
          ...replacePluginOptions.values,
          __DEV__: JSON.stringify(false),
        },
      }),
      terser(),
      generateEntryFile,
    ],
  };

  const devOptions = {
    ...commonOptions,
    output: [
      {
        ...commonOptions.output[0],
        entryFileNames: '[name].development.mjs',
      },
      {
        ...commonOptions.output[1],
        entryFileNames: '[name].development.js',
      },
    ],
    plugins: [
      ...commonOptions.plugins,
      replace({
        ...replacePluginOptions,
        values: {
          ...replacePluginOptions.values,
          __DEV__: JSON.stringify(true),
        },
      }),
    ],
  };

  return [prodOptions, devOptions];
};
