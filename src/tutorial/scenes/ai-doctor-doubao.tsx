import React from 'react';
import {font} from '../theme';
import {clamp, ease, springStep} from '../../fx';
import {Cue, S, Scene, cam, hitOf, phaseOp} from '../paper';
import {A, B, BG, Big, DIM, INK, LINE, Mono, PANEL, PANEL_HI, STEEL, mono} from '../tech';

// ai-doctor-doubao: why an AI assistant dares to say you may have a big problem — hallucination and no individual context (≈ 41 s).
// Script: inputs/ai-doctor-doubao/script.md — narration read verbatim (cue marks only). Facts: 中新网 2026-10-21 report on the
// 复旦大学老龄研究院 survey (≈ 70 % of doctors, 81.33 % "lack of individualisation"). The slug is internal only.
// Hard rules: never name an AI product (always 「AI助手」); no medical advice, no symptom examples; every visual is a self-drawn
// flat shape — no hospital / doctor photos, no scans, no app UI or logos, no cross emblem (doctor coats have no symbol on them).
// Accents: green = the check result, red = the alarming answer / what's missing, cyan B = the AI assistant used well, amber A = for the doctor.

const W = 900;
const RED = '#ff5a5a';
const GREEN = '#5ee08a';

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
const Chip: React.FC<{c?: string; size?: number; fill?: boolean; style?: React.CSSProperties; children: React.ReactNode}> = ({c = B, size = 48, fill, style, children}) => (
  <div style={{display: 'inline-flex', alignItems: 'center', gap: 12, background: fill ? c : BG, border: `4px solid ${c}`, color: fill ? BG : c, fontFamily: font,
    fontWeight: 900, fontSize: size, lineHeight: 1.25, padding: '4px 18px', whiteSpace: 'nowrap', borderRadius: 10, ...style}}>{children}</div>
);
const Stamp: React.FC<{f: number; at: number; c?: string; size?: number; deg?: number; children: React.ReactNode}> = ({f, at, c = RED, size = 64, deg = -6, children}) => {
  if (f < at - 6) return null;
  const k = ease.inCubic(clamp((f - at + 6) / 6));
  const sq = hitOf(f, [at], 1);
  return <div style={{display: 'inline-block', transform: `rotate(${deg}deg) scale(${(1.6 - 0.6 * k) * (1 + 0.05 * sq)}, ${(1.6 - 0.6 * k) * (1 - 0.06 * sq)})`,
    opacity: clamp(k * 2), border: `6px solid ${c}`, color: c, background: 'rgba(12,26,44,0.92)', fontFamily: font, fontWeight: 900, fontSize: size,
    padding: '4px 22px', whiteSpace: 'nowrap'}}>{children}</div>;
};
const Title: React.FC<{f: number; k?: string; lines: React.ReactNode[]; size?: number}> = ({f, k, lines, size = 76}) => (
  <Abs y={-10} w={W} style={phaseOp(f, -30)}>
    {k && <div style={{fontFamily: font, fontWeight: 900, fontSize: 48, color: A, marginBottom: 4, whiteSpace: 'nowrap'}}>{k}</div>}
    {lines.map((l, i) => <div key={i} style={{fontFamily: font, fontWeight: 900, fontSize: size, lineHeight: 1.15, color: INK, whiteSpace: 'nowrap'}}>{l}</div>)}
  </Abs>
);
const red = (s: string) => <span style={{color: RED}}>{s}</span>;
const cyan = (s: string) => <span style={{color: B}}>{s}</span>;
const camT = (at: number, x: number, y: number, z: number) => cam(at, x, Math.min(y, 540 + (555 / z - 14 - 540) / 0.55), z);

/* ---------- drawn icons: AI assistant (robot), doctor coat (no symbol, no face), report sheet, person outline ---------- */

