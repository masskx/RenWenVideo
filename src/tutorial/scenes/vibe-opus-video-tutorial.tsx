import React from 'react';
import {Img, OffthreadVideo, Sequence, staticFile} from 'remotion';
import {clamp, ease} from '../../fx';
import {font, mono} from '../theme';
import {Cue, Scene} from '../paper';
import {ContactShadow, Ground, HandLine, HandRing, Roll, Stamp, Sticker, hand, pop, ramp} from '../props';

// vibe-opus-video-tutorial: a ~3-minute tutorial for Douyin's #Vibe知识大赏 — how people make these films with Claude Opus 5.5
// writing code (asset case B: screenshots + the creators' films). Facts: inputs/vibe-opus-video-tutorial/ (materials, sources,
// review ⛔ list: no handles / repo links on screen, no paid tools, no costs screenshot). Storyboard:
// tutorials/vibe-opus-video-tutorial.storyboard.md.
// - One idea: these aren't generated videos — the model writes a web page, screenshots it frame by frame and joins the frames.
// - One object carried through: the frame card (a picture and its code are two sides of one card); a blue scan line flips it.
// - Colours found in the material (scripts/qa/palette.mjs): Remotion docs white / code-block grey #22242D / link blue #2B93F2
//   (the one accent = "a command, a step, code"); Anthropic's ivory #F9F8F4 + ink + the Claude asterisk's clay #DE7356 (only
//   for Anthropic / Claude); the mg-styles-15 flow chart's near-black, sand and terracotta (only for the 15 styles); DeepSeek's
//   brand blue (only in the comparison). Red only means "wrong".
// Everything is drawn in the backdrop (1080 × 1920); captions sit at y ≈ 1390, so content stays in y 150–1300.

const P = {
  code: '#22242D', code2: '#2C2F3A', codeLine: '#3A3E4C', white: '#FFFFFF', paper: '#EAECEE', grey: '#B4BCC5', mute: '#7F7C7C',
  blue: '#2B93F2', ivory: '#F9F8F4', ink: '#141313', clay: '#DE7356', night: '#09090B', night2: '#141217', sand: '#D8D5C7',
  terra: '#C26C4A', red: '#E5484D', ds: '#4D6BFE', dark: '#1B1D24',
};
const W = 1080;
const TOTAL_FRAMES = 5144; // tutorials/vibe-opus-video-tutorial.timeline.json totalFrames (the end card shows it)
const vid = (n: string) => staticFile(`video/vibe-opus-video-tutorial/${n}.mp4`);
const img = (n: string) => staticFile(`images/tutorials/vibe-opus-video-tutorial/${n}`);

/* ---------- shared pieces ---------- */

type Seg = {clip: string; src?: number; from: number; to?: number};
/** Footage segments: `clip` from `src` s, starting at scene frame `from` (until the next segment or `to`), muted. */
const Footage: React.FC<{f: number; segs: Seg[]; pos?: string; fit?: 'cover' | 'contain'}> = ({f, segs, pos = '50% 50%', fit = 'cover'}) => <>
  {segs.map((s, i) => {
    const end = s.to ?? segs[i + 1]?.from ?? 1e5;
    if (f < s.from - 1 || f >= end) return null;
    return <Sequence key={i} from={s.from} layout="none">
      <OffthreadVideo src={vid(s.clip)} muted trimBefore={Math.round((s.src ?? 0) * 30)}
        style={{position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: fit, objectPosition: pos}} />
    </Sequence>;
  })}
</>;

/** 「作者｜案例展示」 in the footage's bottom-right corner (external footage rule; no handles on screen per review.md). */
const CaseTag: React.FC<{who: string}> = ({who}) => <div style={{position: 'absolute', right: 0, bottom: 0, background: 'rgba(9,9,11,0.78)', color: P.white, fontFamily: font,
  fontWeight: 700, fontSize: 26, padding: '4px 14px', whiteSpace: 'nowrap', zIndex: 5}}>{who}｜案例展示</div>;

/** A window floating over the ground: title bar with three dots, a box, a soft drop shadow (lemo living-screencast). */
const Win: React.FC<{x: number; y: number; w: number; h: number; title?: string; light?: boolean; who?: string; children: React.ReactNode; style?: React.CSSProperties; bg?: string}> = ({
  x, y, w, h, title, light = false, who, children, style, bg,
}) => <div style={{position: 'absolute', left: x, top: y, width: w, borderRadius: 18, overflow: 'hidden',
  boxShadow: light ? '0 30px 60px rgba(20,19,19,0.18), 0 0 0 2px rgba(20,19,19,0.07)' : '0 34px 70px rgba(0,0,0,0.5), 0 0 0 2px rgba(255,255,255,0.07)', ...style}}>
  <div style={{height: 52, background: light ? '#E6E7EA' : P.dark, display: 'flex', alignItems: 'center', padding: '0 20px', gap: 11}}>
    {['#FF5F57', '#FEBC2E', '#28C840'].map((c) => <div key={c} style={{width: 16, height: 16, borderRadius: 8, background: c}} />)}
    {title && <div style={{marginLeft: 14, fontFamily: mono, fontWeight: 700, fontSize: 26, color: light ? P.code : '#C9CED6', whiteSpace: 'nowrap'}}>{title}</div>}
  </div>
  <div style={{position: 'relative', width: w, height: h, overflow: 'hidden', background: bg ?? (light ? P.white : '#000')}}>{children}{who && <CaseTag who={who} />}</div>
</div>;

/** A 2D camera over the whole frame: z zooms about (x, y) = the frame point to centre (props.tsx camAt, full-frame version). */
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

/** The scene's ground: lit, grained, with a floor line (v3 depth kit). */
const Bg: React.FC<{c: string; f: number; dark?: boolean; horizon?: number; to?: string; k?: number}> = ({c, f, dark = false, horizon = 1240, to, k = 0}) => (
  <Ground a={c} b={to} k={k} t={f / 30} horizon={horizon} grain={dark ? 0.35 : 0.55} light={dark ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.7)'} />
);

/** The chapter line at the top: which part of the tutorial this is (the five chapters read as the film's structure). */
const CHAPTERS = ['开场', '为什么火', '原理', '四步上手', '提示词', '返工', '我的四招', '换模型', '建议'];
const Top: React.FC<{ch: number; dark?: boolean}> = ({ch, dark = true}) => <div style={{position: 'absolute', left: 64, right: 64, top: 92, display: 'flex', alignItems: 'center',
  justifyContent: 'space-between', fontFamily: font, fontWeight: 700, fontSize: 30, color: dark ? 'rgba(255,255,255,0.72)' : 'rgba(34,36,45,0.62)'}}>
  <span><span style={{fontFamily: mono, color: P.blue, marginRight: 14}}>{String(ch).padStart(2, '0')}</span>{CHAPTERS[ch]}</span>
  <span style={{fontWeight: 500, fontSize: 28}}>Opus 5.5 写代码做视频</span>
</div>;

const Abs: React.FC<{x?: number; y: number; w?: number; style?: React.CSSProperties; children: React.ReactNode}> = ({x = 0, y, w = W, style, children}) => (
  <div style={{position: 'absolute', left: x, top: y, width: w, ...style}}>{children}</div>
);
const Big: React.FC<{size?: number; c?: string; w?: number; style?: React.CSSProperties; children: React.ReactNode}> = ({size = 80, c = P.white, w = 900, style, children}) => (
  <div style={{fontFamily: font, fontWeight: w, fontSize: size, lineHeight: 1.12, color: c, whiteSpace: 'nowrap', ...style}}>{children}</div>
);
const In: React.FC<{f: number; at: number; d?: number; dy?: number; dx?: number; style?: React.CSSProperties; children: React.ReactNode}> = ({f, at, d = 10, dy = 40, dx = 0, style, children}) => {
  const p = pop(f, at, d);
  if (p < -0.5) return null;
  const q = 1 - Math.max(0, p);
  return <div style={{opacity: clamp(p * 2), transform: `translate(${q * dx}px, ${q * dy}px)`, ...style}}>{children}</div>;
};
/** A rounded label that springs in (a seen number or name). */
const Chip: React.FC<{f: number; at: number; dark?: boolean; bg?: string; color?: string; size?: number; children: React.ReactNode}> = ({f, at, dark = true, bg, color, size = 42, children}) => {
  const p = pop(f, at, 10);
  if (p < -0.5) return null;
  return <div style={{display: 'inline-flex', alignItems: 'center', gap: 14, padding: '10px 26px', borderRadius: 16, transform: `scale(${Math.max(0, p)})`,
    background: bg ?? (dark ? 'rgba(255,255,255,0.10)' : P.white), border: `3px solid ${dark ? 'rgba(255,255,255,0.2)' : 'rgba(34,36,45,0.12)'}`,
    boxShadow: dark ? '0 14px 30px rgba(0,0,0,0.35)' : '0 14px 30px rgba(34,36,45,0.12)', fontFamily: font, fontWeight: 800, fontSize: size,
    color: color ?? (dark ? P.white : P.code), whiteSpace: 'nowrap'}}>{children}</div>;
};
/** The big step number of the four-step chapter: a blue disc. */
const StepNo: React.FC<{n: number; f: number; x?: number; y?: number}> = ({n, f, x = 70, y = 170}) => {
  const p = pop(f, -6, 10);
  return <div style={{position: 'absolute', left: x, top: y, width: 128, height: 128, borderRadius: 64, background: P.blue, color: P.white, display: 'flex',
    alignItems: 'center', justifyContent: 'center', fontFamily: font, fontWeight: 900, fontSize: 84, transform: `scale(${Math.max(0, p)})`,
    boxShadow: '0 16px 30px rgba(43,147,242,0.35)'}}>{n}</div>;
};

/** Mono code lines typed out from `start` (chars per frame `cps`); `hl` lines are blue. */
const Code: React.FC<{f: number; start: number; lines: string[]; size?: number; cps?: number; every?: number; color?: string; hl?: number[]; prompt?: string}> = ({
  f, start, lines, size = 34, cps = 1.6, every = 0, color = '#D7DBE2', hl = [], prompt,
}) => {
  let t = f - start;
  return <>{lines.map((line, i) => {
    const n = Math.max(0, Math.min(line.length, Math.floor(t * cps)));
    t -= line.length / cps + every;
    if (n <= 0 && !(i === 0 && f >= start)) return <div key={i} style={{height: size * 1.5}} />;
    return <div key={i} style={{fontFamily: mono, fontWeight: 600, fontSize: size, lineHeight: 1.5, color: hl.includes(i) ? P.blue : color, whiteSpace: 'pre'}}>
      {prompt && <span style={{color: P.blue}}>{prompt}</span>}{line.slice(0, n)}{n > 0 && n < line.length ? '▌' : ''}
    </div>;
  })}</>;
};

/** The blue scan line at `y` across a box `w` wide (the frame card's flip). */
const ScanLine: React.FC<{y: number; w: number; o?: number}> = ({y, w, o = 1}) => o <= 0 ? null : <div style={{position: 'absolute', left: -16, top: y - 3, width: w + 32, height: 6,
  background: P.blue, opacity: o, boxShadow: '0 0 18px 6px rgba(43,147,242,0.7), 0 0 60px 18px rgba(43,147,242,0.3)', borderRadius: 3, zIndex: 6}} />;

/** The frame card's code side, covering the top `k` (0–1) of its box: the picture underneath is "drawn by" these lines. */
const CodeSide: React.FC<{k: number; lines: string[]; size?: number}> = ({k, lines, size = 22}) => k <= 0 ? null : <div style={{position: 'absolute', inset: 0,
  clipPath: `inset(0 0 ${(1 - clamp(k)) * 100}% 0)`, background: P.code, padding: '18px 22px', zIndex: 4}}>
  {lines.map((l, i) => <div key={i} style={{fontFamily: mono, fontWeight: 600, fontSize: size, lineHeight: 1.55, color: i === 0 ? P.blue : '#C9CED6', whiteSpace: 'pre'}}>{l}</div>)}
</div>;

/** A red cross-out over a box (wrong / not this). */
const Cross: React.FC<{p: number; w: number; h: number}> = ({p, w, h}) => p <= 0 ? null : <svg width={w} height={h} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
  <HandLine x1={-10} y1={h * 0.15} x2={w * clamp(p * 1.4) + 10} y2={h * 0.85} p={clamp(p * 1.4)} color={P.red} sw={10} />
</svg>;

const pad4 = (n: number) => String(Math.max(0, Math.round(n))).padStart(4, '0');

/* ---------- 01 hook: a wall of code-made films; the scan line flips each one to its code ---------- */

