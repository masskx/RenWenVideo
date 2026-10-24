import React from 'react';
import {Img, OffthreadVideo, Sequence, staticFile} from 'remotion';
import {clamp, ease} from '../../fx';
import {font, mono} from '../theme';
import {Cue, Scene} from '../paper';
import {ContactShadow, Grain, HandLine, HandRing, Roll, Stamp, Sticker, hand, pop, ramp} from '../props';

// kimi-k3-1-pro: Kimi K3.1 Pro (Moonshot, 2026-10-24) — what it can do, told with Moonshot's own demo videos (asset case B).
// Facts: inputs/kimi-k3-1-pro/idea.md (all vendor demos / vendor benchmarks, labelled on screen); storyboard
// tutorials/kimi-k3-1-pro.storyboard.md. One idea: these aren't generated videos — the model wrote scripts that drove
// Blender / FreeCAD / Unreal and built the things, so they can be taken apart, spun, printed, debugged.
// - Grammar from lemo living-screencast: windows floating over a floor with soft shadows, push-ins, an "N×" time-lapse tag;
//   the footage is the real recording (muted, 「@Kimi｜案例展示」), never redrawn. Depth from the v3 kit: a lit ground,
//   a floor grid like a 3D viewport, contact shadows, a 2D camera (`View`).
// - Colours found in the footage (scripts/qa/palette.mjs on inputs/kimi-k3-1-pro/frames/): Blender viewport charcoal,
//   FreeCAD white and metal grey, the lamp's amber (also Blender's selection orange) as the one accent = "built / lit",
//   the palace's dark ochre and gold only at the start and the end.
// - One object carried through: an amber scan line — it turns the dragon back into a grey model, turns the cathedral from
//   grey model to lit, lights the lamp, swaps the falling body for the walking one, and recolours the palace at the end.
// Everything is drawn in the backdrop (1080 × 1920); captions sit at y ≈ 1390, so content stays in y 150–1300.

const P = {
  palace: '#100402', ochre: '#2F1409', gold: '#E5C997',
  view: '#2C2C2C', view2: '#3D3D3D', bar: '#232323',
  cad: '#F7F7F7', cad2: '#EFEFEF', metal: '#ABAFB1', ink: '#1E1E1E', mute: '#6E7174',
  amber: '#F3A019', amberDeep: '#D36E15', black: '#080807', red: '#E5484D', white: '#FFFFFF',
};
const W = 1080;
const clip = (n: string) => staticFile(`video/kimi-k3-1-pro/${n}.mp4`);

/* ---------- shared pieces ---------- */

/**
 * Footage segments: `clip` from `src` s, starting at scene frame `from` (until the next segment or `to`). Speed-ups are baked
 * into their own clips (walk-runs, cathedral-build …): OffthreadVideo's trimBefore combined with playbackRate landed on the
 * wrong source frames (the demo's black title card), so every segment plays at 1×.
 */
type Seg = {clip: string; src?: number; from: number; to?: number};
const Footage: React.FC<{f: number; segs: Seg[]; pos?: string; zoom?: number}> = ({f, segs, pos = '50% 50%', zoom = 1}) => <>
  {segs.map((s, i) => {
    const end = s.to ?? segs[i + 1]?.from ?? 1e5;
    if (f < s.from - 1 || f >= end) return null;
    return <Sequence key={i} from={s.from} layout="none">
      <OffthreadVideo src={clip(s.clip)} muted trimBefore={Math.round((s.src ?? 0) * 30)}
        style={{position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: pos, transform: zoom !== 1 ? `scale(${zoom})` : undefined, transformOrigin: pos}} />
    </Sequence>;
  })}
</>;

/** Whatever is above `y` (px inside the box) goes grey like an untextured model; a faint grid makes it read as "white model". */
const Greyed: React.FC<{y: number; below?: boolean}> = ({y, below = false}) => y <= 0 ? null : <div style={{position: 'absolute', left: 0, right: 0,
  ...(below ? {top: y, bottom: 0} : {top: 0, height: y}), backdropFilter: 'grayscale(1) contrast(1.25) brightness(1.18)',
  backgroundImage: 'linear-gradient(rgba(255,255,255,0.10) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.10) 1px, transparent 1px)',
  backgroundSize: '48px 48px'}} />;

/** The amber scan line at `y` across a box `w` wide (the film's one recurring mark). */
const ScanLine: React.FC<{y: number; w: number; o?: number}> = ({y, w, o = 1}) => o <= 0 ? null : <div style={{position: 'absolute', left: -20, top: y - 3, width: w + 40, height: 6,
  background: P.amber, opacity: o, boxShadow: `0 0 18px 6px rgba(243,160,25,0.75), 0 0 60px 20px rgba(243,160,25,0.35)`, borderRadius: 3}} />;

