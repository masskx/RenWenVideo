import React from 'react';
import {continueRender, delayRender, staticFile, useCurrentFrame} from 'remotion';
import {clamp} from '../fx';
import {font} from './theme';
import {cond} from './fonts';
import {HOST_ART} from './host-art';

// The account's host IP (user, 2026-11-01: "I need a character-based IP image. This is my profile picture. I want the IP to
// be animated, and I want it to be incorporated into each video"). v2 (user, 2026-11-04: the first version "felt rushed and
// disjointed, appearing strange in the video"; "refine the individual branding IP to make it more sophisticated and
// versatile"). What changed and why: docs/video-craft/IP形象.md §〇.
// - The drawing is the avatar itself: scripts/host/trace-avatar.py traces inputs/host-ip/avatar.webp colour by colour into
//   vector layers (src/tutorial/host-art.ts) — the same proportions, hair texture, shading and line work as the picture,
//   instead of a hand-drawn approximation. The parts that act (eyes, brows, mouth) are traced separately and rigged.
// - No arms: the stick arms and mitten hands were the crudest part. He acts with the head (nod, tilt, lean, turn toward
//   what he talks about), eyes (blink, glance), brows, mouth (lip-sync) and shoulders (shrug, breath).
// - He belongs to the film's frame: `mode` "window" (a picture-in-picture card in the film's own panel colour and accent,
//   the bust cropped by its bottom edge, like a correspondent's box), "edge" (rises from behind a line — the strap, a
//   card, the caption band — so the frame cuts him off instead of floating), or "badge" (the avatar's cream disc, for
//   covers and end cards only). A rim light in the film's accent ties him to its palette; the hoodie and face stay his.

export const HOST = {skin: '#F8CAA2', ink: '#100D0C', mouth: '#5A221C', tongue: '#C0645A', disc: '#F7E8D3', bg: '#FEF8F0'};

export type HostExpr = 'calm' | 'smile' | 'surprise' | 'think' | 'serious';
export type HostPose = 'idle' | 'point' | 'wave' | 'think' | 'thumbs' | 'shrug' | 'nod';
export type HostWord = {ms: number; dur: number; text: string};

const A = HOST_ART;
const hash = (n: number) => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const eo = (t: number) => 1 - Math.pow(1 - clamp(t), 3);
const eio = (t: number) => { const x = clamp(t); return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };

/** Mouth openness 0..1 and a vowel-ish shape for time `ms`, from per-syllable timings (attack 40 ms, release 70 ms). */
export const speech = (words: HostWord[], ms: number): {open: number; round: number; talking: number} => {
  let open = 0, round = 0, talking = 0;
  for (let i = 0; i < words.length; i++) {
    const w = words[i];
    if (ms < w.ms - 60 || ms > w.ms + w.dur + 120) continue;
    const a = clamp((ms - w.ms + 20) / 60), r = 1 - clamp((ms - (w.ms + w.dur - 30)) / 90);
    const amp = 0.5 + 0.5 * hash(i * 3.7 + w.text.charCodeAt(0));
    const v = Math.min(a, r) * amp;
    if (v > open) { open = v; round = hash(w.text.charCodeAt(0) * 0.37) > 0.7 ? 1 : 0; }
  }
  for (const w of words) if (ms >= w.ms - 150 && ms <= w.ms + w.dur + 350) { talking = 1; break; }
  return {open, round, talking};
};

