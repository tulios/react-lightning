import createRollupConfig from '@repo/rollup-config';

export default createRollupConfig({
  useClient: true,
  external: ['@plexinc/react-lightning', 'react', 'react/jsx-runtime'],
});
