// Space scenes: the dark between things, and the bright things in it.
import { CW, CH, rng, pick, ctx, tile, put, phased, sprite, word, mover, trace, shell, signature, lerp, stars, line, disc, particles, ridge, wavy } from './engine.js'

const STAR_INKS = ['#cfd8ff', '#fff1c9', '#8aa0d8', '#ffd2ec']

// ---------------------------------------------------------------- Nebula
function nebula(name) {
  const x = ctx()
  const R = rng(401)
  const b = []
  b.push(phased(stars(x, R, 140, 48, 120, STAR_INKS), 2))
  const buckets = Array.from({ length: 12 }, () => [])
  const clouds = [
    [14, 12, 230, '#ff3d9a', '#5a1a8a'],
    [30, 30, 190, '#8a5aff', '#1a2a8a'],
    [104, 16, 240, '#2ad4ff', '#1a3a9a'],
    [92, 34, 200, '#ff7a5a', '#8a1a5a'],
    [60, 6, 150, '#c05aff', '#3a1a7a'],
  ]

  for (const [cc, cr, rad, hi, lo] of clouds) {
    for (const t of disc(x, R, cc * CW, cr * CH, rad, (px, py, d) => (R() < 0.25 + d * 0.6 ? null : [lerp(hi, lo, d), lerp(hi, '#ffffff', 0.4)]), '.:*o')) {
      const col = /x="(\d+)"/.exec(t)
      buckets[Math.min(11, Math.floor(+col[1] / CW / 10))].push(t)
    }
  }

  x.anim.push('.aw{animation:sh 7s ease-in-out infinite}')
  b.push(wavy(x, buckets, 0.6))
  b.push(mover(x, [[40, 3], [76, 17]], 28, -4, [[0, 0, '*', '#ffffff'], [-1, -1, '+', '#cfd8ff'], [-2, -1, '.', '#8aa0d8']].map(([dc, dr, ch, ink]) => put(tile(x, null, ink, ch), 40 + dc, 3 + dr)).join(''), 'burst'))
  b.push(...signature(x, name, '#7a5ab8', '#ff7ac0'))

  return shell(x, { sky: [[0, '#0a0620'], [1, '#05030f']], veil: '#06030f', veilA: 0.4, grid: '#b08aff', gridA: 0.02, body: b.join('') })
}

// ---------------------------------------------------------------- Galaxy
function galaxy(name) {
  const x = ctx()
  const R = rng(411)
  const b = []
  b.push(phased(stars(x, R, 110, 48, 120, STAR_INKS), 2))
  const spiral = (cc, cr, rx, arms, seed, hot, cool) => {
    const r2 = rng(seed)
    const out = []

    for (let i = 0; i < 300; i++) {
      const t = r2() ** 0.7
      const arm = i % arms
      const ang = t * 5.2 + (arm * 2 * Math.PI) / arms + (r2() - 0.5) * 0.7
      const rad = t * rx
      const c = Math.round(cc + Math.cos(ang) * rad)
      const r = Math.round(cr + Math.sin(ang) * rad * 0.42)

      if (c >= 0 && c < 120 && r >= 0 && r < 48) {
        const w = 1 - t
        out.push(put(tile(x, lerp(cool, hot, w), lerp(hot, '#ffffff', 0.5), pick(r2, ['.', '*', ':', '+'])), c, r))
      }
    }

    for (const t of disc(x, r2, cc * CW, cr * CH, 56, (px, py, d) => [lerp('#fff4d0', hot, d), '#c08a30'], '*o')) {
      out.push(t)
    }

    return out
  }

  b.push(phased(spiral(94, 24, 40, 2, 5, '#ffd28a', '#1a2a8a'), 3))
  b.push(phased(spiral(18, 36, 18, 3, 9, '#ff9ad0', '#3a1a7a'), 4))
  b.push(mover(x, [[96, 5], [74, 18]], 31, -12, [[0, 0, '*', '#ffffff'], [1, -1, '+', '#cfd8ff'], [2, -1, '.', '#8aa0d8']].map(([dc, dr, ch, ink]) => put(tile(x, null, ink, ch), 96 + dc, 5 + dr)).join(''), 'burst'))
  b.push(...signature(x, name, '#8a6ab8', '#ffd28a'))

  return shell(x, { sky: [[0, '#07061a'], [1, '#02020a']], veil: '#04030c', veilA: 0.38, grid: '#b08aff', gridA: 0.02, body: b.join('') })
}

