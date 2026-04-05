import * as fs from 'fs';
import * as path from 'path';
import { callLLM, type ModelId, type LLMMessage } from './models';
import { resolveSkillsFromGitHub, extractSkillRequirements, type SkillResolutionResult } from './skill-resolver';
import type { EvalScores, PhaseLog } from './supabase';

// ── Paths to core context files ──────────────────────────────────────────────
const CORE_DIR = path.join(process.cwd(), 'core');

function readCoreFile(relPath: string): string {
    const fullPath = path.join(CORE_DIR, relPath);
    if (!fs.existsSync(fullPath)) return '';
    return fs.readFileSync(fullPath, 'utf-8');
}

// Cached at module level (cold start only)
let _research: string | null = null;
let _enricherPrompt: string | null = null;
let _architectPrompt: string | null = null;

function loadContext() {
    if (!_research) _research = readCoreFile('research/agentic-skills-research.md');
    if (!_enricherPrompt) _enricherPrompt = readCoreFile('prompts/meta-agent-input-enricher-agent-prompt.md');
    if (!_architectPrompt) _architectPrompt = readCoreFile('prompts/meta-agent-architect-prompt.md');
}

// ── Streaming event types ─────────────────────────────────────────────────────
export type PhaseEventType =
    | 'phase_start'
    | 'phase_output'
    | 'phase_complete'
    | 'skill_search_query'
    | 'skill_candidate'
    | 'skill_match'
    | 'skill_generated'
    | 'skills_found'
    | 'eval_scores'
    | 'agent_output'
    | 'error'
    | 'done';

export interface PhaseEvent {
    type: PhaseEventType;
    phase?: string;
    content?: string;
    skills?: string[];
    skillResolution?: SkillResolutionResult;
    scores?: EvalScores;
    agentOutput?: string;
    error?: string;
    totalTokens?: number;
    // skill-specific
    query?: string;
    skillName?: string;
    sourceUrl?: string;
    repoStars?: number;
    score?: number;
}

// ── Quality Gate Evaluator ────────────────────────────────────────────────────
function evaluateAgentPrompt(agentPrompt: string): EvalScores {
    const lower = agentPrompt.toLowerCase();

    const signalMarkers = [
        'cognitive architecture', 'system 2', 'reflexion', 'chain of verification',
        'tree of thought', 'failure mode', 'anti-pattern', 'quality gate',
        'first principles', 'epistemic humility',
    ];
    const signalScore = Math.min(10, Math.round(
        (signalMarkers.filter((m) => lower.includes(m)).length / signalMarkers.length) * 10 + 2,
    ));

    const cogMarkers = ['memory', 'system 2', 'governance', '## cognitive architecture', 'reflexion loop'];
    const cogScore = Math.min(10, Math.round(
        (cogMarkers.filter((m) => lower.includes(m)).length / cogMarkers.length) * 10,
    ));

    const antiMarkers = ['trigger', 'symptom', 'failure mode', 'prevention', 'detect'];
    const antiScore = Math.min(10, Math.round(
        (antiMarkers.filter((m) => lower.includes(m)).length / antiMarkers.length) * 10 + 1,
    ));

    // Skill precision is higher now — GitHub skills include source URLs
    const skillMarkers = ['skill', 'github.com', 'source:', 'path:', 'repo skill', 'generated skill'];
    const skillScore = Math.min(10, Math.round(
        skillMarkers.filter((m) => lower.includes(m)).length >= 2 ? 9 : 6,
    ));

    const overall = Math.round(
        ((2 * signalScore + 3 * cogScore + 1.5 * antiScore + 2.5 * skillScore) / 9) * 10,
    );

    return {
        signal_density: signalScore,
        cognitive_arch: cogScore,
        anti_pattern: antiScore,
        skill_precision: skillScore,
        overall: Math.min(100, overall),
    };
}

