import React from 'react';
import {Img, OffthreadVideo, staticFile} from 'remotion';
import {font} from '../theme';
import {clamp, ease, springStep, springTrack} from '../../fx';
import {Cue, S, Scene, hitOf, phaseOp} from '../paper';
import {A, B, BG, Big, DIM, INK, LINE, Mono, PANEL, STEEL, count, fmt, mono} from '../tech';

// Headroom — tool intro (≤ 60 s, full-screen 9:16). Script: inputs/headroom/script.md; storyboard: tutorials/headroom.storyboard.md.
// Stage = the "full" layout, 900 × 1080 at (60, 200); keep what matters above y 1030.
// Every number is the project's own ("官方数据" / "官方演示"); nobody here has installed or tested Headroom.
// The README's 10,144 → 1,260 demo has no footage in the GIF, so the hook draws a labelled schematic (示意) instead.

const W = 900;
const Root: React.FC<{children: React.ReactNode}> = ({children}) => <div style={{position: 'relative', width: W, height: 1080}}>{children}</div>;
const Abs: React.FC<{x?: number; y: number; w?: number; style?: React.CSSProperties; children: React.ReactNode}> = ({x = 0, y, w, style, children}) => (
  <div style={{position: 'absolute', left: x, top: y, width: w, ...style}}>{children}</div>
);
const popIn = (f: number, at: number) => {
  const k = springStep(S(f), S(at), {f: 2.6, z: 0.62});
  const sq = hitOf(f, [at + 4], 1);
  return {opacity: clamp(k * 2), transform: `scale(${(0.6 + 0.4 * k) * (1 + 0.04 * sq)}, ${(0.6 + 0.4 * k) * (1 - 0.05 * sq)})`};
};
const Tag: React.FC<{children: React.ReactNode; c?: string}> = ({children, c = DIM}) => (
  <div style={{display: 'inline-block', border: `3px solid ${c}`, padding: '2px 14px'}}><Mono size={40} c={c} w={700}>{children}</Mono></div>
);
const Chip: React.FC<{size?: number; c?: string; children: React.ReactNode}> = ({size = 72, c = INK, children}) => (
  <div style={{display: 'inline-block', background: PANEL, border: `4px solid ${c}`, padding: '4px 22px', fontFamily: font, fontWeight: 900, fontSize: size,
    color: c, whiteSpace: 'nowrap'}}>{children}</div>
);

/* ---------- log schematic: grey lines with one FATAL line; `k` 0 → 1 collapses everything but FATAL ---------- */

const LOG_LINES = Array.from({length: 22}, (_, i) => ({w: 260 + ((i * 137) % 520), fatal: i === 15}));
const LogBlock: React.FC<{k: number; boxed: number; w?: number; line?: number}> = ({k, boxed, w = 820, line = 26}) => (
  <div style={{position: 'relative', width: w, border: `3px solid ${LINE}`, background: 'rgba(18,38,61,0.75)', padding: '14px 18px'}}>
    {LOG_LINES.map((l, i) => {
      const keep = l.fatal ? 1 : 1 - 0.78 * ease.inOutCubic(clamp(k * 1.25 - (i % 7) * 0.035));
      return <div key={i} style={{height: l.fatal ? 56 : line * keep, marginBottom: l.fatal ? 6 : 6 * keep, opacity: l.fatal ? 1 : 0.35 + 0.65 * keep, display: 'flex', alignItems: 'center',
        gap: 14, overflow: 'hidden'}}>
        {l.fatal
          ? <><div style={{fontFamily: mono, fontWeight: 800, fontSize: 44, color: B, outline: boxed > 0 ? `${4 * boxed}px solid ${B}` : undefined, outlineOffset: 6,
              padding: '0 6px'}}>FATAL</div><div style={{height: 18, width: 420, background: B, opacity: 0.8}} /></>
          : <div style={{height: Math.max(3, line * keep - 10), width: l.w * (w / 820), background: STEEL, opacity: 0.45}} />}
      </div>;
    })}
  </div>
);

/* ---------- S1 hook: 10,144 → 1,260, the FATAL line survives ---------- */

