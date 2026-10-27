import React from 'react';
import {Img, staticFile} from 'remotion';
import {clamp, ease, hash} from '../../fx';
import {font, mono} from '../theme';
import {Cue, Scene} from '../paper';
import {Cam2, ContactShadow, Ground, Layer, Stamp, Sticker, Typed, camAt, hand, pop, ramp} from '../props';

// openai-eth-false: OpenAI says its model refuted the Exponential Time Hypothesis (2026-10-26). From
// inputs/openai-eth-false/ (materials.md, sources.md, raw/letter.txt, review.md, REVIEW-DOUYIN.md). Case A.
// Storyboard: tutorials/openai-eth-false.storyboard.md.
// - review: "OpenAI 声称", never "proved"; the three researchers organise an independent examination — not an endorsement
//   (letter: "should not be taken as certification"); ≠ P=NP, no claim of practical speed-ups; Lean checked a weaker
//   bound; nothing that only TNW reports; Zane not named.
// - One object: a stone labelled ETH under a tower of papers. It cracks; the tower wobbles but stands (the letter: the
//   reductions and techniques "retain their value"). The idea itself is one chart: exponential / the new bound /
//   polynomial (illustrative shapes, labelled 示意).
// - Colours from the material: the OpenAI page image's warm gradient (#FBC137 → #FAA675 → #FCA29A) = "OpenAI's claim";
//   the paper's white / black; GitHub link blue #0969DA = Lean; a dark ground for the stone. Red only for 2ⁿ.
// Stage 900 × 1080 (frame "full"); the ground and header are each scene's backdrop (1080 × 1920).

const P = {dark: '#14161C', paper: '#FFFFFF', ink: '#111111', muted: '#6A6F78', red: '#E5484D', blue: '#0969DA', poly: '#7A8699',
  y: '#FBC137', peach: '#FAA675', pink: '#FCA29A', stone: '#8C8F96'};
const IMG = (n: string) => staticFile(`images/tutorials/openai-eth-false/${n}.jpg`);

