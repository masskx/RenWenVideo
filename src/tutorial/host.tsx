import React from 'react';
import {continueRender, delayRender, staticFile, useCurrentFrame} from 'remotion';
import {clamp} from '../fx';

// The account's host IP (user, 2026-11-01: "I need a character-based IP image. This is my profile picture. I want the IP to
// be animated, and I want it to be incorporated into each video"). Drawn in code from the profile picture
// (inputs/host-ip/avatar.webp): flat illustration with a dark ink outline, messy black hair with a few spikes on top,
// thin dark rectangular glasses, straight thick brows, calm small mouth, black hoodie with two drawstrings, on a cream
// disc. Colours sampled from the picture (scripts/qa/palette.mjs): skin #F9CBA3, neck shadow #E2A981, ear / lip #DC9775 /
// #D08364, hair #201C1B, hoodie #1B1918 / fold #2C2729, disc #F7E8D2 on #FCF9EF.
// Rig: every part is a function of (frame, inputs) only. Head bob + mouth from the narration's per-syllable timings
// (words.json: {text, ms, dur}), blinks on a fixed pseudo-random schedule, hair lagging the head, breathing, a glint across
// the glasses, five expressions and six arm poses that blend over ~8 frames. Docs: docs/video-craft/IP形象.md.

export const HOST = {skin: '#F9CBA3', skinShade: '#EDB58D', neck: '#E2A981', ear: '#DC9775', lip: '#D08364', mouth: '#5E2620', tongue: '#C9665A',
  hair: '#201C1B', hairHi: '#3A3332', hoodie: '#1B1918', fold: '#2C2729', ink: '#141010', glass: '#34363A', disc: '#F7E8D2', bg: '#FCF9EF', tip: '#4A4544'};

export type HostExpr = 'calm' | 'smile' | 'surprise' | 'think' | 'serious';
export type HostPose = 'idle' | 'point' | 'wave' | 'think' | 'thumbs' | 'shrug';
export type HostWord = {ms: number; dur: number; text: string};

const hash = (n: number) => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const eo = (t: number) => 1 - Math.pow(1 - clamp(t), 3);

/** Mouth openness 0..1 and a vowel-ish shape for time `ms`, from per-syllable timings (attack 40 ms, release 70 ms). */
export const speech = (words: HostWord[], ms: number): {open: number; round: number; talking: number} => {
  let open = 0, round = 0, talking = 0;
  for (let i = 0; i < words.length; i++) {
    const w = words[i];
    if (ms < w.ms - 60 || ms > w.ms + w.dur + 120) continue;
    const a = clamp((ms - w.ms + 20) / 60), r = 1 - clamp((ms - (w.ms + w.dur - 30)) / 90);
    const amp = 0.55 + 0.45 * hash(i * 3.7 + w.text.charCodeAt(0));
    const v = Math.min(a, r) * amp;
    if (v > open) { open = v; round = hash(w.text.charCodeAt(0) * 0.37) > 0.68 ? 1 : 0; }
  }
  // "talking" stays high across short gaps so the head keeps moving between syllables
  for (const w of words) if (ms >= w.ms - 150 && ms <= w.ms + w.dur + 350) { talking = 1; break; }
  return {open, round, talking};
};

/* ---------- arm poses: elbow and hand points in the 600 × 720 box (right arm; the left arm mirrors), hand shape ---------- */
type Pt = [number, number];
type Arm = {e: Pt; h: Pt; hand: 'fist' | 'point' | 'open' | 'thumb'; rot: number; show: number};
const DOWN: Arm = {e: [500, 800], h: [500, 900], hand: 'open', rot: 0, show: 0};
const POSES: Record<HostPose, {l: Arm; r: Arm}> = {
  idle: {l: DOWN, r: DOWN},
  point: {l: DOWN, r: {e: [560, 540], h: [585, 420], hand: 'point', rot: 28, show: 1}},
  wave: {l: DOWN, r: {e: [555, 545], h: [560, 420], hand: 'open', rot: 8, show: 1}},
  think: {l: DOWN, r: {e: [430, 700], h: [345, 492], hand: 'fist', rot: -30, show: 1}},
  thumbs: {l: DOWN, r: {e: [515, 690], h: [470, 575], hand: 'thumb', rot: -10, show: 1}},
  shrug: {l: {e: [560, 660], h: [590, 560], hand: 'open', rot: 30, show: 1}, r: {e: [560, 660], h: [590, 560], hand: 'open', rot: 30, show: 1}},
};

