import { createClient } from '@supabase/supabase-js';

function getSupabaseUrl() {
  return (
    process.env.SUPABASE_URL ||
    process.env.VITE_SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    ''
  ).trim();
}

function getSupabaseServiceKey() {
  return (
    process.env.SUPABASE_SERVICE_KEY ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    ''
  ).trim();
}

let adminClient = null;

export function getAdminClient() {
  if (adminClient) {
    return adminClient;
  }

  const supabaseUrl = getSupabaseUrl();
  const serviceKey = getSupabaseServiceKey();

  if (!supabaseUrl || !serviceKey) {
    return null;
  }

  adminClient = createClient(supabaseUrl, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  return adminClient;
}

export async function insertGenerationRecord(record) {
  const client = getAdminClient();

  if (!client) {
    return false;
  }

  const { error } = await client.from('generations').insert(record);

  if (error) {
    console.error('AgentGenerator persistence skipped:', error.message);
    return false;
  }

  return true;
}

export async function listGenerationRecords({ page = 1, pageSize = 20 } = {}) {
  const client = getAdminClient();

  if (!client) {
    return { data: [], total: 0, page, pageSize };
  }

  const offset = (page - 1) * pageSize;
  const { data, error, count } = await client
    .from('generations')
    .select(
      'id, created_at, user_prompt, model_used, tokens_consumed, skills_selected, eval_scores',
      { count: 'estimated' }
    )
    .order('created_at', { ascending: false })
    .range(offset, offset + pageSize - 1);

  if (error) {
    console.error('AgentGenerator history fallback:', error.message);
    return { data: [], total: 0, page, pageSize };
  }

  return {
    data: data || [],
    total: count || 0,
    page,
    pageSize,
  };
}

export async function getGenerationStats() {
  const client = getAdminClient();

  if (!client) {
    return {
      totalGenerations: 0,
      totalTokens: 0,
      avgScore: 0,
      byModel: {},
    };
  }

  const { data, error } = await client
    .from('generations')
    .select('model_used, tokens_consumed, eval_scores');

  if (error) {
    console.error('AgentGenerator stats fallback:', error.message);
    return {
      totalGenerations: 0,
      totalTokens: 0,
      avgScore: 0,
      byModel: {},
    };
  }

  const rows = data || [];
  const totalGenerations = rows.length;
  const totalTokens = rows.reduce((sum, row) => sum + (row.tokens_consumed || 0), 0);
  const avgScore =
    totalGenerations > 0
      ? Math.round(
          rows.reduce(
            (sum, row) => sum + (Number(row.eval_scores?.overall) || 0),
            0
          ) / totalGenerations
        )
      : 0;

  const byModel = rows.reduce((accumulator, row) => {
    if (!accumulator[row.model_used]) {
      accumulator[row.model_used] = { count: 0, tokens: 0 };
    }

    accumulator[row.model_used].count += 1;
    accumulator[row.model_used].tokens += row.tokens_consumed || 0;
    return accumulator;
  }, {});

  return {
    totalGenerations,
    totalTokens,
    avgScore,
    byModel,
  };
}
