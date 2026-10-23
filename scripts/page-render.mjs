#!/usr/bin/env node
// Page renderer: any web page that can draw the frame for a time t becomes a video — Canvas 2D, SVG, WebGL, three.js,
// p5 / p5.brush, shaders, GSAP — so a scene can be written in the medium that suits it, not only as a Remotion component.
// Adapted from mg-styles-15's harness/render.mjs (MIT, © 2026 Vincentwei1021;
// docs/video-craft/prompt-library/code/Vincentwei1021__mg-styles-15/49052d8/harness/render.mjs).
//
// The page is an index.html in its own folder (pages/<id>/<scene>/). Three contracts are understood, so the reference
// library's demos run as they are:
//   mg15 / ours   window.__ready = true; window.renderAt = async (t) => {…}; optional window.DEMO = {width, height, fps, duration}
//   lemo          window.READY = true;   window.render(t);                  window.DUR = seconds
//   huashu-motion a root with data-composition-id / data-width / data-height and paused GSAP timelines in
//                 window.__timelines; its own page engine (runtime/om-engine.js, MIT, © alchaincyf) is injected before the
//                 page's scripts and does the seeking (timelines, CSS animations, <video>, fonts, images). Start one from a
//                 template with scripts/huashu-new.mjs.
// In every case CSS / Web Animations are seeked to t too, and t is a pure function: frames can be drawn in any order.
//
//   node scripts/page-render.mjs pages/demo/hello                         → pages/demo/hello/out/video.mp4
//   node scripts/page-render.mjs pages/demo/hello --stills 0.5,2,4        → out/stills/<t>.png (look at them)
//   options: --root <folder> (serve another tree)  --out file.mp4  --from 0 --to 6  --fps 30  --w 1080 --h 1920  --mb 4 --shutter 0.5 (motion blur)  --crf 16
//
// Use the clip in a tutorial as a scene backdrop (<OffthreadVideo>) or a whole scene, so the voice, captions and covers
// stay in the Remotion pipeline. How and when: docs/video-craft/导演方法.md §三.4.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import {spawn} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import puppeteer from 'puppeteer-core';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CHROME = process.env.PAGE_CHROME || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const FONT_FALLBACK = process.env.PAGE_FONT_FALLBACK || '/root/.local/share/fonts/NotoSansCJKsc-VF.otf';
// A missing font gets a static weight of 思源黑体 that matches its file name (a variable font loaded through FontFace without
// a weight renders Regular, so a page asking for NotoSansSC-900.woff got thin type). The weights ship with the repo
// (public/fonts/NotoSansSC-500/700/900.otf, OFL, GB2312 subset), so every container renders the same; serif requests get
// the repo's 思源宋体. PAGE_FONT_DIR can point at full static instances instead (NotoSansCJKsc-<weight>.otf).
const FONT_DIR = process.env.PAGE_FONT_DIR;
const WEIGHTS = {thin: 100, extralight: 200, light: 300, regular: 400, normal: 400, medium: 500, semibold: 600, demibold: 600, bold: 700, extrabold: 800, heavy: 800, black: 900};
const fallbackFor = (file) => {
  const name = path.basename(file).toLowerCase();
  const w = +(name.match(/[-_ ]([1-9]00)\b/)?.[1] ?? Object.entries(WEIGHTS).sort((a, b) => b[0].length - a[0].length).find(([k]) => name.includes(k))?.[1] ?? 400);
  const fonts = path.join(REPO, 'public/fonts');
  if (/serif|song|ming|garamond|baskerville|cinzel|playfair/.test(name)) {
    const serif = path.join(fonts, w >= 800 ? 'NotoSerifSC-Black.otf' : 'NotoSerifSC-Bold.otf');
    if (fs.existsSync(serif)) return serif;
  }
  if (FONT_DIR) {
    const have = [400, 500, 700, 800, 900].filter((k) => fs.existsSync(path.join(FONT_DIR, `NotoSansCJKsc-${k}.otf`)));
    if (have.length) return path.join(FONT_DIR, `NotoSansCJKsc-${have.reduce((a, b) => (Math.abs(b - w) < Math.abs(a - w) ? b : a))}.otf`);
  }
  if (w >= 450) {
    const best = [500, 700, 900].reduce((a, b) => (Math.abs(b - w) < Math.abs(a - w) ? b : a));
    if (fs.existsSync(path.join(fonts, `NotoSansSC-${best}.otf`))) return path.join(fonts, `NotoSansSC-${best}.otf`);
  }
  return fs.existsSync(FONT_FALLBACK) ? FONT_FALLBACK : path.join(fonts, 'NotoSansSC-VF.otf');
};
const OM_ENGINE = path.join(REPO, 'docs/video-craft/prompt-library/code/alchaincyf__huashu-motion/52467f9/runtime/om-engine.js');
const argv = process.argv.slice(2);
const opt = {_: []};
for (let i = 0; i < argv.length; i++) {
  const k = argv[i];
  if (!k.startsWith('--')) { opt._.push(k); continue; }
  const v = argv[i + 1];
  if (v === undefined || v.startsWith('--')) opt[k.slice(2)] = true; else { opt[k.slice(2)] = v; i++; }
}
// --root serves another folder (e.g. a cloned reference repo whose demo needs its own assets).
const ROOT = opt.root ? path.resolve(opt.root) : REPO;
const dir = opt._[0];
if (!dir) throw new Error('usage: node scripts/page-render.mjs <page folder> [--stills t,t] [--out f.mp4]');
const pageDir = path.resolve(ROOT, dir);
if (!fs.existsSync(path.join(pageDir, 'index.html'))) throw new Error(`no index.html in ${dir}`);
// Output next to the page; for a page served from another tree (a pinned reference snapshot, never modified) under qa/.
const outBase = opt.root ? path.join(REPO, 'qa', 'page-render', path.relative(ROOT, pageDir)) : path.join(pageDir, 'out');

