import React from 'react';
import {font} from '../theme';
import {clamp, ease, hash, springStep} from '../../fx';
import {Cue, S, Scene, cam, hitOf, phaseOp} from '../paper';
import {A, B, BG, Big, DIM, INK, LINE, Mono, PANEL, PANEL_HI, STEEL, mono} from '../tech';

// php2shell-overtime: PHP2Shell (CVE-2026-109618 / 109619), patched 21 Oct 2026 — why admins worldwide patched overnight (≈ 40 s).
// Script: inputs/php2shell-overtime/script.md (narration tightened for length, see the storyboard); facts from its fact-check table.
// Script rules: no real logos (PHP elephant, EU flag, agencies are plain text), no exploit code, no payloads, no attack steps,
// no mitigation snippets — the only terminal content is `php -v` and version numbers. "凌晨三点" is a stylised clock, not a claim.
// Accents: red = the vulnerability / at risk, amber A = the key fact, cyan B = patched / safe.

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
const Lines: React.FC<{f: number; lines: React.ReactNode[]; size?: number; at?: number[]}> = ({f, lines, size = 84, at = []}) => (
  <Abs y={-14} w={W}>{lines.map((l, i) => <div key={i} style={{fontFamily: font, fontWeight: 900, fontSize: size, lineHeight: 1.15, color: INK, whiteSpace: 'nowrap',
    ...(at[i] !== undefined ? phaseOp(f, at[i]) : {})}}>{l}</div>)}</Abs>
);
const red = (s: string) => <span style={{color: RED}}>{s}</span>;
const amber = (s: string) => <span style={{color: A}}>{s}</span>;
const cyan = (s: string) => <span style={{color: B}}>{s}</span>;
const typed = (text: string, f: number, at: number, cps = 0.8) => text.slice(0, Math.max(0, Math.floor((f - at) * cps)));
/** Camera key that never lifts the title (stage y ≈ −14) under the top edge. */
const camT = (at: number, x: number, y: number, z: number) => cam(at, x, Math.min(y, 540 + (555 / z - 14 - 540) / 0.55), z);

/* ---------- the globe: a wire sphere with servers lighting up red (then green) ---------- */

const DOTS = Array.from({length: 30}, (_, i) => {
  // points on the visible hemisphere, deterministic
  const lon = (hash(i * 3.7) - 0.5) * Math.PI * 0.9, lat = (hash(i * 9.1) - 0.5) * Math.PI * 0.75;
  return {x: Math.sin(lon) * Math.cos(lat), y: -Math.sin(lat), order: hash(i * 5.3)};
});
const Globe: React.FC<{f: number; cx: number; cy: number; r: number; lit: number; healed?: number; spin?: number}> = ({f, cx, cy, r, lit, healed = 0, spin = 0}) => (
  <svg width={W} height={1080} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
    <circle cx={cx} cy={cy} r={r} fill={PANEL} stroke={LINE} strokeWidth={3} />
    {[-60, -30, 0, 30, 60].map((d) => <ellipse key={`m${d}`} cx={cx} cy={cy} rx={Math.abs(r * Math.sin(((d + spin) % 180) * Math.PI / 180)) + 1} ry={r}
      fill="none" stroke={LINE} strokeWidth={2} opacity={0.7} />)}
    {[-0.66, -0.33, 0, 0.33, 0.66].map((k) => <ellipse key={`p${k}`} cx={cx} cy={cy + r * k} rx={r * Math.sqrt(1 - k * k)} ry={r * 0.08 * Math.sqrt(1 - k * k)}
      fill="none" stroke={LINE} strokeWidth={2} opacity={0.7} />)}
    {DOTS.map((d, i) => {
      const on = d.order < lit;
      if (!on) return <circle key={i} cx={cx + d.x * r * 0.92} cy={cy + d.y * r * 0.92} r={5} fill={DIM} opacity={0.5} />;
      const fixed = d.order < healed;
      const c = fixed ? GREEN : RED;
      const p = ((f + i * 7) % 30) / 30;
      return <g key={i}>
        {!fixed && <circle cx={cx + d.x * r * 0.92} cy={cy + d.y * r * 0.92} r={10 + 26 * p} fill="none" stroke={c} strokeWidth={4} opacity={1 - p} />}
        <circle cx={cx + d.x * r * 0.92} cy={cy + d.y * r * 0.92} r={11} fill={c} />
      </g>;
    })}
  </svg>
);
const Clock: React.FC<{text: string; c?: string; size?: number}> = ({text, c = RED, size = 120}) => (
  <div style={{display: 'inline-block', border: `5px solid ${c}`, borderRadius: 18, padding: '0 22px', fontFamily: mono, fontWeight: 800, fontSize: size, color: c,
    background: 'rgba(12,26,44,0.9)', lineHeight: 1.2}}>{text}</div>
);

