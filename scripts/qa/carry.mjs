// Carry check (承接检查): at every scene boundary, does something on screen survive into the next scene and move into
// it, or does the next scene simply replace the last one? Reads a finished mp4 (and its timeline); renders nothing.
// Learned from onetake (docs/video-craft/学习/onetake.md): a film reads as "PPT 式一个一个展示" for two reasons — shots of
// equal length, and beats that replace each other; its rejected cuts scored 0.00 and 0.40 on this, the accepted 0.56–0.75,
// while every rhythm measure passed all of them. Our version works on pixels only, so it runs on any of our films:
//   node scripts/qa/carry.mjs douyin/<id>/video.mp4 [--band 1290:1500] [--outdir qa/<id>]
// Boundaries come from tutorials/<id>.timeline.json (scene starts) when it exists, else from the picture (most of the
// frame changing within 0.4 s). At each boundary, frame A (0.25 s before) is cut into blocks; blocks with texture that
// are not frame furniture (unchanged all film: borders, headers, grain) are searched for in frame B (0.35 s after):
//   carried  — ≥ 8 % of A's textured area turns up in B moved by ≥ 2 % of the frame diagonal (or the same part zoomed);
//   anchored — no carry, but ≥ 12 % of it survives, moved a little or in place (a held window behind changing contents);
//   bare     — nothing survives.
// Score = (carried + anchored / 2) / boundaries (the last 1.2 s not counted). < 0.5 fails, < 0.7 warns (onetake's lines).
// Blind spots (also onetake's): a carry built from two elements (a card fading out while a page grows in at its size)
// reads as bare; one continuous world with few boundaries scores on few samples. Look at qa/<id>/carry.jpg before
// believing a number.
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';

const args = process.argv.slice(2);
const opt = {band: '1290:1500'};
for (let i = 0; i < args.length; i += 1) {
  if (args[i] === '--band') opt.band = args[++i];
  else if (args[i] === '--outdir') opt.outdir = args[++i];
  else opt.mp4 = args[i];
}
if (!opt.mp4 || !fs.existsSync(opt.mp4)) {
  console.log('usage: node scripts/qa/carry.mjs <video.mp4> [--band y0:y1|none] [--outdir dir]');
  process.exit(1);
}
const id = path.basename(path.dirname(path.resolve(opt.mp4)));
const outdir = path.resolve(opt.outdir || path.join('qa', id));
fs.mkdirSync(outdir, {recursive: true});
const probe = (e, v) => execFileSync('ffprobe', ['-v', 'error', ...(v ? ['-select_streams', 'v:0'] : []), '-show_entries', e, '-of', 'csv=p=0', opt.mp4], {encoding: 'utf8'}).trim();
const dur = Number(probe('format=duration'));
const [vw, vh] = probe('stream=width,height', true).split(',').map(Number);

// Small grayscale frames at 15 fps; the caption band is ignored (subtitles change at every boundary by design).
const GW = 108, GH = Math.round(GW * vh / vw), FPS = 15, FS = GW * GH;
const raw = execFileSync('ffmpeg', ['-v', 'error', '-i', opt.mp4, '-vf', `fps=${FPS},scale=${GW}:${GH},format=gray`, '-f', 'rawvideo', '-'], {maxBuffer: 1 << 30});
const n = Math.floor(raw.length / FS);
const frame = (t) => raw.subarray(Math.max(0, Math.min(n - 1, Math.round(t * FPS))) * FS, (Math.max(0, Math.min(n - 1, Math.round(t * FPS))) + 1) * FS);
const [b0, b1] = opt.band === 'none' ? [0, 0] : opt.band.split(':').map((v) => Math.round(Number(v) * GH / vh));

// Blocks of B×B px; furniture = blocks that barely change over the whole film (sampled every 0.5 s).
const B = 6, BX = Math.floor(GW / B), BY = Math.floor(GH / B);
const blockRows = (by) => by * B + B > b0 && by * B < b1;
const samples = [];
for (let t = 0; t < dur; t += 0.5) samples.push(frame(t));
const furniture = new Set();
for (let by = 0; by < BY; by += 1) for (let bx = 0; bx < BX; bx += 1) {
  let change = 0;
  for (let s = 1; s < samples.length; s += 1) {
    let d = 0;
    for (let y = 0; y < B; y += 1) for (let x = 0; x < B; x += 1) { const k = (by * B + y) * GW + bx * B + x; d += Math.abs(samples[s][k] - samples[s - 1][k]); }
    if (d / (B * B) > 6) change += 1;
  }
  if (change <= samples.length * 0.08) furniture.add(by * BX + bx);
}

// Boundaries.
const tlPath = `tutorials/${id}.timeline.json`;
let bounds;
let from = 'picture';
if (fs.existsSync(tlPath)) {
  const tl = JSON.parse(fs.readFileSync(tlPath, 'utf8'));
  bounds = tl.scenes.slice(1).map((s) => s.startFrame / tl.fps);
  from = 'timeline';
} else {
  bounds = [];
  const changed = (a, b) => { let c = 0; for (let k = 0; k < FS; k += 1) if (Math.abs(a[k] - b[k]) > 25) c += 1; return c / FS; };
  let last = -1;
  for (let t = 0.4; t < dur; t += 1 / FPS) if (changed(frame(t), frame(t - 0.4)) > 0.45 && t - last > 0.8) { bounds.push(t - 0.2); last = t; }
}
bounds = bounds.filter((t) => t > 0.5 && t < dur - 1.2);

