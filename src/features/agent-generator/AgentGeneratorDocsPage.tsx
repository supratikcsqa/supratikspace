import { ChevronRight } from 'lucide-react';

const STEPS = [
  {
    n: 1,
    title: 'Set your API key',
    desc: 'Open API Keys in the top nav and save one provider key locally in your browser.',
  },
  {
    n: 2,
    title: 'Describe the agent',
    desc: 'Use plain English and be explicit about the job, audience, and workflow.',
  },
  {
    n: 3,
    title: 'Pick a model',
    desc: 'Frontier models usually produce stronger architectures and better skill selection.',
  },
  {
    n: 4,
    title: 'Generate and review',
    desc: 'Watch the enrich, architect, skill discovery, and integrate phases in real time.',
  },
  {
    n: 5,
    title: 'Deploy to your IDE',
    desc: 'Copy or download the markdown prompt, then load it in Codex, Claude Code, Gemini CLI, or Cursor.',
  },
];

const IDE_EXAMPLES = [
  {
    id: 'codex',
    label: 'Codex CLI',
    color: '#10a37f',
    examples: [
      {
        label: 'Drop it into .agents/skills',
        code: 'mkdir -p .agents/skills/my-agent\ncp your-agent-prompt.md .agents/skills/my-agent/SKILL.md\ncodex exec "your task"',
      },
      {
        label: 'Invoke explicitly in the TUI',
        code: 'codex\n> $my-agent your task here',
      },
    ],
  },
  {
    id: 'claude-code',
    label: 'Claude Code',
    color: '#d97757',
    examples: [
      {
        label: 'Use a system prompt file',
        code: 'claude --system-prompt-file ./your-agent-prompt.md "your task"',
      },
      {
        label: 'Persist via CLAUDE.md',
        code: 'cp your-agent-prompt.md ./CLAUDE.md\nclaude "your task"',
      },
    ],
  },
  {
    id: 'gemini-cli',
    label: 'Gemini CLI',
    color: '#4285f4',
    examples: [
      {
        label: 'Environment variable',
        code: 'export GEMINI_SYSTEM_MD=/path/to/your-agent-prompt.md\ngemini "your task"',
      },
      {
        label: 'Inline file injection',
        code: 'gemini "@./your-agent-prompt.md your task here"',
      },
    ],
  },
  {
    id: 'cursor',
    label: 'Cursor',
    color: '#0070f3',
    examples: [
      {
        label: 'Reference directly in chat',
        code: '@your-agent-prompt.md your task here',
      },
      {
        label: 'Persist through .cursorrules',
        code: 'cp your-agent-prompt.md .cursorrules',
      },
    ],
  },
];

export default function AgentGeneratorDocsPage() {
  return (
    <div className="page-container" style={{ maxWidth: 880 }}>
      <div style={{ marginBottom: 40 }}>
        <h1 style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-0.5px', marginBottom: 8 }}>
          How To Use
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          From raw idea to runnable agent prompt in five steps.
        </p>
      </div>

      <div style={{ marginBottom: 56 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>Getting Started</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {STEPS.map((step) => (
            <div key={step.n} className="card" style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  flexShrink: 0,
                  background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 14,
                  fontWeight: 800,
                  color: 'white',
                }}
              >
                {step.n}
              </div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
                  {step.title}
                </div>
                <div style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  {step.desc}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>IDE Invocation Reference</h2>
        <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 24 }}>
          Pick the environment you want to use after the markdown prompt is ready.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {IDE_EXAMPLES.map((ide) => (
            <div key={ide.id} className="card">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: ide.color }} />
                <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>{ide.label}</h3>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {ide.examples.map((example) => (
                  <div key={example.label}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                      <ChevronRight size={12} color="var(--text-muted)" />
                      <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>
                        {example.label}
                      </span>
                    </div>

                    <div
                      style={{
                        background: 'var(--bg-primary)',
                        border: '1px solid var(--border)',
                        borderRadius: 8,
                        padding: '12px 16px',
                      }}
                    >
                      <pre
                        style={{
                          fontSize: 12.5,
                          color: '#a5b4fc',
                          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
                          whiteSpace: 'pre-wrap',
                          margin: 0,
                        }}
                      >
                        {example.code}
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
