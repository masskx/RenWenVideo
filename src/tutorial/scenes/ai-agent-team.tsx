import React from 'react';
import {font, paper} from '../theme';
import {CamKey, SceneProps, SfxEvent} from '../ui';
import {ContactShadow, Smear, clamp, drop, hash, impulse, matte, mix, ripple, springStep, springTrack, squash, toss, twoEdge} from '../../fx';

// 一个人带 AI 团队 — second cut, rebuilt on the director layer (docs/video-craft/导演层.md).
// Storyboard + brief: tutorials/ai-agent-team.storyboard.md. One subject runs through the film: a terracotta task
// card (A = 交接) tossed between clay agents along gravity arcs; it ends on the human, the only green thing
// (B = 拍板). Every main event has a force origin, a contact frame on the keyword, squash, a contact shadow and a
// sound computed from the same physics (static `sfx` on each scene). No glow, no gradients on chrome, no
// whole-stage push/pull, ink + paper + two accents only.

const INK = paper.ink, DIM = paper.dim, A = paper.keyA, B = paper.keyB, CARD = paper.card, LINE = paper.line;
const CLAY = '#d6ccbc';
const num = '"Inter Display", "Inter", "Noto Sans CJK SC", sans-serif';
const S = (f: number) => f / 30;

type Cue = SceneProps['cue'];
type Scene = React.FC<SceneProps & {credit: string}> & {sfx?: (cue: Cue, dur: number) => SfxEvent[]; camera?: (cue: Cue, dur: number) => CamKey[]};
/** Camera key: look at stage point (x, y) at zoom z from frame `at` (the camera itself lags a few frames). */
const cam = (at: number, x: number, y: number, z: number): CamKey => ({at, x, y, z});
type Who = 'res' | 'wri' | 'dev' | 'rev' | 'me';
type P2 = [number, number];
const NAME: Record<Who, string> = {res: '调研员', wri: '文案', dev: '开发', rev: '审核', me: '你'};
const AGENTS: Who[] = ['res', 'wri', 'dev', 'rev'];
const SLOT = [96, 268, 440, 612, 784];

/* ---------- drawing pieces ---------- */

const Glyph: React.FC<{who: Who; size: number; c: string; wob?: number}> = ({who, size, c, wob = 0}) => (
  <svg width={size} height={size} viewBox="0 0 48 48" style={{transform: `rotate(${wob}deg)`, flex: 'none'}}>
    <g fill="none" stroke={c} strokeWidth={3.6} strokeLinecap="round" strokeLinejoin="round">
      {who === 'res' && <><circle cx={21} cy={21} r={11} /><path d="M29 29 L39 39" /></>}
      {who === 'wri' && <><path d="M24 6 L35 22 L24 41 L13 22 Z" /><path d="M24 22 L24 41" /><circle cx={24} cy={22} r={2.6} /></>}
      {who === 'dev' && <><path d="M18 13 L8 24 L18 35" /><path d="M30 13 L40 24 L30 35" /></>}
      {who === 'rev' && <><rect x={9} y={9} width={30} height={30} rx={7} /><path d="M16 24 L22 30 L33 18" /></>}
      {who === 'me' && <><circle cx={24} cy={17} r={7} /><path d="M11 41 Q11 28 24 28 Q37 28 37 41" /></>}
    </g>
  </svg>
);