type Mode = 'dark' | 'paper' | 'openai';
const backdrop = (mode: Mode | ((f: number, cue: Cue) => Mode)): Scene['backdrop'] => {
  const B: NonNullable<Scene['backdrop']> = ({f, cue}) => {
    const m = typeof mode === 'function' ? mode(f, cue) : mode;
    const dark = m === 'dark';
    return <>
      {m === 'openai'
        ? <div style={{position: 'absolute', inset: 0, background: `linear-gradient(115deg, ${P.y} 0%, ${P.peach} 45%, ${P.pink} 100%)`}} />
        : <Ground a={dark ? P.dark : '#F4F4F2'} b={dark ? P.dark : '#F4F4F2'} k={0} t={f / 30} light={dark ? 'rgba(255,255,255,0.08)' : undefined} grain={dark ? 0.35 : 0.5} />}
      <div style={{position: 'absolute', left: 72, right: 72, top: 92, display: 'flex', justifyContent: 'space-between', fontFamily: font, fontWeight: 700, fontSize: 28,
        color: dark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)', letterSpacing: 1}}>
        <span>AI 新闻 · 研究</span><span style={{fontWeight: 500, fontSize: 24}}>据 OpenAI 2026-10-26 · 公开信</span>
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
const stage = (cam: Cam2, mid: React.ReactNode) => <Layer cam={cam} depth={1}>{mid}</Layer>;
const shake = (f: number, at: number, amp = 10) => (f < at ? 0 : amp * Math.exp(-(f - at) / 5) * Math.sin((f - at) * 2.4));

/* ---------- the stone and the tower of papers ---------- */

/** The ETH foundation stone with the tower of papers on it. `crack` 0 → 1 draws the crack; `wobble` tilts the tower. */
const Tower: React.FC<{f: number; x: number; y: number; s?: number; crack?: number; wobbleAt?: number}> = ({f, x, y, s = 1, crack = 0, wobbleAt = 1e9}) => {
  const tilt = f < wobbleAt ? 0 : 3.5 * Math.exp(-(f - wobbleAt) / 14) * Math.sin((f - wobbleAt) / 3.2);
  const stacks = [[-150, 15, 0.94], [0, 21, 1], [150, 13, 0.92]] as const;
  return <div style={{position: 'absolute', left: x, top: y, transform: `scale(${s})`, transformOrigin: '0 0'}}>
    <ContactShadow x={0} y={0} w={560} o={0.45} />
    {/* the stone */}
    <div style={{position: 'absolute', left: -280, top: -170, width: 560, height: 170, borderRadius: 14, background: 'linear-gradient(170deg, #B7BAC1 0, #8C8F96 55%, #6C6F76 100%)',
      boxShadow: 'inset 0 4px 0 rgba(255,255,255,0.35), 0 10px 0 #4E5157', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
      <span style={{fontFamily: font, fontWeight: 900, fontSize: 104, color: '#4A4D53', letterSpacing: 10, textShadow: '0 2px 0 rgba(255,255,255,0.35)'}}>ETH</span>
      <svg width={560} height={170} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
        <path d="M300 0 L286 38 L318 70 L290 104 L312 136 L296 170" fill="none" stroke="#2A2C31" strokeWidth={7} strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - clamp(crack)} />
        {crack > 0.95 && <path d="M300 0 L286 38 L318 70 L290 104 L312 136 L296 170" fill="none" stroke={P.y} strokeWidth={3} opacity={0.6 + 0.3 * Math.sin(f / 5)} />}
      </svg>
    </div>
    {/* the tower: stacks of papers */}
    <div style={{position: 'absolute', left: 0, top: -170, transformOrigin: '0 0', transform: `rotate(${tilt}deg)`}}>
      {stacks.map(([sx, n, sc], si) => Array.from({length: n}, (_, i) => {
        const w = 120 * sc, h = 22, jitter = (hash(si * 31 + i) - 0.5) * 16, r = (hash(si * 7 + i) - 0.5) * 4;
        return <div key={`${si}-${i}`} style={{position: 'absolute', left: sx - w / 2 + jitter, top: -(i + 1) * h, width: w, height: h - 3, background: i % 3 === 0 ? '#F6F6F4' : P.paper,
          border: '2px solid #C9CBD0', borderRadius: 3, transform: `rotate(${r}deg)`, boxShadow: '0 2px 0 rgba(0,0,0,0.15)'}}>
          <div style={{margin: '6px 10px', height: 3, background: '#D8DAE0'}} />
        </div>;
      }))}
    </div>
  </div>;
};

/* ---------- the chart: exponential wall, the new bound, polynomial (illustrative shapes) ---------- */

const O = {x: 110, y: 960}, W = 740, H = 780, YMAX = 0.36;
const fExp = (x: number) => (Math.exp(6 * x) - 1) / (Math.exp(6) - 1);
const fNew = (x: number) => (Math.exp(6 * x * (1 - 0.28 * x)) - 1) / (Math.exp(6) - 1);
const fPoly = (x: number) => 0.045 * x ** 3;
const pts = (fn: (x: number) => number, upto = 1) => Array.from({length: 121}, (_, i) => {
  const x = (i / 120) * upto, y = Math.min(fn(x), YMAX * 1.08);
  return [O.x + x * W, O.y - (y / YMAX) * H] as const;
});
const curve = (fn: (x: number) => number, upto = 1) => pts(fn, upto).map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`).join(' ');
const Chart: React.FC<{exp: number; nw?: number; poly?: number; gap?: number; dark?: boolean}> = ({exp, nw = 0, poly = 0, gap = 0, dark = false}) => {
  const ink = dark ? '#E8E8E8' : P.ink;
  // the gap between the wall and the new curve, lit
  const gapPath = [...pts(fExp, 0.86), ...pts(fNew, 0.86).reverse()].map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`).join(' ') + ' Z';
  return <svg width={900} height={1080} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
    <line x1={O.x} y1={O.y} x2={O.x + W + 20} y2={O.y} stroke={ink} strokeWidth={5} strokeLinecap="round" />
    <line x1={O.x} y1={O.y} x2={O.x} y2={O.y - H - 20} stroke={ink} strokeWidth={5} strokeLinecap="round" />
    <text x={O.x + W} y={O.y + 56} textAnchor="end" fontFamily={font} fontWeight={800} fontSize={36} fill={P.muted}>问题规模 n →</text>
    <text x={O.x - 20} y={O.y - H - 36} fontFamily={font} fontWeight={800} fontSize={36} fill={P.muted}>时间 ↑</text>
    {gap > 0 && <path d={gapPath} fill={P.y} opacity={0.35 * gap} />}
    {exp > 0 && <path d={curve(fExp)} fill="none" stroke={P.red} strokeWidth={12} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - exp} />}
    {nw > 0 && <path d={curve(fNew)} fill="none" stroke={P.ink} strokeWidth={12} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - nw} />}
    {poly > 0 && <path d={curve(fPoly)} fill="none" stroke={P.poly} strokeWidth={10} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - poly} />}
    {<text x={O.x + W - 10} y={O.y + 92} textAnchor="end" fontFamily={font} fontSize={26} fill={P.muted}>示意：形状对，刻度不精确</text>}
  </svg>;
};
const tip = (fn: (x: number) => number, x: number) => ({x: O.x + x * W, y: O.y - (Math.min(fn(x), YMAX) / YMAX) * H});

