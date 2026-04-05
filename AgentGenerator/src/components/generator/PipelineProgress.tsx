'use client';

import { Check, Loader2, Brain, Zap, Search, Award } from 'lucide-react';

export type PipelinePhase = 'enrich' | 'architect' | 'skills' | 'integrate';

interface PhaseInfo {
    id: PipelinePhase;
    label: string;
    description: string;
    icon: React.ElementType;
}

const PHASES: PhaseInfo[] = [
    { id: 'enrich', label: 'Enrich', description: 'Signal densifying your idea', icon: Zap },
    { id: 'architect', label: 'Architect', description: 'Building cognitive architecture', icon: Brain },
    { id: 'skills', label: 'Skill Discovery', description: 'Resolving required skills', icon: Search },
    { id: 'integrate', label: 'Integrate & Eval', description: 'Injecting skills + quality gate', icon: Award },
];

interface PipelineProgressProps {
    activePhase: PipelinePhase | null;
    completedPhases: Set<PipelinePhase>;
}

export function PipelineProgress({ activePhase, completedPhases }: PipelineProgressProps) {
    return (
        <div style={{ padding: '20px 0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
                {PHASES.map((phase, i) => {
                    const isDone = completedPhases.has(phase.id);
                    const isActive = activePhase === phase.id;
                    const Icon = phase.icon;

                    return (
                        <div key={phase.id} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                                {/* Circle */}
                                <div style={{
                                    width: 40, height: 40, borderRadius: '50%',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    border: isDone
                                        ? '2px solid #10b981'
                                        : isActive
                                            ? '2px solid #6366f1'
                                            : '2px solid var(--border)',
                                    background: isDone
                                        ? 'rgba(16,185,129,0.15)'
                                        : isActive
                                            ? 'rgba(99,102,241,0.15)'
                                            : 'var(--surface)',
                                    transition: 'all 400ms',
                                    animation: isActive ? 'pulse-glow 2s infinite' : 'none',
                                    flexShrink: 0,
                                }}>
                                    {isDone ? (
                                        <Check size={18} color="#10b981" />
                                    ) : isActive ? (
                                        <Loader2 size={18} color="#6366f1" style={{ animation: 'spin 0.8s linear infinite' }} />
                                    ) : (
                                        <Icon size={16} color="var(--text-muted)" />
                                    )}
                                </div>
                                {/* Label */}
                                <div style={{ marginTop: 8, textAlign: 'center' }}>
                                    <div style={{
                                        fontSize: 12, fontWeight: 600,
                                        color: isDone ? '#10b981' : isActive ? '#6366f1' : 'var(--text-muted)',
                                        transition: 'color 300ms',
                                    }}>
                                        {phase.label}
                                    </div>
                                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2, lineHeight: 1.3 }}>
                                        {phase.description}
                                    </div>
                                </div>
                            </div>

                            {/* Connector line */}
                            {i < PHASES.length - 1 && (
                                <div style={{
                                    flex: 1, height: 2, marginBottom: 28,
                                    background: completedPhases.has(PHASES[i + 1].id) || completedPhases.has(phase.id)
                                        ? 'linear-gradient(90deg, #10b981, #6366f1)'
                                        : 'var(--border)',
                                    transition: 'background 600ms',
                                }} />
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