/** What a pose does to the head and shoulders (no arms): tilt (deg), lean (px, + toward `look`), shoulders up (px), nods. */
const POSE: Record<HostPose, {tilt: number; lean: number; up: number; nod: number}> = {
  idle: {tilt: 0, lean: 0, up: 0, nod: 0},
  point: {tilt: -3, lean: 26, up: 0, nod: 0},     // leans and turns toward what he's showing
  wave: {tilt: 3, lean: 0, up: 0, nod: 2},        // hello: two quick nods
  think: {tilt: -7, lean: -8, up: 0, nod: 0},
  thumbs: {tilt: 2, lean: 0, up: 0, nod: 1},      // approval: one firm nod
  shrug: {tilt: 5, lean: 0, up: 26, nod: 0},
  nod: {tilt: 0, lean: 0, up: 0, nod: 1},
};
/** Brow offset (y, px; − is up) and tilt (deg, inner end), eye scale, per expression. */
const EXPR: Record<HostExpr, {by: number; bt: number; eye: number; lid: number}> = {
  calm: {by: 0, bt: 0, eye: 1, lid: 0},
  smile: {by: -6, bt: -2, eye: 1, lid: 0.32},
  surprise: {by: -24, bt: -4, eye: 1.18, lid: 0},
  think: {by: -10, bt: 6, eye: 1, lid: 0.12},
  serious: {by: 7, bt: 8, eye: 1, lid: 0.2},
};
const mixE = (a: HostExpr, b: HostExpr, t: number) => {
  const p = EXPR[a], q = EXPR[b];
  return {by: lerp(p.by, q.by, t), bt: lerp(p.bt, q.bt, t), eye: lerp(p.eye, q.eye, t), lid: lerp(p.lid, q.lid, t)};
};

export type HostProps = {
  /** Frame inside the current scene. */ f: number;
  /** Narration syllables for lip-sync, ms from scene start (already offset by the voice lead). */ words?: HostWord[];
  expr?: HostExpr; pose?: HostPose;
  /** Previous expression / pose and the frame the change started, for blending. */ fromExpr?: HostExpr; fromPose?: HostPose; poseAt?: number;
  /** Where he looks: −1 left … 1 right, −1 up … 1 down. A pointing lean goes the same way horizontally. */ look?: [number, number];
  /** Width in px of the square art box (the avatar's 1254 px square). */ size?: number;
  /** Rim light colour (the film's accent); none when omitted. */ rim?: string;
  seed?: number;
};

