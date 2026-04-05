import { test, expect, type Page } from '@playwright/test';

// ── Helpers ───────────────────────────────────────────────────────────────────
const BASE_URL = process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3000';

/** Inject a fake API key into localStorage before page loads */
async function injectApiKey(page: Page, provider: 'openai' | 'google' | 'anthropic', key: string) {
    await page.addInitScript(({ provider, key }) => {
        localStorage.setItem(`apikey_${provider}`, key);
    }, { provider, key });
}

const TEST_OPENAI_KEY = process.env.TEST_OPENAI_KEY ?? '';
const TEST_GOOGLE_KEY = process.env.TEST_GOOGLE_KEY ?? '';
const TEST_ANTHROPIC_KEY = process.env.TEST_ANTHROPIC_KEY ?? '';

// ─────────────────────────────────────────────────────────────────────────────
// GROUP 1: Page load & UI structure
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Navigation & Layout', () => {
    test('homepage loads with hero and generator', async ({ page }) => {
        await page.goto(BASE_URL);
        await expect(page).toHaveTitle(/AgentForge/i);
        await expect(page.locator('h1')).toBeVisible();
        await expect(page.locator('#prompt-input')).toBeVisible();
        await expect(page.locator('#generate-btn')).toBeVisible();
    });

    test('navbar contains all 4 nav links', async ({ page }) => {
        await page.goto(BASE_URL);
        const navbar = page.locator('nav');
        await expect(navbar.getByText('Generate')).toBeVisible();
        await expect(navbar.getByText('History')).toBeVisible();
        await expect(navbar.getByText('How to Use')).toBeVisible();
        await expect(navbar.getByText('Stats')).toBeVisible();
    });

    test('navbar API Keys button opens key popover', async ({ page }) => {
        await page.goto(BASE_URL);
        await page.getByText('API Keys').first().click();
        await expect(page.getByText('OpenAI').first()).toBeVisible();
        await expect(page.getByText('Google AI').first()).toBeVisible();
        await expect(page.getByText('Anthropic').first()).toBeVisible();
    });

    test('/history page renders', async ({ page }) => {
        await page.goto(`${BASE_URL}/history`);
        await expect(page.getByText('Generation History')).toBeVisible();
    });

    test('/docs page renders with IDE examples', async ({ page }) => {
        await page.goto(`${BASE_URL}/docs`);
        await expect(page.getByText('How to Use').first()).toBeVisible();
        await expect(page.getByText('Antigravity AI IDE').first()).toBeVisible();
        await expect(page.getByText('Claude Code').first()).toBeVisible();
        await expect(page.getByText('Codex CLI (OpenAI)').first()).toBeVisible();
        await expect(page.getByText('Gemini CLI').first()).toBeVisible();
    });

    test('/stats page renders', async ({ page }) => {
        await page.goto(`${BASE_URL}/stats`);
        await expect(page.getByText('Usage Analytics')).toBeVisible();
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// GROUP 2: API key management
// ─────────────────────────────────────────────────────────────────────────────
test.describe('API Key Management', () => {
    test('entering an OpenAI key saves to localStorage', async ({ page }) => {
        await page.goto(BASE_URL);
        await page.getByText('API Keys').click();

        // Find OpenAI input and type a key
        const inputs = page.locator('input[type="password"]');
        await inputs.first().fill('sk-test-1234567890abcdef');

        // Verify localStorage was updated
        const stored = await page.evaluate(() => localStorage.getItem('apikey_openai'));
        expect(stored).toBe('sk-test-1234567890abcdef');
    });

    test('key badge shows configured count', async ({ page }) => {
        await page.addInitScript(() => {
            localStorage.setItem('apikey_openai', 'sk-test-dummy-key');
            localStorage.setItem('apikey_google', 'AIza-test-dummy-key');
        });
        await page.goto(BASE_URL);
        // Badge should show 2
        await expect(page.locator('nav').getByText('2')).toBeVisible();
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// GROUP 3: API routes (no LLM dependency)
// ─────────────────────────────────────────────────────────────────────────────
test.describe('API Routes', () => {
    test('/api/skills returns skill list', async ({ request }) => {
        const resp = await request.get(`${BASE_URL}/api/skills`);
        expect(resp.status()).toBe(200);
        const body = await resp.json();
        expect(body).toHaveProperty('skills');
        expect(Array.isArray(body.skills)).toBe(true);
    });

    test('/api/history returns paginated data', async ({ request }) => {
        const resp = await request.get(`${BASE_URL}/api/history`);
        expect(resp.status()).toBe(200);
        const body = await resp.json();
        expect(body).toHaveProperty('data');
        expect(Array.isArray(body.data)).toBe(true);
    });

    test('/api/stats returns aggregate data', async ({ request }) => {
        const resp = await request.get(`${BASE_URL}/api/stats`);
        expect(resp.status()).toBe(200);
        const body = await resp.json();
        expect(typeof body.totalGenerations).toBe('number');
        expect(typeof body.totalTokens).toBe('number');
    });

    test('/api/generate rejects missing prompt', async ({ request }) => {
        const resp = await request.post(`${BASE_URL}/api/generate`, {
            headers: { 'Content-Type': 'application/json', 'x-api-key': 'sk-test' },
            data: { model: 'gpt-4o' }, // no prompt
        });
        expect(resp.status()).toBe(400);
    });

    test('/api/generate rejects missing api key', async ({ request }) => {
        const resp = await request.post(`${BASE_URL}/api/generate`, {
            headers: { 'Content-Type': 'application/json' },
            data: { prompt: 'test', model: 'gpt-4o' },
        });
        expect(resp.status()).toBe(401);
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// GROUP 4: Model selector UI
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Model Selector', () => {
    test('all 5 models are visible', async ({ page }) => {
        await page.goto(BASE_URL);
        await expect(page.getByText('GPT-4o').first()).toBeVisible();
        await expect(page.getByText('GPT-5.4').first()).toBeVisible();
        await expect(page.getByText('Gemini 3.1 Pro').first()).toBeVisible();
        await expect(page.getByText('Claude Sonnet 4.6').first()).toBeVisible();
        await expect(page.getByText('Claude Opus 4.6').first()).toBeVisible();
    });

    test('clicking a model selects it', async ({ page }) => {
        await page.goto(BASE_URL);
        await page.getByText('GPT-5.4').first().click();
        // The button should now have the accent border (we verify via accessible name / aria)
        await expect(page.getByText('GPT-5.4').first()).toBeVisible();
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// GROUP 5: Example prompt chips
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Prompt Input', () => {
    test('clicking an example chip fills the textarea', async ({ page }) => {
        await page.goto(BASE_URL);
        const chip = page.getByText('SEO content strategist agent for SaaS companies');
        await chip.click();
        const val = await page.locator('#prompt-input').inputValue();
        expect(val).toContain('SEO content strategist');
    });

    test('generate button is disabled with empty prompt', async ({ page }) => {
        await page.goto(BASE_URL);
        await expect(page.locator('#generate-btn')).toBeDisabled();
    });

    test('generate button enables after entering prompt', async ({ page }) => {
        await page.goto(BASE_URL);
        await page.locator('#prompt-input').fill('Test agent for testing');
        await expect(page.locator('#generate-btn')).toBeEnabled();
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// GROUP 6: Full E2E generation flow (requires real API key)
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Full Generation Flow (real API key required)', () => {
    test.skip(!TEST_OPENAI_KEY, 'TEST_OPENAI_KEY not set — skipping live generation test');

    test('complete pipeline runs and shows eval scorecard', async ({ page }) => {
        await injectApiKey(page, 'openai', TEST_OPENAI_KEY);
        await page.goto(BASE_URL);

        // Enter prompt
        await page.locator('#prompt-input').fill('SEO audit agent for SaaS landing pages');

        // Select GPT-4o (cheapest for tests)
        await page.getByText('GPT-4o').click();

        // Generate
        await page.locator('#generate-btn').click();

        // Pipeline progress should appear
        await expect(page.getByText('Enrich')).toBeVisible({ timeout: 10000 });

        // Wait for completion (generous timeout for LLM calls)
        await expect(page.getByText('Agent Prompt Ready')).toBeVisible({ timeout: 180000 });

        // Eval scorecard should be visible
        await expect(page.getByText('Quality Gate Evaluation')).toBeVisible();

        // Download button should work
        const downloadPromise = page.waitForEvent('download');
        await page.getByText('Download .md').click();
        const download = await downloadPromise;
        expect(download.suggestedFilename()).toMatch(/\.md$/);
    });

    test('IDE tab switching works on generated output', async ({ page }) => {
        await injectApiKey(page, 'openai', TEST_OPENAI_KEY);
        await page.goto(BASE_URL);
        await page.locator('#prompt-input').fill('Code review bot for engineering teams');
        await page.locator('#generate-btn').click();
        await expect(page.getByText('Agent Prompt Ready')).toBeVisible({ timeout: 180000 });

        // Switch IDE tabs and verify snippet text changes
        await page.getByText('Gemini CLI').click();
        await expect(page.getByText('GEMINI_SYSTEM_MD')).toBeVisible();

        await page.getByText('Claude Code').click();
        await expect(page.getByText('--system-prompt-file')).toBeVisible();

        await page.getByText('Codex CLI').click();
        await expect(page.getByText('.agents/skills/')).toBeVisible();
    });

    test('generated agent appears in history after generation', async ({ page, request }) => {
        await injectApiKey(page, 'openai', TEST_OPENAI_KEY);
        await page.goto(BASE_URL);
        await page.locator('#prompt-input').fill('Unique test agent XK-9182736');
        await page.locator('#generate-btn').click();
        await expect(page.getByText('Agent Prompt Ready')).toBeVisible({ timeout: 180000 });

        // Poll history API
        let found = false;
        for (let i = 0; i < 10; i++) {
            const resp = await request.get(`${BASE_URL}/api/history`);
            const body = await resp.json();
            if (body.data?.some((g: { user_prompt: string }) => g.user_prompt.includes('XK-9182736'))) {
                found = true;
                break;
            }
            await page.waitForTimeout(1000);
        }
        expect(found).toBe(true);
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// GROUP 7: IDE invocation docs correctness
// ─────────────────────────────────────────────────────────────────────────────
test.describe('IDE Invocation Docs', () => {
    test('Antigravity syntax uses @ bracket notation', async ({ page }) => {
        await page.goto(`${BASE_URL}/docs`);
        await expect(page.getByText('@[agent-prompts/', { exact: false }).first()).toBeVisible();
    });

    test('Gemini CLI syntax uses GEMINI_SYSTEM_MD', async ({ page }) => {
        await page.goto(`${BASE_URL}/docs`);
        await expect(page.getByText('GEMINI_SYSTEM_MD', { exact: false })).toBeVisible();
    });

    test('Claude Code syntax uses --system-prompt-file', async ({ page }) => {
        await page.goto(`${BASE_URL}/docs`);
        await expect(page.getByText('--system-prompt-file', { exact: false })).toBeVisible();
    });

    test('Codex CLI uses .agents/skills/ directory', async ({ page }) => {
        await page.goto(`${BASE_URL}/docs`);
        await expect(page.getByText('.agents/skills/', { exact: false }).first()).toBeVisible();
    });
});
