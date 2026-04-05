#!/usr/bin/env node
/**
 * AgentForge — Pre-flight Setup Script
 * 
 * Run before tests: npx tsx tests/setup.ts
 * 
 * This script:
 * 1. Validates all required environment variables exist
 * 2. Tests Supabase connectivity and schema
 * 3. Creates .env.local from template if missing
 * 4. Reports which API keys are configured for testing
 */

import * as fs from 'fs';
import * as path from 'path';

const ROOT = path.join(__dirname, '..');
const ENV_FILE = path.join(ROOT, '.env.local');
const ENV_TEMPLATE = path.join(ROOT, '.env.local.template');

// ── ANSI colours ──────────────────────────────────────────────────────────────
const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const CYAN = '\x1b[36m';
const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';

const ok = (msg: string) => console.log(`${GREEN}✓${RESET} ${msg}`);
const fail = (msg: string) => console.log(`${RED}✗${RESET} ${msg}`);
const warn = (msg: string) => console.log(`${YELLOW}⚠${RESET} ${msg}`);
const info = (msg: string) => console.log(`${CYAN}→${RESET} ${msg}`);

async function main() {
    console.log(`\n${BOLD}AgentForge — Pre-flight Setup${RESET}\n${'─'.repeat(40)}\n`);

    let hasErrors = false;

    // ── 1. Check / create .env.local ───────────────────────────────────────────
    if (!fs.existsSync(ENV_FILE)) {
        if (fs.existsSync(ENV_TEMPLATE)) {
            fs.copyFileSync(ENV_TEMPLATE, ENV_FILE);
            warn('.env.local not found — copied from template. Fill in your values:');
            info(`  ${ENV_FILE}`);
            hasErrors = true;
        } else {
            fail('.env.local and .env.local.template both missing!');
            hasErrors = true;
        }
    } else {
        ok('.env.local exists');
    }

    // ── 2. Load env vars ───────────────────────────────────────────────────────
    const envContent = fs.existsSync(ENV_FILE) ? fs.readFileSync(ENV_FILE, 'utf-8') : '';
    function getEnv(key: string): string | undefined {
        const match = envContent.match(new RegExp(`^${key}=(.+)$`, 'm'));
        return match?.[1]?.trim().replace(/^['"]|['"]$/g, '');
    }

    // ── 3. Validate Supabase vars ──────────────────────────────────────────────
    console.log(`\n${BOLD}Supabase${RESET}`);
    const supabaseUrl = getEnv('NEXT_PUBLIC_SUPABASE_URL') ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnon = getEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY') ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const supabaseService = getEnv('SUPABASE_SERVICE_ROLE_KEY') ?? process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || supabaseUrl.includes('your-project')) {
        fail('NEXT_PUBLIC_SUPABASE_URL is not set');
        info('  Create a project at https://supabase.com, then copy the URL from Settings → API');
        hasErrors = true;
    } else {
        ok(`NEXT_PUBLIC_SUPABASE_URL: ${supabaseUrl}`);
    }

    if (!supabaseAnon || supabaseAnon === 'your-anon-key') {
        fail('NEXT_PUBLIC_SUPABASE_ANON_KEY is not set');
        hasErrors = true;
    } else {
        ok('NEXT_PUBLIC_SUPABASE_ANON_KEY: set');
    }

    if (!supabaseService || supabaseService === 'your-service-role-key') {
        fail('SUPABASE_SERVICE_ROLE_KEY is not set');
        hasErrors = true;
    } else {
        ok('SUPABASE_SERVICE_ROLE_KEY: set');
    }

    // ── 4. Test Supabase connection + schema ─────────────────────────────────
    if (supabaseUrl && !supabaseUrl.includes('your-project') && supabaseAnon) {
        console.log(`\n${BOLD}Supabase Connectivity${RESET}`);
        try {
            const { createClient } = await import('@supabase/supabase-js');
            const client = createClient(supabaseUrl, supabaseAnon);
            const { error } = await client.from('generations').select('id').limit(1);
            if (error) {
                if (error.message.includes('does not exist')) {
                    fail('Table "generations" not found. Run the schema migration:');
                    info(`  Open Supabase SQL Editor and paste: ${ROOT}/supabase/schema.sql`);
                    hasErrors = true;
                } else {
                    fail(`Supabase query error: ${error.message}`);
                    hasErrors = true;
                }
            } else {
                ok('Supabase connection OK — "generations" table exists');
            }
        } catch (err) {
            fail(`Supabase check failed: ${(err as Error).message}`);
            hasErrors = true;
        }
    }

    // ── 5. Check API keys (informational only) ────────────────────────────────
    console.log(`\n${BOLD}LLM API Keys (for Playwright tests)${RESET}`);
    const testKeys = {
        openai: getEnv('TEST_OPENAI_KEY') ?? process.env.TEST_OPENAI_KEY,
        google: getEnv('TEST_GOOGLE_KEY') ?? process.env.TEST_GOOGLE_KEY,
        anthropic: getEnv('TEST_ANTHROPIC_KEY') ?? process.env.TEST_ANTHROPIC_KEY,
    };

    let hasAtLeastOneKey = false;
    for (const [provider, key] of Object.entries(testKeys)) {
        if (key && key.length > 10) {
            ok(`TEST_${provider.toUpperCase()}_KEY: set (tests will inject this)`);
            hasAtLeastOneKey = true;
        } else {
            warn(`TEST_${provider.toUpperCase()}_KEY: not set (skip ${provider} tests)`);
        }
    }

    if (!hasAtLeastOneKey) {
        warn('No test API keys set. Add TEST_OPENAI_KEY / TEST_GOOGLE_KEY / TEST_ANTHROPIC_KEY to .env.local');
        info('  Tests will be limited to UI and API-key-free routes');
    }

    // ── 6. Check core files ───────────────────────────────────────────────────
    console.log(`\n${BOLD}Core Pipeline Files${RESET}`);
    const required = [
        'core/research/agentic-skills-research.md',
        'core/prompts/meta-agent-input-enricher-agent-prompt.md',
        'core/prompts/meta-agent-architect-prompt.md',
    ];
    for (const f of required) {
        const full = path.join(ROOT, f);
        if (fs.existsSync(full)) {
            ok(f);
        } else {
            fail(`Missing: ${f}`);
            hasErrors = true;
        }
    }

    // ── Summary ────────────────────────────────────────────────────────────────
    console.log(`\n${'─'.repeat(40)}`);
    if (hasErrors) {
        console.log(`${RED}${BOLD}Setup incomplete. Fix the issues above before running tests.${RESET}\n`);
        process.exit(1);
    } else {
        console.log(`${GREEN}${BOLD}All checks passed! Run tests with: npm run test:e2e${RESET}\n`);
    }
}

main().catch((e) => { console.error(e); process.exit(1); });
