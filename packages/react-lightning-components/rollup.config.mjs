import { dirname } from 'node:path';
import createRollupConfig from '@repo/rollup-config';
import { globSync } from 'glob';

const exportFiles = globSync(['src/index.ts', './src/exports/*/*.{tsx,ts}']);

const configs = exportFiles.map((file) => {
  const outputDir = dirname(file.replace(/src(\/exports)?/i, ''));

  return createRollupConfig({
    input: file,
    outputDir: (format) => `./dist/${format}${outputDir}`,
    external: ['@plexinc/react-lightning', 'react', 'react/jsx-runtime'],
  });
});

export default configs.flat();
