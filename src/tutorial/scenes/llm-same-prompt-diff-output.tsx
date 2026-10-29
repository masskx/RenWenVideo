import React from 'react';
import {Img, staticFile} from 'remotion';
import {clamp, ease} from '../../fx';
import {hand, plex, serif} from '../fonts';
import {Scene} from '../paper';
import {W} from '../package';
import TL from '../../../tutorials/llm-same-prompt-diff-output.timeline.json';

// llm-same-prompt-diff-output, made on the template lemo/whiteboard (docs/video-craft/prompt-library/vendor/lemomo-ai__
// lemo-opuscar/3961ddb/styles/whiteboard/STYLE.md; picked by prompt-library/选用指南.md §〇: a principle explained). Why
// the same question asked twice gets two answers even at temperature 0 (Thinking Machines Lab, Horace He, 2025-09): 1000
// runs of "Tell me about Richard Feynman" on Qwen3-235B gave 80 different completions, identical for 102 tokens and split at
// the 103rd (992 "Queens, New York", 8 "New York City"); the main cause is not GPU threads racing but the batch your request
// lands in — its size changes with load, and with it the order of the additions, and floating-point addition depends on
// order ((0.1 + 1e20) − 1e20 = 0, 0.1 + (1e20 − 1e20) = 0.1). Batch-invariant kernels: 1000 identical, but slower (26 s →
// 42 s, a separate test on Qwen-3-8B). Inputs: inputs/llm-same-prompt-diff-output/ (README.md, REVIEW-DOUYIN.md, sources.md,
// transcript/). Storyboard: tutorials/llm-same-prompt-diff-output.storyboard.md.
// - review: the post is from 2025-09 (never "latest research"); 80/1000 is Qwen3-235B on TM's own vLLM, never "ChatGPT";
//   26 → 42 s is a different model and says so; the vLLM thread is "someone asked", not the conclusion; no HF figures.
// - What the template gives: one glossy board for the whole film (everything written in stroke order in front of the
//   viewer; the board is a map, distance on it = distance in the argument); no hands — pens float with a cast shadow that
//   grows when they lift and park off-frame between phrases; magnets are the only things that move; the eraser rewinds;
//   ink multiplies, wobbles, pools at the start and overshoots its closures; a sheen drifting at 0.35× the camera; three
//   marker colours at most, each with one meaning; captions are off-white board labels (look.captions "label").
// - Customised (模板改造): the three markers are the source figures' own colours (ink, TM blue = requests and batches, TM
//   orange = the divergence only) over TM's two highlighter fields; printouts of the material pinned under magnets; the fork
//   drawn as one pen splitting in two with widths by count (992 / 8); a 45-second lesson at about twice the template's hand.
// The board is one continuous drawing: every scene draws the same <Board> at its absolute frame, so what was written stays.

/* ---------- timing: absolute frames from the voice timeline ---------- */

type TS = {id: string; startFrame: number; durationFrames: number; cues: Record<string, number>};
const SC = Object.fromEntries((TL.scenes as unknown as TS[]).map((s) => [s.id, s]));
const at = (id: string, cue?: string, plus = 0) => SC[id].startFrame + (cue ? Math.round((SC[id].cues[cue] / 1000) * 30) : 0) + plus;
const END = TL.totalFrames;

/* ---------- colours (the source figures' own) ---------- */

const INK = '#23262C', BLUE = '#009DE4', ORANGE = '#F78427', DIM = '#6B6E75';
const WASH_N = '#F8F8D1', WASH_D = '#E3EEB0';

/* ---------- a seeded hand ---------- */

const rnd = (n: number) => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
type P = [number, number];
/** Resample a polyline every ~6 px with a low-frequency wobble along the normal (the hand) plus a fine tremor. */
const wobble = (pts: P[], seed: number, amp = 2.2): P[] => {
  const out: P[] = [];
  let s = 0;
  for (let i = 0; i < pts.length - 1; i++) {
    const [x0, y0] = pts[i], [x1, y1] = pts[i + 1];
    const L = Math.hypot(x1 - x0, y1 - y0), n = Math.max(1, Math.round(L / 6));
    const nx = -(y1 - y0) / (L || 1), ny = (x1 - x0) / (L || 1);
    for (let k = 0; k < n; k++) {
      const t = k / n;
      const w = amp * (Math.sin((s + t * L) / 90 + seed * 3.1) * 0.8 + Math.sin((s + t * L) / 23 + seed) * 0.25);
      out.push([x0 + (x1 - x0) * t + nx * w, y0 + (y1 - y0) * t + ny * w]);
    }
    s += L;
  }
  out.push(pts[pts.length - 1]);
  return out;
};
const lenOf = (pts: P[]) => pts.reduce((a, p, i) => (i ? a + Math.hypot(p[0] - pts[i - 1][0], p[1] - pts[i - 1][1]) : 0), 0);
const pointAt = (pts: P[], u: number): P => {
  const target = lenOf(pts) * clamp(u);
  let s = 0;
  for (let i = 1; i < pts.length; i++) {
    const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
    if (s + d >= target) { const t = (target - s) / (d || 1); return [pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * t, pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * t]; }
    s += d;
  }
  return pts[pts.length - 1];
};
const dOf = (pts: P[]) => pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' ');
/** The hand's speed curve (STYLE.md §5): slow-fast-slow. */
const handU = (u: number) => clamp(u - (Math.sin(2 * Math.PI * u) / (2 * Math.PI)) * 0.8);
/** A circle that starts at an angle and overshoots its closure. */
const loop = (cx: number, cy: number, rx: number, ry: number, seed: number): P[] => {
  const a0 = -2.2 + rnd(seed) * 0.6;
  return Array.from({length: 49}, (_, i) => {
    const a = a0 + (i / 48) * (Math.PI * 2 + 0.45);
    const r = 1 + (rnd(seed + i * 0.37) - 0.5) * 0.05 + (i / 48) * 0.06;
    return [cx + Math.cos(a) * rx * r, cy + Math.sin(a) * ry * r] as P;
  });
};
const rectPts = (x: number, y: number, w: number, h: number): P[][] => [[[x - 6, y], [x + w + 8, y + 2]], [[x + w, y - 6], [x + w - 2, y + h + 8]], [[x + w + 4, y + h], [x - 6, y + h - 2]], [[x, y + h + 6], [x + 2, y - 6]]];

