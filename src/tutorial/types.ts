export type TutorialScene = {
  id: string;
  visual: string;
  step: number;
  narration: string;
};

export type Tutorial = {
  id: string;
  title: string;
  subtitle: string;
  fps: number;
  width: number;
  height: number;
  /** Narration: the user's cloned Doubao voice; "edge" is an agreed backup only (scripts/generate-tutorial-voice.py, docs/video-craft/配音.md). */
  tts?: {provider?: 'doubao' | 'edge'; voice?: string; rate?: number; pace?: string; [key: string]: unknown};
  leadMs?: number;
  tailMs?: number;
  musicSrc?: string | null;
  musicVolume?: number;
  /** How far the music ducks under the voice, in dB (default 10). */
  musicDuckDb?: number;
  credit: string;
  source?: string;
  /** Labels for the header step tracker (scene.step 1..n highlights one). */
  steps?: string[];
  /** Per-line framing tour (fx beatTour); wide layouts need a smaller drift to stay inside the safe area. */
  motion?: {amp?: number; drift?: number};
  /**
   * Look switches for the director layer (docs/video-craft/archive/导演层.md). Defaults keep the original dark look:
   * theme "dark", tour (per-caption whole-stage reframing) on, particles on, default cut kinds.
   */
  look?: {theme?: 'dark' | 'paper' | 'blueprint' | 'cinema'; frame?: 'full' | 'douyin' | 'channels'; header?: boolean | 'chapters' | 'label'; tour?: boolean; particles?: boolean; mascot?: boolean;
    cuts?: {big?: ('sweep' | 'iris' | 'pageTurn' | 'push' | 'pushUp' | 'glitch')[]; small?: ('sweep' | 'iris' | 'pageTurn' | 'push' | 'pushUp' | 'glitch')[]}};
  /** Series name for the `look.header: "label"` line (top-left); defaults to `title`. */
  series?: string;
  /** The video's two core nouns (A/B): fixed colours in captions and visuals. */
  highlights?: {text: string; role: 'A' | 'B'}[];
  /** Scene id to freeze for the cover image; defaults to the first scene. */
  cover?: string;
  /**
   * Designed cover (docs/video-craft/封面.md): one anchor (a scene visual drawn without HUD), a short headline,
   * an optional support line and tag — laid out separately for each ratio instead of cropping one frame.
   * `anchor` in a layout = where the stage centre (440, 400) lands and its scale; `headline` = top-left of the title.
   */
  coverCard?: CoverCard;
  scenes: TutorialScene[];
};

export type TimedCaption = {text: string; startMs: number; endMs: number};

export type SceneTiming = {
  id: string;
  audioSrc: string;
  audioMs: number;
  startFrame: number;
  durationFrames: number;
  cues: Record<string, number>;
  captions: TimedCaption[];
};

export type TutorialTiming = {
  id: string;
  voice: string;
  fps: number;
  leadMs: number;
  totalFrames: number;
  scenes: SceneTiming[];
};

export type TutorialProps = {tutorial: Tutorial; timing: TutorialTiming};

export type CoverRatio = '3:4' | '6:7' | '9:16';
export type CoverCard = {
  template: 'number' | 'conflict' | 'comparison' | 'emotion';
  /** One or two lines; the last line is set in the A colour. */
  headline: string[];
  support?: string;
  tag?: string;
  anchor: string;
  /** Per ratio: positions, plus optional copy / anchor that override the card's own for that ratio. */
  layouts: Record<CoverRatio, {headline: [number, number]; size: number; anchor: [number, number, number]; support: number;
    text?: string[]; supportText?: string; tagText?: string; anchorId?: string}>;
};
export const COVER_SIZE: Record<CoverRatio, [number, number]> = {'3:4': [1080, 1440], '6:7': [1080, 1260], '9:16': [1080, 1920]};
