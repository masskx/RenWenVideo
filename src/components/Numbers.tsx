import React from 'react';
import {mono} from '../tutorial/theme';
import {clamp} from '../fx';
import {curve, noise} from './curves';

export type ScrambleTextProps = {
  f: number;
  /** Frame the scramble starts. */
  at: number;
  /** The real text it settles on. */
  text: string;
  /** Frames every character rolls before settling (3–5 reads as "computing", more reads as noise). */
  roll?: number;
  /** Extra frames per character, left to right. */
  stagger?: number;
  /** Glyphs to roll through. */
  glyphs?: string;
  /** What shows before `at`: the real text, nothing, or rolling glyphs. */
  before?: 'text' | 'hidden' | 'scrambled';
  style?: React.CSSProperties;
};

/**
 * HUD-style decode: each character rolls through random glyphs for a few frames, then settles on the real one,
 * left to right. Use a monospace font so the width never jumps. Spaces and punctuation never roll.
 *
 *   <ScrambleText f={f} at={p.a} text="sk-••••3f9a" style={{fontSize: 34}} />
 */
export const ScrambleText: React.FC<ScrambleTextProps> = ({f, at, text, roll = 4, stagger = 1, glyphs = '0123456789abcdef#%&', before = 'text', style}) => {
  const chars = Array.from(text);
  const out = f < at && before !== 'scrambled'
    ? (before === 'text' ? text : '')
    : chars.map((ch, i) => {
      if (/[\s.,:;\-_/·•]/.test(ch) || f >= at + roll + i * stagger) return ch;
      return glyphs[Math.floor(noise(f, i) * glyphs.length)];
    }).join('');
  return <span style={{fontFamily: mono, fontVariantNumeric: 'tabular-nums', whiteSpace: 'pre', ...style}}>{out}</span>;
};

/** The value CountUp shows on frame f (use it to keep a chart and its label in step). */
export const countValue = (f: number, at: number, to: number, dur = 24, from = 0) => from + (to - from) * curve.data(clamp((f - at) / dur));

export type CountUpProps = {
  f: number;
  at: number;
  to: number;
  from?: number;
  /** Frames to reach the value; ends exactly on it. */
  dur?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  /** Thousands separators (1,000). */
  group?: boolean;
  style?: React.CSSProperties;
};

/**
 * A number that counts up to its real value with an ease-out (no overshoot: a counter never shows a number
 * that isn't true). Tabular digits so it doesn't jitter sideways.
 *
 *   <CountUp f={f} at={p.a} to={70} suffix="+" style={{fontSize: 160, color: A}} />
 */
export const CountUp: React.FC<CountUpProps> = ({f, at, to, from = 0, dur = 24, decimals = 0, prefix = '', suffix = '', group = true, style}) => {
  const v = countValue(f, at, to, dur, from);
  const s = v.toLocaleString('en-US', {minimumFractionDigits: decimals, maximumFractionDigits: decimals, useGrouping: group});
  return <span style={{fontFamily: mono, fontWeight: 800, fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap', ...style}}>{prefix}{s}{suffix}</span>;
};
