import React from 'react';
import {AbsoluteFill, Img, Loop, OffthreadVideo, staticFile} from 'remotion';
import {cinema} from '../theme';
import {clamp} from '../../fx';
import {Cue, Scene} from '../paper';
import {Abs, DIM, FAINT, GOLD, HAIR, Headline, INK, Marker, Pool, Reveal, Root, Surface, display, font, leave, rise} from '../cinema';

// claude-proactive-agent, remade in the cinema look (2026-10-22): same narration, facts and cues as claude-proactive-agent.tsx
// (script: inputs/claude-proactive-agent/script.md, read verbatim). Per scene one headline that states the point and one hero
// on one panel; gold is the only accent. Kept from the original: Tabler icons (MIT, now white / gold) and two calm Pexels clips
// (the blurred phone behind the hook, the tap at the end). Dropped: the busy network / data-grid wallpapers, chips, outlined
// boxes and the per-scene "Pexels 素材" tag — credits live in the top line. Product names are plain text, no logos; the
// notification and approval cards are drawn mockups.

const ICON = (n: string, tone: 'ink' | 'gold' = 'ink') => staticFile(`images/tutorials/claude-proactive-agent/tabler-${n}-${tone}.svg`);
const CLIP = (n: string) => staticFile(`video/claude-proactive-agent/${n}.mp4`);
const Icon: React.FC<{n: string; tone?: 'ink' | 'gold'; size?: number; style?: React.CSSProperties}> = ({n, tone = 'ink', size = 64, style}) => (
  <Img src={ICON(n, tone)} style={{width: size, height: size, flex: 'none', ...style}} />
);
const gold = (s: string) => <span style={{color: GOLD}}>{s}</span>;
const Big: React.FC<{size?: number; c?: string; w?: number; style?: React.CSSProperties; children: React.ReactNode}> = ({size = 64, c = INK, w = 900, style, children}) => (
  <div style={{fontFamily: display, fontWeight: w, fontSize: size, lineHeight: 1.18, color: c, whiteSpace: 'nowrap', ...style}}>{children}</div>
);
const Kicker: React.FC<{f: number; at: number; children: React.ReactNode}> = ({f, at, children}) => (
  <Reveal f={f} at={at} dy={16}><Big size={36} c={DIM} w={600} style={{fontFamily: font, letterSpacing: 4}}>{children}</Big></Reveal>
);
/** Full-frame background clip: muted, looped, dimmed, optionally blurred, under a navy grade so it sits in the palette. */
const Footage: React.FC<{name: string; f: number; blur?: number; dim?: number}> = ({name, f, blur = 0, dim = 0.4}) => (
  <AbsoluteFill style={{background: cinema.bg, overflow: 'hidden'}}>
    <AbsoluteFill style={{transform: `scale(${1.06 + 0.05 * clamp(f / 300)})`, filter: `brightness(${dim}) saturate(0.7)${blur ? ` blur(${blur}px)` : ''}`}}>
      <Loop durationInFrames={238}><OffthreadVideo src={CLIP(name)} muted style={{width: 1080, height: 1920, objectFit: 'cover'}} /></Loop>
    </AbsoluteFill>
    <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(7,11,20,0.85) 0%, rgba(7,11,20,0.35) 32%, rgba(7,11,20,0.35) 60%, rgba(7,11,20,0.9) 100%)'}} />
  </AbsoluteFill>
);

/* ---------- 1 hook: a notification arrives before you said anything ---------- */

