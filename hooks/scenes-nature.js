// Nature scenes: weather, water, mountains and growing things.
import { CW, CH, rng, pick, ctx, tile, put, phased, sprite, word, mover, trace, shell, signature, lerp, stars, line, disc, particles, ridge, skyline, texture, pine, wavy } from './engine.js'

const wave = (x, buckets, secs) => x.anim.push(`.aw{animation:sh ${secs}s ease-in-out infinite}`)

// ---------------------------------------------------------------- Misty peaks (light)
function mist(name) {
  const x = ctx()
  const R = rng(301)
  const b = []
  b.push(phased(disc(x, R, 1240, 300, 110, (px, py, t) => [lerp('#fff6c8', '#ffd890', t), '#c8984a'], '.'), 2))
  const layers = [
    { base: 22, a: 7, f: 21, p: 0.4, fill: ['#d3e0f0', '#c4d4ea'], edge: ['#e3ecf6', '#a8bcdc'] },
    { base: 27, a: 8, f: 15, p: 1.6, fill: ['#b8cde6', '#a8c0de'], edge: ['#cadaee', '#8aa4cc'] },
    { base: 32, a: 9, f: 18, p: 3.1, fill: ['#8fabd2', '#7e9cc8'], edge: ['#a8bede', '#6a8ab8'] },
    { base: 38, a: 8, f: 12, p: 4.4, fill: ['#6a8ab8', '#5a7aac'], edge: ['#88a2c8', '#4a6a9c'] },
    { base: 44, a: 6, f: 9, p: 5.5, fill: ['#4a6a9c', '#3a5a8c'], edge: ['#6a86b4', '#2a4a7c'] },
  ]

  layers.forEach((L, i) => {
    b.push(ridge(x, R, { base: L.base, h: c => L.a * (0.55 + 0.45 * Math.sin(c / L.f + L.p)) + 2 * Math.sin(c / 4 + L.p), fill: L.fill, edge: L.edge, glyphs: '^:.', seed: i }))

    // a band of mist drifting along in front of each ridge
    const band = ['  ~~~~~~~~  ', '~~~~~~~~~~~~', '  ~~~~~~    ']
    const r = L.base - 1
    b.push(mover(x, [[-14, r], [122, r]], 150 + i * 30, -i * 40, sprite(x, band, { '~': { fill: '#ffffff', ink: '#dfe8f4', g: '~.' } }, -14, r, i).join('')))
  })

  for (let i = 0; i < 5; i++) {
    const c = Math.floor(R() * 100)
    const r = 3 + Math.floor(R() * 10)
    b.push(mover(x, [[c, r], [c + 26, r - 1]], 30 + R() * 20, -R() * 40, put(tile(x, null, '#4a5a78', 'v'), c, r)))
  }

  b.push(...signature(x, name, '#4a6a94', '#d1493f'))

  return shell(x, { sky: [[0, '#fbe6d4'], [0.5, '#dce9f6'], [1, '#c3d6ee']], veil: '#edf3fa', veilA: 0.4, grid: '#5a78a8', gridA: 0.035, body: b.join('') })
}

