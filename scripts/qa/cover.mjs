// Cover check (封面检查): does the storyboard carry a 封面卡 (template, headline, one anchor, colours), is the headline
// within the template's length, is the text contrast enough — and how do the covers look at feed thumbnail sizes?
// (docs/video-craft/封面.md §一–§五)
//   node scripts/qa/cover.mjs <id>
// Fails (exit 1) on a missing card field, an unknown template, or headline contrast < 4.5:1; warns on length / < 7:1.
// Writes douyin/<id>/cover-thumbs.png (every cover at 80 / 160 / 360 px wide) — look at it and score the 10 points.
import {execFileSync} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const id = process.argv.slice(2).find((a) => !a.startsWith('--'));
if (!id) { console.log('usage: node scripts/qa/cover.mjs <id>'); process.exit(1); }
const fail = [], warn = [];
// Headline length (Chinese characters; a Latin word or a number counts as one) per template, from 封面.md §二.
const TEMPLATES = {数字型: [2, 12], 冲突型: [6, 12], 对比型: [8, 14], 情绪型: [4, 10]};

const lum = (hex) => {
  const c = hex.replace('#', '').match(/../g).map((h) => parseInt(h, 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
};
const contrast = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
const units = (s) => (s.match(/[一-鿿]|[A-Za-z]+|\d+(?:\.\d+)?/g) || []).length;

const storyboard = [`tutorials/${id}.storyboard.md`, `explainers/${id}.storyboard.md`].find((p) => fs.existsSync(p));
const card = storyboard && fs.readFileSync(storyboard, 'utf8').split(/\n## /).find((sec) => sec.startsWith('封面卡'));
if (!card) fail.push(`${storyboard ?? '分镜'} 里没有“## 封面卡”（封面.md §一：模板、封面标题、锚点、颜色）`);
else {
  const field = (k) => { const m = card.match(new RegExp(`^-\\s*${k}[：:]\\s*(.*)$`, 'm')); const v = m?.[1].trim(); return v && !/^<.*>$/.test(v) ? v : null; };
  for (const k of ['模板', '封面标题', '锚点', '颜色']) if (!field(k)) fail.push(`封面卡缺「${k}」`);
  const template = Object.keys(TEMPLATES).find((t) => field('模板')?.includes(t));
  if (field('模板') && !template) fail.push(`封面卡的模板要写 ${Object.keys(TEMPLATES).join(' / ')} 之一`);
  const headline = field('封面标题')?.match(/[“"]([^”"]+)[”"]/)?.[1] ?? field('封面标题');
  if (headline) {
    const n = units(headline);
    if (n > 16) fail.push(`封面标题“${headline}”${n} 个字，超过 16：拆成主标题 + 辅助句`);
    else if (template) { const [lo, hi] = TEMPLATES[template]; if (n < lo || n > hi) warn.push(`封面标题“${headline}”${n} 个字，${template}建议 ${lo}–${hi} 字`); }
    console.log(`封面标题：“${headline}”（${n} 字${template ? `，${template}` : ''}）`);
  }
  const hexes = field('颜色')?.match(/#[0-9a-fA-F]{6}\b/g) ?? [];
  if (field('颜色') && hexes.length < 2) fail.push('封面卡的颜色要写“字 #xxxxxx / 底 #xxxxxx”（再加至多一个强调色）');
  if (hexes.length >= 2) {
    const r = contrast(hexes[0], hexes[1]);
    console.log(`标题对比度：${hexes[0]} / ${hexes[1]} = ${r.toFixed(1)}:1`);
    if (r < 4.5) fail.push(`标题对比度 ${r.toFixed(1)}:1 < 4.5:1`); else if (r < 7) warn.push(`标题对比度 ${r.toFixed(1)}:1，缩略图里争取 ≥ 7:1`);
  }
  if (hexes.length > 3) warn.push(`封面颜色写了 ${hexes.length} 个：底 + 字 + 至多一个强调色`);
}

// Thumbnail sheet: each cover at its real feed size next to larger ones, all on one dark strip per cover.
const dir = path.join('douyin', id);
const covers = ['cover.jpg', 'cover-6x7.jpg', 'cover-9x16.jpg'].map((f) => path.join(dir, f)).filter((f) => fs.existsSync(f));
if (!covers.length) warn.push(`${dir} 里还没有封面图，渲染后再跑一次看缩略图`);
else {
  const out = path.join(dir, 'cover-thumbs.png');
  const widths = [80, 160, 360], H = 660;
  const inputs = covers.flatMap((f) => ['-i', f]);
  const chains = covers.map((_, i) => {
    const tiles = widths.map((w, j) => `[${i}:v]scale=${w}:-2,pad=${w + 30}:${H}:15:(oh-ih)/2:#202020[t${i}_${j}]`).join(';');
    return `${tiles};${widths.map((_, j) => `[t${i}_${j}]`).join('')}hstack=${widths.length}[r${i}]`;
  });
  const stack = covers.length > 1 ? `;${covers.map((_, i) => `[r${i}]`).join('')}vstack=${covers.length}[out]` : ';[r0]null[out]';
  execFileSync('ffmpeg', ['-y', '-v', 'error', ...inputs, '-filter_complex', chains.join(';') + stack, '-map', '[out]', '-frames:v', '1', out]);
  console.log(`缩略图：${out}（每行一张封面：${covers.map((f) => path.basename(f)).join('、')}；从左到右 80 / 160 / 360 px 宽）`);
  console.log('看图，按 封面.md §五 的十条打分（< 8 分就改），写进分镜的“静帧判断”。');
}

// Blank / thin covers (2026-11-23: xupt-half-radio shipped a near-empty cover — the frozen-frame cover drew the empty
// stage of a template film; user: "not visually appealing, lacks sophistication"). Measure each cover's detail: the share
// of pixels that differ clearly from the median background, and the spread of luminance. A poster has a hero object and
// type that cover a real part of the frame. Calibrated 2026-11-23: the blank cover 1.5 %, dark posters ≈ 24 %, light
// whiteboard posters (p-vs-np-agent-fleet) 11–17 % — fail < 6 %, warn < 15 %.
for (const f of covers) {
  const py = `import sys\nfrom PIL import Image, ImageStat, ImageFilter\nim=Image.open(sys.argv[1]).convert('L').resize((216,int(216*Image.open(sys.argv[1]).height/Image.open(sys.argv[1]).width)))\npx=list(im.tobytes());m=sorted(px)[len(px)//2]\nink=sum(1 for v in px if abs(v-m)>40)/len(px)\nedge=ImageStat.Stat(im.filter(ImageFilter.FIND_EDGES)).mean[0]\nprint(f'{ink:.3f} {ImageStat.Stat(im).stddev[0]:.1f} {edge:.1f}')`;
  try {
    const [ink, sd, edge] = execFileSync('python3', ['-c', py, f], {encoding: 'utf8'}).trim().split(' ').map(Number);
    console.log(`封面细节 ${path.basename(f)}：着墨 ${(ink * 100).toFixed(0)}%，亮度离散 ${sd}，边缘 ${edge}`);
    if (ink < 0.06 || sd < 22) fail.push(`${path.basename(f)} 几乎是空的（着墨 ${(ink * 100).toFixed(0)}% < 6% 或离散 ${sd} < 22）：用海报式封面（coverCard.poster，封面.md §〇），别冻结空舞台`);
    else if (ink < 0.15) warn.push(`${path.basename(f)} 着墨只有 ${(ink * 100).toFixed(0)}%：主体再大一点（锚点占画面高 30%–45%）`);
  } catch { warn.push(`没量到 ${path.basename(f)} 的细节（缺 python3 / Pillow）`); }
}
if (fs.existsSync(`tutorials/${id}.json`) && !JSON.parse(fs.readFileSync(`tutorials/${id}.json`, 'utf8')).coverCard) warn.push('配置里没有 coverCard：封面会冻结一帧；给它一张按片子自己的世界画的海报（coverCard.poster，封面.md §〇）');

for (const w of warn) console.log(`提醒：${w}`);
for (const f of fail) console.log(`不合格：${f}`);
console.log(fail.length ? '判定：不过' : '判定：过（缩略图仍要人眼看）');
process.exit(fail.length ? 1 : 0);
