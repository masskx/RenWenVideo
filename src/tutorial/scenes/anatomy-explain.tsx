import React from 'react';
import {font} from '../theme';
import {clamp, ease, mix, springStep, springTrack} from '../../fx';
import {Cue, S, Scene, cam as camKey, dropLift, hitOf, layers, phaseOp} from '../paper';
import {A, B, BG, Big, DIM, INK, LINE, Mono, PANEL, Root, STEEL, Stage, Status, mono} from '../tech';
import {Leader, Movement, PART_AT, PARTS, PartId, PartLook, PLATE, SUBDIAL, beatsAt, rampRate} from '../watch';

// 会动，不等于看懂 — Khazix's write-up of the Anatomy skill ("the object is the explanation"), retold from our side:
// a moving model is not an explanation until someone tells you, in order, what you are looking at.
// Storyboard + brief: tutorials/anatomy-explain.storyboard.md. Blueprint look on the WeChat Channels layout.
// One subject carries the film: a schematic watch movement (src/tutorial/watch.tsx) whose whole train steps on the
// frame the balance crosses its centre. A (amber) = the object / the part being shown; B (cyan) = the explanation.

/** Camera keys point at the part being talked about. The HUD title sits on an opaque header band, so the picture may
 * slide under it; past 1.1× the frame stays centred horizontally (TutorialVideo), so labels keep to stage x 60–820. */
const cam = (at: number, x: number, y: number, z: number) => camKey(at, x, y, Math.min(z, 1.3));
/** Demonstration speeds, always named in the status line: ½ of a real 28,800 bph movement (4 beats a second) by
 * default, ¼ (2 beats a second) while the escapement is being explained. */
const SLOW = 2, HALF = 4;
const slow = () => HALF;

const Title: React.FC<{f: number; items: {at: number; to?: number; k?: string; t: React.ReactNode; size?: number}[]}> = ({f, items}) => (
  <div style={{position: 'absolute', left: 0, top: 0, width: 880, height: 150}}>
    <div style={{position: 'absolute', left: -120, right: -120, top: -70, height: 260, background: `linear-gradient(180deg, ${BG} 0, ${BG} 210px, transparent 260px)`}} />
    {items.map((it, i) => <div key={i} style={{position: 'absolute', left: 0, top: 0, width: 880, ...phaseOp(f, it.at, it.to ?? items[i + 1]?.at ?? 1e9)}}>
      {it.k && <Mono size={26} style={{marginBottom: 8}}>{it.k}</Mono>}
      <Big size={it.size ?? 64}>{it.t}</Big>
    </div>)}
  </div>
);
const a = (s: string) => <span style={{color: A}}>{s}</span>;
const b = (s: string) => <span style={{color: B}}>{s}</span>;

/** Highlight plan: from each `at`, the listed parts turn A and the rest dim (blend over 8 frames). */
const lookFor = (f: number, steps: {at: number; parts: PartId[]}[], dimOp = 0.3): Partial<Record<PartId, PartLook>> => {
  const out: Partial<Record<PartId, PartLook>> = {};
  const live = steps.filter((s) => f >= s.at);
  const cur = live[live.length - 1], prev = live[live.length - 2];
  const k = cur ? clamp((f - cur.at) / 8) : 0;
  const inSet = (s: typeof cur | undefined, p: PartId) => (s ? s.parts.includes(p) : true);
  for (const p of PARTS) {
    const was = prev ? (prev.parts.includes(p) ? 1 : 0) : 0, now = cur ? (cur.parts.includes(p) ? 1 : 0) : 0;
    const hot = was + (now - was) * k;
    const lit = (prev ? (inSet(prev, p) ? 1 : dimOp) : 1) * (1 - k) + (inSet(cur, p) ? 1 : dimOp) * k;
    out[p] = {fill: mix(STEEL, A, hot), op: lit};
  }
  return out;
};
/** Frames (from f0 to f1) on which the balance crosses its centre — the escapement's contact frames. */
const beatFrames = (rate: (fr: number) => number, f0: number, f1: number, every = 1) => {
  const out: number[] = [];
  let last = Math.floor(beatsAt(f0, rate));
  for (let fr = f0 + 1; fr <= f1; fr += 1) {
    const n = Math.floor(beatsAt(fr, rate));
    if (n !== last && n % every === 0) out.push(fr);
    last = n;
  }
  return out;
};
/** Exploded view: parts lift off radially from `apart` (3 frames apart) and land back from `back` (5 frames apart). */
const explode = (f: number, apart: number, back: number) => {
  const look: Partial<Record<PartId, PartLook>> = {};
  PARTS.forEach((id, i) => {
    const at = PART_AT[id];
    const k = Math.max(0, springTrack(S(f), 0, [{at: S(apart + 3 * i), to: 1}, {at: S(back + 5 * i), to: 0}], {f: 2.0, z: 0.9}));
    const prep = f >= apart + 3 * i - 5 && f < apart + 3 * i ? (f - (apart + 3 * i - 5)) / 5 : 0; // a small dip before lifting
    look[id] = {dx: (at.x - PLATE.x) * 0.42 * k, dy: (at.y - PLATE.y) * 0.32 * k + 6 * prep, lift: 34 * k, sq: hitOf(f, [back + 5 * i + 9], 0.8)};
  });
  return look;
};
/** A question tag dropped on a string from above; it lands (squash) on `at`, then swings, damped. */
const QTag: React.FC<{f: number; at: number; x: number; y: number; len?: number; size?: number; out?: number}> = ({f, at, x, y, len = 70, size = 64, out = 1e9}) => {
  if (f < at - 14) return null;
  const lift = dropLift(f, at, 0, 260) + (f > out ? 600 * ease.inCubic(clamp((f - out) / 16)) : 0);
  const t = S(f - at);
  const swing = f < at ? 0 : 14 * Math.exp(-2.2 * t) * Math.sin(7 * t);
  const sq = hitOf(f, [at], 1);
  return <g transform={`translate(${x} ${y - len - lift}) rotate(${swing})`}>
    <line x1={0} y1={-90} x2={0} y2={len} stroke={LINE} strokeWidth={2.5} />
    <g transform={`translate(0 ${len}) scale(${1 + 0.06 * sq} ${1 - 0.1 * sq})`}>
      <rect x={-size * 0.5} y={0} width={size} height={size * 1.12} rx={10} fill={BG} stroke={INK} strokeWidth={3} />
      <text x={0} y={size * 0.88} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={size * 0.86} fill={INK}>？</text>
    </g>
  </g>;
};

/* ---------- hook: the movement ticks; a loupe on the mesh; then the question ---------- */

