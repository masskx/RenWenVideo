import React from 'react';
import {Img, OffthreadVideo, staticFile} from 'remotion';
import {clamp, ease} from '../../fx';
import {font} from '../theme';
import {cond, plex} from '../fonts';
import {Scene} from '../paper';
import {Bug, CornerTag, Doc, Flash, Ledger, LowerThird, Pk, SourceTag, Veil, Vignette, eo, slam} from '../package';

// nvidia-huang-resigns, made on the template lemo/caption-news (docs/video-craft/prompt-library/vendor/lemomo-ai__lemo-opuscar/
// 3961ddb/styles/caption-news/STYLE.md): sound-off first, the caption card is the subtitle (look.captions "card", one keyword
// block), real footage and documents as the ground, a source tag whenever a figure or document is up, the document line
// highlighted before it is believed, one turn with a white flash, ledger cards for numbers, a lit three-panel grid.
// Inputs: inputs/nvidia-huang-resigns/ (materials.md, sources.md, REVIEW-DOUYIN.md: conditional pass, seven conditions).
// Follows nvidia-board-oust-huang (yesterday: "据报道准备罢免", now superseded by the press release and the 8-K).
// - Verb: the board announced / accepted his resignation (8-K: accepted on Nov 11; press release Nov 12). Never "he said".
// - Kress interim CEO and still CFO; search considers internal and external candidates. Jones first-ever Chair, on the
//   board since 1993 (8-K). No reason given officially; the reported background gets one "据外媒报道" line, nothing more.
// - Prices, each with its source and time: pre-market −11.06 % (联合早报 citing Reuters, 22:11 Taipei = 09:11 ET); open
//   "more than 13 %" (BBC) with Google's Open $151.01 vs prior close $173.73 = −13.08 % (our arithmetic, shown); intraday
//   −5.91 % at 10:17:18 ET (Google Finance snapshot). No month figures, no low, no stock advice.

export const NHR: Pk = {bg: '#0F1110', panel: '#171A17', ink: '#F7F5EF', accent: '#76B900', onAccent: '#0F1110', dim: '#9A9E95', second: '#FF4A3D'};
const k = NHR, GREEN = k.accent, RED = '#FF4A3D';
const IMG = (n: string) => staticFile(`images/nvidia-huang-resigns/${n}`);
const PIC = {top: 290, h: 860};

const make = (draw: NonNullable<Scene['backdrop']>, sfx?: Scene['sfx']): Scene => {
  const S: Scene = () => null;
  S.backdrop = draw; S.sfx = sfx;
  return S;
};
/** The package: ground, bug, optional source tag and footage credit; the picture band y 290–1150, the caption card below. */
const Frame: React.FC<{f: number; dur?: number; src?: [string, number]; credit?: string; children: React.ReactNode}> = ({f, dur = 150, src, credit, children}) => (
  <div style={{position: 'absolute', inset: 0, background: k.bg, overflow: 'hidden'}}>
    <div style={{position: 'absolute', inset: 0, transformOrigin: '50% 40%', transform: `scale(${1 + 0.04 * ease.inOutCubic(clamp(f / dur))})`}}>{children}</div>
    <Veil from={1000} top={false} a={0.92} />
    <Bug k={k} tag="AI 新闻" topic="英伟达换帅" en="NVIDIA CEO" />
    {src && <SourceTag k={k} label={src[0]} f={f} at={src[1]} />}
    {credit && <CornerTag k={k} text={credit} f={f} at={0} y={PIC.top + 16} />}
    <Vignette a={0.3} />
  </div>
);
/** A white paper card holding a real screenshot crop, sliding in from the right with a highlighter sweep. */
const Paper: React.FC<{src: string; w: number; h: number; k2: number; f: number; at: number; x?: number; y: number; hl?: [number, number, number, number, number][]; rot?: number}> = ({src, w, h, k2, f, at, x = 64, y, hl = [], rot = -1}) => {
  if (f < at) return null;
  const p = eo(f, at, at + 6);
  return <div style={{position: 'absolute', left: x + (1 - p) * 400, top: y, opacity: p, transform: `rotate(${rot}deg)`, background: '#fff', padding: 14, boxShadow: '0 30px 60px rgba(0,0,0,0.55)'}}>
    <div style={{position: 'relative', width: w * k2, height: h * k2}}>
      <Img src={IMG(src)} style={{width: w * k2, height: h * k2, display: 'block'}} />
      {hl.map(([x0, y0, x1, y1, t], i) => <div key={i} style={{position: 'absolute', left: x0 * k2, top: y0 * k2, height: (y1 - y0) * k2, width: (x1 - x0) * k2 * eo(f, t, t + 10), background: GREEN, opacity: 0.45, mixBlendMode: 'multiply'}} />)}
    </div>
  </div>;
};

