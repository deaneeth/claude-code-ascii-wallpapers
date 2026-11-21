export type SceneKey =
  | 'silicon' | 'attention' | 'iron' | 'night' | 'blueprint' | 'codeRain' | 'outrun' | 'aurora' | 'orbit' | 'rainy' | 'zen'
  | 'gitGraph' | 'mesh' | 'serverRack' | 'terminal' | 'graphPaper' | 'library' | 'constellations' | 'tide'
  | 'snowCabin' | 'lighthouse' | 'campfire' | 'lofi' | 'lavaLamp' | 'nightTrain' | 'cherry' | 'autumn'
  | 'mist' | 'dunes' | 'canyon' | 'oceanSunset' | 'waterfall' | 'deepSea' | 'bamboo' | 'thunder'
  | 'nebula' | 'galaxy' | 'blackHole' | 'rocket' | 'meteors' | 'warp'
  | 'equalizer' | 'neonCity' | 'fireworks' | 'disco' | 'plasma' | 'invaders' | 'pong' | 'snake' | 'tetris' | 'volcano'
  | 'meadow' | 'beach' | 'snowDay' | 'pastelCity' | 'greenhouse' | 'lavender' | 'kite' | 'sketch'
  | 'koi' | 'jellies' | 'whale' | 'butterflies' | 'cat' | 'birds' | 'fireflies' | 'owl' | 'turtle' | 'fox'
  | 'halftone' | 'dither' | 'riso' | 'flow' | 'sineStack' | 'radar'
  | 'springRain' | 'wheat' | 'harvestMoon' | 'iceLake'
  | 'horizon' | 'dotgrid' | 'grain' | 'lines'
  | 'vim' | 'hexdump' | 'asm' | 'sorting' | 'bigO' | 'diff' | 'tests' | 'voidCursor' | 'compiler' | 'panic'

export const SCENES: Record<SceneKey, (name: string) => string>
