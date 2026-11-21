// Creature scenes: things that live in the picture. Fish, jellies, birds, a cat on a sill.
import { CW, CH, rng, pick, ctx, tile, put, phased, sprite, mover, trace, clip, shell, signature, lerp, line, disc, particles, ridge, skyline, pine, follow, stars } from './engine.js'

const dots = (x, R, n, cols, rows, inks, glyphs = '.+*') => stars(x, R, n, rows, cols, inks).join('')

// ---------------------------------------------------------------- Lily Pond
function koi(name) {
  const x = ctx()
  const R = rng(501)
  const b = []
  // ripples that grow and fade
  x.kf.push('@keyframes rp{0%{opacity:0}8%{opacity:.9}45%{opacity:0}100%{opacity:0}}')
  x.anim.push('.rp0{animation:rp 7s linear infinite}.rp1{animation:rp 7s linear -2.3s infinite}.rp2{animation:rp 7s linear -4.6s infinite}')

  ;[[30, 18], [88, 30], [60, 40]].forEach(([c, r], i) => {
    for (let k = 0; k < 3; k++) {
      const ring = []

      for (let a = 0; a < 360; a += 12) {
        const rad = 3 + k * 3
        ring.push(put(tile(x, null, '#8fd8e0', '.'), Math.round(c + Math.cos((a * Math.PI) / 180) * rad * 1.6), Math.round(r + Math.sin((a * Math.PI) / 180) * rad * 0.7)))
      }

      b.push(`<g class="rp${(i + k) % 3}" style="animation-delay:${(-k * 0.9).toFixed(1)}s">${ring.join('')}</g>`)
    }
  })

  // lily pads and a lotus
  for (const [c, r, rad] of [[18, 12, 70], [96, 14, 60], [52, 34, 80], [104, 38, 66], [10, 38, 56], [74, 22, 50]]) {
    b.push(phased(disc(x, R, c * CW, r * CH, rad, (px, py, t) => (px > c * CW + 6 && Math.abs(py - r * CH) < 8 ? null : [lerp('#3aa05a', '#1f7a3e', t), '#8ae0a0']), 'o.'), 3))
  }

  b.push(put(tile(x, '#ff9ac8', '#fff', '*'), 18, 12), put(tile(x, '#ffd0e4', '#fff', '*'), 17, 12), put(tile(x, '#ffd0e4', '#fff', '*'), 19, 12), put(tile(x, '#ff9ac8', '#fff', '^'), 18, 11))

  // koi swim in loops
  const fish = (c, r, body, patch) => sprite(x, ['  ooo   ', 'oppoooo<', '  ooo   '], { o: { fill: body, ink: '#fff', g: 'o' }, p: { fill: patch, ink: '#fff', g: 'o' } }, c, r, c)

  const paths = [
    [[10, 20], [40, 14], [70, 18], [100, 28], [70, 36], [40, 30], [10, 20]],
    [[110, 36], [80, 40], [50, 44], [20, 38], [50, 28], [90, 24], [110, 36]],
    [[60, 8], [90, 12], [108, 22], [80, 26], [50, 18], [60, 8]],
  ]

  paths.forEach((p, i) => {
    b.push(mover(x, p, 36 + i * 10, -i * 14, fish(p[0][0], p[0][1], ['#ff8a3a', '#ffffff', '#ffb84a'][i], ['#ffffff', '#e8403a', '#ff6a3a'][i]).join(''), 'loop'))
  })

  b.push(dots(x, R, 40, 120, 48, ['#4aa0a8', '#6ac8c8'], '.'))
  b.push(...signature(x, name, '#3f8a8a', '#8fe8e8'))

  return shell(x, { sky: [[0, '#0d4a5a'], [0.5, '#0a3a48'], [1, '#062430']], veil: '#062430', veilA: 0.35, grid: '#8fd8e0', gridA: 0.03, body: b.join('') })
}