const WALL = [
  {clip: 'mg-01-flat-vector', code: ['ctx.fillRect(0,0,w,h)', 'drawCity(t)', 'sun.y = ease(t)']},
  {clip: 'mg-02-line-art', code: ['path.d = line(t)', 'stroke(#E9D6A8)', 'drawLength(t)']},
  {clip: 'mg-08-morph', code: ['shape = morph(a,b,t)', 'svg.setAttr("d")', 'spring(0.6)']},
  {clip: 'mg-09-bauhaus', code: ['circle(r=120)', 'triangle(...)', 'grid.snap(t)']},
  {clip: 'mg-19-paperclip', code: ['sticker(phone)', 'label("主板")', 'cam.push(t)']},
  {clip: 'mg-20-pixel', code: ['tile(16,16)', 'hero.x += 2', 'palette(32)']},
];
const hookPlan = (cue: Cue) => ({a: cue('a', 44), b: cue('b', 87)});
const Hook: Scene = () => null;
Hook.backdrop = ({f, cue}) => {
  const p = hookPlan(cue);
  const cam = camOf(f, [[0, {z: 1.05, y: 720}, 160]]);
  const tl = ramp(f, p.a - 6, p.a + 4) * (1 - ramp(f, p.b - 10, p.b - 2));
  return <>
    <Bg c={P.code} f={f} dark />
    <View cam={cam}>
      {WALL.map((t, i) => {
        const col = i % 2, row = Math.floor(i / 2);
        const x = 40 + col * 520, y = 300 + row * 300;
        const k = ease.inOutCubic(clamp((f - p.b + 2 - row * 5) / 16));
        return <div key={t.clip} style={{position: 'absolute', left: x, top: y, width: 480, height: 270, borderRadius: 14, overflow: 'hidden', background: '#000',
          boxShadow: '0 22px 44px rgba(0,0,0,0.5)', outline: '2px solid rgba(255,255,255,0.08)'}}>
          <Footage f={f} segs={[{clip: t.clip, src: 1 + i * 0.7, from: -40}]} />
          <CodeSide k={k} lines={t.code} size={26} />
          <ScanLine y={270 * k} w={480} o={k > 0 && k < 1 ? 1 : 0} />
        </div>;
      })}
      <ContactShadow x={540} y={1210} w={900} o={0.3} />
    </View>
    {/* the frame counter: this film's own frame number */}
    <Abs y={196} style={{display: 'flex', justifyContent: 'center', gap: 18, alignItems: 'baseline'}}>
      <span style={{fontFamily: mono, fontWeight: 800, fontSize: 58, color: P.white, letterSpacing: 2}}>f {pad4(f)}</span>
      {f >= p.b + 10 && <In f={f} at={p.b + 10} dy={0} dx={-20}><span style={{fontFamily: mono, fontWeight: 700, fontSize: 44, color: P.blue}}>= renderAt(t)</span></In>}
    </Abs>
    {/* "no editing software": an editor's timeline flies in and gets struck out */}
    {tl > 0 && <div style={{position: 'absolute', left: 190, top: 560, width: 700, height: 300, opacity: tl, transform: `scale(${0.9 + 0.1 * tl})`, background: '#2A2A30',
      borderRadius: 20, padding: 24, boxShadow: '0 30px 70px rgba(0,0,0,0.6)'}}>
      {[0, 1, 2].map((r) => <div key={r} style={{display: 'flex', gap: 8, marginBottom: 18}}>
        {[160, 90, 210, 120].map((w, j) => <div key={j} style={{width: w - r * 14, height: 60, borderRadius: 8, background: ['#5E8BDE', '#C9A04C', '#6CBF8A'][r], opacity: 0.85}} />)}
      </div>)}
      <div style={{position: 'absolute', left: 300, top: 0, width: 4, height: 300, background: P.white}} />
      <Cross p={ramp(f, p.a + 2, p.a + 12)} w={700} h={300} />
    </div>}
    <Abs y={1250} style={{textAlign: 'center', opacity: 1 - clamp((f - 150) / 10)}}>
      <Big size={64}>0 个视频模型</Big>
    </Abs>
    <Sticker x={210} y={140} p={pop(f, -10, 8)} rot={-3} size={34} bg={P.blue} color={P.white}>#Vibe知识大赏</Sticker>
  </>;
};
Hook.sfx = (cue) => {
  const p = hookPlan(cue);
  return [{at: p.a - 4, kind: 'whoosh-short', gain: 0.08}, {at: p.a + 4, kind: 'paper', gain: 0.08}, {at: p.b, kind: 'fs-whoosh-wipe', gain: 0.1}, {at: p.b + 10, kind: 'tick', gain: 0.08}];
};

/* ---------- 02 topic: the hashtag, the reported plays, a wall of vertical cards with the code-made ones lit ---------- */

const CARDS = ['v-hanazi', 'mg-19-paperclip', 'v-iso', 'mg-09-bauhaus', 'v-soft', 'mg-02-line-art', 'v-hud', 'mg-20-pixel'];
const topicPlan = (cue: Cue) => ({a: cue('a', 76), b: cue('b', 150)});
const Topic: Scene = () => null;
Topic.backdrop = ({f, cue}) => {
  const p = topicPlan(cue);
  const lit = ramp(f, p.b - 4, p.b + 10);
  const cam = camOf(f, [[0, {z: 1.04}, 120], [p.b - 4, {z: 0.98, y: 780}, 30]]);
  return <>
    <Bg c={P.night} f={f} dark />
    <View cam={cam} depth={0.8}>
      {CARDS.map((c, i) => {
        const col = i % 4, row = Math.floor(i / 4);
        const x = 40 + col * 255, y = 520 + row * 420;
        const on = [0, 1, 4].includes(i);
        const k = ease.outCubic(clamp((f + 8 - i * 3) / 14));
        return <div key={c} style={{position: 'absolute', left: x, top: y + (1 - k) * 80, width: 235, height: 400, borderRadius: 16, overflow: 'hidden', background: '#000',
          opacity: k * (on ? 1 : 1 - 0.65 * lit), boxShadow: on && lit > 0 ? `0 0 0 ${5 * lit}px ${P.blue}, 0 20px 40px rgba(0,0,0,0.5)` : '0 20px 40px rgba(0,0,0,0.5)'}}>
          <Footage f={f} segs={[{clip: c, src: 2 + (i % 3), from: -20}]} pos={i === 0 ? '50% 50%' : '45% 50%'} />
        </div>;
      })}
    </View>
    <Abs y={210} style={{textAlign: 'center'}}>
      <In f={f} at={0} dy={-60}><Big size={92}>#Vibe<span style={{color: P.blue}}>知识大赏</span></Big></In>
    </Abs>
    <Abs y={350} style={{display: 'flex', justifyContent: 'center', alignItems: 'baseline', gap: 10, opacity: f >= p.a - 6 ? 1 : 0}}>
      <Roll f={f} start={p.a - 6} land={p.a + 16} to={11.7} decimals={1} size={140} color={P.white} family={font} />
      <Big size={64}>亿次播放</Big>
    </Abs>
    <Sticker x={880} y={380} p={pop(f, p.a + 14, 8)} rot={6} size={34} bg={P.sand} color={P.night}>据报道</Sticker>
    {/* the code-made ones */}
    <svg width={W} height={1920} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
      <HandLine x1={760} y1={1305} x2={420} y2={1240} p={ramp(f, p.b + 8, p.b + 20)} color={P.blue} sw={6} head bend={0.2} />
    </svg>
    <div style={{position: 'absolute', left: 770, top: 1270, fontFamily: hand, fontSize: 52, color: P.blue, opacity: ramp(f, p.b + 14, p.b + 24), whiteSpace: 'nowrap', transform: 'rotate(-4deg)'}}>代码出片</div>
    <Top ch={0} />
  </>;
};
Topic.sfx = (cue) => {
  const p = topicPlan(cue);
  return [{at: 0, kind: 'thud', gain: 0.1}, {at: p.a + 16, kind: 'tick', gain: 0.09}, {at: p.b, kind: 'whoosh-short', gain: 0.07}];
};

/* ---------- 03 why: Anthropic's page, the Sep 22 entry, the quote, the cost bar ---------- */

/** A highlighter stroke growing under a run of text (k 0–1). */
const Mark: React.FC<{k: number; children: React.ReactNode}> = ({k, children}) => <span style={{backgroundImage: `linear-gradient(180deg, transparent 55%, rgba(222,115,86,0.45) 55%, rgba(222,115,86,0.45) 92%, transparent 92%)`,
  backgroundRepeat: 'no-repeat', backgroundSize: `${clamp(k) * 100}% 100%`}}>{children}</span>;

const whyPlan = (cue: Cue) => ({a: cue('a', 52), b: cue('b', 140), c: cue('c', 241)});
const Why: Scene = () => null;
Why.backdrop = ({f, cue}) => {
  const p = whyPlan(cue);
  // the page at full width, then the camera dives into the Opus 5.5 entry (image coords: entry x 593–1313, y 520–640)
  const z = ramp(f, p.a - 8, p.a + 18);
  const s = 0.52 + (1.32 - 0.52) * z;
  const left = -(560 * s - 40) * z, top = -(470 * s) * z;
  const hl = ramp(f, p.b - 2, p.b + 26);
  return <>
    <Bg c={P.ivory} f={f} />
    <Win x={40} y={200} w={1000} h={520} light title="anthropic.com/claude/opus">
      <div style={{position: 'absolute', left, top, width: 1920 * s, height: 1080 * s}}>
        <Img src={img('opus-page.png')} style={{width: '100%', height: '100%'}} />
      </div>
      <svg width={1000} height={520} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
        <HandRing cx={150} cy={95} rx={150} ry={46} p={ramp(f, p.a + 14, p.a + 28)} color={P.clay} sw={6} />
      </svg>
      <div style={{position: 'absolute', right: 20, bottom: 20}}><Chip f={f} at={p.a + 20} dark={false} color={P.ink}><span style={{color: P.clay}}>✳</span>2026.09.22</Chip></div>
    </Win>
    {/* the official sentence, set large (原文) */}
    <Abs x={60} y={800} w={960} style={{opacity: ramp(f, p.b - 10, p.b)}}>
      <div style={{background: P.white, borderRadius: 20, padding: '22px 30px', boxShadow: '0 20px 40px rgba(20,19,19,0.1)', fontFamily: '"Inter", ' + font, fontWeight: 700, fontSize: 42, lineHeight: 1.34, color: P.ink}}>
        <span style={{fontFamily: font, fontSize: 26, color: P.mute, marginRight: 12}}>原文</span>It performs <Mark k={hl}>at the level of Claude Fable 5.1</Mark> on most work and <Mark k={ramp(f, p.c - 2, p.c + 14)}>costs 40% less to run</Mark> than Opus 5.
      </div>
    </Abs>
    {/* cost to run: Opus 5 = 100 %, Opus 5.5 shrinks to 60 % */}
    <Abs x={90} y={1085} w={900} style={{opacity: ramp(f, p.c - 10, p.c)}}>
      {[['Opus 5', 1, P.grey], ['Opus 5.5', 1 - 0.4 * ramp(f, p.c, p.c + 18), P.clay]].map(([n, k, c], i) => (
        <div key={i} style={{display: 'flex', alignItems: 'center', gap: 20, marginBottom: 12}}>
          <div style={{width: 190, fontFamily: font, fontWeight: 800, fontSize: 36, color: P.ink}}>{n as string}</div>
          <div style={{width: 560 * (k as number), height: 46, borderRadius: 12, background: c as string}} />
          {i === 1 && f >= p.c + 10 && <span style={{fontFamily: font, fontWeight: 900, fontSize: 52, color: P.clay}}>−40%</span>}
        </div>
      ))}
      <div style={{fontFamily: font, fontWeight: 600, fontSize: 28, color: P.mute}}>$4 / $20 每百万 token（输入 / 输出）</div>
    </Abs>
    <Top ch={1} dark={false} />
  </>;
};
Why.sfx = (cue) => {
  const p = whyPlan(cue);
  return [{at: p.a - 6, kind: 'whoosh', gain: 0.08}, {at: p.a + 16, kind: 'paper', gain: 0.07}, {at: p.b, kind: 'tap', gain: 0.06}, {at: p.c + 14, kind: 'tick', gain: 0.08}];
};

/* ---------- 04 vincent: one prompt → one film; 01/15 … 15/15; the wall of all fifteen ---------- */