const hookPlan = (cue: Cue) => {
  const [a1, b1, c1] = [cue('a', 96), cue('b', 173), cue('c', 315)];
  return {a: a1, b: b1, c: c1, tag: c1 + 30, apart: b1 + 12, back: b1 + 85, dim: c1 + 66};
};
const MESH = {x: 430, y: 588}; // between the centre and third wheels
const Hook: Scene = ({f, cue, layer}) => {
  const L = layers(layer);
  const p = hookPlan(cue);
  const beats = beatsAt(f, slow);
  const loupe = springTrack(S(f), 0, [{at: S(p.a - 2), to: 1}, {at: S(p.b - 4), to: 0}], {f: 2.2, z: 0.72});
  return <Root>
    {L.world && <Stage>
      <defs><clipPath id="an-loupe"><circle cx={0} cy={0} r={118} /></clipPath></defs>
      <Movement beats={beats} look={(() => {
        const lk = explode(f, p.apart, p.back);
        const dim = clamp((f - p.dim) / 14);
        for (const id of PARTS) lk[id] = {...lk[id], op: 1 - 0.6 * dim};
        return lk;
      })()} plateOp={1 - 0.4 * clamp((f - p.dim) / 14)} />
      {loupe > 0.02 && <g>
        <line x1={MESH.x} y1={MESH.y} x2={700} y2={720} stroke={B} strokeWidth={2.5} opacity={clamp(loupe)} />
        <circle cx={MESH.x} cy={MESH.y} r={26} fill="none" stroke={B} strokeWidth={2.5} opacity={clamp(loupe)} />
        <g transform={`translate(700 720) scale(${clamp(loupe, 0, 1.2)})`}>
          <circle r={122} fill={BG} stroke={B} strokeWidth={4} />
          <g clipPath="url(#an-loupe)"><g transform={`scale(3) translate(${-MESH.x} ${-MESH.y})`}><Movement beats={beats} plateOp={0} subdial={false} /></g></g>
          <text x={0} y={150} textAnchor="middle" fontFamily={mono} fontSize={20} fontWeight={700} fill={B}>×3</text>
        </g>
      </g>}
      <QTag f={f} at={p.tag} x={440} y={150} len={40} size={72} />
    </Stage>}
    {L.hud && <>
      <Title f={f} items={[{at: 0, k: 'FIG.1 · 机械表机芯（示意）', t: '每个齿轮都在转'}, {at: p.a, k: '咬合处 · 放大 3 倍', t: '一齿咬着一齿'},
        {at: p.b, k: '现在', t: <>这样一台{a('会动的模型')}</>}, {at: p.back - 4, k: '现在', t: 'AI 一句话就能做出来'}, {at: p.c, k: '问题', t: '它是怎么计时的？'}]} />
      <Status y={820}>{f < p.c ? `慢放 ×1/2 · BEAT ${String(Math.floor(beats)).padStart(3, '0')}` : '看了十秒 · 原理：？'}</Status>
    </>}
  </Root>;
};
Hook.sfx = (cue) => {
  const p = hookPlan(cue);
  return [...beatFrames(slow, 0, p.c, 2).map((at) => ({at, kind: 'fs-watch-tick', gain: 0.1})), {at: p.a - 6, kind: 'whoosh-short', gain: 0.1}, {at: p.apart, kind: 'whoosh-short', gain: 0.08},
    ...PARTS.map((_, i) => ({at: p.back + 5 * i + 9, kind: 'fs-part-seat', gain: 0.12})), {at: p.tag, kind: 'tap', gain: 0.2}];
};
Hook.camera = (cue) => {
  const p = hookPlan(cue);
  return [cam(0, 470, 560, 1.25), cam(p.a - 4, 560, 640, 1.18), cam(p.b + 8, 440, 480, 1.0), cam(p.back, 440, 500, 1.08), cam(p.tag, 440, 420, 1.0)];
};

/* ---------- story: Anatomy — the object is the explanation; one line → it spins, comes apart, is wound ---------- */

const storyPlan = (cue: Cue) => {
  const [a1, b1, c1, d1] = [cue('a', 150), cue('b', 222), cue('c', 297), cue('d', 425)];
  return {a: a1, b: b1, c: c1, d: d1, chip: 100, apart: d1 + 61, back: d1 + 99, wind: [d1 + 130, d1 + 142, d1 + 154]};
};
const PROMPT = '/anatomy explain how a mechanical watch keeps time';
const Story: Scene = ({f, cue, layer}) => {
  const L = layers(layer);
  const p = storyPlan(cue);
  const rate = (fr: number) => HALF + 6 * clamp(1 - Math.abs(fr - (p.d + 25)) / 30);
  const beats = beatsAt(f, rate);
  const look = explode(f, p.apart, p.back);
  // "物体本身，就是解释": the object steps forward and is lit as a whole, then settles back when the prompt starts
  const present = springStep(S(f), S(p.b), {f: 1.5, z: 0.7}) - springStep(S(f), S(p.c - 10), {f: 1.5, z: 0.9});
  for (const id of PARTS) look[id] = {...look[id], fill: mix(STEEL, A, clamp(present))};
  const ps = 1 + 0.1 * present;
  const typed = PROMPT.slice(0, Math.max(0, Math.floor((f - p.c) * 1.6)));
  const wind = p.wind.reduce((s, at) => s + 0.34 * springStep(S(f), S(at), {f: 3, z: 0.8}), 0);
  return <Root>
    {L.world && <Stage>
      <Movement beats={beats} look={look} wind={wind} s={ps} x={PLATE.x * (1 - ps)} y={(PLATE.y + 60) * (1 - ps)} />
      {f >= p.chip - 14 && f < p.c + 20 && (() => {
        const lift = dropLift(f, p.chip, 0, 240) + (f > p.c ? 500 * ease.inCubic(clamp((f - p.c) / 18)) : 0), sq = hitOf(f, [p.chip], 1);
        return <g transform={`translate(${720} ${740 - lift}) scale(${1 + 0.05 * sq} ${1 - 0.08 * sq}) translate(-140 -40)`}>
          <rect x={0} y={0} width={280} height={80} rx={12} fill={STEEL} />
          <text x={140} y={53} textAnchor="middle" fontFamily={mono} fontWeight={800} fontSize={36} fill={BG}>/anatomy</text>
        </g>;
      })()}
    </Stage>}
    {L.hud && <>
      <Title f={f} items={[{at: 0, k: 'SKILL · 最近很火', t: 'Anatomy'}, {at: p.a, k: '它的核心', t: '只有一句话'}, {at: p.b, k: 'THE OBJECT IS THE EXPLANATION', t: <>{a('物体')}本身，就是解释</>},
        {at: p.d, k: 'Anatomy 做出来的', t: '能转 · 能拆 · 能拧发条'}]} />
      {f >= p.c - 4 && <div style={{position: 'absolute', left: 0, top: 120, width: 880, ...phaseOp(f, p.c - 4, p.d + 60)}}>
        <div style={{background: BG, border: `2px solid ${LINE}`, borderRadius: 10, padding: '10px 16px', fontFamily: mono, fontSize: 24, fontWeight: 600, color: INK}}>
          {typed}<span style={{opacity: Math.floor(f / 8) % 2 ? 1 : 0, color: DIM}}>▍</span>
        </div>
      </div>}
      <Status y={820}>{f < p.d ? '慢放 ×1/2' : f < p.apart ? '转动 ▸ 加速' : f < p.back ? '拆开 · 7 个零件' : '装回 · 拧发条'}</Status>
    </>}
  </Root>;
};
Story.sfx = (cue) => {
  const p = storyPlan(cue);
  return [{at: p.chip, kind: 'tap', gain: 0.18}, {at: p.c, kind: 'fs-paper-slide', gain: 0.14}, {at: p.apart, kind: 'whoosh-short', gain: 0.1}, ...PARTS.map((_, i) => ({at: p.back + 5 * i + 9, kind: 'fs-part-seat', gain: 0.12})),
    ...p.wind.map((at) => ({at, kind: 'fs-wind-click', gain: 0.22}))];
};
Story.camera = (cue) => {
  const p = storyPlan(cue);
  return [cam(0, 440, 500, 1.0), cam(p.chip - 6, 600, 640, 1.15), cam(p.a, 440, 460, 1.04), cam(p.b, 440, 500, 1.0), cam(p.c, 440, 400, 1.0), cam(p.d + 10, 440, 500, 1.12),
    cam(p.apart, 440, 520, 0.96), cam(p.back + 30, 260, 620, 1.25), cam(p.wind[2] + 20, 440, 500, 1.0)];
};

