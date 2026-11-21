// Writes every scene to assets/previews/<scene>.svg so you can open it in a browser.
// Usage: node scripts/build-previews.mjs [handle]
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const { SCENES } = await import(join(root, 'hooks', 'art.js'))
const handle = process.argv[2] ?? 'dev'
mkdirSync(join(root, 'assets', 'previews'), { recursive: true })

for (const [key, build] of Object.entries(SCENES)) {
  const svg = build(handle)
  writeFileSync(join(root, 'assets', 'previews', `${key}.svg`), svg)
  console.log(`${key.padEnd(10)} ${svg.length} chars${svg.length > 131072 ? '  TOO BIG for a backdrop' : ''}`)
}