/* ---------- 1 hook: hundreds of papers, one premise — cracked ---------- */

const hookPlan = (cue: Cue) => ({a: cue('a', 62)});
const Hook: Scene = ({f, cue}) => {
  const p = hookPlan(cue);
  const crackAt = p.a + 26;
  const cam0 = camAt(f, [[-1, {x: 450, y: 600, z: 1.0}, 1], [0, {z: 1.08, y: 640}, crackAt], [crackAt, {z: 1.0, y: 600}, 14]]);
  const cam = {...cam0, x: cam0.x + shake(f, crackAt, 12)};
  return <>
    {stage(cam, <>
      <Tower f={f} x={450} y={1020} s={1.15} crack={ramp(f, crackAt - 6, crackAt + 6)} wobbleAt={crackAt} />
      <Abs x={0} y={30} w={900} style={{textAlign: 'center'}}><div style={{fontFamily: font, fontWeight: 900, fontSize: 112, color: P.paper, letterSpacing: 2}}>几百篇论文</div>
        <div style={{fontFamily: font, fontWeight: 700, fontSize: 36, color: 'rgba(255,255,255,0.6)', marginTop: 8}}>同一个前提：指数时间假设</div></Abs>
    </>)}
    <Sticker x={720} y={560} p={pop(f, crackAt + 2, 9)} rot={6} size={46} bg={P.y} color={P.ink}>OpenAI 声称</Sticker>
  </>;
};
Hook.backdrop = backdrop('dark');
Hook.sfx = (cue) => {
  const p = hookPlan(cue);
  return [{at: 0, kind: 'thud', gain: 0.12}, {at: p.a + 20, kind: 'whoosh-short', gain: 0.08}, {at: p.a + 26, kind: 'fs-impact-deep', gain: 0.18}, {at: p.a + 28, kind: 'paper', gain: 0.1}];
};

/* ---------- 2 what: not Ethereum; the hypothesis is an exponential wall ---------- */

const whatPlan = (cue: Cue) => ({a: cue('a', 23), b: cue('b', 61), c: cue('c', 143)});
const What: Scene = ({f, cue}) => {
  const p = whatPlan(cue);
  const coinOut = ramp(f, p.b - 10, p.b);
  const cam = camAt(f, [[-1, {x: 450, y: 540, z: 1.0}, 1], [p.c - 6, {x: 520, y: 420, z: 1.08}, 30]]);
  return <>
    {stage(cam, <>
      {/* the Ethereum gag */}
      {coinOut < 1 && <div style={{position: 'absolute', left: 300, top: 300, opacity: 1 - coinOut, transformOrigin: '150px 150px', transform: `scale(${1.5 * Math.max(0, pop(f, -6, 10)) * (1 - 0.3 * coinOut)})`}}>
        <svg width={300} height={300} viewBox="0 0 300 300">
          <circle cx={150} cy={150} r={130} fill="#C9CCD4" stroke={P.ink} strokeWidth={8} />
          <text x={150} y={176} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={84} fill={P.ink}>ETH</text>
          <path d="M40 260 L260 40" stroke={P.red} strokeWidth={18} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - ramp(f, p.a - 2, p.a + 8)} />
        </svg>
        <div style={{textAlign: 'center', fontFamily: font, fontWeight: 900, fontSize: 56, color: P.ink, opacity: ramp(f, p.a, p.a + 6)}}>≠ 以太坊</div>
      </div>}
      <div style={{opacity: ramp(f, p.b - 6, p.b + 4)}}>
        <Chart exp={ease.inOutCubic(ramp(f, p.c - 10, p.c + 24))} />
        <Abs x={170} y={190}><In f={f} at={p.b}><div style={{fontFamily: mono, fontWeight: 800, fontSize: 52, color: P.ink}}>3-SAT</div>
          <div style={{fontFamily: font, fontWeight: 700, fontSize: 32, color: P.muted}}>经典的 NP 完全问题</div></In></Abs>
        {(() => { const t = tip(fExp, 0.8); return <Abs x={t.x - 420} y={t.y + 40}><In f={f} at={p.c + 18}><div style={{fontFamily: font, fontWeight: 900, fontSize: 64, color: P.red}}>2ⁿ</div>
          <div style={{fontFamily: hand, fontSize: 40, color: P.red}}>ETH：至少这么慢</div></In></Abs>; })()}
      </div>
    </>)}
  </>;
};
What.backdrop = backdrop('paper');
What.sfx = (cue) => {
  const p = whatPlan(cue);
  return [{at: 0, kind: 'pop', gain: 0.08}, {at: p.a, kind: 'block', gain: 0.1}, {at: p.b, kind: 'whoosh-short', gain: 0.08}, {at: p.c, kind: 'whoosh', gain: 0.1}];
};

