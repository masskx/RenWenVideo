const fs = require('fs');
const path = require('path');

const specPath = path.resolve(__dirname, '..', 'config', 'replication-spec.json');
const spec = JSON.parse(fs.readFileSync(specPath, 'utf8'));

function sameNumber(actual, expected) {
  return actual === expected;
}

function assessEpisode(episode) {
  const checks = [];
  const add = (key, label, ok, detail, severity = ok ? 'pass' : 'error') => {
    checks.push({key, label, ok, detail, severity});
  };

  add('canvas', '画布与帧率', episode.width === spec.canvas.width && episode.height === spec.canvas.height && episode.fps === spec.canvas.fps,
    `${episode.width}×${episode.height} / ${episode.fps}fps，规范为 ${spec.canvas.width}×${spec.canvas.height} / ${spec.canvas.fps}fps`);

  const shots = Array.isArray(episode.shots) ? episode.shots : [];
  const totalFrames = shots.reduce((sum, shot) => sum + (Number(shot.duration) || 0), 0);
  add('duration', '总时长', totalFrames === spec.duration.frames,
    `${totalFrames} 帧（${(totalFrames / spec.canvas.fps).toFixed(2)}s），规范为 ${spec.duration.frames} 帧（${spec.duration.seconds.toFixed(2)}s）`);
  add('shot-count', '镜头数量', shots.length === spec.shotCount,
    `${shots.length} 个镜头，规范为 ${spec.shotCount} 个`);

  let timelineOk = shots.length > 0;
  let cursor = 0;
  for (const shot of shots) {
    if (shot.start !== cursor || !Number.isInteger(shot.duration) || shot.duration < 1) timelineOk = false;
    cursor = shot.start + (Number(shot.duration) || 0);
  }
  add('timeline', '镜头连续性', timelineOk,
    timelineOk ? '镜头从 0 帧连续排列，无黑帧空档' : '存在起点不连续、非法时长或空档');

  const idsOk = shots.length === spec.shots.length && shots.every((shot, index) => shot.id === spec.shots[index].id);
  add('shot-order', '镜头顺序', idsOk,
    idsOk ? '14 个镜头顺序与参考规范一致' : '镜头 ID 或顺序与参考规范不一致');

  const durationsOk = shots.length === spec.shots.length && shots.every((shot, index) =>
    sameNumber(shot.start, spec.shots[index].start) && sameNumber(shot.duration, spec.shots[index].duration));
  add('shot-timing', '镜头切点', durationsOk,
    durationsOk ? '所有切点与参考时间表一致' : '至少一个切点或镜头时长偏离参考时间表');

  add('transition', '转场', episode.transitionFrames === spec.transitionFrames,
    `${episode.transitionFrames} 帧叠化，规范为 ${spec.transitionFrames} 帧`);
  add('title', '标题排版', episode.titleEnd === spec.title.endFrame,
    `标题结束于 ${episode.titleEnd} 帧，规范为 ${spec.title.endFrame} 帧`);
  add('subtitle', '字幕排版', episode.subtitleY === spec.subtitle.y && episode.subtitleSize === spec.subtitle.fontSize,
    `字幕 y=${episode.subtitleY}、字号=${episode.subtitleSize}，规范为 y=${spec.subtitle.y}、字号=${spec.subtitle.fontSize}`);

  const captions = Array.isArray(episode.captions) ? episode.captions : [];
  const captionsOk = captions.every((caption) => caption.text && Number.isFinite(caption.startMs) && Number.isFinite(caption.endMs) && caption.endMs > caption.startMs && caption.startMs >= 0 && caption.endMs <= spec.duration.seconds * 1000 + 1);
  add('captions', '字幕时间', captionsOk,
    captionsOk ? `${captions.length} 句字幕均在成片范围内` : '存在空字幕、倒序时间或超出成片长度的字幕');

  const mediaOk = shots.every((shot) => ['image', 'video'].includes(shot.kind));
  const videoCount = shots.filter((shot) => shot.kind === 'video').length;
  add('media-assets', '混合素材兼容', mediaOk,
    mediaOk ? `支持图片 + 视频混合镜头（当前 ${videoCount} 个动态图层）` : '存在不支持的镜头素材类型');

  const passCount = checks.filter((check) => check.ok).length;
  const score = Math.round((passCount / checks.length) * 100);
  const errors = checks.filter((check) => !check.ok).map((check) => check.detail);
  return {
    profile: spec.profile,
    score,
    grade: score >= 90 ? 'A' : score >= 75 ? 'B' : 'C',
    ok: errors.length === 0,
    checks,
    errors,
    spec: {name: spec.name, durationFrames: spec.duration.frames, shotCount: spec.shotCount}
  };
}

module.exports = {spec, assessEpisode};
