// Live ASCII-tile wallpaper scenes. Every scene is one SVG built from character tiles on a 16x22 grid:
// tiles shimmer in three phases, packets and tokens step from cell to cell, and nothing here names a project,
// so the pictures stay true however the work changes. Each scene stays under the 131072-character limit.

const CW = 16
const CH = 22
const FONT = 'ui-monospace,SFMono-Regular,Menlo,Consolas,monospace'

function rng(seed) {
  let s = seed >>> 0
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0
    return s / 4294967296
  }
}

const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
const pick = (R, list) => list[Math.floor(R() * list.length)]

function ctx() {
  return { defs: [], ids: new Map(), kf: [], anim: [], n: 0 }
}

// One reusable tile: an optional backing plate and one glyph. Scenes `put` it by reference.
function tile(x, fill, ink, ch) {
  const key = `${fill}|${ink}|${ch}`
  let id = x.ids.get(key)

  if (id === undefined) {
    id = 't' + x.ids.size.toString(36)
    x.ids.set(key, id)
    x.defs.push(
      `<g id="${id}">${fill ? `<rect width="15" height="21" rx="2" fill="${fill}"/>` : ''}<text x="7.5" y="11.5" fill="${ink}">${esc(ch)}</text></g>`,
    )
  }

  return id
}

const put = (id, c, r) => `<use href="#${id}" x="${c * CW}" y="${r * CH}"/>`

// Tiles spread over three shimmer phases, so a shape never pulses as one block.
function phased(items, seed) {
  const R = rng(seed)
  const g = [[], [], []]

  for (const it of items) {
    g[Math.floor(R() * 3)].push(it)
  }

  return g.map((a, i) => `<g class="s${i}">${a.join('')}</g>`).join('')
}

function sprite(x, rows, pal, c0, r0, seed) {
  const R = rng(seed)
  const out = []

  rows.forEach((row, j) => {
    ;[...row].forEach((ch, i) => {
      const p = pal[ch]

      if (p) {
        out.push(put(tile(x, p.fill, p.ink, pick(R, [...p.g])), c0 + i, r0 + j))
      }
    })
  })

  return out
}

function word(x, s, c, r, fill, ink) {
  return [...s].map((ch, i) => (ch === ' ' ? '' : put(tile(x, fill, ink, ch), c + i, r)))
}

// Something that steps cell to cell along a path. `fade` blinks it in and out, `loop` repeats forever
// (for a seamless scroll), `burst` moves once in the first tenth of the cycle (a shooting star).
function mover(x, pts, dur, delay, inner, mode = 'fade') {
  const id = 'm' + x.n++
  const keep = [pts[0]]
  const segs = []

  for (let i = 1; i < pts.length; i++) {
    const last = keep[keep.length - 1]
    const d = Math.max(Math.abs(pts[i][0] - last[0]), Math.abs(pts[i][1] - last[1]))

    if (d > 0) {
      segs.push(d)
      keep.push(pts[i])
    }
  }

  if (keep.length < 2) {
    return inner
  }

  const total = segs.reduce((a, b) => a + b, 0)
  const at = p => `translate(${(p[0] - keep[0][0]) * CW}px,${(p[1] - keep[0][1]) * CH}px)`
  const span = mode === 'burst' ? 10 : 100
  const frames = []
  let acc = 0

  for (let i = 0; i < keep.length; i++) {
    frames.push(
      `${((acc / total) * span).toFixed(2)}%{transform:${at(keep[i])}${i < segs.length ? `;animation-timing-function:steps(${segs[i]},end)` : ''}}`,
    )

    if (i < segs.length) {
      acc += segs[i]
    }
  }

  if (mode === 'burst') {
    frames.push(`100%{transform:${at(keep[keep.length - 1])}}`)
  }

  x.kf.push(`@keyframes ${id}{${frames.join('')}}`)
  const extra = mode === 'fade' ? `,fd ${dur}s linear ${delay}s infinite` : mode === 'burst' ? `,bu ${dur}s linear ${delay}s infinite` : ''
  x.anim.push(`.${id}{animation:${id} ${dur}s linear ${delay}s infinite${extra}}`)

  return `<g class="${id}">${inner}</g>`
}

function trace(x, pts, fill, ink, gh = '=', gv = '|') {
  const out = []
  const th = tile(x, fill, ink, gh)
  const tv = tile(x, fill, ink, gv)

  for (let i = 1; i < pts.length; i++) {
    const [c0, r0] = pts[i - 1]
    const [c1, r1] = pts[i]

    if (r0 === r1) {
      for (let c = Math.min(c0, c1); c <= Math.max(c0, c1); c++) {
        out.push(put(th, c, r0))
      }
    } else {
      for (let r = Math.min(r0, r1); r <= Math.max(r0, r1); r++) {
        out.push(put(tv, c0, r))
      }
    }
  }

  return out
}

function clip(x, id, c, r, w, h) {
  x.defs.push(`<clipPath id="${id}"><rect x="${c * CW}" y="${r * CH}" width="${w * CW}" height="${h * CH}"/></clipPath>`)
}

// A chip die: package ring, pins, and a grid of processing elements lit by a diagonal wave.
function die(x, o) {
  const out = []
  const pk = tile(x, o.backed ? o.pkg : null, o.pkgInk, '#')
  const ph = tile(x, null, o.pin, '|')
  const pv = tile(x, null, o.pin, '-')

  for (let i = 0; i < o.w; i++) {
    out.push(put(pk, o.c + i, o.r), put(pk, o.c + i, o.r + o.h - 1))
  }

  for (let j = 1; j < o.h - 1; j++) {
    out.push(put(pk, o.c, o.r + j), put(pk, o.c + o.w - 1, o.r + j))
  }

  for (let i = 2; i < o.w - 2; i += 2) {
    out.push(put(ph, o.c + i, o.r - 1), put(ph, o.c + i, o.r + o.h))
  }

  for (let j = 2; j < o.h - 2; j += 2) {
    out.push(put(pv, o.c - 1, o.r + j), put(pv, o.c + o.w, o.r + j))
  }

  const nx = Math.floor((o.w - 6) / 3)
  const ny = Math.floor((o.h - 4) / 2)
  const base = ['M', 'A'].map(ch => tile(x, o.backed ? o.pe : null, o.peInk, ch))
  const hot = ['M', 'A'].map(ch => tile(x, o.backed ? o.hot : null, o.hotInk, ch))

  for (let j = 0; j < ny; j++) {
    for (let i = 0; i < nx; i++) {
      const c = o.c + 3 + i * 3
      const r = o.r + 2 + j * 2
      out.push(put(base[0], c, r), put(base[1], c + 1, r))
      out.push(`<g class="hot" style="animation-delay:${((i + j) * 0.2).toFixed(2)}s">${put(hot[0], c, r)}${put(hot[1], c + 1, r)}</g>`)
    }
  }

  return out
}

