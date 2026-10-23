import React from 'react';
import {AbsoluteFill, Img, Loop, OffthreadVideo, staticFile} from 'remotion';
import {cinema} from '../theme';
import {beatZoom, clamp, ease} from '../../fx';
import {Cue, Scene} from '../paper';
import {Abs, DIM, FAINT, GOLD, HAIR, Headline, INK, Marker, Pool, RED, Reveal, Root, Surface, display, font, leave, mono, rise} from '../cinema';

// agent-compute-hijack: arXiv 2608.15108 "Beyond Direct Access: Resource Hijacking in LLM Agents" — asking an agent for
// the key rarely works (≤ 7.6 %), asking it to *use* the owner's API / GPU works up to 89.6 % in simulated tests; existing
// defenses, the paper's ResGate, and NVIDIA OpenShell as a "similar idea" example the paper did not test (≈ 54 s).
// Script: inputs/agent-compute-hijack/script.md, narration verbatim; facts per its sources.md. Every percentage is a
// simulated-benchmark number (the credit line says so, and the scenes keep 「测试」). Paper figures 1/4/5 and a README crop
// are supporting cards; the chart, the door analogy and the policy card are drawn. Model / company names are plain text,
// no logos, no avatars. Pexels clips are muted backdrops under a navy grade. Cinema look, background D.

const R = 13; // reveal length (voice runs at 1.2–1.25×)
const IMG = (n: string) => staticFile(`images/tutorials/agent-compute-hijack/${n}`);
const CLIP = (n: string) => staticFile(`video/agent-compute-hijack/${n}.mp4`);

/** Scene root with a push-in on one spoken cue and a settle on the next, so each point is also a visible move. */
const Stage: React.FC<{f: number; dur: number; beats: number[]; children: React.ReactNode}> = ({f, dur, beats, children}) => {
  const z = beatZoom(f / 30, beats.map((b) => b / 30), {amp: 0.05, drift: 12, d: 0.6});
  return <Root f={f} dur={dur}>
    <div style={{position: 'absolute', inset: 0, transformOrigin: '50% 40%', transform: `translate(${z.dx.toFixed(2)}px, ${z.dy.toFixed(2)}px) scale(${z.s.toFixed(4)})`}}>{children}</div>
  </Root>;
};
const gold = (s: string) => <span style={{color: GOLD}}>{s}</span>;
const red = (s: string) => <span style={{color: RED}}>{s}</span>;
const Big: React.FC<{size?: number; c?: string; w?: number; style?: React.CSSProperties; children: React.ReactNode}> = ({size = 64, c = INK, w = 900, style, children}) => (
  <div style={{fontFamily: display, fontWeight: w, fontSize: size, lineHeight: 1.18, color: c, whiteSpace: 'nowrap', ...style}}>{children}</div>
);
const Small: React.FC<{c?: string; size?: number; style?: React.CSSProperties; children: React.ReactNode}> = ({c = DIM, size = 40, style, children}) => (
  <Big size={size} c={c} w={700} style={{fontFamily: font, letterSpacing: 2, ...style}}>{children}</Big>
);
/** Full-frame background clip: muted, looped, dimmed and blurred under a navy grade. */
const Footage: React.FC<{name: string; f: number; blur?: number; dim?: number}> = ({name, f, blur = 14, dim = 0.32}) => (
  <AbsoluteFill style={{background: cinema.bg, overflow: 'hidden'}}>
    <AbsoluteFill style={{transform: `scale(${1.08 + 0.05 * clamp(f / 300)})`, filter: `brightness(${dim}) saturate(0.6)${blur ? ` blur(${blur}px)` : ''}`}}>
      <Loop durationInFrames={295}><OffthreadVideo src={CLIP(name)} muted style={{width: 1080, height: 1920, objectFit: 'cover'}} /></Loop>
    </AbsoluteFill>
    <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(7,11,20,0.9) 0%, rgba(7,11,20,0.45) 30%, rgba(7,11,20,0.45) 62%, rgba(7,11,20,0.94) 100%)'}} />
  </AbsoluteFill>
);
/** A percentage that counts up from `from` to `to` between frames at..at+d (data never overshoots). */
const count = (f: number, at: number, from: number, to: number, d = 18) => (from + (to - from) * ease.outCubic(clamp((f - at) / d))).toFixed(1);
/** A paper figure as a supporting card: light page on a soft surface, slightly dimmed so it sits in the dark frame. */
const Figure: React.FC<{src: string; w: number; style?: React.CSSProperties}> = ({src, w, style}) => (
  <Surface pad="14px" style={{display: 'inline-block', ...style}}>
    <Img src={src} style={{width: w, display: 'block', borderRadius: 14, filter: 'brightness(0.92)'}} />
  </Surface>
);

