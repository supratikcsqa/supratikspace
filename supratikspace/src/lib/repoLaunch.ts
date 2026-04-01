import type { LaunchPageData } from '../types/launchPage';

export interface PreviewResponse {
  slug: string;
  previewUrl: string;
  subdomainUrl: string;
  page: LaunchPageData;
}

export async function createRepoPreview(repoUrl: string): Promise<PreviewResponse> {
  const response = await fetch('/api/pages/preview', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ repoUrl }),
  });

  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload?.error || 'Preview generation failed.');
  }

  return payload as PreviewResponse;
}

export async function fetchLaunchPage(slug: string): Promise<LaunchPageData> {
  const response = await fetch(`/api/pages/${slug}`);
  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload?.error || 'Generated page not found.');
  }

  return payload as LaunchPageData;
}

export function getLaunchSlugFromHost(hostname: string): string | null {
  const host = hostname.split(':')[0].toLowerCase();

  if (!host || host === 'localhost' || host === '127.0.0.1') {
    return null;
  }

  if (host === 'supratik.space' || host === 'www.supratik.space') {
    return null;
  }

  if (host.endsWith('.localhost')) {
    return host.replace('.localhost', '');
  }

  if (host.endsWith('.supratik.space')) {
    return host.replace('.supratik.space', '');
  }

  return null;
}
