import React from 'react';
import {font} from '../theme';
import {clamp, ease, hash, impulse, springStep, springTrack} from '../../fx';
import {Cue, S, Scene, Strike, cam as camKey, draw, dropLift, hitOf, layers, phaseOp, Rise} from '../paper';
import {A, B, BG, Big, Blk, BlockRect, CHIP, DIM, INK, LINE, Machine, Mono, Num, PANEL, PANEL_HI, RACK_Y, RAIL_Y, Root, SLOT_W, Stage, Status,
  STEEL, crane, mono, slotX} from '../tech';

// Agent 工程师路线图 — Chasen's write-up of the "Agent 工程师入门指南" an interviewer handed him.
// Storyboard + brief: tutorials/agent-engineer-roadmap.storyboard.md. Blueprint look (tech topic) on the WeChat Channels
// layout: everything inside the 880×800 stage sits in the 6:7 band. One context machine carries the film: a rack of
// slots (the context window), the model chip (A, amber) and the system's gantry crane (B, cyan) that lowers blocks in.

/** Camera keys for this film: never push past 1.1×, where the frame would have to crop the rack's labels at the sides. */
// …and never look so low that the top of the stage (y ≈ 200, just under the HUD title) slides up behind the title:
// the picture's top edge may rise at most 40 px (stage centre 400, focus pulled 55 % of the way, see TutorialVideo).
const cam = (at: number, x: number, y: number, z: number) => {
  const zz = Math.min(z, 1.1);
  return camKey(at, x, Math.min(y, 400 + (440 / zz - 400) / 0.55), zz);
};

/** Title block in the HUD: a mono kicker and a big line, swapped in place on cues (content swap, not new cards). */
const Title: React.FC<{f: number; items: {at: number; to?: number; k?: string; t: React.ReactNode; c?: string; size?: number}[]}> = ({f, items}) => (
  <div style={{position: 'absolute', left: 0, top: 0, width: 880, height: 150}}>
    {items.map((it, i) => <div key={i} style={{position: 'absolute', left: 0, top: 0, width: 880, ...phaseOp(f, it.at, it.to ?? items[i + 1]?.at ?? 1e9)}}>
      {it.k && <Mono size={26} style={{marginBottom: 8}}>{it.k}</Mono>}
      <Big size={it.size ?? 64} c={it.c ?? INK}>{it.t}</Big>
    </div>)}
  </div>
);
const tickMark = (x: number, y: number, p: number, c = B, s = 1) => <path d={`M${x - 12 * s} ${y} L${x - 3 * s} ${y + 10 * s} L${x + 14 * s} ${y - 12 * s}`} fill="none" stroke={c}
  strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={50} strokeDashoffset={50 * (1 - clamp(p))} />;
const crossMark = (x: number, y: number, p: number, c = INK) => <path d={`M${x - 11} ${y - 11} L${x + 11} ${y + 11} M${x + 11} ${y - 11} L${x - 11} ${y + 11}`} stroke={c}
  strokeWidth={5} strokeLinecap="round" opacity={clamp(p * 2)} />;
/** A card in the lower zone (y 640–790), sliding in from the left and squashing on arrival. */
const Card: React.FC<{f: number; at: number; to?: number; tab: string; c?: string; children: React.ReactNode}> = ({f, at, to = 1e9, tab, c = B, children}) => {
  if (f < at - 4) return null;
  const x = springTrack(S(f), -980, [{at: S(at - 4), to: 0}], {f: 1.8, z: 0.8});
  const hit = hitOf(f, [at + 8], 1);
  return <div style={{position: 'absolute', left: x, top: 650, width: 880, ...phaseOp(f, at - 4, to), transform: `scale(${1 - 0.03 * hit}, ${1 + 0.02 * hit})`, transformOrigin: '100% 50%'}}>
    <div style={{border: `2px solid ${c}`, borderRadius: 12, background: PANEL, padding: '14px 22px'}}>
      <Mono size={22} c={c} w={800} style={{marginBottom: 6}}>{tab}</Mono>
      {children}
    </div>
  </div>;
};

/* ---------- hook: the verdict, then the guide unfolds into five stages ---------- */

const STAGES = ['模型', 'Prompt', 'RAG', 'Agent', '后端'];
const PROJECTS = ['API\nPlayground', 'RAG +\n工具调用', '简化\nCoding Agent', 'AI 服务\n后端', '综合\n个人 Agent'];
const hookPlan = (cue: Cue) => {
  const [a, b, c, d, e] = [cue('a', 112), cue('b', 177), cue('c', 225), cue('d', 362), cue('e', 401)];
  return {a, b, c, d, e, stamp: 26, land: c + 16};
};
const Gauge: React.FC<{x: number; level: number; c: string; label: string; sub: string; op: number}> = ({x, level, c, label, sub, op}) => (
  <g opacity={op}>
    <rect x={x} y={250} width={110} height={300} rx={10} fill={PANEL} stroke={LINE} strokeWidth={2} />
    {[0.25, 0.5, 0.75].map((k) => <line key={k} x1={x + 110} x2={x + 126} y1={550 - 300 * k} y2={550 - 300 * k} stroke={DIM} strokeWidth={2} />)}
    <rect x={x + 10} y={540 - 280 * clamp(level, 0, 1.05)} width={90} height={280 * clamp(level, 0, 1.05)} rx={6} fill={c} />
    <text x={x + 55} y={596} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={34} fill={c}>{label}</text>
    <text x={x + 55} y={628} textAnchor="middle" fontFamily={mono} fontSize={20} fill={DIM}>{sub}</text>
  </g>
);
const Hook: Scene = ({f, cue, layer}) => {
  const L = layers(layer);
  const p = hookPlan(cue);
  const t = S(f);
  const ai = springTrack(t, 0, [{at: S(p.a), to: 0.9}], {f: 1.4, z: 0.7});
  const eng = springTrack(t, 0, [{at: S(p.b), to: 0.62}, {at: S(p.b + 16), to: 0.32}], {f: 1.6, z: 0.6});
  const gaugeOp = 1 - clamp((f - p.c) / 12);
  // the guide: slides in from the right, lands on the table (contact), then unfolds into five columns
  const gx = springTrack(t, 980, [{at: S(p.c), to: 20}], {f: 1.5, z: 0.82});
  const glift = f < p.land ? Math.max(0, 40 * (1 - clamp((f - p.c) / 16))) : 0;
  const gsq = hitOf(f, [p.land], 1);
  const unfold = springStep(t, S(p.d), {f: 1.6, z: 0.85});
  const stampLift = dropLift(f, p.stamp, 0, 260);
  const stampHit = hitOf(f, [p.stamp], 1);
  return <Root>
    {L.world && <Stage>
      <Gauge x={150} level={ai} c={A} label="模型" sub="AI 这块" op={gaugeOp} />
      <Gauge x={400} level={eng} c={B} label="工程" sub="工程能力" op={gaugeOp} />
      {f >= p.b + 20 && <g opacity={gaugeOp}>
        <g transform={`translate(0 ${-dropLift(f, p.b + 26, 0, 120)})`}>
          <rect x={540} y={330} width={150} height={56} rx={8} fill={BG} stroke={B} strokeWidth={3} />
          <text x={615} y={368} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={30} fill={B}>不太行</text>
        </g>
      </g>}
      {f >= p.stamp - 12 && <g opacity={gaugeOp} transform={`translate(640 ${470 - stampLift}) rotate(-8) scale(${1 + 0.06 * stampHit} ${1 - 0.1 * stampHit})`}>
        <rect x={-120} y={-50} width={240} height={100} rx={10} fill={STEEL} />
        <text x={0} y={18} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={54} fill={BG}>未通过</text>
      </g>}
      {f >= p.c - 2 && <g transform={`translate(${gx} ${-glift}) scale(${1 + 0.02 * gsq} ${1 - 0.03 * gsq})`}>
        <rect x={0} y={220} width={820} height={400} rx={12} fill={PANEL} stroke={B} strokeWidth={2.5} />
        <text x={24} y={258} fontFamily={mono} fontWeight={700} fontSize={18} fill={B}>FIG.0 · GUIDE</text>
        <g opacity={1 - clamp(unfold * 1.4)}>
          <text x={410} y={420} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={54} fill={INK}>《Agent 工程师入门指南》</text>
          <text x={410} y={470} textAnchor="middle" fontFamily={mono} fontSize={22} fill={DIM}>知识点 · 学习文档 · 项目要求 · 验收标准</text>
        </g>
        {STAGES.map((s, i) => {
          const x = 20 + i * 158;
          const k = clamp(unfold * 1.3 - i * 0.12);
          const lift = dropLift(f, p.e + i * 6, 0, 70);
          const hit = hitOf(f, [p.e + i * 6], 1);
          return <g key={s} opacity={k}>
            {i > 0 && <line x1={x - 4} x2={x - 4} y1={280} y2={280 + 320 * k} stroke={LINE} strokeWidth={2} />}
            <text x={x + 75} y={316} textAnchor="middle" fontFamily={mono} fontWeight={700} fontSize={20} fill={DIM}>{String(i + 1).padStart(2, '0')}</text>
            <text x={x + 75} y={358} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={34} fill={INK}>{s}</text>
            {f >= p.e + i * 6 - 10 && <g transform={`translate(${x + 8} ${430 - lift}) scale(${1 + 0.06 * hit} ${1 - 0.1 * hit})`} style={{transformOrigin: '67px 140px'}}>
              <rect x={0} y={0} width={134} height={140} rx={10} fill={PANEL_HI} stroke={LINE} strokeWidth={2} />
              {PROJECTS[i].split('\n').map((ln, j) => <text key={j} x={67} y={58 + j * 34} textAnchor="middle" fontFamily={font} fontWeight={800} fontSize={24}
                fill={INK}>{ln}</text>)}
            </g>}
          </g>;
        })}
      </g>}
    </Stage>}
    {L.hud && <>
      <Title f={f} items={[{at: 0, k: '面试结果 · AI + Web3 公司', t: '没过'}, {at: p.a, k: '面试官的评价', t: <>AI 这块：<span style={{color: A}}>没问题</span></>},
        {at: p.b, k: '面试官的评价', t: <>工程能力：<span style={{color: B}}>不太行</span></>}, {at: p.c, k: '面试之后，面试官给了一份', t: '入门指南', size: 64},
        {at: p.d, k: 'Chasen 整理公开', t: '5 个阶段 · 5 个项目'}]} />
      <Status y={660}>{f < p.c ? <>EVAL · 模型 {ai.toFixed(2)} · 工程 {eng.toFixed(2)}</> : <>GUIDE · 每个阶段 = 知识点 + 项目 + 验收标准</>}</Status>
    </>}
  </Root>;
};
Hook.sfx = (cue) => {
  const p = hookPlan(cue);
  return [{at: p.stamp, kind: 'stamp', gain: 0.26}, {at: p.a + 4, kind: 'tick', gain: 0.14}, {at: p.b + 26, kind: 'tap', gain: 0.18}, {at: p.land, kind: 'thud', gain: 0.28},
    {at: p.d + 2, kind: 'paper', gain: 0.18}, ...[0, 1, 2, 3, 4].map((i) => ({at: p.e + i * 6, kind: 'tap', gain: 0.12}))];
};
Hook.camera = (cue) => {
  const p = hookPlan(cue);
  return [cam(0, 640, 470, 1.18), cam(56, 420, 360, 1.0), cam(p.a - 4, 210, 420, 1.1), cam(p.b - 4, 470, 420, 1.12), cam(p.c, 440, 400, 1.0), cam(p.d, 440, 380, 1.06), cam(p.e + 30, 440, 440, 1.0)];
};

