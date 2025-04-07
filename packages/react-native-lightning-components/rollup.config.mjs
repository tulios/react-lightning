import { dirname } from 'node:path';
import createRollupConfig from '@repo/rollup-config';
import { globSync } from 'glob';

const exportFiles = globSync('./src/exports/*/*.{tsx,ts}');

const configs = exportFiles.map((file) => {
  const outputDir = dirname(file.replace('src/exports', ''));

  return createRollupConfig({
    useClient: true,
    input: file,
    output: [
      {
        dir: `./dist/esm${outputDir}`,
        entryFileNames: '[name].mjs',
        assetFileNames: ({ name }) => name?.replace(/^src\//, '') ?? '',
        format: 'esm',
        exports: 'auto',
      },
      {
        dir: `./dist/cjs${outputDir}`,
        entryFileNames: '[name].js',
        assetFileNames: ({ name }) => name?.replace(/^src\//, '') ?? '',
        format: 'cjs',
        exports: 'auto',
      },
    ],
    external: [
      '@plexinc/react-lightning',
      '@plexinc/react-native-lightning',
      '@shopify/flash-list',
      'react',
      'react-native',
      'react-native-web',
      'react/jsx-runtime',
    ],
  });
});

export default configs;
