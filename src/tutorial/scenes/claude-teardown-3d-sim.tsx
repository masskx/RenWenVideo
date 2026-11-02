import React from 'react';
import {Img, OffthreadVideo, staticFile} from 'remotion';
import {clamp, ease} from '../../fx';
import {font} from '../theme';
import {inter, jet} from '../fonts';
import {Cue, Scene} from '../paper';
import {W} from '../package';

// claude-teardown-3d-sim, made on the template lemo/teardown (docs/video-craft/prompt-library/vendor/lemomo-ai__lemo-
// opuscar/3961ddb/styles/teardown/STYLE.md): the subject is literally a teardown tool — Elvar's free, MIT-licensed Claude
// Code skill that turns a plain-words description into an offline HTML simulator of a machine you can take apart.
// Inputs: inputs/claude-teardown-3d-sim/ (materials.md, review.md — Eko approved with conditions, sources.md).
// - What the template gives: a dark graphite ground so the machine is the brightest thing; numbers live ON the object
//   (a dot on the part, a thin leader, a label plate: two-digit index in the one accent, the name, one mono spec line);
//   a dimension line drawn on the thing (native move "Dimensions drawn on the thing", here the landing gear's 201 mm rack);
//   the camera never stops travelling (every panel slowly pushes); a centred subtitle strip with a soft shadow, no box;
//   one accent reserved for measured things; dry mallet / tick sound.
// - Customised (模板改造): the object is the author's own real-time renders (muted footage, the machine viewport cropped
//   to fill 9:16), not our three.js PBR model; the accent is the V8 simulator's own red #D2142A; a header band carries the
//   film's information (hook title, quote strap); a quote strap 「转述 · 国外开发者 Elvar」 marks every first-person line
//   (borrowed from lemo/news-package's lower-third strap; review: first person is the author's, never ours); score is our
//   synthesized "wonder" with its climax on the dimension line.
// - Review conditions honoured: no URL, no @handle on screen (the case label reads 「Elvar｜案例展示」), no install steps,
//   author-reported numbers marked 「据作者」, platform counts dated, 31 s at 1.22×.

const K = {bg0: '#26282D', bg1: '#0E0F11', ink: '#F1EFE9', dim: 'rgba(241,239,233,0.62)', accent: '#D2142A', plate: 'rgba(14,15,17,0.86)'};
const V = (n: string) => staticFile(`video/claude-teardown-3d-sim/${n}.mp4`);
const PANEL_Y = 200, PANEL_H = 1216;

const Stage: React.FC<{children: React.ReactNode}> = ({children}) => <div style={{position: 'absolute', inset: 0, overflow: 'hidden',
  background: `radial-gradient(ellipse at 50% 40%, ${K.bg0} 0%, ${K.bg1} 78%)`}}>{children}</div>;

/** The footage panel: the machine viewport, muted, slowly pushing (template §6: the camera never stops). */
const Panel: React.FC<{f: number; src: string; from?: number; push?: number; origin?: string; children?: React.ReactNode}> = ({f, src, from = 0, push = 0.07, origin = '50% 45%', children}) => (
  <div style={{position: 'absolute', left: 0, top: PANEL_Y, width: W, height: PANEL_H, overflow: 'hidden'}}>
    <div style={{position: 'absolute', inset: 0, transform: `scale(${1 + push * clamp(f / 150)})`, transformOrigin: origin}}>
      <OffthreadVideo src={src} startFrom={Math.round(from * 30)} muted style={{width: '100%', height: '100%', objectFit: 'cover'}} />
    </div>
    {/* soft edge into the graphite so the panel sits in the stage, not on it */}
    <div style={{position: 'absolute', inset: 0, boxShadow: 'inset 0 0 90px 20px rgba(14,15,17,0.55)', pointerEvents: 'none'}} />
    <div style={{position: 'absolute', right: 150, bottom: 22, fontFamily: font, fontWeight: 700, fontSize: 26, color: '#fff', background: 'rgba(14,15,17,0.7)', padding: '4px 12px'}}>Elvar｜案例展示</div>
    {children}
  </div>
);

