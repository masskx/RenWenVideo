#!/usr/bin/env node
// Session check (开工自检): run first in a new session or container — `npm run doctor`. Says whether this machine can
// voice, render and check a video the way the repo expects, and what to do when something is missing. Prints which
// keys are set, never their values. Exit 1 when something required is missing.
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const rows = [];
const check = (need, name, ok, fix) => rows.push({need, name, ok: Boolean(ok), fix});
const has = (cmd, args = ['-version']) => { try { execFileSync(cmd, args, {stdio: 'ignore'}); return true; } catch { return false; } };
const exists = (p) => fs.existsSync(path.isAbsolute(p) ? p : path.join(REPO, p));

check('必需', 'node_modules（remotion、puppeteer-core）', exists('node_modules/remotion') && exists('node_modules/puppeteer-core'), 'npm ci');
check('必需', 'ffmpeg / ffprobe', has('ffmpeg') && has('ffprobe'), '装 ffmpeg（环境的 setup script）');
check('必需', 'python3（配音脚本）', has('python3', ['--version']), '装 python3');
const shell = process.env.REMOTION_BROWSER_EXECUTABLE || '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell';
check('必需', `Remotion 浏览器（${shell}）`, fs.existsSync(shell), '云端容器：export REMOTION_BROWSER_EXECUTABLE=… （见 CLAUDE.md Hard rules）；本机：npx remotion browser ensure');
check('必需', '豆包配音密钥 DOUBAO_API_KEY / DOUBAO_VOICE_ZH（只看有没有）', process.env.DOUBAO_API_KEY && process.env.DOUBAO_VOICE_ZH, '在环境的 secrets / .env 里设置（docs/video-craft/配音.md）；不要贴进对话或提交');
check('可选', '生图 OPENAI_API_KEY（缺素材时的辅助）', process.env.OPENAI_API_KEY, '需要生图时再设');
check('可选', '网页渲染用的 Chromium（scripts/page-render.mjs）', fs.existsSync(process.env.PAGE_CHROME || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome'), 'PAGE_CHROME=<chrome 路径>');
check('必需', '仓库字体 public/fonts（思源黑体 / 宋体 / 霞鹜文楷）', ['NotoSansSC-VF.otf', 'NotoSansSC-900.otf', 'NotoSerifSC-Black.otf', 'LXGWWenKai-Medium.ttf'].every((f) => exists(`public/fonts/${f}`)), 'git pull（字体随仓库提交）');
let sysFont = false;
try { sysFont = /Noto Sans CJK SC|Source Han Sans/i.test(execFileSync('fc-list', {encoding: 'utf8'})); } catch { /* no fontconfig */ }
check('可选', '系统思源黑体（没有也行：用仓库里的 RW Sans）', sysFont, '可不管；装上后字幕和仓库版本一致');
check('必需', '做片方法文档（导演方法 / 经验 / 速查）', ['docs/video-craft/导演方法.md', 'docs/video-craft/经验.md', 'docs/video-craft/quick-reference.md'].every(exists), 'git pull origin main');
check('可选', '参考库代码快照（prompt-library/code）', exists('docs/video-craft/prompt-library/code'), 'git pull origin main');

let branch = '';
try { branch = execFileSync('git', ['rev-parse', '--abbrev-ref', 'HEAD'], {cwd: REPO, encoding: 'utf8'}).trim(); } catch { /* not a checkout */ }
let behind = null;
try { behind = Number(execFileSync('git', ['rev-list', '--count', 'HEAD..origin/main'], {cwd: REPO, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore']}).trim()); } catch { /* no origin/main yet */ }
check('必需', `分支包含 main 的最新内容（当前 ${branch || '?'}）`, behind === 0, behind === null ? 'git fetch origin main 再跑一次' : `落后 main ${behind} 个提交：git fetch origin main && git merge origin/main`);

for (const r of rows) console.log(`${r.ok ? '✓' : r.need === '必需' ? '✗' : '·'} [${r.need}] ${r.name}${r.ok ? '' : `  → ${r.fix}`}`);
const bad = rows.filter((r) => !r.ok && r.need === '必需');
console.log(bad.length ? `\n判定：缺 ${bad.length} 项必需条件，先补上再做片` : '\n判定：可以开工。先读 docs/video-craft/quick-reference.md、导演方法.md、经验.md');
process.exit(bad.length ? 1 : 0);
