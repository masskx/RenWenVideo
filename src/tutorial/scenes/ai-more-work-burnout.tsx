import React from 'react';
import {Img, OffthreadVideo, staticFile} from 'remotion';
import {clamp, ease, hash} from '../../fx';
import {font, mono} from '../theme';
import {Cue, Scene} from '../paper';
import {Cam2, Ground, Layer, Person, POSE_SIT, POSE_STAND, Pose, Roll, Stamp, Typed, camAt, hand, mixPose, pop, ramp} from '../props';

// ai-more-work-burnout: "AI Promised Less Work. I Have Never Worked More." — Orestis Ioannou (VP of Technology at
// Bold.org), 2026-10-27, from his own GitHub contribution history. From inputs/ai-more-work-burnout/ (README.md,
// REVIEW-DOUYIN.md, sources-materials.md, transcript/article_fulltext.md). Case B: his chart (SVG original) and
// Parallel Code's demo recording (muted, 「@Parallel Code｜案例展示」). Storyboard: tutorials/ai-more-work-burnout.storyboard.md.
// - review: "contributions" (commits + PRs + reviews + issues, incl. private), never "commits"; not "his busiest year"
//   (2020 to the same date: 2,371 > 2,102) — only "427 is the busiest month" (previous high 319, Apr 2020); he is not
//   against AI ("I am not complaining about the tools"); one person's data, never generalised; no Zhihu figures.
// - One object: his monthly curve, redrawn from the polyline in his SVG (values read back on the chart's own scale; they
//   match the article: Jan 277, Feb 233, Mar 203, Apr 187, Jun 77, Aug 427, Sep 301, Apr 2020 319, Dec 2025 50).
// - Colours from the chart: ground #111827, the orange line #F59E0B, the peak labels #FDE68A, the role bands (Principal
//   blue #93C5FD / #172033 = "on paper", VP amber #FBBF24 / #2A1F0F = now); Parallel Code's teal #60D8E8 (agents) and
//   amber #D8B880 (needs you). One warm paper scene (#F3EEE4) for the pile of work.
// Stage 900 × 1080 (frame "full"); the ground and header are each scene's backdrop (1080 × 1920).

const P = {bg: '#111827', panel: '#1F2937', grid: '#374151', line: '#F59E0B', peak: '#FDE68A', vp: '#FBBF24', vpBand: '#2A1F0F', blue: '#93C5FD', pBand: '#172033',
  fsBand: '#1F2937', text: '#E5E7EB', dim: '#9CA3AF', cyan: '#67E8F9', agent: '#60D8E8', agentDeep: '#2B7C88', need: '#D8B880', warm: '#F3EEE4', ink: '#1A1F29', red: '#E5484D'};
const ENGINEER = {top: '#4F6D8F', bottom: '#2D3442', hair: '#3A2A22', skin: '#E9C2A0'};
const CLIP = staticFile('video/ai-more-work-burnout/ctrl-tab.mp4');
const CHART = staticFile('images/tutorials/ai-more-work-burnout/chart.png');

// Monthly GitHub contributions, Jan 2019 … Oct 2026 (Oct partial), read back from his SVG.
const ALL = [74, 114, 68, 38, 12, 30, 21, 67, 86, 147, 148, 180, 212, 249, 246, 319, 220, 287, 184, 257, 226, 200, 162, 149, 127, 167, 138, 138, 205, 78, 69, 141, 202, 196, 216, 162,
  111, 126, 171, 122, 76, 109, 109, 117, 122, 167, 150, 118, 125, 151, 71, 56, 135, 108, 72, 87, 111, 105, 95, 73, 147, 196, 105, 167, 91, 73, 148, 118, 107, 99, 89, 86,
  103, 170, 88, 111, 113, 83, 129, 150, 145, 124, 88, 50, 277, 233, 203, 187, 114, 77, 104, 427, 301, 179];
const AUG26 = 91, APR20 = 15;

