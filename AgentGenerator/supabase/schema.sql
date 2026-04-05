-- Agent Forge — Supabase Schema
-- Run this in Supabase SQL Editor to create the required tables

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Generations table: stores every agent generation run
CREATE TABLE IF NOT EXISTS generations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  user_ip TEXT,
  user_prompt TEXT NOT NULL,
  model_used TEXT NOT NULL,
  tokens_consumed INTEGER DEFAULT 0,
  skills_selected JSONB DEFAULT '[]'::jsonb,
  agent_output TEXT,
  eval_scores JSONB DEFAULT '{}'::jsonb,
  phase_log JSONB DEFAULT '[]'::jsonb
);

-- Index for fast history queries
CREATE INDEX IF NOT EXISTS idx_generations_created_at ON generations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_generations_model_used ON generations(model_used);

-- Stats view for the dashboard
CREATE OR REPLACE VIEW generation_stats AS
  SELECT
    COUNT(*) AS total_generations,
    SUM(tokens_consumed) AS total_tokens,
    AVG((eval_scores->>'overall')::numeric) AS avg_eval_score,
    model_used,
    COUNT(*) AS model_count
  FROM generations
  GROUP BY model_used;

-- Row Level Security (RLS) — allow anon inserts and selects
ALTER TABLE generations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anon select" ON generations
  FOR SELECT USING (true);

CREATE POLICY "Allow anon insert" ON generations
  FOR INSERT WITH CHECK (true);
