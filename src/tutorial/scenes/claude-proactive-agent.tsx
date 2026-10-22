import React from 'react';
import {AbsoluteFill, Img, Loop, OffthreadVideo, staticFile} from 'remotion';
import {font} from '../theme';
import {clamp, ease, springStep} from '../../fx';
import {Cue, S, Scene, cam, hitOf, phaseOp} from '../paper';
import {BG, Big, DIM, INK, LINE, Mono, PANEL, PANEL_HI, mono} from '../tech';

// claude-proactive-agent: Claude Duet — why an AI can come to you first; three mechanisms (memory, scheduled tasks, human confirmation) (≈ 60 s).
// Script: inputs/claude-proactive-agent/script.md — narration read verbatim (cue marks only). Assets: Tabler icons (MIT, working copies
// with recolours in public/images/tutorials/claude-proactive-agent/) and Pexels footage (muted, blurred / dimmed, backgrounds only).
// Rules from the script: no official logos (product names as plain text), no X screenshots or handles, no links, no CTA. The
// notification and approval cards are drawn mockups. Accents follow the script: cyan #00E5FF, amber #FFB020.

const W = 900;
const CY = '#00e5ff', AM = '#ffb020';
const ICON = (n: string, tone: '' | 'amber' | 'ink' | 'red' = '') => staticFile(`images/tutorials/claude-proactive-agent/tabler-${n}${tone ? `-${tone}` : ''}.svg`);
const CLIP = (n: string) => staticFile(`video/claude-proactive-agent/${n}.mp4`);

const Root: React.FC<{children: React.ReactNode}> = ({children}) => <div style={{position: 'relative', width: W, height: 1080}}>{children}</div>;
const Abs: React.FC<{x?: number; y: number; w?: number; h?: number; style?: React.CSSProperties; children?: React.ReactNode}> = ({x = 0, y, w, h, style, children}) => (
  <div style={{position: 'absolute', left: x, top: y, width: w, height: h, ...style}}>{children}</div>
);
const popIn = (f: number, at: number) => {
  const k = springStep(S(f), S(at), {f: 2.6, z: 0.62});
  const sq = hitOf(f, [at + 4], 1);
  return {opacity: clamp(k * 2), transform: `scale(${(0.6 + 0.4 * k) * (1 + 0.04 * sq)}, ${(0.6 + 0.4 * k) * (1 - 0.05 * sq)})`};
};
const Pop: React.FC<{f: number; at: number; origin?: string; style?: React.CSSProperties; children: React.ReactNode}> = ({f, at, origin = '0% 50%', style, children}) => (
  f >= at - 1 ? <div style={{...popIn(f, at), transformOrigin: origin, ...style}}>{children}</div> : null
);
const Chip: React.FC<{c?: string; size?: number; fill?: boolean; style?: React.CSSProperties; children: React.ReactNode}> = ({c = CY, size = 48, fill, style, children}) => (
  <div style={{display: 'inline-flex', alignItems: 'center', gap: 12, background: fill ? c : 'rgba(10,14,20,0.82)', border: `4px solid ${c}`, color: fill ? BG : c,
    fontFamily: font, fontWeight: 900, fontSize: size, lineHeight: 1.25, padding: '4px 18px', whiteSpace: 'nowrap', borderRadius: 12, ...style}}>{children}</div>
);
const Stamp: React.FC<{f: number; at: number; c?: string; size?: number; deg?: number; children: React.ReactNode}> = ({f, at, c = AM, size = 64, deg = -6, children}) => {
  if (f < at - 6) return null;
  const k = ease.inCubic(clamp((f - at + 6) / 6));
  const sq = hitOf(f, [at], 1);
  return <div style={{display: 'inline-block', transform: `rotate(${deg}deg) scale(${(1.6 - 0.6 * k) * (1 + 0.05 * sq)}, ${(1.6 - 0.6 * k) * (1 - 0.06 * sq)})`,
    opacity: clamp(k * 2), border: `6px solid ${c}`, color: c, background: 'rgba(10,14,20,0.92)', fontFamily: font, fontWeight: 900, fontSize: size,
    padding: '4px 22px', whiteSpace: 'nowrap'}}>{children}</div>;
};
const Icon: React.FC<{n: string; tone?: '' | 'amber' | 'ink' | 'red'; size?: number; style?: React.CSSProperties}> = ({n, tone = '', size = 64, style}) => (
  <Img src={ICON(n, tone)} style={{width: size, height: size, flex: 'none', ...style}} />
);
/** Mechanism title: "① 记忆：" in cyan, the point in ink. */
const Title: React.FC<{f: number; k: string; t: string; size?: number}> = ({f, k, t, size = 76}) => (
  <Abs y={-10} w={W} style={phaseOp(f, -30)}>
    <div style={{fontFamily: font, fontWeight: 900, fontSize: size, lineHeight: 1.15, color: INK, whiteSpace: 'nowrap'}}><span style={{color: CY}}>{k}</span>{t}</div>
  </Abs>
);
const camT = (at: number, x: number, y: number, z: number) => cam(at, x, Math.min(y, 540 + (555 / z - 14 - 540) / 0.55), z);

