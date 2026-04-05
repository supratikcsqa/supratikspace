import { NextResponse } from 'next/server';
import { createAdminClient } from '../../../../lib/supabase';

export const runtime = 'nodejs';

export async function GET() {
    try {
        const adminClient = createAdminClient();

        const { data, error } = await adminClient
            .from('generations')
            .select('model_used, tokens_consumed, eval_scores, created_at');

        if (error) throw error;

        const totalGenerations = data.length;
        const totalTokens = data.reduce((sum, r) => sum + (r.tokens_consumed ?? 0), 0);
        const avgScore =
            data.length > 0
                ? Math.round(
                    data.reduce((sum, r) => sum + ((r.eval_scores as { overall?: number })?.overall ?? 0), 0) /
                    data.length,
                )
                : 0;

        // Group by model
        const byModel: Record<string, { count: number; tokens: number }> = {};
        for (const row of data) {
            if (!byModel[row.model_used]) byModel[row.model_used] = { count: 0, tokens: 0 };
            byModel[row.model_used].count += 1;
            byModel[row.model_used].tokens += row.tokens_consumed ?? 0;
        }

        return NextResponse.json({ totalGenerations, totalTokens, avgScore, byModel });
    } catch (err) {
        return NextResponse.json({ error: (err as Error).message }, { status: 500 });
    }
}
