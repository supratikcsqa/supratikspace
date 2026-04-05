import { NextRequest } from 'next/server';
import { runPipeline } from '../../../../lib/pipeline';
import { createAdminClient } from '../../../../lib/supabase';
import type { ModelId } from '../../../../lib/models';
import type { EvalScores, PhaseLog } from '../../../../lib/supabase';

export const runtime = 'nodejs';
export const maxDuration = 300;

export async function POST(req: NextRequest) {
    const body = await req.json();
    const { prompt, model } = body as { prompt: string; model: ModelId };
    const apiKey = req.headers.get('x-api-key') ?? '';

    if (!prompt || !model) {
        return new Response(JSON.stringify({ error: 'Missing prompt or model' }), { status: 400 });
    }
    if (!apiKey) {
        return new Response(JSON.stringify({ error: 'Missing x-api-key header' }), { status: 401 });
    }

    const userIp =
        req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
        req.headers.get('x-real-ip') ??
        'unknown';

    // Collect results for Supabase persistence
    let agentOutput = '';
    let evalScores: EvalScores | null = null;
    let totalTokens = 0;
    const skills: string[] = [];
    const phaseLogs: PhaseLog[] = [];

    const encoder = new TextEncoder();

    const stream = new ReadableStream({
        async start(controller) {
            try {
                for await (const event of runPipeline(prompt, model, apiKey)) {
                    // Forward event as SSE
                    const data = `data: ${JSON.stringify(event)}\n\n`;
                    controller.enqueue(encoder.encode(data));

                    // Collect for persistence
                    if (event.type === 'agent_output' && event.agentOutput) {
                        agentOutput = event.agentOutput;
                        totalTokens = event.totalTokens ?? 0;
                    }
                    if (event.type === 'eval_scores' && event.scores) {
                        evalScores = event.scores;
                    }
                    if (event.type === 'skills_found' && event.skills) {
                        skills.push(...event.skills);
                    }
                    if (event.type === 'phase_output' && event.phase && event.content) {
                        phaseLogs.push({
                            phase: event.phase,
                            content: event.content,
                            timestamp: new Date().toISOString(),
                        });
                    }
                    if (event.type === 'done') {
                        // Persist to Supabase
                        try {
                            const adminClient = createAdminClient();
                            await adminClient.from('generations').insert({
                                user_ip: userIp,
                                user_prompt: prompt,
                                model_used: model,
                                tokens_consumed: totalTokens,
                                skills_selected: skills,
                                agent_output: agentOutput,
                                eval_scores: evalScores,
                                phase_log: phaseLogs,
                            });
                        } catch (dbErr) {
                            console.error('Supabase insert failed:', dbErr);
                        }
                    }
                }
            } catch (err) {
                const errEvent = { type: 'error', error: (err as Error).message };
                controller.enqueue(encoder.encode(`data: ${JSON.stringify(errEvent)}\n\n`));
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
