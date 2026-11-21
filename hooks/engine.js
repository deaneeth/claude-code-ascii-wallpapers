// Live ASCII-tile wallpaper scenes. Every scene is one SVG built from character tiles on a 16x22 grid:
// tiles shimmer in three phases, packets and tokens step from cell to cell, and nothing here names a project,
// so the pictures stay true however the work changes. Each scene stays under the 131072-character limit.

export const CW = 16
export const CH = 22
export const FONT = 'ui-monospace,SFMono-Regular,Menlo,Consolas,monospace'

export function rng(seed) {
  let s = seed >>> 0
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0
    return s / 4294967296
  }
}

export const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
export const pick = (R, list) => list[Math.floor(R() * list.length)]

export function ctx() {
  return { defs: [], ids: new Map(), kf: [], anim: [], n: 0 }
}

// One reusable tile: an optional backing plate and one glyph. Scenes `put` it by reference.
export function tile(x, fill, ink, ch) {
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

export const put = (id, c, r) => `<use href="#${id}" x="${c * CW}" y="${r * CH}"/>`

// Tiles spread over three shimmer phases, so a shape never pulses as one block.
export function phased(items, seed) {
  const R = rng(seed)
  const g = [[], [], []]

  for (const it of items) {
    g[Math.floor(R() * 3)].push(it)
  }

  return g.map((a, i) => `<g class="s${i}">${a.join('')}</g>`).join('')
}

export function sprite(x, rows, pal, c0, r0, seed) {
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

export function word(x, s, c, r, fill, ink) {
  return [...s].map((ch, i) => (ch === ' ' ? '' : put(tile(x, fill, ink, ch), c + i, r)))
}

// Something that steps cell to cell along a path. `fade` blinks it in and out, `loop` repeats forever
// (for a seamless scroll), `burst` moves once in the first tenth of the cycle (a shooting star).
export function mover(x, pts, dur, delay, inner, mode = 'fade') {
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
  const span = mode === 'burst' ? 10 : mode === 'blast' ? 28 : 100
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

  if (mode === 'burst' || mode === 'blast') {
    frames.push(`100%{transform:${at(keep[keep.length - 1])}}`)
  }

  x.kf.push(`@keyframes ${id}{${frames.join('')}}`)
  const extra = mode === 'fade' ? `,fd ${dur}s linear ${delay}s infinite` : mode === 'burst' ? `,bu ${dur}s linear ${delay}s infinite` : mode === 'blast' ? `,bs ${dur}s linear ${delay}s infinite` : ''
  x.anim.push(`.${id}{animation:${id} ${dur}s linear ${delay}s infinite${extra}}`)

  return `<g class="${id}">${inner}</g>`
}

export function trace(x, pts, fill, ink, gh = '=', gv = '|') {
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

export function clip(x, id, c, r, w, h) {
  x.defs.push(`<clipPath id="${id}"><rect x="${c * CW}" y="${r * CH}" width="${w * CW}" height="${h * CH}"/></clipPath>`)
}

// A chip die: package ring, pins, and a grid of processing elements lit by a diagonal wave.
export function die(x, o) {
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
export function scope(x, c, r, w, line, fill, ink, dur) {
  const id = 'cs' + x.n++
  clip(x, id, c, r, w, 1)
  const items = []

  for (let i = 0; i < w + 8; i++) {
    const ch = line[i % line.length]
    items.push(put(tile(x, fill, ink, ch), c + i, r))
  }

  return `<g clip-path="url(#${id})">${mover(x, [[c, r], [c - 8, r]], dur, 0, items.join(''), 'loop')}</g>`
}

export function shell(x, o) {
  const css =
    `text{font:${o.weight ?? 500} ${o.fontSize ?? 14}px ${FONT};text-anchor:middle;dominant-baseline:central}` +
    '.hot{opacity:0}' +
    '@keyframes sh{0%,100%{opacity:1}50%{opacity:.45}}' +
    '@keyframes fd{0%{opacity:0}8%{opacity:1}88%{opacity:1}100%{opacity:0}}' +
    '@keyframes bu{0%{opacity:0}1%{opacity:1}9%{opacity:1}10%,100%{opacity:0}}' +
    '@keyframes bs{0%{opacity:0}1%{opacity:1}24%{opacity:1}28%,100%{opacity:0}}' +
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
    (o.sky
      ? `<linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">${o.sky.map(([t, c]) => `<stop offset="${t}" stop-color="${c}"/>`).join('')}</linearGradient>`
      : `<linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${o.bg[0]}"/><stop offset="1" stop-color="${o.bg[1]}"/></linearGradient>`) +
    `<linearGradient id="vl" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${o.veil}" stop-opacity="0"/><stop offset=".12" stop-color="${o.veil}" stop-opacity="${o.veilA}"/><stop offset=".88" stop-color="${o.veil}" stop-opacity="${o.veilA}"/><stop offset="1" stop-color="${o.veil}" stop-opacity="0"/></linearGradient>` +
    `<pattern id="gr" width="16" height="22" patternUnits="userSpaceOnUse"><path d="M0 .5h16M.5 0v22" stroke="${o.grid}" stroke-opacity="${o.gridA}" fill="none"/></pattern>` +
    (o.defs || '') +
    x.defs.join('') +
    `</defs><rect width="1920" height="1080" fill="url(#bg)"/><rect width="1920" height="1080" fill="url(#gr)"/>` +
    o.body +
    `<rect width="1920" height="1080" fill="url(#vl)"/></svg>`
  )
}

export const signature = (x, name, ink, fill, c = 4, r = 46) => [
  ...word(x, `~/${name}`, c, r, null, ink),
  `<g class="cur">${put(tile(x, fill, fill, ' '), c + name.length + 3, r)}</g>`,
]

// ---------------------------------------------------------------- helpers for the newer scenes
export const hex2 = n => Math.round(n).toString(16).padStart(2, '0')

export function lerp(a, b, t) {
  const p = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16))
  const [A, B] = [p(a), p(b)]

  return '#' + A.map((v, i) => hex2(v + (B[i] - v) * Math.max(0, Math.min(1, t)))).join('')
}

// brightness that travels: tiles bucketed by column, each bucket a beat later than the last
export function wavy(x, buckets, step) {
  return buckets.map((arr, i) => `<g class="aw" style="animation-delay:${(-i * step).toFixed(2)}s">${arr.join('')}</g>`).join('')
}

export function stars(x, R, n, rows, cols, inks) {
  const out = []

  for (let i = 0; i < n; i++) {
    out.push(put(tile(x, null, pick(R, inks), pick(R, ['.', '.', '+', '*'])), Math.floor(R() * cols), Math.floor(R() * rows)))
  }

  return out
}



// ---------------------------------------------------------------- shared drawing primitives
// A straight run of tiles between two cells (Bresenham).
export function line(a, b, id) {
  let [c0, r0] = a
  const [c1, r1] = b
  const out = []
  const dc = Math.abs(c1 - c0)
  const dr = Math.abs(r1 - r0)
  const sc = c0 < c1 ? 1 : -1
  const sr = r0 < r1 ? 1 : -1
  let err = dc - dr

  for (;;) {
    out.push(put(id, c0, r0))

    if (c0 === c1 && r0 === r1) {
      break
    }

    const e2 = 2 * err

    if (e2 > -dr) {
      err -= dr
      c0 += sc
    }

    if (e2 < dc) {
      err += dc
      r0 += sr
    }
  }

  return out
}

// A disc of tiles. `fillAt(px, py, t)` gives [fill, ink] (t is 0 at the centre, 1 at the edge) or null to leave a gap.
export function disc(x, R, cx, cy, rad, fillAt, glyphs) {
  const out = []

  for (let r = Math.max(0, Math.floor((cy - rad) / CH)); r <= Math.min(48, Math.ceil((cy + rad) / CH)); r++) {
    for (let c = Math.max(0, Math.floor((cx - rad) / CW)); c <= Math.min(119, Math.ceil((cx + rad) / CW)); c++) {
      const px = c * CW + 8
      const py = r * CH + 11
      const d = Math.hypot(px - cx, py - cy)

      if (d < rad) {
        const f = fillAt(px, py, d / rad)

        if (f) {
          out.push(put(tile(x, f[0], f[1], pick(R, [...glyphs])), c, r))
        }
      }
    }
  }

  return out
}

// Little things that drift: rain, snow, embers, petals, sparks, bubbles, dust.
export function particles(x, R, o) {
  const out = []

  for (let i = 0; i < o.n; i++) {
    const c = o.c[0] + Math.floor(R() * (o.c[1] - o.c[0]))
    const r = o.r[0] + Math.floor(R() * (o.r[1] - o.r[0]))
    const dur = o.dur[0] + R() * (o.dur[1] - o.dur[0])
    const id = tile(x, o.fill ?? null, pick(R, o.inks), pick(R, [...o.glyphs]))
    const dx = typeof o.dx === 'function' ? o.dx(R) : o.dx
    out.push(mover(x, [[c, r], [c + dx, r + o.dy]], dur, -R() * dur, put(id, c, r), o.mode ?? 'fade'))
  }

  return out
}

let rid = 0

// A mountain range: a smooth filled body plus a tile edge along the top. `h(c)` is the height in rows above `base`.
export function ridge(x, R, o) {
  const id = 'rg' + rid++
  const bottom = (o.bottom ?? 49) * CH
  let d = `M0 ${bottom}`
  const edge = []

  for (let c = 0; c <= 120; c++) {
    const top = Math.round(o.base - o.h(Math.min(c, 119)))
    d += ` L${c * CW} ${top * CH}`

    if (c < 120 && o.edge) {
      edge.push(put(tile(x, o.edge[0], o.edge[1], pick(R, [...(o.glyphs ?? '^.:')])), c, top))
    }
  }

  d += ` L1920 ${bottom} Z`
  x.defs.push(
    `<linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${o.fill[0]}"/><stop offset="1" stop-color="${o.fill[1]}"/></linearGradient>`,
  )

  return `<path d="${d}" fill="url(#${id})"/>` + phased(edge, o.seed ?? 3)
}

// A city: buildings with lit windows twinkling.
export function skyline(x, R, o) {
  let c = o.from
  const out = []
  const wins = []

  while (c < o.to) {
    const w = o.w[0] + Math.floor(R() * (o.w[1] - o.w[0] + 1))
    const h = o.h[0] + Math.floor(R() * (o.h[1] - o.h[0] + 1))
    out.push(`<rect x="${c * CW}" y="${(o.base - h) * CH}" width="${w * CW}" height="${(h + 3) * CH}" fill="${o.fill}"/>`)

    for (let r = o.base - h + 1; r < o.base - 1; r += 2) {
      for (let cc = c + 1; cc < c + w - 1; cc += 2) {
        if (R() < o.lit) {
          wins.push(put(tile(x, pick(R, o.windows), '#000', ' '), cc, r))
        }
      }
    }

    c += w + (R() < 0.3 ? 1 : 0)
  }

  return out.join('') + phased(wins, o.seed ?? 5)
}

// A pattern of glyphs for texture, as a fill: `url(#id)`.
export function texture(x, id, glyphs, ink, opacity) {
  const cells = glyphs.map((g, i) => `<text x="${8 + (i % 4) * 16}" y="${11 + Math.floor(i / 4) * 22}" fill="${ink}" fill-opacity="${opacity}">${esc(g)}</text>`).join('')
  x.defs.push(`<pattern id="${id}" width="64" height="${Math.ceil(glyphs.length / 4) * 22}" patternUnits="userSpaceOnUse">${cells}</pattern>`)

  return `url(#${id})`
}

// Mixes a hue and an accent into a whole palette for a scene's window colors.
export function hsl(h, s, l) {
  const a = (s / 100) * Math.min(l / 100, 1 - l / 100)
  const f = n => {
    const k = (n + h / 30) % 12
    const v = l / 100 - a * Math.max(-1, Math.min(k - 3, 9 - k, 1))

    return hex2(v * 255)
  }

  return `#${f(0)}${f(8)}${f(4)}`
}


// A pine: stacked rows widening downward, with a snow cap and a trunk.
export function pine(x, R, c, base, h, body, snow) {
  const out = []

  for (let k = 0; k < h; k++) {
    const w = 1 + 2 * Math.floor(k * 0.55)
    const row = base - h - 2 + k

    for (let i = -Math.floor(w / 2); i <= Math.floor(w / 2); i++) {
      const cap = snow && (k % 3 === 0 || Math.abs(i) === Math.floor(w / 2))
      out.push(put(tile(x, cap ? snow : body[(k + Math.abs(i)) % body.length], cap ? '#8aa0c8' : '#04120c', cap ? '*' : pick(R, ['^', 'A', 'v'])), c + i, row))
    }
  }

  out.push(put(tile(x, '#3a2418', '#5a3a28', '|'), c, base - 2), put(tile(x, '#3a2418', '#5a3a28', '|'), c, base - 1))

  return out
}


// Many things following one path: one set of keyframes, each follower on its own delay.
export function follow(x, pts, dur, items) {
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

  const id = 'f' + x.n++
  const total = segs.reduce((a, b) => a + b, 0)
  const at = p => `translate(${(p[0] - keep[0][0]) * CW}px,${(p[1] - keep[0][1]) * CH}px)`
  let acc = 0
  const frames = []

  for (let i = 0; i < keep.length; i++) {
    frames.push(`${((acc / total) * 100).toFixed(2)}%{transform:${at(keep[i])}${i < segs.length ? `;animation-timing-function:steps(${segs[i]},end)` : ''}}`)

    if (i < segs.length) {
      acc += segs[i]
    }
  }

  x.kf.push(`@keyframes ${id}{${frames.join('')}}`)
  x.anim.push(`.${id}{animation:${id} ${dur}s linear infinite}`)

  return items.map(it => `<g class="${id}" style="animation-delay:${it.delay}s">${it.inner}</g>`).join('')
}
