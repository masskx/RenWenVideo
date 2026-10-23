// Cut transitions that cover the frame exactly at the cut, so content can switch hard underneath.
// Adapted from dashi-animationstyle pipeline/动效部件.js (MIT, © 2026 Dashi AI Lab): glitch, push,
// iris, sweep, pageTurn. Rules: >= 3 kinds per video, never the same kind 3 times in a row, big
// transitions for topic changes, 0.3–0.7 s each (docs/video-craft/动效与画面变化.md §3).
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {clamp, ease, hash, prog} from './motion';

/** 'cut' is a hard cut (no transition): for films whose scenes hand over by colour or a graphic match. */
export type CutKind = 'sweep' | 'iris' | 'pageTurn' | 'push' | 'pushUp' | 'glitch' | 'cut';
export type Cut = {at: number; kind: CutKind};

/** Kinds that read as a "new section" vs. a step within one. */
export const BIG_KINDS: CutKind[] = ['sweep', 'pageTurn', 'iris'];
export const SMALL_KINDS: CutKind[] = ['push', 'glitch', 'pushUp'];

/**
 * Assign a transition to every cut time: big cuts rotate through `big`, small cuts through `small`,
 * so the video uses several kinds and never repeats one three times in a row.
 */
export const planCuts = (times: number[], isBig: (i: number) => boolean, o: {big?: CutKind[]; small?: CutKind[]} = {}): Cut[] => {
  const big = o.big ?? BIG_KINDS, small = o.small ?? SMALL_KINDS;
  let b = 0, s = 0;
  return times.map((at, i) => ({at, kind: isBig(i) ? big[b++ % big.length] : small[s++ % small.length]}));
};

const HALF: Record<CutKind, [number, number]> = {
  sweep: [0.4, 0.3], iris: [0.35, 0.35], pageTurn: [0.3, 0.3], push: [0.25, 0.25], pushUp: [0.25, 0.25], glitch: [0.14, 0.14], cut: [0, 0],
};
/** The cut whose transition window contains t, if any. */
export const activeCut = (t: number, cuts: Cut[]) => cuts.find((c) => t >= c.at - HALF[c.kind][0] && t <= c.at + HALF[c.kind][1]) ?? null;

type StageProps = {t: number; cuts: Cut[]; width: number; height: number; colors?: string[]; paper?: string; fill?: string; children: React.ReactNode};

/**
 * Wrap the picture (not captions, header or audio). Applies push / glitch to the content and draws
 * sweep / iris / page-turn overlays above it.
 */
export const CutStage: React.FC<StageProps> = ({t, cuts, width: W, height: H, colors = ['#ffc53d', '#5ee7ff', '#070b14'], paper = '#efe7d6', fill = '#070b14', children}) => {
  const cut = activeCut(t, cuts);
  if (!cut || cut.kind === 'cut') return <AbsoluteFill>{children}</AbsoluteFill>;
  const c = cut.at;
  if (cut.kind === 'push' || cut.kind === 'pushUp') {
    const h = HALF[cut.kind][0];
    const m = t < c ? -ease.inCubic(prog(t, c - h, h)) : 1 - ease.outCubic(prog(t, c, h));
    const blur = Math.abs(m) * 6;
    const tr = cut.kind === 'push' ? `translateX(${m * W}px)` : `translateY(${m * H}px)`;
    return <AbsoluteFill style={{background: fill}}><AbsoluteFill style={{transform: tr, filter: `blur(${blur}px)`}}>{children}</AbsoluteFill></AbsoluteFill>;
  }
  if (cut.kind === 'glitch') {
    const d = HALF.glitch[0], a = 1 - Math.abs(t - c) / d, f = Math.floor(t * 30);
    const bands = Array.from({length: 9}, (_, i) => {
      const y = hash(f * 13 + i) * H, h = 20 + hash(f * 7 + i) * 140, dx = (hash(f * 3 + i) - 0.5) * 2 * 170 * a;
      return <AbsoluteFill key={i} style={{clipPath: `inset(${y}px 0 ${Math.max(0, H - y - h)}px 0)`, transform: `translateX(${dx}px)`}}>{children}</AbsoluteFill>;
    });
    return <AbsoluteFill>
      {children}
      {bands}
      <AbsoluteFill style={{mixBlendMode: 'screen', opacity: 0.4 * a, transform: `translateX(${16 * a}px)`}}>{children}</AbsoluteFill>
      {Array.from({length: 5}, (_, i) => <div key={`bar${i}`} style={{position: 'absolute', left: hash(f + i * 5) * W, top: hash(f * 2 + i) * H,
        width: 80 + hash(f + i) * 420, height: 4 + hash(f * 5 + i) * 14, background: colors[i % colors.length], opacity: 0.35 * a}} />)}
    </AbsoluteFill>;
  }
  return <AbsoluteFill>
    {children}
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', inset: 0}}>
      {cut.kind === 'sweep' && <Sweep t={t} c={c} W={W} H={H} colors={colors} />}
      {cut.kind === 'iris' && <Iris t={t} c={c} W={W} H={H} fill={fill} ring={colors[0]} />}
      {cut.kind === 'pageTurn' && <PageTurn t={t} c={c} W={W} H={H} paper={paper} />}
    </svg>
  </AbsoluteFill>;
};

