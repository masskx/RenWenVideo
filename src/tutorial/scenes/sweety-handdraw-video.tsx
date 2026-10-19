import React from 'react';
import {Img, OffthreadVideo, Sequence, staticFile} from 'remotion';
import {font} from '../theme';
import {clamp, ease, springStep} from '../../fx';
import {Cue, S, Scene, hitOf, phaseOp} from '../paper';
import {A, B, BG, Big, DIM, INK, LINE, Mono, PANEL, STEEL, mono} from '../tech';

// sweety-handdraw-video: an open-source Agent Skill that turns a topic into a hand-drawn explainer (≈ 93 s, length override in the script).
// Script: inputs/sweety-handdraw-video/script.md; storyboard: tutorials/sweety-handdraw-video.storyboard.md. Narration and on-screen copy are verbatim.
// Film clips 01a–01d (1080 × 608) are the author's demo film, cleaned in the package: muted, 「案例展示」, and always cropped inside
// source y 100–545 so the film's own title band (to y ≈ 97) and burned-in subtitles (y ≈ 555+) never show. 01b before 0.5 s (blood on the snake) is never used.
// The step cards are rebuilt here from the package cards (text verbatim) so body text stays ≥ 40 px.
// Accents: cyan B (the script's #40C8FF role) and amber A; code in green mono.

const W = 900;
const RED = '#ff5a5a';
const GREEN = '#4ade80';
const CODE = '#7ee2a8';
const CLIP = (n: string) => staticFile(`video/sweety-handdraw-video/${n}.mp4`);
const IMG = (n: string) => staticFile(`images/tutorials/sweety-handdraw-video/${n}.jpg`);

const Root: React.FC<{children: React.ReactNode}> = ({children}) => <div style={{position: 'relative', width: W, height: 1080}}>{children}</div>;
const Abs: React.FC<{x?: number; y: number; w?: number; style?: React.CSSProperties; children: React.ReactNode}> = ({x = 0, y, w, style, children}) => (
  <div style={{position: 'absolute', left: x, top: y, width: w, ...style}}>{children}</div>
);
const popIn = (f: number, at: number) => {
  const k = springStep(S(f), S(at), {f: 2.6, z: 0.62});
  const sq = hitOf(f, [at + 4], 1);
  return {opacity: clamp(k * 2), transform: `scale(${(0.6 + 0.4 * k) * (1 + 0.04 * sq)}, ${(0.6 + 0.4 * k) * (1 - 0.05 * sq)})`};
};
const Chip: React.FC<{c?: string; size?: number; fill?: boolean; children: React.ReactNode; style?: React.CSSProperties}> = ({c = B, size = 56, fill, children, style}) => (
  <div style={{display: 'inline-block', background: fill ? c : BG, border: `4px solid ${c}`, color: fill ? BG : c, fontFamily: font, fontWeight: 900, fontSize: size,
    padding: '2px 18px', whiteSpace: 'nowrap', ...style}}>{children}</div>
);
const Pop: React.FC<{f: number; at: number; origin?: string; children: React.ReactNode}> = ({f, at, origin = '0% 50%', children}) => (
  f >= at - 1 ? <div style={{...popIn(f, at), transformOrigin: origin}}>{children}</div> : null
);
const CaseTag: React.FC<{style?: React.CSSProperties; text?: string}> = ({style, text = '案例展示'}) => (
  <div style={{position: 'absolute', right: 0, bottom: 0, background: 'rgba(9,17,31,0.85)', color: INK, fontFamily: font, fontWeight: 700, fontSize: 40,
    padding: '0 12px', whiteSpace: 'nowrap', ...style}}>{text}</div>
);

/**
 * A window onto the film (or a still taken from it): source pixel (sx, sy) sits at the box's top-left, magnified by `scale`.
 * Callers keep sy ≥ 100 and sy + h / scale ≤ 545 so the film's title and subtitle bands stay outside the box.
 */
