import React from 'react';
import {clamp, ease} from '../../fx';
import {font} from '../theme';
import {cond, hand, plex} from '../fonts';
import {Scene} from '../paper';

// us-ai-datacenter-pause, made on the template lemo/dataviz (docs/video-craft/prompt-library/vendor/lemomo-ai__lemo-opuscar/
// 3961ddb/styles/dataviz/STYLE.md; picked by prompt-library/选用指南.md §〇: numbers, thresholds, before → after).
// Three US states brake AI data centers in three different places: New York (permits, ≥50 MW), Texas (grid hookups ≥75 MW,
// then air / water permits), Oregon (state land, to 2027-07-01). Inputs: inputs/us-ai-datacenter-pause/ (materials.md,
// sources.md, REVIEW-DOUYIN.md). Storyboard: tutorials/us-ai-datacenter-pause.storyboard.md.
// - Every mark is a sourced number drawn on paper by a red–blue pencil; the one computed figure (50 MW ≈ 42,000 homes, EIA
//   2024 household average, full-load estimate) shows its arithmetic on screen.
// - Review: power, water and bills only (no politics); the three states' measures stated exactly; 500 = media count (The
//   Information headline); Pew in its own wording; no national water figure; no video (faces).

const PAPER = '#F3EBDD', CARD = '#FBF6EC', INK = '#2B2420', GREY = '#8C8073', RED = '#C8372D', BLUE = '#0F6BA0';
const eio = (t: number) => ease.inOutCubic(clamp(t));
const eo = (f: number, a: number, d = 10) => ease.outCubic(clamp((f - a) / d));
const make = (draw: NonNullable<Scene['backdrop']>, sfx?: Scene['sfx']): Scene => {
  const S: Scene = () => null;
  S.backdrop = draw; S.sfx = sfx;
  return S;
};

/* ---------- paper, pencil, notes, slips ---------- */

const Paper: React.FC<{children: React.ReactNode; push?: number; origin?: string}> = ({children, push = 1, origin = '50% 40%'}) => (
  <div style={{position: 'absolute', inset: 0, background: PAPER, overflow: 'hidden'}}>
    <svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0}}>
      <filter id="fibre"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={7} /><feColorMatrix values="0 0 0 0 0.35  0 0 0 0 0.28  0 0 0 0 0.2  0 0 0 0.09 0" /></filter>
      <rect width={1080} height={1920} filter="url(#fibre)" />
      {Array.from({length: 22 * 40}, (_, i) => <circle key={i} cx={24 + (i % 22) * 48} cy={24 + Math.floor(i / 22) * 48} r={1.6} fill={GREY} opacity={0.22} />)}
    </svg>
    <div style={{position: 'absolute', inset: 0, transformOrigin: origin, transform: `scale(${push})`}}>{children}</div>
  </div>
);
/** The red–blue pencil, tip at (x, y); `lead` picks the end in use; a soft shadow drifts with `lift`. */
const Pencil: React.FC<{x: number; y: number; lead?: 'red' | 'blue'; lift?: number}> = ({x, y, lead = 'red', lift = 0}) => {
  const c = lead === 'red' ? RED : BLUE;
  return <svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', pointerEvents: 'none'}}>
    <g transform={`translate(${x + lift * 18},${y + lift * 22})`} opacity={0.18}><polygon points="0,0 34,62 300,350 330,322 62,34" fill="#000" style={{filter: 'blur(6px)'}} /></g>
    <g transform={`translate(${x},${y - lift * 10})`}>
      <polygon points="0,0 22,52 52,22" fill="#E7C9A0" stroke={INK} strokeWidth={2} />
      <polygon points="0,0 9,20 20,9" fill={c} />
      <polygon points="22,52 290,330 330,290 52,22" fill={c} stroke={INK} strokeWidth={2} />
      <line x1={37} y1={37} x2={310} y2={310} stroke="#fff" strokeOpacity={0.25} strokeWidth={6} />
    </g>
  </svg>;
};
/** Handwriting written on left to right (霞鹜文楷), in a pencil colour. */
const Hand: React.FC<{text: string; x: number; y: number; f: number; at: number; size?: number; color?: string; dur?: number; rot?: number}> = ({text, x, y, f, at, size = 52, color = INK, dur, rot = -1.5}) => {
  if (f < at) return null;
  const p = clamp((f - at) / (dur ?? Math.max(8, text.length * 1.6)));
  return <div style={{position: 'absolute', left: x, top: y, fontFamily: hand, fontSize: size, color, whiteSpace: 'nowrap', transform: `rotate(${rot}deg)`, clipPath: `inset(-20px ${(1 - p) * 100}% -20px -20px)`}}>{text}</div>;
};
/** A source slip pinned on the paper. */
const Slip: React.FC<{text: string; x: number; y: number; f: number; at: number; rot?: number}> = ({text, x, y, f, at, rot = 1.5}) => (f < at ? null :
  <div style={{position: 'absolute', left: x, top: y + (1 - eo(f, at, 8)) * 30, opacity: eo(f, at, 8), transform: `rotate(${rot}deg)`, background: CARD, padding: '8px 16px',
    boxShadow: '0 6px 16px rgba(60,40,20,0.18)', fontFamily: plex, fontSize: 28, color: GREY, whiteSpace: 'nowrap'}}>
    <span style={{display: 'inline-block', width: 12, height: 12, borderRadius: 6, background: RED, marginRight: 10, verticalAlign: 'middle'}} />{text}
  </div>);
