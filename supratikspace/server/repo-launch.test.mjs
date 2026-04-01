import test from 'node:test';
import assert from 'node:assert/strict';
import { buildLaunchPage, createPageSlug } from './lib/generator.mjs';
import { normalizeGitHubInput } from './lib/github.mjs';

test('normalizeGitHubInput parses tree URLs', () => {
  const parsed = normalizeGitHubInput('https://github.com/vercel/next.js/tree/canary/examples/with-supabase');

  assert.equal(parsed.owner, 'vercel');
  assert.equal(parsed.repo, 'next.js');
  assert.equal(parsed.branch, 'canary');
  assert.equal(parsed.subPath, 'examples/with-supabase');
});

test('createPageSlug is deterministic for the same repo input', () => {
  const normalized = normalizeGitHubInput('https://github.com/facebook/react');

  assert.equal(createPageSlug(normalized), createPageSlug(normalized));
});

test('buildLaunchPage extracts quickstart commands and README sections', () => {
  const page = buildLaunchPage({
    normalized: normalizeGitHubInput('https://github.com/acme/rocket'),
    repo: {
      name: 'rocket',
      description: 'Launch code faster.',
      homepage: '',
      topics: ['automation', 'launch'],
      stargazers_count: 42,
      forks_count: 9,
      subscribers_count: 4,
      open_issues_count: 2,
    },
    languages: {
      TypeScript: 300,
      CSS: 100,
    },
    readme: {
      content: `# Rocket

Launch code faster.

- Automates release notes
- Publishes cleaner previews

## Quickstart

\`\`\`bash
npm install
npm run dev
\`\`\`

## Why it matters

The project helps teams ship with less setup friction.
`,
    },
  });

  assert.deepEqual(page.quickstart, ['npm install', 'npm run dev']);
  assert.equal(page.readmeSections[0].title, 'Quickstart');
  assert.equal(page.highlights.length > 0, true);
});