/* ---------- route: one request travels the five stations ---------- */

const NODES = [70, 245, 420, 595, 770];
const NODE_L = ['模型调用', '查资料', '调工具', '存状态', '做成服务'];
const routePlan = (cue: Cue) => {
  const [a, b, c, d, e] = [cue('a', 40), cue('b', 109), cue('c', 148), cue('d', 173), cue('e', 203)];
  return {a, b, c, d, e, arr: [a, b, c, d, e]};
};
const Route: Scene = ({f, cue, layer}) => {
  const L = layers(layer);
  const p = routePlan(cue);
  const t = S(f);
  const x = springTrack(t, -120, p.arr.map((at, i) => ({at: S(at - 8), to: NODES[i]})), {f: 2.0, z: 0.72});
  const visited = p.arr.filter((at) => f >= at).length;
  return <Root>
    {L.world && <Stage>
      <path d={`M-40 400 ${NODES.map((nx, i) => `L${nx - 50} 400 L${nx - 50} ${i % 2 ? 380 : 420} L${nx + 50} ${i % 2 ? 380 : 420} L${nx + 50} 400`).join(' ')} L900 400`}
        fill="none" stroke={LINE} strokeWidth={4} />
      {NODES.map((nx, i) => {
        const on = f >= p.arr[i];
        const ring = clamp((f - p.arr[i]) / 12);
        const hit = hitOf(f, [p.arr[i]], 1);
        return <g key={nx}>
          <circle cx={nx} cy={400} r={46 + 3 * hit} fill={on ? B : BG} fillOpacity={on ? clamp((f - p.arr[i] - 4) / 8) : 1} stroke={LINE} strokeWidth={3} />
          <circle cx={nx} cy={400} r={46 + 3 * hit} fill="none" stroke={B} strokeWidth={6} strokeDasharray={290} strokeDashoffset={290 * (1 - ring)} transform={`rotate(-90 ${nx} 400)`} />
          <text x={nx} y={410} textAnchor="middle" fontFamily={mono} fontWeight={800} fontSize={26} fill={on ? BG : DIM}>{String(i + 1).padStart(2, '0')}</text>
          <text x={nx} y={500} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={30} fill={on ? INK : DIM} opacity={0.5 + 0.5 * clamp((f - p.arr[i] - 6) / 8)}>{NODE_L[i]}</text>
        </g>;
      })}
      {(() => {
        const sq = p.arr.reduce((s, at) => s + impulse(t, S(at), {f: 3.2, z: 0.42}), 0);
        return <g transform={`translate(${x} 316) scale(${1 + 0.08 * sq} ${1 - 0.12 * sq})`}>
          <rect x={-72} y={-36} width={144} height={66} rx={8} fill={A} />
          <text x={0} y={9} textAnchor="middle" fontFamily={mono} fontWeight={800} fontSize={28} fill={BG}>REQ</text>
          <line x1={0} x2={0} y1={30} y2={40} stroke={A} strokeWidth={3} />
        </g>;
      })()}
    </Stage>}
    {L.hud && <>
      <Title f={f} items={[{at: 0, k: 'ROADMAP', t: '整条路线'}, {at: p.e, k: 'ROADMAP · 终点', t: '做成服务'}]} />
      <div style={{position: 'absolute', right: 0, top: 0, textAlign: 'right'}}>
        <Mono size={24}>STAGE</Mono>
        <Num size={110} c={B}>{String(Math.max(1, visited)).padStart(2, '0')}<span style={{fontSize: 44, color: DIM}}>/05</span></Num>
      </div>
      <Status y={600}>REQ · {visited > 0 ? NODE_L.slice(0, visited).join(' → ') : '等待出发'}</Status>
    </>}
  </Root>;
};
Route.sfx = (cue) => {
  const p = routePlan(cue);
  return [{at: p.a - 10, kind: 'whoosh-short', gain: 0.14}, ...p.arr.map((at) => ({at, kind: 'tap', gain: 0.16}))];
};
Route.camera = (cue) => {
  const p = routePlan(cue);
  return [cam(0, 200, 300, 1.1), ...p.arr.map((at, i) => cam(at - 4, NODES[i], 380, 1.06 + 0.02 * (i % 2))), cam(p.e + 20, 440, 420, 0.98)];
};

/* ---------- llm: the context window ---------- */

