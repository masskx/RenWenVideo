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
import {deepseekClaudeCodeScenes} from './deepseek-claude-code-video';

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
  ...deepseekClaudeCodeScenes,
};
