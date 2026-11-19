// working-hard-overrated · the one-line film (lemo/one-line engine, MIT, adapted: see LICENSE-lemo-opuscar.txt).
// window.render(t) draws the paper, the line up to the pen at time t, and the pen's shadow; no subtitles (Remotion adds them).
import { buildPath, headAt, posAt } from './geom.js';
import { SEGS, CAM, DUR, AGENT } from './drawing.js';
import { prepare, drawLine, drawBlots } from './ink.js';
import { makePaper, drawPaper, vignette, makeTooth, drawTooth } from './paper.js';
import { camAt, worldToScreen, BASE } from './cam.js';
import { penShadow, handShadow } from './hands.js';
import { clamp, lerp, ss } from './lib.js';

const q = new URLSearchParams(location.search);
const cv = document.getElementById('c'), ctx = cv.getContext('2d');
const W = cv.width, H = cv.height;
const P = prepare(buildPath(SEGS));
const paper = makePaper(), tooth = makeTooth();
window.PATH = P;

function camFor(t) {
  if (q.get('cam')) { const [x, y, z] = q.get('cam').split(',').map(Number); return { cx: x, cy: y, k: BASE * z, r: 0, z }; }
  return camAt(P, CAM, t, W, H);
}
// pen direction: the person's hand at lower right; the agent's hand comes from the upper left while it holds the pen
function penDir(t) {
  const u = ss((t - AGENT.t0) / 0.5) * (1 - ss((t - AGENT.t1) / 0.5));
  const a0 = Math.atan2(0.83, 0.56), a1 = Math.atan2(-0.8, -0.6);
  const a = lerp(a0, a1, u);
  return [Math.cos(a), Math.sin(a)];
}
function render(t) {
  const cam = camFor(t);
  const M = worldToScreen(cam, W, H);
  drawPaper(ctx, paper, cam, W, H);
  const all = q.has('all');
  const head = all ? P.N - 1 : headAt(P, t);
  if (t >= P.T[0] || all) drawLine(ctx, P, head, M, cam.k);
  drawBlots(ctx, P, all ? 999 : t, M, cam.k);
  drawTooth(ctx, tooth, cam, W, H);
  vignette(ctx, W, H);
  if (!all && !q.has('nopen')) {
    const tip = M(...posAt(P, head)), dir = penDir(t), k = cam.k;
    const lift = t < P.T[0] ? clamp((P.T[0] - t) / 0.8) : t > P.T[P.N - 1] ? clamp((t - P.T[P.N - 1]) / 0.6) : 0;
    const ag = clamp((t - AGENT.t0) / 0.4) * (1 - clamp((t - AGENT.t1) / 0.4));
    if (ag > 0) { const d = [-0.6, -0.8], L = 230 * k; handShadow(ctx, tip[0] + d[0] * L, tip[1] + d[1] * L, 330 * k, Math.atan2(-d[1], -d[0]), 0.12 * ag); }
    penShadow(ctx, tip, dir, k, { lift, alpha: clamp(t / 0.4) });
  }
}
window.DUR = DUR;
window.render = render;
// the pen's screen position over time (for the sound of the pen and for placing overlays)
window.TRACK = (step = 1 / 30) => { const out = []; for (let t = 0; t <= DUR; t += step) { const h = headAt(P, t), i = Math.floor(h), c = camFor(t), Mx = worldToScreen(c, W, H), p = Mx(...posAt(P, h)); out.push([+t.toFixed(3), Math.round(P.V[i]), Math.round(p[0]), Math.round(p[1]), P.segs[P.SEG[i]].style]); } return out; };
window.READY = true;
// per-frame camera (cx, cy, k) for overlays placed in paper coordinates by the Remotion layer
window.CAMS = (fps = 30) => { const out = []; for (let i = 0; i <= Math.ceil(DUR * fps); i++) { const c = camFor(i / fps); out.push([+c.cx.toFixed(2), +c.cy.toFixed(2), +c.k.toFixed(4), +c.r.toFixed(5)]); } return out; };
