import {existsSync, mkdirSync, readFileSync, rmSync, writeFileSync} from 'node:fs';
import {mkdtemp} from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {spawn} from 'node:child_process';
import {fileURLToPath} from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const value = (name, fallback = '') => args.find((arg) => arg.startsWith(`--${name}=`))?.slice(name.length + 3) ?? fallback;

function loadDotEnv(filePath) {
  if (!existsSync(filePath)) return;
  for (const line of readFileSync(filePath, 'utf8').split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
    if (!match || process.env[match[1]]) continue;
    const raw = match[2].trim();
    process.env[match[1]] = ((raw.startsWith('"') && raw.endsWith('"')) || (raw.startsWith("'") && raw.endsWith("'")))
      ? raw.slice(1, -1)
      : raw;
  }
}
loadDotEnv(path.join(root, '.env'));

const promptFile = path.resolve(root, value('prompt-file'));
const outDir = path.resolve(root, value('out-dir', 'public/images'));
const concurrency = value('concurrency', '2');
const jobs = readFileSync(promptFile, 'utf8').split(/\r?\n/).map((line) => line.trim()).filter(Boolean).map((line) => JSON.parse(line));
const missing = jobs.filter((job) => !job.out || !existsSync(path.join(outDir, path.basename(job.out))));

console.log(`Images2 jobs: ${jobs.length}; missing: ${missing.length}`);
if (!missing.length) process.exit(0);
if (!process.env.OPENAI_API_KEY) throw new Error('Images2 requires OPENAI_API_KEY in the shell or project .env.');

const tempDir = await mkdtemp(path.join(os.tmpdir(), 'zen-images-'));
const tempFile = path.join(tempDir, 'missing.jsonl');
mkdirSync(outDir, {recursive: true});
writeFileSync(tempFile, `${missing.map((job) => JSON.stringify(job)).join('\n')}\n`, 'utf8');
const skillScript = process.env.IMAGEGEN_SCRIPT || path.join(process.env.USERPROFILE || '', '.codex', 'skills', '.system', 'imagegen', 'scripts', 'image_gen.py');

try {
  await new Promise((resolve, reject) => {
    const child = spawn(process.env.PYTHON || 'python', [skillScript, 'generate-batch', '--input', tempFile, '--out-dir', outDir, '--concurrency', concurrency, '--max-attempts', '2'], {
      cwd: root,
      stdio: 'inherit',
      windowsHide: true
    });
    child.on('error', reject);
    child.on('exit', (code) => code === 0 ? resolve() : reject(new Error(`Images2 generation failed with exit code ${code}`)));
  });
} finally {
  rmSync(tempDir, {recursive: true, force: true});
}