/** 「@Kimi｜案例展示」 in the footage's bottom-right corner (external footage rule). */
const CaseTag: React.FC = () => <div style={{position: 'absolute', right: 0, bottom: 0, background: 'rgba(8,8,7,0.78)', color: P.white, fontFamily: font,
  fontWeight: 700, fontSize: 28, padding: '4px 14px', whiteSpace: 'nowrap'}}>@Kimi｜案例展示</div>;

/** A software window floating over the floor: title bar, footage box, soft drop shadow (living-screencast). */
const Win: React.FC<{x: number; y: number; w: number; h: number; title: string; light?: boolean; tag?: boolean; badge?: React.ReactNode; children: React.ReactNode; style?: React.CSSProperties}> = ({
  x, y, w, h, title, light = false, tag = true, badge, children, style,
}) => <div style={{position: 'absolute', left: x, top: y, width: w, borderRadius: 18, overflow: 'hidden',
  boxShadow: light ? '0 30px 60px rgba(30,30,30,0.22), 0 0 0 2px rgba(30,30,30,0.08)' : '0 34px 70px rgba(0,0,0,0.55), 0 0 0 2px rgba(255,255,255,0.06)', ...style}}>
  <div style={{height: 56, background: light ? '#E2E2E2' : P.bar, display: 'flex', alignItems: 'center', padding: '0 22px', gap: 12}}>
    {['#FF5F57', '#FEBC2E', '#28C840'].map((c) => <div key={c} style={{width: 18, height: 18, borderRadius: 9, background: c}} />)}
    <div style={{marginLeft: 14, fontFamily: mono, fontWeight: 700, fontSize: 28, color: light ? P.ink : '#D8D8D8', whiteSpace: 'nowrap'}}>{title}</div>
    <div style={{flex: 1}} />{badge}
  </div>
  <div style={{position: 'relative', width: w, height: h, overflow: 'hidden', background: '#000'}}>{children}{tag && <CaseTag />}</div>
</div>;

/** A time-lapse tag for the title bar ("3×"). */
const Speed: React.FC<{x: string; on: boolean}> = ({x, on}) => on ? <div style={{fontFamily: mono, fontWeight: 800, fontSize: 30, color: P.black, background: P.amber,
  borderRadius: 10, padding: '0 14px'}}>▶▶ {x}</div> : null;

/** A 2D camera over the whole frame: z zoom about (x, y) = the frame point to centre; depth < 1 moves less (far). */
type Cam = {x: number; y: number; z: number};
const camOf = (f: number, keys: [number, Partial<Cam>, number?][], base: Cam = {x: 540, y: 760, z: 1}): Cam => {
  let c = {...base};
  for (const [at, to, d = 20] of keys) {
    const p = ease.inOutCubic(clamp((f - at) / Math.max(1, d)));
    if (p > 0) c = {x: c.x + ((to.x ?? c.x) - c.x) * p, y: c.y + ((to.y ?? c.y) - c.y) * p, z: c.z + ((to.z ?? c.z) - c.z) * p};
  }
  return c;
};
const View: React.FC<{cam: Cam; depth?: number; children: React.ReactNode}> = ({cam, depth = 1, children}) => {
  const z = 1 + (cam.z - 1) * depth, dx = (540 - cam.x) * depth, dy = (760 - cam.y) * depth;
  return <div style={{position: 'absolute', left: 0, top: 0, width: W, height: 1920, transformOrigin: '540px 760px',
    transform: `translate(${dx.toFixed(2)}px, ${dy.toFixed(2)}px) scale(${z.toFixed(4)})`}}>{children}</div>;
};

/** A lit ground with a perspective floor grid (a 3D viewport's floor, in 2D) from `horizon` down. */
const Floor: React.FC<{base: string; line: string; horizon?: number; glow?: string; t?: number; grain?: number}> = ({base, line, horizon = 1020, glow = 'rgba(255,255,255,0.10)', t = 0, grain = 0.4}) => {
  const rows = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => horizon + 900 * (i / 9) ** 2.2);
  const cols = Array.from({length: 23}, (_, i) => i - 11);
  return <div style={{position: 'absolute', inset: 0, background: base, overflow: 'hidden'}}>
    <div style={{position: 'absolute', inset: 0, background: `radial-gradient(ellipse 80% 50% at ${50 + 3 * Math.sin(t / 4)}% 34%, ${glow}, transparent 70%)`}} />
    <svg width={W} height={1920} style={{position: 'absolute', inset: 0}}>
      <defs><linearGradient id="kfade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={line} stopOpacity="0" /><stop offset="0.25" stopColor={line} stopOpacity="1" /></linearGradient></defs>
      <g stroke="url(#kfade)" strokeWidth={2}>
        {rows.map((y, i) => <line key={`r${i}`} x1={0} y1={y} x2={W} y2={y} />)}
        {cols.map((c) => <line key={`c${c}`} x1={540 + c * 60} y1={horizon} x2={540 + c * 520} y2={1920} />)}
      </g>
    </svg>
    <div style={{position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 120% 90% at 50% 42%, transparent 55%, rgba(0,0,0,0.28) 100%)'}} />
    {grain > 0 && <Grain w={W} h={1920} o={grain} seed={Math.floor(t * 12) % 4} />}
  </div>;
};