const Robot: React.FC<{s?: number; c?: string; blink?: number}> = ({s = 1, c = B, blink = 0}) => (
  <svg width={120 * s} height={130 * s} viewBox="-60 -70 120 130">
    <line x1={0} y1={-50} x2={0} y2={-34} stroke={c} strokeWidth={6} strokeLinecap="round" /><circle cx={0} cy={-56} r={8} fill={c} />
    <rect x={-48} y={-34} width={96} height={76} rx={20} fill="none" stroke={c} strokeWidth={7} />
    <rect x={-60} y={-10} width={12} height={26} rx={5} fill={c} /><rect x={48} y={-10} width={12} height={26} rx={5} fill={c} />
    {[-18, 18].map((x) => <ellipse key={x} cx={x} cy={0} rx={8} ry={8 * (1 - 0.85 * blink)} fill={c} />)}
    <path d="M-16 22 Q0 30 16 22" fill="none" stroke={c} strokeWidth={6} strokeLinecap="round" />
  </svg>
);
/** A white coat, flat: shoulders, V-neck, lapels, buttons. Deliberately no emblem and no head. */
const Coat: React.FC<{s?: number; c?: string; on?: boolean}> = ({s = 1, c = INK, on = true}) => (
  <svg width={100 * s} height={110 * s} viewBox="-50 -55 100 110">
    <path d="M-40 50 L-44 -18 Q-42 -40 -18 -46 L0 -20 L18 -46 Q42 -40 44 -18 L40 50 Z" fill={on ? c : 'none'} stroke={on ? c : LINE} strokeWidth={5} strokeLinejoin="round" />
    <path d="M-18 -46 L-6 0 L0 -20 L6 0 L18 -46" fill="none" stroke={on ? BG : LINE} strokeWidth={5} strokeLinejoin="round" />
    {[8, 24, 40].map((y) => <circle key={y} cx={0} cy={y} r={4} fill={on ? BG : LINE} />)}
  </svg>
);
const Report: React.FC<{s?: number; ok?: number}> = ({s = 1, ok = 1}) => (
  <svg width={150 * s} height={190 * s} viewBox="0 0 150 190">
    <rect x={6} y={6} width={138} height={178} rx={14} fill={PANEL_HI} stroke={STEEL} strokeWidth={6} />
    {[40, 66, 92].map((y, i) => <rect key={y} x={26} y={y} width={[98, 76, 88][i]} height={12} rx={6} fill={STEEL} opacity={0.6} />)}
    <circle cx={75} cy={142} r={30} fill={GREEN} opacity={ok} />
    <path d="M60 142 L71 153 L92 131" fill="none" stroke={BG} strokeWidth={8} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={50}
      strokeDashoffset={50 * (1 - ok)} />
  </svg>
);
const Person: React.FC<{c?: string}> = ({c = STEEL}) => (
  <svg width={220} height={300} viewBox="-110 -150 220 300">
    <circle cx={0} cy={-80} r={52} fill="none" stroke={c} strokeWidth={8} />
    <path d="M-95 140 C-95 30 -55 -10 0 -10 C55 -10 95 30 95 140" fill="none" stroke={c} strokeWidth={8} strokeLinecap="round" />
  </svg>
);

/* ---------- the split screen: check result vs the AI assistant's answer, with a cracked divider ---------- */