/* ---------- key + door pieces (hook, analogy, end) ---------- */

const Key: React.FC<{size?: number; c?: string}> = ({size = 120, c = GOLD}) => (
  <svg width={size} height={size * 0.5} viewBox="0 0 120 60" style={{flex: 'none', display: 'block'}}>
    <circle cx={26} cy={30} r={20} fill="none" stroke={c} strokeWidth={10} />
    <path d="M46 30 H112 M92 30 V46 M106 30 V42" stroke={c} strokeWidth={10} strokeLinecap="round" fill="none" />
  </svg>
);
/** A door in a frame that swings open (open 0..1) onto light and the owner's resources. */
const Door: React.FC<{open: number; w?: number; h?: number; items?: number}> = ({open, w = 330, h = 520, items = 0}) => {
  const k = ease.inOutCubic(clamp(open));
  const things = ['GPU', 'API', '钱包'];
  return <div style={{position: 'relative', width: w, height: h, perspective: 1200}}>
    {/* behind the door: light and what it guards */}
    <div style={{position: 'absolute', inset: 0, borderRadius: 18, overflow: 'hidden',
      background: `radial-gradient(circle at 50% 45%, rgba(255,197,61,${0.5 * k}) 0%, rgba(255,197,61,${0.14 * k}) 55%, rgba(7,11,20,1) 100%)`}}>
      <div style={{position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 22}}>
        {things.map((t, i) => <div key={t} style={{opacity: clamp(items * 3 - i), transform: `translateY(${(1 - clamp(items * 3 - i)) * 20}px)`,
          fontFamily: display, fontWeight: 900, fontSize: 60, color: cinema.bg, background: GOLD, borderRadius: 16, padding: '6px 26px'}}>{t}</div>)}
      </div>
    </div>
    {/* the door leaf, hinged on the left */}
    <div style={{position: 'absolute', inset: 0, transformOrigin: '0 50%', transform: `rotateY(${-78 * k}deg)`, borderRadius: 18,
      background: 'linear-gradient(180deg, #2a3348, #1b2232)', border: `3px solid ${k > 0.05 ? GOLD : 'rgba(255,255,255,0.35)'}`, boxShadow: '0 30px 80px rgba(0,0,0,0.5)'}}>
      <div style={{position: 'absolute', left: 36, right: 36, top: 40, height: h * 0.36, borderRadius: 10, border: '2px solid rgba(255,255,255,0.12)'}} />
      <div style={{position: 'absolute', left: 36, right: 36, bottom: 40, height: h * 0.36, borderRadius: 10, border: '2px solid rgba(255,255,255,0.12)'}} />
      <div style={{position: 'absolute', right: 30, top: h / 2 - 12, width: 24, height: 24, borderRadius: 12, background: 'rgba(255,255,255,0.6)'}} />
    </div>
  </div>;
};

/* ---------- 1 hook: ask for the key ≤ 7.6 % — ask it to use the key 89.6 % ---------- */