/* ---------- 3 claim: a faster algorithm, checked in Lean (signature: the curve bends under the wall) ---------- */

const claimPlan = (cue: Cue) => ({a: cue('a', 34), b: cue('b', 86)});
const Claim: Scene = ({f, cue}) => {
  const p = claimPlan(cue);
  const cam = camAt(f, [[-1, {x: 450, y: 420, z: 1.0}, 1], [p.a - 6, {x: 560, y: 520, z: 1.06}, 20], [p.b - 4, {x: 600, y: 520, z: 1.12}, 16]]);
  const t = tip(fNew, 0.95);
  return <>
    {stage(cam, <>
      <div style={{position: 'absolute', left: 40, top: 40, right: 40, bottom: 40, background: 'rgba(255,255,255,0.88)', borderRadius: 28, boxShadow: '0 30px 60px rgba(120,60,20,0.25)'}} />
      <Chart exp={1} nw={ease.inOutCubic(ramp(f, p.a - 4, p.a + 30))} gap={ramp(f, p.a + 24, p.a + 40)} />
      <Abs x={t.x - 470} y={t.y + 90}><In f={f} at={p.a + 26}><div style={{fontFamily: mono, fontWeight: 800, fontSize: 48, color: P.ink}}>2<sup style={{fontSize: 30}}>n/√log n</sup></div>
        <div style={{fontFamily: font, fontWeight: 800, fontSize: 32, color: P.ink}}>OpenAI 声称的新算法</div></In></Abs>
      {/* the paper's first page, pinned at the top */}
      <Abs x={150} y={200}><In f={f} at={-8} dy={-40}><div style={{width: 470, background: P.paper, padding: 10, boxShadow: '0 16px 30px rgba(0,0,0,0.25)', transform: 'rotate(-2deg)'}}>
        <Img src={IMG('paper-title')} style={{width: '100%', display: 'block'}} /><div style={{textAlign: 'right', fontFamily: font, fontSize: 20, color: P.muted}}>@OpenAI｜论文原文</div></div></In></Abs>
      {/* Lean ✓ */}
      <Abs x={560} y={70}><In f={f} at={p.b - 2}><div style={{display: 'inline-block', background: P.blue, color: P.paper, borderRadius: 18, padding: '12px 26px', fontFamily: font, fontWeight: 900, fontSize: 52,
        boxShadow: '0 10px 0 #06417F'}}>Lean ✓</div>
        <div style={{marginTop: 12, fontFamily: font, fontWeight: 700, fontSize: 28, color: P.ink, width: 300}}>机器验证的是稍弱的界</div></In></Abs>
    </>)}
  </>;
};
Claim.backdrop = backdrop('openai');
Claim.sfx = (cue) => {
  const p = claimPlan(cue);
  return [{at: 0, kind: 'paper', gain: 0.1}, {at: p.a - 4, kind: 'whoosh', gain: 0.1}, {at: p.a + 30, kind: 'pop', gain: 0.1}, {at: p.b - 2, kind: 'chime', gain: 0.1}];
};

