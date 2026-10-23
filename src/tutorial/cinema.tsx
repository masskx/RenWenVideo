// Shared building blocks for cinema-look tutorials (look.theme: "cinema"). The look comes from the early explainers the
// user likes (ai-era-11-rules, marketing-engineer): one big headline with a marker on the key phrase, a big gold chapter
// number, soft translucent surfaces with a left accent bar instead of outlined boxes, one gold accent, light and depth.
// Rules: docs/video-craft/quick-reference.md §六 (高级感). Motion is smooth deceleration — type never bounces.
import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {cinema, display, font, mono} from './theme';
import {clamp, ease} from '../fx';

export const GOLD = cinema.gold, RED = cinema.red, INK = cinema.ink, DIM = cinema.dim, FAINT = cinema.faint, HAIR = cinema.hair;
export {display, font, mono};
/** Stage size in the "full" layout. */
export const W = 900, H = 1080;

const quint = (p: number) => 1 - Math.pow(1 - clamp(p), 5);
/** 0 → 1 over `d` frames from `at`, decelerating (no overshoot). */
export const rise = (f: number, at: number, d = 16) => quint((f - at) / d);

/**
 * The scene's root: the whole stage drifts in by 2 % over the scene (a slow push keeps a held frame alive without
 * anything bouncing). Lay content out in 900 × 1080.
 */
export const Root: React.FC<{f: number; dur: number; children: React.ReactNode}> = ({f, dur, children}) => (
  <div style={{position: 'relative', width: W, height: H, transformOrigin: '50% 45%', transform: `scale(${1 + 0.02 * clamp(f / Math.max(1, dur))})`}}>{children}</div>
);

export const Abs: React.FC<{x?: number; y: number; w?: number; h?: number; style?: React.CSSProperties; children?: React.ReactNode}> = ({x = 0, y, w = W, h, style, children}) => (
  <div style={{position: 'absolute', left: x, top: y, width: w, height: h, ...style}}>{children}</div>
);

/** Fade + rise + a little blur, decelerating. The default entrance for everything. */
export const Reveal: React.FC<{f: number; at: number; dy?: number; d?: number; style?: React.CSSProperties; children: React.ReactNode}> = ({f, at, dy = 34, d = 16, style, children}) => {
  const k = rise(f, at, d);
  if (k <= 0) return null;
  return <div style={{opacity: clamp(k * 1.4), transform: `translateY(${((1 - k) * dy).toFixed(2)}px)`, filter: k < 0.98 ? `blur(${((1 - k) * 8).toFixed(2)}px)` : undefined, ...style}}>{children}</div>;
};

/** Exit: fades and drops away over `d` frames from `at`; wrap things that are done. */
export const leave = (f: number, at: number, d = 12): React.CSSProperties => {
  const k = ease.inCubic(clamp((f - at) / d));
  return k <= 0 ? {} : {opacity: 1 - k, transform: `translateY(${-k * 24}px)`, filter: `blur(${k * 6}px)`};
};

/** Highlighter band behind the lower half of the words, sweeping in left to right (the explainers' marker). */
export const Marker: React.FC<{p: number; color?: string; children: React.ReactNode}> = ({p, color = GOLD, children}) => (
  <span style={{backgroundImage: `linear-gradient(180deg, transparent 60%, ${color}d0 60%, ${color}d0 94%, transparent 94%)`, backgroundRepeat: 'no-repeat',
    backgroundSize: `${Math.round(clamp(p) * 100)}% 100%`, padding: '0 6px', margin: '0 -6px'}}>{children}</span>
);

export type HeadlineProps = {
  f: number;
  /** Frame the headline starts; use a negative value so frame 0 already shows it (the hook rule). */
  at: number;
  /** Chapter number: big gold numeral with "/ total". */
  no?: number;
  total?: number;
  /** One short line above the headline. */
  kicker?: string;
  lines: React.ReactNode[];
  /** Index of the line that gets the marker sweep. */
  mark?: number;
  markColor?: string;
  size?: number;
  align?: 'left' | 'center';
};

/**
 * The headline block: optional chapter number, optional kicker, one or two big lines, a marker on the key phrase.
 * ≤ 10 characters a line; it states the point, it does not repeat the caption.
 */
export const Headline: React.FC<HeadlineProps> = ({f, at, no, total, kicker, lines, mark, markColor = GOLD, size = 100, align = 'left'}) => {
  const n = rise(f, at, 18);
  return <div style={{fontFamily: display, color: INK, textAlign: align}}>
    {no !== undefined && <div style={{display: 'flex', alignItems: 'baseline', gap: 14, justifyContent: align === 'center' ? 'center' : 'flex-start',
      opacity: clamp(n * 1.4), transform: `translateX(${(1 - n) * -40}px)`}}>
      <span style={{fontSize: 150, fontWeight: 800, color: GOLD, lineHeight: 1, letterSpacing: -4}}>{String(no).padStart(2, '0')}</span>
      {total && <span style={{fontSize: 44, fontWeight: 600, color: FAINT}}>/ {String(total).padStart(2, '0')}</span>}
    </div>}
    {kicker && <Reveal f={f} at={at + (no !== undefined ? 3 : 0)} dy={16}>
      <div style={{fontFamily: font, fontSize: 36, fontWeight: 600, color: DIM, letterSpacing: 4, marginTop: no !== undefined ? 10 : 0, marginBottom: 6}}>{kicker}</div>
    </Reveal>}
    {lines.map((line, i) => <Reveal key={i} f={f} at={at + 4 + i * 5}>
      <div style={{fontSize: size, fontWeight: 900, lineHeight: 1.16, letterSpacing: 1, whiteSpace: 'nowrap', textShadow: '0 6px 24px rgba(0,0,0,0.5)'}}>
        {i === mark ? <Marker p={rise(f, at + 14 + i * 5, 16)} color={markColor}>{line}</Marker> : line}
      </div>
    </Reveal>)}
  </div>;
};

