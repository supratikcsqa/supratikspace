import { callLLM } from './models.mjs';

const GITHUB_SEARCH_URL = 'https://api.github.com/search/code';
const GITHUB_RAW_BASE_URL = 'https://raw.githubusercontent.com';

function getGitHubHeaders() {
  const headers = {
    Accept: 'application/vnd.github.v3+json',
    'User-Agent': 'supratik-space-agent-generator',
  };

  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `token ${process.env.GITHUB_TOKEN}`;
  }

  return headers;
}

async function searchGitHubSkills(keywords) {
  if (!keywords.length) {
    return [];
  }

  const query = [
    keywords.slice(0, 4).join(' '),
    'in:file',
    'filename:SKILL.md',
  ].join('+');

  const response = await fetch(
    `${GITHUB_SEARCH_URL}?q=${encodeURIComponent(query)}&per_page=10`,
    { headers: getGitHubHeaders() }
  );

  if (!response.ok) {
    return [];
  }

  const payload = await response.json();
  const items = Array.isArray(payload.items) ? payload.items : [];

  const enriched = await Promise.all(
    items.map(async (item) => {
      if (typeof item.repository?.stargazers_count === 'number') {
        return item;
      }

      const repoResponse = await fetch(
        `https://api.github.com/repos/${item.repository.full_name}`,
        { headers: getGitHubHeaders() }
      );

      if (!repoResponse.ok) {
        return item;
      }

      const repo = await repoResponse.json();
      return {
        ...item,
        repository: {
          ...item.repository,
          stargazers_count: repo.stargazers_count,
          description: repo.description,
        },
      };
    })
  );

  return enriched.filter(
    (item) => Number(item.repository?.stargazers_count || 0) >= 1000
  );
}

async function fetchRawSkillContent(item) {
  const rawUrl = item.html_url
    .replace('https://github.com/', `${GITHUB_RAW_BASE_URL}/`)
    .replace('/blob/', '/');

  const response = await fetch(rawUrl);

  if (!response.ok) {
    return '';
  }

  return response.text();
}

async function scoreSkillRelevance(skillContent, agentDescription, modelId, apiKey) {
  const prompt = `You are evaluating whether a skill file is a good fit for an AI agent.

## Agent Description
${agentDescription.slice(0, 800)}

## Skill File Content (first 1200 chars)
${skillContent.slice(0, 1200)}

Rate the relevance of this skill for the described agent on a scale of 0-100.
Consider: Does this skill provide capabilities the agent explicitly needs?
Respond with a single integer only.`;

  try {
    const result = await callLLM(modelId, [{ role: 'user', content: prompt }], apiKey);
    const score = Number.parseInt(result.text.trim(), 10);
    return Number.isFinite(score) ? Math.max(0, Math.min(100, score)) : 0;
  } catch {
    return 0;
  }
}

async function generateBespokeSkill(skillName, agentDescription, modelId, apiKey) {
  const prompt = `You are a Skill Architect. Generate a complete SKILL.md file for an AI IDE skill.

The skill must help an AI agent perform: ${skillName}
In context of: ${agentDescription.slice(0, 600)}

Generate a complete SKILL.md with:
- YAML frontmatter (name, description, version, trigger_phrases)
- ## Purpose section
- ## When to Use section
- ## Core Capabilities section (5-8 specific capabilities)
- ## Step-by-Step Process section (numbered steps)
- ## Quality Gates section (pass/fail checks)
- ## Anti-Patterns section (3-5 failure modes with triggers + prevention)
- ## Output Contract section

Be specific, expert-level, and avoid generic AI filler. Output only the SKILL.md content.`;

  const result = await callLLM(modelId, [{ role: 'user', content: prompt }], apiKey);
  return result.text;
}

export async function resolveSkillsFromGitHub(
  agentDescription,
  requiredSkillHints,
  modelId,
  apiKey,
  maxSkills = 4
) {
  const resolvedSkills = [];
  const searchQueries = [];
  let githubCandidatesFound = 0;
  let fallbackGenerated = 0;

  for (const skillHint of requiredSkillHints.slice(0, maxSkills)) {
    const keywords = skillHint
      .toLowerCase()
      .replace(/[^a-z0-9 ]/g, ' ')
      .split(/\s+/)
      .filter((word) => word.length > 3);

    searchQueries.push(keywords.join(' '));

    let found = false;

    try {
      const candidates = await searchGitHubSkills(keywords);
      githubCandidatesFound += candidates.length;

      for (const candidate of candidates.slice(0, 5)) {
        const content = await fetchRawSkillContent(candidate);

        if (!content) {
          continue;
        }

        const score = await scoreSkillRelevance(
          content,
          agentDescription,
          modelId,
          apiKey
        );

        if (score >= 85) {
          resolvedSkills.push({
            name: skillHint,
            content,
            source: 'github',
            sourceUrl: candidate.html_url,
            matchScore: score,
            repoStars: candidate.repository?.stargazers_count || 0,
          });
          found = true;
          break;
        }
      }
    } catch {
      found = false;
    }

    if (!found) {
      const content = await generateBespokeSkill(
        skillHint,
        agentDescription,
        modelId,
        apiKey
      );

      resolvedSkills.push({
        name: skillHint,
        content,
        source: 'generated',
        matchScore: 100,
      });
      fallbackGenerated += 1;
    }
  }

  return {
    skills: resolvedSkills,
    searchQueries,
    githubCandidatesFound,
    fallbackGenerated,
  };
}

export async function extractSkillRequirements(baseAgentPrompt, modelId, apiKey) {
  const prompt = `Analyze this AI agent prompt and list the distinct skill categories it needs:

${baseAgentPrompt.slice(0, 2000)}

Output a JSON array of 3-5 short skill names that are easy to search for.
Example: ["web scraping", "data analysis", "email outreach"]`;

  try {
    const result = await callLLM(modelId, [{ role: 'user', content: prompt }], apiKey);
    const jsonMatch = result.text.match(/\[[\s\S]*?\]/);

    if (!jsonMatch) {
      return [];
    }

    const parsed = JSON.parse(jsonMatch[0]);
    return Array.isArray(parsed) ? parsed.filter(Boolean) : [];
  } catch {
    return [];
  }
}
