import React from 'react';
import {font} from '../theme';
import {clamp, ease, hash, springStep} from '../../fx';
import {Cue, S, Scene, cam, hitOf, phaseOp} from '../paper';
import {A, B, BG, Big, DIM, INK, LINE, Mono, PANEL, PANEL_HI, STEEL, mono} from '../tech';

// ai-faceswap-scam: a video call from "mum" asking for 50,000 — three ways to catch a real-time face swap (≈ 40 s).
// Script: inputs/ai-faceswap-scam/script.md (narration verbatim); storyboard: tutorials/ai-faceswap-scam.storyboard.md.
// Script rule: no real face, no face-swap footage, no app logos, no police badge. Every person is a grey silhouette,
// every phone screen a drawn mock tagged 「界面示意」, every number a blurred pill. The script's hand shots are drawn too
// (no hand footage in the material). Accents: red = the scam / the tell, amber A = the tip, cyan B = the safe move.

const W = 900;
/** Camera key that never lifts the title (stage y ≈ −14) under the top bar: caps the look-at y for the zoom. */
const camT = (at: number, x: number, y: number, z: number) => cam(at, x, Math.min(y, 540 + (555 / z - 14 - 540) / 0.55), z);
const RED = '#ff5a5a';
const SIL = '#6f8199';

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
const Chip: React.FC<{c?: string; size?: number; fill?: boolean; style?: React.CSSProperties; children: React.ReactNode}> = ({c = B, size = 48, fill, style, children}) => (
  <div style={{display: 'inline-block', background: fill ? c : BG, border: `4px solid ${c}`, color: fill ? BG : c, fontFamily: font, fontWeight: 900, fontSize: size,
    lineHeight: 1.25, padding: '2px 16px', whiteSpace: 'nowrap', ...style}}>{children}</div>
);
/** A stamp that slams down on frame `at` (drop from 1.6× with a tilt, contact squash). */
const Stamp: React.FC<{f: number; at: number; c?: string; size?: number; deg?: number; children: React.ReactNode}> = ({f, at, c = RED, size = 64, deg = -6, children}) => {
  if (f < at - 6) return null;
  const k = ease.inCubic(clamp((f - at + 6) / 6));
  const sq = hitOf(f, [at], 1);
  return <div style={{display: 'inline-block', transform: `rotate(${deg}deg) scale(${(1.6 - 0.6 * k) * (1 + 0.05 * sq)}, ${(1.6 - 0.6 * k) * (1 - 0.06 * sq)})`,
    opacity: clamp(k * 2), border: `6px solid ${c}`, color: c, background: 'rgba(12,26,44,0.92)', fontFamily: font, fontWeight: 900, fontSize: size,
    padding: '4px 22px', whiteSpace: 'nowrap'}}>{children}</div>;
};
/** Blurred personal data: grey pills, never characters. */
const Blur: React.FC<{w: number; h?: number; c?: string}> = ({w, h = 34, c = STEEL}) => (
  <span style={{display: 'inline-block', width: w, height: h, borderRadius: h / 2, background: c, opacity: 0.55, filter: 'blur(3px)', verticalAlign: 'middle'}} />
);
/** Tip title: "第一招" in dim mono-ish kicker, the move below in ink. */
const Title: React.FC<{f: number; k?: string; kc?: string; lines: React.ReactNode[]; size?: number; at?: number}> = ({f, k, kc = A, lines, size = 80, at = 0}) => (
  <Abs y={-10} w={W} style={phaseOp(f, at)}>
    {k && <div style={{fontFamily: font, fontWeight: 900, fontSize: 48, color: kc, marginBottom: 6, whiteSpace: 'nowrap'}}>{k}</div>}
    {lines.map((l, i) => <div key={i} style={{fontFamily: font, fontWeight: 900, fontSize: size, lineHeight: 1.15, color: INK, whiteSpace: 'nowrap'}}>{l}</div>)}
  </Abs>
);
const red = (s: string) => <span style={{color: RED}}>{s}</span>;
const amber = (s: string) => <span style={{color: A}}>{s}</span>;
const cyan = (s: string) => <span style={{color: B}}>{s}</span>;

/* ---------- drawn parts: silhouette, phone, hands ---------- */

/** The caller: a grey head-and-shoulders silhouette (no face). Local box ±190 × −190…170. `glitch` tears it into
 *  displaced horizontal slices with a red / cyan split; `turn` (0…1) turns the head to the side while the swapped
 *  "face layer" (the lighter oval) stays frontal — the mismatch a real-time swap shows. */
