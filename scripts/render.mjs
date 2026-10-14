import {bundle} from '@remotion/bundler';
import {selectComposition, renderMedia, renderStill} from '@remotion/renderer';
import {readFile, writeFile, rename, mkdir, readdir, access} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';

const require = createRequire(import.meta.url);
const {assessEpisode} = require('./replication-check.cjs');

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
process.chdir(root);
const args = process.argv.slice(2);
const draft = args.includes('--draft');
const availableEpisodes = process.env.ZEN_EPISODE_FILES ? JSON.parse(process.env.ZEN_EPISODE_FILES) : await readdir('episodes');
const files = args.includes('--all') ? availableEpisodes.filter(f=>f.endsWith('.json')).map(f=>`episodes/${f}`)
  : [args.find(a=>!a.startsWith('--')) ?? 'episodes/solitude.json'];
const withinPublic = (src) => {
  const target = path.resolve(root,'public',src);
  if (!target.startsWith(path.resolve(root,'public')+path.sep)) throw Error(`Invalid asset path: ${src}`);
  return target;
};
function validate(e) {
  if (!/^[a-z0-9-]+$/.test(e.id)) throw Error('Episode id must contain lowercase letters, numbers and hyphens');
  for (const key of ['fps','width','height']) if (!Number.isInteger(e[key]) || e[key]<=0) throw Error(`Invalid ${key}`);
  if (!e.shots?.length) throw Error('Episode has no shots');
  let end=0;
  const ids = new Set();
  for (const s of e.shots) {
    if (!Number.isInteger(s.start) || s.start!==end || !Number.isInteger(s.duration) || s.duration<1) throw Error(`Non-contiguous timeline at ${s.id}`);
    if (!['image','video'].includes(s.kind) || ids.has(s.id)) throw Error(`Invalid or duplicate shot ${s.id}`);
    if (![s.zoomFrom,s.zoomTo,s.panX].every(Number.isFinite)) throw Error(`Invalid motion ${s.id}`);
    if (s.kind==='video' && (!Number.isInteger(s.trimBefore ?? 0) || (s.trimBefore ?? 0)<0)) throw Error(`Invalid trim ${s.id}`);
    if (s.videoAudioMode !== undefined && !['mute','ambience','keep'].includes(s.videoAudioMode)) throw Error(`Invalid video audio mode ${s.id}`);
    if (s.videoAudioVolume !== undefined && (!Number.isFinite(s.videoAudioVolume) || s.videoAudioVolume<0 || s.videoAudioVolume>1)) throw Error(`Invalid video audio volume ${s.id}`);
    ids.add(s.id);end+=s.duration;
  }
  if (!Number.isInteger(e.transitionFrames) || e.transitionFrames<0 || e.transitionFrames>=Math.min(...e.shots.map(s=>s.duration))) throw Error('Invalid transitionFrames');
  if (!Number.isInteger(e.titleEnd) || e.titleEnd<8 || e.titleEnd>end) throw Error('Invalid title duration');
  if (!(e.subtitleY>0 && e.subtitleY<1 && e.subtitleSize>0)) throw Error('Invalid subtitle layout');
  let previousEnd=0;
  for (const c of e.captions) {
    if (!c.text || !Number.isFinite(c.startMs) || !Number.isFinite(c.endMs) || c.startMs<previousEnd || c.endMs<=c.startMs || c.endMs>end/e.fps*1000+1) throw Error(`Invalid caption: ${c.text}`);
    previousEnd=c.endMs;
  }
}
const jobs=[];
await access(withinPublic('fonts/simkai.ttf'));
await access(withinPublic('fonts/simsun.ttc'));
for (const file of files) {
  const episode=JSON.parse((await readFile(file,'utf8')).replace(/^\uFEFF/,''));
  validate(episode);
  const compliance = assessEpisode(episode);
  if (!compliance.ok) {
    throw Error(`Replication spec failed for ${episode.id}: ${compliance.errors.join(' | ')}`);
  }
  if (jobs.some(job=>job.id===episode.id)) throw Error(`Duplicate episode id: ${episode.id}`);
  for (const s of episode.shots) await access(withinPublic(s.src));
  if (episode.audioSrc) await access(withinPublic(episode.audioSrc));
  if (episode.musicSrc) await access(withinPublic(episode.musicSrc));
  jobs.push(episode);
}
await mkdir('out',{recursive:true});
if (args.includes('--check')) {console.log(`Validated ${jobs.length} episode(s), timelines and asset paths.`); process.exit(0);}
const serveUrl=await bundle({entryPoint:path.join(root,'src/index.ts')});
let browserExecutable=process.env.REMOTION_BROWSER_EXECUTABLE;
if (!browserExecutable && process.platform==='win32') {
  for (const candidate of ['C:/Program Files/Google/Chrome/Application/chrome.exe','C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe']) {
    try {await access(candidate);browserExecutable=candidate;break;} catch {}
  }
}
for (const episode of jobs) {
  const outputLocation=path.join(root,'out',`${episode.id}${draft?'-draft':''}${episode.audioSrc?'':'-silent'}.mp4`);
  let exists=false;try {await access(outputLocation);exists=true;} catch {}
  if (exists&&!args.includes('--overwrite')&&!args.includes('--stills')) {console.log(`Skipped existing ${outputLocation}`);continue;}
  const inputProps={episode};
  const composition=await selectComposition({serveUrl,id:'Solitude',inputProps,browserExecutable});
  if (args.includes('--stills')) {
    for (const frame of [25,Math.floor(composition.durationInFrames/2),composition.durationInFrames-15]) {
      await renderStill({serveUrl,composition,inputProps,browserExecutable,frame,output:path.join(root,'out',`${episode.id}-${frame}.png`)});
    }
    console.log(`Saved stills for ${episode.id}`);
    continue;
  }
  let last=-1;
  const pendingOutput=outputLocation.replace(/\.mp4$/,'.partial.mp4');
  await renderMedia({serveUrl,composition,inputProps,browserExecutable,outputLocation:pendingOutput,codec:'h264',crf:18,
    scale:draft?2/3:1,concurrency:2,onProgress:({progress})=>{const n=Math.floor(progress*10);if(n!==last){last=n;console.log(`${episode.id}: ${n*10}%`);}}});
  await rename(pendingOutput,outputLocation);
  console.log(`Saved ${outputLocation}`);
  const stamp = (ms) => {
    const t=Math.round(ms);
    return `${String(Math.floor(t/3600000)).padStart(2,'0')}:${String(Math.floor(t/60000)%60).padStart(2,'0')}:${String(Math.floor(t/1000)%60).padStart(2,'0')},${String(t%1000).padStart(3,'0')}`;
  };
  await writeFile(outputLocation.replace(/\.mp4$/,'.srt'),episode.captions.map((c,i)=>`${i+1}\n${stamp(c.startMs)} --> ${stamp(c.endMs)}\n${c.text}\n`).join('\n'),'utf8');
  await writeFile(outputLocation.replace(/\.mp4$/,'.json'),JSON.stringify({episode,output:{width:Math.round(composition.width*(draft?2/3:1)),height:Math.round(composition.height*(draft?2/3:1)),frames:composition.durationInFrames,fps:composition.fps},createdAt:new Date().toISOString()},null,2),'utf8');
}
