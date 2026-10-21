import React from 'react';
import {Img, OffthreadVideo, staticFile} from 'remotion';
import {font} from '../theme';
import {clamp, ease, springStep} from '../../fx';
import {Cue, S, Scene, cam, hitOf, phaseOp} from '../paper';
import {A, B, BG, Big, DIM, INK, LINE, Mono, PANEL, PANEL_HI, STEEL, mono} from '../tech';

// ai-digital-cleanup-cn: clean up your own accounts and personal data with AI, the China version (≈ 88 s, length override in the script).
// Script: inputs/ai-digital-cleanup-cn/script.md; storyboard: tutorials/ai-digital-cleanup-cn.storyboard.md. Narration is verbatim (two sentence
// breaks moved to scene cuts); every channel, path and number on screen comes from the script's verified table (§2).
// Every phone screen is a drawn mock tagged 「界面示意」 with all personal data shown as blurred blocks — never a real number or ID.
// Only the user's own data appears; no third-party site, no author handle. Logos sit on white tiles for identification only.
// The one stock clip (Pexels, end scene) carries 「Pexels 素材」 bottom-right. Accents: amber A (the step / key fact), cyan B (the safe path).

const W = 900;
const RED = '#ff5a5a';
const IMG = (n: string) => staticFile(`images/tutorials/ai-digital-cleanup-cn/${n}`);
const CLIP = (n: string) => staticFile(`video/ai-digital-cleanup-cn/${n}`);

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
/** A stamp that slams down on frame `at` (drop from 1.6× with a tilt, contact squash). */
const Stamp: React.FC<{f: number; at: number; c?: string; size?: number; deg?: number; children: React.ReactNode}> = ({f, at, c = A, size = 64, deg = -6, children}) => {
  if (f < at - 6) return null;
  const k = ease.inCubic(clamp((f - at + 6) / 6));
  const sq = hitOf(f, [at], 1);
  return <div style={{display: 'inline-block', transform: `rotate(${deg}deg) scale(${(1.6 - 0.6 * k) * (1 + 0.05 * sq)}, ${(1.6 - 0.6 * k) * (1 - 0.06 * sq)})`,
    opacity: clamp(k * 2), border: `6px solid ${c}`, color: c, background: 'rgba(12,26,44,0.92)', fontFamily: font, fontWeight: 900, fontSize: size,
    padding: '4px 22px', whiteSpace: 'nowrap'}}>{children}</div>;
};
/** White app-style tile with a logo inside (logos only identify the platform). */
const Tile: React.FC<{src: string; size?: number; pad?: number; bg?: string}> = ({src, size = 110, pad = 14, bg = '#fff'}) => (
  <div style={{width: size, height: size, borderRadius: size * 0.22, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none',
    padding: pad, boxSizing: 'border-box'}}>
    <Img src={IMG(src)} style={{maxWidth: '100%', maxHeight: '100%', objectFit: 'contain'}} />
  </div>
);
/** Blurred personal data: grey pills, never characters. */
const Blur: React.FC<{w: number; h?: number; c?: string}> = ({w, h = 34, c = STEEL}) => (
  <span style={{display: 'inline-block', width: w, height: h, borderRadius: h / 2, background: c, opacity: 0.55, filter: 'blur(3px)', verticalAlign: 'middle'}} />
);
const typed = (text: string, f: number, at: number, cps = 0.5) => [...text].slice(0, Math.max(0, Math.floor((f - at) * cps))).join('');
const Caret: React.FC<{f: number}> = ({f}) => <span style={{color: B, opacity: Math.floor(f / 8) % 2 ? 1 : 0.2}}>▍</span>;
/** Step title: "第一步：" in dim, the action in ink / amber. */
const Title: React.FC<{k?: string; t: React.ReactNode; size?: number}> = ({k, t, size = 76}) => (
  <Abs y={-6} w={W}><div style={{fontFamily: font, fontWeight: 900, fontSize: size, lineHeight: 1.15, color: INK, whiteSpace: 'nowrap'}}>
    {k && <span style={{color: DIM}}>{k}</span>}{t}</div></Abs>
);
/** A drawn phone screen; mocks are tagged so nobody mistakes them for a real capture. */
const Phone: React.FC<{x: number; y: number; w: number; h: number; c?: string; children: React.ReactNode}> = ({x, y, w, h, c = STEEL, children}) => (
  <Abs x={x} y={y} w={w} h={h}>
    <div style={{position: 'absolute', inset: 0, borderRadius: 48, border: `6px solid ${c}`, background: '#081321', overflow: 'hidden'}}>
      <div style={{position: 'absolute', left: '50%', top: 14, width: 120, height: 22, marginLeft: -60, borderRadius: 11, background: PANEL_HI}} />
      <div style={{position: 'absolute', left: 30, right: 30, top: 60, bottom: 30}}>{children}</div>
    </div>
    <div style={{position: 'absolute', right: -12, top: -26, background: BG, border: `3px solid ${DIM}`, color: DIM, fontFamily: font, fontWeight: 800, fontSize: 32,
      padding: '0 10px'}}>界面示意</div>
  </Abs>
);
const SearchBar: React.FC<{f: number; text: string; at: number; ph?: string}> = ({f, text, at, ph = '搜索'}) => {
  const shown = typed(text, f, at, 0.45);
  return <div style={{height: 88, borderRadius: 44, background: PANEL_HI, display: 'flex', alignItems: 'center', gap: 14, padding: '0 28px', fontFamily: font, fontWeight: 800,
    fontSize: 44, color: shown ? INK : DIM, whiteSpace: 'nowrap'}}>
    <svg width={40} height={40} viewBox="0 0 40 40"><circle cx={17} cy={17} r={12} fill="none" stroke={DIM} strokeWidth={4} /><path d="M26 26 L36 36" stroke={DIM} strokeWidth={4} strokeLinecap="round" /></svg>
    {shown || ph}{f >= at && shown.length < [...text].length && <Caret f={f} />}
  </div>;
};
/** One row in a mock list; `on` lights it and adds a tap ring. */
const Row: React.FC<{f: number; on?: number; children: React.ReactNode}> = ({f, on = -1, children}) => {
  const lit = on >= 0 && f >= on;
  const ring = lit ? clamp((f - on) / 14) : 0;
  return <div style={{position: 'relative', height: 92, display: 'flex', alignItems: 'center', gap: 18, padding: '0 22px', borderRadius: 16, fontFamily: font, fontWeight: 800,
    fontSize: 44, color: lit ? BG : INK, background: lit ? A : PANEL, marginBottom: 14, whiteSpace: 'nowrap'}}>
    {children}
    {lit && ring < 1 && <div style={{position: 'absolute', right: 40, top: 46 - 40 * ring, width: 80 * ring, height: 80 * ring, marginRight: -40 * ring, borderRadius: '50%',
      border: `4px solid ${INK}`, opacity: 1 - ring}} />}
  </div>;
};

/* ---------- 1 hook: one phone number, lines out to two dozen forgotten accounts ---------- */