const Silhouette: React.FC<{id: string; f: number; glitch?: number; turn?: number; fade?: number; mesh?: number; c?: string}> = ({id, f, glitch = 0, turn = 0, fade = 0, mesh = 0, c = SIL}) => {
  const headRx = 92 - 26 * turn;
  const body = (fill: string, op = 1, dx = 0) => <g opacity={op} transform={`translate(${dx} 0)`}>
    <path d="M-185 170 C-180 70 -110 40 -60 30 L60 30 C110 40 180 70 185 170 Z" fill={fill} />
    <rect x={-34} y={-10} width={68} height={50} fill={fill} />
    <ellipse cx={14 * turn} cy={-78} rx={headRx} ry={108} fill={fill} />
    {turn > 0.05 && <path d={`M${14 * turn + headRx - 6} -92 l${30 * turn} 30 l${-30 * turn} 8`} fill={fill} />}
  </g>;
  // the swapped face layer: slightly lighter oval that stays where a frontal face would be
  const face = <ellipse cx={0} cy={-74} rx={70} ry={86} fill="#8fa2ba" opacity={0.55} />;
  const slices = 9;
  const g = glitch;
  const seed = Math.floor(f / 2);
  return <g opacity={1 - fade}>
    {g > 0 && <>{body(RED, 0.55 * g, -14 * g)}{body(B, 0.55 * g, 14 * g)}</>}
    <defs>{Array.from({length: slices}, (_, i) => <clipPath key={i} id={`${id}-s${i}`}><rect x={-260} y={-190 + i * 40} width={520} height={40} /></clipPath>)}</defs>
    {Array.from({length: slices}, (_, i) => {
      const dx = g > 0 && hash(seed * 7.3 + i * 3.1) > 0.45 ? (hash(seed * 1.7 + i * 9.7) - 0.5) * 90 * g : 0;
      const fdx = dx + (turn > 0 ? -10 * turn * (i < 5 ? 1 : 0) : 0);
      return <g key={i} clipPath={`url(#${id}-s${i})`}>
        <g transform={`translate(${dx} 0)`}>{body(c)}</g>
        <g transform={`translate(${fdx} 0)`}>{face}</g>
      </g>;
    })}
    {mesh > 0 && <g opacity={mesh} stroke={B} strokeWidth={2.5} fill="none">
      {[-60, -30, 0, 30, 60].map((dx) => <ellipse key={`v${dx}`} cx={0} cy={-74} rx={Math.abs(dx) + 4} ry={86} opacity={0.8} />)}
      {[-130, -100, -74, -48, -20].map((y) => <line key={`h${y}`} x1={-70 * Math.sqrt(Math.max(0, 1 - ((y + 74) / 86) ** 2))}
        x2={70 * Math.sqrt(Math.max(0, 1 - ((y + 74) / 86) ** 2))} y1={y} y2={y} />)}
      <ellipse cx={0} cy={-74} rx={70} ry={86} strokeWidth={4} />
    </g>}
  </g>;
};

/** Phone handset glyph (white), centred on 0,0. */
const Handset: React.FC<{s?: number; deg?: number; c?: string}> = ({s = 1, deg = 135, c = '#fff'}) => (
  <g transform={`rotate(${deg}) scale(${s})`}>
    <path d="M-24 -10 C-24 -26 -10 -30 -2 -26 L4 -14 C6 -10 4 -6 0 -4 C-4 -2 -6 2 -4 6 C0 14 6 20 14 24 C18 26 22 24 24 20 C26 16 30 14 34 16 L46 22 C50 30 46 44 30 44 C2 44 -24 18 -24 -10 Z"
      transform="translate(-11 -7)" fill={c} />
  </g>
);

/** Drawn video-call screen. `kids` render in a 0…w × 0…h SVG under the bars. */
const CallPhone: React.FC<{x: number; y: number; w: number; h: number; f: number; name?: string; tint?: number; border?: string; hangAt?: number;
  timer?: boolean; children?: React.ReactNode; overlay?: React.ReactNode}> = ({x, y, w, h, f, name = '妈妈', tint = 0, border = STEEL, hangAt = 1e9, timer = true,
  children, overlay}) => {
  const press = f >= hangAt ? hitOf(f, [hangAt], 1) : 0;
  const sec = 12 + Math.floor(f / 30);
  return <Abs x={x} y={y} w={w} h={h}>
    <div style={{position: 'absolute', inset: 0, borderRadius: 48, border: `6px solid ${border}`, background: '#0a1626', overflow: 'hidden'}}>
      <div style={{position: 'absolute', inset: 0, background: `radial-gradient(ellipse at 50% 40%, rgba(255,90,90,${0.35 * tint}), rgba(255,90,90,${0.12 * tint}) 70%)`}} />
      <svg width={w - 12} height={h - 12} style={{position: 'absolute', left: 0, top: 0, overflow: 'hidden'}}>{children}</svg>
      <div style={{position: 'absolute', left: 0, right: 0, top: 28, textAlign: 'center', fontFamily: font, fontWeight: 900, fontSize: 52, color: INK}}>{name}</div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 94, textAlign: 'center', fontFamily: mono, fontWeight: 700, fontSize: 32, color: DIM}}>
        视频通话 {timer ? `00:${String(sec).padStart(2, '0')}` : ''}</div>
      <svg width={w - 12} height={150} style={{position: 'absolute', left: 0, bottom: 10}}>
        {[-1, 1].map((s) => <circle key={s} cx={(w - 12) / 2 + s * 150} cy={70} r={44} fill={PANEL_HI} />)}
        <g transform={`translate(${(w - 12) / 2} 70) scale(${1 - 0.12 * press})`}>
          <circle r={56} fill={RED} />
          <Handset s={1.1} />
        </g>
      </svg>
      {overlay}
    </div>
    <div style={{position: 'absolute', right: -14, top: -26, background: BG, border: `3px solid ${DIM}`, color: DIM, fontFamily: font, fontWeight: 800, fontSize: 32,
      padding: '0 10px'}}>界面示意</div>
  </Abs>;
};
/** Where the red hang-up button sits inside a CallPhone (for the tapping finger). */
const hangPos = (w: number, h: number) => [(w - 12) / 2, h - 12 - 10 - 150 + 70 + 6] as const;