const hookPlan = (cue: Cue) => ({a: cue('a', 69), b: cue('b', 124)});
const Hook: Scene = ({f, cue}) => {
  const p = hookPlan(cue);
  const n = count(f, p.a, 1260, 26, 10144);
  const k = clamp((f - p.a) / 26);
  const landed = f >= p.a + 26;
  return <Root>
    <Abs y={0}><Tag c={INK}>官方数据 · README</Tag></Abs>
    <Abs y={70}><div style={{fontFamily: mono, fontWeight: 800, fontSize: 176, lineHeight: 1, color: A, letterSpacing: -4,
      transform: `scale(${1 + 0.05 * hitOf(f, [p.a + 26], 1)})`, transformOrigin: '0% 50%'}}>{fmt(n)}</div></Abs>
    <Abs y={252} style={{opacity: landed ? 1 : 0.55}}><Big size={100} c={landed ? INK : DIM}>10,144 → 1,260</Big></Abs>
    <Abs y={400}>
      <LogBlock k={k} boxed={clamp((f - p.b + 2) / 6)} />
      <Abs x={680} y={-26} style={{background: BG, padding: '0 10px'}}><Mono size={40}>示意</Mono></Abs>
    </Abs>
    {f >= p.b - 1 && <Abs x={430} y={400 + 150} style={{...popIn(f, p.b), transformOrigin: '0% 50%'}}>
      <div style={{background: BG, border: `5px solid ${B}`, padding: '6px 22px', fontFamily: font, fontWeight: 900, fontSize: 64, color: B, whiteSpace: 'nowrap'}}>报错还在 ✓</div>
    </Abs>}
  </Root>;
};
Hook.sfx = (cue) => {
  const p = hookPlan(cue);
  return [{at: p.a, kind: 'whoosh-short', gain: 0.1}, {at: p.a + 26, kind: 'thud', gain: 0.18}, {at: p.b, kind: 'stamp', gain: 0.18}];
};

/* ---------- S2 pain: logs, search results, JSON fly into the model; the token meter climbs ---------- */

const painPlan = (cue: Cue) => ({a: cue('a', 82), b: cue('b', 98), c: cue('c', 136), d: cue('d', 162)});
const PAIN_CHIPS = ['日志', '搜索结果', 'JSON'];
const MODEL = {x: 270, y: 470, w: 360, h: 200};
const Pain: Scene = ({f, cue}) => {
  const p = painPlan(cue);
  const ats = [p.a, p.b, p.c];
  const fed = ats.filter((at) => f >= at + 14).length;
  const meter = springTrack(S(f), 0.06, ats.map((at, i) => ({at: S(at + 14), to: 0.06 + 0.3 * (i + 1)})), {f: 1.8, z: 0.7});
  return <Root>
    <Abs y={0} style={phaseOp(f, 4)}><Chip size={64} c={STEEL}>Claude Code</Chip></Abs>
    {PAIN_CHIPS.map((name, i) => {
      const at = ats[i];
      const t = clamp((f - at) / 16), e = ease.inOutCubic(t);
      const x0 = [0, 230, 560][i], y0 = 170 + (i % 2) * 120;
      const x = x0 + (MODEL.x + 40 + i * 60 - x0) * e, y = y0 + (MODEL.y + 60 - y0) * e;
      return <Abs key={name} x={x} y={y} style={{opacity: f >= at + 16 ? 0 : f < at ? 0.35 : 1, transform: `scale(${1 - 0.5 * e + 0.06 * hitOf(f, [at], 1)})`, transformOrigin: '0 0'}}>
        <Chip c={i === 2 ? B : INK}>{name}</Chip>
      </Abs>;
    })}
    <Abs x={MODEL.x} y={MODEL.y} w={MODEL.w} style={{height: MODEL.h, border: `4px solid ${INK}`, background: PANEL, display: 'flex', alignItems: 'center',
      justifyContent: 'center', transform: `scale(${1 + 0.04 * hitOf(f, ats.map((a) => a + 14), 1)})`}}>
      <Big size={72}>模型</Big>
    </Abs>
    <Abs y={720} w={W}>
      <div style={{display: 'flex', alignItems: 'center', gap: 18}}>
        <Mono size={40} c={INK}>token</Mono>
        <div style={{flex: 1, height: 44, border: `3px solid ${LINE}`}}><div style={{width: `${clamp(meter) * 100}%`, height: '100%', background: A}} /></div>
        <Mono size={40} c={A} w={800}>{fed ? '+'.repeat(fed) : ''}</Mono>
      </div>
    </Abs>
    {f >= p.d - 1 && <Abs y={820} w={W} style={{textAlign: 'center', ...popIn(f, p.d)}}><Big size={96}>= 烧 <span style={{color: A}}>token</span></Big></Abs>}
  </Root>;
};
Pain.sfx = (cue) => {
  const p = painPlan(cue);
  return [...[p.a, p.b, p.c].map((at) => ({at: at + 14, kind: 'tap', gain: 0.16})), {at: p.d, kind: 'thud', gain: 0.16}];
};

