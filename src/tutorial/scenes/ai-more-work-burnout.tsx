import React from 'react';
import {Img, staticFile} from 'remotion';
import {clamp, ease} from '../../fx';
import {font} from '../theme';
import {cond, plex} from '../fonts';
import {Cue, Scene} from '../paper';
import {Brackets, Bug, CornerTag, Credit, Doc, Flash, Ledger, LowerThird, Num, NumBlock, Pk, Plate, QuoteCard, SourceTag, Veil, Vignette, W, eo, fmt, roll, slam} from '../package';

// ai-more-work-burnout, made on the template lemo/caption-news (docs/video-craft/prompt-library/vendor/lemomo-ai__lemo-
// opuscar/3961ddb/styles/caption-news/STYLE.md; picked by prompt-library/选用指南.md §〇: one AI news story led by a big
// number with a turn). "AI Promised Less Work. I Have Never Worked More." — Orestis Ioannou (VP of Technology, Bold.org),
// 2026-10-27, from his own GitHub contribution history. Inputs: inputs/ai-more-work-burnout/ (README.md, REVIEW-DOUYIN.md,
// sources-materials.md, transcript/article_fulltext.md). Storyboard: tutorials/ai-more-work-burnout.storyboard.md.
// - review: "贡献 contributions" (commits + PRs + reviews + issues, incl. private), never "提交"; not "his busiest year"
//   (2020 to the same date had 2,371 > 2,102), only that August's 427 is the busiest month (previous high 319, Apr 2020);
//   he is not against AI; one person's data; no Zhihu figures; Parallel Code footage credited.
// - What the template gives (STYLE.md): sound-off first, the caption card is the subtitle (look.captions "card"), the
//   biggest number in an accent block within the first frames, a source tag whenever a figure or document is up, the
//   document highlighted before its number is believed, ledger cards for charts, a lit grid, a freeze frame with brackets
//   and a white flash, a punch-in with a circle, hard cuts, one grade for all footage, grain in the master.
// - 9:16 (STYLE.md §2: a different layout, not a crop): picture y 300–1150, caption card under it, bug + source tag in the
//   top band. Colours from his chart: ground #111827, the accent is its VP band amber #FBBF24, Principal blue #93C5FD.
// Everything is drawn in the scene backdrop (full frame); the stage stays empty.

export const BURN: Pk = {bg: '#111827', panel: '#141B2B', ink: '#F7F5EF', accent: '#FBBF24', onAccent: '#111827', dim: '#9CA3AF', second: '#93C5FD'};
const k = BURN;
const PIC = {top: 300, h: 850};
const V = (n: string) => `video/ai-more-work-burnout/${n}.mp4`;
const PC = '录屏 @Parallel Code｜案例展示';
const SRC = 'oioannou.com · 2026.10.27';

// His monthly contributions, Jan 2019 … Oct 2026 (Oct partial), read back from the polyline in his SVG on its own scale;
// they match the article (Jan 277, Feb 233, Mar 203, Apr 187, Jun 77, Aug 427, Sep 301, Apr 2020 319, Dec 2025 50).
const ALL = [74, 114, 68, 38, 12, 30, 21, 67, 86, 147, 148, 180, 212, 249, 246, 319, 220, 287, 184, 257, 226, 200, 162, 149, 127, 167, 138, 138, 205, 78, 69, 141, 202, 196, 216, 162,
  111, 126, 171, 122, 76, 109, 109, 117, 122, 167, 150, 118, 125, 151, 71, 56, 135, 108, 72, 87, 111, 105, 95, 73, 147, 196, 105, 167, 91, 73, 148, 118, 107, 99, 89, 86,
  103, 170, 88, 111, 113, 83, 129, 150, 145, 124, 88, 50, 277, 233, 203, 187, 114, 77, 104, 427, 301, 179];
const AUG26 = 91, APR20 = 15;

