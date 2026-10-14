import './index.css';
import {Composition, Still} from 'remotion';
import {ZenVideo} from './ZenVideo';
import {Episode, durationOf} from './types';
import solitude from '../episodes/solitude.json';
import slowLife from '../episodes/slow-life.json';
import {TutorialCover, TutorialVideo} from './tutorial/TutorialVideo';
import {Tutorial, TutorialTiming} from './tutorial/types';
// Studio preview defaults; render-tutorial.mjs passes any tutorials/<id>/ as inputProps.
import reaQuickstart from '../tutorials/rea-quickstart/tutorial.json';
import reaQuickstartTiming from '../tutorials/rea-quickstart/timing.json';

const reaTutorial = {tutorial: reaQuickstart as Tutorial, timing: reaQuickstartTiming as TutorialTiming};

export const RemotionRoot = () => <>
  {([['Solitude', solitude], ['SlowLife', slowLife]] as const).map(([id, data]) => {
    const episode = data as Episode;
    return <Composition key={id} id={id} component={ZenVideo}
      width={episode.width} height={episode.height} fps={episode.fps}
      durationInFrames={durationOf(episode)} defaultProps={{episode}}
      calculateMetadata={({props}) => ({durationInFrames: durationOf(props.episode),
        fps: props.episode.fps, width: props.episode.width, height: props.episode.height})} />;
  })}
  <Composition id="Tutorial" component={TutorialVideo} width={1080} height={1920} fps={30}
    durationInFrames={reaTutorial.timing.totalFrames} defaultProps={reaTutorial}
    calculateMetadata={({props}) => ({durationInFrames: props.timing.totalFrames, fps: props.tutorial.fps,
      width: props.tutorial.width, height: props.tutorial.height})} />
  <Still id="TutorialCover" component={TutorialCover} width={1080} height={1920} defaultProps={reaTutorial} />
</>;