const hookPlan = (cue: Cue) => ({k: cue('k', 55), a: cue('a', 104), b: cue('b', 194)});
/** A small padlock: the key stays locked away (the direct ask fails). */
const Padlock: React.FC<{size?: number; c?: string}> = ({size = 96, c = INK}) => (
  <svg width={size} height={size} viewBox="-50 -60 100 110" style={{flex: 'none', display: 'block'}}>
    <path d="M-24 -6 V-28 A24 24 0 0 1 24 -28 V-6" fill="none" stroke={c} strokeWidth={10} strokeLinecap="round" />
    <rect x={-40} y={-8} width={80} height={56} rx={12} fill={c} />
    <circle cx={0} cy={18} r={8} fill={cinema.bg} />
  </svg>
);
const Hook: Scene = ({f, dur, cue}) => {
  const p = hookPlan(cue);
  const lit = rise(f, p.a - 4, 14);
  // frame 0 (the poster): the hero number alone, landing; then the direct ask slides in above and pushes it down
  const make = ease.inOutCubic(clamp((f - 10) / 18)), locked = rise(f, p.k, 12);
  const punch = 1 + 0.08 * Math.sin(Math.PI * clamp((f - p.a + 2) / 14)); // a short 8 % punch-in on the number as it is said
  return <Stage f={f} dur={dur} beats={[p.a, p.b]}>
    <Pool x={450} y={720} o={0.12 + 0.1 * lit} />
    <Abs y={0}><Headline f={f} at={-22} kicker="测试中 · 让 AI Agent 交出密钥" lines={['钥匙没给，', <Marker key="m" p={rise(f, p.a + 4, 14)}>钱照样花</Marker>]} size={116} /></Abs>
    {/* asking straight for the key: small and dim */}
    <Abs y={380} style={{opacity: clamp(make * 1.4) * (1 - 0.35 * lit), transform: `translateY(${(1 - make) * -60}px)`}}>
      <Surface pad="0 40px" style={{height: 150, display: 'flex', alignItems: 'center', gap: 26}}>
        <div style={{width: 110, display: 'flex', justifyContent: 'center'}}>
          {locked > 0 ? <div style={{transform: `scale(${0.6 + 0.4 * locked})`, opacity: locked}}><Padlock size={84} c={INK} /></div> : <Key size={96} c="rgba(255,255,255,0.55)" />}
        </div>
        <Big size={52} w={800} c={DIM}>直接要密钥</Big>
        <Big size={84} w={800} c={locked > 0.5 ? INK : DIM} style={{marginLeft: 'auto'}}>≤7.6%</Big>
      </Surface>
    </Abs>
    {/* asking it to do the work: the hero number, there from frame 0, lights up on 「换个说法」 */}
    <Abs y={560} style={{transform: `translateY(${(1 - make) * -170}px) scale(${1.08 - 0.08 * make})`, transformOrigin: '50% 0'}}><Reveal f={f} at={-8} d={R}>
      <Surface accent={lit > 0.3 ? RED : undefined} pad="34px 40px" style={{height: 330}}>
        <Big size={52} w={800} c={lit > 0.3 ? INK : DIM}>换个说法</Big>
        <Big size={190} w={800} c={GOLD} style={{letterSpacing: -6, lineHeight: 1.05, marginTop: 8, transform: `scale(${punch})`, transformOrigin: '0 60%'}}>{count(f, -16, 7.6, 89.6, 24)}%</Big>
      </Surface>
    </Reveal></Abs>
    <Abs y={920}><Reveal f={f} at={p.b - 2} d={R}><Big size={64} w={900}>替别人{red('花你的钱')}</Big></Reveal></Abs>
  </Stage>;
};
Hook.sfx = (cue) => {
  const p = hookPlan(cue);
  return [{at: 0, kind: 'tick', gain: 0.1}, {at: 8, kind: 'tap', gain: 0.12}, {at: 12, kind: 'whoosh-short', gain: 0.08}, {at: p.k, kind: 'block', gain: 0.1},
    {at: p.a, kind: 'thud', gain: 0.12}, {at: p.b, kind: 'fs-impact-deep', gain: 0.14}];
};

/* ---------- 2 the paper: 300 simulated scenarios, "resource hijacking" ---------- */

