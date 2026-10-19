import React from 'react';
import {AbsoluteFill, Img, OffthreadVideo, Sequence, staticFile} from 'remotion';
import {font} from '../theme';
import {clamp, ease, springStep} from '../../fx';
import {Cue, S, Scene, hitOf, phaseOp} from '../paper';
import {B, BG, Big, DIM, INK, LINE, Mono, PANEL, STEEL, mono} from '../tech';

// 一张图 + 一句话 = 360°环绕 (tutorial, ~92 s, full-screen 9:16). Script: inputs/orbit-360-doubao/script.md;
// storyboard: tutorials/orbit-360-doubao.storyboard.md. Narration and on-screen copy are verbatim from the script.
// Stage = the "full" layout, 900 × 1080 at (60, 200); keep what matters above y 1030 of the stage. Full-bleed footage is a
// scene `backdrop` (1080 × 1920). Every external clip carries 「案例展示」 (no names, no handles); the clips are silent.
// Accents: lemon (taken from clip 01) and cyan.

const W = 900;
const LEMON = '#ffd84a';
const CLIP = (n: string) => staticFile(`video/orbit-360-doubao/${n}.mp4`);
const STILL = (n: string) => staticFile(`images/tutorials/orbit-360-doubao/${n}.jpg`);
const CHAT = staticFile('images/tutorials/orbit-360-doubao/doubao-chat.png');

const Root: React.FC<{children: React.ReactNode}> = ({children}) => <div style={{position: 'relative', width: W, height: 1080}}>{children}</div>;
const Abs: React.FC<{x?: number; y: number; w?: number; style?: React.CSSProperties; children: React.ReactNode}> = ({x = 0, y, w, style, children}) => (
  <div style={{position: 'absolute', left: x, top: y, width: w, ...style}}>{children}</div>
);
const popIn = (f: number, at: number) => {
  const k = springStep(S(f), S(at), {f: 2.6, z: 0.62});
  const sq = hitOf(f, [at + 4], 1);
  return {opacity: clamp(k * 2), transform: `scale(${(0.6 + 0.4 * k) * (1 + 0.04 * sq)}, ${(0.6 + 0.4 * k) * (1 - 0.05 * sq)})`};
};
/** Big type with a dark stroke, readable over footage. */
const Over: React.FC<{size: number; c?: string; children: React.ReactNode; style?: React.CSSProperties}> = ({size, c = INK, children, style}) => (
  <div style={{fontFamily: font, fontWeight: 900, fontSize: size, lineHeight: 1.12, color: c, WebkitTextStroke: `${Math.round(size / 9)}px ${BG}`,
    paintOrder: 'stroke fill', letterSpacing: 1, ...style}}>{children}</div>
);
const CaseTag: React.FC<{style?: React.CSSProperties}> = ({style}) => (
  <div style={{position: 'absolute', background: 'rgba(12,26,44,0.85)', color: INK, fontFamily: font, fontWeight: 700, fontSize: 40, padding: '2px 14px',
    whiteSpace: 'nowrap', ...style}}>案例展示</div>
);
const ChipTag: React.FC<{c?: string; size?: number; children: React.ReactNode}> = ({c = LEMON, size = 52, children}) => (
  <div style={{display: 'inline-block', background: BG, border: `4px solid ${c}`, color: c, fontFamily: font, fontWeight: 900, fontSize: size, padding: '2px 18px',
    whiteSpace: 'nowrap'}}>{children}</div>
);
/** A 3:4 clip in a thin frame (card treatment), muted, with 「案例展示」 inside the bottom-right corner. */
const ClipCard: React.FC<{src: string; w: number; dim?: number; from?: number}> = ({src, w, dim = 0, from = 0}) => (
  <div style={{position: 'relative', width: w, height: (w * 4) / 3, outline: `3px solid ${STEEL}`, overflow: 'hidden', background: '#000'}}>
    <OffthreadVideo src={src} muted trimBefore={from} style={{width: '100%', height: '100%', objectFit: 'cover', opacity: 1 - dim}} />
    <CaseTag style={{right: 0, bottom: 0}} />
  </div>
);
/** Full-bleed clip under the stage, with darkened top (headline) and bottom (captions) bands. */
const Bleed: React.FC<{src: string; from?: number; dim?: number}> = ({src, from = 0, dim = 0}) => (
  <AbsoluteFill style={{background: '#000'}}>
    <OffthreadVideo src={src} muted trimBefore={from} style={{width: 1080, height: 1920, objectFit: 'cover', opacity: 1 - dim}} />
    <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(8,16,28,0.78) 0%, rgba(8,16,28,0.15) 32%, rgba(8,16,28,0) 55%, rgba(8,16,28,0.55) 78%, rgba(8,16,28,0.85) 100%)'}} />
    {/* 「案例展示」 above the caption band and left of the platform button column */}
    <CaseTag style={{right: 120, top: 1250}} />
  </AbsoluteFill>
);

