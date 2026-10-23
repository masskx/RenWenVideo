// Props (道具): concrete things that do something on the word they belong to — a stamp slams, a word is struck out and
// replaced, a number rolls, one dot in a thousand stays lit, envelopes fly along an arc, a price tag swings. Our own
// implementation of the "一句一画 / 具体代替抽象" method in Xian's 梵高 explainer and its skill
// (xianxie6/landscape-explainer-video, studied in docs/video-craft/学习/xian-梵高做片法.md; that repo has no licence,
// so nothing is copied from it). Use them inside a scene (stage coordinates) or a backdrop (1080 × 1920).
// Related: src/components (mg15-derived: StickerSlap, CountUp, LockOn, DrawPath …) does some of the same in mg15's idiom;
// reach for these when a scene is timed with cue() frames and needs the film's own colours.
//
// Everything is a pure function of the frame. Timing helpers: `pop` (springs in, overshoots a little — for objects,
// stamps, stickers; headlines keep cinema's no-bounce `rise`), `ramp` (eased 0 → 1), `swing` (damped wobble).
// Colour and type are the film's, not the kit's (huashu-motion references/colour.md: find the colours in the material —
// brand values, the product, the paper's own figures — before inventing any; dark + one warm accent + cream type, or
// cream + serif + orange, is the "AI house look"). Every prop takes its colours and `family` as props; TONE is only a
// neutral placeholder for the lab. 思源宋体 (`serif`) suits subjects it grows from (history, art, letters), not by default.
import React from 'react';
import {clamp, ease, hash} from '../fx';
import {font, mono} from './theme';
import {hand, serif} from './fonts';

export {hand, serif};
export const TONE = {
  paper: '#F4F5F7', ink: '#111318', night: '#0E1013', cream: '#FFFFFF',
  signal: '#2F5BFF', cobalt: '#2F5BFF', marker: '#FFD43B', green: '#1E9E5A', mute: '#8B8F98',
};

/** 0 → ~1.06 → 1 over `d` frames from `at` (a small overshoot): things that land. Negative before `at`. */
export const pop = (f: number, at: number, d = 10) => (f < at ? -1 : ease.outBack(clamp((f - at) / d), 1.7));
/** Eased 0 → 1 between frames a and b. */
export const ramp = (f: number, a: number, b: number) => ease.inOutCubic(clamp((f - a) / Math.max(1, b - a)));
/** Damped wobble in degrees after `at` (a tag on a string, a sign that was hit). */
export const swing = (f: number, at: number, amp = 14, period = 22) => (f < at ? 0 : amp * Math.exp(-(f - at) / 26) * Math.sin(((f - at) / period) * Math.PI * 2));
/** Point on a quadratic Bézier: for things that fly along an arc. */
export const arc = (t: number, a: [number, number], c: [number, number], b: [number, number]): [number, number] =>
  [(1 - t) ** 2 * a[0] + 2 * (1 - t) * t * c[0] + t * t * b[0], (1 - t) ** 2 * a[1] + 2 * (1 - t) * t * c[1] + t * t * b[1]];

const shown = (p: number) => p > -0.5;

/** A tilted label (centre at x, y) that springs in: 据说 / 模拟测试 / 当时的世界纪录. One or two per frame, never more. */
export const Sticker: React.FC<{x: number; y: number; p: number; rot?: number; size?: number; bg?: string; color?: string; children: React.ReactNode}> = ({x, y, p, rot = -5, size = 44, bg = TONE.marker, color = TONE.ink, children}) =>
  !shown(p) ? null : (
    <div style={{position: 'absolute', left: x, top: y, transform: `translate(-50%, -50%) rotate(${rot}deg) scale(${Math.max(0, p)})`, opacity: clamp(p * 3),
      background: bg, color, fontFamily: font, fontWeight: 900, fontSize: size, lineHeight: 1.15, padding: `${size * 0.18}px ${size * 0.42}px`, borderRadius: size * 0.18,
      whiteSpace: 'nowrap', boxShadow: `0 ${size * 0.14}px 0 rgba(0,0,0,0.22)`}}>{children}</div>
  );

/**
 * A rubber stamp that slams down (失败 / 已拦截 / 越权): starts 2.2× and transparent, lands on `at`, ink a little uneven.
 * Put the thud sound on the same frame.
 */