const llmPlan = (cue: Cue) => {
  const [a, b, c, d, e] = [cue('a', 77), cue('b', 142), cue('c', 278), cue('d', 331), cue('e', 399)];
  return {a, b, c, d, e};
};
const llmBlocks = (p: ReturnType<typeof llmPlan>): Blk[] => [
  {at: p.b + 6, slot: 0, label: 'SYS'},
  {at: p.b + 40, slot: 1, span: 2, label: '历史', squeezeAt: p.d + 30, squeezeTo: 1},
  {at: p.b + 74, slot: 3, label: '工具', dimAt: p.e + 6},
  {at: p.b + 108, slot: 4, span: 2, label: '资料'},
  {at: p.d + 4, slot: 6, label: '资料+', reject: true},
  {at: p.d + 62, slot: 2, label: '资料+'},
];
const LLM: Scene = ({f, cue, layer}) => {
  const L = layers(layer);
  const p = llmPlan(cue);
  const blocks = llmBlocks(p);
  const used = blocks.filter((b) => !b.reject && f >= b.at).reduce((s, b) => s + (b.squeezeAt && f >= b.squeezeAt + 10 ? b.squeezeTo ?? 1 : b.span ?? 1), 0);
  const att = f >= p.e ? clamp((f - p.e) / 14) : 0;
  return <Root>
    {L.world && <Stage>
      <Machine f={f} blocks={blocks} reserve={2} reserveAt={p.c} drawn={draw(f, 2, 60)} chipOn={f >= p.e}>
        {f >= p.c && <text x={slotX(6) + SLOT_W + 4} y={RACK_Y - 16} textAnchor="middle" fontFamily={font} fontWeight={800} fontSize={24} fill={A}
          opacity={clamp((f - p.c - 8) / 8)}>输出余量</text>}
        {/* attention reaches the ends of the context, not the middle */}
        {att > 0 && [slotX(0) + 40, slotX(5) + 40].map((x) => <path key={x} d={`M${CHIP.x} ${CHIP.y + 30} Q ${(CHIP.x + x) / 2} ${RACK_Y - 140} ${x} ${RACK_Y + 6}`} fill="none" stroke={A}
          strokeWidth={3} strokeDasharray={600} strokeDashoffset={600 * (1 - att)} />)}
        {att > 0 && <text x={slotX(3) + 40} y={RACK_Y - 18} textAnchor="middle" fontFamily={mono} fontWeight={800} fontSize={54} fill={INK} opacity={clamp((f - p.e - 10) / 8)}>?</text>}
      </Machine>
    </Stage>}
    {L.hud && <>
      <Title f={f} items={[{at: 0, k: 'STAGE 01 · LLM 基础', t: '一次模型调用'}, {at: p.a, k: '上下文窗口', t: '容量是固定的'}, {at: p.b, k: '上下文窗口', t: '这些都要挤进去'},
        {at: p.c, k: '上下文窗口', t: <>给<span style={{color: A}}>输出</span>留余量</>}, {at: p.d, k: '塞不下', t: '裁剪，或者压缩'}, {at: p.e, k: 'Lost in the Middle', t: '中间的信息容易被忽略'}]} />
      <Status y={600}>CONTEXT · 已用 {used}/8 格{f >= p.c ? ' · 输出余量 2 格' : ''}{f >= p.d && f < p.d + 40 ? ' · 溢出：拒绝' : ''}</Status>
    </>}
  </Root>;
};
LLM.sfx = (cue) => {
  const p = llmPlan(cue);
  return [...llmBlocks(p).map((b) => ({at: b.at, kind: b.reject ? 'block' : 'tap', gain: b.reject ? 0.22 : 0.16})), ...llmBlocks(p).filter((b) => !b.reject).map((b) => ({at: b.at - 30, kind: 'whoosh-short', gain: 0.06})),
    {at: p.c + 6, kind: 'tick', gain: 0.14}, {at: p.d + 30, kind: 'tick', gain: 0.12}, {at: p.e + 8, kind: 'tick', gain: 0.14}];
};
LLM.camera = (cue) => {
  const p = llmPlan(cue);
  return [cam(0, 440, 300, 1.0), cam(p.a, 380, 470, 1.1), cam(p.b + 30, 260, 470, 1.14), cam(p.b + 84, 480, 360, 1.0), cam(p.c, 660, 470, 1.12), cam(p.d, 560, 440, 1.08), cam(p.e, 440, 400, 1.0)];
};

/* ---------- api: roles, streaming, structured output, project 01 ---------- */

const apiPlan = (cue: Cue) => {
  const [a, b, c, d, e] = [cue('a', 33), cue('b', 143), cue('c', 239), cue('d', 382), cue('e', 448)];
  return {a, b, c, d, e};
};
const STREAM = [0, 4, 7, 13, 16, 22, 25, 29, 36, 40, 44, 51];
const API: Scene = ({f, cue, layer}) => {
  const L = layers(layer);
  const p = apiPlan(cue);
  const t = S(f);
  const roles: Blk[] = [
    {at: -100, slot: 0, label: 'system', tag: 'SYSTEM', tagAt: p.a, kind: 'n'},
    {at: -100, slot: 1, label: 'user', tag: 'USER', tagAt: p.a + 6},
    {at: -100, slot: 2, span: 2, label: 'assistant', tag: 'ASSISTANT', tagAt: p.a + 12, kind: 'a'},
    {at: -100, slot: 4, label: 'tool', tag: 'TOOL', tagAt: p.a + 18, kind: 'b'},
  ];
  const n = STREAM.filter((d) => f >= p.b + d).length;
  const fields = [{k: '"title"', ok: true}, {k: '"score"', ok: true}, {k: '"tags"', ok: false}];
  const retry = p.c + 52;
  return <Root>
    {L.world && <Stage>
      <Machine f={f} blocks={roles} reserve={2} reserveAt={0} chipOn={f >= p.b && f < p.b + 60} chipLabel="MODEL">
        {/* stream: deltas leave the chip one by one, at uneven intervals, and pack into the output slots */}
        {STREAM.map((d, i) => {
          if (f < p.b + d) return null;
          const k = springStep(t, S(p.b + d), {f: 2.6, z: 0.8});
          const tx = slotX(6) + 6 + (i % 6) * 26, ty = RACK_Y + 14 + Math.floor(i / 6) * 34;
          const x = CHIP.x - 10 + (tx - CHIP.x + 10) * k, y = CHIP.y + 60 + (ty - CHIP.y - 60) * k - 30 * Math.sin(Math.PI * clamp(k));
          return <rect key={i} x={x} y={y} width={22} height={28} rx={4} fill={A} />;
        })}
      </Machine>
    </Stage>}
    {L.hud && <>
      <Title f={f} items={[{at: 0, k: 'STAGE 01 · API 协议', t: '把接口拆开看'}, {at: p.a, k: 'messages', t: '四种角色，各管一件事'}, {at: p.b, k: 'stream', t: '一段段增量到达'},
        {at: p.c, k: 'structured output', t: '过 Schema 校验'}, {at: p.d, k: 'PROJECT 01', t: 'API Playground', c: A}]} />
      <Status y={600}>{f < p.b ? 'messages · system / user / assistant / tool' : f < p.c ? `stream · delta ${n}/${STREAM.length}${n === STREAM.length ? ' · finish_reason: stop' : ''}`
        : f < p.d ? `schema · ${f >= retry + 10 ? '3/3 通过' : f >= p.c + 40 ? '2/3 · 失败 → 重试' : '校验中'}` : 'usage · model · tokens · latency'}</Status>
      {f >= p.c - 4 && f < p.d + 4 && <div style={{position: 'absolute', left: 0, top: 650, width: 880, ...phaseOp(f, p.c - 4, p.d - 2)}}>
        <div style={{border: `2px solid ${LINE}`, borderRadius: 12, background: PANEL, padding: '12px 22px', fontFamily: mono, fontSize: 26, color: INK}}>
          {fields.map((fl, i) => {
            const at = p.c + 12 + i * 14;
            const bad = !fl.ok && f >= at && f < retry;
            return <div key={fl.k} style={{display: 'flex', alignItems: 'center', gap: 16, height: 38, opacity: f >= at - 6 ? 1 : 0.35}}>
              <span style={{width: 150}}>{fl.k}</span><span style={{color: DIM}}>{fl.ok ? 'string ✓' : bad ? 'null ✗ → 重试' : f >= retry ? 'array ✓' : '…'}</span>
            </div>;
          })}
        </div>
      </div>}
      <Card f={f} at={p.d} tab="PROJECT 01 · 大模型 API PLAYGROUND" c={A}>
        <Big size={33} w={700}>对话 · 流式 · 结构化输出 · 工具调用 · Embedding</Big>
        <Mono size={24} style={{marginTop: 8}}>{f >= p.e ? `每次调用记：模型 · Token · 耗时 · 两家 API 对比` : '验证：能讲清一次请求到响应的全过程'}</Mono>
      </Card>
    </>}
  </Root>;
};
API.sfx = (cue) => {
  const p = apiPlan(cue);
  return [...[0, 6, 12, 18].map((d) => ({at: p.a + d, kind: 'tick', gain: 0.1})), ...STREAM.filter((_, i) => i % 3 === 0).map((d) => ({at: p.b + d, kind: 'tick', gain: 0.08})),
    {at: p.c + 40, kind: 'stamp', gain: 0.18}, {at: p.c + 62, kind: 'tick', gain: 0.14}, {at: p.d + 8, kind: 'paper', gain: 0.18}, {at: p.e + 2, kind: 'tick', gain: 0.12}];
};
API.camera = (cue) => {
  const p = apiPlan(cue);
  return [cam(0, 440, 420, 1.0), cam(p.a, 240, 470, 1.12), cam(p.a + 50, 440, 300, 1.0), cam(p.b, 700, 470, 1.14), cam(p.c, 440, 560, 1.04), cam(p.c + 70, 300, 360, 1.12), cam(p.d, 440, 380, 0.98), cam(p.e, 440, 460, 1.06)];
};

/* ---------- prompt: the SYS block opens into a spec ---------- */