/** Template label: anchor dot → leader → plate (index in the accent, name, one mono spec line). Coordinates in the panel. */
const Label: React.FC<{f: number; at: number; dot: [number, number]; to: [number, number]; idx: string; name: string; spec?: string; out?: number}> = ({f, at, dot, to, idx, name, spec, out}) => {
  if (f < at || (out !== undefined && f > out + 6)) return null;
  const d = ease.outCubic(clamp((f - at) / 5)), l = ease.outCubic(clamp((f - at - 2) / 8)), t = ease.outCubic(clamp((f - at - 7) / 8));
  const o = out !== undefined ? 1 - clamp((f - out) / 6) : 1;
  const ex = dot[0] + (to[0] - dot[0]) * l, ey = dot[1] + (to[1] - dot[1]) * l;
  const left = to[0] < dot[0];
  return <div style={{position: 'absolute', inset: 0, opacity: o}}>
    <svg width={W} height={PANEL_H} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
      <circle cx={dot[0]} cy={dot[1]} r={11 * d} fill="none" stroke={K.accent} strokeWidth={4} />
      <circle cx={dot[0]} cy={dot[1]} r={4.5 * d} fill={K.accent} />
      {l > 0 && <line x1={dot[0]} y1={dot[1]} x2={ex} y2={ey} stroke={K.accent} strokeWidth={3} />}
    </svg>
    {t > 0 && <div style={{position: 'absolute', top: to[1] - 50, ...(left ? {right: W - to[0]} : {left: to[0]}), background: K.plate, padding: '12px 20px 14px', borderLeft: left ? undefined : `5px solid ${K.accent}`, borderRight: left ? `5px solid ${K.accent}` : undefined,
      transform: `translateX(${(1 - t) * (left ? 10 : -10)}px)`, opacity: t, textAlign: left ? 'right' : 'left'}}>
      <div style={{display: 'flex', gap: 14, alignItems: 'baseline', justifyContent: left ? 'flex-end' : 'flex-start'}}>
        <span style={{fontFamily: jet, fontWeight: 500, fontSize: 34, color: K.accent}}>{idx}</span>
        <span style={{fontFamily: font, fontWeight: 800, fontSize: 46, color: K.ink, whiteSpace: 'nowrap'}}>{name}</span>
      </div>
      {spec && <div style={{fontFamily: jet, fontWeight: 500, fontSize: 32, color: K.dim, marginTop: 4, whiteSpace: 'nowrap'}}>{spec}</div>}
    </div>}
  </div>;
};

/** The header band (0–200): a mono kicker and either a title or the quote strap. */
const Header: React.FC<{f: number; kicker: string; title?: React.ReactNode; quote?: boolean}> = ({f, kicker, title, quote}) => <div style={{position: 'absolute', left: 0, top: 0, width: W, height: PANEL_Y}}>
  <div style={{position: 'absolute', left: 56, top: 44, fontFamily: jet, fontWeight: 500, fontSize: 26, color: K.dim, letterSpacing: 2}}>{kicker}</div>
  {title && <div style={{position: 'absolute', left: 56, top: 96}}>{title}</div>}
  {quote && <div style={{position: 'absolute', left: 56, top: 112, display: 'flex', alignItems: 'center', gap: 16, opacity: clamp(f / 5)}}>
    <div style={{width: 8, height: 56, background: K.accent}} />
    <div style={{fontFamily: font, fontWeight: 800, fontSize: 46, color: K.ink}}>转述 · 国外开发者 Elvar</div>
  </div>}
</div>;

const make = (draw: NonNullable<Scene['backdrop']>, sfx?: Scene['sfx']): Scene => {
  const Sc: Scene = () => null;
  Sc.backdrop = draw;
  Sc.sfx = sfx;
  return Sc;
};

