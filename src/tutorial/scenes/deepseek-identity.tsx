import React from 'react';
import {Img, staticFile} from 'remotion';
import {font} from '../theme';
import {clamp, ease, springStep} from '../../fx';
import {Cue, S, Scene, dropLift, hitOf, phaseOp} from '../paper';
import {A, B, BG, Big, DIM, INK, LINE, Mono, PANEL, STEEL, mono} from '../tech';

// DeepSeek 自称 ChatGPT — does a model's self-reported identity prove distillation? (≤ 60 s, full-screen 9:16)
// Script + facts: inputs/deepseek-identity/script.md; storyboard: tutorials/deepseek-identity.storyboard.md.
// Stage is the "full" layout: 900 × 1080 at (60, 200); keep what matters above y 1030 (the bottom 70 px fade out).
// A (amber) = ChatGPT, B (cyan) = DeepSeek; Claude stays neutral. Neutral stance: the only claim is "自称 ≠ 证据".

const W = 900;
const SHOT = staticFile('images/tutorials/deepseek-identity/scaling01-blur.jpg');
const SHOT_W = 856, ANSWER_Y = [257, 514, 804, 1094, 1385];

const Root: React.FC<{children: React.ReactNode}> = ({children}) => <div style={{position: 'relative', width: W, height: 1080}}>{children}</div>;
const Abs: React.FC<{x?: number; y: number; w?: number; style?: React.CSSProperties; children: React.ReactNode}> = ({x = 0, y, w, style, children}) => (
  <div style={{position: 'absolute', left: x, top: y, width: w, ...style}}>{children}</div>
);
const a = (s: string) => <span style={{color: A}}>{s}</span>;
const b = (s: string) => <span style={{color: B}}>{s}</span>;
/** Spring-in scale with a squash on its contact frame. */
const popIn = (f: number, at: number) => {
  const k = springStep(S(f), S(at), {f: 2.6, z: 0.62});
  const sq = hitOf(f, [at + 4], 1);
  return {opacity: clamp(k * 2), transform: `scale(${(0.6 + 0.4 * k) * (1 + 0.04 * sq)}, ${(0.6 + 0.4 * k) * (1 - 0.05 * sq)})`};
};

/** The X screenshot (avatar blurred, no handle): dialogue only. */
const Shot: React.FC<{x: number; y: number; scale: number; dim?: number; blur?: number}> = ({x, y, scale, dim = 0.45, blur = 1.5}) => (
  <div style={{position: 'absolute', left: x, top: y, width: SHOT_W * scale, outline: `2px solid ${LINE}`}}>
    <Img src={SHOT} style={{width: '100%', display: 'block', filter: `brightness(${1 - dim}) blur(${blur}px)`}} />
  </div>
);
const ChatGPTChip: React.FC<{size?: number; lit?: boolean}> = ({size = 52, lit}) => (
  <div style={{display: 'inline-block', background: lit ? A : BG, border: `4px solid ${A}`, color: lit ? BG : A, fontFamily: mono, fontWeight: 800, fontSize: size,
    padding: '4px 22px', whiteSpace: 'nowrap'}}>I&apos;m ChatGPT</div>
);

/* ---------- hook: five times "I'm ChatGPT" ---------- */

