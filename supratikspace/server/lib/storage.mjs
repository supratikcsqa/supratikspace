import fs from 'node:fs/promises';
import path from 'node:path';

const DATA_DIR = path.resolve(process.cwd(), 'server', 'data', 'pages');

async function ensureDataDir() {
  await fs.mkdir(DATA_DIR, { recursive: true });
}

export async function saveGeneratedPage(page) {
  await ensureDataDir();
  const filePath = path.join(DATA_DIR, `${page.slug}.json`);
  await fs.writeFile(filePath, JSON.stringify(page, null, 2), 'utf-8');
}

export async function readGeneratedPage(slug) {
  await ensureDataDir();
  const filePath = path.join(DATA_DIR, `${slug}.json`);
  const content = await fs.readFile(filePath, 'utf-8');

  return JSON.parse(content);
}
