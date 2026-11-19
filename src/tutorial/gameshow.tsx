import React from 'react';
import {clamp, ease} from '../fx';
import {font} from './theme';
import {cond, jet} from './fonts';

// The lemo/game-show drawing kit in Remotion, 9:16 (docs/video-craft/prompt-library/vendor/lemomo-ai__lemo-opuscar/3961ddb/
// styles/game-show/STYLE.md): flat fills, one near-black ink outline, round caps, hard offset shadows, no gradients or
// blur; toy "bean" contestants told apart by colour + one head mark + a name tag; judgement words; everything on a fixed
// tempo grid (BPM → frames per beat). Every value is a pure function of the frame (STYLE §9: no carried state).
// Our own drawing (nothing copied from the demo's code): the bean, the tier shelf and the telops are rewritten here.

export const INK = '#111820';
export const CREAM = '#FFF6E5';
/** Tempo grid: 120 BPM at 30 fps = 15 frames a beat, 60 a bar. */
export const BEAT = 15;
/** 0 → 1 over a beat-phase; a parabola hop of height h px on every beat (offset `off` beats for the off-beat). */
export const hop = (f: number, h: number, off = 0) => {
  const ph = (((f / BEAT + off) % 1) + 1) % 1;
  return -h * 4 * ph * (1 - ph);
};
/** Damped wobble after a hit at `at` (STYLE §5: ~30 rad/s for ~0.35 s). Returns a squash amount in −1…1. */
export const hit = (f: number, at: number) => {
  const t = (f - at) / 30;
  return t < 0 || t > 0.5 ? 0 : Math.cos(t * 30) * Math.exp(-t * 9);
};
/** Back-ease pop 0 → 1 over d frames from `at` (things are either on or popping, never fading). */
export const pop = (f: number, at: number, d = 6) => (f < at ? 0 : ease.outBack(clamp((f - at) / d), 1.8));
/** Drop from the sky: y offset (negative = above) landing exactly at `at`, ease-in over d frames. */
export const drop = (f: number, at: number, d = 10, from = 900) => (f >= at ? 0 : -from * (1 - ease.inCubic(clamp(1 - (at - f) / d))));
/** Frame punch: a small zoom that decays in ~5 frames after each hit frame (sum stays < 0.06). */
export const punch = (f: number, hits: number[], amt = 0.02) => 1 + hits.reduce((s, h) => s + (f >= h && f < h + 8 ? amt * Math.exp(-(f - h) / 2.2) : 0), 0);

/** Outlined telop text in SVG (fill on top of a stroke ≈ 14 % of the size, STYLE §4). */
export const Telop: React.FC<{text: string; size: number; fill?: string; stroke?: string; family?: string; weight?: number; anchor?: 'start' | 'middle' | 'end'; sw?: number; ls?: number}> = ({
  text, size, fill = '#fff', stroke = INK, family = font, weight = 900, anchor = 'start', sw, ls = 0,
}) => {
  const w = Math.ceil(size * units(text) * 1.02 + size * 0.5);
  const h = Math.ceil(size * 1.32);
  const x = anchor === 'start' ? size * 0.2 : anchor === 'middle' ? w / 2 : w - size * 0.2;
  return <svg width={w} height={h} style={{overflow: 'visible', display: 'block'}}>
    <text x={x} y={size * 1.0} textAnchor={anchor} fontFamily={family} fontWeight={weight} fontSize={size} letterSpacing={ls}
      fill={fill} stroke={stroke} strokeWidth={sw ?? size * 0.14 * 2} strokeLinejoin="round" paintOrder="stroke">{text}</text>
  </svg>;
};
export const units = (s: string) => [...s].reduce((w, ch) => w + ((ch.codePointAt(0) ?? 0) < 128 ? (/[0-9]/.test(ch) ? 0.58 : 0.6) : 1), 0);

