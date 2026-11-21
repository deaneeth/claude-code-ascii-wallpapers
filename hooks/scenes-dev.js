// Dev scenes: dark, moody and minimal, for people who live in the terminal. Editors, memory, assembly,
// diffs, green test runs and the quiet between commands. One accent per scene, nothing that shouts.
import { CW, CH, rng, pick, ctx, tile, put, phased, mover, trace, clip, shell, signature, lerp, line, particles } from './engine.js'

// every ink is lifted toward white so the dark palettes stay readable on a busy screen
const lift = c => lerp(c, '#ffffff', 0.3)
const T = (x, s, c, r, ink, fill = null) => [...s].map((ch, i) => (ch === ' ' ? '' : put(tile(x, fill, lift(ink), ch), c + i, r))).join('')
const plate = (c, r, w, fill, h = 1) => `<rect x="${c * CW}" y="${r * CH}" width="${w * CW}" height="${h * CH}" fill="${fill}"/>`

let sid = 0

// Lines that scroll upward forever. `lines` are functions (row, n) => svg; each takes `step` rows.
function scroller(x, lines, c0, w, top, step, dur) {
  const id = 'sc' + sid++
  const rows = lines.length * step
  clip(x, id, c0 - 1, top, w + 2, rows)
  const a = lines.map((f, i) => f(top + i * step, i)).join('')
  const b = lines.map((f, i) => f(top + rows + i * step, i + lines.length)).join('')

  return `<g clip-path="url(#${id})">${mover(x, [[0, 0], [0, -rows]], dur, 0, a + b, 'loop')}</g>`
}

const KW = ['fn', 'let', 'mut', 'if', 'else', 'for', 'while', 'return', 'match', 'impl', 'struct', 'pub', 'use', 'async', 'await', 'const', 'loop', 'enum']
const ID = ['buf', 'len', 'ctx', 'idx', 'node', 'cfg', 'res', 'tx', 'rx', 'err', 'ptr', 'sum', 'key', 'val', 'self', 'data', 'head', 'tail', 'frame', 'pool', 'slot', 'span']
const OPS = ['=', '==', '+', '->', '::', '&&', '||', '<', '>', '+=', '!=', '|']
const STR = ['ok', 'init', 'eof', 'retry', 'tcp', 'main', 'boot', 'ready', 'dev']
const COMMENTS = ['TODO: handle backpressure', 'safety: ptr is non-null', 'hot path, keep it small', 'fixme later', 'invariant: len <= cap', 'avoid the alloc here']

function codeLine(R, C, w) {
  const indent = Math.floor(R() * 4) * 2

  if (R() < 0.1) {
    return { indent, toks: [['// ' + pick(R, COMMENTS), C.cm]], w }
  }

  if (R() < 0.07) {
    return { indent: 0, toks: [], w }
  }

  const toks = []
  const n = 2 + Math.floor(R() * 4)

  for (let i = 0; i < n; i++) {
    const t = R()

    if (i === 0 && t < 0.45) {
      toks.push([pick(R, KW), C.kw])
    } else if (t < 0.5) {
      toks.push([pick(R, ID), C.id])
    } else if (t < 0.64) {
      toks.push([pick(R, OPS), C.op])
    } else if (t < 0.76) {
      toks.push(['"' + pick(R, STR) + '"', C.str])
    } else if (t < 0.86) {
      toks.push([String(Math.floor(R() * 900)), C.num])
    } else {
      toks.push([pick(R, ID) + '()', C.fn])
    }
  }

  toks.push([pick(R, [';', ',', '{', '}', '']), C.op])

  return { indent, toks, w }
}

function lineTiles(x, L, col, row) {
  let c = col + L.indent
  const out = []

  for (const [s, ink] of L.toks) {
    for (const ch of s) {
      if (ch !== ' ' && c < col + L.w) {
        out.push(put(tile(x, null, lift(ink), ch), c, row))
      }

      c++
    }

    c++
  }

  return out.join('')
}

