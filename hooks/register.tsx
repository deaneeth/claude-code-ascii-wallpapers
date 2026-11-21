// ASCII Wallpaper Collection: 93 live ASCII-tile wallpapers behind the chat in Claude Desktop, in nine modes
// (Focus, Chill, Nature, Space, Energy, Dev, Creatures, Art, Minimal). Each scene has its own colors and frosted panels, a /wallpaper picker sits
// above the prompt, and a handle setting signs your name into the scenes. The pick is kept for the next session.
import { atom, read, update } from 'claude-code'
import type { EngineInterface, Register, ThemeSetArgs } from 'claude-code'

import { SCENES } from './art.js'
import { THUMBS } from './thumbs.js'
import { hsl } from './engine.js'
import { makeColors } from './make-colors.js'

const PLUGIN = 'ascii-wallpaper-collection'
// bump with each change to a scene: a new scene name makes the app draw the new picture, not one it kept
const BUILD = 4

type Key = keyof typeof SCENES
type Tone = 'dark' | 'light'
type Mode = 'focus' | 'chill' | 'nature' | 'space' | 'energy' | 'dev' | 'creatures' | 'art' | 'minimal'
type Wall = { key: Key; name: string; mode: Mode; tone: Tone; hue: number; accent: string; blurb: string }

// The nine modes. Work mode is Focus; enjoy mode is Energy; Dev is for people who live in the terminal.
const MODES: { key: Mode; name: string; blurb: string; hotkey: string; aliases: string[] }[] = [
  { key: 'focus', name: 'Focus', blurb: 'work mode: calm, readable, low-distraction', hotkey: 'f', aliases: ['work', 'deep', 'calm'] },
  { key: 'chill', name: 'Chill', blurb: 'cozy and slow', hotkey: 'c', aliases: ['cozy', 'relax'] },
  { key: 'nature', name: 'Nature', blurb: 'weather, water and mountains', hotkey: 'n', aliases: ['outdoors', 'weather'] },
  { key: 'space', name: 'Space', blurb: 'the dark between things', hotkey: 's', aliases: ['cosmos', 'sky'] },
  { key: 'energy', name: 'Energy', blurb: 'enjoy mode: loud, bright, moving', hotkey: 'e', aliases: ['enjoy', 'fun', 'hype', 'play'] },
  { key: 'dev', name: 'Dev', blurb: 'hardcore coder: dark, moody, minimal', hotkey: 'd', aliases: ['code', 'coder', 'hacker', 'hardcore', 'hard'] },
  { key: 'creatures', name: 'Creatures', blurb: 'things that live in the picture', hotkey: 'a', aliases: ['animals', 'creature', 'pets', 'wildlife'] },
  { key: 'art', name: 'Art', blurb: 'graphic styles: halftone, dither, riso', hotkey: 'r', aliases: ['style', 'graphic', 'abstract'] },
  { key: 'minimal', name: 'Minimal', blurb: 'almost nothing behind the chat', hotkey: 'm', aliases: ['min', 'quiet', 'plain', 'subtle'] },
]

