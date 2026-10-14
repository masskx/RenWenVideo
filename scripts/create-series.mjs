import {existsSync, readFileSync, mkdirSync, writeFileSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const spec = JSON.parse(readFileSync(path.join(root, 'config', 'replication-spec.json'), 'utf8').replace(/^\uFEFF/, ''));
const series = JSON.parse(readFileSync(path.join(root, 'config', 'series-themes.json'), 'utf8').replace(/^\uFEFF/, ''));
const musicProfile = JSON.parse(readFileSync(path.join(root, 'config', 'music-profile.json'), 'utf8').replace(/^\uFEFF/, ''));
const musicLibraryPath = path.join(root, 'config', 'music-library.json');
const musicLibrary = existsSync(musicLibraryPath)
  ? JSON.parse(readFileSync(musicLibraryPath, 'utf8').replace(/^\uFEFF/, ''))
  : null;
const baseEpisode = JSON.parse(readFileSync(path.join(root, 'episodes', 'slow-life.json'), 'utf8').replace(/^\uFEFF/, ''));
const subjectById = new Map(spec.shots.map((shot) => [shot.id, shot.subject]));
const timingByIndex = baseEpisode.shots.map((shot) => ({
  id: shot.id,
  start: shot.start,
  duration: shot.duration,
  zoomFrom: shot.zoomFrom,
  zoomTo: shot.zoomTo,
  panX: shot.panX
}));
const captionTiming = baseEpisode.captions.map((caption) => ({startMs: caption.startMs, endMs: caption.endMs}));
const args = new Set(process.argv.slice(2));
const episodeFilter = process.argv.find((arg) => arg.startsWith('--episode='))?.slice('--episode='.length);

const fileName = (index, shotId) => `${String(index + 1).padStart(2, '0')}-${shotId}.png`;
const promptHeader = (episode) => [
  'Photorealistic cinematic Chinese quiet-life photography for a Douyin philosophical life-reflection short video.',
  'Vertical 9:16 portrait composition, 50mm or 85mm lens, shallow depth of field, restrained natural colors, subtle fine film texture, believable real materials and geometry.',
  `Theme: ${episode.visualTheme}`,
  'Keep the composition calm and uncluttered around the lower-middle subtitle safe area near 70 percent image height.',
  'No people unless the shot explicitly calls for a partial hand or feet; never show a face.',
  'No text, letters, numbers, logos, watermarks, borders, collage or UI elements. Real location photography, not illustration.'
].join(' ');

function resolveMusic(id, episode) {
  const mappedId = episode.musicTrack || musicLibrary?.episodeMap?.[id]?.[0] || musicProfile.id || musicProfile.outputStem;
  const track = musicLibrary?.tracks?.find((candidate) => candidate.id === mappedId);
  const file = track?.file || `${musicProfile.outputStem}.mp3`;
  const musicPath = path.join(root, 'public', 'audio', 'music', file);
  if (!existsSync(musicPath)) return {id: mappedId, src: null};
  return {
    id: mappedId,
    src: `audio/music/${file}`,
    volume: track?.volume ?? musicLibrary?.defaults?.volume ?? musicProfile.volume,
    fadeInSeconds: track?.fadeInSeconds ?? musicLibrary?.defaults?.fadeInSeconds ?? musicProfile.fadeInSeconds
  };
}

function createEpisode(id, episode) {
  const useBaseline = Boolean(episode.reuseBaselineAssets);
  const audioSrc = existsSync(path.join(root, 'public', 'audio', `${id}.mp3`)) ? `audio/${id}.mp3` : null;
  const music = resolveMusic(id, episode);
  const shots = timingByIndex.map((shot, index) => ({
    ...shot,
    src: useBaseline ? `images/${fileName(index, shot.id)}` : `images/series/${id}/${fileName(index, shot.id)}`,
    kind: 'image'
  }));
  return {
    id,
    title: episode.title,
    fps: spec.canvas.fps,
    width: spec.canvas.width,
    height: spec.canvas.height,
    titleEnd: spec.title.endFrame,
    transitionFrames: spec.transitionFrames,
    subtitleY: spec.subtitle.y,
    subtitleSize: spec.subtitle.fontSize,
    audioSrc,
    videoProvider: spec.media?.videoProvider || 'gemini-omni-web',
    videoAudioMode: spec.media?.defaultVideoAudio || 'mute',
    videoAudioVolume: spec.media?.ambienceVolume ?? 0.08,
    musicSrc: music.src,
    musicId: music.src ? music.id : null,
    ...(music.src ? {
      musicVolume: music.volume,
      musicFadeFrames: Math.round(music.fadeInSeconds * spec.canvas.fps)
    } : {}),
    shots,
    captions: episode.captions.map((text, index) => ({
      text,
      startMs: captionTiming[index]?.startMs ?? 0,
      endMs: captionTiming[index]?.endMs ?? spec.duration.seconds * 1000,
      timestampMs: null,
      confidence: null
    }))
  };
}

function createPromptLines(id, episode) {
  if (episode.reuseBaselineAssets) return [];
  if (!Array.isArray(episode.visuals) || episode.visuals.length !== timingByIndex.length) {
    throw new Error(`${id} requires exactly ${timingByIndex.length} visual descriptions.`);
  }
  const header = promptHeader(episode);
  return episode.visuals.map((visual, index) => JSON.stringify({
    prompt: `${header} Shot ${index + 1}, ${timingByIndex[index].id}: ${visual}.`,
    model: 'gpt-image-2',
    size: '1024x1792',
    quality: 'medium',
    out: fileName(index, timingByIndex[index].id)
  }));
}

const selectedIds = episodeFilter ? [episodeFilter] : series.episodeOrder;
for (const id of selectedIds) {
  const episode = series.episodes[id];
  if (!episode) throw new Error(`Unknown episode in series config: ${id}`);
  writeFileSync(path.join(root, 'episodes', `${id}.json`), `${JSON.stringify(createEpisode(id, episode), null, 2)}\n`, 'utf8');
  const promptLines = createPromptLines(id, episode);
  if (promptLines.length) {
    mkdirSync(path.join(root, 'prompts'), {recursive: true});
    writeFileSync(path.join(root, 'prompts', `${id}.jsonl`), `${promptLines.join('\n')}\n`, 'utf8');
  }
  console.log(`Prepared ${id}${promptLines.length ? ` with ${promptLines.length} Images2 prompts` : ' using verified baseline assets'}.`);
}

const manifest = {
  version: series.version,
  series: series.series,
  episodeOrder: series.episodeOrder,
  imageProvider: 'images2',
  ttsProvider: 'dashscope-tts',
  model: 'cosyvoice-v3-flash',
  staticOnly: true,
  generatedEpisodes: selectedIds
};
writeFileSync(path.join(root, 'config', 'series-manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