const hookPlan = (cue: Cue) => ({a: cue('a', 28), b: cue('b', 84)});
const RING = 25, CX = 450, CY = 640, R = 350;
const GLYPHS = ['circle', 'square', 'tri', 'bubble', 'bars'];
const Glyph: React.FC<{k: string; c: string}> = ({k, c}) => (k === 'circle' ? <circle cx={0} cy={0} r={13} fill="none" stroke={c} strokeWidth={5} />
  : k === 'square' ? <rect x={-12} y={-12} width={24} height={24} rx={4} fill="none" stroke={c} strokeWidth={5} />
  : k === 'tri' ? <path d="M0 -14 L13 10 L-13 10 Z" fill="none" stroke={c} strokeWidth={5} strokeLinejoin="round" />
  : k === 'bubble' ? <path d="M-14 -10 H14 V8 H-2 L-9 15 V8 H-14 Z" fill="none" stroke={c} strokeWidth={5} strokeLinejoin="round" />
  : <g stroke={c} strokeWidth={5} strokeLinecap="round"><path d="M-12 -8 H12" /><path d="M-12 0 H12" /><path d="M-12 8 H4" /></g>);
const HubRing: React.FC<{f: number; n: number; forget: number; land: number; count: string}> = ({f, n, forget, land, count}) => {
  const sq = hitOf(f, [land], 1);
  return <svg width={W} height={1080} viewBox={`0 0 ${W} 1080`} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
    {Array.from({length: RING}, (_, i) => {
      const ang = -Math.PI / 2 + (i / RING) * Math.PI * 2;
      const x = CX + R * Math.cos(ang), y = CY + R * 0.92 * Math.sin(ang);
      const grow = clamp(n - i);
      if (grow <= 0) return null;
      const tile = clamp((n - i - 0.6) / 0.4);
      // two tiles in three are "forgotten": they dim and get a question mark from the cue on
      const lost = i % 3 !== 0 && forget > 0;
      const c = lost ? DIM : B;
      return <g key={i}>
        <line x1={CX} y1={CY} x2={CX + (x - CX) * grow} y2={CY + (y - CY) * grow} stroke={c} strokeWidth={3} opacity={lost ? 0.35 + 0.4 * (1 - forget) : 0.8} />
        {tile > 0 && <g transform={`translate(${x} ${y}) scale(${0.5 + 0.5 * ease.outBack(tile, 1.6)})`} opacity={lost ? 1 - 0.45 * forget : 1}>
          <rect x={-34} y={-34} width={68} height={68} rx={16} fill={PANEL} stroke={c} strokeWidth={3} />
          <Glyph k={GLYPHS[i % GLYPHS.length]} c={c} />
          {lost && forget > 0 && <text x={26} y={-22} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={34} fill={A} opacity={forget}>?</text>}
        </g>}
      </g>;
    })}
    <g transform={`translate(${CX} ${CY}) scale(${1 + 0.04 * sq} ${1 - 0.05 * sq})`}>
      <rect x={-125} y={-185} width={250} height={370} rx={34} fill={BG} stroke={INK} strokeWidth={6} />
      <rect x={-34} y={-170} width={68} height={14} rx={7} fill={PANEL_HI} />
      <text x={0} y={-90} textAnchor="middle" fontFamily={font} fontWeight={800} fontSize={40} fill={DIM}>手机号</text>
      <text x={0} y={40} textAnchor="middle" fontFamily={mono} fontWeight={800} fontSize={112} fill={A}>{count}</text>
      <text x={0} y={120} textAnchor="middle" fontFamily={font} fontWeight={800} fontSize={40} fill={DIM}>个账号</text>
    </g>
  </svg>;
};
const Hook: Scene = ({f, cue}) => {
  const p = hookPlan(cue);
  // tiles come out from frame 0 (three already there) and the last lands on "二十几个"
  const n = RING * clamp((f + 10) / (p.b + 6));
  const forget = clamp((f - p.a) / 12);
  const shown = Math.min(RING, Math.floor(n));
  return <Root>
    <Abs y={-6} w={W}><Big size={88} style={{whiteSpace: 'nowrap'}}>你的手机号</Big><Big size={88} c={A} style={{whiteSpace: 'nowrap'}}>绑了多少个账号？</Big></Abs>
    <HubRing f={f} n={n} forget={forget} land={p.b + 6} count={f >= p.b + 6 ? `${RING}?` : String(shown)} />
  </Root>;
};
Hook.sfx = (cue) => {
  const p = hookPlan(cue);
  return [0, 12, 24, 36, 48, 60, 72].map((at) => ({at, kind: 'tick', gain: 0.06})).concat([{at: p.a, kind: 'whoosh-short', gain: 0.08}, {at: p.b + 6, kind: 'tap', gain: 0.2}]);
};

/* ---------- 2 the original claim: 6 hours, 47 records, 12 old accounts (the creator's own numbers) ---------- */

const claimPlan = (cue: Cue) => ({a: cue('a', 30), b: cue('b', 62), c: cue('c', 112), d: cue('d', 150)});
const count = (f: number, at: number, to: number, dur = 20) => Math.round(to * ease.outCubic(clamp((f - at) / dur)));
const StatRow: React.FC<{f: number; at: number; y: number; n: number; unit: string; c: string; children: React.ReactNode}> = ({f, at, y, n, unit, c, children}) => (
  <Abs y={y} w={W} h={230}>
    <Pop f={f} at={at} style={{display: 'flex', alignItems: 'center', gap: 34, height: 230, borderLeft: `10px solid ${c}`, background: PANEL, paddingLeft: 34}}>
      <div style={{width: 190, height: 190, position: 'relative', flex: 'none'}}>{children}</div>
      <div style={{fontFamily: mono, fontWeight: 800, fontSize: 150, color: c, lineHeight: 1, minWidth: 190}}>{count(f, at, n)}</div>
      <Big size={64} style={{whiteSpace: 'nowrap'}}>{unit}</Big>
    </Pop>
  </Abs>
);
const Claim: Scene = ({f, cue}) => {
  const p = claimPlan(cue);
  const hand = clamp((f - p.a) / 30) * Math.PI * 2 * 1.5;
  return <Root>
    <Abs y={0} w={W}><Chip c={DIM} size={44}>据海外博主自述</Chip></Abs>
    <StatRow f={f} at={p.a} y={110} n={6} unit="小时" c={A}>
      <svg width={190} height={190} viewBox="-95 -95 190 190">
        <circle r={80} fill="none" stroke={INK} strokeWidth={8} />
        {Array.from({length: 12}, (_, i) => <line key={i} x1={0} y1={-66} x2={0} y2={-74} stroke={DIM} strokeWidth={5} transform={`rotate(${i * 30})`} />)}
        <line x1={0} y1={0} x2={52 * Math.sin(hand)} y2={-52 * Math.cos(hand)} stroke={A} strokeWidth={9} strokeLinecap="round" />
        <circle r={9} fill={A} />
      </svg>
    </StatRow>
    <StatRow f={f} at={p.b} y={370} n={47} unit="条个人记录" c={B}>
      {/* records: lines struck out one after another */}
      <svg width={190} height={190} viewBox="0 0 190 190">
        {[0, 1, 2, 3, 4].map((i) => {
          const s = clamp((f - p.b - 6 - i * 6) / 6);
          return <g key={i}><rect x={10} y={14 + i * 36} width={170} height={20} rx={6} fill={STEEL} opacity={0.5} />
            <line x1={4} x2={4 + 182 * s} y1={24 + i * 36} y2={24 + i * 36} stroke={RED} strokeWidth={8} strokeLinecap="round" /></g>;
        })}
      </svg>
    </StatRow>
    <StatRow f={f} at={p.c} y={630} n={12} unit="个旧账号" c={RED}>
      <svg width={190} height={190} viewBox="0 0 190 190">
        {Array.from({length: 12}, (_, i) => {
          const x = 8 + (i % 4) * 46, y = 22 + Math.floor(i / 4) * 52;
          const s = clamp((f - p.c - 4 - i * 2) / 5);
          return <g key={i}><rect x={x} y={y} width={36} height={36} rx={8} fill={PANEL_HI} stroke={DIM} strokeWidth={3} />
            {s > 0 && <path d={`M${x + 6} ${y + 6} L${x + 30} ${y + 30} M${x + 30} ${y + 6} L${x + 6} ${y + 30}`} stroke={RED} strokeWidth={5} strokeLinecap="round"
              strokeDasharray={70} strokeDashoffset={70 * (1 - s)} />}</g>;
        })}
      </svg>
    </StatRow>
    <Abs y={890} x={420} w={480}><Stamp f={f} at={p.d} c={A} size={72} deg={-5}>国内版 · 我教你</Stamp></Abs>
  </Root>;
};
Claim.sfx = (cue) => {
  const p = claimPlan(cue);
  return [{at: p.a, kind: 'tap', gain: 0.16}, {at: p.b, kind: 'tap', gain: 0.16}, {at: p.c, kind: 'tap', gain: 0.16}, {at: p.d, kind: 'stamp', gain: 0.18}];
};

