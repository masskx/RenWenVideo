import React from 'react';
import {Img, Loop, OffthreadVideo, staticFile} from 'remotion';
import {clamp, ease} from '../../fx';
import {font} from '../theme';
import {inter, jet} from '../fonts';
import {Scene} from '../paper';

// openai-images-2-6-gif, made on the template lemo/dark-keynote (docs/video-craft/prompt-library/vendor/lemomo-ai__
// lemo-opuscar/3961ddb/styles/dark-keynote/STYLE.md; picked by prompt-library/选用指南.md §〇: a software launch). OpenAI's
// Images 2.6 (2026-11-04): native GIFs in ChatGPT, 50 % faster (official), Flare in the API as little as six seconds at
// quality=low, 4 billion images a week (OpenAI's own figure). Inputs: inputs/openai-images-2-6-gif/ (materials.md, sources.md,
// review.md). Storyboard: tutorials/openai-images-2-6-gif.storyboard.md.
// - Depth (user, 2026-11-04: explanations "felt quite basic"): how a GIF is made in the official examples — one image with
//   6 frames in a 3 × 2 grid, played in order, frame 6 drawn to lead back into frame 1, so it loops. The sheet here is the
//   6 real frames of OpenAI's OpenArt example GIF, laid out as its prompt asks.
// - Template kept: near-black stage, hairline 48 px grid, one cool glow, vignette; three dark surface steps with 1 px
//   borders; one accent (light) only for loop / play / the key numbers; captions as a toast; snap-grid landings with a
//   small back overshoot; digits that scramble and lock; light reveal. Changes: accent = OpenAI's Flare card sky blue
//   #52BDF7 (x-flare-sunburst.jpg); the official GIFs live inside the drawn windows; the native "generated accumulation"
//   is swapped for the sprite sheet that folds into a loop (the signature); evidence windows with a source line in the
//   corner (from lemo/living-screencast).
// - Review: numbers marked 官方口径 / OpenAI 自述; six seconds always with quality=low; Flare / Sunburst are API models;
//   "反应图", never 表情包 as an official word; no latency-video seconds read out; no faces from _excluded; no access talk.

const K = {bg: '#07090F', s1: '#121A2B', s2: '#18223A', s3: '#1F2B47', ink: '#EEF3FA', ink2: '#A9B6CC', ink3: '#6F7E98', accent: '#52BDF7'};
const GLOW = (a = 0.55) => `0 0 28px rgba(82,189,247,${a}), 0 0 80px rgba(82,189,247,${a * 0.45})`;
const V = (n: string) => staticFile(`video/openai-images-2-6-gif/${n}`);
const I = (n: string) => staticFile(`images/openai-images-2-6-gif/${n}`);
const back = (t: number) => ease.outBack(clamp(t), 1.3);
const eo = (f: number, a: number, d = 8) => ease.outCubic(clamp((f - a) / d));
const make = (draw: NonNullable<Scene['backdrop']>, sfx?: Scene['sfx']): Scene => {
  const S: Scene = () => null;
  S.backdrop = draw; S.sfx = sfx;
  return S;
};

/* ---------- stage, windows, badges ---------- */

