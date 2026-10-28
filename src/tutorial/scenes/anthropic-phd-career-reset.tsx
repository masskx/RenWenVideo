import React from 'react';
import {Img, OffthreadVideo, staticFile} from 'remotion';
import {clamp, ease, hash} from '../../fx';
import {font, mono} from '../theme';
import {Cue, Scene} from '../paper';
import {Cam2, ContactShadow, Ground, Layer, Person, POSE_STAND, Pose, Roll, camAt, hand, mixPose, pop, ramp, walkPose} from '../props';

// anthropic-phd-career-reset: Jascha Sohl-Dickstein (Anthropic) at Stanford PAI26 — a grad student said "AGI in 3 years"
// and in the same breath planned PhD → postdoc → faculty. From inputs/anthropic-phd-career-reset/ (materials.md,
// sources.md, transcript/key-segments-*.txt, REVIEW-DOUYIN.md). Case B: the speaker's own slides (reuse granted:
// "Feel free to reuse them however you like.") and the Stanford recording (muted, 「@Stanford HAI｜案例展示」).
// Storyboard: tutorials/anthropic-phd-career-reset.storyboard.md.
// - review: 「一夜清零」「读博无意义」 are media headlines, never said or shown; writing is thinking is from the Q&A; the
//   10 million fold is his spoken figure ("about"); no 2030 × 10000 (an Epoch extrapolation).
// - One object: a year ruler on the floor with the plan's blocks on it (博士 · 博后 · 教职). The student lays them out;
//   the compute curve is the reason; a head split in two (believe / plan); the AGI flag drops at year 3 and every block
//   after it turns to a dashed outline; the ruler forks into the safe road and the interesting one; a pen writes on it.
// - Colours from the compute slide (Our World in Data): 1950–2010 orange #D0705A = the old pace / the old plan;
//   2010–2025 teal #3A9AAD = the new pace (the flag, compute, the interesting road). Slide white / ink #111928; a dark
//   ground only for the compute shock; warm paper for the pen.
// Stage 900 × 1080 (frame "full"); the ground and header are each scene's backdrop (1080 × 1920).

const P = {paper: '#FFFFFF', floor: '#F3F4F2', ink: '#111928', muted: '#6B7280', line: '#D5D8DD', orange: '#D0705A', orangeDeep: '#A9513D', orangeSoft: '#F4D3C8',
  teal: '#3A9AAD', tealDeep: '#23707F', tealSoft: '#CDE8EE', dark: '#111928', warm: '#F6F1E7', grey: '#9AA1AC', purple: '#9960A2'};
const IMG = (n: string) => staticFile(`images/tutorials/anthropic-phd-career-reset/${n}.jpg`);
const SPEAKER = staticFile('video/anthropic-phd-career-reset/speaker.mp4');
const STUDENT = {top: '#2E3A4F', bottom: '#5B6472', hair: '#2B2420', skin: '#F0C8A5'};

