// Spatial layers for the cinema background (look.space): a perspective floor grid that flows toward the viewer and a depth
// field of soft light and dust drifting past at different distances. Both are very faint by design — they give the frame
// depth and slow motion without becoming a "tech wallpaper" (quick-reference §六 高级感). Pure functions of t.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {cinema} from './theme';
import {hash} from '../fx';

const W = 1080, H = 1920, CX = 540;

/**
 * Perspective floor: horizon at y 1060 (just under the stage's content), lines receding to one vanishing point, cross lines
 * flowing toward the camera at `speed` grid cells per second. Brightest mid-floor, gone at the horizon and at the bottom.
 */
export const GridFloor: React.FC<{t: number; horizon?: number; speed?: number; opacity?: number}> = ({t, horizon = 1060, speed = 0.35, opacity = 0.3}) => {
  const depth = H - horizon, zFar = 14;
  const yAt = (z: number) => horizon + depth / z;
  const cols = Array.from({length: 23}, (_, i) => i - 11);
  const phase = (t * speed) % 1;
  const rows = Array.from({length: zFar}, (_, i) => 1 + i + (1 - phase)).filter((z) => z > 1 && z < zFar);
  return <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', inset: 0}}>
    <defs>
      <linearGradient id="floor-fade" x1="0" y1={horizon} x2="0" y2={H} gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor="#fff" stopOpacity={0} />
        <stop offset="0.18" stopColor="#fff" stopOpacity={0.55} />
        <stop offset="0.55" stopColor="#fff" stopOpacity={1} />
        <stop offset="1" stopColor="#fff" stopOpacity={0.35} />
      </linearGradient>
      <mask id="floor-mask"><rect x={0} y={horizon} width={W} height={depth} fill="url(#floor-fade)" /></mask>
      <radialGradient id="floor-glow" cx={CX} cy={horizon} r={700} gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor={`rgb(${cinema.key})`} stopOpacity={0.22} />
        <stop offset="1" stopColor={`rgb(${cinema.key})`} stopOpacity={0} />
      </radialGradient>
    </defs>
    <rect x={0} y={0} width={W} height={H} fill="url(#floor-glow)" />
    <g mask="url(#floor-mask)" stroke={`rgba(${cinema.key},1)`} strokeOpacity={opacity} fill="none">
      {cols.map((c) => <line key={`c${c}`} x1={CX + c * 260} y1={H + 40} x2={CX + (c * 260) / zFar} y2={yAt(zFar)} strokeWidth={2} />)}
      {rows.map((z) => <line key={`r${z.toFixed(3)}`} x1={0} x2={W} y1={yAt(z)} y2={yAt(z)} strokeWidth={Math.max(1, 3 / z)} />)}
    </g>
  </svg>;
};

/**
 * Depth field: three big soft lights at different distances drifting with parallax (near ones move more), and dust that
 * drifts slowly toward the camera — far motes small and dim, near ones larger and softer, fading out before they get close.
 */
export const DepthField: React.FC<{t: number; motes?: number; speed?: number}> = ({t, motes = 46, speed = 0.035}) => {
  const lights = [
    {x: 0.25, y: 0.22, r: 620, d: 0.3, c: cinema.key, o: 0.09},
    {x: 0.8, y: 0.5, r: 520, d: 0.6, c: cinema.fill, o: 0.07},
    {x: 0.4, y: 0.82, r: 760, d: 1, c: cinema.key, o: 0.06},
  ];
  return <AbsoluteFill>
    {lights.map((l, i) => {
      const dx = Math.sin(t / (9 - i * 2) + i) * 60 * l.d, dy = Math.cos(t / (11 - i * 2) + i * 2) * 40 * l.d;
      return <div key={i} style={{position: 'absolute', left: l.x * W - l.r + dx, top: l.y * H - l.r + dy, width: 2 * l.r, height: 2 * l.r, borderRadius: '50%',
        background: `radial-gradient(circle, rgba(${l.c},${l.o}) 0%, rgba(${l.c},${l.o * 0.4}) 40%, transparent 70%)`}} />;
    })}
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', inset: 0}}>
      <defs>
        <radialGradient id="mote"><stop offset="0" stopColor="#fff" stopOpacity={1} /><stop offset="0.35" stopColor="#fff" stopOpacity={0.5} /><stop offset="1" stopColor="#fff" stopOpacity={0} /></radialGradient>
      </defs>
      {Array.from({length: motes}, (_, i) => {
        const a = hash(i * 3.7) * Math.PI * 2, r0 = 120 + hash(i * 5.1) * 900;
        // z runs 1 (far) → 0.25 (near) and wraps; seeded phase so motes are spread through depth
        const z = 1 - ((hash(i * 9.3) + t * speed * (0.7 + hash(i * 1.7) * 0.6)) % 1) * 0.75;
        const x = CX + (Math.cos(a) * r0) / (z * 2.2), y = 860 + (Math.sin(a) * r0 * 1.3) / (z * 2.2);
        const size = 2.5 / z, fade = Math.min(1, (1 - z) * 4) * Math.min(1, (z - 0.25) * 6);
        return <circle key={i} cx={x} cy={y} r={size * 3} fill="url(#mote)" opacity={0.35 * fade} />;
      })}
    </svg>
  </AbsoluteFill>;
};
