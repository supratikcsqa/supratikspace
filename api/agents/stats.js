import { getStatsSnapshot } from '../../server/lib/agent-generator/service.mjs';

export async function GET() {
  try {
    return Response.json(await getStatsSnapshot());
  } catch (error) {
    return Response.json(
      {
        error: error instanceof Error ? error.message : 'Stats could not be loaded.',
      },
      { status: 500 }
    );
  }
}
