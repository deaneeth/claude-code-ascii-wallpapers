// Energy scenes: loud, bright, moving. Enjoy mode.
import { CW, CH, rng, pick, ctx, tile, put, phased, sprite, word, mover, follow, trace, clip, shell, signature, lerp, stars, line, disc, particles, ridge, skyline, hsl, wavy } from './engine.js'

const FONT3 = {
  0: ['111', '101', '101', '101', '111'], 1: ['010', '110', '010', '010', '111'], 2: ['111', '001', '111', '100', '111'], 3: ['111', '001', '111', '001', '111'],
  4: ['101', '101', '111', '001', '001'], 5: ['111', '100', '111', '001', '111'], 6: ['111', '100', '111', '101', '111'], 7: ['111', '001', '001', '010', '010'],
  8: ['111', '101', '111', '101', '111'], 9: ['111', '101', '111', '001', '111'],
}

function digits(x, text, c0, r0, fill, ink, scale = 1) {
  const out = []
  ;[...text].forEach((ch, k) => {
    FONT3[ch]?.forEach((row, j) => {
      ;[...row].forEach((v, i) => {
        if (v === '1') {
          for (let dy = 0; dy < scale; dy++) {
            for (let dx = 0; dx < scale; dx++) {
              out.push(put(tile(x, fill, ink, '#'), c0 + k * 4 * scale + i * scale + dx, r0 + j * scale + dy))
            }
          }
        }
      })
    })
  })

  return out
}

// ---------------------------------------------------------------- Equalizer
function equalizer(name) {
  const x = ctx()
  const R = rng(501)
  const b = []
  const LV = 10
  const bars = 30

  // each level of a bar goes dark in turn, then the bar leaps back: a VU meter falling
  for (let k = 0; k < LV; k++) {
    const f = ((1 - (k + 1) / (LV + 1)) * 100).toFixed(1)
    x.kf.push(`@keyframes eq${k}{0%{opacity:1}${f}%{opacity:0}100%{opacity:0}}`)
    x.anim.push(`.e${k}{animation-name:eq${k};animation-timing-function:steps(1);animation-iteration-count:infinite}`)
  }

  for (let i = 0; i < bars; i++) {
    const c = 3 + i * 3 + (i > 14 ? 3 : 0)
    const dur = (1.1 + R() * 1.6).toFixed(2)
    const delay = (-R() * 3).toFixed(2)

    for (let k = 0; k < LV; k++) {
      const hue = 150 - (k / (LV - 1)) * 150
      const fill = hsl(hue, 85, 48)
      const inner = [0, 1].flatMap(dy => [0, 1].map(dx => put(tile(x, fill, hsl(hue, 90, 75), '#'), c + dx, 44 - k * 3 - dy))).join('')
      b.push(`<g class="e${k}" style="animation-duration:${dur}s;animation-delay:${delay}s">${inner}</g>`)
    }
  }

  b.push(...trace(x, [[0, 46], [119, 46]], '#1a1a2a', '#3a3a5a', '=', '='), ...signature(x, name, '#5a5a8a', '#5affa0', 4, 47))

  return shell(x, { bg: ['#10102a', '#05050f'], veil: '#07071a', veilA: 0.34, grid: '#8a8aff', gridA: 0.03, body: b.join('') })
}

