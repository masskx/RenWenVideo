import React, {useMemo} from 'react';
import {AbsoluteFill, Sequence, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {Audio} from '@remotion/media';
import {Layout, Palette, blueprint, color, font, layoutOf, mono, palette, paper} from './theme';
import {sceneRegistry} from './scenes';
import {Dino} from './ui';
import {CoverRatio, SceneTiming, TimedCaption, Tutorial, TutorialProps} from './types';
import {CutStage, Particles, beatTour, clamp, ease, follow, hash, planCuts, prog, sway} from '../fx';

type Theme = 'dark' | 'paper' | 'blueprint';
const themeOf = (tutorial: Tutorial): Theme => tutorial.look?.theme ?? 'dark';
const LayoutCtx = React.createContext<Layout>(layoutOf(undefined));
const useLayout = () => React.useContext(LayoutCtx);

const DarkBackground: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  return <AbsoluteFill style={{background: color.bg}}>
    <AbsoluteFill style={{background: `radial-gradient(900px 700px at ${20 + Math.sin(t / 3) * 16}% ${14 + Math.cos(t / 4) * 9}%, rgba(34,211,238,0.16), transparent 70%),
      radial-gradient(900px 800px at ${80 + Math.cos(t / 2.6) * 14}% ${76 + Math.sin(t / 3.4) * 10}%, rgba(167,139,250,0.18), transparent 70%)`}} />
    <AbsoluteFill style={{backgroundImage: 'radial-gradient(rgba(148,163,255,0.13) 2px, transparent 2px)', backgroundSize: '44px 44px',
      backgroundPosition: `0 ${(-frame * 1.1) % 44}px`, maskImage: 'linear-gradient(180deg, transparent, #000 20%, #000 80%, transparent)'}} />
  </AbsoluteFill>;
};

// Paper: warm sheet lit from the top-left, faint fibres drifting slowly (background flows, 导演层 §3),
// and thin editorial frame ticks. No colour, no glow.
const FIBRES = Array.from({length: 46}, (_, i) => ({x: hash(i * 3.1) * 1080, y: hash(i * 7.7) * 1920, len: 16 + hash(i * 1.9) * 40,
  deg: -30 + hash(i * 5.3) * 60, v: 4 + hash(i * 2.3) * 8, a: 0.05 + hash(i * 9.1) * 0.07}));
const PaperBackground: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  return <AbsoluteFill style={{background: paper.bg}}>
    <AbsoluteFill style={{background: `radial-gradient(1400px 1200px at ${22 + Math.sin(t / 7) * 3}% ${12 + Math.cos(t / 9) * 2}%, rgba(255,255,255,0.55), transparent 65%),
      radial-gradient(1200px 1000px at 90% 95%, rgba(120,100,70,0.10), transparent 70%)`}} />
    <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
      {FIBRES.map((p, i) => {
        const y = (((p.y - t * p.v) % 1920) + 1920) % 1920;
        const x = p.x + Math.sin(t / 3 + i) * 6;
        const r = (p.deg * Math.PI) / 180;
        return <line key={i} x1={x} y1={y} x2={x + Math.cos(r) * p.len} y2={y + Math.sin(r) * p.len} stroke={paper.ink} strokeOpacity={p.a} strokeWidth={1.4} strokeLinecap="round" />;
      })}
      {[[60, 150, 1, 1], [1020, 150, -1, 1], [60, 1250, 1, -1], [1020, 1250, -1, -1]].map(([x, y, sx, sy], i) => (
        <path key={i} d={`M${x} ${y + sy * 26} L${x} ${y} L${x + sx * 26} ${y}`} stroke={paper.ink} strokeOpacity={0.35} strokeWidth={2} fill="none" />
      ))}
    </svg>
  </AbsoluteFill>;
};

