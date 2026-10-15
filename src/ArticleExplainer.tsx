import type {Caption} from '@remotion/captions';
import {AbsoluteFill, Easing, Img, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {Audio} from '@remotion/media';

export type ExplainerScene = {
  id: string; kind: 'hook' | 'intro' | 'chapter' | 'outro'; no?: number;
  headline: string[]; kicker?: string; tagline?: string; quote?: string; disclaimer?: string; recap?: string[];
  from: number; durationInFrames: number; images: string[]; imageSwitch: number | null;
};
export type ExplainerTimeline = {
  id: string; title: string; series: string; source: {post: string; author: string; article: string; credit?: string};
  quoteLabel?: string;
  fps: number; width: number; height: number; durationInFrames: number; chapterCount: number;
  audioSrc: string; music: {src: string; volume: number} | null;
  scenes: ExplainerScene[]; captions: Caption[];
};

const FONT = '"Noto Sans CJK SC", "Source Han Sans SC", "PingFang SC", "Microsoft YaHei", sans-serif';
const AMBER = '#ffc53d';
const CYAN = '#5ee7ff';
const INK = '#070b14';
const FADE = 12;
const ease = Easing.bezier(0.33, 0, 0.2, 1);
const pad = (n: number) => String(n).padStart(2, '0');

const KenBurns = ({src, frames, index}: {src: string; frames: number; index: number}) => {
  const frame = useCurrentFrame();
  const t = interpolate(frame, [0, frames], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const zoomIn = index % 2 === 0;
  const scale = zoomIn ? 1.04 + t * 0.09 : 1.13 - t * 0.09;
  const y = interpolate(t, [0, 1], zoomIn ? [0, -24] : [-24, 0]);
  const opacity = interpolate(frame, [0, FADE], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return <AbsoluteFill style={{opacity}}>
    <Img src={staticFile(src)} style={{width: '100%', height: '100%', objectFit: 'cover', transform: `translateY(${y}px) scale(${scale})`}}/>
  </AbsoluteFill>;
};

const SceneBackground = ({scene}: {scene: ExplainerScene}) => {
  const cut = scene.imageSwitch ?? scene.durationInFrames;
  return <AbsoluteFill>
    <Sequence durationInFrames={scene.imageSwitch ? cut + FADE : scene.durationInFrames + FADE}>
      <KenBurns src={scene.images[0]} frames={scene.imageSwitch ? cut + FADE : scene.durationInFrames + FADE} index={0}/>
    </Sequence>
    {scene.imageSwitch && scene.images[1] && <Sequence from={cut} durationInFrames={scene.durationInFrames - cut + FADE}>
      <KenBurns src={scene.images[1]} frames={scene.durationInFrames - cut + FADE} index={1}/>
    </Sequence>}
  </AbsoluteFill>;
};

const Shade = () => <AbsoluteFill style={{background: `linear-gradient(180deg, rgba(7,11,20,0.92) 0%, rgba(7,11,20,0.72) 22%, rgba(7,11,20,0.05) 42%, rgba(7,11,20,0.05) 55%, rgba(7,11,20,0.78) 72%, rgba(7,11,20,0.9) 100%)`}}/>;

const useEnter = (delay = 0) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return spring({frame: frame - delay, fps, config: {damping: 200}, durationInFrames: 18});
};

const Marker = ({children, color = AMBER}: {children: React.ReactNode; color?: string}) =>
  <span style={{background: `linear-gradient(180deg, transparent 58%, ${color}cc 58%, ${color}cc 92%, transparent 92%)`, padding: '0 6px'}}>{children}</span>;

const ChapterHeadline = ({scene, total}: {scene: ExplainerScene; total: number}) => {
  const a = useEnter(2);
  const b = useEnter(8);
  return <div style={{position: 'absolute', top: 210, left: 72, right: 72, fontFamily: FONT, color: '#fff'}}>
    <div style={{display: 'flex', alignItems: 'baseline', gap: 16, opacity: a, transform: `translateX(${(1 - a) * -60}px)`}}>
      <span style={{fontSize: 132, fontWeight: 900, color: AMBER, lineHeight: 1, letterSpacing: -4}}>{pad(scene.no ?? 0)}</span>
      <span style={{fontSize: 44, fontWeight: 700, color: 'rgba(255,255,255,0.55)'}}>/ {pad(total)}</span>
    </div>
    <div style={{marginTop: 22, opacity: b, transform: `translateY(${(1 - b) * 40}px)`}}>
      <div style={{fontSize: 86, fontWeight: 900, lineHeight: 1.18, textShadow: '0 4px 18px rgba(0,0,0,0.6)'}}>{scene.headline[0]}</div>
      <div style={{fontSize: 86, fontWeight: 900, lineHeight: 1.18, textShadow: '0 4px 18px rgba(0,0,0,0.6)'}}><Marker>{scene.headline[1]}</Marker></div>
    </div>
  </div>;
};

const CenterHeadline = ({scene}: {scene: ExplainerScene}) => {
  const a = useEnter(0);
  const b = useEnter(7);
  const c = useEnter(16);
  const big = scene.kind === 'hook';
  return <div style={{position: 'absolute', top: big ? 300 : 250, left: 60, right: 60, textAlign: 'center', fontFamily: FONT, color: '#fff'}}>
    {scene.kicker && <div style={{display: 'inline-block', fontSize: 46, fontWeight: 700, color: INK, background: CYAN, padding: '8px 26px', borderRadius: 999,
      opacity: a, transform: `scale(${0.8 + a * 0.2})`}}>{scene.kicker}</div>}
    <div style={{marginTop: 34, fontSize: big ? 118 : 92, fontWeight: 900, lineHeight: 1.16, textShadow: '0 6px 24px rgba(0,0,0,0.7)', opacity: b, transform: `translateY(${(1 - b) * 50}px)`}}>
      {scene.headline[0]}
    </div>
    <div style={{fontSize: big ? 118 : 92, fontWeight: 900, lineHeight: 1.16, textShadow: '0 6px 24px rgba(0,0,0,0.7)', opacity: c, transform: `translateY(${(1 - c) * 50}px)`}}>
      <Marker>{scene.headline[1]}</Marker>
    </div>
    {scene.tagline && <div style={{marginTop: 30, fontSize: 44, fontWeight: 700, color: AMBER, opacity: c}}>{scene.tagline}</div>}
  </div>;
};

const QuoteCard = ({text, delay, label}: {text: string; delay: number; label: string}) => {
  const a = useEnter(delay);
  return <div style={{position: 'absolute', left: 72, right: 150, top: 1060, fontFamily: FONT,
    opacity: a, transform: `translateY(${(1 - a) * 30}px)`,
    background: 'rgba(8,14,28,0.62)', borderLeft: `8px solid ${AMBER}`, borderRadius: 18, padding: '22px 28px',
    boxShadow: '0 10px 40px rgba(0,0,0,0.35)'}}>
    <div style={{fontSize: 30, fontWeight: 700, color: AMBER, marginBottom: 8, letterSpacing: 2}}>{label}</div>
    <div style={{fontSize: 42, fontWeight: 500, color: '#f4f6fb', lineHeight: 1.42}}>“{text}”</div>
  </div>;
};

const TopBar = ({timeline, current}: {timeline: ExplainerTimeline; current: number | null}) =>
  <div style={{position: 'absolute', top: 92, left: 72, right: 72, fontFamily: FONT}}>
    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 32, fontWeight: 700, color: 'rgba(255,255,255,0.86)'}}>
      <span>{timeline.series}</span>
      <span style={{fontSize: 26, fontWeight: 500, color: 'rgba(255,255,255,0.6)'}}>{timeline.source.credit ?? timeline.source.author} · AI 配图</span>
    </div>
    <div style={{display: 'flex', gap: 8, marginTop: 18}}>
      {Array.from({length: timeline.chapterCount}, (_, i) => <div key={i} style={{flex: 1, height: 8, borderRadius: 4,
        background: current !== null && i + 1 < current ? 'rgba(255,197,61,0.75)' : current === i + 1 ? AMBER : 'rgba(255,255,255,0.22)'}}/>)}
    </div>
  </div>;

