import type {Caption} from '@remotion/captions';
import React, {useMemo} from 'react';
import {AbsoluteFill, Img, Sequence, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {Audio} from '@remotion/media';
import {CutStage, Keyword, KeywordText, LightSweep, Particles, Stamp, anticipate, beatZoom, blink, clamp, ease, enter, planCuts, prog, shake, sway} from './fx';

export type ExplainerScene = {
  id: string; kind: 'hook' | 'intro' | 'chapter' | 'outro'; no?: number;
  headline: string[]; kicker?: string; tagline?: string; quote?: string; disclaimer?: string; recap?: string[];
  /** Main-action beat: a stamp that slams in when `at` (seconds) is spoken. */
  stamp?: {text: string; at: number} | null;
  from: number; durationInFrames: number; images: string[]; imageSwitch: number | null;
};
export type ExplainerTimeline = {
  id: string; title: string; series: string; source: {post: string; author: string; article: string; credit?: string};
  quoteLabel?: string;
  fps: number; width: number; height: number; durationInFrames: number; chapterCount: number;
  audioSrc: string; music: {src: string; volume: number} | null;
  /** The video's two core nouns, fixed colours A/B everywhere; plus caption emphasis words. */
  highlights?: {text: string; role: 'A' | 'B'}[]; emphasis?: string[];
  scenes: ExplainerScene[]; captions: Caption[];
};

const FONT = '"Noto Sans CJK SC", "Source Han Sans SC", "PingFang SC", "Microsoft YaHei", sans-serif';
const AMBER = '#ffc53d';
const CYAN = '#5ee7ff';
const INK = '#070b14';
// Fixed colours for the two core nouns (A/B); other accents stay out of these hues.
const COL_A = '#5ee7ff';
const COL_B = '#ff7eb6';
const CAPTION_BAND: [number, number] = [1290, 1500];
const pad = (n: number) => String(n).padStart(2, '0');

// Slow Ken Burns per image; cuts are hard because the CutStage transition covers them.
const KenBurns = ({src, frames, index}: {src: string; frames: number; index: number}) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [0, frames], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const zoomIn = index % 2 === 0;
  const scale = zoomIn ? 1.04 + p * 0.09 : 1.13 - p * 0.09;
  const y = interpolate(p, [0, 1], zoomIn ? [0, -24] : [-24, 0]);
  return <AbsoluteFill>
    <Img src={staticFile(src)} style={{width: '100%', height: '100%', objectFit: 'cover', transform: `translateY(${y}px) scale(${scale})`}}/>
  </AbsoluteFill>;
};

const SceneBackground = ({scene}: {scene: ExplainerScene}) => {
  const cut = scene.imageSwitch ?? scene.durationInFrames;
  return <AbsoluteFill>
    <Sequence durationInFrames={cut}><KenBurns src={scene.images[0]} frames={cut} index={0}/></Sequence>
    {scene.imageSwitch && scene.images[1] && <Sequence from={cut} durationInFrames={scene.durationInFrames - cut}>
      <KenBurns src={scene.images[1]} frames={scene.durationInFrames - cut} index={1}/>
    </Sequence>}
  </AbsoluteFill>;
};

const Shade = () => <AbsoluteFill style={{background: `linear-gradient(180deg, rgba(7,11,20,0.92) 0%, rgba(7,11,20,0.72) 22%, rgba(7,11,20,0.05) 42%, rgba(7,11,20,0.05) 55%, rgba(7,11,20,0.78) 72%, rgba(7,11,20,0.9) 100%)`}}/>;

/** Seconds since the enclosing Sequence started. */
const useLocalT = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return frame / fps;
};

// Highlighter stroke that draws itself across the words (p: 0..1).
const Marker = ({children, p = 1, color = AMBER}: {children: React.ReactNode; p?: number; color?: string}) =>
  <span style={{backgroundImage: `linear-gradient(180deg, transparent 58%, ${color}cc 58%, ${color}cc 92%, transparent 92%)`,
    backgroundRepeat: 'no-repeat', backgroundSize: `${Math.round(p * 100)}% 100%`, padding: '0 6px'}}>{children}</span>;

