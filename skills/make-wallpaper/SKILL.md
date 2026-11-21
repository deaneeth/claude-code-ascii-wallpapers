---
name: make-wallpaper
description: Make a new live ASCII wallpaper for Claude Desktop from a description ("a lighthouse in a storm", "a cozy library", "synthwave sunset"), as its own small mod. Use when someone asks for a custom wallpaper, scene or animated backdrop, or wants to add a scene to their own set.
---

# Make a wallpaper

A wallpaper is one SVG drawn from character tiles on a 16 by 22 pixel grid (120 columns by 49 rows, `viewBox 0 0 1920 1080`), animated with CSS keyframes. The ASCII Wallpaper Collection plugin ships a tiny engine for this (`engine.js`, next to this file) and 93 scenes to copy from. Build the new scene as **its own mod**, so the person's installed collection is never edited.

## Steps

1. Load the `plugin-authoring` skill, then read its `look.md`. Make a mod folder as it says (for example `ascii-my-scene`), with `.claude-plugin/plugin.json`, `hooks/hooks.json` and `hooks/register.tsx`.
2. Copy `engine.js` from this skill's folder into the mod's `hooks/`. It exports `ctx, tile, put, phased, sprite, mover, follow, particles, ridge, disc, line, trace, skyline, stars, pine, lerp, hsl, shell, signature`.
3. Write `hooks/scene.js` exporting `scene(name)` that returns the SVG string, in this shape:

```js
import { ctx, rng, tile, put, phased, mover, particles, ridge, disc, signature, shell, lerp } from './engine.js'

export function scene(name) {
  const x = ctx()          // tile registry and animation rules
  const R = rng(7)         // seeded, so the picture is the same every time
  const b = []             // body pieces, back to front

  b.push(phased(disc(x, R, 1500, 160, 70, (px, py, t) => [lerp('#fff4d0', '#ffd890', t), '#c89040'], '.'), 2))   // a sun
  b.push(ridge(x, R, { base: 40, h: c => 6 + 3 * Math.sin(c / 12), fill: ['#2a3a5a', '#101828'], edge: ['#4a6a9a', '#7a9ad0'], glyphs: '^.', seed: 3 }))
  b.push(mover(x, [[-6, 12], [124, 12]], 60, 0, put(tile(x, '#fff', '#8ab', '~'), -6, 12), 'loop'))               // something drifting across
  b.push(...signature(x, name, '#8aa0c8', '#fff'))                                                              // ~/handle in a corner

  return shell(x, { sky: [[0, '#0a1230'], [1, '#26385e']], veil: '#0a1230', veilA: 0.25, grid: '#8aa0d8', gridA: 0.02, body: b.join('') })
}
```

4. The rules that keep it working in the app:
   - Keep the SVG under **131,072 characters** (check `svg.length`). A scene is mostly `<use>` tiles, so keep the tile count down: a few thousand at most.
   - Keep the middle and the foot calm: text sits in the middle and the message box at the bottom. Put the art near the edges.
   - Always start something moving: gentle drifts, twinkles, falling particles. Use `phased` so a shape never pulses as one block.
   - `mover(x, points, seconds, delay, svg, mode)` steps something cell to cell. Mode `loop` repeats, `fade` blinks in and out, `burst` moves once. The svg must be drawn **at the first point**.
   - Never hard-code a name: take the handle as `name` and pass it to `signature`.
   - Animation lives inside `prefers-reduced-motion: no-preference` (the helpers do this).
5. In `register.tsx`, register the scene as a backdrop. The mod applies it with `$.theme.set({ colors, backdrop: { scene: '<id>', glass: { blur: 18, tint, opacity: 0.5 } } })` (colors from `look.md`, a dark tint for dark scenes) and draws it in a `ui.render` hook on `{ component: 'Backdrop' }` that returns `<Svg source={scene(handle)} alt="..." isInteractive />`. Add a `/<name>` command that applies it.
6. Preview before telling the person it is done: write the SVG to a file, open it in a browser or render it, and look at it. Fix what is faint, empty or overlapping, then run `claude plugin validate` on the mod.

## Taste

- One idea per scene, drawn clearly: a lamp, a fox, a lake. Then life: wind, light, a creature.
- Few colors from one hue family, one bright accent.
- Dark scenes: keep inks bright enough to read on a busy screen. Light scenes: keep the veil low (`veilA` about 0.2) so colors stay clean.
