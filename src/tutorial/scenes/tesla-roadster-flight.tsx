import React from 'react';
import {font, paper} from '../theme';
import {clamp, ease, hash, impulse, springStep, springTrack, toss} from '../../fx';
import {A, B, Big, CARD, Cue, DIM, INK, Kicker, LINE, Num, P2, Promise, Rise, Root, S, Scene, Strike, cam, draw, dropLift, hitOf, layers, num, phaseOp} from '../paper';

// 特斯拉会飞的车？— the Oct 15, 2026 Roadster reveal, told on the director layer (docs/video-craft/archive/导演层.md).
// Storyboard + brief: tutorials/tesla-roadster-flight.storyboard.md. Reference: wheresryan22 "Anatomy" (a line-drawn
// machine on a white sheet, one huge live number, one accent). One line-drawn Roadster runs through the film; the
// only colour on it is the cold-gas thrust (A = 演示, what was actually shown). Everything that was only promised
// sits in dashed green frames (B = 承诺). No official images, no real people, no logos — all drawings are schematic.

const S1 = (f: number) => S(f);

/* ---------- the car (side view, local origin = ground contact between the wheels, length 300 at scale 1) ---------- */

type Pose = {x: number; y: number; rot: number; s: number};
const BODY = 'M-150 -30 L-150 -54 Q-148 -62 -136 -64 L-62 -68 Q-28 -96 12 -97 Q44 -95 74 -72 L142 -56 Q154 -50 154 -38 L152 -30 Z';
const WINDOW = 'M-52 -70 Q-24 -89 10 -90 Q38 -88 60 -72 Z';
const WHEELS = [-95, 95];
/** Ten nozzle positions and the direction they blow (local). */
const NOZZLES: {p: P2; d: P2}[] = [
  {p: [-152, -46], d: [-1, 0]}, {p: [-152, -36], d: [-1, 0.1]},
  {p: [-115, -30], d: [0, 1]}, {p: [-40, -30], d: [0, 1]}, {p: [40, -30], d: [0, 1]}, {p: [115, -30], d: [0, 1]},
  {p: [-20, -96], d: [0, -1]}, {p: [40, -94], d: [0.2, -1]}, {p: [-140, -63], d: [-0.6, -0.8]}, {p: [150, -46], d: [1, 0]},
];
const toWorld = (q: Pose, lx: number, ly: number): P2 => {
  const r = (q.rot * Math.PI) / 180;
  return [q.x + (lx * Math.cos(r) - ly * Math.sin(r)) * q.s, q.y + (lx * Math.sin(r) + ly * Math.cos(r)) * q.s];
};
const dirWorld = (q: Pose, dx: number, dy: number): P2 => {
  const r = (q.rot * Math.PI) / 180;
  return [dx * Math.cos(r) - dy * Math.sin(r), dx * Math.sin(r) + dy * Math.cos(r)];
};

const Car: React.FC<{q: Pose; drawn?: number; wheel?: number; bounce?: number; pitch?: number; nozzles?: number[]; nozzleScale?: number;
  lit?: number[]; cut?: number; tankDrop?: number[]; tankLevel?: number; fan?: number; op?: number}> = ({q, drawn = 1, wheel = 0, bounce = 0, pitch = 0,
  nozzles = [], nozzleScale = 1, lit = [], cut = 0, tankDrop = [], tankLevel = 1, fan = -1, op = 1}) => {
  const wheelsOn = clamp((drawn - 0.55) / 0.3);
  const TANKS: [number, number, number, number][] = [[-128, -58, 74, 22], [-46, -66, 82, 26], [46, -60, 74, 22], [-128, -40, 60, 10], [60, -42, 70, 10]];
  return <g transform={`translate(${q.x} ${q.y}) rotate(${q.rot}) scale(${q.s})`} opacity={op}>
    <g transform={`translate(0 ${bounce}) rotate(${pitch} -95 -26)`}>
      <path d={BODY} fill={CARD} fillOpacity={clamp((drawn - 0.6) / 0.4) * (1 - 0.55 * cut)} stroke={INK} strokeWidth={4} vectorEffect="non-scaling-stroke"
        strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - clamp(drawn / 0.6)} />
      <path d="M-150 -30 L-150 -44 L152 -44 L152 -30 Z" fill={INK} opacity={0.16 * clamp((drawn - 0.6) / 0.4) * (1 - cut)} />
      <path d={WINDOW} fill={INK} fillOpacity={0.82} stroke={INK} strokeWidth={3} vectorEffect="non-scaling-stroke" opacity={clamp((drawn - 0.5) / 0.2) * (1 - cut)} />
      <path d="M-62 -66 L-62 -34 M74 -70 L74 -40" stroke={INK} strokeWidth={2} vectorEffect="non-scaling-stroke" opacity={0.5 * clamp((drawn - 0.7) / 0.2) * (1 - cut)} />
      {/* cutaway: carbon-fibre pressure vessels in every void */}
      {cut > 0 && TANKS.map(([x, y, w, h], i) => {
        const d = tankDrop[i] ?? 0;
        return <g key={i} transform={`translate(0 ${-d})`} opacity={clamp(cut * 2) * (d > 300 ? 0 : 1)}>
          <rect x={x} y={y} width={w} height={h} rx={h / 2} fill={CARD} stroke={INK} strokeWidth={2.5} vectorEffect="non-scaling-stroke" />
          <rect x={x + 3} y={y + h * (1 - tankLevel) + 2} width={w - 6} height={Math.max(0, h * tankLevel - 4)} rx={(h - 4) / 2} fill={A} opacity={0.6} />
        </g>;
      })}
      {fan >= 0 && [-60, 60].map((fx) => <g key={fx} transform={`translate(${fx} -36) rotate(${fan})`}>
        <path d="M-12 0 L12 0 M0 -12 L0 12" stroke={INK} strokeWidth={3} vectorEffect="non-scaling-stroke" /></g>)}
      {nozzles.map((i) => {
        const n = NOZZLES[i];
        const on = lit.includes(i);
        return <rect key={i} x={n.p[0] - 6 * nozzleScale} y={n.p[1] - 5 * nozzleScale} width={12 * nozzleScale} height={10 * nozzleScale} rx={2}
          fill={on ? A : INK} stroke={on ? A : INK} strokeWidth={on ? 6 : 0} vectorEffect="non-scaling-stroke" />;
      })}
    </g>
    {WHEELS.map((wx) => <g key={wx} transform={`translate(${wx} -26)`} opacity={wheelsOn}>
      <circle r={26 * (0.6 + 0.4 * wheelsOn)} fill={INK} stroke={INK} strokeWidth={4} vectorEffect="non-scaling-stroke" />
      <circle r={13} fill={CARD} />
      <g transform={`rotate(${wheel})`}><path d="M-11 0 L11 0 M0 -11 L0 11" stroke={INK} strokeWidth={2.5} vectorEffect="non-scaling-stroke" /></g>
    </g>)}
  </g>;
};

/** Soft contact shadow on the ground (SVG). Smaller and fainter the higher the object is. */
const Shadow: React.FC<{x: number; g: number; w: number; lift?: number}> = ({x, g, w, lift = 0}) => {
  const k = clamp(1 - lift / 520, 0.2, 1);
  return <ellipse cx={x + 6} cy={g + 2} rx={(w / 2) * (0.55 + 0.45 * k)} ry={8 * (0.6 + 0.4 * k)} fill="url(#tr-shadow)" opacity={0.85 * k} />;
};

