import React from 'react';
import {Img, OffthreadVideo, staticFile} from 'remotion';
import {clamp, ease} from '../../fx';
import {font} from '../theme';
import {cond, plex} from '../fonts';
import {Cue, Scene} from '../paper';
import {W} from '../package';

// weight-space-programming, made on the template lemo/telestrator (docs/video-craft/prompt-library/vendor/lemomo-ai__
// lemo-opuscar/3961ddb/styles/telestrator/STYLE.md): the MIT CSAIL blog post 《Sparks of Weight-Space Programming》
// (2026-11-02, not peer-reviewed; every number the authors' own) — a frontier model ("GPT-6 Astra" in the post) reads and
// edits another network's weights directly. Inputs: inputs/weight-space-programming/ (materials.md, review.md — Eko
// approved with wording rules, sources.md, blog text).
// - What the template gives: watch it, then take it apart (the play runs before the freeze); one freeze, one finding;
//   drawings on the real picture (here the blog's own cards and tables, never a schematic of ours — the materials forbid
//   drawn diagrams as evidence); marker lines with outline + glow + highlight, rings, a black label card with a role-colour
//   bar; freeze entry = white flash + punch; a corner bug with the mode, a source clock (▶ / ❚❚ / ◀◀), a score bar; a
//   rewind; "another angle" replay; a stamp once per film; the telestrator subtitle bar.
// - Customised (模板改造): the studio's dark board becomes the blog's own page — paper #F4F3EE with the blog's green #0C8454
//   for "Astra's edit" and its grey #8A8A8A for "base" as the two role colours (the pundit's yellow/cyan dropped); the
//   score bar is 「改前 7.9 | 改后 48.1」, flipping on the hook's last word; "another angle" is the same method on Gemma
//   (the replay shows it barely moves); real footage plays only once (the blog's which-game clip) before its freeze;
//   score is our synthesized "news".
// - Review wording honoured: blog, not peer-reviewed, author-reported (on screen throughout); "fixed the thinking loop",
//   not "taught maths"; Gemma shown; Kinetix and the which-game reading are separate experiments with other conditions
//   (labelled); no HN score, no repo names read out.

const K = {page: '#F4F3EE', card: 'rgba(20,20,20,0.92)', ink: '#FFFFFF', text: '#141414', dim: '#6E6E6E', green: '#0C8454', grey: '#8A8A8A', red: '#C8442F'};
const IMG = (n: string) => staticFile(`images/weight-space-programming/${n}`);
const back = (t: number, s = 1.6) => ease.outBack(clamp(t), s);

/* ---------- freeze, flash, punch (template §6) ---------- */
const freezeAt = (f: number, at: number) => {
  if (f < at) return {k: 1, flash: 0, frz: 0};
  const t = f - at;
  return {k: 1 + 0.035 * (1 - ease.outCubic(clamp(t / 10))) + 0.012 * clamp((t - 10) / 120), flash: t < 3 ? 0.55 * (1 - t / 3) : 0, frz: clamp(t / 6)};
};
const Flash: React.FC<{a: number}> = ({a}) => (a > 0 ? <div style={{position: 'absolute', inset: 0, background: '#fff', opacity: a}} /> : null);
const Punch: React.FC<{k: number; cx?: number; cy?: number; children: React.ReactNode}> = ({k, cx = 540, cy = 700, children}) =>
  <div style={{position: 'absolute', inset: 0, transformOrigin: `${cx}px ${cy}px`, transform: `scale(${k})`}}>{children}</div>;