/** The 豆包 chat screenshot zoomed onto one line (x0..x1, centred on y0, in the 972 × 410 source), boxed after `boxAt`. */
const ZoomShot: React.FC<{f: number; x0: number; x1: number; y0: number; s: number; h: number; boxAt: number; pan?: number; outAt?: number}> = ({f, x0, x1, y0, s, h, boxAt, pan = 0, outAt = 1e9}) => {
  // px per source pixel; the image is sized directly (no CSS scale) so the zoom is exact
  // zoomed on the line (with a slow drift / pan), then optionally pulled back to the whole screenshot at `outAt`
  const out = ease.inOutCubic(clamp((f - outAt) / 24)), fit = W / 972;
  const kz = s * (1 + 0.14 * ease.inOutCubic(clamp(f / 120)));
  const k = kz + (fit - kz) * out;
  const left = (40 - x0 * kz - pan * ease.inOutCubic(clamp((f - 20) / 100))) * (1 - out), top = (h / 2 - y0 * kz) * (1 - out) + (h / 2 - 205 * fit) * out;
  return <div style={{position: 'relative', width: W, height: h, overflow: 'hidden', border: `3px solid ${STEEL}`, background: '#fff'}}>
    <Img src={CHAT} style={{position: 'absolute', left, top, width: 972 * k, height: 410 * k, maxWidth: 'none'}} />
    <div style={{position: 'absolute', left: left + (x0 - 6) * k, top: top + (y0 - 15) * k, width: (x1 - x0 + 12) * k, height: 30 * k, border: `4px solid ${B}`,
      opacity: clamp((f - boxAt) / 6)}} />
    <CaseTag style={{right: 0, bottom: 0}} />
  </div>;
};

/* ---------- 1 hook: clip 01 orbiting at frame 0, headline already there ---------- */

const hookPlan = (cue: Cue) => ({a: cue('a', 124)});
const Hook: Scene = ({f, cue}) => {
  const p = hookPlan(cue);
  // the headline "slams" in: on screen at frame 0, settling from a slight over-scale
  const slam = 1 + 0.12 * (1 - ease.outCubic(clamp(f / 8)));
  return <Root>
    <Abs y={600} w={W} style={{transform: `scale(${slam})`, transformOrigin: '0% 0%'}}>
      <Over size={118}>一张图 + 一句话</Over>
      <Over size={140} c={LEMON}>= 360°环绕</Over>
    </Abs>
    <Abs y={940} w={W} style={{display: 'flex', gap: 20}}>
      {['免部署', '豆包可用'].map((t, i) => f >= p.a + i * 6 - 1 && <div key={t} style={{...popIn(f, p.a + i * 6), transformOrigin: '0% 50%'}}><ChipTag c={B} size={60}>{t}</ChipTag></div>)}
    </Abs>
  </Root>;
};
Hook.backdrop = () => <Bleed src={CLIP('01')} />;
Hook.sfx = (cue) => [{at: 0, kind: 'thud', gain: 0.16}, ...[0, 6].map((d) => ({at: hookPlan(cue).a + d, kind: 'pop', gain: 0.12}))];

