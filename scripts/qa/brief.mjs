// Director-layer check (导演层检查): does the storyboard carry the 8-item brief and per-shot subject / force /
// phase / SFX columns, and is the scene code free of the ban-list patterns? (docs/video-craft/导演层.md §1, §9, §11)
//   node scripts/qa/brief.mjs <id>
// Fails (exit 1) on a missing brief item or shot column, or a banned pattern in the scene file; warns on softer signs.
// It cannot judge taste — it only catches the defaults that made earlier videos look AI-made. Look at the frames too.
import fs from 'node:fs';
import path from 'node:path';

const id = process.argv.slice(2).find((a) => !a.startsWith('--'));
if (!id) { console.log('usage: node scripts/qa/brief.mjs <id>'); process.exit(1); }
const storyboard = [`tutorials/${id}.storyboard.md`, `explainers/${id}.storyboard.md`].find((p) => fs.existsSync(p));
const fail = [], warn = [];
if (!storyboard) fail.push(`没有分镜文件 tutorials/${id}.storyboard.md 或 explainers/${id}.storyboard.md`);
else {
  const md = fs.readFileSync(storyboard, 'utf8');
  const brief = md.split(/\n## /).find((s) => s.startsWith('导演 Brief'));
  if (!brief) fail.push('分镜里没有“## 导演 Brief”一节');
  else {
    const items = ['目标', '分镜与主次', '轨迹与相机', '运动与物理', '材质与光', '节拍与声音', '禁止项', '验收标准'];
    for (const [i, name] of items.entries()) if (!new RegExp(`^\\s*${i + 1}\\.\\s*${name}`, 'm').test(brief)) fail.push(`Brief 缺第 ${i + 1} 项「${name}」`);
  }
  if (!/^- 参考：/m.test(md)) warn.push('分镜开头没有写“参考：”（导演层第十节）');
  // Story first (文案.md): the post is material; the video tells our story from one clear perspective.
  const card = md.split(/\n## /).find((sec) => sec.startsWith('选题卡'));
  if (!card) fail.push('分镜里没有“## 选题卡”（文案.md：先定视角、主角、冲突、我们的观点，再写口播）');
  else {
    for (const k of ['一句话', '视角', '主角', '冲突', '我们的观点', '观众带走']) {
      const m = card.match(new RegExp(`^-\\s*${k}[：:]\\s*(.*)$`, 'm'));
      if (!m || !m[1].trim() || /^<.*>$/.test(m[1].trim())) fail.push(`选题卡缺「${k}」`);
    }
    if (!/视角[：:][^\n]*(讲述者|第三方)/.test(card)) fail.push('选题卡的视角要写明“讲述者”或“第三方”');
  }
  const header = md.split('\n').find((l) => l.startsWith('| 镜头'));
  if (!header) fail.push('分镜里没有“| 镜头 |”开头的镜头表');
  else for (const col of ['主体', '受力', '错相', '音效']) if (!header.includes(col)) fail.push(`镜头表缺“${col}”一列`);
  // Pacing (配音.md §三): with the user's cloned voice the pace is planned per shot from content and emotion.
  const cfgPath = [`tutorials/${id}.json`].find((p) => fs.existsSync(p));
  const cfg = cfgPath ? JSON.parse(fs.readFileSync(cfgPath, 'utf8')) : null;
  // Length and short-video pacing (user rule, 2026-10-17): no longer than 60 s unless the config sets maxSeconds.
  if (cfg) {
    const maxSec = cfg.maxSeconds ?? 60;
    const strip = (n) => n.replace(/\{[^}]*\}/g, '').replace(/\[([^|\]]*)\|[^\]]*\]/g, '$1');
    const count = (n) => (strip(n).match(/[\u4e00-\u9fff]/g) || []).length + (strip(n).match(/[A-Za-z]+|\d+/g) || []).length;
    const chars = cfg.scenes.reduce((sum, sc) => sum + count(sc.narration), 0);
    const budget = Math.round(maxSec * 4.8);   // ~4.8–5.5 chars/s after pause tightening (配音.md §四)
    if (chars > budget) fail.push(`口播 ${chars} 字，超过 ${maxSec} 秒的预算 ${budget} 字（文案.md §七：删，不要加快语速硬塞）`);
    const tl = [`tutorials/${id}.timeline.json`].find((p) => fs.existsSync(p));
    if (tl) {
      const t = JSON.parse(fs.readFileSync(tl, 'utf8'));
      const sec = t.totalFrames / t.fps;
      if (sec > maxSec + 0.5) fail.push(`成片 ${sec.toFixed(1)} 秒，超过 ${maxSec} 秒（默认上限 60 秒；用户另有要求时在配置里写 "maxSeconds"）`);
      for (const sc of t.scenes) if (sc.durationFrames / t.fps > 12) warn.push(`场景 ${sc.id} 有 ${(sc.durationFrames / t.fps).toFixed(1)} 秒：短视频一个场景不超过 8–10 秒，拆开或删`);
    }
    for (const sc of cfg.scenes) {
      if (/……|\.\.\./.test(sc.narration)) warn.push(`场景 ${sc.id} 的口播有省略号：豆包会读成长停顿，拖慢节奏（配音.md §四）`);
      const longest = Math.max(...strip(sc.narration).split(/[。？！；?!;]/).map((x) => (x.match(/[\u4e00-\u9fff]/g) || []).length));
      if (longest > 22) warn.push(`场景 ${sc.id} 有一句 ${longest} 字：口播一句话尽量 ≤ 16 字，长句拆短（文案.md §七）`);
    }
  }
  if (cfg?.tts?.provider === 'doubao') {
    if (header && !header.includes('语速')) fail.push('镜头表缺“语速”一列（复刻音色配音：每个镜头按内容和情绪定语速）');
    const missing = cfg.scenes.filter((sc) => sc.pace === undefined).map((sc) => sc.id);
    if (missing.length) fail.push(`这些场景没写 "pace"：${missing.join(', ')}`);
    const paces = new Set([...cfg.scenes.map((sc) => String(sc.pace)), ...cfg.scenes.flatMap((sc) => [...sc.narration.matchAll(/\{pace:([a-z0-9.]+)\}/g)].map((m) => m[1]))]);
    if (cfg.scenes.length > 3 && paces.size < 2) warn.push('全片只有一种语速：语速要随内容和情绪变化（钩子、列举偏快，重点、转折、结尾偏慢）');
  }
}

