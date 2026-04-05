import { getHistoryPage } from '../../server/lib/agent-generator/service.mjs';

export default async function handler(request, response) {
  try {
    const page = Number.parseInt(`${request.query?.page || '1'}`, 10) || 1;

    response.status(200).json(await getHistoryPage({ page }));
  } catch (error) {
    response.status(500).json({
      error: error instanceof Error ? error.message : 'History could not be loaded.',
    });
  }
}
