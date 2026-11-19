import React from 'react';
import {OffthreadVideo, staticFile} from 'remotion';
import {clamp} from '../../fx';
import {hand} from '../fonts';
import {font} from '../theme';
import {Scene} from '../paper';
import TL from '../../../tutorials/working-hard-overrated.timeline.json';
import CAMS from './working-hard-overrated.cam.json';

// working-hard-overrated, made on the template lemo/one-line (docs/video-craft/prompt-library/vendor/lemomo-ai__lemo-opuscar/
// 3961ddb/styles/one-line/STYLE.md): the whole film is one ink line on warm paper, drawn by the template's own MIT engine
// (adapted in pages/working-hard-overrated/line/: our paths, camera and line voices — push trembles and dries, flow is thin
// and fast, the agent's stretch is the one accent). The page is rendered to public/video/working-hard-overrated/line.mp4;
// every scene shows that one continuous take from its own start frame, plus a few handwritten labels pinned to paper
// coordinates through the page's exported camera (working-hard-overrated.cam.json). Captions: look.captions "script".
// Inputs: inputs/working-hard-overrated/ (idea.md). Personal information (user, 2026-11-19): no handle of the person who
// shared it, no name or life story of the essay's author; public figures only by role, nothing from their private lives.

const INK = '#1D1A17', PAPER = '#F4EFE4', ACCENT = '#D97757', DIM = '#7A7266';
const START: Record<string, number> = Object.fromEntries((TL as {scenes: {id: string; startFrame: number}[]}).scenes.map((s) => [s.id, s.startFrame]));
const CAM = CAMS as [number, number, number, number][];
const Y = (i: number) => i * 1150;
/** Paper → screen for global frame g (the page's own camera; the screen centre sits at 0.42 of the height). */
const toScreen = (g: number, x: number, y: number) => {
  const [cx, cy, k, r] = CAM[Math.max(0, Math.min(CAM.length - 1, g))];
  const c = Math.cos(-r), sn = Math.sin(-r), px = (x - cx) * k, py = (y - cy) * k;
  return [540 + c * px - sn * py, 1920 * 0.42 + sn * px + c * py, k, r] as const;
};

const make = (id: string, draw: (p: {f: number; g: number; cue: (n: string, fb?: number) => number}) => React.ReactNode, sfx?: Scene['sfx']): Scene => {
  const S: Scene = () => null;
  S.backdrop = ({f, cue}) => {
    const g = (START[id] ?? 0) + f;
    return <div style={{position: 'absolute', inset: 0, background: PAPER, overflow: 'hidden'}}>
      <OffthreadVideo src={staticFile('video/working-hard-overrated/line.mp4')} startFrom={START[id] ?? 0} muted style={{position: 'absolute', inset: 0, width: 1080, height: 1920}} />
      {draw({f, g, cue})}
    </div>;
  };
  S.sfx = sfx;
  return S;
};
/** A handwritten label pinned to paper point (x, y), written on from frame `at` (scene frames). */
const Label: React.FC<{g: number; f: number; at: number; x: number; y: number; text: string; size?: number; color?: string; anchor?: 'left' | 'center'; until?: number}> = ({g, f, at, x, y, text, size = 60, color = INK, anchor = 'center', until}) => {
  if (f < at || (until != null && f >= until + 9)) return null;
  const [sx, sy, k, r] = toScreen(g, x, y);
  const u = clamp((f - at) / (6 + text.length * 0.6));
  const out = until != null ? 1 - clamp((f - until) / 9) : 1;
  const z = k / 1.6;
  return <div style={{position: 'absolute', left: sx, top: sy, transform: `translate(${anchor === 'center' ? '-50%' : '0'}, -50%) rotate(${-r}rad) scale(${z})`, transformOrigin: anchor === 'center' ? '50% 50%' : '0 50%',
    fontFamily: hand, fontWeight: 700, fontSize: size, color, opacity: out, WebkitTextStroke: `1px ${color}`, whiteSpace: 'nowrap', lineHeight: 1.1,
    textShadow: `0 0 10px ${PAPER}, 0 0 4px ${PAPER}`, clipPath: `inset(-30% ${(1 - u) * 100}% -30% -4%)`}}>{text}</div>;
};
/** A small source note, fixed on screen above the captions. */
const Src: React.FC<{text: string}> = ({text}) => <div style={{position: 'absolute', left: 60, top: 1350, fontFamily: font, fontWeight: 700, fontSize: 28, color: DIM}}>{text}</div>;

const Hook = make('hook', ({f, g, cue}) => {
  const a = cue('a', 42);
  return <>
    <Label g={g} f={f} at={-1} x={-170} y={262} text="幸福感 0–10" size={52} />
    <Label g={g} f={f} at={18} x={-150} y={-120} text="+1 分" size={56} />
    <Label g={g} f={f} at={a - 4} x={60} y={-320} text="效率 +12%" size={96} />
    <Src text="据原文引用的研究" />
  </>;
}, (cue) => [{at: 3, kind: 'tap', gain: 0.06}, {at: cue('a', 42), kind: 'marker', gain: 0.05}]);

