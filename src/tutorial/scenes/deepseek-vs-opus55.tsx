import React from 'react';
import {Img, OffthreadVideo, staticFile} from 'remotion';
import {font} from '../theme';
import {clamp, springStep, springTrack} from '../../fx';
import {Cue, S, Scene, cam as camKey, dropLift, hitOf, layers, phaseOp} from '../paper';
import {A, B, BG, Big, DIM, INK, LINE, Mono, PANEL, Root, STEEL, Stage, mono} from '../tech';

// DeepSeek V4.1 Flash 1017 vs Opus 5.5 — writing code to make videos (≤ 60 s).
// Storyboard + brief: tutorials/deepseek-vs-opus55.storyboard.md. Material: inputs/deepseek-vs-opus55/ (muted working
// copies in public/video/deepseek-vs-opus55/, cut by scripts/clips/deepseek-vs-opus55.sh).
// One subject carries the film: "two blocks, Opus on top, DeepSeek below" — the two clips, then two chips in one slot,
// then the two halves of G with their data cards, then two bars, then the two verdict cards in the hook's positions.
// A (amber) = Opus, B (cyan) = DeepSeek. Every external clip carries "@author｜案例展示" bottom-right.

const V = (f: string) => staticFile(`video/deepseek-vs-opus55/${f}`);
/** Camera keys: ≤ 1.1 and never so low that the stage top slides under the HUD title. */
const cam = (at: number, x: number, y: number, z: number) => {
  const zz = Math.min(z, 1.1);
  return camKey(at, x, Math.min(y, 400 + (440 / zz - 400) / 0.55), zz);
};

const Title: React.FC<{f: number; items: {at: number; to?: number; k?: string; t: React.ReactNode; size?: number}[]}> = ({f, items}) => (
  <div style={{position: 'absolute', left: 0, top: 0, width: 880, height: 150}}>
    {items.map((it, i) => <div key={i} style={{position: 'absolute', left: 0, top: 0, width: 880, ...phaseOp(f, it.at, it.to ?? items[i + 1]?.at ?? 1e9)}}>
      {it.k && <Mono size={26} style={{marginBottom: 8}}>{it.k}</Mono>}
      <Big size={it.size ?? 64}>{it.t}</Big>
    </div>)}
  </div>
);
const a = (s: string) => <span style={{color: A}}>{s}</span>;
const b = (s: string) => <span style={{color: B}}>{s}</span>;

/** A clip shown as a "screen": thin frame in its model colour, model tag top-left, author credit bottom-right. */
const Screen: React.FC<{x: number; y: number; w: number; h: number; src: string; from?: number; tag: string; c: string; credit: string;
  sq?: number; dim?: number; edge?: number; creditOutside?: boolean; children?: React.ReactNode}> = ({x, y, w, h, src, from = 0, tag, c, credit, sq = 0, dim = 0,
  edge = 2, creditOutside = false, children}) => (
  <div style={{position: 'absolute', left: x, top: y, width: w, height: h, transform: `scale(${1 + 0.02 * sq}, ${1 - 0.03 * sq})`, transformOrigin: '50% 50%'}}>
    <div style={{position: 'absolute', inset: 0, overflow: 'hidden', background: '#000', outline: `${edge}px solid ${c}`}}>
      <OffthreadVideo src={src} trimBefore={from} muted style={{width: '100%', height: '100%', objectFit: 'contain', opacity: 1 - dim}} />
    </div>
    <div style={{position: 'absolute', left: 0, top: 0, background: c, color: BG, fontFamily: mono, fontWeight: 800, fontSize: 28, padding: '4px 12px'}}>{tag}</div>
    <div style={{position: 'absolute', right: 0, ...(creditOutside ? {top: h + 6} : {bottom: 0}), background: 'rgba(12,26,44,0.82)', color: INK, fontFamily: font,
      fontWeight: 700, fontSize: 40, lineHeight: 1.2, padding: '4px 12px', whiteSpace: 'nowrap'}}>{credit}</div>
    {children}
  </div>
);
const CREDIT_A = '@stephanlivera｜案例展示', CREDIT_F = '@NpieAI｜案例展示', CREDIT_G = '@marcthecreatorr｜案例展示';
const TOP = {x: 80, y: 0, w: 720, h: 405}, BOT = {x: 80, y: 420, w: 720, h: 405};