/* ---------- 1 hook: 3 a.m., the alarm, the world lighting up red ---------- */

const hookPlan = (cue: Cue) => ({a: cue('a', 30), b: cue('b', 66)});
const HookArt: React.FC<{f: number; lit: number}> = ({f, lit}) => {
  const flash = f % 20 < 10 ? 1 : 0.55;
  return <>
    <Globe f={f} cx={450} cy={690} r={330} lit={lit} spin={f * 0.8} />
    <Abs y={250} w={W} style={{display: 'flex', alignItems: 'center', gap: 20}}>
      <div style={{background: RED, color: '#fff', fontFamily: font, fontWeight: 900, fontSize: 52, padding: '6px 22px', opacity: flash, whiteSpace: 'nowrap'}}>⚠ 紧急安全通告</div>
      <div style={{marginLeft: 'auto'}}><Clock text={`03:00:${String(Math.floor(f / 30)).padStart(2, '0')}`} size={64} /></div>
    </Abs>
  </>;
};
const Hook: Scene = ({f, cue}) => {
  const p = hookPlan(cue);
  // a few servers are already red on frame 0; the rest light up through "全球一大批程序员"
  const lit = 0.25 + 0.75 * clamp((f - 4) / (p.b - 4));
  const shake = f < 12 ? 8 * Math.sin(f * 2.6) * (1 - f / 12) : 0;
  return <Root>
    <div style={{position: 'absolute', inset: -60, background: `radial-gradient(ellipse at 50% 60%, rgba(255,90,90,${0.12 + 0.08 * Math.sin(f / 4)}), transparent 70%)`}} />
    <Abs y={-14} w={W}>
      <Big size={96} style={{whiteSpace: 'nowrap'}}>凌晨三点</Big>
      <Big size={96} style={{whiteSpace: 'nowrap'}}>全球程序员{red('被叫醒')}</Big>
    </Abs>
    <div style={{position: 'absolute', inset: 0, transform: `translateX(${shake}px)`}}><HookArt f={f} lit={lit} /></div>
  </Root>;
};
Hook.sfx = (cue) => {
  const p = hookPlan(cue);
  return [{at: 0, kind: 'fs-phone-buzz', gain: 0.3}, {at: 0, kind: 'thud', gain: 0.2}, {at: p.a, kind: 'tick', gain: 0.1}, {at: p.b, kind: 'block', gain: 0.14}];
};
Hook.camera = (cue) => {
  const p = hookPlan(cue);
  return [camT(0, 450, 520, 1.0), camT(p.a, 450, 500, 1.04)];
};

/* ---------- 2 the name, the two CVEs, the score ---------- */