// ---------------------------------------------------------------- Vim Night
function vim(name) {
  const x = ctx()
  const BG = '#0b0d14'
  const C = { kw: '#bb9af7', id: '#a9b1d6', op: '#89ddff', str: '#9ece6a', num: '#ff9e64', cm: '#565f89', fn: '#7aa2f7' }
  const b = []

  const pane = (c0, w, seed) => {
    const R = rng(seed)
    const lines = Array.from({ length: 36 }, () => {
      const L = codeLine(R, C, w)

      return (r, n) => T(x, String((n % 99) + 1).padStart(3, ' '), c0 - 5, r, '#3b4261') + lineTiles(x, L, c0, r)
    })

    return scroller(x, lines, c0 - 5, w + 5, 4, 1, 160)
  }

  b.push(plate(1, 22, 46, lerp(BG, C.fn, 0.11)), plate(72, 22, 46, lerp(BG, C.fn, 0.11)))
  b.push(pane(7, 38, 201), pane(79, 36, 202))
  b.push(`<g class="cur">${put(tile(x, '#c0caf5', '#0b0d14', ' '), 17, 22)}</g>`)
  b.push(plate(0, 47, 120, '#10131f'), T(x, ' NORMAL ', 0, 47, BG, C.fn), T(x, 'src/main.rs [+]', 10, 47, '#7a88b8'), T(x, 'utf-8   rust   42:17   62%', 92, 47, '#7a88b8'))
  b.push(...signature(x, name, C.fn, '#c0caf5', 1, 48))

  return shell(x, { bg: [BG, '#07080d'], veil: BG, veilA: 0.55, grid: '#7aa2f7', gridA: 0.018, fontSize: 17, weight: 700, body: b.join('') })
}

// ---------------------------------------------------------------- Hex Dump
function hexdump(name) {
  const x = ctx()
  const R = rng(211)
  const BG = '#061012'
  const DIM = '#27635f'
  const MID = '#46aaa2'
  const HI = '#a8fff4'
  const b = []

  const block = (c0, base) => {
    const out = []
    const hot = []

    for (let i = 0; i < 20; i++) {
      const r = 5 + i * 2
      out.push(T(x, (base + i * 8).toString(16).padStart(6, '0') + ':', c0, r, '#2e8077'))
      let ascii = ''

      for (let k = 0; k < 8; k++) {
        const v = R() < 0.16 ? '00' : Math.floor(R() * 256).toString(16).padStart(2, '0')
        const c = c0 + 8 + k * 3
        out.push(T(x, v, c, r, v === '00' ? '#123835' : R() < 0.25 ? MID : DIM))

        if (R() < 0.07) {
          hot.push(`<g class="hot" style="animation-delay:${(R() * 3).toFixed(2)}s">${T(x, v, c, r, HI)}</g>`)
        }

        const n = parseInt(v, 16)
        ascii += n > 32 && n < 127 ? String.fromCharCode(n) : '.'
      }

      out.push(T(x, ascii, c0 + 8 + 24 + 1, r, '#20524e'))
    }

    return out.join('') + hot.join('')
  }

  const band = c0 => mover(x, [[0, 0], [0, 38]], 19, 0, plate(c0 - 1, 5, 41, lerp(BG, '#56d4c6', 0.13)), 'loop')

  const b0 = band(3)
  const b1 = band(76)
  b.push(b0, b1, block(3, 0x4010a0), block(76, 0x7ffd3c0))
  b.push(...signature(x, name, '#46aaa2', '#a8fff4', 4, 46))

  return shell(x, { bg: [BG, '#030809'], veil: BG, veilA: 0.5, grid: '#56d4c6', gridA: 0.02, fontSize: 17, weight: 700, body: b.join('') })
}

