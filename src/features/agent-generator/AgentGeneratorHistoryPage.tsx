import { useEffect, useState } from 'react';
import { ChevronDown, ChevronUp, Clock, Cpu, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Generation {
  id: string;
  created_at: string;
  user_prompt: string;
  model_used: string;
  tokens_consumed: number;
  skills_selected: string[];
  eval_scores: { overall: number } | null;
}

const MODEL_COLORS: Record<string, string> = {
  'gpt-4o': '#10a37f',
  'gpt-5.4': '#10a37f',
  'gemini-3.1-pro-preview': '#4285f4',
  'claude-sonnet-4-6': '#d97757',
  'claude-opus-4-6': '#d97757',
};

function ScoreBadge({ score }: { score: number }) {
  const color =
    score >= 90 ? '#10b981' : score >= 75 ? '#6366f1' : score >= 60 ? '#f59e0b' : '#ef4444';

  return (
    <span
      style={{
        fontSize: 12,
        fontWeight: 700,
        padding: '2px 8px',
        borderRadius: 6,
        background:
          color === '#10b981'
            ? 'rgba(16,185,129,0.1)'
            : color === '#6366f1'
              ? 'rgba(99,102,241,0.1)'
              : color === '#f59e0b'
                ? 'rgba(245,158,11,0.1)'
                : 'rgba(239,68,68,0.1)',
        color,
      }}
    >
      {score}/100
    </span>
  );
}

function GenerationCard({ generation }: { generation: Generation }) {
  const [expanded, setExpanded] = useState(false);
  const color = MODEL_COLORS[generation.model_used] || '#6366f1';

  return (
    <div className="card" style={{ marginBottom: 12 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 8,
            background:
              color === '#10a37f'
                ? 'rgba(16,163,127,0.15)'
                : color === '#4285f4'
                  ? 'rgba(66,133,244,0.15)'
                  : 'rgba(217,119,87,0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Cpu size={16} color={color} />
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginBottom: 4,
              flexWrap: 'wrap',
            }}
          >
            <span
              style={{
                fontSize: 14,
                fontWeight: 600,
                color: 'var(--text-primary)',
                flex: 1,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {generation.user_prompt}
            </span>
            {generation.eval_scores ? <ScoreBadge score={generation.eval_scores.overall} /> : null}
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              flexWrap: 'wrap',
            }}
          >
            <span style={{ fontSize: 12, color, fontWeight: 500 }}>{generation.model_used}</span>
            <span
              style={{
                fontSize: 12,
                color: 'var(--text-muted)',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <Zap size={11} /> {generation.tokens_consumed.toLocaleString()} tokens
            </span>
            <span
              style={{
                fontSize: 12,
                color: 'var(--text-muted)',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <Clock size={11} /> {new Date(generation.created_at).toLocaleDateString()}
            </span>
          </div>

          {generation.skills_selected?.length ? (
            <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
              {generation.skills_selected.map((skill) => (
                <span
                  key={skill}
                  style={{
                    fontSize: 11,
                    padding: '2px 8px',
                    borderRadius: 4,
                    background: 'rgba(99,102,241,0.08)',
                    color: '#a5b4fc',
                    border: '1px solid rgba(99,102,241,0.15)',
                  }}
                >
                  {skill}
                </span>
              ))}
            </div>
          ) : null}

          {expanded ? (
            <div style={{ marginTop: 12, fontSize: 12, color: 'var(--text-muted)' }}>
              Persisted record from the Agent Generator pipeline.
            </div>
          ) : null}
        </div>

        <button
          type="button"
          onClick={() => setExpanded((current) => !current)}
          className="btn-ghost"
          style={{ padding: '6px 8px', flexShrink: 0 }}
        >
          {expanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
        </button>
      </div>
    </div>
  );
}

export default function AgentGeneratorHistoryPage() {
  const [generations, setGenerations] = useState<Generation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/agents/history')
      .then(async (response) => {
        const payload = await response.json();

        if (!response.ok) {
          throw new Error(payload?.error || 'History could not be loaded.');
        }

        setGenerations(payload.data || []);
        setLoading(false);
      })
      .catch((loadError) => {
        setError(loadError instanceof Error ? loadError.message : 'History could not be loaded.');
        setLoading(false);
      });
  }, []);

  return (
    <div className="page-container">
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-0.5px', marginBottom: 8 }}>
          Generation History
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Recent generations stored by the hosted pipeline when Supabase persistence is configured.
        </p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>
          <div className="spinner" style={{ margin: '0 auto 16px', width: 24, height: 24 }} />
          Loading history...
        </div>
      ) : null}

      {error ? <p style={{ color: '#ef4444' }}>Error: {error}</p> : null}

      {!loading && !error && generations.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 80, color: 'var(--text-muted)' }}>
          <Cpu size={40} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
          <p>
            No stored generations yet.{' '}
            <Link to="/agents" style={{ color: '#6366f1' }}>
              Create the first one
            </Link>
            .
          </p>
        </div>
      ) : null}

      {generations.map((generation) => (
        <GenerationCard key={generation.id} generation={generation} />
      ))}
    </div>
  );
}
