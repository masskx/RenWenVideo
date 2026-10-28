import React from 'react';
import {Img, staticFile} from 'remotion';
import {clamp, ease} from '../../fx';
import {font} from '../theme';
import {cond, plex} from '../fonts';
import {Cue, Scene} from '../paper';
import {BandWipe, Bug, CornerTag, Credit, Pk, Plate, QuoteCard, SourceTag, Strap, StrapItem, Veil, Vignette, W, eo, slam} from '../package';

// anthropic-phd-career-reset, made on the template lemo/news-package (docs/video-craft/prompt-library/vendor/lemomo-ai__
// lemo-opuscar/3961ddb/styles/news-package/STYLE.md; picked by prompt-library/选用指南.md §〇: a talk — a person, his own
// words, a recording). Jascha Sohl-Dickstein (Anthropic) at Stanford PAI26: a grad student said "AGI in 3 years" and in
// the same breath planned PhD → postdoc → faculty. Inputs: inputs/anthropic-phd-career-reset/ (materials.md, sources.md,
// transcript/, REVIEW-DOUYIN.md). Storyboard: tutorials/anthropic-phd-career-reset.storyboard.md.
// - review: 「一夜清零」「读博无意义」 are media headlines, never said or shown; writing is thinking is from the Q&A; the
//   10 million fold is his spoken figure ("about … in the last decade", 04:43); no 2030 × 10000 (an Epoch extrapolation).
// - What the template gives (STYLE.md): one package system on every frame — a channel bug, a strap that holds the
//   headline for the whole programme and flips its words (category tab: 观点 / 人物 / 职业 / 风险 / 问答), a rundown that
//   opens and returns, a split-flap board for before → after, quote cards in the speaker's own words with an underline as
//   the voice says the key word, a spec card with bars on one scale (tagged SCHEMATIC), one stamp per story, band wipes
//   between stories and hard cuts inside them, datelines in mono, footage under one duotone grade. Opening variant: cold
//   open on the biggest graphic (STYLE.md §12). Subtitles: the template burns none; ours stay (sound-off viewers) as one
//   quiet bar under the strap (look.captions "bar").
// - 9:16: content y 300–1150, strap at 1180, caption bar under it. Colours from the speaker's compute slide (Our World in
//   Data): the 2010–2025 teal #3A9AAD is the accent (the new pace), the 1950–2010 orange #D0705A the old plan.
// Everything is drawn in the scene backdrop (full frame); the stage stays empty.

export const PHD: Pk = {bg: '#121417', panel: '#1B1E23', ink: '#F4F1E8', accent: '#3A9AAD', onAccent: '#FFFFFF', dim: '#9AA1AC', second: '#D0705A'};
const k = PHD;
const ORANGE = '#D0705A';
const SPEAKER = 'video/anthropic-phd-career-reset/speaker.mp4';
const DUO = 'grayscale(1) contrast(1.15) brightness(0.92) sepia(0.18)'; // the package's one grade for footage (≈ duotone ink → paper)
const TAG = '视频 @Stanford HAI｜案例展示';

const S1: StrapItem = {at: -999, tab: '观点 VIEW', zh: 'Anthropic 研究员给博士生的建议', en: 'ADVICE FOR A (YOUNG) INVESTIGATOR · STANFORD PAI26'};
const PROFILE: StrapItem = {at: 0, tab: '人物 PROFILE', zh: 'Jascha Sohl-Dickstein · Anthropic', en: 'RESEARCHER · STANFORD PAI26 · JUNE 2026'};
const S2: StrapItem = {at: 0, tab: '职业 CAREER', zh: '十到二十年后，路还在吗', en: 'YOUR CAREER TRAJECTORY MAY NOT EVEN EXIST'};
const S3: StrapItem = {at: 0, tab: '风险 RISK', zh: '风险两边都有，上限只在一边', en: 'RISK-REWARD TRADEOFFS JUST SACRIFICE REWARD'};
const S4: StrapItem = {at: 0, tab: '问答 Q&A', zh: '要不要让 AI 替你写？', en: 'Q&A · STANFORD PAI26'};