const namePlan = (cue: Cue) => ({a: cue('a', 40), b: cue('b', 64), c: cue('c', 100)});
const Gauge: React.FC<{v: number; c?: string}> = ({v, c = RED}) => {
  const ang = Math.PI * (1 - v / 10);
  const arc = (to: number) => `M ${-260} 0 A 260 260 0 0 1 ${260 * Math.cos(Math.PI * (1 - to / 10))} ${-260 * Math.sin(Math.PI * (1 - to / 10))}`;
  return <svg width={640} height={330} viewBox="-320 -300 640 330">
    <path d={arc(10)} fill="none" stroke={LINE} strokeWidth={34} strokeLinecap="round" />
    {v > 0.05 && <path d={arc(v)} fill="none" stroke={c} strokeWidth={34} strokeLinecap="round" />}
    <line x1={0} y1={0} x2={200 * Math.cos(ang)} y2={-200 * Math.sin(ang)} stroke={INK} strokeWidth={10} strokeLinecap="round" />
    <circle r={18} fill={INK} />
  </svg>;
};
const Name: Scene = ({f, cue}) => {
  const p = namePlan(cue);
  const g = f < 14 && f % 4 < 2 ? 1 : 0;
  const v = 9.2 * ease.outCubic(clamp((f - p.b) / 24));
  return <Root>
    <Abs y={10} w={W} style={{textAlign: 'center'}}>
      <div style={{position: 'relative', display: 'inline-block', fontFamily: mono, fontWeight: 800, fontSize: 150, color: INK, letterSpacing: -2}}>
        {g > 0 && <><span style={{position: 'absolute', left: -10, top: 0, color: RED, opacity: 0.7}}>PHP2Shell</span>
          <span style={{position: 'absolute', left: 10, top: 0, color: B, opacity: 0.7}}>PHP2Shell</span></>}
        <span style={{position: 'relative'}}>PHP2<span style={{color: RED}}>Shell</span></span>
      </div>
    </Abs>
    <Abs y={230} w={W} style={{textAlign: 'center'}}>
      {['CVE-2026-109618', 'CVE-2026-109619'].map((t, i) => <div key={t} style={{fontFamily: mono, fontWeight: 700, fontSize: 52, color: f >= p.a ? A : DIM,
        lineHeight: 1.35, minHeight: 70}}>{typed(t, f, 8 + i * 16, 1.2)}{f >= 8 + i * 16 && typed(t, f, 8 + i * 16, 1.2).length < t.length && <span style={{color: B}}>▍</span>}</div>)}
      {f >= p.a - 2 && <div style={{marginTop: 6}}><Pop f={f} at={p.a} origin="50% 50%"><Chip c={A} size={48}>两个漏洞</Chip></Pop></div>}
    </Abs>
    <Abs y={470} w={W} style={{display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: clamp((f - p.b + 6) / 8)}}>
      <Gauge v={v} />
      <div style={{marginTop: -6, display: 'flex', alignItems: 'baseline', gap: 10}}>
        <span style={{fontFamily: mono, fontWeight: 800, fontSize: 140, color: RED, lineHeight: 1}}>{v.toFixed(1)}</span>
        <span style={{fontFamily: mono, fontWeight: 800, fontSize: 70, color: f >= p.c ? INK : DIM}}>/ 10</span>
      </div>
      <Big size={52} c={DIM} style={{marginTop: 4}}>危险评分</Big>
    </Abs>
  </Root>;
};
Name.sfx = (cue) => {
  const p = namePlan(cue);
  return [{at: 0, kind: 'block', gain: 0.16}, {at: 8, kind: 'tick', gain: 0.08}, {at: 24, kind: 'tick', gain: 0.08}, {at: p.a, kind: 'pop', gain: 0.12},
    {at: p.b + 24, kind: 'stamp', gain: 0.16}, {at: p.c, kind: 'tick', gain: 0.1}];
};
Name.camera = (cue) => {
  const p = namePlan(cue);
  return [camT(0, 450, 300, 1.04), camT(p.b, 450, 520, 1.03)];
};

/* ---------- 3 no login, remote code execution ---------- */

