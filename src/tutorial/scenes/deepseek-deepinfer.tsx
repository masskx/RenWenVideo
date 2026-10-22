import React from 'react';
import {cinema} from '../theme';
import {clamp, ease} from '../../fx';
import {Cue, Scene} from '../paper';
import {Abs, DIM, FAINT, GOLD, HAIR, Headline, INK, Marker, Pool, Reveal, Root, Surface, display, font, leave, rise} from '../cinema';

// deepseek-deepinfer: DeepSeek open-sourced its production inference framework DeepInfer (20 Oct 2026) — what an inference
// framework is, why it matters for cost, what is in it and what isn't (≈ 37 s, voice 1.2–1.25×).
// Script: inputs/deepseek-deepinfer/script.md, tightened for the ear (storyboard lists the changes); facts as verified in its
// README (观察者网 2026-10-22): no cost numbers, "真正的OpenAI" only as what overseas netizens call it, compatibility with
// 英伟达 SM100 / 华为昇腾950, KV cache / prefill-decode split / load balancing not fully included. All visuals drawn; company and
// product names are plain text, no logos, no people. Cinema look, background D. Reveals run ~1.2× faster than the default.

const R = 13; // reveal length in frames (16 by default; the user asked for 1.2–1.25× pacing)
const gold = (s: string) => <span style={{color: GOLD}}>{s}</span>;
const Big: React.FC<{size?: number; c?: string; w?: number; style?: React.CSSProperties; children: React.ReactNode}> = ({size = 64, c = INK, w = 900, style, children}) => (
  <div style={{fontFamily: display, fontWeight: w, fontSize: size, lineHeight: 1.18, color: c, whiteSpace: 'nowrap', ...style}}>{children}</div>
);
const Kicker: React.FC<{f: number; at: number; children: React.ReactNode}> = ({f, at, children}) => (
  <Reveal f={f} at={at} d={R} dy={16}><Big size={38} c={DIM} w={600} style={{fontFamily: font, letterSpacing: 4}}>{children}</Big></Reveal>
);

/** The box that opens: closed and grey, then the lid swings back and light pours out (open 0..1). */
const OpenBox: React.FC<{open: number; w?: number; beam?: number}> = ({open, w = 420, beam = 340}) => {
  const h = w * 0.62, k = ease.inOutCubic(clamp(open));
  return <svg width={w + 200} height={h + 420} viewBox={`${-100} ${-360} ${w + 200} ${h + 420}`} style={{overflow: 'visible', display: 'block'}}>
    <defs>
      <linearGradient id="beam" x1="0" y1="1" x2="0" y2="0">
        <stop offset="0" stopColor={GOLD} stopOpacity={0.55} />
        <stop offset="1" stopColor={GOLD} stopOpacity={0} />
      </linearGradient>
    </defs>
    {open > 0 && <polygon points={`${w * 0.12},0 ${w * 0.88},0 ${w + 90 * beam / 340},${-beam} ${-90 * beam / 340},${-beam}`} fill="url(#beam)" opacity={clamp(open * 1.4)} />}
    <rect x={0} y={0} width={w} height={h} rx={22} fill="rgba(255,255,255,0.06)" stroke={open > 0.5 ? GOLD : 'rgba(255,255,255,0.32)'} strokeWidth={3} />
    <rect x={w * 0.08} y={h * 0.38} width={w * 0.84} height={h * 0.18} rx={8} fill={open > 0.5 ? 'rgba(255,197,61,0.25)' : 'rgba(255,255,255,0.08)'} />
    {/* the lid lifts off and tips back (stays inside the box's own column, never across the headline) */}
    <g transform={`translate(${w * 0.06 * k} ${-90 * k}) rotate(${-12 * k} ${w / 2} -17)`}>
      <rect x={-10} y={-34} width={w + 20} height={34} rx={12} fill={open > 0.5 ? 'rgba(255,197,61,0.85)' : 'rgba(255,255,255,0.3)'} />
    </g>
  </svg>;
};

