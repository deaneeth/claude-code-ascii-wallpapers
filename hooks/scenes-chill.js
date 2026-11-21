// Chill scenes: cozy, slow, easy on the eyes.
import { CW, CH, rng, pick, ctx, tile, put, phased, sprite, word, mover, trace, shell, signature, lerp, stars, line, disc, particles, ridge, skyline, pine, wavy } from './engine.js'

// ---------------------------------------------------------------- Snow cabin
function snowCabin(name) {
  const x = ctx()
  const R = rng(201)
  const b = []
  b.push(phased(stars(x, R, 60, 22, 120, ['#cfd8ff', '#fff1c9', '#8aa0d8']), 2))
  b.push(phased(disc(x, R, 1640, 150, 64, (px, py, t) => [lerp('#f4f0e0', '#c9c4a8', t * t), '#8a8668'], '.:'), 3))

  b.push(ridge(x, R, { base: 40, h: c => 9 + 4 * Math.sin(c / 14) + 2 * Math.sin(c / 5), fill: ['#27406e', '#122244'], edge: ['#dfe9ff', '#8aa0c8'], glyphs: '*.', seed: 4 }))

  // pines, big at the edges
  for (const [c, h] of [[6, 14], [14, 11], [22, 8], [100, 9], [108, 13], [115, 10], [30, 6], [93, 7]]) {
    b.push(phased(pine(x, R, c, 45, h, ['#0f3a30', '#16503f', '#0c2e26'], '#e8f0ff'), c))
  }

  // the cabin
  const wall = { '#': { fill: '#6a4428', ink: '#3a2414', g: '|=' }, r: { fill: '#e8f0ff', ink: '#9ab0d8', g: '*.' }, w: { fill: '#ffcf6a', ink: '#b87a14', g: '+' }, d: { fill: '#3a2414', ink: '#6a4428', g: '|' }, c: { fill: '#5a4a44', ink: '#8a7a70', g: '#' } }
  const cabin = ['    c     ', '  rrrrrrr  ', ' rrrrrrrrr ', 'rrrrrrrrrrr', ' ######### ', ' #ww###ww# ', ' #ww#d#ww# ', ' ######### ']
  b.push(...sprite(x, cabin, wall, 78, 34, 5))
  b.push(phased(sprite(x, ['ww', 'ww'], wall, 80, 39, 6).concat(sprite(x, ['ww', 'ww'], wall, 86, 39, 7)), 8))
  b.push(...particles(x, R, { n: 5, c: [82, 84], r: [30, 33], dx: 3, dy: -9, dur: [8, 14], glyphs: '~o', inks: ['#b8c4d8', '#8a96ae'] }))

  // snow falling
  b.push(...particles(x, R, { n: 120, c: [0, 120], r: [-2, 4], dx: r => Math.floor((r() - 0.5) * 8), dy: 48, dur: [7, 16], glyphs: '.*', inks: ['#ffffff', '#cfdcff', '#e8f0ff'] }))
  b.push(...signature(x, name, '#6a86b8', '#ffcf6a'))

  return shell(x, { sky: [[0, '#0a1230'], [0.7, '#1a2a56'], [1, '#27406e']], veil: '#070d1f', veilA: 0.4, grid: '#8aa0ff', gridA: 0.02, body: b.join('') })
}