// Break long captions at the punctuation nearest the middle instead of mid-word.
const breakCaption = (text: string) => {
  if (text.length <= 14) return text;
  const marks = [...text.matchAll(/[，、：？]/g)].map((m) => m.index ?? 0).filter((i) => i > 3 && i < text.length - 3);
  if (!marks.length) return text;
  const at = marks.reduce((best, i) => Math.abs(i - text.length / 2) < Math.abs(best - text.length / 2) ? i : best);
  return `${text.slice(0, at + 1)}\n${text.slice(at + 1)}`;
};

const CaptionLine = ({captions}: {captions: Caption[]}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const ms = frame / fps * 1000;
  const active = captions.find((c) => ms >= c.startMs && ms < c.endMs + 140);
  if (!active) return null;
  const pop = interpolate(ms, [active.startMs, active.startMs + 120], [0.94, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease});
  return <div style={{position: 'absolute', top: 1400, left: 70, right: 70, transform: `translate(0, -50%) scale(${pop})`, textAlign: 'center',
    fontFamily: FONT, fontSize: 66, fontWeight: 900, lineHeight: 1.3, color: '#fff', textWrap: 'balance', whiteSpace: 'pre-line',
    WebkitTextStroke: '10px rgba(5,8,16,0.92)', paintOrder: 'stroke fill', textShadow: '0 6px 18px rgba(0,0,0,0.55)'}}>{breakCaption(active.text)}</div>;
};