const promptPlan = (cue: Cue) => {
  const [a, b, c, d] = [cue('a', 89), cue('b', 186), cue('c', 272), cue('d', 400)];
  return {a, b, c, d, lift: 18};
};
const SPEC = ['角色', '任务', '材料', '格式', '约束'];
const Prompt: Scene = ({f, cue, layer}) => {
  const L = layers(layer);
  const p = promptPlan(cue);
  const t = S(f);
  const cr = crane(f, []);
  // the crane lifts the SYS block out of slot 0 and it opens into a spec panel
  const up = springStep(t, S(p.lift), {f: 1.5, z: 0.85});
  const open = springStep(t, S(p.lift + 26), {f: 1.4, z: 0.85});
  const bx = slotX(0) + (20 - slotX(0)) * up, by = RACK_Y + 10 - 200 * up;
  return <Root>
    {L.world && <Stage>
      <Machine f={f} blocks={[{at: -100, slot: 1, span: 2, label: '历史'}, {at: -100, slot: 3, label: '工具'}, {at: -100, slot: 4, span: 2, label: '资料'}]} rackOp={1 - 0.6 * open}
        craneAt={{x: 60 + 0 * cr.x, len: 40 + (RACK_Y - RAIL_Y - 14) * (1 - up)}} />
      {open < 0.05 ? <BlockRect x={bx} y={by} w={SLOT_W} label="SYS" /> : <g>
        <rect x={20} y={230} width={20 + 520 * open} height={40 + 300 * open} rx={10} fill={PANEL} stroke={INK} strokeWidth={2} />
        <text x={36} y={262} fontFamily={mono} fontWeight={700} fontSize={18} fill={DIM} opacity={open}>SYSTEM PROMPT · SPEC</text>
        {SPEC.map((s, i) => {
          const k = clamp((f - (p.a + i * 7)) / 8);
          return <g key={s} opacity={open}>
            <text x={44} y={318 + i * 54} fontFamily={font} fontWeight={900} fontSize={30} fill={INK}>{s}</text>
            <rect x={130} y={296 + i * 54} width={380} height={28} rx={5} fill={BG} stroke={LINE} strokeWidth={1.5} />
            <rect x={134} y={300 + i * 54} width={372 * k * (0.55 + 0.45 * hash(i + 3))} height={20} rx={4} fill={PANEL_HI} />
            {tickMark(530, 310 + i * 54, (f - p.a - i * 7 - 4) / 8)}
          </g>;
        })}
      </g>}
      {[0, 1, 2].map((i) => {
        const at = p.b + 8 + i * 9;
        if (f < at - 14) return null;
        const lift = dropLift(f, at, 0, 300);
        const hit = hitOf(f, [at], 1);
        return <g key={i} transform={`translate(${600} ${250 + i * 100 - lift}) scale(${1 + 0.05 * hit} ${1 - 0.1 * hit})`}>
          <rect x={0} y={0} width={230} height={80} rx={10} fill={PANEL_HI} stroke={LINE} strokeWidth={2} />
          <text x={20} y={34} fontFamily={mono} fontWeight={700} fontSize={20} fill={DIM}>FEW-SHOT</text>
          <text x={20} y={64} fontFamily={font} fontWeight={900} fontSize={28} fill={INK}>例 {i + 1} · 真实输入</text>
        </g>;
      })}
    </Stage>}
    {L.hud && <>
      <Title f={f} items={[{at: 0, k: 'STAGE 02 · Prompt', t: '贯穿每一个项目'}, {at: p.a, k: '结构', t: '把要求写清楚'}, {at: p.b, k: 'Few-shot', t: '给几个真实例子'},
        {at: p.c, k: '推理模型', t: '不必硬加这一句'}, {at: p.d, k: '每个项目', t: '≥ 3 组改前 / 改后对比'}]} />
      {f >= p.c - 4 && <div style={{position: 'absolute', left: 0, top: 650, width: 880, ...phaseOp(f, p.c - 4, p.d - 2)}}>
        <div style={{border: `2px solid ${LINE}`, borderRadius: 12, background: PANEL, padding: '16px 22px', display: 'flex', alignItems: 'center', gap: 20}}>
          <Big size={40} w={800}><Strike p={draw(f, p.c + 16, 10)} c={B} w={6}>“请一步一步思考”</Strike></Big>
          <Mono size={22} c={B} style={{opacity: clamp((f - p.c - 26) / 8)}}>推理模型：未必有收益</Mono>
        </div>
      </div>}
      {f >= p.d - 4 && <div style={{position: 'absolute', left: 0, top: 650, width: 880, ...phaseOp(f, p.d - 4)}}>
        <div style={{border: `2px solid ${B}`, borderRadius: 12, background: PANEL, padding: '12px 22px', fontFamily: mono, fontSize: 24, color: INK}}>
          {[0, 1, 2].map((i) => <div key={i} style={{display: 'flex', gap: 18, height: 36, alignItems: 'center', opacity: clamp((f - p.d - 4 - i * 10) / 8)}}>
            <span style={{color: DIM}}>对比 {i + 1}</span><span>同一组输入</span><span style={{color: DIM}}>改前 → 改后</span><span style={{color: B, marginLeft: 'auto'}}>记录改善 / 新问题</span></div>)}
        </div>
      </div>}
    </>}
  </Root>;
};
Prompt.sfx = (cue) => {
  const p = promptPlan(cue);
  return [{at: p.lift, kind: 'whoosh-short', gain: 0.14}, ...SPEC.map((_, i) => ({at: p.a + i * 7 + 4, kind: 'tick', gain: 0.1})), ...[0, 1, 2].map((i) => ({at: p.b + 8 + i * 9, kind: 'tap', gain: 0.14})),
    {at: p.c + 16, kind: 'stamp', gain: 0.16}, ...[0, 1, 2].map((i) => ({at: p.d + 4 + i * 10, kind: 'tick', gain: 0.1}))];
};
Prompt.camera = (cue) => {
  const p = promptPlan(cue);
  return [cam(0, 200, 470, 1.12), cam(p.lift + 20, 300, 380, 1.0), cam(p.a, 280, 420, 1.1), cam(p.b, 700, 380, 1.12), cam(p.c, 440, 500, 1.0), cam(p.c + 50, 280, 360, 1.14), cam(p.d, 440, 460, 1.06)];
};

/* ---------- rag ---------- */