/* ---------- 1 hook: the announcement ---------- */

const Hook = make(({f, cue, dur}) => {
  const a = cue('a', 71), b = cue('b', 94);
  return <Frame f={f} dur={dur} src={['NVIDIA 新闻稿 · 2026-11-12', 10]} credit="视频 NVIDIA GTC 2026 高光｜案例展示">
    <div style={{position: 'absolute', left: 0, top: PIC.top, width: 1080, height: PIC.h, overflow: 'hidden'}}>
      <OffthreadVideo src={staticFile('video/nvidia-huang-resigns/keynote-38.mp4')} muted playbackRate={0.75} style={{position: 'absolute', left: -380, top: 0, height: PIC.h, width: 1529, objectFit: 'cover', filter: 'contrast(1.07) saturate(0.85) brightness(0.62)'}} />
    </div>
    <Paper src="pr-head.png" w={1313} h={384} k2={0.7} f={f} at={10} y={560} hl={[[50, 238, 360, 280, 24]]} />
    {f >= a && <div style={{position: 'absolute', left: 64, top: 900, background: GREEN, color: k.onAccent, fontFamily: font, fontWeight: 900, fontSize: 48, padding: '8px 22px', transform: `scale(${slam(f, a) ?? 1})`, transformOrigin: '0 50%'}}>即刻生效</div>}
    {f >= b && <div style={{position: 'absolute', left: 560, top: 880, textAlign: 'right', width: 456}}>
      <div style={{fontFamily: cond, fontWeight: 800, fontSize: 130, color: RED, lineHeight: 1, transform: `scale(${slam(f, b) ?? 1})`, transformOrigin: '100% 50%'}}>−13%</div>
      <div style={{fontFamily: plex, fontSize: 24, color: k.dim}}>开盘跌超 13% · 据 BBC</div>
    </div>}
    <Flash f={f} at={0} d={3} />
  </Frame>;
}, (cue) => [{at: 10, kind: 'whoosh-short', gain: 0.07}, {at: 24, kind: 'marker', gain: 0.05}, {at: cue('a', 71), kind: 'stamp', gain: 0.08}, {at: cue('b', 94), kind: 'thud', gain: 0.1}]);

/* ---------- 2 turn: yesterday's report vs today's 8-K ---------- */

