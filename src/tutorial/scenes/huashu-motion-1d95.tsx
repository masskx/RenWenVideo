import React from 'react';
import {OffthreadVideo, staticFile} from 'remotion';
import {clamp} from '../../fx';
import {font} from '../theme';
import {inter, plex} from '../fonts';
import {Cue, Scene} from '../paper';
import {W} from '../package';

// huashu-motion-1d95, made on the template lemo/swiss-motion (docs/video-craft/prompt-library/vendor/lemomo-ai__lemo-
// opuscar/3961ddb/styles/swiss-motion/STYLE.md; picked because the story is an itemised bill — a grid, a price, one item
// that won't sit on it). The huashu-motion README (alchaincyf/huashu-motion, MIT): a 22-second motion film with music,
// made with Claude Code running on DeepSeek V4.1 Flash (1017), three rounds of notes, under half an hour, 「按当时的价格
// 花了1块9毛5（缓存命中率99.4%）」 (the author's own number); the palette, the dot through the film and the 124 BPM score
// came from the skill, unasked; music is generated locally, no paid API; 「哪里不满意，在画面上点一下……它就只改那一处」;
// and the honest limit: 「不同模型的品味差别是真实存在的」. Inputs: inputs/huashu-motion-1d95/ (materials.md, review.md,
// sources.md). Storyboard: tutorials/huashu-motion-1d95.storyboard.md. The 10-20 film (huashu-motion-skill) opened on the
// DeepSeek film and toured the features; this one is the cost ledger.
// - review: ¥1.95 never on screen without 「作者自报 · 按当时价格」 and, by the end, the README's verbatim line on taste; the
//   DeepSeek film only as a short evidence shot; no point-to-edit footage (the edit beat is huashu-design.gif plus a drawn
//   click, marked 示意); huashu-design.gif cut before its 「1.9秒」 frame (source 5.3 s); no Genspark, no 「便宜 X 倍」.
// - What the template gives: flat paper, black type, light greys and ONE signal colour; a 6-column grid with 64 px margins
//   in 9:16 and a 24 px baseline; every element snaps on the precise ease cubic-bezier(.7,0,.2,1), entrances are wipes and
//   clip-reveals, deletions are knife cuts, nothing bounces, no shadows, no gradients, no grain; extreme scale contrast (a
//   giant numeral beside tiny notes); the grid means something; one exception that moves linearly, off the grid; captions
//   set in the layout, flush left on the first column (look.captions "swiss").
// - Customised (模板改造): the signal colour is the DeepSeek blue of the 1.95 film itself (#4E6AF4) on its paper (#F0EBE4);
//   the exception is the blue decimal point of ¥1.95 — the film's own "dot through the whole film" — that leaves the
//   number and ends on the one line the bill can't price (品味); the artefact on the right page is real footage (the
//   author's films playing in grid modules, muted, 「@alchaincyf｜案例展示」); the score is our synthesized playful at
//   the film's own 124 BPM; type is Inter Display + 思源黑体 (one family per script).

const K = {page: '#F0EBE4', paper: '#FFFFFF', ink: '#111214', g1: '#E2DCD3', g2: '#C9C3B9', g3: '#8C8A86', sig: '#4E6AF4'};
const VID = (n: string) => `video/huashu-motion-1d95/${n}.mp4`;
const M = 64, CW = W - 2 * M; // margins, content width (6 columns of 138.7 + 24 gutters)

/** The template's one precise ease, cubic-bezier(.7,0,.2,1), solved by bisection. */
const snapE = (x: number) => {
  const t0 = clamp(x);
  const bz = (t: number, a: number, b: number) => 3 * (1 - t) * (1 - t) * t * a + 3 * (1 - t) * t * t * b + t * t * t;
  let lo = 0, hi = 1, t = t0;
  for (let i = 0; i < 18; i++) { t = (lo + hi) / 2; if (bz(t, 0.7, 0.2) < t0) lo = t; else hi = t; }
  return bz(t, 0, 1);
};
/** 0..1 over `d` frames from `at`, on the snap curve. */
const sn = (f: number, at: number, d = 7) => snapE((f - at) / d);

/* ---------- parts ---------- */

/** A clip-reveal: the child rises out of a rect from below its baseline. */
const Rise: React.FC<{f: number; at: number; h: number; d?: number; children: React.ReactNode; style?: React.CSSProperties}> = ({f, at, h, d = 7, children, style}) =>
  <div style={{overflow: 'hidden', height: h, ...style}}><div style={{transform: `translateY(${(1 - sn(f, at, d)) * h}px)`}}>{children}</div></div>;