/** A padlock whose shackle lifts and turns gold as it opens (open 0..1). */
const Lock: React.FC<{open: number; size?: number}> = ({open, size = 150}) => {
  const lift = 26 * ease.outCubic(clamp(open)), c = open > 0.4 ? GOLD : 'rgba(255,255,255,0.6)';
  return <svg width={size} height={size * 1.2} viewBox="-60 -82 120 144" style={{flex: 'none'}}>
    <path d={`M-30 ${-14 - lift} V${-40 - lift} A30 30 0 0 1 30 ${-40 - lift} V${-14 - lift + (open > 0.4 ? -10 : 0)}`} fill="none" stroke={c} strokeWidth={11} strokeLinecap="round" />
    <rect x={-48} y={-14} width={96} height={74} rx={14} fill={c} />
    <circle cx={0} cy={18} r={9} fill={cinema.bg} />
  </svg>;
};

/* ---------- 1 hook: "the real OpenAI"? ---------- */

const hookPlan = (cue: Cue) => ({a: cue('a', 30), b: cue('b', 58)});
const Hook: Scene = ({f, dur, cue}) => {
  const p = hookPlan(cue);
  const open = rise(f, p.b - 6, 16);
  return <Root f={f} dur={dur}>
    <Pool x={450} y={620} o={0.1 + 0.16 * open} />
    <Abs y={0}><Headline f={f} at={-22} lines={['真正的', <Marker key="m" p={rise(f, -6, 14)}>OPEN AI？</Marker>]} size={128} /></Abs>
    <Abs y={330}><Reveal f={f} at={-8} d={R} dy={12}><Big size={40} c={FAINT} w={600} style={{fontFamily: font}}>—— 海外网友对 DeepSeek 的称呼</Big></Reveal></Abs>
    {/* the svg reserves 360 px above the box for the beam: box body at stage y 540–800 */}
    <Abs x={140} y={180} w={620}><OpenBox open={open} beam={170} /></Abs>
  </Root>;
};
Hook.sfx = (cue) => {
  const p = hookPlan(cue);
  return [{at: 0, kind: 'chime', gain: 0.1}, {at: p.b + 4, kind: 'whoosh', gain: 0.12}];
};

/* ---------- 2 what was opened: DeepInfer, 20 Oct ---------- */

const openPlan = (cue: Cue) => ({a: cue('a', 30), b: cue('b', 80)});
const Open: Scene = ({f, dur, cue}) => {
  const p = openPlan(cue);
  const unlock = rise(f, p.b + 6, 14);
  return <Root f={f} dur={dur}>
    <Pool x={450} y={560} o={0.12 + 0.1 * unlock} />
    <Abs y={0}><Reveal f={f} at={-8} d={R}><Big size={150} w={800} c={GOLD} style={{letterSpacing: -3}}>10月20日</Big></Reveal></Abs>
    <Abs y={200}><Reveal f={f} at={0} d={R} dy={14}><Big size={46} c={DIM} w={700} style={{fontFamily: font}}>DeepSeek 开源了</Big></Reveal></Abs>
    <Abs y={330}><Reveal f={f} at={p.a - 4} d={R}>
      <Surface accent={unlock > 0.4 ? GOLD : undefined} pad="44px 44px" style={{display: 'flex', alignItems: 'center', gap: 44}}>
        <Lock open={unlock} />
        <div>
          <Big size={48} c={DIM} w={700} style={{fontFamily: font}}>内部生产级 · 推理框架</Big>
          <div style={{height: 120, marginTop: 8}}>
            <Reveal f={f} at={p.b - 2} d={R}><Big size={110} w={800} style={{letterSpacing: -2}}>DeepInfer</Big></Reveal>
          </div>
        </div>
      </Surface>
    </Reveal></Abs>
    <Abs y={760}><Reveal f={f} at={p.b + 12} d={R}><Big size={80} w={900}><Marker p={rise(f, p.b + 18, 14)}>开源了</Marker></Big></Reveal></Abs>
  </Root>;
};
Open.sfx = (cue) => {
  const p = openPlan(cue);
  return [{at: p.a, kind: 'tick', gain: 0.08}, {at: p.b + 6, kind: 'tap', gain: 0.16}];
};

