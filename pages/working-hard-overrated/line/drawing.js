// working-hard-overrated: the whole film is one ink line (lemo/one-line). Eleven vignettes stacked down the paper, one per
// sentence; the pen travels down between them (the connectors are the thread). Paper units; vignette i is centred at (0, 700·i).
// Times (seconds) come from tutorials/working-hard-overrated.timeline.json (scene starts + word cues), copied in by hand.
// Voices: plain (neutral), push (heavy, trembling, drying), flow (thin, fast), agent (the single accent stretch).

const Y = i => i * 1150;
const f1 = v => +v.toFixed(1);
/** Catmull-Rom through points → SVG path (first point is the move-to). */
function smooth(pts) {
  let d = `M ${pts[0][0]},${pts[0][1]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(pts.length - 1, i + 2)];
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6], c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C ${f1(c1[0])},${f1(c1[1])} ${f1(c2[0])},${f1(c2[1])} ${f1(p2[0])},${f1(p2[1])}`;
  }
  return d;
}
/** A full circle starting and ending at angle a0 (radians), as two arcs. */
const circle = (cx, cy, r, a0 = Math.PI, cw = 1) => {
  const p = a => [f1(cx + r * Math.cos(a)), f1(cy + r * Math.sin(a))];
  const [x0, y0] = p(a0), [x1, y1] = p(a0 + Math.PI);
  return `M ${x0},${y0} A ${r},${r} 0 1,${cw} ${x1},${y1} A ${r},${r} 0 1,${cw} ${x0},${y0}`;
};
/** Cursive loops along y = y0 from x0 to x1 (a trochoid): the effortless line. */
function loops(x0, x1, y0, n, r) {
  const pts = [];
  for (let i = 0; i <= n * 24; i++) {
    const u = i / (n * 24), th = u * n * Math.PI * 2;
    pts.push([x0 + (x1 - x0) * u - r * 0.9 * Math.sin(th), y0 - r * (1 - Math.cos(th)) * 0.9 + r * 0.9]);
  }
  return smooth(pts.map(([x, y]) => [f1(x), f1(y)]));
}
/** Rounded rectangle, clockwise from the top-left corner's right end. */
const rrect = (x0, y0, x1, y1, r = 14) => `M ${x0 + r},${y0} L ${x1 - r},${y0} Q ${x1},${y0} ${x1},${y0 + r} L ${x1},${y1 - r} Q ${x1},${y1} ${x1 - r},${y1} L ${x0 + r},${y1} Q ${x0},${y1} ${x0},${y1 - r} L ${x0},${y0 + r} Q ${x0},${y0} ${x0 + r},${y0}`;

/* ---------- 0 hook: a 0–10 scale, one point up, the output curve jumps ---------- */
const RULER = (() => {
  let d = 'M -240,240';
  for (let i = 1; i <= 10; i++) { const y = 240 - i * 46; d += ` L -240,${y} L -214,${y} L -240,${y}`; }
  d += ' L -240,-36 L -240,-82';           // retrace down to 6, then climb one point to 7
  return d;
})();
const CHART = 'M -240,-82 C -150,-80 -60,-88 20,-110 C 90,-130 150,-190 236,-262 L 206,-258 L 236,-262 L 228,-232';

/* ---------- 1 title: pushing a boulder uphill (push) ---------- */
const sy = x => f1(250 - 0.55 * (x + 280));   // the slope
const BOULDER = `M -310,${sy(-310)} L -290,${sy(-290)} L -215,60 L -180,130 L -200,${sy(-200)} L 60,${sy(60)} L 300,${sy(300)} L 60,${sy(60)} L -200,${sy(-200)} L -180,130 L -215,60 L -140,-30 L -130.4,-39.4 `
  + circle(-116, -56, 22, 131 * Math.PI / 180, 1).replace(/^M [^A]+/, '') + ' L -140,-30 L -86,-6 '
  + `A 100,100 0 1,1 109.2,-47.1 A 100,100 0 1,1 -85.6,-2.1`;