// ---------------------------------------------------------------- Moon Jellies
function jellies(name) {
  const x = ctx()
  const R = rng(511)
  const b = []
  const cols = [['#c88aff', '#f0d8ff'], ['#ff8ad0', '#ffd8f0'], ['#8ac8ff', '#d8f0ff'], ['#8affd8', '#d8fff0']]

  for (let i = 0; i < 8; i++) {
    const c = 8 + Math.floor(R() * 100)
    const [f, s] = cols[i % 4]
    const size = 80 + Math.floor(R() * 60)
    const bell = disc(x, R, c * CW, 30 * CH, size, (px, py, t) => (py > 30 * CH + 2 ? null : [lerp(f, s, 0.25 + t * 0.6), '#fff']), 'o.')
    const half = Math.floor(size / CW)
    const tent = []

    for (let k = -half + 1; k < half; k += 2) {
      const len = 6 + Math.floor(R() * 9)

      for (let r = 31; r < 31 + len; r++) {
        tent.push(put(tile(x, null, lerp(f, '#ffffff', 0.35), pick(R, ['|', ':', '!'])), c + k, r))
      }
    }

    const dur = 50 + i * 9
    const j = mover(x, [[0, 0], [0, -2], [0, 0], [0, -2], [0, 0]], 8 + (i % 3), -i, bell.join('') + mover(x, [[0, 0], [1, 0], [0, 0]], 4 + (i % 3), -i, tent.join(''), 'loop'), 'loop')
    b.push(mover(x, [[0, 24 + (i % 4) * 6], [Math.floor((R() - 0.5) * 20), -30]], dur, -R() * dur, j, 'loop'))
  }

  b.push(...particles(x, R, { n: 70, c: [0, 120], r: [0, 49], dx: r => Math.floor((r() - 0.5) * 6), dy: -8, dur: [10, 26], glyphs: '.o*', inks: ['#6a8ad8', '#a8c0ff', '#c8a0ff'] }))
  b.push(...signature(x, name, '#5a6ab0', '#c0a0ff'))

  return shell(x, { sky: [[0, '#0a1a4a'], [0.6, '#06103a'], [1, '#02061a']], veil: '#02061a', veilA: 0.3, grid: '#8ac8ff', gridA: 0.025, body: b.join('') })
}

// ---------------------------------------------------------------- Whale Song
function whale(name) {
  const x = ctx()
  const R = rng(521)
  const b = []
  b.push(phased(disc(x, R, 1500, 170, 80, (px, py, t) => [lerp('#f8f4e0', '#d8d4b8', t), '#8a8868'], '.'), 2))
  b.push(dots(x, R, 70, 120, 20, ['#8aa0d8', '#c0d0ff']))

  // a column of moonlight on the water
  for (let r = 20; r < 40; r++) {
    for (let c = 70 + Math.floor((r - 20) / 3); c < 82 - Math.floor((r - 20) / 4); c++) {
      if ((c + r) % 2 === 0) {
        b.push(put(tile(x, null, '#e8e4c0', '~'), c, r))
      }
    }
  }

  b.push(ridge(x, R, { base: 49, h: c => 25 + 1.2 * Math.sin(c / 4) + 0.8 * Math.sin(c / 1.7), fill: ['#0a2a4a', '#04142a'], edge: ['#1a4a78', '#2a6aa0'], glyphs: '~-', seed: 4 }))

  // the whale: a long body, a tail, a flipper
  const body = []

  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 38; c++) {
      const t = (c - 14) / 14
      const h = 4.2 * Math.sqrt(Math.max(0, 1 - t * t)) * (c < 14 ? 1 : 0.9) + (c > 28 ? -(c - 28) * 0.4 : 0)

      if (Math.abs(r - 4) <= h) {
        body.push(put(tile(x, r > 5 ? '#6a88b0' : '#1c3a60', '#8aa8d0', pick(R, ['.', ':', '~'])), c, r))
      }
    }
  }

  body.push(...line([36, 5], [44, 1], tile(x, '#1c3a60', '#8aa8d0', '/')), ...line([36, 4], [44, 8], tile(x, '#1c3a60', '#8aa8d0', '\\')), ...line([14, 7], [8, 11], tile(x, '#1c3a60', '#8aa8d0', '/')), put(tile(x, null, '#fff', 'o'), 6, 3))
  b.push(mover(x, [[-50, 30], [30, 27], [80, 31], [130, 28]], 110, -25, body.map(s => s.replace(/y="(\d+)"/, (_, v) => `y="${+v + 28 * CH}"`)).join(''), 'loop'))

  b.push(...particles(x, R, { n: 40, c: [0, 120], r: [30, 48], dx: r => Math.floor((r() - 0.5) * 4), dy: -22, dur: [8, 16], glyphs: 'o.', inks: ['#6a98d8', '#a8c8ff'] }))
  b.push(...signature(x, name, '#4a6aa0', '#a8c8ff'))

  return shell(x, { sky: [[0, '#0a1a44'], [0.45, '#0e2a5a'], [1, '#04102a']], veil: '#04102a', veilA: 0.3, grid: '#6a98d8', gridA: 0.025, body: b.join('') })
}

