import type { LeaderboardEntry } from '../../types/contributionDashboard';
import { formatMetric, formatScore, formatShortDate } from './formatters';

interface LeaderboardTableProps {
  entries: LeaderboardEntry[];
  selectedUsername: string | null;
  onSelect: (username: string) => void;
}

const LeaderboardTable = ({ entries, selectedUsername, onSelect }: LeaderboardTableProps) => (
  <div className="rounded-[32px] border border-white/10 bg-white/[0.03] p-5">
    <div className="flex items-start justify-between gap-3">
      <div>
        <h3 className="text-lg font-semibold text-white">Weekly leaderboard</h3>
        <p className="mt-1 text-sm text-white/55">Ranked by weighted score, not raw commit volume.</p>
      </div>
      <span className="rounded-full border border-orange-400/20 bg-orange-500/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-orange-100/80">
        Accountability mode
      </span>
    </div>

    <div className="mt-5 overflow-hidden rounded-[24px] border border-white/8">
      <table className="min-w-full divide-y divide-white/8 text-left">
        <thead className="bg-black/15 text-xs uppercase tracking-[0.18em] text-white/45">
          <tr>
            <th className="px-4 py-3">Rank</th>
            <th className="px-4 py-3">Contributor</th>
            <th className="px-4 py-3">Score</th>
            <th className="px-4 py-3">Merged PRs</th>
            <th className="px-4 py-3">Issues Closed</th>
            <th className="px-4 py-3">Reviews</th>
            <th className="px-4 py-3">Last Seen</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/6 text-sm text-white/80">
          {entries.length === 0 ? (
            <tr>
              <td colSpan={7} className="px-4 py-8 text-center text-white/45">
                No ranked contributors yet. Run the first sync after configuring repositories.
              </td>
            </tr>
          ) : (
            entries.map((entry) => {
              const isSelected = entry.username === selectedUsername;

              return (
                <tr
                  key={entry.username}
                  className={`cursor-pointer transition hover:bg-white/[0.04] ${isSelected ? 'bg-orange-500/10' : ''}`}
                  onClick={() => onSelect(entry.username)}
                >
                  <td className="px-4 py-4 text-white/55">#{entry.rank}</td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-white/10 text-xs font-semibold uppercase text-white/70">
                        {entry.avatarUrl ? (
                          <img src={entry.avatarUrl} alt={entry.displayName} className="h-full w-full object-cover" />
                        ) : (
                          entry.displayName.slice(0, 2)
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-white">{entry.displayName}</p>
                        <p className="text-xs text-white/45">@{entry.username}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 font-semibold text-orange-100">{formatScore(entry.score)}</td>
                  <td className="px-4 py-4">{formatMetric(entry.prMerged)}</td>
                  <td className="px-4 py-4">{formatMetric(entry.issuesClosed)}</td>
                  <td className="px-4 py-4">{formatMetric(entry.reviews)}</td>
                  <td className="px-4 py-4 text-white/45">{formatShortDate(entry.latestContributionDate)}</td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  </div>
);

export default LeaderboardTable;