const rcePlan = (cue: Cue) => ({a: cue('a', 40)});
const Rce: Scene = ({f, cue}) => {
  const p = rcePlan(cue);
  const open = springStep(S(f), S(10), {f: 2.2, z: 0.6});
  const hot = clamp((f - p.a) / 10);
  const beam = clamp((f - p.a + 10) / 14);
  return <Root>
    <Lines f={f} lines={[<>{red('不用登录')}</>, <>远程就能在服务器上执行代码</>]} size={76} at={[0, p.a - 6]} />
    {/* the lock: shackle springs open, stamp 无需登录 */}
    <svg width={300} height={340} viewBox="-150 -180 300 340" style={{position: 'absolute', left: 40, top: 300}}>
      <g transform={`translate(${70 * open} ${-30 * open}) rotate(${-25 * open} 60 -60)`}>
        <path d="M-60 -10 V-70 A60 60 0 0 1 60 -70 V-10" fill="none" stroke={STEEL} strokeWidth={22} />
      </g>
      <rect x={-95} y={-20} width={190} height={150} rx={20} fill={STEEL} />
      <circle cx={0} cy={44} r={18} fill={BG} /><rect x={-7} y={50} width={14} height={40} fill={BG} />
    </svg>
    <Abs x={20} y={680} w={360}><Stamp f={f} at={16} size={60}>无需登录</Stamp></Abs>
    {/* the attack goes over the wire to the server */}
    <svg width={W} height={1080} style={{position: 'absolute', left: 0, top: 0}}>
      <line x1={330} y1={470} x2={330 + 200 * beam} y2={470} stroke={RED} strokeWidth={8} strokeDasharray="20 14" strokeDashoffset={-f * 3} />
      {beam > 0.9 && <path d="M520 450 L550 470 L520 490" fill="none" stroke={RED} strokeWidth={8} />}
    </svg>
    <Abs x={570} y={260} w={300} h={560}>
      <div style={{position: 'absolute', inset: 0, border: `6px solid ${hot ? RED : STEEL}`, background: PANEL, borderRadius: 16}} />
      {[0, 1, 2, 3].map((i) => <div key={i} style={{position: 'absolute', left: 26, right: 26, top: 30 + i * 96, height: 72, borderRadius: 10,
        background: hot ? `rgba(255,90,90,${0.25 + 0.2 * Math.sin(f / 3 + i)})` : PANEL_HI, display: 'flex', alignItems: 'center', gap: 12, paddingLeft: 16}}>
        {[0, 1, 2].map((k) => <div key={k} style={{width: 16, height: 16, borderRadius: 8, background: hot ? RED : B, opacity: (f + i * 5 + k * 3) % 18 < 9 ? 1 : 0.4}} />)}
      </div>)}
      <div style={{position: 'absolute', left: 26, right: 26, bottom: 30, height: 110, borderRadius: 10, background: '#05101c', fontFamily: mono, fontWeight: 800,
        fontSize: 64, color: RED, display: 'flex', alignItems: 'center', paddingLeft: 20, opacity: hot}}>{'>_'}<span style={{opacity: f % 16 < 8 ? 1 : 0}}>▍</span></div>
      <Big size={44} c={hot ? RED : DIM} style={{position: 'absolute', top: 580, width: 300, textAlign: 'center'}}>你的服务器</Big>
    </Abs>
  </Root>;
};
Rce.sfx = (cue) => {
  const p = rcePlan(cue);
  return [{at: 10, kind: 'block', gain: 0.14}, {at: 16, kind: 'stamp', gain: 0.18}, {at: p.a - 10, kind: 'whoosh-short', gain: 0.1}, {at: p.a + 4, kind: 'thud', gain: 0.16}];
};

/* ---------- 4 scope: ~75–80 % of websites; the usual ways PHP serves the web ---------- */

const scopePlan = (cue: Cue) => ({a: cue('a', 66), b: cue('b', 104)});
const RUNTIMES = ['PHP-FPM', 'mod_php', 'php-cgi', 'FrankenPHP', 'LiteSpeed'];
const Scope: Scene = ({f, cue}) => {
  const p = scopePlan(cue);
  const n = Math.round(78 * ease.outCubic(clamp((f - 4) / 36)));
  const shrink = springStep(S(f), S(p.a), {f: 1.8, z: 0.8});
  return <Root>
    <Lines f={f} lines={[<>约{amber('75%~80%')}的网站用PHP</>]} size={74} />
    {/* waffle: 100 websites, the PHP share lit */}
    <div style={{position: 'absolute', left: 0, top: 120, transform: `scale(${1 - 0.42 * shrink})`, transformOrigin: '0 0'}}>
      <svg width={520} height={520}>
        {Array.from({length: 100}, (_, i) => {
          const x = (i % 10) * 52, y = Math.floor(i / 10) * 52;
          const lit = i < n, maybe = i >= 75 && i < 80;
          return <rect key={i} x={x} y={y} width={44} height={44} rx={6} fill={lit ? (maybe ? 'none' : A) : PANEL_HI} stroke={lit && maybe ? A : 'none'}
            strokeWidth={4} strokeDasharray={maybe ? '8 6' : undefined} />;
        })}
      </svg>
    </div>
    <Abs x={560 - 230 * shrink} y={150} w={380}>
      <div style={{fontFamily: mono, fontWeight: 800, fontSize: 130, color: A, lineHeight: 1}}>{Math.min(n, 75)}%</div>
      <div style={{fontFamily: mono, fontWeight: 800, fontSize: 64, color: A, opacity: clamp((f - 36) / 8)}}>~80%</div>
      <div style={{marginTop: 20, display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'flex-start', opacity: 1 - shrink}}>
        {['WordPress', 'Drupal', 'Joomla'].map((t, i) => <Pop key={t} f={f} at={20 + i * 8}><Chip c={STEEL} size={44}>{t}</Chip></Pop>)}
      </div>
    </Abs>
    {/* the usual ways PHP runs a site: all in scope */}
    <Abs y={460} w={W} style={{opacity: clamp((f - p.a + 2) / 8)}}>
      <Big size={56} style={{marginBottom: 18}}>跑网站的PHP<span style={{color: RED}}>基本都在范围内</span></Big>
      <div style={{display: 'flex', flexWrap: 'wrap', gap: 16}}>
        {RUNTIMES.map((t, i) => {
          const at = p.a + 6 + i * 7, hit = f >= p.b + i * 3;
          return <Pop key={t} f={f} at={at}><div style={{fontFamily: mono, fontWeight: 800, fontSize: 50, padding: '8px 22px', border: `4px solid ${hit ? RED : STEEL}`,
            color: hit ? BG : INK, background: hit ? RED : PANEL}}>{t}</div></Pop>;
        })}
      </div>
    </Abs>
  </Root>;
};
Scope.sfx = (cue) => {
  const p = scopePlan(cue);
  return [{at: 4, kind: 'whoosh-short', gain: 0.08}, {at: 40, kind: 'tap', gain: 0.14}, ...RUNTIMES.map((_, i) => ({at: p.a + 6 + i * 7, kind: 'tick', gain: 0.08})),
    {at: p.b, kind: 'block', gain: 0.14}];
};