// ---------------------------------------------------------------- Dunes (light)
function dunes(name) {
  const x = ctx()
  const R = rng(311)
  const b = []
  b.push(phased(disc(x, R, 1500, 260, 150, (px, py, t) => [lerp('#fff4cc', '#ffd98a', t * t), '#b88a30'], '.:'), 2))
  const dunesL = [
    { base: 26, a: 6, f: 22, p: 0.3, fill: ['#f2cf94', '#e8c084'], edge: ['#f8dca8', '#c8985a'] },
    { base: 33, a: 7, f: 17, p: 1.9, fill: ['#e8b672', '#dca860'], edge: ['#f0c888', '#b8803c'] },
    { base: 40, a: 7, f: 14, p: 3.3, fill: ['#d99a52', '#c8883c'], edge: ['#e8b070', '#a8702c'] },
    { base: 46, a: 5, f: 10, p: 4.8, fill: ['#bf7a38', '#a8662c'], edge: ['#d8964c', '#8a5020'] },
  ]
  dunesL.forEach((L, i) => b.push(ridge(x, R, { base: L.base, h: c => L.a * (0.5 + 0.5 * Math.sin(c / L.f + L.p)) * (1 + 0.3 * Math.sin(c / 5 + i)), fill: L.fill, edge: L.edge, glyphs: '~.-', seed: i })))

  // a caravan on the second dune
  const camel = ['  ##   ', ' #### #', '#######', ' # # # ']
  const pal = { '#': { fill: '#5a3a1a', ink: '#8a5a2a', g: '=' } }

  for (let i = 0; i < 4; i++) {
    b.push(mover(x, [[-10 - i * 9, 30], [122, 30]], 170, 0, sprite(x, camel, pal, -10 - i * 9, 30, i).join(''), 'loop'))
  }

  // blown sand and heat
  b.push(...particles(x, R, { n: 50, c: [0, 100], r: [26, 46], dx: 22, dy: -1, dur: [3, 7], glyphs: '.,:', inks: ['#f8dca8', '#e8c084'] }))
  b.push(...signature(x, name, '#8a5a2a', '#d1493f'))

  return shell(x, { sky: [[0, '#f8dcbc'], [0.5, '#fbe8c8'], [1, '#f2d4a0']], veil: '#f8ecd6', veilA: 0.4, grid: '#b8803c', gridA: 0.04, body: b.join('') })
}

// ---------------------------------------------------------------- Canyon
function canyon(name) {
  const x = ctx()
  const R = rng(321)
  const b = []
  const glow = '<radialGradient id="cg" cx=".5" cy=".5" r=".6"><stop offset="0" stop-color="#ff9a4c" stop-opacity=".3"/><stop offset="1" stop-color="#ff9a4c" stop-opacity="0"/></radialGradient>'
  b.push(`<rect class="gl" width="1920" height="1080" fill="url(#cg)"/>`)
  b.push(phased(disc(x, R, 960, 480, 100, (px, py, t) => [lerp('#ffd29a', '#ff8a4c', t), '#8a3c10'], '.:'), 2))
  const walls = [
    { base: 30, fill: ['#8a3a22', '#5a2414'], edge: ['#b05a38', '#d07a4c'], h: c => 9 + 5 * Math.sin(c / 9) + 3 * Math.sin(c / 3.2) },
    { base: 38, fill: ['#6a2a1a', '#3a160c'], edge: ['#8a3a22', '#a8502c'], h: c => 8 + 5 * Math.sin(c / 12 + 2) + 2 * Math.sin(c / 3.7) },
  ]
  walls.forEach((L, i) => {
    b.push(ridge(x, R, { base: L.base, h: L.h, fill: L.fill, edge: L.edge, glyphs: '#=:', seed: i }))
    b.push(`<path d="M0 ${L.base * CH} H1920 V1080 H0Z" fill="${texture(x, 'cn' + i, ['=', '-', '=', '.', '-', '=', '.', '-'], '#ffb27a', 0.1)}"/>`)
  })

  // the river at the bottom, glittering
  x.defs.push('<linearGradient id="rv" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3a7a8a"/><stop offset="1" stop-color="#1a3a4a"/></linearGradient>')
  b.push(`<rect y="${43 * CH}" width="1920" height="${1080 - 43 * CH}" fill="url(#rv)"/>`)
  const buckets = Array.from({ length: 12 }, () => [])

  for (let r = 44; r < 48; r += 1) {
    for (let c = r % 2; c < 120; c += 3) {
      buckets[Math.floor(c / 10)].push(put(tile(x, null, '#a8e0e8', '~'), c, r))
    }
  }

  wave(x, buckets, 4.6)
  b.push(wavy(x, buckets, 0.4))

  for (let i = 0; i < 3; i++) {
    const c = 20 + Math.floor(R() * 80)
    b.push(mover(x, [[c, 10 + i * 3], [c + 22, 8 + i * 3]], 18 + i * 6, -i * 7, put(tile(x, null, '#2a1410', 'v'), c, 10 + i * 3)))
  }

  b.push(...particles(x, R, { n: 22, c: [0, 120], r: [20, 44], dx: 14, dy: -3, dur: [6, 12], glyphs: '.,', inks: ['#ffb27a', '#d08a5a'] }), ...signature(x, name, '#a85a38', '#ffb27a'))

  return shell(x, { sky: [[0, '#3a1428'], [0.5, '#a8482c'], [1, '#e8884c']], veil: '#2a0e10', veilA: 0.38, grid: '#ffb27a', gridA: 0.025, defs: glow, body: b.join('') })
}

