import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {cinema} from '../theme';
import {beatZoom, clamp, ease} from '../../fx';
import {Cue, Scene} from '../paper';
import {Abs, Cmd, DIM, FAINT, GOLD, HAIR, Headline, INK, Marker, Pool, RED, Reveal, Root, Surface, Terminal, display, font, rise} from '../cinema';

// vibe-knowledge-douyin: how the "Vibe知识大赏" knowledge videos are made — not another knowledge point, the code pipeline:
// benchmark first, extract the visual parameters, render a 15 s sample before the full film (≈ 38 s). Script:
// inputs/vibe-knowledge-douyin/script.md, narration verbatim; facts per its sources.md — the follower number is 「据观默称」
// (said on screen and in the credit line), the toolchain is Canvas / Playwright / ffmpeg, the model is only "a strong model".
// The topic-page screenshot is the planner's sanitized crop with the remaining like counts blurred, labelled
// 「@观默｜案例展示」; everything else is drawn. huashu-motion: a small "vibe card" (a dark 9:16 frame with a glowing curve on
// the beat) is the object carried through the film — the thing the code draws, the benchmark, the source of the parameters,
// the 15 s sample, the one film about one point. Cinema look, background D.

const R = 13;
const IMG = (n: string) => staticFile(`images/tutorials/vibe-knowledge-douyin/${n}`);
const BEAT = 15; // frames per beat for the drawn pulse (120 BPM)

const Stage: React.FC<{f: number; dur: number; beats: number[]; children: React.ReactNode}> = ({f, dur, beats, children}) => {
  const z = beatZoom(f / 30, beats.map((b) => b / 30), {amp: 0.05, drift: 12, d: 0.6});
  return <Root f={f} dur={dur}>
    <div style={{position: 'absolute', inset: 0, transformOrigin: '50% 40%', transform: `translate(${z.dx.toFixed(2)}px, ${z.dy.toFixed(2)}px) scale(${z.s.toFixed(4)})`}}>{children}</div>
  </Root>;
};
const gold = (s: string) => <span style={{color: GOLD}}>{s}</span>;
const Big: React.FC<{size?: number; c?: string; w?: number; style?: React.CSSProperties; children: React.ReactNode}> = ({size = 64, c = INK, w = 900, style, children}) => (
  <div style={{fontFamily: display, fontWeight: w, fontSize: size, lineHeight: 1.18, color: c, whiteSpace: 'nowrap', ...style}}>{children}</div>
);
const Small: React.FC<{c?: string; size?: number; style?: React.CSSProperties; children: React.ReactNode}> = ({c = DIM, size = 40, style, children}) => (
  <Big size={size} c={c} w={700} style={{fontFamily: font, letterSpacing: 2, ...style}}>{children}</Big>
);
/** 0..1 pulse on every beat (sharp attack, soft decay); `on` gates it. */
const pulse = (f: number, on = 1) => on * Math.exp(-((f % BEAT) / 5));

/* ---------- the carried object: a "vibe card" ---------- */

/** A dark 9:16 frame with a glowing gold curve and a dot riding it; `beat` 0..1 brightens it on the beat. */
const VibeCard: React.FC<{f: number; w?: number; beat?: number; blur?: number; label?: string; style?: React.CSSProperties}> = ({f, w = 300, beat = 0, blur = 0, label, style}) => {
  const h = w * 16 / 9;
  const pts = Array.from({length: 41}, (_, i) => {
    const x = (i / 40) * 100, y = 58 - Math.sin(i / 40 * Math.PI * 2 + f / 18) * 14 * (1 + 0.35 * beat);
    return `${x.toFixed(2)},${y.toFixed(2)}`;
  }).join(' ');
  const dx = ((f * 0.9) % 100), dy = 58 - Math.sin(dx / 100 * Math.PI * 2 + f / 18) * 14 * (1 + 0.35 * beat);
  return <div style={{position: 'relative', width: w, height: h, borderRadius: w * 0.07, overflow: 'hidden', flex: 'none',
    background: 'radial-gradient(circle at 50% 55%, #1b2133 0%, #090c14 70%)', border: `2px solid rgba(255,197,61,${0.25 + 0.5 * beat})`,
    boxShadow: `0 24px 60px rgba(0,0,0,0.55), 0 0 ${40 * beat}px rgba(255,197,61,${0.35 * beat})`, filter: blur ? `blur(${blur}px)` : undefined, ...style}}>
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{position: 'absolute', left: 0, top: 0, width: '100%', height: '100%'}}>
      {[20, 40, 60, 80].map((y) => <line key={y} x1={0} x2={100} y1={y} y2={y} stroke="rgba(255,255,255,0.05)" strokeWidth={0.3} />)}
      <polyline points={pts} fill="none" stroke={GOLD} strokeWidth={1.4} opacity={0.35} style={{filter: 'blur(1.2px)'}} />
      <polyline points={pts} fill="none" stroke={GOLD} strokeWidth={0.6} />
      <ellipse cx={dx} cy={dy} rx={1.6} ry={0.9} fill="#fff" />
    </svg>
    {label && <div style={{position: 'absolute', left: 0, right: 0, top: '16%', textAlign: 'center', fontFamily: display, fontWeight: 900,
      fontSize: w * 0.15, color: INK, textShadow: '0 4px 20px rgba(0,0,0,0.6)'}}>{label}</div>}
  </div>;
};

