// Builds assets and a frame timeline for a narrated explainer (explainers/<id>.json).
//   node scripts/build-explainer.mjs --id=ai-era-11-rules --images --voice
// --images  generate missing illustrations with Images2 (OPENAI_API_KEY / OPENAI_BASE_URL)
// --voice   synthesize missing narration segments with CosyVoice (DASHSCOPE_API_KEY)
// --force   regenerate even if files exist
// Always (re)writes explainers/<id>.timeline.json from the audio on disk.
import {existsSync, readFileSync, writeFileSync, mkdirSync, rmSync} from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const has = (name) => args.includes(`--${name}`);
const value = (name, fallback = '') => args.find((arg) => arg.startsWith(`--${name}=`))?.slice(name.length + 3) ?? fallback;

function loadDotEnv(filePath) {
  if (!existsSync(filePath)) return;
  for (const line of readFileSync(filePath, 'utf8').split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
    if (!match || process.env[match[1]]) continue;
    const raw = match[2].trim();
    process.env[match[1]] = ((raw.startsWith('"') && raw.endsWith('"')) || (raw.startsWith("'") && raw.endsWith("'")))
      ? raw.slice(1, -1) : raw;
  }
}
loadDotEnv(path.join(root, '.env'));

const id = value('id', 'ai-era-11-rules');
const force = has('force');
const configPath = path.join(root, 'explainers', `${id}.json`);
const config = JSON.parse(readFileSync(configPath, 'utf8'));
const imageDir = path.join(root, 'public', 'images', 'explainers', id);
const voiceDir = path.join(root, 'public', 'audio', 'explainers', id);
mkdirSync(imageDir, {recursive: true});
mkdirSync(voiceDir, {recursive: true});

async function fetchWithRetry(url, init, attempts = 4) {
  let lastError;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const response = await fetch(url, init);
      if (response.status !== 429 && response.status < 500) return response;
      lastError = new Error(`HTTP ${response.status}`);
    } catch (error) { lastError = error; }
    await new Promise((resolve) => setTimeout(resolve, 2000 * attempt));
  }
  throw lastError;
}

async function pool(items, size, fn) {
  let cursor = 0;
  await Promise.all(Array.from({length: Math.min(size, items.length)}, async () => {
    while (cursor < items.length) await fn(items[cursor++]);
  }));
}

// Keep the repo light: store illustrations as high-quality JPEG instead of multi-MB PNG.
function toJpeg(png, jpg) {
  run('ffmpeg', ['-y', '-loglevel', 'error', '-i', png, '-q:v', '2', jpg]);
  rmSync(png, {force: true});
}

