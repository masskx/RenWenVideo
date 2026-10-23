// Prompt-library search (提示词库检索): search the pinned snapshots in docs/video-craft/prompt-library/vendor/
// for prompts, style prompts and production docs that fit the script at hand (guide: prompt-library/选用指南.md).
//   node scripts/prompts/find.mjs 发布 数字            # every keyword must match; title hits rank first
//   node scripts/prompts/find.mjs '发布|launch' '数字|number'   # a|b = either word (opus55 prompts are mostly English)
//   node scripts/prompts/find.mjs explainer --source=opus55 --zh --limit=30
//   node scripts/prompts/find.mjs --show=lemo/dark-keynote   # full text + source repo@commit + licence
//   node scripts/prompts/find.mjs --list [--source=mg15]     # every entry id
// Sources: opus55 (703 prompts) · lemo (51 STYLE.md + DEMO.md + guides) · opuscar98 (98 style prompts) ·
// mg15 (15 MG style prompts) · ovp (18 Chinese-annotated prompts) · ac55 (prompt templates and case research) ·
// pdoom · cab (ClaudeAnimationBase) · huashu (huashu-motion: director, rhythm, colour, 20 visual languages, techniques).
import fs from 'node:fs';
import path from 'node:path';

const LIB = 'docs/video-craft/prompt-library';
const ALIAS = {
  'yihui-dev/awesome-opus5-5-videos': 'opus55',
  'lemomo-ai/lemo-opuscar': 'lemo',
  'mexicat/pdoom-video': 'pdoom',
  'Vincentwei1021/mg-styles-15': 'mg15',
  'JohnHeibel/ClaudeAnimationBase': 'cab',
  'athemeroy/awesome-claude-5-5-videos': 'ac55',
  'joeseesun/opus-video-prompts': 'ovp',
  'alchaincyf/huashu-motion': 'huashu',
};

const args = process.argv.slice(2);
const opt = (k) => args.find((a) => a.startsWith(`--${k}=`))?.slice(k.length + 3);
const terms = args.filter((a) => !a.startsWith('--')).map((t) => t.toLowerCase().split('|').filter(Boolean));
const show = opt('show'), only = opt('source'), limit = Number(opt('limit') ?? 15);
const zhOnly = args.includes('--zh'), list = args.includes('--list');
if (!terms.length && !show && !list) {
  console.log(fs.readFileSync(new URL(import.meta.url), 'utf8').split('\nimport')[0].replace(/^\/\/ ?/gm, ''));
  process.exit(1);
}