/** Open palm (back of the hand), drawn; origin at the wrist centre, fingers up. */
const Palm: React.FC<{c?: string; s?: number}> = ({c = STEEL, s = 1}) => (
  <g transform={`scale(${s})`} fill={c} stroke={BG} strokeWidth={5} strokeLinejoin="round">
    <rect x={-62} y={-150} width={124} height={150} rx={46} />
    {[-48, -16, 16, 48].map((x, i) => <rect key={x} x={x - 15} y={-[230, 262, 256, 226][i]} width={30} height={[110, 140, 134, 104][i]} rx={15} />)}
    <rect x={-30} y={-118} width={30} height={100} rx={15} transform="rotate(-48 -15 -40) translate(-62 -10)" />
  </g>
);
/** A pointing hand: index finger up, tip at 0,0. */
const Pointer: React.FC<{c?: string; s?: number; deg?: number}> = ({c = STEEL, s = 1, deg = 0}) => (
  <g transform={`rotate(${deg}) scale(${s})`} fill={c} stroke={BG} strokeWidth={5} strokeLinejoin="round">
    <rect x={-22} y={0} width={44} height={150} rx={22} />
    <rect x={-50} y={100} width={130} height={150} rx={44} />
    <rect x={-74} y={140} width={44} height={84} rx={22} />
  </g>
);
/** Tap ripple at 0,0 from frame `at`. */
const Ripple: React.FC<{f: number; at: number; c?: string}> = ({f, at, c = INK}) => {
  if (f < at || f > at + 16) return null;
  const k = (f - at) / 16;
  return <circle r={20 + 70 * k} fill="none" stroke={c} strokeWidth={6 * (1 - k)} opacity={1 - k} />;
};

/* ---------- 1 hook: a video call from "mum", the first thing she says is a money demand ---------- */

const hookPlan = (cue: Cue) => ({a: cue('a', 26), b: cue('b', 52)});
const PH = {x: 170, y: 230, w: 560, h: 840};
const HookCall: React.FC<{f: number; bubbleAt: number; ring?: boolean}> = ({f, bubbleAt, ring = true}) => {
  // flicker: a short tear every 15 frames, frame 0 included
  const g = f % 15 < 3 ? 1 : 0;
  const tint = 0.6 + 0.4 * Math.sin(f / 4);
  const shake = ring && f < 40 ? 6 * Math.sin(f * 2.4) * (1 - f / 40) : 0;
  return <div style={{position: 'absolute', inset: 0, transform: `translateX(${shake}px)`}}>
    <CallPhone {...PH} f={f} tint={tint} border={RED}
      overlay={f >= bubbleAt - 1 && <div style={{position: 'absolute', left: 26, right: 26, top: 500, ...popIn(f, bubbleAt), transformOrigin: '20% 0%'}}>
        <div style={{background: RED, color: '#fff', borderRadius: '10px 34px 34px 34px', padding: '18px 24px', fontFamily: font, fontWeight: 900, fontSize: 48,
          lineHeight: 1.3}}>急！先转我5万，<br />别告诉爸</div>
      </div>}>
      <g transform={`translate(${(PH.w - 12) / 2} 360)`}><Silhouette id="hk" f={f} glitch={g} /></g>
    </CallPhone>
  </div>;
};
const Hook: Scene = ({f, cue}) => {
  const p = hookPlan(cue);
  return <Root>
    <Abs y={-10} w={W}>
      <Big size={88} style={{whiteSpace: 'nowrap'}}>视频里是妈妈，</Big>
      <Big size={88} c={RED} style={{whiteSpace: 'nowrap'}}>开口就要5万</Big>
    </Abs>
    <HookCall f={f} bubbleAt={Math.min(6, p.a)} />
    <Abs x={0} y={PH.y + PH.h - 300} w={W} style={{display: 'flex', justifyContent: 'flex-end'}}>
      <Pop f={f} at={p.b} origin="100% 50%"><Chip c={A} size={64} fill>转不转？</Chip></Pop>
    </Abs>
  </Root>;
};
Hook.sfx = (cue) => {
  const p = hookPlan(cue);
  return [{at: 0, kind: 'fs-phone-buzz', gain: 0.3}, {at: 6, kind: 'pop', gain: 0.14}, {at: p.b, kind: 'tap', gain: 0.18}];
};
Hook.camera = (cue) => {
  const p = hookPlan(cue);
  return [camT(0, 450, 560, 1.0), camT(p.a, 450, 640, 1.05), camT(p.b, 450, 600, 1.03)];
};

/* ---------- 2 the trick: the face is a mask on a mesh, the voice a copy ---------- */