const SHOW = ['v-handmade', 'v-iso', 'v-flat', 'v-soft', 'v-hud', 'v-collage', 'mg-09-bauhaus', 'v-synth', 'mg-20-pixel'];
const vincentPlan = (cue: Cue) => ({a: cue('a', 48), b: cue('b', 103), c: cue('c', 156)});
const Vincent: Scene = () => null;
Vincent.backdrop = ({f, cue}) => {
  const p = vincentPlan(cue);
  const step = 6; // frames per style while flipping through
  const idx = f < p.b ? 0 : Math.min(SHOW.length - 1, Math.floor((f - p.b) / step));
  const count = f < p.b ? 1 : Math.min(15, 1 + Math.floor(((f - p.b) / (p.c - p.b)) * 14.99));
  const wall = f >= p.c;
  const cam = camOf(f, [[0, {z: 1.03}, p.b], [p.c - 4, {z: 0.97, y: 800}, 24]]);
  return <>
    <Bg c={P.night2} f={f} dark />
    <View cam={cam}>
      {/* the prompt card (the four headings of every mg-styles-15 prompt, from its flow chart) */}
      <div style={{position: 'absolute', left: 70, top: 190, width: 940, height: 250, borderRadius: 18, background: P.night, border: '2px solid rgba(216,213,199,0.18)', padding: '20px 30px'}}>
        <Code f={f} start={0} cps={2.6} size={30} color={P.sand} hl={[]} lines={['# Style        逐帧手绘 · Cel Animation', '# Output       1920×1080 · 24 fps · 10 s', '# Creative seed  火柴擦燃 → 火苗跳出来', '# Signature features  线条持续微抖 (boil)']} />
      </div>
      <svg width={W} height={1920} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
        <HandLine x1={540} y1={455} x2={540} y2={520} p={ramp(f, p.a - 6, p.a + 4)} color={P.terra} sw={7} head />
      </svg>
      <div style={{position: 'absolute', left: 60, top: 545, width: 960, height: 540, borderRadius: 18, overflow: 'hidden', background: '#000', opacity: ramp(f, p.a - 4, p.a + 6),
        boxShadow: '0 34px 70px rgba(0,0,0,0.55)', outline: `3px solid ${wall ? 'transparent' : 'rgba(194,108,74,0.6)'}`}}>
        {!wall && SHOW.map((c, i) => i === idx ? <Footage key={c} f={f} segs={[{clip: c, src: 2, from: i === 0 ? -10 : p.b + i * step}]} /> : null)}
        {wall && <Img src={img('mosaic.jpg')} style={{width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${1.02 + 0.06 * ramp(f, p.c, p.c + 90)})`}} />}
        <CaseTag who="Vincent" />
      </div>
    </View>
    <Abs x={70} y={1115} w={940} style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
      <span style={{fontFamily: mono, fontWeight: 800, fontSize: 64, color: P.terra, opacity: f >= p.a ? 1 : 0}}>{String(count).padStart(2, '0')}<span style={{color: 'rgba(216,213,199,0.6)', fontSize: 40}}> / 15</span></span>
      <In f={f} at={p.c + 6}><Chip f={f} at={p.c + 6}>0 生图 · 0 生视频</Chip></In>
    </Abs>
    <Top ch={1} />
  </>;
};
Vincent.sfx = (cue) => {
  const p = vincentPlan(cue);
  const ticks = Array.from({length: SHOW.length - 1}, (_, i) => ({at: p.b + (i + 1) * 6, kind: 'tick', gain: 0.045}));
  return [{at: 2, kind: 'tap', gain: 0.05}, {at: p.a - 4, kind: 'whoosh-short', gain: 0.08}, ...ticks, {at: p.c, kind: 'thud', gain: 0.1}];
};

/* ---------- 05 stars: the folder opens (prompt, source, film), 23 days, 2,065 stars ---------- */

const starsPlan = (cue: Cue) => ({a: cue('a', 71), b: cue('b', 108)});
const Stars: Scene = () => null;
Stars.backdrop = ({f, cue}) => {
  const p = starsPlan(cue);
  const open = ramp(f, 2, 14);
  const tags = [['PROMPT', '提示词'], ['SRC', '源码'], ['MP4', '成片']];
  const days = Math.round(23 * ramp(f, p.a - 4, p.a + 26));
  return <>
    <Bg c={P.night2} f={f} dark />
    {/* a folder, lid opening */}
    <div style={{position: 'absolute', left: 340, top: 300, width: 400, height: 280}}>
      <div style={{position: 'absolute', left: 0, top: 0, width: 170, height: 60, borderRadius: '14px 14px 0 0', background: '#A65A3D'}} />
      <div style={{position: 'absolute', left: 0, top: 40, width: 400, height: 240, borderRadius: 16, background: '#A65A3D'}} />
      <div style={{position: 'absolute', left: 0, top: 60, width: 400, height: 220, borderRadius: 16, background: P.terra, transformOrigin: '50% 100%',
        transform: `perspective(800px) rotateX(${-48 * open}deg)`, boxShadow: '0 -6px 20px rgba(0,0,0,0.3)'}} />
    </div>
    {tags.map(([k, v], i) => {
      const t = ease.outBack(clamp((f - 10 - i * 6) / 16), 1.4);
      const x = 540 + (i - 1) * 320 * t, y = 420 - 190 * t;
      return t <= 0 ? null : <div key={k} style={{position: 'absolute', left: x, top: y, transform: `translate(-50%, -50%) rotate(${(i - 1) * 6 * t}deg)`, background: P.night,
        border: `3px solid ${P.terra}`, borderRadius: 16, padding: '12px 24px', display: 'flex', gap: 14, alignItems: 'center', whiteSpace: 'nowrap'}}>
        <span style={{fontFamily: mono, fontWeight: 800, fontSize: 26, color: P.night, background: P.terra, borderRadius: 6, padding: '2px 10px'}}>{k}</span>
        <span style={{fontFamily: font, fontWeight: 800, fontSize: 40, color: P.sand}}>{v}</span>
      </div>;
    })}
    <Sticker x={800} y={560} p={pop(f, 30, 8)} rot={8} size={36} bg={P.sand} color={P.night}>MIT 开源</Sticker>
    {/* 23 days: a strip of day cells filling */}
    <Abs x={90} y={690} w={900}>
      <div style={{display: 'flex', gap: 6, opacity: ramp(f, p.a - 8, p.a)}}>
        {Array.from({length: 23}, (_, i) => <div key={i} style={{flex: 1, height: 46, borderRadius: 6, background: i < days ? P.terra : 'rgba(216,213,199,0.14)'}} />)}
      </div>
      <div style={{display: 'flex', justifyContent: 'space-between', marginTop: 12, fontFamily: mono, fontWeight: 700, fontSize: 32, color: 'rgba(216,213,199,0.75)', opacity: ramp(f, p.a - 8, p.a)}}>
        <span>10.02</span><span style={{color: P.sand}}>{days} 天</span><span>10.25</span>
      </div>
    </Abs>
    <Abs y={880} style={{display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 20, opacity: f >= p.b - 8 ? 1 : 0}}>
      <span style={{fontSize: 130, color: '#F2C14E'}}>★</span>
      <Roll f={f} start={p.b - 8} land={p.b + 18} to={2065} size={180} color={P.white} family={font} />
    </Abs>
    <Abs y={1100} style={{textAlign: 'center'}}><In f={f} at={p.b + 20}><Big size={34} w={600} c="rgba(216,213,199,0.7)">GitHub 星标 · 截至 10.25</Big></In></Abs>
    <Top ch={1} />
  </>;
};
Stars.sfx = (cue) => {
  const p = starsPlan(cue);
  return [{at: 2, kind: 'paper', gain: 0.08}, {at: 12, kind: 'tap', gain: 0.05}, {at: 18, kind: 'tap', gain: 0.05}, {at: 24, kind: 'tap', gain: 0.05}, {at: p.b + 18, kind: 'chime', gain: 0.08}];
};

/* ---------- 06 official: Claude Motion's own film, its own words ---------- */

const officialPlan = (cue: Cue) => ({a: cue('a', 55), b: cue('b', 105), c: cue('c', 148)});
const QUOTE = 'Claude writes each one as code, with no video model involved.';
const Official: Scene = () => null;
Official.backdrop = ({f, cue}) => {
  const p = officialPlan(cue);
  const cam = camOf(f, [[0, {z: 1.04, y: 700}, 90], [p.a, {z: 1, y: 760}, 20]]);
  const n = Math.floor(clamp((f - p.a) / 50) * QUOTE.length);
  const key = QUOTE.indexOf('no video model involved');
  const hl = ramp(f, p.b, p.b + 14);
  return <>
    <Bg c={P.ivory} f={f} />
    <View cam={cam}>
      <ContactShadow x={540} y={790} w={960} o={0.18} />
      <Win x={40} y={190} w={1000} h={562} light title="Claude Motion · beta" who="Claude 官方">
        <Footage f={f} segs={[{clip: 'motion', src: 45.5, from: 0}]} />
      </Win>
    </View>
    <Abs x={70} y={850} w={940}>
      <div style={{background: P.white, borderRadius: 20, padding: '26px 34px', boxShadow: '0 20px 40px rgba(20,19,19,0.1)', opacity: ramp(f, p.a - 6, p.a + 2),
        fontFamily: '"Inter", ' + font, fontWeight: 700, fontSize: 46, lineHeight: 1.32, color: P.ink}}>
        <span style={{color: P.clay, marginRight: 10}}>✳</span>
        {QUOTE.slice(0, n).split('').map((ch, i) => <span key={i} style={{background: i >= key && i < key + 23 && hl > 0 ? `rgba(222,115,86,${0.32 * hl})` : undefined}}>{ch}</span>)}
      </div>
    </Abs>
    <Abs y={1170} style={{display: 'flex', justifyContent: 'center', gap: 20}}>
      <Chip f={f} at={p.c} dark={false} color={P.ink}>代码 → MP4</Chip>
      <Chip f={f} at={p.c + 8} dark={false} color={P.mute} size={34}>团队版 beta</Chip>
    </Abs>
    <Top ch={1} dark={false} />
  </>;
};
Official.sfx = (cue) => {
  const p = officialPlan(cue);
  return [{at: 0, kind: 'whoosh-short', gain: 0.08}, {at: p.b + 4, kind: 'tap', gain: 0.07}, {at: p.c, kind: 'tick', gain: 0.07}];
};

/* ---------- 07 essence (signature): a web page is shot frame by frame into a film strip, the strip rolls into an mp4 ---------- */

const SHOTS = [30, 72, 108, 150, 192, 240];
const essencePlan = (cue: Cue) => ({a: cue('a', 54), b: cue('b', 88), c: cue('c', 128)});
const Essence: Scene = () => null;
Essence.backdrop = ({f, cue}) => {
  const p = essencePlan(cue);
  const btn = 1 - ramp(f, p.a - 12, p.a - 2);
  const win = ramp(f, p.a - 6, p.a + 8);
  const roll = ramp(f, p.c - 4, p.c + 26);
  const cam = camOf(f, [[p.a, {z: 1.04, y: 700}, 30], [p.b, {z: 1, y: 820}, 30], [p.c, {z: 1.03, x: 600, y: 860}, 40]]);
  return <>
    <Bg c={P.code} f={f} dark />
    {/* not a "generate video" button */}
    {btn > 0 && <div style={{position: 'absolute', left: 290, top: 560, width: 500, height: 150, borderRadius: 75, background: 'linear-gradient(90deg, #7B61FF, #C04CFD)', opacity: btn,
      display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: font, fontWeight: 900, fontSize: 56, color: P.white, boxShadow: '0 20px 50px rgba(123,97,255,0.35)'}}>
      ✦ 一键生成视频
      <Cross p={ramp(f, 6, 18)} w={500} h={150} />
    </div>}
    <View cam={cam}>
      <div style={{opacity: win}}>
        <Win x={90} y={220} w={900} h={506} title="index.html · renderAt(t)">
          <Footage f={f} segs={[{clip: 'mg-19-paperclip', src: 0.5, from: p.a - 8}]} />
        </Win>
      </div>
      {/* shutter flashes */}
      {SHOTS.map((_, i) => {
        const at = p.b + i * 6;
        const fl = f >= at && f < at + 4 ? 1 - (f - at) / 4 : 0;
        return fl > 0 ? <div key={i} style={{position: 'absolute', left: 90, top: 272, width: 900, height: 506, background: P.white, opacity: 0.55 * fl}} /> : null;
      })}
      {/* the film strip and the frames flying into it */}
      <div style={{position: 'absolute', left: 40 - 900 * roll, top: 870, width: 1000, height: 190, background: '#111216', borderRadius: 10, opacity: ramp(f, p.b - 6, p.b),
        clipPath: `inset(0 0 0 ${clamp(roll * 1.1) * 100}%)`}}>
        {Array.from({length: 22}, (_, i) => <React.Fragment key={i}>
          <div style={{position: 'absolute', left: 14 + i * 45, top: 8, width: 24, height: 14, borderRadius: 3, background: '#3A3E4C'}} />
          <div style={{position: 'absolute', left: 14 + i * 45, top: 168, width: 24, height: 14, borderRadius: 3, background: '#3A3E4C'}} />
        </React.Fragment>)}
      </div>
      {SHOTS.map((fr, i) => {
        const at = p.b + i * 6;
        const t = ease.inOutCubic(clamp((f - at) / 12));
        if (f < at) return null;
        const x0 = 540, y0 = 500, x1 = 52 + i * 162 + 70 - 900 * roll, y1 = 965;
        const x = x0 + (x1 - x0) * t, y = y0 + (y1 - y0) * t - Math.sin(t * Math.PI) * 120;
        const s = 1.4 - 1.0 * t;
        const gone = clamp(roll * 1.1) * 1000 > x1 + 900 * roll + 70 - 40 + 900 * roll ? 0 : 1;
        return <div key={fr} style={{position: 'absolute', left: x, top: y, width: 140 * s / 0.4 * 0.4, transform: `translate(-50%, -50%) scale(${s})`, opacity: gone}}>
          <div style={{width: 140, height: 79, borderRadius: 4, overflow: 'hidden', background: '#000', outline: `2px solid ${P.blue}`}}>
            <Img src={img(`pc-${i}.jpg`)} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
          </div>
          <div style={{fontFamily: mono, fontWeight: 700, fontSize: 18, color: P.blue, marginTop: 2}}>f {String(fr).padStart(3, '0')}</div>
        </div>;
      })}
      {/* the mp4 the strip rolls into */}
      <div style={{position: 'absolute', left: 820, top: 860, width: 190, height: 230, opacity: ramp(f, p.c - 10, p.c), transform: `scale(${1 + 0.08 * Math.exp(-Math.max(0, f - p.c - 26) / 5) * (f > p.c + 26 ? 1 : 0)})`}}>
        <div style={{position: 'absolute', inset: 0, background: P.white, borderRadius: 16, clipPath: 'polygon(0 0, 72% 0, 100% 22%, 100% 100%, 0 100%)'}} />
        <div style={{position: 'absolute', left: 0, right: 0, top: 80, textAlign: 'center', fontSize: 60, color: P.blue}}>▶</div>
        <div style={{position: 'absolute', left: 0, right: 0, bottom: 18, textAlign: 'center', fontFamily: mono, fontWeight: 800, fontSize: 30, color: P.code}}>.mp4</div>
      </div>
    </View>
    <Abs y={1160} style={{display: 'flex', justifyContent: 'center', gap: 20}}>
      <Chip f={f} at={p.a + 6}>网页</Chip>
      <Chip f={f} at={p.b + 6}>逐帧截图</Chip>
      <Chip f={f} at={p.c + 6} bg={P.blue}>ffmpeg</Chip>
    </Abs>
    <Top ch={2} />
  </>;
};
Essence.sfx = (cue) => {
  const p = essencePlan(cue);
  return [{at: 8, kind: 'paper', gain: 0.07}, {at: p.a - 4, kind: 'whoosh-short', gain: 0.07}, ...SHOTS.map((_, i) => ({at: p.b + i * 6, kind: 'tick', gain: 0.07})),
    {at: p.c, kind: 'fs-whoosh-wipe', gain: 0.1}, {at: p.c + 26, kind: 'chime', gain: 0.08}];
};

/* ---------- 08–11 the four steps (docs white; terminal windows) ---------- */

const Term: React.FC<{x: number; y: number; w: number; h: number; title?: string; children: React.ReactNode}> = ({x, y, w, h, title = 'Terminal', children}) => (
  <Win x={x} y={y} w={w} h={h} title={title} bg={P.code}><div style={{padding: '24px 30px'}}>{children}</div></Win>
);

const step1Plan = (cue: Cue) => ({a: cue('a', 40), b: cue('b', 123)});
const MODELS = ['Fable 5.1', 'Opus 5.5', 'Sonnet 5.5', 'Haiku 5.5'];
const Step1: Scene = () => null;
Step1.backdrop = ({f, cue}) => {
  const p = step1Plan(cue);
  const menu = ramp(f, p.b - 6, p.b + 4);
  const sel = f < p.b + 14 ? 0 : 1;
  const cam = camOf(f, [[0, {z: 1.03}, 60], [p.b - 6, {z: 1.03, y: 800}, 24]]);
  return <>
    <Bg c={P.white} f={f} />
    <StepNo n={1} f={f} />
    <Abs x={230} y={196} w={800}><Big size={56} c={P.code}>Claude Code</Big><Big size={30} w={600} c={P.mute} style={{marginTop: 6}}>空文件夹 · 命令行</Big></Abs>
    <View cam={cam}>
      <ContactShadow x={540} y={1170} w={940} o={0.2} />
      <Term x={60} y={380} w={960} h={760} title="~/my-video">
        <Code f={f} start={4} cps={2.2} prompt="$ " lines={['mkdir my-video && cd my-video']} />
        <Code f={f} start={p.a - 4} cps={1.4} prompt="$ " lines={['claude']} hl={[0]} />
        {f >= p.a + 8 && <div style={{marginTop: 14, border: `2px solid ${P.clay}`, borderRadius: 12, padding: '14px 20px', fontFamily: mono, fontWeight: 700, fontSize: 30, color: P.white}}>
          <span style={{color: P.clay}}>✻</span> Welcome to Claude Code</div>}
        {f >= p.b - 10 && <div style={{marginTop: 18}}><Code f={f} start={p.b - 10} cps={1.4} prompt="> " lines={['/model']} /></div>}
        {menu > 0 && <div style={{marginTop: 10, opacity: menu}}>
          {MODELS.map((m, i) => <div key={m} style={{fontFamily: mono, fontWeight: 700, fontSize: 34, lineHeight: 1.6, color: i === sel ? P.white : '#8A90A0',
            background: i === sel ? 'rgba(43,147,242,0.25)' : undefined, borderRadius: 8, padding: '0 14px'}}>{i === sel ? '❯ ' : '  '}{m}{i === 1 && f >= p.b + 20 ? '  ✓' : ''}</div>)}
        </div>}
      </Term>
    </View>
    <Top ch={3} dark={false} />
  </>;
};
Step1.sfx = (cue) => {
  const p = step1Plan(cue);
  return [{at: 0, kind: 'whoosh-short', gain: 0.07}, {at: p.a + 2, kind: 'tap', gain: 0.07}, {at: p.b + 14, kind: 'tick', gain: 0.07}, {at: p.b + 20, kind: 'tap', gain: 0.07}];
};

const step2Plan = (cue: Cue) => ({a: cue('a', 80)});
const Step2: Scene = () => null;
Step2.backdrop = ({f, cue}) => {
  const p = step2Plan(cue);
  const cam = camOf(f, [[0, {z: 1.02}, 60]]);
  return <>
    <Bg c={P.white} f={f} />
    <StepNo n={2} f={f} />
    <Abs x={230} y={196} w={800}><Big size={56} c={P.code}>Remotion</Big><Big size={30} w={600} c={P.mute} style={{marginTop: 6}}>+ 官方 Agent Skills</Big></Abs>
    <View cam={cam}>
      <Win x={60} y={370} w={960} h={420} light title="remotion.dev/docs/ai/claude-code">
        <Img src={img('remotion-docs.png')} style={{position: 'absolute', left: -330, top: -110, width: 1700}} />
      </Win>
    </View>
    <Abs x={60} y={840} w={960}>
      {[['npx create-video --yes --blank my-video', 4], ['npx remotion skills add', 40]].map(([c, at], i) => (
        <In key={i} f={f} at={at as number} dy={30} style={{marginBottom: 20}}>
          <div style={{background: P.code, borderRadius: 14, padding: '18px 26px', boxShadow: '0 16px 30px rgba(34,36,45,0.2)', borderLeft: `8px solid ${P.blue}`}}>
            <Code f={f} start={at as number} cps={2.4} prompt="$ " lines={[c as string]} size={32} />
          </div>
        </In>
      ))}
    </Abs>
    <Abs y={1175} style={{textAlign: 'center'}}><In f={f} at={p.a}><Chip f={f} at={p.a} dark={false}><span style={{color: P.blue, fontFamily: mono}}>2</span> 行</Chip></In></Abs>
    <Top ch={3} dark={false} />
  </>;
};
Step2.sfx = (cue) => [{at: 0, kind: 'whoosh-short', gain: 0.07}, {at: 4, kind: 'tap', gain: 0.06}, {at: 40, kind: 'tap', gain: 0.06}, {at: step2Plan(cue).a, kind: 'tick', gain: 0.08}];

const step3Plan = (cue: Cue) => ({a: cue('a', 51), b: cue('b', 89)});
const FILES = [['photo.jpg', 'st-6.jpg'], ['logo.png', 'st-3.jpg'], ['data.csv', '']];
const INSTALL = ['npm i remotion', 'install ffmpeg', 'npx remotion skills add'];
const Step3: Scene = () => null;
Step3.backdrop = ({f, cue}) => {
  const p = step3Plan(cue);
  return <>
    <Bg c={P.white} f={f} />
    <StepNo n={3} f={f} />
    <Abs x={230} y={196} w={800}><Big size={56} c={P.code}>提示词 + 素材</Big></Abs>
    {/* the prompt box */}
    <div style={{position: 'absolute', left: 60, top: 360, width: 960, minHeight: 330, borderRadius: 24, background: P.white, border: '3px solid #D5D9DE', boxShadow: '0 20px 40px rgba(34,36,45,0.1)', padding: '26px 32px'}}>
      <Code f={f} start={4} cps={2.2} size={30} color={P.code} lines={['You are the director, motion designer,', 'engineer and sound designer of ONE', '10-second motion-design film …']} />
      <div style={{display: 'flex', gap: 16, marginTop: 18}}>
        {FILES.map(([n, im], i) => {
          const at = p.a + i * 5;
          const t = ease.outCubic(clamp((f - at) / 12));
          return f < at ? null : <div key={n} style={{display: 'flex', alignItems: 'center', gap: 10, padding: '8px 16px 8px 8px', borderRadius: 12, background: P.paper,
            transform: `translateY(${(1 - t) * -260}px) rotate(${(1 - t) * (i - 1) * 14}deg)`, opacity: clamp(t * 2)}}>
            <div style={{width: 56, height: 56, borderRadius: 8, overflow: 'hidden', background: P.blue, color: P.white, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: mono, fontWeight: 800, fontSize: 18}}>
              {im ? <Img src={img(im)} style={{width: '100%', height: '100%', objectFit: 'cover'}} /> : 'CSV'}
            </div>
            <span style={{fontFamily: mono, fontWeight: 700, fontSize: 26, color: P.code}}>{n}</span>
          </div>;
        })}
      </div>
    </div>
    <Term x={60} y={760} w={960} h={330} title="Claude Code">
      {INSTALL.map((l, i) => {
        const at = p.b - 6 + i * 9;
        return f < at ? null : <div key={l} style={{fontFamily: mono, fontWeight: 600, fontSize: 32, lineHeight: 1.7, color: '#D7DBE2', display: 'flex', justifyContent: 'space-between'}}>
          <span><span style={{color: P.clay}}>⏺ </span>{l}</span><span style={{color: P.blue, opacity: f >= at + 6 ? 1 : 0}}>✓</span></div>;
      })}
    </Term>
    <Top ch={3} dark={false} />
  </>;
};
Step3.sfx = (cue) => {
  const p = step3Plan(cue);
  return [{at: 0, kind: 'whoosh-short', gain: 0.07}, ...[0, 1, 2].map((i) => ({at: p.a + i * 5 + 10, kind: 'tap', gain: 0.06})), ...[0, 1, 2].map((i) => ({at: p.b + i * 9, kind: 'tick', gain: 0.06}))];
};

const step4Plan = (cue: Cue) => ({a: cue('a', 42), b: cue('b', 79)});
const Step4: Scene = () => null;
Step4.backdrop = ({f, cue}) => {
  const p = step4Plan(cue);
  const prog = ramp(f, 0, p.a);
  const cam = camOf(f, [[p.b - 6, {z: 1.04, y: 820}, 30]]);
  return <>
    <Bg c={P.white} f={f} />
    <StepNo n={4} f={f} />
    <Abs x={230} y={196} w={800}><Big size={56} c={P.code}>渲染</Big></Abs>
    <Abs x={60} y={360} w={960} style={{opacity: 1 - ramp(f, p.b - 6, p.b + 4)}}>
      <div style={{fontFamily: mono, fontWeight: 700, fontSize: 32, color: P.code, marginBottom: 14, display: 'flex', justifyContent: 'space-between'}}>
        <span>Rendering frame {Math.round(450 * prog)} / 450</span><span style={{color: P.blue}}>{Math.round(prog * 100)}%</span></div>
      <div style={{height: 34, borderRadius: 17, background: P.paper, overflow: 'hidden'}}><div style={{width: `${prog * 100}%`, height: '100%', background: P.blue}} /></div>
    </Abs>
    {/* the one-line prompt (X7, original) */}
    <Abs x={60} y={480} w={960} style={{opacity: ramp(f, p.a - 4, p.a + 6)}}>
      <div style={{background: P.code, borderRadius: 18, padding: '20px 28px', fontFamily: mono, fontWeight: 600, fontSize: 30, lineHeight: 1.45, color: '#D7DBE2'}}>
        <span style={{color: P.blue}}>&gt; </span>make a dynamic 15-second motion graphics video that shows what an incredible motion designer you are</div>
    </Abs>
    <View cam={cam}>
      <div style={{opacity: ramp(f, p.b - 6, p.b + 4)}}>
        <Win x={60} y={720} w={960} h={540} who="创作者作品">
          <Footage f={f} segs={[{clip: 'oneline', src: 0, from: p.b - 6}]} />
        </Win>
      </div>
    </View>
    <Sticker x={930} y={720} p={pop(f, p.b + 10, 8)} rot={6} size={40} bg={P.blue} color={P.white}>15 s</Sticker>
    <Top ch={3} dark={false} />
  </>;
};
Step4.sfx = (cue) => {
  const p = step4Plan(cue);
  return [{at: 0, kind: 'whoosh-short', gain: 0.07}, {at: p.a, kind: 'chime', gain: 0.07}, {at: p.b - 4, kind: 'whoosh', gain: 0.08}];
};

/* ---------- 12–16 the prompt: one long file, scanned into three blocks, each zoomed ---------- */

const BLOCKS = [
  {c: P.grey, head: '# Role & bar', lines: ['You are the director, motion designer,', 'engineer and sound designer of ONE', '10-second motion-design film.', 'A clean, template-looking result is a fail.']},
  {c: P.blue, head: '# Creative seed', lines: ['topic:   「手作魔法」火柴擦燃', 'palette: 火柴盒红 · 纸黄', 'shots:   火苗跳出来、跳舞']},
  {c: P.terra, head: '# Signature features', lines: ['线条持续微抖 (boil)', '一拍二 / 一拍三', '纸张底纹 · 手绘描边']},
];
/** The prompt file: three blocks, the `focus` block large (0 = none). `k` how far the scan has split it (0–1). */
const PromptFile: React.FC<{f: number; k: number; focus?: number; swap?: (i: number, j: number) => React.ReactNode; children?: React.ReactNode}> = ({k, focus = 0, swap, children}) => (
  <div style={{position: 'absolute', left: 60, top: 200, width: 960, height: 1060, borderRadius: 22, background: P.dark, boxShadow: '0 30px 70px rgba(0,0,0,0.45)', padding: '22px 30px', overflow: 'hidden'}}>
    <div style={{fontFamily: mono, fontWeight: 800, fontSize: 28, color: '#8A90A0', marginBottom: 16}}>prompt.md</div>
    {BLOCKS.map((b, i) => {
      const on = focus === 0 || focus === i + 1;
      const t = clamp(k * 3 - i);
      return <div key={i} style={{position: 'relative', borderRadius: 14, marginBottom: 20, padding: '16px 22px', border: `3px solid ${t > 0 ? b.c : 'transparent'}`,
        background: t > 0 ? `${b.c}1A` : 'transparent', opacity: on ? 1 : 0.28}}>
        <div style={{fontFamily: mono, fontWeight: 800, fontSize: 30, color: b.c === P.grey ? P.white : b.c, marginBottom: 6}}>{b.head}</div>
        {b.lines.map((l, j) => <div key={j} style={{fontFamily: mono, fontWeight: 600, fontSize: 28, lineHeight: 1.5, color: '#C9CED6', whiteSpace: 'pre'}}>{swap?.(i, j) ?? l}</div>)}
        {t > 0 && <div style={{position: 'absolute', right: -6, top: -6, width: 64, height: 64, borderRadius: 32, background: b.c, color: i === 1 ? P.white : P.code,
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: font, fontWeight: 900, fontSize: 40, transform: `scale(${t})`}}>{i + 1}</div>}
      </div>;
    })}
    <div style={{fontFamily: mono, fontWeight: 800, fontSize: 30, color: P.white, marginTop: 6}}>Done means:</div>
    {children}
  </div>
);

const promptPlan = (cue: Cue) => ({a: cue('a', 76)});
const Prompt: Scene = () => null;
Prompt.backdrop = ({f, cue}) => {
  const p = promptPlan(cue);
  const k = ramp(f, p.a - 20, p.a + 24);
  const cam = camOf(f, [[0, {z: 0.94}, 1], [2, {z: 1}, 60]]);
  return <>
    <Bg c={P.code} f={f} dark />
    <View cam={cam}>
      <PromptFile f={f} k={k} />
      <ScanLine y={200 + 1060 * k} w={1080} o={k > 0 && k < 1 ? 1 : 0} />
    </View>
    <Top ch={4} />
  </>;
};
Prompt.sfx = (cue) => [{at: 0, kind: 'paper', gain: 0.07}, {at: promptPlan(cue).a - 20, kind: 'fs-whoosh-wipe', gain: 0.1}];

/** Zoom on one block of the prompt file: the camera centres it. */
const blockCam = (f: number, i: number) => camOf(f, [[0, {z: 1.1}, 30]], {x: 540, y: [520, 700, 820][i], z: 1.02});

const block1Plan = (cue: Cue) => ({a: cue('a', 58), b: cue('b', 149)});
const ROLES = ['DIRECTOR', 'MOTION', 'ENGINEER', 'SOUND'];
const Block1: Scene = () => null;
Block1.backdrop = ({f, cue}) => {
  const p = block1Plan(cue);
  return <>
    <Bg c={P.code} f={f} dark />
    <View cam={blockCam(f, 0)}><PromptFile f={f} k={1} focus={1} /></View>
    {/* four badges for the four jobs */}
    <Abs x={40} y={760} w={1000} style={{display: 'flex', justifyContent: 'center', gap: 16}}>
      {ROLES.map((r, i) => {
        const pp = pop(f, p.a - 6 + i * 6, 10);
        return pp < -0.5 ? null : <div key={r} style={{width: 228, height: 150, borderRadius: 16, background: P.white, transform: `scale(${Math.max(0, pp)}) rotate(${(i - 1.5) * 3}deg)`,
          boxShadow: '0 16px 30px rgba(0,0,0,0.4)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6}}>
          <div style={{width: 50, height: 10, borderRadius: 5, background: P.grey}} />
          <span style={{fontFamily: mono, fontWeight: 800, fontSize: 30, color: P.code}}>{r}</span>
          <span style={{fontFamily: mono, fontWeight: 700, fontSize: 22, color: P.blue}}>Opus 5.5</span>
        </div>;
      })}
    </Abs>
    <Stamp x={540} y={1050} f={f} at={p.b + 6} size={110} color={P.red} rot={-7}>FAIL</Stamp>
    <Abs y={1170} style={{textAlign: 'center', opacity: ramp(f, p.b + 12, p.b + 20)}}><Big size={34} w={600} c="rgba(255,255,255,0.65)">= 模板味的成片</Big></Abs>
    <Top ch={4} />
  </>;
};
Block1.sfx = (cue) => {
  const p = block1Plan(cue);
  return [...ROLES.map((_, i) => ({at: p.a - 6 + i * 6, kind: 'tap', gain: 0.06})), {at: p.b + 6, kind: 'stamp', gain: 0.13}];
};

const block2Plan = (cue: Cue) => ({a: cue('a', 47), b: cue('b', 128)});
const SEEDS = [['「手作魔法」火柴擦燃', '你的知识点'], ['火柴盒红 · 纸黄', '素材里的颜色'], ['火苗跳出来、跳舞', '你的画面']];
const Block2: Scene = () => null;
Block2.backdrop = ({f, cue}) => {
  const p = block2Plan(cue);
  return <>
    <Bg c={P.code} f={f} dark />
    <View cam={blockCam(f, 1)}><PromptFile f={f} k={1} focus={2} swap={(i, j) => {
      if (i !== 1) return undefined;
      const [old, nu] = SEEDS[j], at = p.a + j * 14;
      const sw = ramp(f, at, at + 8), nb = ramp(f, at + 8, at + 16);
      return <span>{['topic:   ', 'palette: ', 'shots:   '][j]}
        <span style={{position: 'relative', opacity: 1 - 0.5 * sw}}>{old}<span style={{position: 'absolute', left: 0, top: '50%', height: 4, width: `${sw * 100}%`, background: P.blue}} /></span>
        {nb > 0 && <span style={{marginLeft: 14, fontFamily: font, fontWeight: 900, color: P.white, background: P.blue, borderRadius: 8, padding: '0 10px', opacity: nb}}>{nu}</span>}
      </span>;
    }} /></View>
    {/* the pencil only ever touches this block */}
    <div style={{position: 'absolute', left: 860 + 20 * Math.sin(f / 5), top: 560 + 14 * Math.cos(f / 4), fontSize: 90, transform: 'rotate(-20deg)', opacity: ramp(f, p.b - 4, p.b + 6), color: P.blue}}>✎</div>
    <Top ch={4} />
  </>;
};
Block2.sfx = (cue) => {
  const p = block2Plan(cue);
  return [0, 1, 2].map((i) => ({at: p.a + i * 14 + 8, kind: 'tap', gain: 0.06})).concat([{at: p.b, kind: 'tick', gain: 0.07}]);
};

const block3Plan = (cue: Cue) => ({a: cue('a', 58), b: cue('b', 110)});
const Block3: Scene = () => null;
Block3.backdrop = ({f, cue}) => {
  const p = block3Plan(cue);
  const shut = ramp(f, p.a - 4, p.a + 6);
  const press = f >= p.b && f < p.b + 6 ? 1 : 0;
  const shake = f >= p.b + 6 ? 14 * Math.exp(-(f - p.b - 6) / 5) * Math.sin((f - p.b) * 1.6) : 0;
  return <>
    <Bg c={P.code} f={f} dark />
    <View cam={blockCam(f, 2)}><PromptFile f={f} k={1} focus={3} /></View>
    {/* a padlock closing over the block */}
    <div style={{position: 'absolute', left: 820, top: 560, width: 150, height: 190, transform: `translateX(${shake}px)`, opacity: ramp(f, p.a - 12, p.a - 4)}}>
      <div style={{position: 'absolute', left: 30, top: 10 - 30 * (1 - shut), width: 90, height: 100, borderRadius: '45px 45px 0 0', border: `16px solid ${P.sand}`, borderBottom: 'none'}} />
      <div style={{position: 'absolute', left: 0, top: 90, width: 150, height: 110, borderRadius: 18, background: P.terra, boxShadow: '0 16px 30px rgba(0,0,0,0.4)'}} />
      <div style={{position: 'absolute', left: 66, top: 130, width: 18, height: 34, borderRadius: 9, background: P.night}} />
    </div>
    {/* the delete key bounces off it */}
    <Abs x={0} y={1010} style={{display: 'flex', justifyContent: 'center', opacity: ramp(f, p.b - 10, p.b - 2)}}>
      <div style={{width: 260, height: 120, borderRadius: 20, background: '#F3F4F6', boxShadow: press ? '0 2px 0 #9AA0A8' : '0 12px 0 #9AA0A8', transform: `translateY(${press ? 10 : 0}px) translateX(${shake}px)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: mono, fontWeight: 800, fontSize: 44, color: P.code, position: 'relative'}}>
        ⌫ Delete
        {f >= p.b + 6 && <div style={{position: 'absolute', right: -40, top: -40, width: 70, height: 70, borderRadius: 35, background: P.red, color: P.white, display: 'flex',
          alignItems: 'center', justifyContent: 'center', fontSize: 44, fontWeight: 900}}>✕</div>}
      </div>
    </Abs>
    <Top ch={4} />
  </>;
};
Block3.sfx = (cue) => {
  const p = block3Plan(cue);
  return [{at: p.a + 4, kind: 'thud', gain: 0.1}, {at: p.b, kind: 'tap', gain: 0.08}, {at: p.b + 6, kind: 'tick', gain: 0.08}];
};