// ---------------------------------------------------------------- Black hole
function blackHole(name) {
  const x = ctx()
  const R = rng(421)
  const b = []
  const cx = 94
  const cy = 24
  b.push(phased(stars(x, R, 120, 48, 120, STAR_INKS), 2))
  const sectors = Array.from({ length: 14 }, () => [])

  // the accretion disc: concentric rings, hotter inside, brightness running round it
  for (let ring = 0; ring < 7; ring++) {
    const rx = 15 + ring * 4
    const ry = rx * 0.2
    const n = Math.round(rx * 7)
    const color = lerp('#fff2c0', '#8a1a3a', ring / 6)

    for (let a = 0; a < n; a++) {
      const t = (a / n) * Math.PI * 2
      const c = Math.round(cx + Math.cos(t) * rx)
      const r = Math.round(cy + Math.sin(t) * ry)

      if (c >= 0 && c < 120 && r >= 0 && r < 48) {
        sectors[Math.floor((a / n) * 14)].push(put(tile(x, color, lerp(color, '#ffffff', 0.45), pick(R, ['=', '-', ':', '~'])), c, r))
      }
    }
  }

  x.anim.push('.aw{animation:sh 3.6s ease-in-out infinite}')
  b.push(wavy(x, sectors, 0.26))

  // light bent over the top and under the bottom
  const halo = []

  for (let a = 0; a <= 60; a++) {
    const t = Math.PI * (a / 60)
    halo.push(put(tile(x, '#ffd9a0', '#a8601a', '.'), Math.round(cx + Math.cos(t) * 11), Math.round(cy - 2 - Math.sin(t) * 9)))
    halo.push(put(tile(x, '#ff9a5a', '#8a3a10', '.'), Math.round(cx + Math.cos(t) * 8), Math.round(cy + 2 + Math.sin(t) * 3)))
  }

  b.push(phased(halo, 3))
  b.push(...disc(x, R, cx * CW + 8, cy * CH + 11, 112, () => ['#000000', '#080808'], ' '))
  b.push(...particles(x, R, { n: 16, c: [60, 118], r: [20, 30], dx: -12, dy: 0, dur: [5, 9], glyphs: '.*', inks: ['#ffd9a0', '#ff9a5a'] }))
  b.push(...signature(x, name, '#8a5a38', '#ffd9a0'))

  return shell(x, { sky: [[0, '#08040e'], [1, '#020104']], veil: '#040208', veilA: 0.4, grid: '#ff9a5a', gridA: 0.02, body: b.join('') })
}

// ---------------------------------------------------------------- Rocket launch
function rocket(name) {
  const x = ctx()
  const R = rng(431)
  const b = []
  const glow = '<radialGradient id="rk" cx=".82" cy=".9" r=".5"><stop offset="0" stop-color="#ffa04a" stop-opacity=".45"/><stop offset="1" stop-color="#ffa04a" stop-opacity="0"/></radialGradient>'
  b.push(`<rect class="fl" width="1920" height="1080" fill="url(#rk)"/>`)
  x.anim.push('.fl{animation:glow 1.6s ease-in-out infinite}')
  b.push(phased(stars(x, R, 90, 30, 120, STAR_INKS), 2))
  b.push(...trace(x, [[40, 44], [119, 44]], '#2a2a32', '#5a5a68', '=', '='), ...trace(x, [[40, 45], [119, 45]], '#16161c', '#3a3a48', '#', '#'))

  // the launch tower
  const tower = []

  for (let r = 14; r <= 43; r++) {
    tower.push(put(tile(x, '#2a303c', '#5a6478', r % 4 === 0 ? '+' : '|'), 86, r), put(tile(x, '#2a303c', '#5a6478', r % 4 === 0 ? '+' : '|'), 89, r))

    if (r % 4 === 0) {
      tower.push(put(tile(x, '#2a303c', '#5a6478', '='), 87, r), put(tile(x, '#2a303c', '#5a6478', '='), 88, r))
    }
  }

  b.push(...tower)

  // the rocket and its flame, climbing slowly and fading out at the top
  const big = rs => rs.flatMap(r => { const w = [...r].map(ch => ch + ch).join(''); return [w, w] })
  const rows = big(['  ##  ', ' #### ', ' #### ', ' #### ', ' #### ', ' #### ', ' #### ', '######', '######', '##  ##'])
  const pal = { '#': { fill: '#f0f0f4', ink: '#8a90a0', g: '=:' } }
  const ship = [...sprite(x, rows, pal, 90, 22, 3), ...sprite(x, ['    ####    ', '    ####    '], { '#': { fill: '#d9461c', ink: '#ffb066', g: '*' } }, 90, 29, 5), ...sprite(x, ['    ####    ', '    ####    '], { '#': { fill: '#4a8ad6', ink: '#cfeeff', g: 'o' } }, 90, 25, 6)]
  const flame = `<g class="s0">${sprite(x, ['####', '######', '######', '######', ' #### ', '  ##  '], { '#': { fill: '#ff8a2a', ink: '#fff0a0', g: '^*' } }, 93, 42, 7).join('')}</g><g class="s1">${sprite(x, ['##', '####', '##'], { '#': { fill: '#ffd54a', ink: '#fff8d0', g: '*' } }, 94, 42, 8).join('')}</g>`
  b.push(mover(x, [[0, 0], [0, -40]], 24, -5, ship.join('') + flame, 'fade'))

  // smoke at the pad and sparks
  b.push(...particles(x, R, { n: 36, c: [88, 104], r: [41, 44], dx: r => Math.floor((r() - 0.5) * 24), dy: -8, dur: [4, 9], glyphs: 'o~O', inks: ['#cfd0d8', '#9a9ca8', '#e8e8f0'] }))
  b.push(...particles(x, R, { n: 18, c: [91, 100], r: [40, 43], dx: r => Math.floor((r() - 0.5) * 10), dy: 5, dur: [1, 2], glyphs: '*.', inks: ['#ffd54a', '#ff8a2a'] }))
  b.push(...signature(x, name, '#5a6478', '#ffa04a'))

  return shell(x, { sky: [[0, '#05081a'], [0.7, '#10183a'], [1, '#2a2040']], veil: '#050818', veilA: 0.38, grid: '#8aa0ff', gridA: 0.02, defs: glow, body: b.join('') })
}