/* ---------- 2 forward: a terminal window — the agent ---------- */
const WINDOW = 'M -210,128 L -210,-138 Q -210,-160 -188,-160 L 188,-160 Q 210,-160 210,-138 L 210,128 Q 210,150 188,150 L -188,150 Q -210,150 -210,128 L -210,-100 L 210,-100';
const PROMPT = 'M -160,-30 L -118,0 L -160,30 L -118,0 L -96,40 L -40,40';

/* ---------- 3 effortless: loops ---------- */
const LOOPS = loops(-290, 290, -20, 7, 46);

/* ---------- 4 tennis: racket, a rally arc, the ball, a bounce ---------- */
const RACKET = (() => {
  // oval head (rotated −30°) centred (-70,-40), handle down-left
  const cx = -70, cy = -40, rx = 92, ry = 124, rot = -30 * Math.PI / 180, pts = [];
  for (let i = 0; i <= 64; i++) { const a = Math.PI / 2 + i / 64 * Math.PI * 2; const x = rx * Math.cos(a), y = ry * Math.sin(a); pts.push([f1(cx + x * Math.cos(rot) - y * Math.sin(rot)), f1(cy + x * Math.sin(rot) + y * Math.cos(rot))]); }
  const throat = pts[0];
  return `M -230,240 L ${throat[0]},${throat[1]} ` + smooth(pts).replace(/^M [^C]+/, '');
})();
const RALLY = 'M -10,-150 C 40,-260 140,-270 196,-176';
const BALL = circle(196, -150, 28, -Math.PI / 2, 1) + ' C 230,-90 250,40 262,170 C 272,120 286,90 300,70';

/* ---------- 5 music: a clock, the hand moves to ten minutes, the hand becomes a note ---------- */
const CLOCK = circle(-40, -40, 160, -Math.PI / 2) + ' L -40,-40 L 64,-100';
const TEN = 'M -40,-170 A 130,130 0 0,1 72.6,-105';   // the 10-minute arc
const NOTE = (() => {
  const hx = 200, hy = 190;
  return `M ${hx + 26},${hy - 6} C ${hx + 30},${hy + 14} ${hx - 6},${hy + 26} ${hx - 26},${hy + 16} C ${hx - 44},${hy + 6} ${hx - 30},${hy - 20} ${hx - 6},${hy - 24} C ${hx + 14},${hy - 26} ${hx + 26},${hy - 18} ${hx + 26},${hy - 6} L ${hx + 26},${hy - 210} C ${hx + 50},${hy - 170} ${hx + 90},${hy - 150} ${hx + 70},${hy - 90}`;
})();

/* ---------- 6 discipline: push (a box shoved by an arrow) vs pull (a kite) ---------- */
const PUSHBOX = 'M -300,110 L -200,110 L -214,96 L -200,110 L -214,124 L -200,110 L -190,110 L -190,40 L -70,40 L -70,170 L -190,170 L -190,110';
const KITE = 'M 40,260 C 80,150 140,40 200,-60 L 200,-60 L 150,-150 L 210,-250 L 270,-150 L 200,-60 L 210,-250 L 150,-150 L 270,-150 L 200,-60 C 190,-20 230,0 220,30 C 210,60 250,80 240,110';

/* ---------- 7 ratio: a bar of ten cells; one hatched (push), nine with a loop (flow) ---------- */
const BAR = (() => {
  let d = 'M 300,-40', top = true;   // a square wave right → left draws the dividers, then the frame, ending top-left
  for (let i = 0; i < 10; i++) { const x = 300 - i * 60; d += ` L ${x},${top ? 40 : -40}`; top = !top; d += ` L ${x - 60},${top ? -40 : 40}`; }
  return d + ' L -300,40 L 300,40 L 300,-40 L -300,-40';
})();
const HATCH = (() => {
  let d = 'M -300,-40';
  for (let i = 0; i < 6; i++) { const x = -300 + i * 10; d += ` L ${x + 10},40 L ${x + 20},-40`; }
  return d;
})();
const LOOPS9 = loops(-230, 290, -14, 9, 18);