// ---------------------------------------------------------------- Butterfly House
function butterflies(name) {
  const x = ctx()
  const R = rng(531)
  const b = []
  const stems = [['#ff5a8a', '#ffd0e0'], ['#ffc83d', '#fff0b0'], ['#b06aff', '#e8d0ff'], ['#ff8a3a', '#ffe0c0']]

  for (let i = 0; i < 18; i++) {
    const c = 3 + Math.floor(R() * 114)
    const top = 28 + Math.floor(R() * 12)
    const [f, s] = stems[i % 4]
    const fl = []

    for (let r = top; r < 47; r++) {
      fl.push(put(tile(x, null, '#2f8a4a', '|'), c, r))
    }

    for (const [dc, dr] of [[0, 0], [-1, 0], [1, 0], [0, -1], [0, 1]]) {
      fl.push(put(tile(x, dc === 0 && dr === 0 ? s : f, '#fff', dc === 0 && dr === 0 ? 'o' : '*'), c + dc, top + dr))
    }

    b.push(mover(x, [[0, 0], [1, 0], [0, 0]], 4 + R() * 3, -R() * 5, fl.join(''), 'loop'))
  }

  const wings = [['#ff8a3a', '#2a1a0a'], ['#3aa8ff', '#0a1a3a'], ['#ffd23d', '#3a2a0a'], ['#ff6ac0', '#3a0a2a'], ['#8aff8a', '#0a3a1a']]

  for (let i = 0; i < 16; i++) {
    const pts = [[Math.floor(R() * 110), 10 + Math.floor(R() * 28)]]

    for (let k = 0; k < 8; k++) {
      pts.push([Math.max(0, Math.min(116, pts[k][0] + Math.floor((R() - 0.5) * 24))), Math.max(4, Math.min(40, pts[k][1] + Math.floor((R() - 0.5) * 12)))])
    }

    const [w, body] = wings[i % 5]
    const bf = phased([put(tile(x, w, body, 'W'), pts[0][0], pts[0][1]), put(tile(x, body, w, 'o'), pts[0][0] + 1, pts[0][1]), put(tile(x, w, body, 'W'), pts[0][0] + 2, pts[0][1])], 40 + i)
    b.push(mover(x, pts, 24 + (i % 5) * 6, -i * 4, bf, 'loop'))
  }

  b.push(...particles(x, R, { n: 30, c: [0, 120], r: [0, 40], dx: 6, dy: -10, dur: [10, 20], glyphs: '.*', inks: ['#a8f0b8', '#fff6b0'] }))
  b.push(...signature(x, name, '#3f8a5a', '#a8f0b8'))

  return shell(x, { sky: [[0, '#0f3a2a'], [0.6, '#0a2a20'], [1, '#05160f']], veil: '#05160f', veilA: 0.3, grid: '#8af0a8', gridA: 0.03, body: b.join('') })
}