/* ---------- 1 hook: "near 800k in 20 days", as claimed ---------- */

const hookPlan = (cue: Cue) => ({a: cue('a', 71), b: cue('b', 95)});
const Hook: Scene = ({f, dur, cue}) => {
  const p = hookPlan(cue);
  const n = Math.round(80 * ease.outCubic(clamp((f + 14) / 22))); // 「近八十万」, as claimed; lands by frame 8
  return <Stage f={f} dur={dur} beats={[p.a, p.b]}>
    <Pool x={450} y={760} o={0.14} />
    <Abs y={0}><Reveal f={f} at={-14} d={R} dy={14}><Small>据称 · 20 天涨粉</Small></Reveal></Abs>
    <Abs y={60} style={{display: 'flex', alignItems: 'baseline', gap: 6}}>
      <Reveal f={f} at={-16} d={R}><Big size={110} w={800} c={DIM} style={{letterSpacing: -2}}>近</Big></Reveal>
      <Reveal f={f} at={-16} d={R}><Big size={230} w={800} c={GOLD} style={{letterSpacing: -8, lineHeight: 1, transform: `scale(${1 + 0.06 * Math.sin(Math.PI * clamp((f - p.b + 2) / 12))})`, transformOrigin: '0 70%'}}>{n}万</Big></Reveal>
      <Reveal f={f} at={-12} d={R}><Big size={110} w={800} style={{letterSpacing: -2}}>粉</Big></Reveal>
    </Abs>
    <Abs y={330}><Reveal f={f} at={-8} d={R} dy={12}><Big size={56} w={800}>靠「{gold('Vibe 知识大赏')}」</Big></Reveal></Abs>
    {/* three vibe cards fan in, pulsing on the beat */}
    <Abs y={470} h={600}>
      {[-1, 0, 1].map((k, i) => {
        const inn = rise(f, -10 + i * 4, 16);
        return <div key={k} style={{position: 'absolute', left: 450 - 135 + k * 230, top: 30 + Math.abs(k) * 40, opacity: clamp(inn * 1.4),
          transform: `translateY(${(1 - inn) * 80}px) rotate(${k * 8}deg)`, zIndex: k === 0 ? 2 : 1}}>
          <VibeCard f={f + i * 20} w={270} beat={pulse(f + i * 3, k === 0 ? 1 : 0.5)} />
        </div>;
      })}
    </Abs>
  </Stage>;
};
Hook.backdrop = () => <AbsoluteFill style={{background: cinema.bg}}>
  <Img src={IMG('topic-grid-blur.jpg')} style={{position: 'absolute', left: 0, top: 380, width: 1080, filter: 'brightness(0.32) saturate(0.7)'}} />
  <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(7,11,20,0.95) 0%, rgba(7,11,20,0.5) 35%, rgba(7,11,20,0.6) 65%, rgba(7,11,20,0.95) 100%)'}} />
</AbsoluteFill>;
Hook.sfx = (cue) => [{at: 0, kind: 'whoosh-short', gain: 0.1}, {at: 8, kind: 'tap', gain: 0.12}, {at: hookPlan(cue).b, kind: 'tick', gain: 0.08}];

/* ---------- 2 not the knowledge point: the picture is written in code and moves on the beat ---------- */

