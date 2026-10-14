// Render a tutorial video (tutorials/<id>.json + generated <id>.timing.json).
//   node scripts/render-tutorial.mjs tutorials/rea-quickstart.json [--draft] [--stills=120,900] [--overwrite]
// Run scripts/generate-tutorial-voice.py and scripts/generate-tutorial-music.py first.
import {bundle} from '@remotion/bundler';
import {renderMedia, renderStill, selectComposition} from '@remotion/renderer';
import {access, mkdir, readFile, rename, writeFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
process.chdir(root);
const args = process.argv.slice(2);
const draft = args.includes('--draft');
const stillsArg = args.find((a) => a.startsWith('--stills='));
const specFile = args.find((a) => !a.startsWith('--')) ?? 'tutorials/rea-quickstart.json';
const readJson = async (file) => JSON.parse((await readFile(file, 'utf8')).replace(/^﻿/, ''));

const tutorial = await readJson(specFile);
const timing = await readJson(specFile.replace(/\.json$/, '.timing.json'));
if (timing.id !== tutorial.id) throw Error(`Timing file belongs to ${timing.id}, not ${tutorial.id}`);
const missing = tutorial.scenes.filter((s) => !timing.scenes.some((t) => t.id === s.id)).map((s) => s.id);
if (missing.length) throw Error(`Scenes without voice timing: ${missing.join(', ')} — run generate-tutorial-voice.py`);
for (const src of [...timing.scenes.map((s) => s.audioSrc), tutorial.musicSrc].filter(Boolean)) await access(path.join(root, 'public', src));

const inputProps = {tutorial, timing};
const serveUrl = await bundle({entryPoint: path.join(root, 'src/index.ts')});
const browserExecutable = process.env.REMOTION_BROWSER_EXECUTABLE;
await mkdir('out', {recursive: true});

if (stillsArg) {
  const composition = await selectComposition({serveUrl, id: 'Tutorial', inputProps, browserExecutable});
  for (const frame of stillsArg.slice(9).split(',').map(Number)) {
    const output = path.join(root, 'out', `${tutorial.id}-${frame}.png`);
    await renderStill({serveUrl, composition, inputProps, browserExecutable, frame, output});
    console.log(`Saved ${output}`);
  }
  process.exit(0);
}

const cover = await selectComposition({serveUrl, id: 'TutorialCover', inputProps, browserExecutable});
const coverOutput = path.join(root, 'out', `${tutorial.id}-cover.jpg`);
await renderStill({serveUrl, composition: cover, inputProps, browserExecutable, output: coverOutput, imageFormat: 'jpeg', jpegQuality: 92});
console.log(`Saved ${coverOutput}`);

const composition = await selectComposition({serveUrl, id: 'Tutorial', inputProps, browserExecutable});
const outputLocation = path.join(root, 'out', `${tutorial.id}${draft ? '-draft' : ''}.mp4`);
let exists = false;
try { await access(outputLocation); exists = true; } catch {}
if (exists && !args.includes('--overwrite')) { console.log(`Skipped existing ${outputLocation}`); process.exit(0); }
const pending = outputLocation.replace(/\.mp4$/, '.partial.mp4');
let last = -1;
await renderMedia({serveUrl, composition, inputProps, browserExecutable, outputLocation: pending, codec: 'h264', crf: 18,
  audioBitrate: '192k', scale: draft ? 2 / 3 : 1, concurrency: Number(process.env.RENDER_CONCURRENCY ?? 4),
  onProgress: ({progress}) => { const n = Math.floor(progress * 20); if (n !== last) { last = n; console.log(`${tutorial.id}: ${n * 5}%`); } }});
await rename(pending, outputLocation);
console.log(`Saved ${outputLocation}`);

const stamp = (ms) => {
  const t = Math.round(ms);
  return `${String(Math.floor(t / 3600000)).padStart(2, '0')}:${String(Math.floor(t / 60000) % 60).padStart(2, '0')}:${String(Math.floor(t / 1000) % 60).padStart(2, '0')},${String(t % 1000).padStart(3, '0')}`;
};
const captions = timing.scenes.flatMap((s) => s.captions.map((c) => ({...c, startMs: c.startMs + s.startFrame / timing.fps * 1000, endMs: c.endMs + s.startFrame / timing.fps * 1000})));
await writeFile(outputLocation.replace(/\.mp4$/, '.srt'), captions.map((c, i) => `${i + 1}\n${stamp(c.startMs)} --> ${stamp(c.endMs)}\n${c.text}\n`).join('\n'), 'utf8');
await writeFile(outputLocation.replace(/\.mp4$/, '.json'), JSON.stringify({tutorial: tutorial.id, source: tutorial.source, voice: timing.voice,
  output: {width: Math.round(composition.width * (draft ? 2 / 3 : 1)), height: Math.round(composition.height * (draft ? 2 / 3 : 1)),
    frames: composition.durationInFrames, fps: composition.fps}, createdAt: new Date().toISOString()}, null, 2), 'utf8');