/* ---------- 3 four steps, legal, only yourself ---------- */

const roadPlan = (cue: Cue) => ({a: cue('a', 10), b: cue('b', 30), c: cue('c', 52)});
const STEPS = ['查', '排', '删', '投诉'];
const Road: Scene = ({f, cue}) => {
  const p = roadPlan(cue);
  const lit = (i: number) => p.a + i * 5;
  const fill = clamp((f - p.a) / 18);
  return <Root>
    <Title t={<>一共 <span style={{color: A}}>4</span> 步</>} size={84} />
    <svg width={W} height={340} style={{position: 'absolute', left: 0, top: 170}}>
      <line x1={110} x2={790} y1={130} y2={130} stroke={LINE} strokeWidth={8} />
      <line x1={110} x2={110 + 680 * fill} y1={130} y2={130} stroke={A} strokeWidth={8} />
      {STEPS.map((s, i) => {
        const x = 110 + i * 226.7, on = f >= lit(i);
        const sq = hitOf(f, [lit(i)], 1);
        return <g key={s} transform={`translate(${x} 130) scale(${1 + 0.06 * sq} ${1 - 0.07 * sq})`}>
          <circle r={92} fill={on ? A : PANEL} stroke={on ? A : LINE} strokeWidth={6} />
          <text y={-26} textAnchor="middle" fontFamily={mono} fontWeight={800} fontSize={40} fill={on ? BG : DIM}>{`0${i + 1}`}</text>
          <text y={s.length > 1 ? 46 : 52} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={s.length > 1 ? 56 : 72} fill={on ? BG : INK}>{s}</text>
        </g>;
      })}
    </svg>
    <Abs y={600} w={W} style={{display: 'flex', justifyContent: 'center'}}><Pop f={f} at={p.b} origin="50% 50%"><Chip c={B} size={76} fill>全程合法</Chip></Pop></Abs>
    <Abs y={780} w={W} style={{display: 'flex', justifyContent: 'center'}}><Pop f={f} at={p.c} origin="50% 50%"><Chip c={A} size={76}>只查你自己</Chip></Pop></Abs>
  </Root>;
};
Road.sfx = (cue) => {
  const p = roadPlan(cue);
  return [0, 1, 2, 3].map((i) => ({at: p.a + i * 5, kind: 'tick', gain: 0.1})).concat([{at: p.b, kind: 'pop', gain: 0.12}, {at: p.c, kind: 'pop', gain: 0.12}]);
};

/* ---------- 4 step 1: 一证通查 inside WeChat (path verified in the script's §2) ---------- */

const checkPlan = (cue: Cue) => ({a: cue('a', 34), b: cue('b', 50), c: cue('c', 82), d: cue('d', 100), e: cue('e', 128), f: cue('f', 152), g: cue('g', 184),
  h: cue('h', 238), i: cue('i', 290)});