// ---------------------------------------------------------------- Lighthouse
function lighthouse(name) {
  const x = ctx()
  const R = rng(211)
  const b = []
  const HZ = 30
  b.push(phased(stars(x, R, 90, 26, 120, ['#cfd8ff', '#fff1c9', '#8aa0d8']), 2))

  // the beams, sweeping out to each side in turn
  x.defs.push('<linearGradient id="bm1" x1="1" y1="0" x2="0" y2="0"><stop offset="0" stop-color="#fff2b0" stop-opacity=".55"/><stop offset="1" stop-color="#fff2b0" stop-opacity="0"/></linearGradient>')
  x.defs.push('<linearGradient id="bm2" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff2b0" stop-opacity=".55"/><stop offset="1" stop-color="#fff2b0" stop-opacity="0"/></linearGradient>')
  x.kf.push('@keyframes bmx{0%,6%{opacity:0}30%,52%{opacity:1}76%,100%{opacity:0}}')
  x.anim.push('.bmA{animation:bmx 9s ease-in-out infinite}.bmB{animation:bmx 9s ease-in-out -4.5s infinite}')
  const lx = 92 * CW + 8
  const ly = 15 * CH
  b.push(`<path class="bmA" d="M${lx} ${ly - 14} L0 ${ly - 230} L0 ${ly + 120} L${lx} ${ly + 14}Z" fill="url(#bm1)"/>`)
  b.push(`<path class="bmB" d="M${lx} ${ly - 14} L1920 ${ly - 230} L1920 ${ly + 120} L${lx} ${ly + 14}Z" fill="url(#bm2)"/>`)

  // the sea
  x.defs.push('<linearGradient id="sea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#143a5c"/><stop offset="1" stop-color="#071a2e"/></linearGradient>')
  b.push(`<rect y="${HZ * CH}" width="1920" height="${1080 - HZ * CH}" fill="url(#sea)"/>`)
  const buckets = Array.from({ length: 12 }, () => [])

  for (let r = HZ + 1; r < 47; r += 2) {
    for (let c = (r % 4) / 2; c < 120; c += 3) {
      buckets[Math.floor(c / 10)].push(put(tile(x, null, lerp('#3a7aa8', '#102a44', (r - HZ) / 17), '~'), c, r))
    }
  }

  x.anim.push('.aw{animation:sh 5.5s ease-in-out infinite}')
  b.push(wavy(x, buckets, 0.5))

  // the headland and tower
  b.push(ridge(x, R, { base: 46, h: c => (c > 80 ? 9 - Math.abs(c - 100) * 0.35 : -2), fill: ['#1a1f2a', '#0a0d12'], edge: ['#2a3342', '#4a5870'], glyphs: '^:.', seed: 6 }))
  const tower = []

  for (let r = 0; r < 20; r++) {
    const w = r < 3 ? 3 : 3 + Math.floor(r / 6)
    const stripe = Math.floor(r / 3) % 2 === 0
    tower.push(...sprite(x, ['#'.repeat(w)], { '#': { fill: stripe ? '#f2f2f2' : '#c93a3a', ink: stripe ? '#9aa4b0' : '#5a1010', g: '=:' } }, 92 - Math.floor(w / 2), 18 + r, r))
  }

  b.push(...tower, ...sprite(x, ['  ####  ', ' ######## '], { '#': { fill: '#2a2f3a', ink: '#6a7488', g: '^' } }, 90, 15, 3))
  b.push(`<g class="cur" style="animation-duration:2.2s">${sprite(x, ['##'], { '#': { fill: '#fff2b0', ink: '#a8801a', g: '*' } }, 92, 16, 4).join('')}</g>`)
  b.push(...particles(x, R, { n: 6, c: [4, 110], r: [8, 24], dx: 26, dy: -2, dur: [30, 60], glyphs: 'v', inks: ['#9ab0c8'] }))
  b.push(...signature(x, name, '#4a6a8f', '#fff2b0'))

  return shell(x, { sky: [[0, '#070d24'], [0.6, '#142a4a'], [1, '#143a5c']], veil: '#050b18', veilA: 0.4, grid: '#8aa0ff', gridA: 0.02, body: b.join('') })
}

