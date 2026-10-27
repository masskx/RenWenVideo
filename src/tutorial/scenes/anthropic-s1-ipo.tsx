import React from 'react';
import {Img, staticFile} from 'remotion';
import {clamp, ease, hash} from '../../fx';
import {font, mono} from '../theme';
import {Cue, Scene} from '../paper';
import {Cam2, ContactShadow, Ground, HandRing, Layer, Roll, Stamp, camAt, hand, pop, ramp} from '../props';

// anthropic-s1-ipo: Anthropic's SEC Form S-1 (filed 2026-10-26), 30 s. From inputs/anthropic-s1-ipo/ (materials.md,
// sources.md, review.md, REVIEW-DOUYIN.md). Case A (S-1 page screenshots). Storyboard: tutorials/anthropic-s1-ipo.storyboard.md.
// - review: S-1 table values only ($16,286M / $(80,748)M / $(72,388)M / $1,618M / $(693)M); no $965B; no offer size or
//   price; GAAP net loss (mostly a non-cash fair-value change) kept apart from Non-GAAP adjusted operating income — never
//   "profitable"; "applied to list", not "listed".
// - One object: the prospectus. The loss is a slip made of two sheets; the 72.4 B sheet is tracing paper and lifts off.
// - Colours from the S-1 pages: paper #FFFFFF, ink #000, table shading #ECEBE3, the preliminary-prospectus warning red
//   #DE1A1E (= loss), the link blue #0000FF (= the company's own measure).
// Stage 900 × 1080 (frame "full"); the ground and header are each scene's backdrop (1080 × 1920).

const P = {paper: '#FFFFFF', ink: '#000000', table: '#ECEBE3', red: '#DE1A1E', blue: '#0000FF', desk: '#17171A', deskHi: '#2A2A30', muted: '#6B6B70', white: '#FFFFFF'};
const IMG = (n: string) => staticFile(`images/tutorials/anthropic-s1-ipo/${n}.jpg`);