/* ---------- conflict: beautiful, not understood — three question tags on the parts ---------- */

const conflictPlan = (cue: Cue) => {
  const [a1, b1, c1, d1, e1] = [cue('a', 108), cue('b', 203), cue('c', 313), cue('d', 356), cue('e', 390)];
  return {a: a1, b: b1, c: c1, d: d1, e: e1, runs: [16, 40, 64, 88]};
};
const RUNS = ['机械表', '显卡', 'TCP 握手', '刹车'];
const Meter: React.FC<{y: number; label: string; v: number; c: string; text: string}> = ({y, label, v, c, text}) => (
  <g transform={`translate(560 ${y})`}>
    <text x={0} y={0} fontFamily={font} fontWeight={800} fontSize={28} fill={INK}>{label}</text>
    <rect x={0} y={14} width={300} height={22} rx={4} fill={PANEL} stroke={LINE} strokeWidth={2} />
    <rect x={3} y={17} width={294 * clamp(v)} height={16} rx={3} fill={c} />
    <text x={300} y={0} textAnchor="end" fontFamily={mono} fontWeight={700} fontSize={24} fill={c}>{text}</text>
  </g>
);
const Conflict: Scene = ({f, cue, layer}) => {
  const L = layers(layer);
  const p = conflictPlan(cue);
  const beats = beatsAt(f, slow);
  const fine = springTrack(S(f), 0, [{at: S(p.a + 4), to: 0.98}], {f: 1.4, z: 0.7});
  const know = springTrack(S(f), 0, [{at: S(p.b + 4), to: 0.18}, {at: S(p.b + 30), to: 0}], {f: 1.8, z: 0.6});
  // "看懵了": the movement fogs over (everything dims) until the questions pin it down part by part
  const fog = clamp((f - p.b - 60) / 14) * (1 - clamp((f - p.c + 4) / 10));
  const fogLook = Object.fromEntries(PARTS.map((id) => [id, {op: 1 - 0.75 * fog}])) as Partial<Record<PartId, PartLook>>;
  return <Root>
    {L.world && <Stage>
      <Movement beats={beats} look={fogLook} plateOp={1 - 0.5 * fog} />
      <g opacity={clamp((f - p.a) / 10) * (1 - clamp((f - p.c + 12) / 10))}>
        <Meter y={150} label="精细度" v={fine} c={A} text={`${Math.round(fine * 100)}%`} />
        {f >= p.b && <Meter y={220} label="看懂了" v={Math.max(0, know)} c={B} text={`${Math.round(Math.max(0, know) * 100)}%`} />}
      </g>
      <QTag f={f} at={p.c} x={PART_AT.fork.x + 30} y={PART_AT.fork.y - 20} len={60} size={56} />
      <QTag f={f} at={p.d} x={PART_AT.balance.x - 60} y={PART_AT.balance.y - 40} len={50} size={56} />
      <QTag f={f} at={p.e} x={SUBDIAL.x} y={SUBDIAL.y - 20} len={70} size={64} />
    </Stage>}
    {L.hud && <>
      <Title f={f} items={[{at: 0, k: '数字生命卡兹克', t: '拿它跑了好几个'}, {at: p.a, k: '他发现一个问题', t: <>{a('动画')}确实漂亮</>},
        {at: p.b, k: '可他', t: '一个不懂机械表的人'}, {at: p.b + 64, k: '看一会儿', t: '就懵了'}, {at: p.c, k: '问题 1', t: '这个零件是啥？'}, {at: p.d, k: '问题 2', t: '它在干什么？'},
        {at: p.e, k: '问题 3', t: '时间是怎么算出来的？', size: 60}]} />
      <Status y={820}>RUN · {RUNS.filter((_, i) => f >= p.runs[i]).map((r) => `${r} ✓`).join('  ') || '…'}</Status>
    </>}
  </Root>;
};
Conflict.sfx = (cue) => {
  const p = conflictPlan(cue);
  return [...p.runs.map((at) => ({at, kind: 'tick', gain: 0.1})), {at: p.a + 4, kind: 'tick', gain: 0.12}, ...[p.c, p.d, p.e].map((at) => ({at, kind: 'tap', gain: 0.2}))];
};
Conflict.camera = (cue) => {
  const p = conflictPlan(cue);
  return [cam(0, 440, 520, 1.0), cam(p.a, 620, 300, 1.1), cam(p.b + 60, 440, 500, 1.15), cam(p.c - 6, 560, 420, 1.25), cam(p.d - 6, 430, 330, 1.25), cam(p.e - 6, 668, 322, 1.25),
    cam(p.e + 40, 440, 480, 1.0)];
};

/* ---------- turn: the tags go; an explanation card with four questions comes in beside the movement ---------- */

