import React from 'react';
import {Img, OffthreadVideo, Sequence, staticFile} from 'remotion';
import {font} from '../theme';
import {clamp, ease, springStep} from '../../fx';
import {Cue, S, Scene, hitOf, phaseOp} from '../paper';
import {B, BG, Big, DIM, INK, LINE, Mono, PANEL, STEEL, mono} from '../tech';

// huashu-motion: "say one sentence, your coding agent makes a launch film" (≤ 60 s, full-screen 9:16).
// Script: inputs/huashu-motion-skill/script.md; storyboard: tutorials/huashu-motion-skill.storyboard.md. Copy is verbatim.
// Stage = the "full" layout, 900 × 1080 at (60, 200); 16:9 clips run full width (x −60, 1080 × 608) as big cards.
// Every clip is muted and labelled 「案例展示」; clip 01 keeps its own 「Fan-made · 非 DeepSeek 官方」 corner pill (our label sits above it).
// Never: the developer's name, handle, avatar or mascot. Clip 03 is used only outside its 小猫补光灯 shots, clip 04 only for the press-C popup.
// Accents: orange (the skill's icon) and cyan.

const W = 900;
const ORANGE = '#ff7a3d';
const CLIP = (n: string) => staticFile(`video/huashu-motion-skill/${n}.mp4`);
const IMG = (n: string) => staticFile(`images/tutorials/huashu-motion-skill/${n}.jpg`);
const CARD_H = 608;

const Root: React.FC<{children: React.ReactNode}> = ({children}) => <div style={{position: 'relative', width: W, height: 1080}}>{children}</div>;
const Abs: React.FC<{x?: number; y: number; w?: number; style?: React.CSSProperties; children: React.ReactNode}> = ({x = 0, y, w, style, children}) => (
  <div style={{position: 'absolute', left: x, top: y, width: w, ...style}}>{children}</div>
);
const popIn = (f: number, at: number) => {
  const k = springStep(S(f), S(at), {f: 2.6, z: 0.62});
  const sq = hitOf(f, [at + 4], 1);
  return {opacity: clamp(k * 2), transform: `scale(${(0.6 + 0.4 * k) * (1 + 0.04 * sq)}, ${(0.6 + 0.4 * k) * (1 - 0.05 * sq)})`};
};
const ChipTag: React.FC<{c?: string; size?: number; children: React.ReactNode; fill?: boolean}> = ({c = ORANGE, size = 52, children, fill}) => (
  <div style={{display: 'inline-block', background: fill ? c : BG, border: `4px solid ${c}`, color: fill ? BG : c, fontFamily: font, fontWeight: 900, fontSize: size,
    padding: '2px 18px', whiteSpace: 'nowrap'}}>{children}</div>
);
const CaseTag: React.FC<{style?: React.CSSProperties}> = ({style}) => (
  <div style={{position: 'absolute', background: 'rgba(12,26,44,0.88)', color: INK, fontFamily: font, fontWeight: 700, fontSize: 40, padding: '2px 14px',
    whiteSpace: 'nowrap', ...style}}>案例展示</div>
);

