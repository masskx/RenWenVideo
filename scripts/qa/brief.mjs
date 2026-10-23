// Brief check (简报检查): does the storyboard carry the five required brief fields and the directing section, and does
// the video fit its length budget? (docs/video-craft/quick-reference.md §三, §七; template: docs/video-craft/分镜模板.md)
//   node scripts/qa/brief.mjs <id> [--legacy]
// Fails (exit 1) on a missing brief field, a missing directing field (## 导演, 导演方法.md §三.5 — the decisions the eight
// reference repos, huashu-motion and Xian's 梵高 explainer all make before any code: one idea, a benchmark, three
// structures, a style, ground colour by emotion, one object carried through, a signature shot, a poster frame 0, a held
// climax, and how this film differs from the last ones) or an over-length script / video. --legacy skips the directing
// section for films made before 2026-10-23. Everything else only warns.
import fs from 'node:fs';

const id = process.argv.slice(2).find((a) => !a.startsWith('--'));
if (!id) { console.log('usage: node scripts/qa/brief.mjs <id>'); process.exit(1); }
const storyboard = [`tutorials/${id}.storyboard.md`, `explainers/${id}.storyboard.md`].find((p) => fs.existsSync(p));
const fail = [], warn = [];
const cfg0 = fs.existsSync(`tutorials/${id}.json`) ? JSON.parse(fs.readFileSync(`tutorials/${id}.json`, 'utf8')) : null;

const REQUIRED = ['钩子台词', '钩子画面', '核心看点', '结尾台词', '标题·视频号', '标题·抖音', '标题·小红书'];
// Directing decisions (导演方法.md §三): each is one line in "## 导演"; where it comes from is in 分镜模板.md.
const DIRECTING = ['点子', '对标', '结构候选', '风格', '底色', '贯穿物件', '招牌镜头', '第0帧', '高潮停留', '和上一支不同'];
const legacy = process.argv.includes('--legacy');
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
  const directing = md.split(/\n## /).find((s) => s.startsWith('导演'));
  if (!legacy) {
    if (!directing) fail.push('分镜里没有“## 导演”一节（点子、对标、结构候选、风格、底色、贯穿物件、招牌镜头、第0帧、高潮停留、和上一支不同；模板见 分镜模板.md，旧片加 --legacy）');
    else for (const k of DIRECTING) {
      const v = directing.match(new RegExp(`^-\\s*${k}[：:]\\s*(.*)$`, 'm'))?.[1].trim() ?? '';
      if (!v || /^<.*>$/.test(v)) fail.push(`导演一节缺「${k}」`);
    }
    if (directing && !/^-\s*结构候选[：:].*(1|一|①).*(2|二|②).*(3|三|③)/m.test(directing)) warn.push('「结构候选」要写三个，再说选了哪个、为什么（lemo：第一个想到的通常是套路）');
    const shots = md.split(/\n## /).find((s) => s.startsWith('镜头表'));
    if (!shots) warn.push('没有“## 镜头表”（每句一行：口播 / 具体画面或道具 / 景别 / 运镜 / reads / 上屏字）');
    else if (cfg0 && (shots.match(/^\|/gm) || []).length - 2 < cfg0.scenes.length) warn.push('镜头表的行数少于场景数：每个场景至少一行，最好每句一行（一句一画）');
  }
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
