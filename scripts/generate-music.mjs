import {existsSync, readFileSync, mkdirSync, writeFileSync, rmSync} from 'node:fs';
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

const profile = JSON.parse(readFileSync(path.join(root, 'config', 'music-profile.json'), 'utf8').replace(/^\uFEFF/, ''));
const generate = has('generate');
const force = has('force');
const model = value('model', process.env.MINIMAX_MUSIC_MODEL || profile.model);
const prompt = value('prompt', profile.prompt);
const targetSeconds = Number(value('target', profile.targetSeconds));
const outputStem = value('stem', profile.outputStem);
const baseUrl = (process.env.MINIMAX_API_BASE || 'https://api.minimaxi.com/v1').replace(/\/$/, '');
const outputDir = path.join(root, 'public', 'audio', 'music');
const outputPath = path.join(outputDir, `${outputStem}.mp3`);

console.log(`Provider: minimax-music`);
console.log(`Base: ${baseUrl}`);
console.log(`Model: ${model}, instrumental: true`);
console.log(`Target duration: ${targetSeconds.toFixed(3)}s`);
console.log(`Prompt: ${prompt.slice(0, 180)}${prompt.length > 180 ? '…' : ''}`);

const episodeIds = ['slow-life', 'solitude', 'listen-rain', 'morning-tea', 'walk-inward', 'leave-space', 'self-kindness'];
function attachMusic() {
  for (const id of episodeIds) {
    const episodePath = path.join(root, 'episodes', `${id}.json`);
    if (!existsSync(episodePath)) continue;
    const episode = JSON.parse(readFileSync(episodePath, 'utf8').replace(/^\uFEFF/, ''));
    episode.musicSrc = `audio/music/${outputStem}.mp3`;
    episode.musicVolume = profile.volume;
    episode.musicFadeFrames = Math.round(profile.fadeInSeconds * episode.fps);
    writeFileSync(episodePath, `${JSON.stringify(episode, null, 2)}\n`, 'utf8');
  }
}

if (!generate) {
  console.log('Dry run only. Add --generate after confirming MiniMax Music access.');
  process.exit(0);
}
if (!force && existsSync(outputPath)) {
  console.log(`Skipped existing ${path.relative(root, outputPath)}.`);
  attachMusic();
  process.exit(0);
}

const apiKey = process.env.MINIMAX_API_KEY;
if (!apiKey) throw new Error('Missing MINIMAX_API_KEY in the project .env.');

async function fetchWithRetry(url, init, attempts = 3) {
  let lastError;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const response = await fetch(url, {...init, signal: AbortSignal.timeout(10 * 60 * 1000)});
      if (response.status < 500 && response.status !== 429) return response;
      lastError = new Error(`HTTP ${response.status}`);
    } catch (error) {
      lastError = error;
    }
    await new Promise((resolve) => setTimeout(resolve, 2000 * attempt));
  }
  throw lastError;
}

const response = await fetchWithRetry(`${baseUrl}/music_generation`, {
  method: 'POST',
  headers: {Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json'},
  body: JSON.stringify({
    model,
    prompt,
    is_instrumental: true,
    output_format: 'hex',
    audio_setting: {sample_rate: 44100, bitrate: 256000, format: 'mp3'}
  })
});
const body = await response.text();
let payload;
try { payload = JSON.parse(body); } catch { throw new Error(`MiniMax returned non-JSON (HTTP ${response.status}).`); }
const baseResponse = payload.base_resp || {};
if (!response.ok || (baseResponse.status_code ?? 0) !== 0) {
  const message = baseResponse.status_msg || payload.message || payload.error || 'unknown error';
  throw new Error(`MiniMax Music failed (HTTP ${response.status}, code ${baseResponse.status_code ?? 'n/a'}): ${message}`);
}
const audioHex = payload.data?.audio;
if (payload.data?.status !== undefined && payload.data.status !== 2) {
  throw new Error(`MiniMax Music generation incomplete (status=${payload.data.status}).`);
}
if (!audioHex) throw new Error('MiniMax response did not include data.audio.');

mkdirSync(outputDir, {recursive: true});
const rawPath = path.join(outputDir, `${outputStem}.raw.mp3`);
const tempPath = path.join(outputDir, `${outputStem}.fit.mp3`);
writeFileSync(rawPath, Buffer.from(audioHex, 'hex'));

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
  if (!Number.isFinite(seconds) || seconds <= 0) throw new Error(`Invalid music duration: ${result.stdout.trim()}`);
  return seconds;
}

const fadeIn = Number(profile.fadeInSeconds).toFixed(3);
const fadeOut = Number(profile.fadeOutSeconds).toFixed(3);
const fadeOutStart = Math.max(0, targetSeconds - Number(profile.fadeOutSeconds)).toFixed(3);
const filters = [
  'apad',
  `atrim=0:${targetSeconds.toFixed(3)}`,
  'asetpts=PTS-STARTPTS',
  `afade=t=in:st=0:d=${fadeIn}`,
  `afade=t=out:st=${fadeOutStart}:d=${fadeOut}`,
  'aresample=44100'
].join(',');
const ffmpegResult = spawnSync(ffmpeg, ['-hide_banner', '-loglevel', 'error', '-y', '-i', rawPath, '-af', filters, '-t', targetSeconds.toFixed(3), '-codec:a', 'libmp3lame', '-b:a', '256k', tempPath], {encoding: 'utf8', windowsHide: true});
if (ffmpegResult.error || ffmpegResult.status !== 0) throw new Error(`ffmpeg music fit failed: ${ffmpegResult.error?.message || ffmpegResult.stderr}`);
const rawSeconds = probe(rawPath);
rmSync(rawPath, {force: true});
rmSync(outputPath, {force: true});
writeFileSync(outputPath, readFileSync(tempPath));
rmSync(tempPath, {force: true});

attachMusic();
writeFileSync(path.join(outputDir, `${outputStem}.timing.json`), `${JSON.stringify({provider: 'minimax-music', model, outputStem, rawSeconds: Number(rawSeconds.toFixed(3)), targetSeconds, volume: profile.volume, generatedAt: new Date().toISOString()}, null, 2)}\n`, 'utf8');
console.log(`Generated ${path.relative(root, outputPath)}: ${rawSeconds.toFixed(3)}s -> ${targetSeconds.toFixed(3)}s.`);