/** Diagonal stripe set: one saturated hue + the same hue one step lighter, scrolling slowly (STYLE §2 sets). */
export const Stripes: React.FC<{f: number; a: string; b: string; speed?: number; w?: number}> = ({f, a, b, speed = 0.6, w = 70}) => (
  <div style={{position: 'absolute', inset: 0, background: a, overflow: 'hidden'}}>
    <div style={{position: 'absolute', inset: -400, transform: `translateX(${(f * speed) % (w * 2 * 1.414)}px) rotate(-30deg)`,
      backgroundImage: `repeating-linear-gradient(90deg, ${b} 0 ${w}px, transparent ${w}px ${w * 2}px)`}} />
  </div>
);
/** Offset polka dots (~20 % white) on one hue. */
export const Dots: React.FC<{f: number; a: string; dot?: string; step?: number}> = ({f, a, dot = 'rgba(255,255,255,0.12)', step = 90}) => (
  <div style={{position: 'absolute', inset: 0, background: a, overflow: 'hidden'}}>
    <div style={{position: 'absolute', inset: -step * 2, transform: `translateY(${(f * 0.4) % step}px)`,
      backgroundImage: `radial-gradient(${dot} 15px, transparent 16px), radial-gradient(${dot} 15px, transparent 16px)`,
      backgroundSize: `${step}px ${step}px`, backgroundPosition: `0 0, ${step / 2}px ${step / 2}px`}} />
  </div>
);
/** A rotating sunburst (finale / judgement sets). */
export const Rays: React.FC<{f: number; a: string; b: string; cx?: number; cy?: number}> = ({f, a, b, cx = 540, cy = 760}) => {
  const n = 18, R = 2400;
  const paths = Array.from({length: n}, (_, i) => {
    const t0 = (i / n) * Math.PI * 2, t1 = t0 + Math.PI / n;
    return `M${cx} ${cy} L${cx + R * Math.cos(t0)} ${cy + R * Math.sin(t0)} L${cx + R * Math.cos(t1)} ${cy + R * Math.sin(t1)} Z`;
  });
  return <div style={{position: 'absolute', inset: 0, background: a, overflow: 'hidden'}}>
    <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
      <g transform={`rotate(${f * 0.25} ${cx} ${cy})`}>{paths.map((d, i) => <path key={i} d={d} fill={b} />)}</g>
    </svg>
  </div>;
};

/** A box with the kit's ink outline and hard offset shadow (cards 14 px, stickers 10 px). */
export const Card: React.FC<{x: number; y: number; w: number; h: number; fill?: string; r?: number; sh?: number; ow?: number; rot?: number; scale?: number; origin?: string; children?: React.ReactNode; style?: React.CSSProperties}> = ({
  x, y, w, h, fill = CREAM, r = 34, sh = 14, ow = 8, rot = 0, scale = 1, origin = '50% 50%', children, style,
}) => (
  <div style={{position: 'absolute', left: x, top: y, width: w, height: h, transform: `rotate(${rot}deg) scale(${scale})`, transformOrigin: origin, ...style}}>
    <div style={{position: 'absolute', left: sh, top: sh, width: w, height: h, borderRadius: r, background: INK}} />
    <div style={{position: 'absolute', inset: 0, borderRadius: r, background: fill, border: `${ow}px solid ${INK}`, boxSizing: 'border-box', overflow: 'hidden'}}>{children}</div>
  </div>
);

/* ---------- the tier shelf: five rows, label chip on the left ---------- */