const ChapterHeadline = ({scene, total}: {scene: ExplainerScene; total: number}) => {
  const t = useLocalT();
  const a = anticipate(prog(t, 0.05, 0.45));
  const b = enter(t, 0.3, 0.4);
  const m = ease.outCubic(prog(t, 0.7, 0.45));
  const glow = 0.5 + 0.5 * blink(t, {period: 2.6, smooth: true});
  return <div style={{position: 'absolute', top: 210, left: 72, right: 72, fontFamily: FONT, color: '#fff'}}>
    <div style={{display: 'flex', alignItems: 'baseline', gap: 16, opacity: clamp(a * 2), transform: `translateX(${(1 - a) * -90}px)`}}>
      <span style={{fontSize: 132, fontWeight: 900, color: AMBER, lineHeight: 1, letterSpacing: -4,
        textShadow: `0 0 ${18 + glow * 22}px rgba(255,197,61,${0.25 + glow * 0.25})`}}>{pad(scene.no ?? 0)}</span>
      <span style={{fontSize: 44, fontWeight: 700, color: 'rgba(255,255,255,0.55)'}}>/ {pad(total)}</span>
    </div>
    <div style={{marginTop: 22, opacity: clamp(b * 1.5), transform: `translateY(${(1 - b) * 50}px)`}}>
      <div style={{fontSize: 86, fontWeight: 900, lineHeight: 1.18, textShadow: '0 4px 18px rgba(0,0,0,0.6)'}}>{scene.headline[0]}</div>
      <div style={{fontSize: 86, fontWeight: 900, lineHeight: 1.18, textShadow: '0 4px 18px rgba(0,0,0,0.6)'}}><Marker p={m}>{scene.headline[1]}</Marker></div>
    </div>
  </div>;
};

const CenterHeadline = ({scene}: {scene: ExplainerScene}) => {
  const t = useLocalT();
  const a = enter(t, 0.05, 0.4, 1.6);
  const b = enter(t, 0.25, 0.45);
  const c = enter(t, 0.5, 0.45);
  const m = ease.outCubic(prog(t, 0.85, 0.5));
  const big = scene.kind === 'hook';
  const sw = sway(t, 0.4, {dy: 4, deg: 0.6, breath: 0.012});
  return <div style={{position: 'absolute', top: big ? 300 : 250, left: 60, right: 60, textAlign: 'center', fontFamily: FONT, color: '#fff'}}>
    {scene.kicker && <div style={{display: 'inline-block', fontSize: 46, fontWeight: 700, color: INK, background: CYAN, padding: '8px 26px', borderRadius: 999,
      opacity: clamp(a * 2), transform: `scale(${0.6 + a * 0.4})`}}>{scene.kicker}</div>}
    <div style={{transform: `translateY(${sw.dy}px) scale(${sw.s})`}}>
      <div style={{marginTop: 34, fontSize: big ? 118 : 92, fontWeight: 900, lineHeight: 1.16, textShadow: '0 6px 24px rgba(0,0,0,0.7)', opacity: clamp(b * 1.5), transform: `translateY(${(1 - b) * 60}px)`}}>
        {scene.headline[0]}
      </div>
      <div style={{fontSize: big ? 118 : 92, fontWeight: 900, lineHeight: 1.16, textShadow: '0 6px 24px rgba(0,0,0,0.7)', opacity: clamp(c * 1.5), transform: `translateY(${(1 - c) * 60}px)`}}>
        <Marker p={m}>{scene.headline[1]}</Marker>
      </div>
    </div>
    {scene.tagline && <div style={{marginTop: 30, fontSize: 44, fontWeight: 700, color: AMBER, opacity: clamp(c)}}>{scene.tagline}</div>}
  </div>;
};

const QuoteCard = ({text, delay, label}: {text: string; delay: number; label: string}) => {
  const t = useLocalT();
  const a = enter(t, delay, 0.45, 1.2);
  const sw = sway(t, 1.7, {dy: 3, deg: 0.4, breath: 0.008});
  return <div style={{position: 'absolute', left: 72, right: 150, top: 1060, fontFamily: FONT,
    opacity: clamp(a * 1.5), transform: `translate(${(1 - a) * -80}px, ${sw.dy}px) rotate(${sw.deg}deg) scale(${sw.s})`,
    background: 'rgba(8,14,28,0.62)', borderLeft: `8px solid ${AMBER}`, borderRadius: 18, padding: '22px 28px',
    boxShadow: '0 10px 40px rgba(0,0,0,0.35)'}}>
    <div style={{fontSize: 30, fontWeight: 700, color: AMBER, marginBottom: 8, letterSpacing: 2}}>{label}</div>
    <div style={{fontSize: 42, fontWeight: 500, color: '#f4f6fb', lineHeight: 1.42}}>“{text}”</div>
  </div>;
};

