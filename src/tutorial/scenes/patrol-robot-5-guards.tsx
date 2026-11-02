import React from 'react';
import {Img, OffthreadVideo, staticFile} from 'remotion';
import {clamp, ease} from '../../fx';
import {font} from '../theme';
import {inter, plex} from '../fonts';
import {Cue, Scene} from '../paper';
import {W} from '../package';

// patrol-robot-5-guards, made on the template lemo/visual-investigation (docs/video-craft/prompt-library/vendor/lemomo-
// opuscar/3961ddb/styles/visual-investigation/STYLE.md): "one patrol robot = 5 guards" is a media claim (a reprint of a
// 台州晚报 report whose original no one could find), the vendors themselves say 3 or 4–5, and the one community with a local
// report says what actually changed: the night shift went from two people to one person watching a screen, who goes out
// when there's an alarm. Inputs: inputs/patrol-robot-5-guards/ (materials.md, review.md — Eko approved, sources.md).
// Angle (planner): the machine finds, a person handles — no "robots take jobs".
// - What the template gives: near-black ground, hard-edged panels with 1 px frames, sources in greyscale under one grade,
//   ONE accent that only points (circles, highlights, the match, the unresolved box), short mono source tags above each
//   piece of evidence, typeset transcriptions on paper cards (#E4E0D4 / #1D1D1B) with the decisive line wiped in the accent,
//   uncertainty drawn (dashed boxes, 「未找到」), elements cut in with a 3-frame white flash, nothing bounces; native moves
//   "then vs. record", "dots for people", "known / unresolved", "freeze, circle".
// - Customised (模板改造): the accent is the thermal camera's orange from the Nanjing TV clip (#D85A31) — the machine's own
//   sight — and the thermal shot is the only source left in colour; the dots board counts guards (5 / 3 / 4–5, then 2 → 1)
//   instead of people in a disaster; Chinese-only subtitles at 60 px (no English twin); our synthesized "news" score.

const K = {ground: '#0B0C0E', panel: '#141619', line: '#2E3238', ink: '#ECEAE4', dim: '#8B9097', tick: '#4A4F57', acc: '#D85A31', paper: '#E4E0D4', paperInk: '#1D1D1B'};
const A = (n: string) => staticFile(`video/patrol-robot-5-guards/${n}`);
const GRADE = 'grayscale(1) contrast(1.22) brightness(0.94)';
const M = 60;

const Stage: React.FC<{children: React.ReactNode}> = ({children}) => <div style={{position: 'absolute', inset: 0, background: K.ground, overflow: 'hidden'}}>{children}</div>;

/** Cut in with a 3-frame white flash (template §5). */
const Cut: React.FC<{f: number; at: number; children: React.ReactNode; style?: React.CSSProperties}> = ({f, at, children, style}) => {
  if (f < at) return null;
  const fl = 1 - clamp((f - at) / 3);
  return <div style={{position: 'absolute', ...style}}>
    {children}
    {fl > 0 && <div style={{position: 'absolute', inset: 0, background: '#fff', opacity: fl * 0.85}} />}
  </div>;
};
/** Source tag: a 6×12 chip + `type · source` in mono, above its frame. */
const Tag: React.FC<{children: React.ReactNode; color?: string}> = ({children, color = K.dim}) => <div style={{display: 'flex', alignItems: 'center', gap: 10, fontFamily: plex, fontWeight: 500, fontSize: 28, color, marginBottom: 10}}>
  <span style={{width: 6, height: 12, background: color, display: 'inline-block'}} />{children}
</div>;
/** A heading: one finding per layout. */
const Heading: React.FC<{children: React.ReactNode; top?: number}> = ({children, top = 120}) => <div style={{position: 'absolute', left: M, top, fontFamily: font, fontWeight: 900, fontSize: 76, color: K.ink, lineHeight: 1.1}}>{children}</div>;

