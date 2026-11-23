import React from 'react';
import {Scene} from '../paper';
import type {CoverRatio} from '../types';
import {font} from '../theme';
import {hand, plex, serif} from '../fonts';
import {clamp, ease} from '../../fx';
import {BoardFrame, CK, Cam, EraserView, Ink, MagCard, Magnet, P, PenView, Wash, arrowPts, camAt, createBoard, loop, rectPts, rnd, tickPts, timeline} from '../wb-kit';
import TL from '../../../tutorials/p-vs-np-agent-fleet.timeline.json';

// p-vs-np-agent-fleet: an AI agent fleet attacks P vs NP in public (pequalnp.com, on Hacker News 2026-11-23); many agents,
// one judge — the Lean checker. Inputs: inputs/p-vs-np-agent-fleet/ (idea.md, script.md, materials). Storyboard:
// tutorials/p-vs-np-agent-fleet.storyboard.md.
// Template lemo/whiteboard (STYLE.md: one glossy board, everything written in stroke order, no hands — floating markers,
// magnets, an eraser that rewinds, a camera that travels instead of cutting, three markers with one meaning each), engine in
// src/tutorial/wb-kit.tsx. Variation §11 "a proof": the board fills step by step and each step is boxed when it is checked.
// Customised: the three markers are the project site's own inks (slate #2A2F38 = things, its green #2F6B4F = checked, its
// amber #F2B84B — darkened to #C98A1B for a line on white — = open / still searching); the hero magnet is the lemma card
// that gets the green ✓; the eraser rewinds a wrong route (the search, not the check); the site's own line "Many agents,
// one judge." pinned as a printed card (retyped, not a screenshot); ending pushes into the checker box.
// Facts: P vs NP open, Clay Millennium Prize ($1M); thinkers argue on paper, red-team seats hunt counterexamples, builders
// write a surviving step in Lean; the checker accepts a file only if it proves exactly the recorded statement (with no gap
// and no extra axiom); the live board showed lemma L-meta-002 accepted on 2026-11-23 (project's page, not re-run by us).

const {at} = timeline(TL);
const C = {ink: '#2A2F38', green: '#2F6B4F', amber: '#C98A1B'};
const WASH_A = '#FBE3A8', WASH_G = '#D7EBDD', DIM = '#8B8F98';
const kit = createBoard(C);
const {stroke, write, strokes} = kit;
const BW = 2400, BH = 4700;

const h = {
  hook: at('hook'), hA: at('hook', 'a'), hB: at('hook', 'b'),
  ask: at('ask'), qA: at('ask', 'a'), qB: at('ask', 'b'),
  route: at('route'), rA: at('route', 'a'), rB: at('route', 'b'), rC: at('route', 'c'),
  judge: at('judge'), jA: at('judge', 'a'), jB: at('judge', 'b'), jC: at('judge', 'c'),
  check: at('check'), cA: at('check', 'a'), cB: at('check', 'b'),
  open: at('open'), oA: at('open', 'a'), oB: at('open', 'b'),
  end: at('end'), eA: at('end', 'a'), eB: at('end', 'b'),
};

/* ---------- A: the claim (x 60–1020, y 200–1300) ---------- */
write('ink', 'P = NP ?', 110, 470, 180, -70, -40, {face: 'serif'});
strokes('amber', rectPts(600, 545, 300, 96), 6, -36, -24);
write('amber', '未解决', 628, 625, 64, -24, -14);
write('ink', '悬赏 $1,000,000 · 千禧年七大难题之一', 116, 770, 40, -20, -4);
// a fleet: magnets drop in a loose crowd
const FLEET: P[] = Array.from({length: 14}, (_, i) => [150 + (i % 7) * 125 + (rnd(i) - 0.5) * 40, 900 + Math.floor(i / 7) * 95 + (rnd(i + 9) - 0.5) * 30]);
write('ink', '一群 AI · 公开攻', 116, 1110, 46, h.hA + 20, h.hA + 36);
// the lemma card (hero magnet) and its tick
const LEM: P = [450, 1215];
stroke('green', tickPts(770, 1215, 74), 9, h.hB + 8, h.hB + 16);
write('green', '通过', 870, 1248, 72, h.hB + 14, h.hB + 26);
strokes('green', rectPts(150, 1140, 860, 150), 5, h.hB + 22, h.hB + 34);