/** A template scene draws the whole frame in its backdrop (with `wipe`, a band wipe brushes it in); the stage stays empty. */
const make = (draw: NonNullable<Scene['backdrop']>, sfx?: Scene['sfx'], wipe = false): Scene => {
  const S: Scene = () => null;
  S.backdrop = wipe ? (props) => <>{draw(props)}<BandWipe k={k} f={props.f} at={-2} /></> : draw;
  S.sfx = sfx;
  return S;
};
/** The package layer: bug, strap (its items in scene frames), an optional source tag; the picture goes under it. */
const Frame: React.FC<{f: number; strap: StrapItem[]; src?: [string, number]; children: React.ReactNode}> = ({f, strap, src, children}) => (
  <div style={{position: 'absolute', inset: 0, background: k.bg, overflow: 'hidden'}}>
    {/* the package's light fins on the ink ground */}
    {[0, 1, 2].map((i) => <div key={i} style={{position: 'absolute', left: -200 + i * 420, top: -200, width: 120, height: 2400, transform: 'rotate(24deg)', background: 'rgba(255,255,255,0.025)'}} />)}
    {children}
    <Veil from={1120} top={false} a={0.9} />
    <Bug k={k} tag="AI 观点" topic="斯坦福演讲" en="STANFORD PAI26" />
    {src && <SourceTag k={k} label={src[0]} f={f} at={src[1]} />}
    <Strap k={k} items={strap} f={f} end="PAI26" />
    <Vignette a={0.35} />
  </div>
);
/** Footage in the picture zone under the package grade. */
const Footage: React.FC<{f: number; from: number; dur: number; z?: [number, number]; dark?: number}> = ({f, from, dur, z = [1.0, 1.04], dark = 0}) => {
  const s = z[0] + (z[1] - z[0]) * ease.inOutCubic(clamp(f / Math.max(1, dur)));
  return <div style={{position: 'absolute', left: 0, top: 300, width: W, height: 850, overflow: 'hidden'}}>
    <div style={{position: 'absolute', inset: 0, transform: `scale(${s})`, transformOrigin: '55% 40%'}}>
      <Plate src={SPEAKER} video from={from} style={{left: -420, top: 0, width: 1511, height: 850}} filter={DUO} warm={0} />
    </div>
    {dark > 0 && <div style={{position: 'absolute', inset: 0, background: `rgba(18,20,23,${dark})`}} />}
    <Credit text={TAG} bottom={850} />
  </div>;
};
/** Eyebrow line: source · date in mono caps (every graphic carries its date). */
const Eyebrow: React.FC<{text: string; y: number; f?: number; at?: number}> = ({text, y, f = 0, at = -99}) => (
  <div style={{position: 'absolute', left: 64, top: y, fontFamily: plex, fontSize: 24, color: k.dim, letterSpacing: 2, opacity: eo(f, at, at + 6), whiteSpace: 'nowrap'}}>{text}</div>
);
/** A stamp (accent fill, or ink with a double accent frame), lands from 1.9× in 0.16 s. One per story. */
const Stamp: React.FC<{f: number; at: number; x: number; y: number; zh: string; en: string; ink?: boolean; rot?: number}> = ({f, at, x, y, zh, en, ink = false, rot = -8}) => {
  if (f < at) return null;
  const s = 1.9 - 0.9 * ease.outCubic(clamp((f - at) / 5)), ring = eo(f, at + 3, at + 15);
  return <div style={{position: 'absolute', left: x, top: y, transform: `rotate(${rot}deg) scale(${s})`, transformOrigin: '50% 50%'}}>
    <div style={{position: 'absolute', left: -40 * ring, top: -24 * ring, right: -40 * ring, bottom: -24 * ring, borderRadius: '50%', border: `3px solid ${k.accent}`, opacity: 1 - ring}} />
    <div style={{background: ink ? k.bg : k.accent, border: ink ? `4px double ${k.accent}` : 'none', padding: '8px 20px', display: 'flex', alignItems: 'baseline', gap: 12}}>
      <span style={{fontFamily: font, fontWeight: 900, fontSize: 48, color: ink ? k.accent : k.onAccent}}>{zh}</span>
      <span style={{fontFamily: cond, fontWeight: 800, fontSize: 30, color: ink ? k.accent : k.onAccent, letterSpacing: 1}}>{en}</span>
    </div>
  </div>;
};

