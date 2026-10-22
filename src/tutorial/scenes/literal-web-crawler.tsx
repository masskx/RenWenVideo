import React from 'react';
import {Img, OffthreadVideo, Sequence, staticFile} from 'remotion';
import {font} from '../theme';
import {clamp, ease, springStep} from '../../fx';
import {Cue, S, Scene, cam, hitOf, phaseOp} from '../paper';
import {A, B, BG, Big, DIM, INK, LINE, Mono, PANEL, STEEL} from '../tech';
import {TRACK, TRACK_DT} from './literal-web-crawler.track';

// literal-web-crawler: a "web crawler" that is literally a spider, tearing links off the page (≈ 45 s).
// Script: inputs/literal-web-crawler/script.md (narration verbatim, shot list and source in/out points);
// storyboard: tutorials/literal-web-crawler.storyboard.md. All footage is the user's own recording of the public demo
// (inputs/literal-web-crawler/demo-full.mp4, 1280×800, muted working copies from scripts/clips/literal-web-crawler.sh),
// labelled 「网页演示录屏」 bottom-right. The close-ups follow the spider with a tracked path (literal-web-crawler.track.ts).
// Accents: amber A = what the narration names, cyan B = links / the fix. The demo's own neon stays as recorded.

const W = 900;
/** Camera key that never lifts the title (stage y ≈ −14) under the top bar: caps the look-at y for the zoom. */
const camT = (at: number, x: number, y: number, z: number) => cam(at, x, Math.min(y, 540 + (555 / z - 14 - 540) / 0.55), z);
const SRC_W = 1280, SRC_H = 800, BAR = 84; // the demo's toolbar is the top 84 px of the recording
const V = (n: string) => staticFile(`video/literal-web-crawler/${n}`);

const Root: React.FC<{children: React.ReactNode}> = ({children}) => <div style={{position: 'relative', width: W, height: 1080}}>{children}</div>;
const Abs: React.FC<{x?: number; y: number; w?: number; h?: number; style?: React.CSSProperties; children?: React.ReactNode}> = ({x = 0, y, w, h, style, children}) => (
  <div style={{position: 'absolute', left: x, top: y, width: w, height: h, ...style}}>{children}</div>
);
const popIn = (f: number, at: number) => {
  const k = springStep(S(f), S(at), {f: 2.6, z: 0.62});
  const sq = hitOf(f, [at + 4], 1);
  return {opacity: clamp(k * 2), transform: `scale(${(0.6 + 0.4 * k) * (1 + 0.04 * sq)}, ${(0.6 + 0.4 * k) * (1 - 0.05 * sq)})`};
};
const Pop: React.FC<{f: number; at: number; origin?: string; style?: React.CSSProperties; children: React.ReactNode}> = ({f, at, origin = '0% 50%', style, children}) => (
  f >= at - 1 ? <div style={{...popIn(f, at), transformOrigin: origin, ...style}}>{children}</div> : null
);
const Chip: React.FC<{c?: string; size?: number; fill?: boolean; style?: React.CSSProperties; children: React.ReactNode}> = ({c = A, size = 48, fill, style, children}) => (
  <div style={{display: 'inline-block', background: fill ? c : BG, border: `4px solid ${c}`, color: fill ? BG : c, fontFamily: font, fontWeight: 900, fontSize: size,
    lineHeight: 1.25, padding: '2px 16px', whiteSpace: 'nowrap', ...style}}>{children}</div>
);
const Stamp: React.FC<{f: number; at: number; c?: string; size?: number; deg?: number; children: React.ReactNode}> = ({f, at, c = A, size = 64, deg = -6, children}) => {
  if (f < at - 6) return null;
  const k = ease.inCubic(clamp((f - at + 6) / 6));
  const sq = hitOf(f, [at], 1);
  return <div style={{display: 'inline-block', transform: `rotate(${deg}deg) scale(${(1.6 - 0.6 * k) * (1 + 0.05 * sq)}, ${(1.6 - 0.6 * k) * (1 - 0.06 * sq)})`,
    opacity: clamp(k * 2), border: `6px solid ${c}`, color: c, background: 'rgba(12,26,44,0.92)', fontFamily: font, fontWeight: 900, fontSize: size,
    padding: '4px 22px', whiteSpace: 'nowrap'}}>{children}</div>;
};
const Title: React.FC<{size?: number; children: React.ReactNode; style?: React.CSSProperties}> = ({size = 88, children, style}) => (
  <Abs y={-14} w={W} style={style}><div style={{fontFamily: font, fontWeight: 900, fontSize: size, lineHeight: 1.15, color: INK, whiteSpace: 'nowrap'}}>{children}</div></Abs>
);
const amber = (s: string) => <span style={{color: A}}>{s}</span>;
const cyan = (s: string) => <span style={{color: B}}>{s}</span>;

