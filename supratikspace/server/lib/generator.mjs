import crypto from 'node:crypto';

function stripMarkdown(markdown) {
  return markdown
    .replace(/<[^>]*>/g, ' ')
    .replace(/!\[[^\]]*]\([^)]*\)/g, '')
    .replace(/\[([^\]]+)]\([^)]*\)/g, '$1')
    .replace(/`{1,3}[^`]*`{1,3}/g, '')
    .replace(/^>\s?/gm, '')
    .replace(/[*_~#>-]/g, ' ')
    .replace(/\|/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function isUsefulLead(text) {
  if (text.length < 40 || text.length > 220) {
    return false;
  }

  const alphaCount = (text.match(/[a-z]/gi) || []).length;
  const digitCount = (text.match(/\d/g) || []).length;

  if (alphaCount < 25) {
    return false;
  }

  if (digitCount > alphaCount * 0.2) {
    return false;
  }

  return !/rank|balance|income|cost|pay rate|avg quality/i.test(text);
}

function splitMarkdownSections(markdown) {
  const matches = [...markdown.matchAll(/^##+\s+(.+)$/gm)];

  if (matches.length === 0) {
    return [];
  }

  return matches.map((match, index) => {
    const title = match[1].trim();
    const start = match.index + match[0].length;
    const end = index < matches.length - 1 ? matches[index + 1].index : markdown.length;
    const content = markdown.slice(start, end).trim();

    return {
      title,
      content,
    };
  });
}

function extractLeadParagraphs(markdown) {
  const candidates = markdown
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean)
    .filter((block) => !block.startsWith('#'))
    .filter((block) => !block.startsWith('!['))
    .filter((block) => !block.startsWith('<'))
    .filter((block) => !block.startsWith('[!['));

  return candidates.slice(0, 4).map(stripMarkdown).filter(isUsefulLead).slice(0, 2);
}

function extractBullets(markdown) {
  return markdown
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => /^[-*+]\s+/.test(line))
    .map((line) => stripMarkdown(line.replace(/^[-*+]\s+/, '')))
    .filter((line) => line.length > 10)
    .slice(0, 6);
}

function extractQuickstart(markdown) {
  const fencedBlocks = [...markdown.matchAll(/```(?:bash|sh|shell|zsh)?\n([\s\S]*?)```/g)];

  for (const block of fencedBlocks) {
    const commands = block[1]
      .split('\n')
      .map((line) => line.trim().replace(/^\$\s*/, ''))
      .filter(Boolean)
      .filter((line) => /^(npm|pnpm|yarn|bun|npx|node|python|pip|conda|git|\.\/|source|uv)\b/i.test(line))
      .slice(0, 6);

    if (commands.length > 0) {
      return commands;
    }
  }

  return [];
}

function buildLanguageBreakdown(languages) {
  const entries = Object.entries(languages);

  if (entries.length === 0) {
    return [];
  }

  const total = entries.reduce((sum, [, value]) => sum + value, 0);

  return entries
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([name, value]) => ({
      name,
      share: Math.round((value / total) * 100),
    }));
}

function buildHighlights(snapshot, languageBreakdown) {
  const topics = snapshot.repo.topics || [];
  const highlights = [];

  if (topics.length > 0) {
    highlights.push({
      title: 'Built Around Clear Themes',
      description: `Tagged around ${topics.slice(0, 4).join(', ')} so visitors understand the project fast.`,
    });
  }

  if (languageBreakdown.length > 0) {
    highlights.push({
      title: 'Grounded In The Actual Stack',
      description: `The page reflects the repository's real implementation, led by ${languageBreakdown
        .map((item) => `${item.name} (${item.share}%)`)
        .join(', ')}.`,
    });
  }

  highlights.push({
    title: 'Shareable By Default',
    description: 'A repo link becomes a cleaner page with quick context, proof signals, and a better first read.',
  });

  return highlights.slice(0, 3);
}

function buildReadmeSections(markdown) {
  return splitMarkdownSections(markdown)
    .map((section) => {
      const bullets = extractBullets(section.content).slice(0, 4);
      const body = section.content
        .split(/\n{2,}/)
        .map((block) => stripMarkdown(block))
        .find((block) => block.length > 40);

      const fallbackBody = /quickstart|install|usage/i.test(section.title)
        ? 'See the quickstart commands above for the fastest credible path into the repository.'
        : '';

      return {
        title: section.title,
        body: body || fallbackBody,
        bullets,
      };
    })
    .filter((section) => section.body || section.bullets.length > 0)
    .slice(0, 5);
}

export function createPageSlug(normalized) {
  const base = `${normalized.owner}-${normalized.repo}`
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 36);
  const hash = crypto.createHash('sha1').update(normalized.input).digest('hex').slice(0, 6);

  return `${base}-${hash}`;
}

export function buildLaunchPage(snapshot) {
  const normalized = snapshot.normalized;
  const slug = createPageSlug(normalized);
  const markdown = snapshot.readme?.content || '';
  const leadParagraphs = extractLeadParagraphs(markdown);
  const bulletFeatures = extractBullets(markdown);
  const quickstart = extractQuickstart(markdown);
  const languageBreakdown = buildLanguageBreakdown(snapshot.languages);
  const readmeSections = buildReadmeSections(markdown);
  const description =
    snapshot.repo.description ||
    leadParagraphs[0] ||
    'A public GitHub project turned into a cleaner launch page.';

  const tagline =
    leadParagraphs[0] ||
    description ||
    `Launch the ${snapshot.repo.name} repository with a cleaner first impression.`;

  return {
    slug,
    generatedAt: new Date().toISOString(),
    source: {
      owner: normalized.owner,
      repo: normalized.repo,
      repoUrl: normalized.canonicalRepoUrl,
      branch: normalized.branch,
      subPath: normalized.subPath,
      homepage: snapshot.repo.homepage || '',
      stars: snapshot.repo.stargazers_count,
      forks: snapshot.repo.forks_count,
      watchers: snapshot.repo.subscribers_count,
      openIssues: snapshot.repo.open_issues_count,
    },
    hero: {
      title: snapshot.repo.name,
      tagline,
      description,
      topics: snapshot.repo.topics || [],
    },
    metrics: [
      { label: 'Stars', value: `${snapshot.repo.stargazers_count}` },
      { label: 'Forks', value: `${snapshot.repo.forks_count}` },
      { label: 'Watchers', value: `${snapshot.repo.subscribers_count}` },
      { label: 'Issues', value: `${snapshot.repo.open_issues_count}` },
    ],
    languageBreakdown,
    highlights: buildHighlights(snapshot, languageBreakdown),
    features:
      bulletFeatures.length > 0
        ? bulletFeatures
        : [
            'Built from a real public repository, not a blank page.',
            'Includes project signals like stars, stack, and source links.',
            'Ready to share as a cleaner launch surface for the repo.',
          ],
    quickstart,
    readmeSections,
    readmeLead: leadParagraphs,
  };
}
