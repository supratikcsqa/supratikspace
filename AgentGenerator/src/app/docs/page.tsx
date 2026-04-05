'use client';

import { BookOpen, Terminal, ChevronRight } from 'lucide-react';

const STEPS = [
    { n: 1, title: 'Set your API Key', desc: 'Click "API Keys" in the top nav. Enter your OpenAI, Google, or Anthropic key. It\'s stored only in your browser — never sent to our servers.' },
    { n: 2, title: 'Describe your agent', desc: 'Type a plain-English idea ("SEO audit agent for SaaS"). Use the example chips for inspiration. Be specific about the domain and audience.' },
    { n: 3, title: 'Select a model', desc: 'Pick from GPT-5.4, Gemini 3.1 Pro, Claude Opus 4.6, or others. More powerful models produce higher eval scores but use more tokens.' },
    { n: 4, title: 'Generate & review', desc: 'The 4-stage pipeline runs in real-time. Review the enriched brief, base architecture, GitHub skills found, and final eval scores.' },
    { n: 5, title: 'Deploy to your IDE', desc: 'Download the .md file or copy it. Use the IDE-specific syntax below to invoke it in your environment.' },
];

const IDE_EXAMPLES = [
    {
        id: 'antigravity',
        label: 'Antigravity AI IDE',
        color: '#6366f1',
        examples: [
            { label: 'Reference in chat', code: '@[agent-prompts/your-agent-prompt.md] your task here' },
            { label: 'Provide as context before a request', code: '@[agent-prompts/seo-agent-prompt.md]\nAudit my homepage for Core Web Vitals issues.' },
        ],
    },
    {
        id: 'gemini-cli',
        label: 'Gemini CLI',
        color: '#4285f4',
        examples: [
            { label: 'Via environment variable (recommended)', code: 'export GEMINI_SYSTEM_MD=/path/to/your-agent-prompt.md\ngemini "your task here"' },
            { label: 'Inline file reference', code: 'gemini "@./your-agent-prompt.md your task here"' },
            { label: 'Non-interactive / CI', code: 'gemini -p "your task" -m gemini-3.1-pro-preview' },
        ],
    },
    {
        id: 'claude-code',
        label: 'Claude Code',
        color: '#d97757',
        examples: [
            { label: 'Load as system prompt file', code: 'claude --system-prompt-file ./your-agent-prompt.md "your task"' },
            { label: 'Append (keeps built-in tools)', code: 'claude --append-system-prompt "$(cat your-agent-prompt.md)" "your task"' },
            { label: 'Persistent (copy to CLAUDE.md)', code: 'cp your-agent-prompt.md ./CLAUDE.md\nclaude "your task"   # auto-loads every session' },
        ],
    },
    {
        id: 'codex',
        label: 'Codex CLI (OpenAI)',
        color: '#10a37f',
        examples: [
            { label: 'Drop into .agents/skills/ for auto-discovery', code: 'mkdir -p .agents/skills/my-agent\ncp your-agent-prompt.md .agents/skills/my-agent/SKILL.md\ncodex exec "your task"' },
            { label: 'Explicit skill invocation in Codex TUI', code: 'codex\n> $my-agent your task here' },
        ],
    },
    {
        id: 'cursor',
        label: 'Cursor',
        color: '#0070f3',
        examples: [
            { label: 'Inline @ reference in chat', code: '@your-agent-prompt.md your task here' },
            { label: 'Persistent via .cursorrules', code: 'cp your-agent-prompt.md .cursorrules\n# Auto-loads for all chats in this project' },
        ],
    },
];

export default function DocsPage() {
    return (
        <div className="page-container" style={{ maxWidth: 880 }}>
            <div style={{ marginBottom: 40 }}>
                <h1 style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-0.5px', marginBottom: 8 }}>How to Use</h1>
                <p style={{ color: 'var(--text-secondary)' }}>From idea to deployed agent in 5 steps.</p>
            </div>

            {/* Steps */}
            <div style={{ marginBottom: 56 }}>
                <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>Getting Started</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {STEPS.map((step) => (
                        <div key={step.n} className="card" style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                            <div style={{
                                width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: 14, fontWeight: 800, color: 'white',
                            }}>
                                {step.n}
                            </div>
                            <div>
                                <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>{step.title}</div>
                                <div style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{step.desc}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* IDE Examples */}
            <div>
                <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>IDE Invocation Reference</h2>
                <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 24 }}>
                    Each IDE has its own syntax for loading an agent prompt. Pick yours below.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                    {IDE_EXAMPLES.map((ide) => (
                        <div key={ide.id} className="card">
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                                <div style={{ width: 10, height: 10, borderRadius: '50%', background: ide.color }} />
                                <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>{ide.label}</h3>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                                {ide.examples.map((ex) => (
                                    <div key={ex.label}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                                            <ChevronRight size={12} color="var(--text-muted)" />
                                            <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>{ex.label}</span>
                                        </div>
                                        <div style={{
                                            background: 'var(--bg-primary)', border: '1px solid var(--border)',
                                            borderRadius: 8, padding: '12px 16px',
                                        }}>
                                            <pre style={{ fontSize: 12.5, color: '#a5b4fc', fontFamily: 'JetBrains Mono, monospace', whiteSpace: 'pre-wrap', margin: 0 }}>
                                                {ex.code}
                                            </pre>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