/* ---------- 8 sessions: six windows, a hunched figure at a desk (push) ---------- */
const WINS = [[-190, -230], [0, -230], [190, -230], [-190, -90], [0, -90], [190, -90]];
const winPath = ([cx, cy]) => rrect(cx - 78, cy - 52, cx + 78, cy + 52, 10) + ` L ${cx - 78},${cy - 30} L ${cx + 78},${cy - 30}`;
const FIGURE = 'M -220,250 L 220,250 L 60,250 L 60,180 L 80,180 L 80,250 L 40,250 '         // desk + a laptop edge
  + 'L -40,250 C -40,200 -36,150 -10,118 C 10,96 34,100 46,120 ' + circle(14, 112, 22, 0).replace(/^M [^A]+/, 'L 36,112 ') + ' L 36,112 C 40,150 52,170 64,182';

/* ---------- 9 handoff: the agent ticks every window (accent), then the person's line flies a kite ---------- */
const TICKS = [0, 1, 2, 5, 4, 3].map(i => { const [cx, cy] = WINS[i]; return `M ${cx - 34},${cy + 4} L ${cx - 10},${cy + 28} L ${cx + 36},${cy - 22}`; });
const KITE2 = 'M 240,-60 C 230,-160 260,-260 230,-330 C 210,-380 180,-430 150,-460 L 110,-520 L 150,-600 L 190,-520 L 150,-460 L 150,-600 L 110,-520 L 190,-520 L 150,-460 C 140,-420 170,-400 160,-370';

/* ---------- 10 todo: three boxes, ticked; the line runs off the paper ---------- */
const BOXES = [-170, -30, 110].map(y => rrect(-310, y - 46, -218, y + 46, 12));
const TODO_TICKS = [110, -30, -170].map(y => `M -296,${y - 4} L -270,${y + 24} L -224,${y - 40}`);
const RUNOFF = 'M -224,-210 C -100,-120 60,120 220,180 C 420,250 600,230 800,300 C 900,330 1000,330 1100,360';