// ---------------------------------------------------------------- Window Cat
function cat(name) {
  const x = ctx()
  const R = rng(541)
  const b = []
  const L = 28
  const T = 5
  const W = 64
  const H = 32
  // outside: a rainy blue night, a skyline
  b.push(`<rect x="${L * CW}" y="${T * CH}" width="${W * CW}" height="${H * CH}" fill="#14223e"/>`)
  clip(x, 'win', L, T, W, H)
  b.push(`<g clip-path="url(#win)">${skyline(x, R, { from: L, to: L + W, base: T + H, w: [4, 8], h: [8, 16], fill: '#0c1630', lit: 0.4, windows: ['#ffd070', '#ffe8a0', '#7ab0ff'], seed: 8 })}${particles(x, R, { n: 60, c: [L, L + W], r: [T - 2, T + 10], dx: -3, dy: 34, dur: [1.6, 3], glyphs: '|/', inks: ['#6a90d0', '#a0c0ff'] }).join('')}</g>`)

  // the frame and panes
  b.push(...trace(x, [[L, T], [L + W, T], [L + W, T + H], [L, T + H], [L, T]], null, '#c8b090', '=', '|'))
  b.push(...trace(x, [[L + 32, T], [L + 32, T + H]], null, '#c8b090', '=', '|'), ...trace(x, [[L, T + 14], [L + W, T + 14]], null, '#c8b090', '=', '|'))
  b.push(...trace(x, [[L - 3, T + H + 1], [L + W + 3, T + H + 1]], '#8a6a48', '#d8b890', '='))

  // the cat on the sill, a lamp glowing on the left
  const cat = [
    '  ^   ^    ',
    ' /#####\\   ',
    ' ##o#o##   ',
    ' ###v###   ',
    '  #####    ',
    ' ####### ##',
    '#########  #',
    '########## #',
  ]
  b.push(...sprite(x, cat, { '#': { fill: '#2a2a3a', ink: '#5a5a7a', g: '.:' }, o: { fill: '#ffe070', ink: '#3a2a00', g: 'o' }, '^': { fill: '#2a2a3a', ink: '#5a5a7a', g: '^' }, '/': { fill: null, ink: '#5a5a7a', g: '/' }, '\\': { fill: null, ink: '#5a5a7a', g: '\\' }, v: { fill: '#d86a8a', ink: '#fff', g: 'v' } }, L + 22, T + H - 7, 3))
  b.push(mover(x, [[0, 0], [1, 0], [2, 0], [1, 0], [0, 0]], 3.5, 0, [put(tile(x, '#2a2a3a', '#5a5a7a', '~'), L + 33, T + H - 3), put(tile(x, '#2a2a3a', '#5a5a7a', '~'), L + 34, T + H - 4)].join(''), 'loop'))

  b.push('<g class="gl"><circle cx="150" cy="700" r="330" fill="url(#lamp)"/></g>')
  x.defs.push('<radialGradient id="lamp"><stop offset="0" stop-color="#ffc060" stop-opacity=".5"/><stop offset="1" stop-color="#ffc060" stop-opacity="0"/></radialGradient>')
  b.push(...signature(x, name, '#8a7a5a', '#ffd070'))

  return shell(x, { sky: [[0, '#1a1410'], [1, '#0c0a08']], veil: '#0c0a08', veilA: 0.25, grid: '#c8b090', gridA: 0.02, body: b.join('') })
}

