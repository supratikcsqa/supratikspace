'use client';

import { useEffect, useState } from 'react';
import { BarChart2, Cpu, Zap, Star } from 'lucide-react';
import { withBasePath } from '../../../lib/paths';
import { MODELS } from '../../../lib/models';

interface StatsData {
    totalGenerations: number;
    totalTokens: number;
    avgScore: number;
    byModel: Record<string, { count: number; tokens: number }>;
}

export default function StatsPage() {
    const [stats, setStats] = useState<StatsData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(withBasePath('/api/stats'))
            .then((r) => r.json())
            .then((d) => { setStats(d); setLoading(false); })
            .catch(() => setLoading(false));
    }, []);

    const maxCount = stats ? Math.max(...Object.values(stats.byModel).map((m) => m.count), 1) : 1;

    return (
        <div className="page-container" style={{ maxWidth: 880 }}>
            <div style={{ marginBottom: 32 }}>
                <h1 style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-0.5px', marginBottom: 8 }}>Usage Analytics</h1>
                <p style={{ color: 'var(--text-secondary)' }}>Real-time stats from Supabase.</p>
            </div>

            {loading && (
                <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>
                    <div className="spinner" style={{ margin: '0 auto 16px', width: 24, height: 24 }} />
                    Loading stats...
                </div>
            )}

            {stats && (
                <>
                    {/* KPI cards */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}>
                        {[
                            { icon: Cpu, label: 'Total Agents Generated', value: stats.totalGenerations.toLocaleString(), color: '#6366f1' },
                            { icon: Zap, label: 'Total Tokens Consumed', value: stats.totalTokens.toLocaleString(), color: '#f59e0b' },
                            { icon: Star, label: 'Avg. Eval Score', value: `${stats.avgScore}/100`, color: '#10b981' },
                        ].map(({ icon: Icon, label, value, color }) => (
                            <div key={label} className="card" style={{ textAlign: 'center' }}>
                                <div style={{ width: 40, height: 40, borderRadius: 10, background: `rgba(${color === '#6366f1' ? '99,102,241' : color === '#f59e0b' ? '245,158,11' : '16,185,129'}, 0.12)`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                                    <Icon size={20} color={color} />
                                </div>
                                <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>{value}</div>
                                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>{label}</div>
                            </div>
                        ))}
                    </div>

                    {/* Per-model breakdown */}
                    <div className="card">
                        <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                            <BarChart2 size={16} color="#6366f1" /> Usage by Model
                        </h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            {MODELS.map((model) => {
                                const data = stats.byModel[model.id];
                                if (!data) return null;
                                const pct = Math.round((data.count / maxCount) * 100);
                                return (
                                    <div key={model.id}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                <div style={{ width: 8, height: 8, borderRadius: '50%', background: model.color }} />
                                                <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{model.name}</span>
                                            </div>
                                            <div style={{ textAlign: 'right' }}>
                                                <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>{data.count}</span>
                                                <span style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 6 }}>runs · {data.tokens.toLocaleString()} tokens</span>
                                            </div>
                                        </div>
                                        <div className="score-bar-track">
                                            <div className="score-bar-fill" style={{ width: `${pct}%`, background: model.color }} />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
