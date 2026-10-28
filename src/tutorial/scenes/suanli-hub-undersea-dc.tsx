import React from 'react';
import {Img, OffthreadVideo, staticFile} from 'remotion';
import {clamp, ease} from '../../fx';
import {font} from '../theme';
import {cond, plex} from '../fonts';
import {Cue, Scene} from '../paper';
import {Pk, W, eo, fmt, roll} from '../package';

// suanli-hub-undersea-dc, made on the template lemo/satellite-briefing (docs/video-craft/prompt-library/vendor/lemomo-ai__
// lemo-opuscar/3961ddb/styles/satellite-briefing/STYLE.md; picked by prompt-library/选用指南.md §〇: places and
// infrastructure). A question seen 1.9 M times on X ("if AI needs massive cooling why not build data centers under the
// ocean?") answered from orbit: Microsoft sank one in 2018; China runs them (Lingshui pod, Lingang platform since Feb 2026);
// the rest moved west (Zhongwei, Tengger desert edge, 8.8 °C); 145 trunk cables keep every province < 20 ms from the eight
// hubs (NDRC, 2026-06-18). Inputs: inputs/suanli-hub-undersea-dc/ (README.md, REVIEW-DOUYIN.md, sources.md, transcript/).
// Storyboard: tutorials/suanli-hub-undersea-dc.storyboard.md.
// - review: 145 cables and < 20 ms are the NDRC's (李超, 2026-06-18), not CCTV's 10-27 report; no stand-in footage for the
//   Hainan pod (it is a pin and a reading only); nothing about Natick ending in 2024; CCTV footage keeps its logo and says
//   「来源：央视新闻」; Natick photos say "Photo: Microsoft".
// - maps (平台与合规.md §6): no borders, no outlines, no country names — satellite photographs and coordinate pins only.
// - What the template gives: two layers, two truths (the ground is a public-domain photograph — NASA Blue Marble, USGS
//   Landsat — and the white hairlines are what we measured); the analyst's grey; one accent for the one reading on screen;
//   a second hue for the claim being tested (the viral render); true colour only where the story turns; the camera never
//   stops (log-space zoom, creep on holds); marks are made (lines grow, counters roll and land, reticles snap); instruments
//   (field of view, scale bar, imagery credit) in screen space; the transcript strip (look.captions "strip").
// - Customised (模板改造): the reading is the Lingang platform's orange, the claim hue the render's electric blue; CCTV
//   aerials hang off the pins as small "closer photographs"; the map torn away becomes the viral render torn away; wind
//   streamlines over the Tengger sand.
// Ground: a 2D plane in lon/lat (equirectangular, one cos φ for the whole film) under a CSS perspective tilt; every mark is
// projected by the same camera in JS so labels stay upright. Everything is drawn in the scene backdrop; the stage is empty.

export const DC: Pk = {bg: '#0B1015', panel: '#121A21', ink: '#F2F5F6', accent: '#F2913D', onAccent: '#0B1015', dim: '#A1A7A9', second: '#1798D4'};
const k = DC;
const IMG = (n: string) => `images/suanli-hub-undersea-dc/${n}`;
const VID = (n: string) => `video/suanli-hub-undersea-dc/${n}.mp4`;
const CCTV = '来源：央视新闻';
const MS = 'Photo: Microsoft';
const IMAGERY = '影像 Landsat · USGS/NASA   Blue Marble · NASA';

/* ---------- the camera and the ground ---------- */

const CY = 820; // the frame's optical centre (picture weighted up, the transcript strip below)
const P = 1700; // perspective distance (px)
const KX = 111.32 * Math.cos((33 * Math.PI) / 180), KY = 110.57; // km per degree (one cos φ for the whole film)
type Cam = {lon: number; lat: number; w: number; tilt: number; rot: number}; // w = km across the 1080 px frame
type LL = [number, number]; // [lon, lat]

const PLACES = {
  lingang: [121.93, 30.9] as LL, // 滴水湖, Lingang new city
  lingshui: [110.04, 18.5] as LL,
  zhongwei: [105.19, 37.51] as LL,
  tengger: [104.75, 37.58] as LL, // the Tengger sand south-west of the Landsat plate's north-west corner
};
// The eight national hubs (东数西算), one pin each at the hub city — coordinates only, no outlines.
const HUBS: LL[] = [[114.88, 40.77], [118.43, 31.35], [113.6, 24.8], [106.55, 29.56], [111.82, 40.38], [106.4, 26.4], [107.64, 35.71], [105.19, 37.51]];
const RANGE_KM = 1702; // great-circle 临港 → 中卫 from the two coordinates (measured, labelled 测算)

type Plate = {src: string; w: number; s: number; e: number; n: number; feather?: number; lift?: number; show?: (c: Cam) => number};
const PLATES: Plate[] = [
  // Blue Marble is a dark image: lifted so the grade lands in the template's 3–65 % grey
  {src: IMG('asia-wide.jpg'), w: 60, s: -10, e: 160, n: 65, lift: 1.75},
  {src: IMG('eastasia.jpg'), w: 96, s: 14, e: 130, n: 46, feather: 6, lift: 1.75, show: (c) => clamp((9000 - c.w) / 3000)},
  {src: IMG('lingang.jpg'), w: 121.45, s: 30.55, e: 122.35, n: 31.04, feather: 22, lift: 0.92, show: (c) => clamp((330 - c.w) / 200)},
  {src: IMG('zhongwei.jpg'), w: 104.55, s: 37.15, e: 105.85, n: 37.85, feather: 18, lift: 0.95, show: (c) => clamp((330 - c.w) / 200)},
];

const pxk = (c: Cam) => W / c.w;
/** Flat (pre-tilt) frame coordinates of a lon/lat point. */
const flat = (c: Cam, [lon, lat]: LL): [number, number] => [540 + (lon - c.lon) * KX * pxk(c), CY - (lat - c.lat) * KY * pxk(c)];
/** Screen coordinates: the same rotate → tilt → perspective the CSS applies to the ground. */
const proj = (c: Cam, ll: LL): [number, number] => {
  const [x, y] = flat(c, ll);
  const r = (c.rot * Math.PI) / 180, t = (c.tilt * Math.PI) / 180;
  const u = (x - 540) * Math.cos(r) - (y - CY) * Math.sin(r), v = (x - 540) * Math.sin(r) + (y - CY) * Math.cos(r);
  const s = P / (P - v * Math.sin(t));
  return [540 + u * s, CY + v * Math.cos(t) * s];
};

