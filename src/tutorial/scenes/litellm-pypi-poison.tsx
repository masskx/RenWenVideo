import React from 'react';
import {font} from '../theme';
import {clamp, ease, springStep} from '../../fx';
import {Cue, S, Scene, cam, hitOf, phaseOp} from '../paper';
import {A, B, BG, Big, DIM, INK, LINE, Mono, PANEL, PANEL_HI, STEEL, mono} from '../tech';

// litellm-pypi-poison: LiteLLM 1.107.0 on PyPI shipped a credential stealer (21 Oct 2026) — what it takes and a 3-step self-check (≈ 40 s).
// Script: inputs/litellm-pypi-poison/script.md (narration tightened for length, see the storyboard); facts from its SafeDep check.
// Script rules: every key on screen is FAKE and masked (sk-••••3f9a); no malicious code, payload, domains, IPs or hashes — the only
// indicator shown is the file name cook.pth; DeepSeek / 豆包 / Kimi are plain text, no logos. Terminals are drawn, generic.
// Accents: red = poisoned / stolen, amber A = what to look at, cyan B = clean / safe.

const W = 900;
const RED = '#ff5a5a';
const GREEN = '#5ee08a';
const KEYS = [{n: 'DeepSeek Key', tail: '3f9a'}, {n: '豆包 Key', tail: 'b71c'}, {n: 'Kimi Key', tail: '08de'}];

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
  <div style={{display: 'inline-block', background: fill ? c : BG, border: `4px solid ${c}`, color: fill ? BG : c, fontFamily: font, fontWeight: 900, fontSize: size,
    lineHeight: 1.25, padding: '2px 16px', whiteSpace: 'nowrap', ...style}}>{children}</div>
);
const Stamp: React.FC<{f: number; at: number; c?: string; size?: number; deg?: number; children: React.ReactNode}> = ({f, at, c = RED, size = 64, deg = -6, children}) => {
  if (f < at - 6) return null;
  const k = ease.inCubic(clamp((f - at + 6) / 6));
  const sq = hitOf(f, [at], 1);
  return <div style={{display: 'inline-block', transform: `rotate(${deg}deg) scale(${(1.6 - 0.6 * k) * (1 + 0.05 * sq)}, ${(1.6 - 0.6 * k) * (1 - 0.06 * sq)})`,
    opacity: clamp(k * 2), border: `6px solid ${c}`, color: c, background: 'rgba(12,26,44,0.92)', fontFamily: font, fontWeight: 900, fontSize: size,
    padding: '4px 22px', whiteSpace: 'nowrap'}}>{children}</div>;
};
const Title: React.FC<{f: number; k?: string; lines: React.ReactNode[]; size?: number}> = ({f, k, lines, size = 80}) => (
  <Abs y={-10} w={W} style={phaseOp(f, -30)}>
    {k && <div style={{fontFamily: font, fontWeight: 900, fontSize: 48, color: A, marginBottom: 4, whiteSpace: 'nowrap'}}>{k}</div>}
    {lines.map((l, i) => <div key={i} style={{fontFamily: font, fontWeight: 900, fontSize: size, lineHeight: 1.15, color: INK, whiteSpace: 'nowrap'}}>{l}</div>)}
  </Abs>
);
const red = (s: string) => <span style={{color: RED}}>{s}</span>;
const amber = (s: string) => <span style={{color: A}}>{s}</span>;
const typed = (text: string, f: number, at: number, cps = 0.8) => text.slice(0, Math.max(0, Math.floor((f - at) * cps)));
const camT = (at: number, x: number, y: number, z: number) => cam(at, x, Math.min(y, 540 + (555 / z - 14 - 540) / 0.55), z);

