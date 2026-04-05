import { useState } from 'react';
import { Check, ChevronRight, Copy, Download, Terminal } from 'lucide-react';

interface AgentOutputProps {
  content: string;
  agentName?: string;
}

const IDE_TABS = [
  {
    id: 'codex',
    label: 'Codex CLI',
    badge: 'CLI',
    snippet: (name: string) => `mkdir -p .agents/skills/${name}
cp ${name}-agent-prompt.md .agents/skills/${name}/SKILL.md
codex exec "your task here"

codex
> $${name} your task here`,
  },
  {
    id: 'claude-code',
    label: 'Claude Code',
    badge: 'CLI',
    snippet: (name: string) => `claude --system-prompt-file ./${name}-agent-prompt.md "your task here"

claude --append-system-prompt "$(cat ${name}-agent-prompt.md)" "your task"

cp ${name}-agent-prompt.md ./CLAUDE.md
claude "your task here"`,
  },
  {
    id: 'gemini-cli',
    label: 'Gemini CLI',
    badge: 'CLI',
    snippet: (name: string) => `export GEMINI_SYSTEM_MD=/path/to/${name}-agent-prompt.md
gemini "your task here"

gemini "@./${name}-agent-prompt.md your task here"`,
  },
  {
    id: 'cursor',
    label: 'Cursor',
    badge: 'IDE',
    snippet: (name: string) => `@${name}-agent-prompt.md your task here

cp ${name}-agent-prompt.md .cursorrules`,
  },
];

export function AgentOutput({
  content,
  agentName = 'generated',
}: AgentOutputProps) {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('codex');

  const kebabName = agentName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `${kebabName}-agent-prompt.md`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="card animate-fade-in" style={{ marginTop: 16 }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 16,
          gap: 12,
          flexWrap: 'wrap',
        }}
      >
        <h3
          style={{
            fontWeight: 700,
            fontSize: 16,
            color: 'var(--text-primary)',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <span style={{ color: '#10b981' }}>Ready</span> Agent Prompt
        </h3>

        <div style={{ display: 'flex', gap: 8 }}>
          <button type="button" className="btn-ghost" onClick={handleCopy} style={{ fontSize: 13 }}>
            {copied ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
            {copied ? 'Copied' : 'Copy'}
          </button>
          <button type="button" className="btn-ghost" onClick={handleDownload} style={{ fontSize: 13 }}>
            <Download size={14} />
            Download .md
          </button>
        </div>
      </div>

      <div
        style={{
          background: 'var(--bg-primary)',
          border: '1px solid var(--border)',
          borderRadius: 10,
          padding: 16,
          maxHeight: 340,
          overflowY: 'auto',
          marginBottom: 20,
        }}
      >
        <pre
          style={{
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            fontSize: 12.5,
            lineHeight: 1.75,
            color: 'var(--text-secondary)',
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
          }}
        >
          {content}
        </pre>
      </div>

      <div style={{ borderTop: '1px solid var(--border)', paddingTop: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
          <Terminal size={15} color="#6366f1" />
          <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>
            Invocation Reference
          </span>
        </div>

        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
          {IDE_TABS.map((tab) => {
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '6px 14px',
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 600,
                  fontFamily: 'inherit',
                  cursor: 'pointer',
                  background: isActive ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : 'var(--surface)',
                  color: isActive ? 'white' : 'var(--text-secondary)',
                  border: isActive ? 'none' : '1px solid var(--border)',
                }}
              >
                {tab.label}
                <span
                  style={{
                    fontSize: 10,
                    padding: '1px 5px',
                    borderRadius: 4,
                    fontWeight: 700,
                    background: isActive ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.06)',
                    color: isActive ? 'white' : 'var(--text-muted)',
                  }}
                >
                  {tab.badge}
                </span>
              </button>
            );
          })}
        </div>

        {IDE_TABS.filter((tab) => tab.id === activeTab).map((tab) => (
          <div
            key={tab.id}
            style={{
              background: 'var(--bg-primary)',
              border: '1px solid var(--border)',
              borderRadius: 10,
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '10px 16px',
                borderBottom: '1px solid var(--border)',
                background: 'rgba(255,255,255,0.02)',
              }}
            >
              <ChevronRight size={12} color="var(--text-muted)" />
              <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>
                {tab.label} examples
              </span>
            </div>

            <pre
              style={{
                padding: '16px',
                fontSize: 12.5,
                color: '#a5b4fc',
                lineHeight: 1.8,
                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
                whiteSpace: 'pre',
                overflowX: 'auto',
              }}
            >
              {tab.snippet(kebabName)}
            </pre>
          </div>
        ))}
      </div>
    </div>
  );
}