const cfg = JSON.parse(fs.readFileSync(path.join(LIB, 'sources.json'), 'utf8'));
const entries = [];
for (const src of cfg.sources) {
  const alias = ALIAS[src.repo];
  if (!alias || !src.pinned) continue;
  const root = path.join(LIB, 'vendor', src.repo.replace('/', '__'), src.pinned);
  const meta = JSON.parse(fs.readFileSync(path.join(root, 'SOURCE.json'), 'utf8'));
  const from = { repo: src.repo, commit: meta.commit, license: src.license };
  const add = (id, title, text, file, extra = {}) => entries.push({ id: `${alias}/${id}`, title, text, file: path.join(root, file), ...from, ...extra });
  const read = (f) => fs.readFileSync(path.join(root, f), 'utf8');
  const styleJson = {};
  if (alias === 'lemo') {
    for (const f of meta.files.filter((x) => x.path.endsWith('/style.json'))) {
      const s = JSON.parse(read(f.path));
      styleJson[s.slug] = s;
    }
    const opus98 = JSON.parse(read('styleboard/opuscar98_styles.json'));
    for (const film of opus98.films) {
      const text = ['desc_zh', 'prompt_zh', 'direction_zh', 'desc_en', 'prompt_en', 'direction_en']
        .map((k) => film[k] && `## ${k}\n${film[k]}`).filter(Boolean).join('\n\n')
        + `\n\n## blend\n${(film.blend_zh || []).join(' · ')}\n${(film.blend_en || []).join(' · ')}\n\n## shots\n${JSON.stringify(film.shots, null, 1)}`;
      entries.push({ id: `opuscar98/${film.no}`, title: `${film.style_zh}（${film.style_en}；《${film.zh}》${film.year}，${film.render}）`, text, file: path.join(root, 'styleboard/opuscar98_styles.json'), ...from });
    }
  }
  for (const { path: f } of meta.files) {
    if (alias === 'opus55' && f === 'data/videos.json') {
      for (const v of JSON.parse(read(f))) {
        add(v.slug, [`@${v.author}`, v.category, v.tech_tags.join('/'), v.prompt_partial && '部分提示词'].filter(Boolean).join(' · '), v.prompt, f, { post: v.post_url, remake: v.skillry_url });
      }
      continue;
    }
    if (!f.endsWith('.md')) continue;
    const text = read(f);
    const slug = f.match(/^styles\/([^/]+)\/(STYLE|DEMO)\.md$/);
    if (slug) {
      const s = styleJson[slug[1]] || {};
      const title = `${s.cn ?? slug[1]} ${s.en ?? ''}${slug[2] === 'DEMO' ? ' · 样片拆解' : ''} · ${s.category_cn ?? ''} · ${(s.uses || []).join(', ')}`;
      add(slug[2] === 'DEMO' ? `${slug[1]}/demo` : slug[1], title, `${s.line_cn ?? ''}\n\n${text}`, f);
    } else {
      add(f.replace(/^prompts\/|^docs\/|^skills\/huashu-motion\/references\//, '').replace(/\.md$/, ''), (text.match(/^#\s+(.+)$/m)?.[1] ?? f).trim(), text, f);
    }
  }
}

const header = (e) => `${e.id}  ${e.title}\n   ${e.repo}@${e.commit.slice(0, 7)} · ${path.relative('.', e.file)}${e.post ? ` · ${e.post}` : ''}`;

if (show) {
  const e = entries.find((x) => x.id === show) ?? entries.find((x) => x.id.endsWith(`/${show}`));
  if (!e) { console.error(`没有 ${show}；用 --list 看全部 id`); process.exit(1); }
  console.log(`${header(e)}\n   许可：${e.license}${e.remake ? `\n   重制：${e.remake}` : ''}\n\n${e.text}`);
  process.exit(0);
}

const pool = entries.filter((e) => (!only || e.id.startsWith(`${only}/`)) && (!zhOnly || /[一-鿿]/.test(e.text)));
if (list) {
  for (const e of pool) console.log(`${e.id}  ${e.title.slice(0, 100)}`);
  process.exit(0);
}

const count = (hay, alts) => alts.reduce((n, t) => n + hay.split(t).length - 1, 0);
const hits = pool.map((e) => {
  const title = e.title.toLowerCase(), text = e.text.toLowerCase();
  if (!terms.every((alts) => alts.some((t) => title.includes(t) || text.includes(t)))) return null;
  // Title hits dominate; body hits count per 1000 characters so long research docs don't swamp short prompts.
  const score = terms.reduce((s, t) => s + 20 * count(title, t) + Math.min(10, count(text, t) * 1000 / Math.max(text.length, 1000)), 0);
  const at = Math.max(-1, ...terms[0].map((t) => text.indexOf(t)));
  const snippet = at < 0 ? '' : e.text.slice(Math.max(0, at - 40), at + 80).replace(/\s+/g, ' ');
  return { e, score, snippet };
}).filter(Boolean).sort((a, b) => b.score - a.score);

for (const { e, snippet } of hits.slice(0, limit)) console.log(`${header(e)}${snippet ? `\n   …${snippet}…` : ''}\n`);
console.log(`共 ${hits.length} 条${hits.length > limit ? `，显示前 ${limit} 条（--limit=N 看更多）` : ''}；看全文：--show=<id>`);