// ---------------------------------------------------------------- Neon city
function neonCity(name) {
  const x = ctx()
  const R = rng(511)
  const b = []
  const glow = '<radialGradient id="nc" cx=".5" cy=".75" r=".6"><stop offset="0" stop-color="#ff3dd0" stop-opacity=".3"/><stop offset="1" stop-color="#ff3dd0" stop-opacity="0"/></radialGradient>'
  b.push(`<rect class="gl" width="1920" height="1080" fill="url(#nc)"/>`)
  b.push(phased(disc(x, R, 960, 360, 150, (px, py, t) => [lerp('#ffb0ff', '#ff3db8', t), '#6a0a58'], '.:'), 2))
  b.push(skyline(x, R, { from: 0, to: 120, base: 40, w: [4, 8], h: [8, 18], fill: '#1a0a3a', lit: 0.3, windows: ['#ff7ac8', '#7affff', '#ffe07a'], seed: 3 }))
  b.push(skyline(x, R, { from: 0, to: 120, base: 46, w: [5, 10], h: [6, 13], fill: '#0a0420', lit: 0.4, windows: ['#ff3db8', '#3dd8ff', '#ffd23d'], seed: 8 }))

  // neon signs, buzzing
  const signs = [['OPEN', 6, 22, '#ff3db8'], ['24H', 100, 18, '#3dd8ff'], ['BAR', 12, 30, '#ffd23d'], ['RAMEN', 96, 28, '#7aff7a']]
  signs.forEach(([t, c, r, col], i) => {
    const box = word(x, ` ${t} `, c, r, lerp('#0a0420', col, 0.25), col).join('')
    b.push(`<g class="cur" style="animation-duration:${(1.6 + i * 0.7).toFixed(1)}s;animation-delay:${-i}s">${box}</g>`)
  })

  // cars gliding past
  const car = ['  ####  ', '########', ' o    o ']
  for (let i = 0; i < 3; i++) {
    b.push(mover(x, [[-10, 6 + i * 4], [124, 6 + i * 4]], 14 + i * 5, -i * 6, sprite(x, car, { '#': { fill: i % 2 ? '#ff3db8' : '#3dd8ff', ink: '#fff', g: '=' }, o: { fill: '#ffffff', ink: '#ff9a3d', g: '*' } }, -10, 6 + i * 4, i).join(''), 'loop'))
  }

  b.push(...particles(x, R, { n: 60, c: [0, 120], r: [-2, 6], dx: -3, dy: 46, dur: [1, 2], glyphs: '|', inks: ['#9ab0ff', '#7a8af0'] }), ...signature(x, name, '#a83ab8', '#7affff', 40, 47))

  return shell(x, { sky: [[0, '#14062e'], [0.6, '#4a0a5a'], [1, '#a81a7a']], veil: '#0c0220', veilA: 0.34, grid: '#ff7ac8', gridA: 0.03, defs: glow, body: b.join('') })
}

// ---------------------------------------------------------------- Fireworks
function fireworks(name) {
  const x = ctx()
  const R = rng(521)
  const b = []
  b.push(phased(stars(x, R, 80, 30, 120, ['#cfd8ff', '#fff1c9']), 2))
  b.push(skyline(x, R, { from: 0, to: 120, base: 47, w: [4, 9], h: [3, 9], fill: '#06060e', lit: 0.16, windows: ['#ffd070'], seed: 5 }))

  const bursts = [[14, 14, '#ff4a6a', 7.5], [32, 24, '#ffd23d', 9], [102, 12, '#4aa8ff', 8.2], [88, 22, '#7aff7a', 10], [112, 26, '#ff7aff', 9.4], [22, 6, '#ffffff', 11], [100, 28, '#ff9a3d', 7.8], [8, 28, '#3dffd0', 8.8]]

  bursts.forEach(([cc, cr, col, dur], bi) => {
    for (let k = 0; k < 16; k++) {
      const a = (k / 16) * Math.PI * 2
      const dist = 8 + (k % 2) * 3
      const dx = Math.cos(a)
      const dy = Math.sin(a) * 0.5
      const trail = [0, 1, 2].map(j => put(tile(x, j === 0 ? col : null, j === 0 ? '#ffffff' : lerp('#06060e', col, 1 - j * 0.25), j === 0 ? '*' : '.'), Math.round(cc + dx * j * 0.8), Math.round(cr + dy * j * 0.8)))
      b.push(mover(x, [[cc, cr], [Math.round(cc + dx * dist), Math.round(cr + dy * dist * 1.1 + 2)]], dur, bi % 3 === 0 ? -dur * 0.13 : -dur * (0.35 + bi * 0.08), trail.join(''), 'blast'))
    }

    // the rocket going up first
    b.push(mover(x, [[cc, 46], [cc, cr]], dur, bi % 3 === 0 ? -dur * 0.99 : -dur * (0.35 + bi * 0.08) + 0.7, put(tile(x, null, '#fff1c9', '|'), cc, 46) + put(tile(x, null, '#a89060', '.'), cc, 47), 'burst'))
  })

  b.push(...signature(x, name, '#5a5a8a', '#ffd23d', 4, 47))

  return shell(x, { sky: [[0, '#04041a'], [1, '#14103a']], veil: '#04040f', veilA: 0.3, grid: '#8aa0ff', gridA: 0.02, body: b.join('') })
}