const HOOK_SCALE = 0.48, HOOK_X = (W - SHOT_W * HOOK_SCALE) / 2, HOOK_Y = 250;
const hookPlan = (cue: Cue) => ({chips: [4, 16, 28, 40, 52], a: cue('a', 92), b: cue('b', 120)});
const Hook: Scene = ({f, cue}) => {
  const p = hookPlan(cue);
  const shown = p.chips.filter((at) => f >= at).length;
  const pulse = hitOf(f, [p.b], 1);
  return <Root>
    <Abs y={0}><Big size={150}>连问 5 次</Big></Abs>
    <Abs y={182}><Big size={48} c={DIM}>说自己是 {a('ChatGPT')}：<span style={{fontFamily: mono, color: shown ? A : DIM}}>{shown} / 5</span></Big></Abs>
    <Shot x={HOOK_X} y={HOOK_Y} scale={HOOK_SCALE} />
    {p.chips.map((at, i) => f >= at - 1 && <Abs key={i} x={120 + (i % 2) * 120} y={HOOK_Y + ANSWER_Y[i] * HOOK_SCALE - 40}
      style={{...popIn(f, at), transformOrigin: '0% 50%', translate: `0 ${-6 * pulse}px`}}><ChatGPTChip lit={f >= p.b + i * 3} /></Abs>)}
    {f >= p.a - 1 && <Abs x={560} y={480} style={{...popIn(f, p.a), transformOrigin: '50% 50%'}}>
      <div style={{fontFamily: mono, fontWeight: 800, fontSize: 180, lineHeight: 1, color: A, WebkitTextStroke: `12px ${BG}`, paintOrder: 'stroke fill'}}>5/5</div>
    </Abs>}
    <Abs y={994}><Mono size={40}>X 网友 API 实测截图 · 2026.10.18</Mono></Abs>
  </Root>;
};
Hook.sfx = (cue) => [...hookPlan(cue).chips.map((at) => ({at, kind: 'pop', gain: 0.12})), {at: hookPlan(cue).a + 4, kind: 'stamp', gain: 0.16},
  {at: hookPlan(cue).b, kind: 'tap', gain: 0.18}];

/* ---------- comments: danmaku "实锤蒸馏" "套壳", then freeze on a question mark ---------- */

const FREEZE_X = [40, 470, 160, 560, 0, 360, 600, 110, 420];
const DANMAKU = Array.from({length: 9}, (_, i) => {
  const speed = [10, 13, 9, 12, 14, 10, 11, 12, 13][i];
  return {text: i % 2 ? '套壳' : '实锤蒸馏', y: 40 + i * 108, size: [80, 64, 72, 88, 64, 76, 70, 84, 66][i], speed, x0: FREEZE_X[i] + 70 * speed};
});
const commentsPlan = (cue: Cue) => ({a: cue('a', 9), b: cue('b', 73)});
const Comments: Scene = ({f, cue}) => {
  const p = commentsPlan(cue);
  const ft = Math.min(f, p.b);          // freeze the stream on "先别急"
  const freeze = clamp((f - p.b) / 6);
  return <Root>
    <div style={{opacity: 0.35}}><Shot x={HOOK_X} y={HOOK_Y} scale={HOOK_SCALE} dim={0.6} blur={3} /></div>
    <div style={{position: 'absolute', inset: 0, opacity: 1 - 0.6 * freeze}}>
      {DANMAKU.map((d, i) => {
        const x = d.x0 - (ft - p.a + 6) * d.speed;
        return <Abs key={i} x={x - 60} y={d.y} style={{whiteSpace: 'nowrap'}}>
          <div style={{fontFamily: font, fontWeight: 900, fontSize: d.size, color: i % 3 === 1 ? STEEL : INK, WebkitTextStroke: `8px ${BG}`, paintOrder: 'stroke fill'}}>{d.text}</div>
        </Abs>;
      })}
    </div>
    {f >= p.b - 1 && <Abs y={180} w={W} style={{textAlign: 'center', ...popIn(f, p.b)}}>
      <div style={{fontFamily: font, fontWeight: 900, fontSize: 460, lineHeight: 1, color: INK, WebkitTextStroke: `14px ${BG}`, paintOrder: 'stroke fill'}}>?</div>
    </Abs>}
  </Root>;
};
Comments.sfx = (cue) => {
  const p = commentsPlan(cue);
  return [{at: p.a, kind: 'whoosh', gain: 0.12}, {at: p.b, kind: 'thud', gain: 0.22}];
};

/* ---------- twist: a mock-up of Claude answering "我是 DeepSeek" ---------- */

