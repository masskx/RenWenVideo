// Scene lab: a film's real scene code as a still, before the voice exists (导演方法.md §三.6 "先证明画面": 3 style
// frames + frame 0 in real code). Renders any registered visual with its cue fallbacks, plus an optional caption in the
// film's caption style, so the style frames are the shots the film will actually use, not a separate mock-up.
//   npx remotion still src/index.ts SceneLab out.png --frame=60 --props='{"visual":"pc.turn","caption":"…","captions":"note","pk":{…}}'
// The scene sees f = the still's frame and dur = 300; cue(name, fallback) returns `cues[name]` or the fallback.
import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {sceneRegistry} from '../tutorial/scenes';
import {CaptionNote, CaptionSwiss, CaptionTele, Pk} from '../tutorial/package';

export const SCENE_LAB_FRAMES = 300;
export type SceneLabProps = {visual: string; cues?: Record<string, number>; caption?: string; captions?: 'note' | 'swiss' | 'tele'; pk?: Pk; captionTop?: number};

export const SceneLab: React.FC<SceneLabProps> = ({visual, cues = {}, caption, captions = 'note', pk, captionTop}) => {
  const f = useCurrentFrame();
  const Visual = sceneRegistry[visual];
  if (!Visual) return <AbsoluteFill style={{background: '#300', color: '#fff', fontSize: 48, padding: 60}}>unknown visual: {visual}</AbsoluteFill>;
  const cue = (name: string, fallback = 0) => cues[name] ?? fallback;
  const Backdrop = Visual.backdrop;
  const caps = caption ? [{text: caption, startMs: 0, endMs: 1e9}] : [];
  const C = captions === 'swiss' ? CaptionSwiss : captions === 'tele' ? CaptionTele : CaptionNote;
  return <AbsoluteFill style={{background: '#000'}}>
    {Backdrop && <Backdrop f={f} dur={SCENE_LAB_FRAMES} cue={cue} />}
    <Visual f={f} dur={SCENE_LAB_FRAMES} cue={cue} credit="" />
    {pk && caps.length > 0 && <C captions={caps} k={pk} y={captionTop} />}
  </AbsoluteFill>;
};