/** A drawn, generic terminal window. */
const Term: React.FC<{x?: number; y: number; w?: number; h: number; c?: string; size?: number; children: React.ReactNode}> = ({x = 0, y, w = W, h, c = STEEL, size = 50, children}) => (
  <Abs x={x} y={y} w={w} h={h}>
    <div style={{position: 'absolute', inset: 0, background: '#05101c', border: `4px solid ${c}`, borderRadius: 16, overflow: 'hidden'}}>
      <div style={{height: 50, background: PANEL_HI, display: 'flex', gap: 12, alignItems: 'center', paddingLeft: 20}}>
        {[0, 1, 2].map((i) => <div key={i} style={{width: 18, height: 18, borderRadius: 9, background: LINE}} />)}
        <Mono size={26} style={{marginLeft: 20}}>terminal · 示意</Mono>
      </div>
      <div style={{padding: '18px 30px', fontFamily: mono, fontWeight: 700, fontSize: size, lineHeight: 1.4, color: INK, whiteSpace: 'nowrap'}}>{children}</div>
    </div>
  </Abs>
);
const Cmd: React.FC<{f: number; at: number; text: string; cps?: number}> = ({f, at, text, cps = 0.8}) => {
  const t = typed(text, f, at, cps);
  return <div><span style={{color: B}}>$ </span>{t}{t.length < text.length && <span style={{color: B, opacity: f % 14 < 7 ? 1 : 0.2}}>▍</span>}</div>;
};
/** A key card: the label in clear, the value fake and masked. */
const KeyCard: React.FC<{name: string; tail: string; c?: string; void?: boolean; w?: number}> = ({name, tail, c = A, void: dead, w = 300}) => (
  <div style={{width: w, background: PANEL, border: `4px solid ${dead ? RED : c}`, borderRadius: 14, padding: '12px 18px'}}>
    <div style={{fontFamily: font, fontWeight: 900, fontSize: 38, color: dead ? RED : c, whiteSpace: 'nowrap'}}>{name}</div>
    <div style={{fontFamily: mono, fontWeight: 700, fontSize: 32, color: DIM, whiteSpace: 'nowrap', textDecoration: dead ? 'line-through' : undefined}}>
      sk-<span style={{filter: 'blur(4px)'}}>••••••</span>{tail}</div>
  </div>
);

/* ---------- 1 hook: pip install, then the keys fly off to a red "?" ---------- */

const hookPlan = (cue: Cue) => ({a: cue('a', 36), b: cue('b', 70)});
const LOG = ['Collecting litellm', 'Downloading litellm-1.107.0', 'Installing collected packages', 'Successfully installed'];
const HookArt: React.FC<{f: number; fly: number[]; glow?: number}> = ({f, fly, glow = -1}) => (
  <>
    <Term y={250} h={430} size={44}>
      <div><span style={{color: B}}>$ </span>pip install litellm{f < 9 && <span style={{color: B}}>▍</span>}</div>
      {LOG.map((l, i) => f >= 10 + i * 9 && <div key={l} style={{color: i === 3 ? GREEN : DIM}}>{l}</div>)}
    </Term>
    {KEYS.map((k, i) => {
      const u = fly[i];
      const x0 = i * 305, y0 = 720, x1 = 740, y1 = 270;
      const x = x0 + (x1 - x0) * ease.inCubic(u), y = y0 + (y1 - y0) * u - 160 * Math.sin(Math.PI * u);
      const lift = glow >= 0 && f >= glow + i * 4 && u === 0 ? 1 + 0.08 * Math.abs(Math.sin((f - glow - i * 4) / 5)) : 1;
      return <div key={k.n} style={{position: 'absolute', left: x, top: y - (lift - 1) * 120, transform: `scale(${(1 - 0.6 * u) * lift}) rotate(${-20 * u}deg)`,
        opacity: 1 - clamp((u - 0.85) / 0.15)}}>
        <KeyCard name={k.n} tail={k.tail} w={290} /></div>;
    })}
  </>
);
const Hook: Scene = ({f, cue}) => {
  const p = hookPlan(cue);
  const fly = KEYS.map((_, i) => clamp((f - p.b + 10 - i * 5) / 18));
  const tint = clamp((f - p.b + 4) / 10);
  const q = springStep(S(f), S(p.b + 10), {f: 2.4, z: 0.55});
  return <Root>
    <div style={{position: 'absolute', inset: -60, background: `radial-gradient(ellipse at 70% 30%, rgba(255,90,90,${0.25 * tint}), transparent 70%)`}} />
    <Abs y={-14} w={W}>
      <Big size={92} style={{whiteSpace: 'nowrap'}}>装个AI工具包</Big>
      <Big size={92} c={RED} style={{whiteSpace: 'nowrap'}}>API Key就被偷了</Big>
    </Abs>
    <HookArt f={f} fly={fly} glow={p.a} />
    {f >= p.b + 8 && <Abs x={700} y={230} w={180} style={{textAlign: 'center', transform: `scale(${q})`, opacity: clamp(q * 2)}}>
      <div style={{width: 150, height: 150, borderRadius: 75, background: RED, color: '#fff', fontFamily: font, fontWeight: 900, fontSize: 110, lineHeight: '150px'}}>?</div>
    </Abs>}
  </Root>;
};
Hook.camera = (cue) => {
  const p = hookPlan(cue);
  return [camT(0, 450, 420, 1.0), camT(20, 450, 470, 1.05), camT(p.a, 450, 600, 1.04)];
};
Hook.sfx = (cue) => {
  const p = hookPlan(cue);
  return [{at: 0, kind: 'tick', gain: 0.1}, {at: 9, kind: 'tap', gain: 0.2}, {at: 25, kind: 'tick', gain: 0.08}, {at: p.b - 8, kind: 'whoosh', gain: 0.14},
    {at: p.b + 10, kind: 'thud', gain: 0.16}];
};