const twistPlan = (cue: Cue) => ({a: cue('a', 100), b: cue('b', 121)});
const Twist: Scene = ({f, cue}) => {
  const p = twistPlan(cue);
  const typing = f < p.a - 2;
  return <Root>
    <Abs y={0} style={phaseOp(f, 0)}><Mono size={40} c={INK}>2026 年 2 月 · 来源：虎嗅</Mono></Abs>
    <Abs y={58} w={W} style={phaseOp(f, 16)}><Big size={40} c={DIM} w={700}>背景：Anthropic 发文，</Big><Big size={40} c={DIM} w={700}>指 {b('DeepSeek')} 等公司蒸馏 Claude</Big></Abs>
    {/* the mock-up: dashed frame and an explicit label, so it can't be mistaken for a screenshot */}
    <Abs y={190} w={W} style={{height: 500, border: `3px dashed ${DIM}`, background: 'rgba(18,38,61,0.6)'}}>
      <Abs x={W - 230} y={-26} style={{background: BG, padding: '0 12px'}}><Big size={40} c={DIM} w={800}>示意图</Big></Abs>
      <Abs x={W - 340} y={70} style={popIn(f, 38)}>
        <div style={{background: STEEL, color: BG, fontFamily: font, fontWeight: 900, fontSize: 56, padding: '10px 28px', borderRadius: 18}}>你是谁？</div>
      </Abs>
      <Abs x={36} y={190} style={phaseOp(f, 58)}>
        <div style={{display: 'flex', alignItems: 'center', gap: 16}}>
          <div style={{width: 64, height: 64, borderRadius: 32, border: `3px solid ${INK}`, color: INK, fontFamily: font, fontWeight: 900, fontSize: 40,
            textAlign: 'center', lineHeight: '58px'}}>C</div>
          <Big size={44} c={INK} w={800}>Claude Sonnet 4.6</Big>
        </div>
      </Abs>
      <Abs x={36} y={290}>
        {typing
          ? <div style={{fontFamily: mono, fontSize: 72, color: DIM, opacity: f >= 66 ? 1 : 0}}>{'•'.repeat(1 + (Math.floor(f / 6) % 3))}</div>
          : <div style={{...popIn(f, p.a - 2), transformOrigin: '0% 50%', background: PANEL, border: `4px solid ${B}`, padding: '14px 30px', borderRadius: 18}}>
            <Big size={84}>我是 {b('DeepSeek')}。</Big>
          </div>}
      </Abs>
    </Abs>
    {f >= p.b && <Abs y={760} w={W} style={phaseOp(f, p.b)}>
      <Big size={44} c={DIM} w={800}>按这个逻辑：</Big>
      <Big size={84} style={{marginTop: 10}}>Claude 是 {b('DeepSeek')}</Big>
      <Big size={84}>蒸馏的？</Big>
    </Abs>}
  </Root>;
};
Twist.sfx = (cue) => {
  const p = twistPlan(cue);
  return [{at: 38, kind: 'tap', gain: 0.14}, {at: p.a + 2, kind: 'pop', gain: 0.16}, {at: p.b, kind: 'whoosh-short', gain: 0.1}];
};

/* ---------- history: it's not new — V3 in Dec 2024 ---------- */

const historyPlan = (cue: Cue) => ({a: cue('a', 32), b: cue('b', 100)});
const EVENTS = [
  {y: 40, date: '2024.12', body: <><Big size={72}>{b('DeepSeek')} V3</Big><Big size={64}>也自称 {a('ChatGPT')}</Big></>, src: 'TechCrunch', fresh: true},
  {y: 400, date: '2026.02', body: <Big size={52} c={INK}>Claude 自称 {b('DeepSeek')}</Big>, src: '虎嗅', fresh: false},
  {y: 590, date: '2026.10', body: <Big size={52} c={INK}>{b('DeepSeek')} 新模型自称 {a('ChatGPT')}</Big>, src: 'X 网友实测', fresh: false},
];
const History: Scene = ({f, cue}) => {
  const p = historyPlan(cue);
  return <Root>
    <svg width={W} height={800} style={{position: 'absolute', left: 0, top: 0}}>
      <line x1={22} x2={22} y1={30} y2={760} stroke={LINE} strokeWidth={4} />
    </svg>
    {EVENTS.map((e, i) => {
      const at = e.fresh ? p.a : 0;
      const lift = e.fresh ? dropLift(f, at, 0, 140) : 0;
      if (e.fresh && f < at - 12) return null;
      return <Abs key={i} y={e.y - lift} w={W} style={{opacity: e.fresh ? 1 : 0.75, ...(e.fresh ? {} : phaseOp(f, 0))}}>
        <svg width={44} height={44} style={{position: 'absolute', left: 0, top: 10}}><circle cx={22} cy={22} r={e.fresh ? 18 : 12} fill={e.fresh ? INK : LINE} /></svg>
        <div style={{marginLeft: 70}}>
          <Mono size={44} c={e.fresh ? INK : DIM} w={800}>{e.date}</Mono>
          {e.body}
          <Mono size={40} style={{marginTop: 4}}>来源：{e.src}</Mono>
        </div>
      </Abs>;
    })}
    {f >= p.b - 1 && <Abs y={830} w={W} style={{textAlign: 'center', ...popIn(f, p.b)}}><Big size={120}>不是新鲜事</Big></Abs>}
  </Root>;
};
History.sfx = (cue) => {
  const p = historyPlan(cue);
  return [{at: p.a, kind: 'tap', gain: 0.2}, {at: p.b, kind: 'stamp', gain: 0.16}];
};

