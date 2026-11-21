// Focus scenes: calm, readable, built for long sessions of deep work.
import { CW, CH, rng, pick, ctx, tile, put, phased, sprite, word, mover, trace, clip, shell, signature, lerp, stars, line, disc, particles, wavy } from './engine.js'

const HEX = [...'0123456789abcdef']
const hash = R => Array.from({ length: 7 }, () => pick(R, HEX)).join('')

// ---------------------------------------------------------------- Commit graph
function gitGraph(name) {
  const x = ctx()
  const R = rng(101)
  const b = []
  const BG = '#0d1117'
  const dim = c => lerp(BG, c, 0.6)
  const band = c => lerp(BG, c, 0.24)
  const main = { row: 24, color: '#58a6ff' }
  const branches = [
    { row: 14, a: 8, z: 40, color: '#3fb950' },
    { row: 18, a: 30, z: 72, color: '#bc8cff' },
    { row: 31, a: 14, z: 54, color: '#f0883e' },
    { row: 35, a: 62, z: 106, color: '#ff7b72' },
    { row: 9, a: 76, z: 114, color: '#79c0ff' },
    { row: 40, a: 92, z: 118, color: '#e3b341' },
  ]

  b.push(...trace(x, [[0, main.row], [119, main.row]], band(main.color), dim(main.color), '-', '|'))

  for (const br of branches) {
    b.push(...trace(x, [[br.a, main.row], [br.a, br.row], [br.z, br.row], [br.z, main.row]], band(br.color), dim(br.color), '-', '|'))
  }

  const lanes = [{ row: main.row, a: 0, z: 119, color: main.color }, ...branches.map(br => ({ row: br.row, a: br.a + 1, z: br.z - 1, color: br.color }))]
  const nodes = []

  for (const ln of lanes) {
    for (let c = ln.a + 3; c < ln.z; c += 5 + Math.floor(R() * 5)) {
      nodes.push(put(tile(x, ln.color, '#0d1117', '@'), c, ln.row))

      if (R() < 0.5 && (c < 30 || c > 90)) {
        b.push(...word(x, hash(R), c - 3, ln.row - 1, null, dim(ln.color)))
      }
    }
  }

  b.push(phased(nodes, 7))

  // commits travelling along each lane
  const bright = tile(x, '#ffffff', '#0d1117', '*')

  lanes.forEach((ln, i) => {
    const pts = i === 0 ? [[0, ln.row], [119, ln.row]] : [[ln.a, main.row], [ln.a, ln.row], [ln.z, ln.row], [ln.z, main.row]]
    const dur = 12 + i * 2.5

    for (let k = 0; k < (i === 0 ? 3 : 1); k++) {
      b.push(mover(x, pts, dur, -k * (dur / 3) - i, put(bright, pts[0][0], pts[0][1])))
    }
  })

  b.push(...word(x, ' main ', 4, 22, '#1f6feb', '#ffffff'), ...word(x, ' HEAD ', 110, 26, '#238636', '#ffffff'), ...signature(x, name, '#3d6aa8', '#58a6ff'))

  return shell(x, { bg: ['#0d1117', '#090c10'], veil: '#080b10', veilA: 0.5, grid: '#58a6ff', gridA: 0.03, body: b.join('') })
}

// ---------------------------------------------------------------- Network mesh
function mesh(name) {
  const x = ctx()
  const R = rng(111)
  const b = []
  const nodes = []

  for (let gy = 0; gy < 5; gy++) {
    for (let gx = 0; gx < 13; gx++) {
      nodes.push([Math.round(5 + gx * 9 + (R() - 0.5) * 6), Math.round(4 + gy * 10 + (R() - 0.5) * 5)])
    }
  }

  const edgeId = tile(x, '#11425a', '#6ac4e0', '.')
  const edges = []
  const links = []

  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const d = Math.hypot(nodes[i][0] - nodes[j][0], (nodes[i][1] - nodes[j][1]) * 1.9)

      if (d <= 13.5 && R() < 0.7) {
        edges.push(...line(nodes[i], nodes[j], edgeId))
        links.push([i, j])
      }
    }
  }

  b.push(phased(edges, 4))
  b.push(phased(nodes.flatMap(([c, r]) => [put(tile(x, '#1a8aae', '#e8fbff', '@'), c, r), put(tile(x, '#136a8a', '#9fe6ff', '+'), c + 1, r), put(tile(x, '#136a8a', '#9fe6ff', '+'), c - 1, r)]), 6))

  const spark = tile(x, '#9ff4ff', '#06242c', '*')

  for (let k = 0; k < 22; k++) {
    const [i, j] = pick(R, links)
    const [a, z] = R() < 0.5 ? [nodes[i], nodes[j]] : [nodes[j], nodes[i]]
    b.push(mover(x, [a, z], 2.4 + R() * 3, -R() * 6, put(spark, a[0], a[1])))
  }

  b.push(...signature(x, name, '#2a8aa8', '#9ff4ff'))

  return shell(x, { bg: ['#07161d', '#040b10'], veil: '#050d12', veilA: 0.5, grid: '#6fd8f0', gridA: 0.03, body: b.join('') })
}