const CRUMBS = ['工信微报', '服务', '政务服务', '一证通查'];
const Check: Scene = ({f, cue}) => {
  const p = checkPlan(cue);
  const crumbAt = [p.b, p.c, p.d, p.e];
  const ph = [0, p.a, p.c, p.d, p.e, p.f, p.g, p.h, p.i];
  const at = (k: number) => phaseOp(f, ph[k], ph[k + 1] ?? 1e9);
  const buzz = f >= p.i ? 6 * Math.sin((f - p.i) * 1.6) * (1 - clamp((f - p.i) / 14)) : 0;
  return <Root>
    <Title k="第一步：" t={<span style={{color: A}}>一证通查</span>} />
    <Abs y={112} w={W} style={{display: 'flex', alignItems: 'center', gap: 8}}>
      {CRUMBS.map((c, i) => <React.Fragment key={c}>
        {i > 0 && f >= crumbAt[i] - 1 && <span style={{fontFamily: font, fontWeight: 900, fontSize: 40, color: DIM}}>›</span>}
        <Pop f={f} at={crumbAt[i]}><Chip c={i === 3 ? A : B} size={40} fill={i === 3}>{c}</Chip></Pop>
      </React.Fragment>)}
    </Abs>
    <Phone x={140} y={220} w={620} h={830} c={f >= p.i ? B : STEEL}>
      <div style={{position: 'absolute', inset: 0, transform: `translateX(${buzz}px)`}}>
        {/* 0: WeChat search */}
        <div style={{position: 'absolute', inset: 0, ...at(0)}}>
          <div style={{display: 'flex', justifyContent: 'center', marginTop: 40}}><Tile src="wechat-icon.png" size={150} pad={16} bg={PANEL_HI} /></div>
          <Big size={48} c={DIM} style={{textAlign: 'center', marginTop: 24}}>微信 · 搜一搜</Big>
          <div style={{marginTop: 50}}><SearchBar f={f} text="" at={1e9} /></div>
        </div>
        {/* a: typing the account name, the result row lights on 工信微报 */}
        <div style={{position: 'absolute', inset: 0, ...at(1)}}>
          <SearchBar f={f} text="工信微报" at={p.a + 2} />
          <div style={{marginTop: 30}}><Row f={f} on={p.b}>
            <div style={{width: 64, height: 64, borderRadius: 14, background: B}} />工信微报<span style={{marginLeft: 'auto', fontSize: 36, color: f >= p.b ? BG : DIM}}>公众号</span>
          </Row></div>
        </div>
        {/* c: the account's menu, 服务 */}
        <div style={{position: 'absolute', inset: 0, ...at(2)}}>
          <Big size={52} style={{marginBottom: 30}}>工信微报</Big>
          <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, display: 'flex', gap: 12}}>
            {['资讯', '服务', '互动'].map((t) => <div key={t} style={{flex: 1, height: 96, borderRadius: 16, background: t === '服务' && f >= p.c + 4 ? A : PANEL,
              color: t === '服务' && f >= p.c + 4 ? BG : INK, fontFamily: font, fontWeight: 900, fontSize: 44, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>{t}</div>)}
          </div>
        </div>
        {/* d: 政务服务 */}
        <div style={{position: 'absolute', inset: 0, ...at(3)}}>
          <Big size={48} c={DIM} style={{marginBottom: 24}}>服务</Big>
          <Row f={f}>工业和信息化</Row><Row f={f} on={p.d + 6}>政务服务</Row><Row f={f}>更多</Row>
        </div>
        {/* e: 一证通查 */}
        <div style={{position: 'absolute', inset: 0, ...at(4)}}>
          <Big size={48} c={DIM} style={{marginBottom: 24}}>政务服务</Big>
          <Row f={f} on={p.e + 6}>一证通查</Row><Row f={f}>其他服务</Row>
        </div>
        {/* f: 电话卡 | 互联网账号 */}
        <div style={{position: 'absolute', inset: 0, ...at(5)}}>
          <Big size={52} style={{marginBottom: 34}}>一证通查</Big>
          {(() => {
            const k = ease.inOutCubic(clamp((f - p.f - 4) / 10));
            return <div style={{position: 'relative', height: 100, borderRadius: 50, background: PANEL, display: 'flex'}}>
              <div style={{position: 'absolute', top: 6, bottom: 6, left: 6 + k * 274, width: 274, borderRadius: 44, background: A}} />
              {['电话卡', '互联网账号'].map((t, i) => <div key={t} style={{position: 'relative', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: font, fontWeight: 900, fontSize: 42, color: (i === 1 ? k > 0.5 : k <= 0.5) ? BG : INK}}>{t}</div>)}
            </div>;
          })()}
          <Big size={42} c={DIM} style={{marginTop: 40}}>查本人手机号关联的</Big>
          <Big size={42} c={DIM}>App 账号数量</Big>
        </div>
        {/* g: the form — every value blurred */}
        <div style={{position: 'absolute', inset: 0, ...at(6)}}>
          <Big size={52} style={{marginBottom: 30}}>互联网账号</Big>
          {[{l: '姓名', w: 150, at: p.g}, {l: '身份证后六位', w: 190, at: p.g + 14}, {l: '手机号', w: 300, at: p.g + 28}, {l: '验证码', w: 160, at: p.g + 40}].map((r) => (
            <div key={r.l} style={{height: 96, borderBottom: `3px solid ${LINE}`, display: 'flex', alignItems: 'center', gap: 20, fontFamily: font, fontWeight: 800,
              fontSize: 42, color: INK, whiteSpace: 'nowrap'}}>
              <span style={{width: 270}}>{r.l}</span>{f >= r.at && <Blur w={r.w * clamp((f - r.at) / 8)} />}
            </div>))}
        </div>
        {/* h: 48 hours */}
        <div style={{position: 'absolute', inset: 0, ...at(7), display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 70}}>
          <svg width={260} height={260} viewBox="-130 -130 260 260">
            <circle r={110} fill="none" stroke={LINE} strokeWidth={14} />
            <circle r={110} fill="none" stroke={A} strokeWidth={14} strokeDasharray={691} strokeDashoffset={691 * (1 - clamp((f - p.h) / 40))} transform="rotate(-90)" />
          </svg>
          <div style={{fontFamily: mono, fontWeight: 800, fontSize: 110, color: A, marginTop: -190}}>48</div>
          <Big size={48} style={{marginTop: 80}}>小时内 · 短信回复</Big>
        </div>
        {/* i: the SMS — count blurred */}
        <div style={{position: 'absolute', inset: 0, ...at(8)}}>
          <Mono size={40} c={DIM} w={800}>10699000</Mono>
          <div style={{marginTop: 20, background: PANEL_HI, borderRadius: '8px 34px 34px 34px', padding: '26px 30px', fontFamily: font, fontWeight: 800, fontSize: 46,
            lineHeight: 1.45, color: INK}}>
            您的手机号<br />关联账号 <Blur w={70} h={44} c={A} /> 个
          </div>
          <Pop f={f} at={p.i + 18}><div style={{marginTop: 40, border: `4px dashed ${B}`, padding: '14px 18px', fontFamily: font, fontWeight: 800, fontSize: 40,
            color: B, lineHeight: 1.35}}>覆盖 25 款 App<br />只给数量 · 明细去各平台查</div></Pop>
        </div>
      </div>
    </Phone>
  </Root>;
};
Check.sfx = (cue) => {
  const p = checkPlan(cue);
  return [{at: p.b, kind: 'tick', gain: 0.1}, {at: p.c + 4, kind: 'tick', gain: 0.1}, {at: p.d + 6, kind: 'tick', gain: 0.1}, {at: p.e + 6, kind: 'tick', gain: 0.1},
    {at: p.f + 4, kind: 'whoosh-short', gain: 0.06}, {at: p.h, kind: 'tap', gain: 0.12}, {at: p.i, kind: 'fs-phone-buzz', gain: 0.18}];
};

/* ---------- 5 云闪付「一键查卡」: only inside the app ---------- */

const cardPlan = (cue: Cue) => ({a: cue('a', 22), b: cue('b', 46), c: cue('c', 82), d: cue('d', 166), e: cue('e', 222)});
const BANKS = [{n: '银行 A', t: '借记卡'}, {n: '银行 B', t: '信用卡'}, {n: '银行 C', t: '借记卡', odd: true}];
const Card: Scene = ({f, cue}) => {
  const p = cardPlan(cue);
  // spotlight freeze on the warning: everything else dims while it lands
  const dim = clamp((f - p.d) / 8) * (1 - clamp((f - p.e) / 10)) * 0.6 + clamp((f - p.e) / 10) * 0.35;
  return <Root>
    <Title t={<>云闪付搜「<span style={{color: A}}>一键查卡</span>」</>} />
    <div style={{position: 'absolute', inset: 0, opacity: 1 - dim}}>
      <Abs y={130} w={W} style={{display: 'flex', alignItems: 'center', gap: 26}}>
        <Pop f={f} at={p.a - 10}><Tile src="yunshanfu-app.png" size={130} pad={6} /></Pop>
        <div style={{flex: 1}}><SearchBar f={f} text="一键查卡" at={p.b} ph="云闪付 · 搜索" /></div>
      </Abs>
      <Abs y={320} w={W}><Pop f={f} at={p.c} origin="50% 0%">
        <div style={{border: `4px solid ${STEEL}`, background: PANEL, padding: '22px 26px'}}>
          <div style={{display: 'flex', alignItems: 'baseline', gap: 16}}>
            <Big size={52}>名下银行卡</Big><span style={{fontFamily: font, fontWeight: 800, fontSize: 40, color: DIM, marginLeft: 'auto'}}>人脸 + 短信验证</span>
          </div>
          {BANKS.map((b, i) => {
            const at = p.c + 8 + i * 8;
            const odd = b.odd && f >= p.c + 40;
            return <div key={b.n} style={{marginTop: 18, height: 96, display: 'flex', alignItems: 'center', gap: 20, padding: '0 20px', background: odd ? 'rgba(255,90,90,0.16)' : PANEL_HI,
              border: `3px solid ${odd ? RED : 'transparent'}`, fontFamily: font, fontWeight: 800, fontSize: 44, color: INK, opacity: clamp((f - at) / 6), whiteSpace: 'nowrap'}}>
              <span>{b.n}</span><span style={{color: DIM}}>{b.t}</span><span style={{fontFamily: mono, color: DIM}}>****</span><Blur w={90} />
              {odd && <span style={{marginLeft: 'auto', color: RED, fontWeight: 900}}>不认识？</span>}
            </div>;
          })}
        </div>
      </Pop></Abs>
    </div>
    <Abs y={770} w={W} style={{display: 'flex', justifyContent: 'center'}}><Stamp f={f} at={p.d} c={A} size={70} deg={-3}>⚠ 只在云闪付App内</Stamp></Abs>
    {f >= p.e - 2 && <Abs y={950} w={W} style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 22}}>
      <Pop f={f} at={p.e} origin="50% 50%"><div style={{position: 'relative'}}>
        <Chip c={DIM} size={46}>“帮你查卡”的链接 / 电话</Chip>
        <div style={{position: 'absolute', left: -8, right: -8, top: '50%', height: 8, background: RED, transform: `scaleX(${clamp((f - p.e - 6) / 8)})`, transformOrigin: 'left'}} />
      </div></Pop>
      <Pop f={f} at={p.e + 14} origin="50% 50%"><Chip c={RED} size={52} fill>骗子</Chip></Pop>
    </Abs>}
  </Root>;
};
Card.sfx = (cue) => {
  const p = cardPlan(cue);
  return [{at: p.c, kind: 'whoosh-short', gain: 0.06}, {at: p.c + 40, kind: 'tick', gain: 0.1}, {at: p.d, kind: 'stamp', gain: 0.2}, {at: p.e + 6, kind: 'block', gain: 0.12}];
};