/** The host as drawn in the avatar, rigged. 1254 × 1254 art box scaled to `size`. */
export const Host: React.FC<HostProps> = ({f, words = [], expr = 'calm', pose = 'idle', fromExpr, fromPose, poseAt = -99, look = [0.25, 0.1], size = 300, rim, seed = 1}) => {
  const ms = (f / 30) * 1000;
  const sp = speech(words, ms);
  const tp = eio((f - poseAt) / 10);
  const P0 = POSE[fromPose ?? pose], P1 = POSE[pose];
  const E = mixE(fromExpr ?? expr, expr, tp);
  const tilt = lerp(P0.tilt, P1.tilt, tp), lean = lerp(P0.lean, P1.lean, tp), up = lerp(P0.up, P1.up, tp);
  // nods: a short dip after the pose change (one or two)
  const nods = pose === fromPose ? 0 : P1.nod, nt = (f - poseAt) / 7;
  const nod = nods && nt > 0 && nt < nods * 2 ? Math.sin(nt * Math.PI) ** 2 * 14 : 0;
  // idle life: slow sway, syllable bob, breath
  const sway = Math.sin(f / 29 + seed) * 1.1;
  const bob = sp.talking * (Math.sin(f / 3.3) * 0.6 + sp.open * 1.6);
  const breathe = Math.sin(f / 31 + seed) * 4;
  const lx = clamp(look[0], -1, 1), ly = clamp(look[1], -1, 1);
  const turn = lx * 4;     // features slide a hair toward the look (a hint of a turn; more breaks the avatar's 3/4 drawing)
  const headRot = tilt + sway + bob * 0.35 + (lx * lean) / 26 * 2;
  const headY = nod + bob * 2.2 - up * 0.35;
  const hairLag = Math.sin((f - 4) / 29 + seed) * 0.6 + (nod ? -nod * 0.03 : 0);
  // blink: every 2.5–4.5 s, 5 frames; sometimes double
  let blink = 0;
  for (let k = 0; k < 60; k++) {
    const t0 = Math.round(k * 105 + hash(k + seed * 13) * 60);
    if (f >= t0 && f < t0 + 5) blink = Math.max(blink, 1 - Math.abs(f - t0 - 2) / 2.5);
    if (hash(k * 1.3 + seed) > 0.78 && f >= t0 + 8 && f < t0 + 13) blink = Math.max(blink, 1 - Math.abs(f - t0 - 10) / 2.5);
  }
  if (pose !== fromPose && f >= poseAt && f < poseAt + 5) blink = Math.max(blink, 1 - Math.abs(f - poseAt - 2) / 2.5); // blink on a turn
  const lid = Math.max(blink, E.lid);
  const glint = ((f + seed * 40) % 180) / 16;
  const pv = A.pivot;

  const eye = (e: (typeof A.eyes)[number], i: number) => {
    const [x0, y0, x1, y1] = e.box, cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
    const sy = Math.max(0.1, 1 - lid) * E.eye, sx = E.eye;
    return <g key={i} transform={`translate(${lx * 9},${ly * 6})`}>
      <g transform={`translate(${cx},${cy}) scale(${sx},${sy}) translate(${-cx},${-cy})`}>
        <path d={e.d} fill={HOST.ink} fillRule="evenodd" />
        <circle cx={cx - (x1 - x0) * 0.18} cy={cy - (y1 - y0) * 0.2} r={(x1 - x0) * 0.13} fill="#fff" opacity={lid > 0.6 ? 0 : 0.95} />
      </g>
      {lid > 0.25 && <path d={`M${x0 - 6},${cy - (y1 - y0) * 0.5 * sy} Q${cx},${cy - (y1 - y0) * 0.62 * sy - 4} ${x1 + 6},${cy - (y1 - y0) * 0.45 * sy}`} stroke={HOST.ink} strokeWidth={6} fill="none" strokeLinecap="round" />}
    </g>;
  };
  const brow = (b: (typeof A.brows)[number], i: number) => {
    const [x0, y0, x1, y1] = b.box, inner = i === 0 ? x1 : x0, cy = (y0 + y1) / 2, side = i === 0 ? 1 : -1;
    const ex = expr === 'think' && i === 1 ? -10 : 0;   // one brow up when thinking
    return <path key={i} d={b.d} fill={HOST.ink} fillRule="evenodd" transform={`translate(${lx * 5},${E.by + ex}) rotate(${E.bt * side} ${inner} ${cy})`} />;
  };
  const [mx0, my0, mx1, my1] = A.mouth, mcx = (mx0 + mx1) / 2 + 4, mcy = (my0 + my1) / 2 - 6, mw = (mx1 - mx0) / 2;
  const mouth = () => {
    const open = sp.open;
    if (open > 0.06 || (expr === 'surprise' && tp > 0.5)) {
      const o = Math.max(open, expr === 'surprise' ? 0.45 : 0), w = sp.round || expr === 'surprise' ? mw * (0.42 + o * 0.1) : mw * (0.62 + o * 0.18), h = 8 + o * 38;
      return <g>
        <path d={`M${mcx - w},${mcy} Q${mcx},${mcy - 6} ${mcx + w},${mcy} Q${mcx + w * 0.9},${mcy + h} ${mcx},${mcy + h * 1.15} Q${mcx - w * 0.9},${mcy + h} ${mcx - w},${mcy} Z`}
          fill={HOST.mouth} stroke={HOST.ink} strokeWidth={5} strokeLinejoin="round" />
        <path d={`M${mcx - w * 0.55},${mcy + h * 0.95} Q${mcx},${mcy + h * 0.55} ${mcx + w * 0.55},${mcy + h * 0.95}`} fill={HOST.tongue} opacity={o > 0.3 ? 0.9 : 0} />
        <path d={`M${mcx - w * 0.5},${mcy + h * 1.15 + 14} Q${mcx},${mcy + h * 1.15 + 22} ${mcx + w * 0.5},${mcy + h * 1.15 + 14}`} stroke="#BD8D75" strokeWidth={9} fill="none" strokeLinecap="round" opacity={0.6} />
      </g>;
    }
    if (expr === 'smile') return <g>
      <path d={`M${mcx - mw * 0.8},${mcy - 4} Q${mcx},${mcy + 26} ${mcx + mw * 0.8},${mcy - 6}`} stroke={HOST.ink} strokeWidth={6} fill="none" strokeLinecap="round" />
      <path d={`M${mcx - mw * 0.35},${mcy + 30} Q${mcx},${mcy + 38} ${mcx + mw * 0.35},${mcy + 30}`} stroke="#BD8D75" strokeWidth={9} fill="none" strokeLinecap="round" opacity={0.7} />
    </g>;
    if (expr === 'think') return <path d={`M${mcx - mw * 0.55},${mcy + 4} Q${mcx},${mcy + 2} ${mcx + mw * 0.6},${mcy - 8}`} stroke={HOST.ink} strokeWidth={6} fill="none" strokeLinecap="round" />;
    return <g><path d={A.head.lips.d} fill={A.head.lips.fill} /><path d={A.head.mouthLine.d} fill={HOST.ink} /></g>;
  };
  // rim light: a soft, thin glow of the film's accent on the upper-left edge (not an offset copy of the outline)
  const rimF = rim ? `drop-shadow(${-size / 400}px ${-size / 500}px ${size / 260}px ${rim}aa) drop-shadow(0 ${size / 60}px ${size / 30}px rgba(0,0,0,0.3))` : undefined;
  return <svg width={size} height={size} viewBox={`0 0 ${A.size[0]} ${A.size[1]}`} style={{overflow: 'visible', display: 'block', filter: rimF}}>
    <g transform={`translate(${lean * Math.sign(lx || 1)},0)`}>
      {/* body: shoulders breathe and shrug */}
      <g transform={`translate(0,${breathe - up})`}>
        <path d={A.body.neck.d} fill={A.body.neck.fill} fillRule="evenodd" />
        <path d={A.body.neckShade.d} fill={A.body.neckShade.fill} fillRule="evenodd" />
      </g>
      <g transform={`translate(0,${breathe * 0.6 - up}) translate(627,1254) scale(1,${1 + up / 900}) translate(-627,-1254)`}>
        <path d={A.body.hood.d} fill={A.body.hood.fill} fillRule="evenodd" />
        <path d={A.body.hoodLo.d} fill={A.body.hoodLo.fill} fillRule="evenodd" />
        <path d={A.body.hoodHi.d} fill={A.body.hoodHi.fill} fillRule="evenodd" />
        <path d={A.body.lines.d} fill={A.body.lines.fill} fillRule="evenodd" />
      </g>
      {/* head */}
      <g transform={`translate(0,${headY + breathe * 0.4}) rotate(${headRot} ${pv[0]} ${pv[1]})`}>
        <path d={A.head.face.d} fill={A.head.face.fill} fillRule="evenodd" />
        <g transform={`translate(${turn * 0.5},0)`}>
          <path d={A.head.shade.d} fill={A.head.shade.fill} fillRule="evenodd" />
          <path d={A.head.deep.d} fill={A.head.deep.fill} fillRule="evenodd" />
        </g>
        <path d={A.head.lines.d} fill={A.head.lines.fill} fillRule="evenodd" />
        <g transform={`translate(${turn},0)`}>
          {A.brows.map(brow)}
          {A.eyes.map(eye)}
          {mouth()}
          <path d={A.head.glasses.d} fill={A.head.glasses.fill} fillRule="evenodd" />
          {glint < 1 && <g opacity={Math.sin(glint * Math.PI) * 0.5}>
            <path d={`M${470 + glint * 230},640 L${530 + glint * 230},480`} stroke="#fff" strokeWidth={22} />
            <path d={`M${760 + glint * 140},650 L${810 + glint * 140},500`} stroke="#fff" strokeWidth={14} />
          </g>}
        </g>
        <g transform={`rotate(${hairLag} ${pv[0]} ${pv[1]})`}>
          <path d={A.head.hair.d} fill={A.head.hair.fill} fillRule="evenodd" />
          <path d={A.head.hairHi.d} fill={A.head.hairHi.fill} fillRule="evenodd" />
        </g>
      </g>
    </g>
  </svg>;
};