const diag = Math.hypot(GW, GH);
const sad = (A, Bf, ax, ay, bx, by, s = 1) => {
  // mean abs difference between A's block at (ax, ay) and B sampled at (bx, by) with scale s (nearest)
  let d = 0;
  for (let y = 0; y < B; y += 1) for (let x = 0; x < B; x += 1) {
    const sx = Math.round(bx + x * s), sy = Math.round(by + y * s);
    if (sx < 0 || sy < 0 || sx >= GW || sy >= GH) return 999;
    d += Math.abs(A[(ay + y) * GW + ax + x] - Bf[sy * GW + sx]);
  }
  return d / (B * B);
};
const R = 14; // search radius in px (13 % of the width)
const results = [];
for (const t of bounds) {
  const A = frame(t - 0.25), Bf = frame(t + 0.35);
  let textured = 0, moved = 0, kept = 0;
  for (let by = 0; by < BY; by += 1) for (let bx = 0; bx < BX; bx += 1) {
    if (blockRows(by) || furniture.has(by * BX + bx)) continue;
    const ax = bx * B, ay = by * B;
    let mean = 0, varr = 0;
    for (let y = 0; y < B; y += 1) for (let x = 0; x < B; x += 1) mean += A[(ay + y) * GW + ax + x];
    mean /= B * B;
    for (let y = 0; y < B; y += 1) for (let x = 0; x < B; x += 1) varr += (A[(ay + y) * GW + ax + x] - mean) ** 2;
    if (Math.sqrt(varr / (B * B)) < 9) continue; // flat ground: nothing to recognise
    textured += 1;
    const still = sad(A, Bf, ax, ay, ax, ay);
    let best = 999, bdx = 0, bdy = 0;
    for (const s of [0.8, 1, 1.25]) for (let dy = -R; dy <= R; dy += 1) for (let dx = -R; dx <= R; dx += 1) {
      const d = sad(A, Bf, ax, ay, ax + dx, ay + dy, s);
      if (d < best) { best = d; bdx = dx; bdy = dy; }
    }
    if (still < 10) kept += 1;
    else if (best < 10 && Math.hypot(bdx, bdy) >= 0.02 * diag) moved += 1;
  }
  const kind = textured === 0 ? 'bare' : moved / textured >= 0.08 ? 'carried' : (moved + kept) / textured >= 0.12 ? 'anchored' : 'bare';
  results.push({t, kind, textured, moved, kept});
}

const score = results.length ? results.reduce((s, r) => s + (r.kind === 'carried' ? 1 : r.kind === 'anchored' ? 0.5 : 0), 0) / results.length : 1;
const lines = [];
const out = (s) => { console.log(s); lines.push(s); };
out(`承接检查：${opt.mp4}，${dur.toFixed(1)} 秒，${results.length} 个边界（来自 ${from === 'timeline' ? '时间线的场景切换' : '画面突变'}）；字幕带 y ${opt.band} 和全片不动的版面不计`);
for (const r of results) out(`  ${r.t.toFixed(1)} 秒：${{carried: '带过去了', anchored: '留着没动', bare: '裸切 ←'}[r.kind]}（有纹理 ${r.textured} 块，移动着带过去 ${r.moved}，原地留着 ${r.kept}）`);
const c = results.filter((r) => r.kind === 'carried').length, a = results.filter((r) => r.kind === 'anchored').length;
out(`承接分 ${score.toFixed(2)}（带过去 ${c} · 留着 ${a} · 裸切 ${results.length - c - a}）`);
out(score < 0.5 ? '判定：不过——每一拍在替换上一拍（onetake：像 PPT）。在标「裸切」的边界上，让一个东西活过去并动着变成下一场：按下去的变成结果、镜头推进卡片直到它就是下一场、主角带着走'
  : score < 0.7 ? '判定：过（偏低，< 0.7）——看标「裸切」的边界能不能改成承接' : '判定：过');
// A strip per boundary: A | B, so the verdict can be checked by eye.
const tiles = results.map((r) => r.t);
if (tiles.length) {
  const strip = path.join(outdir, 'carry.jpg');
  const inputs = tiles.flatMap((t) => ['-ss', String(Math.max(0, t - 0.25)), '-i', opt.mp4, '-ss', String(t + 0.35), '-i', opt.mp4]);
  const fc = tiles.map((_, i) => `[${2 * i}:v]scale=180:-1,trim=end_frame=1[a${i}];[${2 * i + 1}:v]scale=180:-1,trim=end_frame=1[b${i}]`).join(';');
  const pairs = tiles.map((_, i) => `[a${i}][b${i}]`).join('');
  execFileSync('ffmpeg', ['-v', 'error', '-y', ...inputs, '-filter_complex', `${fc};${pairs}hstack=inputs=${2 * tiles.length}[o]`, '-map', '[o]', '-frames:v', '1', '-q:v', '3', strip]);
  out(`对照条：${strip}（每个边界两张：之前 0.25 秒 | 之后 0.35 秒）`);
}
fs.writeFileSync(path.join(outdir, 'carry.txt'), `${lines.join('\n')}\n`);
process.exitCode = score < 0.5 ? 1 : 0;