const backdrop = (dark: boolean): Scene['backdrop'] => {
  const B: NonNullable<Scene['backdrop']> = ({f}) => <>
    <Ground a={dark ? P.desk : P.table} b={dark ? P.desk : P.table} k={0} t={f / 30} light={dark ? 'rgba(255,255,255,0.07)' : undefined} horizon={dark ? undefined : 1010} grain={dark ? 0.35 : 0.6} />
    <div style={{position: 'absolute', left: 72, right: 72, top: 92, display: 'flex', justifyContent: 'space-between', fontFamily: font, fontWeight: 700, fontSize: 28,
      color: dark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)', letterSpacing: 1}}>
      <span>AI 新闻 · 公司</span><span style={{fontWeight: 500, fontSize: 24}}>据 SEC Form S-1 · 2026-10-26</span>
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
const stage = (cam: Cam2, mid: React.ReactNode, far?: React.ReactNode) => <>
  {far && <Layer cam={cam} depth={0.35}>{far}</Layer>}
  <Layer cam={cam} depth={1}>{mid}</Layer>
</>;
/** A sheet of the prospectus lying on the desk: white paper, a soft shadow, a slight tilt. */
const Sheet: React.FC<{x: number; y: number; w: number; h: number; rot?: number; children?: React.ReactNode}> = ({x, y, w, h, rot = -1.5, children}) => <>
  <ContactShadow x={x + w / 2} y={y + h} w={w * 0.95} o={0.35} />
  <div style={{position: 'absolute', left: x, top: y, width: w, height: h, transform: `rotate(${rot}deg)`, background: P.paper, boxShadow: '0 30px 60px rgba(0,0,0,0.45), 0 2px 0 rgba(0,0,0,0.1)',
    overflow: 'hidden'}}>{children}</div>
</>;
/** A screenshot of the S-1 with the source label. */
const Shot: React.FC<{src: string; w: number; label?: boolean}> = ({src, w, label = true}) => <div style={{width: w}}>
  <Img src={src} style={{width: '100%', display: 'block'}} />
  {label && <div style={{marginTop: 6, textAlign: 'right', fontFamily: font, fontSize: 22, color: P.muted}}>SEC Form S-1｜原文</div>}
</div>;
/** Faint body text lines (the rest of a page, not meant to be read). */
const Lines: React.FC<{n: number; w: number; gap?: number}> = ({n, w, gap = 26}) => <>{Array.from({length: n}, (_, i) =>
  <div key={i} style={{height: 9, width: w * (0.75 + 0.25 * hash(i * 3.1)), background: '#D9D9D6', borderRadius: 4, marginBottom: gap - 9}} />)}</>;

/* ---------- 1 hook: −80.7 B in half a year; it filed to go public anyway ---------- */

const hookPlan = (cue: Cue) => ({a: cue('a', 64)});
const Hook: Scene = ({f, cue}) => {
  const p = hookPlan(cue);
  const cam = camAt(f, [[-1, {x: 450, y: 560, z: 1.04}, 1], [0, {z: 1.1}, p.a], [p.a, {z: 1.0, y: 540}, 16]]);
  return <>
    {stage(cam, <>
      <Sheet x={40} y={120} w={820} h={880} rot={-1.5}>
        <div style={{padding: '34px 40px'}}>
          <Shot src={IMG('s1-cover-head')} w={740} label={false} />
          <div style={{marginTop: 50, fontFamily: font, fontWeight: 700, fontSize: 34, color: P.muted}}>2026 上半年 · 净亏损</div>
          <div style={{marginTop: 4}}><Roll f={f} start={-40} land={-2} to={807} prefix="−" unit="亿美元" size={190} color={P.red} sep={false} style={{letterSpacing: -4}} /></div>
          <div style={{marginTop: 10, fontFamily: mono, fontSize: 30, color: P.muted}}>Net loss  $(80,748) million</div>
          <div style={{marginTop: 46}}><Lines n={9} w={740} /></div>
        </div>
      </Sheet>
    </>)}
    <Stamp x={640} y={860} f={f} at={p.a} size={80} color={P.red} rot={-9}>S-1 已递交</Stamp>
  </>;
};
Hook.backdrop = backdrop(true);
Hook.sfx = (cue) => {
  const p = hookPlan(cue);
  return [{at: 0, kind: 'thud', gain: 0.14}, {at: p.a, kind: 'stamp', gain: 0.2}];
};

/* ---------- 2 ticker: ANT; the IPO price line is still blank ---------- */

const tickerPlan = (cue: Cue) => ({a: cue('a', 27), b: cue('b', 60)});
const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const Flap: React.FC<{f: number; at: number; ch: string; i: number}> = ({f, at, ch, i}) => {
  const settle = at + 8 + i * 5, spinning = f < settle;
  const shown = spinning ? LETTERS[Math.floor(hash(Math.floor(f / 2) + i * 7) * 26)] : ch;
  return <div style={{position: 'relative', width: 220, height: 300, borderRadius: 18, background: 'linear-gradient(180deg, #2B2B31 0, #1E1E23 50%, #17171B 50%, #232328 100%)',
    boxShadow: '0 20px 30px rgba(0,0,0,0.5), inset 0 2px 0 rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontFamily: font, fontWeight: 900, fontSize: 230, color: spinning ? '#9A9AA2' : P.white, transform: f < at ? 'scaleY(0.02)' : undefined}}>
    {shown}
    <div style={{position: 'absolute', left: 0, right: 0, top: 149, height: 3, background: '#0B0B0D'}} />
  </div>;
};
const Ticker: Scene = ({f, cue}) => {
  const p = tickerPlan(cue);
  const cam = camAt(f, [[-1, {x: 450, y: 420, z: 1.0}, 1], [p.a - 4, {x: 450, y: 700, z: 1.1}, 14]]);
  return <>
    {stage(cam, <>
      <Abs x={90} y={100}><div style={{display: 'flex', gap: 30}}>{['A', 'N', 'T'].map((c, i) => <Flap key={c} f={f} at={-6} ch={c} i={i} />)}</div></Abs>
      <Abs x={90} y={440} w={720} style={{textAlign: 'center'}}><In f={f} at={10}><div style={{fontFamily: font, fontWeight: 800, fontSize: 40, color: 'rgba(255,255,255,0.8)'}}>Nasdaq Global Select · 已申请</div></In></Abs>
      <Abs x={0} y={600}><In f={f} at={p.a - 6} dy={60}>
        <div style={{background: P.paper, padding: '22px 20px 16px', boxShadow: '0 24px 40px rgba(0,0,0,0.5)', transform: 'rotate(-1deg)'}}>
          <Shot src={IMG('s1-cover-price')} w={860} />
        </div>
      </In></Abs>
      {/* the blank price, enlarged */}
      <Abs x={60} y={790}><In f={f} at={p.b - 6}><div style={{fontFamily: mono, fontWeight: 800, fontSize: 92, color: P.white}}>
        $ <span style={{color: P.red}}>{Math.floor(f / 8) % 2 ? '▁▁' : '  '}</span> — $ <span style={{color: P.red}}>{Math.floor(f / 8) % 2 ? '▁▁' : '  '}</span></div></In></Abs>
      <svg width={900} height={1080} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
        <HandRing cx={450} cy={850} rx={420} ry={95} p={ramp(f, p.b, p.b + 14)} color={P.red} sw={8} />
      </svg>
    </>)}
  </>;
};
Ticker.backdrop = backdrop(true);
Ticker.sfx = (cue) => {
  const p = tickerPlan(cue);
  return [...[0, 1, 2].map((i) => ({at: 2 + i * 5, kind: 'tick', gain: 0.1})), {at: p.a - 6, kind: 'paper', gain: 0.1}, {at: p.b, kind: 'fs-wind-click', gain: 0.08}];
};

/* ---------- 3 revenue: H1 2025 $1,163M → H1 2026 $16,286M, +1,300 % ---------- */

const revenuePlan = (cue: Cue) => ({a: cue('a', 63)});
const Revenue: Scene = ({f, cue}) => {
  const p = revenuePlan(cue);
  const grow = ease.outCubic(ramp(f, 4, 34));
  const H = 760, small = H * 1163 / 16286;
  const cam = camAt(f, [[-1, {x: 450, y: 700, z: 1.06}, 1], [6, {x: 450, y: 480, z: 1.0}, 30]]);
  return <>
    {stage(cam, <>
      <div style={{position: 'absolute', left: 0, top: 1000, width: 900, height: 4, background: P.ink}} />
      {/* H1 2025 */}
      <div style={{position: 'absolute', left: 120, top: 1000 - small, width: 220, height: small, background: '#B9B7AE', border: `4px solid ${P.ink}`, boxSizing: 'border-box'}} />
      <Abs x={110} y={1000 - small - 70} w={240} style={{textAlign: 'center', fontFamily: font, fontWeight: 900, fontSize: 48}}>11.6亿</Abs>
      <Abs x={110} y={1016} w={240} style={{textAlign: 'center', fontFamily: font, fontWeight: 700, fontSize: 32, color: P.muted}}>2025 上半年</Abs>
      {/* H1 2026 */}
      <div style={{position: 'absolute', left: 520, top: 1000 - H * grow, width: 260, height: H * grow, background: `linear-gradient(90deg, #000 0, #2A2A2A 100%)`, boxShadow: '0 20px 40px rgba(0,0,0,0.3)'}} />
      <Abs x={470} y={1000 - H * grow - 120} w={360} style={{textAlign: 'center'}}><Roll f={f} start={4} land={34} to={163} unit="亿美元" size={96} color={P.ink} sep={false} /></Abs>
      <Abs x={500} y={1016} w={300} style={{textAlign: 'center', fontFamily: font, fontWeight: 700, fontSize: 32, color: P.muted}}>2026 上半年</Abs>
      {/* the jump */}
      <svg width={900} height={1080} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
        <path d={`M240 ${1000 - small - 90} Q330 ${700} 480 ${420}`} fill="none" stroke={P.ink} strokeWidth={8} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - ramp(f, p.a - 6, p.a + 6)} />
        <path d="M455 400 L485 418 L462 446" fill="none" stroke={P.ink} strokeWidth={8} strokeLinecap="round" strokeLinejoin="round" opacity={ramp(f, p.a + 4, p.a + 6)} />
      </svg>
      <Abs x={30} y={250}><In f={f} at={p.a}><Roll f={f} start={p.a} land={p.a + 18} to={1300} prefix="+" unit="%" size={120} color={P.ink} sep={false} /></In></Abs>
    </>)}
    <Abs x={0} y={1040}><div style={{fontFamily: font, fontSize: 24, color: P.muted}}>收入 Revenue · 据 S-1：$1,163M → $16,286M</div></Abs>
  </>;
};
Revenue.backdrop = backdrop(false);
Revenue.sfx = (cue) => {
  const p = revenuePlan(cue);
  return [{at: 4, kind: 'whoosh', gain: 0.08}, {at: 34, kind: 'pop', gain: 0.1}, {at: p.a, kind: 'whoosh-short', gain: 0.08}, {at: p.a + 18, kind: 'pop', gain: 0.1}];
};

/* ---------- 4 loss: of the 80.7 B, 72.4 B is the convertible notes revalued — the tracing paper lifts off (signature) ---------- */

const lossPlan = (cue: Cue) => ({a: cue('a', 52), b: cue('b', 179)});
const Loss: Scene = ({f, cue}) => {
  const p = lossPlan(cue);
  const lift = ramp(f, p.a + 30, p.b - 10);
  const cam = camAt(f, [[-1, {x: 450, y: 560, z: 1.0}, 1], [p.a - 4, {x: 450, y: 520, z: 1.08}, 16], [p.b - 10, {x: 450, y: 600, z: 0.98}, 20]]);
  return <>
    {stage(cam, <>
      {/* the slip: the whole net loss */}
      <ContactShadow x={450} y={860} w={760} o={0.5} />
      <div style={{position: 'absolute', left: 60, top: 380, width: 780, height: 470, background: P.paper, borderTop: `14px solid ${P.red}`, boxShadow: '0 30px 60px rgba(0,0,0,0.5)', padding: '30px 40px', boxSizing: 'border-box'}}>
        <div style={{fontFamily: font, fontWeight: 700, fontSize: 34, color: P.muted}}>2026 上半年 · 净亏损（会计准则）</div>
        <div style={{fontFamily: font, fontWeight: 900, fontSize: 170, color: P.red, letterSpacing: -4, lineHeight: 1.1, opacity: 1 - 0.6 * lift, filter: `grayscale(${lift})`}}>−807<span style={{fontSize: 64}}>亿</span></div>
        <div style={{marginTop: 18, fontFamily: mono, fontSize: 28, color: P.muted}}>Net loss $(80,748)M</div>
        {/* what remains once the sheet is gone: the rest, unlabelled */}
        <div style={{position: 'absolute', left: 40, right: 40, bottom: 34, height: 26, background: '#F3D4D5', borderRadius: 4, opacity: lift}} />
      </div>
      {/* the tracing paper: the fair-value change, lifting off */}
      <div style={{position: 'absolute', left: 90, top: 410, width: 720, height: 380, transformOrigin: '100% 0', opacity: f < p.a - 6 ? 0 : 1 - ramp(f, p.b + 10, p.b + 30),
        transform: `translate(${lift * 260}px, ${-lift * 420}px) rotate(${lift * 24}deg) scale(${pop(f, p.a - 6, 10) < 0 ? 0.8 : 0.9 + 0.1 * Math.max(0, pop(f, p.a - 6, 10))})`}}>
        <div style={{position: 'absolute', inset: 0, background: 'rgba(235,240,248,0.82)', border: '3px solid rgba(120,130,150,0.6)', boxShadow: `0 ${10 + 40 * lift}px ${20 + 50 * lift}px rgba(0,0,0,${0.15 + 0.25 * lift})`,
          backdropFilter: 'blur(1px)', padding: '28px 34px', boxSizing: 'border-box'}}>
          <div style={{fontFamily: font, fontWeight: 900, fontSize: 120, color: '#7A2A2C', letterSpacing: -3}}>−724<span style={{fontSize: 52}}>亿</span></div>
          <div style={{fontFamily: font, fontWeight: 800, fontSize: 40, color: P.ink, lineHeight: 1.35}}>可转债等按估值重算<br /><span style={{color: P.red}}>非现金</span></div>
          <div style={{marginTop: 8, fontFamily: mono, fontSize: 24, color: P.muted}}>Change in fair value $(72,388)M</div>
        </div>
        {/* the corner being lifted */}
        <div style={{position: 'absolute', right: -6, bottom: -6, width: 70, height: 70, background: 'linear-gradient(135deg, transparent 50%, rgba(0,0,0,0.15) 50%)', opacity: ramp(f, p.a + 10, p.a + 30)}} />
      </div>
      {/* ≠ cash */}
      <Abs x={160} y={900}><In f={f} at={p.b}>
        <div style={{display: 'flex', alignItems: 'center', gap: 26}}>
          <svg width={150} height={90} viewBox="0 0 150 90"><rect x={6} y={10} width={138} height={70} rx={10} fill="#3C8D5A" stroke={P.white} strokeWidth={5} /><circle cx={75} cy={45} r={18} fill="none" stroke={P.white} strokeWidth={5} />
            <path d="M14 82 L136 8" stroke={P.red} strokeWidth={10} strokeLinecap="round" /></svg>
          <div style={{fontFamily: font, fontWeight: 900, fontSize: 64, color: P.white}}>≠ 烧掉的现金</div>
        </div>
      </In></Abs>
    </>)}
    <Abs x={0} y={1040}><div style={{fontFamily: font, fontSize: 24, color: 'rgba(255,255,255,0.5)'}}>据 S-1 脚注：主要因估值上升</div></Abs>
  </>;
};
Loss.backdrop = backdrop(true);
Loss.sfx = (cue) => {
  const p = lossPlan(cue);
  return [{at: 0, kind: 'thud', gain: 0.1}, {at: p.a - 6, kind: 'paper', gain: 0.1}, {at: p.a + 30, kind: 'fs-paper-slide', gain: 0.14}, {at: p.b, kind: 'pop', gain: 0.1}];
};

/* ---------- 5 adjusted: the company's measure +1.6 B vs GAAP operating loss −0.69 B ---------- */

const adjustedPlan = (cue: Cue) => ({a: cue('a', 30), b: cue('b', 120)});
const Row: React.FC<{label: string; sub: string; value: React.ReactNode; color: string; f: number; at: number}> = ({label, sub, value, color, f, at}) => <In f={f} at={at} dy={50}>
  <div style={{width: 400, height: 470, background: P.paper, border: `5px solid ${P.ink}`, boxShadow: '0 16px 0 rgba(0,0,0,0.15)', padding: '28px 26px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column'}}>
    <div style={{fontFamily: font, fontWeight: 900, fontSize: 40, color: P.ink, lineHeight: 1.2}}>{label}</div>
    <div style={{marginTop: 8, fontFamily: mono, fontSize: 24, color: P.muted}}>{sub}</div>
    <div style={{flex: 1}} />
    <div style={{fontFamily: font, fontWeight: 900, fontSize: 116, color, letterSpacing: -3, lineHeight: 1}}>{value}<span style={{fontSize: 46}}>亿</span></div>
  </div>
</In>;
const Adjusted: Scene = ({f, cue}) => {
  const p = adjustedPlan(cue);
  const cam = camAt(f, [[-1, {x: 300, y: 600, z: 1.04}, 1], [0, {x: 260, y: 560, z: 1.2}, p.b - 10], [p.b - 8, {x: 450, y: 560, z: 1.0}, 16]]);
  return <>
    {stage(cam, <>
      <Abs x={40} y={300}><Row f={f} at={-4} label="调整后营业利润" sub="公司口径 · Non-GAAP · $1,618M" color={P.blue}
        value={<span style={{display: 'inline-block', textShadow: `0 0 ${30 * ramp(f, p.a, p.a + 20)}px rgba(0,0,255,0.35)`}}>+{Math.round(16 * ease.outCubic(ramp(f, p.a - 6, p.a + 14)))}</span>} /></Abs>
      <Abs x={460} y={300}><Row f={f} at={p.b - 6} label="营业亏损" sub="会计准则 · GAAP · $(693)M" value="−6.9" color={P.red} /></Abs>
      <Abs x={0} y={800} w={900} style={{textAlign: 'center'}}><In f={f} at={p.b + 4}><div style={{fontFamily: hand, fontSize: 52, color: P.ink}}>剔除股权激励等，才是正的</div></In></Abs>
    </>)}
    <Stamp x={690} y={250} f={f} at={p.b + 16} size={64} color={P.red} rot={8}>不是盈利</Stamp>
  </>;
};
Adjusted.backdrop = backdrop(false);
Adjusted.sfx = (cue) => {
  const p = adjustedPlan(cue);
  return [{at: p.a - 4, kind: 'pop', gain: 0.1}, {at: p.b - 6, kind: 'pop', gain: 0.1}, {at: p.b + 16, kind: 'stamp', gain: 0.16}];
};

/* ---------- 6 end: how much a share? still blank ---------- */

const endPlan = (cue: Cue) => ({a: cue('a', 32)});
const End: Scene = ({f}) => {
  const cam = camAt(f, [[-1, {x: 450, y: 540, z: 1.0}, 1], [0, {z: 1.14}, 100]]);
  const blink = Math.floor(f / 7) % 2 === 0;
  return <>
    {stage(cam, <>
      <Sheet x={40} y={260} w={820} h={520} rot={-1}>
        <div style={{padding: '34px 40px'}}>
          <div style={{fontFamily: font, fontWeight: 700, fontSize: 32, color: P.muted}}>Initial public offering price · 每股发行价</div>
          <div style={{marginTop: 40, fontFamily: mono, fontWeight: 800, fontSize: 150, color: P.ink, letterSpacing: -4}}>
            $<span style={{display: 'inline-block', width: 330, borderBottom: `10px solid ${P.red}`, marginLeft: 20, verticalAlign: 'bottom', height: 120}}>
              {blink && <span style={{display: 'inline-block', width: 12, height: 110, background: P.ink, marginLeft: 20}} />}</span></div>
          <div style={{marginTop: 50, fontFamily: font, fontWeight: 700, fontSize: 30, color: P.muted}}>预披露稿 · 待定</div>
        </div>
      </Sheet>
    </>)}
  </>;
};
End.backdrop = backdrop(true);
End.sfx = (cue) => {
  const p = endPlan(cue);
  return [{at: 0, kind: 'paper', gain: 0.08}, {at: p.a, kind: 'tick', gain: 0.08}];
};

/** Cover anchor (880 × 800, rendered at f = 0): the S-1 sheet with −807亿美元 in red. */
const Cover: Scene = () => <>
  <div style={{position: 'absolute', left: 30, top: 40, width: 820, height: 720, transform: 'rotate(-1.5deg)', background: P.paper, boxShadow: '0 30px 60px rgba(0,0,0,0.45)', padding: '30px 40px', boxSizing: 'border-box'}}>
    <Img src={IMG('s1-cover-head')} style={{width: 740, display: 'block'}} />
    <div style={{marginTop: 40, fontFamily: font, fontWeight: 700, fontSize: 34, color: P.muted}}>2026 上半年 · 净亏损</div>
    <div style={{fontFamily: font, fontWeight: 900, fontSize: 190, color: P.red, letterSpacing: -4}}>−807<span style={{fontSize: 80}}>亿美元</span></div>
  </div>
</>;

export const anthropicS1IpoScenes: Record<string, Scene> = {
  's1.hook': Hook, 's1.ticker': Ticker, 's1.revenue': Revenue, 's1.loss': Loss, 's1.adjusted': Adjusted, 's1.end': End, 's1.cover': Cover,
};
