import fontGen from '@plexinc/vite-plugin-msdf-fontgen';
import react from '@vitejs/plugin-react';
import type { InlineConfig } from 'vite';

const config: InlineConfig = {
  plugins: [
    react(),
    fontGen({
      inputs: [
        {
          src: 'public/fonts',
          dest: 'public/fonts',
        },
      ],
    }),
  ],
  optimizeDeps: {
    esbuildOptions: {
      target: 'esnext',
    },
  },
  build: {
    target: 'esnext',
  },
  define: {
    __DEV__: JSON.stringify(process.env.NODE_ENV === 'development'),
  },
};

export default config;
