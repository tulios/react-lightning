import path from 'node:path';
import createRollupConfig from '@repo/rollup-config';

export default createRollupConfig({
  input: 'src/exports/index.ts',
  preserveModules: true,
  preserveModulesRoot: path.join('src', 'exports'),
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