// ---------------------------------------------------------------- Campfire
function campfire(name) {
  const x = ctx()
  const R = rng(221)
  const b = []
  const glow = '<radialGradient id="fg" cx=".78" cy=".78" r=".45"><stop offset="0" stop-color="#ff9a3c" stop-opacity=".5"/><stop offset="1" stop-color="#ff9a3c" stop-opacity="0"/></radialGradient>'
  x.anim.push('.fl{animation:glow 2.3s ease-in-out infinite}')
  b.push(`<rect class="fl" width="1920" height="1080" fill="url(#fg)"/>`)
  b.push(phased(stars(x, R, 90, 28, 120, ['#cfd8ff', '#fff1c9', '#8aa0d8']), 2))

  b.push(ridge(x, R, { base: 40, h: c => 7 + 3 * Math.sin(c / 11) + 2 * Math.sin(c / 4.3), fill: ['#10281f', '#08140f'], edge: ['#1a3a2c', '#2a5a44'], glyphs: '^.', seed: 2 }))
  for (const [c, h] of [[5, 13], [13, 10], [22, 7], [112, 12], [104, 9]]) {
    b.push(phased(pine(x, R, c, 44, h, ['#0d2a22', '#123828'], null), c))
  }

  // flames in three flickering layers
  const big = rows => rows.flatMap(r => { const w = [...r].map(ch => ch + ch).join(''); return [w, w] })
  const f1 = big(['   ##   ', '  ####  ', ' ###### ', '########'])
  const f2 = big(['  ##  ', ' #### ', '######'])
  const f3 = big([' ## ', '####'])
  const pal = (a, c2) => ({ '#': { fill: a, ink: c2, g: '^*' } })
  b.push(`<g class="s0">${sprite(x, f1, pal('#d9461c', '#ffb066'), 88, 31, 1).join('')}</g>`)
  b.push(`<g class="s1">${sprite(x, f2, pal('#ff8a2a', '#fff0a0'), 90, 33, 2).join('')}</g>`)
  b.push(`<g class="s2">${sprite(x, f3, pal('#ffd54a', '#fff8d0'), 92, 36, 3).join('')}</g>`)
  b.push(...sprite(x, ['#################', '#################', ' ############### '], { '#': { fill: '#5a3418', ink: '#9a6a30', g: '=' } }, 87, 39, 4))
  b.push(...trace(x, [[40, 44], [119, 44]], '#1a1410', '#3a2a1a', '_', '_'))

  // sparks lifting off
  b.push(...particles(x, R, { n: 46, c: [87, 104], r: [32, 40], dx: r => Math.floor((r() - 0.5) * 14), dy: -22, dur: [3, 7], glyphs: '*.+', inks: ['#ffb066', '#ffd54a', '#ff8a2a'] }))

  // a tent in the dark
  b.push(...sprite(x, ['    #    ', '   ###   ', '  ## ##  ', ' ##   ## ', '##     ##'], { '#': { fill: '#2a3a5a', ink: '#4a6090', g: '/\\' } }, 16, 40, 5))
  b.push(...signature(x, name, '#8a5a3a', '#ffb454'))

  return shell(x, { sky: [[0, '#070b1c'], [1, '#1a1428']], veil: '#080610', veilA: 0.4, grid: '#ffb454', gridA: 0.02, defs: glow, body: b.join('') })
}

