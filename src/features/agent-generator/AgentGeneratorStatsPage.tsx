import { useEffect, useMemo, useState } from 'react';
import { BarChart2, Cpu, Star, Zap } from 'lucide-react';
import { MODELS } from './models';

interface StatsData {
  totalGenerations: number;
  totalTokens: number;
  avgScore: number;
  byModel: Record<string, { count: number; tokens: number }>;
}

const EMPTY_STATS: StatsData = {
  totalGenerations: 0,
  totalTokens: 0,
  avgScore: 0,
  byModel: {},
};

export default function AgentGeneratorStatsPage() {
  const [stats, setStats] = useState<StatsData>(EMPTY_STATS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/agents/stats')
      .then(async (response) => {
        const payload = await response.json();

        if (!response.ok) {
          throw new Error(payload?.error || 'Stats could not be loaded.');
        }

        setStats({
          totalGenerations: payload.totalGenerations || 0,
          totalTokens: payload.totalTokens || 0,
          avgScore: payload.avgScore || 0,
          byModel: payload.byModel || {},
        });
        setLoading(false);
      })
      .catch(() => {
        setStats(EMPTY_STATS);
        setLoading(false);
      });
  }, []);

  const maxCount = useMemo(
    () => Math.max(...Object.values(stats.byModel).map((model) => model.count), 1),
    [stats.byModel]
  );

  return (
    <div className="page-container" style={{ maxWidth: 880 }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-0.5px', marginBottom: 8 }}>
          Usage Analytics
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Aggregated stats from optional Supabase persistence.
        </p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>
          <div className="spinner" style={{ margin: '0 auto 16px', width: 24, height: 24 }} />
          Loading stats...
        </div>
      ) : (
        <>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: 16,
              marginBottom: 32,
            }}
          >
            {[
              {
                icon: Cpu,
                label: 'Total Agents Generated',
                value: stats.totalGenerations.toLocaleString(),
                color: '#6366f1',
              },
              {
                icon: Zap,
                label: 'Total Tokens Consumed',
                value: stats.totalTokens.toLocaleString(),
                color: '#f59e0b',
              },
              {
                icon: Star,
                label: 'Average Eval Score',
                value: `${stats.avgScore}/100`,
                color: '#10b981',
              },
            ].map(({ icon: Icon, label, value, color }) => (
              <div key={label} className="card" style={{ textAlign: 'center' }}>
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 10,
                    background:
                      color === '#6366f1'
                        ? 'rgba(99,102,241,0.12)'
                        : color === '#f59e0b'
                          ? 'rgba(245,158,11,0.12)'
                          : 'rgba(16,185,129,0.12)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 12px',
                  }}
                >
                  <Icon size={20} color={color} />
                </div>
                <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>
                  {value}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>{label}</div>
              </div>
            ))}
          </div>

          <div className="card">
            <h2
              style={{
                fontSize: 16,
                fontWeight: 700,
                marginBottom: 20,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <BarChart2 size={16} color="#6366f1" /> Usage by Model
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {MODELS.map((model) => {
                const data = stats.byModel[model.id];
                const count = data?.count || 0;
                const tokens = data?.tokens || 0;
                const percent = Math.round((count / maxCount) * 100);

                return (
                  <div key={model.id}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: model.color }} />
                        <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
                          {model.name}
                        </span>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>
                          {count}
                        </span>
                        <span style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 6 }}>
                          runs · {tokens.toLocaleString()} tokens
                        </span>
                      </div>
                    </div>

                    <div className="score-bar-track">
                      <div className="score-bar-fill" style={{ width: `${percent}%`, background: model.color }} />
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
