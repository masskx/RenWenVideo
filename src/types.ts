import type {Caption} from '@remotion/captions';
export type Shot = {
  id: string; src: string; kind: 'image' | 'video'; start: number; duration: number;
  zoomFrom: number; zoomTo: number; panX: number; trimBefore?: number;
  videoAudioMode?: 'mute' | 'ambience' | 'keep';
  videoAudioVolume?: number;
  videoPrompt?: string;
  videoProvider?: string;
};
export type Episode = {
  id: string; title: string; fps: number; width: number; height: number;
  titleEnd: number; transitionFrames: number; subtitleY: number; subtitleSize: number;
  audioSrc: string | null; musicSrc?: string | null; musicId?: string | null; musicVolume?: number; musicFadeFrames?: number;
  videoProvider?: string | null;
  videoAudioMode?: 'mute' | 'ambience' | 'keep';
  videoAudioVolume?: number;
  shots: Shot[]; captions: Caption[];
};
export const durationOf = (episode: Episode) => Math.max(...episode.shots.map(s => s.start + s.duration));
