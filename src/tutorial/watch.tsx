// A schematic mechanical watch movement for anatomy-explain (blueprint look). Drawn, not traced: barrel → centre →
// third → fourth wheel → escape pinion mesh directly (same module, so neighbours roll without slipping), the escape
// wheel is released one tooth per balance swing by the pallet fork, and the balance swings on its hairspring.
// Everything is driven by one number, `beats` (balance beats since the scene started): the balance crosses its
// centre on every whole beat, which is the frame the fork flips and the whole train steps forward.
import React from 'react';
import {clamp, ease} from '../fx';
import {A, BG, DIM, LINE, PANEL, STEEL} from './tech';
import {font, mono} from './theme';

export type PartId = 'barrel' | 'center' | 'third' | 'fourth' | 'escape' | 'fork' | 'balance';
export const PARTS: PartId[] = ['barrel', 'center', 'third', 'fourth', 'escape', 'fork', 'balance'];
export const PART_NAME: Record<PartId, string> = {barrel: '发条盒', center: '中心轮', third: '三轮', fourth: '四轮', escape: '擒纵轮', fork: '擒纵叉', balance: '摆轮'};

const M = 4; // module: pitch radius = M · teeth / 2
type Gear = {id: PartId; n: number; r: number; x: number; y: number; sign: 1 | -1; ratio: number; phase: number};
const deg = Math.PI / 180;
const chain = (() => {
  // [id, teeth, direction from the previous arbor in degrees]
  const spec: [PartId, number, number][] = [['barrel', 48, 0], ['center', 30, -30], ['third', 24, 20], ['fourth', 20, -45], ['escape', 10, -60]];
  const out: Gear[] = [];
  spec.forEach(([id, n, dir], i) => {
    const r = (M * n) / 2;
    if (i === 0) { out.push({id, n, r, x: 250, y: 640, sign: 1, ratio: 1, phase: 0}); return; }
    const p = out[i - 1];
    const d = p.r + r;
    const x = p.x + d * Math.cos(dir * deg), y = p.y + d * Math.sin(dir * deg);
    // Rolling contact: this gear turns -(n_prev / n) as fast as the previous one. Phase so a tooth of the previous
    // gear sits in a gap of this one on the line of centres (checked on a zoomed still).
    const pitchP = 360 / p.n, pitch = 360 / n;
    const offP = (((dir - p.phase) % pitchP) + pitchP) % pitchP; // previous gear's tooth offset at the contact, degrees
    const phase = dir + 180 + (offP * p.n) / n + pitch / 2;
    out.push({id, n, r, x, y, sign: (p.sign * -1) as 1 | -1, ratio: (p.ratio * p.n) / n, phase});
  });
  return out;
})();
export const GEAR: Record<string, Gear> = Object.fromEntries(chain.map((g) => [g.id, g]));
const ESC = GEAR.escape;
export const BALANCE = {x: 430, y: 330, r: 96};
export const FORK = {x: 531, y: 435};
export const SUBDIAL = {x: 668, y: 322, r: 58};
export const PLATE = {x: 440, y: 500, r: 302};
/** Where each part sits, for labels, question tags and the camera. */
export const PART_AT: Record<PartId, {x: number; y: number; r: number}> = {
  barrel: {x: GEAR.barrel.x, y: GEAR.barrel.y, r: GEAR.barrel.r}, center: {x: GEAR.center.x, y: GEAR.center.y, r: GEAR.center.r},
  third: {x: GEAR.third.x, y: GEAR.third.y, r: GEAR.third.r}, fourth: {x: GEAR.fourth.x, y: GEAR.fourth.y, r: GEAR.fourth.r},
  escape: {x: ESC.x, y: ESC.y, r: 50}, fork: {x: FORK.x, y: FORK.y, r: 40}, balance: {x: BALANCE.x, y: BALANCE.y, r: BALANCE.r}};

/** Beats elapsed at frame f when the beat rate (beats per second) follows rate(frame). Summed per frame: deterministic. */
export const beatsAt = (f: number, rate: (frame: number) => number, fps = 30) => {
  let b = 0;
  const whole = Math.floor(f);
  for (let i = 0; i < whole; i += 1) b += rate(i) / fps;
  return b + ((f - whole) * rate(whole)) / fps;
};
/** A rate that eases from `a` to `b` over [f0, f1] (beats per second). A real 28,800 bph movement beats 8 times a second. */
export const rampRate = (a: number, b: number, f0: number, f1: number) => (fr: number) => a + (b - a) * ease.inOutCubic(clamp((fr - f0) / Math.max(1, f1 - f0)));

