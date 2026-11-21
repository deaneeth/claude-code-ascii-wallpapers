// Static weight check for every scene: size against the 131,072 character limit, tiles drawn, animation rules,
// and how many groups the renderer must animate. Flags the ones to trim. Run: node scripts/audit.mjs
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const { SCENES } = await import(join(root, 'hooks', 'art.js'))
const rows = []

for (const [key, build] of Object.entries(SCENES)) {
  const svg = build('dev')
  const uses = (svg.match(/<use /g) ?? []).length
  const anims = (svg.match(/animation:/g) ?? []).length
  const classed = (svg.match(/class="/g) ?? []).length
  const flags = []

  if (svg.length > 131072) flags.push('OVER LIMIT')
  else if (svg.length > 110000) flags.push('near limit')
  if (uses > 9000) flags.push('many tiles')
  if (classed > 400) flags.push('many animated groups')
  rows.push({ key, kb: Math.round(svg.length / 1024), uses, anims, classed, flags: flags.join(', ') })
}

rows.sort((a, b) => b.uses - a.uses)
console.log('scene'.padEnd(14), 'KB'.padStart(4), 'tiles'.padStart(7), 'rules'.padStart(6), 'groups'.padStart(7))

for (const r of rows.slice(0, 15)) {
  console.log(r.key.padEnd(14), String(r.kb).padStart(4), String(r.uses).padStart(7), String(r.anims).padStart(6), String(r.classed).padStart(7), r.flags)
}

const flagged = rows.filter(r => r.flags)
console.log(`\n${rows.length} scenes, largest ${rows[0].uses} tiles, ${flagged.length} flagged${flagged.length ? ': ' + flagged.map(r => r.key).join(', ') : ''}`)
console.log(`average ${Math.round(rows.reduce((a, r) => a + r.kb, 0) / rows.length)} KB, ${Math.round(rows.reduce((a, r) => a + r.uses, 0) / rows.length)} tiles`)
