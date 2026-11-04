import React from 'react';
import {Img, staticFile} from 'remotion';
import {clamp, ease} from '../../fx';
import {font} from '../theme';
import {cond, plex} from '../fonts';
import {Cue, Scene} from '../paper';
import {BandWipe, Bug, CornerTag, Credit, Doc, Pk, Plate, QuoteCard, SourceTag, Strap, StrapItem, Veil, Vignette, W, eo, roll, slam} from '../package';

// altman-dram-pc-waste, made on the template lemo/news-package (docs/video-craft/prompt-library/vendor/lemomo-ai__
// lemo-opuscar/3961ddb/styles/news-package/STYLE.md; picked by prompt-library/选用指南.md §〇: an interview — a person,
// his own words, a recording). Sam Altman on Cheeky Pint (29:12–29:44): DRAM in everyone's computer "being used 5% of
// the time" is "quite terrible" from a global allocation perspective. Inputs: inputs/altman-dram-pc-waste/ (materials.md,
// sources.md, review.md). Storyboard: tutorials/altman-dram-pc-waste.storyboard.md.
// - review: 5% is his offhand estimate with no source; not an OpenAI policy, nobody is collecting PCs' memory; the "RAM
//   amnesty" post is a parody (debunked); HBM and DDR5 are not interchangeable, they compete for the same DRAM wafers;
//   3× is Micron's figure, 22 % / 9 % TrendForce's estimate, 434 % one kit on one shop; price rises are slowing.
// - Template system kept (STYLE.md): one package on every frame (bug, a strap that never leaves and flips its words, tab
//   = category), quote cards in his own words with the key word underlined as the voice says it, a split-flap board for
//   before → after, proportion cards on one scale, one stamp per story, band wipes between stories, mono datelines.
// - Changes (3–5, 选用指南 §〇.3): palette from the footage's pub wood (#1E0D06 / #3A1D10) + the gold of SK hynix's HBM
//   stacks (#E0B84D, AI's memory) + SK hynix teal (#267F91, your memory stick), alarm red only for the parody; footage
//   keeps its warm colour (darkened, grained) instead of the duotone; the spec card becomes a wafer card (dies turning
//   gold to 22 %, a 100-cell output bar lighting only 9) as the signature; check → verdict order borrowed from
//   lemo/visual-investigation; synthesized news score with the climax on the wafer stamp.
// - 9:16: picture zone y 260–1150, strap at 1180, caption bar under it, host bottom-left of the picture in four scenes.

export const ADR: Pk = {bg: '#1E0D06', panel: '#3A1D10', ink: '#F2E6DA', accent: '#E0B84D', onAccent: '#1E0D06', dim: '#B9A89A', second: '#267F91'};
const k = ADR;
const GOLD = k.accent, TEAL = '#267F91', RED = '#D2412F';
const CLIP = 'video/altman-dram-pc-waste/cheekypint.mp4';
const IMG = (n: string) => staticFile(`images/altman-dram-pc-waste/${n}`);
const WARM = 'contrast(1.06) saturate(0.9) brightness(0.92)';
const TAG = '视频 @Cheeky Pint｜案例展示';

const S_QUOTE: StrapItem = {at: -999, tab: '原话 QUOTE', zh: '奥特曼：个人电脑里的内存太浪费', en: 'SAM ALTMAN · CHEEKY PINT · OCT 29'};
const S_WHO: StrapItem = {at: 0, tab: '人物 PROFILE', zh: 'Sam Altman · OpenAI CEO', en: 'CHEEKY PINT WITH JOHN COLLISON · 29:12'};
const S_CHECK: StrapItem = {at: 0, tab: '核实 CHECK', zh: '“5%” 是他随口估计', en: 'NOT CONFIRMED · NO SOURCE GIVEN'};
const S_RUMOR: StrapItem = {at: 0, tab: '辟谣 FACT CHECK', zh: '“交内存换订阅” 是恶搞', en: 'PARODY POST · DEBUNKED OCT 31'};
const S_WAFER: StrapItem = {at: 0, tab: '晶圆 WAFERS', zh: 'HBM 和内存条抢同一批晶圆', en: 'SAME DRAM WAFERS · NOT INTERCHANGEABLE'};
const S_PRICE: StrapItem = {at: 0, tab: '价格 PRICES', zh: '内存条涨价，涨幅在收敛', en: 'DRAM CONTRACT PRICES · QOQ'};
const S_VERDICT: StrapItem = {at: 0, tab: '判定 VERDICT', zh: '没人收你内存，但在抢晶圆', en: 'NO POLICY · SAME WAFERS'};

