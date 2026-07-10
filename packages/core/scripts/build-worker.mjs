import { build } from 'esbuild'
import { writeFileSync, existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const workerEntry = resolve(__dirname, '../src/wasm/worker.ts')
const outFile = resolve(__dirname, '../src/wasm/worker-inline.ts')

if (!existsSync(workerEntry)) {
  console.warn('worker.ts not found, skipping worker inline build')
  writeFileSync(outFile, 'export default "";\n')
  process.exit(0)
}

const result = await build({
  entryPoints: [workerEntry],
  bundle: true,
  format: 'iife',
  write: false,
  target: 'es2020',
  define: {
    'import.meta.url': '""',
  },
})

const code = result.outputFiles[0].text
const escaped = JSON.stringify(code)

writeFileSync(outFile, `export default ${escaped};\n`)
console.log(`Inlined worker code (${code.length} bytes) to worker-inline.ts`)