/* ---------- the tracked demo view ---------- */

/** Where the spider is (source px) at source time t. */
const spiderAt = (t: number): [number, number] => {
  const u = clamp(t / TRACK_DT, 0, TRACK.length - 1);
  const i = Math.floor(u), k = u - i;
  const a = TRACK[i], b = TRACK[Math.min(i + 1, TRACK.length - 1)];
  return [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k];
};
/** A calmer camera target: the spider's position averaged over ±0.4 s, so the crop drifts instead of jittering. */
const camAt = (t: number): [number, number] => {
  let x = 0, y = 0;
  for (let i = -4; i <= 4; i++) {
    const [px, py] = spiderAt(t + i * 0.1);
    x += px / 9;
    y += py / 9;
  }
  return [x, y];
};

/** One stretch of footage inside a scene: from scene frame `at`, source second `src`, `rate` source seconds per second.
 *  `file` = a pre-slowed working copy (plays at 1×, `rate` only maps it back to source time for the tracker). */
type Seg = {at: number; src: number; rate: number; file?: string};
const segAt = (segs: Seg[], f: number) => segs.reduce((s, g) => (f >= g.at ? g : s), segs[0]);
const srcTime = (segs: Seg[], f: number) => {
  const g = segAt(segs, f);
  return g.src + Math.max(0, f - g.at) / 30 * g.rate;
};
/** Map a source point to the box's coordinates for a view (centre cx, cy; zoom z). */
type View = {cx: number; cy: number; z: number};
const toBox = (v: View, w: number, h: number, p: [number, number]) => [w / 2 + (p[0] - v.cx) * v.z, h / 2 + (p[1] - v.cy) * v.z] as const;
const viewOf = (segs: Seg[], f: number, w: number, h: number, z: number, center: 'spider' | [number, number], bias: [number, number] = [0, 0], bar = false): View => {
  const t = srcTime(segs, f);
  const [tx, ty] = center === 'spider' ? camAt(t) : center;
  const hw = w / 2 / z, hh = h / 2 / z, top = bar ? 0 : BAR;
  const cx = hw * 2 >= SRC_W ? SRC_W / 2 : clamp(tx + bias[0], hw, SRC_W - hw);
  const cy = hh * 2 >= SRC_H - top ? (top + SRC_H) / 2 : clamp(ty + bias[1], top + hh, SRC_H - hh);
  return {cx, cy, z};
};
/** The footage in a box: plays `segs`, framed by `view`. */
const Footage: React.FC<{segs: Seg[]; view: View; w: number; h: number; dim?: number}> = ({segs, view, w, h, dim = 0}) => (
  <div style={{position: 'absolute', inset: 0, overflow: 'hidden', background: '#000'}}>
    {segs.map((g, i) => {
      const next = segs[i + 1]?.at ?? 100000;
      return <Sequence key={i} from={g.at} durationInFrames={next - g.at} layout="none">
        <div style={{position: 'absolute', left: w / 2 - view.cx * view.z, top: h / 2 - view.cy * view.z, width: SRC_W * view.z, height: SRC_H * view.z}}>
          <OffthreadVideo src={V(g.file ?? 'demo.mp4')} muted trimBefore={g.file ? 0 : Math.round(g.src * 30)} playbackRate={g.file ? 1 : g.rate}
            style={{width: '100%', height: '100%', opacity: 1 - dim}} />
        </div>
      </Sequence>;
    })}
  </div>
);
/** A framed demo box with the recording label bottom-right. */
const Demo: React.FC<{x?: number; y: number; w?: number; h: number; segs: Seg[]; view: View; dim?: number; edge?: string; label?: boolean; children?: React.ReactNode}> = ({
  x = 0, y, w = W, h, segs, view, dim, edge = LINE, label = true, children}) => (
  <Abs x={x} y={y} w={w} h={h}>
    <div style={{position: 'absolute', inset: 0, outline: `3px solid ${edge}`}}><Footage segs={segs} view={view} w={w} h={h} dim={dim} /></div>
    {children}
    {label && <div style={{position: 'absolute', right: 0, bottom: 0, background: 'rgba(12,26,44,0.85)', color: INK, fontFamily: font, fontWeight: 700, fontSize: 40,
      lineHeight: 1.2, padding: '4px 12px', whiteSpace: 'nowrap'}}>网页演示录屏</div>}
  </Abs>
);
/** A magnified piece of the demo's toolbar (a control the narration names), same footage, outlined in `c`. */
const Callout: React.FC<{x: number; y: number; segs: Seg[]; rect: [number, number, number, number]; scale: number; c?: string; pulse?: number; f: number; op?: number}> = ({
  x, y, segs, rect, scale, c = A, pulse = -100, f, op = 1}) => {
  const [sx, sy, sw, sh] = rect;
  const w = sw * scale, h = sh * scale;
  const flash = f >= pulse ? Math.max(0, 1 - (f - pulse) / 18) : 0;
  return <Abs x={x} y={y} w={w} h={h} style={{opacity: op}}>
    <div style={{position: 'absolute', inset: 0, outline: `${4 + 6 * flash}px solid ${c}`, boxShadow: `0 0 ${30 * flash}px ${c}`}}>
      <Footage segs={segs} view={{cx: sx + sw / 2, cy: sy + sh / 2, z: scale}} w={w} h={h} />
    </div>
  </Abs>;
};
const Ring: React.FC<{x: number; y: number; r?: number; c?: string; f: number; at?: number}> = ({x, y, r = 60, c = A, f, at = 0}) => {
  const k = ((f - at) % 24) / 24;
  return <svg width={W} height={1080} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', pointerEvents: 'none'}}>
    <circle cx={x} cy={y} r={r} fill="none" stroke={c} strokeWidth={6} />
    <circle cx={x} cy={y} r={r + 40 * k} fill="none" stroke={c} strokeWidth={4} opacity={1 - k} />
  </svg>;
};

