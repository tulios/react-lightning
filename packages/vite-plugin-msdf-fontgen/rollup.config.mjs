import createRollupConfig from '@repo/rollup-config';

export default createRollupConfig({
  external: [
    '@lightningjs/msdf-generator',
    '@lightningjs/msdf-generator/adjustFont',
    'crc-32',
    'glob',
  ],
});
