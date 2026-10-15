import React from 'react';
import {Easing, interpolate, spring, useVideoConfig} from 'remotion';
import {color, font, mono} from './theme';
import {ease as fxEase, prog as fxProg} from '../fx';

export type SceneProps = {f: number; dur: number; cue: (name: string, fallback?: number) => number};

/** 0→1 spring that starts at frame `at`. */
export const usePop = () => {
  const {fps} = useVideoConfig();
  return (f: number, at: number, damping = 15) => spring({frame: f - at, fps, config: {damping, stiffness: 140, mass: 0.8}});
};

export const ramp = (f: number, from: number, to: number) => interpolate(f, [from, to], [0, 1], {
  extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.bezier(0.33, 0, 0.2, 1),
});

export const Appear: React.FC<{p: number; dy?: number; scale?: boolean; style?: React.CSSProperties; children: React.ReactNode}> = ({p, dy = 40, scale, style, children}) => (
  <div style={{opacity: Math.min(1, p * 1.4), transform: `translateY(${(1 - p) * dy}px) scale(${scale ? 0.85 + 0.15 * p : 1})`, ...style}}>{children}</div>
);

export const Panel: React.FC<{style?: React.CSSProperties; glow?: string; children: React.ReactNode}> = ({style, glow, children}) => (
  <div style={{background: color.panel, border: `2px solid ${glow ?? color.panelBorder}`, borderRadius: 28,
    boxShadow: `0 18px 50px rgba(0,0,0,0.45)${glow ? `, 0 0 36px ${glow}55` : ''}`, padding: 32, ...style}}>{children}</div>
);

export const Chip: React.FC<{c?: string; style?: React.CSSProperties; children: React.ReactNode}> = ({c = color.cyan, style, children}) => (
  <span style={{display: 'inline-flex', alignItems: 'center', gap: 10, padding: '8px 22px', borderRadius: 999, background: `${c}22`,
    border: `2px solid ${c}88`, color: c, fontSize: 32, fontWeight: 700, fontFamily: font, whiteSpace: 'nowrap', ...style}}>{children}</span>
);

export const StepTitle: React.FC<{n: number; title: string; p: number}> = ({n, title, p}) => (
  <Appear p={p} dy={-30} style={{display: 'flex', alignItems: 'center', gap: 24, marginBottom: 34}}>
    <div style={{width: 112, height: 112, borderRadius: 30, background: `linear-gradient(135deg, ${color.cyan}, ${color.violet})`,
      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 68, fontWeight: 900, color: '#0a0e1a', fontFamily: font}}>{n}</div>
    <div style={{fontFamily: font, fontWeight: 900, fontSize: 72, color: color.text, letterSpacing: 2}}>{title}</div>
  </Appear>
);

export const Check: React.FC<{p: number; size?: number; c?: string}> = ({p, size = 44, c = color.green}) => (
  <svg width={size} height={size} viewBox="0 0 44 44" style={{flex: 'none'}}>
    <circle cx={22} cy={22} r={20} fill={`${c}26`} stroke={c} strokeWidth={3} opacity={Math.min(1, p * 2)} />
    <path d="M12 23 L19 30 L32 15" fill="none" stroke={c} strokeWidth={5} strokeLinecap="round" strokeLinejoin="round"
      strokeDasharray={40} strokeDashoffset={40 * (1 - p)} />
  </svg>
);

export const Arrow: React.FC<{p: number; length?: number; c?: string}> = ({p, length = 60, c = color.dim}) => (
  <svg width={40} height={length} viewBox={`0 0 40 ${length}`} style={{display: 'block', margin: '0 auto', opacity: p}}>
    <path d={`M20 2 L20 ${length - 6} M8 ${length - 18} L20 ${length - 4} L32 ${length - 18}`} fill="none" stroke={c} strokeWidth={5}
      strokeLinecap="round" strokeLinejoin="round" strokeDasharray={length + 40} strokeDashoffset={(length + 40) * (1 - p)} />
  </svg>
);

/** macOS-style window frame used for terminal, browser and chat mockups. */
export const Window: React.FC<{title?: string; url?: string; style?: React.CSSProperties; bodyStyle?: React.CSSProperties; children: React.ReactNode}> = ({title, url, style, bodyStyle, children}) => (
  <div style={{borderRadius: 24, overflow: 'hidden', border: `2px solid ${color.panelBorder}`, background: '#0f1424',
    boxShadow: '0 24px 60px rgba(0,0,0,0.55)', ...style}}>
    <div style={{height: 64, background: '#1b2238', display: 'flex', alignItems: 'center', padding: '0 22px', gap: 12}}>
      {['#ff5f57', '#febc2e', '#28c840'].map((c) => <div key={c} style={{width: 18, height: 18, borderRadius: 9, background: c}} />)}
      {url ? <div style={{marginLeft: 18, flex: 1, height: 40, borderRadius: 20, background: '#0f1424', color: color.dim, fontFamily: mono,
        fontSize: 24, display: 'flex', alignItems: 'center', padding: '0 20px', whiteSpace: 'nowrap', overflow: 'hidden'}}>{url}</div>
        : <div style={{marginLeft: 18, color: color.dim, fontFamily: font, fontSize: 26}}>{title}</div>}
    </div>
    <div style={{padding: 28, ...bodyStyle}}>{children}</div>
  </div>
);