export type Tier = {id: string; label: string; color: string};
export const TIERS: Tier[] = [
  {id: 'hang', label: '夯爆了', color: '#E5494D'},
  {id: 'top', label: '顶级', color: '#F76C17'},
  {id: 'rsr', label: '人上人', color: '#D7A520'},
  {id: 'npc', label: 'NPC', color: '#6F7F98'},
  {id: 'la', label: '拉完了', color: '#787878'},
];
export const SHELF = {x: 40, y: 330, rowH: 186, gap: 18, chipW: 214, right: 1040};
/** Baseline (feet y) of row i inside the shelf. */
export const rowFeet = (i: number, s = SHELF) => s.y + i * (s.rowH + s.gap) + s.rowH - 22;
export const rowTop = (i: number, s = SHELF) => s.y + i * (s.rowH + s.gap);
/** The five-row tier shelf; `pops[i]` = frame the row slams in (default: already there). */
export const Shelf: React.FC<{f: number; pops?: number[]; dim?: number[]; s?: typeof SHELF}> = ({f, pops = [], dim = [], s = SHELF}) => <>
  {TIERS.map((t, i) => {
    const at = pops[i] ?? -99;
    if (f < at) return null;
    const p = pop(f, at, 7);
    const y = rowTop(i, s);
    const fade = dim.includes(i) ? 0.45 : 1;
    return <div key={t.id} style={{opacity: fade}}>
      <Card x={s.x} y={y} w={s.chipW} h={s.rowH} fill={t.color} r={26} sh={10} scale={p} origin="0% 50%">
        <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          <Telop text={t.label} size={t.label.length > 2 ? 56 : t.id === 'npc' ? 64 : 62} anchor="middle" sw={13} />
        </div>
      </Card>
      <Card x={s.x + s.chipW + 14} y={y} w={s.right - s.x - s.chipW - 14} h={s.rowH} fill={CREAM} r={26} sh={10} scale={p} origin="0% 50%">
        <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: 26, background: t.color, opacity: 0.22}} />
      </Card>
    </div>;
  })}
</>;

/* ---------- the bean contestant ---------- */