/** A footage module on the grid: a wipe opens it left → right; muted; the case label sits bottom-right inside it. */
const Module: React.FC<{f: number; at: number; src: string; from?: number; x?: number; y: number; w?: number; h?: number; label?: string; out?: number}> = ({f, at, src, from = 0, x = M, y, w = CW, h = Math.round(CW * 9 / 16), label = '@alchaincyf｜案例展示', out}) => {
  if (f < at || (out !== undefined && f >= out + 7)) return null;
  const pin = sn(f, at, 7), pout = out !== undefined ? sn(f, out, 7) : 0;
  return <div style={{position: 'absolute', left: x, top: y, width: w, height: h, overflow: 'hidden', background: K.ink,
    clipPath: `inset(0 ${(1 - pin) * 100}% 0 ${pout * 100}%)`}}>
    <OffthreadVideo src={staticFile(VID(src))} startFrom={Math.round(from * 30)} muted style={{width: '100%', height: '100%', objectFit: 'cover'}} />
    <div style={{position: 'absolute', right: 14, bottom: 12, fontFamily: font, fontWeight: 700, fontSize: 24, color: '#fff', background: 'rgba(17,18,20,0.66)', padding: '4px 12px'}}>{label}</div>
  </div>;
};

/** A caption row: 1 px rule above (grows along its length), small medium-weight note. */
const Note: React.FC<{f: number; at: number; x?: number; y: number; w?: number; children: React.ReactNode; size?: number; color?: string}> = ({f, at, x = M, y, w = CW, children, size = 26, color = K.g3}) => {
  if (f < at) return null;
  return <div style={{position: 'absolute', left: x, top: y, width: w}}>
    <div style={{height: 1, width: `${sn(f, at, 8) * 100}%`, background: K.ink}} />
    <Rise f={f} at={at + 2} h={size * 1.5} style={{marginTop: 8}}><div style={{fontFamily: font, fontWeight: 600, fontSize: size, color, whiteSpace: 'nowrap'}}>{children}</div></Rise>
  </div>;
};

/** The giant numeral 1.95 — its decimal point is the blue dot (drawn separately so it can leave). */
const NUM = 330; // font size
const Numeral: React.FC<{f: number; at: number; x: number; y: number; scale?: number; dot?: boolean; color?: string}> = ({f, at, x, y, scale = 1, dot = true, color = K.ink}) => {
  const z = NUM * scale;
  const step = (i: number) => sn(f, at + i * 3, 6); // the numeral climbs in eased steps, one glyph at a time
  const G: React.FC<{c: string; i: number}> = ({c, i}) => <div style={{overflow: 'hidden', height: z * 0.78}}>
    <div style={{fontFamily: inter, fontWeight: 600, fontSize: z, lineHeight: 0.78, letterSpacing: -z * 0.04, color, transform: `translateY(${(1 - step(i)) * z * 0.8}px)`}}>{c}</div>
  </div>;
  return <div style={{position: 'absolute', left: x - z * 0.06, top: y, display: 'flex', alignItems: 'flex-end'}}>
    <G c="1" i={0} />
    <div style={{width: z * 0.24}} />
    <G c="9" i={1} /><G c="5" i={2} />
    {dot && <Dot x={z * 0.555} y={z * 0.78 - z * 0.13} r={z * 0.075} f={f} at={at + 2} abs={false} />}
  </div>;
};
/** The exception: the blue dot. `abs` false = inside the numeral's box. */
const Dot: React.FC<{x: number; y: number; r: number; f?: number; at?: number; abs?: boolean}> = ({x, y, r, f = 99, at = 0, abs = true}) => {
  const k = sn(f, at, 5);
  return <div style={{position: 'absolute', left: x - r, top: y - r, width: 2 * r, height: 2 * r, borderRadius: r, background: K.sig, transform: `scale(${k})`, zIndex: abs ? 5 : undefined}} />;
};
/** The required tag next to every 1.95 (review §1.95上屏): small, but ≥ 34 px and in ink. */
const SelfTag: React.FC<{f: number; at: number; x: number; y: number; size?: number}> = ({f, at, x, y, size = 38}) => (f < at ? null :
  <div style={{position: 'absolute', left: x, top: y, clipPath: `inset(0 ${(1 - sn(f, at, 7)) * 100}% 0 0)`}}>
    <div style={{fontFamily: font, fontWeight: 800, fontSize: size, color: K.ink, whiteSpace: 'nowrap'}}>作者自报 · 按当时价格</div>
  </div>);