/** Cold-gas puffs: born every `every` frames at the nozzle's world position, drifting along its direction and fading. */
const Puffs: React.FC<{f: number; from: number; to: number; at: (frame: number) => {p: P2; d: P2}; every?: number; reach?: number; size?: number}> = ({f, from, to, at, every = 2, reach = 140, size = 1}) => {
  const out: React.ReactNode[] = [];
  const life = 16;
  for (let b = Math.max(from, f - life); b <= Math.min(to, f); b += 1) {
    if ((b - from) % every !== 0) continue;
    const u = (f - b) / life;
    const {p, d} = at(b);
    const j = (hash(b * 3.1) - 0.5) * 0.5;
    const dx = d[0] - d[1] * j, dy = d[1] + d[0] * j;
    const dist = 12 + reach * ease.outCubic(u);
    out.push(<circle key={b} cx={p[0] + dx * dist} cy={p[1] + dy * dist} r={(6 + 34 * u) * size} fill={A} fillOpacity={0.28 * (1 - u)} stroke={A} strokeOpacity={0.7 * (1 - u)} strokeWidth={2} />);
  }
  return <>{out}</>;
};

/** The road: a ground line with a faint matte surface below it (one key light from above, so the ground is a shade darker than the sheet). */
const Road: React.FC<{g: number}> = ({g}) => <>
  <rect x={-500} y={g} width={1880} height={800} fill={INK} opacity={0.09} />
  <line x1={-500} x2={1380} y1={g} y2={g} stroke={INK} strokeWidth={2} opacity={0.7} />
</>;

const Stage: React.FC<{children: React.ReactNode}> = ({children}) => (
  <svg width={880} height={960} viewBox="0 0 880 960" style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
    <defs>
      <radialGradient id="tr-shadow"><stop offset="0" stopColor={INK} stopOpacity={0.32} /><stop offset="1" stopColor={INK} stopOpacity={0} /></radialGradient>
    </defs>
    {children}
  </svg>
);

/* ---------- the curved ramp: the car rides the inside of a circle up to fully inverted, pushes off, flips, lands ---------- */

const RAMP = {cx: 480, cy: 500, R: 300, G: 800, s: 0.7};
/** pre: before t0 the car rolls `d` px up to its start line, from frame `at`. */
type RampKeys = {t0: number; tTop: number; tPush: number; tLand: number; s0: number; pre?: {at: number; d: number}};
const rampPose = (f: number, k: RampKeys): Pose & {arc: number} => {
  const {cx, cy, R, G, s} = RAMP;
  const topS = Math.PI * R;
  if (f < k.tPush) {
    const u = ease.inOutCubic(clamp((f - k.t0) / (k.tTop - k.t0)));
    const arc = k.s0 + (topS - k.s0) * u - (k.pre && f < k.t0 ? k.pre.d * (1 - springStep(S1(f), S1(k.pre.at), {f: 1.2, z: 0.9})) : 0);
    if (arc < 0) return {x: cx + arc, y: G, rot: 0, s, arc};
    const phi = Math.PI / 2 - arc / R;
    return {x: cx + R * Math.cos(phi), y: cy + R * Math.sin(phi), rot: (phi * 180) / Math.PI - 90, s, arc};
  }
  const yTop = cy - R;
  if (f < k.tLand) {
    // Pushed off the surface, then gravity: y accelerates; the body flips upright before touchdown.
    const u = clamp((f - k.tPush) / (k.tLand - k.tPush));
    return {x: cx, y: yTop + (G - yTop) * u * u, rot: -180 - 180 * ease.inOutCubic(clamp(u / 0.8)), s, arc: topS};
  }
  const roll = springTrack(S1(f), 0, [{at: S1(k.tLand), to: 80}], {f: 1.1, z: 1});
  return {x: cx + roll, y: G, rot: 0, s, arc: topS + roll};
};
const rampPoint = (phiDeg: number): P2 => [RAMP.cx + RAMP.R * Math.cos((phiDeg * Math.PI) / 180), RAMP.cy + RAMP.R * Math.sin((phiDeg * Math.PI) / 180)];
const Ramp: React.FC<{p?: number}> = ({p = 1}) => {
  const [x0, y0] = rampPoint(100), [x1, y1] = rampPoint(-96);
  return <g>
    <path d={`M${x0} ${y0} A ${RAMP.R} ${RAMP.R} 0 1 0 ${x1} ${y1}`} fill="none" stroke={INK} strokeWidth={9} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - p} />
    <path d={`M${rampPoint(100)[0]} ${rampPoint(100)[1] + 12} A ${RAMP.R + 12} ${RAMP.R + 12} 0 1 0 ${rampPoint(-96)[0]} ${rampPoint(-96)[1] - 12}`} fill="none" stroke={INK} strokeWidth={2}
      opacity={0.5} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - p} />
    {[-70, -40, -10, 20].map((a, i) => {
      const [x, y] = rampPoint(a);
      return <line key={a} x1={x + 14} y1={y} x2={x + 14} y2={RAMP.G} stroke={INK} strokeWidth={2.5} opacity={0.55 * clamp(p * 3 - 1 - i * 0.3)} />;
    })}
  </g>;
};
/** Thrust while pushing off the top: nozzles on the wheel side blow towards the ramp. */
const pushPuffs = (f: number, k: RampKeys) => <>
  {[3, 4].map((n) => <Puffs key={n} f={f} from={k.tPush - 2} to={k.tPush + 10} reach={110}
    at={(b) => {const q = rampPose(b, k); return {p: toWorld(q, NOZZLES[n].p[0], NOZZLES[n].p[1]), d: dirWorld(q, 0, 1)};}} />)}
</>;
const RampCar: React.FC<{f: number; k: RampKeys; drawn?: number; fan?: boolean}> = ({f, k, drawn = 1, fan}) => {
  const q = rampPose(f, k);
  const bounce = 8 * hitOf(f, [k.tLand], 1);
  const lift = RAMP.G - q.y;
  const onArc = f < k.tPush && q.arc >= 0;
  return <>
    {!onArc && <Shadow x={q.x} g={RAMP.G} w={300 * q.s} lift={lift} />}
    {pushPuffs(f, k)}
    <Car q={q} drawn={drawn} wheel={(q.arc / 26) * 57.3} bounce={bounce} nozzles={[3, 4]} lit={f >= k.tPush - 2 && f < k.tPush + 12 ? [3, 4] : []} fan={fan ? f * 24 : -1} />
  </>;
};

/* ---------- hook ---------- */

