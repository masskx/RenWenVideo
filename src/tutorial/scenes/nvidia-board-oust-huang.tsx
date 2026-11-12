import React from 'react';
import {Img, OffthreadVideo, staticFile} from 'remotion';
import {clamp, ease} from '../../fx';
import {font} from '../theme';
import {cond, plex} from '../fonts';
import {Scene} from '../paper';
import {BandWipe, Bug, Brackets, Doc, Pk, QuoteCard, SourceTag, Strap, StrapItem, Veil, Vignette, eo, slam} from '../package';

// nvidia-board-oust-huang, made on the template lemo/news-package (docs/video-craft/prompt-library/vendor/lemomo-ai__lemo-opuscar/
// 3961ddb/styles/news-package/STYLE.md): one package on every frame (bug, a strap that flips its words, tab = category),
// documents typeset on paper with the key phrase swept, quote cards, one stamp, band wipes between stories.
// Inputs: inputs/nvidia-board-oust-huang/ (materials.md, sources.md, REVIEW-DOUYIN.md: conditional pass, eight conditions).
// - Everything about the ouster is "据报道" (WSJ exclusive and later reports); no decision announced when made (rechecked 11-12).
// - After-hours figure = the Google Finance snapshot: 11-11 19:59 ET, $158.78, −8.61 % (close $173.73). No other % mixed in.
// - Section 32 (bylaws, SEC filing 2024-03-12): any officer removable with or without cause by a majority of the directors in
//   office. 11 directors (IR page) → 6 is a majority: our arithmetic, labelled; the seats are anonymous (no one's vote implied).
//   3.58 % = proxy statement as of 2026-03-23. Kress = Semafor ("some directors favour", board not decided). 10-K risk sentence.
// - No affair details, no intelligence / political framing, no stock advice, no prediction markets.

export const NVB: Pk = {bg: '#0D0F0C', panel: '#1A1E17', ink: '#F1F3EC', accent: '#76B900', onAccent: '#0D0F0C', dim: '#A3A99B', second: '#E5463A'};
const k = NVB, GREEN = k.accent, RED = '#E5463A';
const IMG = (n: string) => staticFile(`images/nvidia-board-oust-huang/${n}`);

const S_REPORT: StrapItem = {at: -999, tab: '据报道 REPORT', zh: 'WSJ：英伟达董事会准备罢免黄仁勋', en: 'EXCLUSIVE · WALL STREET JOURNAL · NOV 11'};
const S_CHECK: StrapItem = {at: 0, tab: '核实 CHECK', zh: '公司未宣布任何决定', en: 'NO 8-K · NO STATEMENT ON THE REPORT'};
const S_RULE: StrapItem = {at: 0, tab: '章程 BYLAWS', zh: '在任董事过半数，可免任何高管', en: 'SECTION 32 · REMOVAL'};
const S_MATH: StrapItem = {at: 0, tab: '推算 MATH', zh: '11 名董事，过半数 = 6 票', en: 'BOARD OF 11 · 10 INDEPENDENT'};
const S_WHO: StrapItem = {at: 0, tab: '人选 SUCCESSION', zh: '据报道：部分董事倾向 Kress 临时接任', en: 'SEMAFOR · BOARD NOT DECIDED'};
const S_RISK: StrapItem = {at: 0, tab: '风险 KEY PERSON', zh: '年报：高度依赖长期经营团队', en: 'FY2026 10-K · RISK FACTORS'};
const S_NEXT: StrapItem = {at: 0, tab: '接下来 NEXT', zh: '董事会决定 · 11 月 17 日财报会', en: 'Q3 FY2027 CALL · NOV 17'};

