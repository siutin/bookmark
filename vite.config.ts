import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    'import.meta.env.PACKAGE_VERSION': JSON.stringify(process.env.PACKAGE_VERSION || '0.0.0'),
  },
  server: {
    proxy: {
      '/api': 'http://localhost:8787',
      '/login': 'http://localhost:8787',
    },
  },
})