/* ---------- 5 leaked early, emergency patch, agencies pushing to update ---------- */

const leakPlan = (cue: Cue) => ({a: cue('a', 54), b: cue('b', 90)});
const Leak: Scene = ({f, cue}) => {
  const p = leakPlan(cue);
  const node = (y: number, at: number, c: string, date: string, text: string) => <Abs x={0} y={y} w={W}>
    <Pop f={f} at={at}><div style={{display: 'flex', alignItems: 'center', gap: 26}}>
      <div style={{width: 48, height: 48, borderRadius: 24, background: c, flex: 'none', marginLeft: 26}} />
      <div style={{borderLeft: `8px solid ${c}`, background: PANEL, padding: '14px 24px', flex: 1}}>
        <Mono size={44} c={c} w={800}>{date}</Mono>
        <Big size={64}>{text}</Big>
      </div>
    </div></Pop>
  </Abs>;
  const line = clamp((f - 10) / 30);
  return <Root>
    <Lines f={f} lines={[<>细节{red('提前泄露')}</>, <>官方{cyan('连夜发补丁')}</>]} size={80} at={[0, p.a - 6]} />
    <svg width={W} height={1080} style={{position: 'absolute', left: 0, top: 0}}>
      <line x1={50} x2={50} y1={290} y2={290 + 260 * line} stroke={LINE} strokeWidth={6} />
    </svg>
    {node(240, 6, RED, '10月20日', '细节提前泄露')}
    {node(480, p.a, B, '10月21日 21:40（北京时间）', '官方紧急补丁')}
    <Abs y={760} w={W} style={{display: 'flex', flexDirection: 'column', gap: 16}}>
      <Pop f={f} at={p.b}><Chip c={STEEL} size={46}>欧盟多机构联合声明</Chip></Pop>
      <Pop f={f} at={p.b + 12}><Chip c={STEEL} size={46}>英国国家网络安全中心：立即更新</Chip></Pop>
    </Abs>
  </Root>;
};
Leak.sfx = (cue) => {
  const p = leakPlan(cue);
  return [{at: 6, kind: 'thud', gain: 0.14}, {at: p.a, kind: 'tap', gain: 0.16}, {at: p.b, kind: 'pop', gain: 0.12}, {at: p.b + 12, kind: 'pop', gain: 0.12}];
};
Leak.camera = (cue) => {
  const p = leakPlan(cue);
  return [camT(0, 450, 400, 1.04), camT(p.b, 450, 520, 1.02)];
};

/* ---------- 6 upgrade to one of four versions, then restart ---------- */

