import puppeteer from 'puppeteer';

(async () => {
    console.log('🚀 Starting WebMCP Verification Test...');
    let browser;
    try {
        browser = await puppeteer.launch({
            headless: 'new',
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
        });

        const page = await browser.newPage();

        // Listen for console logs from the page
        page.on('console', msg => {
            if (msg.text().includes('[WebMCP]')) {
                console.log(`[Browser]: ${msg.text()}`);
            }
        });

        console.log('⏳ Navigating to localhost:5173...');
        await page.goto('http://localhost:5173', { waitUntil: 'networkidle0', timeout: 30000 });

        console.log('✅ Page loaded. Verifying window.__webmcp_rpc...');

        // Test 1: Global Dispatcher Exists
        const rpcExists = await page.evaluate(() => {
            return !!window.__webmcp_rpc;
        });

        if (!rpcExists) {
            throw new Error('❌ window.__webmcp_rpc is UNDEFINED. Provider did not mount correctly.');
        }
        console.log('✅ window.__webmcp_rpc is accessible.');

        // Test 2: Tool Discovery
        console.log('⏳ Testing tool discovery...');
        const discoveryResult = await page.evaluate(() => {
            return window.__webmcp_rpc.listTools();
        });

        if (!Array.isArray(discoveryResult) || discoveryResult.length !== 14) {
            throw new Error(`❌ Tool discovery failed. Expected 14 tools, got ${discoveryResult ? discoveryResult.length : 0}`);
        }
        console.log(`✅ Discovery successful. Found ${discoveryResult.length} tools.`);
        console.log(`   Tools include: ${discoveryResult.slice(0, 3).map(t => t.name).join(', ')}...`);

        // Test 3: Execute a Tool (list_agents)
        console.log('⏳ Testing tool execution (list_agents)...');
        const executeResult = await page.evaluate(async () => {
            return await window.__webmcp_rpc.execute('list_agents', {});
        });

        if (!executeResult.success) {
            throw new Error(`❌ Tool execution failed: ${executeResult.error}`);
        }
        console.log(`✅ Execution successful. Found ${executeResult.data?.count} agents in the fleet.`);

        // Test 4: Verify Auth Rejection
        console.log('⏳ Testing auth boundary (add_agent)...');
        const authResult = await page.evaluate(async () => {
            return await window.__webmcp_rpc.execute('add_agent', {
                name: 'Test', codeName: 'TEST-01', description: 'Test', category: 'social'
            });
        });

        if (authResult.success) {
            throw new Error('❌ Security Failure: add_agent succeeded without authentication.');
        }
        console.log(`✅ Auth boundary intact. Blocked unauthorized write: ${authResult.error}`);

        console.log('\n🎉 ALL WEBMCP TESTS PASSED SUCCESSFULLY 🎉');

    } catch (error) {
        console.error('\n❌ TEST SUITE FAILED:', error.message);
        process.exit(1);
    } finally {
        if (browser) await browser.close();
    }
})();