/** A template scene draws the whole frame in its backdrop (with `wipe`, a band wipe brushes it in); the stage stays empty. */
const make = (draw: NonNullable<Scene['backdrop']>, sfx?: Scene['sfx'], wipe = false): Scene => {
  const S: Scene = () => null;
  S.backdrop = wipe ? (props) => <>{draw(props)}<BandWipe k={k} f={props.f} at={-2} /></> : draw;
  S.sfx = sfx;
  return S;
};
/** The package layer: wood-dark ground, bug, strap, an optional source tag; the picture goes under it. */
const Frame: React.FC<{f: number; strap: StrapItem[]; src?: [string, number]; children: React.ReactNode}> = ({f, strap, src, children}) => (
  <div style={{position: 'absolute', inset: 0, background: k.bg, overflow: 'hidden'}}>
    {[0, 1, 2].map((i) => <div key={i} style={{position: 'absolute', left: -200 + i * 420, top: -200, width: 120, height: 2400, transform: 'rotate(24deg)', background: 'rgba(224,184,77,0.03)'}} />)}
    {children}
    <Veil from={1120} top={false} a={0.9} />
    <Bug k={k} tag="AI 观点" topic="奥特曼谈内存" en="CHEEKY PINT" />
    {src && <SourceTag k={k} label={src[0]} f={f} at={src[1]} />}
    <Strap k={k} items={strap} f={f} end="DRAM" />
    <Vignette a={0.35} />
  </div>
);
/** The interview in the picture zone, in its own warm colour (darkened by `dark`). */
const Footage: React.FC<{f: number; from: number; dur: number; z?: [number, number]; dark?: number}> = ({f, from, dur, z = [1.0, 1.05], dark = 0}) => {
  const s = z[0] + (z[1] - z[0]) * ease.inOutCubic(clamp(f / Math.max(1, dur)));
  return <div style={{position: 'absolute', left: 0, top: 260, width: W, height: 890, overflow: 'hidden'}}>
    <div style={{position: 'absolute', inset: 0, transform: `scale(${s})`, transformOrigin: '50% 30%'}}>
      <Plate src={CLIP} video from={from} style={{left: -251, top: 0, width: 1582, height: 890}} filter={WARM} warm={0} />
    </div>
    {dark > 0 && <div style={{position: 'absolute', inset: 0, background: `rgba(30,13,6,${dark})`}} />}
    <Credit text={TAG} bottom={890} />
  </div>;
};
const Eyebrow: React.FC<{text: string; x?: number; y: number; f?: number; at?: number; color?: string}> = ({text, x = 64, y, f = 0, at = -99, color = k.dim}) => (
  <div style={{position: 'absolute', left: x, top: y, fontFamily: plex, fontSize: 24, color, letterSpacing: 2, opacity: eo(f, at, at + 6), whiteSpace: 'nowrap'}}>{text}</div>
);
/** A stamp: lands from 1.9× in 0.16 s with an expanding ellipse. One per story. */
const Stamp: React.FC<{f: number; at: number; x: number; y: number; zh: string; en: string; color?: string; ink?: boolean; rot?: number; size?: number}> = ({
  f, at, x, y, zh, en, color = GOLD, ink = false, rot = -8, size = 56,
}) => {
  if (f < at) return null;
  const s = 1.9 - 0.9 * ease.outCubic(clamp((f - at) / 5)), ring = eo(f, at + 3, at + 15);
  return <div style={{position: 'absolute', left: x, top: y, transform: `rotate(${rot}deg) scale(${s})`, transformOrigin: '50% 50%'}}>
    <div style={{position: 'absolute', left: -40 * ring, top: -24 * ring, right: -40 * ring, bottom: -24 * ring, borderRadius: '50%', border: `3px solid ${color}`, opacity: 1 - ring}} />
    <div style={{background: ink ? k.bg : color, border: ink ? `5px double ${color}` : 'none', padding: '8px 22px', display: 'flex', alignItems: 'baseline', gap: 14, whiteSpace: 'nowrap'}}>
      <span style={{fontFamily: font, fontWeight: 900, fontSize: size, color: ink ? color : (color === GOLD ? k.onAccent : '#fff')}}>{zh}</span>
      <span style={{fontFamily: cond, fontWeight: 800, fontSize: size * 0.58, color: ink ? color : (color === GOLD ? k.onAccent : '#fff'), letterSpacing: 1}}>{en}</span>
    </div>
  </div>;
};
/** A label chip: colour bar + Chinese + one small Latin line. */
const Chip: React.FC<{f: number; at: number; x: number; y: number; zh: string; en?: string; c?: string; size?: number}> = ({f, at, x, y, zh, en, c = GOLD, size = 46}) => {
  if (f < at) return null;
  const p = eo(f, at, at + 7);
  return <div style={{position: 'absolute', left: x, top: y, display: 'flex', clipPath: `inset(-10px ${(1 - p) * 100}% -10px 0)`}}>
    <div style={{width: 10, background: c}} />
    <div style={{background: 'rgba(30,13,6,0.9)', padding: '8px 20px'}}>
      <div style={{fontFamily: font, fontWeight: 900, fontSize: size, color: k.ink, whiteSpace: 'nowrap', lineHeight: 1.12}}>{zh}</div>
      {en && <div style={{fontFamily: cond, fontWeight: 600, fontSize: 26, color: c, letterSpacing: 1, whiteSpace: 'nowrap'}}>{en}</div>}
    </div>
  </div>;
};
const Big5: React.FC<{f: number; at: number; x: number; y: number; size: number; o?: number}> = ({f, at, x, y, size, o = 1}) => (
  <div style={{position: 'absolute', left: x, top: y, fontFamily: cond, fontWeight: 800, fontSize: size, color: GOLD, lineHeight: 0.9, opacity: o,
    textShadow: '0 10px 40px rgba(0,0,0,0.6)', transformOrigin: '0 60%', transform: `scale(${slam(f, at, 5) ?? 1})`}}>5%</div>
);

/* ---------- the wafer: dies in a circle, ordered by angle so a share sweeps round like a pie ---------- */