/* ---------- B: the question (x 1300–2300, y 900–1700) ---------- */
write('ink', '答案好验', 1360, 1080, 130, h.ask + 2, h.qA - 2, {face: 'serif'});
strokes('ink', arrowPts([1600, 1120], [1600, 1300], 30), 7, h.qA - 4, h.qA + 4);
write('amber', '也一定好找？', 1360, 1450, 130, h.qA + 2, h.qB + 6, {face: 'serif'});
stroke('amber', loop(1830, 1390, 330, 105, 11), 7, h.qB + 6, h.qB + 20);
write('ink', 'NP：给了答案，能很快验', 1370, 1640, 50, h.qA + 6, h.qA + 22);
write('ink', 'P：能很快自己找到', 1370, 1720, 50, h.qB + 4, h.qB + 18);
write('ink', '（通俗说法，“很快”= 多项式时间）', 1370, 1790, 34, h.qB + 16, h.qB + 30);

/* ---------- C: find vs check a route (x 60–1020, y 1900–3100) ---------- */
const S: P[] = [[170, 2120], [440, 2070], [720, 2080], [910, 2350], [580, 2450], [300, 2530], [660, 2790]];
const J: P[] = [[240, 2340], [430, 2290], [700, 2280], [400, 2800], [880, 2620]];
const EDGES: [P, P][] = [[S[0], S[1]], [S[1], S[2]], [S[2], S[3]], [S[3], S[4]], [S[4], S[5]], [S[5], S[6]], [S[0], J[0]], [J[0], S[5]], [J[0], J[1]], [J[1], S[1]], [J[1], S[4]],
  [J[1], J[2]], [J[2], S[2]], [J[2], S[4]], [J[2], S[3]], [S[5], J[3]], [J[3], S[6]], [S[6], J[4]], [J[4], S[3]], [S[4], S[6]]];
EDGES.forEach(([a, b], i) => { const t = h.route + 2 + i * 0.9; stroke('ink', [a, b], 4, t, t + 6); });
write('ink', '起点', 120, 2040, 40, h.route + 6, h.route + 14);
write('green', '验：顺着一站站查', 90, 1980, 56, h.rA - 6, h.rA + 10);
const GIVEN = stroke('green', S, 9, h.rA + 4, h.rA + 54, {ghostAfter: h.rB - 4});
S.forEach((p, i) => { const t = h.rA + 4 + (50 * i) / 6; stroke('green', tickPts(p[0] + 18, p[1] - 30, 34), 6, t + 2, t + 6, {ghostAfter: h.rB - 4}); });
write('amber', '找：只能一条条试', 90, 2990, 56, h.rB - 4, h.rB + 12);
const TRY1 = stroke('amber', [S[0], J[0], S[5], J[3]], 8, h.rB + 6, h.rB + 30, {erase: [h.rB + 34, h.rB + 46]});
stroke('amber', [S[0], J[0], J[1], S[4], S[3]], 7, h.rC, h.rC + 22, {ghostAfter: h.rC + 30});
stroke('amber', [S[0], S[1], J[1], J[2], S[2], S[3], S[4]], 7, h.rC + 26, h.rC + 48);
const DOTS = [...S, ...J];

/* ---------- D: who judges (x 1300–2300, y 2500–3600) ---------- */
write('ink', '谁来判？', 1360, 2680, 130, h.judge + 1, h.judge + 18, {face: 'serif'});
write('ink', '想思路', 1380, 2880, 56, h.jA - 4, h.jA + 8);
write('ink', '找反例', 1880, 2880, 56, h.jB - 4, h.jB + 8);
const THINK: P[] = [0, 1, 2, 3].map((i) => [1400 + i * 70, 2950]);
const RED: P[] = [0, 1, 2, 3].map((i) => [1900 + i * 70, 2950]);
strokes('amber', [[[1960, 3040], [2140, 3150]], [[2140, 3040], [1960, 3150]]], 8, h.jB + 22, h.jB + 32);
strokes('green', rectPts(1480, 3260, 660, 230), 6, h.jC - 4, h.jC + 8);
write('green', '写成 Lean 证明', 1560, 3462, 62, h.jC + 2, h.jC + 16);
strokes('ink', arrowPts([1810, 3170], [1810, 3270], 22), 5, h.jC - 8, h.jC - 2);

