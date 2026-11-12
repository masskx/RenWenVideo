import React from 'react';
import {Img, OffthreadVideo, staticFile} from 'remotion';
import {clamp, ease} from '../../fx';
import {font} from '../theme';
import {hand, plex} from '../fonts';
import {Scene} from '../paper';

// seedance-claude-video-workflow, made on the template lemo/briefing-board (docs/video-craft/prompt-library/vendor/lemomo-ai__lemo-opuscar/
// b5e8ef9/styles/briefing-board/STYLE.md): one enamel whiteboard on a wall, magnet tags, marker ink in three colours with fixed
// meanings (graphite = names and rules, blue = measurement / what is checked, red = the decision), a stamp, and one pull-back to the
// whole wall at the end. Inputs: inputs/seedance-claude-video-workflow/ (sources.md B, REVIEW-DOUYIN.md last section).
// - Facts are the original article's own wording: model roles (Claude 导演 / Codex 画师 / Seedance 动画师), the four director
//   agents (主做 / 审核 / 监督 / 代理), "首尾帧叠在一起看……杯子大了一点，视频里杯子就会慢慢变大", the final check
//   ("全部解码，每镜取多张全分辨率帧，切点前后各取 3 帧", motion and sound are what the model cannot check). No "0.4 s".
// - The first / last frame drawings and the in-between preview are marker sketches (示意), not generated images; the only footage is
//   a 4 s muted cut (00:08–00:12) of a practitioner's coffee ad, labelled 「@kuibenge｜案例展示」.

const BOARD = '#F5F6F3', WALL = '#8F8B85', GRAPH = '#2B2D31', BLUE = '#1F6FD0', RED = '#D2342B', GREY = '#9A9DA2';
const eio = (t: number) => ease.inOutCubic(clamp(t));
const eo = (f: number, a: number, d = 10) => ease.outCubic(clamp((f - a) / d));
const make = (draw: NonNullable<Scene['backdrop']>, sfx?: Scene['sfx']): Scene => {
  const S: Scene = () => null;
  S.backdrop = draw; S.sfx = sfx;
  return S;
};

/* ---------- the wall, the board, the camera ---------- */

const BW = 2200, BH = 4600, SY = 860;
type Cam = {x: number; y: number; z: number};
const track = (keys: [number, Cam][], f: number): Cam => {
  if (f <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    const [t1, c1] = keys[i], [t0, c0] = keys[i - 1];
    if (f <= t1) {
      const e = eio((f - t0) / Math.max(1, t1 - t0));
      return {x: c0.x + (c1.x - c0.x) * e, y: c0.y + (c1.y - c0.y) * e, z: Math.exp(Math.log(c0.z) + (Math.log(c1.z) - Math.log(c0.z)) * e)};
    }
  }
  return keys[keys.length - 1][1];
};
/** A hand-held breath under every camera (≤ 3 px on screen). */
const breathe = (c: Cam, f: number): Cam => ({x: c.x + Math.sin(f / 23) * 3 / c.z, y: c.y + Math.cos(f / 31) * 2 / c.z, z: c.z});