/* ---------- 6 step 2: dump everything into any AI, sort into three piles ---------- */

const sortPlan = (cue: Cue) => ({a: cue('a', 34), b: cue('b', 118), c: cue('c', 132), d: cue('d', 150), e: cue('e', 170)});
const APPS = ['外卖', '打车', '旧网盘', '旧论坛', '网购', '小游戏', '健身', '旧邮箱'];
const PILE = [0, 0, 1, 2, 0, 2, 1, 2];
const PILES = [{t: '在用', c: B}, {t: '半年没用', c: A}, {t: '完全不记得', c: RED}];
const ChatHead: React.FC = () => (
  <div style={{display: 'flex', alignItems: 'center', gap: 16, height: 96, padding: '0 22px', borderBottom: `3px solid ${LINE}`, background: PANEL_HI}}>
    <Tile src="claude-symbol.svg" size={64} pad={10} /><Tile src="doubao.jpg" size={64} pad={4} />
    <span style={{fontFamily: font, fontWeight: 900, fontSize: 42, color: INK, whiteSpace: 'nowrap'}}>任何大模型都行</span>
  </div>
);
const Chat: React.FC<{y?: number; h?: number; children: React.ReactNode}> = ({y = 110, h = 940, children}) => (
  <Abs y={y} w={W} h={h} style={{border: `4px solid ${STEEL}`, background: '#081321', overflow: 'hidden'}}>
    <ChatHead /><div style={{position: 'relative', padding: '22px 22px'}}>{children}</div>
  </Abs>
);
const UserMsg: React.FC<{f: number; at: number; children: React.ReactNode}> = ({f, at, children}) => (
  <Pop f={f} at={at} origin="100% 0%" style={{display: 'flex', justifyContent: 'flex-end'}}>
    <div style={{maxWidth: 760, background: '#1f3b5c', border: `3px solid ${B}`, borderRadius: '30px 30px 8px 30px', padding: '18px 24px', fontFamily: font, fontWeight: 800,
      fontSize: 42, lineHeight: 1.4, color: INK}}>{children}</div>
  </Pop>
);
const Sort: Scene = ({f, cue}) => {
  const p = sortPlan(cue);
  const pileAt = [p.c, p.d, p.e];
  return <Root>
    <Title k="第二步：" t={<>让AI<span style={{color: A}}>排优先级</span></>} />
    <Chat>
      <UserMsg f={f} at={p.a}>
        <div>一证通查结果 + 我记得的App：</div>
        <div style={{display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 10}}>
          {APPS.map((a, i) => {
            const go = f >= p.e + 8 ? 1 : 0;
            const at = p.a + 6 + i * Math.max(3, (p.b - p.a - 12) / APPS.length);
            return <span key={a} style={{fontSize: 40, padding: '0 12px', border: `3px solid ${f >= at && f < at + 10 ? A : STEEL}`, borderRadius: 10,
              opacity: (1 - go * 0.7) * clamp((f - at) / 6), transform: `translateY(${-30 * (1 - ease.outBack(clamp((f - at) / 8), 1.4))}px)`, display: 'inline-block'}}>{a}</span>;
          })}
        </div>
      </UserMsg>
      {/* three piles appear on their words; the app chips drop into them once the last pile is named */}
      <div style={{display: 'flex', gap: 14, marginTop: 30}}>
        {PILES.map((pl, k) => (
          <div key={pl.t} style={{flex: 1, minHeight: 430, border: `4px solid ${f >= pileAt[k] ? pl.c : LINE}`, background: PANEL, opacity: f >= p.b ? 1 : 0.25, padding: 12}}>
            <div style={{fontFamily: font, fontWeight: 900, fontSize: 44, color: f >= pileAt[k] ? pl.c : DIM, textAlign: 'center', whiteSpace: 'nowrap',
              transform: `scale(${1 + 0.06 * hitOf(f, [pileAt[k]], 1)})`}}>{pl.t}</div>
            {APPS.map((a, i) => {
              if (PILE[i] !== k) return null;
              const at = p.e + 8 + i * 3;
              if (f < at - 8) return null;
              return <div key={a} style={{marginTop: 12, textAlign: 'center', fontFamily: font, fontWeight: 800, fontSize: 40, color: INK, background: PANEL_HI,
                transform: `translateY(${-140 * (1 - ease.outBack(clamp((f - at + 8) / 10), 1.4))}px)`, opacity: clamp((f - at + 8) / 4)}}>{a}</div>;
            })}
          </div>))}
      </div>
    </Chat>
  </Root>;
};
Sort.camera = (cue) => {
  const p = sortPlan(cue);
  return [cam(0, 450, 540, 1.0), cam(p.a, 450, 260, 1.1), cam(p.b - 4, 450, 540, 1.0)];
};
Sort.sfx = (cue) => {
  const p = sortPlan(cue);
  return [{at: p.a, kind: 'whoosh-short', gain: 0.07}, {at: p.c, kind: 'tick', gain: 0.1}, {at: p.d, kind: 'tick', gain: 0.1}, {at: p.e, kind: 'tick', gain: 0.1},
    {at: p.e + 16, kind: 'tap', gain: 0.12}];
};

/* ---------- 7 then risk: bank card / real name → keep & harden · unbind · delete ---------- */

const riskPlan = (cue: Cue) => ({a: cue('a', 4), b: cue('b', 50), c: cue('c', 96)});
const TABLE = [{app: '旧网购', card: true, real: true, act: 2}, {app: '旧论坛', card: false, real: true, act: 2}, {app: '打车', card: true, real: true, act: 0},
  {app: '旧网盘', card: false, real: false, act: 1}];