type Mode = 'paper' | 'dark' | 'warm';
const backdrop = (mode: Mode): Scene['backdrop'] => {
  const B: NonNullable<Scene['backdrop']> = ({f}) => {
    const dark = mode === 'dark';
    const g = mode === 'dark' ? P.dark : mode === 'warm' ? P.warm : P.floor;
    return <>
      <Ground a={g} b={g} k={0} t={f / 30} horizon={dark ? undefined : 1030} light={dark ? 'rgba(58,154,173,0.16)' : undefined} grain={dark ? 0.3 : 0.45} />
      <div style={{position: 'absolute', left: 72, right: 72, top: 92, display: 'flex', justifyContent: 'space-between', fontFamily: font, fontWeight: 700, fontSize: 28,
        color: dark ? 'rgba(255,255,255,0.5)' : 'rgba(17,25,40,0.5)', letterSpacing: 1}}>
        <span>AI 新闻 · 观点</span><span style={{fontWeight: 500, fontSize: 24}}>Jascha Sohl-Dickstein · 斯坦福 PAI26</span>
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
  {near && <Layer cam={cam} depth={1.25}>{near}</Layer>}
</>;
const shake = (f: number, at: number, amp = 10) => (f < at ? 0 : amp * Math.exp(-(f - at) / 5) * Math.sin((f - at) * 2.4));
/** 「@Stanford HAI｜案例展示」 in the footage's bottom-right corner (external footage rule). */
const CaseTag: React.FC = () => <div style={{position: 'absolute', right: 0, bottom: 0, background: 'rgba(17,25,40,0.8)', color: '#fff', fontFamily: font,
  fontWeight: 700, fontSize: 24, padding: '4px 12px', whiteSpace: 'nowrap'}}>@Stanford HAI｜案例展示</div>;
/** The muted Stanford recording in a window (from `src` seconds into the speaker clip). */
const Footage: React.FC<{w: number; src: number; title?: string}> = ({w, src, title = 'Stanford PAI26 · 2026-06'}) => (
  <div style={{width: w, borderRadius: 16, overflow: 'hidden', boxShadow: '0 30px 60px rgba(0,0,0,0.45)', background: '#000'}}>
    <div style={{height: 44, background: '#1F2633', display: 'flex', alignItems: 'center', gap: 10, padding: '0 16px'}}>
      {['#FF5F57', '#FEBC2E', '#28C840'].map((c) => <div key={c} style={{width: 14, height: 14, borderRadius: 7, background: c}} />)}
      <span style={{marginLeft: 10, fontFamily: font, fontWeight: 700, fontSize: 22, color: 'rgba(255,255,255,0.7)'}}>{title}</span>
    </div>
    <div style={{position: 'relative', width: w, height: (w * 9) / 16}}>
      <OffthreadVideo src={SPEAKER} muted trimBefore={Math.round(src * 30)} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
      <CaseTag />
    </div>
  </div>
);

/* ---------- the ruler and the plan's blocks ---------- */

const YEAR = 100, X0 = 200, FLOOR = 900; // year k sits at X0 + k * YEAR; the ruler lies on the floor at FLOOR
const yx = (k: number) => X0 + k * YEAR;
const BLOCKS: {label: string; a: number; b: number; h: number}[] = [{label: '博士', a: 0, b: 2, h: 120}, {label: '博后', a: 2, b: 5, h: 150}, {label: '教职', a: 5, b: 10.5, h: 180}];

const Ruler: React.FC<{from?: number; to?: number; o?: number}> = ({from = -2, to = 22, o = 1}) => (
  <div style={{position: 'absolute', left: yx(from), top: FLOOR, width: (to - from) * YEAR, height: 58, opacity: o, background: '#FBFBF8', border: `4px solid ${P.ink}`, borderRadius: 8,
    boxShadow: '0 12px 0 rgba(17,25,40,0.12)'}}>
    <svg width={(to - from) * YEAR} height={58} style={{position: 'absolute', left: 0, top: 0}}>
      {Array.from({length: (to - from) * 4 + 1}, (_, i) => {
        const x = i * (YEAR / 4), major = i % 4 === 0;
        return <line key={i} x1={x} y1={0} x2={x} y2={major ? 28 : 14} stroke={P.ink} strokeWidth={major ? 4 : 2} />;
      })}
    </svg>
    {Array.from({length: to - from + 1}, (_, i) => {
      const k = from + i;
      if (![0, 3, 5, 10, 15, 20].includes(k)) return null;
      return <div key={k} style={{position: 'absolute', left: i * YEAR - 70, width: 140, top: 66, textAlign: 'center', fontFamily: mono, fontWeight: 800, fontSize: 38, color: P.muted, whiteSpace: 'nowrap'}}>
        {k === 0 ? '现在' : `+${k} 年`}</div>;
    })}
  </div>
);

/** The belief on the ruler: a teal bracket over the first `k` years labelled "3 年". */
const Bracket: React.FC<{k?: number; o?: number}> = ({k = 3, o = 1}) => o <= 0 ? null : <div style={{position: 'absolute', left: yx(0), top: FLOOR + 130, width: k * YEAR, opacity: o}}>
  <div style={{height: 26, borderLeft: `6px solid ${P.teal}`, borderRight: `6px solid ${P.teal}`, borderBottom: `6px solid ${P.teal}`, borderRadius: '0 0 8px 8px'}} />
  <div style={{textAlign: 'center', fontFamily: font, fontWeight: 900, fontSize: 64, color: P.teal, marginTop: 4}}>3 年</div>
</div>;

/** One block of the plan, dropped onto the ruler at `at`. `ghost` 0 → 1 turns everything right of `cut` into a dashed outline. */
const Block: React.FC<{f: number; at: number; i: number; ghost?: number; cut?: number}> = ({f, at, i, ghost = 0, cut = 1e9}) => {
  const b = BLOCKS[i];
  if (f < at - 12) return null;
  const t = clamp((f - (at - 12)) / 12), land = t < 1 ? -420 * (1 - ease.inCubic(t)) : 0;
  const squash = f >= at && f < at + 8 ? 1 - 0.08 * Math.sin(((f - at) / 8) * Math.PI) : 1;
  const left = yx(b.a) + 4, w = (b.b - b.a) * YEAR - 8, top = FLOOR - b.h;
  const split = clamp((cut - left) / w); // fraction of the block left of the cut
  const reach = split + (1 - split) * clamp(ghost); // how far the dashed wave has run
  const body = (dashed: boolean) => <div style={{position: 'absolute', inset: 0, borderRadius: 14,
    background: dashed ? 'transparent' : `linear-gradient(160deg, ${P.orange} 0, ${P.orangeDeep} 100%)`,
    border: dashed ? `5px dashed ${P.grey}` : `4px solid ${P.orangeDeep}`, boxShadow: dashed ? 'none' : 'inset 0 6px 0 rgba(255,255,255,0.25), 0 12px 0 rgba(17,25,40,0.14)',
    display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
    <span style={{fontFamily: font, fontWeight: 900, fontSize: 64, color: dashed ? P.grey : '#fff', letterSpacing: 4}}>{b.label}</span>
    {i === 0 && !dashed && <span style={{position: 'absolute', top: 10, right: 14, fontFamily: mono, fontWeight: 800, fontSize: 26, color: 'rgba(255,255,255,0.85)'}}>2 年</span>}
    {i === 2 && <span style={{position: 'absolute', right: -64, top: b.h / 2 - 40, fontFamily: font, fontWeight: 900, fontSize: 64, color: dashed ? P.grey : P.orangeDeep}}>→</span>}
  </div>;
  return <div style={{position: 'absolute', left, top: top + land, width: w, height: b.h, transformOrigin: '50% 100%', transform: `scaleY(${squash})`}}>
    <div style={{position: 'absolute', inset: 0, clipPath: `inset(-20% ${(1 - reach) * 100}% -20% ${split * 100}%)`, opacity: ghost > 0 ? 1 : 0}}>{body(true)}</div>
    <div style={{position: 'absolute', inset: 0, clipPath: ghost > 0 ? `inset(-20% ${(1 - (ghost > 0 ? split : 1)) * 100}% -20% -20%)` : undefined}}>{body(false)}</div>
    {ghost > 0 && <div style={{position: 'absolute', inset: 0, clipPath: `inset(-20% -40% -20% ${reach * 100}%)`, opacity: 1 - ghost}}>{body(false)}</div>}
  </div>;
};

/** The teal AGI flag planted at year `k`; drops from the sky at `at`. */
const Flag: React.FC<{f: number; at: number; k?: number}> = ({f, at, k = 3}) => {
  if (f < at - 10) return null;
  const t = clamp((f - (at - 10)) / 10), y = t < 1 ? -900 * (1 - ease.inCubic(t)) : 0;
  const sway = f < at ? 0 : 5 * Math.exp(-(f - at) / 10) * Math.sin((f - at) / 2.2);
  return <div style={{position: 'absolute', left: yx(k) - 6, top: FLOOR - 470 + y, width: 12, height: 480, transformOrigin: '50% 100%', transform: `rotate(${sway}deg)`}}>
    <div style={{position: 'absolute', inset: 0, background: P.ink, borderRadius: 6}} />
    <div style={{position: 'absolute', left: 12, top: 0, width: 300, height: 150, background: P.teal, clipPath: 'polygon(0 0, 100% 10%, 88% 50%, 100% 90%, 0 100%)',
      display: 'flex', flexDirection: 'column', justifyContent: 'center', paddingLeft: 26, boxSizing: 'border-box'}}>
      <div style={{fontFamily: font, fontWeight: 900, fontSize: 58, color: '#fff', lineHeight: 1}}>AGI</div>
      <div style={{fontFamily: mono, fontWeight: 800, fontSize: 34, color: '#fff', marginTop: 6}}>3 年</div>
    </div>
  </div>;
};

/* ---------- 1 hook: "AGI in 3 years" — and the plan laid out far past it ---------- */

const hookPlan = (cue: Cue) => ({a: cue('a', 38), b: cue('b', 109), c: cue('c', 131), d: cue('d', 149)});
const Hook: Scene = ({f, cue}) => {
  const p = hookPlan(cue);
  const cam = camAt(f, [[-1, {x: 400, y: 640, z: 0.98}, 1], [p.a + 6, {x: 480, y: 660, z: 0.88}, 40], [p.b - 6, {x: 600, y: 680, z: 0.78}, 30], [p.d - 4, {x: 720, y: 690, z: 0.68}, 36]]);
  // the student: says it (arms open), then turns to the ruler and points along it as each block lands
  const talk: Pose = {...POSE_STAND, look: 0.2, armNear: [-35 + 6 * Math.sin(f / 4), -60], armFar: [30, -40], mouth: f < p.a ? 0.5 + 0.4 * Math.sin(f / 2.2) : 0.3};
  const lastDrop = f >= p.d ? p.d : f >= p.c ? p.c : f >= p.b ? p.b : -99;
  const point: Pose = {...POSE_STAND, look: 0.95, head: -4, mouth: 0.5, armNear: [-112 - 6 * Math.exp(-(f - lastDrop) / 4), -8], armFar: [-10, -20], lean: -4};
  const pose = mixPose(talk, point, ramp(f, p.a + 4, p.a + 14));
  const hipX = yx(-1.3);
  const quoteOut = ramp(f, p.a - 4, p.a + 6);
  return <>
    {stage(cam, <>
      <Ruler />
      <Bracket />
      {BLOCKS.map((_, i) => <Block key={i} f={f} at={[p.b, p.c, p.d][i]} i={i} />)}
      <Person x={hipX} y={FLOOR - 168} s={1} pose={pose} {...STUDENT} />
      {/* the quote, verbatim from the slide */}
      {quoteOut < 1 && <Abs x={70} y={150} style={{opacity: 1 - quoteOut, transform: `scale(${1 - 0.2 * quoteOut})`, transformOrigin: '20% 100%'}}>
        <div style={{position: 'relative', width: 760, background: P.paper, border: `5px solid ${P.ink}`, borderRadius: 30, padding: '28px 36px', boxShadow: '0 14px 0 rgba(17,25,40,0.12)'}}>
          <div style={{fontFamily: font, fontWeight: 900, fontSize: 80, color: P.ink, lineHeight: 1.1}}>“I think we're going to have AGI in <span style={{color: P.teal}}>3 years</span>.”</div>
          <div style={{position: 'absolute', left: 50, bottom: -42, width: 0, height: 0, borderLeft: '22px solid transparent', borderRight: '22px solid transparent', borderTop: `42px solid ${P.ink}`}} />
        </div>
      </Abs>}
    </>)}
    <Abs x={0} y={70} w={1080} style={{textAlign: 'center', opacity: ramp(f, p.d + 6, p.d + 16)}}>
      <div style={{fontFamily: hand, fontSize: 52, color: P.ink}}>他的规划，一直排到尺子的远端</div>
    </Abs>
  </>;
};
Hook.backdrop = backdrop('paper');
Hook.sfx = (cue) => {
  const p = hookPlan(cue);
  return [{at: 0, kind: 'pop', gain: 0.1}, {at: p.a, kind: 'whoosh-short', gain: 0.07}, {at: p.b, kind: 'thud', gain: 0.16}, {at: p.c, kind: 'thud', gain: 0.16}, {at: p.d, kind: 'thud', gain: 0.18}];
};

/* ---------- 2 who: the speaker, and his compute slide (×10,000,000) ---------- */

const whoPlan = (cue: Cue) => ({a: cue('a', 64), b: cue('b', 125)});
const Who: Scene = ({f, cue, dur}) => {
  const p = whoPlan(cue);
  const cam = camAt(f, [[-1, {x: 450, y: 520, z: 1.0}, 1], [p.a, {x: 450, y: 560, z: 1.0}, 16], [p.b, {x: 470, y: 520, z: 1.06}, Math.max(20, dur - p.b)]]);
  const slideIn = ramp(f, p.a - 8, p.a + 8);
  // the teal 2010–2025 segment on the slide (1200 × 675 image, drawn at 860 wide)
  const k = 860 / 1200, glow = ramp(f, p.a + 6, p.a + 30);
  const x1 = 730 * k, y1 = 373 * k, x2 = 855 * k, y2 = 205 * k;
  return <>
    {stage(cam, <>
      {/* the speaker: big first, then up into the corner */}
      <Abs x={20 + 560 * slideIn * 0} y={40} style={{transformOrigin: '0 0', transform: `translate(${slideIn * 470}px, ${slideIn * -10}px) scale(${1 - 0.55 * slideIn})`}}>
        <In f={f} at={-8}><Footage w={860} src={4.5} /></In>
        <div style={{marginTop: 22, opacity: 1 - slideIn}}>
          <div style={{fontFamily: font, fontWeight: 900, fontSize: 60, color: '#fff'}}>Jascha Sohl-Dickstein</div>
          <div style={{fontFamily: font, fontWeight: 700, fontSize: 38, color: P.teal, marginTop: 6}}>Anthropic 研究员 · 斯坦福演讲</div>
        </div>
      </Abs>
      {/* the slide */}
      {slideIn > 0 && <Abs x={20} y={300} style={{opacity: slideIn, transform: `translateY(${(1 - slideIn) * 80}px)`}}>
        <div style={{position: 'relative', width: 860, background: '#fff', borderRadius: 14, overflow: 'hidden', boxShadow: '0 30px 70px rgba(0,0,0,0.5)'}}>
          <Img src={IMG('compute-plot')} style={{width: 860, display: 'block'}} />
          <svg width={860} height={484} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
            <line x1={x1} y1={y1} x2={x1 + (x2 - x1) * glow} y2={y1 + (y2 - y1) * glow} stroke={P.teal} strokeWidth={22} strokeLinecap="round" opacity={0.35} />
            <line x1={x1} y1={y1} x2={x1 + (x2 - x1) * glow} y2={y1 + (y2 - y1) * glow} stroke={P.tealDeep} strokeWidth={9} strokeLinecap="round" />
            {glow > 0.98 && <circle cx={x2} cy={y2} r={16 + 4 * Math.sin(f / 4)} fill="none" stroke={P.teal} strokeWidth={5} />}
          </svg>
          <div style={{position: 'absolute', left: 0, bottom: 0, background: 'rgba(17,25,40,0.8)', color: '#fff', fontFamily: font, fontWeight: 700, fontSize: 22, padding: '4px 12px'}}>讲者幻灯｜Our World in Data</div>
        </div>
      </Abs>}
      {/* the number */}
      <Abs x={20} y={830} w={860}><In f={f} at={p.b - 30}>
        <div style={{fontFamily: font, fontWeight: 700, fontSize: 34, color: 'rgba(255,255,255,0.65)'}}>“in the last decade” · training compute</div>
        <Roll f={f} start={p.b - 30} land={p.b + 6} from={1} to={10000000} sep prefix="×" size={150} color={P.teal} family={mono} />
      </In></Abs>
    </>)}
  </>;
};
Who.backdrop = backdrop('dark');
Who.sfx = (cue) => {
  const p = whoPlan(cue);
  return [{at: 0, kind: 'whoosh-short', gain: 0.08}, {at: p.a - 8, kind: 'paper', gain: 0.1}, {at: p.a + 6, kind: 'whoosh', gain: 0.08}, {at: p.b + 6, kind: 'fs-impact-deep', gain: 0.16}];
};

/* ---------- 3 brain: one half believes, the other half plans — let the belief flood across ---------- */

const brainPlan = (cue: Cue) => ({a: cue('a', 27), b: cue('b', 76)});
/** A head in profile (facing right), 600 wide; children are clipped to it. */
const HEAD = 'M210 620 L210 540 Q120 520 110 420 Q60 360 80 250 Q110 70 300 40 Q480 20 540 170 Q560 230 552 280 L600 360 Q606 378 584 384 L560 390 Q566 440 548 470 Q536 500 488 494 L430 488 L430 620 Z';
const Brain: Scene = ({f, cue}) => {
  const p = brainPlan(cue);
  const cam = camAt(f, [[-1, {x: 450, y: 520, z: 1.04}, 1], [p.b, {x: 450, y: 500, z: 1.1}, 30]]);
  const flood = ease.inOutCubic(ramp(f, p.b + 2, p.b + 26));
  const scatter = clamp((f - (p.b + 8)) / 20);
  return <>
    {stage(cam, <>
      <ContactShadow x={450} y={930} w={520} o={0.25} />
      <Abs x={150} y={290}>
        <svg width={640} height={640} viewBox="0 0 640 640" style={{overflow: 'visible'}}>
          <defs><clipPath id="phd-head"><path d={HEAD} /></clipPath></defs>
          <g clipPath="url(#phd-head)">
            <rect x={0} y={0} width={640} height={640} fill={P.orangeSoft} />
            <rect x={0} y={0} width={320 + 320 * flood} height={640} fill={P.tealSoft} />
          </g>
          <path d={HEAD} fill="none" stroke={P.ink} strokeWidth={8} strokeLinejoin="round" />
          <line x1={320 + 320 * flood} y1={30} x2={320 + 320 * flood} y2={620} stroke={P.ink} strokeWidth={4} strokeDasharray="14 12" opacity={1 - flood} />
        </svg>
      </Abs>
      {/* left half: the belief — a small AGI flag */}
      <Abs x={250} y={420}><In f={f} at={-6}>
        <div style={{width: 10, height: 190, background: P.ink, borderRadius: 5}} />
        <div style={{position: 'absolute', left: 10, top: 0, width: 150, height: 84, background: P.teal, clipPath: 'polygon(0 0, 100% 10%, 86% 50%, 100% 90%, 0 100%)',
          fontFamily: font, fontWeight: 900, fontSize: 40, color: '#fff', paddingLeft: 16, paddingTop: 18, boxSizing: 'border-box'}}>AGI</div>
        <div style={{marginTop: 14, fontFamily: font, fontWeight: 900, fontSize: 44, color: P.tealDeep, whiteSpace: 'nowrap', marginLeft: 14}}>相信</div>
      </In></Abs>
      {/* right half: the plan — three little blocks, scattered by the flood */}
      {BLOCKS.map((b, i) => {
        const dx = scatter * (120 + 80 * i), dy = scatter * (-60 + 220 * scatter) * (0.6 + 0.3 * i), r = scatter * (30 + 25 * i) * (i % 2 ? -1 : 1);
        return <Abs key={b.label} x={500 + dx} y={420 + i * 74 + dy} style={{opacity: 1 - clamp((scatter - 0.6) * 2.5), transform: `rotate(${r}deg)`}}><In f={f} at={p.a + 4 + i * 5}>
          <div style={{width: 150 + 30 * i, height: 62, borderRadius: 10, background: P.orange, border: `3px solid ${P.orangeDeep}`, display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: font, fontWeight: 900, fontSize: 34, color: '#fff'}}>{b.label}</div>
        </In></Abs>;
      })}
      <Abs x={520} y={660}><In f={f} at={p.a + 18}><div style={{fontFamily: font, fontWeight: 900, fontSize: 44, color: P.orangeDeep, opacity: 1 - flood}}>规划</div></In></Abs>
      {/* his words */}
      <Abs x={30} y={60} w={840}><In f={f} at={p.b - 10}>
        <div style={{fontFamily: hand, fontSize: 46, color: P.ink, lineHeight: 1.25}}>“If you believe in one part of your brain … you should also believe [it] in other parts of your brain.”</div>
        <div style={{marginTop: 8, fontFamily: font, fontWeight: 700, fontSize: 26, color: P.muted}}>演讲原话 · 25:47</div>
      </In></Abs>
    </>)}
  </>;
};
Brain.backdrop = backdrop('paper');
Brain.sfx = (cue) => {
  const p = brainPlan(cue);
  return [{at: 0, kind: 'pop', gain: 0.08}, {at: p.a + 4, kind: 'tap', gain: 0.07}, {at: p.a + 9, kind: 'tap', gain: 0.07}, {at: p.a + 14, kind: 'tap', gain: 0.07}, {at: p.b + 2, kind: 'whoosh', gain: 0.1}];
};

/* ---------- 4 path: 10–20 years out it's fog; the AGI flag drops at year 3 and the rest of the plan turns to outline ---------- */

const pathPlan = (cue: Cue) => ({a: cue('a', 26), b: cue('b', 82), c: cue('c', 110)});
const Path: Scene = ({f, cue}) => {
  const p = pathPlan(cue);
  const flagAt = p.c - 2;
  const cam0 = camAt(f, [[-1, {x: 980, y: 620, z: 0.5}, 1], [p.b - 10, {x: 720, y: 680, z: 0.7}, 26]]);
  const cam = {...cam0, y: cam0.y + shake(f, flagAt, 14)};
  const fog = ramp(f, p.a - 6, p.a + 16);
  const ghost = ramp(f, flagAt + 4, flagAt + 34);
  return <>
    {stage(cam, <>
      {/* the fog over 10–20 years out */}
      <div style={{position: 'absolute', left: yx(9), top: FLOOR - 640, width: YEAR * 13, height: 760, opacity: fog,
        background: `linear-gradient(90deg, rgba(205,232,238,0) 0, rgba(205,232,238,0.95) 22%, rgba(205,232,238,0.95) 100%)`, filter: 'blur(6px)'}} />
      <Ruler from={-2} to={22} />
      <Bracket o={1 - ramp(f, p.c - 14, p.c - 4)} />
      {BLOCKS.map((_, i) => <Block key={i} f={f} at={-40} i={i} ghost={ghost} cut={yx(3)} />)}
      <Person x={yx(-1)} y={FLOOR - 168} s={1} pose={{...POSE_STAND, look: 0.9, head: f > flagAt ? -8 : 0, eyes: f > flagAt && f < flagAt + 12 ? 1.4 : 1, armNear: [-20, -50]}} {...STUDENT} />
      <Flag f={f} at={flagAt} />
      {/* the slide's own words */}
      <Abs x={yx(10)} y={FLOOR - 600} w={1000} style={{opacity: 1 - ramp(f, p.b - 14, p.b + 4)}}><In f={f} at={p.a}>
        <div style={{fontFamily: font, fontWeight: 900, fontSize: 120, color: P.tealDeep}}>10–20 年后</div>
        <div style={{fontFamily: hand, fontSize: 84, color: P.ink, marginTop: 10}}>“The job of an academic will be <i>very different</i>.”</div>
      </In></Abs>
    </>, <>
      <Abs x={yx(3.6)} y={FLOOR - 400} w={700}><In f={f} at={flagAt + 26}>
        <div style={{background: P.paper, border: `4px solid ${P.ink}`, borderRadius: 16, padding: '16px 22px', boxShadow: '0 10px 0 rgba(17,25,40,0.12)', transform: 'rotate(-2deg)'}}>
          <div style={{fontFamily: font, fontWeight: 900, fontSize: 46, color: P.ink, lineHeight: 1.15}}>Your current career trajectory may not even exist.</div>
          <div style={{marginTop: 8, fontFamily: font, fontWeight: 700, fontSize: 24, color: P.muted}}>讲者幻灯原文</div>
        </div>
      </In></Abs>
    </>)}
  </>;
};
Path.backdrop = backdrop('paper');
Path.sfx = (cue) => {
  const p = pathPlan(cue);
  return [{at: 0, kind: 'whoosh-short', gain: 0.06}, {at: p.a, kind: 'fs-whoosh-wipe', gain: 0.07}, {at: p.c - 12, kind: 'whoosh', gain: 0.1}, {at: p.c - 2, kind: 'fs-impact-deep', gain: 0.2}, {at: p.c + 24, kind: 'paper', gain: 0.08}];
};

/* ---------- 5 safe: the ruler forks; one cloud of risk over both roads; the safe road has the low ceiling ---------- */

const safePlan = (cue: Cue) => ({a: cue('a', 41), b: cue('b', 98), c: cue('c', 168)});
// roads seen from above, from the fork (450, 980) into the distance
const ROAD_SAFE = 'M450 1000 L260 620 L260 240';
const ROAD_FUN = 'M450 1000 C580 880 800 820 720 620 C640 440 520 440 640 240';
const Road: React.FC<{d: string; c: string; p: number}> = ({d, c, p}) => <>
  <path d={d} fill="none" stroke={c} strokeWidth={120} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - p} opacity={0.9} />
  <path d={d} fill="none" stroke="#fff" strokeWidth={6} strokeDasharray="0.02 0.03" pathLength={1} strokeDashoffset={-0.01} opacity={0.7 * clamp(p * 1.5 - 0.5)} />
</>;
const Safe: Scene = ({f, cue}) => {
  const p = safePlan(cue);
  const cam0 = camAt(f, [[-1, {x: 450, y: 760, z: 1.15}, 1], [8, {x: 450, y: 600, z: 0.98}, 26], [p.a - 4, {x: 320, y: 520, z: 1.2}, 18], [p.b - 10, {x: 450, y: 580, z: 0.98}, 22], [p.c - 8, {x: 450, y: 520, z: 1.0}, 20]]);
  const fallAt = p.a + 30; // 其实并不稳妥
  const cam = {...cam0, x: cam0.x + shake(f, fallAt + 6, 7)};
  const grow = 0.55 + 0.45 * ramp(f, -2, 24);
  const cloud = ramp(f, p.b - 6, p.b + 22);
  const poles = ramp(f, p.c - 4, p.c + 22);
  const rain = cloud > 0.5;
  return <>
    {stage(cam, <>
      <svg width={900} height={1080} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
        <Road d={ROAD_SAFE} c={P.orange} p={grow} />
        <Road d={ROAD_FUN} c={P.teal} p={grow} />
      </svg>
      <Abs x={120} y={640}><In f={f} at={p.a - 2}><div style={{fontFamily: font, fontWeight: 900, fontSize: 64, color: P.orangeDeep}}>稳</div></In></Abs>
      <Abs x={770} y={820}><In f={f} at={p.a + 8}><div style={{fontFamily: font, fontWeight: 900, fontSize: 52, color: P.tealDeep, whiteSpace: 'nowrap'}}>有意思</div></In></Abs>
      {/* guardrails along the safe road: up on 稳妥的选项, down on 其实并不稳妥 */}
      {[-1, 1].map((side) => Array.from({length: 6}, (_, i) => {
        const y = 300 + i * 66, x = 260 + side * 84, k = i + (side > 0 ? 6 : 0);
        const up = pop(f, p.a - 2 + i * 2, 8), fall = ease.inCubic(clamp((f - (fallAt + k * 1.2)) / 9));
        if (up < -0.5) return null;
        return <div key={k} style={{position: 'absolute', left: x - 8, top: y - 64, width: 16, height: 64, transformOrigin: '50% 100%',
          transform: `scaleY(${Math.max(0, up)}) rotate(${side * 84 * fall}deg)`, background: `repeating-linear-gradient(180deg, #fff 0 14px, ${P.orange} 14px 28px)`, border: `3px solid ${P.ink}`, borderRadius: 4}} />;
      }))}
      {/* ceilings at the end of each road */}
      {poles > 0 && <>
        <div style={{position: 'absolute', left: 260 - 110, top: 240 - 70 * poles, width: 220, height: 16, background: P.ink, borderRadius: 8}} />
        <div style={{position: 'absolute', left: 258, top: 240 - 70 * poles, width: 4, height: 70 * poles, background: P.ink}} />
        <div style={{position: 'absolute', left: 638, top: 240 - 200 * poles, width: 4, height: 200 * poles, background: P.ink}} />
        <div style={{position: 'absolute', left: 640 - 110, top: 240 - 200 * poles, width: 220, height: 16, background: P.ink, borderRadius: 8}} />
        <Abs x={150} y={240 - 70 * poles - 60}><div style={{fontFamily: font, fontWeight: 900, fontSize: 38, color: P.ink, opacity: poles}}>上限</div></Abs>
        <Abs x={530} y={240 - 200 * poles - 60}><div style={{fontFamily: font, fontWeight: 900, fontSize: 38, color: P.ink, opacity: poles}}>上限</div></Abs>
      </>}
      <Person x={450} y={1010 - 168 * 0.8} s={0.8} pose={{...POSE_STAND, look: f < p.a + 20 ? -0.6 : 0.8, head: f < p.a + 20 ? -6 : 6, armNear: [-10, -30]}} {...STUDENT} />
    </>, <>
      {/* one cloud over both roads */}
      {cloud > 0 && <div style={{position: 'absolute', left: 120, top: 330 + (1 - cloud) * -500, width: 680, opacity: cloud}}>
        <svg width={680} height={300} style={{overflow: 'visible'}}>
          {rain && Array.from({length: 22}, (_, i) => {
            const x = 40 + i * 28 + hash(i) * 10, y0 = 150 + ((f * 9 + hash(i * 3) * 200) % 220);
            return <line key={i} x1={x} y1={y0} x2={x - 10} y2={y0 + 34} stroke={P.grey} strokeWidth={4} strokeLinecap="round" opacity={0.7} />;
          })}
          <path d="M60 150 Q40 80 120 70 Q150 10 240 30 Q300 -10 380 30 Q470 0 520 60 Q620 50 620 130 Q660 170 600 190 L90 190 Q30 185 60 150 Z" fill="#C5CAD2" stroke={P.ink} strokeWidth={5} />
        </svg>
        <div style={{position: 'absolute', left: 0, right: 0, top: 96, textAlign: 'center', fontFamily: font, fontWeight: 900, fontSize: 42, color: P.ink}}>躲不掉的基线风险</div>
        <div style={{position: 'absolute', left: 0, right: 0, top: 150, textAlign: 'center', fontFamily: font, fontWeight: 700, fontSize: 22, color: P.muted}}>幻灯原文：an unavoidable baseline of AGI risk</div>
      </div>}
    </>)}
  </>;
};
Safe.backdrop = backdrop('paper');
Safe.sfx = (cue) => {
  const p = safePlan(cue);
  return [{at: 0, kind: 'whoosh', gain: 0.08}, {at: p.a - 2, kind: 'pop', gain: 0.08}, {at: p.a + 30, kind: 'block', gain: 0.1}, {at: p.a + 36, kind: 'thud', gain: 0.08}, {at: p.b, kind: 'fs-whoosh-wipe', gain: 0.1}, {at: p.c, kind: 'block', gain: 0.12}];
};

/* ---------- 6 do: he takes the interesting road ---------- */

const doPlan = (cue: Cue) => ({a: cue('a', 22), b: cue('b', 52)});
const Do: Scene = ({f, cue, dur}) => {
  const p = doPlan(cue);
  // walk along the teal road (sample the path by hand: a few points, eased between)
  const PTS: [number, number][] = [[450, 1000], [580, 890], [730, 790], [720, 620], [620, 460], [640, 240]];
  const t = clamp((f - 4) / Math.max(30, dur - 10)) * (PTS.length - 1);
  const i = Math.min(PTS.length - 2, Math.floor(t)), u = t - i;
  const [hx, hy] = [PTS[i][0] + (PTS[i + 1][0] - PTS[i][0]) * u, PTS[i][1] + (PTS[i + 1][1] - PTS[i][1]) * u];
  const sc = 0.7 - 0.25 * (t / (PTS.length - 1));
  const cam = camAt(f, [[-1, {x: 450, y: 520, z: 1.0}, 1], [0, {x: 560, y: 640, z: 1.12}, dur]]);
  return <>
    {stage(cam, <>
      <svg width={900} height={1080} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
        <g opacity={0.35}><Road d={ROAD_SAFE} c={P.orange} p={1} /></g>
        <Road d={ROAD_FUN} c={P.teal} p={1} />
      </svg>
      <Person x={hx} y={hy - 168 * sc} s={sc} facing={PTS[i + 1][0] >= PTS[i][0] ? 1 : -1} pose={walkPose(f / 16, 1, {look: 0.9, mouth: 0.6})} {...STUDENT} />
    </>)}
    <Abs x={60} y={250} w={960}><In f={f} at={p.a - 2}>
      <div style={{display: 'inline-block', background: P.paper, border: `4px solid ${P.ink}`, borderRadius: 18, padding: '18px 26px', boxShadow: '0 10px 0 rgba(17,25,40,0.12)', transform: 'rotate(-1.5deg)'}}>
        <div style={{fontFamily: font, fontWeight: 900, fontSize: 58, color: P.ink, lineHeight: 1.12}}>Do the <span style={{color: P.teal}}>interesting</span> thing<br />instead of the <span style={{color: P.orangeDeep}}>safe</span> thing.</div>
        <div style={{marginTop: 8, fontFamily: font, fontWeight: 700, fontSize: 24, color: P.muted}}>演讲原话 · 27:08</div>
      </div>
    </In></Abs>
  </>;
};
Do.backdrop = backdrop('paper');
Do.sfx = (cue) => {
  const p = doPlan(cue);
  return [{at: p.a - 2, kind: 'pop', gain: 0.1}, {at: p.b, kind: 'tap', gain: 0.06}];
};

/* ---------- 7 write: the Q&A — writing is thinking; outsource it and the thinking goes with it ---------- */

const writePlan = (cue: Cue) => ({a: cue('a', 58), b: cue('b', 75), c: cue('c', 125), d: cue('d', 160)});
const PEN = (c = P.ink) => <svg width={60} height={260} viewBox="0 0 60 260" style={{overflow: 'visible'}}>
  <path d="M30 258 L18 210 L18 30 Q18 6 30 6 Q42 6 42 30 L42 210 Z" fill={c} />
  <path d="M30 258 L22 226 L38 226 Z" fill="#E8C66A" /><rect x={18} y={70} width={24} height={14} fill={P.teal} />
</svg>;
const Write: Scene = ({f, cue, dur}) => {
  const p = writePlan(cue);
  const cam = camAt(f, [[-1, {x: 450, y: 540, z: 1.0}, 1], [p.a - 4, {x: 450, y: 600, z: 1.06}, 20], [p.d + 6, {x: 450, y: 560, z: 0.9}, 30]]);
  const write = ramp(f, p.b - 2, p.b + 40); // the pen writes 写作即思考
  const grab = ramp(f, p.c - 2, p.c + 14); // the machine hand reaches the pen
  const pull = ramp(f, p.d - 2, p.d + 26); // and pulls it away, the writing with it
  const back = ramp(f, dur - 22, dur - 6); // back to the ruler (frame 0)
  const penX = 160 + 560 * write + 420 * pull, penY = 590 - 230 - 30 * Math.sin(write * 26) * (write < 1 ? 1 : 0) - 160 * pull;
  return <>
    {stage(cam, <>
      <div style={{opacity: 1 - back}}>
        {/* the Q&A, small, top */}
        <Abs x={40} y={30}><In f={f} at={-6} dy={-30}><div style={{transform: 'scale(0.62)', transformOrigin: '0 0'}}><Footage w={820} src={8} title="Q&A · Stanford PAI26" /></div></In></Abs>
        <Abs x={580} y={60} w={300}><In f={f} at={4}><div style={{fontFamily: hand, fontSize: 40, color: P.ink, lineHeight: 1.2}}>问答环节：<br />要不要让 AI 替你写？</div></In></Abs>
        {/* the sheet */}
        <div style={{position: 'absolute', left: 60, top: 400, width: 780, height: 420, background: '#FFFDF8', borderRadius: 10, boxShadow: '0 20px 40px rgba(80,60,30,0.18)', transform: 'rotate(-1deg)'}}>
          <div style={{position: 'absolute', left: 60, right: 60, top: 250, height: 4, background: P.line}} />
          {/* what the pen wrote — dragged off with the pen */}
          <div style={{position: 'absolute', left: 80, top: 120, fontFamily: hand, fontSize: 120, color: P.ink, whiteSpace: 'nowrap', clipPath: `inset(-20% ${(1 - write) * 100}% -20% 0)`,
            transform: `translate(${pull * 520}px, ${-pull * 220}px) rotate(${pull * 8}deg) scale(${1 - 0.5 * pull})`, opacity: 1 - pull * 0.9}}>写作即思考</div>
          <div style={{position: 'absolute', left: 84, top: 280, fontFamily: mono, fontWeight: 800, fontSize: 40, color: P.tealDeep, opacity: ramp(f, p.b + 30, p.b + 40) * (1 - pull)}}>“writing is thinking”</div>
          <div style={{position: 'absolute', left: 84, top: 340, fontFamily: font, fontWeight: 700, fontSize: 24, color: P.muted, opacity: ramp(f, p.b + 30, p.b + 40) * (1 - pull)}}>问答原话 · 40:45</div>
        </div>
        {/* the pen */}
        {f >= p.a - 10 && <div style={{position: 'absolute', left: penX, top: penY + (f < p.a ? -400 * (1 - ramp(f, p.a - 10, p.a)) : 0), transform: `rotate(${28 - 20 * pull}deg)`, transformOrigin: '30px 258px'}}>{PEN()}</div>}
        {/* the machine hand */}
        {grab > 0 && <div style={{position: 'absolute', left: 1000 - 260 * grab + 420 * pull, top: penY + 40 - 160 * pull * 0, transform: `rotate(${-8}deg)`}}>
          <svg width={420} height={120} style={{overflow: 'visible'}}>
            <rect x={70} y={36} width={400} height={48} rx={14} fill="#AEB6C2" stroke={P.ink} strokeWidth={5} />
            <path d="M74 40 L20 20 L8 34 L50 60 L8 86 L20 100 L74 80 Z" fill="#8E97A5" stroke={P.ink} strokeWidth={5} strokeLinejoin="round" />
            <circle cx={120} cy={60} r={10} fill={P.teal} />
          </svg>
        </div>}
        <Abs x={500} y={860} w={380}><In f={f} at={p.d + 8}><div style={{fontFamily: hand, fontSize: 46, color: P.orangeDeep, lineHeight: 1.2}}>字被拿走了，<br />想法也跟着走了</div></In></Abs>
      </div>
      {/* back to frame 0: the ruler and the student */}
      {back > 0 && <div style={{opacity: back, position: 'absolute', inset: 0, transformOrigin: '450px 700px', transform: 'scale(0.6) translateX(-200px)'}}>
        <Ruler from={-2} to={12} />
        <Bracket />
        {BLOCKS.map((_, i) => <Block key={i} f={200} at={-40} i={i} />)}
        <Person x={yx(-1.3)} y={FLOOR - 168} s={1} pose={{...POSE_STAND, look: 0.2}} {...STUDENT} />
      </div>}
    </>)}
  </>;
};
Write.backdrop = backdrop('warm');
Write.sfx = (cue) => {
  const p = writePlan(cue);
  return [{at: 0, kind: 'paper', gain: 0.1}, {at: p.a, kind: 'tap', gain: 0.1}, {at: p.b, kind: 'fs-paper-slide', gain: 0.08}, {at: p.c + 6, kind: 'whoosh-short', gain: 0.08}, {at: p.d, kind: 'whoosh', gain: 0.1}];
};

/** Cover anchor (880 × 800, rendered at f = 0): the ruler, the plan's blocks, the student and the AGI flag. */
const Cover: Scene = () => <div style={{position: 'absolute', left: 0, top: 0, transform: 'scale(0.66) translate(40px, -130px)', transformOrigin: '0 0'}}>
  <Ruler from={-1} to={12} />
  {BLOCKS.map((_, i) => <Block key={i} f={200} at={-40} i={i} ghost={1} cut={yx(3)} />)}
  <Person x={yx(-0.3)} y={FLOOR - 168} s={1} pose={{...POSE_STAND, look: 0.9, head: -8}} {...STUDENT} />
  <Flag f={200} at={-40} />
</div>;

export const anthropicPhdCareerResetScenes: Record<string, Scene> = {
  'phd.hook': Hook, 'phd.who': Who, 'phd.brain': Brain, 'phd.path': Path, 'phd.safe': Safe, 'phd.do': Do, 'phd.write': Write, 'phd.cover': Cover,
};