const fakePlan = (cue: Cue) => ({a: cue('a', 34), b: cue('b', 62)});
const Wave: React.FC<{f: number; c: string; seed: number; on: number}> = ({f, c, seed, on}) => (
  <g>{Array.from({length: 22}, (_, i) => {
    const v = 0.25 + 0.75 * Math.abs(Math.sin(i * 0.9 + seed) * Math.sin(f / 5 + i * 0.6));
    const h = 110 * v * on;
    return <rect key={i} x={i * 16} y={-h / 2} width={9} height={h} rx={4} fill={c} />;
  })}</g>
);
const Fake: Scene = ({f, cue}) => {
  const p = fakePlan(cue);
  const t = S(f);
  const mesh = clamp(f / 10);
  // on "脸能换" the face layer peels off to the right and an "AI" chip sits where it was
  const peel = springStep(t, S(p.a), {f: 2, z: 0.7});
  const voice = clamp((f - p.b) / 8);
  const g = f >= p.a && f < p.a + 8 ? 1 : 0;
  return <Root>
    <Abs y={-10} w={W}>
      <div style={{fontFamily: font, fontWeight: 900, fontSize: 48, color: DIM, whiteSpace: 'nowrap', ...phaseOp(f, 0)}}>骗子用 AI</div>
      <div style={{fontFamily: font, fontWeight: 900, fontSize: 92, lineHeight: 1.15, color: INK, whiteSpace: 'nowrap'}}>
        <span style={{opacity: clamp((f - p.a + 4) / 6)}}>脸能{red('换')}，</span><span style={{opacity: clamp((f - p.b + 4) / 6)}}>声音能{red('仿')}</span></div>
    </Abs>
    <svg width={W} height={1080} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
      <g transform={`translate(${300} 560) scale(1.35)`}>
        <Silhouette id="fk" f={f} glitch={g} mesh={mesh * (1 - 0.6 * peel)} />
        {/* the peeled face: a lighter oval with its mesh, flying out */}
        <g transform={`translate(${250 * peel} ${-30 * peel}) rotate(${18 * peel} 0 -74)`} opacity={clamp(peel * 3)}>
          <ellipse cx={0} cy={-74} rx={70} ry={86} fill="#8fa2ba" stroke={B} strokeWidth={4} />
          {[-40, 0, 40].map((dx) => <ellipse key={dx} cx={0} cy={-74} rx={Math.abs(dx) + 4} ry={86} fill="none" stroke={B} strokeWidth={2} />)}
        </g>
        {peel > 0.3 && <g opacity={clamp((peel - 0.3) * 3)}>
          <rect x={-56} y={-110} width={112} height={72} rx={10} fill={A} />
          <text x={0} y={-58} textAnchor="middle" fontFamily={mono} fontWeight={800} fontSize={48} fill={BG}>AI</text>
        </g>}
      </g>
      {/* voice: the real wave and the copy, the same shape */}
      <g opacity={voice} transform="translate(520 700)">
        <text x={0} y={-90} fontFamily={font} fontWeight={900} fontSize={44} fill={DIM}>声音</text>
        <g transform="translate(0 -10)"><Wave f={f} c={STEEL} seed={1} on={voice} /></g>
        <text x={0} y={110} fontFamily={font} fontWeight={900} fontSize={44} fill={RED}>AI 仿的</text>
        <g transform="translate(0 190)"><Wave f={f} c={RED} seed={1} on={voice} /></g>
      </g>
    </svg>
  </Root>;
};
Fake.sfx = (cue) => {
  const p = fakePlan(cue);
  return [{at: 2, kind: 'tick', gain: 0.1}, {at: p.a, kind: 'whoosh-short', gain: 0.12}, {at: p.b, kind: 'tap', gain: 0.14}];
};
Fake.camera = (cue) => {
  const p = fakePlan(cue);
  return [camT(0, 330, 560, 1.04), camT(p.b, 560, 640, 1.03)];
};

/* ---------- 3 three moves, ten seconds ---------- */

const threePlan = (cue: Cue) => ({a: cue('a', 24)});
const Three: Scene = ({f, cue}) => {
  const p = threePlan(cue);
  // the number flips 1 → 2 → 3 (8 frames each) and lands with a squash
  const n = f < 6 ? 1 : f < 12 ? 2 : 3;
  const flip = (f % 6) / 6;
  const land = hitOf(f, [12], 1.4);
  const ring = clamp((f - p.a) / 30);
  return <Root>
    <Abs y={110} w={W} style={{display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 20}}>
      <div style={{fontFamily: mono, fontWeight: 800, fontSize: 480, lineHeight: 0.9, color: A,
        transform: f < 12 ? `scaleY(${0.3 + 0.7 * Math.abs(Math.cos(flip * Math.PI))})` : `scale(${1 + 0.05 * land}, ${1 - 0.08 * land})`, transformOrigin: '50% 100%'}}>{n}</div>
      <Big size={160} style={{marginBottom: 30}}>招</Big>
    </Abs>
    <Abs y={640} w={W} style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 34, opacity: clamp((f - p.a + 4) / 6)}}>
      <svg width={190} height={190} viewBox="-95 -95 190 190">
        <circle r={78} fill="none" stroke={LINE} strokeWidth={14} />
        <circle r={78} fill="none" stroke={B} strokeWidth={14} strokeDasharray={490} strokeDashoffset={490 * (1 - ring)} transform="rotate(-90)" />
        <rect x={-14} y={-112} width={28} height={20} rx={4} fill={B} />
        <line x1={0} y1={0} x2={56 * Math.sin(ring * Math.PI * 2)} y2={-56 * Math.cos(ring * Math.PI * 2)} stroke={INK} strokeWidth={8} strokeLinecap="round" />
      </svg>
      <Big size={120} c={B} style={{whiteSpace: 'nowrap'}}>10秒识破</Big>
    </Abs>
  </Root>;
};
Three.sfx = (cue) => {
  const p = threePlan(cue);
  return [{at: 0, kind: 'tick', gain: 0.1}, {at: 6, kind: 'tick', gain: 0.1}, {at: 12, kind: 'thud', gain: 0.2}, {at: p.a, kind: 'fs-watch-tick', gain: 0.14}];
};

/* ---------- 4 move one: wave a hand in front of the face, or turn sideways ---------- */

