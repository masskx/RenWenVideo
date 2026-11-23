import React from 'react';
import {OffthreadVideo, Sequence, staticFile} from 'remotion';
import {Scene} from '../paper';
import type {CoverRatio} from '../types';
import {font} from '../theme';
import {cond, hand, plex, serif} from '../fonts';
import {clamp, ease} from '../../fx';
import {CK, Cam, Ink, P, PenView, camAt, createBoard, dOf, loop, rnd, timeline, wobble} from '../wb-kit';
import TL from '../../../tutorials/openai-ai-development-limits.timeline.json';

// openai-ai-development-limits: OpenAI's chief scientist publishes the log-perplexity of its models (GPT-3.5 ~0.99,
// GPT-4 ~0.91, later < 0.8; a ~0.76 model began producing groundbreaking results on open maths problems) and proposes
// common limits that labs commit not to cross until monitoring reaches a milestone; Microsoft AI publishes 0.819 for
// MAI-2 Base on the same evaluation set, calling its access an exception. Inputs: inputs/openai-ai-development-limits/.
// Storyboard: tutorials/openai-ai-development-limits.storyboard.md.
// Template lemo/dataviz (STYLE.md: the chart is the film; every mark a real number drawn by a two-lead pencil; notes pinned
// to marks; axes grow with the narration; the empty next cell; the subtitle is the figure caption). Customised: the sheet
// is the material's own dark drafting film (#121D26, panel #1D2E38) instead of cream paper, and the two leads are its mint
// #80F0D8 (OpenAI's own numbers, notes) and amber #F8D890 (the line, the questions — the template's "red for warnings");
// the native move "the empty next cell" becomes the brake line itself: a dashed amber line with no value, its "?" handle
// drifting (the proposal names no number); the planner's guess-the-word clip is pinned as the one "object before the axis";
// borrowed from lemo/archive-lighttable: a push into the footnote line ("internal codebase, fixed snapshot") lit up.
// Facts on screen are the article's own (wording kept: 约 / 低于 / ~0.76 / ~0.68–0.7 "作者预计"); 0.819 is Suleyman's.

const {at} = timeline(TL);
const C = {ink: '#DCEBE6', mint: '#80F0D8', amber: '#F8D890', dim: '#7F948F'};
const BG = '#121D26', PANEL = '#1D2E38';
const kit = createBoard(C, {blend: 'normal'});
const {stroke, write, strokes} = kit;
const SW = 2200, SH = 2300;

const h = {
  hook: at('hook'), hA: at('hook', 'a'), hB: at('hook', 'b'),
  met: at('metric'), mA: at('metric', 'a'), mB: at('metric', 'b'),
  data: at('data'), dA: at('data', 'a'), dB: at('data', 'b'),
  line: at('line'), lA: at('line', 'a'), lB: at('line', 'b'), lC: at('line', 'c'),
  tw: at('twist'), tA: at('twist', 'a'),
  ms: at('ms'), sA: at('ms', 'a'), sB: at('ms', 'b'),
  deb: at('debate'), bA: at('debate', 'a'), bB: at('debate', 'b'),
  end: at('end'), eA: at('end', 'a'),
};

