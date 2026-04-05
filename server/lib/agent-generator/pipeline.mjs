import { readCoreFile } from './context.mjs';
import { callLLM } from './models.mjs';
import {
  extractSkillRequirements,
  resolveSkillsFromGitHub,
} from './skill-resolver.mjs';

let researchContext = null;
let enricherPrompt = null;
let architectPrompt = null;

function loadContext() {
  if (!researchContext) {
    researchContext = readCoreFile('research/agentic-skills-research.md');
  }

  if (!enricherPrompt) {
    enricherPrompt = readCoreFile('prompts/meta-agent-input-enricher-agent-prompt.md');
  }

  if (!architectPrompt) {
    architectPrompt = readCoreFile('prompts/meta-agent-architect-prompt.md');
  }
}

function evaluateAgentPrompt(agentPrompt) {
  const lower = agentPrompt.toLowerCase();

  const signalMarkers = [
    'cognitive architecture',
    'system 2',
    'reflexion',
    'chain of verification',
    'tree of thought',
    'failure mode',
    'anti-pattern',
    'quality gate',
    'first principles',
    'epistemic humility',
  ];

  const signalScore = Math.min(
    10,
    Math.round(
      (signalMarkers.filter((marker) => lower.includes(marker)).length /
        signalMarkers.length) *
        10 +
        2
    )
  );

  const architectureMarkers = [
    'memory',
    'system 2',
    'governance',
    '## cognitive architecture',
    'reflexion loop',
  ];
  const architectureScore = Math.min(
    10,
    Math.round(
      (architectureMarkers.filter((marker) => lower.includes(marker)).length /
        architectureMarkers.length) *
        10
    )
  );

  const antiPatternMarkers = [
    'trigger',
    'symptom',
    'failure mode',
    'prevention',
    'detect',
  ];
  const antiPatternScore = Math.min(
    10,
    Math.round(
      (antiPatternMarkers.filter((marker) => lower.includes(marker)).length /
        antiPatternMarkers.length) *
        10 +
        1
    )
  );

  const skillMarkers = [
    'skill',
    'github.com',
    'source:',
    'path:',
    'repo skill',
    'generated skill',
  ];
  const skillScore = Math.min(
    10,
    skillMarkers.filter((marker) => lower.includes(marker)).length >= 2 ? 9 : 6
  );

  const overall = Math.round(
    ((2 * signalScore +
      3 * architectureScore +
      1.5 * antiPatternScore +
      2.5 * skillScore) /
      9) *
      10
  );

  return {
    signal_density: signalScore,
    cognitive_arch: architectureScore,
    anti_pattern: antiPatternScore,
    skill_precision: skillScore,
    overall: Math.min(100, overall),
  };
}

