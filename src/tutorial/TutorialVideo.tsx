import React from 'react';
import {AbsoluteFill, Sequence, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {Audio} from '@remotion/media';
import {captionY, color, font, stage} from './theme';
import {sceneRegistry} from './scenes';
import {Dino} from './ui';
import {SceneTiming, TimedCaption, TutorialProps} from './types';

const Background: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  return <AbsoluteFill style={{background: color.bg}}>
    <AbsoluteFill style={{background: `radial-gradient(900px 700px at ${20 + Math.sin(t / 6) * 8}% ${12 + Math.cos(t / 7) * 4}%, rgba(34,211,238,0.16), transparent 70%),
      radial-gradient(900px 800px at ${82 + Math.cos(t / 5) * 6}% ${78 + Math.sin(t / 8) * 5}%, rgba(167,139,250,0.18), transparent 70%)`}} />
    <AbsoluteFill style={{backgroundImage: 'radial-gradient(rgba(148,163,255,0.13) 2px, transparent 2px)', backgroundSize: '44px 44px',
      backgroundPosition: `0 ${(-frame * 0.4) % 44}px`, maskImage: 'linear-gradient(180deg, transparent, #000 20%, #000 80%, transparent)'}} />
  </AbsoluteFill>;
};

const Header: React.FC<{title: string; step: number; steps: string[]}> = ({title, step, steps}) => (
  <div style={{position: 'absolute', left: stage.left, width: stage.width, top: 196, display: 'flex', alignItems: 'center', gap: 18}}>
    <div style={{fontFamily: font, fontSize: 30, fontWeight: 800, color: color.text, padding: '8px 22px', borderRadius: 14,
      background: 'rgba(34,211,238,0.14)', border: `2px solid ${color.cyan}66`}}>{title}</div>
    <div style={{marginLeft: 'auto', display: 'flex', gap: 10}}>
      {steps.map((label, i) => {
        const n = i + 1;
        const active = n === step;
        const done = step > n;
        return <div key={label} style={{height: 46, minWidth: 46, padding: active ? '0 18px' : 0, borderRadius: 23, display: 'flex', alignItems: 'center',
          justifyContent: 'center', fontFamily: font, fontSize: 24, fontWeight: 800,
          background: active ? `linear-gradient(135deg, ${color.cyan}, ${color.violet})` : done ? `${color.green}33` : 'rgba(255,255,255,0.06)',
          color: active ? '#0a0e1a' : done ? color.green : color.dim, border: active ? 'none' : `2px solid ${done ? color.green : '#2a3352'}`}}>
          {active ? `${n} ${label}` : done ? '✓' : n}</div>;
      })}
    </div>
  </div>
);