/** A receipt row on the grid: label (col 1–2), item (col 3–5), value right-aligned (col 6); a knife cut when `cut`. */
const Row: React.FC<{f: number; at: number; y: number; label: string; item: string; value?: string; cut?: number; h?: number; blue?: boolean}> = ({f, at, y, label, item, value, cut, h = 92, blue}) => {
  if (f < at) return null;
  const q = sn(f, at, 7);
  const k1 = cut !== undefined ? sn(f, cut, 5) : 0, k2 = cut !== undefined ? sn(f, cut + 5, 6) : 0;
  return <div style={{position: 'absolute', left: M, top: y, width: CW, height: h}}>
    <div style={{position: 'absolute', left: 0, top: 0, height: 1, width: `${q * 100}%`, background: K.ink}} />
    <div style={{position: 'absolute', left: 0, top: 0, width: CW, height: h, clipPath: `inset(0 ${(1 - q) * 100}% 0 0)`, transform: `scaleY(${1 - k2 * 0.98})`, transformOrigin: '50% 50%'}}>
      <div style={{position: 'absolute', left: 0, top: 24, fontFamily: font, fontWeight: 600, fontSize: 32, color: K.g3}}>{label}</div>
      <div style={{position: 'absolute', left: (CW + 24) / 6, top: 16, fontFamily: font, fontWeight: 800, fontSize: 48, color: blue ? K.sig : K.ink, whiteSpace: 'nowrap', letterSpacing: -0.5}}>{item}</div>
      {value && <div style={{position: 'absolute', right: 0, top: 16, fontFamily: inter, fontWeight: 600, fontSize: 48, color: blue ? K.sig : K.ink, whiteSpace: 'nowrap'}}>{value}</div>}
    </div>
    {cut !== undefined && f >= cut && <div style={{position: 'absolute', left: 0, top: h / 2, height: 3, width: `${k1 * 100}%`, background: K.ink}} />}
  </div>;
};

const Page: React.FC<{children: React.ReactNode; grid?: number}> = ({children, grid = 0.35}) => <div style={{position: 'absolute', inset: 0, background: K.page, overflow: 'hidden'}}>
  {/* the 6-column grid, faint — the system the frame obeys */}
  {Array.from({length: 7}, (_, i) => { const x = M + i * (CW + 24) / 6 - (i ? 12 : 0); return <div key={i} style={{position: 'absolute', left: x, top: 0, width: 1, height: 1920, background: K.g1, opacity: grid}} />; })}
  {children}
</div>;
/** Technical notes in the top corners (the template's caption rows): what this page is, which bar we're on. */
const Corner: React.FC<{left: string; right: string}> = ({left, right}) => <>
  <div style={{position: 'absolute', left: M, top: 150, fontFamily: plex, fontWeight: 500, fontSize: 24, color: K.ink, letterSpacing: 1}}>{left}</div>
  <div style={{position: 'absolute', right: M, top: 150, fontFamily: plex, fontWeight: 500, fontSize: 24, color: K.g3, letterSpacing: 1}}>{right}</div>
  <div style={{position: 'absolute', left: M, top: 190, width: CW, height: 1, background: K.ink}} />
</>;

const make = (draw: NonNullable<Scene['backdrop']>, sfx?: Scene['sfx']): Scene => {
  const Sc: Scene = () => null;
  Sc.backdrop = draw;
  Sc.sfx = sfx;
  return Sc;
};

const MOD_Y = 230, MOD_H = Math.round(CW * 9 / 16); // 535: the artefact module under the corner notes
const NUM_Y = 840;
const DOT_X = M - NUM * 0.06 + NUM * 0.555, DOT_Y = NUM_Y + NUM * 0.65; // the decimal point of the hook's numeral

/* ---------- 1 hook: the score being written (the film has music) above a giant 1.95 whose point is the blue dot ---------- */

const hookPlan = (cue: Cue) => ({a: cue('a', 60), b: cue('b', 81)});
/** The hook / end frame (the film loops to it): the module, the numeral, the tag. */
const HookFrame: React.FC<{f: number; at?: number; dot?: boolean; src?: string; from?: number}> = ({f, at = -18, dot = true, src = 'score-first', from = 1}) => <>
  <Module f={f} at={at - 6} src={src} from={from} y={MOD_Y} h={MOD_H} />
  <Numeral f={f} at={at} x={M} y={NUM_Y} dot={dot} />
  <div style={{position: 'absolute', left: M, top: NUM_Y - 70, fontFamily: font, fontWeight: 800, fontSize: 44, color: K.ink}}>¥ 人民币</div>
  <SelfTag f={f} at={at + 6} x={M} y={NUM_Y + NUM * 0.78 + 30} />
