import React from 'react';
import {clamp, ease} from '../fx';
import {hand, plex, serif} from './fonts';

// Whiteboard kit (lemo/whiteboard, docs/video-craft/prompt-library/vendor/lemomo-ai__lemo-opuscar/3961ddb/styles/
// whiteboard/STYLE.md), extracted from llm-same-prompt-diff-output so every whiteboard film shares one engine:
// strokes written by a hand (wobble, slow-fast-slow speed, pooled start, overshooting loops), handwriting revealed glyph by
// glyph in writing order, floating dry-erase markers with no hand (they park off-frame and fly to the next stroke), magnets,
// an eraser that rewinds a stroke, a 2D camera interpolated in 1/z, the glossy board with ghosts and a drifting sheen.
// A film makes its own item list with `createBoard(colours)` and schedules every stroke in absolute frames from its voice
// timeline (`timeline(TL)`), so writing lands on the word. Everything is a pure function of the frame.

export type P = [number, number];
export const rnd = (n: number) => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };

/* ---------- timing ---------- */

type TS = {id: string; startFrame: number; durationFrames: number; cues: Record<string, number>};
/** Absolute frames from a voice timeline: at('scene', 'cue', plus). */
export const timeline = (TL: {scenes: unknown; totalFrames: number}) => {
  const SC = Object.fromEntries((TL.scenes as TS[]).map((s) => [s.id, s]));
  const at = (id: string, cue?: string, plus = 0) => SC[id].startFrame + (cue ? Math.round((SC[id].cues[cue] / 1000) * 30) : 0) + plus;
  return {SC, at, END: TL.totalFrames};
};

/* ---------- a hand ---------- */

/** Resample a polyline every ~6 px with a low-frequency wobble along the normal (the hand) plus a fine tremor. */
export const wobble = (pts: P[], seed: number, amp = 2.2): P[] => {
  const out: P[] = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const [x0, y0] = pts[i], [x1, y1] = pts[i + 1];
    const L = Math.hypot(x1 - x0, y1 - y0), n = Math.max(1, Math.ceil(L / 6));
    const nx = -(y1 - y0) / (L || 1), ny = (x1 - x0) / (L || 1);
    for (let k = 0; k < n; k++) {
      const u = k / n, s = (i + u) * 0.9;
      const w = Math.sin(s * 1.7 + seed) * amp + Math.sin(s * 7.3 + seed * 3) * amp * 0.25;
      out.push([x0 + (x1 - x0) * u + nx * w, y0 + (y1 - y0) * u + ny * w]);
    }
  }
  out.push(pts[pts.length - 1]);
  return out;
};
export const lenOf = (pts: P[]) => pts.reduce((a, p, i) => (i ? a + Math.hypot(p[0] - pts[i - 1][0], p[1] - pts[i - 1][1]) : 0), 0);
export const pointAt = (pts: P[], u: number): P => {
  const L = lenOf(pts) * clamp(u);
  let acc = 0;
  for (let i = 1; i < pts.length; i++) {
    const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
    if (acc + d >= L) { const t = (L - acc) / (d || 1); return [pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * t, pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * t]; }
    acc += d;
  }
  return pts[pts.length - 1];
};
export const dOf = (pts: P[]) => pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' ');
/** The hand's speed curve (STYLE.md §5): slow-fast-slow. */
export const handU = (u: number) => clamp(u - (Math.sin(2 * Math.PI * u) / (2 * Math.PI)) * 0.8);
/** A circle that starts at an angle and overshoots its closure. */
export const loop = (cx: number, cy: number, rx: number, ry: number, seed: number): P[] => {
  const a0 = -2.2 + rnd(seed) * 0.8, n = 40;
  return Array.from({length: n + 1}, (_, i) => {
    const a = a0 + (i / n) * (Math.PI * 2 + 0.45);
    const k = 1 + (i / n) * 0.06;
    return [cx + Math.cos(a) * rx * k, cy + Math.sin(a) * ry * k] as P;
  });
};
/** A rectangle as four strokes with small corner overshoot. */
export const rectPts = (x: number, y: number, w: number, h: number): P[][] => [[[x - 6, y], [x + w + 8, y + 2]], [[x + w, y - 6], [x + w - 2, y + h + 8]], [[x + w + 4, y + h], [x - 6, y + h - 2]], [[x, y + h + 6], [x + 2, y - 6]]];
/** A hand-drawn tick (✓) whose short arm starts at (x, y). */
export const tickPts = (x: number, y: number, s: number): P[] => [[x, y], [x + s * 0.35, y + s * 0.38], [x + s, y - s * 0.55]];
/** An arrow: shaft plus a two-stroke head at b. */
export const arrowPts = (a: P, b: P, head = 26): P[][] => {
  const ang = Math.atan2(b[1] - a[1], b[0] - a[0]);
  const h1: P = [b[0] - Math.cos(ang - 0.5) * head, b[1] - Math.sin(ang - 0.5) * head], h2: P = [b[0] - Math.cos(ang + 0.5) * head, b[1] - Math.sin(ang + 0.5) * head];
  return [[a, b], [h1, b, h2]];
};

