import React from 'react';
import {Img, staticFile} from 'remotion';
import {clamp, ease, hash} from '../../fx';
import {font} from '../theme';
import {cond, hand, jet, serif} from '../fonts';
import {Scene} from '../paper';

// xupt-half-radio (半部电台): a competition film for 西安邮电大学's first "AI+思政" short-video contest (inputs/xupt-half-radio/).
// Template lemo/halftone-dossier (docs/video-craft/prompt-library/vendor/lemomo-ai__lemo-opuscar/3961ddb/styles/
// halftone-dossier/STYLE.md): the whole film is paper, shading is halftone dots (never gradients), black serif headlines
// with a misregistered shadow, a stamp that slams with a shake and a flash, a dark-ink caption pill, HUD chips in the
// corners, dot-wipe transitions. Customised (storyboard ## 导演 模板改造): inks found in the subject — telegram-form buff,
// ink, China Post green, seal red (postmarks only), highlighter yellow (marks only); the stamp is a round *postmark* with
// a date; Vox-style layered collage (cut-outs with a paper edge and a cast shadow, three parallax layers per scene, the
// highlighter drawn on as it is said); no cartoon characters, no gag sounds.
// The props are AI-drawn cut-outs (scripts/generate-components.mjs → public/images/xupt-half-radio/parts/), duotoned in
// code to the film's inks; everything that moves is code. Facts and sources: inputs/xupt-half-radio/idea.md.

const C = {
  paper: '#EFE5CF', paper2: '#E4D6B8', light: '#F8F2E3', ink: '#1B2533', night: '#16202C', nightDot: '#2A3A52',
  green: '#0B6E4F', greenDot: '#13855F', red: '#C0392B', hi: '#F2C230', dim: '#7A7262', nightDim: '#8C8A80',
};
const W = 1080, H = 1920;
const PART = (n: string) => staticFile(`images/xupt-half-radio/parts/${n}.png`);
const SIZE: Record<string, [number, number]> = {
  radio: [1770, 887], headphones: [1081, 1195], key: [1479, 937], pagoda: [1155, 1147], mic: [921, 1448], lamp: [613, 1533],
  tower: [491, 1534], cave: [1513, 994], chip: [1159, 994], satellite: [1890, 811],
};
// Real Chinese telegraph codes (Unicode Unihan kMainlandTelegraph).
const CODES: [string, string][] = [['6153', '请'], ['8093', '党'], ['2397', '放'], ['1800', '心'], ['1730', '强'], ['0948', '国'], ['2589', '有'], ['2053', '我']];
const TITLE_CODES: [string, string][] = [['0584', '半'], ['6752', '部'], ['7193', '电'], ['0669', '台']];

const eo = (f: number, a: number, b: number) => ease.outCubic(clamp((f - a) / Math.max(1, b - a)));
const io = (f: number, a: number, b: number) => ease.inOutCubic(clamp((f - a) / Math.max(1, b - a)));
const back = (f: number, a: number, d = 9) => (f < a ? 0 : ease.outBack(clamp((f - a) / d), 1.7));

const make = (draw: NonNullable<Scene['backdrop']>, sfx?: Scene['sfx']): Scene => {
  const S: Scene = () => null;
  S.backdrop = draw; S.sfx = sfx;
  return S;
};

/* ---------- materials ---------- */

/** Duotone filters: map an engraving's black → `dark` and white → `light` (alpha kept). One <svg> of defs per frame. */
const DUO: Record<string, [string, string]> = {
  inkPaper: [C.ink, C.light], inkCream: [C.ink, C.paper], greenPaper: ['#063F2D', '#DDEBDD'], nightPaper: ['#0E151F', '#E9DFC6'],
};
const hex = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
const Defs: React.FC = () => <svg width={0} height={0} style={{position: 'absolute'}}>
  {Object.entries(DUO).map(([id, [d, l]]) => {
    const [r0, g0, b0] = hex(d), [r1, g1, b1] = hex(l);
    return <filter key={id} id={`duo-${id}`} colorInterpolationFilters="sRGB">
      <feColorMatrix type="matrix" values="0.3 0.59 0.11 0 0  0.3 0.59 0.11 0 0  0.3 0.59 0.11 0 0  0 0 0 1 0" />
      <feComponentTransfer>
        <feFuncR type="table" tableValues={`${r0} ${r1}`} /><feFuncG type="table" tableValues={`${g0} ${g1}`} /><feFuncB type="table" tableValues={`${b0} ${b1}`} />
      </feComponentTransfer>
    </filter>;
  })}
  <filter id="xh-rough"><feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves={2} seed={7} /><feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -1.2 1.5" /><feComposite in="SourceGraphic" operator="in" /></filter>
  <filter id="xh-mottle"><feTurbulence type="fractalNoise" baseFrequency="0.006 0.009" numOctaves={3} seed={3} /><feColorMatrix values="0 0 0 0 0.35  0 0 0 0 0.28  0 0 0 0 0.15  0 0 0 0.5 0" /></filter>
</svg>;

/** A halftone dot field: a rotated grid of circles whose radius follows `density(x, y)` (0 … 1). */
const Dots: React.FC<{density: (x: number, y: number) => number; color: string; step?: number; angle?: number; k?: number; opacity?: number; w?: number; h?: number; blend?: React.CSSProperties['mixBlendMode']}> = ({density, color, step = 24, angle = 15, k = 0.7, opacity = 1, w = W, h = H, blend}) => {
  const a = (angle * Math.PI) / 180, ca = Math.cos(a), sa = Math.sin(a);
  const R = Math.hypot(w, h) / 2, cx = w / 2, cy = h / 2, n = Math.ceil(R / step);
  const out: React.ReactNode[] = [];
  for (let i = -n; i <= n; i++) for (let j = -n; j <= n; j++) {
    const x = cx + i * step * ca - j * step * sa, y = cy + i * step * sa + j * step * ca;
    if (x < -step || y < -step || x > w + step || y > h + step) continue;
    const d = density(x, y);
    if (d <= 0.02) continue;
    out.push(<circle key={`${i}_${j}`} cx={x.toFixed(1)} cy={y.toFixed(1)} r={(Math.min(1, d) * step * k).toFixed(2)} />);
  }
  return <svg width={w} height={h} style={{position: 'absolute', left: 0, top: 0, opacity, mixBlendMode: blend}}><g fill={color}>{out}</g></svg>;
};

/** The sheet: paper (or night ink) with mottling, edge dots, a faint centre fold, specks. */
const Sheet: React.FC<{night?: boolean; green?: boolean; f: number; edge?: number}> = ({night, green, f, edge = 0.55}) => {
  const bg = green ? C.green : night ? C.night : C.paper;
  const dot = green ? C.greenDot : night ? C.nightDot : C.paper2;
  const seed = Math.floor(f / 2) % 5;
  return <div style={{position: 'absolute', inset: 0, background: bg, overflow: 'hidden'}}>
    <Dots color={dot} step={26} angle={22} density={(x, y) => {
      const ex = Math.min(x, W - x) / W, ey = Math.min(y, H - y) / H;
      return edge * (1 - Math.min(1, Math.min(ex * 5.2, ey * 7.5)));
    }} />
    <svg width={W} height={H} style={{position: 'absolute', inset: 0, mixBlendMode: 'multiply', opacity: night || green ? 0.35 : 0.55}}><rect width={W} height={H} filter="url(#xh-mottle)" /></svg>
    <div style={{position: 'absolute', left: 0, right: 0, top: H * 0.5 - 1, height: 2, background: night || green ? 'rgba(255,255,255,0.04)' : 'rgba(80,60,30,0.07)'}} />
    <svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
      {Array.from({length: 70}, (_, i) => {
        const x = hash(i * 7 + seed * 131) * W, y = hash(i * 13 + seed * 71 + 3) * H, r = 0.6 + hash(i + seed) * 1.6;
        return <circle key={i} cx={x} cy={y} r={r} fill={i % 3 ? (night || green ? '#ffffff' : '#fffaf0') : (night || green ? '#000' : '#3b3020')} opacity={0.35} />;
      })}
    </svg>
  </div>;
};

/** A dot wipe in: the previous sheet's colour covers the frame in a coarse dot grid that shrinks away diagonally. */
const DotWipe: React.FC<{f: number; from: string; d?: number}> = ({f, from, d = 13}) => {
  if (f > d + 8) return null;
  const step = 90, out: React.ReactNode[] = [];
  for (let x = 0; x <= W + step; x += step) for (let y = 0; y <= H + step; y += step) {
    const delay = ((x / W) * 0.35 + (y / H) * 0.65) * 8;
    const r = step * 0.75 * (1 - ease.inCubic(clamp((f - delay) / d)));
    if (r > 0.5) out.push(<circle key={`${x}_${y}`} cx={x} cy={y} r={r} />);
  }
  return <svg width={W} height={H} style={{position: 'absolute', inset: 0}}><g fill={from}>{out}</g></svg>;
};