// ---------------------------------------------------------------- Ocean sunset
function oceanSunset(name) {
  const x = ctx()
  const R = rng(331)
  const b = []
  const HZ = 28
  b.push(phased(disc(x, R, 1500, HZ * CH, 170, (px, py, t) => (py <= HZ * CH ? [lerp('#ffe08a', '#ff5a78', t * t), '#a8280a'] : null), '.:'), 2))
  x.defs.push('<linearGradient id="sea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d8587a"/><stop offset=".4" stop-color="#6a2a6a"/><stop offset="1" stop-color="#1a1038"/></linearGradient>')
  b.push(`<rect y="${HZ * CH}" width="1920" height="${1080 - HZ * CH}" fill="url(#sea)"/>`)

  // glitter path, and waves that roll
  const glitter = []

  for (let r = HZ + 1; r < 47; r++) {
    for (let k = 0; k < 4; k++) {
      glitter.push(put(tile(x, null, '#ffe08a', pick(R, ['=', '-', '~'])), 93 + Math.round((R() - 0.5) * (4 + (r - HZ) * 0.8)), r))
    }
  }

  b.push(phased(glitter, 4))
  const buckets = Array.from({ length: 12 }, () => [])

  for (let r = HZ + 2; r < 47; r += 2) {
    for (let c = (r % 4) / 2; c < 120; c += 3) {
      buckets[Math.floor(c / 10)].push(put(tile(x, null, lerp('#ff9ab0', '#3a2a6a', (r - HZ) / 19), '~'), c, r))
    }
  }

  wave(x, buckets, 5.2)
  b.push(wavy(x, buckets, 0.5))

  const sail = ['   #   ', '  ##   ', ' ###   ', '#######', ' ##### ']
  b.push(mover(x, [[-10, HZ - 4], [122, HZ - 4]], 200, -60, sprite(x, sail, { '#': { fill: '#1a0a2a', ink: '#3a2a5a', g: '=' } }, -10, HZ - 4, 3).join(''), 'loop'))

  for (const r of [6, 11, 16]) {
    b.push(mover(x, [[-14, r], [122, r + 2]], 170 + r * 5, -r * 7, sprite(x, ['~~~~~~~~~', '  ~~~~~  '], { '~': { fill: '#ff9ab0', ink: '#a83a5a', g: '~-' } }, -14, r, r).join('')))
  }

  for (let i = 0; i < 6; i++) {
    const c = Math.floor(R() * 100)
    const r = 8 + Math.floor(R() * 10)
    b.push(mover(x, [[c, r], [c + 22, r - 2]], 22 + R() * 12, -R() * 20, put(tile(x, null, '#2a1030', 'v'), c, r)))
  }

  b.push(...signature(x, name, '#b8607c', '#ffe08a'))

  return shell(x, { sky: [[0, '#2a1450'], [0.5, '#b8487c'], [1, '#ffa070']], veil: '#1e0e34', veilA: 0.36, grid: '#ffb0a0', gridA: 0.03, body: b.join('') })
}