type Mode = 'dark' | 'warm';
const backdrop = (mode: Mode): Scene['backdrop'] => {
  const B: NonNullable<Scene['backdrop']> = ({f}) => {
    const dark = mode === 'dark';
    return <>
      <Ground a={dark ? P.bg : P.warm} b={dark ? P.bg : P.warm} k={0} t={f / 30} horizon={dark ? undefined : 1060} light={dark ? 'rgba(245,158,11,0.10)' : undefined} grain={dark ? 0.3 : 0.45} />
      <div style={{position: 'absolute', left: 72, right: 72, top: 92, display: 'flex', justifyContent: 'space-between', fontFamily: font, fontWeight: 700, fontSize: 28,
        color: dark ? 'rgba(255,255,255,0.5)' : 'rgba(26,31,41,0.5)', letterSpacing: 1}}>
        <span>AI 新闻 · 工作</span><span style={{fontWeight: 500, fontSize: 24}}>据 Orestis Ioannou 2026-10-27</span>
      </div>
    </>;
  };
  return B;
};
const Abs: React.FC<{x?: number; y: number; w?: number; style?: React.CSSProperties; children: React.ReactNode}> = ({x = 0, y, w, style, children}) => (
  <div style={{position: 'absolute', left: x, top: y, width: w, ...style}}>{children}</div>
);
const In: React.FC<{f: number; at: number; d?: number; dy?: number; style?: React.CSSProperties; children: React.ReactNode}> = ({f, at, d = 10, dy = 40, style, children}) => {
  const p = pop(f, at, d);
  if (p < -0.5) return null;
  return <div style={{opacity: clamp(p * 2), transform: `translateY(${(1 - Math.max(0, p)) * dy}px)`, ...style}}>{children}</div>;
};
const stage = (cam: Cam2, mid: React.ReactNode, near?: React.ReactNode) => <>
  <Layer cam={cam} depth={1}>{mid}</Layer>
  {near && <Layer cam={cam} depth={1.2}>{near}</Layer>}
</>;
const shake = (f: number, at: number, amp = 10) => (f < at ? 0 : amp * Math.exp(-(f - at) / 5) * Math.sin((f - at) * 2.4));

/* ---------- his curve ---------- */

type Box = {x: number; y: number; w: number; h: number; max: number};
const BOX: Box = {x: 40, y: 250, w: 820, h: 700, max: 450};
const mx = (b: Box, i: number, n = ALL.length) => b.x + (i / (n - 1)) * b.w;
const my = (b: Box, v: number) => b.y + b.h - (v / b.max) * b.h;
const linePath = (b: Box, vals: number[], upto = vals.length - 1) => vals.slice(0, Math.floor(upto) + 1).map((v, i) => `${i ? 'L' : 'M'}${mx(b, i, vals.length).toFixed(1)} ${my(b, v).toFixed(1)}`).join(' ');
/** The chart: role bands, grid, the orange line (drawn up to month `upto`), the area under it. */
const Curve: React.FC<{b?: Box; upto?: number; bands?: number; vpGlow?: number; grid?: boolean; years?: boolean; sw?: number}> = ({b = BOX, upto = ALL.length - 1, bands = 0.9, vpGlow = 0, grid = true, years = true, sw = 7}) => {
  const band = (i0: number, i1: number, fill: string) => <rect x={mx(b, i0)} y={b.y} width={mx(b, i1) - mx(b, i0)} height={b.h} fill={fill} opacity={bands} />;
  const d = linePath(b, ALL, upto);
  const area = `${d} L${mx(b, Math.floor(upto)).toFixed(1)} ${b.y + b.h} L${b.x} ${b.y + b.h} Z`;
  return <svg width={900} height={1080} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
    <defs><linearGradient id="burn-area" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={P.line} stopOpacity={0.35} /><stop offset="1" stopColor={P.line} stopOpacity={0.02} /></linearGradient></defs>
    {band(0, 11.5, '#18181B')}{band(11.5, 42.5, P.fsBand)}{band(42.5, 78.5, P.pBand)}{band(78.5, ALL.length - 1, P.vpBand)}
    {vpGlow > 0 && <rect x={mx(b, 78.5)} y={b.y} width={mx(b, ALL.length - 1) - mx(b, 78.5)} height={b.h} fill={P.vp} opacity={0.18 * vpGlow} />}
    {grid && [100, 200, 300, 400].map((v) => <g key={v}><line x1={b.x} x2={b.x + b.w} y1={my(b, v)} y2={my(b, v)} stroke={P.grid} strokeWidth={2} opacity={0.7} />
      <text x={b.x + 6} y={my(b, v) - 8} fontFamily={mono} fontSize={22} fill={P.dim}>{v}</text></g>)}
    <path d={area} fill="url(#burn-area)" />
    <path d={d} fill="none" stroke={P.line} strokeWidth={sw} strokeLinejoin="round" strokeLinecap="round" />
    {years && [2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026].map((y, i) => <text key={y} x={mx(b, i * 12)} y={b.y + b.h + 40} textAnchor="middle" fontFamily={mono} fontWeight={700} fontSize={24} fill={P.dim}>{y}</text>)}
  </svg>;
};
const Dot: React.FC<{x: number; y: number; r?: number; c?: string; f: number}> = ({x, y, r = 12, c = P.peak, f}) => <>
  <div style={{position: 'absolute', left: x - r * 2.2, top: y - r * 2.2, width: r * 4.4, height: r * 4.4, borderRadius: '50%', background: c, opacity: 0.25 + 0.1 * Math.sin(f / 4)}} />
  <div style={{position: 'absolute', left: x - r, top: y - r, width: r * 2, height: r * 2, borderRadius: '50%', background: c, boxShadow: '0 0 0 4px rgba(17,24,39,0.8)'}} />