/** Near-black stage: radial lift at the upper centre, one cool glow off-centre, a 48 px hairline grid, a vignette. `dim` darkens it. */
const Stage: React.FC<{children?: React.ReactNode; dim?: number; push?: number; origin?: string}> = ({children, dim = 0, push = 1, origin = '50% 40%'}) => (
  <div style={{position: 'absolute', inset: 0, overflow: 'hidden', background: `radial-gradient(ellipse 90% 60% at 50% 20%, #13203A 0%, ${K.bg} 70%)`}}>
    <div style={{position: 'absolute', left: -200, top: 300, width: 900, height: 900, borderRadius: '50%', background: 'radial-gradient(circle, rgba(82,189,247,0.07), transparent 70%)'}} />
    <svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0}}>
      {Array.from({length: 23}, (_, i) => <line key={`v${i}`} x1={i * 48} y1={0} x2={i * 48} y2={1920} stroke="#fff" strokeOpacity={i % 4 ? 0.03 : 0.06} />)}
      {Array.from({length: 41}, (_, i) => <line key={`h${i}`} x1={0} y1={i * 48} x2={1080} y2={i * 48} stroke="#fff" strokeOpacity={i % 4 ? 0.03 : 0.06} />)}
    </svg>
    <div style={{position: 'absolute', inset: 0, transformOrigin: origin, transform: `scale(${push})`}}>{children}</div>
    {dim > 0 && <div style={{position: 'absolute', inset: 0, background: `rgba(7,9,15,${dim})`, pointerEvents: 'none'}} />}
    <div style={{position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 80% 70% at 50% 45%, transparent 55%, rgba(0,0,0,0.55) 100%)'}} />
  </div>
);
/** A window drawn in code: title bar with a small glyph and a mono file name, raised surface, 1 px border; drops in with a small bounce. */
const Win: React.FC<{f: number; at?: number; x: number; y: number; w: number; h: number; title: string; status?: React.ReactNode; children?: React.ReactNode; lit?: number; bar?: number}> = ({
  f, at = -99, x, y, w, h, title, status, children, lit = 0, bar = 40,
}) => {
  if (f < at) return null;
  const p = back((f - at) / 9);
  return <div style={{position: 'absolute', left: x, top: y + (1 - p) * 40, width: w, height: h + bar, opacity: clamp((f - at) / 4), transformOrigin: '50% 100%', transform: `scale(${0.94 + 0.06 * p})`,
    borderRadius: 18, background: K.s1, border: `1px solid ${lit ? K.accent : 'rgba(255,255,255,0.08)'}`, boxShadow: `0 24px 60px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.08)${lit ? `, ${GLOW(0.35 * lit)}` : ''}`, overflow: 'hidden'}}>
    <div style={{height: bar, display: 'flex', alignItems: 'center', gap: 12, padding: '0 16px', background: K.s2, borderBottom: '1px solid rgba(255,255,255,0.06)'}}>
      <div style={{width: 14, height: 14, borderRadius: 4, border: `2px solid ${K.ink3}`}} />
      <div style={{fontFamily: jet, fontSize: 24, color: K.ink2, letterSpacing: 1, whiteSpace: 'nowrap'}}>{title}</div>
      <div style={{flex: 1}} />
      {status}
    </div>
    <div style={{position: 'relative', width: w, height: h, overflow: 'hidden', background: '#0B111D'}}>{children}</div>
  </div>;
};
/** A looping clip (muted), filling its box. */
const Clip: React.FC<{src: string; frames: number; rate?: number; fit?: 'cover' | 'contain'; pos?: string; startFrom?: number}> = ({src, frames, rate = 1, fit = 'cover', pos = '50% 50%', startFrom = 0}) => (
  <Loop durationInFrames={Math.max(1, Math.round(frames / rate))}>
    <OffthreadVideo src={V(src)} muted playbackRate={rate} trimBefore={startFrom} style={{position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: fit, objectPosition: pos}} />
  </Loop>
);
/** The accent loop badge: the film's living element. */
const LoopBadge: React.FC<{f: number; at: number; text?: string; size?: number}> = ({f, at, text = 'GIF', size = 30}) => {
  if (f < at) return null;
  const s = back((f - at) / 8), spin = ((f - at) * 6) % 360;
  return <div style={{display: 'inline-flex', alignItems: 'center', gap: 8, padding: '4px 14px', borderRadius: 999, background: 'rgba(82,189,247,0.14)', border: `1px solid ${K.accent}`,
    boxShadow: GLOW(0.4), transform: `scale(${s})`, transformOrigin: '100% 50%'}}>
    <span style={{fontFamily: inter, fontWeight: 600, fontSize: size, color: K.accent}}>{text}</span>
    <span style={{display: 'inline-block', fontFamily: inter, fontSize: size, color: K.accent, transform: `rotate(${spin}deg)`}}>↻</span>
  </div>;
};
const Src: React.FC<{text: string; y: number; f?: number; at?: number; x?: number}> = ({text, y, f = 0, at = -99, x = 64}) => (
  <div style={{position: 'absolute', left: x, top: y, fontFamily: jet, fontSize: 32, color: K.ink2, letterSpacing: 1, opacity: eo(f, at, 6), whiteSpace: 'nowrap',
    border: '1px solid rgba(255,255,255,0.12)', padding: '4px 14px', borderRadius: 8, background: 'rgba(7,9,15,0.6)'}}>{text}</div>
);
const NOISE = '0123456789#%$/<>';
/** Digits scramble and lock one by one with a small bounce (dark-keynote §8). */
const Scramble: React.FC<{f: number; text: string; at: number; size: number; color?: string; step?: number}> = ({f, text, at, size, color = K.accent, step = 4}) => (
  <span style={{fontFamily: inter, fontWeight: 600, fontSize: size, letterSpacing: '-0.04em', color, textShadow: color === K.accent ? GLOW(0.5) : undefined, whiteSpace: 'nowrap'}}>
    {[...text].map((ch, i) => {
      const lockAt = at + i * step, locked = f >= lockAt, b = locked ? 1 + 0.08 * Math.max(0, 1 - (f - lockAt) / 4) : 1;
      const shown = locked || /[^0-9]/.test(ch) ? ch : NOISE[Math.floor((f * 7 + i * 13) % NOISE.length)];
      return <span key={i} style={{display: 'inline-block', transform: `scale(${b})`, opacity: f < at - 6 ? 0 : 1}}>{shown}</span>;
    })}
  </span>
);

