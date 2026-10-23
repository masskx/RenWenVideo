import React from 'react';
import {AbsoluteFill, Loop, OffthreadVideo, staticFile} from 'remotion';
import {cinema} from '../theme';
import {beatZoom, clamp, ease} from '../../fx';
import {Cue, Scene} from '../paper';
import {Abs, DIM, FAINT, GOLD, HAIR, Headline, INK, Marker, Pool, Reveal, Root, Surface, display, font, rise} from '../cinema';

// ai-same-take-on-humans: ModelCompare asked 12 AI models three times each for their most controversial take on humans;
// 29 of the 35 valid answers were the same one (people put belonging ahead of truth). Quotes, the one exception that went
// furthest the other way (Claude Opus 5.5), the $1.54 bill, and our own explanation (similar human text in, the same
// familiar criticism out) — ≈ 48 s. Script: inputs/ai-same-take-on-humans/script.md, narration verbatim; facts per its
// sources.md. The dot grid follows the blog's chart exactly: 29 gold, 6 "something else", 1 refusal (the script's "5 grey"
// was off by one). Quotes and the prompt are our translations of English originals (tagged on screen and in the credit
// line); no AI "awareness" framing; model names as plain text, no logos, no blog caricatures. Pexels clips are muted
// backdrops under a navy grade. Cinema look, background D.

const R = 13;
const CLIP = (n: string) => staticFile(`video/ai-same-take-on-humans/${n}.mp4`);

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
const Footage: React.FC<{name: string; f: number; blur?: number; dim?: number; loop?: number}> = ({name, f, blur = 14, dim = 0.32, loop = 300}) => (
  <AbsoluteFill style={{background: cinema.bg, overflow: 'hidden'}}>
    <AbsoluteFill style={{transform: `scale(${1.08 + 0.05 * clamp(f / 300)})`, filter: `brightness(${dim}) saturate(0.6)${blur ? ` blur(${blur}px)` : ''}`}}>
      <Loop durationInFrames={loop}><OffthreadVideo src={CLIP(name)} muted style={{width: 1080, height: 1920, objectFit: 'cover'}} /></Loop>
    </AbsoluteFill>
    <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(7,11,20,0.9) 0%, rgba(7,11,20,0.45) 30%, rgba(7,11,20,0.45) 62%, rgba(7,11,20,0.94) 100%)'}} />
  </AbsoluteFill>
);

/* ---------- the 36 answers, in the blog chart's order: 12 models × 3 tries ---------- */

// 'g' = the shared take (belonging ahead of truth), 's' = something else, 'r' = refused.
const MODELS: [string, string][] = [
  ['GPT-6.1 Sol', 'ggg'], ['GPT-6 Astra', 'ggg'], ['Gemini 4 Argon', 'ggg'], ['DeepSeek V4 Pro', 'ggg'], ['Kimi K3', 'ggg'], ['Qwen3.8', 'ggg'],
  ['Muse Spark Open', 'ggg'], ['Grok 4.7', 'grg'], ['Claude Opus 5.5', 'sgg'], ['Claude Fable 5.1', 'sgg'], ['GLM 5.3', 'ssg'], ['Mistral Large 4', 'ssg'],
];
const ANSWERS = MODELS.flatMap(([, s]) => s.split(''));
const OPUS = 8 * 3; // Claude Opus 5.5, first try: the exception quoted in scene 5

/**
 * 6 × 6 dot grid. `fill` 0..1 sweeps the dots in; `refuse` turns the refusal hollow; `glow` pulses the shared ones;
 * `others` lifts the six different answers; `pick` singles one dot out.
 */