// ---------------------------------------------------------------- Waterfall
function waterfall(name) {
  const x = ctx()
  const R = rng(341)
  const b = []
  // cliff walls with a notch where the water comes down
  const cliff = c => (c > 80 && c < 106 ? 6 : 20 + 3 * Math.sin(c / 4))
  b.push(ridge(x, R, { base: 22, bottom: 49, h: () => 0, fill: ['#1c3a2e', '#0a1a14'], seed: 1 }))
  b.push(`<path d="M0 ${12 * CH} H${80 * CW} V${44 * CH} H0Z M${106 * CW} ${12 * CH} H1920 V${44 * CH} H${106 * CW}Z" fill="#102a20"/>`)
  b.push(`<path d="M0 ${12 * CH} H${80 * CW} V${44 * CH} H0Z M${106 * CW} ${12 * CH} H1920 V${44 * CH} H${106 * CW}Z" fill="${texture(x, 'wf', ['#', ':', '.', '#', '.', ':', '#', '.'], '#3a6a54', 0.25)}"/>`)
  void cliff

  // the falls: bright streaks dropping, mist at the foot
  const water = ['#ffffff', '#cfeeff', '#9ed8f0']

  for (let c = 81; c < 106; c++) {
    for (let k = 0; k < 2; k++) {
      const col = tile(x, pick(R, ['#2f8ab0', '#4aa8d0', '#7ac8e8']), pick(R, water), pick(R, ['|', '!', ':', 'l']))
      const h = 4 + Math.floor(R() * 4)
      const dur = 1.1 + R() * 1.4
      let inner = ''

      for (let j = 0; j < h; j++) {
        inner += put(col, c, 12 + j)
      }

      b.push(mover(x, [[c, 12], [c, 12 + 30]], dur, -R() * dur, inner, 'fade'))
    }
  }

  b.push(...particles(x, R, { n: 40, c: [78, 108], r: [38, 45], dx: r => Math.floor((r() - 0.5) * 10), dy: -8, dur: [3, 7], glyphs: 'o~.', inks: ['#ffffff', '#dff4ff'] }))

  // the pool
  x.defs.push('<linearGradient id="pl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a8aa8"/><stop offset="1" stop-color="#0a3a4a"/></linearGradient>')
  b.push(`<rect y="${43 * CH}" width="1920" height="${1080 - 43 * CH}" fill="url(#pl)"/>`)
  const buckets = Array.from({ length: 12 }, () => [])

  for (let r = 44; r < 48; r++) {
    for (let c = r % 2; c < 120; c += 3) {
      buckets[Math.floor(c / 10)].push(put(tile(x, null, '#bfeaf6', '~'), c, r))
    }
  }

  wave(x, buckets, 4)
  b.push(wavy(x, buckets, 0.35))

  // a rainbow in the spray, ferns and pines at the sides
  const rainbow = ['#ff5a5a', '#ffa05a', '#ffe05a', '#5aff9a', '#5ac8ff', '#9a7aff']
  const arc = []

  rainbow.forEach((col, i) => {
    for (let a = 0; a <= 40; a++) {
      const t = Math.PI * (a / 40)
      arc.push(put(tile(x, col, '#fff', '.'), Math.round(93 - Math.cos(t) * (20 - i * 0.8)), Math.round(42 - Math.sin(t) * (12 - i * 0.5))))
    }
  })

  b.push(phased(arc, 4))

  for (const [c, h] of [[5, 12], [12, 9], [20, 7], [30, 6], [112, 10], [117, 8]]) {
    b.push(phased(pine(x, R, c, 44, h, ['#145a34', '#1a7a44', '#0e4a2a'], null), c))
  }

  b.push(...signature(x, name, '#3a8a6a', '#7ac8e8', 36, 45))

  return shell(x, { sky: [[0, '#0a2a2e'], [1, '#10404a']], veil: '#06161a', veilA: 0.4, grid: '#7ac8e8', gridA: 0.025, body: b.join('') })
}

