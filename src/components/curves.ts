// Timing curves and per-element motion for the components in src/components (docs/style-guide.md).
// Every function takes frames (30 fps) and is a pure function of the frame, so any frame renders on its own.
// Numbers follow the motion notes of mg-styles-15 (MIT, © 2026 Vincentwei1021); the code is written fresh for
// this repo on top of src/fx.
import {clamp, hash, springStep} from '../fx';

export const FPS = 30;
const sec = (f: number) => f / FPS;

/**
 * CSS-style cubic-bezier(x1, y1, x2, y2) as a function of progress 0..1 (Newton steps, then bisection).
 * Use it to say exactly which curve a move uses, the way motion specs do.
 */
export const cubicBezier = (x1: number, y1: number, x2: number, y2: number) => {
  const cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx;
  const cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by;
  const x = (s: number) => ((ax * s + bx) * s + cx) * s;
  const y = (s: number) => ((ay * s + by) * s + cy) * s;
  const dx = (s: number) => (3 * ax * s + 2 * bx) * s + cx;
  return (p: number) => {
    if (p <= 0) return 0;
    if (p >= 1) return 1;
    let s = p;
    for (let i = 0; i < 6; i += 1) {
      const e = x(s) - p, d = dx(s);
      if (Math.abs(e) < 1e-5) return y(s);
      if (Math.abs(d) < 1e-6) break;
      s -= e / d;
    }
    let lo = 0, hi = 1;
    s = p;
    for (let i = 0; i < 20; i += 1) {
      if (x(s) < p) lo = s;
      else hi = s;
      s = (lo + hi) / 2;
    }
    return y(s);
  };
};

/** Named curves (style-guide §3). Pick by what the thing is, not by taste. */
export const curve = {
  /** UI and icons popping in: overshoot then settle. */
  overshoot: cubicBezier(0.34, 1.56, 0.64, 1),
  /** Things that are thrown or flung: fast start, long soft landing. */
  flung: cubicBezier(0.22, 1, 0.36, 1),
  /** Shape changes and camera flights: slow ends, fastest in the middle. */
  morph: cubicBezier(0.7, 0, 0.3, 1),
  /** Lines drawing on: slows into the ends. */
  draw: cubicBezier(0.65, 0, 0.35, 1),
  /** Lock-on brackets, snaps: almost all of the move in the first frames. */
  snap: (p: number) => (p >= 1 ? 1 : 1 - Math.pow(2, -10 * clamp(p))),
  /** Data (bars, counters): no overshoot — a bar must never show a value it doesn't have. */
  data: (p: number) => 1 - Math.pow(1 - clamp(p), 3),
};

/**
 * Pop scale 0 → 1.15 → 1: a damped spring that peaks on frame 5 and is within 1 % by frame 8.
 * Returns 0 before `at`.
 */
export const popScale = (f: number, at: number) => springStep(sec(f), sec(at), {f: 3.5, z: 0.52});

/** Pop-out: a 1-frame swell to 1.12, then shrink to 0 over ~5 frames. 1 before `at`, 0 after. */
export const popOut = (f: number, at: number) => {
  if (f < at) return 1;
  const k = (f - at) / 5;
  if (k >= 1) return 0;
  return k < 0.3 ? 1 + 0.12 * (k / 0.3) : 1.12 * (1 - Math.pow((k - 0.3) / 0.7, 3));
};

/**
 * Keep a held element alive: slow tilt + bob + breath, fading in 7–17 frames after it landed so it doesn't
 * fight the entrance. Give each element its own `phase`.
 */
export const holdWiggle = (f: number, landed: number, phase = 0, o: {deg?: number; bob?: number; breath?: number; hz?: number} = {}) => {
  const k = clamp((f - landed - 7) / 10), w = 2 * Math.PI * (o.hz ?? 1.1) * sec(f);
  return {
    deg: k * (o.deg ?? 1.2) * Math.sin(w + phase),
    dy: k * (o.bob ?? 3) * Math.sin(w + phase + 1.9),
    s: 1 + k * (o.breath ?? 0.012) * Math.sin(2 * w + phase * 1.7),
  };
};

/** Damped wobble after a contact frame (sticker slap, stamp): 1 at contact, decays in ~0.4 s. */
export const wobble = (f: number, contact: number, hz = 4.5, decay = 10) => {
  const dt = sec(f - contact);
  return dt < 0 ? 0 : Math.exp(-decay * dt) * Math.cos(2 * Math.PI * hz * dt);
};

/** Seeded 0..1 for (frame, index) pairs: scramble glyphs, burst jitter. */
export const noise = (a: number, b = 0) => hash(a * 12.9898 + b * 78.233);
