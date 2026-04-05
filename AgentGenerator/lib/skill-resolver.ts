/**
 * GitHub-first Skill Resolver
 *
 * Strategy (matching the /generate-agent-v2 Phase 2 logic):
 * 1. Search GitHub for SKILL.md files in repos with ≥1k stars, using the agent's keywords
 * 2. For each candidate, read the raw file content
 * 3. LLM-score relevance (0–100). If ≥85 → use it & cite the source
 * 4. If no GitHub match found → generate a bespoke skill via the /generate-skills pipeline
 */

import { callLLM, type ModelId } from './models';

export interface ResolvedSkill {
    name: string;
    content: string;
    source: 'github' | 'generated';
    sourceUrl?: string;       // GitHub URL if from GitHub
    matchScore: number;       // 0–100
    repoStars?: number;
}

// ── GitHub Search ─────────────────────────────────────────────────────────────
const GH_SEARCH_URL = 'https://api.github.com/search/code';
const GH_RAW_BASE = 'https://raw.githubusercontent.com';

interface GitHubCodeItem {
    name: string;
    path: string;
    html_url: string;
    repository: {
        full_name: string;
        stargazers_count?: number;
        description?: string;
    };
}

/**
 * Search GitHub for skill files relevant to the given keywords.
 * Filters to repos with ≥1k stars.
 */
async function searchGitHubSkills(keywords: string[]): Promise<GitHubCodeItem[]> {
    const query = [
        keywords.slice(0, 4).join(' '),
        'in:file',
        'filename:SKILL.md',
    ].join('+');

    const url = `${GH_SEARCH_URL}?q=${encodeURIComponent(query)}&per_page=10`;

    const headers: HeadersInit = {
        Accept: 'application/vnd.github.v3+json',
        'User-Agent': 'AgentForge/1.0',
    };
    const ghToken = process.env.GITHUB_TOKEN;
    if (ghToken) headers['Authorization'] = `token ${ghToken}`;

    const res = await fetch(url, { headers, next: { revalidate: 3600 } });
    if (!res.ok) return [];

    const data = await res.json() as { items?: GitHubCodeItem[] };
    const items = data.items ?? [];

    // Fetch star counts in parallel for repos that don't have them
    const enriched = await Promise.all(
        items.map(async (item) => {
            if (item.repository.stargazers_count !== undefined) return item;
            const repoRes = await fetch(`https://api.github.com/repos/${item.repository.full_name}`, { headers });
            if (!repoRes.ok) return item;
            const repoData = await repoRes.json() as { stargazers_count: number; description: string };
            item.repository.stargazers_count = repoData.stargazers_count;
            item.repository.description = repoData.description;
            return item;
        }),
    );

    // Filter to repos with ≥1k stars
    return enriched.filter((item) => (item.repository.stargazers_count ?? 0) >= 1000);
}

/**
 * Fetch the raw content of a SKILL.md file from GitHub.
 */
async function fetchRawSkillContent(item: GitHubCodeItem): Promise<string> {
    // Convert html_url → raw URL
    // e.g. https://github.com/user/repo/blob/main/skills/foo/SKILL.md
    //    → https://raw.githubusercontent.com/user/repo/main/skills/foo/SKILL.md
    const rawUrl = item.html_url
        .replace('https://github.com/', `${GH_RAW_BASE}/`)
        .replace('/blob/', '/');

    const res = await fetch(rawUrl, { next: { revalidate: 3600 } });
    if (!res.ok) return '';
    return res.text();
}

// ── LLM Relevance Scoring ─────────────────────────────────────────────────────
async function scoreSkillRelevance(
    skillContent: string,
    agentDescription: string,
    modelId: ModelId,
    apiKey: string,
): Promise<number> {
    const prompt = `You are evaluating whether a skill file is a good fit for an AI agent.

## Agent Description
${agentDescription.slice(0, 800)}

## Skill File Content (first 1200 chars)
${skillContent.slice(0, 1200)}

Rate the relevance of this skill for the described agent on a scale of 0-100.
Consider: Does this skill provide capabilities the agent explicitly needs?
Response format: a single integer 0-100. No other text.`;

    try {
        const result = await callLLM(modelId, [{ role: 'user', content: prompt }], apiKey);
        const score = parseInt(result.text.trim(), 10);
        return isNaN(score) ? 0 : Math.min(100, Math.max(0, score));
    } catch {
        return 0;
    }
}