// ---------------------------------------------------------------- Server room
function serverRack(name) {
  const x = ctx()
  const R = rng(121)
  const b = []
  const racks = [3, 22, 82, 101]
  const frame = tile(x, '#17202a', '#33414f', '#')
  const vent = tile(x, '#0f161d', '#2a3744', '=')
  const leds = []
  const fast = []

  racks.forEach((c, ri) => {
    for (let r = 5; r <= 44; r++) {
      b.push(put(frame, c, r), put(frame, c + 15, r))
    }

    for (let k = 0; k < 16; k++) {
      b.push(put(frame, c + k, 5), put(frame, c + k, 44))
    }

    for (let u = 0; u < 19; u++) {
      const r = 7 + u * 2

      for (let k = 2; k <= 9; k++) {
        b.push(put(vent, c + k, r))
      }

      for (let k = 11; k <= 13; k++) {
        const color = R() < 0.7 ? '#3fb950' : R() < 0.65 ? '#e3b341' : '#58a6ff'
        const led = put(tile(x, color, '#04120a', '.'), c + k, r)

        if (R() < 0.12) {
          fast.push(`<g class="cur" style="animation-delay:${(-R() * 1.4).toFixed(2)}s;animation-duration:${(0.7 + R() * 1.6).toFixed(2)}s">${led}</g>`)
        } else {
          leds.push(led)
        }
      }
    }

    void ri
  })

  b.push(phased(leds, 3), fast.join(''))

  // cables looping over the top, with traffic on them
  const cable = [[10, 5], [10, 2], [30, 2], [30, 5]]
  const cable2 = [[90, 5], [90, 1], [109, 1], [109, 5]]
  b.push(...trace(x, cable, null, '#2f6a8f', '-', '|'), ...trace(x, cable2, null, '#8f6a2f', '-', '|'))
  b.push(mover(x, cable, 5, 0, put(tile(x, '#58a6ff', '#04120a', '*'), 10, 5)), mover(x, cable2, 6, -2, put(tile(x, '#ffb454', '#04120a', '*'), 90, 5)))
  b.push(...trace(x, [[0, 46], [119, 46]], null, '#1f3a4f', '=', '='), ...signature(x, name, '#3d6aa8', '#58a6ff', 36, 45))

  const under = '<radialGradient id="ug" cx=".5" cy="1" r=".7"><stop offset="0" stop-color="#2f8ad6" stop-opacity=".30"/><stop offset="1" stop-color="#2f8ad6" stop-opacity="0"/></radialGradient>'

  return shell(x, { bg: ['#0b1219', '#05090d'], veil: '#060a0f', veilA: 0.5, grid: '#58a6ff', gridA: 0.025, defs: under, body: `<rect class="gl" width="1920" height="1080" fill="url(#ug)"/>` + b.join('') })
}