const hookPlan = (cue: Cue) => {
  const [a, b, c, d, e] = [cue('a', 82), cue('b', 205), cue('c', 288), cue('d', 360), cue('e', 414)];
  const k: RampKeys = {t0: b - 6, tTop: b + 56, tPush: c, tLand: c + 48, s0: -300, pre: {at: a + 20, d: 130}};
  return {a, b, c, d, e, k};
};
const Hook: Scene = ({f, cue, layer}) => {
  const L = layers(layer);
  const p = hookPlan(cue);
  const q = rampPose(f, p.k);
  const qLift = dropLift(f, p.d + 6, q.y - 97 * RAMP.s, 160);
  return <Root>
    {L.hud && <><div style={{position: 'absolute', left: 0, top: 0, width: 880, ...phaseOp(f, 2, p.e)}}>
      <Big size={78}>特斯拉“会飞的车”</Big>
      <Rise f={f} at={p.a + 6} style={{marginTop: 10}}><Kicker size={36} c={INK}>2026-10-15 · 得州 SpaceX 测试场</Kicker></Rise>
    </div>
    <div style={{position: 'absolute', left: 0, top: 0, width: 880, display: 'flex', gap: 60, ...phaseOp(f, p.e + 6)}}>
      <Big size={100} c={A} style={{borderBottom: `8px solid ${A}`}}>演示</Big>
      <Big size={100} c={B} style={{borderBottom: `8px dashed ${B}`}}>承诺</Big>
    </div></>}
    {L.world && <Stage>
      <Road g={RAMP.G} />
      <Ramp p={draw(f, p.a + 10, 34)} />
      <RampCar f={f} k={p.k} drawn={clamp(f / 60)} />
    </Stage>}
    {L.world && f >= p.d - 2 && <div style={{position: 'absolute', left: q.x - 40, top: q.y - 97 * RAMP.s - 130 - qLift, width: 80, textAlign: 'center',
      transform: `rotate(${8 * impulse(S1(f), S1(p.d + 6), {f: 1.5, z: 0.2})}deg)`, transformOrigin: '50% 100%'}}><Num size={130}>?</Num></div>}
  </Root>;
};
Hook.sfx = (cue) => {
  const p = hookPlan(cue);
  return [{at: 4, kind: 'paper', gain: 0.18}, {at: p.a + 20, kind: 'whoosh-short', gain: 0.08}, {at: p.k.t0 + 4, kind: 'whoosh', gain: 0.16}, {at: p.c - 2, kind: 'whoosh-short', gain: 0.2},
    {at: p.k.tLand, kind: 'thud', gain: 0.32}, {at: p.d + 6, kind: 'tap', gain: 0.2}, {at: p.e + 6, kind: 'tick', gain: 0.16}];
};
Hook.camera = (cue) => {
  const p = hookPlan(cue);
  return [cam(0, 200, 780, 1.4), cam(p.a, 440, 470, 1.0), cam(p.a + 60, 360, 560, 1.06), cam(p.b, 600, 420, 1.06), cam(p.k.tTop - 10, 480, 300, 1.12), cam(p.c + 10, 480, 600, 1.04),
    cam(p.k.tLand, 480, 520, 1.0), cam(p.e, 440, 400, 1.08)];
};

/* ---------- ramp (the same stunt, explained) ---------- */

const rampPlan = (cue: Cue) => {
  const [a, b, c, d] = [cue('a', 40), cue('b', 88), cue('c', 197), cue('d', 270)];
  return {a, b, c, d, k: {t0: a, tTop: b + 64, tPush: c, tLand: d + 26, s0: -320} as RampKeys};
};
const RampScene: Scene = ({f, cue, layer}) => {
  const L = layers(layer);
  const p = rampPlan(cue);
  const q = rampPose(f, p.k);
  const suction = f >= p.b && f < p.k.tPush;
  return <Root>
    {L.hud && <div style={{position: 'absolute', left: 0, top: 0, width: 880}}>
      <Kicker size={34}>演示 1 · 弧形坡道</Kicker>
      <div style={{position: 'relative', height: 110, marginTop: 8}}>
        <div style={{position: 'absolute', inset: 0, ...phaseOp(f, p.a, p.b + 6)}}><Big size={68}>冲上坡道</Big></div>
        <div style={{position: 'absolute', inset: 0, ...phaseOp(f, p.b + 8, p.c + 2)}}><Big size={68}>风扇把车吸在路面上</Big></div>
        <div style={{position: 'absolute', inset: 0, ...phaseOp(f, p.c + 4, p.d + 2)}}><Big size={68} c={A}>推进器一推</Big></div>
        <div style={{position: 'absolute', inset: 0, ...phaseOp(f, p.d + 4)}}><Big size={68}>翻身，四轮落地</Big></div>
      </div>
    </div>}
    {L.world && <Stage>
      <Road g={RAMP.G} />
      <Ramp />
      {suction && [-50, 0, 50].map((lx, i) => {
        // suction arrows: from the car's floor towards the ramp surface (local +y)
        const a0 = toWorld(q, lx, -20), d = dirWorld(q, 0, 1);
        const pulse = 0.5 + 0.5 * Math.sin((f - p.b) / 3 + i);
        const len = 26 + 10 * pulse;
        return <g key={i} opacity={clamp((f - p.b) / 8)}>
          <line x1={a0[0]} y1={a0[1]} x2={a0[0] + d[0] * len} y2={a0[1] + d[1] * len} stroke={INK} strokeWidth={3} />
          <path d={`M${a0[0] + d[0] * len - d[1] * 7 - d[0] * 8} ${a0[1] + d[1] * len + d[0] * 7 - d[1] * 8} L${a0[0] + d[0] * (len + 4)} ${a0[1] + d[1] * (len + 4)} L${a0[0] + d[0] * len + d[1] * 7 - d[0] * 8} ${a0[1] + d[1] * len - d[0] * 7 - d[1] * 8}`}
            fill="none" stroke={INK} strokeWidth={3} strokeLinejoin="round" />
        </g>;
      })}
      <RampCar f={f} k={p.k} fan={suction} />
    </Stage>}
  </Root>;
};
RampScene.sfx = (cue) => {
  const p = rampPlan(cue);
  return [{at: p.a + 2, kind: 'whoosh', gain: 0.16}, {at: p.c - 2, kind: 'whoosh-short', gain: 0.2}, {at: p.k.tLand, kind: 'thud', gain: 0.32}];
};
RampScene.camera = (cue) => {
  const p = rampPlan(cue);
  return [cam(0, 300, 200, 1.06), cam(p.a + 20, 640, 520, 1.06), cam(p.b + 30, 520, 300, 1.14), cam(p.c, 480, 330, 1.16), cam(p.c + 24, 480, 560, 1.04),
    cam(p.k.tLand - 6, 480, 520, 1.0), cam(p.k.tLand + 30, 440, 360, 1.12)];
};

/* ---------- jump over five vehicles ---------- */