/* ---------- 2 what: frozen subject, moving camera (top-down orbit diagram) ---------- */

const whatPlan = (cue: Cue) => ({a: cue('a', 21), d: cue('d', 103), b: cue('b', 153), c: cue('c', 259)});
const OrbitDiagram: React.FC<{f: number; r?: number; lit?: number}> = ({f, r = 110, lit = 1}) => {
  const ang = (f / 30) * 1.4;
  const cx = r + 30, cy = r + 30;
  const x = cx + r * Math.cos(ang), y = cy + r * Math.sin(ang);
  const face = (Math.atan2(cy - y, cx - x) * 180) / Math.PI;
  return <svg width={2 * r + 60} height={2 * r + 60} style={{overflow: 'visible'}}>
    <circle cx={cx} cy={cy} r={r} fill="none" stroke={B} strokeWidth={4} strokeDasharray="12 10" opacity={0.85} />
    <circle cx={cx} cy={cy} r={18} fill={LEMON} />
    <g transform={`translate(${x} ${y}) rotate(${face})`} opacity={lit}>
      <rect x={-22} y={-16} width={34} height={32} rx={5} fill={INK} />
      <path d="M12 -10 L28 -18 L28 18 L12 10 Z" fill={INK} />
    </g>
  </svg>;
};
const What: Scene = ({f, cue}) => {
  const p = whatPlan(cue);
  return <Root>
    {f >= p.a - 2 && <Abs y={0} style={phaseOp(f, p.a - 2)}><Big size={64}>360°环绕 / 子弹时间</Big></Abs>}
    <Abs x={600} y={100} style={phaseOp(f, 0)}><OrbitDiagram f={f} r={120} /></Abs>
    <Abs y={300} style={phaseOp(f, 0)}><ClipCard src={CLIP('02')} w={540} /></Abs>
    {f >= p.d - 1 && <Abs x={580} y={450} style={{...popIn(f, p.d), transformOrigin: '0% 50%'}}><ChipTag c={LEMON}>主体：定格</ChipTag></Abs>}
    {f >= p.b - 1 && <Abs x={580} y={560} style={{...popIn(f, p.b), transformOrigin: '0% 50%'}}><ChipTag c={B}>镜头：在动</ChipTag></Abs>}
    {f >= p.c - 2 && <Abs x={580} y={720} w={320} style={phaseOp(f, p.c - 2)}><Big size={60}>AI 补出</Big><Big size={60}>其他角度</Big></Abs>}
  </Root>;
};
What.sfx = (cue) => {
  const p = whatPlan(cue);
  return [{at: p.a, kind: 'whoosh-short', gain: 0.1}, {at: p.d + 2, kind: 'pop', gain: 0.12}, {at: p.b + 2, kind: 'pop', gain: 0.12}, {at: p.c, kind: 'tick', gain: 0.1}];
};

/* ---------- 3 uses: quick cuts, one chip per use ---------- */

const usesPlan = (cue: Cue) => ({a: cue('a', 33), b: cue('b', 98), c: cue('c', 203), d: cue('d', 298)});
const USES = [{clip: '02', label: '旅游 / 美食'}, {clip: '03', label: '美妆'}, {clip: '05', label: '产品展示'}, {clip: '04', label: '商拍 / 穿搭'}];
const cutStarts = (p: ReturnType<typeof usesPlan>) => [p.a, p.b, p.c, p.d];
const Uses: Scene = ({f, cue}) => {
  const p = usesPlan(cue);
  const starts = cutStarts(p);
  const i = starts.filter((s) => f >= s).length - 1;
  return <Root>
    {i < 0 && <Abs y={40} w={W}><Over size={130}>能干嘛？</Over></Abs>}
    {i >= 0 && <Abs y={40} w={W} key={i} style={{...popIn(f, starts[i]), transformOrigin: '0% 50%'}}><ChipTag c={LEMON} size={96}>{USES[i].label}</ChipTag></Abs>}
  </Root>;
};
Uses.backdrop = ({f, cue}) => {
  const p = usesPlan(cue);
  const starts = [0, p.b, p.c, p.d];
  return <>{USES.map((u, k) => {
    const from = starts[k], to = k < 3 ? starts[k + 1] : 1e5;
    if (f < from || f >= to) return null;
    const punch = 1 + 0.06 * (1 - ease.outCubic(clamp((f - from) / 8)));
    return <AbsoluteFill key={u.clip} style={{transform: `scale(${punch})`}}>
      <Sequence from={from} layout="none"><Bleed src={CLIP(u.clip)} /></Sequence>
    </AbsoluteFill>;
  })}</>;
};
Uses.sfx = (cue) => {
  const p = usesPlan(cue);
  return cutStarts(p).map((at) => ({at, kind: 'whoosh-short', gain: 0.1}));
};