/** A template scene draws the whole frame in its backdrop; the stage stays empty. */
const make = (draw: NonNullable<Scene['backdrop']>, sfx?: Scene['sfx']): Scene => {
  const S: Scene = () => null;
  S.backdrop = draw;
  S.sfx = sfx;
  return S;
};
const Chrome: React.FC<{f: number; src?: number}> = ({f, src}) => <>
  <Bug k={k} tag="AI 新闻" topic="一个人的 GitHub 账本" en="ONE MAN'S LEDGER" />
  {src !== undefined && <SourceTag k={k} label={SRC} f={f} at={src} />}
</>;
const Base: React.FC<{children: React.ReactNode}> = ({children}) => <div style={{position: 'absolute', inset: 0, background: k.bg, overflow: 'hidden'}}>{children}</div>;
/** A footage band (the picture zone), pushed slowly over the shot. `box` places the source inside the band. */
const Band: React.FC<{src: string; from: number; f: number; dur: number; z?: [number, number]; sat?: number; box?: React.CSSProperties}> = ({src, from, f, dur, z = [1, 1.035], sat = 0.92, box}) => {
  const s = z[0] + (z[1] - z[0]) * ease.inOutCubic(clamp(f / Math.max(1, dur)));
  return <div style={{position: 'absolute', left: 0, top: PIC.top, width: W, height: PIC.h, overflow: 'hidden'}}>
    <div style={{position: 'absolute', inset: 0, transform: `scale(${s})`}}>
      <Plate src={src} video from={from} style={{inset: 0, ...box}} filter={`contrast(1.07) saturate(${sat}) brightness(0.98)`} />
    </div>
  </div>;
};

/* ---------- his curve on a ledger card ---------- */