const FLEET: {name: string; d: string}[] = [
  {name: 'Cybercab', d: 'M-48 0 L-48 -18 Q-40 -38 -10 -42 Q24 -42 44 -22 L48 0 Z'},
  {name: 'Cybertruck', d: 'M-56 0 L-56 -24 L0 -50 L56 -28 L56 0 Z'},
  {name: 'Semi', d: 'M-52 0 L-52 -40 L-12 -40 L-12 -74 L28 -74 Q48 -64 52 -42 L52 0 Z'},
  {name: 'Model Y', d: 'M-54 0 L-54 -24 Q-46 -30 -32 -32 L-14 -50 L24 -50 L46 -30 Q54 -26 54 -18 L54 0 Z'},
  {name: 'Model 3', d: 'M-54 0 L-54 -20 L-32 -26 L-12 -42 L22 -42 L42 -26 L54 -22 L54 0 Z'},
];
const FLEET_X = [190, 285, 380, 475, 570];
const jumpPlan = (cue: Cue) => {
  const [a, b, c, d, e] = [cue('a', 70), cue('b', 126), cue('c', 268), cue('d', 336), cue('e', 382)];
  const G = 820, x0 = 30, x1 = 740, lift0 = a + 4, land = c;
  // Hover flight on thrust: rises on a spring, crosses at a steady pace, settles onto the ground on 「短时飞行」.
  const pose = (f: number): Pose => {
    const t = S1(f);
    const up = springStep(t, S1(lift0), {f: 1.3, z: 0.7});
    const down = ease.inCubic(clamp((f - (land - 24)) / 24));
    const h = 250 * up * (1 - down) + (f > lift0 + 20 && f < land - 24 ? 8 * Math.sin((f - lift0) / 9) : 0);
    const xi = f < lift0 ? springTrack(t, -120, [{at: S1(4), to: x0}], {f: 1.2, z: 0.9}) : x0 + (x1 - x0) * ease.inOutCubic(clamp((f - lift0) / (land - lift0)));
    return {x: xi, y: G - h, rot: f > lift0 && f < land ? -3 * Math.sin(Math.PI * clamp((f - lift0) / (land - lift0))) : 0, s: 0.7};
  };
  const passes = FLEET_X.map((vx) => {for (let ff = lift0; ff < land; ff += 1) if (pose(ff).x >= vx) return ff; return land;});
  return {a, b, c, d, e, G, lift0, land, pose, passes};
};
const Jump: Scene = ({f, cue, layer}) => {
  const L = layers(layer);
  const p = jumpPlan(cue);
  const q = p.pose(f);
  const lift = p.G - q.y;
  const cur = p.passes.filter((x) => f >= x).length - 1;
  return <Root>
    {L.hud && <><Kicker size={34}>演示 2 · 行驶中越过车队</Kicker>
    <div style={{position: 'relative', height: 130, marginTop: 8}}>
      <div style={{position: 'absolute', inset: 0, ...phaseOp(f, 2, p.passes[0])}}><Big size={68}>推进器把车托起来</Big></div>
      {FLEET.map((v, i) => <div key={v.name} style={{position: 'absolute', inset: 0, ...phaseOp(f, p.passes[i] - 2, i < 4 ? p.passes[i + 1] - 2 : p.c + 2)}}>
        <Kicker size={30}>越过第 {i + 1} 台</Kicker><div style={{fontFamily: num, fontWeight: 900, fontSize: 76, color: INK, lineHeight: 1.05}}>{v.name}</div></div>)}
      <div style={{position: 'absolute', inset: 0, ...phaseOp(f, p.c + 4, p.d + 2)}}><Big size={68}>特斯拉：“短时飞行”</Big></div>
      <div style={{position: 'absolute', inset: 0, ...phaseOp(f, p.d + 4, p.e)}}><Big size={68}>另外，据报道……</Big></div>
      <div style={{position: 'absolute', inset: 0, ...phaseOp(f, p.e + 4)}}><Kicker size={30}>据报道</Kicker><Big size={68}>演示车是远程遥控的</Big></div>
    </div></>}
    {L.world && <Stage>
      <Road g={p.G} />
      {FLEET.map((v, i) => {
        const dip = 5 * impulse(S1(f), S1(p.passes[i] + 2), {f: 2.6, z: 0.4});
        return <g key={v.name} transform={`translate(${FLEET_X[i]} ${p.G + dip}) scale(0.8)`} opacity={i === cur && f < p.c ? 1 : 0.75}>
          <path d={v.d} fill={CARD} stroke={INK} strokeWidth={3} strokeLinejoin="round" />
          <path d={v.d} fill={INK} opacity={0.1} />
          {[-32, 32].map((wx) => <circle key={wx} cx={wx} cy={-8} r={10} fill={INK} />)}
        </g>;
      })}
      <Shadow x={q.x} g={p.G} w={230} lift={lift} />
      {[2, 3, 4, 5].map((n) => <Puffs key={n} f={f} from={p.lift0 - 4} to={p.land - 2} every={3} reach={Math.max(40, Math.min(160, lift * 0.6))} size={0.8}
        at={(bb) => {const qq = p.pose(bb); return {p: toWorld(qq, NOZZLES[n].p[0], NOZZLES[n].p[1]), d: [0, 1]};}} />)}
      <Car q={q} wheel={(q.x / 16) * 57.3} bounce={6 * hitOf(f, [p.land], 1) - 4 * impulse(S1(f), S1(p.lift0 - 6), {f: 3, z: 0.5})} nozzles={[2, 3, 4, 5]}
        lit={f >= p.lift0 - 4 && f < p.land ? [2, 3, 4, 5] : []} />
      {f >= p.e && (() => {
        const [ax, ay] = toWorld(q, 20, -97);
        const k = clamp((f - p.e) / 10);
        return <g opacity={k}>
          <line x1={ax} y1={ay} x2={ax} y2={ay - 44} stroke={INK} strokeWidth={3} /><circle cx={ax} cy={ay - 46} r={5} fill={INK} />
          {[0, 1, 2].map((r) => <path key={r} d={`M${ax - 16 - r * 12} ${ay - 60 - r * 10} Q${ax} ${ay - 76 - r * 16} ${ax + 16 + r * 12} ${ay - 60 - r * 10}`} fill="none" stroke={INK}
            strokeWidth={3} opacity={((f - p.e) / 6 + r) % 3 < 1.6 ? 1 : 0.25} />)}
        </g>;
      })()}
    </Stage>}
  </Root>;
};
Jump.sfx = (cue) => {
  const p = jumpPlan(cue);
  return [{at: p.lift0 - 4, kind: 'whoosh', gain: 0.2}, ...p.passes.filter((_, i) => i % 2 === 0).map((x) => ({at: x, kind: 'whoosh-short', gain: 0.08})),
    {at: p.land, kind: 'thud', gain: 0.32}, {at: p.e, kind: 'tick', gain: 0.16}];
};
Jump.camera = (cue) => {
  const p = jumpPlan(cue);
  return [cam(0, 200, 700, 1.1), cam(p.lift0 + 6, 220, 380, 1.0), ...p.passes.map((x, i) => cam(x - 6, FLEET_X[i], 660 - i * 30, 1.04 + i * 0.02)), cam(p.land - 4, 480, 280, 0.98),
    cam(p.d, 700, 700, 1.1)];
};

/* ---------- gas: where the thrust comes from ---------- */