// ── Main Pipeline ─────────────────────────────────────────────────────────────
export async function* runPipeline(
    userPrompt: string,
    modelId: ModelId,
    apiKey: string,
): AsyncGenerator<PhaseEvent> {
    loadContext();

    const phaseLogs: PhaseLog[] = [];
    let totalTokens = 0;

    // ── PHASE 1.1: Input Enricher ────────────────────────────────────────────
    yield { type: 'phase_start', phase: 'enrich', content: 'Enriching your raw prompt into a 4-dimension structured brief...' };

    const enricherMessages: LLMMessage[] = [
        {
            role: 'system',
            content: `${_enricherPrompt}\n\n## Knowledge Base\n${_research}`,
        },
        {
            role: 'user',
            content: `Raw agent idea: "${userPrompt}"\n\nGenerate the 4-dimension structured brief exactly as instructed.`,
        },
    ];

    let enrichedBrief = '';
    try {
        const enrichResult = await callLLM(modelId, enricherMessages, apiKey);
        enrichedBrief = enrichResult.text;
        totalTokens += enrichResult.tokensUsed;
        phaseLogs.push({ phase: 'enrich', content: enrichedBrief, timestamp: new Date().toISOString() });
        yield { type: 'phase_output', phase: 'enrich', content: enrichedBrief };
        yield { type: 'phase_complete', phase: 'enrich' };
    } catch (err) {
        yield { type: 'error', error: `Phase 1 (Enrich) failed: ${(err as Error).message}` };
        return;
    }

    // ── PHASE 1.2: Meta-Agent Architect ──────────────────────────────────────
    yield { type: 'phase_start', phase: 'architect', content: 'Building cognitive architecture and base agent prompt...' };

    const architectMessages: LLMMessage[] = [
        {
            role: 'system',
            content: `${_architectPrompt}\n\n## Research Foundation\n${_research}`,
        },
        {
            role: 'user',
            content: `Enriched brief:\n\n${enrichedBrief}\n\nGenerate the complete base agent prompt with YAML frontmatter and ## Cognitive Architecture section. Leave a placeholder ## Skills section — do NOT bind skills yet.`,
        },
    ];

    let baseAgentPrompt = '';
    try {
        const archResult = await callLLM(modelId, architectMessages, apiKey);
        baseAgentPrompt = archResult.text;
        totalTokens += archResult.tokensUsed;
        phaseLogs.push({ phase: 'architect', content: baseAgentPrompt, timestamp: new Date().toISOString() });
        yield { type: 'phase_output', phase: 'architect', content: baseAgentPrompt };
        yield { type: 'phase_complete', phase: 'architect' };
    } catch (err) {
        yield { type: 'error', error: `Phase 2 (Architect) failed: ${(err as Error).message}` };
        return;
    }

    // ── PHASE 2: GitHub Skill Resolution ─────────────────────────────────────
    yield { type: 'phase_start', phase: 'skills', content: 'Extracting skill requirements and searching GitHub (≥1k ⭐ repos)...' };

    // Extract what skills this agent needs
    const skillHints = await extractSkillRequirements(baseAgentPrompt, modelId, apiKey);
    totalTokens += Math.ceil(baseAgentPrompt.length / 4); // rough estimate for extraction call

    // Stream search queries to client
    for (const hint of skillHints) {
        yield { type: 'skill_search_query', query: hint };
    }

    // GitHub search + LLM scoring
    const skillResolution = await resolveSkillsFromGitHub(
        `${userPrompt} ${enrichedBrief} ${baseAgentPrompt}`,
        skillHints,
        modelId,
        apiKey,
    );

    // Stream individual skill results
    for (const skill of skillResolution.skills) {
        if (skill.source === 'github') {
            yield {
                type: 'skill_match',
                skillName: skill.name,
                sourceUrl: skill.sourceUrl,
                repoStars: skill.repoStars,
                score: skill.matchScore,
            };
        } else {
            yield { type: 'skill_generated', skillName: skill.name, score: 100 };
        }
    }

    const skillNames = skillResolution.skills.map((s) => s.name);
    phaseLogs.push({ phase: 'skills', content: JSON.stringify(skillResolution, null, 2), timestamp: new Date().toISOString() });
    yield { type: 'skills_found', skills: skillNames, skillResolution };
    yield { type: 'phase_complete', phase: 'skills' };

    // ── PHASE 3: Skill Integration + Eval ────────────────────────────────────
    yield { type: 'phase_start', phase: 'integrate', content: 'Integrating skills and running quality gate scoring...' };

    const skillsBlock = skillResolution.skills
        .map((s) => {
            const sourceLabel = s.source === 'github'
                ? `**Source**: GitHub — ${s.sourceUrl} (⭐ ${s.repoStars?.toLocaleString()}, Match: ${s.matchScore}%)`
                : `**Source**: Generated bespoke skill (100% custom fit)`;
            return `### ${s.source === 'github' ? 'Repo' : 'Generated'} Skill: ${s.name}\n${sourceLabel}\n\n${s.content.slice(0, 2000)}`;
        })
        .join('\n\n---\n\n');

    const integrationMessages: LLMMessage[] = [
        {
            role: 'system',
            content: `${_architectPrompt}\n\n## Research Foundation\n${_research}`,
        },
        {
            role: 'user',
            content: `Base agent prompt:\n\n${baseAgentPrompt}\n\n## Skills to Integrate\n\n${skillsBlock || 'No external skills — rely on built-in capabilities.'}\n\nProduce the FINAL integrated agent prompt:\n1. For each GitHub skill: include its Source URL + star count as attribution\n2. For each Generated skill: note it as a custom-built skill\n3. Include explicit usage directions for each skill\n4. Ensure ## Cognitive Architecture, ## Quality Gates, ## Failure Modes are present\n5. Output ONLY the final markdown agent prompt, no commentary`,
        },
    ];

    let finalAgentPrompt = '';
    let evalScores: EvalScores = { signal_density: 0, cognitive_arch: 0, anti_pattern: 0, skill_precision: 0, overall: 0 };
    let retries = 0;

    while (retries <= 2) {
        try {
            const intResult = await callLLM(modelId, integrationMessages, apiKey);
            finalAgentPrompt = intResult.text;
            totalTokens += intResult.tokensUsed;
            evalScores = evaluateAgentPrompt(finalAgentPrompt);

            if (evalScores.overall >= 75 || retries >= 2) break;

            // Retry with critique
            retries++;
            const weakest = Object.entries(evalScores)
                .filter(([k]) => k !== 'overall')
                .sort(([, a], [, b]) => a - b)[0][0];

            integrationMessages.push({ role: 'assistant', content: finalAgentPrompt });
            integrationMessages.push({
                role: 'user',
                content: `Quality gate failed (score: ${evalScores.overall}/100). Weakest: ${weakest}. Revise the prompt to address this. Output ONLY the revised prompt.`,
            });
        } catch (err) {
            yield { type: 'error', error: `Phase 3 (Integrate) failed: ${(err as Error).message}` };
            return;
        }
    }

    phaseLogs.push({ phase: 'integrate', content: finalAgentPrompt, timestamp: new Date().toISOString() });
    yield { type: 'phase_output', phase: 'integrate', content: finalAgentPrompt };
    yield { type: 'eval_scores', scores: evalScores };
    yield { type: 'phase_complete', phase: 'integrate' };
    yield { type: 'agent_output', agentOutput: finalAgentPrompt, totalTokens };
    yield { type: 'done', totalTokens };
}

export type { EvalScores, PhaseLog };