/* ---------- S3 what: your AI tool → local compression → model; the chips come out thinner ---------- */

const whatPlan = (cue: Cue) => ({a: cue('a', 134), b: cue('b', 163), c: cue('c', 100), d: cue('d', 66)});
const FLOW = [{y: 210, label: '你的 AI 工具', c: STEEL}, {y: 410, label: '本机压缩', c: A}, {y: 610, label: '模型', c: STEEL}];
const What: Scene = ({f, cue}) => {
  const p = whatPlan(cue);
  const t = ease.inOutCubic(clamp((f - p.a + 20) / 40));
  // the three chips travel down the pipe; past the compression box they are squeezed thin
  const y = 210 + 120 + t * 400, thin = 1 - 0.6 * clamp((t - 0.45) / 0.2);
  return <Root>
    <Abs y={0}><Big size={140}>Headroom</Big></Abs>
    {FLOW.map((b, i) => {
      // "发给模型" lights the model box; "先在你电脑上" fills the local-compression box
      const lit = i === 1 ? clamp((f - p.c) / 8) : i === 2 ? clamp((f - p.d) / 6) * (1 - clamp((f - p.c) / 10)) : 0;
      const hit = hitOf(f, i === 1 ? [p.c] : i === 2 ? [p.d] : [], 1);
      return <React.Fragment key={b.label}>
      <Abs x={190} y={b.y} w={520} style={{...phaseOp(f, 6 + i * 10), border: `4px solid ${b.c}`, padding: '18px 0', textAlign: 'center',
        background: i === 1 && lit ? `rgba(255,171,64,${0.9 * lit})` : i === 2 && lit ? `rgba(207,219,234,${0.35 * lit})` : PANEL, scale: `${1 + 0.05 * hit}`}}>
        <Big size={56} c={i === 1 && lit > 0.5 ? BG : b.c === A ? A : INK}>{b.label}</Big>
      </Abs>
      {i < 2 && <Abs x={430} y={b.y + 108} style={phaseOp(f, 12 + i * 10)}><Big size={64} c={DIM}>↓</Big></Abs>}
    </React.Fragment>;
    })}
    {f < p.a + 40 && <Abs x={140} y={y} w={620} style={{display: 'flex', justifyContent: 'center', gap: 12, transform: `scaleY(${thin})`}}>
      {PAIN_CHIPS.map((c, i) => <div key={c} style={popIn(f, 24 + i * 12)}><Chip size={40} c={INK}>{c}</Chip></div>)}
    </Abs>}
    {f >= p.a + 34 && <Abs x={140} y={700} w={620} style={{display: 'flex', justifyContent: 'center', gap: 12, ...phaseOp(f, p.a + 34)}}>
      {PAIN_CHIPS.map((c) => <div key={c} style={{height: 22, width: 150, background: A}} />)}
    </Abs>}
    {f >= p.b - 4 && <Abs y={760} w={W} style={phaseOp(f, p.b - 4)}>
      <div style={{border: `3px solid ${INK}`, background: BG, padding: '14px 22px'}}>
        <Mono size={40} c={DIM}>headroomlabs-ai/headroom</Mono><Mono size={40} c={DIM}>Apache-2.0</Mono>
        <Big size={64} style={{marginTop: 6}}>开源 · GitHub 7.5 万+ ⭐</Big>
      </div>
    </Abs>}
  </Root>;
};
What.sfx = (cue) => {
  const p = whatPlan(cue);
  return [...[24, 36, 48].map((at) => ({at: at + 2, kind: 'pop', gain: 0.1})), {at: p.a, kind: 'whoosh-short', gain: 0.1}, {at: p.a + 14, kind: 'tick', gain: 0.12}, {at: p.b, kind: 'tap', gain: 0.16}];
};

