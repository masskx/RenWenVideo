/**
 * 哲理视频工作台 - 后端服务
 * 纯 Node.js 实现，无需额外依赖
 */
const http = require('http');
const fs = require('fs');
const path = require('path');
const {spawn} = require('child_process');
const crypto = require('crypto');

const PORT = process.env.WORKBENCH_PORT || 3210;
const ROOT = path.resolve(__dirname, '..');
const EPISODES_DIR = path.join(ROOT, 'episodes');
const PUBLIC_DIR = path.join(ROOT, 'public');
const OUT_DIR = path.join(ROOT, 'out');
const DATA_FILE = path.join(__dirname, 'data.json');
const PROVIDERS_FILE = path.join(ROOT, 'config', 'providers.json');
const VIDEO_PROFILE_FILE = path.join(ROOT, 'config', 'video-profile.json');
const {assessEpisode, spec: replicationSpec} = require(path.join(ROOT, 'scripts', 'replication-check.cjs'));
const layout = require(path.join(ROOT, 'scripts', 'output-layout.cjs'));
// Zen episodes render to out/zen/<id>/<id>.mp4; silent cuts live in that folder's drafts/.
const episodeVideoFile = (id, ep) => layout.videoFile('zen', id, {silent: !ep.audioSrc}, ROOT);

// Load local credentials for generation helpers without ever sending them to the browser.
function loadDotEnv(filePath) {
  if (!fs.existsSync(filePath)) return;
  for (const line of fs.readFileSync(filePath, 'utf8').split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
    if (!match || match[1] in process.env) continue;
    let value = match[2];
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    process.env[match[1]] = value;
  }
}
loadDotEnv(path.join(ROOT, '.env'));

function loadProviderConfig() {
  try { return JSON.parse(fs.readFileSync(PROVIDERS_FILE, 'utf8')); }
  catch { return {version: 1, providers: {}}; }
}
const providerConfig = loadProviderConfig();
function loadVideoProfile() {
  try { return JSON.parse(fs.readFileSync(VIDEO_PROFILE_FILE, 'utf8')); }
  catch { return {id: 'gemini-omni-hybrid', provider: 'gemini-omni-web', model: 'Gemini Omni', nativeAudio: 'mute'}; }
}
const videoProfile = loadVideoProfile();

function providerStatus() {
  return Object.entries(providerConfig.providers || {}).map(([id, provider]) => ({
    id,
    label: provider.label,
    type: provider.type,
    mode: provider.mode,
    model: provider.defaultModel,
    configured: provider.requiresBrowserSession ? false : Boolean(provider.envKey && process.env[provider.envKey]),
    sessionRequired: Boolean(provider.requiresBrowserSession),
    browser: provider.browser || null,
    envKey: provider.envKey || null,
    description: provider.description
  }));
}

// ============ 工作台数据 ============
function loadData() {
  try { return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8')); }
  catch { return {version: 1, episodes: {}, topics: []}; }
}
function saveData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
}

// ============ 工具函数 ============
function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8').replace(/^\uFEFF/, ''));
}
function writeJson(filePath, obj) {
  fs.writeFileSync(filePath, JSON.stringify(obj, null, 2) + '\n', 'utf8');
}
function assetExists(relPath) {
  if (!relPath || typeof relPath !== 'string') return false;
  const fullPath = path.resolve(PUBLIC_DIR, relPath);
  return fullPath.startsWith(PUBLIC_DIR + path.sep) && fs.existsSync(fullPath);
}
function mediaSummary(episode) {
  const shots = Array.isArray(episode.shots) ? episode.shots : [];
  const videoShots = shots.filter((shot) => shot.kind === 'video');
  const readyVideos = videoShots.filter((shot) => assetExists(shot.src));
  const providers = [...new Set(videoShots.map((shot) => shot.videoProvider).filter(Boolean))];
  return {
    mode: videoShots.length ? 'hybrid' : 'image-only',
    imageShots: shots.filter((shot) => shot.kind === 'image').length,
    videoShots: videoShots.length,
    readyVideos: readyVideos.length,
    missingVideos: Math.max(0, videoShots.length - readyVideos.length),
    videoProvider: providers.length ? providers.join(' / ') : episode.videoProvider || (videoShots.length ? 'dynamic-video' : null),
    videoAudioMode: episode.videoAudioMode || 'mute',
    videoAudioVolume: episode.videoAudioVolume ?? 0.08,
    voiceAttached: Boolean(episode.audioSrc),
    musicAttached: Boolean(episode.musicSrc),
    mixLabel: episode.audioSrc && episode.musicSrc
      ? '百炼旁白 + MiniMax 底乐'
      : episode.audioSrc ? '百炼旁白' : episode.musicSrc ? 'MiniMax 底乐' : '未接入音频'
  };
}
function send(res, code, data) {
  const body = JSON.stringify(data);
  res.writeHead(code, {'Content-Type': 'application/json; charset=utf-8', 'Access-Control-Allow-Origin': '*'});
  res.end(body);
}
function parseBody(req) {
  return new Promise((resolve, reject) => {
    let chunks = [];
    req.on('data', c => chunks.push(c));
    req.on('end', () => {
      try { resolve(chunks.length ? JSON.parse(Buffer.concat(chunks).toString()) : {}); }
      catch (e) { reject(e); }
    });
    req.on('error', reject);
  });
}