// Slanted colour bands sweep left→right; the last one covers the frame exactly at the cut.
const Sweep: React.FC<{t: number; c: number; W: number; H: number; colors: string[]}> = ({t, c, W, H, colors}) => {
  const [pre, post] = HALF.sweep, d = pre + post, lag = 0.12, L = lag * (colors.length - 1), a = (0.5 + L) / (1 + L);
  const P = prog(t, c - d * a, d), slant = 220, span = W + slant * 2;
  return <>{colors.map((col, i) => {
    const q = ease.inOutCubic(clamp(P * (1 + L) - lag * i));
    const head = -slant + q * 2 * span, tail = head - span;
    return <polygon key={col} fill={col} points={`${tail},${H} ${tail + slant},0 ${head + slant},0 ${head},${H}`} />;
  })}</>;
};

// Circle closes to nothing at the cut, then reopens on the new shot.
const Iris: React.FC<{t: number; c: number; W: number; H: number; fill: string; ring: string}> = ({t, c, W, H, fill, ring}) => {
  const [pre, post] = HALF.iris, R = Math.hypot(W, H) / 2 + 4;
  const k = t < c ? 1 - ease.inCubic(prog(t, c - pre, pre)) : ease.outCubic(prog(t, c, post));
  const r = Math.max(0.01, R * k), cx = W / 2, cy = H * 0.42;
  return <>
    <path fillRule="evenodd" fill={fill} d={`M0 0H${W}V${H}H0Z M${cx - r} ${cy} a${r} ${r} 0 1 0 ${2 * r} 0 a${r} ${r} 0 1 0 ${-2 * r} 0Z`} />
    {k > 0.02 && k < 0.98 && <circle cx={cx} cy={cy} r={r} fill="none" stroke={ring} strokeWidth={12} />}
  </>;
};

// A sheet of paper wipes right→left with a shadowed fold edge; fully covering at the cut.
const PageTurn: React.FC<{t: number; c: number; W: number; H: number; paper: string}> = ({t, c, W, H, paper}) => {
  const [pre, post] = HALF.pageTurn, s = ease.inOutCubic(prog(t, c - pre, pre + post));
  const L = W + 260 - s * (2 * W + 1000), R = L + W + 520;
  return <>
    <defs>
      <linearGradient id="fx-page-fold" x1="0" x2="1">
        <stop offset="0" stopColor="#000" stopOpacity={0.25} />
        <stop offset="0.3" stopColor="#fff" stopOpacity={0.35} />
        <stop offset="1" stopColor="#fff" stopOpacity={0} />
      </linearGradient>
    </defs>
    <polygon points={`${L - 200},0 ${R - 200},0 ${R + 80},${H} ${L + 80},${H}`} fill="rgba(0,0,0,0.3)" transform="translate(-40 0)" />
    <polygon points={`${L - 200},0 ${R - 200},0 ${R + 80},${H} ${L + 80},${H}`} fill={paper} />
    <polygon points={`${L - 200},0 ${L + 120},0 ${L + 400},${H} ${L + 80},${H}`} fill="url(#fx-page-fold)" />
  </>;
};