type Die = {x: number; y: number; a: number};
const DIES = (() => {
  const out: Die[] = [], n = 13, c = (n - 1) / 2;
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
    const dx = i - c, dy = j - c;
    if (Math.hypot(Math.abs(dx) + 0.5, Math.abs(dy) + 0.5) <= n / 2 + 0.1) out.push({x: i / n, y: j / n, a: (Math.atan2(dx, -dy) + 2 * Math.PI) % (2 * Math.PI)});
  }
  return out.sort((p, q) => p.a - q.a);
})();
/** `gold` is the share of dies (0–1) turned gold, sweeping clockwise from 12 o'clock. */
const Wafer: React.FC<{x: number; y: number; d: number; gold?: number; base?: string; glow?: number}> = ({x, y, d, gold = 0, base = TEAL, glow = 0}) => {
  const lit = Math.round(DIES.length * gold), cell = d / 13;
  return <div style={{position: 'absolute', left: x, top: y, width: d, height: d, borderRadius: '50%', background: 'radial-gradient(circle at 35% 30%, #5b4a3c, #241510 70%)',
    boxShadow: `0 20px 50px rgba(0,0,0,0.55), 0 0 ${60 * glow}px ${GOLD}66`, overflow: 'hidden'}}>
    {DIES.map((p, i) => <div key={i} style={{position: 'absolute', left: p.x * d + cell * 0.08, top: p.y * d + cell * 0.08, width: cell * 0.84, height: cell * 0.84,
      background: i < lit ? GOLD : base, opacity: i < lit ? 1 : 0.85, borderRadius: 2}} />)}
    <div style={{position: 'absolute', left: '46%', bottom: 2, width: '8%', height: 8, background: k.bg, borderRadius: 4}} />
  </div>;
};

/* ---------- 1 hook: the interview, a huge 5%, his line ---------- */

const hookPlan = (cue: Cue) => ({a: cue('a', 54), b: cue('b', 105)});
const Hook = make(({f, cue, dur}) => {
  const p = hookPlan(cue);
  return <Frame f={f} strap={[S_QUOTE]}>
    <Footage f={f} from={12} dur={dur} z={[1.0, 1.08]} />
    <div style={{position: 'absolute', left: 64, top: 300, background: 'rgba(30,13,6,0.82)', padding: '10px 20px', fontFamily: cond, fontWeight: 600, fontSize: 46, color: k.ink, whiteSpace: 'nowrap'}}>
      “…being used <span style={{color: GOLD, backgroundImage: `linear-gradient(${GOLD}, ${GOLD})`, backgroundSize: `${eo(f, p.a, p.a + 10) * 100}% 5px`, backgroundPosition: '0 100%', backgroundRepeat: 'no-repeat'}}>5% of the time.</span>”
    </div>
    <Big5 f={f} at={p.a} x={560} y={760} size={300} />
    <div style={{position: 'absolute', left: 580, top: 1040, fontFamily: font, fontWeight: 900, fontSize: 40, color: k.ink, opacity: 0.92, textShadow: '0 3px 12px #000'}}>的时间在用</div>
    <Chip f={f} at={p.b} x={64} y={390} zh="相当糟糕" en="“QUITE TERRIBLE” · HIS WORDS" />
  </Frame>;
}, (cue) => {
  const p = hookPlan(cue);
  return [{at: 0, kind: 'fs-impact-deep', gain: 0.14}, {at: p.a, kind: 'thud', gain: 0.12}, {at: p.b, kind: 'tick', gain: 0.08}];
});

/* ---------- 2 mean: his words on a quote card over the darkened interview ---------- */

const meanPlan = (cue: Cue) => ({a: cue('a', 64), b: cue('b', 91)});
const Mean = make(({f, cue, dur}) => {
  const p = meanPlan(cue);
  return <Frame f={f} strap={[S_QUOTE, S_WHO]}>
    <Footage f={f} from={20} dur={dur} z={[1.06, 1.14]} dark={0.74} />
    <div style={{position: 'absolute', inset: 0, transformOrigin: '64px 400px', transform: `scale(${1 + 0.05 * ease.inOutCubic(clamp(f / dur))})`}}>
      <QuoteCard k={k} f={f} at={-4} y={330} size={74} lines={['From a global allocation', 'perspective … it\'s quite', 'terrible. You want maximum', 'utilization in the cloud.']}
        marks={[{text: 'global allocation', at: 4}, {text: 'maximum', at: p.a + 2}, {text: 'utilization in the cloud.', at: p.a + 6}, {text: 'terrible.', at: p.b + 2}]}
        gist="放云端用满，比放每人电脑里划算" who="SAM ALTMAN · CHEEKY PINT · 29:12–29:44" />
    </div>
  </Frame>;
}, (cue) => {
  const p = meanPlan(cue);
  return [{at: 0, kind: 'thud', gain: 0.1}, {at: p.a + 2, kind: 'tick', gain: 0.06}, {at: p.b + 2, kind: 'fs-paper-slide', gain: 0.08}];
});

/* ---------- 3 check: the 5% framed, a transcript note, no source; and no policy ---------- */