/**
 * A soft surface: translucent fill, hairline edge, deep soft shadow, optional accent bar on the left (the explainers'
 * quote card). Use one per scene for the hero; never nest outlined boxes.
 */
export const Surface: React.FC<{accent?: string; pad?: string; style?: React.CSSProperties; children: React.ReactNode}> = ({accent, pad = '30px 36px', style, children}) => (
  <div style={{position: 'relative', background: 'linear-gradient(180deg, rgba(255,255,255,0.075), rgba(255,255,255,0.03))', border: `1.5px solid ${HAIR}`,
    borderRadius: 26, padding: pad, boxShadow: '0 30px 80px rgba(0,0,0,0.5)', ...style}}>
    {accent && <div style={{position: 'absolute', left: 0, top: 22, bottom: 22, width: 6, borderRadius: '0 3px 3px 0', background: accent}} />}
    {children}
  </div>
);

/** A drawn terminal on a surface: three faint dots, mono body. Generic, no product chrome. */
export const Terminal: React.FC<{size?: number; style?: React.CSSProperties; children: React.ReactNode}> = ({size = 48, style, children}) => (
  <Surface pad="0" style={{overflow: 'hidden', ...style}}>
    <div style={{height: 54, display: 'flex', gap: 12, alignItems: 'center', paddingLeft: 26, borderBottom: `1.5px solid ${HAIR}`}}>
      {[0, 1, 2].map((i) => <div key={i} style={{width: 14, height: 14, borderRadius: 7, background: 'rgba(255,255,255,0.22)'}} />)}
    </div>
    <div style={{padding: '22px 34px 28px', fontFamily: mono, fontWeight: 700, fontSize: size, lineHeight: 1.45, color: INK, whiteSpace: 'nowrap'}}>{children}</div>
  </Surface>
);

/** Typed command line with a blinking caret while typing. `cps` = characters per frame. */
export const Cmd: React.FC<{f: number; at: number; text: string; cps?: number}> = ({f, at, text, cps = 1}) => {
  const n = Math.max(0, Math.floor((f - at) * cps));
  const t = text.slice(0, n);
  return <div><span style={{color: GOLD}}>$ </span>{t}{n < text.length && <span style={{color: GOLD, opacity: f % 14 < 7 ? 1 : 0.25}}>▍</span>}</div>;
};

/** A soft pool of light behind the hero (motivated by the scene's key light), centred at (x, y). */
export const Pool: React.FC<{x: number; y: number; r?: number; color?: string; o?: number}> = ({x, y, r = 520, color = cinema.pool, o = 0.16}) => (
  <div style={{position: 'absolute', left: x - r, top: y - r, width: 2 * r, height: 2 * r, borderRadius: '50%', pointerEvents: 'none',
    background: `radial-gradient(circle, rgba(${color},${o}) 0%, rgba(${color},${o * 0.35}) 40%, transparent 70%)`}} />
);

/** A small round status dot that lights up on `at`. */
export const Dot: React.FC<{f: number; at: number; color?: string; size?: number}> = ({f, at, color = RED, size = 22}) => {
  const k = rise(f, at, 10);
  return <span style={{display: 'inline-block', width: size, height: size, borderRadius: size / 2, flex: 'none',
    background: k > 0 ? color : 'rgba(255,255,255,0.18)', boxShadow: k > 0 ? `0 0 ${18 * k}px ${color}` : 'none', transform: `scale(${1 + 0.25 * (1 - k) * (k > 0 ? 1 : 0)})`}} />;
};

/**
 * An illustrated plate: one generated picture filling the whole 1080 × 1920 frame, the way the early explainers carry each
 * point (scripts/generate-tutorial-images.mjs; docs/video-craft/插画底图.md). Use it as a scene's `backdrop`. A slow push
 * (in on even plates, out on odd ones, like the explainers' Ken Burns) and the explainers' shade — dark at the top for the
 * headline, clear through the middle where the picture speaks, dark again under the captions.
 * `src` is the plate id under images/tutorials/<id>/; `focus` moves the picture up (−) or down (+) in px.
 */
export const Plate: React.FC<{id: string; src: string; f: number; dur: number; index?: number; focus?: number; shade?: number}> = ({id, src, f, dur, index = 0, focus = 0, shade = 1}) => {
  const p = clamp(f / Math.max(1, dur));
  const zoomIn = index % 2 === 0;
  const scale = zoomIn ? 1.04 + p * 0.09 : 1.13 - p * 0.09;
  const y = focus + (zoomIn ? -24 * p : -24 * (1 - p));
  return <AbsoluteFill style={{background: cinema.bg, overflow: 'hidden'}}>
    <Img src={staticFile(`images/tutorials/${id}/${src}.jpg`)} style={{width: '100%', height: '100%', objectFit: 'cover', transform: `translateY(${y.toFixed(1)}px) scale(${scale.toFixed(4)})`}} />
    <AbsoluteFill style={{opacity: shade, background: 'linear-gradient(180deg, rgba(7,11,20,0.92) 0%, rgba(7,11,20,0.72) 22%, rgba(7,11,20,0.05) 42%, rgba(7,11,20,0.05) 55%, rgba(7,11,20,0.78) 72%, rgba(7,11,20,0.9) 100%)'}} />
  </AbsoluteFill>;
};