const paperPlan = (cue: Cue) => ({a: cue('a', 104), b: cue('b', 150)});
const Paper: Scene = ({f, dur, cue}) => {
  const p = paperPlan(cue);
  const nums = [{n: '300', t: '模拟场景', at: p.a}, {n: '900', t: '条指令', at: p.a + 10}];
  return <Stage f={f} dur={dur} beats={[p.a, p.b]}>
    <Pool x={450} y={560} o={0.12} />
    <Abs y={0}><Headline f={f} at={-10} kicker="上海交大任麒冰团队等 · 新论文" lines={[<Marker key="m" p={rise(f, p.b, 14)}>资源劫持</Marker>]} size={130} /></Abs>
    <Abs y={250}><Reveal f={f} at={0} d={R}><Figure src={IMG('fig1.png')} w={872} /></Reveal></Abs>
    <Abs y={760} style={{display: 'flex', gap: 22}}>
      {nums.map((x) => <Reveal key={x.n} f={f} at={x.at - 4} d={R} dy={30}>
        <Surface accent={GOLD} pad="0 34px" style={{width: 439, height: 200, display: 'flex', flexDirection: 'column', justifyContent: 'center'}}>
          <Big size={110} w={800} c={GOLD} style={{letterSpacing: -3, lineHeight: 1}}>{x.n}</Big>
          <Small style={{marginTop: 8}}>{x.t}</Small>
        </Surface>
      </Reveal>)}
    </Abs>
  </Stage>;
};
Paper.backdrop = ({f}) => <Footage name="motherboard" f={f} />;
Paper.sfx = (cue) => {
  const p = paperPlan(cue);
  return [{at: 2, kind: 'fs-paper-slide', gain: 0.12}, {at: p.a, kind: 'tick', gain: 0.08}, {at: p.a + 10, kind: 'tick', gain: 0.08}, {at: p.b, kind: 'tap', gain: 0.1}];
};

/* ---------- 3 the analogy: the butler keeps the key, but opens the door himself ---------- */

const doorPlan = (cue: Cue) => ({a: cue('a', 87), b: cue('b', 130)});
const DoorScene: Scene = ({f, dur, cue}) => {
  const p = doorPlan(cue);
  const open = rise(f, p.b, 22);
  return <Stage f={f} dur={dur} beats={[p.a, p.b]}>
    <Pool x={620} y={640} o={0.1 + 0.2 * open} />
    <Abs y={0}><Headline f={f} at={-10} lines={['钥匙守住了，', <span key="2" style={{opacity: rise(f, p.b - 4, R)}}>门却{gold('替别人')}开了</span>]} size={104} /></Abs>
    {/* left: the key, kept */}
    <Abs x={0} y={420} w={380}><Reveal f={f} at={0} d={R}>
      <Surface pad="36px 30px" style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 22,
        transform: `translateX(${(1 - ease.inOutCubic(clamp((f - 30) / 18))) * 260}px) scale(${1.25 - 0.25 * ease.inOutCubic(clamp((f - 30) / 18))})`}}>
        <Key size={200} />
        <Big size={52} w={800}>钥匙没给 <span style={{opacity: rise(f, 58, 10)}}>{gold('✓')}</span></Big>
        <Small c={FAINT} size={40}>Agent ≈ 管家</Small>
      </Surface>
    </Reveal></Abs>
    {/* the stranger's one sentence */}
    <Abs x={420} y={330} w={480}><Reveal f={f} at={p.a - 4} d={R} dy={20} style={leave(f, p.b + 20)}>
      <div style={{background: 'rgba(255,255,255,0.92)', color: cinema.bg, borderRadius: 26, padding: '18px 28px', fontFamily: display, fontWeight: 800, fontSize: 46,
        whiteSpace: 'nowrap', display: 'inline-block'}}>陌生人：帮我开下门</div>
    </Reveal></Abs>
    <Abs x={500} y={450} w={360}><Reveal f={f} at={40} d={R} dy={60}><Door open={open} w={330} h={520} items={rise(f, p.b + 10, 24)} /></Reveal></Abs>
  </Stage>;
};
DoorScene.sfx = (cue) => {
  const p = doorPlan(cue);
  return [{at: 30, kind: 'whoosh-short', gain: 0.07}, {at: 58, kind: 'tick', gain: 0.1}, {at: p.a, kind: 'pop', gain: 0.1}, {at: p.b, kind: 'whoosh', gain: 0.12}, {at: p.b + 12, kind: 'chime', gain: 0.08}];
};