const Hand: React.FC<{kind: Arm['hand']}> = ({kind}) => {
  const s = {fill: HOST.skin, stroke: HOST.ink, strokeWidth: 4.5, strokeLinejoin: 'round' as const};
  return kind === 'point' ? <g>
      <rect x={-22} y={-14} width={44} height={44} rx={17} {...s} />
      <rect x={-9} y={-66} width={18} height={62} rx={9} {...s} />
    </g> : kind === 'thumb' ? <g>
      <rect x={-24} y={-10} width={48} height={42} rx={17} {...s} />
      <rect x={-12} y={-56} width={18} height={52} rx={9} {...s} />
    </g> : kind === 'fist' ? <rect x={-24} y={-22} width={48} height={44} rx={19} {...s} />
    : <path d="M-26,14 C-30,-24 -20,-44 -13,-44 C-6,-44 -6,-30 -4,-52 C-2,-64 12,-62 12,-48 C14,-60 28,-56 26,-40 C33,-42 37,-30 32,-12 C30,14 22,34 0,36 C-17,36 -24,26 -26,14 Z" {...s} />;
};

const ArmShape: React.FC<{side: 1 | -1; arm: Arm; f: number}> = ({side, arm, f}) => {
  if (arm.show <= 0.01) return null;
  const sx = 470, sy = 600;
  const dy = (1 - arm.show) * 300;
  const wig = arm.hand === 'open' && arm.show > 0.95 && arm.rot === 8 ? Math.sin(f / 3) * 14 : 0;
  const pts = `M${sx},${sy} L${arm.e[0]},${arm.e[1]} L${arm.h[0]},${arm.h[1]}`;
  return <g transform={`translate(${side === 1 ? 0 : 600},${dy}) scale(${side},1)`}>
    <path d={pts} stroke={HOST.ink} strokeWidth={70} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    <path d={pts} stroke={HOST.hoodie} strokeWidth={61} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    <path d={`M${lerp(sx, arm.e[0], 0.35)},${lerp(sy, arm.e[1], 0.35)} L${lerp(sx, arm.e[0], 0.8)},${lerp(sy, arm.e[1], 0.8)}`} stroke={HOST.fold} strokeWidth={10} fill="none" strokeLinecap="round" />
    <g transform={`translate(${arm.h[0]},${arm.h[1]}) rotate(${arm.rot + wig})`}><Hand kind={arm.hand} /></g>
  </g>;
};

const mixPt = (a: Pt, b: Pt, t: number): Pt => [lerp(a[0], b[0], t), lerp(a[1], b[1], t)];
const mixArm = (a: Arm, b: Arm, t: number): Arm => ({e: mixPt(a.e, b.e, t), h: mixPt(a.h, b.h, t), hand: t < 0.5 ? a.hand : b.hand, rot: lerp(a.rot, b.rot, t), show: lerp(a.show, b.show, t)});

export type HostProps = {
  /** Frame inside the current scene. */ f: number;
  /** Narration syllables for lip-sync, ms from scene start (already offset by the voice lead). */ words?: HostWord[];
  expr?: HostExpr; pose?: HostPose;
  /** Previous pose and the frame the change started, for blending. */ fromPose?: HostPose; poseAt?: number;
  /** Where the eyes look: -1 left … 1 right, -1 up … 1 down. */ look?: [number, number];
  /** Size of the square box in px. */ size?: number;
  /** Draw the cream disc behind (the avatar's own badge). */ disc?: boolean;
  /** 0..1 entrance (scale + rise). */ enter?: number;
  seed?: number;
};

