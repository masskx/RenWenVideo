import React from 'react';
import {clamp} from '../fx';
import {wobble} from './curves';

export type StickerSlapProps = {
  f: number;
  /** Contact frame: the sticker touches down here (put the "tap" sound here too). */
  at: number;
  /** Frames of the fall before contact. */
  fall?: number;
  /** Start scale and tilt while it is in the air. */
  from?: number;
  tilt?: number;
  /** Outline width and colour — the same outline on every sticker hides that the pictures came from different places. */
  outline?: number;
  outlineColor?: string;
  /** "box": a rounded border around a card or screenshot. "alpha": traces the shape of a cut-out PNG. */
  mode?: 'box' | 'alpha';
  radius?: number;
  /** Shadow colour; the shadow is big and soft in the air and tight on contact. */
  shadow?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
};

/**
 * PaperClip-style sticker: wraps a screenshot, a card or a cut-out with a thick outline and slaps it onto the
 * canvas — falls from 1.35× with a tilt and a lifted shadow, touches down on `at`, wobbles and settles.
 *
 *   <StickerSlap f={f} at={20}><img src={staticFile('images/tutorials/x/shot.png')} width={600} /></StickerSlap>
 *   <StickerSlap f={f} at={p.a} mode="alpha" outline={10}><Img src={cutout} /></StickerSlap>
 */
export const StickerSlap: React.FC<StickerSlapProps> = ({f, at, fall = 6, from = 1.35, tilt = 6, outline = 8, outlineColor = '#ffffff', mode = 'box',
  radius = 18, shadow = 'rgba(4,10,20,0.45)', style, children}) => {
  const p = (f - (at - fall)) / fall;
  if (p < 0) return null;
  let s: number, r: number, lift: number;
  if (p < 1) {
    const air = 1 - p * p;
    s = 1 + (from - 1) * air;
    r = tilt * air;
    lift = air;
  } else {
    const w = wobble(f, at);
    s = 1 - 0.035 * w;
    r = -0.8 * w;
    lift = 0;
  }
  const drop = `drop-shadow(0 ${(6 + 34 * lift).toFixed(1)}px ${(10 + 30 * lift).toFixed(1)}px ${shadow})`;
  const ring = mode === 'alpha'
    ? [[1, 0], [0.7, 0.7], [0, 1], [-0.7, 0.7], [-1, 0], [-0.7, -0.7], [0, -1], [0.7, -0.7]]
      .map(([dx, dy]) => `drop-shadow(${(dx * outline).toFixed(1)}px ${(dy * outline).toFixed(1)}px 0 ${outlineColor})`).join(' ')
    : '';
  return <div style={{display: 'inline-block', opacity: clamp(p * 4), transform: `rotate(${r.toFixed(2)}deg) scale(${s.toFixed(4)})`, filter: `${ring} ${drop}`.trim(), ...style}}>
    {mode === 'box'
      ? <div style={{border: `${outline}px solid ${outlineColor}`, borderRadius: radius, overflow: 'hidden', background: outlineColor}}>{children}</div>
      : children}
  </div>;
};