// segment table. t = [t0, t1] seconds; marks = sync points; holds = pen stops.
const T = (i) => ({ x: 0, y: Y(i) });
export const SEGS = [
  { id: 'ruler', style: 'plain', t: [0.10, 0.95], parts: [{ d: RULER, tf: T(0) }], slowK: 0.6 },
  { id: 'chart', style: 'plain', t: [0.95, 2.55], parts: [{ d: CHART, tf: T(0) }], slowK: 1.4, marks: [{ f: 0.62, t: 1.6 }] },
  { id: 'boulder', style: 'push', t: [3.95, 8.1], parts: [{ d: BOULDER, tf: T(1) }], slowK: 2.6, },
  { id: 'window', style: 'plain', t: [8.6, 11.9], parts: [{ d: PROMPT, tf: T(2) }, { d: WINDOW, tf: T(2) }], slowK: 1.6, marks: [{ f: 0.25, t: 10.3 }] },
  { id: 'loops', style: 'flow', t: [12.8, 16.6], parts: [{ d: LOOPS, tf: T(3) }], slowK: 0.4 },
  { id: 'racket', style: 'plain', t: [17.15, 19.4], parts: [{ d: RACKET, tf: T(4) }], slowK: 1.4 },
  { id: 'rally', style: 'flow', t: [19.4, 22.6], parts: [{ d: RALLY, tf: T(4) }, { d: BALL, tf: T(4) }], slowK: 1.2 },
  { id: 'clock', style: 'plain', t: [23.95, 26.2], parts: [{ d: CLOCK, tf: T(5) }], slowK: 1.4 },
  { id: 'ten', style: 'plain', t: [26.2, 27.3], parts: [{ d: TEN, tf: T(5) }], slowK: 0.6 },
  { id: 'note', style: 'flow', t: [27.3, 28.8], parts: [{ d: NOTE, tf: T(5) }], slowK: 1.0 },
  { id: 'push', style: 'push', t: [29.1, 32.4], parts: [{ d: PUSHBOX, tf: T(6) }], slowK: 2.8 },
  { id: 'pull', style: 'flow', t: [32.6, 35.0], parts: [{ d: KITE, tf: T(6) }], slowK: 0.9 },
  { id: 'bar', style: 'plain', t: [35.45, 36.85], parts: [{ d: BAR, tf: T(7) }], slowK: 0.5 },
  { id: 'hatch', style: 'push', t: [36.9, 38.4], parts: [{ d: HATCH, tf: T(7) }], slowK: 1.8 },
  { id: 'loops9', style: 'flow', t: [38.55, 40.9], parts: [{ d: LOOPS9, tf: T(7) }], slowK: 0.4 },
  { id: 'wins', style: 'plain', t: [41.2, 43.6], parts: WINS.map(w => ({ d: winPath(w), tf: T(8) })), slowK: 0.6 },
  { id: 'figure', style: 'push', t: [43.7, 45.6], parts: [{ d: FIGURE, tf: T(8) }], slowK: 2.0 },
  { id: 'ticks', style: 'agent', t: [45.95, 47.5], parts: TICKS.map(d => ({ d, tf: T(8) })), slowK: 0.5 },
  { id: 'kite2', style: 'flow', t: [47.6, 50.1], parts: [{ d: KITE2, tf: T(9) }], slowK: 0.9 },
  { id: 'boxes', style: 'plain', t: [50.4, 52.6], parts: BOXES.map(d => ({ d, tf: T(10) })), slowK: 0.8 },
  { id: 'todo', style: 'plain', t: [53.6, 54.9], parts: TODO_TICKS.map(d => ({ d, tf: T(10) })), slowK: 0.8 },
  { id: 'runoff', style: 'flow', t: [54.9, 56.0], parts: [{ d: RUNOFF, tf: T(10) }], slowK: 0.2 },
];

// camera: composed on each vignette (low follow), following the nib while it travels between them
const comp = (i, t0, t1, z = 1.06, dy = 0) => [{ t: t0, x: 0, y: Y(i) + dy, z: z * 0.94, r: i % 2 ? 3 : -3, f: 0 }, { t: t1, x: 0, y: Y(i) + dy, z: z * 1.28, r: i % 2 ? -2.5 : 2.5, f: 0 }];
export const CAM = [
  ...comp(0, 0, 3.0, 1.08, -20),
  { t: 3.5, x: 0, y: Y(0.6), z: 0.9, r: 0, f: 0.8 },
  ...comp(1, 3.95, 8.2, 1.06, -10),
  ...comp(2, 8.6, 12.0, 1.12),
  ...comp(3, 12.8, 16.7, 1.06),
  ...comp(4, 17.1, 22.8, 1.04),
  ...comp(5, 23.9, 28.9, 1.04, 30),
  ...comp(6, 29.0, 35.1, 1.02),
  ...comp(7, 35.4, 41.0, 1.08),
  ...comp(8, 41.1, 47.5, 1.04, -20),
  { t: 48.6, x: 60, y: Y(8.6), z: 0.82, r: 0, f: 0.4 },
  ...comp(9, 49.0, 50.2, 1.0, -380),
  ...comp(10, 50.3, 55.0, 1.06, -40),
  { t: 56.0, x: 120, y: Y(10) + 40, z: 0.95, r: 0, f: 0.3 },
];
export const DUR = 56.05;
// when another hand (the agent) holds the pen: a second hand shadow from the upper left
export const AGENT = { t0: 45.6, t1: 47.6 };