/* ---------- 4 step 1: upload a clear photo (a generic chat window, no real app UI) ---------- */

const step1Plan = (cue: Cue) => ({a: cue('a', 48), b: cue('b', 89), c: cue('c', 155)});
const ChatWindow: React.FC<{children: React.ReactNode; h: number}> = ({children, h}) => (
  <div style={{position: 'relative', width: W, height: h, border: `3px solid ${STEEL}`, background: PANEL, overflow: 'hidden'}}>
    <div style={{height: 70, borderBottom: `2px solid ${LINE}`, display: 'flex', alignItems: 'center', padding: '0 24px', gap: 14}}>
      <div style={{width: 18, height: 18, borderRadius: 9, background: B}} /><Mono size={40} c={INK} w={700}>AI 对话</Mono>
    </div>
    {children}
    <div style={{position: 'absolute', left: 20, right: 20, bottom: 18, height: 72, border: `2px solid ${LINE}`, borderRadius: 36, display: 'flex', alignItems: 'center',
      padding: '0 24px', gap: 18}}>
      <div style={{fontFamily: mono, fontSize: 48, color: B, fontWeight: 800}}>＋</div><Mono size={40}>上传图片…</Mono>
    </div>
  </div>
);
const Step1: Scene = ({f, cue}) => {
  const p = step1Plan(cue);
  const slide = springStep(S(f), S(p.b), {f: 2.2, z: 0.7});
  return <Root>
    {f < p.a ? <Abs y={10} w={W}><Big size={110}>做法就两步</Big></Abs>
      : <Abs y={0} w={W} style={phaseOp(f, p.a)}>
        <Mono size={44} c={LEMON} w={800}>STEP 1</Mono>
        <Big size={64}>上传一张主体清楚的照片</Big>
      </Abs>}
    <Abs y={240} style={phaseOp(f, 6)}>
      <ChatWindow h={620}>
        {f >= p.b - 4 && <div style={{position: 'absolute', right: 30, top: 100 + (1 - clamp(slide)) * 260, opacity: clamp(slide * 2), border: `4px solid ${LEMON}`,
          transform: `perspective(900px) rotateY(${f > p.b + 24 ? 28 * Math.sin(((f - p.b - 24) / 30) * 2.2) : 0}deg)`}}>
          <Img src={STILL('05')} style={{width: 270, height: 360, objectFit: 'cover', display: 'block'}} />
          <div style={{position: 'absolute', left: -2, bottom: -2, background: LEMON, color: BG, fontFamily: font, fontWeight: 900, fontSize: 40, padding: '0 10px'}}>主体清楚 ✓</div>
        </div>}
        {f >= p.b + 24 && <div style={{position: 'absolute', left: 30, top: 140, width: 500, ...phaseOp(f, p.b + 24)}}>
          <Mono size={40} c={INK}>生成中{'.'.repeat(1 + (Math.floor(f / 8) % 3))}</Mono>
          <div style={{marginTop: 14, height: 34, border: `3px solid ${LINE}`}}><div style={{height: '100%', width: `${100 * clamp((f - p.b - 24) / 110)}%`, background: B}} /></div>
          <div style={{marginTop: 30, marginLeft: 40}}><OrbitDiagram f={f} r={90} /></div>
        </div>}
      </ChatWindow>
    </Abs>
    {f >= p.c - 2 && <Abs y={900} w={W} style={phaseOp(f, p.c - 2)}><Big size={52} c={INK}>豆包 / 千问 / 元宝 都可试</Big></Abs>}
  </Root>;
};
Step1.sfx = (cue) => {
  const p = step1Plan(cue);
  return [{at: p.a, kind: 'tick', gain: 0.12}, {at: p.b + 8, kind: 'tap', gain: 0.16}, {at: p.c, kind: 'tick', gain: 0.1}];
};