// A scrolling signal: a periodic 8-cell line stepping left, clipped to `w` cells.
function scope(x, c, r, w, line, fill, ink, dur) {
  const id = 'cs' + x.n++
  clip(x, id, c, r, w, 1)
  const items = []

  for (let i = 0; i < w + 8; i++) {
    const ch = line[i % line.length]
    items.push(put(tile(x, fill, ink, ch), c + i, r))
  }

  return `<g clip-path="url(#${id})">${mover(x, [[c, r], [c - 8, r]], dur, 0, items.join(''), 'loop')}</g>`
}

function shell(x, o) {
  const css =
    `text{font:500 14px ${FONT};text-anchor:middle;dominant-baseline:central}` +
    '.hot{opacity:0}' +
    '@keyframes sh{0%,100%{opacity:1}50%{opacity:.45}}' +
    '@keyframes fd{0%{opacity:0}8%{opacity:1}88%{opacity:1}100%{opacity:0}}' +
    '@keyframes bu{0%{opacity:0}1%{opacity:1}9%{opacity:1}10%,100%{opacity:0}}' +
    '@keyframes hot{0%,100%{opacity:0}28%{opacity:1}55%{opacity:0}}' +
    '@keyframes bl{0%,49%{opacity:1}50%,100%{opacity:0}}' +
    '@keyframes glow{0%,100%{opacity:.7}50%{opacity:1}}' +
    x.kf.join('') +
    '@media (prefers-reduced-motion:no-preference){' +
    '.s0{animation:sh 3.4s ease-in-out infinite}.s1{animation:sh 4.3s ease-in-out -1.4s infinite}.s2{animation:sh 5.5s ease-in-out -2.9s infinite}' +
    '.hot{animation:hot 3.2s ease-in-out infinite}.cur{animation:bl 1.1s steps(1) infinite}.gl{animation:glow 7s ease-in-out infinite}' +
    x.anim.join('') +
    '}'

  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080" width="100%" height="100%" preserveAspectRatio="xMidYMid slice">` +
    `<style>${css}</style><defs>` +
    `<linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${o.bg[0]}"/><stop offset="1" stop-color="${o.bg[1]}"/></linearGradient>` +
    `<linearGradient id="vl" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${o.veil}" stop-opacity="0"/><stop offset=".12" stop-color="${o.veil}" stop-opacity="${o.veilA}"/><stop offset=".88" stop-color="${o.veil}" stop-opacity="${o.veilA}"/><stop offset="1" stop-color="${o.veil}" stop-opacity="0"/></linearGradient>` +
    `<pattern id="gr" width="16" height="22" patternUnits="userSpaceOnUse"><path d="M0 .5h16M.5 0v22" stroke="${o.grid}" stroke-opacity="${o.gridA}" fill="none"/></pattern>` +
    (o.defs || '') +
    x.defs.join('') +
    `</defs><rect width="1920" height="1080" fill="url(#bg)"/><rect width="1920" height="1080" fill="url(#gr)"/>` +
    o.body +
    `<rect width="1920" height="1080" fill="url(#vl)"/></svg>`
  )
}

const signature = (x, name, ink, fill, c = 4, r = 46) => [
  ...word(x, `~/${name}`, c, r, null, ink),
  `<g class="cur">${put(tile(x, fill, fill, ' '), c + name.length + 3, r)}</g>`,
]

// ---------------------------------------------------------------- Silicon
function silicon(name) {
  const x = ctx()
  const R = rng(11)
  const b = []
  const P = { cu: '#c98a45', cu2: '#8f5a26', t1: '#35d6b8', t3: '#103f39', hot: '#a6fff0' }

  b.push(
    ...die(x, { c: 82, r: 5, w: 31, h: 21, pkg: P.cu2, pkgInk: '#24140a', pin: P.cu, pe: '#14504a', peInk: '#6cf0d6', hot: P.hot, hotInk: '#052a24', backed: true }),
  )
  b.push(
    ...die(x, { c: 6, r: 12, w: 19, h: 11, pkg: '#6b4420', pkgInk: '#24140a', pin: '#a06a30', pe: '#124640', peInk: '#4fe0c4', hot: P.hot, hotInk: '#052a24', backed: true }),
  )

  const flows = [
    { p: [[81, 7], [60, 7], [60, 3], [44, 3]], d: 8, t: 0, rev: false },
    { p: [[81, 11], [66, 11], [66, 15], [50, 15], [50, 12], [34, 12]], d: 11, t: 2, rev: true },
    { p: [[81, 15], [72, 15]], d: 3, t: 1, rev: true },
    { p: [[81, 19], [58, 19], [58, 25], [40, 25]], d: 10, t: 4, rev: false },
    { p: [[81, 23], [70, 23], [70, 30], [52, 30], [52, 34], [30, 34]], d: 13, t: 6, rev: true },
    { p: [[113, 9], [119, 9]], d: 2.4, t: 0, rev: false },
    { p: [[113, 15], [119, 15]], d: 2.8, t: 1.2, rev: true },
    { p: [[113, 21], [119, 21]], d: 2.2, t: 0.6, rev: false },
    { p: [[90, 26], [90, 34], [100, 34], [100, 41]], d: 7, t: 3, rev: false },
    { p: [[104, 26], [104, 31], [119, 31]], d: 6, t: 5, rev: true },
    { p: [[25, 15], [30, 15], [30, 12]], d: 2.6, t: 0, rev: false },
  ]
  const one = tile(x, P.t1, '#052a24', '1')
  const zero = tile(x, P.t1, '#052a24', '0')

  for (const f of flows) {
    b.push(...trace(x, f.p, '#3b2410', '#b77a3c'))
    const path = f.rev ? [...f.p].reverse() : f.p
    const [c0, r0] = path[0]
    b.push(mover(x, path, f.d, -f.t, put(one, c0, r0) + put(zero, c0 + 1, r0)))
  }

  // an SRAM bank, hex cells twinkling
  const hex = []

  for (let j = 0; j < 7; j++) {
    for (let i = 0; i < 18; i++) {
      hex.push(put(tile(x, '#34200f', '#c98a45', pick(R, [...'0123456789abcdef'])), 4 + i, 35 + j))
    }
  }

  b.push(phased(hex, 5), ...word(x, 'SRAM', 4, 34, null, P.cu2))

  // bit streams falling down the left edge
  const tail = ['#a6fff0', '#35d6b8', '#27a891', '#1c7a69', '#14584d', '#0f3d36']

  for (let k = 0; k < 5; k++) {
    const c = 2 + k * 4 + (k % 2)
    const col = tail.map((ink, j) => put(tile(x, null, ink, pick(R, ['0', '1'])), c, j)).join('')
    b.push(mover(x, [[c, -7], [c, 31]], 8 + k * 1.7, -k * 2.3, col))
  }

  const dust = []

  for (let i = 0; i < 44; i++) {
    dust.push(put(tile(x, null, i % 3 ? '#2a6a5e' : '#7d5426', pick(R, [...'0123456789abcdef+.'])), 34 + Math.floor(R() * 84), Math.floor(R() * 34)))
  }

  b.push(phased(dust, 9), ...signature(x, name, P.cu2, P.cu))

  return shell(x, { bg: ['#101a17', '#090e0d'], veil: '#080d0c', veilA: 0.5, grid: '#7fd6c4', gridA: 0.035, body: b.join('') })
}

