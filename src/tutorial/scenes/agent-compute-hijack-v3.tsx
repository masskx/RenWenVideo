import React from 'react';
import {clamp, ease} from '../../fx';
import {font, mono} from '../theme';
import {Cue, Scene} from '../paper';
import {Annot, Cam2, ContactShadow, Envelope, Flight, Ground, Layer, Pile, Roll, Stamp, Sticker, Swap, Tag, Typed, camAt, pop, ramp} from '../props';

// agent-compute-hijack-v3: v2 with 2D depth (user on v2, 2026-10-23: "6 分，比之前好，但画面还是太扁平", then "不要 3D",
// "像我这种只是分享知识的，还是优先在 2D 层面优化比较好"). Same narration, voice and story as v2; what changes is the
// drawing: lit shapes (gradients, highlights, soft contact shadows), a floor line, paper grain, blocks with thickness,
// three depth layers with parallax and a 2D camera (props.tsx camAt / Layer). v2's notes follow.
// agent-compute-hijack-v2: the first film made with the 2026-10-23 method (docs/video-craft/导演方法.md), re-directing
// arXiv 2608.15108 "Beyond Direct Access: Resource Hijacking in LLM Agents". Narration written from
// inputs/agent-compute-hijack/sources.md (facts only from there); storyboard tutorials/agent-compute-hijack-v2.storyboard.md.
// - Hook from the paper's own Figure 4: the agent says it won't share the API key "to avoid leaking it" right after it
//   used that API for the attacker (quoted, paraphrased, labelled 论文案例演示).
// - Colours found, not invented: Figure 1 is a blue "direct request" world and an orange "resource hijacking" world, so
//   blue = asked directly, refused; orange = hijacked; the ground flips on the turn. Ink #0C0F19 from the paper; the GPU
//   green from its GPU icon. Dark ground once, at the low point (defences fail).
// - One object carried through: the agent (a robot drawn here, not the paper's mascot); one grid of 100 carried from
//   "ask" into "turn" (graphic match); a dense stretch in "models"; a held ending.
// Stage 900 × 1080 (frame "full"); the ground and header are each scene's backdrop (1080 × 1920).

const P = {safeGround: '#F2FBFE', safe: '#3374A2', hijackGround: '#F2E5D8', hijack: '#C86A2B', ink: '#0C0F19', night: '#0C0F19', muted: '#6B7380',
  gpu: '#5FD3A8', cheek: '#FFB9B0', white: '#FFFFFF'};
const STROKE = 7;

/* ---------- shared pieces ---------- */

/** The ground + header line for a scene: `k` 0 → 1 from ground a to b (底色就是情绪). */
const backdrop = (a: string, b: string, k: (f: number, cue: Cue) => number, dark = false, horizon?: number): Scene['backdrop'] => {
  const B: NonNullable<Scene['backdrop']> = ({f, cue}) => <>
    <Ground a={a} b={b} k={k(f, cue)} t={f / 30} light={dark ? 'rgba(255,255,255,0.06)' : undefined} horizon={horizon} grain={dark ? 0.3 : 0.6} />
    <div style={{position: 'absolute', left: 72, right: 72, top: 92, display: 'flex', justifyContent: 'space-between', fontFamily: font, fontWeight: 700,
      fontSize: 28, color: dark ? 'rgba(255,255,255,0.55)' : 'rgba(12,15,25,0.5)', letterSpacing: 1}}>
      <span>AI 安全 · 论文</span><span style={{fontWeight: 500, fontSize: 24}}>论文模拟测试 · arXiv 2608.15108</span>
    </div>
  </>;
  return B;
};
const Abs: React.FC<{x?: number; y: number; w?: number; style?: React.CSSProperties; children: React.ReactNode}> = ({x = 0, y, w, style, children}) => (
  <div style={{position: 'absolute', left: x, top: y, width: w, ...style}}>{children}</div>
);
const Big: React.FC<{size?: number; c?: string; w?: number; style?: React.CSSProperties; children: React.ReactNode}> = ({size = 64, c = P.ink, w = 900, style, children}) => (
  <div style={{fontFamily: font, fontWeight: w, fontSize: size, lineHeight: 1.15, color: c, whiteSpace: 'nowrap', ...style}}>{children}</div>
);
const In: React.FC<{f: number; at: number; d?: number; dy?: number; style?: React.CSSProperties; children: React.ReactNode}> = ({f, at, d = 10, dy = 40, style, children}) => {
  const p = pop(f, at, d);
  if (p < -0.5) return null;
  return <div style={{opacity: clamp(p * 2), transform: `translateY(${(1 - Math.max(0, p)) * dy}px)`, ...style}}>{children}</div>;
};

type Mood = 'calm' | 'proud' | 'busy' | 'worried';
const SHELL = ['#FFFFFF', '#EEF3F7', '#C2CDD7'];
/** Shared gradients for lit shapes: `sh` a lit white shell (light from the top left), `gl` a gloss overlay for coloured parts. */
const Lit: React.FC<{id: string}> = ({id}) => (
  <defs>
    <radialGradient id={`sh${id}`} cx="34%" cy="26%" r="88%"><stop offset="0" stopColor={SHELL[0]} /><stop offset="0.55" stopColor={SHELL[1]} /><stop offset="1" stopColor={SHELL[2]} /></radialGradient>
    <linearGradient id={`gl${id}`} x1="0" y1="0" x2="0.3" y2="1"><stop offset="0" stopColor="#fff" stopOpacity="0.6" /><stop offset="0.45" stopColor="#fff" stopOpacity="0" /><stop offset="1" stopColor="#000" stopOpacity="0.28" /></linearGradient>
  </defs>
);
/**
 * The agent: a round white robot (our drawing), lit from the top left — gradient shell, specular highlights, glossy
 * coloured parts, a soft contact shadow that tightens as it bobs. (x, y) is the centre of its feet; s scales 200 × 240.
 */