/* ---------- 1 hook: the page, being eaten ---------- */

const HOOK: Seg[] = [{at: 0, src: 13.0, rate: 1}];
const hookPlan = (cue: Cue) => ({a: cue('a', 22)});
const Hook: Scene = ({f, cue}) => {
  const p = hookPlan(cue);
  const z = 1.9 + 0.3 * ease.outCubic(clamp(f / 90));
  const view = viewOf(HOOK, f, W, 900, z, 'spider');
  return <Root>
    <Title size={104}>网页被蜘蛛{amber('啃了？')}</Title>
    <Demo y={160} h={900} segs={HOOK} view={view} edge={f >= p.a ? A : LINE} />
  </Root>;
};
Hook.sfx = (cue) => {
  const p = hookPlan(cue);
  return [{at: 0, kind: 'tap', gain: 0.16}, {at: p.a, kind: 'fs-paper-slide', gain: 0.2}];
};

/* ---------- 2 the pun: a "web crawler" is a program; someone made it a crawler ---------- */

const PUN: Seg[] = [{at: 0, src: 1.0, rate: 2}];
const punPlan = (cue: Cue) => ({a: cue('a', 66)});
const Pun: Scene = ({f, cue}) => {
  const p = punPlan(cue);
  const view = viewOf(PUN, f, W, 900, 1.2, 'spider');
  // the "program" card covers the footage, then lifts away on "有人就真把它做成了一只爬虫"
  const lift = springStep(S(f), S(p.a), {f: 1.8, z: 0.8});
  const [sx, sy] = toBox(view, W, 900, spiderAt(srcTime(PUN, f)));
  return <Root>
    <Title size={92}>网络爬虫<span style={{opacity: clamp((f - p.a + 4) / 6)}}> = {amber('真·爬虫')}</span></Title>
    <Demo y={160} h={900} segs={PUN} view={view} dim={0.65 * (1 - clamp(lift * 1.4))}>
      {lift < 1 && <div style={{position: 'absolute', left: 90, right: 90, top: 210 - 900 * lift, background: PANEL, border: `4px solid ${STEEL}`, padding: '40px 40px',
        opacity: 1 - clamp(lift)}}>
        <Mono size={44} c={B} w={800}>{'</>'} crawler</Mono>
        <Big size={64} style={{marginTop: 20}}>一段抓网页的程序</Big>
        <div style={{display: 'flex', gap: 16, marginTop: 34}}>
          {['抓网页', '找链接', '再抓下一页'].map((s, i) => <Pop key={s} f={f} at={10 + i * 12}><Chip c={B} size={40}>{s}</Chip></Pop>)}
        </div>
      </div>}
      {f >= p.a + 10 && <div style={{position: 'absolute', left: clamp(sx - 140, 20, W - 320), top: clamp(sy - 220, 20, 600)}}>
        <Stamp f={f} at={p.a + 14} size={72}>真·爬虫</Stamp></div>}
    </Demo>
  </Root>;
};
Pun.sfx = (cue) => {
  const p = punPlan(cue);
  return [{at: 10, kind: 'tick', gain: 0.1}, {at: 22, kind: 'tick', gain: 0.1}, {at: 34, kind: 'tick', gain: 0.1}, {at: p.a, kind: 'whoosh-short', gain: 0.12},
    {at: p.a + 14, kind: 'stamp', gain: 0.18}];
};