/** A clay agent (or the green human) standing on the ground line. hit > 0 squashes it from the top. */
const Pebble: React.FC<{who: Who; x: number; ground: number; size?: number; lift?: number; hit?: number; wob?: number;
  label?: string | null; labelOp?: number; op?: number; shift?: number}> = ({who, x, ground, size = 128, lift = 0, hit = 0, wob = 0, label, labelOp = 1, op = 1, shift = 0}) => {
  const me = who === 'me';
  const h = clamp(hit, -0.6, 1);
  return <>
    <ContactShadow x={x} y={ground} w={size * 0.95} lift={lift} opacity={0.3 * op} />
    <div style={{position: 'absolute', left: x - size / 2, top: ground - size - lift, width: size, height: size, opacity: op,
      transform: `scale(${1 + 0.16 * h}, ${1 - 0.2 * h})`, transformOrigin: '50% 100%', borderRadius: '44%', background: matte(me ? B : CLAY, {shift}),
      display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
      <Glyph who={who} size={size * 0.52} c={me ? CARD : INK} wob={wob} />
    </div>
    {label && <div style={{position: 'absolute', left: x - 120, width: 240, top: ground + 14, textAlign: 'center', fontFamily: font, fontWeight: 900,
      fontSize: 40, color: me ? B : INK, opacity: labelOp * op}}>{label}</div>}
  </>;
};

/** The task card (A). (x, y) = bottom centre. Stretches along its velocity and smears when fast. */
const Packet: React.FC<{x: number; y: number; vx?: number; vy?: number; ground?: number; scale?: number; op?: number}> = ({x, y, vx = 0, vy = 0, ground, scale = 1, op = 1}) => {
  const q = squash(vx, vy, {k: 0.0001, max: 0.25});
  const w = 92 * scale, h = 68 * scale;
  return <>
    {ground !== undefined && <ContactShadow x={x} y={ground} w={w} lift={ground - y} opacity={0.22 * op} />}
    <div style={{position: 'absolute', left: x - w / 2, top: y - h, width: w, height: h, opacity: op}}>
      <Smear vx={vx} vy={vy}>
        <div style={{width: w, height: h, transform: q.css, position: 'relative', borderRadius: 8 * scale, background: matte(A, {gloss: 0.18}), overflow: 'hidden'}}>
          <div style={{position: 'absolute', right: 0, top: 0, width: 0, height: 0, borderStyle: 'solid', borderWidth: `0 ${22 * scale}px ${22 * scale}px 0`,
            borderColor: `transparent ${paper.bg} ${mix(A, '#000000', 0.25)} transparent`}} />
          {[0, 1, 2].map((k) => <div key={k} style={{position: 'absolute', left: 14 * scale, top: (18 + k * 14) * scale, height: 5 * scale,
            width: `${[58, 66, 40][k]}%`, borderRadius: 3, background: 'rgba(250,247,241,0.78)'}} />)}
        </div>
      </Smear>
    </div>
  </>;
};

const AtToken: React.FC<{x: number; y: number; vx?: number; vy?: number}> = ({x, y, vx = 0, vy = 0}) => {
  const q = squash(vx, vy, {k: 0.0001});
  return <div style={{position: 'absolute', left: x - 34, top: y - 68, width: 68, height: 68, borderRadius: 34, background: matte(A),
    transform: q.css, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: num, fontWeight: 900, fontSize: 44, color: CARD}}>@</div>;
};

const Big: React.FC<{size?: number; c?: string; w?: number; style?: React.CSSProperties; children: React.ReactNode}> = ({size = 88, c = INK, w = 900, style, children}) => (
  <div style={{fontFamily: font, fontWeight: w, fontSize: size, lineHeight: 1.14, color: c, letterSpacing: 1, ...style}}>{children}</div>
);
const Kicker: React.FC<{size?: number; c?: string; style?: React.CSSProperties; children: React.ReactNode}> = ({size = 32, c = DIM, style, children}) => (
  <div style={{fontFamily: font, fontWeight: 700, fontSize: size, color: c, letterSpacing: 3, ...style}}>{children}</div>
);
const Abs: React.FC<{x: number; y: number; w?: number; style?: React.CSSProperties; children: React.ReactNode}> = ({x, y, w, style, children}) => (
  <div style={{position: 'absolute', left: x, top: y, width: w, ...style}}>{children}</div>
);
const Ground: React.FC<{y: number; op?: number; x0?: number; x1?: number}> = ({y, op = 1, x0 = -20, x1 = 900}) => (
  <div style={{position: 'absolute', left: x0, width: x1 - x0, top: y, height: 2, background: INK, opacity: 0.7 * op}} />
);

/** Labels rise after the event they belong to (导演层 §3: labels +6–10 frames), each on its own spring. */
const Rise: React.FC<{f: number; at: number; dy?: number; style?: React.CSSProperties; children: React.ReactNode}> = ({f, at, dy = 28, style, children}) => {
  const s = springStep(S(f), S(at), {f: 2.4, z: 0.82});
  return <div style={style}>
    <div style={{opacity: clamp(s * 1.5), transform: `translateY(${(1 - s) * dy}px)`, filter: s > 0 && s < 0.97 ? `blur(${(1 - clamp(s)) * 6}px)` : undefined}}>{children}</div>
  </div>;
};
/** Visible between two frames: in on one spring, out on another, with a short blur (content swap, not a new card). */
const phaseOp = (f: number, from: number, to = 1e9): React.CSSProperties => {
  const i = springStep(S(f), S(from), {f: 2.4, z: 0.85}), o = springStep(S(f), S(to), {f: 2.8, z: 0.9});
  const v = clamp(i * 1.5) * (1 - clamp(o * 1.5));
  return {opacity: v, filter: v > 0.02 && v < 0.97 ? `blur(${(1 - v) * 7}px)` : undefined, transform: `translateY(${(1 - clamp(i)) * 24 - clamp(o) * 18}px)`};
};

const Strike: React.FC<{p: number; c?: string; w?: number; children: React.ReactNode}> = ({p, c = INK, w = 5, children}) => (
  <span style={{position: 'relative', display: 'inline-block'}}>
    {children}
    <span style={{position: 'absolute', left: -6, right: -6, top: '54%', height: w, borderRadius: w, background: c, transform: `scaleX(${clamp(p)})`, transformOrigin: 'left'}} />
  </span>
);
const Tick: React.FC<{p: number; size?: number; c?: string}> = ({p, size = 44, c = INK}) => (
  <svg width={size} height={size} viewBox="0 0 44 44" style={{flex: 'none'}}>
    <circle cx={22} cy={22} r={19} fill="none" stroke={c} strokeWidth={3} opacity={clamp(p * 2)} />
    <path d="M12 23 L19 30 L32 15" fill="none" stroke={c} strokeWidth={4.5} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={40} strokeDashoffset={40 * (1 - clamp(p))} />
  </svg>
);
const draw = (f: number, at: number, dur = 14) => clamp((f - at) / dur);

/* ---------- motion helpers ---------- */

type Hop = {at: number; dur: number; from: P2; to: P2; lift?: number};
/** Where the card is on a list of hops (frames). Before the first hop it waits at the first origin. */
const hopAt = (f: number, hops: Hop[]) => {
  let h = hops[0];
  for (const k of hops) if (f >= k.at) h = k;
  return toss(S(f), {at: S(h.at), dur: S(h.dur), from: h.from, to: h.to, lift: h.lift ?? 140});
};
const landsOf = (hops: Hop[]) => hops.map((h) => h.at + h.dur);
/** Squash of a receiver from the contacts that hit it (sum of impulses). */
const hitOf = (f: number, contacts: number[], amp = 1) => contacts.reduce((s, c) => s + impulse(S(f), S(c), {f: 3.2, z: 0.42, amp}), 0);
/** Frame to release a drop from `height` px so that it first touches the ground on `contact`. */
const dropFrom = (contact: number, height: number, g = 4200) => contact - Math.sqrt((2 * height) / g) * 30;
const dropY = (f: number, contact: number, ground: number, height = 620) => drop(S(f), {at: S(dropFrom(contact, height)), from: ground - height, ground});
/** Lift above ground for something that drops in (0 when resting, height before it falls). */
const dropLift = (f: number, contact: number, ground: number, height = 620) => ground - dropY(f, contact, ground, height).y;
const top = (x: number, ground: number, size: number): P2 => [x, ground - size + 4];

const Root: React.FC<{children: React.ReactNode}> = ({children}) => <div style={{position: 'relative', width: 880, height: 960}}>{children}</div>;

/* ---------- hook ---------- */

const hookPlan = (cue: Cue) => {
  const [a, b, c, d, e, g] = [cue('a', 75), cue('b', 115), cue('c', 155), cue('d', 242), cue('e', 334), cue('f', 359)];
  const G = 800, SHELF = 470, ME = 140, AG = 128;
  const win = [{x: 150, at: a}, {x: 730, at: b}, {x: 440, at: c}];
  const winTop = (i: number): P2 => [win[i].x, SHELF - 150 + 4];
  const meTop1: P2 = top(440, G, ME), meTop2: P2 = top(SLOT[4], G, ME);
  // Phase 1: the human is the glue — the card shuttles window → you → window until the switch.
  const hops: Hop[] = [];
  let at = b + 10, pos = winTop(0), k = 0;
  const order = ['me', 'w1', 'me', 'w2', 'me', 'w0'];
  while (at + 13 < d - 6) {
    let dest = order[k % order.length];
    if (dest === 'w2' && at < c + 14) dest = 'w0';
    const to: P2 = dest === 'me' ? meTop1 : winTop(Number(dest[1]));
    hops.push({at, dur: 13, from: pos, to, lift: dest === 'me' ? 70 : 110});
    pos = to; at += 16; k += 1;
  }
  const meCatches = hops.filter((h) => h.to === meTop1).map((h) => h.at + h.dur);
  // Phase 2: the card goes to the first agent, then hands itself down the row and lands on you on 「拍板」.
  const agentLand = AGENTS.map((_, i) => d + 18 + i * 5);
  hops.push({at: d + 40, dur: 14, from: pos, to: top(SLOT[0], G, AG), lift: 160});
  const span = (g - (e - 3)) / 4;
  for (let i = 0; i < 4; i += 1) {
    const from = top(SLOT[i], G, AG), to = i < 3 ? top(SLOT[i + 1], G, AG) : meTop2;
    hops.push({at: Math.round(e - 3 + i * span), dur: Math.round(span), from, to, lift: i < 3 ? 70 : 120});
  }
  return {a, b, c, d, e, g, G, SHELF, ME, AG, win, hops, meCatches, agentLand};
};

const Hook: Scene = ({f, cue}) => {
  const p = hookPlan(cue);
  const t = S(f);
  const card = hopAt(f, p.hops);
  const lands = landsOf(p.hops);
  const meX = springTrack(t, 440, [{at: S(p.d + 8), to: SLOT[4]}], {f: 1.6, z: 0.85});
  const meHits = hitOf(f, p.meCatches, 0.6) + hitOf(f, [p.g], 1.1);
  const copies = p.meCatches.filter((c) => f >= c).length;
  const phase2 = f >= p.d;
  const away = (i: number) => toss(t, {at: S(p.d + i * 4), dur: S(18), from: [p.win[i].x, p.SHELF], to: [i === 1 ? 1180 : -300, -260], lift: 60});
  const chainLands = lands.slice(-4);
  return <Root>
    <div style={{position: 'absolute', left: 0, top: 0, width: 880, height: 220}}>
      <div style={{position: 'absolute', inset: 0, ...phaseOp(f, 2, p.d + 2)}}><Big size={84}>你，还在当胶水？</Big></div>
      <div style={{position: 'absolute', inset: 0, ...phaseOp(f, p.d + 6, p.g + 4)}}><Big size={70}>换个做法：<br />组一个 AI 团队</Big></div>
      <div style={{position: 'absolute', inset: 0, ...phaseOp(f, p.g + 8)}}><Big size={104}>你只管<span style={{color: B}}>拍板</span></Big></div>
    </div>
    <Ground y={p.SHELF} op={1 - clamp((f - p.d) / 12)} x0={20} x1={860} />
    {p.win.map((w, i) => {
      const lift = dropLift(f, w.at, p.SHELF, 520);
      const fly = phase2 ? away(i) : null;
      const x = fly ? fly.x : w.x, y = fly ? fly.y : p.SHELF - lift;
      const hit = hitOf(f, [w.at], 0.5) + hitOf(f, p.hops.filter((h) => h.to[0] === w.x && h.to[1] < p.SHELF).map((h) => h.at + h.dur), 0.25);
      if (f < w.at - 25 || (fly && fly.landed)) return null;
      return <React.Fragment key={i}>
        {!fly && <ContactShadow x={w.x} y={p.SHELF} w={230} lift={lift} />}
        <div style={{position: 'absolute', left: x - 120, top: y - 150, width: 240, height: 150, borderRadius: 18, background: CARD, border: `3px solid ${INK}`,
          transform: `scale(${1 + 0.06 * hit}, ${1 - 0.08 * hit}) rotate(${fly ? (f - p.d) * (i === 1 ? 6 : -6) : 0}deg)`, transformOrigin: '50% 100%'}}>
          <div style={{height: 34, borderBottom: `2px solid ${INK}`, display: 'flex', alignItems: 'center', gap: 7, padding: '0 14px'}}>
            {[0, 1, 2].map((k) => <div key={k} style={{width: 11, height: 11, borderRadius: 6, border: `2px solid ${INK}`}} />)}
            <span style={{fontFamily: font, fontSize: 22, color: DIM, marginLeft: 8}}>AI 窗口 {i + 1}</span>
          </div>
          <div style={{fontFamily: font, fontWeight: 900, fontSize: 44, color: INK, textAlign: 'center', marginTop: 18}}>{['查资料', '写稿', '检查'][i]}</div>
        </div>
      </React.Fragment>;
    })}
    <Ground y={p.G} />
    <Pebble who="me" x={meX} ground={p.G} size={p.ME} hit={meHits} label={phase2 ? '你' : null} labelOp={clamp((f - p.d - 20) / 10)} />
    {!phase2 && f >= p.b + 10 && <Abs x={500} y={p.G - 200} w={380} style={phaseOp(f, p.b + 30, p.d)}>
      <Big size={44} w={700}>复制 · 粘贴 <span style={{fontFamily: num}}>×{copies}</span></Big>
    </Abs>}
    {phase2 && AGENTS.map((who, i) => {
      const lift = dropLift(f, p.agentLand[i], p.G, 700);
      const hit = hitOf(f, [p.agentLand[i]], 0.5) + hitOf(f, i > 0 ? [chainLands[i - 1]] : [], 0.7);
      return <Pebble key={who} who={who} x={SLOT[i]} ground={p.G} size={p.AG} lift={lift} hit={hit} label={NAME[who]} labelOp={clamp((f - p.agentLand[i] - 8) / 10)} />;
    })}
    {/* handoff arcs left behind by the card (A = 交接) */}
    {f >= p.e - 3 && <svg width={880} height={960} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
      {p.hops.slice(-4).map((h, i) => {
        const pr = draw(f, h.at, h.dur);
        const mid: P2 = [(h.from[0] + h.to[0]) / 2, Math.min(h.from[1], h.to[1]) - 2 * (h.lift ?? 140)];
        return <path key={i} d={`M${h.from[0]} ${h.from[1] - 70} Q${mid[0]} ${mid[1] - 10} ${h.to[0]} ${h.to[1] - 70}`} fill="none" stroke={A} strokeWidth={4}
          strokeDasharray="10 12" opacity={0.75 * pr} strokeLinecap="round" />;
      })}
    </svg>}
    {f >= p.a + 14 && <Packet x={card.x} y={card.y} vx={card.vx} vy={card.vy} />}
  </Root>;
};
Hook.camera = (cue) => {
  const p = hookPlan(cue);
  return [cam(0, 440, 420, 1.06), cam(p.a, 150, 420, 1.14), cam(p.b, 730, 420, 1.14), cam(p.c, 440, 560, 1.06), cam(p.d, 440, 520, 1),
    cam(p.d + 40, 300, 720, 1.1), cam(p.e - 3, 520, 720, 1.06), cam(p.g, 784, 680, 1.16), cam(p.g + 24, 440, 420, 1.02)];
};
Hook.sfx = (cue) => {
  const p = hookPlan(cue);
  const ev: SfxEvent[] = p.win.map((w) => ({at: Math.round(w.at), kind: 'tap', gain: 0.26}));
  for (const c of p.meCatches) ev.push({at: Math.round(c), kind: 'tap', gain: 0.12});
  ev.push({at: p.d, kind: 'whoosh', gain: 0.2});
  ev.push({at: Math.round(p.agentLand[0]), kind: 'tap', gain: 0.16}, {at: Math.round(p.agentLand[3]), kind: 'tap', gain: 0.16});
  ev.push({at: p.e - 4, kind: 'whoosh-short', gain: 0.14});
  ev.push({at: p.g, kind: 'thud', gain: 0.34});
  return ev;
};

/* ---------- idea ---------- */

const ideaPlan = (cue: Cue) => {
  const [a, b, c, d, e] = [cue('a', 79), cue('b', 129), cue('c', 176), cue('d', 230), cue('e', 314)];
  const G = 780, AG = 124;
  const at: Hop = {at: c - 14, dur: 14, from: top(SLOT[4], G, 140), to: top(SLOT[1], G, AG), lift: 150};
  const card: Hop = {at: d, dur: 16, from: top(SLOT[1], G, AG), to: top(SLOT[2], G, AG), lift: 120};
  return {a, b, c, d, e, G, AG, at, card};
};
const Idea: Scene = ({f, cue}) => {
  const p = ideaPlan(cue);
  const t = S(f);
  const tok = hopAt(f, [p.at]);
  const card = hopAt(f, [p.card]);
  const frame = draw(f, p.a, 26);
  const L = 2 * (900 + 440);
  return <Root>
    <Rise f={f} at={2}><div style={{fontFamily: num, fontWeight: 900, fontSize: 96, color: INK, lineHeight: 1}}>Teamily AI</div></Rise>
    <Rise f={f} at={p.a + 8} style={{marginTop: 18}}><Big size={52} w={700}>说白了，就是一个群聊</Big></Rise>
    <svg width={900} height={960} style={{position: 'absolute', left: -10, top: 0, overflow: 'visible'}}>
      <rect x={0} y={400} width={900} height={440} rx={30} fill="none" stroke={INK} strokeWidth={3} strokeDasharray={L} strokeDashoffset={L * (1 - frame)} />
    </svg>
    <Abs x={20} y={376} style={{opacity: clamp((f - p.a - 12) / 10), background: paper.bg, padding: '0 12px'}}><Kicker size={30} c={INK}>群聊 · 提示词库项目</Kicker></Abs>
    <Ground y={p.G} x0={20} x1={860} op={frame} />
    {AGENTS.map((who, i) => {
      const lift = Math.max(-4, 40 * ripple(t, S(p.b), i, {delay: 0.1, decay: 0.95, f: 2, z: 0.45}));
      const hit = who === 'wri' ? hitOf(f, [p.c], 0.9) : who === 'dev' ? hitOf(f, [p.d + 16], 0.7) : 0;
      const wob = who === 'wri' && f >= p.c ? 14 * impulse(t, S(p.c + 2), {f: 4, z: 0.15}) : 0;
      return <Pebble key={who} who={who} x={SLOT[i]} ground={p.G} size={p.AG} lift={lift} hit={hit} wob={wob} label={NAME[who]}
        labelOp={clamp((f - p.b - 8 - i * 3) / 10)} op={clamp((f - p.a) / 12)} />;
    })}
    <Pebble who="me" x={SLOT[4]} ground={p.G} size={140} label="你" op={clamp((f - p.a) / 12)} />
    {f >= p.at.at && f < p.c + 4 && <AtToken x={tok.x} y={tok.y} vx={tok.vx} vy={tok.vy} />}
    {f >= p.c + 18 && <Packet x={card.x} y={card.y} vx={card.vx} vy={card.vy} scale={clamp(springStep(t, S(p.c + 18), {f: 2.4, z: 0.6}), 0, 1.1)} />}
    {f >= p.d && <svg width={880} height={960} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
      <path d={`M${SLOT[1]} ${p.card.from[1] - 70} Q${SLOT[1] + 86} ${p.card.from[1] - 330} ${SLOT[2]} ${p.card.to[1] - 70}`} fill="none" stroke={A} strokeWidth={4}
        strokeDasharray="10 12" strokeLinecap="round" opacity={0.75 * draw(f, p.d, 16)} />
    </svg>}
    <Rise f={f} at={p.e} style={{position: 'absolute', left: 0, top: 250}}>
      <Big size={60}>不用再<Strike p={springStep(t, S(p.e + 8), {f: 2.6, z: 1})} w={7}>复制粘贴</Strike></Big>
    </Rise>
  </Root>;
};
Idea.camera = (cue) => {
  const p = ideaPlan(cue);
  return [cam(0, 300, 160, 1.16), cam(p.a, 440, 600, 1.02), cam(p.b, 440, 700, 1.1), cam(p.c, 268, 700, 1.18), cam(p.d, 440, 680, 1.1), cam(p.e, 380, 320, 1.08)];
};
Idea.sfx = (cue) => {
  const p = ideaPlan(cue);
  return [{at: p.a, kind: 'paper', gain: 0.18}, {at: p.b, kind: 'pop', gain: 0.1}, {at: p.c - 14, kind: 'whoosh-short', gain: 0.12},
    {at: p.c, kind: 'tap', gain: 0.22}, {at: p.d - 2, kind: 'whoosh', gain: 0.14}, {at: p.d + 16, kind: 'tap', gain: 0.2}, {at: p.e + 8, kind: 'tick', gain: 0.18}];
};

/* ---------- task ---------- */

const RUN = [110, 770, 330, 550, 110, 770, 440];
const taskPlan = (cue: Cue) => {
  const [a, b, c, d, e, g, h, k] = [cue('a', 54), cue('b', 120), cue('c', 191), cue('d', 228), cue('e', 249), cue('f', 269), cue('g', 289), cue('h', 314)];
  const scraps = Array.from({length: 12}, (_, i) => ({x: 90 + hash(i * 3.3 + 1) * 700, g: 470 + hash(i * 7.1 + 2) * 300, rot: (hash(i * 2.9) - 0.5) * 26, land: a + 8 + i * 3}));
  const tiles = [{who: 'res' as Who, t: '调研', at: d}, {who: 'wri' as Who, t: '写稿', at: e}, {who: 'dev' as Who, t: '建站', at: g}, {who: 'rev' as Who, t: '审核', at: h}];
  return {a, b, c, d, e, g, h, k, scraps, tiles, HG: 930};
};
const Task: Scene = ({f, cue}) => {
  const p = taskPlan(cue);
  const t = S(f);
  const page = springStep(t, S(p.b), {f: 2.2, z: 0.75});
  const split = springStep(t, S(p.c), {f: 1.8, z: 0.72});
  const runKeys = RUN.map((x, i) => ({at: S(p.k + 18 + i * 20), to: x}));
  const runX = springTrack(t, 440, runKeys, {f: 1.6, z: 0.7});
  const runV = (springTrack(t + 0.02, 440, runKeys, {f: 1.6, z: 0.7}) - runX) / 0.02;
  const meLift = dropLift(f, p.k + 6, p.HG, 700);
  return <Root>
    <Rise f={f} at={2}><Big size={76}>真活：一页提示词库</Big></Rise>
    <Rise f={f} at={p.a + 10} style={{marginTop: 14}}><Kicker size={40} c={DIM}>提示词散在几个月的帖子里</Kicker></Rise>
    {/* the page the scraps fly into */}
    <div style={{position: 'absolute', left: 250, top: 230, width: 380, height: 380, borderRadius: 10, background: CARD, border: `3px solid ${INK}`,
      opacity: clamp(page * 1.4) * (1 - clamp(split * 2)), transform: `scale(${0.85 + 0.15 * page})`}}>
      <div style={{fontFamily: font, fontWeight: 900, fontSize: 40, color: INK, padding: '16px 20px'}}>一页 · 能直接复制</div>
      {Array.from({length: 8}, (_, j) => <div key={j} style={{display: 'flex', alignItems: 'center', gap: 12, margin: '10px 20px', opacity: clamp((f - p.b - 18 - j * 3) / 6)}}>
        <div style={{flex: 1, height: 9, borderRadius: 5, background: LINE}} /><div style={{width: 44, height: 22, borderRadius: 6, border: `2px solid ${INK}`}} />
      </div>)}
    </div>
    {p.scraps.map((s, i) => {
      if (f >= p.b + 20 + i * 3) return null;
      const fall = dropY(f, s.land, s.g, 640);
      const fly = toss(t, {at: S(p.b + 6 + i * 3), dur: S(14), from: [s.x, s.g], to: [440, 330 + (i % 8) * 34], lift: 80});
      const flying = f >= p.b + 6 + i * 3;
      const x = flying ? fly.x : s.x, y = flying ? fly.y : fall.y;
      const hit = hitOf(f, [s.land], 0.6);
      const k = flying ? 1 - 0.5 * fly.u : 1;
      return <React.Fragment key={i}>
        {!flying && <ContactShadow x={s.x} y={s.g} w={120} lift={s.g - fall.y} opacity={0.2} />}
        <div style={{position: 'absolute', left: x - 64, top: y - 76, width: 128, height: 76, borderRadius: 8, background: CARD, border: `2px solid ${INK}`,
          transform: `rotate(${s.rot * (flying ? 1 - fly.u : 1)}deg) scale(${(1 + 0.08 * hit) * k}, ${(1 - 0.1 * hit) * k})`, opacity: f >= s.land - 20 ? 1 : 0}}>
          <div style={{margin: '14px 14px 0', height: 7, borderRadius: 4, background: INK, opacity: 0.6}} />
          <div style={{margin: '10px 14px 0', width: '60%', height: 7, borderRadius: 4, background: INK, opacity: 0.3}} />
        </div>
      </React.Fragment>;
    })}
    {/* the page splits into four jobs */}
    <Ground y={760} op={clamp(split * 1.5)} x0={20} x1={860} />
    {split > 0 && p.tiles.map((tile, i) => {
      const k = springStep(t, S(p.c + i * 3), {f: 1.9, z: 0.7});
      const x0 = 250 + (i % 2) * 190 + 95, y0 = 230 + Math.floor(i / 2) * 190 + 190;
      const x = x0 + ([110, 330, 550, 770][i] - x0) * k, y = y0 + (760 - y0) * k;
      const hop = Math.max(0, 50 * impulse(t, S(tile.at), {f: 2.4, z: 0.5}));
      const hit = hitOf(f, [tile.at + 7], 0.5);
      return <React.Fragment key={tile.t}>
        <ContactShadow x={x} y={760} w={180} lift={760 - y + hop} opacity={0.25 * clamp(k * 2)} />
        <div style={{position: 'absolute', left: x - 95, top: y - 170 - hop, width: 190, height: 170, borderRadius: 18, background: matte(CLAY),
          transform: `scale(${1 + 0.06 * hit}, ${1 - 0.08 * hit})`, transformOrigin: '50% 100%', opacity: clamp(split * 2),
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6}}>
          <Glyph who={tile.who} size={64} c={INK} />
          <div style={{fontFamily: font, fontWeight: 900, fontSize: 44, color: INK, opacity: clamp((f - tile.at - 4) / 8)}}>{tile.t}</div>
        </div>
      </React.Fragment>;
    })}
    <div style={{position: 'absolute', left: 0, top: 190, width: 880, ...phaseOp(f, p.c + 8, p.k + 10)}}><Big size={52} w={700}>拆开是 4 件事</Big></div>
    <div style={{position: 'absolute', left: 0, top: 190, width: 880, ...phaseOp(f, p.k + 14)}}><Big size={52} w={700}>平常：4 个窗口，人在中间来回搬</Big></div>
    {f >= p.k - 20 && <>
      <Ground y={p.HG} x0={20} x1={860} op={clamp((f - p.k + 10) / 10)} />
      <Pebble who="me" x={runX} ground={p.HG} size={100} lift={meLift} hit={hitOf(f, [p.k + 6], 0.7)} />
      <Packet x={runX} y={p.HG - 100 - meLift + 2} vx={runV} scale={0.75} />
    </>}
  </Root>;
};
Task.camera = (cue) => {
  const p = taskPlan(cue);
  return [cam(0, 400, 160, 1.12), cam(p.a, 440, 600, 1.0), cam(p.b, 440, 420, 1.14), cam(p.c, 440, 640, 1.04), cam(p.d, 220, 690, 1.14),
    cam(p.g, 660, 690, 1.14), cam(p.k, 440, 860, 1.1), cam(p.k + 50, 440, 560, 1.02)];
};
Task.sfx = (cue) => {
  const p = taskPlan(cue);
  return [{at: p.a + 8, kind: 'paper', gain: 0.2}, {at: p.b + 6, kind: 'paper', gain: 0.16}, {at: p.b + 56, kind: 'tick', gain: 0.14},
    ...p.tiles.map((x) => ({at: x.at + 7, kind: 'tap', gain: 0.15})), {at: p.k + 6, kind: 'thud', gain: 0.26}];
};

/* ---------- roles ---------- */

const ROLE_INFO: Record<string, {zh: string; en: string; duty: string}> = {
  res: {zh: '趋势调研员', en: 'Trend Researcher', duty: '找粉丝真正收藏的内容'},
  wri: {zh: '文案', en: 'Content Creator', duty: '页面上的每个字都归它'},
  dev: {zh: '网页开发', en: 'Webpage Developer', duty: '用 Website Builder 建站'},
  rev: {zh: '审核编辑', en: 'Verification Editor', duty: '检查一切，专门挑刺'},
};
const rolesPlan = (cue: Cue) => ({at: [cue('a', 72), cue('b', 162), cue('c', 241), cue('d', 312)], G: 860, xs: [110, 330, 550, 770]});
const Roles: Scene = ({f, cue}) => {
  const p = rolesPlan(cue);
  const t = S(f);
  const cur = p.at.filter((x) => f >= x - 2).length - 1;
  return <Root>
    <div style={{position: 'absolute', left: 0, top: 0, ...phaseOp(f, 2, p.at[0] - 4)}}><Big size={80}>先建群，<br />拉进 4 个 agent</Big></div>
    {AGENTS.map((who, i) => (
      <div key={who} style={{position: 'absolute', left: 0, top: 30, width: 880, ...phaseOp(f, p.at[i] + 8, i < 3 ? p.at[i + 1] + 2 : undefined)}}>
        <div style={{display: 'flex', alignItems: 'baseline', gap: 22}}>
          <span style={{fontFamily: num, fontWeight: 900, fontSize: 64, color: DIM}}>0{i + 1}</span>
          <Big size={112}>{ROLE_INFO[who].zh}</Big>
        </div>
        <div style={{fontFamily: num, fontSize: 34, color: DIM, marginTop: 6}}>{ROLE_INFO[who].en}</div>
        <Big size={52} w={700} style={{marginTop: 34}}>{ROLE_INFO[who].duty}</Big>
      </div>
    ))}
    <Ground y={p.G} />
    {AGENTS.map((who, i) => {
      if (f < p.at[i] - 30) return null;
      const lift = dropLift(f, p.at[i], p.G, 700);
      const raise = i === cur ? 22 * springStep(t, S(p.at[i] + 10), {f: 1.6, z: 0.7}) : 0;
      // The ones already standing answer each new landing a few frames later, weaker further away.
      const hit = hitOf(f, [p.at[i]], 1) + (i < cur ? hitOf(f, [p.at[cur] + 3 + (cur - 1 - i) * 2], 0.22) : 0);
      return <Pebble key={who} who={who} x={p.xs[i]} ground={p.G} size={150} lift={lift + raise} hit={hit} label={NAME[who]} labelOp={clamp((f - p.at[i] - 8) / 8)}
        op={i === cur ? 1 : 0.55} />;
    })}
  </Root>;
};
Roles.camera = (cue) => {
  const p = rolesPlan(cue);
  return [cam(0, 300, 160, 1.12), ...p.at.flatMap((x, i) => [cam(x - 4, p.xs[i], 760, 1.14), cam(x + 34, 420, 300, 1.04)])];
};
Roles.sfx = (cue) => rolesPlan(cue).at.map((x) => ({at: x, kind: 'thud', gain: 0.22}));

/* ---------- rules ---------- */

const RULE_ROWS: {who: Who; own: string; input: string; next: string}[] = [
  {who: 'res', own: '调研', input: '我贴的数据', next: '文案'},
  {who: 'wri', own: '每个字', input: '调研报告', next: '开发'},
  {who: 'dev', own: '网站', input: '最新文案', next: '审核'},
  {who: 'rev', own: '质量', input: '整个页面', next: '作者'},
];
const rulesPlan = (cue: Cue) => {
  const [a, b, c, d, e, g] = [cue('a', 52), cue('b', 102), cue('c', 119), cue('d', 152), cue('e', 196), cue('f', 334)];
  return {a, b, c, d, e, g, seal: e + 40};
};
const Rules: Scene = ({f, cue}) => {
  const p = rulesPlan(cue);
  const t = S(f);
  const sx = springTrack(t, 980, [{at: S(4), to: 0}], {f: 1.5, z: 0.8});
  const rot = springTrack(t, -4, [{at: S(4), to: -0.6}], {f: 1.5, z: 0.7});
  const dip = 4 * hitOf(f, [p.seal + 3], 0.6);
  const cols = [{k: 'own', t: '管什么', at: p.b, x: 230, w: 170}, {k: 'input', t: '输入从哪来', at: p.c, x: 400, w: 230}, {k: 'next', t: '交接给谁', at: p.d, x: 630, w: 200}] as const;
  const rowY = (i: number) => 200 + i * 94;
  const sealLift = dropLift(f, p.seal, 830, 760);
  const sealHit = hitOf(f, [p.seal], 1);
  return <Root>
    <div style={{position: 'absolute', left: sx, top: 30 + dip, width: 880, height: 620, borderRadius: 6, background: CARD, border: `2px solid ${INK}`,
      transform: `rotate(${rot}deg)`, boxShadow: '0 18px 30px rgba(60,45,25,0.12)'}}>
      <div style={{display: 'flex', alignItems: 'baseline', gap: 18, padding: '24px 28px 0'}}>
        <Big size={56}>群规</Big><Kicker size={30}>第一条消息</Kicker>
      </div>
      {cols.map((c) => {
        const on = springStep(t, S(c.at), {f: 3, z: 1});
        return <React.Fragment key={c.k}>
          <div style={{position: 'absolute', left: c.x, top: 120, width: c.w, textAlign: 'center', fontFamily: font, fontWeight: 700, fontSize: 32, color: on > 0.5 ? (c.k === 'next' ? A : INK) : DIM}}>{c.t}</div>
          <div style={{position: 'absolute', left: c.x + 10, top: 166, width: c.w - 20, height: 4, borderRadius: 2, background: c.k === 'next' ? A : INK, transform: `scaleX(${clamp(on)})`, transformOrigin: 'left'}} />
        </React.Fragment>;
      })}
      {RULE_ROWS.map((r, i) => (
        <Rise key={r.who} f={f} at={p.a + i * 6} dy={14} style={{position: 'absolute', left: 0, top: rowY(i), width: 880}}>
          <div style={{display: 'flex', alignItems: 'center', height: 80}}>
            <div style={{width: 230, display: 'flex', alignItems: 'center', gap: 12, paddingLeft: 28}}>
              <Glyph who={r.who} size={50} c={INK} wob={8 * ripple(t, S(p.g), i, {delay: 0.08, f: 3, z: 0.3, decay: 1})} />
              <span style={{fontFamily: font, fontWeight: 900, fontSize: 40, color: INK}}>{NAME[r.who]}</span>
            </div>
            {cols.map((c) => <div key={c.k} style={{position: 'absolute', left: c.x, width: c.w, textAlign: 'center', fontFamily: font, fontSize: 38,
              fontWeight: f >= c.at ? 900 : 500, color: f >= c.at ? (c.k === 'next' ? A : INK) : DIM}}>{c.k === 'next' ? `→ ${r[c.k]}` : r[c.k]}</div>)}
          </div>
        </Rise>
      ))}
    </div>
    {/* the handoff chain drawn down the right edge */}
    <svg width={880} height={960} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
      {[0, 1, 2].map((i) => {
        const y0 = 30 + rowY(i) + 56, y1 = 30 + rowY(i + 1) + 26, pr = draw(f, p.d + 6 + i * 5, 10);
        return <path key={i} d={`M845 ${y0} Q885 ${(y0 + y1) / 2} 845 ${y1}`} fill="none" stroke={A} strokeWidth={4} strokeLinecap="round" strokeDasharray={90} strokeDashoffset={90 * (1 - pr)} />;
      })}
    </svg>
    <Rise f={f} at={p.e + 8} style={{position: 'absolute', left: 0, top: 690, width: 640}}>
      <Big size={46}>我说 “ship it” 之前，<br />什么都不许上线</Big>
    </Rise>
    <Ground y={830} x0={680} x1={880} op={clamp((f - p.e) / 10)} />
    {f >= p.seal - 22 && <ContactShadow x={775} y={830} w={140} lift={sealLift} />}
    {f >= p.seal - 22 && <div style={{position: 'absolute', left: 700, top: 830 - 150 - sealLift, width: 150, height: 150, borderRadius: 75, background: matte(B),
      transform: `rotate(-10deg) scale(${1 + 0.1 * sealHit}, ${1 - 0.12 * sealHit})`, transformOrigin: '50% 100%',
      display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: num, fontWeight: 900, fontSize: 38, color: CARD, textAlign: 'center', lineHeight: 1}}>ship<br />it</div>}
    <Rise f={f} at={p.g + 8} style={{position: 'absolute', left: 0, top: 856}}><Big size={58}>4 个机器人 → 1 个团队</Big></Rise>
  </Root>;
};
Rules.camera = (cue) => {
  const p = rulesPlan(cue);
  return [cam(0, 440, 340, 1.0), cam(p.a, 300, 330, 1.1), cam(p.b, 315, 400, 1.16), cam(p.c, 515, 400, 1.16), cam(p.d, 740, 400, 1.16),
    cam(p.e, 330, 720, 1.12), cam(p.seal, 775, 760, 1.16), cam(p.g, 440, 520, 1.0), cam(p.g + 40, 300, 880, 1.1)];
};
Rules.sfx = (cue) => {
  const p = rulesPlan(cue);
  return [{at: 4, kind: 'paper', gain: 0.22}, {at: p.b, kind: 'tick', gain: 0.12}, {at: p.c, kind: 'tick', gain: 0.12}, {at: p.d, kind: 'tick', gain: 0.14},
    {at: p.seal, kind: 'stamp', gain: 0.3}, {at: p.g, kind: 'pop', gain: 0.1}];
};

/* ---------- kickoff ---------- */

const BARS = Array.from({length: 24}, (_, i) => 140 + hash(i * 2.71 + 5) * 460);
const RANK = BARS.map((v) => BARS.filter((w) => w > v).length);
const kickPlan = (cue: Cue) => {
  const [a, b, c, d] = [cue('a', 63), cue('b', 107), cue('c', 215), cue('d', 246)];
  const RG = 900, RX = 770;
  const hop: Hop = {at: c + 16, dur: 16, from: [300, 520], to: top(RX, RG, 120), lift: 200};
  return {a, b, c, d, RG, RX, hop};
};
const Kickoff: Scene = ({f, cue}) => {
  const p = kickPlan(cue);
  const t = S(f);
  const card = hopAt(f, [p.hop]);
  return <Root>
    <div style={{display: 'flex', alignItems: 'baseline', gap: 26}}>
      <Rise f={f} at={2}><Big size={84}>喂真数据</Big></Rise>
      <Rise f={f} at={12}><Big size={48} c={DIM} w={700}>别<Strike p={springStep(t, S(30), {f: 2.6, z: 1})} c={DIM}>编任务</Strike></Big></Rise>
    </div>
    <Rise f={f} at={p.a + 6} style={{position: 'absolute', left: 0, top: 150}}><Kicker size={30}>X 后台 · 最近 60 天（示意）</Kicker></Rise>
    {BARS.map((len, i) => {
      const y0 = 210 + i * 22, y1 = 210 + RANK[i] * 22;
      const fall = springStep(t, S(p.a + i * 1.5), {f: 2.4, z: 0.7});
      const sort = springStep(t, S(p.b + RANK[i] * 0.7), {f: 1.7, z: 0.75});
      const gone = springStep(t, S(p.c + RANK[i] * 0.5), {f: 2.2, z: 1});
      const keep = RANK[i] < 20;
      const y = y0 + (y1 - y0) * sort - (1 - fall) * 60;
      const c = keep || f < p.b + 20 ? INK : LINE;
      const toX = 300, toY = 480;
      return <div key={i} style={{position: 'absolute', left: keep ? toX * gone : 0, top: y + (keep ? (toY - y) * gone : 0), height: 12, borderRadius: 6,
        width: len * (keep ? 1 - gone : 1), background: c, opacity: clamp(fall * 1.5) * (keep ? 1 - clamp(gone * 1.2 - 0.2) : 1 - clamp((f - p.c) / 12))}} />;
    })}
    <Rise f={f} at={p.b + 14} style={{position: 'absolute', left: 640, top: 220}}><Big size={44} w={700}>收藏前<br /><span style={{fontFamily: num, fontSize: 96}}>20</span> 条</Big></Rise>
    <Ground y={p.RG} x0={560} x1={880} />
    <Pebble who="res" x={p.RX} ground={p.RG} size={120} hit={hitOf(f, [p.c + 32], 0.8)} />
    {f >= p.c + 8 && f < p.d + 40 && <Packet x={card.x} y={card.y} vx={card.vx} vy={card.vy} scale={clamp(springStep(t, S(p.c + 8), {f: 2.6, z: 0.6}), 0, 1.1)} />}
    <Rise f={f} at={p.c + 22} style={{position: 'absolute', left: 300, top: 580}}><Big size={44} w={700} c={A}>一条消息</Big></Rise>
    <Rise f={f} at={p.d + 6} style={{position: 'absolute', left: 0, top: 690}}>
      <Big size={64}>然后，不打字了<span style={{display: 'inline-block', width: 8, height: 62, marginLeft: 10, verticalAlign: -8,
        background: f > p.d + 34 ? LINE : INK, opacity: f > p.d + 34 ? 1 : Math.floor(f / 8) % 2}} /></Big>
    </Rise>
  </Root>;
};
Kickoff.camera = (cue) => {
  const p = kickPlan(cue);
  return [cam(0, 300, 120, 1.14), cam(p.a, 300, 440, 1.08), cam(p.b, 440, 420, 1.0), cam(p.b + 40, 700, 300, 1.14), cam(p.c, 440, 560, 1.04),
    cam(p.c + 30, 760, 800, 1.14), cam(p.d, 330, 720, 1.12)];
};
Kickoff.sfx = (cue) => {
  const p = kickPlan(cue);
  return [{at: p.a, kind: 'paper', gain: 0.18}, {at: p.b + 4, kind: 'tick', gain: 0.14}, {at: p.c + 14, kind: 'whoosh', gain: 0.14}, {at: p.c + 32, kind: 'tap', gain: 0.22}];
};

/* ---------- pushback ---------- */

const pushPlan = (cue: Cue) => {
  const [a, b, c] = [cue('a', 43), cue('b', 158), cue('c', 224)];
  const G = 880, X = {me: 120, wri: 440, res: 770};
  const hops: Hop[] = [
    {at: a - 14, dur: 14, from: top(X.me, G, 130), to: top(X.wri, G, 130), lift: 140},
    {at: a + 2, dur: 18, from: top(X.wri, G, 130), to: top(X.me, G, 130), lift: 70},
  ];
  const at: Hop = {at: b, dur: 14, from: top(X.wri, G, 130), to: top(X.res, G, 130), lift: 130};
  return {a, b, c, G, X, hops, at};
};
const Pushback: Scene = ({f, cue}) => {
  const p = pushPlan(cue);
  const t = S(f);
  const card = hopAt(f, p.hops);
  const tok = hopAt(f, [p.at]);
  const resLift = 26 * springStep(t, S(p.b + 18), {f: 2, z: 0.6});
  return <Root>
    <Rise f={f} at={2}><Kicker size={32}>第一个惊喜</Kicker></Rise>
    <div style={{position: 'absolute', left: 0, top: 70, width: 880, height: 300}}>
      <div style={{position: 'absolute', inset: 0, ...phaseOp(f, 8, p.a + 6)}}><Big size={72}>agent 读完了群规……</Big></div>
      <div style={{position: 'absolute', inset: 0, ...phaseOp(f, p.a + 8, p.c + 4)}}><Kicker size={34} c={INK}>文案：</Kicker><Big size={76}>“没有调研，<br />这需求写不了。”</Big></div>
      <div style={{position: 'absolute', inset: 0, ...phaseOp(f, p.c + 8)}}><Big size={80}>会顶回来，<br />才像个同事</Big></div>
    </div>
    <Rise f={f} at={p.b + 10} style={{position: 'absolute', left: 430, top: 540}}><Big size={42} w={700} c={A} style={{whiteSpace: 'nowrap'}}>@调研员 先给份调研</Big></Rise>
    <Ground y={p.G} />
    <Pebble who="me" x={p.X.me} ground={p.G} size={130} hit={hitOf(f, [p.a + 20], 0.6)} label="你" />
    <Pebble who="wri" x={p.X.wri} ground={p.G} size={130} hit={hitOf(f, [p.a], 1)} wob={-10 * impulse(t, S(p.a + 3), {f: 3, z: 0.3})} label="文案" />
    <Pebble who="res" x={p.X.res} ground={p.G} size={130} lift={resLift} hit={hitOf(f, [p.b + 14], 0.8)} label="调研员" />
    <Packet x={card.x} y={card.y} vx={card.vx} vy={card.vy} />
    {f >= p.b - 2 && f < p.b + 16 && <AtToken x={tok.x} y={tok.y} vx={tok.vx} vy={tok.vy} />}
  </Root>;
};
Pushback.camera = (cue) => {
  const p = pushPlan(cue);
  return [cam(0, 400, 220, 1.12), cam(p.a - 14, 440, 760, 1.14), cam(p.a + 30, 400, 240, 1.1), cam(p.b, 700, 700, 1.14), cam(p.c, 400, 260, 1.08)];
};
Pushback.sfx = (cue) => {
  const p = pushPlan(cue);
  return [{at: p.a - 16, kind: 'whoosh-short', gain: 0.12}, {at: p.a, kind: 'thud', gain: 0.28}, {at: p.a + 3, kind: 'whoosh-short', gain: 0.1},
    {at: p.a + 20, kind: 'tap', gain: 0.16}, {at: p.b + 14, kind: 'tap', gain: 0.2}];
};

/* ---------- chain ---------- */

const TOPICS = [{t: '未来的工作和 AI 赚钱', v: 43060}, {t: 'AI agent 和自动化搭建', v: 34551}, {t: '微调定制模型', v: 32852}];
const chainPlan = (cue: Cue) => {
  const [a, b, c, d, e, g, h] = [cue('a', 49), cue('b', 127), cue('c', 149), cue('d', 172), cue('e', 215), cue('f', 314), cue('g', 372)];
  const G = 860, xs = [110, 330, 550, 770], AG = 120;
  const hops: Hop[] = [
    {at: e - 14, dur: 14, from: top(xs[0], G, AG), to: top(xs[1], G, AG), lift: 110},
    {at: g - 14, dur: 14, from: top(xs[1], G, AG), to: top(xs[2], G, AG), lift: 110},
  ];
  const flags = [0, 1, 2].map((k) => ({at: h + k * 4, dur: 16, from: top(xs[2], G, AG), to: [xs[1] - 30 + k * 30, G - AG + 4] as P2, lift: 120}));
  return {a, b, c, d, e, g, h, G, xs, AG, hops, flags};
};
const Chain: Scene = ({f, cue}) => {
  const p = chainPlan(cue);
  const t = S(f);
  const card = hopAt(f, p.hops);
  const holder = f < p.e ? 0 : f < p.g ? 1 : 2;
  const holdAt = holder === 0 ? p.a : holder === 1 ? p.e + 4 : p.g + 4;
  const holdLift = 16 * springStep(t, S(holdAt), {f: 2, z: 0.7});
  const lands = landsOf(p.hops);
  const resting = !p.hops.some((hp) => f >= hp.at && f < hp.at + hp.dur);
  return <Root>
    <div style={{position: 'absolute', left: 0, top: 0, width: 880, ...phaseOp(f, 0, p.a - 2)}}><Big size={84}>接力开始</Big></div>
    <div style={{position: 'absolute', left: 0, top: 0, width: 880, ...phaseOp(f, p.a + 6, p.e + 2)}}>
      <Kicker size={32}>调研报告 · 收藏最多的 3 个话题</Kicker>
      {TOPICS.map((tp, i) => {
        const at = [p.b, p.c, p.d][i];
        const g = springStep(t, S(at), {f: 2, z: 0.62});
        return <div key={tp.t} style={{marginTop: 34, opacity: clamp((f - at + 4) / 6)}}>
          <div style={{display: 'flex', alignItems: 'baseline'}}>
            <Big size={42} w={700}>{tp.t}</Big>
            <span style={{marginLeft: 'auto', fontFamily: num, fontWeight: 900, fontSize: 56, color: INK}}>{Math.round(tp.v * clamp(g)).toLocaleString('en-US')}</span>
          </div>
          <div style={{height: 30, borderRadius: 4, marginTop: 10, width: `${(tp.v / 43060) * 100 * g}%`, background: matte('#3b3631', {gloss: 0.12})}} />
        </div>;
      })}
    </div>
    <div style={{position: 'absolute', left: 0, top: 0, width: 880, ...phaseOp(f, p.e + 6, p.g + 2)}}>
      <Kicker size={32}>文案 · 照着报告写</Kicker>
      <div style={{display: 'flex', alignItems: 'baseline', gap: 18, marginTop: 10}}>
        <span style={{fontFamily: num, fontWeight: 900, fontSize: 220, color: INK, lineHeight: 1}}>{Math.min(15, Math.max(0, Math.floor((f - p.e - 10) / 2)))}</span>
        <Big size={60}>条提示词</Big>
      </div>
      <div style={{display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, marginTop: 24, width: 640}}>
        {Array.from({length: 15}, (_, i) => {
          const s = springStep(t, S(p.e + 10 + i * 2), {f: 2.6, z: 0.6});
          return <div key={i} style={{height: 46, borderRadius: 6, background: CARD, border: `2px solid ${INK}`, opacity: clamp(s * 2), transform: `scale(${0.7 + 0.3 * s})`}} />;
        })}
      </div>
    </div>
    <div style={{position: 'absolute', left: 0, top: 0, width: 880, ...phaseOp(f, p.g + 6)}}>
      <Kicker size={32}>开发 · 没急着动手</Kicker>
      <Big size={72} style={{marginTop: 6}}>先发方案</Big>
      {['版块和样式', '表单写进真数据库', '管理页看请求'].map((x, i) => (
        <div key={x} style={{display: 'flex', alignItems: 'center', gap: 16, marginTop: 22, opacity: clamp((f - p.g - 12 - i * 8) / 6)}}>
          <Tick p={clamp((f - p.g - 12 - i * 8) / 10)} /><Big size={44} w={700}>{x}</Big>
        </div>
      ))}
      <Rise f={f} at={p.h + 8} style={{marginTop: 34}}><Big size={46}>3 个问题，<span style={{color: A}}>当众退回</span>文案</Big></Rise>
    </div>
    <Ground y={p.G} />
    {AGENTS.map((who, i) => {
      const hold = i === holder ? holdLift : 0;
      const hit = hitOf(f, i === 1 ? [lands[0], ...p.flags.map((x) => x.at + x.dur)] : i === 2 ? [lands[1]] : [], i === 1 && f > p.h ? 0.4 : 0.8);
      return <Pebble key={who} who={who} x={p.xs[i]} ground={p.G} size={p.AG} lift={hold} hit={hit} label={NAME[who]} op={i === holder || f < p.a ? 1 : 0.6} />;
    })}
    {f >= p.a && <Packet x={card.x} y={card.y - (resting ? holdLift : 0)} vx={card.vx} vy={card.vy} scale={clamp(springStep(t, S(p.a), {f: 2.6, z: 0.6}), 0, 1.1)} />}
    {p.flags.map((fl, k) => {
      if (f < fl.at) return null;
      const q = hopAt(f, [fl]);
      return <svg key={k} width={40} height={60} viewBox="0 0 40 60" style={{position: 'absolute', left: q.x - 6, top: q.y - 58}}>
        <line x1={6} y1={4} x2={6} y2={58} stroke={INK} strokeWidth={4} strokeLinecap="round" /><path d="M6 6 L34 15 L6 25 Z" fill={INK} />
      </svg>;
    })}
  </Root>;
};
Chain.camera = (cue) => {
  const p = chainPlan(cue);
  return [cam(0, 300, 120, 1.14), cam(p.a, 300, 400, 1.04), cam(p.b, 440, 180, 1.14), cam(p.c, 440, 300, 1.14), cam(p.d, 440, 420, 1.14),
    cam(p.e - 10, 330, 780, 1.12), cam(p.e + 30, 360, 300, 1.08), cam(p.g - 10, 550, 780, 1.12), cam(p.g + 30, 400, 300, 1.08), cam(p.h, 330, 760, 1.16)];
};
Chain.sfx = (cue) => {
  const p = chainPlan(cue);
  return [{at: p.b, kind: 'tick', gain: 0.14}, {at: p.c, kind: 'tick', gain: 0.12}, {at: p.d, kind: 'tick', gain: 0.12},
    {at: p.e - 16, kind: 'whoosh-short', gain: 0.12}, {at: p.e, kind: 'tap', gain: 0.2}, {at: p.g - 16, kind: 'whoosh-short', gain: 0.12}, {at: p.g, kind: 'tap', gain: 0.2},
    {at: p.h + 16, kind: 'tap', gain: 0.14}, {at: p.h + 24, kind: 'tap', gain: 0.12}];
};

/* ---------- insight ---------- */

const insightPlan = (cue: Cue) => {
  const [a, b, c, d, e, only] = [cue('a', 51), cue('b', 85), cue('c', 129), cue('d', 231), cue('e', 346), cue('f', 270)];
  return {a, b, c, d, e, only, G: 800};
};
const Insight: Scene = ({f, cue}) => {
  const p = insightPlan(cue);
  const t = S(f);
  const guide = springTrack(t, 0, [{at: S(p.c), to: 400}], {f: 1.5, z: 0.55});
  const hype = springTrack(t, 0, [{at: S(p.d), to: 36}], {f: 2.2, z: 0.6});
  const textLift = dropLift(f, p.e, p.G - 36, 700);
  const hits = [hitOf(f, [p.e + 5], 0.35), hitOf(f, [p.e], 1)];
  const textHit = hitOf(f, [p.e], 1);
  return <Root>
    <Rise f={f} at={2}><Kicker size={32}>报告里最值钱的一句</Kicker></Rise>
    <Rise f={f} at={p.a} style={{marginTop: 18}}><Big size={74}>炒作帖，拿流量</Big></Rise>
    <Rise f={f} at={p.b} style={{marginTop: 4}}><Big size={74}>教程帖，拿<span style={{textDecoration: `underline ${INK} 6px`, textUnderlineOffset: 12}}>收藏</span></Big></Rise>
    <Ground y={p.G} />
    {/* 「只有」: a dashed level from the tall column's top shows how little the short one reaches */}
    <svg width={880} height={960} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
      <path d={`M345 ${p.G - 400} L740 ${p.G - 400}`} stroke={INK} strokeWidth={3} strokeDasharray="10 10" opacity={0.6 * draw(f, p.only, 14)} />
      <path d={`M640 ${p.G - 392} L640 ${p.G - 46}`} stroke={INK} strokeWidth={3} strokeDasharray="6 8" opacity={0.6 * draw(f, p.only + 8, 12)} />
    </svg>
    {[{x: 260, h: guide, at: p.c, v: '1.89%', l: '免费学习资源'}, {x: 640, h: hype, at: p.only - 6, v: '0.17%', l: '最火的炒作帖'}].map((c, i) => (
      <React.Fragment key={c.l}>
        <div style={{position: 'absolute', left: c.x - 85, top: p.G - Math.max(0, c.h), width: 170, height: Math.max(0, c.h), borderRadius: '10px 10px 0 0',
          background: matte('#3b3631', {gloss: 0.14}), transform: `scaleY(${1 - 0.06 * hits[i]})`, transformOrigin: '50% 100%'}} />
        <div style={{position: 'absolute', left: c.x - 160, width: 320, top: p.G + 14, textAlign: 'center', opacity: clamp((f - c.at - 6) / 8)}}>
          <div style={{fontFamily: num, fontWeight: 900, fontSize: 56, color: INK, lineHeight: 1.1}}>{c.v}</div>
          <Big size={36} w={700} c={DIM}>{c.l}</Big>
        </div>
      </React.Fragment>
    ))}
    <Rise f={f} at={p.c + 6} style={{position: 'absolute', left: 0, top: 360}}><Kicker size={32}>收藏率 = 收藏 ÷ 浏览</Kicker></Rise>
    {f >= p.e - 25 && <div style={{position: 'absolute', left: 400, top: p.G - 36 - 120 - textLift, width: 480, textAlign: 'center', whiteSpace: 'nowrap',
      transform: `scale(${1 + 0.08 * textHit}, ${1 - 0.1 * textHit})`, transformOrigin: '50% 100%'}}>
      <Big size={104}>差 <span style={{fontFamily: num}}>11</span> 倍</Big>
    </div>}
  </Root>;
};
Insight.camera = (cue) => {
  const p = insightPlan(cue);
  return [cam(0, 300, 100, 1.12), cam(p.a, 360, 140, 1.14), cam(p.b, 360, 240, 1.14), cam(p.c, 260, 620, 1.12), cam(p.d, 640, 720, 1.16),
    cam(p.only + 4, 500, 560, 1.0), cam(p.e - 4, 600, 700, 1.1), cam(p.e + 30, 440, 480, 1.0)];
};
Insight.sfx = (cue) => {
  const p = insightPlan(cue);
  return [{at: p.c, kind: 'tick', gain: 0.16}, {at: p.d, kind: 'tick', gain: 0.12}, {at: p.only, kind: 'tick', gain: 0.12}, {at: p.e, kind: 'thud', gain: 0.32}];
};

/* ---------- block ---------- */

const blockPlan = (cue: Cue) => {
  const [a, b, c, d, e] = [cue('a', 67), cue('b', 145), cue('c', 228), cue('d', 303), cue('e', 409)];
  const G = 420, DX = 120, RX = 770, GATE = 620;
  const hops: Hop[] = [
    {at: a - 14, dur: 14, from: top(DX, G, 130), to: [GATE - 14, G - 120], lift: 120},
    {at: a, dur: 20, from: [GATE - 14, G - 120], to: top(DX, G, 130), lift: 60},
  ];
  return {a, b, c, d, e, only: cue('f', 479), G, DX, RX, GATE, hops, gateLand: a - 6};
};
const Block: Scene = ({f, cue}) => {
  const p = blockPlan(cue);
  const t = S(f);
  const card = hopAt(f, p.hops);
  const gateLift = dropLift(f, p.gateLand, p.G, 600);
  const gateWob = 3 * impulse(t, S(p.a), {f: 3.5, z: 0.25});
  const fix = springStep(t, S(p.c + 8), {f: 2.4, z: 0.8});
  const ring = draw(f, p.d + 4, 16);
  return <Root>
    <div style={{position: 'absolute', left: 0, top: 0, width: 880, ...phaseOp(f, 2, p.a + 4)}}><Big size={68}>建好第一版，<br />交给审核员</Big></div>
    <div style={{position: 'absolute', left: 0, top: 0, width: 880, ...phaseOp(f, p.a + 8)}}>
      <div style={{fontFamily: num, fontWeight: 900, fontSize: 76, color: INK, lineHeight: 1}}>NOT READY TO SHIP</div>
      <Big size={44} w={700} c={DIM} style={{marginTop: 12}}>不能上线 · 2 个阻断问题</Big>
    </div>
    <Ground y={p.G} />
    <Pebble who="dev" x={p.DX} ground={p.G} size={130} hit={hitOf(f, [p.a + 20], 0.6)} label="开发" />
    <Pebble who="rev" x={p.RX} ground={p.G} size={130} hit={hitOf(f, [p.gateLand], 0.3)} label="审核" />
    {f >= p.gateLand - 20 && <>
      <ContactShadow x={p.GATE + 12} y={p.G} w={70} lift={gateLift} />
      <div style={{position: 'absolute', left: p.GATE, top: p.G - 230 - gateLift, width: 26, height: 230, borderRadius: 6, background: matte('#2b2824'),
        transform: `rotate(${gateWob}deg)`, transformOrigin: '50% 100%'}} />
    </>}
    <Packet x={card.x} y={card.y} vx={card.vx} vy={card.vy} />
    <Rise f={f} at={p.b} style={{position: 'absolute', left: 0, top: 540, width: 880}}>
      <div style={{background: CARD, border: `2px solid ${INK}`, borderRadius: 8, padding: '22px 28px 26px', boxShadow: '0 14px 24px rgba(60,45,25,0.10)'}}>
        <Kicker size={30}>页面引用 · Anthropic 提示词指南</Kicker>
        <div style={{position: 'relative', fontFamily: num, fontWeight: 800, fontSize: 54, color: INK, marginTop: 64, whiteSpace: 'nowrap'}}>
          <span style={{position: 'relative'}}>“{ring > 0 && <svg width={70} height={90} style={{position: 'absolute', left: -22, top: -12, overflow: 'visible'}}>
            <ellipse cx={30} cy={40} rx={30} ry={40} fill="none" stroke={INK} strokeWidth={4} strokeDasharray={230} strokeDashoffset={230 * (1 - ring)} /></svg>}</span>
          …<span style={{position: 'relative', display: 'inline-block'}}>
            <Strike p={springStep(t, S(p.c), {f: 3, z: 1})} w={6}><span style={{color: f >= p.c ? DIM : INK}}>the model</span></Strike>
            <span style={{position: 'absolute', left: 4, top: -62, color: INK, fontWeight: 900, opacity: clamp(fix * 1.4), transform: `translateY(${(1 - fix) * 16}px)`}}>Claude</span>
          </span> will be too.”
        </div>
        <div style={{display: 'flex', alignItems: 'center', gap: 18, marginTop: 14}}>
          <span style={{position: 'relative', fontFamily: num, fontSize: 36, color: INK}}>— Anthropic
            {ring > 0 && <svg width={260} height={70} style={{position: 'absolute', left: -20, top: -12, overflow: 'visible'}}>
              <ellipse cx={120} cy={26} rx={128} ry={34} fill="none" stroke={INK} strokeWidth={4} strokeDasharray={600} strokeDashoffset={600 * (1 - draw(f, p.d + 10, 16))} /></svg>}
          </span>
          <Rise f={f} at={p.d + 14} style={{marginLeft: 'auto'}}><Big size={40} w={700}>一个词 · 在引号里 · 署了名</Big></Rise>
        </div>
      </div>
    </Rise>
    <Rise f={f} at={p.e} style={{position: 'absolute', left: 0, top: 860, width: 880}}>
      <div style={{display: 'flex', alignItems: 'baseline', gap: 18}}>
        <Big size={40} w={700} c={DIM}>页面写</Big>
        <span style={{fontFamily: num, fontWeight: 800, fontSize: 48, color: INK}}><Strike p={springStep(t, S(p.e + 30), {f: 3, z: 1})} w={6}>“Sixteen prompts”</Strike></span>
        <Big size={40} w={700} c={DIM} style={{marginLeft: 'auto'}}>实际</Big>
        <span style={{fontFamily: num, fontWeight: 900, fontSize: 76, color: INK, lineHeight: 1, display: 'inline-block', opacity: clamp((f - p.only + 2) / 4),
          transform: `translateY(${-dropLift(f, p.only, 0, 220)}px) scale(${1 + 0.1 * hitOf(f, [p.only], 1)}, ${1 - 0.12 * hitOf(f, [p.only], 1)})`, transformOrigin: '50% 100%'}}>15</span>
      </div>
    </Rise>
  </Root>;
};
Block.camera = (cue) => {
  const p = blockPlan(cue);
  return [cam(0, 330, 200, 1.1), cam(p.a - 16, 400, 340, 1.12), cam(p.a + 10, 440, 120, 1.06), cam(p.b, 440, 650, 1.06), cam(p.c, 420, 700, 1.16),
    cam(p.d, 300, 760, 1.14), cam(p.e, 380, 880, 1.12), cam(p.only, 790, 880, 1.2), cam(p.only + 36, 440, 560, 1.0)];
};
Block.sfx = (cue) => {
  const p = blockPlan(cue);
  return [{at: p.a - 16, kind: 'whoosh-short', gain: 0.12}, {at: p.gateLand, kind: 'thud', gain: 0.28}, {at: p.a, kind: 'block', gain: 0.26},
    {at: p.c, kind: 'tick', gain: 0.14}, {at: p.d + 4, kind: 'paper', gain: 0.14}, {at: p.e + 30, kind: 'tick', gain: 0.14}, {at: p.only, kind: 'tap', gain: 0.2}];
};

/* ---------- fix ---------- */

const fixPlan = (cue: Cue) => {
  const [a, b, c, d, e, g] = [cue('a', 102), cue('b', 146), cue('c', 200), cue('d', 272), cue('e', 340), cue('f', 429)];
  const G = 600, DX = 110;
  const miss: Hop[] = [{at: c, dur: 16, from: top(DX, G, 120), to: [600, 470], lift: 120}, {at: c + 16, dur: 12, from: [600, 470], to: [520, G], lift: 40}];
  const make: Hop = {at: d + 20, dur: 16, from: top(DX, G, 120), to: [720, 580], lift: 170};
  return {a, b, c, d, e, g, G, DX, miss, make};
};
const Fix: Scene = ({f, cue}) => {
  const p = fixPlan(cue);
  const first = hopAt(f, p.miss);
  const second = hopAt(f, [p.make]);
  const rows = f >= p.make.at + p.make.dur ? 1 : 0;
  const boxHit = hitOf(f, [p.c + 16], 0.4) + hitOf(f, [p.make.at + p.make.dur], 0.8);
  const pairs = [['the model will be too', 'Claude will be too'], ['Sixteen prompts', '15 prompts'], ['模型没有实时数据', '删掉：已过时']];
  return <Root>
    <Rise f={f} at={2}><Kicker size={32}>对照 OpenAI / Anthropic 线上指南</Kicker></Rise>
    <Rise f={f} at={8} style={{marginTop: 8}}><Big size={60}>逐条给改法</Big></Rise>
    {pairs.map(([x, y], i) => (
      <Rise key={x} f={f} at={p.a + i * 8} dy={16} style={{position: 'absolute', left: 0, top: 170 + i * 70, width: 880}}>
        <div style={{display: 'flex', alignItems: 'baseline', gap: 14}}>
          <span style={{width: 400, fontFamily: /[a-z]/.test(x) ? num : font, fontSize: 30, color: DIM, whiteSpace: 'nowrap'}}><Strike p={clamp((f - p.a - i * 8 - 6) / 8)} c={DIM} w={3}>{x}</Strike></span>
          <span style={{fontFamily: font, fontSize: 32, color: DIM}}>→</span>
          <span style={{fontFamily: /[a-z]/.test(y) ? num : font, fontWeight: 900, fontSize: 40, color: INK, whiteSpace: 'nowrap'}}>{y}</span>
        </div>
      </Rise>
    ))}
    <Ground y={p.G} x0={20} x1={860} />
    <Pebble who="dev" x={p.DX} ground={p.G} size={120} wob={f >= p.b && f < p.b + 40 ? 10 * Math.sin((f - p.b) / 2.2) * (1 - (f - p.b) / 40) : 0} label="开发" />
    <Rise f={f} at={p.b + 8} style={{position: 'absolute', left: 200, top: 400}}><Big size={40} w={700}>自己改、自己复查</Big></Rise>
    {/* the database: an open box on the ground */}
    <div style={{position: 'absolute', left: 600, top: 470, width: 240, height: 130, transform: `scaleY(${1 - 0.08 * boxHit})`, transformOrigin: '50% 100%'}}>
      <svg width={240} height={130} style={{position: 'absolute', inset: 0}}><path d="M3 0 L3 127 L237 127 L237 0" fill={CARD} stroke={INK} strokeWidth={4} /></svg>
      <div style={{position: 'absolute', left: 0, right: 0, top: 30, textAlign: 'center', fontFamily: num, fontWeight: 900, fontSize: 50, color: INK, opacity: f >= p.c + 16 ? 1 : 0}}>{rows} 行</div>
    </div>
    <Kicker size={30} style={{position: 'absolute', left: 600, top: 424}}>数据库</Kicker>
    {f >= p.d && f < p.make.at + p.make.dur && <svg width={70} height={70} viewBox="0 0 70 70" style={{position: 'absolute', left: 770, top: 380, transform: `rotate(${(f - p.d) * 12}deg)`}}>
      <circle cx={35} cy={35} r={24} fill="none" stroke={INK} strokeWidth={5} strokeDasharray="110 50" strokeLinecap="round" /></svg>}
    {f >= p.c && f < p.d + 20 && <Packet x={first.x} y={first.y} vx={first.vx} vy={first.vy} ground={p.G} op={1 - clamp((f - p.c - 40) / 10)} />}
    {f >= p.d + 20 && <Packet x={second.x} y={second.y} vx={second.vx} vy={second.vy} />}
    {/* checking your own homework vs. a different agent checking */}
    <Rise f={f} at={p.e} style={{position: 'absolute', left: 0, top: 690, width: 420}}><Big size={40} w={700}>单个聊天机器人：<br />自己批自己</Big></Rise>
    {f >= p.e && <>
      <Pebble who="wri" x={110} ground={930} size={90} hit={hitOf(f, [p.e + 22], 0.4)} />
      <svg width={200} height={200} style={{position: 'absolute', left: 120, top: 740, overflow: 'visible'}}>
        <path d="M30 100 C 120 60, 150 170, 50 180" fill="none" stroke={INK} strokeWidth={4} strokeLinecap="round" strokeDasharray={260} strokeDashoffset={260 * (1 - draw(f, p.e + 6, 16))} />
      </svg>
    </>}
    <Rise f={f} at={p.g} style={{position: 'absolute', left: 470, top: 690, width: 420}}><Big size={40} w={700}>这里：写的 ≠ 查的</Big></Rise>
    {f >= p.g && <>
      <Pebble who="dev" x={540} ground={930} size={90} />
      <Pebble who="rev" x={800} ground={930} size={90} hit={hitOf(f, [p.g + 18], 0.6)} />
      <svg width={880} height={960} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
        <path d="M560 830 Q670 760 790 830" fill="none" stroke={A} strokeWidth={5} strokeLinecap="round" strokeDasharray="10 12" opacity={draw(f, p.g + 4, 14)} />
      </svg>
      {(() => {
        const q = hopAt(f, [{at: p.g + 4, dur: 14, from: top(540, 930, 90), to: top(800, 930, 90), lift: 110}]);
        return <Packet x={q.x} y={q.y} vx={q.vx} vy={q.vy} scale={0.7} />;
      })()}
    </>}
  </Root>;
};
Fix.camera = (cue) => {
  const p = fixPlan(cue);
  return [cam(0, 300, 100, 1.12), cam(p.a, 440, 260, 1.1), cam(p.b, 200, 480, 1.12), cam(p.c, 650, 520, 1.14), cam(p.d, 720, 520, 1.16),
    cam(p.e, 220, 760, 1.06), cam(p.g, 660, 880, 1.2)];
};
Fix.sfx = (cue) => {
  const p = fixPlan(cue);
  return [{at: p.a, kind: 'tick', gain: 0.12}, {at: p.c - 2, kind: 'whoosh-short', gain: 0.12}, {at: p.c + 16, kind: 'thud', gain: 0.2},
    {at: p.make.at - 2, kind: 'whoosh-short', gain: 0.12}, {at: p.make.at + p.make.dur, kind: 'tap', gain: 0.22}, {at: p.make.at + p.make.dur + 6, kind: 'tick', gain: 0.14},
    {at: p.e + 6, kind: 'paper', gain: 0.12}, {at: p.g + 2, kind: 'whoosh-short', gain: 0.12}, {at: p.g + 18, kind: 'tap', gain: 0.18}];
};

/* ---------- human ---------- */

const humanPlan = (cue: Cue) => {
  const [a, b, c, d, e, g, h, k] = [cue('a', 82), cue('b', 148), cue('c', 209), cue('d', 247), cue('e', 361), cue('f', 399), cue('g', 437), cue('h', 483)];
  return {a, b, c, d, e, g, h, k, i: cue('i', 318), G: 270, HX: 770, qLand: c + 10, sheet: {at: e, dur: 18}};
};
const Human: Scene = ({f, cue}) => {
  const p = humanPlan(cue);
  const t = S(f);
  const round = Math.min(8, 1 + Math.floor(f / 5));
  const meLift = dropLift(f, p.a, p.G, 760);
  const qLift = dropLift(f, p.qLand, 630, 700);
  const qHit = hitOf(f, [p.qLand], 1);
  const knock = toss(t, {at: S(p.i), dur: S(24), from: [795, 630], to: [1060, 1100], lift: 120});
  const sheet = toss(t, {at: S(p.sheet.at), dur: S(p.sheet.dur), from: [p.HX, 120], to: [440, 940], lift: 60});
  const sheetDone = f >= p.sheet.at + p.sheet.dur;
  return <Root>
    <div style={{display: 'flex', alignItems: 'baseline', gap: 10}}>
      <Big size={44} w={700}>第</Big><span style={{fontFamily: num, fontWeight: 900, fontSize: 120, color: INK, lineHeight: 1}}>{round}</span><Big size={44} w={700}>轮，还在打磨</Big>
    </div>
    <Ground y={p.G} />
    {AGENTS.map((who, i) => (
      <Pebble key={who} who={who} x={70 + i * 120} ground={p.G} size={90}
        lift={f < p.a + 10 ? Math.max(0, 22 * Math.sin((f - i * 4) / 4)) * (f < p.a ? 1 : 1 - (f - p.a) / 10) : 0} hit={hitOf(f, [p.a + 3 + i * 2], 0.35)} />
    ))}
    {f >= p.a - 30 && <Pebble who="me" x={p.HX} ground={p.G} size={170} lift={meLift} hit={hitOf(f, [p.a], 1)} />}
    <Rise f={f} at={p.a + 8} style={{position: 'absolute', left: 560, top: 300}}><Big size={52}>人来<span style={{color: B}}>拍板</span></Big></Rise>
    <Rise f={f} at={p.b} style={{position: 'absolute', left: 0, top: 390, width: 880}}>
      <div style={{background: CARD, border: `2px solid ${INK}`, borderRadius: 8, padding: '22px 26px', height: 240, boxShadow: '0 14px 24px rgba(60,45,25,0.10)'}}>
        <Kicker size={28}>新访客视角 · 提示词库首页</Kicker>
        <div style={{fontFamily: num, fontWeight: 800, fontSize: 36, color: INK, marginTop: 14, lineHeight: 1.25, width: 640}}>
          built from the 20 posts{' '}
          {f < p.d ? 'you saved' : <><Strike p={springStep(t, S(p.d), {f: 3, z: 1})} c={DIM} w={5}><span style={{color: DIM}}>you saved</span></Strike>{' '}
            <span style={{fontWeight: 900, opacity: clamp((f - p.d - 10) / 8)}}>his followers saved</span></>} most
        </div>
        <Rise f={f} at={p.i}><Big size={34} w={700} c={DIM} style={{marginTop: 10}}>其实是：粉丝收藏的帖子</Big></Rise>
      </div>
    </Rise>
    {/* once the answer is in, the question mark is knocked off the page */}
    {f >= p.qLand - 22 && f < p.i + 26 && <div style={{position: 'absolute', left: 730 + (f >= p.i ? knock.x - 795 : 0), top: 630 - 150 - qLift + (f >= p.i ? knock.y - 630 : 0), width: 130, height: 150, textAlign: 'center',
      transform: `rotate(${f >= p.i ? (f - p.i) * 9 : f >= p.qLand ? 8 * impulse(t, S(p.qLand), {f: 1.6, z: 0.2}) : 0}deg) scale(${1 + 0.1 * qHit}, ${1 - 0.12 * qHit})`,
      transformOrigin: '50% 100%', fontFamily: num, fontWeight: 900, fontSize: 150, color: INK, lineHeight: 1}}>?</div>}
    {f >= p.sheet.at && <div style={{position: 'absolute', left: (sheetDone ? 440 : sheet.x) - 440, top: (sheetDone ? 940 : sheet.y) - 270,
      width: 880, height: 270, transform: `scale(${sheetDone ? 1 : 0.3 + 0.7 * sheet.u})`, transformOrigin: '50% 100%',
      background: CARD, border: `2px solid ${INK}`, borderLeft: `10px solid ${B}`, borderRadius: 8, padding: '18px 26px'}}>
      <Kicker size={28} c={B}>作者只发了一条消息</Kicker>
      {['照审核意见改', '顶上加个“从这里开始”', '然后发布'].map((x, i) => {
        const at = [p.g, p.h, p.k][i];
        return <div key={x} style={{display: 'flex', alignItems: 'center', gap: 16, marginTop: 14, opacity: f >= at - 6 ? 1 : 0.3}}>
          <Tick p={clamp((f - at) / 10)} size={40} /><Big size={42} w={700}>{x}</Big>
        </div>;
      })}
    </div>}
  </Root>;
};
Human.camera = (cue) => {
  const p = humanPlan(cue);
  return [cam(0, 260, 130, 1.14), cam(p.a, 770, 220, 1.16), cam(p.b, 440, 500, 1.06), cam(p.qLand, 760, 560, 1.16), cam(p.d, 420, 480, 1.14), cam(p.i, 300, 580, 1.16),
    cam(p.e, 440, 800, 1.06), cam(p.g, 360, 760, 1.12), cam(p.h, 440, 820, 1.14), cam(p.k, 300, 870, 1.12)];
};
Human.sfx = (cue) => {
  const p = humanPlan(cue);
  return [{at: p.a, kind: 'thud', gain: 0.34}, {at: p.qLand, kind: 'tap', gain: 0.2}, {at: p.d, kind: 'tick', gain: 0.12}, {at: p.i - 2, kind: 'whoosh-short', gain: 0.14},
    {at: p.e - 2, kind: 'whoosh', gain: 0.14}, {at: p.e + 18, kind: 'paper', gain: 0.18}, {at: p.g, kind: 'tick', gain: 0.16}, {at: p.h, kind: 'tick', gain: 0.16}, {at: p.k, kind: 'tick', gain: 0.16}];
};

/* ---------- ship ---------- */

const shipPlan = (cue: Cue) => {
  const [a, b, c, d, e] = [cue('a', 54), cue('b', 124), cue('c', 184), cue('d', 256), cue('e', 339)];
  return {a, b, c, d, e, G: 280, passLand: d + 50, drop: {at: e, dur: 18, from: top(110, 640, 110), to: [430, 930] as P2, lift: 120}};
};
const Ship: Scene = ({f, cue}) => {
  const p = shipPlan(cue);
  const t = S(f);
  // The button travels with its leading (right) edge on a stiffer spring than the trailing edge: it stretches on the way.
  const right = springTrack(t, 500, [{at: S(p.a), to: 680}, {at: S(p.b + 10), to: 760}], {f: 3, z: 0.75});
  const left = springTrack(t, 200, [{at: S(p.a), to: 380}, {at: S(p.b + 10), to: 160}], {f: 1.8, z: 0.8});
  const press = hitOf(f, [p.b], 1);
  const live = springStep(t, S(p.b + 10), {f: 2.4, z: 0.9});
  const passLift = dropLift(f, p.passLand, 770, 600);
  const passHit = hitOf(f, [p.passLand], 1);
  const pk = hopAt(f, [{at: p.drop.at, dur: p.drop.dur, from: p.drop.from, to: p.drop.to, lift: p.drop.lift}]);
  return <Root>
    <Ground y={p.G} />
    <Pebble who="dev" x={90} ground={p.G} size={120} label="开发" />
    <Pebble who="me" x={810} ground={p.G} size={130} hit={press * 0.8} label="作者" />
    <div style={{position: 'absolute', left, top: p.G - 86, width: right - left, height: 86, borderRadius: 43,
      background: live > 0.5 ? matte(B) : matte('#2b2824'), transform: `scale(${1 + 0.06 * press}, ${1 - 0.14 * press})`, transformOrigin: '50% 100%',
      display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', whiteSpace: 'nowrap'}}>
      <span style={{position: 'absolute', fontFamily: font, fontWeight: 900, fontSize: 40, color: CARD, opacity: 1 - clamp(live * 1.6), filter: `blur(${clamp(live) * 6}px)`}}>发布 Publish</span>
      <span style={{position: 'absolute', fontFamily: num, fontWeight: 800, fontSize: 40, color: CARD, opacity: clamp(live * 1.4), filter: `blur(${(1 - clamp(live)) * 6}px)`}}>● Version 1 is live</span>
    </div>
    <Rise f={f} at={p.a + 20} style={{position: 'absolute', left: 0, top: 0}}><Big size={60}>开发停下，<br />把按钮交给作者</Big></Rise>
    <Rise f={f} at={p.b + 14} style={{position: 'absolute', left: 230, top: 340}}><Big size={52}>发不发，是<span style={{color: B}}>人</span>的事</Big></Rise>
    <Ground y={640} x0={20} x1={200} op={clamp((f - p.c + 20) / 10)} />
    {f >= p.c - 25 && <Pebble who="rev" x={110} ground={640} size={110} lift={dropLift(f, p.c, 640, 600)} hit={hitOf(f, [p.c], 0.8)} label="审核" />}
    <div style={{position: 'absolute', left: springTrack(t, 1200, [{at: S(p.c + 4), to: 250}], {f: 1.5, z: 0.82}), top: 440, width: 630, height: 340,
      background: CARD, border: `2px solid ${INK}`, borderRadius: 8, padding: '18px 26px', boxShadow: '0 14px 24px rgba(60,45,25,0.10)'}}>
      <Kicker size={28}>线上页面 · 终审</Kicker>
      {['PASS', 'Hero', 'Start here', 'Copy 按钮', '表单'].map((x, i) => (
        <div key={x} style={{display: 'flex', alignItems: 'center', gap: 14, marginTop: 3, opacity: f >= p.d + i * 7 - 4 ? 1 : 0.25}}>
          <Tick p={clamp((f - p.d - i * 7) / 9)} size={38} /><span style={{fontFamily: i ? font : num, fontWeight: i ? 700 : 900, fontSize: i ? 36 : 40, color: INK}}>{x}</span>
        </div>
      ))}
    </div>
    {f >= p.passLand - 20 && <div style={{position: 'absolute', left: 590, top: 770 - 100 - passLift, transform: `rotate(-6deg) scale(${1 + 0.08 * passHit}, ${1 - 0.1 * passHit})`,
      transformOrigin: '50% 100%', fontFamily: num, fontWeight: 900, fontSize: 96, color: INK, lineHeight: 1}}>PASS</div>}
    {f >= p.e - 10 && <>
      <svg width={300} height={110} style={{position: 'absolute', left: 280, top: 830}}><path d="M3 0 L3 107 L297 107 L297 0" fill={CARD} stroke={INK} strokeWidth={4} /></svg>
      <Kicker size={30} style={{position: 'absolute', left: 280, top: 790}}>数据库</Kicker>
      <Packet x={pk.x} y={pk.y} vx={pk.vx} vy={pk.vy} scale={0.8} />
      <Rise f={f} at={p.e + p.drop.dur + 4} style={{position: 'absolute', left: 610, top: 860}}><span style={{fontFamily: num, fontWeight: 900, fontSize: 56, color: INK}}>+1 行</span></Rise>
    </>}
  </Root>;
};
Ship.camera = (cue) => {
  const p = shipPlan(cue);
  return [cam(0, 440, 220, 1.08), cam(p.a, 560, 240, 1.14), cam(p.b, 790, 240, 1.16), cam(p.c, 440, 600, 1.04), cam(p.d, 440, 560, 1.12),
    cam(p.passLand, 700, 700, 1.16), cam(p.e, 430, 860, 1.12)];
};
Ship.sfx = (cue) => {
  const p = shipPlan(cue);
  return [{at: p.a, kind: 'whoosh', gain: 0.14}, {at: p.b, kind: 'tick', gain: 0.22}, {at: p.b + 10, kind: 'pop', gain: 0.14}, {at: p.c, kind: 'tap', gain: 0.18},
    {at: p.d, kind: 'tick', gain: 0.1}, {at: p.d + 14, kind: 'tick', gain: 0.1}, {at: p.d + 28, kind: 'tick', gain: 0.1}, {at: p.passLand, kind: 'chime', gain: 0.24},
    {at: p.e - 2, kind: 'whoosh-short', gain: 0.1}, {at: p.e + p.drop.dur, kind: 'tap', gain: 0.18}];
};

/* ---------- loop ---------- */

const LOOP_NODES: {who: Who; name: string; t: string}[] = [
  {who: 'res', name: '调研员', t: '每周一：找收藏最多的 3 条'},
  {who: 'wri', name: '文案', t: '写成一张提示词卡'},
  {who: 'dev', name: '开发', t: '加到页面顶部，不发布'},
  {who: 'me', name: '作者', t: '批准了，才上线'},
];
const loopPlan = (cue: Cue) => {
  const [a, b, c, d, e, g, h] = [cue('a', 86), cue('b', 151), cue('c', 172), cue('d', 188), cue('e', 208), cue('f', 254), cue('g', 319)];
  return {a, b, c, d, e, g, h, lands: [b, c, d, e]};
};
const Loop: Scene = ({f, cue}) => {
  const p = loopPlan(cue);
  const t = S(f);
  const slotY = (i: number) => 230 + i * 165;
  const ringC: P2 = [440, 520], R = 220;
  return <Root>
    <div style={{display: 'flex', alignItems: 'center', gap: 18}}>
      <svg width={74} height={74} viewBox="0 0 84 84" style={{transform: `rotate(${f * 2.4}deg)`}}>
        <circle cx={42} cy={42} r={30} stroke={INK} strokeWidth={7} fill="none" strokeDasharray="150 40" strokeLinecap="round" />
        <path d="M64 14 L72 26 L58 30" stroke={INK} strokeWidth={7} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <Rise f={f} at={2}><Big size={66}>存成 Loop，每周照跑</Big></Rise>
    </div>
    <div style={{position: 'absolute', left: 0, top: 120, width: 880, height: 820, backgroundImage: `radial-gradient(${INK}33 2px, transparent 2px)`, backgroundSize: '34px 34px', opacity: 0.8}} />
    <Rise f={f} at={p.a} style={{position: 'absolute', right: 0, top: 136}}>
      <div style={{fontFamily: font, fontWeight: 700, fontSize: 34, color: INK, padding: '8px 22px', borderRadius: 30, border: `3px solid ${INK}`, background: paper.bg,
        transform: `scale(${1 - 0.08 * hitOf(f, [p.a + 4], 1)})`}}>＋ 添加节点</div>
    </Rise>
    {/* connectors: a column first, then the ring */}
    <svg width={880} height={960} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
      {[1, 2, 3].map((i) => {
        const pr = draw(f, p.lands[i] + 4, 8) * (1 - clamp((f - p.h) / 8));
        return <path key={i} d={`M110 ${slotY(i - 1) + 120} L110 ${slotY(i) - 6}`} stroke={A} strokeWidth={5} strokeLinecap="round" strokeDasharray={50} strokeDashoffset={50 * (1 - pr)} opacity={pr > 0 ? 1 : 0} />;
      })}
      <circle cx={ringC[0]} cy={ringC[1]} r={R} fill="none" stroke={A} strokeWidth={5} strokeDasharray={2 * Math.PI * R} strokeDashoffset={2 * Math.PI * R * (1 - draw(f, p.h + 14, 20))} transform={`rotate(-90 ${ringC[0]} ${ringC[1]})`} />
    </svg>
    {LOOP_NODES.map((n, i) => {
      if (f < p.lands[i] - 10) return null;
      const ring = springStep(t, S(p.h + i * 3), {f: 1.6, z: 0.78});
      const ang = (-90 + i * 90) * Math.PI / 180;
      const colX = 50 + 340, colY = slotY(i) + 60;
      const rx = ringC[0] + R * Math.cos(ang), ry = ringC[1] + R * Math.sin(ang);
      const cx = colX + (rx - colX) * ring, cy = colY + (ry - colY) * ring;
      const w = 680 + (130 - 680) * clamp(ring), hgt = 120 + (130 - 120) * clamp(ring);
      // 「在画布上加卡片」: each card is dragged in from the left and lands in its slot on the cue (a slide never
      // crosses the title or the card above it). The spring arrives on the keyword; the small overshoot is the landing.
      const slide = (1 - springStep(t, S(p.lands[i] - 8), {f: 2.2, z: 0.72})) * -760 * (1 - clamp(ring));
      const fall = 0;
      const hit = hitOf(f, [p.lands[i]], 0.6);
      const me = n.who === 'me';
      return <div key={n.who} style={{position: 'absolute', left: cx - w / 2 + slide, top: cy - hgt / 2 - fall, width: w, height: hgt, borderRadius: 26 + 39 * clamp(ring),
        background: me && ring > 0.5 ? matte(B) : ring > 0.5 ? matte(CLAY) : CARD, border: ring > 0.5 ? 'none' : `2px solid ${me ? B : INK}`,
        transform: `scale(${1 + 0.05 * hit}, ${1 - 0.07 * hit})`, display: 'flex', alignItems: 'center', gap: 18, padding: ring > 0.5 ? 0 : '0 22px',
        justifyContent: ring > 0.5 ? 'center' : 'flex-start', boxShadow: '0 12px 22px rgba(60,45,25,0.10)', overflow: 'hidden'}}>
        <div style={{width: 84, height: 84, borderRadius: '44%', background: matte(me ? B : CLAY), display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none'}}>
          <Glyph who={n.who} size={46} c={me ? CARD : INK} />
        </div>
        <div style={{opacity: 1 - clamp(ring * 2.5), whiteSpace: 'nowrap'}}>
          <Big size={40} c={me ? B : INK}>{n.name}</Big>
          <Big size={32} w={500} c={DIM}>{n.t}</Big>
        </div>
      </div>;
    })}
    <div style={{position: 'absolute', left: 60, top: slotY(3) + 140, display: 'flex', alignItems: 'center', gap: 14, ...phaseOp(f, p.g, p.h)}}>
      <svg width={50} height={50} viewBox="0 0 56 56"><path d="M10 10 L46 46 M46 10 L10 46" stroke={INK} strokeWidth={8} strokeLinecap="round" /></svg>
      <Big size={42}>人的卡片：只收，不往下传</Big>
    </div>
    {f >= p.h + 30 && (() => {
      const ang = (-90 + (f - p.h - 30) * 3.2) * Math.PI / 180;
      return <Packet x={ringC[0] + R * Math.cos(ang)} y={ringC[1] + R * Math.sin(ang) + 34} vx={-Math.sin(ang) * 400} vy={Math.cos(ang) * 400} scale={0.8} />;
    })()}
    <Rise f={f} at={p.h + 30} style={{position: 'absolute', left: 0, top: 856, width: 880, textAlign: 'center'}}><Big size={52}>最后<span style={{color: B}}>拍板</span>的，永远是人</Big></Rise>
  </Root>;
};
Loop.camera = (cue) => {
  const p = loopPlan(cue);
  return [cam(0, 330, 100, 1.12), cam(p.a, 740, 160, 1.12), ...p.lands.map((x, i) => cam(x - 6, 380, 290 + i * 165, 1.12)),
    cam(p.g, 300, 860, 1.14), cam(p.h, 440, 520, 1.0), cam(p.h + 40, 440, 600, 1.08)];
};
Loop.sfx = (cue) => {
  const p = loopPlan(cue);
  return [{at: p.a + 4, kind: 'tick', gain: 0.16}, ...p.lands.map((x) => ({at: x, kind: 'tap', gain: 0.16})), {at: p.g, kind: 'thud', gain: 0.2}, {at: p.h, kind: 'whoosh', gain: 0.16}];
};

/* ---------- lessons ---------- */

const lessonsPlan = (cue: Cue) => {
  const [a, b, c, d, e] = [cue('a', 83), cue('b', 132), cue('c', 281), cue('d', 321), cue('e', 352)];
  return {a, b, c, d, e, chain2: cue('f', 241), verdict: e + 54, flag: d + 4};
};
const Lessons: Scene = ({f, cue}) => {
  const p = lessonsPlan(cue);
  const t = S(f);
  const items = [
    {at: p.a, t: '第一条消息就给真数据', s: '第一次调研用了网上的数据，只能重做'},
    {at: p.b, t: '一开工就关掉自动插话', s: '不然中途纠正一句，又起一条链'},
    {at: p.c, t: '给审核员一个终点', s: '线上终审，5 行内给 PASS 或 FAIL'},
  ];
  // The knob's two edges ride different springs, so it stretches while it slides from ON to OFF.
  const knob = twoEdge(t, 0, [{at: S(p.b + 30), to: -56}]);
  const off = f >= p.b + 34;
  const flagLift = dropLift(f, p.flag, 690, 500);
  const passLift = dropLift(f, p.verdict, 930, 600);
  const passHit = hitOf(f, [p.verdict], 1);
  return <Root>
    <Rise f={f} at={2}><Kicker size={32}>作者说：3 件事会改着来</Kicker></Rise>
    {items.map((it, i) => {
      const next = items[i + 1]?.at;
      const dim = next ? 1 - 0.5 * springStep(t, S(next + 4), {f: 2, z: 1}) : 1;
      return <Rise key={it.t} f={f} at={it.at} style={{position: 'absolute', left: 0, top: 80 + i * 250, width: 880}}>
        <div style={{display: 'flex', gap: 26, opacity: dim}}>
          <span style={{fontFamily: num, fontWeight: 900, fontSize: 150, lineHeight: 0.9, color: INK, width: 110}}>{i + 1}</span>
          <div style={{flex: 1}}>
            <Big size={54}>{it.t}</Big>
            <Big size={34} w={500} c={DIM} style={{marginTop: 8}}>{it.s}</Big>
            {i === 1 && <div style={{display: 'flex', alignItems: 'center', gap: 16, marginTop: 16}}>
              <div style={{position: 'relative', width: 116, height: 60, borderRadius: 30, background: off ? LINE : INK}}>
                <div style={{position: 'absolute', top: 6, left: 62 + Math.min(knob.lead, knob.trail), width: 48 + Math.abs(knob.trail - knob.lead), height: 48, borderRadius: 24, background: CARD}} />
              </div>
              <span style={{fontFamily: num, fontSize: 30, color: DIM}}>Agent Proactivity · {off ? 'OFF' : 'ON'}</span>
            </div>}
            {i === 1 && <svg width={300} height={120} style={{position: 'absolute', left: 470, top: 120, overflow: 'visible'}}>
              {[0, 1].map((k) => {
                const pr = k === 0 ? draw(f, p.b + 40, 14) : draw(f, p.chain2, 14);
                return <path key={k} d={`M0 ${30 + k * 50} Q60 ${-10 + k * 50} 120 ${30 + k * 50} Q180 ${70 + k * 50} 240 ${30 + k * 50}`} fill="none" stroke={A} strokeWidth={4}
                  strokeDasharray="10 10" strokeLinecap="round" opacity={pr} strokeDashoffset={0} style={{clipPath: `inset(0 ${(1 - pr) * 100}% 0 0)`}} />;
              })}
            </svg>}
          </div>
        </div>
      </Rise>;
    })}
    {f >= p.flag - 20 && <svg width={80} height={110} viewBox="0 0 80 110" style={{position: 'absolute', left: 760, top: 690 - 110 - flagLift}}>
      <line x1={10} y1={4} x2={10} y2={108} stroke={INK} strokeWidth={5} strokeLinecap="round" />
      {[0, 1, 2, 3, 4, 5].map((k) => <rect key={k} x={12 + (k % 3) * 20} y={6 + Math.floor(k / 3) * 20} width={20} height={20} fill={(k + Math.floor(k / 3)) % 2 ? INK : CARD} stroke={INK} strokeWidth={2} />)}
    </svg>}
    {f >= p.e - 4 && <div style={{position: 'absolute', left: 136, top: 750}}>
      {Array.from({length: 5}, (_, k) => <div key={k} style={{display: 'flex', alignItems: 'center', gap: 12, height: 36, opacity: clamp((f - p.e - k * 8) / 6)}}>
        <Tick p={clamp((f - p.e - k * 8) / 10)} size={30} /><div style={{height: 10, borderRadius: 5, background: INK, opacity: 0.55, width: [180, 260, 220, 300, 150][k]}} />
      </div>)}
    </div>}
    {f >= p.verdict - 20 && <div style={{position: 'absolute', left: 560, top: 930 - 120 - passLift, transform: `rotate(-6deg) scale(${1 + 0.08 * passHit}, ${1 - 0.1 * passHit})`,
      transformOrigin: '50% 100%', fontFamily: num, fontWeight: 900, fontSize: 120, color: INK, lineHeight: 1}}>PASS</div>}
  </Root>;
};
Lessons.camera = (cue) => {
  const p = lessonsPlan(cue);
  return [cam(0, 300, 60, 1.1), cam(p.a, 440, 160, 1.12), cam(p.b, 440, 410, 1.12), cam(p.b + 26, 250, 500, 1.18), cam(p.chain2, 640, 470, 1.16), cam(p.c, 440, 660, 1.1),
    cam(p.flag, 790, 640, 1.16), cam(p.e, 380, 830, 1.12), cam(p.verdict, 700, 860, 1.16)];
};
Lessons.sfx = (cue) => {
  const p = lessonsPlan(cue);
  return [{at: p.a, kind: 'paper', gain: 0.14}, {at: p.b, kind: 'paper', gain: 0.12}, {at: p.b + 30, kind: 'tick', gain: 0.2}, {at: p.c, kind: 'paper', gain: 0.12},
    {at: p.chain2, kind: 'pop', gain: 0.12}, {at: p.flag, kind: 'tap', gain: 0.18}, {at: p.e, kind: 'tick', gain: 0.1}, {at: p.e + 16, kind: 'tick', gain: 0.1}, {at: p.e + 32, kind: 'tick', gain: 0.1}, {at: p.verdict, kind: 'thud', gain: 0.28}];
};

/* ---------- outro ---------- */

const outroPlan = (cue: Cue) => {
  const [a, b, c, d] = [cue('a', 96), cue('b', 159), cue('c', 231), cue('d', 263)];
  const G = 560, AG = 124;
  const hops: Hop[] = [0, 1, 2].map((i) => ({at: 12 + i * 22, dur: 14, from: top(SLOT[i], G, AG), to: top(SLOT[i + 1], G, AG), lift: 80}));
  hops.push({at: a - 16, dur: 16, from: top(SLOT[3], G, AG), to: top(SLOT[4], G, 140), lift: 130});
  return {a, b, c, d, G, AG, hops};
};
const Outro: Scene = ({f, cue}) => {
  const p = outroPlan(cue);
  const card = hopAt(f, p.hops);
  const lands = landsOf(p.hops);
  return <Root>
    <div style={{position: 'absolute', left: 0, top: 30, ...phaseOp(f, 2, p.a + 4)}}><Big size={60}>agent 干活、交接、挑错</Big></div>
    <div style={{position: 'absolute', left: 0, top: 10, ...phaseOp(f, p.a + 8)}}><Big size={110}>你只管<span style={{color: B}}>拍板</span></Big></div>
    <Ground y={p.G} />
    {AGENTS.map((who, i) => <Pebble key={who} who={who} x={SLOT[i]} ground={p.G} size={p.AG} hit={hitOf(f, i > 0 ? [lands[i - 1]] : [], 0.7)} label={NAME[who]} />)}
    <Pebble who="me" x={SLOT[4]} ground={p.G} size={140} hit={hitOf(f, [p.a], 1)} label="你" />
    <svg width={880} height={960} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
      {p.hops.map((h, i) => <path key={i} d={`M${h.from[0]} ${h.from[1] - 70} Q${(h.from[0] + h.to[0]) / 2} ${h.from[1] - 70 - 2 * (h.lift ?? 100)} ${h.to[0]} ${h.to[1] - 70}`}
        fill="none" stroke={A} strokeWidth={4} strokeDasharray="10 12" strokeLinecap="round" opacity={0.7 * draw(f, h.at, h.dur)} />)}
    </svg>
    <Packet x={card.x} y={card.y} vx={card.vx} vy={card.vy} />
    <Rise f={f} at={p.b} style={{position: 'absolute', left: 0, top: 690, width: 880}}><Big size={54}>你最想把哪份活交给 AI 团队？</Big></Rise>
    <Rise f={f} at={p.c} style={{position: 'absolute', left: 0, top: 772}}><Big size={40} w={700} c={DIM}>评论区聊聊</Big></Rise>
    <Rise f={f} at={p.d} style={{position: 'absolute', left: 0, top: 846, width: 880}}>
      <Big size={32} w={500} c={DIM}>内容参考：Rahul（X @sairahul1）</Big>
      <Big size={40} w={900} style={{marginTop: 4}}>原文是 Teamily AI 的合作推广</Big>
    </Rise>
  </Root>;
};
Outro.camera = (cue) => {
  const p = outroPlan(cue);
  return [cam(0, 300, 120, 1.1), ...p.hops.slice(0, 3).map((h) => cam(h.at, h.to[0], 460, 1.12)), cam(p.a - 8, 784, 480, 1.16),
    cam(p.a + 16, 440, 220, 1.06), cam(p.b, 440, 720, 1.1), cam(p.d, 440, 880, 1.1)];
};
Outro.sfx = (cue) => {
  const p = outroPlan(cue);
  return [...landsOf(p.hops).slice(0, 3).map((x) => ({at: x, kind: 'tap', gain: 0.13})), {at: p.a, kind: 'thud', gain: 0.32}];
};

export const aiAgentTeamScenes: Record<string, Scene> = {
  'at.hook': Hook,
  'at.idea': Idea,
  'at.task': Task,
  'at.roles': Roles,
  'at.rules': Rules,
  'at.kickoff': Kickoff,
  'at.pushback': Pushback,
  'at.chain': Chain,
  'at.insight': Insight,
  'at.block': Block,
  'at.fix': Fix,
  'at.human': Human,
  'at.ship': Ship,
  'at.loop': Loop,
  'at.lessons': Lessons,
  'at.outro': Outro,
};