// ---------------------------------------------------------------- Murmuration
function birds(name) {
  const x = ctx()
  const R = rng(551)
  const b = []
  b.push(phased(disc(x, R, 360, 760, 110, (px, py, t) => [lerp('#ffd890', '#ff9a50', t), '#c86a30'], '.'), 2))
  b.push(ridge(x, R, { base: 47, h: c => 4 + 2 * Math.sin(c / 9) + Math.sin(c / 3), fill: ['#2a1a2a', '#120a14'], edge: ['#3a2438', '#5a3450'], glyphs: '^.', seed: 4 }))

  for (const c of [8, 22, 100, 112]) {
    b.push(...pine(x, R, c, 47, 8 + Math.floor(R() * 3), ['#1a2a1a', '#223422'], null))
  }

  // two streams of starlings along S curves
  const path1 = [[-6, 30], [20, 14], [50, 24], [80, 10], [126, 20]]
  const path2 = [[126, 38], [96, 26], [66, 34], [34, 20], [-6, 28]]

  for (const [path, dur, n, col] of [[path1, 26, 60, '#2a1830'], [path2, 32, 46, '#34203a']]) {
    const items = []

    for (let i = 0; i < n; i++) {
      const dc = Math.floor((R() - 0.5) * 8)
      const dr = Math.floor((R() - 0.5) * 5)
      items.push({ delay: -(i / n) * dur + R() * 0.8, inner: put(tile(x, null, col, pick(R, ['v', 'v', '^', 'w'])), path[0][0] + dc, path[0][1] + dr) })
    }

    b.push(follow(x, path, dur, items))
  }

  b.push(...signature(x, name, '#8a5a6a', '#ffb070'))

  return shell(x, { sky: [[0, '#4a2a6a'], [0.4, '#c8607a'], [0.75, '#ffa860'], [1, '#ffd890']], veil: '#2a1a3a', veilA: 0.25, grid: '#ffb070', gridA: 0.03, fontSize: 15, weight: 700, body: b.join('') })
}

// ---------------------------------------------------------------- Firefly Field
function fireflies(name) {
  const x = ctx()
  const R = rng(561)
  const b = []
  b.push(phased(disc(x, R, 1500, 150, 54, (px, py, t) => [lerp('#e8f0ff', '#b8c8e8', t), '#7a88a8'], '.'), 2))
  b.push(dots(x, R, 80, 120, 24, ['#6a80b8', '#a8b8e8']))
  b.push(ridge(x, R, { base: 40, h: c => 5 + 2 * Math.sin(c / 12) + Math.sin(c / 4), fill: ['#0e2a24', '#06140f'], edge: ['#16402f', '#245a40'], glyphs: '"|', seed: 3 }))
  b.push(ridge(x, R, { base: 47, h: c => 4 + 2 * Math.sin(c / 8 + 2) + 0.8 * Math.sin(c / 2.4), fill: ['#081c16', '#030c08'], edge: ['#103628', '#1c5438'], glyphs: '"|v', seed: 5 }))

  // a fence
  for (let c = 14; c < 110; c += 9) {
    b.push(...line([c, 38], [c, 44], tile(x, '#2a1c10', '#5a3c20', '|')))
  }

  b.push(...trace(x, [[14, 40], [108, 40]], null, '#5a3c20', '=', '|'), ...trace(x, [[14, 42], [108, 42]], null, '#5a3c20', '=', '|'))

  // fireflies wander and blink
  for (let i = 0; i < 46; i++) {
    const c = Math.floor(R() * 118)
    const r = 14 + Math.floor(R() * 32)
    const pts = [[c, r]]

    for (let k = 0; k < 4; k++) {
      pts.push([Math.max(0, Math.min(119, pts[k][0] + Math.floor((R() - 0.5) * 14))), Math.max(6, Math.min(46, pts[k][1] + Math.floor((R() - 0.5) * 8)))])
    }

    b.push(mover(x, pts, 8 + R() * 14, -R() * 20, put(tile(x, i % 3 ? '#e8ff70' : '#ffe070', '#6a7a10', '*'), c, r), 'fade'))
  }

  b.push(...signature(x, name, '#3f6a50', '#e8ff70'))

  return shell(x, { sky: [[0, '#0a1a3a'], [0.7, '#0c2a3a'], [1, '#0a2a20']], veil: '#06140f', veilA: 0.28, grid: '#8af0a8', gridA: 0.02, body: b.join('') })
}

