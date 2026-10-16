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
 * Matte paper look (docs/video-craft/导演层.md §6, §10): warm paper, near-black ink, two accents only (A/B),
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

export type Palette = {bg: string; text: string; dim: string; stroke: string; keyA: string; keyB: string; latin: string | null; line: string};
export const palette = (theme: 'dark' | 'paper' | undefined): Palette => (theme === 'paper'
  ? {bg: paper.bg, text: paper.ink, dim: paper.dim, stroke: paper.bg, keyA: paper.keyA, keyB: paper.keyB, latin: null, line: paper.line}
  : {bg: color.bg, text: '#ffffff', dim: color.dim, stroke: '#0a0e1a', keyA: color.keyA, keyB: color.keyB, latin: color.amber, line: '#2a3352'});
export const captionY = 1372;
