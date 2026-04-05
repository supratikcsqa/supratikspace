import { getSkillsCatalog } from '../../server/lib/agent-generator/service.mjs';

export default async function handler(_request, response) {
  try {
    response.status(200).json(await getSkillsCatalog());
  } catch (error) {
    response.status(500).json({
      error: error instanceof Error ? error.message : 'Skills could not be loaded.',
    });
  }
}
