import React from 'react';
import {Img, staticFile} from 'remotion';
import {clamp, ease} from '../../fx';
import {font} from '../theme';
import {cond, plex} from '../fonts';
import {Cue, Scene} from '../paper';
import {W, eo} from '../package';

// mistral-large4-open-weights, made on the template lemo/telestrator (docs/video-craft/prompt-library/vendor/lemomo-ai__
// lemo-opuscar/3961ddb/styles/telestrator/STYLE.md; picked for "跑分 / A vs B" — the pundit's board that freezes the
// replay and draws on it). Mistral Large 4's open weights (2026-10-29): its own chart says Terminal-Bench 4.0 41 % (GLM-5.3
// 40) and FrontierCode 2.0 19.7 %, "the best open-weight model for coding"; Artificial Analysis's own comparison page
// (10-30) has 25 % (GLM-5.3 on low reasoning 35 %) and 15 %; nobody says why — settings or the weights' version may
// differ. What is solid: the weights are out (~1 T parameters), $0.70 / $2.10 per million tokens; the licence (modified
// MIT) wants a separate commercial licence from companies that sell the model as a service. Inputs:
// inputs/mistral-large4-open-weights/ (README.md, REVIEW-DOUYIN.md, materials.md, sources.md). Storyboard:
// tutorials/mistral-large4-open-weights.storyboard.md.
// - review: every official number carries 「官方自报」; 41 / 19.7 never appear without 25 / 15 next to them; never 「全面第一」
//   or 「最强开源」, only coding and self-reported; parameters only 「约 1 万亿」; the gap's cause is not stated.
// - What the template gives: the replay played, then frozen (white flash 0.1 s, punch 1.035 → 1, desaturate 42 %, cool
//   cast, heavier vignette) and drawn on — rings under the subject, marker lines with a dark outline + glowing core + thin
//   highlight drawn along their length, labels as black cards with a coloured left bar; packaging in the corners (corner
//   bug with a mode line, source clock, score bar that flips with a flash); one identity colour per side; a rewind (◀◀,
//   jitter, tracking bars); the stamp once per film; the board page (ink green-black, faint 60 px grid) for the data card.
// - Customised (模板改造): the followed side's yellow → the orange of Mistral's own chart bars (#FF5229), opponents stay
//   cyan, third-party measurements are chalk; the match footage → Mistral's official chart screenshots, "played" by
//   revealing the real bars bottom-up (rewind = they sink); the score bar → 官方自报 vs 第三方实测, the flip moved to the
//   moment the third-party number lands (the climax); subtitles Chinese only; the brass band → our synthesized tension score.

const K = {board: '#0C1411', ink: '#F4F1E8', ink2: '#B9BFB8', ink3: '#7E8780', ml: '#FF5229', opp: '#3FD8FF', card: 'rgba(8,12,14,0.9)', cream: '#F5F4EF'};
const IMG = (n: string) => `images/mistral-large4-open-weights/${n}`;
const back = (t: number, s = 1.6) => ease.outBack(clamp(t), s);

/* ---------- the "footage": an official chart, cropped and scaled; bars revealed bottom-up from the real pixels ---------- */

type Bar = {x0: number; x1: number; top: number; who?: 'ml' | 'opp'};
type Chart = {src: string; crop: [number, number, number, number]; base: number; perPct: number; bars: Bar[]};
// Bar geometry measured on the screenshots (source px): baseline y 861, 12.93 px per percentage point.
const TB: Chart = {src: 'terminal-bench.png', crop: [140, 120, 1540, 1000], base: 861, perPct: 12.93, bars: [
  {x0: 162, x1: 280, top: 503}, {x0: 368, x1: 486, top: 331, who: 'ml'}, {x0: 574, x1: 692, top: 822}, {x0: 778, x1: 898, top: 784},
  {x0: 984, x1: 1102, top: 592}, {x0: 1190, x1: 1308, top: 464}, {x0: 1394, x1: 1514, top: 348, who: 'opp'}]};
const FC: Chart = {src: 'frontiercode.png', crop: [140, 120, 1540, 1000], base: 861, perPct: 32.03, bars: [
  {x0: 222, x1: 356, top: 230, who: 'ml'}, {x0: 452, x1: 586, top: 768}, {x0: 684, x1: 818, top: 406}, {x0: 914, x1: 1048, top: 306},
  {x0: 1146, x1: 1280, top: 290}, {x0: 1376, x1: 1510, top: 242}]};
const PIC_Y = 330; // top of the picture on screen
const S = W / 1400; // chart crop → screen scale (0.771)
const sx = (c: Chart, x: number) => (x - c.crop[0]) * S;
const sy = (c: Chart, y: number) => PIC_Y + (y - c.crop[1]) * S;
const pctY = (c: Chart, v: number) => sy(c, c.base - v * c.perPct);
const PIC_H = (1000 - 120) * S;

