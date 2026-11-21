// Art scenes: graphic styles. Halftone, dither, riso, flow, isometric blocks and moire, plus four seasons
// and four minimal scenes for people who want almost nothing behind the chat.
import { CW, CH, rng, pick, ctx, tile, put, phased, sprite, mover, trace, clip, shell, signature, lerp, line, disc, particles, ridge, pine, follow, stars, wavy } from './engine.js'

// ---------------------------------------------------------------- Halftone
function halftone(name) {
  const x = ctx()
  const R = rng(601)
  const b = []
  const BG = '#13101a'
  // a sun made of dots whose size follows the light, over banded waves
  const sun = []

  for (let r = 4; r < 26; r++) {
    for (let c = 76; c < 108; c++) {
      const d = Math.hypot((c - 92) * CW, (r - 15) * CH)

      if (d < 260) {
        const t = d / 260
        sun.push(put(tile(x, null, lerp('#ffd08a', '#ff6a7a', t), t < 0.4 ? '@' : t < 0.7 ? 'o' : '.'), c, r))
      }
    }
  }

  b.push(phased(sun, 2))

  for (let band = 0; band < 7; band++) {
    const r0 = 28 + band * 3
    const row = []

    for (let c = 0; c < 120; c++) {
      const h = r0 + Math.round(1.6 * Math.sin(c / (5 + band) + band))
      const ink = lerp('#ff8a9a', '#a04ac0', band / 6)
      row.push(put(tile(x, lerp(BG, ink, 0.3), ink, band < 3 ? 'o' : band < 5 ? '.' : ':'), c, h), put(tile(x, lerp(BG, ink, 0.1), ink, '.'), c, h + 1))
    }

    b.push(`<g class="aw" style="animation-delay:${(-band * 0.9).toFixed(1)}s">${row.join('')}</g>`)
  }

  x.anim.push('.aw{animation:sh 6s ease-in-out infinite}')
  b.push(...signature(x, name, '#8a5a8a', '#ff8a7a'))

  return shell(x, { bg: [BG, '#0a0810'], veil: BG, veilA: 0.3, grid: '#ff7a8a', gridA: 0.02, body: b.join('') })
}

// ---------------------------------------------------------------- Dither Waves
function dither(name) {
  const x = ctx()
  const BG = '#0b1220'
  const b = []
  const bayer = [[0, 8, 2, 10], [12, 4, 14, 6], [3, 11, 1, 9], [15, 7, 13, 5]]
  const layers = [[], [], [], []]

  // a gradient turned into a dither pattern; four phases travel across it
  for (let r = 4; r < 46; r++) {
    for (let c = 0; c < 120; c++) {
      const v = (Math.sin(c / 9 + r / 7) + Math.sin(c / 17 - r / 5) + 2) / 4
      const th = bayer[r % 4][c % 4] / 16

      if (v > th && v > 0.3) {
        layers[(c + r) % 4].push(put(tile(x, null, lerp('#1a3a6a', '#7ad8ff', v), v > 0.7 ? '#' : v > 0.5 ? '+' : '.'), c, r))
      }
    }
  }

  layers.forEach((arr, i) => b.push(`<g class="aw" style="animation-delay:${(-i * 0.7).toFixed(1)}s">${arr.join('')}</g>`))
  x.anim.push('.aw{animation:sh 3.2s ease-in-out infinite}')
  b.push(...signature(x, name, '#3a6a9a', '#7ad8ff'))

  return shell(x, { bg: [BG, '#050a14'], veil: BG, veilA: 0.4, grid: '#7ad8ff', gridA: 0.015, fontSize: 15, weight: 700, body: b.join('') })
}