/* ---------- the chart (world: x 150–980, y 500–1300); the guess panel right of it; the debate cards bottom-right ---------- */
const X0 = 150, X1 = 980, Y0 = 500, Y1 = 1300, VT = 1.02, VB = 0.66;
const yOf = (v: number) => Y0 + ((VT - v) / (VT - VB)) * (Y1 - Y0);
const MARKS: {x: number; v: number; at: number}[] = [{x: 250, v: 0.99, at: -40}, {x: 430, v: 0.91, at: -34}, {x: 610, v: 0.795, at: -28}, {x: 760, v: 0.76, at: -22}];
const LINE_PTS = MARKS.map((m) => [m.x, yOf(m.v)] as P);
stroke('dim', [[X0, Y0 - 20], [X0, Y1 + 10], [X1, Y1 + 10]], 3, -60, -44);
stroke('mint', LINE_PTS, 5, -30, -12);
// hook: the number and its note
write('mint', '≈0.76', 800, yOf(0.76) + 40, 84, -14, -4, {face: 'serif'});
strokes('amber', [loop(760, yOf(0.76), 40, 40, 3)], 5, h.hA - 6, h.hA + 6);
write('amber', '数学难题上出突破', 170, 1050, 46, h.hB, h.hB + 18);
strokes('amber', [[[560, 1040], [718, yOf(0.76) - 4]]], 3, h.hB + 14, h.hB + 20);
// metric (right panel): the guess clip, then the unit arrives on the axis
write('mint', '猜下一个词', 1210, 470, 56, h.mA - 4, h.mA + 10, {ghostAt: h.deb - 10});
write('mint', '猜得越准 → 分数越低', 1210, 1330, 60, h.mB - 2, h.mB + 16, {ghostAt: h.deb - 10});
write('ink', '对数困惑度', 168, 470, 44, h.mB + 6, h.mB + 20);
write('dim', '↓ 越低越准', 400, 470, 34, h.mB + 18, h.mB + 28);
// data: ticks, labels as each value is said, the 0.80 rule, the next window (author's own estimate)
[1.0, 0.9, 0.8, 0.7].forEach((v, i) => { write('dim', v.toFixed(1), 70, yOf(v) + 12, 30, h.data + i * 2, h.data + i * 2 + 6); stroke('dim', [[X0 - 12, yOf(v)], [X0, yOf(v)]], 3, h.data + i * 2, h.data + i * 2 + 4); });
write('ink', 'GPT-3.5', 290, yOf(0.99) - 8, 38, h.data + 2, h.data + 14);
write('mint', '约 0.99', 290, yOf(0.99) + 48, 44, h.data + 10, h.data + 22);
write('ink', 'GPT-4', 470, yOf(0.91) - 50, 38, h.dA - 2, h.dA + 10);
write('mint', '约 0.91', 470, yOf(0.91) + 4, 44, h.dA + 6, h.dA + 18);
stroke('mint', [[X0, yOf(0.8)], [X1, yOf(0.8)]], 2, h.dB - 4, h.dB + 8);
write('ink', '后来的模型', 650, yOf(0.8) - 66, 36, h.dB - 2, h.dB + 10);
write('mint', '低于 0.80', 650, yOf(0.8) - 14, 42, h.dB + 6, h.dB + 18);
write('dim', '下一个窗口 ~0.68–0.7（作者预计）', 470, yOf(0.68) - 6, 28, h.dB + 26, h.dB + 40);
write('dim', '数据：OpenAI 内部代码库 · 固定快照（原文脚注 3）', 160, 1372, 28, h.data + 30, h.data + 50);
strokes('amber', [[[292, 1381], [486, 1383]]], 5, h.tA, h.tA + 10);
strokes('amber', [loop(390, 1360, 116, 32, 9)], 4, h.tA + 10, h.tA + 22);
// line: the proposal
write('amber', '共同上限（提议）· 数值未定', 170, 1200, 36, h.lA, h.lA + 16);
write('ink', '安全监测跟上之前', 170, 1450, 46, h.lB, h.lB + 16);
write('amber', '不越过', 570, 1450, 56, h.lC, h.lC + 10);
// ms: Microsoft's dot (a diamond, the borrowed evaluation set) and its caveat, upper right of the chart
write('ink', '微软 MAI-2 Base', 690, 640, 34, h.sA - 4, h.sA + 8);
write('mint', '0.819', 690, 716, 60, h.sA, h.sA + 8, {face: 'serif'});
write('dim', '据微软 AI 负责人 Suleyman', 690, 760, 24, h.sA + 6, h.sA + 14);
write('amber', '同一套题 · 拿到题集是特例', 690, 820, 34, h.sB, h.sB + 18);
strokes('mint', [[[840, 772], [872, yOf(0.819) - 22]]], 3, h.sA + 4, h.sA + 10);