/* ---------- the board's items: everything written, in board coordinates and absolute frames ---------- */

type Pen = 'ink' | 'blue' | 'orange';
const PEN_COL: Record<Pen, string> = {ink: INK, blue: BLUE, orange: ORANGE};
type Stroke = {kind: 'stroke'; pen: Pen; pts: P[]; w: number; t0: number; t1: number; erase?: [number, number]; ghostAfter?: number; seed: number};
type Text = {kind: 'text'; pen: Pen; text: string; x: number; y: number; size: number; t0: number; t1: number; face?: 'hand' | 'serif'; ghostAt?: number; anchor?: 'start' | 'middle'};
type Item = Stroke | Text;
const items: Item[] = [];
let seedN = 1;
const stroke = (pen: Pen, raw: P[], w: number, t0: number, t1: number, extra: Partial<Stroke> = {}) => {
  const s: Stroke = {kind: 'stroke', pen, pts: wobble(raw, seedN++, extra.erase ? 1.4 : 2.2), w, t0, t1, seed: seedN, ...extra};
  items.push(s);
  return s;
};
const write = (pen: Pen, text: string, x: number, y: number, size: number, t0: number, t1: number, extra: Partial<Text> = {}) => {
  const t: Text = {kind: 'text', pen, text, x, y, size, t0, t1, ...extra};
  items.push(t);
  return t;
};
const units = (s: string) => [...s].reduce((w, ch) => w + ((ch.codePointAt(0) ?? 0) < 128 ? (ch === ' ' ? 0.3 : 0.52) : 1), 0);
const widthOf = (t: Text) => units(t.text) * t.size * (t.face === 'serif' ? 1.02 : 1);
const left = (t: Text) => (t.anchor === 'middle' ? t.x - widthOf(t) / 2 : t.x);

/* ---------- the layout of the board (regions) ---------- */

// A hook (x 0–1080, y 250–1300): the prompt card, temperature 0, ×1000, the fan of answers, 80.
const CARD0: P = [540, 420];
const FAN_O: P = [540, 660];
// B fork (x 1240–3400, y 380–1250): 102 squares, the split at 103, Queens / New York City.
const SQ0 = 1260, SQS = 22, SQY = 760, FORK_X = SQ0 + 102 * SQS + 6;
const UP_END: P = [FORK_X + 560, SQY - 200], LO_END: P = [FORK_X + 560, SQY + 220];
// C culprit (x 1300–2700, y 1380–2050): racing lanes, "谁先算完？", the vLLM question pinned.
// D batch (x 0–1080, y 1500–2700): TM's figure pinned, the card among other people's requests, the batch box, the sums.
const CARD1: P = [540, 2290];
// E float (x 1300–2700, y 2250–2900): the paper's example.

const h = {
  aA: at('hook', 'a'), aB: at('hook', 'b'),
  fork: at('fork'), fA: at('fork', 'a'), fB: at('fork', 'b'), fC: at('fork', 'c'),
  cul: at('culprit'), cP: at('culprit', 'p'), cA: at('culprit', 'a'), cB: at('culprit', 'b'),
  bat: at('batch'), bA: at('batch', 'a'), bB: at('batch', 'b'),
  flo: at('float'), eA: at('float', 'a'), eC: at('float', 'c'), eB: at('float', 'b'),
  fix: at('fix'), xA: at('fix', 'a'), xB: at('fix', 'b'),
  end: at('end'), nA: at('end', 'a'), nB: at('end', 'b'),
};

// ---- A: hook ----
write('ink', '温度 = 0', 90, 640, 64, -40, -22);
write('ink', '×1000', 480, 650, 150, -14, 12);
const FAN: P[] = Array.from({length: 26}, (_, i) => {
  const a = Math.PI * (0.16 + 0.68 * (i / 25)) + (rnd(i + 3) - 0.5) * 0.05;
  const r = 300 + rnd(i * 2.3) * 190;
  return [FAN_O[0] + Math.cos(a) * r * 0.98, FAN_O[1] + Math.sin(a) * r * 0.62 + 80];
});
FAN.forEach((p, i) => {
  const t0 = 20 + i * ((h.aB - 14) - 20) / FAN.length;
  stroke('blue', [[FAN_O[0] + (p[0] - FAN_O[0]) * 0.12, FAN_O[1] + 50], p], 6, t0, t0 + 6);
});
write('orange', '80 种', 540, 1190, 170, h.aB, h.aB + 18, {anchor: 'middle'});
stroke('orange', loop(540, 1130, 280, 125, 7), 9, h.aB + 18, h.aB + 32);

