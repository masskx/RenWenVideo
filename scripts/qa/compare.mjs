// Side by side (并排对照): a film's frames next to its benchmark and our own recent films, one row each, so two questions
// get an honest look: is it at the benchmark's level, and is it just our last film again? (docs/video-craft/导演方法.md §8)
//   node scripts/qa/compare.mjs <id> [--with=<ref>,<ref>] [--recent=3] [--n=8] [--out=qa/<id>/compare.jpg]
// <id> and refs: a package id under douyin/ (its video.mp4), a path to any .mp4, or a path to an image (a poster, a
// still, a sheet from the reference library) shown as one tile. --recent adds the N most recently changed packages.
import {execFileSync} from 'node:child_process';
import {existsSync, mkdirSync, readdirSync, statSync, rmSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const args = process.argv.slice(2);
const val = (k, d) => args.find((a) => a.startsWith(`--${k}=`))?.slice(k.length + 3) ?? d;
const id = args.find((a) => !a.startsWith('--'));
if (!id) throw new Error('usage: node scripts/qa/compare.mjs <id> [--with=a,b] [--recent=3]');
const n = Number(val('n', 8)), H = 427, W = 240;
const font = ['/root/.local/share/fonts/NotoSansCJKsc-VF.otf', '/usr/share/fonts/truetype/wqy/wqy-zenhei.ttc'].find(existsSync);

const resolve = (ref) => {
  if (existsSync(path.resolve(root, ref))) return path.resolve(root, ref);
  const v = path.join(root, 'douyin', ref, 'video.mp4');
  if (existsSync(v)) return v;
  throw new Error(`not found: ${ref}`);
};
const recent = Number(val('recent', 3));
const others = readdirSync(path.join(root, 'douyin')).filter((d) => d !== id && existsSync(path.join(root, 'douyin', d, 'video.mp4')))
  .sort((a, b) => statSync(path.join(root, 'douyin', b, 'video.mp4')).mtimeMs - statSync(path.join(root, 'douyin', a, 'video.mp4')).mtimeMs).slice(0, recent);
const rows = [id, ...(val('with', '') ? val('with').split(',') : []), ...others];

const tmp = path.join(root, 'qa', id, 'compare-tmp');
rmSync(tmp, {recursive: true, force: true});
mkdirSync(tmp, {recursive: true});
const label = (txt) => (font ? `,drawtext=fontfile=${font}:text='${txt.replace(/[':]/g, ' ')}':x=8:y=8:fontsize=22:fontcolor=white:box=1:boxcolor=black@0.6` : '');
const rowFiles = rows.map((ref, i) => {
  const src = resolve(ref), out = path.join(tmp, `row${i}.png`);
  if (/\.(png|jpe?g|webp)$/i.test(src)) {
    execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', src, '-vf', `scale=-2:${H}${label(ref)},pad=${W * n}:${H}:0:0:black`, '-frames:v', '1', out]);
  } else {
    const dur = Number(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', src], {encoding: 'utf8'}));
    execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', src, '-vf', `fps=${n}/${dur},scale=${W}:${H},tile=${n}x1${label(`${ref} ${dur.toFixed(0)}s`)}`, '-frames:v', '1', out]);
  }
  return out;
});
const out = path.resolve(root, val('out', path.join('qa', id, 'compare.jpg')));
mkdirSync(path.dirname(out), {recursive: true});
execFileSync('ffmpeg', ['-v', 'error', '-y', ...rowFiles.flatMap((f) => ['-i', f]), '-filter_complex', `${rowFiles.map((_, i) => `[${i}:v]`).join('')}vstack=inputs=${rowFiles.length}`, '-q:v', '3', out]);
rmSync(tmp, {recursive: true, force: true});
console.log(`${path.relative(root, out)}  rows: ${rows.join(' · ')}`);
console.log('看两件事：和对标比差在哪（构图、主体大小、字的多少、质感）；和我们最近几支比，结构 / 开场 / 招牌镜头 / 镜头路线 / 配乐形状 / 结尾是不是又一样。');