/* ---------- drawing kit ---------- */
const Marker: React.FC<{pts: [number, number][]; p: number; color: string; w?: number; dash?: boolean; arrow?: boolean; seed?: number}> = ({pts, p, color, w = 10, dash, arrow, seed = 1}) => {
  if (p <= 0) return null;
  const wob = pts.map(([x, y], i) => [x + Math.sin(seed * 7.1 + i * 3.3) * 2.5, y + Math.cos(seed * 5.3 + i * 2.1) * 2.5] as [number, number]);
  const lens = wob.slice(1).map((q, i) => Math.hypot(q[0] - wob[i][0], q[1] - wob[i][1]));
  const total = lens.reduce((a, b) => a + b, 0);
  const d = 'M' + wob.map((q) => q.join(' ')).join(' L');
  const off = total * (1 - clamp(p));
  const [ax, ay] = wob[wob.length - 1], [bx, by] = wob[wob.length - 2] ?? wob[0];
  const ang = Math.atan2(ay - by, ax - bx);
  const head = arrow && p > 0.9 ? back((p - 0.9) / 0.1) : 0;
  const da = dash ? `${w * 2.4} ${w * 1.6}` : undefined;
  const common = {fill: 'none', strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const};
  return <svg width={W} height={1920} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
    <defs><mask id={`wp-${seed}`}><path d={d} {...common} stroke="#fff" strokeWidth={w + 12} strokeDasharray={total} strokeDashoffset={off} /></mask></defs>
    <g mask={`url(#wp-${seed})`}>
      <path d={d} {...common} stroke="rgba(0,0,0,0.45)" strokeWidth={w + 6} strokeDasharray={da} />
      <path d={d} {...common} stroke={color} strokeWidth={w} strokeDasharray={da} style={{filter: `drop-shadow(0 0 7px ${color})`}} />
      <path d={d} {...common} stroke="rgba(255,255,255,0.75)" strokeWidth={w * 0.28} strokeDasharray={da} />
    </g>
    {head > 0 && <g transform={`translate(${ax} ${ay}) rotate(${(ang * 180) / Math.PI}) scale(${head})`}>
      <path d={`M0 0 L${-w * 2.6} ${-w * 1.7} L${-w * 2.6} ${w * 1.7} Z`} fill={color} stroke="rgba(0,0,0,0.45)" strokeWidth={3} />
    </g>}
  </svg>;
};
/** A ring drawn clockwise around a number (a flat ellipse on a page, not a perspective one), outer dashed ring turning. */
const Ring: React.FC<{cx: number; cy: number; rx: number; ry: number; p: number; f: number; color: string}> = ({cx, cy, rx, ry, p, f, color}) => {
  if (p <= 0) return null;
  const c = 2 * Math.PI * Math.sqrt((rx * rx + ry * ry) / 2);
  return <svg width={W} height={1920} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
    <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill={color} fillOpacity={0.1 * clamp(p * 2)} stroke="rgba(0,0,0,0.4)" strokeWidth={11} strokeDasharray={c} strokeDashoffset={c * (1 - clamp(p))} />
    <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="none" stroke={color} strokeWidth={6} strokeDasharray={c} strokeDashoffset={c * (1 - clamp(p))} style={{filter: `drop-shadow(0 0 6px ${color})`}} />
    <ellipse cx={cx} cy={cy} rx={rx * 1.16} ry={ry * 1.25} fill="none" stroke={color} strokeWidth={3} strokeDasharray="14 12" strokeDashoffset={-f * 2} opacity={0.75 * clamp(p * 1.5 - 0.4)} />
  </svg>;
};
/** Label: black card, role-colour bar, a Chinese line + a small spaced line. */
const Label: React.FC<{x: number; y: number; zh: string; en?: string; color: string; f: number; at: number; size?: number; right?: boolean; out?: number}> = ({x, y, zh, en, color, f, at, size = 46, right, out}) => {
  if (f < at || (out !== undefined && f > out + 4)) return null;
  const p = back((f - at) / 6, 1.3);
  return <div style={{position: 'absolute', left: right ? undefined : x, right: right ? W - x : undefined, top: y, transform: `translateY(${(1 - p) * 16}px)`, opacity: clamp((f - at) / 2) * (out !== undefined ? 1 - clamp((f - out) / 4) : 1),
    background: K.card, borderLeft: `10px solid ${color}`, padding: '12px 24px 14px 20px', boxShadow: '0 10px 26px rgba(0,0,0,0.25)', whiteSpace: 'nowrap'}}>
    <div style={{fontFamily: font, fontWeight: 900, fontSize: size, lineHeight: 1.15, color: K.ink}}>{zh}</div>
    {en && <div style={{fontFamily: cond, fontWeight: 600, fontSize: 24, letterSpacing: 2, color: color === K.grey ? '#C9C9C9' : '#7FD9AE', marginTop: 4}}>{en}</div>}
  </div>;
};