/** One 16:9 clip segment as a full-width card: plays from `src` seconds when the segment starts. */
type Seg = {clip: string; src: number; from: number; to?: number; zoom?: number; ox?: number; oy?: number};
const WideCard: React.FC<{f: number; y: number; segs: Seg[]; fanMade?: boolean; dim?: number; children?: React.ReactNode}> = ({f, y, segs, fanMade, dim = 0, children}) => {
  const cur = segs.filter((s) => f >= s.from).at(-1) ?? segs[0];
  const punch = 1 + 0.05 * (1 - ease.outCubic(clamp((f - cur.from) / 8)));
  return <div style={{position: 'absolute', left: -60, top: y, width: 1080, height: CARD_H, overflow: 'hidden', background: '#000', borderTop: `3px solid ${STEEL}`,
    borderBottom: `3px solid ${STEEL}`}}>
    {segs.map((s, i) => {
      const end = s.to ?? segs[i + 1]?.from ?? 1e5;
      if (f < s.from || f >= end) return null;
      return <Sequence key={i} from={s.from} layout="none">
        <div style={{position: 'absolute', inset: 0, transform: `scale(${(s.zoom ?? 1) * punch})`, transformOrigin: `${s.ox ?? 50}% ${s.oy ?? 50}%`}}>
          <OffthreadVideo src={CLIP(s.clip)} muted trimBefore={Math.round(s.src * 30)} style={{width: '100%', height: '100%', objectFit: 'cover', opacity: 1 - dim}} />
        </div>
      </Sequence>;
    })}
    {/* clip 01's own corner pill sits at the bottom-right; our label goes just above it */}
    <CaseTag style={{right: fanMade ? 60 : 60, bottom: fanMade ? 46 : 12}} />
    {children}
  </div>;
};

/* ---------- 1 hook: the "official-looking" DeepSeek launch film, fast cuts ---------- */

const hookPlan = (cue: Cue) => ({a: cue('a', 62), b: cue('b', 103)});
const HOOK_SEGS: Seg[] = [{clip: '01', src: 3.0, from: 0}, {clip: '01', src: 4.6, from: 22}, {clip: '01', src: 8.2, from: 42}, {clip: '01', src: 22.6, from: 62},
  {clip: '01', src: 25.2, from: 86}, {clip: '01', src: 33.6, from: 112}];
const Hook: Scene = ({f, cue}) => {
  const p = hookPlan(cue);
  const swap = f >= p.b;
  return <Root>
    <Abs y={20} w={W} key={swap ? 'b' : 'a'} style={swap ? {...popIn(f, p.b), transformOrigin: '0% 50%'} : {}}>
      <Big size={106} c={swap ? ORANGE : INK} style={{whiteSpace: 'nowrap'}}>{swap ? 'AI 写代码做的' : '这不是官方发布片'}</Big>
    </Abs>
    <WideCard f={f} y={300} segs={HOOK_SEGS} fanMade />
  </Root>;
};
Hook.sfx = () => HOOK_SEGS.slice(1).map((s) => ({at: s.from, kind: 'whoosh-short', gain: 0.08}));

/* ---------- 2 what: an open-source skill; one sentence to the agent ---------- */

const whatPlan = (cue: Cue) => ({a: cue('a', 31), b: cue('b', 101), c: cue('c', 175)});
const PROMPT = '用huashu-motion给我的产品做一支30秒的发布片，官网是xxx.com';
const What: Scene = ({f, cue}) => {
  const p = whatPlan(cue);
  const typed = Math.round(PROMPT.length * ease.outCubic(clamp((f - p.c + 4) / 30)));
  const showCard = f >= p.c - 6;
  return <Root>
    {f >= p.a - 2 && <Abs y={20} w={W} style={phaseOp(f, p.a - 2)}><Big size={64}>开源 Skill：<span style={{color: ORANGE}}>huashu-motion</span></Big></Abs>}
    <div style={{opacity: showCard ? 1 - 0.6 * clamp((f - p.c + 6) / 10) : 1}}>
      <WideCard f={f} y={160} segs={[{clip: '02', src: 2.0, from: 0}]} />
    </div>
    {f >= p.b - 1 && <Abs y={830} w={W} style={{display: 'flex', gap: 18}}>
      {['Claude Code', 'Codex'].map((t, i) => <div key={t} style={{...popIn(f, p.b + i * 6), transformOrigin: '0% 50%'}}><ChipTag c={B}>{t}</ChipTag></div>)}
    </Abs>}
    {showCard && <Abs y={520} w={W} style={{...phaseOp(f, p.c - 6), border: `4px solid ${ORANGE}`, background: BG, padding: '20px 26px'}}>
      <Mono size={40} c={DIM}>&gt; 对 agent 说</Mono>
      <div style={{fontFamily: mono, fontWeight: 700, fontSize: 52, lineHeight: 1.4, color: INK, marginTop: 8, wordBreak: 'break-all'}}>
        {PROMPT.slice(0, typed)}<span style={{color: ORANGE, opacity: typed < PROMPT.length && Math.floor(f / 8) % 2 ? 1 : 0}}>▍</span>
      </div>
    </Abs>}
  </Root>;
};
What.sfx = (cue) => {
  const p = whatPlan(cue);
  return [{at: p.a, kind: 'tap', gain: 0.14}, {at: p.b, kind: 'pop', gain: 0.1}, {at: p.c - 6, kind: 'whoosh-short', gain: 0.1}];
};