/* ---------- 2 LiteLLM 1.107.0 — poisoned release ---------- */

const poisonPlan = (cue: Cue) => ({a: cue('a', 66), b: cue('b', 104)});
const Poison: Scene = ({f, cue}) => {
  const p = poisonPlan(cue);
  const bug = clamp((f - p.b) / 14);
  const lid = springStep(S(f), S(p.b - 8), {f: 2.4, z: 0.7}) * (1 - springStep(S(f), S(p.b + 14), {f: 2.4, z: 0.7}));
  return <Root>
    <Abs y={20} w={W}>
      <div style={{fontFamily: mono, fontWeight: 800, fontSize: 132, color: INK, lineHeight: 1}}>LiteLLM</div>
      <div style={{fontFamily: mono, fontWeight: 800, fontSize: 132, color: f >= p.a ? RED : A, lineHeight: 1.1, ...popIn(f, Math.min(p.a, 20)), transformOrigin: '0 50%'}}>1.107.0</div>
      <Big size={52} c={DIM} style={{marginTop: 14}}>很多人调大模型用的开源库</Big>
    </Abs>
    {/* the release package: a box that opens and gets something dropped in */}
    <svg width={420} height={420} viewBox="-210 -230 420 420" style={{position: 'absolute', left: 30, top: 470}}>
      <rect x={-150} y={-60} width={300} height={220} rx={10} fill={PANEL} stroke={STEEL} strokeWidth={6} />
      <text x={0} y={70} textAnchor="middle" fontFamily={mono} fontWeight={800} fontSize={40} fill={DIM}>.whl</text>
      <g transform={`rotate(${-50 * lid} -150 -60)`}><rect x={-160} y={-90} width={320} height={34} rx={8} fill={STEEL} /></g>
      {/* downloads: small packages keep flowing in (many people install it) */}
      {f < p.b && Array.from({length: 6}, (_, i) => {
        const u = ((f + i * 9) % 54) / 54;
        return <rect key={i} x={170 - 170 * u - 12} y={-210 + 200 * u} width={24} height={24} rx={4} fill={B} opacity={1 - u} />;
      })}
      {f >= p.b - 4 && <g transform={`translate(0 ${-200 + 230 * ease.inCubic(bug)})`} opacity={bug < 1 ? 1 : 0}>
        <ellipse rx={30} ry={38} fill={RED} />
        {[-1, 1].map((s) => [-16, 0, 16].map((y) => <line key={`${s}${y}`} x1={s * 26} y1={y} x2={s * 52} y2={y - 10} stroke={RED} strokeWidth={6} strokeLinecap="round" />))}
      </g>}
      {bug >= 1 && <circle cx={0} cy={20} r={60} fill={RED} opacity={0.25 + 0.15 * Math.sin(f / 3)} />}
    </svg>
    <Abs x={470} y={560} w={430}><Stamp f={f} at={p.b + 12} size={84} deg={-8}>被投毒</Stamp></Abs>
    <Abs x={470} y={760} w={430}><Pop f={f} at={p.b + 22}><Chip c={STEEL} size={40}>10月21日 · 官方仓库已下架</Chip></Pop></Abs>
  </Root>;
};
Poison.camera = (cue) => {
  const p = poisonPlan(cue);
  return [camT(0, 450, 300, 1.05), camT(p.a - 10, 300, 600, 1.06), camT(p.b + 10, 600, 640, 1.05)];
};
Poison.sfx = (cue) => {
  const p = poisonPlan(cue);
  return [{at: 0, kind: 'tap', gain: 0.14}, {at: p.a, kind: 'tick', gain: 0.1}, {at: p.b + 10, kind: 'thud', gain: 0.14}, {at: p.b + 12, kind: 'stamp', gain: 0.18}];
};

