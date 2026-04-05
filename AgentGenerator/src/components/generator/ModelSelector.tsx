'use client';

import { MODELS, type ModelId } from '../../../lib/models';

interface ModelSelectorProps {
    selected: ModelId;
    onChange: (model: ModelId) => void;
}

const PROVIDER_COLORS: Record<string, string> = {
    openai: '#10a37f',
    google: '#4285f4',
    anthropic: '#d97757',
};

const PROVIDER_LABELS: Record<string, string> = {
    openai: 'OpenAI',
    google: 'Google',
    anthropic: 'Anthropic',
};

export function ModelSelector({ selected, onChange }: ModelSelectorProps) {
    const grouped: Record<string, typeof MODELS[number][]> = {};
    for (const m of MODELS) {
        if (!grouped[m.provider]) grouped[m.provider] = [];
        grouped[m.provider].push(m as typeof MODELS[number]);
    }

    return (
        <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', letterSpacing: '0.05em', textTransform: 'uppercase', display: 'block', marginBottom: 12 }}>
                Select Model
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {Object.entries(grouped).map(([provider, models]) => (
                    <div key={provider}>
                        <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6, paddingLeft: 2 }}>
                            {PROVIDER_LABELS[provider]}
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                            {models.map((model) => {
                                const isSelected = model.id === selected;
                                const color = PROVIDER_COLORS[provider];
                                return (
                                    <button
                                        key={model.id}
                                        onClick={() => onChange(model.id as ModelId)}
                                        style={{
                                            display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
                                            padding: '10px 14px', borderRadius: 10, cursor: 'pointer',
                                            fontFamily: 'inherit', textAlign: 'left', minWidth: 160,
                                            border: isSelected ? `1.5px solid ${color}` : '1px solid var(--border)',
                                            background: isSelected ? `rgba(${hexToRgb(color)}, 0.1)` : 'var(--surface)',
                                            transition: 'all 200ms',
                                            boxShadow: isSelected ? `0 0 16px rgba(${hexToRgb(color)}, 0.2)` : 'none',
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                                            <div style={{ width: 8, height: 8, borderRadius: '50%', background: color }} />
                                            <span style={{ fontSize: 14, fontWeight: 600, color: isSelected ? color : 'var(--text-primary)' }}>
                                                {model.name}
                                            </span>
                                        </div>
                                        <span style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.4 }}>
                                            {model.description}
                                        </span>
                                        <span style={{
                                            marginTop: 6, fontSize: 11, fontWeight: 600,
                                            color: getCostColor(model.costTier),
                                            background: `rgba(${hexToRgb(getCostColor(model.costTier))}, 0.1)`,
                                            padding: '1px 6px', borderRadius: 4,
                                        }}>
                                            {model.costTier}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function getCostColor(tier: string) {
    if (tier.length <= 1) return '#10b981';
    if (tier.length === 2) return '#3b82f6';
    if (tier.length === 3) return '#f59e0b';
    return '#ef4444';
}

function hexToRgb(hex: string) {
    const clean = hex.replace('#', '');
    const r = parseInt(clean.slice(0, 2), 16);
    const g = parseInt(clean.slice(2, 4), 16);
    const b = parseInt(clean.slice(4, 6), 16);
    return `${r},${g},${b}`;
}