// ---------------------------------------------------------------- Night Owl
function owl(name) {
  const x = ctx()
  const R = rng(571)
  const b = []
  b.push(phased(disc(x, R, 1560, 210, 120, (px, py, t) => [lerp('#fff6d8', '#f0e0a8', t), '#b8a870'], '.'), 2))
  b.push(dots(x, R, 80, 120, 30, ['#8aa0d8', '#d0dcff']))

  // a thick branch across the screen with leaves
  b.push(...line([0, 34], [60, 36], tile(x, '#4a2f1a', '#8a6038', '=')), ...line([0, 35], [60, 37], tile(x, '#3a2414', '#7a5030', '=')), ...line([60, 36], [119, 33], tile(x, '#4a2f1a', '#8a6038', '=')), ...line([60, 37], [119, 34], tile(x, '#3a2414', '#7a5030', '=')))

  for (let g = 0; g < 3; g++) {
    const leaves = []

    for (let i = 0; i < 40; i++) {
      const c = Math.floor(R() * 118)
      leaves.push(put(tile(x, null, pick(R, ['#2a6a3a', '#3a8a4a', '#1f5a30']), pick(R, ['}', '{', 'v', '^'])), c, 28 + Math.floor(R() * 14)))
    }

    b.push(mover(x, [[0, 0], [1, 0], [0, 0]], 5 + g * 2, -g * 2, leaves.join(''), 'loop'))
  }

  // the owl: a big round body, two eyes that blink
  const owl = [
    '  ^       ^  ',
    ' /##########\\',
    '##############',
    '##  ####  ####',
    '# oo #### oo ##',
    '##  ##vv##  ####',
    ' ##############',
    ' ##:#:#:#:#:###',
    '  #:#:#:#:#:##',
    '   ###:#:###  ',
    '    ## ##     ',
  ]
  const pal = { '#': { fill: '#6a5236', ink: '#a8884e', g: '.:' }, o: { fill: '#ffd23d', ink: '#2a1800', g: 'O' }, ':': { fill: '#8a6a44', ink: '#d8b878', g: ':' }, '^': { fill: '#6a5236', ink: '#a8884e', g: '^' }, v: { fill: '#d88a3a', ink: '#fff', g: 'v' }, '/': { fill: null, ink: '#a8884e', g: '/' }, '\\': { fill: null, ink: '#a8884e', g: '\\' } }
  b.push(...sprite(x, owl, pal, 54, 23, 3))
  b.push(`<g class="cur">${put(tile(x, '#6a5236', '#6a5236', ' '), 57, 27)}${put(tile(x, '#6a5236', '#6a5236', ' '), 58, 27)}${put(tile(x, '#6a5236', '#6a5236', ' '), 65, 27)}${put(tile(x, '#6a5236', '#6a5236', ' '), 66, 27)}</g>`)

  // a moth passes
  b.push(mover(x, [[-4, 16], [30, 10], [60, 18], [96, 8], [124, 14]], 34, -6, phased([put(tile(x, null, '#fff0c0', 'w'), -4, 16), put(tile(x, null, '#fff0c0', 'm'), -3, 16)], 7), 'loop'))
  b.push(...signature(x, name, '#8a6a44', '#ffd23d'))

  return shell(x, { sky: [[0, '#0a1230'], [0.7, '#101c44'], [1, '#0a1428']], veil: '#0a1230', veilA: 0.3, grid: '#8aa0d8', gridA: 0.02, body: b.join('') })
}