const SceneOverlay = ({scene, timeline}: {scene: ExplainerScene; timeline: ExplainerTimeline}) => {
  const frame = useCurrentFrame();
  const out = interpolate(frame, [scene.durationInFrames - 8, scene.durationInFrames], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return <AbsoluteFill style={{opacity: out}}>
    {scene.kind === 'chapter' ? <ChapterHeadline scene={scene} total={timeline.chapterCount}/> : <CenterHeadline scene={scene}/>}
    {scene.quote && <QuoteCard text={scene.quote} label={timeline.quoteLabel ?? '原话'} delay={Math.min(45, Math.round(scene.durationInFrames * 0.18))}/>}
    {scene.disclaimer && <div style={{position: 'absolute', top: 1540, left: 0, right: 0, textAlign: 'center', fontFamily: FONT, fontSize: 30, color: 'rgba(255,255,255,0.7)'}}>* {scene.disclaimer}</div>}
    {scene.recap?.length && <div style={{position: 'absolute', top: 1040, left: 72, right: 72, textAlign: 'center', fontFamily: FONT,
      background: 'rgba(8,14,28,0.68)', borderRadius: 18, padding: '18px 10px', borderTop: `4px solid ${AMBER}`}}>
      {scene.recap.map((line) => <div key={line} style={{fontSize: 40, fontWeight: 700, color: 'rgba(255,255,255,0.9)', lineHeight: 1.6}}>{line}</div>)}
    </div>}
  </AbsoluteFill>;
};

export const ArticleExplainer = ({timeline}: {timeline: ExplainerTimeline}) => {
  const frame = useCurrentFrame();
  const current = timeline.scenes.find((s) => frame >= s.from && frame < s.from + s.durationInFrames);
  const chapter = current?.kind === 'chapter' ? current.no ?? null : current?.kind === 'outro' ? timeline.chapterCount + 1 : null;
  return <AbsoluteFill style={{background: INK, overflow: 'hidden'}}>
    {timeline.scenes.map((scene) => <Sequence key={`bg-${scene.id}`} from={scene.from} durationInFrames={scene.durationInFrames + FADE} name={`bg-${scene.id}`}>
      <SceneBackground scene={scene}/>
    </Sequence>)}
    <Shade/>
    {timeline.scenes.map((scene) => <Sequence key={scene.id} from={scene.from} durationInFrames={scene.durationInFrames} name={scene.id}>
      <SceneOverlay scene={scene} timeline={timeline}/>
    </Sequence>)}
    <TopBar timeline={timeline} current={chapter}/>
    <CaptionLine captions={timeline.captions}/>
    <Audio src={staticFile(timeline.audioSrc)}/>
    {timeline.music && <Audio src={staticFile(timeline.music.src)} volume={() => timeline.music?.volume ?? 0.08}/>}
  </AbsoluteFill>;
};