/* 1 hook: the V8 already apart at frame 0 (piston pulled off the crank), the title in the header */
const hookPlan = (cue: Cue) => ({a: cue('a', 30)});
const Hook = make(({f}) => <Stage>
  <Panel f={f} src={V('v8-explode')} from={1.0} push={0.06} origin="48% 52%">
    <Label f={f} at={2} dot={[548, 610]} to={[470, 850]} idx="01" name="活塞" spec="拆开 · 连杆 · 曲轴" />
  </Panel>
  <Header f={f} kicker="TEARDOWN · AI 做的 3D 拆解模拟器" title={<div style={{fontFamily: font, fontWeight: 900, fontSize: 70, color: K.ink, lineHeight: 1.05, whiteSpace: 'nowrap'}}>一句话 → <span style={{color: '#fff', background: K.accent, padding: '0 14px'}}>能拆开的 V8</span></div>} />
</Stage>, (cue) => { const p = hookPlan(cue); return [{at: 0, kind: 'clack', gain: 0.12}, {at: 4, kind: 'tick', gain: 0.07}, {at: p.a, kind: 'whoosh-short', gain: 0.05}]; });

/* 2 who: three of the README's machines in quick cuts, then the repository card (MIT, stars — platform counts, dated) */
const whoPlan = (cue: Cue) => ({a: cue('a', 71)});
const GH = ['gh-bee', 'gh-octopus', 'gh-scorpion'];
const Who = make(({f, cue}) => {
  const p = whoPlan(cue);
  const seg = Math.min(2, Math.floor(f / Math.max(1, (p.a - 4) / 3)));
  const card = ease.outBack(clamp((f - p.a + 6) / 10), 1.4);
  return <Stage>
    <Panel f={f} src={V(GH[seg])} push={0.05}>
      {card > 0 && <div style={{position: 'absolute', left: 150, top: 260, width: 778, transform: `scale(${0.7 + 0.3 * card}) rotate(-1.5deg)`, opacity: clamp(card * 2), transformOrigin: '50% 50%',
        boxShadow: '0 30px 60px rgba(0,0,0,0.55)', background: '#fff', borderRadius: 12, overflow: 'hidden'}}>
        <Img src={staticFile('video/claude-teardown-3d-sim/repo-about.png')} style={{width: 778, display: 'block'}} />
        {/* rings on the two facts the card carries */}
        <div style={{position: 'absolute', left: 100, top: 470, width: 300, height: 62, border: `5px solid ${K.accent}`, borderRadius: 32, opacity: clamp((f - p.a - 6) / 5)}} />
        <div style={{position: 'absolute', left: 100, top: 572, width: 300, height: 62, border: `5px solid ${K.accent}`, borderRadius: 32, opacity: clamp((f - p.a - 12) / 5)}} />
      </div>}
      {f >= p.a + 14 && <div style={{position: 'absolute', left: 150, top: 1080, fontFamily: jet, fontSize: 30, color: K.ink, background: K.plate, padding: '6px 14px'}}>GitHub 计数 · 11-02</div>}
    </Panel>
    <Header f={f} kicker="FREE · MIT · CLAUDE SKILL" title={<div style={{fontFamily: inter, fontWeight: 600, fontSize: 76, color: K.ink, lineHeight: 1}}>120万+ <span style={{fontFamily: font, fontWeight: 800, fontSize: 44, color: K.dim}}>原帖浏览（X 计数）</span></div>} />
  </Stage>;
}, (cue) => { const p = whoPlan(cue); return [{at: 0, kind: 'tick', gain: 0.07}, {at: Math.round((p.a - 4) / 3), kind: 'tick', gain: 0.07}, {at: Math.round((p.a - 4) * 2 / 3), kind: 'tick', gain: 0.07}, {at: p.a - 4, kind: 'fs-paper-slide', gain: 0.08}, {at: p.a + 6, kind: 'marker', gain: 0.06}]; });