/* ---------- S4 how: one command (real official demo footage + a code card copied from the README) ---------- */

const howPlan = (cue: Cue) => ({one: 44, a: cue('a', 88), b: cue('b', 126), c: cue('c', 148)});
const CMD = 'headroom wrap claude';
const AGENTS = 'Claude Code · Codex · Copilot · Aider · OpenCode · Cline · Goose · Continue · OpenHands …';
const How: Scene = ({f, cue}) => {
  const p = howPlan(cue);
  const typed = Math.round(CMD.length * clamp((f - (p.a - 40)) / 36));
  return <Root>
    <Abs y={0} w={W} style={{height: 425, outline: `3px solid ${STEEL}`, overflow: 'hidden', background: '#000'}}>
      <OffthreadVideo src={staticFile('video/headroom/wrap.mp4')} muted style={{width: '100%', height: '100%', objectFit: 'cover',
        transform: `scale(${1 + 0.12 * clamp(f / 120)})`, transformOrigin: '20% 40%'}} />
      <div style={{position: 'absolute', right: 0, bottom: 0, background: 'rgba(12,26,44,0.88)', color: INK, fontFamily: font, fontWeight: 700, fontSize: 40,
        padding: '4px 12px', whiteSpace: 'nowrap'}}>@headroomlabs-ai｜官方演示</div>
    </Abs>
    <Abs y={450} w={W} style={{border: `4px solid ${A}`, background: BG, padding: '18px 26px'}}>
      {f >= p.one - 1 && <div style={{...popIn(f, p.one), transformOrigin: '0% 50%', marginBottom: 8}}><Big size={64} c={A}>一条命令</Big></div>}
      <div style={{fontFamily: mono, fontWeight: 800, fontSize: 60, color: INK, whiteSpace: 'nowrap'}}>
        <span style={{color: DIM}}>$ </span>{CMD.slice(0, typed)}<span style={{opacity: typed < CMD.length && Math.floor(f / 8) % 2 ? 1 : 0, color: A}}>▍</span>
      </div>
    </Abs>
    {f >= p.b - 1 && <Abs y={660} w={W} style={{textAlign: 'center', ...popIn(f, p.b)}}><Big size={96}>不用改代码</Big></Abs>}
    {f >= p.c - 4 && <Abs y={800} w={W} style={{overflow: 'hidden', height: 90, ...phaseOp(f, p.c - 4)}}>
      <div style={{fontFamily: font, fontWeight: 900, fontSize: 56, color: INK, whiteSpace: 'nowrap', transform: `translateX(${200 - (f - p.c) * 7}px)`}}>
        {AGENTS.split(' · ').map((n, i) => <span key={n} style={{color: n === 'Codex' || n === 'Copilot' ? B : INK}}>{i ? ' · ' : ''}{n}</span>)}
      </div>
    </Abs>}
    {f >= p.c - 4 && <Abs y={910} style={phaseOp(f, p.c)}><Mono size={40}>支持列表来自 README</Mono></Abs>}
  </Root>;
};
How.sfx = (cue) => {
  const p = howPlan(cue);
  return [{at: p.one, kind: 'tap', gain: 0.14}, {at: p.a - 4, kind: 'tick', gain: 0.12}, {at: p.b, kind: 'stamp', gain: 0.16}, {at: p.c, kind: 'whoosh-short', gain: 0.08}];
};

/* ---------- S5 range: the four official scenarios ---------- */