/* ---------- the sprite sheet: 6 real frames, 3 × 2, played in order, frame 6 back to frame 1 ---------- */

const CELL = 296, GAP = 14, SX = (1080 - (3 * CELL + 2 * GAP)) / 2, SY = 320;
const cellXY = (i: number) => ({x: SX + (i % 3) * (CELL + GAP), y: SY + Math.floor(i / 3) * (CELL + GAP)});
/** Which frame of the 6 is showing at `f` when played from `from` (the official GIF runs about 4.3 frames per 30 fps... ≈ 0.23 s each). */
const playIdx = (f: number, from: number) => Math.floor(Math.max(0, f - from) / 7) % 6;
const Sheet: React.FC<{f: number; drop?: number; nums?: number; play?: number; arc?: number; ring?: number; pair?: number}> = ({f, drop = -99, nums = -99, play = 1e9, arc = 0, ring = 0, pair = 0}) => {
  const cur = f >= play ? playIdx(f, play) : -1;
  const a = cellXY(5), b = cellXY(0);
  // the loop arc: from the right edge of cell 6 round the right side and over the top back into cell 1
  const x6 = a.x + CELL, y6 = a.y + CELL / 2, x1 = b.x + CELL / 2, y1 = b.y;
  const path = `M ${x6} ${y6} C ${x6 + 70} ${y6}, ${1080 - 20} ${SY + 300}, ${1080 - 40} ${SY + 120} S ${x1 + 260} ${SY - 90}, ${x1} ${y1}`;
  return <>
    {Array.from({length: 6}, (_, i) => {
      const {x, y} = cellXY(i), p = back((f - drop - i * 3) / 9);
      if (f < drop + i * 3) return null;
      const on = cur === i, hi = pair > 0 && (i === 0 || i === 5);
      return <div key={i} style={{position: 'absolute', left: x, top: y - (1 - p) * 60, width: CELL, height: CELL, borderRadius: 14, overflow: 'hidden', opacity: clamp((f - drop - i * 3) / 4),
        border: `${on || hi ? 4 : 1}px solid ${on || hi ? K.accent : 'rgba(255,255,255,0.12)'}`, boxShadow: on || hi ? GLOW(0.6) : '0 12px 30px rgba(0,0,0,0.5)', boxSizing: 'border-box'}}>
        <Img src={I(`sheet-${i + 1}.png`)} style={{width: '100%', height: '100%', objectFit: 'cover', filter: cur >= 0 && !on && !hi ? 'brightness(0.55)' : undefined}} />
        {f >= nums + i * 5 && <div style={{position: 'absolute', left: 10, top: 10, width: 56, height: 56, borderRadius: 28, background: on || hi ? K.accent : 'rgba(7,9,15,0.8)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: inter, fontWeight: 600, fontSize: 34, color: on || hi ? K.bg : K.ink,
          transform: `scale(${back((f - nums - i * 5) / 6)})`}}>{i + 1}</div>}
      </div>;
    })}
    {arc > 0 && <svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
      <path d={path} fill="none" stroke={K.accent} strokeWidth={10} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - arc} style={{filter: `drop-shadow(0 0 12px ${K.accent})`}} />
      {arc > 0.97 && <polygon points={`${x1 - 18},${y1 - 26} ${x1 + 18},${y1 - 26} ${x1},${y1 + 4}`} fill={K.accent} />}
      {ring > 0 && <circle cx={b.x + CELL / 2} cy={b.y + CELL / 2} r={CELL * 0.5 + ring * 90} fill="none" stroke={K.accent} strokeWidth={6 * (1 - ring)} opacity={1 - ring} />}
    </svg>}
  </>;
};

