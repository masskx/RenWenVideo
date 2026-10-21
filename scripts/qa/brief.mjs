// Brief check (简报检查): does the storyboard carry the five required brief fields and at least one prompt-library
// reference, and does the video fit its length budget? (docs/video-craft/quick-reference.md §三, §七, §十;
// template: docs/video-craft/分镜模板.md)
//   node scripts/qa/brief.mjs <id>
// Fails (exit 1) on a missing brief field, a 参考提示词 section without an id that find.mjs can --show, or an
// over-length script / video. Everything else — shot tables, physics
// columns (subject / force / contact / phase / SFX), pace per scene, scene length, sentence length — only warns:
// those are suggestions driven by the material, not gates.
import fs from 'node:fs';
import {spawnSync} from 'node:child_process';

const id = process.argv.slice(2).find((a) => !a.startsWith('--'));
if (!id) { console.log('usage: node scripts/qa/brief.mjs <id>'); process.exit(1); }
const storyboard = [`tutorials/${id}.storyboard.md`, `explainers/${id}.storyboard.md`].find((p) => fs.existsSync(p));
const fail = [], warn = [];

const REQUIRED = ['钩子台词', '钩子画面', '核心看点', '结尾台词', '标题·视频号', '标题·抖音', '标题·小红书'];
const fields = {};
if (!storyboard) fail.push(`没有分镜文件 tutorials/${id}.storyboard.md（模板：docs/video-craft/分镜模板.md）`);
else {
  const md = fs.readFileSync(storyboard, 'utf8');
  const brief = md.split(/\n## /).find((s) => s.startsWith('简报'));
  if (!brief) fail.push('分镜里没有“## 简报”一节（必填五项：钩子台词、钩子画面、核心看点、结尾台词、平台标题）');
  else {
    for (const k of REQUIRED) {
      const m = brief.match(new RegExp(`^-\\s*${k}[：:]\\s*(.*)$`, 'm'));
      const v = m?.[1].trim() ?? '';
      if (!v || /^<.*>$/.test(v)) fail.push(`简报缺「${k}」`);
      else fields[k] = v;
    }
  }
  // Prompt-library references (quick-reference §十): which technique from which stored prompt went into which scene.
  const refs = md.split(/\n## /).find((s) => s.startsWith('参考提示词'));
  const ids = [...new Set((refs ?? '').match(/\b(?:(?:opus55|lemo|opuscar98|mg15|ovp|ac55|pdoom|cab)\/[\w.\-/]*\w|[a-z0-9][a-z0-9-]*-\d{6})\b/g) ?? [])];
  if (!refs) fail.push('分镜里没有“## 参考提示词”一节：计划时按脚本类型跑 find.mjs --fit=<类型> --min=2，写下用了哪一招 → 哪个场景（quick-reference §十）');
  else if (!ids.length) fail.push('“## 参考提示词”里没有提示词库 id（例如 `opus55/twoclipping-496100 物件变出下一场 → scene2`）');
  for (const ref of ids) {
    const r = spawnSync(process.execPath, ['scripts/prompts/find.mjs', `--show=${ref}`], {encoding: 'utf8'});
    if (r.status !== 0) fail.push(`参考提示词 ${ref} 在提示词库里找不到（node scripts/prompts/find.mjs --list 看全部 id）`);
  }
  if (refs && ids.length && !/→|->/.test(refs)) warn.push('参考提示词没写用在哪个场景（格式：id + 哪一招 → 场景）');
}

const cfgPath = `tutorials/${id}.json`;
const cfg = fs.existsSync(cfgPath) ? JSON.parse(fs.readFileSync(cfgPath, 'utf8')) : null;
const strip = (n) => n.replace(/\{[^}]*\}/g, '').replace(/\[([^|\]]*)\|[^\]]*\]/g, '$1');
if (cfg) {
  // Length (user rule): no longer than 60 s unless the config sets maxSeconds.
  const maxSec = cfg.maxSeconds ?? 60;
  const count = (n) => (strip(n).match(/[一-鿿]/g) || []).length + (strip(n).match(/[A-Za-z]+|\d+/g) || []).length;
  const chars = cfg.scenes.reduce((sum, sc) => sum + count(sc.narration), 0);
  const budget = Math.round(maxSec * 4.8);   // ~4.8–5.5 chars/s after pause tightening (配音.md §四)
  if (chars > budget) fail.push(`口播 ${chars} 字，超过 ${maxSec} 秒的预算 ${budget} 字（删，不要加快语速硬塞；用户同意更长时写 "maxSeconds"）`);
  const tl = `tutorials/${id}.timeline.json`;
  if (fs.existsSync(tl)) {
    const t = JSON.parse(fs.readFileSync(tl, 'utf8'));
    const sec = t.totalFrames / t.fps;
    if (sec > maxSec + 0.5) fail.push(`成片 ${sec.toFixed(1)} 秒，超过 ${maxSec} 秒（用户同意更长时在配置里写 "maxSeconds"）`);
    for (const sc of t.scenes) if (sc.durationFrames / t.fps > 12) warn.push(`场景 ${sc.id} 有 ${(sc.durationFrames / t.fps).toFixed(1)} 秒：考虑拆开或删，保持每几秒有新东西`);
  }
  // Suggestions only.
  const first = cfg.scenes[0] ? strip(cfg.scenes[0].narration).replace(/\s/g, '') : '';
  const hookLine = (fields['钩子台词'] || '').replace(/^[“"「]|[”"」]$/g, '').replace(/\s/g, '');
  if (hookLine && first && !first.startsWith(hookLine.slice(0, 6))) warn.push('第一个场景的口播不是以简报里的钩子台词开头');
  for (const sc of cfg.scenes) {
    if (/……|\.\.\./.test(sc.narration)) warn.push(`场景 ${sc.id} 的口播有省略号：会读成长停顿，拖慢节奏（配音.md §四）`);
    const longest = Math.max(...strip(sc.narration).split(/[。？！；?!;]/).map((x) => (x.match(/[一-鿿]/g) || []).length));
    if (longest > 22) warn.push(`场景 ${sc.id} 有一句 ${longest} 字：口播一句尽量 ≤ 16 字`);
  }
  const noPace = cfg.scenes.filter((sc) => sc.pace === undefined).map((sc) => sc.id);
  if (noPace.length) warn.push(`这些场景没写 "pace"（按 normal 配）：${noPace.join(', ')}`);
} else if (!storyboard?.startsWith('explainers/')) warn.push(`没有找到 ${cfgPath}，只检查了分镜`);

for (const w of warn) console.log(`提醒 ${w}`);
for (const f of fail) console.log(`不过 ${f}`);
console.log(fail.length ? `判定：不过（${fail.length} 项）` : `判定：过${warn.length ? `（${warn.length} 条提醒）` : ''}`);
process.exit(fail.length ? 1 : 0);
