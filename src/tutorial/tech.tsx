// Shared building blocks for blueprint-look tutorials (look.theme: "blueprint") — tech topics, per
// docs/video-craft/发布与风格偏好.md §二. Flat navy panels, pale engineering lines, mono read-outs, two accents (A/B).
// The centrepiece is the context machine: a rack of slots (the context window), a model chip on the right and a
// gantry crane on a rail that lowers blocks into the slots — every placement is a contact frame (tap + squash).
import React from 'react';
import {blueprint, font, mono} from './theme';
import {clamp, ease, impulse, springStep, springTrack} from '../fx';
import {S} from './paper';

export const BG = blueprint.bg, PANEL = blueprint.panel, PANEL_HI = blueprint.panelHi, INK = blueprint.ink, DIM = blueprint.dim, LINE = blueprint.line;
export const A = blueprint.keyA, B = blueprint.keyB;
export {mono};

export const Big: React.FC<{size?: number; c?: string; w?: number; style?: React.CSSProperties; children: React.ReactNode}> = ({size = 68, c = INK, w = 900, style, children}) => (
  <div style={{fontFamily: font, fontWeight: w, fontSize: size, lineHeight: 1.15, color: c, letterSpacing: 1, ...style}}>{children}</div>
);
/** Small mono label (section numbers, units, status). */
export const Mono: React.FC<{size?: number; c?: string; w?: number; style?: React.CSSProperties; children: React.ReactNode}> = ({size = 26, c = DIM, w = 600, style, children}) => (
  <div style={{fontFamily: mono, fontWeight: w, fontSize: size, color: c, letterSpacing: 1, ...style}}>{children}</div>
);
export const Num: React.FC<{size?: number; c?: string; style?: React.CSSProperties; children: React.ReactNode}> = ({size = 120, c = INK, style, children}) => (
  <div style={{fontFamily: mono, fontWeight: 800, fontSize: size, lineHeight: 1, color: c, letterSpacing: -2, ...style}}>{children}</div>
);
export const Root: React.FC<{children: React.ReactNode}> = ({children}) => <div style={{position: 'relative', width: 880, height: 800}}>{children}</div>;
export const Stage: React.FC<{children: React.ReactNode}> = ({children}) => (
  <svg width={880} height={800} viewBox="0 0 880 800" style={{position: 'absolute', inset: 0, overflow: 'visible'}}>{children}</svg>
);
/** A mono number that counts to `to` over `dur` frames from `at` (ease-out), formatted with thousands separators. */
export const count = (f: number, at: number, to: number, dur = 24, from = 0) => Math.round(from + (to - from) * ease.outCubic(clamp((f - at) / dur)));
export const fmt = (n: number) => n.toLocaleString('en-US');

/* ---------- the context machine ---------- */

export const RAIL_Y = 250, RACK_Y = 430, RACK_H = 90, SLOT_W = 80, GAP = 8, RACK_X = 20, SLOTS = 8;
export const CHIP = {x: 740, y: 396, w: 104, h: 160};
export const slotX = (i: number) => RACK_X + i * (SLOT_W + GAP);
const HOOK0 = 40, HANG = RAIL_Y + 14;

export type Kind = 'a' | 'b' | 'n';
/** A block that the crane lowers into the rack: contact on frame `at`, occupying `span` slots from `slot`. */
export type Blk = {at: number; slot: number; span?: number; label: string; kind?: Kind; from?: number; width?: number;
  /** after this frame the block is dimmed (Lost in the Middle, not used) */ dimAt?: number;
  /** after this frame the block shrinks to `squeezeTo` slots (compression) */ squeezeAt?: number; squeezeTo?: number;
  /** a block that does not fit: it hits the rack edge at `at` and is thrown back off */ reject?: boolean; tag?: string; tagAt?: number};

/** Neutral blocks are light steel: real mass on the navy sheet without being a third accent. */
export const STEEL = '#cfdbea';
const fillOf = (k: Kind = 'n') => (k === 'a' ? A : k === 'b' ? B : STEEL);
const textOf = () => BG;

/** Where the crane carriage is and how long the hook cable is, for a list of deliveries. */
export const crane = (f: number, jobs: Blk[]) => {
  const t = S(f);
  const keys = jobs.flatMap((j) => [{at: S(j.at - 36), to: j.from ?? -40}, {at: S(j.at - 24), to: slotX(j.slot) + ((j.span ?? 1) * (SLOT_W + GAP) - GAP) / 2}]);
  const x = springTrack(t, 120, keys, {f: 1.6, z: 0.78});
  // the hook goes down in the last 12 frames before each contact (gravity-like), back up over 10 frames after
  let len = HOOK0;
  for (const j of jobs) {
    const depth = RACK_Y + 8 - HANG;
    if (f >= j.at - 12 && f < j.at) len = HOOK0 + (depth - HOOK0) * ease.inCubic((f - (j.at - 12)) / 12);
    else if (f >= j.at && f < j.at + 10) len = depth - (depth - HOOK0) * ease.outCubic((f - j.at) / 10);
  }
  const carrying = jobs.find((j) => f >= j.at - 36 && f < j.at);
  return {x, len, carrying};
};