const ragPlan = (cue: Cue) => {
  const [a, b, c, d, e, g] = [cue('a', 92), cue('b', 141), cue('c', 192), cue('d', 283), cue('e', 352), cue('f', 397)];
  return {a, b, c, d, e, g};
};
const DOTS = Array.from({length: 26}, (_, i) => ({x: 300 + hash(i * 2.7) * 240, y: 250 + hash(i * 5.1) * 280, kw: i % 7 === 2}));
const Q = {x: 430, y: 380};
const near = DOTS.map((d, i) => ({i, d: Math.hypot(d.x - Q.x, d.y - Q.y)})).sort((u, v) => u.d - v.d).slice(0, 4).map((u) => u.i);
const RANK0 = [0, 1, 2, 3, 4], RANK1 = [2, 0, 4, 1, 3];
const RAG: Scene = ({f, cue, layer}) => {
  const L = layers(layer);
  const p = ragPlan(cue);
  const t = S(f);
  const toRack = springStep(t, S(p.e - 14), {f: 1.4, z: 0.9});
  const cut = clamp((f - p.a) / 16);
  return <Root>
    {L.world && <Stage>
      <g opacity={1 - toRack}>
        {/* the document, cut into chunks by a blade line */}
        {[0, 1, 2, 3, 4].map((i) => {
          const gap = 12 * ease.outCubic(clamp((f - p.a - 14) / 12));
          const fly = springStep(t, S(p.b + i * 4), {f: 1.6, z: 0.85});
          const dot = DOTS[i * 5];
          const x0 = 20, y0 = 230 + i * (62 + gap);
          return <g key={i} transform={`translate(${(dot.x - x0 - 80) * fly} ${(dot.y - y0 - 26) * fly}) scale(${1 - 0.85 * fly})`} style={{transformOrigin: `${x0 + 80}px ${y0 + 26}px`}}>
            <rect x={x0} y={y0} width={180} height={56} rx={6} fill={STEEL} />
            {[0, 1].map((j) => <rect key={j} x={x0 + 14} y={y0 + 14 + j * 16} width={150 - j * 40 - hash(i + j) * 30} height={8} rx={4} fill={BG} opacity={0.5} />)}
          </g>;
        })}
        {cut > 0 && cut < 1 && <line x1={10} x2={210} y1={230 + 320 * cut} y2={230 + 320 * cut} stroke={B} strokeWidth={3} />}
        {/* vector field */}
        <rect x={280} y={230} width={280} height={320} rx={10} fill="none" stroke={LINE} strokeWidth={2} opacity={clamp((f - p.b + 10) / 10)} />
        <text x={292} y={222} fontFamily={mono} fontWeight={700} fontSize={20} fill={DIM} opacity={clamp((f - p.b + 10) / 10)}>INDEX · VECTOR + BM25</text>
        {DOTS.map((d, i) => {
          const on = f >= p.b + 10 + (i % 6) * 2;
          const hitNear = f >= p.c + 10 && near.includes(i);
          const hitKw = f >= p.c + 22 && d.kw;
          return <g key={i} opacity={on ? 1 : 0}>
            <circle cx={d.x} cy={d.y} r={hitNear ? 11 : 7} fill={hitNear ? B : INK} />
            {hitKw && <rect x={d.x - 12} y={d.y - 12} width={24} height={24} fill="none" stroke={B} strokeWidth={2.5} />}
          </g>;
        })}
        {f >= p.c - 10 && <g transform={`translate(0 ${-dropLift(f, p.c, 0, 200)})`}>
          <circle cx={Q.x} cy={Q.y} r={11} fill={A} />
          <circle cx={Q.x} cy={Q.y} r={20 + 60 * clamp((f - p.c - 4) / 14)} fill="none" stroke={A} strokeWidth={2} strokeDasharray="6 6" opacity={f >= p.c ? 1 : 0} />
        </g>}
        {/* candidates, re-ranked on 「重排」 */}
        {f >= p.c + 30 && [0, 1, 2, 3, 4].map((r) => {
          const y0 = 250 + RANK0.indexOf(r) * 62, y1 = 250 + RANK1.indexOf(r) * 62;
          const y = springTrack(t, y0, [{at: S(p.d + 2 + r * 3), to: y1}], {f: 1.8, z: 0.7});
          const keep = RANK1.indexOf(r) < 3;
          const fade = f >= p.d + 30 && !keep ? clamp((f - p.d - 30) / 10) : 0;
          return <g key={r} opacity={clamp((f - p.c - 30 - r * 3) / 8) * (1 - 0.75 * fade)}>
            <rect x={600} y={y} width={240} height={50} rx={6} fill={PANEL} stroke={keep && f >= p.d + 30 ? B : LINE} strokeWidth={2} />
            <text x={614} y={y + 32} fontFamily={mono} fontWeight={700} fontSize={24} fill={INK}>chunk {r + 1}</text>
            <rect x={740} y={y + 18} width={86 * (keep ? 0.9 - RANK1.indexOf(r) * 0.15 : 0.35)} height={14} rx={3} fill={keep ? B : DIM} />
          </g>;
        })}
      </g>
      {toRack > 0.02 && <g opacity={toRack}>
        <Machine f={f} blocks={[0, 1, 2].map((i): Blk => ({at: p.e + 2 + i * 7, slot: i, label: `[${i + 1}]`, kind: 'b'}))} craneAt={{x: 380, len: 40}} chipOn={f >= p.e + 26}>
          {f >= p.e + 26 && (() => {
            const k = springStep(t, S(p.e + 26), {f: 2.2, z: 0.8});
            const none = f >= p.g + 6;
            return <g transform={`translate(${CHIP.x - 330 * k} ${CHIP.y + CHIP.h + 34})`}>
              <rect x={0} y={0} width={300} height={64} rx={8} fill={none ? BG : A} stroke={none ? INK : 'none'} strokeWidth={3} />
              <text x={150} y={42} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={30} fill={none ? INK : BG}>{none ? '证据不足' : '回答 · 引用 [1][3]'}</text>
            </g>;
          })()}
        </Machine>
      </g>}
    </Stage>}
    {L.hud && <>
      <Title f={f} items={[{at: 0, k: 'STAGE 03 · RAG', t: '资料变成可引用的证据'}, {at: p.a, k: '解析 → 切块', t: '先把文档切开'}, {at: p.b, k: 'Embedding', t: '变成向量存进索引'},
        {at: p.c, k: '召回', t: '向量 + 关键词一起找'}, {at: p.d, k: 'Rerank', t: '重排，只留最相关的'}, {at: p.e, k: '生成', t: <>回答带<span style={{color: B}}>引用</span></>},
        {at: p.g, k: '资料里没有', t: '明说证据不足'}]} />
      <Card f={f} at={4} to={p.a - 2} tab="PROJECT 02 · RAG + TOOL CALLING AGENT" c={A}>
        <Big size={33} w={700}>导入文档 · 引用来源 · 至少 2 个工具</Big>
        <Mono size={24} style={{marginTop: 8}}>验收：不少于 20 条测试问题 + 失败案例分析</Mono>
      </Card>
    </>}
  </Root>;
};
RAG.sfx = (cue) => {
  const p = ragPlan(cue);
  return [{at: 10, kind: 'paper', gain: 0.16}, {at: p.a + 2, kind: 'whoosh-short', gain: 0.14}, {at: p.b + 4, kind: 'whoosh-short', gain: 0.12}, {at: p.c, kind: 'tap', gain: 0.16},
    {at: p.d + 4, kind: 'tick', gain: 0.12}, ...[0, 1, 2].map((i) => ({at: p.e + 2 + i * 7, kind: 'tap', gain: 0.12})), {at: p.g + 6, kind: 'stamp', gain: 0.2}];
};
RAG.camera = (cue) => {
  const p = ragPlan(cue);
  return [cam(0, 440, 520, 1.0), cam(p.a, 120, 400, 1.14), cam(p.b, 420, 400, 1.1), cam(p.c, 430, 380, 1.14), cam(p.d, 720, 380, 1.12), cam(p.e, 300, 470, 1.04), cam(p.g, 640, 560, 1.1)];
};

/* ---------- loop: the agent loop ---------- */

const loopPlan = (cue: Cue) => {
  const [a, b, c, d, e] = [cue('a', 67), cue('b', 100), cue('c', 131), cue('d', 176), cue('e', 262)];
  return {a, b, c, d, e};
};
const TOOL = {x: 30, y: 300, w: 150, h: 96};
const Loop: Scene = ({f, cue, layer}) => {
  const L = layers(layer);
  const p = loopPlan(cue);
  const t = S(f);
  // one full round slowly (a → b → c), then two faster rounds, step counter 1 → 3, then DONE on 「完成」
  const rounds = [{call: p.a, exec: p.b, back: p.c}, {call: p.c + 12, exec: p.c + 22, back: p.c + 32}, {call: p.c + 38, exec: p.c + 46, back: p.d - 4}];
  const keys = rounds.flatMap((r) => [{at: S(r.call), to: CHIP.x - 60}, {at: S(r.call + 6), to: TOOL.x + TOOL.w / 2}, {at: S(r.exec + 4), to: slotX(5) + 40}]);
  const cx = springTrack(t, 300, keys, {f: 2.2, z: 0.8});
  const step = rounds.filter((r) => f >= r.back).length;
  const toolHit = hitOf(f, rounds.map((r) => r.exec), 1);
  const gear = rounds.reduce((s, r) => s + 90 * springStep(t, S(r.exec), {f: 1.4, z: 0.9}), 0);
  const cur = [...rounds].reverse().find((r) => f >= r.call);
  const phase = !cur ? 'idle' : f < cur.exec ? 'call' : f < cur.back ? 'result' : 'placed';
  const done = f >= p.d;
  const results: Blk[] = rounds.map((r, i) => ({at: r.back, slot: 5 + i, label: `结果${i + 1}`, kind: 'b' as const}));
  return <Root>
    {L.world && <Stage>
      <Machine f={f} blocks={[{at: -100, slot: 0, label: 'SYS'}, {at: -100, slot: 1, span: 2, label: '任务'}, {at: -100, slot: 3, span: 2, label: '历史'}, ...results]}
        craneAt={{x: cx, len: 46}} chipOn={phase === 'call'}>
        <g transform={`translate(0 ${4 * toolHit})`}>
          <rect x={TOOL.x} y={TOOL.y} width={TOOL.w} height={TOOL.h} rx={10} fill={PANEL} stroke={B} strokeWidth={3} />
          <text x={TOOL.x + 16} y={TOOL.y + 30} fontFamily={mono} fontWeight={800} fontSize={20} fill={B}>TOOL</text>
          <g transform={`translate(${TOOL.x + 112} ${TOOL.y + 58}) rotate(${gear})`}>
            <circle r={18} fill="none" stroke={B} strokeWidth={4} />
            {[0, 60, 120, 180, 240, 300].map((r) => <rect key={r} x={-4} y={-26} width={8} height={10} fill={B} transform={`rotate(${r})`} />)}
          </g>
          <text x={TOOL.x + 16} y={TOOL.y + 76} fontFamily={font} fontWeight={800} fontSize={22} fill={INK}>执行</text>
        </g>
        {/* the block in flight: an amber tool call on the way out, a cyan result on the way back */}
        {cur && (phase === 'call' || phase === 'result') && <BlockRect x={cx - 40} y={RAIL_Y + 14 + 46 + 4} w={80} h={56} size={20}
          kind={phase === 'call' ? 'a' : 'b'} label={phase === 'call' ? 'call' : 'result'} />}
        {/* loop arrow */}
        <path d={`M${CHIP.x + 52} ${CHIP.y + CHIP.h + 20} C ${CHIP.x + 52} 660, ${TOOL.x + 75} 660, ${TOOL.x + 75} ${TOOL.y + TOOL.h + 14}`} fill="none" stroke={LINE} strokeWidth={2}
          strokeDasharray="8 8" strokeDashoffset={-f * 1.5} />
      </Machine>
    </Stage>}
    {L.hud && <>
      <Title f={f} items={[{at: 0, k: 'STAGE 04 · Agent', t: '核心是一个循环'}, {at: p.a, k: 'step 1', t: <><span style={{color: A}}>模型</span>提出下一步</>},
        {at: p.b, k: 'step 1', t: <><span style={{color: B}}>系统</span>去执行</>}, {at: p.c, k: 'step 1', t: '结果放回上下文'}, {at: p.d, k: '停止条件', t: '完成，或撞上最大步数'},
        {at: p.e, k: 'PROJECT 03', t: '简化 Coding Agent', c: A}]} />
      <div style={{position: 'absolute', right: 0, top: 0, textAlign: 'right'}}>
        <Mono size={24}>STEP</Mono>
        <Num size={100} c={done ? B : INK}>{done ? 'DONE' : <>{step}<span style={{fontSize: 40, color: DIM}}>/max 8</span></>}</Num>
      </div>
      <Card f={f} at={p.e} tab="PROJECT 03 · 从 0 到 1 写一个 CODING AGENT" c={A}>
        <Big size={33} w={700}>读懂 learn-claude-code，再从零实现</Big>
        <Mono size={24} style={{marginTop: 8}}>验收：核心循环 · 工具执行 · 权限 · 上下文管理 · 一处可验证的改动</Mono>
      </Card>
    </>}
  </Root>;
};
Loop.sfx = (cue) => {
  const p = loopPlan(cue);
  return [{at: p.a, kind: 'whoosh-short', gain: 0.14}, {at: p.b, kind: 'tap', gain: 0.18}, {at: p.c, kind: 'tap', gain: 0.16}, {at: p.c + 22, kind: 'tap', gain: 0.1}, {at: p.c + 46, kind: 'tap', gain: 0.1},
    {at: p.d, kind: 'tick', gain: 0.16}, {at: p.e + 8, kind: 'paper', gain: 0.18}];
};
Loop.camera = (cue) => {
  const p = loopPlan(cue);
  return [cam(0, 440, 420, 1.0), cam(p.a, 760, 420, 1.12), cam(p.b, 120, 380, 1.14), cam(p.c, 560, 470, 1.1), cam(p.d, 440, 360, 0.98), cam(p.e, 440, 460, 1.06), cam(p.e + 44, 640, 340, 1.12)];
};