/** The host, bust, in a 600 × 720 box scaled to `size` wide. */
export const Host: React.FC<HostProps> = ({f, words = [], expr = 'calm', pose = 'idle', fromPose, poseAt = -99, look = [0, 0], size = 300, disc = true, enter = 1, seed = 1}) => {
  const ms = (f / 30) * 1000;
  const sp = speech(words, ms);
  const open = sp.open;
  // head motion: a slow sway, a syllable bob while talking, a nod on each phrase start
  const sway = Math.sin(f / 23 + seed) * 1.6;
  const bob = sp.talking * (Math.sin(f / 3.1) * 0.8 + open * 2.2);
  const headRot = sway + (expr === 'think' ? -5 : 0) + (expr === 'surprise' ? 2 : 0) + bob * 0.5;
  const headY = -bob * 1.4 + (expr === 'surprise' ? -6 : 0);
  const hairLag = Math.sin((f - 3) / 23 + seed) * 1.2 + (sp.talking ? Math.sin((f - 2) / 3.1) * 0.6 : 0);
  const breathe = Math.sin(f / 26 + seed) * 3;
  // blink: every 2.4–4.4 s, 4 frames; double-blink sometimes
  let blink = 0;
  for (let k = 0; k < 40; k++) {
    const t0 = Math.round(k * 100 + hash(k + seed * 13) * 60);
    if (f >= t0 && f < t0 + 5) blink = Math.max(blink, 1 - Math.abs(f - t0 - 2) / 2.5);
    if (hash(k * 1.3 + seed) > 0.75 && f >= t0 + 8 && f < t0 + 13) blink = Math.max(blink, 1 - Math.abs(f - t0 - 10) / 2.5);
  }
  if (expr === 'smile') blink = Math.max(blink, 0.35);
  const eyeS = expr === 'surprise' ? 1.25 : 1;
  const [lx, ly] = expr === 'think' ? [0.7, -0.8] : look;
  // brows
  const browUp = expr === 'surprise' ? -16 : expr === 'think' ? -6 : expr === 'serious' ? 4 : expr === 'smile' ? -3 : 0;
  const browTilt = expr === 'serious' ? 7 : expr === 'think' ? -8 : 0;
  // poses blend
  const tp = eo((f - poseAt) / 9);
  const P0 = POSES[fromPose ?? pose], P1 = POSES[pose];
  const rArm = mixArm(P0.r, P1.r, tp);
  const lArm = mixArm(P0.l, P1.l, tp);
  if (pose === 'point' && tp > 0.9) rArm.h = [rArm.h[0] + Math.sin(f / 9) * 4, rArm.h[1] + Math.sin(f / 9) * 3];
  // glint across the glasses every ~5 s
  const gl = ((f + seed * 40) % 150) / 14;
  // entrance
  const sc = 0.6 + 0.4 * enter, ty = (1 - enter) * 120;

  const ink = {stroke: HOST.ink, strokeWidth: 4.5, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const};
  const mouth = () => {
    if (expr === 'surprise' && open < 0.2) return <ellipse cx={300} cy={410} rx={13} ry={16} fill={HOST.mouth} {...ink} />;
    if (open > 0.08) {
      const w = sp.round ? 20 + open * 6 : 26 + open * 12, h = 6 + open * (sp.round ? 22 : 18);
      return <g>
        <ellipse cx={300} cy={406 + h * 0.3} rx={w} ry={h} fill={HOST.mouth} {...ink} />
        <ellipse cx={300} cy={406 + h * 0.85} rx={w * 0.55} ry={h * 0.35} fill={HOST.tongue} />
      </g>;
    }
    if (expr === 'smile') return <path d="M270,400 Q300,428 330,400" fill="none" {...ink} strokeWidth={5} />;
    if (expr === 'serious') return <path d="M276,408 L324,408" fill="none" {...ink} />;
    return <g>
      <path d="M278,412 Q300,421 322,412 Q300,428 278,412 Z" fill={HOST.lip} opacity={0.9} />
      <path d="M272,405 Q286,401 300,404 Q314,401 328,405" fill="none" {...ink} strokeWidth={4} />
    </g>;
  };
  const eye = (cx: number) => {
    const sy = Math.max(0.08, 1 - blink) * eyeS;
    return <g>
      <g transform={`translate(${cx + lx * 5},${305 + ly * 4}) scale(1,${sy})`}>
        <ellipse cx={0} cy={0} rx={11 * eyeS} ry={13.5} fill={HOST.ink} />
        <circle cx={-3.5} cy={-4.5} r={3.8} fill="#fff" />
      </g>
      {/* upper lid */}
      <path d={`M${cx - 17},${296 - (1 - sy) * 0} Q${cx},${286 + (1 - Math.max(0.08, 1 - blink)) * 18} ${cx + 17},${296}`} fill="none" {...ink} strokeWidth={4} />
    </g>;
  };
  const brow = (cx: number, side: number) => <path d={`M${cx - 27},${268 + browUp + browTilt * side * 0.4} Q${cx},${258 + browUp} ${cx + 27},${266 + browUp - browTilt * side * 0.4}`}
    fill="none" stroke={HOST.hair} strokeWidth={13} strokeLinecap="round" />;

  return <svg width={size} height={(size * 720) / 600} viewBox="0 0 600 720" style={{overflow: 'visible', display: 'block'}}>
    <g transform={`translate(300,${420 + ty}) scale(${sc}) translate(-300,-420)`}>
      {disc && <circle cx={300} cy={360} r={290} fill={HOST.disc} />}
      {/* body: hoodie with hood around the neck, drawstrings; breathes */}
      <g transform={`translate(0,${breathe * 0.5})`}>
        <ArmShape side={-1} arm={lArm} f={f} />
        <path d="M20,720 C30,630 70,585 150,560 C190,548 215,530 240,512 L360,512 C385,530 410,548 450,560 C530,585 570,630 580,720 Z" fill={HOST.hoodie} {...ink} />
        <path d="M80,640 C110,610 140,600 165,596 M520,640 C490,610 460,600 435,596" fill="none" stroke={HOST.fold} strokeWidth={10} strokeLinecap="round" />
        {/* neck */}
        <path d="M256,440 L256,520 Q300,556 344,520 L344,440 Z" fill={HOST.neck} {...ink} />
        <path d="M256,470 Q300,505 344,470 L344,440 L256,440 Z" fill={HOST.skinShade} opacity={0.6} />
        {/* hood collar: thick ring around the neck dipping to a V */}
        <path d="M185,520 C205,488 240,498 262,520 Q300,580 338,520 C360,498 395,488 415,520 C440,560 420,620 395,640 Q340,600 300,640 Q260,600 205,640 C180,620 160,560 185,520 Z" fill={HOST.hoodie} {...ink} />
        <path d="M225,560 Q260,590 290,628 M375,560 Q340,590 310,628" fill="none" stroke={HOST.fold} strokeWidth={9} strokeLinecap="round" />
        {/* drawstrings */}
        <path d={`M268,600 Q264,${650 + breathe} 266,700`} fill="none" stroke={HOST.ink} strokeWidth={9} strokeLinecap="round" />
        <path d={`M332,600 Q336,${650 + breathe} 334,700`} fill="none" stroke={HOST.ink} strokeWidth={9} strokeLinecap="round" />
        <circle cx={268} cy={603} r={9} fill={HOST.tip} {...ink} strokeWidth={3} />
        <circle cx={332} cy={603} r={9} fill={HOST.tip} {...ink} strokeWidth={3} />
      </g>
      {/* head */}
      <g transform={`translate(0,${headY + 26}) rotate(${headRot} 300 440) translate(300,440) scale(1.16) translate(-300,-440)`}>
        {/* ears */}
        <g>
          <path d="M200,290 C172,282 162,320 172,345 C180,365 196,372 210,366 Z" fill={HOST.skin} {...ink} />
          <path d="M196,305 C184,310 182,330 190,345" fill="none" stroke={HOST.ear} strokeWidth={7} strokeLinecap="round" />
          <path d="M400,290 C428,282 438,320 428,345 C420,365 404,372 390,366 Z" fill={HOST.skin} {...ink} />
          <path d="M404,305 C416,310 418,330 410,345" fill="none" stroke={HOST.ear} strokeWidth={7} strokeLinecap="round" />
        </g>
        {/* face */}
        <path d="M194,220 C190,300 196,362 218,404 C238,442 268,462 300,464 C332,462 362,442 382,404 C404,362 410,300 406,220 Z" fill={HOST.skin} {...ink} />
        <path d="M218,404 C238,442 268,462 300,464 C285,450 250,430 230,392 Z" fill={HOST.skinShade} opacity={0.35} />
        {/* blush */}
        <ellipse cx={236} cy={372} rx={20} ry={9} fill="#F2A88A" opacity={0.28} />
        <ellipse cx={364} cy={372} rx={20} ry={9} fill="#F2A88A" opacity={0.28} />
        {brow(252, -1)}{brow(348, 1)}
        {eye(253)}{eye(347)}
        {/* nose */}
        <path d="M296,330 Q292,352 286,362 Q296,372 312,364" fill="none" {...ink} strokeWidth={4} />
        {mouth()}
        {/* glasses */}
        <g fill="rgba(255,255,255,0.05)" stroke={HOST.glass} strokeWidth={6.5} strokeLinejoin="round">
          <rect x={202} y={280} width={95} height={58} rx={9} />
          <rect x={303} y={280} width={95} height={58} rx={9} />
          <path d="M297,298 Q300,292 303,298" fill="none" />
          <path d="M202,292 L188,288 M398,292 L412,288" fill="none" />
        </g>
        {gl < 1 && <g opacity={Math.sin(gl * Math.PI) * 0.65}>
          <path d={`M${215 + gl * 70},336 L${235 + gl * 70},282`} stroke="#fff" strokeWidth={9} />
          <path d={`M${303 + gl * 70},336 L${323 + gl * 70},282`} stroke="#fff" strokeWidth={9} />
        </g>}
        {/* hair: lags the head a little */}
        <g transform={`rotate(${hairLag} 300 300) translate(300,300) scale(1.05,0.84) translate(-300,-300)`}>
          <path d="M196,300 C186,268 182,232 188,204 C176,196 170,184 172,170 C184,176 192,174 198,170 C202,150 214,134 232,124 C228,112 230,100 236,92 C246,104 256,108 266,108 C278,96 296,90 314,90 C320,82 330,78 340,78 C340,86 342,92 346,96 C368,100 390,112 404,130 C414,126 424,126 432,130 C426,138 422,146 420,152 C430,176 432,206 426,232 C422,256 416,280 410,302 C404,282 398,262 388,248 C376,240 364,236 352,236 C344,226 334,218 322,212 C300,218 276,224 256,230 C238,236 222,246 212,262 C206,274 200,288 196,300 Z"
            fill={HOST.hair} {...ink} />
          {/* a swept lock falling onto the forehead, right of the parting */}
          <path d="M300,212 C314,232 332,244 356,246 C346,236 340,226 338,212 Z" fill={HOST.hair} {...ink} />
          <path d="M230,170 C250,150 280,140 310,140 M322,128 C352,130 380,146 398,170 M214,212 C230,198 252,190 274,188 M366,196 C384,204 400,220 408,240" fill="none" stroke={HOST.hairHi} strokeWidth={8} strokeLinecap="round" />
          {/* sideburns */}
          <path d="M196,290 L194,336 L206,336 L210,286 Z M404,290 L406,336 L394,336 L390,286 Z" fill={HOST.hair} />
        </g>
      </g>
      <ArmShape side={1} arm={rArm} f={f} />
    </g>
  </svg>;
};

