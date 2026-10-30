// Richness check (画面丰富度): does the picture keep changing? Reads a finished mp4, renders nothing.
// Ported from dashi-animationstyle pipeline/丰富度检查.mjs (MIT, © 2026 Dashi AI Lab) and adapted to 9:16:
// the caption band is masked by y-range instead of "bottom 170 px".
//   node scripts/qa/richness.mjs douyin/<id>/video.mp4 [--every 2.5] [--band 1290:1500] [--outdir qa/<id>]
// Writes <outdir>/richness.png (one cell every 2.5 s) and richness.txt. Thresholds, from the reference
// blind test: adjacent-cell mean diff >= 10 with no "almost unchanged" pair (< 4) passes; > 2 s without
// motion (frame vs 0.1 s earlier, diff <= 0.3) gets a warning. See docs/video-craft/动效与画面变化.md.
// Frozen time (motion-video-kit quality bar, docs/video-craft/学习/motion-video-kit.md): every still stretch > 0.6 s outside
// the last second is listed with its start, and the total is reported per 30 s (target ≤ ~1 s). A rest the storyboard
// planned (高潮停留, a held climax) is fine — onetake: rests make the bursts land; the list is for the ones nobody planned.
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';

const args = process.argv.slice(2);
const opt = {every: 2.5, band: '1290:1500'};
for (let i = 0; i < args.length; i += 1) {
  if (args[i] === '--every') opt.every = Number(args[++i]);
  else if (args[i] === '--band') opt.band = args[++i];
  else if (args[i] === '--outdir') opt.outdir = args[++i];
  else opt.mp4 = args[i];
}
if (!opt.mp4 || !fs.existsSync(opt.mp4)) {
  console.log('usage: node scripts/qa/richness.mjs <video.mp4> [--every 2.5] [--band y0:y1|none] [--outdir dir]');
  process.exit(1);
}
const id = path.basename(path.dirname(path.resolve(opt.mp4)));
const outdir = path.resolve(opt.outdir || path.join('qa', id));
fs.mkdirSync(outdir, {recursive: true});
const probe = (entries, stream) => execFileSync('ffprobe', ['-v', 'error', ...(stream ? ['-select_streams', 'v:0'] : []), '-show_entries', entries, '-of', 'csv=p=0', opt.mp4], {encoding: 'utf8'}).trim();
const dur = Number(probe('format=duration'));
const [vw, vh] = probe('stream=width,height', true).split(',').map(Number);

// Small grayscale frames; the caption band is painted black so subtitle changes don't count as picture changes.
const GW = 108, GH = Math.round(GW * vh / vw), sy = GH / vh;
const [b0, b1] = opt.band === 'none' ? [0, 0] : opt.band.split(':').map((v) => Math.round(Number(v) * sy));
const raw = execFileSync('ffmpeg', ['-v', 'error', '-i', opt.mp4, '-vf', `scale=${GW}:${GH},format=gray`, '-f', 'rawvideo', '-'], {maxBuffer: 1 << 30});
const FS = GW * GH, n = Math.floor(raw.length / FS), fps = n / dur;
const frame = (i) => raw.subarray(i * FS, (i + 1) * FS);
const masked = (k) => { const y = Math.floor(k / GW); return y >= b0 && y < b1; };
const keep = FS - Math.max(0, b1 - b0) * GW;
const diff = (p, q) => { let s = 0; for (let k = 0; k < FS; k += 1) if (!masked(k)) s += Math.abs(p[k] - q[k]); return s / keep; };

const MOVE = 0.3, FLAT = 4, RICH = 10;
let moving = 0, run = 0, longest = 0, longestAt = 0;
const lag = Math.max(1, Math.round(fps / 10));
const holds = []; // [start s, length s] of still stretches > 0.6 s
for (let i = lag; i <= n; i += 1) {
  const still = i < n && diff(frame(i), frame(i - lag)) <= MOVE;
  if (still) { if ((run += 1) > longest) { longest = run; longestAt = (i - run) / fps; } continue; }
  if (run / fps > 0.6) holds.push([(i - run) / fps, run / fps]);
  if (i < n) moving += 1;
  run = 0;
}
const cells = [];
for (let t = 0; t < dur - 0.05; t += opt.every) cells.push(t);
const lines = [];
const out = (s) => { console.log(s); lines.push(s); };
out(`丰富度检查：${opt.mp4}，${dur.toFixed(2)} 秒，${n} 帧，每 ${opt.every} 秒一格；字幕带 y ${opt.band} 不计`);
const ds = [];
let flat = 0;
for (let k = 1; k < cells.length; k += 1) {
  const d = diff(frame(Math.min(n - 1, Math.round(cells[k] * fps))), frame(Math.min(n - 1, Math.round(cells[k - 1] * fps))));
  ds.push(d);
  if (d < FLAT) flat += 1;
  if (d < FLAT || process.argv.includes('--verbose')) out(`  ${cells[k - 1].toFixed(1)} → ${cells[k].toFixed(1)} 秒：${d.toFixed(1)}${d < FLAT ? '  ← 几乎没变' : ''}`);
}
const avg = ds.reduce((s, x) => s + x, 0) / Math.max(1, ds.length);
const rest = ds.length > 2 ? ds.slice(1).reduce((s, x) => s + x, 0) / (ds.length - 1) : avg;
out(`相邻格变化：平均 ${avg.toFixed(1)}（去掉开场第 1 对：${rest.toFixed(1)}）；几乎没变 ${flat} / ${ds.length} 对`);
out(`在动的帧：${(moving / (n - lag) * 100).toFixed(0)}%；最长静止：${(longest / fps).toFixed(2)} 秒（从 ${longestAt.toFixed(2)} 秒起）`);
out(flat === 0 && avg >= RICH ? `判定：过（平均 ≥ ${RICH}，没有几乎没变的格）` : `判定：不过——在标「几乎没变」的地方补变化（新东西进场、推近拉开、换色），平均要 ≥ ${RICH}`);
if (longest / fps > 2) out('提醒：有超过 2 秒的静止——加次要动作（飘动、闪烁、粒子、慢推）');
const body = holds.filter(([t]) => t < dur - 1);
const frozen = body.reduce((sum, [, d]) => sum + d, 0);
out(`冻结时间（静止 > 0.6 秒，最后 1 秒不算）：共 ${frozen.toFixed(1)} 秒，每 30 秒 ${(frozen / dur * 30).toFixed(1)} 秒（目标 ≤ 约 1 秒）${body.length ? '：' + body.map(([t, d]) => `${t.toFixed(1)} 秒起 ${d.toFixed(1)} 秒`).join('、') : ''}`);
if (frozen / dur * 30 > 1.2) out('提醒：冻结时间偏多——对照分镜：写了“停”的（高潮停留）留着，其余的补动作或剪短');
const cols = 8, rows = Math.ceil(cells.length / cols), png = path.join(outdir, 'richness.png');
execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', opt.mp4, '-vf', `fps=1/${opt.every}:round=near,scale=216:-1,tile=${cols}x${rows}:padding=6:color=white`, '-frames:v', '1', png]);
fs.writeFileSync(path.join(outdir, 'richness.txt'), `${lines.join('\n')}\n`);
console.log(`拼图：${png}`);