const TopBar = ({timeline, current, t}: {timeline: ExplainerTimeline; current: number | null; t: number}) =>
  <div style={{position: 'absolute', top: 92, left: 72, right: 72, fontFamily: FONT}}>
    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 32, fontWeight: 700, color: 'rgba(255,255,255,0.86)'}}>
      <span>{timeline.series}</span>
      <span style={{fontSize: 26, fontWeight: 500, color: 'rgba(255,255,255,0.6)'}}>{timeline.source.credit ?? timeline.source.author} · AI 配图</span>
    </div>
    <div style={{display: 'flex', gap: 8, marginTop: 18}}>
      {Array.from({length: timeline.chapterCount}, (_, i) => {
        const active = current === i + 1;
        const u = ((t * 0.6) % 1) * 200 - 50;
        return <div key={i} style={{flex: 1, height: 8, borderRadius: 4,
          background: active ? `linear-gradient(90deg, ${AMBER} ${u - 30}%, #fff3c4 ${u}%, ${AMBER} ${u + 30}%)`
            : current !== null && i + 1 < current ? 'rgba(255,197,61,0.75)' : 'rgba(255,255,255,0.22)'}}/>;
      })}
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

const CaptionLine = ({captions, keywords, t}: {captions: Caption[]; keywords: Keyword[]; t: number}) => {
  const ms = t * 1000;
  const active = captions.find((c) => ms >= c.startMs && ms < c.endMs + 140);
  if (!active) return null;
  const pop = 0.94 + 0.06 * ease.outBack(prog(ms, active.startMs, 140), 1.6);
  return <div style={{position: 'absolute', top: 1400, left: 70, right: 70, transform: `translate(0, -50%) scale(${pop})`, textAlign: 'center',
    fontFamily: FONT, fontSize: 66, fontWeight: 900, lineHeight: 1.3, color: '#fff', textWrap: 'balance', whiteSpace: 'pre-line',
    WebkitTextStroke: '10px rgba(5,8,16,0.92)', paintOrder: 'stroke fill', textShadow: '0 6px 18px rgba(0,0,0,0.55)'}}>
    <KeywordText text={breakCaption(active.text)} keywords={keywords}/>
  </div>;
};

// Recap pills pop in two per caption beat (recap lines are split on ' · ').
const RecapPills = ({items, beats}: {items: string[]; beats: number[]}) => {
  const t = useLocalT();
  return <div style={{position: 'absolute', top: 1030, left: 72, right: 150, display: 'flex', flexWrap: 'wrap', gap: 16, justifyContent: 'center', fontFamily: FONT}}>
    {items.map((label, i) => {
      const at = (beats[Math.min(beats.length - 1, Math.floor(i / 2))] ?? 0) + (i % 2) * 0.35;
      const p = enter(t, at, 0.4, 1.7);
      const sw = sway(t, i * 1.3, {dy: 3, deg: 1.2});
      return <div key={label} style={{fontSize: 38, fontWeight: 800, color: '#fff', padding: '10px 26px', borderRadius: 999,
        background: 'rgba(8,14,28,0.72)', border: `3px solid ${i % 3 === 0 ? AMBER : 'rgba(255,255,255,0.35)'}`,
        opacity: clamp(p * 2), transform: `translateY(${(1 - p) * 60 + sw.dy}px) rotate(${sw.deg}deg) scale(${0.7 + 0.3 * p})`}}>{label}</div>;
    })}
  </div>;
};