// ---------------------------------------------------------------- Terminal
function terminal(name) {
  const x = ctx()
  const R = rng(131)
  const b = []
  const AMB = '#ffb000'
  const verbs = ['started', 'loaded', 'mounted', 'listening on', 'synced', 'compiled', 'verified', 'connected to', 'reached target', 'cleaned up', 'resolved', 'flushed']
  const nouns = ['cache', 'socket', 'graph', 'kernel', 'buffer', 'index', 'module', 'queue', 'volume', 'daemon', 'router', 'ledger']

  const block = (c0, side) => {
    const lines = []

    for (let i = 0; i < 19; i++) {
      const tag = R() < 0.8 ? '[  OK  ]' : '[ WARN ]'
      const text = `${tag} ${pick(R, verbs)} ${pick(R, nouns)} ${R() < 0.5 ? '0x' + hash(R).slice(0, 4) : '#' + Math.floor(R() * 90 + 10)}`.slice(0, 26)
      lines.push([...text].map((ch, k) => (ch === ' ' ? '' : (k < 8 ? put(tile(x, null, tag === '[  OK  ]' ? '#ffd45a' : '#ff8a3d', ch), c0 + k, 0) : put(tile(x, null, lerp('#0a0700', AMB, 0.8 + R() * 0.2), ch), c0 + k, 0)))))
    }

    const rows = off => lines.map((row, i) => row.map(u => u.replace(/y="0"/, `y="${(6 + i * 2 + off) * CH}"`)).join('')).join('')
    const id = 'ct' + side
    clip(x, id, c0 - 1, 5, 30, 38)

    return `<g clip-path="url(#${id})">${mover(x, [[0, 0], [0, -38]], 76, 0, rows(0) + rows(38), 'loop')}</g>`
  }

  b.push(block(3, 0), block(86, 1))

  // a scanline over everything, and a brighter band rolling down
  x.defs.push('<pattern id="sl" width="4" height="4" patternUnits="userSpaceOnUse"><rect width="4" height="1.2" fill="#000" fill-opacity=".2"/></pattern>')
  x.defs.push('<linearGradient id="bd" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffb000" stop-opacity="0"/><stop offset=".5" stop-color="#ffb000" stop-opacity=".07"/><stop offset="1" stop-color="#ffb000" stop-opacity="0"/></linearGradient>')
  x.kf.push('@keyframes crt{from{transform:translateY(-200px)}to{transform:translateY(1100px)}}')
  x.anim.push('.crt{animation:crt 8s linear infinite}')

  b.push(...word(x, `${name}@host:~$`, 4, 45, null, AMB), `<g class="cur">${put(tile(x, AMB, AMB, ' '), 4 + name.length + 8, 45)}</g>`)
  b.push('<rect width="1920" height="1080" fill="url(#sl)"/>', '<rect class="crt" y="-100" width="1920" height="200" fill="url(#bd)"/>')

  return shell(x, { bg: ['#120b02', '#050300'], veil: '#060300', veilA: 0.45, grid: '#ffb000', gridA: 0.02, fontSize: 19, weight: 700, body: b.join('') })
}

// ---------------------------------------------------------------- Graph paper (light)
function graphPaper(name) {
  const x = ctx()
  const b = []
  const INK = '#123f66'
  const BLUE = '#1f6fb2'
  const RED = '#d1493f'
  x.defs.push('<pattern id="mj" width="80" height="110" patternUnits="userSpaceOnUse"><path d="M0 0H80M0 0V110" stroke="#2f6a9c" stroke-opacity=".22" stroke-width="1.4" fill="none"/></pattern>')
  b.push('<rect width="1920" height="1080" fill="url(#mj)"/>')

  const ax = tile(x, '#c3d8ea', INK, '-')
  const ay = tile(x, '#c3d8ea', INK, '|')
  const tick = tile(x, '#9bbfdc', INK, '+')

  for (let c = 2; c < 118; c++) {
    b.push(put(ax, c, 24))
  }

  for (let r = 2; r < 47; r++) {
    b.push(put(ay, 60, r))
  }

  for (let c = 5; c < 118; c += 5) {
    b.push(put(tick, c, 24))
  }

  for (let r = 4; r < 46; r += 4) {
    b.push(put(tick, 60, r))
  }

  b.push(put(tile(x, null, INK, '>'), 118, 24), put(tile(x, null, INK, '^'), 60, 1), ...word(x, 'x', 116, 22, null, INK), ...word(x, 'y', 62, 2, null, INK))

  const sinPts = []
  const dot = tile(x, BLUE, '#ffffff', 'o')

  for (let c = 3; c < 118; c++) {
    const r = 24 - Math.round(9 * Math.sin((c - 60) / 6.5))
    b.push(put(dot, c, r))

    if (c % 2 === 1) {
      sinPts.push([c, r])
    }
  }

  const par = tile(x, RED, '#ffffff', '*')

  for (let c = 36; c <= 84; c++) {
    b.push(put(par, c, 24 + Math.round(((c - 60) ** 2) / 40)))
  }

  // a point riding the curve
  b.push(mover(x, sinPts, 18, 0, put(tile(x, RED, '#ffffff', '@'), sinPts[0][0], sinPts[0][1]), 'loop'))

  b.push(...word(x, 'f(x) = sin(x / 6.5)', 5, 4, null, BLUE), ...word(x, 'g(x) = x^2 / 40', 88, 42, null, RED), ...word(x, 'FIG. 2', 5, 8, null, INK), ...word(x, 'dy/dx = cos(x)', 90, 6, null, BLUE))
  b.push(...signature(x, name, '#2f6a9c', '#d1493f'))

  return shell(x, { bg: ['#f1f5fb', '#e6eef8'], veil: '#eef3fa', veilA: 0.5, grid: '#2f6a9c', gridA: 0.1, body: b.join('') })
}