/* ---------- 5 step 2: the prompt card (verbatim, kept on screen long enough to screenshot) ---------- */

const PROMPT = '以我上传的图片作为首帧和外观参考。生成6秒连续一镜到底视频：画面中的主体和环境定格在原图瞬间，摄影机向画面左侧移动，沿以主体为中心的水平圆弧轨道连续环绕，镜头始终朝向主体，保持基本相同的高度和距离，呈现清楚的前景、主体、背景视差。保持主体的外观、姿势、比例及原图光线；主体不自行转动，背景不重新排列，不切镜、不变焦、不新增物体。无字幕、无旁白。';
/** Phrases in the prompt that light up as the narration names them (same order as the four labels). */
const KEYS = ['定格在原图瞬间', '水平圆弧轨道连续环绕', '相同的高度和距离', '不切镜、不变焦、不新增物体'];
const LABELS = ['定格在原图瞬间', '水平圆弧环绕', '高度和距离不变', '不切镜 不变焦 不新增物体'];
const step2Plan = (cue: Cue) => ({e: cue('e', 79), a: cue('a', 110), b: cue('b', 191), c: cue('c', 319), d: cue('d', 359)});
const PromptText: React.FC<{f: number; shown: number; lit: number[]}> = ({f, shown, lit}) => {
  const text = PROMPT.slice(0, shown);
  const parts: React.ReactNode[] = [];
  let i = 0;
  while (i < text.length) {
    const k = KEYS.findIndex((key) => PROMPT.startsWith(key, i));
    if (k >= 0) {
      const seg = text.slice(i, i + KEYS[k].length);
      const on = clamp((f - lit[k]) / 6);
      parts.push(<span key={i} style={{background: on ? `rgba(255,216,74,${0.95 * on})` : undefined, color: on > 0.5 ? BG : INK, padding: '0 2px'}}>{seg}</span>);
      i += KEYS[k].length;
    } else {
      let j = i + 1;
      while (j < text.length && KEYS.findIndex((key) => PROMPT.startsWith(key, j)) < 0) j += 1;
      parts.push(<React.Fragment key={i}>{text.slice(i, j)}</React.Fragment>);
      i = j;
    }
  }
  return <>{parts}</>;
};
const Step2: Scene = ({f, cue}) => {
  const p = step2Plan(cue);
  const lit = [p.a, p.b, p.c, p.d];
  const reveal = Math.round(PROMPT.length * ease.outCubic(clamp((f - p.e + 6) / 30)));
  const proof = f < p.e + 4;
  return <Root>
    <Abs y={0} w={W}><Mono size={44} c={LEMON} w={800}>STEP 2</Mono><Big size={64}>图片 + 指令 一起发</Big></Abs>
    {/* proof: the real chat reply, zoomed on the Seedance 2.0 Mini line */}
    {proof && <Abs y={260} w={W} style={phaseOp(f, 4, p.e - 4)}><ZoomShot f={f} x0={52} x1={338} y0={331} s={2.5} h={300} boxAt={20} /></Abs>}
    {f >= p.a - 1 && <Abs x={680} y={20} style={phaseOp(f, p.a - 1)}>
      <div style={{fontFamily: mono, fontWeight: 800, fontSize: 96, color: LEMON, ...popIn(f, lit.filter((t) => f >= t).at(-1) ?? p.a)}}>{lit.filter((t) => f >= t).length}/4</div>
    </Abs>}
    {f >= p.e - 8 && <Abs y={180} w={W} style={{...phaseOp(f, p.e - 8), scale: `${1 + 0.05 * clamp((f - p.e) / 300)}`, transformOrigin: '50% 0%'}}>
      <div style={{position: 'relative', border: `4px solid ${LEMON}`, background: BG, padding: '20px 24px'}}>
        <div style={{position: 'absolute', right: 14, top: -30, background: LEMON, color: BG, fontFamily: font, fontWeight: 900, fontSize: 40, padding: '0 12px'}}>建议截图保存</div>
        <div style={{fontFamily: mono, fontSize: 40, lineHeight: 1.42, color: INK, textAlign: 'justify'}}>
          <PromptText f={f} shown={reveal} lit={lit} />
        </div>
      </div>
    </Abs>}
    <Abs y={850} w={W} style={{display: 'flex', flexWrap: 'wrap', gap: 14}}>
      {LABELS.map((l, k) => f >= lit[k] - 1 && <div key={l} style={{...popIn(f, lit[k]), transformOrigin: '0% 50%'}}><ChipTag c={LEMON} size={40}>{l}</ChipTag></div>)}
    </Abs>
  </Root>;
};
Step2.sfx = (cue) => {
  const p = step2Plan(cue);
  return [{at: 20, kind: 'tick', gain: 0.1}, {at: p.e - 8, kind: 'whoosh-short', gain: 0.1}, ...[p.a, p.b, p.c, p.d].map((at) => ({at, kind: 'tap', gain: 0.14}))];
};

