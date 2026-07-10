import { defineConfig } from 'tsup'
import { copyFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'

export default defineConfig({
  entry: { index: 'src/index.ts' },
  format: ['esm', 'cjs'],
  dts: true,
  clean: true,
  target: 'es2020',
  sourcemap: true,
  onSuccess: async () => {
    const wasmSrc = resolve(__dirname, '../wasm/pkg/sweet_player_gif_wasm_bg.wasm')
    const wasmDest = resolve(__dirname, 'dist/sweet_player_gif_wasm_bg.wasm')
    if (existsSync(wasmSrc)) {
      copyFileSync(wasmSrc, wasmDest)
      console.log('Copied .wasm to dist/')
    } else {
      console.warn('Warning: .wasm file not found, skipping copy')
    }
  },
})