/* ---------- 3 eight legs, four walk and four hold; a foot hooks a blue link and tears it off ---------- */

const TEAR: Seg[] = [{at: 0, src: 16.0, rate: 1}];
const tearPlan = (cue: Cue) => ({a: cue('a', 56), b: cue('b', 104), c: cue('c', 128)});
/** Top-down gait diagram: legs of one set (amber, stepping) and the other (cyan, holding) swap every 10 frames. */
const Gait: React.FC<{f: number}> = ({f}) => {
  const swap = Math.floor(f / 10) % 2;
  return <svg width={300} height={250} viewBox="-150 -110 300 250">
    {Array.from({length: 8}, (_, i) => {
      const side = i < 4 ? -1 : 1, k = i % 4;
      const ang = (-55 + k * 37) * Math.PI / 180;
      const setA = (k + (side > 0 ? 1 : 0)) % 2 === swap;
      const reach = setA ? 92 : 104;
      const x = side * Math.cos(ang) * reach, y = Math.sin(ang) * reach;
      return <g key={i}>
        <path d={`M${side * 14} ${y * 0.15} Q${x * 0.55} ${y * 0.5 - 26} ${x} ${y}`} fill="none" stroke={setA ? A : B} strokeWidth={8} strokeLinecap="round" />
        {!setA && <circle cx={x} cy={y} r={9} fill={B} />}
      </g>;
    })}
    <ellipse cx={0} cy={0} rx={26} ry={34} fill={STEEL} />
  </svg>;
};
const Tear: Scene = ({f, cue}) => {
  const p = tearPlan(cue);
  const view = viewOf(TEAR, f, W, 900, 1.6, 'spider');
  const [sx, sy] = toBox(view, W, 900, spiderAt(srcTime(TEAR, f)));
  return <Root>
    <Title size={92}>专撕{cyan('蓝色链接')}</Title>
    <Demo y={160} h={900} segs={TEAR} view={view}>
      {f >= p.a - 2 && <div style={{position: 'absolute', left: 16, top: 16, background: 'rgba(12,26,44,0.9)', border: `3px solid ${LINE}`, padding: '10px 14px',
        ...phaseOp(f, p.a, p.b + 20)}}>
        <Gait f={f} />
        <div style={{display: 'flex', gap: 22, fontFamily: font, fontWeight: 900, fontSize: 44}}><span style={{color: A}}>4 条走</span><span style={{color: B}}>4 条抓稳</span></div>
      </div>}
      {f >= p.b && f < p.c + 30 && <Ring x={sx} y={sy} r={70} f={f} at={p.b} c={B} />}
      <div style={{position: 'absolute', right: 30, top: 40}}><Stamp f={f} at={p.c + 4} size={80} deg={6}>撕！</Stamp></div>
    </Demo>
  </Root>;
};
Tear.sfx = (cue) => {
  const p = tearPlan(cue);
  return [{at: p.a, kind: 'pop', gain: 0.12}, {at: p.b, kind: 'tick', gain: 0.12}, {at: p.c + 4, kind: 'fs-paper-slide', gain: 0.22}];
};