/** A slow push on a card group (no frame flat for more than 1 s, STYLE.md §7). */
const Push: React.FC<{f: number; dur: number; to?: number; origin?: string; children: React.ReactNode}> = ({f, dur, to = 1.06, origin = '64px 400px', children}) => (
  <div style={{position: 'absolute', inset: 0, transformOrigin: origin, transform: `scale(${1 + (to - 1) * ease.inOutCubic(clamp(f / Math.max(1, dur)))})`}}>{children}</div>
);

/* ---------- the rundown: the student's plan, three rows that flip in on the beat ---------- */

const PLAN = [['01', '读完博士', 'FINISH MY PHD', 'IN 2 YEARS'], ['02', '做博后', 'GET A POSTDOC', 'THEN'], ['03', '申请教职', 'APPLY FOR FACULTY JOBS', 'AFTER THAT']] as const;
const Rundown: React.FC<{f: number; at: [number, number, number]; y?: number; grey?: number; cut?: number}> = ({f, at, y = 560, grey = 0, cut = 0}) => <>
  {PLAN.map(([n, zh, en, when], i) => {
    if (f < at[i] - 2) return null;
    const fl = ease.outBack(clamp((f - at[i] + 2) / 6), 1.6);   // vertical flip-in with a back ease
    const g = i >= 1 ? grey : 0, glint = clamp(1 - Math.abs(f - at[i] - 6) / 4);
    return <div key={n} style={{position: 'absolute', left: 64, top: y + i * 158, width: 952, height: 140, transformOrigin: '50% 0', transform: `scaleY(${fl})`, display: 'flex',
      background: k.panel, filter: g ? `grayscale(${g}) brightness(${1 - 0.35 * g})` : undefined}}>
      <div style={{width: 140, background: ORANGE, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: cond, fontWeight: 800, fontSize: 80, color: '#fff'}}>{n}</div>
      <div style={{flex: 1, padding: '18px 26px', position: 'relative', overflow: 'hidden'}}>
        <div style={{fontFamily: font, fontWeight: 900, fontSize: 52, color: k.ink}}>{zh}</div>
        <div style={{fontFamily: cond, fontWeight: 600, fontSize: 28, color: k.dim, letterSpacing: 1}}>{en}</div>
        <div style={{position: 'absolute', right: 24, top: 52, fontFamily: plex, fontSize: 24, color: ORANGE, letterSpacing: 1}}>{when}</div>
        {glint > 0 && <div style={{position: 'absolute', top: 0, bottom: 0, left: `${(f - at[i]) * 12}%`, width: 80, background: 'rgba(255,255,255,0.25)', transform: 'skewX(-20deg)', opacity: glint}} />}
        {cut > 0 && i >= 1 && <div style={{position: 'absolute', left: 20, top: 66, height: 6, width: `${cut * 90}%`, background: k.dim}} />}
      </div>
    </div>;
  })}
</>;

/* ---------- 1 hook: cold open on the quote — then the plan ---------- */

const hookPlan = (cue: Cue) => ({a: cue('a', 41), b: cue('b', 103), c: cue('c', 124), d: cue('d', 143)});
const Hook = make(({f, cue, dur}) => {
  const p = hookPlan(cue);
  const up = eo(f, p.a, p.a + 10);   // the quote card moves up and shrinks to make room for the plan
  return <Frame f={f} strap={[{...S1, at: 0}]}>
    <Footage f={f} from={6} dur={dur} dark={0.55 + 0.25 * up} />
    <div style={{position: 'absolute', inset: 0, transformOrigin: '64px 320px', transform: `scale(${1 - 0.5 * up})`}}>
      <QuoteCard k={k} f={f} at={-16} y={330} size={92} lines={['I think we\'re going', 'to have AGI', 'in 3 years.']} mark="3 years." markAt={6} who="A VERY CAPABLE GRAD STUDENT · ON HIS SLIDE" />
    </div>
    {f >= p.a && <>
      <Eyebrow text="HIS PLAN · A FEW MINUTES LATER" y={600} f={f} at={p.a + 6} />
      <Rundown f={f} at={[p.b, p.c, p.d]} y={650} />
    </>}
  </Frame>;
}, (cue) => {
  const p = hookPlan(cue);
  return [{at: 0, kind: 'fs-impact-deep', gain: 0.14}, {at: 6, kind: 'tick', gain: 0.07}, {at: p.a, kind: 'whoosh-short', gain: 0.08},
    ...[p.b, p.c, p.d].map((at) => ({at, kind: 'chime', gain: 0.09}))];
});