const make = (draw: NonNullable<Scene['backdrop']>, sfx?: Scene['sfx'], wipe = true): Scene => {
  const S: Scene = () => null;
  S.backdrop = wipe ? (props) => <>{draw(props)}<BandWipe k={k} f={props.f} at={-2} /></> : draw;
  S.sfx = sfx;
  return S;
};
const Frame: React.FC<{f: number; strap: StrapItem[]; src?: [string, number]; children: React.ReactNode}> = ({f, strap, src, children}) => (
  <div style={{position: 'absolute', inset: 0, background: k.bg, overflow: 'hidden'}}>
    {[0, 1, 2].map((i) => <div key={i} style={{position: 'absolute', left: -200 + i * 420, top: -200, width: 120, height: 2400, transform: 'rotate(24deg)', background: 'rgba(118,185,0,0.035)'}} />)}
    {children}
    <Veil from={1120} top={false} a={0.9} />
    <Bug k={k} tag="AI 新闻" topic="英伟达董事会" en="NVIDIA BOARD" />
    {src && <SourceTag k={k} label={src[0]} f={f} at={src[1]} />}
    <Strap k={k} items={strap} f={f} end="NVDA" />
    <Vignette a={0.35} />
  </div>
);
/** A slow push on everything inside the picture zone (news-package: pictures breathe, type sits still on top). */
const Push: React.FC<{f: number; dur: number; children: React.ReactNode}> = ({f, dur, children}) => <div style={{position: 'absolute', inset: 0, transformOrigin: '50% 45%', transform: `scale(${1 + 0.05 * ease.inOutCubic(clamp(f / dur))})`}}>{children}</div>;

/* ---------- 1 hook: the headline, and the after-hours quote ---------- */

const Hook = make(({f, cue, dur}) => {
  const a = cue('a', 98);
  return <Frame f={f} strap={[S_REPORT]} src={['视频 NVIDIA GTC 2026 高光｜案例展示', 0]}>
    <Push f={f} dur={dur}>
      <div style={{position: 'absolute', left: 0, top: 200, width: 1080, height: 960, overflow: 'hidden'}}>
        <OffthreadVideo src={staticFile('video/nvidia-board-oust-huang/keynote-99.mp4')} muted playbackRate={0.6} style={{position: 'absolute', left: -340, top: 0, height: 960, width: 1707, objectFit: 'cover', filter: `brightness(${0.75 - 0.35 * eo(f, a - 6, a + 6)}) contrast(1.05)`}} />
      </div>
    </Push>
    <div style={{position: 'absolute', left: 64, top: 290 + (1 - eo(f, 0, 8)) * 40, width: 952, opacity: eo(f, 0, 8), background: '#FFFFFF', padding: '14px 0 10px', boxShadow: '0 20px 40px rgba(0,0,0,0.5)'}}>
      <Img src={IMG('wsj.png')} style={{width: 952, display: 'block'}} />
    </div>
    {f >= a && <div style={{position: 'absolute', left: 64, top: 510 + (1 - eo(f, a, a + 8)) * 120, width: 952, opacity: eo(f, a, a + 6), boxShadow: '0 30px 60px rgba(0,0,0,0.6)'}}>
      <Img src={IMG('gf.png')} style={{width: 952, display: 'block'}} />
      <Brackets k={{...k, accent: RED}} f={f} at={a + 10} x={410} y={50} w={240} h={76} s={34} />
      <div style={{position: 'absolute', left: 0, top: 476, background: RED, color: '#fff', fontFamily: plex, fontSize: 28, padding: '6px 14px', opacity: eo(f, a + 14, a + 20)}}>美东 11-11 19:59 盘后报价 · Google Finance</div>
    </div>}
    {f >= a + 16 && <div style={{position: 'absolute', left: 520, top: 1046, fontFamily: cond, fontWeight: 800, fontSize: 116, color: RED, lineHeight: 1, transformOrigin: '0 50%', transform: `scale(${slam(f, a + 16) ?? 1})`}}>−8.61%</div>}
  </Frame>;
}, (cue) => [{at: 0, kind: 'whoosh-short', gain: 0.06}, {at: cue('a', 98), kind: 'fs-paper-slide', gain: 0.08}, {at: cue('a', 98) + 10, kind: 'tick', gain: 0.1}], false);

/* ---------- 2 status: still only a report ---------- */

