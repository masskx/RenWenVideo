#!/usr/bin/env node
// Start a page scene from a huashu-motion template (花叔 alchaincyf/huashu-motion, MIT), the way its `om new` does, from
// the pinned copy in the reference library — then edit index.html and render it with scripts/page-render.mjs.
//   node scripts/huashu-new.mjs --list                                   the templates and what each is good for
//   node scripts/huashu-new.mjs <template> pages/<id>/<scene> [--vertical]
// --vertical makes it a 1080×1920 film (root data-width/height, canvas size, viewport); the clip grammars read their
// stage size from the root, but a layout written for 16:9 still needs looking at — render stills first.
// The "Made with huashu-motion" end signature is switched off (data-om-signature="off"): a foreign mark in the frame
// reads as another platform's trace on 抖音 (docs/video-craft/平台与合规.md §三.2); credit the template in the package
// README instead. Fonts are not vendored: page-render.mjs serves 思源黑体 for any missing font file.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PKG = path.join(REPO, 'docs/video-craft/prompt-library/code/alchaincyf__huashu-motion/52467f9');
const args = process.argv.slice(2);
const pos = args.filter((a) => !a.startsWith('--'));
const meta = (dir) => { try { return JSON.parse(fs.readFileSync(path.join(dir, 'template.json'), 'utf8')); } catch { return {}; } };

if (args.includes('--list') || !pos[0]) {
  for (const n of fs.readdirSync(path.join(PKG, 'templates')).filter((n) => fs.existsSync(path.join(PKG, 'templates', n, 'index.html')))) {
    const m = meta(path.join(PKG, 'templates', n));
    console.log(`${n.padEnd(14)} ${m.aspect ?? ''}  ${m.summary ?? ''}${m.best_for ? `\n${' '.repeat(21)}good for: ${m.best_for.join(', ')}` : ''}`);
  }
  if (!pos[0]) console.log('\nusage: node scripts/huashu-new.mjs <template> pages/<id>/<scene> [--vertical]');
  process.exit(0);
}
const [name, destArg] = pos;
const tpl = path.join(PKG, 'templates', name);
if (!fs.existsSync(path.join(tpl, 'index.html'))) throw new Error(`no template "${name}" (node scripts/huashu-new.mjs --list)`);
if (!destArg) throw new Error('usage: node scripts/huashu-new.mjs <template> pages/<id>/<scene> [--vertical]');
const dest = path.resolve(REPO, destArg);
if (fs.existsSync(path.join(dest, 'index.html'))) throw new Error(`${destArg} already has an index.html; not overwriting`);

fs.cpSync(tpl, dest, {recursive: true, filter: (src) => path.basename(src) !== 'template.json'});
for (const [from, to] of Object.entries(meta(tpl).copy ?? {})) {
  const src = path.join(PKG, from);
  if (fs.existsSync(src)) fs.cpSync(src, path.join(dest, to), {recursive: true});
  else console.log(`  skip ${from} (not vendored${/fonts\//.test(from) ? '; 思源黑体 is served instead' : ''})`);
}
fs.cpSync(path.join(PKG, 'runtime/om.js'), path.join(dest, 'vendor/om.js'));

let html = fs.readFileSync(path.join(dest, 'index.html'), 'utf8');
if (args.includes('--vertical')) {
  html = html
    .replace(/(data-composition-id="[^"]*"[^>]*?)data-width="\d+"/, '$1data-width="1080"')
    .replace(/(data-composition-id="[^"]*"[^>]*?)data-height="\d+"/, '$1data-height="1920"')
    .replace(/<canvas([^>]*?) width="1920" height="1080"/g, '<canvas$1 width="1080" height="1920"')
    .replace(/content="width=1920, height=1080"/, 'content="width=1080, height=1920"');
}
html = html.replace(/<html([^>]*?)>/, (m, a) => (/data-om-signature/.test(a) ? m : `<html${a} data-om-signature="off">`));
fs.writeFileSync(path.join(dest, 'index.html'), html);
console.log(`created ${path.relative(REPO, dest)} from huashu-motion/${name}${args.includes('--vertical') ? ' (1080×1920)' : ''}
next: edit index.html (the spec / timeline), then
  node scripts/page-render.mjs ${path.relative(REPO, dest)} --stills 0.5,2,4
  node scripts/page-render.mjs ${path.relative(REPO, dest)}`);
