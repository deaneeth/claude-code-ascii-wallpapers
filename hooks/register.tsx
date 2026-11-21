// ASCII Wallpaper Collection: 51 live ASCII-tile wallpapers behind the chat in Claude Desktop, in five modes
// (Focus, Chill, Nature, Space, Energy). Each scene has its own colors and frosted panels, a /wallpaper picker sits
// above the prompt, and a handle setting signs your name into the scenes. The pick is kept for the next session.
import { atom, read, update } from 'claude-code'
import type { EngineInterface, Register, ThemeSetArgs } from 'claude-code'

import { SCENES } from './art.js'
import { hsl } from './engine.js'
import { makeColors } from './make-colors.js'

const PLUGIN = 'ascii-wallpaper-collection'
// bump with each change to a scene: a new scene name makes the app draw the new picture, not one it kept
const BUILD = 2

type Key = keyof typeof SCENES
type Tone = 'dark' | 'light'
type Mode = 'focus' | 'chill' | 'nature' | 'space' | 'energy'
type Wall = { key: Key; name: string; mode: Mode; tone: Tone; hue: number; accent: string; blurb: string }

// The five modes. Work mode is Focus; enjoy mode is Energy.
const MODES: { key: Mode; name: string; blurb: string; hotkey: string; aliases: string[] }[] = [
  { key: 'focus', name: 'Focus', blurb: 'work mode: calm, readable, low-distraction', hotkey: 'f', aliases: ['work', 'deep', 'calm'] },
  { key: 'chill', name: 'Chill', blurb: 'cozy and slow', hotkey: 'c', aliases: ['cozy', 'relax'] },
  { key: 'nature', name: 'Nature', blurb: 'weather, water and mountains', hotkey: 'n', aliases: ['outdoors', 'weather'] },
  { key: 'space', name: 'Space', blurb: 'the dark between things', hotkey: 's', aliases: ['cosmos', 'sky'] },
  { key: 'energy', name: 'Energy', blurb: 'enjoy mode: loud, bright, moving', hotkey: 'e', aliases: ['enjoy', 'fun', 'hype', 'play'] },
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
  ] as [string, Key, Mode, Tone, number, string, string][]
).map(([name, key, mode, tone, hue, accent, blurb]) => ({ name, key, mode, tone, hue, accent, blurb }))

const looks = new Map<string, ThemeSetArgs>()
const scenes = new Map<string, string>()

// A whole window palette from one hue and one accent.
function colorsFor(w: Wall): ThemeSetArgs['colors'] {
  const dark = w.tone === 'dark'
  const h = w.hue
  const s = dark ? [hsl(h, 32, 6), hsl(h, 30, 8.5), hsl(h, 28, 11.5), hsl(h, 26, 14)] : [hsl(h, 30, 87), hsl(h, 30, 91), hsl(h, 32, 95), hsl(h, 32, 95)]
  const t = dark ? [hsl(h, 25, 94), hsl(h, 18, 78), hsl(h, 12, 62)] : [hsl(h, 40, 9), hsl(h, 25, 24), hsl(h, 18, 34)]
  const roles = dark
    ? { accent: w.accent, danger: '#e0594d', success: '#4fd2a0', warning: '#f0b04a', pro: '#a08cf0' }
    : { accent: w.accent, danger: '#c9403a', success: '#2f8a52', warning: '#a86f14', pro: '#6d4f94' }

  return makeColors({
    label: w.name,
    only: w.tone,
    roles,
    [w.tone]: { gray: { anchors: { 'surface-0': s[0], 'surface-1': s[1], 'surface-2': s[2], 'surface-3': s[3], 'text-primary': t[0], 'text-secondary': t[1], 'text-muted': t[2] } } },
    codeTheme: dark ? { dark: 'nord' } : undefined,
  }).theme
}

function lookOf(w: Wall): ThemeSetArgs {
  let look = looks.get(w.key)

  if (!look) {
    look = {
      colors: colorsFor(w),
      backdrop: { scene: `cw-${w.key}-${BUILD}`, glass: { blur: 18, tint: w.tone === 'dark' ? hsl(w.hue, 32, 5) : hsl(w.hue, 30, 93), opacity: 0.5 } },
      overrideColorScheme: w.tone,
    }
    looks.set(w.key, look)
  }

  return look
}

// A handle that is safe to draw in a scene: letters, digits and . _ - only, 16 at most.
function handleOf(value: unknown): string {
  const cleaned = String(value ?? '').replace(/[^A-Za-z0-9._-]/g, '').slice(0, 16)

  return cleaned === '' ? 'dev' : cleaned
}