// ---------------------------------------------------------------- Assembly
function asm(name) {
  const x = ctx()
  const R = rng(221)
  const BG = '#0f0c08'
  const AMB = '#e0af68'
  const MN = ['mov', 'lea', 'add', 'sub', 'xor', 'cmp', 'jne', 'call', 'push', 'pop', 'imul', 'test', 'jmp', 'shl', 'and']
  const RG = ['rax', 'rbx', 'rcx', 'rdx', 'rsi', 'rdi', 'rbp', 'rsp', 'r8', 'r9', 'r10', 'r11', 'r12', 'r13', 'r14', 'r15']
  const b = []
  let a = 0x4011a0

  for (let i = 0; i < 19; i++) {
    const r = 5 + i * 2
    a += 3 + Math.floor(R() * 4)
    const m = pick(R, MN)
    const opr = m === 'call' || m[0] === 'j' ? '0x' + (0x401000 + Math.floor(R() * 0x900)).toString(16) : `${pick(R, RG)}, ${R() < 0.5 ? '[' + pick(R, RG) + '-0x' + (8 * (1 + Math.floor(R() * 8))).toString(16) + ']' : pick(R, RG)}`
    b.push(T(x, '0x' + a.toString(16), 3, r, '#6b5a3a'), T(x, m, 14, r, m === 'call' || m[0] === 'j' ? '#f7768e' : '#bb9af7'), T(x, opr, 20, r, '#c9b48a'))
  }

  // the instruction pointer walks the listing
  const ip = []

  for (let i = 0; i < 19; i++) {
    ip.push([0, i * 2])
  }

  b.unshift(mover(x, ip, 21, 0, plate(1, 5, 46, lerp(BG, AMB, 0.15)) + put(tile(x, null, AMB, '>'), 1, 5), 'loop'))

  b.push(T(x, 'registers', 84, 3, '#6b5a3a'))

  for (let i = 0; i < 16; i++) {
    const r = 5 + i * 2
    const v = '0x' + Array.from({ length: 12 }, () => '0123456789abcdef'[Math.floor(R() * 16)]).join('')
    b.push(T(x, RG[i].padEnd(4, ' '), 84, r, '#8a7448'), T(x, v, 89, r, '#7d6b45'))

    if (R() < 0.35) {
      b.push(`<g class="hot" style="animation-delay:${(R() * 3).toFixed(2)}s">${T(x, v, 89, r, '#ffe0a0')}</g>`)
    }
  }

  b.push(T(x, 'ZF=1  CF=0  SF=0  OF=0', 84, 40, '#6b5a3a'))
  b.push(...signature(x, name, '#8a7448', AMB, 4, 46))

  return shell(x, { bg: [BG, '#070504'], veil: BG, veilA: 0.55, grid: AMB, gridA: 0.016, fontSize: 17, weight: 700, body: b.join('') })
}

// ---------------------------------------------------------------- Sorting
function sorting(name) {
  const x = ctx()
  const R = rng(231)
  const BG = '#0d0910'
  const PINK = '#f7768e'
  const n = 54
  const b = []
  const vals = Array.from({ length: n }, (_, i) => (i < 20 ? 3 + Math.floor((i / 20) * 12) + Math.floor(R() * 2) : 3 + Math.floor(R() * 24)))

  vals.forEach((h, i) => {
    const c = 6 + i * 2
    const f = lerp('#2a1424', PINK, 0.3 + (h / 28) * 0.7)
    const tiles = []

    for (let k = 0; k < h; k++) {
      tiles.push(put(tile(x, f, f, ' '), c, 44 - k))
    }

    b.push(phased(tiles, 10 + i))
  })

  b.push(trace(x, [[4, 45], [114, 45]], null, '#4a3040', '=').join(''))
  b.push(mover(x, [[0, 0], [106, 0]], 17, 0, `<rect x="${6 * CW - 4}" y="${12 * CH}" width="${3 * CW}" height="${33 * CH}" fill="#ffffff" fill-opacity=".13"/>`, 'loop'))
  b.push(T(x, 'quicksort(arr, 0, 53)', 6, 3, '#6a4a5a'), T(x, 'i = 18   j = 31   pivot = 22', 6, 4, '#4f3645'))
  b.push(...signature(x, name, '#8a5468', '#f7768e', 4, 47))

  return shell(x, { bg: [BG, '#060309'], veil: BG, veilA: 0.45, grid: PINK, gridA: 0.016, fontSize: 16, weight: 700, body: b.join('') })
}