const turnPlan = (cue: Cue) => {
  const [a1, b1, c1, d1, e1, f1] = [cue('a', 193), cue('b', 296), cue('c', 327), cue('d', 377), cue('e', 405), cue('f', 442)];
  return {a: a1, b: b1, c: c1, d: d1, e: e1, f: f1, shift: 71, card: 131, rows: [b1, c1, d1, e1]};
};
const ROWS: [string, string][] = [['这是啥', '擒纵叉'], ['在发生啥', '每一拍放过一点'], ['为什么', '让发条的力慢慢放'], ['有啥用', '指针走得均匀']];
const Turn: Scene = ({f, cue, layer}) => {
  const L = layers(layer);
  const p = turnPlan(cue);
  const beats = beatsAt(f, slow);
  const k = springStep(S(f), S(p.shift), {f: 1.4, z: 0.85});
  const s = 1 - 0.3 * k, mx = (640 - PLATE.x * 0.7 - 0) * k, my = (520 - PLATE.y * 0.7) * k;
  // each row of the card points at what it talks about: the fork; the wheel it releases; the barrel's force; the train to the hands
  const look = lookFor(f, [{at: p.a + 10, parts: ['fork']}, {at: p.c, parts: ['fork', 'escape']}, {at: p.d, parts: ['barrel', 'fork']}, {at: p.e, parts: ['fourth', 'third', 'center']},
    {at: p.f, parts: PARTS}], 0.3);
  const cardX = springTrack(S(f), -520, [{at: S(p.card - 6), to: 0}], {f: 1.7, z: 0.8});
  const cardHit = hitOf(f, [p.card + 6], 1);
  const done = clamp((f - p.f - 8) / 12);
  return <Root>
    {L.world && <Stage>
      <Movement beats={beats} look={look} x={mx} y={my} s={s} />
      {[0, 1, 2].map((i) => <QTag key={i} f={f} at={-20} out={8 + 5 * i} x={[PART_AT.fork.x + 30, PART_AT.balance.x - 60, SUBDIAL.x][i]}
        y={[PART_AT.fork.y - 20, PART_AT.balance.y - 40, SUBDIAL.y - 20][i]} len={60} size={56} />)}
      {f >= p.card - 8 && <g transform={`translate(${cardX} 0)`}>
        <g transform={`translate(0 230) scale(${1 - 0.02 * cardHit} ${1 + 0.015 * cardHit})`}>
          <rect x={0} y={0} width={400} height={520} rx={12} fill={PANEL} stroke={B} strokeWidth={2.5} />
          <path d="M0 12 Q0 0 12 0 L388 0 Q400 0 400 12 L400 60 L0 60 Z" fill={B} />
          <text x={22} y={40} fontFamily={mono} fontWeight={800} fontSize={24} fill={BG}>讲解 · NARRATION</text>
          {ROWS.map(([q, ans], i) => {
            const at = p.rows[i];
            const v = clamp((f - at) / 8);
            const lift = dropLift(f, at + 6, 0, 60);
            return <g key={q} transform={`translate(22 ${78 + i * 108})`} opacity={0.25 + 0.75 * v}>
              <rect x={-6} y={-4} width={172} height={42} rx={8} fill={B} opacity={v} />
              <text x={8} y={28} fontFamily={font} fontWeight={800} fontSize={28} fill={v > 0.5 ? BG : B}>{`0${i + 1} ${q}`}</text>
              {f >= at - 4 && <text x={0} y={74 - lift} fontFamily={font} fontWeight={900} fontSize={34} fill={INK} opacity={v}>{ans}</text>}
              <line x1={0} x2={356} y1={94} y2={94} stroke={LINE} strokeWidth={1.5} />
            </g>;
          })}
          {f >= p.f && <path d="M330 20 L345 36 L372 6" fill="none" stroke={B} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={60}
            strokeDashoffset={60 * (1 - done)} />}
        </g>
        {f >= p.b && (() => {
          const fx = mx + PART_AT.fork.x * s, fy = my + PART_AT.fork.y * s;
          return <path d={`M400 ${230 + 100} L${fx - 10} ${fy}`} stroke={B} strokeWidth={2.5} fill="none" strokeDasharray={600} strokeDashoffset={600 * (1 - clamp((f - p.b) / 10))} />;
        })()}
      </g>}
    </Stage>}
    {L.hud && <>
      <Title f={f} items={[{at: 0, k: '他的办法很直接', t: '让 AI 在动画旁边'}, {at: 131, k: '他的办法很直接', t: <>加上{b('讲解')}和配音</>}, {at: p.a, k: '一边演示，一边告诉你', t: '四件事'},
        {at: p.f, k: '一轮直出', t: '门外汉也看明白了'}]} />
      <Status y={820}>{f < p.a ? '讲解 + 配音' : `讲解 ${ROWS.filter((_, i) => f >= p.rows[i]).length}/4`}</Status>
    </>}
  </Root>;
};
Turn.sfx = (cue) => {
  const p = turnPlan(cue);
  return [{at: p.shift, kind: 'whoosh-short', gain: 0.08}, {at: p.card - 4, kind: 'fs-paper-slide', gain: 0.18}, ...p.rows.map((at) => ({at: at + 6, kind: 'tick', gain: 0.12})),
    {at: p.f + 8, kind: 'tap', gain: 0.16}];
};
Turn.camera = (cue) => {
  const p = turnPlan(cue);
  return [cam(0, 440, 480, 1.0), cam(p.card, 360, 460, 1.0), cam(p.b, 300, 400, 1.06), cam(p.c, 560, 400, 1.1), cam(p.d, 300, 400, 1.1), cam(p.e, 500, 400, 1.1), cam(p.f + 10, 440, 480, 1.0)];
};

/* ---------- demo: the explanation, in order — one part at a time ---------- */

