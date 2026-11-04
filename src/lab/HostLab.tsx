import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {font} from '../tutorial/theme';
import {plex} from '../tutorial/fonts';
import {Host, HostExpr, HostFrame, HostPose, HOST} from '../tutorial/host';

// HostLab: the host IP's model sheet — the reference avatar, the five expressions, the poses (head and shoulders only),
// and the three framings on three films' palettes — plus a talking test.
// npx remotion still src/index.ts HostLab qa/host/sheet.png   ·   --props='{"sheet":"talk"}' for the talking test
const EXPRS: HostExpr[] = ['calm', 'smile', 'surprise', 'think', 'serious'];
const POSES: [HostPose, HostExpr, [number, number]][] = [['point', 'calm', [1, -0.2]], ['wave', 'smile', [0, 0]], ['think', 'think', [0.7, -0.9]], ['thumbs', 'smile', [0.2, 0]], ['shrug', 'surprise', [0, 0]]];
const FILMS = [
  {name: '暖棕 · altman-dram', c: {panel: '#3A1D10', accent: '#E0B84D', ink: '#F2E6DA', bg: '#5A3420'}, ground: '#1E0D06'},
  {name: '纸面 · weight-space', c: {panel: '#E4E2DA', accent: '#0C8454', ink: '#FFFFFF', bg: '#FFFFFF'}, ground: '#F4F3EE'},
  {name: '冷蓝 · deepseek', c: {panel: '#13203F', accent: '#2460EA', ink: '#EAF0FF', bg: '#1F3466'}, ground: '#0A1226'},
];
const Label: React.FC<{children: React.ReactNode; c?: string}> = ({children, c = '#3A3330'}) => <div style={{fontFamily: plex, fontSize: 22, color: c, textAlign: 'center', marginTop: 8, letterSpacing: 1}}>{children}</div>;
export const HostLab: React.FC<{sheet?: 'model' | 'talk'}> = ({sheet = 'model'}) => {
  const f = useCurrentFrame();
  if (sheet === 'talk') {
    const words = Array.from({length: 40}, (_, i) => ({ms: 200 + i * 190, dur: 150, text: '奥特曼说你电脑里的内存只有的时间在用相当糟糕'[i % 20]}));
    return <AbsoluteFill style={{background: FILMS[0].ground, alignItems: 'center', justifyContent: 'center', gap: 60, flexDirection: 'row'}}>
      <HostFrame f={f} words={words} size={460} mode="window" name="主持人" colors={FILMS[0].c} pose={f > 90 ? 'point' : 'wave'} fromPose={f > 90 ? 'wave' : 'idle'} poseAt={f > 90 ? 90 : 0} look={f > 90 ? [1, -0.2] : [0.2, 0]} expr="calm" />
      <div style={{width: 600, height: 600, background: FILMS[1].ground, position: 'relative', overflow: 'hidden'}}>
        <div style={{position: 'absolute', left: 60, top: 120}}><HostFrame f={f} words={words} size={480} mode="edge" colors={FILMS[1].c} expr="smile" /></div>
        <div style={{position: 'absolute', left: 0, right: 0, top: 513, height: 87, background: '#141414'}} />
      </div>
    </AbsoluteFill>;
  }
  const cell = 300;
  return <AbsoluteFill style={{background: '#EFEAE2', padding: '30px 40px', display: 'flex', flexDirection: 'column', gap: 22, fontFamily: font}}>
    <div style={{display: 'flex', gap: 34, alignItems: 'flex-end'}}>
      <div><div style={{width: cell, height: cell, borderRadius: '50%', overflow: 'hidden', background: HOST.disc}}><Host f={20} size={cell} /></div><Label>badge · 头像原样</Label></div>
      {EXPRS.map((e) => <div key={e}><HostFrame f={40} expr={e} fromExpr={e} size={cell * 0.86} mode="window" colors={FILMS[0].c} /><Label>{e}</Label></div>)}
    </div>
    <div style={{display: 'flex', gap: 34, alignItems: 'flex-end', paddingLeft: cell + 34}}>
      {POSES.map(([p, e, look]) => <div key={p}><HostFrame f={50} pose={p} fromPose="idle" poseAt={10} expr={e} fromExpr={e} look={look} size={cell * 0.86} mode="window" colors={FILMS[2].c} /><Label>{p}</Label></div>)}
    </div>
    <div style={{display: 'flex', gap: 30}}>
      {FILMS.map((m) => <div key={m.name} style={{width: 590, height: 330, background: m.ground, position: 'relative', overflow: 'hidden'}}>
        <div style={{position: 'absolute', left: 24, top: 24}}><HostFrame f={30} size={200} mode="window" name="主持人" colors={m.c} expr="smile" fromExpr="smile" /></div>
        <div style={{position: 'absolute', left: 300, top: 70}}><HostFrame f={30} size={260} mode="edge" colors={m.c} pose="point" fromPose="point" look={[-0.8, 0]} /></div>
        <div style={{position: 'absolute', left: 260, right: 0, top: 283, height: 47, background: m.c.accent}} />
        <div style={{position: 'absolute', left: 278, top: 290, fontFamily: plex, fontSize: 20, color: '#111'}}>edge · 从条后面升起</div>
        <div style={{position: 'absolute', left: 24, bottom: 10, fontFamily: plex, fontSize: 20, color: m.c.accent}}>{m.name}</div>
      </div>)}
    </div>
  </AbsoluteFill>;
};