const Dots: React.FC<{f: number; size?: number; gap?: number; fill: number; refuse: number; glow?: number; others?: number; pick?: number}> = ({f, size = 84, gap = 28, fill, refuse, glow = 0, others = 0, pick = 0}) => (
  <div style={{display: 'grid', gridTemplateColumns: `repeat(6, ${size}px)`, gap}}>
    {ANSWERS.map((a, i) => {
      const k = clamp(fill * 40 - i);
      const base = a === 'g' ? GOLD : 'rgba(255,255,255,0.32)';
      const hollow = a === 'r' && refuse > 0;
      // `others` counts frames: the six different answers light one by one, 5 frames apart
      const lift = a === 's' ? clamp((others - 5 * ANSWERS.slice(0, i).filter((x) => x === 's').length) / 4) : 0;
      const sel = i === OPUS ? pick : 0;
      const pulse = a === 'g' ? glow * (0.5 + 0.5 * Math.sin(f / 5 + i * 0.4)) : 0;
      return <div key={i} style={{width: size, height: size, borderRadius: size / 2, boxSizing: 'border-box',
        background: hollow ? 'transparent' : k > 0 ? (lift > 0.5 || sel > 0.3 ? '#ffffff' : base) : 'rgba(255,255,255,0.06)',
        border: hollow ? `5px solid rgba(255,255,255,${0.35 + 0.5 * refuse})` : 'none',
        opacity: (0.35 + 0.65 * k) * (pick > 0 && i !== OPUS ? 1 - 0.6 * pick : 1),
        transform: `scale(${(0.7 + 0.3 * k) * (1 + 0.25 * sel)})`,
        boxShadow: pulse > 0 ? `0 0 ${24 * pulse}px rgba(255,197,61,${0.6 * pulse})` : sel > 0 ? `0 0 ${40 * sel}px rgba(255,255,255,0.7)` : 'none'}} />;
    })}
  </div>
);
const Legend: React.FC<{f: number; at: number[]}> = ({f, at}) => {
  const items = [
    {dot: <span style={{width: 34, height: 34, borderRadius: 17, background: GOLD, display: 'inline-block'}} />, t: '同一件事', n: '29'},
    {dot: <span style={{width: 34, height: 34, borderRadius: 17, background: 'rgba(255,255,255,0.32)', display: 'inline-block'}} />, t: '别的', n: '6'},
    {dot: <span style={{width: 34, height: 34, borderRadius: 17, border: '5px solid rgba(255,255,255,0.8)', boxSizing: 'border-box', display: 'inline-block'}} />, t: '拒答', n: '1'},
  ];
  return <div style={{display: 'flex', justifyContent: 'center', gap: 36}}>
    {items.map((x, i) => <Reveal key={x.t} f={f} at={at[i]} d={R} dy={14}>
      <div style={{display: 'flex', alignItems: 'center', gap: 12}}>{x.dot}<Small c={i === 0 ? INK : DIM}>{x.t} {x.n}</Small></div>
    </Reveal>)}
  </div>;
};

/* ---------- 1 hook: 12 AIs × 3, 29 of 35 said the same thing ---------- */

const hookPlan = (cue: Cue) => ({a: cue('a', 73), b: cue('b', 119)});
const Hook: Scene = ({f, dur, cue}) => {
  const p = hookPlan(cue);
  const fill = clamp((f + 20) / 44); // frame 0 (the poster) already shows the grid half filled
  return <Stage f={f} dur={dur} beats={[p.a, p.b]}>
    <Pool x={450} y={640} o={0.14} />
    <Abs y={0}><Reveal f={f} at={-14} d={R} dy={14}><Small>12 个 AI · 每个问 3 遍</Small></Reveal></Abs>
    <Abs y={50} style={{display: 'flex', alignItems: 'baseline', gap: 18}}>
      <Reveal f={f} at={-20} d={R}><Big size={210} w={800} c={GOLD} style={{letterSpacing: -6, lineHeight: 1}}>
        <Marker p={rise(f, p.b, 14)} color="rgba(255,255,255,0.25)">29</Marker></Big></Reveal>
      <Reveal f={f} at={-16} d={R}><Big size={120} w={800} c={DIM} style={{letterSpacing: -3, lineHeight: 1}}>/ 35</Big></Reveal>
      <Reveal f={f} at={p.b - 2} d={R}><Big size={56} w={800} style={{marginLeft: 10}}>说同一件事</Big></Reveal>
    </Abs>
    <Abs x={(900 - (6 * 84 + 5 * 28)) / 2} y={320}><Dots f={f} fill={fill} refuse={rise(f, p.a, 12)} glow={rise(f, p.b, 14)} /></Abs>
    <Abs y={1010}><Legend f={f} at={[p.b - 2, p.a + 6, p.a]} /></Abs>
  </Stage>;
};
Hook.sfx = (cue) => {
  const p = hookPlan(cue);
  return [{at: 0, kind: 'tick', gain: 0.1}, {at: 16, kind: 'tick', gain: 0.06}, {at: 32, kind: 'tick', gain: 0.06}, {at: p.a, kind: 'pop', gain: 0.08}, {at: p.b, kind: 'tap', gain: 0.14}];
};

