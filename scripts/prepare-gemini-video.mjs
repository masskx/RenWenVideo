import {existsSync, readFileSync, readdirSync, writeFileSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const episodesDir = path.join(root, 'episodes');
const publicDir = path.join(root, 'public');
const args = process.argv.slice(2);
const has = (name) => args.includes(`--${name}`);
const value = (name, fallback = '') => args.find((arg) => arg.startsWith(`--${name}=`))?.slice(name.length + 3) ?? fallback;
const dryRun = has('dry-run');
const audioMode = value('audio', 'mute');
if (!['mute', 'ambience', 'keep'].includes(audioMode)) throw new Error('--audio must be mute, ambience, or keep');
const episodeFilter = value('episode', '');

function readJson(file) {
  return JSON.parse(readFileSync(file, 'utf8').replace(/^\uFEFF/, ''));
}
function writeJson(file, data) {
  writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
}
function candidates(id, index, shotId) {
  const dir = path.join(publicDir, 'video', 'gemini-omni', id);
  return [
    path.join(dir, `${shotId}.mp4`),
    path.join(dir, `${String(index + 1).padStart(2, '0')}-${shotId}.mp4`),
    path.join(dir, `${String(index + 1).padStart(2, '0')}.mp4`)
  ];
}

const episodeFiles = episodeFilter
  ? [`${episodeFilter}.json`]
  : readdirSync(episodesDir).filter((file) => file.endsWith('.json'));
if (episodeFilter && !existsSync(path.join(episodesDir, episodeFiles[0]))) throw new Error(`Episode not found: ${episodeFilter}`);

let changed = 0;
for (const fileName of episodeFiles) {
  const id = fileName.replace(/\.json$/, '');
  const file = path.join(episodesDir, fileName);
  const episode = readJson(file);
  let episodeChanged = false;
  let matched = 0;
  for (const [index, shot] of (episode.shots || []).entries()) {
    const match = candidates(id, index, shot.id).find(existsSync);
    if (!match) continue;
    const rel = path.relative(publicDir, match).split(path.sep).join('/');
    shot.kind = 'video';
    shot.src = rel;
    shot.trimBefore = Number.isInteger(shot.trimBefore) ? shot.trimBefore : 0;
    shot.videoProvider = 'gemini-omni-web';
    shot.videoAudioMode = audioMode;
    shot.videoAudioVolume = audioMode === 'keep' ? 0.28 : 0.08;
    episodeChanged = true;
    matched += 1;
  }
  if (!episodeChanged) continue;
  episode.videoProvider = 'gemini-omni-web';
  episode.videoAudioMode = audioMode;
  episode.videoAudioVolume = audioMode === 'keep' ? 0.28 : 0.08;
  changed += 1;
  console.log(`${dryRun ? '[dry-run] ' : ''}${id}: ${matched} 个 Gemini 动态镜头，原生声=${audioMode}`);
  if (!dryRun) writeJson(file, episode);
}
console.log(`${dryRun ? '将更新' : '已更新'} ${changed} 个 episode。视频目录：public/video/gemini-omni/<episode>/`);