// ---------------------------------------------------------------- Attention
function attn(x, c0, r0, n, kind, lv, inkLo, inkHi, seed, sweepFill) {
  const R = rng(seed)
  const out = []
  const glyphs = ['.', ':', '+', '*', '#']
  const tiles = []

  for (let i = 0; i < n; i++) {
    for (let j = 0; j <= i; j++) {
      let s

      if (kind === 'causal') {
        s = Math.exp(-(i - j) / 4.5) * 0.7 + (j === 0 ? 0.55 : 0) + R() * 0.35
      } else {
        const d = i - j
        s = (d <= 2 ? 0.9 - d * 0.15 : 0) + (d > 0 && d % 8 === 0 ? 0.7 : 0) + R() * 0.15
      }

      const l = s > 0.85 ? 4 : s > 0.6 ? 3 : s > 0.38 ? 2 : s > 0.18 ? 1 : 0
      tiles.push(put(tile(x, lv[l], l < 2 ? inkLo : inkHi, glyphs[l]), c0 + j, r0 + i))
    }
  }

  out.push(phased(tiles, seed))

  // token letters along both axes
  const T = rng(seed + 1)
  const letters = [...'etaoinshrdlucmfwypvbgkq']

  for (let i = 0; i < n; i++) {
    out.push(put(tile(x, null, inkLo, pick(T, letters)), c0 + i, r0 - 2), put(tile(x, null, inkLo, pick(T, letters)), c0 - 2, r0 + i))
  }

  // the query row, sweeping down inside the causal triangle
  const id = 'ca' + seed
  x.defs.push(`<clipPath id="${id}"><polygon points="${c0 * CW},${r0 * CH} ${c0 * CW},${(r0 + n) * CH} ${(c0 + n) * CW},${(r0 + n) * CH}"/></clipPath>`)
  const bar = `<rect x="${c0 * CW}" y="${r0 * CH}" width="${n * CW}" height="${CH}" fill="${sweepFill}" fill-opacity=".28"/>`
  out.push(`<g clip-path="url(#${id})">${mover(x, [[c0, r0], [c0, r0 + n - 1]], 13, -seed % 9, bar, 'loop')}</g>`)

  return out
}

function attention(name) {
  const x = ctx()
  const R = rng(23)
  const b = []
  const violet = ['#1a1640', '#3d3485', '#6a5cd6', '#a496ff', '#e0daff']
  const amber = ['#2b2013', '#6d4a1c', '#b07a2a', '#e8ab45', '#ffe0a3']

  b.push(...attn(x, 7, 9, 22, 'causal', violet, '#5b50b5', '#0d0a24', 31, '#ffb454'))
  b.push(...attn(x, 92, 19, 22, 'band', amber, '#8a6224', '#241706', 47, '#a496ff'))

  // tokens drifting through, one cell at a time
  const toks = ['the', 'of', 'to', 'and', 'in', 'is', 'it', 'for', 'on', 'as', 'at', 'by']

  for (let i = 0; i < 9; i++) {
    const w = toks[i % toks.length]
    const left = i % 2 === 0
    const c = left ? 3 + Math.floor(R() * 24) : 90 + Math.floor(R() * 24)
    const r = left ? 33 + Math.floor(R() * 11) : 2 + Math.floor(R() * 12)
    const fill = left ? '#2c2563' : '#4a3515'
    const ink = left ? '#c7beff' : '#ffd691'
    const inner = [...w].map((ch, k) => put(tile(x, fill, ink, ch), c + k, r)).join('')
    b.push(mover(x, [[c, r], [c + (left ? 14 : -14), r - 3]], 26 + i * 2, -i * 4, inner))
  }

  const dust = []

  for (let i = 0; i < 40; i++) {
    dust.push(put(tile(x, null, i % 2 ? '#4a4290' : '#6d4f1d', pick(R, [...'.:+'])), Math.floor(R() * 120), Math.floor(R() * 46)))
  }

  b.push(phased(dust, 3), ...signature(x, name, '#6a5cd6', '#a496ff'))

  return shell(x, { bg: ['#14102c', '#0a0816'], veil: '#09071a', veilA: 0.5, grid: '#a496ff', gridA: 0.04, body: b.join('') })
}

// ---------------------------------------------------------------- Iron
const DIGITS = {
  1: ['010', '110', '010', '010', '111'],
  2: ['111', '001', '111', '100', '111'],
  3: ['111', '001', '111', '001', '111'],
  4: ['101', '101', '111', '001', '001'],
  5: ['111', '100', '111', '001', '111'],
  6: ['111', '100', '111', '101', '111'],
  7: ['111', '001', '001', '010', '010'],
  8: ['111', '101', '111', '101', '111'],
}