/* ---------- camera ---------- */
const CAM: CK[] = [
  [-30, 800, 1070, 1.5], [h.hA - 4, 760, 1050, 1.36], [h.hA + 14, 590, 960, 1.0], [h.met - 8, 600, 980, 1.0],
  [h.met + 2, 1650, 960, 1.0], [h.mB, 1650, 970, 1.03], [h.data - 8, 1650, 980, 1.03],
  [h.data + 2, 500, 900, 1.08], [h.dA + 4, 560, 960, 1.1], [h.dB + 4, 640, 1030, 1.12], [h.dB + 40, 590, 1010, 1.02],
  [h.line + 6, 580, 1040, 1.0], [h.lC + 30, 580, 1060, 1.04],
  [h.tw - 2, 580, 1060, 1.04], [h.tw + 10, 410, 1350, 2.1], [h.ms - 6, 420, 1355, 2.2],
  [h.ms + 6, 600, 1000, 1.0], [h.sB + 40, 610, 1010, 1.04],
  [h.deb - 4, 610, 1010, 1.04], [h.deb + 6, 1650, 2010, 1.0], [h.bB + 30, 1650, 2020, 1.03],
  [h.end - 2, 1650, 2020, 1.03], [h.end + 8, 600, 1010, 0.98], [h.end + 120, 640, 1040, 1.08],
];
const camOf = (F: number): Cam => camAt(F, CAM);

/* ---------- the brake line: a dashed amber line whose height is not decided ---------- */
const lineY = (F: number) => yOf(0.735) + Math.sin(F / 22) * 34 + Math.sin(F / 9.3) * 6;
const BrakeLine: React.FC<{F: number}> = ({F}) => {
  if (F < h.line + 2) return null;
  const p = ease.inOutCubic(clamp((F - h.line - 2) / 14));
  const y = lineY(F), bold = F >= h.lC ? ease.outCubic(clamp((F - h.lC) / 8)) : 0;
  return <svg width={SW} height={SH} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
    <path d={dOf(wobble([[X0, y], [X0 + (X1 + 40 - X0) * p, y + 2]], 7, 1.4))} fill="none" stroke={C.amber} strokeWidth={5 + 4 * bold} strokeDasharray="22 14" strokeLinecap="round" />
    {p > 0.95 && <g transform={`translate(${X1 + 76}, ${y}) scale(${1 + 1.3 * ease.outBack(clamp((F - h.eA) / 10), 1.6)})`}>
      <circle r={34} fill={BG} stroke={C.amber} strokeWidth={5} />
      <text y={14} textAnchor="middle" fill={C.amber} style={{fontFamily: serif, fontWeight: 900, fontSize: 44}}>?</text>
    </g>}
  </svg>;
};

/* ---------- debate cards (planner's two discussion lines, rebuilt as pinned notes) ---------- */
const NoteCard: React.FC<{F: number; at: number; x: number; y: number; w: number; edge: string; head: string; sub: string}> = ({F, at: t, x, y, w, edge, head, sub}) => {
  if (F < t) return null;
  const p = ease.outBack(clamp((F - t) / 8), 1.6);
  return <div style={{position: 'absolute', left: x, top: y, width: w, transform: `translateY(${(1 - p) * 40}px) rotate(${(rnd(x + y) - 0.5) * 2}deg)`, opacity: clamp((F - t) / 4),
    background: PANEL, border: `3px solid ${edge}`, borderRadius: 18, padding: '22px 30px'}}>
    <div style={{fontFamily: font, fontWeight: 900, fontSize: 56, color: edge}}>{head}</div>
    <div style={{fontFamily: font, fontWeight: 500, fontSize: 36, color: C.ink, marginTop: 6}}>{sub}</div>
  </div>;
};