const donePlan = (cue: Cue) => ({a: cue('a', 50), b: cue('b', 102)});
const DONE = ['10.000 s · 1080×1920 · mp4', '手机上每个字都看得清', '音效卡在画面的节拍上'];
const Done: Scene = () => null;
Done.backdrop = ({f, cue}) => {
  const p = donePlan(cue);
  const cam = camOf(f, [[0, {z: 1.14}, 40]], {x: 540, y: 1000, z: 1.06});
  return <>
    <Bg c={P.code} f={f} dark />
    <View cam={cam}>
      <PromptFile f={f} k={1}>
        {DONE.map((d, i) => {
          const at = [p.a - 6, p.a + 14, p.b][i];
          const ok = f >= at + 8;
          return <div key={i} style={{display: 'flex', alignItems: 'center', gap: 16, marginTop: 10, opacity: ramp(f, at - 6, at)}}>
            <div style={{width: 40, height: 40, borderRadius: 8, border: `4px solid ${ok ? P.blue : '#8A90A0'}`, background: ok ? P.blue : 'transparent', color: P.white,
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30, fontWeight: 900}}>{ok ? '✓' : ''}</div>
            <span style={{fontFamily: font, fontWeight: 700, fontSize: 32, color: ok ? P.white : '#C9CED6'}}>{d}</span>
          </div>;
        })}
      </PromptFile>
    </View>
    <Abs x={600} y={330} w={420}><In f={f} at={8}><div style={{fontFamily: hand, fontSize: 40, color: P.blue, transform: 'rotate(-4deg)', textAlign: 'right'}}>（示意）</div></In></Abs>
    <Top ch={4} />
  </>;
};
Done.sfx = (cue) => {
  const p = donePlan(cue);
  return [p.a + 2, p.a + 22, p.b + 8].map((at) => ({at, kind: 'tick', gain: 0.08}));
};