export type BeanMark = {kind: 'badge'; text: string; color: string} | {kind: 'ball'; color: string} | {kind: 'none'} | {kind: 'star'};
export type BeanProps = {
  x: number; y: number; scale?: number; color: string; belly?: string; mark?: BeanMark; squash?: number; mouth?: boolean; arms?: 'down' | 'up' | 'hold';
  look?: number; blink?: boolean; tag?: string; tagSize?: number; score?: string; scoreColor?: string; scoreSize?: number; rot?: number; shell?: boolean;
};
/** A bean: feet at (x, y). Body 180 × 190 at scale 1. */
export const Bean: React.FC<BeanProps> = ({x, y, scale = 1, color, belly = 'rgba(255,255,255,0.38)', mark = {kind: 'ball', color: '#FFD23F'}, squash = 0, mouth = false, arms = 'down',
  look = 0, blink = false, tag, tagSize = 34, score, scoreColor = '#FFD23F', scoreSize = 40, rot = 0, shell = false}) => {
  const sx = 1 + squash * 0.12, sy = 1 - squash * 0.12;
  const W = 220, H = 280; // viewBox; feet at y 260
  const armL = arms === 'up' ? -140 : arms === 'hold' ? -70 : 18;
  const armR = arms === 'up' ? 140 : arms === 'hold' ? 70 : -18;
  const bodyFill = shell ? 'transparent' : color;
  return <div style={{position: 'absolute', left: x - (W / 2) * scale, top: y - 260 * scale, width: W * scale, height: H * scale, transform: `rotate(${rot}deg)`, transformOrigin: '50% 93%'}}>
    <svg width={W * scale} height={H * scale} viewBox={`0 0 ${W} ${H}`} style={{overflow: 'visible', position: 'absolute', inset: 0}}>
      <g transform={`translate(110 260) scale(${sx} ${sy}) translate(-110 -260)`} strokeLinecap="round" strokeLinejoin="round">
        {/* head mark */}
        {mark.kind === 'ball' && <><line x1={110} y1={74} x2={110} y2={36} stroke={INK} strokeWidth={7} /><circle cx={110} cy={30} r={14} fill={mark.color} stroke={INK} strokeWidth={6} /></>}
        {mark.kind === 'star' && <><line x1={110} y1={74} x2={110} y2={40} stroke={INK} strokeWidth={7} /><path d="M110 8 L117 24 L134 25 L121 36 L126 53 L110 44 L94 53 L99 36 L86 25 L103 24 Z" fill="#FFD23F" stroke={INK} strokeWidth={5} /></>}
        {mark.kind === 'badge' && <><line x1={110} y1={74} x2={110} y2={48} stroke={INK} strokeWidth={7} />
          <rect x={110 - Math.max(26, mark.text.length * 13)} y={0} width={Math.max(52, mark.text.length * 26)} height={50} rx={12} fill={mark.color} stroke={INK} strokeWidth={6} />
          <text x={110} y={37} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={mark.text.length > 2 ? 24 : 32} fill="#fff">{mark.text}</text></>}
        {/* feet */}
        <ellipse cx={80} cy={252} rx={30} ry={14} fill={bodyFill} stroke={INK} strokeWidth={7} />
        <ellipse cx={140} cy={252} rx={30} ry={14} fill={bodyFill} stroke={INK} strokeWidth={7} />
        {/* arms (behind the body edge), mitten hands */}
        <g transform={`rotate(${armL} 32 165)`}><path d="M32 165 L8 200" stroke={INK} strokeWidth={30} /><path d="M32 165 L8 200" stroke={bodyFill === 'transparent' ? '#fff' : color} strokeWidth={17} /><circle cx={6} cy={204} r={14} fill="#fff" stroke={INK} strokeWidth={6} /></g>
        <g transform={`rotate(${armR} 188 165)`}><path d="M188 165 L212 200" stroke={INK} strokeWidth={30} /><path d="M188 165 L212 200" stroke={bodyFill === 'transparent' ? '#fff' : color} strokeWidth={17} /><circle cx={214} cy={204} r={14} fill="#fff" stroke={INK} strokeWidth={6} /></g>
        {/* body */}
        <path d="M110 72 C168 72 200 126 202 182 C204 236 176 256 110 256 C44 256 16 236 18 182 C20 126 52 72 110 72 Z" fill={bodyFill} stroke={INK} strokeWidth={8} strokeDasharray={shell ? '18 14' : undefined} />
        {!shell && <ellipse cx={110} cy={202} rx={56} ry={40} fill={belly} />}
        {/* face */}
        {blink ? <><path d={`M${78 + look * 6} 140 h22`} stroke={INK} strokeWidth={6} /><path d={`M${122 + look * 6} 140 h22`} stroke={INK} strokeWidth={6} transform="translate(-22 0)" /></>
          : <><ellipse cx={88 + look * 6} cy={138} rx={11} ry={15} fill={INK} /><ellipse cx={132 + look * 6} cy={138} rx={11} ry={15} fill={INK} />
            <circle cx={84 + look * 6} cy={132} r={4.5} fill="#fff" /><circle cx={128 + look * 6} cy={132} r={4.5} fill="#fff" /></>}
        {!shell && <><ellipse cx={64} cy={164} rx={13} ry={7} fill="#FF8FB1" opacity={0.85} /><ellipse cx={156} cy={164} rx={13} ry={7} fill="#FF8FB1" opacity={0.85} /></>}
        {mouth ? <path d="M96 160 Q110 158 124 160 Q122 184 110 184 Q98 184 96 160 Z" fill="#E5494D" stroke={INK} strokeWidth={5} />
          : <path d="M98 162 Q110 174 122 162" fill="none" stroke={INK} strokeWidth={6} />}
      </g>
    </svg>
    {score && <div style={{position: 'absolute', left: '50%', top: (mark.kind === 'none' ? 40 : -6) * scale - scoreSize * 1.5, transform: 'translateX(-50%)', background: INK, color: scoreColor, borderRadius: 14,
      padding: `2px ${scoreSize * 0.36}px 4px`, fontFamily: cond, fontWeight: 800, fontSize: scoreSize, lineHeight: 1.15, whiteSpace: 'nowrap', border: '4px solid #fff', boxShadow: `5px 5px 0 ${INK}`}}>{score}</div>}
    {tag && <div style={{position: 'absolute', left: '50%', top: 262 * scale, transform: 'translateX(-50%)', background: INK, color: '#fff', borderRadius: 999, padding: `2px ${tagSize * 0.5}px 5px`,
      fontFamily: font, fontWeight: 900, fontSize: tagSize, lineHeight: 1.2, whiteSpace: 'nowrap', border: '3px solid #fff'}}>{tag}</div>}
  </div>;
};