// name, key, mode, tone, hue, accent, one-line blurb
const WALLS: Wall[] = (
  [
    // Focus
    ['Silicon', 'silicon', 'focus', 'dark', 160, '#d4863f', 'a die waking up'],
    ['Attention', 'attention', 'focus', 'dark', 255, '#8b7cf6', 'heads reading tokens'],
    ['Commit Graph', 'gitGraph', 'focus', 'dark', 215, '#58a6ff', 'branches and merges'],
    ['Network Mesh', 'mesh', 'focus', 'dark', 195, '#4fd0e8', 'packets on a graph'],
    ['Server Room', 'serverRack', 'focus', 'dark', 210, '#58a6ff', 'racks and blinking lights'],
    ['Terminal', 'terminal', 'focus', 'dark', 38, '#ffb000', 'amber phosphor logs'],
    ['Library', 'library', 'focus', 'dark', 25, '#ffb454', 'shelves, a lamp, dust'],
    ['Constellations', 'constellations', 'focus', 'dark', 225, '#8aa0ff', 'stars joined by lines'],
    ['Blueprint', 'blueprint', 'focus', 'light', 210, '#1f6fb2', 'daylight drafting'],
    ['Graph Paper', 'graphPaper', 'focus', 'light', 210, '#1f6fb2', 'a curve being traced'],
    ['Zen Garden', 'zen', 'focus', 'light', 40, '#2f6f8f', 'raked sand, falling petals'],
    ['Tide', 'tide', 'focus', 'light', 200, '#2f7fa8', 'a slow sea at dawn'],
    // Chill
    ['Night Shift', 'night', 'chill', 'dark', 228, '#8fb5ff', 'moon, code, a prompt'],
    ['Rainy Window', 'rainy', 'chill', 'dark', 210, '#ffb454', 'coffee and rain'],
    ['Snow Cabin', 'snowCabin', 'chill', 'dark', 222, '#ffcf6a', 'a lit window in the snow'],
    ['Lighthouse', 'lighthouse', 'chill', 'dark', 215, '#fff2b0', 'a beam over black water'],
    ['Campfire', 'campfire', 'chill', 'dark', 20, '#ff9a3c', 'flames and sparks'],
    ['Lo-fi Room', 'lofi', 'chill', 'dark', 270, '#ffb86a', 'string lights and a desk'],
    ['Lava Lamp', 'lavaLamp', 'chill', 'dark', 285, '#ff7ac0', 'slow rising blobs'],
    ['Night Train', 'nightTrain', 'chill', 'dark', 205, '#ffd070', 'lit windows crossing hills'],
    ['Cherry Blossom', 'cherry', 'chill', 'light', 350, '#d84a78', 'petals on the wind'],
    ['Autumn', 'autumn', 'chill', 'dark', 15, '#f0a030', 'bare trees, falling leaves'],
    // Nature
    ['Aurora', 'aurora', 'nature', 'dark', 190, '#2dd4bf', 'northern lights'],
    ['Misty Peaks', 'mist', 'nature', 'light', 215, '#4a6a9c', 'ridges in the fog'],
    ['Dunes', 'dunes', 'nature', 'light', 35, '#a8582a', 'sand, wind, a caravan'],
    ['Canyon', 'canyon', 'nature', 'dark', 12, '#ffb27a', 'red stone and a river'],
    ['Ocean Sunset', 'oceanSunset', 'nature', 'dark', 300, '#ffa070', 'the sun going under'],
    ['Waterfall', 'waterfall', 'nature', 'dark', 175, '#7ac8e8', 'spray and a rainbow'],
    ['Deep Sea', 'deepSea', 'nature', 'dark', 200, '#7ad8ff', 'light rays and an angler'],
    ['Bamboo Grove', 'bamboo', 'nature', 'dark', 140, '#7ad88a', 'stalks swaying in the dark'],
    ['Thunderstorm', 'thunder', 'nature', 'dark', 225, '#fffbd0', 'lightning over a city'],
    // Space
    ['Orbit', 'orbit', 'space', 'dark', 235, '#e0a35c', 'a ringed planet'],
    ['Nebula', 'nebula', 'space', 'dark', 275, '#ff7ac0', 'colored gas clouds'],
    ['Galaxy', 'galaxy', 'space', 'dark', 255, '#ffd28a', 'two spirals'],
    ['Black Hole', 'blackHole', 'space', 'dark', 20, '#ffd9a0', 'a bent ring of light'],
    ['Rocket Launch', 'rocket', 'space', 'dark', 230, '#ffa04a', 'liftoff from the pad'],
    ['Meteor Shower', 'meteors', 'space', 'dark', 228, '#fff1c9', 'streaks over a campsite'],
    ['Warp', 'warp', 'space', 'dark', 215, '#7ad8ff', 'stars at light speed'],
    // Energy
    ['Iron', 'iron', 'energy', 'dark', 15, '#ff7a3d', 'one more rep'],
    ['Code Rain', 'codeRain', 'energy', 'dark', 140, '#3dff8a', 'green phosphor'],
    ['Outrun', 'outrun', 'energy', 'dark', 285, '#ff4fd8', 'neon horizon'],
    ['Equalizer', 'equalizer', 'energy', 'dark', 250, '#5affa0', 'a VU meter dancing'],
    ['Neon City', 'neonCity', 'energy', 'dark', 300, '#7affff', 'signs and flying cars'],
    ['Fireworks', 'fireworks', 'energy', 'dark', 235, '#ffd23d', 'bursts over a skyline'],
    ['Disco', 'disco', 'energy', 'dark', 280, '#ffd23d', 'mirror ball and a floor'],
    ['LED Plasma', 'plasma', 'energy', 'dark', 265, '#ff7ac8', 'a matrix of color'],
    ['Invaders', 'invaders', 'energy', 'dark', 160, '#5affb0', 'the fleet marches'],
    ['Pong', 'pong', 'energy', 'dark', 240, '#8aa0ff', 'ball, paddles, a rally'],
    ['Snake', 'snake', 'energy', 'dark', 140, '#5aff8a', 'a long snake and apples'],
    ['Tetris Rain', 'tetris', 'energy', 'dark', 245, '#ffd23d', 'pieces falling in two wells'],
    ['Volcano', 'volcano', 'energy', 'dark', 10, '#ff9a3a', 'lava bombs and embers'],
    // Dev
    ['Vim Night', 'vim', 'dev', 'dark', 228, '#7aa2f7', 'a modal editor at 2am'],
    ['Hex Dump', 'hexdump', 'dev', 'dark', 175, '#56d4c6', 'bytes and a scanning band'],
    ['Assembly', 'asm', 'dev', 'dark', 38, '#e0af68', 'an instruction pointer walks'],
    ['Sorting', 'sorting', 'dev', 'dark', 345, '#f7768e', 'bars and a comparing cursor'],
    ['Big O', 'bigO', 'dev', 'dark', 215, '#7dcfff', 'six growth curves'],
    ['Diff', 'diff', 'dev', 'dark', 105, '#9ece6a', 'hunks, adds and removes'],
    ['Green CI', 'tests', 'dev', 'dark', 140, '#3fb950', 'a test matrix going green'],
    ['The Void', 'voidCursor', 'dev', 'dark', 230, '#a9b1d6', 'a prompt and a cursor'],
    ['Compiler', 'compiler', 'dev', 'dark', 265, '#bb9af7', 'a syntax tree being walked'],
    ['Kernel Panic', 'panic', 'dev', 'dark', 355, '#ff5f56', 'a stack trace in red'],
    // Light scenes live in their mode, marked by tone
    ['Greenhouse', 'greenhouse', 'focus', 'light', 140, '#2f7a52', 'plants in sunbeams'],
    ['Sketchbook', 'sketch', 'focus', 'light', 40, '#4a463e', 'a drawing being made'],
    ['Snow Day', 'snowDay', 'chill', 'light', 210, '#4a6a90', 'a snowman and a sled'],
    ['Pastel City', 'pastelCity', 'chill', 'light', 340, '#d870a0', 'balloons over soft towers'],
    ['Kite Day', 'kite', 'chill', 'light', 205, '#3a9ae8', 'four kites on strings'],
    ['Spring Meadow', 'meadow', 'nature', 'light', 110, '#3f8a35', 'flowers, butterflies, clouds'],
    ['Low Tide', 'beach', 'nature', 'light', 195, '#2eaed0', 'foam, gulls and a palm'],
    ['Lavender Rows', 'lavender', 'nature', 'light', 270, '#6a48a8', 'rows to the horizon, bees'],
    ['Summer Wheat', 'wheat', 'nature', 'light', 45, '#b8801a', 'wind crossing a field'],
    ['Spring Rain', 'springRain', 'nature', 'dark', 150, '#6ac07a', 'tulips in the rain'],
    ['Harvest Moon', 'harvestMoon', 'nature', 'dark', 30, '#ff9a3a', 'pumpkins under a huge moon'],
    ['Ice Lake', 'iceLake', 'nature', 'dark', 215, '#a0d8ff', 'skaters on a frozen lake'],
    // Creatures
    ['Lily Pond', 'koi', 'creatures', 'dark', 185, '#ff8a3a', 'koi, lily pads, ripples'],
    ['Moon Jellies', 'jellies', 'creatures', 'dark', 250, '#c88aff', 'drifting, pulsing jellyfish'],
    ['Whale Song', 'whale', 'creatures', 'dark', 220, '#8aa8d0', 'a whale under the moon'],
    ['Butterfly House', 'butterflies', 'creatures', 'dark', 150, '#ffd23d', 'butterflies over flowers'],
    ['Window Cat', 'cat', 'creatures', 'dark', 30, '#ffd070', 'rain, a skyline, a cat'],
    ['Murmuration', 'birds', 'creatures', 'dark', 330, '#ffb070', 'starlings at dusk'],
    ['Firefly Field', 'fireflies', 'creatures', 'dark', 160, '#e8ff70', 'blinking over tall grass'],
    ['Night Owl', 'owl', 'creatures', 'dark', 225, '#ffd23d', 'a blinking owl on a branch'],
    ['Sea Turtle', 'turtle', 'creatures', 'dark', 195, '#3ad0e8', 'a turtle over the reef'],
    ['Fox in Snow', 'fox', 'creatures', 'dark', 225, '#e8742a', 'a fox trots through snow'],
    // Art
    ['Halftone', 'halftone', 'art', 'dark', 340, '#ff8a7a', 'a sun made of dots'],
    ['Dither Waves', 'dither', 'art', 'dark', 205, '#7ad8ff', 'a gradient turned to noise'],
    ['Riso Hills', 'riso', 'art', 'light', 340, '#ff5a8a', 'two inks, slightly off register'],
    ['Flow Field', 'flow', 'art', 'dark', 285, '#ff6ac0', 'sparks riding streamlines'],
    ['Sine Stack', 'sineStack', 'art', 'dark', 300, '#ff6ac0', 'seven waves sliding past'],
    ['Radar', 'radar', 'art', 'dark', 140, '#3dff8a', 'a sweep and flaring blips'],
    // Minimal
    ['Horizon', 'horizon', 'minimal', 'dark', 225, '#ffb87a', 'one line and a small sun'],
    ['Dot Grid', 'dotgrid', 'minimal', 'dark', 230, '#a8b4d8', 'dots breathing outward'],
    ['Static', 'grain', 'minimal', 'dark', 240, '#8a8a98', 'quiet film grain'],
    ['Slow Lines', 'lines', 'minimal', 'dark', 225, '#8a9ad8', 'five lines, drifting'],
  ] as [string, Key, Mode, Tone, number, string, string][]
).map(([name, key, mode, tone, hue, accent, blurb]) => ({ name, key, mode, tone, hue, accent, blurb }))