const Board: React.FC<{cam: Cam; f: number; children: React.ReactNode}> = ({cam, f, children}) => {
  const c = breathe(cam, f), z = c.z;
  return <div style={{position: 'absolute', inset: 0, background: `radial-gradient(ellipse at 30% 20%, #A29E97, ${WALL} 70%)`, overflow: 'hidden'}}>
    <div style={{position: 'absolute', left: 0, top: 0, width: BW, height: BH, transformOrigin: '0 0', transform: `translate(${540 - c.x * z}px, ${SY - c.y * z}px) scale(${z})`}}>
      <div style={{position: 'absolute', left: -40, top: -40, width: BW + 80, height: BH + 80, background: 'linear-gradient(135deg, #D9DBDE, #A9ADB2 45%, #CDD0D3)', borderRadius: 14, boxShadow: '0 30px 60px rgba(0,0,0,0.35)'}} />
      <div style={{position: 'absolute', left: 0, top: 0, width: BW, height: BH, background: `linear-gradient(115deg, #FFFFFF 0%, ${BOARD} 35%, #E7E9E6 100%)`, overflow: 'hidden'}}>
        {/* ghosts of erased marker */}
        <svg width={BW} height={BH} style={{position: 'absolute', left: 0, top: 0, filter: 'blur(6px)', opacity: 0.07}}>
          <path d="M300,1150 C700,1080 1200,1210 1900,1120 M260,2500 C800,2420 1500,2600 1980,2480 M420,3560 C900,3500 1300,3640 1800,3540" stroke={GRAPH} strokeWidth={14} fill="none" />
          <text x={1500} y={2700} fontFamily={hand} fontSize={140} fill={GRAPH}>v2?</text>
        </svg>
        {/* a sliding reflection */}
        <div style={{position: 'absolute', left: -1200 + ((c.x + c.y * 0.4) % 2600), top: -400, width: 520, height: BH + 800, transform: 'rotate(18deg)', background: 'linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,0.35), rgba(255,255,255,0))'}} />
      </div>
      <div style={{position: 'absolute', left: 300, top: BH + 6, width: 1600, height: 34, background: 'linear-gradient(#C8CBCE, #8E9297)', borderRadius: 6, boxShadow: '0 12px 18px rgba(0,0,0,0.3)'}} />
      {children}
    </div>
    <svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0, pointerEvents: 'none', mixBlendMode: 'multiply'}}>
      <filter id="g"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={1} seed={f % 24} /><feColorMatrix values="0 0 0 0 0.5  0 0 0 0 0.5  0 0 0 0 0.5  0 0 0 0.06 0" /></filter>
      <rect width={1080} height={1920} filter="url(#g)" />
    </svg>
  </div>;
};

/** Marker lettering revealed glyph by glyph, with a little baseline jitter. */
const Ink: React.FC<{text: string; x: number; y: number; f: number; at: number; size?: number; color?: string; rot?: number; cps?: number}> = ({text, x, y, f, at, size = 80, color = GRAPH, rot = -1, cps = 1.4}) => {
  if (f < at) return null;
  const n = Math.min(text.length, Math.floor((f - at) / cps) + 1);
  return <div style={{position: 'absolute', left: x, top: y, transform: `rotate(${rot}deg)`, fontFamily: hand, fontSize: size, color, whiteSpace: 'nowrap', opacity: 0.92, lineHeight: 1}}>
    {[...text].map((ch, i) => <span key={i} style={{display: 'inline-block', opacity: i < n ? 1 : 0, transform: `translateY(${Math.sin(i * 2.3) * size * 0.03}px) rotate(${Math.sin(i * 1.7) * 2}deg)`}}>{ch === ' ' ? ' ' : ch}</span>)}
  </div>;
};
/** A marker stroke along a path, drawn at hand speed. */
const Stroke: React.FC<{d: string; p: number; color?: string; w?: number; dash?: boolean}> = ({d, p, color = GRAPH, w = 9, dash}) => p <= 0 ? null : (
  <svg width={BW} height={BH} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', pointerEvents: 'none'}}>
    <path d={d} fill="none" stroke={color} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" opacity={0.9} pathLength={1}
      strokeDasharray={dash ? '0.015 0.012' : 1} strokeDashoffset={dash ? 0 : 1 - clamp(p)} style={dash ? {clipPath: `inset(0 ${(1 - clamp(p)) * 100}% 0 0)`} : undefined} />
  </svg>);
