// Light scenes: bright, airy and easy on the eyes in a light window. Daylight, pastel and paper.
import { CW, CH, rng, pick, ctx, tile, put, phased, sprite, word, mover, trace, clip, shell, signature, lerp, line, disc, particles, ridge, skyline, pine, follow } from './engine.js'

// A puffy cloud of tiles that drifts across and loops. Starts off the left edge so it never pops in.
function cloud(x, R, r, w, fill, ink, dur, delay) {
  const t = []

  ;[[0.2, 0.6], [0, 1], [0.1, 0.85]].forEach(([a, b], j) => {
    for (let i = Math.floor(w * a); i < Math.floor(w * b); i++) {
      t.push(put(tile(x, fill, ink, pick(R, ['~', '.', '-'])), -w + i, r + j))
    }
  })

  return mover(x, [[-w, r], [122, r]], dur, delay, t.join(''), 'loop')
}

// A small flower: stem tile plus a bloom.
const bloom = (x, R, c, r, cols) => [put(tile(x, null, '#4a9a3a', '|'), c, r + 1), put(tile(x, null, pick(R, cols), pick(R, ['*', '@', 'o'])), c, r)]

// ---------------------------------------------------------------- Spring Meadow
function meadow(name) {
  const x = ctx()
  const R = rng(401)
  const b = []
  b.push(phased(disc(x, R, 1600, 150, 70, (px, py, t) => [lerp('#fffbd0', '#ffe890', t), '#d8b840'], '.'), 2))
  b.push(cloud(x, R, 4, 22, '#ffffff', '#c4def0', 150, -20), cloud(x, R, 9, 16, '#ffffff', '#c4def0', 190, -110), cloud(x, R, 14, 26, '#ffffff', '#c4def0', 230, -60))
  b.push(ridge(x, R, { base: 32, h: c => 7 + 3 * Math.sin(c / 14) + 1.5 * Math.sin(c / 5), fill: ['#c8e8b0', '#a8d890'], edge: ['#d8f0c0', '#8cc070'], glyphs: ',.', seed: 3 }))
  b.push(ridge(x, R, { base: 41, h: c => 6 + 3 * Math.sin(c / 11 + 2) + Math.sin(c / 4), fill: ['#8fd068', '#66b848'], edge: ['#a8e080', '#4a9a3a'], glyphs: '"v', seed: 4 }))

  // flowers sway in groups
  for (let g = 0; g < 4; g++) {
    const fl = []

    for (let i = 0; i < 26; i++) {
      const c = Math.floor(R() * 118)
      const base = 41 - Math.round(6 + 3 * Math.sin(c / 11 + 2) + Math.sin(c / 4)) + 2 + Math.floor(R() * 5)
      fl.push(...bloom(x, R, c, Math.min(46, base), ['#ff7aa8', '#ffd23d', '#ffffff', '#b78cff', '#ff9a5a']))
    }

    b.push(mover(x, [[0, 0], [1, 0], [0, 0]], 4 + g, -g * 1.3, fl.join(''), 'loop'))
  }

  // butterflies wander
  for (let i = 0; i < 5; i++) {
    const pts = [[10 + i * 20, 22 + i]]

    for (let k = 0; k < 7; k++) {
      pts.push([Math.max(1, Math.min(118, pts[k][0] + Math.floor((R() - 0.4) * 16))), Math.max(10, Math.min(36, pts[k][1] + Math.floor((R() - 0.5) * 10)))])
    }

    const col = pick(R, ['#ff7aa8', '#ffb23d', '#7ab8ff'])
    b.push(mover(x, pts, 30 + i * 6, -i * 9, phased([put(tile(x, col, '#fff', 'w'), pts[0][0], pts[0][1]), put(tile(x, col, '#fff', 'm'), pts[0][0] + 1, pts[0][1]), put(tile(x, col, '#fff', 'w'), pts[0][0] + 2, pts[0][1])], 20 + i), 'loop'))
  }

  b.push(...signature(x, name, '#3f7f35', '#2f6f2a'))

  return shell(x, { sky: [[0, '#a8dcff'], [0.55, '#dff3ff'], [1, '#f2fbe4']], veil: '#eef9f0', veilA: 0.2, grid: '#4a9a3a', gridA: 0.04, body: b.join('') })
}