const gasPlan = (cue: Cue) => {
  const [a, b, c, d, e] = [cue('a', 40), cue('b', 114), cue('c', 149), cue('d', 245), cue('e', 358)];
  return {a, b, c, d, e, ten: d + 49, G: 760, q: {x: 440, y: 760, rot: 0, s: 2.3} as Pose};
};
const Gas: Scene = ({f, cue, layer}) => {
  const L = layers(layer);
  const p = gasPlan(cue);
  const t = S1(f);
  // the cutaway opens on 「压缩空气」 and closes again once the tanks are refilled, handing the whole car to the next shot
  const cut = springStep(t, S1(p.b + 6), {f: 1.6, z: 1}) - springStep(t, S1(p.e + 50), {f: 1.6, z: 1});
  const tankDrop = [0, 1, 2, 3, 4].map((i) => dropLift(f, p.c + 8 + i * 7, 0, 90)); // local units: × 2.3 on screen
  const vol = Math.round(600 * clamp(springStep(t, S1(p.d), {f: 1.4, z: 1})));
  const litN = Array.from({length: 10}, (_, i) => i).filter((i) => f >= p.ten + i * 3);
  const level = f < p.e ? 1 : springTrack(t, 1, [{at: S1(p.e), to: 0.25}, {at: S1(p.e + 22), to: 1}], {f: 1.2, z: 1});
  return <Root>
    {L.hud && <><div style={{position: 'absolute', left: 0, top: 0, width: 880}}>
      <Kicker size={34}>推力从哪来</Kicker>
      <div style={{display: 'flex', gap: 40, marginTop: 12, alignItems: 'baseline'}}>
        <Rise f={f} at={p.a}><Big size={52} w={700} c={DIM}><Strike p={draw(f, p.a + 14, 10)}>螺旋桨</Strike></Big></Rise>
        <Rise f={f} at={p.a + 20}><Big size={52} w={700} c={DIM}><Strike p={draw(f, p.a + 34, 10)}>燃烧</Strike></Big></Rise>
      </div>
      <Rise f={f} at={p.b} style={{marginTop: 14}}><Big size={92} c={A}>压缩空气</Big></Rise>
    </div>
    <div style={{position: 'absolute', right: 0, top: 130, textAlign: 'right', ...phaseOp(f, p.d + 4)}}>
      <Num size={150}>{vol}<span style={{fontSize: 60}}> 升</span></Num>
      <Big size={44} w={700} style={{marginTop: 6}}>碳纤维高压气瓶{litN.length > 0 && <> · <span style={{fontFamily: num}}>{litN.length}</span> 个推进器</>}</Big>
    </div>
    <Rise f={f} at={p.c + 6} style={{position: 'absolute', left: 0, top: 290}}><Big size={44} w={700} style={{opacity: f >= p.d ? 0 : 1}}>能塞的空间都塞满气瓶</Big></Rise>
    </>}
    {L.world && <Stage>
      <Road g={p.G} />
      <Shadow x={p.q.x} g={p.G} w={640} />
      {f >= p.ten && f < p.ten + 40 && NOZZLES.map((n, i) => <Puffs key={i} f={f} from={p.ten + i * 3} to={p.ten + i * 3 + 6} reach={90} size={1.2}
        at={() => ({p: toWorld(p.q, n.p[0], n.p[1]), d: dirWorld(p.q, n.d[0] / Math.hypot(...n.d), n.d[1] / Math.hypot(...n.d))})} />)}
      <Car q={p.q} cut={cut} tankDrop={tankDrop} tankLevel={level} nozzles={f >= p.d - 4 ? [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] : []} nozzleScale={0.8} lit={litN}
        bounce={2 * hitOf(f, [p.c + 8 + 28], 0.6)} />
      {f >= p.e - 4 && (() => {
        const [cx, cy] = toWorld(p.q, 118, -48);
        return <g transform={`translate(${cx} ${cy}) rotate(${(f - p.e) * 18})`} opacity={clamp((f - p.e + 4) / 6)}>
          <circle r={22} fill={CARD} stroke={INK} strokeWidth={3} />
          {[0, 1, 2, 3].map((k) => <path key={k} d="M0 0 L0 -18" stroke={INK} strokeWidth={3} transform={`rotate(${k * 90})`} />)}
        </g>;
      })()}
    </Stage>}
  </Root>;
};
Gas.sfx = (cue) => {
  const p = gasPlan(cue);
  return [{at: p.a + 14, kind: 'tick', gain: 0.14}, {at: p.a + 34, kind: 'tick', gain: 0.14}, {at: p.b + 6, kind: 'paper', gain: 0.16},
    {at: p.c + 8, kind: 'tap', gain: 0.16}, {at: p.c + 22, kind: 'tap', gain: 0.14}, {at: p.c + 36, kind: 'tap', gain: 0.14}, {at: p.d + 20, kind: 'tick', gain: 0.14},
    {at: p.ten, kind: 'whoosh-short', gain: 0.2}, {at: p.e, kind: 'whoosh-short', gain: 0.12}, {at: p.e + 52, kind: 'paper', gain: 0.14}];
};
Gas.camera = (cue) => {
  const p = gasPlan(cue);
  return [cam(0, 300, 150, 1.12), cam(p.a + 30, 440, 640, 1.22), cam(p.b, 300, 200, 1.1), cam(p.c, 440, 600, 1.08), cam(p.d, 600, 420, 1.1), cam(p.ten, 440, 580, 1.02), cam(p.e, 600, 420, 1.16)];
};

/* ---------- speed ---------- */

const speedPlan = (cue: Cue) => {
  const [a, b] = [cue('a', 49), cue('b', 166)];
  return {a, b, go: a + 8, four: b + 92, G: 760};
};
const Speed: Scene = ({f, cue, layer}) => {
  const L = layers(layer);
  const p = speedPlan(cue);
  const t = S1(f);
  const tt = Math.max(0, t - S1(p.go));
  const x = 200 + 0.5 * 9000 * tt * tt;
  const vx = 9000 * tt;
  const sec = clamp((f - p.go) / 24.3) * 0.81;
  const squat = -6 * impulse(t, S1(p.a), {f: 2.5, z: 0.6});
  const q: Pose = {x, y: p.G, rot: 0, s: 1.05};
  const tire = springTrack(t, 0, [{at: S1(p.b + 4), to: 130}], {f: 1.6, z: 0.8});
  const thrust = springTrack(t, 0, [{at: S1(p.b + 14), to: 130 * 4.5}], {f: 1.1, z: 0.75}) + 14 * impulse(t, S1(p.four), {f: 2.5, z: 0.3});
  return <Root>
    {L.hud && <><Kicker size={34}>演示 3 · 加速</Kicker>
    <div style={{position: 'absolute', right: 0, top: 70, textAlign: 'right', ...phaseOp(f, 0, p.b)}}>
      <Kicker size={34} c={INK}>0–60 英里/小时 · 现场实测</Kicker>
      <Num size={230} c={f >= p.go ? INK : LINE}>{sec.toFixed(2)}<span style={{fontSize: 80}}> 秒</span></Num>
      <div style={{height: 6, background: LINE, marginTop: 10, width: 560, marginLeft: 'auto'}}><div style={{height: 6, width: `${(sec / 0.81) * 100}%`, background: INK}} /></div>
    </div>
    <div style={{position: 'absolute', right: 0, top: 70, textAlign: 'right', ...phaseOp(f, p.b + 4)}}>
      <Kicker size={34} c={INK}>特斯拉说 · 推力 / 抓地力</Kicker>
      <Num size={230} c={A}>4–5<span style={{fontSize: 80}}> 倍</span></Num>
    </div></>}
    {L.world && <Stage>
      <Road g={p.G} />
      {x < 1100 && <Shadow x={x} g={p.G} w={300} />}
      <Puffs f={f} from={p.go - 2} to={p.go + 18} reach={180} size={1.2} at={(bb) => {
        const t2 = Math.max(0, S1(bb) - S1(p.go)); const xx = 200 + 0.5 * 9000 * t2 * t2;
        return {p: toWorld({x: xx, y: p.G, rot: 0, s: 1.05}, -152, -42), d: [-1, 0]};
      }} />
      {x < 1200 && <g opacity={1}>
        {vx > 600 && [1, 2, 3].map((k) => <g key={k} opacity={0.22 * (1 - k / 4)}><Car q={{...q, x: x - vx * 0.014 * k}} nozzles={[0, 1]} /></g>)}
        <Car q={q} wheel={((x - 200) / 26) * 57.3} pitch={squat} nozzles={[0, 1]} lit={f >= p.go - 2 && f < p.go + 18 ? [0, 1] : []} />
      </g>}
      {f >= p.b && <g>
        <Car q={{x: 160, y: 900, rot: 0, s: 0.5}} nozzles={[0, 1]} op={clamp((f - p.b) / 8)} />
        {[{y: 830, len: tire, c: INK, label: '轮胎抓地力'}, {y: 760, len: thrust, c: A, label: '推进器推力'}].map((ar) => ar.len > 2 && <g key={ar.label}>
          <line x1={240} y1={ar.y} x2={240 + ar.len} y2={ar.y} stroke={ar.c} strokeWidth={18} strokeLinecap="round" />
          <path d={`M${240 + ar.len - 18} ${ar.y - 16} L${240 + ar.len + 4} ${ar.y} L${240 + ar.len - 18} ${ar.y + 16}`} fill="none" stroke={ar.c} strokeWidth={12} strokeLinejoin="round" />
          <text x={250} y={ar.y - 22} fontFamily={font} fontWeight={900} fontSize={40} fill={ar.c}>{ar.label}</text>
        </g>)}
      </g>}
    </Stage>}
  </Root>;
};
Speed.sfx = (cue) => {
  const p = speedPlan(cue);
  return [{at: p.go - 2, kind: 'whoosh', gain: 0.24}, {at: p.go + 24, kind: 'tick', gain: 0.18}, {at: p.b + 4, kind: 'tick', gain: 0.12}, {at: p.b + 14, kind: 'whoosh-short', gain: 0.12},
    {at: p.four, kind: 'tap', gain: 0.16}];
};
Speed.camera = (cue) => {
  const p = speedPlan(cue);
  return [cam(0, 260, 640, 1.1), cam(p.go + 4, 600, 300, 1.08), cam(p.b, 260, 860, 1.3), cam(p.four, 480, 700, 0.98)];
};