const arrow = (x1: number, y1: number, x2: number, y2: number, bend = 0) => {
  const mx = (x1 + x2) / 2 + bend, my = (y1 + y2) / 2 - Math.abs(bend) * 0.3;
  const a = Math.atan2(y2 - my, x2 - mx), h = 34;
  return `M${x1},${y1} Q${mx},${my} ${x2},${y2} M${x2 - h * Math.cos(a - 0.45)},${y2 - h * Math.sin(a - 0.45)} L${x2},${y2} L${x2 - h * Math.cos(a + 0.45)},${y2 - h * Math.sin(a + 0.45)}`;
};
/** A magnetic tag: a printed label held by a magnet, swinging in when it lands. */
const Tag: React.FC<{x: number; y: number; f: number; at: number; text: string; sub?: string; size?: number; red?: boolean}> = ({x, y, f, at, text, sub, size = 74, red}) => {
  if (f < at) return null;
  const t = f - at, swing = Math.exp(-t / 9) * Math.sin(t / 2.2) * 9 * (t < 3 ? t / 3 : 1), drop = (1 - eo(f, at, 6)) * -60;
  return <div style={{position: 'absolute', left: x, top: y + drop, transformOrigin: '50% 0', transform: `rotate(${swing - 1}deg)`, opacity: eo(f, at, 4)}}>
    <div style={{background: '#FFFFFF', padding: '18px 34px 20px', boxShadow: '0 10px 16px rgba(30,32,36,0.22)', borderLeft: `12px solid ${red ? RED : GRAPH}`, whiteSpace: 'nowrap'}}>
      <span style={{fontFamily: font, fontWeight: 900, fontSize: size, color: GRAPH}}>{text}</span>
      {sub && <span style={{fontFamily: font, fontWeight: 700, fontSize: size * 0.72, color: '#6E7176', marginLeft: 18}}>{sub}</span>}
    </div>
    <div style={{position: 'absolute', left: '50%', top: -22, width: 44, height: 44, marginLeft: -22, borderRadius: '50%', background: red ? RED : '#3A3D42', boxShadow: '0 6px 8px rgba(0,0,0,0.35), inset 0 3px 0 rgba(255,255,255,0.35)'}} />
  </div>;
};
const Stamp: React.FC<{x: number; y: number; f: number; at: number; text: string; size?: number}> = ({x, y, f, at, text, size = 190}) => {
  if (f < at) return null;
  const k = 1 + 0.6 * (1 - eo(f, at, 4));
  return <div style={{position: 'absolute', left: x, top: y, transform: `rotate(-9deg) scale(${k})`, opacity: eo(f, at, 3), border: `14px solid ${RED}`, borderRadius: 18, padding: '6px 36px',
    fontFamily: font, fontWeight: 900, fontSize: size, color: RED, mixBlendMode: 'multiply', letterSpacing: 20, maskImage: 'radial-gradient(circle at 30% 40%, #000 60%, rgba(0,0,0,0.75) 100%)'}}>{text}</div>;
};

/* ---------- the two frames and what the model fills in between (marker sketches, 示意) ---------- */