// ---------------------------------------------------------------- Lo-fi room
function lofi(name) {
  const x = ctx()
  const R = rng(231)
  const b = []
  const lampGlow = '<radialGradient id="lg" cx=".2" cy=".62" r=".35"><stop offset="0" stop-color="#ffb86a" stop-opacity=".4"/><stop offset="1" stop-color="#ffb86a" stop-opacity="0"/></radialGradient>'
  b.push(`<rect class="gl" width="1920" height="1080" fill="url(#lg)"/>`)

  // string lights across the top, sagging
  const bulbs = []
  const cols = ['#ff7aa8', '#ffd98a', '#7ad7ff', '#b8ff9a', '#c79bff']

  for (let c = 0; c < 120; c++) {
    const r = 2 + Math.round(3 * Math.sin((c / 120) * Math.PI * 4))
    b.push(put(tile(x, null, '#3a2a4a', '-'), c, r))

    if (c % 4 === 0) {
      bulbs.push(put(tile(x, pick(R, cols), '#1a0f24', 'o'), c, r + 1))
    }
  }

  b.push(phased(bulbs, 3))

  // the window with a city and rain
  x.defs.push('<linearGradient id="wn" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1a1442"/><stop offset="1" stop-color="#4a2a5a"/></linearGradient>')
  b.push(`<rect x="${5 * CW}" y="${9 * CH}" width="${30 * CW}" height="${20 * CH}" fill="url(#wn)"/>`)
  b.push(skyline(x, R, { from: 5, to: 35, base: 29, w: [3, 6], h: [4, 9], fill: '#150f2e', lit: 0.45, windows: ['#ffd98a', '#7ad7ff', '#ff7aa8'], seed: 4 }))
  b.push(...disc(x, R, 29 * CW, 12 * CH, 40, (px, py, t) => [lerp('#fff6d8', '#e8d8a0', t), '#a89860'], '.o'))
  b.push(...particles(x, R, { n: 26, c: [5, 35], r: [9, 12], dx: 1, dy: 18, dur: [1.6, 3], glyphs: '|', inks: ['#9ab0d8'] }))
  const frame = tile(x, '#4a3322', '#7a5a38', '=')

  for (let c = 4; c <= 35; c++) {
    b.push(put(frame, c, 8), put(frame, c, 29))
  }

  for (let r = 8; r <= 29; r++) {
    b.push(put(frame, 4, r), put(frame, 35, r), put(frame, 20, r))
  }

  // the desk, a lamp, a laptop, a plant, a cat
  b.push(...trace(x, [[0, 36], [70, 36]], '#5a3a24', '#8a5a38', '=', '='), ...trace(x, [[0, 37], [70, 37]], '#3a2616', '#5a3a24', '#', '#'))
  b.push(...sprite(x, ['  ##  ', ' #### ', '######'], { '#': { fill: '#f0b05a', ink: '#8a5a14', g: '=' } }, 40, 29, 3), ...trace(x, [[43, 33], [43, 35]], '#3a2616', '#5a3a24', '|', '|'), ...sprite(x, ['######'], { '#': { fill: '#3a2616', ink: '#5a3a24', g: '=' } }, 40, 35, 4))
  const laptop = ['##########', '#........#', '#........#', '#........#', '##########']
  b.push(...sprite(x, laptop, { '#': { fill: '#4a4a5e', ink: '#8a8aa0', g: '=' }, '.': { fill: '#0f3a44', ink: '#4fe0c4', g: '=-:' } }, 50, 30, 5), ...sprite(x, ['############'], { '#': { fill: '#3a3a4a', ink: '#6a6a80', g: '=' } }, 49, 35, 6))
  b.push(phased(sprite(x, [' # # ', '#####', ' ### ', '  #  '], { '#': { fill: '#2f8a4a', ink: '#0a2a14', g: '%&' } }, 8, 32, 7).concat(sprite(x, ['###'], { '#': { fill: '#8a4a2a', ink: '#4a2010', g: '=' } }, 9, 36, 8)), 6))
  b.push(phased(sprite(x, ['  ###  ', '#######', '#######'], { '#': { fill: '#4a4a62', ink: '#7a7a98', g: '~' } }, 62, 33, 9), 8))
  b.push(...particles(x, R, { n: 4, c: [46, 48], r: [30, 33], dx: 1, dy: -5, dur: [5, 9], glyphs: '~', inks: ['#e8e2d6'] }))

  // a poster and a shelf on the right wall
  b.push(...sprite(x, ['########', '#      #', '# #### #', '# #### #', '#      #', '########'], { '#': { fill: '#7a4a8a', ink: '#c79bff', g: '=' } }, 96, 10, 10))
  b.push(...trace(x, [[90, 22], [116, 22]], '#5a3a24', '#8a5a38', '=', '='))

  for (let c = 91; c < 116; c += 2) {
    const h = 2 + Math.floor(R() * 3)

    for (let r = 22 - h; r < 22; r++) {
      b.push(put(tile(x, pick(R, ['#7a2e2e', '#2e4f7a', '#2e6b4f', '#7a5a2e']), '#000', '|'), c, r))
    }
  }

  b.push(...signature(x, name, '#8a6aa8', '#ffb86a', 74, 45))

  return shell(x, { sky: [[0, '#1b1233'], [1, '#2a1b40']], veil: '#120a22', veilA: 0.38, grid: '#c79bff', gridA: 0.025, defs: lampGlow, body: b.join('') })
}