/**
 * Background layer: a soft glow in the category colour that glides to a new spot on every cue, like a
 * spotlight following the narration. Large-area change with no effect on layout (stage-relative offsets
 * cover the whole 1080×1920 frame). Wrap the scene root in `position: relative; isolation: isolate`.
 */
const SPOTS: [number, number][] = [[30, 22], [72, 38], [26, 55], [70, 62], [40, 30], [62, 48]];
export const CueGlow: React.FC<{f: number; beats: number[]; c: string}> = ({f, beats, c}) => {
  let idx = 0;
  while (idx + 1 < beats.length && f >= beats[idx + 1]) idx += 1;
  const from = SPOTS[Math.max(0, idx - 1) % SPOTS.length], to = SPOTS[idx % SPOTS.length];
  const k = idx === 0 ? 1 : fxEase.inOutCubic(fxProg(f, beats[idx], 18));
  const x = from[0] + (to[0] - from[0]) * k, y = from[1] + (to[1] - from[1]) * k;
  return <div style={{position: 'absolute', left: -80, top: -300, width: 1080, height: 1920, pointerEvents: 'none', zIndex: -1,
    background: `radial-gradient(680px 620px at ${x}% ${y}%, ${c}52, transparent 72%)`}} />;
};

export type TermLine = {at: number; kind: 'cmd' | 'out' | 'ok' | 'note'; text: string; speed?: number; highlight?: string};

/** Terminal with commands that type out from their cue frame. */
export const Terminal: React.FC<{f: number; lines: TermLine[]; fontSize?: number; style?: React.CSSProperties}> = ({f, lines, fontSize = 28, style}) => (
  <Window title="终端 Terminal" style={style} bodyStyle={{fontFamily: mono, fontSize, lineHeight: 1.45, minHeight: 200}}>
    {lines.filter((l) => f >= l.at).map((l, i) => {
      const chars = l.kind === 'cmd' ? Math.floor((f - l.at) * (l.speed ?? 2.2)) : l.text.length;
      const shown = l.text.slice(0, chars);
      const typing = l.kind === 'cmd' && chars < l.text.length;
      const c = l.kind === 'ok' ? color.green : l.kind === 'note' ? color.amber : l.kind === 'out' ? color.dim : color.text;
      const body = l.highlight && !typing && shown.includes(l.highlight)
        ? <>{shown.split(l.highlight)[0]}<span style={{background: `${color.amber}33`, color: color.amber, borderRadius: 6}}>{l.highlight}</span>{shown.split(l.highlight).slice(1).join(l.highlight)}</>
        : shown;
      return <div key={i} style={{color: c, whiteSpace: 'pre-wrap', wordBreak: 'break-all', marginBottom: 6}}>
        {l.kind === 'cmd' && <span style={{color: color.green}}>$ </span>}{body}
        {typing && <span style={{background: color.text, opacity: Math.floor(f / 8) % 2 ? 1 : 0.2}}>&nbsp;</span>}
      </div>;
    })}
  </Window>
);

/** User message bubble that types out, as sent to the coding agent. */
export const ChatPrompt: React.FC<{f: number; at: number; text: string; cps?: number; fontSize?: number}> = ({f, at, text, cps = 2.6, fontSize = 32}) => {
  const n = Math.max(0, Math.floor((f - at) * cps));
  return <div style={{display: 'flex', justifyContent: 'flex-end'}}>
    <div style={{maxWidth: 760, background: 'linear-gradient(135deg, #2b3a67, #33285e)', border: `2px solid ${color.violet}66`,
      borderRadius: '28px 28px 8px 28px', padding: '22px 28px', color: color.text, fontFamily: font, fontSize, lineHeight: 1.5,
      whiteSpace: 'pre-wrap', wordBreak: 'break-word', opacity: f >= at ? 1 : 0}}>
      {text.slice(0, n)}{n < text.length && <span style={{opacity: Math.floor(f / 8) % 2 ? 1 : 0.2}}>▍</span>}
    </div>
  </div>;
};