// ---- B: fork ----
const SQ_T0 = h.fork + 2, SQ_T1 = h.fA - 2;
const sqAt = (i: number) => SQ_T0 + ((SQ_T1 - SQ_T0) * i) / 102;
for (let i = 0; i < 102; i++) {
  const x = SQ0 + i * SQS;
  stroke('blue', [[x, SQY - 8], [x + 15, SQY - 8], [x + 15, SQY + 8], [x, SQY + 8], [x, SQY - 9]], 4, sqAt(i), sqAt(i) + 2);
}
[25, 50, 75, 102].forEach((n) => write('ink', String(n), SQ0 + (n - 1) * SQS + 8, SQY + 70, 44, sqAt(n - 1), sqAt(n - 1) + 4, {anchor: 'middle'}));
write('ink', 'Feynman was born on May 11, 1918, in', SQ0 + 62 * SQS, SQY - 52, 44, sqAt(58), SQ_T1, {face: 'serif'});
write('orange', '103', FORK_X + 40, SQY + 120, 72, h.fA + 2, h.fA + 12);
stroke('orange', loop(FORK_X + 10, SQY, 30, 30, 11), 6, h.fA, h.fA + 8);
const UP: P[] = [[FORK_X + 20, SQY], [FORK_X + 180, SQY - 40], [FORK_X + 420, UP_END[1] + 30], UP_END];
const LO: P[] = [[FORK_X + 20, SQY], [FORK_X + 180, SQY + 40], [FORK_X + 420, LO_END[1] - 30], LO_END];
stroke('orange', UP, 22, h.fB - 6, h.fB + 10);
write('ink', 'Queens, New York', FORK_X + 60, SQY - 250, 56, h.fB + 8, h.fB + 34, {face: 'serif'});
write('orange', '992', UP_END[0] + 30, UP_END[1] + 40, 120, h.fB + 34, h.fB + 48);
const THIN = stroke('orange', LO, 4, h.fC - 6, h.fC + 6, {erase: [at('fix', 'a'), at('fix', 'a', 16)]});
const NYC = write('ink', 'New York City', FORK_X + 60, SQY + 320, 56, h.fC + 4, h.fC + 26, {face: 'serif', ghostAt: at('fix', 'a', 8)});
const EIGHT = write('orange', '8', LO_END[0] + 30, LO_END[1] + 40, 120, h.fC + 26, h.fC + 34, {ghostAt: at('fix', 'a', 1)});

// ---- C: culprit ----
const LANES = [0, 1, 2, 3].map((i) => 1500 + i * 120);
LANES.forEach((y, i) => {
  const L = 560 + rnd(i * 5.1) * 380;
  const t0 = h.cul + 4 + i * 5;
  stroke('blue', [[1600, y], [1600 + L * 0.85, y]], 6, t0, t0 + 12);
  stroke('blue', [[1600 + L * 0.85 - 26, y - 18], [1600 + L * 0.85, y], [1600 + L * 0.85 - 26, y + 18]], 6, t0 + 12, t0 + 15);
  write('ink', `GPU ${i + 1}`, 1410, y + 16, 44, t0, t0 + 6);
});
const RACE = write('ink', '谁先算完？', 1500, 2070, 110, h.cP, h.cP + 22);
stroke('orange', [[1480, 2032], [2080, 2022]], 10, h.cA + 6, h.cA + 13);
// ---- D: batch ----
const OTHERS = ['写一首诗', 'Fix my code', '翻译这段话', '总结这篇', 'Plan a trip', '算个账'];
const OTHER_POS: P[] = [[200, 2485], [540, 2485], [880, 2485], [200, 2625], [540, 2625], [880, 2625]];
// which other cards are inside the batch, by time (batch sizes 7 → 3 → 7 → 4)
const BATCHES: {t: number; n: number}[] = [{t: h.cB + 14, n: 7}, {t: h.bA, n: 3}, {t: h.bA + 16, n: 7}, {t: h.bA + 34, n: 4}];
const boxOf = (n: number): [number, number, number, number] => (n >= 7 ? [30, 2200, 1020, 500] : [30, 2200, 1020, 360]);
BATCHES.forEach((b, i) => {
  const [x, y, w, hh] = boxOf(b.n);
  const next = BATCHES[i + 1]?.t;
  rectPts(x, y, w, hh).forEach((seg, k) => stroke('blue', seg, 6, b.t + k * 2, b.t + k * 2 + 4, next ? {ghostAfter: next - 2} : {}));
  write('blue', `batch = ${b.n}`, x + w - 250, y - 22, 48, b.t + 6, b.t + 14, next ? {ghostAt: next - 2} : {});
});
write('blue', '一批', 50, 2184, 64, h.cB + 22, h.cB + 32);
write('blue', '(a + b) + (c + d)', 540, 2840, 66, h.bB + 2, h.bB + 22, {anchor: 'middle'});
write('orange', '((a + b) + c) + d', 540, 2950, 66, h.bB + 26, h.bB + 46, {anchor: 'middle'});
// ---- E: float ----
write('ink', '原文例子', 1400, 2330, 44, h.flo + 2, h.flo + 10);
write('ink', '(0.1 + 1e20) − 1e20', 1400, 2460, 72, h.flo + 6, h.eA + 2, {face: 'serif'});
write('ink', '= 0', 2250, 2460, 84, h.eA + 2, h.eA + 10);
write('ink', '0.1 + (1e20 − 1e20)', 1400, 2620, 72, h.eA + 8, h.eC, {face: 'serif'});
write('orange', '= 0.1', 2250, 2620, 84, h.eC, h.eC + 8);
stroke('ink', loop(2330, 2432, 120, 62, 21), 6, h.eC + 8, h.eC + 18);
stroke('orange', loop(2350, 2592, 150, 62, 23), 6, h.eC + 14, h.eC + 24);
// ---- F: fix ----
const FIX_X = FORK_X + 60;
write('ink', '批不变', FIX_X, SQY - 360, 84, h.fix + 8, h.fix + 24);
write('ink', '1000 / 1000', FORK_X + 110, SQY + 280, 104, h.xA + 16, h.xA + 30);
stroke('ink', [[FORK_X + 100, SQY + 312], [FORK_X + 720, SQY + 306]], 7, h.xA + 30, h.xA + 36);
write('ink', '26 秒 → 42 秒', FORK_X - 100, SQY + 490, 72, h.xB + 2, h.xB + 18);
write('ink', '另测 Qwen-3-8B · 单卡', FORK_X - 100, SQY + 560, 40, h.xB + 14, h.xB + 24);