// ---------------------------------------------------------------- Disco
function disco(name) {
  const x = ctx()
  const R = rng(531)
  const b = []
  const cols = ['#ff3db8', '#3dd8ff', '#ffd23d', '#7aff7a', '#b06aff']
  x.kf.push('@keyframes tri{0%{opacity:1}33.3%{opacity:0}100%{opacity:0}}')
  x.anim.push('.tri{animation:tri 1.8s steps(1) infinite}')

  // the dance floor: every cell cycles through three colours
  for (let o = 0; o < 3; o++) {
    const cells = []

    for (let r = 33; r < 47; r += 3) {
      for (let c = 0; c < 120; c += 3) {
        const col = pick(R, cols)
        cells.push(put(tile(x, col, '#00000044', ' '), c, r), put(tile(x, col, '#00000044', ' '), c + 1, r), put(tile(x, col, '#00000044', ' '), c, r + 1), put(tile(x, col, '#00000044', ' '), c + 1, r + 1))
      }
    }

    b.push(`<g class="tri" style="animation-delay:${(-o * 0.6).toFixed(2)}s">${cells.join('')}</g>`)
  }

  // light beams swinging
  x.kf.push('@keyframes bm{0%,100%{opacity:.05}50%{opacity:.5}}')
  x.anim.push('.bd1{animation:bm 3s ease-in-out infinite}.bd2{animation:bm 3s ease-in-out -1s infinite}.bd3{animation:bm 3s ease-in-out -2s infinite}')
  const bx = 60 * CW

  b.push(`<path class="bd1" d="M${bx} 160 L200 ${32 * CH} L520 ${32 * CH}Z" fill="#ff3db8"/>`, `<path class="bd2" d="M${bx} 160 L760 ${32 * CH} L1160 ${32 * CH}Z" fill="#3dd8ff"/>`, `<path class="bd3" d="M${bx} 160 L1400 ${32 * CH} L1720 ${32 * CH}Z" fill="#ffd23d"/>`)

  // the mirror ball
  b.push(...line([60, 0], [60, 5], tile(x, null, '#9a9ab0', '|')))
  b.push(phased(disc(x, R, 60 * CW + 8, 8 * CH, 62, (px, py, t) => [pick(R, ['#ffffff', '#cfd8ff', '#9a9ab0', '#e8e8f4', '#7a7a90']), '#444'], '+x*'), 4))
  b.push(...particles(x, R, { n: 26, c: [40, 80], r: [4, 14], dx: r => Math.floor((r() - 0.5) * 60), dy: 12, dur: [1.4, 3], glyphs: '*+', inks: ['#ffffff', '#ffd23d', '#ff7ac8'] }))
  b.push(...signature(x, name, '#a8a8c8', '#ffd23d', 4, 47))

  return shell(x, { bg: ['#12062a', '#05020f'], veil: '#0a0418', veilA: 0.3, grid: '#ff7ac8', gridA: 0.03, body: b.join('') })
}

// ---------------------------------------------------------------- Plasma
function plasma(name) {
  const x = ctx()
  const b = []
  const buckets = Array.from({ length: 12 }, () => [])

  for (let r = 0; r < 48; r += 2) {
    for (let c = 0; c < 120; c += 2) {
      const v = Math.sin(c / 9) + Math.sin(r / 5 + 1) + Math.sin((c + r) / 11) + Math.sin(Math.hypot(c - 60, (r - 24) * 2) / 8)
      const hue = Math.round((((v + 4) / 8) * 300 + 250) % 360 / 20) * 20
      buckets[Math.floor(((c + r * 0.6) / 150) * 12) % 12].push(put(tile(x, hsl(hue, 85, 50), hsl(hue, 90, 72), pick(rng(c * 7 + r), ['.', ':', '+', '*'])), c, r))
    }
  }

  x.anim.push('.aw{animation:sh 5s ease-in-out infinite}')
  b.push(wavy(x, buckets, 0.42), ...signature(x, name, '#f0e0ff', '#ffffff'))

  return shell(x, { bg: ['#1a0a3a', '#0a0420'], veil: '#0a0420', veilA: 0.38, grid: '#ffffff', gridA: 0.02, body: b.join('') })
}

