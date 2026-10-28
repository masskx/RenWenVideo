// Brief check (简报检查): does the storyboard carry the five required brief fields and the directing section, and does
// the video fit its length budget? (docs/video-craft/quick-reference.md §三, §七; template: docs/video-craft/分镜模板.md)
//   node scripts/qa/brief.mjs <id> [--legacy]
// Fails (exit 1) on a missing brief field, a missing directing field (## 导演, 导演方法.md §三.5 — the decisions the eight
// reference repos, huashu-motion and Xian's 梵高 explainer all make before any code: one idea, a benchmark, three
// structures, a style, ground colour by emotion, one object carried through, a signature shot, a poster frame 0, a held
// climax, and how this film differs from the last ones), a missing or unknown template (「模板」: the one style template
// from the library this film applies — user, 2026-10-28: pick the best-fitting template for every new topic, then apply
// it; prompt-library/选用指南.md §〇) or an over-length script / video. --legacy skips the directing
// section for films made before 2026-10-23. Everything else only warns.
import fs from 'node:fs';
import {execFileSync} from 'node:child_process';

const id = process.argv.slice(2).find((a) => !a.startsWith('--'));
if (!id) { console.log('usage: node scripts/qa/brief.mjs <id>'); process.exit(1); }
const storyboard = [`tutorials/${id}.storyboard.md`, `explainers/${id}.storyboard.md`].find((p) => fs.existsSync(p));
const fail = [], warn = [];
const cfg0 = fs.existsSync(`tutorials/${id}.json`) ? JSON.parse(fs.readFileSync(`tutorials/${id}.json`, 'utf8')) : null;