/* ---------- magnets, printouts and the eraser ---------- */

type Card = {text: string; x: number; y: number; w: number; hh: number; at: number; mag: string; face: 'serif' | 'hand'; size: number; moves?: {t: number; to: P; d?: number}[]};
const PROMPT: Card = {text: 'Tell me about Richard Feynman', x: CARD0[0], y: CARD0[1], w: 780, hh: 150, at: -60, mag: BLUE, face: 'serif', size: 46,
  moves: [{t: h.cB - 8, to: CARD1, d: 22}]};
const OTHER_CARDS: Card[] = OTHERS.map((text, i) => ({text, x: OTHER_POS[i][0], y: OTHER_POS[i][1], w: 300, hh: 108, at: h.cB + 2 + i * 3, mag: '#9AA0A8', face: 'hand', size: 40}));
/** Which other cards are in the batch (the rest slide out to the right, off the board). */
const inBatch = (i: number, F: number) => {
  let n = 7;
  for (const b of BATCHES) if (F >= b.t - 6) n = b.n;
  if (F >= h.fix) n = 7;
  return i < n - 1;
};
const cardPos = (c: Card, F: number): P => {
  let p: P = [c.x, c.y];
  for (const m of c.moves ?? []) {
    const t = ease.inOutCubic(clamp((F - m.t) / (m.d ?? 12)));
    p = [p[0] + (m.to[0] - p[0]) * t, p[1] + (m.to[1] - p[1]) * t];
  }
  return p;
};
const CardView: React.FC<{c: Card; F: number; pos?: P; lift?: number}> = ({c, F, pos, lift = 0}) => {
  if (F < c.at) return null;
  const drop = ease.outBack(clamp((F - c.at) / 7), 1.8);
  const [x, y] = pos ?? cardPos(c, F);
  const sc = 1.12 - 0.12 * drop + lift * 0.04;
  return <div style={{position: 'absolute', left: x - c.w / 2, top: y - c.hh / 2, width: c.w, height: c.hh, transform: `scale(${sc}) rotate(${(rnd(c.x + c.y) - 0.5) * 2.4}deg)`, opacity: clamp((F - c.at) / 3)}}>
    <div style={{position: 'absolute', inset: 0, background: '#FFFEFA', borderRadius: 6, boxShadow: `0 ${4 + 14 * (1 - drop) + lift * 12}px ${10 + 20 * (1 - drop) + lift * 18}px rgba(40,38,30,${0.22 + 0.1 * lift})`}} />
    <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: c.face === 'serif' ? serif : hand, fontWeight: c.face === 'serif' ? 700 : 500,
      fontSize: c.size, color: INK, whiteSpace: 'nowrap', paddingTop: 8}}>{c.text}</div>
    <Magnet x={c.w / 2} y={6} color={c.mag} />
  </div>;
};
const Magnet: React.FC<{x: number; y: number; color: string; r?: number}> = ({x, y, color, r = 22}) => <div style={{position: 'absolute', left: x - r, top: y - r, width: r * 2, height: r * 2, borderRadius: r,
  background: `radial-gradient(circle at 35% 30%, #ffffff 0, ${color} 34%, ${color} 70%, rgba(0,0,0,0.35) 100%)`, boxShadow: '0 5px 8px rgba(40,38,30,0.35)'}} />;