// ---------------------------------------------------------------- Invaders
function invaders(name) {
  const x = ctx()
  const R = rng(541)
  const b = []
  b.push(phased(stars(x, R, 60, 46, 120, ['#cfd8ff', '#6a7ab0']), 2))
  const A = [['  #   #  ', '   # #   ', '  #####  ', ' ## # ## ', '#########', '# ##### #', '# #   # #', '   # #   '], ['  #   #  ', '#  # #  #', '# ##### #', '### # ###', '#########', ' ####### ', '  #   #  ', ' #     # ']]
  const B = [[' ##### ', '#######', '## # ##', '#######', ' #   # ', '#  #  #'], [' ##### ', '#######', '## # ##', '#######', '  # #  ', ' #   # ']]
  const kinds = [{ f: A, c: '#ff5a8a' }, { f: B, c: '#5affb0' }, { f: B, c: '#5ad0ff' }]
  const fa = []
  const fb = []

  for (let row = 0; row < 4; row++) {
    const k = kinds[Math.min(row, 2)]

    for (let i = 0; i < 9; i++) {
      const pal = { '#': { fill: k.c, ink: '#06060e', g: '#' } }
      const c = 10 + i * 11
      const r = 4 + row * 8
      fa.push(...sprite(x, k.f[0], pal, c, r, row * 9 + i))
      fb.push(...sprite(x, k.f[1], pal, c, r, row * 9 + i))
    }
  }

  // the whole fleet marches, wobbling between two frames
  x.kf.push('@keyframes fa{0%,49%{opacity:1}50%,100%{opacity:0}}@keyframes fb{0%,49%{opacity:0}50%,100%{opacity:1}}')
  x.anim.push('.fa{animation:fa 1s steps(1) infinite}.fb{animation:fb 1s steps(1) infinite}')
  b.push(mover(x, [[0, 0], [8, 0], [8, 2], [0, 2], [0, 4], [8, 4], [8, 6], [0, 6], [0, 0]], 24, 0, `<g class="fa">${fa.join('')}</g><g class="fb">${fb.join('')}</g>`, 'loop'))

  // bunkers, the cannon, and shots
  const bunker = ['  ####  ', ' ###### ', '########', '##    ##']

  for (const c of [14, 40, 66, 92]) {
    b.push(...sprite(x, bunker, { '#': { fill: '#3aa86a', ink: '#0a3a1a', g: '=' } }, c, 38, c))
  }

  b.push(mover(x, [[8, 44], [100, 44]], 16, 0, sprite(x, ['   #   ', ' ##### ', '#######'], { '#': { fill: '#5affb0', ink: '#06260f', g: '=' } }, 8, 43, 3).join(''), 'loop'))

  for (let i = 0; i < 6; i++) {
    const c = 12 + Math.floor(R() * 96)
    b.push(mover(x, [[c, 42], [c, 4]], 2.2 + R(), -R() * 4, put(tile(x, '#ffffff', '#000', '|'), c, 42), 'fade'))
  }

  b.push(...word(x, 'SCORE 04210', 4, 1, null, '#ffffff'), ...word(x, 'HI 09999', 100, 1, null, '#ff5a8a'), ...signature(x, name, '#5affb0', '#ffffff', 4, 47))

  return shell(x, { bg: ['#04040a', '#000000'], veil: '#02020a', veilA: 0.22, grid: '#5affb0', gridA: 0.03, body: b.join('') })
}

// ---------------------------------------------------------------- Pong
function pong(name) {
  const x = ctx()
  const R = rng(551)
  const b = []
  const net = tile(x, '#2a2a34', '#5a5a6a', '|')

  for (let r = 3; r < 46; r += 2) {
    b.push(put(net, 60, r))
  }

  b.push(...trace(x, [[2, 2], [117, 2]], '#3a3a48', '#8a8aa0', '=', '='), ...trace(x, [[2, 46], [117, 46]], '#3a3a48', '#8a8aa0', '=', '='))
  b.push(...digits(x, '07', 40, 5, '#e8e8f4', '#555', 1), ...digits(x, '05', 70, 5, '#e8e8f4', '#555', 1))

  const paddle = rows => Array.from({ length: rows }, (_, j) => put(tile(x, '#e8e8f4', '#555', '|'), 0, 20 + j)).join('')
  const wob = (c, dur, delay) => mover(x, [[0, 0], [0, 12], [0, -8], [0, 4], [0, 0]], dur, delay, paddle(6).replace(/x="0"/g, `x="${c * CW}"`), 'loop')
  b.push(wob(8, 6, 0), wob(111, 7, -2.5))

  // the ball and its fading trail
  const path = [[10, 20], [108, 36], [10, 12], [108, 28], [10, 24], [108, 10], [10, 20]]

  for (let k = 0; k < 4; k++) {
    const id = tile(x, k === 0 ? '#ffffff' : lerp('#05050a', '#ffffff', 0.5 - k * 0.12), '#555', k === 0 ? '@' : '.')
    b.push(mover(x, path, 16, -k * 0.12, put(id, 10, 20), 'loop'))
  }

  b.push(...signature(x, name, '#8a8aa0', '#ffffff', 4, 47))

  return shell(x, { bg: ['#0c0c12', '#030306'], veil: '#05050a', veilA: 0.3, grid: '#ffffff', gridA: 0.03, body: b.join('') })
}