const looks = new Map<string, ThemeSetArgs>()
const scenes = new Map<string, string>()

// What a person can change without touching the code. Kept across sessions in the store.
type Settings = {
  accent: string | null
  glass: { blur: number; opacity: number } | null
  auto: 'off' | 'daynight' | 'shuffle'
  shuffleMin: number
  reactive: boolean
}

const DEFAULTS: Settings = { accent: null, glass: null, auto: 'off', shuffleMin: 30, reactive: false }

async function settingsOf($: EngineInterface): Promise<Settings> {
  const saved = (await $.store.get('settings')) as Partial<Settings> | null | undefined

  return { ...DEFAULTS, ...(saved && typeof saved === 'object' ? saved : {}) }
}

async function saveSettings($: EngineInterface, patch: Partial<Settings>): Promise<Settings> {
  const next = { ...(await settingsOf($)), ...patch }
  await $.store.set('settings', next)
  looks.clear()
  await update($, tick, n => n + 1)

  return next
}

// A whole window palette from one hue and one accent.
function colorsFor(w: Wall, accent: string): ThemeSetArgs['colors'] {
  const dark = w.tone === 'dark'
  const h = w.hue
  const s = dark ? [hsl(h, 32, 6), hsl(h, 30, 8.5), hsl(h, 28, 11.5), hsl(h, 26, 14)] : [hsl(h, 30, 87), hsl(h, 30, 91), hsl(h, 32, 95), hsl(h, 32, 95)]
  const t = dark ? [hsl(h, 25, 94), hsl(h, 18, 78), hsl(h, 12, 62)] : [hsl(h, 40, 9), hsl(h, 25, 24), hsl(h, 18, 34)]
  const roles = dark
    ? { accent, danger: '#e0594d', success: '#4fd2a0', warning: '#f0b04a', pro: '#a08cf0' }
    : { accent, danger: '#c9403a', success: '#2f8a52', warning: '#a86f14', pro: '#6d4f94' }

  return makeColors({
    label: w.name,
    only: w.tone,
    roles,
    [w.tone]: { gray: { anchors: { 'surface-0': s[0], 'surface-1': s[1], 'surface-2': s[2], 'surface-3': s[3], 'text-primary': t[0], 'text-secondary': t[1], 'text-muted': t[2] } } },
    codeTheme: dark ? { dark: 'nord' } : undefined,
  }).theme
}

