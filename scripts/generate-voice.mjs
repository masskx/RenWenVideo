import {existsSync, readFileSync, mkdirSync, writeFileSync, rmSync} from 'node:fs';
import {readFile, stat} from 'node:fs/promises';
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
      ? raw.slice(1, -1)
      : raw;
  }
}
loadDotEnv(path.join(root, '.env'));

const episodeId = value('episode', 'slow-life');
const provider = value('provider', 'dashscope-tts');
const generate = has('generate');
const force = has('force');
const noUpdate = has('no-update');
if (provider !== 'dashscope-tts') throw new Error(`Unsupported TTS provider: ${provider}.`);

const episodePath = path.join(root, 'episodes', `${episodeId}.json`);
if (!existsSync(episodePath)) throw new Error(`Episode not found: ${episodeId}.`);
const episode = JSON.parse(readFileSync(episodePath, 'utf8').replace(/^\uFEFF/, ''));
const targetSeconds = Math.max(...episode.shots.map((shot) => shot.start + shot.duration)) / episode.fps;
const text = episode.captions.map((caption) => caption.text.trim()).filter(Boolean).join('。') + '。';
const model = process.env.DASHSCOPE_TTS_MODEL || 'cosyvoice-v3-flash';
const voice = value('voice', process.env.DASHSCOPE_TTS_VOICE || 'longxiu_v3');
const rate = Number(value('rate', process.env.DASHSCOPE_TTS_RATE || '0.94'));
const pitch = Number(value('pitch', process.env.DASHSCOPE_TTS_PITCH || '0.96'));
const volume = Number(value('volume', process.env.DASHSCOPE_TTS_VOLUME || '65'));
const instruction = value('instruction', process.env.DASHSCOPE_TTS_INSTRUCTION || '');
const suffix = value('suffix', '');
const endpoint = process.env.DASHSCOPE_TTS_ENDPOINT || 'https://dashscope.aliyuncs.com/api/v1/services/audio/tts/SpeechSynthesizer';
const outputDir = path.join(root, 'public', 'audio');
const outputStem = suffix ? `${episodeId}-${suffix}` : episodeId;
const outputPath = path.join(outputDir, `${outputStem}.mp3`);

console.log(`Episode: ${episodeId}`);
console.log(`Provider: ${provider}`);
console.log(`Model: ${model}, voice: ${voice}, rate: ${rate}, pitch: ${pitch}`);
if (instruction) console.log(`Instruction: ${instruction}`);
console.log(`Target duration: ${targetSeconds.toFixed(3)}s`);
console.log(`Text: ${text.length} Chinese characters`);
if (!generate) {
  console.log('Dry run only. Add --generate to call DashScope and write audio.');
  process.exit(0);
}

if (!force && existsSync(outputPath) && (suffix || episode.audioSrc === `audio/${episodeId}.mp3`)) {
  console.log(`Skipped existing ${path.relative(root, outputPath)}.`);
  process.exit(0);
}

const apiKey = process.env.DASHSCOPE_API_KEY;
if (!apiKey) throw new Error('Missing DASHSCOPE_API_KEY in the project .env.');

async function fetchWithRetry(url, init, attempts = 4) {
  let lastError;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const response = await fetch(url, init);
      if (response.status !== 429 && response.status < 500) return response;
      lastError = new Error(`HTTP ${response.status}`);
    } catch (error) {
      lastError = error;
    }
    await new Promise((resolve) => setTimeout(resolve, 1200 * attempt));
  }
  throw lastError;
}