const checkPlan = (cue: Cue) => ({a: cue('a', 50), b: cue('b', 85)});
const Check = make(({f, cue, dur}) => {
  const p = checkPlan(cue);
  const dash = eo(f, 4, 16);
  return <Frame f={f} strap={[S_WHO, S_CHECK]} src={['METAPATCHAI · TRANSCRIPT CHECK', p.a - 6]}>
    <Footage f={f} from={36} dur={dur} z={[1.12, 1.16]} dark={0.8} />
    <Big5 f={f} at={-30} x={90} y={330} size={220} />
    <div style={{position: 'absolute', left: 70, top: 320, width: 400 * dash + 1, height: 230, border: `5px dashed ${k.ink}`, borderRightWidth: dash > 0.95 ? 5 : 0, opacity: dash}} />
    <Stamp f={f} at={p.a + 4} x={500} y={410} zh="没给依据" en="NO SOURCE" ink rot={-7} />
    <Doc k={k} f={f} at={p.a - 6} y={600} w={940} size={44} rot={-1.2} head="METAPATCHAI · 2026-10-31 · 逐字稿核对"
      body="Not confirmed: the 5% figure. Altman states it but gives no source." mark="gives no source." markAt={p.a + 2} />
    {f >= p.b - 2 && <div style={{position: 'absolute', left: 64, top: 900, width: 870, display: 'flex', alignItems: 'center', gap: 22, background: 'rgba(30,13,6,0.92)', padding: '18px 24px',
      borderLeft: `10px solid ${k.ink}`, opacity: eo(f, p.b - 2, p.b + 5), transform: `translateY(${(1 - eo(f, p.b - 2, p.b + 6)) * 30}px)`}}>
      <span style={{fontFamily: font, fontWeight: 900, fontSize: 50, color: k.ink, whiteSpace: 'nowrap'}}>收走个人内存？</span>
      <span style={{fontFamily: cond, fontWeight: 800, fontSize: 80, color: RED, lineHeight: 0.8, transform: `scale(${slam(f, p.b + 6, 4) ?? 0})`}}>✕</span>
      <span style={{fontFamily: font, fontWeight: 700, fontSize: 36, color: k.dim, whiteSpace: 'nowrap', opacity: eo(f, p.b + 8, p.b + 14)}}>原话里没有</span>
    </div>}
  </Frame>;
}, (cue) => {
  const p = checkPlan(cue);
  return [{at: 0, kind: 'thud', gain: 0.1}, {at: 4, kind: 'tick', gain: 0.06}, {at: p.a - 6, kind: 'paper', gain: 0.08}, {at: p.a + 4, kind: 'stamp', gain: 0.16}, {at: p.b + 6, kind: 'tap', gain: 0.1}];
});

/* ---------- 4 rumor: the parody post, a red stamp, the debunk headline ---------- */

const rumorPlan = (cue: Cue) => ({a: cue('a', 51), b: cue('b', 75)});
const Rumor = make(({f, cue, dur}) => {
  const p = rumorPlan(cue);
  const push = 1 + 0.06 * ease.inOutCubic(clamp(f / dur));
  const title = eo(f, p.b - 4, p.b + 6), hl = eo(f, p.b + 4, p.b + 16);
  return <Frame f={f} strap={[S_CHECK, S_RUMOR]} src={['动区动趋 BLOCKTEMPO · 2026-10-31', 6]}>
    <Eyebrow text="X · 2026-10-31 · 网友恶搞帖（账号已模糊）" y={318} />
    <div style={{position: 'absolute', left: 40, top: 360, width: 1000, transform: `scale(${push}) rotate(-1deg)`, transformOrigin: '50% 0', background: '#fff', padding: '20px 10px', boxShadow: '0 30px 60px rgba(0,0,0,0.5)'}}>
      <Img src={IMG('parody.jpg')} style={{width: '100%', display: 'block'}} />
    </div>
    <div style={{position: 'absolute', left: 64, top: 640, display: 'flex', gap: 18, opacity: eo(f, 8, 16)}}>
      {[['ram amnesty', '“内存大赦”'], ['$200 / 月', '用你自己的内存']].map(([en, zh]) => <div key={en} style={{background: 'rgba(30,13,6,0.9)', borderLeft: `8px solid ${k.dim}`, padding: '8px 18px'}}>
        <div style={{fontFamily: cond, fontWeight: 800, fontSize: 52, color: k.ink, whiteSpace: 'nowrap'}}>{en}</div>
        <div style={{fontFamily: font, fontWeight: 700, fontSize: 30, color: k.dim, whiteSpace: 'nowrap'}}>{zh}</div>
      </div>)}
    </div>
    <Stamp f={f} at={p.a} x={470} y={430} zh="恶搞" en="PARODY" color={RED} rot={-10} size={84} />
    {title > 0 && <div style={{position: 'absolute', left: 40, top: 820 + (1 - title) * 140, width: 1000, opacity: title, background: '#fff', boxShadow: '0 30px 60px rgba(0,0,0,0.5)', transform: 'rotate(1deg)'}}>
      <Img src={IMG('blocktempo-title.jpg')} style={{width: '100%', display: 'block'}} />
      <div style={{position: 'absolute', left: '22.5%', top: '55%', width: `${hl * 14}%`, height: '22%', background: `${GOLD}99`, mixBlendMode: 'multiply'}} />
    </div>}
  </Frame>;
}, (cue) => {
  const p = rumorPlan(cue);
  return [{at: 0, kind: 'fs-whoosh-wipe', gain: 0.12}, {at: p.a, kind: 'stamp', gain: 0.2}, {at: p.a + 1, kind: 'fs-impact-deep', gain: 0.12}, {at: p.b - 4, kind: 'fs-paper-slide', gain: 0.08}];
}, true);

