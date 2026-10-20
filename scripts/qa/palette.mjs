// Colour picker (取色): dominant colours of a reference image (k-means, by area) plus the colour at given
// pixels — for writing a style card from a reference. Reads the image only.
// Ported from dashi-animationstyle pipeline/取色.mjs (MIT, © 2026 Dashi AI Lab).
//   node scripts/qa/palette.mjs <image> [k=14] [x:y …]
//   e.g. node scripts/qa/palette.mjs ref.jpg 16 60:40 400:330
// Then check text/background contrast with the one-liner in docs/video-craft/讲解动画规则.md §2.
import {execFileSync} from 'node:child_process';

const [, , img, kArg, ...pts] = process.argv;
if (!img) {
  console.log('usage: node scripts/qa/palette.mjs <image> [k=14] [x:y ...]');
  process.exit(1);
}
const K = Number(kArg) || 14;
const [W, H] = execFileSync('ffprobe', ['-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height', '-of', 'csv=p=0', img], {encoding: 'utf8'}).trim().split(',').map(Number);
const raw = execFileSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-i', img, '-frames:v', '1', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], {maxBuffer: 1 << 28});
const px = [];
for (let i = 0; i + 2 < raw.length; i += 9) px.push([raw[i], raw[i + 1], raw[i + 2]]);   // every 3rd pixel
let C = Array.from({length: K}, (_, i) => px[Math.floor((i + 0.5) * px.length / K)].slice());
for (let it = 0; it < 25; it += 1) {
  const S = C.map(() => [0, 0, 0, 0]);
  for (const p of px) {
    let best = 0, bd = Infinity;
    C.forEach((c, j) => { const d = (p[0] - c[0]) ** 2 + (p[1] - c[1]) ** 2 + (p[2] - c[2]) ** 2; if (d < bd) { bd = d; best = j; } });
    const s = S[best]; s[0] += p[0]; s[1] += p[1]; s[2] += p[2]; s[3] += 1;
  }
  C = S.map((s, j) => (s[3] ? [s[0] / s[3], s[1] / s[3], s[2] / s[3], s[3]] : C[j]));
}
const hex = (c) => `#${c.slice(0, 3).map((v) => Math.round(v).toString(16).padStart(2, '0')).join('')}`;
console.log(`${img}: ${W}×${H}, dominant colours by area:`);
C.sort((a, b) => (b[3] || 0) - (a[3] || 0)).forEach((c) => console.log(`  ${hex(c)}  ${((c[3] || 0) / px.length * 100).toFixed(1)}%`));
for (const p of pts) {
  const [x, y] = p.split(':').map(Number);
  const i = (y * W + x) * 3;
  console.log(`  point ${x},${y}  ${hex([raw[i], raw[i + 1], raw[i + 2]])}`);
}