// Blueprint: navy sheet with a fine engineering grid (minor 40 px, major 200 px) that creeps slowly, registration
// marks at the corners of the safe band, and a mono coordinate scale. Flat — no glow, no gradient labels.
const BlueprintBackground: React.FC = () => {
  const frame = useCurrentFrame();
  const L = useLayout();
  const off = (frame * 0.25) % 40;
  const [y0, y1] = L.band ?? [160, 1500];
  return <AbsoluteFill style={{background: blueprint.bg}}>
    <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
      {Array.from({length: 29}, (_, i) => <line key={`v${i}`} x1={i * 40 - off} x2={i * 40 - off} y1={0} y2={1920} stroke={blueprint.grid} strokeWidth={(i * 40) % 200 === 0 ? 2 : 1} />)}
      {Array.from({length: 50}, (_, i) => <line key={`h${i}`} x1={0} x2={1080} y1={i * 40 + off} y2={i * 40 + off} stroke={blueprint.grid} strokeWidth={(i * 40) % 200 === 0 ? 2 : 1} />)}
      {[[44, y0 + 14, 1, 1], [1036, y0 + 14, -1, 1], [44, y1 - 14, 1, -1], [1036, y1 - 14, -1, -1]].map(([x, y, sx, sy], i) => (
        <path key={i} d={`M${x} ${y + sy * 30} L${x} ${y} L${x + sx * 30} ${y}`} stroke={blueprint.dim} strokeOpacity={0.7} strokeWidth={2} fill="none" />
      ))}
      {Array.from({length: 10}, (_, i) => <text key={i} x={1052} y={y0 + 60 + i * ((y1 - y0 - 120) / 9)} textAnchor="end" fontFamily={mono} fontSize={14}
        fill={blueprint.dim} opacity={0.55}>{String(i * 100).padStart(3, '0')}</text>)}
    </svg>
  </AbsoluteFill>;
};

const Background: React.FC<{theme: Theme}> = ({theme}) => (theme === 'paper' ? <PaperBackground /> : theme === 'blueprint' ? <BlueprintBackground /> : <DarkBackground />);

const DarkHeader: React.FC<{title: string; step: number; steps: string[]}> = ({title, step, steps}) => {
  const {stage, headerTop} = useLayout();
  return <div style={{position: 'absolute', left: stage.left, width: stage.width, top: headerTop + 10, display: 'flex', alignItems: 'center', gap: 18}}>
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
  </div>;
};

// Editorial header: series title in ink, the steps as a quiet index with the current one set in bold, a hairline.
const PaperHeader: React.FC<{title: string; step: number; steps: string[]}> = ({title, step, steps}) => {
  const {stage, headerTop} = useLayout();
  return <div style={{position: 'absolute', left: stage.left, width: stage.width, top: headerTop}}>
    <div style={{display: 'flex', alignItems: 'baseline', gap: 18}}>
      <div style={{fontFamily: font, fontSize: 30, fontWeight: 900, color: paper.ink, letterSpacing: 1}}>{title}</div>
      <div style={{marginLeft: 'auto', display: 'flex', gap: 18, fontFamily: font, fontSize: 26}}>
        {steps.map((label, i) => {
          const n = i + 1;
          return <span key={label} style={{color: n === step ? paper.ink : paper.dim, fontWeight: n === step ? 900 : 500, opacity: n === step ? 1 : 0.75}}>
            {String(n).padStart(2, '0')} {label}</span>;
        })}
      </div>
    </div>
    <div style={{height: 2, background: paper.ink, opacity: 0.8, marginTop: 14}} />
  </div>;
};

// Engineering title block: series title, the steps as a mono index (current one in ink), a hairline with end ticks.
const BlueprintHeader: React.FC<{title: string; step: number; steps: string[]}> = ({title, step, steps}) => {
  const {stage, headerTop} = useLayout();
  return <div style={{position: 'absolute', left: stage.left, width: stage.width, top: headerTop}}>
    <div style={{display: 'flex', alignItems: 'baseline', gap: 18}}>
      <div style={{fontFamily: font, fontSize: 30, fontWeight: 900, color: blueprint.ink, letterSpacing: 1}}>{title}</div>
      <div style={{marginLeft: 'auto', display: 'flex', gap: 16, fontFamily: font, fontSize: 25}}>
        {steps.map((label, i) => {
          const n = i + 1;
          return <span key={label} style={{color: n === step ? blueprint.ink : blueprint.dim, fontWeight: n === step ? 900 : 500, opacity: n === step ? 1 : 0.8}}>
            <span style={{fontFamily: mono, fontSize: 21}}>{String(n).padStart(2, '0')}</span> {label}</span>;
        })}
      </div>
    </div>
    <svg width={stage.width} height={14} style={{display: 'block', marginTop: 10}}>
      <line x1={0} x2={stage.width} y1={7} y2={7} stroke={blueprint.ink} strokeOpacity={0.7} strokeWidth={2} />
      <line x1={1} x2={1} y1={0} y2={14} stroke={blueprint.ink} strokeOpacity={0.7} strokeWidth={2} />
      <line x1={stage.width - 1} x2={stage.width - 1} y1={0} y2={14} stroke={blueprint.ink} strokeOpacity={0.7} strokeWidth={2} />
    </svg>
  </div>;
};

