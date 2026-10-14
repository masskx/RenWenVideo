import {mkdir, readFile, stat, writeFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const value = (name, fallback = '') => args.find((arg) => arg.startsWith(`--${name}=`))?.slice(name.length + 3) ?? fallback;
const has = (name) => args.includes(`--${name}`);

function loadDotEnv(filePath) {
  return readFile(filePath, 'utf8').then((text) => {
    for (const line of text.split(/\r?\n/)) {
      const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
      if (!match || process.env[match[1]]) continue;
      const raw = match[2];
      process.env[match[1]] = (raw.startsWith('"') && raw.endsWith('"')) || (raw.startsWith("'") && raw.endsWith("'"))
        ? raw.slice(1, -1)
        : raw;
    }
  }).catch(() => {});
}

await loadDotEnv(path.join(root, '.env'));

const promptFile = path.resolve(root, value('prompt-file', 'prompts/solitude.jsonl'));
const outDir = path.resolve(root, value('out-dir', 'public/images'));
const concurrency = Math.max(1, Number(value('concurrency', '2')) || 2);
const force = has('force');
const dryRun = has('dry-run');
const apiKey = process.env.HUOSHAN_API_KEY;
if (!apiKey) throw new Error('Missing HUOSHAN_API_KEY in the project .env.');

const endpoint = process.env.HUOSHAN_ARK_IMAGE_ENDPOINT
  || process.env.HUOSHAN_IMAGE_ENDPOINT
  || 'https://ark.cn-beijing.volces.com/api/v3/images/generations';
const defaultModel = process.env.HUOSHAN_IMAGE_MODEL || 'doubao-seedream-4-0-250828';
const defaultSize = process.env.HUOSHAN_IMAGE_SIZE || '2K';
const lines = (await readFile(promptFile, 'utf8')).split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
const jobs = lines.map((line, index) => ({...JSON.parse(line), index}));
if (!jobs.length) throw new Error(`No prompts found in ${promptFile}.`);

if (dryRun) {
  console.log(`Provider: doubao`);
  console.log(`Model: ${defaultModel}`);
  console.log(`Endpoint: ${endpoint}`);
  console.log(`Jobs: ${jobs.length}`);
  for (const job of jobs) console.log(`- ${job.out || `generated-${String(job.index + 1).padStart(2, '0')}.png`}`);
  process.exit(0);
}

function safeOutputPath(relativeName) {
  const target = path.resolve(outDir, relativeName);
  if (!target.startsWith(outDir + path.sep)) throw new Error(`Invalid output path: ${relativeName}`);
  return target;
}

function doubaoSize(item) {
  if (process.env.HUOSHAN_IMAGE_SIZE) return process.env.HUOSHAN_IMAGE_SIZE;
  return /^\d+x\d+$/i.test(item.size || '') ? defaultSize : (item.size || defaultSize);
}

async function fetchWithRetry(url, init, attempts = 4) {
  let lastError;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const response = await fetch(url, init);
      if (response.status !== 429 && response.status < 500) return response;
      lastError = new Error(`HTTP ${response.status}`);
    } catch (error) {
      lastError = error;
    }
    await new Promise((resolve) => setTimeout(resolve, 1200 * attempt));
  }
  throw lastError;
}

async function generate(job) {
  const outputPath = safeOutputPath(job.out || `generated-${String(job.index + 1).padStart(2, '0')}.png`);
  if (!force) {
    try {
      if ((await stat(outputPath)).size > 0) {
        console.log(`Skipped existing ${path.relative(root, outputPath)}.`);
        return;
      }
    } catch {}
  }

  const response = await fetchWithRetry(endpoint, {
    method: 'POST',
    headers: {Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json'},
    body: JSON.stringify({
      model: job.model && job.model.startsWith('doubao-') ? job.model : defaultModel,
      prompt: job.prompt,
      size: doubaoSize(job),
      response_format: 'b64_json',
      watermark: false,
      sequential_image_generation: 'disabled'
    })
  });
  const text = await response.text();
  let payload;
  try { payload = JSON.parse(text); }
  catch { throw new Error(`Doubao returned non-JSON (HTTP ${response.status}).`); }
  if (!response.ok) throw new Error(`Doubao image generation failed (HTTP ${response.status}): ${payload.message || payload.error?.message || 'unknown error'}`);
  const item = payload.data?.[0];
  let bytes;
  if (item?.b64_json) bytes = Buffer.from(item.b64_json, 'base64');
  else if (item?.url) {
    const imageResponse = await fetchWithRetry(item.url);
    if (!imageResponse.ok) throw new Error(`Doubao image download failed (HTTP ${imageResponse.status}).`);
    bytes = Buffer.from(await imageResponse.arrayBuffer());
  } else throw new Error('Doubao response did not include image data.');
  await mkdir(path.dirname(outputPath), {recursive: true});
  await writeFile(outputPath, bytes);
  console.log(`Generated ${path.relative(root, outputPath)} (${bytes.length} bytes).`);
}

let cursor = 0;
async function worker() {
  while (true) {
    const index = cursor++;
    if (index >= jobs.length) return;
    await generate(jobs[index]);
  }
}
await Promise.all(Array.from({length: Math.min(concurrency, jobs.length)}, worker));
console.log(`Completed ${jobs.length} Doubao image jobs.`);
