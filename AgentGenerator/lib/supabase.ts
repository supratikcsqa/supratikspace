import { createClient } from '@supabase/supabase-js';

export interface EvalScores {
  signal_density: number;
  cognitive_arch: number;
  anti_pattern: number;
  skill_precision: number;
  overall: number;
}

export interface Generation {
  id: string;
  created_at: string;
  user_ip: string | null;
  user_prompt: string;
  model_used: string;
  tokens_consumed: number;
  skills_selected: string[];
  agent_output: string | null;
  eval_scores: EvalScores | null;
  phase_log: PhaseLog[];
}

export interface PhaseLog {
  phase: string;
  content: string;
  timestamp: string;
}

function getSupabaseUrl() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL is not set');
  }

  return supabaseUrl;
}

function getSupabaseAnonKey() {
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseAnonKey) {
    throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY is not set');
  }

  return supabaseAnonKey;
}

let browserClient: ReturnType<typeof createClient> | null = null;

export function getBrowserClient() {
  if (!browserClient) {
    browserClient = createClient(getSupabaseUrl(), getSupabaseAnonKey());
  }

  return browserClient;
}

export function createAdminClient() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set');
  }

  return createClient(getSupabaseUrl(), serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