const Header: React.FC<{theme: Theme; title: string; step: number; steps: string[]}> = ({theme, ...p}) => (theme === 'paper' ? <PaperHeader {...p} />
  : theme === 'blueprint' ? <BlueprintHeader {...p} /> : <DarkHeader {...p} />);

// Captions: A/B core nouns (tutorial.highlights) take their fixed colours first, exact match, longest first.
// The dark look also tints latin words and numbers; the paper look keeps them in ink (≤ 2 accents on screen).
const TOKEN = /([A-Za-z0-9][A-Za-z0-9.%:\-_/]*)/g;
const latin = (text: string, key: string, c: string | null) => text.split(TOKEN).map((p, i) => (i % 2 && c
  ? <span key={`${key}-${i}`} style={{color: c}}>{p}</span>
  : <React.Fragment key={`${key}-${i}`}>{p}</React.Fragment>));
const Caption: React.FC<{captions: TimedCaption[]; highlights?: {text: string; role: 'A' | 'B'}[]; pal: Palette}> = ({captions, highlights = [], pal}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const {stage, captionY} = useLayout();
  const ms = frame / fps * 1000;
  const active = captions.find((c) => ms >= c.startMs && ms < c.endMs);
  if (!active) return null;
  const pop = interpolate(ms, [active.startMs, active.startMs + 90], [0.94, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const keys = [...highlights].sort((a, b) => b.text.length - a.text.length);
  const parts: React.ReactNode[] = [];
  let buf = '';
  for (let i = 0; i < active.text.length;) {
    const hit = keys.find((k) => active.text.startsWith(k.text, i));
    if (hit) {
      if (buf) parts.push(...latin(buf, `t${i}`, pal.latin));
      buf = '';
      parts.push(<span key={`k${i}`} style={{color: hit.role === 'A' ? pal.keyA : pal.keyB}}>{hit.text}</span>);
      i += hit.text.length;
    } else {
      buf += active.text[i];
      i += 1;
    }
  }
  if (buf) parts.push(...latin(buf, 'end', pal.latin));
  const dark = pal.latin !== null;
  return <div style={{position: 'absolute', top: captionY, left: stage.left - 20, width: stage.width + 40, transform: `translateY(-50%) scale(${pop})`,
    textAlign: 'center', fontFamily: font, fontWeight: 900, fontSize: 60, whiteSpace: 'nowrap', lineHeight: 1.3, color: pal.text, letterSpacing: 1,
    WebkitTextStroke: `10px ${pal.stroke}`, paintOrder: 'stroke fill', textShadow: dark ? '0 6px 20px rgba(0,0,0,0.7)' : 'none'}}>
    {parts}
  </div>;
};

const cueOf = (timing: SceneTiming, fps: number) => (name: string, fallback = 0) => (name in timing.cues ? Math.round(timing.cues[name] / 1000 * fps) : fallback);

// Scene visual. Dark look: the shared motion layer (entrance, a new framing per caption line via beatTour,
// a slow breath). With look.tour === false the stage stays put and each scene owns its own motion —
// whole-stage push/pull is on the director layer's ban list (docs/video-craft/导演层.md §8–§9).
const SceneVisual: React.FC<{timing: SceneTiming; visual: string; credit: string; motion?: {amp?: number; drift?: number}; tour: boolean}> = ({timing, visual, credit, motion, tour}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const {stage, captionY, clipTop, band} = useLayout();
  // The soft top edge ends where the stage starts (the 9:16 layout keeps its original 110 px).
  const fadeTop = band ? stage.top - clipTop : 110;
  const Visual = sceneRegistry[visual];
  const t = frame / fps;
  const cue = cueOf(timing, fps);
  const beats = useMemo(() => timing.captions.map((c) => c.startMs / 1000), [timing]);
  const exit = interpolate(frame, [timing.durationFrames - 8, timing.durationFrames], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  if (!tour) {
    // Motivated camera: the scene says where to look at each event; the camera follows late and critically
    // damped. Only the picture moves — the frame is clipped above the header and above the caption band.
    const keys = Visual?.camera?.(cue, timing.durationFrames) ?? [];
    const cx = follow(t, stage.width / 2, keys.map((k) => ({at: k.at / fps, to: k.x})));
    const cy = follow(t, stage.height / 2, keys.map((k) => ({at: k.at / fps, to: k.y})));
    const z = follow(t, 1, keys.map((k) => ({at: k.at / fps, to: k.z})));
    // Bring the focus part of the way to the centre, so the rest of the layout stays in view.
    const fx = stage.width / 2 + (cx - stage.width / 2) * 0.55, fy = stage.height / 2 + (cy - stage.height / 2) * 0.55;
    // Horizontally the whole layout stays on screen (x 24–1000): a sideways pan must never cut a line of text
    // mid-word or push content under Douyin's button column. Vertical moves crop whole lines through the soft edge.
    const lo = 24 - stage.left, hi = 1000 - stage.left - stage.width * z;
    const tx = lo <= hi ? clamp(stage.width / 2 - fx * z, lo, hi) : (lo + hi) / 2;
    // The HUD layer (titles, live numbers) rides the same camera but never rises into the header fade and never
    // grows wider than the safe width, so a push-in reads as depth instead of cropping a line of text.
    const hz = Math.min(z, 1.05);
    const hx = clamp(stage.width / 2 - fx * hz, 56 - stage.left, Math.max(56 - stage.left, 1000 - stage.left - stage.width * hz));
    const hy = Math.max(0, stage.height / 2 - fy * hz);
    const clipBottom = captionY - 84;
    return <><div style={{position: 'absolute', left: 0, top: clipTop, width: 1080, height: clipBottom - clipTop, overflow: 'hidden', opacity: exit,
      maskImage: `linear-gradient(180deg, transparent 0, #000 ${fadeTop}px, #000 calc(100% - 70px), transparent 100%)`}}>
      <div style={{position: 'absolute', left: stage.left, top: stage.top - clipTop, width: stage.width, height: stage.height, transformOrigin: '0 0',
        transform: `translate(${tx}px, ${stage.height / 2 - fy * z}px) scale(${z})`}}>
        {Visual && <Visual f={frame} dur={timing.durationFrames} cue={cue} credit={credit} layer={Visual.hud ? 'stage' : undefined} />}
      </div>
    </div>{Visual?.hud && <div style={{position: 'absolute', left: stage.left, top: stage.top, width: stage.width, height: stage.height, opacity: exit, transformOrigin: '0 0',
      transform: `translate(${hx}px, ${hy}px) scale(${hz})`}}>
      <Visual f={frame} dur={timing.durationFrames} cue={cue} credit={credit} layer="hud" />
    </div>}</>;
  }
  const enterP = ease.outBack(prog(t, 0, 0.4), 1.2);
  const bz = beatTour(t, beats, {amp: motion?.amp ?? 0.075, drift: motion?.drift ?? 30});
  const sw = sway(t, 0.9, {dy: 3, deg: 0, breath: 0.006});
  return <div style={{position: 'absolute', left: stage.left, top: stage.top, width: stage.width, height: stage.height,
    opacity: Math.min(clamp(enterP * 1.5), exit), transformOrigin: '50% 40%',
    transform: `translate(${bz.dx}px, ${(1 - enterP) * 40 + bz.dy + sw.dy}px) scale(${bz.s * sw.s})`}}>
    {Visual && <Visual f={frame} dur={timing.durationFrames} cue={cue} credit={credit} />}
  </div>;
};

export const TutorialVideo: React.FC<TutorialProps> = ({tutorial, timing}) => {
  const frame = useCurrentFrame();
  const {durationInFrames, fps, width, height} = useVideoConfig();
  const t = frame / fps;
  const theme = themeOf(tutorial);
  const pal = palette(theme);
  const look = tutorial.look ?? {};
  const tour = look.tour ?? true;
  const leadFrames = Math.round((timing.leadMs ?? 0) / 1000 * tutorial.fps);
  const stepOf = (id: string) => tutorial.scenes.find((s) => s.id === id)?.step ?? 0;
  // A new step gets a big transition; scenes inside the same step get small ones.
  const cuts = useMemo(() => {
    const list = timing.scenes.slice(1).map((s, i) => ({at: s.startFrame / fps, big: stepOf(s.id) !== stepOf(timing.scenes[i].id)}));
    // The opening is the densest part (a change every 1–1.5 s): reveal the first frame with an iris.
    return [{at: 0, kind: 'iris' as const}, ...planCuts(list.map((c) => c.at), (i) => list[i].big, look.cuts)];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timing, tutorial, fps]);
  const L = layoutOf(look.frame);
  const cutColors = theme === 'paper' ? [paper.keyA, paper.ink, paper.bg] : theme === 'blueprint' ? [blueprint.panelHi, blueprint.line, blueprint.bg] : [color.cyan, color.violet, color.bg];
  return <LayoutCtx.Provider value={L}><AbsoluteFill style={{background: pal.bg, overflow: 'hidden'}}>
    <CutStage t={t} cuts={cuts} width={width} height={height} colors={cutColors} fill={pal.bg} paper={theme === 'paper' ? paper.card : theme === 'blueprint' ? blueprint.panel : '#e8ecff'}>
      <Background theme={theme} />
      {(look.particles ?? true) && <Particles t={t} width={width} height={height} kind="glow" n={28} colors={[color.cyan, color.violet, '#ffffff']} area={[0, 260, width, L.captionY - 110]} alpha={0.4} />}
      {timing.scenes.map((s) => {
        const scene = tutorial.scenes.find((x) => x.id === s.id);
        return <Sequence key={s.id} name={s.id} from={s.startFrame} durationInFrames={s.durationFrames}>
          <SceneVisual timing={s} visual={scene?.visual ?? ''} credit={tutorial.credit} motion={tutorial.motion} tour={tour} />
        </Sequence>;
      })}
    </CutStage>
    {timing.scenes.map((s) => {
      const scene = tutorial.scenes.find((x) => x.id === s.id);
      const events = sceneRegistry[scene?.visual ?? '']?.sfx?.(cueOf(s, fps), s.durationFrames) ?? [];
      return <Sequence key={`${s.id}-chrome`} name={`${s.id}-chrome`} from={s.startFrame} durationInFrames={s.durationFrames}>
        <Header theme={theme} title={tutorial.title} step={scene?.step ?? 0} steps={tutorial.steps ?? []} />
        <Caption captions={s.captions} highlights={tutorial.highlights} pal={pal} />
        <Sequence from={leadFrames} name={`${s.id}-voice`}><Audio src={staticFile(s.audioSrc)} /></Sequence>
        {events.filter((e) => e.at >= 0 && e.at < s.durationFrames).map((e, i) => (
          <Sequence key={`sfx-${i}`} from={e.at} durationInFrames={45} name={`sfx ${e.kind}`}>
            <Audio src={staticFile(`audio/sfx/${e.kind}.wav`)} volume={() => e.gain ?? 0.3} />
          </Sequence>
        ))}
      </Sequence>;
    })}
    {tutorial.musicSrc && <Audio src={staticFile(tutorial.musicSrc)} volume={(f) => {
      const base = tutorial.musicVolume ?? 0.07;
      const fadeIn = Math.min(1, f / 30);
      const fadeOut = Math.min(1, (durationInFrames - f) / 60);
      return Math.max(0, base * Math.min(fadeIn, fadeOut));
    }} />}
  </AbsoluteFill></LayoutCtx.Provider>;
};

/** Static Douyin cover (封面): the scene named by `tutorial.cover` (default: the first) at its settled state. */
export const TutorialCover: React.FC<TutorialProps> = ({tutorial, timing}) => {
  const coverId = tutorial.cover ?? tutorial.scenes[0].id;
  const scene = tutorial.scenes.find((s) => s.id === coverId) ?? tutorial.scenes[0];
  const t = timing.scenes.find((s) => s.id === scene.id) ?? timing.scenes[0];
  const Visual = sceneRegistry[scene.visual];
  const {fps} = useVideoConfig();
  const theme = themeOf(tutorial);
  const pal = palette(theme);
  const mascot = tutorial.look?.mascot ?? theme === 'dark';
  const L = layoutOf(tutorial.look?.frame);
  const {stage, captionY} = L;
  return <LayoutCtx.Provider value={L}><AbsoluteFill style={{background: pal.bg}}>
    <Background theme={theme} />
    <Header theme={theme} title={tutorial.title} step={0} steps={tutorial.steps ?? []} />
    <div style={{position: 'absolute', left: stage.left, top: stage.top, width: stage.width}}>
      {Visual && <Visual f={t.durationFrames - 10} dur={t.durationFrames} cue={cueOf(t, fps)} credit={tutorial.credit} />}
    </div>
    <div style={{position: 'absolute', top: captionY - 40, left: stage.left, width: stage.width, textAlign: 'center', fontFamily: font, fontWeight: 900,
      fontSize: 66, lineHeight: 1.35, color: pal.text, WebkitTextStroke: `10px ${pal.stroke}`, paintOrder: 'stroke fill'}}>
      {tutorial.subtitle.split(' · ').map((line) => <div key={line}>{line}</div>)}
    </div>
    {mascot && <div style={{position: 'absolute', top: captionY + 150, left: 0, right: 0, display: 'flex', justifyContent: 'center'}}><Dino size={200} run={0} /></div>}
  </AbsoluteFill></LayoutCtx.Provider>;
};

/**
 * Designed cover (tutorial.coverCard, docs/video-craft/封面.md): background, one anchor, the headline and a support line,
 * each placed per ratio. Three text layers at most: tag (small, top-left), headline (60–75 % of the text weight), support.
 */
export const TutorialCoverCard: React.FC<TutorialProps & {ratio: CoverRatio}> = ({tutorial, ratio}) => {
  const card = tutorial.coverCard;
  const {width, height} = useVideoConfig();
  const pal = palette(themeOf(tutorial));
  if (!card) return <AbsoluteFill style={{background: pal.bg}} />;
  const lay = card.layouts[ratio];
  const Anchor = sceneRegistry[card.anchor];
  const [ax, ay, as] = lay.anchor;
  const grid = themeOf(tutorial) === 'blueprint' ? blueprint.grid : pal.bg;
  return <AbsoluteFill style={{background: pal.bg, overflow: 'hidden'}}>
    <svg width={width} height={height} style={{position: 'absolute', inset: 0}}>
      {Array.from({length: Math.ceil(width / 40) + 1}, (_, i) => <line key={`v${i}`} x1={i * 40} x2={i * 40} y1={0} y2={height} stroke={grid} strokeWidth={i % 5 === 0 ? 2 : 1} />)}
      {Array.from({length: Math.ceil(height / 40) + 1}, (_, i) => <line key={`h${i}`} x1={0} x2={width} y1={i * 40} y2={i * 40} stroke={grid} strokeWidth={i % 5 === 0 ? 2 : 1} />)}
    </svg>
    {Anchor && <div style={{position: 'absolute', left: ax - 440 * as, top: ay - 400 * as, width: 880, height: 800, transform: `scale(${as})`, transformOrigin: '0 0'}}>
      <Anchor f={0} dur={1} cue={() => 0} credit={tutorial.credit} layer="stage" />
    </div>}
    {card.tag && <div style={{position: 'absolute', left: lay.headline[0], top: lay.headline[1] - 54, fontFamily: mono, fontWeight: 700, fontSize: 30, color: pal.dim, letterSpacing: 2}}>{card.tag}</div>}
    <div style={{position: 'absolute', left: lay.headline[0], top: lay.headline[1], fontFamily: font, fontWeight: 900, fontSize: lay.size, lineHeight: 1.12, letterSpacing: 2}}>
      {card.headline.map((line, i) => <div key={line} style={{color: i === card.headline.length - 1 && card.headline.length > 1 ? pal.keyA : pal.text}}>{line}</div>)}
    </div>
    {card.support && <div style={{position: 'absolute', left: 0, right: 0, top: lay.support, textAlign: 'center', fontFamily: font, fontWeight: 800, fontSize: 50, color: pal.text}}>{card.support}</div>}
  </AbsoluteFill>;
};