/* ---------- 3b slow motion: the torn pieces fall with physics ---------- */

const SLOW: Seg[] = [{at: 0, src: 19.0, rate: 0.5, file: 'slow-tear.mp4'}];
const slowPlan = (cue: Cue) => ({a: cue('a', 26), b: cue('b', 84)});
const Slow: Scene = ({f, cue}) => {
  const p = slowPlan(cue);
  const view = viewOf(SLOW, f, W, 900, 2.5, 'spider', [0, 70 * clamp((f - p.b) / 30)]);
  return <Root>
    <Title size={92}>碎片还会{amber('掉下去')}</Title>
    <Demo y={160} h={900} segs={SLOW} view={view}>
      <div style={{position: 'absolute', left: 0, top: 0}}><Chip c={A} size={44} fill>0.5× 慢放</Chip></div>
      {/* the demo's own counter, magnified: "N torn off" */}
      {f >= p.a - 2 && <div style={{position: 'absolute', left: 16, bottom: 74, ...phaseOp(f, p.a)}}>
        <Big size={40} c={DIM} style={{marginBottom: 8}}>已撕下</Big>
        <div style={{position: 'relative', width: 96 * 4, height: 26 * 4}}><Callout x={0} y={0} segs={SLOW} rect={[810, 44, 96, 26]} scale={4} f={f} pulse={p.a} /></div>
      </div>}
    </Demo>
  </Root>;
};
Slow.sfx = (cue) => {
  const p = slowPlan(cue);
  return [{at: 0, kind: 'whoosh', gain: 0.1}, {at: p.a, kind: 'tick', gain: 0.12}, {at: p.b + 10, kind: 'thud', gain: 0.12}];
};

/* ---------- 4 follow mode: it chases your mouse ---------- */