/* ---------- trims ---------- */

const leave = (p: {d: number}) => p.d + 80;
const trimsPlan = (cue: Cue) => {
  const [a, b, c, d] = [cue('a', 46), cue('b', 129), cue('c', 242), cue('d', 336)];
  return {a, b, c, d, G: 700};
};
const TRIMS = [
  {k: 'a', name: 'Performance', tag: '能上路', price: '$50,000', unit: '订金'},
  {k: 'b', name: 'Thrust', tag: '带后置推进器', price: '$250,000', unit: '订金'},
  {k: 'c', name: 'Rocket', tag: '单座 · 全套飞行系统', price: '仅限邀请', unit: ''},
];
const Trims: Scene = ({f, cue, layer}) => {
  const L = layers(layer);
  const p = trimsPlan(cue);
  const t = S1(f);
  const at = [p.a, p.b, p.c];
  const retract = f >= p.d ? clamp(springStep(t, S1(p.d + 6), {f: 2, z: 0.9})) : 0;
  const nozzles = retract > 0.98 ? [] : f >= p.c ? [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] : f >= p.b ? [0, 1] : [];
  const grow = f >= p.c ? springStep(t, S1(p.c), {f: 2.4, z: 0.6}) : springStep(t, S1(p.b), {f: 2.4, z: 0.6});
  // the road car (no thrusters) drives off on its wheels at the end, clearing the stage for the promises
  const tl0 = leave(p), tl = Math.max(0, t - S1(tl0));
  const q: Pose = {x: 440 + 0.5 * 3600 * tl * tl, y: p.G, rot: 0, s: 1.6};
  const puffFrom = f >= p.c ? p.c + 6 : p.b + 6;
  return <Root>
    {L.hud && <><Kicker size={34}>订车 · 三个版本</Kicker>
    <div style={{position: 'relative', height: 300, marginTop: 10}}>
      {TRIMS.map((tr, i) => <div key={tr.name} style={{position: 'absolute', inset: 0, ...phaseOp(f, at[i], i < 2 ? at[i + 1] - 2 : p.d - 2)}}>
        <div style={{display: 'flex', alignItems: 'baseline', gap: 18}}>
          <span style={{fontFamily: num, fontWeight: 900, fontSize: 64, color: INK}}>{tr.name}</span>
          <Big size={40} w={700} c={DIM}>{tr.tag}</Big>
        </div>
        <div style={{display: 'flex', alignItems: 'baseline', gap: 14, marginTop: 12}}>
          <Num size={tr.unit ? 140 : 110}>{tr.price}</Num>{tr.unit && <Big size={44} w={700}>{tr.unit}</Big>}
        </div>
      </div>)}
    </div></>}
    {L.world && <Stage>
      <Road g={p.G} />
      <Shadow x={q.x} g={p.G} w={480} />
      {f >= p.b && f < p.d && (f >= p.c ? NOZZLES : NOZZLES.slice(0, 2)).map((n, i) => <Puffs key={i} f={f} from={puffFrom} to={puffFrom + 6} reach={70}
        at={() => ({p: toWorld(q, n.p[0], n.p[1]), d: dirWorld(q, n.d[0] / Math.hypot(...n.d), n.d[1] / Math.hypot(...n.d))})} />)}
      <Car q={q} wheel={((q.x - 440) / 42) * 57.3} pitch={-4 * impulse(t, S1(tl0 - 5), {f: 2.5, z: 0.6})} nozzles={nozzles} nozzleScale={(0.4 + 0.6 * clamp(grow)) * (1 - retract)} lit={[]} bounce={3 * hitOf(f, [p.a, p.b + 4, p.c + 4, p.d + 14], 0.7)} />
    </Stage>}
    {L.hud && <Rise f={f} at={p.d + 4} style={{position: 'absolute', left: 0, top: 52, width: 880}}>
      <Kicker size={34} c={INK}>中国官网 · 只开放 Performance</Kicker>
      <div style={{display: 'flex', alignItems: 'baseline', gap: 14, marginTop: 4}}><Big size={44} w={700}>意向金</Big><Num size={130}>¥332,000</Num></div>
    </Rise>}
  </Root>;
};
Trims.sfx = (cue) => {
  const p = trimsPlan(cue);
  return [{at: p.a + 6, kind: 'tick', gain: 0.14}, {at: p.b + 4, kind: 'pop', gain: 0.14}, {at: p.b + 6, kind: 'whoosh-short', gain: 0.12},
    {at: p.c + 4, kind: 'pop', gain: 0.14}, {at: p.c + 6, kind: 'whoosh-short', gain: 0.14}, {at: p.d + 4, kind: 'tick', gain: 0.14}, {at: p.d + 14, kind: 'tap', gain: 0.14}, {at: leave(p), kind: 'whoosh', gain: 0.16}];
};
Trims.camera = (cue) => {
  const p = trimsPlan(cue);
  return [cam(0, 440, 500, 1.0), cam(p.a, 300, 180, 1.1), cam(p.b, 200, 560, 1.12), cam(p.b + 40, 440, 380, 0.98), cam(p.c, 440, 560, 1.08), cam(p.c + 40, 560, 300, 1.04),
    cam(p.d, 400, 820, 1.2), cam(p.d + 44, 440, 360, 0.98), cam(leave(p), 700, 560, 1.06), cam(leave(p) + 24, 440, 260, 1.0)];
};

/* ---------- claims: what was only promised ---------- */