// ---------------------------------------------------------------- Deep sea
function deepSea(name) {
  const x = ctx()
  const R = rng(351)
  const b = []
  x.defs.push('<linearGradient id="rays" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7ad8ff" stop-opacity=".25"/><stop offset="1" stop-color="#7ad8ff" stop-opacity="0"/></linearGradient>')
  x.kf.push('@keyframes ry{0%,100%{opacity:.25}50%{opacity:1}}')
  x.anim.push('.ry1{animation:ry 9s ease-in-out infinite}.ry2{animation:ry 9s ease-in-out -3s infinite}.ry3{animation:ry 9s ease-in-out -6s infinite}')

  for (const [x0, w, cls] of [[260, 140, 'ry1'], [560, 110, 'ry2'], [1380, 150, 'ry3'], [1700, 90, 'ry1']]) {
    b.push(`<path class="${cls}" d="M${x0} 0 L${x0 + w} 0 L${x0 + w * 2.2} 800 L${x0 - w * 0.8} 800Z" fill="url(#rays)"/>`)
  }

  // the seabed and kelp
  b.push(ridge(x, R, { base: 45, h: c => 2 + 1.5 * Math.sin(c / 6) + Math.sin(c / 2.3), fill: ['#0a2a3a', '#040f16'], edge: ['#0f3a4c', '#1c5a70'], glyphs: '.:', seed: 2 }))

  for (const c of [6, 11, 16, 100, 106, 112]) {
    const stalk = []

    for (let r = 44; r > 44 - (8 + Math.floor(R() * 8)); r--) {
      stalk.push(put(tile(x, '#14683a', '#4ae08a', pick(R, ['(', ')', '|'])), c + ((r + c) % 3 === 0 ? 1 : 0), r))
    }

    b.push(mover(x, [[0, 0], [1, 0], [0, 0]], 5 + R() * 3, -R() * 5, stalk.join(''), 'loop'))
  }

  // an angler with a lamp on a stalk
  const fish = ['      ##       ', '     ####      ', '  #########    ', ' ###########  #', '#####o#####  # ', ' #### ##### #  ', '  ###########   ']
  const lure = '<g class="gl">' + sprite(x, ['@'], { '@': { fill: '#fff6a0', ink: '#b88a10', g: '*' } }, 3, 28, 1).join('') + '</g>'
  b.push(mover(x, [[-20, 30], [122, 28]], 90, -30, sprite(x, fish, { '#': { fill: '#1a2a4a', ink: '#3a5a8a', g: '^:' }, o: { fill: '#ffeb80', ink: '#a07a10', g: 'o' } }, -20, 30, 3).join('') + lure.replace(/x="(\d+)"/, (_, v) => `x="${+v - 20 * CW}"`), 'loop'))

  // schools of small fish and bubbles
  for (let i = 0; i < 4; i++) {
    const r = 10 + Math.floor(R() * 24)
    const school = []

    for (let k = 0; k < 7; k++) {
      school.push(put(tile(x, null, pick(R, ['#7ad8ff', '#4aa8d0']), '>'), -8 + (k % 4) * 2 + (k > 3 ? 1 : 0), r + (k % 3)))
    }

    b.push(mover(x, [[-8, r], [124, r - 3]], 40 + i * 14, -i * 16, school.join(''), 'loop'))
  }

  b.push(...particles(x, R, { n: 60, c: [0, 120], r: [30, 46], dx: r => Math.floor((r() - 0.5) * 4), dy: -34, dur: [6, 14], glyphs: 'o.O', inks: ['#7ad8ff', '#cfeeff'] }), ...signature(x, name, '#2a6a8a', '#7ad8ff', 36, 46))

  return shell(x, { sky: [[0, '#0a4a6a'], [0.5, '#06304a'], [1, '#020a14']], veil: '#020a14', veilA: 0.4, grid: '#7ad8ff', gridA: 0.02, body: b.join('') })
}