</>;
const Hook = make(({f, cue}) => {
  const p = hookPlan(cue);
  return <Page>
    <Corner left="成本账 · 1 支片" right="124 BPM · 01/07" />
    <HookFrame f={f} />
    <Note f={f} at={p.a - 6} x={M + 4 * (CW + 24) / 6} y={NUM_Y - 70} w={2 * (CW + 24) / 6 - 24} size={34} color={K.ink}>22 秒 · 带配乐</Note>
    {/* the dot pulses once on "1块9毛5" */}
    {f >= p.b && f < p.b + 12 && <div style={{position: 'absolute', left: DOT_X - 60, top: DOT_Y - 60, width: 120, height: 120, borderRadius: 60, border: `4px solid ${K.sig}`,
      opacity: 1 - (f - p.b) / 12, transform: `scale(${0.4 + (f - p.b) / 8})`}} />}
  </Page>;
}, (cue) => {
  const p = hookPlan(cue);
  return [{at: 0, kind: 'clack', gain: 0.14}, {at: 3, kind: 'clack', gain: 0.12}, {at: 6, kind: 'clack', gain: 0.12}, {at: 8, kind: 'tick', gain: 0.08}, {at: p.a - 6, kind: 'tap', gain: 0.07},
    {at: p.b, kind: 'pop', gain: 0.1}];
});

/* ---------- 2 ledger: pull out — the numeral is the total of a bill; the DeepSeek film plays as evidence; rows snap in ---------- */

const ledgerPlan = (cue: Cue) => ({a: cue('a', 73), b: cue('b', 106)});
const ROW_Y = (i: number) => 800 + i * 92;
const TOT_Y = 1176;
/** The bill's total line: 合计 + a small 1.95 (with the dot) + the tag. */
const Total: React.FC<{f: number; at: number; dot?: boolean}> = ({f, at, dot = true}) => {
  if (f < at) return null;
  return <div style={{position: 'absolute', left: M, top: TOT_Y, width: CW}}>
    <div style={{height: 4, width: `${sn(f, at, 8) * 100}%`, background: K.ink}} />
    <div style={{position: 'absolute', left: 0, top: 30, fontFamily: font, fontWeight: 900, fontSize: 52, color: K.ink}}>合计</div>
    <div style={{position: 'absolute', left: 0, top: 104}}><SelfTag f={f} at={at + 4} x={0} y={0} size={34} /></div>
    <div style={{position: 'absolute', right: 0, top: 26, width: 360, height: 130}}><Numeral f={f + 30} at={at} x={360 - NUM * 0.36 * 2.1} y={0} scale={0.36} dot={dot} /></div>
  </div>;
};
const Ledger = make(({f, cue}) => {
  const p = ledgerPlan(cue);
  const pull = sn(f, 0, 9); // the giant numeral shrinks into the total line
  const z = 1 - 0.64 * pull;
  return <Page>
    <Corner left="成本账 · 这一支" right="124 BPM · 02/07" />
    {f < 9 && <Numeral f={60} at={0} x={M + (CW - NUM * 0.36 * 2.1 - 0) * pull} y={NUM_Y + (TOT_Y + 26 - NUM_Y) * pull} scale={z} />}
    <Module f={f} at={-30} src="score-first" from={1 + 137 / 30} y={MOD_Y} h={MOD_H} out={2} />
    <Module f={f} at={4} src="specimen" from={0.3} y={MOD_Y} h={MOD_H} />
    <Note f={f} at={10} y={MOD_Y + MOD_H + 10} size={30} color={K.ink}>这一支 · 22 秒 · 带配乐</Note>
    <Row f={f} at={12} y={ROW_Y(0) + 40} label="模型" item="DeepSeek V4.1 Flash · 1017" />
    <Row f={f} at={p.a - 4} y={ROW_Y(1) + 40} label="意见" item="三轮" value="× 3" />
    <Row f={f} at={p.b - 4} y={ROW_Y(2) + 40} label="用时" item="不到半小时" value="< 30 min" />
    {f >= 9 && <Total f={f} at={9} />}
  </Page>;
}, (cue) => {
  const p = ledgerPlan(cue);
  return [{at: 0, kind: 'fs-paper-slide', gain: 0.08}, {at: 4, kind: 'whoosh-short', gain: 0.07}, {at: 9, kind: 'clack', gain: 0.1}, {at: 12, kind: 'clack', gain: 0.1}, {at: p.a - 4, kind: 'clack', gain: 0.1},
    {at: p.b - 4, kind: 'clack', gain: 0.1}];
});

/* ---------- 3 cache: the grid means something — 1000 cells, 994 hits; then music (local, ¥0) and the paid API knifed ---------- */