/* ---------- 6 pitfalls ---------- */

const pitPlan = (cue: Cue) => ({a: cue('a', 33), b: cue('b', 153), c: cue('c', 288)});
const Person: React.FC<{turn?: number; c?: string}> = ({turn = 1, c = INK}) => (
  <svg width={120} height={200} style={{overflow: 'visible'}}>
    <g transform={`translate(60 0) scale(${turn} 1)`}>
      <circle cx={0} cy={36} r={30} fill={c} />
      <path d="M-44 190 L-34 90 Q0 70 34 90 L44 190 Z" fill={c} />
      <circle cx={14} cy={32} r={6} fill={BG} />
    </g>
  </svg>
);
const Pitfalls: Scene = ({f, cue}) => {
  const p = pitPlan(cue);
  const seg = f < p.a ? 0 : f < p.b ? 1 : f < p.c ? 2 : 3;
  const title = ['', '坑1  要有前后层次', '坑2  镜头绕 ≠ 人转', '坑3  免费额度用完会扣费'][seg];
  const at = [0, p.a, p.b, p.c][seg];
  return <Root>
    {seg === 0 && <Abs y={260} w={W} style={{textAlign: 'center'}}><Big size={130}>三个坑</Big></Abs>}
    {seg > 0 && <Abs y={0} w={W} key={seg} style={{...popIn(f, at), transformOrigin: '0% 50%'}}><Big size={68} c={LEMON}>{title}</Big></Abs>}
    {seg === 1 && <>
      <Abs y={130} style={phaseOp(f, p.a)}><ClipCard src={CLIP('01')} w={540} /></Abs>
      {[{y: 230, t: '前景', c: LEMON}, {y: 420, t: '主体', c: INK}, {y: 610, t: '背景', c: B}].map((l, i) => f >= p.a + 10 + i * 8 - 1 && (
        <Abs key={l.t} x={560} y={l.y} style={{...popIn(f, p.a + 10 + i * 8), transformOrigin: '0% 50%', display: 'flex', alignItems: 'center', gap: 10}}>
          <Big size={64} c={l.c}>← {l.t}</Big>
        </Abs>))}
    </>}
    {seg === 2 && <>
      {[{x: 0, ok: false, label: '✗ 人转身'}, {x: 470, ok: true, label: '✓ 镜头绕'}].map((s) => (
        <Abs key={s.label} x={s.x} y={130} w={430} style={{...phaseOp(f, p.b + (s.ok ? 10 : 0)), height: 700, border: `4px solid ${s.ok ? B : DIM}`, background: PANEL}}>
          <Abs y={24} w={430} style={{textAlign: 'center'}}><Big size={64} c={s.ok ? B : DIM}>{s.label}</Big></Abs>
          {s.ok
            ? <Abs x={45} y={130}><Sequence from={p.b} layout="none"><ClipCard src={CLIP('01')} w={340} /></Sequence></Abs>
            : <Abs x={155} y={200} style={{transform: `perspective(800px) rotateY(${((f - p.b) * 6) % 360}deg) scale(1.7)`, transformOrigin: '60px 100px'}}>
              <Person c={DIM} />
            </Abs>}
        </Abs>))}
    </>}
    {seg === 3 && <Abs y={200} w={W} style={phaseOp(f, p.c)}><ZoomShot f={f - p.c} x0={52} x1={455} y0={195} s={2.4} h={380} boxAt={10} pan={260} outAt={70} /></Abs>}
  </Root>;
};
Pitfalls.sfx = (cue) => {
  const p = pitPlan(cue);
  return [{at: 2, kind: 'stamp', gain: 0.16}, ...[p.a, p.b, p.c].map((at) => ({at, kind: 'whoosh-short', gain: 0.1}))];
};