/* ---------- packaging ---------- */
type Mode = 'play' | 'freeze' | 'rewind' | 'angle';
const MODE: Record<Mode, string> = {play: '▶ 原图', freeze: '❚❚ 定格', rewind: '◀◀ 回放', angle: '▶ 另一个角度'};
const Bug: React.FC<{mode: Mode}> = ({mode}) => <div style={{position: 'absolute', right: 56, top: 74, display: 'flex', height: 58}}>
  <div style={{background: K.green, color: '#fff', fontFamily: font, fontWeight: 900, fontSize: 30, padding: '0 16px', display: 'flex', alignItems: 'center'}}>改权重</div>
  <div style={{background: K.text, color: '#fff', fontFamily: font, fontWeight: 800, fontSize: 28, padding: '0 16px', display: 'flex', alignItems: 'center'}}>{MODE[mode]}</div>
</div>;
const Clock: React.FC<{text: string}> = ({text}) => <div style={{position: 'absolute', left: 56, top: 86, fontFamily: plex, fontWeight: 500, fontSize: 28, color: K.dim}}>{text}</div>;
/** The score bar: 改前 | 改后, the 改后 cell flips (scaleY) at `flip`. */
const Score: React.FC<{f: number; flip: number; before: string; after: string; what: string}> = ({f, flip, before, after, what}) => {
  const fl = clamp((f - flip) / 6), sy = Math.abs(Math.cos(fl * Math.PI));
  const shown = fl >= 0.5 ? after : '––';
  return <div style={{position: 'absolute', left: 56, right: 56, top: 158, height: 96, display: 'flex', boxShadow: '0 8px 22px rgba(0,0,0,0.12)'}}>
    <div style={{flex: 1.2, background: '#fff', display: 'flex', alignItems: 'center', padding: '0 24px', fontFamily: font, fontWeight: 900, fontSize: 36, color: K.text}}>{what}</div>
    <div style={{flex: 1, background: K.grey, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12}}>
      <span style={{fontFamily: font, fontWeight: 800, fontSize: 28}}>改前</span><span style={{fontFamily: cond, fontWeight: 800, fontStyle: 'italic', fontSize: 64}}>{before}</span></div>
    <div style={{flex: 1, background: K.green, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, transform: `scaleY(${fl > 0 && fl < 1 ? sy : 1})`}}>
      <span style={{fontFamily: font, fontWeight: 800, fontSize: 28}}>改后</span><span style={{fontFamily: cond, fontWeight: 800, fontStyle: 'italic', fontSize: 64}}>{shown}</span></div>
  </div>;
};
const Src: React.FC<{text: string; y?: number}> = ({text, y = 1150}) => <div style={{position: 'absolute', left: 260, right: 56, top: y, fontFamily: font, fontWeight: 700, fontSize: 28, color: K.dim, textAlign: 'right'}}>{text}</div>;
/** The picture: a blog graphic on a white card, at (x, y) with scale s; grey wash when frozen (desaturate 42 %). */
const Pic: React.FC<{src: string; x: number; y: number; w: number; frz?: number; children?: React.ReactNode}> = ({src, x, y, w, frz = 0, children}) => <div style={{position: 'absolute', left: x, top: y, width: w, background: '#fff', boxShadow: '0 16px 40px rgba(0,0,0,0.14)'}}>
  <Img src={src} style={{width: w, display: 'block', filter: `saturate(${1 - 0.42 * frz})`}} />
  {children}