// ---------------------------------------------------------------- Riso Hills
function riso(name) {
  const x = ctx()
  const R = rng(611)
  const b = []
  const PAPER = '#f3ecdc'
  const PINK = '#ff5a8a'
  const BLUE = '#2f6ad8'
  // two inks overprinted, slightly off register
  const hill = (base, amp, ph, col, dx) => {
    const t = []

    for (let c = 0; c < 120; c++) {
      const top = Math.round(base - amp * (1 + Math.sin(c / 11 + ph)) / 2)

      for (let r = top; r < 49; r++) {
        if ((c + r + dx) % 3 === 0) {
          t.push(put(tile(x, null, col, r === top ? '^' : r < top + 3 ? ':' : '.'), c + dx, r))
        }
      }
    }

    return t
  }

  b.push(phased(disc(x, R, 1500, 220, 96, (px, py, t) => [null, PINK], '*o.'), 2))
  b.push(phased(hill(30, 8, 0, BLUE, 0), 3), phased(hill(32, 9, 1.4, PINK, 1), 4), phased(hill(38, 8, 3, BLUE, 1), 5))
  b.push(...signature(x, name, '#6a5a6a', BLUE))

  return shell(x, { bg: [PAPER, '#ece2cc'], veil: PAPER, veilA: 0.2, grid: '#8a7a8a', gridA: 0.04, fontSize: 15, weight: 700, body: b.join('') })
}

// ---------------------------------------------------------------- Flow Field
function flow(name) {
  const x = ctx()
  const R = rng(621)
  const b = []
  const BG = '#0d0a18'
  const inks = ['#ff6ac0', '#ffb36a', '#6ad8ff', '#a08aff']

  // particles that ride curved streamlines
  for (let i = 0; i < 90; i++) {
    const c0 = Math.floor(R() * 120)
    const r0 = Math.floor(R() * 46)
    const pts = [[c0, r0]]
    let a = Math.sin(c0 / 14) * 2 + Math.cos(r0 / 8)

    for (let k = 0; k < 14; k++) {
      const [pc, pr] = pts[k]
      a = Math.sin(pc / 14) * 2 + Math.cos(pr / 8)
      pts.push([Math.max(0, Math.min(119, Math.round(pc + Math.cos(a) * 3))), Math.max(0, Math.min(48, Math.round(pr + Math.sin(a) * 2)))])
    }

    const trail = pts.slice(0, 9).map(([pc, pr], k) => put(tile(x, null, lerp(BG, inks[i % 4], 0.25 + k * 0.09), k === 8 ? '#' : k > 5 ? '+' : '.'), pc, pr)).join('')
    b.push(mover(x, pts.slice(8), 8 + R() * 8, -R() * 14, put(tile(x, inks[i % 4], BG, 'o'), pts[8][0], pts[8][1]), 'fade'))
    b.push(`<g opacity=".55">${trail}</g>`)
  }

  b.push(...signature(x, name, '#5a4a8a', '#ff6ac0'))

  return shell(x, { bg: [BG, '#06040e'], veil: BG, veilA: 0.3, grid: '#a08aff', gridA: 0.02, fontSize: 15, weight: 700, body: b.join('') })
}

// ---------------------------------------------------------------- Sine Stack
function sineStack(name) {
  const x = ctx()
  const BG = '#0b0b14'
  const b = []
  const inks = ['#ff6ac0', '#ff9a6a', '#ffd26a', '#6affc0', '#6ad8ff', '#a08aff', '#ff6ac0']

  inks.forEach((ink, i) => {
    const row = []

    for (let c = 0; c < 120; c++) {
      const r = 7 + i * 6 + Math.round(2.6 * Math.sin(c / (6 + i) + i))
      row.push(put(tile(x, lerp(BG, ink, 0.22), ink, '~'), c, r))
    }

    b.push(mover(x, [[0, 0], [14, 0]], 18 + i * 4, -i * 3, row.map((u) => u).join('') + row.map((u) => u.replace(/x="(-?\d+)"/, (_, v) => `x="${+v - 14 * CW}"`)).join(''), 'loop'))
  })

  b.push(...signature(x, name, '#5a4a8a', '#ff6ac0'))

  return shell(x, { bg: [BG, '#05050a'], veil: BG, veilA: 0.25, grid: '#a08aff', gridA: 0.015, fontSize: 16, weight: 700, body: b.join('') })
}