const rangePlan = (cue: Cue) => ({a: cue('a', 74), b: cue('b', 160), c: cue('c', 225)});
const BARS = [{label: '排查故障', pct: 57, note: '55,957 → 24,340'}, {label: '代码库探索', pct: 42}, {label: 'Issue 整理', pct: 30}, {label: '搜代码', pct: 21}];
const Range: Scene = ({f, cue}) => {
  const p = rangePlan(cue);
  return <Root>
    <Abs y={0}><Tag c={INK}>官方数据 · 4 个场景</Tag></Abs>
    {BARS.map((r, i) => {
      const at = p.a + i * 8;
      const grow = springStep(S(f), S(at), {f: 1.6, z: 0.75});
      const lit = i === 0 ? f >= p.b : i === 3 ? f >= p.c : false;
      const c = lit ? (i === 0 ? A : B) : STEEL;
      const flash = i === 0 ? hitOf(f, [p.b], 1) : i === 3 ? hitOf(f, [p.c], 1) : 0;
      const bw = (r.pct / 60) * 600 * clamp(grow);
      return <Abs key={r.label} y={100 + i * 165} w={W} style={{opacity: f >= at - 2 ? 1 : 0.25}}>
        <div style={{display: 'flex', alignItems: 'baseline', gap: 24}}><Big size={52} c={lit ? c : INK}>{r.label}</Big>{r.note && <Mono size={40} c={DIM}>{r.note}</Mono>}</div>
        <div style={{display: 'flex', alignItems: 'center', gap: 18, marginTop: 6}}>
          <div style={{height: 56, width: Math.max(4, bw), background: c, transform: `scaleY(${1 + 0.15 * flash})`}} />
          <Mono size={56} c={lit ? c : INK} w={800}>{Math.round(r.pct * clamp(grow))}%</Mono>
        </div>
      </Abs>;
    })}
    <Abs x={380} y={790} style={phaseOp(f, p.b)}>
      <Img src={staticFile('images/tutorials/headroom/hero.png')} style={{width: 500, display: 'block', outline: `2px solid ${LINE}`}} />
    </Abs>
    <Abs x={0} y={800} w={360} style={phaseOp(f, p.b)}><Mono size={40}>官方配图：</Mono><Mono size={40}>排查故障</Mono><Mono size={40}>57%</Mono></Abs>
  </Root>;
};
Range.sfx = (cue) => {
  const p = rangePlan(cue);
  return [...[0, 8, 16, 24].map((d) => ({at: p.a + d + 6, kind: 'tick', gain: 0.1})), {at: p.b, kind: 'tap', gain: 0.18}, {at: p.c, kind: 'tap', gain: 0.18}];
};

/* ---------- S6 who: long agent runs vs. chat ---------- */

const whoPlan = (cue: Cue) => ({a: cue('a', 42), b: cue('b', 105)});
const Who: Scene = ({f, cue}) => {
  const p = whoPlan(cue);
  const col = (x: number, at: number, c: string, mark: string, l1: string, l2: string, faded: boolean) => f >= at - 2 && (
    <Abs x={x} y={120} w={430} style={{...popIn(f, at), transformOrigin: '50% 0%', height: 760, border: `5px solid ${c}`, background: PANEL, padding: '40px 28px',
      opacity: faded ? 0.92 : 1}}>
      <div style={{fontFamily: font, fontWeight: 900, fontSize: 130, color: c, lineHeight: 1}}>{mark}</div>
      <Big size={88} c={INK} style={{marginTop: 50}}>{l1}</Big>
      <Big size={64} c={faded ? DIM : INK} style={{marginTop: 26, whiteSpace: 'nowrap'}}>{l2}</Big>
    </Abs>);
  return <Root>
    {col(0, p.a, A, '✅', '长任务', '工具输出多', false)}
    {col(470, p.b, B, '✖', '聊天', '写文章', true)}
    {/* "基本省不下来": a strike across the chat card */}
    {f >= p.b + 34 && <svg width={430} height={760} style={{position: 'absolute', left: 470, top: 120}}>
      <line x1={30} y1={600} x2={400} y2={180} stroke={B} strokeWidth={10} strokeLinecap="round" strokeDasharray={560}
        strokeDashoffset={560 * (1 - ease.outCubic(clamp((f - p.b - 34) / 10)))} />
    </svg>}
  </Root>;
};
Who.sfx = (cue) => {
  const p = whoPlan(cue);
  return [{at: p.a + 4, kind: 'tap', gain: 0.16}, {at: p.b + 4, kind: 'tap', gain: 0.16}, {at: p.b + 36, kind: 'whoosh-short', gain: 0.08}];
};

/* ---------- S7 safe: the original stays on your machine and can be pulled back ---------- */