const Split: React.FC<{f: number; bubbleAt: number; heal?: number; alarm?: boolean}> = ({f, bubbleAt, heal = 0, alarm = true}) => {
  const flash = alarm && f >= bubbleAt && f % 16 < 8;
  const crack = 1 - heal;
  return <>
    <Abs x={0} y={150} w={420} h={560} style={{borderRadius: 26, border: `5px solid ${GREEN}`, background: 'rgba(18,38,61,0.9)'}}>
      <div style={{position: 'absolute', left: 0, right: 0, top: 50, display: 'flex', justifyContent: 'center'}}><Report s={1.3} /></div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 360, textAlign: 'center', fontFamily: font, fontWeight: 900, fontSize: 56, color: INK}}>检查：<span style={{color: GREEN}}>没事</span></div>
    </Abs>
    <Abs x={480} y={150} w={420} h={560} style={{borderRadius: 26, border: `5px solid ${alarm ? RED : B}`, background: alarm ? 'rgba(255,90,90,0.08)' : 'rgba(18,38,61,0.9)'}}>
      <div style={{position: 'absolute', left: 0, right: 0, top: 40, display: 'flex', justifyContent: 'center'}}><Robot s={1.3} c={alarm ? RED : B} blink={f % 50 < 4 ? 1 : 0} /></div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 220, textAlign: 'center', fontFamily: font, fontWeight: 900, fontSize: 44, color: DIM}}>AI助手</div>
      {f >= bubbleAt - 1 && <div style={{position: 'absolute', left: 24, right: 24, top: 300, ...popIn(f, bubbleAt), transformOrigin: '50% 0%'}}>
        <div style={{background: flash ? RED : PANEL_HI, border: `4px solid ${RED}`, borderRadius: '10px 30px 30px 30px', padding: '16px 18px', fontFamily: font,
          fontWeight: 900, fontSize: 52, lineHeight: 1.3, color: flash ? '#fff' : RED, textAlign: 'center'}}>可能有<br />大问题</div>
      </div>}
    </Abs>
    {/* the divider: a lightning crack that heals into a bridge */}
    <svg width={W} height={1080} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
      {crack > 0 && <path d="M450 130 L430 260 L470 330 L428 430 L472 520 L436 610 L450 730" fill="none" stroke={A} strokeWidth={8} strokeLinejoin="round"
        opacity={crack} style={{filter: `drop-shadow(0 0 10px ${A})`}} />}
      {heal > 0 && <g opacity={heal}>
        <path d={`M${420} 430 Q450 ${430 - 60 * heal} ${480} 430`} fill="none" stroke={B} strokeWidth={10} strokeLinecap="round" />
        <rect x={400} y={424} width={100} height={14} rx={7} fill={B} />
      </g>}
    </svg>
  </>;
};

/* ---------- 1 hook: the check says fine, the AI assistant says maybe a big problem — who do you believe? ---------- */

const hookPlan = (cue: Cue) => ({a: cue('a', 49), b: cue('b', 108)});
const Hook: Scene = ({f, cue}) => {
  const p = hookPlan(cue);
  const shake = f >= p.a && f < p.a + 12 ? 8 * Math.sin((f - p.a) * 2.4) * (1 - (f - p.a) / 12) : 0;
  return <Root>
    <div style={{position: 'absolute', inset: 0, transform: `translateX(${shake}px)`}}><Split f={f} bubbleAt={Math.min(p.a, 14)} /></div>
    <Abs y={760} w={W} style={{textAlign: 'center'}}>
      {f >= p.b - 2 && <Pop f={f} at={p.b} origin="50% 50%"><div style={{fontFamily: font, fontWeight: 900, fontSize: 132, color: A}}>你信谁？</div></Pop>}
    </Abs>
  </Root>;
};
Hook.sfx = (cue) => {
  const p = hookPlan(cue);
  return [{at: 0, kind: 'chime', gain: 0.14}, {at: 14, kind: 'pop', gain: 0.14}, {at: p.a, kind: 'block', gain: 0.14}, {at: p.b, kind: 'thud', gain: 0.18}];
};
Hook.camera = (cue) => {
  const p = hookPlan(cue);
  return [camT(0, 450, 440, 1.0), camT(p.a, 690, 420, 1.05), camT(p.b, 450, 520, 1.02)];
};

/* ---------- 2 the survey: about 7 in 10 doctors have met it; why does it dare? two reasons ---------- */