function iron(name) {
  const x = ctx()
  const R = rng(5)
  const b = []
  const lift = []
  const block = (c, r0, r1, fill, ink, g, w = 1) => {
    for (let r = r0; r <= r1; r++) {
      for (let k = 0; k < w; k++) {
        lift.push(put(tile(x, fill, ink, pick(R, [...g])), c + k, r))
      }
    }
  }

  // rack upright and floor boards
  b.push(...trace(x, [[70, 5], [70, 43]], '#34291f', '#7d6a5a', '-', '|'))
  b.push(...trace(x, [[50, 44], [119, 44]], '#3a2e25', '#8a7868', '_', '_'))
  b.push(...trace(x, [[50, 45], [119, 45]], '#241b16', '#5a4a3e', '=', '='))

  // plates, big to small, then the collar and the bar running off the right edge
  block(80, 25, 43, '#7a6a5f', '#2a211d', '|')
  block(81, 25, 43, '#4f433c', '#9a897d', '#%', 2)
  block(83, 28, 40, '#7a6a5f', '#2a211d', '|')
  block(84, 28, 40, '#62544b', '#b3a295', '#%', 2)
  block(86, 31, 37, '#8a7a6d', '#2a211d', '|')
  block(87, 31, 37, '#76675c', '#cdbdaf', '#%')
  block(88, 33, 35, '#e4ded4', '#4a453f', '#')

  for (let c = 74; c < 126; c++) {
    if (c < 80 || c > 88) {
      lift.push(put(tile(x, '#c9c3b9', '#4a453f', '='), c, 34))
    }
  }

  lift.push(...word(x, '45', 81, 33, null, '#ffb089'))

  // one rep: drive up, hold, lower slowly, rest
  x.kf.push(
    '@keyframes rep{0%{transform:translateY(0);animation-timing-function:steps(7,end)}22%{transform:translateY(-154px)}40%{transform:translateY(-154px);animation-timing-function:steps(7,end)}72%{transform:translateY(0)}100%{transform:translateY(0)}}',
  )
  x.anim.push('.rep{animation:rep 7s linear infinite}')
  b.push(`<g class="rep">${lift.join('')}</g>`)

  // chalk lifting off the bar at the top of each rep
  for (let i = 0; i < 18; i++) {
    const c = 76 + Math.floor(R() * 14)
    const r = 33 - Math.floor(R() * 3)
    b.push(mover(x, [[c, r], [c + Math.floor(R() * 5) - 2, r - 8]], 5 + R() * 3, -R() * 8, put(tile(x, null, '#f6f1e7', pick(R, ['.', '`', ',', "'"])), c, r)))
  }

  // a big rep counter, one count per lift
  b.push(...word(x, 'REP', 8, 8, null, '#9a6b50'), ...word(x, '/ 8', 15, 8, null, '#6d4a38'))

  for (let k = 1; k <= 8; k++) {
    const a = (k - 1) * 12.5
    const e = a + 12.5
    const frames = k === 1 ? '0%{opacity:1}' : `0%,${a}%{opacity:0}${(a + 0.01).toFixed(2)}%{opacity:1}`
    x.kf.push(`@keyframes dg${k}{${frames}${(e - 0.01).toFixed(2)}%{opacity:1}${e}%${e === 100 ? '' : ',100%'}{opacity:0}}`)
    x.anim.push(`.dg${k}{animation:dg${k} 56s linear infinite}`)
    const px = []

    DIGITS[k].forEach((row, j) => {
      ;[...row].forEach((v, i) => {
        if (v === '1') {
          for (let dy = 0; dy < 2; dy++) {
            for (let dx = 0; dx < 2; dx++) {
              px.push(put(tile(x, '#ff7a3d', '#3a1608', pick(R, ['#', '%', '@'])), 8 + i * 2 + dx, 10 + j * 2 + dy))
            }
          }
        }
      })
    })
    b.push(`<g class="dg${k}" style="opacity:${k === 1 ? 1 : 0}">${px.join('')}</g>`)
  }

  const dust = []

  for (let i = 0; i < 40; i++) {
    dust.push(put(tile(x, null, i % 3 ? '#5a4a3e' : '#9a4a22', pick(R, [...'.,:'])), Math.floor(R() * 120), Math.floor(R() * 44)))
  }

  b.push(phased(dust, 8), ...signature(x, name, '#9a6b50', '#ff7a3d'))

  const glow = '<radialGradient id="em" cx=".84" cy=".8" r=".62"><stop offset="0" stop-color="#ff7a3d" stop-opacity=".46"/><stop offset=".5" stop-color="#ff7a3d" stop-opacity=".12"/><stop offset="1" stop-color="#ff7a3d" stop-opacity="0"/></radialGradient>'
  const body = `<rect class="gl" width="1920" height="1080" fill="url(#em)"/>` + b.join('')

  return shell(x, { bg: ['#211815', '#0d0908'], veil: '#0a0706', veilA: 0.45, grid: '#ffb089', gridA: 0.035, defs: glow, body })
}

