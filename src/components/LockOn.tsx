import React from 'react';
import {mono} from '../tutorial/theme';
import {clamp} from '../fx';
import {curve} from './curves';

export type LockOnProps = {
  f: number;
  /** Frame the brackets start closing (put it on the word that names the target). */
  at: number;
  /** Target box in the parent's coordinates. */
  x: number;
  y: number;
  w: number;
  h: number;
  color?: string;
  /** Corner arm length and thickness, px. */
  len?: number;
  thick?: number;
  /** Space between the target and the brackets once locked. */
  pad?: number;
  /** Start scale (1.4 = from well outside the target). */
  from?: number;
  /** Frames to close. */
  dur?: number;
  /** Small mono tag on the top-left once locked (e.g. "已锁定"). Decoration only — say the fact in a caption too. */
  label?: string;
  /** Frame to let go (fade out over 6 frames). */
  until?: number;
};

/**
 * HUD lock-on: four corner brackets close from 1.4× onto a target with a fast-out snap, blink twice, then hold.
 * Use it to point at "this one" — the risky file, the key number, the line in a log — instead of an arrow.
 *
 *   <LockOn f={f} at={p.b} x={0} y={720} w={900} h={140} color={RED} label="已外传" />
 */
export const LockOn: React.FC<LockOnProps> = ({f, at, x, y, w, h, color = '#ffab40', len = 44, thick = 8, pad = 14, from = 1.4, dur = 8, label, until}) => {
  if (f < at) return null;
  const k = curve.snap((f - at) / dur);
  const s = from + (1 - from) * k;
  const blink = f - at >= dur && f - at < dur + 8 ? (Math.floor((f - at - dur) / 2) % 2 === 0 ? 0.35 : 1) : 1;
  const fade = until === undefined ? 1 : 1 - clamp((f - until) / 6);
  if (fade <= 0) return null;
  const bw = w + 2 * pad, bh = h + 2 * pad;
  const arm = (pos: React.CSSProperties, sides: string[]) => <div style={{position: 'absolute', width: len, height: len, ...pos,
    ...Object.fromEntries(sides.map((side) => [`border${side}`, `${thick}px solid ${color}`]))}} />;
  return <div style={{position: 'absolute', left: x - pad, top: y - pad, width: bw, height: bh, transform: `scale(${s.toFixed(4)})`,
    opacity: clamp(k * 3) * blink * fade, pointerEvents: 'none'}}>
    {arm({left: 0, top: 0}, ['Left', 'Top'])}
    {arm({right: 0, top: 0}, ['Right', 'Top'])}
    {arm({left: 0, bottom: 0}, ['Left', 'Bottom'])}
    {arm({right: 0, bottom: 0}, ['Right', 'Bottom'])}
    {label && k > 0.98 && <div style={{position: 'absolute', left: 0, top: -50, background: color, color: '#0c1a2c', fontFamily: mono, fontWeight: 800,
      fontSize: 30, lineHeight: '42px', padding: '0 12px', whiteSpace: 'nowrap'}}>{label}</div>}
  </div>;
};
