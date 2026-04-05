import fs from 'node:fs';
import path from 'node:path';

const CORE_DIR = path.resolve(process.cwd(), 'AgentGenerator', 'core');
const SKILLS_DIR = path.join(CORE_DIR, 'skills');

export function getCoreDir() {
  return CORE_DIR;
}

export function readCoreFile(relativePath) {
  const fullPath = path.join(CORE_DIR, relativePath);

  if (!fs.existsSync(fullPath)) {
    return '';
  }

  return fs.readFileSync(fullPath, 'utf-8');
}

export function listLocalSkills() {
  if (!fs.existsSync(SKILLS_DIR)) {
    return [];
  }

  return fs
    .readdirSync(SKILLS_DIR)
    .filter((fileName) => fileName.endsWith('.md'))
    .map((fileName) => {
      const content = fs.readFileSync(path.join(SKILLS_DIR, fileName), 'utf-8');
      const descriptionMatch =
        content.match(/^description:\s*(.+)$/m) ||
        content.match(/^## Purpose\s+([\s\S]*?)(?:\n## |\n# |$)/m);

      return {
        name: fileName.replace(/\.md$/i, ''),
        description: (descriptionMatch?.[1] || fileName.replace(/\.md$/i, '')).trim(),
      };
    });
}