/* ---------- hook: same prompt, Opus on top, DeepSeek below ---------- */

const hookPlan = (cue: Cue) => ({a: cue('a', 96), b: cue('b', 216), land: 10});
const Hook: Scene = ({f, cue, layer}) => {
  const L = layers(layer);
  const p = hookPlan(cue);
  const t = S(f);
  // the two screens slide in from above / below and meet at the centre line (contact frame p.land)
  const ty = springTrack(t, -470, [{at: S(-4), to: TOP.y}], {f: 2.2, z: 0.62});
  const by = springTrack(t, 1300, [{at: S(-1), to: BOT.y}], {f: 2.2, z: 0.62});
  const hitT = hitOf(f, [p.land], 1), hitB = hitOf(f, [p.land + 3], 1);
  const glowB = clamp((f - p.a) / 8);
  const ask = springStep(t, S(p.b), {f: 2.4, z: 0.7});
  return <Root>
    {L.world && <>
      <Screen {...TOP} y={ty} src={V('A_hook.mp4')} tag="OPUS 5.5" c={A} credit={CREDIT_A} sq={hitT} />
      <Screen {...BOT} y={by} src={V('F_hook.mp4')} tag="DEEPSEEK V4.1 FLASH 1017" c={B} credit={CREDIT_F} sq={hitB} edge={2 + 4 * glowB} />
      {f >= p.land && <div style={{position: 'absolute', right: 80, top: ty, opacity: clamp((f - p.land - 2) / 6),
        transform: `translateX(${(1 - springStep(t, S(p.land), {f: 2.6, z: 0.8})) * 40}px)`}}>
        <div style={{background: INK, color: BG, fontFamily: font, fontWeight: 900, fontSize: 40, padding: '2px 14px'}}>同一句提示词</div>
      </div>}
      {f >= p.b - 2 && <div style={{position: 'absolute', left: 92, top: 348, transform: `scale(${0.6 + 0.4 * clamp(ask)})`, opacity: clamp(ask * 2)}}>
        <div style={{width: 64, height: 64, borderRadius: 32, background: INK, color: BG, fontFamily: font, fontWeight: 900, fontSize: 48, textAlign: 'center',
          lineHeight: '64px'}}>?</div>
      </div>}
    </>}
  </Root>;
};
Hook.sfx = (cue) => {
  const p = hookPlan(cue);
  return [{at: p.land, kind: 'tap', gain: 0.22}, {at: p.land + 3, kind: 'tap', gain: 0.14}, {at: p.a, kind: 'tick', gain: 0.12}, {at: p.b, kind: 'tick', gain: 0.12}];
};
Hook.camera = (cue) => {
  const p = hookPlan(cue);
  // the split screen fills the safe band: the camera stays put, the clips themselves carry the motion
  return [cam(0, 440, 400, 1.0), cam(p.b, 440, 400, 1.0)];
};

/* ---------- truth: no video generation — both write Remotion code, then render ---------- */

