# Changelog

## 2.2.0

- **93 scenes in nine modes.** 32 new scenes and three new modes: **Creatures** (Lily Pond, Moon Jellies, Whale Song, Butterfly House, Window Cat, Murmuration, Firefly Field, Night Owl, Sea Turtle, Fox in Snow), **Art** (Halftone, Dither Waves, Riso Hills, Flow Field, Sine Stack, Radar) and **Minimal** (Horizon, Dot Grid, Static, Slow Lines).
- **Ten more light scenes** (17 in all): Greenhouse, Sketchbook, Snow Day, Pastel City, Kite Day, Spring Meadow, Low Tide, Lavender Rows, Summer Wheat and Riso Hills. Four more seasons in Nature: Spring Rain, Summer Wheat, Harvest Moon, Ice Lake.
- **A new picker** with a live thumbnail of every scene, six to a page, mode tabs with counts, paging, a light-only filter and a surprise button, all on hotkeys.
- **Reactive scenes** (opt in with `/wallpaper reactive on`): fireworks on a merge, a rocket on a push, Green CI when tests pass, Kernel Panic when they fail.
- **Make your own**: a `make-wallpaper` skill that builds a new scene as its own mod from a description.
- **Settings**: `/wallpaper accent`, `glass`, `color <hue>`, `auto daynight`, `auto shuffle`, `project`, `status`, plus `light` and `dark`.
- `scripts/build-thumbs.sh`, `scripts/build-readme.mjs` and `scripts/perf.mjs` keep thumbnails, the README gallery and a performance check in step with the scenes.

## 2.1.0

- New **Dev** mode for hardcore coders: 10 dark, moody, minimal scenes (Vim Night, Hex Dump, Assembly, Sorting, Big O, Diff, Green CI, The Void, Compiler, Kernel Panic). The collection is now **61 scenes in six modes**.
- `/wallpaper dev` (also `code`, `coder`, `hacker`) picks a random Dev scene; `d` opens the mode in the picker.
- New social preview image.

## 2.0.0

- The collection grows from 11 to **51 scenes**, in five modes: Focus (work mode), Chill, Nature, Space and Energy (enjoy mode).
- New Focus scenes: Commit Graph, Network Mesh, Server Room, Terminal, Library, Constellations, Graph Paper, Tide.
- New Chill scenes: Snow Cabin, Lighthouse, Campfire, Lo-fi Room, Lava Lamp, Night Train, Cherry Blossom, Autumn.
- New Nature scenes: Misty Peaks, Dunes, Canyon, Ocean Sunset, Waterfall, Deep Sea, Bamboo Grove, Thunderstorm.
- New Space scenes: Nebula, Galaxy, Black Hole, Rocket Launch, Meteor Shower, Warp.
- New Energy scenes: Equalizer, Neon City, Fireworks, Disco, LED Plasma, Invaders, Pong, Snake, Tetris Rain, Volcano.
- The picker is organised by mode. New commands: `/wallpaper work`, `chill`, `nature`, `space`, `enjoy`, `list`, and `next` within the current mode.
- Every scene's theme is now generated from one hue and one accent.

## 1.0.0

- Eleven live ASCII-tile wallpapers with matching color themes: Silicon, Attention, Iron, Night Shift, Code Rain, Outrun, Aurora, Orbit, Rainy Window (dark) and Blueprint, Zen Garden (light).
- `/wallpaper` picker above the prompt, with `next`, `random` and `off`.
- A `Your handle` setting that signs your name into the scenes.
- Frosted-glass panels, reduced-motion support, the last pick remembered between sessions.