const safePlan = (cue: Cue) => ({a: cue('a', 58), b: cue('b', 132)});
const Safe: Scene = ({f, cue}) => {
  const p = safePlan(cue);
  const pull = ease.inOutCubic(clamp((f - p.b + 10) / 24));
  return <Root>
    <Abs x={190} y={0} w={520} style={{border: `4px solid ${STEEL}`, background: PANEL, padding: '14px 0', textAlign: 'center'}}><Big size={56}>模型</Big></Abs>
    {/* what the model gets: a thin compressed block */}
    <Abs x={190} y={130} w={520} style={phaseOp(f, 0)}><div style={{height: 26, background: A}} /><Mono size={40} style={{marginTop: 8}}>压缩后发给模型</Mono></Abs>
    {f >= p.a - 4 && <Abs y={470} w={W} style={{...phaseOp(f, p.a - 4), border: `4px dashed ${INK}`, padding: '20px 26px', height: 400}}>
      <div style={{transform: `translateY(${-150 * pull}px)`}}>
        {Array.from({length: 7}, (_, i) => <div key={i} style={{height: 22, width: 300 + ((i * 131) % 460), background: pull > 0.5 ? B : STEEL, opacity: 0.6, marginBottom: 12}} />)}
      </div>
      <Abs x={26} y={300}><Big size={64}>原文留在本机</Big></Abs>
    </Abs>}
    {f >= p.b - 10 && <svg width={60} height={380} style={{position: 'absolute', left: 790, top: 90, opacity: clamp((f - p.b + 10) / 8)}}>
      <path d="M30 376 L30 14 M12 34 L30 10 L48 34" stroke={B} strokeWidth={6} fill="none" strokeDasharray="14 10" strokeLinecap="round" />
    </svg>}
    {f >= p.b - 2 && <Abs x={430} y={236} style={{...popIn(f, p.b), transformOrigin: '100% 50%'}}><Big size={64} c={B}>需要时取回</Big></Abs>}
    <Abs y={890} w={W} style={phaseOp(f, 20)}>
      <Mono size={40} c={DIM}>官方数据</Mono>
      <Big size={40} c={INK} w={800}>官方测数学题：准确率 0.870 → 0.870</Big>
    </Abs>
  </Root>;
};
Safe.sfx = (cue) => {
  const p = safePlan(cue);
  return [{at: p.a, kind: 'tap', gain: 0.14}, {at: p.b, kind: 'whoosh-short', gain: 0.1}];
};

/* ---------- S8 verdict ---------- */

const Verdict: Scene = ({f}) => {
  const push = 1 + 0.06 * clamp(f / 160);
  return <Root><div style={{position: 'absolute', inset: 0, transform: `scale(${push})`, transformOrigin: '450px 500px'}}>
    <Abs y={300} w={W} style={{textAlign: 'center', ...popIn(f, 2)}}>
      <Big size={130}>天天跑 AI</Big>
      <Big size={130}>写代码？</Big>
    </Abs>
    {f >= 30 && <Abs y={710} w={W} style={{textAlign: 'center', ...phaseOp(f, 30)}}><Big size={72} c={A}>Headroom · 开源</Big></Abs>}
  </div></Root>;
};
Verdict.sfx = () => [{at: 2, kind: 'stamp', gain: 0.2}];

/* ---------- cover anchor (880 × 800): the number, and the log collapsing around the FATAL line ---------- */

const CoverAnchor: Scene = () => <div style={{position: 'relative', width: 880, height: 800, display: 'flex', flexDirection: 'column', justifyContent: 'center',
  alignItems: 'center', fontFamily: font, fontWeight: 900, lineHeight: 1}}>
  <div style={{fontSize: 190, color: INK, letterSpacing: -2}}>10144 →</div>
  <div style={{fontSize: 290, color: A, letterSpacing: -4, marginTop: 10}}>1260</div>
</div>;

export const headroomScenes: Record<string, Scene> = {
  'hr.hook': Hook,
  'hr.pain': Pain,
  'hr.what': What,
  'hr.how': How,
  'hr.range': Range,
  'hr.who': Who,
  'hr.safe': Safe,
  'hr.verdict': Verdict,
  'hr.cover': CoverAnchor,
};