/* 3 say: his words — a plain-words description becomes a machine you can open (the jellyfish) */
const sayPlan = (cue: Cue) => ({a: cue('a', 16), b: cue('b', 66)});
const Say = make(({f, cue}) => {
  const p = sayPlan(cue);
  const typed = '"做一只能拆开的机器水母"'.slice(0, Math.floor(clamp((f - p.a) / 30) * 13));
  return <Stage>
    <Panel f={f} src={V('jelly-whole')} push={0.08}>
      {f >= p.a && f < p.b + 4 && <div style={{position: 'absolute', left: 60, top: 70, background: K.plate, padding: '16px 24px', fontFamily: font, fontWeight: 700, fontSize: 44, color: K.ink, borderLeft: `5px solid ${K.accent}`}}>
        {typed}<span style={{opacity: Math.floor(f / 8) % 2 ? 1 : 0}}>▍</span>
        <div style={{fontFamily: jet, fontSize: 26, color: K.dim, marginTop: 6}}>示意 · 大白话描述</div>
      </div>}
      <Label f={f} at={p.b} dot={[520, 560]} to={[600, 250]} idx="02" name="机器水母 HM-4" spec="一个离线网页" />
    </Panel>
    <Header f={f} kicker="IN HIS WORDS" quote />
  </Stage>;
}, (cue) => { const p = sayPlan(cue); return [{at: p.a, kind: 'tap', gain: 0.06}, {at: p.b, kind: 'tick', gain: 0.07}]; });

/* 4 buttons: one button per part — 拆开 / 剖开 / 透视 light up as the footage does each */
const btnPlan = (cue: Cue) => ({a: cue('a', 29), b: cue('b', 54), c: cue('c', 73)});
const Buttons = make(({f, cue}) => {
  const p = btnPlan(cue);
  const src = f < p.a ? ['jelly-dome', 0] : f < p.b ? ['jelly-spine', 0] : f < p.c ? ['jelly-dome', 1.6] : ['worm-xray', 0.6];
  const on = f >= p.c ? 2 : f >= p.b ? 1 : f >= p.a ? 0 : -1;
  return <Stage>
    <Panel f={f} src={V(src[0] as string)} from={src[1] as number} push={0.05} />
    <div style={{position: 'absolute', left: 0, width: W, top: PANEL_Y + PANEL_H - 230, display: 'flex', justifyContent: 'center', gap: 26}}>
      {['拆开', '剖开', '透视'].map((t, i) => {
        const lit = i === on, k = lit ? ease.outBack(clamp((f - [p.a, p.b, p.c][i]) / 6), 2) : 1;
        return <div key={t} style={{fontFamily: font, fontWeight: 900, fontSize: 52, color: lit ? '#fff' : K.ink, background: lit ? K.accent : K.plate, padding: '14px 40px', borderRadius: 12,
          border: `3px solid ${lit ? K.accent : 'rgba(241,239,233,0.25)'}`, transform: `scale(${lit ? 0.9 + 0.1 * k : 1})`}}>{t}</div>;
      })}
    </div>
    <Header f={f} kicker="ONE BUTTON PER PART" quote />
  </Stage>;
}, (cue) => { const p = btnPlan(cue); return [{at: p.a, kind: 'clack', gain: 0.1}, {at: p.b, kind: 'clack', gain: 0.1}, {at: p.c, kind: 'clack', gain: 0.1}]; });