const current = atom({ plugin: 'ascii-wallpaper-collection', key: 'current' } as const, null)
const picking = atom({ plugin: 'ascii-wallpaper-collection', key: 'picking' } as const, false)
const category = atom({ plugin: 'ascii-wallpaper-collection', key: 'category' } as const, 'focus')

const NEEDS = 'These wallpapers need Claude Code 2.1.325 or later: run `claude update` (or update Claude Desktop), then start a new session.'

async function apply($: EngineInterface, key: string | null): Promise<string> {
  const w = WALLS.find(x => x.key === key)

  try {
    if (!w) {
      await $.theme.clear()
      await update($, current, () => null)
      await $.store.set('wall', null)

      return 'Wallpaper off.'
    }

    const set = await $.theme.set(lookOf(w))
    await update($, current, () => w.key)
    await update($, category, () => w.mode)
    await $.store.set('wall', w.key)
    $.ui.status(set.isDrawn ? undefined : `${w.name}: ${set.reason}`)

    return set.isDrawn ? `${w.name} (${w.mode}): ${w.blurb}.` : `${w.name} is set. Wallpapers draw in the Code tab of Claude Desktop, not in a terminal (${set.reason}).`
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

export const register: Register = (on, options) => {
  const handle = handleOf(options.name)

  on('session.start', async ($, e, next) => {
    await $.command.register({
      name: 'wallpaper',
      description: 'Live ASCII wallpapers behind the chat: pick one, a mode, or turn it off',
      argumentHint: 'a scene | work | chill | nature | space | enjoy | next | random | list | off',
    })

    const saved = await $.store.get('wall')

    // first run: start on Silicon; a deliberate "off" stays off
    if (saved === undefined) {
      await apply($, 'silicon')
    } else if (typeof saved === 'string') {
      await apply($, saved)
    }

    return next(e)
  })

  on('command.run', { command: 'wallpaper' }, async ($, e) => {
    const arg = e.args.trim().toLowerCase().replace(/\s+/g, ' ')

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

    if (arg === 'next' || arg === 'random') {
      const curKey = await read($, current)
      const cur = WALLS.find(w => w.key === curKey)
      const pool = arg === 'next' && cur ? inMode(cur.mode) : WALLS
      const at = pool.findIndex(w => w.key === cur?.key)
      const to = arg === 'next' ? pool[(at + 1) % pool.length] : pool[Math.floor(Math.random() * pool.length)]

      return { text: await apply($, to.key) }
    }

    // "random focus", "focus", "work", "enjoy": a surprise from that mode
    const m = modeOf(arg.replace(/^random /, ''))

    if (m) {
      const pool = inMode(m.key)

      return { text: await apply($, pool[Math.floor(Math.random() * pool.length)].key) }
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

    const cur = await read($, current)
    const active = await read($, category)
    const mode = MODES.find(m => m.key === active) ?? MODES[0]
    const { Box, Text, Button } = $.ui.resolve(e)

    return (
      <Box flexDirection="column" borderStyle="round" paddingX="sm" gap="xs">
        <Box flexDirection="row" justifyContent="space-between">
          <Box flexDirection="row" gap="sm">
            <Text bold>/wallpaper</Text>
            <Text dimColor>{WALLS.length} live ASCII scenes</Text>
          </Box>
          <Box flexDirection="row" gap="sm">
            <Button key="off" label="Off" hotkey="0" dimColor onPress={() => apply($, null)} />
            <Button key="close" label="Close" role="dismiss" onPress={() => update($, picking, () => false)} />
          </Box>
        </Box>
        <Box flexDirection="row" gap="sm" flexWrap="wrap">
          {MODES.map(m => (
            <Button key={m.key} label={`${m.name} · ${inMode(m.key).length}`} hotkey={m.hotkey} variant={m.key === mode.key ? 'primary' : 'secondary'} onPress={() => update($, category, () => m.key)} />
          ))}
        </Box>
        <Text dimColor>{mode.blurb}</Text>
        <Box flexDirection="row" gap="sm" flexWrap="wrap">
          {inMode(mode.key).map((w, i) => (
            <Box key={w.key} flexDirection="column">
              <Button key={w.key} label={`${w.name}${w.key === cur ? ' ✓' : ''}`} hotkey={i < 9 ? String(i + 1) : undefined} variant={w.key === cur ? 'primary' : 'secondary'} onPress={() => apply($, w.key)} />
              <Text dimColor>{w.blurb}</Text>
            </Box>
          ))}
        </Box>
      </Box>
    )
  })
}