// ---------------------------------------------------------------- Lava lamp
function lavaLamp(name) {
  const x = ctx()
  const R = rng(241)
  const b = []
  const glow = '<radialGradient id="lv" cx=".5" cy=".6" r=".75"><stop offset="0" stop-color="#ff3d9a" stop-opacity=".22"/><stop offset="1" stop-color="#ff3d9a" stop-opacity="0"/></radialGradient>'
  b.push(`<rect class="gl" width="1920" height="1080" fill="url(#lv)"/>`)
  const palettes = [['#ffd447', '#ff7a2a'], ['#ff7ac0', '#c01a78'], ['#ff9a5a', '#d02a3a'], ['#c79bff', '#6a2ad0']]

  for (let i = 0; i < 12; i++) {
    const rad = 46 + R() * 80
    const c = i % 2 === 0 ? 3 + Math.floor(R() * 24) : 92 + Math.floor(R() * 24)
    const [lo, hi] = pick(R, palettes)
    const dur = 38 + R() * 40
    const blob = disc(x, R, c * CW, 24 * CH, rad, (px, py, t) => [lerp(lo, hi, t * t), lerp(lo, '#ffffff', 0.3)], '.:o')
    // drawn mid-screen, started below the bottom edge, then it climbs past the top
    const k = 26 + Math.ceil(rad / CH)
    b.push(mover(x, [[0, 0], [0, -2 * k]], dur, -R() * dur, `<g transform="translate(0 ${k * CH})">${blob.join('')}</g>`, 'fade'))
  }

  b.push(...signature(x, name, '#a8508a', '#ffd447'))

  return shell(x, { bg: ['#1a0a2e', '#0a0414'], veil: '#0e0620', veilA: 0.45, grid: '#ff7ac0', gridA: 0.025, defs: glow, body: b.join('') })
}

// ---------------------------------------------------------------- Night train
function nightTrain(name) {
  const x = ctx()
  const R = rng(251)
  const b = []
  b.push(phased(stars(x, R, 90, 22, 120, ['#cfd8ff', '#fff1c9', '#8aa0d8']), 2))
  b.push(phased(disc(x, R, 300, 140, 60, (px, py, t) => [lerp('#f4f0e0', '#c9c4a8', t * t), '#8a8668'], '.:'), 3))
  b.push(ridge(x, R, { base: 31, h: c => 6 + 4 * Math.sin(c / 17) + 2 * Math.sin(c / 6), fill: ['#13304a', '#0a1c2c'], edge: ['#1c4a6a', '#2c6a8c'], glyphs: '^.', seed: 2 }))
  b.push(ridge(x, R, { base: 36, h: c => 4 + 3 * Math.sin(c / 9 + 2) + Math.sin(c / 3), fill: ['#0c2236', '#06121c'], edge: ['#12384f', '#1c5070'], glyphs: '^.', seed: 4 }))
  b.push(...trace(x, [[0, 39], [119, 39]], '#2a2a32', '#5a5a68', '=', '='), ...trace(x, [[0, 40], [119, 40]], '#14141a', '#3a3a48', '_', '_'))

  // the train: an engine and six carriages, windows lit
  const car = ['##############', '#w#w#w#w#w#w##', '#w#w#w#w#w#w##', '##############']
  const engine = ['  ####        ', '  ####  ######', '##############', '##############']
  const pal = { '#': { fill: '#3a4a6a', ink: '#6a80b0', g: '=' }, w: { fill: '#ffd070', ink: '#a87a14', g: '+' } }
  const train = []
  const startC = -100

  train.push(...sprite(x, engine, { '#': { fill: '#5a2a2a', ink: '#a05a5a', g: '=' } }, startC, 35, 1))

  for (let i = 0; i < 6; i++) {
    train.push(...sprite(x, car, pal, startC + 14 + i * 14, 35, 2 + i))
  }

  train.push(...particles(x, R, { n: 3, c: [startC + 3, startC + 5], r: [31, 33], dx: -10, dy: -6, dur: [3, 5], glyphs: 'o~', inks: ['#cfd8e8', '#9aa8c0'] }))
  b.push(mover(x, [[startC, 35], [124, 35]], 34, 0, train.join(''), 'loop'))

  // poles whipping past in front
  for (let i = 0; i < 3; i++) {
    const pole = tile(x, '#241a14', '#4a3a2a', '|')
    const post = []

    for (let r = 28; r <= 43; r++) {
      post.push(put(pole, 0, r))
    }

    post.push(...sprite(x, ['#######'], { '#': { fill: '#241a14', ink: '#4a3a2a', g: '=' } }, -3, 28, 5))
    b.push(mover(x, [[0, 0], [130, 0]], 6, -i * 2, post.join(''), 'loop'))
  }

  b.push(...signature(x, name, '#4a6a8f', '#ffd070', 4, 44))

  return shell(x, { sky: [[0, '#070d24'], [1, '#14304a']], veil: '#050b18', veilA: 0.4, grid: '#8aa0ff', gridA: 0.02, body: b.join('') })
}