const HEX = /^#[0-9a-f]{6}$/i

function lookOf(w: Wall, set: Settings): ThemeSetArgs {
  const id = `${w.key}|${set.accent}|${set.glass?.blur}|${set.glass?.opacity}`
  let look = looks.get(id)

  if (!look) {
    const dark = w.tone === 'dark'
    look = {
      colors: colorsFor(w, set.accent ?? w.accent),
      backdrop: { scene: `cw-${w.key}-${BUILD}`, glass: { blur: set.glass?.blur ?? 18, tint: dark ? hsl(w.hue, 32, 5) : hsl(w.hue, 30, 93), opacity: set.glass?.opacity ?? 0.5 } },
      overrideColorScheme: w.tone,
    }
    looks.set(id, look)
  }

  return look
}

// A colors-only theme, no picture: `color:<hue>:<dark|light>`.
const COLOR_KEY = /^color:(\d{1,3}):(dark|light)$/

function colorWall(key: string): Wall | undefined {
  const m = COLOR_KEY.exec(key)

  if (!m) {
    return undefined
  }

  const hue = Number(m[1]) % 360
  const tone = m[2] as Tone

  return { key: key as Key, name: `Color ${hue}`, mode: 'minimal', tone, hue, accent: hsl(hue, 62, tone === 'dark' ? 62 : 40), blurb: 'colors only' }
}

// A handle that is safe to draw in a scene: letters, digits and . _ - only, 16 at most.
function handleOf(value: unknown): string {
  const cleaned = String(value ?? '').replace(/[^A-Za-z0-9._-]/g, '').slice(0, 16)

  return cleaned === '' ? 'dev' : cleaned
}

const current = atom({ plugin: 'ascii-wallpaper-collection', key: 'current' } as const, null)
const picking = atom({ plugin: 'ascii-wallpaper-collection', key: 'picking' } as const, false)
const category = atom({ plugin: 'ascii-wallpaper-collection', key: 'category' } as const, 'focus')
const page = atom({ plugin: 'ascii-wallpaper-collection', key: 'page' } as const, 0)
const lightOnly = atom({ plugin: 'ascii-wallpaper-collection', key: 'light' } as const, false)
const tick = atom({ plugin: 'ascii-wallpaper-collection', key: 'tick' } as const, 0)

