import './index.css';
import {Composition} from 'remotion';
import {ZenVideo} from './ZenVideo';
import {ArticleExplainer, ExplainerTimeline} from './ArticleExplainer';
import {Episode, durationOf} from './types';
import solitude from '../episodes/solitude.json';
import slowLife from '../episodes/slow-life.json';
import aiEra11Rules from '../explainers/ai-era-11-rules.timeline.json';

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
</>;