const REQUIRED = ['钩子台词', '钩子画面', '核心看点', '结尾台词', '标题·视频号', '标题·抖音', '标题·小红书'];
// Directing decisions (导演方法.md §三): each is one line in "## 导演"; where it comes from is in 分镜模板.md.
const DIRECTING = ['点子', '对标', '结构候选', '风格', '底色', '贯穿物件', '招牌镜头', '第0帧', '高潮停留', '和上一支不同'];
const legacy = process.argv.includes('--legacy');
// 「模板」 must name a template that exists in the pinned library snapshot: lemo/<style> (a styles/<style>/STYLE.md),
// opuscar98/<1–98>, or another library id (mg15/…, huashu/…, ovp/…). Films delivered before the rule only get a warning.
const lib = 'docs/video-craft/prompt-library';
const lemoPin = (() => { try { return JSON.parse(fs.readFileSync(`${lib}/sources.json`, 'utf8')).sources.find((x) => x.repo === 'lemomo-ai/lemo-opuscar')?.pinned; } catch { return null; } })();
const templateIds = (v) => [...v.matchAll(/\b(lemo|opuscar98|mg15|huashu|ovp)\/([\w.-]+)/g)].filter(([, src, name]) =>
  src === 'lemo' ? fs.existsSync(`${lib}/vendor/lemomo-ai__lemo-opuscar/${lemoPin}/styles/${name}/STYLE.md`)
    : src === 'opuscar98' ? Number(name) >= 1 && Number(name) <= 98 : true).map((m) => m[0]);
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
    if (directing) {
      const tpl = directing.match(/^-\s*模板[：:]\s*(.*)$/m)?.[1].trim() ?? '';
      const delivered = fs.existsSync(`douyin/${id}/video.mp4`) && !tpl;
      const msg = !tpl ? '导演一节缺「模板」：从模板库选最合适的一个并照它做（lemo/<风格> 或 opuscar98/<号>；prompt-library/选用指南.md §〇）'
        : !templateIds(tpl).length ? `「模板」里没有库里存在的模板 id（写成 lemo/caption-news、opuscar98/88 这样；查：node scripts/prompts/find.mjs --list --source=lemo）：${tpl}` : '';
      if (msg) (delivered ? warn : fail).push(msg);
      // 「模板改造」 (user, 2026-10-28: customise the template to the content so the films don't all look the same; lemo
      // MY-STYLES.md): 3–5 changes to the base, each "what: base → now (why)", separated by ；. Free per film anyway:
      // structure, opening, ending, pacing; the template's essence and engine stay (else pick another template).
      if (tpl && templateIds(tpl).length) {
        const mod = directing.match(/^-\s*模板改造[：:]\s*(.*)$/m)?.[1].trim() ?? '';
        const n = mod ? mod.split(/[；;]/).map((x) => x.trim()).filter(Boolean).length : 0;
        const modMsg = !mod ? '导演一节缺「模板改造」：按内容改模板，3–5 处，每处写“改了什么：模板原来 → 这支 （为什么）”，用；分开（选用指南.md §〇.3）'
          : n < 3 ? `「模板改造」只有 ${n} 处：至少 3 处（配色从素材取、字体 / 动效节奏、声音、换一个原生招式……），不然又是样片的样子` : '';
        if (modMsg) (delivered ? warn : fail).push(modMsg);
        if (n > 5) warn.push(`「模板改造」有 ${n} 处：一支片最多 5 处（lemo MY-STYLES：多了判断不了，也容易改丢模板的本质）`);
        // the same base among the last three films: say how this one differs
        const base = templateIds(tpl)[0];
        const when = (f) => { try { return Number(execFileSync('git', ['log', '-1', '--format=%ct', '--', f], {encoding: 'utf8'}).trim()) || fs.statSync(f).mtimeMs / 1000; } catch { return fs.statSync(f).mtimeMs / 1000; } };
        const others = fs.readdirSync('tutorials').filter((f) => f.endsWith('.storyboard.md') && f !== `${id}.storyboard.md`).map((f) => `tutorials/${f}`)
          .map((f) => ({f, t: when(f), tpl: fs.readFileSync(f, 'utf8').match(/^-\s*模板[：:]\s*(.*)$/m)?.[1] ?? ''})).filter((o) => o.tpl).sort((x, y) => y.t - x.t).slice(0, 3);
        const same = others.filter((o) => templateIds(o.tpl)[0] === base);
        if (same.length) warn.push(`最近三支里 ${same.map((o) => o.f.replace(/^tutorials\/|\.storyboard\.md$/g, '')).join('、')} 也用了 ${base}：这支的「模板改造」要和它们不一样（配色、开场、招牌招式、结构至少换三样；记录在 模板记录.md）`);
      }
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
    // Platform data (数据复盘-2026-10-26.md, hooks.md): viewers stay 6–16 s on average, so the core number must be said in
    // the first 10 s; 35–50 s explainers kept the largest share of the film; long films earn saves, not watch time.
    const said = t.scenes.flatMap((sc) => (sc.captions || []).map((c) => ({at: sc.startFrame / t.fps + c.startMs / 1000, text: c.text.replace(/[,，\s]/g, '')})));
    const nums = [...new Set(((fields['核心看点'] || '').replace(/(\d),(\d)/g, '$1$2').match(/\d+(?:\.\d+)?%?/g) || []).filter((n) => n.length >= 2 && !/^20\d\d$/.test(n)))];
    const hits = nums.map((n) => said.find((c) => c.text.includes(n.replace('%', '')))).filter(Boolean);
    if (hits.length) {
      const first = Math.min(...hits.map((h) => h.at));
      if (first > 10) warn.push(`核心看点的数字第一次在 ${first.toFixed(1)} 秒才说出：观众平均只看 6–16 秒，最大的数字 / 结论放进前 10 秒（hooks.md §三）`);
    } else if (!said.some((c) => c.at <= 10 && /\d|[一二三四五六七八九十百千万亿]+[个次倍成%％]/.test(c.text))) {
      warn.push('前 10 秒的口播里没有数字：核心看点的数字或结论放进前 10 秒（hooks.md §三）');
    }
    // Ending (抖音技巧.md §三): "完播" means the last frame; once the voice stops people swipe, so end ≤ 1 s after the last word.
    const last = t.scenes[t.scenes.length - 1];
    const tail = last ? last.durationFrames / t.fps - last.audioMs / 1000 : 0;
    if (tail > 1.05) warn.push(`最后一句说完还停 ${tail.toFixed(1)} 秒：完播算的是看到最后一帧，口播一停就有人划走；片尾留白 ≤ 1 秒（最后一个场景 "tailMs" ≤ 1000），“高潮停留”放在最后一句之前（抖音技巧.md §三）`);
    if (sec > 50 && cfg.kind !== 'tutorial') warn.push(`成片 ${sec.toFixed(1)} 秒：知识快讯 35–50 秒表现最好；长片只在值得收藏的教程里用（配置写 "kind": "tutorial"，hooks.md §四）`);
  }
  if (cfg.kind === 'tutorial' && storyboard && !/收藏点[：:]/.test(fs.readFileSync(storyboard, 'utf8'))) warn.push('教程片：分镜「简报」里写一个「收藏点」——能截图的清单画面（步骤 / 命令 / 检查项，停 ≥ 2 秒），长片的收藏从这里来（hooks.md §四）');
  // Suggestions only.
  const first = cfg.scenes[0] ? strip(cfg.scenes[0].narration).replace(/\s/g, '') : '';
  // The first sentence must not open with a date, a greeting or "this video" (2 s bounce 51–60 % in our data, hooks.md §一).
  if (/^(\d{1,2}月\d{1,2}日|20\d\d年|今天|昨天|大家好|哈喽|嗨|hello|hi[,，]|你现在看的这条|这条视频|本期|欢迎)/i.test(first)) fail.push(`第一句以日期 / 问候 / “这条视频”开头（「${first.slice(0, 16)}…」）：后台数据里这种开法 2 秒走一半；改成一件具体的事 + 数字 / 时刻（hooks.md §一）`);
  const hookLine = (fields['钩子台词'] || '').replace(/^[“"「]|[”"」]$/g, '').replace(/\s/g, '');
  if (hookLine && first && !first.startsWith(hookLine.slice(0, 6))) warn.push('第一个场景的口播不是以简报里的钩子台词开头');
  for (const sc of cfg.scenes) {
    if (/……|\.\.\./.test(sc.narration)) warn.push(`场景 ${sc.id} 的口播有省略号：会读成长停顿，拖慢节奏（配音.md §四）`);
    const longest = Math.max(...strip(sc.narration).split(/[。？！；?!;]/).map((x) => (x.match(/[一-鿿]/g) || []).length));
    if (longest > 22) warn.push(`场景 ${sc.id} 有一句 ${longest} 字：口播一句尽量 ≤ 16 字`);
  }
  // No follow / like / "comment 1" calls (平台与合规.md §三, 抖音技巧.md §三): low quality or off-site traffic to the platform.
  const cta = cfg.scenes.map((sc) => strip(sc.narration)).join('').match(/关注我|点个?关注|点个?赞|一键三连|评论区扣|扣\s*1|私信|主页领|加微信|资料包/);
  if (cta) fail.push(`口播里有「${cta[0]}」：不喊关注 / 点赞 / 扣 1 / 私信，结尾落在内容本身（抖音技巧.md §三）`);
  // Music that cannot be heard (踩坑清单 2026-10-26): base level × duck far below the voice.
  if (!cfg.musicSrc) warn.push('没有配乐：npm run tutorial:score -- <id> --preview（渲染时也会自动生成；音效.md §六）');
  if ((!cfg.musicSrc || cfg.musicSrc === `audio/tutorials/${id}/score.mp3`) && !cfg.score?.mood) warn.push('配置里没写 "score": {"mood", "climax", "lifts"}：配乐的情绪和高潮场景要按这支片选（音效.md §六）');
  else if ((cfg.musicVolume ?? 0.07) * 10 ** (-(cfg.musicDuckDb ?? 10) / 20) < 0.012) warn.push(`配乐在说话时几乎听不见（musicVolume ${cfg.musicVolume ?? 0.07}，压低 ${cfg.musicDuckDb ?? 10} dB）：用 scripts/generate-score.py 按配音定音量（音效.md §六）`);
  const noPace = cfg.scenes.filter((sc) => sc.pace === undefined).map((sc) => sc.id);
  if (noPace.length) warn.push(`这些场景没写 "pace"（按 normal 配）：${noPace.join(', ')}`);
} else if (!storyboard?.startsWith('explainers/')) warn.push(`没有找到 ${cfgPath}，只检查了分镜`);

for (const w of warn) console.log(`提醒 ${w}`);
for (const f of fail) console.log(`不过 ${f}`);
console.log(fail.length ? `判定：不过（${fail.length} 项）` : `判定：过${warn.length ? `（${warn.length} 条提醒）` : ''}`);
process.exit(fail.length ? 1 : 0);