/** The escape wheel's angle: 12° (half a tooth of 15) per beat, each step a quick spring with a little overshoot. */
const STEP = 0.32; // fraction of a beat the step takes
const stepped = (beats: number) => {
  const n = Math.floor(beats), k = clamp((beats - n) / STEP);
  return n + ease.outBack(k, 1.3);
};
export const motionOf = (beats: number) => {
  const s = stepped(beats);
  const esc = 12 * s;
  const n = Math.floor(beats);
  const flip = ease.outCubic(clamp((beats - n) / STEP));
  const side = n % 2 === 0 ? 1 : -1;
  return {
    esc,
    gear: (id: PartId) => {
      const g = GEAR[id];
      return g ? g.phase + g.sign * esc * (ESC.n / g.n) * (ESC.sign) : 0;
    },
    balance: 150 * Math.sin(Math.PI * beats), // ±150°, through the centre on every whole beat
    fork: 8 * side * (2 * flip - 1) * -1,
    seconds: 0.75 * s, // 360° / 60 s / 8 beats
    stepKick: 1 - clamp((beats - n) / STEP), // 1 on the contact frame, fading through the step
  };
};

const gearPath = (r: number, n: number, add = M * 0.95, ded = M * 1.15) => {
  const p = (2 * Math.PI) / n, ra = r + add, rd = r - ded;
  const pts: string[] = [];
  for (let k = 0; k < n; k += 1) {
    const t = k * p;
    for (const [rr, a] of [[rd, t - 0.32 * p], [ra, t - 0.14 * p], [ra, t + 0.14 * p], [rd, t + 0.32 * p]] as [number, number][]) pts.push(`${(rr * Math.cos(a)).toFixed(2)} ${(rr * Math.sin(a)).toFixed(2)}`);
  }
  return `M${pts.join(' L')} Z`;
};
const escapePath = (r: number, n = 15) => {
  const p = (2 * Math.PI) / n, rd = r - 11;
  const pts: string[] = [];
  for (let k = 0; k < n; k += 1) {
    const t = k * p;
    for (const [rr, a] of [[rd, t], [r - 2, t + 0.48 * p], [r, t + 0.62 * p], [rd + 2, t + 0.8 * p]] as [number, number][]) pts.push(`${(rr * Math.cos(a)).toFixed(2)} ${(rr * Math.sin(a)).toFixed(2)}`);
  }
  return `M${pts.join(' L')} Z`;
};
const PATHS: Record<string, string> = Object.fromEntries(chain.map((g) => [g.id, gearPath(g.r, g.n)]));
const ESC_PATH = escapePath(50);
const spiral = (r0: number, r1: number, turns: number, twist: (s: number) => number, steps = 120) => {
  const pts: string[] = [];
  for (let i = 0; i <= steps; i += 1) {
    const s = i / steps;
    const a = s * turns * 2 * Math.PI + twist(s);
    const r = r1 + (r0 - r1) * s;
    pts.push(`${(r * Math.cos(a)).toFixed(1)} ${(r * Math.sin(a)).toFixed(1)}`);
  }
  return `M${pts.join(' L')}`;
};

export type PartLook = {fill?: string; op?: number; lift?: number; dx?: number; dy?: number; sq?: number; /** extra scale about the part's centre */ k?: number};
/**
 * The movement. `beats` drives all motion; `stop` overrides a part's angle source (frozen beats for that part);
 * `look` colours / dims / moves single parts (highlight = A, exploded view = dx/dy/lift); `wind` turns the barrel's
 * arbor (winding) and tightens the mainspring.
 */