type Box = {x: number; y: number; w: number; h: number; max: number};
const px = (b: Box, i: number, n: number) => b.x + (i / (n - 1)) * b.w;
const py = (b: Box, v: number) => b.y + b.h - (v / b.max) * b.h;
/** The line drawn segment by segment up to (fractional) index `upto`. */
const path = (b: Box, vals: number[], upto: number) => {
  const n = vals.length, last = Math.min(n - 1, Math.floor(upto)), fr = upto - last;
  const pts = vals.slice(0, last + 1).map((v, i) => [px(b, i, n), py(b, v)]);
  if (last < n - 1 && fr > 0) pts.push([px(b, last + fr, n), py(b, vals[last] + (vals[last + 1] - vals[last]) * fr)]);
  return pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`).join(' ');
};
/** Chart title top left (≤ 6 characters, STYLE.md §5) with one grey Latin line. */
const ChartTitle: React.FC<{zh: string; en: string; y?: number}> = ({zh, en, y = 330}) => <div style={{position: 'absolute', left: 64, top: y}}>
  <div style={{fontFamily: font, fontWeight: 900, fontSize: 64, color: k.ink}}>{zh}</div>
  <div style={{fontFamily: cond, fontWeight: 600, fontSize: 28, color: k.dim, letterSpacing: 1}}>{en}</div>
</div>;
/** The key point: a bigger dot and an expanding ring (0.7 s). */
const Ring: React.FC<{x: number; y: number; f: number; at: number; c?: string}> = ({x, y, f, at, c = k.accent}) => {
  if (f < at) return null;
  const p = eo(f, at, at + 21);
  return <>
    <div style={{position: 'absolute', left: x - 14, top: y - 14, width: 28, height: 28, borderRadius: 14, background: c, boxShadow: `0 0 0 5px ${k.panel}`}} />
    <div style={{position: 'absolute', left: x - 14 - 50 * p, top: y - 14 - 50 * p, width: 28 + 100 * p, height: 28 + 100 * p, borderRadius: '50%', border: `4px solid ${c}`, opacity: 1 - p}} />
  </>;
};
/** A label block (accent fill, ink text; or grey for what doesn't matter), slammed in. */
const Block: React.FC<{x: number; y: number; f: number; at: number; children: React.ReactNode; grey?: boolean; size?: number}> = ({x, y, f, at, children, grey = false, size = 40}) => {
  const s = slam(f, at, 4);
  if (s === null) return null;
  return <div style={{position: 'absolute', left: x, top: y, transformOrigin: '0 50%', transform: `scale(${s})`, background: grey ? 'rgba(156,163,175,0.25)' : k.accent, color: grey ? k.ink : k.onAccent,
    fontFamily: font, fontWeight: 900, fontSize: size, padding: '4px 14px', whiteSpace: 'nowrap', border: grey ? `2px solid ${k.dim}` : 'none'}}>{children}</div>;
};

/* ---------- 1 hook: AI was supposed to mean less work — the number lands, then his chart ---------- */

const hookPlan = (cue: Cue) => ({a: cue('a', 38), b: cue('b', 68), c: cue('c', 143)});
const HB: Box = {x: 96, y: 440, w: 900, h: 560, max: 450};
const Hook = make(({f, cue}) => {
  const p = hookPlan(cue);
  const n427 = p.b + 46; // "427" is said here
  const draw = (ALL.length - 1) * eo(f, p.a, p.a + 40);
  const top = {x: px(HB, AUG26, ALL.length), y: py(HB, 427)}, old = {x: px(HB, APR20, ALL.length), y: py(HB, 319)};
  const lvl = eo(f, p.c, p.c + 14);
  return <Base>
    {f < p.a ? <>
      {/* frames 0–4: the biggest number lands over the board of agents */}
      <Band src={V('board')} from={1.2} f={f} dur={p.a} box={{left: -320, width: 1720}} />
      <div style={{position: 'absolute', left: 0, top: PIC.top, width: W, height: PIC.h, background: 'linear-gradient(90deg, rgba(14,14,12,0.7) 0, rgba(14,14,12,0.25) 70%)'}} />
      <Credit text={PC} bottom={PIC.top + PIC.h} />
      <div style={{position: 'absolute', left: 64, top: 470, transformOrigin: '0 50%', transform: `scale(${slam(f, -4, 4) ?? 1})`, fontFamily: font, fontWeight: 900, fontSize: 70, color: k.ink,
        textShadow: '0 4px 20px rgba(0,0,0,0.6)'}}>今年 8 月 · 一个人</div>
      <NumBlock k={k} f={f} at={-10} to={427} from={0} rollFrames={14} size={250} unit="次贡献" y={570} sep={false} />
      <div style={{position: 'absolute', left: 64, top: 880, fontFamily: plex, fontSize: 26, color: 'rgba(247,245,239,0.8)', letterSpacing: 1}}>GITHUB CONTRIBUTIONS · AUG 2026</div>
    </> : <>
      {/* the ledger card: the whole curve, the spike, the old high */}
      <Ledger k={k} f={f} at={p.a} />
      <ChartTitle zh="每月贡献" en="GitHub contributions per month · 2019–2026" />
      <svg width={W} height={1920} style={{position: 'absolute', inset: 0}}>
        {[100, 200, 300, 400].map((v) => <g key={v}><line x1={HB.x} x2={HB.x + HB.w} y1={py(HB, v)} y2={py(HB, v)} stroke="rgba(255,255,255,0.08)" strokeWidth={2} />
          <text x={HB.x + HB.w} y={py(HB, v) - 10} textAnchor="end" fontFamily={plex} fontSize={22} fill={k.dim}>{v}</text></g>)}
        <path d={`${path(HB, ALL, draw)} L${px(HB, draw, ALL.length)} ${HB.y + HB.h} L${HB.x} ${HB.y + HB.h} Z`} fill={k.accent} opacity={0.1} />
        <path d={path(HB, ALL, draw)} fill="none" stroke={k.ink} strokeWidth={4} strokeLinejoin="round" />
        {[2019, 2021, 2023, 2025].map((yr) => <text key={yr} x={px(HB, (yr - 2019) * 12, ALL.length)} y={HB.y + HB.h + 40} textAnchor="middle" fontFamily={plex} fontSize={24} fill={k.dim}>{yr}</text>)}
        {lvl > 0 && <line x1={old.x} y1={old.y} x2={old.x + (top.x - old.x) * lvl} y2={old.y} stroke={k.dim} strokeWidth={4} strokeDasharray="12 10" />}
      </svg>
      <Ring x={top.x} y={top.y} f={f} at={n427 - 6} />
      <Block x={top.x - 330} y={top.y - 38} f={f} at={n427 - 4} size={52}><span style={{fontFamily: cond, fontWeight: 800}}>{roll(f, n427 - 4, n427 + 6, 427, 300)}</span> · 2026.08</Block>
      {f >= p.c && <><Ring x={old.x} y={old.y} f={f} at={p.c} c={k.dim} />
        <Block x={old.x + 26} y={old.y + 18} f={f} at={p.c + 4} grey size={34}>此前最高 <span style={{fontFamily: cond, fontWeight: 800}}>319</span> · 2020.04</Block>
        <Block x={top.x - 210} y={(top.y + old.y) / 2 - 24} f={f} at={p.c + 14} size={44}><span style={{fontFamily: cond, fontWeight: 800}}>+108</span></Block></>}
      <div style={{position: 'absolute', left: 64, top: 1090, fontFamily: plex, fontSize: 22, color: k.dim, letterSpacing: 0.5}}>COMMITS + PRS + REVIEWS + ISSUES · INCL. PRIVATE</div>
      <Flash f={f} at={p.a} d={3} />
    </>}
    <Veil from={1120} top={false} />
    <Chrome f={f} src={p.a + 4} />
    <Vignette />
  </Base>;
}, (cue) => {
  const p = hookPlan(cue);
  return [{at: 0, kind: 'thud', gain: 0.16}, {at: 0, kind: 'tap', gain: 0.12}, ...Array.from({length: 7}, (_, i) => ({at: i * 2, kind: 'tick', gain: 0.05})),
    {at: p.a, kind: 'whoosh-short', gain: 0.1}, {at: p.a + 2, kind: 'paper', gain: 0.08}, {at: p.b + 42, kind: 'pop', gain: 0.1}, {at: p.c, kind: 'tap', gain: 0.1}, {at: p.c + 14, kind: 'stamp', gain: 0.12}];
});

/* ---------- 2 vp: the document says it — "On paper my graph should look like my Principal Engineer years" ---------- */

const vpPlan = (cue: Cue) => ({a: cue('a', 20), b: cue('b', 63)});
const Vp = make(({f, cue}) => {
  const p = vpPlan(cue);
  const push = 1 + 0.03 * ease.inOutCubic(clamp(f / 120));
  return <Base>
    <Ledger k={k} f={f} at={-4} />
    <div style={{position: 'absolute', inset: 0, transform: `scale(${push})`, transformOrigin: '50% 40%'}}>
      <Doc k={k} f={f} at={-6} y={380} head="AI PROMISED LESS WORK. I HAVE NEVER WORKED MORE. · 2026.10.27" size={46}
        body="Today I lead engineering at Bold.org and do far less feature work than I used to. On paper my graph should look like my Principal Engineer years, or lower. Instead it is back where it was when writing code was my whole job."
        mark="On paper my graph should look like my Principal Engineer years, or lower." markAt={p.b - 2} />
    </div>
    <LowerThird k={k} zh="Orestis Ioannou · Bold.org" en="VP OF TECHNOLOGY · SINCE AUG 2025" y={1010} f={f} at={p.a} />
    <Veil from={1120} top={false} />
    <Chrome f={f} src={0} />
    <Vignette a={0.3} />
  </Base>;
}, (cue) => {
  const p = vpPlan(cue);
  return [{at: 0, kind: 'paper', gain: 0.12}, {at: p.a, kind: 'whoosh-short', gain: 0.08}, {at: p.b - 2, kind: 'fs-paper-slide', gain: 0.1}];
});

/* ---------- 3 why: several agents at once — a lit grid, a freeze on "needs you", Ctrl + Tab ---------- */

const whyPlan = (cue: Cue) => ({a: cue('a', 48), b: cue('b', 96), c: cue('c', 138), d: cue('d', 182)});
// what his agents were doing, from the article: "one implementing a change, one investigating a production question,
// one working through a review, another doing research I will need later"
const AG = [['1', '实现改动', 'IMPLEMENT'], ['2', '查线上问题', 'INVESTIGATE'], ['3', '审代码', 'REVIEW'], ['4', '做调研', 'RESEARCH']] as const;
/** Which panel calls "needs you" at frame f: one after another from b, faster after c. */
const calling = (f: number, b: number, c: number) => {
  if (f < b) return -1;
  const order = [2, 0, 3, 1, 2, 3, 0, 1];
  const i = f < c ? Math.floor((f - b) / 11) : Math.floor((c - b) / 11) + Math.floor((f - c) / 6);
  return order[i % order.length];
};
const Why = make(({f, cue}) => {
  const p = whyPlan(cue);
  const who = calling(f, p.b, p.c);
  if (f >= p.d) {
    // the punch-in: Ctrl + Tab, circled (source 3.0 s, keycap ≈ (965, 850) in the 1920 × 960 frame, up to 1.4×)
    const z = 1.0 + 0.4 * eo(f, p.d, p.d + 9) + 0.08 * clamp((f - p.d - 9) / 80), cx = 965, cy = 850;   // punch, then keep pushing
    const ring = eo(f, p.d + 9, p.d + 21);
    return <Base>
      <div style={{position: 'absolute', left: 0, top: PIC.top, width: W, height: PIC.h, overflow: 'hidden'}}>
        <Plate src={V('ctrl-tab')} video from={3.0} style={{left: 540 - cx * z, top: 425 - cy * z, width: 1920 * z, height: 960 * z}} />
        <svg width={W} height={PIC.h} style={{position: 'absolute', inset: 0}}>
          <ellipse cx={540} cy={425} rx={300} ry={120} fill="none" stroke={k.accent} strokeWidth={8} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - ring} />
        </svg>
      </div>
      <Credit text={PC} bottom={PIC.top + PIC.h} />
      <Block x={64} y={PIC.top + 60} f={f} at={p.d + 18} size={44}>回一个，换一个</Block>
      <Veil from={1120} top={false} />
      <Chrome f={f} />
      <Vignette />
    </Base>;
  }
  if (f >= p.c) {
    // the freeze: the board stops on "Needs you", a white flash, a punch, colour drops, brackets close in, a timecode
    const z = 1.125 * (1 + 0.12 * eo(f, p.c, p.c + 9) + 0.05 * clamp((f - p.c - 9) / 40));   // punch, then a slow push (no frame flat > 1 s)
    return <Base>
      <div style={{position: 'absolute', left: 0, top: PIC.top, width: W, height: PIC.h, overflow: 'hidden'}}>
        <div style={{position: 'absolute', left: -10, top: -30, width: 1920 * z, height: 960 * z}}>
          <Img src={staticFile('images/tutorials/ai-more-work-burnout/needs-you.jpg')} style={{width: '100%', height: '100%', filter: 'contrast(1.1) saturate(0.45) brightness(0.95)'}} />
        </div>
      </div>
      <Brackets k={k} f={f} at={p.c + 3} x={30} y={PIC.top + 20} w={540} h={600} />
      <div style={{position: 'absolute', right: 40, top: PIC.top + 24, background: 'rgba(14,14,12,0.75)', color: k.ink, fontFamily: plex, fontSize: 26, padding: '6px 14px'}}>❚❚ 00:00:01</div>
      <Block x={610} y={PIC.top + 300} f={f} at={p.c + 6} size={60}><span style={{fontFamily: cond, fontWeight: 800}}>3</span> 个在等他</Block>
      <Credit text={PC} bottom={PIC.top + PIC.h} />
      <Veil from={1120} top={false} />
      <Chrome f={f} />
      <Vignette />
      <Flash f={f} at={p.c} d={4} />
    </Base>;
  }
  if (f >= p.a) {
    // the lit grid: four panels rise, staggered; from b each one lights when it needs him
    return <Base>
      {AG.map(([n, zh, en], i) => {
        const x = i % 2 ? 556 : 44, y = PIC.top + 20 + Math.floor(i / 2) * 420, rise = eo(f, p.a + i * 3, p.a + i * 3 + 7);
        const lit = who === i;
        return <div key={n} style={{position: 'absolute', left: x, top: y + (1 - rise) * 120, width: 480, height: 400, opacity: rise, overflow: 'hidden', border: `5px solid ${lit ? k.accent : 'rgba(255,255,255,0.12)'}`,
          boxShadow: lit ? `0 0 40px ${k.accent}88` : 'none', background: '#080C10'}}>
          <Plate src={V('terms')} video from={2 + i * 2.5} style={{left: -(i % 2) * 520 - 120, top: -Math.floor(i / 2) * 200 - 80, width: 1152 * 1.2, height: 576 * 1.2}}
            filter={`contrast(1.07) saturate(${lit ? 0.92 : 0.5}) brightness(${lit ? 1 : 0.7})`} />
          <div style={{position: 'absolute', left: 0, bottom: 0, right: 0, padding: '10px 14px', background: 'linear-gradient(0deg, rgba(14,14,12,0.92), rgba(14,14,12,0))'}}>
            <div style={{display: 'flex', alignItems: 'center', gap: 10}}>
              <span style={{background: lit ? k.accent : k.dim, color: k.onAccent, fontFamily: cond, fontWeight: 800, fontSize: 34, padding: '0 10px'}}>{n}</span>
              <span style={{fontFamily: font, fontWeight: 900, fontSize: 40, color: lit ? k.accent : k.ink}}>{zh}</span>
            </div>
            <div style={{fontFamily: cond, fontWeight: 600, fontSize: 24, color: k.dim, letterSpacing: 1}}>{en}</div>
          </div>
          {lit && <div style={{position: 'absolute', right: 12, top: 12, background: k.accent, color: k.onAccent, fontFamily: font, fontWeight: 900, fontSize: 34, padding: '2px 12px'}}>需要你</div>}
        </div>;
      })}
      <CornerTag k={k} text="据原文 · 他同时开着的 agent" f={f} at={p.a + 10} y={PIC.top + PIC.h - 14} />
      <Veil from={1150} top={false} />
      <Chrome f={f} />
      <Vignette a={0.3} />
    </Base>;
  }
  return <Base>
    <Band src={V('terms')} from={0} f={f} dur={p.a} box={{left: -320, width: 1720}} />
    <Credit text={PC} bottom={PIC.top + PIC.h} />
    <Veil from={1000} />
    <Chrome f={f} />
    <Vignette />
  </Base>;
}, (cue) => {
  const p = whyPlan(cue);
  const pings: number[] = [];
  for (let f = p.b; f < p.c; f += 11) pings.push(f);
  return [{at: 0, kind: 'tap', gain: 0.08}, ...[0, 1, 2, 3].map((i) => ({at: p.a + i * 3, kind: 'pop', gain: 0.07})), ...pings.map((at) => ({at, kind: 'fs-phone-buzz', gain: 0.05})),
    {at: p.c, kind: 'fs-wind-click', gain: 0.16}, {at: p.c + 6, kind: 'stamp', gain: 0.1}, {at: p.d, kind: 'whoosh-short', gain: 0.1}, {at: p.d + 3, kind: 'tick', gain: 0.1}, {at: p.d + 18, kind: 'tap', gain: 0.08}];
});

/* ---------- 4 cheap: the document again — "a much bigger one" ---------- */

const cheapPlan = (cue: Cue) => ({a: cue('a', 35), b: cue('b', 82)});
const Cheap = make(({f, cue}) => {
  const p = cheapPlan(cue);
  const push = 1 + 0.04 * ease.inOutCubic(clamp(f / 130));
  return <Base>
    <Ledger k={k} f={f} at={-6} />
    <div style={{position: 'absolute', inset: 0, transform: `scale(${push})`, transformOrigin: '50% 45%'}}>
      <Doc k={k} f={f} at={-6} y={360} rot={1.2} head="WHAT CHANGED · 2026.10.27" size={46}
        body="When coding is cheap, I can fix bugs I would previously have left alone … take on new projects. Agents did not just make my existing workload faster to finish. They made it easy to give myself a much bigger one."
        mark="They made it easy to give myself a much bigger one." markAt={p.b} />
    </div>
    <Veil from={1120} top={false} />
    <Chrome f={f} src={2} />
    <Vignette a={0.3} />
  </Base>;
}, (cue) => {
  const p = cheapPlan(cue);
  return [{at: 0, kind: 'whoosh-short', gain: 0.08}, {at: 2, kind: 'paper', gain: 0.1}, {at: p.b, kind: 'fs-paper-slide', gain: 0.1}];
});

/* ---------- 5 burst: 2026 month by month — three bursts ---------- */

const burstPlan = (cue: Cue) => ({a: cue('a', 58), b: cue('b', 109)});
const Y26 = [50, ...ALL.slice(84)]; // Dec 2025 … Oct 2026
const BB: Box = {x: 110, y: 560, w: 860, h: 470, max: 450};
const MONTHS = ['12', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];
const Burst = make(({f, cue}) => {
  const p = burstPlan(cue);
  const draw = (Y26.length - 1) * eo(f, 0, p.a - 6);
  const n = Y26.length, pt = (i: number) => ({x: px(BB, i, n), y: py(BB, Y26[i])});
  return <Base>
    <Ledger k={k} f={f} at={-6} />
    <ChartTitle zh="今年每月" en="Contributions per month · Dec 2025 – Oct 2026" />
    <svg width={W} height={1920} style={{position: 'absolute', inset: 0}}>
      {[100, 200, 300, 400].map((v) => <line key={v} x1={BB.x} x2={BB.x + BB.w} y1={py(BB, v)} y2={py(BB, v)} stroke="rgba(255,255,255,0.08)" strokeWidth={2} />)}
      <path d={`${path(BB, Y26, draw)} L${px(BB, draw, n)} ${BB.y + BB.h} L${BB.x} ${BB.y + BB.h} Z`} fill={k.accent} opacity={0.14} />
      <path d={path(BB, Y26, draw)} fill="none" stroke={k.ink} strokeWidth={5} strokeLinejoin="round" />
      {MONTHS.map((m, i) => <text key={i} x={px(BB, i, n)} y={BB.y + BB.h + 40} textAnchor="middle" fontFamily={plex} fontSize={24} fill={i === 8 ? k.accent : k.dim}>{m}月</text>)}
    </svg>
    {[[1, 277, 6], [4, 187, 36], [8, 427, 70]].map(([i, v, at]) => draw >= i ? <React.Fragment key={i}>
      <Ring x={pt(i).x} y={pt(i).y} f={f} at={at} />
      <div style={{position: 'absolute', left: pt(i).x - 60, top: pt(i).y - 72, width: 120, textAlign: 'center'}}><Num v={fmt(v)} size={i === 8 ? 64 : 48} color={k.ink} /></div>
    </React.Fragment> : null)}
    {draw >= 6 && <Block x={pt(6).x - 70} y={pt(6).y + 26} f={f} at={52} grey size={32}>6 月 <span style={{fontFamily: cond, fontWeight: 800}}>77</span></Block>}
    {[[1.5, 277], [4, 187], [8, 427]].map(([i, v], j) => <Block key={j} x={px(BB, i, n) - 34} y={py(BB, v) - (j === 2 ? 190 : 150)} f={f} at={p.b + j * 5} size={54}>
      <span style={{fontFamily: cond, fontWeight: 800}}>{j + 1}</span></Block>)}
    <LowerThird k={k} zh="“At the end of a burst, I feel tired of AI.”" y={1040} f={f} at={p.a + 2} />
    <Veil from={1150} top={false} />
    <Chrome f={f} src={2} />
    <Vignette a={0.3} />
  </Base>;
}, (cue) => {
  const p = burstPlan(cue);
  return [{at: 0, kind: 'whoosh-short', gain: 0.08}, {at: 6, kind: 'pop', gain: 0.07}, {at: 36, kind: 'pop', gain: 0.07}, {at: 70, kind: 'thud', gain: 0.12},
    {at: p.a + 2, kind: 'tap', gain: 0.08}, ...[0, 1, 2].map((j) => ({at: p.b + j * 5, kind: 'stamp', gain: 0.12}))];
});

/* ---------- 6 end: the verdict over the footage, in his words ---------- */

const endPlan = (cue: Cue) => ({a: cue('a', 30), b: cue('b', 78)});
const End = make(({f, cue, dur}) => {
  const p = endPlan(cue);
  return <Base>
    <Band src={V('board')} from={2} f={f} dur={dur} z={[1.04, 1.1]} sat={0.4} box={{left: -320, width: 1720}} />
    <div style={{position: 'absolute', left: 0, top: PIC.top, width: W, height: PIC.h, background: 'rgba(14,14,12,0.55)'}} />
    <Credit text={PC} bottom={PIC.top + PIC.h} />
    <QuoteCard k={k} f={f} at={-4} y={PIC.top + 40} size={70} lines={['Being able to do more', 'keeps turning into', 'doing more.', 'And I am tired.']} mark="And I am tired." markAt={p.b + 10}
      who="ORESTIS IOANNOU · 2026.10.27" />
    <div style={{position: 'absolute', left: 64, top: PIC.top + PIC.h - 70, fontFamily: plex, fontSize: 26, color: k.dim, opacity: eo(f, p.a - 20, p.a)}}>“I AM NOT COMPLAINING ABOUT THE TOOLS.”</div>
    <Veil from={1120} top={false} />
    <Chrome f={f} />
    <Vignette />
  </Base>;
}, (cue) => {
  const p = endPlan(cue);
  return [{at: 0, kind: 'paper', gain: 0.06}, {at: p.b + 10, kind: 'fs-paper-slide', gain: 0.08}];
});

/** Cover anchor (880 × 800, f = 0): the number block over his curve. */
const Cover: Scene = () => <div style={{position: 'absolute', left: 0, top: 0, width: 880, height: 800, background: k.bg, overflow: 'hidden'}}>
  <svg width={880} height={800} style={{position: 'absolute', inset: 0}}>
    <path d={path({x: 0, y: 360, w: 880, h: 420, max: 450}, ALL, ALL.length - 1)} fill="none" stroke={k.ink} strokeWidth={4} opacity={0.85} />
  </svg>
  <div style={{position: 'absolute', left: 20, top: 60, display: 'flex', alignItems: 'flex-end', gap: 14, background: k.accent, padding: '8px 22px 4px 18px'}}>
    <Num v="427" size={250} color={k.onAccent} /><span style={{fontFamily: font, fontWeight: 900, fontSize: 92, color: k.onAccent, paddingBottom: 24}}>次贡献</span>
  </div>
</div>;

export const aiMoreWorkBurnoutScenes: Record<string, Scene> = {
  'burn.hook': Hook, 'burn.vp': Vp, 'burn.why': Why, 'burn.cheap': Cheap, 'burn.burst': Burst, 'burn.end': End, 'burn.cover': Cover,
};
