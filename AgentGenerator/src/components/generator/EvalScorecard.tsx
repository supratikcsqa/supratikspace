'use client';

import { useEffect, useState } from 'react';

interface EvalScores {
    signal_density: number;
    cognitive_arch: number;
    anti_pattern: number;
    skill_precision: number;
    overall: number;
}

interface EvalScorecardProps {
    scores: EvalScores;
}

const DIMENSIONS = [
    { key: 'signal_density', label: 'Signal Density', weight: '2×', description: 'Every sentence adds non-obvious info' },
    { key: 'cognitive_arch', label: 'Cognitive Architecture', weight: '3×', description: 'Has Memory + System 2 + Governance' },
    { key: 'anti_pattern', label: 'Anti-Pattern Depth', weight: '1.5×', description: 'Failures have Trigger + Symptom + Detection' },
    { key: 'skill_precision', label: 'Skill Precision', weight: '2.5×', description: 'Skills explicitly linked with paths and directions' },
] as const;

function getScoreColor(score: number) {
    if (score >= 90) return '#10b981';
    if (score >= 75) return '#6366f1';
    if (score >= 60) return '#f59e0b';
    return '#ef4444';
}

function getOverallLabel(score: number) {
    if (score >= 90) return { label: 'Excellent', color: '#10b981' };
    if (score >= 75) return { label: 'Passing', color: '#6366f1' };
    if (score >= 60) return { label: 'Marginal', color: '#f59e0b' };
    return { label: 'Failed', color: '#ef4444' };
}

export function EvalScorecard({ scores }: EvalScorecardProps) {
    const [animated, setAnimated] = useState(false);

    useEffect(() => {
        const t = setTimeout(() => setAnimated(true), 100);
        return () => clearTimeout(t);
    }, []);

    const { label, color } = getOverallLabel(scores.overall);

    return (
        <div className="card animate-fade-in" style={{ marginTop: 16 }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                <div>
                    <h3 style={{ fontWeight: 700, fontSize: 16, color: 'var(--text-primary)' }}>Quality Gate Evaluation</h3>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>Phase 3 — Weighted composite scoring</p>
                </div>
                {/* Overall score ring */}
                <div style={{ textAlign: 'center' }}>
                    <div style={{
                        width: 64, height: 64, borderRadius: '50%',
                        border: `3px solid ${color}`,
                        display: 'flex', flexDirection: 'column',
                        alignItems: 'center', justifyContent: 'center',
                        background: `rgba(${color === '#10b981' ? '16,185,129' : color === '#6366f1' ? '99,102,241' : color === '#f59e0b' ? '245,158,11' : '239,68,68'}, 0.1)`,
                        boxShadow: `0 0 20px rgba(${color === '#10b981' ? '16,185,129' : '99,102,241'}, 0.2)`,
                    }}>
                        <span style={{ fontSize: 20, fontWeight: 800, color, lineHeight: 1 }}>{scores.overall}</span>
                        <span style={{ fontSize: 9, color: 'var(--text-muted)', fontWeight: 500 }}>/100</span>
                    </div>
                    <div style={{ fontSize: 11, fontWeight: 600, color, marginTop: 4 }}>{label}</div>
                </div>
            </div>

            {/* Dimension rows */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {DIMENSIONS.map(({ key, label, weight, description }) => {
                    const raw = scores[key as keyof typeof scores] as number;
                    const pct = (raw / 10) * 100;
                    const barColor = getScoreColor(pct);

                    return (
                        <div key={key}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
                                <div>
                                    <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{label}</span>
                                    <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 6 }}>weight: {weight}</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'baseline', gap: 3 }}>
                                    <span style={{ fontSize: 18, fontWeight: 700, color: barColor }}>{raw}</span>
                                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>/10</span>
                                </div>
                            </div>
                            <div className="score-bar-track">
                                <div
                                    className="score-bar-fill"
                                    style={{
                                        width: animated ? `${pct}%` : '0%',
                                        background: `linear-gradient(90deg, ${barColor}aa, ${barColor})`,
                                    }}
                                />
                            </div>
                            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 3 }}>{description}</div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
