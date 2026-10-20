// Renders an explainer composition built by scripts/build-explainer.mjs.
//   node scripts/render-explainer.mjs --composition=AiEra11Rules --out=douyin/ai-era-11-rules/video.mp4
//   node scripts/render-explainer.mjs --composition=AiEra11Rules --still=120 --out=qa/frame.png
// Set REMOTION_BROWSER_EXECUTABLE to a Chrome/headless-shell binary if Remotion cannot download its own.
import {bundle} from '@remotion/bundler';
import {selectComposition, renderMedia, renderStill} from '@remotion/renderer';
import {existsSync, mkdirSync, renameSync, rmSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const value = (name, fallback = '') => args.find((arg) => arg.startsWith(`--${name}=`))?.slice(name.length + 3) ?? fallback;
const compositionId = value('composition', 'AiEra11Rules');
const outputLocation = path.resolve(root, value('out', `out/${compositionId}.mp4`));
const still = value('still');
const browserExecutable = process.env.REMOTION_BROWSER_EXECUTABLE || process.env.REMOTION_BROWSER
  || ['/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell'].find((candidate) => existsSync(candidate))
  || null;

mkdirSync(path.dirname(outputLocation), {recursive: true});
const serveUrl = await bundle({entryPoint: path.join(root, 'src', 'index.ts'), publicDir: path.join(root, 'public')});
const composition = await selectComposition({serveUrl, id: compositionId, browserExecutable});

if (still) {
  for (const frame of still.split(',').map(Number)) {
    const target = still.includes(',') ? outputLocation.replace(/(\.\w+)$/, `-${frame}$1`) : outputLocation;
    await renderStill({serveUrl, composition, frame, output: target, browserExecutable});
    console.log(`still ${frame} -> ${path.relative(root, target)}`);
  }
} else {
  let last = -1;
  await renderMedia({
    serveUrl, composition, codec: 'h264', outputLocation, browserExecutable,
    crf: Number(value('crf', '20')), audioBitrate: '192k', imageFormat: 'jpeg', jpegQuality: 92,
    concurrency: Number(value('concurrency', '0')) || null, overwrite: true,
    onProgress: ({progress}) => {
      const pct = Math.floor(progress * 100);
      if (pct % 10 === 0 && pct !== last) { last = pct; console.log(`render ${pct}%`); }
    }
  });
  // Short-video platforms play around -14..-16 LUFS; normalize the mix, keep the video stream as is.
  const raw = outputLocation.replace(/(\.\w+)$/, '.raw$1');
  renameSync(outputLocation, raw);
  const result = spawnSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', raw, '-c:v', 'copy', '-af', 'loudnorm=I=-15:TP=-1.5:LRA=11', '-ar', '48000', '-c:a', 'aac', '-b:a', '192k', '-movflags', '+faststart', outputLocation], {encoding: 'utf8'});
  if (result.status !== 0) throw new Error(`ffmpeg loudnorm failed: ${result.stderr}`);
  rmSync(raw, {force: true});
  console.log(`rendered ${path.relative(root, outputLocation)}`);
}
