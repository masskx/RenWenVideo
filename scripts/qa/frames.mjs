// Frame-by-frame viewer (逐帧查看): every frame of a time range as an HTML page you step through with ← →,
// to check anticipation, contact, squash, settle and phase offsets around a main event (docs/video-craft/archive/导演层.md §2, §11).
//   node scripts/qa/frames.mjs douyin/<id>/video.mp4 --from=12.0 --to=13.5 [--width=540] [--outdir=qa/<id>]
//   -> qa/<id>/frames-12.00-13.50/index.html (+ JPEG frames, a contact strip strip.jpg, and the caption at each frame)
// Also accepts --at=s (±0.4 s around s). Reads the mp4 only; works on drafts too.
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';

const args = process.argv.slice(2);
const mp4 = args.find((a) => !a.startsWith('--'));
const value = (name) => args.find((a) => a.startsWith(`--${name}=`))?.slice(name.length + 3);
if (!mp4 || !fs.existsSync(mp4)) {
  console.log('usage: node scripts/qa/frames.mjs <video.mp4> --from=s --to=s | --at=s [--width=540] [--outdir=dir]');
  process.exit(1);
}
const at = value('at');
const from = Number(value('from') ?? (at ? Number(at) - 0.4 : 0));
const to = Number(value('to') ?? (at ? Number(at) + 0.4 : from + 1));
const width = Number(value('width') ?? 540);
const id = path.basename(path.dirname(path.resolve(mp4)));
const base = path.resolve(value('outdir') ?? path.join('qa', id === 'douyin' ? 'video' : id));
const dir = path.join(base, `frames-${from.toFixed(2)}-${to.toFixed(2)}`);
fs.rmSync(dir, {recursive: true, force: true});
fs.mkdirSync(dir, {recursive: true});

const fps = (() => {
  const r = execFileSync('ffprobe', ['-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=r_frame_rate', '-of', 'csv=p=0', mp4], {encoding: 'utf8'}).trim();
  const [a, b] = r.split('/').map(Number);
  return b ? a / b : a;
})();
execFileSync('ffmpeg', ['-v', 'error', '-y', '-ss', String(from), '-to', String(to), '-i', mp4, '-vf', `scale=${width}:-2`, '-q:v', '3', path.join(dir, 'f%04d.jpg')]);
const files = fs.readdirSync(dir).filter((f) => /^f\d+\.jpg$/.test(f)).sort();
execFileSync('ffmpeg', ['-v', 'error', '-y', '-ss', String(from), '-to', String(to), '-i', mp4,
  '-vf', `scale=160:-2,tile=${Math.min(files.length, 12)}x${Math.ceil(files.length / 12)}`, '-frames:v', '1', path.join(dir, 'strip.jpg')]);

// Captions from the package's SRT, if there is one next to the video.
const srtPath = path.join(path.dirname(mp4), 'subtitles.srt');
const toSec = (s) => {const [h, m, rest] = s.split(':'); const [sec, ms] = rest.split(','); return +h * 3600 + +m * 60 + +sec + +ms / 1000;};
const cues = fs.existsSync(srtPath) ? fs.readFileSync(srtPath, 'utf8').split(/\r?\n\r?\n/).map((b) => b.split(/\r?\n/)).filter((l) => l.length >= 3)
  .map((l) => {const [a, b] = l[1].split(' --> '); return {a: toSec(a), b: toSec(b), text: l.slice(2).join(' ')};}) : [];
const frames = files.map((f, i) => {
  const t = from + i / fps;
  return {f, t: t.toFixed(3), n: Math.round(t * fps), cap: cues.find((c) => t >= c.a && t < c.b)?.text ?? ''};
});
const html = `<!doctype html><meta charset="utf-8"><title>frames ${from}–${to}</title>
<style>body{margin:0;background:#111;color:#eee;font:14px/1.4 system-ui,sans-serif;display:flex;gap:16px;padding:16px}
img#v{width:${width}px;border:1px solid #333} #side{max-width:420px} input{width:100%} .k{color:#9cf} #strip{width:100%;margin-top:12px}</style>
<img id="v"><div id="side"><h2 id="h"></h2><p>← → 逐帧 · Shift+← → 跳 5 帧 · 空格 播放/暂停</p>
<input id="r" type="range" min="0" max="${frames.length - 1}" value="0"><p id="cap"></p>
<p>看什么：预备（反向一点）→ 接触帧 → 压扁 → 回稳；次主体、相机、影子、标签是否按错相晚几帧；同一时刻是否只有一个主事件。</p>
<img id="strip" src="strip.jpg"></div>
<script>const F=${JSON.stringify(frames)};let i=0,play=null;const v=document.getElementById('v'),r=document.getElementById('r');
function show(k){i=Math.max(0,Math.min(F.length-1,k));const x=F[i];v.src=x.f;r.value=i;document.getElementById('h').innerHTML='帧 <span class=k>'+x.n+'</span> · '+x.t+' s';document.getElementById('cap').textContent=x.cap;}
r.oninput=()=>show(+r.value);document.onkeydown=(e)=>{if(e.key==='ArrowRight')show(i+(e.shiftKey?5:1));if(e.key==='ArrowLeft')show(i-(e.shiftKey?5:1));
if(e.key===' '){e.preventDefault();if(play){clearInterval(play);play=null}else play=setInterval(()=>show(i+1<F.length?i+1:0),1000/${Math.round(fps)})}};show(0);</script>`;
fs.writeFileSync(path.join(dir, 'index.html'), html);
console.log(`${frames.length} frames (${from.toFixed(2)}–${to.toFixed(2)} s) -> ${path.relative(process.cwd(), path.join(dir, 'index.html'))} + strip.jpg`);