/* ---------- E: the checker (x 60–1020, y 3700–4600) ---------- */
strokes('green', rectPts(110, 3760, 860, 230), 9, h.check + 1, h.check + 14);
write('green', 'Lean 检查器', 170, 3910, 96, h.check + 6, h.check + 22, {face: 'serif'});
write('ink', '唯一的裁判', 700, 3960, 42, h.check + 22, h.check + 32);
write('ink', '只认一件事', 120, 4250, 64, h.cA - 4, h.cA + 10);
write('ink', '=', 512, 4430, 120, h.cB + 12, h.cB + 18);
stroke('green', tickPts(830, 4560, 60), 9, h.cB + 30, h.cB + 38);
write('green', '通过', 900, 4590, 60, h.cB + 34, h.cB + 44);

/* ---------- F: back to the claim: one small step vs the open problem ---------- */
write('green', '只是一小步', 600, 1120, 52, h.oA + 2, h.oA + 16);
stroke('amber', loop(560, 400, 500, 150, 31), 8, h.oB + 2, h.oB + 18);
stroke('amber', loop(565, 405, 520, 165, 37), 6, h.oB + 14, h.oB + 28);

/* ---------- G: the push into the checker ---------- */
stroke('green', tickPts(830, 3700, 120), 12, h.eB + 8, h.eB + 20);

/* ---------- camera ---------- */
const CAM: CK[] = [
  [-30, 520, 660, 1.15], [h.hA - 4, 520, 700, 1.12], [h.hA + 18, 560, 880, 1.0], [h.hB + 24, 560, 920, 1.02],
  [h.ask - 10, 560, 920, 1.02], [h.ask - 1, 1820, 1380, 1.0], [h.qB + 20, 1820, 1420, 1.03],
  [h.route - 10, 1820, 1420, 1.03], [h.route - 1, 560, 2660, 1.0], [h.rB, 560, 2640, 1.02], [h.rC + 40, 560, 2660, 1.0],
  [h.judge - 6, 560, 2660, 1.0], [h.judge + 3, 1800, 3200, 1.0], [h.jC - 10, 1800, 3330, 1.0], [h.jC + 20, 1800, 3400, 1.03],
  [h.check - 8, 1800, 3400, 1.03], [h.check + 2, 560, 4320, 1.0], [h.cB + 40, 560, 4380, 1.02],
  [h.open - 4, 560, 4420, 1.09], [h.open + 16, 1200, 2500, 0.34], [h.oA + 2, 520, 1210, 1.25], [h.oB, 540, 900, 0.92], [h.end - 4, 540, 860, 0.95],
  [h.eA + 6, 1200, 2500, 0.34], [h.eB + 2, 540, 3880, 1.1], [h.end + 200, 560, 3820, 1.28],
];
const camOf = (F: number): Cam => camAt(F, CAM);