</>;
const Note: React.FC<{text: React.ReactNode; w?: number; c?: string; rot?: number; size?: number}> = ({text, w = 300, c = P.need, rot = -4, size = 42}) => (
  <div style={{width: w, padding: '22px 22px 26px', background: c, transform: `rotate(${rot}deg)`, boxShadow: '0 14px 26px rgba(0,0,0,0.35)', fontFamily: font, fontWeight: 900, fontSize: size, color: P.ink, lineHeight: 1.15}}>{text}</div>
);

/* ---------- 1 hook: AI was supposed to mean less work — and then August: 427 ---------- */

const hookPlan = (cue: Cue) => ({a: cue('a', 38), b: cue('b', 68), c: cue('c', 143)});
const Hook: Scene = ({f, cue}) => {
  const p = hookPlan(cue);
  const n427 = p.b + 46; // "427" is said here
  const cam0 = camAt(f, [[-1, {x: 450, y: 540, z: 1.0}, 1], [p.a, {x: 660, y: 420, z: 1.3}, 26], [p.c - 6, {x: 450, y: 540, z: 1.0}, 24]]);
  const cam = {...cam0, y: cam0.y + shake(f, p.a + 4, 9)};
  const top = {x: mx(BOX, AUG26), y: my(BOX, 427)}, old = {x: mx(BOX, APR20), y: my(BOX, 319)};
  // the sticky note on top of the spike: pressed, then launched
  const fly = clamp((f - (p.a + 2)) / 22);
  const noteX = top.x - 640 + fly * 760, noteY = top.y + 40 - fly * 600 + fly * fly * 260, noteR = -6 + Math.sin(f / 3) * (f < p.a ? 2 : 0) + fly * 160;
  return <>
    {stage(cam, <>
      <Curve />
      <Dot x={top.x} y={top.y} f={f} />
      {/* the old high, and a level line across to now */}
      <Dot x={old.x} y={old.y} r={9} c={P.dim} f={f} />
      <Abs x={old.x - 40} y={old.y - 72}><div style={{fontFamily: mono, fontWeight: 800, fontSize: 34, color: P.dim}}>319</div></Abs>
      {f > p.c - 4 && <svg width={900} height={1080} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
        <line x1={old.x} y1={old.y} x2={old.x + (top.x - old.x) * ramp(f, p.c - 4, p.c + 16)} y2={old.y} stroke={P.dim} strokeWidth={4} strokeDasharray="12 10" />
      </svg>}
      <Abs x={old.x + 30} y={old.y + 14} w={420}><In f={f} at={p.c + 10}><div style={{fontFamily: font, fontWeight: 800, fontSize: 30, color: P.dim}}>此前最高：2020 年 4 月 319</div></In></Abs>
      <Abs x={BOX.x} y={BOX.y + BOX.h + 74} w={820}><div style={{fontFamily: font, fontWeight: 700, fontSize: 24, color: P.dim}}>每月 GitHub 贡献（commit + PR + review + issue，含私有）· 据 @Orestis Ioannou</div></Abs>
    </>, <>
      {/* 427 */}
      <Abs x={top.x - 350} y={top.y - 150} w={320} style={{textAlign: 'right'}}>
        {f < p.b ? <div style={{fontFamily: mono, fontWeight: 900, fontSize: 130, color: P.peak, lineHeight: 1}}>427</div>
          : <Roll f={f} start={p.b} land={n427} from={104} to={427} size={130} color={P.peak} family={mono} />}
        <div style={{fontFamily: mono, fontWeight: 800, fontSize: 34, color: P.line, marginTop: 4}}>Aug 2026</div>
      </Abs>
      {fly < 1 && <div style={{position: 'absolute', left: noteX, top: noteY, transform: `rotate(${noteR}deg)`, opacity: 1 - clamp((fly - 0.7) * 3.3)}}>
        <Note text={<>AI：<br />让你少干活</>} c="#FFF3B0" w={290} />
      </div>}
    </>)}
  </>;
};
Hook.backdrop = backdrop('dark');
Hook.sfx = (cue) => {
  const p = hookPlan(cue);
  return [{at: 0, kind: 'tap', gain: 0.1}, {at: p.a + 2, kind: 'whoosh', gain: 0.12}, {at: p.a + 4, kind: 'fs-impact-deep', gain: 0.14}, {at: p.b + 46, kind: 'pop', gain: 0.1}, {at: p.c, kind: 'whoosh-short', gain: 0.07}];
};

/* ---------- 2 vp: he is VP of Technology — on paper, his graph should be low ---------- */