// ---------------------------------------------------------------- Big O
function bigO(name) {
  const x = ctx()
  const BG = '#070b12'
  const b = []
  const O = [12, 42]

  for (let c = 12; c <= 108; c += 6) {
    for (let r = 8; r <= 42; r += 5) {
      b.push(put(tile(x, null, '#1a2536', '.'), c, r))
    }
  }

  b.push(trace(x, [[O[0], O[1]], [110, O[1]]], null, '#33475f', '-').join(''), trace(x, [[O[0], 5], [O[0], O[1]]], null, '#33475f', '-', '|').join(''))
  b.push(T(x, 'n', 111, 42, '#52708f'), T(x, 'time', 5, 5, '#52708f'))

  const curves = [
    ['O(1)', '#9ece6a', n => 3],
    ['O(log n)', '#7dcfff', n => 2 + (9 * Math.log2(1 + n * 15)) / 4],
    ['O(n)', '#e0af68', n => 2 + 22 * n],
    ['O(n log n)', '#ff9e64', n => 2 + (40 * n * Math.log2(1 + n * 7)) / 3],
    ['O(n^2)', '#f7768e', n => 2 + 60 * n * n],
    ['O(2^n)', '#bb9af7', n => 2 + 0.12 * (Math.pow(2, 9 * n) - 1)],
  ]

  curves.forEach(([label, color, h], k) => {
    const g = tile(x, lerp(BG, color, 0.38), color, '*')
    const pts = []
    let prev = null

    for (let c = 12; c <= 108; c++) {
      const r = Math.round(O[1] - h((c - 12) / 96))

      if (r < 6) {
        break
      }

      if (prev) {
        b.push(...line(prev, [c, r], g))
      }

      prev = [c, r]
      pts.push(prev)
    }

    if (prev) {
      const clipped = prev[1] <= 8
      const lc = clipped ? prev[0] - Math.floor(label.length / 2) : Math.min(prev[0] + 2, 108 - label.length + 1)
      b.push(T(x, label, lc, clipped ? 4 - (clipped && k % 2) : prev[1] - 1, color))
      const path = pts.filter((_, i) => i % 6 === 0)
      path.push(prev)
      b.push(mover(x, path, 9 + k * 1.7, -k * 1.3, put(tile(x, color, '#000', ' '), path[0][0], path[0][1]), 'loop'))
    }
  })

  b.push(...signature(x, name, '#52708f', '#7dcfff', 4, 46))

  return shell(x, { bg: [BG, '#04070c'], veil: BG, veilA: 0.3, grid: '#7dcfff', gridA: 0.016, fontSize: 16, weight: 700, body: b.join('') })
}

// ---------------------------------------------------------------- Diff
function diff(name) {
  const x = ctx()
  const BG = '#0b0e0b'
  const G = '#9ece6a'
  const RD = '#f7768e'
  const b = []

  const block = (c0, seed) => {
    const R = rng(seed)
    const w = 36
    const lines = []
    const mk = (kind, text) => (r) => {
      if (kind === '+') {
        return plate(c0 - 1, r, w + 2, lerp(BG, '#3fb950', 0.15)) + T(x, text, c0, r, G)
      }

      if (kind === '-') {
        return plate(c0 - 1, r, w + 2, lerp(BG, RD, 0.15)) + T(x, text, c0, r, RD)
      }

      return T(x, text, c0, r, kind === '@' ? '#7aa2f7' : kind === 'h' ? '#bb9af7' : '#4c5a4c')
    }

    const code = () => {
      const L = codeLine(R, { kw: 0, id: 0, op: 0, str: 0, num: 0, cm: 0, fn: 0 }, w)
      let s = ' '.repeat(L.indent)

      for (const [t] of L.toks) {
        s += t + ' '
      }

      return s.trimEnd().slice(0, w - 2) || 'pass'
    }

    for (let h = 0; h < 4; h++) {
      lines.push(mk('h', `diff --git a/src/${pick(R, ['net', 'core', 'io', 'sched'])}.rs`), mk('@', `@@ -${10 + h * 40},7 +${10 + h * 40},9 @@`))

      for (let i = 0; i < 2; i++) {
        lines.push(mk(' ', '  ' + code()))
      }

      for (let i = 0; i < 1 + Math.floor(R() * 2); i++) {
        lines.push(mk('-', '- ' + code()))
      }

      for (let i = 0; i < 2 + Math.floor(R() * 2); i++) {
        lines.push(mk('+', '+ ' + code()))
      }

      lines.push(mk(' ', '  ' + code()))
    }

    return scroller(x, lines.slice(0, 20), c0 - 1, w + 2, 4, 2, 130)
  }

  b.push(block(3, 241), block(80, 242))
  b.push(...signature(x, name, '#5f8a52', G, 4, 46))

  return shell(x, { bg: [BG, '#050805'], veil: BG, veilA: 0.55, grid: G, gridA: 0.014, fontSize: 17, weight: 700, body: b.join('') })
}