/* ---------- 17–19 the first draft fails; the second AI judges; the scores ---------- */

const failPlan = (cue: Cue) => ({a: cue('a', 47), b: cue('b', 128), c: cue('c', 171)});
const Paddle: React.FC = () => <svg width={260} height={300} viewBox="0 0 260 300">
  <ellipse cx={130} cy={110} rx={95} ry={100} fill={P.red} stroke={P.code} strokeWidth={8} />
  <rect x={112} y={200} width={36} height={90} rx={12} fill="#B98A5A" stroke={P.code} strokeWidth={8} />
</svg>;
const Fail: Scene = () => null;
Fail.backdrop = ({f, cue}) => {
  const p = failPlan(cue);
  const two = ramp(f, p.c - 6, p.c + 6);
  return <>
    <Bg c={P.white} f={f} />
    <Sticker x={300} y={210} p={pop(f, 2, 8)} rot={-3} size={36} bg={P.code} color={P.white}>据作者实测 · 第一版</Sticker>
    {/* mismatch: the caption card vs the picture */}
    <div style={{position: 'absolute', left: 60, top: 300, width: 960, height: 520, opacity: 1 - 0.75 * two, transform: `scale(${1 - 0.2 * two}) translateY(${-180 * two}px)`, transformOrigin: '50% 0'}}>
      <div style={{position: 'absolute', left: 0, top: 40, width: 440, height: 440, borderRadius: 20, background: P.code, display: 'flex', alignItems: 'center', justifyContent: 'center',
        opacity: ramp(f, p.a - 6, p.a + 4), boxShadow: '0 20px 40px rgba(34,36,45,0.2)'}}>
        <span style={{fontFamily: font, fontWeight: 900, fontSize: 72, color: P.white}}>用手掌打</span>
        <span style={{position: 'absolute', left: 20, top: 16, fontFamily: mono, fontSize: 24, color: '#8A90A0'}}>字卡</span>
      </div>
      <div style={{position: 'absolute', left: 520, top: 40, width: 440, height: 440, borderRadius: 20, background: P.paper, display: 'flex', alignItems: 'center', justifyContent: 'center',
        opacity: ramp(f, p.b - 6, p.b + 4), boxShadow: '0 20px 40px rgba(34,36,45,0.12)'}}>
        <Paddle />
        <span style={{position: 'absolute', left: 20, top: 16, fontFamily: mono, fontSize: 24, color: P.mute}}>画面</span>
      </div>
      <div style={{position: 'absolute', left: 445, top: 200, width: 70, textAlign: 'center', fontFamily: font, fontWeight: 900, fontSize: 90, color: P.red, opacity: ramp(f, p.b + 8, p.b + 14)}}>≠</div>
      <svg width={960} height={520} style={{position: 'absolute', inset: 0, overflow: 'visible'}}><HandRing cx={740} cy={260} rx={210} ry={210} p={ramp(f, p.b + 10, p.b + 24)} color={P.red} sw={7} /></svg>
    </div>
    {/* white on white with a white stroke: unreadable */}
    <div style={{position: 'absolute', left: 160, top: 640, width: 760, height: 460, borderRadius: 20, overflow: 'hidden', opacity: two, background: '#F1EFEA', boxShadow: '0 20px 40px rgba(34,36,45,0.15)'}}>
      <Img src={img('st-6.jpg')} style={{width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(1.6) saturate(0.3)'}} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 150, textAlign: 'center', fontFamily: font, fontWeight: 900, fontSize: 120, color: P.white, WebkitTextStroke: '6px #FFFFFF',
        textShadow: '0 0 30px rgba(255,255,255,0.9)'}}>柔软的光</div>
      <Cross p={ramp(f, p.c + 16, p.c + 28)} w={760} h={460} />
    </div>
    <Top ch={5} dark={false} />
  </>;
};
Fail.sfx = (cue) => {
  const p = failPlan(cue);
  return [{at: p.a - 4, kind: 'tap', gain: 0.06}, {at: p.b - 4, kind: 'tap', gain: 0.06}, {at: p.b + 10, kind: 'thud', gain: 0.1}, {at: p.c + 16, kind: 'paper', gain: 0.08}];
};