/* ---------- 3 it runs whenever any Python starts, imported or not ---------- */

const autoPlan = (cue: Cue) => ({a: cue('a', 30), b: cue('b', 74), c: cue('c', 120)});
const WINS = [{t: '你的脚本', x: 0, y: 690}, {t: 'pip', x: 320, y: 760}, {t: '编辑器插件', x: 600, y: 690}];
const Auto: Scene = ({f, cue}) => {
  const p = autoPlan(cue);
  const slide = ease.inOutCubic(clamp((f - 6) / 22));
  return <Root>
    <Abs y={-14} w={W}>
      <div style={{fontFamily: font, fontWeight: 900, fontSize: 84, lineHeight: 1.15, color: INK, whiteSpace: 'nowrap', ...phaseOp(f, p.a - 6)}}>没用它也{red('中招')}</div>
      <div style={{fontFamily: font, fontWeight: 900, fontSize: 84, lineHeight: 1.15, color: INK, whiteSpace: 'nowrap', ...phaseOp(f, p.b - 6)}}>Python一启动就运行</div>
    </Abs>
    {/* the Python box; the extra file slides in on "装上" */}
    <Abs x={250} y={260} w={400} h={300}>
      <div style={{position: 'absolute', inset: 0, border: `6px solid ${f >= p.b ? RED : STEEL}`, borderRadius: 20, background: PANEL}} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 30, textAlign: 'center', fontFamily: mono, fontWeight: 800, fontSize: 72, color: INK}}>Python</div>
      <div style={{position: 'absolute', left: 120 - 360 * (1 - slide), top: 130, display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: clamp(slide * 3)}}>
        <svg width={90} height={110} viewBox="0 0 90 110"><path d="M6 6 H60 L84 30 V104 H6 Z" fill={f >= p.b ? RED : DIM} /><path d="M60 6 V30 H84" fill="none" stroke={BG} strokeWidth={4} /></svg>
      </div>
    </Abs>
    <Abs x={-10} y={300} w={240}><div style={{opacity: 1 - clamp(slide * 2 - 1)}}><Chip c={STEEL} size={44}>装上 →</Chip></div></Abs>
    <Abs x={250} y={580} w={400} style={{textAlign: 'center', opacity: clamp(slide * 2 - 1)}}><Big size={44} c={DIM}>混进来的文件</Big></Abs>
    {WINS.map((w, i) => {
      const at = p.b + 4 + i * 8, hot = f >= at + 4;
      return <Abs key={w.t} x={w.x} y={w.y} w={290}><Pop f={f} at={at} origin="50% 50%">
        <div style={{border: `4px solid ${hot ? RED : STEEL}`, borderRadius: 12, background: hot ? 'rgba(255,90,90,0.18)' : PANEL, overflow: 'hidden'}}>
          <div style={{height: 30, background: hot ? RED : PANEL_HI}} />
          <div style={{padding: '14px 16px', fontFamily: font, fontWeight: 900, fontSize: 44, color: hot ? RED : INK, whiteSpace: 'nowrap'}}>{w.t}</div>
        </div>
      </Pop></Abs>;
    })}
    {f >= p.c && <Abs y={940} w={W} style={{textAlign: 'center'}}><Pop f={f} at={p.c} origin="50% 50%"><Chip c={RED} size={52} fill>自动运行</Chip></Pop></Abs>}
  </Root>;
};
Auto.sfx = (cue) => {
  const p = autoPlan(cue);
  return [{at: 6, kind: 'whoosh-short', gain: 0.08}, {at: 28, kind: 'tap', gain: 0.14}, ...WINS.map((_, i) => ({at: p.b + 8 + i * 8, kind: 'pop', gain: 0.12})),
    {at: p.c, kind: 'block', gain: 0.14}];
};
Auto.camera = (cue) => {
  const p = autoPlan(cue);
  return [camT(0, 450, 420, 1.04), camT(p.b, 450, 560, 1.03)];
};