const Pinned: React.FC<{src: string; x: number; y: number; w: number; hh: number; F: number; at: number; tag: string; rot?: number}> = ({src, x, y, w, hh, F, at: t, tag, rot = -1}) => {
  if (F < t) return null;
  const drop = ease.outBack(clamp((F - t) / 7), 1.8);
  return <div style={{position: 'absolute', left: x - w / 2, top: y - hh / 2, width: w, height: hh, transform: `scale(${1.1 - 0.1 * drop}) rotate(${rot}deg)`, opacity: clamp((F - t) / 3)}}>
    <div style={{position: 'absolute', inset: -14, background: '#FFFFFF', boxShadow: `0 ${6 + 12 * (1 - drop)}px ${16 + 16 * (1 - drop)}px rgba(40,38,30,0.25)`}} />
    <Img src={staticFile(src)} style={{position: 'absolute', inset: 0, width: w, height: hh}} />
    <Magnet x={36} y={-4} color={DIM} /><Magnet x={w - 36} y={-4} color={DIM} />
    {tag && <div style={{position: 'absolute', left: 74, top: -58, fontFamily: plex, fontSize: 24, color: DIM, background: 'rgba(247,246,241,0.9)', padding: '2px 8px', whiteSpace: 'nowrap'}}>{tag}</div>}
  </div>;
};

/* ---------- drawing the items ---------- */

const ghostOp = 0.13;
const StrokeView: React.FC<{s: Stroke; F: number}> = ({s, F}) => {
  if (F < s.t0) return null;
  const L = lenOf(s.pts);
  let u = handU(clamp((F - s.t0) / Math.max(1, s.t1 - s.t0)));
  let ghost = false;
  if (s.erase && F >= s.erase[0]) { u = 1 - clamp((F - s.erase[0]) / (s.erase[1] - s.erase[0])); ghost = true; }
  const gone = s.ghostAfter !== undefined && F >= s.ghostAfter;
  const col = PEN_COL[s.pen];
  const op = gone ? ghostOp + (1 - ghostOp) * (1 - clamp((F - s.ghostAfter!) / 4)) : 0.94;
  return <g style={{mixBlendMode: 'multiply'}}>
    {ghost && <path d={dOf(s.pts)} fill="none" stroke={col} strokeWidth={s.w} strokeLinecap="round" strokeLinejoin="round" opacity={ghostOp} />}
    <path d={dOf(s.pts)} fill="none" stroke={col} strokeWidth={s.w} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={`${L * u} ${L + 10}`} opacity={op} />
    {u > 0.02 && !gone && <circle cx={s.pts[0][0] + 0.5} cy={s.pts[0][1]} r={s.w * 0.42} fill={col} opacity={0.5} />}
  </g>;
};
const TextView: React.FC<{t: Text; F: number}> = ({t, F}) => {
  if (F < t.t0) return null;
  const chars = [...t.text];
  const u = handU(clamp((F - t.t0) / Math.max(1, t.t1 - t.t0))) * chars.length;
  const g = t.ghostAt !== undefined && F >= t.ghostAt ? ghostOp + (1 - ghostOp) * (1 - clamp((F - t.ghostAt) / 6)) : 0.94;
  // glyphs keep their natural advances (inline); each is revealed left → right as the nib passes; CJK glyphs get the
  // hand's small rotation and baseline jitter (STYLE.md §2), Latin runs stay on their baseline
  return <div style={{position: 'absolute', left: t.x, top: t.y - t.size * 0.92, transform: t.anchor === 'middle' ? 'translateX(-50%)' : undefined, whiteSpace: 'pre', mixBlendMode: 'multiply',
    fontFamily: t.face === 'serif' ? serif : hand, fontWeight: t.face === 'serif' ? 700 : 500, fontSize: t.size, lineHeight: 1.2, color: PEN_COL[t.pen], opacity: g}}>
    {chars.map((ch, i) => {
      const p = clamp(u - i);
      const cjk = (ch.codePointAt(0) ?? 0) >= 0x2e80;
      return <span key={i} style={{display: 'inline-block', clipPath: `inset(-20% ${(1 - p) * 100}% -20% 0)`, visibility: p <= 0 ? 'hidden' : 'visible',
        transform: cjk ? `rotate(${(rnd(i + t.x) - 0.5) * 3}deg) translateY(${(rnd(i * 3.3 + t.y) - 0.5) * t.size * 0.05}px)` : undefined}}>{ch}</span>;
    })}
  </div>;
};
/** Where the item's nib is at frame F (for the floating pens). */
const tipOf = (it: Item, F: number): P => {
  const u = clamp((F - it.t0) / Math.max(1, it.t1 - it.t0));
  if (it.kind === 'stroke') return pointAt(it.pts, handU(u));
  return [left(it) + widthOf(it) * handU(u), it.y - it.size * 0.3];
};
const startOf = (it: Item): P => (it.kind === 'stroke' ? it.pts[0] : [left(it), it.y - it.size * 0.3]);
const endOf = (it: Item): P => (it.kind === 'stroke' ? it.pts[it.pts.length - 1] : [left(it) + widthOf(it), it.y - it.size * 0.3]);

/* ---------- the camera ---------- */

