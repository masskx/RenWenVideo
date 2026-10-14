import {existsSync, mkdirSync, readFileSync, writeFileSync} from 'node:fs';
import {access, readFile, writeFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
process.chdir(root);

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

const episodeFilter = value('episode', '');
const shotFilter = value('shot', '');
const shotList = value('shots', '').split(',').map((item) => item.trim()).filter(Boolean);
const model = value('model', 'wan3.0-video-prime');
const duration = Number(value('duration', '3'));
const resolution = value('resolution', '480P');
const concurrency = Math.max(1, Math.min(2, Number(value('concurrency', '1'))));
const maxJobs = Number(value('max', '0')) || Infinity;
const force = has('force');
const apply = has('apply');
const dryRun = has('dry-run');

if (!Number.isInteger(duration) || duration < 2 || duration > 15) throw new Error('--duration must be an integer from 2 to 15.');
if (!['480P', '720P', '1080P'].includes(resolution)) throw new Error('--resolution must be 480P, 720P, or 1080P.');
if (!['wan3.0-video', 'wan3.0-video-prime', 'happyhorse-1.1-i2v', 'happyhorse-1.1-r2v', 'wan2.7-r2v-2026-06-12'].includes(model)) {
  throw new Error(`Unsupported I2V model for this script: ${model}`);
}

const promptByShot = {
  bridge: '生成单镜头。保持柳树、石拱桥和暗绿色水面完全稳定，只有柳枝被微风轻轻带动，水面出现细小自然波纹；固定机位，极慢向前推近。写实摄影，安静的江南深夜氛围，无人物，无台词，无背景音乐，无音效。',
  'pour-tea': '生成单镜头。保持紫砂壶、白杯和紫花的位置与材质稳定，茶汤连续从壶嘴缓慢流入杯中，蒸汽轻轻上升；镜头极慢推近，动作真实克制。写实摄影，无人物，无台词，无背景音乐，无音效。',
  'stone-tea': '生成单镜头。保持石台茶壶、绿叶和流水背景稳定，背景水流轻微连续流动，叶片被微风轻轻带动；镜头缓慢向右平移。写实摄影，无人物，无台词，无背景音乐，无音效。',
  'lotus-vase': '生成单镜头。保持青瓷瓶与粉色荷花完全稳定，荷花与叶片被极轻微的风带动，水面反光细微变化；镜头几乎固定，只做极慢推近。写实摄影，无人物，无台词，无背景音乐，无音效。',
  stove: '生成单镜头。保持炭炉、提梁壶、茶杯和果子构图稳定，炭火微微跳动，壶口热气缓慢上升；镜头缓慢推近。写实摄影，无人物，无台词，无背景音乐，无音效。',
  koi: '生成单镜头。保持暗色池塘和锦鲤外观稳定，一条锦鲤缓慢游过水面下方，水纹和倒影自然扩散；镜头平稳横向移动。写实摄影，无人物，无台词，无背景音乐，无音效。',
  'tea-leaves': '生成单镜头。保持竹茶则、茶叶和茶罐的位置稳定，几片茶叶轻轻落入茶罐，随后茶叶停止移动；镜头固定并极慢推近。写实摄影，无人物，无台词，无背景音乐，无音效。',
  water: '生成单镜头。保持苔石和石水槽构图稳定，两道细水连续流动，水面反光和水滴有真实细微变化；镜头缓慢向前推近。写实摄影，无人物，无台词，无背景音乐，无音效。',
  blossom: '生成单镜头。保持带水滴的花枝和青瓷杯构图稳定，花枝被微风轻轻摇动，水滴闪烁但不新增；镜头极慢向下移动。写实摄影，无人物，无台词，无背景音乐，无音效。',
  maple: '生成单镜头。保持明亮绿叶和深色背景稳定，叶片被轻风缓慢带动，光影在叶面上轻轻移动；镜头固定，只做很慢推近。写实摄影，无人物，无台词，无背景音乐，无音效。',
  'lotus-leaf': '生成单镜头。保持单片荷叶和暗色池塘稳定，荷叶边缘和水面出现轻微自然波动，倒影缓慢变化；镜头平稳横向移动。写实摄影，无人物，无台词，无背景音乐，无音效。',
  bamboo: '生成单镜头。保持雨雾竹林的纵向构图稳定，竹叶被细雨和微风轻轻带动，雾气缓慢流动；镜头极慢向前推进。写实摄影，无人物，无台词，无背景音乐，无音效。',
  'garden-tea': '生成单镜头。保持户外茶席、野花和青瓷壶稳定，野花轻轻摆动，远处叶影发生细微变化；镜头短暂而平稳地向前推近。写实摄影，无人物，无台词，无背景音乐，无音效。',
  'warm-room': '生成单镜头。保持暖灯茶室、茶杯和花枝的位置稳定，灯火轻微闪烁，花枝有几乎不可察觉的摇动；镜头缓慢推近并在结尾保持稳定。写实摄影，无人物，无台词，无背景音乐，无音效。'
};

const episodeFiles = episodeFilter
  ? [`${episodeFilter}.json`]
  : (await import('node:fs/promises')).readdir(path.join(root, 'episodes')).then((files) => files.filter((file) => file.endsWith('.json')));

function mimeFor(file) {
  const ext = path.extname(file).toLowerCase();
  return ext === '.jpg' || ext === '.jpeg' ? 'image/jpeg' : ext === '.webp' ? 'image/webp' : 'image/png';
}
function modelSlug(name) { return name.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, ''); }
function outputPathFor(episode, shot) {
  return path.join(root, 'public', 'video', 'bailian-i2v', episode.id, `${shot.id}-${modelSlug(model)}.mp4`);
}
function relPublic(file) { return path.relative(path.join(root, 'public'), file).split(path.sep).join('/'); }