/* ---------- mechanism: system prompt vs. the most common answer in the data ---------- */

const mechPlan = (cue: Cue) => ({a: cue('a', 62), b: cue('b', 88), c: cue('c', 203), d: cue('d', 244), e: cue('e', 344)});
const LANE = 430;
const Box: React.FC<{c?: string; dashed?: boolean; children: React.ReactNode; style?: React.CSSProperties}> = ({c = LINE, dashed, children, style}) => (
  <div style={{border: `3px ${dashed ? 'dashed' : 'solid'} ${c}`, background: PANEL, padding: '12px 18px', ...style}}>{children}</div>
);
const Down: React.FC<{y: number; x: number; on: number}> = ({x, y, on}) => (
  <svg width={40} height={56} style={{position: 'absolute', left: x - 20, top: y, opacity: on}}>
    <path d="M20 2 L20 46 M8 34 L20 50 L32 34" stroke={DIM} strokeWidth={5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const Mechanism: Scene = ({f, cue}) => {
  const p = mechPlan(cue);
  const fill = clamp((f - p.b - 24) / Math.max(30, p.c - p.b - 24));
  const inset = f >= p.d - 2;
  // the lanes use the whole stage until the Claude Code inset arrives, then close up to make room for it
  const k = 1.4 - 0.4 * springStep(S(f), S(p.d - 8), {f: 1.6, z: 0.8});
  return <Root>
    {/* left lane: with a system prompt */}
    <Abs y={0 * k} w={LANE} style={phaseOp(f, 0)}><Big size={52}>有系统提示</Big></Abs>
    <Abs y={84 * k} w={LANE} style={phaseOp(f, p.a - 6)}><Box c={INK}><Big size={44}>系统提示：</Big><Big size={44}>你是 XX</Big></Box></Abs>
    <Down x={LANE / 2} y={226 * k} on={clamp((f - p.a) / 6)} />
    <Abs y={292 * k} w={LANE} style={phaseOp(f, p.a + 6)}><Box><Big size={44} c={DIM}>模型</Big></Box></Abs>
    <Down x={LANE / 2} y={378 * k} on={clamp((f - p.a - 10) / 6)} />
    {f >= p.a + 12 && <Abs y={444 * k} w={LANE} style={{...popIn(f, p.a + 12), transformOrigin: '0% 50%'}}><Box c={INK}><Big size={52}>我是 XX ✓</Big></Box></Abs>}

    {/* right lane: no system prompt → the most common answer in the training data */}
    <Abs x={W - LANE} y={0 * k} w={LANE} style={phaseOp(f, p.b)}><Big size={52}>没有系统提示</Big></Abs>
    {f >= p.b && <Abs x={W - LANE} y={84 * k} w={LANE} style={phaseOp(f, p.b + 4)}>
      <Box style={{height: 200, position: 'relative', overflow: 'hidden'}}>
        <Big size={44}>训练数据</Big>
        {Array.from({length: 12}, (_, i) => {
          const on = i / 12 < fill, isG = on && i % 3 !== 2;
          return <div key={i} style={{position: 'absolute', left: 18 + (i % 3) * 128, top: 72 + Math.floor(i / 3) * 30, width: 112, height: 18,
            background: isG ? A : on ? STEEL : LINE, opacity: on ? 1 : 0.4, transform: `scaleX(${on ? 1 : 0.6})`, transformOrigin: '0 50%'}} />;
        })}
      </Box>
    </Abs>}
    {/* "the web is full of ChatGPT-written text": words stream up into the training data */}
    {Array.from({length: 7}, (_, i) => {
      const at = p.b + 26 + i * Math.max(8, (p.c - p.b - 40) / 7), kw = clamp((f - at) / 22);
      if (f < at || kw >= 1) return null;
      return <Abs key={`w${i}`} x={W - LANE + 20 + (i % 3) * 120} y={(560 - 420 * ease.inOutCubic(kw)) * k} style={{opacity: 1 - kw * 0.7}}>
        <div style={{fontFamily: mono, fontWeight: 800, fontSize: 52, color: A, whiteSpace: 'nowrap'}}>ChatGPT</div>
      </Abs>;
    })}
    {f >= p.c + 14 && <Abs x={W - LANE} y={540 * k} w={LANE} style={phaseOp(f, p.c + 14)}><Big size={40} c={A} w={800}>网上 AI 生成的</Big><Big size={40} c={A} w={800}>文字里最多</Big></Abs>}
    <Down x={W - LANE / 2} y={378 * k} on={clamp((f - p.c) / 6)} />
    {f >= p.c + 8 && <Abs x={W - LANE} y={444 * k} w={LANE} style={{...popIn(f, p.c + 8), transformOrigin: '0% 50%'}}><Box c={A}><Big size={52} c={A}>ChatGPT</Big></Box></Abs>}

    {/* inset: Claude Code's system prompt + DeepSeek → "我是 Claude" */}
    {inset && <Abs y={660} w={W} style={phaseOp(f, p.d - 2)}>
      <div style={{border: `3px solid ${INK}`, background: BG}}>
        <div style={{background: PANEL, padding: '6px 18px', borderBottom: `2px solid ${LINE}`}}><Big size={40} c={INK} w={800}>Claude Code 里接 {b('DeepSeek')}</Big></div>
        <div style={{padding: '12px 18px', fontFamily: mono, fontSize: 40, lineHeight: 1.35, color: DIM}}>
          <div>系统提示: <span style={{color: INK}}>You are Claude Code…</span></div>
          <div>模型: <span style={{color: B}}>DeepSeek</span></div>
          <div style={{color: INK, opacity: clamp((f - p.d - 20) / 6)}}>&gt; 你是谁？</div>
          {f >= p.e - 2 && <div style={{...popIn(f, p.e - 2), transformOrigin: '0% 50%', fontFamily: font, fontWeight: 900, fontSize: 64, color: INK, marginTop: 6}}>我是 Claude</div>}
        </div>
      </div>
    </Abs>}
  </Root>;
};
Mechanism.sfx = (cue) => {
  const p = mechPlan(cue);
  return [{at: p.a + 12, kind: 'tick', gain: 0.14}, {at: p.c + 8, kind: 'tick', gain: 0.14}, {at: p.d, kind: 'whoosh-short', gain: 0.1}, {at: p.e, kind: 'tap', gain: 0.18}];
};

/* ---------- reproductions disagree ---------- */

const reproPlan = (cue: Cue) => ({a: cue('a', 57), b: cue('b', 114)});
const Dots: React.FC<{n: number; of: number; c: string; f: number; at: number}> = ({n, of, c, f, at}) => (
  <div style={{display: 'flex', flexWrap: 'wrap', gap: 12, width: 5 * 60}}>
    {Array.from({length: of}, (_, i) => <div key={i} style={{width: 46, height: 46, borderRadius: 23,
      background: i < n && f >= at + i * 2 ? c : 'transparent', border: `3px solid ${i < n ? c : LINE}`}} />)}
  </div>
);
const Stat: React.FC<{label: string; n: number; of: number; c: string; f: number; at: number; who: string}> = ({label, n, of, c, f, at, who}) => (
  <div style={{marginTop: 44}}>
    <Big size={48}>{label} <span style={{fontFamily: mono, color: c}}>{n}/{of}</span></Big>
    <div style={{marginTop: 10}}><Dots n={n} of={of} c={c} f={f} at={at} /></div>
    <Mono size={40} style={{marginTop: 6}}>{who}</Mono>
  </div>
);
const Repro: Scene = ({f, cue}) => {
  const p = reproPlan(cue);
  return <Root>
    <Abs y={0} style={phaseOp(f, 0)}><div style={{border: `3px solid ${DIM}`, padding: '4px 16px'}}><Big size={44} c={INK} w={800}>网友自测，条件未公开</Big></div></Abs>
    {f >= p.a - 4 && <Abs y={150} w={LANE} style={phaseOp(f, p.a - 4)}>
      <Big size={56}>中文问</Big>
      <Big size={56} c={DIM}>多数说</Big><Big size={72}>{b('DeepSeek')}</Big>
      <Stat label="中文" n={10} of={10} c={B} f={f} at={p.a + 6} who="@xiaoyu_agi" />
    </Abs>}
    {f >= p.b - 4 && <Abs x={W - LANE + 10} y={150} w={LANE} style={phaseOp(f, p.b - 4)}>
      <Big size={56}>英文、API 直调</Big>
      <Big size={56} c={DIM}>常说</Big><Big size={72}>{a('ChatGPT')}</Big>
      <Stat label="英文" n={6} of={10} c={A} f={f} at={p.b + 6} who="@xiaoyu_agi" />
      <Stat label="API" n={5} of={5} c={A} f={f} at={p.b + 16} who="@scaling01" />
    </Abs>}
  </Root>;
};
Repro.sfx = (cue) => {
  const p = reproPlan(cue);
  return [{at: p.a, kind: 'tap', gain: 0.16}, {at: p.b, kind: 'tap', gain: 0.16}];
};

/* ---------- verdict ---------- */

const verdictPlan = (cue: Cue) => ({a: cue('a', 70)});
const Verdict: Scene = ({f, cue}) => {
  const p = verdictPlan(cue);
  const push = 1 + 0.08 * clamp(f / 170);
  return <Root><div style={{position: 'absolute', inset: 0, transform: `scale(${push})`, transformOrigin: '450px 560px'}}>
    <Abs y={300} w={W} style={{textAlign: 'center', ...popIn(f, 2)}}>
      <Big size={150}>自称 ≠ 证据</Big>
      <div style={{width: 640, height: 8, background: INK, margin: '18px auto 0', transform: `scaleX(${springStep(S(f), S(10), {f: 2, z: 0.8})})`}} />
    </Abs>
    {f >= 20 && <Abs y={620} w={W} style={{textAlign: 'center', ...phaseOp(f, 20)}}>
      <Big size={56} c={INK} w={800}>蒸馏争议一直有，</Big>
      <Big size={56} c={INK} w={800}>但这个测试证明不了</Big>
    </Abs>}
    <Abs y={850} w={W} style={{display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 18, whiteSpace: 'nowrap'}}>
      {f >= p.a - 1 && <div style={{...phaseOp(f, p.a - 1), fontFamily: font, fontWeight: 800, fontSize: 44, color: DIM}}>都自称过：</div>}
      {[['ChatGPT', A], ['DeepSeek', B], ['Claude', INK]].map(([name, c], i) => f >= p.a + i * 8 - 1 && <div key={name} style={{...popIn(f, p.a + i * 8),
        border: `3px solid ${c}`, color: c, fontFamily: font, fontWeight: 900, fontSize: 44, padding: '2px 14px'}}>{name}</div>)}
    </Abs>
  </div></Root>;
};
Verdict.sfx = (cue) => [{at: 2, kind: 'stamp', gain: 0.22}, ...[0, 8, 16].map((d) => ({at: verdictPlan(cue).a + d, kind: 'tick', gain: 0.1}))];

/* ---------- cover anchor (880 × 800 box): the question and five answers ---------- */

const CoverAnchor: Scene = () => <div style={{position: 'relative', width: 880, height: 800}}>
  <div style={{position: 'absolute', right: 40, top: 0, background: STEEL, color: BG, fontFamily: font, fontWeight: 900, fontSize: 52, padding: '8px 26px', borderRadius: 16}}>
    What model are you?</div>
  {[0, 1, 2, 3, 4].map((i) => <div key={i} style={{position: 'absolute', left: 60 + (i % 2) * 90, top: 120 + i * 132}}><ChatGPTChip size={64} /></div>)}
  <div style={{position: 'absolute', right: 40, top: 560, fontFamily: mono, fontWeight: 800, fontSize: 120, color: A}}>×5</div>
</div>;

export const deepseekIdentityScenes: Record<string, Scene> = {
  'dsid.hook': Hook,
  'dsid.comments': Comments,
  'dsid.twist': Twist,
  'dsid.history': History,
  'dsid.mechanism': Mechanism,
  'dsid.repro': Repro,
  'dsid.verdict': Verdict,
  'dsid.cover': CoverAnchor,
};
