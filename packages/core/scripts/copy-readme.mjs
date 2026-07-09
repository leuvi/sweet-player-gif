import { copyFileSync, unlinkSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const src = resolve(__dirname, '../../../README.md')
const dest = resolve(__dirname, '../README.md')

const action = process.argv[2]

if (action === 'copy') {
  copyFileSync(src, dest)
  console.log('Copied README.md to packages/core/')
} else if (action === 'clean') {
  try { unlinkSync(dest) } catch {}
  console.log('Removed README.md from packages/core/')
}
