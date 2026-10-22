// Clutter check (画面减法): is the frame busy in detail but empty in mass? Reads a finished mp4, renders nothing.
// One frame per second (quarter scale), caption band and below ignored. Per frame it measures:
//   accents — saturated hue families (30° bins) covering >= 0.2 % of the frame; > 3 means the A/B rule broke
//             (colourful external footage counts too, so look before you change anything)
//   ink     — share of the content stage that is not background (one big subject ≈ 15–35 %)
//   bottom  — lowest row with content; a frame whose content stops far above the captions leaves a dead band
//   node scripts/qa/clutter.mjs douyin/<id>/video.mp4 [--frame full|channels] [--verbose]
// Thresholds come from the house baseline (deepseek-vs-opus55: 0 dead-band frames, 4 accents only in 3 of 54 footage frames) and
// docs/video-craft/quick-reference.md §六. Exit code is always 0: this is a prompt to look, not a gate.
import fs from 'node:fs';
import {execFileSync} from 'node:child_process';

const args = process.argv.slice(2);
const mp4 = args.find((a) => !a.startsWith('--'));
const frameArg = args[args.indexOf('--frame') + 1];
const verbose = args.includes('--verbose');
if (!mp4 || !fs.existsSync(mp4)) {
  console.log('usage: node scripts/qa/clutter.mjs <video.mp4> [--frame full|channels] [--verbose]');
  process.exit(1);
}
// Content stage per layout (src/tutorial/theme.ts layoutOf) and where a dead band starts.
const L = args.includes('--frame') && frameArg === 'channels' ? {top: 470, bottom: 1270, dead: 950} : {top: 200, bottom: 1280, dead: 900};
const S = 4, W = 1080 / S, H = 1920 / S, Y0 = Math.ceil(L.top / S), Y1 = Math.floor(L.bottom / S);
const raw = execFileSync('ffmpeg', ['-v', 'error', '-i', mp4, '-vf', `fps=1,scale=${W}:${H}`, '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], {maxBuffer: 1 << 30});
const n = Math.floor(raw.length / (W * H * 3));

const rows = [];
for (let k = 0; k < n; k += 1) {
  const o = k * W * H * 3;
  // Background = the most common colour (4-bit quantised) inside the stage.
  const hist = new Map();
  for (let y = Y0; y < Y1; y += 2) for (let x = 0; x < W; x += 2) {
    const i = o + (y * W + x) * 3, key = (raw[i] >> 4) << 8 | (raw[i + 1] >> 4) << 4 | raw[i + 2] >> 4;
    hist.set(key, (hist.get(key) ?? 0) + 1);
  }
  const bk = [...hist].sort((a, b) => b[1] - a[1])[0][0];
  const bg = [(bk >> 8 & 15) * 16 + 8, (bk >> 4 & 15) * 16 + 8, (bk & 15) * 16 + 8];
  const bins = new Array(12).fill(0), rowInk = new Array(H).fill(0);
  let ink = 0, area = 0;
  for (let y = Y0; y < Y1; y += 1) for (let x = 0; x < W; x += 1) {
    const i = o + (y * W + x) * 3, r = raw[i], g = raw[i + 1], b = raw[i + 2];
    area += 1;
    if (Math.abs(r - bg[0]) + Math.abs(g - bg[1]) + Math.abs(b - bg[2]) > 90) { ink += 1; rowInk[y] += 1; }
    const mx = Math.max(r, g, b), mn = Math.min(r, g, b);
    if (mx > 115 && (mx - mn) / mx > 0.45) {
      const h = mx === r ? ((g - b) / (mx - mn) + 6) % 6 : mx === g ? (b - r) / (mx - mn) + 2 : (r - g) / (mx - mn) + 4;
      bins[Math.floor(h * 2) % 12] += 1;
    }
  }
  // 30° bins keep red (0°) and amber (35°) apart; the 0.2 % floor drops anti-aliased edges.
  const accents = bins.filter((c) => c >= W * H * 0.002).length;
  let bottom = 0;
  rowInk.forEach((c, y) => { if (c > W * 0.03) bottom = y * S; });
  rows.push({t: k, accents, ink: (100 * ink) / area, bottom});
}

const flag = (r) => [r.accents > 3 && `${r.accents} 个强调色`, r.bottom < L.dead && `内容止于 y ${r.bottom}`, r.ink < 6 && `舞台只有 ${r.ink.toFixed(0)}% 有东西`].filter(Boolean);
const avg = (a) => a.reduce((s, x) => s + x, 0) / a.length;
console.log(`${mp4}: ${n} 帧（每秒一帧），舞台 y ${L.top}–${L.bottom}`);
console.log(`  强调色  平均 ${avg(rows.map((r) => r.accents)).toFixed(1)}，最多 ${Math.max(...rows.map((r) => r.accents))}（> 3 的帧 ${rows.filter((r) => r.accents > 3).length}）`);
console.log(`  占舞台  平均 ${avg(rows.map((r) => r.ink)).toFixed(1)}%`);
console.log(`  下半空  ${rows.filter((r) => r.bottom < L.dead).length}/${n} 帧的内容停在 y ${L.dead} 以上（字幕上方留出空带）`);
for (const r of rows) {
  const f = flag(r);
  if (f.length || verbose) console.log(`  ${String(r.t).padStart(3)} s  强调色 ${r.accents}  占 ${r.ink.toFixed(1).padStart(4)}%  底 ${String(r.bottom).padStart(4)}  ${f.join('；')}`);
}
const dead = rows.filter((r) => r.bottom < L.dead).length / n, loud = rows.filter((r) => r.accents > 3).length / n;
console.log(dead <= 0.15 && loud <= 0.1 ? '结论：过（仍要自己看静帧）' : `结论：去看标出的帧——${dead > 0.15 ? '主体偏小或偏上，往下铺满舞台；' : ''}${loud > 0.1 ? '强调色超过 A/B + 一个语义色（外部素材里的颜色也会算进去，先看是不是素材）；' : ''}`);