// ---------------------------------------------------------------- Night shift
function night(name) {
  const x = ctx()
  const R = rng(17)
  const b = []

  const glow = '<radialGradient id="mg" cx=".87" cy=".16" r=".28"><stop offset="0" stop-color="#f1e6c0" stop-opacity=".26"/><stop offset="1" stop-color="#f1e6c0" stop-opacity="0"/></radialGradient>'
  b.push(`<rect class="gl" width="1920" height="1080" fill="url(#mg)"/>`)

  // stars
  const stars = []

  for (let i = 0; i < 90; i++) {
    stars.push(put(tile(x, null, pick(R, ['#cfd6ff', '#9aa6e8', '#fff1c9', '#7482c4']), pick(R, ['.', '.', '+', '*'])), Math.floor(R() * 120), Math.floor(R() * 30)))
  }

  b.push(phased(stars, 2))

  // the crescent: a disc minus an offset disc, in tiles
  const moon = []

  for (let r = 0; r < 14; r++) {
    for (let c = 0; c < 18; c++) {
      const px = (96 + c) * CW + 8
      const py = (3 + r) * CH + 11
      const a = Math.hypot(px - 1700, py - 190)
      const o = Math.hypot(px - 1745, py - 168)

      if (a < 122 && o > 112) {
        moon.push(put(tile(x, a > 108 ? '#c9bd96' : '#ecdfb4', '#6d6240', pick(R, ['.', ':', '`'])), 96 + c, 3 + r))
      }
    }
  }

  b.push(phased(moon, 4))

  // clouds sliding past, one cell at a time
  const cloud = ['  ######  ', ' ######## ', '##########']
  const cpal = { '#': { fill: '#26336b', ink: '#5a6bb5', g: 'SNS~' } }
  const small = [' ####  ', '#######']

  for (let i = 0; i < 4; i++) {
    const rows = i % 2 ? small : cloud
    const r = 4 + i * 6
    const sp = sprite(x, rows, cpal, -12, r, 20 + i)
    b.push(mover(x, [[-12, r], [122, r]], 150 + i * 25, -i * 41, sp.join('')))
  }

  // code scrolling up the left, two copies for a seamless loop
  const lines = []
  const ink = ['#7ee2a8', '#8fb5ff', '#ff9ad5', '#5a679f', '#ffd27a', '#c9d1f5']

  for (let i = 0; i < 22; i++) {
    const indent = pick(R, [0, 0, 2, 2, 4, 6])
    let c = 4 + indent
    const row = []
    const words = 2 + Math.floor(R() * 3)

    for (let w = 0; w < words; w++) {
      const len = 2 + Math.floor(R() * 6)
      const color = pick(R, ink)

      for (let k = 0; k < len; k++) {
        row.push([c + k, color, pick(R, [...'abcdefghilmnoprstuvxy_(){};='])])
      }

      c += len + 1
    }

    lines.push(row)
  }

  const clipId = 'cc'
  clip(x, clipId, 3, 33, 44, 11)
  const block = off => lines.map((row, i) => row.map(([c, color, ch]) => put(tile(x, null, color, ch), c, 33 + i + off)).join('')).join('')
  const scroll = mover(x, [[0, 0], [0, -22]], 66, 0, block(0) + block(22), 'loop')
  b.push(`<g clip-path="url(#${clipId})">${scroll}</g>`)

  // a prompt under it, cursor blinking
  b.push(...word(x, `${name}@night:~$`, 4, 45, null, '#7ee2a8'))
  b.push(`<g class="cur">${put(tile(x, '#7ee2a8', '#7ee2a8', ' '), 4 + name.length + 10, 45)}</g>`)

  // a shooting star every so often
  const trail = [
    [0, 0, '*', '#fff1c9'],
    [-1, -1, '+', '#cfd6ff'],
    [-2, -1, '.', '#9aa6e8'],
    [-3, -2, '.', '#7482c4'],
  ]
  const star = (c, r) => trail.map(([dc, dr, ch, ink]) => put(tile(x, null, ink, ch), c + dc, r + dr)).join('')
  b.push(mover(x, [[60, 3], [82, 14]], 23, -4, star(60, 3), 'burst'))
  b.push(mover(x, [[36, 2], [52, 10]], 31, -19, star(36, 2), 'burst'))

  return shell(x, { bg: ['#0f1738', '#05081a'], veil: '#060a1c', veilA: 0.45, grid: '#8fa0ff', gridA: 0.03, defs: glow, body: b.join('') })
}

// ---------------------------------------------------------------- Blueprint (light)
function blueprint(name) {
  const x = ctx()
  const R = rng(29)
  const b = []
  const INK = '#123f66'
  const MID = '#2f6a9c'
  const PALE = '#6f9cc4'
  const RED = '#d1493f'

  b.push(...die(x, { c: 8, r: 10, w: 31, h: 21, pkg: '#1d4f7a', pkgInk: '#a9cbe6', pin: MID, pe: '#c7dff0', peInk: INK, hot: RED, hotInk: '#ffffff', backed: true }))

  // dimension lines around the die
  const dim = (c, r, len, label) => {
    const out = [put(tile(x, null, MID, '|'), c, r), put(tile(x, null, MID, '|'), c + len, r), put(tile(x, null, MID, '<'), c + 1, r), put(tile(x, null, MID, '>'), c + len - 1, r)]

    for (let i = 2; i < len - 1; i++) {
      out.push(put(tile(x, null, MID, '-'), c + i, r))
    }

    const mid = c + Math.floor((len - label.length) / 2)
    out.push(...word(x, label, mid, r, '#e6f0f9', INK))

    return out
  }

  b.push(...dim(8, 7, 31, ' 31 CELLS '), ...word(x, 'FIG. 1  PROCESSING ARRAY', 8, 5, null, INK))

  const flows = [
    { p: [[39, 14], [58, 14], [58, 8], [74, 8]], d: 9, t: 0 },
    { p: [[39, 20], [52, 20], [52, 26], [70, 26]], d: 8, t: 3 },
    { p: [[7, 16], [2, 16], [2, 38]], d: 6, t: 1 },
    { p: [[20, 32], [20, 38], [38, 38], [38, 42]], d: 7, t: 4 },
  ]
  const one = tile(x, null, RED, '1')
  const zero = tile(x, null, RED, '0')

  for (const f of flows) {
    b.push(...trace(x, f.p, null, MID, '-', '|'))
    b.push(mover(x, f.p, f.d, -f.t, put(one, f.p[0][0], f.p[0][1]) + put(zero, f.p[0][0] + 1, f.p[0][1])))
  }

  // scrolling clock and data, top right
  b.push(...word(x, 'CLK', 93, 4, null, MID), ...word(x, 'DAT', 93, 8, null, MID))
  b.push(scope(x, 98, 4, 18, '|¯¯¯|___', null, INK, 2.4))
  b.push(scope(x, 98, 8, 18, '|¯¯|_|¯¯|_|¯__', null, RED, 4.8))

  // a rotating ring, drawn in tiles, with a dot going around it
  const ring = []
  const cx = 104
  const cy = 20

  for (let a = 0; a < 48; a++) {
    const t = (a / 48) * Math.PI * 2
    ring.push(put(tile(x, null, PALE, 'o'), Math.round(cx + Math.cos(t) * 9), Math.round(cy + Math.sin(t) * 5.4)))
  }

  b.push(phased(ring, 3))
  const orbit = []

  for (let a = 0; a < 16; a++) {
    const t = (a / 16) * Math.PI * 2
    orbit.push([Math.round(cx + Math.cos(t) * 9), Math.round(cy + Math.sin(t) * 5.4)])
  }

  orbit.push(orbit[0])
  b.push(mover(x, orbit, 12, 0, put(tile(x, RED, '#fff', '*'), orbit[0][0], orbit[0][1]), 'loop'))
  b.push(put(tile(x, null, MID, '+'), cx, cy), ...[-12, 12].map(d => put(tile(x, null, MID, '-'), cx + d, cy)))

  // title block
  const c0 = 86
  const r0 = 38
  const w = 30

  for (let i = 0; i < w; i++) {
    b.push(put(tile(x, null, INK, i === 0 || i === w - 1 ? '+' : '-'), c0 + i, r0), put(tile(x, null, INK, i === 0 || i === w - 1 ? '+' : '-'), c0 + i, r0 + 7))
  }

  for (let j = 1; j < 7; j++) {
    b.push(put(tile(x, null, INK, '|'), c0, r0 + j), put(tile(x, null, INK, '|'), c0 + w - 1, r0 + j))
  }

  b.push(...word(x, name.toUpperCase(), c0 + 2, r0 + 1, null, INK), ...word(x, 'SILICON STUDY', c0 + 2, r0 + 3, null, MID), ...word(x, 'SCALE 1:1   REV A', c0 + 2, r0 + 5, null, MID))

  // registration marks, breathing
  const marks = []

  for (const [c, r] of [[1, 1], [116, 1], [1, 46], [116, 46]]) {
    marks.push(...word(x, '(+)', c, r, null, PALE))
  }

  b.push(phased(marks, 6))

  const dust = []

  for (let i = 0; i < 36; i++) {
    dust.push(put(tile(x, null, PALE, pick(R, ['.', '+', ':'])), Math.floor(R() * 120), Math.floor(R() * 47)))
  }

  b.push(phased(dust, 7), ...signature(x, name, INK, RED))

  return shell(x, { bg: ['#d3e5f4', '#e9f2fa'], veil: '#eaf3fb', veilA: 0.5, grid: '#1d4f7a', gridA: 0.09, body: b.join('') })
}

