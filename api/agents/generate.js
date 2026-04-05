import { streamGeneration } from '../../server/lib/agent-generator/service.mjs';

export default async function handler(request, response) {
  const body = request.body || {};
  const prompt = `${body?.prompt || ''}`.trim();
  const model = `${body?.model || ''}`.trim();
  const apiKey = `${request.headers['x-api-key'] || ''}`.trim();

  if (!prompt || !model) {
    response.status(400).json({ error: 'Missing prompt or model.' });
    return;
  }

  if (!apiKey) {
    response.status(401).json({ error: 'Missing x-api-key header.' });
    return;
  }

  const userIp =
    `${request.headers['x-forwarded-for'] || ''}`.split(',')[0]?.trim() ||
    `${request.headers['x-real-ip'] || ''}`.trim() ||
    'unknown';

  response.setHeader('Content-Type', 'text/event-stream');
  response.setHeader('Cache-Control', 'no-cache');
  response.setHeader('Connection', 'keep-alive');
  response.setHeader('X-Accel-Buffering', 'no');

  try {
    await streamGeneration({
      prompt,
      model,
      apiKey,
      userIp,
      writeEvent: async (event) => {
        response.write(`data: ${JSON.stringify(event)}\n\n`);
      },
    });
  } catch (error) {
    response.write(
      `data: ${JSON.stringify({
        type: 'error',
        error: error instanceof Error ? error.message : 'Generation failed.',
      })}\n\n`
    );
  } finally {
    response.end();
  }
}