const Title = make('title', ({f, g, cue}) => {
  const a = cue('a', 73);
  return <>
    <Label g={g} f={f} at={14} x={0} y={Y(1) - 300} text="Working Hard Is Overrated" size={62} />
    <Label g={g} f={f} at={a} x={170} y={Y(1) + 230} text="（原文标题）" size={40} color={DIM} />
    <Src text="海外长文的中文译文 · X 平台 27 万次浏览" />
  </>;
});

const Forward = make('forward', ({f, g, cue}) => {
  const a = cue('a', 52);
  return <>
    <Label g={g} f={f} at={12} x={0} y={Y(2) - 230} text="转发的人加了一句" size={50} color={DIM} />
    <Label g={g} f={f} at={a} x={20} y={Y(2) + 40} text="agent" size={80} anchor="left" />
  </>;
});

const Effortless = make('effortless', ({f, g, cue}) => <>
  <Label g={g} f={f} at={cue('a', 33) + 10} x={0} y={Y(3) - 220} text="effortless" size={84} />
</>);

const Tennis = make('tennis', ({f, g, cue}) => {
  const a = cue('a', 55), b = cue('b', 119);
  return <>
    <Label g={g} f={f} at={6} x={-160} y={Y(4) - 280} text="23 岁" size={64} />
    <Label g={g} f={f} at={a} x={200} y={Y(4) - 290} text="7" size={140} />
    <Label g={g} f={f} at={a + 6} x={200} y={Y(4) - 200} text="大满贯 · 据原文" size={40} color={DIM} />
    <Label g={g} f={f} at={b} x={40} y={Y(4) + 300} text="“怕它变成义务”" size={56} />
  </>;
});

const Music = make('music', ({f, g, cue}) => {
  const b = cue('b', 91);
  return <>
    <Label g={g} f={f} at={b - 4} x={110} y={Y(5) - 250} text="10 分钟" size={84} />
    <Label g={g} f={f} at={4} x={-40} y={Y(5) + 280} text="最火的歌" size={50} color={DIM} />
  </>;
});

const Discipline = make('discipline', ({f, g, cue}) => {
  const a = cue('a', 44), b = cue('b', 111);
  return <>
    <Label g={g} f={f} at={a} x={-130} y={Y(6) - 40} text="推" size={110} />
    <Label g={g} f={f} at={a + 12} x={-130} y={Y(6) + 250} text="耗能量" size={48} color={DIM} />
    <Label g={g} f={f} at={b} x={110} y={Y(6) - 300} text="拉" size={110} />
  </>;
});

const Ratio = make('ratio', ({f, g, cue}) => {
  const a = cue('a', 47), b = cue('b', 97);
  return <>
    <Label g={g} f={f} at={a} x={-270} y={Y(7) - 130} text="10%" size={80} />
    <Label g={g} f={f} at={a + 8} x={-270} y={Y(7) + 110} text="硬推" size={46} color={DIM} />
    <Label g={g} f={f} at={b} x={40} y={Y(7) - 130} text="90%" size={96} />
    <Label g={g} f={f} at={b + 8} x={40} y={Y(7) + 110} text="被拉着走" size={46} color={DIM} />
  </>;
});

const Sessions = make('sessions', ({f, g, cue}) => {
  const a = cue('a', 48);
  return <>
    <Label g={g} f={f} at={a} x={0} y={Y(8) - 340} text="sessions × 6" size={66} />
  </>;
});

const Handoff = make('handoff', ({f, g, cue}) => {
  const a = cue('a', 55);
  return <>
    <Label g={g} f={f} at={2} x={0} y={Y(8) - 340} text="agent ✓" size={70} color={ACCENT} until={a + 10} />
    <Label g={g} f={f} at={a + 6} x={-80} y={Y(9) - 520} text="你" size={90} />
  </>;
});

const STEPS = ['列出这周在硬推的事', '重复的活 → 交给 agent', '省下的时间做想做的'];
const Todo = make('todo', ({f, g, cue}) => {
  const b = cue('b', 100);
  return <>
    <Label g={g} f={f} at={2} x={-310} y={Y(10) - 290} text="今天试一件" size={64} anchor="left" />
    {STEPS.map((t, i) => <Label key={t} g={g} f={f} at={6 + i * 14} x={-196} y={Y(10) + [-170, -30, 110][i]} text={t} size={48} anchor="left" />)}
    {f >= b && <Src text="三步清单 · 截图留着" />}
  </>;
});

/** Cover anchor: the boulder vignette, a still of the page (stage box 880 × 800). */
const Cover: Scene = () => <div style={{position: 'absolute', left: 0, top: 0, width: 880, height: 800, overflow: 'hidden', borderRadius: 24, background: PAPER}}>
  <OffthreadVideo src={staticFile('video/working-hard-overrated/line.mp4')} startFrom={250} muted style={{position: 'absolute', left: -100, top: -330, width: 1080, height: 1920}} />
</div>;

export const WORKING_HARD_SCENES: Record<string, Scene> = {
  'wh.hook': Hook, 'wh.title': Title, 'wh.forward': Forward, 'wh.effortless': Effortless, 'wh.tennis': Tennis, 'wh.music': Music,
  'wh.discipline': Discipline, 'wh.ratio': Ratio, 'wh.sessions': Sessions, 'wh.handoff': Handoff, 'wh.todo': Todo, 'wh.cover': Cover,
};