/* ---------- the host inside a film: config + a per-scene layer ---------- */
export type HostBeat = {at: number; expr?: HostExpr; pose?: HostPose; look?: [number, number]};
export type HostScene = {expr?: HostExpr; pose?: HostPose; beats?: HostBeat[]; x?: number; y?: number; size?: number; mute?: boolean};
/** tutorial.host: where the host sits by default, and the scenes it appears in (docs/video-craft/IP形象.md). */
export type HostConfig = {x?: number; y?: number; size?: number; scenes: Record<string, HostScene>};

const useWords = (src?: string): HostWord[] => {
  const [words, setWords] = React.useState<HostWord[]>([]);
  const [handle] = React.useState(() => (src ? delayRender(`host words ${src}`) : null));
  React.useEffect(() => {
    if (!src || handle === null) return;
    fetch(staticFile(src)).then((r) => r.json()).then((j) => setWords(j.words ?? [])).catch(() => setWords([])).finally(() => continueRender(handle));
  }, [src, handle]);
  return words;
};

/** One scene's host: pops in when the previous scene had none, sinks out when the next has none; lip-syncs to the scene's narration. */
export const HostLayer: React.FC<{cfg: HostConfig; sceneId: string; prevId?: string; nextId?: string; audioSrc: string; leadMs: number; dur: number}> = ({cfg, sceneId, prevId, nextId, audioSrc, leadMs, dur}) => {
  const f = useCurrentFrame();
  const sc = cfg.scenes[sceneId];
  const words = useWords(sc && !sc.mute ? audioSrc.replace(/\.mp3$/, '.words.json') : undefined);
  if (!sc) return null;
  const shifted = words.map((w) => ({...w, ms: w.ms + leadMs}));
  const t = f / 30;
  let expr = sc.expr ?? 'calm', pose = sc.pose ?? 'idle', look: [number, number] = [0.3, 0.2];
  let fromPose: HostPose = prevId && cfg.scenes[prevId] ? (cfg.scenes[prevId].beats?.slice(-1)[0]?.pose ?? cfg.scenes[prevId].pose ?? 'idle') : 'idle', poseAt = 6;
  for (const b of sc.beats ?? []) if (t >= b.at) {
    if (b.pose && b.pose !== pose) { fromPose = pose; pose = b.pose; poseAt = Math.round(b.at * 30); }
    if (b.expr) expr = b.expr;
    if (b.look) look = b.look;
  }
  const popIn = prevId && cfg.scenes[prevId] ? 1 : spring1(f / 9);
  const out = nextId && cfg.scenes[nextId] ? 0 : clamp((f - (dur - 8)) / 8);
  const enter = Math.max(0, popIn * (1 - out));
  if (enter <= 0) return null;
  const x = sc.x ?? cfg.x ?? 36, y = sc.y ?? cfg.y ?? 1110, size = sc.size ?? cfg.size ?? 270;
  return <div style={{position: 'absolute', left: x, top: y, width: size, height: (size * 720) / 600, opacity: clamp(enter * 3), filter: 'drop-shadow(0 8px 14px rgba(20,16,16,0.18))'}}>
    <Host f={f} words={shifted} expr={expr} pose={pose} fromPose={fromPose} poseAt={poseAt} look={look} size={size} enter={enter} seed={sceneId.length} />
  </div>;
};
/** 0 → 1 with a little overshoot (back-ease). */
const spring1 = (t: number) => { const x = clamp(t) - 1; return 1 + x * x * (2.7 * x + 1.7); };
