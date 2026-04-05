import { useCallback, useEffect, useRef, useState } from 'react';
import { AlertCircle, Cpu, Sparkles } from 'lucide-react';
import { AgentOutput } from './components/AgentOutput';
import { EvalScorecard } from './components/EvalScorecard';
import { ModelSelector } from './components/ModelSelector';
import { PhaseCard } from './components/PhaseCard';
import {
  PipelineProgress,
  type PipelinePhase,
} from './components/PipelineProgress';
import type { ModelId } from './models';

const EXAMPLE_PROMPTS = [
  'SEO content strategist agent for SaaS companies',
  'Instagram Reels script writer for ecommerce brands',
  'Code review bot for senior engineering teams',
  'Cold email outreach agent for B2B sales',
  'Competitor intelligence researcher for product teams',
];

interface EvalScores {
  signal_density: number;
  cognitive_arch: number;
  anti_pattern: number;
  skill_precision: number;
  overall: number;
}

interface PhaseOutput {
  enrich: string;
  architect: string;
  integrate: string;
}

interface SkillEvent {
  name: string;
  source: 'github' | 'generated';
  sourceUrl?: string;
  repoStars?: number;
  score?: number;
}

export default function AgentGeneratorHomePage() {
  const [prompt, setPrompt] = useState('');
  const [model, setModel] = useState<ModelId>('gpt-4o');
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activePhase, setActivePhase] = useState<PipelinePhase | null>(null);
  const [completedPhases, setCompletedPhases] = useState<Set<PipelinePhase>>(
    new Set()
  );
  const [phaseOutputs, setPhaseOutputs] = useState<Partial<PhaseOutput>>({});
  const [skills, setSkills] = useState<SkillEvent[]>([]);
  const [searchQueries, setSearchQueries] = useState<string[]>([]);
  const [evalScores, setEvalScores] = useState<EvalScores | null>(null);
  const [agentOutput, setAgentOutput] = useState<string | null>(null);
  const [totalTokens, setTotalTokens] = useState(0);

  const readerRef = useRef<ReadableStreamDefaultReader<Uint8Array> | null>(null);

  useEffect(() => {
    return () => {
      readerRef.current?.cancel().catch(() => undefined);
    };
  }, []);

  const getApiKeyForModel = (modelId: ModelId) => {
    if (modelId.startsWith('gpt')) return window.localStorage.getItem('apikey_openai') || '';
    if (modelId.startsWith('gemini')) return window.localStorage.getItem('apikey_google') || '';
    if (modelId.startsWith('claude')) return window.localStorage.getItem('apikey_anthropic') || '';
    return '';
  };

  const reset = () => {
    setActivePhase(null);
    setCompletedPhases(new Set());
    setPhaseOutputs({});
    setSkills([]);
    setSearchQueries([]);
    setEvalScores(null);
    setAgentOutput(null);
    setTotalTokens(0);
    setError(null);
  };

  const handleGenerate = useCallback(async () => {
    if (!prompt.trim() || running) {
      return;
    }

    const apiKey = getApiKeyForModel(model);

    if (!apiKey) {
      setError('No API key is configured for that model. Use the API Keys panel in the top nav first.');
      return;
    }

    reset();
    setRunning(true);

    try {
      const response = await fetch('/api/agents/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
        },
        body: JSON.stringify({ prompt, model }),
      });

      if (!response.ok || !response.body) {
        const payload = await response.json().catch(() => ({ error: 'Generation failed.' }));
        throw new Error(payload?.error || 'Generation failed.');
      }

      const reader = response.body.getReader();
      readerRef.current = reader;
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) {
            continue;
          }

          try {
            const event = JSON.parse(line.slice(6));

            switch (event.type) {
              case 'phase_start':
                setActivePhase(event.phase as PipelinePhase);
                break;
              case 'phase_complete':
                setActivePhase(null);
                setCompletedPhases((current) => {
                  const next = new Set(current);
                  next.add(event.phase as PipelinePhase);
                  return next;
                });
                break;
              case 'phase_output':
                if (event.phase && event.content) {
                  setPhaseOutputs((current) => ({
                    ...current,
                    [event.phase]: event.content,
                  }));
                }
                break;
              case 'skill_search_query':
                if (event.query) {
                  setSearchQueries((current) => [...current, event.query]);
                }
                break;
              case 'skill_match':
                setSkills((current) => [
                  ...current,
                  {
                    name: event.skillName,
                    source: 'github',
                    sourceUrl: event.sourceUrl,
                    repoStars: event.repoStars,
                    score: event.score,
                  },
                ]);
                break;
              case 'skill_generated':
                setSkills((current) => [
                  ...current,
                  {
                    name: event.skillName,
                    source: 'generated',
                    score: 100,
                  },
                ]);
                break;
              case 'eval_scores':
                setEvalScores(event.scores);
                break;
              case 'agent_output':
                setAgentOutput(event.agentOutput);
                setTotalTokens(event.totalTokens || 0);
                break;
              case 'error':
                setError(event.error || 'Generation failed.');
                break;
              default:
                break;
            }
          } catch {
            continue;
          }
        }
      }
    } catch (generationError) {
      setError(
        generationError instanceof Error
          ? generationError.message
          : 'Generation failed.'
      );
    } finally {
      setRunning(false);
      readerRef.current = null;
    }
  }, [model, prompt, running]);

  const showPipeline = running || completedPhases.size > 0;

  return (
    <div className="hero-bg" style={{ minHeight: '100vh' }}>
      <div className="page-container">
        <div style={{ textAlign: 'center', paddingTop: 24, paddingBottom: 48 }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '6px 16px',
              borderRadius: 999,
              marginBottom: 24,
              background: 'rgba(99,102,241,0.1)',
              border: '1px solid rgba(99,102,241,0.2)',
            }}
          >
            <Sparkles size={13} color="#6366f1" />
            <span style={{ fontSize: 13, fontWeight: 600, color: '#6366f1' }}>
              Production-ready agent prompt generation
            </span>
          </div>

          <h1
            style={{
              fontSize: 52,
              fontWeight: 800,
              lineHeight: 1.1,
              letterSpacing: '-1.5px',
              marginBottom: 20,
            }}
          >
            Build AI agents that
            <br />
            <span className="gradient-text">actually reason</span>
          </h1>

          <p
            style={{
              fontSize: 18,
              color: 'var(--text-secondary)',
              maxWidth: 560,
              margin: '0 auto 12px',
            }}
          >
            Describe any agent. Get a production-ready prompt with cognitive
            architecture, GitHub skill discovery, and quality gate scoring.
          </p>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 16,
              marginTop: 16,
              flexWrap: 'wrap',
            }}
          >
            {['GPT-5.4', 'Gemini 3.1 Pro', 'Claude Opus 4.6'].map((entry) => (
              <span
                key={entry}
                style={{
                  fontSize: 12,
                  color: 'var(--text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                <span
                  style={{
                    width: 6,
                    height: 6,
                    background: '#10b981',
                    borderRadius: '50%',
                    display: 'inline-block',
                  }}
                />
                {entry}
              </span>
            ))}
          </div>
        </div>

        <div className="card" style={{ maxWidth: 820, margin: '0 auto' }}>
          <div style={{ marginBottom: 24 }}>
            <label
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: 'var(--text-secondary)',
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                display: 'block',
                marginBottom: 10,
              }}
            >
              Describe your agent
            </label>
            <textarea
              id="prompt-input"
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              placeholder="e.g. SEO audit agent for B2B SaaS homepages"
              rows={3}
              style={{
                width: '100%',
                padding: '14px 16px',
                background: 'var(--bg-primary)',
                border: '1px solid var(--border)',
                borderRadius: 10,
                color: 'var(--text-primary)',
                fontSize: 15,
                fontFamily: 'Outfit, system-ui, sans-serif',
                resize: 'vertical',
                outline: 'none',
                transition: 'border-color 200ms',
                lineHeight: 1.6,
              }}
              onFocus={(event) => {
                event.target.style.borderColor = '#6366f1';
              }}
              onBlur={(event) => {
                event.target.style.borderColor = 'var(--border)';
              }}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
                  void handleGenerate();
                }
              }}
            />

            <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
              {EXAMPLE_PROMPTS.map((example) => (
                <button
                  key={example}
                  type="button"
                  onClick={() => setPrompt(example)}
                  style={{
                    padding: '4px 12px',
                    borderRadius: 20,
                    fontSize: 12,
                    cursor: 'pointer',
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    color: 'var(--text-muted)',
                    fontFamily: 'inherit',
                    transition: 'all 200ms',
                  }}
                  onMouseEnter={(event) => {
                    event.currentTarget.style.color = 'var(--text-primary)';
                    event.currentTarget.style.borderColor = '#6366f1';
                  }}
                  onMouseLeave={(event) => {
                    event.currentTarget.style.color = 'var(--text-muted)';
                    event.currentTarget.style.borderColor = 'var(--border)';
                  }}
                >
                  {example}
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: 24 }}>
            <ModelSelector selected={model} onChange={setModel} />
          </div>

          {error ? (
            <div
              style={{
                display: 'flex',
                gap: 10,
                padding: 14,
                borderRadius: 10,
                marginBottom: 20,
                background: 'rgba(239,68,68,0.08)',
                border: '1px solid rgba(239,68,68,0.2)',
              }}
            >
              <AlertCircle size={16} color="#ef4444" style={{ flexShrink: 0, marginTop: 2 }} />
              <span style={{ fontSize: 14, color: '#ef4444' }}>{error}</span>
            </div>
          ) : null}

          <button
            id="generate-btn"
            type="button"
            className="btn-primary"
            onClick={() => void handleGenerate()}
            disabled={running || !prompt.trim()}
            style={{
              width: '100%',
              justifyContent: 'center',
              padding: '14px 24px',
              fontSize: 16,
            }}
          >
            {running ? (
              <>
                <div className="spinner" />
                Generating agent...
              </>
            ) : (
              <>
                <Cpu size={18} />
                Generate Agent Prompt
              </>
            )}
          </button>
          <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>
            Use Ctrl/Cmd + Enter to generate. Your model API key stays in your browser.
          </p>
        </div>

        {showPipeline ? (
          <div style={{ maxWidth: 820, margin: '32px auto 0' }}>
            <div className="card" style={{ marginBottom: 24 }}>
              <PipelineProgress activePhase={activePhase} completedPhases={completedPhases} />
            </div>

            {searchQueries.length || skills.length ? (
              <div className="card" style={{ marginBottom: 16 }}>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: 'var(--text-primary)',
                    marginBottom: 12,
                  }}
                >
                  GitHub Skill Search
                </div>

                {searchQueries.length ? (
                  <div style={{ marginBottom: 10 }}>
                    <div
                      style={{
                        fontSize: 11,
                        color: 'var(--text-muted)',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        marginBottom: 6,
                      }}
                    >
                      Queries
                    </div>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {searchQueries.map((query) => (
                        <span
                          key={query}
                          style={{
                            fontSize: 12,
                            padding: '3px 10px',
                            borderRadius: 6,
                            background: 'rgba(99,102,241,0.1)',
                            color: '#a5b4fc',
                            border: '1px solid rgba(99,102,241,0.2)',
                          }}
                        >
                          {query}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : null}

                {skills.length ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div
                      style={{
                        fontSize: 11,
                        color: 'var(--text-muted)',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                      }}
                    >
                      Resolved Skills
                    </div>

                    {skills.map((skill, index) => (
                      <div
                        key={`${skill.name}-${index}`}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 10,
                          padding: '8px 12px',
                          borderRadius: 8,
                          background: 'var(--bg-primary)',
                          border: '1px solid var(--border)',
                        }}
                      >
                        <div
                          style={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            background: skill.source === 'github' ? '#10b981' : '#6366f1',
                          }}
                        />
                        <div style={{ flex: 1 }}>
                          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                            {skill.name}
                          </span>
                          {skill.source === 'github' && skill.sourceUrl ? (
                            <a
                              href={skill.sourceUrl}
                              target="_blank"
                              rel="noreferrer"
                              style={{
                                fontSize: 11,
                                color: '#6366f1',
                                marginLeft: 8,
                                textDecoration: 'none',
                              }}
                            >
                              Source
                            </a>
                          ) : null}
                          {skill.repoStars ? (
                            <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 6 }}>
                              {skill.repoStars.toLocaleString()} stars
                            </span>
                          ) : null}
                        </div>

                        <span
                          style={{
                            fontSize: 11,
                            padding: '2px 8px',
                            borderRadius: 4,
                            fontWeight: 700,
                            background:
                              skill.source === 'github'
                                ? 'rgba(16,185,129,0.1)'
                                : 'rgba(99,102,241,0.1)',
                            color: skill.source === 'github' ? '#10b981' : '#a5b4fc',
                            border:
                              skill.source === 'github'
                                ? '1px solid rgba(16,185,129,0.2)'
                                : '1px solid rgba(99,102,241,0.2)',
                          }}
                        >
                          {skill.source === 'github' ? `${skill.score || 0}% match` : 'Generated'}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            ) : null}

            {phaseOutputs.enrich ? (
              <PhaseCard title="Phase 1a - Enriched Brief" phase="enrich" content={phaseOutputs.enrich} />
            ) : null}
            {phaseOutputs.architect ? (
              <PhaseCard title="Phase 1b - Base Agent Prompt" phase="architect" content={phaseOutputs.architect} />
            ) : null}
            {phaseOutputs.integrate ? (
              <PhaseCard
                title="Phase 3 - Final Integrated Prompt"
                phase="integrate"
                content={phaseOutputs.integrate}
                defaultOpen
              />
            ) : null}

            {evalScores ? <EvalScorecard scores={evalScores} /> : null}

            {agentOutput ? (
              <>
                {totalTokens > 0 ? (
                  <div
                    style={{
                      textAlign: 'right',
                      fontSize: 12,
                      color: 'var(--text-muted)',
                      marginTop: 8,
                      marginBottom: 4,
                    }}
                  >
                    Total tokens used:{' '}
                    <strong style={{ color: 'var(--text-secondary)' }}>
                      {totalTokens.toLocaleString()}
                    </strong>
                  </div>
                ) : null}
                <AgentOutput content={agentOutput} agentName={prompt.slice(0, 40)} />
              </>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