const BODY = 'On November 11, 2026, the Board of Directors … accepted the resignation of Jen-Hsun Huang, as NVIDIA’s President, Chief Executive Officer and member of the Board, effective immediately.';
const Turn = make(({f, cue, dur}) => {
  const a = cue('a', 45), b = cue('b', 89);
  const split = eo(f, 2, 10);
  return <Frame f={f} dur={dur} src={f < a ? ['本账号昨日 · 据 WSJ 报道', 0] : ['SEC 8-K · Item 5.02 · 2026-11-12', a]}>
    {/* yesterday: the report, desaturated and tinted red (caption-news split screen: the "bad" half) */}
    <div style={{position: 'absolute', left: 64, top: 310, width: 952, height: 240, background: 'rgba(255,74,61,0.12)', border: `2px solid ${f >= a ? '#3a3d38' : RED}`, padding: '20px 26px', boxSizing: 'border-box',
      opacity: 0.4 + 0.6 * split * (f >= a ? 0.55 : 1)}}>
      <div style={{fontFamily: plex, fontSize: 26, color: k.dim}}>11-11 · 据报道</div>
      <div style={{fontFamily: font, fontWeight: 900, fontSize: 64, color: k.ink, marginTop: 8, position: 'relative', display: 'inline-block'}}>
        董事会准备罢免黄仁勋
        {f >= a + 4 && <div style={{position: 'absolute', left: -8, right: -8, top: '52%', height: 7, background: RED, transformOrigin: '0 50%', transform: `scaleX(${eo(f, a + 4, a + 12)})`}} />}
      </div>
    </div>
    <div style={{position: 'absolute', left: 64, top: 575, width: 952 * eo(f, a - 6, a), height: 4, background: GREEN}} />
    {f >= a && <Doc k={k} f={f} at={a} head="NVIDIA FORM 8-K · ITEM 5.02 · FILED 2026-11-12" body={BODY} mark="accepted the resignation" markAt={b} y={610} size={42} rot={-1} />}
    <Flash f={f} at={a} d={3} />
  </Frame>;
}, (cue) => [{at: 2, kind: 'paper', gain: 0.06}, {at: cue('a', 45), kind: 'fs-impact-deep', gain: 0.1}, {at: cue('a', 45) + 4, kind: 'marker', gain: 0.07}, {at: cue('b', 89), kind: 'marker', gain: 0.08}]);

/* ---------- 3 kress: interim CEO, still CFO ---------- */

const Kress = make(({f, cue, dur}) => {
  const a = cue('a', 59), b = cue('b', 98);
  return <Frame f={f} dur={dur} src={['NVIDIA 新闻稿 · 官方肖像', 0]}>
    <div style={{position: 'absolute', left: 300, top: PIC.top, width: 780, height: PIC.h, overflow: 'hidden'}}>
      <Img src={IMG('kress.jpg')} style={{width: 860, height: 860, objectFit: 'cover', marginLeft: -40, filter: 'contrast(1.05) saturate(0.95) brightness(0.92)'}} />
      <div style={{position: 'absolute', inset: 0, background: `linear-gradient(90deg, ${k.bg} 0%, rgba(15,17,16,0) 40%)`}} />
    </div>
    <LowerThird k={k} zh="Colette Kress · 临时 CEO" en="INTERIM CEO · CONTINUES AS EVP & CFO" y={760} f={f} at={4} />
    {f >= a && <div style={{position: 'absolute', left: 64, top: 900, display: 'flex', gap: 14, opacity: eo(f, a, a + 5)}}>
      <span style={{background: GREEN, color: k.onAccent, fontFamily: font, fontWeight: 900, fontSize: 44, padding: '6px 18px'}}>CEO（临时）</span>
      <span style={{fontFamily: font, fontWeight: 900, fontSize: 44, color: k.ink, padding: '6px 0'}}>+</span>
      <span style={{background: k.panel, color: k.ink, fontFamily: font, fontWeight: 900, fontSize: 44, padding: '6px 18px', borderTop: `4px solid ${GREEN}`}}>CFO（继续）</span>
    </div>}
    {f >= b && <div style={{position: 'absolute', left: 64, top: 1000, fontFamily: font, fontWeight: 700, fontSize: 36, color: k.dim, opacity: eo(f, b, b + 6)}}>正式 CEO 遴选：内部 + 外部候选人</div>}
  </Frame>;
}, (cue) => [{at: 4, kind: 'whoosh-short', gain: 0.06}, {at: cue('a', 59), kind: 'pop', gain: 0.07}, {at: cue('b', 98), kind: 'tick', gain: 0.07}]);

/* ---------- 4 chair: the first-ever Chair, on the board since 1993 ---------- */