// ---------------------------------------------------------------- Sea Turtle
function turtle(name) {
  const x = ctx()
  const R = rng(581)
  const b = []
  x.defs.push('<linearGradient id="rays" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fffbd0" stop-opacity=".5"/><stop offset="1" stop-color="#fffbd0" stop-opacity="0"/></linearGradient>')
  x.kf.push('@keyframes ry{0%,100%{opacity:.3}50%{opacity:1}}')
  x.anim.push('.ry1{animation:ry 9s ease-in-out infinite}.ry2{animation:ry 9s ease-in-out -3s infinite}.ry3{animation:ry 9s ease-in-out -6s infinite}')

  for (const [x0, w, cls] of [[200, 120, 'ry1'], [620, 90, 'ry2'], [1240, 130, 'ry3'], [1640, 100, 'ry1']]) {
    b.push(`<path class="${cls}" d="M${x0} 0 L${x0 + w} 0 L${x0 + w * 2.6} 900 L${x0 - w * 0.8} 900Z" fill="url(#rays)"/>`)
  }

  // the reef
  b.push(ridge(x, R, { base: 47, h: c => 3 + 2 * Math.sin(c / 5) + Math.sin(c / 2), fill: ['#d8a878', '#a87848'], edge: ['#e8c090', '#c89860'], glyphs: '.:', seed: 4 }))

  for (const c of [6, 20, 34, 70, 86, 100, 112]) {
    const col = pick(R, [['#ff6a8a', '#ffd0dc'], ['#ff9a3a', '#ffe0b0'], ['#b06aff', '#e8d0ff']])
    const cor = []

    for (let r = 0; r < 4 + Math.floor(R() * 5); r++) {
      for (let d = -Math.floor(r / 2); d <= Math.floor(r / 2); d++) {
        cor.push(put(tile(x, col[0], col[1], pick(R, ['*', 'Y', 'o'])), c + d, 45 - r))
      }
    }

    b.push(mover(x, [[0, 0], [1, 0], [0, 0]], 5 + R() * 4, -R() * 4, cor.join(''), 'loop'))
  }

  // the turtle: a shell and four flippers that flap
  const shellT = ['  #####  ', ' ##oOo## ', '#########', ' ##oOo## ', '  #####  ']
  const sp = { '#': { fill: '#5a9a4a', ink: '#c8f0a0', g: 'O.' }, o: { fill: '#3a7a3a', ink: '#c8f0a0', g: 'o' }, O: { fill: '#7ab85a', ink: '#fff', g: '+' } }
  const turt = sprite(x, shellT, sp, 0, 0, 3)
  turt.push(put(tile(x, '#a8d070', '#2a4a10', 'o'), 10, 2), put(tile(x, '#a8d070', '#2a4a10', '='), 9, 2))
  const flapA = [put(tile(x, '#7ab85a', '#c8f0a0', '/'), 2, -1), put(tile(x, '#7ab85a', '#c8f0a0', '/'), 7, -1), put(tile(x, '#7ab85a', '#c8f0a0', '\\'), 2, 5), put(tile(x, '#7ab85a', '#c8f0a0', '\\'), 7, 5)]
  const flapB = [put(tile(x, '#7ab85a', '#c8f0a0', '\\'), 1, -1), put(tile(x, '#7ab85a', '#c8f0a0', '\\'), 8, -1), put(tile(x, '#7ab85a', '#c8f0a0', '/'), 1, 5), put(tile(x, '#7ab85a', '#c8f0a0', '/'), 8, 5)]
  const T = turt.join('') + `<g class="cur">${flapA.join('')}</g><g class="cur" style="animation-delay:-.55s">${flapB.join('')}</g>`
  b.push(mover(x, [[-14, 24], [30, 20], [70, 26], [130, 22]], 60, -10, `<g transform="translate(${-14 * CW},${24 * CH})">${T}</g>`, 'loop'))

  for (let i = 0; i < 4; i++) {
    const r = 10 + Math.floor(R() * 24)
    const sc = []

    for (let k = 0; k < 6; k++) {
      sc.push(put(tile(x, null, pick(R, ['#ffd23d', '#ff8a3a']), '>'), -8 + (k % 3) * 2, r + (k % 2)))
    }

    b.push(mover(x, [[-8, r], [126, r - 3]], 34 + i * 10, -i * 12, sc.join(''), 'loop'))
  }

  b.push(...particles(x, R, { n: 50, c: [0, 120], r: [28, 46], dx: 2, dy: -30, dur: [6, 14], glyphs: 'o.O', inks: ['#cfeeff', '#ffffff'] }))
  b.push(...signature(x, name, '#2a7a8a', '#0a5a6a'))

  return shell(x, { sky: [[0, '#3ad0e8'], [0.5, '#1a9ac0'], [1, '#0a5a88']], veil: '#0a4a70', veilA: 0.18, grid: '#cfeeff', gridA: 0.03, body: b.join('') })
}

