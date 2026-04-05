import type { LaunchPageData } from '../types/launchPage';
import type { GenerationJob } from '../types/generationJob';
import type { TemplateDefinition } from '../types/template';
import { buildApiUrl } from './apiBase';

export interface PreviewResponse {
  slug: string;
  previewUrl: string;
  subdomainUrl: string;
  page?: LaunchPageData;
}

async function readJson(response: Response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

export async function createRepoPreview(repoUrl: string, templateId?: string): Promise<PreviewResponse> {
  const response = await fetch(buildApiUrl('/api/pages/preview'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ repoUrl, templateId }),
  });

  const payload = await readJson(response);

  if (!response.ok) {
    throw new Error(payload?.error || 'Preview generation failed.');
  }

  return payload as PreviewResponse;
}

export async function createRepoGenerationJob(repoUrl: string, templateId?: string): Promise<GenerationJob> {
  const response = await fetch(buildApiUrl('/api/pages/generate'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ repoUrl, templateId }),
  });

  const payload = await readJson(response);

  if (!response.ok) {
    throw new Error(payload?.error || 'Generation job could not be created.');
  }

  return payload as GenerationJob;
}

export async function fetchRepoGenerationJob(jobId: string): Promise<GenerationJob> {
  const response = await fetch(buildApiUrl(`/api/jobs/${jobId}`));
  const payload = await readJson(response);

  if (!response.ok) {
    throw new Error(payload?.error || 'Generation job could not be loaded.');
  }

  return payload as GenerationJob;
}

export async function fetchLaunchPage(slug: string): Promise<LaunchPageData> {
  const response = await fetch(buildApiUrl(`/api/pages/${slug}`));
  const payload = await readJson(response);

  if (!response.ok) {
    throw new Error(payload?.error || 'Generated page not found.');
  }

  return payload as LaunchPageData;
}

export async function fetchTemplateDefinitions(): Promise<TemplateDefinition[]> {
  const response = await fetch(buildApiUrl('/api/templates'));
  const payload = await readJson(response);

  if (!response.ok) {
    throw new Error(payload?.error || 'Template definitions could not be loaded.');
  }

  return payload?.templates || [];
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
