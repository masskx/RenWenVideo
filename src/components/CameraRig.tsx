import React from 'react';
import {clamp, ease} from '../fx';
import {curve} from './curves';

export type CamShot = {
  /** Frame the camera arrives. */
  at: number;
  /** World point at the centre of the view, and zoom. */
  x: number;
  y: number;
  z: number;
  /**
   * How it gets here from the previous shot: "fly" (eases out and back in along the way, for jumps between info
   * points), "ease" (a plain in-out move, for small reframes), "cut" (jumps on `at`).
   */
  move?: 'fly' | 'ease' | 'cut';
  /** Travel frames before `at` (default 18 for fly, 12 for ease). */
  dur?: number;
};

export type CamState = {x: number; y: number; z: number};

const lerp = (a: number, b: number, u: number) => a + (b - a) * u;

/**
 * Where the camera is on frame f. Between shots it keeps drifting (a slow push of +1 %/s, capped), so a held
 * frame never dies. Pure function of f — use it for sound or blur keyed to camera speed too.
 */
export const camAt = (f: number, shots: CamShot[], o: {view?: [number, number]; drift?: number} = {}): CamState => {
  if (!shots.length) return {x: 0, y: 0, z: 1};
  const [vw, vh] = o.view ?? [900, 1080];
  let prev = shots[0], cur: CamState = {x: prev.x, y: prev.y, z: prev.z}, since = prev.at;
  for (let i = 1; i < shots.length; i += 1) {
    const s = shots[i], dur = s.move === 'cut' ? 0 : s.dur ?? (s.move === 'ease' ? 12 : 18);
    if (f < s.at - dur) break;
    if (f >= s.at) {
      prev = s;
      cur = {x: s.x, y: s.y, z: s.z};
      since = s.at;
      continue;
    }
    const u = (f - (s.at - dur)) / dur;
    const e = s.move === 'fly' ? curve.morph(u) : ease.inOutCubic(u);
    // Zoom moves in log space (equal ratios feel like equal steps); a flight pulls back mid-way in proportion to
    // the distance, so the viewer sees where it is going before it lands.
    let z = Math.exp(lerp(Math.log(prev.z), Math.log(s.z), e));
    if (s.move === 'fly') {
      const dist = Math.hypot(s.x - prev.x, s.y - prev.y) / Math.hypot(vw, vh);
      z *= 1 - Math.min(0.3, dist * 0.6) * Math.sin(Math.PI * e);
    }
    return {x: lerp(prev.x, s.x, e), y: lerp(prev.y, s.y, e), z};
  }
  const push = 1 + (o.drift ?? 0.01) * clamp((f - since) / 30, 0, 4);
  return {...cur, z: cur.z * push};
};

export type CameraRigProps = {
  f: number;
  shots: CamShot[];
  /** Viewport size in px (the box the rig fills). */
  w: number;
  h: number;
  /** Slow push per second while holding (0.01 = 1 %/s, capped at 4 s). */
  drift?: number;
  style?: React.CSSProperties;
  /** The world: lay everything out once, in world px, as if on one big sheet. */
  children: React.ReactNode;
};

/**
 * One big canvas, one continuous camera (the PaperClip move): lay every info point out on one sheet and let the
 * camera fly from point to point instead of cutting. Keep titles and captions outside the rig so they stay put.
 *
 *   <CameraRig f={f} w={900} h={1080} shots={[
 *     {at: 0, x: 450, y: 400, z: 1.1},
 *     {at: p.a, x: 450, y: 1500, z: 1.0, move: 'fly'},
 *     {at: p.b, x: 450, y: 950, z: 0.6, move: 'ease', dur: 20},   // pull back to show both
 *   ]}>{world}</CameraRig>
 */
export const CameraRig: React.FC<CameraRigProps> = ({f, shots, w, h, drift, style, children}) => {
  const c = camAt(f, shots, {view: [w, h], drift});
  return <div style={{position: 'absolute', left: 0, top: 0, width: w, height: h, overflow: 'hidden', ...style}}>
    <div style={{position: 'absolute', left: 0, top: 0, transformOrigin: '0 0',
      transform: `translate(${(w / 2).toFixed(2)}px, ${(h / 2).toFixed(2)}px) scale(${c.z.toFixed(4)}) translate(${(-c.x).toFixed(2)}px, ${(-c.y).toFixed(2)}px)`}}>
      {children}
    </div>
  </div>;
};
