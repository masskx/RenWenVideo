import React from 'react';
import {font, mono} from '../tutorial/theme';
import {clamp} from '../fx';
import {curve} from './curves';
import {countValue} from './Numbers';

export type DrawPathProps = {
  f: number;
  at: number;
  /** SVG path data, in the coordinates of the parent <svg>. */
  d: string;
  /** Frames to draw. */
  dur?: number;
  color?: string;
  width?: number;
  /** Dashed when drawn (routes, "planned" links); the dash pattern still grows with the line. */
  dashed?: boolean;
  opacity?: number;
};

/**
 * A line that draws itself (stroke draw-on) with slow ends — leader lines to labels, arrows between steps,
 * a route on a map, an underline. Put it inside an <svg>. `pathLength` makes it work without measuring the path.
 *
 *   <svg width={900} height={600}><DrawPath f={f} at={p.a} d="M120 300 C 300 120, 600 120, 780 300" color={A} /></svg>
 */
export const DrawPath: React.FC<DrawPathProps> = ({f, at, d, dur = 14, color = '#ffab40', width = 6, dashed = false, opacity = 1}) => {
  const k = curve.draw(clamp((f - at) / dur));
  if (k <= 0) return null;
  // Dashes: mask a dashed copy with a solid draw-on so the pattern doesn't crawl while it grows.
  if (dashed) {
    const id = `dp-${Math.abs(Math.round(at * 997 + d.length * 31))}`;
    return <g opacity={opacity}>
      {/* userSpaceOnUse: a straight line has a zero-height bounding box, which would clip a default mask to nothing */}
      <mask id={id} maskUnits="userSpaceOnUse" x={-1e4} y={-1e4} width={2e4} height={2e4}><path d={d} pathLength={1} fill="none" stroke="#fff" strokeWidth={width * 3} strokeDasharray="1 1" strokeDashoffset={1 - k} /></mask>
      <path d={d} fill="none" stroke={color} strokeWidth={width} strokeLinecap="round" strokeDasharray={`${width * 2} ${width * 2}`} mask={`url(#${id})`} />
    </g>;
  }
  return <path d={d} pathLength={1} fill="none" stroke={color} strokeWidth={width} strokeLinecap="round" strokeLinejoin="round"
    strokeDasharray="1 1" strokeDashoffset={1 - k} opacity={opacity} />;
};

export type BarItem = {label: string; value: number; color?: string};
export type GrowBarsProps = {
  f: number;
  at: number;
  items: BarItem[];
  /** Scale maximum; defaults to the largest value, so the longest bar fills the track. */
  max?: number;
  width?: number;
  barH?: number;
  gap?: number;
  /** Frames between bars, and frames each bar grows. */
  stagger?: number;
  dur?: number;
  labelW?: number;
  unit?: string;
  decimals?: number;
  color?: string;
  ink?: string;
  dim?: string;
};

/**
 * Horizontal bars that grow to scale, one after another, with the value counting up in step. Horizontal, because
 * Chinese labels read on a phone only when they sit on one line. No overshoot: bars are data.
 *
 *   <GrowBars f={f} at={p.a} unit=" 分" items={[{label: 'Opus 5.5', value: 92.4}, {label: 'DeepSeek', value: 88.1}]} decimals={1} />
 */
export const GrowBars: React.FC<GrowBarsProps> = ({f, at, items, max, width = 880, barH = 72, gap = 28, stagger = 4, dur = 18, labelW = 230, unit = '',
  decimals = 0, color = '#ffab40', ink = '#e8f0fa', dim = '#183150'}) => {
  const top = max ?? Math.max(...items.map((i) => i.value));
  const track = width - labelW - 20;
  return <div style={{position: 'relative', width}}>
    {items.map((it, i) => {
      const t0 = at + i * stagger;
      const v = countValue(f, t0, it.value, dur);
      const shown = clamp((f - t0 + 4) / 4);
      return <div key={it.label} style={{display: 'flex', alignItems: 'center', height: barH, marginBottom: gap, opacity: shown}}>
        <div style={{width: labelW, fontFamily: font, fontWeight: 900, fontSize: 44, color: ink, whiteSpace: 'nowrap', overflow: 'hidden'}}>{it.label}</div>
        <div style={{position: 'relative', width: track, height: barH, background: dim}}>
          <div style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: (track * v) / top, background: it.color ?? color}} />
          <div style={{position: 'absolute', right: 14, top: 0, lineHeight: `${barH}px`, fontFamily: mono, fontWeight: 800, fontSize: 40, color: ink,
            fontVariantNumeric: 'tabular-nums'}}>{v.toFixed(decimals)}{unit}</div>
        </div>
      </div>;
    })}
  </div>;
};