const truthPlan = (cue: Cue) => {
  const [a1, b1, c1] = [cue('a', 94), cue('b', 169), cue('c', 206)];
  return {a: a1, b: b1, c: c1, block: 58, opusIn: a1, dsIn: a1 + 14, words: [c1, c1 + 44, c1 + 58]};
};
const NODES = [{x: 0, label: '提示词'}, {x: 240, label: '写代码'}, {x: 480, label: '渲染'}, {x: 700, label: '视频'}];
const NY = 360, NH = 200, NW = 180;
const Truth: Scene = ({f, cue, layer}) => {
  const L = layers(layer);
  const p = truthPlan(cue);
  const t = S(f);
  const slot = NODES[1];
  // chips: Opus parks above the pipe, DeepSeek below; each drops into its bay of the same "write code" slot
  const chip = (c: string, label: string, homeY: number, bayY: number, at: number) => {
    const x = springTrack(t, slot.x + 10, [{at: S(at - 10), to: slot.x + 10}], {f: 2, z: 0.8});
    const y = springTrack(t, homeY, [{at: S(at - 10), to: bayY}], {f: 2.4, z: 0.62});
    const sq = hitOf(f, [at], 1);
    return <g transform={`translate(${x} ${y}) scale(${1 + 0.05 * sq} ${1 - 0.08 * sq})`}>
      <rect x={0} y={0} width={NW - 20} height={76} rx={8} fill={c} />
      <text x={(NW - 20) / 2} y={50} textAnchor="middle" fontFamily={mono} fontWeight={800} fontSize={30} fill={BG}>{label}</text>
    </g>;
  };
  const lamp = clamp((f - p.opusIn - 4) / 6);
  // "直接生成视频" is a dead end: the DeepSeek chip is pushed at it and bounces back (contact at p.block + 12)
  const tryX = f < p.block ? 0 : 220 * Math.sin(Math.PI * clamp((f - p.block) / 24));
  const flow = clamp((f - p.b) / 24);
  return <Root>
    {L.world && <Stage>
      {NODES.map((n, i) => <g key={n.label} transform={`translate(${n.x} ${NY})`}>
        <rect x={0} y={0} width={NW} height={NH} rx={10} fill={PANEL} stroke={i === 1 ? STEEL : LINE} strokeWidth={i === 1 ? 3 : 2} />
        <text x={NW / 2} y={NH + 52} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={42} fill={INK}>{n.label}</text>
        {i < 3 && <line x1={NW + 8} x2={NODES[i + 1].x - NODES[i].x - 8} y1={NH / 2} y2={NH / 2} stroke={LINE} strokeWidth={4} />}
        {i === 0 && <text x={NW / 2} y={NH / 2 + 14} textAnchor="middle" fontFamily={mono} fontWeight={700} fontSize={34} fill={DIM}>"做一支…"</text>}
      </g>)}
      {/* the slot's lamp: lit once a model is plugged in */}
      <circle cx={slot.x + NW / 2} cy={NY - 18} r={9} fill={lamp > 0 ? A : LINE} opacity={0.4 + 0.6 * lamp} />
      {/* a dead-end box for "generate video directly", crossed out */}
      <g opacity={clamp((f - p.block + 6) / 8) * (1 - clamp((f - p.opusIn + 4) / 10))}>
        <rect x={470} y={120} width={300} height={90} rx={10} fill="none" stroke={DIM} strokeWidth={3} strokeDasharray="10 8" />
        <text x={620} y={178} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={40} fill={DIM}>直接生成视频</text>
        {f >= p.block + 12 && <path d={`M480 130 L760 200 M760 130 L480 200`} stroke={INK} strokeWidth={6} strokeLinecap="round" strokeDasharray={420}
          strokeDashoffset={420 * (1 - clamp((f - p.block - 12) / 8))} />}
      </g>
      {/* code → render → film */}
      {flow > 0 && <g transform={`translate(${slot.x + 20 + (NODES[2].x - slot.x) * Math.min(1, flow * 1.6)} ${NY + 60})`} opacity={1 - clamp((flow - 0.7) / 0.3)}>
        {[0, 1, 2, 3].map((k) => <rect key={k} x={0} y={k * 20} width={[120, 90, 130, 70][k]} height={10} rx={4} fill={STEEL} />)}
      </g>}
      {flow > 0.45 && (() => {
        const k = springStep(t, S(p.b + 14), {f: 2.2, z: 0.75});
        return <g transform={`translate(${NODES[3].x + 10 + 0 * k} ${NY + 40})`} opacity={clamp(k * 2)}>
          <rect x={0} y={0} width={NW - 20} height={120} rx={6} fill={STEEL} />
          {[0, 1, 2, 3, 4].map((i) => <rect key={i} x={10 + i * 32} y={8} width={16} height={12} fill={BG} />)}
          {[0, 1, 2, 3, 4].map((i) => <rect key={`b${i}`} x={10 + i * 32} y={100} width={16} height={12} fill={BG} />)}
          <text x={(NW - 20) / 2} y={74} textAnchor="middle" fontFamily={mono} fontWeight={800} fontSize={30} fill={BG}>MP4</text>
        </g>;
      })()}
      <g transform={`translate(${tryX} 0)`}>{chip(B, 'DeepSeek', 640, NY + 112, p.dsIn)}</g>
      {chip(A, 'Opus', 140, NY + 14, p.opusIn)}
      {['写得好', '写得快', '写得便宜'].map((w, i) => {
        const at = p.words[i];
        if (f < at - 12) return null;
        const lift = dropLift(f, at, 0, 120), sq = hitOf(f, [at], 1);
        return <g key={w} transform={`translate(${40 + i * 280} ${700 - lift}) scale(${1 + 0.05 * sq} ${1 - 0.08 * sq})`}>
          <rect x={0} y={0} width={240} height={84} rx={10} fill={BG} stroke={INK} strokeWidth={3} />
          <text x={120} y={58} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={44} fill={INK}>{w}</text>
        </g>;
      })}
    </Stage>}
    {L.hud && <Title f={f} items={[{at: 0, k: '先说清楚', t: <>{b('DeepSeek')} 不生成视频</>}, {at: p.a, k: '它和 Opus 一样', t: '写 Remotion 代码'},
      {at: p.b, k: '代码', t: '再渲染成视频'}, {at: p.c, k: '比的是', t: '代码'}]} />}
  </Root>;
};
Truth.sfx = (cue) => {
  const p = truthPlan(cue);
  return [{at: p.block + 12, kind: 'block', gain: 0.14}, {at: p.opusIn, kind: 'fs-part-seat', gain: 0.16}, {at: p.dsIn, kind: 'fs-part-seat', gain: 0.16},
    {at: p.b + 14, kind: 'tick', gain: 0.12}, ...p.words.map((at) => ({at, kind: 'tap', gain: 0.14}))];
};
Truth.camera = (cue) => {
  const p = truthPlan(cue);
  return [cam(0, 560, 420, 1.06), cam(p.opusIn - 8, 330, 460, 1.08), cam(p.b, 560, 460, 1.04), cam(p.c, 440, 520, 1.0)];
};