const wavePlan = (cue: Cue) => ({a: cue('a', 20), b: cue('b', 92), c: cue('c', 134), d: cue('d', 190)});
const WP = {x: 120, y: 250, w: 660, h: 720};
const WaveScene: Scene = ({f, cue}) => {
  const p = wavePlan(cue);
  // the hand sweeps left ↔ right across the face from "挥挥手" until "侧脸" (period 16 frames)
  const handOn = f >= p.a && f < p.b + 6;
  const ph = (f - p.a) / 16 * Math.PI * 2;
  const hx = 324 + 170 * Math.sin(ph);
  const near = handOn ? clamp(1 - Math.abs(hx - 324) / 90) : 0;
  const turn = springStep(S(f), S(p.b + 4), {f: 1.6, z: 0.8}) * (f >= p.b ? 1 : 0);
  // after "扭曲、卡顿" the picture keeps tearing and the timer freezes
  const tear = f >= p.d ? (f % 10 < 4 ? 1 : 0.3) : 0;
  const frozen = f >= p.c;
  const g = Math.max(near, tear, turn > 0.2 && f % 12 < 3 ? 0.8 : 0);
  const sw = hitOf(f, [p.b], 1);
  return <Root>
    <Title f={f} k="第一招" lines={[<>让他在脸前{amber('挥挥手')}</>, <>或者{amber('转个侧脸')}</>]} size={76} />
    <CallPhone {...WP} f={frozen ? p.c : f} border={f >= p.c ? RED : STEEL} tint={f >= p.c ? 0.5 : 0}>
      <g transform={`translate(${(WP.w - 12) / 2} 380) scale(1.1)`}><Silhouette id="wv" f={f} glitch={g} turn={turn} /></g>
      {handOn && <g transform={`translate(${hx} 560) rotate(${12 * Math.cos(ph)})`}><Palm s={1.25} /></g>}
      {turn > 0.05 && <g opacity={clamp(turn * 2) * (f >= p.c ? 0.4 : 1)} transform={`translate(${(WP.w - 12) / 2} 130) scale(${1 + 0.05 * sw})`}>
        <path d="M-120 40 Q0 -40 120 40" fill="none" stroke={A} strokeWidth={10} strokeLinecap="round" />
        <path d="M120 40 L84 40 M120 40 L112 6" stroke={A} strokeWidth={10} strokeLinecap="round" />
      </g>}
    </CallPhone>
    {frozen && <Abs x={WP.x + 40} y={WP.y + 150} w={WP.w - 80} style={{display: 'flex', justifyContent: 'space-between'}}>
      <Stamp f={f} at={p.d} deg={-8}>扭曲</Stamp>
      <Stamp f={f} at={p.d + 12} deg={6}>卡顿</Stamp>
    </Abs>}
    {frozen && <Abs x={WP.x + 30} y={WP.y + WP.h - 250} w={WP.w - 60} style={{textAlign: 'center', ...phaseOp(f, p.c)}}>
      <Chip c={RED} size={48}>实时换脸 · 容易露馅</Chip>
    </Abs>}
  </Root>;
};
WaveScene.sfx = (cue) => {
  const p = wavePlan(cue);
  return [{at: p.a, kind: 'whoosh-short', gain: 0.1}, {at: p.a + 16, kind: 'whoosh-short', gain: 0.08}, {at: p.a + 32, kind: 'whoosh-short', gain: 0.08},
    {at: p.b, kind: 'whoosh', gain: 0.1}, {at: p.c, kind: 'block', gain: 0.14}, {at: p.d, kind: 'stamp', gain: 0.18}, {at: p.d + 12, kind: 'stamp', gain: 0.16}];
};
WaveScene.camera = (cue) => {
  const p = wavePlan(cue);
  return [camT(0, 450, 540, 1.0), camT(p.a, 450, 640, 1.06), camT(p.b, 450, 560, 1.03), camT(p.d, 450, 620, 1.06)];
};

/* ---------- 5 move two: press the nose — a real nose squashes, the swapped one may not ---------- */

const nosePlan = (cue: Cue) => ({a: cue('a', 20), b: cue('b', 70), c: cue('c', 120)});
const FaceCard: React.FC<{f: number; x: number; label: string; c: string; press: number; squash: boolean; glitchy: boolean}> = ({f, x, label, c, press, squash, glitchy}) => {
  // the finger comes in from below-right and presses the nose (press 0…1)
  const sq = squash ? press : 0;
  const tear = glitchy && press > 0.6 && f % 8 < 3;
  return <Abs x={x} y={250} w={420} h={620}>
    <div style={{position: 'absolute', inset: 0, border: `6px solid ${c}`, borderRadius: 28, background: '#0a1626'}} />
    <div style={{position: 'absolute', left: 0, top: 0, background: c, color: BG, fontFamily: font, fontWeight: 900, fontSize: 52, padding: '2px 20px',
      borderRadius: '22px 0 22px 0'}}>{label}</div>
    <svg width={420} height={620} style={{position: 'absolute', left: 0, top: 0}}>
      <g transform={`translate(${210 + (tear ? 18 : 0)} 330)`}>
        <ellipse cx={0} cy={0} rx={130} ry={170} fill={SIL} />
        {/* the nose: a rounded wedge that squashes flat when pressed */}
        <g transform={`translate(0 20) scale(${1 + 0.45 * sq} ${1 - 0.4 * sq})`}>
          <path d="M-8 -60 C-12 -20 -34 8 -30 22 C-26 34 26 34 30 22 C34 8 12 -20 8 -60 Z" fill="#9db0c7" />
        </g>
        {tear && <rect x={-140} y={10} width={280} height={30} fill={c} opacity={0.5} />}
      </g>
      <g transform={`translate(${210 + 20 + 160 * (1 - press)} ${368 + 230 * (1 - press)})`}><Pointer s={0.9} deg={-14} /></g>
    </svg>
  </Abs>;
};
const Nose: Scene = ({f, cue}) => {
  const p = nosePlan(cue);
  // press-release cycles of 24 frames from "按一下鼻子"
  const cyc = (k: number) => (f < p.a + k ? 0 : Math.sin(Math.PI * clamp(((f - p.a - k) % 30) / 24)));
  return <Root>
    <Title f={f} k="第二招" lines={[<>让他{amber('按一下鼻子')}</>]} size={84} />
    <FaceCard f={f} x={0} label="真人" c={B} press={cyc(0)} squash glitchy={false} />
    <FaceCard f={f} x={480} label="AI" c={RED} press={cyc(4)} squash={false} glitchy />
    <Abs x={0} y={900} w={420} style={{textAlign: 'center'}}><Pop f={f} at={p.b} origin="50% 50%"><Big size={50} c={B}>鼻子会变形</Big></Pop></Abs>
    <Abs x={480} y={900} w={420} style={{textAlign: 'center'}}><Pop f={f} at={p.c - 6} origin="50% 50%"><Big size={50} c={RED}>可能不变形</Big></Pop></Abs>
    <Abs x={480} y={150} w={420} style={{textAlign: 'center'}}><Stamp f={f} at={p.c + 10} size={60} deg={8}>露馅</Stamp></Abs>
  </Root>;
};
Nose.sfx = (cue) => {
  const p = nosePlan(cue);
  return [{at: p.a + 12, kind: 'tap', gain: 0.14}, {at: p.a + 42, kind: 'tap', gain: 0.12}, {at: p.b, kind: 'pop', gain: 0.12}, {at: p.c - 6, kind: 'pop', gain: 0.12},
    {at: p.c + 10, kind: 'stamp', gain: 0.18}];
};
Nose.camera = (cue) => {
  const p = nosePlan(cue);
  return [camT(0, 450, 560, 1.0), camT(p.b, 210, 600, 1.05), camT(p.c, 690, 600, 1.05)];
};

