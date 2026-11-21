# Contributing a wallpaper

A scene is one function that takes the user's handle and returns an SVG string. Pull requests that add scenes, fix a rough edge in one, or improve the docs are welcome.

## Layout

| File | What is in it |
| --- | --- |
| `hooks/engine.js` | The drawing helpers every scene shares. |
| `hooks/scenes-focus.js`, `scenes-chill.js`, `scenes-nature.js`, `scenes-space.js`, `scenes-energy.js` | One file per mode, one function per scene. |
| `hooks/legacy.js` | The first eleven scenes. |
| `hooks/art.js` | Gathers every scene into `SCENES`. |
| `hooks/register.tsx` | The plugin: the `WALLS` table (name, mode, tone, hue, accent), palettes, `/wallpaper`, and the picker. |

## The helpers (in `hooks/engine.js`)

| Helper | What it does |
| --- | --- |
| `ctx()` | A fresh scene context (tile registry and animation rules). |
| `tile(x, fill, ink, ch)` / `put(id, col, row)` | Register one tile (an optional plate and a glyph), then place it on the 120 by 49 grid. |
| `sprite(x, rows, palette, col, row, seed)` | Pixel art from strings. |
| `phased(items, seed)` | Spreads tiles over three shimmer phases so a shape never pulses as a block. |
| `wavy(x, buckets, step)` | Brightness that travels across column buckets (water, aurora, ripples). |
| `mover(x, points, seconds, delay, inner, mode)` | Steps something cell to cell along a path. Modes: `fade`, `loop`, `burst`, `blast`. |
| `follow(x, points, seconds, items)` | Many things following one path, one set of keyframes. |
| `particles(x, R, options)` | Rain, snow, embers, petals, sparks, bubbles, dust. |
| `ridge`, `disc`, `skyline`, `pine`, `line`, `trace`, `die`, `scope` | Mountains, discs, cities, trees, straight runs, wires, a chip, a scrolling signal. |
| `shell(x, options)` | Wraps it all: the sky or background, the grid, the center vignette, and the stylesheet. |
| `signature(x, name, ...)` | The handle nameplate. |

## Add a scene

1. Write `function myScene(name) { ... return shell(x, {...}) }` in the file for its mode and add it to that file's export. Take `name` (the user's handle) and use it in `signature(x, name, ...)`; never hard-code a person's name.
2. Add the key to `SceneKey` in `hooks/art.d.ts`.
3. Add a row to `WALLS` in `hooks/register.tsx`: name, key, mode, tone (`dark` or `light`), hue, accent, and a short blurb.
4. Bump `BUILD` in `hooks/register.tsx` so the app draws the new picture and not a cached one.
5. Keep each scene under 131,072 characters, and keep important art away from the middle (where the words sit) and the foot (where the message box sits).
6. Run `node scripts/build-previews.mjs`, which writes `assets/previews/*.svg` and flags any scene over the limit. Open the SVG in a browser to check it moves, and give animated things a negative start delay so the first frame already shows them.
7. Run `claude plugin validate .` and make sure every theme passes with no line starting `Desktop won't paint`.

## House rules

- Original art and code only. No logos, characters, or artwork from other projects or brands.
- Nothing personal: no real names, emails, hostnames or project names in a scene.
- Respect reduced motion: animation rules go inside the `prefers-reduced-motion: no-preference` block (the helpers do this for you).