/* ---------- 7 check: four ticks over clip 03 ---------- */

const checkPlan = (cue: Cue) => ({a: cue('a', 54), b: cue('b', 95), c: cue('c', 132), d: cue('d', 189)});
const CHECKS = ['主体定格', '镜头真在绕', '侧面背面不变形', '结尾接回开头'];
const Check: Scene = ({f, cue}) => {
  const p = checkPlan(cue);
  const ats = [p.a, p.b, p.c, p.d];
  return <Root>
    <Abs y={0} w={W}><Big size={72}>生成后检查四点</Big></Abs>
    <Abs x={180} y={130} style={phaseOp(f, 0)}><ClipCard src={CLIP('03')} w={540} dim={0.55} /></Abs>
    {CHECKS.map((c, i) => <Abs key={c} x={40} y={230 + i * 150} w={820} style={{opacity: f >= ats[i] - 1 ? 1 : 0.35}}>
      <div style={{display: 'inline-flex', alignItems: 'center', gap: 18, background: 'rgba(12,26,44,0.88)', padding: '6px 20px', border: `3px solid ${f >= ats[i] ? LEMON : LINE}`}}>
        <span style={{fontFamily: font, fontWeight: 900, fontSize: 68, color: LEMON, ...(f >= ats[i] - 1 ? popIn(f, ats[i]) : {opacity: 0}), display: 'inline-block'}}>✓</span>
        <Big size={64}>{c}</Big>
      </div>
    </Abs>)}
  </Root>;
};
Check.sfx = (cue) => {
  const p = checkPlan(cue);
  return [p.a, p.b, p.c, p.d].map((at) => ({at, kind: 'tick', gain: 0.14}));
};

/* ---------- 8 advanced: ComfyUI node chain ---------- */