/* ---------- 6 move three: hang up, call back the number you saved ---------- */

const callPlan = (cue: Cue) => ({a: cue('a', 30), b: cue('b', 62)});
const CP = {x: 170, y: 250, w: 560, h: 800};
const CONTACTS = [{n: '爸爸'}, {n: '妈妈', tag: '存的号码'}, {n: '姐姐'}, {n: '同事 · 小王'}];
const Callback: Scene = ({f, cue}) => {
  const p = callPlan(cue);
  const tapHang = p.a + 6, tapRow = p.b + 10, ring = p.b + 26;
  const [hx, hy] = hangPos(CP.w, CP.h);
  // the finger: to the hang-up button, then to the 妈妈 row
  const fx = f < tapHang + 10 ? hx : 280, fy = f < tapHang + 10 ? hy : 330;
  const reach = f < tapHang + 10 ? clamp((f - tapHang + 10) / 10) : f < tapRow ? clamp((f - tapHang - 14) / 10) : 1;
  const fingerOp = f < ring ? 1 : 1 - clamp((f - ring) / 6);
  const stage = f < tapHang + 4 ? 0 : f < tapRow + 6 ? 1 : 2;
  return <Root>
    <Title f={f} k="第三招 · 最管用" lines={[<>{red('挂断')}，打她{cyan('存着的号码')}</>]} size={74} />
    {stage === 0 && <CallPhone {...CP} f={f} hangAt={tapHang}>
      <g transform={`translate(${(CP.w - 12) / 2} 360)`}><Silhouette id="cb" f={f} glitch={f % 15 < 2 ? 0.8 : 0} /></g>
    </CallPhone>}
    {stage > 0 && <Abs x={CP.x} y={CP.y} w={CP.w} h={CP.h}>
      <div style={{position: 'absolute', inset: 0, borderRadius: 48, border: `6px solid ${stage === 2 ? B : STEEL}`, background: '#0a1626', overflow: 'hidden'}}>
        {/* contacts */}
        <div style={{position: 'absolute', left: 30, right: 30, top: 50, ...phaseOp(f, tapHang + 4, tapRow + 6)}}>
          <Big size={52} style={{marginBottom: 24}}>通讯录</Big>
          {CONTACTS.map((c) => {
            const on = c.tag && f >= tapRow;
            return <div key={c.n} style={{height: 104, borderRadius: 16, background: on ? B : PANEL, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 18,
              padding: '0 20px', fontFamily: font, fontWeight: 900, fontSize: 46, color: on ? BG : INK, whiteSpace: 'nowrap'}}>
              <div style={{width: 60, height: 60, borderRadius: 30, background: on ? BG : SIL, flex: 'none'}} />
              {c.n}{c.tag && <span style={{marginLeft: 'auto', fontSize: 34, color: on ? BG : B}}>{c.tag}</span>}
            </div>;
          })}
        </div>
        {/* ringing: calling the saved number */}
        <div style={{position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 110, ...phaseOp(f, tapRow + 6)}}>
          <svg width={320} height={320} viewBox="-160 -160 320 320">
            {[0, 1, 2].map((i) => {
              const k = ((f - ring + i * 12) % 36) / 36;
              return f >= ring ? <circle key={i} r={70 + 80 * k} fill="none" stroke={B} strokeWidth={6} opacity={1 - k} /> : null;
            })}
            <circle r={70} fill={SIL} />
          </svg>
          <Big size={60}>妈妈</Big>
          <div style={{marginTop: 14}}><Blur w={300} h={40} /></div>
          <Mono size={36} c={B} w={800} style={{marginTop: 22}}>正在呼叫 · 存的号码</Mono>
        </div>
      </div>
      <div style={{position: 'absolute', right: -14, top: -26, background: BG, border: `3px solid ${DIM}`, color: DIM, fontFamily: font, fontWeight: 800, fontSize: 32,
        padding: '0 10px'}}>界面示意</div>
    </Abs>}
    <svg width={W} height={1080} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', opacity: fingerOp}}>
      <g transform={`translate(${CP.x + fx} ${CP.y + fy})`}>
        <Ripple f={f} at={tapHang} /><Ripple f={f} at={tapRow} c={B} />
        <g transform={`translate(${60 * (1 - reach)} ${200 * (1 - reach)})`}><Pointer s={0.9} deg={-10} /></g>
      </g>
    </svg>
  </Root>;
};
Callback.sfx = (cue) => {
  const p = callPlan(cue);
  return [{at: p.a + 6, kind: 'tap', gain: 0.2}, {at: p.b + 10, kind: 'tap', gain: 0.18}, {at: p.b + 26, kind: 'chime', gain: 0.1}];
};
Callback.camera = (cue) => {
  const p = callPlan(cue);
  return [camT(0, 450, 700, 1.04), camT(p.b, 450, 560, 1.04)];
};