const vpPlan = (cue: Cue) => ({a: cue('a', 20), b: cue('b', 63)});
const Vp: Scene = ({f, cue, dur}) => {
  const p = vpPlan(cue);
  const cam = camAt(f, [[-1, {x: 450, y: 500, z: 0.96}, 1], [p.a - 4, {x: 520, y: 520, z: 1.02}, 20], [p.b, {x: 560, y: 530, z: 1.06}, dur - p.b]]);
  const paper = ramp(f, p.b - 2, p.b + 22);
  const pAvg = my(BOX, 114);
  return <>
    {stage(cam, <>
      <Curve bands={1} vpGlow={ramp(f, p.a, p.a + 12)} />
      {/* role labels from his chart */}
      {[['Full Stack Engineer', 27, P.dim], ['Principal Engineer', 60.5, P.blue], ['VP of Tech', 86, P.vp]].map(([t, i, c], k) => (
        <Abs key={t as string} x={mx(BOX, i as number) - 160} y={BOX.y + 16} w={320} style={{textAlign: 'center'}}>
          <In f={f} at={-6 + k * 5}><div style={{fontFamily: font, fontWeight: 800, fontSize: k === 2 ? 34 : 28, color: c as string}}>{t}</div></In>
        </Abs>))}
      <Abs x={mx(BOX, 78.5) - 10} y={BOX.y + 70} w={200}><In f={f} at={p.a + 4}><div style={{fontFamily: font, fontWeight: 900, fontSize: 30, color: P.vp, lineHeight: 1.2}}>他现在的位置</div></In></Abs>
      {/* "on paper": the Principal years' level, carried on across */}
      <svg width={900} height={1080} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
        <line x1={mx(BOX, 42.5)} y1={pAvg} x2={mx(BOX, 42.5) + (mx(BOX, ALL.length - 1) - mx(BOX, 42.5)) * paper} y2={pAvg} stroke={P.blue} strokeWidth={6} strokeDasharray="16 12" />
      </svg>
      <Abs x={mx(BOX, 45)} y={pAvg + 30}><In f={f} at={p.b + 6}><div style={{display: 'inline-block', fontFamily: mono, fontWeight: 800, fontSize: 30, color: P.blue, background: 'rgba(17,24,39,0.9)', padding: '4px 12px', borderRadius: 8, whiteSpace: 'nowrap'}}>Principal 时期平均 114 / 月</div></In></Abs>
    </>)}
    {/* the original chart, pinned top-left: this is his */}
      <Abs x={10} y={-30}><In f={f} at={-8} dy={-30}><div style={{width: 470, background: P.bg, padding: 8, borderRadius: 10, boxShadow: '0 16px 30px rgba(0,0,0,0.5)', transform: 'rotate(-2deg)', border: '2px solid #374151'}}>
        <Img src={CHART} style={{width: '100%', display: 'block', borderRadius: 6}} /><div style={{textAlign: 'right', fontFamily: font, fontSize: 20, color: P.dim, marginTop: 4}}>@Orestis Ioannou｜原图</div></div></In></Abs>
    <Abs x={520} y={-30} w={370}><In f={f} at={p.b + 2}><div style={{fontFamily: hand, fontSize: 38, color: P.text, lineHeight: 1.2, background: 'rgba(17,24,39,0.85)', padding: '8px 12px', borderRadius: 10}}>“On paper my graph should look like my Principal Engineer years, or lower.”</div></In></Abs>
  </>;
};
Vp.backdrop = backdrop('dark');
Vp.sfx = (cue) => {
  const p = vpPlan(cue);
  return [{at: 0, kind: 'whoosh-short', gain: 0.06}, {at: p.a, kind: 'chime', gain: 0.07}, {at: p.b, kind: 'fs-whoosh-wipe', gain: 0.07}];
};

/* ---------- 3 why: several agents at once; none needs him all the time, every one needs him sometimes ---------- */