const response = await fetchWithRetry(endpoint, {
  method: 'POST',
  headers: {Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json'},
  body: JSON.stringify({
    model,
    input: {
      text,
      voice,
      format: 'mp3',
      sample_rate: 44100,
      rate,
      pitch,
      volume,
      language_hints: ['zh'],
      ...(instruction ? {instruction} : {})
    }
  })
});
const body = await response.text();
let payload;
try { payload = JSON.parse(body); }
catch { throw new Error(`DashScope returned non-JSON (HTTP ${response.status}).`); }
if (!response.ok) throw new Error(`DashScope TTS failed (HTTP ${response.status}): ${payload.message || payload.code || 'unknown error'}`);

let audioBytes;
const audioData = payload.output?.audio?.data;
if (audioData) audioBytes = Buffer.from(audioData, 'base64');
else if (payload.output?.audio?.url) {
  const audioResponse = await fetchWithRetry(payload.output.audio.url);
  if (!audioResponse.ok) throw new Error(`Audio download failed (HTTP ${audioResponse.status}).`);
  audioBytes = Buffer.from(await audioResponse.arrayBuffer());
} else throw new Error('DashScope response did not include audio data.');

mkdirSync(outputDir, {recursive: true});
const rawPath = path.join(outputDir, `${outputStem}.raw.mp3`);
const temporaryPath = path.join(outputDir, `${outputStem}.fit.mp3`);
writeFileSync(rawPath, audioBytes);

function resolveBinary(name, bundledName) {
  const configured = process.env[name];
  if (configured && existsSync(configured)) return configured;
  const bundled = path.join(root, 'node_modules', '@remotion', 'compositor-win32-x64-msvc', bundledName);
  return existsSync(bundled) ? bundled : (process.platform === 'win32' ? `${bundledName}` : bundledName.replace(/\.exe$/, ''));
}

const ffprobe = resolveBinary('FFPROBE_PATH', process.platform === 'win32' ? 'ffprobe.exe' : 'ffprobe');
const ffmpeg = resolveBinary('FFMPEG_PATH', process.platform === 'win32' ? 'ffmpeg.exe' : 'ffmpeg');
function probe(filePath) {
  const result = spawnSync(ffprobe, ['-v', 'error', '-show_entries', 'format=duration', '-of', 'default=nw=1:nk=1', filePath], {encoding: 'utf8', windowsHide: true});
  if (result.error || result.status !== 0) throw new Error(`ffprobe failed: ${result.error?.message || result.stderr}`);
  const seconds = Number(result.stdout.trim());
  if (!Number.isFinite(seconds) || seconds <= 0) throw new Error(`Invalid audio duration: ${result.stdout.trim()}`);
  return seconds;
}
function atempoChain(factor) {
  const filters = [];
  while (factor > 2) { filters.push('atempo=2'); factor /= 2; }
  while (factor < 0.5) { filters.push('atempo=0.5'); factor /= 0.5; }
  if (Math.abs(factor - 1) > 0.002) filters.push(`atempo=${factor.toFixed(6)}`);
  return filters;
}

const rawSeconds = probe(rawPath);
const factor = rawSeconds / targetSeconds;
const filters = [...atempoChain(factor), 'apad'];
const ffmpegResult = spawnSync(ffmpeg, ['-hide_banner', '-loglevel', 'error', '-y', '-i', rawPath, '-af', filters.join(','), '-t', targetSeconds.toFixed(3), '-codec:a', 'libmp3lame', '-b:a', '192k', temporaryPath], {encoding: 'utf8', windowsHide: true});
if (ffmpegResult.error || ffmpegResult.status !== 0) throw new Error(`ffmpeg audio fit failed: ${ffmpegResult.error?.message || ffmpegResult.stderr}`);
rmSync(rawPath, {force: true});
rmSync(outputPath, {force: true});
writeFileSync(outputPath, readFileSync(temporaryPath));
rmSync(temporaryPath, {force: true});

if (!noUpdate && !suffix) {
  episode.audioSrc = `audio/${episodeId}.mp3`;
  writeFileSync(episodePath, `${JSON.stringify(episode, null, 2)}\n`, 'utf8');
}
const timingPath = path.join(outputDir, `${outputStem}.timing.json`);
writeFileSync(timingPath, `${JSON.stringify({episodeId, provider, model, voice, rawSeconds: Number(rawSeconds.toFixed(3)), targetSeconds: Number(targetSeconds.toFixed(3)), atempoFactor: Number(factor.toFixed(6)), generatedAt: new Date().toISOString()}, null, 2)}\n`, 'utf8');
console.log(`Generated ${path.relative(root, outputPath)}: ${rawSeconds.toFixed(3)}s -> ${targetSeconds.toFixed(3)}s.`);