const codePlan = (cue: Cue) => ({a: cue('a', 68), b: cue('b', 94), c: cue('c', 149)});
const CODE = ['y = sin(t) * A', 'ctx.lineTo(x, y)', 'glow(gold, beat)'];
const Code: Scene = ({f, dur, cue}) => {
  const p = codePlan(cue);
  const flip = rise(f, p.b - 4, 14), beatOn = rise(f, p.c - 2, 8);
  return <Stage f={f} dur={dur} beats={[p.b, p.c]}>
    <Pool x={700} y={560} o={0.12 + 0.1 * beatOn} />
    <Abs y={0} style={{opacity: 1 - flip}}><Headline f={f} at={-10} lines={['先别急着', <span key="2">学{gold('知识点')}</span>]} size={110} /></Abs>
    <Abs y={0} style={{opacity: flip}}><Headline f={f} at={p.b - 18} lines={['画面是', <span key="2">代码{gold('写出来的')}</span>]} size={110} /></Abs>
    <Abs x={0} y={300} w={540}><Reveal f={f} at={4} d={R}>
      <Terminal size={36} style={{minHeight: 230}}>{CODE.map((l, i) => (i === 0 || f >= p.a + i * 14 - 2) && <Cmd key={l} f={f} at={p.a + i * 14} text={l} cps={1.4} />)}</Terminal>
    </Reveal></Abs>
    <Abs x={580} y={290} w={320}><Reveal f={f} at={10} d={R}><VibeCard f={f} w={320} beat={pulse(f, beatOn)} /></Reveal></Abs>
    {/* the beat: eight dots, the current one lit */}
    <Abs y={890} style={{display: 'flex', justifyContent: 'center', gap: 26, opacity: beatOn}}>
      {Array.from({length: 8}, (_, i) => {
        const cur = Math.floor((f - p.c) / BEAT) % 8 === i && f >= p.c;
        return <div key={i} style={{width: 46, height: 46, borderRadius: 23, background: cur ? GOLD : 'rgba(255,255,255,0.14)', boxShadow: cur ? `0 0 24px ${GOLD}` : 'none'}} />;
      })}
    </Abs>
    <Abs y={960} style={{textAlign: 'center', opacity: beatOn}}><Small c={DIM}>跟着节拍动</Small></Abs>
  </Stage>;
};
Code.sfx = (cue, dur) => {
  const p = codePlan(cue);
  const beats = [];
  for (let t = p.c; t < dur - 4; t += BEAT) beats.push({at: t, kind: 'tick', gain: 0.07});
  return [{at: p.a, kind: 'tap', gain: 0.08}, {at: p.b, kind: 'whoosh-short', gain: 0.08}, ...beats];
};

/* ---------- 3 one: benchmark first ---------- */

const benchPlan = (cue: Cue) => ({a: cue('a', 55), b: cue('b', 126)});
// the picked card in the cropped screenshot (610 × 660 px): the bottom-right one, tagged #vibe知识大赏#
const PICK = {x: 365, y: 405, w: 245, h: 255};
const Bench: Scene = ({f, dur, cue}) => {
  const p = benchPlan(cue);
  const W = 640, k = W / 610, pick = rise(f, p.b - 6, 16);
  return <Stage f={f} dur={dur} beats={[p.a, p.b]}>
    <Pool x={450} y={600} o={0.12} />
    <Abs y={0}><Headline f={f} at={-12} no={1} total={3} lines={['先对标']} size={104} /></Abs>
    <Abs x={0} y={290} w={260}><Reveal f={f} at={-4} d={R} dy={14}>
      <Small c={DIM}>先别开写</Small>
      <Big size={48} w={800} style={{marginTop: 10, lineHeight: 1.35}}>去话题页<br />找{gold('涨得猛')}的</Big>
      <div style={{opacity: pick, marginTop: 40}}><Big size={48} w={800} style={{lineHeight: 1.35}}>看它画面<br />{gold('怎么动')}</Big></div>
    </Reveal></Abs>
    <Abs x={280} y={280} w={W}><Reveal f={f} at={p.a - 8} d={R} dy={40}>
      <div style={{position: 'relative', width: W, height: 660 * k, borderRadius: 20, overflow: 'hidden', boxShadow: '0 30px 80px rgba(0,0,0,0.55)'}}>
        <Img src={IMG('topic-grid.jpg')} style={{width: W, display: 'block'}} />
        {/* dim everything but the picked card */}
        <div style={{position: 'absolute', left: PICK.x * k, top: PICK.y * k, width: PICK.w * k, height: PICK.h * k, borderRadius: 10,
          boxShadow: `0 0 0 2000px rgba(7,11,20,${0.72 * pick})`, outline: pick > 0.3 ? `4px solid ${GOLD}` : 'none'}} />
      </div>
      <Small c={DIM} style={{textAlign: 'right', marginTop: 12}}>@观默｜案例展示</Small>
    </Reveal></Abs>
  </Stage>;
};
Bench.sfx = (cue) => {
  const p = benchPlan(cue);
  return [{at: 0, kind: 'tick', gain: 0.08}, {at: p.a - 4, kind: 'whoosh-short', gain: 0.08}, {at: p.b, kind: 'tap', gain: 0.12}];
};