/* ---------- numbers: G, the author's own same-prompt comparison, with what he said it took ---------- */

const numPlan = (cue: Cue) => {
  const [a1, b1, c1] = [cue('a', 58), cue('b', 122), cue('c', 217)];
  return {a: a1, b: b1, c: c1, price: c1 + 63};
};
const GBIG = {x: 30, y: 8, w: 820, h: 812}, GSMALL = {x: 0, y: 168, w: 560, h: 554};
const Card: React.FC<{f: number; at: number; y: number; c: string; time: string; cost: string; tag?: string; tagAt?: number}> = ({f, at, y, c, time, cost, tag, tagAt = 1e9}) => {
  if (f < at - 10) return null;
  const x = springTrack(S(f), 900, [{at: S(at - 10), to: 585}], {f: 2.0, z: 0.72});
  const sq = hitOf(f, [at], 1);
  const tg = clamp((f - tagAt) / 8);
  return <div style={{position: 'absolute', left: x, top: y, width: 295, transform: `scale(${1 - 0.02 * sq}, ${1 + 0.02 * sq})`, transformOrigin: '0% 50%'}}>
    <div style={{borderLeft: `8px solid ${c}`, background: PANEL, padding: '12px 18px'}}>
      <Mono size={26} c={c} w={800}>作者自述</Mono>
      <Big size={52} c={INK} style={{whiteSpace: 'nowrap'}}>{time}</Big>
      <Big size={64} c={c} style={{whiteSpace: 'nowrap'}}>{cost}</Big>
    </div>
    {tag && tg > 0 && <div style={{marginTop: 10, display: 'inline-block', border: `3px solid ${c}`, color: c, fontFamily: font, fontWeight: 900, fontSize: 40,
      padding: '2px 12px', opacity: tg, transform: `translateY(${(1 - tg) * -16}px)`}}>{tag}</div>}
  </div>;
};
const Numbers: Scene = ({f, cue, layer}) => {
  const L = layers(layer);
  const p = numPlan(cue);
  const t = S(f);
  const k = springStep(t, S(p.a), {f: 1.4, z: 0.85});
  const g = {x: GBIG.x + (GSMALL.x - GBIG.x) * k, y: GBIG.y + (GSMALL.y - GBIG.y) * k, w: GBIG.w + (GSMALL.w - GBIG.w) * k, h: GBIG.h + (GSMALL.h - GBIG.h) * k};
  // the G half next to a card sinks a little a few frames after the card lands (secondary response)
  const sink = 3 * hitOf(f, [p.b + 4, p.c + 4], 1);
  return <Root>
    {L.world && <>
      <div style={{position: 'absolute', left: g.x, top: g.y + sink}}>
        <Screen x={0} y={0} w={g.w} h={g.h} src={V('G_compare.mp4')} tag="同一提示词 · 上 Opus / 下 DeepSeek" c={STEEL} credit={CREDIT_G} creditOutside={k > 0.5} />
      </div>
      <Card f={f} at={p.b} y={GSMALL.y + 10} c={A} time="约 20 分钟" cost="约 $6" />
      <Card f={f} at={p.c} y={GSMALL.y + GSMALL.h / 2 + 4} c={B} time="约 1 小时" cost="$0.23" />
    </>}
    {L.hud && <Title f={f} items={[{at: 0, k: '同题对比', t: '同一个提示词'}, {at: p.a, k: '据作者 @marcthecreatorr 自述', t: '时间和花费'}]} />}
  </Root>;
};
Numbers.sfx = (cue) => {
  const p = numPlan(cue);
  return [{at: p.a, kind: 'whoosh-short', gain: 0.08}, {at: p.b, kind: 'tap', gain: 0.18}, {at: p.c, kind: 'tap', gain: 0.18}, {at: p.price, kind: 'tick', gain: 0.1}];
};
Numbers.camera = (cue) => {
  const p = numPlan(cue);
  // on "只花 0.23 美元" the camera leans in on the DeepSeek card: the number the scene is about
  return [cam(0, 440, 420, 1.0), cam(p.b - 6, 600, 380, 1.06), cam(p.c - 6, 600, 520, 1.06), cam(p.price, 720, 560, 1.1)];
};