/** A photo / footage panel in the one grade, with a slow push (≤ 1.06×). */
const Photo: React.FC<{f: number; src: string; video?: boolean; color?: boolean; x?: number; y: number; w?: number; h: number; push?: number; origin?: string; children?: React.ReactNode}> = ({f, src, video, color, x = M, y, w = W - 2 * M, h, push = 0.05, origin = '50% 50%', children}) => (
  <div style={{position: 'absolute', left: x, top: y, width: w, height: h, overflow: 'hidden', border: `1px solid ${K.line}`, background: K.panel}}>
    <div style={{position: 'absolute', inset: 0, transform: `scale(${1 + push * clamp(f / 150)})`, transformOrigin: origin, filter: color ? 'none' : GRADE}}>
      {video ? <OffthreadVideo src={src} muted style={{width: '100%', height: '100%', objectFit: 'cover'}} /> : <Img src={src} style={{width: '100%', height: '100%', objectFit: 'cover'}} />}
    </div>
    {children}
  </div>
);
/** A circle drawn clockwise in 0.5 s (ease-out cubic), 4 px accent. */
const Circle: React.FC<{f: number; at: number; cx: number; cy: number; r: number}> = ({f, at, cx, cy, r}) => {
  const p = ease.outCubic(clamp((f - at) / 15));
  if (p <= 0) return null;
  const C = 2 * Math.PI * r;
  return <svg style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}} width={1} height={1}>
    <circle cx={cx} cy={cy} r={r} fill="none" stroke={K.acc} strokeWidth={5} strokeDasharray={`${C * p} ${C}`} transform={`rotate(-90 ${cx} ${cy})`} />
  </svg>;
};
/** A typeset transcription on a paper card; `marks` are [start, end, at] spans wiped in the accent (multiply, ~0.6). */
const Paper: React.FC<{f: number; text: string; marks?: [number, number, number][]; size?: number}> = ({f, text, marks = [], size = 52}) => {
  const chars = [...text];
  return <div style={{background: K.paper, color: K.paperInk, padding: '30px 34px', fontFamily: font, fontWeight: 800, fontSize: size, lineHeight: 1.45}}>
    {chars.map((ch, i) => {
      const m = marks.find(([s, e]) => i >= s && i < e);
      if (!m) return <span key={i}>{ch}</span>;
      const p = clamp((f - m[2] - (i - m[0]) * 0.6) / 3);
      return <span key={i} style={{background: `linear-gradient(90deg, rgba(216,90,49,0.6) ${p * 100}%, transparent ${p * 100}%)`, mixBlendMode: 'multiply'}}>{ch}</span>;
    })}
  </div>;
};
/** One dot per guard; `on` solid, `dashed` uncertain. */
const Dots: React.FC<{n: number; on: number; dashed?: number; size?: number; color?: string}> = ({n, on, dashed = 0, size = 80, color = K.ink}) => <div style={{display: 'flex', gap: 18}}>
  {Array.from({length: n}, (_, i) => <div key={i} style={{width: size, height: size, borderRadius: '50%', boxSizing: 'border-box',
    background: i < on ? color : 'transparent', border: i < on ? 'none' : `3px ${i < on + dashed ? 'dashed' : 'solid'} ${i < on + dashed ? color : K.tick}`, transform: `scale(${i < on || i < on + dashed ? 1 : 0.9})`}} />)}
</div>;

const make = (draw: NonNullable<Scene['backdrop']>, sfx?: Scene['sfx']): Scene => {
  const Sc: Scene = () => null;
  Sc.backdrop = draw;
  Sc.sfx = sfx;
  return Sc;
};

/* 1 hook: the claim as printed (a transcription of the reprint's headline), five guard dots, the robot it is about */
const hookPlan = (cue: Cue) => ({a: cue('a', 91)});
const Hook = make(({f, cue}) => {
  const p = hookPlan(cue);
  const T = '1台抵5个保安，每月仅耗电约200度';
  return <Stage>
    <div style={{position: 'absolute', left: M, top: 140, width: W - 2 * M}}>
      <Tag>转载标题 · 澎湃号（河南经济报）</Tag>
      <Paper f={f} text={T} size={64} marks={[[3, 7, -20], [13, 18, p.a - 2]]} />
    </div>
    <div style={{position: 'absolute', left: M, top: 470}}>
      <Tag>媒体说法 · 转述台州晚报</Tag>
      <div style={{display: 'flex', alignItems: 'center', gap: 26}}>
        <Dots n={5} on={5} size={72} />
        <span style={{fontFamily: font, fontWeight: 800, fontSize: 44, color: K.ink}}>= 5 个保安</span>
      </div>
    </div>
    <div style={{position: 'absolute', left: M, top: 640}}><Tag>照片 · 厂商官网</Tag></div>
    <Photo f={f} src={A('ruihua.png')} y={688} h={700} push={0.06} origin="45% 70%" />
  </Stage>;
}, (cue) => { const p = hookPlan(cue); return [{at: 0, kind: 'paper', gain: 0.1}, ...[0, 1, 2, 3, 4].map((i) => ({at: 8 + i * 3, kind: 'tick', gain: 0.06})), {at: p.a - 2, kind: 'marker', gain: 0.07}]; });