/* ---------- the host inside a film: config + a per-scene layer ---------- */
export type HostBeat = {at: number; expr?: HostExpr; pose?: HostPose; look?: [number, number]};
export type HostMode = 'window' | 'edge' | 'badge';
export type HostScene = {expr?: HostExpr; pose?: HostPose; beats?: HostBeat[]; x?: number; y?: number; size?: number; mute?: boolean; mode?: HostMode; look?: [number, number]};
/**
 * tutorial.host (docs/video-craft/IP形象.md). `x`, `y`: the window's / the edge line's top-left; `size`: the window's width
 * (edge: the art's width). `colors` come from the film (look.pk): `panel` the window's ground, `accent` its frame and the
 * rim light, `ink` the name tag. `name` is the tag on the window (omit for none).
 */
export type HostConfig = {x?: number; y?: number; size?: number; mode?: HostMode; name?: string; scenes: Record<string, HostScene>;
  colors?: {panel?: string; accent?: string; ink?: string; bg?: string}};

const useWords = (src?: string): HostWord[] => {
  const [words, setWords] = React.useState<HostWord[]>([]);
  const [handle] = React.useState(() => (src ? delayRender(`host words ${src}`) : null));
  React.useEffect(() => {
    if (!src || handle === null) return;
    fetch(staticFile(src)).then((r) => r.json()).then((j) => setWords(j.words ?? [])).catch(() => setWords([])).finally(() => continueRender(handle));
  }, [src, handle]);
  return words;
};

