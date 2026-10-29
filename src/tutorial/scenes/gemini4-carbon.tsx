import React from 'react';
import {Img, staticFile} from 'remotion';
import {clamp, ease} from '../../fx';
import {font} from '../theme';
import {inter, jet} from '../fonts';
import {Cue, Scene} from '../paper';
import {W, eo} from '../package';

// gemini4-carbon, made on the template lemo/dark-keynote (docs/video-craft/prompt-library/vendor/lemomo-ai__lemo-opuscar/
// 3961ddb/styles/dark-keynote/STYLE.md; picked by prompt-library/选用指南.md §〇: a new model launch). The new #1 on the
// Artificial Analysis Intelligence Index v5 (59; Opus 5.5 58, GPT-6 Astra 57) that you can't use yet: its strongest suit
// is cybersecurity (SEC-bench Pro 88.2 %, CWE-bench 71.0 %, Google's own runs), so this week it goes only to a subset of
// cyber defenders; developers and consumers "as soon as possible", no date. Intro price $2/$10, then $4/$20; on AA's
// coding-agent index it is 59 to Opus 5.5's 62. Inputs: inputs/gemini4-carbon/ (README.md, REVIEW-DOUYIN.md, sources.md,
// transcript/). Storyboard: tutorials/gemini4-carbon.storyboard.md.
// - review: no ExploitGym (needs its 10-hour caveat), no Terminal-Bench, no hallucination rate; never "Google 不敢放"; say the
//   scores are Google's own; price always intro → standard; nothing from the methodology PDF on screen.
// - What the template gives: a near-black stage with a radial lift, one cool glow, a hairline grid on a 48 px module that
//   only the camera moves; UI drawn in code (rounded windows with a glyph + title only, rows, badges, bars), three raised
//   surfaces with a 1 px border and a 1 px inner top highlight; ONE accent for what the product is / does; numbers from
//   glyph noise (one digit per sixteenth); a light band that turns pixels on; spawns 0.2–0.3 s with one small overshoot;
//   transitions are UI expanding / collapsing (no fades); the caption is a UI toast (look.captions "toast").
// - Customised (模板改造): the accent is the sky blue of Carbon's own key visual (#4EABEB) and the stage leans to Google's
//   navy; the official crystal is the one physical "product", lit once by the light band; AA's chart and Google's charts
//   come in as evidence windows with source tags; the native move "generated accumulation" is swapped for the access list
//   (four rows typed on the grid, only one lights).

const K = {bg: '#050B1A', s1: '#0E1A33', s2: '#13223F', s3: '#1A2B4D', ink: '#EEF3FA', ink2: '#A9B6CC', ink3: '#6F7E98', accent: '#4EABEB', off: '#59657D'};
const IMG = (n: string) => `images/gemini4-carbon/${n}`;
const GLOW = (a = 0.55) => `0 0 28px rgba(78,171,235,${a}), 0 0 80px rgba(78,171,235,${a * 0.45})`;
const back = (t: number) => ease.outBack(clamp(t), 1.3);

/* ---------- the stage: radial lift, one cool glow, hairline grid (moved only by the camera), vignette ---------- */

type Cam = {x: number; y: number; z: number};
const camLerp = (f: number, keys: [number, number, number, number][]): Cam => {
  if (f <= keys[0][0]) return {x: keys[0][1], y: keys[0][2], z: keys[0][3]};
  for (let i = 0; i < keys.length - 1; i++) {
    const [a, ax, ay, az] = keys[i], [b, bx, by, bz] = keys[i + 1];
    if (f <= b) {
      const t = ease.inOutCubic(clamp((f - a) / Math.max(1, b - a)));
      return {x: ax + (bx - ax) * t, y: ay + (by - ay) * t, z: Math.exp(Math.log(az) + (Math.log(bz) - Math.log(az)) * t)};
    }
  }
  const l = keys[keys.length - 1];
  return {x: l[1], y: l[2], z: l[3]};
};
const Grid: React.FC = () => <svg width={3240} height={5760} style={{position: 'absolute', left: -1080, top: -1920}}>
  <defs>
    <pattern id="gc-g" width={48} height={48} patternUnits="userSpaceOnUse"><path d="M48 0 L0 0 0 48" fill="none" stroke="rgba(255,255,255,0.035)" strokeWidth={1} /></pattern>
    <pattern id="gc-G" width={192} height={192} patternUnits="userSpaceOnUse"><path d="M192 0 L0 0 0 192" fill="none" stroke="rgba(255,255,255,0.065)" strokeWidth={1} /></pattern>
  </defs>
  <rect width="100%" height="100%" fill="url(#gc-g)" /><rect width="100%" height="100%" fill="url(#gc-G)" />