// ---------------------------------------------------------------- Radar
function radar(name) {
  const x = ctx()
  const R = rng(641)
  const BG = '#06120c'
  const G = '#3dff8a'
  const b = []
  const cx = 60
  const cy = 24

  // range rings and spokes
  for (const rad of [8, 16, 24, 32]) {
    for (let a = 0; a < 360; a += 5) {
      b.push(put(tile(x, null, '#2a9a56', '.'), Math.round(cx + Math.cos((a * Math.PI) / 180) * rad * 1.9), Math.round(cy + Math.sin((a * Math.PI) / 180) * rad * 0.8)))
    }
  }

  for (let a = 0; a < 360; a += 45) {
    for (let k = 1; k < 34; k++) {
      b.push(put(tile(x, null, '#1c6a3a', '.'), Math.round(cx + Math.cos((a * Math.PI) / 180) * k * 1.9), Math.round(cy + Math.sin((a * Math.PI) / 180) * k * 0.8)))
    }
  }

  // blips that flare as the sweep passes
  for (let i = 0; i < 9; i++) {
    const a = R() * Math.PI * 2
    const d = 6 + R() * 26
    const c = Math.round(cx + Math.cos(a) * d * 1.9)
    const r = Math.round(cy + Math.sin(a) * d * 0.8)
    const delay = ((a / (Math.PI * 2)) * 8).toFixed(2)
    b.push(`<g class="hot" style="animation-duration:8s;animation-delay:${delay}s">${put(tile(x, G, BG, '#'), c, r)}${put(tile(x, '#1c8a4a', G, '+'), c + 1, r)}</g>`)
  }

  // the sweep: a line of tiles with a fading wake, rotating about the centre
  const sweep = []

  for (let w = 0; w < 6; w++) {
    const a = (-w * 6 * Math.PI) / 180

    for (let k = 1; k < 34; k++) {
      sweep.push(put(tile(x, null, lerp(BG, G, 1 - w * 0.17), w === 0 ? '#' : '+'), Math.round(cx + Math.cos(a) * k * 1.9), Math.round(cy + Math.sin(a) * k * 0.8)))
    }
  }

  x.kf.push(`@keyframes rot{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`)
  x.anim.push(`.rot{animation:rot 8s linear infinite;transform-origin:${cx * CW + 8}px ${cy * CH + 11}px}`)
  b.push(`<g class="rot">${sweep.join('')}</g>`)
  b.push(...signature(x, name, '#1c8a4a', G))

  return shell(x, { bg: [BG, '#020806'], veil: BG, veilA: 0.2, grid: G, gridA: 0.02, fontSize: 15, weight: 700, body: b.join('') })
}

// ================================================================ seasons
// ---------------------------------------------------------------- Spring Rain
function springRain(name) {
  const x = ctx()
  const R = rng(641)
  const b = []
  b.push(ridge(x, R, { base: 30, h: c => 6 + 3 * Math.sin(c / 13), fill: ['#7aa88a', '#5a8a6a'], edge: ['#9ac4a8', '#4a7a5a'], glyphs: '^.', seed: 3 }))
  b.push(ridge(x, R, { base: 42, h: c => 5 + 2 * Math.sin(c / 9 + 1), fill: ['#4a9a5a', '#2f7a42'], edge: ['#6ac07a', '#2a6a38'], glyphs: '"v', seed: 4 }))

  // tulips in rows
  for (let g = 0; g < 3; g++) {
    const fl = []

    for (let i = 0; i < 30; i++) {
      const c = 3 + Math.floor(R() * 114)
      const r = 38 + Math.floor(R() * 9)
      const col = pick(R, [['#ff5a8a', '#ffc0d4'], ['#ffd23d', '#fff0a0'], ['#ffffff', '#e8e8f4'], ['#b06aff', '#e0c8ff']])
      fl.push(put(tile(x, null, '#2a7a3a', '|'), c, r + 1), put(tile(x, col[0], col[1], 'U'), c, r))
    }

    b.push(mover(x, [[0, 0], [1, 0], [0, 0]], 5 + g, -g * 1.7, fl.join(''), 'loop'))
  }

  b.push(...particles(x, R, { n: 120, c: [0, 120], r: [-2, 8], dx: -4, dy: 48, dur: [1.4, 2.6], glyphs: '|/', inks: ['#8ab0d8', '#c0d8f4'] }))
  // puddle ripples
  b.push(...particles(x, R, { n: 18, c: [4, 116], r: [44, 48], dx: 0, dy: 0, dur: [1.5, 3], glyphs: 'o', inks: ['#a8c8e8'], mode: 'fade' }))
  b.push(...signature(x, name, '#4a8a6a', '#b8f0c8'))

  return shell(x, { sky: [[0, '#8a9aae'], [0.6, '#aebccb'], [1, '#c8d4cc']], veil: '#9aa8b4', veilA: 0.25, grid: '#e8f0f8', gridA: 0.03, body: b.join('') })
}