/** The thin line at the top of every scene: what this is and whose footage it is. */
const Top: React.FC<{dark?: boolean}> = ({dark = true}) => <div style={{position: 'absolute', left: 64, right: 64, top: 96, display: 'flex', justifyContent: 'space-between',
  fontFamily: font, fontWeight: 700, fontSize: 30, color: dark ? 'rgba(255,255,255,0.7)' : 'rgba(30,30,30,0.6)', letterSpacing: 1}}>
  <span>Kimi K3.1 Pro</span><span style={{fontWeight: 500, fontSize: 28}}>演示均为 Kimi 官方发布</span>
</div>;

const Abs: React.FC<{x?: number; y: number; w?: number; style?: React.CSSProperties; children: React.ReactNode}> = ({x = 0, y, w = W, style, children}) => (
  <div style={{position: 'absolute', left: x, top: y, width: w, ...style}}>{children}</div>
);
const Big: React.FC<{size?: number; c?: string; w?: number; style?: React.CSSProperties; children: React.ReactNode}> = ({size = 80, c = P.white, w = 900, style, children}) => (
  <div style={{fontFamily: font, fontWeight: w, fontSize: size, lineHeight: 1.12, color: c, whiteSpace: 'nowrap', ...style}}>{children}</div>
);
const In: React.FC<{f: number; at: number; d?: number; dy?: number; style?: React.CSSProperties; children: React.ReactNode}> = ({f, at, d = 10, dy = 40, style, children}) => {
  const p = pop(f, at, d);
  if (p < -0.5) return null;
  return <div style={{opacity: clamp(p * 2), transform: `translateY(${(1 - Math.max(0, p)) * dy}px)`, ...style}}>{children}</div>;
};
/** A hanging tag with a number and a label (a seen number, not a narrated one). */
const Chip: React.FC<{f: number; at: number; dark?: boolean; children: React.ReactNode}> = ({f, at, dark = true, children}) => {
  const p = pop(f, at, 10);
  if (p < -0.5) return null;
  return <div style={{display: 'inline-flex', alignItems: 'baseline', gap: 14, padding: '10px 26px', borderRadius: 16, transform: `scale(${Math.max(0, p)})`,
    background: dark ? 'rgba(255,255,255,0.10)' : P.white, border: `3px solid ${dark ? 'rgba(255,255,255,0.22)' : 'rgba(30,30,30,0.14)'}`,
    boxShadow: dark ? '0 14px 30px rgba(0,0,0,0.35)' : '0 14px 30px rgba(30,30,30,0.12)', fontFamily: font, fontWeight: 800, fontSize: 44,
    color: dark ? P.white : P.ink, whiteSpace: 'nowrap'}}>{children}</div>;
};

/* ---------- 1 hook: this dragon wasn't generated — the model wrote code and built it in Unreal ---------- */

