// All the scenes, by key. Each is a function of the handle that gets signed into it.
import { LEGACY } from './legacy.js'
import { FOCUS } from './scenes-focus.js'
import { CHILL } from './scenes-chill.js'
import { NATURE } from './scenes-nature.js'
import { SPACE } from './scenes-space.js'
import { ENERGY } from './scenes-energy.js'
import { DEV } from './scenes-dev.js'
import { LIGHT } from './scenes-light.js'
import { CREATURES } from './scenes-creatures.js'
import { ART, SEASONS, MINIMAL } from './scenes-art.js'

export const SCENES = { ...LEGACY, ...FOCUS, ...CHILL, ...NATURE, ...SPACE, ...ENERGY, ...DEV, ...LIGHT, ...CREATURES, ...ART, ...SEASONS, ...MINIMAL }