// ---------------------------------------------------------------- Summer Wheat
function wheat(name) {
  const x = ctx()
  const R = rng(651)
  const b = []
  b.push(phased(disc(x, R, 1500, 150, 80, (px, py, t) => [lerp('#fffbd0', '#ffe070', t), '#d8b030'], '.'), 2))
  b.push(ridge(x, R, { base: 28, h: c => 4 + 2 * Math.sin(c / 12), fill: ['#d8c890', '#c0ac68'], edge: ['#e8dca8', '#a89048'], glyphs: '.,', seed: 3 }))

  // rows of wheat bending in a wave that crosses the field
  const waves = [[], [], [], [], [], []]

  for (let r = 28; r < 48; r++) {
    for (let c = 0; c < 120; c += 2) {
      const k = Math.floor(c / 8) % 6
      waves[k].push(put(tile(x, lerp('#e8c060', '#c89a30', (r - 28) / 20), '#8a6a10', pick(R, ['/', '|', '\\', 'Y'])), c + (r % 2), r))
    }
  }

  waves.forEach((arr, i) => b.push(`<g class="aw" style="animation-delay:${(-i * 0.8).toFixed(1)}s">${arr.join('')}</g>`))
  x.anim.push('.aw{animation:sh 4.8s ease-in-out infinite}')
  b.push(...particles(x, R, { n: 20, c: [0, 120], r: [26, 44], dx: 40, dy: -4, dur: [9, 18], glyphs: '.,', inks: ['#f8e8a0', '#fff6c8'], mode: 'loop' }))
  b.push(...signature(x, name, '#a8802a', '#7a5a10'))

  return shell(x, { sky: [[0, '#6ac4ff'], [0.55, '#bfe8ff'], [1, '#f6efc8']], veil: '#f6efd0', veilA: 0.2, grid: '#c89a30', gridA: 0.04, body: b.join('') })
}

// ---------------------------------------------------------------- Harvest Moon
function harvestMoon(name) {
  const x = ctx()
  const R = rng(661)
  const b = []
  b.push(phased(disc(x, R, 1100, 330, 200, (px, py, t) => [lerp('#ffd28a', '#ff9a3a', t), '#b8601a'], '.o'), 2))
  b.push(...stars(x, R, 60, 24, 120, ['#c8a0e0', '#e8d0ff']))
  b.push(ridge(x, R, { base: 40, h: c => 5 + 2 * Math.sin(c / 14), fill: ['#2a1a30', '#14091a'], edge: ['#3a2440', '#5a3860'], glyphs: '^.', seed: 3 }))

  // pumpkins in the field, each with a little candle glow
  for (let i = 0; i < 12; i++) {
    const c = 6 + i * 10 + Math.floor(R() * 4)
    const r = 42 + Math.floor(R() * 4)
    const p = [put(tile(x, '#e8742a', '#7a3a10', '('), c, r), put(tile(x, '#e8742a', '#7a3a10', ')'), c + 1, r), put(tile(x, '#e8742a', '#7a3a10', 'O'), c + 2, r), put(tile(x, '#e8742a', '#7a3a10', ')'), c + 3, r), put(tile(x, '#4a8a2a', '#2a5a10', '|'), c + 1, r - 1)]
    b.push(phased(p, i), `<g class="gl">${put(tile(x, '#ffe070', '#ffe070', ' '), c + 1, r)}</g>`)
  }

  b.push(...particles(x, R, { n: 22, c: [0, 120], r: [-2, 10], dx: 6, dy: 46, dur: [10, 20], glyphs: '}{', inks: ['#d8742a', '#a8501a', '#e8a03a'] }))
  b.push(...signature(x, name, '#7a4a5a', '#ff9a3a'))

  return shell(x, { sky: [[0, '#1a0f2e'], [0.6, '#3a1a3a'], [1, '#5a2a2a']], veil: '#1a0f2e', veilA: 0.25, grid: '#ff9a3a', gridA: 0.025, body: b.join('') })
}