const whyPlan = (cue: Cue) => ({a: cue('a', 48), b: cue('b', 96), c: cue('c', 138), d: cue('d', 182)});
const AGENTS: {label: string; x: number; y: number}[] = [{label: '实现一个改动', x: 40, y: 520}, {label: '查线上问题', x: 40, y: 700}, {label: '审一个 PR', x: 610, y: 520}, {label: '做调研', x: 610, y: 700}];
/** Which agent is calling at frame f (and since when): one after another, faster after `c`. */
const caller = (f: number, b: number, c: number) => {
  if (f < b) return {i: -1, since: 0};
  const order = [2, 0, 3, 1, 2, 3, 0, 1, 2, 0, 3, 1];
  let t = b, k = 0;
  while (k < order.length - 1) {
    const step = t < c ? 22 : 12;
    if (f < t + step) break;
    t += step; k++;
  }
  return {i: order[k], since: t};
};
const Why: Scene = ({f, cue}) => {
  const p = whyPlan(cue);
  const {i: who, since} = caller(f, p.b, p.c);
  // while they call, the camera swings to whoever is calling; then it settles on his head for the swap
  const aim = (i: number) => ({x: 450 + (AGENTS[i].x > 450 ? 150 : -150), y: AGENTS[i].y + 60, z: 1.22});
  const base = (fr: number) => camAt(fr, [[-1, {x: 450, y: 600, z: 1.08}, 1], [p.a - 6, {x: 450, y: 560, z: 0.96}, 22]]);
  const followAt = (fr: number): Cam2 => {
    const c = caller(fr, p.b, p.c);
    if (c.i < 0) return base(fr);
    const prev = caller(c.since - 1, p.b, p.c).i, from = prev >= 0 ? aim(prev) : base(c.since), to = aim(c.i), k = ease.inOutCubic(clamp((fr - c.since) / 8));
    return {x: from.x + (to.x - from.x) * k, y: from.y + (to.y - from.y) * k, z: from.z + (to.z - from.z) * k};
  };
  const settle = ramp(f, p.d - 4, p.d + 12), last = followAt(Math.min(f, p.d - 5)), head = {x: 400, y: 640, z: 1.18};
  const cam = {x: last.x + (head.x - last.x) * settle, y: last.y + (head.y - last.y) * settle, z: last.z + (head.z - last.z) * settle};
  const ag = who >= 0 ? AGENTS[who] : null;
  // the engineer: typing until the agents start calling; then turns to each one and reaches out
  const typing: Pose = {...POSE_SIT, look: 0.9, armNear: [-46 + 4 * Math.sin(f * 1.3), -70], armFar: [-50 + 4 * Math.sin(f * 1.3 + 1), -66]};
  const toward = ag ? (ag.x > 450 ? 1 : -1) : 1;
  const reachK = ag ? ramp(f, since, since + 7) : 0;
  const reach: Pose = {...POSE_SIT, look: toward, head: toward * 8 + (ag && ag.y < 600 ? -10 : 6), armNear: [-110 * reachK - 30 * (1 - reachK), -20], armFar: [-40, -60], eyes: f > p.c ? 0.7 : 1, mouth: -0.2};
  const pose = f < p.b ? typing : reach;
  const facing: 1 | -1 = ag && ag.x < 450 ? -1 : 1;
  const swap = f >= p.d ? Math.floor((f - p.d) / 9) : -1;
  return <>
    {stage(cam, <>
      {/* the real thing: Parallel Code switching between waiting agents */}
      <Abs x={50} y={30}><In f={f} at={-8} dy={-40}>
        <div style={{width: 800, borderRadius: 16, overflow: 'hidden', boxShadow: '0 30px 60px rgba(0,0,0,0.55)', border: '2px solid #2A333D'}}>
          <div style={{position: 'relative', width: 800, height: 450, background: '#080C10'}}>
            <OffthreadVideo src={CLIP} muted trimBefore={0} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
            <div style={{position: 'absolute', right: 0, bottom: 0, background: 'rgba(8,12,16,0.85)', color: '#fff', fontFamily: font, fontWeight: 700, fontSize: 24, padding: '4px 12px'}}>@Parallel Code｜案例展示</div>
          </div>
        </div>
      </In></Abs>
      {/* the desk */}
      <div style={{position: 'absolute', left: 250, top: 880, width: 400, height: 22, background: '#3B4556', borderRadius: 6}} />
      <div style={{position: 'absolute', left: 280, top: 900, width: 14, height: 120, background: '#2B3341'}} /><div style={{position: 'absolute', left: 606, top: 900, width: 14, height: 120, background: '#2B3341'}} />
      <div style={{position: 'absolute', left: 470, top: 760, width: 150, height: 104, background: '#0B1018', border: '6px solid #3B4556', borderRadius: 8, overflow: 'hidden'}}>
        <svg width={138} height={92}><path d={linePath({x: 6, y: 10, w: 126, h: 72, max: 450}, ALL)} fill="none" stroke={P.line} strokeWidth={3} /></svg>
      </div>
      <div style={{position: 'absolute', left: 532, top: 864, width: 26, height: 18, background: '#3B4556'}} />
      {/* chair */}
      <div style={{position: 'absolute', left: 330, top: 840, width: 90, height: 18, background: '#2B3341', borderRadius: 8}} />
      <div style={{position: 'absolute', left: 368, top: 856, width: 12, height: 160, background: '#2B3341'}} />
      <Person x={380} y={836} s={0.9} facing={facing} pose={pose} {...ENGINEER} shadow={false} />
      {/* the thought box above his head: problems swapped in and out */}
      {f >= p.d - 4 && <Abs x={300} y={430}><In f={f} at={p.d - 4}>
        <div style={{width: 170, height: 120, borderRadius: 18, background: P.panel, border: `4px solid ${P.agent}`, position: 'relative', overflow: 'hidden'}}>
          {[0, 1].map((k) => {
            const s = swap - k; if (s < 0) return null;
            const icons = ['{ }', 'repo', 'diff', '?', 'PR', 'log'];
            const t = clamp(((f - p.d) % 9) / 6);
            return <div key={k} style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: mono, fontWeight: 900, fontSize: 46, color: P.agent,
              transform: `translateY(${(k === 0 ? 1 - t : -t) * 100}%)`}}>{icons[s % icons.length]}</div>;
          })}
        </div>
        <div style={{position: 'absolute', left: 60, top: 124, width: 18, height: 18, borderRadius: 9, background: P.agent}} />
      </In></Abs>}
    </>, <>
      {/* the agents around him */}
      {AGENTS.map((a, k) => {
        const calling = who === k;
        const c = calling ? P.need : P.agent;
        const bump = calling ? 1 + 0.08 * Math.max(0, 1 - (f - since) / 6) : 1;
        return <Abs key={a.label} x={a.x} y={a.y + (k % 2 ? 6 : 0) * Math.sin(f / 9 + k)}><In f={f} at={p.a + k * 4} dy={30}>
          <div style={{width: 250, borderRadius: 16, background: P.panel, border: `4px solid ${c}`, padding: '14px 16px', boxShadow: calling ? `0 0 30px ${P.need}` : '0 10px 20px rgba(0,0,0,0.4)', transform: `scale(${bump})`}}>
            <div style={{display: 'flex', alignItems: 'center', gap: 10}}>
              <div style={{width: 18, height: 18, borderRadius: 9, background: c}} />
              <div style={{fontFamily: mono, fontWeight: 800, fontSize: 22, color: P.dim}}>agent {k + 1}</div>
            </div>
            <div style={{fontFamily: font, fontWeight: 900, fontSize: 32, color: P.text, marginTop: 8}}>{a.label}</div>
            <div style={{fontFamily: font, fontWeight: 900, fontSize: 30, color: calling ? P.need : P.agentDeep, marginTop: 6}}>{calling ? '● 需要你' : '工作中…'}</div>
          </div>
        </In></Abs>;
      })}
      <Abs x={330} y={980}><In f={f} at={p.d + 10}><div style={{display: 'flex', gap: 12, fontFamily: mono, fontWeight: 900, fontSize: 40, color: P.text}}>
        {['Ctrl', '+', 'Tab'].map((k) => <div key={k} style={k === '+' ? {} : {background: '#2A333D', border: '3px solid #4B5563', borderRadius: 10, padding: '4px 16px', boxShadow: '0 6px 0 #0B0F14'}}>{k}</div>)}
      </div></In></Abs>
    </>)}
  </>;
};
Why.backdrop = backdrop('dark');
Why.sfx = (cue) => {
  const p = whyPlan(cue);
  const pings: number[] = [];
  for (let f = p.b; f < p.d; ) { pings.push(f); f += f < p.c ? 22 : 12; }
  return [{at: 0, kind: 'tap', gain: 0.06}, ...[0, 1, 2, 3].map((k) => ({at: p.a + k * 4, kind: 'pop', gain: 0.06})),
    ...pings.map((at, k) => ({at, kind: 'fs-phone-buzz', gain: 0.05 + 0.005 * k})), {at: p.d + 10, kind: 'tick', gain: 0.08}];
};

