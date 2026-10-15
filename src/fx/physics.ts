// Physics for motion with weight: closed-form springs, throws, drops with bounces, squash/stretch from
// velocity, impulses, staggered layers and a lagging camera. Everything is a pure function of t (seconds),
// so any frame renders on its own. Rules behind the numbers: docs/video-craft/导演层.md §3–§5.
// Closed-form springs summed per target change follow twoclipping's open prompt template (X @twoclipping).

import {clamp} from './motion';

export type SpringOpts = {f?: number; z?: number};

/**
 * Step response of a damped spring released at t0: 0 → 1 with a small overshoot.
 * f = natural frequency in Hz (2.2 ≈ settles in ~0.45 s), z = damping ratio (0.62 = a touch of overshoot,
 * 1 = critically damped, no overshoot).
 */
export const springStep = (t: number, t0: number, o: SpringOpts = {}) => {
  if (t <= t0) return 0;
  const tau = t - t0, w = 2 * Math.PI * (o.f ?? 2.2), z = o.z ?? 0.62;
  if (z >= 1) return 1 - Math.exp(-w * tau) * (1 + w * tau);
  const wd = w * Math.sqrt(1 - z * z);
  return 1 - Math.exp(-z * w * tau) * (Math.cos(wd * tau) + (z / Math.sqrt(1 - z * z)) * Math.sin(wd * tau));
};

export type SpringKey = {at: number; to: number} & SpringOpts;

/**
 * A value that changes target several times: one spring per change, summed. Still a pure function of t,
 * and each new target starts from wherever the previous springs were (momentum carries over).
 */
export const springTrack = (t: number, from: number, keys: SpringKey[], o: SpringOpts = {}) => {
  let v = from, prev = from;
  for (const k of keys) {
    v += (k.to - prev) * springStep(t, k.at, {f: k.f ?? o.f, z: k.z ?? o.z});
    prev = k.to;
  }
  return v;
};

/** Numeric velocity (units per second) of any function of t. */
export const velocity = (fn: (t: number) => number, t: number, h = 1 / 120) => (fn(t + h) - fn(t - h)) / (2 * h);

/**
 * Two edges of one shape on different springs: the leading edge is stiffer and arrives first, the trailing
 * edge lags, so the shape stretches while it travels and snaps back when both settle (tab indicators, knobs,
 * progress bars, a card sliding between slots).
 */
export const twoEdge = (t: number, from: number, keys: {at: number; to: number}[], o: {lead?: SpringOpts; trail?: SpringOpts} = {}) => ({
  lead: springTrack(t, from, keys, {f: 3, z: 0.75, ...o.lead}),
  trail: springTrack(t, from, keys, {f: 1.8, z: 0.8, ...o.trail}),
});

export type Toss = {x: number; y: number; vx: number; vy: number; u: number; flying: boolean; landed: boolean};

/**
 * Throw from `from` to `to` along a gravity parabola that peaks `lift` px above the higher end. Leaves at
 * `at`, lands (contact) at `at + dur`. x moves at constant speed, y accelerates — real projectile timing.
 */
export const toss = (t: number, o: {at: number; dur: number; from: [number, number]; to: [number, number]; lift?: number}): Toss => {
  const {at, dur, from, to} = o;
  const lift = o.lift ?? 160;
  const u = clamp((t - at) / dur);
  // y(u) = (1-u)·y0 + u·y1 − 4·lift·u(1−u): apex lift above the chord midpoint.
  const y = (1 - u) * from[1] + u * to[1] - 4 * lift * u * (1 - u);
  const x = from[0] + (to[0] - from[0]) * u;
  const flying = t > at && t < at + dur;
  const vx = flying ? (to[0] - from[0]) / dur : 0;
  const vy = flying ? (to[1] - from[1] - 4 * lift * (1 - 2 * u)) / dur : 0;
  return {x, y, vx, vy, u, flying, landed: t >= at + dur};
};

export type Drop = {y: number; vy: number; contacts: number[]; settled: boolean};

/**
 * Drop from `from` (y, px) onto the ground at `ground` under gravity `g` px/s², bouncing with restitution
 * `e` up to `bounces` times. Returns the position, velocity and every contact time (for SFX and squash).
 */
