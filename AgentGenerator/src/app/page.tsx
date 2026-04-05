'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Cpu, Sparkles, AlertCircle } from 'lucide-react';
import { ModelSelector } from '../components/generator/ModelSelector';
import { PipelineProgress, type PipelinePhase } from '../components/generator/PipelineProgress';
import { PhaseCard } from '../components/generator/PhaseCard';
import { EvalScorecard } from '../components/generator/EvalScorecard';
import { AgentOutput } from '../components/generator/AgentOutput';
import { withBasePath } from '../../lib/paths';
import type { ModelId } from '../../lib/models';

const EXAMPLE_PROMPTS = [
  'SEO content strategist agent for SaaS companies',
  'Instagram Reels script writer for e-commerce brands',
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

export default function HomePage() {
  const [prompt, setPrompt] = useState('');
  const [model, setModel] = useState<ModelId>('gpt-4o');
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Pipeline state
  const [activePhase, setActivePhase] = useState<PipelinePhase | null>(null);
  const [completedPhases, setCompletedPhases] = useState<Set<PipelinePhase>>(new Set());
  const [phaseOutputs, setPhaseOutputs] = useState<Partial<PhaseOutput>>({});
  const [skills, setSkills] = useState<SkillEvent[]>([]);
  const [searchQueries, setSearchQueries] = useState<string[]>([]);
  const [evalScores, setEvalScores] = useState<EvalScores | null>(null);
  const [agentOutput, setAgentOutput] = useState<string | null>(null);
  const [totalTokens, setTotalTokens] = useState(0);

  const readerRef = useRef<ReadableStreamDefaultReader | null>(null);

  function getApiKeyForModel(modelId: ModelId): string {
    if (modelId.startsWith('gpt')) return localStorage.getItem('apikey_openai') ?? '';
    if (modelId.startsWith('gemini')) return localStorage.getItem('apikey_google') ?? '';
    if (modelId.startsWith('claude')) return localStorage.getItem('apikey_anthropic') ?? '';
    return '';
  }

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
    if (!prompt.trim() || running) return;
    const apiKey = getApiKeyForModel(model);
    if (!apiKey) {
      setError(`No API key configured for this model. Click "API Keys" in the top nav to add one.`);
      return;
    }

    reset();
    setRunning(true);

    try {
      const resp = await fetch(withBasePath('/api/generate'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey },
        body: JSON.stringify({ prompt, model }),
      });

      if (!resp.ok || !resp.body) {
        const err = await resp.json().catch(() => ({ error: 'Unknown error' }));
        setError(err.error ?? 'Generation failed');
        setRunning(false);
        return;
      }

      const reader = resp.body.getReader();
      readerRef.current = reader;
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          try {
            const event = JSON.parse(line.slice(6));

            switch (event.type) {
              case 'phase_start':
                setActivePhase(event.phase as PipelinePhase);
                break;
              case 'phase_complete':
                setActivePhase(null);
                setCompletedPhases((prev) => new Set([...prev, event.phase as PipelinePhase]));
                break;
              case 'phase_output':
                if (event.phase && event.content) {
                  setPhaseOutputs((prev) => ({ ...prev, [event.phase]: event.content }));
                }
                break;
              case 'skill_search_query':
                setSearchQueries((prev) => [...prev, event.query]);
                break;
              case 'skill_match':
                setSkills((prev) => [...prev, { name: event.skillName, source: 'github', sourceUrl: event.sourceUrl, repoStars: event.repoStars, score: event.score }]);
                break;
              case 'skill_generated':
                setSkills((prev) => [...prev, { name: event.skillName, source: 'generated', score: 100 }]);
                break;
              case 'eval_scores':
                setEvalScores(event.scores);
                break;
              case 'agent_output':
                setAgentOutput(event.agentOutput);
                setTotalTokens(event.totalTokens ?? 0);
                break;
              case 'done':
                setRunning(false);
                break;
              case 'error':
                setError(event.error);
                setRunning(false);
                break;
            }
          } catch {
            // malformed line, skip
          }
        }
      }
    } catch (err) {
      setError((err as Error).message);
      setRunning(false);
    }
  }, [prompt, model, running]);

  const showPipeline = running || (completedPhases.size > 0);

  return (
    <div className="hero-bg" style={{ minHeight: '100vh' }}>
      <div className="page-container">

        {/* Hero */}
        <div style={{ textAlign: 'center', paddingTop: 24, paddingBottom: 48 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '6px 16px', borderRadius: 999, marginBottom: 24,
            background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)',
          }}>
            <Sparkles size={13} color="#6366f1" />
            <span style={{ fontSize: 13, fontWeight: 600, color: '#6366f1' }}>
              Production-Grade Agent Generator
            </span>
          </div>

          <h1 style={{ fontSize: 52, fontWeight: 800, lineHeight: 1.1, letterSpacing: '-1.5px', marginBottom: 20 }}>
            Build AI Agents that<br />
            <span className="gradient-text">Actually Reason</span>
          </h1>

          <p style={{ fontSize: 18, color: 'var(--text-secondary)', maxWidth: 560, margin: '0 auto 12px' }}>
            Describe any agent. Get a production-ready prompt with cognitive architecture,
            skill discovery from GitHub, and quality gate scoring — identical to the IDE workflow.
          </p>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, marginTop: 16, flexWrap: 'wrap' }}>
            {['GPT-5.4', 'Gemini 3.1 Pro', 'Claude Opus 4.6'].map((m) => (
              <span key={m} style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 6, height: 6, background: '#10b981', borderRadius: '50%', display: 'inline-block' }} />
                {m}
              </span>
            ))}
          </div>
        </div>

        {/* Generator Card */}
        <div className="card" style={{ maxWidth: 820, margin: '0 auto' }}>

          {/* Prompt Input */}
          <div style={{ marginBottom: 24 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', letterSpacing: '0.05em', textTransform: 'uppercase', display: 'block', marginBottom: 10 }}>
              Describe your agent
            </label>
            <textarea
              id="prompt-input"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. SEO content strategist agent for SaaS companies"
              rows={3}
              style={{
                width: '100%', padding: '14px 16px',
                background: 'var(--bg-primary)', border: '1px solid var(--border)',
                borderRadius: 10, color: 'var(--text-primary)', fontSize: 15,
                fontFamily: 'Inter, sans-serif', resize: 'vertical', outline: 'none',
                transition: 'border-color 200ms', lineHeight: 1.6,
              }}
              onFocus={(e) => { e.target.style.borderColor = '#6366f1'; }}
              onBlur={(e) => { e.target.style.borderColor = 'var(--border)'; }}
              onKeyDown={(e) => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleGenerate(); }}
            />
            {/* Example chips */}
            <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
              {EXAMPLE_PROMPTS.map((ex) => (
                <button
                  key={ex}
                  onClick={() => setPrompt(ex)}
                  style={{
                    padding: '4px 12px', borderRadius: 20, fontSize: 12, cursor: 'pointer',
                    background: 'var(--surface)', border: '1px solid var(--border)',
                    color: 'var(--text-muted)', fontFamily: 'inherit', transition: 'all 200ms',
                  }}
                  onMouseEnter={(e) => { (e.target as HTMLElement).style.color = 'var(--text-primary)'; (e.target as HTMLElement).style.borderColor = '#6366f1'; }}
                  onMouseLeave={(e) => { (e.target as HTMLElement).style.color = 'var(--text-muted)'; (e.target as HTMLElement).style.borderColor = 'var(--border)'; }}
                >
                  {ex}
                </button>
              ))}
            </div>
          </div>

          {/* Model selector */}
          <div style={{ marginBottom: 24 }}>
            <ModelSelector selected={model} onChange={setModel} />
          </div>

          {/* Error */}
          {error && (
            <div style={{
              display: 'flex', gap: 10, padding: 14, borderRadius: 10, marginBottom: 20,
              background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
            }}>
              <AlertCircle size={16} color="#ef4444" style={{ flexShrink: 0, marginTop: 2 }} />
              <span style={{ fontSize: 14, color: '#ef4444' }}>{error}</span>
            </div>
          )}

          {/* Generate button */}
          <button
            id="generate-btn"
            className="btn-primary"
            onClick={handleGenerate}
            disabled={running || !prompt.trim()}
            style={{ width: '100%', justifyContent: 'center', padding: '14px 24px', fontSize: 16 }}
          >
            {running ? (
              <>
                <div className="spinner" />
                Generating Agent...
              </>
            ) : (
              <>
                <Cpu size={18} />
                Generate Agent Prompt
              </>
            )}
          </button>
          <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>
            ⌘ + Enter to generate · Your API key never leaves your browser
          </p>
        </div>

        {/* Pipeline Output */}
        {showPipeline && (
          <div style={{ maxWidth: 820, margin: '32px auto 0' }}>
            {/* Progress stepper */}
            <div className="card" style={{ marginBottom: 24 }}>
              <PipelineProgress activePhase={activePhase} completedPhases={completedPhases} />
            </div>

            {/* Skill discovery info */}
            {(searchQueries.length > 0 || skills.length > 0) && (
              <div className="card" style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12 }}>
                  🔍 GitHub Skill Search
                </div>
                {searchQueries.length > 0 && (
                  <div style={{ marginBottom: 10 }}>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', marginBottom: 6 }}>Queries</div>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {searchQueries.map((q) => (
                        <span key={q} style={{ fontSize: 12, padding: '3px 10px', borderRadius: 6, background: 'rgba(99,102,241,0.1)', color: '#a5b4fc', border: '1px solid rgba(99,102,241,0.2)' }}>
                          {q}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {skills.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Resolved Skills</div>
                    {skills.map((s, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', borderRadius: 8, background: 'var(--bg-primary)', border: '1px solid var(--border)' }}>
                        <span style={{ fontSize: 14 }}>{s.source === 'github' ? '⭐' : '🔧'}</span>
                        <div style={{ flex: 1 }}>
                          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{s.name}</span>
                          {s.source === 'github' && s.sourceUrl && (
                            <a href={s.sourceUrl} target="_blank" rel="noopener noreferrer"
                              style={{ fontSize: 11, color: '#6366f1', marginLeft: 8, textDecoration: 'none' }}>
                              GitHub ↗
                            </a>
                          )}
                          {s.repoStars && (
                            <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 6 }}>⭐ {s.repoStars.toLocaleString()}</span>
                          )}
                        </div>
                        <span style={{
                          fontSize: 11, padding: '2px 8px', borderRadius: 4, fontWeight: 700,
                          background: s.source === 'github' ? 'rgba(16,185,129,0.1)' : 'rgba(99,102,241,0.1)',
                          color: s.source === 'github' ? '#10b981' : '#a5b4fc',
                          border: `1px solid ${s.source === 'github' ? 'rgba(16,185,129,0.2)' : 'rgba(99,102,241,0.2)'}`,
                        }}>
                          {s.source === 'github' ? `${s.score}% match` : 'Generated'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Phase output cards */}
            {phaseOutputs.enrich && (
              <PhaseCard title="Phase 1a — Enriched Brief" phase="enrich" content={phaseOutputs.enrich} />
            )}
            {phaseOutputs.architect && (
              <PhaseCard title="Phase 1b — Base Agent Prompt" phase="architect" content={phaseOutputs.architect} />
            )}
            {phaseOutputs.integrate && (
              <PhaseCard title="Phase 3 — Final Integrated Prompt" phase="integrate" content={phaseOutputs.integrate} defaultOpen />
            )}

            {/* Eval scores */}
            {evalScores && <EvalScorecard scores={evalScores} />}

            {/* Final output */}
            {agentOutput && (
              <>
                {totalTokens > 0 && (
                  <div style={{ textAlign: 'right', fontSize: 12, color: 'var(--text-muted)', marginTop: 8, marginBottom: 4 }}>
                    Total tokens used: <strong style={{ color: 'var(--text-secondary)' }}>{totalTokens.toLocaleString()}</strong>
                  </div>
                )}
                <AgentOutput content={agentOutput} agentName={prompt.slice(0, 40)} />
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