export async function* runPipeline(userPrompt, modelId, apiKey) {
  loadContext();

  let totalTokens = 0;

  yield {
    type: 'phase_start',
    phase: 'enrich',
    content: 'Enriching your raw prompt into a structured brief...',
  };

  let enrichedBrief = '';

  try {
    const enrichResult = await callLLM(
      modelId,
      [
        {
          role: 'system',
          content: `${enricherPrompt}\n\n## Knowledge Base\n${researchContext}`,
        },
        {
          role: 'user',
          content: `Raw agent idea: "${userPrompt}"\n\nGenerate the structured brief exactly as instructed.`,
        },
      ],
      apiKey
    );

    enrichedBrief = enrichResult.text;
    totalTokens += enrichResult.tokensUsed;

    yield { type: 'phase_output', phase: 'enrich', content: enrichedBrief };
    yield { type: 'phase_complete', phase: 'enrich' };
  } catch (error) {
    yield {
      type: 'error',
      error: `Phase 1 (Enrich) failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
    return;
  }

  yield {
    type: 'phase_start',
    phase: 'architect',
    content: 'Building the base agent prompt and cognitive architecture...',
  };

  let baseAgentPrompt = '';

  try {
    const architectResult = await callLLM(
      modelId,
      [
        {
          role: 'system',
          content: `${architectPrompt}\n\n## Research Foundation\n${researchContext}`,
        },
        {
          role: 'user',
          content: `Enriched brief:\n\n${enrichedBrief}\n\nGenerate the complete base agent prompt with YAML frontmatter and a ## Cognitive Architecture section. Leave a placeholder ## Skills section and do not bind skills yet.`,
        },
      ],
      apiKey
    );

    baseAgentPrompt = architectResult.text;
    totalTokens += architectResult.tokensUsed;

    yield { type: 'phase_output', phase: 'architect', content: baseAgentPrompt };
    yield { type: 'phase_complete', phase: 'architect' };
  } catch (error) {
    yield {
      type: 'error',
      error: `Phase 2 (Architect) failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
    return;
  }

  yield {
    type: 'phase_start',
    phase: 'skills',
    content: 'Extracting skill requirements and searching GitHub...',
  };

  const skillHints = await extractSkillRequirements(baseAgentPrompt, modelId, apiKey);
  totalTokens += Math.ceil(baseAgentPrompt.length / 4);

  for (const hint of skillHints) {
    yield { type: 'skill_search_query', query: hint };
  }

  const skillResolution = await resolveSkillsFromGitHub(
    `${userPrompt} ${enrichedBrief} ${baseAgentPrompt}`,
    skillHints,
    modelId,
    apiKey
  );

  for (const skill of skillResolution.skills) {
    if (skill.source === 'github') {
      yield {
        type: 'skill_match',
        skillName: skill.name,
        sourceUrl: skill.sourceUrl,
        repoStars: skill.repoStars,
        score: skill.matchScore,
      };
      continue;
    }

    yield {
      type: 'skill_generated',
      skillName: skill.name,
      score: 100,
    };
  }

  yield {
    type: 'skills_found',
    skills: skillResolution.skills.map((skill) => skill.name),
    skillResolution,
  };
  yield { type: 'phase_complete', phase: 'skills' };

  yield {
    type: 'phase_start',
    phase: 'integrate',
    content: 'Integrating skills and scoring the result...',
  };

  const skillsBlock = skillResolution.skills
    .map((skill) => {
      const sourceLabel =
        skill.source === 'github'
          ? `**Source**: GitHub - ${skill.sourceUrl} (stars: ${skill.repoStars?.toLocaleString() || 0}, match: ${skill.matchScore}%)`
          : '**Source**: Generated bespoke skill (100% custom fit)';

      return `### ${skill.source === 'github' ? 'Repo' : 'Generated'} Skill: ${skill.name}\n${sourceLabel}\n\n${skill.content.slice(0, 2000)}`;
    })
    .join('\n\n---\n\n');

  const integrationMessages = [
    {
      role: 'system',
      content: `${architectPrompt}\n\n## Research Foundation\n${researchContext}`,
    },
    {
      role: 'user',
      content: `Base agent prompt:\n\n${baseAgentPrompt}\n\n## Skills to Integrate\n\n${
        skillsBlock || 'No external skills. Rely on built-in capabilities only.'
      }\n\nProduce the final integrated agent prompt.\n1. Attribute each GitHub skill with its source URL and star count\n2. Mark generated skills as custom-built skills\n3. Include explicit usage guidance for each skill\n4. Ensure ## Cognitive Architecture, ## Quality Gates, and ## Failure Modes are present\n5. Output only the final markdown agent prompt`,
    },
  ];

  let finalAgentPrompt = '';
  let evalScores = {
    signal_density: 0,
    cognitive_arch: 0,
    anti_pattern: 0,
    skill_precision: 0,
    overall: 0,
  };
  let retries = 0;

  while (retries <= 2) {
    try {
      const integrationResult = await callLLM(
        modelId,
        integrationMessages,
        apiKey
      );

      finalAgentPrompt = integrationResult.text;
      totalTokens += integrationResult.tokensUsed;
      evalScores = evaluateAgentPrompt(finalAgentPrompt);

      if (evalScores.overall >= 75 || retries >= 2) {
        break;
      }

      retries += 1;

      const weakestDimension = Object.entries(evalScores)
        .filter(([key]) => key !== 'overall')
        .sort(([, a], [, b]) => a - b)[0][0];

      integrationMessages.push({
        role: 'assistant',
        content: finalAgentPrompt,
      });
      integrationMessages.push({
        role: 'user',
        content: `Quality gate failed (${evalScores.overall}/100). Weakest dimension: ${weakestDimension}. Revise the prompt to strengthen that area. Output only the revised prompt.`,
      });
    } catch (error) {
      yield {
        type: 'error',
        error: `Phase 3 (Integrate) failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
      return;
    }
  }

  yield { type: 'phase_output', phase: 'integrate', content: finalAgentPrompt };
  yield { type: 'eval_scores', scores: evalScores };
  yield { type: 'phase_complete', phase: 'integrate' };
  yield { type: 'agent_output', agentOutput: finalAgentPrompt, totalTokens };
  yield { type: 'done', totalTokens };
}
