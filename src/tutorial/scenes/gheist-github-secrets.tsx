import React from 'react';
import {Img, staticFile} from 'remotion';
import {clamp, ease, hash} from '../../fx';
import {font, mono} from '../theme';
import {Cue, Scene} from '../paper';
import {Annot, Cam2, ContactShadow, Envelope, Flight, Ground, HandRing, Layer, Roll, Stamp, Tag, camAt, pop, ramp} from '../props';

// gheist-github-secrets: Wiz Research's report on Gheist (2026-10-25), from inputs/gheist-github-secrets/ (materials.md,
// sources.md, review.md). Case A (images only): the Wiz and GitHub screenshots become stickers; everything else is drawn.
// Storyboard: tutorials/gheist-github-secrets.storyboard.md.
// - One object carried through: the key ("your secret") — printed into your own log, masked, base32'd past the mask, mailed
//   out through GitHub's own API, then broken and replaced in the three locks; the film ends on a token with an expiry tag.
// - Characters act (经验.md: v3's robot only floated): Gheist (German for ghost) is drawn here as a little ghost in the Wiz
//   cover's pink — it peeks, plants, feeds the converter, catches the envelope, rubs out the run, slides past the gate.
// - Colours found in the material: Wiz cover #1D1C25 / pink #F07CF0, #FAC8FB; GitHub changelog #010409 / blue #2354D7,
//   #0B1B46; GitHub docs white #FAFAFA for "what you can do". Red only for a leaked secret.
// - review.md: the attack is ongoing; "超过 13,500"; the run is deleted "几秒后"; no attack workflow code on screen.
// Stage 900 × 1080 (frame "full"); the ground and header are each scene's backdrop (1080 × 1920).

const P = {wiz: '#1D1C25', gh: '#010409', ghDeep: '#0B1B46', blue: '#2354D7', pink: '#F07CF0', pinkHi: '#FAC8FB', white: '#FAFAFA', ink: '#0D1117',
  red: '#FF4D4D', green: '#2DA44E', muted: '#8B949E', line: '#30363D', paper: '#FFFFFF', marker: '#FFE36E'};
const IMG = (n: string) => staticFile(`images/tutorials/gheist-github-secrets/${n}.jpg`);
const B32 = ['MFRGGZDFMZTWQ2LKNNWG23TPOBYXE43U', 'PJATCMRTGQ2TMNZYHE3DAMJSGM2DKNRX', 'GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ'];

/* ---------- shared pieces ---------- */