const patchPlan = (cue: Cue) => ({a: cue('a', 20), b: cue('b', 100), c: cue('c', 140)});
const FIXED = ['8.5.12', '8.4.27', '8.3.36', '8.2.35'];
const Patch: Scene = ({f, cue}) => {
  const p = patchPlan(cue);
  const spin = f >= p.b ? (f - p.b) * 12 : 0;
  const done = f >= p.c + 20;
  return <Root>
    <Lines f={f} lines={[<>升级到这四个版本之一</>]} size={74} />
    {/* drawn terminal: only `php -v` and version numbers */}
    <Abs y={120} w={W} h={560}>
      <div style={{position: 'absolute', inset: 0, background: '#05101c', border: `4px solid ${STEEL}`, borderRadius: 16}} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: 50, background: PANEL_HI, borderRadius: '14px 14px 0 0', display: 'flex', gap: 12,
        alignItems: 'center', paddingLeft: 20}}>{[0, 1, 2].map((i) => <div key={i} style={{width: 18, height: 18, borderRadius: 9, background: LINE}} />)}
        <Mono size={26} style={{marginLeft: 20}}>terminal · 示意</Mono></div>
      <div style={{position: 'absolute', left: 34, top: 76, fontFamily: mono, fontWeight: 800, fontSize: 56, lineHeight: 1.45, color: INK}}>
        <div><span style={{color: B}}>$ </span>{typed('php -v', f, 2, 0.6)}</div>
        {f >= 14 && <div style={{color: RED, opacity: f >= p.a + 30 ? 0.35 : 1}}>PHP 8.x 旧版本 <span style={{fontSize: 44}}>← 有风险</span></div>}
        {f >= p.a && <div style={{color: DIM, fontSize: 44}}>升级到：</div>}
        <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', columnGap: 30}}>
          {FIXED.map((v, i) => <div key={v} style={{color: GREEN, ...(f >= p.a + 8 + i * 10 ? popIn(f, p.a + 8 + i * 10) : {opacity: 0}), transformOrigin: '0 50%'}}>✓ {v}</div>)}
        </div>
      </div>
    </Abs>
    <Abs y={720} w={W} style={{display: 'flex', alignItems: 'center', gap: 28, opacity: clamp((f - p.b + 4) / 8)}}>
      <svg width={130} height={130} viewBox="-65 -65 130 130">
        <g transform={`rotate(${done ? 0 : spin})`}>
          <path d="M 0 -48 A 48 48 0 1 1 -45 16" fill="none" stroke={done ? GREEN : A} strokeWidth={12} strokeLinecap="round" />
          <path d="M -60 6 L -45 22 L -28 4" fill="none" stroke={done ? GREEN : A} strokeWidth={12} strokeLinecap="round" strokeLinejoin="round" />
        </g>
      </svg>
      <div>
        <Big size={72} c={done ? GREEN : A}>升级完记得重启服务</Big>
        <Big size={46} c={DIM} style={{opacity: clamp((f - p.c + 4) / 8)}}>不然可能还在跑旧代码</Big>
      </div>
    </Abs>
  </Root>;
};
Patch.sfx = (cue) => {
  const p = patchPlan(cue);
  return [{at: 2, kind: 'tick', gain: 0.08}, {at: 8, kind: 'tick', gain: 0.08}, ...FIXED.map((_, i) => ({at: p.a + 8 + i * 10, kind: 'tap', gain: 0.12})),
    {at: p.b, kind: 'whoosh-short', gain: 0.08}, {at: p.c + 20, kind: 'chime', gain: 0.1}];
};
Patch.camera = (cue) => {
  const p = patchPlan(cue);
  return [camT(0, 450, 400, 1.04), camT(p.b, 450, 560, 1.03)];
};

/* ---------- 7 8.1 and older: no more official updates ---------- */