async function generateImage(image) {
  const target = path.join(imageDir, `${image.id}.jpg`);
  const png = path.join(imageDir, `${image.id}.png`);
  if (!force && existsSync(target)) return;
  if (!force && existsSync(png)) return toJpeg(png, target);
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('Missing OPENAI_API_KEY.');
  const baseUrl = (process.env.OPENAI_BASE_URL || 'https://token.stoahayaamhsothy.com/v1').replace(/\/$/, '');
  const response = await fetchWithRetry(`${baseUrl}/images/generations`, {
    method: 'POST',
    headers: {Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json'},
    body: JSON.stringify({model: process.env.OPENAI_IMAGE_MODEL || 'gpt-image-2', prompt: `${image.prompt}. ${config.imageStyle}`, size: '1024x1536', n: 1})
  });
  const payload = await response.json();
  if (!response.ok) throw new Error(`Image ${image.id} failed (HTTP ${response.status}): ${payload.error?.message || 'unknown error'}`);
  const item = payload.data?.[0];
  const bytes = item?.b64_json ? Buffer.from(item.b64_json, 'base64')
    : item?.url ? Buffer.from(await (await fetchWithRetry(item.url)).arrayBuffer()) : null;
  if (!bytes) throw new Error(`Image ${image.id}: no image data returned.`);
  writeFileSync(png, bytes);
  toJpeg(png, target);
  console.log(`image ${image.id}`);
}

async function synthesize(text, target) {
  if (!force && existsSync(target)) return;
  const apiKey = process.env.DASHSCOPE_API_KEY;
  if (!apiKey) throw new Error('Missing DASHSCOPE_API_KEY.');
  const {model, voice, rate, pitch, volume} = config.voice;
  const response = await fetchWithRetry(process.env.DASHSCOPE_TTS_ENDPOINT || 'https://dashscope.aliyuncs.com/api/v1/services/audio/tts/SpeechSynthesizer', {
    method: 'POST',
    headers: {Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json'},
    body: JSON.stringify({model, input: {text: `${text.replace(/[。！？.!?]+$/u, '')}。`, voice, format: 'mp3', sample_rate: 44100, rate, pitch, volume, language_hints: ['zh']}})
  });
  const payload = await response.json();
  if (!response.ok) throw new Error(`TTS failed (HTTP ${response.status}): ${payload.message || payload.code}`);
  const audio = payload.output?.audio;
  const bytes = audio?.data ? Buffer.from(audio.data, 'base64')
    : audio?.url ? Buffer.from(await (await fetchWithRetry(audio.url)).arrayBuffer()) : null;
  if (!bytes) throw new Error('TTS response did not include audio.');
  writeFileSync(target, bytes);
  console.log(`voice ${path.basename(target)}: ${text}`);
}

function run(bin, params) {
  const result = spawnSync(bin, params, {encoding: 'utf8'});
  if (result.error || result.status !== 0) throw new Error(`${bin} failed: ${result.error?.message || result.stderr}`);
  return result.stdout;
}
const probe = (file) => Number(run('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', file]).trim());

const segments = config.scenes.flatMap((scene) => scene.lines.map((text, index) => ({
  scene: scene.id, index, text, file: path.join(voiceDir, `${scene.id}-${String(index + 1).padStart(2, '0')}.mp3`)
})));

if (has('images')) await pool(config.scenes.flatMap((scene) => scene.images), Number(value('concurrency', '4')), generateImage);
if (has('voice')) await pool(segments, 3, (segment) => synthesize(segment.text, segment.file));

// Timeline: segments back to back with a short gap, a longer pause between scenes,
// and a tail so the last caption and the outro card can breathe.
const {fps} = config;
const gap = config.voice.gapSeconds ?? 0.12;
const sceneLead = 0.25;
const tail = 1.6;
const missing = segments.filter((segment) => !existsSync(segment.file));
if (missing.length) throw new Error(`Missing ${missing.length} narration segments; run with --voice.`);

let cursor = 0;
const captions = [];
const scenes = [];
const concatInputs = [];
for (const scene of config.scenes) {
  const sceneStart = cursor;
  cursor += sceneLead;
  const lineTimes = [];
  for (const segment of segments.filter((s) => s.scene === scene.id)) {
    const seconds = probe(segment.file);
    const start = cursor;
    concatInputs.push({file: segment.file, at: start});
    captions.push({text: segment.text, startMs: Math.round(start * 1000), endMs: Math.round((start + seconds) * 1000), timestampMs: null, confidence: null});
    lineTimes.push(start);
    cursor += seconds + gap;
  }
  if (scene === config.scenes.at(-1)) cursor += tail;
  const from = Math.round(sceneStart * fps);
  const to = Math.round(cursor * fps);
  const split = scene.split ?? 0;
  const imageSwitch = scene.images.length > 1 && split > 0 ? Math.round(lineTimes[split] * fps) - from : null;
  const {images, ...rest} = scene;
  delete rest.lines;
  scenes.push({...rest, from, durationInFrames: to - from, images: images.map((image) => `images/explainers/${id}/${image.id}.jpg`), imageSwitch});
}
const totalSeconds = cursor;

// Mix the narration into a single track with silence between segments.
const narrationPath = path.join(voiceDir, 'narration.mp3');
const filter = concatInputs.map((input, i) => `[${i}:a]aresample=44100,aformat=channel_layouts=stereo,adelay=${Math.round(input.at * 1000)}:all=1[a${i}]`).join(';')
  + `;${concatInputs.map((_, i) => `[a${i}]`).join('')}amix=inputs=${concatInputs.length}:normalize=0,apad,atrim=0:${totalSeconds.toFixed(3)}[out]`;
const filterPath = path.join(voiceDir, '_mix.txt');
writeFileSync(filterPath, filter);
run('ffmpeg', ['-y', ...concatInputs.flatMap((input) => ['-i', input.file]), '-filter_complex_script', filterPath, '-map', '[out]', '-c:a', 'libmp3lame', '-b:a', '192k', narrationPath]);
rmSync(filterPath, {force: true});

// Music bed: chain the listed tracks with crossfades, trim to length, fade in/out.
let musicSrc = null;
if (config.music?.tracks?.length) {
  musicSrc = `audio/explainers/${id}/music-bed.mp3`;
  const tracks = config.music.tracks.map((track) => path.join(root, 'public', track));
  const crossfade = config.music.crossfadeSeconds ?? 6;
  let chain = '[0:a]aformat=channel_layouts=stereo[m0]';
  for (let i = 1; i < tracks.length; i += 1) chain += `;[m${i - 1}][${i}:a]acrossfade=d=${crossfade}[m${i}]`;
  chain += `;[m${tracks.length - 1}]atrim=0:${totalSeconds.toFixed(3)},afade=t=in:d=1.5,afade=t=out:st=${(totalSeconds - 3.5).toFixed(3)}:d=3.5[out]`;
  run('ffmpeg', ['-y', ...tracks.flatMap((track) => ['-i', track]), '-filter_complex', chain, '-map', '[out]', '-c:a', 'libmp3lame', '-b:a', '192k', path.join(root, 'public', musicSrc)]);
}

const timeline = {
  id, title: config.title, series: config.series, source: config.source, quoteLabel: config.quoteLabel,
  fps, width: config.width, height: config.height,
  durationInFrames: Math.round(totalSeconds * fps),
  chapterCount: config.scenes.filter((scene) => scene.kind === 'chapter').length,
  audioSrc: `audio/explainers/${id}/narration.mp3`,
  music: musicSrc ? {src: musicSrc, volume: config.music.volume ?? 0.08} : null,
  scenes, captions
};
writeFileSync(path.join(root, 'explainers', `${id}.timeline.json`), `${JSON.stringify(timeline, null, 2)}\n`);
console.log(`timeline: ${scenes.length} scenes, ${captions.length} captions, ${totalSeconds.toFixed(2)}s`);