/* ---------- 2 who: profile strap; then the split-flap board, 1 → 10,000,000 ---------- */

const whoPlan = (cue: Cue) => ({a: cue('a', 57), b: cue('b', 123)});
/** A split-flap tile: the top half flips from the old character to the new one at `at`. */
const Flap: React.FC<{from: string; to: string; f: number; at: number; w?: number; h?: number}> = ({from, to, f, at, w = 84, h = 128}) => {
  const p = clamp((f - at) / 5), show = p < 0.5 ? from : to, sy = Math.abs(1 - 2 * p);
  const face = (ch: string) => <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: cond, fontWeight: 800, fontSize: h * 0.82, color: k.ink}}>{ch}</div>;
  return <div style={{position: 'relative', width: w, height: h, background: '#24282F', borderRadius: 6, overflow: 'hidden', boxShadow: 'inset 0 -2px 0 rgba(0,0,0,0.5)'}}>
    {face(p >= 1 ? to : from)}
    {p > 0 && p < 1 && <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: h / 2, overflow: 'hidden', background: '#2B3038', transformOrigin: '50% 100%', transform: `scaleY(${sy})`}}>
      <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: h}}>{face(show)}</div></div>}
    <div style={{position: 'absolute', left: 0, right: 0, top: h / 2 - 1, height: 2, background: 'rgba(0,0,0,0.55)'}} />
  </div>;
};
const Board: React.FC<{f: number; at: number; label: string; en: string; from: string; to: string; y: number; accent?: boolean}> = ({f, at, label, en, from, to, y, accent = false}) => {
  const n = Math.max(from.length, to.length), a = from.padStart(n, ' '), b = to.padStart(n, ' ');
  return <div style={{position: 'absolute', left: 64, top: y}}>
    <div style={{display: 'flex', alignItems: 'baseline', gap: 14, marginBottom: 12}}>
      <span style={{fontFamily: font, fontWeight: 900, fontSize: 40, color: accent ? k.accent : k.ink}}>{label}</span>
      <span style={{fontFamily: cond, fontWeight: 600, fontSize: 26, color: k.dim, letterSpacing: 1}}>{en}</span>
    </div>
    <div style={{display: 'flex', gap: 6}}>{[...b].map((ch, i) => <Flap key={i} from={a[i]} to={ch} f={f} at={at + i * 2} w={ch === ',' ? 40 : 84} />)}
      <div style={{marginLeft: 10, alignSelf: 'flex-end', fontFamily: cond, fontWeight: 800, fontSize: 90, color: accent ? k.accent : k.dim, lineHeight: 1}}>×</div></div>
  </div>;
};
const Who = make(({f, cue, dur}) => {
  const p = whoPlan(cue);
  if (f < p.a) return <Frame f={f} strap={[S1, PROFILE]}>
    <Footage f={f} from={5} dur={p.a} z={[1.06, 1.12]} />
  </Frame>;
  return <Frame f={f} strap={[S1, PROFILE]} src={['SPEAKER\'S SLIDE · OUR WORLD IN DATA', p.a + 2]}>
    {/* the slide as the document behind the board */}
    <div style={{position: 'absolute', left: 64, top: 320, width: 952, opacity: 0.9, transform: `scale(${1 + 0.03 * eo(f, p.a, dur)})`, transformOrigin: '50% 0'}}>
      <Img src={staticFile('images/tutorials/anthropic-phd-career-reset/compute-plot.jpg')} style={{width: '100%', display: 'block', filter: 'grayscale(0.2) contrast(1.05)'}} />
    </div>
    <Eyebrow text="SPEECH · 04:43 · “IN THE LAST DECADE”" y={880} />
    <Board f={f} at={p.b - 8} label="训练算力" en="TRAINING COMPUTE · 10 YEARS" from="         1" to="10,000,000" y={920} accent />
  </Frame>;
}, (cue) => {
  const p = whoPlan(cue);
  return [{at: 0, kind: 'thud', gain: 0.1}, {at: p.a, kind: 'fs-impact-deep', gain: 0.12}, {at: p.a + 2, kind: 'paper', gain: 0.08},
    ...Array.from({length: 11}, (_, i) => ({at: p.b - 8 + i * 2, kind: 'tick', gain: 0.07})), {at: p.b + 14, kind: 'chime', gain: 0.1}];
});