// ============ 渲染任务管理 ============
let renderJob = null; // {id, episodeId, status, startedAt, process, logs: []}

function getRenderStatus() {
  if (!renderJob) return {running: false};
  return {
    running: renderJob.status === 'running',
    id: renderJob.id,
    episodeId: renderJob.episodeId,
    status: renderJob.status,
    startedAt: renderJob.startedAt,
    finishedAt: renderJob.finishedAt || null,
    logs: renderJob.logs.slice(-30),
    draft: renderJob.draft
  };
}

function triggerRender(episodeId, draft = false) {
  if (renderJob && renderJob.status === 'running') {
    throw new Error('已有渲染任务进行中：' + renderJob.episodeId);
  }
  const episodeFile = path.join(EPISODES_DIR, episodeId + '.json');
  if (!fs.existsSync(episodeFile)) throw new Error('找不到视频配置：' + episodeId);

  const args = ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', 'scripts/run.ps1', '-Mode', 'render'];
  args.push('episodes/' + episodeId + '.json');
  if (draft) args.push('--draft');

  const proc = spawn('powershell', args, {
    cwd: ROOT,
    stdio: ['ignore', 'pipe', 'pipe'],
    shell: true
  });

  renderJob = {
    id: crypto.randomUUID(),
    episodeId,
    status: 'running',
    startedAt: new Date().toISOString(),
    process: proc,
    logs: [],
    draft
  };

  proc.stdout.on('data', (data) => {
    const lines = data.toString().split('\n').filter(l => l.trim());
    renderJob.logs.push(...lines.map(l => l.trim()));
    if (renderJob.logs.length > 200) renderJob.logs = renderJob.logs.slice(-200);
  });
  proc.stderr.on('data', (data) => {
    renderJob.logs.push('[stderr] ' + data.toString().trim());
  });
  proc.on('close', (code) => {
    renderJob.status = code === 0 ? 'done' : 'error';
    renderJob.finishedAt = new Date().toISOString();
    renderJob.exitCode = code;
    renderJob.logs.push(`渲染${code === 0 ? '完成' : '失败'} (exit: ${code})`);
  });

  return getRenderStatus();
}

// ============ Episode 管理 ============
function listEpisodes() {
  const files = fs.readdirSync(EPISODES_DIR).filter(f => f.endsWith('.json'));
  const data = loadData();
  return files.map(f => {
    const id = f.replace('.json', '');
    try {
      const ep = readJson(path.join(EPISODES_DIR, f));
      const durationSec = (ep.fps > 0) ? ep.shots.reduce((sum, s) => sum + s.duration, 0) / ep.fps : 0;
      const meta = data.episodes[id] || {};
      const videoFile = episodeVideoFile(id, ep);
      const hasVideo = fs.existsSync(videoFile);
      const compliance = assessEpisode(ep);
      const media = mediaSummary(ep);
      return {
        id, title: ep.title, fps: ep.fps, width: ep.width, height: ep.height,
        poster: (ep.shots || []).find((shot) => shot.kind === 'video' && assetExists(shot.src))?.src || ep.shots?.[0]?.src || null,
        posterKind: (ep.shots || []).some((shot) => shot.kind === 'video' && assetExists(shot.src)) ? 'video' : 'image',
        shotCount: ep.shots.length, captionCount: ep.captions.length,
        durationSec: Math.round(durationSec * 100) / 100,
        hasAudio: !!ep.audioSrc,
        hasVideo,
        videoPath: hasVideo ? layout.outRelative(videoFile, ROOT) : null,
        media,
        compliance,
        published: !!meta.published,
        publishedAt: meta.publishedAt || null,
        notes: meta.notes || '',
        hook: ep.captions?.[0]?.text || '',
        hookWindowSec: ep.captions?.[0] ? Math.min(3.64, Math.max(0, ep.captions[0].endMs / 1000)) : 0
      };
    } catch (e) {
      return {id, title: f, error: e.message};
    }
  });
}