// ---------------------------------------------------------------- Ice Lake
function iceLake(name) {
  const x = ctx()
  const R = rng(671)
  const b = []
  b.push(...stars(x, R, 90, 22, 120, ['#a0d0ff', '#e0f0ff']))
  b.push(ridge(x, R, { base: 30, h: c => 8 + 4 * Math.sin(c / 15 + 1) + Math.sin(c / 4), fill: ['#3a5a8a', '#22385a'], edge: ['#6a90c0', '#a0c8f0'], glyphs: '^.', seed: 3 }))

  // the frozen lake with cracks, and a long reflection
  for (let r = 30; r < 49; r++) {
    for (let c = 0; c < 120; c++) {
      if ((c + r * 3) % 4 === 0) {
        b.push(put(tile(x, null, lerp('#9ad0f0', '#3a6a9a', (r - 30) / 19), pick(R, ['-', '=', '.'])), c, r))
      }
    }
  }

  b.push(...line([20, 48], [44, 34], tile(x, null, '#e0f4ff', '/')), ...line([44, 34], [58, 38], tile(x, null, '#e0f4ff', '\\')), ...line([80, 48], [96, 36], tile(x, null, '#e0f4ff', '/')))

  // skaters tracing loops
  const loop = (cx, cy, rx, ry) => Array.from({ length: 13 }, (_, i) => [Math.round(cx + Math.cos((i / 12) * Math.PI * 2) * rx), Math.round(cy + Math.sin((i / 12) * Math.PI * 2) * ry)])

  ;[[34, 40, 16, 4, '#ff6a8a'], [88, 42, 14, 3, '#ffd23d']].forEach(([cx, cy, rx, ry, col], i) => {
    const pts = loop(cx, cy, rx, ry)
    b.push(mover(x, pts, 14 + i * 4, -i * 5, [put(tile(x, col, '#fff', '@'), pts[0][0], pts[0][1] - 1), put(tile(x, '#3a4a6a', '#fff', '|'), pts[0][0], pts[0][1])].join(''), 'loop'))
  })

  b.push(...particles(x, R, { n: 50, c: [0, 120], r: [-2, 10], dx: r => 2 + Math.floor(r() * 5), dy: 44, dur: [10, 22], glyphs: '*.', inks: ['#c0d8f4', '#e8f4ff'] }))
  b.push(...signature(x, name, '#5a80b0', '#a0d8ff'))

  return shell(x, { sky: [[0, '#0a1838'], [0.55, '#1a3a68'], [1, '#2a5a8a']], veil: '#0a1838', veilA: 0.25, grid: '#a0d0ff', gridA: 0.025, body: b.join('') })
}

