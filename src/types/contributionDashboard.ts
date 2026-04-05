export interface ContributionMetrics {
  prOpened: number;
  prMerged: number;
  issuesClosed: number;
  reviews: number;
  commits: number;
  score: number;
}

export interface ContributionWeights {
  prOpened: number;
  prMerged: number;
  issuesClosed: number;
  reviews: number;
  commits: number;
}

export interface RepositoryReference {
  id: string;
  owner: string;
  repo: string;
}

export interface WeeklySeriesPoint extends ContributionMetrics {
  weekStart: string;
  weekEnd: string;
}

export interface DailySeriesPoint extends ContributionMetrics {
  date: string;
}

export interface RepoBreakdown extends ContributionMetrics {
  repository: string;
  repoOwner: string;
  repoName: string;
}

export interface LeaderboardEntry extends ContributionMetrics {
  username: string;
  displayName: string;
  avatarUrl: string | null;
  profileUrl: string | null;
  latestContributionDate: string | null;
  rank: number;
}

export interface ContributorSummary {
  username: string;
  displayName: string;
  avatarUrl: string | null;
  profileUrl: string | null;
  latestContributionDate: string | null;
  totals: ContributionMetrics;
  weeklySeries: WeeklySeriesPoint[];
}

export interface ContributorDetail {
  user: {
    username: string;
    displayName: string;
    avatarUrl: string | null;
    profileUrl: string | null;
  };
  totals: ContributionMetrics;
  weeklySeries: WeeklySeriesPoint[];
  repoBreakdown: RepoBreakdown[];
  dailyActivity: DailySeriesPoint[];
  latestContributionDate: string | null;
}

export interface DashboardStatus {
  configured: boolean;
  repositoryCount: number;
  repositories: string[];
  hasGitHubToken: boolean;
  configPath: string;
  localOverridePath: string;
  usingLocalOverride: boolean;
  usingEnvRepositories: boolean;
  manualSyncRequiresSecret: boolean;
  manualSyncSecretConfigured: boolean;
  hasData: boolean;
  activeContributors: number;
  databasePath: string;
  syncInProgress: boolean;
  sync: {
    cron: string;
    timezone: string;
    lookbackDays: number;
    bootstrapOnStart: boolean;
    staleAfterHours: number;
    weekStartsOn: string;
  };
  scheduler: {
    started: boolean;
    cron: string | null;
    timezone: string;
    nextRunAt: string | null;
    lastTriggeredAt: string | null;
  };
  lastSync: {
    id: string;
    status: string;
    reason: string;
    sinceDate: string;
    startedAt: string;
    completedAt: string | null;
    message: string | null;
    repositoriesJson: string;
    usersSynced: number;
    rowsUpserted: number;
    repositories: string[];
  } | null;
}

export interface DashboardSummary {
  status: DashboardStatus;
  repositories: RepositoryReference[];
  weights: ContributionWeights;
  window: {
    leaderboardDays: number;
    historyWeeks: number;
    startDate: string;
    endDate: string;
  };
  totals: ContributionMetrics;
  leaderboard: LeaderboardEntry[];
  weeklyActivity: WeeklySeriesPoint[];
  contributors: ContributorSummary[];
}
