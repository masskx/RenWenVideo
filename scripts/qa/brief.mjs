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
  const header = md.split('\n').find((l) => l.startsWith('| 镜头'));
  if (!header) fail.push('分镜里没有“| 镜头 |”开头的镜头表');
  else for (const col of ['主体', '受力', '错相', '音效']) if (!header.includes(col)) fail.push(`镜头表缺“${col}”一列`);
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
