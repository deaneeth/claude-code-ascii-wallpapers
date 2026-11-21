# Contributing a wallpaper

A scene is one function in [`hooks/art.js`](hooks/art.js) that returns an SVG string. Pull requests that add scenes, fix a rough edge in one, or improve the docs are welcome.

## The pieces

| Helper | What it does |
| --- | --- |
| `ctx()` | A fresh scene context (tile registry and animation rules). |
| `tile(x, fill, ink, ch)` | Registers one tile: an optional backing plate and a glyph. Returns its id. |
| `put(id, col, row)` | Places a tile on the 120 by 49 grid. |
| `sprite(x, rows, palette, col, row, seed)` | Draws pixel art from strings. |
| `phased(items, seed)` | Spreads tiles over three shimmer phases so a shape never pulses as a block. |
| `mover(x, points, seconds, delay, inner, mode)` | Steps something cell to cell along a path. Modes: `fade`, `loop`, `burst`. |
| `trace`, `die`, `scope`, `word`, `signature` | Wires, a chip die, a scrolling signal, text in tiles, and the handle nameplate. |
| `shell(x, options)` | Wraps it all: background, grid, the vignette, and the stylesheet. |

## Add a scene

1. Write `function mySceneName(name) { ... return shell(x, {...}) }` in `hooks/art.js` and add it to the `SCENES` export and to `art.d.ts`. Take `name` (the user's handle) and use it in `signature(x, name, ...)`; never hard-code a person's name.
2. Add a row to `WALLS` in `hooks/register.tsx`: key, name, tone (`dark` or `light`), a one-line blurb, alt text, the glass tint, four surface colors, three text colors and five role colors.
3. Bump `BUILD` in `hooks/register.tsx` so the app draws the new picture and not a cached one.
4. Keep each scene under 131,072 characters, and keep important art away from the middle (where the words sit) and the foot (where the message box sits).
5. Run `node scripts/build-previews.mjs` to write `assets/previews/*.svg`, and open the SVG in a browser to check it moves.
6. Run `claude plugin validate .` and make sure every theme passes with no line starting `Desktop won't paint`.

## House rules

- Original art and code only. No logos, characters, or artwork from other projects or brands.
- Nothing personal: no real names, emails, hostnames or project names in a scene.
- Respect reduced motion: animation rules go inside the `prefers-reduced-motion: no-preference` block (the helpers do this for you).
