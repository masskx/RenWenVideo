import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {font} from '../tutorial/theme';
import {Host, HOST, HostExpr, HostPose} from '../tutorial/host';

// HostLab: the host IP's model sheet (expressions × poses) and a talking test, next to the reference avatar.
// npx remotion still src/index.ts HostLab qa/host/sheet.png
const EXPRS: HostExpr[] = ['calm', 'smile', 'surprise', 'think', 'serious'];
const POSES: HostPose[] = ['point', 'wave', 'think', 'thumbs', 'shrug'];
const Label: React.FC<{children: React.ReactNode}> = ({children}) => <div style={{fontFamily: font, fontWeight: 800, fontSize: 30, color: HOST.ink, textAlign: 'center', marginTop: 6}}>{children}</div>;
export const HostLab: React.FC<{sheet?: 'model' | 'talk'}> = ({sheet = 'model'}) => {
  const f = useCurrentFrame();
  if (sheet === 'talk') {
    const words = Array.from({length: 40}, (_, i) => ({ms: 200 + i * 190, dur: 150, text: '你对手机说开灯灯亮之前这句话至少要过种协议'[i % 20]}));
    return <AbsoluteFill style={{background: HOST.bg, alignItems: 'center', justifyContent: 'center'}}><Host f={f} words={words} size={700} expr="calm" pose="wave" poseAt={0} fromPose="idle" /></AbsoluteFill>;
  }
  return <AbsoluteFill style={{background: HOST.bg, padding: 40, display: 'flex', flexDirection: 'column', gap: 30}}>
    <div style={{display: 'flex', justifyContent: 'space-between'}}>{EXPRS.map((e) => <div key={e}><Host f={20} expr={e} size={360} seed={2} /><Label>{e}</Label></div>)}</div>
    <div style={{display: 'flex', justifyContent: 'space-between'}}>{POSES.map((p) => <div key={p}><Host f={30} pose={p} poseAt={0} expr={p === 'think' ? 'think' : p === 'thumbs' ? 'smile' : p === 'shrug' ? 'surprise' : 'calm'} size={360} seed={2} /><Label>{p}</Label></div>)}</div>
  </AbsoluteFill>;
};