/* ---------- 3 brain: his own words on a quote card ---------- */

const brainPlan = (cue: Cue) => ({a: cue('a', 27), b: cue('b', 76)});
const Brain = make(({f, cue, dur}) => {
  const p = brainPlan(cue);
  return <Frame f={f} strap={[PROFILE, {...S1, at: 0}]}>
    <Footage f={f} from={9} dur={dur} z={[1.08, 1.2]} dark={0.72} />
    <Push f={f} dur={dur}>
      <QuoteCard k={k} f={f} at={-4} y={340} size={78} lines={['If you believe in one part', 'of your brain … you should', 'also believe [it] in', 'other parts of your brain.']}
        marks={[{text: 'one part', at: p.a + 4}, {text: 'other parts of your brain.', at: p.b + 2}]} who="JASCHA SOHL-DICKSTEIN · STANFORD PAI26 · 25:47" />
    </Push>
    <Stamp f={f} at={p.b + 8} x={330} y={930} zh="信念 ≠ 规划" en="BELIEF ≠ PLAN" />
  </Frame>;
}, (cue) => {
  const p = brainPlan(cue);
  return [{at: 0, kind: 'paper', gain: 0.08}, {at: p.a + 4, kind: 'tick', gain: 0.06}, {at: p.b + 2, kind: 'fs-paper-slide', gain: 0.08}, {at: p.b + 8, kind: 'stamp', gain: 0.16}];
});

/* ---------- 4 path: the plan returns; AGI at year 3 runs through it; the rest is stamped ---------- */

const pathPlan = (cue: Cue) => ({a: cue('a', 26), b: cue('b', 82), c: cue('c', 110)});
const Path = make(({f, cue}) => {
  const p = pathPlan(cue);
  const line = eo(f, p.b - 4, p.b + 10), grey = eo(f, p.c + 2, p.c + 12), cut = eo(f, p.c + 4, p.c + 16);
  const ty = 540 + 140 + 9; // between row 01 (PhD, 2 years) and row 02
  return <Frame f={f} strap={[S1, S2]} src={['SPEAKER\'S SLIDE · 2025.09', 4]}>
    <div style={{position: 'absolute', left: 64, top: 320, width: 952}}>
      <div style={{fontFamily: plex, fontSize: 24, color: k.dim, letterSpacing: 2}}>SLIDE · “I HAVE 1–5 YEARS TO CONTRIBUTE …”</div>
      <div style={{marginTop: 10, fontFamily: cond, fontWeight: 800, fontSize: 54, color: k.ink, lineHeight: 1.05, opacity: eo(f, p.a - 4, p.a + 6)}}>
        The job of an academic will be <span style={{color: k.accent}}>very different</span> in 10–20 years.</div>
    </div>
    <Rundown f={f} at={[-30, -30, -30]} y={540} grey={grey} cut={cut} />
    {/* the threshold: AGI · 3 years, a dashed line running across the plan */}
    {line > 0 && <div style={{position: 'absolute', left: 30, top: ty - 4, width: 1020 * line, height: 0, borderTop: `8px dashed ${k.accent}`}} />}
    {line > 0.6 && <div style={{position: 'absolute', left: 760, top: ty - 30, background: k.accent, color: '#fff', fontFamily: cond, fontWeight: 800, fontSize: 40, padding: '2px 14px',
      transform: `scale(${slam(f, p.b + 6, 4) ?? 1})`}}>AGI · 3 YEARS</div>}
    <Stamp f={f} at={p.c} x={300} y={830} zh="可能不存在" en="MAY NOT EVEN EXIST" />
  </Frame>;
}, (cue) => {
  const p = pathPlan(cue);
  return [{at: 0, kind: 'fs-whoosh-wipe', gain: 0.12}, {at: p.a - 4, kind: 'paper', gain: 0.07}, {at: p.b - 4, kind: 'whoosh', gain: 0.1}, {at: p.c, kind: 'stamp', gain: 0.2}, {at: p.c + 1, kind: 'fs-impact-deep', gain: 0.14}];
}, true);

/* ---------- 5 safe: a spec card — risk is on both roads, the upside is not (schematic) ---------- */