/* ---------- 4 two: extract the visual parameters, or it turns into an old PPT ---------- */

const paramPlan = (cue: Cue) => ({a: cue('a', 62), b: cue('b', 79), c: cue('c', 96), d: cue('d', 117), e: cue('e', 139)});
const Params: Scene = ({f, dur, cue}) => {
  const p = paramPlan(cue);
  const rows = [
    {t: '配色', at: p.a, body: <div style={{display: 'flex', gap: 14}}>{['#090c14', GOLD, '#e8e2d0', '#3a4560'].map((c) => <div key={c} style={{width: 64, height: 64, borderRadius: 12, background: c, border: `2px solid ${HAIR}`}} />)}</div>},
    {t: '字号', at: p.b, body: <div style={{display: 'flex', alignItems: 'baseline', gap: 18}}>{[96, 64, 40].map((s) => <Big key={s} size={s} w={800}>Aa</Big>)}</div>},
    {t: '明暗', at: p.c, body: <div style={{position: 'relative', width: 300, height: 28, borderRadius: 14, background: 'linear-gradient(90deg, #05070c, #fff)'}}>
      <div style={{position: 'absolute', top: -10, left: 60 + 40 * Math.sin(f / 20), width: 48, height: 48, borderRadius: 24, background: GOLD, boxShadow: '0 4px 16px rgba(0,0,0,0.5)'}} /></div>},
  ];
  const skip = rise(f, p.d - 4, R), cross = rise(f, p.e, 12);
  return <Stage f={f} dur={dur} beats={[p.a, p.b, p.c, p.e]}>
    <Pool x={450} y={560} o={0.12} />
    <Abs y={0}><Headline f={f} at={-12} no={2} total={3} lines={['先抽参数']} size={104} /></Abs>
    {/* the benchmark frame, blurred: the parameters peel off it */}
    <Abs x={0} y={290} w={290}><Reveal f={f} at={-4} d={R}><VibeCard f={f} w={280} blur={2.5 * (1 - skip * 0.5)} beat={0.2} /></Reveal></Abs>
    <Abs x={310} y={290} w={590} style={{display: 'flex', flexDirection: 'column', gap: 14}}>
      {rows.map((r) => <Reveal key={r.t} f={f} at={r.at - 6} d={R} dy={0} style={{transform: `translateX(${(1 - rise(f, r.at - 6, R)) * -200}px)`}}>
        <Surface accent={GOLD} pad="0 28px" style={{height: 150, display: 'flex', alignItems: 'center', gap: 26}}>
          <Big size={52} w={800} style={{width: 110}}>{r.t}</Big>{r.body}
        </Surface>
      </Reveal>)}
    </Abs>
    {/* skipping it: a generic old-PPT slide, crossed out */}
    <Abs y={830} style={{display: 'flex', alignItems: 'center', gap: 30, opacity: skip}}>
      <div style={{position: 'relative', width: 260, height: 160, borderRadius: 10, background: '#f2f2f2', padding: '18px 20px', boxSizing: 'border-box', flex: 'none'}}>
        <div style={{height: 22, width: '70%', background: '#2f5597', borderRadius: 4, marginBottom: 14}} />
        {[0.9, 0.75, 0.82].map((w, i) => <div key={i} style={{display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10}}>
          <div style={{width: 10, height: 10, borderRadius: 5, background: '#555'}} /><div style={{height: 10, width: `${w * 80}%`, background: '#999', borderRadius: 3}} /></div>)}
        <svg width={260} height={160} viewBox="0 0 260 160" style={{position: 'absolute', left: 0, top: 0}}>
          <path d="M30 20 L230 140 M230 20 L30 140" stroke={RED} strokeWidth={14} strokeLinecap="round" strokeDasharray={240} strokeDashoffset={240 * (1 - cross)} />
        </svg>
      </div>
      <div><Small c={DIM}>跳过这步</Small><Big size={60} w={800} style={{marginTop: 6}}>易写成{gold('旧PPT')}</Big></div>
    </Abs>
  </Stage>;
};
Params.sfx = (cue) => {
  const p = paramPlan(cue);
  return [{at: p.a, kind: 'tick', gain: 0.08}, {at: p.b, kind: 'tick', gain: 0.08}, {at: p.c, kind: 'tick', gain: 0.08}, {at: p.e, kind: 'block', gain: 0.1}];
};