const ROWS: [string, string][] = [['英伟达新闻中心', '最新相关稿：11-10 独立董事声明'], ['SEC EDGAR', '11 月没有 8-K（最近一份 09-03）'], ['官方 X / 黄仁勋 X', '未回应这篇报道']];
const Status = make(({f, cue}) => {
  const a = cue('a', 30);
  return <Frame f={f} strap={[S_REPORT, {...S_CHECK, at: 4}]}>
    <div style={{position: 'absolute', left: 64, top: 260, fontFamily: plex, fontSize: 30, color: k.dim}}>截至 2026-11-12 · 我们复查</div>
    {ROWS.map(([w, t], i) => f < a + i * 8 ? null : <div key={i} style={{position: 'absolute', left: 64, top: 330 + i * 200, width: 952, opacity: eo(f, a + i * 8, a + i * 8 + 6), background: k.panel, borderLeft: `8px solid ${k.dim}`, padding: '22px 28px'}}>
      <div style={{fontFamily: plex, fontSize: 30, color: k.dim}}>{w}</div>
      <div style={{fontFamily: font, fontWeight: 900, fontSize: 50, color: k.ink, marginTop: 6}}>{t}</div>
    </div>)}
    {f >= a + 30 && <div style={{position: 'absolute', left: 430, top: 930, transform: `rotate(-6deg) scale(${slam(f, a + 30) ?? 1})`, border: `10px solid ${GREEN}`, color: GREEN, fontFamily: font, fontWeight: 900, fontSize: 92, padding: '4px 30px'}}>据报道</div>}
  </Frame>;
}, (cue) => [0, 8, 16].map((d) => ({at: cue('a', 30) + d, kind: 'tick', gain: 0.07})).concat([{at: cue('a', 30) + 30, kind: 'stamp', gain: 0.1}]));

/* ---------- 3 rule: Section 32, typeset ---------- */

const BYLAW = 'Any officer may be removed from office at any time, either with or without cause, by the affirmative vote of a majority of the directors in office at the time …';
const Rule = make(({f, cue}) => {
  const a = cue('a', 28), b = cue('b', 77);
  return <Frame f={f} strap={[S_CHECK, {...S_RULE, at: 4}]} src={['公司细则 · SEC 备案 2024-03-12', 0]}>
    <Doc k={k} f={f} at={2} head="NVIDIA BYLAWS · SECTION 32. REMOVAL" body={BYLAW} mark="a majority of the directors in office" markAt={a} y={300} size={50} />
    {f >= b && <div style={{position: 'absolute', left: 90, top: 940, display: 'flex', gap: 20, opacity: eo(f, b, b + 6)}}>
      <div style={{background: GREEN, color: k.onAccent, fontFamily: font, fontWeight: 900, fontSize: 52, padding: '10px 26px'}}>有因或无因</div>
      <div style={{background: k.panel, color: k.ink, fontFamily: font, fontWeight: 900, fontSize: 52, padding: '10px 26px', borderTop: `4px solid ${GREEN}`}}>任何高管</div>
    </div>}
  </Frame>;
}, (cue) => [{at: 2, kind: 'paper', gain: 0.07}, {at: cue('a', 28), kind: 'marker', gain: 0.07}, {at: cue('b', 77), kind: 'tick', gain: 0.08}]);

/* ---------- 4 seats: 11 directors, a majority is 6; Huang is one seat (signature) ---------- */