// ---------------------------------------------------------------- Green CI
function tests(name) {
  const x = ctx()
  const R = rng(251)
  const BG = '#07100a'
  const G = '#3fb950'
  const b = []

  const grid = c0 => {
    const base = []
    const pass = []
    const bad = []

    for (let j = 0; j < 18; j++) {
      for (let i = 0; i < 14; i++) {
        const c = c0 + i * 2
        const r = 5 + j * 2
        base.push(put(tile(x, lerp(BG, G, 0.16), lerp(BG, G, 0.55), 'o'), c, r))
        const t = R()

        if (t < 0.45) {
          pass.push(`<g class="hot" style="animation-delay:${(R() * 3.2).toFixed(2)}s">${put(tile(x, lerp(BG, G, 0.55), '#e6ffe9', '+'), c, r)}</g>`)
        } else if (t < 0.5) {
          bad.push(put(tile(x, lerp(BG, '#ff5f56', 0.5), '#ffd5d1', 'x'), c, r))
        }
      }
    }

    return phased(base, 21) + pass.join('') + phased(bad, 22)
  }

  b.push(grid(4), grid(87))
  b.push(T(x, 'PASS  1284 / 1284   coverage 94%', 4, 3, '#3d7a4a'), T(x, 'watching for changes...', 87, 3, '#2f5f3a'))

  for (let c = 4; c < 36; c++) {
    b.push(put(tile(x, lerp(BG, G, 0.12), BG, ' '), c, 43))
  }

  b.push(mover(x, [[0, 0], [28, 0]], 6, 0, [0, 1, 2, 3, 4].map(k => put(tile(x, lerp(BG, G, 0.8 - k * 0.14), BG, ' '), 4 + k, 43)).join(''), 'loop'))
  b.push(...signature(x, name, '#3d7a4a', '#7dff9a', 4, 46))

  return shell(x, { bg: [BG, '#030804'], veil: BG, veilA: 0.45, grid: G, gridA: 0.014, fontSize: 16, weight: 700, body: b.join('') })
}

// ---------------------------------------------------------------- The Void
function voidCursor(name) {
  const x = ctx()
  const R = rng(261)
  const BG = '#06070b'
  const INK = '#a9b1d6'
  const b = []
  const ghost = [['$ make clean', 0.4], ['$ make -j8', 0.46], ['   ok  built in 3.2s', 0.36], ['$ git add -A', 0.55], ['$ git commit -m "ship it"', 0.7], ['$ git push', 0.85]]

  ghost.forEach(([s, o], i) => {
    b.push(`<g opacity="${o}">${T(x, s, 10, 16 + i, INK)}</g>`)
  })

  b.push(T(x, `${name}@void:~$`, 10, 23, '#7a82a8'))
  b.push(`<g class="cur">${put(tile(x, INK, BG, ' '), 10 + name.length + 8, 23)}${put(tile(x, INK, BG, ' '), 11 + name.length + 8, 23)}</g>`)
  b.push(...particles(x, R, { n: 22, c: [70, 117], r: [3, 22], dur: [14, 26], inks: ['#4a5488', '#6a74a8', '#3a4272'], glyphs: '01.:', dx: 0, dy: 20 }))
  b.push(`<rect class="gl" width="1920" height="1080" fill="#5a6ad0" fill-opacity=".025"/>`)
  b.push(...signature(x, name, '#4a5278', INK, 4, 46))

  return shell(x, { bg: [BG, '#020306'], veil: BG, veilA: 0.25, grid: INK, gridA: 0.012, fontSize: 20, weight: 700, body: b.join('') })
}