export const drop = (t: number, o: {at: number; from: number; ground: number; g?: number; e?: number; bounces?: number}): Drop => {
  const g = o.g ?? 4200, e = o.e ?? 0.42, n = o.bounces ?? 2;
  const h = Math.max(1, o.ground - o.from);
  const t0 = Math.sqrt((2 * h) / g);
  const contacts = [o.at + t0];
  let v = g * t0;
  for (let k = 0; k < n; k += 1) {
    v *= e;
    contacts.push(contacts[contacts.length - 1] + (2 * v) / g);
  }
  if (t <= o.at) return {y: o.from, vy: 0, contacts, settled: false};
  if (t < contacts[0]) {
    const s = t - o.at;
    return {y: o.from + 0.5 * g * s * s, vy: g * s, contacts, settled: false};
  }
  let vk = g * t0;
  for (let k = 0; k < n; k += 1) {
    vk *= e;
    if (t < contacts[k + 1]) {
      const s = t - contacts[k];
      return {y: o.ground - (vk * s - 0.5 * g * s * s), vy: -vk + g * s, contacts, settled: false};
    }
  }
  return {y: o.ground, vy: 0, contacts, settled: true};
};

/**
 * Squash & stretch from velocity, volume-preserving: stretched along the direction of travel. Returns a CSS
 * transform fragment to put on the moving element (around its centre).
 */
export const squash = (vx: number, vy: number, o: {k?: number; max?: number} = {}) => {
  const speed = Math.hypot(vx, vy);
  if (speed < 1) return {s: 1, deg: 0, css: ''};
  const s = 1 + Math.min(o.max ?? 0.22, speed * (o.k ?? 0.00012));
  const deg = (Math.atan2(vy, vx) * 180) / Math.PI;
  return {s, deg, css: `rotate(${deg}deg) scale(${s}, ${1 / s}) rotate(${-deg}deg)`};
};

/**
 * Impulse response after a hit at `at`: 0 → peak (≈ amp) → small rebound → 0. Use it for the squash on
 * contact, a receiver dipping under a load, a shadow widening, a ripple ring.
 */
export const impulse = (t: number, at: number, o: {f?: number; z?: number; amp?: number} = {}) => {
  if (t <= at) return 0;
  const tau = t - at, w = 2 * Math.PI * (o.f ?? 3), z = o.z ?? 0.35;
  const wd = w * Math.sqrt(1 - z * z);
  // Normalise so the first peak equals amp.
  const tp = Math.atan(Math.sqrt(1 - z * z) / z) / wd;
  const peak = Math.exp(-z * w * tp) * Math.sin(wd * tp);
  return ((o.amp ?? 1) * Math.exp(-z * w * tau) * Math.sin(wd * tau)) / peak;
};

/** Phase offsets in frames (30 fps) for the layers that answer one main event (导演层 §3). */
export const PHASE = {subject: 0, secondary: 4, camera: 5, shadow: 6, label: 8} as const;
/** Time as seen by a layer that lags the main event. */
export const lagged = (t: number, layer: keyof typeof PHASE, fps = 30) => t - PHASE[layer] / fps;

/** The i-th element of a row receives an impulse `delay` s later than the one before, weaker each time. */
export const ripple = (t: number, at: number, i: number, o: {delay?: number; decay?: number; f?: number; z?: number; amp?: number} = {}) =>
  impulse(t, at + i * (o.delay ?? 0.07), {f: o.f, z: o.z, amp: (o.amp ?? 1) * Math.pow(o.decay ?? 0.7, i)});

/**
 * Camera that follows the subject: critically damped (no overshoot) and late by PHASE.camera frames.
 * keys are the subject's target positions; returns the camera value.
 */
export const follow = (t: number, from: number, keys: {at: number; to: number}[], o: {f?: number; lagFrames?: number; fps?: number} = {}) =>
  springTrack(t, from, keys.map((k) => ({...k, at: k.at + (o.lagFrames ?? PHASE.camera) / (o.fps ?? 30)})), {f: o.f ?? 1.1, z: 1});