</div>;
const Stage: React.FC<{children: React.ReactNode}> = ({children}) => <div style={{position: 'absolute', inset: 0, background: K.page, overflow: 'hidden'}}>{children}</div>;
const Rewind: React.FC<{p: number}> = ({p}) => p <= 0 || p >= 1 ? null : <div style={{position: 'absolute', inset: 0}}>
  {[0, 1, 2, 3].map((i) => <div key={i} style={{position: 'absolute', left: 0, right: 0, top: ((i * 470 + p * 1900) % 1920), height: 14, background: 'rgba(255,255,255,0.8)'}} />)}
  <div style={{position: 'absolute', left: 0, right: 0, top: 760, textAlign: 'center', fontFamily: cond, fontWeight: 800, fontStyle: 'italic', fontSize: 180, color: K.text, opacity: 0.85}}>◀◀</div>
</div>;

const make = (draw: NonNullable<Scene['backdrop']>, sfx?: Scene['sfx']): Scene => {
  const Sc: Scene = () => null;
  Sc.backdrop = draw;
  Sc.sfx = sfx;
  return Sc;
};

/* card geometry: the blog's portrait cards (486 × 870) at 1.0, left; labels in the free column on the right */
const CX = 70, CY = 270, CS = 1.0;
const cpt = (x: number, y: number): [number, number] => [CX + x * CS, CY + y * CS];

/* ---------- 1 hook: the IMPROVE card plays (bars rise), freezes on 48.1 ---------- */
const hookPlan = (cue: Cue) => ({a: cue('a', 53), b: cue('b', 105)});
const Hook = make(({f, cue}) => {
  const p = hookPlan(cue);
  const fz = freezeAt(f, p.b);
  const [bx, by] = cpt(348, 310), [gx, gy] = cpt(138, 475);
  return <Stage>
    <Punch k={fz.k * (1 + 0.14 * ease.inOutCubic(clamp(f / p.b)))} cx={bx - 60} cy={by + 120}>
      <Pic src={IMG('widget-7.png')} x={CX} y={CY} w={486 * CS} frz={fz.frz} />
      <Ring cx={gx} cy={gy} rx={70} ry={34} p={clamp((f - p.a) / 10)} f={f} color={K.grey} />
      <Ring cx={bx} cy={by} rx={86} ry={40} p={clamp((f - p.b - 2) / 10)} f={f} color={K.green} />
      <Label x={600} y={330} zh="只改 0.016%" en="131,072 WEIGHTS · 作者自报" color={K.green} f={f} at={-8} size={52} />
      <Label x={600} y={520} zh="7.9% → 48.1%" en="MATH-500 · QWEN3.5-0.8B" color={K.green} f={f} at={p.b + 4} size={52} />
      <Label x={600} y={710} zh="不训练、没有梯度" en="IN A PYTHON KERNEL" color={K.grey} f={f} at={p.b + 14} size={40} />
    </Punch>
    <Flash a={fz.flash} />
    <Score f={f} flip={p.b} before="7.9" after="48.1" what="MATH-500 正确率 %" />
    <Bug mode={f >= p.b ? 'freeze' : 'play'} />
    <Clock text="博客配图 · IMPROVE" />
    <Src text="博客《Sparks of Weight-Space Programming》· 作者自报 · 未同行评审" />
  </Stage>;
}, (cue) => { const p = hookPlan(cue); return [{at: 0, kind: 'pop', gain: 0.08}, {at: 6, kind: 'tick', gain: 0.07}, {at: p.a, kind: 'marker', gain: 0.06}, {at: p.b, kind: 'shutter', gain: 0.1}, {at: p.b + 2, kind: 'marker', gain: 0.07}]; });