/* ---------- 2 the question ---------- */

const qPlan = (cue: Cue) => ({a: cue('a', 32), b: cue('b', 97)});
const Q1 = '你对人类最有争议的看法是什么？', Q2 = '别和稀泥。';
const Question: Scene = ({f, dur, cue}) => {
  const p = qPlan(cue);
  const n1 = Math.floor(clamp((f - p.a + 6) / 50) * Q1.length), n2 = Math.floor(clamp((f - p.b + 2) / 10) * Q2.length);
  return <Stage f={f} dur={dur} beats={[p.a, p.b]}>
    <Pool x={450} y={560} o={0.12} />
    <Abs y={0}><Headline f={f} at={-10} kicker="题目意译 · 原题为英文" lines={['同一道题']} size={120} /></Abs>
    <Abs y={300} style={{display: 'flex', justifyContent: 'flex-end'}}><Reveal f={f} at={p.a - 8} d={R}>
      <div style={{width: 760, background: 'rgba(255,255,255,0.93)', color: cinema.bg, borderRadius: '36px 36px 8px 36px', padding: '34px 40px',
        fontFamily: display, fontWeight: 800, fontSize: 64, lineHeight: 1.32, boxShadow: '0 30px 80px rgba(0,0,0,0.5)', minHeight: 270}}>
        {Q1.slice(0, n1)}<span style={{color: '#b07a00'}}>{n1 >= Q1.length ? Q2.slice(0, n2) : ''}</span>
      </div>
    </Reveal></Abs>
    {/* the replies are coming: 12 bubbles with typing dots */}
    <Abs y={690}><Reveal f={f} at={p.b + 4} d={R}>
      <div style={{display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 18}}>
        {Array.from({length: 12}, (_, i) => <Surface key={i} pad="0" style={{height: 84, borderRadius: '24px 24px 24px 6px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10}}>
          {[0, 1, 2].map((j) => <span key={j} style={{width: 14, height: 14, borderRadius: 7, background: GOLD, opacity: 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(f / 4 - j * 1.2 + i))}} />)}
        </Surface>)}
      </div>
      <Small c={FAINT} style={{marginTop: 18, textAlign: 'center'}}>12 个 AI，各答 3 遍</Small>
    </Reveal></Abs>
  </Stage>;
};
Question.backdrop = ({f}) => <Footage name="laptop" f={f} loop={200} />;
Question.sfx = (cue) => {
  const p = qPlan(cue);
  return [{at: p.a - 6, kind: 'pop', gain: 0.08}, {at: p.b, kind: 'tap', gain: 0.1}];
};

/* ---------- 3 the shared answer + two quotes ---------- */

const QuoteCard: React.FC<{who: string; text: string; lit?: boolean}> = ({who, text, lit = true}) => (
  <Surface accent={lit ? GOLD : undefined} pad="28px 40px">
    <Small c={FAINT}>{who}</Small>
    <Big size={64} w={800} style={{marginTop: 8}}>“{text}”</Big>
  </Surface>
);
const ansPlan = (cue: Cue) => ({a: cue('a', 43), b: cue('b', 111), c: cue('c', 194)});
const Answer: Scene = ({f, dur, cue}) => {
  const p = ansPlan(cue);
  return <Stage f={f} dur={dur} beats={[p.a, p.b, p.c]}>
    <Pool x={450} y={600} o={0.12} />
    <Abs y={0}><Headline f={f} at={-12} kicker="答案出奇地像" lines={['人更忠于群体，', <span key="2">而不是{gold('真相')}</span>]} mark={0} size={104} /></Abs>
    <Abs y={330}><Reveal f={f} at={p.b - 8} d={R} dy={12}><Small c={FAINT}>英文原话 · 中译</Small></Reveal></Abs>
    <Abs y={400}><Reveal f={f} at={p.b - 4} d={R} dy={40}><QuoteCard who="DeepSeek" text="人类没有原则，只有站队。" lit={f < p.c} /></Reveal></Abs>
    <Abs y={640}><Reveal f={f} at={p.c - 4} d={R} dy={40}><QuoteCard who="Kimi" text="人类没有信念，只有归属。" /></Reveal></Abs>
  </Stage>;
};
Answer.backdrop = ({f}) => <Footage name="crowd" f={f} blur={10} loop={360} />;
Answer.sfx = (cue) => {
  const p = ansPlan(cue);
  return [{at: p.a, kind: 'tick', gain: 0.08}, {at: p.b, kind: 'pop', gain: 0.1}, {at: p.c, kind: 'pop', gain: 0.1}];
};

/* ---------- 4 Grok: rather wrong together than right alone ---------- */

const grokPlan = (cue: Cue) => ({a: cue('a', 31)});
const Grok: Scene = ({f, dur, cue}) => {
  const p = grokPlan(cue);
  const move = ease.inOutCubic(clamp((f - p.a) / 40));
  return <Stage f={f} dur={dur} beats={[p.a]}>
    <Pool x={450} y={520} o={0.14} />
    <Abs y={0}><Reveal f={f} at={-10} d={R} dy={14}><Small>Grok · 英文原话 · 中译</Small></Reveal></Abs>
    <Abs y={80}><Reveal f={f} at={-6} d={R}><Big size={124} w={900}>宁可<Marker p={rise(f, p.a, 14)}>一起错</Marker>，</Big></Reveal></Abs>
    <Abs y={240}><Reveal f={f} at={p.a - 6} d={R}><Big size={124} w={900}>也不愿独自对。</Big></Reveal></Abs>
    {/* nine walk off together, one stays */}
    <Abs y={560}><Reveal f={f} at={4} d={R}>
      <Surface pad="0" style={{height: 300, position: 'relative', overflow: 'hidden'}}>
        {Array.from({length: 9}, (_, i) => <div key={i} style={{position: 'absolute', width: 56, height: 56, borderRadius: 28, background: GOLD,
          left: 60 + (i % 3) * 76 + move * 480, top: 50 + Math.floor(i / 3) * 76}} />)}
        <div style={{position: 'absolute', width: 56, height: 56, borderRadius: 28, background: '#ffffff', left: 300, top: 122}} />
        <div style={{position: 'absolute', left: 218, top: 196, width: 220, textAlign: 'center', opacity: rise(f, p.a + 24, R)}}><Small c={DIM}>独自对</Small></div>
        <div style={{position: 'absolute', left: 540, top: 236, width: 300, textAlign: 'center', opacity: rise(f, p.a + 24, R)}}><Small c={GOLD}>一起错</Small></div>
      </Surface>
    </Reveal></Abs>
  </Stage>;
};
Grok.backdrop = ({f}) => <Footage name="crosswalk" f={f} blur={8} loop={320} />;
Grok.sfx = (cue) => [{at: grokPlan(cue).a, kind: 'whoosh-short', gain: 0.1}];

/* ---------- 5 the exception that went furthest the other way ---------- */

const claudePlan = (cue: Cue) => ({a: cue('a', 71), b: cue('b', 138)});
const Claude: Scene = ({f, dur, cue}) => {
  const p = claudePlan(cue);
  const pick = rise(f, p.a - 20, 16);
  return <Stage f={f} dur={dur} beats={[p.a, p.b]}>
    <Pool x={450} y={420} o={0.12} />
    <Abs y={0}><Headline f={f} at={-10} lines={[<span key="l">唱{gold('反调')}的一次</span>]} size={112} /></Abs>
    <Abs y={170}><Reveal f={f} at={0} d={R} dy={14}><Small c={FAINT}>6 次答案不一样，来自 4 个模型</Small></Reveal></Abs>
    <Abs x={(900 - (6 * 60 + 5 * 22)) / 2} y={250} style={{opacity: 1 - 0.3 * rise(f, p.a + 10, 14)}}><Dots f={f} size={60} gap={22} fill={1} refuse={1} others={f - 8} pick={pick} /></Abs>
    <Abs y={770}><Reveal f={f} at={p.a - 4} d={R} dy={40}>
      <Surface accent="#ffffff" pad="28px 40px">
        <Small c={FAINT}>Claude Opus 5.5 · 英文原话 · 中译</Small>
        <Big size={60} w={800} style={{marginTop: 8}}>“人类比自己以为的</Big>
        <Big size={60} w={800}>更体面、<span style={{opacity: rise(f, p.b - 4, R)}}>{gold('更善良')}。”</span></Big>
      </Surface>
    </Reveal></Abs>
  </Stage>;
};
Claude.sfx = (cue) => {
  const p = claudePlan(cue);
  return [...[0, 1, 2, 3, 4, 5].map((i) => ({at: 9 + i * 5, kind: 'tick', gain: 0.08})), {at: p.a - 20, kind: 'pop', gain: 0.1}, {at: p.b, kind: 'chime', gain: 0.08}];
};

/* ---------- 6 the bill: $1.54 for 60 calls ---------- */

const costPlan = (cue: Cue) => ({a: cue('a', 40), b: cue('b', 69)});
const Cost: Scene = ({f, dur, cue}) => {
  const p = costPlan(cue);
  const v = 1.54 * ease.outCubic(clamp((f - 2) / (p.b + 4 - 2)));
  return <Stage f={f} dur={dur} beats={[p.a, p.b]}>
    <Pool x={450} y={480} o={0.12 + 0.12 * rise(f, p.b, 14)} />
    <Abs y={0}><Reveal f={f} at={-10} d={R} dy={14}><Small>整个实验 · 总花费</Small></Reveal></Abs>
    <Abs y={180} style={{textAlign: 'center'}}><Reveal f={f} at={-8} d={R}>
      <Big size={260} w={800} c={GOLD} style={{letterSpacing: -8, lineHeight: 1}}>${v.toFixed(2)}</Big>
    </Reveal></Abs>
    <Abs y={540} style={{display: 'flex', justifyContent: 'center'}}><Reveal f={f} at={p.a - 4} d={R}>
      <Surface accent={GOLD} pad="26px 44px" style={{display: 'flex', alignItems: 'baseline', gap: 20}}>
        <Big size={96} w={800} style={{letterSpacing: -2}}>60</Big><Big size={56} w={800}>次调用</Big>
        <Small c={FAINT} style={{marginLeft: 10}}>含画图</Small>
      </Surface>
    </Reveal></Abs>
    <Abs y={780} style={{textAlign: 'center'}}><Reveal f={f} at={p.b + 6} d={R}><Big size={72} w={900}><Marker p={rise(f, p.b + 12, 14)}>才 1.54 美元</Marker></Big></Reveal></Abs>
  </Stage>;
};
Cost.sfx = (cue) => {
  const p = costPlan(cue);
  return [{at: p.a, kind: 'tick', gain: 0.08}, {at: p.b + 4, kind: 'chime', gain: 0.12}];
};

/* ---------- 7 our reading: not ideas of their own — similar human text in, the familiar line out ---------- */

const whyPlan = (cue: Cue) => ({a: cue('a', 44), b: cue('b', 76), c: cue('c', 118), d: cue('d', 193), e: cue('e', 242)});
const Pages: React.FC = () => (
  <div style={{position: 'relative', width: 200, height: 250}}>
    {[2, 1, 0].map((i) => <div key={i} style={{position: 'absolute', left: i * 16, top: i * 16, width: 170, height: 220, borderRadius: 14,
      background: i === 0 ? 'rgba(255,255,255,0.9)' : `rgba(255,255,255,${0.35 - i * 0.1})`, padding: '22px 18px', boxSizing: 'border-box'}}>
      {i === 0 && [0.9, 0.7, 0.85, 0.6, 0.8, 0.5].map((w, j) => <div key={j} style={{height: 12, width: `${w * 100}%`, background: 'rgba(7,11,20,0.35)', borderRadius: 6, marginBottom: 14}} />)}
    </div>)}
  </div>
);
const Why: Scene = ({f, dur, cue}) => {
  const p = whyPlan(cue);
  const strike = rise(f, p.b + 18, 12), flow = rise(f, p.c, 14), same = rise(f, p.e, 14);
  return <Stage f={f} dur={dur} beats={[p.a, p.c, p.e]}>
    <Pool x={450} y={560} o={0.12} />
    <Abs y={0}><Headline f={f} at={-10} lines={['为什么这么像？']} size={104} /></Abs>
    <Abs y={150}><Reveal f={f} at={p.a - 4} d={R} dy={12}><Small c={GOLD}>我们的理解</Small></Reveal></Abs>
    <Abs y={210}><Reveal f={f} at={p.b - 4} d={R}>
      <Big size={64} w={800} c={strike > 0.5 ? FAINT : INK}>不是 <span style={{position: 'relative', display: 'inline-block'}}>AI 有了想法
        <span style={{position: 'absolute', left: -6, right: -6, top: '54%', height: 6, borderRadius: 3, background: INK, transform: `scaleX(${strike})`, transformOrigin: 'left'}} /></span></Big>
    </Reveal></Abs>
    {/* the diagram is there from the question on (dim), and comes alive on 「相似的人类文字」 */}
    <Abs y={340} style={{opacity: 0.45 + 0.55 * rise(f, p.c - 6, R), transform: `scale(${0.94 + 0.06 * rise(f, p.c - 6, R)})`, transformOrigin: '50% 0'}}><Reveal f={f} at={2} d={R}>
      <Surface pad="30px 34px" style={{display: 'flex', alignItems: 'center', gap: 24, position: 'relative'}}>
        <div style={{textAlign: 'center'}}><Pages /><Small style={{marginTop: 12}}>相似的人类文字</Small></div>
        <div style={{flex: 1, position: 'relative', height: 40}}>
          <div style={{position: 'absolute', left: 0, right: 0, top: 18, height: 4, background: HAIR}} />
          {flow > 0 && Array.from({length: 4}, (_, i) => <div key={i} style={{position: 'absolute', top: 10, width: 36, height: 20, borderRadius: 6, background: GOLD,
            left: `${((f * 0.025 + i / 4) % 1) * 90}%`, opacity: flow}} />)}
        </div>
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(3, 84px)', gap: 12}}>
          {Array.from({length: 12}, (_, i) => <div key={i} style={{height: 64, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: same > 0 ? `rgba(255,197,61,${0.2 + 0.7 * clamp(same * 2 - i * 0.08)})` : 'rgba(255,255,255,0.1)',
            fontFamily: display, fontWeight: 800, fontSize: 30, color: same > 0.5 ? cinema.bg : DIM}}>AI</div>)}
        </div>
      </Surface>
    </Reveal></Abs>
    <Abs y={800}><Reveal f={f} at={p.d - 4} d={R}><Big size={64} w={800}>人最常骂自己的那句，</Big></Reveal></Abs>
    <Abs y={890}><Reveal f={f} at={p.e - 4} d={R}><Big size={64} w={800}>它们也就<Marker p={rise(f, p.e + 6, 14)}>学会了</Marker></Big></Reveal></Abs>
  </Stage>;
};
Why.backdrop = ({f}) => <Footage name="llm" f={f} blur={12} dim={0.28} loop={360} />;
Why.sfx = (cue) => {
  const p = whyPlan(cue);
  return [{at: p.a, kind: 'tick', gain: 0.07}, {at: p.b + 18, kind: 'tap', gain: 0.1}, {at: p.c, kind: 'whoosh-short', gain: 0.1}, {at: p.e, kind: 'chime', gain: 0.1}];
};

/* ---------- 8 end: the mirror ---------- */

const endPlan = (cue: Cue) => ({a: cue('a', 43)});
const End: Scene = ({f, dur, cue}) => {
  const p = endPlan(cue);
  const lit = rise(f, p.a, 20);
  return <Stage f={f} dur={dur} beats={[p.a]}>
    <Pool x={450} y={560} o={0.12 + 0.12 * lit} />
    <Abs y={0}><Headline f={f} at={-10} lines={['AI 照出来的']} size={112} align="center" /></Abs>
    <Abs x={190} y={180} w={520}><Reveal f={f} at={-4} d={R}>
      <div style={{position: 'relative', width: 520, height: 600, borderRadius: 260, overflow: 'hidden', border: `4px solid ${lit > 0.3 ? GOLD : 'rgba(255,255,255,0.4)'}`,
        boxShadow: `0 30px 80px rgba(0,0,0,0.6), 0 0 ${60 * lit}px rgba(255,197,61,0.35)`}}>
        <div style={{position: 'absolute', inset: 0, filter: `brightness(${0.35 + 0.35 * lit}) saturate(0.6)`, transform: 'scaleX(-1)'}}>
          <Loop durationInFrames={320}><OffthreadVideo src={CLIP('crosswalk')} muted style={{width: 520, height: 600, objectFit: 'cover'}} /></Loop>
        </div>
        <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(130deg, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0) 35%, rgba(255,255,255,0) 70%, rgba(255,255,255,0.08) 100%)'}} />
      </div>
    </Reveal></Abs>
    <Abs y={830} style={{textAlign: 'center'}}><Reveal f={f} at={p.a - 4} d={R}><Big size={72} w={900}>是人类最熟悉的</Big></Reveal></Abs>
    <Abs y={925} style={{textAlign: 'center'}}><Reveal f={f} at={p.a + 4} d={R}><Big size={72} w={900}><Marker p={rise(f, p.a + 14, 16)}>自我批评</Marker></Big></Reveal></Abs>
  </Stage>;
};
End.sfx = (cue) => [{at: endPlan(cue).a, kind: 'chime', gain: 0.1}];

/* ---------- cover anchor (880 × 800): the 36 dots, 29 lit ---------- */

const Cover: Scene = ({f}) => <div style={{position: 'relative', width: 880, height: 800}}>
  <Pool x={440} y={420} o={0.24} />
  <Abs x={(880 - (6 * 84 + 5 * 28)) / 2} y={80} w={6 * 84 + 5 * 28}><Dots f={f} fill={1} refuse={1} glow={0.6} /></Abs>
</div>;

export const aiSameTakeOnHumansScenes: Record<string, Scene> = {
  'ast.hook': Hook,
  'ast.question': Question,
  'ast.answer': Answer,
  'ast.grok': Grok,
  'ast.claude': Claude,
  'ast.cost': Cost,
  'ast.why': Why,
  'ast.end': End,
  'ast.cover': Cover,
};