type Cam = {x: number; y: number; z: number};
type CK = [number, number, number, number];
const camAt = (F: number, keys: CK[]): Cam => {
  if (F <= keys[0][0]) return {x: keys[0][1], y: keys[0][2], z: keys[0][3]};
  for (let i = 0; i < keys.length - 1; i++) {
    const [a, ax, ay, az] = keys[i], [b, bx, by, bz] = keys[i + 1];
    if (F <= b) {
      const t = ease.inOutCubic(clamp((F - a) / Math.max(1, b - a)));
      const iz = 1 / az + (1 / bz - 1 / az) * t; // zoom in 1/z so pushes feel like dollies (STYLE.md §6)
      return {x: ax + (bx - ax) * t, y: ay + (by - ay) * t, z: 1 / iz};
    }
  }
  const l = keys[keys.length - 1];
  return {x: l[1], y: l[2], z: l[3]};
};
const sqX = (F: number) => SQ0 + 102 * SQS * clamp((F - SQ_T0) / (SQ_T1 - SQ_T0));
const CAM: CK[] = [
  [-30, 540, 900, 1.04], [h.aB - 6, 540, 960, 1.0], [h.fork - 6, 540, 960, 0.97],
  // B: ride the pen along the squares (filled per frame below), then the fork
  [h.fA, FORK_X - 120, SQY + 40, 1.25], [h.fB - 6, FORK_X + 380, SQY + 20, 1.0], [h.fC - 6, FORK_X + 420, SQY - 60, 1.1], [h.fC + 30, FORK_X + 380, SQY + 60, 1.0],
  // C: whip down to the lanes
  [h.cul + 8, 1920, 1700, 1.0], [h.cA + 10, 1900, 1780, 1.06],
  // D: the batch (the card slides here at the same time)
  [h.cB + 8, 560, 2350, 0.98], [h.bA - 4, 540, 2420, 1.0], [h.bB, 540, 2500, 0.98], [h.bB + 40, 540, 2680, 1.02],
  // E: the paper's example
  [h.flo + 8, 1880, 2500, 1.0], [h.eB - 6, 1900, 2540, 1.03],
  // back to the fork (the callback)
  [h.eB + 8, FORK_X + 380, SQY + 60, 1.02],
  // F: the fix
  [h.fix + 20, FORK_X + 380, SQY + 40, 1.0], [h.xA + 4, FORK_X + 360, SQY + 120, 1.06], [h.xB + 6, FORK_X + 300, SQY + 220, 1.0],
  // G: the whole board, then back to the card among the others
  [h.end + 4, FORK_X + 300, SQY + 220, 1.0], [h.nA - 2, 2050, 1700, 0.26], [h.nB + 4, 560, 2420, 0.96], [END, 560, 2400, 1.0],
];
const camOf = (F: number): Cam => {
  if (F >= h.fork - 6 && F < h.fA) {
    const c = camAt(F, CAM);
    const tx = sqX(F) + 160;
    const k = clamp((F - h.fork + 6) / 10);
    return {x: c.x + (tx - c.x) * k, y: c.y + ((SQY + 60) - c.y) * k, z: 1.0 + 0.25 * k};
  }
  return camAt(F, CAM);
};

/* ---------- pens ---------- */

const PenView: React.FC<{pen: Pen; F: number; cam: Cam}> = ({pen, F, cam}) => {
  const mine = items.filter((it) => it.pen === pen && !(it.kind === 'stroke' && it.erase && false));
  const active = mine.find((it) => F >= it.t0 && F <= it.t1);
  const park: P = [cam.x + (560 + (pen === 'ink' ? 0 : pen === 'blue' ? 60 : 120)) / cam.z, cam.y + (180 + (pen === 'ink' ? 0 : pen === 'blue' ? 90 : 180)) / cam.z];
  let p: P, lift = 0;
  if (active) { p = tipOf(active, F); lift = 0; }
  else {
    const prev = [...mine].filter((it) => it.t1 < F).sort((a, b) => b.t1 - a.t1)[0];
    const next = mine.filter((it) => it.t0 > F).sort((a, b) => a.t0 - b.t0)[0];
    const from = prev ? endOf(prev) : park;
    if (next && next.t0 - F <= 8) {
      const gap = prev ? next.t0 - prev.t1 : 99;
      const src = gap <= 16 ? from : park;
      const t = ease.inOutCubic(1 - (next.t0 - F) / Math.min(8, Math.max(1, gap)));
      const to = startOf(next);
      p = [src[0] + (to[0] - src[0]) * t, src[1] + (to[1] - src[1]) * t];
      lift = Math.sin(t * Math.PI) * 0.8 + (1 - t) * 0.2;
    } else {
      const t = ease.inOutCubic(clamp((F - (prev?.t1 ?? -99)) / 12));
      p = [from[0] + (park[0] - from[0]) * t, from[1] + (park[1] - from[1]) * t];
      lift = Math.min(1, t * 1.5);
    }
  }
  const col = PEN_COL[pen];
  const s = 1 + lift * 0.08;
  // a dry-erase marker: white barrel, colour band and cap end, felt nib at the tip; it leans to the right
  return <div style={{position: 'absolute', left: p[0], top: p[1], width: 0, height: 0}}>
    <div style={{position: 'absolute', left: 18 + lift * 40, top: 10 + lift * 50, width: 46, height: 290, borderRadius: 20, background: 'rgba(40,38,30,0.18)', filter: `blur(${4 + lift * 10}px)`,
      transformOrigin: '50% 0', transform: 'rotate(-28deg)'}} />
    <div style={{position: 'absolute', left: -14, top: -lift * 26, width: 28, height: 300, transformOrigin: '50% 0', transform: `rotate(-28deg) scale(${s})`}}>
      <div style={{position: 'absolute', left: 9, top: -6, width: 10, height: 18, borderRadius: '3px 3px 1px 1px', background: col}} />
      <div style={{position: 'absolute', left: 3, top: 10, width: 22, height: 26, background: '#D8D8D4', clipPath: 'polygon(30% 0, 70% 0, 100% 100%, 0 100%)'}} />
      <div style={{position: 'absolute', left: 0, top: 34, width: 28, height: 220, borderRadius: 6, background: 'linear-gradient(90deg, #DADAD6, #FFFFFF 40%, #E4E4E0)'}} />
      <div style={{position: 'absolute', left: 0, top: 120, width: 28, height: 26, background: col}} />
      <div style={{position: 'absolute', left: -1, top: 250, width: 30, height: 56, borderRadius: '6px 6px 12px 12px', background: col}} />
    </div>
  </div>;
};