/* ---------- 2 who: the blog's masthead — title, MIT CSAIL, the date ---------- */
const whoPlan = (cue: Cue) => ({a: cue('a', 68), b: cue('b', 157)});
const TS = 0.62, TX = 20, TY = 330;
const Who = make(({f, cue}) => {
  const p = whoPlan(cue);
  const t = (x: number, y: number): [number, number] => [TX + x * TS, TY + y * TS];
  return <Stage><Punch k={1 + 0.1 * ease.inOutCubic(clamp(f / 190))} cx={540} cy={560}>
    <Pic src={IMG('top.png')} x={TX} y={TY} w={1680 * TS} />
    <Marker pts={[t(80, 172), t(1390, 172)]} p={clamp((f - 8) / 14)} color={K.green} w={9} seed={11} />
    <Marker pts={[t(80, 284), t(1105, 284)]} p={clamp((f - 18) / 12)} color={K.green} w={9} seed={12} />
    <Ring cx={t(655, 565)[0]} cy={t(655, 565)[1]} rx={110} ry={120} p={clamp((f - 30) / 12)} f={f} color={K.green} />
    <Ring cx={t(1215, 488)[0]} cy={t(1215, 488)[1]} rx={100} ry={34} p={clamp((f - 110) / 12)} f={f} color={K.grey} />
    {f >= 116 && <div style={{position: 'absolute', right: 150, top: t(1104, 560)[1], fontFamily: font, fontWeight: 900, fontSize: 34, color: K.text, background: '#fff', padding: '4px 12px', boxShadow: '0 6px 14px rgba(0,0,0,0.15)'}}>11 月 2 日发布 · 博客</div>}
    </Punch>
    <Label x={60} y={880} zh="大模型能直接读写神经网络权重" en="THE POST'S TITLE · 译" color={K.green} f={f} at={14} size={44} />
    <Label x={60} y={1010} zh="让 GPT-6 Astra 直接改权重" en="AS NAMED IN THE POST" color={K.grey} f={f} at={p.a} size={44} />
    {f >= p.b && <div style={{position: 'absolute', right: 70, top: 980, fontFamily: font, fontWeight: 900, fontSize: 84, color: K.green, border: `8px solid ${K.green}`, padding: '0 26px', transform: `rotate(-5deg) scale(${1.6 - 0.6 * back((f - p.b) / 7, 1.2)})`, background: 'rgba(244,243,238,0.9)'}}>不训练</div>}
    <Bug mode="play" />
    <Clock text="博客页面 · 2026-11-02" />
    <Src text="MIT CSAIL · 四位作者 · 博客，不是同行评审论文" />
  </Stage>;
}, (cue) => { const p = whoPlan(cue); return [{at: 8, kind: 'marker', gain: 0.06}, {at: 30, kind: 'marker', gain: 0.06}, {at: p.b, kind: 'stamp', gain: 0.1}]; });

/* ---------- 3 loop (second hook): rewind — it didn't learn maths; the base model loops into the token limit ---------- */
const QS = 0.86, QX = 32, QY = 520; // table-3 at 0.86
const q = (x: number, y: number): [number, number] => [QX + x * QS, QY + y * QS];
const loopPlan = (cue: Cue) => ({a: cue('a', 33), b: cue('b', 120)});
const Loop = make(({f, cue}) => {
  const p = loopPlan(cue);
  const rw = clamp(f / 18);
  const fz = freezeAt(f, 20);
  const [hx, hy] = q(1110, 112);
  return <Stage>
    {rw < 1 ? <Pic src={IMG('widget-7.png')} x={CX + Math.sin(f * 2.3) * 13} y={CY} w={486} frz={1} /> : <Punch k={fz.k} cx={hx} cy={hy}>
      <Pic src={IMG('table-3.png')} x={QX} y={QY} w={1182 * QS} frz={fz.frz} />
      <Ring cx={hx} cy={hy} rx={80} ry={36} p={clamp((f - p.a) / 10)} f={f} color={K.red} />
      <Label x={60} y={300} zh="不是教会了数学" en="IT WAS LOOPING" color={K.red} f={f} at={22} size={56} />
      <Label x={60} y={930} zh="96 道练习里 85 道" en="RAN TO THE 32,768-TOKEN LIMIT" color={K.red} f={f} at={p.a + 30} size={48} />
      <Label x={60} y={1050} zh="想到停不下来，撞上限" en="作者自报" color={K.grey} f={f} at={p.b} size={40} />
      {/* the loop, drawn as a marker circling the 93.0 */}
      <Marker pts={Array.from({length: 26}, (_, i) => { const a = (i / 25) * Math.PI * 2 * 1.15 - Math.PI / 2; return [hx + Math.cos(a) * 120, hy + Math.sin(a) * 60] as [number, number]; })} p={clamp((f - p.a - 12) / 20)} color={K.red} w={7} arrow seed={21} />
    </Punch>}
    <Rewind p={rw} />
    <Flash a={rw >= 1 ? fz.flash : 0} />
    <Score f={f + 999} flip={0} before="93.0" after="––" what="撞上 token 上限 %" />
    <Bug mode={rw < 1 ? 'rewind' : 'freeze'} />
    <Clock text="博客表 · Qwen3.5-0.8B 编辑前后" />
    <Src text="作者自报 · 未同行评审" />
  </Stage>;
}, (cue) => { const p = loopPlan(cue); return [{at: 0, kind: 'whoosh', gain: 0.07}, {at: 20, kind: 'shutter', gain: 0.1}, {at: p.a, kind: 'marker', gain: 0.07}, {at: p.a + 12, kind: 'marker', gain: 0.06}]; });

