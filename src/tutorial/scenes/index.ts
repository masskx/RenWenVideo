import React from 'react';
import {SceneProps} from '../ui';
import {ochiaiClaudeCodeScenes} from './ochiai-claude-code';
import {aiAgentTeamScenes} from './ai-agent-team';
import {magpieLessonsScenes} from './magpie-lessons';
import {reaQuickstartScenes} from './rea-quickstart';
import {workbuddySkillsScenes} from './workbuddy-15-skills';

export type SceneComponent = React.FC<SceneProps & {credit: string}>;

// One file per tutorial; visual keys must be unique across files.
export const sceneRegistry: Record<string, SceneComponent> = {
  ...reaQuickstartScenes,
  ...ochiaiClaudeCodeScenes,
  ...workbuddySkillsScenes,
  ...magpieLessonsScenes,
  ...aiAgentTeamScenes,
};