/** Full-frame background footage: muted, looped, dimmed (≈ 35 % brightness) and optionally blurred, with the stock label. */
const Footage: React.FC<{name: string; f: number; blur?: number; dim?: number; push?: number}> = ({name, f, blur = 0, dim = 0.35, push = 0.08}) => (
  <AbsoluteFill style={{background: '#0a0e14', overflow: 'hidden'}}>
    <AbsoluteFill style={{transform: `scale(${1.05 + push * clamp(f / 300)})`, filter: `brightness(${dim}) saturate(0.8)${blur ? ` blur(${blur}px)` : ''}`}}>
      <Loop durationInFrames={238}>
        <OffthreadVideo src={CLIP(name)} muted style={{width: 1080, height: 1920, objectFit: 'cover'}} />
      </Loop>
    </AbsoluteFill>
    <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(10,14,20,0.7) 0%, rgba(10,14,20,0.2) 30%, rgba(10,14,20,0.2) 62%, rgba(10,14,20,0.8) 100%)'}} />
    <div style={{position: 'absolute', right: 130, top: 1258, color: 'rgba(232,240,250,0.75)', fontFamily: font, fontWeight: 700, fontSize: 40,
      background: 'rgba(10,14,20,0.6)', padding: '2px 12px'}}>Pexels 素材</div>
  </AbsoluteFill>
);

/* ---------- 1 hook: a notification arrives before you said anything ---------- */