// ---------------------------------------------------------------- Snake
function snake(name) {
  const x = ctx()
  const R = rng(561)
  const b = []
  const wall = tile(x, '#1a3a24', '#3a8a54', '#')

  for (let c = 2; c <= 117; c++) {
    b.push(put(wall, c, 3), put(wall, c, 44))
  }

  for (let r = 3; r <= 44; r++) {
    b.push(put(wall, 2, r), put(wall, 117, r))
  }

  // the snake follows one long winding path, each segment a beat behind
  const pts = [[8, 8]]

  for (let k = 0; k < 8; k++) {
    const last = pts[pts.length - 1]
    pts.push([k % 2 === 0 ? 112 : 8, last[1]])
    pts.push([k % 2 === 0 ? 112 : 8, last[1] + 5])
  }

  const seg = (i, head) => {
    const id = tile(x, head ? '#9affb0' : lerp('#1a6a3a', '#5aff8a', 1 - i / 24), '#04200f', head ? 'o' : pick(R, ['#', '%', '@']))

    return put(id, 8, 8) + put(id, 9, 8)
  }
  const items = []

  for (let i = 0; i < 26; i++) {
    items.push({ delay: (-0.24 * i - 1).toFixed(2), inner: seg(i, i === 0) })
  }

  b.push(follow(x, pts, 44, items))

  // apples
  for (const [c, r] of [[30, 14], [90, 20], [50, 30], [100, 38], [20, 40]]) {
    b.push(`<g class="cur" style="animation-duration:${(0.9 + R()).toFixed(2)}s">${put(tile(x, '#ff4a4a', '#fff', '@'), c, r)}</g>`)
  }

  b.push(...word(x, 'SCORE 0120', 4, 1, null, '#5aff8a'), ...word(x, 'LEN 26', 100, 1, null, '#5aff8a'), ...signature(x, name, '#3a8a54', '#9affb0', 4, 47))

  return shell(x, { bg: ['#06140c', '#020a05'], veil: '#03100a', veilA: 0.3, grid: '#5aff8a', gridA: 0.04, body: b.join('') })
}

// ---------------------------------------------------------------- Tetris rain
function tetris(name) {
  const x = ctx()
  const R = rng(571)
  const b = []
  const shapes = [['####'], ['##', '##'], [' # ', '###'], ['#  ', '###'], ['  #', '###'], [' ##', '## '], ['## ', ' ##']]
  const colors = ['#3dd8ff', '#ffd23d', '#b06aff', '#4a6aff', '#ff9a3d', '#5aff7a', '#ff4a6a']

  for (const [c0, seed] of [[6, 1], [98, 2]]) {
    const wall = tile(x, '#2a2a3a', '#5a5a7a', '|')

    for (let r = 4; r <= 44; r++) {
      b.push(put(wall, c0 - 1, r), put(wall, c0 + 13, r))
    }

    b.push(...trace(x, [[c0 - 1, 45], [c0 + 13, 45]], '#2a2a3a', '#5a5a7a', '=', '='))

    // settled blocks
    const r2 = rng(seed * 31)

    for (let r = 36; r < 45; r++) {
      for (let c = 0; c < 13; c++) {
        if (r2() < 0.85 - (36 - 36 + (45 - r) * 0.04) + (r - 36) * 0.02) {
          const k = Math.floor(r2() * 7)
          b.push(put(tile(x, colors[k], lerp(colors[k], '#fff', 0.5), '#'), c0 + c, r))
        }
      }
    }

    // pieces falling, one cell at a time
    for (let i = 0; i < 4; i++) {
      const sh = shapes[Math.floor(r2() * 7)]
      const k = Math.floor(r2() * 7)
      const col = c0 + Math.floor(r2() * 9)
      const piece = sprite(x, sh, { '#': { fill: colors[k], ink: lerp(colors[k], '#ffffff', 0.5), g: '#' } }, col, 4, k)
      const dur = 5 + r2() * 5
      b.push(mover(x, [[col, 4], [col, 34]], dur, -r2() * dur, piece.join(''), 'fade'))
    }
  }

  b.push(...word(x, 'LINES 042', 5, 2, null, '#e8e8f4'), ...word(x, 'LEVEL 07', 100, 2, null, '#e8e8f4'), ...signature(x, name, '#7a7aa8', '#ffd23d', 36, 47))

  return shell(x, { bg: ['#10102a', '#05050f'], veil: '#07071a', veilA: 0.3, grid: '#8a8aff', gridA: 0.03, body: b.join('') })
}