type Key = Cam & {at: number};
/** The camera at frame f between keys: lon/lat eased, w in log space (STYLE.md §5), tilt/rot eased. Holds creep. */
const track = (f: number, keys: Key[], creep = 0.03): Cam => {
  const last = keys[keys.length - 1];
  if (f >= last.at) return {...last, w: last.w * (1 - creep * clamp((f - last.at) / 90))};
  let i = 0;
  while (i < keys.length - 2 && f >= keys[i + 1].at) i++;
  const a = keys[i], b = keys[i + 1];
  const t = ease.inOutCubic(clamp((f - a.at) / Math.max(1, b.at - a.at)));
  const L = (x: number, y: number) => x + (y - x) * t;
  return {lon: L(a.lon, b.lon), lat: L(a.lat, b.lat), w: Math.exp(L(Math.log(a.w), Math.log(b.w))), tilt: L(a.tilt, b.tilt), rot: L(a.rot, b.rot)};
};
const key = (at: number, [lon, lat]: LL, w: number, tilt = 0, rot = 0): Key => ({at, lon, lat, w, tilt, rot});

/** The ground: photographs under the analyst's grade (`grey` 1 = full grade, 0 = true colour), optional blur for whips,
 *  optional true-colour disc around a point (STYLE.md §8 "colour returns where the story turns"). */
const Ground: React.FC<{c: Cam; grey?: number; blur?: number; colourAt?: LL; colourR?: number; colourA?: number}> = ({c, grey = 1, blur = 0, colourAt, colourR = 0, colourA = 0}) => {
  const px = pxk(c);
  const layer = (graded: boolean, mask?: string) => <div style={{position: 'absolute', left: -1400, top: -1900, width: 3880, height: 5600, overflow: 'hidden',
    filter: graded ? `grayscale(${0.82 * grey}) contrast(${1 + 0.18 * grey}) brightness(${1 - 0.12 * grey})${blur ? ` blur(${blur}px)` : ''}` : `saturate(0.78) contrast(1.04)${blur ? ` blur(${blur}px)` : ''}`,
    WebkitMaskImage: mask, maskImage: mask}}>
    {PLATES.map((p, i) => {
      const op = p.show ? p.show(c) : 1;
      if (op <= 0.001) return null;
      const [x0, y0] = flat(c, [p.w, p.n]);
      const ww = (p.e - p.w) * KX * px, hh = (p.n - p.s) * KY * px;
      if (x0 > 2500 || y0 > 3700 || x0 + ww < -1400 || y0 + hh < -1900) return null;
      const fe = p.feather ?? 0;
      const m = fe ? `linear-gradient(90deg, transparent, #000 ${fe}%, #000 ${100 - fe}%, transparent), linear-gradient(180deg, transparent, #000 ${fe}%, #000 ${100 - fe}%, transparent)` : undefined;
      return <Img key={i} src={staticFile(p.src)} style={{position: 'absolute', left: x0 + 1400, top: y0 + 1900, width: ww, height: hh, opacity: op, filter: p.lift ? `brightness(${p.lift})` : undefined,
        WebkitMaskImage: m, maskImage: m, WebkitMaskComposite: 'source-in', maskComposite: 'intersect'}} />;
    })}
  </div>;
  let disc: React.ReactNode = null;
  if (colourAt && colourA > 0) {
    const [x, y] = flat(c, colourAt);
    disc = <div style={{position: 'absolute', inset: 0, opacity: colourA}}>{layer(false, `radial-gradient(circle ${colourR}px at ${x + 1400}px ${y + 1900}px, #000 70%, transparent 100%)`)}</div>;
  }
  return <div style={{position: 'absolute', inset: 0, overflow: 'hidden', background: '#05080B'}}>
    <div style={{position: 'absolute', left: 0, top: 0, width: W, height: 1920, transformOrigin: `540px ${CY}px`, transform: `perspective(${P}px) rotateX(${c.tilt}deg) rotate(${c.rot}deg)`}}>
      {layer(true)}
      {disc}
    </div>
    {/* the analyst's tone: blue-black → cool silver (STYLE.md §2) */}
    <div style={{position: 'absolute', inset: 0, background: '#0D1C26', mixBlendMode: 'soft-light', opacity: 0.55 * grey}} />
    {/* sky beyond the far edge when tilted */}
    {c.tilt > 1 && <div style={{position: 'absolute', left: 0, top: 0, width: W, height: 420, background: 'linear-gradient(180deg, rgba(5,8,11,0.95), rgba(5,8,11,0))', opacity: clamp(c.tilt / 30)}} />}
  </div>;
};

/* ---------- marks: hairlines with a dark halo, made, never placed ---------- */

const HALO = 'rgba(0,0,0,0.55)';
const Hair: React.FC<{d: string; dash?: string; off?: number; w?: number; c?: string; op?: number}> = ({d, dash, off, w = 2.2, c = k.ink, op = 1}) => <g opacity={op}>
  <path d={d} fill="none" stroke={HALO} strokeWidth={w + 3} strokeDasharray={dash} strokeDashoffset={off} strokeLinecap="round" />
  <path d={d} fill="none" stroke={c} strokeWidth={w} strokeDasharray={dash} strokeDashoffset={off} strokeLinecap="round" />
</g>;
const Svg: React.FC<{children: React.ReactNode}> = ({children}) => <svg width={W} height={1920} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>{children}</svg>;