type Look = {cup: number; wall: string; handle: number};          // cup scale, wall tint, handle side (+1 right, −1 left)
const FIRST: Look = {cup: 1, wall: '#CFDCEA', handle: 1}, LAST: Look = {cup: 1.32, wall: '#EBD5BF', handle: -1};
const mixHex = (a: string, b: string, t: number) => {
  const p = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const A = p(a), B = p(b);
  return `rgb(${A.map((v, i) => Math.round(v + (B[i] - v) * t)).join(',')})`;
};
const FW = 900, FH = 600;
/** One frame drawn in marker: a wall, a table edge, a cup. `ghost` draws a second outline for the overlay. */
const Frame: React.FC<{x: number; y: number; look: Look; label?: string; f: number; at: number; draw?: number; opacity?: number; outline?: string; tc?: string}> = ({x, y, look, label, f, at, draw = 1, opacity = 1, outline = GRAPH, tc}) => {
  if (f < at) return null;
  const cw = 170 * look.cup, ch = 190 * look.cup, cx = 420, base = 430;
  const hx = look.handle > 0 ? cx + cw / 2 : cx - cw / 2;
  const hand1 = look.handle > 0 ? `M${hx},${base - ch * 0.75} C${hx + 70},${base - ch * 0.75} ${hx + 70},${base - ch * 0.25} ${hx},${base - ch * 0.25}` : `M${hx},${base - ch * 0.75} C${hx - 70},${base - ch * 0.75} ${hx - 70},${base - ch * 0.25} ${hx},${base - ch * 0.25}`;
  return <div style={{position: 'absolute', left: x, top: y, width: FW, height: FH, opacity}}>
    <svg width={FW} height={FH} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
      <rect x={0} y={0} width={FW} height={FH} fill="#FFFFFF" fillOpacity={0.55} stroke={outline} strokeWidth={8} rx={6} />
      <rect x={14} y={14} width={FW - 28} height={base - 14} fill={look.wall} opacity={clamp(draw * 2)} />
      <path d={`M14,${base} L${FW - 14},${base}`} stroke={outline} strokeWidth={8} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - clamp(draw * 2 - 0.3)} />
      <path d={`M${cx - cw / 2},${base - ch} L${cx - cw * 0.42},${base} L${cx + cw * 0.42},${base} L${cx + cw / 2},${base - ch} Z`} fill="#FFFFFF" stroke={outline} strokeWidth={9} strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - clamp(draw * 2 - 0.6)} />
      <path d={hand1} fill="none" stroke={outline} strokeWidth={9} strokeLinecap="round" opacity={clamp(draw * 2 - 1)} />
      <path d={`M${cx - cw * 0.3},${base - ch - 30} q16,-30 0,-60 M${cx + cw * 0.1},${base - ch - 30} q16,-30 0,-60`} fill="none" stroke={GREY} strokeWidth={6} strokeLinecap="round" opacity={clamp(draw * 2 - 1) * 0.7} />
      <rect x={640} y={110} width={170} height={200} fill="none" stroke={outline} strokeWidth={7} opacity={clamp(draw * 2 - 0.8)} />
      <path d="M640,210 L810,210 M725,110 L725,310" stroke={outline} strokeWidth={5} opacity={clamp(draw * 2 - 0.8)} />
    </svg>
    {label && <div style={{position: 'absolute', left: 0, top: -112, fontFamily: hand, fontSize: 84, color: GRAPH}}>{label}</div>}
    {tc && <div style={{position: 'absolute', right: 20, bottom: 18, fontFamily: plex, fontSize: 40, color: GRAPH, background: 'rgba(255,255,255,0.75)', padding: '2px 12px'}}>{tc}</div>}
  </div>;
};
const lerpLook = (t: number): Look => ({cup: FIRST.cup + (LAST.cup - FIRST.cup) * t, wall: mixHex(FIRST.wall, LAST.wall, t), handle: t < 0.5 ? 1 : -1});
const F1 = {x: 150, y: 1360}, F2 = {x: 1150, y: 1360}, PV = {x: 650, y: 2170};

/* ---------- the whole wall: every element, revealed by time; each scene is a crop of it ---------- */