/* ---------- the board ---------- */
const Board: React.FC<{F: number; camera?: Cam}> = ({F, camera}) => {
  const cam = camera ?? camOf(F);
  return <BoardFrame cam={cam} w={BW} h={BH}>
    <Wash x={80} y={270} w={860} h={240} color={WASH_A} F={F} t0={-80} t1={-70} />
    <Wash x={110} y={4350} w={880} h={150} color={WASH_G} F={F} t0={h.cB + 30} t1={h.cB + 42} />
    <Wash x={1330} y={1300} w={960} h={190} color={WASH_A} F={F} t0={h.qB + 2} t1={h.qB + 12} />
    {/* station dots, under the ink */}
    <svg width={BW} height={BH} style={{position: 'absolute', left: 0, top: 0}}>
      {DOTS.map((p, i) => F >= h.route + 4 + i ? <circle key={i} cx={p[0]} cy={p[1]} r={i < 7 ? 22 : 11} fill="#FFFEFA" stroke={C.ink} strokeWidth={4} /> : null)}
    </svg>
    <Ink kit={kit} F={F} w={BW} h={BH} />
    {/* magnets: the fleet, the thinkers, the red team */}
    {FLEET.map(([x, y], i) => { const t = h.hA + i * 1.5; if (F < t) return null; const d = ease.outBack(clamp((F - t) / 6), 2); return <div key={i} style={{position: 'absolute', left: 0, top: 0, transform: `translate(${x}px, ${y - (1 - d) * 40}px)`, opacity: clamp((F - t) / 2)}}><Magnet x={0} y={0} color={i % 3 === 2 ? C.amber : C.ink} r={26} /></div>; })}
    {THINK.map(([x, y], i) => F >= h.jA + i * 2 ? <Magnet key={i} x={x} y={y} color={C.ink} r={24} /> : null)}
    {RED.map(([x, y], i) => F >= h.jB + i * 2 ? <Magnet key={i} x={x} y={y} color={C.amber} r={24} /> : null)}
    <MagCard F={F} at={h.jA + 14} x={1560} y={3100} w={260} h={96} mag={C.ink} slide={[{t: h.jC + 2, to: [1810, 3330], d: 14}]}><span style={{fontFamily: hand, fontSize: 40, color: C.ink}}>这一步</span></MagCard>
    <MagCard F={F} at={h.jB + 12} x={2050} y={3100} w={260} h={96} mag={C.amber}><span style={{fontFamily: hand, fontSize: 40, color: C.ink}}>那一步</span></MagCard>
    {/* a pile of AI-written proofs beside "谁来判？" */}
    <div style={{opacity: 1 - clamp((F - h.jA + 6) / 8)}}>{[0, 1, 2].map((i) => <MagCard key={i} F={F} at={h.judge + 4 + i * 4} x={2010 + i * 34} y={2790 + i * 22} w={230} h={130} mag={DIM} rot={-6 + i * 5}>
      <span style={{fontFamily: hand, fontSize: 36, color: C.ink}}>AI 写的证明</span></MagCard>)}</div>
    {/* the hero: the lemma card */}
    <MagCard F={F} at={h.hB} x={LEM[0]} y={LEM[1]} w={560} h={130} mag={C.green}>
      <span style={{fontFamily: serif, fontWeight: 700, fontSize: 44, color: C.ink}}>一个小命题</span>
      <span style={{fontFamily: plex, fontSize: 22, color: DIM, marginTop: 4}}>L-meta-002 · 据项目看板 11-23</span>
    </MagCard>
    {/* the site's own line, pinned */}
    <MagCard F={F} at={h.check + 18} x={560} y={4100} w={620} h={110} mag={DIM} rot={-1.5}>
      <span style={{fontFamily: serif, fontWeight: 700, fontSize: 44, color: C.ink}}>“Many agents, one judge.”</span>
      <span style={{fontFamily: plex, fontSize: 20, color: DIM, marginTop: 2}}>pequalnp.com · 项目方法页原文</span>
    </MagCard>
    <MagCard F={F} at={h.cB} x={290} y={4420} w={330} h={110} mag={C.ink}><span style={{fontFamily: hand, fontSize: 42, color: C.ink}}>登记的那句</span></MagCard>
    <MagCard F={F} at={h.cB + 6} x={760} y={4420} w={330} h={110} mag={C.ink}><span style={{fontFamily: hand, fontSize: 42, color: C.ink}}>证明证的</span></MagCard>
    <EraserView s={TRY1} F={F} />
    {(['ink', 'green', 'amber'] as const).map((p, i) => <PenView key={p} kit={kit} pen={p} slot={i} F={F} cam={cam} />)}
    {void GIVEN}
  </BoardFrame>;
};