const hookPlan = (cue: Cue) => ({a: cue('a', 66), b: cue('b', 104)});
const HOOK_BOX = {w: 2304, h: 1296, x0: -560, y0: 60}; // the dragon frame, 16:9, cropped by the camera to the head at first
const Hook: Scene = () => null;
Hook.backdrop = ({f, cue}) => {
  const p = hookPlan(cue);
  // close on the roaring head, slow push; on {a} pull back to the whole frame so it reads as a built 3D scene
  const out = ease.inOutCubic(clamp((f - p.a + 4) / 22));
  const s = (1 + 0.04 * clamp(f / 70)) * (1 - out) + 0.43 * out;
  const bw = HOOK_BOX.w * s, bh = HOOK_BOX.h * s;
  const left = HOOK_BOX.x0 * (1 - out) + (540 - bw / 2) * out - 20 * clamp(f / 70) * (1 - out);
  const top = HOOK_BOX.y0 * (1 - out) + 330 * out;
  // the scan line goes down over the dragon (grey model above it), then back up on {b} to recolour
  const down = ease.inOutCubic(clamp((f - 8) / (p.a - 12)));
  const up = ease.inOutCubic(clamp((f - p.b + 2) / 14));
  const scanY = (down - up) * bh;
  const scanO = (f > 6 && f < p.a - 2) || (f > p.b - 2 && f < p.b + 14) ? 1 : 0;
  return <>
    <div style={{position: 'absolute', inset: 0, background: `radial-gradient(ellipse 90% 60% at 50% 30%, ${P.ochre}, ${P.palace} 70%)`}} />
    <div style={{position: 'absolute', left, top, width: bw, height: bh, overflow: 'hidden', borderRadius: 26 * out,
      boxShadow: out > 0.05 ? `0 40px 90px rgba(0,0,0,${0.6 * out})` : undefined}}>
      <Footage f={f} segs={[{clip: 'dragon', src: 2.6, from: 0}]} />
      <Greyed y={scanY} />
      <ScanLine y={scanY} w={bw} o={scanO} />
      {out > 0.6 && <CaseTag />}
    </div>
    {/* the window chrome arrives with the pull-back: it's a scene in an engine */}
    <div style={{position: 'absolute', left: 540 - bw / 2, top: top - 64, width: bw, opacity: clamp((out - 0.6) * 3), display: 'flex', alignItems: 'center', gap: 12,
      fontFamily: mono, fontWeight: 700, fontSize: 30, color: P.gold}}>
      {['#FF5F57', '#FEBC2E', '#28C840'].map((c) => <div key={c} style={{width: 18, height: 18, borderRadius: 9, background: c}} />)}
      <span style={{marginLeft: 10}}>Unreal Engine 5.8</span>
    </div>
    {/* frame 0 / cover headline, gone by the pull-back */}
    <Abs y={1040} style={{textAlign: 'center', opacity: 1 - clamp((f - p.a + 10) / 8)}}>
      <Big size={96} style={{textShadow: '0 8px 30px rgba(0,0,0,0.8)'}}>一行行代码</Big>
      <Big size={96} c={P.amber} style={{textShadow: '0 8px 30px rgba(0,0,0,0.8)', marginTop: 6}}>搭出一条龙</Big>
    </Abs>
    {/* the numbers that prove it's a scene, not a clip */}
    <Abs y={330 + bh + 60} style={{display: 'flex', justifyContent: 'center', gap: 28}}>
      <Chip f={f} at={p.b + 4}><Roll f={f} start={p.b + 4} land={p.b + 22} to={3600} sep size={56} color={P.amber} family={font} /><span>万 三角面</span></Chip>
    </Abs>
    <Top />
    <Sticker x={250} y={200} p={pop(f, -10, 8)} rot={-3} size={34} bg={P.gold} color={P.palace}>据 Kimi 官方演示</Sticker>
  </>;
};
Hook.sfx = (cue) => {
  const p = hookPlan(cue);
  return [{at: 8, kind: 'fs-whoosh-wipe', gain: 0.1}, {at: p.a - 4, kind: 'whoosh', gain: 0.1}, {at: p.b - 2, kind: 'fs-whoosh-wipe', gain: 0.08}, {at: p.b + 22, kind: 'tick', gain: 0.1}];
};

/* ---------- 2 name: a wall of the things it built, and the name rising from the floor ---------- */

const THUMBS = ['airport-rainforest', 'sword-flight', 'godot-adventure', 'cologne-interior', 'celestial-palace', 'turbofan', 'robot-film', 'modular-lamp-trimesh', 'kw-nvda-model-v2'];
const namePlan = (cue: Cue) => ({a: cue('a', 64)});
const Name: Scene = () => null;
Name.backdrop = ({f, cue}) => {
  const p = namePlan(cue);
  const cam = camOf(f, [[0, {z: 1.06, y: 720}, 110]]);
  return <>
    <Floor base={P.view} line="#4A4A4A" horizon={1000} t={f / 30} />
    <View cam={cam} depth={0.9}>
      {THUMBS.map((n, i) => {
        const col = i % 3, row = Math.floor(i / 3);
        const at = -6 + i * 3;
        const k = ease.outCubic(clamp((f - at) / 14));
        const x = 70 + col * 320, y = 210 + row * 205;
        return <div key={n} style={{position: 'absolute', left: x, top: y, width: 300, height: 169, borderRadius: 12, overflow: 'hidden', opacity: clamp(k * 1.6),
          transform: `translateY(${(1 - k) * -260}px) scale(${0.7 + 0.3 * k})`, boxShadow: '0 22px 40px rgba(0,0,0,0.55)', outline: '2px solid rgba(255,255,255,0.08)'}}>
          <Footage f={f} segs={[{clip: `t-${n}`, src: 0, from: 0}]} />
        </div>;
      })}
      <ContactShadow x={540} y={1000} w={900} o={0.35} />
    </View>
    <Abs y={860} style={{textAlign: 'center'}}>
      <In f={f} at={p.a - 6} dy={80}><Big size={124} style={{letterSpacing: -2, textShadow: '0 16px 40px rgba(0,0,0,0.6)'}}>Kimi K<span style={{color: P.amber}}>3.1</span> Pro</Big></In>
      <In f={f} at={p.a + 10} style={{marginTop: 26, display: 'flex', justifyContent: 'center', gap: 22}}>
        <Chip f={f} at={p.a + 10}>3 万亿级参数</Chip><Chip f={f} at={p.a + 16}>100 万上下文</Chip>
      </In>
    </Abs>
    <Abs x={600} y={1190} w={420} style={{textAlign: 'right'}}><In f={f} at={p.a + 20}><Big size={30} w={500} c="rgba(255,255,255,0.6)">月之暗面 · 2026.10.24</Big></In></Abs>
    <Top />
  </>;
};
Name.sfx = (cue) => [...THUMBS.map((_, i) => ({at: Math.max(0, -6 + i * 3 + 10), kind: 'tap', gain: 0.05})), {at: namePlan(cue).a - 6, kind: 'thud', gain: 0.12}];