/* ---------- guard: state, memory, approval, injection ---------- */

const guardPlan = (cue: Cue) => {
  const [a, b, c, d] = [cue('a', 64), cue('b', 150), cue('c', 244), cue('d', 330)];
  return {a, b, c, d, cut: a + 6, back: a + 46};
};
const Guard: Scene = ({f, cue, layer}) => {
  const L = layers(layer);
  const p = guardPlan(cue);
  const t = S(f);
  const off = f >= p.cut && f < p.back;
  const plug = f < p.cut ? 0 : f < p.back ? springStep(t, S(p.cut), {f: 2.4, z: 0.6}) * (1 - springStep(t, S(p.back - 8), {f: 3, z: 0.9})) : 0;
  const mem: Blk[] = [{at: p.b + 34, slot: 6, label: '记忆', kind: 'b', from: 95}, {at: p.b + 72, slot: 7, label: '记忆', kind: 'b', from: 95}];
  // approval gate: the crane brings a 「删除文件」 block, the barrier holds it until the switch is thrown
  const gateOpen = springStep(t, S(p.c + 40), {f: 1.6, z: 0.8});
  const ax = springTrack(t, 900, [{at: S(p.c - 6), to: 470}, {at: S(p.c + 46), to: 150}], {f: 1.6, z: 0.75});
  const blocked = f >= p.c + 6 && f < p.c + 44;
  return <Root>
    {L.world && <Stage>
      <g opacity={off ? 0.35 : 1}>
        <Machine f={f} blocks={[{at: -100, slot: 0, label: 'SYS'}, {at: -100, slot: 1, span: 2, label: '任务'}, {at: -100, slot: 3, label: '结果'},
          ...(f >= p.d ? [{at: p.d + 8, slot: 4, span: 2, label: '网页', kind: 'n' as const, tag: '资料 · 不可执行', tagAt: p.d + 20, from: 900}] : []), ...mem]}
          craneAt={f >= p.c - 30 && f < p.c + 70 ? {x: ax, len: 46} : undefined} chipOn={!off && f < p.b} />
      </g>
      {/* power: the cable is pulled at {a} and plugged back in */}
      <path d={`M-30 ${CHIP.y + 140} L${CHIP.x - 30 - 60 * plug} ${CHIP.y + 140} `} stroke={off ? DIM : B} strokeWidth={5} fill="none" />
      <rect x={CHIP.x - 30 - 60 * plug} y={CHIP.y + 128} width={26} height={24} rx={4} fill={off ? DIM : B} />
      {/* database: many rows, only two make it into the rack */}
      {f >= p.b - 10 && <g opacity={clamp((f - p.b + 10) / 10) * (f >= p.c - 20 ? 1 - clamp((f - p.c + 20) / 10) : 1)}>
        <ellipse cx={95} cy={300} rx={75} ry={18} fill={PANEL_HI} stroke={B} strokeWidth={3} />
        <rect x={20} y={300} width={150} height={110} fill={PANEL} />
        <line x1={20} x2={20} y1={300} y2={410} stroke={B} strokeWidth={3} /><line x1={170} x2={170} y1={300} y2={410} stroke={B} strokeWidth={3} />
        <path d="M20 410 A75 18 0 0 0 170 410" fill={PANEL} stroke={B} strokeWidth={3} />
        {Array.from({length: 7}, (_, i) => <line key={i} x1={36} x2={154} y1={326 + i * 12} y2={326 + i * 12} stroke={DIM} strokeWidth={3} opacity={0.6} />)}
        <text x={95} y={290} textAnchor="middle" fontFamily={mono} fontWeight={700} fontSize={16} fill={B}>DB · 存着</text>
      </g>}
      {/* the gate and the approval switch */}
      {f >= p.c - 20 && f < p.d && <g opacity={clamp((f - p.c + 20) / 10) * (1 - clamp((f - p.d + 14) / 10))}>
        <line x1={330} x2={330} y1={RAIL_Y + 6} y2={RAIL_Y + 6 + 150 * (1 - gateOpen)} stroke={B} strokeWidth={8} strokeLinecap="round" />
        <text x={344} y={RAIL_Y + 160} fontFamily={font} fontWeight={800} fontSize={24} fill={B} opacity={1 - gateOpen}>等确认</text>
        <g transform={`translate(330 ${RAIL_Y - 40})`}>
          <rect x={-40} y={-18} width={80} height={36} rx={18} fill={BG} stroke={B} strokeWidth={3} />
          <circle cx={-22 + 44 * gateOpen} cy={0} r={12} fill={B} />
        </g>
        {blocked || f < p.c + 70 ? <BlockRect x={ax - 60} y={RAIL_Y + 64} w={120} h={56} size={22} kind="a" label="删除文件" sq={hitOf(f, [p.c + 6], 1)} /> : null}
      </g>}
      {/* injection: the line from the web block to 「执行」 is cut */}
      {f >= p.d + 30 && <g opacity={clamp((f - p.d - 30) / 10)}>
        <path d={`M${slotX(4) + 80} ${RACK_Y + 110} Q ${slotX(4) + 80} 620 ${CHIP.x - 120} 620`} fill="none" stroke={A} strokeWidth={3} strokeDasharray="8 8" />
        <text x={CHIP.x - 110} y={628} fontFamily={font} fontWeight={800} fontSize={24} fill={INK}>执行</text>
        {crossMark(slotX(5) + 60, 604, (f - p.d - 46) / 6, INK)}
      </g>}
    </Stage>}
    {L.hud && <>
      <Title f={f} items={[{at: 0, k: 'STAGE 04 · 循环之外', t: '全是工程'}, {at: p.a, k: '状态', t: '断了，要知道做到哪一步'}, {at: p.b, k: '记忆', t: '存着 ≠ 这一轮看到了'},
        {at: p.c, k: 'Human-in-the-Loop', t: '危险操作，先等确认'}, {at: p.d, k: 'Prompt Injection', t: '外部内容是资料，不是指令'}]} />
      <Status y={612}>{f < p.a ? 'agent · running' : f < p.b ? (off ? 'agent · 进程中断 · checkpoint = step 5' : f >= p.back ? 'agent · 从 step 5 恢复' : 'agent · running · step 5')
        : f < p.c ? 'memory · 库里 7 行 → 本轮放进 2 行' : f < p.d ? (gateOpen > 0.5 ? 'approval · 已确认 → 执行' : 'approval · 等待人工确认') : 'input · 网页内容 = 不可信资料'}</Status>
    </>}
  </Root>;
};
Guard.sfx = (cue) => {
  const p = guardPlan(cue);
  return [{at: p.cut, kind: 'thud', gain: 0.24}, {at: p.back, kind: 'tap', gain: 0.18}, ...[p.b + 34, p.b + 72].map((at) => ({at, kind: 'tap', gain: 0.14})),
    {at: p.c + 6, kind: 'block', gain: 0.2}, {at: p.c + 40, kind: 'tick', gain: 0.16}, {at: p.d + 8, kind: 'tap', gain: 0.14}, {at: p.d + 46, kind: 'stamp', gain: 0.18}];
};
Guard.camera = (cue) => {
  const p = guardPlan(cue);
  return [cam(0, 440, 420, 1.0), cam(p.a, 700, 520, 1.12), cam(p.back, 440, 420, 1.0), cam(p.b, 200, 400, 1.12), cam(p.c, 360, 340, 1.12), cam(p.d, 520, 520, 1.1)];
};