const eolPlan = (cue: Cue) => ({a: cue('a', 44), b: cue('b', 72), c: cue('c', 100)});
const Eol: Scene = ({f, cue}) => {
  const p = eolPlan(cue);
  const grey = clamp((f - p.a + 4) / 10);
  return <Root>
    <Lines f={f} lines={[<>{amber('8.1')}及更早：</>, <>官方{red('不再更新')}</>]} size={84} />
    <Abs y={260} w={W} style={{display: 'flex', gap: 24}}>
      {['8.1', '8.0', '7.x'].map((v, i) => <Pop key={v} f={f} at={4 + i * 6} origin="50% 50%">
        <div style={{width: 270, height: 230, borderRadius: 18, background: PANEL, border: `5px solid ${grey > 0.5 ? LINE : A}`, display: 'flex', alignItems: 'center',
          justifyContent: 'center', fontFamily: mono, fontWeight: 800, fontSize: 110, color: grey > 0.5 ? DIM : A, opacity: 1 - 0.45 * grey}}>{v}</div>
      </Pop>)}
    </Abs>
    <Abs y={400} w={W} style={{display: 'flex', justifyContent: 'center'}}><Stamp f={f} at={p.a} size={80} deg={-7}>已停止维护</Stamp></Abs>
    <Abs y={640} w={W}>
      <Pop f={f} at={p.b}><div style={{display: 'flex', alignItems: 'center', gap: 22}}>
        <span style={{fontFamily: font, fontWeight: 900, fontSize: 90, color: B}}>→</span>
        <Chip c={B} size={64} fill>问服务商</Chip>
      </div></Pop>
      <div style={{marginTop: 20, marginLeft: 112}}><Pop f={f} at={p.c}><Chip c={B} size={64}>或升级新版</Chip></Pop></div>
    </Abs>
  </Root>;
};
Eol.sfx = (cue) => {
  const p = eolPlan(cue);
  return [{at: 4, kind: 'tap', gain: 0.1}, {at: 10, kind: 'tap', gain: 0.1}, {at: 16, kind: 'tap', gain: 0.1}, {at: p.a, kind: 'stamp', gain: 0.18},
    {at: p.b, kind: 'pop', gain: 0.12}, {at: p.c, kind: 'pop', gain: 0.12}];
};

/* ---------- 8 end: the globe turns green, 03:00 → 07:00, sunrise ---------- */

const endPlan = (cue: Cue) => ({a: cue('a', 54), b: cue('b', 84)});
const End: Scene = ({f, cue}) => {
  const p = endPlan(cue);
  const healed = clamp((f - 6) / (p.b + 10));
  const hours = 3 + Math.floor(4 * clamp((f - 6) / (p.b + 10)));
  const sun = clamp((f - 10) / 80);
  return <Root>
    <div style={{position: 'absolute', left: -60, right: -60, top: 400, bottom: -200,
      background: `radial-gradient(ellipse at 50% 100%, rgba(255,171,64,${0.35 * sun}), rgba(255,171,64,${0.08 * sun}) 55%, transparent 75%)`}} />
    <Globe f={f} cx={450} cy={660} r={300} lit={1} healed={healed} spin={f * 0.8} />
    <Abs y={-14} w={W}>
      <Big size={96} style={{whiteSpace: 'nowrap'}}>补丁不打</Big>
      <Big size={96} c={A} style={{whiteSpace: 'nowrap'}}>漏洞就一直在</Big>
    </Abs>
    <Abs y={250} w={W} style={{display: 'flex', justifyContent: 'flex-end'}}>
      <Clock text={`0${hours}:00`} c={hours >= 7 ? GREEN : RED} size={72} />
    </Abs>
  </Root>;
};
End.camera = (cue) => {
  const p = endPlan(cue);
  // the globe keeps turning and the camera eases in while the last line holds
  return [camT(0, 450, 560, 1.0), camT(p.b, 450, 540, 1.07)];
};
End.sfx = (cue) => {
  const p = endPlan(cue);
  return [{at: 6, kind: 'whoosh', gain: 0.08}, {at: p.a, kind: 'tick', gain: 0.1}, {at: p.b + 16, kind: 'chime', gain: 0.14}];
};

/* ---------- cover anchor (880 × 800): the red globe at 3 a.m. ---------- */

const Cover: Scene = () => <div style={{position: 'relative', width: 880, height: 800}}>
  <div style={{position: 'absolute', left: -10, top: -260, width: W, height: 1080}}><HookArt f={5} lit={1} /></div>
</div>;

export const php2shellScenes: Record<string, Scene> = {
  'p2s.hook': Hook,
  'p2s.name': Name,
  'p2s.rce': Rce,
  'p2s.scope': Scope,
  'p2s.leak': Leak,
  'p2s.patch': Patch,
  'p2s.eol': Eol,
  'p2s.end': End,
  'p2s.cover': Cover,
};