/* 5 model (second hook): model first, drawing second — the whole machine reads one number */
const modelPlan = (cue: Cue) => ({a: cue('a', 51), b: cue('b', 69)});
const Model = make(({f, cue}) => {
  const p = modelPlan(cue);
  const v = (Math.sin(f / 18) * 0.5 + 0.5);
  const show = ease.outCubic(clamp((f - p.b + 4) / 8));
  return <Stage>
    <Panel f={f} src={V('hexapod')} push={0.06}>
      {/* the one input: a dial with its value, leaders fanning to the legs */}
      {show > 0 && <>
        <svg width={W} height={PANEL_H} style={{position: 'absolute', left: 0, top: 0}}>
          {[[300, 760], [700, 760], [250, 540], [800, 520], [380, 400], [640, 380]].map(([x, y], i) => <line key={i} x1={540} y1={1010} x2={540 + (x - 540) * show} y2={1010 + (y - 1010) * show} stroke={K.accent} strokeWidth={3} strokeDasharray="10 8" opacity={0.85} />)}
        </svg>
        <div style={{position: 'absolute', left: 340, top: 960, width: 400, background: K.plate, padding: '14px 22px', borderTop: `5px solid ${K.accent}`, transform: `scale(${0.8 + 0.2 * show})`}}>
          <div style={{display: 'flex', justifyContent: 'space-between', fontFamily: jet, fontSize: 32, color: K.dim}}><span>输入 θ</span><span style={{color: K.ink}}>{v.toFixed(2)}</span></div>
          <div style={{height: 10, background: 'rgba(241,239,233,0.2)', marginTop: 10}}><div style={{width: `${v * 100}%`, height: '100%', background: K.accent}} /></div>
        </div>
      </>}
      <Label f={f} at={p.a - 6} dot={[540, 560]} to={[600, 220]} idx="03" name="六足机器人" spec="18 个关节 · 据作者" out={p.b - 2} />
    </Panel>
    <Header f={f} kicker="MODEL FIRST · DRAWING SECOND" quote />
  </Stage>;
}, (cue) => { const p = modelPlan(cue); return [{at: 2, kind: 'tick', gain: 0.06}, {at: p.a - 6, kind: 'tick', gain: 0.07}, {at: p.b, kind: 'chime', gain: 0.08}]; });

/* 6 gear (signature, climax): a dimension line drawn on the landing gear's rack — 201 mm; then 32 teeth turn 180° */
const gearPlan = (cue: Cue) => ({a: cue('a', 43), b: cue('b', 78)});
const Gear = make(({f, cue}) => {
  const p = gearPlan(cue);
  const dl = ease.inOutCubic(clamp((f - p.a + 4) / 14));
  const x0 = 372, x1 = 650, y = 340, out = 124;
  const o = 1 - clamp((f - out) / 6);
  return <Stage>
    <Panel f={f} src={V('gear')} from={0} push={0.03}>
      {dl > 0 && <svg width={W} height={PANEL_H} style={{position: 'absolute', left: 0, top: 0, opacity: o}}>
        <line x1={x0} y1={y - 22} x2={x0} y2={y + 46} stroke={K.accent} strokeWidth={4} />
        <line x1={x0 + (x1 - x0) * dl} y1={y - 22} x2={x0 + (x1 - x0) * dl} y2={y + 46} stroke={K.accent} strokeWidth={4} opacity={dl > 0.98 ? 1 : 0.6} />
        <line x1={x0} y1={y} x2={x0 + (x1 - x0) * dl} y2={y} stroke={K.accent} strokeWidth={5} />
        <path d={`M${x0 + 18},${y - 10} L${x0},${y} L${x0 + 18},${y + 10}`} fill="none" stroke={K.accent} strokeWidth={5} />
        {dl > 0.98 && <path d={`M${x1 - 18},${y - 10} L${x1},${y} L${x1 - 18},${y + 10}`} fill="none" stroke={K.accent} strokeWidth={5} />}
      </svg>}
      {dl > 0.6 && <div style={{position: 'absolute', left: (x0 + x1) / 2 - 170, top: y - 170, width: 340, textAlign: 'center', background: K.plate, padding: '10px 0 12px', opacity: o * clamp((dl - 0.6) / 0.3)}}>
        <div style={{fontFamily: inter, fontWeight: 600, fontSize: 80, color: '#fff', lineHeight: 1}}>201<span style={{fontSize: 40, color: K.dim}}> mm</span></div>
        <div style={{fontFamily: font, fontWeight: 700, fontSize: 32, color: K.dim}}>齿条 · 据作者</div>
      </div>}
      <Label f={f} at={p.b - 4} dot={[492, 418]} to={[640, 650]} idx="04" name="32 齿 · 转 180°" spec="模数 4 mm · 作者自算" out={out} />
    </Panel>
    <Header f={f} kicker="REAL NUMBERS · CESSNA 337 GEAR" quote />
  </Stage>;
}, (cue) => { const p = gearPlan(cue); return [{at: p.a - 4, kind: 'marker', gain: 0.1}, {at: p.a + 10, kind: 'tick', gain: 0.09}, {at: p.b - 4, kind: 'tick', gain: 0.08}]; });

