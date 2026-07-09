import { existsSync, mkdirSync, copyFileSync, writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const wasmPkgDir = resolve(__dirname, '../../wasm/pkg')
const wasmDestDir = resolve(__dirname, '../src/wasm')

mkdirSync(wasmDestDir, { recursive: true })

const jsFile = resolve(wasmPkgDir, 'sweet_player_gif_wasm.js')
const dtsFile = resolve(wasmPkgDir, 'sweet_player_gif_wasm.d.ts')

const wasmBinFile = resolve(wasmPkgDir, 'sweet_player_gif_wasm_bg.wasm')

if (existsSync(jsFile) && existsSync(dtsFile)) {
  copyFileSync(jsFile, resolve(wasmDestDir, 'wasm_module.js'))
  copyFileSync(dtsFile, resolve(wasmDestDir, 'wasm_module.d.ts'))
  if (existsSync(wasmBinFile)) {
    copyFileSync(wasmBinFile, resolve(wasmDestDir, 'sweet_player_gif_wasm_bg.wasm'))
  }
  console.log('Copied wasm-pack output to src/wasm/')
} else {
  console.warn('wasm-pack output not found, writing stubs...')

  writeFileSync(
    resolve(wasmDestDir, 'wasm_module.js'),
    `// Auto-generated stub — build WASM to replace
export function encode_gif() {
  throw new Error('WASM module not built. Run "pnpm build:wasm" first.')
}
export default function init() {
  return Promise.resolve()
}
`
  )

  writeFileSync(
    resolve(wasmDestDir, 'wasm_module.d.ts'),
    `export function encode_gif(
  frames_data: Uint8Array,
  width: number,
  height: number,
  frame_count: number,
  delay: number,
  quality: number,
): Uint8Array;
export default function init(input?: RequestInfo | URL): Promise<void>;
`
  )

  console.log('Wrote WASM stubs to src/wasm/')
}
