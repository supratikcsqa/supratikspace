'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface PhaseCardProps {
    title: string;
    phase: string;
    content: string;
    defaultOpen?: boolean;
}

export function PhaseCard({ title, phase, content, defaultOpen = false }: PhaseCardProps) {
    const [open, setOpen] = useState(defaultOpen);

    const PHASE_COLORS: Record<string, string> = {
        enrich: '#f59e0b',
        architect: '#6366f1',
        skills: '#10b981',
        integrate: '#d97757',
    };

    const color = PHASE_COLORS[phase] ?? '#6366f1';

    return (
        <div className="animate-fade-in" style={{
            border: '1px solid var(--border)', borderRadius: 12,
            overflow: 'hidden', marginBottom: 12,
            transition: 'border-color 200ms',
        }}>
            <button
                onClick={() => setOpen(!open)}
                style={{
                    width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '14px 18px', background: 'var(--surface)', border: 'none',
                    cursor: 'pointer', fontFamily: 'inherit',
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0 }} />
                    <span style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)' }}>{title}</span>
                    <span style={{
                        fontSize: 11, padding: '2px 8px', borderRadius: 4,
                        background: `rgba(255,255,255,0.06)`, color: 'var(--text-muted)',
                    }}>
                        {content.split(' ').slice(0, 3).join(' ')}...
                    </span>
                </div>
                {open ? <ChevronUp size={16} color="var(--text-muted)" /> : <ChevronDown size={16} color="var(--text-muted)" />}
            </button>

            {open && (
                <div style={{
                    padding: '0 18px 18px', background: 'var(--bg-secondary)',
                    borderTop: '1px solid var(--border)',
                }}>
                    <div style={{
                        marginTop: 16, padding: 16, borderRadius: 8,
                        background: 'var(--bg-primary)', border: '1px solid var(--border)',
                        maxHeight: 400, overflowY: 'auto',
                    }}>
                        <pre style={{
                            whiteSpace: 'pre-wrap', wordBreak: 'break-word',
                            fontSize: 13, lineHeight: 1.7, color: 'var(--text-secondary)',
                            fontFamily: 'Inter, sans-serif',
                        }}>
                            {content}
                        </pre>
                    </div>
                </div>
            )}
        </div>
    );
}
