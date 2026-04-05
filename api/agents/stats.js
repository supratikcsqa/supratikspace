import { getStatsSnapshot } from '../../server/lib/agent-generator/service.mjs';

export default async function handler(_request, response) {
  try {
    response.status(200).json(await getStatsSnapshot());
  } catch (error) {
    response.status(500).json({
      error: error instanceof Error ? error.message : 'Stats could not be loaded.',
    });
  }
}