// ---------------------------------------------------------------- Low Tide
function beach(name) {
  const x = ctx()
  const R = rng(411)
  const b = []
  b.push(phased(disc(x, R, 1500, 140, 80, (px, py, t) => [lerp('#fffbe0', '#ffe9a0', t), '#d8b050'], '.'), 2))
  b.push(cloud(x, R, 6, 24, '#ffffff', '#cfe6f4', 200, -80), cloud(x, R, 12, 18, '#ffffff', '#cfe6f4', 160, -30))

  // the sea: a gradient plate with sparse tiles, brighter where the swell passes
  x.defs.push('<linearGradient id="sea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7fdcf0"/><stop offset="1" stop-color="#2eaed0"/></linearGradient><linearGradient id="snd" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f6e4b8"/><stop offset="1" stop-color="#e2c88c"/></linearGradient>')
  b.push(`<rect y="${22 * CH}" width="1920" height="${11 * CH}" fill="url(#sea)"/><rect y="${33 * CH}" width="1920" height="${16 * CH}" fill="url(#snd)"/>`)
  const bands = [[], [], [], [], [], []]

  for (let r = 22; r < 33; r++) {
    for (let c = 0; c < 120; c++) {
      if ((c + r) % 3 === 0) {
        bands[Math.floor(c / 10) % 6].push(put(tile(x, null, lerp('#d8f8ff', '#8fe0f0', (r - 22) / 11), pick(R, ['~', '~', '-'])), c, r))
      }
    }
  }

  bands.forEach((arr, i) => b.push(`<g class="aw" style="animation-delay:${(-i * 0.8).toFixed(2)}s">${arr.join('')}</g>`))
  x.anim.push('.aw{animation:sh 5s ease-in-out infinite}')

  for (let i = 0; i < 160; i++) {
    b.push(put(tile(x, null, '#c8aa6a', pick(R, ['.', ',', ':'])), Math.floor(R() * 120), 34 + Math.floor(R() * 14)))
  }

  const foam = []

  for (let c = 0; c < 120; c++) {
    foam.push(put(tile(x, '#ffffff', '#9ad8e8', pick(R, ['~', 'o', '.'])), c, 33))
  }

  b.push(mover(x, [[0, 0], [0, 2], [0, 0]], 9, 0, foam.join(''), 'loop'))

  // a palm leaning in from the left
  const trunk = tile(x, '#8a5a30', '#c89050', '(')

  for (let r = 44; r > 18; r--) {
    b.push(put(trunk, 6 + Math.round(Math.sin((44 - r) / 9) * 2.5), r))
  }

  for (const [dc, dr] of [[-9, 4], [10, 3], [-6, -4], [8, -4], [0, -7], [-12, 9], [13, 8]]) {
    b.push(...line([6, 18], [6 + dc, 18 + dr], tile(x, '#4aa83a', '#2a7a28', pick(R, ['/', '\\', '^']))))
  }

  // gulls and a crab
  for (let i = 0; i < 3; i++) {
    const r = 8 + i * 4

    b.push(mover(x, [[-6, r], [30, r - 2], [60, r + 1], [90, r - 2], [124, r]], 36 + i * 9, -i * 11, phased([put(tile(x, null, '#6a7a88', '^'), -6, r), put(tile(x, null, '#6a7a88', '^'), -5, r)], 30 + i), 'loop'))
  }

  b.push(mover(x, [[20, 41], [50, 41], [30, 43], [80, 42], [20, 41]], 50, -10, [put(tile(x, '#e8603a', '#fff', 'w'), 20, 41), put(tile(x, '#e8603a', '#fff', 'w'), 21, 41)].join(''), 'loop'))

  for (let i = 0; i < 9; i++) {
    b.push(put(tile(x, null, pick(R, ['#d86a8a', '#e8a8c0', '#c88a4a']), pick(R, ['*', '@', 'o'])), 4 + Math.floor(R() * 112), 36 + Math.floor(R() * 10)))
  }

  b.push(...signature(x, name, '#a88a4a', '#c8a060'))

  return shell(x, { sky: [[0, '#8fdcff'], [0.4, '#d4f4ff'], [1, '#f6f0dc']], veil: '#f6f4ea', veilA: 0.2, grid: '#38b8d8', gridA: 0.03, body: b.join('') })
}