/* ---------- 4 but: still far slower than polynomial; ≠ P=NP; practical speed-ups unknown ---------- */

const butPlan = (cue: Cue) => ({a: cue('a', 31), b: cue('b', 83), c: cue('c', 134)});
const But: Scene = ({f, cue}) => {
  const p = butPlan(cue);
  const cam0 = camAt(f, [[-1, {x: 500, y: 520, z: 1.12}, 1], [0, {x: 450, y: 560, z: 0.98}, 20], [p.c - 6, {x: 450, y: 600, z: 1.0}, 16]]);
  const cam = {...cam0, y: cam0.y + shake(f, p.b + 2, 8)};
  const tn = tip(fNew, 0.95), tp = tip(fPoly, 0.98);
  return <>
    {stage(cam, <>
      <div style={{opacity: 1 - 0.75 * ramp(f, p.c - 6, p.c + 4)}}>
      <Chart exp={1} nw={1} poly={ease.inOutCubic(ramp(f, p.a - 4, p.a + 20))} gap={0.6} />
      <Abs x={tn.x - 250} y={tn.y - 70}><div style={{fontFamily: font, fontWeight: 800, fontSize: 34, color: P.ink}}>新算法</div></Abs>
      <Abs x={tp.x - 250} y={tp.y - 80}><In f={f} at={p.a + 14}><div style={{fontFamily: mono, fontWeight: 800, fontSize: 44, color: P.poly}}>n<sup style={{fontSize: 26}}>k</sup> 多项式</div></In></Abs>
      {/* the distance still to go */}
      <svg width={900} height={1080} style={{position: 'absolute', inset: 0, overflow: 'visible', opacity: ramp(f, p.a + 18, p.a + 28)}}>
        <line x1={tn.x - 30} y1={tn.y + 10} x2={tp.x - 30} y2={tp.y - 10} stroke={P.ink} strokeWidth={4} strokeDasharray="10 10" />
      </svg>
      <Abs x={tn.x - 270} y={(tn.y + tp.y) / 2 - 20}><In f={f} at={p.a + 22}><div style={{fontFamily: hand, fontSize: 48, color: P.ink}}>还差得远</div></In></Abs>
      </div>
      {/* practical speed-ups: unknown */}
      <Abs x={100} y={660}><In f={f} at={p.c - 4}><div style={{display: 'flex', alignItems: 'center', gap: 18, background: P.paper, border: `4px solid ${P.ink}`, borderRadius: 18, padding: '14px 22px', boxShadow: '0 8px 0 rgba(0,0,0,0.15)'}}>
        <div style={{fontFamily: mono, fontWeight: 800, fontSize: 36, color: P.ink}}>SAT 求解器</div>
        <div style={{fontFamily: font, fontWeight: 900, fontSize: 40, color: P.muted}}>会更快吗？还不知道</div>
      </div><div style={{marginTop: 8, fontFamily: font, fontSize: 24, color: P.muted}}>据核查人 Ryan Williams："we don't know yet"</div></In></Abs>
    </>)}
    <Stamp x={300} y={460} f={f} at={p.b} size={92} color={P.red} rot={-8}>≠ P=NP</Stamp>
  </>;
};
But.backdrop = backdrop('paper');
But.sfx = (cue) => {
  const p = butPlan(cue);
  return [{at: 0, kind: 'whoosh-short', gain: 0.08}, {at: p.a, kind: 'whoosh', gain: 0.08}, {at: p.b, kind: 'stamp', gain: 0.2}, {at: p.c - 4, kind: 'pop', gain: 0.08}];
};

/* ---------- 5 check: the hypothesis's own proposers lead the examination; "not certification" ---------- */