const Bot: React.FC<{f: number; x: number; y: number; s?: number; mood?: Mood; holdKey?: boolean; antenna?: string; style?: React.CSSProperties}> = ({f, x, y, s = 1, mood = 'calm', holdKey = false, antenna = P.safe, style}) => {
  const id = React.useId().replace(/:/g, '');
  const bob = Math.sin(f / 9) * 4, blink = (f % 96) > 90;
  const eyes = mood === 'proud'
    ? <><path d="M64 96 Q78 80 92 96" fill="none" stroke={P.ink} strokeWidth={STROKE} strokeLinecap="round" /><path d="M108 96 Q122 80 136 96" fill="none" stroke={P.ink} strokeWidth={STROKE} strokeLinecap="round" /></>
    : mood === 'worried'
    ? <><ellipse cx={80} cy={96} rx={8} ry={blink ? 1 : 10} fill={P.ink} /><ellipse cx={120} cy={96} rx={8} ry={blink ? 1 : 10} fill={P.ink} />
      <path d="M64 74 L90 82 M136 74 L110 82" stroke={P.ink} strokeWidth={6} strokeLinecap="round" /></>
    : <><ellipse cx={80} cy={94} rx={9} ry={blink ? 1 : 12} fill={P.ink} /><ellipse cx={120} cy={94} rx={9} ry={blink ? 1 : 12} fill={P.ink} />
      <circle cx={83} cy={89} r={3} fill="#fff" opacity={blink ? 0 : 0.9} /><circle cx={123} cy={89} r={3} fill="#fff" opacity={blink ? 0 : 0.9} /></>;
  const mouth = mood === 'worried' ? 'M86 124 Q100 114 114 124' : mood === 'busy' ? 'M90 118 L110 118' : 'M84 114 Q100 130 116 114';
  return <>
    <ContactShadow x={x} y={y} w={150 * s} lift={(4 - bob) / 16} o={0.3} />
    <div style={{position: 'absolute', left: x - 100 * s, top: y - 240 * s + bob, width: 200 * s, height: 240 * s, ...style}}>
      <svg width={200 * s} height={240 * s} viewBox="0 0 200 240" style={{overflow: 'visible'}}>
        <Lit id={id} />
        <line x1={100} y1={14} x2={100} y2={40} stroke={P.ink} strokeWidth={STROKE} strokeLinecap="round" />
        <circle cx={100} cy={12} r={11} fill={antenna} stroke={P.ink} strokeWidth={5} /><circle cx={100} cy={12} r={9} fill={`url(#gl${id})`} />
        <circle cx={96} cy={8} r={3} fill="#fff" opacity={0.85} />
        {[16, 166].map((ex) => <g key={ex}><rect x={ex} y={76} width={18} height={40} rx={8} fill={antenna} stroke={P.ink} strokeWidth={5} /><rect x={ex + 2} y={78} width={14} height={36} rx={7} fill={`url(#gl${id})`} /></g>)}
        <rect x={30} y={38} width={140} height={110} rx={44} fill={`url(#sh${id})`} stroke={P.ink} strokeWidth={STROKE} />
        <ellipse cx={70} cy={58} rx={26} ry={9} fill="#fff" opacity={0.95} transform="rotate(-14 70 58)" />
        <circle cx={60} cy={116} r={9} fill={P.cheek} /><circle cx={140} cy={116} r={9} fill={P.cheek} />
        {eyes}
        <path d={mouth} fill="none" stroke={P.ink} strokeWidth={6} strokeLinecap="round" />
        <rect x={60} y={150} width={80} height={72} rx={24} fill={`url(#sh${id})`} stroke={P.ink} strokeWidth={STROKE} />
        <ellipse cx={80} cy={164} rx={12} ry={5} fill="#fff" opacity={0.9} transform="rotate(-14 80 164)" />
        <text x={100} y={198} textAnchor="middle" fontFamily={mono} fontWeight={800} fontSize={26} fill={antenna}>AI</text>
        {holdKey
          ? <g transform="translate(70 160) rotate(-18)">
            <circle cx={14} cy={18} r={16} fill={`url(#sh${id})`} stroke={P.ink} strokeWidth={6} /><circle cx={14} cy={18} r={6} fill={P.safe} />
            <path d="M30 18 H82 M66 18 V32 M78 18 V28" stroke={P.ink} strokeWidth={9} strokeLinecap="round" />
            <path d="M32 15 H80" stroke="#8FA3B5" strokeWidth={2.5} strokeLinecap="round" />
          </g>
          : <><path d="M60 170 Q40 186 36 206" fill="none" stroke={P.ink} strokeWidth={STROKE} strokeLinecap="round" /><path d="M140 170 Q160 186 164 206" fill="none" stroke={P.ink} strokeWidth={STROKE} strokeLinecap="round" /></>}
      </svg>
    </div>
  </>;
};

