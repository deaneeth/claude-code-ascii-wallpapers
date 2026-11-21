// Claude Code ASCII Wallpapers: live ASCII-tile wallpapers behind the chat in Claude Desktop.
// Eleven scenes, each with its own colors and frosted panels, a /wallpaper picker above the prompt, and a handle
// setting that signs your name into the scenes. The pick is kept for the next session.
import { atom, read, update } from 'claude-code'
import type { EngineInterface, Register, ThemeSetArgs } from 'claude-code'

import { SCENES } from './art.js'
import { makeColors } from './make-colors.js'

const PLUGIN = 'ascii-wallpaper-collection'
// bump with each change to art.js: a new scene name makes the app draw the new picture, not one it kept
const BUILD = 1

type Key = keyof typeof SCENES
type Tone = 'dark' | 'light'
type Roles = { accent: string; danger: string; success: string; warning: string; pro: string }
type Wall = {
  key: Key
  name: string
  tone: Tone
  blurb: string
  alt: string
  glass: string
  s: [string, string, string, string]
  t: [string, string, string]
  roles: Roles
}

// Order is the picker's order; the first nine take the hotkeys 1 to 9.
const WALLS: Wall[] = [
  { key: 'silicon', name: 'Silicon', tone: 'dark', blurb: 'a die waking up', glass: '#080d0c', alt: 'Copper traces and chips, bits streaming in, processing elements lighting in a wave',
    s: ['#0c1412', '#111c19', '#172622', '#1b2c27'], t: ['#e6f1ec', '#b9ccc4', '#92aaa1'], roles: { accent: '#d4863f', danger: '#e0594d', success: '#35d6a0', warning: '#e0b04a', pro: '#8a86f0' } },
  { key: 'attention', name: 'Attention', tone: 'dark', blurb: 'heads reading tokens', glass: '#09071a', alt: 'Two attention matrices in violet and amber, a query row sweeping down, tokens drifting',
    s: ['#0e0c1c', '#151229', '#1c1835', '#211c3d'], t: ['#ece9fb', '#c4bfe8', '#9c97c9'], roles: { accent: '#8b7cf6', danger: '#ec5f7a', success: '#4fd2a0', warning: '#f0b04a', pro: '#c58bf0' } },
  { key: 'iron', name: 'Iron', tone: 'dark', blurb: 'one more rep', glass: '#0a0706', alt: 'A loaded barbell lifting under an ember glow, chalk rising, a rep counter ticking',
    s: ['#130f0d', '#1b1512', '#231b17', '#2a201b'], t: ['#f2ebe4', '#cfc3b8', '#a99b8e'], roles: { accent: '#ff7a3d', danger: '#e8544a', success: '#7bc47a', warning: '#f0b64a', pro: '#c08ae8' } },
  { key: 'night', name: 'Night Shift', tone: 'dark', blurb: 'moon, code, a prompt', glass: '#060a1c', alt: 'A crescent moon, stars, clouds sliding by, code scrolling and a blinking prompt',
    s: ['#090d1f', '#0f1530', '#151c3c', '#1a2246'], t: ['#e9ecfb', '#bcc3e6', '#959dc8'], roles: { accent: '#8fb5ff', danger: '#ff7f8f', success: '#7ee2a8', warning: '#ffd27a', pro: '#c79bff' } },
  { key: 'codeRain', name: 'Code Rain', tone: 'dark', blurb: 'green phosphor', glass: '#020a05', alt: 'Columns of green code falling through the dark',
    s: ['#06110a', '#0a1a10', '#0f2216', '#13291b'], t: ['#e3f7e9', '#b4d6bf', '#8cb199'], roles: { accent: '#3dff8a', danger: '#ff6b6b', success: '#5fe39a', warning: '#e8c84a', pro: '#9fa8ff' } },
  { key: 'outrun', name: 'Outrun', tone: 'dark', blurb: 'neon horizon', glass: '#0d031f', alt: 'A sliced sun over a neon grid, mountains, a road of light rolling toward you',
    s: ['#0e0620', '#150a2e', '#1d1040', '#231450'], t: ['#f3ecff', '#cfc2ee', '#a597cf'], roles: { accent: '#ff4fd8', danger: '#ff5c7a', success: '#4fe8b0', warning: '#ffb347', pro: '#38e8ff' } },
  { key: 'aurora', name: 'Aurora', tone: 'dark', blurb: 'northern lights', glass: '#050c14', alt: 'Ribbons of green, violet and teal light rippling over a pine ridge under stars',
    s: ['#06141b', '#0a1d27', '#0f2833', '#13303d'], t: ['#e6f6f3', '#b7d8d2', '#8fb6af'], roles: { accent: '#2dd4bf', danger: '#ff7a7a', success: '#5dffb0', warning: '#f0c060', pro: '#9b8cff' } },
  { key: 'orbit', name: 'Orbit', tone: 'dark', blurb: 'a ringed planet', glass: '#07070f', alt: 'A banded planet with a ring and two satellites going round, a grey moon drifting by',
    s: ['#0b0b16', '#12121f', '#191a2b', '#1e2034'], t: ['#ececf7', '#c3c4dc', '#9c9db8'], roles: { accent: '#e0a35c', danger: '#ff6b6b', success: '#6fd6a0', warning: '#f0c060', pro: '#9b9cff' } },
  { key: 'rainy', name: 'Rainy Window', tone: 'dark', blurb: 'coffee and rain', glass: '#080d13', alt: 'Rain on a window over blurred city lights, a mug steaming on the sill',
    s: ['#0b1118', '#101922', '#16222d', '#1b2a37'], t: ['#e8eef5', '#bccad8', '#94a5b6'], roles: { accent: '#ffb454', danger: '#ff7a8a', success: '#6fd6a0', warning: '#ffb454', pro: '#9cb4ff' } },
  { key: 'blueprint', name: 'Blueprint', tone: 'light', blurb: 'daylight drafting', glass: '#eaf3fb', alt: 'A chip drawn as a blueprint, bits moving along its traces, scrolling clock and data lines',
    s: ['#d9e8f4', '#e3eff8', '#edf5fb', '#edf5fb'], t: ['#0e2233', '#2f4a60', '#46627a'], roles: { accent: '#1f6fb2', danger: '#c9403a', success: '#2f8a52', warning: '#a86f14', pro: '#6d4f94' } },
  { key: 'zen', name: 'Zen Garden', tone: 'light', blurb: 'raked sand, falling petals', glass: '#f6efe0', alt: 'Raked sand rippling around mossy stones while petals drift down',
    s: ['#ece3d0', '#f3ecdc', '#faf6ea', '#faf6ea'], t: ['#2a241a', '#544a38', '#6a5f48'], roles: { accent: '#2f6f8f', danger: '#b3392f', success: '#4e7d3a', warning: '#a86f14', pro: '#6d4f94' } },
]