const Seat: React.FC<{x: number; y: number; on: number; ceo?: boolean; f: number; at: number}> = ({x, y, on, ceo, f, at}) => {
  if (f < at) return null;
  const s = 1 + 0.25 * Math.max(0, 1 - (f - at) / 5);
  return <div style={{position: 'absolute', left: x, top: y, width: 130, height: 150, transform: `scale(${s})`, opacity: eo(f, at, at + 4)}}>
    <div style={{position: 'absolute', left: 25, top: 0, width: 80, height: 80, borderRadius: '50%', background: on > 0 ? GREEN : '#2C3228', border: ceo ? `5px solid ${k.ink}` : 'none', boxSizing: 'border-box', opacity: 0.4 + 0.6 * Math.max(on, ceo ? 1 : 0.4)}} />
    <div style={{position: 'absolute', left: 0, top: 70, width: 130, height: 70, borderRadius: '40px 40px 8px 8px', background: on > 0 ? GREEN : '#2C3228', border: ceo ? `5px solid ${k.ink}` : 'none', boxSizing: 'border-box', opacity: 0.4 + 0.6 * Math.max(on, ceo ? 1 : 0.4)}} />
  </div>;
};
const Seats = make(({f, cue, dur}) => {
  const a = cue('a', 65), b = cue('b', 93);
  const pos = Array.from({length: 11}, (_, i) => i < 6 ? {x: 70 + i * 160, y: 420} : {x: 150 + (i - 6) * 160, y: 610});
  const lit = (i: number): number => (i < 6 && f >= a + i * 4 ? 1 : 0);
  const n: number = Array.from({length: 6}, (_, i) => lit(i)).reduce((s: number, v) => s + v, 0);
  return <Frame f={f} strap={[S_RULE, {...S_MATH, at: 4}]} src={['董事名单 · NVIDIA 投资者关系页', 0]}>
    <Push f={f} dur={dur}>
      <div style={{position: 'absolute', left: 64, top: 300, fontFamily: font, fontWeight: 900, fontSize: 56, color: k.ink}}>董事会 <span style={{fontFamily: cond, fontSize: 80}}>11</span> 人 · <span style={{color: k.dim}}>10 人独立</span></div>
      {pos.map((p, i) => <Seat key={i} x={p.x} y={p.y} on={lit(i)} f={f} at={6 + i * 3} ceo={i === 10} />)}
      {f >= 40 && <div style={{position: 'absolute', left: pos[10].x - 30, top: pos[10].y + 160, width: 190, textAlign: 'center', fontFamily: font, fontWeight: 900, fontSize: 32, color: k.ink}}>黄仁勋</div>}
      <div style={{position: 'absolute', left: 64, top: 850, display: 'flex', alignItems: 'baseline', gap: 24, opacity: f >= a ? 1 : 0}}>
        <span style={{fontFamily: cond, fontWeight: 800, fontSize: 210, color: GREEN, lineHeight: 1, transform: `scale(${n === 6 ? slam(f, a + 20) ?? 1 : 1})`, display: 'inline-block'}}>{n}</span>
        <span style={{fontFamily: cond, fontWeight: 800, fontSize: 90, color: k.dim}}>/ 11</span>
        <span style={{fontFamily: font, fontWeight: 900, fontSize: 52, color: k.ink}}>{n === 6 ? '> 半数' : ''}</span>
      </div>
      <div style={{position: 'absolute', left: 64, top: 800, fontFamily: plex, fontSize: 26, color: k.dim, opacity: f >= a + 20 ? 1 : 0}}>任意 6 人 · 按章程推算，不代表任何人的投票</div>
      {f >= b && <div style={{position: 'absolute', left: 540, top: 850, width: 476, background: k.panel, borderLeft: `8px solid ${k.ink}`, padding: '18px 24px', opacity: eo(f, b, b + 6)}}>
        <div style={{fontFamily: font, fontWeight: 900, fontSize: 44, color: k.ink}}>持股 3.58%</div>
        <div style={{fontFamily: plex, fontSize: 24, color: k.dim, marginTop: 6}}>代理声明 · 截至 2026-03-23</div>
        <div style={{fontFamily: font, fontWeight: 700, fontSize: 30, color: k.ink, marginTop: 10, whiteSpace: 'nowrap'}}>免高管由董事投票，他是 1 席</div>
      </div>}
    </Push>
  </Frame>;
}, (cue) => [...Array.from({length: 11}, (_, i) => ({at: 6 + i * 3, kind: 'tick', gain: 0.04})), ...Array.from({length: 6}, (_, i) => ({at: cue('a', 65) + i * 4, kind: 'tap', gain: 0.07})), {at: cue('a', 65) + 20, kind: 'stamp', gain: 0.1}, {at: cue('b', 93), kind: 'paper', gain: 0.06}]);

/* ---------- 5 who: the reported interim pick, attributed ---------- */

const Who = make(({f, cue}) => {
  const a = cue('a', 64), b = cue('b', 133);
  return <Frame f={f} strap={[S_MATH, {...S_WHO, at: 4}]}>
    <QuoteCard k={k} f={f} at={2} lines={['若罢免黄仁勋，', '由 CFO Colette Kress', '出任临时 CEO']} gist="——部分董事的倾向" who="SEMAFOR · 据知情人士 · 2026-11-11" mark="Colette Kress" markAt={a} y={300} size={78} />
    {f >= b && <div style={{position: 'absolute', left: 64, top: 960, border: `4px dashed ${k.dim}`, padding: '12px 26px', fontFamily: font, fontWeight: 900, fontSize: 54, color: k.ink, opacity: eo(f, b, b + 6)}}>全体董事尚未决定</div>}
  </Frame>;
}, (cue) => [{at: 2, kind: 'whoosh-short', gain: 0.05}, {at: cue('a', 64), kind: 'marker', gain: 0.06}, {at: cue('b', 133), kind: 'tick', gain: 0.08}]);