/* ---------- 4 fix (climax): the same column — 93.0 down to 33.1; the stamp ---------- */
const fixPlan = (cue: Cue) => ({a: cue('a', 82)});
const Fix = make(({f, cue}) => {
  const p = fixPlan(cue);
  const [hx, hy] = q(1110, 112), [lx, ly] = q(1107, 316);
  return <Stage>
    <Pic src={IMG('table-3.png')} x={QX} y={QY} w={1182 * QS} />
    <Ring cx={hx} cy={hy} rx={80} ry={36} p={1} f={f} color={K.red} />
    <Label x={60} y={300} zh="减掉第 15、19 层的一个方向" en="64 COLUMNS EACH · 131,072 WEIGHTS" color={K.green} f={f} at={4} size={46} />
    <Marker pts={[[hx - 120, hy + 30], [hx - 150, (hy + ly) / 2], [lx - 120, ly - 20]]} p={clamp((f - p.a + 8) / 14)} color={K.green} w={10} arrow seed={31} />
    <Ring cx={lx} cy={ly} rx={80} ry={36} p={clamp((f - p.a + 2) / 10)} f={f} color={K.green} />
    {f >= p.a + 6 && <div style={{position: 'absolute', left: 120, top: 900, width: 840, textAlign: 'center', background: K.card, color: '#fff', padding: '18px 0 22px', transform: `rotate(-3deg) scale(${1.7 - 0.7 * back((f - p.a - 6) / 7, 1.3)})`, boxShadow: '0 20px 40px rgba(0,0,0,0.3)'}}>
      <div style={{fontFamily: font, fontWeight: 900, fontSize: 46}}>撞上限</div>
      <div style={{fontFamily: cond, fontWeight: 800, fontStyle: 'italic', fontSize: 120, lineHeight: 1}}><span style={{color: '#C9C9C9'}}>93%</span> → <span style={{color: '#7FD9AE'}}>33%</span></div>
    </div>}
    <Score f={f} flip={p.a} before="93.0" after="33.1" what="撞上 token 上限 %" />
    <Bug mode="freeze" />
    <Clock text="博客表 · 50 次前向" />
    <Src text="作者自报 · 未同行评审" />
  </Stage>;
}, (cue) => { const p = fixPlan(cue); return [{at: 4, kind: 'tick', gain: 0.07}, {at: p.a - 8, kind: 'marker', gain: 0.08}, {at: p.a + 6, kind: 'stamp', gain: 0.11}]; });