const surveyPlan = (cue: Cue) => ({a: cue('a', 38), b: cue('b', 141), c: cue('c', 175)});
const Survey: Scene = ({f, cue}) => {
  const p = surveyPlan(cue);
  const n = Math.min(7, Math.floor(7 * ease.outCubic(clamp((f - p.a) / 40)) + 0.001));
  return <Root>
    <Abs y={-10} w={W}>
      <Big size={76} style={{whiteSpace: 'nowrap'}}>约<span style={{color: A}}>七成</span>医生</Big>
      <Big size={60} c={INK} style={{whiteSpace: 'nowrap', opacity: clamp((f - p.a + 4) / 8)}}>遇到过拿AI问病的患者</Big>
    </Abs>
    <Abs y={230} w={W} style={{display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', rowGap: 20, justifyItems: 'center'}}>
      {Array.from({length: 10}, (_, i) => <div key={i} style={{transform: i === n - 1 && f < p.a + 44 ? `scale(${1 + 0.1 * hitOf(f, [p.a + Math.round(40 * i / 7)], 1)})` : undefined}}>
        <Coat s={1.5} c={i < n ? B : INK} on={i < n} /></div>)}
    </Abs>
    <Abs x={600} y={600} w={300} style={{textAlign: 'right'}}>
      <span style={{fontFamily: mono, fontWeight: 800, fontSize: 150, color: A}}>{n}</span><span style={{fontFamily: mono, fontWeight: 800, fontSize: 70, color: DIM}}>/10</span>
    </Abs>
    <Abs y={640} w={600}><Mono size={40} c={DIM} style={{lineHeight: 1.35}}>复旦大学老龄研究院调研<br />75位医生</Mono></Abs>
    <Abs y={820} w={W} style={{display: 'flex', alignItems: 'center', gap: 22}}>
      <Pop f={f} at={p.b}><Big size={60} style={{whiteSpace: 'nowrap'}}>AI为什么敢这么说？</Big></Pop>
    </Abs>
    <Abs y={920} w={W} style={{display: 'flex', gap: 18}}>
      <Pop f={f} at={p.c}><Chip c={A} size={52} fill>两个原因</Chip></Pop>
    </Abs>
  </Root>;
};
Survey.sfx = (cue) => {
  const p = surveyPlan(cue);
  return [...Array.from({length: 7}, (_, i) => ({at: p.a + Math.round(40 * (i + 1) / 7), kind: 'tick', gain: 0.08})), {at: p.b, kind: 'pop', gain: 0.12},
    {at: p.c, kind: 'tap', gain: 0.16}];
};
Survey.camera = (cue) => {
  const p = surveyPlan(cue);
  return [camT(0, 450, 380, 1.04), camT(p.b, 450, 700, 1.04)];
};

/* ---------- 3 reason 1: hallucination — next word by probability; fluent ≠ right ---------- */

const halluPlan = (cue: Cue) => ({a: cue('a', 58), b: cue('b', 111), c: cue('c', 163)});
// a neutral, made-up sentence built word by word; each step shows three candidates and takes the longest bar
const STEPS = [{pick: '你说的', alt: ['我觉得', '根据']}, {pick: '情况', alt: ['这些', '内容']}, {pick: '可能', alt: ['应该', '也许']}, {pick: '是', alt: ['算', '属于']},
  {pick: '大问题', alt: ['小事', '正常']}];
const Hallu: Scene = ({f, cue}) => {
  const p = halluPlan(cue);
  const per = Math.max(14, Math.floor((p.c - p.a - 6) / STEPS.length));
  const step = f < p.a ? -1 : Math.min(STEPS.length - 1, Math.floor((f - p.a) / per));
  const local = f < p.a ? 0 : clamp(((f - p.a) % per) / per);
  const built = STEPS.slice(0, f < p.a ? 0 : step + (local > 0.6 || f >= p.a + per * STEPS.length ? 1 : 0)).map((s) => s.pick);
  const cur = step >= 0 && f < p.a + per * STEPS.length ? STEPS[step] : null;
  const fluent = clamp((f - p.b) / 12);
  return <Root>
    <Title f={f} k="原因一" lines={[<>{red('幻觉')}：说得通顺≠说得对</>]} size={72} />
    {/* the sentence so far */}
    <Abs y={170} w={W} h={150} style={{borderRadius: 20, border: `4px solid ${fluent > 0 ? B : LINE}`, background: PANEL, padding: '0 30px', display: 'flex',
      alignItems: 'center', gap: 6, flexWrap: 'wrap'}}>
      <div style={{flex: 'none'}}><Robot s={0.7} /></div>
      {built.map((w, i) => <span key={i} style={{fontFamily: font, fontWeight: 900, fontSize: 60, color: i === built.length - 1 && f < p.c ? A : INK, whiteSpace: 'nowrap'}}>{w}</span>)}
      <span style={{fontFamily: font, fontWeight: 900, fontSize: 60, color: B, opacity: f % 14 < 7 ? 1 : 0.2}}>▍</span>
    </Abs>
    {/* the next-word candidates (bar = how likely; illustrative, no numbers) */}
    <Abs y={360} w={W} style={{opacity: cur ? 1 : 0.25}}>
      <Mono size={40} c={DIM} style={{marginBottom: 14}}>下一个词？按概率挑</Mono>
      {(cur ? [cur.pick, ...cur.alt] : ['', '', '']).map((w, i) => {
        const len = [0.92, 0.55, 0.32][i] * ease.outCubic(clamp(local * 2.5));
        const chosen = i === 0 && local > 0.6;
        return <div key={i} style={{display: 'flex', alignItems: 'center', gap: 20, marginBottom: 16}}>
          <div style={{width: 200, fontFamily: font, fontWeight: 900, fontSize: 52, color: chosen ? A : INK, whiteSpace: 'nowrap'}}>{w}</div>
          <div style={{flex: 1, height: 46, background: PANEL_HI, borderRadius: 10}}>
            <div style={{width: `${100 * len}%`, height: '100%', borderRadius: 10, background: chosen ? A : i === 0 ? STEEL : LINE}} /></div>
        </div>;
      })}
    </Abs>
    <Abs y={760} w={W} style={{display: 'flex', alignItems: 'center', gap: 20, opacity: fluent}}>
      <Chip c={B} size={52}>越通顺</Chip><span style={{fontFamily: font, fontWeight: 900, fontSize: 60, color: DIM}}>→</span><Chip c={B} size={52}>越像真的</Chip>
    </Abs>
    <Abs y={880} w={W} style={{display: 'flex', justifyContent: 'center'}}><Stamp f={f} at={p.c + 6} size={80} deg={-6}>可能是编的</Stamp></Abs>
  </Root>;
};
Hallu.sfx = (cue) => {
  const p = halluPlan(cue);
  const per = Math.max(14, Math.floor((p.c - p.a - 6) / STEPS.length));
  return [{at: 0, kind: 'block', gain: 0.14}, ...STEPS.map((_, i) => ({at: p.a + i * per + Math.round(per * 0.6), kind: 'tick', gain: 0.08})),
    {at: p.b, kind: 'pop', gain: 0.1}, {at: p.c + 6, kind: 'stamp', gain: 0.2}];
};
Hallu.camera = (cue) => {
  const p = halluPlan(cue);
  return [camT(0, 450, 380, 1.03), camT(p.b, 450, 640, 1.03), camT(p.c, 450, 800, 1.05)];
};

/* ---------- 4 reason 2: it only sees the few lines you typed; 81.33 % of doctors: no individualisation ---------- */

const ctxPlan = (cue: Cue) => ({a: cue('a', 104), b: cue('b', 161), c: cue('c', 227)});
const PIECES = [{t: '年龄', x: 30, y: 210}, {t: '病史', x: 330, y: 170}, {t: '用药', x: 30, y: 560}, {t: '完整检查', x: 300, y: 600}];
const Context: Scene = ({f, cue}) => {
  const p = ctxPlan(cue);
  const fade = clamp((f - 60) / 20);
  const go = ease.inOutCubic(clamp((f - p.a) / 24));
  const stat = f >= p.b;
  const pct = Math.min(81.33, 81.33 * ease.outCubic(clamp((f - p.b) / 26)));
  return <Root>
    <Title f={f} k="原因二" lines={[<>它只看到你{cyan('打的几句话')}</>]} size={74} />
    <div style={{position: 'absolute', inset: 0, opacity: 1 - 0.94 * clamp((f - p.b + 6) / 10)}}>
      <Abs x={110} y={290} w={220}><Person /></Abs>
      {PIECES.map((pc, i) => <Abs key={pc.t} x={pc.x} y={pc.y} w={260} style={{opacity: 1 - 0.75 * fade, transform: `translateY(${4 * Math.sin(f / 9 + i)}px)`}}>
        <Pop f={f} at={4 + i * 8}><Chip c={fade > 0.5 ? DIM : STEEL} size={50} style={{borderStyle: fade > 0.5 ? 'dashed' : 'solid'}}>{pc.t}</Chip></Pop>
      </Abs>)}
      {fade > 0.5 && <Abs x={60} y={760} w={420}><Big size={44} c={RED}>这些它都看不到</Big></Abs>}
      {/* the only piece that reaches the AI assistant */}
      <Abs x={140 + 420 * go} y={470 - 40 * Math.sin(Math.PI * go)} w={300}><Pop f={f} at={p.a - 10}><Chip c={B} size={46} fill>你打的几句话</Chip></Pop></Abs>
      <Abs x={680} y={330} w={200} style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
        <Robot s={1.5} blink={f % 46 < 4 ? 1 : 0} /><Big size={44} c={DIM}>AI助手</Big>
      </Abs>
    </div>
    {stat && <Abs y={330} w={W} style={{textAlign: 'center', ...popIn(f, p.b), transformOrigin: '50% 50%'}}>
      <div style={{fontFamily: mono, fontWeight: 800, fontSize: 170, color: A, lineHeight: 1}}>{pct.toFixed(2)}%</div>
      <Big size={60} style={{marginTop: 16}}>的医生认为最大问题</Big>
    </Abs>}
    <Abs y={720} w={W} style={{display: 'flex', justifyContent: 'center'}}><Stamp f={f} at={p.c + 10} size={80} deg={-4} c={A}>缺乏个体化</Stamp></Abs>
  </Root>;
};
Context.sfx = (cue) => {
  const p = ctxPlan(cue);
  return [{at: 0, kind: 'block', gain: 0.14}, ...PIECES.map((_, i) => ({at: 4 + i * 8, kind: 'tick', gain: 0.08})), {at: 60, kind: 'whoosh-short', gain: 0.08},
    {at: p.a, kind: 'whoosh-short', gain: 0.1}, {at: p.a + 24, kind: 'tap', gain: 0.14}, {at: p.b + 26, kind: 'thud', gain: 0.14}, {at: p.c + 10, kind: 'stamp', gain: 0.2}];
};
Context.camera = (cue) => {
  const p = ctxPlan(cue);
  return [camT(0, 300, 480, 1.04), camT(p.a, 600, 480, 1.04), camT(p.b, 450, 520, 1.03)];
};

/* ---------- 5 how to use it: three things it helps with; diagnosis and medication stay with the doctor ---------- */

const guidePlan = (cue: Cue) => ({a: cue('a', 65), b: cue('b', 112), c: cue('c', 156), d: cue('d', 208)});
const Use: Scene = ({f, cue}) => {
  const p = guidePlan(cue);
  const rows = [{at: p.a, t: '整理想说的情况'}, {at: p.b, t: '列出要问医生的问题'}, {at: p.c, t: '看懂报告里的术语'}];
  return <Root>
    <Title f={f} lines={[<>{cyan('AI助手')}该怎么用？</>]} size={80} />
    <Abs y={150} w={W} style={{display: 'flex', flexDirection: 'column', gap: 22}}>
      {rows.map((r) => <Pop key={r.t} f={f} at={r.at}>
        <div style={{display: 'flex', alignItems: 'center', gap: 22, background: PANEL, borderLeft: `10px solid ${B}`, padding: '20px 26px'}}>
          <svg width={64} height={64} viewBox="0 0 64 64"><circle cx={32} cy={32} r={30} fill={B} />
            <path d="M18 33 L28 43 L47 22" fill="none" stroke={BG} strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" /></svg>
          <Big size={60} style={{whiteSpace: 'nowrap'}}>{r.t}</Big>
        </div>
      </Pop>)}
    </Abs>
    <Abs y={690} w={W}>
      <Pop f={f} at={p.d}><div style={{display: 'flex', alignItems: 'center', gap: 22, background: 'rgba(255,171,64,0.12)', border: `5px solid ${A}`, borderRadius: 18,
        padding: '22px 26px'}}>
        <svg width={80} height={90} viewBox="-40 -50 80 90">
          <path d="M-22 -6 V-24 A22 22 0 0 1 22 -24 V-6" fill="none" stroke={A} strokeWidth={9} />
          <rect x={-32} y={-8} width={64} height={48} rx={10} fill={A} /><circle cx={0} cy={12} r={7} fill={BG} />
        </svg>
        <Big size={60} style={{whiteSpace: 'nowrap'}}>诊断、用药 <span style={{color: A}}>→ 交给医生</span></Big>
      </div></Pop>
    </Abs>
  </Root>;
};
Use.sfx = (cue) => {
  const p = guidePlan(cue);
  return [{at: 0, kind: 'tick', gain: 0.1}, {at: p.a, kind: 'pop', gain: 0.12}, {at: p.b, kind: 'pop', gain: 0.12}, {at: p.c, kind: 'pop', gain: 0.12},
    {at: p.d, kind: 'block', gain: 0.16}];
};
Use.camera = (cue) => {
  const p = guidePlan(cue);
  return [camT(0, 450, 360, 1.04), camT(p.c, 450, 560, 1.02), camT(p.d, 450, 760, 1.05)];
};

/* ---------- 6 end: the divider heals into a bridge; the AI assistant points to the doctor ---------- */

const endPlan = (cue: Cue) => ({a: cue('a', 65)});
const End: Scene = ({f, cue}) => {
  const p = endPlan(cue);
  const heal = ease.inOutCubic(clamp((f - 8) / 30));
  const point = clamp((f - p.a + 6) / 14);
  return <Root>
    <Abs y={-14} w={W}>
      <Big size={84} style={{whiteSpace: 'nowrap'}}>{cyan('AI')}帮你问清楚</Big>
      <Big size={84} c={A} style={{whiteSpace: 'nowrap', opacity: clamp((f - p.a + 4) / 8)}}>医生帮你判断</Big>
    </Abs>
    <div style={{position: 'absolute', inset: 0, transform: 'translateY(100px) scale(0.92)', transformOrigin: '450px 430px'}}>
      <Split f={f} bubbleAt={1e9} heal={heal} alarm={false} />
      {/* the left card becomes the doctor's side */}
      <Abs x={0} y={150} w={420} h={560} style={{opacity: heal, borderRadius: 26, border: `5px solid ${A}`, background: '#12263d', display: 'flex',
        flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20}}>
        <Coat s={2.2} c={A} /><Big size={56} c={A}>医生</Big><Big size={44} c={DIM}>判断</Big>
      </Abs>
      <Abs x={480} y={500} w={420} style={{textAlign: 'center', opacity: heal}}><Big size={44} c={B}>问清楚</Big></Abs>
      {point > 0 && <svg width={W} height={1080} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
        <path d={`M640 300 L${640 - 220 * point} 300`} stroke={B} strokeWidth={10} strokeLinecap="round" />
        {point > 0.9 && <path d="M432 280 L410 300 L432 320" fill="none" stroke={B} strokeWidth={10} strokeLinecap="round" strokeLinejoin="round" />}
      </svg>}
    </div>
  </Root>;
};
End.sfx = (cue) => {
  const p = endPlan(cue);
  return [{at: 8, kind: 'whoosh-short', gain: 0.08}, {at: 38, kind: 'tap', gain: 0.14}, {at: p.a, kind: 'chime', gain: 0.12}];
};

/* ---------- cover anchor (880 × 800): the split screen with the alarming bubble ---------- */

const Cover: Scene = () => <div style={{position: 'relative', width: 880, height: 800}}>
  <div style={{position: 'absolute', left: -10, top: -110, width: W, height: 1080}}><Split f={30} bubbleAt={0} /></div>
</div>;

export const aiDoctorScenes: Record<string, Scene> = {
  'adr.hook': Hook,
  'adr.survey': Survey,
  'adr.hallu': Hallu,
  'adr.context': Context,
  'adr.use': Use,
  'adr.end': End,
  'adr.cover': Cover,
};