/* ---------- 7 and a family password ---------- */

const safePlan = (cue: Cue) => ({a: cue('a', 36), b: cue('b', 100)});
const Safeword: Scene = ({f, cue}) => {
  const p = safePlan(cue);
  const t = S(f);
  const shut = springStep(t, S(6), {f: 2.4, z: 0.6});
  const shake = f >= p.b && f < p.b + 14 ? 10 * Math.sin((f - p.b) * 2) : 0;
  return <Root>
    <Title f={f} k="再加一道" lines={[<>家里约个{amber('暗号')}</>]} size={88} />
    {/* the lock: shackle drops shut */}
    <svg width={260} height={300} viewBox="-130 -160 260 300" style={{position: 'absolute', left: 640, top: -10}}>
      <path d={`M-60 ${-10 - 40 * (1 - shut)} V-60 A60 60 0 0 1 60 -60 V${-10 - 40 * (1 - shut)}`} fill="none" stroke={A} strokeWidth={22} />
      <rect x={-95} y={-20} width={190} height={150} rx={20} fill={A} />
      <circle cx={0} cy={44} r={18} fill={BG} /><rect x={-7} y={50} width={14} height={40} fill={BG} />
    </svg>
    {/* the question, from you */}
    <Abs x={120} y={330} w={780}>
      <Pop f={f} at={p.a} origin="100% 0%"><div style={{background: B, color: BG, borderRadius: '34px 10px 34px 34px', padding: '22px 28px', fontFamily: font,
        fontWeight: 900, fontSize: 56, lineHeight: 1.3}}>我们第一次旅游<br />去的哪儿？</div></Pop>
    </Abs>
    {/* the caller can't answer */}
    <Abs x={0} y={620} w={520} style={{transform: `translateX(${shake}px)`}}>
      <Pop f={f} at={p.a + 30}><div style={{display: 'flex', alignItems: 'center', gap: 20}}>
        <svg width={110} height={110} viewBox="-55 -55 110 110"><circle r={52} fill={SIL} /></svg>
        <div style={{background: PANEL_HI, borderRadius: '10px 34px 34px 34px', padding: '18px 34px', fontFamily: mono, fontWeight: 800, fontSize: 64, color: DIM}}>？？？</div>
      </div></Pop>
    </Abs>
    <Abs x={120} y={850} w={780} style={{display: 'flex', justifyContent: 'center'}}><Stamp f={f} at={p.b + 8} size={76} deg={-4}>答不上来 → 别信</Stamp></Abs>
  </Root>;
};
Safeword.sfx = (cue) => {
  const p = safePlan(cue);
  return [{at: 10, kind: 'block', gain: 0.16}, {at: p.a, kind: 'pop', gain: 0.14}, {at: p.a + 30, kind: 'pop', gain: 0.1}, {at: p.b + 8, kind: 'stamp', gain: 0.2}];
};
Safeword.camera = (cue) => {
  const p = safePlan(cue);
  return [camT(0, 600, 400, 1.04), camT(p.a, 520, 520, 1.04), camT(p.b, 450, 760, 1.05)];
};

/* ---------- 8 what the police keep saying ---------- */