// ---------------------------------------------------------------- Meteor shower
function meteors(name) {
  const x = ctx()
  const R = rng(441)
  const b = []
  b.push(phased(stars(x, R, 150, 40, 120, STAR_INKS), 2))
  b.push(ridge(x, R, { base: 44, h: c => 3 + 2 * Math.sin(c / 8) + Math.sin(c / 2.5), fill: ['#0a0e1c', '#04060c'], edge: ['#141a30', '#222c4a'], glyphs: '^.', seed: 2 }))

  // a tent and a telescope
  b.push(...sprite(x, ['    #    ', '   ###   ', '  ## ##  ', ' ##   ## '], { '#': { fill: '#2a3a5a', ink: '#4a6090', g: '/\\' } }, 14, 41, 5))
  b.push(...line([30, 44], [33, 40], tile(x, '#3a3a4a', '#7a7a90', '/')), ...line([33, 40], [37, 38], tile(x, '#5a5a70', '#a0a0c0', '=')))
  const cols = [['#ffffff', '#cfd8ff'], ['#fff1c9', '#ffd070'], ['#cfffe8', '#7ae8c0'], ['#ffe0f0', '#ff9ad0']]

  for (let i = 0; i < 14; i++) {
    const c0 = 30 + Math.floor(R() * 90)
    const r0 = Math.floor(R() * 14)
    const len = 14 + Math.floor(R() * 12)
    const [hi, lo] = pick(R, cols)
    const trail = [[0, 0, '*', hi], [-1, -1, '+', hi], [-2, -1, '.', lo], [-3, -2, '.', lo], [-4, -2, '.', lo]]
    const inner = trail.map(([dc, dr, ch, ink]) => put(tile(x, null, ink, ch), c0 + dc, r0 + dr)).join('')
    const dur = 9 + R() * 12
    b.push(mover(x, [[c0, r0], [c0 - len, r0 + Math.round(len * 0.55)]], dur, i < 4 ? -dur * 0.04 : -R() * 20, inner, 'burst'))
  }

  b.push(...signature(x, name, '#4a5a82', '#fff1c9', 40, 46))

  return shell(x, { sky: [[0, '#04061a'], [0.8, '#0c1430'], [1, '#1c2444']], veil: '#04050f', veilA: 0.36, grid: '#8aa0ff', gridA: 0.02, body: b.join('') })
}

// ---------------------------------------------------------------- Warp
function warp(name) {
  const x = ctx()
  const R = rng(451)
  const b = []
  const glow = '<radialGradient id="wp" cx=".5" cy=".5" r=".4"><stop offset="0" stop-color="#7ad8ff" stop-opacity=".2"/><stop offset="1" stop-color="#7ad8ff" stop-opacity="0"/></radialGradient>'
  b.push(`<rect class="gl" width="1920" height="1080" fill="url(#wp)"/>`)
  const cols = ['#ffffff', '#cfeeff', '#7ad8ff', '#b8a0ff']

  for (let i = 0; i < 110; i++) {
    const a = R() * Math.PI * 2
    const r0 = 4 + R() * 6
    const r1 = 62 + R() * 8
    const p = (rad) => [Math.round(60 + Math.cos(a) * rad), Math.round(24 + Math.sin(a) * rad * 0.42)]
    const [c0, ro] = p(r0)
    const [c1, r1b] = p(r1)
    const dx = Math.sign(c1 - c0)
    const dy = Math.sign(r1b - ro)
    const ink = pick(R, cols)
    const inner = [0, 1, 2, 3].map(k => put(tile(x, k === 0 ? ink : null, k === 0 ? '#04060f' : lerp('#04060f', ink, 0.85 - k * 0.15), k === 0 ? '*' : '-'), c0 - dx * k, ro - dy * k)).join('')
    b.push(mover(x, [[c0, ro], [c1, r1b]], 1.2 + R() * 2.4, -R() * 3, inner, 'fade'))
  }

  b.push(...signature(x, name, '#4a7aa8', '#7ad8ff'))

  return shell(x, { sky: [[0, '#05081c'], [1, '#02030a']], veil: '#02030a', veilA: 0.3, grid: '#7ad8ff', gridA: 0.02, defs: glow, body: b.join('') })
}

export const SPACE = { nebula, galaxy, blackHole, rocket, meteors, warp }
