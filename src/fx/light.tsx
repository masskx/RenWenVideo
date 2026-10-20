// One key light for the whole film, matte materials, contact shadows and motion smear (导演层 §6, §8).
// No glow: emphasis comes from light and shade, size and space.
import React from 'react';
import {clamp} from './motion';

/** Key light direction (unit-ish vector, screen space): top-left for every video unless the brief says otherwise. */
export const KEY_LIGHT = {x: -0.6, y: -0.8};

const hex = (c: string) => {
  const h = c.replace('#', '');
  const n = parseInt(h.length === 3 ? h.split('').map((x) => x + x).join('') : h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};
/** Mix two hex colours, t = 0 → a, 1 → b. */
export const mix = (a: string, b: string, t: number) => {
  const x = hex(a), y = hex(b);
  return `rgb(${x.map((v, i) => Math.round(v + (y[i] - v) * t)).join(',')})`;
};

/**
 * Matte surface lit by the key light: a broad soft highlight towards the light, the base tone in the middle,
 * a darker side away from it. `gloss` 0–0.4 = how bright the lit side gets. Use as `background`.
 * `shift` (0–1) slides the highlight a little so a still object doesn't look frozen.
 */
export const matte = (base: string, o: {gloss?: number; shade?: number; shift?: number} = {}) => {
  const lx = 50 + KEY_LIGHT.x * 28 + (o.shift ?? 0) * 6, ly = 50 + KEY_LIGHT.y * 28;
  return `radial-gradient(120% 120% at ${lx}% ${ly}%, ${mix(base, '#ffffff', o.gloss ?? 0.22)} 0%, ${base} 48%, ${mix(base, '#000000', o.shade ?? 0.18)} 100%)`;
};

/**
 * Soft contact shadow on the ground under an object. `lift` = how far the object is above the ground (px):
 * the higher it is, the smaller and fainter the shadow. Offset slightly away from the key light.
 */
export const ContactShadow: React.FC<{x: number; y: number; w: number; lift?: number; opacity?: number; color?: string}> = ({x, y, w, lift = 0, opacity = 0.28, color = '#1c1a17'}) => {
  const k = clamp(1 - lift / 520, 0.25, 1);
  const width = w * (0.55 + 0.45 * k), height = Math.max(6, w * 0.09 * (0.6 + 0.4 * k));
  return <div style={{position: 'absolute', left: x - width / 2 - KEY_LIGHT.x * 10, top: y - height / 2, width, height, borderRadius: '50%',
    background: `radial-gradient(closest-side, ${color}, transparent)`, opacity: opacity * k, pointerEvents: 'none'}} />;
};

/**
 * Motion smear: while something moves fast, draw a few fading copies behind it along its velocity (px/s).
 * Cheap directional motion blur; disappears when the speed drops.
 */
export const Smear: React.FC<{vx: number; vy: number; n?: number; k?: number; min?: number; children: React.ReactNode}> = ({vx, vy, n = 3, k = 0.014, min = 600, children}) => {
  const speed = Math.hypot(vx, vy);
  const amt = clamp((speed - min) / 1800);
  return <div style={{position: 'relative'}}>
    {amt > 0 && Array.from({length: n}, (_, i) => (
      <div key={i} style={{position: 'absolute', inset: 0, transform: `translate(${-vx * k * (i + 1)}px, ${-vy * k * (i + 1)}px)`,
        opacity: amt * 0.28 * (1 - i / n), pointerEvents: 'none'}}>{children}</div>
    ))}
    <div style={{position: 'relative'}}>{children}</div>
  </div>;
};