// Highlight latin words and numbers (commands, tool names, values) in captions.
const TOKEN = /([A-Za-z0-9][A-Za-z0-9.%:\-_/]*)/g;
const Caption: React.FC<{captions: TimedCaption[]}> = ({captions}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const ms = frame / fps * 1000;
  const active = captions.find((c) => ms >= c.startMs && ms < c.endMs);
  if (!active) return null;
  const pop = interpolate(ms, [active.startMs, active.startMs + 90], [0.94, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const parts = active.text.split(TOKEN);
  return <div style={{position: 'absolute', top: captionY, left: stage.left - 20, width: stage.width + 40, transform: `translateY(-50%) scale(${pop})`,
    textAlign: 'center', fontFamily: font, fontWeight: 900, fontSize: 60, whiteSpace: 'nowrap', lineHeight: 1.3, color: '#ffffff', letterSpacing: 1,
    WebkitTextStroke: '10px #0a0e1a', paintOrder: 'stroke fill', textShadow: '0 6px 20px rgba(0,0,0,0.7)'}}>
    {parts.map((p, i) => (i % 2 ? <span key={i} style={{color: color.amber}}>{p}</span> : <React.Fragment key={i}>{p}</React.Fragment>))}
  </div>;
};

const SceneFrame: React.FC<{timing: SceneTiming; visual: string; credit: string}> = ({timing, visual, credit}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const Visual = sceneRegistry[visual];
  const cue = (name: string, fallback = 0) => (name in timing.cues ? Math.round(timing.cues[name] / 1000 * fps) : fallback);
  const enter = interpolate(frame, [0, 10], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const exit = interpolate(frame, [timing.durationFrames - 8, timing.durationFrames], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return <AbsoluteFill>
    <div style={{position: 'absolute', left: stage.left, top: stage.top, width: stage.width, height: stage.height,
      opacity: Math.min(enter, exit), transform: `translateY(${(1 - enter) * 30}px)`}}>
      {Visual && <Visual f={frame} dur={timing.durationFrames} cue={cue} credit={credit} />}
    </div>
    <Caption captions={timing.captions} />
  </AbsoluteFill>;
};

export const TutorialVideo: React.FC<TutorialProps> = ({tutorial, timing}) => {
  const {durationInFrames} = useVideoConfig();
  const leadFrames = Math.round((timing.leadMs ?? 0) / 1000 * tutorial.fps);
  return <AbsoluteFill style={{background: color.bg, overflow: 'hidden'}}>
    <Background />
    {timing.scenes.map((t) => {
      const scene = tutorial.scenes.find((s) => s.id === t.id);
      return <Sequence key={t.id} name={t.id} from={t.startFrame} durationInFrames={t.durationFrames}>
        <Header title={tutorial.title} step={scene?.step ?? 0} steps={tutorial.steps ?? []} />
        <SceneFrame timing={t} visual={scene?.visual ?? ''} credit={tutorial.credit} />
        <Sequence from={leadFrames} name={`${t.id}-voice`}><Audio src={staticFile(t.audioSrc)} /></Sequence>
      </Sequence>;
    })}
    {tutorial.musicSrc && <Audio src={staticFile(tutorial.musicSrc)} volume={(f) => {
      const base = tutorial.musicVolume ?? 0.07;
      const fadeIn = Math.min(1, f / 30);
      const fadeOut = Math.min(1, (durationInFrames - f) / 60);
      return Math.max(0, base * Math.min(fadeIn, fadeOut));
    }} />}
  </AbsoluteFill>;
};

/** Static Douyin cover (封面): the scene named by `tutorial.cover` (default: the first) at its settled state. */
export const TutorialCover: React.FC<TutorialProps> = ({tutorial, timing}) => {
  const coverId = tutorial.cover ?? tutorial.scenes[0].id;
  const scene = tutorial.scenes.find((s) => s.id === coverId) ?? tutorial.scenes[0];
  const t = timing.scenes.find((s) => s.id === scene.id) ?? timing.scenes[0];
  const Visual = sceneRegistry[scene.visual];
  const {fps} = useVideoConfig();
  const cue = (name: string, fallback = 0) => (name in t.cues ? Math.round(t.cues[name] / 1000 * fps) : fallback);
  return <AbsoluteFill style={{background: color.bg}}>
    <Background />
    <Header title={tutorial.title} step={0} steps={tutorial.steps ?? []} />
    <div style={{position: 'absolute', left: stage.left, top: stage.top, width: stage.width}}>
      {Visual && <Visual f={t.durationFrames - 10} dur={t.durationFrames} cue={cue} credit={tutorial.credit} />}
    </div>
    <div style={{position: 'absolute', top: captionY - 40, left: stage.left, width: stage.width, textAlign: 'center', fontFamily: font, fontWeight: 900,
      fontSize: 66, lineHeight: 1.35, color: '#fff', WebkitTextStroke: '10px #0a0e1a', paintOrder: 'stroke fill'}}>
      {tutorial.subtitle.split(' · ').map((line) => <div key={line}>{line}</div>)}
    </div>
    <div style={{position: 'absolute', top: captionY + 150, left: 0, right: 0, display: 'flex', justifyContent: 'center'}}><Dino size={200} run={0} /></div>
  </AbsoluteFill>;
};
