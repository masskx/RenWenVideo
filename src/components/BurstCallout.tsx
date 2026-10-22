import React from 'react';
import {font} from '../tutorial/theme';
import {holdWiggle, noise, popScale} from './curves';

export type BurstCalloutProps = {
  f: number;
  /** Frame of the moment it reacts to (the spoken word, the reveal). */
  at: number;
  text: string;
  /** Reaction lag in frames: a reaction lands 2–3 frames after its cause (a fact that is being said lands on it). */
  lag?: number;
  w?: number;
  h?: number;
  size?: number;
  fill?: string;
  ink?: string;
  /** Edge colour of the burst and of the text keyline. */
  edge?: string;
  spikes?: number;
  /** How deep the spikes cut, 0..1. */
  spike?: number;
  /** Speed lines flashing out on impact. */
  rays?: boolean;
  /** Redraw the outline every N frames (line boil on decoration only); 0 = still. */
  boil?: number;
  deg?: number;
  seed?: number;
  style?: React.CSSProperties;
};

const starPath = (rx: number, ry: number, n: number, spike: number, seed: number) => {
  let d = '';
  for (let i = 0; i < 2 * n; i += 1) {
    const a = (i / (2 * n)) * Math.PI * 2 + (noise(seed, i) - 0.5) * 0.1;
    const k = i % 2 === 0 ? 1 + (noise(seed + 7, i) - 0.45) * 0.24 : 1 - spike + (noise(seed + 3, i) - 0.5) * 0.08;
    d += `${i ? 'L' : 'M'}${(Math.cos(a) * rx * k).toFixed(1)} ${(Math.sin(a) * ry * k).toFixed(1)}`;
  }
  return `${d}Z`;
};

/**
 * 爆炸框: a jagged starburst with one short word inside, slammed in with a spring and a flash of speed lines.
 * For the single "!" moment of a scene (a warning, a reveal, a surprising number) — at most one per scene.
 * Position it with `style` (it is centred on its own box).
 *
 *   <BurstCallout f={f} at={p.b} text="被偷了？" fill="#ff5a5a" style={{position: 'absolute', left: 480, top: 640}} />
 */
export const BurstCallout: React.FC<BurstCalloutProps> = ({f, at, text, lag = 3, w = 440, h = 260, size = 76, fill = '#ff5a5a', ink = '#ffffff',
  edge = '#0c1a2c', spikes = 13, spike = 0.28, rays = true, boil = 4, deg = -6, seed = 1, style}) => {
  const t0 = at + lag;
  const s = popScale(f, t0);
  if (s <= 0.001) return null;
  const hold = holdWiggle(f, t0, seed, {deg: 1.5, bob: 2});
  const frameSeed = seed * 31 + (boil ? Math.floor(Math.max(0, f - t0) / boil) % 3 : 0);
  const flash = Math.max(0, 1 - (f - t0) / 10);
  const pad = 1.7, W = w * pad, H = h * pad;
  return <div style={{position: 'absolute', width: W, height: H, marginLeft: -W / 2, marginTop: -H / 2, ...style,
    transform: `rotate(${(deg + (1 - Math.min(1, s)) * 14 + hold.deg).toFixed(2)}deg) scale(${(s * hold.s).toFixed(4)})`}}>
    <svg width={W} height={H} viewBox={`${-W / 2} ${-H / 2} ${W} ${H}`} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
      {rays && flash > 0 && Array.from({length: 18}, (_, i) => {
        const a = (i / 18) * Math.PI * 2 + noise(seed, i + 40) * 0.2, r0 = 0.62 + 0.35 * (1 - flash), r1 = r0 + 0.18 + 0.2 * noise(seed, i);
        const p = (r: number, da: number) => `${(Math.cos(a + da) * (w / 2) * r * 1.3).toFixed(1)} ${(Math.sin(a + da) * (h / 2) * r * 1.3).toFixed(1)}`;
        return <path key={i} d={`M${p(r0, 0)}L${p(r1, 0.03)}L${p(r1, -0.03)}Z`} fill={fill} opacity={flash} />;
      })}
      <path d={starPath(w / 2 + 10, h / 2 + 10, spikes, spike, frameSeed)} fill={edge} />
      <path d={starPath(w / 2, h / 2, spikes, spike, frameSeed)} fill={fill} />
    </svg>
    <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: font, fontWeight: 900,
      fontSize: size, color: ink, whiteSpace: 'nowrap', WebkitTextStroke: `${Math.round(size * 0.12)}px ${edge}`, paintOrder: 'stroke fill'}}>{text}</div>
  </div>;
};
