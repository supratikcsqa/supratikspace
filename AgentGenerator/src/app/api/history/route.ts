import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '../../../../lib/supabase';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') ?? '1', 10);
    const pageSize = 20;
    const offset = (page - 1) * pageSize;

    try {
        const adminClient = createAdminClient();
        const { data, error, count } = await adminClient
            .from('generations')
            .select('id, created_at, user_prompt, model_used, tokens_consumed, skills_selected, eval_scores', { count: 'estimated' })
            .order('created_at', { ascending: false })
            .range(offset, offset + pageSize - 1);

        if (error) throw error;

        return NextResponse.json({ data, total: count, page, pageSize });
    } catch (err) {
        return NextResponse.json({ error: (err as Error).message }, { status: 500 });
    }
}
