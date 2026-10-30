import React from 'react';
import {Img, staticFile} from 'remotion';
import {clamp, ease} from '../../fx';
import {hand, jet} from '../fonts';
import {Cue, Scene} from '../paper';
import {W, eo} from '../package';

// photocraft-ai-photoshop, made on the template lemo/blueprint (docs/video-craft/prompt-library/vendor/lemomo-ai__
// lemo-opuscar/3961ddb/styles/blueprint/STYLE.md; picked because the story is "the drawing is complete, half of it is
// built": dimension lines, balloons, a title block and a section line are a measured progress report). PhotoCraft, an
// open-source clean-room Photoshop in Rust (storytold/photocraft, MIT / Apache-2.0): its own ROADMAP.md (2026-10-17,
// v0.6.0) says menus 628/628, tools 56/68, panels 30/35, ready for real work ~45 %, performance 3/25 budgets met,
// 953 open issues, PSDs it writes not yet reliably accepted by Photoshop, 1,100–1,800 Opus 5.5 agent-hours to beta;
// 75.1k stars on 2026-10-30; "written with Claude Opus 5.5" is press reporting. Inputs: inputs/photocraft-ai-photoshop/.
// Storyboard: tutorials/photocraft-ai-photoshop.storyboard.md.
// - What the template gives: the whole film on one sheet of cyanotype paper; white line work in four weights, hidden
//   lines dashed; drafting order; live annotations (dimension lines, numbered balloons); FIG. numbers as transitions;
//   the title block as the story (its status field is the verdict); one non-blue colour, once (the stamp).
// - Customised (模板改造): the sheet's blues are the Prussian blues of the material itself (Hokusai's wave in the
//   official screenshot: #14233B / #1C3762 / #25649E) and the lines its paper cream #EEE8D1; borrowed from opuscar98/70
//   "a blueprint developing into the real thing": what works is developed into the screenshot's real pixels, what does
//   not stays drawing (the drawing is computed from the same screenshot, demo-lines.png, so both are pixel-aligned); the
//   stamp is the amber of the README's "early alpha" badge (#D69E2E); hand lettering in 霞鹜文楷, fields in JetBrains Mono.

const K = {deep: '#14233B', blue: '#1C3762', light: '#25649E', line: '#EEE8D1', dim: 'rgba(238,232,209,0.62)', faint: 'rgba(238,232,209,0.28)', amber: '#D69E2E'};
/** A slow camera ease (half a sine): starts and settles without a jolt. */
const sine = (t: number) => 0.5 - 0.5 * Math.cos(Math.PI * clamp(t));
const IMG = (n: string) => staticFile(`images/photocraft-ai-photoshop/${n}`);
// The screenshot is 2400 × 1500; on the sheet it is a window of WW × WH at (WX, WY).
const SW = 2400, SH = 1500;
// The camera's low position (the cutaway, the PSD and the issues): the window's lower edge at the top of the frame.
const CAM_LOW = 645;
const WX = 40, WY = 450, WW = 1000, WH = WW * SH / SW; // 625

/* ---------- the sheet ---------- */