/* ---------- the board's items ---------- */

export type Stroke = {kind: 'stroke'; pen: string; pts: P[]; w: number; t0: number; t1: number; erase?: [number, number]; ghostAfter?: number; seed: number};
export type Text = {kind: 'text'; pen: string; text: string; x: number; y: number; size: number; t0: number; t1: number; face?: 'hand' | 'serif'; ghostAt?: number; anchor?: 'start' | 'middle'};
export type Item = Stroke | Text;
const units = (s: string) => [...s].reduce((w, ch) => w + ((ch.codePointAt(0) ?? 0) < 128 ? (ch === ' ' ? 0.3 : 0.55) : 1), 0);
export const widthOf = (t: Text) => units(t.text) * t.size * (t.face === 'serif' ? 1.02 : 1);
export const leftOf = (t: Text) => (t.anchor === 'middle' ? t.x - widthOf(t) / 2 : t.x);

export const createBoard = (colors: Record<string, string>, opts: {blend?: React.CSSProperties['mixBlendMode']} = {}) => {
  const items: Item[] = [];
  let seed = 1;
  const stroke = (pen: string, raw: P[], w: number, t0: number, t1: number, extra: Partial<Stroke> = {}) => {
    const s: Stroke = {kind: 'stroke', pen, pts: wobble(raw, seed++), w, t0, t1, seed, ...extra};
    items.push(s);
    return s;
  };
  const write = (pen: string, text: string, x: number, y: number, size: number, t0: number, t1: number, extra: Partial<Text> = {}) => {
    const t: Text = {kind: 'text', pen, text, x, y, size, t0, t1, ...extra};
    items.push(t);
    return t;
  };
  /** Several strokes (a box, an arrow) shared out over one window. */
  const strokes = (pen: string, list: P[][], w: number, t0: number, t1: number, extra: Partial<Stroke> = {}) =>
    list.map((pts, i) => stroke(pen, pts, w, t0 + ((t1 - t0) * i) / list.length, t0 + ((t1 - t0) * (i + 1)) / list.length, extra));
  return {items, stroke, write, strokes, colors, blend: opts.blend ?? 'multiply'};
};
export type BoardKit = ReturnType<typeof createBoard>;

/* ---------- drawing ---------- */