/* ---------- 5 three: a strong model, Canvas → Playwright → ffmpeg, a 15 s sample before the full film ---------- */

const pipePlan = (cue: Cue) => ({a: cue('a', 58), b: cue('b', 84), c: cue('c', 104), d: cue('d', 151), e: cue('e', 193), f: cue('f', 219)});
const Pipe: Scene = ({f, dur, cue}) => {
  const p = pipePlan(cue);
  const nodes = [{t: 'Canvas', s: '画', at: p.a}, {t: 'Playwright', s: '逐帧截', at: p.b}, {t: 'ffmpeg', s: '合成', at: p.c}];
  const head = clamp((f - p.d) / (p.e - p.d - 4)), full = ease.inOutCubic(clamp((f - p.e) / 18));
  const TRACK = 820, SAMPLE = 0.25; // 15 s of a ~60 s film
  const pos = head < 1 ? head * SAMPLE : SAMPLE + full * (1 - SAMPLE);
  return <Stage f={f} dur={dur} beats={[p.a, p.d, p.e, p.f]}>
    <Pool x={450} y={560} o={0.12} />
    <Abs y={0}><Headline f={f} at={-12} no={3} total={3} lines={[<span key="l">样片 → {gold('全片')}</span>]} size={100} /></Abs>
    <Abs y={290}><Reveal f={f} at={0} d={R} dy={12}><Small c={DIM}>交给强模型（如 Claude Opus 一类）</Small></Reveal></Abs>
    <Abs y={370} style={{display: 'flex', alignItems: 'center', gap: 14}}>
      {nodes.map((n, i) => {
        const on = rise(f, n.at - 2, 10);
        return <React.Fragment key={n.t}>
          {i > 0 && <Big size={44} w={800} c={on > 0.5 ? GOLD : FAINT}>→</Big>}
          <div style={{flex: 1, opacity: 0.35 + 0.65 * on}}>
            <Surface accent={on > 0.5 ? GOLD : undefined} pad="0" style={{height: 160, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
              <Big size={44} w={800}>{n.t}</Big>
              <Small c={DIM} style={{marginTop: 8}}>{n.s}</Small>
            </Surface>
          </div>
        </React.Fragment>;
      })}
    </Abs>
    {/* the timeline: the playhead stops at the 15 s sample, then runs to the full film */}
    <Abs y={590}><Reveal f={f} at={p.d - 6} d={R}>
      <Surface pad="30px 40px">
        <div style={{position: 'relative', width: TRACK, height: 70}}>
          <div style={{position: 'absolute', left: 0, right: 0, top: 26, height: 18, borderRadius: 9, background: 'rgba(255,255,255,0.08)'}} />
          <div style={{position: 'absolute', left: 0, top: 26, height: 18, width: TRACK * pos, borderRadius: 9, background: GOLD}} />
          <div style={{position: 'absolute', left: TRACK * SAMPLE - 2, top: 10, width: 4, height: 50, background: INK, opacity: 0.8}} />
          <div style={{position: 'absolute', left: TRACK * pos - 14, top: 21, width: 28, height: 28, borderRadius: 14, background: INK, boxShadow: '0 0 18px rgba(255,255,255,0.6)'}} />
        </div>
        <div style={{display: 'flex', justifyContent: 'space-between', marginTop: 8}}>
          <Big size={48} w={800} c={head >= 1 ? GOLD : INK}>15 秒样片 {head >= 1 ? '✓' : ''}</Big>
          <Big size={48} w={800} c={full > 0.9 ? GOLD : FAINT}>全片</Big>
        </div>
      </Surface>
    </Reveal></Abs>
    <Abs y={850} style={{display: 'flex', alignItems: 'center', gap: 30}}>
      <Reveal f={f} at={p.d} d={R}><VibeCard f={f} w={120} beat={pulse(f, 0.6)} /></Reveal>
      <Reveal f={f} at={p.f - 4} d={R}><Big size={72} w={900}><Marker p={rise(f, p.f + 4, 14)}>样片拦返工</Marker></Big></Reveal>
    </Abs>
  </Stage>;
};
Pipe.sfx = (cue) => {
  const p = pipePlan(cue);
  return [{at: p.a, kind: 'tick', gain: 0.08}, {at: p.b, kind: 'tick', gain: 0.08}, {at: p.c, kind: 'tick', gain: 0.08},
    {at: p.e - 4, kind: 'chime', gain: 0.1}, {at: p.f, kind: 'tap', gain: 0.1}];
};

/* ---------- 6 end: one film, one point ---------- */

const endPlan = (cue: Cue) => ({a: cue('a', 38), b: cue('b', 84)});
const End: Scene = ({f, dur, cue}) => {
  const p = endPlan(cue);
  // five cards drift apart (a prompt that wanders), collapse into one on 「只讲透一个知识点」, and brackets close on 「约束」
  const one = ease.inOutCubic(clamp((f - p.a + 4) / 20)), hold = ease.outCubic(clamp((f - p.b + 2) / 14));
  const spread = [[-300, 40, -12], [-150, -10, -6], [0, 0, 0], [150, -10, 6], [300, 40, 12]];
  return <Stage f={f} dur={dur} beats={[p.a, p.b]}>
    <Pool x={450} y={640} o={0.14 + 0.1 * one} />
    <Abs y={0} style={{textAlign: 'center'}}><Headline f={f} at={-12} lines={['一支片子', <span key="2" style={{opacity: rise(f, p.a - 6, R)}}>只讲{gold('一个知识点')}</span>]} size={112} align="center" /></Abs>
    <Abs y={320} h={600}>
      {spread.map(([x, y, r], i) => {
        const drift = 1 + 0.15 * clamp(f / 30);
        const k = i === 2 ? 1 : 1 - one;
        return <div key={i} style={{position: 'absolute', left: 450 - 160 + x * drift * (1 - one), top: y * (1 - one), opacity: (i === 2 ? 1 : 0.55) * k * rise(f, -6 + i * 2, R),
          transform: `rotate(${r * (1 - one)}deg) scale(${i === 2 ? 1 : 0.85})`, zIndex: i === 2 ? 2 : 1}}>
          <VibeCard f={f + i * 17} w={320} beat={i === 2 ? pulse(f, 0.7) : 0.1} />
        </div>;
      })}
      {/* the constraint: two gold brackets close in around the one card */}
      {hold > 0 && [-1, 1].map((sd) => <div key={sd} style={{position: 'absolute', top: -20, height: 609, width: 46, left: 450 + sd * (200 + 160 * (1 - hold)) - 23,
        border: `8px solid ${GOLD}`, borderLeft: sd < 0 ? `8px solid ${GOLD}` : 'none', borderRight: sd > 0 ? `8px solid ${GOLD}` : 'none', borderRadius: 14,
        opacity: hold, boxSizing: 'border-box'}} />)}
    </Abs>
    <Abs y={960} style={{textAlign: 'center'}}><Reveal f={f} at={p.b - 4} d={R} dy={12}><Small c={DIM} size={44}>约束提示词，不发散</Small></Reveal></Abs>
  </Stage>;
};
End.sfx = (cue) => [{at: endPlan(cue).a, kind: 'whoosh-short', gain: 0.08}, {at: endPlan(cue).b, kind: 'chime', gain: 0.08}];

/* ---------- cover anchor (880 × 800): the pipeline into one glowing card ---------- */

const Cover: Scene = ({f}) => <div style={{position: 'relative', width: 880, height: 800}}>
  <Pool x={440} y={420} o={0.24} />
  <Abs x={300} y={60} w={280}><VibeCard f={f + 40} w={280} beat={0.8} /></Abs>
  <Abs x={0} y={600} w={880} style={{display: 'flex', justifyContent: 'center', gap: 18}}>
    {['Canvas', 'Playwright', 'ffmpeg'].map((t, i) => <React.Fragment key={t}>
      {i > 0 && <Big size={44} w={800} c={GOLD}>→</Big>}
      <Surface pad="14px 22px"><Big size={42} w={800}>{t}</Big></Surface>
    </React.Fragment>)}
  </Abs>
</div>;

export const vibeKnowledgeDouyinScenes: Record<string, Scene> = {
  'vkd.hook': Hook,
  'vkd.code': Code,
  'vkd.bench': Bench,
  'vkd.params': Params,
  'vkd.pipe': Pipe,
  'vkd.end': End,
  'vkd.cover': Cover,
};