function getEpisode(id) {
  const file = path.join(EPISODES_DIR, id + '.json');
  if (!fs.existsSync(file)) return null;
  const episode = readJson(file);
  const data = loadData();
  const meta = data.episodes[id] || {};
  const videoFile = episodeVideoFile(id, episode);
  return {...episode, _meta: meta, _hasVideo: fs.existsSync(videoFile), _videoPath: fs.existsSync(videoFile) ? layout.outRelative(videoFile, ROOT) : null, _media: mediaSummary(episode), _compliance: assessEpisode(episode)};
}

function createEpisode(body) {
  const {title, template = 'slow-life'} = body;
  if (!title) throw new Error('标题不能为空');
  const id = 'ep-' + Date.now().toString(36);
  const templateFile = path.join(EPISODES_DIR, template + '.json');
  let episode;
  if (fs.existsSync(templateFile)) {
    episode = readJson(templateFile);
    episode.id = id;
    episode.title = title;
    episode.captions = [];
    episode.audioSrc = null;
  } else {
    episode = {
      id, title, fps: 25, width: 1080, height: 1920,
      titleEnd: 75, transitionFrames: 5, subtitleY: 0.66, subtitleSize: 62,
      audioSrc: null, videoAudioMode: 'mute', videoAudioVolume: 0.08, shots: [], captions: []
    };
  }
  writeJson(path.join(EPISODES_DIR, id + '.json'), episode);
  return {id, title};
}

// ============ 素材库 ============
function listAssets() {
  const images = [], videos = [], audio = [];
  function scan(dir, prefix = '') {
    if (!fs.existsSync(dir)) return;
    for (const item of fs.readdirSync(dir)) {
      const full = path.join(dir, item);
      const rel = prefix ? prefix + '/' + item : item;
      if (fs.statSync(full).isDirectory()) {
        scan(full, rel);
      } else {
        const ext = path.extname(item).toLowerCase();
        const stats = fs.statSync(full);
        const entry = {name: item, path: rel, size: stats.size, sizeMB: Math.round(stats.size / 1048576 * 10) / 10};
        if (['.png', '.jpg', '.jpeg', '.webp'].includes(ext)) {
          // Generate thumbnail URL
          entry.url = '/api/asset-file/' + rel;
          images.push(entry);
        } else if (['.mp4', '.webm', '.mov'].includes(ext)) {
          entry.url = '/api/asset-file/' + rel;
          videos.push(entry);
        } else if (['.mp3', '.wav', '.m4a', '.aac'].includes(ext)) {
          entry.url = '/api/asset-file/' + rel;
          audio.push(entry);
        }
      }
    }
  }
  scan(PUBLIC_DIR);
  // Also list rendered videos under out/<series>/<id>/ (including drafts/)
  (function scanOut(dir) {
    if (!fs.existsSync(dir)) return;
    for (const item of fs.readdirSync(dir)) {
      const full = path.join(dir, item);
      const stats = fs.statSync(full);
      if (stats.isDirectory()) { scanOut(full); continue; }
      if (!item.endsWith('.mp4') || item.endsWith('.partial.mp4')) continue;
      const rel = layout.outRelative(full, ROOT);
      videos.push({name: item, path: 'out/' + rel, size: stats.size, sizeMB: Math.round(stats.size / 1048576 * 10) / 10, url: '/api/video-file/' + rel, isOutput: true});
    }
  })(OUT_DIR);
  return {images: images.sort((a,b) => a.name.localeCompare(b.name)), videos: videos.sort((a,b) => a.name.localeCompare(b.name)), audio};
}