export const Movement: React.FC<{beats: number; look?: Partial<Record<PartId, PartLook>>; partBeats?: Partial<Record<PartId, number>>; wind?: number;
  plateOp?: number; subdial?: boolean; spring?: string; x?: number; y?: number; s?: number}> = ({beats, look = {}, partBeats = {}, wind = 0, plateOp = 1, subdial = true, spring, x = 0, y = 0, s = 1}) => {
  const m = (id: PartId) => motionOf(partBeats[id] ?? beats);
  const L = (id: PartId) => look[id] ?? {};
  const body = (id: PartId) => L(id).fill ?? STEEL;
  const wrap = (id: PartId, cx: number, cy: number, children: React.ReactNode) => {
    const l = L(id);
    const lift = l.lift ?? 0;
    return <g key={id} opacity={l.op ?? 1} transform={`translate(${cx + (l.dx ?? 0)} ${cy + (l.dy ?? 0) - lift}) scale(${(l.k ?? 1) * (1 + 0.05 * (l.sq ?? 0))} ${(l.k ?? 1) * (1 - 0.07 * (l.sq ?? 0))})`}>
      {lift > 2 && <ellipse cx={6} cy={lift + 10} rx={40} ry={8} fill="#000" opacity={clamp(0.25 - lift / 600)} />}
      {children}
    </g>;
  };
  const gear = (id: PartId) => {
    const g = GEAR[id];
    const a = m(id).gear(id);
    const fill = body(id);
    const spokes = id === 'escape' ? 0 : g.n >= 30 ? 5 : 4;
    return wrap(id, g.x, g.y, <g transform={`rotate(${a})`}>
      <path d={PATHS[id]} fill={fill} />
      {spokes > 0 && <>
        <circle r={g.r - M * 1.15 - 9} fill={BG} />
        {Array.from({length: spokes}, (_, k) => <rect key={k} x={0} y={-6} width={g.r - M * 1.15 - 6} height={12} fill={fill} transform={`rotate(${(360 / spokes) * k})`} />)}
      </>}
      <circle r={Math.max(9, g.r * 0.16)} fill={fill} />
      <circle r={4} fill={BG} />
      {id === 'barrel' && <g>
        <circle r={g.r * 0.62} fill={PANEL} />
        <path d={spiral(g.r * 0.58, 12, 4.2 + 1.4 * wind, (s2) => s2 * wind * 2)} fill="none" stroke={spring ?? fill} strokeWidth={3.2} strokeLinecap="round" />
        <circle r={12} fill={fill} />
      </g>}
    </g>);
  };
  const esc = m('escape');
  const fork = m('fork');
  const bal = m('balance');
  return <g transform={`translate(${x} ${y}) scale(${s})`}>
    <g opacity={plateOp}>
      <circle cx={PLATE.x} cy={PLATE.y} r={PLATE.r} fill={PANEL} stroke={LINE} strokeWidth={3} />
      <circle cx={PLATE.x} cy={PLATE.y} r={PLATE.r - 16} fill="none" stroke={LINE} strokeWidth={1.5} strokeDasharray="4 8" />
      {[0, 1, 2, 3, 4, 5].map((k) => <circle key={k} cx={PLATE.x + (PLATE.r - 34) * Math.cos((k * 60 + 15) * deg)} cy={PLATE.y + (PLATE.r - 34) * Math.sin((k * 60 + 15) * deg)} r={7}
        fill="none" stroke={LINE} strokeWidth={2} />)}
    </g>
    {(['barrel', 'center', 'third', 'fourth'] as PartId[]).map(gear)}
    {/* escape: pinion meshing the fourth wheel + the club-toothed wheel on the same arbor */}
    {wrap('escape', ESC.x, ESC.y, <g transform={`rotate(${esc.gear('escape')})`}>
      <path d={PATHS.escape} fill={body('escape')} opacity={0.7} />
      <path d={`${ESC_PATH} M30 0 A30 30 0 1 0 -30 0 A30 30 0 1 0 30 0 Z`} fillRule="evenodd" fill={body('escape')} stroke={PANEL} strokeWidth={3} />
      {[0, 90, 180, 270].map((a) => <rect key={a} x={0} y={-3.5} width={31} height={7} fill={body('escape')} transform={`rotate(${a})`} />)}
      <circle r={9} fill={body('escape')} />
      <circle r={4} fill={BG} />
    </g>)}
    {/* pallet fork: pivot, anchor arms across the escape wheel, horn reaching the balance roller */}
    {wrap('fork', FORK.x, FORK.y, <g transform={`rotate(${fork.fork})`}>
      <path d={`M0 0 L${BALANCE.x + 16 - FORK.x} ${BALANCE.y + 18 - FORK.y}`} stroke={body('fork')} strokeWidth={9} strokeLinecap="round" />
      <path d="M0 30 L0 0 L30 0" fill="none" stroke={body('fork')} strokeWidth={9} strokeLinecap="round" strokeLinejoin="round" />
      {/* pallet stones, pointing at the escape wheel's centre */}
      <rect x={-5} y={28} width={10} height={16} rx={2} fill={A} transform="rotate(-14 0 36)" />
      <rect x={28} y={-5} width={16} height={10} rx={2} fill={A} transform="rotate(-76 36 0)" />
      <circle r={9} fill={body('fork')} /><circle r={3.5} fill={BG} />
    </g>)}
    {/* balance wheel + hairspring (inner end turns with the balance, outer end held at the stud) */}
    {wrap('balance', BALANCE.x, BALANCE.y, <g>
      <path d={spiral(BALANCE.r * 0.56, 10, 5, (s2) => (bal.balance * deg) * (1 - s2) * 0.9)} fill="none" stroke={look.balance?.fill ?? DIM} strokeWidth={2} transform="rotate(0)" />
      <g transform={`rotate(${bal.balance})`}>
        <circle r={BALANCE.r} fill="none" stroke={body('balance')} strokeWidth={13} />
        {[0, 120, 240].map((a) => <rect key={a} x={0} y={-4} width={BALANCE.r} height={8} fill={body('balance')} transform={`rotate(${a})`} />)}
        {Array.from({length: 10}, (_, k) => <circle key={k} cx={(BALANCE.r + 4) * Math.cos(k * 36 * deg)} cy={(BALANCE.r + 4) * Math.sin(k * 36 * deg)} r={5} fill={body('balance')} />)}
        <circle r={13} fill={body('balance')} />
        <circle cx={16} cy={18} r={5} fill={body('balance')} />
      </g>
      <circle r={5} fill={A} />
    </g>)}
    {subdial && <g opacity={plateOp}>
      <circle cx={SUBDIAL.x} cy={SUBDIAL.y} r={SUBDIAL.r} fill={BG} stroke={LINE} strokeWidth={2.5} />
      {Array.from({length: 60}, (_, k) => {
        const a = k * 6 * deg, r0 = SUBDIAL.r - (k % 5 === 0 ? 13 : 7);
        return <line key={k} x1={SUBDIAL.x + r0 * Math.sin(a)} y1={SUBDIAL.y - r0 * Math.cos(a)} x2={SUBDIAL.x + (SUBDIAL.r - 3) * Math.sin(a)} y2={SUBDIAL.y - (SUBDIAL.r - 3) * Math.cos(a)}
          stroke={k % 5 === 0 ? STEEL : LINE} strokeWidth={k % 5 === 0 ? 2.5 : 1.5} />;
      })}
      <g transform={`translate(${SUBDIAL.x} ${SUBDIAL.y}) rotate(${motionOf(beats).seconds})`}>
        <line x1={0} y1={10} x2={0} y2={-SUBDIAL.r + 10} stroke={STEEL} strokeWidth={3} strokeLinecap="round" />
        <circle r={5} fill={STEEL} />
      </g>
      <text x={SUBDIAL.x} y={SUBDIAL.y + 30} textAnchor="middle" fontFamily={mono} fontSize={13} fill={DIM}>SEC</text>
    </g>}
  </g>;
};

/** A part name tag with a leader line to the part: a solid tag in the explanation colour (B), dark text. */
export const Leader: React.FC<{part: PartId; x: number; y: number; text: string; c: string; op?: number; size?: number}> = ({part, x, y, text, c, op = 1, size = 30}) => {
  const p = PART_AT[part];
  const w = [...text].reduce((n, ch) => n + (ch.charCodeAt(0) > 255 ? 1 : 0.58), 0) * size + 28;
  const ax = x + (x < p.x ? w : 0);
  return <g opacity={op}>
    <path d={`M${ax} ${y} L${p.x + (x < p.x ? -p.r * 0.5 : p.r * 0.5)} ${p.y}`} stroke={c} strokeWidth={2.5} fill="none" />
    <circle cx={p.x + (x < p.x ? -p.r * 0.5 : p.r * 0.5)} cy={p.y} r={5} fill={c} />
    <rect x={x} y={y - size * 0.8} width={w} height={size * 1.6} rx={8} fill={c} />
    <text x={x + w / 2} y={y + size * 0.36} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={size} fill={BG}>{text}</text>
  </g>;
};