type Wall = {roles?: number; coffee?: 'video' | 'still' | false; pair?: number; preview?: number; previewT?: number; overlay?: number; agents?: number; check?: number; circle?: number};
const ALL: Wall = {roles: 999, coffee: 'still', pair: 999, preview: 999, previewT: 1, agents: 999, check: 999};
/** Everything on the board. Values are local frames since each part started (999 = already there). */
const Elements: React.FC<{w: Wall; f: number}> = ({w}) => {
  const r = w.roles ?? -1, pr = w.pair ?? -1, pv = w.preview ?? -1, ag = w.agents ?? -1, ck = w.check ?? -1, ov = w.overlay ?? 0;
  const tShot = w.previewT ?? 0;
  return <>
    {/* roles */}
    <Tag x={160} y={250} f={r} at={0} text="Claude" sub="导演" />
    <Ink text="写分镜 · 写所有提示词 · 检查每张图" x={170} y={395} f={r} at={4} size={68} />
    <Tag x={160} y={560} f={r} at={26} text="Codex" sub="画师" />
    <Ink text="设定图 · 样帧 · 每镜首尾帧" x={170} y={705} f={r} at={30} size={68} />
    <Tag x={160} y={870} f={r} at={64} text="Seedance" sub="动画师" />
    <Ink text="首尾帧 → 几秒视频" x={170} y={1015} f={r} at={68} size={68} color={BLUE} />
    <Tag x={1300} y={250} f={r} at={10} text="我" sub="人" size={70} />
    <Ink text="选方向 · 批准花钱" x={1310} y={385} f={r} at={14} size={62} />
    <Ink text="看动态 · 听声音" x={1310} y={465} f={r} at={18} size={62} color={RED} />
    {w.coffee && r >= 64 && <div style={{position: 'absolute', left: 1140, top: 620 + (1 - eo(r, 64, 7)) * -50, width: 960, height: 540, transform: 'rotate(1.2deg)', boxShadow: '0 16px 26px rgba(30,32,36,0.3)', border: '10px solid #fff', opacity: eo(r, 64, 5)}}>
      {w.coffee === 'video' ? <OffthreadVideo src={staticFile('video/seedance-claude-video-workflow/coffee-8-12.mp4')} muted style={{width: 960, height: 540, display: 'block'}} />
        : <Img src={staticFile('images/seedance-claude-video-workflow/coffee-10s.jpg')} style={{width: 960, height: 540, display: 'block'}} />}
      <div style={{position: 'absolute', right: 10, bottom: 10, background: 'rgba(14,15,17,0.72)', color: '#fff', fontFamily: font, fontWeight: 700, fontSize: 34, padding: '4px 14px'}}>@kuibenge｜案例展示</div>
      <div style={{position: 'absolute', left: 0, top: 560, fontFamily: font, fontWeight: 700, fontSize: 36, color: '#55585D', whiteSpace: 'nowrap'}}>网友照此思路做的广告（Codex 当导演）</div>
    </div>}
    {r >= 0 && <Stroke d={arrow(1060, 1060, 1120, 900, -40)} p={eo(r, 70, 10)} color={BLUE} w={8} />}

    {/* the two frames */}
    <Frame x={F1.x} y={F1.y} look={FIRST} label="首帧" f={pr} at={0} draw={eo(pr, 0, 16)} />
    <Frame x={F2.x - ov * (F2.x - F1.x)} y={F2.y} look={LAST} label={ov > 0.5 ? undefined : '尾帧'} f={pr} at={6} draw={eo(pr, 6, 16)} opacity={1 - ov * 0.45} outline={ov > 0 ? RED : GRAPH} />
    {/* the in-between, filled by the model */}
    {pv >= 0 && <>
      <Frame x={PV.x} y={PV.y} look={lerpLook(tShot)} f={pv} at={0} draw={1} tc={`00:0${Math.min(5, Math.floor(tShot * 5))}`} />
      <div style={{position: 'absolute', left: PV.x, top: PV.y + FH + 16, fontFamily: font, fontWeight: 700, fontSize: 40, color: '#55585D'}}>生成的视频（示意）</div>
      <div style={{position: 'absolute', left: PV.x + 80, top: PV.y + FH - 18, width: (FW - 160) * tShot, height: 8, background: RED}} />
    </>}
    {/* agents */}
    <Ink text="导演：四个 agent" x={160} y={2980} f={ag} at={0} size={84} />
    <Tag x={160} y={3130} f={ag} at={4} text="主做" sub="负责所有制作" size={80} />
    <Tag x={160} y={3300} f={ag} at={10} text="审核" sub="只挑错，不改文件" size={80} red />
    <Tag x={160} y={3470} f={ag} at={16} text="监督" sub="把我说过的话列成清单" size={80} />
    <Tag x={160} y={3640} f={ag} at={22} text="代理" sub="预算内替我批准" size={80} />
    {/* check */}
    <Check f={ck} />
  </>;
};

