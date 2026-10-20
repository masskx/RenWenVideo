// Shared building blocks for paper-look tutorials (look.theme: "paper"), on top of src/fx.
// Typography with size contrast, labels that rise late on their own springs, content swaps with a short blur,
// hand-drawn strikes and ticks, ground lines, and the physics helpers scenes use for contact frames.
// Rules: docs/video-craft/archive/导演层.md. (ai-agent-team keeps its own local copies of these.)
import React from 'react';
import {font, paper} from './theme';
import {CamKey, SceneProps, SfxEvent} from './ui';
import {clamp, drop, impulse, springStep, toss} from '../fx';

export const INK = paper.ink, DIM = paper.dim, A = paper.keyA, B = paper.keyB, CARD = paper.card, LINE = paper.line;
export const num = '"Inter Display", "Inter", "Noto Sans CJK SC", sans-serif';
export const S = (f: number) => f / 30;

export type Cue = SceneProps['cue'];
export type Scene = React.FC<SceneProps & {credit: string}> & {sfx?: (cue: Cue, dur: number) => SfxEvent[]; camera?: (cue: Cue, dur: number) => CamKey[]; hud?: boolean;
  /** Full-frame layer (1080 × 1920) drawn under the stage and captions, e.g. full-bleed footage. */ backdrop?: React.FC<SceneProps>};
export type P2 = [number, number];
/** Camera key: look at stage point (x, y) at zoom z from frame `at` (the camera itself lags a few frames). */
export const cam = (at: number, x: number, y: number, z: number): CamKey => ({at, x, y, z});

export const Big: React.FC<{size?: number; c?: string; w?: number; style?: React.CSSProperties; children: React.ReactNode}> = ({size = 88, c = INK, w = 900, style, children}) => (
  <div style={{fontFamily: font, fontWeight: w, fontSize: size, lineHeight: 1.14, color: c, letterSpacing: 1, ...style}}>{children}</div>
);
export const Kicker: React.FC<{size?: number; c?: string; style?: React.CSSProperties; children: React.ReactNode}> = ({size = 32, c = DIM, style, children}) => (
  <div style={{fontFamily: font, fontWeight: 700, fontSize: size, color: c, letterSpacing: 3, ...style}}>{children}</div>
);
export const Num: React.FC<{size?: number; c?: string; style?: React.CSSProperties; children: React.ReactNode}> = ({size = 120, c = INK, style, children}) => (
  <div style={{fontFamily: num, fontWeight: 900, fontSize: size, lineHeight: 1, color: c, letterSpacing: -1, ...style}}>{children}</div>
);
export const Ground: React.FC<{y: number; op?: number; x0?: number; x1?: number}> = ({y, op = 1, x0 = -20, x1 = 900}) => (
  <div style={{position: 'absolute', left: x0, width: x1 - x0, top: y, height: 2, background: INK, opacity: 0.7 * op}} />
);
export const Root: React.FC<{children: React.ReactNode}> = ({children}) => <div style={{position: 'relative', width: 880, height: 960}}>{children}</div>;

/** Labels rise after the event they belong to (导演层 §3: labels +6–10 frames), each on its own spring. */
export const Rise: React.FC<{f: number; at: number; dy?: number; style?: React.CSSProperties; children: React.ReactNode}> = ({f, at, dy = 28, style, children}) => {
  const s = springStep(S(f), S(at), {f: 2.4, z: 0.82});
  return <div style={style}>
    <div style={{opacity: clamp(s * 1.5), transform: `translateY(${(1 - s) * dy}px)`, filter: s > 0 && s < 0.97 ? `blur(${(1 - clamp(s)) * 6}px)` : undefined}}>{children}</div>
  </div>;
};
/** Visible between two frames: in on one spring, out on another, with a short blur (a content swap, not a new card). */
export const phaseOp = (f: number, from: number, to = 1e9): React.CSSProperties => {
  const i = springStep(S(f), S(from), {f: 2.4, z: 0.85}), o = springStep(S(f), S(to), {f: 2.8, z: 0.9});
  const v = clamp(i * 1.5) * (1 - clamp(o * 1.5));
  return {opacity: v, filter: v > 0.02 && v < 0.97 ? `blur(${(1 - v) * 7}px)` : undefined, transform: `translateY(${(1 - clamp(i)) * 24 - clamp(o) * 18}px)`};
};
export const Strike: React.FC<{p: number; c?: string; w?: number; children: React.ReactNode}> = ({p, c = INK, w = 5, children}) => (
  <span style={{position: 'relative', display: 'inline-block'}}>
    {children}
    <span style={{position: 'absolute', left: -6, right: -6, top: '54%', height: w, borderRadius: w, background: c, transform: `scaleX(${clamp(p)})`, transformOrigin: 'left'}} />
  </span>
);
export const Tick: React.FC<{p: number; size?: number; c?: string}> = ({p, size = 44, c = INK}) => (
  <svg width={size} height={size} viewBox="0 0 44 44" style={{flex: 'none'}}>
    <circle cx={22} cy={22} r={19} fill="none" stroke={c} strokeWidth={3} opacity={clamp(p * 2)} />
    <path d="M12 23 L19 30 L32 15" fill="none" stroke={c} strokeWidth={4.5} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={40} strokeDashoffset={40 * (1 - clamp(p))} />
  </svg>
);
/** A promise, not a demonstration: dashed B frame (演示 = solid, 承诺 = dashed). */
export const Promise: React.FC<{style?: React.CSSProperties; children: React.ReactNode}> = ({style, children}) => (
  <div style={{border: `4px dashed ${B}`, borderRadius: 12, padding: '18px 26px', ...style}}>{children}</div>
);
/** 0→1 over `dur` frames from `at` (for stroke reveals). */
export const draw = (f: number, at: number, dur = 14) => clamp((f - at) / dur);

export type Hop = {at: number; dur: number; from: P2; to: P2; lift?: number};
/** Where something tossed along a list of hops (frames) is. Before the first hop it waits at the first origin. */
export const hopAt = (f: number, hops: Hop[]) => {
  let h = hops[0];
  for (const k of hops) if (f >= k.at) h = k;
  return toss(S(f), {at: S(h.at), dur: S(h.dur), from: h.from, to: h.to, lift: h.lift ?? 140});
};
/** Squash of a receiver from the contacts that hit it (sum of impulses). */
export const hitOf = (f: number, contacts: number[], amp = 1) => contacts.reduce((s, c) => s + impulse(S(f), S(c), {f: 3.2, z: 0.42, amp}), 0);
/** Lift above `ground` of something dropped from `height` px so that it first touches down on frame `contact`. */
export const dropLift = (f: number, contact: number, ground: number, height = 620, g = 4200) => {
  const at = contact - Math.sqrt((2 * height) / g) * 30;
  return ground - drop(S(f), {at: S(at), from: ground - height, ground, g}).y;
};
/** Which parts to draw on this pass (see SceneProps.layer): `hud` = fixed titles/numbers, `world` = the picture under the camera. */
export const layers = (l?: 'stage' | 'hud') => ({hud: l !== 'stage', world: l !== 'hud'});