/** Rough rendered width of a label in em (CJK ≈ 1, latin ≈ 0.56), so a label can shrink to fit its block. */
const ems = (text: string) => [...text].reduce((n, ch) => n + (ch.charCodeAt(0) > 255 ? 1 : 0.56), 0);
export const BlockRect: React.FC<{x: number; y: number; w: number; h?: number; kind?: Kind; label: string; sq?: number; op?: number; size?: number; tag?: string; tagOp?: number}> = ({x, y, w, h = 70, kind, label, sq = 0, op = 1, size: size0 = 28, tag, tagOp = 1}) => {
  const size = Math.min(size0, (w - 14) / Math.max(1, ems(label)));
  return <g opacity={op} transform={`translate(${x + w / 2} ${y + h}) scale(${1 + 0.08 * sq} ${1 - 0.12 * sq}) translate(${-w / 2} ${-h})`}>
    <rect x={0} y={0} width={w} height={h} rx={8} fill={fillOf(kind)} stroke="none" />
    <text x={w / 2} y={h / 2 + size * 0.36} textAnchor="middle" fontFamily={font} fontWeight={800} fontSize={size} fill={textOf()}>{label}</text>
    {tag && <g opacity={tagOp}><rect x={4} y={-26} width={w - 8} height={22} rx={4} fill={BG} stroke={B} strokeWidth={1.5} />
      <text x={w / 2} y={-10} textAnchor="middle" fontFamily={mono} fontWeight={700} fontSize={15} fill={B}>{tag}</text></g>}
  </g>;
};