/* ---------- 4 what it takes: SSH keys, cloud credentials, browser passwords, LLM keys ---------- */

const stealPlan = (cue: Cue) => ({a: cue('a', 30), b: cue('b', 50), c: cue('c', 84), d: cue('d', 120)});
const Icon: React.FC<{k: string; c: string}> = ({k, c}) => (
  <svg width={130} height={130} viewBox="-65 -65 130 130">
    {k === 'key' && <g fill="none" stroke={c} strokeWidth={10} strokeLinecap="round"><circle cx={-22} cy={0} r={24} /><path d="M2 0 H50 M34 0 V18 M48 0 V14" /></g>}
    {k === 'cloud' && <path d="M-44 26 A26 26 0 0 1 -38 -22 A34 34 0 0 1 24 -30 A28 28 0 0 1 44 26 Z" fill="none" stroke={c} strokeWidth={10} strokeLinejoin="round" />}
    {k === 'browser' && <g fill="none" stroke={c} strokeWidth={10}><rect x={-50} y={-40} width={100} height={80} rx={10} /><path d="M-50 -16 H50" />
      <rect x={-14} y={0} width={28} height={22} rx={4} fill={c} /><path d="M-8 0 V-6 A8 8 0 0 1 8 -6 V0" /></g>}
    {k === 'chip' && <g fill="none" stroke={c} strokeWidth={10}><rect x={-34} y={-34} width={68} height={68} rx={8} />
      {[-18, 0, 18].map((v) => <path key={v} d={`M${v} -34 V-52 M${v} 34 V52 M-34 ${v} H-52 M34 ${v} H52`} />)}
      <text x={0} y={12} textAnchor="middle" fontFamily={mono} fontWeight={800} fontSize={30} fill={c} stroke="none">AI</text></g>}
  </svg>
);
const LOOT = [{k: 'key', t: 'SSH密钥'}, {k: 'cloud', t: '云账号'}, {k: 'browser', t: '浏览器密码'}, {k: 'chip', t: '大模型Key'}];
const Steal: Scene = ({f, cue}) => {
  const p = stealPlan(cue);
  const ats = [6, p.a, p.b, p.c];
  const out = clamp((f - p.d) / 20);
  return <Root>
    <Abs y={-14} w={W}>
      <Big size={74} style={{whiteSpace: 'nowrap'}}>SSH密钥 · 云账号</Big>
      <Big size={74} style={{whiteSpace: 'nowrap'}}>浏览器密码 · {amber('大模型Key')}</Big>
    </Abs>
    {LOOT.map((l, i) => {
      const at = ats[i], on = f >= at;
      const x = (i % 2) * 450, y = 250 + Math.floor(i / 2) * 330;
      const u = clamp(out * 1.4 - i * 0.12);
      return <Abs key={l.t} x={x + 20 + 380 * ease.inCubic(u)} y={y - 200 * ease.inCubic(u)} w={410}
        style={{opacity: 1 - clamp((u - 0.7) / 0.3), transform: `scale(${1 - 0.5 * u})`}}>
        <div style={{height: 290, border: `5px solid ${on ? RED : LINE}`, borderRadius: 18, background: on ? 'rgba(255,90,90,0.12)' : PANEL, display: 'flex',
          flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, ...(on ? popIn(f, at) : {})}}>
          <Icon k={l.k} c={on ? RED : DIM} />
          <Big size={54} c={on ? INK : DIM}>{l.t}</Big>
        </div>
      </Abs>;
    })}
    {/* the stealer rummages: a red scan line sweeps the grid until it leaves */}
    {f < p.d && <Abs x={0} y={250 + 610 * (0.5 - 0.5 * Math.cos(f / 14))} w={W} h={8} style={{background: RED, opacity: 0.7, boxShadow: `0 0 24px ${RED}`}} />}
    {f >= p.d && <Abs y={940} w={W} style={{display: 'flex', justifyContent: 'center'}}><Stamp f={f} at={p.d + 4} size={68} deg={-4}>偷偷传走 →</Stamp></Abs>}
  </Root>;
};
Steal.camera = (cue) => {
  const p = stealPlan(cue);
  return [camT(0, 450, 420, 1.0), camT(p.a, 230, 560, 1.05), camT(p.c, 670, 700, 1.05), camT(p.d, 450, 520, 1.0)];
};
Steal.sfx = (cue) => {
  const p = stealPlan(cue);
  return [{at: 6, kind: 'tap', gain: 0.14}, {at: p.a, kind: 'tap', gain: 0.14}, {at: p.b, kind: 'tap', gain: 0.14}, {at: p.c, kind: 'tap', gain: 0.14},
    {at: p.d, kind: 'whoosh', gain: 0.14}, {at: p.d + 4, kind: 'stamp', gain: 0.16}];
};