// ---------------------------------------------------------------- helpers for the newer scenes
const hex2 = n => Math.round(n).toString(16).padStart(2, '0')

function lerp(a, b, t) {
  const p = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16))
  const [A, B] = [p(a), p(b)]

  return '#' + A.map((v, i) => hex2(v + (B[i] - v) * Math.max(0, Math.min(1, t)))).join('')
}

// brightness that travels: tiles bucketed by column, each bucket a beat later than the last
function wavy(x, buckets, step) {
  return buckets.map((arr, i) => `<g class="aw" style="animation-delay:${(-i * step).toFixed(2)}s">${arr.join('')}</g>`).join('')
}

function stars(x, R, n, rows, cols, inks) {
  const out = []

  for (let i = 0; i < n; i++) {
    out.push(put(tile(x, null, pick(R, inks), pick(R, ['.', '.', '+', '*'])), Math.floor(R() * cols), Math.floor(R() * rows)))
  }

  return out
}

// ---------------------------------------------------------------- Code rain
function codeRain(name) {
  const x = ctx()
  const R = rng(41)
  const b = []
  const glyphs = [...'01{}()<>=+*/\\|;:#$%&@[]']
  const tail = ['#eaffef', '#7dffb0', '#3dff8a', '#27c76a', '#1b8f4e', '#136a39', '#0d4a28', '#0a3a20']

  for (let c = 0; c < 120; c++) {
    const edge = Math.min(c, 119 - c)

    if (R() > (edge < 28 ? 0.9 : 0.16)) {
      continue
    }

    const len = 8 + Math.floor(R() * 7)
    const r0 = -len - 1
    const dur = 5 + R() * 8
    let col = ''

    for (let j = 0; j < len; j++) {
      col += put(tile(x, null, tail[Math.min(len - 1 - j, tail.length - 1)], pick(R, glyphs)), c, r0 + j)
    }

    b.push(mover(x, [[c, r0], [c, 49]], dur, -R() * dur, col))
  }

  const ghost = []

  for (let i = 0; i < 90; i++) {
    ghost.push(put(tile(x, null, '#145a33', pick(R, glyphs)), Math.floor(R() * 120), Math.floor(R() * 46)))
  }

  b.push(phased(ghost, 4), ...signature(x, name, '#27c76a', '#3dff8a'))

  return shell(x, { bg: ['#04120a', '#010603'], veil: '#020a05', veilA: 0.55, grid: '#3dff8a', gridA: 0.03, body: b.join('') })
}

// ---------------------------------------------------------------- Outrun
function outrun(name) {
  const x = ctx()
  const R = rng(53)
  const b = []
  const hz = '<linearGradient id="hz" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ff4fd8" stop-opacity=".0"/><stop offset=".25" stop-color="#ff4fd8" stop-opacity=".32"/><stop offset="1" stop-color="#ff4fd8" stop-opacity="0"/></linearGradient>'
  b.push(`<rect class="gl" y="650" width="1920" height="170" fill="url(#hz)"/>`)
  b.push(phased(stars(x, R, 70, 22, 120, ['#cfc2ff', '#ff9ae8', '#9ff2ff']), 2))

  // the sun: a disc of tiles, warm at the top, pink at the bottom, sliced
  const sun = []

  for (let r = 6; r < 33; r++) {
    for (let c = 76; c < 120; c++) {
      const px = c * CW + 8
      const py = r * CH + 11

      if (Math.hypot(px - 1560, py - 470) < 215 && !(r > 20 && (r - 20) % 4 === 3)) {
        const fill = lerp('#ffd447', '#ff3d9a', (py - 255) / 430)
        sun.push(put(tile(x, fill, lerp(fill, '#3a0a2a', 0.5), pick(R, ['.', ':', '-'])), c, r))
      }
    }
  }

  b.push(phased(sun, 6))

  // mountains
  const mt = []

  for (const [pc, h] of [[8, 9], [22, 6], [34, 7]]) {
    for (let i = -h; i <= h; i++) {
      const c = pc + i

      if (c >= 0 && c < 120) {
        for (let r = 33 - (h - Math.abs(i)); r < 33; r++) {
          mt.push(put(tile(x, '#1d0b3a', '#3d1f6e', r === 33 - (h - Math.abs(i)) ? '^' : '.'), c, r))
        }
      }
    }
  }

  b.push(mt.join(''))

  // the grid: rays from the vanishing point, and rows rolling toward you
  const rays = []

  for (let k = -14; k <= 14; k++) {
    for (let r = 34; r < 48; r++) {
      const c = Math.round(96 + k * (r - 33) * 0.9)

      if (c >= 0 && c < 120) {
        rays.push(put(tile(x, null, '#e060ff', k < 0 ? '/' : k > 0 ? '\\' : '|'), c, r))
      }
    }
  }

  b.push(phased(rays, 8))

  for (let i = 0; i < 6; i++) {
    const row = []

    for (let c = 0; c < 120; c++) {
      row.push(put(tile(x, null, '#5af0ff', '='), c, 34))
    }

    b.push(mover(x, [[0, 34], [0, 47]], 5.4, -i * 0.9, row.join('')))
  }

  b.push(...signature(x, name, '#c43cff', '#38e8ff'))

  return shell(x, { bg: ['#12052e', '#3d0b52'], veil: '#0d031f', veilA: 0.45, grid: '#ff4fd8', gridA: 0.03, defs: hz, body: b.join('') })
}