const cachePlan = (cue: Cue) => ({a: cue('a', 25), b: cue('b', 83), c: cue('c', 116)});
const GC = 50, GR = 20, CELL = CW / GC; // 1000 cells, 19 px
const MISS = new Set([137, 288, 431, 602, 779, 913]); // six misses (0.6 %), spread over the grid
const Cache = make(({f, cue}) => {
  const p = cachePlan(cue);
  const gy = 470;
  const fill = (i: number) => { const r = Math.floor(i / GC), c = i % GC; const d = Math.hypot(r * 1.0, c * 0.6); return f >= 4 + d * 0.55; };
  const shrink = sn(f, p.b - 6, 8); // the grid folds up when the music line arrives
  return <Page>
    <Corner left="成本账 · 便宜在哪" right="124 BPM · 03/07" />
    <div style={{position: 'absolute', left: M, top: 230}}>
      <Rise f={f} at={0} h={200}><div style={{fontFamily: inter, fontWeight: 600, fontSize: 210, lineHeight: 0.95, color: K.ink, letterSpacing: -8}}>99.4%</div></Rise>
    </div>
    <div style={{position: 'absolute', right: M, top: 290, textAlign: 'right'}}>
      <Rise f={f} at={3} h={60}><div style={{fontFamily: font, fontWeight: 800, fontSize: 44, color: K.ink}}>缓存命中率</div></Rise>
      <Rise f={f} at={6} h={44}><div style={{fontFamily: plex, fontWeight: 500, fontSize: 26, color: K.g3}}>1000 格 = 1000 次</div></Rise>
    </div>
    <div style={{position: 'absolute', left: M, top: gy, width: CW, height: GR * CELL, transform: `scaleY(${1 - 0.72 * shrink})`, transformOrigin: '50% 0'}}>
      {Array.from({length: GC * GR}, (_, i) => {
        const miss = MISS.has(i);
        const on = fill(i);
        return <div key={i} style={{position: 'absolute', left: (i % GC) * CELL + 1, top: Math.floor(i / GC) * CELL + 1, width: CELL - 2, height: CELL - 2,
          background: on ? (miss ? K.page : K.ink) : K.g1, outline: on && miss ? `2px solid ${K.ink}` : undefined, outlineOffset: -3}} />;
      })}
    </div>
    <Note f={f} at={p.a + 30} y={gy + GR * CELL * (1 - 0.72 * shrink) + 14} size={30} color={K.ink}>994 / 1000 命中</Note>
    <Row f={f} at={p.b - 4} y={880} label="配乐" item="本机生成" value="¥0" />
    <Row f={f} at={p.b + 4} y={972} label="接口" item="收费接口" value="不调用" cut={p.c + 6} />
    <Module f={f} at={p.b} src="score-first" from={4} y={1090} x={M} w={CW} h={300} label="@alchaincyf｜案例展示 · 本机写谱配乐" />
  </Page>;
}, (cue) => {
  const p = cachePlan(cue);
  return [{at: 0, kind: 'whoosh-short', gain: 0.06}, {at: p.a - 6, kind: 'clack', gain: 0.12}, ...Array.from({length: 6}, (_, i) => ({at: p.a + 4 + i * 4, kind: 'tick', gain: 0.04})),
    {at: p.b - 6, kind: 'fs-paper-slide', gain: 0.07}, {at: p.b - 4, kind: 'clack', gain: 0.1}, {at: p.b + 4, kind: 'clack', gain: 0.09}, {at: p.c + 6, kind: 'fs-paper-slide', gain: 0.1}];
});

/* ---------- 4 skill: the programme — three rules the author never asked for; they turn out to be the skill ---------- */