/* ---------- 4 cheap: code got cheap — the pile of things worth taking on grows past him ---------- */

const cheapPlan = (cue: Cue) => ({a: cue('a', 35), b: cue('b', 82)});
const NOTES = ['顺手重构', '修个小 bug', '“just a quick prompt”', '新点子', '试试新模型', '一个新项目', '优化一下', '再开个 agent', '补个测试', '又一个实验', '“just a quick prompt”', '新项目'];
const Cheap: Scene = ({f, cue, dur}) => {
  const p = cheapPlan(cue);
  const every = 7, start = 4;
  const n = Math.min(NOTES.length, Math.max(0, Math.floor((f - start) / every) + 1));
  const cam = camAt(f, [[-1, {x: 450, y: 640, z: 1.05}, 1], [p.a, {x: 470, y: 520, z: 0.96}, 30], [p.b, {x: 480, y: 420, z: 0.86}, dur - p.b]]);
  const look = clamp((n - 5) / 6);
  return <>
    {stage(cam, <>
      {/* the pile: notes stack up from the floor */}
      {Array.from({length: n}, (_, i) => {
        const t = clamp((f - (start + i * every)) / 8);
        const y = 940 - i * 74 - (1 - ease.outCubic(t)) * 300, x = 470 + (hash(i * 7) - 0.5) * 70, r = (hash(i * 3) - 0.5) * 12;
        const c = ['#FFF3B0', '#FDE68A', '#FBD38D', '#F9E2AF'][i % 4];
        return <div key={i} style={{position: 'absolute', left: x, top: y - 90, transform: `rotate(${r}deg)`, opacity: clamp(t * 3)}}>
          <div style={{width: 330, height: 86, background: c, boxShadow: '0 8px 14px rgba(60,40,10,0.22)', display: 'flex', alignItems: 'center', padding: '0 18px', boxSizing: 'border-box',
            fontFamily: font, fontWeight: 900, fontSize: 34, color: P.ink, whiteSpace: 'nowrap'}}>{NOTES[i]}</div>
        </div>;
      })}
      <Person x={300} y={1030 - 168} s={1} pose={{...POSE_STAND, look: 0.9, head: -18 * look, eyes: 1 + 0.3 * look, mouth: 0.3 - 0.8 * look, armNear: [-30 - 60 * look, -40], armFar: [10, -10]}} {...ENGINEER} />
    </>, <>
      <Abs x={30} y={100} w={520}><In f={f} at={-6}>
        <div style={{fontFamily: hand, fontSize: 46, color: P.ink, lineHeight: 1.2}}>“They made it easy to give myself a much bigger one.”</div>
      </In></Abs>
    </>)}
  </>;
};
Cheap.backdrop = backdrop('warm');
Cheap.sfx = (cue, dur) => {
  const out = [];
  for (let i = 0; i < NOTES.length && 4 + i * 7 < dur; i++) out.push({at: 4 + i * 7, kind: 'paper', gain: 0.06 + 0.004 * i});
  return out;
};