/** The framed host (no timeline): used by HostLayer and the lab. `enter` 0..1 reveals it (the window wipes open / he rises from the edge). */
export const HostFrame: React.FC<HostProps & {mode?: HostMode; enter?: number; name?: string; colors?: HostConfig['colors']}> = ({mode = 'window', enter = 1, name, colors = {}, size = 300, ...p}) => {
  const panel = colors.panel ?? '#2A2420', accent = colors.accent ?? '#E0B84D', ink = colors.ink ?? '#F2E6DA';
  if (mode === 'badge') {
    const s = 0.85 + 0.15 * eo(enter);
    return <div style={{width: size, height: size, borderRadius: '50%', overflow: 'hidden', background: HOST.disc, opacity: clamp(enter * 2), transform: `scale(${s})`,
      boxShadow: `0 0 0 ${size / 50}px ${accent}, 0 ${size / 25}px ${size / 12}px rgba(0,0,0,0.35)`}}>
      <div style={{marginTop: size * 0.04}}><Host {...p} size={size} /></div>
    </div>;
  }
  if (mode === 'edge') {
    // the art rises from behind a line at the bottom of this box; the line itself is the film's (strap, card, band)
    const h = size * 0.82, rise = (1 - eo(enter)) * h;
    return <div style={{position: 'relative', width: size, height: h, overflow: 'hidden'}}>
      <div style={{position: 'absolute', left: 0, top: -size * 0.06 + rise}}><Host {...p} size={size} rim={p.rim ?? accent} /></div>
    </div>;
  }
  // window: a picture-in-picture card in the film's panel colour, accent frame, the bust cropped by its bottom edge
  const w = size, h = size * 1.06, open = eio(enter), art = w * 1.04;
  return <div style={{position: 'relative', width: w, height: h + (name ? 56 : 0)}}>
    <div style={{position: 'absolute', left: 0, top: 0, width: w, height: h, overflow: 'hidden', clipPath: `inset(${(1 - open) * 100}% 0 0 0)`,
      background: `radial-gradient(120% 90% at 50% 30%, ${colors.bg ?? panel} 0%, ${panel} 55%, rgba(0,0,0,0.55) 100%)`, boxShadow: `inset 0 0 0 ${Math.max(3, w / 90)}px ${accent}, 0 18px 40px rgba(0,0,0,0.45)`}}>
      <div style={{position: 'absolute', left: (w - art) / 2, top: h - art * 0.97 + (1 - open) * h * 0.3}}><Host {...p} size={art} rim={p.rim ?? accent} /></div>
      <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: h * 0.18, background: `linear-gradient(180deg, rgba(0,0,0,0), ${panel})`}} />
      <div style={{position: 'absolute', inset: 0, boxShadow: `inset 0 0 0 ${Math.max(3, w / 90)}px ${accent}`}} />
    </div>
    {name && <div style={{position: 'absolute', left: 0, top: h, display: 'flex', height: 52, opacity: clamp((enter - 0.5) * 3), clipPath: `inset(0 ${(1 - eo((enter - 0.4) / 0.6)) * 100}% 0 0)`}}>
      <div style={{width: 10, background: accent}} />
      <div style={{background: 'rgba(0,0,0,0.78)', padding: '0 16px', display: 'flex', alignItems: 'center', gap: 10, fontFamily: font, fontWeight: 900, fontSize: 30, color: ink, whiteSpace: 'nowrap'}}>
        {name}<span style={{fontFamily: cond, fontWeight: 700, fontSize: 22, color: accent, letterSpacing: 1}}>HOST</span>
      </div>
    </div>}
  </div>;
};