const skillPlan = (cue: Cue) => ({a: cue('a', 63), b: cue('b', 110), c: cue('c', 141)});
const Skill = make(({f, cue}) => {
  const p = skillPlan(cue);
  const colX = (i: number) => M + i * (CW + 24) / 3;
  const colW = (CW - 48) / 3;
  const beat = 30 * 60 / 124; // 14.5 frames
  const tickOn = f >= p.a ? Math.floor((f - p.a) / beat) : -1;
  const merge = sn(f, p.c - 4, 9);
  const said = f >= p.b;
  return <Page>
    <Corner left="成本账 · 没提过的三样" right="124 BPM · 04/07" />
    <Module f={f} at={-4} src="specimen" from={11.6} y={MOD_Y} h={MOD_H} />
    {/* three columns = three rules; at "skill" they merge into one block */}
    {[0, 1, 2].map((i) => {
      const at = [2, 28, p.a - 2][i];
      if (f < at) return null;
      const q = sn(f, at, 7);
      const x = colX(i) + (M - colX(i)) * merge, w = colW + (CW - colW) * merge;
      return <div key={i} style={{position: 'absolute', left: x, top: 820, width: w, height: 330, background: K.paper, clipPath: `inset(${(1 - q) * 100}% 0 0 0)`, opacity: merge > 0.5 && i > 0 ? 0 : 1}}>
        {merge < 0.5 && <>
          <div style={{position: 'absolute', left: 20, top: 18, fontFamily: plex, fontWeight: 500, fontSize: 22, color: K.g3}}>规则 0{i + 1}</div>
          <div style={{position: 'absolute', left: 20, top: 56, fontFamily: font, fontWeight: 900, fontSize: 48, color: K.ink}}>{['配色', '圆点', '节拍'][i]}</div>
          {i === 0 && <div style={{position: 'absolute', left: 20, top: 150, display: 'flex', gap: 10}}>
            {['#4E6AF4', '#F0EBE4', '#0C0D11', '#EAF37B'].map((c, j) => <div key={j} style={{width: 56, height: 120, background: c, outline: `1px solid ${K.g2}`, transform: `scaleY(${sn(f, at + 4 + j * 2, 6)})`, transformOrigin: '50% 100%'}} />)}
          </div>}
          {i === 1 && <Dot x={colW / 2} y={215} r={44} f={f} at={at + 6} />}
          {i === 2 && <div style={{position: 'absolute', left: 20, top: 150}}>
            <div style={{fontFamily: inter, fontWeight: 600, fontSize: 88, color: K.ink, lineHeight: 1}}>124</div>
            <div style={{display: 'flex', gap: 8, marginTop: 14}}>{[0, 1, 2, 3].map((j) => <div key={j} style={{width: 44, height: 16, background: tickOn >= 0 && tickOn % 4 === j ? K.ink : K.g1}} />)}</div>
          </div>}
          {said && <div style={{position: 'absolute', left: 20, bottom: 16, fontFamily: font, fontWeight: 800, fontSize: 34, color: K.g3, clipPath: `inset(0 ${(1 - sn(f, p.b + i * 3, 6)) * 100}% 0 0)`}}>提示词里：0 次</div>}
        </>}
        {merge >= 0.5 && <div style={{position: 'absolute', left: 30, top: 60}}>
          <div style={{fontFamily: plex, fontWeight: 500, fontSize: 26, color: K.g3}}>都写在这里</div>
          <div style={{fontFamily: inter, fontWeight: 600, fontSize: 104, color: K.ink, letterSpacing: -3, marginTop: 10}}>huashu-motion</div>
          <div style={{fontFamily: font, fontWeight: 800, fontSize: 40, color: K.ink, marginTop: 8}}>一个开源 skill · MIT</div>
        </div>}
      </div>;
    })}
  </Page>;
}, (cue) => {
  const p = skillPlan(cue);
  return [{at: 0, kind: 'whoosh-short', gain: 0.06}, {at: 2, kind: 'clack', gain: 0.1}, {at: 28, kind: 'clack', gain: 0.1}, {at: 34, kind: 'pop', gain: 0.08}, {at: p.a - 2, kind: 'clack', gain: 0.1},
    ...Array.from({length: 4}, (_, i) => ({at: p.a + Math.round(i * 14.5), kind: 'tick', gain: 0.05})), {at: p.b, kind: 'tap', gain: 0.06}, {at: p.c - 4, kind: 'fs-paper-slide', gain: 0.08},
    {at: p.c + 5, kind: 'clack', gain: 0.12}];
});

/* ---------- 5 edit: one prompt pinned, the style changes on the beat; a click lands, one cell is marked (示意) ---------- */

const editPlan = (cue: Cue) => ({a: cue('a', 25), b: cue('b', 72)});
const Edit = make(({f, cue}) => {
  const p = editPlan(cue);
  const bigY = 300, bigH = Math.round(CW * 9 / 16);
  // the click point (screen) and the one region that is "changed"
  const cx = M + CW * 0.66, cy = bigY + bigH * 0.34;
  const land = p.a + 10;
  const travel = clamp((f - p.a) / 10); // the dot moves linearly (the exception never snaps)
  const dx = M + CW * 0.1 + (cx - M - CW * 0.1) * travel, dy = bigY + bigH + 60 + (cy - bigY - bigH - 60) * travel;
  return <Page>
    <Corner left="指着画面改" right="124 BPM · 05/07" />
    <Module f={f} at={-4} src="huashu-design" from={1.1} y={bigY} h={bigH} />
    {f >= land && <div style={{position: 'absolute', left: cx - 170, top: cy - 90, width: 340 * sn(f, land, 6), height: 180, border: `4px solid ${K.sig}`}} />}
    {f >= p.a && <Dot x={dx} y={dy} r={16} />}
    {f >= land && <div style={{position: 'absolute', left: cx - 170, top: cy + 100, background: K.sig, padding: '8px 18px', clipPath: `inset(0 ${(1 - sn(f, land + 2, 6)) * 100}% 0 0)`}}>
      <div style={{fontFamily: font, fontWeight: 800, fontSize: 34, color: '#fff', whiteSpace: 'nowrap'}}>在这里写意见</div>
    </div>}
    <div style={{position: 'absolute', left: M, top: bigY + bigH + 120, width: CW}}>
      <Rise f={f} at={p.b - 4} h={124}><div style={{fontFamily: font, fontWeight: 900, fontSize: 104, color: K.ink, lineHeight: 1.15}}>只改那一处</div></Rise>
      <Rise f={f} at={p.b + 2} h={40} style={{marginTop: 10}}><div style={{fontFamily: font, fontWeight: 700, fontSize: 30, color: K.g3}}>点选框为示意 · 画面：huashu-design 宣传片</div></Rise>
    </div>
  </Page>;
}, (cue) => {
  const p = editPlan(cue);
  return [{at: 0, kind: 'fs-whoosh-wipe', gain: 0.07}, {at: p.a + 10, kind: 'tap', gain: 0.12}, {at: p.a + 12, kind: 'pop', gain: 0.07}, {at: p.b - 4, kind: 'clack', gain: 0.12}];
});