// ---------------------------------------------------------------- Snow Day
function snowDay(name) {
  const x = ctx()
  const R = rng(421)
  const b = []
  b.push(phased(disc(x, R, 300, 150, 56, (px, py, t) => [lerp('#ffffff', '#fff4d8', t), '#d8c890'], '.'), 2))
  b.push(cloud(x, R, 5, 24, '#ffffff', '#c8d8ec', 220, -100), cloud(x, R, 10, 16, '#f2f8ff', '#c8d8ec', 180, -40))
  b.push(ridge(x, R, { base: 33, h: c => 8 + 3 * Math.sin(c / 16) + Math.sin(c / 4), fill: ['#e8f0fa', '#d4e2f2'], edge: ['#f6fbff', '#b8cce4'], glyphs: '^.', seed: 3 }))
  b.push(ridge(x, R, { base: 42, h: c => 6 + 3 * Math.sin(c / 12 + 1), fill: ['#ffffff', '#e8f0fa'], edge: ['#ffffff', '#c0d4ec'], glyphs: '.,', seed: 4 }))

  for (const [c, h] of [[8, 9], [15, 7], [22, 10], [96, 8], [104, 11], [112, 7]]) {
    b.push(...pine(x, R, c, 41, h, ['#2f7a52', '#3a8a60'], '#ffffff'))
  }

  // a snowman
  const sm = ['    ##    ', '   ####   ', '   #oo#   ', '    ##    ', '   ####   ', '  ######  ', '  ##oo##  ', ' ######## ', ' ######## ']
  b.push(...sprite(x, sm, { '#': { fill: '#ffffff', ink: '#b8cce4', g: '*o.' }, o: { fill: '#3a3a4a', ink: '#8a8a9a', g: '.' } }, 56, 33, 5))
  b.push(put(tile(x, '#ff8a3a', '#fff', '>'), 62, 34))

  // a sled running down the slope
  b.push(mover(x, [[100, 25], [60, 36], [20, 44], [-6, 46]], 16, 0, [put(tile(x, '#d8453a', '#fff', '='), 100, 25), put(tile(x, '#d8453a', '#fff', '='), 101, 25), put(tile(x, '#3a6ad8', '#fff', 'o'), 100, 24)].join(''), 'burst'))

  b.push(...particles(x, R, { n: 90, c: [0, 120], r: [-2, 10], dx: r => Math.floor((r() - 0.3) * 8), dy: 46, dur: [10, 22], glyphs: '*.', inks: ['#9ab8d8', '#c0d4ec', '#7a9cc4'] }))
  b.push(...signature(x, name, '#6a88aa', '#4a6a90'))

  return shell(x, { sky: [[0, '#cfe4f8'], [0.6, '#eef6fd'], [1, '#ffffff']], veil: '#f2f8ff', veilA: 0.2, grid: '#7a9cc4', gridA: 0.04, body: b.join('') })
}