/* ---------- 5 step 1: pip show litellm, check the version ---------- */

const s1Plan = (cue: Cue) => ({a: cue('a', 34), b: cue('b', 110)});
const Step1: Scene = ({f, cue}) => {
  const p = s1Plan(cue);
  const out = p.a + 30;
  return <Root>
    <Title f={f} k="第一步" lines={[<>{amber('pip show litellm')}</>, <>看版本号</>]} size={80} />
    <Term y={250} h={420} size={52}>
      <Cmd f={f} at={p.a} text="pip show litellm" cps={0.9} />
      {f >= out && <div style={{color: DIM}}>Name: litellm</div>}
      {f >= out + 4 && <div style={{position: 'relative', display: 'inline-block', color: f >= p.b ? RED : INK}}>Version: 1.107.0
        {f >= p.b && <div style={{position: 'absolute', inset: '-6px -14px', border: `5px solid ${RED}`, borderRadius: 8}} />}</div>}
    </Term>
    <Abs y={700} w={W} style={{display: 'flex', flexDirection: 'column', gap: 22}}>
      <Pop f={f} at={p.b + 6}><div style={{display: 'flex', alignItems: 'center', gap: 20}}>
        <Chip c={RED} size={56} fill>1.107.0</Chip><Big size={56} c={RED}>中招版本</Big></div></Pop>
      <Pop f={f} at={p.b + 24}><div style={{display: 'flex', alignItems: 'center', gap: 20}}>
        <Chip c={GREEN} size={56}>1.106.2</Chip><Big size={56} c={GREEN}>✓ 干净</Big></div></Pop>
    </Abs>
  </Root>;
};
Step1.sfx = (cue) => {
  const p = s1Plan(cue);
  return [{at: p.a, kind: 'tick', gain: 0.08}, {at: p.a + 18, kind: 'tap', gain: 0.16}, {at: p.b, kind: 'block', gain: 0.14}, {at: p.b + 24, kind: 'pop', gain: 0.12}];
};
Step1.camera = (cue) => {
  const p = s1Plan(cue);
  return [camT(0, 450, 420, 1.04), camT(p.b, 450, 600, 1.03)];
};

