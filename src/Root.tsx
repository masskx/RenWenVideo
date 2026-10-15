import './index.css';
import {Composition, Still} from 'remotion';
import {ZenVideo} from './ZenVideo';
import {ArticleExplainer, ExplainerTimeline} from './ArticleExplainer';
import {Episode, durationOf} from './types';
import solitude from '../episodes/solitude.json';
import slowLife from '../episodes/slow-life.json';
import {TutorialCover, TutorialVideo} from './tutorial/TutorialVideo';
import {Tutorial, TutorialTiming} from './tutorial/types';
import aiEra11Rules from '../explainers/ai-era-11-rules.timeline.json';
// Studio preview defaults; render-tutorial.mjs passes any tutorials/<id>.json as inputProps.
import reaQuickstart from '../tutorials/rea-quickstart.json';
import reaQuickstartTiming from '../tutorials/rea-quickstart.timeline.json';

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
  {([['AiEra11Rules', aiEra11Rules]] as const).map(([id, data]) => {
    const timeline = data as ExplainerTimeline;
    return <Composition key={id} id={id} component={ArticleExplainer}
      width={timeline.width} height={timeline.height} fps={timeline.fps}
      durationInFrames={timeline.durationInFrames} defaultProps={{timeline}} />;
  })}
  <Composition id="Tutorial" component={TutorialVideo} width={1080} height={1920} fps={30}
    durationInFrames={reaTutorial.timing.totalFrames} defaultProps={reaTutorial}
    calculateMetadata={({props}) => ({durationInFrames: props.timing.totalFrames, fps: props.tutorial.fps,
      width: props.tutorial.width, height: props.tutorial.height})} />
  <Still id="TutorialCover" component={TutorialCover} width={1080} height={1920} defaultProps={reaTutorial} />
</>;