/* ---------- 6 risk: the company's own words on key people ---------- */

const Risk = make(({f, cue, dur}) => {
  const a = cue('a', 43), b = cue('b', 92);
  return <Frame f={f} strap={[S_WHO, {...S_RISK, at: 4}]} src={['照片 Peter Dasilva · CC BY 4.0', 0]}>
    <Push f={f} dur={dur}>
      <div style={{position: 'absolute', left: 380, top: 200, width: 700, height: 960, overflow: 'hidden'}}>
        <Img src={IMG('huang.jpg')} style={{width: 700, height: 1040, objectFit: 'cover', filter: 'grayscale(0.4) brightness(0.45) contrast(1.05)'}} />
        <div style={{position: 'absolute', inset: 0, background: `linear-gradient(90deg, ${k.bg} 0%, rgba(13,15,12,0) 45%)`}} />
      </div>
    </Push>
    <QuoteCard k={k} f={f} at={4} lines={['we are highly dependent', 'on the services of our', 'longstanding executive team']} mark="highly dependent" markAt={a}
      gist={f >= b ? '继任规划做不好，会伤到长期发展' : undefined} who="NVIDIA FY2026 10-K · RISK FACTORS" y={330} size={70} w={760} />
  </Frame>;
}, (cue) => [{at: 4, kind: 'whoosh-short', gain: 0.05}, {at: cue('a', 43), kind: 'marker', gain: 0.06}, {at: cue('b', 92), kind: 'tick', gain: 0.07}]);

/* ---------- 7 end: two things to watch ---------- */

const End = make(({f, cue}) => {
  const a = cue('a', 33), b = cue('b', 65);
  const card = (at: number, top: number, kicker: string, title: string, note: string, pending: boolean) => f < at ? null : (
    <div style={{position: 'absolute', left: 64, top: top + (1 - eo(f, at, at + 7)) * 60, width: 952, opacity: eo(f, at, at + 6), background: k.panel, borderLeft: `10px solid ${pending ? k.dim : GREEN}`, padding: '24px 30px'}}>
      <div style={{fontFamily: plex, fontSize: 30, color: k.dim}}>{kicker}</div>
      <div style={{fontFamily: font, fontWeight: 900, fontSize: 64, color: k.ink, marginTop: 6}}>{title}</div>
      <div style={{fontFamily: font, fontWeight: 700, fontSize: 32, color: k.dim, marginTop: 8}}>{note}</div>
    </div>);
  return <Frame f={f} strap={[S_RISK, {...S_NEXT, at: 4}]}>
    {card(a, 320, '1 · 待公布', '董事会的正式决定', '公司公告 / SEC 8-K 为准', true)}
    {card(b, 640, '2 · 11-17 美西 14:00', 'Q3 财报电话会', '10 月 28 日已预告的既定安排', false)}
  </Frame>;
}, (cue) => [{at: cue('a', 33), kind: 'tick', gain: 0.08}, {at: cue('b', 65), kind: 'tick', gain: 0.08}]);

/* ---------- cover anchor: the seats ---------- */

const Cover = make(({f}) => <Frame f={f} strap={[S_MATH]}>
  {Array.from({length: 11}, (_, i) => <Seat key={i} x={i < 6 ? 70 + i * 160 : 150 + (i - 6) * 160} y={i < 6 ? 360 : 560} on={i < 6 ? 1 : 0} f={99} at={0} ceo={i === 10} />)}
  <div style={{position: 'absolute', left: 64, top: 820, fontFamily: cond, fontWeight: 800, fontSize: 210, color: GREEN, lineHeight: 1}}>6<span style={{fontSize: 90, color: k.dim}}> / 11</span></div>
</Frame>, undefined, false);

export const NVIDIA_BOARD_SCENES: Record<string, Scene> = {
  'nvb.hook': Hook, 'nvb.status': Status, 'nvb.rule': Rule, 'nvb.seats': Seats, 'nvb.who': Who, 'nvb.risk': Risk, 'nvb.end': End, 'nvb.cover': Cover,
};
