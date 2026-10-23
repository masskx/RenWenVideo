// Prompt-library snapshot (提示词库快照): copy the prompt files of the repos listed in
// docs/video-craft/prompt-library/sources.json, verbatim, into vendor/<owner>__<repo>/<commit>/.
//   node scripts/prompts/snapshot.mjs                 # every source; new commits are added, nothing is overwritten
//   node scripts/prompts/snapshot.mjs --only=lemomo-ai/lemo-opuscar --pin
//   node scripts/prompts/snapshot.mjs --set=code      # the second set: engine code, demo source, reference images
//                                                     # (sources.json `code` patterns → code/<owner>__<repo>/<commit>/, pin `codePinned`)
// A snapshot directory is never modified once written, so a prompt that worked keeps its exact text even after
// the upstream repo changes, is renamed or disappears. The first snapshot of a source becomes its `pinned` one
// (what find.mjs reads); later snapshots move the pin only with --pin.
import { execFileSync } from 'node:child_process';
import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const LIB = 'docs/video-craft/prompt-library';
const args = process.argv.slice(2);
const only = args.find((a) => a.startsWith('--only='))?.slice(7);
const pin = args.includes('--pin');
// Two sets per source: the prompt/method docs (`include` → vendor/, pin `pinned`) and the working code and reference
// images (`code` → code/, pin `codePinned`), so the code can be added later without touching a docs snapshot.
const set = args.find((a) => a.startsWith('--set='))?.slice(6) ?? 'docs';
const SET = set === 'code' ? {key: 'code', dir: 'code', pin: 'codePinned'} : {key: 'include', dir: 'vendor', pin: 'pinned'};

const cfgPath = path.join(LIB, 'sources.json');
const cfg = JSON.parse(fs.readFileSync(cfgPath, 'utf8'));
const git = (cwd, ...a) => execFileSync('git', a, { cwd, encoding: 'utf8', env: { ...process.env, GIT_LFS_SKIP_SMUDGE: '1' } }).trim();

const walk = (dir, base = dir) => fs.readdirSync(dir, { withFileTypes: true }).flatMap((d) => {
  if (d.name === '.git') return [];
  const p = path.join(dir, d.name);
  return d.isDirectory() ? walk(p, base) : [path.relative(base, p).split(path.sep).join('/')];
});

for (const src of cfg.sources) {
  if (only && src.repo !== only) continue;
  const patterns = src[SET.key] ?? [];
  if (SET.key === 'code' && !patterns.length) continue;
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'prompt-snap-'));
  try {
    // Blobless clone + sparse checkout: only the listed files are downloaded (some repos carry 1 GB of demo media).
    git(tmp, 'clone', '-q', '--depth=1', '--filter=blob:none', '--no-checkout', `https://github.com/${src.repo}.git`, 'r');
    const r = path.join(tmp, 'r');
    git(r, 'sparse-checkout', 'set', '--no-cone', ...(patterns.length ? patterns : ['/.no-files-wanted']));
    git(r, 'checkout', '-q');
    const commit = git(r, 'rev-parse', 'HEAD');
    const id = commit.slice(0, 7);
    const dest = path.join(LIB, SET.dir, src.repo.replace('/', '__'), id);
    if (fs.existsSync(dest)) console.log(`= ${src.repo}@${id} 已有快照，不动`);
    else {
      const files = walk(r).sort();
      for (const f of files) {
        fs.mkdirSync(path.dirname(path.join(dest, f)), { recursive: true });
        fs.copyFileSync(path.join(r, f), path.join(dest, f));
      }
      const meta = {
        repo: src.repo,
        url: `https://github.com/${src.repo}`,
        commit,
        commitDate: git(r, 'log', '-1', '--format=%cI'),
        snapshotAt: new Date().toISOString(),
        license: src.license,
        include: patterns,
        files: files.map((f) => ({ path: f, bytes: fs.statSync(path.join(r, f)).size, sha256: crypto.createHash('sha256').update(fs.readFileSync(path.join(r, f))).digest('hex') })),
      };
      fs.mkdirSync(dest, { recursive: true });
      fs.writeFileSync(path.join(dest, 'SOURCE.json'), JSON.stringify(meta, null, 2) + '\n');
      console.log(`+ ${src.repo}@${id}：${files.length} 个文件 → ${dest}`);
    }
    if (!src[SET.pin] || pin) src[SET.pin] = id;
    else if (src[SET.pin] !== id) console.log(`  （仍固定在 ${src[SET.pin]}；要改用 ${id} 加 --pin）`);
  } catch (e) {
    console.error(`! ${src.repo}：${e.message.split('\n')[0]}（旧快照还在）`);
    process.exitCode = 1;
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
}
fs.writeFileSync(cfgPath, JSON.stringify(cfg, null, 2) + '\n');