export const ToolCall: React.FC<{p: number; name: string; detail?: string}> = ({p, name, detail}) => (
  <Appear p={p} dy={20} style={{display: 'flex', alignItems: 'center', gap: 16, background: '#121a2e', border: `2px solid ${color.cyan}44`,
    borderRadius: 18, padding: '14px 20px', marginTop: 14}}>
    <Check p={p} size={38} c={color.cyan} />
    <span style={{fontFamily: mono, fontSize: 28, color: color.cyan}}>REA</span>
    <span style={{fontFamily: mono, fontSize: 28, color: color.text}}>{name}</span>
    {detail && <span style={{fontFamily: font, fontSize: 26, color: color.dim, marginLeft: 'auto'}}>{detail}</span>}
  </Appear>
);

export const Code: React.FC<{lines: {text: string; hl?: string}[]; fontSize?: number; header?: string}> = ({lines, fontSize = 27, header}) => (
  <div style={{background: '#0d1220', borderRadius: 20, border: `2px solid ${color.panelBorder}`, overflow: 'hidden'}}>
    {header && <div style={{padding: '12px 22px', background: '#161d33', color: color.dim, fontFamily: mono, fontSize: 22}}>{header}</div>}
    <div style={{padding: '18px 22px', fontFamily: mono, fontSize, lineHeight: 1.55}}>
      {lines.map((l, i) => <div key={i} style={{whiteSpace: 'pre', color: l.hl ?? '#cfd6f6', background: l.hl ? `${l.hl}1f` : undefined,
        borderRadius: 8, margin: '0 -10px', padding: '0 10px'}}>{l.text}</div>)}
    </div>
  </div>
);

export const Key: React.FC<{label: string; down?: boolean; w?: number}> = ({label, down, w = 90}) => (
  <div style={{minWidth: w, height: 84, padding: '0 22px', borderRadius: 18, background: down ? '#3a4466' : '#262f4d', color: color.text,
    border: '2px solid #4b5680', boxShadow: down ? '0 2px 0 #12182a' : '0 8px 0 #12182a', transform: `translateY(${down ? 6 : 0}px)`,
    display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: font, fontSize: 32, fontWeight: 700}}>{label}</div>
);

export const Slider: React.FC<{value: number; min: number; max: number; label: string; width?: number}> = ({value, min, max, label, width = 420}) => {
  const t = (value - min) / (max - min);
  return <div style={{display: 'flex', alignItems: 'center', gap: 20, fontFamily: font, fontSize: 30, color: color.text}}>
    <span>{label}</span>
    <div style={{position: 'relative', width, height: 14, borderRadius: 7, background: '#2a3352'}}>
      <div style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: `${t * 100}%`, borderRadius: 7, background: `linear-gradient(90deg, ${color.cyan}, ${color.violet})`}} />
      <div style={{position: 'absolute', left: `calc(${t * 100}% - 18px)`, top: -11, width: 36, height: 36, borderRadius: 18, background: '#fff', boxShadow: `0 0 14px ${color.cyan}`}} />
    </div>
    <span style={{fontFamily: mono, color: color.amber, minWidth: 90}}>{value.toFixed(1)}</span>
  </div>;
};

export const Toggle: React.FC<{on: number; label: string}> = ({on, label}) => (
  <div style={{display: 'flex', alignItems: 'center', gap: 18, fontFamily: font, fontSize: 30, color: color.text}}>
    <div style={{width: 92, height: 50, borderRadius: 25, background: interpolateColor(on), position: 'relative'}}>
      <div style={{position: 'absolute', top: 5, left: 5 + on * 42, width: 40, height: 40, borderRadius: 20, background: '#fff'}} />
    </div>
    {label}
  </div>
);
const interpolateColor = (t: number) => (t > 0.5 ? color.green : '#3a4466');

/* ------------------------------------------------------------------ */
/* Original mascot "Rexi": a round cartoon dinosaur drawn for this series. */

export const Dino: React.FC<{size?: number; run?: number; dead?: boolean}> = ({size = 120, run = 0, dead}) => {
  const leg = Math.floor(run / 4) % 2;
  return <svg width={size} height={size} viewBox="0 0 120 120">
    <path d="M18 70 Q6 66 2 54 Q16 62 30 60 Z" fill="#34c27a" />
    <ellipse cx={52} cy={70} rx={34} ry={28} fill="#4ade80" />
    <ellipse cx={56} cy={78} rx={20} ry={16} fill="#bbf7d0" />
    <circle cx={82} cy={42} r={26} fill="#4ade80" />
    {[30, 42, 54].map((x, i) => <path key={i} d={`M${x - 7} ${46 - i * 2} L${x} ${34 - i * 3} L${x + 7} ${46 - i * 2} Z`} fill="#22a35f" />)}
    {dead
      ? <path d="M84 30 L96 42 M96 30 L84 42" stroke="#0a0e1a" strokeWidth={4} strokeLinecap="round" />
      : <><circle cx={90} cy={36} r={8} fill="#fff" /><circle cx={92} cy={36} r={4.5} fill="#0a0e1a" /><circle cx={93.5} cy={34} r={1.6} fill="#fff" /></>}
    <path d={dead ? 'M92 54 Q98 50 104 54' : 'M90 52 Q98 58 105 50'} stroke="#0a0e1a" strokeWidth={3} fill="none" strokeLinecap="round" />
    <circle cx={102} cy={46} r={2} fill="#22a35f" />
    <path d="M72 72 Q80 74 82 66" stroke="#22a35f" strokeWidth={6} fill="none" strokeLinecap="round" />
    <rect x={36} y={88} width={12} height={leg ? 22 : 16} rx={6} fill="#22a35f" />
    <rect x={58} y={88} width={12} height={leg ? 16 : 22} rx={6} fill="#22a35f" />
  </svg>;
};