const ghostOp = 0.13;
export const StrokeView: React.FC<{s: Stroke; F: number; color: string; blend?: React.CSSProperties['mixBlendMode']}> = ({s, F, color, blend = 'multiply'}) => {
  if (F < s.t0) return null;
  const L = lenOf(s.pts);
  let u = handU(clamp((F - s.t0) / Math.max(1, s.t1 - s.t0)));
  let ghost = false;
  if (s.erase && F >= s.erase[0]) { u = 1 - clamp((F - s.erase[0]) / (s.erase[1] - s.erase[0])); ghost = true; }
  const gone = s.ghostAfter !== undefined && F >= s.ghostAfter;
  const op = gone ? ghostOp + (1 - ghostOp) * (1 - clamp((F - s.ghostAfter!) / 4)) : 0.94;
  return <g style={{mixBlendMode: blend}}>
    {ghost && <path d={dOf(s.pts)} fill="none" stroke={color} strokeWidth={s.w} strokeLinecap="round" strokeLinejoin="round" opacity={ghostOp} />}
    <path d={dOf(s.pts)} fill="none" stroke={color} strokeWidth={s.w} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={`${L * u} ${L + 10}`} opacity={op} />
    {u > 0.02 && !gone && <circle cx={s.pts[0][0] + 0.5} cy={s.pts[0][1]} r={s.w * 0.42} fill={color} opacity={0.5} />}
  </g>;
};
export const TextView: React.FC<{t: Text; F: number; color: string; blend?: React.CSSProperties['mixBlendMode']}> = ({t, F, color, blend = 'multiply'}) => {
  if (F < t.t0) return null;
  const chars = [...t.text];
  const u = handU(clamp((F - t.t0) / Math.max(1, t.t1 - t.t0))) * chars.length;
  const g = t.ghostAt !== undefined && F >= t.ghostAt ? ghostOp + (1 - ghostOp) * (1 - clamp((F - t.ghostAt) / 6)) : 0.94;
  return <div style={{position: 'absolute', left: t.x, top: t.y - t.size * 0.92, transform: t.anchor === 'middle' ? 'translateX(-50%)' : undefined, whiteSpace: 'pre', mixBlendMode: blend,
    fontFamily: t.face === 'serif' ? serif : hand, fontWeight: t.face === 'serif' ? 700 : 500, fontSize: t.size, lineHeight: 1.2, color, opacity: g}}>
    {chars.map((ch, i) => {
      const p = clamp(u - i);
      const cjk = (ch.codePointAt(0) ?? 0) >= 0x2e80;
      return <span key={i} style={{display: 'inline-block', clipPath: `inset(-20% ${(1 - p) * 100}% -20% 0)`, visibility: p <= 0 ? 'hidden' : 'visible',
        transform: cjk ? `rotate(${(rnd(i + t.x) - 0.5) * 3}deg) translateY(${(rnd(i * 3.3 + t.y) - 0.5) * t.size * 0.05}px)` : undefined}}>{ch}</span>;
    })}
  </div>;
};
/** All strokes and texts of a board at frame F. */
export const Ink: React.FC<{kit: BoardKit; F: number; w: number; h: number}> = ({kit, F, w, h}) => {
  const vis = kit.items.filter((it) => it.t0 <= F);
  return <>
    <svg width={w} height={h} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
      {vis.filter((it): it is Stroke => it.kind === 'stroke').map((s, i) => <StrokeView key={i} s={s} F={F} color={kit.colors[s.pen]} blend={kit.blend} />)}
    </svg>
    {vis.filter((it): it is Text => it.kind === 'text').map((t, i) => <TextView key={i} t={t} F={F} color={kit.colors[t.pen]} blend={kit.blend} />)}
  </>;
};

/* ---------- pens ---------- */

const tipOf = (it: Item, F: number): P => {
  const u = clamp((F - it.t0) / Math.max(1, it.t1 - it.t0));
  if (it.kind === 'stroke') return pointAt(it.pts, handU(u));
  return [leftOf(it) + widthOf(it) * handU(u), it.y - it.size * 0.3];
};
const startOf = (it: Item): P => (it.kind === 'stroke' ? it.pts[0] : [leftOf(it), it.y - it.size * 0.3]);
const endOf = (it: Item): P => (it.kind === 'stroke' ? it.pts[it.pts.length - 1] : [leftOf(it) + widthOf(it), it.y - it.size * 0.3]);

