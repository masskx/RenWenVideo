import {existsSync, readFileSync, mkdirSync, writeFileSync, rmSync} from 'node:fs';
import {readFile, writeFile, mkdir} from 'node:fs/promises';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const has = (name) => args.includes(`--${name}`);
const value = (name, fallback = '') => args.find((arg) => arg.startsWith(`--${name}=`))?.slice(name.length + 3) ?? fallback;
const selectedEpisodes = value('episodes', value('episode', 'slow-life')).split(',').map((id) => id.trim()).filter(Boolean);
const generate = has('generate');
const apply = has('apply');
const force = has('force');
const voice = value('voice', process.env.DASHSCOPE_TTS_VOICE || 'longsanshu_v3');
const rate = Number(value('rate', process.env.DASHSCOPE_TTS_RATE || '1.04'));
const pitch = Number(value('pitch', process.env.DASHSCOPE_TTS_PITCH || '0.96'));
const volume = Number(value('volume', process.env.DASHSCOPE_TTS_VOLUME || '65'));
const gapSeconds = Number(value('gap', '0.08'));
const targetSeconds = Number(value('target', '33.48'));
const maxFitFactor = Number(value('max-fit', '1.08'));
const model = process.env.DASHSCOPE_TTS_MODEL || 'cosyvoice-v3-flash';
const endpoint = process.env.DASHSCOPE_TTS_ENDPOINT || 'https://dashscope.aliyuncs.com/api/v1/services/audio/tts/SpeechSynthesizer';
const copyMap = JSON.parse(readFileSync(path.join(root, 'config', 'narration-copies.json'), 'utf8'));

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

function resolveBinary(name, bundledName) {
  const configured = process.env[name];
  const bundled = path.join(root, 'node_modules', '@remotion', 'compositor-win32-x64-msvc', bundledName);
  return configured && existsSync(configured) ? configured : existsSync(bundled) ? bundled : bundledName;
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

async function fetchWithRetry(url, init, attempts = 4) {
  let lastError;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const response = await fetch(url, init);
      if (response.status !== 429 && response.status < 500) return response;
      lastError = new Error(`HTTP ${response.status}`);
    } catch (error) { lastError = error; }
    await new Promise((resolve) => setTimeout(resolve, 1200 * attempt));
  }
  throw lastError;
}

