import { listLocalSkills } from './context.mjs';
import { runPipeline } from './pipeline.mjs';
import {
  getGenerationStats,
  insertGenerationRecord,
  listGenerationRecords,
} from './supabase.mjs';

export async function streamGeneration({
  prompt,
  model,
  apiKey,
  userIp,
  writeEvent,
}) {
  let agentOutput = '';
  let evalScores = null;
  let totalTokens = 0;
  const skills = [];
  const phaseLog = [];

  for await (const event of runPipeline(prompt, model, apiKey)) {
    await writeEvent(event);

    if (event.type === 'agent_output' && event.agentOutput) {
      agentOutput = event.agentOutput;
      totalTokens = event.totalTokens || 0;
    }

    if (event.type === 'eval_scores' && event.scores) {
      evalScores = event.scores;
    }

    if (event.type === 'skills_found' && Array.isArray(event.skills)) {
      skills.push(...event.skills);
    }

    if (event.type === 'phase_output' && event.phase && event.content) {
      phaseLog.push({
        phase: event.phase,
        content: event.content,
        timestamp: new Date().toISOString(),
      });
    }
  }

  if (!agentOutput) {
    return;
  }

  await insertGenerationRecord({
    user_ip: userIp || 'unknown',
    user_prompt: prompt,
    model_used: model,
    tokens_consumed: totalTokens,
    skills_selected: skills,
    agent_output: agentOutput,
    eval_scores: evalScores,
    phase_log: phaseLog,
  });
}

export async function getHistoryPage({ page = 1, pageSize = 20 } = {}) {
  return listGenerationRecords({ page, pageSize });
}

export async function getStatsSnapshot() {
  return getGenerationStats();
}

export async function getSkillsCatalog() {
  return {
    skills: listLocalSkills(),
  };
}
