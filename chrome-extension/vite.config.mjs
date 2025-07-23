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
        options: resolve(__dirname, 'options.html'),
      },
      output: {
        entryFileNames: assetInfo => {
          if (assetInfo.name === 'background') return 'background.js';
          if (assetInfo.name === 'options') return 'options.js';
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