/* 2 vendor: then vs. record — the vendors' own counts under the claim */
const vendorPlan = (cue: Cue) => ({a: cue('a', 56), b: cue('b', 80)});
const Row: React.FC<{f: number; at: number; tag: string; n: number; on: number; dashed?: number; note: string; y: number}> = ({f, at, tag, n, on, dashed, note, y}) => <Cut f={f} at={at} style={{left: M, top: y, width: W - 2 * M}}>
  <div style={{borderTop: `1px solid ${K.line}`, paddingTop: 22}}>
    <Tag>{tag}</Tag>
    <div style={{display: 'flex', alignItems: 'center', gap: 28}}>
      <Dots n={n} on={on} dashed={dashed} />
      </div><div style={{fontFamily: font, fontWeight: 800, fontSize: 50, color: K.ink, marginTop: 18}}>{note}</div><div>
    </div>
  </div>
</Cut>;
const Vendor = make(({f, cue}) => {
  const p = vendorPlan(cue);
  return <Stage>
    <Heading>顶几个保安？</Heading>
    <Row f={f} at={0} tag="媒体说法 · 转述台州晚报" n={5} on={5} note="5 个" y={300} />
    <Row f={f} at={p.a - 4} tag="厂商自述 · 万为官网" n={5} on={3} note="16 小时 = 3 名保安" y={590} />
    <Row f={f} at={p.b - 4} tag="厂商人员 · 江苏省委新闻网" n={5} on={4} dashed={1} note="替代四到五名人工" y={880} />
    {f >= p.b + 14 && <div style={{position: 'absolute', left: M, top: 1200, width: W - 2 * M, border: `3px dashed ${K.acc}`, padding: '20px 26px', fontFamily: font, fontWeight: 900, fontSize: 56, color: K.acc, opacity: clamp((f - p.b - 14) / 4)}}>三个说法，三个数</div>}
  </Stage>;
}, (cue) => { const p = vendorPlan(cue); return [{at: 0, kind: 'shutter', gain: 0.07}, {at: p.a - 4, kind: 'shutter', gain: 0.08}, {at: p.b - 4, kind: 'shutter', gain: 0.08}]; });

