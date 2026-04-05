'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Clock, Cpu, Zap, ChevronDown, ChevronUp } from 'lucide-react';
import { withBasePath } from '../../../lib/paths';

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
    const color = score >= 90 ? '#10b981' : score >= 75 ? '#6366f1' : score >= 60 ? '#f59e0b' : '#ef4444';
    return (
        <span
            style={{
                fontSize: 12,
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: 6,
                background: `rgba(${color === '#10b981' ? '16,185,129' : color === '#6366f1' ? '99,102,241' : color === '#f59e0b' ? '245,158,11' : '239,68,68'}, 0.1)`,
                color,
            }}
        >
            {score}/100
        </span>
    );
}

function GenerationCard({ gen }: { gen: Generation }) {
    const [expanded, setExpanded] = useState(false);
    const color = MODEL_COLORS[gen.model_used] ?? '#6366f1';

    return (
        <div className="card" style={{ marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                <div
                    style={{
                        width: 36,
                        height: 36,
                        borderRadius: 8,
                        background: `rgba(${color === '#10a37f' ? '16,163,127' : color === '#4285f4' ? '66,133,244' : '217,119,87'}, 0.15)`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                    }}
                >
                    <Cpu size={16} color={color} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
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
                            {gen.user_prompt}
                        </span>
                        {gen.eval_scores && <ScoreBadge score={gen.eval_scores.overall} />}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 12, color, fontWeight: 500 }}>{gen.model_used}</span>
                        <span style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                            <Zap size={11} /> {gen.tokens_consumed.toLocaleString()} tokens
                        </span>
                        <span style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                            <Clock size={11} /> {new Date(gen.created_at).toLocaleDateString()}
                        </span>
                    </div>
                    {gen.skills_selected?.length > 0 && (
                        <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
                            {gen.skills_selected.map((s) => (
                                <span
                                    key={s}
                                    style={{
                                        fontSize: 11,
                                        padding: '2px 8px',
                                        borderRadius: 4,
                                        background: 'rgba(99,102,241,0.08)',
                                        color: '#a5b4fc',
                                        border: '1px solid rgba(99,102,241,0.15)',
                                    }}
                                >
                                    {s}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
                <button onClick={() => setExpanded(!expanded)} className="btn-ghost" style={{ padding: '6px 8px', flexShrink: 0 }}>
                    {expanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                </button>
            </div>
        </div>
    );
}

export default function HistoryPage() {
    const [generations, setGenerations] = useState<Generation[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetch(withBasePath('/api/history'))
            .then((r) => r.json())
            .then((d) => {
                setGenerations(d.data ?? []);
                setLoading(false);
            })
            .catch((e) => {
                setError(e.message);
                setLoading(false);
            });
    }, []);

    return (
        <div className="page-container">
            <div style={{ marginBottom: 32 }}>
                <h1 style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-0.5px', marginBottom: 8 }}>Generation History</h1>
                <p style={{ color: 'var(--text-secondary)' }}>All agents generated, sorted by most recent.</p>
            </div>

            {loading && (
                <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>
                    <div className="spinner" style={{ margin: '0 auto 16px', width: 24, height: 24 }} />
                    Loading history...
                </div>
            )}
            {error && <p style={{ color: '#ef4444' }}>Error: {error}</p>}
            {!loading && !error && generations.length === 0 && (
                <div style={{ textAlign: 'center', padding: 80, color: 'var(--text-muted)' }}>
                    <Cpu size={40} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
                    <p>
                        No agents generated yet.{' '}
                        <Link href="/" style={{ color: '#6366f1' }}>
                            Create your first one
                        </Link>
                    </p>
                </div>
            )}
            {generations.map((g) => (
                <GenerationCard key={g.id} gen={g} />
            ))}
        </div>
    );
}
