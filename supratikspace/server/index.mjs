import express from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildLaunchPage } from './lib/generator.mjs';
import { fetchRepoSnapshot, normalizeGitHubInput } from './lib/github.mjs';
import { readGeneratedPage, saveGeneratedPage } from './lib/storage.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const port = Number(process.env.PORT || 3001);
const ROOT_HOSTS = new Set(['localhost', '127.0.0.1', 'supratik.space', 'www.supratik.space']);

app.use(express.json({ limit: '1mb' }));

function getBaseUrl(request) {
  const proto = request.headers['x-forwarded-proto'] || request.protocol || 'http';
  return `${proto}://${request.get('host')}`;
}

function buildLaunchUrls(request, slug) {
  const baseUrl = getBaseUrl(request);
  const host = request.get('host') || '';
  const hostName = host.split(':')[0];
  const launchPath = `/launch/${slug}`;

  return {
    previewUrl: `${baseUrl}${launchPath}`,
    subdomainUrl: ROOT_HOSTS.has(hostName) ? `https://${slug}.supratik.space` : `${baseUrl}${launchPath}`,
  };
}

app.get('/api/health', (_request, response) => {
  response.json({ ok: true });
});

app.post('/api/pages/preview', async (request, response) => {
  const repoUrl = `${request.body?.repoUrl || ''}`;

  try {
    const normalized = normalizeGitHubInput(repoUrl);
    const snapshot = await fetchRepoSnapshot(normalized);
    const page = buildLaunchPage(snapshot);
    const urls = buildLaunchUrls(request, page.slug);
    const storedPage = {
      ...page,
      urls,
    };

    await saveGeneratedPage(storedPage);

    response.status(201).json({
      slug: storedPage.slug,
      previewUrl: storedPage.urls.previewUrl,
      subdomainUrl: storedPage.urls.subdomainUrl,
      page: storedPage,
    });
  } catch (error) {
    response.status(400).json({
      error: error instanceof Error ? error.message : 'Preview generation failed.',
    });
  }
});

app.get('/api/pages/:slug', async (request, response) => {
  try {
    const page = await readGeneratedPage(request.params.slug);
    response.json(page);
  } catch {
    response.status(404).json({
      error: 'Generated page not found.',
    });
  }
});

const distPath = path.resolve(__dirname, '..', 'dist');

if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (_request, response) => {
    response.sendFile(path.join(distPath, 'index.html'));
  });
}

app.listen(port, () => {
  console.log(`Repo launch API running on http://localhost:${port}`);
});