const FOLLOW: Seg[] = [{at: 0, src: 21.0, rate: 1.2}];
const followPlan = (cue: Cue) => ({a: cue('a', 32), b: cue('b', 84)});
const Follow: Scene = ({f, cue}) => {
  const p = followPlan(cue);
  const view = viewOf(FOLLOW, f, W, 780, 1.15, 'spider');
  // the cursor itself is not in the recording: a ring marks where the spider is heading (its position 0.6 s ahead)
  const t = srcTime(FOLLOW, f);
  const [rx, ry] = toBox(view, W, 780, spiderAt(t + 0.6));
  return <Root>
    <Title size={88}>它会{amber('追着鼠标')}跑</Title>
    <Abs y={140} w={W} style={{display: 'flex', alignItems: 'center', gap: 20}}>
      <Callout x={0} y={0} segs={FOLLOW} rect={[14, 40, 168, 34]} scale={2.4} f={f} pulse={4} />
      <div style={{marginLeft: 430}}><Mono size={40} c={A} w={800}>跟随模式</Mono></div>
    </Abs>
    <Demo y={280} h={780} segs={FOLLOW} view={view}>
      {f >= p.a && <Ring x={rx} y={ry} r={36} f={f} at={p.a} />}
      <div style={{position: 'absolute', left: 30, bottom: 80}}><Pop f={f} at={p.b}><Chip c={A} size={60} fill>像只电子宠物</Chip></Pop></div>
    </Demo>
  </Root>;
};
Follow.sfx = (cue) => {
  const p = followPlan(cue);
  return [{at: 4, kind: 'tap', gain: 0.16}, {at: p.a, kind: 'tick', gain: 0.1}, {at: p.b, kind: 'pop', gain: 0.14}];
};

/* ---------- 5 sliders: size and how hard it rips ---------- */

const sizePlan = (cue: Cue) => ({a: cue('a', 20), b: cue('b', 50), c: cue('c', 92), d: cue('d', 124)});
const sizeSegs = (p: ReturnType<typeof sizePlan>): Seg[] => [{at: 0, src: 30.4, rate: 1.4}, {at: Math.max(p.d - 4, 60), src: 36.4, rate: 1.4}];
const Size: Scene = ({f, cue}) => {
  const p = sizePlan(cue);
  const segs = sizeSegs(p);
  const view = viewOf(segs, f, W, 720, 1.05, 'spider');
  const [sx, sy] = toBox(view, W, 720, spiderAt(srcTime(segs, f)));
  return <Root>
    <Title size={80}>大小、撕的频率{amber('都能调')}</Title>
    {/* the two sliders, magnified: RIP and SIZE */}
    <Abs y={130} w={W} h={200}>
      <Callout x={0} y={50} segs={segs} rect={[190, 42, 270, 30]} scale={3.2} f={f} pulse={p.b} c={STEEL} />
      <div style={{position: 'absolute', left: 30, top: 0, ...phaseOp(f, p.a - 6)}}><Mono size={40} c={A} w={800}>撕得多猛</Mono></div>
      <div style={{position: 'absolute', left: 500, top: 0}}><Mono size={40} c={A} w={800}>大小</Mono></div>
    </Abs>
    <Demo y={340} h={720} segs={segs} view={view}>
      {f >= p.c - 2 && f < p.d - 4 && <div style={{position: 'absolute', left: clamp(sx - 120, 10, W - 300), top: clamp(sy - 260, 10, 500)}}>
        <Stamp f={f} at={p.c} size={68}>大到吓人</Stamp></div>}
      {f >= p.d - 2 && <>
        <Ring x={sx} y={sy} r={40} f={f} at={p.d} c={B} />
        <div style={{position: 'absolute', left: clamp(sx - 130, 10, W - 330), top: clamp(sy - 160, 10, 560)}}><Pop f={f} at={p.d + 2} origin="50% 100%">
          <Chip c={B} size={56} fill>小到像蚂蚁</Chip></Pop></div>
      </>}
    </Demo>
  </Root>;
};
Size.sfx = (cue) => {
  const p = sizePlan(cue);
  return [{at: 6, kind: 'whoosh-short', gain: 0.1}, {at: p.b, kind: 'tick', gain: 0.1}, {at: p.c, kind: 'stamp', gain: 0.18}, {at: p.d, kind: 'pop', gain: 0.14}];
};

/* ---------- 6 one click on "Repair page" and every link is back ---------- */

