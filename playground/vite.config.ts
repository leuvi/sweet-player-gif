import { defineConfig } from 'vite'
import { resolve } from 'node:path'

export default defineConfig({
  resolve: {
    alias: {
      'sweet-player-gif': resolve(__dirname, '../packages/core/src'),
    },
  },
  server: {
    host: true,
    port: 5183,
  },
  optimizeDeps: {
    exclude: ['sweet-player-gif-wasm'],
  },
})
