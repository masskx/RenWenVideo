import {spawn} from 'node:child_process';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ids = process.argv.find((arg) => arg.startsWith('--episodes='))?.slice('--episodes='.length).split(',').filter(Boolean)
  ?? ['slow-life', 'solitude', 'listen-rain', 'morning-tea', 'walk-inward', 'leave-space', 'self-kindness'];
const concurrency = Number(process.argv.find((arg) => arg.startsWith('--concurrency='))?.slice('--concurrency='.length) ?? '2');
const voice = process.argv.find((arg) => arg.startsWith('--voice='))?.slice('--voice='.length) ?? 'longxiu_v3';
const rate = process.argv.find((arg) => arg.startsWith('--rate='))?.slice('--rate='.length) ?? '0.94';
const pitch = process.argv.find((arg) => arg.startsWith('--pitch='))?.slice('--pitch='.length) ?? '0.96';

function runEpisode(id) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [
      path.join(root, 'scripts', 'generate-voice.mjs'),
      `--episode=${id}`,
      '--generate',
      '--force',
      `--voice=${voice}`,
      `--rate=${rate}`,
      `--pitch=${pitch}`
    ], {cwd: root, stdio: 'inherit', windowsHide: true});
    child.on('error', reject);
    child.on('exit', (code) => code === 0 ? resolve(id) : reject(new Error(`${id} TTS failed with exit code ${code}`)));
  });
}

const queue = [...ids];
const results = [];
async function worker() {
  while (queue.length) {
    const id = queue.shift();
    if (!id) return;
    results.push(await runEpisode(id));
  }
}

await Promise.all(Array.from({length: Math.max(1, Math.min(concurrency, ids.length))}, worker));
console.log(`Generated ${results.length} voice tracks with ${voice}.`);