const policePlan = (cue: Cue) => ({a: cue('a', 26), b: cue('b', 66), c: cue('c', 94), d: cue('d', 140)});
const Police: Scene = ({f, cue}) => {
  const p = policePlan(cue);
  const ul = clamp((f - p.a - 4) / 14);
  return <Root>
    <Abs y={-10} w={W}><Big size={56} c={DIM}>警方反复提醒</Big></Abs>
    <Abs y={130} w={W}>
      <Pop f={f} at={p.a}><div style={{borderLeft: `10px solid ${RED}`, background: PANEL, padding: '26px 30px'}}>
        <div style={{fontFamily: font, fontWeight: 900, fontSize: 84, color: INK, whiteSpace: 'nowrap', position: 'relative', display: 'inline-block'}}>
          只凭一个视频
          <div style={{position: 'absolute', left: 0, bottom: -4, height: 10, width: `${100 * ul}%`, background: RED}} />
        </div>
        <div style={{fontFamily: font, fontWeight: 900, fontSize: 84, color: RED, whiteSpace: 'nowrap', marginTop: 10, opacity: clamp((f - p.b + 2) / 6)}}>→ 不转账</div>
      </div></Pop>
    </Abs>
    <Abs y={500} w={W}>
      <Pop f={f} at={p.c}><div style={{borderLeft: `10px solid ${B}`, background: PANEL, padding: '26px 30px'}}>
        <div style={{fontFamily: font, fontWeight: 900, fontSize: 84, color: INK, whiteSpace: 'nowrap'}}>拿不准 →</div>
        <div style={{display: 'flex', alignItems: 'baseline', gap: 24, marginTop: 10, whiteSpace: 'nowrap'}}>
          <span style={{fontFamily: font, fontWeight: 900, fontSize: 72, color: INK}}>打</span>
          <span style={{fontFamily: mono, fontWeight: 800, fontSize: 112, color: B}}>110</span>
          <span style={{fontFamily: mono, fontWeight: 800, fontSize: 80, color: DIM, opacity: clamp((f - p.d + 2) / 6)}}>/</span>
          <span style={{fontFamily: mono, fontWeight: 800, fontSize: 112, color: B, opacity: clamp((f - p.d + 2) / 6)}}>96110</span>
        </div>
      </div></Pop>
    </Abs>
    <Abs y={960} w={W}><Mono size={40} c={DIM}>参考：各地公安反诈提示</Mono></Abs>
  </Root>;
};
Police.sfx = (cue) => {
  const p = policePlan(cue);
  return [{at: p.a, kind: 'tap', gain: 0.16}, {at: p.b, kind: 'block', gain: 0.12}, {at: p.c, kind: 'tap', gain: 0.16}, {at: p.d, kind: 'tick', gain: 0.12}];
};
Police.camera = (cue) => {
  const p = policePlan(cue);
  return [camT(0, 450, 300, 1.05), camT(p.c, 450, 640, 1.05)];
};

/* ---------- 9 end: the same call — this time you hang up and it falls apart ---------- */

const endPlan = (cue: Cue) => ({a: cue('a', 44), b: cue('b', 80)});
const End: Scene = ({f, cue}) => {
  const p = endPlan(cue);
  const tap = 16;
  const [hx, hy] = hangPos(PH.w, PH.h);
  const reach = clamp((f - tap + 10) / 10);
  const fade = clamp((f - tap - 4) / 24);
  const shrink = 1 - 0.35 * ease.inOutCubic(clamp((f - tap - 20) / 16));
  return <Root>
    <Abs y={-10} w={W}>
      <Big size={92} style={{whiteSpace: 'nowrap'}}>眼见不一定为实</Big>
      <Big size={92} c={B} style={{whiteSpace: 'nowrap', opacity: clamp((f - p.b + 4) / 8)}}>多打一个电话</Big>
    </Abs>
    <div style={{position: 'absolute', inset: 0, transform: `scale(${shrink})`, transformOrigin: `450px ${PH.y + PH.h / 2}px`, opacity: 1 - 0.5 * clamp((f - p.b) / 20)}}>
      <CallPhone {...PH} f={f} hangAt={tap} border={f < tap ? RED : STEEL} tint={f < tap ? 0.6 : 0} timer={f < tap}>
        <g transform={`translate(${(PH.w - 12) / 2} 360)`}><Silhouette id="en" f={f} glitch={fade > 0 && fade < 1 ? fade : f < tap && f % 15 < 3 ? 1 : 0} fade={fade} /></g>
        {fade >= 1 && <text x={(PH.w - 12) / 2} y={400} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={56} fill={DIM}>通话已结束</text>}
      </CallPhone>
      <svg width={W} height={1080} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', opacity: 1 - clamp((f - tap - 12) / 8)}}>
        <g transform={`translate(${PH.x + hx} ${PH.y + hy})`}><Ripple f={f} at={tap} />
          <g transform={`translate(${60 * (1 - reach)} ${200 * (1 - reach)})`}><Pointer s={0.9} deg={-10} /></g></g>
      </svg>
    </div>
    {/* the call back, in the safe colour */}
    {f >= p.b - 2 && <Abs x={0} y={950} w={W} style={{display: 'flex', justifyContent: 'center'}}>
      <Pop f={f} at={p.b} origin="50% 50%"><div style={{display: 'flex', alignItems: 'center', gap: 22, background: B, padding: '14px 34px', borderRadius: 60}}>
        <svg width={80} height={80} viewBox="-40 -40 80 80"><circle r={38} fill={BG} /><Handset s={0.9} deg={0} c={B} /></svg>
        <span style={{fontFamily: font, fontWeight: 900, fontSize: 64, color: BG, whiteSpace: 'nowrap'}}>打回去问一句</span>
      </div></Pop>
    </Abs>}
  </Root>;
};
End.sfx = (cue) => {
  const p = endPlan(cue);
  return [{at: 16, kind: 'tap', gain: 0.2}, {at: 22, kind: 'whoosh-short', gain: 0.1}, {at: p.b, kind: 'chime', gain: 0.12}];
};

/* ---------- cover anchor (880 × 800): the call with the money demand ---------- */

const Cover: Scene = () => <div style={{position: 'relative', width: 880, height: 800}}>
  <div style={{position: 'absolute', left: -10, top: -260, width: W, height: 1080}}><HookCall f={4} bubbleAt={-20} ring={false} /></div>
</div>;

export const faceswapScamScenes: Record<string, Scene> = {
  'fs.hook': Hook,
  'fs.fake': Fake,
  'fs.three': Three,
  'fs.wave': WaveScene,
  'fs.nose': Nose,
  'fs.callback': Callback,
  'fs.safeword': Safeword,
  'fs.police': Police,
  'fs.end': End,
  'fs.cover': Cover,
};
