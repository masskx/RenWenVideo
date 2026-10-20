import React from 'react';
import {Img, OffthreadVideo, Sequence, staticFile} from 'remotion';
import {font} from '../theme';
import {clamp, ease, springStep, springTrack} from '../../fx';
import {Cue, S, Scene, hitOf, phaseOp} from '../paper';
import {A, B, BG, Big, DIM, INK, LINE, PANEL, mono} from '../tech';

// deepseek-claude-code-video: wire DeepSeek into Claude Code, then make an animated video with one prompt (≈ 2 min, length override in the script).
// Script: inputs/deepseek-claude-code-video/script.md; storyboard: tutorials/deepseek-claude-code-video.storyboard.md. Narration and on-screen copy are verbatim.
// Cards 01–07 are the package's pre-rendered terminal cards (1080 px wide, 40 px type): always shown at 1:1 across the full canvas width,
// cropped vertically, with highlight boxes placed on their measured text rows. Footage is pre-trimmed to the script's in/out windows
// (caseA corrected to 12.4–18.4 s and 30–44 s, where the shots the script describes really are), muted, labelled 「案例展示」 top-left, no creator names.

const W = 900;
const RED = '#ff5a5a';
const GREEN = '#4ade80';
const CARD = '#121826';
const CLIP = (n: string) => staticFile(`video/deepseek-claude-code-video/${n}.mp4`);
const IMG = (n: string) => staticFile(`images/tutorials/deepseek-claude-code-video/${n}`);

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
const CaseTag: React.FC<{text?: string}> = ({text = '案例展示'}) => (
  <div style={{position: 'absolute', left: 0, top: 0, background: 'rgba(9,17,31,0.85)', color: INK, fontFamily: font, fontWeight: 700, fontSize: 40,
    padding: '0 12px', whiteSpace: 'nowrap'}}>{text}</div>
);
const Note: React.FC<{text?: string}> = ({text = '界面示意'}) => (
  <div style={{position: 'absolute', right: 0, bottom: 0, background: 'rgba(9,17,31,0.85)', color: DIM, fontFamily: font, fontWeight: 700, fontSize: 40,
    padding: '0 12px', whiteSpace: 'nowrap'}}>{text}</div>
);
const Title: React.FC<{children: React.ReactNode; size?: number}> = ({children, size = 76}) => (
  <Abs y={-10} w={W}><Big size={size} style={{whiteSpace: 'nowrap'}}>{children}</Big></Abs>
);

/**
 * A window onto a muted clip: the source frame (srcW × srcH) is drawn at `scale`, source pixel row `sy` at the box top
 * (horizontally centred), with an optional slow push-in (`zoom` reached at frame `zoomDur`). Segments play one after another.
 */
type Seg = {clip: string; from: number; to?: number};
const Clip: React.FC<{f: number; segs: Seg[]; x: number; y: number; w: number; h: number; srcW: number; srcH: number; scale: number; sy?: number;
  zoom?: number; zoomDur?: number; tag?: boolean; border?: string; style?: React.CSSProperties; children?: React.ReactNode}> = ({f, segs, x, y, w, h, srcW, srcH,
  scale, sy = 0, zoom = 1, zoomDur = 180, tag = true, border = LINE, style, children}) => {
  const z = 1 + (zoom - 1) * clamp(f / zoomDur);
  const vw = srcW * scale, vh = srcH * scale;
  return <div style={{position: 'absolute', left: x, top: y, width: w, height: h, overflow: 'hidden', background: '#000', outline: `3px solid ${border}`, ...style}}>
    <div style={{position: 'absolute', inset: 0, transform: `scale(${z})`, transformOrigin: '50% 50%'}}>
      {segs.map((s, i) => {
        const end = s.to ?? segs[i + 1]?.from ?? 1e5;
        if (f < s.from || f >= end) return null;
        return <Sequence key={i} from={s.from} layout="none">
          <OffthreadVideo src={CLIP(s.clip)} muted style={{position: 'absolute', left: (w - vw) / 2, top: -sy * scale, width: vw, height: vh}} />
        </Sequence>;
      })}
    </div>
    {children}
    {tag && <CaseTag />}
  </div>;
};

/**
 * A package card across the canvas (stage x −60), cropped to image rows sy … sy + h; children are placed in image pixels.
 * `cam` keys push in on the row being explained (image row `y` to the window centre at zoom `z` ≥ 1, never smaller than 1:1,
 * zooming about the card's left text margin so lines stay inside the frame); the view is clamped to the card (`imgH` rows).
 */
