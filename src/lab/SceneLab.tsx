import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {sceneRegistry} from '../tutorial/scenes';
import {CaptionMap, CaptionNote, Pk} from '../tutorial/package';
import {HostFrame} from '../tutorial/host';

// SceneLab: render one scene's full-frame layer at a given frame without a voice timeline (cues fall back to the
// scene's own defaults), with an optional mock caption — for proving the look before voicing (导演方法 §三.6).
// npx remotion still src/index.ts SceneLab qa/lab/x.png --frame=40 --props='{"visual":"ns.hook","caption":"…","chip":"#A9A5F0"}'
export const SCENE_LAB_FRAMES = 400;
const PK: Pk = {bg: '#ECF0EB', panel: '#FAFBF8', ink: '#12272E', accent: '#FFFC9C', onAccent: '#12272E', dim: '#6B7A7E'};
/** `note`: render the caption as a blueprint drawing note on `pk`; `host`: show the host window at [x, y, size] (mock, mouth closed). */
export const SceneLab: React.FC<{visual: string; caption?: string; chip?: string; note?: boolean; pk?: Pk; host?: [number, number, number]}> = ({visual, caption, chip, note, pk, host}) => {
  const f = useCurrentFrame();
  const Sc = sceneRegistry[visual];
  const Back = Sc?.backdrop;
  return <AbsoluteFill style={{background: '#fff'}}>
    {Back ? <Back f={f} dur={SCENE_LAB_FRAMES} cue={(_n, fb) => fb ?? 0} /> : null}
    {host ? <div style={{position: 'absolute', left: host[0], top: host[1]}}><HostFrame f={f} size={host[2]} mode="window" colors={pk ? {panel: pk.panel, accent: pk.accent, ink: pk.ink, bg: pk.bg} : undefined} expr="smile" /></div> : null}
    {caption && note ? <CaptionNote captions={[{text: caption, startMs: 0, endMs: 1e9}]} k={pk ?? PK} /> : caption ? <CaptionMap captions={[{text: caption, startMs: 0, endMs: 1e9}]} k={PK} chip={chip} /> : null}
  </AbsoluteFill>;
};
