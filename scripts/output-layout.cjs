/**
 * Single source of truth for where rendered videos live.
 *
 *   out/
 *     INDEX.md                         generated catalog of every video (npm run catalog)
 *     <series>/<id>/<id>.mp4           final cut, ready to upload
 *     <series>/<id>/<id>-cover.jpg     cover (封面), when the series renders one
 *     <series>/<id>/<id>.srt           captions
 *     <series>/<id>/<id>.json          render manifest (size, fps, source, time)
 *     <series>/<id>/drafts/            draft / silent renders and QA stills (git-ignored)
 *
 * Plain CommonJS with no dependencies so the workbench server, the render scripts and
 * the Windows runtime copy can all load it.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const OUT_ROOT = path.join(ROOT, 'out');

const SERIES = {
  zen: {label: '哲理短片', source: 'episodes/<id>.json', render: 'npm run render -- episodes/<id>.json'},
  tutorials: {label: '科普教程', source: 'tutorials/<id>/tutorial.json', render: 'npm run tutorial:render -- <id>'},
};

const assertSeries = (series) => {
  if (!SERIES[series]) throw Error(`Unknown series "${series}". Known: ${Object.keys(SERIES).join(', ')}`);
};
const assertId = (id) => {
  if (!/^[a-z0-9][a-z0-9-]*$/.test(id)) throw Error(`Invalid video id "${id}" (lowercase letters, digits, hyphens)`);
};

function videoDir(series, id, root = ROOT) {
  assertSeries(series);
  assertId(id);
  return path.join(root, 'out', series, id);
}

function draftsDir(series, id, root = ROOT) {
  return path.join(videoDir(series, id, root), 'drafts');
}

/** Final cuts sit in the video folder; drafts and silent renders go to drafts/. */
function videoFile(series, id, {draft = false, silent = false} = {}, root = ROOT) {
  const name = `${id}${draft ? '-draft' : ''}${silent ? '-silent' : ''}.mp4`;
  return path.join(draft || silent ? draftsDir(series, id, root) : videoDir(series, id, root), name);
}

const toPosix = (p) => p.split(path.sep).join('/');

/** Path relative to out/, using forward slashes (for URLs and Markdown links). */
function outRelative(file, root = ROOT) {
  return toPosix(path.relative(path.join(root, 'out'), file));
}

function readJson(file) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8').replace(/^﻿/, '')); } catch { return null; }
}

/** Every rendered video found under out/<series>/<id>/. */
function listVideos(root = ROOT) {
  const outRoot = path.join(root, 'out');
  const videos = [];
  for (const series of Object.keys(SERIES)) {
    const seriesDir = path.join(outRoot, series);
    if (!fs.existsSync(seriesDir)) continue;
    for (const id of fs.readdirSync(seriesDir).sort()) {
      const dir = path.join(seriesDir, id);
      if (!fs.statSync(dir).isDirectory()) continue;
      const manifest = readJson(path.join(dir, `${id}.json`)) || {};
      const file = (name) => (fs.existsSync(path.join(dir, name)) ? path.join(dir, name) : null);
      const mp4 = file(`${id}.mp4`);
      const draftsPath = path.join(dir, 'drafts');
      const drafts = fs.existsSync(draftsPath) ? fs.readdirSync(draftsPath).filter((f) => f.endsWith('.mp4')) : [];
      videos.push({
        series, id, dir,
        title: manifest.title || manifest.episode?.title || manifest.tutorial?.title || id,
        output: manifest.output || null,
        createdAt: manifest.createdAt || null,
        video: mp4,
        sizeMB: mp4 ? Math.round(fs.statSync(mp4).size / 1048576 * 10) / 10 : null,
        cover: file(`${id}-cover.jpg`),
        srt: file(`${id}.srt`),
        drafts,
      });
    }
  }
  return videos;
}

const formatDuration = (output) => {
  if (!output?.frames || !output?.fps) return '—';
  const s = Math.round(output.frames / output.fps);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
};

/** Regenerate out/INDEX.md from what is on disk plus the workbench publish tracker. */
function writeIndex(root = ROOT) {
  const videos = listVideos(root);
  const tracker = readJson(path.join(root, 'workbench', 'data.json')) || {};
  const published = (id) => tracker.episodes?.[id]?.published;
  const rel = (file) => (file ? outRelative(file, root) : null);
  const lines = [
    '# 成片目录',
    '',
    '> 本文件由 `npm run catalog` 自动生成（渲染脚本结束时也会更新），请勿手改。',
    '',
    '每条视频一个文件夹：`out/<系列>/<id>/`，里面的 mp4 / 封面 / srt 就是上传抖音需要的全部文件；',
    '草稿、静音版和抽帧截图放在各自的 `drafts/` 子目录，不进版本库。',
    '',
  ];
  for (const [series, info] of Object.entries(SERIES)) {
    const items = videos.filter((v) => v.series === series);
    lines.push(`## ${info.label}（\`${series}/\`）· ${items.length} 条`, '');
    lines.push(`源配置：\`${info.source}\` · 渲染：\`${info.render}\``, '');
    if (!items.length) { lines.push('_暂无成片_', ''); continue; }
    lines.push('| ID | 标题 | 时长 | 规格 | 大小 | 渲染时间 | 发布 | 文件 |', '|---|---|---|---|---|---|---|---|');
    for (const v of items) {
      const spec = v.output ? `${v.output.width}×${v.output.height} · ${v.output.fps}fps` : '—';
      const when = v.createdAt ? v.createdAt.slice(0, 10) : '—';
      const files = [
        v.video ? `[视频](${rel(v.video)})` : (v.drafts.length ? `仅草稿 ×${v.drafts.length}` : '未渲染'),
        v.cover && `[封面](${rel(v.cover)})`,
        v.srt && `[字幕](${rel(v.srt)})`,
        series === 'tutorials' && fs.existsSync(path.join(root, 'tutorials', v.id, 'publish.md')) && `[发布文案](../tutorials/${v.id}/publish.md)`,
      ].filter(Boolean).join(' · ');
      lines.push(`| \`${v.id}\` | ${v.title} | ${formatDuration(v.output)} | ${spec} | ${v.sizeMB ?? '—'} MB | ${when} | ${published(v.id) ? '✅ 已发布' : '待发布'} | ${files} |`);
    }
    lines.push('');
  }
  const target = path.join(root, 'out', 'INDEX.md');
  fs.mkdirSync(path.dirname(target), {recursive: true});
  fs.writeFileSync(target, lines.join('\n'), 'utf8');
  return {file: target, count: videos.length};
}

module.exports = {ROOT, OUT_ROOT, SERIES, videoDir, draftsDir, videoFile, outRelative, listVideos, writeIndex};