/** One scene's host: opens when the previous scene had none, closes when the next has none; lip-syncs to the scene's narration. */
export const HostLayer: React.FC<{cfg: HostConfig; sceneId: string; prevId?: string; nextId?: string; audioSrc: string; leadMs: number; dur: number}> = ({cfg, sceneId, prevId, nextId, audioSrc, leadMs, dur}) => {
  const f = useCurrentFrame();
  const sc = cfg.scenes[sceneId];
  const words = useWords(sc && !sc.mute ? audioSrc.replace(/\.mp3$/, '.words.json') : undefined);
  if (!sc) return null;
  const shifted = words.map((w) => ({...w, ms: w.ms + leadMs}));
  const t = f / 30;
  const prev = prevId ? cfg.scenes[prevId] : undefined;
  let expr: HostExpr = sc.expr ?? 'calm', pose: HostPose = sc.pose ?? 'idle', look: [number, number] = sc.look ?? [0.25, 0.1];
  let fromExpr: HostExpr = prev ? (prev.beats?.slice(-1)[0]?.expr ?? prev.expr ?? 'calm') : 'calm';
  let fromPose: HostPose = prev ? (prev.beats?.slice(-1)[0]?.pose ?? prev.pose ?? 'idle') : 'idle', poseAt = 4;
  for (const b of sc.beats ?? []) if (t >= b.at) {
    const at = Math.round(b.at * 30);
    if (b.pose && b.pose !== pose) { fromPose = pose; pose = b.pose; poseAt = at; }
    if (b.expr && b.expr !== expr) { fromExpr = expr; expr = b.expr; poseAt = at; }
    if (b.look) look = b.look;
  }
  const inA = prev ? 1 : clamp(f / 10), out = nextId && cfg.scenes[nextId] ? 0 : clamp((f - (dur - 9)) / 9);
  const enter = Math.max(0, inA * (1 - out));
  if (enter <= 0) return null;
  const mode = sc.mode ?? cfg.mode ?? 'window';
  const x = sc.x ?? cfg.x ?? 40, y = sc.y ?? cfg.y ?? 900, size = sc.size ?? cfg.size ?? 230;
  return <div style={{position: 'absolute', left: x, top: y}}>
    <HostFrame f={f} words={shifted} expr={expr} pose={pose} fromExpr={fromExpr} fromPose={fromPose} poseAt={poseAt} look={look} size={size} seed={sceneId.length}
      mode={mode} enter={enter} name={cfg.name} colors={cfg.colors} />
  </div>;
};