/* ---------- 5 wafer: SK hynix's GPU + HBM model, your DDR5 sticks, one wafer ---------- */

const waferPlan = (cue: Cue) => ({a: cue('a', 30), b: cue('b', 98)});
const WaferScene = make(({f, cue, dur}) => {
  const p = waferPlan(cue);
  const s = 1 + 0.06 * ease.inOutCubic(clamp(f / dur)), dd = eo(f, p.a + 14, p.a + 24), ln = eo(f, p.b - 6, p.b + 8), wf = eo(f, p.b - 10, p.b);
  return <Frame f={f} strap={[S_RUMOR, S_WAFER]} src={['SK HYNIX NEWSROOM · 官方展台实拍', 4]}>
    <div style={{position: 'absolute', left: 0, top: 290, width: W, height: 560, overflow: 'hidden'}}>
      <div style={{position: 'absolute', inset: 0, transform: `scale(${s})`, transformOrigin: '62% 40%'}}>
        <Img src={IMG('hbm-gpu-model.png')} style={{position: 'absolute', left: -164, top: -131, width: 1626, height: 916, filter: 'contrast(1.05) saturate(0.95)'}} />
      </div>
    </div>
    <Chip f={f} at={p.a} x={440} y={320} zh="HBM · AI 卡上的内存" en="STACKED NEXT TO THE GPU" c={GOLD} size={42} />
    {dd > 0 && <div style={{position: 'absolute', left: 64, top: 880 + (1 - dd) * 120, width: 520, height: 292, opacity: dd, overflow: 'hidden', boxShadow: '0 20px 50px rgba(0,0,0,0.6)', border: `4px solid ${TEAL}`}}>
      <Img src={IMG('ddr5-sticks.jpg')} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
      <div style={{position: 'absolute', left: 0, bottom: 0, background: TEAL, color: '#fff', fontFamily: font, fontWeight: 900, fontSize: 36, padding: '4px 14px'}}>你的内存条 DDR5</div>
    </div>}
    {wf > 0 && <>
      <svg width={W} height={1920} style={{position: 'absolute', left: 0, top: 0}}>
        <path d="M 690 760 C 820 840, 860 880, 840 900" stroke={GOLD} strokeWidth={7} fill="none" strokeDasharray="1000" strokeDashoffset={1000 * (1 - ln)} />
        <path d="M 584 1030 C 640 1030, 660 1030, 690 1030" stroke={TEAL} strokeWidth={7} fill="none" strokeDasharray="200" strokeDashoffset={200 * (1 - ln)} />
      </svg>
      <div style={{opacity: wf, transform: `scale(${0.7 + 0.3 * wf})`, transformOrigin: '840px 1030px'}}>
        <Wafer x={700} y={890} d={280} gold={0} />
      </div>
      <div style={{position: 'absolute', left: 610, top: 870, fontFamily: font, fontWeight: 900, fontSize: 34, color: k.ink, opacity: ln, textShadow: '0 2px 10px #000', whiteSpace: 'nowrap'}}>同一批 DRAM 晶圆</div>
    </>}
  </Frame>;
}, (cue) => {
  const p = waferPlan(cue);
  return [{at: 0, kind: 'fs-whoosh-wipe', gain: 0.12}, {at: p.a, kind: 'tick', gain: 0.07}, {at: p.a + 14, kind: 'whoosh-short', gain: 0.07}, {at: p.b - 6, kind: 'chime', gain: 0.1}];
}, true);

/* ---------- 6 triple: same capacity — DDR5 one block of wafer, HBM three (Micron) ---------- */

const triplePlan = (cue: Cue) => ({a: cue('a', 43)});
const Block: React.FC<{f: number; at: number; c: string; x: number; y: number; step?: number}> = ({f, at, c, x, y, step = 0.7}) => (
  <div style={{position: 'absolute', left: x, top: y, width: 250, display: 'flex', flexWrap: 'wrap', gap: 8}}>
    {Array.from({length: 12}, (_, i) => <div key={i} style={{width: 56, height: 56, background: f >= at + i * step ? c : 'rgba(255,255,255,0.07)', borderRadius: 3,
      transform: `scale(${f >= at + i * step ? (slam(f, at + i * step, 3) ?? 1) : 1})`}} />)}
  </div>
);
const Triple = make(({f, cue}) => {
  const p = triplePlan(cue);
  const br = eo(f, p.a + 30, p.a + 38);
  return <Frame f={f} strap={[S_WAFER]} src={['MICRON · HOT CHIPS 2026 · VIA TOM\'S HARDWARE', 4]}>
    <div style={{position: 'absolute', left: 64, top: 300, width: 952, background: '#fff', padding: '10px 14px', opacity: 0.92, transform: 'rotate(-0.8deg)'}}>
      <Img src={IMG('toms-title.jpg')} style={{width: '100%', display: 'block'}} />
    </div>
    <Eyebrow text="SAME CAPACITY · WAFER AREA · 同样容量用掉的晶圆" y={530} />
    <div style={{position: 'absolute', left: 64, top: 590, fontFamily: font, fontWeight: 900, fontSize: 54, color: TEAL}}>DDR5 <span style={{fontSize: 34, color: k.dim}}>你的内存条</span></div>
    <Block f={f} at={6} c={TEAL} x={64} y={670} step={0.4} />
    <div style={{position: 'absolute', left: 64, top: 870, fontFamily: font, fontWeight: 900, fontSize: 54, color: GOLD, opacity: eo(f, p.a - 6, p.a)}}>HBM <span style={{fontSize: 34, color: k.dim}}>AI 卡</span></div>
    {f >= p.a - 2 && [0, 1, 2].map((i) => <Block key={i} f={f} at={p.a + i * 9} c={GOLD} x={64 + i * 290} y={950} step={0.6} />)}
    {br > 0 && <>
      <div style={{position: 'absolute', left: 64, top: 1148, width: 830 * br, height: 0, borderTop: `5px solid ${k.ink}`}} />
      <div style={{position: 'absolute', left: 440, top: 640, fontFamily: cond, fontWeight: 800, fontSize: 170, color: GOLD, lineHeight: 1, transformOrigin: '0 50%', transform: `scale(${slam(f, p.a + 32, 5) ?? 1})`}}>≈3×</div>
    </>}
  </Frame>;
}, (cue) => {
  const p = triplePlan(cue);
  return [{at: 0, kind: 'thud', gain: 0.1}, ...[0, 1, 2].map((i) => ({at: p.a + i * 9, kind: 'tick', gain: 0.07})), {at: p.a + 32, kind: 'fs-impact-deep', gain: 0.13}];
});

