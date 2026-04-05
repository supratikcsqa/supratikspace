import { getSkillsCatalog } from '../../server/lib/agent-generator/service.mjs';

export async function GET() {
  try {
    return Response.json(await getSkillsCatalog());
  } catch (error) {
    return Response.json(
      {
        error: error instanceof Error ? error.message : 'Skills could not be loaded.',
      },
      { status: 500 }
    );
  }
}