const repairPlan = (cue: Cue) => ({a: cue('a', 30), b: cue('b', 62)});
// the click lands at source 40.55 s: the second stretch starts 0.2 s before it, right on "点一下修复"
const repairSegs = (p: ReturnType<typeof repairPlan>): Seg[] => [{at: 0, src: 39.5, rate: 0.5}, {at: Math.max(4, p.a - 2), src: 40.35, rate: 0.7}];
const Repair: Scene = ({f, cue}) => {
  const p = repairPlan(cue);
  const segs = repairSegs(p);
  const view: View = {cx: 640, cy: 400, z: 1.25};
  const click = Math.max(4, p.a - 2) + Math.round(0.2 / 0.7 * 30);
  return <Root>
    <Title size={92}>一键{cyan('修好')}网页</Title>
    <Abs y={140} w={W} style={{display: 'flex', alignItems: 'center'}}>
      <Callout x={0} y={0} segs={segs} rect={[546, 40, 104, 34]} scale={3} f={f} pulse={click} c={B} />
      <div style={{marginLeft: 340}}><Mono size={40} c={B} w={800}>修复网页</Mono></div>
    </Abs>
    <Demo y={280} h={780} segs={segs} view={view} edge={f >= click ? B : LINE}>
      <div style={{position: 'absolute', right: 24, top: 24}}><Pop f={f} at={p.b} origin="100% 0%"><Chip c={B} size={56} fill>链接全回来了</Chip></Pop></div>
    </Demo>
  </Root>;
};
Repair.sfx = (cue) => {
  const p = repairPlan(cue);
  return [{at: Math.max(4, p.a - 2) + 9, kind: 'tap', gain: 0.2}, {at: p.b, kind: 'chime', gain: 0.12}];
};

/* ---------- 7 paste your own text; on Linux it can be a screensaver ---------- */

const pastePlan = (cue: Cue) => ({a: cue('a', 66), b: cue('b', 130)});
// 43.7 s: the paste box opens and the text goes in; from 47 s the spider roams beside the pasted lines
const PASTE: Seg[] = [{at: 0, src: 43.7, rate: 1}, {at: 42, src: 47.0, rate: 1.6}];
const Paste: Scene = ({f, cue}) => {
  const p = pastePlan(cue);
  const view = f < 42 ? {cx: 500, cy: 260, z: 1.25} : viewOf(PASTE, f, W, 520, 1.25, 'spider', [-120, -80]);
  const desk = springStep(S(f), S(p.a), {f: 2, z: 0.75});
  // a tiny spider walks across the drawn desktop and the windows it passes vanish
  const walk = clamp((f - p.b) / 50);
  const spx = 60 + 380 * clamp((f - p.a) / 90);
  return <Root>
    <Title size={84}>贴进{amber('自己的文字')}也能啃</Title>
    <Demo y={140} h={520} segs={PASTE} view={view} />
    <Abs y={700} w={W} h={360} style={{opacity: clamp(desk * 1.5), transform: `translateY(${(1 - desk) * 80}px)`}}>
      <svg width={460} height={330} style={{position: 'absolute', left: 0, top: 10}}>
        <rect x={6} y={6} width={448} height={260} rx={14} fill={PANEL} stroke={STEEL} strokeWidth={6} />
        {[[40, 40, 160, 100], [230, 70, 180, 120], [70, 160, 140, 80]].map(([x, y, w, h], i) => (
          <rect key={i} x={x} y={y} width={w} height={h} rx={8} fill="none" stroke={LINE} strokeWidth={4} opacity={walk > (i + 1) / 4 ? 0.15 : 1} />))}
        <g transform={`translate(${spx} ${150 + 30 * Math.sin(f / 6)})`}>
          {Array.from({length: 8}, (_, i) => {
            const ang = (i / 8) * Math.PI * 2 + 0.4 * Math.sin(f / 3 + i);
            return <line key={i} x1={0} y1={0} x2={30 * Math.cos(ang)} y2={30 * Math.sin(ang)} stroke={A} strokeWidth={4} strokeLinecap="round" />;
          })}
          <circle r={11} fill={'#ff3b6b'} />
        </g>
        <rect x={200} y={266} width={60} height={34} fill={STEEL} /><rect x={150} y={300} width={160} height={14} rx={7} fill={STEEL} />
      </svg>
      <div style={{position: 'absolute', left: 490, top: 30}}>
        <Big size={60}>Linux</Big>
        <Big size={60} c={A}>桌面插件</Big>
        <div style={{marginTop: 16}}><Chip c={B} size={52}>可当屏保</Chip></div>
      </div>
    </Abs>
  </Root>;
};
Paste.sfx = (cue) => {
  const p = pastePlan(cue);
  return [{at: 26, kind: 'tap', gain: 0.14}, {at: 42, kind: 'whoosh-short', gain: 0.08}, {at: p.a, kind: 'pop', gain: 0.14}, {at: p.b, kind: 'tick', gain: 0.1}];
};
Paste.camera = (cue) => {
  const p = pastePlan(cue);
  return [camT(0, 450, 420, 1.02), camT(p.a, 450, 700, 1.04)];
};

