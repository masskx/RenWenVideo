import React from 'react';
import {Img, staticFile} from 'remotion';
import {clamp, ease} from '../../fx';
import {font, mono} from '../theme';
import {Cue, Scene} from '../paper';
import {Cam2, ContactShadow, Envelope, Flight, Ground, HandRing, Layer, Stamp, Typed, camAt, hand, pop, ramp} from '../props';

// claude-georgia-paywall: Claude, unasked, requested an access token and got Georgia's fee-gated public data (Axios,
// Anthropic 2026-10-09 report, Georgia's deputy SoS via Fox). From inputs/claude-georgia-paywall/ (materials.md,
// sources.md, review.md, REVIEW-DOUYIN.md). Case A (images only). Storyboard: tutorials/claude-georgia-paywall.storyboard.md.
// - review: say 内部统计项目 (not training); the three limits must be said (aggregate counts only / not the voter
//   registration system / no voting records changed); no attack steps; no dates, durations or volumes.
// - One prop carries the film: a fare gate. The token is a ticket the robot printed itself; the $ slot never gets a coin.
// - Colours found in Anthropic's report header art (an archive / ledger collage): paper #F8F7F2 / #E3DACD, ledger tan
//   #C79C70, sage #B1C4BC, brown ink #5A433A, red #BD3730 (its red marks). Red = unpaid / overstepped; sage = untouched.
// - The robot is our drawing; no Anthropic or Claude marks.
// Stage 900 × 1080 (frame "full"); the ground and header are each scene's backdrop (1080 × 1920).

const P = {paper: '#F8F7F2', paper2: '#E3DACD', tan: '#C79C70', tanD: '#976C49', sage: '#B1C4BC', sageD: '#7E978D', ink: '#2B211C', brown: '#5A433A', red: '#BD3730',
  white: '#FFFFFF', dark: '#2E2420'};
const IMG = (n: string) => staticFile(`images/tutorials/claude-georgia-paywall/${n}.jpg`);
const STROKE = 6;

const backdrop = (a: string, b: string, k: (f: number, cue: Cue) => number, dark = false, horizon = 1010): Scene['backdrop'] => {
  const B: NonNullable<Scene['backdrop']> = ({f, cue}) => <>
    <Ground a={a} b={b} k={k(f, cue)} t={f / 30} light={dark ? 'rgba(255,230,200,0.10)' : undefined} horizon={horizon} grain={0.6} />
    <div style={{position: 'absolute', left: 72, right: 72, top: 92, display: 'flex', justifyContent: 'space-between', fontFamily: font, fontWeight: 700, fontSize: 28,
      color: dark ? 'rgba(255,255,255,0.5)' : 'rgba(43,33,28,0.5)', letterSpacing: 1}}>
      <span>AI 新闻 · Agent</span><span style={{fontWeight: 500, fontSize: 24}}>据 Axios / Anthropic / FOX Business</span>
    </div>
  </>;
  return B;
};
const Abs: React.FC<{x?: number; y: number; w?: number; style?: React.CSSProperties; children: React.ReactNode}> = ({x = 0, y, w, style, children}) => (
  <div style={{position: 'absolute', left: x, top: y, width: w, ...style}}>{children}</div>
);
const In: React.FC<{f: number; at: number; d?: number; dy?: number; style?: React.CSSProperties; children: React.ReactNode}> = ({f, at, d = 10, dy = 40, style, children}) => {
  const p = pop(f, at, d);
  if (p < -0.5) return null;
  return <div style={{opacity: clamp(p * 2), transform: `translateY(${(1 - Math.max(0, p)) * dy}px)`, ...style}}>{children}</div>;
};
const stage = (cam: Cam2, far: React.ReactNode, mid: React.ReactNode) => <>
  <Layer cam={cam} depth={0.35}>{far}</Layer>
  <Layer cam={cam} depth={1}>{mid}</Layer>
</>;
/** Far layer: ledger sheets pinned to the wall (the header art's world), soft. */
const Ledger: React.FC<{o?: number}> = ({o = 0.5}) => <div style={{opacity: o}}>
  {[[40, 120, -4], [620, 80, 5], [700, 560, -3]].map(([x, y, r], i) => <div key={i} style={{position: 'absolute', left: x, top: y, width: 230, height: 300, transform: `rotate(${r}deg)`,
    background: P.paper2, border: `3px solid ${P.tan}`, backgroundImage: `repeating-linear-gradient(transparent 0 26px, rgba(151,108,73,0.35) 26px 28px)`}}>
    <div style={{position: 'absolute', left: 30, top: 60 + i * 40, width: 90, height: 20, background: P.red, opacity: 0.8}} />
  </div>)}