const sceneFile = path.join('src/tutorial/scenes', `${id}.tsx`);
if (fs.existsSync(sceneFile)) {
  const code = fs.readFileSync(sceneFile, 'utf8');
  const lines = code.split('\n');
  const hit = (re, msg, list = fail) => lines.forEach((l, i) => { if (re.test(l) && !/brief-ok/.test(l)) list.push(`${sceneFile}:${i + 1} ${msg}`); });
  hit(/0 0 (\d+|\$\{[^}]+\})px\s+(\$\{|#(?!000))/, '外发光（无理由发光）');
  hit(/textShadow:[^}]*0 0 \d+px/, '文字辉光');
  hit(/linear-gradient\([^)]*\$\{color\.(cyan|violet|pink)\}[^)]*\$\{color\./, '彩色渐变（霓虹渐变）');
  hit(/\bbeatTour\(|\bbeatZoom\(/, '整幅推拉（beatTour / beatZoom）');
  hit(/\bCueGlow\b/, '跟着卡点跑的彩色光斑', warn);
  hit(/kind="confetti"|kind='confetti'/, '彩带粒子', fail);
  hit(/outBack\([^)]*,\s*(1\.[4-9]|[2-9])/, 'outBack 过冲 s > 1.3（果冻感）', warn);
  const pops = (code.match(/usePop\(\)/g) || []).length, physics = (code.match(/\b(springTrack|springStep|toss|drop|impulse|squash|ripple|twoEdge)\(/g) || []).length;
  if (pops > 0 && physics === 0) fail.push(`${sceneFile}: 只有 usePop 弹出，没有用任何物理函数（springTrack / toss / drop / impulse / squash …）`);
  if (!/\.sfx\s*=/.test(code)) warn.push(`${sceneFile}: 没有一个画面声明 sfx（接触帧上的音效）`);
  const configPath = `tutorials/${id}.json`;
  if (fs.existsSync(configPath)) {
    const cfg = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    if (cfg.look?.tour !== false) fail.push(`${configPath}: look.tour 没有关（每句整幅推拉）`);
    if (cfg.look?.particles !== false) warn.push(`${configPath}: look.particles 没有关（光点粒子）`);
  }
} else warn.push(`没有找到 ${sceneFile}（长文讲解只检查分镜）`);

for (const w of warn) console.log(`提醒 ${w}`);
for (const f of fail) console.log(`不过 ${f}`);
console.log(fail.length ? `判定：不过（${fail.length} 项）` : `判定：过${warn.length ? `（${warn.length} 条提醒）` : ''}`);
process.exit(fail.length ? 1 : 0);