const safePlan = (cue: Cue) => ({a: cue('a', 41), b: cue('b', 98), c: cue('c', 168)});
const Safe = make(({f, cue, dur}) => {
  const p = safePlan(cue);
  const risk = eo(f, p.b, p.b + 18), up = eo(f, p.c, p.c + 18);
  // two groups, bars on one scale: the same risk on both (the slide's "unavoidable baseline"), the upside only on one
  const group = (x: number, title: string, en: string, c: string, upside: number, lit: number) => <div style={{position: 'absolute', left: x, top: 450, width: 470, opacity: 0.55 + 0.45 * lit,
    boxShadow: lit ? `0 0 0 4px ${c}55, 0 0 60px ${c}33` : 'none', padding: '0 0 20px 0'}}>
    <div style={{display: 'inline-block', background: c, color: '#fff', fontFamily: font, fontWeight: 900, fontSize: 60, padding: '4px 20px'}}>{title}</div>
    <div style={{fontFamily: cond, fontWeight: 600, fontSize: 30, color: k.dim, letterSpacing: 1, marginTop: 8}}>{en}</div>
    {([['风险', 'RISK', 0.62 * risk, k.dim, true], ['上限', 'UPSIDE', upside * up, c, false]] as const).map(([l, e, v, col, h], i) => <div key={i} style={{marginTop: 34}}>
      <div style={{fontFamily: font, fontWeight: 900, fontSize: 44, color: k.ink}}>{l} <span style={{fontFamily: cond, fontWeight: 600, fontSize: 28, color: k.dim}}>{e}</span></div>
      <div style={{marginTop: 8, height: 72, width: 440, background: 'rgba(255,255,255,0.06)'}}><div style={{height: '100%', width: `${v * 100}%`,
        background: h ? `repeating-linear-gradient(135deg, ${col} 0 12px, ${col}88 12px 24px)` : col}} /></div>
    </div>)}
  </div>;
  return <Frame f={f} strap={[S2, S3]} src={['SPEAKER\'S SLIDE · RISK-REWARD', 4]}>
    <Eyebrow text="TWO OPTIONS · ONE SCALE" y={330} />
    <div style={{position: 'absolute', left: 64, top: 364, fontFamily: font, fontWeight: 900, fontSize: 44, color: k.ink}}>两条路</div>
    {/* punch in on the safe option while it is named, pull back to both when the shared risk appears */}
    <div style={{position: 'absolute', inset: 0, transformOrigin: '250px 640px', transform: `scale(${1 + 0.22 * eo(f, p.a - 2, p.a + 8) - 0.22 * eo(f, p.b - 6, p.b + 6)})`}}>
    <Push f={f} dur={dur} to={1.05} origin="540px 640px">
      {group(64, '稳妥', 'THE SAFE OPTION', ORANGE, 0.34, f >= p.a && f < p.c ? 1 : 0)}
      {group(556, '有意思', 'THE INTERESTING THING', k.accent, 0.95, f >= p.c ? 1 : 0)}
      {/* the shared baseline sweeps across both risk bars */}
      {risk > 0 && <div style={{position: 'absolute', left: 50, top: 668, width: 980 * eo(f, p.b + 10, p.b + 30), height: 0, borderTop: `5px dashed ${k.ink}`}} />}
      {risk > 0 && <div style={{position: 'absolute', left: 820, top: 628, fontFamily: font, fontWeight: 900, fontSize: 30, color: k.ink, opacity: eo(f, p.b + 26, p.b + 34)}}>同一条基线</div>}
    </Push>
    </div>
    {risk > 0.5 && <div style={{position: 'absolute', left: 64, top: 1010, width: 952, borderTop: `3px dashed ${k.dim}`, paddingTop: 10, fontFamily: plex, fontSize: 24, color: k.dim, letterSpacing: 1,
      opacity: eo(f, p.b + 8, p.b + 16)}}>SLIDE · “THERE IS AN UNAVOIDABLE BASELINE OF AGI RISK”</div>}
    <Stamp f={f} at={p.a + 22} x={60} y={655} zh="并不安全" en="NOT ACTUALLY SAFE" ink rot={-6} />
    <CornerTag k={k} text="SCHEMATIC / 示意图" f={f} at={2} y={1080} />
  </Frame>;
}, (cue) => {
  const p = safePlan(cue);
  return [{at: 0, kind: 'fs-whoosh-wipe', gain: 0.12}, {at: p.a, kind: 'tap', gain: 0.08}, {at: p.a + 22, kind: 'stamp', gain: 0.16}, {at: p.b, kind: 'whoosh-short', gain: 0.08}, {at: p.c, kind: 'chime', gain: 0.1}];
}, true);