const juryPlan = (cue: Cue) => ({a: cue('a', 67), b: cue('b', 105), c: cue('c', 143)});
const RUBRIC: [string, number][] = [['风格', 7.8], ['惊艳', 6.9], ['动效', 7.6], ['排版', 7.1], ['质感', 8.0], ['声音', 7.4], ['技术', 7.9]];
const Jury: Scene = () => null;
Jury.backdrop = ({f, cue}) => {
  const p = juryPlan(cue);
  const slide = f * 3;
  const th = ramp(f, p.c - 4, p.c + 8);
  const sc = 64;
  return <>
    <Bg c={P.white} f={f} />
    {/* the contact strip: one screenshot every 0.5 s */}
    <div style={{position: 'absolute', left: 0, top: 210, width: W, height: 200, overflow: 'hidden', opacity: ramp(f, p.a - 10, p.a)}}>
      <div style={{position: 'absolute', left: 40 - (slide % 1600), top: 20, display: 'flex', gap: 14}}>
        {Array.from({length: 20}, (_, i) => <div key={i} style={{width: 240, height: 135, borderRadius: 8, overflow: 'hidden', flex: 'none', boxShadow: '0 8px 16px rgba(34,36,45,0.18)'}}>
          <Img src={img(`st-${i % 10}.jpg`)} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
        </div>)}
      </div>
      <div style={{position: 'absolute', left: 40, bottom: 4, fontFamily: mono, fontWeight: 700, fontSize: 26, color: P.mute}}>0.0s · 0.5s · 1.0s · 1.5s · 2.0s …</div>
    </div>
    {/* seven rows */}
    <Abs x={80} y={470} w={920}>
      {RUBRIC.map(([k, v], i) => {
        const at = p.b - 6 + i * 4;
        const fill = ramp(f, at, at + 14);
        const low = v < 7.5;
        const col = low && th > 0.5 ? P.red : P.blue;
        return <div key={k} style={{position: 'relative', display: 'flex', alignItems: 'center', height: 92, opacity: ramp(f, at - 4, at)}}>
          <span style={{width: 170, fontFamily: font, fontWeight: 800, fontSize: 44, color: P.code}}>{k}</span>
          <div style={{width: v * sc * fill, height: 44, borderRadius: 10, background: col}} />
          <span style={{marginLeft: 16, fontFamily: mono, fontWeight: 800, fontSize: 40, color: col}}>{(v * fill).toFixed(1)}</span>
          {low && f >= p.c + 10 && <span style={{marginLeft: 16, fontSize: 40, color: P.red, fontWeight: 900}}>↻</span>}
        </div>;
      })}
      {/* the 7.5 line */}
      <div style={{position: 'absolute', left: 170 + 7.5 * sc, top: -20, width: 5, height: 92 * 7 + 30, background: P.code, opacity: th}} />
      <div style={{position: 'absolute', left: 170 + 7.5 * sc - 40, top: -66, fontFamily: mono, fontWeight: 800, fontSize: 40, color: P.code, opacity: th}}>7.5</div>
    </Abs>
    <Abs x={600} y={1210} w={420}><In f={f} at={p.b + 20}><div style={{fontFamily: hand, fontSize: 36, color: P.mute, textAlign: 'right'}}>分数为示意</div></In></Abs>
    <Top ch={5} dark={false} />
  </>;
};
Jury.sfx = (cue) => {
  const p = juryPlan(cue);
  return [{at: p.a - 8, kind: 'whoosh-short', gain: 0.07}, ...RUBRIC.map((_, i) => ({at: p.b - 6 + i * 4, kind: 'tick', gain: 0.04})), {at: p.c + 4, kind: 'thud', gain: 0.1}];
};

const scoresPlan = (cue: Cue) => ({a: cue('a', 25), b: cue('b', 89), c: cue('c', 124), d: cue('d', 187)});
const Scores: Scene = () => null;
Scores.backdrop = ({f, cue}) => {
  const p = scoresPlan(cue);
  const v = f < p.a ? 5.4 : f < p.b - 30 ? 5.4 + 0.7 * ramp(f, p.a + 10, p.a + 24) : 6.1 + 0.9 * ramp(f, p.b - 14, p.b + 4);
  const x0 = 90, w = 900, sx = (s: number) => x0 + (s / 10) * w;
  const cam = camOf(f, [[p.c - 6, {z: 1.05, y: 800}, 30]]);
  return <>
    <Bg c={P.white} f={f} />
    <Sticker x={300} y={210} p={pop(f, 0, 8)} rot={-3} size={36} bg={P.terra} color={P.white}>据作者实测 · 拼贴风</Sticker>
    <Abs y={300} style={{display: 'flex', justifyContent: 'center', alignItems: 'baseline', gap: 16}}>
      <span style={{fontFamily: font, fontWeight: 900, fontSize: 230, color: v >= 6.95 ? P.blue : P.code, fontVariantNumeric: 'tabular-nums'}}>{v.toFixed(1)}</span>
      <span style={{fontFamily: font, fontWeight: 800, fontSize: 60, color: P.mute}}>/ 10</span>
    </Abs>
    <View cam={cam}>
      {/* the ruler */}
      <div style={{position: 'absolute', left: x0, top: 760, width: w, height: 16, borderRadius: 8, background: P.paper}} />
      <div style={{position: 'absolute', left: x0, top: 760, width: (v / 10) * w, height: 16, borderRadius: 8, background: P.blue}} />
      {Array.from({length: 11}, (_, i) => <React.Fragment key={i}>
        <div style={{position: 'absolute', left: sx(i) - 2, top: 740, width: 4, height: 56, background: i === 6 || i === 8 ? P.code : '#C5CAD1'}} />
        <div style={{position: 'absolute', left: sx(i) - 30, top: 806, width: 60, textAlign: 'center', fontFamily: mono, fontWeight: 700, fontSize: 32, color: P.mute}}>{i}</div>
      </React.Fragment>)}
      {/* the round markers: 5.4 → 6.1 → 7.0 */}
      {[[5.4, 0], [6.1, p.a + 18], [7.0, p.b]].map(([s, at], i) => f < at ? null : <div key={i} style={{position: 'absolute', left: sx(s) - 22, top: 700, width: 44, height: 44, borderRadius: 22,
        background: i === 2 ? P.blue : P.white, border: `5px solid ${P.blue}`, transform: `scale(${Math.max(0, pop(f, at, 8))})`}} />)}
      {/* 6 and 8: what the numbers mean */}
      {[[6, p.c, 'tmpl'], [8, p.d, 'pro']].map(([s, at, kind]) => {
        const pp = pop(f, at as number, 10);
        return pp < -0.5 ? null : <div key={kind as string} style={{position: 'absolute', left: sx(s as number) - 120, top: 880, width: 240, transform: `scale(${Math.max(0, pp)})`, transformOrigin: '50% 0'}}>
          <svg width={240} height={60} style={{display: 'block'}}><HandLine x1={120} y1={58} x2={120} y2={4} p={1} color={P.code} sw={5} head /></svg>
          <div style={{background: kind === 'tmpl' ? P.paper : P.code, borderRadius: 16, padding: '18px 10px', textAlign: 'center', boxShadow: '0 14px 30px rgba(34,36,45,0.15)'}}>
            {kind === 'tmpl'
              ? <div style={{display: 'grid', gridTemplateColumns: 'repeat(3, 40px)', gap: 8, justifyContent: 'center'}}>{Array.from({length: 6}, (_, i) => <div key={i} style={{height: 30, borderRadius: 4, background: P.grey}} />)}</div>
              : <div style={{fontSize: 70, lineHeight: 1, color: '#F2C14E'}}>🏆</div>}
            <div style={{fontFamily: font, fontWeight: 900, fontSize: 40, color: kind === 'tmpl' ? P.code : P.white, marginTop: 10}}>{s as number} 分</div>
          </div>
        </div>;
      })}
    </View>
    <Top ch={5} dark={false} />
  </>;
};
Scores.sfx = (cue) => {
  const p = scoresPlan(cue);
  return [{at: p.a + 18, kind: 'tick', gain: 0.08}, {at: p.b, kind: 'chime', gain: 0.08}, {at: p.c, kind: 'tap', gain: 0.07}, {at: p.d, kind: 'tap', gain: 0.07}];
};

/* ---------- 20–24 my own four habits (the account's films, really made this way) ---------- */