// ---------------------------------------------------------------- Library
function library(name) {
  const x = ctx()
  const R = rng(141)
  const b = []
  const jewels = ['#7a2e2e', '#2e4f7a', '#2e6b4f', '#7a5a2e', '#5a2e6b', '#8a4a2a', '#2e5a6b', '#6b6b2e', '#4a2a2a', '#3a3a6b']
  const lamp = '<radialGradient id="lm" cx=".25" cy=".5" r=".3"><stop offset="0" stop-color="#ffc468" stop-opacity=".42"/><stop offset="1" stop-color="#ffc468" stop-opacity="0"/></radialGradient>'
  const shelves = [12, 21, 30, 39, 44]

  for (const [a, z] of [[3, 25], [94, 116]]) {
    const wood = tile(x, '#4a3320', '#7a5a38', '=')
    const side = tile(x, '#3a2817', '#5a4028', '|')

    for (const sr of shelves) {
      for (let c = a - 1; c <= z + 1; c++) {
        b.push(put(wood, c, sr))
      }
    }

    for (let r = 4; r <= 44; r++) {
      b.push(put(side, a - 1, r), put(side, z + 1, r))
    }

    const books = []

    shelves.forEach((sr, k) => {
      const room = k === 0 ? 7 : 8

      for (let c = a; c <= z; c++) {
        if (R() < 0.07) {
          continue
        }

        const h = 3 + Math.floor(R() * Math.min(5, room))
        const color = pick(R, jewels)

        for (let r = sr - h; r < sr; r++) {
          books.push(put(tile(x, color, lerp(color, '#000000', 0.45), pick(R, [...'|:='])), c, r))
        }
      }
    })

    b.push(phased(books, a))
  }

  // a standing lamp
  const shade = ['   ####   ', '  ######  ', ' ######## ', '##########']
  b.push(...sprite(x, shade, { '#': { fill: '#e8b25c', ink: '#7a4a14', g: '=-' } }, 25, 21, 8), ...trace(x, [[30, 25], [30, 42]], '#3a2817', '#6a4a2a', '|', '|'), ...sprite(x, ['######'], { '#': { fill: '#3a2817', ink: '#6a4a2a', g: '=' } }, 27, 43, 9))
  b.push(...particles(x, R, { n: 28, c: [2, 118], r: [10, 44], dx: 3, dy: -7, dur: [12, 24], glyphs: '.,', inks: ['#e8c880', '#c9a860'] }))
  b.push(...signature(x, name, '#8a6a44', '#ffb454', 36, 45))

  return shell(x, { bg: ['#1d130c', '#080504'], veil: '#0a0604', veilA: 0.45, grid: '#ffb454', gridA: 0.025, defs: lamp, body: `<rect class="gl" width="1920" height="1080" fill="url(#lm)"/>` + b.join('') })
}

// ---------------------------------------------------------------- Constellations
function constellations(name) {
  const x = ctx()
  const R = rng(151)
  const b = []
  b.push(phased(stars(x, R, 150, 46, 120, ['#8aa0d8', '#cfd8ff', '#fff1c9', '#6a7ab0']), 2))
  const names = ['LYRA', 'ORION', 'CYGNUS', 'DRACO', 'AQUILA', 'PERSEUS', 'CEPHEUS', 'HYDRA', 'VELA']
  const dotId = tile(x, '#1a2c64', '#7a92d8', '.')
  const starId = tile(x, '#4560c8', '#ffffff', '*')
  const lines = []
  const pts = []
  let tries = 0

  for (const nm of names) {
    for (;;) {
      const cx = 6 + Math.floor(R() * 108)
      const cy = 6 + Math.floor(R() * 34)

      if (tries++ < 200 && cx > 30 && cx < 90) {
        continue
      }

      let p = [cx, cy]
      const star = [p]

      for (let i = 0; i < 5 + Math.floor(R() * 3); i++) {
        p = [Math.max(2, Math.min(117, p[0] + (R() < 0.5 ? -1 : 1) * (5 + Math.floor(R() * 5)))), Math.max(2, Math.min(44, p[1] + Math.floor((R() - 0.5) * 9)))]
        star.push(p)
      }

      for (let i = 1; i < star.length; i++) {
        lines.push(...line(star[i - 1], star[i], dotId))
      }

      pts.push(...star.map(([c, r]) => put(starId, c, r)))
      b.push(...word(x, nm, star[0][0] - 1, star[0][1] - 2, null, '#8aa0e0'))
      break
    }
  }

  b.push(phased(lines, 3), phased(pts, 9))
  const trail = [[0, 0, '*', '#fff1c9'], [-1, -1, '+', '#cfd8ff'], [-2, -1, '.', '#8aa0d8'], [-3, -2, '.', '#6a7ab0']]
  const comet = (c, r) => trail.map(([dc, dr, ch, ink]) => put(tile(x, null, ink, ch), c + dc, r + dr)).join('')
  b.push(mover(x, [[20, 4], [44, 16]], 26, -3, comet(20, 4), 'burst'), mover(x, [[96, 6], [74, 18]], 34, -20, comet(96, 6), 'burst'), ...signature(x, name, '#4a5f9a', '#cfd8ff'))

  return shell(x, { sky: [[0, '#0a1230'], [1, '#04060f']], veil: '#050816', veilA: 0.4, grid: '#8aa0ff', gridA: 0.02, body: b.join('') })
}