type CamK = {at: number; y: number; z: number};
const Card: React.FC<{f?: number; src: string; y: number; h: number; sy: number; imgH?: number; cam?: CamK[]; style?: React.CSSProperties;
  children?: React.ReactNode}> = ({f = 0, src, y, h, sy, imgH = 1e4, cam = [], style, children}) => {
  const o = {f: 1.3, z: 0.88};
  const z = springTrack(S(f), 1, cam.map((k) => ({at: S(k.at), to: k.z})), o);
  const cy = springTrack(S(f), sy + h / 2, cam.map((k) => ({at: S(k.at), to: k.y})), o);
  const top = cam.length ? Math.max(0, Math.min(imgH - h / z, cy - h / (2 * z))) : sy;
  return <div style={{position: 'absolute', left: -60, top: y, width: 1080, height: h, overflow: 'hidden', ...style}}>
    <div style={{position: 'absolute', left: 0, top: 0, width: 1080, transform: `translate(${60 * (1 - z)}px, ${-top * z}px) scale(${z})`, transformOrigin: '0 0'}}>
      <Img src={IMG(src)} style={{display: 'block', width: 1080}} />
      {children}
    </div>
  </div>;
};
/** Highlight box on a card row (image px). `focus` dims everything else on the card. */
const Mark: React.FC<{f: number; at: number; until?: number; x?: number; y: number; w?: number; h: number; c?: string; focus?: boolean}> = ({f, at, until = 1e9,
  x = 70, y, w = 900, h, c = A, focus}) => {
  if (f < at - 1 || f >= until + 8) return null;
  const k = springStep(S(f), S(at), {f: 2.8, z: 0.6});
  const out = clamp((f - until) / 8);
  const sq = hitOf(f, [at + 3], 1);
  return <div style={{position: 'absolute', left: x, top: y, width: w, height: h, border: `5px solid ${c}`, borderRadius: 10, opacity: clamp(k * 2) * (1 - out),
    transform: `scale(${(1.08 - 0.08 * k) * (1 + 0.015 * sq)})`, boxShadow: focus ? '0 0 0 2400px rgba(6,11,20,0.5)' : undefined}} />;
};
/** Typewriter over a card row: a card-coloured cover slides off the text from x0 to x1 between frames `at` and `at + dur`. */
const TypeOn: React.FC<{f: number; at: number; dur: number; y: number; h?: number; x0?: number; x1: number}> = ({f, at, dur, y, h = 58, x0 = 88, x1}) => {
  const p = clamp((f - at) / dur);
  if (p >= 1) return null;
  const left = x0 + (x1 - x0) * p;
  return <>
    <div style={{position: 'absolute', left, top: y - 6, width: 1030 - left, height: h, background: CARD}} />
    {f >= at && <div style={{position: 'absolute', left: left + 2, top: y - 2, width: 6, height: h - 10, background: A, opacity: Math.floor(f / 6) % 2 ? 1 : 0.3}} />}
  </>;
};

/* ---------- 1 hook: the 289,000 → 1,000,000 counter, made by Claude Code on DeepSeek ---------- */

const hookPlan = (cue: Cue) => ({a: cue('a', 18), b: cue('b', 60)});
const Hook: Scene = ({f, cue}) => {
  const p = hookPlan(cue);
  return <Root>
    <Abs y={-10} w={W}><div style={{fontFamily: mono, fontWeight: 800, fontSize: 70, color: INK, whiteSpace: 'nowrap'}}>
      <span style={{color: B}}>DeepSeek</span> + <span style={{color: A}}>Claude Code</span></div></Abs>
    <Abs y={90} w={W}><Big size={124} style={{whiteSpace: 'nowrap'}}>一句话<span style={{position: 'relative', display: 'inline-block'}}>
      <span style={{position: 'absolute', left: -8, right: -8, top: 14, bottom: 4, background: A, transform: `scaleX(${ease.outCubic(clamp((f - p.a) / 12))})`,
        transformOrigin: 'left'}} />
      <span style={{position: 'relative', color: f >= p.a + 6 ? BG : INK}}>出动画</span></span></Big></Abs>
    <Clip f={f} x={-60} y={290} w={1080} h={608} srcW={1280} srcH={720} scale={1080 / 1280} zoom={1.12} zoomDur={180} segs={[{clip: 'a-hook', from: 0}]}
      border={f >= p.a ? B : LINE} />
    <Abs y={940} w={W}><Pop f={f} at={p.b}><Chip c={A} size={64} fill>Claude 会员：¥0</Chip></Pop></Abs>
  </Root>;
};
Hook.sfx = (cue) => [{at: hookPlan(cue).a, kind: 'tick', gain: 0.1}, {at: hookPlan(cue).b, kind: 'stamp', gain: 0.14}];

/* ---------- 2 intro: V4.1 just shipped, people are making animations; 4 steps ---------- */