/* ---------- 3 Blender (signature): the cathedral grows from a floor plate to a grey model, the scan line lights it ---------- */

const blenderPlan = (cue: Cue) => ({a: cue('a', 42), b: cue('b', 94), c: cue('c', 118)});
const CODE = ['import bpy', 'for bay in nave: add_pier(bay)', 'bpy.ops.render.render()'];
const Blender: Scene = () => null;
Blender.backdrop = ({f, cue}) => {
  const p = blenderPlan(cue);
  const lit = p.c;
  // push into the window while it builds; a small punch when it lights
  const cam = camOf(f, [[-1, {x: 540, y: 760, z: 1}, 1], [0, {z: 1.04}, lit], [lit, {z: 1.07}, 8]]);
  const scanY = ease.inOutCubic(clamp((f - lit + 8) / 10)) * 563;
  return <>
    <Floor base={P.view} line="#474747" horizon={1060} t={f / 30} />
    <View cam={cam}>
      <ContactShadow x={540} y={860} w={980} o={0.4} />
      <Win x={40} y={210} w={1000} h={563} title="Blender · Python 脚本" badge={<Speed x="3×" on={f < lit} />}>
        {f < lit ? <Footage f={f} segs={[{clip: 'cathedral-build', from: 0, to: lit}]} zoom={1.3} pos="40% 52%" />
          : <Footage f={f} segs={[{clip: 'cathedral-lit', src: 0.4, from: lit}]} />}
        {f >= lit - 8 && f < lit && <Greyed y={563 - scanY} below />}
        <ScanLine y={scanY} w={1000} o={f >= lit - 8 && f < lit + 4 ? 1 : 0} />
      </Win>
    </View>
    {/* the script it wrote (illustrative), typed on {a} */}
    <Abs x={70} y={890} w={940}>
      <In f={f} at={p.a - 4} dy={30}>
        <div style={{background: 'rgba(0,0,0,0.42)', borderRadius: 16, padding: '18px 26px', border: '2px solid rgba(255,255,255,0.08)'}}>
          {CODE.map((line, i) => {
            const start = p.a + i * 12, n = Math.floor(clamp((f - start) / 10) * line.length);
            return <div key={i} style={{fontFamily: mono, fontWeight: 600, fontSize: 36, lineHeight: 1.45, color: i === 1 ? P.amber : '#D8D8D8', whiteSpace: 'pre'}}>
              {line.slice(0, n)}{n > 0 && n < line.length ? '▌' : ''}
            </div>;
          })}
          <div style={{position: 'absolute', right: 20, top: 12, fontFamily: font, fontWeight: 700, fontSize: 26, color: 'rgba(255,255,255,0.45)'}}>示意</div>
        </div>
      </In>
    </Abs>
    {/* the size of what it built, on {b}; the hero number lands when it lights */}
    <Abs y={1110} style={{display: 'flex', justifyContent: 'center', gap: 24}}>
      <Chip f={f} at={p.b}><Roll f={f} start={p.b} land={lit + 6} to={330} size={60} color={P.amber} family={font} /><span>万 三角面</span></Chip>
      <Chip f={f} at={p.b + 8}><Roll f={f} start={p.b + 8} land={lit + 10} to={8368} size={60} color={P.amber} family={font} /><span>个构件</span></Chip>
    </Abs>
    <Top />
  </>;
};
Blender.sfx = (cue) => {
  const p = blenderPlan(cue);
  return [{at: 0, kind: 'whoosh-short', gain: 0.08}, ...CODE.map((_, i) => ({at: p.a + i * 12, kind: 'tap', gain: 0.06})), {at: p.c - 8, kind: 'fs-whoosh-wipe', gain: 0.1},
    {at: p.c + 2, kind: 'chime', gain: 0.08}];
};

/* ---------- 4 turbofan: 2100 parts — assembles, opens, spins ---------- */

