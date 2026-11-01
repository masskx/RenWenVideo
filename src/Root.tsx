import './index.css';
import './tutorial/fonts'; // repo fonts (public/fonts) for every composition
import {Composition, Still} from 'remotion';
import {ArticleExplainer, ExplainerTimeline} from './ArticleExplainer';
import {TutorialCover, TutorialCoverCard, TutorialVideo} from './tutorial/TutorialVideo';
import {Tutorial, TutorialTiming} from './tutorial/types';
import {LAB_FRAMES, PropsLab} from './lab/PropsLab';
import {PackageLab, PackageShot} from './lab/PackageLab';
import {SceneLab, SCENE_LAB_FRAMES} from './lab/SceneLab';
import {HostLab} from './lab/HostLab';
import aiEra11Rules from '../explainers/ai-era-11-rules.timeline.json';
import marketingEngineer from '../explainers/marketing-engineer.timeline.json';
// Studio preview defaults; render-tutorial.mjs passes any tutorials/<id>.json as inputProps.
import reaQuickstart from '../tutorials/rea-quickstart.json';
import reaQuickstartTiming from '../tutorials/rea-quickstart.timeline.json';

const reaTutorial = {tutorial: reaQuickstart as Tutorial, timing: reaQuickstartTiming as TutorialTiming};

export const RemotionRoot = () => <>
  {([['AiEra11Rules', aiEra11Rules], ['MarketingEngineer', marketingEngineer]] as const).map(([id, data]) => {
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
  {/* Designed covers (tutorial.coverCard), one composition per ratio */}
  <Still id="TutorialCover34" component={TutorialCoverCard} width={1080} height={1440} defaultProps={{...reaTutorial, ratio: '3:4' as const}} />
  <Still id="TutorialCover67" component={TutorialCoverCard} width={1080} height={1260} defaultProps={{...reaTutorial, ratio: '6:7' as const}} />
  <Still id="TutorialCover916" component={TutorialCoverCard} width={1080} height={1920} defaultProps={{...reaTutorial, ratio: '9:16' as const}} />
  {/* Style frames for the props kit (src/lab/PropsLab.tsx) */}
  <Composition id="PropsLab" component={PropsLab} width={1080} height={1920} fps={30} durationInFrames={LAB_FRAMES} defaultProps={{shot: 'hook' as const}} />
  {/* Proof frames for the news-package finish learned from lemo-opuscar (src/lab/PackageLab.tsx) */}
  <Still id="PackageLab" component={PackageLab} width={1080} height={1920} defaultProps={{shot: 'burnHook' as PackageShot}} />
  {/* Any scene's layer at a frame, before voicing (src/lab/SceneLab.tsx) */}
  <Composition id="SceneLab" component={SceneLab} width={1080} height={1920} fps={30} durationInFrames={SCENE_LAB_FRAMES} defaultProps={{visual: 'ns.hook'}} />
  {/* The host IP's model sheet and talking test (src/lab/HostLab.tsx) */}
  <Composition id="HostLab" component={HostLab} width={1920} height={1080} fps={30} durationInFrames={240} defaultProps={{sheet: 'model' as const}} />
</>;
