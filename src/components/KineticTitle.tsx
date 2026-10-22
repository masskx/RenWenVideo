import React from 'react';
import {font} from '../tutorial/theme';
import {holdWiggle, popOut, popScale} from './curves';

export type KineticTitleProps = {
  /** Frame within the scene. */
  f: number;
  /** Frame the first character starts to pop. Negative values let frame 0 already show a landed title. */
  at: number;
  text: string;
  size?: number;
  color?: string;
  /** Frames between characters (2 = the classic per-character bounce). */
  stagger?: number;
  /** Characters fall this far (px) as they pop. */
  drop?: number;
  /** Characters rotate in from ±tilt degrees (alternating). */
  tilt?: number;
  /** Hold wiggle in degrees once landed. Off by default (a moving title competes with the caption); ≈ 1 for light topics. */
  wiggle?: number;
  /** Frame to pop the whole title out. */
  outAt?: number;
  /**
   * "clean": fill + one dark keyline (default; captions, tech looks).
   * "hanazi": 综艺花字 three layers — fill, thick inner stroke, coloured outer stroke and a hard drop shadow.
   */
  look?: 'clean' | 'hanazi';
  /** "clean" only: the keyline colour. */
  stroke?: string;
  /** Hanazi only: the thick inner stroke (white in the classic look). */
  inner?: string;
  /** Hanazi only: the outer stroke and drop-shadow colour. */
  outer?: string;
  /** Stroke width in px (the outer stroke adds the same again in "hanazi"). */
  strokeWidth?: number;
  style?: React.CSSProperties;
};

/**
 * A title whose characters pop in one by one: scale 0 → 1.15 → 1 in ~8 frames, 2-frame stagger, a small drop
 * and tilt, then it holds still (optional slow wiggle). Use for the hook headline and section titles — not for running
 * subtitles (they must sit still to be read).
 *
 *   <KineticTitle f={f} at={-6} text="装个AI工具包" size={96} />
 *   <KineticTitle f={f} at={p.b} text="被偷了" look="hanazi" color="#ff5a5a" outer="#5a0d16" />
 */
export const KineticTitle: React.FC<KineticTitleProps> = ({f, at, text, size = 88, color = '#ffffff', stagger = 2, drop = 24, tilt = 5, wiggle = 0,
  outAt, look = 'clean', stroke = '#0c1a2c', inner = '#ffffff', outer = '#0c1a2c', strokeWidth, style}) => {
  const sw = strokeWidth ?? Math.round(size * (look === 'hanazi' ? 0.11 : 0.08));
  const chars = Array.from(text);
  const out = outAt === undefined ? 1 : popOut(f, outAt);
  if (out <= 0) return null;
  // Layers are stacked copies of the same glyph: CSS strokes are centred on the outline, so paint-order puts
  // the stroke under the fill and only the outer half shows.
  const layer = (w: number, c: string, extra?: React.CSSProperties): React.CSSProperties => ({WebkitTextStroke: `${w}px ${c}`, paintOrder: 'stroke fill', ...extra});
  const shadow = look === 'hanazi' ? `0 ${Math.round(size * 0.07)}px 0 ${outer}` : '0 6px 18px rgba(0,0,0,0.45)';
  return <div style={{fontFamily: font, fontWeight: 900, fontSize: size, lineHeight: 1.15, color, whiteSpace: 'nowrap', letterSpacing: 1, ...style}}>
    {chars.map((ch, i) => {
      if (ch === ' ') return <span key={i}> </span>;
      const t0 = at + i * stagger;
      const s = popScale(f, t0);
      const w = holdWiggle(f, t0, i * 0.9, {deg: wiggle, bob: wiggle ? 3 : 0, breath: wiggle ? 0.012 : 0});
      const sign = i % 2 ? 1 : -1;
      const fall = 1 - Math.min(1, popScale(f, t0 - 1));
      const transform = `translateY(${(-drop * fall + w.dy).toFixed(2)}px) rotate(${(sign * tilt * fall + w.deg).toFixed(2)}deg) scale(${(s * w.s * out).toFixed(4)})`;
      return <span key={i} style={{position: 'relative', display: 'inline-block', transform, transformOrigin: '50% 75%', visibility: s > 0.001 ? 'visible' : 'hidden'}}>
        {look === 'hanazi'
          ? <>
            <span style={layer(sw * 2, outer, {color: outer, textShadow: shadow})}>{ch}</span>
            <span style={layer(sw, inner, {position: 'absolute', left: 0, top: 0})}>{ch}</span>
            <span style={{position: 'absolute', left: 0, top: 0}}>{ch}</span>
          </>
          : <span style={layer(sw, stroke, {textShadow: shadow})}>{ch}</span>}
      </span>;
    })}
  </div>;
};
