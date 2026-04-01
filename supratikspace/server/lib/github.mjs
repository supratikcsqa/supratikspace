import { Buffer } from 'node:buffer';

const GITHUB_API_ROOT = 'https://api.github.com';

function buildHeaders() {
  const headers = {
    Accept: 'application/vnd.github+json',
    'User-Agent': 'supratik-space-repo-launch-pages',
  };

  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  return headers;
}

async function fetchGitHubJson(pathname) {
  const response = await fetch(`${GITHUB_API_ROOT}${pathname}`, {
    headers: buildHeaders(),
  });

  if (!response.ok) {
    let message = `GitHub request failed with ${response.status}`;

    try {
      const payload = await response.json();
      if (payload?.message) {
        message = payload.message;
      }
    } catch {
      // Fall through to the default message.
    }

    throw new Error(message);
  }

  return response.json();
}

export function normalizeGitHubInput(rawInput) {
  const input = rawInput.trim();

  if (!input) {
    throw new Error('Enter a public GitHub repository URL.');
  }

  if (/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(input)) {
    return normalizeGitHubInput(`https://github.com/${input}`);
  }

  let url;

  try {
    url = new URL(input);
  } catch {
    throw new Error('Use a valid GitHub repository URL.');
  }

  if (!['github.com', 'www.github.com'].includes(url.hostname)) {
    throw new Error('Only public GitHub repositories are supported right now.');
  }

  const segments = url.pathname.split('/').filter(Boolean);

  if (segments.length < 2) {
    throw new Error('GitHub repository URLs must include both owner and repo.');
  }

  const owner = segments[0];
  const repo = segments[1].replace(/\.git$/i, '');
  let branch = '';
  let subPath = '';

  if (segments[2] === 'tree' && segments[3]) {
    branch = segments[3];
    subPath = decodeURIComponent(segments.slice(4).join('/'));
  }

  const canonicalRepoUrl = `https://github.com/${owner}/${repo}`;

  return {
    input,
    owner,
    repo,
    branch,
    subPath,
    canonicalRepoUrl,
  };
}

export async function fetchRepoSnapshot(normalized) {
  const repo = await fetchGitHubJson(`/repos/${normalized.owner}/${normalized.repo}`);
  const defaultBranch = normalized.branch || repo.default_branch;
  const languages = await fetchGitHubJson(`/repos/${normalized.owner}/${normalized.repo}/languages`);

  let readme = null;

  try {
    const readmeResponse = await fetchGitHubJson(
      `/repos/${normalized.owner}/${normalized.repo}/readme?ref=${encodeURIComponent(defaultBranch)}`
    );

    readme = {
      name: readmeResponse.name,
      path: readmeResponse.path,
      downloadUrl: readmeResponse.download_url,
      content: Buffer.from(readmeResponse.content || '', 'base64').toString('utf-8'),
    };
  } catch {
    readme = null;
  }

  return {
    repo,
    readme,
    languages,
    normalized: {
      ...normalized,
      branch: defaultBranch,
    },
  };
}