const Chair = make(({f, cue, dur}) => {
  const a = cue('a', 44);
  const yr = Math.round(1993 + (2026 - 1993) * ease.outCubic(clamp((f - a - 10) / 24)));
  return <Frame f={f} dur={dur} src={['SEC 8-K · 官网董事简历', 0]}>
    <Ledger k={k} f={f} at={-99} />
    <div style={{position: 'absolute', left: 64, top: 330, fontFamily: font, fontWeight: 900, fontSize: 64, color: k.ink}}>首位董事会主席</div>
    <div style={{position: 'absolute', left: 64, top: 430, background: '#fff', padding: 10, boxShadow: '0 20px 40px rgba(0,0,0,0.5)', opacity: eo(f, 4, 10)}}>
      <Img src={IMG('jones.jpg')} style={{width: 217, height: 271, display: 'block'}} />
    </div>
    <div style={{position: 'absolute', left: 330, top: 450, opacity: eo(f, 8, 14)}}>
      <div style={{fontFamily: font, fontWeight: 900, fontSize: 56, color: k.ink}}>Harvey C. Jones</div>
      <div style={{fontFamily: plex, fontSize: 26, color: k.dim, marginTop: 8}}>前新思科技 CEO · 官网肖像</div>
    </div>
    {f >= a && <div style={{position: 'absolute', left: 330, top: 580}}>
      <div style={{fontFamily: plex, fontSize: 28, color: k.dim}}>进入董事会</div>
      <div style={{display: 'flex', alignItems: 'baseline', gap: 22}}>
        <span style={{fontFamily: cond, fontWeight: 800, fontSize: 130, color: GREEN, lineHeight: 1}}>1993</span>
        <span style={{fontFamily: cond, fontWeight: 800, fontSize: 70, color: k.dim}}>→ {yr}</span>
      </div>
      {yr === 2026 && <div style={{marginTop: 10, display: 'inline-block', background: GREEN, color: k.onAccent, fontFamily: font, fontWeight: 900, fontSize: 40, padding: '4px 16px', transform: `scale(${slam(f, a + 34) ?? 1})`}}>33 年</div>}
    </div>}
  </Frame>;
}, (cue) => [{at: 4, kind: 'shutter', gain: 0.06}, ...Array.from({length: 8}, (_, i) => ({at: cue('a', 44) + 10 + i * 3, kind: 'tick', gain: 0.04})), {at: cue('a', 44) + 34, kind: 'stamp', gain: 0.09}]);

/* ---------- 5 reason: none given ---------- */

const Reason = make(({f, cue, dur}) => {
  const a = cue('a', 38);
  return <Frame f={f} dur={dur} src={['NVIDIA 新闻稿 · 正文首段', 0]}>
    <Paper src="pr-lede.png" w={1659} h={105} k2={0.57} f={f} at={2} y={420} hl={[[0, 0, 1659, 105, 8]]} rot={0} />
    <div style={{position: 'absolute', left: 64, top: 560, fontFamily: font, fontWeight: 900, fontSize: 60, color: k.ink, opacity: eo(f, 10, 16)}}>声明里：<span style={{color: GREEN}}>没有原因</span></div>
    {f >= a && <div style={{position: 'absolute', left: 64, top: 690, border: `3px dashed ${k.dim}`, padding: '10px 22px', fontFamily: font, fontWeight: 700, fontSize: 40, color: k.dim, opacity: eo(f, a, a + 6)}}>据外媒报道：与私人事务有关</div>}
  </Frame>;
}, () => [{at: 2, kind: 'paper', gain: 0.06}, {at: 10, kind: 'tick', gain: 0.07}]);

/* ---------- 6 price: three readings, three sources, three times ---------- */

