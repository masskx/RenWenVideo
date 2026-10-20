// Find and download real sound effects from Freesound through the Openverse API (no key needed).
// Openverse indexes ~800k Freesound sounds with their licences; we keep only licences that allow commercial use
// and adaptation (CC0, CC BY), so a sound can be trimmed, mixed and used in a monetised video.
//
//   node scripts/fetch-sfx.mjs search "paper slide on table" [--n 10] [--max 4] [--license cc0,by]
//       -> candidates: openverse id, title, licence, length, creator, preview URL (listen before you pick)
//   node scripts/fetch-sfx.mjs get <openverse-id> <kind> [--from 0.05] [--len 1.2] [--gain -3]
//       -> public/audio/sfx/fs-<kind>.wav (trimmed, mono→stereo 44.1 kHz, peak-normalised) + public/audio/sfx/CREDITS.json
//   node scripts/fetch-sfx.mjs credits <scene-file.tsx ...>
//       -> the attribution lines for every fs-* sound those scenes use (paste into douyin/<id>/README.md)
//
// Scenes then use it like any synthesized sound: {at, kind: 'fs-<kind>', gain}. Rules: docs/video-craft/音效.md
import {execFileSync} from 'node:child_process';
import {existsSync, mkdirSync, readFileSync, rmSync, writeFileSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sfxDir = path.join(root, 'public', 'audio', 'sfx');
const creditsFile = path.join(sfxDir, 'CREDITS.json');
const API = 'https://api.openverse.org/v1/audio/';
const [cmd, ...rest] = process.argv.slice(2);
const opt = (name, fallback) => {
  const i = rest.indexOf(`--${name}`);
  return i >= 0 ? rest[i + 1] : fallback;
};
const positional = rest.filter((a, i) => !a.startsWith('--') && !(i > 0 && rest[i - 1].startsWith('--')));
const LICENSE_NAMES = {cc0: 'CC0（公共领域）', by: 'CC BY'};

async function api(url) {
  for (let attempt = 0; attempt < 4; attempt += 1) {
    const res = await fetch(url, {headers: {'User-Agent': 'RenWenVideo/1.0 (sound effects for explainer videos)'}});
    if (res.ok) return res.json();
    if (res.status !== 429 && res.status < 500) throw new Error(`Openverse ${res.status}: ${await res.text()}`);
    await new Promise((r) => setTimeout(r, 2000 * (attempt + 1)));
  }
  throw new Error('Openverse: too many retries');
}

async function search() {
  const q = positional.join(' ');
  if (!q) throw new Error('usage: fetch-sfx.mjs search "<what it should sound like>"');
  const n = Number(opt('n', 10)), maxSec = Number(opt('max', 6)), license = opt('license', 'cc0,by');
  const url = `${API}?q=${encodeURIComponent(q)}&source=freesound&license=${license}&page_size=${Math.min(50, n * 3)}`;
  const data = await api(url);
  const rows = data.results.filter((r) => !r.duration || r.duration <= maxSec * 1000).slice(0, n);
  console.log(`${data.result_count} results for "${q}" (licence ${license}, ≤ ${maxSec}s shown):`);
  for (const r of rows) {
    console.log(`- ${r.id}  ${(r.duration / 1000).toFixed(2)}s  ${r.license.toUpperCase()} ${r.license_version}  "${r.title}" by ${r.creator}`);
    console.log(`    listen: ${r.url}    page: ${r.foreign_landing_url}`);
  }
}

async function get() {
  const [id, kind] = positional;
  if (!id || !kind) throw new Error('usage: fetch-sfx.mjs get <openverse-id> <kind>');
  const r = await api(`${API}${id}/`);
  if (!['cc0', 'by'].includes(r.license)) throw new Error(`licence ${r.license} does not allow commercial use + adaptation; pick another sound`);
  const name = `fs-${kind.replace(/^fs-/, '')}`;
  mkdirSync(sfxDir, {recursive: true});
  const tmp = path.join(sfxDir, `.${name}.download`);
  const res = await fetch(r.url);
  if (!res.ok) throw new Error(`download ${res.status}: ${r.url}`);
  writeFileSync(tmp, Buffer.from(await res.arrayBuffer()));
  // Trim to the useful part, cut the lead-in silence, short fade-out, peak-normalise to -1 dBFS (then --gain).
  const from = Number(opt('from', 0)), len = opt('len');
  const af = ['silenceremove=start_periods=1:start_threshold=-50dB', ...(len ? [`atrim=0:${len}`] : []), 'areverse',
    'afade=t=in:d=0.04', 'areverse', `loudnorm=I=-16:TP=-1`, `volume=${opt('gain', 0)}dB`].join(',');
  execFileSync('ffmpeg', ['-y', '-v', 'error', '-ss', String(from), '-i', tmp, '-af', af, '-ar', '44100', '-ac', '2', path.join(sfxDir, `${name}.wav`)]);
  rmSync(tmp);
  const credits = existsSync(creditsFile) ? JSON.parse(readFileSync(creditsFile, 'utf8')) : {};
  credits[name] = {title: r.title, creator: r.creator, creator_url: r.creator_url, license: r.license, license_version: r.license_version,
    license_url: r.license_url, source: r.foreign_landing_url, openverse_id: r.id, attribution: r.attribution, fetched: new Date().toISOString().slice(0, 10)};
  writeFileSync(creditsFile, `${JSON.stringify(credits, null, 2)}\n`);
  console.log(`Saved public/audio/sfx/${name}.wav  (${r.license.toUpperCase()} ${r.license_version}, "${r.title}" by ${r.creator})`);
  console.log(`Use it in a scene: {at, kind: '${name}', gain: 0.2}`);
}

function credits() {
  const all = existsSync(creditsFile) ? JSON.parse(readFileSync(creditsFile, 'utf8')) : {};
  const used = new Set(positional.flatMap((f) => [...readFileSync(f, 'utf8').matchAll(/['"](fs-[a-z0-9-]+)['"]/g)].map((m) => m[1])));
  if (!used.size) return console.log('（这些场景没有用 Freesound 音效）');
  console.log('音效来自 Freesound（经 Openverse 检索）：');
  for (const k of [...used].sort()) {
    const c = all[k];
    if (!c) { console.log(`- ${k}: 缺少来源记录，先用 get 重新下载`); continue; }
    console.log(`- “${c.title}” by ${c.creator}，${LICENSE_NAMES[c.license] ?? c.license} ${c.license_version}，${c.source}`);
  }
}

const commands = {search, get, credits};
if (!commands[cmd]) {
  console.log('usage: node scripts/fetch-sfx.mjs search "<query>" | get <openverse-id> <kind> | credits <scene.tsx ...>');
  process.exit(1);
}
await commands[cmd]();