const SceneOverlay = ({scene, timeline}: {scene: ExplainerScene; timeline: ExplainerTimeline}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const start = scene.from / fps;
  const out = interpolate(frame, [scene.durationInFrames - 8, scene.durationInFrames], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const beats = timeline.captions.filter((c) => c.startMs / 1000 >= start && c.startMs / 1000 < start + scene.durationInFrames / fps).map((c) => c.startMs / 1000 - start);
  return <AbsoluteFill style={{opacity: out}}>
    {scene.kind === 'chapter' ? <ChapterHeadline scene={scene} total={timeline.chapterCount}/> : <CenterHeadline scene={scene}/>}
    {scene.quote && <QuoteCard text={scene.quote} label={timeline.quoteLabel ?? '原话'} delay={Math.min(1.5, beats[1] ?? 1.2)}/>}
    {scene.stamp && <div style={{position: 'absolute', top: scene.tagline ? 920 : 700, left: 0, right: 90, display: 'flex', justifyContent: 'center'}}>
      <Stamp t={t} at={scene.stamp.at - start} text={scene.stamp.text} color={AMBER} size={72} deg={-7} font={FONT} style={{position: 'relative'}}/>
    </div>}
    {scene.disclaimer && <div style={{position: 'absolute', top: 1540, left: 0, right: 0, textAlign: 'center', fontFamily: FONT, fontSize: 30, color: 'rgba(255,255,255,0.7)'}}>* {scene.disclaimer}</div>}
    {scene.recap?.length ? <RecapPills items={scene.recap.flatMap((line) => line.split(' · '))} beats={beats}/> : null}
  </AbsoluteFill>;
};

export const ArticleExplainer = ({timeline}: {timeline: ExplainerTimeline}) => {
  const frame = useCurrentFrame();
  const {fps, width, height} = useVideoConfig();
  const t = frame / fps;
  const current = timeline.scenes.find((s) => frame >= s.from && frame < s.from + s.durationInFrames);
  const chapter = current?.kind === 'chapter' ? current.no ?? null : current?.kind === 'outro' ? timeline.chapterCount + 1 : null;

  // Section changes get big transitions over the whole picture; image switches inside a section get
  // small ones on the background only, so the chapter headline stays put.
  const [bigCuts, smallCuts] = useMemo(() => {
    const list = [
      ...timeline.scenes.slice(1).map((s) => ({at: s.from / fps, big: true})),
      ...timeline.scenes.filter((s) => s.imageSwitch).map((s) => ({at: (s.from + (s.imageSwitch ?? 0)) / fps, big: false})),
    ].sort((a, b) => a.at - b.at);
    const plan = planCuts(list.map((c) => c.at), (i) => list[i].big);
    return [plan.filter((_, i) => list[i].big), plan.filter((_, i) => !list[i].big)];
  }, [timeline, fps]);
  const beats = useMemo(() => timeline.captions.map((c) => c.startMs / 1000), [timeline]);
  const keywords = useMemo<Keyword[]>(() => [
    ...(timeline.highlights ?? []).map((h) => ({text: h.text, color: h.role === 'A' ? COL_A : COL_B})),
    ...(timeline.emphasis ?? []).map((text) => ({text, color: AMBER})),
  ], [timeline]);
  const hits = useMemo(() => timeline.scenes.flatMap((s) => (s.stamp ? [s.stamp.at] : [])), [timeline]);

  const bz = beatZoom(t, beats, {amp: 0.05, drift: 22});
  const sk = shake(t, hits, {amp: 14});
  return <AbsoluteFill style={{background: INK, overflow: 'hidden'}}>
    <AbsoluteFill style={{transform: `translate(${sk.dx}px, ${sk.dy}px)`}}>
      <CutStage t={t} cuts={bigCuts} width={width} height={height} colors={[AMBER, CYAN, INK]} fill={INK}>
        <CutStage t={t} cuts={smallCuts} width={width} height={height} colors={[AMBER, CYAN, INK]} fill={INK}>
          <AbsoluteFill style={{transform: `translate(${bz.dx}px, ${bz.dy}px) scale(${bz.s})`}}>
            {timeline.scenes.map((scene) => <Sequence key={`bg-${scene.id}`} from={scene.from} durationInFrames={scene.durationInFrames} name={`bg-${scene.id}`}>
              <SceneBackground scene={scene}/>
            </Sequence>)}
          </AbsoluteFill>
        </CutStage>
        <Shade/>
        <LightSweep t={t} period={9} opacity={0.1}/>
        <Particles t={t} width={width} height={height} kind="glow" n={34} colors={[AMBER, CYAN, '#ffffff']} area={[0, 160, width, CAPTION_BAND[0]]}/>
        {timeline.scenes.map((scene) => <Sequence key={scene.id} from={scene.from} durationInFrames={scene.durationInFrames} name={scene.id}>
          <SceneOverlay scene={scene} timeline={timeline}/>
        </Sequence>)}
      </CutStage>
    </AbsoluteFill>
    <TopBar timeline={timeline} current={chapter} t={t}/>
    <CaptionLine captions={timeline.captions} keywords={keywords} t={t}/>
    <Audio src={staticFile(timeline.audioSrc)}/>
    {timeline.music && <Audio src={staticFile(timeline.music.src)} volume={() => timeline.music?.volume ?? 0.08}/>}
  </AbsoluteFill>;
};