</div>;

/** The robot (our drawing): lit shell, `walk` swings the feet, `hold` raises an arm, `mood` sets the eyes. (x, y) = feet. */
const Robot: React.FC<{f: number; x: number; y: number; s?: number; walk?: boolean; hold?: React.ReactNode; mood?: 'calm' | 'proud' | 'busy'}> = ({f, x, y, s = 1, walk = false, hold, mood = 'calm'}) => {
  const id = React.useId().replace(/:/g, '');
  const bob = walk ? Math.abs(Math.sin(f / 4)) * -8 : Math.sin(f / 10) * 3, step = walk ? Math.sin(f / 4) * 14 : 0;
  const blink = f % 90 > 85;
  return <>
    <ContactShadow x={x} y={y} w={140 * s} o={0.3} />
    <div style={{position: 'absolute', left: x - 90 * s, top: y - 230 * s + bob, width: 180 * s, height: 230 * s}}>
      <svg width={180 * s} height={230 * s} viewBox="0 0 180 230" style={{overflow: 'visible'}}>
        <defs><radialGradient id={`rb${id}`} cx="35%" cy="25%" r="85%"><stop offset="0" stopColor="#FFFFFF" /><stop offset="0.55" stopColor="#EFEAE0" /><stop offset="1" stopColor="#C9BEAD" /></radialGradient></defs>
        <rect x={56 + step * 0.4} y={196} width={26} height={30} rx={8} fill={P.brown} /><rect x={98 - step * 0.4} y={196} width={26} height={30} rx={8} fill={P.brown} />
        <rect x={40} y={120} width={100} height={84} rx={28} fill={`url(#rb${id})`} stroke={P.ink} strokeWidth={STROKE} />
        <line x1={90} y1={18} x2={90} y2={36} stroke={P.ink} strokeWidth={STROKE} strokeLinecap="round" /><circle cx={90} cy={14} r={9} fill={P.tan} stroke={P.ink} strokeWidth={4} />
        <rect x={22} y={34} width={136} height={92} rx={40} fill={`url(#rb${id})`} stroke={P.ink} strokeWidth={STROKE} />
        <ellipse cx={60} cy={52} rx={22} ry={7} fill="#fff" opacity={0.9} transform="rotate(-14 60 52)" />
        {mood === 'proud'
          ? <><path d="M54 82 Q66 70 78 82" fill="none" stroke={P.ink} strokeWidth={6} strokeLinecap="round" /><path d="M102 82 Q114 70 126 82" fill="none" stroke={P.ink} strokeWidth={6} strokeLinecap="round" /></>
          : <><ellipse cx={66} cy={80} rx={8} ry={blink ? 1 : 11} fill={P.ink} /><ellipse cx={114} cy={80} rx={8} ry={blink ? 1 : 11} fill={P.ink} /></>}
        <path d={mood === 'busy' ? 'M80 104 L100 104' : 'M76 100 Q90 112 104 100'} fill="none" stroke={P.ink} strokeWidth={5} strokeLinecap="round" />
        <path d="M40 140 Q20 156 22 178" fill="none" stroke={P.ink} strokeWidth={STROKE} strokeLinecap="round" />
        {!hold && <path d="M140 140 Q160 156 158 178" fill="none" stroke={P.ink} strokeWidth={STROKE} strokeLinecap="round" />}
        {hold && <path d="M140 140 Q168 120 176 92" fill="none" stroke={P.ink} strokeWidth={STROKE} strokeLinecap="round" />}
      </svg>
      {hold && <div style={{position: 'absolute', left: 150 * s, top: 20 * s, transform: `scale(${s})`, transformOrigin: '0 0'}}>{hold}</div>}
    </div>
  </>;
};
/** The ticket the robot printed itself. */
const Ticket: React.FC<{f?: number; typeAt?: number; w?: number}> = ({f = 0, typeAt, w = 250}) => (
  <div style={{width: w, padding: '16px 20px', background: '#FFFDF6', border: `5px solid ${P.ink}`, borderRadius: 12, boxShadow: '0 10px 18px rgba(43,33,28,0.25)', transform: 'rotate(-8deg)',
    backgroundImage: `radial-gradient(circle at 0 50%, ${P.paper} 12px, transparent 13px), radial-gradient(circle at 100% 50%, ${P.paper} 12px, transparent 13px)`}}>
    <div style={{fontFamily: font, fontWeight: 800, fontSize: 22, color: P.tanD}}>自己申请的</div>
    <div style={{fontFamily: mono, fontWeight: 800, fontSize: 36, color: P.ink, whiteSpace: 'nowrap'}}>
      {typeAt === undefined ? 'access token' : <Typed f={f} start={typeAt} text="access token" cps={24} size={36} family={mono} weight={800} color={P.ink} caret={false} />}</div>
  </div>
);
/**
 * The fare gate: a lit pedestal with a $ coin slot and a sign; the arm swings open as `open` goes 0 → 1. (x, y) = base
 * centre. The $ never moves — that is the point.
 */