// ---------------------------------------------------------------- Cherry blossom (light)
function cherry(name) {
  const x = ctx()
  const R = rng(261)
  const b = []
  b.push(phased(disc(x, R, 1560, 170, 76, (px, py, t) => [lerp('#fff4e0', '#ffd9b8', t), '#c89868'], '.'), 2))
  b.push(ridge(x, R, { base: 34, h: c => 8 + 4 * Math.sin(c / 15 + 1) + 2 * Math.sin(c / 6), fill: ['#d9cfe8', '#c4b8de'], edge: ['#e8e0f4', '#a898c8'], glyphs: '^.', seed: 3 }))

  // the tree: a leaning trunk, a cloud of blossom
  const trunk = tile(x, '#5a3a2a', '#9a6a4a', '|')

  for (let r = 44; r >= 20; r--) {
    const c = 16 + Math.round(Math.sin((44 - r) / 7) * 2.2)
    b.push(put(trunk, c, r), put(trunk, c + 1, r))
  }

  b.push(...line([18, 26], [30, 16], trunk), ...line([16, 30], [5, 20], trunk), ...line([18, 22], [26, 10], trunk))

  const blossom = []
  const pinks = ['#ffc8d8', '#ffb0c8', '#ffd8e4', '#f898b4']

  for (const [cx, cy, rad] of [[17, 12, 150], [30, 14, 120], [6, 17, 110], [26, 8, 100], [14, 4, 90], [36, 20, 80]]) {
    blossom.push(...disc(x, R, cx * CW, cy * CH, rad, (px, py, t) => (R() < 0.12 ? null : [pick(R, pinks), '#c04878']), '*.o'))
  }

  b.push(phased(blossom, 4))

  // a branch of blossom hanging in from the top right
  b.push(...line([119, 1], [96, 7], trunk))
  b.push(phased(disc(x, R, 106 * CW, 7 * CH, 90, (px, py, t) => (R() < 0.12 ? null : [pick(R, pinks), '#c04878']), '*.o').concat(disc(x, R, 114 * CW, 4 * CH, 70, () => [pick(R, pinks), '#c04878'], '*.')), 5))

  // petals falling, and a drift of them on the ground
  b.push(...particles(x, R, { n: 70, c: [0, 120], r: [-2, 10], dx: r => 4 + Math.floor(r() * 10), dy: 46, dur: [9, 20], glyphs: '*`,', inks: ['#ff9ab8', '#ffb8cc', '#f07898'] }))
  const ground = []

  for (let c = 0; c < 120; c++) {
    ground.push(put(tile(x, '#f6d0dc', '#d8809c', pick(R, ['*', '.', ','])), c, 46 + (R() < 0.3 ? -1 : 0)))
    ground.push(put(tile(x, '#e8b8c8', '#c0607c', '.'), c, 47))
  }

  b.push(phased(ground, 6), ...signature(x, name, '#a8607c', '#d84a78'))

  return shell(x, { sky: [[0, '#fde8ee'], [0.7, '#fbf1ee'], [1, '#f6e4e4']], veil: '#fbf1f1', veilA: 0.45, grid: '#c0607c', gridA: 0.04, body: b.join('') })
}