/* 3 source: the chain of reprints back to an original nobody found — uncertainty drawn as a dashed box */
const sourcePlan = (cue: Cue) => ({a: cue('a', 42)});
const Source = make(({f, cue}) => {
  const p = sourcePlan(cue);
  const box = (label: string, sub: string, dashed: boolean, at: number, y: number, hot = false) => <Cut f={f} at={at} style={{left: M + 60, top: y, width: W - 2 * M - 120}}>
    <div style={{border: `${dashed ? 4 : 1}px ${dashed ? 'dashed' : 'solid'} ${hot ? K.acc : K.line}`, background: dashed ? 'transparent' : K.panel, padding: '22px 28px'}}>
      <div style={{fontFamily: font, fontWeight: 900, fontSize: 50, color: hot ? K.acc : K.ink}}>{label}</div>
      <div style={{fontFamily: plex, fontSize: 28, color: K.dim, marginTop: 6}}>{sub}</div>
    </div>
  </Cut>;
  return <Stage><div style={{position: 'absolute', inset: 0, transform: `scale(${1 + 0.06 * clamp(f / 87)})`, transformOrigin: '50% 40%'}}>
    <Heading>“顶 5 个”从哪来</Heading>
    {f >= p.a && <div style={{position: 'absolute', left: M + 60, top: 430, width: W - 2 * M - 120, height: 200, background: 'rgba(216,90,49,0.16)', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: 30, boxSizing: 'border-box', transform: `scale(${1.25 - 0.25 * ease.outCubic(clamp((f - p.a) / 5))}) rotate(-4deg)`}}>
      <div style={{fontFamily: font, fontWeight: 900, fontSize: 100, color: K.acc, border: `8px solid ${K.acc}`, padding: '0 28px', lineHeight: 1.25}}>未找到</div>
    </div>}
    {box('澎湃号 · 河南经济报', '转载 · 10-30 · 写“据台州晚报消息”', false, 0, 980)}
    {box('凤凰网大风号', '标“来源：都市现场、台州晚报”', false, 6, 720)}
    {box('台州晚报 原文', p.a <= f ? '未找到' : '……', true, 14, 460, f >= p.a)}
    {/* the search: a loupe sweeps the empty box until the verdict lands */}
    {f >= 16 && f < p.a + 4 && (() => { const t = (f - 16) / 12; const x = M + 140 + (Math.sin(t) * 0.5 + 0.5) * (W - 2 * M - 360), y = 520 + Math.cos(t * 1.3) * 26; return <svg style={{position: 'absolute', left: 0, top: 0}} width={W} height={1400}>
      <circle cx={x} cy={y} r={58} fill="rgba(216,90,49,0.08)" stroke={K.acc} strokeWidth={6} /><line x1={x + 42} y1={y + 42} x2={x + 92} y2={y + 92} stroke={K.acc} strokeWidth={12} strokeLinecap="round" />
    </svg>; })()}
    {f >= 20 && <div style={{position: 'absolute', left: M + 60, top: 1220, fontFamily: plex, fontSize: 30, color: K.dim}}>{f < p.a ? '检索中' + '·'.repeat(1 + Math.floor((f - 20) / 6) % 3) : '两处转载都指向台州晚报'}</div>}
    <svg style={{position: 'absolute', left: 0, top: 0}} width={W} height={1400}>
      {[[980, 900], [720, 640]].map(([a, b], i) => f >= 6 + i * 8 && <g key={i}><line x1={W / 2} y1={a} x2={W / 2} y2={b} stroke={K.tick} strokeWidth={3} /><path d={`M${W / 2 - 12},${b + 14} L${W / 2},${b} L${W / 2 + 12},${b + 14}`} fill="none" stroke={K.tick} strokeWidth={3} /></g>)}
    </svg>
  </div></Stage>;
}, (cue) => { const p = sourcePlan(cue); return [{at: 0, kind: 'paper', gain: 0.06}, {at: 6, kind: 'paper', gain: 0.06}, {at: 14, kind: 'paper', gain: 0.06}, {at: p.a, kind: 'stamp', gain: 0.1}]; });

/* 4 work: what it actually does — walks the estate all day; at night it sees heat (the only colour in the film) */
const workPlan = (cue: Cue) => ({a: cue('a', 46), b: cue('b', 97)});
const Work = make(({f, cue}) => {
  const p = workPlan(cue);
  const thermal = f >= p.b;
  return <Stage>
    <Heading>它真正干的活</Heading>
    <div style={{position: 'absolute', left: M, top: 270}}><Tag color={thermal ? K.acc : K.dim}>{thermal ? '资料画面 · 南京教科频道 2025 · 热成像' : f >= p.a - 10 ? '资料画面 · 南京教科频道 2025' : '照片 · 厂商官网'}</Tag></div>
    {f < p.a - 10 ? <Photo f={f} src={A('ruihua2.png')} y={318} h={880} push={0.06} />
      : !thermal ? <Photo f={f - p.a + 10} src={A('night.mp4')} video y={318} h={880} push={0.04} />
      : <Photo f={f - p.b} src={A('thermal.mp4')} video color y={318} h={880} push={0.03}>
        <Circle f={f - p.b} at={40} cx={237} cy={508} r={100} />
        {f - p.b >= 52 && <div style={{position: 'absolute', left: 360, top: 470, background: 'rgba(11,12,14,0.85)', padding: '8px 18px', fontFamily: font, fontWeight: 800, fontSize: 44, color: K.acc}}>热源</div>}
      </Photo>}
    {f >= p.a && <div style={{position: 'absolute', left: M, top: 1230, display: 'flex', alignItems: 'baseline', gap: 16}}>
      <span style={{fontFamily: inter, fontWeight: 600, fontSize: 110, color: K.ink, lineHeight: 1}}>24</span>
      <span style={{fontFamily: font, fontWeight: 800, fontSize: 46, color: K.dim}}>小时 · 不间断巡逻（报道 / 厂商）</span>
    </div>}
  </Stage>;
}, (cue) => { const p = workPlan(cue); return [{at: 0, kind: 'shutter', gain: 0.06}, {at: p.a - 10, kind: 'whoosh-short', gain: 0.05}, {at: p.b, kind: 'shutter', gain: 0.08}, {at: p.b + 40, kind: 'marker', gain: 0.08}]; });