/* ---------- 5 burst: 2026 as three bursts — climb, collapse ---------- */

const burstPlan = (cue: Cue) => ({a: cue('a', 58), b: cue('b', 109)});
const Y26 = [50, ...ALL.slice(84)]; // Dec 2025 … Oct 2026
const B26: Box = {x: 60, y: 260, w: 780, h: 640, max: 460};
const MONTHS = ['12月', '1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月'];
const Burst: Scene = ({f, cue}) => {
  const p = burstPlan(cue);
  const draw = ramp(f, -4, p.a - 6) * (Y26.length - 1);
  const cam = camAt(f, [[-1, {x: 450, y: 600, z: 1.0}, 1], [p.a - 10, {x: 600, y: 440, z: 1.1}, 24], [p.b - 16, {x: 450, y: 560, z: 0.96}, 16]]);
  const pk = {x: mx(B26, 8, Y26.length), y: my(B26, 427)};
  const slump = ramp(f, p.a + 4, p.a + 30);
  const pose: Pose = mixPose({...POSE_STAND, look: 0.6, armNear: [-150, -20], armFar: [-20, -10], mouth: 0.4}, {...POSE_SIT, lean: 22, head: 26, look: 0.3, eyes: 0.2, mouth: -0.6, armNear: [-10, -30], armFar: [-6, -24]}, slump);
  const ann: [number, number, string][] = [[1.5, 277, '①'], [4, 187, '②'], [7.3, 427, '③']];
  return <>
    {stage(cam, <>
      <svg width={900} height={1080} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
        <defs><linearGradient id="burn-mtn" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={P.line} stopOpacity={0.55} /><stop offset="1" stopColor={P.line} stopOpacity={0.04} /></linearGradient></defs>
        {(() => { const d = linePath(B26, Y26, draw); return <>
          <path d={`${d} L${mx(B26, Math.floor(draw), Y26.length)} ${B26.y + B26.h} L${B26.x} ${B26.y + B26.h} Z`} fill="url(#burn-mtn)" />
          <path d={d} fill="none" stroke={P.line} strokeWidth={10} strokeLinejoin="round" strokeLinecap="round" />
        </>; })()}
        <line x1={B26.x} x2={B26.x + B26.w} y1={B26.y + B26.h} y2={B26.y + B26.h} stroke={P.grid} strokeWidth={3} />
        {MONTHS.map((m, i) => <text key={m} x={mx(B26, i, Y26.length)} y={B26.y + B26.h + 42} textAnchor="middle" fontFamily={font} fontWeight={700} fontSize={26} fill={P.dim}>{m}</text>)}
      </svg>
      {Y26.map((v, i) => i <= draw && [1, 4, 6, 8].includes(i) ? <Abs key={i} x={mx(B26, i, Y26.length) - (i === 8 ? 150 : 60)} y={my(B26, v) - (i === 6 ? -18 : i === 8 ? 10 : 58)} w={120} style={{textAlign: 'center'}}>
        <div style={{fontFamily: mono, fontWeight: 800, fontSize: i === 8 ? 44 : 32, color: i === 6 ? P.blue : P.peak}}>{v}</div></Abs> : null)}
      {/* he is on the third peak; and drops */}
      {f > p.a - 14 && <div style={{opacity: ramp(f, p.a - 14, p.a - 6)}}><Person x={pk.x - 6} y={pk.y - (slump > 0.5 ? 60 + 108 * (1 - slump) : 168) * 0.6 + 4} s={0.6} pose={pose} {...ENGINEER} shadow={false} /></div>}
      {ann.map(([i, v, t], k) => <Stamp key={t} x={mx(B26, i, Y26.length)} y={my(B26, v) - 120} f={f} at={p.b + k * 6} size={64} color={P.vp} rot={-8}>{t}</Stamp>)}
    </>)}
    <Abs x={40} y={40} w={820}><In f={f} at={p.a + 8}><div style={{fontFamily: hand, fontSize: 46, color: P.text, lineHeight: 1.2}}>“At the end of a burst, I feel tired of AI.”</div></In></Abs>
  </>;
};
Burst.backdrop = backdrop('dark');
Burst.sfx = (cue) => {
  const p = burstPlan(cue);
  return [{at: 0, kind: 'whoosh', gain: 0.08}, {at: p.a + 6, kind: 'fs-part-seat', gain: 0.1}, ...[0, 1, 2].map((k) => ({at: p.b + k * 6, kind: 'stamp', gain: 0.12}))];
};