// ---------------------------------------------------------------- Compiler
function compiler(name) {
  const x = ctx()
  const BG = '#0d0b16'
  const P = '#bb9af7'
  const b = []
  const spec = [
    'Program',
    [
      ['Func', [['Params', [['Ident'], ['Ident']]], ['Block', [['Let', [['Ident'], ['BinOp', [['Num'], ['Ident']]]]], ['Ret', [['Call', [['Ident'], ['Num']]]]]]]]],
      ['Func', [['Block', [['If', [['BinOp', [['Ident'], ['Num']]], ['Ret', [['Num']]]]]]]]],
      ['Const', [['Ident'], ['Str']]],
    ],
  ]

  let leaf = 0
  const nodes = []

  const lay = (n, d) => {
    const kids = (n[1] ?? []).map(k => lay(k, d + 1))
    const c = kids.length ? Math.round((kids[0].c + kids[kids.length - 1].c) / 2) : 14 + 8 * leaf++
    const me = { label: n[0], c, d, kids }
    nodes.push(me)

    return me
  }

  const root = lay(spec[0] === 'Program' ? ['Program', spec[1]] : spec, 0)
  const row = d => 6 + d * 7

  const edges = n => {
    for (const k of n.kids) {
      b.push(...trace(x, [[n.c, row(n.d) + 1], [n.c, row(n.d) + 3], [k.c, row(n.d) + 3], [k.c, row(k.d) - 1]], null, lerp(BG, P, 0.4), '-', '|'))
      edges(k)
    }
  }

  edges(root)

  nodes
    .sort((a, c) => a.d - c.d || a.c - c.c)
    .forEach((n, i) => {
      const c0 = n.c - Math.floor(n.label.length / 2)
      b.push(T(x, n.label, c0, row(n.d), lerp(BG, P, 0.9), lerp(BG, P, 0.26)))
      b.push(`<g class="hot" style="animation-delay:${(i * 0.14).toFixed(2)}s">${T(x, n.label, c0, row(n.d), '#f3eaff', lerp(BG, P, 0.5))}</g>`)
    })

  b.push(T(x, 'lex  >  parse  >  check  >  emit', 4, 44, '#5b4f80'))
  b.push(...signature(x, name, '#5b4f80', P, 4, 46))

  return shell(x, { bg: [BG, '#05040a'], veil: BG, veilA: 0.28, grid: P, gridA: 0.016, fontSize: 16, weight: 700, body: b.join('') })
}

// ---------------------------------------------------------------- Kernel Panic
function panic(name) {
  const x = ctx()
  const BG = '#12080a'
  const RD = '#ff5f56'
  const b = []
  const FN = ['core::panicking::panic_fmt', 'alloc::vec::Vec::index', 'tokio::runtime::block_on', 'std::sys::unix::thread', 'app::server::handle', 'hyper::proto::h1::poll', 'app::main', 'std::rt::lang_start']
  const FILE = ['src/main.rs', 'src/server.rs', 'src/net/io.rs', 'src/sched.rs', 'src/pool.rs']

  const block = (c0, seed) => {
    const R = rng(seed)
    const lines = []
    lines.push((r) => T(x, "thread 'main' panicked at src/main.rs:42:17", c0, r, '#ff8a80'))
    lines.push((r) => T(x, 'index out of bounds: len is 3, index is 7', c0, r, '#c0524c'))
    lines.push((r) => T(x, 'stack backtrace:', c0, r, '#8a3b38'))

    for (let i = 0; i < 8; i++) {
      const fn = pick(R, FN)
      const addr = '0x7f' + Array.from({ length: 6 }, () => '0123456789abcdef'[Math.floor(R() * 16)]).join('')
      const loc = `${pick(R, FILE)}:${10 + Math.floor(R() * 400)}:${1 + Math.floor(R() * 30)}`
      lines.push((r) => T(x, String(i).padStart(2, ' ') + ': ', c0, r, '#8a3b38') + T(x, addr, c0 + 4, r, '#6e3a3c') + T(x, ' ' + fn, c0 + 15, r, '#ff8a80'))
      lines.push((r) => T(x, 'at ' + loc, c0 + 6, r, '#6e3a3c'))
    }

    lines.push((r) => T(x, 'note: run with RUST_BACKTRACE=full', c0, r, '#6e3a3c'))

    return scroller(x, lines.slice(0, 20), c0 - 1, 44, 4, 2, 150)
  }

  b.push(block(3, 271), block(75, 272))
  b.push(`<g class="hot" style="animation-delay:.4s">${plate(0, 46, 120, lerp(BG, RD, 0.12))}</g>`)
  b.push(...signature(x, name, '#8a3b38', RD, 4, 46))

  return shell(x, { bg: [BG, '#070304'], veil: BG, veilA: 0.55, grid: RD, gridA: 0.014, fontSize: 17, weight: 700, body: b.join('') })
}

export const DEV = { vim, hexdump, asm, sorting, bigO, diff, tests, voidCursor, compiler, panic }
