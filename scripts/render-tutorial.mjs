// Render a tutorial video from tutorials/<id>.json (+ generated tutorials/<id>.timeline.json)
// into the Douyin package douyin/<id>/ (video.mp4, cover.jpg, subtitles.srt; README.md is the publish copy).
//   node scripts/render-tutorial.mjs <id> [--overwrite]
//   node scripts/render-tutorial.mjs <id> --draft            -> qa/<id>/video-draft.mp4 (2/3 scale)
//   node scripts/render-tutorial.mjs <id> --stills=120,900   -> qa/<id>/frame-<n>.png
// Run scripts/generate-tutorial-voice.py and scripts/generate-tutorial-music.py first.
import {bundle} from '@remotion/bundler';
import {renderMedia, renderStill, selectComposition} from '@remotion/renderer';
import {access, mkdir, readFile, unlink, writeFile} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
process.chdir(root);
const args = process.argv.slice(2);
const draft = args.includes('--draft');
const stillsArg = args.find((a) => a.startsWith('--stills='));
// Accept an id ("rea-quickstart") or the config path ("tutorials/rea-quickstart.json").
const target = args.find((a) => !a.startsWith('--')) ?? 'rea-quickstart';
const id = path.basename(target, '.json');
const readJson = async (file) => JSON.parse((await readFile(file, 'utf8')).replace(/^﻿/, ''));

const tutorial = await readJson(path.join('tutorials', `${id}.json`));
const timing = await readJson(path.join('tutorials', `${id}.timeline.json`));
if (tutorial.id !== id || timing.id !== id) throw Error(`tutorials/${id}.json and its timeline must both have id "${id}"`);
const missing = tutorial.scenes.filter((s) => !timing.scenes.some((t) => t.id === s.id)).map((s) => s.id);
if (missing.length) throw Error(`Scenes without voice timing: ${missing.join(', ')} — run generate-tutorial-voice.py`);
for (const src of [...timing.scenes.map((s) => s.audioSrc), tutorial.musicSrc].filter(Boolean)) await access(path.join(root, 'public', src));

const inputProps = {tutorial, timing};
const serveUrl = await bundle({entryPoint: path.join(root, 'src/index.ts')});
const browserExecutable = process.env.REMOTION_BROWSER_EXECUTABLE;
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
const cover = await selectComposition({serveUrl, id: 'TutorialCover', inputProps, browserExecutable});
const coverOutput = path.join(outDir, 'cover.jpg');
await renderStill({serveUrl, composition: cover, inputProps, browserExecutable, output: coverOutput, imageFormat: 'jpeg', jpegQuality: 92});
console.log(`Saved ${path.relative(root, coverOutput)}`);

const composition = await selectComposition({serveUrl, id: 'Tutorial', inputProps, browserExecutable});
const outputLocation = path.join(outDir, draft ? 'video-draft.mp4' : 'video.mp4');
let exists = false;
try { await access(outputLocation); exists = true; } catch {}
if (exists && !args.includes('--overwrite')) { console.log(`Skipped existing ${path.relative(root, outputLocation)}`); process.exit(0); }
const pending = outputLocation.replace(/\.mp4$/, '.raw.mp4');
let last = -1;
await renderMedia({serveUrl, composition, inputProps, browserExecutable, outputLocation: pending, codec: 'h264', crf: 18,
  audioBitrate: '192k', scale: draft ? 2 / 3 : 1, concurrency: Number(process.env.RENDER_CONCURRENCY ?? 4), overwrite: true,
  onProgress: ({progress}) => { const n = Math.floor(progress * 20); if (n !== last) { last = n; console.log(`${id}: ${n * 5}%`); } }});
// Short-video platforms play back around -14…-16 LUFS; normalize the mix without touching the video stream.
execFileSync('ffmpeg', ['-y', '-v', 'error', '-i', pending, '-c:v', 'copy', '-af', 'loudnorm=I=-15:TP=-1.5:LRA=11',
  '-c:a', 'aac', '-b:a', '192k', '-ar', '48000', '-movflags', '+faststart', outputLocation]);
await unlink(pending);
console.log(`Saved ${path.relative(root, outputLocation)}`);

const stamp = (ms) => {
  const t = Math.round(ms);
  return `${String(Math.floor(t / 3600000)).padStart(2, '0')}:${String(Math.floor(t / 60000) % 60).padStart(2, '0')}:${String(Math.floor(t / 1000) % 60).padStart(2, '0')},${String(t % 1000).padStart(3, '0')}`;
};
const captions = timing.scenes.flatMap((s) => s.captions.map((c) => ({...c, startMs: c.startMs + s.startFrame / timing.fps * 1000, endMs: c.endMs + s.startFrame / timing.fps * 1000})));
const srt = path.join(outDir, draft ? 'subtitles-draft.srt' : 'subtitles.srt');
await writeFile(srt, captions.map((c, i) => `${i + 1}\n${stamp(c.startMs)} --> ${stamp(c.endMs)}\n${c.text}\n`).join('\n'), 'utf8');
console.log(`Saved ${path.relative(root, srt)}`);