const checkPlan = (cue: Cue) => ({a: cue('a', 25), b: cue('b', 99), c: cue('c', 136)});
const PEOPLE: [string, string, boolean][] = [['Russell Impagliazzo', 'UC San Diego', true], ['Ramamohan Paturi', 'UC San Diego', true], ['Ryan Williams', 'MIT', false]];
const Check: Scene = ({f, cue}) => {
  const p = checkPlan(cue);
  const cam = camAt(f, [[-1, {x: 450, y: 420, z: 1.0}, 1], [p.b - 8, {x: 450, y: 700, z: 1.04}, 18]]);
  return <>
    {stage(cam, <>
      {PEOPLE.map(([n, aff, prop], i) => <Abs key={n} x={20 + i * 290} y={120}><In f={f} at={-4 + i * 6} dy={60}>
        <div style={{width: 270, height: 340, background: P.paper, border: `4px solid ${P.ink}`, borderRadius: 20, boxShadow: '0 12px 0 rgba(0,0,0,0.15)', padding: '22px 18px', boxSizing: 'border-box',
          display: 'flex', flexDirection: 'column'}}>
          <div style={{width: 90, height: 90, borderRadius: 45, background: '#D9DCE2', border: `4px solid ${P.ink}`}} />
          <div style={{marginTop: 18, fontFamily: font, fontWeight: 900, fontSize: 34, color: P.ink, lineHeight: 1.15}}>{n}</div>
          <div style={{marginTop: 6, fontFamily: font, fontWeight: 700, fontSize: 26, color: P.muted}}>{aff}</div>
          <div style={{flex: 1}} />
          {prop && <div style={{alignSelf: 'flex-start', background: P.y, borderRadius: 10, padding: '4px 12px', fontFamily: font, fontWeight: 900, fontSize: 28, color: P.ink,
            opacity: ramp(f, p.a + 4 + i * 6, p.a + 10 + i * 6)}}>ETH 提出者</div>}
        </div>
      </In></Abs>)}
      {/* the letter */}
      <Abs x={20} y={560} w={860}><In f={f} at={p.b - 6} dy={60}>
        <div style={{background: P.paper, border: `4px solid ${P.ink}`, borderRadius: 18, padding: '26px 30px', boxShadow: '0 16px 30px rgba(0,0,0,0.18)'}}>
          <div style={{fontFamily: font, fontWeight: 800, fontSize: 28, color: P.muted, marginBottom: 12}}>三人公开信 · 原文</div>
          <Typed f={f} start={p.b} text="Our involvement should not be taken as certification of the claim." cps={30} size={50} family={mono} weight={800} color={P.ink}
            mark="should not be taken as certification" markAt={p.c} markColor={P.y} />
        </div>
      </In></Abs>
    </>)}
  </>;
};
Check.backdrop = backdrop('paper');
Check.sfx = (cue) => {
  const p = checkPlan(cue);
  return [...[0, 1, 2].map((i) => ({at: Math.max(0, -4 + i * 6), kind: 'pop', gain: 0.08})), {at: p.a + 4, kind: 'tap', gain: 0.08}, {at: p.b - 6, kind: 'paper', gain: 0.1}, {at: p.c, kind: 'fs-paper-slide', gain: 0.08}];
};

/* ---------- 6 end: back at the stone — cracked, the tower still standing; pending ---------- */

const endPlan = (cue: Cue) => ({a: cue('a', 24), b: cue('b', 92)});
const End: Scene = ({f, cue}) => {
  const p = endPlan(cue);
  const cam = camAt(f, [[-1, {x: 450, y: 640, z: 1.12}, 1], [0, {z: 1.0, y: 600}, p.b]]);
  return <>
    {stage(cam, <>
      <Tower f={f} x={450} y={1020} s={1.15} crack={1} wobbleAt={-100} />
      <Abs x={0} y={60} w={900} style={{textAlign: 'center'}}><In f={f} at={p.a}><div style={{fontFamily: hand, fontSize: 46, color: 'rgba(255,255,255,0.8)'}}>归约和方法，公开信说仍然有用</div></In></Abs>
    </>)}
    <Stamp x={540} y={940} f={f} at={p.b + 12} size={92} color={P.y} rot={-7}>待核查</Stamp>
  </>;
};
End.backdrop = backdrop('dark');
End.sfx = (cue) => {
  const p = endPlan(cue);
  return [{at: 0, kind: 'whoosh-short', gain: 0.06}, {at: p.b + 12, kind: 'stamp', gain: 0.18}];
};

/** Cover anchor (880 × 800, rendered at f = 0): the cracked ETH stone under the paper tower. */
const Cover: Scene = ({f}) => <Tower f={f} x={440} y={780} s={1.25} crack={1} />;

export const openaiEthFalseScenes: Record<string, Scene> = {
  'eth.hook': Hook, 'eth.what': What, 'eth.claim': Claim, 'eth.but': But, 'eth.check': Check, 'eth.end': End, 'eth.cover': Cover,
};
