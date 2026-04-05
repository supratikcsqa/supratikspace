import type { ContributorDetail, DashboardSummary } from '../types/contributionDashboard';
import { buildApiUrl } from './apiBase';

async function readJson<T>(input: RequestInfo | URL) {
  const response = await fetch(input);

  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    throw new Error(payload?.error || 'Request failed.');
  }

  return response.json() as Promise<T>;
}

export function fetchContributionDashboardSummary(weeks = 8) {
  return readJson<DashboardSummary>(buildApiUrl(`/api/contribution-intelligence/summary?weeks=${weeks}`));
}

export function fetchContributorDetail(username: string, weeks = 8) {
  return readJson<ContributorDetail>(buildApiUrl(`/api/contribution-intelligence/users/${encodeURIComponent(username)}?weeks=${weeks}`));
}
