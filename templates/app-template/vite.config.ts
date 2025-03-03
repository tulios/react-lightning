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
};

export default config;