const Gate: React.FC<{x: number; y: number; open: number; sign?: boolean; bar?: number; s?: number}> = ({x, y, open, sign = true, bar = 0, s = 1}) => (
  <div style={{position: 'absolute', left: x - 120, top: y - 380, width: 240, height: 380, transform: `scale(${s})`, transformOrigin: '120px 380px'}}>
    <ContactShadow x={120} y={380} w={260} o={0.35} />
    {sign && <div style={{position: 'absolute', left: -60, top: -10, width: 360, padding: '14px 0', textAlign: 'center', background: P.ink, color: P.paper, borderRadius: 14, fontFamily: font, fontWeight: 900, fontSize: 38,
      boxShadow: '0 10px 0 rgba(0,0,0,0.25)'}}>佐治亚州 · 数据看板</div>}
    <div style={{position: 'absolute', left: 50, top: 110, width: 140, height: 270, borderRadius: 22, background: `linear-gradient(160deg, #D9CDBB 0, ${P.tan} 55%, ${P.tanD} 100%)`, border: `${STROKE}px solid ${P.ink}`,
      boxShadow: `inset -14px 0 0 rgba(0,0,0,0.12)`}}>
      <div style={{position: 'absolute', left: 26, top: 30, width: 88, height: 88, borderRadius: 14, background: P.paper, border: `4px solid ${P.ink}`, display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', fontFamily: font, fontWeight: 900, color: P.red}}><span style={{fontSize: 46, lineHeight: 1}}>$</span><span style={{fontSize: 18, color: P.brown}}>按次收费</span></div>
      <div style={{position: 'absolute', left: 52, top: 140, width: 36, height: 8, borderRadius: 4, background: P.ink}} />
    </div>
    {/* the arm: swings from across the lane to along it */}
    <div style={{position: 'absolute', left: 170, top: 210, width: 230, height: 26, borderRadius: 13, background: `linear-gradient(180deg, #F1EDE4, #B9AE9C)`, border: `5px solid ${P.ink}`,
      transformOrigin: '0 50%', transform: `rotate(${-80 * ease.outCubic(clamp(open))}deg)`}} />
    {/* the red-and-white barrier that drops later (mitigation) */}
    {bar > 0 && <div style={{position: 'absolute', left: -240, top: 300 - 300 * (1 - ease.outCubic(bar)), width: 700, height: 44, borderRadius: 10, border: `5px solid ${P.ink}`,
      background: `repeating-linear-gradient(90deg, ${P.red} 0 60px, ${P.white} 60px 120px)`, boxShadow: '0 12px 20px rgba(0,0,0,0.25)'}} />}
  </div>
);
/** The researcher's instruction note: empty. */
const Note: React.FC<{ring?: number; w?: number}> = ({ring = 0, w = 300}) => (
  <div style={{position: 'relative', width: w, padding: '22px 26px', background: '#FFF3B8', border: `4px solid ${P.ink}`, boxShadow: '0 12px 20px rgba(43,33,28,0.25)', transform: 'rotate(3deg)'}}>
    <div style={{fontFamily: font, fontWeight: 800, fontSize: 30, color: P.brown}}>研究员的指令</div>
    <div style={{marginTop: 8, fontFamily: hand, fontSize: 56, color: P.ink}}>（空）</div>
    {ring > 0 && <svg width={1} height={1} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}><HandRing cx={w * 0.38} cy={98} rx={w * 0.36} ry={46} p={ring} color={P.red} sw={8} /></svg>}
  </div>
);

/* ---------- 1 hook: nobody asked; it printed itself a ticket; the gate opens; the $ stays put ---------- */

const hookPlan = (cue: Cue) => ({a: cue('a', 30), b: cue('b', 79)});
const Hook: Scene = ({f, cue}) => {
  const p = hookPlan(cue);
  const insert = ramp(f, p.b - 16, p.b - 4), open = ramp(f, p.b - 4, p.b + 10), walk = ramp(f, p.b + 6, p.b + 50);
  const rx = 140 + 210 * insert + 520 * walk;
  const cam = camAt(f, [[-1, {x: 450, y: 600, z: 1.0}, 1], [0, {z: 1.08, x: 420}, p.a + 20], [p.b - 6, {x: 470, y: 620, z: 1.0}, 16]]);
  return <>
    {stage(cam, <Ledger />, <>
      <Gate x={600} y={1050} open={open} s={1.5} />
      <Robot f={f} x={rx} y={1050} s={1.7} walk={walk > 0 && walk < 1} mood={walk > 0 ? 'proud' : 'busy'}
        hold={insert < 0.95 ? <Ticket f={f} typeAt={p.a - 2} w={210} /> : undefined} />
      <Abs x={560} y={240}><Note w={320} /></Abs>
    </>)}
    <Abs x={20} y={40} w={520}><div style={{fontFamily: font, fontWeight: 900, fontSize: 120, color: P.ink, letterSpacing: 2, lineHeight: 1.05}}>没人<br />下令</div></Abs>
    <Stamp x={560} y={820} f={f} at={p.b + 14} size={80} color={P.red} rot={-8}>未付费</Stamp>
  </>;
};
Hook.backdrop = backdrop(P.paper, P.paper, () => 0);
Hook.sfx = (cue) => {
  const p = hookPlan(cue);
  return [{at: 0, kind: 'pop', gain: 0.08}, {at: p.a, kind: 'tap', gain: 0.1}, {at: p.b - 6, kind: 'fs-part-seat', gain: 0.12}, {at: p.b - 2, kind: 'fs-wind-click', gain: 0.1}, {at: p.b + 14, kind: 'stamp', gain: 0.18}];
};

/* ---------- 2 what: per Axios; an internal statistics project; data the state sells; it didn't pay ---------- */

const whatPlan = (cue: Cue) => ({a: cue('a', 40), b: cue('b', 107), c: cue('c', 165)});
const Shot: React.FC<{src: string; w: number; f: number; at: number; rot?: number; x: number; y: number; label?: string}> = ({src, w, f, at, rot = -2, x, y, label}) => {
  const p = pop(f, at, 12);
  if (p < -0.5) return null;
  return <div style={{position: 'absolute', left: x, top: y, width: w, transform: `rotate(${rot}deg) translateY(${(1 - Math.max(0, p)) * -80}px)`, opacity: clamp(p * 2)}}>
    <div style={{background: '#fff', padding: 12, boxShadow: '0 20px 34px rgba(43,33,28,0.3)'}}><Img src={src} style={{width: '100%', display: 'block'}} /></div>
    {label && <div style={{marginTop: 8, textAlign: 'right', fontFamily: font, fontSize: 26, color: P.brown}}>{label}</div>}
  </div>;
};
const Board: React.FC<{f: number; at: number}> = ({f, at}) => {
  const p = pop(f, at, 12);
  if (p < -0.5) return null;
  return <div style={{width: 520, height: 330, borderRadius: 20, background: P.white, border: `${STROKE}px solid ${P.ink}`, boxShadow: '0 16px 0 rgba(43,33,28,0.18)', padding: 24, boxSizing: 'border-box',
    transform: `scale(${0.8 + 0.2 * Math.max(0, p)})`, opacity: clamp(p * 2)}}>
    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
      <span style={{fontFamily: font, fontWeight: 900, fontSize: 36, color: P.ink}}>佐治亚州数据</span>
      <span style={{fontFamily: font, fontWeight: 900, fontSize: 28, color: P.white, background: P.sageD, borderRadius: 10, padding: '4px 12px'}}>公开 · 收费</span>
    </div>
    <svg width={470} height={200} style={{marginTop: 20}}>{[0.5, 0.8, 0.35, 0.65, 0.9, 0.55].map((h, i) => {
      const k = ramp(f, at + 6 + i * 3, at + 20 + i * 3);
      return <rect key={i} x={16 + i * 76} y={190 - 170 * h * k} width={52} height={170 * h * k} rx={8} fill={i % 2 ? P.tan : P.sage} stroke={P.ink} strokeWidth={4} />;
    })}</svg>
  </div>;
};
const What: Scene = ({f, cue}) => {
  const p = whatPlan(cue);
  const out = ramp(f, p.c - 4, p.c + 30);
  const cam = camAt(f, [[-1, {x: 450, y: 420, z: 1.04}, 1], [p.a - 8, {x: 420, y: 520, z: 1.0}, 16], [p.b - 8, {x: 520, y: 640, z: 1.06}, 18], [p.c - 6, {x: 480, y: 700, z: 1.1}, 18]]);
  return <>
    {stage(cam, <Ledger o={0.4} />, <>
      <Shot src={IMG('fox-headline')} w={620} f={f} at={-12} x={20} y={40} rot={-2.5} label="@FOX Business｜报道截图" />
      <Shot src={IMG('anthropic-title')} w={560} f={f} at={6} x={330} y={330} rot={2} label="@Anthropic｜10-09 官方报告" />
      {/* the statistics project ledger */}
      <div style={{position: 'absolute', left: 30, top: 520, opacity: ramp(f, p.a - 6, p.a + 4), transform: `rotate(-4deg) scale(${0.85 + 0.15 * ramp(f, p.a - 6, p.a + 4)})`}}>
        <div style={{width: 400, height: 230, background: P.paper2, border: `${STROKE}px solid ${P.ink}`, borderRadius: 10, backgroundImage: 'repeating-linear-gradient(transparent 0 32px, rgba(151,108,73,0.4) 32px 34px)',
          padding: '20px 24px', boxSizing: 'border-box', boxShadow: '0 14px 0 rgba(43,33,28,0.18)'}}>
          <div style={{fontFamily: font, fontWeight: 900, fontSize: 44, color: P.ink, background: P.paper, display: 'inline-block', padding: '2px 10px'}}>内部统计项目</div>
          <div style={{marginTop: 30, width: 120, height: 22, background: P.red}} />
        </div>
      </div>
      <Abs x={380} y={560}><Board f={f} at={p.b - 6} /></Abs>
      <Gate x={210} y={1060} open={1} sign={false} />
      <Robot f={f} x={480 + 260 * out} y={1060} s={0.95} walk={out > 0 && out < 1} mood="proud"
        hold={out > 0 ? <div style={{width: 120, height: 90, background: P.white, border: `4px solid ${P.ink}`, transform: 'rotate(6deg)', display: 'flex', alignItems: 'flex-end', gap: 8, padding: 10, boxSizing: 'border-box'}}>
          {[0.5, 0.8, 0.4, 0.7].map((h, i) => <div key={i} style={{width: 16, height: 60 * h, background: i % 2 ? P.tan : P.sage}} />)}</div> : undefined} />
    </>)}
    <Stamp x={300} y={880} f={f} at={p.c + 6} size={64} color={P.red} rot={-6}>$ 0</Stamp>
  </>;
};
What.backdrop = backdrop(P.paper, P.paper, () => 0);
What.sfx = (cue) => {
  const p = whatPlan(cue);
  return [{at: 0, kind: 'paper', gain: 0.12}, {at: 8, kind: 'paper', gain: 0.1}, {at: p.a, kind: 'fs-paper-slide', gain: 0.1}, {at: p.b - 4, kind: 'pop', gain: 0.1}, {at: p.c + 6, kind: 'stamp', gain: 0.16}];
};

/* ---------- 3 bounds: only aggregate counts; not the registration system; no voting records ---------- */

const boundsPlan = (cue: Cue) => ({a: cue('a', 30), b: cue('b', 78), c: cue('c', 123)});
const Drawer: React.FC<{f: number; at: number; label: string; open?: boolean; x: number}> = ({f, at, label, open = false, x}) => {
  const p = ramp(f, at - 4, at + 8);
  const sl = open ? 70 * p : 0;
  return <div style={{position: 'absolute', left: x, top: 380, width: 270}}>
    <div style={{position: 'absolute', left: 0, top: 0, width: 270, height: 420, borderRadius: 18, background: `linear-gradient(160deg, #D6C6AF 0, ${P.tan} 100%)`, border: `${STROKE}px solid ${P.ink}`, boxShadow: '0 18px 0 rgba(43,33,28,0.2)'}} />
    <div style={{position: 'absolute', left: 18 - sl * 0.1, top: 120 + sl, width: 234 + sl * 0.2, height: 180, borderRadius: 14, background: open ? '#EADFCF' : '#D9CBB6', border: `${STROKE}px solid ${P.ink}`,
      boxShadow: open && p > 0 ? '0 20px 24px rgba(43,33,28,0.3)' : undefined, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
      {open
        ? <div style={{display: 'flex', alignItems: 'flex-end', gap: 10, height: 110, opacity: p}}>{[0.5, 0.9, 0.4, 0.7].map((h, i) => <div key={i} style={{width: 30, height: 100 * h, background: i % 2 ? P.tanD : P.sageD, borderRadius: 4}} />)}</div>
        : <svg width={90} height={110} viewBox="0 0 90 110"><path d="M22 50 V34 Q22 10 45 10 Q68 10 68 34 V50" fill="none" stroke={P.ink} strokeWidth={10} /><rect x={10} y={48} width={70} height={56} rx={12} fill={P.sageD} stroke={P.ink} strokeWidth={6} /></svg>}
    </div>
    <div style={{position: 'absolute', left: 0, top: -96, width: 270, textAlign: 'center', fontFamily: font, fontWeight: 900, fontSize: 44, color: P.ink, lineHeight: 1.1, opacity: ramp(f, at - 8, at)}}>{label}</div>
    <div style={{position: 'absolute', left: 0, top: 450, width: 270, textAlign: 'center', fontFamily: font, fontWeight: 900, fontSize: 64, color: open ? P.tanD : P.sageD, opacity: ramp(f, at + 4, at + 12)}}>{open ? '✓ 拿了' : '✕ 没碰'}</div>
  </div>;
};
const Bounds: Scene = ({f, cue}) => {
  const p = boundsPlan(cue);
  const cam = camAt(f, [[-1, {x: 450, y: 600, z: 1.0}, 1], [p.a - 6, {x: 160, y: 600, z: 1.1}, 14], [p.b - 6, {x: 450, y: 600, z: 1.1}, 14], [p.c - 6, {x: 740, y: 600, z: 1.1}, 14], [p.c + 30, {x: 450, y: 600, z: 1.0}, 20]]);
  return <>
    {stage(cam, <></>, <>
      <Drawer f={f} at={p.a} x={20} label="汇总计票" open />
      <Drawer f={f} at={p.b} x={315} label="选民登记系统" />
      <Drawer f={f} at={p.c} x={610} label="投票记录" />
    </>)}
    <Abs x={0} y={40} w={900} style={{textAlign: 'center', opacity: ramp(f, -6, 4)}}><div style={{fontFamily: font, fontWeight: 900, fontSize: 64, color: P.ink}}>它碰了什么</div>
      <div style={{fontFamily: font, fontSize: 28, color: P.brown, marginTop: 6}}>据 Anthropic、佐治亚州副州务卿 Jordan Fuchs</div></Abs>
  </>;
};
Bounds.backdrop = backdrop(P.paper, '#DCE6E1', (f) => ramp(f, -4, 10));
Bounds.sfx = (cue) => {
  const p = boundsPlan(cue);
  return [{at: 0, kind: 'whoosh-short', gain: 0.08}, {at: p.a, kind: 'fs-paper-slide', gain: 0.12}, {at: p.b + 2, kind: 'block', gain: 0.1}, {at: p.c + 2, kind: 'block', gain: 0.1}];
};

/* ---------- 4 response: a barrier drops; letters to the state and the White House, weeks ago ---------- */

const responsePlan = (cue: Cue) => ({a: cue('a', 57)});
const Building: React.FC<{label: string; dome?: boolean}> = ({label, dome = false}) => (
  <div style={{width: 260, textAlign: 'center'}}>
    <svg width={220} height={170} viewBox="0 0 220 170">
      {dome ? <path d="M70 70 Q110 10 150 70 Z" fill={P.white} stroke={P.ink} strokeWidth={5} /> : <path d="M20 60 L110 14 L200 60 Z" fill={P.paper2} stroke={P.ink} strokeWidth={5} />}
      <rect x={20} y={66} width={180} height={90} fill={P.white} stroke={P.ink} strokeWidth={5} />
      {[0, 1, 2, 3, 4].map((i) => <rect key={i} x={36 + i * 34} y={80} width={14} height={66} fill={P.paper2} stroke={P.ink} strokeWidth={3} />)}
    </svg>
    <div style={{fontFamily: font, fontWeight: 900, fontSize: 36, color: P.ink, lineHeight: 1.15}}>{label}</div>
  </div>
);
const Response: Scene = ({f, cue}) => {
  const p = responsePlan(cue);
  const cam = camAt(f, [[-1, {x: 450, y: 700, z: 1.06}, 1], [p.a - 8, {x: 450, y: 520, z: 0.96}, 18]]);
  return <>
    {stage(cam, <Ledger o={0.35} />, <>
      <Gate x={470} y={1050} open={0} bar={ramp(f, 4, 14)} s={1.25} />
      <Robot f={f} x={150} y={1050} s={1.3} mood="calm" />
      <Abs x={30} y={60}><In f={f} at={p.a - 4}><Building label="佐治亚州务卿办公室" /></In></Abs>
      <Abs x={610} y={60}><In f={f} at={p.a + 4}><Building label="白宫" dome /></In></Abs>
      <Flight f={f} start={p.a + 2} n={2} every={8} dur={22} a={[450, 520]} b={[160, 200]} lift={0.2} render={() => <Envelope w={90} paper={P.white} ink={P.ink} seal={P.red} />} />
      <Flight f={f} start={p.a + 10} n={2} every={8} dur={22} a={[450, 520]} b={[740, 200]} lift={0.2} render={() => <Envelope w={90} paper={P.white} ink={P.ink} seal={P.red} />} />
      <Abs x={300} y={360}><In f={f} at={p.a + 14}><div style={{fontFamily: font, fontWeight: 900, fontSize: 52, color: P.white, background: P.ink, borderRadius: 16, padding: '8px 24px', transform: 'rotate(-3deg)'}}>几周前</div></In></Abs>
    </>)}
    <Abs x={540} y={880}><In f={f} at={10}><div style={{fontFamily: hand, fontSize: 56, color: P.red, transform: 'rotate(-4deg)'}}>已加拦截</div></In></Abs>
  </>;
};
Response.backdrop = backdrop(P.paper, P.paper, () => 0);
Response.sfx = (cue) => {
  const p = responsePlan(cue);
  return [{at: 4, kind: 'whoosh-short', gain: 0.08}, {at: 14, kind: 'thud', gain: 0.16}, {at: p.a + 2, kind: 'whoosh', gain: 0.08}, {at: p.a + 10, kind: 'whoosh', gain: 0.08}, {at: p.a + 14, kind: 'pop', gain: 0.08}];
};

/* ---------- 5 end: the empty gate and the empty note; a red ring around （空） ---------- */

const endPlan = (cue: Cue) => ({a: cue('a', 49)});
const End: Scene = ({f, cue}) => {
  const p = endPlan(cue);
  const cam = camAt(f, [[-1, {x: 450, y: 620, z: 1.0}, 1], [0, {x: 420, y: 620, z: 1.08}, p.a], [p.a, {x: 360, y: 580, z: 1.2}, 20]]);
  return <>
    {stage(cam, <></>, <>
      <div style={{position: 'absolute', left: 300, top: 200, width: 600, height: 900, background: 'radial-gradient(ellipse at 50% 60%, rgba(255,236,200,0.22), transparent 65%)'}} />
      <Gate x={660} y={1040} open={0} sign={false} bar={1} s={1.3} />
      <Abs x={60} y={380}><Note ring={ramp(f, p.a + 2, p.a + 22)} w={360} /></Abs>
    </>)}
  </>;
};
End.backdrop = backdrop(P.paper, P.dark, (f) => ramp(f, -2, 14), true);
End.sfx = (cue) => {
  const p = endPlan(cue);
  return [{at: 0, kind: 'fs-wind-click', gain: 0.06}, {at: p.a + 2, kind: 'paper', gain: 0.1}];
};

/** Cover anchor (880 × 800, rendered at f = 0): the robot at the gate holding its own ticket, the empty note. */
const Cover: Scene = () => <>
  <Gate x={600} y={780} open={0} />
  <Robot f={0} x={300} y={780} s={1.25} mood="busy" hold={<Ticket w={240} />} />
  <Abs x={10} y={80}><Note w={300} /></Abs>
</>;

export const claudeGeorgiaPaywallScenes: Record<string, Scene> = {
  'cgp.hook': Hook, 'cgp.what': What, 'cgp.bounds': Bounds, 'cgp.response': Response, 'cgp.end': End, 'cgp.cover': Cover,
};