const demoPlan = (cue: Cue) => {
  const [a1, b1, c1, d1, e1] = [cue('a', 76), cue('b', 144), cue('c', 223), cue('d', 343), cue('e', 432)];
  return {a: a1, b: b1, c: c1, d: d1, e: e1, flow: [0, 1, 2, 3, 4].map((i) => b1 + 8 + 12 * i), real: e1 + 40, hand: e1 + 89};
};
const TRAIN: PartId[] = ['barrel', 'center', 'third', 'fourth', 'escape'];
const demoRate = (p: ReturnType<typeof demoPlan>) => (fr: number) => (fr < p.real ? rampRate(HALF, SLOW, p.c - 10, p.c + 10)(fr) : rampRate(SLOW, 8, p.real, p.real + 30)(fr));
const Demo: Scene = ({f, cue, layer}) => {
  const L = layers(layer);
  const p = demoPlan(cue);
  const rate = demoRate(p);
  const beats = beatsAt(f, rate);
  const steps = [{at: p.a, parts: ['barrel'] as PartId[]}, ...TRAIN.map((id, i) => ({at: p.flow[i], parts: TRAIN.slice(0, i + 1)})),
    {at: p.c, parts: ['fork', 'escape'] as PartId[]}, {at: p.d, parts: ['balance'] as PartId[]}, {at: p.e, parts: [] as PartId[]}];
  const look = lookFor(f, steps, 0.3);
  if (f >= p.e) for (const id of PARTS) look[id] = {...look[id], op: 0.3 + 0.7 * clamp((f - p.e) / 12)};
  PARTS.forEach((id) => {
    const i = TRAIN.indexOf(id);
    if (i >= 0) look[id] = {...look[id], sq: hitOf(f, [p.flow[i]], 0.7)};
  });
  const wind = [p.a + 6, p.a + 18, p.a + 30].reduce((s, at) => s + 0.3 * springStep(S(f), S(at), {f: 3, z: 0.8}), 0);
  const label = (at: number, to: number, el: React.ReactNode) => (f >= at && f < to + 10 ? <g opacity={clamp((f - at) / 8) * (1 - clamp((f - to) / 8))}>{el}</g> : null);
  const handHot = clamp((f - p.hand) / 8);
  return <Root>
    {L.world && <Stage>
      <Movement beats={beats} look={look} wind={wind} spring={f >= p.a && f < p.b ? A : undefined} />
      {handHot > 0 && <circle cx={SUBDIAL.x} cy={SUBDIAL.y} r={SUBDIAL.r + 8} fill="none" stroke={A} strokeWidth={4} opacity={handHot} />}
      {label(p.a, p.b, <Leader part="barrel" x={60} y={430} text="发条盒 · 存力气" c={B} />)}
      {label(p.b, p.c, <Leader part="third" x={480} y={760} text="轮系 · 一级级传" c={B} />)}
      {label(p.c, p.d, <Leader part="fork" x={420} y={650} text="擒纵叉 · 一拍放一点" c={B} size={28} />)}
      {label(p.d, p.e, <Leader part="balance" x={560} y={250} text="摆轮 · 节奏固定" c={B} />)}
    </Stage>}
    {L.hud && <>
      <Title f={f} items={[{at: 0, k: 'FIG.2 · 计时原理', t: '拿这块表试一下'}, {at: p.a, k: '01 · 发条', t: <>{a('发条')}把力气存起来</>},
        {at: p.b, k: '02 · 轮系', t: <>{a('齿轮')}一级一级传下去</>}, {at: p.c, k: '03 · 擒纵', t: <>{a('擒纵叉')}一拍放过一点</>},
        {at: p.d, k: '04 · 摆轮', t: <>{a('摆轮')}来回摆，节奏固定</>}, {at: p.e, k: '常见的机芯 · 28,800 拍 / 小时', t: '一秒 8 拍'}]} />
      <Status y={820}>{f < p.real ? `慢放 ×${f >= p.c - 10 ? '1/4' : '1/2'} · BEAT ${String(Math.floor(beats)).padStart(3, '0')}` : `实速 · 8 拍/秒 · BEAT ${String(Math.floor(beats)).padStart(3, '0')}`}</Status>
    </>}
  </Root>;
};
Demo.sfx = (cue) => {
  const p = demoPlan(cue);
  const rate = demoRate(p);
  return [...[p.a + 6, p.a + 18, p.a + 30].map((at) => ({at, kind: 'fs-wind-click', gain: 0.22})), ...p.flow.map((at) => ({at, kind: 'tap', gain: 0.14})),
    ...beatFrames(rate, p.c, p.real, 1).map((at) => ({at, kind: 'fs-watch-tick', gain: 0.16})), ...beatFrames(rate, p.real, p.real + 120, 2).map((at) => ({at, kind: 'fs-watch-tick', gain: 0.07}))];
};
Demo.camera = (cue) => {
  const p = demoPlan(cue);
  return [cam(0, 440, 500, 1.0), cam(p.a, 250, 640, 1.3), cam(p.b + 8, 330, 600, 1.15), cam(p.flow[3], 520, 520, 1.2), cam(p.c, 560, 460, 1.3), cam(p.d, 430, 330, 1.25),
    cam(p.e, 440, 500, 1.0), cam(p.hand, 668, 322, 1.25)];
};

/* ---------- view: everything moves at once → only the part being talked about moves ---------- */