export const Cactus: React.FC<{h?: number}> = ({h = 90}) => (
  <svg width={h * 0.7} height={h} viewBox="0 0 70 100">
    <rect x={26} y={6} width={18} height={94} rx={9} fill="#2f9e6a" />
    <path d="M26 56 H14 Q8 56 8 48 V30" stroke="#2f9e6a" strokeWidth={14} fill="none" strokeLinecap="round" />
    <path d="M44 44 H56 Q62 44 62 36 V22" stroke="#2f9e6a" strokeWidth={14} fill="none" strokeLinecap="round" />
  </svg>
);

const obstacle = (j: number) => 760 + j * 560 + ((j * 137) % 5) * 80;

/**
 * Deterministic side-scrolling mini game. `speedAt(frame)` is in original-game units
 * (6 = starting speed); the dino auto-jumps every cactus.
 */
export const DinoGame: React.FC<{f: number; speedAt: (frame: number) => number; width?: number; height?: number;
  startAt?: number; crashAt?: number; restartAt?: number; jumpAt?: number; showSpeed?: boolean}> = ({f, speedAt, width = 820, height = 300, startAt = 0, crashAt, restartAt, jumpAt, showSpeed = true}) => {
  const from = restartAt !== undefined && f >= restartAt ? restartAt : startAt;
  const until = crashAt !== undefined && f >= crashAt && !(restartAt !== undefined && f >= restartAt) ? crashAt : f;
  let d = 0;
  for (let i = from; i < until; i++) d += speedAt(i) * 2.3;
  const dinoX = 70;
  const ground = height - 50;
  let jump = 0;
  for (let j = 0; j < 40; j++) {
    const u = (d - (obstacle(j) - dinoX - 175)) / 330;
    if (u > 0 && u < 1) jump = Math.max(jump, 4 * u * (1 - u));
  }
  if (jumpAt !== undefined && f >= jumpAt && f < jumpAt + 24) jump = Math.max(jump, 4 * ((f - jumpAt) / 24) * (1 - (f - jumpAt) / 24));
  const crashed = crashAt !== undefined && f >= crashAt && !(restartAt !== undefined && f >= restartAt);
  const running = f >= startAt && !crashed;
  return <div style={{position: 'relative', width, height, overflow: 'hidden', background: 'linear-gradient(180deg, #121a30, #182241)', borderRadius: 18}}>
    {[0, 1, 2].map((c) => {
      const x = (((c * 330 - d * 0.15) % (width + 200)) + width + 200) % (width + 200) - 100;
      return <div key={c} style={{position: 'absolute', left: x, top: 40 + c * 22, width: 110, height: 34, borderRadius: 17, background: '#2a3557'}} />;
    })}
    <div style={{position: 'absolute', left: 0, right: 0, top: ground, height: 3, background: '#4b5680'}} />
    {Array.from({length: 14}).map((_, k) => {
      const x = (((k * 71 - d) % width) + width) % width;
      return <div key={k} style={{position: 'absolute', left: x, top: ground + 14 + (k % 3) * 9, width: 14 + (k % 4) * 6, height: 3, background: '#323c60'}} />;
    })}
    {Array.from({length: 40}).map((_, j) => {
      const x = obstacle(j) - d;
      if (x < -80 || x > width + 20) return null;
      return <div key={j} style={{position: 'absolute', left: x, top: ground - 84}}><Cactus h={88} /></div>;
    })}
    <div style={{position: 'absolute', left: dinoX - 20, top: ground - 112 - jump * 150}}>
      <Dino size={124} run={running && jump === 0 ? f : 0} dead={crashed} />
    </div>
    {showSpeed && <div style={{position: 'absolute', right: 20, top: 16, fontFamily: mono, fontSize: 28, color: color.amber}}>
      速度 {(f >= startAt ? speedAt(Math.min(f, until)) : speedAt(startAt)).toFixed(3)}</div>}
    {crashed && <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: font, fontSize: 52, fontWeight: 900, color: color.red, background: 'rgba(10,14,26,0.45)'}}>游戏结束</div>}
  </div>;
};