export type Cam = {x: number; y: number; z: number};
/** A floating dry-erase marker (no hand): on the active stroke's nib, else flying to the next one or parked off-frame. */
export const PenView: React.FC<{kit: BoardKit; pen: string; slot: number; F: number; cam: Cam; look?: 'marker' | 'pencil'}> = ({kit, pen, slot, F, cam, look = 'marker'}) => {
  const mine = kit.items.filter((it) => it.pen === pen);
  const active = mine.find((it) => F >= it.t0 && F <= it.t1);
  const park: P = [cam.x + (560 + slot * 60) / cam.z, cam.y + (180 + slot * 90) / cam.z];
  let p: P, lift = 0;
  if (active) p = tipOf(active, F);
  else {
    const prev = [...mine].filter((it) => it.t1 < F).sort((a, b) => b.t1 - a.t1)[0];
    const next = mine.filter((it) => it.t0 > F).sort((a, b) => a.t0 - b.t0)[0];
    const from = prev ? endOf(prev) : park;
    if (next && next.t0 - F <= 8) {
      const gap = prev ? next.t0 - prev.t1 : 99;
      const src = gap <= 16 ? from : park;
      const t = ease.inOutCubic(1 - (next.t0 - F) / Math.min(8, Math.max(1, gap)));
      const to = startOf(next);
      p = [src[0] + (to[0] - src[0]) * t, src[1] + (to[1] - src[1]) * t];
      lift = Math.sin(t * Math.PI) * 0.8 + (1 - t) * 0.2;
    } else {
      const t = ease.inOutCubic(clamp((F - (prev?.t1 ?? -99)) / 12));
      p = [from[0] + (park[0] - from[0]) * t, from[1] + (park[1] - from[1]) * t];
      lift = Math.min(1, t * 1.5);
    }
  }
  const col = kit.colors[pen];
  const s = 1 + lift * 0.08;
  // lemo/dataviz's pencil: a hexagonal body, a sharpened wood cone, the lead in the pen's colour; only the tip end shows
  if (look === 'pencil') return <div style={{position: 'absolute', left: p[0], top: p[1], width: 0, height: 0}}>
    <div style={{position: 'absolute', left: 14 + lift * 36, top: 8 + lift * 44, width: 30, height: 360, borderRadius: 12, background: 'rgba(0,0,0,0.35)', filter: `blur(${4 + lift * 10}px)`, transformOrigin: '50% 0', transform: 'rotate(-34deg)'}} />
    <div style={{position: 'absolute', left: -11, top: -lift * 24, width: 22, height: 380, transformOrigin: '50% 0', transform: `rotate(-34deg) scale(${s})`}}>
      <div style={{position: 'absolute', left: 7, top: 0, width: 8, height: 14, background: col, clipPath: 'polygon(50% 0, 100% 100%, 0 100%)'}} />
      <div style={{position: 'absolute', left: 0, top: 12, width: 22, height: 40, background: '#D9B98C', clipPath: 'polygon(32% 0, 68% 0, 100% 100%, 0 100%)'}} />
      <div style={{position: 'absolute', left: 0, top: 50, width: 22, height: 330, background: `linear-gradient(90deg, ${col} 0 30%, #FFFFFF55 30% 34%, ${col} 34% 66%, #00000033 66% 70%, ${col} 70%)`, opacity: 0.92}} />
    </div>
  </div>;
  return <div style={{position: 'absolute', left: p[0], top: p[1], width: 0, height: 0}}>
    <div style={{position: 'absolute', left: 18 + lift * 40, top: 10 + lift * 50, width: 46, height: 290, borderRadius: 20, background: 'rgba(40,38,30,0.18)', filter: `blur(${4 + lift * 10}px)`,
      transformOrigin: '50% 0', transform: 'rotate(-28deg)'}} />
    <div style={{position: 'absolute', left: -14, top: -lift * 26, width: 28, height: 300, transformOrigin: '50% 0', transform: `rotate(-28deg) scale(${s})`}}>
      <div style={{position: 'absolute', left: 9, top: -6, width: 10, height: 18, borderRadius: '3px 3px 1px 1px', background: col}} />
      <div style={{position: 'absolute', left: 3, top: 10, width: 22, height: 26, background: '#D8D8D4', clipPath: 'polygon(30% 0, 70% 0, 100% 100%, 0 100%)'}} />
      <div style={{position: 'absolute', left: 0, top: 34, width: 28, height: 220, borderRadius: 6, background: 'linear-gradient(90deg, #DADAD6, #FFFFFF 40%, #E4E4E0)'}} />
      <div style={{position: 'absolute', left: 0, top: 120, width: 28, height: 26, background: col}} />
      <div style={{position: 'absolute', left: -1, top: 250, width: 30, height: 56, borderRadius: '6px 6px 12px 12px', background: col}} />
    </div>
  </div>;
};

