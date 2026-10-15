import './index.css';
import {Composition} from 'remotion';
import {ArticleExplainer, ExplainerTimeline} from './ArticleExplainer';
import aiEra11Rules from '../explainers/ai-era-11-rules.timeline.json';

export const RemotionRoot = () => <>
  {([['AiEra11Rules', aiEra11Rules]] as const).map(([id, data]) => {
    const timeline = data as ExplainerTimeline;
    return <Composition key={id} id={id} component={ArticleExplainer}
      width={timeline.width} height={timeline.height} fps={timeline.fps}
      durationInFrames={timeline.durationInFrames} defaultProps={{timeline}} />;
  })}
</>;