/* ---------- 7 share: the signature — a wafer turning gold to 22 %, output only 9 % ---------- */

const sharePlan = (cue: Cue) => ({a: cue('a', 107)});
const Share = make(({f, cue, dur}) => {
  const p = sharePlan(cue);
  const g = 0.22 * ease.inOutCubic(clamp((f - 14) / Math.max(1, p.a - 24)));
  const bits = eo(f, p.a, p.a + 14), stampAt = p.a + 10;
  const push = 1 + 0.04 * ease.inOutCubic(clamp(f / dur));
  return <Frame f={f} strap={[S_WAFER]} src={['TRENDFORCE 估计 · 2026 年底 · 三大原厂', 4]}>
    <div style={{position: 'absolute', inset: 0, transform: `scale(${push})`, transformOrigin: '540px 640px'}}>
      <Eyebrow text="DRAM WAFER INPUT · 晶圆投入" y={300} />
      <Wafer x={64} y={350} d={560} gold={g} glow={eo(f, stampAt, stampAt + 6)} />
      <div style={{position: 'absolute', left: 650, top: 380, fontFamily: cond, fontWeight: 800, fontSize: 190, color: GOLD, lineHeight: 0.9}}>{roll(f, 14, p.a - 10, 22)}%</div>
      <div style={{position: 'absolute', left: 656, top: 560, fontFamily: font, fontWeight: 900, fontSize: 44, color: k.ink}}>晶圆给了 HBM</div>
      <Eyebrow text="BIT OUTPUT · 产出容量" y={950} f={f} at={p.a - 4} />
      {f >= p.a - 4 && <div style={{position: 'absolute', left: 64, top: 990, display: 'grid', gridTemplateColumns: 'repeat(25, 30px)', gap: 6}}>
        {Array.from({length: 100}, (_, i) => <div key={i} style={{width: 30, height: 30, borderRadius: 2,
          background: i < 9 && bits * 9 > i ? GOLD : (bits * 100 > i ? 'rgba(38,127,145,0.85)' : 'rgba(255,255,255,0.06)')}} />)}
      </div>}
      <div style={{position: 'absolute', left: 650, top: 620, fontFamily: cond, fontWeight: 800, fontSize: 190, color: GOLD, lineHeight: 0.9, opacity: eo(f, p.a, p.a + 6)}}>9%</div>
      <div style={{position: 'absolute', left: 656, top: 788, fontFamily: font, fontWeight: 900, fontSize: 44, color: k.ink, opacity: eo(f, p.a + 2, p.a + 8)}}>容量是 HBM</div>
    </div>
    <Stamp f={f} at={stampAt} x={110} y={884} zh="22% 晶圆 → 9% 容量" en="TRENDFORCE EST." ink rot={-2} size={60} />
  </Frame>;
}, (cue) => {
  const p = sharePlan(cue);
  return [{at: 0, kind: 'thud', gain: 0.1}, {at: 14, kind: 'whoosh', gain: 0.06}, {at: p.a, kind: 'tick', gain: 0.07}, {at: p.a + 10, kind: 'stamp', gain: 0.2}, {at: p.a + 11, kind: 'fs-impact-deep', gain: 0.15}];
});

/* ---------- 8 price: split-flap £79 → £422 ---------- */