export const Stamp: React.FC<{x: number; y: number; f: number; at: number; size?: number; color?: string; rot?: number; family?: string; children: React.ReactNode}> = ({x, y, f, at, size = 76, color = TONE.signal, rot = -9, family = font, children}) => {
  if (f < at - 4) return null;
  const k = ease.outCubic(clamp((f - at + 4) / 4)); // 4 frames of fall, landing on `at`
  const s = 2.2 - 1.2 * k + (f >= at ? 0.04 * Math.exp(-(f - at) / 3) * Math.sin((f - at) * 1.8) : 0);
  const id = `ink${Math.round(x)}_${Math.round(y)}`;
  return (
    <div style={{position: 'absolute', left: x, top: y, transform: `translate(-50%, -50%) rotate(${rot}deg) scale(${s})`, opacity: 0.25 + 0.67 * k}}>
      <svg width={0} height={0} style={{position: 'absolute'}}>
        <filter id={id}><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={Math.round(x + y) % 97} /><feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -1.1 1.45" /><feComposite in="SourceGraphic" operator="in" /></filter>
      </svg>
      <div style={{filter: `url(#${id})`, border: `${size * 0.09}px solid ${color}`, outline: `${size * 0.035}px solid ${color}`, outlineOffset: size * 0.06, color, fontFamily: family, fontWeight: 900,
        fontSize: size, lineHeight: 1.1, padding: `${size * 0.06}px ${size * 0.3}px`, borderRadius: size * 0.1, letterSpacing: size * 0.08, whiteSpace: 'nowrap'}}>{children}</div>
    </div>
  );
};

/**
 * Strike and replace (删除线反转): the old word is crossed out on `strike`, an arrow draws, the new word lands on `turn`
 * with a few sparks. The visual for any "不是 A，是 B" sentence.
 */
export const Swap: React.FC<{x: number; y: number; f: number; strike: number; turn: number; from: string; to: string; size?: number; color?: string; dim?: string; line?: string; vertical?: boolean; family?: string}> = ({
  x, y, f, strike, turn, from, to, size = 120, color = TONE.signal, dim = TONE.mute, line = TONE.signal, vertical = false, family = font,
}) => {
  const k = ramp(f, strike, strike + 9), a = ramp(f, turn - 8, turn), n = pop(f, turn, 9);
  return (
    <div style={{position: 'absolute', left: x, top: y, display: 'flex', flexDirection: vertical ? 'column' : 'row', alignItems: 'center', gap: size * 0.3, transform: 'translate(-50%, -50%)'}}>
      <div style={{position: 'relative', fontFamily: family, fontWeight: 900, fontSize: size, color: k > 0.5 ? dim : 'inherit', opacity: 1 - 0.35 * k, whiteSpace: 'nowrap'}}>
        {from}
        <div style={{position: 'absolute', left: '-6%', width: '112%', top: '52%', height: Math.max(8, size * 0.1), background: line, borderRadius: 6,
          transform: `scaleX(${k}) rotate(-4deg)`, transformOrigin: 'left center'}} />
      </div>
      <svg width={size * 0.8} height={size * 0.6} viewBox="0 0 80 60" style={{overflow: 'visible', transform: vertical ? 'rotate(90deg)' : undefined, opacity: a > 0 ? 1 : 0}}>
        <path d="M4 30 H66 M50 14 L68 30 L50 46" fill="none" stroke="currentColor" strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - a} />
      </svg>
      <div style={{position: 'relative', fontFamily: family, fontWeight: 900, fontSize: size, color, whiteSpace: 'nowrap', opacity: clamp(n * 3), transform: `scale(${n < 0 ? 0 : 1.6 - 0.6 * n})`}}>
        {to}
        {n > 0 && [0, 1, 2].map((i) => <Spark key={i} x={[-0.1, 1.05, 0.9][i]} y={[-0.15, 0.05, 1.05][i]} s={size * 0.22 * clamp(ramp(f, turn + 2 + i * 3, turn + 10 + i * 3)) * (1 - ramp(f, turn + 30, turn + 50))} c={color} />)}
      </div>
    </div>
  );
};
const Spark: React.FC<{x: number; y: number; s: number; c: string}> = ({x, y, s, c}) => s <= 0.5 ? null : (
  <svg width={s * 2} height={s * 2} viewBox="-10 -10 20 20" style={{position: 'absolute', left: `${x * 100}%`, top: `${y * 100}%`, transform: 'translate(-50%, -50%)', overflow: 'visible'}}>
    <path d="M0 -10 Q1.5 -1.5 10 0 Q1.5 1.5 0 10 Q-1.5 1.5 -10 0 Q-1.5 -1.5 0 -10Z" fill={c} />
  </svg>
);