/* ---------- camera, magnets, eraser, board ---------- */

export type CK = [number, number, number, number];
/** Keyed 2D camera [frame, x, y, z], eased, zoom interpolated in 1/z so pushes feel like dollies (STYLE.md §6). */
export const camAt = (F: number, keys: CK[]): Cam => {
  if (F <= keys[0][0]) return {x: keys[0][1], y: keys[0][2], z: keys[0][3]};
  for (let i = 0; i < keys.length - 1; i++) {
    const [a, ax, ay, az] = keys[i], [b, bx, by, bz] = keys[i + 1];
    if (F <= b) {
      const t = ease.inOutCubic(clamp((F - a) / Math.max(1, b - a)));
      const iz = 1 / az + (1 / bz - 1 / az) * t;
      return {x: ax + (bx - ax) * t, y: ay + (by - ay) * t, z: 1 / iz};
    }
  }
  const l = keys[keys.length - 1];
  return {x: l[1], y: l[2], z: l[3]};
};
export const Magnet: React.FC<{x: number; y: number; color: string; r?: number}> = ({x, y, color, r = 22}) => <div style={{position: 'absolute', left: x - r, top: y - r, width: r * 2, height: r * 2, borderRadius: r,
  background: `radial-gradient(circle at 35% 30%, #ffffff 0, ${color} 34%, ${color} 70%, rgba(0,0,0,0.35) 100%)`, boxShadow: '0 5px 8px rgba(40,38,30,0.35)'}} />;
