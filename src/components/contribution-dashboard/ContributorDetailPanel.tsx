import BarChart from './BarChart';
import { formatMetric, formatScore, formatShortDate, formatWeekLabel } from './formatters';
import type { ContributorDetail } from '../../types/contributionDashboard';

interface ContributorDetailPanelProps {
  detail: ContributorDetail | null;
  loading: boolean;
}

const ContributorDetailPanel = ({ detail, loading }: ContributorDetailPanelProps) => {
  if (loading) {
    return (
      <div className="rounded-[32px] border border-white/10 bg-white/[0.03] p-6 text-sm text-white/55">
        Loading contributor breakdown...
      </div>
    );
  }

  if (!detail) {
    return (
      <div className="rounded-[32px] border border-dashed border-white/10 bg-white/[0.02] p-6 text-sm text-white/45">
        Select a contributor to inspect ownership signals and trend lines.
      </div>
    );
  }

  return (
    <div className="rounded-[32px] border border-white/10 bg-white/[0.03] p-6">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-3xl border border-white/10 bg-white/10 text-base font-semibold uppercase text-white/70">
            {detail.user.avatarUrl ? (
              <img src={detail.user.avatarUrl} alt={detail.user.displayName} className="h-full w-full object-cover" />
            ) : (
              detail.user.displayName.slice(0, 2)
            )}
          </div>
          <div>
            <h3 className="text-xl font-semibold text-white">{detail.user.displayName}</h3>
            <p className="text-sm text-white/45">@{detail.user.username}</p>
          </div>
        </div>

        <div className="rounded-[24px] border border-orange-400/20 bg-orange-500/8 px-4 py-3 text-sm text-white/70">
          <p className="text-xs uppercase tracking-[0.18em] text-white/45">Latest contribution</p>
          <p className="mt-2 text-base font-medium text-orange-100">{formatShortDate(detail.latestContributionDate)}</p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <DetailStat label="8 week score" value={formatScore(detail.totals.score)} />
        <DetailStat label="Merged PRs" value={formatMetric(detail.totals.prMerged)} />
        <DetailStat label="Reviews + Issues" value={formatMetric(detail.totals.reviews + detail.totals.issuesClosed)} />
      </div>

      <div className="mt-6">
        <BarChart
          title="Weekly contribution shape"
          subtitle="Weighted impact by week."
          items={detail.weeklySeries.map((week) => ({
            label: formatShortDate(week.weekStart),
            value: week.score,
            footnote: formatWeekLabel(week.weekStart, week.weekEnd),
          }))}
          accent="from-orange-400 to-rose-300"
        />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <BarChart
          title="Daily momentum"
          subtitle="Last 14 days of contribution score."
          items={detail.dailyActivity.map((day) => ({
            label: formatShortDate(day.date),
            value: day.score,
          }))}
          accent="from-cyan-400 to-emerald-300"
        />

        <div className="rounded-[28px] border border-white/10 bg-black/10 p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h4 className="text-lg font-semibold text-white">Repo ownership</h4>
              <p className="mt-1 text-sm text-white/55">Where this contributor is carrying the most visible load.</p>
            </div>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.2em] text-white/45">
              {detail.repoBreakdown.length} repos
            </span>
          </div>

          <div className="mt-5 space-y-3">
            {detail.repoBreakdown.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-white/10 px-4 py-6 text-sm text-white/45">
                No repo breakdown yet.
              </div>
            ) : (
              detail.repoBreakdown.map((repository) => (
                <div key={repository.repository} className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-medium text-white">{repository.repository}</p>
                      <p className="mt-1 text-xs text-white/45">
                        {formatMetric(repository.prMerged)} merged PRs • {formatMetric(repository.issuesClosed)} issues • {formatMetric(repository.reviews)} reviews
                      </p>
                    </div>
                    <p className="text-lg font-semibold text-orange-100">{formatScore(repository.score)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const DetailStat = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-[24px] border border-white/10 bg-black/10 px-4 py-4">
    <p className="text-xs uppercase tracking-[0.18em] text-white/45">{label}</p>
    <p className="mt-3 text-2xl font-semibold text-white">{value}</p>
  </div>
);

export default ContributorDetailPanel;