/** A coordinate pin: ring + dot, pops in with a ripple. */
const Pin: React.FC<{x: number; y: number; f: number; at: number; c?: string; r?: number}> = ({x, y, f, at, c = k.ink, r = 11}) => {
  if (f < at) return null;
  const p = ease.outBack(clamp((f - at) / 8), 2), rip = clamp((f - at) / 22);
  return <g>
    <circle cx={x} cy={y} r={r + 34 * rip} fill="none" stroke={c} strokeWidth={2} opacity={(1 - rip) * 0.8} />
    <circle cx={x} cy={y} r={r * p} fill="none" stroke={HALO} strokeWidth={6} />
    <circle cx={x} cy={y} r={r * p} fill="none" stroke={c} strokeWidth={2.6} />
    <circle cx={x} cy={y} r={3.6 * p} fill={c} />
  </g>;
};
/** A ground label on a leader line (STYLE.md §4: labels attach to the ground). `dx, dy` place the text from the point. */
const Label: React.FC<{x: number; y: number; f: number; at: number; text: string; sub?: string; dx?: number; dy?: number; size?: number}> = ({x, y, f, at, text, sub, dx = 70, dy = -70, size = 44}) => {
  if (f < at) return null;
  const p = eo(f, at, at + 8), q = eo(f, at + 5, at + 13);
  const ex = x + dx * p, ey = y + dy * p, right = dx >= 0;
  return <>
    <Svg><Hair d={`M${x} ${y} L${ex} ${ey} L${ex + (right ? 26 : -26) * p} ${ey}`} w={1.8} /></Svg>
    <div style={{position: 'absolute', left: right ? ex + 34 : undefined, right: right ? undefined : W - ex + 34, top: ey - size * 0.66, opacity: q, transform: `translateY(${(1 - q) * 10}px)`, textAlign: right ? 'left' : 'right'}}>
      <div style={{fontFamily: font, fontWeight: 900, fontSize: size, color: k.ink, whiteSpace: 'nowrap', textShadow: '0 0 6px rgba(0,0,0,0.9), 0 2px 12px rgba(0,0,0,0.8)'}}>{text}</div>
      {sub && <div style={{fontFamily: plex, fontWeight: 500, fontSize: 22, color: k.ink, opacity: 0.85, whiteSpace: 'nowrap', textShadow: '0 0 6px rgba(0,0,0,0.9)'}}>{sub}</div>}
    </div>
  </>;
};
/** The lock-on reticle: four brackets that snap onto (x, y) with overshoot; before `lock` they search along `from`. */
const Reticle: React.FC<{x: number; y: number; f: number; at: number; lock?: number; size?: number; from?: [number, number]; c?: string}> = ({x, y, f, at, lock = at, size = 120, from, c = k.ink}) => {
  if (f < at) return null;
  let cx = x, cy = y, s = size;
  if (f < lock && from) {
    const t = clamp((f - at) / Math.max(1, lock - at));
    cx = from[0] + (x - from[0]) * ease.inOutCubic(t) + Math.sin(f * 0.9) * 26 * (1 - t);
    cy = from[1] + (y - from[1]) * ease.inOutCubic(t) + Math.cos(f * 0.7) * 22 * (1 - t);
    s = size * 1.5;
  } else {
    s = size * (1 + 0.5 * (1 - ease.outBack(clamp((f - lock) / 7), 2.2)));
  }
  const h = s / 2, a = s * 0.28;
  const d = [[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([sx, sy]) => `M${cx + sx * h} ${cy + sy * h - sy * a} L${cx + sx * h} ${cy + sy * h} L${cx + sx * h - sx * a} ${cy + sy * h}`).join(' ');
  return <Svg><Hair d={d} w={2.6} c={c} />{f >= lock && <circle cx={cx} cy={cy} r={3} fill={c} />}</Svg>;
};

/** The one reading on screen (STYLE.md §4): label above, the number in the accent (rolls, lands with a pop), source below. */
const Reading: React.FC<{f: number; at: number; label: string; value: string | ((f: number) => string); unit?: string; src?: string; y?: number; out?: number; size?: number}> = ({f, at, label, value, unit, src, y = 250, out, size = 168}) => {
  if (f < at || (out !== undefined && f >= out + 6)) return null;
  const p = eo(f, at, at + 8) * (out !== undefined ? 1 - eo(f, out, out + 6) : 1);
  const v = typeof value === 'function' ? value(f) : value;
  const pop = 1 + 0.08 * Math.sin(clamp((f - at - 10) / 6) * Math.PI);
  return <div style={{position: 'absolute', left: 64, top: y, opacity: p, transform: `translateX(${(1 - p) * -30}px)`}}>
    <div style={{fontFamily: font, fontWeight: 900, fontSize: 40, color: k.ink, textShadow: '0 2px 10px rgba(0,0,0,0.85)'}}>{label}</div>
    <div style={{display: 'flex', alignItems: 'baseline', gap: 12, transformOrigin: '0 70%', transform: `scale(${pop})`}}>
      <span style={{fontFamily: cond, fontWeight: 800, fontSize: size, lineHeight: 1, color: k.accent, letterSpacing: -1, textShadow: '0 4px 18px rgba(0,0,0,0.6)'}}>{v}</span>
      {unit && <span style={{fontFamily: font, fontWeight: 900, fontSize: 52, color: k.accent, textShadow: '0 2px 10px rgba(0,0,0,0.7)'}}>{unit}</span>}
    </div>
    {src && <div style={{fontFamily: plex, fontWeight: 500, fontSize: 23, color: k.ink, opacity: 0.85, letterSpacing: 0.5, textShadow: '0 0 6px rgba(0,0,0,0.9)'}}>{src}</div>}
  </div>;
};

/** Instruments in screen space only (STYLE.md §2): field of view + scale bar top left, the imagery credit above the strip. */
const NICE = [5, 10, 20, 50, 100, 200, 500, 1000, 2000];
const Instruments: React.FC<{c: Cam}> = ({c}) => {
  const km = NICE.reduce((b, n) => (n * pxk(c) <= 260 ? n : b), NICE[0]);
  const len = km * pxk(c);
  return <>
    <div style={{position: 'absolute', left: 64, top: 180, fontFamily: plex, fontWeight: 500, fontSize: 24, color: k.ink, letterSpacing: 1, textShadow: '0 0 6px rgba(0,0,0,0.9)'}}>
      视野 {fmt(Math.round(c.w))} KM{c.tilt > 2 ? `  ·  倾斜 ${Math.round(c.tilt)}°` : ''}
    </div>
    <div style={{position: 'absolute', left: 64 + 0, top: 216, width: len, height: 10, borderLeft: `2px solid ${k.ink}`, borderRight: `2px solid ${k.ink}`, borderBottom: `2px solid ${k.ink}`, filter: 'drop-shadow(0 0 3px rgba(0,0,0,0.9))'}} />
    <div style={{position: 'absolute', left: 64 + len + 12, top: 206, fontFamily: plex, fontSize: 22, color: k.ink, textShadow: '0 0 6px rgba(0,0,0,0.9)'}}>{fmt(km)} km</div>
    <div style={{position: 'absolute', left: 64, top: 1286, fontFamily: plex, fontWeight: 500, fontSize: 20, color: k.ink, opacity: 0.8, letterSpacing: 0.5, textShadow: '0 0 6px rgba(0,0,0,0.95)'}}>{IMAGERY}</div>
  </>;
};

/** A source tag in the template's mono (for the one reading / the photograph on screen). */
const Tag: React.FC<{text: string; x?: number; y: number; right?: boolean; op?: number}> = ({text, x = 64, y, right, op = 1}) => <div style={{position: 'absolute', left: right ? undefined : x, right: right ? 160 : undefined, top: y,
  fontFamily: font, fontWeight: 700, fontSize: 24, color: k.ink, background: 'rgba(5,8,11,0.66)', padding: '4px 12px', whiteSpace: 'nowrap', opacity: op}}>{text}</div>;

/** A closer photograph hung off a pin: a CCTV aerial at native size × `scale`, white frame, leader line to the pin. */
const Window: React.FC<{f: number; at: number; src: string; from: number; srcW: number; srcH: number; scale: number; x: number; y: number; pin: [number, number]; out?: number; tag?: string}> = ({
  f, at, src, from, srcW, srcH, scale, x, y, pin, out, tag = CCTV,
}) => {
  if (f < at || (out !== undefined && f >= out)) return null;
  const p = ease.outCubic(clamp((f - at) / 9));
  const w = srcW * scale, h = srcH * scale;
  const cx = pin[0] + (x + w / 2 - pin[0]) * p, cy = pin[1] + (y + h / 2 - pin[1]) * p;
  const corner: [number, number] = [x + (pin[0] > x + w / 2 ? w : 0), y + (pin[1] > y + h / 2 ? h : 0)];
  return <>
    <Svg><Hair d={`M${pin[0]} ${pin[1]} L${pin[0] + (corner[0] - pin[0]) * p} ${pin[1] + (corner[1] - pin[1]) * p}`} w={1.6} dash="6 6" /></Svg>
    <div style={{position: 'absolute', left: cx - (w * p) / 2, top: cy - (h * p) / 2, width: w * p, height: h * p, overflow: 'hidden', outline: `2px solid ${k.ink}`, boxShadow: '0 10px 40px rgba(0,0,0,0.6)', background: '#000'}}>
      <OffthreadVideo src={staticFile(src)} startFrom={Math.round(from * 30)} muted style={{width: '100%', height: '100%', objectFit: 'cover', filter: 'contrast(1.06) saturate(0.85)'}} />
    </div>
    {p > 0.95 && <Tag text={tag} x={x} y={y + h + 10} />}
  </>;
};

/** A scan bar (a satellite pass, soft, never a hairline) moving down: everything above `y` is the new picture. */
const scanY = (f: number, at: number, d = 10) => -60 + 2040 * ease.inOutCubic(clamp((f - at) / d));
const ScanBar: React.FC<{y: number}> = ({y}) => (y <= -60 || y >= 1980 ? null : <div style={{position: 'absolute', left: 0, top: y - 70, width: W, height: 140,
  background: 'linear-gradient(180deg, rgba(242,245,246,0) 0, rgba(242,245,246,0.5) 48%, rgba(242,245,246,0.9) 50%, rgba(242,245,246,0.5) 52%, rgba(242,245,246,0) 100%)', mixBlendMode: 'screen'}} />);

/** A photograph filling the frame under a grade, pushed slowly; `ox, oy` (0–1) pick the crop centre. */
const Photo: React.FC<{src: string; f: number; dur: number; iw: number; ih: number; ox?: number; oy?: number; z?: [number, number]; filter?: string; clip?: string}> = ({src, f, dur, iw, ih, ox = 0.5, oy = 0.5, z = [1, 1.05], filter, clip}) => {
  const s0 = Math.max(W / iw, 1920 / ih);
  const s = s0 * (z[0] + (z[1] - z[0]) * clamp(f / Math.max(1, dur)));
  const w = iw * s, h = ih * s;
  const left = clamp(540 - ox * w, W - w, 0), top = clamp(CY - oy * h, 1920 - h, 0);
  return <div style={{position: 'absolute', inset: 0, overflow: 'hidden', clipPath: clip}}>
    <Img src={staticFile(src)} style={{position: 'absolute', left, top, width: w, height: h, filter}} />
  </div>;
};

const make = (draw: NonNullable<Scene['backdrop']>, sfx?: Scene['sfx']): Scene => {
  const S: Scene = () => null;
  S.backdrop = draw;
  S.sfx = sfx;
  return S;
};
const Base: React.FC<{children: React.ReactNode}> = ({children}) => <div style={{position: 'absolute', inset: 0, background: k.bg, overflow: 'hidden'}}>{children}</div>;
const Shade: React.FC = () => <>
  <div style={{position: 'absolute', left: 0, top: 0, width: W, height: 620, background: 'linear-gradient(180deg, rgba(5,8,11,0.72), rgba(5,8,11,0.45) 60%, rgba(5,8,11,0))'}} />
  <div style={{position: 'absolute', left: 0, top: 1180, width: W, height: 740, background: 'linear-gradient(180deg, rgba(5,8,11,0), rgba(5,8,11,0.55) 40%, rgba(5,8,11,0.7))'}} />
  <div style={{position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 90% 70% at 50% 44%, transparent 58%, rgba(0,0,0,0.42) 100%)'}} />
</>;

/* ---------- 1 hook: the claim — a render seen 1.9 M times, already locked ---------- */

const CLAIM = 'brightness(0.92) contrast(1.08) saturate(1.1)';
const hookPlan = (cue: Cue) => ({a: cue('a', 54)});
const Hook = make(({f, cue, dur}) => {
  const p = hookPlan(cue);
  const typed = 'if AI needs massive cooling why not build data centers under the ocean?';
  const n = Math.floor(typed.length * clamp((f - p.a + 4) / 40));
  return <Base>
    <Photo src={IMG('x_softlethal_post_image.jpg')} f={f} dur={dur} iw={1672} ih={940} ox={0.6} oy={0.56} z={[1.02, 1.07]} filter={CLAIM} />
    {/* the claim layer's hue (the render's own electric blue) */}
    <div style={{position: 'absolute', inset: 0, background: k.second, mixBlendMode: 'color', opacity: 0.35}} />
    <Shade />
    <Reticle x={600} y={820} f={f} at={-30} lock={-10} size={430} />
    <Reading f={f} at={-20} label="一条帖子" value={(ff) => fmt(roll(ff, -14, 0, 1903751, 1200000))} unit="次浏览" src="X · @softlethal · 2026.10.27 · 截至 10.28" size={150} />
    {f >= p.a - 6 && <div style={{position: 'absolute', left: 64, top: 1090, width: 860, fontFamily: plex, fontWeight: 500, fontSize: 32, lineHeight: 1.35, color: k.ink,
      background: 'rgba(5,8,11,0.7)', borderLeft: `3px solid ${k.second}`, padding: '12px 18px'}}>“{typed.slice(0, n)}{n < typed.length ? '▍' : '”'}</div>}
    <Tag text="X 帖配图 @softlethal" right y={1010} />
  </Base>;
}, (cue) => {
  const p = hookPlan(cue);
  return [{at: 0, kind: 'thud', gain: 0.14}, {at: 2, kind: 'pop', gain: 0.12}, ...Array.from({length: 6}, (_, i) => ({at: 2 + i * 2, kind: 'tick', gain: 0.04})),
    ...Array.from({length: 8}, (_, i) => ({at: p.a - 4 + i * 5, kind: 'tap', gain: 0.035}))];
});

/* ---------- 2 natick: the render torn away — Microsoft really sank one (2018), lifted it two years later ---------- */

const PHOTO_GREY = 'grayscale(0.62) contrast(1.12) brightness(0.92)';
const natickPlan = (cue: Cue) => ({a: cue('a', 60), b: cue('b', 92)});
const Natick = make(({f, cue, dur}) => {
  const p = natickPlan(cue);
  const sy = scanY(f, 2, 11);
  const whip = clamp(1 - Math.abs(f - p.a) / 4);
  return <Base>
    {f < p.a ? <>
      {/* above the scan: Natick lifted out of the harbour; below it, still the render */}
      <Photo src={IMG('natick_ms_2.jpg')} f={f} dur={p.a} iw={1920} ih={1280} ox={0.48} oy={0.62} z={[1.0, 1.06]} filter={PHOTO_GREY} />
      {sy < 1980 && <div style={{position: 'absolute', inset: 0, clipPath: `inset(${Math.max(0, sy)}px 0 0 0)`}}>
        <Photo src={IMG('x_softlethal_post_image.jpg')} f={f + 140} dur={140} iw={1672} ih={940} ox={0.6} oy={0.56} z={[1.02, 1.07]} filter={CLAIM} />
        <div style={{position: 'absolute', inset: 0, background: k.second, mixBlendMode: 'color', opacity: 0.35}} />
      </div>}
      <ScanBar y={sy} />
      <Shade />
      <Reticle x={520} y={1000} f={f} at={14} lock={22} size={260} from={[600, 820]} />
      <Reading f={f} at={16} label="沉到海底" value="−36" unit="米" src="117 FT · 2018 · ORKNEY, SCOTLAND" />
    </> : <>
      {/* whip to the hull on deck, two years later, coated in algae and barnacles */}
      <div style={{position: 'absolute', inset: 0, filter: whip ? `blur(${whip * 14}px)` : undefined, transform: `translateX(${whip * -60}px)`}}>
        <Photo src={IMG('natick_ms_3.jpg')} f={f - p.a} dur={dur - p.a} iw={1920} ih={1280} ox={0.58} oy={0.3} z={[1.0, f >= p.b ? 1.16 : 1.06]} filter={PHOTO_GREY} />
      </div>
      <Shade />
      <Reticle x={600} y={760} f={f} at={p.a + 3} lock={p.a + 9} size={360} from={[520, 1000]} />
      <Reading f={f} at={p.a + 2} label="两年后捞上来" value="2018 → 2020" src="PROJECT NATICK · MICROSOFT 2020.09" size={128} />
      {f >= p.b && <Label x={760} y={700} f={f} at={p.b + 4} text="海藻 · 藤壶" dx={-80} dy={260} size={42} />}
    </>}
    <Tag text={MS} right y={1230} />
  </Base>;
}, (cue) => {
  const p = natickPlan(cue);
  return [{at: 2, kind: 'fs-paper-slide', gain: 0.12}, {at: 6, kind: 'thud', gain: 0.14}, {at: 22, kind: 'pop', gain: 0.1}, {at: p.a - 3, kind: 'whoosh-short', gain: 0.1},
    {at: p.a + 9, kind: 'pop', gain: 0.08}, {at: p.b + 4, kind: 'tap', gain: 0.07}];
});

/* ---------- 3 china: climb to orbit; Lingshui locked; whip to Lingang, dive; the sea's colour comes back ---------- */

const ORBIT: Key = key(0, [112.5, 31.5], 3400, 34, 0);
const LINGANG_LOW = 70;
// the camera looks a little north-west of the pin so the pin sits under the window (window y 500–900, pin ≈ y 1050)
const LG_VIEW: LL = [PLACES.lingang[0] - 0.05, PLACES.lingang[1] + 0.135];
const chinaPlan = (cue: Cue) => ({a: cue('a', 38), b: cue('b', 88), c: cue('c', 172)});
const chinaCam = (f: number, p: ReturnType<typeof chinaPlan>) => track(f, [
  ORBIT,
  key(p.a, [112, 27], 3000, 30, 0),
  key(p.b - 2, [113.5, 24.5], 2600, 26, 0),
  key(p.b + 6, [120.5, 30.2], 2200, 18, 0),
  key(p.b + 40, LG_VIEW, LINGANG_LOW, 0, 0),
  key(p.c + 60, [LG_VIEW[0] + 0.02, LG_VIEW[1] - 0.01], LINGANG_LOW * 0.9, 0, 0),
]);
const China = make(({f, cue}) => {
  const p = chinaPlan(cue);
  const c = chinaCam(f, p);
  const whip = clamp(1 - Math.abs(f - (p.b + 2)) / 5);
  const ls = proj(c, PLACES.lingshui), lg = proj(c, PLACES.lingang);
  const sy = scanY(f, -2, 10);
  const low = c.w < 300;
  return <Base>
    <Ground c={c} blur={whip * 8} colourAt={PLACES.lingang} colourR={520} colourA={eo(f, p.c, p.c + 24)} />
    {/* the Natick photograph wiped away by the pass that paints in the orbit view */}
    {sy < 1980 && <div style={{position: 'absolute', inset: 0, clipPath: `inset(${Math.max(0, sy)}px 0 0 0)`}}>
      <Photo src={IMG('natick_ms_3.jpg')} f={200} dur={200} iw={1920} ih={1280} ox={0.58} oy={0.3} z={[1.16, 1.16]} filter={PHOTO_GREY} />
    </div>}
    <ScanBar y={sy} />
    <Shade />
    <Instruments c={c} />
    {f < p.b + 4 && <>
      <Svg><Pin x={ls[0]} y={ls[1]} f={f} at={p.a + 14} /></Svg>
      <Reticle x={ls[0]} y={ls[1]} f={f} at={p.a - 4} lock={p.a + 14} size={140} from={[540, 760]} />
      <Label x={ls[0]} y={ls[1]} f={f} at={p.a + 16} text="海南陵水" sub="18.5°N 110.0°E" dx={90} dy={-110} />
      <Reading f={f} at={p.a + 18} label="海底智算舱 · 一个舱" value={(ff) => `${roll(ff, p.a + 18, p.a + 32, 400)}+`} unit="台服务器" src="新华网 2025.02.19" out={p.b} />
    </>}
    {f >= p.b + 30 && <>
      <Svg><Pin x={lg[0]} y={lg[1]} f={f} at={p.b + 34} /></Svg>
      <Reticle x={lg[0]} y={lg[1]} f={f} at={p.b + 30} lock={p.b + 36} size={130} />
      <Label x={lg[0]} y={lg[1]} f={f} at={p.b + 38} text="上海临港" sub="30.9°N 121.9°E" dx={-90} dy={90} />
      <Window f={f} at={p.b + 44} src={VID('lingang-platform')} from={1} srcW={284} srcH={190} scale={2.1} x={64} y={500} pin={lg} out={p.c + 6} />
      <Window f={f} at={p.c + 6} src={VID('lingang-sea')} from={8.4} srcW={148} srcH={204} scale={2.25} x={64} y={500} pin={lg} />
      <Reading f={f} at={p.b + 50} label="海底数据中心 · 投产" value="2026.02" src="央视新闻 2026.02.10" size={150} />
      {low && f >= p.c + 8 && <Label x={lg[0] + 140} y={lg[1] + 60} f={f} at={p.c + 10} text="海水 = 冷源" dx={-30} dy={-260} size={42} />}
    </>}
  </Base>;
}, (cue) => {
  const p = chinaPlan(cue);
  return [{at: 0, kind: 'fs-paper-slide', gain: 0.1}, {at: p.a - 4, kind: 'tick', gain: 0.05}, {at: p.a + 4, kind: 'tick', gain: 0.05}, {at: p.a + 14, kind: 'pop', gain: 0.12},
    {at: p.b, kind: 'whoosh', gain: 0.12}, {at: p.b + 36, kind: 'pop', gain: 0.1}, {at: p.b + 44, kind: 'fs-paper-slide', gain: 0.06}, {at: p.c, kind: 'chime', gain: 0.08}];
});

/* ---------- 4 west: hop west to Zhongwei — Tengger sand, 8.8 °C, the wind does the cooling ---------- */

const ZW_LOW = 110;
const ZW_VIEW: LL = [104.98, 37.7];
const westPlan = (cue: Cue) => ({a: cue('a', 46), b: cue('b', 97), c: cue('c', 131)});
const westCam = (f: number, p: ReturnType<typeof westPlan>) => track(f, [
  key(0, [LG_VIEW[0] + 0.02, LG_VIEW[1] - 0.01], LINGANG_LOW * 0.9, 0, 0),
  key(16, [118.5, 32.5], 1500, 12, 0),
  key(34, [108.5, 36.0], 1300, 10, 0),
  key(p.a + 10, ZW_VIEW, ZW_LOW, 0, 0),
  key(p.c + 70, [ZW_VIEW[0] - 0.02, ZW_VIEW[1] + 0.01], ZW_LOW * 0.88, 0, 0),
]);
const West = make(({f, cue}) => {
  const p = westPlan(cue);
  const c = westCam(f, p);
  const whip = clamp(1 - Math.abs(f - 24) / 12) * 0.9;
  const zw = proj(c, PLACES.zhongwei), tg = proj(c, PLACES.tengger);
  // wind: streamlines from the sand (north-west) toward the pin, dashes flowing
  const streams = [-0.16, -0.08, 0, 0.08, 0.16].map((o, i) => {
    const a = proj(c, [104.58, 37.6 + o * 0.5]), b = proj(c, [PLACES.zhongwei[0] - 0.07, PLACES.zhongwei[1] + 0.02 + o * 0.15]);
    const m: [number, number] = [(a[0] + b[0]) / 2 + 30 * (i - 2), (a[1] + b[1]) / 2 - 30];
    return `M${a[0]} ${a[1]} Q${m[0]} ${m[1]} ${b[0]} ${b[1]}`;
  });
  return <Base>
    <Ground c={c} blur={whip * 9} />
    <Shade />
    <Instruments c={c} />
    {f >= p.a && <>
      <Svg><Pin x={zw[0]} y={zw[1]} f={f} at={p.a + 4} /></Svg>
      <Reticle x={zw[0]} y={zw[1]} f={f} at={p.a} lock={p.a + 6} size={130} />
      <Label x={zw[0]} y={zw[1]} f={f} at={p.a + 8} text="宁夏中卫" sub="37.5°N 105.2°E" dx={-40} dy={110} />
      <Label x={tg[0]} y={tg[1]} f={f} at={p.a + 22} text="腾格里沙漠" dx={-40} dy={150} size={40} />
      <Window f={f} at={p.a + 14} src={VID('ningxia')} from={3.5} srcW={480} srcH={200} scale={1.6} x={64} y={510} pin={zw} out={p.c + 4} />
      <Window f={f} at={p.c + 4} src={VID('ningxia')} from={8.4} srcW={480} srcH={200} scale={1.6} x={64} y={510} pin={zw} />
    </>}
    {/* the wind: dashes flowing from the sand to the halls */}
    {f >= p.c && <Svg>{streams.map((d, i) => <Hair key={i} d={d} dash="22 18" off={-(f - p.c) * 4} w={3.2} op={eo(f, p.c + i * 2, p.c + 10 + i * 2) * 0.9} />)}</Svg>}
    {f >= p.c + 8 && <Label x={zw[0]} y={zw[1]} f={f} at={p.c + 12} text="干冷风 → 直吹冷却" dx={-30} dy={-100} size={40} />}
    <Reading f={f} at={p.b} label="年均气温" value={(ff) => (roll(ff, p.b, p.b + 12, 88, 200) / 10).toFixed(1)} unit="℃" src="央视新闻 2026.10.27" />
  </Base>;
}, (cue) => {
  const p = westPlan(cue);
  return [{at: 8, kind: 'whoosh', gain: 0.12}, {at: p.a + 6, kind: 'pop', gain: 0.1}, {at: p.a + 14, kind: 'fs-paper-slide', gain: 0.06}, {at: p.b + 12, kind: 'tap', gain: 0.1},
    {at: p.c, kind: 'fs-whoosh-wipe', gain: 0.07}];
});

/* ---------- 5 net: climb to orbit; eight hubs; 145 trunk cables; the range line Lingang → Zhongwei, < 20 ms ---------- */

const NET_W = 2600;
const netPlan = (cue: Cue) => ({a: cue('a', 42), b: cue('b', 127), land: cue('b', 127) + 56});
const netCam = (f: number, p: ReturnType<typeof netPlan>) => track(f, [
  key(0, [ZW_VIEW[0] - 0.02, ZW_VIEW[1] + 0.01], ZW_LOW * 0.88, 0, 0),
  key(34, [111.5, 32.2], NET_W, 22, 0),
  key(p.b, [114.8, 32.4], NET_W * 0.94, 22, 0),
  key(p.land - 8, [109.5, 34.8], NET_W * 0.86, 20, 0),
  key(p.land + 30, [113, 33], NET_W * 1.02, 24, 0),
]);
const Net = make(({f, cue}) => {
  const p = netPlan(cue);
  const c = netCam(f, p);
  const hubs = HUBS.map((h) => proj(c, h));
  const lg = proj(c, PLACES.lingang), zw = proj(c, PLACES.zhongwei);
  // the trunk lines between hubs (示意): each hub to its three nearest, drawn on one by one
  const pairs: [number, number][] = [];
  HUBS.forEach((a, i) => HUBS.map((b, j) => [j, Math.hypot(a[0] - b[0], a[1] - b[1])] as [number, number]).filter(([j]) => j !== i).sort((x, y) => x[1] - y[1]).slice(0, 3)
    .forEach(([j]) => { if (!pairs.some(([x, y]) => (x === i && y === j) || (x === j && y === i))) pairs.push([i, j]); }));
  // the range line: from Lingang toward Zhongwei, ticked every 100 km, the tip chased by the camera
  const t = ease.inOutCubic(clamp((f - p.b - 4) / Math.max(1, p.land - p.b - 8)));
  const tipLL: LL = [PLACES.lingang[0] + (PLACES.zhongwei[0] - PLACES.lingang[0]) * t, PLACES.lingang[1] + (PLACES.zhongwei[1] - PLACES.lingang[1]) * t];
  const tip = proj(c, tipLL);
  const ticks = Array.from({length: 17}, (_, i) => (i + 1) * 100).filter((km) => km / RANGE_KM <= t).map((km) => {
    const u = km / RANGE_KM;
    const q = proj(c, [PLACES.lingang[0] + (PLACES.zhongwei[0] - PLACES.lingang[0]) * u, PLACES.lingang[1] + (PLACES.zhongwei[1] - PLACES.lingang[1]) * u]);
    const nx = -(zw[1] - lg[1]), ny = zw[0] - lg[0], nl = Math.hypot(nx, ny) || 1, len = km % 500 === 0 ? 18 : 9;
    return {km, d: `M${q[0] - (nx / nl) * len} ${q[1] - (ny / nl) * len} L${q[0] + (nx / nl) * len} ${q[1] + (ny / nl) * len}`};
  });
  const landed = f >= p.land;
  return <Base>
    <Ground c={c} />
    <Shade />
    <Instruments c={c} />
    <Svg>
      {f >= p.a && pairs.map(([i, j], n) => {
        const q = eo(f, p.a + 4 + n * 2, p.a + 14 + n * 2);
        if (q <= 0) return null;
        const a = hubs[i], b = hubs[j];
        return <Hair key={n} d={`M${a[0]} ${a[1]} L${a[0] + (b[0] - a[0]) * q} ${a[1] + (b[1] - a[1]) * q}`} w={1.4} op={0.7} />;
      })}
      {hubs.map(([x, y], i) => <Pin key={i} x={x} y={y} f={f} at={30 + i * 2} r={9} />)}
      {f >= p.b && <>
        <Pin x={lg[0]} y={lg[1]} f={f} at={p.b} c={k.accent} />
        <Hair d={`M${lg[0]} ${lg[1]} L${tip[0]} ${tip[1]}`} w={4} c={k.ink} />
        {ticks.map(({km, d}) => <Hair key={km} d={d} w={2} />)}
        {!landed && <circle cx={tip[0]} cy={tip[1]} r={8} fill={k.accent} />}
        {landed && <Pin x={zw[0]} y={zw[1]} f={f} at={p.land} c={k.accent} r={13} />}
      </>}
    </Svg>
    {f >= p.b && !landed && <div style={{position: 'absolute', left: tip[0] - 40, top: tip[1] - 92, transform: 'translateX(-100%)', textAlign: 'right', fontFamily: cond, fontWeight: 800, fontSize: 56, color: k.ink, textShadow: '0 0 8px rgba(0,0,0,0.9)'}}>
      {fmt(Math.round(RANGE_KM * t))} km</div>}
    {landed && <Label x={(lg[0] + zw[0]) / 2} y={(lg[1] + zw[1]) / 2} f={f} at={p.land + 2} text={`约 ${fmt(RANGE_KM)} km`} sub="上海临港 → 宁夏中卫 · 直线 · 测算" dx={-40} dy={170} size={44} />}
    <Reading f={f} at={p.a + 20} label="已建成干线光缆" value={(ff) => String(roll(ff, p.a + 20, p.a + 34, 145))} unit="条" src="国家发改委 2026.06.18 · 连线为示意" out={p.land - 6} />
    <Reading f={f} at={p.land} label="各省 → 八大枢纽 · 时延" value="<20" unit="ms" src="国家发改委 2026.06.18" size={190} />
    {f >= 30 && f < p.a + 20 && <div style={{position: 'absolute', left: 64, top: 270, fontFamily: font, fontWeight: 900, fontSize: 56, color: k.ink, opacity: eo(f, 32, 42), textShadow: '0 2px 12px rgba(0,0,0,0.85)'}}>八大算力枢纽</div>}
  </Base>;
}, (cue) => {
  const p = netPlan(cue);
  return [{at: 6, kind: 'whoosh', gain: 0.1}, ...Array.from({length: 8}, (_, i) => ({at: 30 + i * 2, kind: 'tick', gain: 0.05})), {at: p.a + 30, kind: 'tap', gain: 0.08},
    ...Array.from({length: 16}, (_, i) => ({at: p.b + 6 + Math.round(i * 2.9), kind: 'tick', gain: i % 5 === 4 ? 0.07 : 0.04})), {at: p.land, kind: 'fs-impact-deep', gain: 0.2}, {at: p.land, kind: 'pop', gain: 0.1}];
});

/* ---------- 6 end: back to orbit, colour returns; two pins in the sea, one at the desert's edge; the reticle opens ---------- */

const endPlan = (cue: Cue) => ({a: cue('a', 34)});
const End = make(({f, cue}) => {
  const p = endPlan(cue);
  const c = track(f, [key(0, [113, 33], NET_W * 1.02, 24, 0), key(60, [113, 29.5], 4200, 30, -4)], 0.02);
  const grey = 1 - eo(f, 4, 34);
  const pins = [PLACES.lingshui, PLACES.lingang, PLACES.zhongwei].map((ll) => proj(c, ll));
  const open = eo(f, p.a + 8, p.a + 26);
  const fr = {x0: 40 + (pins[1][0] - 60 - 40) * (1 - open), y0: 260 + (pins[1][1] - 60 - 260) * (1 - open), x1: 1040 - (1040 - pins[1][0] - 60) * (1 - open), y1: 1260 - (1260 - pins[1][1] - 60) * (1 - open)};
  const a = 50;
  const brackets = `M${fr.x0} ${fr.y0 + a} L${fr.x0} ${fr.y0} L${fr.x0 + a} ${fr.y0} M${fr.x1 - a} ${fr.y0} L${fr.x1} ${fr.y0} L${fr.x1} ${fr.y0 + a} M${fr.x1} ${fr.y1 - a} L${fr.x1} ${fr.y1} L${fr.x1 - a} ${fr.y1} M${fr.x0 + a} ${fr.y1} L${fr.x0} ${fr.y1} L${fr.x0} ${fr.y1 - a}`;
  return <Base>
    <Ground c={c} grey={grey} />
    <Shade />
    <Instruments c={c} />
    <Svg>
      {pins.map(([x, y], i) => <Pin key={i} x={x} y={y} f={f} at={p.a + (i === 2 ? 6 : 0)} c={k.accent} r={12} />)}
      <Hair d={brackets} w={2.6} op={f >= p.a ? 1 : 0} />
    </Svg>
    <Label x={pins[0][0]} y={pins[0][1]} f={f} at={p.a + 2} text="海底" dx={80} dy={-60} size={48} />
    <Label x={pins[1][0]} y={pins[1][1]} f={f} at={p.a + 2} text="海底" dx={-70} dy={110} size={48} />
    <Label x={pins[2][0]} y={pins[2][1]} f={f} at={p.a + 8} text="沙漠" dx={-60} dy={-90} size={48} />
  </Base>;
}, (cue) => {
  const p = endPlan(cue);
  return [{at: 2, kind: 'fs-whoosh-wipe', gain: 0.06}, {at: p.a, kind: 'pop', gain: 0.12}, {at: p.a + 6, kind: 'pop', gain: 0.1}, {at: p.a + 10, kind: 'chime', gain: 0.07}];
});

/** Cover anchor (880 × 800, f = 0): the Lingang pin locked on the graded Landsat, the platform window, the reading. */
const Cover: Scene = () => {
  const c: Cam = {lon: PLACES.lingang[0] - 0.1, lat: PLACES.lingang[1] + 0.12, w: 70, tilt: 0, rot: 0};
  const lg = proj(c, PLACES.lingang);
  return <div style={{position: 'absolute', left: 0, top: 0, width: 880, height: 800, overflow: 'hidden', background: k.bg}}>
    <div style={{position: 'absolute', left: -100, top: -420, width: W, height: 1920}}>
      <Ground c={c} />
      <Reticle x={lg[0]} y={lg[1]} f={20} at={0} lock={0} size={140} />
      <Svg><Pin x={lg[0]} y={lg[1]} f={30} at={0} /></Svg>
    </div>
    <div style={{position: 'absolute', left: 40, top: 40, width: 284 * 2.2, height: 190 * 2.2, outline: `3px solid ${k.ink}`, overflow: 'hidden'}}>
      <OffthreadVideo src={staticFile(VID('lingang-platform'))} startFrom={30} muted style={{width: '100%', height: '100%', objectFit: 'cover'}} />
    </div>
    <div style={{position: 'absolute', left: 40, top: 40 + 190 * 2.2 + 10, fontFamily: font, fontWeight: 700, fontSize: 22, color: k.ink, background: 'rgba(5,8,11,0.7)', padding: '3px 10px'}}>{CCTV}</div>
  </div>;
};

export const suanliHubUnderseaDcScenes: Record<string, Scene> = {
  'dc.hook': Hook, 'dc.natick': Natick, 'dc.china': China, 'dc.west': West, 'dc.net': Net, 'dc.end': End, 'dc.cover': Cover,
};