const claimsPlan = (cue: Cue) => {
  const [a, b, c] = [cue('a', 72), cue('b', 145), cue('c', 184)];
  return {a, b, c};
};
const Claims: Scene = ({f, cue, layer}) => {
  const L = layers(layer);
  const p = claimsPlan(cue);
  const items = [{at: p.a, n: '230+', u: '英里/小时 · 最高时速'}, {at: p.b, n: '300', u: '英里 · 续航'}, {at: p.c, n: '2028', u: '年 · 投产'}];
  return <Root>
    {L.hud && <><Kicker size={34}>现场没有演示</Kicker>
    <Big size={92} style={{marginTop: 6}}>这些是<span style={{color: B}}>承诺</span></Big></>}
    {L.hud && items.map((it, i) => {
      const g = 220 + i * 200 + 170;
      const x = springTrack(S1(f), -980, [{at: S1(it.at - 6), to: 0}], {f: 1.7, z: 0.78});
      const hit = hitOf(f, [it.at + 4], 1);
      if (f < it.at - 8) return null;
      return <div key={it.n} style={{position: 'absolute', left: x, top: g - 170, width: 880, transform: `scale(${1 - 0.05 * hit}, ${1 + 0.03 * hit})`, transformOrigin: '100% 50%'}}>
        <Promise style={{display: 'flex', alignItems: 'baseline', gap: 22, height: 150}}>
          <Num size={120} c={B}>{it.n}</Num><Big size={44} w={700}>{it.u}</Big>
        </Promise>
      </div>;
    })}
  </Root>;
};
Claims.camera = (cue) => {
  const p = claimsPlan(cue);
  return [cam(0, 440, 260, 1.05), cam(p.a - 8, 440, 480, 1.0), cam(p.b - 8, 440, 300, 1.05), cam(p.c - 8, 440, 480, 0.98)];
};
Claims.sfx = (cue) => {
  const p = claimsPlan(cue);
  return [p.a, p.b, p.c].map((x) => ({at: x + 4, kind: 'paper', gain: 0.2}));
};

/* ---------- history: the delivery flag keeps getting pushed ---------- */

const X = (yr: number) => 40 + (yr - 2017) * 62;
const historyPlan = (cue: Cue) => {
  const [a, b, c, d, e, g, h, k] = [cue('a', 48), cue('b', 109), cue('c', 180), cue('d', 240), cue('e', 264), cue('f', 285), cue('g', 338), cue('h', 411)];
  const delays = [{yr: 2020, at: c}, {yr: 2021, at: d}, {yr: 2023, at: e}, {yr: 2024, at: g}];
  // 「甚至不保证一定交付」: the flag tips over to the left under gravity and lies on the axis (contact = topple + 13).
  return {a, b, c, d, e, g, h, k, delays, final: g + 26, AX: 560, topple: k + 2, down: k + 2 + Math.round(Math.sqrt(90 / 450) * 30)};
};
const History: Scene = ({f, cue, layer}) => {
  const L = layers(layer);
  const p = historyPlan(cue);
  const t = S1(f);
  const flagX = springTrack(t, X(2020), [...p.delays.map((dl, i) => ({at: S1(dl.at + 2), to: X(2020) + (i + 1) * 95})), {at: S1(p.final), to: X(2028)}], {f: 1.8, z: 0.62});
  const flagV = (springTrack(t + 0.02, X(2020), [...p.delays.map((dl, i) => ({at: S1(dl.at + 2), to: X(2020) + (i + 1) * 95})), {at: S1(p.final), to: X(2028)}], {f: 1.8, z: 0.62}) - flagX) / 0.02;
  const flagLift = dropLift(f, p.b + 4, p.AX, 260);
  const lean = clamp(-flagV / 60, -18, 18);
  const pushes = [...p.delays.map((dl) => dl.at + 2), p.final];
  const tf = Math.max(0, t - S1(p.topple));
  const fall = 3 * impulse(t, S1(p.topple - 6), {f: 3, z: 0.5}) - Math.min(90, 0.5 * 900 * tf * tf) + 5 * impulse(t, S1(p.down), {f: 3.2, z: 0.45});
  return <Root>
    {L.hud && <><Kicker size={34}>为什么打个问号</Kicker>
    <div style={{display: 'flex', alignItems: 'baseline', gap: 20, marginTop: 8}}>
      <Rise f={f} at={p.a}><Num size={110}>2017</Num></Rise>
      <div style={{position: 'relative', width: 420, height: 110}}>
        <div style={{position: 'absolute', left: 0, top: 0, ...phaseOp(f, p.b + 10, p.c + 22)}}><Num size={110} c={B}><Strike p={draw(f, p.c, 10)} c={INK} w={8}>→ 2020</Strike></Num></div>
        <div style={{position: 'absolute', left: 0, top: 0, ...phaseOp(f, p.final + 6)}}><Num size={110} c={B}>→ 2028</Num></div>
      </div>
    </div>
    {f >= p.c && <div style={{position: 'absolute', right: 40, top: 0, textAlign: 'right', ...phaseOp(f, p.c, p.final)}}>
      <Kicker size={34}>推迟</Kicker>
      <Num size={150} style={{transform: `scale(${1 + 0.08 * hitOf(f, p.delays.map((dl) => dl.at + 2), 1)})`, transformOrigin: '100% 100%'}}>
        {p.delays.filter((dl) => f >= dl.at + 2).length}<span style={{fontSize: 60}}> 次</span></Num>
    </div>}</>}
    {L.world && <Stage>
      <line x1={X(2017) - 20} x2={X(2017) - 20 + 760 * draw(f, p.a, 20)} y1={p.AX} y2={p.AX} stroke={INK} strokeWidth={4} />
      {Array.from({length: 12}, (_, i) => <line key={i} x1={X(2017 + i)} x2={X(2017 + i)} y1={p.AX - 8} y2={p.AX + 8} stroke={INK} strokeWidth={2} opacity={draw(f, p.a + i * 1.5, 6)} />)}
      <circle cx={X(2017)} cy={p.AX} r={14 * clamp(springStep(t, S1(p.a + 6), {f: 2.4, z: 0.55}), 0, 1.2)} fill={INK} />
      <text x={X(2017) - 10} y={p.AX + 110} fontFamily={font} fontWeight={900} fontSize={40} fill={INK} opacity={draw(f, p.a + 10, 8)}>首次亮相</text>
      {/* each delay stamps an × on the axis */}
      {p.delays.map((dl, i) => {
        const lift = dropLift(f, dl.at, p.AX, 240);
        if (f < dl.at - 12) return null;
        return <g key={dl.yr} transform={`translate(${X(dl.yr)} ${p.AX - lift})`}>
          <path d="M-15 -15 L15 15 M15 -15 L-15 15" stroke={INK} strokeWidth={8} strokeLinecap="round" />
          <text x={0} y={i % 2 ? 110 : 64} textAnchor="middle" fontFamily={num} fontWeight={800} fontSize={40} fill={INK} opacity={draw(f, dl.at + 6, 8)}>{dl.yr}</text>
        </g>;
      })}
      {/* the delivery flag (a promise: dashed green), pushed right on every delay; the pole leans with its speed */}
      {f >= p.b - 18 && <g transform={`translate(${flagX} ${p.AX - flagLift}) rotate(${lean + 6 * hitOf(f, pushes, 0.6) + fall})`}>
        <line x1={0} y1={0} x2={0} y2={-190} stroke={B} strokeWidth={5} strokeLinecap="round" />
        <path d="M0 -190 L130 -165 L0 -138 Z" fill={CARD} stroke={B} strokeWidth={4} strokeDasharray="10 7" />
        <text x={14} y={-156} fontFamily={font} fontWeight={900} fontSize={30} fill={B}>{f >= p.final ? '投产' : '交付'}</text>
      </g>}
          </Stage>}
    {L.hud && <Rise f={f} at={p.h} style={{position: 'absolute', left: 0, top: 730, width: 880}}>
      <Promise><Kicker size={30} c={B}>订车协议</Kicker><Big size={44}>不保证交付日期，<br />甚至不保证一定交付</Big></Promise>
    </Rise>}
  </Root>;
};
History.sfx = (cue) => {
  const p = historyPlan(cue);
  return [{at: p.a, kind: 'paper', gain: 0.16}, {at: p.b + 4, kind: 'tap', gain: 0.2}, ...p.delays.map((dl) => ({at: dl.at, kind: 'pop', gain: 0.14})),
    {at: p.final, kind: 'whoosh-short', gain: 0.14}, {at: p.h + 4, kind: 'paper', gain: 0.16}, {at: p.down, kind: 'thud', gain: 0.26}];
};
History.camera = (cue) => {
  const p = historyPlan(cue);
  return [cam(0, 200, 120, 1.14), cam(p.a, 140, 600, 1.15), cam(p.b, 300, 400, 1.0), cam(p.c, 300, 600, 1.15), cam(p.d, 440, 400, 0.98), cam(p.g, 520, 600, 1.15), cam(p.final, 560, 480, 1.0),
    cam(p.h, 440, 480, 0.96), cam(p.k - 10, 620, 580, 1.15), cam(p.down + 2, 440, 300, 1.0)];
};

