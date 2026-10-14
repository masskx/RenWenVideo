import type {Caption} from '@remotion/captions';
import {interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
export const Captions = ({captions, y, size}: {captions: Caption[]; y: number; size: number}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const ms = frame / fps * 1000;
  const active = captions.find(c => ms >= c.startMs && ms < c.endMs);
  if (!active) return null;
  const fade = Math.min(120, (active.endMs-active.startMs)/4);
  const opacity = interpolate(ms, [active.startMs, active.startMs+fade, active.endMs-fade, active.endMs], [0,1,1,0], {extrapolateLeft:'clamp', extrapolateRight:'clamp'});
  return <div style={{position:'absolute',top:`${y*100}%`, left:'50%',width:'86%',transform:'translate(-50%, -50%)',
    color:'#fffef6',fontSize:size, fontFamily:'ZenSong, serif',fontWeight:700, lineHeight:1.34,
    letterSpacing:1, textAlign:'center',whiteSpace:'pre-wrap',overflowWrap:'anywhere',
    WebkitTextStroke:'1.2px rgba(12,22,16,0.8)',paintOrder:'stroke fill',
    textShadow:'0 2px 4px rgba(0,0,0,0.9), 0 4px 14px rgba(0,0,0,0.65)',opacity}}>{active.text}</div>;
};
