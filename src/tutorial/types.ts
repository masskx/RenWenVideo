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
  voice: string;
  rate?: string;
  leadMs?: number;
  tailMs?: number;
  musicSrc?: string | null;
  musicVolume?: number;
  credit: string;
  source?: string;
  /** Labels for the header step tracker (scene.step 1..n highlights one). */
  steps?: string[];
  /** Per-line framing tour (fx beatTour); wide layouts need a smaller drift to stay inside the safe area. */
  motion?: {amp?: number; drift?: number};
  /** Scene id to freeze for the cover image; defaults to the first scene. */
  cover?: string;
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
