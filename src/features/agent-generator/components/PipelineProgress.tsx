import type { ElementType } from 'react';
import { Award, Brain, Check, Loader2, Search, Zap } from 'lucide-react';

export type PipelinePhase = 'enrich' | 'architect' | 'skills' | 'integrate';

interface PhaseInfo {
  id: PipelinePhase;
  label: string;
  description: string;
  icon: ElementType;
}

interface PipelineProgressProps {
  activePhase: PipelinePhase | null;
  completedPhases: Set<PipelinePhase>;
}

const PHASES: PhaseInfo[] = [
  { id: 'enrich', label: 'Enrich', description: 'Signal densifying your idea', icon: Zap },
  { id: 'architect', label: 'Architect', description: 'Building the base prompt', icon: Brain },
  { id: 'skills', label: 'Skills', description: 'Resolving GitHub skill matches', icon: Search },
  { id: 'integrate', label: 'Integrate', description: 'Injecting skills and scoring quality', icon: Award },
];

export function PipelineProgress({
  activePhase,
  completedPhases,
}: PipelineProgressProps) {
  return (
    <div style={{ padding: '20px 0' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
        {PHASES.map((phase, index) => {
          const isDone = completedPhases.has(phase.id);
          const isActive = activePhase === phase.id;
          const Icon = phase.icon;

          return (
            <div key={phase.id} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
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
                    animation: isActive ? 'agents-pulse-glow 2s infinite' : 'none',
                    flexShrink: 0,
                  }}
                >
                  {isDone ? (
                    <Check size={18} color="#10b981" />
                  ) : isActive ? (
                    <Loader2 size={18} color="#6366f1" style={{ animation: 'agents-spin 0.8s linear infinite' }} />
                  ) : (
                    <Icon size={16} color="var(--text-muted)" />
                  )}
                </div>

                <div style={{ marginTop: 8, textAlign: 'center' }}>
                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: isDone ? '#10b981' : isActive ? '#6366f1' : 'var(--text-muted)',
                    }}
                  >
                    {phase.label}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2, lineHeight: 1.3 }}>
                    {phase.description}
                  </div>
                </div>
              </div>

              {index < PHASES.length - 1 ? (
                <div
                  style={{
                    flex: 1,
                    height: 2,
                    marginBottom: 28,
                    background:
                      completedPhases.has(PHASES[index + 1].id) || completedPhases.has(phase.id)
                        ? 'linear-gradient(90deg, #10b981, #6366f1)'
                        : 'var(--border)',
                    transition: 'background 600ms',
                  }}
                />
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