/** The cyanotype sheet: uneven coating in the material's blues, fibres and specks (SVG noise), a fold, bleached edges, a border. */
// The camera reads the sheet: `zoom` around `focus` (sheet px) on top of the vertical position camY (blueprint §5: moves
// continue within a section; richness.mjs failed the first render on 20 s per 30 of dead-still sheet).
const Sheet: React.FC<{children?: React.ReactNode; camY?: number; hud?: React.ReactNode; zoom?: number; focus?: [number, number]}> = ({children, camY = 0, hud, zoom = 1,
  focus = [540, WY + WH / 2]}) => <div style={{position: 'absolute', inset: 0, overflow: 'hidden', background: K.deep}}>
  <div style={{position: 'absolute', left: 0, top: -camY, width: W, height: 2600, transform: `scale(${zoom})`, transformOrigin: `${focus[0]}px ${focus[1]}px`}}>
    <div style={{position: 'absolute', inset: 0, background: `radial-gradient(ellipse 70% 38% at 38% 24%, ${K.light} 0%, ${K.blue} 55%, ${K.deep} 100%), ${K.blue}`}} />
    <svg width={W} height={2600} style={{position: 'absolute', inset: 0, mixBlendMode: 'soft-light', opacity: 0.55}}>
      <filter id="pc-grain"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={7} /><feColorMatrix values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 1.2 -0.35" /></filter>
      <filter id="pc-coat"><feTurbulence type="fractalNoise" baseFrequency="0.004 0.012" numOctaves={3} seed={3} /><feColorMatrix values="0 0 0 0 0.9  0 0 0 0 0.95  0 0 0 0 1  0 0 0 0.9 -0.3" /></filter>
      <rect width={W} height={2600} filter="url(#pc-coat)" />
      <rect width={W} height={2600} filter="url(#pc-grain)" opacity={0.6} />
    </svg>
    {/* a fold: bright edge, dark edge */}
    <div style={{position: 'absolute', left: 0, right: 0, top: 1296, height: 2, background: 'rgba(238,232,209,0.10)'}} />
    <div style={{position: 'absolute', left: 0, right: 0, top: 1298, height: 3, background: 'rgba(5,10,20,0.22)'}} />
    {/* sheet border: a double rule */}
    <div style={{position: 'absolute', left: 22, right: 22, top: 172, bottom: 22, border: `3px solid ${K.dim}`}} />
    <div style={{position: 'absolute', left: 32, right: 32, top: 182, bottom: 32, border: `1px solid ${K.faint}`}} />
    {children}
  </div>
  {/* the sheet's header block: pinned, opaque, so the camera can read the drawing under it */}
  <div style={{position: 'absolute', left: 22, right: 22, top: 172, height: 228, background: K.blue, borderBottom: `3px solid ${K.dim}`, boxShadow: '0 10px 24px rgba(4,8,16,0.35)'}}>
    <div style={{position: 'absolute', inset: 10, border: `1px solid ${K.faint}`}} />
  </div>
  {hud}
  <div style={{position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 90% 75% at 50% 40%, transparent 60%, rgba(4,8,16,0.5) 100%)', pointerEvents: 'none'}} />
</div>;

/** Lettering written on left to right (a clip that opens with a soft nib). */
const Letter: React.FC<{text: string; f: number; from: number; d?: number; size: number; x: number; y: number; color?: string; family?: string; weight?: number; ls?: number; right?: boolean}> = ({
  text, f, from, d = 10, size, x, y, color = K.line, family = hand, weight = 500, ls = 1, right = false}) => {
  const p = clamp((f - from) / d);
  if (p <= 0) return null;
  return <div style={{position: 'absolute', ...(right ? {right: W - x} : {left: x}), top: y, fontFamily: family, fontWeight: weight, fontSize: size, lineHeight: 1.1, color, letterSpacing: ls, whiteSpace: 'nowrap', width: 'max-content',
    clipPath: `inset(-20% ${100 - p * 100}% -20% -2%)`}}>{text}</div>;
};

/** A dimension line from (x0, y) to (x1, y), drawn on with progress p: extension ticks, arrows, the value in a gap. */
const Dim: React.FC<{x0: number; x1: number; y: number; p: number; label: string; size?: number; up?: boolean}> = ({x0, x1, y, p, label, size = 44, up = true}) => {
  if (p <= 0) return null;
  const xe = x0 + (x1 - x0) * ease.inOutCubic(clamp(p / 0.8));
  const lp = clamp((p - 0.6) / 0.4);
  const tw = label.length * size * 0.62 + 30;
  const mid = (x0 + x1) / 2;
  return <>
    <svg width={W} height={2600} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
      <line x1={x0} y1={y - 26} x2={x0} y2={y + 26} stroke={K.line} strokeWidth={2} />
      {p > 0.75 && <line x1={x1} y1={y - 26} x2={x1} y2={y + 26} stroke={K.line} strokeWidth={2} />}
      <line x1={x0} y1={y} x2={Math.min(xe, mid - tw / 2)} y2={y} stroke={K.line} strokeWidth={2.5} />
      {xe > mid + tw / 2 && <line x1={mid + tw / 2} y1={y} x2={xe} y2={y} stroke={K.line} strokeWidth={2.5} />}
      <path d={`M${x0} ${y} l18 -8 l0 16 z`} fill={K.line} />
      {p > 0.75 && <path d={`M${x1} ${y} l-18 -8 l0 16 z`} fill={K.line} />}
    </svg>
    <div style={{position: 'absolute', left: mid - tw / 2, top: y - (up ? size * 0.62 : size * 0.5), width: tw, textAlign: 'center', fontFamily: jet, fontSize: size, color: K.line, opacity: lp,
      transform: `translateY(${(1 - lp) * 8}px)`}}>{label}</div>
  </>;
};

/** A numbered balloon at (x, y) with a leader to (tx, ty): the leader draws, the circle closes, the text is written. */
const Balloon: React.FC<{n: string; x: number; y: number; tx: number; ty: number; f: number; from: number; text: string; size?: number; dashed?: boolean; side?: 'right' | 'left'}> = ({
  n, x, y, tx, ty, f, from, text, size = 56, dashed = false, side = 'right'}) => {
  const p = eo(f, from, from + 8), q = eo(f, from + 5, from + 12);
  if (p <= 0) return null;
  const r = 30;
  return <>
    <svg width={W} height={2600} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
      <circle cx={tx} cy={ty} r={6} fill={K.line} />
      <line x1={tx} y1={ty} x2={tx + (x - tx) * p} y2={ty + (y - ty) * p} stroke={K.line} strokeWidth={2} strokeDasharray={dashed ? '10 7' : undefined} />
      <circle cx={x} cy={y} r={r} fill={K.blue} stroke={K.line} strokeWidth={2.5} strokeDasharray={`${2 * Math.PI * r * q} 999`} transform={`rotate(-90 ${x} ${y})`} />
    </svg>
    <div style={{position: 'absolute', left: x - r, top: y - r, width: 2 * r, height: 2 * r, display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: jet, fontSize: 26, color: K.line, opacity: q}}>{n}</div>
    <Letter text={text} f={f} from={from + 8} d={9} size={size} x={side === 'right' ? x + r + 16 : x - r - 16} right={side === 'left'} y={y - size * 0.58} family={jet} />
  </>;
};

/** The title block (标题栏), the film's through-object: rows of fields, filled as the story measures the app. */
type Fields = {author?: string; state?: string; hours?: string};
const TitleBlock: React.FC<{f: number; v: Fields; y?: number; at?: Partial<Record<keyof Fields, number>>}> = ({f, v, y = 1112, at: when = {}}) => {
  const x = 60, w = 860, rh = 58;
  const rows: [string, string, keyof Fields | null][] = [['作者', v.author ?? '', 'author'], ['状态', v.state ?? '', 'state'], ['到测试版', v.hours ?? '', 'hours']];
  return <div style={{position: 'absolute', left: x, top: y, width: w, height: rows.length * rh, border: `3px solid ${K.line}`, background: 'rgba(20,35,59,0.55)'}}>
    {rows.map(([k, val, key], i) => <div key={k} style={{position: 'absolute', left: 0, top: i * rh, width: w - 6, height: rh, borderTop: i ? `1.5px solid ${K.dim}` : undefined}}>
      <div style={{position: 'absolute', left: 0, top: 0, width: 168, height: rh, borderRight: `1.5px solid ${K.dim}`, fontFamily: hand, fontSize: 32, color: K.dim, display: 'flex', alignItems: 'center', paddingLeft: 18}}>{k}</div>
      {val && (key ? <Letter text={val} f={f} from={when[key] ?? -99} d={12} size={38} x={190} y={9} family={jet} /> :
        <div style={{position: 'absolute', left: 190, top: 9, fontFamily: jet, fontSize: 38, color: K.line, whiteSpace: 'nowrap'}}>{val}</div>)}
    </div>)}
  </div>;
};

/** Source / credit line (external footage: 「@作者｜案例展示」 bottom-right of the picture). */
const Credit: React.FC<{y?: number}> = ({y = WY + WH + 14}) => <div style={{position: 'absolute', right: 1080 - WX - WW, top: y, fontFamily: jet, fontSize: 22, color: K.dim}}>@ArtCraft｜案例展示</div>;

/** Sheet header: FIG. number (struck and rewritten as a transition) and the hand-lettered title. */
const Header: React.FC<{f: number; fig: string; title: string; strike?: number; next?: string; big?: string; bigAt?: number; small?: string}> = ({f, fig, title, strike = 1e9, next, big, bigAt = -99, small}) => {
  const s = clamp((f - strike) / 6);
  return <>
    <div style={{position: 'absolute', left: 60, top: 206, fontFamily: jet, fontSize: 30, color: K.dim, letterSpacing: 2}}>
      <span style={{position: 'relative'}}>{fig}{s > 0 && <span style={{position: 'absolute', left: -4, top: '52%', height: 3, width: `${s * 106}%`, background: K.line}} />}</span>
      {next && f >= strike + 6 && <Letter text={next} f={f} from={strike + 6} d={10} size={30} x={fig.length * 19 + 24} y={0} family={jet} color={K.line} ls={2} />}
    </div>
    <div style={{position: 'absolute', left: 60, top: 196, width: 960, textAlign: 'right', fontFamily: hand, fontSize: 36, color: K.line}}>{title}</div>
    {big && <Letter text={big} f={f} from={bigAt} d={12} size={big.length > 11 ? 70 : big.length > 9 ? 84 : 100} x={60} y={262} family={jet} />}
    {small && <Letter text={small} f={f} from={bigAt + 6} d={10} size={34} x={1020} right y={336} color={K.dim} />}
  </>;
};

/**
 * The window: the drawing (lines computed from the screenshot) always; the real pixels developed from the left up to
 * `dev` (0..1) with a soft warm edge; right of `hidden`, the drawing turns into hidden lines (dashed).
 */
const Window: React.FC<{dev: number; hidden?: number; x?: number; y?: number; w?: number}> = ({dev, hidden = 1, x = WX, y = WY, w = WW}) => {
  const h = w * SH / SW;
  const dash = 'repeating-linear-gradient(90deg, #000 0 9px, transparent 9px 15px), repeating-linear-gradient(0deg, #000 0 9px, transparent 9px 15px)';
  return <div style={{position: 'absolute', left: x, top: y, width: w, height: h}}>
    <div style={{position: 'absolute', inset: 0, background: 'rgba(20,35,59,0.35)'}} />
    <Img src={IMG('demo-lines.png')} style={{position: 'absolute', left: 0, top: 0, width: w, height: h, clipPath: `inset(0 ${(1 - hidden) * 100}% 0 0)`}} />
    {hidden < 1 && <Img src={IMG('demo-lines.png')} style={{position: 'absolute', left: 0, top: 0, width: w, height: h, opacity: 0.75, clipPath: `inset(0 0 0 ${hidden * 100}%)`,
      WebkitMaskImage: dash, WebkitMaskComposite: 'source-in', maskImage: dash, maskComposite: 'intersect'}} />}
    {dev > 0 && <Img src={IMG('demo.jpg')} style={{position: 'absolute', left: 0, top: 0, width: w, height: h, clipPath: `inset(0 ${(1 - dev) * 100}% 0 0)`}} />}
    {dev > 0.002 && dev < 0.998 && <div style={{position: 'absolute', left: dev * w - 24, top: 0, width: 48, height: h,
      background: 'linear-gradient(90deg, transparent, rgba(255,214,150,0.28) 50%, transparent)', mixBlendMode: 'screen'}} />}
    <div style={{position: 'absolute', inset: -6, border: `4px solid ${K.line}`}} />
  </div>;
};

const make = (draw: NonNullable<Scene['backdrop']>, sfx?: Scene['sfx']): Scene => {
  const Sc: Scene = () => null;
  Sc.backdrop = draw;
  Sc.sfx = sfx;
  return Sc;
};

/* ---------- 1 hook: fully developed; the menu bar measured 628 / 628 ---------- */

const hookPlan = (cue: Cue) => ({a: cue('a', 44), b: cue('b', 70)});
const Hook = make(({f, cue}) => {
  const p = hookPlan(cue);
  const k = 1;
  return <Sheet zoom={1 + 0.07 * sine(clamp(f / 127))} focus={[540, WY + 40]} hud={<Header f={f} fig="FIG. 1 · 总装图" title="PhotoCraft · 免费 · 开源" big="628 / 628" bigAt={-30} small="对照 Photoshop 2026" />}>
    <div style={{position: 'absolute', inset: 0, transform: `scale(${k})`, transformOrigin: '540px 760px'}}>
      <Window dev={1} />
      <Dim x0={WX} x1={WX + WW} y={WY - 26} p={1} label="菜单 628 / 628" size={36} up={false} />
      {f >= p.a && <div style={{position: 'absolute', left: WX - 4, top: WY - 4, height: 58 * WW / SW + 8, width: (WW + 8) * eo(f, p.a, p.a + 14), border: `3px solid ${K.line}`,
        boxShadow: `0 0 18px rgba(238,232,209,${0.5 * (1 - eo(f, p.b, p.b + 20))})`}} />}
    </div>
    <Credit />
    <TitleBlock f={f} v={{}} />
  </Sheet>;
}, (cue) => {
  const p = hookPlan(cue);
  return [{at: 0, kind: 'pop', gain: 0.05}, {at: p.a, kind: 'marker', gain: 0.1}, {at: p.b, kind: 'tick', gain: 0.06}];
});

/* ---------- 2 stars: author field (据报道) and a star counter ---------- */

const starsPlan = (cue: Cue) => ({a: cue('a', 10), b: cue('b', 60)});
const Stars = make(({f, cue}) => {
  const p = starsPlan(cue);
  const n = Math.round(75.1 * ease.outCubic(clamp((f - p.b) / 24)) * 10) / 10;
  return <Sheet hud={<Header f={f} fig="FIG. 1 · 总装图" title="PhotoCraft · 免费 · 开源" big={f >= p.b ? `★ ${n.toFixed(1)}k` : '628 / 628'} bigAt={f >= p.b ? p.b : -30}
    small={f >= p.b ? 'GitHub 星 · 10-30' : '对照 Photoshop 2026'} />}>
    {/* the camera reads the drawing: in to the canvas and the Curves panel while the author is named, back out for the stars */}
    <Window dev={1} />
    <div style={{position: 'absolute', left: WX, top: WY, width: WW, height: WH, overflow: 'hidden'}}>
      <div style={{position: 'absolute', left: -WX, top: -WY, width: W, height: 1920, transform: `scale(${(1 + 0.6 * ease.inOutCubic(clamp((f - 4) / 40)) + 0.0025 * Math.max(0, f - 44)) * (1 - ease.inOutCubic(clamp((f - p.b + 12) / 18))) + ease.inOutCubic(clamp((f - p.b + 12) / 18))})`,
        transformOrigin: `${WX + 0.7 * WW}px ${WY + 0.4 * WH}px`}}><Window dev={1} /></div>
    </div>
    <Credit />
    <TitleBlock f={f} v={{author: 'Claude Opus 5.5（据报道）'}} at={{author: p.a}} />
  </Sheet>;
}, (cue) => [{at: starsPlan(cue).a, kind: 'marker', gain: 0.08}, {at: starsPlan(cue).b, kind: 'pop', gain: 0.08}]);

/* ---------- 3 turn (signature): the development recedes to 45 %; the rest becomes hidden lines ---------- */

const turnPlan = (cue: Cue) => ({go: cue('a', 30), stop: cue('b', 62)});
const devAt = (f: number, go: number, stop: number) => 1 - 0.55 * ease.inOutCubic(clamp((f - go) / Math.max(1, stop - go)));
const Turn = make(({f, cue}) => {
  const p = turnPlan(cue);
  const dev = devAt(f, p.go, p.stop);
  const z = 1 + 0.025 * ease.inOutCubic(clamp((f - p.stop) / 40));
  return <Sheet zoom={1 + 0.035 * sine(clamp(f / p.stop))} focus={[WX + 0.45 * WW, WY + WH / 2]} hud={<Header f={f} fig="FIG. 1 · 总装图" title="PhotoCraft · 路线图自评" big={f >= p.stop ? '≈45%' : undefined} bigAt={p.stop + 4} small="路线图自评 · 估算 40–50%" />}>
    <div style={{position: 'absolute', inset: 0, transform: `scale(${z})`, transformOrigin: `${WX + 0.45 * WW}px ${WY + WH / 2}px`}}>
      <Window dev={dev} hidden={f >= p.stop ? 0.45 : 1} />
      <Dim x0={WX} x1={WX + 0.45 * WW} y={WY - 26} p={eo(f, p.stop, p.stop + 14)} label="45%" size={36} up={false} />
      {f >= p.stop + 14 && <div style={{position: 'absolute', left: WX + 0.53 * WW, top: WY + WH * 0.44, padding: '6px 18px', background: K.blue, border: `2px dashed ${K.line}`}}>
        <Letter text="还是图纸 ≈55%" f={f} from={p.stop + 14} d={10} size={40} x={0} y={0} /><div style={{width: 350, height: 44}} /></div>}
    </div>
    <Credit />
    <TitleBlock f={f} v={{author: 'Claude Opus 5.5（据报道）', state: '能干活 ≈45%（自评）'}} at={{author: -99, state: p.stop + 10}} />
  </Sheet>;
}, (cue) => {
  const p = turnPlan(cue);
  return [{at: p.go, kind: 'fs-whoosh-wipe', gain: 0.05}, {at: p.stop, kind: 'marker', gain: 0.12}, {at: p.stop + 10, kind: 'marker', gain: 0.08}];
});

/* ---------- 4 parts: FIG. 2 exploded — menu bar up, tool bar left, panels right; missing slots as hidden lines ---------- */

const partsPlan = (cue: Cue) => ({x: 6, menu: cue('a', 24), tools: cue('b', 64), panels: cue('c', 110)});
// Exploded layout: the window at 0.74 scale, centred; pieces measured on the screenshot (px).
const EW = 700, EX = (W - EW) / 2, EY = 560, es = EW / SW, EH = SH * es;
const Parts = make(({f, dur, cue}) => {
  const p = partsPlan(cue);
  // carry: the turn's full-size window shrinks into the exploded view, and at the end the pieces close and it grows
  // back, so the next scene starts on the same window (scripts/qa/carry.mjs)
  const back = ease.inOutCubic(clamp((f - (dur - 16)) / 14));
  const ex = ease.inOutCubic(clamp((f - p.x) / 16)) * (1 - back);
  const m = ease.inOutCubic(clamp(f / 12)) * (1 - back), k = WW / EW + (1 - WW / EW) * m;
  const tx = WX - EX * k, ty = WY - EY * k;
  const crop = (x0: number, y0: number, x1: number, y1: number, dx: number, dy: number, dev: number) => <div style={{position: 'absolute', left: EX + x0 * es + dx * ex, top: EY + y0 * es + dy * ex,
    width: (x1 - x0) * es, height: (y1 - y0) * es, overflow: 'hidden', outline: `2px solid ${K.line}`}}>
    <Img src={IMG('demo-lines.png')} style={{position: 'absolute', left: -x0 * es, top: -y0 * es, width: EW}} />
    <Img src={IMG('demo.jpg')} style={{position: 'absolute', left: -x0 * es, top: -y0 * es, width: EW, opacity: dev}} />
  </div>;
  const slot = (x: number, y: number, w: number, h: number, key: string) => <div key={key} style={{position: 'absolute', left: x, top: y, width: w, height: h, border: `2px dashed ${K.dim}`}} />;
  const toolsX = EX - 80 * ex, panelX = EX + 1962 * es + 40 * ex;
  return <Sheet zoom={1 + 0.05 * sine(clamp(f / dur)) * (1 - back)} focus={[540, 900]} hud={<Header f={f} fig="FIG. 1" title="拆开看：哪些做出来了" strike={0} next="FIG. 2 · 拆开"
    big={f >= p.panels + 16 ? '缺 12 + 5' : undefined} bigAt={p.panels + 16} small="个工具 + 块面板" />}>
    <div style={{position: 'absolute', left: 0, top: 0, width: W, height: 2600, transform: `translate(${tx}px, ${ty}px) scale(${k})`, transformOrigin: '0 0'}}>
    {/* the body, kept as drawing */}
    <div style={{position: 'absolute', left: EX, top: EY, width: EW, height: EH, opacity: 0.55 + 0.45 * (1 - ex)}}><Window dev={0.45 * (1 - ex)} hidden={0.45} x={0} y={0} w={EW} /></div>
    {crop(0, 0, 2400, 58, 0, -90, 1)}
    {crop(0, 100, 108, 1460, -80, 0, 1)}
    {crop(1962, 50, 2400, 1450, 40, 0, 0.85)}
    {/* 12 tools not built: dashed slots under the tool bar (2 × 6); 5 panels not built: dashed boxes under the panels */}
    {f >= p.tools + 10 && Array.from({length: 12}, (_, i) => slot(toolsX + (i % 2) * 34, EY + 1460 * es + 14 + Math.floor(i / 2) * 28 * eo(f, p.tools + 10 + i, p.tools + 14 + i), 28, 22, `t${i}`))}
    {f >= p.panels + 10 && Array.from({length: 5}, (_, i) => slot(panelX, EY + 1450 * es + 14 + i * 40 * eo(f, p.panels + 10 + i * 2, p.panels + 16 + i * 2), (2400 - 1962) * es, 30, `p${i}`))}
    </div>
    {back < 0.3 && <><Balloon n="1" x={110} y={440} tx={EX + 700 * es} ty={EY - 90 + 28 * es} f={f} from={p.menu} text="菜单 628/628" size={52} />
    <Balloon n="2" x={110} y={1250} tx={toolsX + 30} ty={EY + 1500 * es + 60} f={f} from={p.tools} text="工具 56/68" size={52} />
    <Balloon n="3" x={890} y={1250} tx={panelX + 60} ty={EY + 1450 * es + 180} f={f} from={p.panels} text="面板 30/35" size={52} side="left" /></>}
  </Sheet>;
}, (cue) => {
  const p = partsPlan(cue);
  return [{at: p.x, kind: 'fs-whoosh-wipe', gain: 0.06}, {at: p.menu + 8, kind: 'marker', gain: 0.08}, {at: p.tools + 8, kind: 'marker', gain: 0.08}, {at: p.panels + 8, kind: 'marker', gain: 0.08}];
});

/* ---------- 5 hidden: a section line sweeps down; under the window, 25 gauges, 3 needles up ---------- */

const hiddenPlan = (cue: Cue) => ({sweep: 4, gauges: Math.min(16, cue('a', 30)), verdict: cue('b', 64)});
const OK = new Set([2, 11, 19]);
const Hidden = make(({f, cue}) => {
  const p = hiddenPlan(cue);
  const camY = CAM_LOW * ease.inOutCubic(clamp((f - p.sweep) / 24));
  const cut = clamp((f - p.sweep) / 20);
  const gx = 120, gy = 1165, gs = 150;
  return <Sheet camY={camY} hud={<Header f={f} fig="FIG. 2" title="看不见的地方" strike={0} next="FIG. 3 · 剖切 A–A" big={f >= p.verdict + 14 ? '达标 3 / 25' : f >= p.gauges - 6 ? '性能指标 25 项' : undefined}
    bigAt={f >= p.verdict + 14 ? p.verdict + 14 : p.gauges - 6} />}>
    <Window dev={0.45} hidden={0.45} />
    {/* section line A–A: long-short dashes, swept down from the window's bottom */}
    <svg width={W} height={2600} style={{position: 'absolute', left: 0, top: 0}}>
      <line x1={40} y1={WY + WH + 40} x2={40 + 1000 * cut} y2={WY + WH + 40} stroke={K.line} strokeWidth={3} strokeDasharray="40 10 8 10" />
      {cut >= 1 && <><text x={20} y={WY + WH + 30} fill={K.line} fontFamily={jet} fontSize={30}>A</text><text x={1040} y={WY + WH + 30} fill={K.line} fontFamily={jet} fontSize={30}>A</text></>}
    </svg>
    <svg width={W} height={2600} style={{position: 'absolute', left: 0, top: 0}}>
      {Array.from({length: 25}, (_, i) => {
        const cx = gx + (i % 5) * 168 + 60, cy = gy + Math.floor(i / 5) * gs + 60;
        const show = eo(f, p.gauges + i * 0.8, p.gauges + i * 0.8 + 6);
        if (show <= 0) return null;
        const ok = OK.has(i);
        // needles start level, then the 22 sag over ~1.5 s and the 3 snap up with an overshoot
        // all start mid-scale; at the verdict the 3 snap up past the mark (overshoot) and the 22 sag over ~1.5 s
        // before the verdict every needle hunts a little (the machine is measuring)
        const hunt = f < p.verdict ? 5 * Math.sin(f * 0.35 + i * 1.7) * clamp((f - p.gauges - i * 0.8) / 10) : 0;
        const ang = hunt + (ok ? -135 + 85 * ease.outBack(clamp((f - p.verdict) / 10), 2.2) : -135 - 40 * ease.inOutCubic(clamp((f - p.verdict) / 45)));
        const a = (ang * Math.PI) / 180, r = 54;
        return <g key={i} opacity={show}>
          {ok && f >= p.verdict && <path d={`M${cx - r} ${cy} A${r} ${r} 0 0 1 ${cx + r} ${cy} Z`} fill="rgba(238,232,209,0.16)" />}
          <path d={`M${cx - r} ${cy} A${r} ${r} 0 0 1 ${cx + r} ${cy}`} fill="none" stroke={ok && f >= p.verdict ? K.line : K.dim} strokeWidth={ok && f >= p.verdict ? 5 : 2} />
          {[-180, -135, -90, -45, 0].map((d) => { const b = (d * Math.PI) / 180; return <line key={d} x1={cx + Math.cos(b) * (r - 10)} y1={cy + Math.sin(b) * (r - 10)} x2={cx + Math.cos(b) * r} y2={cy + Math.sin(b) * r} stroke={K.dim} strokeWidth={1.5} />; })}
          <line x1={cx} y1={cy} x2={cx + Math.cos(a) * (r - 8)} y2={cy + Math.sin(a) * (r - 8)} stroke={ok || f < p.verdict ? K.line : K.dim} strokeWidth={ok ? 5 : 2.5} strokeLinecap="round" />
          <circle cx={cx} cy={cy} r={5} fill={K.line} />
        </g>;
      })}
    </svg>
  </Sheet>;
}, (cue) => {
  const p = hiddenPlan(cue);
  return [{at: p.sweep, kind: 'fs-whoosh-wipe', gain: 0.06}, {at: p.verdict, kind: 'tick', gain: 0.06}, {at: p.verdict + 14, kind: 'marker', gain: 0.1}];
});

/* ---------- 6 psd: a drawn .psd sheet slides to a dashed "Photoshop" doorway and stops at the threshold ---------- */

const DocSheet: React.FC<{x: number; y: number; name: string}> = ({x, y, name}) => <div style={{position: 'absolute', left: x, top: y, width: 230, height: 300}}>
  <svg width={230} height={300} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
    <path d="M2 2 H170 L228 60 V298 H2 Z" fill="rgba(20,35,59,0.85)" stroke={K.line} strokeWidth={3.5} />
    <path d="M170 2 V60 H228" fill="none" stroke={K.line} strokeWidth={2} />
    {[0, 1, 2, 3].map((r) => <line key={r} x1={26} y1={150 + r * 30} x2={200 - (r % 2) * 50} y2={150 + r * 30} stroke={K.dim} strokeWidth={2} />)}
  </svg>
  <div style={{position: 'absolute', left: 22, top: 70, fontFamily: jet, fontSize: 46, color: K.line}}>.PSD</div>
  <div style={{position: 'absolute', left: 0, top: 312, width: 300, fontFamily: jet, fontSize: 24, color: K.dim}}>{name}</div>
</div>;
/** A revision cloud (scalloped outline) around a box, drawn on with progress p. */
const Cloud: React.FC<{x: number; y: number; w: number; h: number; p: number}> = ({x, y, w, h, p}) => {
  const r = 22, pts: string[] = [];
  const nx = Math.round(w / (2 * r)), ny = Math.round(h / (2 * r));
  for (let i = 0; i < nx; i += 1) pts.push(`a${r} ${r} 0 0 1 ${2 * r} 0`);
  for (let i = 0; i < ny; i += 1) pts.push(`a${r} ${r} 0 0 1 0 ${2 * r}`);
  for (let i = 0; i < nx; i += 1) pts.push(`a${r} ${r} 0 0 1 ${-2 * r} 0`);
  for (let i = 0; i < ny; i += 1) pts.push(`a${r} ${r} 0 0 1 0 ${-2 * r}`);
  const len = 2 * (nx + ny) * Math.PI * r;
  return <svg width={W} height={2600} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
    <path d={`M${x} ${y} ${pts.join(' ')}`} fill="none" stroke={K.line} strokeWidth={3} strokeDasharray={`${len * p} ${len}`} />
  </svg>;
};
const psdPlan = () => ({slide: 4, stop: 30, cloud: 40});
const Psd = make(({f}) => {
  const p = psdPlan();
  const y = CAM_LOW + 560;
  const go = ease.inOutCubic(clamp((f - p.slide) / (p.stop - p.slide)));
  const jud = f >= p.stop && f < p.stop + 8 ? Math.sin((f - p.stop) * 2.4) * 6 * (1 - (f - p.stop) / 8) : 0;
  return <Sheet camY={CAM_LOW} zoom={1 + 0.06 * sine(f / 108)} focus={[640, y + 150]} hud={<Header f={f} fig="FIG. 3" title="存出来的 PSD" big="PSD → ？" bigAt={p.slide} small="Photoshop 还不能稳定接受" />}>
    <Window dev={0.45} hidden={0.45} />
    {/* the doorway: Photoshop, drawn as a dashed outline only (no logo) */}
    <div style={{position: 'absolute', left: 640, top: y - 50, width: 270, height: 420, border: `3px dashed ${K.line}`}} />
    <div style={{position: 'absolute', left: 640, top: y + 384, width: 270, textAlign: 'center', fontFamily: jet, fontSize: 30, color: K.line}}>Photoshop 2026</div>
    <DocSheet x={110 + 300 * go + jud} y={y} name="great-wave.psd" />
    {f >= p.cloud && <Cloud x={380} y={y - 90} w={528} h={528} p={eo(f, p.cloud, p.cloud + 16)} />}
    {f >= p.cloud + 14 && <Letter text="不稳定" f={f} from={p.cloud + 14} d={8} size={56} x={470} y={y + 470} />}
    {/* what does work: it reopens its own files */}
    <Letter text="自己存、自己开：309 个里 307 个不变" f={f} from={p.slide + 6} d={14} size={32} x={80} y={y + 560} color={K.dim} />
  </Sheet>;
}, () => {
  const p = psdPlan();
  return [{at: p.slide, kind: 'fs-paper-slide', gain: 0.1}, {at: p.stop, kind: 'clack', gain: 0.08}, {at: p.cloud, kind: 'marker', gain: 0.08}];
});

/* ---------- 7 issues: the notes column fills with 953 numbered dots ---------- */

const Issues = make(({f}) => {
  const COLS = 37, ROWS = 26, dx = 24.6, dy = 28.6, x0 = 86, y0 = CAM_LOW + 520;
  const shown = Math.round(953 * ease.inOutCubic(clamp((f - 2) / 34)));
  return <Sheet camY={CAM_LOW} zoom={1 + 0.06 * sine(f / 76)} focus={[540, y0 + 360]} hud={<Header f={f} fig="FIG. 3" title="总说明 · 未关的问题" big={String(shown)} bigAt={-30} small="个 · 2026-10-13 路线图" />}>
    <Window dev={0.45} hidden={0.45} />
    <svg width={W} height={2600} style={{position: 'absolute', left: 0, top: 0}}>
      {Array.from({length: Math.min(shown, COLS * ROWS)}, (_, i) => <circle key={i} cx={x0 + (i % COLS) * dx} cy={y0 + Math.floor(i / COLS) * dy} r={8} fill="none" stroke={K.line} strokeWidth={1.6} opacity={0.85} />)}
    </svg>
  </Sheet>;
}, () => [{at: 2, kind: 'fs-watch-tick', gain: 0.06}, {at: 36, kind: 'marker', gain: 0.08}]);

/* ---------- 8 hours: back up to the general drawing; a phantom line at beta (~75 %) and the hours to get there ---------- */

const hoursPlan = (cue: Cue) => ({up: 0, beta: 26, hrs: cue('a', 70)});
const Hours = make(({f, cue}) => {
  const p = hoursPlan(cue);
  const camY = CAM_LOW * (1 - ease.inOutCubic(clamp(f / 22)));
  const bx = WX + 0.75 * WW;
  // after the hours are named: the camera leans into the gap, and a light sweeps the 45 → 75 % that is still drawing
  const sweep = f >= p.hrs + 10 ? ((f - p.hrs - 10) % 36) / 36 : -1;
  return <Sheet camY={camY} zoom={1 + 0.07 * sine(clamp((f - p.beta) / (p.hrs + 60 - p.beta)))} focus={[WX + 0.6 * WW, WY + WH * 0.4]} hud={<Header f={f} fig="FIG. 1 · 总装图" title="PhotoCraft · 路线图自评" big={f >= p.hrs ? '1,100–1,800 h' : '≈45%'} bigAt={f >= p.hrs ? p.hrs : -30}
    small={f >= p.hrs ? 'Opus 5.5 工时 · 估算' : '路线图自评 · 估算 40–50%'} />}>
    <Window dev={0.45} hidden={0.45} />
    {/* phantom line (long-short-short) where beta would be: ~75 % ready */}
    {f >= p.beta && <svg width={W} height={2600} style={{position: 'absolute', left: 0, top: 0}}>
      <line x1={bx} y1={WY - 50} x2={bx} y2={WY + (WH + 50) * eo(f, p.beta, p.beta + 14)} stroke={K.line} strokeWidth={3} strokeDasharray="34 8 6 8 6 8" />
    </svg>}
    {sweep >= 0 && <div style={{position: 'absolute', left: WX + (0.45 + 0.3 * sweep) * WW - 30, top: WY, width: 60, height: WH, opacity: Math.sin(Math.PI * sweep),
      background: 'linear-gradient(90deg, transparent, rgba(238,232,209,0.35), transparent)'}} />}
    {f >= p.beta + 8 && <div style={{position: 'absolute', left: bx + 12, top: WY + WH - 70, padding: '4px 12px', background: K.blue, border: `2px solid ${K.line}`}}>
      <Letter text="测试版 ≈75%" f={f} from={p.beta + 8} d={10} size={34} x={0} y={0} /><div style={{width: 200, height: 38}} /></div>}
    <Dim x0={WX + 0.45 * WW} x1={bx} y={WY - 26} p={eo(f, p.hrs, p.hrs + 16)} label="还差" size={34} up={false} />
    <TitleBlock f={f} v={{author: 'Claude Opus 5.5（据报道）', state: '能干活 ≈45%（自评）', hours: '1,100–1,800 h（AI 工时·估算）'}} at={{author: -99, state: -99, hours: p.hrs + 6}} />
  </Sheet>;
}, (cue) => {
  const p = hoursPlan(cue);
  return [{at: 0, kind: 'fs-whoosh-wipe', gain: 0.05}, {at: p.beta, kind: 'marker', gain: 0.07}, {at: p.hrs, kind: 'marker', gain: 0.1}];
});

/* ---------- 9 end: the general drawing as in frame 0's place, the amber stamp (the one non-blue colour) ---------- */

const endPlan = (cue: Cue) => ({a: cue('a', 50) + 24});
const End = make(({f, cue}) => {
  const p = endPlan(cue);
  const st = f >= p.a ? clamp((f - p.a) / 6) : 0;
  // the camera settles back from the hours' lean to frame 0's framing; the stamp lands on the still drawing
  return <Sheet zoom={1 + 0.07 * (1 - sine(clamp(f / p.a)))} focus={[WX + 0.6 * WW, WY + WH * 0.4]} hud={<Header f={f} fig="FIG. 1 · 总装图" title="PhotoCraft · 路线图自评" big="≈45%" bigAt={-30} small="路线图自评 · 估算 40–50%" />}>
    <Window dev={0.45} hidden={0.45} />
    <Dim x0={WX} x1={WX + 0.45 * WW} y={WY - 26} p={1} label="45%" size={36} up={false} />
    <Credit />
    <TitleBlock f={f} v={{author: 'Claude Opus 5.5（据报道）', state: '能干活 ≈45%（自评）', hours: '1,100–1,800 h（AI 工时·估算）'}} />
    {f >= p.a && <div style={{position: 'absolute', left: 430, top: 1128, transform: `rotate(-8deg) scale(${1.7 - 0.7 * ease.outBack(st, 2)})`, opacity: clamp(st * 3),
      border: `7px solid ${K.amber}`, padding: '4px 26px 10px', background: 'rgba(20,35,59,0.55)', fontFamily: hand, fontSize: 84, color: K.amber}}>试用 · 别搬家</div>}
  </Sheet>;
}, (cue) => [{at: endPlan(cue).a + 4, kind: 'stamp', gain: 0.16}, {at: endPlan(cue).a + 4, kind: 'thud', gain: 0.1}]);

/** Cover anchor (880 × 800, f = 0): the window developed to 45 %, the dimension line and the title block. */
const Cover: Scene = () => <div style={{position: 'absolute', left: 0, top: 0, width: 880, height: 800, overflow: 'hidden', background: K.deep}}>
  <div style={{position: 'absolute', left: -100, top: -330, width: W, height: 1920, transform: 'scale(0.9)', transformOrigin: '540px 330px'}}>
    <Sheet><Window dev={0.45} hidden={0.45} /><Dim x0={WX} x1={WX + 0.45 * WW} y={WY + WH + 60} p={1} label="≈45%" size={64} up={false} /></Sheet>
  </div>
</div>;

export const photocraftScenes: Record<string, Scene> = {
  'pc.hook': Hook, 'pc.stars': Stars, 'pc.turn': Turn, 'pc.parts': Parts, 'pc.hidden': Hidden, 'pc.psd': Psd, 'pc.issues': Issues, 'pc.hours': Hours, 'pc.end': End, 'pc.cover': Cover,
};