type Seg = {clip?: string; still?: string; src?: number; from: number; to?: number; rate?: number};
const Film: React.FC<{f: number; segs: Seg[]; x: number; y: number; w: number; h: number; sx: number; sy: number; scale: number; drift?: number;
  border?: string; tag?: boolean; style?: React.CSSProperties; children?: React.ReactNode}> = ({f, segs, x, y, w, h, sx, sy, scale, drift = 0, border = STEEL,
  tag = true, style, children}) => {
  const z = scale * (1 + drift * clamp(f / 240));
  const box: React.CSSProperties = {position: 'absolute', left: -sx * z - (z - scale) * w / (2 * scale), top: -sy * z - (z - scale) * h / (2 * scale), width: 1080 * z, height: 608 * z};
  return <div style={{position: 'absolute', left: x, top: y, width: w, height: h, overflow: 'hidden', background: '#fff', outline: `3px solid ${border}`, ...style}}>
    {segs.map((s, i) => {
      const end = s.to ?? segs[i + 1]?.from ?? 1e5;
      if (f < s.from || f >= end) return null;
      return <Sequence key={i} from={s.from} layout="none">
        {s.still ? <Img src={IMG(s.still)} style={box} />
          : <OffthreadVideo src={CLIP(s.clip ?? '')} muted trimBefore={Math.round((s.src ?? 0) * 30)} playbackRate={s.rate ?? 1} style={box} />}
      </Sequence>;
    })}
    {children}
    {tag && <CaseTag />}
  </div>;
};
const Terminal: React.FC<{title: string; c?: string; children: React.ReactNode; style?: React.CSSProperties}> = ({title, c = B, children, style}) => (
  <div style={{border: `4px solid ${c}`, background: '#07101c', ...style}}>
    <div style={{height: 60, display: 'flex', alignItems: 'center', gap: 12, padding: '0 20px', borderBottom: `2px solid ${LINE}`, background: PANEL}}>
      {['#ff5f57', '#febc2e', '#28c840'].map((x) => <div key={x} style={{width: 18, height: 18, borderRadius: 9, background: x}} />)}
      <Mono size={40} c={DIM}>{title}</Mono>
    </div>
    <div style={{padding: '18px 24px', fontFamily: mono, fontWeight: 700, fontSize: 42, lineHeight: 1.4, color: CODE, wordBreak: 'break-all'}}>{children}</div>
  </div>
);
const typed = (text: string, f: number, at: number, cps = 2.2) => text.slice(0, Math.max(0, Math.floor((f - at) * cps)));
const StepHead: React.FC<{n: string; t: string}> = ({n, t}) => (
  <div style={{display: 'flex', alignItems: 'center', gap: 18, whiteSpace: 'nowrap'}}>
    <div style={{width: 92, height: 92, borderRadius: 46, background: B, color: BG, fontFamily: mono, fontWeight: 800, fontSize: 60, lineHeight: '92px',
      textAlign: 'center'}}>{n}</div>
    <Big size={70} w={800}>{t}</Big>
  </div>
);

/* ---------- 1 hook: the coil outline snapping into colour; "no stroke was drawn by a person" ---------- */

const hookPlan = (cue: Cue) => ({a: cue('a', 54)});
const Hook: Scene = ({f, cue}) => {
  const p = hookPlan(cue);
  return <Root>
    <Abs y={-10} w={W}><Big size={104} style={{whiteSpace: 'nowrap'}}>没有一笔是<span style={{color: f >= p.a ? A : INK}}>人画的</span></Big></Abs>
    <Film f={f} x={-60} y={150} w={1080} h={776} sx={240} sy={100} scale={1.8} drift={0.05} segs={[{clip: '01b', src: 3.0, from: 0, rate: 1.3}]} />
  </Root>;
};
Hook.sfx = (cue) => [{at: hookPlan(cue).a, kind: 'stamp', gain: 0.14}];

/* ---------- 2 script → storyboard → illustration → drawn stroke by stroke, all automatic ---------- */