const backdrop = (a: string, b: string, k: (f: number, cue: Cue) => number, light = false, label?: string, horizon?: number): Scene['backdrop'] => {
  const B: NonNullable<Scene['backdrop']> = ({f, cue}) => {
    const m = k(f, cue);
    return <>
      <Ground a={a} b={b} k={m} t={f / 30} light={light ? 'rgba(255,255,255,0.6)' : 'rgba(120,140,255,0.08)'} horizon={horizon} grain={light ? 0.5 : 0.3} />
      <div style={{position: 'absolute', left: 72, right: 72, top: 92, display: 'flex', justifyContent: 'space-between', fontFamily: font, fontWeight: 700, fontSize: 28,
        color: light ? 'rgba(13,17,23,0.5)' : 'rgba(255,255,255,0.5)', letterSpacing: 1}}>
        <span>AI 编程 · 安全</span><span style={{fontWeight: 500, fontSize: 24}}>{label ?? '据 Wiz Research 2026-10-25'}</span>
      </div>
    </>;
  };
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
const stage = (cam: Cam2, far: React.ReactNode, mid: React.ReactNode, near?: React.ReactNode) => <>
  <Layer cam={cam} depth={0.35}>{far}</Layer>
  <Layer cam={cam} depth={1}>{mid}</Layer>
  {near && <Layer cam={cam} depth={1.6} blur={7}>{near}</Layer>}
</>;
const shake = (f: number, at: number, amp = 12) => (f < at ? 0 : amp * Math.exp(-(f - at) / 5) * Math.sin((f - at) * 2.3));
/** Far layer: a faint grid (the Wiz cover's blue grid) and a few soft shapes so the dark has a back. */
const Far: React.FC<{c?: string}> = ({c = 'rgba(35,84,215,0.18)'}) => <>
  <svg width={1400} height={1500} style={{position: 'absolute', left: -250, top: -200}}>
    {Array.from({length: 22}, (_, i) => <line key={`v${i}`} x1={i * 64} y1={0} x2={i * 64} y2={1500} stroke={c} strokeWidth={2} />)}
    {Array.from({length: 24}, (_, i) => <line key={`h${i}`} x1={0} y1={i * 64} x2={1400} y2={i * 64} stroke={c} strokeWidth={2} />)}
  </svg>
</>;
/** External screenshot as a sticker (white border, shadow, slight tilt) with the account's source label. */
const Shot: React.FC<{src: string; w: number; f: number; at: number; rot?: number; x: number; y: number; label?: string}> = ({src, w, f, at, rot = -2, x, y, label}) => {
  const p = pop(f, at, 12);
  if (p < -0.5) return null;
  return <div style={{position: 'absolute', left: x, top: y, width: w, transform: `rotate(${rot}deg) scale(${0.7 + 0.3 * Math.max(0, p)})`, opacity: clamp(p * 2), transformOrigin: '50% 50%'}}>
    <div style={{background: '#fff', padding: 12, borderRadius: 14, boxShadow: '0 20px 40px rgba(0,0,0,0.45)'}}><Img src={src} style={{width: '100%', display: 'block', borderRadius: 6}} /></div>
    {label && <div style={{marginTop: 10, textAlign: 'right', fontFamily: font, fontSize: 26, color: 'rgba(255,255,255,0.7)'}}>{label}</div>}
  </div>;
};

/**
 * Gheist: a little ghost (our drawing) in the Wiz cover's pink. (x, y) is the bottom of its hem; s scales 160 × 190.
 * `look` -1 / 1 turns the eyes, `grin` shows a sly smile, `carry` raises the arms.
 */
const Ghost: React.FC<{f: number; x: number; y: number; s?: number; look?: number; grin?: boolean; carry?: boolean; o?: number}> = ({f, x, y, s = 1, look = 0, grin = false, carry = false, o = 1}) => {
  const id = React.useId().replace(/:/g, '');
  const bob = Math.sin(f / 8) * 6, wave = f / 4;
  const hem = Array.from({length: 7}, (_, i) => `${18 + i * 20.7} ${170 + Math.sin(wave + i * 1.4) * 7 + (i % 2 ? 12 : 0)}`).join(' L');
  const blink = f % 80 > 76;
  return <>
    <ContactShadow x={x} y={y + 30} w={120 * s} lift={0.8} o={0.35 * o} />
    <div style={{position: 'absolute', left: x - 80 * s, top: y - 190 * s + bob, width: 160 * s, height: 190 * s, opacity: o}}>
      <svg width={160 * s} height={190 * s} viewBox="0 0 160 190" style={{overflow: 'visible'}}>
        <defs><radialGradient id={`gb${id}`} cx="35%" cy="25%" r="85%"><stop offset="0" stopColor="#FFFFFF" /><stop offset="0.6" stopColor={P.pinkHi} /><stop offset="1" stopColor="#C97DEE" /></radialGradient></defs>
        <path d={`M18 170 L18 80 Q18 14 80 14 Q142 14 142 80 L142 170 L${hem} Z`} fill={`url(#gb${id})`} stroke={P.pink} strokeWidth={7} strokeLinejoin="round" />
        <ellipse cx={56} cy={46} rx={18} ry={8} fill="#fff" opacity={0.9} transform="rotate(-20 56 46)" />
        <ellipse cx={62 + look * 8} cy={84} rx={10} ry={blink ? 1.5 : 14} fill={P.wiz} />
        <ellipse cx={100 + look * 8} cy={84} rx={10} ry={blink ? 1.5 : 14} fill={P.wiz} />
        {grin ? <path d="M62 116 Q82 132 104 112" fill="none" stroke={P.wiz} strokeWidth={6} strokeLinecap="round" />
          : <ellipse cx={82} cy={118} rx={8} ry={6} fill={P.wiz} />}
        {carry ? <><path d="M20 96 Q-6 70 2 44" fill="none" stroke={P.pink} strokeWidth={10} strokeLinecap="round" /><path d="M140 96 Q166 70 158 44" fill="none" stroke={P.pink} strokeWidth={10} strokeLinecap="round" /></>
          : <><path d="M20 104 Q4 116 6 132" fill="none" stroke={P.pink} strokeWidth={10} strokeLinecap="round" /><path d="M140 104 Q156 116 154 132" fill="none" stroke={P.pink} strokeWidth={10} strokeLinecap="round" /></>}
      </svg>
    </div>
  </>;
};
/** A key, lit, in a colour; `broken` splits it. */
const Key: React.FC<{w?: number; c?: string; broken?: number; rot?: number}> = ({w = 160, c = '#F5C542', broken = 0, rot = 0}) => (
  <svg width={w} height={w * 0.5} viewBox="0 0 160 80" style={{overflow: 'visible', display: 'block', transform: `rotate(${rot}deg)`}}>
    <g transform={`translate(${-broken * 14} ${broken * 10}) rotate(${-broken * 18} 40 40)`}>
      <circle cx={34} cy={40} r={28} fill={c} stroke={P.ink} strokeWidth={6} /><circle cx={34} cy={40} r={10} fill={P.ink} opacity={0.85} />
      <path d="M60 40 H96" stroke={P.ink} strokeWidth={22} strokeLinecap="round" /><path d="M60 40 H96" stroke={c} strokeWidth={11} strokeLinecap="round" />
      <ellipse cx={26} cy={28} rx={9} ry={5} fill="#fff" opacity={0.6} />
    </g>
    <g transform={`translate(${broken * 16} ${broken * 18}) rotate(${broken * 24} 120 40)`}>
      <path d="M96 40 H150 M132 40 V60 M146 40 V54" stroke={P.ink} strokeWidth={22} strokeLinecap="round" />
      <path d="M96 40 H150 M132 40 V60 M146 40 V54" stroke={c} strokeWidth={11} strokeLinecap="round" />
    </g>
  </svg>
);
/** A GitHub-like window (our drawing): title bar with three dots, a header line, children. */
const Win: React.FC<{w: number; h?: number; title: string; light?: boolean; children: React.ReactNode; style?: React.CSSProperties}> = ({w, h, title, light = false, children, style}) => (
  <div style={{width: w, height: h, borderRadius: 22, overflow: 'hidden', border: `3px solid ${light ? '#D0D7DE' : P.line}`, background: light ? '#FFFFFF' : '#0D1117',
    boxShadow: '0 30px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04)', ...style}}>
    <div style={{height: 64, display: 'flex', alignItems: 'center', gap: 12, padding: '0 22px', background: light ? '#F6F8FA' : '#161B22', borderBottom: `2px solid ${light ? '#D0D7DE' : P.line}`}}>
      {['#FF5F57', '#FEBC2E', '#28C840'].map((c) => <div key={c} style={{width: 18, height: 18, borderRadius: 9, background: c}} />)}
      <div style={{marginLeft: 16, fontFamily: mono, fontSize: 28, color: light ? '#57606A' : P.muted}}>{title}</div>
    </div>
    {children}
  </div>
);
const typedN = (f: number, start: number, cps: number) => Math.max(0, Math.floor(((f - start) / 30) * cps));

/* ---------- 1 hook: your own CI prints your secret ---------- */

const hookPlan = (cue: Cue) => ({a: cue('a', 35), b: cue('b', 85)});
const Hook: Scene = ({f, cue}) => {
  const p = hookPlan(cue);
  const cam0 = camAt(f, [[-1, {x: 450, y: 520, z: 1.0}, 1], [0, {z: 1.08, y: 540}, p.b], [p.b, {z: 1.16}, 8]]);
  const cam = {...cam0, x: cam0.x + shake(f, p.b, 10)};
  const rows = B32.map((s, i) => s.slice(0, typedN(f, -40 + i * 34, 30)));
  return <>
    {stage(cam, <Far />, <>
      <Abs x={0} y={130}><Win w={900} title="Actions · sync / build">
        <div style={{padding: '30px 34px 40px', fontFamily: mono}}>
          <div style={{fontSize: 34, color: '#E6EDF3'}}>▸ Run sync-check</div>
          <div style={{fontSize: 26, color: P.muted, margin: '8px 0 26px'}}>ci-sync-k3x9qa · ci: sync config</div>
          {rows.map((r, i) => <div key={i} style={{fontSize: 39, fontWeight: 700, color: P.red, letterSpacing: 0.5, lineHeight: 1.45, whiteSpace: 'nowrap'}}>{r}{r.length < B32[i].length && r.length > 0 && Math.floor(f / 6) % 2 ? '▌' : ''}</div>)}
          <div style={{fontSize: 28, color: P.red, opacity: 0.85, marginTop: 24}}>{f > p.a + 10 ? '✕ run deleted seconds after completion' : ''}</div>
        </div>
      </Win></Abs>
      <Ghost f={f} x={760} y={1020} s={1.1} look={-1} grin={f > p.b} o={ramp(f, p.a - 4, p.a + 8)} />
    </>)}
    <Abs x={0} y={0} w={900} style={{textAlign: 'center'}}><div style={{fontFamily: font, fontWeight: 900, fontSize: 72, color: '#fff'}}>你的 CI 日志</div></Abs>
    <Stamp x={470} y={520} f={f} at={p.b} size={110} color={P.red} rot={-8}>你的密钥</Stamp>
    <Abs x={0} y={1040}><div style={{fontFamily: font, fontSize: 26, color: 'rgba(255,255,255,0.55)'}}>示意画面 · 随机字符，非真实密钥</div></Abs>
  </>;
};
Hook.backdrop = backdrop(P.wiz, P.wiz, () => 0);
Hook.sfx = (cue) => {
  const p = hookPlan(cue);
  return [{at: 0, kind: 'tap', gain: 0.08}, {at: 20, kind: 'tap', gain: 0.06}, {at: p.a, kind: 'whoosh-short', gain: 0.08}, {at: p.b, kind: 'stamp', gain: 0.2}, {at: p.b + 1, kind: 'fs-impact-deep', gain: 0.1}];
};

/* ---------- 2 scale: Wiz is tracking it; still ongoing; 850+ accounts, 13,500+ branches ---------- */

const scalePlan = (cue: Cue) => ({a: cue('a', 92), b: cue('b', 131), c: cue('c', 169)});
const Scale: Scene = ({f, cue}) => {
  const p = scalePlan(cue);
  const grid = ramp(f, p.b - 14, p.b - 4);
  const cam = camAt(f, [[-1, {x: 450, y: 420, z: 1.08}, 1], [p.b - 16, {x: 450, y: 600, z: 1.0}, 18], [p.c, {z: 0.96}, 20], [p.c + 26, {x: 470, y: 720, z: 1.12}, 80]]);
  const cols = 17, n = 17 * 13, cell = 900 / cols;
  return <>
    {stage(cam, <Far />, <>
      <div style={{opacity: 1 - 0.75 * grid, transform: `translateY(${-140 * grid}px) scale(${1 - 0.25 * grid})`, transformOrigin: '450px 0'}}>
        <Shot src={IMG('wiz-title')} w={880} f={f} at={-12} x={10} y={70} rot={-2} label="@Wiz Research｜案例展示" />
        <Shot src={IMG('wiz-numbers')} w={860} f={f} at={p.a - 30} x={20} y={420} rot={1.5} />
        <Ghost f={f} x={760} y={150 + 40 * (1 - ramp(f, 18, 36))} s={0.8} look={-1} o={ramp(f, 18, 30)} />
      </div>
      {/* 850+ accounts: avatar cells light up with a pink key */}
      {grid > 0 && <svg width={900} height={700} style={{position: 'absolute', left: 0, top: 380, overflow: 'visible'}}>
        {Array.from({length: n}, (_, i) => {
          const r = Math.floor(i / cols), c = i % cols, k = clamp((f - (p.b - 10) - (r * 0.9 + c * 0.25)) / 4);
          if (k <= 0) return null;
          const lit = f > p.b + 2 + hash(i) * 30;
          const br = f > p.c - 6 + hash(i + 3) * 26;
          const x = c * cell + cell / 2, y = r * cell + cell / 2;
          return <g key={i} opacity={k}>
            <circle cx={x} cy={y} r={cell * 0.36} fill={lit ? P.pink : '#2C2B36'} stroke={lit ? P.pinkHi : '#3A3946'} strokeWidth={2} />
            {br && [0, 1, 2].map((j) => <path key={j} d={`M${x} ${y} l${(j - 1) * 10} ${-14 - j * 3}`} stroke={P.pinkHi} strokeWidth={3} strokeLinecap="round" />)}
          </g>;
        })}
      </svg>}
      <Abs x={30} y={170}><In f={f} at={p.b - 2}><Roll f={f} start={p.b - 2} land={p.b + 20} to={850} unit="+ 个账号" size={150} color={P.pink} sep={false} /></In></Abs>
      <Abs x={30} y={1000}><In f={f} at={p.c - 4}><Roll f={f} start={p.c - 4} land={p.c + 24} to={13500} unit="+ 个分支" size={120} color="#fff" /></In></Abs>
    </>)}
    <div style={{opacity: 1 - ramp(f, p.b - 16, p.b - 8)}}><Stamp x={690} y={330} f={f} at={p.a} size={72} color={P.red} rot={8}>仍在进行</Stamp></div>
  </>;
};
Scale.backdrop = backdrop(P.wiz, P.wiz, () => 0);
Scale.sfx = (cue) => {
  const p = scalePlan(cue);
  return [{at: 0, kind: 'paper', gain: 0.1}, {at: p.a, kind: 'stamp', gain: 0.16}, {at: p.b - 4, kind: 'whoosh-short', gain: 0.08}, {at: p.b + 20, kind: 'pop', gain: 0.1}, {at: p.c + 24, kind: 'pop', gain: 0.1}];
};

/* ---------- 3 plant: a branch into every repo, a sync-check workflow, your key into the log ---------- */

const plantPlan = (cue: Cue) => ({a: cue('a', 71), b: cue('b', 133)});
/** The repository as a safe with your key hanging inside; `door` 0 → 1 opens it. */
const Safe: React.FC<{x: number; y: number; door: number; key?: boolean; keyOut?: number}> = ({x, y, door, key = true, keyOut = 0}) => (
  <div style={{position: 'absolute', left: x, top: y, width: 360, height: 400}}>
    <ContactShadow x={180} y={400} w={360} o={0.5} />
    <div style={{position: 'absolute', inset: 0, borderRadius: 30, background: 'linear-gradient(160deg, #3A4252 0, #20252F 60%, #161A22 100%)', border: `6px solid ${P.ink}`, boxShadow: '0 16px 0 #0A0D12'}}>
      <div style={{position: 'absolute', left: 30, top: 30, right: 30, bottom: 30, borderRadius: 18, background: '#0F131A', border: '3px solid #2A303C'}}>
        {key && <div style={{position: 'absolute', left: 90, top: 140 - keyOut * 60, opacity: 1 - keyOut}}><Key w={150} c={P.red} rot={-10} /></div>}
        <div style={{position: 'absolute', left: 20, top: 16, fontFamily: font, fontWeight: 800, fontSize: 30, color: P.muted}}>secrets</div>
      </div>
      {/* the door swings open (scaleX from the left hinge) */}
      <div style={{position: 'absolute', inset: 0, borderRadius: 30, background: 'linear-gradient(160deg, #4A5366 0, #2A303C 100%)', border: `6px solid ${P.ink}`, transformOrigin: '0 50%',
        transform: `perspective(1200px) rotateY(${-100 * door}deg)`, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <div style={{width: 120, height: 120, borderRadius: 60, border: '10px solid #8B949E', background: '#20252F'}} />
      </div>
    </div>
    <div style={{position: 'absolute', left: 0, top: -64, width: 360, textAlign: 'center', fontFamily: mono, fontWeight: 700, fontSize: 34, color: '#E6EDF3'}}>your-repo</div>
  </div>
);
const Plant: Scene = ({f, cue}) => {
  const p = plantPlan(cue);
  const gx = 130 + 260 * ease.inOutCubic(ramp(f, 4, 30));
  const branch = ramp(f, 26, 44);
  const yml = pop(f, p.a, 12);
  const door = ramp(f, p.b - 16, p.b - 4);
  const keyOut = ramp(f, p.b, p.b + 20);
  const cam = camAt(f, [[-1, {x: 380, y: 560, z: 1.05}, 1], [p.a - 8, {x: 450, y: 600, z: 1.08}, 16], [p.b - 10, {x: 520, y: 540, z: 1.0}, 18]]);
  return <>
    {stage(cam, <Far />, <>
      <Safe x={70} y={560} door={door} keyOut={keyOut} />
      {/* the branch line from main to ci-sync */}
      <svg width={900} height={1080} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
        <line x1={250} y1={540} x2={250} y2={120} stroke={P.muted} strokeWidth={10} strokeLinecap="round" />
        <circle cx={250} cy={180} r={16} fill={P.muted} /><circle cx={250} cy={330} r={16} fill={P.muted} />
        <path d="M250 430 Q250 330 560 300" fill="none" stroke={P.pink} strokeWidth={12} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - branch} />
        {branch > 0.98 && <circle cx={560} cy={300} r={20} fill={P.pink} stroke={P.pinkHi} strokeWidth={4} />}
      </svg>
      <Abs x={140} y={86}><div style={{fontFamily: mono, fontSize: 32, color: P.muted}}>main</div></Abs>
      <Abs x={470} y={200}><In f={f} at={40}><div style={{fontFamily: mono, fontWeight: 800, fontSize: 46, color: P.pink, background: 'rgba(240,124,240,0.12)', border: `3px solid ${P.pink}`, borderRadius: 14, padding: '6px 16px'}}>ci-sync-a3f9c1</div></In></Abs>
      {/* the workflow file card: a name only, never its code */}
      {yml > -0.5 && <div style={{position: 'absolute', left: 500, top: 380 - 300 * (1 - Math.max(0, yml)), opacity: clamp(yml * 2), transform: 'rotate(4deg)'}}>
        <div style={{width: 340, height: 200, borderRadius: 18, background: '#F6F8FA', border: `5px solid ${P.ink}`, boxShadow: '0 20px 30px rgba(0,0,0,0.45)', padding: 24, boxSizing: 'border-box'}}>
          <div style={{fontFamily: mono, fontWeight: 800, fontSize: 36, color: P.ink}}>sync-check.yml</div>
          {[0, 1, 2].map((i) => <div key={i} style={{marginTop: 18, height: 14, width: `${80 - i * 18}%`, borderRadius: 7, background: '#D0D7DE'}} />)}
        </div>
      </div>}
      <Ghost f={f} x={gx} y={420 - 160 * ramp(f, 30, 50)} s={0.95} look={1} carry={f < 40} grin={f > p.a} />
      {/* the key flies out of the safe into a log line */}
      {keyOut > 0 && keyOut < 1 && <div style={{position: 'absolute', left: 160 + 420 * keyOut, top: 700 - 200 * Math.sin(Math.PI * keyOut), transform: `rotate(${keyOut * 200}deg)`}}><Key w={130} c={P.red} /></div>}
      <Abs x={460} y={640}><In f={f} at={p.b + 16}><Win w={430} title="log"><div style={{padding: '18px 20px', fontFamily: mono, fontWeight: 700, fontSize: 30, color: P.red, lineHeight: 1.4}}>
        {B32[0].slice(0, typedN(f, p.b + 18, 40) % 33)}<br />{B32[1].slice(0, Math.max(0, typedN(f, p.b + 40, 40)) % 33)}</div></Win></In></Abs>
    </>)}
  </>;
};
Plant.backdrop = backdrop(P.wiz, P.wiz, () => 0);
Plant.sfx = (cue) => {
  const p = plantPlan(cue);
  return [{at: 6, kind: 'whoosh-short', gain: 0.08}, {at: 44, kind: 'pop', gain: 0.1}, {at: p.a, kind: 'paper', gain: 0.12}, {at: p.b - 16, kind: 'fs-part-seat', gain: 0.1}, {at: p.b + 18, kind: 'tap', gain: 0.08}];
};

/* ---------- 4 mask: the verbatim secret is masked; base32 doesn't match and prints in full (signature) ---------- */

const maskPlan = (cue: Cue) => ({a: cue('a', 62), b: cue('b', 115), c: cue('c', 118)});
const Mask: Scene = ({f, cue}) => {
  const p = maskPlan(cue);
  const bar1 = ramp(f, 14, 22);
  const conv = ramp(f, p.a, p.a + 30);
  const fall = ramp(f, p.b - 6, p.b + 2), bounce = ramp(f, p.b + 6, p.b + 22);
  const reveal = ramp(f, p.b + 8, p.b + 20);
  const cam0 = camAt(f, [[-1, {x: 450, y: 420, z: 1.06}, 1], [p.a - 6, {x: 450, y: 560, z: 1.0}, 16], [p.b, {x: 450, y: 700, z: 1.08}, 20]]);
  const cam = {...cam0, y: cam0.y + shake(f, p.b + 2, 8)};
  return <>
    {stage(cam, <Far />, <>
      {/* row 1: the secret as it is → masked */}
      <Abs x={0} y={150}><div style={{fontFamily: font, fontSize: 32, color: P.muted, marginBottom: 12}}>原样打印</div>
        <div style={{position: 'relative', height: 110, borderRadius: 16, background: '#0D1117', border: `3px solid ${P.line}`, display: 'flex', alignItems: 'center', padding: '0 28px', fontFamily: mono, fontWeight: 700, fontSize: 52}}>
          <span style={{color: bar1 > 0.5 ? P.muted : P.red}}>{bar1 > 0.5 ? '***' : 'ghp_7Qm2…xK9'}</span>
          <div style={{position: 'absolute', left: 20, top: 18, height: 74, width: 380 * bar1, background: '#000', borderRadius: 8, opacity: bar1 < 1 ? 1 : 0}} />
          <span style={{marginLeft: 'auto', fontFamily: font, fontSize: 40, color: P.green, opacity: ramp(f, 22, 28)}}>✓ 遮住了</span>
        </div></Abs>
      {/* the converter: the ghost feeds the same key in */}
      <div style={{position: 'absolute', left: 300, top: 390, width: 300, height: 170, borderRadius: 24, background: 'linear-gradient(160deg, #3B2E4A 0, #24202E 100%)', border: `6px solid ${P.pink}`, boxShadow: '0 14px 0 #120F18',
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: mono, fontWeight: 800, fontSize: 52, color: P.pinkHi, opacity: ramp(f, p.a - 10, p.a)}}>base32</div>
      {conv > 0 && conv < 0.6 && <div style={{position: 'absolute', left: 120 + 260 * (conv / 0.6), top: 440, transform: `scale(${1 - 0.6 * conv})`}}><Key w={140} c={P.red} /></div>}
      <Ghost f={f} x={140} y={600} s={0.85} look={1} grin={f > p.b + 10} o={ramp(f, p.a - 12, p.a - 2)} />
      {/* row 2: base32 → the mask falls, doesn't fit, bounces off */}
      <Abs x={0} y={640}><div style={{fontFamily: font, fontSize: 32, color: P.muted, marginBottom: 12, opacity: ramp(f, p.a + 20, p.a + 28)}}>转成 base32 再打印</div>
        <div style={{position: 'relative', height: 290, borderRadius: 16, background: '#0D1117', border: `3px solid ${reveal > 0 ? P.red : P.line}`, padding: '22px 28px', fontFamily: mono, fontWeight: 700, fontSize: 46,
          color: P.red, lineHeight: 1.4, boxShadow: reveal > 0 ? `0 0 ${60 * reveal}px rgba(255,77,77,0.45)` : undefined, opacity: ramp(f, p.a + 20, p.a + 28), overflow: 'visible'}}>
          {B32[0]}<br />{B32[1]}<br />{B32[2].slice(0, 20)}
          <div style={{position: 'absolute', left: 20, top: 24 - 260 * (1 - fall) - 120 * Math.sin(Math.PI * bounce) - 400 * ramp(f, p.b + 18, p.b + 30), width: 380, height: 74, background: '#000', borderRadius: 8,
            transform: `rotate(${bounce * 28}deg)`, border: '3px solid #444', opacity: fall > 0 ? 1 - ramp(f, p.b + 24, p.b + 30) : 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 34, color: '#888'}}>***</div>
        </div></Abs>
      <Abs x={560} y={960}><In f={f} at={p.b + 12}><div style={{fontFamily: font, fontWeight: 900, fontSize: 64, color: P.red, transform: 'rotate(-4deg)'}}>✕ 未遮蔽</div></In></Abs>
    </>)}
    <Abs x={0} y={1040}><div style={{fontFamily: font, fontSize: 26, color: 'rgba(255,255,255,0.5)'}}>示意画面 · 随机字符</div></Abs>
  </>;
};
Mask.backdrop = backdrop(P.wiz, P.gh, (f, cue) => ramp(f, maskPlan(cue).b, maskPlan(cue).b + 20) * 0.8);
Mask.sfx = (cue) => {
  const p = maskPlan(cue);
  return [{at: 14, kind: 'block', gain: 0.1}, {at: p.a, kind: 'whoosh-short', gain: 0.08}, {at: p.a + 16, kind: 'fs-wind-click', gain: 0.08}, {at: p.b + 2, kind: 'thud', gain: 0.14}, {at: p.b + 8, kind: 'fs-impact-deep', gain: 0.12}];
};

/* ---------- 5 erase: out through GitHub's own API, the run deleted seconds later, nothing to block ---------- */

const erasePlan = (cue: Cue) => ({a: cue('a', 72), b: cue('b', 119), c: cue('c', 147)});
const Erase: Scene = ({f, cue}) => {
  const p = erasePlan(cue);
  const rub = ramp(f, p.a, p.a + 16);
  const cam = camAt(f, [[-1, {x: 450, y: 380, z: 1.02}, 1], [p.a - 8, {x: 450, y: 560, z: 1.06}, 14], [p.b - 6, {x: 450, y: 820, z: 1.1}, 18]]);
  return <>
    {stage(cam, <Far />, <>
      {/* the pipe labelled GitHub API */}
      <div style={{position: 'absolute', left: 120, top: 150, width: 640, height: 70, borderRadius: 35, background: 'linear-gradient(180deg, #2B4FD0 0, #18306F 100%)', border: `5px solid ${P.ink}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: mono, fontWeight: 800, fontSize: 36, color: '#fff'}}>api.github.com</div>
      <Flight f={f} start={6} n={3} every={10} dur={26} a={[90, 300]} b={[800, 300]} lift={0.25} spin={12} trail="rgba(240,124,240,0.5)" render={() => <Envelope w={110} paper="#fff" ink={P.ink} seal={P.red} />} />
      <Ghost f={f} x={790} y={420} s={0.9} look={-1} carry grin />
      <Abs x={20} y={300}><div style={{fontFamily: font, fontWeight: 800, fontSize: 34, color: P.muted}}>日志</div></Abs>
      {/* the Actions run list: the sync-check row is rubbed out */}
      <Abs x={0} y={460}><Win w={900} title="Actions · All workflows">
        {[['build', '✓', P.green], ['sync-check', '✓', P.green], ['test', '✓', P.green]].map(([n, s, c], i) => (
          <div key={n} style={{position: 'relative', height: 92, display: 'flex', alignItems: 'center', gap: 22, padding: '0 30px', borderBottom: `2px solid ${P.line}`, fontFamily: mono, fontSize: 38, color: '#E6EDF3',
            opacity: i === 1 ? 1 - rub : 1, filter: i === 1 ? `blur(${rub * 6}px)` : undefined}}>
            <span style={{color: c, fontWeight: 900}}>{s}</span>{n}<span style={{marginLeft: 'auto', fontSize: 28, color: P.muted}}>{i === 1 ? '几秒前' : `${i + 2} 小时前`}</span>
          </div>))}
      </Win></Abs>
      {rub > 0 && rub < 1 && <div style={{position: 'absolute', left: 120 + 600 * rub, top: 590 + Math.sin(rub * 30) * 14, width: 110, height: 60, borderRadius: 12, background: P.pinkHi, border: `5px solid ${P.ink}`, transform: 'rotate(-14deg)'}} />}
      <Abs x={560} y={430}><In f={f} at={p.a + 4}><div style={{fontFamily: font, fontWeight: 900, fontSize: 52, color: P.pink, transform: 'rotate(-3deg)'}}>几秒后</div></In></Abs>
      {/* the firewall and its empty block list */}
      <div style={{position: 'absolute', left: 60, top: 820, opacity: ramp(f, p.b - 8, p.b + 2)}}>
        <svg width={260} height={200} viewBox="0 0 260 200">{Array.from({length: 4}, (_, r) => Array.from({length: 4}, (_, c) => <rect key={`${r}${c}`} x={c * 64 + (r % 2) * 32 - 20} y={r * 48} width={60} height={44} rx={6} fill="#8A3B2E" stroke={P.ink} strokeWidth={4} />))}</svg>
      </div>
      <div style={{position: 'absolute', left: 380, top: 800, width: 480, borderRadius: 18, background: '#F6F8FA', border: `5px solid ${P.ink}`, padding: '20px 28px', opacity: ramp(f, p.b, p.b + 8)}}>
        <div style={{fontFamily: font, fontWeight: 900, fontSize: 40, color: P.ink}}>拦截名单</div>
        <div style={{marginTop: 14, fontFamily: mono, fontSize: 36, color: '#8C959F'}}>（空）</div>
        <div style={{marginTop: 8, fontFamily: mono, fontSize: 28, color: '#8C959F'}}>没有攻击者域名</div>
      </div>
    </>)}
  </>;
};
Erase.backdrop = backdrop(P.gh, P.gh, () => 0);
Erase.sfx = (cue) => {
  const p = erasePlan(cue);
  return [{at: 6, kind: 'whoosh', gain: 0.08}, {at: 16, kind: 'whoosh-short', gain: 0.06}, {at: p.a, kind: 'paper', gain: 0.12}, {at: p.b, kind: 'thud', gain: 0.1}, {at: p.c, kind: 'block', gain: 0.08}];
};

/* ---------- 6 hold: GitHub holds suspicious runs — in public repos only ---------- */

const holdPlan = (cue: Cue) => ({a: cue('a', 108), b: cue('b', 151)});
const Lane: React.FC<{f: number; y: number; label: string; gate: boolean; at: number; held?: number}> = ({f, y, label, gate, at, held = 0}) => {
  const t = ramp(f, at, at + 40);
  const x = gate ? 40 + 100 * ramp(f, at, at + 24) : 40 + 760 * t;
  return <div style={{position: 'absolute', left: 0, top: y, width: 900, height: 150}}>
    <div style={{position: 'absolute', left: 0, right: 0, top: 96, height: 10, borderRadius: 5, background: 'rgba(255,255,255,0.15)'}} />
    <div style={{position: 'absolute', left: 0, top: -6, fontFamily: font, fontWeight: 900, fontSize: 40, color: '#fff'}}>{label}</div>
    {gate && <div style={{position: 'absolute', left: 680, top: 0, width: 22, height: 120, borderRadius: 8, background: P.blue, border: `4px solid ${P.ink}`, transform: `translateY(${-140 * (1 - ramp(f, at - 20, at - 8))}px)`}} />}
    {f >= at - 4 && <div style={{position: 'absolute', left: x + 200, top: 48, width: 300, height: 64, borderRadius: 14, background: '#161B22', border: `4px solid ${gate ? '#D29922' : P.pink}`,
      display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: mono, fontWeight: 700, fontSize: 30, color: gate ? '#D29922' : P.pinkHi, opacity: gate ? 1 : 1 - ramp(f, at + 34, at + 40)}}>
      {gate && held > 0.5 ? 'action_required' : 'sync-check'}</div>}
  </div>;
};
const Hold: Scene = ({f, cue}) => {
  const p = holdPlan(cue);
  const cam = camAt(f, [[-1, {x: 450, y: 360, z: 1.05}, 1], [p.a - 12, {x: 450, y: 640, z: 1.0}, 18], [p.a + 6, {x: 450, y: 700, z: 1.04}, 40], [p.b - 4, {x: 450, y: 760, z: 1.07}, 30]]);
  return <>
    {stage(cam, <Far c="rgba(35,84,215,0.22)" />, <>
      <Shot src={IMG('gh-title')} w={860} f={f} at={-12} x={20} y={60} rot={-1.5} label="@GitHub｜Changelog 2026-07-28" />
      <Shot src={IMG('gh-public-only')} w={760} f={f} at={p.a - 6} x={70} y={330} rot={1} />
      <Lane f={f} y={520} label="公开仓库" gate at={40} held={ramp(f, 66, 70)} />
      <Abs x={600} y={470}><In f={f} at={72}><div style={{fontFamily: font, fontWeight: 900, fontSize: 40, color: '#D29922'}}>扣下 · 等人批准</div></In></Abs>
      <Lane f={f} y={700} label="私有仓库" gate={false} at={p.a + 6} />
      <Lane f={f} y={880} label="Enterprise Server" gate={false} at={p.b + 2} />
      <Ghost f={f} x={f < p.b ? 250 + 640 * ramp(f, p.a + 6, p.a + 46) : 250 + 640 * ramp(f, p.b + 2, p.b + 42)} y={f < p.b ? 740 : 920} s={0.75} look={1} grin o={ramp(f, p.a + 2, p.a + 8)} />
    </>)}
  </>;
};
Hold.backdrop = backdrop(P.gh, P.ghDeep, (f) => ramp(f, -4, 16), false, 'GitHub Changelog · Wiz Research');
Hold.sfx = (cue) => {
  const p = holdPlan(cue);
  return [{at: 0, kind: 'paper', gain: 0.1}, {at: 28, kind: 'thud', gain: 0.12}, {at: 66, kind: 'block', gain: 0.1}, {at: p.a + 6, kind: 'whoosh', gain: 0.1}, {at: p.b + 2, kind: 'whoosh', gain: 0.1}];
};

/* ---------- 7 check: the branch list (re-typeset from the planner's mock-up, features from Wiz's IoCs) ---------- */

const checkPlan = (cue: Cue) => ({a: cue('a', 23), b: cue('b', 78)});
const ROWS: [string, string, boolean][] = [['main', 'default', false], ['feature/login', '', false], ['ci-sync-a3f9c1', 'ci: sync config · unsigned', true], ['dev', '', false], ['ci-sync-7kq2zx', 'ci: sync config · unsigned', true]];
const Check: Scene = ({f, cue}) => {
  const p = checkPlan(cue);
  const cam = camAt(f, [[-1, {x: 450, y: 520, z: 1.0}, 1], [p.a - 4, {x: 420, y: 560, z: 1.1}, 16], [p.b - 4, {x: 470, y: 600, z: 1.16}, 16]]);
  const mark = ramp(f, p.b, p.b + 14);
  return <>
    {stage(cam, <></>, <>
      <Abs x={0} y={120}><Win w={900} title="your-repo · Branches" light>
        {ROWS.map(([n, msg, bad], i) => {
          const hot = bad && f >= p.a;
          return <div key={n} style={{position: 'relative', padding: '22px 30px', borderBottom: '2px solid #D0D7DE', background: hot ? 'rgba(255,77,77,0.10)' : '#fff'}}>
            <div style={{fontFamily: mono, fontWeight: 700, fontSize: 44, color: hot ? '#CF222E' : P.ink}}>{n}{hot ? '  ⚠' : ''}</div>
            {bad && <svg width={1} height={1} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
              <HandRing cx={262} cy={46} rx={250} ry={46} p={ramp(f, p.a + 2 + (i > 2 ? 8 : 0), p.a + 16 + (i > 2 ? 8 : 0))} color="#CF222E" sw={7} seed={i} /></svg>}
            {bad && <div style={{marginTop: 8, fontFamily: mono, fontSize: 30, color: '#57606A'}}>
              <span style={{backgroundImage: `linear-gradient(180deg, transparent 50%, ${P.marker} 50%, ${P.marker} 92%, transparent 92%)`, backgroundRepeat: 'no-repeat', backgroundSize: `${mark * 100}% 100%`}}>ci: sync config</span>{msg.slice(15)}</div>}
            {!bad && msg && <div style={{marginTop: 8, fontFamily: mono, fontSize: 30, color: '#57606A'}}>{msg}</div>}
          </div>;
        })}
      </Win></Abs>
    </>)}
    <Abs x={0} y={1030}><div style={{fontFamily: font, fontSize: 26, color: 'rgba(13,17,23,0.5)'}}>示意 · 特征来自 Wiz Research 的 IoC，后缀为随机 6 位</div></Abs>
  </>;
};
Check.backdrop = backdrop(P.gh, P.white, (f) => ramp(f, -6, 6), true, 'Wiz Research · Hunt');
Check.sfx = (cue) => {
  const p = checkPlan(cue);
  return [{at: 0, kind: 'whoosh-short', gain: 0.08}, {at: p.a + 2, kind: 'tap', gain: 0.1}, {at: p.a + 10, kind: 'tap', gain: 0.1}, {at: p.b, kind: 'paper', gain: 0.08}];
};

/* ---------- 8 rotate: deleting the branch doesn't undo it — change every secret, revoke the token ---------- */

const rotatePlan = (cue: Cue) => ({a: cue('a', 79), b: cue('b', 167)});
const Lock: React.FC<{x: number; y: number; label: string; f: number; at: number}> = ({x, y, label, f, at}) => {
  const brk = ramp(f, at, at + 10), inn = ramp(f, at + 12, at + 24);
  return <div style={{position: 'absolute', left: x, top: y, width: 240}}>
    <ContactShadow x={120} y={330} w={200} o={0.25} />
    <svg width={240} height={330} viewBox="0 0 240 330" style={{overflow: 'visible'}}>
      <path d="M60 130 V90 Q60 30 120 30 Q180 30 180 90 V130" fill="none" stroke={inn > 0.9 ? P.green : '#8C959F'} strokeWidth={22} strokeLinecap="round" />
      <rect x={30} y={120} width={180} height={190} rx={30} fill={inn > 0.9 ? P.green : '#D0D7DE'} stroke={P.ink} strokeWidth={6} />
      <rect x={40} y={128} width={160} height={40} rx={18} fill="#fff" opacity={0.35} />
      <circle cx={120} cy={210} r={18} fill={P.ink} /><rect x={112} y={214} width={16} height={46} rx={6} fill={P.ink} />
    </svg>
    {brk < 1 && <div style={{position: 'absolute', left: 50, top: 380, opacity: 1 - ramp(f, at + 6, at + 12)}}><Key w={140} c={P.red} broken={brk} /></div>}
    {inn > 0 && <div style={{position: 'absolute', left: 60, top: 380 - 120 * inn, opacity: clamp(inn * 3)}}><Key w={130} c={P.green} rot={-90 * inn} /></div>}
    <div style={{position: 'absolute', left: 0, top: -60, width: 240, textAlign: 'center', fontFamily: font, fontWeight: 900, fontSize: 48, color: P.ink}}>{label}</div>
  </div>;
};
const Rotate: Scene = ({f, cue}) => {
  const p = rotatePlan(cue);
  const trash = ramp(f, 14, 34);
  const cam = camAt(f, [[-1, {x: 450, y: 480, z: 1.05}, 1], [p.a - 8, {x: 450, y: 620, z: 1.0}, 16], [p.b - 6, {x: 450, y: 760, z: 1.08}, 14]]);
  return <>
    {stage(cam, <></>, <>
      {/* the branch goes in the bin — but the hook where the key hung is already empty */}
      <div style={{opacity: 1 - ramp(f, p.a - 10, p.a)}}>
        <div style={{position: 'absolute', left: 80 + 360 * trash, top: 160 + 120 * trash, transform: `scale(${1 - 0.6 * trash}) rotate(${trash * 30}deg)`, fontFamily: mono, fontWeight: 800, fontSize: 44, color: '#CF222E',
          border: '3px solid #CF222E', borderRadius: 12, padding: '4px 14px', background: '#FFEBE9', opacity: 1 - ramp(f, 34, 40)}}>ci-sync-a3f9c1</div>
        <svg width={160} height={190} viewBox="0 0 120 150" style={{position: 'absolute', left: 440, top: 230}}><path d="M10 20 H110 L98 146 H22 Z" fill="#D0D7DE" stroke={P.ink} strokeWidth={6} strokeLinejoin="round" />
          <rect x={2} y={8} width={116} height={18} rx={8} fill="#EAEEF2" stroke={P.ink} strokeWidth={6} /></svg>
        <div style={{position: 'absolute', left: 120, top: 520, width: 640, borderRadius: 22, border: `5px dashed #8C959F`, padding: '30px 0', textAlign: 'center', fontFamily: font, fontWeight: 900, fontSize: 52, color: '#57606A'}}>
          🔑 原来挂钥匙的地方：<span style={{color: '#CF222E'}}>空了</span></div>
        <Annot x={600} y={760} tx={520} ty={640} f={f} at={52} size={50} color="#CF222E">已经被拿走了</Annot>
      </div>
      <div style={{opacity: ramp(f, p.a - 8, p.a)}}>
        <Lock x={20} y={300} label="仓库" f={f} at={p.a + 2} />
        <Lock x={330} y={300} label="组织" f={f} at={p.a + 22} />
        <Lock x={640} y={300} label="环境" f={f} at={p.a + 42} />
      </div>
      <div style={{position: 'absolute', left: 170, top: 860, width: 560, height: 170, borderRadius: 22, background: '#fff', border: `5px solid ${P.ink}`, boxShadow: '0 14px 0 rgba(0,0,0,0.15)', padding: '22px 30px', boxSizing: 'border-box',
        opacity: ramp(f, p.b - 10, p.b - 2)}}>
        <div style={{fontFamily: font, fontWeight: 800, fontSize: 32, color: '#57606A'}}>Personal access token</div>
        <div style={{marginTop: 10, fontFamily: mono, fontWeight: 700, fontSize: 44, color: P.ink}}>ghp_••••••••••••</div>
      </div>
    </>)}
    <Stamp x={510} y={1010} f={f} at={p.b + 4} size={88} color="#CF222E" rot={-8}>已吊销</Stamp>
  </>;
};
Rotate.backdrop = backdrop(P.white, P.white, () => 0, true, 'Wiz Research · Respond');
Rotate.sfx = (cue) => {
  const p = rotatePlan(cue);
  return [{at: 14, kind: 'whoosh-short', gain: 0.08}, {at: 34, kind: 'thud', gain: 0.1}, ...[0, 1, 2].map((i) => ({at: p.a + 2 + i * 20, kind: 'block', gain: 0.08})), ...[0, 1, 2].map((i) => ({at: p.a + 24 + i * 20, kind: 'tick', gain: 0.1})),
    {at: p.b + 4, kind: 'stamp', gain: 0.2}];
};

/* ---------- 9 end: a short-lived fine-grained token instead of a long-lived personal one ---------- */

const endPlan = (cue: Cue) => ({a: cue('a', 66)});
const TokenCard: React.FC<{title: string; lines: string[]; good?: boolean; strike?: number}> = ({title, lines, good = false, strike = 0}) => (
  <div style={{position: 'relative', width: 400, borderRadius: 24, background: '#fff', border: `5px solid ${good ? P.green : P.ink}`, boxShadow: `0 14px 0 ${good ? '#1A7F37' : 'rgba(0,0,0,0.2)'}`, padding: '26px 28px', boxSizing: 'border-box',
    filter: strike > 0.5 ? 'grayscale(1)' : undefined, opacity: 1 - 0.4 * strike}}>
    <div style={{fontFamily: font, fontWeight: 900, fontSize: 44, color: P.ink}}>{title}</div>
    {lines.map((l) => <div key={l} style={{marginTop: 12, fontFamily: font, fontWeight: 700, fontSize: 34, color: '#57606A'}}>{l}</div>)}
    <div style={{position: 'absolute', left: -14, top: '48%', width: `${108 * strike}%`, height: 12, background: '#CF222E', borderRadius: 6, transform: 'rotate(-8deg)'}} />
  </div>
);
const End: Scene = ({f, cue}) => {
  const p = endPlan(cue);
  const cam = camAt(f, [[-1, {x: 450, y: 600, z: 1.0}, 1], [0, {x: 450, y: 560, z: 1.14}, 140]]);
  // in the order the line says them: the fine-grained token first (with its expiry tag), then the long-lived one is struck
  return <>
    {stage(cam, <></>, <>
      <Abs x={20} y={260}><In f={f} at={-6}><TokenCard good title="细粒度 token" lines={['只给 1 个仓库', '只读 / 按需权限']} /></In></Abs>
      <Tag x={220} y={590} f={f} at={14} w={320} color={P.green} ink={P.ink}>30 天到期</Tag>
      <Abs x={480} y={260}><In f={f} at={p.a - 10}><TokenCard title="长期个人 token" lines={['能碰你所有仓库', '不过期']} strike={ramp(f, p.a, p.a + 12)} /></In></Abs>
      <Abs x={0} y={940}><In f={f} at={p.a + 16}><div style={{fontFamily: font, fontSize: 30, color: '#57606A'}}>GitHub Docs：尽量用 fine-grained token，可限定仓库、权限和过期时间</div></In></Abs>
    </>)}
  </>;
};
End.backdrop = backdrop(P.white, P.white, () => 0, true, 'Wiz Research · Harden');
End.sfx = (cue) => {
  const p = endPlan(cue);
  return [{at: 0, kind: 'pop', gain: 0.08}, {at: 14, kind: 'chime', gain: 0.08}, {at: p.a - 10, kind: 'pop', gain: 0.1}, {at: p.a, kind: 'paper', gain: 0.1}];
};

/** Cover anchor (880 × 800, rendered at f = 0): the log with the red base32 lines, stamped 你的密钥, the ghost beside it. */
const Cover: Scene = () => <>
  <Abs x={0} y={40}><Win w={880} title="Actions · sync-check"><div style={{padding: '26px 30px', fontFamily: mono, fontWeight: 700, fontSize: 38, color: P.red, lineHeight: 1.45}}>{B32.map((r) => <div key={r}>{r}</div>)}</div></Win></Abs>
  <Stamp x={440} y={330} f={30} at={0} size={120} color={P.red} rot={-8}>你的密钥</Stamp>
  <Ghost f={0} x={720} y={760} s={1.3} look={-1} grin />
</>;

export const gheistGithubSecretsScenes: Record<string, Scene> = {
  'ghs.hook': Hook, 'ghs.scale': Scale, 'ghs.plant': Plant, 'ghs.mask': Mask, 'ghs.erase': Erase, 'ghs.hold': Hold, 'ghs.check': Check, 'ghs.rotate': Rotate, 'ghs.end': End,
  'ghs.cover': Cover,
};