/** The chart as footage. `grow(i)` is bar i's revealed fraction (1 = as published); `frz` 0..1 is the freeze look. */
const ChartPic: React.FC<{c: Chart; grow?: (i: number) => number; frz?: number; jitter?: number}> = ({c, grow = () => 1, frz = 0, jitter = 0}) => {
  const [x0, y0] = c.crop;
  return <div style={{position: 'absolute', left: jitter, top: PIC_Y, width: W, height: PIC_H, overflow: 'hidden', background: K.cream,
    filter: frz > 0 ? `saturate(${1 - 0.42 * frz}) brightness(${1 - 0.05 * frz})` : undefined}}>
    <Img src={staticFile(IMG(c.src))} style={{position: 'absolute', left: -x0 * S, top: -y0 * S, width: 1616 * S}} />
    {/* the reveal: cream covers the part of each bar (and its value label) that hasn't grown yet */}
    <svg width={W} height={PIC_H} style={{position: 'absolute', left: 0, top: 0}}>
      {c.bars.map((b, i) => {
        const g = clamp(grow(i));
        if (g >= 1) return null;
        const yTop = (b.top - 70 - y0) * S, yCut = (c.base - g * (c.base - b.top) - y0) * S;
        return <rect key={i} x={(b.x0 - 8 - x0) * S} y={yTop} width={(b.x1 - b.x0 + 16) * S} height={Math.max(0, yCut - yTop)} fill={K.cream} />;
      })}
    </svg>
    {frz > 0 && <div style={{position: 'absolute', inset: 0, background: 'rgba(40,70,100,0.10)', opacity: frz, mixBlendMode: 'multiply'}} />}
    <div style={{position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 75% 70% at 50% 50%, transparent 55%, rgba(0,0,0,0.38) 100%)', opacity: 0.4 + 0.6 * frz}} />
  </div>;
};

/** Freeze entry: white flash (0.1 s, 0.55) + punch 1.035 → 1 (0.35 s); returns the picture's scale and the flash. */
const freezeAt = (f: number, at: number) => {
  if (f < at) return {k: 1, flash: 0, frz: 0};
  const t = f - at;
  return {k: 1 + 0.035 * (1 - ease.outCubic(clamp(t / 10))) + 0.012 * clamp((t - 10) / 120), flash: t < 3 ? 0.55 * (1 - t / 3) : 0, frz: eo(f, at, at + 6)};
};
const Flash: React.FC<{a: number}> = ({a}) => (a > 0 ? <div style={{position: 'absolute', inset: 0, background: '#fff', opacity: a}} /> : null);
/** Wraps the picture + its overlays in the same transform, so the drawings stay on the bars during the punch. */
const Punch: React.FC<{k: number; cx?: number; cy?: number; children: React.ReactNode}> = ({k, cx = 540, cy = 660, children}) =>
  <div style={{position: 'absolute', inset: 0, transformOrigin: `${cx}px ${cy}px`, transform: `scale(${k})`}}>{children}</div>;

/* ---------- drawing kit ---------- */

/** A marker line: dark outline + coloured core with glow + thin white highlight, drawn along its length; arrow optional. */
const Marker: React.FC<{pts: [number, number][]; p: number; color: string; w?: number; dash?: boolean; arrow?: boolean; seed?: number}> = ({pts, p, color, w = 10, dash, arrow, seed = 1}) => {
  if (p <= 0) return null;
  const wob = pts.map(([x, y], i) => [x + Math.sin(seed * 7.1 + i * 3.3) * 2.5, y + Math.cos(seed * 5.3 + i * 2.1) * 2.5] as [number, number]);
  const lens = wob.slice(1).map((q, i) => Math.hypot(q[0] - wob[i][0], q[1] - wob[i][1]));
  const total = lens.reduce((a, b) => a + b, 0);
  const d = 'M' + wob.map((q) => q.join(' ')).join(' L');
  const off = total * (1 - clamp(p));
  const [ax, ay] = wob[wob.length - 1], [bx, by] = wob[wob.length - 2] ?? wob[0];
  const ang = Math.atan2(ay - by, ax - bx);
  const head = arrow && p > 0.9 ? back((p - 0.9) / 0.1) : 0;
  const da = dash ? `${w * 2.4} ${w * 1.6}` : undefined;
  const common = {fill: 'none', strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const};
  return <svg width={W} height={1920} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
    <defs><mask id={`mk-${seed}`}><path d={d} {...common} stroke="#fff" strokeWidth={w + 12} strokeDasharray={total} strokeDashoffset={off} /></mask></defs>
    <g mask={`url(#mk-${seed})`}>
      <path d={d} {...common} stroke="rgba(0,0,0,0.55)" strokeWidth={w + 6} strokeDasharray={da} />
      <path d={d} {...common} stroke={color} strokeWidth={w} strokeDasharray={da} style={{filter: `drop-shadow(0 0 9px ${color})`}} />
      <path d={d} {...common} stroke="rgba(255,255,255,0.75)" strokeWidth={w * 0.28} strokeDasharray={da} />
    </g>
    {head > 0 && <g transform={`translate(${ax} ${ay}) rotate(${(ang * 180) / Math.PI}) scale(${head})`}>
      <path d={`M0 0 L${-w * 2.6} ${-w * 1.7} L${-w * 2.6} ${w * 1.7} Z`} fill={color} stroke="rgba(0,0,0,0.55)" strokeWidth={3} />
    </g>}
  </svg>;
};

/** A ring under a bar's foot: a perspective ellipse drawn clockwise + a dashed outer ring turning at 60 px/s. */
const Ring: React.FC<{cx: number; cy: number; r: number; p: number; f: number; color: string}> = ({cx, cy, r, p, f, color}) => {
  if (p <= 0) return null;
  const ry = r * 0.36, c = 2 * Math.PI * r;
  return <svg width={W} height={1920} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
    <ellipse cx={cx} cy={cy} rx={r} ry={ry} fill={color} fillOpacity={0.18 * clamp(p * 2)} stroke="rgba(0,0,0,0.5)" strokeWidth={11} strokeDasharray={c} strokeDashoffset={c * (1 - clamp(p))} />
    <ellipse cx={cx} cy={cy} rx={r} ry={ry} fill="none" stroke={color} strokeWidth={6} strokeDasharray={c} strokeDashoffset={c * (1 - clamp(p))} style={{filter: `drop-shadow(0 0 8px ${color})`}} />
    <ellipse cx={cx} cy={cy} rx={r * 1.28} ry={ry * 1.28} fill="none" stroke={color} strokeWidth={3} strokeDasharray="14 12" strokeDashoffset={-f * 2} opacity={0.8 * clamp(p * 1.5 - 0.4)} />
  </svg>;
};

/** A column of light over a bar (the template's beam while the player moves). */
const Beam: React.FC<{x: number; w: number; top: number; base: number; a: number; color: string}> = ({x, w, top, base, a, color}) => (a <= 0 ? null :
  <div style={{position: 'absolute', left: x - 10, width: w + 20, top: top - 120, height: base - top + 120, opacity: a,
    background: `linear-gradient(180deg, transparent, ${color}33 40%, ${color}55)`, mixBlendMode: 'multiply'}} />);

/** The analysed gap: from the measured level up to the published top, chalk hatch with a dashed edge (the empty space). */
const Gap: React.FC<{c: Chart; b: Bar; v: number; p: number; color?: string}> = ({c, b, v, p, color = K.ink}) => {
  if (p <= 0) return null;
  const x = sx(c, b.x0) - 6, w = (b.x1 - b.x0) * S + 12, yTop = sy(c, b.top), yV = pctY(c, v);
  const h = (yV - yTop) * clamp(p);
  return <>
    <div style={{position: 'absolute', left: x, top: yV - h, width: w, height: h, border: `3px dashed ${color}`, boxSizing: 'border-box',
      background: 'repeating-linear-gradient(-45deg, rgba(12,20,17,0.62) 0 7px, rgba(12,20,17,0.18) 7px 16px)'}} />
    <div style={{position: 'absolute', left: x - 34, width: w + 68, top: yV - 3, height: 6, background: color, boxShadow: '0 0 0 2px rgba(0,0,0,0.5)'}} />
  </>;
};

/** A label: black card, coloured left bar, a Chinese line + a small spaced English line in the role colour. */
const Label: React.FC<{x: number; y: number; zh: string; en?: string; color: string; f: number; at: number; size?: number; right?: boolean}> = ({x, y, zh, en, color, f, at, size = 46, right}) => {
  if (f < at) return null;
  const p = back((f - at) / 6, 1.3);
  return <div style={{position: 'absolute', left: right ? undefined : x, right: right ? W - x : undefined, top: y, transform: `translateY(${(1 - p) * 16}px)`, opacity: clamp((f - at) / 2),
    background: K.card, borderLeft: `10px solid ${color}`, padding: '12px 24px 14px 20px', boxShadow: '0 10px 26px rgba(0,0,0,0.35)', whiteSpace: 'nowrap'}}>
    <div style={{fontFamily: font, fontWeight: 900, fontSize: size, lineHeight: 1.12, color: K.ink}}>{zh}</div>
    {en && <div style={{fontFamily: cond, fontWeight: 600, fontSize: 22, letterSpacing: 2, color, marginTop: 4}}>{en}</div>}
  </div>;
};

/* ---------- packaging ---------- */

type Mode = 'self' | 'third' | 'replay' | 'board';
const MODES: Record<Mode, [string, string]> = {self: ['官方自报', K.ml], third: ['第三方实测', K.ink], replay: ['回放', K.opp], board: ['数据卡', K.ink2]};
/** Corner bug, top right: the show's name on an orange block + the mode line. Present from frame 0, never fades. */
const Bug: React.FC<{mode: Mode; f: number}> = ({mode, f}) => {
  const [txt, col] = MODES[mode];
  return <div style={{position: 'absolute', right: 64, top: 150, display: 'flex', alignItems: 'stretch', boxShadow: '0 8px 22px rgba(0,0,0,0.35)'}}>
    <div style={{background: K.ml, padding: '8px 18px', fontFamily: font, fontWeight: 900, fontSize: 34, color: K.board}}>跑分回放</div>
    <div style={{background: '#080C0E', padding: '8px 18px', display: 'flex', alignItems: 'center', gap: 12}}>
      <div style={{width: 14, height: 14, borderRadius: 7, background: col, opacity: 0.55 + 0.45 * Math.abs(Math.sin(f / 9))}} />
      <div style={{fontFamily: font, fontWeight: 800, fontSize: 32, color: col}}>{txt}</div>
    </div>
  </div>;
};
/** Source clock, top left: what is on screen and whether it is playing (▶), frozen (❚❚) or rewinding (◀◀). */
const Clock: React.FC<{state: '▶' | '❚❚' | '◀◀'; text: string}> = ({state, text}) => (
  <div style={{position: 'absolute', left: 64, top: 156, fontFamily: plex, fontWeight: 500, fontSize: 26, color: K.ink, background: 'rgba(8,12,14,0.82)', padding: '8px 16px', letterSpacing: 1}}>
    <span style={{color: state === '◀◀' ? K.opp : state === '❚❚' ? K.ml : K.ink}}>{state}</span>&nbsp;&nbsp;{text}
  </div>);
/** The picture's source line under the picture. */
const Src: React.FC<{text: string; y?: number}> = ({text, y = PIC_Y + PIC_H + 10}) => (
  <div style={{position: 'absolute', left: 64, top: y, fontFamily: plex, fontWeight: 500, fontSize: 22, color: K.ink3, letterSpacing: 1}}>{text}</div>);

/**
 * The score bar: 官方自报 (orange) vs 第三方实测 (chalk) in big condensed numerals. `third` flips in at `flip`: a 0.5 s roll
 * from the dashes with an orange flash behind it. `bench` names the benchmark.
 */
const ScoreBar: React.FC<{f: number; bench: string; self: string; third: string; flip: number; y?: number; at?: number}> = ({f, bench, self, third, flip, y = 1176, at = -99}) => {
  if (f < at) return null;
  const p = back((f - at) / 7, 1.2);
  const fl = f >= flip ? clamp((f - flip) / 15) : 0;
  const glow = f >= flip ? Math.max(0, 1 - (f - flip) / 12) : 0;
  const Num: React.FC<{v: string; c: string}> = ({v, c}) => <div style={{fontFamily: cond, fontWeight: 800, fontSize: 132, lineHeight: 1, color: c, transform: 'skewX(-8deg)', letterSpacing: -2}}>{v}</div>;
  return <div style={{position: 'absolute', left: 64, top: y, width: 952, height: 170, transform: `translateY(${(1 - p) * 40}px)`, opacity: clamp((f - at) / 3),
    background: '#080C0E', boxShadow: '0 16px 40px rgba(0,0,0,0.45)', display: 'flex'}}>
    <div style={{position: 'absolute', left: 0, top: -40, background: K.ml, padding: '4px 16px', fontFamily: cond, fontWeight: 800, fontSize: 28, letterSpacing: 2, color: K.board}}>{bench}</div>
    <div style={{flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 22, borderRight: '2px solid rgba(255,255,255,0.12)'}}>
      <div style={{fontFamily: font, fontWeight: 900, fontSize: 40, color: K.ml, lineHeight: 1.1, textAlign: 'right'}}>官方<br />自报</div>
      <Num v={self} c={K.ml} />
    </div>
    <div style={{flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 22, position: 'relative', overflow: 'hidden'}}>
      {glow > 0 && <div style={{position: 'absolute', inset: 0, background: K.ml, opacity: glow * 0.85}} />}
      <div style={{position: 'relative', height: 132, overflow: 'hidden'}}>
        <div style={{transform: `translateY(${-132 * ease.outCubic(fl)}px)`}}>
          <Num v="––" c={K.ink3} /><Num v={third} c={K.ink} />
        </div>
      </div>
      <div style={{position: 'relative', fontFamily: font, fontWeight: 900, fontSize: 40, color: K.ink, lineHeight: 1.1}}>第三方<br />实测</div>
    </div>
  </div>;
};

/** Rewind overlay: ◀◀ + REWIND, four white tracking bars. */
const Rewind: React.FC<{f: number}> = ({f}) => <>
  {[0, 1, 2, 3].map((i) => <div key={i} style={{position: 'absolute', left: 0, width: W, top: PIC_Y + ((i * 173 + f * 37) % PIC_H), height: 6 + (i % 2) * 5, background: 'rgba(255,255,255,0.7)', mixBlendMode: 'screen'}} />)}
  <div style={{position: 'absolute', left: 0, width: W, top: PIC_Y + PIC_H / 2 - 90, textAlign: 'center', fontFamily: cond, fontWeight: 800, fontSize: 150, color: '#fff', textShadow: '0 4px 24px rgba(0,0,0,0.6)', lineHeight: 1}}>◀◀</div>
  <div style={{position: 'absolute', left: 0, width: W, top: PIC_Y + PIC_H / 2 + 70, textAlign: 'center', fontFamily: cond, fontWeight: 800, fontSize: 46, letterSpacing: 10, color: '#fff', textShadow: '0 2px 12px rgba(0,0,0,0.6)'}}>REWIND</div>
</>;

/** The board: ink green-black with a faint 60 px grid (the show's own pages). */
const Board: React.FC<{children?: React.ReactNode}> = ({children}) => <div style={{position: 'absolute', inset: 0, background: K.board, overflow: 'hidden'}}>
  <div style={{position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(244,241,232,0.045) 1px, transparent 1px), linear-gradient(90deg, rgba(244,241,232,0.045) 1px, transparent 1px)', backgroundSize: '60px 60px'}} />
  <div style={{position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 90% 70% at 50% 40%, transparent 50%, rgba(0,0,0,0.45) 100%)'}} />
  {children}
</div>;

const make = (draw: NonNullable<Scene['backdrop']>, sfx?: Scene['sfx']): Scene => {
  const Sc: Scene = () => null;
  Sc.backdrop = draw;
  Sc.sfx = sfx;
  return Sc;
};

const ML = TB.bars[1], GLM = TB.bars[6];
const mlRing = (c: Chart, b: Bar) => ({cx: sx(c, (b.x0 + b.x1) / 2), cy: sy(c, c.base) + 4, r: (b.x1 - b.x0) * S * 0.78});
/** A marker loop around a bar's value label. */
const loopAround = (c: Chart, b: Bar): [number, number][] => {
  const cx = sx(c, (b.x0 + b.x1) / 2), cy = sy(c, b.top) - 24, rx = (b.x1 - b.x0) * S * 0.78, ry = 36;
  return Array.from({length: 15}, (_, i) => { const a = -Math.PI * 0.85 + (i / 14) * Math.PI * 2.1; return [cx + Math.cos(a) * rx, cy + Math.sin(a) * ry * (1 + i * 0.01)] as [number, number]; });
};

/* ---------- 1 hook: the official chart frozen on 41, ringed; the score bar's third-party side flips to 25 ---------- */

const hookPlan = (cue: Cue) => ({a: cue('a', 92), b: cue('b', 108), c: cue('c', 131)});
/** The hook / end picture: TB frozen, Mistral's bar ringed and its value looped, and (from `gap`) the hatch down to 25. */
const HookPic: React.FC<{f: number; frozeAt: number; gap: number; loop?: number; grow?: (i: number) => number}> = ({f, frozeAt, gap, loop = 1, grow}) => {
  const fz = freezeAt(f, frozeAt);
  const r = mlRing(TB, ML);
  return <>
    <Punch k={fz.k} cx={sx(TB, 427)} cy={sy(TB, 600)}>
      <ChartPic c={TB} frz={fz.frz} grow={grow} />
      <Ring {...r} p={1} f={f} color={K.ml} />
      <Marker pts={loopAround(TB, ML)} p={loop} color={K.ml} w={9} seed={3} />
      <Gap c={TB} b={ML} v={25} p={gap} />
    </Punch>
    <Flash a={fz.flash} />
  </>;
};
const HOOK_FRZ = 22; // the replay plays for 0.7 s (Mistral's bar already up at frame 0), then freezes
const Hook = make(({f, cue}) => {
  const p = hookPlan(cue);
  const loopP = 0.55 + 0.45 * eo(f, HOOK_FRZ, HOOK_FRZ + 8);
  const grow = (i: number) => (i === 1 ? 1 : clamp((Math.min(f, HOOK_FRZ) + 8 - i * 2) / 18));
  return <Board>
    <HookPic f={f} frozeAt={HOOK_FRZ} gap={eo(f, p.c + 2, p.c + 14)} loop={loopP} grow={grow} />
    <Label x={sx(TB, 520)} y={sy(TB, 250)} zh="开源编码第一？" en="BEST OPEN-WEIGHT FOR CODING · SELF-REPORTED" color={K.ml} f={f} at={p.a - 4} size={50} />
    {f >= p.c + 10 && <div style={{position: 'absolute', left: sx(TB, 500), top: pctY(TB, 29) - 30, fontFamily: cond, fontWeight: 800, fontSize: 72, color: K.ink, transform: 'skewX(-8deg)',
      textShadow: '0 0 0 #000, 0 3px 10px rgba(0,0,0,0.7)', opacity: eo(f, p.c + 10, p.c + 16), WebkitTextStroke: '2px #0C1411'}}>−16</div>}
    <Src text="来源：Mistral 官网 · Terminal-Bench 4.0 · 官方自报" />
    <Bug mode={f >= p.b ? 'third' : 'self'} f={f} />
    <Clock state={f < HOOK_FRZ ? '▶' : '❚❚'} text="官方图 · TERMINAL-BENCH 4.0" />
    <ScoreBar f={f} bench="TERMINAL-BENCH 4.0" self="41" third="25" flip={p.c} />
  </Board>;
}, (cue) => {
  const p = hookPlan(cue);
  return [{at: 0, kind: 'tick', gain: 0.08}, {at: 6, kind: 'tick', gain: 0.06}, {at: 12, kind: 'tick', gain: 0.06}, {at: HOOK_FRZ, kind: 'shutter', gain: 0.16}, {at: HOOK_FRZ, kind: 'thud', gain: 0.12},
    {at: HOOK_FRZ + 2, kind: 'marker', gain: 0.1}, {at: p.a - 4, kind: 'tick', gain: 0.1},
    {at: p.b, kind: 'fs-watch-tick', gain: 0.08}, {at: p.c, kind: 'stamp', gain: 0.14}, {at: p.c + 2, kind: 'marker', gain: 0.09}];
});

/* ---------- 2 official: rewind; the chart plays (bars grow); freeze — ring Mistral 41 and GLM-5.3 40; "+1" ---------- */

const officialPlan = (cue: Cue) => ({a: cue('a', 36), b: cue('b', 69), c: cue('c', 89), d: cue('d', 152)});
const RW = 14; // rewind frames
const Official = make(({f, cue}) => {
  const p = officialPlan(cue);
  const playFrom = RW + 2, frz = p.b - 4;
  const grow = (i: number) => f < RW ? 1 - ease.inOutCubic(f / RW) : clamp((f - playFrom - i * 3) / 14);
  const fz = freezeAt(f, frz);
  const rM = mlRing(TB, ML), rG = mlRing(TB, GLM);
  const link: [number, number][] = [[sx(TB, 486) + 14, sy(TB, ML.top) - 6], [sx(TB, 1394) - 14, sy(TB, GLM.top) - 6]];
  return <Board>
    <Punch k={fz.k} cx={540} cy={sy(TB, 600)}>
      <ChartPic c={TB} grow={grow} frz={fz.frz} jitter={f < RW ? Math.sin(f * 2.7) * 13 : 0} />
      {f >= playFrom && f < frz && TB.bars.map((b, i) => <Beam key={i} x={sx(TB, b.x0)} w={(b.x1 - b.x0) * S} top={sy(TB, b.top)} base={sy(TB, TB.base)}
        a={b.who ? (1 - clamp((f - playFrom - i * 3 - 14) / 8)) * 0.8 : 0} color={b.who === 'ml' ? K.ml : K.opp} />)}
      {f >= frz && <>
        <Ring {...rM} p={eo(f, p.b, p.b + 8)} f={f} color={K.ml} />
        <Ring {...rG} p={eo(f, p.c, p.c + 8)} f={f} color={K.opp} />
        <Marker pts={link} p={eo(f, p.c + 6, p.c + 18)} color={K.ink} w={7} dash seed={5} />
      </>}
    </Punch>
    <Flash a={fz.flash} />
    {f < RW && <Rewind f={f} />}
    <Label x={sx(TB, 520)} y={sy(TB, 560)} zh="Mistral Large 4 · 41%" color={K.ml} f={f} at={p.b + 4} size={44} />
    <Label x={sx(TB, 1380)} y={sy(TB, 200)} zh="GLM-5.3 · 40%" color={K.opp} f={f} at={p.c + 4} size={44} right />
    {f >= p.d - 2 && <div style={{position: 'absolute', left: sx(TB, 486) + 40, top: sy(TB, ML.top) - 150, transform: `scale(${back((f - p.d + 2) / 6, 1.8)})`, transformOrigin: '0 100%'}}>
      <span style={{fontFamily: cond, fontWeight: 800, fontSize: 120, color: K.ink, background: K.card, padding: '0 28px', transform: 'skewX(-8deg)', display: 'inline-block'}}>+1</span>
    </div>}
    <Src text="来源：Mistral 官网 · 官方自报（图里没写测试设置）" />
    <Bug mode={f < RW ? 'replay' : 'self'} f={f} />
    <Clock state={f < RW ? '◀◀' : f < frz ? '▶' : '❚❚'} text="官方图 · TERMINAL-BENCH 4.0" />
    <ScoreBar f={f} bench="TERMINAL-BENCH 4.0" self="41" third="25" flip={1e6} />
  </Board>;
}, (cue) => {
  const p = officialPlan(cue);
  return [{at: 0, kind: 'whoosh', gain: 0.1}, ...TB.bars.map((_, i) => ({at: RW + 2 + i * 3 + 6, kind: 'tick', gain: 0.045})),
    {at: p.b - 4, kind: 'shutter', gain: 0.15}, {at: p.b - 4, kind: 'thud', gain: 0.1}, {at: p.b, kind: 'pop', gain: 0.08}, {at: p.c, kind: 'pop', gain: 0.08}, {at: p.c + 6, kind: 'marker', gain: 0.09},
    {at: p.d - 2, kind: 'tick', gain: 0.1}];
});

/* ---------- 3 third (climax): the third-party levels drawn on the same chart — 25 and 35; the score bar flips ---------- */

const thirdPlan = (cue: Cue) => ({a: cue('a', 73), b: cue('b', 97), c: cue('c', 168)});
const Third = make(({f, cue}) => {
  const p = thirdPlan(cue);
  const rM = mlRing(TB, ML), rG = mlRing(TB, GLM);
  const cardP = back((f - 8) / 8, 1.2);
  return <Board>
    <Punch k={1 + 0.012 * clamp(f / 60) + 0.07 * eo(f, p.b - 4, p.b + 40)} cx={540 + 420 * eo(f, p.b - 4, p.b + 40)} cy={sy(TB, 560)}>
      <ChartPic c={TB} frz={1} />
      <Beam x={sx(TB, GLM.x0)} w={(GLM.x1 - GLM.x0) * S} top={sy(TB, GLM.top)} base={sy(TB, TB.base)} a={f >= p.b ? 0.75 * eo(f, p.b, p.b + 8) * (1 - eo(f, p.c, p.c + 12)) : 0} color={K.opp} />
      <Ring {...rM} p={1} f={f} color={K.ml} />
      <Ring {...rG} p={1} f={f} color={K.opp} />
      <Gap c={TB} b={ML} v={25} p={eo(f, p.a, p.a + 10)} />
      <Gap c={TB} b={GLM} v={35} p={eo(f, p.c - 4, p.c + 6)} />
      {f >= p.a + 6 && <Label x={sx(TB, 520)} y={pctY(TB, 25) - 40} zh="第三方 25" en="ARTIFICIAL ANALYSIS · ML4 HIGH" color={K.ink} f={f} at={p.a + 6} size={52} />}
      {f >= p.c && <Label x={sx(TB, 1380)} y={pctY(TB, 35) + 70} zh="第三方 35" en="GLM-5.3 · LOW REASONING" color={K.opp} f={f} at={p.c + 2} size={44} right />}
    </Punch>
    <Flash a={f >= p.a && f < p.a + 3 ? 0.55 * (1 - (f - p.a) / 3) : 0} />
    <div style={{position: 'absolute', left: 64, top: PIC_Y + PIC_H + 4, transform: `translateX(${(1 - cardP) * -60}px)`, opacity: clamp((f - 8) / 3),
      background: K.card, borderLeft: `10px solid ${K.ink}`, padding: '10px 22px 12px 18px'}}>
      <div style={{fontFamily: font, fontWeight: 900, fontSize: 40, color: K.ink}}>B 机位：Artificial Analysis 对比页</div>
      <div style={{fontFamily: plex, fontWeight: 500, fontSize: 22, color: K.ink2, marginTop: 4, letterSpacing: 1}}>artificialanalysis.ai · 2026-10-30 抓取</div>
    </div>
    <Bug mode="third" f={f} />
    <Clock state="❚❚" text="同一把尺 · 两个机位" />
    <ScoreBar f={f} bench="TERMINAL-BENCH 4.0" self="41" third="25" flip={p.a} />
  </Board>;
}, (cue) => {
  const p = thirdPlan(cue);
  return [{at: 6, kind: 'whoosh-short', gain: 0.08}, {at: 8, kind: 'fs-paper-slide', gain: 0.06}, {at: p.a, kind: 'stamp', gain: 0.16}, {at: p.a, kind: 'fs-impact-deep', gain: 0.12},
    {at: p.a + 2, kind: 'marker', gain: 0.1}, {at: p.c - 4, kind: 'marker', gain: 0.09}, {at: p.c + 2, kind: 'pop', gain: 0.08}];
});

/* ---------- 4 frontier: yellow… orange wipe; FrontierCode plays, freeze on 19.7; the 15 line; "why? not stated" ---------- */

const frontierPlan = (cue: Cue) => ({a: cue('a', 42), b: cue('b', 76), c: cue('c', 110), d: cue('d', 134)});
const WIPE = 10;
/** The packaging wipe: an orange slanted band with dark edges crossing the frame in 0.34 s. */
const Wipe: React.FC<{f: number; at: number}> = ({f, at}) => {
  const t = (f - at) / WIPE;
  if (t < 0 || t > 1) return null;
  const x = -700 + 2500 * ease.inOutCubic(t);
  return <div style={{position: 'absolute', left: x, top: -200, width: 520, height: 2400, background: K.ml, transform: 'skewX(-18deg)', borderLeft: '22px solid #080C0E', borderRight: '22px solid #080C0E'}} />;
};
const Frontier = make(({f, cue}) => {
  const p = frontierPlan(cue);
  const B = FC.bars[0];
  const grow = (i: number) => clamp((f - 6 - i * 3) / 12);
  const frz = p.a - 4;
  const fz = freezeAt(f, frz);
  return <Board>
    <Punch k={fz.k} cx={sx(FC, 289)} cy={sy(FC, 500)}>
      <ChartPic c={FC} grow={grow} frz={fz.frz} />
      {f >= frz && <>
        <Ring {...mlRing(FC, B)} p={eo(f, p.a - 2, p.a + 6)} f={f} color={K.ml} />
        <Marker pts={loopAround(FC, B)} p={eo(f, p.a, p.a + 10)} color={K.ml} w={9} seed={7} />
        <Gap c={FC} b={B} v={15} p={eo(f, p.b, p.b + 10)} />
      </>}
    </Punch>
    <Flash a={fz.flash} />
    <Label x={sx(FC, 400)} y={sy(FC, 140)} zh="官方 19.7%" en="COGNITION FRONTIERCODE 2.0 · SELF-REPORTED" color={K.ml} f={f} at={p.a + 4} size={46} />
    <Label x={sx(FC, 400)} y={pctY(FC, 15) - 20} zh="第三方 15%" en="ARTIFICIAL ANALYSIS" color={K.ink} f={f} at={p.b + 4} size={46} />
    {/* why? — not stated; the two likely causes as chalk options, neither ticked */}
    {f >= p.c && <div style={{position: 'absolute', left: 64, top: PIC_Y + PIC_H + 6, display: 'flex', alignItems: 'center', gap: 26, transform: `translateY(${(1 - back((f - p.c) / 7, 1.2)) * 30}px)`, opacity: clamp((f - p.c) / 3),
      background: K.card, borderLeft: `10px solid ${K.ink}`, padding: '12px 24px 14px 20px'}}>
      <div style={{fontFamily: font, fontWeight: 900, fontSize: 46, color: K.ink}}>差在哪？没说明</div>
      {f >= p.d && <div style={{display: 'flex', gap: 22, opacity: eo(f, p.d, p.d + 6)}}>
        {['设置不同？', '版本不同？'].map((t, i) => <div key={i} style={{fontFamily: font, fontWeight: 800, fontSize: 42, color: K.ink2, display: 'flex', alignItems: 'center', gap: 12,
          opacity: eo(f, p.d + i * 8, p.d + i * 8 + 6)}}><span style={{width: 30, height: 30, border: `3px solid ${K.ink2}`, display: 'inline-block'}} />{t}</div>)}
      </div>}
    </div>}
    <Src text="来源：Mistral 官网（官方自报）· Artificial Analysis 对比页" />
    <Bug mode={f >= p.b ? 'third' : 'self'} f={f} />
    <Clock state={f < frz ? '▶' : '❚❚'} text="官方图 · FRONTIERCODE 2.0" />
    <ScoreBar f={f} bench="FRONTIERCODE 2.0" self="19.7" third="15" flip={p.b} />
    <Wipe f={f} at={-WIPE / 2} />
  </Board>;
}, (cue) => {
  const p = frontierPlan(cue);
  return [{at: 0, kind: 'fs-whoosh-wipe', gain: 0.1}, ...FC.bars.map((_, i) => ({at: 6 + i * 3 + 8, kind: 'tick', gain: 0.04})), {at: p.a - 4, kind: 'shutter', gain: 0.14},
    {at: p.a, kind: 'marker', gain: 0.09}, {at: p.b, kind: 'tick', gain: 0.1}, {at: p.b + 2, kind: 'marker', gain: 0.08}, {at: p.c, kind: 'tap', gain: 0.1}, {at: p.d, kind: 'tick', gain: 0.07},
    {at: p.d + 8, kind: 'tick', gain: 0.07}];
});

/* ---------- 5 real: the data card — weights out (~1 T, "Le Chonk"), price per million tokens ---------- */

const realPlan = (cue: Cue) => ({a: cue('a', 38), b: cue('b', 104), c: cue('c', 169)});
const Row: React.FC<{y: number; f: number; at: number; label: string; note: string; children: React.ReactNode}> = ({y, f, at, label, note, children}) => {
  if (f < at) return null;
  const q = ease.inOutCubic(clamp((f - at) / 8));
  return <div style={{position: 'absolute', left: 64, top: y, width: 952, clipPath: `inset(0 ${(1 - q) * 100}% 0 0)`}}>
    <div style={{height: 2, background: 'rgba(244,241,232,0.25)', marginBottom: 18}} />
    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end'}}>
      <div>
        <div style={{fontFamily: font, fontWeight: 900, fontSize: 56, color: K.ink}}>{label}</div>
        <div style={{fontFamily: font, fontWeight: 700, fontSize: 32, color: K.ink3, marginTop: 6}}>{note}</div>
      </div>
      {children}
    </div>
  </div>;
};
const Big: React.FC<{v: string; c?: string; size?: number}> = ({v, c = K.ml, size = 150}) => <div style={{fontFamily: cond, fontWeight: 800, fontSize: size, lineHeight: 0.9, color: c, transform: 'skewX(-8deg)', letterSpacing: -2, whiteSpace: 'nowrap'}}>{v}</div>;
/** A number that rises into place out of a clip rect (no count-up: a rolling price would show prices that are wrong). */
const RiseIn: React.FC<{f: number; at: number; h: number; children: React.ReactNode}> = ({f, at, h, children}) => <div style={{overflow: 'hidden', height: h, paddingRight: 12}}>
  <div style={{transform: `translateY(${(1 - ease.outCubic(clamp((f - at) / 8))) * h}px)`}}>{children}</div>
</div>;
const Real = make(({f, cue}) => {
  const p = realPlan(cue);
  const ph = back((f - 4) / 9, 1.3);
  return <Board>
    {/* "Le Chonk": Mistral's own meme for the 1-trillion model, pinned like a polaroid (ambient shot only) */}
    {f >= 4 && <div style={{position: 'absolute', left: 600, top: 300, width: 400, padding: '14px 14px 0', background: K.ink, transform: `rotate(${4 - 2 * ph + Math.sin(f / 18) * 1.4}deg) scale(${0.6 + 0.4 * ph})`,
      transformOrigin: '50% 0', boxShadow: '0 20px 50px rgba(0,0,0,0.5)', opacity: clamp((f - 4) / 3)}}>
      <Img src={staticFile(IMG('chonk.jpg'))} style={{width: 372, height: 279, objectFit: 'cover', display: 'block', filter: 'contrast(1.05)'}} />
      <div style={{fontFamily: font, fontWeight: 800, fontSize: 30, color: K.board, padding: '10px 2px 2px'}}>官方外号 Le Chonk</div>
      <div style={{fontFamily: plex, fontSize: 20, color: '#5F6660', padding: '0 2px 12px'}}>来源：Mistral X</div>
    </div>}
    <div style={{position: 'absolute', left: 64, top: 330, fontFamily: font, fontWeight: 900, fontSize: 64, color: K.ink, opacity: eo(f, 0, 6)}}>实打实的两件事</div>
    <div style={{position: 'absolute', left: 64, top: 420, fontFamily: plex, fontWeight: 500, fontSize: 24, color: K.ink3, letterSpacing: 1, opacity: eo(f, 2, 8)}}>不靠跑分 · 官网可查</div>
    <Row y={720} f={f} at={p.a - 4} label="权重：放出来了" note="Hugging Face 可下载">
      <div style={{textAlign: 'right'}}><RiseIn f={f} at={p.a + 2} h={140}><Big v="≈1T" /></RiseIn><div style={{fontFamily: font, fontWeight: 800, fontSize: 32, color: K.ink2}}>约一万亿参数</div></div>
    </Row>
    <Row y={1000} f={f} at={p.b - 4} label="价格" note="每百万 token · 美元">
      <div style={{display: 'flex', gap: 34, alignItems: 'flex-end'}}>
        <div style={{textAlign: 'right'}}><div style={{fontFamily: font, fontWeight: 800, fontSize: 32, color: K.ink2}}>输入</div><RiseIn f={f} at={p.b + 12} h={120}><Big v="0.70" size={130} /></RiseIn></div>
        {f >= p.c - 4 && <div style={{textAlign: 'right', opacity: eo(f, p.c - 4, p.c + 2)}}><div style={{fontFamily: font, fontWeight: 800, fontSize: 32, color: K.ink2}}>输出</div><RiseIn f={f} at={p.c - 4} h={120}><Big v="2.10" size={130} /></RiseIn></div>}
      </div>
    </Row>
    {f >= p.c + 10 && <Marker pts={[[620, 1190], [700, 1196], [790, 1188], [880, 1194], [990, 1190]]} p={eo(f, p.c + 10, p.c + 22)} color={K.ml} w={8} seed={11} />}
    <Src text="来源：Mistral 官网 2026-10-29" y={1240} />
    <Bug mode="board" f={f} />
    <Clock state="❚❚" text="数据卡 · MISTRAL LARGE 4" />
  </Board>;
}, (cue) => {
  const p = realPlan(cue);
  return [{at: 0, kind: 'fs-whoosh-wipe', gain: 0.08}, {at: 4, kind: 'fs-paper-slide', gain: 0.07}, {at: p.a - 4, kind: 'whoosh-short', gain: 0.07}, {at: p.a + 4, kind: 'clack', gain: 0.1},
    {at: p.b - 4, kind: 'whoosh-short', gain: 0.07}, {at: p.b + 18, kind: 'clack', gain: 0.1}, {at: p.c - 4, kind: 'clack', gain: 0.1}, {at: p.c + 10, kind: 'marker', gain: 0.08}];
});

/* ---------- 6 license: the licence clause as quoted on HN, frozen, spotlit and underlined ---------- */

const licensePlan = (cue: Cue) => ({a: cue('a', 45), b: cue('b', 69), c: cue('c', 109)});
// Crop of hn-thread.png (2560 × 1600) around the quoted clause (its first line at source y ≈ 638): 640 source px wide at
// 1.69 ×, so the comment text reads at ≈ 30 px; the camera pans 600 source px from "operates a Model as a Service" to
// "separate commercial license".
const HN = {x0: 680, y0: 600, w: 640, h: 150};
const HS = W / HN.w;
const HY = 560; // top on screen
const hx = (x: number) => (x - HN.x0) * HS;
const hy = (y: number) => HY + (y - HN.y0) * HS;
const License = make(({f, cue}) => {
  const p = licensePlan(cue);
  const pan = ease.inOutCubic(clamp((f - p.c + 16) / 20)); // pan right to the second half of the sentence
  const offX = -(pan * 620 - 90 * (1 - eo(f, 0, p.a - 2))) * HS;
  const fz = freezeAt(f, p.a - 2);
  return <Board>
    {/* the "replay": the HN page sliding up into frame, then frozen on the clause */}
    <div style={{position: 'absolute', left: 0, top: HY - 40, width: W, height: HN.h * HS + 80, overflow: 'hidden', background: '#F6F6EF'}}>
      <Punch k={fz.k} cx={540} cy={HN.h * HS / 2 + 40}>
        <div style={{position: 'absolute', left: offX, top: 40 - (1 - eo(f, 0, 12)) * 120}}>
          <Img src={staticFile(IMG('hn-thread.png'))} style={{position: 'absolute', left: -HN.x0 * HS, top: -HN.y0 * HS, width: 2560 * HS, filter: fz.frz ? `saturate(${1 - 0.42 * fz.frz})` : undefined}} />
          {/* underlines: "operates a Model as a Service business" / "separate commercial license" (source px) */}
          <div style={{position: 'absolute', left: 0, top: -HY}}>
            <Marker pts={[[hx(772), hy(656)], [hx(1040), hy(658)], [hx(1306), hy(655)]]} p={eo(f, p.b, p.b + 10)} color={K.ml} w={9} seed={13} />
            <Marker pts={[[hx(1465), hy(656)], [hx(1630), hy(658)], [hx(1786), hy(655)]]} p={eo(f, p.c + 4, p.c + 14)} color={K.ml} w={9} seed={17} />
          </div>
        </div>
      </Punch>
      <Flash a={fz.flash} />
    </div>
    <div style={{position: 'absolute', left: 64, top: 330, fontFamily: font, fontWeight: 900, fontSize: 60, color: K.ink, opacity: eo(f, 0, 6)}}>开放权重 ≠ 开源</div>
    <div style={{position: 'absolute', left: 64, top: 420, fontFamily: plex, fontWeight: 500, fontSize: 24, color: K.ink3, letterSpacing: 1, opacity: eo(f, 2, 8)}}>HN 热帖第一条评论 · 引用的许可条款原文</div>
    <Label x={64} y={HY + HN.h * HS + 70} zh="做模型服务（MaaS）的公司" en="OPERATES A MODEL AS A SERVICE" color={K.ml} f={f} at={p.b + 4} size={46} />
    <Label x={64} y={HY + HN.h * HS + 210} zh="商用前：另签授权" en="SEPARATE COMMERCIAL LICENSE" color={K.ml} f={f} at={p.c + 4} size={56} />
    <Src text="许可：Mistral Ecosystem Open-Weight（改版 MIT）· 自用、改、微调、商用免费" y={1130} />
    <Bug mode="replay" f={f} />
    <Clock state={f < p.a - 2 ? '▶' : '❚❚'} text="HACKER NEWS · 1164 分" />
  </Board>;
}, (cue) => {
  const p = licensePlan(cue);
  return [{at: 0, kind: 'fs-whoosh-wipe', gain: 0.09}, {at: p.a - 2, kind: 'shutter', gain: 0.14}, {at: p.b, kind: 'marker', gain: 0.1}, {at: p.b + 4, kind: 'pop', gain: 0.07},
    {at: p.c, kind: 'marker', gain: 0.1}, {at: p.c + 4, kind: 'pop', gain: 0.08}];
});

/* ---------- 7 end: back to the hook's frame; the stamp (once per film): 谁测的？ ---------- */

const endPlan = (cue: Cue) => ({a: cue('a', 26)});
const End = make(({f, cue}) => {
  const p = endPlan(cue);
  const st = f >= p.a ? clamp((f - p.a) / 6) : 0;
  const sc = 1.7 - 0.7 * ease.outBack(st, 2);
  return <Board>
    <HookPic f={f} frozeAt={-30} gap={1} />
    <Src text="来源：Mistral 官网（官方自报）· Artificial Analysis 对比页" />
    <Bug mode="third" f={f} />
    <Clock state="❚❚" text="官方图 · TERMINAL-BENCH 4.0" />
    <ScoreBar f={f} bench="TERMINAL-BENCH 4.0" self="41" third="25" flip={-99} />
    {f >= p.a && <div style={{position: 'absolute', left: 230, top: 560, transform: `rotate(-7deg) scale(${sc})`, opacity: clamp(st * 3), border: `8px solid ${K.ml}`, padding: '14px 40px 18px',
      background: 'rgba(8,12,14,0.92)', boxShadow: '0 20px 60px rgba(0,0,0,0.5)'}}>
      <div style={{fontFamily: font, fontWeight: 900, fontSize: 120, color: K.ml, lineHeight: 1.05, letterSpacing: 4}}>谁测的？</div>
    </div>}
    <Flash a={f >= p.a + 4 && f < p.a + 7 ? 0.35 * (1 - (f - p.a - 4) / 3) : 0} />
  </Board>;
}, (cue) => {
  const p = endPlan(cue);
  return [{at: 0, kind: 'fs-whoosh-wipe', gain: 0.08}, {at: 0, kind: 'shutter', gain: 0.1}, {at: p.a + 4, kind: 'stamp', gain: 0.16}, {at: p.a + 4, kind: 'thud', gain: 0.1}];
});

/** Cover anchor (880 × 800, f = 0): the frozen chart, the ring, the hatch down to 25 and the score bar 41 | 25. */
const Cover: Scene = () => <div style={{position: 'absolute', left: 0, top: 0, width: 880, height: 800, overflow: 'hidden', background: K.board}}>
  <div style={{position: 'absolute', left: -60, top: -330, width: W, height: 1920, transform: 'scale(0.92)', transformOrigin: '540px 330px'}}>
    <Board>
      <HookPic f={60} frozeAt={-30} gap={1} />
      <ScoreBar f={200} bench="TERMINAL-BENCH 4.0" self="41" third="25" flip={-99} y={1010} />
    </Board>
  </div>
</div>;

export const mistralLarge4Scenes: Record<string, Scene> = {
  'mi.hook': Hook, 'mi.official': Official, 'mi.third': Third, 'mi.frontier': Frontier, 'mi.real': Real, 'mi.license': License, 'mi.end': End, 'mi.cover': Cover,
};
