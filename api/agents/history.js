import { getHistoryPage } from '../../server/lib/agent-generator/service.mjs';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Number.parseInt(searchParams.get('page') || '1', 10) || 1;

    return Response.json(await getHistoryPage({ page }));
  } catch (error) {
    return Response.json(
      {
        error: error instanceof Error ? error.message : 'History could not be loaded.',
      },
      { status: 500 }
    );
  }
}