/* ---------- backend: the machine goes into a service box ---------- */

const backendPlan = (cue: Cue) => {
  const [a, b, c, d, e] = [cue('a', 80), cue('b', 121), cue('c', 189), cue('d', 232), cue('e', 322)];
  return {a, b, c, d, e};
};
const Backend: Scene = ({f, cue, layer}) => {
  const L = layers(layer);
  const p = backendPlan(cue);
  const t = S(f);
  const shrink = springStep(t, S(6), {f: 1.2, z: 0.9});
  const s = 1 - 0.62 * shrink;
  const comps = [
    {at: p.a, x: 20, y: 240, w: 210, label: 'FastAPI', sub: '接请求 · Pydantic'},
    {at: p.b, x: 20, y: 470, w: 210, label: 'PostgreSQL', sub: '会话 · 消息 · 任务'},
    {at: p.c, x: 640, y: 470, w: 210, label: 'Redis', sub: '缓存 · 状态'},
    {at: p.d, x: 640, y: 240, w: 210, label: 'Queue', sub: '长任务 · 后台跑'},
  ];
  const box = {x: 265, y: 300, w: 350, h: 200};
  return <Root>
    {L.world && <Stage>
      <g transform={`translate(${279 * shrink} ${243 * shrink}) scale(${s})`}>
        <Machine f={f} blocks={[{at: -100, slot: 0, label: 'SYS'}, {at: -100, slot: 1, span: 2, label: '任务'}, {at: -100, slot: 3, label: '结果'}]} chipOn={f % 30 < 15} />
      </g>
      <rect x={box.x - 10} y={box.y - 10} width={box.w + 20} height={box.h + 20} rx={14} fill="none" stroke={B} strokeWidth={3} opacity={clamp(shrink * 1.5 - 0.4)}
        strokeDasharray={1200} strokeDashoffset={1200 * (1 - clamp(shrink * 1.4 - 0.3))} />
      <text x={box.x} y={box.y - 22} fontFamily={mono} fontWeight={800} fontSize={20} fill={B} opacity={clamp(shrink * 2 - 1)}>agent-service</text>
      {comps.map((c, i) => {
        if (f < c.at - 12) return null;
        const lift = dropLift(f, c.at, 0, 240);
        const hit = hitOf(f, [c.at], 1);
        const link = clamp((f - c.at - 4) / 10);
        const cx = c.x + c.w / 2, cy = c.y + 46;
        const tx = cx < 440 ? box.x - 10 : box.x + box.w + 10, ty = box.y + 40 + (cy > 400 ? 150 : 0);
        return <g key={c.label}>
          <line x1={cx < 440 ? c.x + c.w : c.x} y1={cy} x2={(cx < 440 ? c.x + c.w : c.x) + (tx - (cx < 440 ? c.x + c.w : c.x)) * link} y2={cy + (ty - cy) * link} stroke={LINE} strokeWidth={3} />
          {link >= 1 && [0, 1].map((k) => {
            const u = ((f - c.at + k * 20 + i * 7) % 40) / 40;
            const x0 = cx < 440 ? c.x + c.w : c.x;
            return <rect key={k} x={x0 + (tx - x0) * u - 7} y={cy + (ty - cy) * u - 7} width={14} height={14} rx={3} fill={i === 0 ? A : B} />;
          })}
          <g transform={`translate(0 ${-lift}) scale(${1 + 0.05 * hit} ${1 - 0.08 * hit})`} style={{transformOrigin: `${cx}px ${c.y + 92}px`}}>
            <rect x={c.x} y={c.y} width={c.w} height={92} rx={10} fill={STEEL} />
            <rect x={c.x} y={c.y} width={8} height={92} rx={3} fill={B} />
            <text x={c.x + 20} y={c.y + 40} fontFamily={mono} fontWeight={800} fontSize={26} fill={BG}>{c.label}</text>
            <text x={c.x + 20} y={c.y + 72} fontFamily={font} fontWeight={700} fontSize={21} fill={BG} opacity={0.75}>{c.sub}</text>
          </g>
        </g>;
      })}
    </Stage>}
    {L.hud && <>
      <Title f={f} items={[{at: 0, k: 'STAGE 05 · 后端', t: '把 Agent 做成服务'}, {at: p.a, k: 'API', t: 'FastAPI 接请求'}, {at: p.b, k: '持久化', t: 'PostgreSQL 存会话和任务'},
        {at: p.c, k: '缓存', t: 'Redis 管缓存和状态'}, {at: p.d, k: '异步', t: '长任务进队列'}, {at: p.e, k: 'PROJECT 04 · 验收', t: '一条命令，跑起来', c: A}]} />
      {f >= p.e - 4 && <div style={{position: 'absolute', left: 0, top: 650, width: 880, ...phaseOp(f, p.e - 4)}}>
        <div style={{border: `2px solid ${A}`, borderRadius: 12, background: '#081320', padding: '14px 22px', fontFamily: mono, fontSize: 28, color: INK}}>
          {[{cmd: '$ docker compose up', ok: '服务已启动', at: p.e + 6}, {cmd: '$ pytest', ok: '测试通过', at: p.e + 34}].map((l) => <div key={l.cmd} style={{display: 'flex', height: 46, alignItems: 'center',
            opacity: clamp((f - l.at + 10) / 6)}}>
            <span>{l.cmd.slice(0, Math.max(0, Math.round((f - l.at + 10) * 1.6)))}</span>
            <span style={{marginLeft: 'auto', color: B, opacity: clamp((f - l.at) / 6)}}>✓ {l.ok}</span></div>)}
        </div>
      </div>}
    </>}
  </Root>;
};
Backend.sfx = (cue) => {
  const p = backendPlan(cue);
  return [{at: 10, kind: 'whoosh-short', gain: 0.12}, ...[p.a, p.b, p.c, p.d].map((at) => ({at, kind: 'tap', gain: 0.16})), {at: p.e + 6, kind: 'tick', gain: 0.14}, {at: p.e + 34, kind: 'tick', gain: 0.14}];
};
Backend.camera = (cue) => {
  const p = backendPlan(cue);
  return [cam(0, 440, 470, 1.12), cam(30, 440, 400, 1.0), cam(p.a, 160, 300, 1.1), cam(p.b, 160, 520, 1.1), cam(p.c, 720, 520, 1.1), cam(p.d, 720, 300, 1.1), cam(p.e, 440, 460, 1.02)];
};

/* ---------- projects: four directions ---------- */

