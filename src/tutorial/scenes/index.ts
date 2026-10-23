import React from 'react';
import {CamKey, SceneProps, SfxEvent} from '../ui';
import {ochiaiClaudeCodeScenes} from './ochiai-claude-code';
import {aiAgentTeamScenes} from './ai-agent-team';
import {teslaRoadsterScenes} from './tesla-roadster-flight';
import {agentRoadmapScenes} from './agent-engineer-roadmap';
import {magpieLessonsScenes} from './magpie-lessons';
import {reaQuickstartScenes} from './rea-quickstart';
import {workbuddySkillsScenes} from './workbuddy-15-skills';
import {anatomyScenes} from './anatomy-explain';
import {deepseekVsOpusScenes} from './deepseek-vs-opus55';
import {deepseekIdentityScenes} from './deepseek-identity';
import {headroomScenes} from './headroom';
import {orbitScenes} from './orbit-360-doubao';
import {huashuMotionScenes} from './huashu-motion-skill';
import {awesomeSeedanceScenes} from './awesome-seedance';
import {stickerAlphaScenes} from './sticker-alpha-method';
import {sweetyHanddrawScenes} from './sweety-handdraw-video';
import {digitalCleanupScenes} from './ai-digital-cleanup-cn';
import {faceswapScamScenes} from './ai-faceswap-scam';
import {literalCrawlerScenes} from './literal-web-crawler';
import {php2shellScenes} from './php2shell-overtime';
import {litellmPoisonScenes} from './litellm-pypi-poison';
import {litellmCinemaScenes} from './litellm-pypi-poison-cinema';
import {claudeProactiveScenes} from './claude-proactive-agent';
import {claudeProactiveCinemaScenes} from './claude-proactive-agent-cinema';
import {deepseekDeepinferScenes} from './deepseek-deepinfer';
import {agentComputeHijackScenes} from './agent-compute-hijack';
import {aiSameTakeOnHumansScenes} from './ai-same-take-on-humans';
import {tibetQuakeAiRumorScenes} from './tibet-quake-ai-rumor';
import {vibeKnowledgeDouyinScenes} from './vibe-knowledge-douyin';
import {agentComputeHijackV2Scenes} from './agent-compute-hijack-v2';

export type SceneComponent = React.FC<SceneProps & {credit: string}> & {sfx?: (cue: SceneProps['cue'], dur: number) => SfxEvent[];
  camera?: (cue: SceneProps['cue'], dur: number) => CamKey[]; hud?: boolean; backdrop?: React.FC<SceneProps>};

// One file per tutorial; visual keys must be unique across files.
export const sceneRegistry: Record<string, SceneComponent> = {
  ...reaQuickstartScenes,
  ...ochiaiClaudeCodeScenes,
  ...workbuddySkillsScenes,
  ...magpieLessonsScenes,
  ...aiAgentTeamScenes,
  ...teslaRoadsterScenes,
  ...agentRoadmapScenes,
  ...anatomyScenes,
  ...deepseekVsOpusScenes,
  ...deepseekIdentityScenes,
  ...headroomScenes,
  ...orbitScenes,
  ...huashuMotionScenes,
  ...awesomeSeedanceScenes,
  ...stickerAlphaScenes,
  ...sweetyHanddrawScenes,
  ...digitalCleanupScenes,
  ...faceswapScamScenes,
  ...literalCrawlerScenes,
  ...php2shellScenes,
  ...litellmPoisonScenes,
  ...litellmCinemaScenes,
  ...claudeProactiveScenes,
  ...claudeProactiveCinemaScenes,
  ...deepseekDeepinferScenes,
  ...agentComputeHijackScenes,
  ...aiSameTakeOnHumansScenes,
  ...tibetQuakeAiRumorScenes,
  ...vibeKnowledgeDouyinScenes,
  ...agentComputeHijackV2Scenes,
};