const advPlan = (cue: Cue) => ({a: cue('a', 71), b: cue('b', 120), c: cue('c', 173), d: cue('d', 281)});
const NODES = ['MiniMax H3 I2V 模板', '360° Orbit LoRA', '同一张图接首帧 + 尾帧', '运行'];
const Advanced: Scene = ({f, cue}) => {
  const p = advPlan(cue);
  const ats = [p.a, p.b, p.b + 18, p.b + 34];
  return <Root>
    {(() => {
      const k = ease.inOutCubic(clamp((f - p.a + 14) / 16));
      return <Abs y={360 * (1 - k)} w={W} style={{scale: `${1.15 - 0.15 * k}`, transformOrigin: '0% 0%'}}><Big size={68}>进阶：<span style={{color: B}}>ComfyUI</span> 本地跑</Big></Abs>;
    })()}
    {NODES.map((n, i) => {
      const on = f >= ats[i] - 1;
      return <React.Fragment key={n}>
        {i > 0 && <svg width={40} height={46} style={{position: 'absolute', left: 120, top: 120 + i * 140 - 46, opacity: on ? 1 : 0}}>
          <line x1={20} y1={0} x2={20} y2={46} stroke={B} strokeWidth={5} strokeDasharray="8 6" strokeDashoffset={-f} />
        </svg>}
        <Abs x={40} y={120 + i * 140} w={760} style={{...(on ? popIn(f, ats[i]) : {opacity: 0}), transformOrigin: '0% 50%', border: `4px solid ${i === 1 ? LEMON : STEEL}`,
          background: f >= ats[3] + 10 && Math.floor((f - ats[3] - 10) / 14) % 4 === i ? 'rgba(79,214,232,0.35)' : PANEL, padding: '14px 24px', display: 'flex', alignItems: 'center', gap: 18}}>
          <div style={{width: 20, height: 20, borderRadius: 10, background: i === 1 ? LEMON : B}} />
          <Big size={52}>{n}</Big>
        </Abs>
      </React.Fragment>;
    })}
    <Abs y={700} w={W} style={{display: 'flex', gap: 18}}>
      {['模型几十 GB', 'LoRA 以人像为主'].map((t, i) => f >= p.c + i * 10 - 1 && <div key={t} style={{...popIn(f, p.c + i * 10), transformOrigin: '0% 50%'}}><ChipTag c={LEMON} size={52}>⚠ {t}</ChipTag></div>)}
    </Abs>
    {f >= p.d - 1 && <Abs y={830} w={W} style={{...popIn(f, p.d), transformOrigin: '0% 50%'}}><Big size={88}>新手：<span style={{color: LEMON}}>豆包就够</span></Big></Abs>}
  </Root>;
};
Advanced.sfx = (cue) => {
  const p = advPlan(cue);
  return [p.a, p.b, p.b + 18, p.b + 34].map((at) => ({at, kind: 'tap', gain: 0.12})).concat([{at: p.c, kind: 'tick', gain: 0.12}, {at: p.d, kind: 'stamp', gain: 0.16}]);
};

/* ---------- 9 close: back to clip 01 (the orbit returns to where it started) ---------- */

const Close: Scene = ({f}) => (
  <Root>
    <Abs y={660} w={W} style={{...popIn(f, 2), transformOrigin: '0% 50%'}}>
      <Over size={120}>挑一张照片，</Over>
      <Over size={120} c={LEMON}>试一张</Over>
    </Abs>
  </Root>
);
Close.backdrop = () => <Bleed src={CLIP('01')} />;
Close.sfx = () => [{at: 2, kind: 'thud', gain: 0.14}];

/* ---------- covers (anchor box 880 × 800) ---------- */

const Cover67: Scene = () => <div style={{position: 'relative', width: 880, height: 800}}>
  <Img src={STILL('01')} style={{position: 'absolute', left: 140, top: 0, width: 600, height: 800, objectFit: 'cover', outline: `3px solid ${STEEL}`}} />
  <svg width={880} height={800} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
    <ellipse cx={440} cy={470} rx={420} ry={120} fill="none" stroke={LEMON} strokeWidth={10} style={{filter: `drop-shadow(0 0 14px ${LEMON})`}} />
    <path d="M820 500 L860 462 L872 518 Z" fill={LEMON} />
  </svg>
</div>;
const Cover34: Scene = () => <div style={{position: 'relative', width: 880, height: 800, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16}}>
  {['01', '02', '03', '05'].map((n) => <Img key={n} src={STILL(n)} style={{width: '100%', height: 392, objectFit: 'cover', outline: `3px solid ${STEEL}`}} />)}
</div>;

export const orbitScenes: Record<string, Scene> = {
  'orb.hook': Hook,
  'orb.what': What,
  'orb.uses': Uses,
  'orb.step1': Step1,
  'orb.step2': Step2,
  'orb.pitfalls': Pitfalls,
  'orb.check': Check,
  'orb.advanced': Advanced,
  'orb.close': Close,
  'orb.cover67': Cover67,
  'orb.cover34': Cover34,
};
