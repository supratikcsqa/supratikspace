import React, { useEffect, useMemo, useState } from 'react';
import {
  CalendarClock,
  FolderGit2,
  GitCommitHorizontal,
  GitPullRequest,
  MessageSquareText,
  RefreshCw,
  ShieldAlert,
  Trophy,
  Users,
} from 'lucide-react';
import MetricCard from '../components/contribution-dashboard/MetricCard';
import LeaderboardTable from '../components/contribution-dashboard/LeaderboardTable';
import ContributorDetailPanel from '../components/contribution-dashboard/ContributorDetailPanel';
import BarChart from '../components/contribution-dashboard/BarChart';
import SetupState from '../components/contribution-dashboard/SetupState';
import { formatLongDateTime, formatMetric, formatScore, formatShortDate, formatWeekLabel } from '../components/contribution-dashboard/formatters';
import { buildApiUrl } from '../lib/apiBase';
import { fetchContributionDashboardSummary, fetchContributorDetail } from '../lib/contributionDashboard';
import type { ContributorDetail, DashboardSummary } from '../types/contributionDashboard';

const HISTORY_WEEKS = 8;
const REFRESH_INTERVAL_MS = 60_000;

const ContributionDashboard: React.FC = () => {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [detail, setDetail] = useState<ContributorDetail | null>(null);
  const [selectedUsername, setSelectedUsername] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [syncLoading, setSyncLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        const nextSummary = await fetchContributionDashboardSummary(HISTORY_WEEKS);

        if (!active) {
          return;
        }

        setSummary(nextSummary);
        setError('');
        setSelectedUsername((current) => current || nextSummary.leaderboard[0]?.username || nextSummary.contributors[0]?.username || null);
      } catch (loadError) {
        if (active) {
          setError(loadError instanceof Error ? loadError.message : 'Dashboard data could not be loaded.');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void load();
    const timer = window.setInterval(load, REFRESH_INTERVAL_MS);

    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    if (!summary) {
      return;
    }

    const usernames = new Set(summary.contributors.map((contributor) => contributor.username));

    if (selectedUsername && usernames.has(selectedUsername)) {
      return;
    }

    setSelectedUsername(summary.leaderboard[0]?.username || summary.contributors[0]?.username || null);
  }, [selectedUsername, summary]);

  useEffect(() => {
    if (!selectedUsername) {
      setDetail(null);
      return;
    }

    let active = true;

    const load = async () => {
      setDetailLoading(true);

      try {
        const nextDetail = await fetchContributorDetail(selectedUsername, HISTORY_WEEKS);

        if (active) {
          setDetail(nextDetail);
        }
      } catch (loadError) {
        if (active) {
          setError(loadError instanceof Error ? loadError.message : 'Contributor detail could not be loaded.');
        }
      } finally {
        if (active) {
          setDetailLoading(false);
        }
      }
    };

    void load();

    return () => {
      active = false;
    };
  }, [selectedUsername]);

  const leaderboardWinner = summary?.leaderboard[0] || null;
  const chartItems = useMemo(
    () => summary?.weeklyActivity.map((week) => ({
      label: formatShortDate(week.weekStart),
      value: week.score,
      footnote: formatWeekLabel(week.weekStart, week.weekEnd),
    })) || [],
    [summary]
  );

  const canTriggerSync = Boolean(summary && !summary.status.manualSyncRequiresSecret);

  const handleManualSync = async () => {
    if (!canTriggerSync) {
      return;
    }

    setSyncLoading(true);

    try {
      const response = await fetch(buildApiUrl('/api/contribution-intelligence/sync'), { method: 'POST' });
      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(payload?.error || 'Sync failed.');
      }

      const nextSummary = await fetchContributionDashboardSummary(HISTORY_WEEKS);
      setSummary(nextSummary);
      setSelectedUsername((current) => current || nextSummary.leaderboard[0]?.username || null);
      setError('');
    } catch (syncError) {
      setError(syncError instanceof Error ? syncError.message : 'Sync failed.');
    } finally {
      setSyncLoading(false);
    }
  };

  if (loading && !summary) {
    return (
      <DashboardShell>
        <div className="rounded-[32px] border border-white/10 bg-white/[0.04] p-10 text-center text-sm text-white/55">
          Loading contribution intelligence dashboard...
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell>
      <section className="rounded-[40px] border border-white/10 bg-black/20 p-6 shadow-[0_40px_140px_-70px_rgba(251,146,60,0.7)] backdrop-blur">
        <div className="flex flex-col gap-8 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-3xl">
            <p className="text-xs uppercase tracking-[0.3em] text-orange-100/60">MartianCrown contribution intelligence</p>
            <h1 className="mt-4 max-w-4xl font-display text-4xl font-semibold tracking-tight text-white md:text-5xl">
              Visibility for real engineering ownership, not commit theater.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-8 text-white/68">
              Weekly ranking is driven by merged PRs, issues closed, reviews, and only a lightly weighted commit signal. The goal is simple: make contribution quality impossible to hide.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:min-w-[420px]">
            <StatusPill
              icon={CalendarClock}
              label="Last sync"
              value={formatLongDateTime(summary?.status.lastSync?.completedAt || null)}
            />
            <StatusPill
              icon={FolderGit2}
              label="Tracked repos"
              value={`${summary?.status.repositoryCount || 0} configured`}
            />
            <StatusPill
              icon={Users}
              label="Active contributors"
              value={`${summary?.status.activeContributors || 0} ranked`}
            />
            <StatusPill
              icon={ShieldAlert}
              label="Token status"
              value={summary?.status.hasGitHubToken ? 'Authenticated' : 'Public API mode'}
            />
          </div>
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleManualSync}
            disabled={!canTriggerSync || syncLoading}
            className="inline-flex items-center gap-2 rounded-full border border-orange-300/20 bg-orange-500/12 px-4 py-2 text-sm font-medium text-orange-50 transition hover:bg-orange-500/18 disabled:cursor-not-allowed disabled:opacity-55"
          >
            <RefreshCw size={16} className={syncLoading ? 'animate-spin' : ''} />
            {syncLoading ? 'Syncing...' : canTriggerSync ? 'Run sync now' : 'Sync is server-managed'}
          </button>

          <span className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-white/55">
            Daily cadence: {summary?.status.sync.cron || 'n/a'} {summary?.status.sync.timezone || ''}
          </span>

          {leaderboardWinner ? (
            <span className="rounded-full border border-emerald-300/20 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-100/85">
              Current leader: {leaderboardWinner.displayName} with {formatScore(leaderboardWinner.score)} points
            </span>
          ) : null}
        </div>
      </section>

      {error ? (
        <div className="rounded-[28px] border border-rose-300/20 bg-rose-500/10 px-5 py-4 text-sm text-rose-100/90">
          {error}
        </div>
      ) : null}

      {summary && !summary.status.configured ? (
        <SetupState
          configPath={summary.status.configPath}
          localOverridePath={summary.status.localOverridePath}
          hasGitHubToken={summary.status.hasGitHubToken}
        />
      ) : null}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          icon={Trophy}
          label="Weighted score"
          value={formatScore(summary?.totals.score || 0)}
          detail="8 week total across all tracked repositories."
          tone="ember"
        />
        <MetricCard
          icon={GitPullRequest}
          label="Merged PRs"
          value={formatMetric(summary?.totals.prMerged || 0)}
          detail="The strongest ownership signal in this model."
          tone="amber"
        />
        <MetricCard
          icon={MessageSquareText}
          label="Reviews + issues"
          value={formatMetric((summary?.totals.reviews || 0) + (summary?.totals.issuesClosed || 0))}
          detail="Cross-team accountability beyond authored code."
          tone="teal"
        />
        <MetricCard
          icon={GitCommitHorizontal}
          label="Commits tracked"
          value={formatMetric(summary?.totals.commits || 0)}
          detail="Visible, but intentionally de-prioritized to reduce spam."
          tone="slate"
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <LeaderboardTable
          entries={summary?.leaderboard || []}
          selectedUsername={selectedUsername}
          onSelect={setSelectedUsername}
        />

        <BarChart
          title="Team activity trend"
          subtitle="Weekly score across the cohort."
          items={chartItems}
          accent="from-orange-400 to-amber-300"
          emptyLabel="No weekly trend yet. Configure repos and sync the data source."
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <ContributorDetailPanel detail={detail} loading={detailLoading} />

        <aside className="space-y-6">
          <div className="rounded-[32px] border border-white/10 bg-white/[0.03] p-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold text-white">Scoring weights</h3>
                <p className="mt-1 text-sm text-white/55">Impact is explicit and configurable from JSON.</p>
              </div>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.2em] text-white/45">
                Configurable
              </span>
            </div>

            <div className="mt-5 space-y-3">
              <WeightRow label="PR merged" value={summary?.weights.prMerged || 0} />
              <WeightRow label="PR opened" value={summary?.weights.prOpened || 0} />
              <WeightRow label="Issue closed" value={summary?.weights.issuesClosed || 0} />
              <WeightRow label="Code review" value={summary?.weights.reviews || 0} />
              <WeightRow label="Commit" value={summary?.weights.commits || 0} subdued />
            </div>
          </div>

          <div className="rounded-[32px] border border-white/10 bg-white/[0.03] p-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold text-white">Tracked repositories</h3>
                <p className="mt-1 text-sm text-white/55">Cross-repo scope is the whole point of the leaderboard.</p>
              </div>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.2em] text-white/45">
                {summary?.repositories.length || 0} repos
              </span>
            </div>

            <div className="mt-5 space-y-3">
              {(summary?.repositories || []).length === 0 ? (
                <div className="rounded-2xl border border-dashed border-white/10 px-4 py-6 text-sm text-white/45">
                  No repositories configured yet.
                </div>
              ) : (
                summary?.repositories.map((repository) => (
                  <div key={repository.id} className="rounded-2xl border border-white/8 bg-black/10 px-4 py-4">
                    <p className="font-medium text-white">{repository.id}</p>
                    <p className="mt-1 text-xs text-white/45">Daily sync window: last {summary?.status.sync.lookbackDays} days</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </aside>
      </section>
    </DashboardShell>
  );
};

const DashboardShell = ({ children }: { children: React.ReactNode }) => (
  <div className="min-h-screen bg-[#120d0b] text-white">
    <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top_left,rgba(251,146,60,0.18),transparent_32%),radial-gradient(circle_at_top_right,rgba(244,63,94,0.14),transparent_30%),linear-gradient(180deg,rgba(255,255,255,0.02),transparent_45%)]" />
    <div className="pointer-events-none fixed inset-0 opacity-20 [background-image:linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] [background-size:56px_56px]" />
    <main className="relative mx-auto flex w-full max-w-7xl flex-col gap-6 px-6 py-8 lg:px-8 lg:py-10">
      {children}
    </main>
  </div>
);

const StatusPill = ({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof CalendarClock;
  label: string;
  value: string;
}) => (
  <div className="rounded-[26px] border border-white/10 bg-white/[0.03] px-4 py-4">
    <div className="flex items-center gap-3">
      <div className="rounded-2xl border border-white/10 bg-white/6 p-3 text-white/70">
        <Icon size={18} />
      </div>
      <div>
        <p className="text-xs uppercase tracking-[0.18em] text-white/45">{label}</p>
        <p className="mt-1 text-sm font-medium text-white/85">{value}</p>
      </div>
    </div>
  </div>
);

const WeightRow = ({
  label,
  value,
  subdued = false,
}: {
  label: string;
  value: number;
  subdued?: boolean;
}) => (
  <div className={`flex items-center justify-between rounded-2xl border px-4 py-4 ${subdued ? 'border-white/6 bg-black/10 text-white/55' : 'border-white/10 bg-white/[0.03] text-white/80'}`}>
    <span>{label}</span>
    <span className="text-lg font-semibold text-white">{formatScore(value)}</span>
  </div>
);

export default ContributionDashboard;
