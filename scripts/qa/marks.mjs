// Beat check (卡点检查): does each on-screen action land on the word that names it? Reads the finished mp4
// and its timeline; renders nothing. For every mark it grabs the frame 0.1 s BEFORE the keyword and 0.35 s
// AFTER it, two marks per row (before, after, before, after). "Before" should not show the action yet,
// "after" should show it starting — anything else means the cue is off.
// Ported from dashi-animationstyle pipeline/render.mjs --check-marks (MIT, © 2026 Dashi AI Lab).
//   node scripts/qa/marks.mjs douyin/<id>/video.mp4 [--timeline=tutorials/<id>.timeline.json] [--outdir=qa/<id>]
// Marks: tutorials → every {cue} of every scene; explainers → each scene start and its stamp beat.
// Writes <outdir>/marks_N.png (8 rows = 16 marks per sheet) and marks.txt (row → mark, time, caption).
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {execFileSync} from 'node:child_process';

const args = process.argv.slice(2);
const mp4 = args.find((a) => !a.startsWith('--'));
const value = (name) => args.find((a) => a.startsWith(`--${name}=`))?.slice(name.length + 3);
if (!mp4 || !fs.existsSync(mp4)) {
  console.log('usage: node scripts/qa/marks.mjs <video.mp4> [--timeline=path] [--outdir=dir]');
  process.exit(1);
}
const id = path.basename(path.dirname(path.resolve(mp4)));
const timelinePath = value('timeline') ?? [`tutorials/${id}.timeline.json`, `explainers/${id}.timeline.json`].find((p) => fs.existsSync(p));
if (!timelinePath) throw new Error(`No timeline found for ${id}; pass --timeline=…`);
const tl = JSON.parse(fs.readFileSync(timelinePath, 'utf8'));
const outdir = path.resolve(value('outdir') ?? path.join('qa', id));
fs.mkdirSync(outdir, {recursive: true});

// Collect marks as {name, t (s), caption}.
const marks = [];
if (tl.scenes?.[0]?.cues) {   // tutorial timeline: cues are ms from scene start (lead included)
  for (const s of tl.scenes) {
    const t0 = s.startFrame / tl.fps;
    for (const [k, ms] of Object.entries(s.cues)) {
      const at = ms / 1000;
      const cap = s.captions.find((c) => at * 1000 >= c.startMs - 30 && at * 1000 < c.endMs)?.text ?? '';
      marks.push({name: `${s.id}.${k}`, t: t0 + at, caption: cap});
    }
  }
} else {                      // explainer timeline: scene starts + stamp beats, absolute seconds
  const capAt = (t) => tl.captions.find((c) => t * 1000 >= c.startMs - 30 && t * 1000 < c.endMs)?.text ?? '';
  for (const s of tl.scenes) {
    marks.push({name: `${s.id}.start`, t: s.from / tl.fps + 0.05, caption: capAt(s.from / tl.fps + 0.4)});
    if (s.stamp) marks.push({name: `${s.id}.stamp「${s.stamp.text}」`, t: s.stamp.at, caption: capAt(s.stamp.at)});
  }
}
marks.sort((a, b) => a.t - b.t);

// Label frames when a CJK font is available (drawtext needs a font file).
let fontfile = null;
try { fontfile = execFileSync('fc-match', ['-f', '%{file}', 'Noto Sans CJK SC'], {encoding: 'utf8'}).trim() || null; } catch {}
const esc = (s) => s.replace(/\\/g, '\\\\').replace(/:/g, '\\:').replace(/'/g, '’').replace(/%/g, '\\%');
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'marks-'));
const W = 270;
let n = 0;
for (const m of marks) {
  for (const [tag, dt] of [['前', -0.1], ['后', 0.35]]) {
    const out = path.join(tmp, `${String(n++).padStart(4, '0')}.png`);
    const label = fontfile ? `,drawbox=x=0:y=0:w=iw:h=34:color=black@0.6:t=fill,drawtext=fontfile='${fontfile}':text='${esc(`${m.name} ${tag}`)}':x=6:y=6:fontsize=20:fontcolor=white` : '';
    execFileSync('ffmpeg', ['-v', 'error', '-y', '-ss', Math.max(0, m.t + dt).toFixed(3), '-i', mp4, '-frames:v', '1', '-vf', `scale=${W}:-1${label}`, out]);
  }
}
const perSheet = 16;   // 8 rows × 2 marks
const lines = [`卡点检查：${mp4}（时间轴 ${timelinePath}），${marks.length} 个标记；每行两个标记，顺序「前、后、前、后」；前 = 关键词前 0.1 秒，后 = 后 0.35 秒。`];
for (let sheet = 0; sheet * perSheet < marks.length; sheet += 1) {
  const chunk = marks.slice(sheet * perSheet, (sheet + 1) * perSheet);
  const list = path.join(tmp, `list${sheet}.txt`);
  const files = chunk.flatMap((_, i) => [0, 1].map((k) => path.join(tmp, `${String((sheet * perSheet + i) * 2 + k).padStart(4, '0')}.png`)));
  fs.writeFileSync(list, files.map((f) => `file '${f}'`).join('\n'));
  const rows = Math.ceil(chunk.length / 2);
  const png = path.join(outdir, `marks_${sheet + 1}.png`);
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', list, '-vf', `tile=4x${rows}:padding=6:color=white`, '-frames:v', '1', png]);
  lines.push(`\n${path.basename(png)}`);
  chunk.forEach((m, i) => lines.push(`  第 ${Math.floor(i / 2) + 1} 行${i % 2 ? '右' : '左'}：${m.name}  ${m.t.toFixed(2)} 秒  字幕「${m.caption}」`));
}
fs.rmSync(tmp, {recursive: true, force: true});
fs.writeFileSync(path.join(outdir, 'marks.txt'), `${lines.join('\n')}\n`);
console.log(`${marks.length} marks -> ${path.relative(process.cwd(), outdir)}/marks_*.png + marks.txt`);