const jobs = [];
for (const fileName of episodeFiles) {
  const episodePath = path.join(root, 'episodes', fileName);
  if (!existsSync(episodePath)) throw new Error(`Episode not found: ${fileName}`);
  const episode = JSON.parse(readFileSync(episodePath, 'utf8').replace(/^\uFEFF/, ''));
  for (const shot of episode.shots ?? []) {
    if (shotFilter && shot.id !== shotFilter) continue;
    if (shotList.length && !shotList.includes(shot.id)) continue;
    if (shot.kind !== 'image' && !force) continue;
    const source = path.join(root, 'public', shot.src);
    if (!existsSync(source)) throw new Error(`Missing source image: ${shot.src}`);
    const output = outputPathFor(episode, shot);
    if (existsSync(output) && !force) continue;
    jobs.push({episode, episodePath, shot, source, output});
  }
}
const selectedJobs = jobs.slice(0, maxJobs);
console.log(`Model: ${model}; resolution: ${resolution}; duration: ${duration}s; concurrency: ${concurrency}`);
console.log(`Planned jobs: ${selectedJobs.length}${jobs.length > selectedJobs.length ? ` (of ${jobs.length})` : ''}`);
if (dryRun || selectedJobs.length === 0) process.exit(0);

const apiKey = process.env.DASHSCOPE_API_KEY;
if (!apiKey) throw new Error('Missing DASHSCOPE_API_KEY in zen-video/.env.');
const endpoint = process.env.DASHSCOPE_VIDEO_ENDPOINT || 'https://dashscope.aliyuncs.com/api/v1/services/aigc/video-generation/video-synthesis';
const taskEndpoint = process.env.DASHSCOPE_VIDEO_TASK_ENDPOINT || new URL(endpoint).origin + '/api/v1/tasks';
const manifestPath = path.join(root, 'config', 'bailian-video-jobs.jsonl');

async function requestJson(url, init, attempts = 3) {
  let last;
  for (let i = 0; i < attempts; i += 1) {
    try {
      const response = await fetch(url, init);
      const body = await response.text();
      let payload = null;
      try { payload = JSON.parse(body); } catch {}
      if (response.status !== 429 && response.status < 500) return {response, payload, body};
      last = new Error(`HTTP ${response.status}`);
    } catch (error) { last = error; }
    await new Promise((resolve) => setTimeout(resolve, 1500 * (i + 1)));
  }
  throw last;
}