</svg>;
/** The stage + a world layer (grid and UI) under a 2D camera; `glow` is the cool light's strength. */
const Stage: React.FC<{cam?: Cam; glow?: number; dim?: number; children?: React.ReactNode; over?: React.ReactNode}> = ({cam = {x: 540, y: 960, z: 1}, glow = 1, dim = 0, children, over}) => <div style={{position: 'absolute', inset: 0, overflow: 'hidden',
  background: 'radial-gradient(ellipse 85% 55% at 50% 24%, #0D2250 0%, #08173A 42%, #050B1A 100%)'}}>
  <div style={{position: 'absolute', inset: 0, background: 'radial-gradient(circle 620px at 80% 30%, rgba(78,171,235,0.09), transparent 70%)', opacity: glow}} />
  <div style={{position: 'absolute', left: 0, top: 0, width: W, height: 1920, transformOrigin: '0 0', transform: `translate(540px, 960px) scale(${cam.z}) translate(${-cam.x}px, ${-cam.y}px)`}}>
    <Grid />
    {children}
  </div>
  {over}
  <div style={{position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 80% 65% at 50% 45%, transparent 50%, rgba(2,5,12,0.55) 100%)'}} />
  {dim > 0 && <div style={{position: 'absolute', inset: 0, background: '#03070F', opacity: dim}} />}
</div>;

/* ---------- UI kit ---------- */

/** Digits scramble out of glyph noise and lock one per sixteenth (5 frames at 92 BPM), each with a small bounce. */
const NOISE = '0123456789#%$/<>';
const scramble = (f: number, text: string, at: number, step = 5): {ch: string; locked: boolean; bounce: number}[] => [...text].map((ch, i) => {
  const lock = at + i * step;
  if (!/[0-9]/.test(ch)) return {ch, locked: f >= at, bounce: 0};
  if (f >= lock) return {ch, locked: true, bounce: Math.sin(clamp((f - lock) / 5) * Math.PI) * 0.1};
  const r = Math.abs(Math.sin((Math.floor(f / 2) + 1) * 12.9898 + i * 78.233) * 43758.5453) % 1;
  return {ch: NOISE[Math.floor(r * NOISE.length)], locked: false, bounce: 0};
});
const Scramble: React.FC<{f: number; text: string; at: number; size: number; color?: string; glow?: boolean; step?: number; style?: React.CSSProperties; from?: number}> = ({f, text, at, size, color = K.accent, glow = true, step, style, from}) => {
  if (f < (from ?? at - 12)) return null;
  return <div style={{display: 'flex', alignItems: 'baseline', fontFamily: inter, fontWeight: 600, fontSize: size, lineHeight: 1, letterSpacing: -size * 0.045, color, ...style}}>
    {scramble(f, text, at, step).map((c, i) => <span key={i} style={{display: 'inline-block', transform: `translateY(${-c.bounce * size * 0.3}px)`, opacity: c.locked ? 1 : 0.45,
      color: c.locked ? color : K.ink3, textShadow: c.locked && glow ? GLOW(0.5) : 'none'}}>{c.ch}</span>)}
  </div>;
};

/** A rounded window (glyph + title only, no OS controls) that expands from (ox, oy) — the template's transition. */
const Win: React.FC<{f: number; at: number; x: number; y: number; w: number; h: number; title: string; status?: string; o?: [number, number]; out?: number; level?: 1 | 2 | 3;
  children?: React.ReactNode; accentGlyph?: boolean}> = ({f, at, x, y, w, h, title, status, o, out, level = 2, children, accentGlyph = true}) => {
  if (f < at || (out !== undefined && f >= out + 8)) return null;
  const pIn = back((f - at) / 8), pOut = out !== undefined ? ease.inCubic(clamp((f - out) / 8)) : 0;
  const p = pIn * (1 - pOut);
  const [ox, oy] = o ?? [x + w / 2, y + h / 2];
  const cx = ox + (x + w / 2 - ox) * p, cy = oy + (y + h / 2 - oy) * p;
  const ww = Math.max(20, w * p), hh = Math.max(6, h * (pOut > 0 ? 1 - pOut * 0.96 : p));
  const bg = level === 1 ? K.s1 : level === 2 ? K.s2 : K.s3;
  return <div style={{position: 'absolute', left: cx - ww / 2, top: cy - hh / 2, width: ww, height: hh, borderRadius: 28, background: bg, overflow: 'hidden',
    border: '1px solid rgba(255,255,255,0.09)', boxShadow: '0 30px 80px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.10)'}}>
    <div style={{position: 'absolute', left: 0, top: 0, width: w, height: h, transform: `translate(${(ww - w) / 2}px, ${(hh - h) / 2}px)`, opacity: clamp((p - 0.55) / 0.35)}}>
      <div style={{position: 'absolute', left: 30, top: 24, display: 'flex', alignItems: 'center', gap: 14}}>
        <div style={{width: 14, height: 14, borderRadius: 4, background: accentGlyph ? K.accent : K.ink3, boxShadow: accentGlyph ? GLOW(0.4) : 'none'}} />
        <div style={{fontFamily: jet, fontWeight: 500, fontSize: 24, letterSpacing: 2, color: K.ink2}}>{title}</div>
      </div>
      {status && <div style={{position: 'absolute', right: 30, top: 25, fontFamily: jet, fontWeight: 500, fontSize: 22, letterSpacing: 1.5, color: K.ink3}}>{status}</div>}
      <div style={{position: 'absolute', left: 0, top: 72, right: 0, height: 1, background: 'rgba(255,255,255,0.07)'}} />
      {children}
    </div>
  </div>;
};

/** A padlock that snaps shut at `shut` (shackle drops 10 px), with a small jolt. */
const Lock: React.FC<{f: number; shut: number; size?: number; color?: string; jolt?: number}> = ({f, shut, size = 44, color = K.ink2, jolt}) => {
  const d = (1 - ease.outBack(clamp((f - shut) / 5), 2)) * 12;
  const j = jolt !== undefined && f >= jolt ? Math.sin(clamp((f - jolt) / 8) * Math.PI * 3) * 4 * (1 - clamp((f - jolt) / 8)) : 0;
  return <svg width={size} height={size * 1.2} viewBox="0 0 40 48" style={{transform: `translateX(${j}px)`}}>
    <path d={`M11 ${22 - d} V${14 - d} a9 9 0 0 1 18 0 V${22 - d}`} fill="none" stroke={color} strokeWidth={4.2} strokeLinecap="round" />
    <rect x={5} y={21} width={30} height={24} rx={6} fill={color} />
    <circle cx={20} cy={31} r={3.2} fill={K.s1} /><rect x={18.6} y={32} width={2.8} height={7} rx={1.4} fill={K.s1} />
  </svg>;
};

/** The protagonist element: the grey 「申请使用」 button with its lock. It drops in from above with a bounce at `at`. */
const UseButton: React.FC<{f: number; at: number; cx: number; y: number; shut?: number; jolt?: number; scale?: number; dark?: number}> = ({f, at, cx, y, shut = at + 6, jolt, scale = 1, dark = 0}) => {
  if (f < at) return null;
  const p = ease.outBack(clamp((f - at) / 8), 1.6);
  return <div style={{position: 'absolute', left: cx, top: y - (1 - p) * 220, transform: `translateX(-50%) scale(${scale})`, transformOrigin: '50% 0', opacity: clamp((f - at) / 3) * (1 - dark * 0.55)}}>
    <div style={{display: 'flex', alignItems: 'center', gap: 22, padding: '22px 52px 22px 44px', borderRadius: 999, background: K.s3, border: '1px solid rgba(255,255,255,0.10)',
      boxShadow: '0 18px 50px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.08)'}}>
      <Lock f={f} shut={shut} jolt={jolt} />
      <div style={{fontFamily: font, fontWeight: 800, fontSize: 56, color: K.ink3, letterSpacing: 2, whiteSpace: 'nowrap'}}>申请使用</div>
    </div>
  </div>;
};

/** A source tag: mono, small, on a dark plate. */
const Src: React.FC<{text: string; x: number; y: number; f: number; at: number; right?: boolean}> = ({text, x, y, f, at, right}) => (f < at ? null :
  <div style={{position: 'absolute', left: right ? undefined : x, right: right ? W - x : undefined, top: y, fontFamily: jet, fontWeight: 500, fontSize: 22, letterSpacing: 1, color: K.ink2,
    background: 'rgba(5,11,26,0.72)', padding: '5px 12px', borderRadius: 6, opacity: eo(f, at, at + 6), whiteSpace: 'nowrap'}}>{text}</div>);

/** A light band sweeping left → right over its children: only lit pixels turn on (unlit at `floor`), glint ≤ 18 %. */
const LightReveal: React.FC<{f: number; at: number; d?: number; floor?: number; children: React.ReactNode; style?: React.CSSProperties}> = ({f, at, d = 30, floor = 0.06, children, style}) => {
  const t = clamp((f - at) / d);
  const edge = -25 + 150 * ease.inOutCubic(t);
  const m = t >= 1 ? undefined : `linear-gradient(105deg, #000 0%, #000 ${edge - 12}%, rgba(0,0,0,${floor}) ${edge + 8}%, rgba(0,0,0,${floor}) 100%)`;
  return <div style={{position: 'absolute', inset: 0, ...style}}>
    <div style={{position: 'absolute', inset: 0, WebkitMaskImage: m, maskImage: m}}>{children}</div>
    {t > 0 && t < 1 && <div style={{position: 'absolute', inset: 0, background: `linear-gradient(105deg, transparent ${edge - 10}%, rgba(220,240,255,0.18) ${edge - 2}%, transparent ${edge + 6}%)`, mixBlendMode: 'screen'}} />}
  </div>;
};

/** The official crystal (Google's key visual), cut out of its blue by a radial mask and screened onto the stage. */
const Crystal: React.FC<{x: number; y: number; h: number; op?: number; rot?: number}> = ({x, y, h, op = 1, rot = 0}) => {
  const w = h * (2200 / 1237) * 0.62; // the crop around the crystal only
  const m = 'radial-gradient(ellipse 34% 46% at 50% 50%, #000 52%, transparent 100%)';
  return <div style={{position: 'absolute', left: x - w / 2, top: y - h / 2, width: w, height: h, overflow: 'hidden', opacity: op, transform: `rotate(${rot}deg)`, WebkitMaskImage: m, maskImage: m, mixBlendMode: 'screen'}}>
    <Img src={staticFile(IMG('crystal-header.jpg'))} style={{position: 'absolute', height: h * 1.0, left: -h * (2200 / 1237) * 0.19, top: 0, filter: 'brightness(0.95) contrast(1.25) saturate(1.1)'}} />
  </div>;
};

/** A bar on the zero baseline (honest scale: 59 vs 58 vs 57 look almost the same — that is the point). */
const Bar: React.FC<{f: number; at: number; x: number; base: number; w: number; v: number; max: number; hMax: number; name: string; sub?: string; hero?: boolean; landAt?: number; delta?: string}> = ({
  f, at, x, base, w, v, max, hMax, name, sub, hero, landAt, delta,
}) => {
  if (f < at) return null;
  const g = back((f - at) / 9);
  const h = (v / max) * hMax * g;
  const shown = landAt === undefined || f >= landAt;
  return <>
    <div style={{position: 'absolute', left: x, top: base - h, width: w, height: h, borderRadius: '14px 14px 4px 4px',
      background: hero ? `linear-gradient(180deg, ${K.accent}, #2C7FC4)` : 'linear-gradient(180deg, #3A4A6A, #26334F)', boxShadow: hero ? GLOW(0.35) : 'inset 0 1px 0 rgba(255,255,255,0.12)'}} />
    <div style={{position: 'absolute', left: x - 40, width: w + 80, top: base - h - 112, textAlign: 'center', opacity: shown ? eo(f, landAt ?? at, (landAt ?? at) + 4) : 0}}>
      <Scramble f={f} text={String(v)} at={landAt ?? at + 4} size={96} color={hero ? K.accent : K.ink} glow={hero} style={{justifyContent: 'center'}} />
    </div>
    {delta && shown && <div style={{position: 'absolute', left: x, width: w, top: base - h + 18, textAlign: 'center', fontFamily: jet, fontWeight: 500, fontSize: 40, color: K.ink,
      opacity: eo(f, (landAt ?? at) + 6, (landAt ?? at) + 12)}}>{delta}</div>}
    <div style={{position: 'absolute', left: x - 40, width: w + 80, top: base + 18, textAlign: 'center', opacity: eo(f, at + 3, at + 9)}}>
      <div style={{fontFamily: inter, fontWeight: 600, fontSize: 40, color: hero ? K.ink : K.ink2, lineHeight: 1.1, whiteSpace: 'pre-line'}}>{name}</div>
      {sub && <div style={{fontFamily: jet, fontWeight: 500, fontSize: 20, color: K.ink3, marginTop: 6, letterSpacing: 1}}>{sub}</div>}
    </div>
  </>;
};

/** A 1 px measure between two heights with its label (the gap the voice talks about). */
const Measure: React.FC<{f: number; at: number; x0: number; x1: number; y0: number; y1: number; label: string}> = ({f, at, x0, x1, y0, y1, label}) => {
  if (f < at) return null;
  const p = eo(f, at, at + 8);
  return <>
    <svg width={W} height={1920} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
      <path d={`M${x0} ${y0} L${x0 + (x1 - x0) * p} ${y0}`} stroke={K.accent} strokeWidth={2} strokeDasharray="6 6" />
      <path d={`M${x1} ${y0} L${x1} ${y0 + (y1 - y0) * p}`} stroke={K.accent} strokeWidth={2} />
    </svg>
    <div style={{position: 'absolute', left: x1 + 14, top: (y0 + y1) / 2 - 30, fontFamily: jet, fontWeight: 500, fontSize: 44, color: K.accent, opacity: eo(f, at + 5, at + 10), textShadow: GLOW(0.3)}}>{label}</div>
  </>;
};

const Label: React.FC<{children: React.ReactNode; x: number; y: number; size?: number; color?: string; op?: number; center?: boolean; spacing?: number}> = ({children, x, y, size = 26, color = K.ink2, op = 1, center, spacing = 3}) => (
  <div style={{position: 'absolute', left: center ? 0 : x, width: center ? W : undefined, textAlign: center ? 'center' : undefined, top: y, fontFamily: jet, fontWeight: 500, fontSize: size, letterSpacing: spacing,
    color, opacity: op, whiteSpace: 'nowrap'}}>{children}</div>);

const make = (draw: NonNullable<Scene['backdrop']>, sfx?: Scene['sfx']): Scene => {
  const S: Scene = () => null;
  S.backdrop = draw;
  S.sfx = sfx;
  return S;
};

/* ---------- 1 hook: 59 out of glyph noise; the crystal lit by the band; the grey button drops and locks ---------- */

const NUM_Y = 560; // top of the giant number
const BTN_Y = 1080;
const hookPlan = (cue: Cue) => ({n: cue('n', 66), a: cue('a', 88)});
/** The hero frame: the giant 59 (+ #1) over the crystal. Shared by the hook, the end and the cover, so the film loops. */
const Hero: React.FC<{f: number; lockAt: number; lit: number; crystal?: number}> = ({f, lockAt, lit, crystal = 1}) => <>
  <LightReveal f={f} at={lit} d={32} floor={0.1}>
    <Crystal x={600} y={700} h={1180} op={0.42 * crystal} rot={-4} />
  </LightReveal>
  <div style={{position: 'absolute', left: 0, width: W, top: NUM_Y, display: 'flex', justifyContent: 'center'}}>
    <Scramble f={f} text="59" at={lockAt} size={520} step={5} />
  </div>
</>;
const Hook = make(({f, cue, dur}) => {
  const p = hookPlan(cue);
  const cam = {x: 540, y: 960, z: 1 + 0.035 * clamp(f / dur)};
  return <Stage cam={cam}>
    <Label x={0} y={238} center size={26} op={eo(f, -4, 4)}>ARTIFICIAL ANALYSIS · INTELLIGENCE INDEX v5</Label>
    <div style={{position: 'absolute', left: 0, width: W, top: 290, textAlign: 'center', fontFamily: inter, fontWeight: 600, fontSize: 64, color: K.ink, letterSpacing: -1}}>Gemini 4 Carbon</div>
    <Hero f={f} lockAt={-5} lit={14} />
    {/* #1 badge */}
    {f >= 8 && <div style={{position: 'absolute', left: 796, top: 520, transform: `scale(${back((f - 8) / 7)}) rotate(-6deg)`, padding: '10px 26px', borderRadius: 999, background: K.accent,
      fontFamily: inter, fontWeight: 600, fontSize: 64, color: K.bg, boxShadow: GLOW(0.5)}}>#1</div>}
    <UseButton f={f} at={p.a - 6} cx={540} y={BTN_Y} shut={p.a + 3} />
    <Src text="来源：Artificial Analysis 2026.10.28 · 主视觉：Google" x={540} y={1268} f={f} at={10} right={false} />
  </Stage>;
}, (cue) => {
  const p = hookPlan(cue);
  return [{at: 0, kind: 'tick', gain: 0.1}, {at: 0, kind: 'thud', gain: 0.12}, {at: 5, kind: 'tick', gain: 0.1}, {at: 8, kind: 'pop', gain: 0.12}, {at: 14, kind: 'fs-whoosh-wipe', gain: 0.07},
    {at: p.a - 4, kind: 'whoosh-short', gain: 0.08}, {at: p.a + 2, kind: 'block', gain: 0.12}, {at: p.a + 3, kind: 'tap', gain: 0.1}];
});

/* ---------- 2 rank: 59 collapses into a bar; the window opens; 58 and 57 grow beside it — one or two points apart ---------- */

const BASE = 1130, HMAX = 560, BW = 190;
const BX = [148, 445, 742];
const rankPlan = (cue: Cue) => ({x: cue('x', 56), a: cue('a', 80), y: cue('y', 115)});
const Rank = make(({f, cue}) => {
  const p = rankPlan(cue);
  const top = (v: number) => BASE - (v / 60) * HMAX;
  return <Stage cam={camLerp(f, [[0, 540, 960, 1.04], [20, 540, 900, 1], [p.y + 10, 540, 860, 1.04], [p.y + 40, 520, 760, 1.12]])}>
    <Win f={f} at={0} x={60} y={330} w={960} h={1000} title="INTELLIGENCE INDEX v5 · TOP 3" status="AA · 2026.10.28" o={[540, 820]}>
      <div style={{position: 'absolute', left: 30, top: 100, fontFamily: jet, fontSize: 22, color: K.ink3, letterSpacing: 1}}>0 ─ 60 · 同一把尺</div>
    </Win>
    {f >= 6 && <>
      <Bar f={f} at={6} x={BX[0]} base={BASE} w={BW} v={59} max={60} hMax={HMAX} name={"Gemini 4\nCarbon"} hero landAt={8} />
      <Bar f={f} at={Math.max(10, p.x - 14)} x={BX[1]} base={BASE} w={BW} v={58} max={60} hMax={HMAX} name={"Claude\nOpus 5.5"} landAt={p.x} delta="−1" />
      <Bar f={f} at={p.a - 6} x={BX[2]} base={BASE} w={BW} v={57} max={60} hMax={HMAX} name={"GPT-6\nAstra"} landAt={p.y} delta="−2" />
    </>}
    {/* the 59 line carried across: how little the others are below it */}
    {f >= p.x + 4 && <svg width={W} height={1920} style={{position: 'absolute', left: 0, top: 0}}><path d={`M${BX[0]} ${top(59)} L${BX[0] + (BX[2] + BW - BX[0]) * eo(f, p.x + 4, p.y + 4)} ${top(59)}`}
      stroke={K.accent} strokeWidth={2} strokeDasharray="6 6" /></svg>}
  </Stage>;
}, (cue) => {
  const p = rankPlan(cue);
  return [{at: 0, kind: 'whoosh-short', gain: 0.1}, {at: 8, kind: 'tick', gain: 0.08}, {at: p.x - 14, kind: 'pop', gain: 0.07}, {at: p.x, kind: 'tick', gain: 0.09}, {at: p.a - 6, kind: 'pop', gain: 0.07},
    {at: p.y, kind: 'tick', gain: 0.09}, {at: p.y + 8, kind: 'tap', gain: 0.07}];
});

/* ---------- 3 cyber: strongest at security — a flagged line found (88.2 %), patched (71.0 %); Google's own runs ---------- */

const CODE = [0.62, 0.48, 0.74, 0.36, 0.58, 0.7, 0.44, 0.52, 0.66, 0.4]; // abstract code lines (示意, no real code)
const FLAG = 4;
const cyberPlan = (cue: Cue) => ({a: cue('a', 65), n: cue('n', 113), b: cue('b', 154), m: cue('m', 179), c: cue('c', 210)});
const Shield: React.FC<{f: number; at: number; size: number}> = ({f, at, size}) => {
  const p = eo(f, at, at + 14);
  return <svg width={size} height={size * 1.15} viewBox="0 0 100 115" style={{filter: `drop-shadow(0 0 18px rgba(78,171,235,${0.5 * p}))`}}>
    <path d="M50 4 L92 20 V54 C92 82 74 100 50 111 C26 100 8 82 8 54 V20 Z" fill="none" stroke={K.accent} strokeWidth={4.5} strokeDasharray={330} strokeDashoffset={330 * (1 - p)} strokeLinejoin="round" />
    <path d="M32 57 L45 70 L70 42" fill="none" stroke={K.accent} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={70} strokeDashoffset={70 * (1 - eo(f, at + 10, at + 18))} />
  </svg>;
};
const Cyber = make(({f, cue}) => {
  const p = cyberPlan(cue);
  const lineY = (i: number) => 470 + i * 52;
  const scan = clamp((f - p.a) / 30);
  const found = f >= p.a + 30;
  const patched = f >= p.b + 8;
  const shrink = eo(f, p.c, p.c + 12);
  return <Stage cam={camLerp(f, [[0, 540, 960, 1.06], [16, 540, 960, 1], [p.a, 540, 900, 1], [p.n + 10, 540, 860, 1.05], [p.c, 540, 860, 1.05], [p.c + 14, 540, 960, 1]])}>
    {/* the topic: a shield on the grid (until the code card opens) */}
    {f < p.a + 8 && <div style={{position: 'absolute', left: 0, width: W, top: 520, display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: f < p.a ? 1 : 1 - eo(f, p.a, p.a + 8),
      transform: `scale(${back(f / 8)})`}}>
      <Shield f={f} at={2} size={300} />
      <div style={{fontFamily: jet, fontWeight: 500, fontSize: 44, letterSpacing: 8, color: K.ink, marginTop: 40}}>CYBERSECURITY</div>
    </div>}
    {/* the code card: abstract lines; a scan finds one, a patch replaces it */}
    <Win f={f} at={p.a - 4} x={90} y={360} w={900} h={640} title="真实软件 · 示意" status={patched ? 'PATCHED' : found ? '1 FOUND' : 'SCANNING'} o={[540, 700]} out={p.c + 10}>
      {CODE.map((wd, i) => {
        const y = lineY(i) - 360;
        const flagged = i === FLAG && found;
        return <div key={i} style={{position: 'absolute', left: 60 + (i % 3) * 28, top: y, width: 760 * wd, height: 18, borderRadius: 9,
          background: flagged ? (patched ? K.ink3 : K.accent) : 'rgba(169,182,204,0.28)', opacity: flagged && patched ? 0.35 : 1, boxShadow: flagged && !patched ? GLOW(0.45) : 'none'}}>
          {flagged && patched && <div style={{position: 'absolute', left: -6, right: -6, top: 7, height: 3, background: K.ink2}} />}
        </div>;
      })}
      {/* the patch: a new line types in under the flagged one */}
      {patched && <div style={{position: 'absolute', left: 60 + (FLAG % 3) * 28, top: lineY(FLAG) - 360 + 30, height: 18, width: 760 * 0.5 * eo(f, p.b + 8, p.b + 20), borderRadius: 9, background: K.accent, boxShadow: GLOW(0.35)}} />}
      {/* scan beam */}
      {f >= p.a && !found && <div style={{position: 'absolute', left: 0, right: 0, top: 90 + scan * 520, height: 60, background: 'linear-gradient(180deg, transparent, rgba(78,171,235,0.22), transparent)'}} />}
    </Win>
    {/* readings */}
    <div style={{position: 'absolute', left: 90, top: 1040 - 850 * shrink, opacity: f >= p.n - 6 ? 1 : 0, transformOrigin: '0 0', transform: `scale(${1 - shrink * 0.42})`}}>
      <div style={{fontFamily: font, fontWeight: 800, fontSize: 40, color: K.ink2}}>找漏洞 <span style={{fontFamily: jet, fontSize: 26, color: K.ink3, letterSpacing: 1}}>SEC-bench Pro</span></div>
      <Scramble f={f} text="88.2%" at={p.n - 2} size={170} step={4} />
    </div>
    <div style={{position: 'absolute', left: 590 - 110 * shrink, top: 1040 - 850 * shrink, opacity: f >= p.m - 6 ? 1 : 0, transformOrigin: '0 0', transform: `scale(${1 - shrink * 0.42})`}}>
      <div style={{fontFamily: font, fontWeight: 800, fontSize: 40, color: K.ink2}}>写补丁 <span style={{fontFamily: jet, fontSize: 26, color: K.ink3, letterSpacing: 1}}>CWE-bench</span></div>
      <Scramble f={f} text="71.0%" at={p.m - 2} size={170} step={4} />
    </div>
    {/* the evidence: Google's own two charts, Google's own runs */}
    <Win f={f} at={p.c + 4} x={60} y={430} w={960} h={760} title="SOURCE · GOOGLE 自测" status="无护栏评测" o={[540, 1100]} level={1}>
      <Img src={staticFile(IMG('secbench-pro.png'))} style={{position: 'absolute', left: 24, top: 96, width: 448, borderRadius: 12}} />
      <Img src={staticFile(IMG('cwe-bench.png'))} style={{position: 'absolute', left: 488, top: 96, width: 448, borderRadius: 12}} />
      <div style={{position: 'absolute', left: 30, top: 380, right: 30, fontFamily: font, fontWeight: 800, fontSize: 52, color: K.ink, lineHeight: 1.3}}>
        Google 自己跑的分<br /><span style={{fontFamily: jet, fontWeight: 500, fontSize: 28, color: K.ink3, letterSpacing: 1}}>evaluated without guardrails · blog.google 2026.10.28</span>
      </div>
    </Win>
  </Stage>;
}, (cue) => {
  const p = cyberPlan(cue);
  return [{at: 0, kind: 'whoosh-short', gain: 0.09}, {at: 4, kind: 'fs-whoosh-wipe', gain: 0.06}, {at: p.a - 4, kind: 'pop', gain: 0.08}, ...Array.from({length: 6}, (_, i) => ({at: p.a + i * 5, kind: 'tick', gain: 0.04})),
    {at: p.a + 30, kind: 'tap', gain: 0.1}, {at: p.n, kind: 'tick', gain: 0.08}, {at: p.n + 8, kind: 'tick', gain: 0.08}, {at: p.b + 8, kind: 'tap', gain: 0.09}, {at: p.m + 6, kind: 'tick', gain: 0.08},
    {at: p.c + 4, kind: 'whoosh-short', gain: 0.08}];
});

/* ---------- 4 access (the signature): four rows on the grid; the band passes; only one lights ---------- */

const ROWS = [
  {zh: '网安防御方', en: 'CYBER DEFENDERS', on: true},
  {zh: '开发者', en: 'DEVELOPERS'},
  {zh: '企业', en: 'BUSINESSES'},
  {zh: '普通用户', en: 'CONSUMERS'},
];
const accessPlan = (cue: Cue) => ({b: cue('b', 18), g: cue('g', 67), a: cue('a', 99), d: cue('d', 135)});
const ROW_Y = (i: number) => 470 + i * 178;
const Access = make(({f, cue}) => {
  const p = accessPlan(cue);
  const LIGHT = 30; // the climax: the band reaches row 1 (score.climaxAt ≈ 1.0 s with the 0.1 s lead)
  const status = '尽快 · 无日期';
  const nType = Math.floor(clamp((f - p.d) / 18) * [...status].length);
  const nudge = (i: number) => { const at = i === 1 ? p.a : i === 3 ? p.a + 22 : p.a + 11; return f < at ? 0 : Math.sin(clamp((f - at) / 14) * Math.PI); };
  return <Stage cam={camLerp(f, [[0, 540, 1150, 1.5], [12, 540, 960, 1], [LIGHT + 30, 540, 940, 1.03], [LIGHT + 150, 540, 900, 1.08]])} glow={0.6}>
    {/* the button pushed into, frozen — then it opens into the list */}
    {f < 12 && <UseButton f={f + 40} at={0} cx={540} y={BTN_Y} shut={0} />}
    <Win f={f} at={8} x={60} y={330} w={960} h={900} title="ACCESS · GEMINI 4 CARBON" status="2026.10.28" o={[540, BTN_Y + 50]} level={1}>
      {ROWS.map((r, i) => {
        const at = 14 + i * 4;
        if (f < at) return null;
        const lit = r.on && f >= LIGHT;
        const q = back((f - at) / 6);
        const y = ROW_Y(i) - 330;
        return <div key={i} style={{position: 'absolute', left: 30, top: y, width: 900, height: 146, borderRadius: 22, transform: `translateY(${(1 - q) * 30}px)`, opacity: clamp((f - at) / 3),
          background: lit ? 'linear-gradient(90deg, rgba(78,171,235,0.24), rgba(78,171,235,0.08))' : K.s2, border: lit ? `2px solid ${K.accent}` : '1px solid rgba(255,255,255,0.07)',
          boxShadow: lit ? GLOW(0.35) : 'none'}}>
          <div style={{position: 'absolute', left: 36, top: 48, width: 50, height: 50, borderRadius: 25, border: `3px solid ${lit ? K.accent : K.off}`, background: lit ? K.accent : 'transparent'}}>
            {lit && <svg width={50} height={50} viewBox="0 0 50 50" style={{position: 'absolute', left: -3, top: -3}}><path d="M14 26 L22 34 L37 17" fill="none" stroke={K.bg} strokeWidth={5} strokeLinecap="round" strokeLinejoin="round"
              strokeDasharray={40} strokeDashoffset={40 * (1 - eo(f, LIGHT, LIGHT + 6))} /></svg>}
          </div>
          <div style={{position: 'absolute', left: 120, top: 22, fontFamily: font, fontWeight: 900, fontSize: 64, color: lit ? K.ink : r.on ? K.ink2 : K.ink3}}>{r.zh}</div>
          <div style={{position: 'absolute', left: 122, top: 104, fontFamily: jet, fontWeight: 500, fontSize: 20, letterSpacing: 3, color: K.ink3}}>{r.en}</div>
          <div style={{position: 'absolute', right: 34, top: r.on ? 30 : 50, fontFamily: font, fontWeight: 800, fontSize: 40, color: lit ? K.accent : K.ink3, whiteSpace: 'nowrap'}}>
            {r.on ? (f >= LIGHT + 4 ? '本周起 · 部分' : '') : [...status].slice(0, nType).join('')}
          </div>
          {/* "guardrails still being tuned": a spinner on the lit row */}
          {r.on && f >= p.g && <div style={{position: 'absolute', right: 34, top: 92, display: 'flex', alignItems: 'center', gap: 12, opacity: eo(f, p.g, p.g + 6)}}>
            <svg width={26} height={26} viewBox="0 0 26 26" style={{transform: `rotate(${(f - p.g) * 14}deg)`}}><circle cx={13} cy={13} r={10} fill="none" stroke={K.ink3} strokeWidth={3} />
              <path d="M13 3 A10 10 0 0 1 23 13" fill="none" stroke={K.accent} strokeWidth={3} strokeLinecap="round" /></svg>
            <div style={{fontFamily: jet, fontWeight: 500, fontSize: 22, letterSpacing: 2, color: K.ink2}}>GUARDRAILS · ITERATING</div>
          </div>}
          {/* named in the voice: the waiting rows nudge once */}
          {!r.on && nudge(i) > 0 && <div style={{position: 'absolute', inset: -2, borderRadius: 22, border: `2px solid ${K.ink3}`, opacity: nudge(i)}} />}
        </div>;
      })}
      {/* the band */}
      {f >= LIGHT - 8 && f < LIGHT + 22 && <div style={{position: 'absolute', left: -200 + 1400 * clamp((f - LIGHT + 8) / 30), top: 0, width: 260, height: 900,
        background: 'linear-gradient(90deg, transparent, rgba(200,230,255,0.16), transparent)', transform: 'skewX(-14deg)'}} />}
    </Win>
    {/* the unlit rows sit at a few percent */}
    {f >= LIGHT && <div style={{position: 'absolute', left: 90, top: ROW_Y(1) - 4, width: 900, height: 178 * 3, background: '#03070F', opacity: 0.32 * eo(f, LIGHT, LIGHT + 10), borderRadius: 22}} />}
    <Src text="“Starting this week … a subset of cyber defenders” — Google" x={540} y={1252} f={f} at={p.g} />
  </Stage>;
}, (cue) => {
  const p = accessPlan(cue);
  return [{at: 8, kind: 'whoosh-short', gain: 0.08}, ...ROWS.map((_, i) => ({at: 14 + i * 4, kind: 'tick', gain: 0.07})), {at: 30, kind: 'chime', gain: 0.12}, {at: 30, kind: 'pop', gain: 0.1},
    ...Array.from({length: 7}, (_, i) => ({at: p.d + i * 3, kind: 'tap', gain: 0.025}))];
});

/* ---------- 5 price: the list folds back into the button; a price tag above it; intro → standard ---------- */

const pricePlan = (cue: Cue) => ({b: cue('b', 49), o: cue('o', 79), a: cue('a', 107)});
const Price = make(({f, cue}) => {
  const p = pricePlan(cue);
  const flip = f >= p.a + 6;
  const strike = eo(f, p.a, p.a + 6);
  const Col: React.FC<{label: string; intro: string; std: string; at: number; x: number}> = ({label, intro, std, at, x}) => <div style={{position: 'absolute', left: x, top: 170, width: 440}}>
    <div style={{fontFamily: font, fontWeight: 800, fontSize: 44, color: K.ink2}}>{label}</div>
    <div style={{position: 'relative', marginTop: 12, height: 240}}>
      {!flip ? <Scramble f={f} text={intro} at={at} size={230} step={4} from={6} /> : <Scramble f={f} text={std} at={p.a + 6} size={230} step={4} color={K.ink} glow={false} />}
      {!flip && strike > 0 && <div style={{position: 'absolute', left: -10, top: 118, width: 400 * strike, height: 7, background: K.ink, borderRadius: 3}} />}
    </div>
  </div>;
  return <Stage cam={camLerp(f, [[0, 540, 960, 1], [p.a, 540, 940, 1.03], [p.a + 30, 540, 900, 1.06]])}>
    <Win f={f} at={0} x={60} y={340} w={960} h={640} title="PRICE · PER 1M TOKENS" status={flip ? 'STANDARD' : 'INTRODUCTORY'} o={[540, BTN_Y + 50]}>
      <Col label="输入" intro="$2" std="$4" at={p.b - 2} x={60} />
      <Col label="输出" intro="$10" std="$20" at={p.o - 2} x={510} />
      <div style={{position: 'absolute', left: 60, top: 520, padding: '8px 22px', borderRadius: 999, border: `2px solid ${flip ? K.ink2 : K.accent}`, fontFamily: font, fontWeight: 800, fontSize: 38,
        color: flip ? K.ink2 : K.accent}}>{flip ? '标准价' : '首发价'}</div>
      {flip && <div style={{position: 'absolute', left: 260, top: 532, fontFamily: jet, fontWeight: 500, fontSize: 22, color: K.ink3, letterSpacing: 1, opacity: eo(f, p.a + 12, p.a + 20)}}>首发 5 折 · 结束日期未定（AA）</div>}
    </Win>
    <UseButton f={f} at={-30} cx={540} y={BTN_Y} shut={-30} />
    <Src text="来源：blog.google · artificialanalysis.ai 2026.10.28" x={540} y={1268} f={f} at={8} />
  </Stage>;
}, (cue) => {
  const p = pricePlan(cue);
  return [{at: 0, kind: 'whoosh-short', gain: 0.08}, {at: p.b + 2, kind: 'tick', gain: 0.09}, {at: p.o + 2, kind: 'tick', gain: 0.09}, {at: p.a, kind: 'fs-paper-slide', gain: 0.07}, {at: p.a + 8, kind: 'tick', gain: 0.09}];
});

/* ---------- 6 notall: back to the bar window (the rhyme) — coding agents: Opus 5.5 62, Carbon 59 ---------- */

const notallPlan = (cue: Cue) => ({a: cue('a', 44), b: cue('b', 67), c: cue('c', 134)});
const Notall = make(({f, cue}) => {
  const p = notallPlan(cue);
  const top = (v: number) => BASE - (v / 64) * HMAX;
  const whip = clamp(1 - Math.abs(f - 3) / 4);
  return <Stage cam={camLerp(f, [[0, 700, 960, 1.1], [8, 540, 900, 1], [p.c + 10, 560, 820, 1.08]])}>
    <div style={{position: 'absolute', inset: 0, filter: whip ? `blur(${whip * 10}px)` : undefined}}>
      <Win f={f} at={0} x={60} y={330} w={960} h={1000} title={f >= p.a ? 'CODING AGENT INDEX v2' : 'INTELLIGENCE INDEX v5 · TOP 3'} status="AA · 2026.10.28" o={[300, 820]}>
        <div style={{position: 'absolute', left: 30, top: 100, fontFamily: jet, fontSize: 22, color: K.ink3, letterSpacing: 1}}>0 ─ 64 · 同一把尺</div>
      </Win>
      {f < p.a + 4 && <div style={{opacity: 1 - eo(f, p.a - 2, p.a + 4)}}>
        <Bar f={f} at={0} x={BX[0]} base={BASE} w={BW} v={59} max={64} hMax={HMAX} name={"Gemini 4\nCarbon"} hero landAt={-10} />
        <Bar f={f} at={0} x={BX[1]} base={BASE} w={BW} v={58} max={64} hMax={HMAX} name={"Claude\nOpus 5.5"} landAt={-10} />
        <Bar f={f} at={0} x={BX[2]} base={BASE} w={BW} v={57} max={64} hMax={HMAX} name={"GPT-6\nAstra"} landAt={-10} />
      </div>}
      {f >= p.a + 2 && <>
        <Bar f={f} at={p.b - 8} x={200} base={BASE} w={BW + 30} v={62} max={64} hMax={HMAX} name={"Claude\nOpus 5.5"} sub="CLAUDE CODE" landAt={p.b + 8} />
        <Bar f={f} at={p.c - 10} x={640} base={BASE} w={BW + 30} v={59} max={64} hMax={HMAX} name={"Gemini 4\nCarbon"} sub="ANTIGRAVITY CLI" hero landAt={p.c} />
        <Measure f={f} at={p.c + 6} x0={200 + BW + 30} x1={640 + BW + 50} y0={top(62)} y1={top(59)} label="−3" />
      </>}
    </div>
  </Stage>;
}, (cue) => {
  const p = notallPlan(cue);
  return [{at: 0, kind: 'whoosh', gain: 0.1}, {at: p.a, kind: 'fs-paper-slide', gain: 0.06}, {at: p.b - 8, kind: 'pop', gain: 0.07}, {at: p.b + 8, kind: 'tick', gain: 0.09}, {at: p.c - 10, kind: 'pop', gain: 0.07},
    {at: p.c, kind: 'tick', gain: 0.09}, {at: p.c + 6, kind: 'tap', gain: 0.07}];
});

/* ---------- 7 end: everything folds away; one tile left — 59 — and the button, still grey; the stage goes out ---------- */

const endPlan = (cue: Cue) => ({a: cue('a', 43)});
const End = make(({f, cue, dur}) => {
  const p = endPlan(cue);
  const fold = eo(f, 0, 10);
  const out = eo(f, p.a + 20, dur - 2);
  return <Stage cam={{x: 540, y: 960, z: 1.035 - 0.035 * fold}} dim={out * 0.55} glow={1 - out}>
    {/* the bar window folding into the tile */}
    {f < 10 && <div style={{position: 'absolute', left: 60 + 420 * fold, top: 330 + 300 * fold, width: 960 - 840 * fold, height: 1000 - 700 * fold, borderRadius: 28, background: K.s2,
      border: '1px solid rgba(255,255,255,0.09)', opacity: 1 - fold}} />}
    <Label x={0} y={238} center size={26} op={eo(f, 4, 12) * (1 - out)}>ARTIFICIAL ANALYSIS · INTELLIGENCE INDEX v5</Label>
    <div style={{position: 'absolute', left: 0, width: W, top: 290, textAlign: 'center', fontFamily: inter, fontWeight: 600, fontSize: 64, color: K.ink, letterSpacing: -1, opacity: eo(f, 4, 12) * (1 - out)}}>Gemini 4 Carbon</div>
    <Hero f={f + 40} lockAt={0} lit={-60} crystal={1 - out * 0.7} />
    <UseButton f={f} at={4} cx={540} y={BTN_Y} shut={4} jolt={p.a + 2} />
  </Stage>;
}, (cue) => {
  const p = endPlan(cue);
  return [{at: 0, kind: 'whoosh-short', gain: 0.07}, {at: 8, kind: 'tick', gain: 0.07}, {at: p.a + 2, kind: 'block', gain: 0.1}];
});

/** Cover anchor (880 × 800, f = 0): the 59 over the crystal, the #1, the grey button and its lock. */
const Cover: Scene = () => <div style={{position: 'absolute', left: 0, top: 0, width: 880, height: 800, overflow: 'hidden', background: K.bg}}>
  <div style={{position: 'absolute', left: -100, top: -420, width: W, height: 1920}}>
    <Stage>
      <Hero f={200} lockAt={0} lit={-60} />
      <div style={{position: 'absolute', left: 796, top: 520, transform: 'rotate(-6deg)', padding: '10px 26px', borderRadius: 999, background: K.accent, fontFamily: inter, fontWeight: 600, fontSize: 64, color: K.bg}}>#1</div>
      <UseButton f={200} at={0} cx={540} y={BTN_Y} shut={0} />
    </Stage>
  </div>
</div>;

export const gemini4CarbonScenes: Record<string, Scene> = {
  'gc.hook': Hook, 'gc.rank': Rank, 'gc.cyber': Cyber, 'gc.access': Access, 'gc.price': Price, 'gc.notall': Notall, 'gc.end': End, 'gc.cover': Cover,
};