const autoPlan = (cue: Cue) => ({a: cue('a', 12), b: cue('b', 31), c: cue('c', 48), d: cue('d', 76), e: cue('e', 121)});
const Auto: Scene = ({f, cue}) => {
  const p = autoPlan(cue);
  const chain = [{t: '写稿', at: p.a}, {t: '分镜', at: p.b}, {t: '插画', at: p.c}, {t: '一笔一笔画', at: p.d}];
  return <Root>
    <Film f={f} x={-60} y={110} w={1080} h={440} sx={0} sy={100} scale={1} segs={[{clip: '01a', src: 0.3, from: 0, rate: 0.9}]} />
    <Abs y={630} w={W} style={{display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center'}}>
      {chain.map((c, i) => <React.Fragment key={c.t}>
        {i > 0 && f >= c.at - 1 && <Big size={52} c={DIM} w={44}>→</Big>}
        <Pop f={f} at={c.at}><Chip c={i === 3 ? A : B} size={60} fill={i === 3}>{c.t}</Chip></Pop>
      </React.Fragment>)}
    </Abs>
    <Abs y={830} w={W}><Pop f={f} at={p.e}><Chip c={INK} size={60}>AI Agent + 本地工具 · 自动完成</Chip></Pop></Abs>
  </Root>;
};
Auto.sfx = (cue) => {
  const p = autoPlan(cue);
  return [p.a, p.b, p.c].map((at) => ({at, kind: 'tick', gain: 0.1})).concat([{at: p.d, kind: 'pop', gain: 0.12}, {at: p.e, kind: 'stamp', gain: 0.12}]);
};

/* ---------- 3 name card: open-source Agent skill; topic / article / story → narrated hand-drawn explainer ---------- */

const namePlan = (cue: Cue) => ({a: cue('a', 84), b: cue('b', 138), c: cue('c', 158), d: cue('d', 189), e: cue('e', 228)});
const Name: Scene = ({f, cue}) => {
  const p = namePlan(cue);
  const ins = [{t: '主题', at: p.b}, {t: '文章', at: p.c}, {t: '故事', at: p.d}];
  const fly = (at: number) => ease.inOutCubic(clamp((f - p.e) / 14)) * (f >= at ? 1 : 0);
  return <Root>
    <Abs y={-6} w={W}><div style={{fontFamily: mono, fontWeight: 800, fontSize: 60, color: INK, whiteSpace: 'nowrap'}}>sweety-<span style={{color: B}}>handdraw</span>-video</div></Abs>
    <Abs y={92} w={W}><Pop f={f} at={p.a}><Chip c={A} size={50} fill>开源 Agent 技能</Chip></Pop></Abs>
    <Film f={f} x={-60} y={190} w={1080} h={520} sx={135} sy={115} scale={1.3}
      segs={[{clip: '01d', src: 0, from: 0}, {clip: '01c', src: 0, from: 105}, {still: 'f-c39', from: 228}]} />
    <Abs y={760} w={W} style={{display: 'flex', alignItems: 'center', gap: 14}}>
      {ins.map((it, i) => <div key={it.t} style={{transform: `translate(${fly(it.at) * (480 - i * 150)}px, 0) scale(${1 - 0.5 * fly(it.at)})`, opacity: 1 - fly(it.at)}}>
        <Pop f={f} at={it.at}><Chip c={B} size={58}>{it.t}</Chip></Pop>
      </div>)}
    </Abs>
    {f >= p.e - 1 && <Abs y={760} x={360} w={540} style={{...popIn(f, p.e + 6), transformOrigin: '0% 50%'}}>
      <div style={{border: `4px solid ${A}`, background: PANEL, padding: '10px 18px'}}>
        <Big size={58} c={A} w={500} style={{whiteSpace: 'nowrap'}}>手绘讲解视频</Big>
        <Big size={42} c={INK} w={500} style={{whiteSpace: 'nowrap'}}>带配音 + 字幕</Big>
      </div>
    </Abs>}
  </Root>;
};
Name.sfx = (cue) => {
  const p = namePlan(cue);
  return [{at: p.a, kind: 'stamp', gain: 0.12}, {at: 105, kind: 'whoosh-short', gain: 0.08}, ...[p.b, p.c, p.d].map((at) => ({at, kind: 'pop', gain: 0.1})),
    {at: p.e, kind: 'whoosh', gain: 0.1}];
};

/* ---------- 4 who it's for (re-hook): short of an illustrator? ---------- */

const whoPlan = (cue: Cue) => ({a: cue('a', 18), b: cue('b', 43), c: cue('c', 69), d: cue('d', 123)});
const Icon: React.FC<{k: 'bulb' | 'book' | 'talk'}> = ({k}) => <svg width={120} height={120} viewBox="0 0 24 24" fill="none" stroke={B} strokeWidth={1.6}
  strokeLinecap="round" strokeLinejoin="round">
  {k === 'bulb' && <><path d="M9 18h6M10 21h4" /><path d="M12 3a6 6 0 0 0-4 10.5c.8.8 1 1.5 1 2.5h6c0-1 .2-1.7 1-2.5A6 6 0 0 0 12 3z" /></>}
  {k === 'book' && <><path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z" /><path d="M4 21V5M8 7h7M8 11h7" /></>}
  {k === 'talk' && <><path d="M4 5h16v10H9l-5 4z" /><path d="M8 9h8M8 12h5" /></>}
</svg>;
const Who: Scene = ({f, cue}) => {
  const p = whoPlan(cue);
  const tiles = [{t: '知识科普', k: 'bulb' as const, at: p.a}, {t: '寓言故事', k: 'book' as const, at: p.b}, {t: '观点解读', k: 'talk' as const, at: p.c}];
  return <Root>
    <Abs y={-10} w={W}><Big size={92} style={{whiteSpace: 'nowrap'}}>缺画手？<span style={{color: A}}>它来画</span></Big></Abs>
    <Abs y={170} w={W} style={{display: 'flex', gap: 24}}>
      {tiles.map((t) => <div key={t.t} style={{width: 284}}><Pop f={f} at={t.at} origin="50% 100%">
        <div style={{height: 380, border: `4px solid ${B}`, background: 'rgba(18,38,61,0.9)', display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', gap: 24}}>
          <div style={{transform: `translateY(${-8 * Math.abs(Math.sin((f - t.at) / 9))}px)`}}><Icon k={t.k} /></div>
          <Big size={56} w={260} style={{textAlign: 'center', whiteSpace: 'nowrap'}}>{t.t}</Big>
        </div>
      </Pop></div>)}
    </Abs>
    <Abs y={640} w={W}><Pop f={f} at={p.d}><Chip c={A} size={72} fill>最缺画手 → 正好补上</Chip></Pop></Abs>
  </Root>;
};
Who.backdrop = ({f}) => <div style={{position: 'absolute', inset: 0, overflow: 'hidden'}}>
  <div style={{filter: 'blur(20px)', opacity: 0.35}}>
    <Film f={f} x={0} y={300} w={1080} h={1100} sx={280} sy={100} scale={2.6} drift={0.06} segs={[{still: 'f-d65', from: 0}]} tag={false} border="transparent" />
  </div>
  <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(rgba(9,17,31,0.85), rgba(9,17,31,0.55) 50%, rgba(9,17,31,0.9))'}} />
</div>;
Who.sfx = (cue) => {
  const p = whoPlan(cue);
  return [p.a, p.b, p.c].map((at) => ({at, kind: 'pop', gain: 0.12})).concat([{at: p.d, kind: 'stamp', gain: 0.14}]);
};

/* ---------- 5 how it draws: Agent illustrates, local tools trace then colour, characters in stroke order ---------- */

const howPlan = (cue: Cue) => ({a: cue('a', 76), b: cue('b', 151), c: cue('c', 174), d: cue('d', 197)});
const How: Scene = ({f, cue}) => {
  const p = howPlan(cue);
  const split = f >= p.b - 4;
  return <Root>
    <Abs y={-10} w={W} style={{display: 'flex', gap: 14, alignItems: 'center'}}>
      <Chip c={RED} size={52}><span style={{textDecoration: f >= 20 ? 'line-through' : 'none'}}>直接生成一段视频</span></Chip>
      <Pop f={f} at={p.a}><Chip c={B} size={52} fill>插画：Agent 生成</Chip></Pop>
    </Abs>
    {!split && <Film f={f} x={-60} y={120} w={1080} h={640} sx={300} sy={130} scale={2} segs={[{clip: '01b', src: 0.7, from: 0}]} border={B}>
      <Abs x={20} y={20}><Chip c={A} size={48} fill>本地工具 · 一笔一笔</Chip></Abs>
    </Film>}
    {split && <>
      <Film f={f} x={-60} y={120} w={1080} h={410} sx={0} sy={100} scale={1} segs={[{still: 'f-b40', from: 0}]} border={f >= p.b ? A : LINE} style={phaseOp(f, p.b - 4)}>
        <Abs x={20} y={16}><Pop f={f} at={p.b}><Chip c={A} size={60} fill>先描线</Chip></Pop></Abs>
      </Film>
      <Film f={f} x={-60} y={545} w={1080} h={410} sx={0} sy={100} scale={1} segs={[{still: 'f-b74', from: 0}]} border={f >= p.c ? GREEN : LINE} style={phaseOp(f, p.c - 4)}>
        <Abs x={20} y={16}><Pop f={f} at={p.c}><Chip c={GREEN} size={60} fill>后上色</Chip></Pop></Abs>
      </Film>
    </>}
    {f >= p.d - 1 && <Abs y={960} w={W}><Pop f={f} at={p.d}><Chip c={INK} size={52}>汉字按标准笔顺</Chip></Pop></Abs>}
  </Root>;
};
How.sfx = (cue) => {
  const p = howPlan(cue);
  return [{at: 20, kind: 'block', gain: 0.1}, {at: p.a, kind: 'pop', gain: 0.12}, {at: p.b, kind: 'whoosh-short', gain: 0.1}, {at: p.c, kind: 'whoosh-short', gain: 0.1},
    {at: p.d, kind: 'tick', gain: 0.1}];
};

/* ---------- 6 styles and hands ---------- */

const stylesPlan = (cue: Cue) => ({a: cue('a', 37), b: cue('b', 56), c: cue('c', 101)});
const STYLES = [{n: 'style_01', t: '极简黑白线条'}, {n: 'style_04', t: '小豆人信息图'}, {n: 'style_05', t: 'MS Paint 烂涂鸦'}, {n: 'style_17', t: '墨线绘本'},
  {n: 'style_19', t: '圆头红线童画'}, {n: 'style_20', t: '暖黄墨线小剧场'}];
const Styles: Scene = ({f, cue}) => {
  const p = stylesPlan(cue);
  const hands = f >= p.b - 2;
  return <Root>
    <Abs y={-10} w={W} style={{display: 'flex', gap: 14}}>
      <Pop f={f} at={Math.min(p.a, 4)}><Chip c={B} size={56} fill>21 个库内画风</Chip></Pop>
      {hands && <Pop f={f} at={p.b}><Chip c={A} size={56} fill>六款手臂 + 仅画笔</Chip></Pop>}
    </Abs>
    {!hands && <Abs x={-60} y={110} w={1080} style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12}}>
      {STYLES.map((s, i) => <div key={s.n} style={{position: 'relative', height: 270, overflow: 'hidden', background: '#f6f2ea', ...popIn(f, i * 3), transformOrigin: '50% 50%'}}>
        <Img src={IMG(s.n)} style={{width: '100%', height: '100%', objectFit: 'contain', transform: `scale(${1 + 0.06 * clamp(f / 60)})`}} />
        <div style={{position: 'absolute', left: 0, bottom: 0, background: 'rgba(9,17,31,0.88)', color: INK, fontFamily: font, fontWeight: 900, fontSize: 40,
          padding: '0 12px', whiteSpace: 'nowrap'}}>{s.t}</div>
      </div>)}
    </Abs>}
    {hands && <Abs x={-60} y={110} w={1080} style={{display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12}}>
      {[1, 2, 3, 4, 5, 6].map((k, i) => <div key={k} style={{height: 400, overflow: 'hidden', background: '#f6f2ea', ...popIn(f, p.b + i * 3), transformOrigin: '50% 100%'}}>
        <Img src={IMG(`hand${k}`)} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: '50% 20%',
          transform: `rotate(${2 * Math.sin((f + i * 9) / 10)}deg)`, transformOrigin: '50% 100%'}} />
      </div>)}
    </Abs>}
    {hands && <Abs y={950} w={W}><Pop f={f} at={p.c}><Chip c={INK} size={52}>也可以只露一支笔</Chip></Pop></Abs>}
    <CaseTag style={{bottom: hands ? 140 : 140, right: -60}} text="官方预览" />
  </Root>;
};
Styles.sfx = (cue) => {
  const p = stylesPlan(cue);
  return [{at: 4, kind: 'pop', gain: 0.1}, {at: p.b, kind: 'whoosh-short', gain: 0.1}, {at: p.c, kind: 'tick', gain: 0.1}];
};

/* ---------- 7 re-hook: three steps ---------- */

const threePlan = (cue: Cue) => ({a: cue('a', 48)});
const Three: Scene = ({f, cue}) => {
  const p = threePlan(cue);
  const n = f < p.a ? 1 + Math.min(2, Math.floor(f / 12)) : 3;
  return <Root>
    <Abs y={60} w={W} style={{textAlign: 'center'}}><Big size={96} w={W}>想自己试？</Big></Abs>
    <Abs y={240} w={W} style={{textAlign: 'center'}}>
      <div style={{fontFamily: mono, fontWeight: 800, fontSize: 420, lineHeight: 1, color: A, ...popIn(f, Math.floor(f / 12) * 12), transformOrigin: '50% 50%'}}>{n}</div>
    </Abs>
    <Abs y={720} w={W} style={{textAlign: 'center'}}><Pop f={f} at={p.a} origin="50% 50%"><Chip c={B} size={88} fill>三步就够</Chip></Pop></Abs>
  </Root>;
};
Three.sfx = (cue) => [{at: 0, kind: 'tick', gain: 0.1}, {at: 12, kind: 'tick', gain: 0.1}, {at: 24, kind: 'tick', gain: 0.1}, {at: threePlan(cue).a, kind: 'stamp', gain: 0.16}];

/* ---------- 8 step ① install ---------- */

const installPlan = (cue: Cue) => ({a: cue('a', 39), b: cue('b', 65), c: cue('c', 112)});
const CMD = 'npx skills add threerocks/sweety-handdraw-video --skill sweety-handdraw-video --agent claude-code codex --global --copy --yes';
const Install: Scene = ({f, cue}) => {
  const p = installPlan(cue);
  const t = typed(CMD, f, 20, 0.75);
  return <Root>
    <StepHead n="①" t="安装 Skill" />
    <Abs y={130} w={W} style={{display: 'flex', gap: 14, alignItems: 'center'}}>
      <Big size={48} c={DIM} w={70}>在</Big>
      <Pop f={f} at={p.a}><Chip c={B} size={56}>Codex</Chip></Pop>
      <Pop f={f} at={p.b}><Chip c={B} size={56}>Claude Code</Chip></Pop>
      {f >= p.b && <Big size={48} c={DIM} w={120}>里运行</Big>}
    </Abs>
    <Abs y={260} w={W} style={phaseOp(f, 6)}>
      <Terminal title="一条 npx 命令" c={f >= p.c ? A : B}>
        <span style={{color: A}}>$ </span>{t}<span style={{color: A, opacity: t.length < CMD.length && Math.floor(f / 8) % 2 ? 1 : 0}}>▍</span>
      </Terminal>
    </Abs>
    <Film f={f} x={0} y={640} w={W} h={250} sx={40} sy={120} scale={0.9} segs={[{clip: '01c', src: 0, from: 0}, {clip: '01c', src: 0, from: 122}]} />
    <Abs y={920} w={W}><Mono size={40} c={DIM} w={W}>以官方 README v1.3 为准</Mono></Abs>
  </Root>;
};
Install.sfx = (cue) => {
  const p = installPlan(cue);
  return [{at: p.a, kind: 'pop', gain: 0.1}, {at: p.b, kind: 'pop', gain: 0.1}, {at: 20, kind: 'tap', gain: 0.12}, {at: p.c, kind: 'stamp', gain: 0.1}];
};

/* ---------- 9 step ② check the environment ---------- */

const setupPlan = (cue: Cue) => ({a: cue('a', 59), b: cue('b', 98), c: cue('c', 137), d: cue('d', 155), e: cue('e', 178)});
const Setup: Scene = ({f, cue}) => {
  const p = setupPlan(cue);
  const doctor = f >= p.e + 24;
  return <Root>
    <StepHead n="②" t="检查环境" />
    <Abs y={130} w={W} style={phaseOp(f, 4)}>
      <Terminal title="setup 脚本" c={f >= p.a && !doctor ? A : B}>
        {typed('bash ~/.claude/skills/sweety-handdraw-video/scripts/setup.sh --check', f, 6, 0.75)}
      </Terminal>
    </Abs>
    <Abs y={470} w={W} style={{display: 'flex', gap: 14}}>
      <Pop f={f} at={p.b}><Chip c={GREEN} size={54}>FFmpeg ✓</Chip></Pop>
      <Pop f={f} at={p.c}><Chip c={GREEN} size={54}>Python ✓</Chip></Pop>
      <Pop f={f} at={p.d}><Chip c={GREEN} size={54}>中文字体 ✓</Chip></Pop>
    </Abs>
    <Abs y={590} w={W}><Pop f={f} at={p.e}><Chip c={A} size={58} fill>不会自动下载语音大模型</Chip></Pop></Abs>
    {!doctor && <Film f={f} x={0} y={720} w={W} h={290} sx={60} sy={110} scale={0.9} segs={[{clip: '01a', src: 0.5, from: 0}]} style={{opacity: 1 - clamp((f - p.e - 14) / 10)}} />}
    {doctor && <Abs y={720} w={W} style={phaseOp(f, p.e + 24)}>
      <Terminal title="还缺什么？" c={A}>python scripts/handdraw_video.py doctor JOB</Terminal>
    </Abs>}
  </Root>;
};
Setup.sfx = (cue) => {
  const p = setupPlan(cue);
  return [{at: p.a, kind: 'tap', gain: 0.12}, ...[p.b, p.c, p.d].map((at) => ({at, kind: 'tick', gain: 0.1})), {at: p.e, kind: 'stamp', gain: 0.12},
    {at: p.e + 24, kind: 'whoosh-short', gain: 0.08}];
};

/* ---------- 10 step ③ run a short one first (the official starter prompt) ---------- */

const firstPlan = (cue: Cue) => ({a: cue('a', 35), b: cue('b', 80), c: cue('c', 119), d: cue('d', 167)});
const PROMPT: {t: string; k?: 'b' | 'c' | 'd'}[] = [{t: '使用 $sweety-handdraw-video', k: 'b'}, {t: '，把“为什么越生气，越容易做错决定”做成一段面向普通成年人的手绘讲解。先讲清楚一个机制，'},
  {t: '控制在约一分钟', k: 'c'}, {t: '。'}, {t: '画风、手部、声音和字幕由你根据内容选择', k: 'd'}, {t: '，不加广告和水印。'}];
const First: Scene = ({f, cue}) => {
  const p = firstPlan(cue);
  return <Root>
    <StepHead n="③" t="先跑一条短的" />
    <Abs y={120} w={W}><Pop f={f} at={p.a}><Chip c={RED} size={52}><span style={{textDecoration: 'line-through'}}>长文章</span> ✗ 先跑短主题</Chip></Pop></Abs>
    <Abs y={230} w={W} style={{...phaseOp(f, 4), border: `4px solid ${B}`, background: '#07101c', padding: '16px 22px'}}>
      <div style={{fontFamily: font, fontWeight: 700, fontSize: 40, color: DIM}}>官方示例提示词 · 发给 Agent</div>
      <div style={{fontFamily: font, fontWeight: 700, fontSize: 42, lineHeight: 1.45, color: CODE}}>
        {PROMPT.map((s, i) => <span key={i} style={s.k && f >= p[s.k] ? {color: BG, background: s.k === 'c' ? A : B} : undefined}>{s.t}</span>)}
      </div>
    </Abs>
    <Abs y={640} w={W} style={{display: 'flex', flexDirection: 'column', gap: 4, fontFamily: font, fontWeight: 700, fontSize: 40, color: B, whiteSpace: 'nowrap'}}>
      <div>Codex 用 $sweety-handdraw-video</div>
      <div>Claude Code 用 /sweety-handdraw-video</div>
    </Abs>
    <Film f={f} x={480} y={760} w={420} h={170} sx={0} sy={100} scale={420 / 1080} segs={[{clip: '01a', src: 2.0, from: 0}]} />
    <Abs y={770} w={460}><Pop f={f} at={p.d}><Chip c={A} size={44} fill>确认画风和声音</Chip></Pop><Pop f={f} at={p.d + 6}><Chip c={A} size={44} fill style={{marginTop: 12}}>→ 再做长的</Chip></Pop></Abs>
  </Root>;
};
First.sfx = (cue) => {
  const p = firstPlan(cue);
  return [{at: p.a, kind: 'block', gain: 0.12}, {at: p.b, kind: 'tick', gain: 0.1}, {at: p.c, kind: 'tick', gain: 0.1}, {at: p.d, kind: 'pop', gain: 0.12}];
};

/* ---------- 11 what you get; fixing a subtitle reuses approved images and voice ---------- */

const outPlan = (cue: Cue) => ({a: cue('a', 50), b: cue('b', 84), c: cue('c', 102), d: cue('d', 136), e: cue('e', 157), f: cue('f', 217)});
const Outputs: Scene = ({f, cue}) => {
  const p = outPlan(cue);
  const items = [{t: 'MP4 成片', at: p.a}, {t: '封面 PNG', at: p.b}, {t: 'SRT 字幕', at: p.c}, {t: '口播稿', at: p.d}];
  return <Root>
    <Abs y={-10} w={W}><Big size={72} style={{whiteSpace: 'nowrap'}}>你会拿到什么</Big></Abs>
    <Film f={f} x={-60} y={110} w={1080} h={400} sx={60} sy={110} scale={1.05} drift={0.3}
      segs={[{clip: '01d', src: 0.4, from: 0}, {still: 'f-b74', from: p.b}, {clip: '01c', src: 2.2, from: p.c}, {clip: '01d', src: 2.0, from: p.d}, {clip: '01b', src: 4.0, from: p.f}]}>
      <Abs x={20} y={14}><Chip c={A} size={44} fill>{items.filter((it) => f >= it.at).at(-1)?.t ?? 'MP4 成片'}</Chip></Abs>
    </Film>
    <Abs y={540} w={W} style={{display: 'flex', flexWrap: 'wrap', gap: 12}}>
      {items.map((it) => <div key={it.t} style={{opacity: f >= it.at ? 1 : 0.3}}>
        <div style={f >= it.at ? {...popIn(f, it.at), transformOrigin: '0% 50%'} : undefined}>
          <Chip c={f >= it.at ? GREEN : LINE} size={50}>{f >= it.at ? '✓ ' : ''}{it.t}</Chip>
        </div>
      </div>)}
    </Abs>
    <Abs y={720} w={W} style={{display: 'flex', alignItems: 'center', gap: 16}}>
      <Pop f={f} at={p.e}><Chip c={B} size={64}>改字幕</Chip></Pop>
      {f >= p.e && <Big size={72} c={A} w={60}>≠</Big>}
      {f >= p.e && <div style={{position: 'relative', ...popIn(f, p.e + 6), transformOrigin: '0% 50%'}}>
        <Chip c={RED} size={64}>整片重做</Chip>
        <div style={{position: 'absolute', left: -6, top: '50%', height: 8, width: `${100 * ease.inOutCubic(clamp((f - p.e - 14) / 10))}%`, background: RED}} />
      </div>}
    </Abs>
    <Abs y={870} w={W}><Pop f={f} at={p.f}><Chip c={GREEN} size={56} fill>已通过的插画和配音 直接复用</Chip></Pop></Abs>
  </Root>;
};
Outputs.sfx = (cue) => {
  const p = outPlan(cue);
  return [p.a, p.b, p.c, p.d].map((at) => ({at, kind: 'tick', gain: 0.1})).concat([{at: p.e + 14, kind: 'block', gain: 0.12}, {at: p.f, kind: 'stamp', gain: 0.12}]);
};

/* ---------- 12 four things to know first ---------- */

const pitPlan = (cue: Cue) => ({a: cue('a', 58), b: cue('b', 127), c: cue('c', 214), d: cue('d', 288)});
const PITS = [{t: '只支持 macOS 和 Linux', s: 'Windows 未承诺'}, {t: '完整流程只在 Codex 上实测', s: ''}, {t: 'Claude Code 需自备生图工具', s: ''},
  {t: '需要一条配音路径', s: '本机语音模型或现成旁白'}];
const Pitfalls: Scene = ({f, cue}) => {
  const p = pitPlan(cue);
  const ats = [p.a, p.b, p.c, p.d];
  const cur = ats.filter((at) => f >= at).length - 1;
  return <Root>
    <Abs y={-10} w={W}><Big size={76} style={{whiteSpace: 'nowrap'}}>上手前先看这 <span style={{color: A}}>4</span> 条</Big></Abs>
    <Abs y={130} w={W} style={{display: 'flex', flexDirection: 'column', gap: 26}}>
      {PITS.map((it, i) => {
        const on = i === cur;
        const seen = f >= ats[i];
        return <div key={it.t} style={{border: `4px solid ${on ? A : seen ? LINE : '#1b2a3f'}`, padding: '24px 20px',
          background: on ? `linear-gradient(90deg, rgba(255,171,64,0.08), rgba(255,171,64,0.28) ${(f * 3) % 140 - 20}%, rgba(255,171,64,0.08))` : PANEL,
          opacity: seen ? 1 : 0.4, transform: `scale(${on ? 1 + 0.02 * hitOf(f, [ats[i]], 1) : 1})`, transformOrigin: '0% 50%'}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 16}}>
            <div style={{fontFamily: mono, fontWeight: 800, fontSize: 56, color: on ? A : DIM, width: 70}}>{'①②③④'[i]}</div>
            <Big size={56} c={seen ? INK : DIM} w={760} style={{whiteSpace: 'nowrap'}}>{it.t}</Big>
          </div>
          {it.s && <div style={{marginLeft: 86, fontFamily: font, fontWeight: 700, fontSize: 46, color: DIM}}>{it.s}</div>}
        </div>;
      })}
    </Abs>
    {f >= p.d && <svg width={W} height={260} style={{position: 'absolute', left: 0, top: 730, opacity: clamp((f - p.d) / 10)}}>
      {Array.from({length: 30}, (_, i) => {
        const h = 30 + 220 * Math.abs(Math.sin(i * 0.7 + f / 3) * Math.sin(i * 0.23 + f / 7));
        return <rect key={i} x={i * 30} y={130 - h / 2} width={20} height={h} rx={10} fill={i % 2 ? A : B} opacity={0.9} />;
      })}
    </svg>}
    <div style={{position: 'absolute', left: 0, top: 1000, width: W, height: 12, background: PANEL}}>
      <div style={{height: '100%', width: `${100 * clamp(f / 400)}%`, background: A}} />
    </div>
  </Root>;
};
Pitfalls.sfx = (cue) => {
  const p = pitPlan(cue);
  return [p.a, p.b, p.c, p.d].map((at) => ({at, kind: 'tap', gain: 0.12}));
};