/* ---------- 6 caveat (climax): the bill again; the dot leaves 1.95 and lands on the one line without a price: 品味 ---------- */

const caveatPlan = (cue: Cue) => ({a: cue('a', 30), b: cue('b', 51)});
const BILL = [
  {label: '模型', item: 'DeepSeek V4.1 Flash · 1017', value: ''},
  {label: '意见', item: '三轮', value: '× 3'},
  {label: '缓存', item: '命中率 99.4%', value: ''},
  {label: '配乐', item: '本机生成', value: '¥0'},
];
const TASTE_Y = 1000;
/** The dot's flight from the total's decimal point to the 品味 line: linear, unsnapped, with a coordinate readout. */
const dotFrom = {x: M + CW - 360 + (360 - NUM * 0.36 * 2.1) - NUM * 0.36 * 0.06 + NUM * 0.36 * 0.555, y: 300 + 26 + NUM * 0.36 * 0.78 - NUM * 0.36 * 0.13};
const dotTo = {x: M + CW - 40, y: TASTE_Y + 46};
const Caveat = make(({f, cue}) => {
  const p = caveatPlan(cue);
  const LIFT = 34; // climax: the dot lands (score.climaxAt ≈ 1.2 s)
  const t = clamp((f - 12) / (LIFT - 12));
  const dx = dotFrom.x + (dotTo.x - dotFrom.x) * t, dy = dotFrom.y + (dotTo.y - dotFrom.y) * t - Math.sin(t * Math.PI) * 120;
  const flying = f >= 12;
  return <Page>
    <Corner left="成本账 · 合计" right="124 BPM · 06/07" />
    {/* the total on top this time, the rows under it */}
    <div style={{position: 'absolute', left: M, top: 300, width: CW}}>
      <div style={{height: 4, background: K.ink}} />
      <div style={{position: 'absolute', left: 0, top: 30, fontFamily: font, fontWeight: 900, fontSize: 52, color: K.ink}}>合计</div>
      <SelfTag f={60} at={0} x={0} y={104} size={34} />
      <div style={{position: 'absolute', right: 0, top: 26, width: 360, height: 130}}><Numeral f={60} at={0} x={360 - NUM * 0.36 * 2.1} y={0} scale={0.36} dot={!flying} /></div>
    </div>
    {BILL.map((r, i) => <Row key={i} f={60} at={0} y={500 + i * 92} label={r.label} item={r.item} value={r.value} />)}
    {/* the exception: off the grid by 11 px, tilted, entering linearly */}
    {f >= 4 && <div style={{position: 'absolute', left: M + 11, top: TASTE_Y + 7 + (1 - clamp((f - 4) / 12)) * 40, width: CW, height: 92, transform: 'rotate(-1.2deg)', opacity: clamp((f - 4) / 6)}}>
      <div style={{position: 'absolute', left: 0, top: 0, height: 2, width: CW, background: K.sig}} />
      <div style={{position: 'absolute', left: 0, top: 24, fontFamily: font, fontWeight: 600, fontSize: 32, color: K.sig}}>品味</div>
      <div style={{position: 'absolute', left: (CW + 24) / 6, top: 16, fontFamily: font, fontWeight: 900, fontSize: 48, color: K.sig}}>换个模型就不同</div>
      <div style={{position: 'absolute', right: 70, top: 16, fontFamily: inter, fontWeight: 600, fontSize: 48, color: K.sig}}>—</div>
    </div>}
    {flying && <Dot x={dx} y={dy} r={NUM * 0.36 * 0.075 * (1 + 0.6 * t)} />}
    {flying && f < LIFT + 20 && <div style={{position: 'absolute', left: dx + 26, top: dy - 50, fontFamily: plex, fontWeight: 500, fontSize: 22, color: K.sig}}>{f < LIFT ? `x ${Math.round(dx)} · 不在网格上` : '未计价'}</div>}
    {/* the README's own words, verbatim (review: 1.95 shown with this line) */}
    <div style={{position: 'absolute', left: M, top: 1130, width: CW}}>
      <div style={{height: 1, width: `${sn(f, p.a - 4, 8) * 100}%`, background: K.ink}} />
      <Rise f={f} at={p.a - 2} h={76} style={{marginTop: 14}}><div style={{fontFamily: font, fontWeight: 900, fontSize: 60, color: K.ink, whiteSpace: 'nowrap', letterSpacing: -1}}>「不同模型的品味差别</div></Rise>
      <Rise f={f} at={p.a + 2} h={76}><div style={{fontFamily: font, fontWeight: 900, fontSize: 60, color: K.ink, whiteSpace: 'nowrap', letterSpacing: -1}}>是真实存在的」</div></Rise>
      <Rise f={f} at={p.b} h={40} style={{marginTop: 6}}><div style={{fontFamily: font, fontWeight: 700, fontSize: 28, color: K.g3}}>—— huashu-motion README · 诚实边界</div></Rise>
    </div>
  </Page>;
}, (cue) => {
  const p = caveatPlan(cue);
  return [{at: 0, kind: 'clack', gain: 0.1}, {at: 4, kind: 'fs-paper-slide', gain: 0.06}, {at: 12, kind: 'whoosh-short', gain: 0.07}, {at: 34, kind: 'chime', gain: 0.12}, {at: 34, kind: 'tap', gain: 0.1},
    {at: p.a - 2, kind: 'clack', gain: 0.09}];
});