// ---------------------------------------------------------------- Autumn
function branch(x, R, cx, cy, ang, len, depth, out, leaves) {
  const ex = cx + (Math.sin(ang) * len) / CW
  const ey = cy - (Math.cos(ang) * len) / CH
  out.push(...line([Math.round(cx), Math.round(cy)], [Math.round(ex), Math.round(ey)], tile(x, depth > 3 ? '#4a3020' : '#3a2418', '#7a5a3a', depth > 3 ? '#' : '|')))

  if (depth === 0) {
    leaves.push([Math.round(ex), Math.round(ey)])

    return
  }

  branch(x, R, ex, ey, ang - 0.38 - R() * 0.25, len * 0.74, depth - 1, out, leaves)
  branch(x, R, ex, ey, ang + 0.34 + R() * 0.25, len * 0.74, depth - 1, out, leaves)

  if (R() < 0.35) {
    branch(x, R, ex, ey, ang + (R() - 0.5) * 0.3, len * 0.6, depth - 1, out, leaves)
  }
}

function autumn(name) {
  const x = ctx()
  const R = rng(271)
  const b = []
  const glow = '<radialGradient id="sn" cx=".5" cy=".85" r=".6"><stop offset="0" stop-color="#ff8a3c" stop-opacity=".35"/><stop offset="1" stop-color="#ff8a3c" stop-opacity="0"/></radialGradient>'
  b.push(`<rect class="gl" width="1920" height="1080" fill="url(#sn)"/>`)
  b.push(phased(disc(x, R, 960, 640, 120, (px, py, t) => [lerp('#ffcf7a', '#ff8a3c', t), '#8a3c10'], '.:'), 2))
  b.push(ridge(x, R, { base: 38, h: c => 5 + 3 * Math.sin(c / 13) + Math.sin(c / 4), fill: ['#3a1c14', '#1a0c08'], edge: ['#5a2c1c', '#8a4a2a'], glyphs: '^.', seed: 3 }))
  const bark = []
  const leaves = []

  for (const [c, len, seed] of [[12, 190, 1], [106, 180, 2]]) {
    const r2 = rng(seed * 17)
    branch(x, r2, c, 45, 0, len, 5, bark, leaves)
  }

  b.push(...bark)
  const cols = ['#e8742a', '#c9361c', '#f0a030', '#a8281c', '#d9561c']
  const cluster = []

  for (const [c, r] of leaves) {
    for (let k = 0; k < 3; k++) {
      cluster.push(put(tile(x, pick(R, cols), '#3a0c04', pick(R, ['v', '<', '>', '*'])), c + Math.floor((R() - 0.5) * 4), r + Math.floor((R() - 0.5) * 3)))
    }
  }

  b.push(phased(cluster, 5))
  b.push(...particles(x, R, { n: 60, c: [0, 120], r: [-2, 12], dx: r => 6 + Math.floor(r() * 14), dy: 44, dur: [8, 18], glyphs: 'v<>*', inks: cols }))
  const pile = []

  for (let c = 0; c < 120; c++) {
    pile.push(put(tile(x, pick(R, cols), '#3a0c04', pick(R, ['v', '<', '.'])), c, 45 + (R() < 0.35 ? -1 : 0)), put(tile(x, '#6a2a14', '#a8481c', '.'), c, 46))
  }

  b.push(phased(pile, 7), ...signature(x, name, '#a8581c', '#f0a030', 36, 47))

  return shell(x, { sky: [[0, '#1e0e12'], [0.6, '#4a2018'], [1, '#6a3220']], veil: '#1a0a08', veilA: 0.38, grid: '#f0a030', gridA: 0.025, defs: glow, body: b.join('') })
}

export const CHILL = { snowCabin, lighthouse, campfire, lofi, lavaLamp, nightTrain, cherry, autumn }