const looks = new Map<string, ThemeSetArgs>()
const scenes = new Map<string, string>()

function colorsFor(w: Wall): ThemeSetArgs['colors'] {
  return makeColors({
    label: w.name,
    only: w.tone,
    roles: w.roles,
    [w.tone]: {
      gray: {
        anchors: {
          'surface-0': w.s[0],
          'surface-1': w.s[1],
          'surface-2': w.s[2],
          'surface-3': w.s[3],
          'text-primary': w.t[0],
          'text-secondary': w.t[1],
          'text-muted': w.t[2],
        },
      },
    },
    codeTheme: w.tone === 'dark' ? { dark: 'nord' } : undefined,
  }).theme
}

function lookOf(w: Wall): ThemeSetArgs {
  let look = looks.get(w.key)

  if (!look) {
    look = {
      colors: colorsFor(w),
      backdrop: { scene: `cw-${w.key}-${BUILD}`, glass: { blur: 18, tint: w.glass, opacity: 0.5 } },
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
    await $.store.set('wall', w.key)
    $.ui.status(set.isDrawn ? undefined : `${w.name}: ${set.reason}`)

    return set.isDrawn ? `${w.name}: ${w.blurb}.` : `${w.name} is set. Wallpapers draw in the Code tab of Claude Desktop, not in a terminal (${set.reason}).`
  } catch (err) {
    if (err instanceof TypeError) {
      return NEEDS
    }

    throw err
  }
}

export const register: Register = (on, options) => {
  const handle = handleOf(options.name)

  on('session.start', async ($, e, next) => {
    await $.command.register({
      name: 'wallpaper',
      description: 'Live ASCII wallpapers behind the chat: pick one, or turn it off',
      argumentHint: `${WALLS.map(w => w.key).join(' | ')} | next | random | off`,
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

    if (arg === 'next' || arg === 'random') {
      const cur = await read($, current)
      const at = WALLS.findIndex(w => w.key === cur)
      const to = arg === 'next' ? WALLS[(at + 1) % WALLS.length] : WALLS[Math.floor(Math.random() * WALLS.length)]

      return { text: await apply($, to.key) }
    }

    const squash = (s: string) => s.toLowerCase().replace(/[\s-]/g, '')
    const w = WALLS.find(x => x.key.toLowerCase() === arg || squash(x.name) === squash(arg))

    if (!w) {
      return { text: `No wallpaper "${arg}". One of: ${WALLS.map(x => x.name).join(', ')}, or next, random, off.` }
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

    return <Svg source={source} alt={w.alt} isInteractive />
  })

  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    if (e.surface !== 'desktop' && e.surface !== 'mobile') {
      return next(e)
    }

    if (!(await read($, picking))) {
      return next(e)
    }

    const cur = await read($, current)
    const { Box, Text, Button } = $.ui.resolve(e)

    return (
      <Box flexDirection="column" borderStyle="round" paddingX="sm" gap="xs">
        <Box flexDirection="row" justifyContent="space-between">
          <Box flexDirection="row" gap="sm">
            <Text bold>/wallpaper</Text>
            <Text dimColor>live ASCII scenes</Text>
          </Box>
          <Box flexDirection="row" gap="sm">
            <Button key="off" label="Off" hotkey="0" dimColor onPress={() => apply($, null)} />
            <Button key="close" label="Close" role="dismiss" onPress={() => update($, picking, () => false)} />
          </Box>
        </Box>
        <Box flexDirection="row" gap="sm" flexWrap="wrap">
          {WALLS.map((w, i) => (
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