const enginePlan = (cue: Cue) => ({a: cue('a', 68), b: cue('b', 92)});
const Engine: Scene = () => null;
Engine.backdrop = ({f, cue}) => {
  const p = enginePlan(cue);
  const cam = camOf(f, [[-1, {x: 540, y: 760, z: 1.0}, 1], [0, {z: 1.04}, 110]]);
  return <>
    <Floor base={P.cad} line="#DADADA" horizon={1060} glow="rgba(255,255,255,0.8)" t={f / 30} grain={0.6} />
    <View cam={cam}>
      <ContactShadow x={540} y={840} w={960} o={0.18} />
      <Win x={40} y={220} w={1000} h={563} title="FreeCAD · Python" light badge={<Speed x="2×" on />}>
        <Footage f={f} segs={[{clip: 'turbofan-2x', from: 0}]} zoom={1.45} pos="42% 52%" />
      </Win>
      {/* 能拆: a hand ring around the opened casing */}
      <svg width={W} height={1920} style={{position: 'absolute', inset: 0, overflow: 'visible'}}><HandRing cx={500} cy={540} rx={380} ry={170} p={ramp(f, p.a, p.a + 12)} color={P.amberDeep} sw={7} /></svg>
    </View>
    <Abs y={900} style={{textAlign: 'center'}}>
      <In f={f} at={-8}><Big size={150} c={P.ink} style={{letterSpacing: -4}}>2100<span style={{fontSize: 64, marginLeft: 16, color: P.mute}}>个零件</span></Big></In>
    </Abs>
    {/* 还能转: three spools, three speeds */}
    <Abs y={1110} style={{display: 'flex', justifyContent: 'center', gap: 16}}>
      {[['风扇', 2780], ['低压轴', 8590], ['高压轴', 12400]].map(([k, v], i) => (
        <Chip key={k} f={f} at={p.b + i * 5} dark={false}><span style={{fontSize: 34, color: P.mute}}>{k}</span><span style={{color: P.amberDeep, fontFamily: font}}>{(v as number).toLocaleString('en-US')}</span></Chip>
      ))}
    </Abs>
    <Abs y={1222} style={{textAlign: 'center'}}><In f={f} at={p.b + 14}><Big size={30} w={600} c={P.mute}>转 / 分</Big></In></Abs>
    <Top dark={false} />
  </>;
};
Engine.sfx = (cue) => {
  const p = enginePlan(cue);
  return [{at: 0, kind: 'whoosh-short', gain: 0.08}, {at: p.a, kind: 'paper', gain: 0.07}, ...[0, 1, 2].map((i) => ({at: p.b + i * 5, kind: 'tick', gain: 0.08}))];
};

/* ---------- 5 lamp: printed, then it lights — the ground goes dark and amber ---------- */