/* ---------- 3 how: read → 3 directions → write → score ---------- */

const howPlan = (cue: Cue) => ({a: cue('a', 26), b: cue('b', 61), c: cue('c', 107), d: cue('d', 126)});
const STEPS = ['读产品', '3 个方向', '写片', '作曲 + 音效'];
const How: Scene = ({f, cue}) => {
  const p = howPlan(cue);
  const ats = [p.a, p.b, p.c, p.d];
  const showImg = f >= p.b && f < p.c;
  return <Root>
    <WideCard f={f} y={60} segs={[{clip: '03', src: 0.3, from: 0}, {clip: '03', src: 9.4, from: p.c}]} />
    {showImg && <div style={{position: 'absolute', left: -60, top: 60, width: 1080, height: CARD_H, overflow: 'hidden', background: '#000', borderTop: `3px solid ${STEEL}`,
      borderBottom: `3px solid ${STEEL}`}}>
      <Img src={IMG('06')} style={{width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${1.02 + 0.06 * clamp((f - p.b) / 45)})`}} />
      <CaseTag style={{right: 60, bottom: 12}} />
    </div>}
    <Abs y={720} w={W} style={{display: 'flex', flexWrap: 'wrap', gap: 14, alignItems: 'center'}}>
      {STEPS.map((s, i) => f >= ats[i] - 1 && <React.Fragment key={s}>
        {i > 0 && <Big size={52} c={DIM}>→</Big>}
        <div style={{...popIn(f, ats[i]), transformOrigin: '0% 50%'}}><ChipTag c={i === STEPS.filter((_, k) => f >= ats[k]).length - 1 ? ORANGE : STEEL} size={56}>{s}</ChipTag></div>
      </React.Fragment>)}
    </Abs>
  </Root>;
};
How.sfx = (cue) => {
  const p = howPlan(cue);
  return [p.a, p.b, p.c, p.d].map((at) => ({at, kind: 'tick', gain: 0.12}));
};

/* ---------- 4 point-to-edit: press C, click the frame, write, only that spot changes ---------- */

const editPlan = (cue: Cue) => ({a: cue('a', 64), b: cue('b', 83), c: cue('c', 112), d: cue('d', 146)});
const Keycap: React.FC<{f: number; at: number}> = ({f, at}) => {
  const press = hitOf(f, [at, at + 24], 1);
  return <div style={popIn(f, at)}><div style={{width: 150, height: 150, borderRadius: 22, background: INK, color: BG, fontFamily: mono, fontWeight: 800, fontSize: 96,
    textAlign: 'center', lineHeight: '146px', boxShadow: `0 ${10 - 8 * press}px 0 ${STEEL}`, transform: `translateY(${8 * press}px)`}}>C</div></div>;
};
const Edit: Scene = ({f, cue}) => {
  const p = editPlan(cue);
  // the editor clip: 2.0 s in the press-C hint shows, ~4 s the comment popup is open and typed
  const srcStart = 1.6;
  // leave clip 04 at 5.6 s (right after the typed comment): from ~5.8 s its editor top bar shows a project path we keep out
  const cut = Math.min(p.d - 4, Math.round((5.6 - srcStart) * 30));
  return <Root>
    <WideCard f={f} y={60} segs={[{clip: '04', src: srcStart, from: 0, to: cut, zoom: 1.2, ox: 50, oy: 100}, {clip: '04', src: 12.9, from: cut, zoom: 1.3, ox: 40, oy: 60}]} />
    {f >= p.a - 1 && f < cut && <Abs x={700} y={-10}><Keycap f={f} at={p.a} /></Abs>}
    <Abs y={720} w={W} style={{display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap'}}>
      {[{t: '按 C', at: p.a}, {t: '点画面', at: p.b}, {t: '写意见', at: p.c}].map((s, i) => f >= s.at - 1 && <React.Fragment key={s.t}>
        {i > 0 && <Big size={52} c={DIM}>→</Big>}
        <div style={{...popIn(f, s.at), transformOrigin: '0% 50%'}}><ChipTag c={B} size={56}>{s.t}</ChipTag></div>
      </React.Fragment>)}
    </Abs>
    {f >= p.d - 1 && <Abs y={850} w={W} style={{...popIn(f, p.d), transformOrigin: '0% 50%'}}><Big size={110} c={ORANGE}>只改这一处</Big></Abs>}
  </Root>;
};
Edit.sfx = (cue) => {
  const p = editPlan(cue);
  return [{at: p.a, kind: 'tap', gain: 0.18}, {at: p.b, kind: 'tick', gain: 0.12}, {at: p.c, kind: 'tick', gain: 0.12}, {at: p.d, kind: 'stamp', gain: 0.16}];
};

/* ---------- 5 who ---------- */

const whoPlan = (cue: Cue) => ({a: cue('a', 17), b: cue('b', 36), c: cue('c', 60)});
const Who: Scene = ({f, cue}) => {
  const p = whoPlan(cue);
  return <Root>
    <WideCard f={f} y={60} segs={[{clip: '05', src: 0.9, from: 0}, {clip: '05', src: 3.8, from: p.b}, {clip: '05', src: 8.1, from: p.c}]} />
    <Abs y={710} w={W} style={{display: 'flex', flexDirection: 'column', gap: 18}}>
      {[{t: 'App 上架预览', at: p.a}, {t: '独立产品发布', at: p.b}, {t: '开源项目演示', at: p.c}].map((s) => f >= s.at - 1 && (
        <div key={s.t} style={{...popIn(f, s.at), transformOrigin: '0% 50%'}}><ChipTag c={ORANGE} size={64}>{s.t}</ChipTag></div>))}
    </Abs>
  </Root>;
};
Who.sfx = (cue) => {
  const p = whoPlan(cue);
  return [p.a, p.b, p.c].map((at) => ({at, kind: 'pop', gain: 0.12}));
};

/* ---------- 6 install: the command card (hold, screenshot-able), or tell the agent ---------- */

const installPlan = (cue: Cue) => ({a: cue('a', 13), b: cue('b', 90), c: cue('c', 146)});
const Terminal: React.FC<{title: string; children: React.ReactNode; c?: string}> = ({title, children, c = STEEL}) => (
  <div style={{border: `4px solid ${c}`, background: '#0a1422'}}>
    <div style={{height: 60, display: 'flex', alignItems: 'center', gap: 12, padding: '0 20px', borderBottom: `2px solid ${LINE}`, background: PANEL}}>
      {['#ff5f57', '#febc2e', '#28c840'].map((x) => <div key={x} style={{width: 18, height: 18, borderRadius: 9, background: x}} />)}
      <Mono size={40} c={DIM}>{title}</Mono>
    </div>
    <div style={{padding: '22px 26px'}}>{children}</div>
  </div>
);
const Install: Scene = ({f, cue}) => {
  const p = installPlan(cue);
  return <Root>
    <Abs y={0} w={W} style={phaseOp(f, 0)}><Big size={68}>安装：一行命令</Big></Abs>
    <Abs y={120} w={W} style={{...phaseOp(f, p.a - 4), scale: `${1 + 0.08 * ease.inOutCubic(clamp((f - p.a) / 220))}`, transformOrigin: '50% 0%'}}>
      <div style={{position: 'relative'}}>
        <div style={{position: 'absolute', right: 12, top: -30, zIndex: 1, background: ORANGE, color: BG, fontFamily: font, fontWeight: 900, fontSize: 40, padding: '0 12px'}}>建议截图</div>
        <Terminal title="终端" c={ORANGE}>
          <div style={{fontFamily: mono, fontWeight: 800, fontSize: 54, lineHeight: 1.35, color: INK, whiteSpace: 'nowrap'}}>
            <span style={{color: ORANGE}}>$ </span>npx skills add<br />alchaincyf/huashu-motion<span style={{color: ORANGE, opacity: Math.floor(f / 10) % 2 ? 1 : 0}}>▍</span>
          </div>
        </Terminal>
      </div>
    </Abs>
    {f >= p.b - 4 && <Abs y={470} w={W} style={phaseOp(f, p.b - 4)}>
      <Big size={44} c={DIM} w={800}>或者跟 agent 说</Big>
      <div style={{marginTop: 10, border: `3px solid ${B}`, background: BG, padding: '16px 22px', fontFamily: mono, fontWeight: 700, fontSize: 44, lineHeight: 1.4, color: INK,
        wordBreak: 'break-all'}}>帮我安装huashu-motion这个skill，装好后跑一遍demo</div>
    </Abs>}
    <Abs y={800} w={W} style={{display: 'flex', gap: 16}}>
      {['Node 22+', 'Chrome', 'FFmpeg'].map((t, i) => f >= p.c + i * 8 - 1 && <div key={t} style={{...popIn(f, p.c + i * 8), transformOrigin: '0% 50%'}}><ChipTag c={B} size={56} fill={f >= p.c + 30 && Math.floor((f - p.c - 30) / 14) % 3 === i}>{t}</ChipTag></div>)}
    </Abs>
  </Root>;
};
Install.sfx = (cue) => {
  const p = installPlan(cue);
  return [{at: p.a, kind: 'tap', gain: 0.14}, {at: p.b, kind: 'whoosh-short', gain: 0.1}, ...[0, 8, 16].map((d) => ({at: p.c + d, kind: 'tick', gain: 0.1}))];
};

/* ---------- 7 result: the developer's own numbers ---------- */

const resultPlan = (cue: Cue) => ({a: cue('a', 92), b: cue('b', 134), c: cue('c', 163)});
const Result: Scene = ({f, cue}) => {
  const p = resultPlan(cue);
  const yuan = (1.95 * ease.outCubic(clamp((f - p.c) / 20))).toFixed(2);
  return <Root>
    <WideCard f={f} y={60} segs={[{clip: '08', src: 1.0, from: 0}, {clip: '08', src: 2.2, from: 40}, {clip: '08', src: 3.2, from: p.a}, {clip: '08', src: 12.6, from: p.b},
      {clip: '08', src: 19.4, from: p.c}]} />
    <Abs y={700} w={W} style={{display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'center'}}>
      {f >= p.a - 1 && <div style={{...popIn(f, p.a), transformOrigin: '0% 50%'}}><ChipTag c={INK} size={60}>22 秒动效片</ChipTag></div>}
      {f >= p.b - 1 && <div style={{...popIn(f, p.b), transformOrigin: '0% 50%'}}><ChipTag c={B} size={60}>&lt; 半小时</ChipTag></div>}
    </Abs>
    {f >= p.c - 1 && <Abs y={800} w={W} style={{...popIn(f, p.c), transformOrigin: '0% 50%'}}>
      <div style={{fontFamily: mono, fontWeight: 800, fontSize: 130, color: ORANGE, lineHeight: 1}}>¥{yuan}</div>
    </Abs>}
    <Abs y={960} w={W}><Mono size={40} c={DIM}>据开发者自述</Mono></Abs>
  </Root>;
};
Result.sfx = (cue) => {
  const p = resultPlan(cue);
  return [{at: p.a, kind: 'pop', gain: 0.12}, {at: p.b, kind: 'pop', gain: 0.12}, {at: p.c + 20, kind: 'stamp', gain: 0.16}];
};

/* ---------- 8 caveats + close ---------- */

const closePlan = (cue: Cue) => ({a: cue('a', 37), b: cue('b', 105), c: cue('c', 178)});
const Close: Scene = ({f, cue}) => {
  const p = closePlan(cue);
  const end = f >= p.c - 4;
  return <Root>
    {!end && <Abs y={0} w={W}><Big size={72}>注意两点</Big></Abs>}
    {!end && [{t: '⚠ 目前只在 macOS 实测', at: p.a, y: 160}, {t: '⚠ 它听不见，配乐要你把关', at: p.b, y: 330}].map((w) => f >= w.at - 1 && (
      <Abs key={w.t} y={w.y} w={W} style={{...popIn(f, w.at), transformOrigin: '0% 50%', border: `4px solid ${ORANGE}`, background: PANEL, padding: '22px 26px'}}>
        <Big size={60} c={INK}>{w.t}</Big>
      </Abs>))}
    {!end && f >= p.a + 20 && <Abs y={520} w={W} style={phaseOp(f, p.a + 20)}>
      <div style={{position: 'relative', width: W, height: 460, overflow: 'hidden', border: `3px solid ${STEEL}`}}>
        <Img src={IMG('still-08-1')} style={{width: '100%', height: '100%', objectFit: 'cover', opacity: 0.85, transform: `scale(${1 + 0.05 * clamp((f - p.a) / 120)})`}} />
        <CaseTag style={{right: 0, bottom: 0}} />
      </div>
    </Abs>}
    {end && <>
      <WideCard f={f} y={260} segs={[{clip: '01', src: 33.4, from: p.c - 4}]} fanMade />
      <Abs y={20} w={W} style={{...popIn(f, p.c), transformOrigin: '0% 50%'}}>
        <Big size={96}>有产品，</Big><Big size={96} c={ORANGE}>就能有发布片</Big>
      </Abs>
    </>}
  </Root>;
};
Close.sfx = (cue) => {
  const p = closePlan(cue);
  return [{at: p.a, kind: 'tap', gain: 0.16}, {at: p.b, kind: 'tap', gain: 0.16}, {at: p.c, kind: 'thud', gain: 0.16}];
};

/* ---------- covers (anchor box 880 × 800) ---------- */

const Cover67: Scene = () => <div style={{position: 'relative', width: 880, height: 800}}>
  <Img src={IMG('still-01-23')} style={{position: 'absolute', left: -100, top: 140, width: 1080, height: 608, objectFit: 'cover', outline: `3px solid ${STEEL}`}} />
</div>;
const Cover34: Scene = () => <div style={{position: 'relative', width: 880, height: 800, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, alignContent: 'center'}}>
  {['still-01-23', 'still-03-2', 'still-04-4', 'still-08-1'].map((n) => <Img key={n} src={IMG(n)} style={{width: '100%', height: 245, objectFit: 'cover', outline: `3px solid ${STEEL}`}} />)}
</div>;

export const huashuMotionScenes: Record<string, Scene> = {
  'hm.hook': Hook,
  'hm.what': What,
  'hm.how': How,
  'hm.edit': Edit,
  'hm.who': Who,
  'hm.install': Install,
  'hm.result': Result,
  'hm.close': Close,
  'hm.cover67': Cover67,
  'hm.cover34': Cover34,
};