const hookPlan = (cue: Cue) => ({a: cue('a', 35)});
const Notice: React.FC<{f: number}> = ({f}) => {
  const k = rise(f, -10, 18);
  return <div style={{opacity: clamp(k * 1.4), transform: `translateY(${(1 - k) * -120}px)`, filter: k < 0.98 ? `blur(${(1 - k) * 8}px)` : undefined}}>
    <Surface pad="30px 34px" style={{background: 'linear-gradient(180deg, rgba(255,255,255,0.12), rgba(255,255,255,0.06))', borderRadius: 36}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 20}}>
        <Icon n="bell-ringing" tone="gold" size={56} style={{transform: `rotate(${f < 36 ? 10 * Math.sin(f / 2.2) * (1 - f / 36) : 0}deg)`}} />
        <span style={{fontFamily: display, fontWeight: 800, fontSize: 42, color: INK}}>AI 助理</span>
        <span style={{marginLeft: 'auto', fontFamily: font, fontWeight: 500, fontSize: 34, color: FAINT}}>现在</span>
      </div>
      <div style={{fontFamily: font, fontWeight: 700, fontSize: 50, lineHeight: 1.4, color: INK, marginTop: 16}}>早上好，今天有 {gold('3')} 件事需要你处理</div>
    </Surface>
  </div>;
};
const Hook: Scene = ({f, dur, cue}) => {
  const p = hookPlan(cue);
  return <Root f={f} dur={dur}>
    <Abs y={0}><Headline f={f} at={-20} lines={['你还没开口，', 'AI 先来找你了']} mark={1} size={104} /></Abs>
    <Abs y={430}><Notice f={f} /></Abs>
    <Abs y={760} style={{opacity: rise(f, p.a, 14)}}><Pool x={450} y={0} r={420} o={0.12} /></Abs>
  </Root>;
};
Hook.backdrop = ({f}) => <Footage name="01_phone-scroll-a" f={f} blur={22} dim={0.32} />;
Hook.sfx = () => [{at: 2, kind: 'tap', gain: 0.14}];

/* ---------- 2 what it is ---------- */

const whatPlan = (cue: Cue) => ({a: cue('a', 72), b: cue('b', 121), c: cue('c', 161)});
const What: Scene = ({f, dur, cue}) => {
  const p = whatPlan(cue);
  return <Root f={f} dur={dur}>
    <Pool x={300} y={260} o={0.12} />
    <Abs y={20}><Kicker f={f} at={-6}>Anthropic 刚推出</Kicker></Abs>
    <Abs y={80}><Reveal f={f} at={-2}><Big size={136} w={800} style={{letterSpacing: -3}}>Claude Duet</Big></Reveal></Abs>
    <Abs y={270}><Reveal f={f} at={10} dy={12}><Big size={40} c={FAINT} w={600} style={{fontFamily: font, letterSpacing: 4}}>研究预览版</Big></Reveal></Abs>
    {/* one feature at a time, full size, swapping on the spoken words */}
    {[{n: 'mail', t: '每天早上发简报', at: p.a}, {n: 'bell-ringing', t: '有事才提醒你', at: p.b}, {n: 'hand-stop', t: '关键操作先问你', at: p.c}].map((x, i, all) => {
      const inn = rise(f, x.at - 8, 14), out = i < all.length - 1 ? rise(f, all[i + 1].at - 8, 12) : 0;
      if (inn <= 0 || out >= 1) return null;
      return <Abs key={x.n} y={360} style={{opacity: clamp(inn * 1.4) * (1 - out), transform: `translateX(${(1 - inn) * 140 - out * 140}px)`,
        filter: inn < 0.98 || out > 0 ? `blur(${((1 - inn) + out) * 8}px)` : undefined}}>
        <Surface pad="0" style={{height: 480, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 36}}>
          <Icon n={x.n} tone="gold" size={200} />
          <Big size={84} w={800}>{x.t}</Big>
          <Big size={36} c={FAINT} w={600} style={{fontFamily: font, letterSpacing: 6}}>{i + 1} / 3</Big>
        </Surface>
      </Abs>;
    })}
    <Abs y={890}><Reveal f={f} at={p.c + 24} dy={10}><Big size={40} c={FAINT} w={500} style={{fontFamily: font}}>目前仅面向美国部分订阅用户排队开放</Big></Reveal></Abs>
  </Root>;
};
What.sfx = (cue) => {
  const p = whatPlan(cue);
  return [{at: p.a, kind: 'tick', gain: 0.08}, {at: p.b, kind: 'tick', gain: 0.08}, {at: p.c, kind: 'tick', gain: 0.08}];
};

/* ---------- 3 the turn: four companies, one kind of product — so what makes it proactive? ---------- */