/* ---------- 6 step 2: is cook.pth in site-packages? ---------- */

const s2Plan = (cue: Cue) => ({a: cue('a', 54)});
const TREE = ['litellm/', 'numpy/', 'cook.pth', 'requests/', 'openai/'];
const Step2: Scene = ({f, cue}) => {
  const p = s2Plan(cue);
  const scan = Math.min(TREE.length - 1, Math.floor(clamp((f - p.a + 10) / 30) * 2.99));
  const found = f >= p.a + 12;
  return <Root>
    <Title f={f} k="第二步" lines={[<>site-packages 里</>, <>有没有 {red('cook.pth')}</>]} size={80} />
    <Abs y={280} w={W} h={640}>
      <div style={{position: 'absolute', inset: 0, background: PANEL, border: `4px solid ${STEEL}`, borderRadius: 16}} />
      <div style={{position: 'absolute', left: 36, top: 28, fontFamily: mono, fontWeight: 800, fontSize: 54, lineHeight: 1.55, color: INK}}>
        <div style={{color: A}}>site-packages/</div>
        {TREE.map((t, i) => {
          const bad = t === 'cook.pth';
          const lit = bad && found;
          return <div key={t} style={{position: 'relative', paddingLeft: 40, color: lit ? (f % 12 < 6 ? RED : INK) : !found && i === scan && f >= p.a - 10 ? A : DIM,
            ...(f >= 4 + i * 4 ? {} : {opacity: 0})}}>
            {i < TREE.length - 1 ? '├ ' : '└ '}{t}
            {lit && <span style={{marginLeft: 26, fontFamily: font, fontWeight: 900, fontSize: 50, color: RED}}>← 有它就是中了</span>}
            {lit && <div style={{position: 'absolute', left: 30, right: -20, top: 4, bottom: 4, border: `5px solid ${RED}`, borderRadius: 10}} />}
          </div>;
        })}
      </div>
    </Abs>
  </Root>;
};
Step2.sfx = (cue) => {
  const p = s2Plan(cue);
  return [{at: 4, kind: 'tick', gain: 0.08}, {at: p.a + 12, kind: 'block', gain: 0.16}];
};

/* ---------- 7 step 3: reset every key, uninstall, back to 1.106.2 ---------- */

const s3Plan = (cue: Cue) => ({a: cue('a', 70), b: cue('b', 100)});
const Step3: Scene = ({f, cue}) => {
  const p = s3Plan(cue);
  return <Root>
    <Title f={f} k="第三步" lines={[<>中了：{red('立刻重置所有Key')}</>]} size={78} />
    <Abs y={160} w={W} style={{display: 'flex', flexDirection: 'column', gap: 22}}>
      {KEYS.map((k, i) => {
        const dead = 14 + i * 8, fresh = 40 + i * 8;
        const flip = f < dead ? 0 : f < fresh ? 1 : 2;
        const sx = Math.abs(Math.cos(Math.PI * clamp((f - (flip === 2 ? fresh : dead) + 3) / 6)));
        return <div key={k.n} style={{display: 'flex', alignItems: 'center', gap: 24}}>
          <div style={{transform: `scaleY(${f >= dead - 3 ? Math.max(0.1, sx) : 1})`}}>
            <KeyCard name={k.n} tail={flip === 2 ? ['c204', '9e5d', 'a6f1'][i] : k.tail} c={flip === 2 ? GREEN : A} void={flip === 1} w={480} />
          </div>
          {flip === 1 && <Chip c={RED} size={48} fill>已作废</Chip>}
          {flip === 2 && <Chip c={GREEN} size={48}>新 Key</Chip>}
        </div>;
      })}
    </Abs>
    <Abs y={760} w={W} style={{display: 'flex', alignItems: 'center', gap: 20}}>
      <Pop f={f} at={p.a}><Chip c={STEEL} size={56}>卸载</Chip></Pop>
      {f >= p.b - 2 && <span style={{fontFamily: font, fontWeight: 900, fontSize: 64, color: DIM}}>→</span>}
      <Pop f={f} at={p.b}><Chip c={GREEN} size={56} fill>换回 1.106.2</Chip></Pop>
    </Abs>
  </Root>;
};
Step3.sfx = (cue) => {
  const p = s3Plan(cue);
  return [{at: 14, kind: 'block', gain: 0.12}, {at: 22, kind: 'block', gain: 0.1}, {at: 30, kind: 'block', gain: 0.1}, {at: 40, kind: 'tap', gain: 0.1},
    {at: 48, kind: 'tap', gain: 0.1}, {at: 56, kind: 'tap', gain: 0.1}, {at: p.a, kind: 'pop', gain: 0.12}, {at: p.b, kind: 'chime', gain: 0.1}];
};