/** A 2D camera over the full frame: keys [frame, {x, y, z}], eased; layers read it with a depth (parallax). */
type Cam = {x: number; y: number; z: number};
const camOf = (f: number, keys: [number, Partial<Cam>, number?][], base: Cam = {x: 540, y: 820, z: 1}): Cam => {
  let c = {...base};
  for (const [at, to, d = 24] of keys) {
    const p = ease.inOutCubic(clamp((f - at) / Math.max(1, d)));
    if (p <= 0) continue;
    c = {x: c.x + ((to.x ?? c.x) - c.x) * p, y: c.y + ((to.y ?? c.y) - c.y) * p, z: c.z + ((to.z ?? c.z) - c.z) * p};
  }
  return c;
};
const Lay: React.FC<{cam: Cam; depth: number; shake?: [number, number]; children: React.ReactNode}> = ({cam, depth, shake = [0, 0], children}) => {
  const z = 1 + (cam.z - 1) * depth, dx = (540 - cam.x) * depth + shake[0] * depth, dy = (820 - cam.y) * depth + shake[1] * depth;
  return <div style={{position: 'absolute', left: 0, top: 0, width: W, height: H, transformOrigin: '540px 820px', transform: `translate(${dx.toFixed(2)}px, ${dy.toFixed(2)}px) scale(${z.toFixed(4)})`}}>{children}</div>;
};
/** Camera shake with quadratic decay after each hit (template §6: stamps shake the page). */
const shakeOf = (f: number, hits: number[], amp = 16): [number, number] => {
  let x = 0, y = 0;
  for (const h of hits) {
    if (f < h || f > h + 12) continue;
    const k = (1 - (f - h) / 12) ** 2 * amp;
    x += Math.sin((f - h) * 2.7) * k; y += Math.cos((f - h) * 3.3) * k * 0.7;
  }
  return [x, y];
};
const Flash: React.FC<{f: number; at: number; a?: number}> = ({f, at, a = 0.45}) => (f < at || f > at + 5 ? null :
  <div style={{position: 'absolute', inset: 0, background: '#fffaf0', opacity: a * (1 - (f - at) / 5)}} />);

/**
 * A cut-out (Vox collage): an AI-drawn engraving, duotoned to the film's inks, with a paper edge (stacked hard shadows)
 * and a soft cast shadow. `crop` shows only part of it ([x0, x1] as fractions of its width).
 */
const Cut: React.FC<{n: string; x: number; y: number; w: number; duo?: keyof typeof DUO; rot?: number; edge?: number; edgeColor?: string; shadow?: number; crop?: [number, number]; style?: React.CSSProperties}> = ({n, x, y, w, duo = 'inkPaper', rot = 0, edge = 6, edgeColor = '#FBF6EA', shadow = 0.35, crop, style}) => {
  const [iw, ih] = SIZE[n];
  const h = (w * ih) / iw;
  const e = edge, sh = edge ? `drop-shadow(${e}px 0 0 ${edgeColor}) drop-shadow(-${e}px 0 0 ${edgeColor}) drop-shadow(0 ${e}px 0 ${edgeColor}) drop-shadow(0 -${e}px 0 ${edgeColor}) ` : '';
  const clip = crop ? `inset(-40px ${((1 - crop[1]) * 100).toFixed(2)}% -40px ${(crop[0] * 100).toFixed(2)}%)` : undefined;
  return <div style={{position: 'absolute', left: x - w / 2, top: y - h / 2, width: w, height: h, transform: `rotate(${rot}deg)`, filter: `${sh}drop-shadow(0 ${w * 0.03}px ${w * 0.035}px rgba(10,12,20,${shadow}))`, ...style}}>
    <Img src={PART(n)} style={{width: w, height: h, display: 'block', filter: `url(#duo-${duo})`, clipPath: clip}} />
  </div>;
};
const hOf = (n: string, w: number) => (w * SIZE[n][1]) / SIZE[n][0];

/** Black serif headline with a misregistered shadow (+8/+8 in the overprint ink); glyphs drop in one by one. */
const Headline: React.FC<{text: string; x: number; y: number; size: number; f: number; at: number; color?: string; shadow?: string; stagger?: number; still?: boolean}> = ({text, x, y, size, f, at, color = C.ink, shadow = C.green, stagger = 2, still}) => (
  <div style={{position: 'absolute', left: x, top: y, display: 'flex', fontFamily: serif, fontWeight: 900, fontSize: size, lineHeight: 1, whiteSpace: 'nowrap'}}>
    {[...text].map((ch, i) => {
      const p = still ? 1 : back(f, at + i * stagger, 8);
      return <span key={i} style={{display: 'inline-block', color, textShadow: `${size * 0.045}px ${size * 0.045}px 0 ${shadow}`, opacity: clamp(p * 2), transform: `translateY(${(1 - p) * -size * 0.5}px) scaleY(${0.85 + 0.15 * p})`}}>{ch}</span>;
    })}
  </div>
);

/** A postmark (the film's stamp): double ring, place on the rim, date across a band, cancellation waves; slams on `at`. */
const Postmark: React.FC<{x: number; y: number; f: number; at: number; date: string; top: string; bottom?: string; r?: number; color?: string; rot?: number; waves?: boolean}> = ({x, y, f, at, date, top, bottom = '', r = 150, color = C.red, rot = -12, waves = true}) => {
  if (f < at - 3) return null;
  const k = ease.inCubic(clamp((f - at + 3) / 3));
  const s = f < at ? 2.6 - 1.6 * k : 1 + 0.05 * Math.exp(-(f - at) / 3) * Math.sin((f - at) * 1.9);
  const id = `pm${Math.round(x)}${Math.round(y)}`;
  const box = r * 2 + (waves ? r * 1.6 : 0) + 20;
  return <div style={{position: 'absolute', left: x - r - 10, top: y - r - 10, transform: `rotate(${rot}deg) scale(${s})`, transformOrigin: `${r + 10}px ${r + 10}px`, opacity: (f < at ? 0.3 + 0.5 * k : 0.88)}}>
    <svg width={box} height={r * 2 + 20} style={{filter: 'url(#xh-rough)', overflow: 'visible'}}>
      <defs><path id={`${id}t`} d={`M ${10 + r * 0.22} ${10 + r} A ${r * 0.78} ${r * 0.78} 0 0 1 ${10 + r * 1.78} ${10 + r}`} />
        <path id={`${id}b`} d={`M ${10 + r * 0.16} ${10 + r} A ${r * 0.84} ${r * 0.84} 0 0 0 ${10 + r * 1.84} ${10 + r}`} /></defs>
      <g fill="none" stroke={color}>
        <circle cx={10 + r} cy={10 + r} r={r} strokeWidth={r * 0.05} />
        <circle cx={10 + r} cy={10 + r} r={r * 0.62} strokeWidth={r * 0.025} />
        {waves && [-0.32, -0.11, 0.11, 0.32].map((o, i) => <path key={i} strokeWidth={r * 0.035} d={`M ${10 + r * 2.06} ${10 + r + o * r} ${Array.from({length: 8}, (_, j) => `q ${r * 0.1} ${(j % 2 ? 1 : -1) * r * 0.09} ${r * 0.2} 0`).join(' ')}`} />)}
      </g>
      <rect x={10 + r * 0.3} y={10 + r * 0.82} width={r * 1.4} height={r * 0.36} fill={color} />
      <text x={10 + r} y={10 + r * 1.105} textAnchor="middle" fill="#F8F2E3" style={{fontFamily: jet, fontSize: r * 0.25, fontWeight: 500, letterSpacing: 1}}>{date}</text>
      <text fill={color} style={{fontFamily: font, fontWeight: 900, fontSize: r * 0.2, letterSpacing: r * 0.05}}><textPath href={`#${id}t`} startOffset="50%" textAnchor="middle">{top}</textPath></text>
      {bottom && <text fill={color} style={{fontFamily: font, fontWeight: 900, fontSize: r * 0.17, letterSpacing: r * 0.04}}><textPath href={`#${id}b`} startOffset="50%" textAnchor="middle" dominantBaseline="hanging">{bottom}</textPath></text>}
    </svg>
  </div>;
};

/** HUD chips: case number top-left (the chapter), the contest top-right. Inverted on dark sheets. */
const Hud: React.FC<{no: string; chapter: string; night?: boolean; f: number}> = ({no, chapter, night, f}) => {
  const ink = night ? C.paper : C.ink, bg = night ? C.paper : C.ink, on = night ? C.ink : C.paper;
  return <>
    <div style={{position: 'absolute', left: 64, top: 150, display: 'flex', gap: 12, alignItems: 'center', opacity: eo(f, 0, 6)}}>
      <span style={{fontFamily: jet, fontSize: 26, color: on, background: bg, padding: '6px 14px', borderRadius: 8}}>{no}</span>
      <span style={{fontFamily: font, fontWeight: 900, fontSize: 30, color: ink, border: `3px solid ${ink}`, padding: '2px 14px', borderRadius: 8}}>{chapter}</span>
    </div>
    <div style={{position: 'absolute', right: 64, top: 156, fontFamily: font, fontWeight: 700, fontSize: 26, color: ink, opacity: 0.75}}>西邮 · AI+思政</div>
  </>;
};