/** The final check, drawn on a timeline: frames per shot (blue), three either side of each cut (red), what only a person can check. */
const CUTS = [800, 1430], TX0 = 160, TX1 = 2040, TY = 4060;
const Check: React.FC<{f: number}> = ({f}) => {
  if (f < 0) return null;
  const shots: [number, number][] = [[TX0, CUTS[0]], [CUTS[0], CUTS[1]], [CUTS[1], TX1]];
  return <>
    <Ink text="全片复核" x={160} y={3800} f={f} at={0} size={80} />
    <svg width={BW} height={BH} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
      {shots.map(([a, b], i) => <rect key={i} x={a + 6} y={TY} width={(b - a - 12) * eo(f, 2 + i * 3, 10)} height={110} fill="#E9EBEE" stroke={GRAPH} strokeWidth={6} />)}
      {CUTS.map((c, i) => <line key={i} x1={c} y1={TY - 30} x2={c} y2={TY + 140} stroke={GRAPH} strokeWidth={8} opacity={eo(f, 10, 6)} />)}
      {shots.flatMap(([a, b], i) => Array.from({length: 4}, (_, j) => {
        const x = a + (b - a) * (j + 1) / 5;
        return <line key={`${i}-${j}`} x1={x} y1={TY + 18} x2={x} y2={TY + 92} stroke={BLUE} strokeWidth={9} strokeLinecap="round" opacity={eo(f, 16 + i * 4 + j, 4)} />;
      }))}
      {CUTS.flatMap((c, i) => [-3, -2, -1, 1, 2, 3].map((k) => {
        const x = c + k * 26;
        return <line key={`${i}${k}`} x1={x} y1={TY + 8} x2={x} y2={TY + 102} stroke={RED} strokeWidth={8} strokeLinecap="round" opacity={eo(f, 70 + i * 6 + Math.abs(k), 4)} />;
      }))}
    </svg>
    <Ink text="每镜多张全分辨率帧" x={TX0} y={TY + 150} f={f} at={18} size={84} color={BLUE} />
    <Ink text="切点前后各 3 帧" x={CUTS[0] + 120} y={TY - 130} f={f} at={72} size={84} color={RED} />
  </>;
};

/* ---------- cameras ---------- */

const C_PV: Cam = {x: PV.x + FW / 2, y: PV.y + FH / 2 - 60, z: 0.95};
const C_ROLES: Cam = {x: 1100, y: 690, z: 0.47};
const C_PAIR: Cam = {x: 1100, y: 2000, z: 0.46};
const C_OV: Cam = {x: 620, y: 1600, z: 0.85};
const C_AG: Cam = {x: 840, y: 3400, z: 0.72};
const C_CK: Cam = {x: 1100, y: 4120, z: 0.5};
const C_ALL: Cam = {x: 1100, y: 2330, z: 0.275};

/* ---------- 1 hook: the cup grows by itself ---------- */

const Hook = make(({f, cue}) => {
  const a = cue('a', 65);
  const t = clamp(f / 70);
  const cam = track([[0, C_PV], [a - 4, {...C_PV, z: 1.0}], [a + 26, {x: 1100, y: 1950, z: 0.55}]], f);
  const cupX = PV.x + 420, cupY = PV.y + 430 - 190 * lerpLook(t).cup / 2;
  return <Board cam={cam} f={f}>
    <Elements w={{preview: 999, previewT: t, pair: f >= a ? f - a : -1}} f={f} />
    <Stroke d={`M${cupX - 190},${cupY} a190,170 0 1,0 380,0 a190,170 0 1,0 -380,0`} p={eo(f, 26, 12)} color={RED} w={10} />
    <Ink text="自己变大？" x={PV.x + 520} y={PV.y + FH + 70} f={f} at={34} size={78} color={RED} rot={-4} />
  </Board>;
}, (cue) => [{at: 26, kind: 'marker', gain: 0.08}, {at: 34, kind: 'marker', gain: 0.06}, {at: cue('a', 65), kind: 'whoosh-short', gain: 0.06}]);

/* ---------- 2 roles: three models, one person ---------- */

const Roles = make(({f, cue}) => {
  const a = cue('a', 49);
  const cam = track([[0, {x: 1100, y: 1950, z: 0.55}], [24, C_ROLES]], f);
  const roles = f - a + 2;  // Claude lands on {a}; Codex (+26) and Seedance (+64) fall on their words at this pace
  return <Board cam={cam} f={f}>
    <Elements w={{roles, coffee: 'video', pair: 999, preview: 999, previewT: 1}} f={f} />
  </Board>;
}, (cue) => [{at: 10, kind: 'clack', gain: 0.07}, {at: 20, kind: 'clack', gain: 0.06}, {at: cue('a', 49), kind: 'clack', gain: 0.07}, {at: cue('b', 113), kind: 'clack', gain: 0.07}, {at: cue('b', 113) + 2, kind: 'thud', gain: 0.05}]);

/* ---------- 3 mech: the model fills the middle; whatever differs, moves ---------- */