/* ---------- review: the author's verdict, same layout carried over from numbers ---------- */

const reviewPlan = (cue: Cue) => ({a: cue('a', 60), b: cue('b', 100)});
const Review: Scene = ({f, cue, layer}) => {
  const L = layers(layer);
  const p = reviewPlan(cue);
  return <Root>
    {L.world && <>
      <div style={{position: 'absolute', left: GSMALL.x, top: GSMALL.y}}>
        <Screen x={0} y={0} w={GSMALL.w} h={GSMALL.h} src={V('G_review.mp4')} tag="同一提示词 · 上 Opus / 下 DeepSeek" c={STEEL} credit={CREDIT_G} creditOutside />
      </div>
      <Card f={f} at={-30} y={GSMALL.y + 10} c={A} time="约 20 分钟" cost="约 $6" tag="细节更好" tagAt={8} />
      <Card f={f} at={-30} y={GSMALL.y + GSMALL.h / 2 + 4} c={B} time="约 1 小时" cost="$0.23" tag={f < p.b ? '很接近' : '有几处错误'} tagAt={p.a} />
    </>}
    {L.hud && <Title f={f} items={[{at: 0, k: '作者的评价', t: <>{a('Opus')} 细节更好</>}, {at: p.a, k: '作者的评价', t: <>{b('DeepSeek')} 很接近</>},
      {at: p.b, k: '作者的评价', t: <>但有几处错误</>}]} />}
  </Root>;
};
Review.sfx = (cue) => {
  const p = reviewPlan(cue);
  return [{at: 8, kind: 'tick', gain: 0.12}, {at: p.a, kind: 'tick', gain: 0.12}, {at: p.b, kind: 'tap', gain: 0.16}];
};
Review.camera = (cue) => {
  const p = reviewPlan(cue);
  return [cam(0, 600, 380, 1.06), cam(p.a - 4, 640, 560, 1.08), cam(p.b, 640, 600, 1.1)];
};

/* ---------- cost: money is an order of magnitude apart; time goes the other way ---------- */