/* 5 park: a car in a no-parking zone, circled; the alert typeset as it reaches the property's back office */
const parkPlan = (cue: Cue) => ({a: cue('a', 41)});
const Park = make(({f, cue}) => {
  const p = parkPlan(cue);
  return <Stage>
    <Heading>发现 → 推送</Heading>
    <div style={{position: 'absolute', left: M, top: 270}}><Tag>厂商宣传图 · 万为（含后期特效，车牌已打码）</Tag></div>
    <Photo f={f} src={A('park.jpg')} y={318} h={620} push={0.05}>
      <Circle f={f} at={8} cx={600} cy={330} r={150} />
    </Photo>
    <Cut f={f} at={p.a} style={{left: M + 80, top: 990, width: W - 2 * M - 160}}>
      <Tag>推送内容 · 据万为官网（转录）</Tag>
      <div style={{background: K.paper, color: K.paperInk, padding: '22px 28px', fontFamily: font, fontWeight: 800, fontSize: 42, lineHeight: 1.45, borderLeft: `8px solid ${K.acc}`}}>
        违停 · 禁停区<br /><span style={{fontFamily: plex, fontWeight: 500, fontSize: 32}}>照片 / 车牌号 / 时间 / 位置 → 物业中控平台</span>
      </div>
    </Cut>
  </Stage>;
}, (cue) => { const p = parkPlan(cue); return [{at: 0, kind: 'shutter', gain: 0.07}, {at: 8, kind: 'marker', gain: 0.07}, {at: p.a, kind: 'paper', gain: 0.08}]; });

/* 6 quote (climax): the property manager's own words; two night-shift dots become one person at a screen + the robot */
const quotePlan = (cue: Cue) => ({a: cue('a', 53), b: cue('b', 96), c: cue('c', 134)});
const Quote = make(({f, cue}) => {
  const p = quotePlan(cue);
  const Q = '以前安保晚班必须配两个人，如今夜里有机器人“巡逻”，安防监控员只需盯着屏幕就行，遇有异常情况再出去处理。';
  const two = f < p.b;
  const out = ease.inOutCubic(clamp((f - p.c - 6) / 18));
  return <Stage>
    <div style={{position: 'absolute', left: M, top: 130, width: W - 2 * M}}>
      <Tag>扬州网 · 2026-01-13 · 小区物业负责人（转录）</Tag>
      <Paper f={f} text={Q} size={48} marks={[[0, 12, p.a], [26, 39, p.b], [40, 51, p.c]]} />
    </div>
    {/* the night shift, drawn: dots for people */}
    <div style={{position: 'absolute', left: M, top: 760, width: W - 2 * M, height: 480, border: `1px solid ${K.line}`, background: K.panel}}>
      <div style={{position: 'absolute', left: 30, top: 24}}><Tag>晚班 · 示意</Tag></div>
      {two ? <div style={{position: 'absolute', left: 120, top: 150, display: 'flex', gap: 120, opacity: f >= p.a ? 1 : 0.35}}>
        {[0, 1].map((i) => <div key={i} style={{textAlign: 'center'}}><div style={{width: 120, height: 120, borderRadius: '50%', background: K.ink, margin: '0 auto'}} /><div style={{fontFamily: font, fontWeight: 800, fontSize: 40, color: K.ink, marginTop: 16}}>保安</div></div>)}
      </div> : <>
        {/* one person at a screen, who goes out on an alarm */}
        <div style={{position: 'absolute', left: 120 + out * 470, top: 150, textAlign: 'center'}}>
          <div style={{width: 120, height: 120, borderRadius: '50%', background: K.ink, margin: '0 auto'}} />
          <div style={{fontFamily: font, fontWeight: 800, fontSize: 40, color: K.ink, marginTop: 16, whiteSpace: 'nowrap'}}>{out > 0.5 ? '出去处理' : '盯屏幕'}</div>
        </div>
        <div style={{position: 'absolute', left: 640, top: 150, textAlign: 'center', opacity: out > 0.6 ? 0 : 1}}>
          <div style={{width: 120, height: 120, borderRadius: 26, border: `6px solid ${K.acc}`, boxSizing: 'border-box', margin: '0 auto', position: 'relative'}}>
            <div style={{position: 'absolute', left: 30, top: 34, width: 48, height: 22, borderRadius: 11, background: K.acc}} />
          </div>
          <div style={{fontFamily: font, fontWeight: 800, fontSize: 40, color: K.acc, marginTop: 16}}>机器人巡</div>
        </div>
        {f >= p.c && out < 0.6 && <div style={{position: 'absolute', left: 300, top: 170, fontFamily: font, fontWeight: 900, fontSize: 64, color: K.acc}}>⚠ 异常</div>}
      </>}
    </div>
  </Stage>;
}, (cue) => { const p = quotePlan(cue); return [{at: 0, kind: 'paper', gain: 0.08}, {at: p.a, kind: 'marker', gain: 0.07}, {at: p.b, kind: 'shutter', gain: 0.08}, {at: p.c, kind: 'chime', gain: 0.1}]; });