const hookPlan = (cue: Cue) => ({a: cue('a', 35)});
const Notice: React.FC<{f: number; shake?: boolean}> = ({f, shake = true}) => {
  // already sliding down on frame 0, lands at frame 8, shakes at frame 10
  const y = -160 * (1 - ease.outBack(clamp((f + 6) / 14), 1.4));
  const sx = shake && f >= 10 && f < 24 ? 10 * Math.sin((f - 10) * 2.2) * (1 - (f - 10) / 14) : 0;
  return <div style={{transform: `translate(${sx}px, ${y}px)`, background: 'rgba(24,32,46,0.94)', border: `3px solid ${CY}`, borderRadius: 34, padding: '26px 30px',
    boxShadow: `0 20px 60px rgba(0,0,0,0.5), 0 0 40px rgba(0,229,255,0.18)`}}>
    <div style={{display: 'flex', alignItems: 'center', gap: 18}}>
      <div style={{width: 84, height: 84, borderRadius: 22, background: 'rgba(0,229,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <Icon n="bell-ringing" size={60} style={{transform: `rotate(${f < 40 ? 14 * Math.sin(f / 2) : 0}deg)`}} /></div>
      <div style={{fontFamily: font, fontWeight: 900, fontSize: 46, color: INK}}>AI 助理</div>
      <div style={{marginLeft: 'auto', fontFamily: font, fontWeight: 700, fontSize: 40, color: DIM}}>现在</div>
    </div>
    <div style={{marginTop: 18, fontFamily: font, fontWeight: 800, fontSize: 52, lineHeight: 1.35, color: INK}}>早上好，今天有 <span style={{color: AM}}>3</span> 件事需要你处理</div>
  </div>;
};
const Hook: Scene = ({f, cue}) => {
  const p = hookPlan(cue);
  return <Root>
    <Abs y={-14} w={W}>
      <Big size={88} style={{whiteSpace: 'nowrap'}}>你还没开口，</Big>
      <Big size={88} c={CY} style={{whiteSpace: 'nowrap', opacity: clamp((f - p.a + 10) / 8)}}>AI 先来找你了</Big>
    </Abs>
    <Abs y={330} w={W}><Notice f={f} /></Abs>
    <Abs y={720} w={W} style={{display: 'flex', justifyContent: 'center', gap: 22}}>
      {['今天', '3 件事', '需要你'].map((t, i) => <Pop key={t} f={f} at={p.a + i * 6} origin="50% 50%"><Chip c={i === 1 ? AM : CY} size={48}>{t}</Chip></Pop>)}
    </Abs>
  </Root>;
};
Hook.backdrop = ({f}) => <Footage name="01_phone-scroll-a" f={f} blur={16} dim={0.3} />;
Hook.sfx = (cue) => {
  const p = hookPlan(cue);
  return [{at: 0, kind: 'fs-phone-buzz', gain: 0.26}, {at: 8, kind: 'pop', gain: 0.14}, {at: p.a, kind: 'tick', gain: 0.1}];
};

/* ---------- 2 what happened: Claude Duet, three behaviours ---------- */

const whatPlan = (cue: Cue) => ({a: cue('a', 72), b: cue('b', 121), c: cue('c', 161)});
const What: Scene = ({f, cue}) => {
  const p = whatPlan(cue);
  const rows = [{at: p.a, n: 'mail', t: '每天早上发简报'}, {at: p.b, n: 'bell-ringing', t: '有事才提醒你'}, {at: p.c, n: 'hand-stop', t: '关键操作先问你'}];
  return <Root>
    <Abs y={0} w={W} style={{...popIn(f, 2), transformOrigin: '0 50%'}}>
      <div style={{display: 'inline-block', border: `4px solid ${INK}`, borderRadius: 18, padding: '10px 30px', background: 'rgba(10,14,20,0.8)'}}>
        <div style={{fontFamily: mono, fontWeight: 800, fontSize: 104, color: INK, lineHeight: 1.1}}>Claude Duet</div>
      </div>
      <div style={{marginTop: 18}}><Chip c={DIM} size={44}>研究预览版</Chip></div>
    </Abs>
    <Abs y={330} w={W} style={{display: 'flex', flexDirection: 'column', gap: 26}}>
      {rows.map((r, i) => <Pop key={r.t} f={f} at={r.at}>
        <div style={{display: 'flex', alignItems: 'center', gap: 26, background: 'rgba(18,26,40,0.88)', borderLeft: `10px solid ${i === 2 ? AM : CY}`, padding: '18px 26px'}}>
          <Icon n={r.n} tone={i === 2 ? 'amber' : ''} size={88} />
          <Big size={64} style={{whiteSpace: 'nowrap'}}>{r.t}</Big>
        </div>
      </Pop>)}
    </Abs>
    <Abs y={940} w={W} style={{opacity: clamp((f - 20) / 10)}}><Mono size={40} c={DIM}>目前仅面向美国部分订阅用户排队开放</Mono></Abs>
  </Root>;
};
What.backdrop = ({f}) => <Footage name="05_data-grid-flow" f={f} />;
What.sfx = (cue) => {
  const p = whatPlan(cue);
  return [{at: 2, kind: 'tap', gain: 0.14}, {at: p.a, kind: 'pop', gain: 0.12}, {at: p.b, kind: 'pop', gain: 0.12}, {at: p.c, kind: 'pop', gain: 0.12}];
};
What.camera = (cue) => {
  const p = whatPlan(cue);
  return [camT(0, 450, 300, 1.04), camT(p.a, 450, 540, 1.0), camT(p.c, 450, 620, 1.04)];
};

/* ---------- 3 the turn: four big companies, same kind of product — so how does it work? ---------- */

const turnPlan = (cue: Cue) => ({a: cue('a', 101), b: cue('b', 133)});
const NAMES = ['Grok Bot', 'Muse', 'Dots', 'Claude Duet'];
const Turn: Scene = ({f, cue}) => {
  const p = turnPlan(cue);
  const aside = ease.inOutCubic(clamp((f - p.a) / 16));
  return <Root>
    <Abs y={-10} w={W} style={phaseOp(f, 0, p.b - 4)}>
      <Big size={64} style={{whiteSpace: 'nowrap'}}>两个多月 · <span style={{color: AM}}>4</span> 家大公司</Big>
      <Big size={64} c={DIM} style={{whiteSpace: 'nowrap'}}>同一类产品</Big>
    </Abs>
    <Abs y={220} w={W} h={600}>
      {NAMES.map((n, i) => {
        const at = 8 + i * 12;
        const flip = clamp((f - at) / 10);
        const x = (i % 2) * 460, y = Math.floor(i / 2) * 270;
        const tx = x + (i % 2 ? 400 : -400) * aside, op = 1 - 0.6 * aside;
        return <div key={n} style={{position: 'absolute', left: tx, top: y, width: 440, height: 240, transform: `perspective(800px) rotateY(${90 * (1 - flip)}deg)`,
          opacity: f < at ? 0 : op, borderRadius: 24, border: `4px solid ${i === 3 ? CY : LINE}`, background: 'rgba(18,26,40,0.9)', display: 'flex', alignItems: 'center',
          justifyContent: 'center', fontFamily: mono, fontWeight: 800, fontSize: 60, color: i === 3 ? CY : INK}}>{n}</div>;
      })}
    </Abs>
    <Abs y={300} w={W} style={{textAlign: 'center', opacity: clamp((f - p.a - 4) / 8)}}>
      <Big size={60} c={DIM}>别只看又出了什么</Big>
    </Abs>
    {f >= p.b - 2 && <Abs y={430} w={W} style={{textAlign: 'center'}}><Pop f={f} at={p.b} origin="50% 50%">
      <Big size={92} style={{whiteSpace: 'nowrap'}}>它<span style={{color: AM}}>凭什么</span>能</Big>
      <Big size={92} c={CY} style={{whiteSpace: 'nowrap'}}>主动干活？</Big>
    </Pop></Abs>}
  </Root>;
};
Turn.backdrop = ({f}) => <Footage name="05_data-grid-flow" f={f + 240} />;
Turn.sfx = (cue) => {
  const p = turnPlan(cue);
  return [...NAMES.map((_, i) => ({at: 8 + i * 12, kind: 'tap', gain: 0.12})), {at: p.a, kind: 'whoosh-short', gain: 0.1}, {at: p.b, kind: 'thud', gain: 0.16}];
};

/* ---------- 4 mechanism 1: memory — knowing who you are ---------- */

const memPlan = (cue: Cue) => ({a: cue('a', 46), b: cue('b', 98), c: cue('c', 114), d: cue('d', 150), e: cue('e', 205)});
const Memory: Scene = ({f, cue}) => {
  const p = memPlan(cue);
  const tags = [{t: '记忆', at: p.a + 14, ang: -2.3}, {t: '技能', at: p.b, ang: -0.8}, {t: '已连接的应用', at: p.c, ang: 0.75}];
  const glow = tags.filter((t) => f >= t.at + 22).length;
  const CX = 450, CY0 = 470;
  return <Root>
    <Title f={f} k="① 记忆：" t="先知道你是谁" />
    {/* the brain, growing brighter with every tag absorbed */}
    <Abs x={CX - 170} y={CY0 - 170} w={340} h={340} style={{borderRadius: 170, background: `radial-gradient(circle, rgba(0,229,255,${0.08 + 0.08 * glow}), transparent 70%)`,
      display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
      <Icon n="brain" size={230} style={{transform: `scale(${1 + 0.05 * hitOf(f, tags.map((t) => t.at + 22), 1)})`}} />
    </Abs>
    <Abs x={0} y={150}><div style={{fontFamily: mono, fontWeight: 800, fontSize: 120, color: 'rgba(0,229,255,0.35)'}}>01</div></Abs>
    {tags.map((t) => {
      if (f < t.at - 2) return null;
      // orbit for a moment, then fly into the brain
      const orbit = t.ang + (f - t.at) * 0.03;
      const into = ease.inCubic(clamp((f - t.at - 10) / 12));
      const r = 300 * (1 - into);
      const x = CX + r * Math.cos(orbit), y = CY0 + r * 0.75 * Math.sin(orbit);
      return <div key={t.t} style={{position: 'absolute', left: x, top: y, transform: `translate(-50%, -50%) scale(${1 - 0.6 * into})`, opacity: 1 - clamp((into - 0.8) / 0.2),
        ...(into === 0 ? {} : {})}}><Pop f={f} at={t.at} origin="50% 50%"><Chip c={CY} size={50}>{t.t}</Chip></Pop></div>;
    })}
    <Abs y={760} w={W} style={{display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap'}}>
      <Pop f={f} at={p.d}><Chip c={INK} size={50}>你是谁 · 在忙什么</Chip></Pop>
      {f >= p.e - 2 && <span style={{fontFamily: font, fontWeight: 900, fontSize: 60, color: DIM}}>→</span>}
      <Pop f={f} at={p.e}><Chip c={AM} size={50} fill>哪件事跟你有关</Chip></Pop>
    </Abs>
  </Root>;
};
Memory.backdrop = ({f}) => <Footage name="04_network-data-vertical" f={f} dim={0.32} />;
Memory.sfx = (cue) => {
  const p = memPlan(cue);
  return [{at: 0, kind: 'tick', gain: 0.1}, {at: p.a + 14, kind: 'pop', gain: 0.1}, {at: p.b, kind: 'pop', gain: 0.1}, {at: p.c, kind: 'pop', gain: 0.1},
    {at: p.a + 36, kind: 'tap', gain: 0.12}, {at: p.c + 22, kind: 'tap', gain: 0.12}, {at: p.d, kind: 'tick', gain: 0.1}, {at: p.e, kind: 'chime', gain: 0.1}];
};
Memory.camera = (cue) => {
  const p = memPlan(cue);
  return [camT(0, 450, 460, 1.04), camT(p.d, 450, 640, 1.03)];
};

/* ---------- 5 mechanism 2: scheduled tasks — wakes up on time, runs in the cloud ---------- */

const schedPlan = (cue: Cue) => ({a: cue('a', 46), b: cue('b', 128), c: cue('c', 180), d: cue('d', 227)});
const Schedule: Scene = ({f, cue}) => {
  const p = schedPlan(cue);
  const PER = 34;
  const k = f >= p.a ? ((f - p.a) % PER) / PER : 0;
  const ticks = f >= p.a ? Math.floor((f - p.a) / PER) : -1;
  const lastTick = p.a + ticks * PER;
  const cloud = clamp((f - p.b + 4) / 10);
  const phoneOff = clamp((f - p.c) / 10);
  return <Root>
    <Title f={f} k="② 定时任务：" t="到点自己醒" />
    {/* the clock: a progress ring fills, and every lap pings mail / calendar */}
    <Abs x={30} y={160} w={300} h={300} style={{opacity: 1 - 0.5 * cloud}}>
      <svg width={300} height={300} viewBox="-150 -150 300 300" style={{position: 'absolute', inset: 0}}>
        <circle r={130} fill="none" stroke={LINE} strokeWidth={10} />
        <circle r={130} fill="none" stroke={CY} strokeWidth={10} strokeDasharray={817} strokeDashoffset={817 * (1 - k)} transform="rotate(-90)" />
      </svg>
      <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center'}}><Icon n="clock-hour-4" size={170} /></div>
    </Abs>
    <Abs x={0} y={110}><div style={{fontFamily: mono, fontWeight: 800, fontSize: 80, color: 'rgba(0,229,255,0.35)'}}>02</div></Abs>
    {['mail', 'calendar-event'].map((n, i) => {
      const hit = ticks >= 0 && f - lastTick < 12;
      return <Abs key={n} x={420 + i * 230} y={230} w={170} h={170} style={{borderRadius: 26, border: `4px solid ${hit ? CY : LINE}`, background: 'rgba(18,26,40,0.88)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 1 - 0.5 * cloud,
        transform: `scale(${1 + 0.08 * (hit ? 1 - (f - lastTick) / 12 : 0)})`}}><Icon n={n} size={100} /></Abs>;
    })}
    {ticks >= 0 && f - lastTick < 14 && <svg width={W} height={1080} style={{position: 'absolute', left: 0, top: 0}}>
      {[505, 735].map((x) => <line key={x} x1={330} y1={310} x2={330 + (x - 330) * clamp((f - lastTick) / 8)} y2={310} stroke={CY} strokeWidth={6} opacity={1 - (f - lastTick) / 14} />)}
    </svg>}
    <Abs y={490} w={W} style={phaseOp(f, p.a)}><Chip c={CY} size={52}>每隔几个小时检查一次</Chip></Abs>
    {/* cloud VM keeps working while the phone goes dark */}
    <Abs y={620} w={W} h={360} style={{opacity: cloud, transform: `translateY(${(1 - cloud) * 40}px)`}}>
      <div style={{position: 'absolute', left: 0, top: 0, width: 220, height: 340, borderRadius: 34, border: `6px solid ${phoneOff > 0.5 ? LINE : INK}`,
        background: `rgba(${Math.round(60 * (1 - phoneOff))},${Math.round(90 * (1 - phoneOff))},${Math.round(120 * (1 - phoneOff))},0.6)`, display: 'flex',
        alignItems: 'center', justifyContent: 'center'}}>
        <span style={{fontFamily: font, fontWeight: 900, fontSize: 44, color: phoneOff > 0.5 ? DIM : INK}}>{phoneOff > 0.5 ? '已关机' : '手机'}</span>
      </div>
      <div style={{position: 'absolute', left: 300, top: 10, width: 300, height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <svg width={300} height={300} viewBox="-150 -150 300 300" style={{position: 'absolute', inset: 0}}>
          <circle r={135} fill="none" stroke={LINE} strokeWidth={8} />
          <circle r={135} fill="none" stroke={AM} strokeWidth={8} strokeDasharray="200 648" transform={`rotate(${f * 8})`} />
        </svg>
        <Icon n="cloud-computing" size={170} />
      </div>
      <div style={{position: 'absolute', left: 640, top: 70}}><Big size={46} c={CY} style={{lineHeight: 1.3}}>云端<br />虚拟机</Big></div>
    </Abs>
    {f >= p.c && <Abs y={980} w={W}><Pop f={f} at={p.c + 8}><Chip c={AM} size={46}>关了手机也能干</Chip></Pop></Abs>}
    <Abs x={420} y={190} w={480} style={{textAlign: 'right'}}><Stamp f={f} at={p.d + 10} size={64} deg={-5}>到点自己醒</Stamp></Abs>
  </Root>;
};
Schedule.backdrop = ({f}) => <Footage name="04_network-data-vertical" f={f + 300} dim={0.25} />;
Schedule.sfx = (cue) => {
  const p = schedPlan(cue);
  const ev = Array.from({length: 6}, (_, i) => ({at: p.a + i * 34, kind: 'fs-watch-tick', gain: 0.1})).filter((e) => e.at < p.b);
  return [...ev, {at: p.b, kind: 'whoosh-short', gain: 0.1}, {at: p.c, kind: 'block', gain: 0.12}, {at: p.d + 10, kind: 'stamp', gain: 0.18}];
};
Schedule.camera = (cue) => {
  const p = schedPlan(cue);
  return [camT(0, 450, 380, 1.04), camT(p.b, 450, 700, 1.03), camT(p.d, 450, 560, 1.0)];
};

/* ---------- 6 mechanism 3: key steps wait for your approval ---------- */

const confPlan = (cue: Cue) => ({a: cue('a', 71), b: cue('b', 92), c: cue('c', 107), d: cue('d', 129), e: cue('e', 160), f: cue('f', 211)});
const Confirm: Scene = ({f, cue}) => {
  const p = confPlan(cue);
  const items = [{t: '发消息', at: p.a}, {t: '付款', at: p.b}, {t: '签文件', at: p.c}, {t: '删除', at: p.d}];
  const tap = p.f + 14;
  const reach = clamp((f - tap + 12) / 12);
  const ok = f >= tap;
  return <Root>
    <Title f={f} k="③ 关键一步：" t="等你确认" />
    <Abs x={0} y={110}><div style={{fontFamily: mono, fontWeight: 800, fontSize: 80, color: 'rgba(255,176,32,0.4)'}}>03</div></Abs>
    {/* the four guarded actions */}
    <Abs y={230} w={W} style={{display: 'flex', alignItems: 'center', gap: 16}}>
      <Icon n="checklist" tone={f >= p.a ? 'amber' : ''} size={80} />
      {items.map((it) => <Pop key={it.t} f={f} at={it.at} origin="50% 50%"><Chip c={AM} size={46} fill={f >= it.at + 6}>{it.t}</Chip></Pop>)}
    </Abs>
    {/* approval card: a drawn mockup */}
    <Abs x={60} y={380} w={780} h={470} style={{opacity: clamp((f - p.e + 6) / 8), transform: `translateY(${(1 - clamp((f - p.e + 6) / 12)) * 50}px)`}}>
      <div style={{position: 'absolute', inset: 0, borderRadius: 30, background: 'rgba(22,30,44,0.96)', border: `4px solid ${ok ? CY : AM}`}} />
      <div style={{position: 'absolute', left: 36, top: 30, display: 'flex', alignItems: 'center', gap: 16}}>
        <Icon n="hand-stop" tone="amber" size={70} /><Big size={52} c={AM}>即将执行：发送邮件</Big></div>
      <div style={{position: 'absolute', left: 36, right: 36, top: 140, height: 120, borderRadius: 16, background: PANEL, padding: '18px 22px', display: 'flex',
        alignItems: 'center', gap: 18}}>
        <Icon n="mail" tone="ink" size={64} />
        <div style={{flex: 1}}><div style={{height: 22, width: '80%', borderRadius: 11, background: PANEL_HI}} /><div style={{height: 22, width: '55%', borderRadius: 11,
          background: PANEL_HI, marginTop: 14}} /></div>
      </div>
      <div style={{position: 'absolute', left: 36, right: 36, bottom: 36, display: 'flex', gap: 24}}>
        <div style={{flex: 1, height: 110, borderRadius: 18, background: CY, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: font, fontWeight: 900,
          fontSize: 56, color: BG, transform: `scale(${1 - 0.06 * hitOf(f, [tap], 1)})`, boxShadow: ok ? `0 0 40px ${CY}` : undefined}}>批准</div>
        <div style={{flex: 1, height: 110, borderRadius: 18, border: `4px solid ${LINE}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: font,
          fontWeight: 900, fontSize: 56, color: DIM}}>取消</div>
      </div>
      {/* the finger: a drawn tap marker */}
      {f >= tap - 14 && <div style={{position: 'absolute', left: 300 + 60 * (1 - reach), top: 360 + 160 * (1 - reach), width: 70, height: 70, borderRadius: 35,
        background: 'rgba(232,240,250,0.9)', border: `5px solid ${BG}`, opacity: f > tap + 16 ? 0 : 1}} />}
    </Abs>
    {ok && <Abs y={880} w={W} style={{display: 'flex', justifyContent: 'center'}}><Pop f={f} at={tap + 4} origin="50% 50%">
      <Chip c={CY} size={54}><Icon n="user-check" size={64} />你批准了，它才动手</Chip></Pop></Abs>}
  </Root>;
};
Confirm.backdrop = ({f}) => <Footage name="05_data-grid-flow" f={f + 120} dim={0.25} />;
Confirm.sfx = (cue) => {
  const p = confPlan(cue);
  return [{at: p.a, kind: 'tick', gain: 0.1}, {at: p.b, kind: 'tick', gain: 0.1}, {at: p.c, kind: 'tick', gain: 0.1}, {at: p.d, kind: 'tick', gain: 0.1},
    {at: p.e, kind: 'whoosh-short', gain: 0.08}, {at: p.f + 14, kind: 'tap', gain: 0.22}, {at: p.f + 18, kind: 'chime', gain: 0.1}];
};
Confirm.camera = (cue) => {
  const p = confPlan(cue);
  return [camT(0, 450, 360, 1.04), camT(p.e, 450, 600, 1.02), camT(p.f, 450, 700, 1.05)];
};

/* ---------- 7 developer view: three plain parts, the hard part is the system ---------- */

const devPlan = (cue: Cue) => ({a: cue('a', 66), b: cue('b', 126), c: cue('c', 166), d: cue('d', 235), e: cue('e', 276)});
const PARTS = [{n: 'brain', t: '记忆'}, {n: 'clock-hour-4', t: '调度'}, {n: 'hand-stop', t: '人工确认'}];
const Dev: Scene = ({f, cue}) => {
  const p = devPlan(cue);
  const join = ease.inOutCubic(clamp((f - p.c) / 24));
  const plain = f >= p.b && f < p.c;
  return <Root>
    <Abs y={-10} w={W}>
      <div style={{fontFamily: font, fontWeight: 900, fontSize: 70, color: INK, whiteSpace: 'nowrap', ...phaseOp(f, p.a - 6, p.c - 4)}}>记忆 + 调度 + 人工确认</div>
    </Abs>
    <Abs y={-10} w={W}>
      <div style={{fontFamily: font, fontWeight: 900, fontSize: 70, lineHeight: 1.15, color: INK, whiteSpace: 'nowrap', ...phaseOp(f, p.c - 2)}}>难的是拼成一个</div>
      <div style={{fontFamily: font, fontWeight: 900, fontSize: 70, lineHeight: 1.15, color: CY, whiteSpace: 'nowrap', ...phaseOp(f, p.c + 6)}}>靠得住的系统</div>
    </Abs>
    {f < p.a - 6 && <Abs y={260} w={W} style={{textAlign: 'center', ...phaseOp(f, 2)}}><Big size={60} c={DIM}>做 Agent 开发的人都清楚</Big></Abs>}
    {/* the three parts: in a row, then pulled together into one box */}
    <svg width={W} height={1080} style={{position: 'absolute', left: 0, top: 0}}>
      {join > 0 && PARTS.map((_, i) => {
        const x = 150 + i * 300;
        return <line key={i} x1={x} y1={380} x2={x + (450 - x) * join} y2={380 + 230 * join} stroke={CY} strokeWidth={6} opacity={0.8}
          style={{filter: `drop-shadow(0 0 8px ${CY})`}} />;
      })}
    </svg>
    {PARTS.map((pt, i) => {
      const x = 150 + i * 300;
      return <Abs key={pt.t} x={x - 120} y={250} w={240} style={{textAlign: 'center', opacity: plain ? 0.45 : 1}}><Pop f={f} at={p.a + i * 8} origin="50% 50%">
        <div style={{width: 200, height: 200, margin: '0 auto', borderRadius: 30, border: `4px solid ${plain ? LINE : CY}`, background: 'rgba(18,26,40,0.9)', display: 'flex',
          alignItems: 'center', justifyContent: 'center'}}><Icon n={pt.n} tone={plain ? 'ink' : ''} size={120} /></div>
        <Big size={50} c={plain ? DIM : INK} style={{marginTop: 10}}>{pt.t}</Big>
      </Pop></Abs>;
    })}
    {plain && <Abs y={560} w={W} style={{textAlign: 'center'}}><Pop f={f} at={p.b + 4} origin="50% 50%"><Chip c={DIM} size={52}>单拿出来都不新鲜</Chip></Pop></Abs>}
    {f >= p.c + 10 && <Abs x={200} y={600} w={500} h={250} style={{...popIn(f, p.c + 16), transformOrigin: '50% 50%'}}>
      <div style={{position: 'absolute', inset: 0, borderRadius: 30, border: `5px solid ${CY}`, background: 'rgba(0,229,255,0.1)', boxShadow: `0 0 50px rgba(0,229,255,0.3)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 22}}>
        <Icon n="robot" size={130} /><Big size={60}>Agent 系统</Big>
      </div>
    </Abs>}
    <Abs y={900} w={W} style={{display: 'flex', justifyContent: 'center', gap: 22}}>
      <Pop f={f} at={p.d} origin="50% 50%"><Chip c={CY} size={50} fill>该出手</Chip></Pop>
      <Pop f={f} at={p.e} origin="50% 50%"><Chip c={AM} size={50} fill>该停下来问你</Chip></Pop>
    </Abs>
  </Root>;
};
Dev.backdrop = ({f}) => <Footage name="05_data-grid-flow" f={f} dim={0.2} />;
Dev.sfx = (cue) => {
  const p = devPlan(cue);
  return [{at: 2, kind: 'tick', gain: 0.1}, ...PARTS.map((_, i) => ({at: p.a + i * 8, kind: 'pop', gain: 0.1})), {at: p.b, kind: 'block', gain: 0.1},
    {at: p.c, kind: 'whoosh', gain: 0.1}, {at: p.c + 16, kind: 'thud', gain: 0.14}, {at: p.d, kind: 'tap', gain: 0.14}, {at: p.e, kind: 'tap', gain: 0.14}];
};
Dev.camera = (cue) => {
  const p = devPlan(cue);
  return [camT(0, 450, 400, 1.03), camT(p.c, 450, 600, 1.03), camT(p.d, 450, 700, 1.05)];
};

/* ---------- 8 end: it can act first, but the last tap is yours ---------- */

const endPlan = (cue: Cue) => ({a: cue('a', 48), b: cue('b', 83)});
const End: Scene = ({f, cue, dur}) => {
  const p = endPlan(cue);
  const tap = p.b + 12;
  const lit = f >= tap;
  const fade = clamp((f - dur + 12) / 10);
  return <Root>
    <Abs y={-14} w={W}>
      <Big size={88} style={{whiteSpace: 'nowrap'}}>AI 可以主动，</Big>
      <Big size={88} c={CY} style={{whiteSpace: 'nowrap', opacity: clamp((f - p.a + 4) / 8)}}>但做主的是你</Big>
    </Abs>
    <Abs y={560} w={W} style={{display: 'flex', justifyContent: 'center'}}>
      <div style={{width: 460, height: 160, borderRadius: 80, border: `6px solid ${CY}`, background: lit ? CY : 'rgba(10,14,20,0.7)', display: 'flex', alignItems: 'center',
        justifyContent: 'center', fontFamily: font, fontWeight: 900, fontSize: 80, color: lit ? BG : CY, transform: `scale(${1 - 0.07 * hitOf(f, [tap], 1)})`,
        boxShadow: lit ? `0 0 ${60 + 20 * Math.sin(f / 4)}px ${CY}` : undefined}}>确认</div>
    </Abs>
    {f >= tap && f < tap + 18 && <Abs y={560 + 80} w={W} style={{display: 'flex', justifyContent: 'center'}}>
      <div style={{width: 160 + 300 * ((f - tap) / 18), height: 160 + 300 * ((f - tap) / 18), marginTop: -(80 + 150 * ((f - tap) / 18)), borderRadius: '50%',
        border: `5px solid ${CY}`, opacity: 1 - (f - tap) / 18}} /></Abs>}
    <div style={{position: 'absolute', left: -200, right: -200, top: -400, bottom: -600, background: '#000', opacity: fade}} />
  </Root>;
};
End.backdrop = ({f, dur}) => <>
  <Footage name="08_tap-blank-screen" f={f} dim={0.32} />
  <AbsoluteFill style={{background: '#000', opacity: clamp((f - dur + 12) / 10)}} />
</>;
End.sfx = (cue) => {
  const p = endPlan(cue);
  return [{at: 4, kind: 'tick', gain: 0.08}, {at: p.b + 12, kind: 'tap', gain: 0.22}, {at: p.b + 16, kind: 'chime', gain: 0.12}];
};

/* ---------- cover anchor (880 × 800): the notification ---------- */

const Cover: Scene = () => <div style={{position: 'relative', width: 880, height: 800}}>
  <div style={{position: 'absolute', left: 0, top: 120, width: 880}}><Notice f={40} shake={false} /></div>
  <div style={{position: 'absolute', left: 0, top: 520, width: 880, display: 'flex', justifyContent: 'center', gap: 22}}>
    {[{n: 'brain', t: '记忆'}, {n: 'clock-hour-4', t: '定时任务'}, {n: 'hand-stop', t: '等你确认'}].map((x) => (
      <div key={x.t} style={{display: 'flex', alignItems: 'center', gap: 10, border: `4px solid ${CY}`, borderRadius: 14, padding: '6px 16px', background: 'rgba(10,14,20,0.8)'}}>
        <Icon n={x.n} size={56} /><span style={{fontFamily: font, fontWeight: 900, fontSize: 44, color: INK}}>{x.t}</span></div>))}
  </div>
</div>;

export const claudeProactiveScenes: Record<string, Scene> = {
  'cpa.hook': Hook,
  'cpa.what': What,
  'cpa.turn': Turn,
  'cpa.memory': Memory,
  'cpa.schedule': Schedule,
  'cpa.confirm': Confirm,
  'cpa.dev': Dev,
  'cpa.end': End,
  'cpa.cover': Cover,
};