const ACTS = [{t: '保留加固', c: B}, {t: '解绑', c: A}, {t: '注销', c: RED}];
const Risk: Scene = ({f, cue}) => {
  const p = riskPlan(cue);
  const mark = (on: boolean, at: number) => f < at ? null : <span style={{color: on ? A : DIM, opacity: clamp((f - at) / 6)}}>{on ? '✓' : '—'}</span>;
  return <Root>
    <Title k="第二步：" t={<>让AI<span style={{color: A}}>排优先级</span></>} />
    <Chat>
      {(() => {
        const col = f >= p.c ? 3 : f >= p.b ? 2 : f >= p.a ? 1 : 0;
        const x = springStep(S(f), S(p.a), {f: 2.4, z: 0.8}) * 220 + springStep(S(f), S(p.b), {f: 2.4, z: 0.8}) * 150 + springStep(S(f), S(p.c), {f: 2.4, z: 0.8}) * 150;
        return col > 0 && <div style={{position: 'absolute', left: 22 + x, top: 14, width: col === 3 ? 300 : 150, height: 400, background: 'rgba(255,171,64,0.16)',
          border: `3px solid ${A}`}} />;
      })()}
      <div style={{position: 'relative', display: 'grid', gridTemplateColumns: '220px 150px 150px 1fr', rowGap: 14, alignItems: 'center', fontFamily: font, fontWeight: 900, fontSize: 44, color: INK}}>
        {['App', '绑卡', '实名', '处理'].map((h, i) => <div key={h} style={{color: (i === 1 && f >= p.a) || (i === 2 && f >= p.b) || (i === 3 && f >= p.c) ? A : DIM,
          textAlign: i ? 'center' : 'left'}}>{h}</div>)}
        {TABLE.map((r, i) => <React.Fragment key={r.app}>
          <div style={{background: r.card && r.real && f >= p.b + 14 ? 'rgba(255,90,90,0.35)' : PANEL, padding: '8px 12px'}}>{r.app}</div>
          <div style={{textAlign: 'center'}}>{mark(r.card, p.a + 6 + i * 4)}</div>
          <div style={{textAlign: 'center'}}>{mark(r.real, p.b + 6 + i * 4)}</div>
          <div style={{textAlign: 'center'}}><Pop f={f} at={p.c + 4 + i * 5} origin="50% 50%"><Chip c={ACTS[r.act].c} size={42} fill={r.act === 2}>{ACTS[r.act].t}</Chip></Pop></div>
        </React.Fragment>)}
      </div>
      <Mono size={40} c={DIM} w={700} style={{marginTop: 30, opacity: clamp((f - p.c - 20) / 8)}}>高风险排前面 · 先处理</Mono>
      <Abs y={600} x={120} w={640} style={{display: 'flex', justifyContent: 'center'}}><Stamp f={f} at={p.c + 30} c={B} size={60} deg={-3}>10 分钟 · 一张清单</Stamp></Abs>
    </Chat>
  </Root>;
};
Risk.sfx = (cue) => {
  const p = riskPlan(cue);
  return [{at: p.a + 6, kind: 'tick', gain: 0.1}, {at: p.b + 6, kind: 'tick', gain: 0.1}, {at: p.c + 4, kind: 'pop', gain: 0.1}, {at: p.c + 30, kind: 'stamp', gain: 0.16}];
};

/* ---------- 8 step 3: where the delete button lives (paths from §2; 以App内为准) ---------- */

const pathPlan = (cue: Cue, dur = 240) => ({a: cue('a', 36), b: cue('b', 118), dur});
const PATHS: {logo: string; name: string; steps: string[]; key: string; cool?: string}[] = [
  {logo: 'wechat-icon.png', name: '微信', steps: ['我', '设置', '账号与安全', '微信安全中心', '注销账号'], key: 'a', cool: '15天可撤销'},
  {logo: 'douyin.svg', name: '抖音', steps: ['我', '☰', '设置', '账号与安全', '抖音安全中心', '注销账号'], key: 'b', cool: '约7天冷静期'},
  {logo: 'qq.svg', name: 'QQ', steps: ['设置', '账号与安全', '更多安全设置', '注销账号'], key: 'q'},
  {logo: 'weibo.svg', name: '微博', steps: ['我', '设置', '账号与安全', '注销账号'], key: 'w'}];
