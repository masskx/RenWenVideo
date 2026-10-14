import {AbsoluteFill, Easing, Img, Sequence, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {Video, Audio} from '@remotion/media';
import {Captions} from './Captions';
import {Episode, Shot, durationOf} from './types';

const ShotLayer = ({shot, fade, first, episodeAudioMode, episodeAudioVolume}: {
  shot: Shot;
  fade: number;
  first: boolean;
  episodeAudioMode?: 'mute' | 'ambience' | 'keep';
  episodeAudioVolume?: number;
}) => {
  const frame = useCurrentFrame();
  const progress = interpolate(frame,[0,Math.max(1,shot.duration-1)],[0,1],{
    easing:Easing.bezier(0.45,0,0.55,1),
    extrapolateLeft:'clamp',
    extrapolateRight:'clamp'
  });
  const zoom = interpolate(progress,[0,1],[shot.zoomFrom,shot.zoomTo]);
  const x = interpolate(progress,[0,1],[-shot.panX/2,shot.panX/2]);
  const opacity = first || fade === 0 ? 1 : interpolate(frame,[0,fade],[0,1],{
    easing:Easing.bezier(0.45,0,0.55,1),
    extrapolateLeft:'clamp',
    extrapolateRight:'clamp'
  });
  const style: React.CSSProperties = {width:'100%',height:'100%',objectFit:'cover',transform:`translateX(${x}px) scale(${zoom})`};
  const audioMode = shot.videoAudioMode ?? episodeAudioMode ?? 'mute';
  const audioVolume = Math.max(0, Math.min(1, shot.videoAudioVolume ?? episodeAudioVolume ?? (audioMode === 'keep' ? 0.28 : 0.08)));
  const audioFadeFrames = Math.min(10, Math.max(1, Math.floor(shot.duration * 0.08)));
  const videoVolume = (videoFrame: number) => {
    const fadeIn = Math.min(1, videoFrame / audioFadeFrames);
    const fadeOut = Math.min(1, (shot.duration - videoFrame) / audioFadeFrames);
    return audioVolume * Math.min(fadeIn, fadeOut);
  };
  return <AbsoluteFill style={{opacity, overflow:'hidden'}}>
    {shot.kind==='video'
      ? <Video src={staticFile(shot.src)} trimBefore={shot.trimBefore ?? 0}
          muted={audioMode === 'mute'} volume={(videoFrame) => audioMode === 'mute' ? 0 : videoVolume(videoFrame)} style={style}/>
      : <Img src={staticFile(shot.src)} style={style}/>} 
    <AbsoluteFill style={{background:'linear-gradient(180deg,rgba(0,12,5,0.04),transparent 40%,rgba(0,8,4,0.09))'}}/>
  </AbsoluteFill>;
};
export const ZenVideo = ({episode}: {episode: Episode}) => {
  const frame = useCurrentFrame();
  const duration = durationOf(episode);
  const titleOpacity = interpolate(frame,[0,4,Math.max(5,episode.titleEnd-7),episode.titleEnd],[1,1,1,0],{extrapolateRight:'clamp'});
  return <AbsoluteFill style={{background:'#07110c',overflow:'hidden'}}>
    <style>{`@font-face {font-family: ZenSong; src: url("${staticFile('fonts/simsun.ttc')}"); font-weight: 400;} @font-face {font-family: ZenKai; src: url("${staticFile('fonts/simkai.ttf')}"); font-weight: 400;}`}</style>
    {episode.shots.map((shot,i) => <Sequence key={shot.id} name={shot.id} from={shot.start}
      durationInFrames={Math.min(shot.duration+episode.transitionFrames,duration-shot.start)}>
      <ShotLayer shot={shot} fade={episode.transitionFrames} first={i===0}
        episodeAudioMode={episode.videoAudioMode} episodeAudioVolume={episode.videoAudioVolume}/>
    </Sequence>)}
    {frame < episode.titleEnd && <div style={{position:'absolute',top:'20%',left:'50%',width:'100%',transform:'translateX(-50%)',
      display:'flex',flexDirection:'column',alignItems:'center',
      fontFamily:'ZenKai, KaiTi, serif',fontWeight:700,fontSize:144,lineHeight:1.2,color:'#fffef4',
      textShadow:'0 2px 7px #162a19',opacity:titleOpacity}}>
      {Array.from(episode.title).map((c,i)=><div key={i} style={{textAlign:'center'}}>{c}</div>)}
    </div>}
    <Captions captions={episode.captions} y={episode.subtitleY} size={episode.subtitleSize}/>
    {episode.audioSrc && <Audio src={staticFile(episode.audioSrc)}/>}
    {episode.musicSrc && <Audio src={staticFile(episode.musicSrc)} volume={(musicFrame) => {
      const fadeFrames = episode.musicFadeFrames ?? 45;
      const baseVolume = episode.musicVolume ?? 0.1;
      const fadeIn = Math.min(1, musicFrame / Math.max(1, fadeFrames));
      const fadeOut = Math.min(1, (duration - musicFrame) / Math.max(1, fadeFrames));
      return Math.max(0, baseVolume * Math.min(fadeIn, fadeOut));
    }}/>} 
  </AbsoluteFill>;
};
