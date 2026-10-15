// Always-moving layers and "main action" pieces: particles, light sweep, stamp, keyword colouring.
// Particle kinds and the stamp slam follow dashi-animationstyle pipeline/动效部件.js (MIT, © 2026 Dashi AI Lab).
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {ease, hash, prog} from './motion';

type Area = [number, number, number, number];

/**
 * Secondary-action particles. kind: 'glow' (soft dots drifting up, twinkling), 'rain', 'confetti', 'dust'.
 * `area` defaults to the full frame minus the caption band; positions depend only on t.
 */
export const Particles: React.FC<{t: number; width: number; height: number; kind?: 'glow' | 'rain' | 'confetti' | 'dust'; n?: number;
  colors?: string[]; area?: Area; alpha?: number; seed?: number}> = ({t, width, height, kind = 'glow', n = 40, colors = ['#ffffff'], area, alpha, seed = 1}) => {
  const [x0, y0, x1, y1] = area ?? [0, 0, width, height];
  const aw = x1 - x0, ah = y1 - y0;
  const mod = (v: number, m: number) => ((v % m) + m) % m;
  const items: React.ReactNode[] = [];
  for (let i = 0; i < n; i += 1) {
    const h1 = hash(seed * 101 + i * 1.31), h2 = hash(seed * 37 + i * 2.17), h3 = hash(seed * 53 + i * 3.71), col = colors[i % colors.length];
    if (kind === 'rain') {
      const y = y0 + mod(h1 * ah + (900 + 600 * h2) * t, ah + 60) - 30, x = x0 + mod(h3 * aw * 1.3 - y * 0.12, aw);
      items.push(<line key={i} x1={x} y1={y} x2={x - 5} y2={y + 38} stroke={col} strokeWidth={1.5} opacity={alpha ?? 0.18} />);
    } else if (kind === 'confetti') {
      const y = y0 + mod(h1 * ah + (60 + 60 * h2) * t, ah + 40) - 20, x = x0 + h3 * aw + 30 * Math.sin(1.3 * t + i), s = 10 + 10 * h2;
      items.push(<rect key={i} x={-s / 2} y={-s / 4} width={s} height={s / 2} fill={col} opacity={alpha ?? 0.9}
        transform={`translate(${x} ${y}) rotate(${((1 + 2 * h3) * t + i) * 57.3}) scale(1 ${Math.cos(2.2 * t + i).toFixed(3)})`} />);
    } else {
      const glow = kind === 'glow', v = (glow ? 14 : 8) + 22 * h2, r = glow ? 4 + 8 * h3 : 1.5 + 2.5 * h3;
      const y = y0 + mod(h1 * ah + (glow ? -v : v) * t, ah), x = x0 + mod(h3 * aw + 24 * Math.sin(0.5 * t + i * 1.7), aw);
      const a = (alpha ?? (glow ? 0.55 : 0.3)) * (0.55 + 0.45 * Math.sin(1.3 * t + i * 2.3));
      items.push(glow
        ? <circle key={i} cx={x} cy={y} r={r * 3} fill={`url(#fx-glow-${colors.indexOf(col)})`} opacity={a} />
        : <circle key={i} cx={x} cy={y} r={r} fill={col} opacity={a} />);
    }
  }
  return <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{position: 'absolute', inset: 0, pointerEvents: 'none'}}>
    <defs>{colors.map((c, i) => <radialGradient key={c} id={`fx-glow-${i}`}>
      <stop offset="0" stopColor={c} stopOpacity={1} /><stop offset="0.3" stopColor={c} stopOpacity={0.55} /><stop offset="1" stopColor={c} stopOpacity={0} />
    </radialGradient>)}</defs>
    {items}
  </svg>;
};

/** A soft diagonal light band that drifts across every `period` seconds (background layer). */
export const LightSweep: React.FC<{t: number; period?: number; color?: string; opacity?: number}> = ({t, period = 7, color = 'rgba(255,220,150,1)', opacity = 0.12}) => {
  const u = (t % period) / period;
  return <AbsoluteFill style={{pointerEvents: 'none', mixBlendMode: 'screen', opacity,
    background: `linear-gradient(115deg, transparent ${u * 160 - 40}%, ${color} ${u * 160 - 20}%, transparent ${u * 160}%)`}} />;
};

/**
 * Stamp slam (盖章): scales 1.9 → 1 in 0.12 s with a little rotation, then holds. Pair it with
 * shake(t, [at]) on the stage. `at` is the keyword time.
 */
export const Stamp: React.FC<{t: number; at: number; text: string; color?: string; size?: number; deg?: number; style?: React.CSSProperties; font?: string}> = ({
  t, at, text, color = '#e5484d', size = 64, deg = -8, style, font}) => {
  if (t < at) return null;
  const p = prog(t, at, 0.12), s = 1.9 - 0.9 * ease.outCubic(p);
  return <div style={{position: 'absolute', transform: `rotate(${deg + (1 - p) * -6}deg) scale(${s})`, opacity: Math.min(1, p * 3), transformOrigin: 'center', ...style}}>
    <div style={{fontFamily: font, fontSize: size, fontWeight: 900, color, letterSpacing: 4, padding: `${size * 0.12}px ${size * 0.35}px`,
      border: `${Math.max(4, size * 0.08)}px solid ${color}`, borderRadius: size * 0.18, boxShadow: `inset 0 0 0 ${Math.max(2, size * 0.04)}px rgba(0,0,0,0)`,
      background: 'rgba(10,10,14,0.35)', whiteSpace: 'nowrap', textShadow: '0 2px 10px rgba(0,0,0,0.4)'}}>{text}</div>
  </div>;
};

export type Keyword = {text: string; color: string; underline?: boolean};

/**
 * Colour exact-match keywords inside a caption. Longest match wins, so "多模态" listed as emphasis beats
 * "模态" listed as highlight. Keep the two fixed A/B colours for the video's two core nouns.
 */
export const KeywordText: React.FC<{text: string; keywords: Keyword[]}> = ({text, keywords}) => {
  const sorted = [...keywords].sort((a, b) => b.text.length - a.text.length);
  const out: React.ReactNode[] = [];
  let buf = '';
  for (let i = 0; i < text.length;) {
    const hit = sorted.find((k) => k.text && text.startsWith(k.text, i));
    if (hit) {
      if (buf) out.push(buf);
      buf = '';
      out.push(<span key={i} style={{color: hit.color, textDecoration: hit.underline ? `underline ${hit.color}` : undefined}}>{hit.text}</span>);
      i += hit.text.length;
    } else {
      buf += text[i];
      i += 1;
    }
  }
  if (buf) out.push(buf);
  return <>{out}</>;
};
