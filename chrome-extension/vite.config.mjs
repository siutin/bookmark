import { defineConfig } from 'vite';
import { resolve } from 'path';
import { viteStaticCopy } from 'vite-plugin-static-copy';

export default defineConfig({
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        popup: resolve(__dirname, 'popup.html'),
        background: resolve(__dirname, 'src/background.js'),
      },
      output: {
        entryFileNames: assetInfo => {
          if (assetInfo.name === 'background') return 'background.js';
          return '[name].js';
        },
      },
    },
    emptyOutDir: true,
  },
  publicDir: 'assets', // Copy icons from assets/ to dist/
  plugins: [
    viteStaticCopy({
      targets: [
        { src: 'manifest.json', dest: '.' },
      ]
    })
  ]
}); 