/** The value of a rolling number at frame f: eases out from `from` to `to` between frames a and b. */
export const rollTo = (f: number, a: number, b: number, to: number, from = 0) => from + (to - from) * ease.outCubic(clamp((f - a) / Math.max(1, b - a)));
/**
 * A number that rolls up and lands on its word (数字落在词上): tabular digits so it doesn't jitter. The unit sits smaller
 * beside it. `land` is the frame the final value must show — put the narration cue there.
 */
export const Roll: React.FC<{f: number; start: number; land: number; to: number; from?: number; decimals?: number; prefix?: string; unit?: string; size?: number; color?: string; sep?: boolean; family?: string; style?: React.CSSProperties}> = ({
  f, start, land, to, from = 0, decimals = 0, prefix = '', unit = '', size = 200, color = TONE.ink, sep = true, family = font, style,
}) => {
  const v = rollTo(f, start, land, to, from);
  const txt = sep ? v.toLocaleString('en-US', {minimumFractionDigits: decimals, maximumFractionDigits: decimals}) : v.toFixed(decimals);
  const kick = f >= land ? 1 + 0.06 * Math.exp(-(f - land) / 4) : 1;
  return (
    <div style={{fontFamily: family, fontWeight: 900, fontSize: size, color, lineHeight: 1, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em', whiteSpace: 'nowrap', transform: `scale(${kick})`, transformOrigin: 'left bottom', ...style}}>
      {prefix}{txt}<span style={{fontSize: size * 0.42, marginLeft: size * 0.06}}>{unit}</span>
    </div>
  );
};

/**
 * One in many (千里挑一): `n` cells fill in a sweep from `fill`, all go dark on `dim`, one stays lit and gets a ring on
 * `pick`. For "only 3.4 % got through" or "1 in 900". `lit` lists the cells that stay lit (default: one near the centre).
 */
export const OneInMany: React.FC<{f: number; fill: number; dim: number; pick: number; n: number; cols: number; w: number; cell?: number; lit?: number[]; on?: string; off?: string; hot?: string}> = ({
  f, fill, dim, pick, n, cols, w, cell, lit, on = TONE.ink, off = 'rgba(23,23,26,0.12)', hot = TONE.signal,
}) => {
  const rows = Math.ceil(n / cols), step = w / cols, c = cell ?? step * 0.72, hgt = rows * step;
  const keep = new Set(lit ?? [Math.floor(rows / 2) * cols + Math.floor(cols * 0.62)]);
  const d = ramp(f, dim, dim + 12), ringP = ramp(f, pick, pick + 14);
  return (
    <svg width={w} height={hgt} style={{overflow: 'visible', display: 'block'}}>
      {Array.from({length: n}, (_, i) => {
        const r = Math.floor(i / cols), col = i % cols;
        const appear = clamp((f - fill - (r + col * 0.35) * 0.7) / 4);
        if (appear <= 0) return null;
        const k = keep.has(i);
        return <rect key={i} x={col * step + (step - c) / 2} y={r * step + (step - c) / 2} width={c} height={c} rx={c * 0.18}
          fill={k && d > 0 ? hot : d > 0 ? off : on} opacity={appear * (k ? 1 : 1 - 0.0 * d)} />;
      })}
      {[...keep].map((i) => {
        const cx = (i % cols) * step + step / 2, cy = Math.floor(i / cols) * step + step / 2;
        return <HandRing key={i} cx={cx} cy={cy} rx={step * 1.5} ry={step * 1.25} p={ringP} color={hot} sw={Math.max(4, step * 0.16)} />;
      })}
    </svg>
  );
};

/** A hand-drawn ring (红圈) drawn around (cx, cy) as p goes 0 → 1; overshoots its start like a pen does. Inside an <svg>. */
export const HandRing: React.FC<{cx: number; cy: number; rx: number; ry: number; p: number; color?: string; sw?: number; seed?: number}> = ({cx, cy, rx, ry, p, color = TONE.signal, sw = 7, seed = 1}) => {
  if (p <= 0) return null;
  const pts: string[] = [];
  for (let i = 0; i <= 72; i++) {
    const a = -2.0 + (i / 72) * Math.PI * 2.18;
    const wob = 1 + 0.05 * Math.sin(i * 0.55 + seed) + 0.07 * (i / 72);
    pts.push(`${(cx + Math.cos(a) * rx * wob).toFixed(1)},${(cy + Math.sin(a) * ry * wob).toFixed(1)}`);
  }
  return <path d={`M${pts.join(' L')}`} fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - clamp(p)} />;
};

/** A hand-drawn underline / arrow stroke between two points, drawn as p goes 0 → 1. Inside an <svg>. */
export const HandLine: React.FC<{x1: number; y1: number; x2: number; y2: number; p: number; bend?: number; color?: string; sw?: number; head?: boolean}> = ({x1, y1, x2, y2, p, bend = 0.12, color = TONE.signal, sw = 7, head = false}) => {
  if (p <= 0) return null;
  const mx = (x1 + x2) / 2 - (y2 - y1) * bend, my = (y1 + y2) / 2 + (x2 - x1) * bend;
  const ang = Math.atan2(y2 - my, x2 - mx), hl = sw * 3.4, hp = clamp((p - 0.85) / 0.15);
  return <g>
    <path d={`M${x1} ${y1} Q${mx} ${my} ${x2} ${y2}`} fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - clamp(p)} />
    {head && hp > 0 && <path d={`M${x2 - Math.cos(ang - 0.5) * hl * hp} ${y2 - Math.sin(ang - 0.5) * hl * hp} L${x2} ${y2} L${x2 - Math.cos(ang + 0.5) * hl * hp} ${y2 - Math.sin(ang + 0.5) * hl * hp}`}
      fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" />}
  </g>;
};

/**
 * Things flying along an arc from a to b, one after another (寄信飞线 / money leaving the account / requests going out):
 * `n` items, the first leaves on `start`, one every `every` frames, each flight `dur` frames. `render(i)` draws one item.
 */
export const Flight: React.FC<{f: number; start: number; n: number; every?: number; dur?: number; a: [number, number]; b: [number, number]; lift?: number; spin?: number; trail?: string; render: (i: number) => React.ReactNode}> = ({
  f, start, n, every = 6, dur = 22, a, b, lift = 0.35, spin = 10, trail, render,
}) => {
  const c: [number, number] = [(a[0] + b[0]) / 2, Math.min(a[1], b[1]) - Math.abs(b[0] - a[0]) * lift];
  const W = Math.max(a[0], b[0], c[0]) + 200, H = Math.max(a[1], b[1]) + 200;
  return <>
    {trail && <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
      <path d={`M${a[0]} ${a[1]} Q${c[0]} ${c[1]} ${b[0]} ${b[1]}`} fill="none" stroke={trail} strokeWidth={4} strokeDasharray="4 14" strokeLinecap="round" pathLength={1000}
        strokeDashoffset={0} opacity={ramp(f, start - 10, start)} />
    </svg>}
    {Array.from({length: n}, (_, i) => {
      const t = (f - start - i * every) / dur;
      if (t < 0 || t > 1.02) return null;
      const [x, y] = arc(ease.inOutCubic(clamp(t)), a, c, b);
      return <div key={i} style={{position: 'absolute', left: x, top: y, transform: `translate(-50%, -50%) rotate(${(hash(i) - 0.5) * spin + (t - 0.5) * spin}deg) scale(${0.8 + 0.3 * Math.sin(Math.PI * clamp(t))})`}}>{render(i)}</div>;
    })}
  </>;
};

/** An envelope, a token for anything sent (messages, requests, instructions). */
export const Envelope: React.FC<{w?: number; paper?: string; ink?: string; seal?: string}> = ({w = 96, paper = TONE.cream, ink = TONE.ink, seal = TONE.signal}) => (
  <svg width={w} height={w * 0.66} viewBox="0 0 90 60" style={{display: 'block', overflow: 'visible'}}>
    <rect x={2} y={2} width={86} height={56} rx={5} fill={paper} stroke={ink} strokeWidth={3.5} />
    <path d="M3 5 L45 35 L87 5" fill="none" stroke={ink} strokeWidth={3.5} strokeLinejoin="round" />
    <circle cx={45} cy={35} r={7} fill={seal} />
  </svg>
);

/** A pile that builds up: `n` items drop from above one by one from `start` and settle in a heap at (x, y). */
export const Pile: React.FC<{f: number; start: number; n: number; every?: number; x: number; y: number; spread?: number; render: (i: number) => React.ReactNode}> = ({f, start, n, every = 2, x, y, spread = 220, render}) => (
  <>{Array.from({length: n}, (_, i) => {
    const t = f - start - i * every;
    if (t < 0) return null;
    const row = Math.floor(Math.sqrt(i)), tx = x + (hash(i * 3.3) - 0.5) * spread * (1 - row * 0.08), ty = y - row * 26 - hash(i * 1.7) * 18;
    const fall = clamp(t / 9), yy = ty - (1 - ease.outCubic(fall)) * 700, r = (hash(i * 5.1) - 0.5) * 50;
    return <div key={i} style={{position: 'absolute', left: tx, top: yy, transform: `translate(-50%, -50%) rotate(${r}deg)`}}>{render(i)}</div>;
  })}</>
);

/** A price tag on a string that swings and settles (吊牌价签). (x, y) is where the string hangs from. */
export const Tag: React.FC<{x: number; y: number; f: number; at: number; w?: number; color?: string; paper?: string; ink?: string; family?: string; children: React.ReactNode}> = ({x, y, f, at, w = 300, color = TONE.signal, paper = TONE.cream, ink = TONE.ink, family = font, children}) => {
  const p = pop(f, at, 10);
  if (!shown(p)) return null;
  return (
    <div style={{position: 'absolute', left: x, top: y, transformOrigin: '0 0', transform: `rotate(${swing(f, at, 16)}deg) scale(${Math.max(0, p)})`}}>
      <div style={{position: 'absolute', left: -2, top: 0, width: 4, height: 60, background: ink}} />
      <div style={{position: 'absolute', left: -w / 2, top: 56, width: w, padding: '22px 0 26px', background: paper, border: `5px solid ${ink}`, borderRadius: 18, textAlign: 'center',
        fontFamily: family, fontWeight: 900, fontSize: w * 0.2, color, boxShadow: '0 14px 0 rgba(0,0,0,0.16)'}}>
        <div style={{width: 22, height: 22, margin: '0 auto 10px', borderRadius: 11, border: `4px solid ${ink}`}} />
        {children}
      </div>
    </div>
  );
};

/** Confetti / sparks falling from the top (a record, a reveal). Inside an <svg> the size of the area. */
export const Confetti: React.FC<{f: number; start: number; n?: number; w: number; h: number; colors?: string[]}> = ({f, start, n = 44, w, h, colors = [TONE.signal, TONE.marker, TONE.cobalt]}) => (
  <>{Array.from({length: n}, (_, i) => {
    const t = f - start - i * 0.9;
    if (t < 0) return null;
    const x = hash(i) * w + Math.sin(t * 0.12 + i) * 30, y = -40 + t * (10 + hash(i + 9) * 10);
    if (y > h) return null;
    const a = t * 0.15 + i;
    return <line key={i} x1={x} y1={y} x2={x + Math.cos(a) * 30} y2={y + Math.sin(a) * 30} stroke={colors[i % colors.length]} strokeWidth={10} strokeLinecap="round" />;
  })}</>
);

/** A card (an option, a case, a model): springs in on `at`, can be greyed out (a stamp usually lands on it). */
export const Card: React.FC<{x: number; y: number; w: number; h: number; f: number; at: number; rot?: number; grey?: number; bg?: string; ink?: string; children?: React.ReactNode}> = ({
  x, y, w, h, f, at, rot = 0, grey = 0, bg = TONE.cream, ink = TONE.ink, children,
}) => {
  const p = pop(f, at, 10);
  if (!shown(p)) return null;
  return <div style={{position: 'absolute', left: x, top: y, width: w, height: h, transform: `translateY(${(1 - Math.max(0, p)) * 60}px) rotate(${rot}deg) scale(${0.85 + 0.15 * Math.max(0, p)})`,
    opacity: clamp(p * 2), background: bg, border: `5px solid ${ink}`, borderRadius: 22, boxShadow: '0 14px 0 rgba(0,0,0,0.14)', boxSizing: 'border-box',
    filter: grey > 0 ? `grayscale(${grey}) brightness(${1 - 0.12 * grey})` : undefined, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', overflow: 'hidden'}}>{children}</div>;
};

/** Lined note paper (信纸 / a log / an instruction) with handwriting-like strokes written line by line from `start`. */
export const Note: React.FC<{x: number; y: number; w: number; h: number; f: number; at: number; start?: number; lines?: number; perLine?: number; rot?: number; paper?: string; ink?: string; children?: React.ReactNode}> = ({
  x, y, w, h, f, at, start, lines = 0, perLine = 8, rot = 0, paper = '#FBF8F1', ink = '#2A3550', children,
}) => {
  const p = pop(f, at, 12);
  if (!shown(p)) return null;
  const s0 = start ?? at + 10;
  return <div style={{position: 'absolute', left: x, top: y, width: w, height: h, transform: `rotate(${rot}deg) translateY(${(1 - Math.max(0, p)) * 80}px)`, opacity: clamp(p * 2),
    background: paper, borderRadius: 10, boxShadow: '0 24px 44px rgba(0,0,0,0.22)', overflow: 'hidden',
    backgroundImage: 'repeating-linear-gradient(transparent 0 62px, rgba(43,76,255,0.16) 62px 65px)', backgroundPosition: '0 40px'}}>
    {lines > 0 && <svg width={w} height={h} style={{position: 'absolute', inset: 0}}>
      {Array.from({length: lines}, (_, i) => <path key={i} d={scribble(i, w - 120)} transform={`translate(60 ${78 + i * 65})`} fill="none" stroke={ink} strokeWidth={4} strokeLinecap="round"
        pathLength={1} strokeDasharray={1} strokeDashoffset={1 - clamp((f - s0 - i * perLine) / perLine)} />)}
    </svg>}
    {children}
  </div>;
};
/** One line of fake handwriting (for Note); deterministic per index. */
export const scribble = (i: number, w: number) => {
  const n = 6 + Math.floor(hash(i) * 4), len = w * (0.62 + hash(i * 2.3) * 0.38);
  let d = 'M0 0';
  for (let k = 1; k <= n; k++) d += ` q${(len / n) * 0.5} ${(hash(i * 9 + k) - 0.5) * 30} ${len / n} ${(hash(i * 5 + k) - 0.5) * 8}`;
  return d;
};

/**
 * A quote typed in character by character from `start` at `cps` characters per second, then a marker sweeps over
 * `mark` (the key phrase) on `markAt`. For a real quote, a prompt, a policy line.
 */
export const Typed: React.FC<{f: number; start: number; text: string; cps?: number; mark?: string; markAt?: number; markColor?: string; size?: number; color?: string; family?: string; weight?: number; caret?: boolean}> = ({
  f, start, text, cps = 14, mark, markAt, markColor = TONE.marker, size = 64, color = TONE.ink, family = font, weight = 900, caret = true,
}) => {
  const n = Math.max(0, Math.floor(((f - start) / 30) * cps));
  const chars = [...text], mi = mark ? text.indexOf(mark) : -1, mk = markAt === undefined ? 0 : ramp(f, markAt, markAt + 10);
  return <span style={{fontFamily: family, fontWeight: weight, fontSize: size, color, lineHeight: 1.35}}>
    {chars.map((ch, i) => {
      const inMark = mi >= 0 && i >= mi && i < mi + [...(mark ?? '')].length;
      const local = inMark ? clamp(mk * [...(mark ?? '')].length - (i - mi)) : 0;
      return <span key={i} style={{opacity: i < n ? 1 : 0, backgroundImage: inMark ? `linear-gradient(180deg, transparent 58%, ${markColor} 58%, ${markColor} 94%, transparent 94%)` : undefined,
        backgroundRepeat: 'no-repeat', backgroundSize: `${local * 100}% 100%`}}>{ch}</span>;
    })}
    {caret && n < chars.length && f >= start && Math.floor(f / 8) % 2 === 0 && <span style={{display: 'inline-block', width: size * 0.08, height: size * 0.9, background: color, verticalAlign: 'middle', marginLeft: 4}} />}
  </span>;
};

/** A handwritten margin note with a leader line pointing at (tx, ty): the account's annotation (账号风格.md). */
export const Annot: React.FC<{x: number; y: number; tx: number; ty: number; f: number; at: number; size?: number; color?: string; children: React.ReactNode}> = ({x, y, tx, ty, f, at, size = 46, color = TONE.signal, children}) => {
  const p = ramp(f, at, at + 12), w = ramp(f, at + 6, at + 18);
  if (p <= 0) return null;
  return <>
    <svg width={1} height={1} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}><HandLine x1={x} y1={y} x2={tx} y2={ty} p={p} color={color} sw={5} head bend={0.18} /></svg>
    <div style={{position: 'absolute', left: x, top: y, transform: 'translate(-50%, -110%) rotate(-3deg)', fontFamily: hand, fontWeight: 500, fontSize: size, color, whiteSpace: 'nowrap',
      clipPath: `inset(-20% ${(1 - w) * 100}% -20% 0)`}}>{children}</div>
  </>;
};

/** A labelled progress bar that fills from `a` to `b` (三十多年 / 84.1 % → 23.6 %). k overrides the fill. */
export const Meter: React.FC<{x: number; y: number; w: number; f: number; a: number; b: number; k?: number; from?: number; to?: number; color?: string; track?: string; label?: React.ReactNode; right?: React.ReactNode; h?: number; ink?: string}> = ({
  x, y, w, f, a, b, k, from = 0, to = 1, color = TONE.signal, track = 'rgba(23,23,26,0.1)', label, right, h = 30, ink = TONE.ink,
}) => {
  const v = k ?? from + (to - from) * ramp(f, a, b);
  return <div style={{position: 'absolute', left: x, top: y, width: w}}>
    {(label || right) && <div style={{display: 'flex', justifyContent: 'space-between', fontFamily: font, fontWeight: 800, fontSize: 34, color: ink, marginBottom: 12}}><span>{label}</span><span style={{fontFamily: mono}}>{right}</span></div>}
    <div style={{height: h, borderRadius: h / 2, background: track, overflow: 'hidden'}}><div style={{width: `${clamp(v) * 100}%`, height: '100%', background: color, borderRadius: h / 2}} /></div>
  </div>;
};

/**
 * The ground of a scene, lit (a falloff and a fine grain in the ground's own hue, so it never reads as a flat slide fill).
 * Two grounds and `k` 0 → 1 between them: 底色就是情绪 (Xian) — flip the ground on the turn (huashu colour §7), e.g. the
 * paper's "safe" blue world to its "hijacked" orange world. `light` is the falloff colour (default white).
 */
export const Ground: React.FC<{a?: string; b?: string; k?: number; w?: number; h?: number; light?: string; t?: number}> = ({a = TONE.paper, b = TONE.night, k = 0, w = 1080, h = 1920, light = 'rgba(255,255,255,0.55)', t = 0}) => (
  <div style={{position: 'absolute', left: 0, top: 0, width: w, height: h, overflow: 'hidden', background: a}}>
    {k > 0.001 && <div style={{position: 'absolute', inset: 0, background: b, opacity: clamp(k)}} />}
    <div style={{position: 'absolute', inset: 0, background: `radial-gradient(ellipse 85% 55% at ${50 + 4 * Math.sin(t / 5)}% 36%, ${light}, transparent 72%)`}} />
    <div style={{position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 120% 90% at 50% 45%, transparent 60%, rgba(0,0,0,0.10) 100%)'}} />
    <div style={{position: 'absolute', inset: 0, opacity: 0.5, backgroundImage: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.025) 0 1px, transparent 1px 3px), repeating-linear-gradient(90deg, rgba(0,0,0,0.02) 0 1px, transparent 1px 4px)'}} />
  </div>
);