/** The judgement word: a big outlined word popping at an angle (STYLE §8). */
export const Judge: React.FC<{f: number; at: number; text: string; x: number; y: number; size?: number; fill?: string; rot?: number}> = ({f, at, text, x, y, size = 120, fill = '#FFD23F', rot = -6}) => {
  if (f < at) return null;
  const p = pop(f, at, 7);
  return <div style={{position: 'absolute', left: x, top: y, transform: `translate(-50%, -50%) rotate(${rot}deg) scale(${p})`}}>
    <Telop text={text} size={size} fill={fill} anchor="middle" sw={size * 0.3} />
  </div>;
};

/** Burst on a hit: 8-point star + expanding ring + 8 ink speed lines, 9 frames. */
export const Burst: React.FC<{f: number; at: number; x: number; y: number; r?: number; color?: string}> = ({f, at, x, y, r = 90, color = '#FFD23F'}) => {
  const t = (f - at) / 9;
  if (t < 0 || t >= 1) return null;
  const R = r * (0.5 + t);
  const star = Array.from({length: 16}, (_, i) => {
    const a = (i / 16) * Math.PI * 2, rr = i % 2 ? R * 0.45 : R;
    return `${x + rr * Math.cos(a)},${y + rr * Math.sin(a)}`;
  }).join(' ');
  return <svg width={1080} height={1920} style={{position: 'absolute', inset: 0, pointerEvents: 'none'}}>
    {t < 0.5 && <polygon points={star} fill={color} stroke={INK} strokeWidth={6} strokeLinejoin="round" />}
    <circle cx={x} cy={y} r={R * 1.3} fill="none" stroke="#fff" strokeWidth={10 * (1 - t)} />
    {Array.from({length: 8}, (_, i) => {
      const a = (i / 8) * Math.PI * 2 + 0.2, r0 = R * 1.1, r1 = R * 1.6;
      return <line key={i} x1={x + r0 * Math.cos(a)} y1={y + r0 * Math.sin(a)} x2={x + r1 * Math.cos(a)} y2={y + r1 * Math.sin(a)} stroke={INK} strokeWidth={7} strokeLinecap="round" opacity={1 - t} />;
    })}
  </svg>;
};

/** Top-left sticker banner: a round tag + a title, sliding in with back-ease (STYLE §8 rounds / year banner). */
export const Banner: React.FC<{f: number; at?: number; tag: string; title: string; sub?: string; color: string; x?: number; y?: number}> = ({f, at = 0, tag, title, sub, color, x = 40, y = 64}) => {
  const p = f < at ? 0 : ease.outBack(clamp((f - at) / 8), 1.4);
  const w = 120 + Math.max(units(title) * 74, sub ? units(sub) * 36 : 0);
  return <Card x={x - (1 - p) * 700} y={y} w={Math.min(w, 780)} h={sub ? 200 : 150} fill={color} r={28} sh={10} rot={-2}>
    <div style={{position: 'absolute', left: 28, top: 18, display: 'flex', alignItems: 'center', gap: 16}}>
      <span style={{background: INK, color: '#fff', fontFamily: cond, fontWeight: 800, fontSize: 36, padding: '0 16px 2px', borderRadius: 12, lineHeight: 1.3}}>{tag}</span>
    </div>
    <div style={{position: 'absolute', left: 16, top: 64}}><Telop text={title} size={70} sw={14} /></div>
    {sub && <div style={{position: 'absolute', left: 30, top: 150, fontFamily: font, fontWeight: 900, fontSize: 32, color: INK}}>{sub}</div>}
  </Card>;
};

/** A typed line (typewriter on fractions of a beat; 1 character per `cpf` frames from `at`). */
export const typed = (s: string, f: number, at: number, cpf = 1) => [...s].slice(0, Math.max(0, Math.floor((f - at) / cpf))).join('');
export const Mono: React.FC<{text: string; size?: number; color?: string}> = ({text, size = 36, color = '#fff'}) => <span style={{fontFamily: jet, fontSize: size, color, whiteSpace: 'pre'}}>{text}</span>;