/** Signal waves: a Morse-dashed wavy line travelling from a to b (in = toward b). */
const Wave: React.FC<{a: [number, number]; b: [number, number]; f: number; at: number; color: string; amp?: number; width?: number; speed?: number; len?: number}> = ({a, b, f, at, color, amp = 16, width = 6, speed = 6, len = 1}) => {
  if (f < at) return null;
  const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy), nx = -dy / L, ny = dx / L;
  const pts = Array.from({length: 61}, (_, i) => {
    const t = (i / 60) * len, w = Math.sin(t * L / 38) * amp;
    return `${(a[0] + dx * t + nx * w).toFixed(1)},${(a[1] + dy * t + ny * w).toFixed(1)}`;
  }).join(' ');
  const grow = eo(f, at, at + 14);
  return <svg width={W} height={H} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
    <polyline points={pts} fill="none" stroke={color} strokeWidth={width} strokeLinecap="round" strokeDasharray="4 18 30 18" strokeDashoffset={-(f - at) * speed}
      style={{opacity: grow}} pathLength={undefined} />
  </svg>;
};
/** Concentric arcs going out from a point (a broadcast). */
const Rings: React.FC<{x: number; y: number; f: number; at: number; color: string; n?: number; max?: number; every?: number; width?: number; out?: boolean}> = ({x, y, f, at, color, n = 4, max = 520, every = 16, width = 6, out = true}) => {
  if (f < at) return null;
  return <svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
    {Array.from({length: n}, (_, i) => {
      const t = (((f - at) / every + i / n * (n * 0 + 1) * 0) + i * (1 / n) * 0) ;
      const ph = ((f - at - i * every) / (every * n));
      if (ph < 0) return null;
      const k = out ? ph % 1 : 1 - (ph % 1);
      const r = 40 + k * max;
      return <circle key={i} cx={x} cy={y} r={r} fill="none" stroke={color} strokeWidth={width} opacity={(1 - k) * 0.9 + t * 0} />;
    })}
  </svg>;
};

/** A paper label on a leader line, ✓ or ✕. */
const Label: React.FC<{x: number; y: number; tx: number; ty: number; f: number; at: number; text: string; mark: '✓' | '✕'; night?: boolean; dashed?: boolean}> = ({x, y, tx, ty, f, at, text, mark, night, dashed}) => {
  if (f < at) return null;
  const p = eo(f, at, at + 8);
  const col = mark === '✓' ? C.green : C.red;
  return <>
    <svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
      <line x1={x} y1={y} x2={x + (tx - x) * p} y2={y + (ty - y) * p} stroke={night ? C.paper : C.ink} strokeWidth={4} strokeDasharray={dashed ? '10 10' : undefined} />
      <circle cx={x} cy={y} r={11} fill={night ? C.paper : C.ink} /><circle cx={x} cy={y} r={20 * p} fill="none" stroke={night ? C.paper : C.ink} strokeWidth={3} />
    </svg>
    <div style={{position: 'absolute', left: tx - 10, top: ty - 44, transform: `scale(${back(f, at + 5, 8)})`, transformOrigin: '0 50%', display: 'flex', alignItems: 'center', gap: 12,
      background: C.light, border: `3px ${dashed ? 'dashed' : 'solid'} ${C.ink}`, borderRadius: 10, padding: '8px 18px', boxShadow: `6px 6px 0 ${col}`}}>
      <span style={{fontFamily: font, fontWeight: 900, fontSize: 48, color: C.ink}}>{text}</span>
      <span style={{fontFamily: font, fontWeight: 900, fontSize: 52, color: col}}>{mark}</span>
    </div>
  </>;
};

/** The radio: receiver (left half) always printed; the transmitter (right half) a dashed ghost until `fill` 0 → 1. */
const Radio: React.FC<{x: number; y: number; w: number; f: number; fill?: number; duo?: keyof typeof DUO; night?: boolean; ghostIn?: number}> = ({x, y, w, f, fill = 0, duo = 'inkPaper', night, ghostIn = 1}) => {
  const h = hOf('radio', w);
  const line = night ? C.paper : C.ink;
  // the transmitter prints back in dots: a dot mask whose dots grow with `fill`
  const id = `rf${Math.round(x)}${Math.round(y)}${Math.round(w)}`;
  const step = Math.max(10, w / 70);
  const dots: React.ReactNode[] = [];
  if (fill > 0 && fill < 1) for (let i = 0; i * step < w / 2 + step; i++) for (let j = 0; j * step < h + step; j++) {
    const local = clamp(fill * 1.6 - (i / (w / 2 / step)) * 0.6 + (hash(i * 31 + j * 7) - 0.5) * 0.25);
    if (local > 0.02) dots.push(<circle key={`${i}_${j}`} cx={i * step + (j % 2) * step / 2} cy={j * step} r={step * 0.75 * local} fill="#fff" />);
  }
  return <>
    <Cut n="radio" x={x} y={y} w={w} duo={duo} crop={[0, 0.5]} />
    {fill > 0 && <div style={{position: 'absolute', left: x - w / 2, top: y - h / 2, width: w, height: h}}>
      <svg width={0} height={0} style={{position: 'absolute'}}><mask id={id} maskUnits="userSpaceOnUse" x={0} y={0} width={w} height={h}>
        {fill >= 1 ? <rect x={w / 2} y={0} width={w / 2} height={h} fill="#fff" /> : <g transform={`translate(${w / 2} 0)`}>{dots}</g>}
      </mask></svg>
      <div style={{position: 'absolute', inset: 0, mask: `url(#${id})`, WebkitMask: `url(#${id})`}}>
        <Img src={PART('radio')} style={{width: w, height: h, display: 'block', filter: `url(#duo-${duo})`}} />
      </div>
    </div>}
    {fill < 1 && <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0, opacity: (1 - fill) * ghostIn}}>
      <rect x={x + 6} y={y - h * 0.36} width={w / 2 - 22} height={h * 0.82} rx={10} fill="none" stroke={line} strokeWidth={4} strokeDasharray="16 12" />
      <circle cx={x + w * 0.25} cy={y + h * 0.08} r={w * 0.08} fill="none" stroke={line} strokeWidth={3} strokeDasharray="10 10" />
      <circle cx={x + w * 0.1} cy={y - h * 0.12} r={w * 0.035} fill="none" stroke={line} strokeWidth={3} strokeDasharray="8 8" />
      <circle cx={x + w * 0.4} cy={y - h * 0.12} r={w * 0.035} fill="none" stroke={line} strokeWidth={3} strokeDasharray="8 8" />
    </svg>}
  </>;
};

/** A typed card (Vox: the quoted line on paper; the highlighter draws on as it is said). */
const Hl: React.FC<{f: number; at: number; children: React.ReactNode; color?: string}> = ({f, at, children, color = C.hi}) => (
  <span style={{position: 'relative', display: 'inline-block'}}>
    <span style={{position: 'absolute', left: -6, right: -6, top: '18%', bottom: '4%', background: color, transformOrigin: '0 50%', transform: `scaleX(${eo(f, at, at + 10)}) skewX(-8deg)`, borderRadius: 6, mixBlendMode: 'multiply', opacity: 0.9}} />
    <span style={{position: 'relative'}}>{children}</span>
  </span>
);

/** A postage stamp card with perforated edges. */
const Stamp: React.FC<{x: number; y: number; w: number; h: number; f: number; at: number; rot?: number; children: React.ReactNode; bg?: string; frame?: string}> = ({x, y, w, h, f, at, rot = 0, children, bg = C.light, frame = C.green}) => {
  if (f < at) return null;
  const p = back(f, at, 10);
  const perf = 'radial-gradient(circle at 50% 50%, transparent 7px, #000 7.5px)';
  return <div style={{position: 'absolute', left: x, top: y, width: w, height: h, transform: `translateY(${(1 - p) * 60}px) rotate(${rot}deg) scale(${0.9 + 0.1 * p})`, opacity: clamp(p * 2), filter: 'drop-shadow(0 18px 18px rgba(20,20,30,0.3))'}}>
    <div style={{position: 'absolute', inset: 0, background: bg, WebkitMaskImage: perf, maskImage: perf, WebkitMaskSize: '22px 22px', maskSize: '22px 22px', WebkitMaskPosition: '-11px -11px', maskPosition: '-11px -11px'}} />
    <div style={{position: 'absolute', inset: 18, border: `4px solid ${frame}`, overflow: 'hidden'}}>{children}</div>
  </div>;
};

