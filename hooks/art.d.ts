export type SceneKey =
  | 'silicon' | 'attention' | 'iron' | 'night' | 'blueprint' | 'codeRain' | 'outrun' | 'aurora' | 'orbit' | 'rainy' | 'zen'
  | 'gitGraph' | 'mesh' | 'serverRack' | 'terminal' | 'graphPaper' | 'library' | 'constellations' | 'tide'
  | 'snowCabin' | 'lighthouse' | 'campfire' | 'lofi' | 'lavaLamp' | 'nightTrain' | 'cherry' | 'autumn'
  | 'mist' | 'dunes' | 'canyon' | 'oceanSunset' | 'waterfall' | 'deepSea' | 'bamboo' | 'thunder'
  | 'nebula' | 'galaxy' | 'blackHole' | 'rocket' | 'meteors' | 'warp'
  | 'equalizer' | 'neonCity' | 'fireworks' | 'disco' | 'plasma' | 'invaders' | 'pong' | 'snake' | 'tetris' | 'volcano'

export const SCENES: Record<SceneKey, (name: string) => string>