async function generate(job) {
  const bytes = await readFile(job.source);
  const dataUrl = `data:${mimeFor(job.source)};base64,${bytes.toString('base64')}`;
  const referenceModel = model.endsWith('-r2v') || model === 'wan2.7-r2v-2026-06-12';
  const mediaType = referenceModel ? 'reference_image' : 'first_frame';
  const prompt = referenceModel
    ? `参考图片中的江南生活场景，${promptByShot[job.shot.id] || '只产生自然、克制的环境运动。'}保持主体、构图和材质稳定。`
    : (promptByShot[job.shot.id] || '生成单镜头，保持参考图片主体与构图稳定，只产生自然、克制的环境运动；无人物、无台词、无背景音乐、无音效。');
  const payload = {
    model,
    input: {prompt, media: [{type: mediaType, url: dataUrl}]},
    parameters: {resolution, ratio: referenceModel ? '9:16' : 'adaptive', duration, prompt_extend: false, watermark: false, audio: false}
  };
  const created = await requestJson(endpoint, {
    method: 'POST',
    headers: {'X-DashScope-Async': 'enable', Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json'},
    body: JSON.stringify(payload)
  });
  if (!created.response.ok || !created.payload?.output?.task_id) {
    throw new Error(`create failed for ${job.episode.id}/${job.shot.id}: HTTP ${created.response.status} ${created.payload?.code || ''} ${created.payload?.message || created.body.slice(0, 180)}`);
  }
  const taskId = created.payload.output.task_id;
  console.log(`Submitted ${job.episode.id}/${job.shot.id}: ${taskId}`);
  let result;
  for (let attempt = 1; attempt <= 40; attempt += 1) {
    await new Promise((resolve) => setTimeout(resolve, 15000));
    const status = await requestJson(`${taskEndpoint}/${encodeURIComponent(taskId)}`, {headers: {Authorization: `Bearer ${apiKey}`}}, 2);
    result = status.payload;
    const state = result?.output?.task_status || 'UNKNOWN';
    console.log(`Status ${job.episode.id}/${job.shot.id}: ${state}`);
    if (state === 'SUCCEEDED' || state === 'FAILED' || state === 'CANCELED' || state === 'UNKNOWN') break;
  }
  if (result?.output?.task_status !== 'SUCCEEDED' || !result.output.video_url) {
    throw new Error(`task failed for ${job.episode.id}/${job.shot.id}: ${result?.output?.task_status || 'UNKNOWN'} ${result?.output?.message || result?.message || result?.code || ''}`);
  }
  const videoResponse = await fetch(result.output.video_url);
  if (!videoResponse.ok) throw new Error(`video download failed for ${job.episode.id}/${job.shot.id}: HTTP ${videoResponse.status}`);
  mkdirSync(path.dirname(job.output), {recursive: true});
  writeFileSync(job.output, Buffer.from(await videoResponse.arrayBuffer()));
  const record = {episodeId: job.episode.id, shotId: job.shot.id, model, duration, resolution, taskId, output: relPublic(job.output), generatedAt: new Date().toISOString()};
  writeFileSync(manifestPath, `${JSON.stringify(record)}\n`, {encoding: 'utf8', flag: 'a'});
  return record;
}

let cursor = 0;
const results = [];
async function worker() {
  while (true) {
    const index = cursor++;
    if (index >= selectedJobs.length) return;
    const job = selectedJobs[index];
    try {
      const record = await generate(job);
      results.push({ok: true, job, record});
      console.log(`Saved ${record.output}`);
    } catch (error) {
      results.push({ok: false, job, error: error.message});
      console.error(`FAILED ${job.episode.id}/${job.shot.id}: ${error.message}`);
    }
  }
}
await Promise.all(Array.from({length: Math.min(concurrency, selectedJobs.length)}, () => worker()));

if (apply) {
  const byEpisode = new Map();
  for (const item of results.filter((entry) => entry.ok)) {
    const list = byEpisode.get(item.job.episodePath) || [];
    list.push(item);
    byEpisode.set(item.job.episodePath, list);
  }
  for (const [episodePath, items] of byEpisode) {
    const episode = JSON.parse(readFileSync(episodePath, 'utf8').replace(/^\uFEFF/, ''));
    for (const item of items) {
      const shot = episode.shots.find((candidate) => candidate.id === item.job.shot.id);
      if (!shot) continue;
      shot.kind = 'video';
      shot.src = item.record.output;
      shot.trimBefore = 0;
      shot.videoProvider = `bailian-${model}`;
      shot.videoAudioMode = 'mute';
      shot.videoAudioVolume = 0;
    }
    writeFileSync(episodePath, `${JSON.stringify(episode, null, 2)}\n`, 'utf8');
  }
}
console.log(`Finished: ${results.filter((item) => item.ok).length} succeeded, ${results.filter((item) => !item.ok).length} failed.`);