const Mech = make(({f, cue}) => {
  const a = cue('a', 44), b = cue('b', 89);
  const cam = track([[0, C_ROLES], [26, C_PAIR]], f);
  const t = clamp((f - b) / 50);
  return <Board cam={cam} f={f}>
    <Elements w={{...ALL, agents: -1, check: -1, previewT: f < b ? 0 : t}} f={f} />
    <Stroke d={arrow(F1.x + 450, F1.y + FH + 20, PV.x + 200, PV.y - 20, -60)} p={eo(f, 20, 12)} color={BLUE} w={10} />
    <Stroke d={arrow(F2.x + 450, F2.y + FH + 20, PV.x + 700, PV.y - 20, 60)} p={eo(f, 24, 12)} color={BLUE} w={10} />
    <Ink text="中间由模型补" x={760} y={2040} f={f} at={14} size={60} color={BLUE} />
    {f >= a && <>
      <Stroke d={`M${F1.x + 300},${F1.y + 200} a150,140 0 1,0 300,0 a150,140 0 1,0 -300,0`} p={eo(f, a, 10)} color={RED} />
      <Stroke d={`M${F2.x + 280},${F2.y + 160} a175,175 0 1,0 350,0 a175,175 0 1,0 -350,0`} p={eo(f, a + 6, 10)} color={RED} />
    </>}
  </Board>;
}, (cue) => [{at: 20, kind: 'marker', gain: 0.07}, {at: cue('a', 44), kind: 'marker', gain: 0.07}, {at: cue('b', 89), kind: 'whoosh-short', gain: 0.05}]);

/* ---------- 4 overlay: lay the last frame on the first — three differences ---------- */

const Overlay = make(({f, cue}) => {
  const a = cue('a', 65), b = cue('b', 124);
  const cam = track([[0, C_PAIR], [22, C_OV]], f);
  const ov = eio((f - 8) / 22);
  const D = [
    {d: `M${F1.x + 210},${F1.y + 170} a215,200 0 1,0 430,0 a215,200 0 1,0 -430,0`, t: 'm', x: F1.x + 600, y: F1.y + 470, s: '杯子大小'},
    {d: `M${F1.x + 40},${F1.y + 40} L${F1.x + 860},${F1.y + 40}`, t: 'l', x: F1.x + 470, y: F1.y - 100, s: '墙色'},
    {d: `M${F1.x + 150},${F1.y + 260} a60,90 0 1,0 120,0 a60,90 0 1,0 -120,0 M${F1.x + 560},${F1.y + 260} a60,90 0 1,0 120,0 a60,90 0 1,0 -120,0`, t: 'm', x: F1.x + 10, y: F1.y + 620, s: '把手左右'},
  ];
  const at = [a, a + 14, a + 28];
  return <Board cam={cam} f={f}>
    <Elements w={{...ALL, overlay: ov, agents: -1, check: -1, previewT: 1}} f={f} />
    {D.map((x, i) => <React.Fragment key={i}>
      <Stroke d={x.d} p={eo(f, at[i], 10)} color={RED} w={10} />
      <Ink text={x.s} x={x.x} y={x.y} f={f} at={at[i] + 4} size={66} color={RED} rot={-3} />
    </React.Fragment>)}
    <Stamp x={F1.x + 330} y={F1.y + 640} f={f} at={b + 8} text="不该变的必须一样" size={58} />
  </Board>;
}, (cue) => [{at: 8, kind: 'fs-paper-slide', gain: 0.07}, ...[0, 14, 28].map((k) => ({at: cue('a', 65) + k, kind: 'marker', gain: 0.08})), {at: cue('b', 124) + 8, kind: 'stamp', gain: 0.12}]);

/* ---------- 5 review: four agents; the reviewer must write 通过 ---------- */

