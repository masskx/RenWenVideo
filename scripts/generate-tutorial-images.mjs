// Generates the illustrated plates for a tutorial (tutorials/<id>.json) — the full-frame pictures that carry each scene,
// the way the early explainers (ai-era-11-rules, marketing-engineer) did. Same image model and settings as
// scripts/build-explainer.mjs (gpt-image-2 via OPENAI_API_KEY / OPENAI_BASE_URL, 1024×1536, stored as JPEG).
//   node scripts/generate-tutorial-images.mjs <id> [--force] [--only=plateId,plateId] [--concurrency=4]
// Config: a top-level "imageStyle" (appended to every prompt) and, per scene, "plates": [{"id": "door", "prompt": "…"}].
// Output: public/images/tutorials/<id>/<plateId>.jpg; scenes show them with <Plate> from src/tutorial/cinema.tsx.
// Why and when: docs/video-craft/导演方法.md §一.
import {existsSync, readFileSync, writeFileSync, mkdirSync, rmSync} from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const id = args.find((a) => !a.startsWith('--'));
if (!id) throw new Error('Usage: node scripts/generate-tutorial-images.mjs <id> [--force] [--only=a,b]');
const force = args.includes('--force');
const only = args.find((a) => a.startsWith('--only='))?.slice(7).split(',');
const concurrency = Number(args.find((a) => a.startsWith('--concurrency='))?.slice(14) ?? 4);

for (const line of existsSync(path.join(root, '.env')) ? readFileSync(path.join(root, '.env'), 'utf8').split(/\r?\n/) : []) {
  const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim().replace(/^(['"])(.*)\1$/, '$2');
}

const config = JSON.parse(readFileSync(path.join(root, 'tutorials', `${id}.json`), 'utf8'));
const style = config.imageStyle ?? '';
const plates = config.scenes.flatMap((s) => s.plates ?? []).filter((p) => !only || only.includes(p.id));
if (!plates.length) { console.log('No "plates" in the config.'); process.exit(0); }
const dir = path.join(root, 'public', 'images', 'tutorials', id);
mkdirSync(dir, {recursive: true});

const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) throw new Error('Missing OPENAI_API_KEY (image model for the plates).');
const base = (process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1').replace(/\/$/, '');

async function generate(plate) {
  const jpg = path.join(dir, `${plate.id}.jpg`), png = path.join(dir, `${plate.id}.png`);
  if (!force && existsSync(jpg)) return;
  let last;
  for (let attempt = 1; attempt <= 4; attempt += 1) {
    try {
      const res = await fetch(`${base}/images/generations`, {method: 'POST', headers: {Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json'},
        body: JSON.stringify({model: process.env.OPENAI_IMAGE_MODEL || 'gpt-image-2', prompt: `${plate.prompt}. ${style}`, size: '1024x1536', n: 1})});
      const body = await res.json().catch(() => ({}));
      if (res.status === 429 || res.status >= 500) throw new Error(`HTTP ${res.status}`);
      if (!res.ok) throw new Error(`plate ${plate.id}: HTTP ${res.status} ${body.error?.message ?? ''}`);
      const b64 = body.data?.[0]?.b64_json;
      if (!b64) throw new Error(`plate ${plate.id}: no image data`);
      writeFileSync(png, Buffer.from(b64, 'base64'));
      spawnSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', png, '-q:v', '2', jpg], {stdio: 'inherit'});
      rmSync(png, {force: true});
      console.log(`plate ${plate.id}`);
      return;
    } catch (e) { last = e; if (String(e.message).startsWith('plate')) break; await new Promise((r) => setTimeout(r, 2000 * attempt)); }
  }
  throw last;
}

let cursor = 0;
await Promise.all(Array.from({length: Math.min(concurrency, plates.length)}, async () => { while (cursor < plates.length) await generate(plates[cursor++]); }));