/* 7 end: known / unresolved — the board the investigation ends on */
const endPlan = (cue: Cue) => ({a: cue('a', 36)});
const End = make(({f, cue}) => {
  const p = endPlan(cue);
  const item = (t: string, i: number, known: boolean) => <Cut key={t} f={f} at={known ? 4 + i * 4 : p.a + i * 4} style={{position: 'relative'}}>
    <div style={{display: 'flex', alignItems: 'center', gap: 22, marginBottom: 34}}>
      <div style={{width: 60, height: 60, boxSizing: 'border-box', border: known ? 'none' : `3px dashed ${K.dim}`, background: known ? K.acc : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 34, fontWeight: 900}}>{known ? '✓' : ''}</div>
      <span style={{fontFamily: font, fontWeight: 800, fontSize: 56, color: known ? K.ink : K.dim}}>{t}</span>
    </div>
  </Cut>;
  return <Stage>
    <Heading>机器发现 → 人处理</Heading>
    <div style={{position: 'absolute', left: M, top: 290, width: W - 2 * M}}>
      <Tag>已知</Tag>
      {['24 小时绕着走', '夜里看热源', '违停拍照推后台'].map((t, i) => item(t, i, true))}
    </div>
    <div style={{position: 'absolute', left: M, top: 720, width: W - 2 * M}}>
      <Tag>没定论</Tag>
      {['到底顶几个人', '维修、故障要多久', '最早的报道原文'].map((t, i) => item(t, i, false))}
    </div>
  </Stage>;
}, (cue) => { const p = endPlan(cue); return [{at: 4, kind: 'tick', gain: 0.07}, {at: 8, kind: 'tick', gain: 0.07}, {at: 12, kind: 'tick', gain: 0.07}, {at: p.a, kind: 'tick', gain: 0.06}]; });

/** Cover anchor (880 × 800): the claim card over the robot photo. */
const Cover: Scene = () => <div style={{position: 'absolute', left: 0, top: 0, width: 880, height: 800, overflow: 'hidden', background: K.ground}}>
  <Img src={A('ruihua.png')} style={{position: 'absolute', left: -120, top: 0, width: 1120, height: 800, objectFit: 'cover', filter: GRADE}} />
</div>;

export const patrolRobotScenes: Record<string, Scene> = {
  'pr.hook': Hook, 'pr.vendor': Vendor, 'pr.source': Source, 'pr.work': Work, 'pr.park': Park, 'pr.quote': Quote, 'pr.end': End, 'pr.cover': Cover,
};