// ── Skill Generator (fallback) ────────────────────────────────────────────────
async function generateBespokeSkill(
    skillName: string,
    agentDescription: string,
    modelId: ModelId,
    apiKey: string,
): Promise<string> {
    const architectPrompt = `You are a Skill Architect. Generate a complete SKILL.md file for an AI IDE skill.

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

Be specific, expert-level, and free of AI clichés. Output ONLY the raw SKILL.md content.`;

    const result = await callLLM(
        modelId,
        [{ role: 'user', content: architectPrompt }],
        apiKey,
    );
    return result.text;
}

// ── Main Resolver ─────────────────────────────────────────────────────────────
export interface SkillResolutionResult {
    skills: ResolvedSkill[];
    searchQueries: string[];
    githubCandidatesFound: number;
    fallbackGenerated: number;
}

export async function resolveSkillsFromGitHub(
    agentDescription: string,
    requiredSkillHints: string[], // e.g. ["SEO audit", "competitor analysis"]
    modelId: ModelId,
    apiKey: string,
    maxSkills = 4,
): Promise<SkillResolutionResult> {
    const resolvedSkills: ResolvedSkill[] = [];
    const searchQueries: string[] = [];
    let githubCandidatesFound = 0;
    let fallbackGenerated = 0;

    for (const skillHint of requiredSkillHints.slice(0, maxSkills)) {
        const keywords = skillHint
            .toLowerCase()
            .replace(/[^a-z0-9 ]/g, ' ')
            .split(/\s+/)
            .filter((w) => w.length > 3);

        searchQueries.push(keywords.join(' '));

        // 1. GitHub search
        let found = false;
        try {
            const candidates = await searchGitHubSkills(keywords);
            githubCandidatesFound += candidates.length;

            for (const candidate of candidates.slice(0, 5)) {
                const content = await fetchRawSkillContent(candidate);
                if (!content) continue;

                const score = await scoreSkillRelevance(content, agentDescription, modelId, apiKey);

                if (score >= 85) {
                    resolvedSkills.push({
                        name: skillHint,
                        content,
                        source: 'github',
                        sourceUrl: candidate.html_url,
                        matchScore: score,
                        repoStars: candidate.repository.stargazers_count,
                    });
                    found = true;
                    break;
                }
            }
        } catch {
            // GitHub search failed — fall through to generation
        }

        // 2. Fallback: generate bespoke skill
        if (!found) {
            const generatedContent = await generateBespokeSkill(
                skillHint,
                agentDescription,
                modelId,
                apiKey,
            );
            resolvedSkills.push({
                name: skillHint,
                content: generatedContent,
                source: 'generated',
                matchScore: 100, // bespoke = perfect fit
            });
            fallbackGenerated++;
        }
    }

    return { skills: resolvedSkills, searchQueries, githubCandidatesFound, fallbackGenerated };
}

/**
 * Extract skill requirements from a base agent prompt using LLM.
 */
export async function extractSkillRequirements(
    baseAgentPrompt: string,
    modelId: ModelId,
    apiKey: string,
): Promise<string[]> {
    const prompt = `Analyze this AI agent prompt and list the distinct skill categories it needs:

${baseAgentPrompt.slice(0, 2000)}

Output a JSON array of 3-5 skill names (short, searchable phrases like "SEO audit", "competitor analysis", "email copywriting").
Response: valid JSON array only. Example: ["web scraping", "data analysis", "email outreach"]`;

    try {
        const result = await callLLM(modelId, [{ role: 'user', content: prompt }], apiKey);
        const match = result.text.match(/\[[\s\S]*?\]/);
        if (!match) return [];
        return JSON.parse(match[0]) as string[];
    } catch {
        return [];
    }
}