const Paths: Scene = ({f, cue, dur}) => {
  const p = pathPlan(cue, dur);
  const ats: Record<string, number> = {a: p.a, b: p.b, q: p.b + 34, w: p.b + 50};
  const cur = f >= p.b ? 'b' : f >= p.a ? 'a' : '';
  // the spoken card walks its path step by step until the next card is named
  const sp: Record<string, number> = {a: Math.max(4, (p.b - p.a - 16) / 5), b: Math.max(4, (p.dur - p.b - 30) / 6), q: 4, w: 4};
  return <Root>
    <Title k="第三步：" t={<span style={{color: A}}>注销入口</span>} />
    <Abs y={125} w={W} style={{display: 'flex', flexDirection: 'column', gap: 34}}>
      {PATHS.map((r) => {
        const at = ats[r.key];
        const on = r.key === cur;
        return <div key={r.name} style={{position: 'relative', display: 'flex', gap: 18, alignItems: 'center', padding: '16px 18px', background: PANEL, border: `4px solid ${on ? A : f >= at ? LINE : '#1b2a3f'}`,
          opacity: f >= at - 1 ? 1 : 0.35, minHeight: 150}}>
          <Tile src={r.logo} size={104} pad={r.logo === 'douyin.svg' ? 8 : 12} bg={r.logo === 'wechat-icon.png' ? PANEL_HI : '#fff'} />
          <div style={{display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center'}}>
            {r.steps.map((s, i) => {
              const show = f >= at + i * sp[r.key];
              const now = on && show && (i === r.steps.length - 1 || f < at + (i + 1) * sp[r.key]);
              return <React.Fragment key={s + i}>
                {i > 0 && <span style={{fontFamily: font, fontWeight: 900, fontSize: 40, color: DIM, opacity: show ? 1 : 0}}>›</span>}
                <span style={{fontFamily: font, fontWeight: 900, fontSize: 42, color: now ? BG : i === r.steps.length - 1 && on ? A : INK, background: now ? A : 'transparent',
                  padding: '0 6px', whiteSpace: 'nowrap', opacity: show ? 1 : 0.15}}>{s}</span>
              </React.Fragment>;
            })}
          </div>
          {r.cool && <div style={{position: 'absolute', right: 14, top: -30, ...popIn(f, at + r.steps.length * sp[r.key]), transformOrigin: '100% 50%'}}>
            <Chip c={B} size={40} fill>{r.cool}</Chip></div>}
        </div>;
      })}
    </Abs>
    <Abs y={990} w={W}><Mono size={40} c={DIM} w={700}>路径以 App 内为准 · 一般有冷静期</Mono></Abs>
  </Root>;
};
Paths.camera = (cue) => {
  const p = pathPlan(cue);
  return [cam(0, 450, 540, 1.0), cam(p.a, 450, 200, 1.1), cam(p.b, 450, 360, 1.1), cam(p.b + 40, 450, 540, 1.0)];
};
Paths.sfx = (cue) => {
  const p = pathPlan(cue);
  return [{at: p.a, kind: 'tap', gain: 0.14}, {at: p.b, kind: 'tap', gain: 0.14}, {at: p.b + 34, kind: 'tick', gain: 0.08}, {at: p.b + 50, kind: 'tick', gain: 0.08}];
};

/* ---------- 9 before deleting, ask AI what has to be cleared first ---------- */

const prePlan = (cue: Cue) => ({a: cue('a', 36), b: cue('b', 84), c: cue('c', 102), d: cue('d', 120), e: cue('e', 150), f: cue('f', 180)});
const Pre: Scene = ({f, cue}) => {
  const p = prePlan(cue);
  const items = [{t: '余额', at: p.b}, {t: '支付', at: p.c}, {t: '第三方授权', at: p.d}, {t: '自动续费', at: p.e}];
  const failed = f >= p.f;
  return <Root>
    <Title k="第三步：" t={<>注销前<span style={{color: A}}>先问AI</span></>} />
    <Chat h={940}>
      <UserMsg f={f} at={0}>{typed('注销前要先清哪些东西？', f, 2, 0.6)}{f < 40 && <Caret f={f} />}</UserMsg>
      {f >= p.a && <Pop f={f} at={p.a}><div style={{marginTop: 22, display: 'inline-block', background: PANEL_HI, border: `3px solid ${STEEL}`, borderRadius: '8px 30px 30px 30px',
        padding: '10px 22px', fontFamily: font, fontWeight: 800, fontSize: 42, color: INK}}>先处理这 4 样：</div></Pop>}
      <div style={{marginTop: 18, display: 'flex', flexDirection: 'column', gap: 12}}>
        {items.map((it, i) => {
          // the last one is the item people forget: it stays unticked and turns red on "漏一个"
          const miss = i === 3 && failed;
          const tick = i === 3 ? 0 : clamp((f - it.at - 2) / 8);
          if (f >= p.a && f < it.at) return <div key={it.t} style={{height: 92, border: `4px dashed ${LINE}`, display: 'flex', alignItems: 'center', gap: 22, padding: '0 24px',
            opacity: clamp((f - p.a - i * 3) / 6) * 0.7}}>
            <div style={{width: 52, height: 52, borderRadius: 8, border: `5px solid ${LINE}`}} /><div style={{width: 160 + 60 * (i % 2), height: 28, borderRadius: 14, background: LINE}} />
          </div>;
          return <Pop key={it.t} f={f} at={it.at}>
            <div style={{display: 'flex', alignItems: 'center', gap: 22, height: 92, padding: '0 24px', background: miss ? 'rgba(255,90,90,0.16)' : PANEL,
              border: `4px solid ${miss ? RED : LINE}`}}>
              <svg width={60} height={60} viewBox="0 0 60 60"><rect x={4} y={4} width={52} height={52} rx={8} fill="none" stroke={miss ? RED : B} strokeWidth={5} />
                <path d="M15 31 L26 42 L46 18" fill="none" stroke={B} strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={50} strokeDashoffset={50 * (1 - tick)} /></svg>
              <Big size={56} c={miss ? RED : INK} style={{whiteSpace: 'nowrap'}}>{it.t}</Big>
              {miss && <span style={{marginLeft: 'auto', fontFamily: font, fontWeight: 900, fontSize: 44, color: RED}}>漏了</span>}
            </div>
          </Pop>;
        })}
      </div>
      <Abs y={690} x={150} w={560}><Pop f={f} at={p.f + 6} origin="50% 50%">
        <div style={{border: `5px solid ${RED}`, background: BG, padding: '18px 24px', textAlign: 'center'}}>
          <Big size={60} c={RED}>✕ 注销失败</Big>
        </div>
      </Pop></Abs>
    </Chat>
  </Root>;
};
Pre.sfx = (cue) => {
  const p = prePlan(cue);
  return [p.b, p.c, p.d].map((at) => ({at: at + 4, kind: 'tick', gain: 0.1})).concat([{at: p.e, kind: 'tick', gain: 0.06}, {at: p.f + 6, kind: 'block', gain: 0.16}]);
};

/* ---------- 10 no delete button? PIPL article 47 — the line lights up (verbatim from npc.gov.cn) ---------- */

const lawPlan = (cue: Cue) => ({a: cue('a', 86), b: cue('b', 150)});
const Law: Scene = ({f, cue}) => {
  const p = lawPlan(cue);
  const doc = springStep(S(f), S(p.a - 6), {f: 1.8, z: 0.8});
  const hl = clamp((f - p.b) / 12);
  return <Root>
    <div style={{opacity: 1 - clamp((f - p.a + 10) / 8), transform: `translateY(${-60 * clamp((f - p.a + 10) / 8)}px)`}}>
      <Title t={<>不给<span style={{color: A}}>注销按钮</span>？</>} />
      <Phone x={140} y={150} w={620} h={760}>
        <Big size={52} style={{marginBottom: 28}}>账号与安全</Big>
        <Row f={f}>修改密码</Row><Row f={f}>手机号</Row><Row f={f}>登录设备</Row>
        <div style={{height: 92, border: `4px dashed ${A}`, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: font, fontWeight: 900,
          fontSize: 48, color: A, opacity: 0.4 + 0.6 * Math.abs(Math.sin(f / 9))}}>注销？找不到</div>
      </Phone>
    </div>
    {f >= p.a - 8 && <div style={{position: 'absolute', inset: 0, opacity: clamp(doc * 2), transform: `translateY(${(1 - doc) * 300}px)`}}>
      <Title t={<>个保法<span style={{color: A}}>第47条</span>：你有删除权</>} size={66} />
      <Abs y={120} w={W} style={{background: '#e9eef5', color: '#17212e', padding: '30px 34px', boxShadow: '0 20px 50px rgba(0,0,0,0.5)'}}>
        <div style={{fontFamily: font, fontWeight: 900, fontSize: 40, textAlign: 'center', marginBottom: 20}}>中华人民共和国个人信息保护法</div>
        <div style={{fontFamily: font, fontWeight: 700, fontSize: 40, lineHeight: 1.6}}>
          <b>第四十七条</b> 有下列情形之一的，个人信息处理者应当主动删除个人信息；个人信息处理者未删除的，
          <span style={{background: `rgba(255,171,64,${0.85 * hl})`, boxShadow: hl > 0 ? `inset 0 -6px 0 rgba(191,75,44,${hl})` : undefined}}>个人有权请求删除</span>：
        </div>
        <div style={{fontFamily: font, fontWeight: 700, fontSize: 40, lineHeight: 1.6, color: '#5b6878', marginTop: 8}}>
          （一）处理目的已实现……<br />（三）个人撤回同意……
        </div>
      </Abs>
      <Abs y={830} w={W} style={{display: 'flex', justifyContent: 'center'}}><Stamp f={f} at={p.b + 8} c={A} size={84} deg={-3}>你有删除权</Stamp></Abs>
    </div>}
  </Root>;
};
Law.sfx = (cue) => {
  const p = lawPlan(cue);
  return [{at: p.a - 6, kind: 'fs-paper-slide', gain: 0.14}, {at: p.b, kind: 'tick', gain: 0.1}, {at: p.b + 8, kind: 'stamp', gain: 0.2}];
};

/* ---------- 11 AI writes the request; refusing needs a reason (art. 50) ---------- */

const letterPlan = (cue: Cue) => ({a: cue('a', 4), b: cue('b', 70), c: cue('c', 100)});
const LETTER = ['依据《个人信息保护法》', '第四十七条、第五十条，', '请删除我在贵平台的账号及相关个人信息。', '我可以配合身份核验。', '请在合理期限内书面答复；', '如拒绝，请说明理由。'];
const Letter: Scene = ({f, cue}) => {
  const p = letterPlan(cue);
  const fly = ease.inOutCubic(clamp((f - p.b) / 16));
  return <Root>
    <Title t={<>AI 一键写<span style={{color: A}}>申请函</span></>} />
    <Abs y={120} w={W} style={{transform: `translate(${fly * 40}px, ${fly * 20}px) scale(${1 - 0.1 * fly})`, transformOrigin: '100% 0%'}}>
      <div style={{background: '#e9eef5', color: '#17212e', padding: '26px 32px', boxShadow: '0 20px 50px rgba(0,0,0,0.5)', minHeight: 640}}>
        <div style={{fontFamily: font, fontWeight: 900, fontSize: 48, textAlign: 'center', marginBottom: 18}}>个人信息删除申请</div>
        {LETTER.map((l, i) => {
          const at = p.a + 8 + i * 8;
          const last = i >= 4 && f >= p.c;
          return <div key={l} style={{fontFamily: font, fontWeight: 700, fontSize: 40, lineHeight: 1.55, opacity: clamp((f - at) / 6),
            background: last ? 'rgba(255,171,64,0.75)' : undefined}}>{l}</div>;
        })}
      </div>
    </Abs>
    <Abs y={830} w={W} style={{display: 'flex', alignItems: 'center', gap: 20}}>
      <Pop f={f} at={p.b}><Chip c={B} size={52}>→ 发给客服</Chip></Pop>
      <Pop f={f} at={p.c}><Chip c={A} size={52} fill>拒绝须说明理由 · 第50条</Chip></Pop>
    </Abs>
  </Root>;
};
Letter.sfx = (cue) => {
  const p = letterPlan(cue);
  return [{at: p.a + 8, kind: 'fs-paper-slide', gain: 0.12}, {at: p.b, kind: 'whoosh-short', gain: 0.08}, {at: p.c, kind: 'tap', gain: 0.14}];
};

/* ---------- 12 step 4: 12321, complaint type 「账号注销难」 ---------- */

const compPlan = (cue: Cue) => ({a: cue('a', 54), b: cue('b', 104), c: cue('c', 132)});
const TYPES = ['账号注销难', '未提供更正或删除个人信息功能', '其他'];
const Complain: Scene = ({f, cue}) => {
  const p = compPlan(cue);
  const open = clamp((f - p.b) / 10);
  const pick = f >= p.c;
  return <Root>
    <Title k="第四步：" t={<><span style={{color: A}}>12321</span> 投诉</>} />
    <Abs y={120} w={W} style={{display: 'flex', alignItems: 'center', gap: 22}}>
      <Pop f={f} at={p.a - 6}><Tile src="12321-logo.png" size={110} pad={8} /></Pop>
      <Pop f={f} at={p.a}><div style={{background: '#fff', padding: '18px 10px'}}><Img src={IMG('12321-logo-title.png')} style={{width: 740, display: 'block'}} /></div></Pop>
    </Abs>
    <Abs y={300} w={W}><Pop f={f} at={p.a + 8} origin="50% 0%">
      <div style={{border: `4px solid ${STEEL}`, background: PANEL, padding: '24px 26px', position: 'relative'}}>
        <div style={{position: 'absolute', right: -12, top: -26, background: BG, border: `3px solid ${DIM}`, color: DIM, fontFamily: font, fontWeight: 800, fontSize: 32,
          padding: '0 10px'}}>界面示意</div>
        <Big size={48} c={DIM}>投诉类型</Big>
        <div style={{marginTop: 14, height: 96, border: `4px solid ${pick ? A : LINE}`, background: BG, display: 'flex', alignItems: 'center', padding: '0 22px', fontFamily: font,
          fontWeight: 900, fontSize: 46, color: pick ? A : DIM, whiteSpace: 'nowrap'}}>
          {pick ? '账号注销难' : '请选择'}<span style={{marginLeft: 'auto', transform: `rotate(${180 * open}deg)`}}>▾</span>
        </div>
        <div style={{overflow: 'hidden', height: 380 * open}}>
          {TYPES.map((t, i) => <div key={t} style={{marginTop: 12, height: 104, display: 'flex', alignItems: 'center', padding: '0 22px', background: i === 0 && pick ? A : PANEL_HI,
            color: i === 0 && pick ? BG : INK, fontFamily: font, fontWeight: 900, fontSize: i === 1 ? 40 : 46, whiteSpace: 'nowrap'}}>{t}{i === 0 && pick && <span style={{marginLeft: 'auto'}}>✓</span>}</div>)}
        </div>
      </div>
    </Pop></Abs>
    <Abs y={920} w={W} style={{display: 'flex', justifyContent: 'center'}}><Stamp f={f} at={p.c + 12} c={A} size={66} deg={-3}>选「账号注销难」</Stamp></Abs>
  </Root>;
};
Complain.sfx = (cue) => {
  const p = compPlan(cue);
  return [{at: p.a, kind: 'tap', gain: 0.12}, {at: p.b, kind: 'tick', gain: 0.1}, {at: p.c, kind: 'tap', gain: 0.16}, {at: p.c + 12, kind: 'stamp', gain: 0.16}];
};

/* ---------- 13 end: four steps done, a door locking (Pexels), the closing line. No CTA (Douyin: no off-platform traffic). ---------- */

const endPlan = (cue: Cue) => ({c: cue('c', 40)});
const End: Scene = ({f, cue}) => {
  const p = endPlan(cue);
  return <Root>
    <Abs x={-60} y={0} w={1080} h={608} style={{overflow: 'hidden'}}>
      {/* from 2.3 s in the source: the hand reaches in and turns the lock while the line is spoken; slow push-in */}
      <OffthreadVideo src={CLIP('lock.mp4')} muted trimBefore={69} style={{width: '100%', height: '100%', objectFit: 'cover',
        transform: `scale(${1 + 0.1 * clamp(f / 110)})`}} />
      <div style={{position: 'absolute', right: 0, bottom: 0, background: 'rgba(12,26,44,0.85)', color: INK, fontFamily: font, fontWeight: 700, fontSize: 40,
        padding: '0 12px'}}>Pexels 素材</div>
    </Abs>
    <Abs y={650} w={W} style={{display: 'flex', justifyContent: 'space-between'}}>
      {STEPS.map((s, i) => <Pop key={s} f={f} at={-12 + i * 5} origin="50% 50%"><div style={{width: 200, height: 100, background: PANEL, border: `4px solid ${B}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, fontFamily: font, fontWeight: 900, fontSize: 48, color: INK}}>
        <span style={{color: B}}>✓</span>{s}</div></Pop>)}
    </Abs>
    <Abs y={800} w={W} style={{textAlign: 'center'}}>
      <Pop f={f} at={2} origin="50% 50%"><Big size={64}>花一个下午</Big></Pop>
      <Pop f={f} at={p.c} origin="50% 50%"><Big size={76} c={A}>把自己从网上收拾干净</Big></Pop>
    </Abs>
  </Root>;
};
End.sfx = (cue) => {
  const p = endPlan(cue);
  return [{at: 0, kind: 'tick', gain: 0.08}, {at: p.c, kind: 'tap', gain: 0.12}, {at: p.c + 50, kind: 'chime', gain: 0.12}];
};

/* ---------- cover anchor (880 × 800): the hub, settled on "25?" ---------- */

const Cover: Scene = () => <div style={{position: 'relative', width: 880, height: 800}}>
  <div style={{position: 'absolute', left: -10, top: -240}}><HubRing f={300} n={RING} forget={1} land={-100} count={`${RING}?`} /></div>
</div>;

export const digitalCleanupScenes: Record<string, Scene> = {
  'dc.hook': Hook,
  'dc.claim': Claim,
  'dc.roadmap': Road,
  'dc.check': Check,
  'dc.card': Card,
  'dc.sort': Sort,
  'dc.risk': Risk,
  'dc.paths': Paths,
  'dc.precheck': Pre,
  'dc.law': Law,
  'dc.letter': Letter,
  'dc.complain': Complain,
  'dc.end': End,
  'dc.cover': Cover,
};
