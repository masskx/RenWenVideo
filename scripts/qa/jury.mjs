// Jury packet (评审包): everything an independent reviewer needs to score a finished film with the rubric in
// docs/video-craft/评审表.md (adapted from mg-styles-15's jury prompt), in one folder, so the review is about the film and
// not about digging for files. Reads the package and the configs; renders nothing new except frame grabs.
//   node scripts/qa/jury.mjs <id> [--with=<benchmark ref>,…] [--previous=<last round's report.md>]      → qa/<id>/jury/
// Contents: sheet.jpg (a frame every 0.5 s, 8 a row), compare.jpg (vs benchmarks and our last three films),
// phone_<t>.png (360 px wide), key_<t>.png (full size: first frame, scene midpoints), jury.md (brief + directing section,
// narration, echo-check result, the rubric prompt). Hand the folder to a reviewer agent (when the user allows one) or
// review it yourself and mark it "自评，非独立".
// Also (motion-video-kit's Gauntlet, docs/video-craft/学习/motion-video-kit.md): cut_<t>.jpg, the 0.4 s around every scene
// boundary at full frame rate (text over text mid-transition is what reviewers miss on settled frames); and with
// --previous, a verification round: the new reviewer gets the last report and marks each item 已修 / 部分 / 还在, lists
// new problems, and ends with SHIP or 再来一轮 (≤ 3 fixes). Give each round to a fresh reviewer, without our reasoning.
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';

const args = process.argv.slice(2);
const id = args.find((a) => !a.startsWith('--'));
if (!id) { console.log('usage: node scripts/qa/jury.mjs <id> [--with=ref,ref]'); process.exit(1); }
const withRefs = args.find((a) => a.startsWith('--with='))?.slice(7);
const previous = args.find((a) => a.startsWith('--previous='))?.slice(11);
if (previous && !fs.existsSync(previous)) throw new Error(`no ${previous}`);
const mp4 = path.join('douyin', id, 'video.mp4');
if (!fs.existsSync(mp4)) throw new Error(`no ${mp4} — render and package first`);
const out = path.join('qa', id, 'jury');
fs.rmSync(out, {recursive: true, force: true});
fs.mkdirSync(out, {recursive: true});
const ff = (a) => execFileSync('ffmpeg', ['-v', 'error', '-y', ...a]);
const run = (cmd, a) => { try { return execFileSync(cmd, a, {encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe']}); } catch (e) { return `${e.stdout ?? ''}${e.stderr ?? ''}`; } };
const dur = Number(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', mp4], {encoding: 'utf8'}));

// Structure: a frame every 0.5 s.
const rows = Math.ceil(dur * 2 / 8);
ff(['-i', mp4, '-vf', `fps=2,scale=200:-1,tile=8x${rows}:padding=4:color=white`, '-frames:v', '1', '-q:v', '3', path.join(out, 'sheet.jpg')]);
// Side by side with benchmarks and our recent films.
run('node', ['scripts/qa/compare.mjs', id, ...(withRefs ? [`--with=${withRefs}`] : []), `--out=${path.join(out, 'compare.jpg')}`]);
// Key frames: frame 0, each scene's middle (from the timeline), the last second.
const tl = fs.existsSync(`tutorials/${id}.timeline.json`) ? JSON.parse(fs.readFileSync(`tutorials/${id}.timeline.json`, 'utf8')) : null;
const keys = [0, ...(tl ? tl.scenes.map((s) => (s.startFrame + s.durationFrames / 2) / tl.fps) : []), Math.max(0, dur - 1)].map((t) => Math.round(t * 10) / 10);
for (const t of keys) {
  ff(['-ss', String(t), '-i', mp4, '-frames:v', '1', path.join(out, `key_${t.toFixed(1)}.png`)]);
  ff(['-ss', String(t), '-i', mp4, '-frames:v', '1', '-vf', 'scale=360:-1', path.join(out, `phone_${t.toFixed(1)}.png`)]);
}
// Transitions: 12 frames over the 0.4 s around each scene boundary.
const cuts = tl ? tl.scenes.slice(1).map((s) => s.startFrame / tl.fps) : [];
for (const t of cuts) ff(['-ss', String(Math.max(0, t - 0.2)), '-t', '0.4', '-i', mp4, '-frames:v', '1', '-vf', 'scale=180:-1,tile=12x1:padding=2:color=white', '-q:v', '3', path.join(out, `cut_${t.toFixed(1)}.jpg`)]);
fs.copyFileSync(mp4, path.join(out, 'video.mp4'));

const sb = [`tutorials/${id}.storyboard.md`, `explainers/${id}.storyboard.md`].find((p) => fs.existsSync(p));
const md = sb ? fs.readFileSync(sb, 'utf8') : '';
const section = (name) => md.split(/\n## /).find((s) => s.startsWith(name))?.replace(/^[^\n]*\n/, '').trim() ?? '（没有）';
const cfg = fs.existsSync(`tutorials/${id}.json`) ? JSON.parse(fs.readFileSync(`tutorials/${id}.json`, 'utf8')) : null;
const narration = cfg ? cfg.scenes.map((s) => `- ${s.id}：${s.narration.replace(/\{[^}]*\}/g, '').replace(/\[([^|\]]*)\|[^\]]*\]/g, '$1')}`).join('\n') : '（没有配置）';
const rubric = fs.readFileSync('docs/video-craft/评审表.md', 'utf8').match(/```text\n([\s\S]*?)```/)?.[1].replace(/<id>/g, id) ?? '';
const echo = cfg ? run('node', ['scripts/qa/echo.mjs', id]).split('\n').filter((l) => l && !/UNDICI|trace-warnings/.test(l)).join('\n') : '';
const brief = run('node', ['scripts/qa/brief.mjs', id]).split('\n').filter((l) => l && !/UNDICI|trace-warnings/.test(l)).join('\n');

fs.writeFileSync(path.join(out, 'jury.md'), `# 评审包：${id}

片长 ${dur.toFixed(1)} 秒。文件：sheet.jpg（每 0.5 秒一帧）、compare.jpg（和对标 / 最近几支并排）、key_*.png（全尺寸）、phone_*.png（手机宽度）、cut_*.jpg（每个转场前后 0.4 秒的逐帧：查字压字、空帧、闪烁）、video.mp4。
${previous ? `
## 核对轮：上一轮的评审报告

逐条判「已修 / 部分 / 还在」并写时间码；再列新问题（转场中途字压字、被裁的字、空帧）；最后一行写 **SHIP** 或 **再来一轮**（最多 3 条要改的）。

${fs.readFileSync(previous, 'utf8')}
` : ''}

## 简报

${section('简报')}

## 导演决定

${section('导演')}

## 镜头表

${section('镜头表')}

## 口播全文

${narration}

## 机器检查

\`\`\`
${brief}
${echo}
\`\`\`

## 评委提示词（docs/video-craft/评审表.md）

${rubric}`);
console.log(`→ ${out}/  (sheet, compare, ${keys.length} key + phone frames, ${cuts.length} transition strips, jury.md${previous ? ', verification round' : ''})`);
console.log('交给评委 agent（用户允许时），或自己按 jury.md 末尾的提示词评，报告里注明“自评，非独立”；分数写进 docs/video-craft/经验.md。');