const pricePlan = (cue: Cue) => ({a: cue('a', 46), b: cue('b', 103)});
const Flap: React.FC<{from: string; to: string; f: number; at: number; w?: number; h?: number; c?: string}> = ({from, to, f, at, w = 110, h = 170, c = k.ink}) => {
  const p = clamp((f - at) / 5), show = p < 0.5 ? from : to, sy = Math.abs(1 - 2 * p);
  const face = (ch: string) => <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: cond, fontWeight: 800, fontSize: h * 0.82, color: c}}>{ch}</div>;
  return <div style={{position: 'relative', width: w, height: h, background: '#2E1A10', borderRadius: 6, overflow: 'hidden', boxShadow: 'inset 0 -2px 0 rgba(0,0,0,0.5)'}}>
    {face(p >= 1 ? to : from)}
    {p > 0 && p < 1 && <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: h / 2, overflow: 'hidden', background: '#3A2216', transformOrigin: '50% 100%', transform: `scaleY(${sy})`}}>
      <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: h}}>{face(show)}</div></div>}
    <div style={{position: 'absolute', left: 0, right: 0, top: h / 2 - 1, height: 2, background: 'rgba(0,0,0,0.55)'}} />
  </div>;
};
const Price = make(({f, cue, dur}) => {
  const p = pricePlan(cue);
  const flipAt = p.b + 6, pct = eo(f, flipAt + 10, flipAt + 18);
  const from = '£ 79', to = '£422';
  return <Frame f={f} strap={[S_WAFER, S_PRICE]} src={['IT之家 / 新浪科技 · 2026-10-15 · OC3D 追踪', 4]}>
    <div style={{position: 'absolute', left: 0, top: 290, width: W, height: 420, overflow: 'hidden'}}>
      <Img src={IMG('ddr5-sticks.jpg')} style={{position: 'absolute', left: 0, top: -80, width: W, height: 607, objectFit: 'cover', transform: `scale(${1 + 0.16 * ease.inOutCubic(clamp(f / dur))})`, transformOrigin: '30% 50%', filter: 'brightness(0.8)'}} />
      <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(30,13,6,0) 50%, rgba(30,13,6,1))'}} />
    </div>
    <Chip f={f} at={p.a} x={64} y={560} zh="英国亚马逊 · 32GB DDR5-6000" en="CRUCIAL PRO · ONE KIT, ONE SHOP" c={TEAL} size={40} />
    <CornerTag k={k} text="单一型号 · 不代表全市场" f={f} at={p.a + 6} y={300} />
    <Eyebrow text="2025-09-18" y={760} f={f} at={6} />
    <Eyebrow text="2026-10-14 · 13 个月后" x={560} y={760} f={f} at={p.b} color={GOLD} />
    <div style={{position: 'absolute', left: 64, top: 800, display: 'flex', gap: 8}}>
      {[...to].map((ch, i) => <Flap key={i} from={from[i]} to={ch} f={f} at={flipAt + i * 2} c={f >= flipAt + 8 && i > 0 ? GOLD : k.ink} />)}
    </div>
    {/* 13 months run along a rail while the voice names the kit; the board flips when it arrives */}
    {f >= p.a && (() => {
      const r = eo(f, p.a + 4, p.b + 4), m = Math.min(13, Math.floor(r * 13));
      return <div style={{position: 'absolute', left: 64, top: 1010, width: 952, opacity: eo(f, p.a, p.a + 6)}}>
        <div style={{position: 'absolute', left: 0, top: 0, width: 952, height: 10, background: 'rgba(255,255,255,0.08)'}} />
        {Array.from({length: 14}, (_, i) => <div key={i} style={{position: 'absolute', left: (i / 13) * 940, top: -8, width: 4, height: 26, background: i <= m ? GOLD : 'rgba(255,255,255,0.2)'}} />)}
        <div style={{position: 'absolute', left: 0, top: 0, width: 952 * r, height: 10, background: GOLD}} />
        <div style={{position: 'absolute', left: Math.min(800, 952 * r - 40), top: 30, fontFamily: cond, fontWeight: 800, fontSize: 52, color: GOLD, whiteSpace: 'nowrap'}}>+{m} 个月</div>
      </div>;
    })()}
    {pct > 0 && <div style={{position: 'absolute', left: 560, top: 800, fontFamily: cond, fontWeight: 800, fontSize: 150, color: GOLD, lineHeight: 1.1, opacity: pct,
      transformOrigin: '0 50%', transform: `scale(${slam(f, flipAt + 10, 5) ?? 1})`}}>+434%</div>}
  </Frame>;
}, (cue) => {
  const p = pricePlan(cue);
  return [{at: 0, kind: 'fs-whoosh-wipe', gain: 0.12}, {at: p.a, kind: 'tick', gain: 0.06}, ...Array.from({length: 4}, (_, i) => ({at: p.b + 6 + i * 2, kind: 'tick', gain: 0.08})),
    {at: p.b + 16, kind: 'thud', gain: 0.12}];
}, true);

/* ---------- 9 ease: quarterly contract price rises getting smaller ---------- */