/** Loess ridges for the listening scene: filled with halftone (dots), each a parallax layer. */
const Ridge: React.FC<{y: number; amp: number; seed: number; color: string; dot: string}> = ({y, amp, seed, color, dot}) => {
  const pts = Array.from({length: 25}, (_, i) => {
    const x = (i / 24) * (W + 400) - 200;
    const v = Math.sin(i * 0.9 + seed) * 0.5 + Math.sin(i * 0.37 + seed * 2) * 0.5;
    return `${x.toFixed(0)},${(y - v * amp).toFixed(0)}`;
  }).join(' L ');
  const id = `rd${seed}`;
  return <svg width={W} height={H} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
    <defs><pattern id={id} width={18} height={18} patternUnits="userSpaceOnUse" patternTransform="rotate(30)"><rect width={18} height={18} fill={color} /><circle cx={9} cy={9} r={4.2} fill={dot} /></pattern></defs>
    <path d={`M ${pts} L ${W + 200},${H + 100} L -200,${H + 100} Z`} fill={`url(#${id})`} stroke={C.ink} strokeWidth={4} />
  </svg>;
};

/* ======================= 1 hook: the first radio was half a radio ======================= */

const Hook = make(({f, cue, dur}) => {
  const a = cue('a', 50), b = cue('b', 120);
  const cam = camOf(f, [[0, {z: 1.05, y: 800}, Math.max(60, dur)]]);
  const sh = shakeOf(f, [a]);
  return <div style={{position: 'absolute', inset: 0, overflow: 'hidden'}}>
    <Defs />
    <Sheet night f={f} />
    <Lay cam={cam} depth={0.4} shake={sh}>
      <Wave a={[-40, 1040]} b={[260, 990]} f={f} at={b + 6} color={C.hi} amp={14} width={7} />
      <Wave a={[-40, 1120]} b={[260, 1040]} f={f} at={b + 12} color={C.hi} amp={10} width={5} />
    </Lay>
    <Lay cam={cam} depth={1} shake={sh}>
      <Radio x={540} y={1010} w={1010} f={f} duo="nightPaper" night ghostIn={1} />
      <Label x={300} y={850} tx={120} ty={690} f={f} at={b} text="收报机" mark="✓" night />
      <Label x={790} y={900} tx={620} ty={690} f={f} at={b + 10} text="发报机" mark="✕" night dashed />
    </Lay>
    <Lay cam={cam} depth={1.15} shake={sh}>
      <Postmark x={720} y={1300} f={f} at={a} date="1930.12.30" top="江西 · 龙冈" bottom="缴获" r={130} />
    </Lay>
    <Headline text="半部电台" x={64} y={240} size={200} f={f} at={0} color={C.paper} shadow={C.green} still />
    <div style={{position: 'absolute', left: 70, top: 470, fontFamily: jet, fontSize: 34, color: C.nightDim, letterSpacing: 4}}>0584 6752 7193 0669</div>
    <Flash f={f} at={a} />
    <Hud no="NO.1930-12" chapter="一 · 听" night f={99} />
  </div>;
}, (cue) => [{at: 2, kind: 'tick', gain: 0.05}, {at: cue('a', 50), kind: 'stamp', gain: 0.1}, {at: cue('b', 120), kind: 'pop', gain: 0.06}, {at: cue('b', 120) + 10, kind: 'pop', gain: 0.06}]);

/* ======================= 2 title: the work's card (contest requirement) ======================= */

const TEAM = {school: '参赛学院：计算机学院', major: '专业班级：数据科学与大数据技术 · 大数据2601班', members: '参赛者：马岚妮（学号 2600421004）', teacher: '指导教师：罗肖肖'};
const Title = make(({f, cue}) => {
  const a = cue('a', 40);
  const cam = camOf(f, [[0, {z: 1.03}, 200]]);
  return <div style={{position: 'absolute', inset: 0, overflow: 'hidden'}}>
    <Defs />
    <Sheet f={f} />
    <Lay cam={cam} depth={0.6}>
      {/* the telegram form: green rules, code boxes over the title characters */}
      <div style={{position: 'absolute', left: 60, top: 250, width: 960, height: 980, background: C.light, border: `4px solid ${C.green}`, boxShadow: '0 30px 50px rgba(40,30,10,0.22)', transform: 'rotate(-1.2deg)'}}>
        <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: 86, borderBottom: `3px solid ${C.green}`, display: 'flex', alignItems: 'center', padding: '0 34px', justifyContent: 'space-between'}}>
          <span style={{fontFamily: font, fontWeight: 900, fontSize: 40, color: C.green, letterSpacing: 18}}>电报纸</span>
          <span style={{fontFamily: jet, fontSize: 26, color: C.green}}>西安邮电大学 · 首届“AI+思政”短视频创作大赛</span>
        </div>
        <div style={{position: 'absolute', left: 60, top: 140, display: 'flex', gap: 22}}>
          {TITLE_CODES.map(([code, ch], i) => {
            const t = 6 + i * 5, p = back(f, t, 8);
            return <div key={i} style={{width: 196, textAlign: 'center'}}>
              <div style={{height: 60, border: `3px solid ${C.green}`, borderBottom: 'none', fontFamily: jet, fontSize: 38, color: C.ink, lineHeight: '60px', letterSpacing: 4}}>{f >= t - 4 ? code : ''}</div>
              <div style={{height: 196, border: `3px solid ${C.green}`, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                <span style={{fontFamily: serif, fontWeight: 900, fontSize: 170, color: C.ink, textShadow: `8px 8px 0 ${C.green}55`, opacity: clamp(p * 2), transform: `translateY(${(1 - p) * -60}px)`}}>{ch}</span>
              </div>
            </div>;
          })}
        </div>
        <div style={{position: 'absolute', left: 60, top: 470, fontFamily: serif, fontWeight: 900, fontSize: 70, color: C.ink, opacity: eo(f, 26, 34)}}>
          <Hl f={f} at={a}>一堂西邮人的思政课</Hl>
        </div>
        <div style={{position: 'absolute', left: 60, top: 580, display: 'flex', flexDirection: 'column', gap: 14}}>
          {[TEAM.school, TEAM.major, TEAM.members, TEAM.teacher].map((t, i) => <div key={i} style={{fontFamily: font, fontWeight: 700, fontSize: 37, color: C.ink, opacity: eo(f, 34 + i * 5, 42 + i * 5), borderBottom: `2px dashed ${C.green}88`, paddingBottom: 8, width: 840, whiteSpace: 'nowrap'}}>{t}</div>)}
        </div>
        <div style={{position: 'absolute', left: 60, bottom: 30, fontFamily: font, fontWeight: 700, fontSize: 28, color: C.dim}}>作品含 AI 生成内容（插图、配音），见片尾说明</div>
      </div>
    </Lay>
    <Lay cam={cam} depth={1.1}>
      <Radio x={790} y={1330} w={440} f={f} duo="inkPaper" />
      <Postmark x={330} y={1290} f={f} at={14} date="2026.11" top="西安 · 长安" bottom="思政课" r={110} rot={10} color={C.red} waves={false} />
    </Lay>
    <DotWipe f={f} from={C.night} />
  </div>;
}, () => [{at: 2, kind: 'paper', gain: 0.06}, ...[6, 11, 16, 21].map((at) => ({at, kind: 'tick', gain: 0.05})), {at: 14, kind: 'stamp', gain: 0.07}]);

/* ======================= 3 listen: the first radio team ======================= */