/* ---------- 1 hook: an owl sketch; a light sweep turns it into the animated GIF ---------- */

const Hook = make(({f, cue, dur}) => {
  const a = cue('a', 48), b = cue('b', 110);
  // the reveal: a sliver already moving at frame 0, the full sweep on "Images 2.6"
  const rv = 0.16 + 0.84 * ease.inOutCubic(clamp((f - a + 4) / 34));
  const W0 = 800;
  return <Stage push={1 + 0.04 * ease.inOutCubic(clamp(f / dur))}>
    <Src text="OpenAI 官方示例 · Images 2.6" y={210} />
    <Win f={f} x={140} y={270} w={W0} h={W0} title={f >= b ? 'owl.gif' : 'owl_sketch.png'} lit={f >= b ? 1 : 0} status={<LoopBadge f={f} at={b} />}>
      <Img src={I('owl-sketch.png')} style={{position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', filter: 'grayscale(1) brightness(1.05)'}} />
      <div style={{position: 'absolute', inset: 0, clipPath: `inset(0 ${(1 - rv) * 100}% 0 0)`}}><Clip src="owl-animation.mp4" frames={54} /></div>
      {rv < 0.999 && <div style={{position: 'absolute', top: 0, bottom: 0, left: `${rv * 100}%`, width: 120, marginLeft: -60, background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.18), transparent)'}} />}
      {rv < 0.999 && <div style={{position: 'absolute', top: 0, bottom: 0, left: `${rv * 100}%`, width: 3, background: K.accent, boxShadow: GLOW(0.8)}} />}
    </Win>
  </Stage>;
}, (cue) => [{at: 0, kind: 'tick', gain: 0.06}, {at: cue('a', 48) - 4, kind: 'whoosh', gain: 0.08}, {at: cue('b', 110), kind: 'chime', gain: 0.1}]);

/* ---------- 2 what: a prompt in ChatGPT → a GIF; speed 1× → 2×; frame by frame ---------- */

const What = make(({f, cue}) => {
  const a = cue('a', 67), b = cue('b', 96);
  const fast = f >= a + 6;
  return <Stage>
    <Src text="官方介绍片 · @OpenAI" y={210} />
    <Win f={f} at={0} x={60} y={270} w={960} h={540} title="ChatGPT">
      <Clip src="x-intro.mp4" frames={240} />
    </Win>
    <Win f={f} at={a - 8} x={60} y={880} w={420} h={420} title="dance.gif" lit={1} status={<span style={{fontFamily: inter, fontWeight: 600, fontSize: 30, color: K.accent}}>{fast ? '2×' : '1×'}</span>}>
      <Clip src="openai-x-gif-demo.mp4" frames={63} rate={fast ? 2 : 1} />
    </Win>
    {f >= a - 4 && <div style={{position: 'absolute', left: 520, top: 890, opacity: eo(f, a - 4)}}>
      <div style={{fontFamily: font, fontWeight: 700, fontSize: 40, color: K.ink}}>播放速度</div>
      <div style={{marginTop: 14, width: 480, height: 10, borderRadius: 5, background: K.s3, position: 'relative'}}>
        <div style={{position: 'absolute', left: 0, top: 0, height: 10, borderRadius: 5, width: `${30 + 50 * eo(f, a + 2, 8)}%`, background: K.accent, boxShadow: GLOW(0.5)}} />
      </div>
      <div style={{display: 'flex', justifyContent: 'space-between', width: 480, marginTop: 10, fontFamily: jet, fontSize: 28, color: K.ink2}}><span>1×</span><span style={{color: fast ? K.accent : K.ink2}}>2×</span></div>
    </div>}
    {f >= b - 4 && <div style={{position: 'absolute', left: 520, top: 1080, opacity: eo(f, b - 4)}}>
      <div style={{fontFamily: font, fontWeight: 700, fontSize: 40, color: K.ink, marginBottom: 12}}>逐帧编辑 <span style={{fontFamily: jet, fontSize: 26, color: K.ink2}}>据 The Verge</span></div>
      <div style={{display: 'flex', gap: 8}}>{Array.from({length: 6}, (_, i) => {
        const sel = i === 2 + (Math.floor((f - b) / 10) % 3 + 3) % 3;
        return <div key={i} style={{width: 72, height: 72, borderRadius: 8, overflow: 'hidden', border: `${sel ? 3 : 1}px solid ${sel ? K.accent : 'rgba(255,255,255,0.15)'}`, boxSizing: 'border-box',
          transform: `translateY(${(1 - back((f - b - i * 2) / 6)) * 30}px)`}}><Img src={I(`chick-${i}.jpg`)} style={{width: '100%', height: '100%', objectFit: 'cover'}} /></div>;
      })}</div>
    </div>}
  </Stage>;
}, (cue) => [{at: 0, kind: 'whoosh-short', gain: 0.07}, {at: cue('a', 67) - 8, kind: 'tap', gain: 0.08}, {at: cue('a', 67) + 6, kind: 'tick', gain: 0.08}, {at: cue('b', 96), kind: 'tick', gain: 0.07}]);

/* ---------- 3 sheet: one image with 6 frames (3 × 2), played in order ---------- */

const SheetScene = make(({f, cue}) => {
  const a = cue('a', 42), b = cue('b', 90);
  const big = f >= b - 2;
  return <Stage>
    <Src text="官方示例 · 6 帧 · 3 列 × 2 行" y={210} />
    <Sheet f={f} drop={2} nums={a} play={b} />
    {big && <div style={{position: 'absolute', left: 340, top: 960, width: 400, opacity: eo(f, b - 2, 6)}}>
      <Win f={f} at={b - 2} x={0} y={0} w={400} h={300} title="market.gif" lit={1} status={<LoopBadge f={f} at={b + 6} size={24} />}>
        <Img src={I(`sheet-${playIdx(f, b) + 1}.png`)} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
      </Win>
    </div>}
  </Stage>;
}, (cue) => [{at: 2, kind: 'whoosh-short', gain: 0.07}, ...Array.from({length: 6}, (_, i) => ({at: cue('a', 42) + i * 5, kind: 'tick', gain: 0.07})), {at: cue('b', 90), kind: 'chime', gain: 0.08}]);

/* ---------- 4 loop (climax): frame 6 leads back into frame 1 ---------- */

const LoopScene = make(({f, cue}) => {
  const a = cue('a', 52);
  const arc = ease.inOutCubic(clamp((f - 8) / Math.max(10, a - 12))), closeAt = 8 + Math.max(10, a - 12);
  const ring = f >= closeAt ? clamp((f - closeAt) / 16) : 0;
  return <Stage>
    <Src text="官方示例提示词" y={210} />
    <Sheet f={f} play={closeAt} arc={arc} ring={ring} pair={f < closeAt ? 1 : 0} />
    <div style={{position: 'absolute', left: 300, top: 980, width: 720, opacity: eo(f, 10, 10), fontFamily: jet, fontSize: 34, color: K.ink, lineHeight: 1.35}}>
      “…<span style={{color: K.accent}}>sixth frame transitions smoothly toward the first</span>.”
      <div style={{fontFamily: font, fontSize: 32, color: K.ink2, marginTop: 8}}>第 6 格画得能接回第 1 格</div>
    </div>
  </Stage>;
}, (cue) => [{at: 8, kind: 'whoosh', gain: 0.08}, {at: 8 + Math.max(10, cue('a', 52) - 12), kind: 'fs-impact-deep', gain: 0.13}, {at: 9 + Math.max(10, cue('a', 52) - 12), kind: 'chime', gain: 0.11}]);

/* ---------- 5 uses: official GIFs snap into a grid; reactions zoom ---------- */

const Tile: React.FC<{f: number; at: number; x: number; y: number; w: number; h: number; children: React.ReactNode; from?: [number, number]; lit?: boolean; label?: string; labelAt?: number}> = ({
  f, at, x, y, w, h, children, from = [0, 300], lit = false, label, labelAt = 1e9,
}) => {
  const p = back((f - at) / 8);
  if (f < at) return null;
  return <div style={{position: 'absolute', left: x + (1 - p) * from[0], top: y + (1 - p) * from[1], width: w, height: h, borderRadius: 16, overflow: 'hidden',
    border: `${lit ? 4 : 1}px solid ${lit ? K.accent : 'rgba(255,255,255,0.12)'}`, boxShadow: lit ? GLOW(0.5) : '0 16px 40px rgba(0,0,0,0.5)', boxSizing: 'border-box', opacity: clamp((f - at) / 3)}}>
    {children}
    {f >= labelAt && label && <div style={{position: 'absolute', left: 12, bottom: 12, padding: '6px 14px', borderRadius: 10, background: 'rgba(7,9,15,0.82)', fontFamily: font, fontWeight: 700, fontSize: 36,
      color: K.ink, opacity: eo(f, labelAt, 6), whiteSpace: 'nowrap'}}>{label}</div>}
  </div>;
};
const Uses = make(({f, cue}) => {
  const a = cue('a', 30), b = cue('b', 80);
  const zoom = eo(f, b - 2, 10);
  return <Stage>
    <Src text="官方页面里的客户示例" y={210} />
    <Tile f={f} at={4} x={64} y={270} w={952} h={238} from={[0, -260]}><Clip src="gif-montage.mp4" frames={210} /></Tile>
    <Tile f={f} at={4} x={64} y={524} w={952} h={400} from={[-400, 0]} label="品牌吉祥物 · Town" labelAt={a}><Clip src="town-monty.mp4" frames={219} pos="50% 70%" /></Tile>
    <div style={{position: 'absolute', inset: 0, transformOrigin: '540px 1100px', transform: `scale(${1 + 0.08 * zoom})`}}>
      <Tile f={f} at={4} x={64} y={940} w={304} h={304} from={[0, 400]} lit={zoom > 0.5} label="反应图" labelAt={b}><Clip src="openart-market-down.mp4" frames={41} /></Tile>
      <Tile f={f} at={4} x={388} y={940} w={304} h={304} from={[0, 400]} lit={zoom > 0.5} label="反应图" labelAt={b + 3}><Clip src="openart-market-up.mp4" frames={36} /></Tile>
      <Tile f={f} at={4} x={712} y={940} w={304} h={304} from={[400, 0]}><Clip src="openai-x-gif-demo.mp4" frames={63} /></Tile>
    </div>
  </Stage>;
}, (cue) => [{at: 4, kind: 'fs-impact-deep', gain: 0.1}, {at: cue('a', 30), kind: 'tick', gain: 0.07}, {at: cue('b', 80), kind: 'tap', gain: 0.08}]);

/* ---------- 6 speed: the official comparison; 50 % (official); Flare ≈6 s at quality=low (API) ---------- */

const Speed = make(({f, cue}) => {
  const a = cue('a', 32), b = cue('b', 77);
  return <Stage>
    <Win f={f} at={0} x={64} y={270} w={952} h={536} title="官方演示 · 单次对比">
      <Clip src="latency-comparison.mp4" frames={172} />
    </Win>
    {f >= a - 6 && <div style={{position: 'absolute', left: 64, top: 860}}>
      <Scramble f={f} text="50%" at={a - 2} size={230} />
      <div style={{fontFamily: font, fontWeight: 700, fontSize: 40, color: K.ink, marginTop: -10, opacity: eo(f, a + 8)}}>出图更快</div>
      <div style={{fontFamily: jet, fontSize: 30, color: K.ink2, marginTop: 6, opacity: eo(f, a + 10)}}>OpenAI 官方口径</div>
    </div>}
    {f >= b - 4 && <div style={{position: 'absolute', left: 560, top: 870, opacity: eo(f, b - 4), transform: `translateY(${(1 - back((f - b + 4) / 9)) * 40}px)`}}>
      <div style={{width: 260, height: 290, borderRadius: 18, overflow: 'hidden', border: `1px solid ${K.accent}`, boxShadow: GLOW(0.4)}}>
        <Img src={I('flare-card.jpg')} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
      </div>
      <div style={{marginTop: 14, whiteSpace: 'nowrap'}}><Scramble f={f} text="≈6" at={b + 4} size={110} /><span style={{fontFamily: font, fontWeight: 700, fontSize: 44, color: K.ink, marginLeft: 8}}>秒</span></div>
      <div style={{fontFamily: jet, fontSize: 28, color: K.ink2, whiteSpace: 'nowrap'}}>Flare · API 模型 · quality=low</div>
    </div>}
  </Stage>;
}, (cue) => [{at: 0, kind: 'whoosh-short', gain: 0.07}, ...[0, 1, 2].map((i) => ({at: cue('a', 32) - 2 + i * 4, kind: 'tick', gain: 0.07})), {at: cue('b', 77) - 4, kind: 'tap', gain: 0.08}]);

/* ---------- 7 scale: about 4 billion images a week (OpenAI's own figure) ---------- */

const ScaleScene = make(({f, cue}) => {
  const a = cue('a', 23);
  // a quiet wall of the six frames, drifting: many images
  const wall = Array.from({length: 72}, (_, i) => i);
  return <Stage>
    <div style={{position: 'absolute', inset: 0, opacity: 0.22, transform: `translateY(${-f * 1.2}px)`}}>
      {wall.map((i) => <Img key={i} src={I(`sheet-${(i % 6) + 1}.png`)} style={{position: 'absolute', left: (i % 6) * 182, top: Math.floor(i / 6) * 182, width: 170, height: 170, borderRadius: 10, objectFit: 'cover'}} />)}
    </div>
    <div style={{position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 70% 40% at 50% 40%, rgba(7,9,15,0.92) 30%, rgba(7,9,15,0.4) 100%)'}} />
    <div style={{position: 'absolute', left: 0, right: 0, top: 560, textAlign: 'center'}}>
      <Scramble f={f} text="40亿" at={a} size={300} step={5} />
      <div style={{fontFamily: font, fontWeight: 700, fontSize: 52, color: K.ink, marginTop: 6, opacity: eo(f, a + 10)}}>张图 / 每周</div>
      <div style={{fontFamily: jet, fontSize: 30, color: K.ink2, marginTop: 14, opacity: eo(f, a + 14)}}>OpenAI 自述 · ChatGPT、Codex、API</div>
    </div>
  </Stage>;
}, (cue) => [{at: 0, kind: 'whoosh', gain: 0.06}, ...[0, 1, 2].map((i) => ({at: cue('a', 23) + i * 5, kind: 'tick', gain: 0.07})), {at: cue('a', 23) + 12, kind: 'thud', gain: 0.1}]);

/* ---------- 8 end: back to the six frames; frame 6 joins frame 1 ---------- */

const End = make(({f, cue}) => {
  const a = cue('a', 39);
  const arc = ease.inOutCubic(clamp((f - a + 6) / 20)), ring = f >= a + 14 ? clamp((f - a - 14) / 16) : 0;
  return <Stage push={1 + 0.03 * ease.inOutCubic(clamp(f / 100))}>
    <Sheet f={f} nums={-99} play={2} arc={arc} ring={ring} />
    <div style={{position: 'absolute', left: 300, top: 1000, opacity: eo(f, a + 10, 10)}}><LoopBadge f={f} at={a + 10} text="6 格 = 1 张 GIF" size={40} /></div>
  </Stage>;
}, (cue) => [{at: 0, kind: 'whoosh-short', gain: 0.07}, {at: cue('a', 39) + 14, kind: 'chime', gain: 0.1}]);

/** Cover anchor (880 × 800): the six frames and the loop arc. */
const Cover: Scene = () => <div style={{position: 'absolute', left: 0, top: 0, width: 880, height: 800, overflow: 'hidden', background: K.bg}}>
  <div style={{position: 'absolute', left: -100, top: -230, transform: 'scale(1)', transformOrigin: '0 0'}}>
    <div style={{position: 'relative', width: 1080, height: 1100}}><Sheet f={200} nums={-99} arc={1} pair={1} /></div>
  </div>
</div>;

export const openaiImages26Scenes: Record<string, Scene> = {
  'oig.hook': Hook, 'oig.what': What, 'oig.sheet': SheetScene, 'oig.loop': LoopScene, 'oig.uses': Uses, 'oig.speed': Speed, 'oig.scale': ScaleScene, 'oig.end': End, 'oig.cover': Cover,
};