const OWN_CODE = [
  ['// kimi-k3-1-pro.tsx', 'const scanY = ease(t) * 563;', '<Footage clip="dragon" />', '<Roll to={3600} />', '<ScanLine y={scanY} />'],
  ['// agent-compute-hijack-v3.tsx', 'const cam = camAt(f, keys);', '<Layer depth={0.6}>', '<ContactShadow />', '<Ground horizon />'],
];
const minePlan = (cue: Cue) => ({a: cue('a', 35), b: cue('b', 96)});
const Mine: Scene = () => null;
Mine.backdrop = ({f, cue}) => {
  const p = minePlan(cue);
  const cam = camOf(f, [[0, {z: 1.03}, 80], [p.b - 4, {z: 0.96, y: 700}, 24]]);
  return <>
    <Bg c={P.code} f={f} dark />
    <View cam={cam}>
      {['own-kimi', 'own-hijack'].map((c, i) => {
        const x = 90 + i * 470, y = 200;
        const k = 0.55 * ease.inOutCubic(clamp((f - p.a - i * 8) / 22));
        return <div key={c} style={{position: 'absolute', left: x, top: y, width: 430, height: 764, borderRadius: 44, background: '#0B0B0E', padding: 14, boxShadow: '0 30px 60px rgba(0,0,0,0.55)', transform: `rotate(${(i - 0.5) * 4}deg)`}}>
          <div style={{position: 'relative', width: 402, height: 736, borderRadius: 32, overflow: 'hidden', background: '#000'}}>
            <Footage f={f} segs={[{clip: c, src: 0.5, from: -10}]} />
            <CodeSide k={k} lines={OWN_CODE[i]} size={22} />
            <ScanLine y={736 * k} w={402} o={k > 0 && k < 1 ? 1 : 0} />
          </div>
        </div>;
      })}
      <ContactShadow x={540} y={1010} w={900} o={0.35} />
    </View>
    <Abs y={1070} style={{display: 'flex', justifyContent: 'center', gap: 22}}>
      {[1, 2, 3, 4].map((n, i) => {
        const pp = pop(f, p.b + i * 4, 10);
        return pp < -0.5 ? null : <div key={n} style={{width: 120, height: 120, borderRadius: 20, background: P.blue, color: P.white, display: 'flex', alignItems: 'center',
          justifyContent: 'center', fontFamily: font, fontWeight: 900, fontSize: 70, transform: `scale(${Math.max(0, pp)})`}}>{n}</div>;
      })}
    </Abs>
    <Sticker x={250} y={170} p={pop(f, -6, 8)} rot={-4} size={32} bg={P.white} color={P.code}>本号作品</Sticker>
    <Top ch={6} />
  </>;
};
Mine.sfx = (cue) => {
  const p = minePlan(cue);
  return [{at: p.a, kind: 'fs-whoosh-wipe', gain: 0.1}, ...[0, 1, 2, 3].map((i) => ({at: p.b + i * 4, kind: 'tap', gain: 0.06}))];
};