const Listen = make(({f, cue, dur}) => {
  const a = cue('a', 40), b = cue('b', 90), c = cue('c', 130), d = cue('d', 190);
  const cam = camOf(f, [[0, {x: 540, y: 860, z: 1.0}, 1], [4, {y: 780, z: 1.08}, 60], [c, {x: 620, z: 1.0}, 30]]);
  const sh = shakeOf(f, [a, d]);
  const drop = eo(f, 2, 18);
  const sun = io(f, c, Math.min(dur, c + 70));
  return <div style={{position: 'absolute', inset: 0, overflow: 'hidden'}}>
    <Defs />
    <Sheet f={f} />
    {/* day / night: a disc swings over the ridge */}
    <Lay cam={cam} depth={0.2} shake={sh}>
      {f >= c && <div style={{position: 'absolute', left: 540 - 380 * Math.cos(sun * Math.PI) - 60, top: 900 - 380 * Math.sin(sun * Math.PI) - 60, width: 120, height: 120, borderRadius: 60,
        background: sun < 0.5 ? C.hi : C.paper, border: `4px solid ${C.ink}`, boxShadow: sun < 0.5 ? 'none' : `inset -26px -8px 0 ${C.ink}`}} />}
    </Lay>
    <Lay cam={cam} depth={0.35} shake={sh}><Ridge y={1050} amp={70} seed={1} color={C.paper2} dot="#cdbb94" /></Lay>
    <Lay cam={cam} depth={0.6} shake={sh}><Ridge y={1180} amp={60} seed={4} color="#d5c49c" dot="#b9a274" /></Lay>
    <Lay cam={cam} depth={1} shake={sh}>
      <Wave a={[1150, 380]} b={[700, 640]} f={f} at={8} color={C.red} amp={18} width={6} />
      <Wave a={[1150, 520]} b={[720, 700]} f={f} at={16} color={C.red} amp={12} width={5} />
      <div style={{position: 'absolute', left: 860, top: 330, fontFamily: jet, fontSize: 30, color: C.red, opacity: eo(f, 10, 18)}}>敌台</div>
      <Cut n="headphones" x={470} y={300 + 440 * drop} w={600} duo="inkPaper" rot={-6 + 6 * drop} />
      {/* telegram strips spill out: dots and dashes heard */}
      {f >= c && Array.from({length: 5}, (_, i) => {
        const t0 = c + 8 + i * 10, p = eo(f, t0, t0 + 14);
        if (f < t0) return null;
        return <div key={i} style={{position: 'absolute', left: 150 + i * 18, top: 980 + i * 52, width: 520 * p, height: 40, background: C.light, border: `2px solid ${C.ink}`, overflow: 'hidden', transform: `rotate(${(i % 2 ? 2 : -2)}deg)`, boxShadow: '0 6px 8px rgba(0,0,0,0.12)'}}>
          <div style={{display: 'flex', gap: 10, padding: '14px 12px'}}>{Array.from({length: 14}, (_, j) => <span key={j} style={{width: hash(i * 20 + j) > 0.5 ? 34 : 12, height: 12, borderRadius: 6, background: C.ink, flex: 'none'}} />)}</div>
        </div>;
      })}
    </Lay>
    <Lay cam={cam} depth={1.2} shake={sh}>
      {f >= a && <div style={{position: 'absolute', left: 560, top: 860, transform: `scale(${back(f, a, 8)}) rotate(2deg)`, transformOrigin: '0 0', background: C.light, border: `4px solid ${C.ink}`, padding: '18px 26px', boxShadow: `8px 8px 0 ${C.green}`}}>
        <div style={{fontFamily: jet, fontSize: 28, color: C.dim}}>1931.1 · 中央苏区</div>
        <div style={{fontFamily: serif, fontWeight: 900, fontSize: 50, color: C.ink, marginTop: 6}}>红军第一支<br />无线电队</div>
        {f >= b && <div style={{marginTop: 12, display: 'inline-block', background: C.ink, color: C.paper, fontFamily: font, fontWeight: 900, fontSize: 40, padding: '4px 16px', transform: `scale(${back(f, b, 7)})`, transformOrigin: '0 50%'}}>队长 · 王诤</div>}
      </div>}
      {f >= d - 3 && <Postmark x={810} y={600} f={f} at={d} date="1931 · 首战" top="第二次反“围剿”" bottom="告捷" r={130} rot={8} />}
    </Lay>
    <Headline text="只能听，那就听" x={64} y={250} size={92} f={f} at={0} />
    <Flash f={f} at={d} a={0.3} />
    <Hud no="NO.1931-01" chapter="一 · 听" f={f} />
  </div>;
}, (cue) => [{at: 2, kind: 'whoosh-short', gain: 0.05}, {at: cue('a', 40), kind: 'thud', gain: 0.07}, {at: cue('b', 90), kind: 'pop', gain: 0.05},
  ...Array.from({length: 5}, (_, i) => ({at: cue('c', 130) + 8 + i * 10, kind: 'tick', gain: 0.04})), {at: cue('d', 190), kind: 'stamp', gain: 0.1}]);

/* ======================= 4 yanan: the first broadcast ======================= */

const Yanan = make(({f, cue, dur}) => {
  const a = cue('a', 70), b = cue('b', 150), c = cue('c', 210), d = cue('d', 260);
  // route first (schematic, not a map), then the camera pushes into the cave layers
  const route = eo(f, 4, Math.max(30, a - 10));
  const inside = io(f, a - 12, a + 14);
  const cam = camOf(f, [[a - 12, {y: 860, z: 1.0}, 1], [a, {y: 820, z: 1.1}, 120], [c, {z: 1.16, y: 800}, 60]]);
  const sh = shakeOf(f, [a]);
  const glow = eo(f, a + 4, a + 20);
  return <div style={{position: 'absolute', inset: 0, overflow: 'hidden'}}>
    <Defs />
    <Sheet night f={f} />
    {/* stars: a light dot layer */}
    <Lay cam={cam} depth={0.1} shake={sh}>
      <Dots color={C.paper} step={46} angle={10} k={0.16} opacity={0.55 * inside} density={(x, y) => (y < 900 && hash(Math.round(x * 3 + y * 7)) > 0.72 ? 0.5 + hash(Math.round(x + y)) * 0.5 : 0)} />
    </Lay>
    {/* the route (before we go in) */}
    {inside < 1 && <div style={{position: 'absolute', inset: 0, opacity: 1 - inside}}>
      <svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
        <path d="M 260 1240 C 180 980, 560 900, 470 700 S 760 470, 820 430" fill="none" stroke={C.hi} strokeWidth={8} strokeDasharray="22 16" strokeLinecap="round" pathLength={1000}
          style={{strokeDashoffset: 0}} />
        <rect x={0} y={0} width={W} height={H} fill={C.night} style={{transform: `translateY(${-route * 1}px)`}} opacity={0} />
        <circle cx={260} cy={1240} r={18} fill={C.red} /><circle cx={820} cy={430} r={18 * route} fill={C.hi} />
      </svg>
      {/* the dashed path draws on: cover it with a night mask that slides off */}
      <div style={{position: 'absolute', left: 0, right: 0, top: 380, height: 900 * (1 - route), background: C.night}} />
      <div style={{position: 'absolute', left: 300, top: 1210, fontFamily: font, fontWeight: 900, fontSize: 52, color: C.paper}}>江西 · 龙冈</div>
      <div style={{position: 'absolute', left: 560, top: 340, fontFamily: font, fontWeight: 900, fontSize: 52, color: C.hi, opacity: route}}>陕北 · 延安</div>
      <div style={{position: 'absolute', left: 64, top: 1320, fontFamily: font, fontSize: 28, color: C.nightDim}}>示意线路，非地图</div>
      <Headline text="十年后" x={64} y={250} size={110} f={f} at={0} color={C.paper} shadow={C.green} />
    </div>}
    {inside > 0 && <div style={{position: 'absolute', inset: 0, opacity: inside}}>
      <Lay cam={cam} depth={0.35} shake={sh}><Cut n="pagoda" x={790} y={520} w={470} duo="nightPaper" edge={0} shadow={0} style={{opacity: 0.85}} /></Lay>
      <Lay cam={cam} depth={1} shake={sh}>
        {/* the lattice window lights up: a warm glow behind the cut-out */}
        <div style={{position: 'absolute', left: 540 - 260, top: 860, width: 520, height: 300, borderRadius: '260px 260px 0 0', background: C.hi, opacity: 0.85 * glow, filter: 'blur(26px)'}} />
        <Cut n="cave" x={540} y={1010} w={980} duo="nightPaper" edge={0} />
        <div style={{position: 'absolute', left: 540 - 230, top: 880, width: 460, height: 240, borderRadius: '230px 230px 0 0', background: C.hi, opacity: 0.38 * glow, mixBlendMode: 'screen'}} />
        <Rings x={540} y={760} f={f} at={b} color={C.hi} n={4} max={560} every={14} width={7} />
      </Lay>
      <Lay cam={cam} depth={1.3} shake={sh}>
        <Cut n="lamp" x={150} y={1220} w={150} duo="nightPaper" />
        <div style={{position: 'absolute', left: 115, top: 1050, width: 70, height: 70, borderRadius: 35, background: C.hi, opacity: 0.5, filter: 'blur(16px)'}} />
        {f >= b - 6 && <Cut n="mic" x={930 - 160 * eo(f, b - 6, b + 8) + 160} y={1160} w={230} duo="nightPaper" rot={-4} />}
      </Lay>
      <Lay cam={cam} depth={1.1} shake={sh}><Postmark x={260} y={420} f={f} at={a} date="1940.12.30" top="延安 · 王皮湾" bottom="窑洞" r={130} rot={-10} /></Lay>
      {f >= b && <div style={{position: 'absolute', left: 520, top: 240, fontFamily: jet, fontSize: 130, fontWeight: 500, color: C.hi, letterSpacing: 6, textShadow: `7px 7px 0 ${C.green}`}}>{'XNCR'.slice(0, Math.min(4, Math.floor((f - b) / 3) + 1))}</div>}
      {f >= b && <div style={{position: 'absolute', left: 528, top: 390, fontFamily: font, fontWeight: 700, fontSize: 32, color: C.paper, opacity: eo(f, b + 10, b + 18)}}>延安新华广播电台 · 呼号</div>}
      {f >= c && <div style={{position: 'absolute', left: 64, top: 520, display: 'flex', alignItems: 'center', gap: 24}}>
        <span style={{position: 'relative', fontFamily: serif, fontWeight: 900, fontSize: 76, color: C.nightDim}}>只能听
          <span style={{position: 'absolute', left: -6, right: -6, top: '52%', height: 8, background: C.red, transformOrigin: '0 50%', transform: `scaleX(${eo(f, c + 2, c + 12)})`}} /></span>
        {f >= d - 6 && <span style={{fontFamily: serif, fontWeight: 900, fontSize: 96, color: C.paper, textShadow: `7px 7px 0 ${C.green}`, transform: `scale(${back(f, d - 6, 8)})`, display: 'inline-block'}}>→ 能说</span>}
      </div>}
    </div>}
    <Flash f={f} at={a} a={0.35} />
    <Hud no="NO.1940-12" chapter="二 · 说" night f={f} />
    <DotWipe f={f} from={C.paper} />
  </div>;
}, (cue) => [{at: 4, kind: 'marker', gain: 0.05}, {at: cue('a', 70), kind: 'stamp', gain: 0.1}, {at: cue('b', 150), kind: 'whoosh-short', gain: 0.05},
  ...[0, 3, 6, 9].map((i) => ({at: cue('b', 150) + i, kind: 'tick', gain: 0.05})), {at: cue('c', 210) + 2, kind: 'marker', gain: 0.07}, {at: cue('d', 260) - 6, kind: 'pop', gain: 0.07}]);

