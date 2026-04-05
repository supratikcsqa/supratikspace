'use client';

import { useState } from 'react';
import { Copy, Download, Check, Terminal, ChevronRight } from 'lucide-react';

interface AgentOutputProps {
    content: string;
    agentName?: string;
}

const IDE_TABS = [
    {
        id: 'antigravity',
        label: 'Antigravity',
        badge: 'AI IDE',
        snippet: (name: string) => `# In the Antigravity chat input, use the @ mention:
@[agent-prompts/${name}-agent-prompt.md] your task here

# Or reference it as context before your request:
@[agent-prompts/${name}-agent-prompt.md]
Build me a landing page for my SaaS product.`,
    },
    {
        id: 'gemini-cli',
        label: 'Gemini CLI',
        badge: 'CLI',
        snippet: (name: string) => `# Option 1 — Environment variable (recommended):
export GEMINI_SYSTEM_MD=/path/to/${name}-agent-prompt.md
gemini "your task here"

# Option 2 — @ inline file injection:
gemini "your task here @./${name}-agent-prompt.md"

# Option 3 — Non-interactive (headless / CI):
gemini -p "your task" --model gemini-3.1-pro-preview`,
    },
    {
        id: 'claude-code',
        label: 'Claude Code',
        badge: 'CLI',
        snippet: (name: string) => `# Option 1 — Load as system prompt file (recommended):
claude --system-prompt-file ./${name}-agent-prompt.md "your task here"

# Option 2 — Append to base system prompt (keeps tools):
claude --append-system-prompt "$(cat ${name}-agent-prompt.md)" "your task"

# Option 3 — Persistent (copy to CLAUDE.md in project root):
cp ${name}-agent-prompt.md ./CLAUDE.md
claude "your task here"   # auto-loaded every session

# Option 4 — Global (applies to all projects):
cp ${name}-agent-prompt.md ~/.claude/CLAUDE.md`,
    },
    {
        id: 'codex',
        label: 'Codex CLI',
        badge: 'CLI',
        snippet: (name: string) => `# Option 1 — Drop skill into .agents/skills/ for auto-discovery:
mkdir -p .agents/skills/${name}
cp ${name}-agent-prompt.md .agents/skills/${name}/SKILL.md
codex exec "your task here"   # agent auto-activates the skill

# Option 2 — Explicit skill invocation in Codex TUI:
codex
> $${name} your task here

# Option 3 — Override model + exec one-shot:
codex exec -m gpt-5.4 --auto-edit "your task here"`,
    },
    {
        id: 'cursor',
        label: 'Cursor',
        badge: 'IDE',
        snippet: (name: string) => `# In Cursor chat, use @ to reference the file:
@${name}-agent-prompt.md your task here

# Or add as a Cursor Rule (persistent across sessions):
# 1. Open Settings → Rules → Add Rule
# 2. Paste contents of ${name}-agent-prompt.md

# Or use .cursorrules file at project root for auto-loading:
cp ${name}-agent-prompt.md .cursorrules`,
    },
];

export function AgentOutput({ content, agentName = 'generated' }: AgentOutputProps) {
    const [copied, setCopied] = useState(false);
    const [activeTab, setActiveTab] = useState('antigravity');

    const kebabName = agentName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');

    const handleCopy = async () => {
        await navigator.clipboard.writeText(content);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleDownload = () => {
        const blob = new Blob([content], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${kebabName}-agent-prompt.md`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="card animate-fade-in" style={{ marginTop: 16 }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h3 style={{ fontWeight: 700, fontSize: 16, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ color: '#10b981' }}>✓</span> Agent Prompt Ready
                </h3>
                <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn-ghost" onClick={handleCopy} style={{ fontSize: 13 }}>
                        {copied ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
                        {copied ? 'Copied!' : 'Copy'}
                    </button>
                    <button className="btn-ghost" onClick={handleDownload} style={{ fontSize: 13 }}>
                        <Download size={14} />
                        Download .md
                    </button>
                </div>
            </div>

            {/* Agent prompt display */}
            <div style={{
                background: 'var(--bg-primary)', border: '1px solid var(--border)',
                borderRadius: 10, padding: 16, maxHeight: 340, overflowY: 'auto', marginBottom: 20,
            }}>
                <pre style={{
                    whiteSpace: 'pre-wrap', wordBreak: 'break-word',
                    fontSize: 12.5, lineHeight: 1.75, color: 'var(--text-secondary)',
                    fontFamily: 'JetBrains Mono, Fira Code, monospace',
                }}>
                    {content}
                </pre>
            </div>

            {/* IDE Invocation Section */}
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                    <Terminal size={15} color="#6366f1" />
                    <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>
                        How to Invoke This Agent
                    </span>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 4 }}>
                        — pick your IDE
                    </span>
                </div>

                {/* Tab bar */}
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
                    {IDE_TABS.map((tab) => {
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: 6,
                                    padding: '6px 14px', borderRadius: 8, fontSize: 13, fontWeight: 600,
                                    fontFamily: 'inherit', cursor: 'pointer',
                                    background: isActive ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : 'var(--surface)',
                                    color: isActive ? 'white' : 'var(--text-secondary)',
                                    border: isActive ? 'none' : '1px solid var(--border)',
                                    transition: 'all 200ms',
                                }}
                            >
                                {tab.label}
                                <span style={{
                                    fontSize: 10, padding: '1px 5px', borderRadius: 4, fontWeight: 700,
                                    background: isActive ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.06)',
                                    color: isActive ? 'white' : 'var(--text-muted)',
                                }}>
                                    {tab.badge}
                                </span>
                            </button>
                        );
                    })}
                </div>

                {/* Snippet */}
                {IDE_TABS.filter((t) => t.id === activeTab).map((tab) => (
                    <div key={tab.id} style={{
                        background: 'var(--bg-primary)', border: '1px solid var(--border)',
                        borderRadius: 10, overflow: 'hidden',
                    }}>
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: 6,
                            padding: '10px 16px', borderBottom: '1px solid var(--border)',
                            background: 'rgba(255,255,255,0.02)',
                        }}>
                            <ChevronRight size={12} color="var(--text-muted)" />
                            <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>
                                {tab.label} invocation examples
                            </span>
                        </div>
                        <pre style={{
                            padding: '16px', fontSize: 12.5, color: '#a5b4fc', lineHeight: 1.8,
                            fontFamily: 'JetBrains Mono, Fira Code, monospace',
                            whiteSpace: 'pre', overflowX: 'auto',
                        }}>
                            {tab.snippet(kebabName)}
                        </pre>
                    </div>
                ))}
            </div>
        </div>
    );
}