// ---------------------------------------------------------------- Aurora
function aurora(name) {
  const x = ctx()
  const R = rng(61)
  const b = []
  b.push(phased(stars(x, R, 110, 30, 120, ['#cfe9ff', '#9ad0e8', '#e8fff6']), 3))

  const bands = [
    { base: 9, amp: 4, per: 70, ph: 0, cols: ['#0b3a34', '#157a68', '#5dffb0', '#157a68', '#0b3a34'], ink: '#d9fff0' },
    { base: 15, amp: 3, per: 55, ph: 2, cols: ['#1c1c5a', '#4136b0', '#9b8cff', '#4136b0', '#1c1c5a'], ink: '#e6e1ff' },
    { base: 5, amp: 3, per: 90, ph: 4, cols: ['#0a2e3c', '#12708a', '#4fd8f0', '#12708a', '#0a2e3c'], ink: '#dff8ff' },
  ]
  const buckets = Array.from({ length: 12 }, () => [])

  for (const band of bands) {
    for (let c = 0; c < 120; c++) {
      const ctr = band.base + band.amp * Math.sin((2 * Math.PI * c) / band.per + band.ph) + 1.5 * Math.sin((2 * Math.PI * c) / 23 + band.ph * 2)

      for (let d = -2; d <= 2; d++) {
        buckets[Math.floor(c / 10)].push(put(tile(x, band.cols[d + 2], band.ink, pick(R, ['|', ':', '!', 'l'])), c, Math.round(ctr) + d))
      }
    }
  }

  x.anim.push('.aw{animation:sh 6.6s ease-in-out infinite}')
  b.push(wavy(x, buckets, 0.55))

  // pines along the ridge
  const pines = []

  for (let i = 0; i < 34; i++) {
    const c = R() < 0.5 ? Math.floor(R() * 30) : 90 + Math.floor(R() * 30)
    const h = 4 + Math.floor(R() * 6)

    for (let k = 0; k < h; k++) {
      for (let w = -Math.floor(k / 2); w <= Math.floor(k / 2); w++) {
        pines.push(put(tile(x, '#06131a', '#134050', k === 0 ? '^' : 'A'), c + w, 48 - h + k))
      }
    }
  }

  b.push(pines.join(''), ...signature(x, name, '#2dd4bf', '#5dffb0'))

  return shell(x, { bg: ['#07121c', '#04080f'], veil: '#050c14', veilA: 0.42, grid: '#5dffb0', gridA: 0.025, body: b.join('') })
}

// ---------------------------------------------------------------- Orbit
function orbit(name) {
  const x = ctx()
  const R = rng(71)
  const b = []
  b.push(phased(stars(x, R, 120, 48, 120, ['#cfd6ff', '#fff1c9', '#8c93c8']), 2))

  const light = ['#e6a85c', '#c9843c', '#f0be7a', '#b36a30', '#e8a050', '#c78a48']
  const dark = ['#7a4a22', '#5e3418', '#8a5a2e', '#4c2a14', '#7a4a22', '#664020']
  const cx = 1712
  const cy = 900
  const planet = []

  for (let r = 22; r < 49; r++) {
    for (let c = 82; c < 120; c++) {
      const px = c * CW + 8
      const py = r * CH + 11

      if (Math.hypot(px - cx, py - cy) < 330) {
        const band = Math.floor((py - 560) / 55) % 6
        const lit = Math.hypot(px - (cx - 140), py - (cy - 140)) < 330
        const fill = (lit ? light : dark)[(band + 6) % 6]
        planet.push(put(tile(x, fill, lerp(fill, '#2a1608', 0.45), pick(R, ['.', ':', '~', '-'])), c, r))
      }
    }
  }

  b.push(phased(planet, 3))

  // a ring around it, and two satellites going round
  const ring = []
  const path = []

  for (let a = 0; a < 72; a++) {
    const t = (a / 72) * Math.PI * 2
    ring.push(put(tile(x, '#e8d6a8', '#6a5530', '='), Math.round(107 + Math.cos(t) * 24), Math.round(38 + Math.sin(t) * 7)))
  }

  b.push(phased(ring, 5))

  for (const [rx, ry, dur, delay] of [[24, 7, 30, 0], [24, 7, 30, -15]]) {
    const pts = []

    for (let a = 0; a <= 24; a++) {
      const t = (a / 24) * Math.PI * 2
      pts.push([Math.round(107 + Math.cos(t) * rx), Math.round(38 + Math.sin(t) * ry)])
    }

    path.push(mover(x, pts, dur, delay, put(tile(x, '#cfd6ff', '#1a1f4a', '#'), pts[0][0], pts[0][1]) + put(tile(x, '#7d8cff', '#0c1030', '+'), pts[0][0] + 1, pts[0][1]), 'loop'))
  }

  b.push(path.join(''))

  // a small grey moon drifting across the top left
  const moon = []

  for (let r = 0; r < 7; r++) {
    for (let c = 0; c < 8; c++) {
      if (Math.hypot(c * CW + 8 - 64, r * CH + 11 - 77) < 56) {
        moon.push(put(tile(x, '#bfc0cf', '#6f7088', pick(R, ['.', 'o', ':'])), 6 + c, 5 + r))
      }
    }
  }

  b.push(mover(x, [[0, 0], [30, 2]], 120, 0, moon.join(''), 'loop'), ...signature(x, name, '#a3753e', '#e6a85c'))

  return shell(x, { bg: ['#0e0e22', '#04040c'], veil: '#07070f', veilA: 0.42, grid: '#8c93c8', gridA: 0.025, body: b.join('') })
}