const turnPlan = (cue: Cue) => ({a: cue('a', 101), b: cue('b', 133)});
const NAMES = ['Grok Bot', 'Muse', 'Dots', 'Claude Duet'];
const Turn: Scene = ({f, dur, cue}) => {
  const p = turnPlan(cue);
  const back = rise(f, p.a - 4, 18);
  return <Root f={f} dur={dur}>
    <Pool x={450} y={520} o={0.12} />
    <Abs y={0} style={leave(f, p.b - 10)}><Headline f={f} at={-10} kicker="两个多月" lines={[<>{gold('4')} 家大公司</>, '同一类产品']} size={100} /></Abs>
    <Abs y={380} style={{opacity: 1 - 0.7 * back, transform: `translateY(${back * 300}px) scale(${1 - 0.25 * back})`, transformOrigin: '50% 100%'}}>
      <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24}}>
        {NAMES.map((n, i) => <Reveal key={n} f={f} at={6 + i * 10}>
          <Surface pad="0" accent={i === 3 ? GOLD : undefined} style={{height: 170, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            <Big size={60} w={800} c={i === 3 ? INK : DIM}>{n}</Big>
          </Surface>
        </Reveal>)}
      </div>
    </Abs>
    <Abs y={170}><Headline f={f} at={p.b - 6} lines={['它凭什么', '能主动干活？']} mark={1} size={112} /></Abs>
  </Root>;
};
Turn.sfx = (cue) => {
  const p = turnPlan(cue);
  return [{at: 6, kind: 'tick', gain: 0.06}, {at: 36, kind: 'tick', gain: 0.06}, {at: p.b, kind: 'whoosh', gain: 0.12}];
};

/* ---------- 4 mechanism 1: memory ---------- */

const memPlan = (cue: Cue) => ({a: cue('a', 46), b: cue('b', 98), c: cue('c', 114), d: cue('d', 150), e: cue('e', 205)});
const Memory: Scene = ({f, dur, cue}) => {
  const p = memPlan(cue);
  const tags = [{t: '记忆', at: p.a, x: 30, y: 180}, {t: '技能', at: p.b, x: 670, y: 180}, {t: '已连接的应用', at: p.c, x: 270, y: 360}];
  const sink = rise(f, p.d - 6, 18);
  const grow = rise(f, p.a, 12) + rise(f, p.b, 12) + rise(f, p.c, 12);
  return <Root f={f} dur={dur}>
    <Abs y={0}><Headline f={f} at={-10} no={1} total={3} kicker="记忆" lines={['先知道你是谁']} size={100} /></Abs>
    {/* the brain, with what it carries over flying in */}
    <Abs y={300} h={460} style={{transform: `translateY(${-sink * 40}px) scale(${1 - 0.15 * sink})`, transformOrigin: '50% 0'}}>
      <Pool x={450} y={220} r={300 + 60 * grow} o={0.12 + 0.07 * grow} />
      <Abs x={330} y={100} w={240} style={{transform: `scale(${1 + 0.1 * grow})`}}><Reveal f={f} at={4}><Icon n="brain" tone={f >= p.a ? 'gold' : 'ink'} size={240} /></Reveal></Abs>
      {tags.map((g) => {
        const k = rise(f, g.at, 18);
        return <Abs key={g.t} x={g.x} y={g.y} w={g.t.length > 2 ? 360 : 200} style={{opacity: clamp(k * 1.4), transform: `translateY(${(1 - k) * 30}px)`, textAlign: 'center'}}>
          <Big size={64} w={800}>{g.t}</Big>
        </Abs>;
      })}
    </Abs>
    <Abs y={800}>
      <Reveal f={f} at={p.d}><Big size={72} w={800}>你是谁 · 在忙什么</Big></Reveal>
      <Reveal f={f} at={p.e - 4}><Big size={72} w={800} style={{marginTop: 14}}><Marker p={rise(f, p.e + 4, 16)}>哪件事跟你有关</Marker></Big></Reveal>
    </Abs>
  </Root>;
};
Memory.sfx = (cue) => {
  const p = memPlan(cue);
  return [{at: p.a, kind: 'tick', gain: 0.08}, {at: p.b, kind: 'tick', gain: 0.08}, {at: p.c, kind: 'tick', gain: 0.08}, {at: p.e, kind: 'tap', gain: 0.1}];
};

/* ---------- 5 mechanism 2: scheduled tasks + a cloud VM ---------- */

const schedPlan = (cue: Cue) => ({a: cue('a', 46), b: cue('b', 128), c: cue('c', 180), d: cue('d', 227)});
const Ring: React.FC<{f: number; size: number; spin: boolean}> = ({f, size, spin}) => {
  const r = size / 2 - 8, C = 2 * Math.PI * r, a = spin ? (f * 4) % 360 : 0;
  return <svg width={size} height={size} style={{position: 'absolute', left: 0, top: 0, transform: `rotate(${a}deg)`}}>
    <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={HAIR} strokeWidth={6} />
    <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={GOLD} strokeWidth={6} strokeLinecap="round" strokeDasharray={`${C * 0.28} ${C}`} />
  </svg>;
};
const Schedule: Scene = ({f, dur, cue}) => {
  const p = schedPlan(cue);
  const swap = rise(f, p.b - 6, 16);
  const off = rise(f, p.c, 14);
  const zin = rise(f, p.c - 6, 16), zout = rise(f, p.d - 4, 18);
  // the clock hand jumps forward a few hours at a time while "每隔几个小时" is said
  const hand = 120 * Math.floor(clamp((f - p.a) / 18, 0, 4));
  return <Root f={f} dur={dur}>
    <Pool x={450} y={560} o={0.13 + 0.12 * zout} />
    <Abs y={0}><Headline f={f} at={-10} no={2} total={3} kicker="定时任务" lines={[<Marker key="m" p={rise(f, p.d, 16)}>到点自己醒</Marker>]} size={100} /></Abs>
    {/* part 1: the clock that wakes it every few hours */}
    <Abs y={330} style={{opacity: 1 - swap, transform: `translateY(${-swap * 40}px)`}}>
      <Reveal f={f} at={p.a - 12}>
        <div style={{display: 'flex', alignItems: 'center', gap: 40}}>
          <div style={{position: 'relative', width: 260, height: 260, flex: 'none'}}>
            <Ring f={f} size={260} spin={false} />
            <svg width={260} height={260} style={{position: 'absolute', left: 0, top: 0}}>
              <line x1={130} y1={130} x2={130} y2={62} stroke={INK} strokeWidth={10} strokeLinecap="round" transform={`rotate(${hand} 130 130)`} />
              <circle cx={130} cy={130} r={12} fill={GOLD} />
            </svg>
          </div>
          <div><Big size={64} w={800}>每隔几个小时</Big><Big size={64} w={800} c={DIM}>检查一次</Big></div>
        </div>
      </Reveal>
    </Abs>
    {/* part 2: the phone goes dark, the cloud machine keeps working */}
    <Abs y={330} style={{opacity: swap * (1 - 0.45 * zout), transform: `scale(${1 + 0.12 * zin - 0.12 * zout - 0.1 * zout})`, transformOrigin: '10% 45%'}}>
      <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 40px'}}>
        <div style={{width: 230, height: 400, borderRadius: 40, border: `3px solid ${off > 0 ? HAIR : 'rgba(255,255,255,0.4)'}`, background: `rgba(255,255,255,${0.1 * (1 - off)})`,
          display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          <Big size={44} c={off > 0.5 ? FAINT : INK} w={700} style={{fontFamily: font}}>{off > 0.5 ? '已关机' : '手机'}</Big>
        </div>
        <div style={{position: 'relative', width: 320, height: 320}}>
          <Ring f={f} size={320} spin />
          <Abs x={80} y={80} w={160}><Icon n="cloud-computing" tone="gold" size={160} /></Abs>
        </div>
      </div>
      <div style={{display: 'flex', justifyContent: 'space-between', padding: '24px 40px 0'}}>
        <span />
        <Big size={52} w={800}>云端虚拟机</Big>
      </div>
    </Abs>
  </Root>;
};
Schedule.sfx = (cue) => {
  const p = schedPlan(cue);
  return [0, 1, 2, 3].map((i) => ({at: p.a + 18 * i + 1, kind: 'tick', gain: 0.07})).concat([{at: p.c, kind: 'tap', gain: 0.1}]);
};

/* ---------- 6 mechanism 3: key steps wait for you ---------- */

const confPlan = (cue: Cue) => ({a: cue('a', 71), b: cue('b', 92), c: cue('c', 107), d: cue('d', 129), e: cue('e', 160), f: cue('f', 211)});
const Confirm: Scene = ({f, dur, cue}) => {
  const p = confPlan(cue);
  const acts = [{t: '发消息', at: p.a}, {t: '付款', at: p.b}, {t: '签文件', at: p.c}, {t: '删东西', at: p.d}];
  const card = rise(f, p.e - 6, 16), up = rise(f, p.e - 10, 18);
  const press = f >= p.f + 6 ? Math.max(0, 1 - (f - p.f - 6) / 6) : 0, done = rise(f, p.f + 10, 12);
  return <Root f={f} dur={dur}>
    <Pool x={450} y={620} o={0.13} />
    <Abs y={0}><Headline f={f} at={-10} no={3} total={3} kicker="等你确认" lines={['关键一步先问你']} size={100} /></Abs>
    <Abs y={380} style={{transform: `scale(${1 - 0.3 * up})`, transformOrigin: '0 0', opacity: 1 - 0.35 * up}}>
      <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', rowGap: 10}}>
        {acts.map((a) => <Reveal key={a.t} f={f} at={a.at - 4}>
          <Big size={96} w={800} c={f >= a.at + 4 ? INK : DIM}>{a.t}</Big>
          <div style={{width: 200 * rise(f, a.at, 12), height: 6, borderRadius: 3, background: GOLD, marginTop: 4}} />
        </Reveal>)}
      </div>
    </Abs>
    <Abs y={600} style={{opacity: card, transform: `translateY(${(1 - card) * 40}px)`}}>
      <Surface accent={GOLD} pad="34px 40px">
        <div style={{display: 'flex', alignItems: 'center', gap: 22}}>
          <Icon n="hand-stop" tone="gold" size={56} />
          <Big size={50} w={800}>即将执行：发送邮件</Big>
        </div>
        <div style={{display: 'flex', gap: 24, marginTop: 30}}>
          <div style={{flex: 1, height: 110, borderRadius: 55, background: GOLD, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14,
            transform: `scale(${1 - 0.05 * press})`, boxShadow: done > 0 ? `0 0 ${40 * done}px rgba(255,197,61,0.45)` : undefined}}>
            {done > 0 && <Icon n="user-check" tone="ink" size={52} style={{filter: 'brightness(0)', opacity: done}} />}
            <span style={{fontFamily: font, fontWeight: 900, fontSize: 52, color: cinema.bg}}>批准</span>
          </div>
          <div style={{flex: 1, height: 110, borderRadius: 55, border: `2px solid ${HAIR}`, display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: font, fontWeight: 800, fontSize: 52, color: DIM}}>取消</div>
        </div>
      </Surface>
    </Abs>
  </Root>;
};
Confirm.sfx = (cue) => {
  const p = confPlan(cue);
  return [{at: p.a, kind: 'tick', gain: 0.07}, {at: p.b, kind: 'tick', gain: 0.07}, {at: p.c, kind: 'tick', gain: 0.07}, {at: p.d, kind: 'tick', gain: 0.07},
    {at: p.f + 6, kind: 'tap', gain: 0.16}, {at: p.f + 10, kind: 'chime', gain: 0.1}];
};

/* ---------- 7 the developer's view: three pieces, one system ---------- */

const devPlan = (cue: Cue) => ({a: cue('a', 66), b: cue('b', 126), c: cue('c', 166), d: cue('d', 235), e: cue('e', 276)});
const PARTS = [{n: 'brain', t: '记忆'}, {n: 'clock-hour-4', t: '调度'}, {n: 'hand-stop', t: '人工确认'}];
const Dev: Scene = ({f, dur, cue}) => {
  const p = devPlan(cue);
  const join = rise(f, p.c - 4, 22);
  const ats = [p.a - 4, p.a + 10, p.b - 6];
  // the switch: "该出手" on d, slides over to "停下来问你" on e
  const sw = rise(f, p.e, 14);
  return <Root f={f} dur={dur}>
    <Pool x={450} y={560} o={0.13 + 0.06 * join} />
    <Abs y={20}><Kicker f={f} at={-6}>做 Agent 开发的人都清楚</Kicker></Abs>
    <Abs y={90}><Headline f={f} at={0} lines={['零件不新鲜', <>难在{gold('拼成系统')}</>]} size={100} /></Abs>
    {/* the three pieces, then they close into one panel */}
    <Abs y={400}>
      <div style={{display: 'flex', justifyContent: 'center', gap: 36 * (1 - join) + 6}}>
        {PARTS.map((x, i) => <Reveal key={x.n} f={f} at={ats[i]}>
          <Surface pad="34px 0" style={{textAlign: 'center', width: 250, ...(join > 0.5 ? {background: 'transparent', border: '1.5px solid transparent', boxShadow: 'none'} : {})}}>
            <Icon n={x.n} tone={join > 0.5 ? 'gold' : 'ink'} size={150} />
            <Big size={52} w={800} c={join > 0.5 ? DIM : INK} style={{marginTop: 12}}>{x.t}</Big>
          </Surface>
        </Reveal>)}
      </div>
    </Abs>
    <Abs y={370} h={330} style={{opacity: join, transform: `scale(${0.94 + 0.06 * join})`, pointerEvents: 'none'}}>
      <Surface accent={GOLD} pad="0" style={{height: 330, background: 'linear-gradient(180deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))'}}><span /></Surface>
    </Abs>
    <Abs y={880}><Reveal f={f} at={p.d - 4}>
      <div style={{position: 'relative', display: 'flex', width: 820, height: 110, borderRadius: 55, background: 'rgba(255,255,255,0.06)', border: `1.5px solid ${HAIR}`}}>
        <div style={{position: 'absolute', top: 6, bottom: 6, left: 6 + sw * 404, width: 404, borderRadius: 50, background: GOLD}} />
        {['该出手', '停下来问你'].map((t, i) => <div key={t} style={{position: 'relative', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: font, fontWeight: 900, fontSize: 48, color: (i === 0 ? sw < 0.5 : sw >= 0.5) ? cinema.bg : DIM}}>{t}</div>)}
      </div>
    </Reveal></Abs>
  </Root>;
};
Dev.sfx = (cue) => {
  const p = devPlan(cue);
  return [{at: p.a, kind: 'tick', gain: 0.07}, {at: p.b, kind: 'tick', gain: 0.07}, {at: p.c, kind: 'whoosh', gain: 0.1}, {at: p.e, kind: 'tap', gain: 0.12}];
};

/* ---------- 8 ending: AI can act first, the last tap is yours ---------- */

const endPlan = (cue: Cue) => ({a: cue('a', 48), b: cue('b', 83)});
const End: Scene = ({f, dur, cue}) => {
  const p = endPlan(cue);
  const tap = p.b + 12;
  const lit = rise(f, tap, 8);
  const fade = clamp((f - dur + 12) / 10);
  return <Root f={f} dur={dur}>
    <Abs y={0}><Headline f={f} at={-10} lines={['AI 可以主动，']} size={104} /></Abs>
    <Abs y={121}><Headline f={f} at={p.a - 8} lines={['但做主的是你']} mark={0} size={104} /></Abs>
    <Abs y={560} style={{display: 'flex', justifyContent: 'center'}}>
      <div style={{width: 460, height: 150, borderRadius: 75, border: `2px solid ${lit > 0 ? GOLD : 'rgba(255,255,255,0.5)'}`,
        background: lit > 0 ? `rgba(255,197,61,${0.15 + 0.85 * lit})` : 'rgba(7,11,20,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: font, fontWeight: 900, fontSize: 72, color: lit > 0.5 ? cinema.bg : INK, transform: `scale(${f >= tap && f < tap + 6 ? 0.96 : 1})`,
        boxShadow: lit > 0 ? `0 0 ${70 * lit}px rgba(255,197,61,0.45)` : undefined}}>确认</div>
    </Abs>
    <div style={{position: 'absolute', left: -200, right: -200, top: -400, bottom: -600, background: '#000', opacity: fade}} />
  </Root>;
};
End.backdrop = ({f, dur}) => <>
  <Footage name="08_tap-blank-screen" f={f} dim={0.42} />
  <AbsoluteFill style={{background: '#000', opacity: clamp((f - dur + 12) / 10)}} />
</>;
End.sfx = (cue) => {
  const p = endPlan(cue);
  return [{at: p.b + 12, kind: 'tap', gain: 0.2}, {at: p.b + 16, kind: 'chime', gain: 0.12}];
};

/* ---------- cover anchor (880 × 800): the notification over the three mechanisms ---------- */

const Cover: Scene = () => <div style={{position: 'relative', width: 880, height: 800}}>
  <Pool x={440} y={420} o={0.18} />
  <Abs x={0} y={120} w={880}><Notice f={60} /></Abs>
  <Abs x={0} y={520} w={880} style={{display: 'flex', justifyContent: 'center', gap: 90}}>
    {PARTS.map((x) => <div key={x.n} style={{textAlign: 'center'}}><Icon n={x.n} tone="gold" size={110} />
      <Big size={44} w={800} c={DIM} style={{marginTop: 10}}>{x.t}</Big></div>)}
  </Abs>
</div>;

export const claudeProactiveCinemaScenes: Record<string, Scene> = {
  'cpac.hook': Hook,
  'cpac.what': What,
  'cpac.turn': Turn,
  'cpac.memory': Memory,
  'cpac.schedule': Schedule,
  'cpac.confirm': Confirm,
  'cpac.dev': Dev,
  'cpac.end': End,
  'cpac.cover': Cover,
};