/* 7 seven: two days, seven machines — even one that doesn't exist */
const sevenPlan = (cue: Cue) => ({a: cue('a', 34)});
const Seven = make(({f, cue}) => {
  const p = sevenPlan(cue);
  const n = ease.outBack(clamp((f - 4) / 9), 1.8);
  return <Stage>
    <Panel f={f} src={V(f < p.a ? 'worm-head' : 'worm-body')} push={0.07}>
      <div style={{position: 'absolute', left: 60, top: 60, background: K.plate, padding: '10px 26px 16px', transform: `scale(${n})`, transformOrigin: '0 0'}}>
        <div style={{fontFamily: inter, fontWeight: 600, fontSize: 120, color: '#fff', lineHeight: 1}}>7<span style={{fontFamily: font, fontWeight: 800, fontSize: 48}}> 个</span><span style={{fontFamily: font, fontWeight: 800, fontSize: 48, color: K.dim}}> / 2 天</span></div>
        <div style={{fontFamily: font, fontWeight: 700, fontSize: 32, color: K.dim}}>作者自述</div>
      </div>
      <Label f={f} at={p.a + 2} dot={[560, 640]} to={[700, 900]} idx="05" name="沙虫 MK-X" spec="虚构机器" />
    </Panel>
    <Header f={f} kicker="7 MACHINES IN 2 DAYS" quote />
  </Stage>;
}, (cue) => { const p = sevenPlan(cue); return [{at: 4, kind: 'stamp', gain: 0.08}, {at: p.a, kind: 'whoosh-short', gain: 0.06}, {at: p.a + 2, kind: 'tick', gain: 0.07}]; });

/* 8 end: one leg of the Strandbeest on its own, then back to the opened V8 (frame 0's picture) */
const endPlan = (cue: Cue) => ({a: cue('a', 43)});
const End = make(({f, cue}) => {
  const p = endPlan(cue);
  return <Stage>
    {f < p.a ? <Panel f={f} src={V('beest-leg')} push={0.05} /> : <Panel f={f - p.a} src={V('v8-explode')} from={1.0} push={0.06} origin="48% 52%" />}
    <Header f={f} kicker="TEARDOWN · AI 做的 3D 拆解模拟器" title={f >= p.a ? <div style={{fontFamily: font, fontWeight: 900, fontSize: 70, color: K.ink, lineHeight: 1.05, whiteSpace: 'nowrap'}}>看懂它，<span style={{color: '#fff', background: K.accent, padding: '0 14px'}}>不用真拆</span></div> : undefined} />
  </Stage>;
}, (cue) => { const p = endPlan(cue); return [{at: 0, kind: 'whoosh', gain: 0.05}, {at: p.a, kind: 'clack', gain: 0.1}]; });

/** Cover anchor (880 × 800): the opened V8. */
const Cover: Scene = () => <div style={{position: 'absolute', left: 0, top: 0, width: 880, height: 800, overflow: 'hidden', background: K.bg1}}>
  <Img src={staticFile('video/claude-teardown-3d-sim/v8-still.jpg')} style={{position: 'absolute', left: -100, top: -230, width: 1080, height: 1216}} />
</div>;

export const claudeTeardownScenes: Record<string, Scene> = {
  'td.hook': Hook, 'td.who': Who, 'td.say': Say, 'td.buttons': Buttons, 'td.model': Model, 'td.gear': Gear, 'td.seven': Seven, 'td.end': End, 'td.cover': Cover,
};