// ---------------------------------------------------------------- Rainy window
function rainy(name) {
  const x = ctx()
  const R = rng(83)
  const b = []
  const lamp = '<radialGradient id="lp" cx=".12" cy=".92" r=".5"><stop offset="0" stop-color="#ffb454" stop-opacity=".34"/><stop offset="1" stop-color="#ffb454" stop-opacity="0"/></radialGradient>'
  b.push(`<rect class="gl" width="1920" height="1080" fill="url(#lp)"/>`)

  // out-of-focus city lights
  const colors = ['#ffb454', '#ff7aa8', '#5ad0ff', '#ffd98a', '#9cb4ff']
  const bokeh = []

  for (let i = 0; i < 34; i++) {
    const c = R() < 0.7 ? (R() < 0.5 ? Math.floor(R() * 28) : 92 + Math.floor(R() * 26)) : Math.floor(R() * 118)
    const r = 6 + Math.floor(R() * 26)
    const fill = lerp('#0b1118', pick(R, colors), 0.7)

    for (const [dc, dr, hi] of [[1, 0, 0], [0, 1, 0], [1, 1, 1], [2, 1, 0], [1, 2, 0]]) {
      const f = hi ? lerp(fill, '#ffffff', 0.25) : fill
      bokeh.push(put(tile(x, f, lerp(f, '#ffffff', 0.4), 'o'), c + dc, r + dr))
    }
  }

  b.push(phased(bokeh, 9))

  // the sill, a mug, a stack of books
  b.push(...trace(x, [[0, 46], [119, 46]], '#1d1611', '#4a382a', '=', '='), ...trace(x, [[0, 47], [119, 47]], '#140f0b', '#33261c', '#', '#'))
  const mug = [
    '#########  ',
    '#.......###',
    '#.......# #',
    '#.......###',
    '#########  ',
  ]
  const pal = { '#': { fill: '#d9c8a8', ink: '#3a2c22', g: '#' }, '.': { fill: '#4a2c1a', ink: '#9a6a44', g: '~' } }
  b.push(phased(sprite(x, mug, pal, 6, 41, 3), 3))
  const books = [
    '###########',
    '###########',
    '###########',
  ]
  b.push(...sprite(x, books, { '#': { fill: '#2f6a74', ink: '#9ad0d8', g: '=' } }, 22, 43, 4), ...sprite(x, books.slice(1), { '#': { fill: '#8a3f2c', ink: '#e8b09a', g: '=' } }, 23, 42, 5))

  for (let i = 0; i < 3; i++) {
    b.push(mover(x, [[9 + i, 40], [10 + i, 34]], 4.5 + i, -i * 1.4, put(tile(x, null, '#e8e2d6', '~'), 9 + i, 40)))
  }

  // rain on the glass, and slow drops
  for (let i = 0; i < 110; i++) {
    const c = Math.floor(R() * 118)
    const rx = pick(R, ['|', '|', '/', '`'])
    b.push(mover(x, [[c, -3], [c + 2, 46]], 1.2 + R() * 1.6, -R() * 3, put(tile(x, null, '#b5d0ea', rx), c, -3) + put(tile(x, null, '#6b8cae', rx), c, -2)))
  }

  for (let i = 0; i < 11; i++) {
    const c = 3 + Math.floor(R() * 113)
    const r = Math.floor(R() * 20)
    b.push(mover(x, [[c, r], [c, r + 24]], 16 + R() * 12, -R() * 16, put(tile(x, null, '#bcd4ec', 'o'), c, r)))
  }

  b.push(...signature(x, name, '#8a6a44', '#ffb454', 34, 45))

  return shell(x, { bg: ['#101a24', '#070b10'], veil: '#080d13', veilA: 0.45, grid: '#9cb4ff', gridA: 0.025, defs: lamp, body: b.join('') })
}

// ---------------------------------------------------------------- Zen garden (light)
function zen(name) {
  const x = ctx()
  const R = rng(91)
  const b = []
  const stones = [[20, 15, 1.0], [27, 19, 0.6], [100, 30, 1.2], [13, 38, 0.7]]
  const near = (c, r) => stones.some(([sc, sr, k]) => ((c - sc) / (13 * k)) ** 2 + ((r - sr) / (5.5 * k)) ** 2 < 1)
  const buckets = Array.from({ length: 12 }, () => [])
  const sand = ['#a99569', '#b8a47a', '#9c8860']

  // raked lines
  for (let r = 3; r < 45; r += 3) {
    for (let c = 0; c < 120; c++) {
      const rr = r + Math.round(1.3 * Math.sin(c / 8 + r))

      if (!near(c, rr)) {
        buckets[Math.floor(c / 10)].push(put(tile(x, null, pick(R, sand), pick(R, ['~', '-', '~'])), c, rr))
      }
    }
  }

  // ripples around each stone
  for (const [sc, sr, k] of stones) {
    for (const m of [1.7, 2.3, 2.9]) {
      const rx = 7.5 * k * m
      const ry = 3 * k * m
      const n = Math.round(rx * 9)

      for (let a = 0; a < n; a++) {
        const t = (a / n) * Math.PI * 2
        const c = Math.round(sc + Math.cos(t) * rx)
        const r = Math.round(sr + Math.sin(t) * ry)

        if (c >= 0 && c < 120 && r >= 0 && r < 47) {
          buckets[Math.floor(c / 10)].push(put(tile(x, null, '#8f7b52', Math.abs(Math.cos(t)) > 0.8 ? (Math.cos(t) > 0 ? ')' : '(') : '-'), c, r))
        }
      }
    }
  }

  x.anim.push('.aw{animation:sh 7.5s ease-in-out infinite}')
  b.push(wavy(x, buckets, 0.6))

  // stones
  const rocks = [
    ['    #####    ', '  #########  ', ' ########### ', '#############', ' ########### '],
    ['  #####  ', ' ####### ', '#########'],
  ]
  const rp = { '#': { fill: '#8b8982', ink: '#5c5a54', g: '.:' }, h: { fill: '#aeaca3', ink: '#6c6a63', g: '.' }, m: { fill: '#7d9a5a', ink: '#3d5a2a', g: '"' } }
  const place = (rows, c, r, seed) => b.push(...sprite(x, rows, rp, c, r, seed))
  place(['    mhh##    ', '  hhh#####  ', ' ########### ', '#############', ' ########### '], 14, 12, 1)
  place(['  hh##  ', ' ###### ', '########'], 24, 18, 2)
  place(['    mhhh###    ', '  hhhh########  ', ' ############## ', '################', ' ############## '], 92, 27, 3)
  place(['  mh##  ', ' ###### ', '########'], 10, 37, 4)

  // petals drifting down and across
  for (let i = 0; i < 9; i++) {
    const c = Math.floor(R() * 100)
    const r = Math.floor(R() * 14)
    b.push(mover(x, [[c, r], [c + 18, r + 26]], 22 + R() * 14, -R() * 30, put(tile(x, null, pick(R, ['#e58fa3', '#e0a050', '#d8788f']), pick(R, ['*', '`', 'v'])), c, r)))
  }

  b.push(...signature(x, name, '#8a7a60', '#a8582a'))

  return shell(x, { bg: ['#efe5d0', '#f8f2e4'], veil: '#f6efe0', veilA: 0.5, grid: '#8a7a60', gridA: 0.06, body: b.join('') })
}

export const SCENES = { silicon, attention, iron, night, blueprint, codeRain, outrun, aurora, orbit, rainy, zen }