// ---------------------------------------------------------------- Fox in Snow
function fox(name) {
  const x = ctx()
  const R = rng(591)
  const b = []
  b.push(phased(disc(x, R, 300, 160, 66, (px, py, t) => [lerp('#f8f4e8', '#d8d8d0', t), '#9a98a0'], '.'), 2))
  b.push(dots(x, R, 90, 120, 26, ['#8aa0d8', '#d0dcff']))
  b.push(ridge(x, R, { base: 40, h: c => 7 + 3 * Math.sin(c / 14 + 1) + Math.sin(c / 4), fill: ['#2a3a5a', '#18243e'], edge: ['#3a4e78', '#5a70a0'], glyphs: '^.', seed: 3 }))
  b.push(ridge(x, R, { base: 46, h: c => 4 + 1.5 * Math.sin(c / 9), fill: ['#dde6f4', '#b8c8e0'], edge: ['#f0f6ff', '#9ab0d0'], glyphs: '.,', seed: 4 }))

  for (const [c, h] of [[6, 10], [14, 8], [22, 11], [100, 9], [108, 12], [116, 8]]) {
    b.push(...pine(x, R, c, 43, h, ['#1f4a3a', '#285a46'], '#dde6f4'))
  }

  // the fox trots across, two frames of legs
  const body = ['    /\\   ', '   /##\\_ ', '  ####o## ', '#########>', ' ###### \\ ']
  const pal = { '#': { fill: '#e8742a', ink: '#ffd0a0', g: '.:' }, o: { fill: '#2a1a10', ink: '#fff', g: 'o' }, '>': { fill: '#2a1a10', ink: '#fff', g: '>' }, '/': { fill: null, ink: '#e8742a', g: '/' }, '\\': { fill: null, ink: '#e8742a', g: '\\' }, _: { fill: '#fff', ink: '#e8742a', g: '~' } }
  const fx = sprite(x, body, pal, 0, 0, 3)
  const legsA = [put(tile(x, '#2a1a10', '#fff', '|'), 2, 5), put(tile(x, '#2a1a10', '#fff', '|'), 7, 5)]
  const legsB = [put(tile(x, '#2a1a10', '#fff', '/'), 3, 5), put(tile(x, '#2a1a10', '#fff', '\\'), 6, 5)]
  const F = fx.join('') + `<g class="cur">${legsA.join('')}</g><g class="cur" style="animation-delay:-.55s">${legsB.join('')}</g>`
  b.push(mover(x, [[-12, 41], [40, 42], [80, 41], [130, 42]], 40, -8, `<g transform="translate(${-12 * CW},${38 * CH})">${F}</g>`, 'loop'))

  b.push(...particles(x, R, { n: 100, c: [0, 120], r: [-2, 10], dx: r => 2 + Math.floor(r() * 6), dy: 48, dur: [9, 20], glyphs: '*.', inks: ['#c0d0f0', '#e8f0ff', '#9ab0d8'] }))
  b.push(...signature(x, name, '#6a80a8', '#e8742a'))

  return shell(x, { sky: [[0, '#0a1230'], [0.6, '#16264a'], [1, '#26385e']], veil: '#0a1230', veilA: 0.25, grid: '#8aa0d8', gridA: 0.02, body: b.join('') })
}

export const CREATURES = { koi, jellies, whale, butterflies, cat, birds, fireflies, owl, turtle, fox }