const viewPlan = (cue: Cue) => {
  const [a1, b1, c1] = [cue('a', 138), cue('b', 242), cue('c', 384)];
  return {a: a1, b: b1, c: c1, order: [0, 1, 2, 3].map((i) => c1 + 70 + 14 * i)};
};
const WILD: Record<PartId, number> = {barrel: 26, center: -15, third: 11, fourth: -7, escape: HALF, fork: 3.2, balance: 2.6};
const ORDER: PartId[] = ['barrel', 'third', 'fork', 'balance'];
const View: Scene = ({f, cue, layer}) => {
  const L = layers(layer);
  const p = viewPlan(cue);
  const partBeats: Partial<Record<PartId, number>> = {};
  PARTS.forEach((id, i) => {
    const r = id === 'escape' ? () => WILD.escape : rampRate(WILD[id], 0, p.b + 3 * i, p.b + 3 * i + 14);
    partBeats[id] = beatsAt(f, r) + i * 0.37;
  });
  const moving = 1 + PARTS.filter((id, i) => id !== 'escape' && f < p.b + 3 * i + 12).length;
  const look: Partial<Record<PartId, PartLook>> = {};
  PARTS.forEach((id, i) => {
    const stopped = clamp((f - (p.b + 3 * i + 12)) / 8);
    const fade = clamp((f - p.b - 70) / 30) * (1 - clamp((f - p.c) / 12));
    // before the rule: every part lit and jostling at once (the "everything moves" look); after it, only the escape
    const wild = 1 - clamp((f - (p.b + 3 * i)) / 12);
    const jx = 9 * wild * Math.sin(f * 0.83 + i * 2.1), jy = 7 * wild * Math.cos(f * 1.07 + i * 1.3);
    look[id] = id === 'escape' ? {fill: A, dx: jx, dy: jy, k: 1 + 0.45 * springStep(S(f), S(p.b + 90), {f: 1.6, z: 0.75}) - 0.45 * springStep(S(f), S(p.c), {f: 1.6, z: 0.9})}
      : {fill: mix(STEEL, A, wild), dx: jx, dy: jy, op: 1 - 0.6 * stopped - 0.28 * fade, sq: hitOf(f, [p.b + 3 * i + 12], 0.5)};
  });
  return <Root>
    {L.world && <Stage>
      <Movement beats={partBeats.escape ?? 0} partBeats={partBeats} look={look} />
      {f >= p.b + 80 && f < p.c + 50 && <g opacity={clamp((f - p.b - 80) / 8) * (1 - clamp((f - p.c - 40) / 10))}>
        <Leader part="escape" x={600} y={640} text="只动这一个" c={B} />
      </g>}
      {ORDER.map((id, i) => {
        const at = p.order[i];
        if (f < at - 12) return null;
        const pa = PART_AT[id];
        const lift = dropLift(f, at, 0, 200);
        const sq = hitOf(f, [at], 1);
        return <g key={id} transform={`translate(${pa.x} ${pa.y - lift}) scale(${1 + 0.06 * sq} ${1 - 0.1 * sq})`}>
          <circle r={30} fill={BG} stroke={B} strokeWidth={4} />
          <text y={12} textAnchor="middle" fontFamily={mono} fontWeight={800} fontSize={32} fill={B}>{i + 1}</text>
        </g>;
      })}
    </Stage>}
    {L.hud && <>
      <Title f={f} items={[{at: 0, k: '我这个频道', t: '也是和 AI 一起做的'}, {at: p.a, k: '做到现在', t: '我定了一条规矩'},
        {at: p.b, k: '规矩', t: '说到哪个零件'}, {at: p.b + 49, k: '规矩', t: '画面上就只让它动'}, {at: p.c, k: '我的体会', t: <>难的是讲的{b('顺序')}</>}]} />
      <Status y={820}>同时在动：{moving}{f >= p.c + 70 ? ` · 顺序：${ORDER.filter((_, i) => f >= p.order[i]).map((id) => id === 'barrel' ? '发条' : id === 'third' ? '轮系' : id === 'fork' ? '擒纵' : '摆轮').join(' → ')}` : ''}</Status>
    </>}
  </Root>;
};
View.sfx = (cue) => {
  const p = viewPlan(cue);
  return [...PARTS.filter((id) => id !== 'escape').map((_, i) => ({at: p.b + 3 * i + 12, kind: 'tap', gain: 0.1})),
    ...beatFrames(() => WILD.escape, p.b + 20, p.c, 1).map((at) => ({at, kind: 'fs-watch-tick', gain: 0.12})), ...p.order.map((at) => ({at, kind: 'fs-part-seat', gain: 0.14}))];
};
View.camera = (cue) => {
  const p = viewPlan(cue);
  return [cam(0, 440, 500, 1.06), cam(p.a, 360, 560, 1.12), cam(p.a + 42, 520, 460, 1.0), cam(p.b, 579, 485, 1.2), cam(p.b + 80, 600, 560, 1.3), cam(p.c, 440, 500, 1.0),
    cam(p.order[1], 400, 560, 1.1), cam(p.order[3], 440, 460, 1.02)];
};

/* ---------- caveat: an hour and a half; and check what it tells you — count the teeth ---------- */

