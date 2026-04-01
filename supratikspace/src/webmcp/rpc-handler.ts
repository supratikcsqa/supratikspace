/**
 * WebMCP RPC Handler — Server RPC Layer (In-Browser)
 * ===================================================
 * Since this is a client-side SPA (no Node.js server), the "Server RPC Layer"
 * is implemented as an in-browser JSON-RPC dispatcher accessible via:
 *
 * 1. window.__webmcp_rpc.execute(toolName, args) — Direct programmatic access
 * 2. window.__webmcp_rpc.listTools() — Tool discovery
 * 3. postMessage protocol — For cross-frame/cross-origin agent communication
 *
 * This module bootstraps the postMessage listener for external agent communication.
 */

// ─── JSON-RPC Request/Response Types ─────────────────────────────────────────

interface WebMCPRPCRequest {
    jsonrpc: '2.0';
    id: string | number;
    method: string;
    params?: Record<string, unknown>;
}

interface WebMCPRPCResponse {
    jsonrpc: '2.0';
    id: string | number;
    result?: unknown;
    error?: {
        code: number;
        message: string;
        data?: unknown;
    };
}

// ─── RPC Error Codes ─────────────────────────────────────────────────────────

const RPC_ERRORS = {
    PARSE_ERROR: -32700,
    INVALID_REQUEST: -32600,
    METHOD_NOT_FOUND: -32601,
    INVALID_PARAMS: -32602,
    INTERNAL_ERROR: -32603,
    AUTH_REQUIRED: -32001,
    USER_DENIED: -32002,
} as const;

// ─── PostMessage Protocol Listener ───────────────────────────────────────────

export function initWebMCPPostMessageListener(): () => void {
    const handler = (event: MessageEvent) => {
        // Validate message structure
        if (!event.data || typeof event.data !== 'object') return;
        if (event.data.protocol !== 'webmcp') return;

        const request = event.data as WebMCPRPCRequest & { protocol: string };
        const rpc = (window as any).__webmcp_rpc;

        if (!rpc) {
            const errorResponse: WebMCPRPCResponse = {
                jsonrpc: '2.0',
                id: request.id || 0,
                error: {
                    code: RPC_ERRORS.INTERNAL_ERROR,
                    message: 'WebMCP RPC bridge is not initialized. The application may still be loading.',
                },
            };
            event.source?.postMessage({ protocol: 'webmcp-response', ...errorResponse }, { targetOrigin: '*' });
            return;
        }

        let response: WebMCPRPCResponse;

        if (request.method === 'webmcp.discover') {
            // Discovery endpoint — return all available tools
            response = {
                jsonrpc: '2.0',
                id: request.id,
                result: {
                    protocol: 'WebMCP',
                    version: '1.0.0',
                    application: "Supratik's Command Centre",
                    tools: rpc.listTools(),
                },
            };
        } else if (request.method === 'webmcp.execute') {
            // Tool execution
            const toolName = request.params?.tool as string;
            const args = (request.params?.args as Record<string, unknown>) || {};

            if (!toolName) {
                response = {
                    jsonrpc: '2.0',
                    id: request.id,
                    error: {
                        code: RPC_ERRORS.INVALID_PARAMS,
                        message: "Missing 'tool' parameter in execution request.",
                        data: { hint: "Use 'webmcp.discover' to list available tools." },
                    },
                };
            } else {
                const result = rpc.execute(toolName, args);
                if (result.success) {
                    response = { jsonrpc: '2.0', id: request.id, result: result.data };
                } else {
                    response = {
                        jsonrpc: '2.0',
                        id: request.id,
                        error: {
                            code: result.error?.includes('authentication') ? RPC_ERRORS.AUTH_REQUIRED : RPC_ERRORS.INTERNAL_ERROR,
                            message: result.error || 'Unknown execution error.',
                            data: { hint: result.hint },
                        },
                    };
                }
            }
        } else {
            response = {
                jsonrpc: '2.0',
                id: request.id || 0,
                error: {
                    code: RPC_ERRORS.METHOD_NOT_FOUND,
                    message: `Unknown RPC method '${request.method}'. Supported: 'webmcp.discover', 'webmcp.execute'.`,
                },
            };
        }

        // Send response back to the requesting frame/window
        event.source?.postMessage({ protocol: 'webmcp-response', ...response }, { targetOrigin: '*' });
    };

    window.addEventListener('message', handler);
    console.log('[WebMCP] PostMessage RPC listener active. Protocol: "webmcp"');

    // Return cleanup function
    return () => {
        window.removeEventListener('message', handler);
        console.log('[WebMCP] PostMessage RPC listener removed.');
    };
}