const Price = make(({f, cue, dur}) => {
  const a = cue('a', 52), b = cue('b', 92);
  const T = [2, a, b], on = f < a ? 0 : f < b ? 1 : 2;
  const panel = (i: number, top: number, when: string, val: string, src: string, children: React.ReactNode) => f < T[i] ? null : (
    <div style={{position: 'absolute', left: 64, top: top + (1 - eo(f, T[i], T[i] + 6)) * 40, width: 952, opacity: eo(f, T[i], T[i] + 4), background: k.panel, border: `3px solid ${i === on ? GREEN : '#2a2e29'}`, padding: '14px 20px', boxSizing: 'border-box'}}>
      <div style={{display: 'flex', alignItems: 'baseline', gap: 18}}>
        <span style={{fontFamily: plex, fontSize: 26, color: k.dim, width: 270}}>{when}</span>
        <span style={{fontFamily: cond, fontWeight: 800, fontSize: 84, color: RED, lineHeight: 1}}>{val}</span>
        <span style={{fontFamily: plex, fontSize: 22, color: k.dim, marginLeft: 'auto'}}>{src}</span>
      </div>
      <div style={{marginTop: 10}}>{children}</div>
    </div>);
  return <Frame f={f} dur={dur} src={['前收盘 $173.73（11-11）', 0]}>
    {panel(0, 300, '盘前 · 美东 09:11', '−11.06%', '联合早报（路透）', <Img src={IMG('zaobao.png')} style={{width: 900, display: 'block', filter: 'invert(0.92) hue-rotate(180deg)'}} />)}
    {panel(1, 520, '开盘 · 美东 09:30', '−13.08%', 'BBC · Google', <><div style={{fontFamily: plex, fontSize: 30, color: k.ink}}>Open $151.01 ÷ 前收 $173.73 − 1</div><div style={{fontFamily: plex, fontSize: 24, color: k.dim, marginTop: 4}}>BBC：开盘跌超 13%</div></>)}
    {panel(2, 760, '盘中 · 美东 10:17', '−5.91%', 'Google Finance', <Img src={IMG('gf-quote.png')} style={{width: 430, display: 'block'}} />)}
  </Frame>;
}, (cue) => [{at: 2, kind: 'whoosh-short', gain: 0.06}, {at: cue('a', 52), kind: 'whoosh-short', gain: 0.06}, {at: cue('b', 92), kind: 'whoosh-short', gain: 0.06}]);

/* ---------- 7 end: the date that was already set ---------- */

const End = make(({f, cue, dur}) => {
  const a = cue('a', 47);
  return <Frame f={f} dur={dur} src={['NVIDIA 新闻稿 · 照原计划', 0]}>
    <Ledger k={k} f={f} at={-99} />
    <div style={{position: 'absolute', left: 64, top: 360, fontFamily: plex, fontSize: 30, color: k.dim}}>Q3 FY2027 财报</div>
    <div style={{position: 'absolute', left: 64, top: 410, fontFamily: cond, fontWeight: 800, fontSize: 200, color: k.ink, lineHeight: 1, transform: `scale(${slam(f, 2) ?? 1})`, transformOrigin: '0 50%'}}>11 · 17</div>
    <div style={{position: 'absolute', left: 64, top: 640, fontFamily: font, fontWeight: 900, fontSize: 48, color: k.ink}}>美西 13:20 发布 · 14:00 电话会</div>
    {f >= a && <div style={{position: 'absolute', left: 64, top: 740, background: GREEN, color: k.onAccent, fontFamily: font, fontWeight: 900, fontSize: 48, padding: '6px 20px', transform: `scale(${slam(f, a) ?? 1})`, transformOrigin: '0 50%'}}>照常</div>}
  </Frame>;
}, (cue) => [{at: 2, kind: 'thud', gain: 0.08}, {at: cue('a', 47), kind: 'stamp', gain: 0.09}]);

/* ---------- cover anchor ---------- */

const Cover = make(({f}) => <Frame f={f}>
  <div style={{position: 'absolute', left: 0, top: PIC.top, width: 1080, height: PIC.h, overflow: 'hidden'}}>
    <Img src={IMG('kress.jpg')} style={{position: 'absolute', right: -120, top: 0, width: 860, height: 860, filter: 'brightness(0.5)'}} />
  </div>
  <Paper src="pr-head.png" w={1313} h={384} k2={0.7} f={99} at={0} y={560} hl={[[50, 238, 360, 280, -99]]} />
</Frame>);

export const NVIDIA_RESIGNS_SCENES: Record<string, Scene> = {
  'nhr.hook': Hook, 'nhr.turn': Turn, 'nhr.kress': Kress, 'nhr.chair': Chair, 'nhr.reason': Reason, 'nhr.price': Price, 'nhr.end': End, 'nhr.cover': Cover,
};