const easePlan = (cue: Cue) => ({a: cue('a', 37), b: cue('b', 65)});
const Q = [['一季', 92.5, '90–95%', '1Q26'], ['二季', 80, '≈80%', '2Q26'], ['三季', 40, '≈40%', '3Q26'], ['四季', 15, '10–15%', '4Q26 预测']] as const;
const Ease = make(({f, cue}) => {
  const p = easePlan(cue);
  const base = 1080, scale = 6.2;
  const at = [4, 10, 16, p.a + 4];
  const ln = eo(f, p.b + 4, p.b + 18);
  return <Frame f={f} strap={[S_PRICE]} src={['TRENDFORCE · 工商时报转述', 4]}>
    <Eyebrow text="一般型 DRAM 合约价 · 季增 QOQ" y={300} />
    {Q.map(([zh, v, lab, en], i) => {
      const g = eo(f, at[i], at[i] + 10), h = v * scale * g, x = 64 + i * 238, fc = i === 3;
      return <div key={zh}>
        <div style={{position: 'absolute', left: x, top: base - h, width: 190, height: h, background: fc ? `repeating-linear-gradient(135deg, ${GOLD} 0 14px, ${GOLD}77 14px 28px)` : GOLD, opacity: fc ? 1 : 0.55 + 0.15 * i}} />
        <div style={{position: 'absolute', left: x, top: base - h - 70, width: 230, fontFamily: cond, fontWeight: 800, fontSize: 60, color: fc ? GOLD : k.ink, opacity: g, whiteSpace: 'nowrap'}}>{lab}</div>
        <div style={{position: 'absolute', left: x, top: base + 14, fontFamily: font, fontWeight: 900, fontSize: 40, color: k.ink, opacity: g}}>{zh}</div>
        <div style={{position: 'absolute', left: x, top: base + 64, fontFamily: plex, fontSize: 22, color: fc ? GOLD : k.dim, opacity: g, whiteSpace: 'nowrap'}}>{en}</div>
      </div>;
    })}
    <div style={{position: 'absolute', left: 50, top: base, width: 980, height: 4, background: k.dim}} />
    {ln > 0 && <svg width={W} height={1920} style={{position: 'absolute', left: 0, top: 0}}>
      <path d={`M 159 ${base - 92.5 * scale - 90} L 397 ${base - 80 * scale - 90} L 635 ${base - 40 * scale - 90} L 873 ${base - 15 * scale - 90}`} stroke={k.ink} strokeWidth={5} strokeDasharray="14 10" fill="none"
        style={{clipPath: `inset(0 ${(1 - ln) * 100}% 0 0)`}} />
    </svg>}
    <Stamp f={f} at={p.b + 16} x={560} y={420} zh="在收敛" en="SLOWING" ink rot={-6} />
  </Frame>;
}, (cue) => {
  const p = easePlan(cue);
  return [{at: 0, kind: 'thud', gain: 0.1}, {at: 4, kind: 'tick', gain: 0.06}, {at: 10, kind: 'tick', gain: 0.06}, {at: 16, kind: 'tick', gain: 0.06}, {at: p.a + 4, kind: 'tick', gain: 0.08},
    {at: p.b + 16, kind: 'stamp', gain: 0.16}];
});

/* ---------- 10 end: back to the interview and the 5%, the verdict stamp ---------- */

const endPlan = (cue: Cue) => ({a: cue('a', 61)});
const End = make(({f, cue, dur}) => {
  const p = endPlan(cue);
  const dim = eo(f, 2, 20);
  return <Frame f={f} strap={[S_PRICE, S_VERDICT]}>
    <Footage f={f} from={1} dur={dur} z={[1.08, 1.0]} dark={0.25 + 0.3 * eo(f, p.a - 6, p.a + 6)} />
    <div style={{position: 'absolute', left: 64, top: 300, background: 'rgba(30,13,6,0.82)', padding: '10px 20px', fontFamily: cond, fontWeight: 600, fontSize: 46, color: k.ink, whiteSpace: 'nowrap', opacity: 1 - 0.5 * dim}}>
      “…being used <span style={{color: GOLD}}>5% of the time.</span>”
    </div>
    <div style={{position: 'absolute', left: 560 + 300 * dim, top: 760 - 400 * dim, transformOrigin: '0 0', transform: `scale(${1 - 0.55 * dim})`}}>
      <Big5 f={f} at={-30} x={0} y={0} size={300} o={1 - 0.45 * dim} />
    </div>
    <Chip f={f} at={8} x={64} y={420} zh="收走个人内存：没有" en="NOT AN OPENAI POLICY" c={k.ink} size={44} />
    <div style={{position: 'absolute', left: 440, top: 640, opacity: eo(f, p.a - 2, p.a + 4)}}><Wafer x={0} y={0} d={240} gold={0.22} glow={1} /></div>
    <Stamp f={f} at={p.a + 6} x={300} y={880} zh="在抢同一批晶圆" en="SAME WAFERS" rot={-6} size={52} />
  </Frame>;
}, (cue) => {
  const p = endPlan(cue);
  return [{at: 0, kind: 'fs-whoosh-wipe', gain: 0.12}, {at: 8, kind: 'tick', gain: 0.06}, {at: p.a + 6, kind: 'stamp', gain: 0.2}, {at: p.a + 7, kind: 'fs-impact-deep', gain: 0.14}];
}, true);

/** Cover anchor (880 × 800, f = 0): Altman and the 5%. */
const Cover: Scene = () => <div style={{position: 'absolute', left: 0, top: 0, width: 880, height: 800, background: k.bg, overflow: 'hidden'}}>
  <Img src={IMG('altman.png')} style={{position: 'absolute', left: -320, top: 0, width: 1422, height: 800, objectFit: 'cover', filter: WARM}} />
  <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(30,13,6,0) 45%, rgba(30,13,6,0.85))'}} />
  <div style={{position: 'absolute', left: 470, top: 470, fontFamily: cond, fontWeight: 800, fontSize: 300, color: GOLD, lineHeight: 0.9, textShadow: '0 10px 40px rgba(0,0,0,0.6)'}}>5%</div>
</div>;

export const altmanDramScenes: Record<string, Scene> = {
  'adr.hook': Hook, 'adr.mean': Mean, 'adr.check': Check, 'adr.rumor': Rumor, 'adr.wafer': WaferScene, 'adr.triple': Triple, 'adr.share': Share,
  'adr.price': Price, 'adr.ease': Ease, 'adr.end': End, 'adr.cover': Cover,
};