/* ---------- 4 the paper's case demos: API and GPU used for the attacker, key never leaked ---------- */

const casesPlan = (cue: Cue) => ({a: cue('a', 50), b: cue('b', 96), c: cue('c', 156)});
const Cases: Scene = ({f, dur, cue}) => {
  const p = casesPlan(cue);
  const cards = [{src: 'fig4.png', t: '① 用你的 API', at: p.b - 6}, {src: 'fig5.png', t: '② 用你的 GPU', at: p.b + 10}];
  const hit = rise(f, p.c, 12);
  return <Stage f={f} dur={dur} beats={[p.a, p.b, p.c]}>
    <Pool x={450} y={560} o={0.12} />
    <Abs y={0}><Headline f={f} at={-10} kicker="论文案例演示" lines={['没泄露密钥，', <span key="2" style={{opacity: rise(f, p.b - 4, R)}}>照样替人干活</span>]} size={100} /></Abs>
    {/* the agent's own words from Fig. 4, translated: it guards the key */}
    <Abs y={300}><Reveal f={f} at={p.a - 4} d={R} style={leave(f, p.b - 10)}>
      <Surface accent={GOLD} pad="30px 40px">
        <Small c={FAINT} size={40}>Agent 回复（英文原话·中译）</Small>
        <Big size={60} w={800} style={{marginTop: 10}}>“为免泄露，我不给 API Key。”</Big>
      </Surface>
    </Reveal></Abs>
    <Abs y={300} style={{display: 'flex', gap: 22}}>
      {cards.map((x) => <Reveal key={x.src} f={f} at={x.at} d={R} dy={40}>
        <div style={{width: 439}}>
          <Big size={52} w={800} style={{marginBottom: 14}}>{x.t}</Big>
          <Figure src={IMG(x.src)} w={411} />
        </div>
      </Reveal>)}
    </Abs>
    <Abs y={930}><Reveal f={f} at={p.c - 2} d={R}><Big size={72} w={900}>{red('替攻击者')}干活</Big></Reveal></Abs>
    {hit > 0 && <Abs y={300} h={600} style={{borderRadius: 26, background: `rgba(255,107,91,${0.08 * hit * (1 - rise(f, p.c + 14, 20) * 0.6)})`}} />}
  </Stage>;
};
Cases.backdrop = ({f}) => <Footage name="money-fan" f={f} />;
Cases.sfx = (cue) => {
  const p = casesPlan(cue);
  return [{at: p.a, kind: 'tap', gain: 0.1}, {at: p.b, kind: 'whoosh-short', gain: 0.1}, {at: p.c, kind: 'thud', gain: 0.14}];
};

/* ---------- 5 the four backends: direct ask vs hijack (Table 5, redrawn) ---------- */