const NEEDS = 'These wallpapers need Claude Code 2.1.325 or later: run `claude update` (or update Claude Desktop), then start a new session.'

// Sets a scene. `persist: false` is for a reaction that will hand the screen back.
async function apply($: EngineInterface, key: string | null, persist = true): Promise<string> {
  const w = WALLS.find(x => x.key === key) ?? (key ? colorWall(key) : undefined)

  try {
    if (!w) {
      await $.theme.clear()
      await update($, current, () => null)

      if (persist) {
        await $.store.set('wall', null)
      }

      return 'Wallpaper off.'
    }

    const set = await settingsOf($)
    const isColor = COLOR_KEY.test(w.key)
    const shown = await $.theme.set(isColor ? { colors: colorsFor(w, set.accent ?? w.accent), overrideColorScheme: w.tone } : lookOf(w, set))
    await update($, current, () => w.key)

    if (!isColor) {
      await update($, category, () => w.mode)
    }

    if (persist) {
      await $.store.set('wall', w.key)
    }

    $.ui.status(shown.isDrawn ? undefined : `${w.name}: ${shown.reason}`)

    return shown.isDrawn ? `${w.name} (${w.mode}): ${w.blurb}.` : `${w.name} is set. Wallpapers draw in the Code tab of Claude Desktop, not in a terminal (${shown.reason}).`
  } catch (err) {
    if (err instanceof TypeError) {
      return NEEDS
    }

    throw err
  }
}

const squash = (s: string) => s.toLowerCase().replace(/[\s-]/g, '')
const modeOf = (arg: string) => MODES.find(m => m.key === arg || m.name.toLowerCase() === arg || m.aliases.includes(arg))
const inMode = (m: Mode) => WALLS.filter(w => w.mode === m)
const randomOf = <T,>(list: T[]): T => list[Math.floor(Math.random() * list.length)] as T

const PER = 6

// A little picture of a scene for the picker: a gradient in the scene's own hue (what shows if the picture cannot
// be drawn), the packed screenshot on top, and a ring that lights up on the scene in use.
function thumbOf(w: Wall, on: boolean): string {
  const dark = w.tone === 'dark'
  const a = hsl(w.hue, 32, dark ? 12 : 82)
  const b = hsl(w.hue, 36, dark ? 28 : 92)
  const img = THUMBS[w.key]

  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 90" width="160" height="90"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient><clipPath id="c"><rect width="160" height="90" rx="9"/></clipPath></defs>` +
    `<g clip-path="url(#c)"><rect width="160" height="90" fill="url(#g)"/>${img ? `<image href="${img}" width="160" height="90" preserveAspectRatio="xMidYMid slice"/>` : ''}</g>` +
    `<rect x="1.5" y="1.5" width="157" height="87" rx="8" fill="none" stroke="${on ? w.accent : 'rgba(140,140,150,.45)'}" stroke-width="${on ? 3.5 : 1.2}"/>` +
    (on ? `<circle cx="144" cy="16" r="9" fill="${w.accent}"/><path d="M139.5 16l3.2 3.2 6-6.4" stroke="#000" stroke-width="2.2" fill="none"/>` : '') +
    '</svg>'
  )
}

// ---------------------------------------------------------------- reactions
// Opt in with `/wallpaper reactive on`: a command that finishes can change the scene for a few seconds,
// then the scene you chose comes back. Nothing is read beyond the command line and the tail of its output.
const TEST_CMD = /\b(npm|pnpm|yarn|bun)\s+(run\s+)?test\b|\bpytest\b|\bcargo\s+test\b|\bgo\s+test\b|\bvitest\b|\bjest\b|\bmake\s+test\b|\brspec\b/
const FAILED = /\b[1-9]\d*\s+(failed|failing|failures?)\b|\bFAIL(ED)?\b|\b(failed|failing)\s*[:=]\s*[1-9]/i
const PASSED = /\b(passed|passing|ok)\b|✓|\b0\s+(failed|failing)\b/i

type Reaction = { name: string; scene: Key; test: (cmd: string, out: string, err: boolean) => boolean }

const REACTIONS: Reaction[] = [
  { name: 'merged', scene: 'fireworks', test: (cmd, _o, err) => !err && /\bgh\s+pr\s+merge\b|\bgit\s+merge\b/.test(cmd) },
  { name: 'pushed', scene: 'rocket', test: (cmd, _o, err) => !err && /\bgit\s+push\b/.test(cmd) },
  { name: 'tests failed', scene: 'panic', test: (cmd, out, err) => TEST_CMD.test(cmd) && (err || FAILED.test(out)) },
  { name: 'tests passed', scene: 'tests', test: (cmd, out, err) => TEST_CMD.test(cmd) && !err && PASSED.test(out) && !FAILED.test(out) },
]

