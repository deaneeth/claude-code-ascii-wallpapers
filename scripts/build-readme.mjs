// Rebuilds the gallery half of README.md from the WALLS table in hooks/register.tsx, so the counts and the
// pictures never drift from the plugin. Everything between the two markers is generated.
import { readFileSync, writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const src = readFileSync(join(root, 'hooks', 'register.tsx'), 'utf8')
const rows = [...src.matchAll(/\['([^']+)', '(\w+)', '(\w+)', '(dark|light)', (\d+), '(#[0-9a-fA-F]+)', '([^']+)'\]/g)].map(m => ({ name: m[1], key: m[2], mode: m[3], tone: m[4], blurb: m[7] }))
const modes = [...src.matchAll(/\{ key: '(\w+)', name: '(\w+)', blurb: '([^']+)', hotkey: '(\w)'/g)].map(m => ({ key: m[1], name: m[2], blurb: m[3], hotkey: m[4] }))

const intro = {
  focus: 'Work mode. Calm, readable and low-distraction, for long stretches of deep work.',
  chill: 'Cozy and slow. Warm light, weather and quiet motion.',
  nature: 'Mountains, water, weather and the seasons.',
  space: 'Planets, nebulae, rockets and the dark between them.',
  energy: 'Enjoy mode. Loud, bright and moving: arcade, neon and fire.',
  dev: 'Hardcore coder mode. Dark, moody and minimal: editors, memory, assembly, diffs, green test runs and the quiet between commands.',
  creatures: 'Things that live in the picture: koi, jellyfish, a whale, an owl, a cat on a sill.',
  art: 'Graphic styles: halftone, dither, riso, flow fields, sine waves and a radar sweep.',
  minimal: 'Almost nothing behind the chat, for people who want the room and a little life.',
}

const td = w => `<td align="center"><a href="assets/previews/${w.key}.svg"><img src="assets/thumbs/${w.key}.jpg" width="230" alt="${w.name}: ${w.blurb}"></a><br><b>${w.name}</b>${w.tone === 'light' ? ' ☀' : ''}<br><sub>${w.blurb}</sub></td>`
const table = list => '<table>\n' + Array.from({ length: Math.ceil(list.length / 4) }, (_, i) => '<tr>\n' + list.slice(i * 4, i * 4 + 4).map(td).join('\n') + '\n</tr>\n').join('') + '</table>\n'

const light = rows.filter(w => w.tone === 'light')
let out = `**${rows.length} scenes in ${modes.length} modes.** Pick a mode for the mood you are in, then a scene. Click any preview to open the animated SVG (${light.length} light-mode scenes are marked ☀).\n\n| Mode | Scenes | For |\n| --- | --- | --- |\n`

for (const m of modes) {
  out += `| **${m.name}** | ${rows.filter(w => w.mode === m.key).length} | ${m.blurb[0].toUpperCase() + m.blurb.slice(1)}. |\n`
}

for (const m of modes) {
  const list = rows.filter(w => w.mode === m.key)
  out += `\n### ${m.name} · ${list.length}\n\n${intro[m.key] ?? m.blurb}\n\n${table(list)}`
}

const file = join(root, 'README.md')
const readme = readFileSync(file, 'utf8')
const a = '<!-- gallery:start -->'
const z = '<!-- gallery:end -->'
const i = readme.indexOf(a)
const j = readme.indexOf(z)

if (i < 0 || j < 0) {
  throw new Error('README.md needs the gallery markers')
}

let next = readme.slice(0, i + a.length) + '\n' + out + readme.slice(j)
next = next.replace(/scenes-\d+-5dffb0/, `scenes-${rows.length}-5dffb0`)
writeFileSync(file, next)
console.log(rows.length, 'scenes,', modes.length, 'modes,', light.length, 'light')