// ---------------------------------------------------------------- Volcano
function volcano(name) {
  const x = ctx()
  const R = rng(581)
  const b = []
  const glow = '<radialGradient id="vg" cx=".8" cy=".35" r=".5"><stop offset="0" stop-color="#ff6a2a" stop-opacity=".5"/><stop offset="1" stop-color="#ff6a2a" stop-opacity="0"/></radialGradient>'
  x.anim.push('.fl{animation:glow 2.4s ease-in-out infinite}')
  b.push(`<rect class="fl" width="1920" height="1080" fill="url(#vg)"/>`)
  b.push(phased(stars(x, R, 50, 16, 120, ['#cfd8ff', '#8aa0d8']), 2))
  b.push(ridge(x, R, { base: 46, h: c => Math.max(3, 24 - Math.abs(c - 96) * 0.78) + 1.5 * Math.sin(c / 3), fill: ['#2a1410', '#0e0605'], edge: ['#4a2418', '#7a3a24'], glyphs: '^.:', seed: 3 }))

  // lava running down the slopes
  const lava = []

  for (const [c0, dir] of [[93, -1], [98, 1], [96, 1]]) {
    let c = c0

    for (let r = 22; r < 46; r++) {
      c += dir * (R() < 0.45 ? 1 : 0)
      lava.push(put(tile(x, pick(R, ['#ff6a2a', '#ff9a3a', '#e8401c']), '#ffe08a', pick(R, ['~', '=', '*'])), c, r))
    }
  }

  b.push(phased(lava, 4))

  // bombs thrown out of the crater in arcs
  for (let i = 0; i < 9; i++) {
    const dir = i % 2 ? 1 : -1
    const dist = 6 + Math.floor(R() * 16)
    const arc = []

    for (let k = 0; k <= 6; k++) {
      const t = k / 6
      arc.push([Math.round(96 + dir * dist * t), Math.round(21 - 12 * Math.sin(Math.PI * t) + 20 * t * t * 0.9)])
    }

    b.push(mover(x, arc, 3.2 + R() * 1.4, -R() * 8, put(tile(x, '#ff7a2a', '#ffe08a', '@'), arc[0][0], arc[0][1]), 'fade'))
  }

  b.push(...particles(x, R, { n: 50, c: [88, 106], r: [18, 24], dx: r => Math.floor((r() - 0.5) * 12), dy: -16, dur: [2.5, 6], glyphs: '*.+', inks: ['#ffb066', '#ff7a2a', '#ffe08a'] }))
  b.push(...particles(x, R, { n: 16, c: [84, 108], r: [10, 18], dx: 10, dy: -8, dur: [10, 18], glyphs: 'O~o', inks: ['#4a3a38', '#5a4a46', '#3a2a28'] }), ...signature(x, name, '#8a4a2a', '#ff9a3a', 4, 47))

  return shell(x, { sky: [[0, '#14060a'], [0.6, '#3a0e14'], [1, '#6a2014']], veil: '#0e0406', veilA: 0.36, grid: '#ff9a3a', gridA: 0.025, defs: glow, body: b.join('') })
}

export const ENERGY = { equalizer, neonCity, fireworks, disco, plasma, invaders, pong, snake, tetris, volcano }