// ================================================================ minimal
// ---------------------------------------------------------------- Horizon
function horizon(name) {
  const x = ctx()
  const R = rng(681)
  const b = []
  b.push(...trace(x, [[0, 33], [119, 33]], null, '#2a3a5a', '-', '|'))
  b.push(phased(disc(x, R, 960, 520, 60, (px, py, t) => (py > 33 * CH ? null : [lerp('#ffb87a', '#ff6a6a', t), '#ffe0c0']), '.'), 2))

  for (let c = 0; c < 120; c += 3) {
    b.push(put(tile(x, null, '#1a2a4a', '.'), c, 34 + (c % 6 === 0 ? 1 : 0)))
  }

  b.push(`<rect class="gl" y="${33 * CH}" width="1920" height="${CH * 3}" fill="#ff8a5a" fill-opacity=".05"/>`)
  b.push(...signature(x, name, '#3a4a6a', '#ffb87a'))

  return shell(x, { sky: [[0, '#04060e'], [0.68, '#0a1428'], [1, '#02030a']], veil: '#04060e', veilA: 0.2, grid: '#ffb87a', gridA: 0.012, body: b.join('') })
}

// ---------------------------------------------------------------- Dot Grid
function dotgrid(name) {
  const x = ctx()
  const b = []
  const BG = '#0b0d12'
  const ph = [[], [], [], []]

  for (let r = 2; r < 47; r += 2) {
    for (let c = 2; c < 118; c += 3) {
      const k = Math.floor((Math.hypot(c - 60, (r - 24) * 2) / 12)) % 4
      ph[k].push(put(tile(x, null, '#aab4d8', '.'), c, r))
    }
  }

  ph.forEach((arr, i) => b.push(`<g class="aw" style="animation-delay:${(-i * 0.9).toFixed(1)}s">${arr.join('')}</g>`))
  x.anim.push('.aw{animation:sh 3.6s ease-in-out infinite}')
  b.push(...signature(x, name, '#4a5270', '#a8b4d8'))

  return shell(x, { bg: [BG, '#05060a'], veil: BG, veilA: 0.1, grid: '#8a94b8', gridA: 0.008, fontSize: 18, weight: 700, body: b.join('') })
}

// ---------------------------------------------------------------- Static
function grain(name) {
  const x = ctx()
  const R = rng(691)
  const b = []
  const BG = '#0e0e10'
  const ph = [[], [], []]

  for (let i = 0; i < 760; i++) {
    ph[i % 3].push(put(tile(x, null, pick(R, ['#4a4a56', '#5a5a68', '#6a6a7a']), pick(R, ['.', ':', '\'', ','])), Math.floor(R() * 120), Math.floor(R() * 49)))
  }

  ph.forEach((arr, i) => b.push(`<g class="s${i}">${arr.join('')}</g>`))
  b.push(...signature(x, name, '#3a3a46', '#8a8a98'))

  return shell(x, { bg: [BG, '#08080a'], veil: BG, veilA: 0.1, grid: '#8a8a98', gridA: 0.006, fontSize: 16, weight: 700, body: b.join('') })
}

// ---------------------------------------------------------------- Slow Lines
function lines(name) {
  const x = ctx()
  const b = []
  const BG = '#0a0c10'
  const inks = ['#4a6a9a', '#5a7acc', '#6a8aee', '#5a7acc', '#4a6a9a']

  inks.forEach((ink, i) => {
    const r = 12 + i * 7
    const row = []

    for (let c = 0; c < 144; c++) {
      row.push(put(tile(x, null, ink, c % 8 === 0 ? '+' : '-'), c - 12, r))
    }

    b.push(mover(x, [[0, 0], [12, 0]], 60 + i * 16, -i * 9, row.join(''), 'loop'))
  })

  b.push(...signature(x, name, '#3a4a6a', '#8a9ad8'))

  return shell(x, { bg: [BG, '#05060a'], veil: BG, veilA: 0.15, grid: '#8a9ad8', gridA: 0.008, fontSize: 16, weight: 700, body: b.join('') })
}

export const ART = { halftone, dither, riso, flow, sineStack, radar }
export const SEASONS = { springRain, wheat, harvestMoon, iceLake }
export const MINIMAL = { horizon, dotgrid, grain, lines }