const lampPlan = (cue: Cue) => ({a: cue('a', 48), b: cue('b', 68)});
const Lamp: Scene = () => null;
Lamp.backdrop = ({f, cue}) => {
  const p = lampPlan(cue);
  const on = ramp(f, p.b - 2, p.b + 8);
  const cam = camOf(f, [[-1, {x: 540, y: 700, z: 1}, 1], [0, {z: 1.05}, p.b], [p.b, {z: 1.12}, 20]]);
  return <>
    <Floor base={P.cad} line="#DADADA" horizon={1100} glow="rgba(255,255,255,0.8)" t={f / 30} grain={0.6} />
    <div style={{position: 'absolute', inset: 0, background: P.black, opacity: on}} />
    <div style={{position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 70% 40% at 50% 40%, rgba(243,160,25,0.45), transparent 70%)', opacity: on}} />
    <View cam={cam}>
      {/* a photo, not a window: this one is in the real world */}
      <div style={{position: 'absolute', left: 90, top: 250, width: 900, padding: 22, paddingBottom: 70, background: P.white, borderRadius: 8, transform: 'rotate(-1.5deg)',
        boxShadow: `0 30px 60px rgba(0,0,0,0.35)${on > 0 ? `, 0 0 ${120 * on}px ${30 * on}px rgba(243,160,25,0.45)` : ''}`}}>
        <div style={{position: 'relative', width: 856, height: 640, overflow: 'hidden', background: '#000'}}>
          <Footage f={f} segs={[{clip: 'lamp-print', from: 0}, {clip: 'lamp', src: 6.0, from: p.a}, {clip: 'lamp', src: 8.2, from: p.b}]} />
          <CaseTag />
        </div>
        <div style={{position: 'absolute', left: 30, bottom: 14, fontFamily: hand, fontSize: 40, color: P.ink}}>福建土楼 → 台灯</div>
      </div>
    </View>
    <Abs y={1090} style={{display: 'flex', justifyContent: 'center', gap: 20}}>
      <Chip f={f} at={4} dark={on > 0.5}>3D 打印</Chip><Chip f={f} at={10} dark={on > 0.5}>5 个部件</Chip>
    </Abs>
    <Top dark={on > 0.5} />
  </>;
};
Lamp.sfx = (cue) => {
  const p = lampPlan(cue);
  return [{at: 0, kind: 'whoosh-short', gain: 0.07}, {at: p.a, kind: 'tap', gain: 0.07}, {at: p.b, kind: 'chime', gain: 0.1}];
};

/* ---------- 6 walking: it falls; 167 runs; it fixed 36 errors in the simulator; it walks ---------- */

const walkPlan = (cue: Cue) => ({a: cue('a', 64), b: cue('b', 104)});
const Walk: Scene = () => null;
Walk.backdrop = ({f, cue}) => {
  const p = walkPlan(cue);
  const cam = camOf(f, [[-1, {x: 540, y: 760, z: 1}, 1], [0, {z: 1.03}, p.b], [p.b, {z: 1.06}, 40]]);
  const fix = p.b + 4;
  const scanY = ease.inOutCubic(clamp((f - fix + 8) / 10)) * 720;
  const run = Math.round(1 + 166 * ease.outCubic(clamp((f - p.a) / (p.b - p.a))));
  return <>
    <div style={{position: 'absolute', inset: 0, background: `radial-gradient(ellipse 80% 50% at 50% 34%, #1C1D1F, ${P.black} 72%)`}} />
    <Grain w={W} h={1920} o={0.3} />
    <View cam={cam}>
      <Win x={190} y={190} w={700} h={720} title="物理仿真 · 402 块肌肉">
        {/* the demo's early gaits fall over (walk-fall), versions 3–4 at 3.2× (walk-runs), the repaired one walks (walk-fixed) */}
        <Footage f={f} segs={[{clip: 'walk-fall', from: 0}, {clip: 'walk-runs', from: p.a}, {clip: 'walk-fixed', from: fix}]} pos="50% 30%" />
        {f >= fix - 8 && f < fix && <Greyed y={720 - scanY} below />}
        <ScanLine y={scanY} w={700} o={f >= fix - 8 && f < fix + 4 ? 1 : 0} />
      </Win>
      {/* the shoulder it fixed */}
      <svg width={W} height={1920} style={{position: 'absolute', inset: 0, overflow: 'visible'}}><HandRing cx={505} cy={395} rx={95} ry={80} p={ramp(f, fix + 6, fix + 18)} color={P.red} sw={7} /></svg>
    </View>
    <Abs x={0} y={1030} style={{display: 'flex', justifyContent: 'center', gap: 22}}>
      {f >= p.a - 2 && <Chip f={f} at={p.a - 2}><span style={{fontSize: 34, opacity: 0.7}}>第</span><span style={{color: P.amber, fontSize: 60, fontFamily: font, minWidth: 110, textAlign: 'center'}}>{run}</span><span style={{fontSize: 34, opacity: 0.7}}>轮</span></Chip>}
      <Chip f={f} at={fix + 8}><span style={{color: P.red, fontSize: 60}}>36</span><span style={{fontSize: 34}}>处肩部力臂错误</span></Chip>
    </Abs>
    <Abs y={1170} style={{textAlign: 'center'}}><In f={f} at={fix + 30}><Big size={40} w={700} c="rgba(255,255,255,0.75)">几秒就倒 → 连续走 <span style={{color: P.amber, fontWeight: 900}}>11.2 秒</span></Big></In></Abs>
    <Top />
  </>;
};
Walk.sfx = (cue) => {
  const p = walkPlan(cue);
  return [{at: p.a, kind: 'tick', gain: 0.06}, {at: p.a + 10, kind: 'tick', gain: 0.06}, {at: p.a + 20, kind: 'tick', gain: 0.06}, {at: p.b - 4, kind: 'fs-whoosh-wipe', gain: 0.1},
    {at: p.b + 10, kind: 'paper', gain: 0.07}];
};

/* ---------- 7 bench (held): Terminal-Bench 4.0 — 66.4 vs 65.7 ---------- */

const benchPlan = (cue: Cue) => ({a: cue('a', 40), b: cue('b', 90)});
const BARS: {name: string; v: number; hero?: boolean; dim?: boolean}[] = [
  {name: 'GPT-6 Astra', v: 58.2, dim: true}, {name: 'Claude Opus 5.5', v: 66.4}, {name: 'Kimi K3.1 Pro', v: 65.7, hero: true},
];
const Bench: Scene = () => null;
Bench.backdrop = ({f, cue}) => {
  const p = benchPlan(cue);
  const cam = camOf(f, [[-1, {x: 540, y: 760, z: 1}, 1], [p.b + 6, {z: 1.06, y: 700}, 50]]);
  const base = 1180, scale = 9;
  return <>
    <Floor base={P.cad} line="#DADADA" horizon={base} glow="rgba(255,255,255,0.85)" t={f / 30} grain={0.6} />
    <Abs y={210} style={{textAlign: 'center'}}>
      <Big size={60} c={P.ink}>Terminal-Bench 4.0</Big>
      <Big size={34} w={600} c={P.mute} style={{marginTop: 10}}>编程智能体测试 · 官方自测 · max 推理</Big>
    </Abs>
    <View cam={cam}>
      {BARS.map((b, i) => {
        const x = [110, 400, 690][i], w = 270;
        const at = 4 + i * 8;
        const k = ease.outCubic(clamp((f - at) / 22));
        const h = b.v * scale * k;
        const col = b.hero ? P.amber : b.dim ? '#D3D5D6' : P.metal;
        return <React.Fragment key={b.name}>
          <ContactShadow x={x + w / 2} y={base} w={w + 40} o={0.2} />
          <div style={{position: 'absolute', left: x, top: base - h, width: w, height: h, borderRadius: '16px 16px 0 0',
            background: `linear-gradient(90deg, rgba(255,255,255,0.35) 0, rgba(255,255,255,0) 40%, rgba(0,0,0,0.12) 100%), ${col}`}} />
          <div style={{position: 'absolute', left: x, top: base - h - 96, width: w, textAlign: 'center', opacity: clamp(k * 3)}}>
            <Roll f={f} start={at} land={at + 22} to={b.v} decimals={1} size={b.dim ? 60 : 84} color={b.hero ? P.amberDeep : b.dim ? P.mute : P.ink} family={font} />
          </div>
          <div style={{position: 'absolute', left: x - 20, top: base + 22, width: w + 40, textAlign: 'center', fontFamily: font, fontWeight: b.hero ? 900 : 700, fontSize: 36,
            color: b.dim ? P.mute : P.ink, opacity: clamp(k * 3)}}>{b.name}</div>
        </React.Fragment>;
      })}
      {/* the gap, bracketed by hand on {b} */}
      <svg width={W} height={1920} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
        <HandLine x1={535} y1={base - 66.4 * scale - 120} x2={825} y2={base - 65.7 * scale - 120} p={ramp(f, p.b - 4, p.b + 8)} color={P.amberDeep} sw={6} bend={-0.25} />
      </svg>
      <div style={{position: 'absolute', left: 560, top: base - 66.4 * scale - 230, fontFamily: hand, fontSize: 64, color: P.amberDeep, transform: 'rotate(-4deg)',
        opacity: ramp(f, p.b + 2, p.b + 12), whiteSpace: 'nowrap'}}>只差 0.7</div>
    </View>
    <Top dark={false} />
  </>;
};
Bench.sfx = (cue) => {
  const p = benchPlan(cue);
  return [...BARS.map((_, i) => ({at: 4 + i * 8, kind: 'whoosh-short', gain: 0.05})), {at: p.b, kind: 'thud', gain: 0.12}];
};

/* ---------- 8 end (held): back to the palace, recoloured; weights by Nov 4 ---------- */

const endPlan = (cue: Cue) => ({a: cue('a', 48)});
const End: Scene = () => null;
End.backdrop = ({f, cue}) => {
  const p = endPlan(cue);
  const bw = 1920 * 0.82, bh = 1080 * 0.82;
  const scanY = ease.inOutCubic(clamp((f - 2) / 18)) * 1300;
  const push = 1 + 0.06 * clamp(f / 130);
  return <>
    <div style={{position: 'absolute', inset: 0, background: `radial-gradient(ellipse 90% 60% at 50% 30%, ${P.ochre}, ${P.palace} 70%)`}} />
    <div style={{position: 'absolute', left: 0, top: 0, width: W, height: 1300, overflow: 'hidden'}}>
      <div style={{position: 'absolute', left: 540 - (bw * 1.6 * push) / 2 + 160, top: 30, width: bw * 1.6 * push, height: bh * 1.6 * push}}>
        <Footage f={f} segs={[{clip: 'palace', src: 0.5, from: 0}]} />
      </div>
      <Greyed y={1300 - scanY} below />
      <ScanLine y={scanY} w={W} o={f < 22 ? 1 : 0} />
      <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: 360, background: `linear-gradient(180deg, transparent, ${P.palace})`}} />
      <CaseTag />
    </div>
    <Stamp x={540} y={1060} f={f} at={p.a - 2} size={128} color={P.amber} rot={-6}>11.4 前开源</Stamp>
    <Abs y={1200} style={{textAlign: 'center'}}><In f={f} at={p.a + 10}><Big size={36} w={600} c={P.gold}>完整权重 · 据 Kimi 官方</Big></In></Abs>
    <Top />
  </>;
};
End.sfx = (cue) => [{at: 2, kind: 'fs-whoosh-wipe', gain: 0.1}, {at: endPlan(cue).a - 2, kind: 'stamp', gain: 0.14}];

/** Cover anchor (880 × 800, rendered at f = 0): the dragon from the demo, edges fading into the palace ground. */
const Cover: Scene = () => <div style={{position: 'absolute', inset: 0, overflow: 'hidden', borderRadius: 24}}>
  <Img src={staticFile('images/tutorials/kimi-k3-1-pro/dragon.jpg')} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: '55% 40%'}} />
  <div style={{position: 'absolute', inset: 0, background: `radial-gradient(ellipse 75% 70% at 55% 45%, transparent 55%, ${P.palace} 100%)`}} />
  <CaseTag />
</div>;

export const kimiK31ProScenes: Record<string, Scene> = {
  'kimi.hook': Hook, 'kimi.name': Name, 'kimi.blender': Blender, 'kimi.engine': Engine, 'kimi.lamp': Lamp, 'kimi.walk': Walk, 'kimi.bench': Bench, 'kimi.end': End,
  'kimi.cover': Cover,
};
