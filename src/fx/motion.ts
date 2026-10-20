// Timing and motion helpers shared by every composition. Everything is a pure function of time t
// (seconds) so frames render identically in any order. Ported and adapted from dashi-animationstyle
// pipeline/动效部件.js (MIT, © 2026 Dashi AI Lab); rules behind the numbers: docs/video-craft/.

export const clamp = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v));
/** Progress 0..1 of an animation that starts at t0 and lasts d seconds. */
export const prog = (t: number, t0: number, d: number) => clamp((t - t0) / d);

export const ease = {
  linear: (p: number) => p,
  outCubic: (p: number) => 1 - Math.pow(1 - p, 3),
  inCubic: (p: number) => p * p * p,
  inOutCubic: (p: number) => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2),
  /** Overshoot then settle; keep s <= 2 or it turns to jelly. */
  outBack: (p: number, s = 1.5) => 1 + (s + 1) * Math.pow(p - 1, 3) + s * Math.pow(p - 1, 2),
};

/** Deterministic 0..1 noise for an integer-ish seed. */
export const hash = (n: number) => {
  const v = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return v - Math.floor(v);
};

/** Anticipation: pull back `back` (8%) during the first `a` (20%) of the move, then ease out past it. */
export const anticipate = (p: number, a = 0.2, back = 0.08) =>
  p <= 0 ? 0 : p < a ? -back * Math.sin(Math.PI * p / a) : ease.outCubic((p - a) / (1 - a));

/** Entrance 0..1: starts `lead` (0.06 s) before the keyword, lasts d (0.35 s), slight overshoot. */
export const enter = (t: number, at: number, d = 0.35, s = 1.3, lead = 0.06) => ease.outBack(prog(t, at - lead, d), s);

/** Breathing / sway secondary action: 3 px bob, 1° tilt, 1% scale. Give each object its own phase. */
export const sway = (t: number, ph = 0, o: {dy?: number; deg?: number; breath?: number} = {}) => ({
  dy: (o.dy ?? 3) * Math.sin(2.3 * t + ph),
  deg: (o.deg ?? 1) * Math.sin(1.7 * t + ph),
  s: 1 + (o.breath ?? 0.01) * Math.sin(2.3 * t + ph * 1.3),
});

/** Blink 0/1 (cursor, REC dot), or a smooth 0..1 pulse with smooth: true. */
export const blink = (t: number, o: {period?: number; duty?: number; ph?: number; smooth?: boolean} = {}) => {
  const p = o.period ?? 1;
  const u = ((((t + (o.ph ?? 0)) % p) + p) % p) / p;
  return o.smooth ? 0.5 + 0.5 * Math.cos(u * Math.PI * 2) : u < (o.duty ?? 0.5) ? 1 : 0;
};

/** Stop-motion jitter for paper/clay looks: t quantised to `fps`, per-frame seeded offset. */
export const jitter = (t: number, i = 0, o: {fps?: number; amp?: number; deg?: number} = {}) => {
  const k = Math.floor(t * (o.fps ?? 15) + 1e-6);
  const a = o.amp ?? 1.5;
  return {
    t: k / (o.fps ?? 15),
    dx: (hash(k * 7.1 + i * 13.3) - 0.5) * 2 * a,
    dy: (hash(k * 3.7 + i * 5.9) - 0.5) * 2 * a,
    deg: (hash(k * 1.3 + i * 9.1) - 0.5) * 2 * (o.deg ?? 0.6),
  };
};

/** Slow push while a shot is held: +1.2%/s, capped after 5 s. */
export const slowPush = (t: number, t0: number, o: {rate?: number; max?: number} = {}) => 1 + (o.rate ?? 0.012) * clamp(t - t0, 0, o.max ?? 5);

/**
 * Beat zoom: alternate a push-in and a pull-out on every caption beat (with a little drift), so each
 * line adds a visible change without drawing anything new. Returns {s, dx, dy}.
 */
export const beatZoom = (t: number, beats: number[], o: {amp?: number; drift?: number; d?: number} = {}) => {
  const amp = o.amp ?? 0.05, drift = o.drift ?? 24, d = o.d ?? 0.7;
  let level = 0, prev = 0, at = -1, idx = -1;
  for (let i = 0; i < beats.length; i += 1) {
    if (t < beats[i]) break;
    prev = level;
    level = i % 2 === 0 ? 1 : 0;
    at = beats[i];
    idx = i;
  }
  if (idx < 0) return {s: 1, dx: 0, dy: 0};
  const k = prev + (level - prev) * ease.inOutCubic(prog(t, at, d));
  const side = idx % 4 < 2 ? 1 : -1;
  return {s: 1 + amp * k, dx: side * drift * k, dy: -drift * 0.5 * k};
};

/**
 * Beat tour: like beatZoom, but every caption beat moves to the next of four distinct framings and
 * never returns to rest, so frames a few seconds apart always differ. Use it for sparse layouts (UI
 * mockups on a dark stage) where one alternating push isn't enough. Drift leans left (`bias`) to keep
 * content clear of Douyin's right-hand button column.
 */
export const beatTour = (t: number, beats: number[], o: {amp?: number; drift?: number; d?: number} = {}) => {
  const a = o.amp ?? 0.06, m = o.drift ?? 24, d = o.d ?? 0.7;
  const poses = [
    {s: 1 + a, dx: -m, dy: -m / 2},
    {s: 1 + a * 0.35, dx: m / 2, dy: 0},
    {s: 1 + a * 0.8, dx: -m * 0.4, dy: m / 2},
    {s: 1 + a * 0.5, dx: -m, dy: -m / 4},
  ];
  const rest = {s: 1, dx: 0, dy: 0};
  let idx = -1;
  while (idx + 1 < beats.length && t >= beats[idx + 1]) idx += 1;
  if (idx < 0) return rest;
  const from = idx === 0 ? rest : poses[(idx - 1) % 4], to = poses[idx % 4];
  const k = ease.inOutCubic(prog(t, beats[idx], d));
  return {s: from.s + (to.s - from.s) * k, dx: from.dx + (to.dx - from.dx) * k, dy: from.dy + (to.dy - from.dy) * k};
};

/** Camera shake after each hit time: 0.2 s, 12 px, quadratic decay. Sum of all active hits. */
export const shake = (t: number, hits: number[], o: {d?: number; amp?: number; fps?: number} = {}) => {
  const d = o.d ?? 0.2, f = Math.floor(t * (o.fps ?? 30));
  let dx = 0, dy = 0;
  for (const h of hits) {
    if (t < h || t > h + d) continue;
    const a = (o.amp ?? 12) * Math.pow(1 - (t - h) / d, 2);
    dx += (hash(f) - 0.5) * 2 * a;
    dy += (hash(f + 0.7) - 0.5) * 2 * a;
  }
  return {dx, dy};
};

/** Typewriter: number of characters visible at t (cps chars per second from t0). */
export const typed = (text: string, t: number, t0: number, cps = 14) => [...text].slice(0, Math.max(0, Math.floor((t - t0) * cps))).join('');