/** The machine: rail + crane, rack with slots, model chip. `blocks` are lowered in order; `reserve` marks the last n slots. */
export const Machine: React.FC<{f: number; blocks?: Blk[]; reserve?: number; reserveAt?: number; chipOn?: boolean; drawn?: number; chipLabel?: string;
  rackOp?: number; craneAt?: {x: number; len: number}; children?: React.ReactNode}> = ({f, blocks = [], reserve = 0, reserveAt = 0, chipOn = false, drawn = 1,
  chipLabel = 'MODEL', rackOp = 1, craneAt, children}) => {
  const t = S(f);
  const real = blocks.filter((b) => !b.reject);
  // a scene that moves the crane itself (pick-ups that are not rack deliveries) passes its position in `craneAt`
  const cr = craneAt ? {...craneAt, carrying: undefined as Blk | undefined} : crane(f, blocks);
  // a rack slot sinks a little when something lands in it or next to it (secondary response, 3 frames late)
  const sink = (i: number) => real.reduce((s, b) => s + (i >= b.slot - 1 && i <= b.slot + (b.span ?? 1) ? 2.5 * impulse(t, S(b.at + 3), {f: 3, z: 0.45}) : 0), 0);
  return <g>
    {/* rail and crane */}
    <line x1={-10} x2={860 * drawn - 10} y1={RAIL_Y} y2={RAIL_Y} stroke={B} strokeWidth={6} strokeLinecap="round" />
    {Array.from({length: 18}, (_, i) => <line key={i} x1={i * 50} x2={i * 50} y1={RAIL_Y - 10} y2={RAIL_Y} stroke={B} strokeWidth={2} opacity={0.5 * clamp(drawn * 18 - i)} />)}
    <g opacity={clamp(drawn * 2 - 1)}>
      <rect x={cr.x - 34} y={RAIL_Y - 14} width={68} height={28} rx={6} fill={BG} stroke={B} strokeWidth={3} />
      <line x1={cr.x} x2={cr.x} y1={HANG} y2={HANG + cr.len} stroke={B} strokeWidth={3} />
      <path d={`M${cr.x - 14} ${HANG + cr.len} L${cr.x + 14} ${HANG + cr.len}`} stroke={B} strokeWidth={4} strokeLinecap="round" />
    </g>
    {/* rack */}
    <g opacity={rackOp}>
      {Array.from({length: SLOTS}, (_, i) => {
        const x = slotX(i);
        const k = clamp(drawn * SLOTS - i);
        const isReserve = reserve > 0 && i >= SLOTS - reserve && f >= reserveAt;
        return <g key={i} transform={`translate(0 ${sink(i)})`} opacity={k}>
          <rect x={x} y={RACK_Y} width={SLOT_W} height={RACK_H} rx={6} fill={BG} stroke={isReserve ? A : LINE} strokeWidth={2} strokeDasharray={isReserve ? '8 6' : undefined} />
          <text x={x + SLOT_W / 2} y={RACK_Y + RACK_H + 26} textAnchor="middle" fontFamily={mono} fontSize={15} fill={DIM}>{String(i).padStart(2, '0')}</text>
        </g>;
      })}
      {/* dimension line under the rack: the capacity */}
      <g opacity={clamp(drawn * 2 - 1)}>
        <line x1={RACK_X} x2={slotX(SLOTS - 1) + SLOT_W} y1={RACK_Y + RACK_H + 44} y2={RACK_Y + RACK_H + 44} stroke={DIM} strokeWidth={1.5} />
        {[RACK_X, slotX(SLOTS - 1) + SLOT_W].map((x) => <line key={x} x1={x} x2={x} y1={RACK_Y + RACK_H + 36} y2={RACK_Y + RACK_H + 52} stroke={DIM} strokeWidth={1.5} />)}
      </g>
    </g>
    {/* model chip: flat amber body, pins, a status light that is on only while the model works */}
    <g opacity={clamp(drawn * 2 - 0.6)}>
      {Array.from({length: 6}, (_, i) => <g key={i}>
        <line x1={CHIP.x - 12} x2={CHIP.x} y1={CHIP.y + 20 + i * 24} y2={CHIP.y + 20 + i * 24} stroke={A} strokeWidth={4} />
        <line x1={CHIP.x + CHIP.w} x2={CHIP.x + CHIP.w + 10} y1={CHIP.y + 20 + i * 24} y2={CHIP.y + 20 + i * 24} stroke={A} strokeWidth={4} />
      </g>)}
      <rect x={CHIP.x} y={CHIP.y} width={CHIP.w} height={CHIP.h} rx={10} fill={A} />
      <rect x={CHIP.x + 14} y={CHIP.y + 14} width={CHIP.w - 28} height={CHIP.h - 28} rx={6} fill="none" stroke={BG} strokeWidth={2} opacity={0.5} />
      <text x={CHIP.x + CHIP.w / 2} y={CHIP.y + CHIP.h / 2 + 8} textAnchor="middle" fontFamily={mono} fontWeight={800} fontSize={22} fill={BG}>{chipLabel}</text>
      <circle cx={CHIP.x + CHIP.w - 20} cy={CHIP.y + 20} r={6} fill={chipOn ? '#fff4dc' : BG} opacity={chipOn ? 1 : 0.6} />
    </g>
    {/* blocks */}
    {blocks.map((b, i) => {
      const span = b.span ?? 1;
      const fullW = span * (SLOT_W + GAP) - GAP;
      const w = b.width ?? fullW;
      if (f < b.at - 36) return null;
      if (f < b.at) {
        // carried: hanging under the hook
        if (cr.carrying !== b) return null;
        return <BlockRect key={i} x={cr.x - w / 2} y={HANG + cr.len + 4} w={w} kind={b.kind} label={b.label} />;
      }
      if (b.reject) {
        // hits the full rack's edge and is thrown back up and off to the left
        const u = (f - b.at) / 30;
        if (u > 1) return null;
        const x0 = cr.x - w / 2;
        return <g key={i} transform={`rotate(${-40 * u} ${x0 + w / 2} ${RACK_Y})`}>
          <BlockRect x={x0 - 260 * u} y={RACK_Y - 60 - 200 * u + 360 * u * u} w={w} kind={b.kind} label={b.label} op={1 - u * 0.6} sq={impulse(t, S(b.at), {f: 3, z: 0.4})} /></g>;
      }
      const squeezed = b.squeezeAt !== undefined && f >= b.squeezeAt
        ? springStep(t, S(b.squeezeAt), {f: 2.2, z: 0.75}) : 0;
      const ww = squeezed ? w + ((b.squeezeTo ?? 1) * (SLOT_W + GAP) - GAP - w) * squeezed : w;
      const dim = b.dimAt !== undefined && f >= b.dimAt ? clamp((f - b.dimAt) / 12) : 0;
      return <BlockRect key={i} x={slotX(b.slot)} y={RACK_Y + 10} w={ww} kind={b.kind} label={b.label} sq={impulse(t, S(b.at), {f: 3.2, z: 0.42})}
        op={1 - 0.65 * dim} tag={b.tag} tagOp={b.tagAt !== undefined ? clamp((f - b.tagAt) / 8) : 1} />;
    })}
    {children}
  </g>;
};

/** A dark panel with a mono caption tab (figures, cards, terminals). */
export const Panel: React.FC<{x: number; y: number; w: number; h: number; tab?: string; c?: string; dashed?: boolean; op?: number; children?: React.ReactNode}> = ({x, y, w, h, tab, c = LINE, dashed, op = 1, children}) => (
  <g opacity={op}>
    <rect x={x} y={y} width={w} height={h} rx={10} fill={PANEL} stroke={c} strokeWidth={2} strokeDasharray={dashed ? '9 7' : undefined} />
    {tab && <text x={x + 16} y={y - 10} fontFamily={mono} fontWeight={700} fontSize={20} fill={c === LINE ? DIM : c}>{tab}</text>}
    {children}
  </g>
);

/** Status line in mono at the bottom of the figure (the reference's "F miss · evicting C · 4 of 7 hit"). */
export const Status: React.FC<{y?: number; children: React.ReactNode}> = ({y = 640, children}) => (
  <div style={{position: 'absolute', left: 0, top: y, width: 880, fontFamily: mono, fontSize: 26, fontWeight: 600, color: DIM, letterSpacing: 1}}>{children}</div>
);