// ---------------------------------------------------------------- Pastel City
function pastelCity(name) {
  const x = ctx()
  const R = rng(431)
  const b = []
  b.push(phased(disc(x, R, 960, 360, 120, (px, py, t) => [lerp('#fff0e0', '#ffd0c0', t), '#e8a890'], '.'), 2))
  b.push(cloud(x, R, 6, 22, '#fff8fa', '#f0c8d8', 210, -70), cloud(x, R, 11, 28, '#fff8fa', '#f0c8d8', 260, -150))
  b.push(skyline(x, R, { from: 0, to: 120, base: 40, w: [5, 9], h: [8, 16], fill: '#e4d0ec', lit: 0.2, windows: ['#fff6c8', '#ffffff'], seed: 5 }))
  b.push(skyline(x, R, { from: 0, to: 120, base: 46, w: [6, 11], h: [6, 13], fill: '#f6c8d8', lit: 0.25, windows: ['#fff6c8', '#ffe8f0', '#ffffff'], seed: 6 }))

  // balloons drift up and across
  const palette = [['#ff7aa8', '#ffd8e4'], ['#7ab8ff', '#d4e8ff'], ['#ffc83d', '#fff0b8'], ['#8adf9a', '#d8f8de']]

  for (let i = 0; i < 6; i++) {
    const c = 10 + i * 19
    const [f, s] = palette[i % 4]
    const bal = disc(x, R, c * CW, 18 * CH, 40, (px, py, t) => [lerp(f, s, t * 0.8), '#fff'], 'o.')
    bal.push(put(tile(x, '#8a6a4a', '#fff', '#'), c, 21))

    b.push(mover(x, [[0, 0], [8, -14], [16, -28]], 44 + i * 5, -i * 8, bal.join(''), 'loop'))
  }

  b.push(...particles(x, R, { n: 14, c: [0, 120], r: [4, 22], dx: 30, dy: 0, dur: [30, 60], glyphs: 'v^', inks: ['#8a7a9a', '#9a8aaa'], mode: 'loop' }))
  b.push(...signature(x, name, '#b08aa0', '#d870a0'))

  return shell(x, { sky: [[0, '#ffd8e8'], [0.5, '#ffe9d8'], [1, '#fff6ee']], veil: '#fff2f0', veilA: 0.2, grid: '#d890b0', gridA: 0.04, body: b.join('') })
}