/** A pencil stroke along a polyline, drawn to fraction p. */
const Stroke: React.FC<{pts: [number, number][]; p: number; color?: string; w?: number; dash?: string}> = ({pts, p, color = RED, w = 7, dash}) => {
  if (p <= 0) return null;
  const d = pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x},${y}`).join(' ');
  return <svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
    <path d={d} fill="none" stroke={color} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={dash ? undefined : 1} strokeDashoffset={dash ? undefined : 1 - p}
      style={dash ? {strokeDasharray: dash, clipPath: `inset(0 ${(1 - p) * 100}% 0 0)`} : undefined} opacity={0.92} />
  </svg>;
};
/** A data mark: a dot with an ink ring that pops and leaves a ripple when it lands. */
const Mark: React.FC<{x: number; y: number; f: number; at: number; r?: number; color?: string}> = ({x, y, f, at, r = 16, color = RED}) => {
  if (f < at) return null;
  const pop = 1 + 0.35 * Math.max(0, 1 - (f - at) / 5), rip = clamp((f - at) / 14);
  return <svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
    {rip < 1 && <circle cx={x} cy={y} r={r + rip * 30} fill="none" stroke={color} strokeWidth={3} opacity={1 - rip} />}
    <circle cx={x} cy={y} r={r * pop} fill={color} stroke={INK} strokeWidth={3} />
  </svg>;
};

/* ---------- 1 hook: 500 places, dot by dot; three states, three levers ---------- */

const COLS = 25, CELL = 36, GX = (1080 - COLS * CELL) / 2, GY = 480;
const dotsAt = (f: number) => Math.min(500, Math.round(170 + 330 * ease.inCubic(clamp(f / 95))));
const DotGrid: React.FC<{n: number; dim?: boolean}> = ({n, dim}) => <svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0}}>
  {Array.from({length: 500}, (_, i) => {
    const x = GX + (i % COLS) * CELL + CELL / 2, y = GY + Math.floor(i / COLS) * CELL + CELL / 2, on = i < n;
    return <circle key={i} cx={x} cy={y} r={on ? 12 : 4} fill={on ? RED : GREY} stroke={on ? INK : 'none'} strokeWidth={2} opacity={on ? (dim ? 0.55 : 0.9) : 0.35} />;
  })}
</svg>;
const STATES: [string, string][] = [['纽约', '许可'], ['得州', '电网'], ['俄勒冈', '土地']];
const Tags: React.FC<{f: number; at: number; second: number; y?: number}> = ({f, at, second, y = 1210}) => <>
  {STATES.map(([s, w], i) => f < at + i * 4 ? null : <div key={s} style={{position: 'absolute', left: 280 + i * 225, top: y + (1 - eo(f, at + i * 4, 8)) * -40, width: 210, transform: `rotate(${(i - 1) * 2}deg)`,
    background: CARD, boxShadow: '0 8px 20px rgba(60,40,20,0.18)', padding: '10px 0', textAlign: 'center'}}>
    <div style={{fontFamily: font, fontWeight: 900, fontSize: 46, color: INK}}>{s}</div>
    <div style={{position: 'relative', height: 60}}><Hand text={w} x={60} y={0} f={f} at={second + i * 6} size={50} color={RED} /></div>
  </div>)}
</>;
const Hook = make(({f, cue}) => {
  const a = cue('a', 105), b = cue('b', 156);
  const n = dotsAt(f), last = n - 1;
  const px = GX + (last % COLS) * CELL + CELL / 2, py = GY + Math.floor(last / COLS) * CELL + CELL / 2;
  return <Paper push={1 + 0.03 * eio(f / 200)}>
    <Hand text="美国限制数据中心的地方" x={64} y={236} f={f} at={-99} size={54} />
    <div style={{position: 'absolute', left: 64, top: 300, fontFamily: cond, fontWeight: 800, fontSize: 150, color: RED, lineHeight: 1}}>{n >= 500 ? '500+' : n}</div>
    <Slip text="The Information 标题 · 媒体统计" x={420} y={370} f={f} at={-99} />
    <DotGrid n={n} />
    {n < 500 && <Pencil x={px} y={py} lift={0.3 + 0.3 * Math.abs(Math.sin(f * 1.3))} />}
    <Tags f={f} at={a - 6} second={b - 4} />
  </Paper>;
}, (cue) => [...Array.from({length: 24}, (_, i) => ({at: Math.round(95 * Math.cbrt(i / 24)), kind: 'tick', gain: 0.04})), {at: cue('a', 105) - 6, kind: 'paper', gain: 0.08}, {at: cue('b', 156) - 4, kind: 'fs-paper-slide', gain: 0.07}]);

/* ---------- 2 eia: annual growth of US electricity demand, 0.1 % → 1.7 % ---------- */

const EX0 = 230, EX1 = 850, EY0 = 1110, EPX = 300;           // y for 0 %, px per 1 %
const ey = (v: number) => EY0 - v * EPX;
const Eia = make(({f, cue}) => {
  const a = cue('a', 68), b = cue('b', 140);
  const line = eio((f - a) / 22);
  return <Paper>
    <Hand text="美国用电需求 · 年增速" x={64} y={236} f={f} at={-99} size={54} />
    {/* axes grow with the narration */}
    <Stroke pts={[[EX0, EY0 + 20], [EX0, ey(2) - 10]]} p={eio(f / 16)} color={INK} w={4} />
    <Stroke pts={[[EX1, EY0 + 20], [EX1, ey(2) - 10]]} p={eio((f - 6) / 16)} color={INK} w={4} />
    {[0, 0.5, 1, 1.5, 2].map((v) => <div key={v} style={{position: 'absolute', left: EX0 - 110, top: ey(v) - 18, width: 90, textAlign: 'right', fontFamily: plex, fontSize: 28, color: GREY, opacity: eo(f, 8)}}>{v}%</div>)}
    <div style={{position: 'absolute', left: EX0 - 90, top: EY0 + 40, fontFamily: plex, fontSize: 32, color: INK, opacity: eo(f, 10)}}>2005–2019</div>
    <div style={{position: 'absolute', left: EX1 - 90, top: EY0 + 40, fontFamily: plex, fontSize: 32, color: INK, opacity: eo(f, 14)}}>2020–2025</div>
    <Mark x={EX0} y={ey(0.1)} f={f} at={18} />
    <Hand text="0.1%" x={EX0 + 24} y={ey(0.1) + 8} f={f} at={22} size={56} color={RED} />
    <Stroke pts={[[EX0, ey(0.1)], [EX0 + (EX1 - EX0) * line, ey(0.1) + (ey(1.7) - ey(0.1)) * line]]} p={line > 0 ? 1 : 0} />
    <Mark x={EX1} y={ey(1.7)} f={f} at={a + 22} r={20} />
    {f >= a + 22 && <div style={{position: 'absolute', left: EX1 - 250, top: ey(1.7) - 150, fontFamily: cond, fontWeight: 800, fontSize: 130, color: RED, transformOrigin: '100% 100%', transform: `scale(${1 + 0.25 * Math.max(0, 1 - (f - a - 22) / 6)})`}}>1.7%</div>}
    {f < a + 22 && line > 0 && <Pencil x={EX0 + (EX1 - EX0) * line} y={ey(0.1) + (ey(1.7) - ey(0.1)) * line} />}
    <Hand text="数据中心是主因之一 →" x={300} y={ey(0.7) + 10} f={f} at={b} size={48} color={INK} rot={-12} />
    <Slip text="EIA Today in Energy · 2026-03-12" x={64} y={1220} f={f} at={b + 10} />
  </Paper>;
}, (cue) => [{at: 0, kind: 'paper', gain: 0.06}, {at: 18, kind: 'tick', gain: 0.07}, {at: cue('a', 68), kind: 'whoosh-short', gain: 0.07}, {at: cue('a', 68) + 22, kind: 'tap', gain: 0.1}, {at: cue('b', 140), kind: 'fs-paper-slide', gain: 0.06}]);

/* ---------- 3–5 the megawatt axis: New York ≥50, 50 MW in homes, Texas ≥75 ---------- */

const AX0 = 110, AX1 = 990, AY = 640, MWMAX = 120;
const mx = (v: number) => AX0 + (v / MWMAX) * (AX1 - AX0);
const MwAxis: React.FC<{f: number; grow?: number}> = ({f, grow = -99}) => {
  const g = eio((f - grow) / 18);
  return <>
    <Stroke pts={[[AX0, AY], [AX0 + (AX1 - AX0) * g, AY]]} p={g > 0 ? 1 : 0} color={INK} w={4} />
    {[0, 25, 50, 75, 100].map((v) => (mx(v) - AX0) / (AX1 - AX0) <= g + 0.001 && <div key={v}>
      <div style={{position: 'absolute', left: mx(v) - 1, top: AY - 10, width: 3, height: 20, background: INK}} />
      <div style={{position: 'absolute', left: mx(v) - 40, top: AY + 18, width: 80, textAlign: 'center', fontFamily: plex, fontSize: 30, color: GREY}}>{v}</div>
    </div>)}
    <div style={{position: 'absolute', left: AX1 - 60, top: AY + 56, fontFamily: plex, fontSize: 30, color: INK, opacity: g}}>MW</div>
  </>;
};
const Threshold: React.FC<{f: number; at: number; v: number; label: string; color?: string; dim?: boolean; y0?: number}> = ({f, at, v, label, color = RED, dim, y0 = 380}) => {
  if (f < at) return null;
  const p = eio((f - at) / 12);
  return <div style={{opacity: dim ? 0.35 : 1}}>
    <div style={{position: 'absolute', left: mx(v), top: AY - (AY - y0) * p, width: AX1 - mx(v) + 10, height: (AY - y0) * p,
      background: `repeating-linear-gradient(135deg, ${color}22 0 10px, transparent 10px 22px)`}} />
    <Stroke pts={[[mx(v), AY + 10], [mx(v), y0]]} p={p} color={color} w={6} />
    <Hand text={label} x={mx(v) + 16} y={y0 - 6} f={f} at={at + 6} size={50} color={color} rot={0} />
  </div>;
};
const Note: React.FC<{f: number; at: number; x: number; y: number; title: string; lines: string[]; color?: string; w?: number}> = ({f, at, x, y, title, lines, color = RED, w = 900}) => (f < at ? null :
  <div style={{position: 'absolute', left: x, top: y + (1 - eo(f, at, 8)) * 30, width: w, opacity: eo(f, at, 8), background: CARD, padding: '18px 24px', boxShadow: '0 8px 22px rgba(60,40,20,0.16)', borderLeft: `8px solid ${color}`}}>
    <div style={{fontFamily: font, fontWeight: 900, fontSize: 46, color: INK}}>{title}</div>
    {lines.map((l, i) => <div key={i} style={{fontFamily: font, fontWeight: 600, fontSize: 40, color: INK, opacity: 0.85, marginTop: 6}}>{l}</div>)}
  </div>);
const Ny = make(({f, cue}) => {
  const a = cue('a', 32), b = cue('b', 73);
  return <Paper>
    <Hand text="纽约 · 卡许可" x={64} y={236} f={f} at={-99} size={58} />
    <MwAxis f={f} grow={2} />
    <Threshold f={f} at={a} v={50} label="≥ 50 MW" />
    <Note f={f} at={b} x={64} y={790} title="州环保部门（DEC）暂停酌情许可" lines={['直到用电、用水等评估（GEIS）做完', '评估没有固定期限 · 小项目不受这道门槛']} />
    <Slip text="纽约 EO 62 · 2026-07-14 · Lysander 市政摘要" x={64} y={1180} f={f} at={b + 12} />
  </Paper>;
}, (cue) => [{at: 2, kind: 'whoosh-short', gain: 0.06}, {at: cue('a', 32), kind: 'tap', gain: 0.09}, {at: cue('b', 73), kind: 'paper', gain: 0.07}]);

// 50 MW at full load for a year ÷ the EIA 2024 household average (865 kWh / month = 10,380 kWh / year)
const HOMES = Math.round((50_000 * 8760) / 10_380);              // ≈ 42,197
const HOME_DOTS = Math.round(HOMES / 1000);                     // 42 dots, 1,000 homes each
const House: React.FC<{x: number; y: number; s?: number; color?: string}> = ({x, y, s = 1, color = RED}) => (
  <svg width={60} height={60} style={{position: 'absolute', left: x - 30 * s, top: y - 30 * s, transform: `scale(${s})`, transformOrigin: '30px 30px', overflow: 'visible'}}>
    <polygon points="30,6 54,26 54,54 6,54 6,26" fill={color} stroke={INK} strokeWidth={3} strokeLinejoin="round" />
    <rect x={24} y={36} width={12} height={18} fill={CARD} />
  </svg>
);
const Mw = make(({f, cue}) => {
  const a = cue('a', 34), b = cue('b', 84);
  const bar = eo(f, 0, 10), shatter = eio((f - a) / 26);
  const BY = 720, BH = 64;
  return <Paper>
    <Hand text="50 MW 有多大？" x={64} y={236} f={f} at={-99} size={58} />
    <MwAxis f={f} />
    <Threshold f={f} at={-99} v={50} label="≥ 50 MW" dim />
    {/* the 50 MW bar, then its pieces fly into a grid of homes (1 dot = 1,000 homes) */}
    {shatter < 0.02 && <div style={{position: 'absolute', left: AX0, top: BY, width: (mx(50) - AX0) * bar, height: BH, background: RED, border: `3px solid ${INK}`}} />}
    {shatter >= 0.02 && Array.from({length: HOME_DOTS}, (_, i) => {
      const sx = AX0 + ((i + 0.5) / HOME_DOTS) * (mx(50) - AX0), sy = BY + BH / 2;
      const tx = 330 + (i % 7) * 96, ty = 900 + Math.floor(i / 7) * 74;
      const t = eio((shatter * 1.4) - (i / HOME_DOTS) * 0.4);
      return <House key={i} x={sx + (tx - sx) * t} y={sy + (ty - sy) * t + Math.sin(t * Math.PI) * -60} s={0.55 + 0.45 * t} />;
    })}
    {f >= b - 6 && <div style={{position: 'absolute', left: 560, top: 236, opacity: eo(f, b - 6, 8), textAlign: 'right', width: 460}}>
      <div style={{fontFamily: cond, fontWeight: 800, fontSize: 140, color: RED, lineHeight: 1}}>≈4.2<span style={{fontFamily: font, fontSize: 70}}>万户</span></div>
    </div>}
    <Hand text={`50 MW × 8760 h ÷ 10,380 kWh/户 ≈ ${HOMES.toLocaleString('en-US')} 户`} x={64} y={1360 - 60} f={f} at={b} size={40} color={INK} rot={0} dur={20} />
    <Slip text="EIA 2024 家庭平均 865 kWh/月 · 满负荷全年 · 估算" x={300} y={820} f={f} at={b + 8} rot={-1} />
  </Paper>;
}, (cue) => [{at: 0, kind: 'tap', gain: 0.08}, {at: cue('a', 34), kind: 'whoosh', gain: 0.08}, ...Array.from({length: 8}, (_, i) => ({at: cue('a', 34) + 8 + i * 2, kind: 'tick', gain: 0.04})), {at: cue('b', 84), kind: 'chime', gain: 0.1}]);

const Tx = make(({f, cue}) => {
  const a = cue('a', 38), b = cue('b', 108);
  return <Paper>
    <Hand text="得州 · 先卡电网" x={64} y={236} f={f} at={-99} size={58} />
    <MwAxis f={f} />
    <Threshold f={f} at={-99} v={50} label="纽约 ≥ 50" dim y0={460} />
    <Threshold f={f} at={4} v={75} label="≥ 75 MW 并网" />
    <Note f={f} at={a} x={64} y={790} title="8 月 · ERCOT 暂停大型并网审批" lines={['先审计；小项目、自建电厂不并网的不在此列']} />
    <Note f={f} at={b} x={64} y={1030} title="9-21 · 空气和水的环境许可也暂停" lines={['TCEQ 10-19 回函：已执行']} color={BLUE} />
    <Slip text="得州州长 2026-09-21 · TCEQ 回函 · TPR" x={64} y={1260} f={f} at={b + 12} />
  </Paper>;
}, (cue) => [{at: 4, kind: 'tap', gain: 0.09}, {at: cue('a', 38), kind: 'paper', gain: 0.07}, {at: cue('b', 108), kind: 'paper', gain: 0.07}]);

/* ---------- 6 or: a timeline to 2027-07-01, the empty next cell ---------- */

const TX0 = 110, TX1 = 990, TY = 640;
const MONTHS = ['26-09', '10', '11', '12', '27-01', '02', '03', '04', '05', '06', '07', '08'];
const tx = (m: number) => TX0 + (m / (MONTHS.length - 1)) * (TX1 - TX0);   // m = months since 2026-09-01
const Or = make(({f, cue}) => {
  const a = cue('a', 54), b = cue('b', 122);
  const g = eio((f - 2) / 18), now = tx(7 / 30), end = tx(10);
  const dash = eio((f - a) / 24);
  return <Paper>
    <Hand text="俄勒冈 · 只卡州有土地" x={64} y={236} f={f} at={-99} size={58} />
    <Stroke pts={[[TX0, TY], [TX0 + (TX1 - TX0) * g, TY]]} p={g > 0 ? 1 : 0} color={INK} w={4} />
    {MONTHS.map((m, i) => (tx(i) - TX0) / (TX1 - TX0) <= g + 0.001 && <div key={m}>
      <div style={{position: 'absolute', left: tx(i) - 1, top: TY - 8, width: 3, height: 16, background: INK}} />
      {(i % 2 === 0 || i === 10) && <div style={{position: 'absolute', left: tx(i) - 50, top: TY + 16, width: 100, textAlign: 'center', fontFamily: plex, fontSize: 26, color: GREY}}>{m}</div>}
    </div>)}
    <Mark x={now} y={TY} f={f} at={20} />
    <Hand text="9-08 州长令" x={now - 20} y={TY - 120} f={f} at={24} size={46} color={RED} rot={0} />
    {/* the pause, drawn as a dashed bar into the empty next cell */}
    {dash > 0 && <div style={{position: 'absolute', left: now, top: TY - 46, width: (end - now) * dash, height: 30, background: `repeating-linear-gradient(90deg, ${RED}AA 0 18px, transparent 18px 30px)`}} />}
    {f >= a + 20 && <div style={{position: 'absolute', left: end - 120, top: TY - 210, width: 240, height: 120, border: `4px dashed ${RED}`, background: `${CARD}CC`, opacity: eo(f, a + 20, 8),
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
      <div style={{fontFamily: cond, fontWeight: 800, fontSize: 56, color: RED, lineHeight: 1}}>2027-07-01</div>
      <div style={{fontFamily: font, fontWeight: 700, fontSize: 30, color: INK}}>暂停到这天</div>
    </div>}
    <Note f={f} at={a - 10} x={64} y={780} title="暂停：州有土地上的未批准交易" lines={['租赁、通行权、土地使用许可、买卖']} />
    <Note f={f} at={b} x={64} y={1010} title="州长原文：无权单独下全州建设禁令" lines={['这不是全州禁建']} color={BLUE} />
    <Slip text="俄勒冈州长新闻稿 · 2026-09-08" x={64} y={1250} f={f} at={b + 12} />
  </Paper>;
}, (cue) => [{at: 20, kind: 'tick', gain: 0.07}, {at: cue('a', 54), kind: 'whoosh-short', gain: 0.07}, {at: cue('a', 54) + 20, kind: 'tap', gain: 0.08}, {at: cue('b', 122), kind: 'paper', gain: 0.07}]);

/* ---------- 7 pew: views turned more negative (blue lead) ---------- */

const PX0 = 380, PX1 = 980, px = (v: number) => PX0 + (v / 100) * (PX1 - PX0);
const ROWS: [string, number, number][] = [['家庭电费', 38, 50], ['环境', 39, 54], ['附近生活质量', 30, 49]];
const Pew = make(({f, cue}) => {
  const a = cue('a', 30), b = cue('b', 129);
  return <Paper>
    <Hand text="居民的看法 · 认为“基本是坏事”" x={64} y={236} f={f} at={-99} size={50} color={BLUE} />
    <div style={{position: 'absolute', left: px(0) - 20, top: 340, fontFamily: plex, fontSize: 28, color: GREY}}>0</div>
    <div style={{position: 'absolute', left: px(100) - 50, top: 340, fontFamily: plex, fontSize: 28, color: GREY}}>100%</div>
    {ROWS.map(([label, from, to], i) => {
      const y = 430 + i * 130, hi = i === 0, at = (hi ? a : a + 30 + i * 8), p = eio((f - at) / 18);
      return <div key={label} style={{opacity: hi ? 1 : 0.6}}>
        <div style={{position: 'absolute', left: 64, top: y - 30, fontFamily: font, fontWeight: hi ? 900 : 700, fontSize: hi ? 46 : 40, color: INK}}>{label}</div>
        <div style={{position: 'absolute', left: PX0, top: y, width: PX1 - PX0, height: 2, background: GREY, opacity: 0.4}} />
        <Mark x={px(from)} y={y} f={f} at={at - 6} r={14} color={'#9DB7C9'} />
        <Stroke pts={[[px(from), y], [px(from) + (px(to) - px(from)) * p, y]]} p={p > 0 ? 1 : 0} color={BLUE} w={8} />
        <Mark x={px(to)} y={y} f={f} at={at + 18} r={18} color={BLUE} />
        {f >= at + 18 && <div style={{position: 'absolute', left: px(to) + 26, top: y - 30, fontFamily: cond, fontWeight: 800, fontSize: hi ? 64 : 48, color: BLUE}}>{to}%</div>}
        {hi && f >= at && <div style={{position: 'absolute', left: px(from) - 70, top: y - 34, fontFamily: cond, fontWeight: 700, fontSize: 44, color: GREY}}>{from}</div>}
      </div>;
    })}
    <div style={{position: 'absolute', left: 64, top: 820, fontFamily: plex, fontSize: 28, color: GREY, opacity: eo(f, 10)}}>浅点：2026 年 1 月 · 深点：2026 年 7–8 月</div>
    {f >= b - 6 && <div style={{position: 'absolute', left: 64, top: 900, opacity: eo(f, b - 6, 8)}}>
      <div style={{fontFamily: font, fontWeight: 900, fontSize: 46, color: INK, marginBottom: 14}}>对家门口新建数据中心：不太 / 完全不舒服</div>
      <div style={{display: 'flex', gap: 10, alignItems: 'center'}}>
        {Array.from({length: 10}, (_, i) => <div key={i} style={{width: 66, height: 66, borderRadius: 8, border: `3px solid ${INK}`, background: i < 6 && f >= b + i * 3 ? BLUE : CARD}} />)}
        <div style={{fontFamily: cond, fontWeight: 800, fontSize: 90, color: BLUE, marginLeft: 16}}>60%</div>
      </div>
    </div>}
    <Slip text="Pew · 调查 2026-07-20—08-09 · n=10,548" x={64} y={1200} f={f} at={b + 20} />
  </Paper>;
}, (cue) => [{at: 0, kind: 'paper', gain: 0.06}, {at: cue('a', 30) + 18, kind: 'tap', gain: 0.09}, ...Array.from({length: 6}, (_, i) => ({at: cue('b', 129) + i * 3, kind: 'tick', gain: 0.06}))]);

/* ---------- 8 end: back to the 500, the three levers; the pencil leaves ---------- */

const End = make(({f, cue}) => {
  const b = cue('b', 74);
  const out = eio((f - b) / 20);
  return <Paper push={1 + 0.03 * eio(f / 120)}>
    <Hand text="美国限制数据中心的地方" x={64} y={236} f={f} at={-99} size={54} />
    <div style={{position: 'absolute', left: 64, top: 300, fontFamily: cond, fontWeight: 800, fontSize: 150, color: RED, lineHeight: 1}}>500+</div>
    <DotGrid n={500} dim />
    <Tags f={f} at={-99} second={-99} />
    <Pencil x={700 + out * 600} y={1000 + out * 500} lift={0.5} />
  </Paper>;
}, () => [{at: 0, kind: 'paper', gain: 0.06}]);

/** Cover anchor (880 × 800): the 500 dots and the three tags. */
const Cover: Scene = () => <div style={{position: 'absolute', left: 0, top: 0, width: 880, height: 800, overflow: 'hidden'}}>
  <div style={{position: 'absolute', left: -100, top: -440, width: 1080, height: 1920}}>
    <Paper><DotGrid n={500} /><Tags f={999} at={-99} second={-99} /></Paper>
  </div>
</div>;

export const usDatacenterPauseScenes: Record<string, Scene> = {
  'dcp.hook': Hook, 'dcp.eia': Eia, 'dcp.ny': Ny, 'dcp.mw': Mw, 'dcp.tx': Tx, 'dcp.or': Or, 'dcp.pew': Pew, 'dcp.end': End, 'dcp.cover': Cover,
};
