export const font = '"Noto Sans CJK SC", "Source Han Sans SC", "PingFang SC", "Microsoft YaHei", sans-serif';
export const mono = '"JetBrains Mono", "DejaVu Sans Mono", Menlo, Consolas, monospace';

export const color = {
  bg: '#0a0e1a',
  panel: 'rgba(22, 29, 48, 0.92)',
  panelBorder: 'rgba(148, 163, 255, 0.18)',
  text: '#f4f6ff',
  dim: '#9aa3c0',
  cyan: '#22d3ee',
  violet: '#a78bfa',
  amber: '#fbbf24',
  green: '#4ade80',
  red: '#f87171',
  pink: '#f472b6',
  /** A/B core-noun colours (tutorial.highlights); keep other accents out of these hues. */
  keyA: '#f472b6',
  keyB: '#4ade80',
};

// Douyin overlays its UI on the top bar, right-hand action column and bottom description,
// so all content stays inside this stage.
export const stage = {left: 80, top: 300, width: 880, height: 960};

/**
 * Matte paper look (docs/video-craft/archive/导演层.md §6, §10): warm paper, near-black ink, two accents only (A/B),
 * no glow. Selected per tutorial with `look.theme: "paper"`.
 */
export const paper = {
  bg: '#f1ece2',
  card: '#faf7f1',
  ink: '#1d1b18',
  dim: '#6b645a',
  line: '#d8cfbf',
  keyA: '#bf4b2c',
  keyB: '#2d6a4d',
};

/**
 * Blueprint / engineering look for tech topics (docs/video-craft/发布与风格偏好.md §二, 风格词典 #27): deep navy sheet,
 * fine grid, pale engineering lines, mono read-outs. Two accents only (A amber, B cyan); light only where a source
 * emits it. Selected with `look.theme: "blueprint"`.
 */
export const blueprint = {
  bg: '#0c1a2c',
  panel: '#12263d',
  panelHi: '#183150',
  grid: '#1a2f49',
  line: '#3d5c80',
  ink: '#e8f0fa',
  dim: '#8ea6c2',
  keyA: '#ffab40',
  keyB: '#4fd6e8',
};

/**
 * Where things sit. "full": full-screen 9:16 for 视频号 / 抖音 / 小红书 — content x 60–960, y 200–1280, captions
 * centred on y 1390, nothing that matters at x > 960 or below y 1500 (platform buttons and description).
 * "douyin": the original 9:16 layout. "channels" (WeChat Channels): still a 1080×1920 canvas, but
 * everything that matters lives in the central 6:7 band (y 330–1590), so the feed crop (1080×1260) and the 3:4 cover
 * crop (1080×1440, y 240–1680) both keep it.
 */
/**
 * Cinema look (docs/video-craft/quick-reference.md §六, taste reference: the early explainers ai-era-11-rules /
 * marketing-engineer): navy-black with one cool key light, a vignette and fine grain, white type with one gold accent,
 * big headlines, soft surfaces instead of outlined boxes. Red is a meaning colour (danger) only. `look.theme: "cinema"`.
 */
const cinemaBase = {
  ink: '#ffffff',
  dim: 'rgba(255,255,255,0.62)',
  faint: 'rgba(255,255,255,0.38)',
  hair: 'rgba(255,255,255,0.13)',
  surface: 'rgba(255,255,255,0.055)',
  cool: '#8fd3ff',
};
/**
 * Palettes for the cinema look. `key` / `fill` are the two background lights ("r,g,b" + opacity), `pool` the light behind
 * a scene's hero. "ember" (the first version) lit black with gold, which read as muddy brown; "midnight" keeps the warm
 * colour for the gold type only and lights a navy-black with cool light, like the early explainers' #070b14.
 */
export const cinemaPalettes = {
  midnight: {...cinemaBase, bg: '#070b14', key: '92,132,255', keyO: 0.13, fill: '56,189,248', fillO: 0.06, pool: '120,150,255', gold: '#ffc53d', red: '#ff4d5e'},
  graphite: {...cinemaBase, bg: '#0a0a0c', key: '255,255,255', keyO: 0.06, fill: '255,255,255', fillO: 0.03, pool: '255,255,255', gold: '#f2b84b', red: '#ff5257'},
  ember: {...cinemaBase, bg: '#07090f', key: '255,197,61', keyO: 0.13, fill: '143,211,255', fillO: 0.07, pool: '255,197,61', gold: '#ffc53d', red: '#ff6b5b'},
};
export const cinema = cinemaPalettes.midnight;
/** Headline face: Inter Display for latin and numbers, CJK falls through to the house font. */
export const display = `"Inter Display", "Inter", ${font}`;

export type Layout = {stage: {left: number; top: number; width: number; height: number}; captionY: number; headerTop: number; clipTop: number;
  band: [number, number] | null; fadeTop?: number};
export const layoutOf = (frame: 'full' | 'douyin' | 'channels' | undefined): Layout => (frame === 'full'
  ? {stage: {left: 60, top: 200, width: 900, height: 1080}, captionY: 1390, headerTop: 110, clipTop: 140, band: null, fadeTop: 50}
  : frame === 'channels'
  ? {stage: {left: 80, top: 470, width: 880, height: 800}, captionY: 1452, headerTop: 356, clipTop: 420, band: [330, 1590]}
  : {stage, captionY: 1372, headerTop: 186, clipTop: 212, band: null});

export type Palette = {bg: string; text: string; dim: string; stroke: string; keyA: string; keyB: string; latin: string | null; line: string};
export const palette = (theme: 'dark' | 'paper' | 'blueprint' | 'cinema' | undefined): Palette => (theme === 'paper'
  ? {bg: paper.bg, text: paper.ink, dim: paper.dim, stroke: paper.bg, keyA: paper.keyA, keyB: paper.keyB, latin: null, line: paper.line}
  : theme === 'cinema'
  ? {bg: cinema.bg, text: cinema.ink, dim: cinema.dim, stroke: 'rgba(4,6,10,0.92)', keyA: cinema.gold, keyB: cinema.cool, latin: null, line: cinema.hair}
  : theme === 'blueprint'
  ? {bg: blueprint.bg, text: blueprint.ink, dim: blueprint.dim, stroke: blueprint.bg, keyA: blueprint.keyA, keyB: blueprint.keyB, latin: null, line: blueprint.line}
  : {bg: color.bg, text: '#ffffff', dim: color.dim, stroke: '#0a0e1a', keyA: color.keyA, keyB: color.keyB, latin: color.amber, line: '#2a3352'});
export const captionY = 1372;