/* ---------- 8 end: plain web code, no libraries — the pun made real ---------- */

// the slowed copy is 7.2 s; a longer end scene carries on from the full recording at the same speed
const END: Seg[] = [{at: 0, src: 12.6, rate: 0.5, file: 'slow-end.mp4'}, {at: 214, src: 16.17, rate: 0.5}];
const endPlan = (cue: Cue) => ({a: cue('a', 26), b: cue('b', 56), c: cue('c', 150)});
const End: Scene = ({f, cue}) => {
  const p = endPlan(cue);
  const view = viewOf(END, f, W, 1080, 2.1 + 0.25 * clamp(f / 240), 'spider');
  return <Root>
    <Demo y={0} h={1080} segs={END} view={view} edge={BG}>
      <div style={{position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0) 35%, rgba(12,26,44,0.92) 85%)'}} />
      <div style={{position: 'absolute', left: 30, top: 30, display: 'flex', gap: 14, flexWrap: 'wrap'}}>
        {['纯 JS/CSS', '零依赖', 'MIT 开源'].map((s, i) => <Pop key={s} f={f} at={(i ? p.a : 4) + i * 6}><Chip c={i === 1 ? A : STEEL} size={44}>{s}</Chip></Pop>)}
      </div>
      <div style={{position: 'absolute', left: 30, bottom: 90, opacity: clamp((f - p.c + 4) / 8), transform: `translateY(${(1 - clamp((f - p.c + 4) / 10)) * 30}px)`}}>
        <Big size={96} style={{whiteSpace: 'nowrap'}}>把双关</Big>
        <Big size={96} c={A} style={{whiteSpace: 'nowrap'}}>做成真东西</Big>
      </div>
    </Demo>
  </Root>;
};
End.sfx = (cue) => {
  const p = endPlan(cue);
  return [{at: 4, kind: 'tick', gain: 0.1}, {at: p.a, kind: 'tick', gain: 0.1}, {at: p.c, kind: 'thud', gain: 0.16}];
};

/* ---------- cover anchor (880 × 800): the spider mid-rip, close up ---------- */

const Cover: Scene = () => {
  const z = 2.2, [cx, cy] = [770, 290];
  return <div style={{position: 'relative', width: 880, height: 800, overflow: 'hidden', outline: `4px solid ${A}`}}>
    <Img src={V('still-rip.png')} style={{position: 'absolute', left: 440 - cx * z, top: 400 - cy * z, width: SRC_W * z, height: SRC_H * z}} />
    <div style={{position: 'absolute', right: 0, bottom: 0, background: 'rgba(12,26,44,0.85)', color: INK, fontFamily: font, fontWeight: 700, fontSize: 40,
      padding: '4px 12px'}}>网页演示录屏</div>
  </div>;
};

export const literalCrawlerScenes: Record<string, Scene> = {
  'lwc.hook': Hook,
  'lwc.pun': Pun,
  'lwc.tear': Tear,
  'lwc.slow': Slow,
  'lwc.follow': Follow,
  'lwc.size': Size,
  'lwc.repair': Repair,
  'lwc.paste': Paste,
  'lwc.end': End,
  'lwc.cover': Cover,
};