/* ---------- scenes ---------- */
const boardScene = (id: keyof typeof SC_IDS): Scene => {
  const S: Scene = () => null;
  const s0 = at(id), s1 = id === 'end' ? 1e9 : at(SC_IDS[id] as string);
  S.backdrop = ({f}) => <Board F={s0 + f} />;
  S.sfx = () => {
    const ev: {at: number; kind: string; gain: number}[] = [];
    kit.items.forEach((it) => { if (it.t0 >= s0 && it.t0 < s1 && it.t1 - it.t0 >= 8) ev.push({at: it.t0 - s0, kind: 'fs-paper-slide', gain: 0.03}); });
    const mags = [h.hA, h.hB, h.judge + 4, h.judge + 8, h.judge + 12, h.jA + 14, h.jB + 12, h.check + 18, h.cB, h.cB + 6];
    mags.forEach((t) => { if (t >= s0 && t < s1) ev.push({at: t - s0 + 5, kind: 'tap', gain: 0.09}); });
    [h.hB + 8, h.cB + 30, h.eB + 8].forEach((t) => { if (t >= s0 && t < s1) ev.push({at: t - s0, kind: 'marker', gain: 0.08}); });
    if (h.rB + 34 >= s0 && h.rB + 34 < s1) ev.push({at: h.rB + 34 - s0, kind: 'fs-whoosh-wipe', gain: 0.09});
    return ev;
  };
  return S;
};
const SC_IDS = {hook: 'ask', ask: 'route', route: 'judge', judge: 'check', check: 'open', open: 'end', end: ''};

/* ---------- cover poster (封面.md §〇·五): the board's own world — the claim circled, the small step ticked ---------- */
const POSTER: Record<CoverRatio, {cam: Cam; head: [number, number, number]; sup: number}> = {
  '3:4': {cam: {x: 560, y: 759, z: 0.95}, head: [70, 96, 108], sup: 330},
  '6:7': {cam: {x: 560, y: 803, z: 0.78}, head: [70, 84, 96], sup: 290},
  '9:16': {cam: {x: 560, y: 544, z: 1.1}, head: [70, 230, 118], sup: 500},
};
export const PnpPoster: React.FC<{ratio: CoverRatio; w: number; h: number}> = ({ratio, h: hh}) => {
  const L = POSTER[ratio];
  const F = h.end - 2;
  // the board is drawn for a 1920-high frame centred at y 960; shift it so the claim sits under the headline
  const dy = (hh - 1920) / 2 + (ratio === '9:16' ? 0 : 200);
  return <div style={{position: 'absolute', inset: 0, width: 1080, height: hh, overflow: 'hidden', background: '#F4F2EC'}}>
    <div style={{position: 'absolute', left: 0, top: dy, width: 1080, height: 1920}}><Board F={F} camera={L.cam} /></div>
    <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: L.sup + 110, background: 'linear-gradient(180deg, rgba(250,249,245,0.97) 70%, rgba(250,249,245,0))'}} />
    <div style={{position: 'absolute', left: L.head[0], top: L.head[1], fontFamily: font, fontWeight: 900, fontSize: L.head[2], lineHeight: 1.08, color: C.ink, letterSpacing: 2}}>
      <div>一群AI组队</div><div>挑战 <span style={{color: C.green}}>P vs NP</span></div>
    </div>
    <div style={{position: 'absolute', left: L.head[0] + 4, top: L.sup, display: 'flex', alignItems: 'center', gap: 16}}>
      <span style={{width: 50, height: 8, background: '#F2B84B', borderRadius: 4}} />
      <span style={{fontFamily: hand, fontSize: 52, color: C.ink}}>小命题过了，主问题呢？</span>
    </div>
    <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: Math.max(0, hh - (ratio === '9:16' ? 1660 : ratio === '3:4' ? 1360 : 1180)), background: 'linear-gradient(180deg, rgba(244,242,236,0), #F4F2EC 60%)'}} />
    <div style={{position: 'absolute', right: 70, top: L.head[1] + 8, fontFamily: plex, fontSize: 24, color: DIM, textAlign: 'right', lineHeight: 1.5}}>AI 新闻 · 研究<br />pequalnp.com</div>
  </div>;
};
export const PNP_POSTERS: Record<string, React.FC<{ratio: CoverRatio; w: number; h: number}>> = {'pn.poster': PnpPoster};

export const PNP_SCENES: Record<string, Scene> = {
  'pn.hook': boardScene('hook'), 'pn.ask': boardScene('ask'), 'pn.route': boardScene('route'), 'pn.judge': boardScene('judge'),
  'pn.check': boardScene('check'), 'pn.open': boardScene('open'), 'pn.end': boardScene('end'),
};