// ---------------------------------------------------------------- Tide (light)
function tide(name) {
  const x = ctx()
  const R = rng(161)
  const b = []
  const HZ = 24
  x.defs.push('<linearGradient id="sea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#b8dbec"/><stop offset="1" stop-color="#4a8db5"/></linearGradient>')
  b.push(`<rect y="${HZ * CH}" width="1920" height="${1080 - HZ * CH}" fill="url(#sea)"/>`)

  // sun on the horizon, and its glitter on the water
  b.push(phased(disc(x, R, 1500, HZ * CH, 130, (px, py) => (py <= HZ * CH ? ['#ffd9a8', '#b8782a'] : null), '.:'), 2))
  const glitter = []

  for (let r = HZ + 1; r < 44; r++) {
    for (let k = 0; k < 3; k++) {
      glitter.push(put(tile(x, null, '#fff3d6', pick(R, ['=', '-', '~'])), 88 + Math.round((R() - 0.5) * (4 + (r - HZ) * 0.5)), r))
    }
  }

  b.push(phased(glitter, 4))

  // rolling swell: shimmer that travels
  const buckets = Array.from({ length: 12 }, () => [])

  for (let r = HZ + 1; r < 47; r += 2) {
    const ink = lerp('#e6f4fb', '#1c4f73', (r - HZ) / 24)

    for (let c = (r % 4) / 2; c < 120; c += 3) {
      buckets[Math.floor(c / 10)].push(put(tile(x, null, ink, '~'), c, r))
    }
  }

  x.anim.push('.aw{animation:sh 6s ease-in-out infinite}')
  b.push(wavy(x, buckets, 0.5))

  // a sailboat creeping across, gulls, clouds
  const boat = ['    #    ', '   ##    ', '  ###    ', ' ####    ', '#########', ' ####### ']
  b.push(mover(x, [[-12, HZ - 5], [122, HZ - 5]], 190, 0, sprite(x, boat, { '#': { fill: '#ffffff', ink: '#9ab4c6', g: '.' } }, -12, HZ - 5, 3).join(''), 'loop'))

  for (let i = 0; i < 6; i++) {
    const c = Math.floor(R() * 100)
    const r = 3 + Math.floor(R() * 12)
    b.push(mover(x, [[c, r], [c + 24, r - 2]], 24 + R() * 20, -R() * 30, put(tile(x, null, '#4a6a82', 'v'), c, r)))
  }

  const cloud = [' ###### ', '########']

  for (let i = 0; i < 3; i++) {
    const r = 4 + i * 5
    b.push(mover(x, [[-10, r], [122, r]], 160 + i * 30, -i * 50, sprite(x, cloud, { '#': { fill: '#fff6ea', ink: '#e8cdb4', g: '~.' } }, -10, r, 10 + i).join('')))
  }

  b.push(...signature(x, name, '#3f6a88', '#d1493f'))

  return shell(x, { sky: [[0, '#f7d9c0'], [0.5, '#cfe4f2'], [1, '#a8cfe4']], veil: '#e9f2f8', veilA: 0.4, grid: '#3b7ea8', gridA: 0.04, body: b.join('') })
}

export const FOCUS = { gitGraph, mesh, serverRack, terminal, graphPaper, library, constellations, tide }