/* ---------- 7 end: the bill closes back into the giant 1.95 (the hook's frame); 品味 slides off the page ---------- */

const endPlan = (cue: Cue) => ({a: cue('a', 61)});
const End = make(({f, cue}) => {
  const p = endPlan(cue);
  const exit = clamp((f - p.a - 4) / 22); // the exception leaves linearly; the system closes over the space
  return <Page>
    <Corner left="成本账 · 1 支片" right="124 BPM · 07/07" />
    {f < 8 && <div style={{position: 'absolute', left: M, top: 500, width: CW, height: 4 * 92, background: K.page, clipPath: `inset(0 0 ${sn(f, 0, 8) * 100}% 0)`}}>
      {BILL.map((r, i) => <Row key={i} f={60} at={0} y={i * 92 - 0} label={r.label} item={r.item} value={r.value} />)}
    </div>}
    <HookFrame f={f} at={2} src="score-first" from={1} />
    {/* 品味 row, still off-grid, until it leaves through the right edge */}
    <div style={{position: 'absolute', left: M + 11 + exit * 1100, top: 1250, width: CW, height: 92, transform: 'rotate(-1.2deg)'}}>
      <div style={{position: 'absolute', left: 0, top: 0, height: 2, width: CW, background: K.sig}} />
      <div style={{position: 'absolute', left: 0, top: 24, fontFamily: font, fontWeight: 600, fontSize: 32, color: K.sig}}>品味</div>
      <div style={{position: 'absolute', left: (CW + 24) / 6, top: 16, fontFamily: font, fontWeight: 900, fontSize: 48, color: K.sig}}>不在账单上</div>
    </div>
  </Page>;
}, (cue) => {
  const p = endPlan(cue);
  return [{at: 0, kind: 'fs-paper-slide', gain: 0.08}, {at: 2, kind: 'clack', gain: 0.12}, {at: 5, kind: 'clack', gain: 0.1}, {at: 8, kind: 'clack', gain: 0.1}, {at: p.a + 4, kind: 'whoosh-short', gain: 0.07}];
});

/** Cover anchor (880 × 800, f = 0): the giant 1.95 with its blue point, the tag, a still of the score. */
const Cover: Scene = () => <div style={{position: 'absolute', left: 0, top: 0, width: 880, height: 800, overflow: 'hidden', background: K.page}}>
  <div style={{position: 'absolute', left: -20, top: -560, width: W, height: 1920}}>
    <Page>
      <Numeral f={60} at={0} x={M} y={NUM_Y} />
      <div style={{position: 'absolute', left: M, top: NUM_Y - 70, fontFamily: font, fontWeight: 800, fontSize: 44, color: K.ink}}>¥ 人民币</div>
      <SelfTag f={60} at={0} x={M} y={NUM_Y + NUM * 0.78 + 30} />
    </Page>
  </div>
</div>;

export const huashuBudgetScenes: Record<string, Scene> = {
  'hb.hook': Hook, 'hb.ledger': Ledger, 'hb.cache': Cache, 'hb.skill': Skill, 'hb.edit': Edit, 'hb.caveat': Caveat, 'hb.end': End, 'hb.cover': Cover,
};