/* ---------- the sheet ---------- */
const Sheet: React.FC<{F: number; s0?: number; camera?: Cam; noPen?: boolean}> = ({F, s0 = 0, camera, noPen}) => {
  const cam = camera ?? camOf(F);
  return <div style={{position: 'absolute', inset: 0, overflow: 'hidden', background: BG}}>
    <div style={{position: 'absolute', left: 0, top: 0, width: SW, height: SH, transformOrigin: '0 0', transform: `translate(540px, 960px) scale(${cam.z}) translate(${-cam.x}px, ${-cam.y}px)`}}>
      {/* drafting film: a faint dot grid in world space and a few fibres */}
      <svg width={SW + 1200} height={SH + 1200} style={{position: 'absolute', left: -600, top: -600}}>
        <defs><pattern id="ol-grid" width={36} height={36} patternUnits="userSpaceOnUse"><circle cx={18} cy={18} r={1.6} fill="#2A3D48" /></pattern></defs>
        <rect width={SW + 1200} height={SH + 1200} fill="url(#ol-grid)" />
      </svg>
      {/* the next window: a hatched band, the author's own estimate */}
      {F >= h.dB + 22 && <svg width={SW} height={SH} style={{position: 'absolute', left: 0, top: 0, opacity: clamp((F - h.dB - 22) / 10)}}>
        <defs><pattern id="ol-hatch" width={14} height={14} patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1={0} y1={0} x2={0} y2={14} stroke="#3B5560" strokeWidth={4} /></pattern></defs>
        <rect x={X0} y={yOf(0.70)} width={X1 - X0} height={yOf(0.68) - yOf(0.70)} fill="url(#ol-hatch)" />
      </svg>}
      {/* the guess-the-word clip (planner's original, muted), pinned below the chart */}
      {F >= h.met - 10 && F < h.deb - 4 && <div style={{position: 'absolute', left: 1200, top: 520, width: 900, height: 700, overflow: 'hidden', borderRadius: 18, border: `2px solid ${PANEL}`}}>
        <Sequence from={h.met - 10 - s0} layout="none">
          <OffthreadVideo src={staticFile('video/openai-ai-development-limits/guess.mp4')} muted style={{position: 'absolute', left: -60, top: -230, width: 1020, height: 1813}} />
        </Sequence>
      </div>}
      {F >= h.met - 10 && F < h.deb - 4 && <div style={{position: 'absolute', left: 1206, top: 1236, fontFamily: plex, fontSize: 24, color: C.dim}}>猜词示意 · 策划原创动画</div>}
      <BrakeLine F={F} />
      <Ink kit={kit} F={F} w={SW} h={SH} />
      {/* data dots: ink ring, mint fill; Microsoft's is a hollow diamond */}
      <svg width={SW} height={SH} style={{position: 'absolute', left: 0, top: 0}}>
        {[[0, h.data + 2], [1, h.dA - 2], [2, h.dB - 2], [3, h.hA - 6]].map(([i, t]) => { if (F < t || F > t + 22) return null; const k = (F - t) / 22, m = MARKS[i]; return <circle key={`r${i}`} cx={m.x} cy={yOf(m.v)} r={16 + 70 * ease.outCubic(k)} fill="none" stroke={C.mint} strokeWidth={4} opacity={1 - k} />; })}
        {F >= h.sA && F < h.sA + 22 && <circle cx={880} cy={yOf(0.819)} r={16 + 70 * ease.outCubic((F - h.sA) / 22)} fill="none" stroke={C.mint} strokeWidth={4} opacity={1 - (F - h.sA) / 22} />}
        {MARKS.map((m, i) => { if (F < m.at) return null; const k = ease.outBack(clamp((F - m.at) / 6), 2); return <circle key={i} cx={m.x} cy={yOf(m.v)} r={16 * k} fill={C.mint} stroke={BG} strokeWidth={5} />; })}
        {F >= h.sA && (() => { const k = ease.outBack(clamp((F - h.sA) / 6), 2), x = 880, y = yOf(0.819); return <rect x={x - 15 * k} y={y - 15 * k} width={30 * k} height={30 * k} transform={`rotate(45 ${x} ${y})`} fill={BG} stroke={C.mint} strokeWidth={5} />; })()}
      </svg>
      <NoteCard F={F} at={h.deb + 4} x={1200} y={1680} w={900} edge={C.mint} head="先把监测做扎实" sub="线画早了，监测有时间追上" />
      <NoteCard F={F} at={h.bA} x={1200} y={1940} w={430} edge={C.amber} head="题谁来出？" sub="别家能不能一起出题" />
      <NoteCard F={F} at={h.bB} x={1670} y={1940} w={430} edge={C.amber} head="谁来验？" sub="结果能不能复核" />
      {!noPen && (['mint', 'amber'] as const).map((p, i) => <PenView key={p} kit={kit} pen={p} slot={i} F={F} cam={cam} look="pencil" />)}
    </div>
    <div style={{position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 95% 80% at 50% 45%, transparent 55%, rgba(0,0,0,0.35) 100%)'}} />
    {/* chart headline, top-left in screen space (the chart's own title) */}
    <div style={{position: 'absolute', left: 64, top: 160, opacity: F < h.tw || F >= h.ms + 6 ? 1 : 0.15}}>
      <div style={{fontFamily: plex, fontSize: 24, color: C.dim, letterSpacing: 2}}>OPENAI · PERPLEXITY AND INTELLIGENCE · 2026-11-22</div>
      <div style={{fontFamily: font, fontWeight: 900, fontSize: 52, color: C.ink, marginTop: 6}}>越来越会猜，<span style={{color: C.amber}}>何时该停？</span></div>
    </div>
  </div>;
};

const sceneOf = (id: string, next?: string): Scene => {
  const S: Scene = () => null;
  const s0 = at(id), s1 = next ? at(next) : 1e9;
  S.backdrop = ({f}) => <Sheet F={s0 + f} s0={s0} />;
  S.sfx = () => {
    const ev: {at: number; kind: string; gain: number}[] = [];
    kit.items.forEach((it) => { if (it.t0 >= s0 && it.t0 < s1 && it.t1 - it.t0 >= 8) ev.push({at: it.t0 - s0, kind: 'fs-paper-slide', gain: 0.03}); });
    [h.hA - 6, h.data + 10, h.dA + 6, h.dB + 6, h.sA].forEach((t) => { if (t >= s0 && t < s1) ev.push({at: t - s0, kind: 'tick', gain: 0.08}); });
    [h.lC, h.tA].forEach((t) => { if (t >= s0 && t < s1) ev.push({at: t - s0, kind: 'marker', gain: 0.08}); });
    [h.deb + 4, h.bA, h.bB].forEach((t) => { if (t >= s0 && t < s1) ev.push({at: t - s0, kind: 'tap', gain: 0.08}); });
    return ev;
  };
  return S;
};

/* ---------- cover poster (封面.md §〇·五): the chart, the falling series, the undecided brake line ---------- */
const POSTER: Record<CoverRatio, {cam: Cam; head: number; sup: number; dy: number}> = {
  '3:4': {cam: {x: 570, y: 692, z: 0.9}, head: 120, sup: 380, dy: 0},
  '6:7': {cam: {x: 570, y: 640, z: 0.74}, head: 100, sup: 384, dy: 0},
  '9:16': {cam: {x: 570, y: 790, z: 1.0}, head: 250, sup: 520, dy: 0},
};
export const OlPoster: React.FC<{ratio: CoverRatio; w: number; h: number}> = ({ratio, h: hh}) => {
  const L = POSTER[ratio];
  return <div style={{position: 'absolute', inset: 0, width: 1080, height: hh, overflow: 'hidden', background: BG}}>
    <div style={{position: 'absolute', left: 0, top: L.dy + (hh - 1920) / 2, width: 1080, height: 1920}}><Sheet F={h.lC + 20} camera={L.cam} noPen /></div>
    <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: L.sup + 120, background: `linear-gradient(180deg, ${BG} 72%, ${BG}00)`}} />
    {ratio === '6:7' && <div style={{position: 'absolute', right: 0, top: 0, bottom: 0, width: 110, background: `linear-gradient(90deg, ${BG}00, ${BG} 55%)`}} />}
    <div style={{position: 'absolute', left: 64, top: L.head, fontFamily: font, fontWeight: 900, fontSize: 124, lineHeight: 1.08, color: C.ink}}>
      <div>AI 该不该</div><div>踩<span style={{color: C.amber}}>刹车</span>？</div>
    </div>
    <div style={{position: 'absolute', left: 68, top: L.sup, display: 'flex', alignItems: 'center', gap: 16}}>
      <span style={{width: 54, height: 8, background: C.mint, borderRadius: 4}} />
      <span style={{fontFamily: hand, fontSize: 56, color: C.mint}}>谁来定这条线？</span>
    </div>
    <div style={{position: 'absolute', right: 64, top: L.head + 10, fontFamily: plex, fontSize: 24, color: C.dim, textAlign: 'right', lineHeight: 1.5}}>AI 新闻 · 安全<br />对数困惑度</div>
  </div>;
};
export const OL_POSTERS: Record<string, React.FC<{ratio: CoverRatio; w: number; h: number}>> = {'ol.poster': OlPoster};

export const OL_SCENES: Record<string, Scene> = {
  'ol.hook': sceneOf('hook', 'metric'), 'ol.metric': sceneOf('metric', 'data'), 'ol.data': sceneOf('data', 'line'), 'ol.line': sceneOf('line', 'twist'),
  'ol.twist': sceneOf('twist', 'ms'), 'ol.ms': sceneOf('ms', 'debate'), 'ol.debate': sceneOf('debate', 'end'), 'ol.end': sceneOf('end'),
};
void cond;