/* ======================= 5 xupt: the school's own line ======================= */

const YEARS: [string, string, string][] = [['1950', '陕甘两省', '邮电人员训练班'], ['1959', '西安', '邮电学院'], ['2012', '西安', '邮电大学']];
const Xupt = make(({f, cue, dur}) => {
  const a = cue('a', 30), b = cue('b', 100), c = cue('c', 160);
  const cam = camOf(f, [[0, {x: 540, y: 820, z: 1.06}, 1], [b - 6, {z: 0.98, y: 860}, 30], [c, {z: 1.04, y: 900}, Math.max(40, dur - c)]]);
  const sh = shakeOf(f, [a]);
  return <div style={{position: 'absolute', inset: 0, overflow: 'hidden'}}>
    <Defs />
    <Sheet f={f} />
    <Lay cam={cam} depth={0.5} shake={sh}>
      {/* rows of seats lighting up behind: one class after another */}
      {f >= c && <Dots color={C.green} step={34} angle={0} k={0.42} opacity={0.9} density={(x, y) => (y > 1080 && y < 1380 && x > 60 && x < 1020 ? ((x - 60) / 960 < (f - c) / 50 + (y - 1080) / 900 ? 1 : 0.25) : 0)} />}
    </Lay>
    <Lay cam={cam} depth={1} shake={sh}>
      <Wave a={[-60, 300]} b={[230, 560]} f={f} at={4} color={C.green} amp={12} width={6} />
      {YEARS.map(([yr, l1, l2], i) => {
        const at = i === 0 ? 4 : b + (i - 1) * 9;
        const x = i === 0 ? 74 : i === 1 ? 392 : 710, y = i === 0 ? 470 : 500 + i * 10;
        const big = i === 0 && f < b - 6 ? 1.25 : 1;
        return <div key={yr} style={{position: 'absolute', left: 0, top: 0, transform: `scale(${big})`, transformOrigin: `${x}px ${y}px`}}>
          <Stamp x={x} y={y} w={296} h={400} f={f} at={at} rot={i === 1 ? 2 : -2}>
            <div style={{position: 'absolute', inset: 0, background: i === 2 ? C.green : C.light}} />
            <Dots w={260} h={364} color={i === 2 ? C.greenDot : C.paper2} step={14} k={0.6} density={(xx, yy) => 0.25 + 0.6 * (yy / 364)} />
            <div style={{position: 'absolute', left: 16, top: 18, fontFamily: cond, fontWeight: 800, fontSize: 100, color: i === 2 ? C.paper : C.ink, lineHeight: 1}}>{yr}</div>
            <div style={{position: 'absolute', left: 16, bottom: 22, fontFamily: font, fontWeight: 900, fontSize: 36, lineHeight: 1.2, color: i === 2 ? C.paper : C.ink}}>{l1}<br />{l2}</div>
          </Stamp>
        </div>;
      })}
      {f >= b && [0, 1].map((i) => <div key={i} style={{position: 'absolute', left: 364 + i * 318, top: 690, fontFamily: font, fontWeight: 900, fontSize: 40, color: C.green, opacity: eo(f, b + 4 + i * 9, b + 10 + i * 9)}}>→</div>)}
    </Lay>
    <Lay cam={cam} depth={1.15} shake={sh}><Postmark x={330} y={860} f={f} at={a} date="1950" top="西安邮电大学" bottom="前身" r={120} rot={12} /></Lay>
    <Headline text="又过十年" x={64} y={250} size={110} f={f} at={2} />
    {f >= c && <div style={{position: 'absolute', left: 64, top: 980, fontFamily: hand, fontSize: 56, color: C.green, opacity: eo(f, c + 20, c + 30), transform: 'rotate(-3deg)'}}>一届届西邮人 →</div>}
    <Flash f={f} at={a} a={0.3} />
    <Hud no="NO.1950" chapter="三 · 传" f={f} />
    <DotWipe f={f} from={C.night} />
  </div>;
}, (cue) => [{at: 4, kind: 'paper', gain: 0.06}, {at: cue('a', 30), kind: 'stamp', gain: 0.1}, {at: cue('b', 100), kind: 'paper', gain: 0.05}, {at: cue('b', 100) + 9, kind: 'paper', gain: 0.05}, {at: cue('c', 160), kind: 'whoosh-short', gain: 0.04}]);

/* ======================= 6 era: cyber power, Beidou, 5G ======================= */

const Era = make(({f, cue, dur}) => {
  const a = cue('a', 40), b = cue('b', 120), c = cue('c', 180), d = cue('d', 240);
  const cam = camOf(f, [[0, {x: 540, y: 760, z: 1.04}, 1], [b - 8, {y: 820, z: 1.0}, 24], [c - 6, {y: 900, z: 1.04}, 30]]);
  const sat = eo(f, b, b + 50);
  const rise = eo(f, c, c + 26);
  const n = d > c ? Math.min(525.4, 525.4 * ease.outCubic(clamp((f - c - 6) / Math.max(10, d - c + 6)))) : 0;
  const quoteOut = io(f, b - 10, b + 6);
  return <div style={{position: 'absolute', inset: 0, overflow: 'hidden'}}>
    <Defs />
    <Sheet f={f} />
    <Lay cam={cam} depth={0.4}>
      <svg width={W} height={H} style={{position: 'absolute', inset: 0, opacity: eo(f, b - 4, b + 10)}}>
        <path d="M -100 1000 Q 540 340 1180 800" fill="none" stroke={C.ink} strokeWidth={3} strokeDasharray="14 12" />
      </svg>
    </Lay>
    <Lay cam={cam} depth={1}>
      {/* the quoted line (2014): the highlighter is drawn as it is said */}
      <div style={{position: 'absolute', left: 64, top: 560 - quoteOut * 160, width: 952, opacity: 1 - quoteOut, transform: `scale(${1 - quoteOut * 0.25})`, transformOrigin: '0 0'}}>
        <div style={{background: C.light, border: `4px solid ${C.ink}`, padding: '26px 30px', boxShadow: `10px 10px 0 ${C.green}`, transform: 'rotate(-1deg)'}}>
          <div style={{fontFamily: jet, fontSize: 26, color: C.dim}}>2014.2.27 · 中央网络安全和信息化领导小组第一次会议</div>
          <div style={{fontFamily: serif, fontWeight: 900, fontSize: 84, color: C.ink, marginTop: 18, lineHeight: 1.3}}>
            “努力把我国建设成为<Hl f={f} at={a + 18}>网络强国</Hl>”
          </div>
          <div style={{fontFamily: font, fontWeight: 700, fontSize: 30, color: C.dim, marginTop: 12}}>—— 习近平 · 来源：新华社</div>
        </div>
      </div>
      {f >= b && f < c + 20 && <div style={{position: 'absolute', left: 0, top: 0, opacity: 1 - eo(f, c, c + 16)}}>
        {(() => {
          const t = sat, x = -200 + 1300 * t, y = 1000 - Math.sin(t * Math.PI) * 330 - t * 60;
          return <Cut n="satellite" x={x} y={y} w={640} duo="inkPaper" rot={-12 + 20 * t} />;
        })()}
        <div style={{position: 'absolute', left: 64, top: 1180, opacity: eo(f, b + 10, b + 18), background: C.ink, color: C.paper, fontFamily: font, fontWeight: 900, fontSize: 52, padding: '10px 24px', whiteSpace: 'nowrap'}}>北斗三号 · 2020.7.31 全球开通</div>
      </div>}
      {f >= c && <>
        <Cut n="tower" x={860} y={1640 - 640 * rise} w={330} duo="inkPaper" />
        <div style={{position: 'absolute', left: 64, top: 720}}>
          <div style={{fontFamily: font, fontWeight: 900, fontSize: 40, color: C.ink}}>全国 5G 基站</div>
          <div style={{display: 'flex', alignItems: 'baseline', marginTop: 4}}>
            <span style={{fontFamily: cond, fontWeight: 800, fontSize: 270, color: C.green, lineHeight: 1, textShadow: `9px 9px 0 ${C.hi}`}}>{n.toFixed(1)}</span>
            <span style={{fontFamily: serif, fontWeight: 900, fontSize: 96, color: C.ink, marginLeft: 8}}>万</span>
          </div>
          <div style={{fontFamily: jet, fontSize: 26, color: C.dim, marginTop: 6}}>截至 2026.9 末 · 工信部</div>
        </div>
      </>}
    </Lay>
    <div style={{position: 'absolute', left: 64, top: 250, display: 'flex', gap: 14, alignItems: 'center', opacity: eo(f, 0, 8)}}>
      <span style={{background: C.green, color: C.paper, fontFamily: font, fontWeight: 900, fontSize: 34, padding: '6px 16px', borderRadius: 8}}>概论 · 知识点</span>
      <span style={{fontFamily: font, fontWeight: 900, fontSize: 40, color: C.ink}}>{f < b ? '网络强国' : f < c ? '科技自立自强' : '新时代伟大成就'}</span>
    </div>
    <Hud no="NO.2014-2026" chapter="四 · 连" f={f} />
  </div>;
}, (cue) => [{at: 2, kind: 'paper', gain: 0.05}, {at: cue('a', 40) + 18, kind: 'marker', gain: 0.08}, {at: cue('b', 120), kind: 'whoosh-short', gain: 0.06},
  {at: cue('c', 180), kind: 'whoosh-short', gain: 0.05}, ...Array.from({length: 8}, (_, i) => ({at: cue('c', 180) + 8 + i * 4, kind: 'tick', gain: 0.035})), {at: cue('d', 240), kind: 'thud', gain: 0.08}]);