/** The habit's number at top-left on the four habit scenes. */
const HabitNo: React.FC<{n: number; f: number}> = ({n, f}) => <div style={{position: 'absolute', left: 70, top: 170, display: 'flex', gap: 12}}>
  {[1, 2, 3, 4].map((i) => <div key={i} style={{width: 70, height: 70, borderRadius: 14, background: i === n ? P.blue : 'rgba(255,255,255,0.1)', color: i === n ? P.white : 'rgba(255,255,255,0.4)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: font, fontWeight: 900, fontSize: 40, transform: i === n ? `scale(${Math.max(0, pop(f, -6, 10))})` : undefined}}>{i}</div>)}
</div>;

const m1Plan = (cue: Cue) => ({a: cue('a', 42), b: cue('b', 93)});
const ROWS: [string, string, string][] = [['hook', '片墙 → 翻成代码', 'st-0.jpg'], ['essence', '网页 → 胶片 → mp4', 'pc-2.jpg'], ['block3', '锁 + Delete 弹回', 'st-3.jpg'], ['scores', '刻度尺 5.4 → 7.0', 'st-5.jpg']];
const M1: Scene = () => null;
M1.backdrop = ({f, cue}) => {
  const p = m1Plan(cue);
  const sec = Math.min(2, ((f - p.b) / 30) * 1.0);
  return <>
    <Bg c={P.code} f={f} dark />
    <HabitNo n={1} f={f} />
    <Abs x={60} y={290} w={960}>
      <div style={{background: P.white, borderRadius: 20, overflow: 'hidden', boxShadow: '0 30px 60px rgba(0,0,0,0.45)'}}>
        <div style={{display: 'flex', background: P.paper, padding: '14px 24px', fontFamily: mono, fontWeight: 800, fontSize: 28, color: P.mute}}>
          <span style={{width: 190}}>scene</span><span style={{flex: 1}}>画面：道具做了什么</span><span style={{width: 200, textAlign: 'right'}}>pic</span></div>
        {ROWS.map(([id, what, im], i) => {
          const at = p.a - 10 + i * 10;
          return <div key={id} style={{display: 'flex', alignItems: 'center', padding: '14px 24px', borderTop: `2px solid ${P.paper}`, opacity: ramp(f, at - 6, at),
            background: f >= at && f < at + 10 ? 'rgba(43,147,242,0.10)' : undefined}}>
            <span style={{width: 190, fontFamily: mono, fontWeight: 800, fontSize: 30, color: P.blue}}>{id}</span>
            <span style={{flex: 1, fontFamily: font, fontWeight: 800, fontSize: 36, color: P.code}}>{what}</span>
            <div style={{width: 200, height: 112, borderRadius: 8, overflow: 'hidden', transform: `scale(${Math.max(0, pop(f, at + 4, 8))})`}}><Img src={img(im)} style={{width: '100%', height: '100%', objectFit: 'cover'}} /></div>
          </div>;
        })}
      </div>
    </Abs>
    {/* a stopwatch: pure text may sit for at most 2 s */}
    <Abs y={1040} style={{display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 26, opacity: ramp(f, p.b - 6, p.b + 2)}}>
      <svg width={130} height={130} viewBox="0 0 130 130"><circle cx={65} cy={70} r={52} fill="none" stroke={P.white} strokeWidth={8} />
        <rect x={55} y={4} width={20} height={14} rx={3} fill={P.white} />
        <path d={`M65 70 L${65 + 44 * Math.sin((sec / 2) * Math.PI * 2)} ${70 - 44 * Math.cos((sec / 2) * Math.PI * 2)}`} stroke={P.blue} strokeWidth={8} strokeLinecap="round" /></svg>
      <span style={{fontFamily: font, fontWeight: 900, fontSize: 100, color: P.white}}>≤ 2<span style={{fontSize: 56}}> 秒</span></span>
    </Abs>
    <Top ch={6} />
  </>;
};
M1.sfx = (cue) => {
  const p = m1Plan(cue);
  return [...[0, 1, 2, 3].map((i) => ({at: p.a - 10 + i * 10, kind: 'tap', gain: 0.05})), {at: p.b, kind: 'tick', gain: 0.08}];
};

const m2Plan = (cue: Cue) => ({a: cue('a', 57)});
const SWATCH: [string, number, number][] = [['#FFFFFF', 640, 360], ['#22242D', 640, 560], ['#2B93F2', 470, 300], ['#B4BCC5', 180, 380]];
const M2: Scene = () => null;
M2.backdrop = ({f, cue}) => {
  const p = m2Plan(cue);
  // the dropper visits each sample point on the screenshot (window coords) and drops a swatch
  const seg = (i: number) => ramp(f, 4 + i * 11, 12 + i * 11);
  let dx = 900, dy = 200;
  SWATCH.forEach(([, x, y], i) => { const t = seg(i); dx += (x - dx) * t; dy += (y - dy) * t; });
  const bad = ramp(f, p.a - 4, p.a + 6);
  return <>
    <Bg c={P.code} f={f} dark />
    <HabitNo n={2} f={f} />
    <Win x={60} y={290} w={960} h={540} light title="素材截图">
      <Img src={img('remotion-docs.png')} style={{position: 'absolute', left: 0, top: 0, width: 960}} />
      <div style={{position: 'absolute', left: dx - 10, top: dy - 70, fontSize: 70, transform: 'rotate(-30deg)', opacity: f < 50 ? 1 : 1 - ramp(f, 50, 56)}}>💧</div>
    </Win>
    <Abs x={60} y={880} w={960} style={{display: 'flex', gap: 18}}>
      {SWATCH.map(([c], i) => {
        const pp = pop(f, 12 + i * 11, 10);
        return pp < -0.5 ? null : <div key={c} style={{flex: 1, transform: `scale(${Math.max(0, pp)})`}}>
          <div style={{height: 150, borderRadius: 16, background: c, border: '3px solid rgba(255,255,255,0.25)'}} />
          <div style={{fontFamily: mono, fontWeight: 800, fontSize: 30, color: P.white, marginTop: 8, textAlign: 'center'}}>{c}</div>
        </div>;
      })}
    </Abs>
    {/* the invented one is crossed out */}
    <Abs x={330} y={1110} w={420} style={{opacity: bad}}>
      <div style={{position: 'relative', height: 120, borderRadius: 16, background: 'linear-gradient(90deg, #6A5AE0, #2CB5E8)'}}>
        <Cross p={ramp(f, p.a + 4, p.a + 14)} w={420} h={120} />
        <span style={{position: 'absolute', left: 0, right: 0, top: 30, textAlign: 'center', fontFamily: font, fontWeight: 800, fontSize: 40, color: P.white}}>紫蓝渐变</span>
      </div>
    </Abs>
    <Top ch={6} />
  </>;
};
M2.sfx = (cue) => [...[0, 1, 2, 3].map((i) => ({at: 12 + i * 11, kind: 'tap', gain: 0.06})), {at: m2Plan(cue).a + 4, kind: 'paper', gain: 0.08}];

const m3Plan = (cue: Cue) => ({a: cue('a', 64), b: cue('b', 106)});
const ECHO_THIS = 1; // node scripts/qa/echo.mjs vibe-opus-video-tutorial: 5 of 368 on-screen characters repeat the narration (1 %)
const M3: Scene = () => null;
M3.backdrop = ({f, cue}) => {
  const p = m3Plan(cue);
  return <>
    <Bg c={P.code} f={f} dark />
    <HabitNo n={3} f={f} />
    <Term x={40} y={290} w={1000} h={720} title="qa">
      <Code f={f} start={2} cps={3} size={30} prompt="$ " lines={['node scripts/qa/echo.mjs ai-same-take…']} />
      {f >= 24 && <div style={{marginTop: 18}}>
        <div style={{fontFamily: font, fontWeight: 700, fontSize: 34, color: '#C9CED6'}}>上屏字里复述口播的比例</div>
        <div style={{display: 'flex', alignItems: 'center', gap: 20, marginTop: 12}}>
          <div style={{position: 'relative', flex: 1, height: 46, borderRadius: 10, background: 'rgba(255,255,255,0.08)'}}>
            <div style={{width: `${45 * ramp(f, 26, 44)}%`, height: '100%', borderRadius: 10, background: P.red}} />
            <div style={{position: 'absolute', left: '33.3%', top: -10, width: 4, height: 66, background: P.white}} />
          </div>
          <span style={{fontFamily: mono, fontWeight: 900, fontSize: 52, color: P.red, width: 210}}>{Math.round(45 * ramp(f, 26, 44))}% ✗</span>
        </div>
      </div>}
      {f >= p.a - 10 && <div style={{marginTop: 14, fontFamily: mono, fontWeight: 800, fontSize: 30, color: P.red, opacity: ramp(f, p.a - 10, p.a)}}>FAIL  &gt; 1/3</div>}
      {f >= p.b - 18 && <div style={{marginTop: 30}}>
        <Code f={f} start={p.b - 18} cps={3} size={30} prompt="$ " lines={['node scripts/qa/echo.mjs 这一支']} />
        <div style={{display: 'flex', alignItems: 'center', gap: 20, marginTop: 12}}>
          <div style={{position: 'relative', flex: 1, height: 46, borderRadius: 10, background: 'rgba(255,255,255,0.08)'}}>
            <div style={{width: `${Math.max(1, ECHO_THIS) * ramp(f, p.b - 6, p.b + 6)}%`, height: '100%', borderRadius: 10, background: P.blue}} />
            <div style={{position: 'absolute', left: '33.3%', top: -10, width: 4, height: 66, background: P.white}} />
          </div>
          <span style={{fontFamily: mono, fontWeight: 900, fontSize: 52, color: P.blue, width: 210, opacity: ramp(f, p.b - 2, p.b + 6)}}>{ECHO_THIS}% ✓</span>
        </div>
      </div>}
    </Term>
    <Top ch={6} />
  </>;
};
M3.sfx = (cue) => {
  const p = m3Plan(cue);
  return [{at: 44, kind: 'thud', gain: 0.09}, {at: p.b + 6, kind: 'chime', gain: 0.08}];
};

const m4Plan = (cue: Cue) => ({a: cue('a', 58)});
const WORDS: [string, number][] = [['四，', 0.14], ['配音', 0.44], ['用', 0.78], ['我', 0.9], ['自己', 1.05], ['的', 1.3], ['声音', 1.42]];
const M4: Scene = () => null;
M4.backdrop = ({f, cue}) => {
  const p = m4Plan(cue);
  const t = f / 30;
  const cursor = 90 + clamp(t / 4.8) * 900;
  return <>
    <Bg c={P.code} f={f} dark />
    <HabitNo n={4} f={f} />
    {/* waveform */}
    <svg width={W} height={400} style={{position: 'absolute', left: 0, top: 420}}>
      {Array.from({length: 90}, (_, i) => {
        const x = 90 + i * 10;
        const amp = (0.25 + 0.75 * Math.abs(Math.sin(i * 0.7) * Math.sin(i * 0.23 + 1))) * 150;
        return <rect key={i} x={x} y={200 - amp / 2} width={6} height={amp} rx={3} fill={x < cursor ? P.blue : 'rgba(255,255,255,0.22)'} />;
      })}
      <rect x={cursor} y={20} width={4} height={360} fill={P.white} />
    </svg>
    {/* one tick per word, with its time */}
    <Abs x={0} y={330} w={W}>
      {WORDS.map(([w, s], i) => {
        const x = 120 + (s / 1.45) * 840;
        return <div key={i} style={{position: 'absolute', left: x, top: 0, opacity: t >= s ? 1 : 0.25, textAlign: 'center', transform: 'translateX(-50%)'}}>
          <div style={{fontFamily: font, fontWeight: 900, fontSize: 44, color: P.white, whiteSpace: 'nowrap'}}>{w}</div>
          <div style={{fontFamily: mono, fontWeight: 700, fontSize: 22, color: P.blue}}>{s.toFixed(2)}s</div>
        </div>;
      })}
    </Abs>
    {/* a cue lands and a prop pops on that exact frame */}
    <Abs x={0} y={880} w={W} style={{display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 30}}>
      <span style={{fontFamily: mono, fontWeight: 800, fontSize: 40, color: '#C9CED6', opacity: ramp(f, p.a - 12, p.a - 4)}}>{'{a}'} = {(p.a / 30).toFixed(2)}s</span>
    </Abs>
    <Stamp x={540} y={1060} f={f} at={p.a} size={84} color={P.blue} rot={-6}>卡点</Stamp>
    <Abs y={1170} style={{textAlign: 'center'}}><In f={f} at={p.a + 14}><Chip f={f} at={p.a + 14}>MiniMax · 逐字时间戳</Chip></In></Abs>
    <Top ch={6} />
  </>;
};
M4.sfx = (cue) => [{at: m4Plan(cue).a, kind: 'stamp', gain: 0.12}];

/* ---------- 25–26 other models also work ---------- */

const othersPlan = (cue: Cue) => ({a: cue('a', 50), b: cue('b', 133), c: cue('c', 186), d: cue('d', 223)});
const Others: Scene = () => null;
Others.backdrop = ({f, cue}) => {
  const p = othersPlan(cue);
  const cmp = ramp(f, p.b - 8, p.b + 6);
  const hl = ramp(f, 10, 34);
  return <>
    <Bg c={P.white} f={f} />
    {/* Remotion's own line: it works with several coding agents (image coords: line y ≈ 423, x 358–1081) */}
    <Win x={40} y={200} w={1000} h={300} light title="remotion.dev" style={{opacity: 1 - 0.6 * cmp}}>
      <div style={{position: 'absolute', left: -340 * 1.35 + 40, top: -330 * 1.35, width: 1920 * 1.35}}>
        <Img src={img('remotion-docs.png')} style={{width: '100%'}} />
        <div style={{position: 'absolute', left: 358 * 1.35, top: 410 * 1.35, width: 725 * 1.35 * hl, height: 28 * 1.35, background: 'rgba(43,147,242,0.25)'}} />
      </div>
    </Win>
    {/* two cards: Opus 5.5 and DeepSeek */}
    {[['Opus 5.5', P.clay, '$6', '约 20 分钟'], ['DeepSeek', P.ds, '$0.23', '约 1 小时']].map(([n, c, cost, time], i) => {
      const at = i === 0 ? p.a - 10 : p.a;
      const pp = pop(f, at, 12);
      return pp < -0.5 ? null : <div key={n} style={{position: 'absolute', left: 60 + i * 500, top: 560, width: 460, height: 560, borderRadius: 24, background: P.white,
        border: `4px solid ${c}`, boxShadow: '0 24px 50px rgba(34,36,45,0.14)', transform: `scale(${Math.max(0, pp)})`, padding: '26px 30px'}}>
        <div style={{fontFamily: font, fontWeight: 900, fontSize: 56, color: c}}>{n}</div>
        <div style={{fontFamily: mono, fontWeight: 700, fontSize: 26, color: P.mute, marginTop: 4}}>Claude Code · Remotion</div>
        <div style={{marginTop: 40, opacity: cmp}}>
          <div style={{fontFamily: font, fontWeight: 900, fontSize: i === 1 ? 120 * (1 + 0.15 * ramp(f, p.c, p.c + 8) - 0.15 * ramp(f, p.c + 8, p.c + 16)) : 110, color: i === 1 && f >= p.c ? P.ds : P.code, lineHeight: 1}}>{cost}</div>
          <div style={{fontFamily: font, fontWeight: 800, fontSize: 44, color: P.code, marginTop: 20}}>{time}</div>
        </div>
        {i === 1 && <svg width={460} height={560} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
          <HandRing cx={150} cy={440} rx={40} ry={34} p={ramp(f, p.d, p.d + 10)} color={P.red} sw={6} />
          <HandRing cx={320} cy={470} rx={36} ry={30} p={ramp(f, p.d + 6, p.d + 16)} color={P.red} sw={6} seed={3} />
        </svg>}
        {i === 1 && <div style={{position: 'absolute', left: 30, bottom: 26, fontFamily: hand, fontSize: 40, color: P.red, opacity: ramp(f, p.d + 10, p.d + 20)}}>几处小错</div>}
      </div>;
    })}
    <Sticker x={540} y={540} p={pop(f, p.b, 8)} rot={-2} size={34} bg={P.code} color={P.white}>同题对比 · 据作者 Marcel 自述</Sticker>
    <Top ch={7} dark={false} />
  </>;
};
Others.sfx = (cue) => {
  const p = othersPlan(cue);
  return [{at: p.a - 10, kind: 'tap', gain: 0.06}, {at: p.a, kind: 'tap', gain: 0.06}, {at: p.b, kind: 'whoosh-short', gain: 0.07}, {at: p.c, kind: 'tick', gain: 0.08}, {at: p.d, kind: 'paper', gain: 0.07}];
};

const budgetPlan = (cue: Cue) => ({a: cue('a', 67)});
const Budget: Scene = () => null;
Budget.backdrop = ({f, cue}) => {
  const p = budgetPlan(cue);
  const l = ramp(f, 0, 30), r = ramp(f, p.a - 6, p.a + 20);
  return <>
    <Bg c={P.white} f={f} />
    {/* a fork in the road, drawn as two paths from one point */}
    <svg width={W} height={1300} style={{position: 'absolute', left: 0, top: 0}}>
      <path d="M540 1220 C 540 980, 300 900, 280 640" fill="none" stroke={P.ds} strokeWidth={22} strokeLinecap="round" strokeDasharray="1400" strokeDashoffset={1400 * (1 - l)} />
      <path d="M540 1220 C 540 980, 780 900, 800 640" fill="none" stroke={P.clay} strokeWidth={22} strokeLinecap="round" strokeDasharray="1400" strokeDashoffset={1400 * (1 - r)} />
      <circle cx={540} cy={1220} r={26} fill={P.code} />
    </svg>
    {[[280, 'DeepSeek', '草稿 · 练习 · 跑批量', P.ds, 20], [800, 'Opus 5.5', '交付 · 接单 · 赶时间', P.clay, p.a + 6]].map(([x, n, d, c, at]) => {
      const pp = pop(f, at as number, 12);
      return pp < -0.5 ? null : <div key={n as string} style={{position: 'absolute', left: (x as number) - 230, top: 300, width: 460, transform: `scale(${Math.max(0, pp)})`,
        background: P.white, border: `4px solid ${c}`, borderRadius: 22, padding: '24px 20px', textAlign: 'center', boxShadow: '0 20px 40px rgba(34,36,45,0.12)'}}>
        <div style={{fontFamily: font, fontWeight: 900, fontSize: 58, color: c as string}}>{n}</div>
        <div style={{fontFamily: font, fontWeight: 800, fontSize: 36, color: P.code, marginTop: 10}}>{d}</div>
      </div>;
    })}
    <Top ch={7} dark={false} />
  </>;
};
Budget.sfx = (cue) => [{at: 20, kind: 'tap', gain: 0.06}, {at: budgetPlan(cue).a + 6, kind: 'tap', gain: 0.06}];

/* ---------- 27 end (held): 10 s → AI judge → ×2 → long; the frame card flips back; the counter stops on this film's last frame ---------- */

const endPlan = (cue: Cue) => ({a: cue('a', 31), b: cue('b', 94), c: cue('c', 160)});
const End: Scene = () => null;
End.backdrop = ({f, cue, dur}) => {
  const p = endPlan(cue);
  const global = TOTAL_FRAMES - dur + f;
  const flip = 1 - ease.inOutCubic(clamp((f - p.c - 20) / 20));
  const nodes: [string, number][] = [['10 s', p.a], ['AI 评委', p.b], ['×2', p.b + 24], ['长片', p.c]];
  return <>
    <Bg c={P.code} f={f} dark />
    {/* the route */}
    <Abs x={60} y={230} w={960} style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
      {nodes.map(([n, at], i) => <React.Fragment key={n}>
        <div style={{opacity: ramp(f, at - 4, at + 4), transform: `scale(${Math.max(0, pop(f, at, 10))})`, minWidth: 150, padding: '18px 20px', borderRadius: 18, textAlign: 'center',
          background: i === 3 ? P.blue : 'rgba(255,255,255,0.1)', border: '3px solid rgba(255,255,255,0.2)', fontFamily: font, fontWeight: 900, fontSize: 44, color: P.white, whiteSpace: 'nowrap'}}>{n}</div>
        {i < 3 && <div style={{flex: 1, height: 6, margin: '0 10px', background: P.blue, transformOrigin: '0 50%', transform: `scaleX(${ramp(f, nodes[i + 1][1] - 10, nodes[i + 1][1])})`}} />}
      </React.Fragment>)}
    </Abs>
    {/* the frame card, back to its picture side */}
    <div style={{position: 'absolute', left: 90, top: 420, width: 900, height: 506, borderRadius: 20, overflow: 'hidden', background: '#000', boxShadow: '0 34px 70px rgba(0,0,0,0.55)'}}>
      <Img src={img('mosaic.jpg')} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
      <CodeSide k={flip} lines={['// 这一支', 'export const End: Scene = …', `TOTAL_FRAMES = ${TOTAL_FRAMES}`, 'renderAt(t) → f ' + pad4(global)]} size={34} />
      <ScanLine y={506 * flip} w={900} o={flip > 0 && flip < 1 ? 1 : 0} />
      <CaseTag who="Vincent" />
    </div>
    <Abs y={990} style={{display: 'flex', justifyContent: 'center', alignItems: 'baseline', gap: 20}}>
      <span style={{fontFamily: mono, fontWeight: 800, fontSize: 84, color: P.white}}>f {pad4(global)}</span>
      <span style={{fontFamily: font, fontWeight: 700, fontSize: 36, color: 'rgba(255,255,255,0.6)'}}>/ {TOTAL_FRAMES}</span>
    </Abs>
    <Abs y={1130} style={{textAlign: 'center'}}><In f={f} at={p.c + 30}><Big size={52}>这一支 · <span style={{color: P.blue}}>0</span> 个视频模型</Big></In></Abs>
    <Top ch={8} />
  </>;
};
End.sfx = (cue) => {
  const p = endPlan(cue);
  return [{at: p.a, kind: 'tap', gain: 0.07}, {at: p.b, kind: 'tap', gain: 0.07}, {at: p.b + 24, kind: 'tap', gain: 0.07}, {at: p.c, kind: 'thud', gain: 0.1}, {at: p.c + 22, kind: 'fs-whoosh-wipe', gain: 0.09}];
};

/** Cover anchor (880 × 800, rendered at f = 0): four code-made films in a 2 × 2, the top-right one half flipped to its code. */
const Cover: Scene = () => <div style={{position: 'absolute', inset: 0, overflow: 'hidden', borderRadius: 24, background: P.code}}>
  {['st-3.jpg', 'st-6.jpg', 'st-4.jpg', 'st-7.jpg'].map((s, i) => <div key={s} style={{position: 'absolute', left: (i % 2) * 446, top: Math.floor(i / 2) * 406, width: 434, height: 394, borderRadius: 14, overflow: 'hidden'}}>
    <Img src={img(s)} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
    {i === 1 && <CodeSide k={0.55} lines={['renderAt(t)', 'ctx.draw(f)', 'ffmpeg -i …']} size={30} />}
    {i === 1 && <ScanLine y={394 * 0.55} w={434} />}
  </div>)}
</div>;

export const vibeOpusVideoTutorialScenes: Record<string, Scene> = {
  'vot.hook': Hook, 'vot.topic': Topic, 'vot.why': Why, 'vot.vincent': Vincent, 'vot.stars': Stars, 'vot.official': Official, 'vot.essence': Essence,
  'vot.step1': Step1, 'vot.step2': Step2, 'vot.step3': Step3, 'vot.step4': Step4, 'vot.prompt': Prompt, 'vot.block1': Block1, 'vot.block2': Block2,
  'vot.block3': Block3, 'vot.done': Done, 'vot.fail': Fail, 'vot.jury': Jury, 'vot.scores': Scores, 'vot.mine': Mine, 'vot.m1': M1, 'vot.m2': M2,
  'vot.m3': M3, 'vot.m4': M4, 'vot.others': Others, 'vot.budget': Budget, 'vot.end': End, 'vot.cover': Cover,
};