/** A paper card held by a magnet that drops in at `at` (shadow shrinks as it lands) and can slide along `path`. */
export const MagCard: React.FC<{F: number; at: number; x: number; y: number; w: number; h: number; mag: string; children: React.ReactNode; rot?: number; slide?: {t: number; to: P; d?: number}[]; paper?: string}> = ({F, at, x, y, w, h, mag, children, rot, slide = [], paper = '#FFFEFA'}) => {
  if (F < at) return null;
  const drop = ease.outBack(clamp((F - at) / 7), 1.8);
  let px = x, py = y, lift = 0;
  for (const m of slide) {
    const t = ease.inOutCubic(clamp((F - m.t) / (m.d ?? 12)));
    lift = Math.max(lift, Math.sin(t * Math.PI));
    px += (m.to[0] - px) * t; py += (m.to[1] - py) * t;
  }
  const sc = 1.12 - 0.12 * drop + lift * 0.05;
  return <div style={{position: 'absolute', left: px - w / 2, top: py - h / 2, width: w, height: h, transform: `scale(${sc}) rotate(${rot ?? (rnd(x + y) - 0.5) * 2.4}deg)`, opacity: clamp((F - at) / 3)}}>
    <div style={{position: 'absolute', inset: 0, background: paper, borderRadius: 6, boxShadow: `0 ${4 + 14 * (1 - drop) + lift * 14}px ${10 + 20 * (1 - drop) + lift * 20}px rgba(40,38,30,${0.22 + 0.1 * lift})`}} />
    <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column'}}>{children}</div>
    <Magnet x={w / 2} y={6} color={mag} />
  </div>;
};
/** The felt eraser rubbing a stroke backwards (`s.erase` window); it enters and leaves from the lower right. */
export const EraserView: React.FC<{s: Stroke; F: number}> = ({s, F}) => {
  const [t0, t1] = s.erase!;
  if (F < t0 - 10 || F > t1 + 14) return null;
  const u = 1 - clamp((F - t0) / (t1 - t0));
  const tip = pointAt(s.pts, u);
  const off = F < t0 ? (t0 - F) / 10 : F > t1 ? (F - t1) / 14 : 0;
  const x = tip[0] + off * 500, y = tip[1] + off * 260 + Math.sin(F * 1.7) * 6;
  return <div style={{position: 'absolute', left: x - 90, top: y - 40, width: 180, height: 80, transform: `rotate(${-8 + Math.sin(F * 1.7) * 4}deg)`}}>
    <div style={{position: 'absolute', inset: 0, borderRadius: 10, background: 'linear-gradient(180deg, #3A3D44, #23262C)', boxShadow: '0 12px 20px rgba(40,38,30,0.3)'}} />
    <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: 22, borderRadius: '0 0 10px 10px', background: '#B9B5AA'}} />
  </div>;
};
/** A highlighter field laid down left → right under a region (multiply). */
export const Wash: React.FC<{x: number; y: number; w: number; h: number; color: string; F: number; t0: number; t1: number; r?: number}> = ({x, y, w, h, color, F, t0, t1, r = 26}) => {
  if (F < t0) return null;
  const u = handU(clamp((F - t0) / (t1 - t0)));
  return <div style={{position: 'absolute', left: x, top: y, width: w * u, height: h, background: color, mixBlendMode: 'multiply', borderRadius: r, opacity: 0.95}} />;
};
/** The board: warm white, ghosts of old lessons, the world transform (camera), then the sheen and vignette on top. */
export const BoardFrame: React.FC<{cam: Cam; w: number; h: number; children: React.ReactNode; ghosts?: number}> = ({cam, w, h, children, ghosts = 30}) => {
  const sheenX = ((-cam.x * 0.35 * cam.z) % 2400) + 600;
  return <div style={{position: 'absolute', inset: 0, overflow: 'hidden', background: '#ECEAE3'}}>
    <div style={{position: 'absolute', left: 0, top: 0, width: w, height: h, transformOrigin: '0 0', transform: `translate(540px, 960px) scale(${cam.z}) translate(${-cam.x}px, ${-cam.y}px)`}}>
      <div style={{position: 'absolute', left: -600, top: -600, width: w + 1200, height: h + 1200, background: 'radial-gradient(ellipse 70% 60% at 45% 40%, #FAF9F5 0%, #F4F2EC 60%, #ECEAE3 100%)'}} />
      <svg width={w} height={h} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
        {Array.from({length: ghosts}, (_, i) => {
          const x = rnd(i * 7.7) * w, y = rnd(i * 3.1 + 2) * h, kind = i % 3;
          const pts: P[] = kind === 0 ? loop(x, y, 60 + rnd(i) * 80, 40 + rnd(i + 1) * 50, i) : kind === 1 ? [[x, y], [x + 200 + rnd(i) * 200, y + (rnd(i + 2) - 0.5) * 120]] : [[x, y], [x + 60, y - 50], [x + 120, y + 10], [x + 180, y - 40]];
          return <path key={i} d={dOf(wobble(pts, i + 50))} fill="none" stroke={i % 4 === 0 ? '#9FB3C8' : '#A8A8A3'} strokeWidth={6} opacity={0.09} strokeLinecap="round" />;
        })}
      </svg>
      {children}
    </div>
    <div style={{position: 'absolute', left: sheenX - 600, top: -400, width: 520, height: 2800, background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.14), transparent)', transform: 'rotate(18deg)', pointerEvents: 'none'}} />
    <div style={{position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 90% 75% at 50% 45%, transparent 60%, rgba(60,55,40,0.12) 100%)'}} />
  </div>;
};
export const cardFace = {hand, serif, plex};