/* ======================= 7 climax: one half radio → 5.25 million base stations ======================= */

const Climax = make(({f, cue}) => {
  const a = cue('a', 40);
  const spread = eo(f, a - 6, a + 40);
  const num = Math.min(525.4, 525.4 * ease.outCubic(clamp((f - a + 4) / 30)));
  return <div style={{position: 'absolute', inset: 0, overflow: 'hidden'}}>
    <Defs />
    <Sheet green f={f} edge={0.3} />
    {/* every dot one base station (schematic): they spread out from the stamp */}
    <Dots color={C.paper} step={22} angle={0} k={0.32} opacity={0.85} density={(x, y) => {
      const r = Math.hypot(x - 230, y - 420);
      return r < spread * 2100 ? 0.55 + 0.45 * hash(Math.round(x * 13 + y * 3)) : 0;
    }} />
    <div style={{position: 'absolute', inset: 0, background: `radial-gradient(ellipse 60% 22% at 50% 52%, ${C.green} 30%, transparent 100%)`, opacity: 0.92}} />
    <Stamp x={84} y={260} w={300} h={260} f={f} at={0} rot={-4} bg={C.light}>
      <Defs />
      <div style={{position: 'absolute', inset: 0, background: C.light}} />
      <div style={{position: 'absolute', left: -60, top: 30, width: 400, height: 210}}><Radio x={200} y={95} w={380} f={f} duo="inkPaper" /></div>
      <div style={{position: 'absolute', left: 12, bottom: 6, fontFamily: font, fontWeight: 900, fontSize: 30, color: C.ink}}>1930 · 半部</div>
    </Stamp>
    <div style={{position: 'absolute', left: 64, top: 820, width: 952, textAlign: 'center'}}>
      <div style={{fontFamily: cond, fontWeight: 800, fontSize: 330, color: C.paper, lineHeight: 0.95, textShadow: `12px 12px 0 ${C.ink}`, transform: `scale(${f >= a ? 1 + 0.06 * Math.exp(-(f - a) / 6) : 1})`}}>
        {f < a - 4 ? '1' : num.toFixed(1)}<span style={{fontFamily: serif, fontWeight: 900, fontSize: 140}}>{f < a - 4 ? '部' : '万'}</span>
      </div>
      <div style={{fontFamily: font, fontWeight: 900, fontSize: 44, color: C.paper, marginTop: 20, opacity: eo(f, a + 20, a + 30)}}>座 5G 基站 · 截至 2026.9 末</div>
    </div>
    <div style={{position: 'absolute', right: 70, top: 640, fontFamily: font, fontWeight: 700, fontSize: 28, color: C.paper, background: C.ink, padding: '4px 14px', opacity: eo(f, a + 10, a + 20)}}>网点为示意</div>
    <Flash f={f} at={a} a={0.35} />
    <Hud no="NO.1930→2026" chapter="四 · 连" night f={f} />
    <DotWipe f={f} from={C.paper} d={10} />
  </div>;
}, (cue) => [{at: cue('a', 40), kind: 'fs-impact-deep', gain: 0.1}]);

/* ======================= 8 ai: what AI drew, and what it can't ======================= */

const PARTS = ['radio', 'headphones', 'key', 'pagoda', 'cave', 'lamp', 'mic', 'tower', 'satellite'];
const Sheet9: React.FC<{f: number; at: number; pick?: number; dim?: number}> = ({f, at, pick = -1, dim = 0}) => <>
  {PARTS.map((n, i) => {
    const col = i % 3, row = Math.floor(i / 3), x = 210 + col * 330, y = 560 + row * 320;
    const p = back(f, at + i * 2, 8);
    if (f < at + i * 2) return null;
    const w = n === 'tower' ? 90 : n === 'lamp' ? 90 : n === 'mic' ? 140 : n === 'pagoda' ? 230 : 270;
    return <div key={n} style={{position: 'absolute', left: 0, top: 0, opacity: (i === pick ? 1 : 1 - dim * 0.75) * clamp(p * 2), transform: `translate(${x}px, ${y}px) scale(${p}) translate(${-x}px, ${-y}px)`}}>
      <div style={{position: 'absolute', left: x - 150, top: y - 130, width: 300, height: 270, background: C.light, border: `3px solid ${C.ink}`, boxShadow: '0 10px 18px rgba(30,20,10,0.18)'}} />
      <Cut n={n} x={x} y={y - 10} w={w} duo="inkPaper" edge={0} shadow={0.15} style={{maxHeight: 200}} />
      <div style={{position: 'absolute', left: x - 142, top: y + 96, background: C.ink, color: C.paper, fontFamily: font, fontWeight: 900, fontSize: 24, padding: '2px 10px', whiteSpace: 'nowrap'}}>AI 生成</div>
    </div>;
  })}
</>;
const SPIRIT = ['坚持真理、坚守理想，', '践行初心、担当使命，', '不怕牺牲、英勇斗争，', '对党忠诚、不负人民。'];
const Ai = make(({f, cue}) => {
  const a = cue('a', 40), b = cue('b', 130), c = cue('c', 170), d = cue('d', 220);
  const chip = back(f, 2, 12);
  const sheetOut = io(f, b - 8, b + 8);
  return <div style={{position: 'absolute', inset: 0, overflow: 'hidden'}}>
    <Defs />
    <Sheet f={f} />
    {f < a + 6 && <div style={{opacity: 1 - eo(f, a, a + 6)}}>
      <Cut n="chip" x={540} y={820} w={560 * (0.6 + 0.4 * chip)} duo="greenPaper" rot={-8 + 8 * chip} />
      <div style={{position: 'absolute', left: 540 - 120, top: 1080, width: 240, textAlign: 'center', background: C.green, color: C.paper, fontFamily: jet, fontSize: 40, padding: '6px 0', transform: `scale(${back(f, 12, 8)})`}}>AIGC</div>
    </div>}
    {f >= a && <div style={{opacity: 1 - sheetOut, transform: `scale(${1 - 0.08 * sheetOut})`, transformOrigin: '540px 800px'}}>
      <Sheet9 f={f} at={a} />
      <div style={{position: 'absolute', left: 64, top: 1330, fontFamily: font, fontWeight: 700, fontSize: 30, color: C.dim, opacity: eo(f, a + 20, a + 28)}}>本片插图：gpt-image-2 生成单个物件 · 运动与排版：代码</div>
    </div>}
    {f >= b - 8 && <div style={{position: 'absolute', left: 64, top: 560, width: 952, opacity: eo(f, b - 8, b + 4), transform: `translateY(${(1 - eo(f, b - 8, b + 4)) * 40}px)`}}>
      <div style={{background: C.light, border: `4px solid ${C.ink}`, padding: '30px 34px', boxShadow: `10px 10px 0 ${C.red}`, transform: 'rotate(1deg)'}}>
        <div style={{display: 'flex', justifyContent: 'space-between'}}>
          <span style={{fontFamily: font, fontWeight: 900, fontSize: 40, color: C.red}}>伟大建党精神</span>
          <span style={{fontFamily: jet, fontSize: 24, color: C.dim}}>2021.7.1 · 概论 · 知识点</span>
        </div>
        <div style={{marginTop: 16, fontFamily: serif, fontWeight: 900, fontSize: 76, color: C.ink, lineHeight: 1.45}}>
          {SPIRIT.map((s, i) => <div key={i} style={{opacity: eo(f, b + i * 5, b + 6 + i * 5)}}>
            {i === 0 ? <>坚持真理、<Hl f={f} at={c}>坚守理想</Hl>，</> : i === 2 ? <><Hl f={f} at={d}>不怕牺牲</Hl>、英勇斗争，</> : s}
          </div>)}
        </div>
      </div>
    </div>}
    <Hud no="NO.AI" chapter="五 · 想" f={f} />
  </div>;
}, (cue) => [{at: 2, kind: 'thud', gain: 0.06}, ...Array.from({length: 9}, (_, i) => ({at: cue('a', 40) + i * 2, kind: 'tick', gain: 0.03})), {at: cue('b', 130), kind: 'paper', gain: 0.06}, {at: cue('c', 170), kind: 'marker', gain: 0.08}, {at: cue('d', 220), kind: 'marker', gain: 0.08}]);