async function synthesize(text) {
  const apiKey = process.env.DASHSCOPE_API_KEY;
  if (!apiKey) throw new Error('Missing DASHSCOPE_API_KEY in the project .env.');
  const response = await fetchWithRetry(endpoint, {
    method: 'POST',
    headers: {Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json'},
    body: JSON.stringify({
      model,
      input: {text: `${text.replace(/[。！？.!?]+$/u, '')}。`, voice, format: 'mp3', sample_rate: 44100, rate, pitch, volume, language_hints: ['zh']}
    })
  });
  const body = await response.text();
  let payload;
  try { payload = JSON.parse(body); } catch { throw new Error(`DashScope returned non-JSON (HTTP ${response.status}).`); }
  if (!response.ok) throw new Error(`DashScope TTS failed (HTTP ${response.status}): ${payload.message || payload.code || 'unknown error'}`);
  if (payload.output?.audio?.data) return Buffer.from(payload.output.audio.data, 'base64');
  if (payload.output?.audio?.url) {
    const audioResponse = await fetchWithRetry(payload.output.audio.url);
    if (!audioResponse.ok) throw new Error(`Audio download failed (HTTP ${audioResponse.status}).`);
    return Buffer.from(await audioResponse.arrayBuffer());
  }
  throw new Error('DashScope response did not include audio data.');
}

function runFfmpeg(args) {
  const result = spawnSync(ffmpeg, args, {encoding: 'utf8', windowsHide: true});
  if (result.error || result.status !== 0) throw new Error(`ffmpeg failed: ${result.error?.message || result.stderr}`);
}

async function renderEpisode(id) {
  const episodePath = path.join(root, 'episodes', `${id}.json`);
  if (!existsSync(episodePath)) throw new Error(`Episode not found: ${id}`);
  const episode = JSON.parse(readFileSync(episodePath, 'utf8').replace(/^\uFEFF/, ''));
  const texts = copyMap[id];
  if (!Array.isArray(texts) || texts.length !== episode.captions.length) throw new Error(`Caption copy count mismatch: ${id}`);
  const segmentDir = path.join(root, 'public', 'audio', 'segmented', id);
  const outputPath = path.join(root, 'public', 'audio', `${id}-segmented.mp3`);
  const assembledPath = path.join(segmentDir, '_assembled.wav');
  await mkdir(segmentDir, {recursive: true});
  await mkdir(path.join(root, 'public', 'audio'), {recursive: true});

  const segmentPaths = [];
  if (generate) {
    console.log(`${id}: synthesizing ${texts.length} caption segments with ${voice} @ ${rate}`);
    for (let index = 0; index < texts.length; index += 1) {
      const segmentPath = path.join(segmentDir, `${String(index + 1).padStart(2, '0')}.mp3`);
      if (!force && existsSync(segmentPath)) {
        console.log(`${id}: reuse segment ${index + 1}/${texts.length}`);
      } else {
        writeFileSync(segmentPath, await synthesize(texts[index]));
        console.log(`${id}: generated segment ${index + 1}/${texts.length}`);
      }
      segmentPaths.push(segmentPath);
    }
  } else {
    for (let index = 0; index < texts.length; index += 1) segmentPaths.push(path.join(segmentDir, `${String(index + 1).padStart(2, '0')}.mp3`));
  }
  if (segmentPaths.some((filePath) => !existsSync(filePath))) throw new Error(`${id}: missing segment audio; run with --generate`);

  const segmentDurations = segmentPaths.map(probe);
  const inputArgs = [];
  const filterParts = [];
  const concatLabels = [];
  let inputIndex = 0;
  for (let index = 0; index < segmentPaths.length; index += 1) {
    inputArgs.push('-i', segmentPaths[index]);
    filterParts.push(`[${inputIndex}:a]aresample=44100,aformat=sample_fmts=fltp:sample_rates=44100:channel_layouts=stereo[s${index}]`);
    concatLabels.push(`[s${index}]`);
    inputIndex += 1;
    if (index < segmentPaths.length - 1 && gapSeconds > 0) {
      inputArgs.push('-f', 'lavfi', '-t', String(gapSeconds), '-i', 'anullsrc=r=44100:cl=stereo');
      filterParts.push(`[${inputIndex}:a]aresample=44100,aformat=sample_fmts=fltp:sample_rates=44100:channel_layouts=stereo[g${index}]`);
      concatLabels.push(`[g${index}]`);
      inputIndex += 1;
    }
  }
  filterParts.push(`${concatLabels.join('')}concat=n=${concatLabels.length}:v=0:a=1[aout]`);
  runFfmpeg([...inputArgs, '-filter_complex', filterParts.join(';'), '-map', '[aout]', '-ar', '44100', '-ac', '2', '-c:a', 'pcm_s16le', '-y', assembledPath]);
  const assembledSeconds = probe(assembledPath);
  const fitFactor = Math.max(1, assembledSeconds / targetSeconds);
  if (fitFactor > maxFitFactor) throw new Error(`${id}: segmented narration is ${assembledSeconds.toFixed(2)}s; fit factor ${fitFactor.toFixed(3)} exceeds ${maxFitFactor}`);

  const captions = [];
  let cursor = 0;
  for (let index = 0; index < texts.length; index += 1) {
    const start = cursor / fitFactor;
    const end = (cursor + segmentDurations[index]) / fitFactor;
    captions.push({text: texts[index], startMs: Math.round(start * 1000), endMs: Math.round(end * 1000), timestampMs: null, confidence: null});
    cursor += segmentDurations[index];
    if (index < texts.length - 1) cursor += gapSeconds;
  }
  const audioFilters = fitFactor > 1.002 ? [`atempo=${fitFactor.toFixed(6)}`] : [];
  audioFilters.push('apad');
  runFfmpeg(['-i', assembledPath, '-af', audioFilters.join(','), '-t', targetSeconds.toFixed(3), '-codec:a', 'libmp3lame', '-b:a', '192k', '-y', outputPath]);
  const finalSeconds = probe(outputPath);
  writeFileSync(path.join(root, 'public', 'audio', `${id}-segmented.timing.json`), `${JSON.stringify({episodeId: id, model, voice, rate, pitch, gapSeconds, targetSeconds, assembledSeconds: Number(assembledSeconds.toFixed(3)), fitFactor: Number(fitFactor.toFixed(6)), finalSeconds: Number(finalSeconds.toFixed(3)), captions}, null, 2)}\n`);
  if (apply) {
    episode.audioSrc = `audio/${id}-segmented.mp3`;
    episode.captions = captions;
    writeFileSync(episodePath, `${JSON.stringify(episode, null, 2)}\n`);
  }
  rmSync(assembledPath, {force: true});
  console.log(`${id}: ${assembledSeconds.toFixed(3)}s assembled -> ${finalSeconds.toFixed(3)}s, fit ${fitFactor.toFixed(3)}${apply ? ' (applied)' : ''}`);
}

if (!generate) console.log(`Dry run only. Add --generate to synthesize ${selectedEpisodes.length} episode(s), --apply to update captions/audio.`);
for (const id of selectedEpisodes) await renderEpisode(id);