// ---------------------------------------------------------------- Greenhouse
function greenhouse(name) {
  const x = ctx()
  const R = rng(441)
  const b = []
  x.defs.push('<linearGradient id="bm" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff2a0" stop-opacity=".9"/><stop offset="1" stop-color="#fff2a0" stop-opacity="0"/></linearGradient>')
  x.kf.push('@keyframes bmk{0%,100%{opacity:.35}50%{opacity:1}}')
  x.anim.push('.bm1{animation:bmk 11s ease-in-out infinite}.bm2{animation:bmk 11s ease-in-out -4s infinite}.bm3{animation:bmk 11s ease-in-out -8s infinite}')

  for (const [x0, w, cls] of [[300, 90, 'bm1'], [760, 70, 'bm2'], [1180, 110, 'bm3'], [1560, 80, 'bm1']]) {
    b.push(`<path class="${cls}" d="M${x0} 0 L${x0 + w} 0 L${x0 + w * 2.4} 900 L${x0 - w * 0.6} 900Z" fill="url(#bm)"/>`)
  }

  // the glass roof: an arch of frame lines
  const frame = tile(x, null, '#8fbfa8', '|')
  const bar = tile(x, null, '#8fbfa8', '-')

  for (let c = 0; c < 120; c += 10) {
    b.push(...trace(x, [[c, 0], [c, 12]], null, '#6fa88c', '-', '|'))
  }

  for (let r = 3; r < 14; r += 4) {
    b.push(...trace(x, [[0, r], [119, r]], null, '#9fcfb8', '-', '|'))
  }

  b.push(...trace(x, [[0, 5], [119, 5]], null, '#8fbfa8', '-', '|'))

  // shelves of pots with leafy plants
  for (const [c0, c1, r] of [[3, 44, 40], [76, 117, 40], [3, 30, 28], [90, 117, 28]]) {
    for (let c = c0; c < c1; c += 5) {
      b.push(put(tile(x, '#c8683a', '#f0a070', '#'), c, r), put(tile(x, '#c8683a', '#f0a070', '#'), c + 1, r), put(tile(x, '#c8683a', '#f0a070', '#'), c + 2, r))
      const leaves = []
      const h = 5 + Math.floor(R() * 9)

      for (let k = 1; k <= h; k++) {
        leaves.push(put(tile(x, null, '#3a8a3a', '|'), c + 1, r - k))

        if (k > 1 && k % 2 === 0) {
          leaves.push(put(tile(x, '#58c248', '#1f6a2a', pick(R, ['}', '{', 'v'])), c + 2, r - k), put(tile(x, '#58c248', '#1f6a2a', pick(R, ['}', '{', 'v'])), c, r - k), put(tile(x, '#7ad866', '#1f6a2a', pick(R, ['}', '{'])), c + 3, r - k + 1), put(tile(x, '#7ad866', '#1f6a2a', pick(R, ['}', '{'])), c - 1, r - k + 1))
        }
      }

      b.push(mover(x, [[0, 0], [1, 0], [0, 0]], 5 + R() * 4, -R() * 5, leaves.join(''), 'loop'))
    }

    b.push(...trace(x, [[c0 - 1, r + 1], [c1 + 2, r + 1]], null, '#b89a78', '=', '|'))
  }

  // dust motes in the light, and a drip
  b.push(...particles(x, R, { n: 40, c: [8, 112], r: [4, 40], dx: r => Math.floor((r() - 0.5) * 6), dy: -6, dur: [10, 24], glyphs: '.o', inks: ['#e8d890', '#fff6c0'] }))
  b.push(...particles(x, R, { n: 6, c: [20, 24], r: [30, 31], dx: 0, dy: 9, dur: [3, 5], glyphs: 'o', inks: ['#6ab8e8'] }))
  b.push(...signature(x, name, '#5f9a7a', '#2f7a52'))

  return shell(x, { sky: [[0, '#e4f6e8'], [0.6, '#f2faee'], [1, '#e8f2e0']], veil: '#f2f8ee', veilA: 0.2, grid: '#8fbfa8', gridA: 0.05, body: b.join('') })
}