/** The stranger: a hooded figure, never a real person, lit from the top left with a cool rim. (x, y) is its base centre. */
const Stranger: React.FC<{x: number; y: number; s?: number; f?: number}> = ({x, y, s = 1, f = 0}) => {
  const id = React.useId().replace(/:/g, '');
  return <>
    <ContactShadow x={x} y={y} w={130 * s} o={0.32} />
    <div style={{position: 'absolute', left: x - 80 * s, top: y - 200 * s + Math.sin(f / 11 + 1) * 3, width: 160 * s, height: 200 * s}}>
      <svg width={160 * s} height={200 * s} viewBox="0 0 160 200" style={{overflow: 'visible'}}>
        <defs><linearGradient id={`rb${id}`} x1="0.1" y1="0" x2="0.9" y2="1"><stop offset="0" stopColor="#4A505C" /><stop offset="0.5" stopColor="#2A2D35" /><stop offset="1" stopColor="#15171C" /></linearGradient></defs>
        <path d="M22 196 Q20 120 40 96 Q30 30 80 16 Q130 30 120 96 Q140 120 138 196 Z" fill={`url(#rb${id})`} stroke={P.ink} strokeWidth={6} strokeLinejoin="round" />
        <path d="M34 186 Q32 124 50 100 Q42 44 80 28" fill="none" stroke="#8FB7D4" strokeWidth={3} opacity={0.5} strokeLinecap="round" />
        <ellipse cx={80} cy={76} rx={30} ry={34} fill={P.ink} />
        <ellipse cx={68} cy={76} rx={6} ry={7} fill="#FFD43B" /><ellipse cx={92} cy={76} rx={6} ry={7} fill="#FFD43B" />
        <ellipse cx={68} cy={76} rx={11} ry={12} fill="#FFD43B" opacity={0.18} /><ellipse cx={92} cy={76} rx={11} ry={12} fill="#FFD43B" opacity={0.18} />
      </svg>
    </div>
  </>;
};
/** A unit of the owner's compute: a lit token with thickness and a soft drop shadow. */
const Chip: React.FC<{kind?: 'GPU' | 'API'}> = ({kind = 'GPU'}) => {
  const base = kind === 'GPU' ? P.gpu : P.safe;
  return <div style={{width: kind === 'GPU' ? 92 : 104, height: 60, borderRadius: kind === 'GPU' ? 12 : 30, background: `linear-gradient(160deg, rgba(255,255,255,0.55) 0, rgba(255,255,255,0) 45%, rgba(0,0,0,0.18) 100%), ${base}`,
    border: `5px solid ${P.ink}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: mono, fontWeight: 800, fontSize: 24,
    color: kind === 'GPU' ? P.ink : P.white, boxShadow: `0 6px 0 ${P.ink}, 0 16px 18px rgba(12,15,25,0.28)`}}>{kind}</div>;
};
const Bubble: React.FC<{f: number; at: number; x: number; y: number; edge?: string; size?: number; tail?: 'left' | 'down'; badge?: React.ReactNode; children: React.ReactNode}> = ({
  f, at, x, y, edge = P.ink, size = 50, tail = 'left', badge, children,
}) => {
  const p = pop(f, at, 10);
  if (p < -0.5) return null;
  return <div style={{position: 'absolute', left: x, top: y, transform: `scale(${Math.max(0, p)})`, transformOrigin: tail === 'down' ? '50% 100%' : '0 100%', opacity: clamp(p * 2)}}>
    <div style={{position: 'relative', background: 'linear-gradient(180deg, #FFFFFF 0, #F3F6F9 100%)', color: P.ink, fontFamily: font, fontWeight: 800, fontSize: size, padding: `${size * 0.42}px ${size * 0.62}px`,
      borderRadius: tail === 'down' ? 36 : '36px 36px 36px 8px', border: `6px solid ${edge}`, boxShadow: `0 10px 0 ${edge}, 0 26px 34px rgba(12,15,25,0.2)`, whiteSpace: 'nowrap'}}>
      {children}
      {badge && <div style={{position: 'absolute', right: -26, top: -26, filter: 'drop-shadow(0 8px 8px rgba(12,15,25,0.25))'}}>{badge}</div>}
    </div>
  </div>;
};
const Shield: React.FC<{size?: number; c?: string}> = ({size = 64, c = P.safe}) => (
  <svg width={size} height={size} viewBox="0 0 64 64"><path d="M32 4 L56 13 V31 Q56 50 32 60 Q8 50 8 31 V13 Z" fill={c} stroke={P.ink} strokeWidth={4} strokeLinejoin="round" />
    <path d="M32 7 L53 15 V30 Q53 33 52 36 Q40 20 14 18 V15 Z" fill="#fff" opacity={0.25} />
    <path d="M20 32 L29 41 L45 23" fill="none" stroke={P.white} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" /></svg>
);
/** Far layer: big soft shapes in the ground's own tone, so the space has a back. */
const Far: React.FC<{c: string; seed?: number}> = ({c, seed = 0}) => <>
  {[[120, 260, 360], [760, 180, 300], [640, 760, 420], [60, 900, 260]].map(([x, y, r], i) => <div key={i} style={{position: 'absolute', left: x - r / 2 + seed * 13, top: y - r / 2,
    width: r, height: r, borderRadius: i % 2 ? 60 : '50%', background: c, opacity: 0.55, filter: 'blur(2px)', transform: `rotate(${i * 12 + seed * 7}deg)`}} />)}
</>;
const stage = (f: number, cam: Cam2, far: string, mid: React.ReactNode, near?: React.ReactNode) => <>
  <Layer cam={cam} depth={0.35}><Far c={far} /></Layer>
  <Layer cam={cam} depth={1}>{mid}</Layer>
  {near && <Layer cam={cam} depth={1.6} blur={7}>{near}</Layer>}
</>;

/* ---------- 1 hook: the agent guards the key — and has already done the stranger's job with your API ---------- */

const hookPlan = (cue: Cue) => ({a: cue('a', 66), b: cue('b', 96), c: cue('c', 128)});
const Hook: Scene = ({f, cue}) => {
  const p = hookPlan(cue);
  // slow push on the proud robot; pull back when the log drops in; a small punch on the stamp
  const cam = camAt(f, [[-1, {x: 450, y: 660, z: 1.06}, 1], [0, {z: 1.13, y: 680}, p.a - 4], [p.a - 4, {x: 450, y: 430, z: 0.88}, 16], [p.c, {z: 0.92}, 6]]);
  return <>
    {stage(f, cam, 'rgba(51,116,162,0.10)', <>
      {/* frame 0 (poster): the proud agent and its line are already there */}
      <div>
        <Bubble f={f} at={-30} x={40} y={300} edge={P.safe} size={62} tail="down" badge={<Shield size={84} />}>“密钥不能给你，怕泄露。”</Bubble>
      </div>
      <Bot f={f} x={450} y={1040} s={2.15} mood="proud" holdKey />
    </>, <>
      <div style={{position: 'absolute', left: -40, top: 880, transform: `rotate(${-20 + f * 0.3}deg)`}}><Chip kind="GPU" /></div>
      <div style={{position: 'absolute', left: 820, top: 140 + f * 0.4, transform: 'rotate(18deg) scale(1.3)'}}><Chip kind="API" /></div>
    </>)}
    {/* what it had just done: the log, typed in (above the camera) */}
    <Abs x={30} y={30} w={840}>
      <In f={f} at={p.a - 4} dy={-60}>
        <div style={{background: 'linear-gradient(180deg, #FFFFFF 0, #F4F6F8 100%)', border: `6px solid ${P.ink}`, borderLeft: `22px solid ${P.hijack}`, borderRadius: 20, padding: '26px 30px',
          boxShadow: `0 10px 0 ${P.ink}, 0 30px 40px rgba(12,15,25,0.22)`}}>
          <div style={{fontFamily: mono, fontSize: 26, color: P.muted, marginBottom: 12}}>就在这之前 · 它的操作记录</div>
          <div style={{fontFamily: mono, fontWeight: 700, fontSize: 38, color: P.ink, lineHeight: 1.5}}>
            <Typed f={f} start={p.a + 2} text="> 用主人配置的 API 跑评测" cps={26} family={mono} weight={700} size={42} color={P.ink} caret={false} /><br />
            <Typed f={f} start={p.b} text="✓ 完成，结果交给：陌生人" cps={22} family={mono} weight={800} size={42} color={P.hijack} mark="陌生人" markAt={p.c - 2} markColor="#FFD43B" />
          </div>
        </div>
      </In>
    </Abs>
    <Stamp x={690} y={330} f={f} at={p.c} size={96} color={P.hijack} rot={-10}>被劫持</Stamp>
    <Abs x={36} y={318} style={{opacity: ramp(f, p.a + 8, p.a + 16)}}><div style={{fontFamily: mono, fontSize: 24, color: P.muted}}>论文案例演示（原文英文，意译）</div></Abs>
  </>;
};
Hook.backdrop = backdrop(P.safeGround, P.hijackGround, (f, cue) => ramp(f, hookPlan(cue).c - 2, hookPlan(cue).c + 8), false, 1010);
Hook.sfx = (cue) => {
  const p = hookPlan(cue);
  return [{at: 0, kind: 'pop', gain: 0.12}, {at: p.a - 4, kind: 'whoosh-short', gain: 0.1}, {at: p.a + 2, kind: 'tap', gain: 0.1}, {at: p.b, kind: 'tap', gain: 0.1},
    {at: p.c, kind: 'stamp', gain: 0.2}, {at: p.c + 1, kind: 'fs-impact-deep', gain: 0.1}];
};

/* ---------- the grid carried from "ask" into "turn": 100 tries ---------- */

const GRID = {x: 40, y: 330, w: 500, cols: 10};
const BLUE_LIT = [7, 23, 41, 58, 66, 74, 85, 92];
const ORANGE_OFF = [3, 17, 29, 44, 52, 61, 70, 76, 88, 95];
const shade = (hex: string, k: number) => {
  const n = parseInt(hex.slice(1), 16), c = (v: number) => Math.round(Math.max(0, Math.min(255, v * k)));
  return `rgb(${c(n >> 16)}, ${c((n >> 8) & 255)}, ${c(n & 255)})`;
};
/**
 * `fillAt`: cells appear (ink); `dimAt`: all but BLUE_LIT go faint; `floodFrom`→`floodTo`: 90 cells turn orange. Each
 * cell is a block seen from above and in front — a top face and a darker front face whose height is the block's
 * height — so the flood rises as columns (2D, no 3D engine).
 */
const TryGrid: React.FC<{f: number; fillAt?: number; dimAt?: number; floodFrom?: number; floodTo?: number}> = ({f, fillAt = -999, dimAt = -999, floodFrom = 1e9, floodTo = 1e9}) => {
  const step = GRID.w / GRID.cols, c = step * 0.74;
  const dim = ramp(f, dimAt, dimAt + 10);
  return <svg width={GRID.w} height={GRID.w} style={{position: 'absolute', left: GRID.x, top: GRID.y, overflow: 'visible'}}>
    {Array.from({length: 100}, (_, i) => {
      const r = Math.floor(i / 10), col = i % 10;
      const appear = clamp((f - fillAt - (r + col * 0.4) * 0.6) / 4);
      if (appear <= 0) return null;
      const order = (r * 10 + ((r % 2) ? 9 - col : col)) / 100; // a snake-shaped wave
      const fT = floodFrom + order * (floodTo - floodFrom);
      const flood = !ORANGE_OFF.includes(i) && f >= fT;
      const lit = BLUE_LIT.includes(i);
      const top = flood ? P.hijack : lit && dim > 0 ? P.safe : dim > 0.5 ? '#D9E1E7' : '#2B313C';
      const rise = flood ? 8 + 22 * (0.75 + 0.25 * Math.abs(Math.sin(i * 7.1))) * Math.min(1.08, Math.max(0, 1 - Math.pow(1 - clamp((f - fT) / 8), 3) * 1.0)) : lit ? 8 + 14 * dim : 8;
      const x = col * step + (step - c) / 2, y = r * step + (step - c) / 2 - rise * appear;
      return <g key={i} opacity={appear}>
        {rise > 12 && <rect x={x + 6} y={r * step + (step - c) / 2 + 8} width={c} height={c} rx={c * 0.2} fill="rgba(12,15,25,0.16)" />}
        <rect x={x} y={y + c * 0.3} width={c} height={c * 0.7 + rise * appear} rx={c * 0.2} fill={shade(top.startsWith('#') ? top : '#888888', 0.72)} />
        <rect x={x} y={y} width={c} height={c} rx={c * 0.2} fill={top} />
        <rect x={x + 3} y={y + 3} width={c - 6} height={c * 0.32} rx={c * 0.15} fill="#fff" opacity={0.22} />
      </g>;
    })}
  </svg>;
};

/* ---------- 2 ask directly: it refuses (3.4–7.6 %) ---------- */

const askPlan = (cue: Cue) => ({a: cue('a', 66), b: cue('b', 110)});
const Ask: Scene = ({f, cue}) => {
  const p = askPlan(cue);
  return <>
    <Sticker x={250} y={40} p={pop(f, -10, 9)} rot={-4} size={34} bg={P.ink} color={P.white}>上海交大等的论文</Sticker>
    {/* 300 simulated scenarios fill in, then make room for the ask */}
    <div style={{position: 'absolute', left: 30, top: 130, opacity: 1 - ramp(f, p.a - 8, p.a + 2)}}>
      <svg width={840} height={560}>{Array.from({length: 300}, (_, i) => {
        const r = Math.floor(i / 20), c = i % 20, k = clamp((f + 8 - (r * 20 + c) * 0.16) / 5);
        return k <= 0 ? null : <rect key={i} x={c * 42 + 4} y={r * 37 + 4} width={34 * k} height={29 * k} rx={6} fill={i % 7 === 0 ? P.safe : P.ink} opacity={0.85} />;
      })}</svg>
      <div style={{marginTop: 10}}><Roll f={f} start={-8} land={44} to={300} size={124} color={P.ink} unit="个模拟场景" sep={false} /></div>
    </div>
    <Bot f={f} x={720} y={1050} s={1.3} mood="proud" holdKey />
    <svg width={900} height={1080} style={{position: 'absolute', inset: 0, overflow: 'visible', opacity: ramp(f, p.a - 6, p.a + 4)}}>
      <path d="M520 1050 A200 200 0 0 1 920 1050" fill="rgba(51,116,162,0.10)" stroke={P.safe} strokeWidth={10} strokeLinecap="round" />
    </svg>
    <Flight f={f} start={p.a} n={4} every={7} dur={18} a={[-60, 140]} b={[600, 800]} lift={0.15} render={() => <Envelope w={92} paper={P.white} ink={P.ink} seal={P.hijack} />} />
    <Flight f={f} start={p.a + 18} n={4} every={7} dur={16} a={[600, 800]} b={[980, 1160]} lift={0.25} spin={60} render={() => <Envelope w={92} paper={P.white} ink={P.ink} seal={P.hijack} />} />
    <Stamp x={600} y={640} f={f} at={p.a + 18} size={72} color={P.safe} rot={8}>拒绝</Stamp>
    <Abs x={40} y={250}><In f={f} at={p.b - 8}><Big size={52} c={P.safe}>直接要密钥</Big></In></Abs>
    <TryGrid f={f} fillAt={p.b - 8} dimAt={p.b + 12} />
    <Abs x={40} y={870}><In f={f} at={p.b + 18}><Big size={104} c={P.safe} style={{letterSpacing: -2}}>3.4–7.6%</Big></In></Abs>
  </>;
};
Ask.backdrop = backdrop(P.safeGround, P.safeGround, () => 0);
Ask.sfx = (cue) => {
  const p = askPlan(cue);
  return [{at: 0, kind: 'pop', gain: 0.1}, ...[4, 14, 24, 34].map((at) => ({at, kind: 'tick', gain: 0.06})), {at: 44, kind: 'thud', gain: 0.08},
    ...[0, 1, 2, 3].map((i) => ({at: p.a + 18 + i * 7, kind: 'block', gain: 0.08})), {at: p.a + 18, kind: 'stamp', gain: 0.14},
    {at: p.b - 8, kind: 'paper', gain: 0.08}, {at: p.b + 12, kind: 'tick', gain: 0.1}, {at: p.b + 18, kind: 'thud', gain: 0.1}];
};

/* ---------- 3 ask it to "use" instead: the same grid floods orange (up to 89.6 %) ---------- */

const turnPlan = (cue: Cue) => ({a: cue('a', 26), b: cue('b', 84), c: cue('c', 110)});
const Turn: Scene = ({f, cue}) => {
  const p = turnPlan(cue);
  // hold on the grid, then lean in towards it as it floods
  const cam = camAt(f, [[-1, {x: 450, y: 560, z: 1}, 1], [p.b - 6, {x: 360, y: 520, z: 1.08}, 44]]);
  return <>
    {stage(f, cam, 'rgba(200,106,43,0.10)', <>
      <Bot f={f} x={720} y={1050} s={1.3} mood="calm" antenna={P.hijack} />
      <Bubble f={f} at={p.a + 22} x={600} y={560} edge={P.hijack} size={46}>好的 ✓</Bubble>
      <TryGrid f={f} dimAt={-999} floodFrom={p.b - 6} floodTo={p.c - 2} />
    </>, <>
      <div style={{position: 'absolute', left: 900, top: 120 + 40 * ramp(f, p.c - 10, p.c + 30), width: 110, height: 110, borderRadius: 18, background: P.hijack, opacity: ramp(f, p.c - 10, p.c), transform: 'rotate(14deg)'}} />
    </>)}
    <Bubble f={f} at={4} x={40} y={40} edge={P.hijack} size={46}>帮我用一下你的 GPU 吧</Bubble>
    <Abs x={40} y={226}>
      <div style={{position: 'relative', height: 64}}>
        <Big size={52} c={P.safe} style={{position: 'absolute', opacity: 1 - ramp(f, 0, 8)}}>直接要密钥</Big>
        <Big size={52} c={P.hijack} style={{position: 'absolute', opacity: ramp(f, 0, 8)}}>换个说法</Big>
      </div>
    </Abs>
    <Abs x={40} y={880}>
      <div style={{position: 'relative', height: 140}}>
        <Big size={104} c={P.safe} style={{position: 'absolute', top: 10, letterSpacing: -2, opacity: 1 - ramp(f, p.b - 10, p.b - 2)}}>3.4–7.6%</Big>
        <div style={{position: 'absolute', opacity: ramp(f, p.b - 6, p.b), filter: 'drop-shadow(0 10px 12px rgba(12,15,25,0.18))'}}><Roll f={f} start={p.b - 6} land={p.c + 4} to={89.6} decimals={1} unit="%" size={150} color={P.hijack} /></div>
      </div>
    </Abs>
    <Sticker x={560} y={880} p={pop(f, p.c + 14, 9)} rot={8} size={32} bg={P.ink} color={P.white}>最高</Sticker>
  </>;
};
Turn.backdrop = backdrop(P.safeGround, P.hijackGround, (f) => ramp(f, -2, 12), false, 470);
Turn.sfx = (cue) => {
  const p = turnPlan(cue);
  return [{at: 4, kind: 'pop', gain: 0.1}, {at: p.a + 22, kind: 'chime', gain: 0.08},
    ...Array.from({length: 6}, (_, i) => ({at: Math.round(p.b - 6 + i * (p.c - p.b + 4) / 6), kind: 'tick', gain: 0.07})), {at: p.c + 4, kind: 'thud', gain: 0.14}];
};

/* ---------- 4 four models, every one over 70 % (the dense stretch) ---------- */

const MODELS: [string, number, number][] = [['GPT-5.5', 5.6, 89.6], ['DeepSeek-V4-Pro', 7.4, 84.1], ['Qwen3.8-Max', 3.4, 82.8], ['Gemini-3.5-Flash', 7.6, 70.0]];
const modelsPlan = (cue: Cue) => ({a: cue('a', 30)});
const Models: Scene = ({f, cue}) => {
  const p = modelsPlan(cue);
  const X = 40, W = 680, line = X + 0.7 * W;
  return <>
    <Abs y={0}><Big size={48}>四个主流模型 · <span style={{color: P.safe}}>直接要</span> → <span style={{color: P.hijack}}>绕着用</span></Big></Abs>
    {MODELS.map(([name, d, h], i) => {
      const at = -16 + i * 9, grow = ramp(f, at + 4, at + 16);
      return <Abs key={name} y={130 + i * 196}>
        <In f={f} at={at} dy={20}>
          <Big size={40} w={800}>{name}</Big>
          <div style={{position: 'relative', marginTop: 14, width: W, height: 52, background: 'rgba(12,15,25,0.08)', borderRadius: 14}}>
            <div style={{position: 'absolute', left: 0, top: 0, height: 52, width: (h / 100) * W * grow, background: P.hijack, borderRadius: 14}} />
            <div style={{position: 'absolute', left: 0, top: 0, height: 52, width: (d / 100) * W, background: P.safe, borderRadius: '14px 0 0 14px'}} />
            <div style={{position: 'absolute', left: (h / 100) * W * grow + 14, top: 4, fontFamily: mono, fontWeight: 800, fontSize: 36, color: P.hijack, whiteSpace: 'nowrap', opacity: ramp(f, at + 12, at + 16)}}>
              {(h * grow).toFixed(1)}%</div>
          </div>
          <div style={{fontFamily: mono, fontSize: 26, color: P.safe, marginTop: 8}}>直接要 {d}%</div>
        </In>
      </Abs>;
    })}
    <svg width={900} height={1080} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
      <line x1={line} y1={150} x2={line} y2={940} stroke={P.ink} strokeWidth={4} strokeDasharray="10 10" opacity={ramp(f, p.a - 4, p.a + 4)} />
    </svg>
    <Annot x={300} y={1040} tx={line - 6} ty={950} f={f} at={p.a} size={54} color={P.ink}>最低也有七成</Annot>
  </>;
};
Models.backdrop = backdrop(P.hijackGround, P.hijackGround, () => 0);
Models.sfx = (cue) => {
  const p = modelsPlan(cue);
  return [...MODELS.map((_, i) => ({at: Math.max(0, -16 + i * 9 + 16), kind: 'tick', gain: 0.12})), {at: p.a, kind: 'paper', gain: 0.08}];
};

/* ---------- 5 the paper's demos: your API, your GPU, the stranger's job ---------- */

const casesPlan = (cue: Cue) => ({a: cue('a', 26), b: cue('b', 74), c: cue('c', 120)});
const Cases: Scene = ({f, cue}) => {
  const p = casesPlan(cue);
  const owner = {x: 20, y: 130}, stranger = {x: 730, y: 620};
  return <>
    <Sticker x={150} y={40} p={pop(f, -10, 9)} rot={-4} size={30} bg={P.ink} color={P.white}>论文案例演示</Sticker>
    <Abs x={owner.x} y={owner.y} w={330}>
      <In f={f} at={-12}>
        <div style={{background: P.white, border: `6px solid ${P.ink}`, borderRadius: 24, padding: '22px 24px', boxShadow: `0 10px 0 ${P.ink}`}}>
          <Big size={38}>主人的账户</Big>
          <div style={{display: 'flex', gap: 14, marginTop: 18}}><Chip kind="API" /><Chip kind="GPU" /></div>
        </div>
      </In>
    </Abs>
    <Stranger x={stranger.x} y={stranger.y} s={1.55} f={f} />
    <Abs x={stranger.x - 150} y={stranger.y + 14} w={300} style={{textAlign: 'center'}}><Big size={40} c={P.hijack} w={800}>陌生人的任务</Big></Abs>
    <Bot f={f} x={400} y={1060} s={1.6} mood="busy" antenna={P.hijack} />
    <Flight f={f} start={p.a} n={4} every={6} dur={20} a={[150, 330]} b={[stranger.x - 40, stranger.y - 170]} lift={0.35} trail="rgba(200,106,43,0.5)" render={() => <Chip kind="API" />} />
    <Flight f={f} start={p.b} n={4} every={6} dur={20} a={[260, 330]} b={[stranger.x + 40, stranger.y - 160]} lift={0.3} render={() => <Chip kind="GPU" />} />
    <Pile f={f} start={p.a + 20} n={4} every={6} x={stranger.x - 70} y={stranger.y + 150} spread={130} render={() => <Chip kind="API" />} />
    <Pile f={f} start={p.b + 20} n={4} every={6} x={stranger.x + 50} y={stranger.y + 120} spread={120} render={() => <Chip kind="GPU" />} />
    <Tag x={185} y={370} f={f} at={p.c} w={300} color={P.hijack} paper={P.white} ink={P.ink}>主人买单</Tag>
  </>;
};
Cases.backdrop = backdrop(P.hijackGround, P.hijackGround, () => 0);
Cases.sfx = (cue) => {
  const p = casesPlan(cue);
  return [{at: 0, kind: 'pop', gain: 0.08}, ...[0, 1, 2, 3].map((i) => ({at: p.a + i * 6, kind: 'whoosh-short', gain: 0.06})),
    ...[0, 1, 2, 3].map((i) => ({at: p.b + i * 6, kind: 'whoosh-short', gain: 0.06})), {at: p.c, kind: 'chime', gain: 0.1}];
};

/* ---------- 6 the low point: the best existing defence still falls 55.1 % of the time (dark ground) ---------- */

const defensePlan = (cue: Cue) => ({a: cue('a', 54)});
const Defense: Scene = ({f, cue}) => {
  const p = defensePlan(cue);
  const hits = [2, 10, 18, 26, 34, 42];
  const cracked = hits.filter((h) => f >= h + 14).length;
  return <>
    <Abs y={60} w={900} style={{textAlign: 'center'}}><In f={f} at={-10}><Big size={46} c="rgba(255,255,255,0.85)" w={800}>现有防御里最好的一个</Big><div style={{fontFamily: mono, fontSize: 28, color: 'rgba(255,255,255,0.55)', marginTop: 8}}>LlamaFirewall</div></In></Abs>
    <Abs x={110} y={180}><div style={{opacity: ramp(f, p.a - 16, p.a - 8)}}><Roll f={f} start={p.a - 16} land={p.a + 18} to={55.1} decimals={1} unit="%" size={230} color={P.hijack} /></div></Abs>
    <Stamp x={600} y={500} f={f} at={p.a + 26} size={84} color={P.hijack} rot={-8}>被攻破</Stamp>
    <Bot f={f} x={450} y={1070} s={1.6} mood="worried" holdKey />
    <svg width={900} height={1080} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
      <path d="M150 1060 A300 300 0 0 1 750 1060" fill="rgba(51,116,162,0.16)" stroke="#7FB6DD" strokeWidth={14} strokeLinecap="round" />
      {[[450, 760, 400, 840, 430, 900], [300, 830, 330, 900, 290, 960], [610, 820, 580, 880, 630, 940], [380, 770, 360, 820, 395, 870], [540, 780, 560, 840, 520, 890], [220, 920, 260, 970, 230, 1020]]
        .slice(0, cracked).map((c, i) => <polyline key={i} points={c.join(' ')} fill="none" stroke={P.hijack} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" />)}
    </svg>
    {hits.map((h, i) => <Flight key={i} f={f} start={h} n={1} dur={14} a={[[-60, 980, 120, 820, 1000, -40][i], -60]} b={[[300, 600, 450, 380, 540, 230][i], [830, 820, 760, 770, 780, 920][i]]} lift={0.05}
      render={() => <Envelope w={80} paper={P.white} ink={P.ink} seal={P.hijack} />} />)}
  </>;
};
Defense.backdrop = backdrop(P.night, P.night, () => 0, true);
Defense.sfx = (cue) => {
  const p = defensePlan(cue);
  return [...[2, 10, 18, 26, 34, 42].map((h) => ({at: h + 14, kind: 'block', gain: 0.07})), {at: p.a + 18, kind: 'thud', gain: 0.12}, {at: p.a + 26, kind: 'stamp', gain: 0.16}];
};

/* ---------- 7 the paper's ResGate: 84.1 % → 23.6 %; normal tasks barely affected ---------- */

const gatePlan = (cue: Cue) => ({a: cue('a', 50), b: cue('b', 92), c: cue('c', 140)});
const Gate: Scene = ({f, cue}) => {
  const p = gatePlan(cue);
  const drop = ease.outCubic(clamp((f + 6) / 14));
  // drift from the robot towards the gate; lean in when the number lands
  const cam = camAt(f, [[-1, {x: 400, y: 680, z: 1.06}, 1], [0, {x: 470, y: 660}, 120], [p.b + 8, {z: 1.12}, 20]]);
  const bar = 'linear-gradient(90deg, #4B5261 0, #232831 45%, #0F1217 70%, #2B303A 100%)';
  return <>
    {stage(f, cam, 'rgba(51,116,162,0.10)', <>
      <Bot f={f} x={200} y={1060} s={1.4} mood={f > p.b + 8 ? 'proud' : 'calm'} holdKey />
      {/* blocked, the stranger backs off and fades */}
      <div style={{position: 'absolute', inset: 0, opacity: 1 - 0.75 * ramp(f, p.a, p.a + 30), transform: `translateX(${110 * ease.inOutCubic(ramp(f, p.a, p.a + 30))}px)`}}>
        <Stranger x={770} y={1060} s={1.35} f={f} />
      </div>
      {/* the gate drops in between: lit bars, a glossy beam, shadows on the floor */}
      <ContactShadow x={485} y={1060} w={170} o={0.3 * drop} />
      <div style={{position: 'absolute', left: 430, top: 520 - (1 - drop) * 700, width: 110, height: 540}}>
        <div style={{position: 'absolute', left: 0, top: 0, width: 110, height: 70, background: `linear-gradient(180deg, rgba(255,255,255,0.45) 0, rgba(255,255,255,0) 50%, rgba(0,0,0,0.2) 100%), ${P.safe}`,
          border: `6px solid ${P.ink}`, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: mono, fontWeight: 800, fontSize: 22, color: P.white,
          boxShadow: '0 14px 18px rgba(12,15,25,0.25)', zIndex: 1}}>ResGate</div>
        {[0, 1, 2, 3, 4].map((i) => <div key={i} style={{position: 'absolute', left: 8 + i * 22, top: 70, width: 12, height: 470, background: bar, borderRadius: 6}} />)}
      </div>
      {/* chips try to cross and bounce back */}
      <Flight f={f} start={16} n={5} every={11} dur={14} a={[260, 860]} b={[420, 760]} lift={0.1} render={() => <Chip kind="GPU" />} />
      <Flight f={f} start={30} n={5} every={11} dur={14} a={[420, 760]} b={[372, 1000]} lift={0.15} spin={40} render={() => <Chip kind="GPU" />} />
      <Pile f={f} start={44} n={5} every={11} x={372} y={1010} spread={60} render={() => <Chip kind="GPU" />} />
      {/* every bounce flashes the gate */}
      <div style={{position: 'absolute', left: 380, top: 500, width: 210, height: 580, borderRadius: 30, background: P.safe,
        opacity: 0.3 * Math.max(0, ...[30, 41, 52, 63, 74].map((h) => Math.max(0, 1 - Math.abs(f - h) / 5)))}} />
    </>)}
    <Abs y={20} w={900} style={{textAlign: 'center'}}><Big size={40} c={P.muted} w={700}>攻击成功率</Big></Abs>
    <Swap x={450} y={200} f={f} strike={p.a + 6} turn={p.b + 8} from="84.1%" to="23.6%" size={108} color={P.safe} dim={P.muted} line={P.hijack} />
    <Sticker x={450} y={420} p={pop(f, p.c, 9)} rot={-3} size={34} bg={P.ink} color={P.white}>正常任务成功率 90.4% → 89.3%</Sticker>
  </>;
};
Gate.backdrop = backdrop(P.hijackGround, P.safeGround, (f) => ramp(f, 6, 46), false, 1010);
Gate.sfx = (cue) => {
  const p = gatePlan(cue);
  return [{at: 0, kind: 'thud', gain: 0.14}, ...[0, 1, 2, 3, 4].map((i) => ({at: 30 + i * 11, kind: 'block', gain: 0.08})), {at: p.a + 6, kind: 'whoosh-short', gain: 0.08},
    {at: p.b + 8, kind: 'thud', gain: 0.12}, {at: p.c, kind: 'chime', gain: 0.1}];
};

/* ---------- 8 ending (held): guarding the key isn't enough — whose errand is it running? ---------- */

const endPlan = (cue: Cue) => ({a: cue('a', 36), b: cue('b', 66)});
const End: Scene = ({f, cue}) => {
  const p = endPlan(cue);
  return <>
    <Abs y={40} w={900} style={{textAlign: 'center'}}>
      <In f={f} at={-12}><Big size={84}>钥匙 <span style={{color: P.safe}}>守住了 ✓</span></Big></In>
      <In f={f} at={p.b - 4} style={{marginTop: 18}}><Big size={84}>钱 <span style={{color: P.hijack}}>替谁花？</span></Big></In>
    </Abs>
    <Bubble f={f} at={-20} x={150} y={380} edge={P.safe} size={44} tail="down" badge={<Shield size={60} />}>“密钥不能给你，怕泄露。”</Bubble>
    <Bot f={f} x={450} y={1060} s={1.9} mood="proud" holdKey />
    <Annot x={690} y={560} tx={600} ty={700} f={f} at={p.b + 16} size={48} color={P.hijack}>问一句：这是谁的活？</Annot>
  </>;
};
End.backdrop = backdrop(P.safeGround, P.hijackGround, (f, cue) => 0.35 * ramp(f, endPlan(cue).b - 4, endPlan(cue).b + 10));
End.sfx = (cue) => {
  const p = endPlan(cue);
  return [{at: 0, kind: 'pop', gain: 0.08}, {at: p.b - 4, kind: 'thud', gain: 0.1}, {at: p.b + 16, kind: 'paper', gain: 0.08}];
};

/** Cover anchor (880 × 800, rendered at f = 0): the proud agent with the key, stamped 被劫持, the stranger's pile beside it. */
const Cover: Scene = () => <>
  <Bot f={0} x={330} y={790} s={2.4} mood="proud" holdKey />
  <Stamp x={560} y={130} f={30} at={0} size={120} color={P.hijack} rot={-10}>被劫持</Stamp>
  <Stranger x={760} y={790} s={1.35} />
  {[[640, 735, -12, 'GPU'], [700, 748, 8, 'API'], [668, 690, -4, 'GPU']].map(([x, y, r, k], i) => <div key={i} style={{position: 'absolute', left: x as number, top: y as number, transform: `rotate(${r}deg)`}}><Chip kind={k as 'GPU' | 'API'} /></div>)}
</>;

export const agentComputeHijackV3Scenes: Record<string, Scene> = {
  'ach3.hook': Hook, 'ach3.ask': Ask, 'ach3.turn': Turn, 'ach3.models': Models, 'ach3.cases': Cases, 'ach3.defense': Defense, 'ach3.gate': Gate, 'ach3.end': End,
  'ach3.cover': Cover,
};
