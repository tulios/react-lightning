import fontGen from '@plexinc/vite-plugin-msdf-fontgen';
import reactNativeLightningPlugin from '@plexinc/vite-plugin-react-native-lightning';
import reactReanimatedLightningPlugin from '@plexinc/vite-plugin-react-reanimated-lightning';
import { defineConfig } from 'vite';

const config = defineConfig({
  plugins: [
    reactNativeLightningPlugin(),
    reactReanimatedLightningPlugin(),
    fontGen({
      inputs: [
        {
          src: 'public/fonts',
          dest: 'public/fonts',
        },
      ],
    }),
  ],
  server: {
    host: true,
    port: 3333,
  },
  define: {
    'process.env': JSON.stringify({
      NODE_ENV: process.env.NODE_ENV,
    }),
  },
});

export default config;
