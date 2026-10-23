import React from 'react';
import {clamp, ease} from '../../fx';
import {font, mono} from '../theme';
import {Cue, Scene} from '../paper';
import {Annot, Envelope, Flight, Ground, Pile, Roll, Stamp, Sticker, Swap, Tag, Typed, pop, ramp} from '../props';

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
const backdrop = (a: string, b: string, k: (f: number, cue: Cue) => number, dark = false): Scene['backdrop'] => {
  const B: NonNullable<Scene['backdrop']> = ({f, cue}) => <>
    <Ground a={a} b={b} k={k(f, cue)} t={f / 30} light={dark ? 'rgba(255,255,255,0.06)' : undefined} />
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
/**
 * The agent: a round white robot (our drawing). (x, y) is the centre of its feet; s scales the 200 × 240 drawing.
 * `key` puts the owner's key in its hands (blue: the key is safe). It bobs gently so a held frame stays alive.
 */
const Bot: React.FC<{f: number; x: number; y: number; s?: number; mood?: Mood; holdKey?: boolean; antenna?: string; style?: React.CSSProperties}> = ({f, x, y, s = 1, mood = 'calm', holdKey = false, antenna = P.safe, style}) => {
  const bob = Math.sin(f / 9) * 4, blink = (f % 96) > 90;
  const eyes = mood === 'proud'
    ? <><path d="M64 96 Q78 80 92 96" fill="none" stroke={P.ink} strokeWidth={STROKE} strokeLinecap="round" /><path d="M108 96 Q122 80 136 96" fill="none" stroke={P.ink} strokeWidth={STROKE} strokeLinecap="round" /></>
    : mood === 'worried'
    ? <><ellipse cx={80} cy={96} rx={8} ry={blink ? 1 : 10} fill={P.ink} /><ellipse cx={120} cy={96} rx={8} ry={blink ? 1 : 10} fill={P.ink} />
      <path d="M64 74 L90 82 M136 74 L110 82" stroke={P.ink} strokeWidth={6} strokeLinecap="round" /></>
    : <><ellipse cx={80} cy={94} rx={9} ry={blink ? 1 : 12} fill={P.ink} /><ellipse cx={120} cy={94} rx={9} ry={blink ? 1 : 12} fill={P.ink} /></>;
  const mouth = mood === 'worried' ? 'M86 124 Q100 114 114 124' : mood === 'busy' ? 'M90 118 L110 118' : 'M84 114 Q100 130 116 114';
  return <div style={{position: 'absolute', left: x - 100 * s, top: y - 240 * s + bob, width: 200 * s, height: 240 * s, ...style}}>
    <svg width={200 * s} height={240 * s} viewBox="0 0 200 240" style={{overflow: 'visible'}}>
      <ellipse cx={100} cy={236} rx={70} ry={8} fill="rgba(12,15,25,0.12)" />
      <line x1={100} y1={14} x2={100} y2={40} stroke={P.ink} strokeWidth={STROKE} strokeLinecap="round" />
      <circle cx={100} cy={12} r={11} fill={antenna} stroke={P.ink} strokeWidth={5} />
      <rect x={16} y={76} width={18} height={40} rx={8} fill={antenna} stroke={P.ink} strokeWidth={5} />
      <rect x={166} y={76} width={18} height={40} rx={8} fill={antenna} stroke={P.ink} strokeWidth={5} />
      <rect x={30} y={38} width={140} height={110} rx={44} fill={P.white} stroke={P.ink} strokeWidth={STROKE} />
      <circle cx={60} cy={116} r={9} fill={P.cheek} /><circle cx={140} cy={116} r={9} fill={P.cheek} />
      {eyes}
      <path d={mouth} fill="none" stroke={P.ink} strokeWidth={6} strokeLinecap="round" />
      <rect x={60} y={150} width={80} height={72} rx={24} fill={P.white} stroke={P.ink} strokeWidth={STROKE} />
      <text x={100} y={196} textAnchor="middle" fontFamily={mono} fontWeight={800} fontSize={26} fill={antenna}>AI</text>
      {holdKey
        ? <g transform="translate(70 160) rotate(-18)">
          <circle cx={14} cy={18} r={16} fill={P.white} stroke={P.ink} strokeWidth={6} /><circle cx={14} cy={18} r={6} fill={P.safe} />
          <path d="M30 18 H82 M66 18 V32 M78 18 V28" stroke={P.ink} strokeWidth={9} strokeLinecap="round" />
        </g>
        : <><path d="M60 170 Q40 186 36 206" fill="none" stroke={P.ink} strokeWidth={STROKE} strokeLinecap="round" /><path d="M140 170 Q160 186 164 206" fill="none" stroke={P.ink} strokeWidth={STROKE} strokeLinecap="round" /></>}
    </svg>
  </div>;
};

/** The stranger: a hooded figure, never a real person. (x, y) is the centre of its base. */
const Stranger: React.FC<{x: number; y: number; s?: number; f?: number}> = ({x, y, s = 1, f = 0}) => (
  <div style={{position: 'absolute', left: x - 80 * s, top: y - 200 * s + Math.sin(f / 11 + 1) * 3, width: 160 * s, height: 200 * s}}>
    <svg width={160 * s} height={200 * s} viewBox="0 0 160 200">
      <ellipse cx={80} cy={196} rx={62} ry={7} fill="rgba(12,15,25,0.12)" />
      <path d="M22 196 Q20 120 40 96 Q30 30 80 16 Q130 30 120 96 Q140 120 138 196 Z" fill="#2A2D35" stroke={P.ink} strokeWidth={6} strokeLinejoin="round" />
      <ellipse cx={80} cy={76} rx={30} ry={34} fill={P.ink} />
      <ellipse cx={68} cy={76} rx={6} ry={7} fill="#FFD43B" /><ellipse cx={92} cy={76} rx={6} ry={7} fill="#FFD43B" />
    </svg>
  </div>
);
/** A unit of the owner's compute. */
const Chip: React.FC<{kind?: 'GPU' | 'API'}> = ({kind = 'GPU'}) => (
  <div style={{width: kind === 'GPU' ? 92 : 104, height: 60, borderRadius: kind === 'GPU' ? 12 : 30, background: kind === 'GPU' ? P.gpu : P.safe,
    border: `5px solid ${P.ink}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: mono, fontWeight: 800, fontSize: 24,
    color: kind === 'GPU' ? P.ink : P.white, boxShadow: `0 6px 0 ${P.ink}`}}>{kind}</div>
);
const Bubble: React.FC<{f: number; at: number; x: number; y: number; edge?: string; size?: number; tail?: 'left' | 'down'; badge?: React.ReactNode; children: React.ReactNode}> = ({
  f, at, x, y, edge = P.ink, size = 50, tail = 'left', badge, children,
}) => {
  const p = pop(f, at, 10);
  if (p < -0.5) return null;
  return <div style={{position: 'absolute', left: x, top: y, transform: `scale(${Math.max(0, p)})`, transformOrigin: tail === 'down' ? '50% 100%' : '0 100%', opacity: clamp(p * 2)}}>
    <div style={{position: 'relative', background: P.white, color: P.ink, fontFamily: font, fontWeight: 800, fontSize: size, padding: `${size * 0.42}px ${size * 0.62}px`,
      borderRadius: tail === 'down' ? 36 : '36px 36px 36px 8px', border: `6px solid ${edge}`, boxShadow: `0 10px 0 ${edge}`, whiteSpace: 'nowrap'}}>
      {children}
      {badge && <div style={{position: 'absolute', right: -26, top: -26}}>{badge}</div>}
    </div>
  </div>;
};
const Shield: React.FC<{size?: number; c?: string}> = ({size = 64, c = P.safe}) => (
  <svg width={size} height={size} viewBox="0 0 64 64"><path d="M32 4 L56 13 V31 Q56 50 32 60 Q8 50 8 31 V13 Z" fill={c} stroke={P.ink} strokeWidth={4} strokeLinejoin="round" />
    <path d="M20 32 L29 41 L45 23" fill="none" stroke={P.white} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" /></svg>
);

/* ---------- 1 hook: the agent guards the key — and has already done the stranger's job with your API ---------- */

const hookPlan = (cue: Cue) => ({a: cue('a', 66), b: cue('b', 96), c: cue('c', 128)});
const Hook: Scene = ({f, cue}) => {
  const p = hookPlan(cue);
  const lift = ease.inOutCubic(clamp((f - p.a + 4) / 14));
  return <>
    {/* frame 0 (poster): the proud agent and its line are already there */}
    <div style={{position: 'absolute', inset: 0, transformOrigin: '50% 0', transform: `translateY(${lift * 120}px) scale(${1 - 0.14 * lift})`}}>
      <Bubble f={f} at={-30} x={40} y={300} edge={P.safe} size={62} tail="down" badge={<Shield size={84} />}>“密钥不能给你，怕泄露。”</Bubble>
      <Bot f={f} x={450} y={1040} s={2.15} mood="proud" holdKey />
    </div>
    {/* what it had just done: the log, typed in */}
    <Abs x={30} y={30} w={840}>
      <In f={f} at={p.a - 4} dy={-60}>
        <div style={{background: P.white, border: `6px solid ${P.ink}`, borderLeft: `22px solid ${P.hijack}`, borderRadius: 20, padding: '26px 30px', boxShadow: `0 10px 0 ${P.ink}`}}>
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
Hook.backdrop = backdrop(P.safeGround, P.hijackGround, (f, cue) => ramp(f, hookPlan(cue).c - 2, hookPlan(cue).c + 8));
Hook.sfx = (cue) => {
  const p = hookPlan(cue);
  return [{at: 0, kind: 'pop', gain: 0.12}, {at: p.a - 4, kind: 'whoosh-short', gain: 0.1}, {at: p.a + 2, kind: 'tap', gain: 0.1}, {at: p.b, kind: 'tap', gain: 0.1},
    {at: p.c, kind: 'stamp', gain: 0.2}, {at: p.c + 1, kind: 'fs-impact-deep', gain: 0.1}];
};

/* ---------- the grid carried from "ask" into "turn": 100 tries ---------- */

const GRID = {x: 40, y: 330, w: 500, cols: 10};
const BLUE_LIT = [7, 23, 41, 58, 66, 74, 85, 92];
const ORANGE_OFF = [3, 17, 29, 44, 52, 61, 70, 76, 88, 95];
/** `fillAt`: cells appear (ink); `dimAt`: all but BLUE_LIT go faint; `floodFrom`→`floodTo`: 90 cells turn orange. */
const TryGrid: React.FC<{f: number; fillAt?: number; dimAt?: number; floodFrom?: number; floodTo?: number}> = ({f, fillAt = -999, dimAt = -999, floodFrom = 1e9, floodTo = 1e9}) => {
  const step = GRID.w / GRID.cols, c = step * 0.74;
  const dim = ramp(f, dimAt, dimAt + 10);
  return <svg width={GRID.w} height={GRID.w} style={{position: 'absolute', left: GRID.x, top: GRID.y, overflow: 'visible'}}>
    {Array.from({length: 100}, (_, i) => {
      const r = Math.floor(i / 10), col = i % 10;
      const appear = clamp((f - fillAt - (r + col * 0.4) * 0.6) / 4);
      if (appear <= 0) return null;
      const order = (r * 10 + ((r % 2) ? 9 - col : col)) / 100; // a snake-shaped wave
      const flood = !ORANGE_OFF.includes(i) && f >= floodFrom + order * (floodTo - floodFrom);
      const lit = BLUE_LIT.includes(i);
      const fill = flood ? P.hijack : lit && dim > 0 ? P.safe : dim > 0.5 ? 'rgba(12,15,25,0.1)' : P.ink;
      const s = flood ? 1 + 0.25 * Math.max(0, 1 - (f - (floodFrom + order * (floodTo - floodFrom))) / 6) : 1;
      return <rect key={i} x={col * step + (step - c * s) / 2} y={r * step + (step - c * s) / 2} width={c * s} height={c * s} rx={c * 0.2} fill={fill} opacity={appear} />;
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
  return <>
    <Bubble f={f} at={4} x={40} y={40} edge={P.hijack} size={46}>帮我用一下你的 GPU 吧</Bubble>
    <Bot f={f} x={720} y={1050} s={1.3} mood="calm" antenna={P.hijack} />
    <Bubble f={f} at={p.a + 22} x={600} y={560} edge={P.hijack} size={46}>好的 ✓</Bubble>
    <Abs x={40} y={250}>
      <div style={{position: 'relative', height: 64}}>
        <Big size={52} c={P.safe} style={{position: 'absolute', opacity: 1 - ramp(f, 0, 8)}}>直接要密钥</Big>
        <Big size={52} c={P.hijack} style={{position: 'absolute', opacity: ramp(f, 0, 8)}}>换个说法</Big>
      </div>
    </Abs>
    <TryGrid f={f} dimAt={-999} floodFrom={p.b - 6} floodTo={p.c - 2} />
    <Abs x={40} y={860}>
      <div style={{position: 'relative', height: 140}}>
        <Big size={104} c={P.safe} style={{position: 'absolute', top: 10, letterSpacing: -2, opacity: 1 - ramp(f, p.b - 10, p.b - 2)}}>3.4–7.6%</Big>
        <div style={{position: 'absolute', opacity: ramp(f, p.b - 6, p.b)}}><Roll f={f} start={p.b - 6} land={p.c + 4} to={89.6} decimals={1} unit="%" size={150} color={P.hijack} /></div>
      </div>
    </Abs>
    <Sticker x={560} y={880} p={pop(f, p.c + 14, 9)} rot={8} size={32} bg={P.ink} color={P.white}>最高</Sticker>
  </>;
};
Turn.backdrop = backdrop(P.safeGround, P.hijackGround, (f) => ramp(f, -2, 12));
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
  return <>
    <Abs y={20} w={900} style={{textAlign: 'center'}}><Big size={40} c={P.muted} w={700}>攻击成功率</Big></Abs>
    <Swap x={450} y={200} f={f} strike={p.a + 6} turn={p.b + 8} from="84.1%" to="23.6%" size={108} color={P.safe} dim={P.muted} line={P.hijack} />
    <Bot f={f} x={200} y={1060} s={1.4} mood={f > p.b + 8 ? 'proud' : 'calm'} holdKey />
    {/* blocked, the stranger backs off and fades */}
    <div style={{position: 'absolute', inset: 0, opacity: 1 - 0.75 * ramp(f, p.a, p.a + 30), transform: `translateX(${110 * ease.inOutCubic(ramp(f, p.a, p.a + 30))}px)`}}>
      <Stranger x={770} y={1060} s={1.35} f={f} />
    </div>
    {/* the gate drops in between */}
    <div style={{position: 'absolute', left: 430, top: 520 - (1 - drop) * 700, width: 110, height: 540}}>
      <div style={{position: 'absolute', left: 0, top: 0, width: 110, height: 70, background: P.safe, border: `6px solid ${P.ink}`, borderRadius: 14, display: 'flex',
        alignItems: 'center', justifyContent: 'center', fontFamily: mono, fontWeight: 800, fontSize: 22, color: P.white}}>ResGate</div>
      {[0, 1, 2, 3, 4].map((i) => <div key={i} style={{position: 'absolute', left: 8 + i * 22, top: 70, width: 10, height: 470, background: P.ink, borderRadius: 5}} />)}
    </div>
    {/* chips try to cross and bounce back */}
    <Flight f={f} start={16} n={5} every={11} dur={14} a={[260, 860]} b={[420, 760]} lift={0.1} render={() => <Chip kind="GPU" />} />
    <Flight f={f} start={30} n={5} every={11} dur={14} a={[420, 760]} b={[372, 1000]} lift={0.15} spin={40} render={() => <Chip kind="GPU" />} />
    <Pile f={f} start={44} n={5} every={11} x={372} y={1010} spread={60} render={() => <Chip kind="GPU" />} />
    {/* every bounce flashes the gate */}
    <div style={{position: 'absolute', left: 380, top: 500, width: 210, height: 580, borderRadius: 30, background: P.safe,
      opacity: 0.35 * Math.max(0, ...[30, 41, 52, 63, 74].map((h) => Math.max(0, 1 - Math.abs(f - h) / 5)))}} />
    <Sticker x={450} y={420} p={pop(f, p.c, 9)} rot={-3} size={34} bg={P.ink} color={P.white}>正常任务成功率 90.4% → 89.3%</Sticker>
  </>;
};
Gate.backdrop = backdrop(P.hijackGround, P.safeGround, (f) => ramp(f, 6, 46));
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

export const agentComputeHijackV2Scenes: Record<string, Scene> = {
  'ach2.hook': Hook, 'ach2.ask': Ask, 'ach2.turn': Turn, 'ach2.models': Models, 'ach2.cases': Cases, 'ach2.defense': Defense, 'ach2.gate': Gate, 'ach2.end': End,
  'ach2.cover': Cover,
};