/* ---------- 8 end: the terminal again, keys back, lock shut ---------- */

const endPlan = (cue: Cue) => ({a: cue('a', 50), b: cue('b', 76)});
const End: Scene = ({f, cue}) => {
  const p = endPlan(cue);
  const shut = springStep(S(f), S(p.b), {f: 2.4, z: 0.6});
  return <Root>
    <Abs y={-14} w={W}>
      <Big size={96} style={{whiteSpace: 'nowrap'}}>装之前</Big>
      <Big size={96} c={A} style={{whiteSpace: 'nowrap', opacity: clamp((f - p.a + 4) / 8)}}>多看一眼版本号</Big>
    </Abs>
    <Term y={270} h={300} size={52}>
      <Cmd f={f} at={4} text="pip show litellm" cps={1.2} />
      {f >= 28 && <div style={{color: GREEN}}>Version: 1.106.2 ✓</div>}
    </Term>
    <Abs y={630} w={W} style={{display: 'flex', gap: 10}}>
      {KEYS.map((k, i) => <Pop key={k.n} f={f} at={30 + i * 6}><KeyCard name={k.n} tail={['c204', '9e5d', 'a6f1'][i]} c={GREEN} w={290} /></Pop>)}
    </Abs>
    <svg width={200} height={230} viewBox="-100 -130 200 230" style={{position: 'absolute', left: 350, top: 830, opacity: clamp((f - p.b + 10) / 8)}}>
      <path d={`M-45 ${-10 - 40 * (1 - shut)} V-50 A45 45 0 0 1 45 -50 V${-10 - 40 * (1 - shut)}`} fill="none" stroke={GREEN} strokeWidth={18} />
      <rect x={-70} y={-20} width={140} height={110} rx={16} fill={GREEN} />
      <circle cx={0} cy={28} r={14} fill={BG} /><rect x={-6} y={32} width={12} height={30} fill={BG} />
    </svg>
  </Root>;
};
End.sfx = (cue) => {
  const p = endPlan(cue);
  return [{at: 4, kind: 'tick', gain: 0.08}, {at: 30, kind: 'pop', gain: 0.1}, {at: p.b + 4, kind: 'block', gain: 0.14}, {at: p.b + 10, kind: 'chime', gain: 0.12}];
};

/* ---------- cover anchor (880 × 800): the install and the keys flying off ---------- */

const Cover: Scene = () => <div style={{position: 'relative', width: 880, height: 800}}>
  <div style={{position: 'absolute', left: -10, top: -250, width: W, height: 1080}}>
    <HookArt f={40} fly={[0.55, 0.4, 0.25]} />
    <Abs x={700} y={230} w={180} style={{textAlign: 'center'}}>
      <div style={{width: 150, height: 150, borderRadius: 75, background: RED, color: '#fff', fontFamily: font, fontWeight: 900, fontSize: 110, lineHeight: '150px'}}>?</div>
    </Abs>
  </div>
</div>;

export const litellmPoisonScenes: Record<string, Scene> = {
  'llm.hook': Hook,
  'llm.poison': Poison,
  'llm.autorun': Auto,
  'llm.steal': Steal,
  'llm.step1': Step1,
  'llm.step2': Step2,
  'llm.step3': Step3,
  'llm.end': End,
  'llm.cover': Cover,
};