let reactUntil = 0
let reactCool = 0

// ---------------------------------------------------------------- auto modes
async function autoTick($: EngineInterface): Promise<void> {
  const set = await settingsOf($)

  if (set.auto === 'off' || Date.now() < reactUntil) {
    return
  }

  const now = await $.clock.now()
  const curKey = await read($, current)
  const cur = WALLS.find(w => w.key === curKey)

  if (set.auto === 'daynight') {
    const hour = new Date(now).getHours()
    const tone: Tone = hour >= 7 && hour < 19 ? 'light' : 'dark'

    if ((await $.store.get('autoTone')) === tone) {
      return
    }

    const pool = WALLS.filter(w => w.tone === tone && (!cur || w.mode === cur.mode))
    await $.store.set('autoTone', tone)
    await apply($, randomOf(pool.length ? pool : WALLS.filter(w => w.tone === tone)).key)

    return
  }

  const last = Number((await $.store.get('autoAt')) ?? 0)

  if (now - last < set.shuffleMin * 60_000) {
    return
  }

  const pool = (cur ? inMode(cur.mode) : WALLS).filter(w => w.key !== curKey)
  await $.store.set('autoAt', now)
  await apply($, randomOf(pool).key)
}

export const register: Register = (on, options) => {
  const handle = handleOf(options.name)

  on('session.start', async ($, e, next) => {
    await $.command.register({
      name: 'wallpaper',
      description: 'Live ASCII wallpapers behind the chat: pick one, a mode, or turn it off',
      argumentHint: 'a scene | a mode | light | dark | next | random | list | off | color <hue> | accent <#hex> | glass | auto | reactive | project | status',
    })

    const pins = ((await $.store.get('projects')) ?? {}) as Record<string, string>
    const saved = await $.store.get('wall')

    // a scene pinned to this folder wins; then the saved pick; first run starts on Silicon; a deliberate "off" stays off
    const pin = pins[e.cwd]

    if (pin) {
      await apply($, pin, false)
    } else if (saved === undefined) {
      await apply($, 'silicon')
    } else if (typeof saved === 'string') {
      await apply($, saved)
    }

    if (!pins[e.cwd]) {
      await autoTick($)
    }

    return next(e)
  })

  on('prompt.submit', async ($, e, next) => {
    await autoTick($)

    return next(e)
  })

  // a command that finishes can change the scene for a moment
  on('tool.call', { tool: 'Bash' }, async ($, e, next) => {
    const result = await next(e)
    const set = await settingsOf($)

    if (!set.reactive || Date.now() < reactCool || 'deny' in result) {
      return result
    }

    const text = ((result as { text?: string }).text ?? '').slice(-4000)
    const hit = REACTIONS.find(r => r.test(e.command, text, Boolean(result.isError)))

    if (hit) {
      const back = await read($, current)
      const key = (await $.store.get('wall')) as string | null
      reactCool = Date.now() + 25_000
      reactUntil = Date.now() + 14_000
      await apply($, hit.scene, false)
      $.ui.toast(`${WALLS.find(w => w.key === hit.scene)?.name}: ${hit.name}`)
      $.clock.after(14_000, async () => {
        await apply($, back === hit.scene ? key : (typeof back === 'string' ? back : key), false)
      })
    }

    return result
  })

  on('command.run', { command: 'wallpaper' }, async ($, e) => {
    const raw = e.args.trim().replace(/\s+/g, ' ')
    const arg = raw.toLowerCase()
    const [word, ...rest] = arg.split(' ')

    if (!arg) {
      await update($, picking, () => true)

      return { text: 'Pick a wallpaper above the prompt.' }
    }

    if (arg === 'off') {
      return { text: await apply($, null) }
    }

    if (arg === 'list') {
      return { text: MODES.map(m => `${m.name} (${m.blurb}): ${inMode(m.key).map(w => w.key).join(', ')}`).join('\n') }
    }

    if (arg === 'status') {
      const set = await settingsOf($)
      const curKey = await read($, current)
      const pins = ((await $.store.get('projects')) ?? {}) as Record<string, string>

      return { text: [`scene: ${curKey ?? 'off'} · ${WALLS.length} scenes in ${MODES.length} modes`, `accent: ${set.accent ?? 'the scene\'s own'} · glass: ${set.glass ? `blur ${set.glass.blur}, opacity ${set.glass.opacity}` : 'default'}`, `auto: ${set.auto}${set.auto === 'shuffle' ? ` every ${set.shuffleMin} min` : ''} · reactive: ${set.reactive ? 'on' : 'off'}`, `folders pinned: ${Object.keys(pins).length}`].join('\n') }
    }

    if (word === 'accent') {
      const v = rest[0]

      if (!v || v === 'reset') {
        await saveSettings($, { accent: null })
        await apply($, (await read($, current)) as string | null)

        return { text: 'Accent back to the scene\'s own.' }
      }

      if (!HEX.test(v)) {
        return { text: 'Give a hex color like /wallpaper accent #ff8f5e, or /wallpaper accent reset.' }
      }

      await saveSettings($, { accent: v.toLowerCase() })

      return { text: `Accent ${v}. ${await apply($, (await read($, current)) as string | null)}` }
    }

    if (word === 'glass') {
      const [what, val] = rest

      if (what === 'reset' || !what) {
        await saveSettings($, { glass: null })
        await apply($, (await read($, current)) as string | null)

        return { text: 'Glass back to the default (blur 18, opacity 0.5). Try /wallpaper glass blur 28 or glass opacity 0.7.' }
      }

      const n = Number(val)
      const old = (await settingsOf($)).glass ?? { blur: 18, opacity: 0.5 }

      if ((what !== 'blur' && what !== 'opacity') || !Number.isFinite(n)) {
        return { text: 'Use /wallpaper glass blur <0-40> or /wallpaper glass opacity <0.1-0.9>.' }
      }

      const glass = what === 'blur' ? { ...old, blur: Math.max(0, Math.min(40, n)) } : { ...old, opacity: Math.max(0.1, Math.min(0.9, n)) }
      await saveSettings($, { glass })

      return { text: `Glass: blur ${glass.blur}, opacity ${glass.opacity}. ${await apply($, (await read($, current)) as string | null)}` }
    }

    if (word === 'auto') {
      const [what, min] = rest

      if (what === 'daynight') {
        await $.store.set('autoTone', null)
        await saveSettings($, { auto: 'daynight' })
        await autoTick($)

        return { text: 'Auto: light scenes by day (7 to 19), dark by night, within the mode you are in.' }
      }

      if (what === 'shuffle') {
        const m = Math.max(1, Math.min(600, Number(min) || 30))
        await $.store.set('autoAt', await $.clock.now())
        await saveSettings($, { auto: 'shuffle', shuffleMin: m })

        return { text: `Auto: a new scene from your current mode every ${m} minutes, on your next prompt.` }
      }

      await saveSettings($, { auto: 'off' })

      return { text: 'Auto off. Try /wallpaper auto daynight or /wallpaper auto shuffle 20.' }
    }

    if (word === 'reactive') {
      const enable = rest[0] !== 'off'
      await saveSettings($, { reactive: enable })

      return { text: enable ? 'Reactive on: a merged PR sets off Fireworks, a push launches the Rocket, passing tests show Green CI, failing tests the Kernel Panic, each for a few seconds.' : 'Reactive off.' }
    }

    if (word === 'project') {
      const pins = ((await $.store.get('projects')) ?? {}) as Record<string, string>
      const cwd = await $.session.cwd()

      if (rest[0] === 'off') {
        delete pins[cwd]
        await $.store.set('projects', pins)

        return { text: 'Unpinned: this folder uses your general pick again.' }
      }

      const curKey = await read($, current)

      if (!curKey) {
        return { text: 'Pick a scene first, then /wallpaper project pins it to this folder.' }
      }

      pins[cwd] = curKey
      await $.store.set('projects', pins)

      return { text: `Pinned ${curKey} to this folder. /wallpaper project off to undo.` }
    }

    if (word === 'color' || word === 'colour') {
      const hue = Number(rest[0])
      const tone = rest[1] === 'light' ? 'light' : 'dark'

      if (!Number.isFinite(hue)) {
        return { text: 'Use /wallpaper color <hue 0-359> [dark|light]: a colors-only theme with no picture. 220 is blue, 150 green, 340 pink.' }
      }

      return { text: await apply($, `color:${Math.round(hue) % 360}:${tone}`) }
    }

    if (arg === 'next' || arg === 'random') {
      const curKey = await read($, current)
      const cur = WALLS.find(w => w.key === curKey)
      const pool = arg === 'next' && cur ? inMode(cur.mode) : WALLS
      const at = pool.findIndex(w => w.key === cur?.key)
      const to = arg === 'next' ? pool[(at + 1) % pool.length] ?? randomOf(pool) : randomOf(pool)

      return { text: await apply($, to.key) }
    }

    if (arg === 'light' || arg === 'dark') {
      return { text: await apply($, randomOf(WALLS.filter(w => w.tone === arg)).key) }
    }

    // "random focus", "focus", "work", "enjoy": a surprise from that mode
    const m = modeOf(arg.replace(/^random /, ''))

    if (m) {
      return { text: await apply($, randomOf(inMode(m.key)).key) }
    }

    const w = WALLS.find(x => x.key.toLowerCase() === arg || squash(x.name) === squash(arg))

    if (!w) {
      return { text: `No wallpaper or mode "${arg}". Try /wallpaper list.` }
    }

    return { text: await apply($, w.key) }
  })

  on('ui.render', { component: 'Backdrop' }, ($, e, next) => {
    if (e.props.plugin !== PLUGIN || (e.surface !== 'desktop' && e.surface !== 'mobile')) {
      return next(e)
    }

    const w = WALLS.find(x => `cw-${x.key}-${BUILD}` === e.props.scene)

    if (!w) {
      return next(e)
    }

    let source = scenes.get(w.key)

    if (source === undefined) {
      source = SCENES[w.key](handle)
      scenes.set(w.key, source)
    }

    const { Svg } = $.ui.resolve(e)

    return <Svg source={source} alt={`${w.name}: ${w.blurb}`} isInteractive />
  })

  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    if (e.surface !== 'desktop' && e.surface !== 'mobile') {
      return next(e)
    }

    if (!(await read($, picking))) {
      return next(e)
    }

    await read($, tick)
    const cur = await read($, current)
    const active = await read($, category)
    const light = await read($, lightOnly)
    const set = await settingsOf($)
    const mode = MODES.find(m => m.key === active) ?? (MODES[0] as (typeof MODES)[number])
    const list = inMode(mode.key).filter(w => !light || w.tone === 'light')
    const pages = Math.max(1, Math.ceil(list.length / PER))
    const pg = Math.min(await read($, page), pages - 1)
    const shown = list.slice(pg * PER, pg * PER + PER)
    const { Box, Text, Button, Svg } = $.ui.resolve(e)
    const countIn = (m: Mode) => inMode(m).filter(w => !light || w.tone === 'light').length
    const AUTOS: Settings['auto'][] = ['off', 'daynight', 'shuffle']

    return (
      <Box flexDirection="column" borderStyle="round" paddingX="sm" gap="xs">
        <Box flexDirection="row" justifyContent="space-between">
          <Box flexDirection="row" gap="sm">
            <Text bold>/wallpaper</Text>
            <Text dimColor>{WALLS.length} live ASCII scenes</Text>
          </Box>
          <Box flexDirection="row" gap="sm">
            <Button key="light" label="Light only" hotkey="l" variant={light ? 'primary' : 'secondary'} onPress={() => update($, lightOnly, v => !v).then(() => update($, page, () => 0))} />
            <Button key="off" label="Off" hotkey="0" dimColor onPress={() => apply($, null)} />
            <Button key="close" label="Close" role="dismiss" onPress={() => update($, picking, () => false)} />
          </Box>
        </Box>
        <Box flexDirection="row" gap="sm" flexWrap="wrap">
          {MODES.filter(m => countIn(m.key) > 0).map(m => (
            <Button key={m.key} label={`${m.name} · ${countIn(m.key)}`} hotkey={m.hotkey} variant={m.key === mode.key ? 'primary' : 'secondary'} onPress={() => update($, category, () => m.key).then(() => update($, page, () => 0))} />
          ))}
        </Box>
        <Text dimColor>{mode.blurb}</Text>
        <Box flexDirection="row" gap="sm" flexWrap="wrap">
          {shown.map((w, i) => (
            <Box key={w.key} flexDirection="column" gap="xs">
              <Svg source={thumbOf(w, w.key === cur)} alt={`${w.name}: ${w.blurb}`} width={152} height={86} />
              <Button key={w.key} label={`${w.name}${w.key === cur ? ' ✓' : ''}`} hotkey={String(i + 1)} variant={w.key === cur ? 'primary' : 'secondary'} onPress={() => apply($, w.key)} />
              <Text dimColor>{w.blurb}</Text>
            </Box>
          ))}
        </Box>
        <Box flexDirection="row" gap="sm" justifyContent="space-between" flexWrap="wrap">
          <Text dimColor>{`page ${pg + 1} of ${pages} · ${list.length} scenes`}</Text>
          <Box flexDirection="row" gap="sm" flexWrap="wrap">
            <Button key="reactive" label={`Reactive ${set.reactive ? 'on' : 'off'}`} hotkey="v" dimColor onPress={() => saveSettings($, { reactive: !set.reactive })} />
            <Button key="auto" label={`Auto ${set.auto}`} hotkey="u" dimColor onPress={() => saveSettings($, { auto: AUTOS[(AUTOS.indexOf(set.auto) + 1) % 3] })} />
            <Button key="prev" label="‹ Back" hotkey="b" dimColor onPress={() => update($, page, () => (pg + pages - 1) % pages)} />
            <Button key="nextpage" label="Next ›" hotkey="p" onPress={() => update($, page, () => (pg + 1) % pages)} />
            <Button key="rand" label="Surprise me" hotkey="x" onPress={() => apply($, randomOf(list).key)} />
          </Box>
        </Box>
      </Box>
    )
  })
}