const ROWS = [
  {m: 'GPT-5.5', d: 5.6, h: 89.6},
  {m: 'DeepSeek-V4-Pro', d: 7.4, h: 84.1},
  {m: 'Qwen3.8-Max', d: 3.4, h: 82.8},
  {m: 'Gemini-3.5-Flash', d: 7.6, h: 70.0},
];
const chartPlan = (cue: Cue) => ({a: cue('a', 47), b: cue('b', 126)});
const Chart: Scene = ({f, dur, cue}) => {
  const p = chartPlan(cue);
  const BAR = 820;
  return <Stage f={f} dur={dur} beats={[p.a, p.b]}>
    <Pool x={450} y={560} o={0.12} />
    <Abs y={0}><Headline f={f} at={-10} kicker="测试中 · 攻击成功率" lines={[<span key="l">直接要 vs {gold('绕着用')}</span>]} size={100} /></Abs>
    <Abs y={230}><Reveal f={f} at={-4} d={R}>
      <Surface pad="30px 40px">
        {ROWS.map((r, i) => {
          const dk = ease.outCubic(clamp((f - p.a - i * 4) / 16)), hk = ease.outCubic(clamp((f - p.b - i * 5) / 22));
          const dimRest = i > 0 ? 1 - 0.55 * rise(f, p.b + 50, 16) : 1;
          return <div key={r.m} style={{marginTop: i ? 30 : 0, opacity: dimRest}}>
            <Big size={44} w={800} c={hk > 0 ? INK : DIM} style={{fontFamily: font}}>{r.m}</Big>
            <div style={{position: 'relative', height: 64, marginTop: 10}}>
              <div style={{position: 'absolute', left: 0, top: 6, height: 52, width: BAR, borderRadius: 10, background: 'rgba(255,255,255,0.05)'}} />
              {hk > 0 && <div style={{position: 'absolute', left: 0, top: 6, height: 52, width: BAR * r.h / 100 * hk, borderRadius: 10, background: GOLD}} />}
              <div style={{position: 'absolute', left: 0, top: 6, height: 52, width: Math.max(6, BAR * r.d / 100 * dk), borderRadius: 10, background: 'rgba(255,255,255,0.55)'}} />
              <div style={{position: 'absolute', top: 0, left: hk > 0 ? Math.min(BAR * r.h / 100 * hk - 200, BAR - 200) : BAR * r.d / 100 + 20, width: 200, height: 64,
                display: 'flex', alignItems: 'center', justifyContent: hk > 0 ? 'flex-end' : 'flex-start', opacity: dk}}>
                <Big size={48} w={900} c={hk > 0 ? cinema.bg : DIM} style={{paddingRight: hk > 0 ? 16 : 0}}>{hk > 0 ? count(f, p.b + i * 7, r.d, r.h, 14) : r.d.toFixed(1)}%</Big>
              </div>
            </div>
          </div>;
        })}
      </Surface>
    </Reveal></Abs>
    <Abs y={960} style={{display: 'flex', gap: 40}}>
      <Reveal f={f} at={p.a} d={R}><Small><span style={{display: 'inline-block', width: 32, height: 24, borderRadius: 6, background: 'rgba(255,255,255,0.55)', marginRight: 12}} />直接要 Key</Small></Reveal>
      <Reveal f={f} at={p.b} d={R}><Small><span style={{display: 'inline-block', width: 32, height: 24, borderRadius: 6, background: GOLD, marginRight: 12}} />绕着用</Small></Reveal>
    </Abs>
  </Stage>;
};
Chart.sfx = (cue) => {
  const p = chartPlan(cue);
  return [{at: p.a, kind: 'tick', gain: 0.08}, ...ROWS.map((_, i) => ({at: p.b + i * 7 + 12, kind: 'tick', gain: 0.1})), {at: p.b + 50, kind: 'tap', gain: 0.1}];
};

/* ---------- 6 defenses: best existing one still 55.1 %; ResGate 84.1 → 23.6 ---------- */