// ============ 路由处理 ============
async function handleApi(req, res, pathname, query) {
  const method = req.method;

  // CORS preflight
  if (method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
    res.end();
    return;
  }

  // Episodes
  if (pathname === '/api/episodes' && method === 'GET') {
    return send(res, 200, listEpisodes());
  }
  if (pathname === '/api/episodes' && method === 'POST') {
    try {
      const body = await parseBody(req);
      return send(res, 201, createEpisode(body));
    } catch (e) { return send(res, 400, {error: e.message}); }
  }
  const epMatch = pathname.match(/^\/api\/episodes\/([a-zA-Z0-9_-]+)$/);
  if (epMatch) {
    const id = epMatch[1];
    if (method === 'GET') {
      const ep = getEpisode(id);
      if (!ep) return send(res, 404, {error: 'Not found'});
      return send(res, 200, ep);
    }
    if (method === 'PUT') {
      try {
        const body = await parseBody(req);
        const file = path.join(EPISODES_DIR, id + '.json');
        if (!fs.existsSync(file)) return send(res, 404, {error: 'Not found'});
        const {_meta, _hasVideo, _videoPath, ...episode} = body;
        episode.id = id;
        writeJson(file, episode);
        // Update meta
        if (_meta) {
          const data = loadData();
          data.episodes[id] = {...(data.episodes[id] || {}), ..._meta};
          saveData(data);
        }
        return send(res, 200, {ok: true});
      } catch (e) { return send(res, 400, {error: e.message}); }
    }
    if (method === 'DELETE') {
      const file = path.join(EPISODES_DIR, id + '.json');
      if (!fs.existsSync(file)) return send(res, 404, {error: 'Not found'});
      fs.unlinkSync(file);
      const data = loadData();
      delete data.episodes[id];
      saveData(data);
      return send(res, 200, {ok: true});
    }
  }

  // Assets
  if (pathname === '/api/assets' && method === 'GET') {
    return send(res, 200, listAssets());
  }

  // Asset file serving
  const assetMatch = pathname.match(/^\/api\/asset-file\/(.+)$/);
  if (assetMatch && (method === 'GET' || method === 'HEAD')) {
    const relPath = decodeURIComponent(assetMatch[1]);
    const fullPath = path.resolve(PUBLIC_DIR, relPath);
    if (!fullPath.startsWith(PUBLIC_DIR)) return send(res, 403, {error: 'Forbidden'});
    if (!fs.existsSync(fullPath)) return send(res, 404, {error: 'Not found'});
    const ext = path.extname(fullPath).toLowerCase();
    const mimeTypes = {
      '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp',
      '.mp4': 'video/mp4', '.webm': 'video/webm', '.mp3': 'audio/mpeg', '.wav': 'audio/wav', '.m4a': 'audio/mp4'
    };
    res.writeHead(200, {'Content-Type': mimeTypes[ext] || 'application/octet-stream', 'Cache-Control': 'public, max-age=3600'});
    fs.createReadStream(fullPath).pipe(res);
    return;
  }

  // Video file serving (from out/)
  const videoMatch = pathname.match(/^\/api\/video-file\/(.+)$/);
  if (videoMatch && (method === 'GET' || method === 'HEAD')) {
    const fileName = decodeURIComponent(videoMatch[1]);
    const fullPath = path.resolve(OUT_DIR, fileName);
    if (!fullPath.startsWith(OUT_DIR + path.sep)) return send(res, 403, {error: 'Forbidden'});
    if (!fs.existsSync(fullPath) || !fs.statSync(fullPath).isFile()) return send(res, 404, {error: 'Not found'});
    res.writeHead(200, {'Content-Type': 'video/mp4'});
    fs.createReadStream(fullPath).pipe(res);
    return;
  }

  // Render
  if (pathname === '/api/render' && method === 'POST') {
    try {
      const body = await parseBody(req);
      const {episodeId, draft = false} = body;
      const status = triggerRender(episodeId, draft);
      return send(res, 202, status);
    } catch (e) { return send(res, 409, {error: e.message}); }
  }
  if (pathname === '/api/render/status' && method === 'GET') {
    return send(res, 200, getRenderStatus());
  }

  // Workbench data (publish tracking, topics)
  if (pathname === '/api/workbench' && method === 'GET') {
    return send(res, 200, loadData());
  }
  if (pathname === '/api/workbench' && method === 'PUT') {
    try {
      const body = await parseBody(req);
      saveData(body);
      return send(res, 200, {ok: true});
    } catch (e) { return send(res, 400, {error: e.message}); }
  }

  // Topics
  if (pathname === '/api/topics' && method === 'POST') {
    try {
      const body = await parseBody(req);
      const data = loadData();
      const topic = {
        id: 'topic-' + Date.now().toString(36),
        title: body.title || '',
        captions: body.captions || [],
        status: body.status || 'idea',
        createdAt: new Date().toISOString()
      };
      data.topics.push(topic);
      saveData(data);
      return send(res, 201, topic);
    } catch (e) { return send(res, 400, {error: e.message}); }
  }

  // System info
  if (pathname === '/api/providers' && method === 'GET') {
    return send(res, 200, {providers: providerStatus()});
  }
  if (pathname === '/api/spec' && method === 'GET') {
    return send(res, 200, replicationSpec);
  }
  if (pathname === '/api/overview' && method === 'GET') {
    const episodeList = listEpisodes();
    const assetList = listAssets();
    return send(res, 200, {
      project: {name: '哲理视频工作台', profile: replicationSpec.profile},
      providers: providerStatus(),
      spec: {
        name: replicationSpec.name,
        width: replicationSpec.canvas.width,
        height: replicationSpec.canvas.height,
        fps: replicationSpec.canvas.fps,
        durationFrames: replicationSpec.duration.frames,
        shotCount: replicationSpec.shotCount,
        mediaMode: replicationSpec.media?.mode || 'hybrid',
        videoProvider: replicationSpec.media?.videoProvider || 'bailian-i2v / gemini-omni-web',
        defaultVideoAudio: replicationSpec.media?.defaultVideoAudio || 'mute'
      },
      assets: {images: assetList.images.length, videos: assetList.videos.length, audio: assetList.audio.length},
      workflow: {
        imageProvider: 'Images2 / gpt-image-2',
        videoProvider: '百炼 I2V（wan3.0 / happyhorse / wan2.7）+ Gemini Omni 备用',
        narrationProvider: '百炼 CosyVoice',
        musicProvider: 'MiniMax Music',
        videoAudioPolicy: '默认静音；雨、水、火等自然声按镜头低音量开启',
        audioMix: '百炼旁白优先，MiniMax 底乐约 0.09，视频原生声默认不抢主声道',
        videoProfile: {
          id: videoProfile.id,
          model: videoProfile.model,
          aspectRatio: videoProfile.aspectRatio,
          targetDurationSeconds: 3,
          nativeAudio: videoProfile.nativeAudio,
          dynamicShotPriority: videoProfile.dynamicShotPriority || []
        }
      },
      episodes: episodeList
    });
  }
  if (pathname === '/api/system' && method === 'GET') {
    return send(res, 200, {
      name: '哲理视频工作台',
      version: '0.3.0',
      port: PORT,
      root: ROOT,
      episodesDir: EPISODES_DIR,
      publicDir: PUBLIC_DIR,
      outputDir: OUT_DIR
    });
  }

  send(res, 404, {error: 'API not found: ' + method + ' ' + pathname});
}