/* ---------- 3 what an inference framework is: a dispatcher ---------- */

const whatPlan = (cue: Cue) => ({a: cue('a', 30), c: cue('c', 70), d: cue('d', 95), e: cue('e', 120)});
const Dispatcher: React.FC<{f: number; on: number}> = ({f, on}) => {
  // requests stream in from the left, the dispatcher (centre) routes each to one of three chips on the right
  const chips = [70, 170, 270];
  return <svg width={820} height={340} viewBox="0 0 820 340" style={{display: 'block'}}>
    {chips.map((y, i) => <g key={i}>
      <line x1={410} y1={170} x2={640} y2={y} stroke={HAIR} strokeWidth={3} />
      <rect x={640} y={y - 36} width={150} height={72} rx={14} fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.3)" strokeWidth={2} />
      <text x={715} y={y + 12} textAnchor="middle" fontFamily={font} fontWeight={800} fontSize={34} fill={DIM}>算力</text>
    </g>)}
    <line x1={20} y1={170} x2={410} y2={170} stroke={HAIR} strokeWidth={3} />
    {on > 0 && Array.from({length: 6}, (_, i) => {
      const u = ((f * 0.022 + i / 6) % 1), lane = chips[i % 3];
      const x = u < 0.5 ? 20 + (u / 0.5) * 390 : 410 + ((u - 0.5) / 0.5) * 230;
      const y = u < 0.5 ? 170 : 170 + (lane - 170) * ((u - 0.5) / 0.5);
      return <rect key={i} x={x - 26} y={y - 18} width={52} height={36} rx={10} fill={GOLD} opacity={on * (u < 0.92 ? 1 : (1 - u) / 0.08)} />;
    })}
    <circle cx={410} cy={170} r={70} fill={cinema.bg} stroke={GOLD} strokeWidth={4} />
    <text x={410} y={183} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={38} fill={INK}>调度</text>
  </svg>;
};
const What: Scene = ({f, dur, cue}) => {
  const p = whatPlan(cue);
  const flow = rise(f, p.a + 4, 12), back = rise(f, p.c + 10, 14);
  const asks = [{t: '回答多快', at: p.c}, {t: '能扛多少人', at: p.d}, {t: '要多少硬件', at: p.e}];
  return <Root f={f} dur={dur}>
    <Pool x={450} y={520} o={0.12} />
    <Abs y={0}><Headline f={f} at={-10} kicker="推理框架是什么" lines={[<span key="l">就像{gold('调度员')}</span>]} size={110} /></Abs>
    <Abs y={300} style={{opacity: 1 - 0.45 * back, transform: `scale(${1 - 0.12 * back})`, transformOrigin: '50% 0'}}><Reveal f={f} at={p.a - 6} d={R}>
      <Surface pad="30px 20px"><Dispatcher f={f} on={flow} /></Surface>
    </Reveal></Abs>
    <Abs y={720} style={{display: 'flex', gap: 22}}>
      {asks.map((x) => <Reveal key={x.t} f={f} at={x.at - 4} d={R}>
        <Surface accent={GOLD} pad="0" style={{width: 285, height: 170, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          <Big size={50} w={800}>{x.t}</Big>
        </Surface>
      </Reveal>)}
    </Abs>
  </Root>;
};
What.sfx = (cue) => {
  const p = whatPlan(cue);
  return [{at: p.a + 4, kind: 'whoosh-short', gain: 0.08}, {at: p.c, kind: 'tick', gain: 0.08}, {at: p.d, kind: 'tick', gain: 0.08}, {at: p.e, kind: 'tick', gain: 0.08}];
};

/* ---------- 4 same model, different framework, different cost ---------- */

const costPlan = (cue: Cue) => ({a: cue('a', 36), b: cue('b', 80), c: cue('c', 140)});
const Lane: React.FC<{f: number; at: number; label: string; blocks: number; hot: boolean; extra?: React.ReactNode}> = ({f, at, label, blocks, hot, extra}) => (
  <Surface accent={hot ? GOLD : undefined} pad="28px 36px">
    <div style={{display: 'flex', alignItems: 'baseline', gap: 20}}>
      <Big size={44} w={800} c={DIM} style={{fontFamily: font}}>同一个模型 ·</Big>
      <Big size={52} w={800} c={hot ? INK : DIM}>{label}</Big>
      <span style={{marginLeft: 'auto'}}>{extra}</span>
    </div>
    <div style={{display: 'flex', gap: 10, marginTop: 22}}>
      {Array.from({length: blocks}, (_, i) => {
        const k = rise(f, at + i * 3, 8);
        return <div key={i} style={{width: 76, height: 56, borderRadius: 10, opacity: k, transform: `scale(${0.7 + 0.3 * k})`,
          background: hot ? GOLD : 'rgba(255,255,255,0.28)'}} />;
      })}
    </div>
  </Surface>
);
const Cost: Scene = ({f, dur, cue}) => {
  const p = costPlan(cue);
  const hot = f >= p.b;
  return <Root f={f} dur={dur}>
    <Pool x={450} y={600} o={0.12} />
    <Abs y={0}><Headline f={f} at={-10} lines={['同一个模型', <Marker key="m" p={rise(f, p.a + 6, 14)}>成本能差很多</Marker>]} size={104} /></Abs>
    <Abs y={330}><Reveal f={f} at={4} d={R}><Lane f={f} at={10} label="框架 A" blocks={9} hot={false} /></Reveal></Abs>
    <Abs y={590}><Reveal f={f} at={p.a - 6} d={R}><Lane f={f} at={p.a} label="框架 B" blocks={3} hot={hot}
      extra={<Reveal f={f} at={p.c - 2} d={R}><Big size={46} w={800} c={GOLD} style={{fontFamily: font}}>⚡ 更省电</Big></Reveal>} /></Reveal></Abs>
    <Abs y={870}><Reveal f={f} at={p.b + 4} d={R}><Big size={56} w={800}>每次请求，{gold('算力更少')}</Big></Reveal></Abs>
  </Root>;
};
Cost.sfx = (cue) => {
  const p = costPlan(cue);
  return [{at: p.a, kind: 'tick', gain: 0.08}, {at: p.b, kind: 'tap', gain: 0.12}, {at: p.c, kind: 'chime', gain: 0.08}];
};

/* ---------- 5 what is in it: distributed inference + speculative decoding; compatible hardware ---------- */

const techPlan = (cue: Cue) => {
  const a = cue('a', 40);
  return {a, b: a + 12, c: cue('c', 90), d: cue('d', 130)};
};
const Split: React.FC<{f: number; at: number}> = ({f, at}) => {
  // one job splits into three pieces that fly to three devices
  const k = ease.inOutCubic(clamp((f - at) / 18));
  return <svg width={820} height={240} viewBox="0 0 820 240" style={{display: 'block'}}>
    {[40, 120, 200].map((y, i) => <g key={i}>
      <rect x={620} y={y - 32} width={180} height={64} rx={14} fill="rgba(255,255,255,0.08)" stroke={k > 0.95 ? GOLD : 'rgba(255,255,255,0.3)'} strokeWidth={2} />
      <text x={710} y={y + 11} textAnchor="middle" fontFamily={font} fontWeight={800} fontSize={30} fill={k > 0.95 ? INK : DIM}>硬件 {i + 1}</text>
      <rect x={60 + k * 470} y={120 - 40 + (y - 120) * k + (1 - k) * (i - 1) * 26} width={k > 0 ? 80 : 240} height={k > 0 ? 50 : 80} rx={10} fill={GOLD}
        opacity={k > 0 ? 1 : i === 1 ? 1 : 0} />
    </g>)}
    {k <= 0 && <text x={180} y={133} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={34} fill={cinema.bg}>一件活</text>}
  </svg>;
};
const Tech: Scene = ({f, dur, cue}) => {
  const p = techPlan(cue);
  const back = rise(f, p.c - 6, 14);
  const hw = [{t: '英伟达', m: 'SM100', at: p.c}, {t: '华为昇腾', m: '950', at: p.d}];
  return <Root f={f} dur={dur}>
    <Pool x={450} y={540} o={0.12} />
    <Abs y={0}><Headline f={f} at={-10} kicker="DeepInfer 整合了" lines={['分布式推理', <span key="2" style={{opacity: rise(f, p.a - 4, R)}}>+ 投机解码</span>]} size={100} /></Abs>
    <Abs y={330} style={{opacity: 1 - 0.5 * back, transform: `scale(${1 - 0.12 * back})`, transformOrigin: '50% 0'}}><Reveal f={f} at={p.b - 8} d={R}>
      <Surface pad="30px 20px"><Split f={f} at={p.b} /></Surface>
    </Reveal></Abs>
    <Abs y={660}><Reveal f={f} at={p.c - 6} d={R} dy={12}><Big size={40} c={DIM} w={700} style={{fontFamily: font, letterSpacing: 4}}>已兼容</Big></Reveal></Abs>
    <Abs y={730} style={{display: 'flex', gap: 22}}>
      {hw.map((x) => <Reveal key={x.t} f={f} at={x.at - 2} d={R}>
        <Surface accent={GOLD} pad="0 34px" style={{width: 439, height: 180, display: 'flex', flexDirection: 'column', justifyContent: 'center'}}>
          <Big size={44} c={DIM} w={700} style={{fontFamily: font}}>{x.t}</Big>
          <Big size={84} w={800}>{x.m}</Big>
        </Surface>
      </Reveal>)}
    </Abs>
  </Root>;
};
Tech.sfx = (cue) => {
  const p = techPlan(cue);
  return [{at: p.a, kind: 'tick', gain: 0.08}, {at: p.b + 4, kind: 'whoosh-short', gain: 0.08}, {at: p.c, kind: 'tap', gain: 0.12}, {at: p.d, kind: 'tap', gain: 0.12}];
};

/* ---------- 6 why it matters: cheaper inference → room for margin → maybe cheaper AI ---------- */

const moneyPlan = (cue: Cue) => ({a: cue('a', 30), b: cue('b', 75)});
const Money: Scene = ({f, dur, cue}) => {
  const p = moneyPlan(cue);
  const steps = [{t: '推理成本', arrow: '↓', at: -6}, {t: '服务商利润空间', arrow: '↑', at: p.a - 4}, {t: 'AI 服务价格', arrow: '可能 ↓', at: p.b - 4}];
  return <Root f={f} dur={dur}>
    <Pool x={450} y={520} o={0.12} />
    <Abs y={0}><Kicker f={f} at={-10}>算一笔账</Kicker></Abs>
    <Abs y={90}>
      {steps.map((s, i) => <Reveal key={s.t} f={f} at={s.at} d={R}>
        {i > 0 && <div style={{width: 4, height: 70, background: HAIR, margin: '8px 0 8px 60px'}} />}
        <Surface accent={i === steps.length - 1 && f >= p.b + 6 ? GOLD : undefined} pad="0 44px" style={{height: 180, display: 'flex', alignItems: 'center', gap: 30}}>
          <Big size={72} w={800}>{s.t}</Big>
          <Big size={84} w={900} c={GOLD} style={{marginLeft: 'auto'}}>{s.arrow}</Big>
        </Surface>
      </Reveal>)}
    </Abs>
  </Root>;
};
Money.sfx = (cue) => {
  const p = moneyPlan(cue);
  return [{at: p.a, kind: 'tick', gain: 0.08}, {at: p.b, kind: 'tick', gain: 0.08}];
};

/* ---------- 7 not the whole stack ---------- */

const partPlan = (cue: Cue) => ({a: cue('a', 30), b: cue('b', 60), c: cue('c', 100), d: cue('d', 125), e: cue('e', 165)});
const Partial: Scene = ({f, dur, cue}) => {
  const p = partPlan(cue);
  const missing = [{t: 'KV 缓存', at: p.a}, {t: '预填充 / 解码的解耦', at: p.b}, {t: '负载均衡', at: p.c}];
  const core = rise(f, p.e, 14), mark = rise(f, p.d, 12);
  return <Root f={f} dur={dur}>
    <Pool x={450} y={480} o={0.1 + 0.12 * core} />
    <Abs y={0}><Headline f={f} at={-10} lines={['没给全套']} size={110} /></Abs>
    {/* the big block: most of the core decoupling — dim until "不过", then lit */}
    <Abs y={180}><Reveal f={f} at={0} d={R}>
      <Surface accent={core > 0.3 ? GOLD : undefined} pad="0 44px" style={{height: 220, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: core > 0 ? `rgba(255,197,61,${0.05 + 0.1 * core})` : undefined}}>
        <Big size={64} w={800} c={core > 0.3 ? INK : FAINT}>大部分核心解耦功能</Big>
        <Big size={80} w={900} c={GOLD} style={{opacity: core}}>✓</Big>
      </Surface>
    </Reveal></Abs>
    {missing.map((m, i) => <Abs key={m.t} y={440 + i * 170}>
      <div style={{height: 150, borderRadius: 26, border: `3px dashed ${HAIR}`, display: 'flex', alignItems: 'center', padding: '0 44px', gap: 24}}>
        <Reveal f={f} at={m.at - 4} d={R}><Big size={58} w={800} c={DIM}>{m.t}</Big></Reveal>
        <span style={{marginLeft: 'auto', opacity: mark}}><Big size={40} w={700} c={FAINT} style={{fontFamily: font}}>未全放出</Big></span>
      </div>
    </Abs>)}
  </Root>;
};
Partial.sfx = (cue) => {
  const p = partPlan(cue);
  return [{at: p.a, kind: 'tick', gain: 0.07}, {at: p.b, kind: 'tick', gain: 0.07}, {at: p.c, kind: 'tick', gain: 0.07}, {at: p.e, kind: 'chime', gain: 0.1}];
};

/* ---------- 8 end: rarely published — this time, more than half laid open ---------- */

const endPlan = (cue: Cue) => ({a: cue('a', 66), b: cue('b', 100)});
const End: Scene = ({f, dur, cue}) => {
  const p = endPlan(cue);
  const open = rise(f, p.b + 4, 20);
  return <Root f={f} dur={dur}>
    <Pool x={450} y={660} o={0.1 + 0.2 * open} />
    <Abs y={0}><Headline f={f} at={-10} kicker="核心竞争力" lines={['推理技术', <span key="2" style={{opacity: rise(f, p.a - 6, R)}}>很少有人公开</span>]} size={110} /></Abs>
    <Abs x={140} y={380} w={620} style={leave(f, dur + 20)}><OpenBox open={open} /></Abs>
    <Abs y={450} style={{opacity: rise(f, p.b + 14, R), textAlign: 'center'}}><Big size={72} w={900}>这次，摊开了<Marker p={rise(f, p.b + 20, 14)}>一大半</Marker></Big></Abs>
  </Root>;
};
End.sfx = (cue) => {
  const p = endPlan(cue);
  return [{at: p.b + 4, kind: 'whoosh', gain: 0.12}, {at: p.b + 16, kind: 'chime', gain: 0.1}];
};

/* ---------- cover anchor (880 × 800): the open box with DeepInfer in its light ---------- */

const Cover: Scene = () => <div style={{position: 'relative', width: 880, height: 800}}>
  <Pool x={440} y={500} o={0.26} />
  <Abs x={130} y={110} w={620}><OpenBox open={1} /></Abs>
  <Abs y={300} w={880} style={{textAlign: 'center'}}><Big size={110} w={800}>DeepInfer</Big></Abs>
</div>;

export const deepseekDeepinferScenes: Record<string, Scene> = {
  'dsi.hook': Hook,
  'dsi.open': Open,
  'dsi.what': What,
  'dsi.cost': Cost,
  'dsi.tech': Tech,
  'dsi.money': Money,
  'dsi.partial': Partial,
  'dsi.end': End,
  'dsi.cover': Cover,
};