const MIME = {'.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.json': 'application/json',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.ttf': 'font/ttf', '.otf': 'font/otf',
  '.woff': 'font/woff', '.woff2': 'font/woff2', '.wasm': 'application/wasm', '.glsl': 'text/plain', '.glb': 'model/gltf-binary', '.gltf': 'model/gltf+json',
  '.bin': 'application/octet-stream', '.mp4': 'video/mp4', '.wav': 'audio/wav', '.mp3': 'audio/mpeg'};
// Serve the whole repo, so a page can load shared code (pages/_lib/), fonts and public/ assets by absolute path.
const server = http.createServer((req, res) => {
  const u = new URL(req.url, 'http://x');
  let p = path.join(ROOT, decodeURIComponent(u.pathname));
  if (!p.startsWith(ROOT)) { res.writeHead(403); return res.end(); }
  if (fs.existsSync(p) && fs.statSync(p).isDirectory()) p = path.join(p, 'index.html');
  // A missing font file (reference repos often leave licensed fonts out) gets a CJK fallback instead of a 404, so
  // document.fonts.load() resolves and the page still renders; the lettering then differs from the original.
  if (!fs.existsSync(p) && /\.(ttf|otf|woff2?)$/i.test(p)) {
    const sub = fallbackFor(p);
    console.log(`[font fallback] ${u.pathname} → ${path.basename(sub)}`);
    res.writeHead(200, {'Content-Type': 'font/otf'});
    return fs.createReadStream(sub).pipe(res);
  }
  if (!fs.existsSync(p)) { res.writeHead(404); return res.end(`404 ${u.pathname}`); }
  res.writeHead(200, {'Content-Type': MIME[path.extname(p).toLowerCase()] || 'application/octet-stream', 'Cache-Control': 'no-store'});
  fs.createReadStream(p).pipe(res);
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const url = `http://127.0.0.1:${server.address().port}/${path.relative(ROOT, pageDir).split(path.sep).join('/')}/`;

const browser = await puppeteer.launch({executablePath: CHROME, headless: true, protocolTimeout: 600000,
  args: ['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--hide-scrollbars', '--font-render-hinting=none']});
try {
  const page = await browser.newPage();
  page.on('console', (m) => (m.type() === 'error' || m.type() === 'warn' || process.env.VERBOSE) && console.log(`[page ${m.type()}] ${m.text()}`));
  page.on('pageerror', (e) => console.log(`[page error] ${e.message}`));
  page.on('response', (r) => r.status() >= 400 && !r.url().endsWith('favicon.ico') && console.log(`[page ${r.status()}] ${r.url()}`));
  page.on('requestfailed', (r) => console.log(`[request failed] ${r.url()} ${r.failure()?.errorText ?? ''}`));
  const html = fs.readFileSync(path.join(pageDir, 'index.html'), 'utf8');
  const huashu = /data-composition-id=/.test(html);
  // A huashu composition sizes itself from its root; size the viewport before loading so its layout is final.
  const attr = (k) => +(html.match(new RegExp(`data-${k}="(\\d+)"`))?.[1] ?? 0);
  await page.setViewport(huashu ? {width: attr('width') || 1920, height: attr('height') || 1080} : {width: +(opt.w ?? 1080), height: +(opt.h ?? 1920)});
  if (huashu) await page.evaluateOnNewDocument(`window.__omConfig={video:'seek'};window.__omVariables={};\n${fs.readFileSync(OM_ENGINE, 'utf8')}`);
  await page.goto(url, {waitUntil: 'load', timeout: 180000});
  await page.waitForFunction('window.__ready === true || window.READY === true || window.__omReady === true || !!window.__omBootFailed', {timeout: 300000, polling: 100});
  const failed = await page.evaluate(() => window.__omBootFailed);
  if (failed) throw new Error(`the composition did not start: ${failed}`);
  await page.evaluate(() => document.fonts && document.fonts.ready);
  const demo = (await page.evaluate(() => window.__omEngine
    ? {...window.__omEngine.info(), duration: window.__omEngine.duration()}
    : {...(window.DEMO || {}), ...(window.DUR > 0 && !(window.DEMO && window.DEMO.duration) ? {duration: window.DUR} : {})})) ?? {};
  const W = +(opt.w ?? demo.width ?? 1080), H = +(opt.h ?? demo.height ?? 1920), FPS = +(opt.fps ?? demo.fps ?? 30);
  await page.setViewport({width: W, height: H});
  const seek = (t) => page.evaluate(async (t) => {
    if (window.__omEngine) return window.__omEngine.seek(t);
    for (const a of document.getAnimations()) { try { a.pause(); a.currentTime = t * 1000; } catch { /* finished animations */ } }
    if (typeof window.renderAt === 'function') await window.renderAt(t);
    else if (typeof window.render === 'function') await window.render(t);
  }, t);
  const shot = () => page.screenshot({type: 'png', clip: {x: 0, y: 0, width: W, height: H}, optimizeForSpeed: true});

  if (opt.stills) {
    const outDir = path.join(outBase, 'stills');
    fs.mkdirSync(outDir, {recursive: true});
    for (const t of String(opt.stills).split(',').map(Number)) {
      await seek(t);
      fs.writeFileSync(path.join(outDir, `${t.toFixed(2)}.png`), await shot());
      console.log(`still ${t.toFixed(2)} s`);
    }
  } else {
    const dur = +(opt.duration ?? demo.duration ?? 6), from = +(opt.from ?? 0), to = +(opt.to ?? dur);
    const MB = Math.max(1, +(opt.mb ?? 1)), SHUTTER = +(opt.shutter ?? 0.5);
    const out = path.resolve(REPO, opt.out ?? path.join(outBase, 'video.mp4'));
    fs.mkdirSync(path.dirname(out), {recursive: true});
    const frames = Math.round((to - from) * FPS);
    // Motion blur: MB sub-frames spread over the shutter (a fraction of the frame time), averaged by ffmpeg's tmix.
    const vf = MB > 1 ? ['-vf', `tmix=frames=${MB},select='eq(mod(n\\,${MB})\\,${MB - 1})',setpts=N/(${FPS}*TB)`] : [];
    const ff = spawn('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', '-f', 'image2pipe', '-framerate', String(FPS * MB), '-i', '-', ...vf,
      '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', String(opt.crf ?? 16), '-preset', 'medium', '-r', String(FPS), out], {stdio: ['pipe', 'inherit', 'inherit']});
    const done = new Promise((res, rej) => ff.on('close', (c) => (c === 0 ? res() : rej(new Error(`ffmpeg exit ${c}`)))));
    const t0 = Date.now();
    for (let i = 0; i < frames; i++) {
      for (let s = 0; s < MB; s++) {
        const t = from + (i + (MB > 1 ? (s / (MB - 1) - 0.5) * SHUTTER : 0)) / FPS;
        await seek(Math.max(from, t));
        const buf = await shot();
        if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once('drain', r));
      }
      if (i % 30 === 0) process.stdout.write(`\rframe ${i}/${frames}  ${((Date.now() - t0) / Math.max(1, i)).toFixed(0)} ms/frame   `);
    }
    ff.stdin.end();
    await done;
    console.log(`\n→ ${path.relative(REPO, out)}  (${W}×${H} @ ${FPS} fps, ${(frames / FPS).toFixed(2)} s)`);
  }
} finally {
  await browser.close();
  server.close();
}