const caveatPlan = (cue: Cue) => {
  const [a1, b1, c1, d1] = [cue('a', 77), cue('b', 306), cue('c', 415), cue('d', 550)];
  return {a: a1, b: b1, c: c1, d: d1, hour: a1 + 169, wrong: c1 + 83, count: d1 + 4, ok: d1 + 61};
};
const Caveat: Scene = ({f, cue, layer}) => {
  const L = layers(layer);
  const p = caveatPlan(cue);
  const beats = beatsAt(f, slow);
  // the movement steps aside for the timer, then comes back for the check
  const aside = springTrack(S(f), 0, [{at: S(p.a - 10), to: 1}, {at: S(p.c - 6), to: 0}], {f: 1.5, z: 0.85});
  const s = 1 - 0.42 * aside, mx = (230 - PLATE.x * 0.58) * aside, my = (560 - PLATE.y * 0.58) * aside;
  const hand = springTrack(S(f), 0, [{at: S(p.a + 10), to: 0.25}, {at: S(p.a + 60), to: 0.5}, {at: S(p.a + 110), to: 0.68}, {at: S(p.hour - 14), to: 0.75}], {f: 1.6, z: 0.75});
  const timerOp = clamp((f - p.a + 10) / 10) * (1 - clamp((f - p.c + 10) / 10));
  const hourHit = hitOf(f, [p.hour], 1);
  const esc = PART_AT.escape;
  const counted = clamp(Math.floor((f - p.count) / 3), 0, 15);
  const look = lookFor(f, [{at: p.c + 10, parts: ['escape']}], 0.35);
  return <Root>
    {L.world && <Stage>
      <Movement beats={f >= p.count ? beatsAt(p.count, slow) : beats} look={look} x={mx} y={my} s={s} />
      {timerOp > 0 && <g opacity={timerOp} transform={`translate(600 430) scale(${1.2 * (1 + 0.03 * hourHit)} ${1.2 * (1 - 0.04 * hourHit)})`}>
        <circle r={170} fill={PANEL} stroke={LINE} strokeWidth={3} />
        {Array.from({length: 24}, (_, k) => {
          const an = (k / 24) * 2 * Math.PI, big = k % 6 === 0;
          return <line key={k} x1={(big ? 140 : 152) * Math.sin(an)} y1={-(big ? 140 : 152) * Math.cos(an)} x2={162 * Math.sin(an)} y2={-162 * Math.cos(an)} stroke={big ? STEEL : LINE} strokeWidth={big ? 4 : 2} />;
        })}
        {['0', '0.5', '1', '1.5'].map((t, k) => <text key={t} x={205 * Math.sin((k * Math.PI) / 2)} y={-205 * Math.cos((k * Math.PI) / 2) + 10} textAnchor="middle"
          fontFamily={mono} fontWeight={700} fontSize={26} fill={DIM}>{t}</text>)}
        <path d={`M0 0 L${150 * Math.sin(hand * 2 * Math.PI)} ${-150 * Math.cos(hand * 2 * Math.PI)}`} stroke={A} strokeWidth={6} strokeLinecap="round" />
        <path d={`M0 0 L0 -150 A150 150 0 ${hand > 0.5 ? 1 : 0} 1 ${150 * Math.sin(hand * 2 * Math.PI)} ${-150 * Math.cos(hand * 2 * Math.PI)} Z`} fill={A} opacity={0.8} />
        <circle r={12} fill={A} />
        <text x={0} y={70} textAnchor="middle" fontFamily={mono} fontWeight={800} fontSize={40} fill={INK}>{(hand * 2).toFixed(1)} h</text>
        <text x={0} y={262} textAnchor="middle" fontFamily={font} fontWeight={800} fontSize={30} fill={DIM} opacity={1 - clamp((f - p.b) / 8)}>一部 5 分钟的视频</text>
      </g>}
      {[['发出去给人看', '精细版'], ['只是自己学', '简单版也够']].map(([who, what], i) => {
        const at = p.b + 4 + 40 * i;
        if (f < at - 12 || f > p.c + 10) return null;
        const lift = dropLift(f, at, 0, 160), sq = hitOf(f, [at], 1);
        return <g key={who} opacity={1 - clamp((f - p.c + 6) / 12)} transform={`translate(${410 + 200} ${690 + 90 * i - lift}) scale(${1 + 0.05 * sq} ${1 - 0.08 * sq}) translate(-200 -36)`}>
          <rect x={0} y={0} width={400} height={72} rx={12} fill={i ? B : PANEL} stroke={B} strokeWidth={3} />
          <text x={20} y={47} fontFamily={font} fontWeight={800} fontSize={28} fill={i ? BG : DIM}>{who}</text>
          <text x={380} y={48} textAnchor="end" fontFamily={font} fontWeight={900} fontSize={32} fill={i ? BG : INK}>{what}</text>
        </g>;
      })}
      {f >= p.c + 10 && <g>
        {Array.from({length: 15}, (_, k) => {
          if (k >= counted) return null;
          const an = (k / 15) * 2 * Math.PI;
          return <circle key={k} cx={esc.x + 64 * Math.cos(an)} cy={esc.y + 64 * Math.sin(an)} r={6} fill={B} />;
        })}
        {(() => {
          const wrongK = clamp((f - p.wrong) / 8) * (1 - clamp((f - p.ok) / 8));
          const tagLift = dropLift(f, p.c + 30, 0, 160), tagSq = hitOf(f, [p.c + 30, p.wrong], 1);
          return <g transform={`translate(600 ${680 - tagLift}) rotate(${wrongK * 4 * Math.exp(-3 * S(Math.max(0, f - p.wrong))) * Math.sin(S(f - p.wrong) * 14)}) scale(${1 + 0.04 * tagSq} ${1 - 0.06 * tagSq})`}>
            <rect x={0} y={-40} width={220} height={80} rx={10} fill={BG} stroke={B} strokeWidth={3} strokeDasharray={wrongK > 0.5 ? '10 8' : undefined} />
            <text x={110} y={14} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={36} fill={B}>{f < p.count ? '15 齿' : `${counted} / 15`}</text>
            {wrongK > 0 && <text x={110} y={-56} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={48} fill={INK} opacity={wrongK}>？</text>}
            {f >= p.ok && <path d="M96 -70 L110 -54 L138 -84" fill="none" stroke={B} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={60}
              strokeDashoffset={60 * (1 - clamp((f - p.ok) / 10))} />}
            <path d={`M0 0 L${esc.x + 30 - 600} ${esc.y + 30 - 680 + tagLift}`} stroke={B} strokeWidth={2.5} />
          </g>;
        })()}
      </g>}
    </Stage>}
    {L.hud && <>
      <Title f={f} items={[{at: 0, k: '还有两件事', t: '时间，和对不对'}, {at: p.a, k: '他做一部', t: '五分钟的视频'}, {at: p.a + 69, k: '他做一部五分钟的视频', t: '用最强的模型'}, {at: p.a + 114, k: '他做一部五分钟的视频', t: '最高的推理强度'},
        {at: p.hour, k: '耗时', t: '大约一个半小时'}, {at: p.b, k: '只是自己学', t: '便宜点的配置也够'}, {at: p.c, k: '另外', t: 'AI 讲得再像样'}, {at: p.wrong, k: 'AI 讲得再像样', t: '也可能讲错'},
        {at: p.d, k: '关键参数和原理', t: <>要自己{b('核对')}</>}]} />
      <Status y={820}>{f < p.c ? (f < p.b ? '耗时 · 生成一部 5 分钟视频' : '发出去给人看：精细版 · 自己学：简单版') : f < p.d ? '讲解说：擒纵轮 15 齿' : `核对 · 数齿 ${counted}/15`}</Status>
    </>}
  </Root>;
};
Caveat.sfx = (cue) => {
  const p = caveatPlan(cue);
  return [{at: p.a - 10, kind: 'whoosh-short', gain: 0.08}, {at: p.hour, kind: 'tick', gain: 0.16}, {at: p.b + 4, kind: 'tap', gain: 0.14}, {at: p.b + 44, kind: 'tap', gain: 0.14},
    {at: p.c + 30, kind: 'tap', gain: 0.12}, {at: p.wrong, kind: 'tap', gain: 0.12},
    ...Array.from({length: 15}, (_, k) => ({at: p.count + 3 * k, kind: 'tick', gain: 0.07})), {at: p.ok, kind: 'fs-part-seat', gain: 0.18}];
};
Caveat.camera = (cue) => {
  const p = caveatPlan(cue);
  return [cam(0, 440, 500, 1.0), cam(p.a, 600, 430, 1.1), cam(p.a + 69, 600, 470, 1.25), cam(p.hour, 600, 400, 1.1), cam(p.b, 600, 700, 1.1), cam(p.c, 440, 500, 1.0),
    cam(p.c + 40, 579, 485, 1.2), cam(p.wrong, 600, 640, 1.25), cam(p.d, 579, 485, 1.2), cam(p.ok + 20, 500, 520, 1.0)];
};

/* ---------- ending: ready-made for everyone → made for you; the four questions ---------- */