/* ---------- 13 end: label it as AI-generated ---------- */

const endPlan = (cue: Cue) => ({a: cue('a', 61)});
const End: Scene = ({f, cue}) => {
  const p = endPlan(cue);
  return <Root>
    <Abs y={-10} w={W}><Big size={76} style={{whiteSpace: 'nowrap'}}>发布记得标注 <span style={{color: A}}>AI 生成</span></Big></Abs>
    <Film f={f} x={-60} y={130} w={1080} h={700} sx={180} sy={100} scale={1.6} drift={0.1} segs={[{still: 'f-d65', from: 0}]} tag={false} />
    <Abs y={860} w={W}><Pop f={f} at={p.a}><Chip c={A} size={60} fill>作品声明 → 内容由AI生成</Chip></Pop></Abs>
    <CaseTag text="案例展示 · AI 生成内容" style={{bottom: 290, right: -60}} />
  </Root>;
};
End.sfx = (cue) => [{at: endPlan(cue).a, kind: 'chime', gain: 0.14}];

/* ---------- covers (anchor box 880 × 800) ---------- */

const Cover67: Scene = () => <div style={{position: 'relative', width: 880, height: 800}}>
  <Film f={0} x={-100} y={60} w={1080} h={700} sx={200} sy={100} scale={1.6} segs={[{still: 'f-b74', from: 0}]} />
</div>;
const Cover34: Scene = () => <div style={{position: 'relative', width: 880, height: 800}}>
  <Film f={0} x={-100} y={0} w={1080} h={800} sx={250} sy={100} scale={1.85} segs={[{still: 'f-d65', from: 0}]} />
</div>;

export const sweetyHanddrawScenes: Record<string, Scene> = {
  'sh.hook': Hook,
  'sh.auto': Auto,
  'sh.name': Name,
  'sh.who': Who,
  'sh.how': How,
  'sh.styles': Styles,
  'sh.three': Three,
  'sh.install': Install,
  'sh.setup': Setup,
  'sh.first': First,
  'sh.outputs': Outputs,
  'sh.pitfalls': Pitfalls,
  'sh.end': End,
  'sh.cover67': Cover67,
  'sh.cover34': Cover34,
};