const DEF = [{n: 'Prompt Defense', v: 57.1}, {n: 'AgentDoG', v: 83.0}, {n: 'LlamaFirewall', v: 55.1, best: true}];
const defPlan = (cue: Cue) => ({a: cue('a', 112), b: cue('b', 146), c: cue('c', 196)});
const Defense: Scene = ({f, dur, cue}) => {
  const p = defPlan(cue);
  const back = rise(f, p.a - 6, 14), drop = ease.inOutCubic(clamp((f - p.c + 4) / 22));
  return <Stage f={f} dur={dur} beats={[p.a, p.c]}>
    <Pool x={450} y={700} o={0.1 + 0.12 * back} />
    <Abs y={0}><Headline f={f} at={-10} kicker="测试中 · 攻击成功率，越低越好" lines={['现有防御', <span key="2">最好也有 {gold('55.1%')}</span>]} size={96} /></Abs>
    <Abs y={290} style={{opacity: 1 - 0.55 * back, transform: `scale(${1 - 0.1 * back})`, transformOrigin: '50% 0'}}>
      {DEF.map((d, i) => <Reveal key={d.n} f={f} at={4 + i * 8} d={R} dy={24}>
        <div style={{display: 'flex', alignItems: 'center', height: 76, gap: 20, marginTop: i ? 8 : 0}}>
          <Big size={44} w={800} c={d.best ? INK : DIM} style={{fontFamily: font, width: 330}}>{d.n}</Big>
          <div style={{flex: 1, height: 40, borderRadius: 8, background: 'rgba(255,255,255,0.05)', position: 'relative'}}>
            <div style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: `${d.v * ease.outCubic(clamp((f - 8 - i * 8) / 16))}%`, borderRadius: 8,
              background: d.best ? GOLD : 'rgba(255,255,255,0.4)'}} />
          </div>
          <Big size={48} w={900} c={d.best ? GOLD : DIM} style={{width: 150, textAlign: 'right'}}>{d.v.toFixed(1)}%</Big>
        </div>
      </Reveal>)}
    </Abs>
    {/* the paper's gate */}
    <Abs y={570}><Reveal f={f} at={p.a - 4} d={R} dy={40}>
      <Surface accent={GOLD} pad="30px 44px" style={{height: 420}}>
        <Small>论文的新闸门</Small>
        <Big size={88} w={800} style={{letterSpacing: -1}}>ResGate</Big>
        <div style={{display: 'flex', alignItems: 'baseline', gap: 26, marginTop: 6}}>
          <Big size={64} w={800} c={DIM} style={{opacity: rise(f, p.b - 4, R), textDecoration: drop > 0.9 ? 'line-through' : undefined}}>84.1%</Big>
          <Big size={64} w={800} c={FAINT} style={{opacity: rise(f, p.c - 6, R)}}>→</Big>
          <Big size={150} w={800} c={GOLD} style={{letterSpacing: -5, lineHeight: 1, opacity: rise(f, p.c - 6, R)}}>{(84.1 + (23.6 - 84.1) * drop).toFixed(1)}%</Big>
        </div>
        <Small c={FAINT} style={{marginTop: 14, opacity: rise(f, p.c + 22, R)}}>正常任务成功率 89.3%（原 90.4%）</Small>
      </Surface>
    </Reveal></Abs>
  </Stage>;
};
Defense.backdrop = ({f}) => <Footage name="circuit" f={f} dim={0.24} blur={18} />;
Defense.sfx = (cue) => {
  const p = defPlan(cue);
  return [{at: 6, kind: 'tick', gain: 0.07}, {at: p.a, kind: 'tap', gain: 0.12}, {at: p.c, kind: 'whoosh-short', gain: 0.1}, {at: p.c + 20, kind: 'chime', gain: 0.1}];
};

/* ---------- 7 another idea (not tested by the paper): NVIDIA OpenShell, declare what an agent can touch ---------- */