/* ---------- 6 end: not against AI — being able to do more keeps turning into doing more; back to 427 ---------- */

const endPlan = (cue: Cue) => ({a: cue('a', 30), b: cue('b', 78)});
const End: Scene = ({f, cue, dur}) => {
  const p = endPlan(cue);
  const cam = camAt(f, [[-1, {x: 640, y: 380, z: 1.25}, 1], [2, {x: 450, y: 420, z: 0.92}, dur - 10]]);
  const top = {x: mx(BOX, AUG26), y: my(BOX, 427)};
  return <>
    {stage(cam, <>
      <Curve />
      <Dot x={top.x} y={top.y} f={f} />
      <Person x={top.x - 4} y={top.y - 8} s={0.5} pose={{...POSE_SIT, lean: 22, head: 26, look: 0.3, eyes: 0.2, mouth: -0.6, armNear: [-10, -30], armFar: [-6, -24]}} {...ENGINEER} shadow={false} />
      <Abs x={top.x - 360} y={top.y - 30} w={320} style={{textAlign: 'right'}}><div style={{fontFamily: mono, fontWeight: 900, fontSize: 110, color: P.peak}}>427</div></Abs>
    </>)}
    <Abs x={40} y={30} w={820}>
        <In f={f} at={-4}><div style={{fontFamily: hand, fontSize: 44, color: P.dim}}>“I am not complaining about the tools.”</div></In>
        <div style={{marginTop: 18, minHeight: 130}}>{f >= p.a - 4 && <Typed f={f} start={p.a - 4} text="Being able to do more keeps turning into doing more. And I am tired." cps={26} size={46} family={mono} weight={800} color={P.text}
          mark="And I am tired." markAt={p.b + 22} markColor="rgba(245,158,11,0.45)" />}</div>
    </Abs>
  </>;
};
End.backdrop = backdrop('dark');
End.sfx = (cue) => {
  const p = endPlan(cue);
  return [{at: 0, kind: 'whoosh-short', gain: 0.06}, {at: p.a - 4, kind: 'fs-paper-slide', gain: 0.06}];
};

/** Cover anchor (880 × 800, rendered at f = 0): the curve, the spike 427 and the note knocked off it. */
const Cover: Scene = ({f}) => {
  const top = {x: mx(BOX, AUG26), y: my(BOX, 427)};
  return <div style={{position: 'absolute', left: 0, top: 0, transform: 'translate(-10px, -200px)'}}>
    <Curve years={false} />
    <Dot x={top.x} y={top.y} f={f} />
    <Abs x={top.x - 360} y={top.y - 40} w={330} style={{textAlign: 'right'}}><div style={{fontFamily: mono, fontWeight: 900, fontSize: 130, color: P.peak}}>427</div></Abs>
    <div style={{position: 'absolute', left: top.x - 380, top: top.y - 260, transform: 'rotate(-14deg)'}}><Note text={<>AI：<br />让你少干活</>} c="#FFF3B0" w={260} size={38} /></div>
  </div>;
};

export const aiMoreWorkBurnoutScenes: Record<string, Scene> = {
  'burn.hook': Hook, 'burn.vp': Vp, 'burn.why': Why, 'burn.cheap': Cheap, 'burn.burst': Burst, 'burn.end': End, 'burn.cover': Cover,
};