const endPlan = (cue: Cue) => {
  const [a1, b1, c1, d1] = [cue('a', 182), cue('b', 250), cue('c', 366), cue('d', 451)];
  return {a: a1, b: b1, c: c1, d: d1, pick: a1 + 4, drop: a1 + 50, qs: [d1 + 122, d1 + 146, d1 + 188, d1 + 212]};
};
const Q4 = ['这是啥', '在发生啥', '为什么', '有啥用'];
const COURSES = [['机械表', '入门课'], ['钟表', '原理'], ['精密', '机械'], ['机芯', '图解']];
const Ending: Scene = ({f, cue, layer}) => {
  const L = layers(layer);
  const p = endPlan(cue);
  const beats = beatsAt(f, slow);
  // the belt of ready-made lessons slides left and stops when curiosity arrives
  const beltX = -beatsAt(f, (fr) => 1.9 * (1 - clamp((fr - p.b) / 20)) * (fr < p.pick || fr > p.drop + 10 ? 1 : 0)) * 60;
  const beltOp = 1 - clamp((f - p.c + 20) / 16);
  const pickLift = f >= p.pick && f < p.drop ? 120 * springStep(S(f), S(p.pick + 4), {f: 2, z: 0.75}) - (f < p.pick + 4 ? 8 * ((f - p.pick) / 4) : 0) : f >= p.drop ? dropLift(f, p.drop + 8, 0, 120) : 0;
  const assemble = (i: number) => p.c + 6 + 5 * i;
  const look: Partial<Record<PartId, PartLook>> = {};
  PARTS.forEach((id, i) => { look[id] = {lift: dropLift(f, assemble(i), 0, 360), op: f >= assemble(i) - 14 ? 1 : 0, sq: hitOf(f, [assemble(i)], 0.8)}; });
  const boxOp = clamp((f - assemble(6) - 6) / 10);
  // the lesson sits big in the middle, then makes room (rises and shrinks) for the four questions
  const up = springStep(S(f), S(p.d), {f: 1.4, z: 0.85});
  const ws = 0.8 - 0.25 * up, wx = 440 - PLATE.x * ws, wy = 70 + 63 * up;
  return <Root>
    {L.world && <Stage>
      {beltOp > 0 && <g opacity={beltOp}>
        <line x1={-40} x2={920} y1={520} y2={520} stroke={LINE} strokeWidth={4} />
        {Array.from({length: 12}, (_, k) => {
          const x = ((k * 230 + beltX) % 2760 + 2760) % 2760 - 230;
          if (x < -220 || x > 900) return null;
          const picked = k === 4;
          const ly = picked ? pickLift : 0;
          return <g key={k} transform={`translate(${x} ${380 - ly})`}>
            <rect x={0} y={0} width={160} height={140} rx={10} fill={STEEL} />
            <rect x={0} y={0} width={160} height={26} rx={6} fill={DIM} />
            <text x={80} y={74} textAnchor="middle" fontFamily={font} fontWeight={800} fontSize={28} fill={BG}>{COURSES[k % 4][0]}</text>
            <text x={80} y={112} textAnchor="middle" fontFamily={font} fontWeight={800} fontSize={28} fill={BG}>{COURSES[k % 4][1]}</text>
          </g>;
        })}
      </g>}
      {f >= p.b + 6 && f < p.c + 20 && <g opacity={1 - clamp((f - p.c) / 14)}><QTag f={f} at={p.b + 20} x={440} y={260} len={50} size={64} /></g>}
      {f >= p.c - 10 && <g>
        <Movement beats={beats} look={look} x={wx} y={wy} s={ws} plateOp={clamp((f - p.c + 10) / 10)} />
        <g opacity={boxOp}>
          <rect x={wx + (PLATE.x - PLATE.r - 30) * ws} y={wy + (PLATE.y - PLATE.r - 30) * ws} width={(PLATE.r + 30) * 2 * ws} height={(PLATE.r + 30) * 2 * ws} rx={16}
            fill="none" stroke={B} strokeWidth={3} strokeDasharray="12 8" />
          <text x={440} y={wy + (PLATE.y + PLATE.r + 30) * ws + 40} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={30} fill={B}>为你做的一节课</text>
        </g>
      </g>}
      {f >= p.d + 10 && Q4.map((q, i) => {
        const x = i % 2 ? 460 : 20, y = 664 + Math.floor(i / 2) * 96;
        const k = clamp((f - p.d - 10 - 8 * i) / 16);
        return <rect key={`slot${q}`} x={x} y={y} width={400} height={80} rx={12} fill="none" stroke={LINE} strokeWidth={3} strokeDasharray={960} strokeDashoffset={960 * (1 - k)} />;
      })}
      {Q4.map((q, i) => {
        const at = p.qs[i];
        if (f < at - 12) return null;
        const lift = dropLift(f, at, 0, 140), sq = hitOf(f, [at], 1);
        const x = i % 2 ? 460 : 20, y = 664 + Math.floor(i / 2) * 96;
        return <g key={q} transform={`translate(${x + 200} ${y + 40 - lift}) scale(${1 + 0.05 * sq} ${1 - 0.08 * sq}) translate(-200 -40)`}>
          <rect x={0} y={0} width={400} height={80} rx={12} fill={B} />
          <text x={200} y={56} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={42} fill={BG}>{q}</text>
        </g>;
      })}
    </Stage>}
    {L.hud && <>
      <Title f={f} items={[{at: 0, k: '以前的学习材料', t: '提前做好，发给所有人'}, {at: p.a, k: '你只能', t: '挑一个最接近的'},
        {at: p.b, k: '现在', t: '对一个小问题好奇'}, {at: p.c, k: '可以让 AI', t: <>专门为你做{a('一节课')}</>}, {at: p.d, k: '下次提问时，带上这四句', t: <>{b('讲解')}的四个问题</>}]} />
      <Status y={860}><span style={{fontSize: 22}}>素材：数字生命卡兹克（X @Khazix0918）· Anatomy Skill · 机芯为示意</span></Status>
    </>}
  </Root>;
};
Ending.sfx = (cue) => {
  const p = endPlan(cue);
  return [{at: 10, kind: 'whoosh-short', gain: 0.06}, {at: p.pick + 4, kind: 'whoosh-short', gain: 0.08}, {at: p.drop + 8, kind: 'thud', gain: 0.16}, {at: p.b + 20, kind: 'tap', gain: 0.18},
    ...PARTS.map((_, i) => ({at: p.c + 6 + 5 * i, kind: 'fs-part-seat', gain: 0.12})), ...p.qs.map((at) => ({at, kind: 'tap', gain: 0.14}))];
};
Ending.camera = (cue) => {
  const p = endPlan(cue);
  return [cam(0, 440, 460, 1.0), cam(p.pick, 480, 420, 1.15), cam(p.b, 440, 400, 1.0), cam(p.b + 40, 440, 330, 1.2), cam(p.c, 440, 380, 1.1), cam(p.d, 440, 520, 1.0),
    cam(p.d + 60, 440, 640, 1.06), cam(p.qs[2], 440, 560, 1.0)];
};

/* ---------- cover anchor: the movement, settled, escapement in A ---------- */

const CoverAnchor: Scene = () => <Root><Stage>
  <Movement beats={6.2} look={{fork: {fill: A}, escape: {fill: A}}} />
</Stage></Root>;

export const anatomyScenes: Record<string, Scene> = {
  'an.hook': Hook,
  'an.story': Story,
  'an.conflict': Conflict,
  'an.turn': Turn,
  'an.demo': Demo,
  'an.view': View,
  'an.caveat': Caveat,
  'an.ending': Ending,
  'an.cover': CoverAnchor,
};
for (const [k, sc] of Object.entries(anatomyScenes)) if (k !== 'an.cover') sc.hud = true;