const projPlan = (cue: Cue) => {
  const [a, b, c, d, e] = [cue('a', 92), cue('b', 205), cue('c', 331), cue('d', 446), cue('e', 530)];
  return {a, b, c, d, e};
};
const DIRS = [
  {k: 'CODING AGENT', name: '编程 Agent', repos: ['Pi', 'Codex CLI'], note: '先 Pi，再对照'},
  {k: 'WORKING AGENT', name: '办公 Agent', repos: ['WorkBuddy', 'OpenWork'], note: '体验 / 读源码'},
  {k: 'RESIDENT', name: '常驻助手', repos: ['nanobot', 'OpenClaw'], note: '先 nanobot'},
  {k: 'PERSONAL AGENT', name: '个人 Agent', repos: ['OpenBot', 'OpenDots'], note: 'CopilotKit'},
];
const Projects: Scene = ({f, cue, layer}) => {
  const L = layers(layer);
  const p = projPlan(cue);
  const ats = [p.a, p.b, p.c, p.d];
  return <Root>
    {L.world && <Stage>
      {DIRS.map((d, i) => {
        const at = ats[i];
        if (f < at - 14) return null;
        const x = 20 + (i % 2) * 430, y = 200 + Math.floor(i / 2) * 230;
        const lift = dropLift(f, at, 0, 320);
        const hit = hitOf(f, [at], 1);
        const nb = hitOf(f, [at + 3], 0.5);
        return <g key={d.k} transform={`translate(0 ${-lift + 3 * nb})`}>
          <g transform={`translate(${x + 205} ${y + 210}) scale(${1 + 0.04 * hit} ${1 - 0.07 * hit}) translate(${-x - 205} ${-y - 210})`}>
            <rect x={x} y={y} width={410} height={210} rx={12} fill={PANEL} stroke={i === 0 ? A : LINE} strokeWidth={2.5} />
            <text x={x + 22} y={y + 38} fontFamily={mono} fontWeight={800} fontSize={18} fill={i === 0 ? A : DIM}>{String(i + 1).padStart(2, '0')} · {d.k}</text>
            <text x={x + 22} y={y + 86} fontFamily={font} fontWeight={900} fontSize={38} fill={INK}>{d.name}</text>
            {d.repos.map((r, j) => <g key={r} opacity={clamp((f - at - 6 - j * 6) / 8)}>
              <rect x={x + 22 + j * 190} y={y + 112} width={176} height={46} rx={6} fill={B} />
              <text x={x + 110 + j * 190} y={y + 143} textAnchor="middle" fontFamily={mono} fontWeight={800} fontSize={26} fill={BG}>{r}</text>
            </g>)}
            <text x={x + 22} y={y + 190} fontFamily={font} fontWeight={700} fontSize={23} fill={DIM} opacity={clamp((f - at - 18) / 8)}>{d.note}</text>
          </g>
        </g>;
      })}
    </Stage>}
    {L.hud && <>
      <Title f={f} items={[{at: 0, k: 'PROJECT 05 · 综合', t: '四个方向'}, {at: p.e, k: '每个方向挑一个', t: '跑通 · 讲清 · 改一处'}]} />
      <div style={{position: 'absolute', left: 0, top: 690, width: 880, display: 'flex', gap: 22, ...phaseOp(f, p.e)}}>
        {['跑通一个任务', '讲清执行过程', '改一处并验证'].map((s, i) => <div key={s} style={{flex: 1, border: `2px solid ${f >= p.e + 10 + i * 16 ? B : LINE}`, borderRadius: 10,
          padding: '12px 14px', fontFamily: font, fontWeight: 800, fontSize: 26, color: INK, background: PANEL}}>
          <span style={{color: B, fontFamily: mono}}>{f >= p.e + 10 + i * 16 ? '✓' : '○'}</span> {s}</div>)}
      </div>
    </>}
  </Root>;
};
Projects.sfx = (cue) => {
  const p = projPlan(cue);
  return [...[p.a, p.b, p.c, p.d].map((at) => ({at, kind: 'paper', gain: 0.18})), ...[0, 1, 2].map((i) => ({at: p.e + 10 + i * 16, kind: 'tick', gain: 0.14}))];
};
Projects.camera = (cue) => {
  const p = projPlan(cue);
  return [cam(0, 440, 300, 1.04), cam(p.a, 225, 300, 1.12), cam(p.a + 60, 440, 420, 0.98), cam(p.b, 655, 300, 1.12), cam(p.b + 60, 440, 420, 0.98), cam(p.c, 225, 530, 1.12), cam(p.c + 60, 440, 420, 0.98), cam(p.d, 655, 530, 1.12), cam(p.e, 440, 460, 1.0), cam(p.e + 64, 440, 260, 1.08)];
};

/* ---------- outro ---------- */

const outroPlan = (cue: Cue) => {
  const [a, b, c, d, e] = [cue('a', 57), cue('b', 114), cue('c', 210), cue('d', 298), cue('e', 343)];
  return {a, b, c, d, e};
};
const QS = ['输入是什么', '输出是什么', '怎样算成功', '哪里会失败', '失败了怎么办'];
const Outro: Scene = ({f, cue, layer}) => {
  const L = layers(layer);
  const p = outroPlan(cue);
  const t = S(f);
  const qAt = [p.a, p.a + 22, p.b, p.b + 24, p.b + 48];
  const end = springStep(t, S(p.e), {f: 1.4, z: 0.9});
  // two test lanes: the normal case runs through; the abnormal one hits a barrier and is diverted into handling
  const nx = springTrack(t, 470, [{at: S(p.c + 4), to: 790}], {f: 1.3, z: 0.85});
  const ex = springTrack(t, 470, [{at: S(p.d), to: 640}], {f: 2, z: 0.6});
  const fall = f >= p.d + 14 ? clamp((f - p.d - 14) / 14) : 0;
  return <Root>
    {L.world && <Stage>
      <g opacity={1 - end}>
        <rect x={20} y={210} width={410} height={360} rx={12} fill={PANEL} stroke={LINE} strokeWidth={2} />
        <text x={40} y={246} fontFamily={mono} fontWeight={700} fontSize={20} fill={DIM}>README · 每个仓库都要答得出</text>
        {QS.map((q, i) => <g key={q}>
          <text x={44} y={300 + i * 58} fontFamily={font} fontWeight={900} fontSize={32} fill={f >= qAt[i] ? INK : DIM}>{q}</text>
          {tickMark(396, 290 + i * 58, (f - qAt[i]) / 8)}
        </g>)}
        {f >= p.c - 10 && <g opacity={clamp((f - p.c + 10) / 10)}>
          <text x={470} y={246} fontFamily={mono} fontWeight={700} fontSize={20} fill={DIM}>TESTS</text>
          <line x1={470} x2={850} y1={320} y2={320} stroke={LINE} strokeWidth={3} />
          <text x={470} y={300} fontFamily={font} fontWeight={800} fontSize={27} fill={DIM}>正常案例</text>
          <BlockRect x={nx - 30} y={326} w={60} h={44} kind="a" label="" size={18} />
          {tickMark(820, 290, (f - p.c - 30) / 8)}
          {f >= p.d - 10 && <g>
            <line x1={470} x2={850} y1={470} y2={470} stroke={LINE} strokeWidth={3} />
            <text x={470} y={450} fontFamily={font} fontWeight={800} fontSize={27} fill={DIM}>异常案例</text>
            <line x1={720} x2={720} y1={420} y2={520} stroke={INK} strokeWidth={6} />
            <text x={730} y={440} fontFamily={mono} fontWeight={700} fontSize={18} fill={INK}>error</text>
            <BlockRect x={ex - 30} y={476 + 70 * fall * fall} w={60} h={44} kind="a" label="" sq={hitOf(f, [p.d + 12], 1)} />
            <text x={660} y={588} fontFamily={font} fontWeight={800} fontSize={27} fill={B} opacity={clamp((f - p.d - 26) / 8)}>被接住 → 处理</text>
            {tickMark(840, 578, (f - p.d - 32) / 8)}
          </g>}
        </g>}
      </g>
      {end > 0.02 && <g opacity={end}>
        <line x1={70} x2={810} y1={380} y2={380} stroke={LINE} strokeWidth={4} />
        {[70, 255, 440, 625, 810].map((x, i) => <g key={x}>
          <circle cx={x} cy={380} r={40 + 3 * hitOf(f, [p.e + 24 + i * 9], 1)} fill={f >= p.e + 24 + i * 9 ? B : BG} stroke={B} strokeWidth={4} />
          <text x={x} y={390} textAnchor="middle" fontFamily={mono} fontWeight={800} fontSize={24} fill={f >= p.e + 24 + i * 9 ? BG : B}>{String(i + 1).padStart(2, '0')}</text>
          <text x={x} y={460} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={28} fill={INK}>{STAGES[i]}</text>
        </g>)}
      </g>}
    </Stage>}
    {L.hud && <>
      <Title f={f} items={[{at: 0, k: '交付标准', t: '每个仓库，答得出五个问题'}, {at: p.c, k: '让 AI 写完之后', t: '亲手跑：一个正常案例'}, {at: p.d, k: '让 AI 写完之后', t: '再跑：一个异常案例'},
        {at: p.e, k: '原文链接在评论区', t: '你卡在哪一站？'}]} />
      <Rise f={f} at={p.e + 10} style={{position: 'absolute', left: 0, top: 560, width: 880}}>
        <Mono size={22}>整理自 Chasen（X @chasen_liao）《我偷来了一份成为 Agent 工程师的学习线路》 · 画面为示意</Mono>
      </Rise>
    </>}
  </Root>;
};
Outro.sfx = (cue) => {
  const p = outroPlan(cue);
  return [...[p.a, p.a + 22, p.b, p.b + 24, p.b + 48].map((at) => ({at: at + 4, kind: 'tick', gain: 0.12})), {at: p.c + 30, kind: 'tick', gain: 0.14}, {at: p.d + 12, kind: 'block', gain: 0.2},
    {at: p.d + 32, kind: 'tick', gain: 0.14}, {at: p.e + 2, kind: 'whoosh-short', gain: 0.12}, ...[0, 1, 2, 3, 4].map((i) => ({at: p.e + 24 + i * 9, kind: 'tap', gain: 0.08}))];
};
Outro.camera = (cue) => {
  const p = outroPlan(cue);
  return [cam(0, 220, 300, 1.1), cam(p.b, 220, 560, 1.1), cam(p.c, 660, 300, 1.12), cam(p.d, 660, 520, 1.12), cam(p.e, 440, 420, 1.0), cam(p.e + 30, 440, 300, 1.1)];
};

export const agentRoadmapScenes: Record<string, Scene> = {
  'ae.hook': Hook,
  'ae.route': Route,
  'ae.llm': LLM,
  'ae.api': API,
  'ae.prompt': Prompt,
  'ae.rag': RAG,
  'ae.loop': Loop,
  'ae.guard': Guard,
  'ae.backend': Backend,
  'ae.projects': Projects,
  'ae.outro': Outro,
};
for (const sc of Object.values(agentRoadmapScenes)) sc.hud = true;
