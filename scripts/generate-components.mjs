// Generates single cut-out components (transparent PNG) for a film — AI-drawn props that code then layers, moves and
// lights, never full-frame pictures (user, 2026-11-14: "avoid AI images that cover large portions of the frame; you may
// use AI image generation for individual components"). gpt-image-2 via OPENAI_API_KEY / OPENAI_BASE_URL.
//   node scripts/generate-components.mjs <id> [--force] [--only=a,b] [--concurrency=3]
// Config (tutorials/<id>.json): "componentStyle" (appended to every prompt) and "components": [{"id", "prompt", "size"?}].
// Output: public/images/<id>/parts/<cid>.png, trimmed to the object's bounding box (python3 + Pillow).
import {existsSync, readFileSync, writeFileSync, mkdirSync} from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const id = args.find((a) => !a.startsWith('--'));
if (!id) throw new Error('Usage: node scripts/generate-components.mjs <id> [--force] [--only=a,b]');
const force = args.includes('--force');
const only = args.find((a) => a.startsWith('--only='))?.slice(7).split(',');
const concurrency = Number(args.find((a) => a.startsWith('--concurrency='))?.slice(14) ?? 3);
const config = JSON.parse(readFileSync(path.join(root, 'tutorials', `${id}.json`), 'utf8'));
const style = config.componentStyle ?? '';
const parts = (config.components ?? []).filter((p) => !only || only.includes(p.id));
if (!parts.length) { console.log('No "components" in the config.'); process.exit(0); }
const dir = path.join(root, 'public', 'images', id, 'parts');
mkdirSync(dir, {recursive: true});
const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) throw new Error('Missing OPENAI_API_KEY.');
const base = (process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1').replace(/\/$/, '');
const TRIM = `import sys\nfrom PIL import Image\nim=Image.open(sys.argv[1]).convert('RGBA')\na=im.split()[3].point(lambda v:255 if v>12 else 0)\nb=a.getbbox()\nif b:\n  p=8;b=(max(0,b[0]-p),max(0,b[1]-p),min(im.width,b[2]+p),min(im.height,b[3]+p));im=im.crop(b)\nim.save(sys.argv[1],optimize=True)\nprint(im.size)`;

async function generate(part) {
  const out = path.join(dir, `${part.id}.png`);
  if (!force && existsSync(out)) return;
  let last;
  for (let attempt = 1; attempt <= 4; attempt += 1) {
    try {
      const res = await fetch(`${base}/images/generations`, {method: 'POST', headers: {Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json'},
        body: JSON.stringify({model: process.env.OPENAI_IMAGE_MODEL || 'gpt-image-2', prompt: `${part.prompt}. ${style}`, size: part.size ?? '1024x1024', background: 'transparent', quality: part.quality ?? 'high', n: 1})});
      const body = await res.json().catch(() => ({}));
      if (res.status === 429 || res.status >= 500) throw new Error(`HTTP ${res.status}`);
      if (!res.ok) throw new Error(`part ${part.id}: HTTP ${res.status} ${body.error?.message ?? ''}`);
      const b64 = body.data?.[0]?.b64_json;
      if (!b64) throw new Error(`part ${part.id}: no image data`);
      writeFileSync(out, Buffer.from(b64, 'base64'));
      const r = spawnSync('python3', ['-c', TRIM, out], {encoding: 'utf8'});
      console.log(`part ${part.id} ${r.stdout.trim()}`);
      return;
    } catch (e) { last = e; if (String(e.message).startsWith('part')) break; await new Promise((r) => setTimeout(r, 3000 * attempt)); }
  }
  throw last;
}
let cursor = 0;
await Promise.all(Array.from({length: Math.min(concurrency, parts.length)}, async () => {
  while (cursor < parts.length) await generate(parts[cursor++]);
}));