/* ---------- 6 do: his words, and the verdict stamp ---------- */

const doPlan = (cue: Cue) => ({a: cue('a', 22), b: cue('b', 52)});
const Do = make(({f, cue, dur}) => {
  const p = doPlan(cue);
  return <Frame f={f} strap={[{...S3, at: -999}]}>
    <Footage f={f} from={14} dur={dur} z={[1.02, 1.08]} dark={0.7} />
    <QuoteCard k={k} f={f} at={-4} y={360} size={88} lines={['Do the interesting', 'thing instead of', 'the safe thing.']} mark="interesting" markAt={p.a + 2} who="JASCHA SOHL-DICKSTEIN · 27:08" />
    <Stamp f={f} at={p.b + 6} x={360} y={900} zh="上限最大的那条" en="BIGGEST UPSIDE" />
  </Frame>;
}, (cue) => {
  const p = doPlan(cue);
  return [{at: 0, kind: 'thud', gain: 0.1}, {at: p.a + 2, kind: 'tick', gain: 0.06}, {at: p.b + 6, kind: 'stamp', gain: 0.16}];
});

/* ---------- 7 write: the Q&A — writing is thinking ---------- */

const writePlan = (cue: Cue) => ({a: cue('a', 58), b: cue('b', 75), c: cue('c', 125), d: cue('d', 160)});
const Write = make(({f, cue, dur}) => {
  const p = writePlan(cue);
  const card = f >= p.b - 6;
  return <Frame f={f} strap={[S3, S4]}>
    <Footage f={f} from={6} dur={dur} z={[1.0, 1.1]} dark={card ? 0.72 : 0.15} />
    {!card && <div style={{position: 'absolute', left: 64, top: 340, fontFamily: plex, fontSize: 24, color: k.ink, background: 'rgba(18,20,23,0.7)', padding: '6px 14px', letterSpacing: 2}}>Q&A · 40:45</div>}
    {card && <Push f={f - p.b} dur={dur - p.b} to={1.07}>
      <QuoteCard k={k} f={f} at={p.b - 6} y={340} size={80} lines={['It\'s because', 'writing is thinking.', 'If you outsource your', 'writing, you\'ve outsourced', 'your thinking.']}
        marks={[{text: 'writing is thinking.', at: p.b + 4}, {text: 'your thinking.', at: p.d + 4}]} who="Q&A · STANFORD PAI26 · 40:45" />
    </Push>}
  </Frame>;
}, (cue) => {
  const p = writePlan(cue);
  return [{at: 0, kind: 'fs-whoosh-wipe', gain: 0.12}, {at: p.b - 6, kind: 'fs-impact-deep', gain: 0.12}, {at: p.b + 4, kind: 'tick', gain: 0.06}, {at: p.d + 4, kind: 'fs-paper-slide', gain: 0.08}];
}, true);

/** Cover anchor (880 × 800, f = 0): the quote over the plan. */
const Cover: Scene = () => <div style={{position: 'absolute', left: 0, top: 0, width: 880, height: 800, background: k.bg, overflow: 'hidden'}}>
  <div style={{position: 'absolute', left: -40, top: -300, transform: 'scale(0.9)', transformOrigin: '0 0'}}>
    <Rundown f={200} at={[-30, -30, -30]} y={560} />
  </div>
  <div style={{position: 'absolute', left: 20, top: 30, width: 840, fontFamily: cond, fontWeight: 800, fontSize: 86, color: k.ink, lineHeight: 1.0}}>“AGI in <span style={{color: k.accent}}>3 years</span>.”</div>
</div>;

export const anthropicPhdCareerResetScenes: Record<string, Scene> = {
  'phd.hook': Hook, 'phd.who': Who, 'phd.brain': Brain, 'phd.path': Path, 'phd.safe': Safe, 'phd.do': Do, 'phd.write': Write, 'phd.cover': Cover,
};
