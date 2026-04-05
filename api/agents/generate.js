import { streamGeneration } from '../../server/lib/agent-generator/service.mjs';

export async function POST(request) {
  let body = {};

  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const prompt = `${body?.prompt || ''}`.trim();
  const model = `${body?.model || ''}`.trim();
  const apiKey = `${request.headers.get('x-api-key') || ''}`.trim();

  if (!prompt || !model) {
    return Response.json({ error: 'Missing prompt or model.' }, { status: 400 });
  }

  if (!apiKey) {
    return Response.json({ error: 'Missing x-api-key header.' }, { status: 401 });
  }

  const userIp =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown';

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      try {
        await streamGeneration({
          prompt,
          model,
          apiKey,
          userIp,
          writeEvent: async (event) => {
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify(event)}\n\n`)
            );
          },
        });
      } catch (error) {
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({
              type: 'error',
              error: error instanceof Error ? error.message : 'Generation failed.',
            })}\n\n`
          )
        );
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}