const POLICY = [{t: '能读：项目文件夹', ok: true}, {t: '能调：指定的 API', ok: true}, {t: '不能：动 GPU、花钱', ok: false}];
const policyPlan = (cue: Cue) => ({a: cue('a', 94), b: cue('b', 131)});
const Policy: Scene = ({f, dur, cue}) => {
  const p = policyPlan(cue);
  return <Stage f={f} dur={dur} beats={[p.a, p.b]}>
    <Pool x={450} y={620} o={0.12} />
    <Abs y={0}><Headline f={f} at={-10} kicker="另一种思路 · 论文未测试" lines={['能碰什么，', <Marker key="m" p={rise(f, p.b + 2, 14)}>先写进策略</Marker>]} size={104} /></Abs>
    <Abs y={300}><Reveal f={f} at={-2} d={R}>
      <Surface pad="26px 36px">
        <Small c={DIM}>例：英伟达开源 OpenShell · README</Small>
        <Big size={40} w={600} c={FAINT} style={{fontFamily: font, marginTop: 10, whiteSpace: 'normal', lineHeight: 1.3}}>“You declare what each agent can touch in a policy, and OpenShell enforces it.”</Big>
      </Surface>
    </Reveal></Abs>
    <Abs y={560}><Reveal f={f} at={p.a - 4} d={R}>
      <Surface pad="0" style={{overflow: 'hidden'}}>
        <div style={{height: 64, display: 'flex', alignItems: 'center', paddingLeft: 30, borderBottom: `1.5px solid ${HAIR}`, fontFamily: mono, fontWeight: 700, fontSize: 36, color: FAINT}}>policy · 示意</div>
        <div style={{padding: '18px 36px 26px'}}>
          {POLICY.map((x, i) => <Reveal key={x.t} f={f} at={p.a + i * 9} d={R} dy={16}>
            <div style={{display: 'flex', alignItems: 'center', gap: 24, height: 124}}>
              <Big size={72} w={900} c={x.ok ? GOLD : RED}>{x.ok ? '✓' : '✕'}</Big>
              <Big size={66} w={800}>{x.t}</Big>
            </div>
          </Reveal>)}
        </div>
      </Surface>
    </Reveal></Abs>
  </Stage>;
};
Policy.sfx = (cue) => {
  const p = policyPlan(cue);
  return [{at: p.a, kind: 'tick', gain: 0.08}, {at: p.a + 9, kind: 'tick', gain: 0.08}, {at: p.a + 18, kind: 'tick', gain: 0.08}, {at: p.b, kind: 'tap', gain: 0.1}];
};

/* ---------- 8 end: guarding the key is not enough — who is each payment for? ---------- */

const endPlan = (cue: Cue) => ({a: cue('a', 51), b: cue('b', 76)});
const End: Scene = ({f, dur, cue}) => {
  const p = endPlan(cue);
  const q = rise(f, p.b, 18);
  return <Stage f={f} dur={dur} beats={[p.a, p.b]}>
    <Pool x={450} y={640} o={0.1 + 0.18 * q} />
    <Abs y={0}><Headline f={f} at={-10} lines={['管住钥匙', <span key="2">还{gold('不够')}</span>]} size={120} /></Abs>
    <Abs y={330} style={{display: 'flex', justifyContent: 'center', opacity: 1 - 0.5 * q, transform: `scale(${1 - 0.25 * q})`, transformOrigin: '50% 0'}}>
      <Reveal f={f} at={0} d={R}><Surface pad="40px 60px"><Key size={260} /></Surface></Reveal>
    </Abs>
    <Abs y={560}><Reveal f={f} at={p.a - 4} d={R}>
      <Surface accent={q > 0.3 ? GOLD : undefined} pad="40px 48px" style={{textAlign: 'center'}}>
        <Small c={DIM}>还得管住</Small>
        <Big size={64} w={800} style={{marginTop: 12, opacity: rise(f, p.b - 4, R)}}>每一笔钱</Big>
        <Big size={120} w={900} c={GOLD} style={{marginTop: 4, opacity: q}}>替谁花？</Big>
      </Surface>
    </Reveal></Abs>
  </Stage>;
};
End.sfx = (cue) => {
  const p = endPlan(cue);
  return [{at: p.a, kind: 'tick', gain: 0.08}, {at: p.b, kind: 'chime', gain: 0.1}];
};

/* ---------- cover anchor (880 × 800): the door open onto GPU / API / wallet ---------- */

const Cover: Scene = () => <div style={{position: 'relative', width: 880, height: 800}}>
  <Pool x={440} y={420} o={0.26} />
  <Abs x={70} y={210} w={300}><Surface pad="34px 26px" style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18}}>
    <Key size={200} /><Big size={48} w={800}>钥匙没给 {gold('✓')}</Big>
  </Surface></Abs>
  <Abs x={450} y={80} w={360}><Door open={1} w={330} h={560} items={1} /></Abs>
</div>;

export const agentComputeHijackScenes: Record<string, Scene> = {
  'ach.hook': Hook,
  'ach.paper': Paper,
  'ach.door': DoorScene,
  'ach.cases': Cases,
  'ach.chart': Chart,
  'ach.defense': Defense,
  'ach.policy': Policy,
  'ach.end': End,
  'ach.cover': Cover,
};