// ---------------------------------------------------------------- Lavender Rows
function lavender(name) {
  const x = ctx()
  const R = rng(451)
  const b = []
  const VX = 60
  const VY = 22
  b.push(phased(disc(x, R, 960, 330, 90, (px, py, t) => [lerp('#fff0c8', '#ffc890', t), '#d89860'], '.'), 2))
  b.push(cloud(x, R, 4, 24, '#fff6ee', '#f0d0c8', 240, -90))
  b.push(ridge(x, R, { base: 22, h: c => 3 + 1.5 * Math.sin(c / 9), fill: ['#c8b0d8', '#b098c8'], edge: ['#d8c4e4', '#9a80b8'], glyphs: '^.', seed: 3 }))

  // rows run to a vanishing point
  const ends = [-30, -4, 22, 48, 74, 100, 126, 152, 178]

  ends.forEach((e, i) => {
    const row = []
    const pts = line([VX, VY + 1], [Math.max(0, Math.min(119, e)), 48], 0).length

    // sample along the line manually
    for (let t = 0; t <= 1; t += 1 / 60) {
      const c = Math.round(VX + (e - VX) * t)
      const r = Math.round(VY + 1 + (48 - VY - 1) * t)

      if (c >= 0 && c < 120) {
        const f = Math.min(1, 0.2 + t)
        row.push(put(tile(x, lerp('#9a78c8', '#6a48a8', f), lerp('#d8b8f0', '#b890e0', f), pick(R, ['^', '*', 'i'])), c, r), put(tile(x, lerp('#9a78c8', '#6a48a8', f), lerp('#d8b8f0', '#b890e0', f), pick(R, ['^', '*', 'i'])), Math.min(119, c + 1), r))
      }
    }

    b.push(phased(row, 10 + i))
  })

  // a farmhouse on the horizon
  b.push(...sprite(x, ['   /\\   ', '  /##\\  ', ' /####\\ ', ' ##oo## ', ' ##oo## '], { '#': { fill: '#f6e4d0', ink: '#c89870', g: '.' }, o: { fill: '#8a5a3a', ink: '#c89870', g: '|' }, '/': { fill: null, ink: '#b8503a', g: '/' }, '\\': { fill: null, ink: '#b8503a', g: '\\' } }, 70, 18, 3))

  // bees
  for (let i = 0; i < 6; i++) {
    const r = 30 + Math.floor(R() * 14)
    const pts = [[Math.floor(R() * 100), r]]

    for (let k = 0; k < 6; k++) {
      pts.push([Math.max(0, Math.min(118, pts[k][0] + Math.floor((R() - 0.5) * 22))), Math.max(26, Math.min(47, pts[k][1] + Math.floor((R() - 0.5) * 6)))])
    }

    b.push(mover(x, pts, 26 + i * 5, -i * 6, put(tile(x, '#ffd23d', '#3a2a10', '='), pts[0][0], pts[0][1]), 'loop'))
  }

  b.push(...signature(x, name, '#8a68b0', '#6a48a8'))

  return shell(x, { sky: [[0, '#ffd8c0'], [0.45, '#f8e0e8'], [1, '#efe4f6']], veil: '#f6eef8', veilA: 0.2, grid: '#9a78c8', gridA: 0.04, body: b.join('') })
}

// ---------------------------------------------------------------- Kite Day
function kite(name) {
  const x = ctx()
  const R = rng(461)
  const b = []
  b.push(phased(disc(x, R, 1650, 140, 60, (px, py, t) => [lerp('#fffbd8', '#ffe888', t), '#d8b840'], '.'), 2))
  b.push(cloud(x, R, 4, 24, '#ffffff', '#c4def0', 160, -50), cloud(x, R, 10, 18, '#ffffff', '#c4def0', 220, -140), cloud(x, R, 17, 20, '#ffffff', '#c4def0', 190, -100))
  b.push(ridge(x, R, { base: 43, h: c => 7 + 3 * Math.sin(c / 13) + 1.5 * Math.sin(c / 5), fill: ['#9ee078', '#74c850'], edge: ['#b4ee90', '#56aa38'], glyphs: ',"', seed: 3 }))

  // a kid on the hill
  b.push(...sprite(x, [' @ ', '/#\\', '/ \\'], { '@': { fill: '#ffd8b0', ink: '#a8683a', g: 'o' }, '#': { fill: '#3a8ad8', ink: '#fff', g: '#' }, '/': { fill: null, ink: '#3a3a5a', g: '/' }, '\\': { fill: null, ink: '#3a3a5a', g: '\\' } }, 16, 37, 2))

  const kites = [[44, 8, '#ff5a7a'], [70, 15, '#ffc83d'], [96, 6, '#3a9ae8'], [28, 18, '#9a5ae8']]

  kites.forEach(([c, r, col], i) => {
    const body = []
    const str = line([17, 38], [c, r + 2], tile(x, null, '#5a5a6a', '.'))
    b.push(str.join(''))

    for (let dr = -2; dr <= 2; dr++) {
      for (let dc = -2; dc <= 2; dc++) {
        if (Math.abs(dc) + Math.abs(dr) <= 2) {
          body.push(put(tile(x, lerp(col, '#ffffff', (dc + dr + 4) / 12), '#fff', Math.abs(dc) + Math.abs(dr) === 0 ? '#' : '+'), c + dc, r + dr))
        }
      }
    }

    for (let k = 2; k < 6; k++) {
      body.push(put(tile(x, null, col, k % 2 ? '~' : '-'), c + (k % 2 ? 0 : 1), r + k + 1))
    }

    b.push(mover(x, [[0, 0], [1, -1], [2, 0], [1, 1], [0, 0]], 6 + i * 1.5, -i * 2, body.join(''), 'loop'))
  })

  b.push(...particles(x, R, { n: 16, c: [0, 120], r: [18, 40], dx: 40, dy: -2, dur: [12, 24], glyphs: '~', inks: ['#b8d8ec'], mode: 'loop' }))
  b.push(...signature(x, name, '#4a9a3a', '#2f7a2a'))

  return shell(x, { sky: [[0, '#8fd0ff'], [0.6, '#d4eeff'], [1, '#f0fbe4']], veil: '#eef8f0', veilA: 0.2, grid: '#4a9a3a', gridA: 0.04, body: b.join('') })
}