const costPlan = (cue: Cue) => {
  const [a1, b1, c1] = [cue('a', 61), cue('b', 108), cue('c', 141)];
  return {a: a1, b: b1, c: c1, grow: 6};
};
const FULL = 680;
const Cost: Scene = ({f, cue, layer}) => {
  const L = layers(layer);
  const p = costPlan(cue);
  const t = S(f);
  // money: $6 vs $0.23 on one scale (the DeepSeek bar is barely there) → time: about 20 min vs about 1 hour
  const money = (v: number) => (FULL * v) / 6, time = (m: number) => (FULL * m) / 60;
  const topW = springTrack(t, 0, [{at: S(p.grow), to: money(6)}, {at: S(p.a), to: time(20)}], {f: 1.8, z: 0.7});
  const botW = springTrack(t, 0, [{at: S(p.grow + 4), to: money(0.23)}, {at: S(p.a + 4), to: time(60)}], {f: 1.8, z: 0.7});
  const isTime = f >= p.a;
  const fix = f >= p.b - 10 ? dropLift(f, p.b, 0, 160) : 400;
  const fixSq = hitOf(f, [p.b], 1);
  const row = (y: number, c: string, name: string, w: number, label: string) => <g transform={`translate(0 ${y})`}>
    <text x={0} y={0} fontFamily={font} fontWeight={900} fontSize={44} fill={c}>{name}</text>
    <rect x={0} y={24} width={FULL} height={70} rx={6} fill={PANEL} stroke={LINE} strokeWidth={2} />
    <rect x={0} y={24} width={Math.max(4, w)} height={70} rx={6} fill={c} />
    <text x={Math.max(4, w) + 16} y={74} fontFamily={mono} fontWeight={800} fontSize={44} fill={INK}>{label}</text>
  </g>;
  return <Root>
    {L.world && <Stage>
      {row(260, A, 'Opus', topW, isTime ? '约 20 分钟' : '约 $6')}
      {row(470, B, 'DeepSeek', botW, isTime ? '约 1 小时' : '$0.23')}
      {f >= p.b - 10 && <g transform={`translate(${Math.min(botW, FULL) - 150} ${470 + 24 - 76 - fix}) scale(${1 + 0.05 * fixSq} ${1 - 0.1 * fixSq})`}>
        <rect x={0} y={0} width={150} height={62} rx={6} fill={BG} stroke={B} strokeWidth={3} />
        <text x={75} y={44} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={38} fill={B}>+挑错</text>
      </g>}
      <text x={0} y={680} fontFamily={mono} fontWeight={700} fontSize={28} fill={DIM}>数字：@marcthecreatorr 自述，同一提示词一次对比</text>
    </Stage>}
    {L.hud && <Title f={f} items={[{at: 0, k: '花费（作者自述）', t: '钱：差一个数量级'}, {at: p.a, k: '耗时（作者自述）', t: '时间：反过来'},
      {at: p.c, k: '便宜的那一个', t: '拿时间付账'}]} />}
  </Root>;
};
Cost.sfx = (cue) => {
  const p = costPlan(cue);
  return [{at: p.grow + 12, kind: 'tick', gain: 0.12}, {at: p.a + 12, kind: 'tick', gain: 0.12}, {at: p.b, kind: 'tap', gain: 0.16}];
};
Cost.camera = (cue) => {
  const p = costPlan(cue);
  return [cam(0, 300, 420, 1.06), cam(p.a, 500, 480, 1.04), cam(p.c, 440, 440, 1.0)];
};

/* ---------- verdict: the two cards land back where the two clips started ---------- */