/* ---------- 5 gemma: another angle — same method, a model that barely loops: almost nothing ---------- */
const gemmaPlan = (cue: Cue) => ({a: cue('a', 39), b: cue('b', 62)});
const GS = 1.5, GX = 95, GY = 330;
const Gemma = make(({f, cue}) => {
  const p = gemmaPlan(cue);
  const g = (x: number, y: number): [number, number] => [GX + x * GS, GY + y * GS];
  const rows = [115, 186, 256, 327, 397];
  return <Stage>
    <Pic src={IMG('table-4.png')} x={GX} y={GY} w={594 * GS} />
    <Marker pts={rows.map((y) => g(612, y))} p={clamp((f - p.a) / 16)} color={K.grey} w={9} seed={41} />
    <Ring cx={g(562, 115)[0]} cy={g(562, 115)[1]} rx={70} ry={32} p={clamp((f - p.b) / 8)} f={f} color={K.grey} />
    <Ring cx={g(562, 327)[0]} cy={g(562, 327)[1]} rx={70} ry={32} p={clamp((f - p.b - 6) / 8)} f={f} color={K.grey} />
    <Label x={60} y={1010} zh="几乎没涨：6.8 → 最高 7.7" en="作者：增益未确立" color={K.grey} f={f} at={p.b + 8} size={46} />
    <Score f={f} flip={p.b} before="6.8" after="7.7" what="Gemma 3 270M · MATH-500" />
    <Bug mode="angle" />
    <Clock text="博客表 · 同样的办法" />
    <Src text="Gemma 本来很少打转 · 作者自报" />
  </Stage>;
}, (cue) => { const p = gemmaPlan(cue); return [{at: 0, kind: 'whoosh-short', gain: 0.06}, {at: p.a, kind: 'marker', gain: 0.06}, {at: p.b, kind: 'tick', gain: 0.07}]; });

/* ---------- 6 read: the which-game clip plays, freeze; then the READ card — 17,253 weights → Breakout ---------- */
const readPlan = (cue: Cue) => ({a: cue('a', 39)});
const Read = make(({f, cue}) => {
  const p = readPlan(cue);
  const card = f >= p.a - 4;
  const fz = freezeAt(f, p.a - 4);
  const [kx, ky] = cpt(240, 740), [nx, ny] = cpt(240, 400);
  return <Stage>
    {!card ? <div style={{position: 'absolute', left: 180, top: 300, width: 720, height: 720, boxShadow: '0 16px 40px rgba(0,0,0,0.2)'}}>
      <OffthreadVideo src={IMG('breakout.mp4')} muted style={{width: 720, height: 720, imageRendering: 'pixelated'}} />
    </div> : <Punch k={fz.k} cx={kx} cy={ky}>
      <Pic src={IMG('widget-2.png')} x={CX} y={CY} w={486} frz={fz.frz} />
      <Ring cx={nx} cy={ny} rx={230} ry={140} p={clamp((f - p.a) / 10)} f={f} color={K.green} />
      <Ring cx={kx} cy={ky} rx={200} ry={56} p={clamp((f - p.a - 10) / 10)} f={f} color={K.green} />
      <Label x={600} y={420} zh="只看 17,253 个权重" en="NO TOOLS · 无工具" color={K.green} f={f} at={p.a + 4} size={44} />
      <Label x={600} y={640} zh="认出：打砖块" en="BREAKOUT · 99% CONFIDENT" color={K.green} f={f} at={p.a + 14} size={48} />
    </Punch>}
    <Flash a={card ? fz.flash : 0} />
    <Bug mode={card ? 'freeze' : 'play'} />
    <Clock text={card ? '博客配图 · READ' : '博客动图 · 被读权重的网络在玩'} />
    <Src text="另一项实验：读小网络的权重 · 作者自报" />
  </Stage>;
}, (cue) => { const p = readPlan(cue); return [{at: 0, kind: 'tick', gain: 0.05}, {at: p.a - 4, kind: 'shutter', gain: 0.1}, {at: p.a + 14, kind: 'marker', gain: 0.07}]; });