/* ======================= 9 choose: we decide ======================= */

const Choose = make(({f, cue}) => {
  const a = cue('a', 50);
  const ring = eo(f, a, a + 16);
  return <div style={{position: 'absolute', inset: 0, overflow: 'hidden'}}>
    <Defs />
    <Sheet f={f} />
    <Sheet9 f={f} at={-30} pick={0} dim={eo(f, a - 4, a + 8)} />
    <svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
      <ellipse cx={210} cy={550} rx={190} ry={170} fill="none" stroke={C.red} strokeWidth={9} strokeLinecap="round" pathLength={100} strokeDasharray={`${ring * 104} 200`} transform="rotate(-12 210 550)" />
    </svg>
    <div style={{position: 'absolute', left: 400, top: 1290, fontFamily: hand, fontSize: 100, color: C.red, transform: `rotate(-5deg) scale(${back(f, a + 12, 8)})`, transformOrigin: '0 50%'}}>我们定</div>
    <Headline text="讲哪段？为什么讲？" x={64} y={250} size={74} f={f} at={2} />
    <Hud no="NO.AI" chapter="五 · 想" f={f} />
  </div>;
}, (cue) => [{at: cue('a', 50), kind: 'marker', gain: 0.08}]);

/* ======================= 10 end: we send — the other half prints back ======================= */

const End = make(({f, cue, dur}) => {
  const a = cue('a', 50), b = cue('b', 110), c = cue('c', 150);
  const typeAt = (i: number) => a + 6 + i * Math.max(4, Math.floor((c + 20 - a) / 8));
  const typed = CODES.filter((_, i) => f >= typeAt(i)).length;
  const fill = clamp(typed / 8);
  const last = typeAt(7);
  const credits = c + 75;
  const cam = camOf(f, [[0, {z: 1.04}, 1], [a, {z: 1.0}, 60]]);
  const press = CODES.some((_, i) => f >= typeAt(i) && f < typeAt(i) + 3);
  const decodeAt = (i: number) => (i < 4 ? b : c) + (i % 4) * 3;
  return <div style={{position: 'absolute', inset: 0, overflow: 'hidden'}}>
    <Defs />
    <Sheet night f={f} />
    <Lay cam={cam} depth={1}>
      <Radio x={540} y={540} w={760} f={f} fill={fill} duo="nightPaper" night />
      {fill >= 1 && <Rings x={735} y={540} f={f} at={last + 2} color={C.hi} n={4} max={600} every={13} width={7} />}
      {/* the telegram form: 2 rows × 4 code boxes, characters decoded underneath */}
      <div style={{position: 'absolute', left: 70, top: 780, width: 940, background: C.light, padding: '22px 22px 26px', border: `4px solid ${C.green}`, boxShadow: '0 24px 40px rgba(0,0,0,0.35)', opacity: eo(f, 0, 8)}}>
        {[0, 1].map((row) => <div key={row} style={{display: 'flex', gap: 14, marginTop: row ? 18 : 0}}>
          {CODES.slice(row * 4, row * 4 + 4).map(([code, ch], j) => {
            const i = row * 4 + j, on = f >= typeAt(i), dec = f >= decodeAt(i);
            return <div key={i} style={{width: 215}}>
              <div style={{height: 62, border: `3px solid ${C.green}`, borderBottom: 'none', fontFamily: jet, fontSize: 44, color: C.ink, textAlign: 'center', lineHeight: '62px', letterSpacing: 4, background: on && f < typeAt(i) + 4 ? '#F6E7A8' : 'transparent'}}>{on ? code : ''}</div>
              <div style={{height: 136, border: `3px solid ${C.green}`, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                {dec && <span style={{fontFamily: serif, fontWeight: 900, fontSize: 124, color: C.red, transform: `scale(${back(f, decodeAt(i), 8)})`, display: 'inline-block'}}>{ch}</span>}
              </div>
            </div>;
          })}
        </div>)}
      </div>
    </Lay>
    <Lay cam={cam} depth={1.2}>
      <Cut n="key" x={280} y={1330 + (press ? 6 : 0)} w={380} duo="nightPaper" rot={-4} />
      {f >= c + 24 && <Postmark x={800} y={1300} f={f} at={c + 24} date="2026" top="西安邮电大学" bottom="发报" r={130} rot={-8} color={C.hi} />}
    </Lay>
    <div style={{position: 'absolute', left: 64, top: 250, fontFamily: serif, fontWeight: 900, fontSize: 92, color: C.paper, textShadow: `7px 7px 0 ${C.green}`, opacity: eo(f, 2, 10)}}>{f < a ? '当年只能听' : '轮到我们发报'}</div>
    <Hud no="NO.2026" chapter="六 · 发" night f={f} />
    {/* end credits (contest: disclose AI-generated content) */}
    {f >= credits && <div style={{position: 'absolute', inset: 0, background: C.paper, opacity: eo(f, credits, credits + 10)}}>
      <Sheet f={f} edge={0.4} />
      <div style={{position: 'absolute', left: 70, top: 220, width: 940}}>
        <div style={{fontFamily: serif, fontWeight: 900, fontSize: 84, color: C.ink, textShadow: `6px 6px 0 ${C.green}`}}>半部电台</div>
        <div style={{fontFamily: font, fontWeight: 700, fontSize: 34, color: C.dim, marginTop: 8}}>一堂西邮人的思政课 · {TEAM.school.replace('参赛学院：', '')}</div>
        <div style={{marginTop: 46, background: C.light, border: `4px solid ${C.ink}`, padding: '24px 28px', boxShadow: `8px 8px 0 ${C.green}`}}>
          <div style={{fontFamily: font, fontWeight: 900, fontSize: 40, color: C.green}}>AIGC 使用说明</div>
          {['插图：电台、耳机、电键、宝塔山、窑洞、油灯、话筒、铁塔、卫星、芯片 10 件剪贴件由 AI 生成（gpt-image-2），双色调与排版由团队完成',
            '配音：AI 语音合成（MiniMax）',
            '动画与剪辑：代码生成（Remotion），AI 辅助编程',
            '配乐与音效：程序合成',
            '选题、史实核对、脚本与审定：创作团队'].map((t, i) => <div key={i} style={{fontFamily: font, fontWeight: 700, fontSize: 30, color: C.ink, marginTop: 14, lineHeight: 1.4}}>· {t}</div>)}
        </div>
        <div style={{marginTop: 34, fontFamily: font, fontWeight: 700, fontSize: 28, color: C.ink, lineHeight: 1.55}}>
          史实来源：中国网信网、共产党员网、新华社、扬子晚报、工信部、西安邮电大学官网；中文电码：Unicode Unihan 数据库<br />
          {TEAM.school.replace('参赛学院：', '')} · {TEAM.major.replace('专业班级：', '')}<br />{TEAM.members}　{TEAM.teacher}
        </div>
      </div>
    </div>}
    <DotWipe f={f} from={C.paper} />
  </div>;
}, (cue, dur) => {
  const a = cue('a', 50), c = cue('c', 150);
  const step = Math.max(4, Math.floor((c + 20 - a) / 8));
  return [...Array.from({length: 8}, (_, i) => ({at: a + 6 + i * step, kind: 'tick', gain: 0.07})), {at: cue('b', 110), kind: 'pop', gain: 0.06}, {at: c, kind: 'pop', gain: 0.06}, {at: c + 24, kind: 'stamp', gain: 0.1}].filter((e) => e.at < dur);
});

export const XUPT_HALF_RADIO_SCENES: Record<string, Scene> = {
  'xh.hook': Hook, 'xh.title': Title, 'xh.listen': Listen, 'xh.yanan': Yanan, 'xh.xupt': Xupt, 'xh.era': Era, 'xh.climax': Climax, 'xh.ai': Ai, 'xh.choose': Choose, 'xh.end': End,
};