const verdictPlan = (cue: Cue) => ({a: cue('a', 108), b: cue('b', 204)});
const Verdict: Scene = ({f, cue, layer}) => {
  const L = layers(layer);
  const p = verdictPlan(cue);
  const t = S(f);
  const card = (at: number, lines: string[], c: string, size: number) => {
    if (f < at - 12) return null;
    const lift = dropLift(f, at, 0, 160), sq = hitOf(f, [at], 1);
    return <div style={{position: 'absolute', left: 30, top: 140 - lift, width: 660, transform: `scale(${1 + 0.02 * sq}, ${1 - 0.04 * sq})`, transformOrigin: '50% 100%'}}>
      <div style={{background: 'rgba(12,26,44,0.88)', borderLeft: `10px solid ${c}`, padding: '14px 22px'}}>
        {lines.map((l, i) => <div key={l} style={{fontFamily: font, fontWeight: 900, fontSize: i ? size : 40, color: i ? INK : c, lineHeight: 1.2, whiteSpace: 'nowrap',
          opacity: clamp((f - at - 6 * i) / 6)}}>{l}</div>)}
      </div>
    </div>;
  };
  const q = springStep(t, S(p.b), {f: 2.2, z: 0.75});
  // on the question the two screens shrink a little towards their outer edges, opening a gap for it
  const shrink = 1 - 0.1 * springStep(t, S(p.b - 4), {f: 1.8, z: 0.8});
  return <Root>
    {L.world && <>
      <div style={{position: 'absolute', inset: 0, transform: `scale(${shrink})`, transformOrigin: '440px 0px'}}>
      <Screen {...TOP} src={V('A_end.mp4')} tag="OPUS 5.5" c={A} credit={CREDIT_A} dim={0.55}>{card(0, ['用 Opus', '接单·赶时间'], A, 76)}</Screen>
      </div>
      <div style={{position: 'absolute', inset: 0, transform: `scale(${shrink})`, transformOrigin: '440px 825px'}}>
      <Screen {...BOT} src={V('F_end.mp4')} tag="DEEPSEEK V4.1 FLASH 1017" c={B} credit={CREDIT_F} dim={0.55}>{card(p.a, ['用 DeepSeek', '草稿·批量·预算紧'], B, 64)}</Screen>
      </div>
      {f >= p.b - 2 && <div style={{position: 'absolute', left: 440 - 230, top: 383, width: 460, opacity: clamp(q * 2), transform: `scale(${0.8 + 0.2 * clamp(q)})`}}>
        <div style={{background: INK, color: BG, fontFamily: font, fontWeight: 900, fontSize: 44, textAlign: 'center', padding: '6px 0'}}>缺时间，还是缺钱？</div>
      </div>}
    </>}
  </Root>;
};
Verdict.sfx = (cue) => {
  const p = verdictPlan(cue);
  return [{at: 0, kind: 'tap', gain: 0.16}, {at: p.a, kind: 'tap', gain: 0.16}, {at: p.b, kind: 'tick', gain: 0.12}];
};
Verdict.camera = (cue) => {
  const p = verdictPlan(cue);
  return [cam(0, 440, 400, 1.0), cam(p.b, 440, 400, 1.0)];
};

/* ---------- cover anchor: the two stills, Opus on top ---------- */

const CoverAnchor: Scene = () => <Root>
  {[{img: 'A_still.png', y: 0, c: A, tag: 'OPUS 5.5', credit: CREDIT_A}, {img: 'F_still.png', y: 420, c: B, tag: 'DEEPSEEK V4.1 FLASH 1017', credit: CREDIT_F}].map((s) => (
    <div key={s.img} style={{position: 'absolute', left: 80, top: s.y, width: 720, height: 405, outline: `3px solid ${s.c}`}}>
      <Img src={V(s.img)} style={{width: '100%', height: '100%'}} />
      <div style={{position: 'absolute', left: 0, top: 0, background: s.c, color: BG, fontFamily: mono, fontWeight: 800, fontSize: 30, padding: '4px 12px'}}>{s.tag}</div>
      <div style={{position: 'absolute', right: 0, bottom: 0, background: 'rgba(12,26,44,0.82)', color: INK, fontFamily: font, fontWeight: 700, fontSize: 40,
        padding: '4px 12px', whiteSpace: 'nowrap'}}>{s.credit}</div>
    </div>))}
</Root>;

export const deepseekVsOpusScenes: Record<string, Scene> = {
  'dvo.hook': Hook,
  'dvo.truth': Truth,
  'dvo.numbers': Numbers,
  'dvo.review': Review,
  'dvo.cost': Cost,
  'dvo.verdict': Verdict,
  'dvo.cover': CoverAnchor,
};
for (const [k, sc] of Object.entries(deepseekVsOpusScenes)) if (k !== 'dvo.cover') sc.hud = true;