/* ---------- the eraser ---------- */

const EraserView: React.FC<{F: number}> = ({F}) => {
  const [t0, t1] = THIN.erase!;
  if (F < t0 - 10 || F > t1 + 14) return null;
  const u = 1 - clamp((F - t0) / (t1 - t0));
  const tip = pointAt(THIN.pts, u);
  const off = F < t0 ? (t0 - F) / 10 : F > t1 ? (F - t1) / 14 : 0;
  const x = tip[0] + off * 500, y = tip[1] + off * 260 + Math.sin(F * 1.7) * 6;
  return <div style={{position: 'absolute', left: x - 90, top: y - 40, width: 180, height: 80, transform: `rotate(${-8 + Math.sin(F * 1.7) * 4}deg)`}}>
    <div style={{position: 'absolute', inset: 0, borderRadius: 10, background: 'linear-gradient(180deg, #3A3D44, #23262C)', boxShadow: '0 12px 20px rgba(40,38,30,0.3)'}} />
    <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: 22, borderRadius: '0 0 10 10', background: '#B9B5AA'}} />
  </div>;
};

/* ---------- the board ---------- */

const GHOSTS: {d: string; c: string}[] = Array.from({length: 26}, (_, i) => {
  const x = rnd(i * 7.7) * 4400, y = rnd(i * 3.1 + 2) * 3000 + 100;
  const kind = i % 3;
  const pts: P[] = kind === 0 ? loop(x, y, 60 + rnd(i) * 80, 40 + rnd(i + 1) * 50, i) : kind === 1 ? [[x, y], [x + 200 + rnd(i) * 200, y + (rnd(i + 2) - 0.5) * 120]] : [[x, y], [x + 60, y - 50], [x + 120, y + 10], [x + 180, y - 40]];
  return {d: dOf(wobble(pts, i + 50)), c: i % 4 === 0 ? '#9FB3C8' : '#A8A8A3'};
});
const Board: React.FC<{F: number}> = ({F}) => {
  const cam = camOf(F);
  const vis = items.filter((it) => it.t0 <= F);
  const card = cardPos(PROMPT, F);
  const sheenX = ((-cam.x * 0.35 * cam.z) % 2400) + 600;
  return <div style={{position: 'absolute', inset: 0, overflow: 'hidden', background: '#ECEAE3'}}>
    <div style={{position: 'absolute', left: 0, top: 0, width: 5000, height: 3600, transformOrigin: '0 0', transform: `translate(540px, 960px) scale(${cam.z}) translate(${-cam.x}px, ${-cam.y}px)`}}>
      {/* the board: warm white, faint scuffs, ghosts of old lessons */}
      <div style={{position: 'absolute', left: -400, top: -400, width: 5600, height: 4200, background: 'radial-gradient(ellipse 70% 60% at 45% 40%, #FAF9F5 0%, #F4F2EC 60%, #ECEAE3 100%)'}} />
      {/* TM's two highlighter fields under their regions: nondeterministic (yellow) and, after the fix, deterministic (green) */}
      <HighlighterWash x={FORK_X - 760} y={SQY - 330} w={1680} hh={760} color={WASH_N} F={F} t0={h.fork} t1={h.fork + 14} />
      <HighlighterWash x={FORK_X - 760} y={SQY - 330} w={1680} hh={760} color={WASH_D} F={F} t0={h.fix + 2} t1={h.fix + 16} />
      <svg width={5000} height={3600} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
        {GHOSTS.map((g, i) => <path key={i} d={g.d} fill="none" stroke={g.c} strokeWidth={6} opacity={0.09} strokeLinecap="round" />)}
      </svg>
      {/* printouts pinned under magnets */}
      <Pinned src="images/llm-same-prompt-diff-output/tm-nondeterministic.png" x={540} y={1940} w={860} hh={358} F={F} at={h.cB + 4} tag="原图：Thinking Machines" />
      <Pinned src="images/llm-same-prompt-diff-output/vllm-17166-question.png" x={1900} y={1250} w={710} hh={235} F={F} at={h.cul + 24} tag="GitHub vLLM #17166 · 2025.04" rot={1.2} />
      <Pinned src="images/llm-same-prompt-diff-output/vllm-17166-title.png" x={1900} y={1070} w={710} hh={68} F={F} at={h.cul + 20} tag="" rot={1.2} />
      <svg width={5000} height={3600} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
        {vis.filter((it): it is Stroke => it.kind === 'stroke').map((s, i) => <StrokeView key={i} s={s} F={F} />)}
      </svg>
      {vis.filter((it): it is Text => it.kind === 'text').map((t, i) => <TextView key={i} t={t} F={F} />)}
      {/* the cards: other people's requests (magnets), and yours */}
      {OTHER_CARDS.map((c, i) => {
        const inside = inBatch(i, F);
        const outX = -500 - i * 40;
        const lastT = BATCHES.reduce((t, b) => (F >= b.t - 6 ? b.t - 6 : t), 0);
        const prevIn = (() => { let n = 7; for (const b of BATCHES) if (lastT > b.t - 6) n = b.n; return i < n - 1; })();
        const tt = ease.inOutCubic(clamp((F - lastT) / 8));
        const a = prevIn ? c.x : outX, b = inside ? c.x : outX;
        return <CardView key={i} c={c} F={F} pos={[a + (b - a) * tt, c.y]} lift={a !== b ? Math.sin(tt * Math.PI) : 0} />;
      })}
      <CardView c={PROMPT} F={F} pos={card} lift={clamp(1 - Math.abs(F - (h.cB + 3)) / 12)} />
      <EraserView F={F} />
      {(['ink', 'blue', 'orange'] as Pen[]).map((p) => <PenView key={p} pen={p} F={F} cam={cam} />)}
    </div>
    {/* the window sheen, drifting slower than the board */}
    <div style={{position: 'absolute', left: sheenX - 600, top: -400, width: 520, height: 2800, background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.14), transparent)', transform: 'rotate(18deg)', pointerEvents: 'none'}} />
    <div style={{position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 90% 75% at 50% 45%, transparent 60%, rgba(60,55,40,0.12) 100%)'}} />
    {F < h.cul && <div style={{position: 'absolute', right: 40, top: 150, opacity: 1 - clamp((F - h.cul + 8) / 8), fontFamily: plex, fontSize: 24, color: DIM, letterSpacing: 1, textAlign: 'right', lineHeight: 1.5}}>
      THINKING MACHINES · 2025.09<br />Qwen3-235B · 温度 0 · 1000 次
    </div>}
  </div>;
};
const HighlighterWash: React.FC<{x: number; y: number; w: number; hh: number; color: string; F: number; t0: number; t1: number}> = ({x, y, w, hh, color, F, t0, t1}) => {
  if (F < t0) return null;
  const u = handU(clamp((F - t0) / (t1 - t0)));
  return <div style={{position: 'absolute', left: x, top: y, width: w * u, height: hh, background: color, mixBlendMode: 'multiply', borderRadius: 30, opacity: 0.95}} />;
};

const make = (): Scene => {
  const S: Scene = () => null;
  return S;
};
const boardScene = (id: string): Scene => {
  const S = make();
  S.backdrop = ({f}) => <Board F={SC[id].startFrame + f} />;
  S.sfx = () => {
    const s0 = SC[id].startFrame, s1 = s0 + SC[id].durationFrames;
    const ev: {at: number; kind: string; gain: number}[] = [];
    // every stroke sounds: a short tap at the start of each written item (felt on gloss), cards clack, the eraser rubs
    items.forEach((it) => { if (it.t0 >= s0 && it.t0 < s1 && it.t1 - it.t0 >= 6) ev.push({at: it.t0 - s0, kind: 'fs-paper-slide', gain: 0.035}); });
    [PROMPT, ...OTHER_CARDS].forEach((c) => { if (c.at >= s0 && c.at < s1) ev.push({at: c.at - s0 + 5, kind: 'tap', gain: 0.09}); });
    if (THIN.erase![0] >= s0 && THIN.erase![0] < s1) ev.push({at: THIN.erase![0] - s0, kind: 'fs-whoosh-wipe', gain: 0.1});
    return ev;
  };
  return S;
};

/** Cover anchor (880 × 800): the prompt card, the fan of answers and the ringed 80. */
const Cover: Scene = () => <div style={{position: 'absolute', left: 0, top: 0, width: 880, height: 800, overflow: 'hidden', background: '#F7F6F1'}}>
  <div style={{position: 'absolute', left: -100, top: -420, width: W, height: 1920}}><Board F={h.aB + 40} /></div>
</div>;

export const llmSamePromptScenes: Record<string, Scene> = {
  'ld.hook': boardScene('hook'), 'ld.fork': boardScene('fork'), 'ld.culprit': boardScene('culprit'), 'ld.batch': boardScene('batch'), 'ld.float': boardScene('float'),
  'ld.fix': boardScene('fix'), 'ld.end': boardScene('end'), 'ld.cover': Cover,
};
void NYC; void EIGHT; void RACE;