// ---------------------------------------------------------------- Bamboo grove
function bamboo(name) {
  const x = ctx()
  const R = rng(361)
  const b = []
  b.push(phased(disc(x, R, 960, 260, 90, (px, py, t) => [lerp('#f4f0d8', '#c8c8a0', t * t), '#8a8a60'], '.:'), 2))
  const greens = ['#2f7a3a', '#3a8a46', '#286a32']
  const sway = []

  for (const c of [3, 7, 10, 15, 20, 25, 95, 100, 104, 109, 113, 117]) {
    const top = 1 + Math.floor(R() * 6)
    const stalk = []

    for (let r = top; r <= 44; r++) {
      const node = (r - top) % 5 === 0
      stalk.push(put(tile(x, node ? '#1a4a24' : pick(R, greens), node ? '#7ad88a' : '#0c2a12', node ? '=' : pick(R, ['|', '!', ':'])), c, r))
    }

    sway.push(`<g>${stalk.join('')}</g>`)

    // leaves at the nodes, swaying
    const leaves = []

    for (let r = top + 3; r < 40; r += 5) {
      const dir = R() < 0.5 ? -1 : 1

      for (let k = 1; k <= 3; k++) {
        leaves.push(put(tile(x, pick(R, ['#4aa84a', '#5ac05a']), '#0c2a12', dir < 0 ? '/' : '\\'), c + dir * k, r - Math.floor(k / 2)))
      }
    }

    b.push(mover(x, [[0, 0], [1, 0], [0, 0]], 4 + R() * 3, -R() * 6, leaves.join(''), 'loop'))
  }

  b.push(sway.join(''))
  b.push(...trace(x, [[0, 45], [119, 45]], '#1a3a1a', '#3a6a3a', '"', '"'), ...trace(x, [[0, 46], [119, 46]], '#10281a', '#2a4a2a', ',', ','))
  b.push(...particles(x, R, { n: 22, c: [0, 120], r: [10, 44], dx: 6, dy: -10, dur: [10, 20], glyphs: '.,', inks: ['#cfe8a0', '#e8f0b8'] }), ...signature(x, name, '#3a7a4a', '#cfe8a0', 36, 47))

  return shell(x, { sky: [[0, '#0e2a24'], [1, '#143a2a']], veil: '#08180f', veilA: 0.4, grid: '#7ad88a', gridA: 0.025, body: b.join('') })
}

// ---------------------------------------------------------------- Thunderstorm
function thunder(name) {
  const x = ctx()
  const R = rng(371)
  const b = []
  x.kf.push('@keyframes fl{0%,2%{opacity:0}3%{opacity:1}5%{opacity:.15}7%{opacity:1}11%,100%{opacity:0}}')
  x.anim.push('.fz{animation:fl 11s linear infinite}')

  // the cloud deck, dark and heaving
  const cloud = []

  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 120; c++) {
      if (R() < 0.8 - r * 0.07) {
        cloud.push(put(tile(x, lerp('#46506e', '#262e48', R()), '#8a98c0', pick(R, ['~', '.', ':'])), c, r))
      }
    }
  }

  b.push(phased(cloud, 3))

  // three bolts, each flashing on its own beat
  const bolt = (c0, delay) => {
    const tiles = []
    let c = c0

    for (let r = 8; r < 36; r += 1) {
      c += Math.round((R() - 0.5) * 3)
      tiles.push(put(tile(x, '#fffbd0', '#8a8a30', '|'), c, r), put(tile(x, '#fffbd0', '#8a8a30', '/'), c + 1, r))
    }

    return `<g class="fz" style="animation-delay:${delay}s">${tiles.join('')}</g>`
  }

  b.push(bolt(14, -2), bolt(104, -6), bolt(30, -9))
  b.push(`<rect class="fz" style="animation-delay:-2s" width="1920" height="1080" fill="#cfd8ff" fill-opacity=".1"/>`)
  b.push(skyline(x, R, { from: 0, to: 120, base: 46, w: [3, 7], h: [4, 12], fill: '#0a0d18', lit: 0.12, windows: ['#ffd070', '#9ab0d8'], seed: 3 }))
  b.push(...particles(x, R, { n: 140, c: [0, 120], r: [-3, 6], dx: -4, dy: 48, dur: [0.9, 1.7], glyphs: '|/', inks: ['#9ab0d8', '#6a82ac'] }), ...signature(x, name, '#4a5a82', '#fffbd0', 4, 47))

  return shell(x, { sky: [[0, '#0a0d1c'], [1, '#1c2640']], veil: '#06080f', veilA: 0.4, grid: '#8aa0ff', gridA: 0.02, body: b.join('') })
}

export const NATURE = { mist, dunes, canyon, oceanSunset, waterfall, deepSea, bamboo, thunder }