const introPlan = (cue: Cue) => ({a: cue('a', 120), b: cue('b', 170)});
const Intro: Scene = ({f, cue}) => {
  const p = introPlan(cue);
  const steps = ['安装', '配置', '验证', '出片'];
  return <Root>
    <Clip f={f} x={-60} y={0} w={1080} h={480} srcW={1280} srcH={720} scale={1080 / 1280} sy={64} segs={[{clip: 'b-intro', from: 0}]}
      style={{transform: `translateX(${-1080 * (1 - ease.outCubic(clamp(f / 12)))}px)`}} />
    <Clip f={f} x={-60} y={500} w={1080} h={480} srcW={720} srcH={1080} scale={1.5} sy={380} segs={[{clip: 'c-intro', from: 0}]}
      style={{transform: `translateX(${1080 * (1 - ease.outCubic(clamp((f - 4) / 12)))}px)`}} />
    {f >= p.a - 1 && <Abs y={380} w={W} style={{textAlign: 'center'}}>
      <div style={{display: 'inline-block', ...popIn(f, p.a), transformOrigin: '50% 50%'}}>
        <Chip c={A} size={130} fill style={{transform: 'rotate(-4deg)', padding: '6px 40px', border: `8px solid ${BG}`}}>4 步搭好</Chip>
      </div>
    </Abs>}
    {f >= p.b - 1 && <Abs y={1000} w={W} style={{display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center'}}>
      {steps.map((s, i) => <React.Fragment key={s}>
        {i > 0 && <Big size={48} c={DIM} w={700} style={{opacity: clamp((f - p.b - i * 5) / 6)}}>→</Big>}
        <Pop f={f} at={p.b + i * 5} origin="50% 50%"><Chip c={B} size={56}>{s}</Chip></Pop>
      </React.Fragment>)}
    </Abs>}
  </Root>;
};
Intro.sfx = (cue) => {
  const p = introPlan(cue);
  return [{at: 0, kind: 'whoosh-short', gain: 0.1}, {at: p.a, kind: 'stamp', gain: 0.16}, ...[0, 1, 2, 3].map((i) => ({at: p.b + i * 5, kind: 'tick', gain: 0.1}))];
};

/* ---------- 3 step 1: install ---------- */

const StepHead: React.FC<{n: string; t: string; extra?: React.ReactNode}> = ({n, t, extra}) => (
  <Abs y={-6} w={W} style={{display: 'flex', alignItems: 'center', gap: 18, whiteSpace: 'nowrap'}}>
    <div style={{width: 92, height: 92, borderRadius: 46, background: A, color: BG, fontFamily: mono, fontWeight: 800, fontSize: 60, lineHeight: '92px',
      textAlign: 'center'}}>{n}</div>
    <Big size={72} w={900}>{t}</Big>
    {extra}
  </Abs>
);

const installPlan = (cue: Cue) => ({a: cue('a', 70), b: cue('b', 160), c: cue('c', 260), d: cue('d', 330)});
const Install: Scene = ({f, cue}) => {
  const p = installPlan(cue);
  return <Root>
    <StepHead n="1" t="第一步：安装" />
    <Card f={f} src="01_install.png" y={120} h={940} sy={40} imgH={1000} style={phaseOp(f, 0)}
      cam={[{at: 0, y: 300, z: 1.12}, {at: p.a - 6, y: 296, z: 1.3}, {at: p.b - 6, y: 544, z: 1.3}, {at: p.c - 6, y: 790, z: 1.3}]}>
      <Mark f={f} at={p.a} until={p.b} y={232} h={128} w={600} focus />
      <Mark f={f} at={p.b} until={p.c} y={480} h={128} w={600} focus />
      <Mark f={f} at={p.c} until={p.d} y={728} h={64} w={420} focus />
      <Mark f={f} at={p.d} y={728} h={128} w={500} c={GREEN} focus />
      {f >= p.d && <Abs x={620} y={770} w={400}><Pop f={f} at={p.d + 4}><Chip c={GREEN} size={56} fill>✓ 有版本号</Chip></Pop></Abs>}
    </Card>
  </Root>;
};
Install.sfx = (cue) => {
  const p = installPlan(cue);
  return [{at: p.a, kind: 'tap', gain: 0.1}, {at: p.b, kind: 'tap', gain: 0.1}, {at: p.c, kind: 'tap', gain: 0.1}, {at: p.d + 4, kind: 'chime', gain: 0.12}];
};

/* ---------- 4 step 2: API key (mock platform card) ---------- */

const keyPlan = (cue: Cue) => ({a: cue('a', 60), b: cue('b', 95), c: cue('c', 140)});
const Btn: React.FC<{on: boolean; c?: string; children: React.ReactNode}> = ({on, c = B, children}) => (
  <div style={{display: 'inline-block', padding: '8px 26px', borderRadius: 12, border: `4px solid ${c}`, background: on ? c : 'transparent', color: on ? BG : c,
    fontFamily: font, fontWeight: 900, fontSize: 52, whiteSpace: 'nowrap'}}>{children}</div>
);
const Key: Scene = ({f, cue}) => {
  const p = keyPlan(cue);
  const keyText = 'sk-xxxx••••••••';
  const shown = keyText.slice(0, Math.max(0, Math.floor((f - p.b - 6) * 1.2)));
  const press = (at: number) => 1 - 0.06 * hitOf(f, [at], 1);
  return <Root>
    <StepHead n="2" t="第二步：拿 API Key" />
    <div style={{position: 'absolute', left: -20, top: 130, width: 940, height: 720, background: PANEL, border: `3px solid ${LINE}`, borderRadius: 16, overflow: 'hidden',
      ...phaseOp(f, 0), transform: `translateY(${300 * (1 - ease.outCubic(clamp(f / 14)))}px) scale(${(1 + 0.35 * (1 - ease.inOutCubic(clamp((f - 20) / 40)))) * (1 + 0.06 * hitOf(f, [p.a, p.b, p.c], 0.5))})`,
      transformOrigin: '0 0'}}>
      <div style={{height: 100, display: 'flex', alignItems: 'center', gap: 16, padding: '0 30px', borderBottom: `2px solid ${LINE}`}}>
        <div style={{fontFamily: font, fontWeight: 900, fontSize: 52, color: B}}>DeepSeek 开放平台</div>
      </div>
      <div style={{padding: '34px 30px', display: 'flex', flexDirection: 'column', gap: 40}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 24, ...phaseOp(f, 14)}}>
          <Big size={48} c={DIM} w={700}>余额</Big>
          <div style={{transform: `scale(${press(p.a)})`}}><Btn on={f >= p.a} c={A}>充值</Btn></div>
          {f >= p.a && <Pop f={f} at={p.a + 6}><Big size={48} c={A} w={800}>充几块钱就够</Big></Pop>}
        </div>
        <div style={{height: 2, background: LINE}} />
        <div style={{display: 'flex', alignItems: 'center', gap: 24, ...phaseOp(f, 34)}}>
          <Big size={48} c={INK} w={800}>API Keys</Big>
          <Big size={48} c={DIM} w={700}>→</Big>
          <div style={{transform: `scale(${press(p.b)})`}}><Btn on={f >= p.b}>创建 API Key</Btn></div>
        </div>
        <div style={{display: 'flex', alignItems: 'center', gap: 20, minHeight: 90, ...phaseOp(f, 54), opacity: f >= p.b ? 1 : f >= 54 ? 0.25 : 0}}>
          <div style={{flex: 1, padding: '10px 20px', border: `3px dashed ${f >= p.c ? GREEN : LINE}`, borderRadius: 10, fontFamily: mono, fontWeight: 700, fontSize: 50,
            color: GREEN, whiteSpace: 'nowrap', minHeight: 64}}>{shown}</div>
          <div style={{transform: `scale(${press(p.c)})`}}><Btn on={f >= p.c} c={GREEN}>{f >= p.c ? '已复制 ✓' : '复制'}</Btn></div>
        </div>
      </div>
      <Note />
    </div>
    <Abs y={900} w={W}><Pop f={f} at={p.c + 12}><Chip c={RED} size={64} fill>别把 Key 发给任何人</Chip></Pop></Abs>
  </Root>;
};
Key.sfx = (cue) => {
  const p = keyPlan(cue);
  return [{at: p.a, kind: 'tap', gain: 0.12}, {at: p.b, kind: 'tap', gain: 0.12}, {at: p.c, kind: 'pop', gain: 0.12}, {at: p.c + 12, kind: 'block', gain: 0.12}];
};

/* ---------- 5 step 3: environment variables (the key step) ---------- */

const envPlan = (cue: Cue) => ({a: cue('a', 90), b: cue('b', 200), c: cue('c', 280), d: cue('d', 390), e: cue('e', 500), f: cue('f', 570)});
const Env: Scene = ({f, cue}) => {
  const p = envPlan(cue);
  const mac = f >= p.f - 4;
  // pan the 1220 px card inside an 860 px window: start at the top rows, glide down for the model block and the effort line
  const pan = 150 + 140 * springStep(S(f), S(p.c - 6), {f: 1.4, z: 0.85}) + 70 * springStep(S(f), S(p.e - 6), {f: 1.4, z: 0.85});
  const bracketK = clamp((f - p.c) / 10);
  return <Root>
    <StepHead n="3" t="第三步：配置环境变量" />
    <Abs y={104} w={W} style={{display: 'flex', gap: 14}}>
      {['BASE_URL', 'TOKEN', 'MODEL'].map((t, i) => {
        const at = [p.a, p.b, p.c][i];
        return <div key={t} style={{fontFamily: mono, fontWeight: 800, fontSize: 44, padding: '0 14px', border: `3px solid ${f >= at ? A : LINE}`,
          color: f >= at ? A : DIM, background: BG}}>{t}</div>;
      })}
      {mac && <Pop f={f} at={p.f}><Chip c={B} size={44} fill>苹果：export</Chip></Pop>}
    </Abs>
    {!mac && <Card f={f} src="02_env_ps.png" y={200} h={870} sy={pan} style={phaseOp(f, 0, p.f - 4)}>
      <Mark f={f} at={p.a} until={p.b} y={172} h={124} focus />
      <Mark f={f} at={p.b} until={p.c} y={296} h={124} w={700} focus />
      <Mark f={f} at={p.c} until={p.e} y={420} h={496} focus />
      {f >= p.c && <div style={{position: 'absolute', left: 990, top: 420, width: 30, height: 496 * bracketK, borderRight: `6px solid ${A}`, borderTop: `6px solid ${A}`,
        borderBottom: bracketK >= 1 ? `6px solid ${A}` : undefined}} />}
      {[494, 618, 742].map((y) => <Mark key={y} f={f} at={p.d} until={p.e} x={392} y={y - 8} w={112} h={58} c={B} />)}
      {f >= p.d && f < p.e + 8 && <Abs x={560} y={470} w={420}><Pop f={f} at={p.d + 6}><Chip c={B} size={48} fill>[1m] = 100 万上下文</Chip></Pop></Abs>}
      <Mark f={f} at={p.e} y={1040} h={64} focus />
      {f >= p.e && <Abs x={640} y={962} w={380}><Pop f={f} at={p.e + 6}><Chip c={A} size={48} fill>思考强度 max</Chip></Pop></Abs>}
    </Card>}
    {mac && <Card f={f} src="03_env_mac.png" y={200} h={680} sy={40} imgH={760} style={phaseOp(f, p.f - 4)} cam={[{at: p.f + 10, y: 360, z: 1.08}]}>
      {[176, 298, 362, 486].map((y, i) => <Mark key={y} f={f} at={p.f + 4 + i * 4} x={80} y={y} w={138} h={62} c={B} />)}
    </Card>}
  </Root>;
};
Env.sfx = (cue) => {
  const p = envPlan(cue);
  return [p.a, p.b, p.c].map((at) => ({at, kind: 'tap', gain: 0.11})).concat([{at: p.d, kind: 'tick', gain: 0.1}, {at: p.e, kind: 'tap', gain: 0.11},
    {at: p.f - 4, kind: 'whoosh-short', gain: 0.1}]);
};

/* ---------- 6 step 4: verify ---------- */

const verifyPlan = (cue: Cue) => ({a: cue('a', 60), b: cue('b', 110), c: cue('c', 220), d: cue('d', 290)});
const Verify: Scene = ({f, cue}) => {
  const p = verifyPlan(cue);
  return <Root>
    <StepHead n="4" t="第四步：验证接通" />
    <Card f={f} src="04_verify.png" y={130} h={640} sy={40} imgH={720} style={phaseOp(f, 0)}
      cam={[{at: 0, y: 240, z: 1.3}, {at: p.b - 4, y: 400, z: 1.3}, {at: p.c - 6, y: 540, z: 1.3}, {at: p.d, y: 380, z: 1.05}]}>
      <TypeOn f={f} at={4} dur={24} y={184} x1={715} />
      <TypeOn f={f} at={p.a} dur={10} y={246} x1={250} />
      <TypeOn f={f} at={p.b} dur={26} y={369} x1={545} />
      {f < p.c && <div style={{position: 'absolute', left: 80, top: 480, width: 940, height: 130, background: CARD}} />}
      {f >= p.b + 26 && f < p.c && <div style={{position: 'absolute', left: 92, top: 490, display: 'flex', gap: 18, alignItems: 'center'}}>
        {[0, 1, 2].map((i) => <div key={i} style={{width: 26, height: 26, borderRadius: 13, background: B,
          opacity: 0.3 + 0.7 * Math.max(0, Math.sin((f - i * 5) / 5))}} />)}
        <span style={{fontFamily: font, fontWeight: 700, fontSize: 44, color: DIM, marginLeft: 10}}>思考中</span>
      </div>}
      <Mark f={f} at={p.c} y={478} h={132} w={660} c={GREEN} />
      <Note />
    </Card>
    <Abs y={830} w={W} style={{textAlign: 'center'}}><Pop f={f} at={p.d} origin="50% 50%"><Chip c={GREEN} size={88} fill>✓ 接通了</Chip></Pop></Abs>
  </Root>;
};
Verify.sfx = (cue) => {
  const p = verifyPlan(cue);
  return [{at: p.a, kind: 'tick', gain: 0.1}, {at: p.b, kind: 'tick', gain: 0.1}, {at: p.c, kind: 'pop', gain: 0.12}, {at: p.d, kind: 'chime', gain: 0.14}];
};

/* ---------- 7 one-sentence prompt (typewriter, keywords highlighted) ---------- */

const promptPlan = (cue: Cue) => ({a: cue('a', 60), b: cue('b', 300), c: cue('c', 380)});
const PROMPT_ROWS = [183, 245, 307, 369, 431, 493, 555, 617];
const PROMPT_W = [640, 640, 600, 590, 600, 600, 580, 340];
const KEYWORDS = [{row: 0, x: 160, w: 200}, {row: 1, x: 405, w: 240}, {row: 4, x: 140, w: 170}, {row: 6, x: 228, w: 120}];
const Prompt: Scene = ({f, cue}) => {
  const p = promptPlan(cue);
  // the eight lines type on between the start of "直接跟它说" and the end of that sentence (≥ 8 s)
  const t0 = p.a, per = Math.max(24, (p.b - p.a) / 8);
  return <Root>
    <Title>一句话需求</Title>
    <Abs y={104} w={W} style={{display: 'flex', gap: 10}}>
      {['主题', '风格', '镜头数', '字号'].map((t, i) => <Pop key={t} f={f} at={p.b + i * 5}><Chip c={A} size={50}>{t}</Chip></Pop>)}
    </Abs>
    <Card f={f} src="05_prompt.png" y={200} h={700} sy={40} imgH={800} style={phaseOp(f, 0)}
      cam={[...PROMPT_ROWS.map((y, i) => ({at: t0 + i * per, y: y + 30, z: 1.25})), {at: p.c, y: 420, z: 1.02}]}>
      {PROMPT_ROWS.map((y, i) => <TypeOn key={y} f={f} at={t0 + i * per} dur={per} y={y} x1={PROMPT_W[i] + 10} />)}
      {KEYWORDS.map((k) => <Mark key={k.row} f={f} at={t0 + (k.row + 1) * per} x={k.x} y={PROMPT_ROWS[k.row] - 8} w={k.w} h={60} c={A} />)}
    </Card>
    <Abs y={940} w={W}><Pop f={f} at={p.c}><Chip c={B} size={64} fill>说得越具体，越像样</Chip></Pop></Abs>
  </Root>;
};
Prompt.sfx = (cue) => {
  const p = promptPlan(cue);
  return [{at: p.b, kind: 'tick', gain: 0.1}, {at: p.c, kind: 'stamp', gain: 0.12}];
};

/* ---------- 8 case: what the same flow produced ---------- */

const casePlan = (cue: Cue) => ({a: cue('a', 20), b: cue('b', 40), c: cue('c', 60), d: cue('d', 100), e: cue('e', 250)});
const Case: Scene = ({f, cue}) => {
  const p = casePlan(cue);
  const wipe = ease.inOutCubic(clamp(f / 14));
  return <Root>
    <Title>案例展示：<span style={{color: A}}>全自动生成</span></Title>
    <Abs y={108} w={W} style={{display: 'flex', gap: 14}}>
      {['装依赖', '写代码', '调动画'].map((t, i) => <Pop key={t} f={f} at={[p.a, p.b, p.c][i]}><Chip c={B} size={52}>{t}</Chip></Pop>)}
    </Abs>
    <Clip f={f} x={-60} y={220} w={1080} h={608} srcW={1280} srcH={720} scale={1080 / 1280} zoom={1.04} zoomDur={420} segs={[{clip: 'a-case', from: 0}]}
      style={{clipPath: `inset(0 ${100 * (1 - wipe)}% 0 0)`}} />
    <Abs y={870} w={W}><Pop f={f} at={p.d}><Chip c={A} size={46} fill>Claude Code + DeepSeek V4.1 Flash 成片</Chip></Pop></Abs>
    {f >= p.e - 1 && <Abs y={970} w={W} style={{display: 'flex', gap: 12}}>
      {['镜头', '转场', '数字动画'].map((t, i) => <Pop key={t} f={f} at={p.e + i * 6}><Chip c={INK} size={48}>{t} ✓</Chip></Pop>)}
    </Abs>}
  </Root>;
};
Case.sfx = (cue) => {
  const p = casePlan(cue);
  return [{at: 0, kind: 'fs-whoosh-wipe', gain: 0.1}, ...[p.a, p.b, p.c].map((at) => ({at, kind: 'tick', gain: 0.1})), {at: p.d, kind: 'pop', gain: 0.1},
    {at: p.e, kind: 'tick', gain: 0.1}];
};

/* ---------- 9 preview → tweak → render ---------- */

const renderPlan = (cue: Cue) => ({a: cue('a', 90), b: cue('b', 240), c: cue('c', 280)});
const Render: Scene = ({f, cue}) => {
  const p = renderPlan(cue);
  const words = [{t: '预览', at: 0}, {t: '改', at: p.a}, {t: '导出', at: p.b}];
  return <Root>
    <Abs y={-10} w={W} style={{display: 'flex', alignItems: 'center', gap: 16, whiteSpace: 'nowrap'}}>
      {words.map((w, i) => <React.Fragment key={w.t}>
        {i > 0 && <Big size={72} c={DIM}>→</Big>}
        <Big size={84} c={f >= w.at ? A : DIM}>{w.t}</Big>
      </React.Fragment>)}
    </Abs>
    <Card f={f} src="06_render.png" y={130} h={720} sy={40} imgH={820} style={phaseOp(f, 0)}
      cam={[{at: 0, y: 235, z: 1.3}, {at: p.a - 4, y: 420, z: 1.3}, {at: p.b - 4, y: 600, z: 1.3}]}>
      <Mark f={f} at={4} until={p.a} y={172} h={124} w={580} focus />
      <TypeOn f={f} at={p.a} dur={40} y={369} x1={505} />
      <TypeOn f={f} at={p.a + 40} dur={36} y={431} x1={505} />
      <Mark f={f} at={p.a} until={p.b} y={357} h={124} w={480} focus />
      {f >= p.a + 80 && f < p.b + 8 && <Abs x={600} y={380} w={420}><Pop f={f} at={p.a + 80}><Chip c={A} size={48} fill>中文说就行</Chip></Pop></Abs>}
      <Mark f={f} at={p.b} until={p.c} y={544} h={64} w={460} focus />
      <Mark f={f} at={p.c} y={544} h={126} w={620} c={GREEN} focus />
    </Card>
    <Abs y={900} w={W}><Pop f={f} at={p.c + 4}><Chip c={GREEN} size={64} fill>导出 mp4 ✓</Chip></Pop></Abs>
  </Root>;
};
Render.sfx = (cue) => {
  const p = renderPlan(cue);
  return [{at: 4, kind: 'tap', gain: 0.1}, {at: p.a, kind: 'tap', gain: 0.1}, {at: p.b, kind: 'tap', gain: 0.1}, {at: p.c + 4, kind: 'chime', gain: 0.12}];
};

/* ---------- 10 cost ---------- */

const costPlan = (cue: Cue) => ({a: cue('a', 50), b: cue('b', 110), c: cue('c', 150), d: cue('d', 220)});
const Cost: Scene = ({f, cue}) => {
  const p = costPlan(cue);
  const pulse = f >= p.c ? 0.5 + 0.5 * Math.sin((f - p.c) / 5) : 0;
  return <Root>
    <Title>花多少钱？</Title>
    <Card f={f} src="07_cost.png" y={110} h={700} sy={40} imgH={820} style={phaseOp(f, 0)}
      cam={[{at: p.a - 4, y: 360, z: 1.2}, {at: p.c - 4, y: 580, z: 1.2}, {at: p.d, y: 400, z: 1.0}]}>
      {/* the card's own title runs past its right edge: redraw it */}
      <div style={{position: 'absolute', left: 250, top: 70, width: 830, height: 70, background: CARD, display: 'flex', alignItems: 'center',
        fontFamily: font, fontWeight: 800, fontSize: 40, color: '#a5b4d8', whiteSpace: 'nowrap'}}>官方价 · 人民币 / 百万 tokens</div>
      <Mark f={f} at={p.a} until={p.c} y={357} h={64} w={420} focus />
      <Mark f={f} at={p.a} until={p.c} x={388} y={360} w={100} h={58} c={A} />
      <Mark f={f} at={p.b} until={p.c} x={264} y={360} w={100} h={58} c={GREEN} />
      <Mark f={f} at={p.c} y={606} h={64} w={480} c={GREEN} focus />
      {f >= p.c && <div style={{position: 'absolute', left: 74, top: 610, width: 470, height: 56, background: `rgba(74,222,128,${0.08 + 0.14 * pulse})`, borderRadius: 8}} />}
      {f >= p.c && <Abs x={600} y={600} w={420}><Pop f={f} at={p.c + 6}><Chip c={GREEN} size={56} fill>半价</Chip></Pop></Abs>}
      {f >= p.a && f < p.c + 8 && <Abs x={600} y={350} w={420}><Pop f={f} at={p.a + 4}><Chip c={A} size={44} fill>高峰 8 元</Chip></Pop></Abs>}
      {f >= p.b && f < p.c + 8 && <Abs x={600} y={430} w={420}><Pop f={f} at={p.b + 4}><Chip c={GREEN} size={44} fill>空闲 4 元</Chip></Pop></Abs>}
    </Card>
    <Abs y={860} w={W} style={{textAlign: 'center'}}><Pop f={f} at={p.d} origin="50% 50%"><Chip c={A} size={84} fill>一条视频 ≈ 几块钱</Chip></Pop></Abs>
  </Root>;
};
Cost.backdrop = ({f}) => <div style={{position: 'absolute', inset: 0, overflow: 'hidden'}}>
  <div style={{position: 'absolute', inset: 0, filter: 'blur(12px)', opacity: 0.3}}>
    <Clip f={f} x={0} y={0} w={1080} h={1920} srcW={720} srcH={1080} scale={1920 / 1080} segs={[{clip: 'c-cost', from: 0}]} tag={false} border="transparent" />
  </div>
  <div style={{position: 'absolute', inset: 0, background: 'rgba(9,17,31,0.45)'}} />
</div>;
Cost.sfx = (cue) => {
  const p = costPlan(cue);
  return [{at: p.a, kind: 'tap', gain: 0.1}, {at: p.b, kind: 'tap', gain: 0.1}, {at: p.c, kind: 'tick', gain: 0.1}, {at: p.d, kind: 'stamp', gain: 0.14}];
};

/* ---------- 11 end: montage + the 4-step checklist ---------- */

const endPlan = (cue: Cue) => ({a: cue('a', 4), b: cue('b', 20), c: cue('c', 36), d: cue('d', 52), e: cue('e', 70), f: cue('f', 110), g: cue('g', 160),
  h: cue('h', 200)});
const End: Scene = ({f, cue}) => {
  const p = endPlan(cue);
  const ticks = [{t: '安装', at: p.a}, {t: '配置', at: p.b}, {t: '验证', at: p.c}, {t: '出片', at: p.d}];
  const horiz = f < 60 || (f >= 60 && f < 120);
  return <Root>
    <Clip f={f} x={-60} y={0} w={1080} h={560} srcW={horiz ? 1280 : 720} srcH={horiz ? 720 : 1080} scale={horiz ? 1080 / 1280 : 1.5} sy={horiz ? 24 : 330}
      segs={[{clip: 'b-mont', from: 0}, {clip: 'a-mont', from: 60}, {clip: 'c-mont', from: 120}]} />
    <Abs y={600} w={W} style={{display: 'flex', gap: 14, justifyContent: 'space-between'}}>
      {ticks.map((t) => <div key={t.t} style={{border: `4px solid ${f >= t.at ? GREEN : LINE}`, background: PANEL, padding: '6px 14px', fontFamily: font, fontWeight: 900,
        fontSize: 56, color: f >= t.at ? INK : DIM, whiteSpace: 'nowrap', transform: `scale(${1 + 0.06 * hitOf(f, [t.at], 1)})`}}>
        <span style={{color: GREEN, opacity: f >= t.at ? 1 : 0.2}}>✓</span> {t.t}</div>)}
    </Abs>
    <Abs y={720} w={W} style={{textAlign: 'center'}}><Pop f={f} at={p.e} origin="50% 50%"><Chip c={A} size={76} fill>四步搞定</Chip></Pop></Abs>
    <Abs y={850} w={W} style={{display: 'flex', gap: 14, justifyContent: 'center'}}>
      <Pop f={f} at={p.f}><Chip c={DIM} size={50}>效果：比 Opus 差一点</Chip></Pop>
      <Pop f={f} at={p.g}><Chip c={B} size={50} fill>胜在便宜</Chip></Pop>
    </Abs>
    <Abs y={960} w={W} style={{textAlign: 'center'}}><Pop f={f} at={p.h} origin="50% 50%"><Chip c={INK} size={56}>先收藏 · 今晚就能跑起来</Chip></Pop></Abs>
  </Root>;
};
End.sfx = (cue) => {
  const p = endPlan(cue);
  return [p.a, p.b, p.c, p.d].map((at) => ({at, kind: 'tick', gain: 0.11})).concat([{at: p.e, kind: 'stamp', gain: 0.14}, {at: p.g, kind: 'pop', gain: 0.1},
    {at: p.h, kind: 'chime', gain: 0.12}]);
};

/* ---------- cover anchor (880 × 800) ---------- */

const Cover: Scene = () => <div style={{position: 'relative', width: 880, height: 800}}>
  <div style={{position: 'absolute', left: -100, top: 100, width: 1080, height: 608, overflow: 'hidden', outline: `3px solid ${B}`}}>
    <Img src={IMG('a-hook-still.jpg')} style={{width: 1080, height: 608}} />
  </div>
</div>;

export const deepseekClaudeCodeScenes: Record<string, Scene> = {
  'dcc.hook': Hook,
  'dcc.intro': Intro,
  'dcc.install': Install,
  'dcc.key': Key,
  'dcc.env': Env,
  'dcc.verify': Verify,
  'dcc.prompt': Prompt,
  'dcc.case': Case,
  'dcc.render': Render,
  'dcc.cost': Cost,
  'dcc.end': End,
  'dcc.cover': Cover,
};
