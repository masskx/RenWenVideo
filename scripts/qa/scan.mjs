// Scan sheets (扫片) and phone-width readability checks for a finished video. Reads the mp4 only.
//   node scripts/qa/scan.mjs douyin/<id>/video.mp4                 -> qa/<id>/scan_1.png … (3 frames/s, 8×4 grid ≈ 10.7 s per sheet)
//   node scripts/qa/scan.mjs douyin/<id>/video.mp4 --phone=12.5,60  -> qa/<id>/phone_12.5.png … (frame shrunk to 360 px wide)
//   node scripts/qa/scan.mjs douyin/<id>/video.mp4 --around=24.77    -> qa/<id>/around_24.77.png (±0.5 s at 30 fps, for checking a cut)
// What to look for: docs/video-craft/讲解动画规则.md (§1 sizes, §3 safe areas) and 动效与画面变化.md (§7 checklist).
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';

const args = process.argv.slice(2);
const mp4 = args.find((a) => !a.startsWith('--'));
const value = (name) => args.find((a) => a.startsWith(`--${name}=`))?.slice(name.length + 3);
if (!mp4 || !fs.existsSync(mp4)) {
  console.log('usage: node scripts/qa/scan.mjs <video.mp4> [--phone=s1,s2] [--around=s] [--outdir=dir]');
  process.exit(1);
}
const outdir = path.resolve(value('outdir') ?? path.join('qa', path.basename(path.dirname(path.resolve(mp4)))));
fs.mkdirSync(outdir, {recursive: true});
const ff = (params) => execFileSync('ffmpeg', ['-v', 'error', '-y', ...params]);
const dur = Number(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', mp4], {encoding: 'utf8'}).trim());

if (value('phone')) {
  // A phone shows 1080 px across ~360–390 pt: anything unreadable here is unreadable on Douyin.
  for (const s of value('phone').split(',').map(Number)) {
    const out = path.join(outdir, `phone_${s}.png`);
    ff(['-ss', String(s), '-i', mp4, '-frames:v', '1', '-vf', 'scale=360:-1', out]);
    console.log(`phone ${s}s -> ${path.relative(process.cwd(), out)}`);
  }
} else if (value('around')) {
  const s = Number(value('around'));
  const out = path.join(outdir, `around_${s}.png`);
  ff(['-ss', String(Math.max(0, s - 0.5)), '-t', '1', '-i', mp4, '-vf', 'fps=10,scale=180:-1,tile=10x1:padding=4:color=white', '-frames:v', '1', out]);
  console.log(`cut ${s}s ±0.5 s -> ${path.relative(process.cwd(), out)}`);
} else {
  const perSheet = 32 / 3;
  const sheets = Math.ceil(dur / perSheet);
  for (let i = 0; i < sheets; i += 1) {
    const out = path.join(outdir, `scan_${i + 1}.png`);
    ff(['-ss', String(i * perSheet), '-t', String(perSheet), '-i', mp4, '-vf', 'fps=3,scale=160:-1,tile=8x4:padding=4:color=white', '-frames:v', '1', out]);
  }
  console.log(`${sheets} scan sheets (3 fps, 8×4, ${perSheet.toFixed(1)} s each) -> ${path.relative(process.cwd(), outdir)}/scan_*.png`);
}