const Review = make(({f, cue}) => {
  const a = cue('a', 44), b = cue('b', 77);
  const cam = track([[0, C_OV], [24, C_AG]], f);
  return <Board cam={cam} f={f}>
    <Elements w={{...ALL, agents: f - 6, check: -1}} f={f} />
    <Stroke d={`M150,3290 L1300,3290 L1300,3460 L150,3460 Z`} p={eo(f, a, 12)} color={RED} w={8} />
    <Stamp x={880} y={3190} f={f} at={b + 4} text="通过" size={170} />
    <Stroke d={arrow(1180, 3460, 1000, 3830, 60)} p={eo(f, b + 16, 10)} color={GRAPH} />
    <Ink text="才提交 Seedance" x={480} y={3840} f={f} at={b + 22} size={72} />
  </Board>;
}, (cue) => [{at: 10, kind: 'clack', gain: 0.06}, {at: 16, kind: 'clack', gain: 0.06}, {at: 22, kind: 'clack', gain: 0.06}, {at: 28, kind: 'clack', gain: 0.06}, {at: cue('a', 44), kind: 'marker', gain: 0.07}, {at: cue('b', 77) + 4, kind: 'stamp', gain: 0.12}]);

/* ---------- 6 check: frames per shot, three around each cut, motion and sound to a person ---------- */

const CheckScene = make(({f, cue}) => {
  const a = cue('a', 70), b = cue('b', 125);
  const cam = track([[0, C_AG], [24, C_CK]], f);
  return <Board cam={cam} f={f}>
    <Elements w={{...ALL, check: f < a ? Math.min(f - 4, 66) : 70 + (f - a)}} f={f} />
    <Tag x={260} y={4300} f={f} at={b} text="动态手感" size={76} />
    <Tag x={820} y={4300} f={f} at={b + 5} text="声音" size={76} />
    <Stroke d={arrow(1110, 4350, 1360, 4350)} p={eo(f, b + 14, 8)} color={RED} />
    <Tag x={1400} y={4300} f={f} at={b + 20} text="交给人" size={76} red />
  </Board>;
}, (cue) => [{at: 6, kind: 'marker', gain: 0.06}, ...Array.from({length: 6}, (_, i) => ({at: 20 + i * 3, kind: 'tick', gain: 0.05})), {at: cue('a', 70), kind: 'tick', gain: 0.08}, {at: cue('b', 125), kind: 'clack', gain: 0.07}, {at: cue('b', 125) + 20, kind: 'clack', gain: 0.08}]);

/* ---------- 7 end: the whole wall; the pair circled ---------- */

const End = make(({f, cue}) => {
  const a = cue('a', 27);
  const cam = track([[0, C_CK], [30, C_ALL]], f);
  return <Board cam={cam} f={f}>
    <Elements w={{...ALL, overlay: 1}} f={f} />
    <Tag x={260} y={4300} f={999} at={0} text="动态手感" size={60} />
    <Tag x={820} y={4300} f={999} at={0} text="声音" size={60} />
    <Tag x={1400} y={4300} f={999} at={0} text="交给人" size={60} red />
    <Stamp x={880} y={3190} f={999} at={0} text="通过" size={170} />
    <Stroke d={`M${F1.x - 80},${F1.y + 300} C${F1.x - 80},${F1.y - 260} ${F1.x + 1000},${F1.y - 260} ${F1.x + 1000},${F1.y + 300} C${F1.x + 1000},${F1.y + 860} ${F1.x - 80},${F1.y + 860} ${F1.x - 80},${F1.y + 300}`} p={eo(f, a, 14)} color={RED} w={22} />
    <Ink text="先叠首尾帧" x={1150} y={1300} f={f} at={a + 10} size={190} color={RED} rot={-5} cps={2} />
  </Board>;
}, (cue) => [{at: 0, kind: 'whoosh-short', gain: 0.06}, {at: cue('a', 27), kind: 'marker', gain: 0.1}]);

/* ---------- cover anchor: the overlay with the three red rings ---------- */

const Cover = make(({f}) => <Board cam={{x: 640, y: 1620, z: 0.8}} f={f}>
  <Elements w={{...ALL, overlay: 1, agents: -1, check: -1}} f={f} />
  <Stroke d={`M${F1.x + 210},${F1.y + 170} a215,200 0 1,0 430,0 a215,200 0 1,0 -430,0`} p={1} color={RED} w={12} />
</Board>);

export const SEEDANCE_WORKFLOW_SCENES: Record<string, Scene> = {
  'swf.hook': Hook, 'swf.roles': Roles, 'swf.mech': Mech, 'swf.overlay': Overlay, 'swf.review': Review, 'swf.check': CheckScene, 'swf.end': End, 'swf.cover': Cover,
};
