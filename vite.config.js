import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://api.squiggle.com.au',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
      '/nrl-api': {
        target: 'https://fixturedownload.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/nrl-api/, '/feed/json'),
        headers: {
          'User-Agent': 'Mozilla/5.0',
        },
      },
      '/epl-api': {
        target: 'https://fixturedownload.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/epl-api/, '/feed/json'),
        headers: {
          'User-Agent': 'Mozilla/5.0',
        },
      }
    }
  }
})
