// Render a tutorial video from tutorials/<id>.json (+ generated tutorials/<id>.timeline.json)
// into the Douyin package douyin/<id>/ (video.mp4, cover.jpg, subtitles.srt; README.md is the publish copy).
//   node scripts/render-tutorial.mjs <id> [--overwrite] [--crf=22]
//   node scripts/render-tutorial.mjs <id> --draft            -> qa/<id>/video-draft.mp4 (2/3 scale)
//   node scripts/render-tutorial.mjs <id> --stills=120,900   -> qa/<id>/frame-<n>.png
//   node scripts/render-tutorial.mjs <id> --cover-only        -> just the three designed covers (needs coverCard)
// Run scripts/generate-tutorial-voice.py and scripts/generate-tutorial-music.py first.
import {bundle} from '@remotion/bundler';
import {renderMedia, renderStill, selectComposition} from '@remotion/renderer';
import {access, mkdir, readFile, unlink, writeFile} from 'node:fs/promises';
import {existsSync, statSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
process.chdir(root);
const args = process.argv.slice(2);
const draft = args.includes('--draft');
// x264 CRF: constant on-screen motion (particles, beat zoom) costs bits; 22 keeps a ~3.5 min video well under GitHub's 100 MB.
const crf = Number(args.find((a) => a.startsWith('--crf='))?.slice(6) ?? 22);
const stillsArg = args.find((a) => a.startsWith('--stills='));
// Accept an id ("rea-quickstart") or the config path ("tutorials/rea-quickstart.json").
const target = args.find((a) => !a.startsWith('--')) ?? 'rea-quickstart';
const id = path.basename(target, '.json');
const readJson = async (file) => JSON.parse((await readFile(file, 'utf8')).replace(/^﻿/, ''));

// Every film gets a score (docs/video-craft/音效.md §六): compose it when the film has no music yet, or recompose it when
// the voice timeline is newer than its score (the arrangement follows the edit). Films on other music keep it.
// --no-score skips this.
if (!stillsArg && !args.includes('--no-score')) {
  const cfg0 = await readJson(path.join('tutorials', `${id}.json`));
  const scoreRel = `audio/tutorials/${id}/score.mp3`, scoreAbs = path.join(root, 'public', scoreRel);
  const tlAbs = path.join(root, 'tutorials', `${id}.timeline.json`);
  const stale = existsSync(scoreAbs) && existsSync(tlAbs) && statSync(scoreAbs).mtimeMs < statSync(tlAbs).mtimeMs;
  if (!cfg0.musicSrc || (cfg0.musicSrc === scoreRel && (!existsSync(scoreAbs) || stale))) {
    if (!cfg0.score?.mood) console.log(`note: tutorials/${id}.json has no "score": {"mood": …}; composing with the default mood (news)`);
    const py = ['python3', 'python'].find((p) => { try { execFileSync(p, ['--version'], {stdio: 'ignore'}); return true; } catch { return false; } });
    execFileSync(py, ['scripts/generate-score.py', id], {stdio: 'inherit'});
  }
}

const tutorial = await readJson(path.join('tutorials', `${id}.json`));
const timing = await readJson(path.join('tutorials', `${id}.timeline.json`));
if (tutorial.id !== id || timing.id !== id) throw Error(`tutorials/${id}.json and its timeline must both have id "${id}"`);
const missing = tutorial.scenes.filter((s) => !timing.scenes.some((t) => t.id === s.id)).map((s) => s.id);
if (missing.length) throw Error(`Scenes without voice timing: ${missing.join(', ')} — run generate-tutorial-voice.py`);
for (const src of [...timing.scenes.map((s) => s.audioSrc), tutorial.musicSrc].filter(Boolean)) await access(path.join(root, 'public', src));

const inputProps = {tutorial, timing};
const serveUrl = await bundle({entryPoint: path.join(root, 'src/index.ts')});
// Cloud containers: fall back to whichever headless-shell build is installed (the path has changed between images).
const browserExecutable = process.env.REMOTION_BROWSER_EXECUTABLE
  || ['/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell', '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell'].find((c) => existsSync(c));
const packageDir = path.join(root, 'douyin', id);
const qaDir = path.join(root, 'qa', id);

if (stillsArg) {
  await mkdir(qaDir, {recursive: true});
  const composition = await selectComposition({serveUrl, id: 'Tutorial', inputProps, browserExecutable});
  for (const frame of stillsArg.slice(9).split(',').map(Number)) {
    const output = path.join(qaDir, `frame-${frame}.png`);
    await renderStill({serveUrl, composition, inputProps, browserExecutable, frame, output});
    console.log(`Saved ${path.relative(root, output)}`);
  }
  process.exit(0);
}

const outDir = draft ? qaDir : packageDir;
await mkdir(outDir, {recursive: true});
const coverOutput = path.join(outDir, 'cover.jpg');
// A designed cover (tutorial.coverCard, docs/video-craft/封面.md) is laid out per ratio; otherwise freeze a scene.
const coverCard = Boolean(tutorial.coverCard);
if (coverCard) {
  for (const [ratio, comp, file] of [['3:4', 'TutorialCover34', 'cover.jpg'], ['6:7', 'TutorialCover67', 'cover-6x7.jpg'], ['9:16', 'TutorialCover916', 'cover-9x16.jpg']]) {
    const props = {...inputProps, ratio};
    const composition = await selectComposition({serveUrl, id: comp, inputProps: props, browserExecutable});
    await renderStill({serveUrl, composition, inputProps: props, browserExecutable, output: path.join(outDir, file), imageFormat: 'jpeg', jpegQuality: 92});
    console.log(`Saved ${path.relative(root, path.join(outDir, file))}`);
  }
  if (args.includes('--cover-only')) process.exit(0);
} else {
  const cover = await selectComposition({serveUrl, id: 'TutorialCover', inputProps, browserExecutable});
  await renderStill({serveUrl, composition: cover, inputProps, browserExecutable, output: coverOutput, imageFormat: 'jpeg', jpegQuality: 92});
  console.log(`Saved ${path.relative(root, coverOutput)}`);
}

const composition = await selectComposition({serveUrl, id: 'Tutorial', inputProps, browserExecutable});
const outputLocation = path.join(outDir, draft ? 'video-draft.mp4' : 'video.mp4');
let exists = false;
try { await access(outputLocation); exists = true; } catch {}
if (exists && !args.includes('--overwrite')) { console.log(`Skipped existing ${path.relative(root, outputLocation)}`); process.exit(0); }
const pending = outputLocation.replace(/\.mp4$/, '.raw.mp4');
let last = -1;
await renderMedia({serveUrl, composition, inputProps, browserExecutable, outputLocation: pending, codec: 'h264', crf,
  audioBitrate: '192k', scale: draft ? 2 / 3 : 1, concurrency: Number(process.env.RENDER_CONCURRENCY ?? 4), overwrite: true,
  onProgress: ({progress}) => { const n = Math.floor(progress * 20); if (n !== last) { last = n; console.log(`${id}: ${n * 5}%`); } }});
// Short-video platforms play back around -14…-16 LUFS; normalize the mix without touching the video stream.
execFileSync('ffmpeg', ['-y', '-v', 'error', '-i', pending, '-c:v', 'copy', '-af', 'loudnorm=I=-15:TP=-1.5:LRA=11',
  '-c:a', 'aac', '-b:a', '192k', '-ar', '48000', '-movflags', '+faststart', outputLocation]);
await unlink(pending);
console.log(`Saved ${path.relative(root, outputLocation)}`);

// WeChat Channels layout (look.frame "channels"): everything that matters sits in the central 6:7 band, so cut the
// feed version (1080×1260, y 330) from the 9:16 master, and the 3:4 cover (1080×1440, y 240) from the full cover.
if (tutorial.look?.frame === 'channels') {
  const k = draft ? 2 / 3 : 1, r = (v) => Math.round(v * k / 2) * 2;
  const cut = path.join(outDir, draft ? 'video-draft-6x7.mp4' : 'video-6x7.mp4');
  execFileSync('ffmpeg', ['-y', '-v', 'error', '-i', outputLocation, '-vf', `crop=${r(1080)}:${r(1260)}:0:${r(330)}`, '-c:v', 'libx264', '-crf', String(crf),
    '-preset', 'medium', '-pix_fmt', 'yuv420p', '-c:a', 'copy', '-movflags', '+faststart', cut]);
  console.log(`Saved ${path.relative(root, cut)}`);
  if (!coverCard) {
    const full = path.join(outDir, 'cover-9x16.jpg');
    execFileSync('ffmpeg', ['-y', '-v', 'error', '-i', coverOutput, full]);
    execFileSync('ffmpeg', ['-y', '-v', 'error', '-i', full, '-vf', 'crop=1080:1440:0:240', '-q:v', '2', coverOutput]);
    execFileSync('ffmpeg', ['-y', '-v', 'error', '-i', full, '-vf', 'crop=1080:1260:0:330', '-q:v', '2', path.join(outDir, 'cover-6x7.jpg')]);
    console.log(`Saved cover.jpg (3:4), cover-6x7.jpg, cover-9x16.jpg`);
  }
}

const stamp = (ms) => {
  const t = Math.round(ms);
  return `${String(Math.floor(t / 3600000)).padStart(2, '0')}:${String(Math.floor(t / 60000) % 60).padStart(2, '0')}:${String(Math.floor(t / 1000) % 60).padStart(2, '0')},${String(t % 1000).padStart(3, '0')}`;
};
const captions = timing.scenes.flatMap((s) => s.captions.map((c) => ({...c, startMs: c.startMs + s.startFrame / timing.fps * 1000, endMs: c.endMs + s.startFrame / timing.fps * 1000})));
const srt = path.join(outDir, draft ? 'subtitles-draft.srt' : 'subtitles.srt');
await writeFile(srt, captions.map((c, i) => `${i + 1}\n${stamp(c.startMs)} --> ${stamp(c.endMs)}\n${c.text}\n`).join('\n'), 'utf8');
console.log(`Saved ${path.relative(root, srt)}`);