/* ---------- 7 car: the FIX card — 3.5 % of the weights, 1,024 runs ---------- */
const carPlan = (cue: Cue) => ({a: cue('a', 24), b: cue('b', 65)});
const Car = make(({f, cue}) => {
  const p = carPlan(cue);
  const fz = freezeAt(f, p.b - 2);
  const [px, py] = cpt(100, 805), [sx, sy] = cpt(205, 620);
  return <Stage>
    <Punch k={fz.k} cx={px} cy={py}>
      <Pic src={IMG('widget-5.png')} x={CX} y={CY} w={486} frz={fz.frz} />
      <Marker pts={[cpt(150, 446), cpt(205, 418), cpt(260, 410)]} p={clamp((f - 4) / 14)} color={K.green} w={8} dash arrow seed={51} />
      <Ring cx={sx} cy={sy} rx={90} ry={36} p={clamp((f - p.a) / 10)} f={f} color={K.green} />
      <Ring cx={px} cy={py} rx={100} ry={44} p={clamp((f - p.b) / 10)} f={f} color={K.green} />
      <Label x={600} y={560} zh="改 3.5% 的权重" en="ONE SHOT · 一次改完" color={K.green} f={f} at={p.a + 4} size={46} />
      <Label x={600} y={760} zh="1024 局全过" en="UP FROM 0% · 作者自报" color={K.green} f={f} at={p.b + 4} size={48} />
    </Punch>
    <Flash a={fz.flash} />
    <Bug mode={f >= p.b - 2 ? 'freeze' : 'play'} />
    <Clock text="博客配图 · FIX" />
    <Src text="又一项实验，条件不同 · 作者自报" />
  </Stage>;
}, (cue) => { const p = carPlan(cue); return [{at: 4, kind: 'marker', gain: 0.06}, {at: p.a, kind: 'tick', gain: 0.07}, {at: p.b - 2, kind: 'shutter', gain: 0.09}]; });

/* ---------- 8 end: back to the IMPROVE card (frame 0's picture); the verdict as a label ---------- */
const endPlan = (cue: Cue) => ({a: cue('a', 72)});
const End = make(({f, cue}) => {
  const p = endPlan(cue);
  const [bx, by] = cpt(348, 310);
  return <Stage>
    <Pic src={IMG('widget-7.png')} x={CX} y={CY} w={486} frz={0.6} />
    <Ring cx={bx} cy={by} rx={86} ry={40} p={1} f={f} color={K.green} />
    <Label x={600} y={330} zh="作者自报" en="BLOG POST" color={K.grey} f={f} at={2} size={46} />
    <Label x={600} y={470} zh="未同行评审" en="NOT PEER-REVIEWED" color={K.grey} f={f} at={12} size={46} />
    <Label x={600} y={680} zh="修的是循环" en="NOT MATHS" color={K.green} f={f} at={p.a} size={56} />
    <Score f={f + 999} flip={0} before="7.9" after="48.1" what="MATH-500 正确率 %" />
    <Bug mode="freeze" />
    <Clock text="博客配图 · IMPROVE" />
    <Src text="博客《Sparks of Weight-Space Programming》· 作者自报 · 未同行评审" />
  </Stage>;
}, (cue) => { const p = endPlan(cue); return [{at: 2, kind: 'tick', gain: 0.06}, {at: 12, kind: 'tick', gain: 0.06}, {at: p.a, kind: 'marker', gain: 0.08}]; });

/** Cover anchor (880 × 800): the IMPROVE card's bars. */
const Cover: Scene = () => <div style={{position: 'absolute', left: 0, top: 0, width: 880, height: 800, overflow: 'hidden', background: K.page}}>
  <Img src={IMG('widget-7.png')} style={{position: 'absolute', left: 120, top: -240, width: 640}} />
</div>;

export const weightSpaceScenes: Record<string, Scene> = {
  'wp.hook': Hook, 'wp.who': Who, 'wp.loop': Loop, 'wp.fix': Fix, 'wp.gemma': Gemma, 'wp.read': Read, 'wp.car': Car, 'wp.end': End, 'wp.cover': Cover,
};