// ---------------------------------------------------------------- Sketchbook
function sketch(name) {
  const x = ctx()
  const R = rng(471)
  const b = []
  const INK = '#4a463e'
  const g = tile(x, null, INK, '/')
  const gb = tile(x, null, INK, '\\')
  const gh = tile(x, null, INK, '-')
  const gv = tile(x, null, INK, '|')
  const gd = tile(x, null, '#8a8478', '.')
  const groups = []

  const draw = (list) => groups.push(list.join(''))

  // mountains
  draw([...line([4, 36], [24, 14], g), ...line([24, 14], [44, 36], gb), ...line([30, 36], [50, 20], g), ...line([50, 20], [72, 36], gb)])
  // a sun with rays
  draw([...disc(x, R, 1560, 170, 56, () => [null, INK], '.o'), ...line([88, 5], [88, 1], gv), ...line([100, 6], [104, 2], g), ...line([76, 6], [72, 2], gb)])
  // a tree
  draw([...line([96, 44], [96, 30], gv), ...line([97, 44], [97, 30], gv), ...disc(x, R, 97 * CW, 25 * CH, 90, () => [null, '#3f6f3a'], '*o^')])
  // a river
  draw([...line([20, 36], [10, 44], gb), ...line([24, 36], [16, 48], gb), ...line([36, 36], [58, 46], g), ...line([40, 36], [64, 48], g)])
  // a cabin
  draw([...line([56, 36], [60, 32], g), ...line([60, 32], [64, 36], gb), ...trace(x, [[56, 36], [56, 41], [64, 41], [64, 36]], null, INK, '-', '|'), ...line([58, 41], [58, 38], gv)])
  // hatching on the ground
  draw(Array.from({ length: 70 }, () => put(R() < 0.5 ? g : gd, 2 + Math.floor(R() * 112), 43 + Math.floor(R() * 5))))

  // each group fades in one after the other, then they all rest and clear together
  groups.forEach((gr, i) => {
    const start = (i * 13).toFixed(1)
    x.kf.push(`@keyframes sk${i}{0%,${start}%{opacity:0}${(+start + 5).toFixed(1)}%,94%{opacity:1}100%{opacity:0}}`)
    x.anim.push(`.sk${i}{animation:sk${i} 40s linear infinite}`)
    b.push(`<g class="sk${i}">${gr}</g>`)
  })

  // the pencil
  b.push(mover(x, [[4, 36], [24, 14], [44, 36], [50, 20], [72, 36], [4, 36]], 40, 0, [put(tile(x, '#e8c84a', '#4a3a10', '>'), 4, 36), put(tile(x, '#e86a6a', '#fff', '='), 3, 36)].join(''), 'loop'))
  b.push(...signature(x, name, '#8a8478', INK))

  return shell(x, { bg: ['#f7f1e4', '#efe6d2'], veil: '#f7f1e4', veilA: 0.2, grid: '#8a8478', gridA: 0.06, fontSize: 15, weight: 600, body: b.join('') })
}

export const LIGHT = { meadow, beach, snowDay, pastelCity, greenhouse, lavender, kite, sketch }