/* ---------- outro ---------- */

const outroPlan = (cue: Cue) => {
  const [a, b, c, d] = [cue('a', 75), cue('b', 176), cue('c', 253), cue('d', 365)];
  return {a, b, c, d, G: 520, hop: a + 4, land: a + 36};
};
const Outro: Scene = ({f, cue, layer}) => {
  const L = layers(layer);
  const p = outroPlan(cue);
  const t = S1(f);
  const tossP = toss(t, {at: S1(p.hop), dur: S1(p.land - p.hop), from: [440, p.G], to: [440, p.G], lift: 90});
  const rot = f >= p.hop && f < p.land ? -360 * ease.inOutCubic(clamp((f - p.hop) / (p.land - p.hop))) : 0;
  const go = p.d + 70, tg = Math.max(0, t - S1(go));
  const off = 0.5 * 4200 * tg * tg;
  const q: Pose = {x: 440 + off, y: tossP.y, rot, s: 1.1};
  const centre = toWorld({x: 440, y: tossP.y, rot: 0, s: 1.1}, 0, -60);
  // rotate around the body's centre, not the wheels
  const qc: Pose = {...q, x: centre[0] + (Math.sin((rot * Math.PI) / 180) * 66), y: centre[1] + Math.cos((rot * Math.PI) / 180) * 66};
  return <Root>
    {L.hud && <><div style={{position: 'absolute', left: 0, top: 0, width: 880, ...phaseOp(f, 2, p.c - 2)}}>
      <Big size={64}>不是在天上开的车</Big>
      <Rise f={f} at={p.a + 4}><Big size={48} w={700} style={{marginTop: 8}}>是能用压缩空气跳一下的超跑</Big></Rise>
    </div>
    <div style={{position: 'absolute', left: 0, top: 0, width: 880, ...phaseOp(f, p.c)}}>
      <Kicker size={32}>马斯克说过</Kicker><Big size={60} style={{marginTop: 6}}>“安全不是它的首要目标”</Big>
    </div></>}
    {L.world && <Stage>
      <Road g={p.G} />
      {off < 700 && <Shadow x={440 + off} g={p.G} w={330} lift={p.G - tossP.y} />}
      <Puffs f={f} from={go - 2} to={go + 14} reach={150} at={(bb) => {
        const t2 = Math.max(0, S1(bb) - S1(go));
        return {p: toWorld({x: 440 + 0.5 * 4200 * t2 * t2, y: p.G, rot: 0, s: 1.1}, -152, -42), d: [-1, 0]};
      }} />
      {[2, 3, 4, 5].map((n) => <Puffs key={n} f={f} from={p.hop - 3} to={p.hop + 6} reach={110}
        at={() => ({p: toWorld({x: 440, y: p.G, rot: 0, s: 1.1}, NOZZLES[n].p[0], NOZZLES[n].p[1]), d: [n < 4 ? -1 : 1, -0.15]})} />)}
      {off < 700 && <Car q={f >= p.hop && f < p.land ? qc : q} nozzles={[0, 1, 2, 3, 4, 5]} lit={f >= p.hop - 3 && f < p.hop + 8 ? [2, 3, 4, 5] : f >= go - 2 && f < go + 16 ? [0, 1] : []}
        wheel={(off / 29) * 57.3} pitch={-5 * impulse(t, S1(go - 6), {f: 2.5, z: 0.6})}
        bounce={7 * hitOf(f, [p.land], 1) - 5 * impulse(t, S1(p.hop - 8), {f: 3, z: 0.5})} />}
    </Stage>}
    {L.hud && <><Rise f={f} at={p.b} style={{position: 'absolute', left: 0, top: 580, width: 820}}>
      <div style={{display: 'flex', gap: 24}}>
        <div style={{flex: 1, border: `4px solid ${A}`, borderRadius: 12, padding: '16px 24px'}}><Big size={56} c={A}>演示</Big><Big size={40} w={700}>是真的</Big></div>
        <Promise style={{flex: 1}}><Big size={56} c={B}>承诺</Big><Big size={40} w={700}>2028 量产</Big></Promise>
      </div>
    </Rise>
    <Rise f={f} at={p.d} style={{position: 'absolute', left: 0, top: 820, width: 820}}>
      <Big size={52}>2028 年见分晓，你会订吗？</Big>
      <Kicker size={24} style={{marginTop: 10, letterSpacing: 1}}>资料：TechCrunch · Fox Business · 英为财情 · 每经 · 网易<br />画面为示意，非官方素材</Kicker>
    </Rise></>}
  </Root>;
};
Outro.sfx = (cue) => {
  const p = outroPlan(cue);
  return [{at: p.hop - 3, kind: 'whoosh-short', gain: 0.2}, {at: p.land, kind: 'thud', gain: 0.3}, {at: p.b, kind: 'tick', gain: 0.14}, {at: p.c, kind: 'paper', gain: 0.12}, {at: p.d + 68, kind: 'whoosh', gain: 0.18}];
};
Outro.camera = (cue) => {
  const p = outroPlan(cue);
  return [cam(0, 440, 200, 1.12), cam(p.a - 6, 440, 460, 1.0), cam(p.land + 10, 440, 480, 1.0), cam(p.land + 34, 440, 300, 1.25), cam(p.b - 6, 420, 470, 1.0), cam(p.c, 460, 460, 1.02), cam(p.c + 24, 360, 220, 1.12), cam(p.d - 14, 440, 480, 1.0), cam(p.d + 70, 700, 520, 1.16)];
};

export const teslaRoadsterScenes: Record<string, Scene> = {
  'tr.hook': Hook,
  'tr.ramp': RampScene,
  'tr.jump': Jump,
  'tr.gas': Gas,
  'tr.speed': Speed,
  'tr.trims': Trims,
  'tr.claims': Claims,
  'tr.history': History,
  'tr.outro': Outro,
};
for (const sc of Object.values(teslaRoadsterScenes)) sc.hud = true;

// Paper colour constant kept for the cover background when this file is read alone.
export const TR_PAPER = paper.bg;