// ============ 静态文件服务 ============
function serveStatic(req, res, pathname) {
  let filePath = pathname === '/' ? '/index.html' : pathname;
  filePath = path.join(__dirname, 'public', filePath);
  if (!filePath.startsWith(path.join(__dirname, 'public'))) {
    res.writeHead(403); res.end('Forbidden'); return;
  }
  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    filePath = path.join(__dirname, 'public', 'index.html');
  }
  const ext = path.extname(filePath).toLowerCase();
  const mimeTypes = {
    '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8', '.json': 'application/json',
    '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon', '.woff2': 'font/woff2'
  };
  res.writeHead(200, {'Content-Type': mimeTypes[ext] || 'application/octet-stream'});
  fs.createReadStream(filePath).pipe(res);
}

// ============ 启动服务器 ============
const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost:' + PORT);
  const pathname = url.pathname;

  if (pathname.startsWith('/api/')) {
    try { await handleApi(req, res, pathname, url.searchParams); }
    catch (e) { send(res, 500, {error: e.message}); }
  } else {
    serveStatic(req, res, pathname);
  }
});

server.listen(PORT, () => {
  console.log('');
  console.log('  ╔══════════════════════════════════════╗');
  console.log('  ║   🍵 哲理视频工作台 已启动             ║');
  console.log('  ╚══════════════════════════════════════╝');
  console.log('');
  console.log('  地址: http://localhost:' + PORT);
  console.log('  项目: ' + ROOT);
  console.log('  API:  http://localhost:' + PORT + '/api/system');
  console.log('');
  console.log('  按 Ctrl+C 停止服务');
  console.log('');
});

