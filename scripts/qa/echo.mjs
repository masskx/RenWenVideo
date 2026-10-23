// Echo check (复述检查): does the on-screen text repeat the narration? "A sign that restates the plot is the classic
// failure" (ClaudeAnimationBase), "frames with more words look worse" (PDoomVideo), and the user's own verdict on our
// cinema films: "像加了动画的 PPT，然后你照着念" (2026-10-23). Reads the scene source and the config, renders nothing.
//   node scripts/qa/echo.mjs <id> [--scene-file=src/tutorial/scenes/<id>.tsx]
// Lists every Chinese text literal in the scene file that is mostly a stretch of the narration (≥ 60 % of its characters,
// ≥ 5 in a row), the share of on-screen characters that are echoes, and how much text the film shows per second.
// Fails when more than a third of the on-screen text is narration (导演方法.md §三.5: on screen only what the viewer must
// *see* — a number, a name, a quoted line). Numbers alone and short labels (≤ 4 characters) are never echoes.
import fs from 'node:fs';

const args = process.argv.slice(2);
const id = args.find((a) => !a.startsWith('--'));
if (!id) { console.log('usage: node scripts/qa/echo.mjs <id> [--scene-file=path]'); process.exit(1); }
const file = args.find((a) => a.startsWith('--scene-file='))?.slice(13) ?? `src/tutorial/scenes/${id}.tsx`;
const cfg = JSON.parse(fs.readFileSync(`tutorials/${id}.json`, 'utf8'));
const tlPath = `tutorials/${id}.timeline.json`;
const seconds = fs.existsSync(tlPath) ? (() => { const t = JSON.parse(fs.readFileSync(tlPath, 'utf8')); return t.totalFrames / t.fps; })() : null;

const HAN = /[一-鿿]/g;
const han = (s) => (s.match(HAN) || []).join('');
// The narration as spoken text: cue markers out, [显示|朗读] → 显示, then only the Chinese characters.
const narr = han(cfg.scenes.map((s) => s.narration.replace(/\{[^}]*\}/g, '').replace(/\[([^|\]]*)\|[^\]]*\]/g, '$1')).join(''));

// Chinese text in the scene source, comments removed: string literals and JSX text.
const src = fs.readFileSync(file, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1');
const pieces = [...src.matchAll(/'([^'\n]*)'|"([^"\n]*)"|`([^`]*)`|>([^<>{}]+)</g)].map((m) => m[1] ?? m[2] ?? m[3] ?? m[4]).filter((s) => han(s).length > 0);

const longestRun = (a, b) => { // longest common substring length
  let best = 0;
  const prev = new Array(b.length + 1).fill(0);
  for (let i = 1; i <= a.length; i++) {
    let diag = 0;
    for (let j = 1; j <= b.length; j++) {
      const tmp = prev[j];
      prev[j] = a[i - 1] === b[j - 1] ? diag + 1 : 0;
      if (prev[j] > best) best = prev[j];
      diag = tmp;
    }
  }
  return best;
};

const seen = new Set();
let total = 0, echoed = 0;
const echoes = [];
for (const p of pieces) {
  const h = han(p);
  if (seen.has(h)) continue;
  seen.add(h);
  total += h.length;
  if (h.length <= 4) continue;
  const run = longestRun(h, narr);
  if (run >= 5 && run >= 0.6 * h.length) { echoed += h.length; echoes.push(`${p.trim()}  （${run}/${h.length} 字是口播原句）`); }
}
const share = total ? echoed / total : 0;
for (const e of echoes) console.log(`复述 ${e}`);
console.log(`上屏中文 ${total} 字，其中复述口播 ${echoed} 字（${Math.round(share * 100)}%）${seconds ? `；全片 ${seconds.toFixed(0)} 秒，平均每秒 ${(total / seconds).toFixed(1)} 个上屏字` : ''}`);
if (seconds && total / seconds > 3) console.log('提醒 上屏字偏多（> 3 字/秒）：字是画面的一部分，不是讲稿（PDoomVideo：字多的画面更难看）');
const fail = share > 1 / 3;
console.log(fail ? '判定：不过（超过三分之一的上屏字在复述口播；改成观众要“看”的东西：一个数字、一个名字、一句原话，或者一个会动的道具）' : '判定：过');
process.exit(fail ? 1 : 0);
