/**
 * WebMCP Unified Tool Definitions & Executor
 * ============================================
 * Single source of truth for all WebMCP tools.
 * Consumed by both the Server RPC layer and Browser-Native layer.
 * Maintains 100% parity between environments.
 */

import { Agent, AgentStatus, categories } from '../data/agents';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface WebMCPToolDefinition {
    name: string;
    description: string;
    inputSchema: Record<string, unknown>;
    category: 'read' | 'write' | 'auth' | 'navigation' | 'execute';
    requiresAuth?: boolean;
    requiresUserInteraction?: boolean;
}

export interface WebMCPToolResult {
    success: boolean;
    data?: unknown;
    error?: string;
    hint?: string;
}

export interface WebMCPStoreBridge {
    getAgents: () => Agent[];
    addAgent: (agent: Agent) => void;
    updateAgent: (id: string, updates: Partial<Agent>) => void;
    removeAgent: (id: string) => void;
    isAuthenticated: () => boolean;
    login: (password: string) => boolean;
    logout: () => void;
    navigate: (route: string) => void;
}

// ─── Tool Definitions ────────────────────────────────────────────────────────

export const WEBMCP_TOOLS: WebMCPToolDefinition[] = [
    {
        name: 'list_agents',
        description: 'Returns the complete list of all AI agents in the Command Centre fleet, including their ID, name, codeName, description, category, status, URL, icon, accent color, tags, version, uptime, and personality data. Supports optional filtering by category slug and status.',
        category: 'read',
        inputSchema: {
            type: 'object',
            properties: {
                category: {
                    type: 'string',
                    description: "Optional category slug to filter agents (e.g., 'social', 'communication', 'data', 'finance', 'engineering', 'automation'). Omit or pass 'all' to return all agents.",
                },
                status: {
                    type: 'string',
                    enum: ['active', 'paused', 'inactive'],
                    description: 'Optional status filter. Only returns agents matching this operational status.',
                },
            },
            additionalProperties: false,
        },
    },
    {
        name: 'get_agent',
        description: "Retrieves a single agent's full profile by its unique ID. Returns all metadata including personality traits, operational details, and deployment URL.",
        category: 'read',
        inputSchema: {
            type: 'object',
            properties: {
                agentId: {
                    type: 'string',
                    description: "The unique identifier of the agent to retrieve (e.g., 'ig-farmer', 'reddit-karma', 'mailer-agent').",
                },
            },
            required: ['agentId'],
            additionalProperties: false,
        },
    },
    {
        name: 'search_agents',
        description: "Performs a fuzzy semantic search across all agents using a natural language query. Searches across name, codeName, description, category, tags, and personality traits. Returns ranked results with match scores.",
        category: 'read',
        inputSchema: {
            type: 'object',
            properties: {
                query: {
                    type: 'string',
                    description: "Natural language search query (e.g., 'email automation', 'social media growth', 'database management').",
                },
            },
            required: ['query'],
            additionalProperties: false,
        },
    },
    {
        name: 'add_agent',
        description: 'Creates a new AI agent in the Command Centre fleet with the specified configuration. Persisted to localStorage and immediately visible in the dashboard.',
        category: 'write',
        requiresAuth: true,
        inputSchema: {
            type: 'object',
            properties: {
                name: { type: 'string', description: "Display name for the agent (e.g., 'ContentWriter')." },
                codeName: { type: 'string', description: "Tactical code name in UPPER-XX format (e.g., 'SCRIBE-01')." },
                description: { type: 'string', description: "Operational description of the agent's capabilities, 10-200 characters." },
                category: { type: 'string', enum: ['social', 'communication', 'data', 'finance', 'engineering', 'automation'], description: 'Category classification.' },
                status: { type: 'string', enum: ['active', 'paused', 'inactive'], description: "Initial operational status. Defaults to 'inactive'." },
                url: { type: 'string', description: "Deployment URL for the agent's backend." },
                icon: { type: 'string', description: 'Single emoji character representing the agent.' },
                accentColor: { type: 'string', description: "Hex color code (e.g., '#10b981')." },
                tags: { type: 'array', items: { type: 'string' }, description: 'Lowercase tag slugs.' },
                version: { type: 'string', description: "Semver version string (e.g., 'v1.0.0')." },
            },
            required: ['name', 'codeName', 'description', 'category'],
            additionalProperties: false,
        },
    },
    {
        name: 'update_agent',
        description: 'Updates one or more properties of an existing agent. Only provided fields are modified; all others remain unchanged.',
        category: 'write',
        requiresAuth: true,
        inputSchema: {
            type: 'object',
            properties: {
                agentId: { type: 'string', description: 'The unique identifier of the agent to update.' },
                updates: { type: 'object', description: 'Partial agent object containing only fields to update.' },
            },
            required: ['agentId', 'updates'],
            additionalProperties: false,
        },
    },
    {
        name: 'remove_agent',
        description: 'Permanently deletes an agent from the fleet by its unique ID. Irreversible. Removes all associated data from localStorage.',
        category: 'write',
        requiresAuth: true,
        requiresUserInteraction: true,
        inputSchema: {
            type: 'object',
            properties: {
                agentId: { type: 'string', description: 'The unique identifier of the agent to permanently delete.' },
            },
            required: ['agentId'],
            additionalProperties: false,
        },
    },
    {
        name: 'list_categories',
        description: 'Returns all available agent categories with display metadata: ID, name, icon emoji, and gradient CSS class.',
        category: 'read',
        inputSchema: {
            type: 'object',
            properties: {},
            additionalProperties: false,
        },
    },
    {
        name: 'toggle_agent_status',
        description: "Changes the operational status of an agent ('active', 'paused', or 'inactive'). Returns the updated agent state.",
        category: 'write',
        requiresAuth: true,
        inputSchema: {
            type: 'object',
            properties: {
                agentId: { type: 'string', description: 'The unique identifier of the agent.' },
                newStatus: { type: 'string', enum: ['active', 'paused', 'inactive'], description: 'The target operational status.' },
            },
            required: ['agentId', 'newStatus'],
            additionalProperties: false,
        },
    },
    {
        name: 'get_fleet_stats',
        description: 'Returns aggregate statistics: total agent count, counts by status and category, and average uptime.',
        category: 'read',
        inputSchema: {
            type: 'object',
            properties: {},
            additionalProperties: false,
        },
    },
    {
        name: 'authenticate',
        description: 'Authenticates the operator session using a password credential. Sets persistent auth in localStorage.',
        category: 'auth',
        requiresUserInteraction: true,
        inputSchema: {
            type: 'object',
            properties: {
                password: { type: 'string', description: 'The authentication credential for admin access.' },
            },
            required: ['password'],
            additionalProperties: false,
        },
    },
    {
        name: 'get_auth_status',
        description: 'Checks whether the current session is authenticated for admin operations.',
        category: 'auth',
        inputSchema: {
            type: 'object',
            properties: {},
            additionalProperties: false,
        },
    },
    {
        name: 'logout',
        description: 'Terminates the authenticated session. Clears auth from localStorage.',
        category: 'auth',
        inputSchema: {
            type: 'object',
            properties: {},
            additionalProperties: false,
        },
    },
    {
        name: 'navigate_to_page',
        description: "Programmatically navigates the application to a route: '/' (Home), '/login', '/admin', '/agent/{agentId}'.",
        category: 'navigation',
        inputSchema: {
            type: 'object',
            properties: {
                route: { type: 'string', description: 'The target route path.' },
            },
            required: ['route'],
            additionalProperties: false,
        },
    },
    {
        name: 'execute_agent_task',
        description: "Sends a task payload to a deployed agent's backend. Requires a live (non-placeholder) URL. Supports optional BYOK API key.",
        category: 'execute',
        inputSchema: {
            type: 'object',
            properties: {
                agentId: { type: 'string', description: 'The unique identifier of the target agent.' },
                taskInput: { type: 'string', description: 'The task description or payload.' },
                apiKey: { type: 'string', description: 'Optional BYOK OpenAI API key for unlimited runs.' },
            },
            required: ['agentId', 'taskInput'],
            additionalProperties: false,
        },
    },
];

// ─── Fuzzy Search Scoring ────────────────────────────────────────────────────

function computeSearchScore(agent: Agent, query: string): number {
    const q = query.toLowerCase();
    const fields = [
        agent.name,
        agent.codeName,
        agent.description,
        agent.category,
        ...agent.tags,
        ...(agent.personality?.traits || []),
        agent.personality?.motto || '',
        agent.personality?.style || '',
    ];

    let score = 0;
    for (const field of fields) {
        const f = field.toLowerCase();
        if (f === q) score += 10;
        else if (f.includes(q)) score += 5;
        else {
            // Token-level matching
            const queryTokens = q.split(/\s+/);
            for (const token of queryTokens) {
                if (token.length > 2 && f.includes(token)) score += 2;
            }
        }
    }
    return score;
}

// ─── Tool Executor ───────────────────────────────────────────────────────────

export function executeWebMCPTool(
    toolName: string,
    args: Record<string, unknown>,
    bridge: WebMCPStoreBridge
): WebMCPToolResult {
    const toolDef = WEBMCP_TOOLS.find(t => t.name === toolName);
    if (!toolDef) {
        return {
            success: false,
            error: `Unknown tool: '${toolName}'. Available tools: ${WEBMCP_TOOLS.map(t => t.name).join(', ')}`,
            hint: 'Call list_agents or search_agents to discover available capabilities.',
        };
    }

    // Auth gate for write operations
    if (toolDef.requiresAuth && !bridge.isAuthenticated()) {
        return {
            success: false,
            error: `Tool '${toolName}' requires authentication. Current session is not authenticated.`,
            hint: "Call 'authenticate' with valid credentials first, or check auth status with 'get_auth_status'.",
        };
    }

    try {
        switch (toolName) {
            // ── READ TOOLS ──────────────────────────────────────────────
            case 'list_agents': {
                let agents = bridge.getAgents();
                const appliedFilters: Record<string, string> = {};

                if (args.category && args.category !== 'all') {
                    agents = agents.filter(a => a.category === args.category);
                    appliedFilters.category = args.category as string;
                }
                if (args.status) {
                    agents = agents.filter(a => a.status === args.status);
                    appliedFilters.status = args.status as string;
                }

                return {
                    success: true,
                    data: {
                        agents: agents.map(stripForAgent),
                        count: agents.length,
                        appliedFilters,
                    },
                };
            }

            case 'get_agent': {
                const agentId = args.agentId as string;
                if (!agentId) {
                    return { success: false, error: "Missing required parameter 'agentId'.", hint: "Provide the agent's unique ID string." };
                }
                const agent = bridge.getAgents().find(a => a.id === agentId);
                return {
                    success: true,
                    data: { agent: agent ? stripForAgent(agent) : null, found: !!agent },
                };
            }

            case 'search_agents': {
                const query = args.query as string;
                if (!query || query.trim().length === 0) {
                    return { success: false, error: "Missing required parameter 'query'.", hint: 'Provide a natural language search string.' };
                }
                const agents = bridge.getAgents();
                const scored = agents
                    .map(a => ({ agent: stripForAgent(a), score: computeSearchScore(a, query) }))
                    .filter(r => r.score > 0)
                    .sort((a, b) => b.score - a.score);

                if (scored.length === 0) {
                    return {
                        success: true,
                        data: { results: [], count: 0, query },
                        hint: `No agents matched the query '${query}'. Try broader terms or call 'list_agents' for the full fleet.`,
                    };
                }

                return {
                    success: true,
                    data: {
                        results: scored.map(r => ({ ...r.agent, _relevanceScore: r.score })),
                        count: scored.length,
                        query,
                    },
                };
            }

            case 'list_categories': {
                return {
                    success: true,
                    data: {
                        categories: categories.map(c => ({ id: c.id, name: c.name, icon: c.icon })),
                        count: categories.length,
                    },
                };
            }

            case 'get_fleet_stats': {
                const agents = bridge.getAgents();
                const byStatus: Record<string, number> = { active: 0, paused: 0, inactive: 0 };
                const byCategory: Record<string, number> = {};

                for (const agent of agents) {
                    byStatus[agent.status] = (byStatus[agent.status] || 0) + 1;
                    byCategory[agent.category] = (byCategory[agent.category] || 0) + 1;
                }

                const uptimeValues = agents
                    .filter(a => a.uptime)
                    .map(a => parseFloat(a.uptime!.replace('%', '')))
                    .filter(v => !isNaN(v));
                const avgUptime = uptimeValues.length > 0
                    ? (uptimeValues.reduce((s, v) => s + v, 0) / uptimeValues.length).toFixed(1) + '%'
                    : 'N/A';

                return {
                    success: true,
                    data: {
                        totalAgents: agents.length,
                        byStatus,
                        byCategory,
                        averageUptime: avgUptime,
                        timestamp: new Date().toISOString(),
                    },
                };
            }

            // ── WRITE TOOLS ─────────────────────────────────────────────
            case 'add_agent': {
                const name = args.name as string;
                const codeName = args.codeName as string;
                const description = args.description as string;
                const category = args.category as string;

                if (!name || !codeName || !description || !category) {
                    return {
                        success: false,
                        error: "Missing required parameters. 'name', 'codeName', 'description', and 'category' are all required.",
                        hint: 'Provide all four required fields to create an agent.',
                    };
                }

                const newAgent: Agent = {
                    id: `agent-${Date.now()}`,
                    name,
                    codeName,
                    description,
                    category,
                    status: (args.status as AgentStatus) || 'inactive',
                    type: (args.type as 'native' | 'external') || 'external',
                    url: (args.url as string) || 'https://example.yourdomain.com',
                    icon: (args.icon as string) || '🤖',
                    accentColor: (args.accentColor as string) || '#10b981',
                    tags: (args.tags as string[]) || [],
                    version: (args.version as string) || 'v1.0.0',
                    uptime: '100%',
                };

                bridge.addAgent(newAgent);
                return {
                    success: true,
                    data: { agent: stripForAgent(newAgent), message: `Agent '${name}' (${codeName}) created successfully.` },
                };
            }

            case 'update_agent': {
                const agentId = args.agentId as string;
                const updates = args.updates as Partial<Agent>;

                if (!agentId) return { success: false, error: "Missing 'agentId'.", hint: 'Specify which agent to update.' };
                if (!updates || Object.keys(updates).length === 0) return { success: false, error: "Missing 'updates' object.", hint: 'Provide at least one field to update.' };

                const existing = bridge.getAgents().find(a => a.id === agentId);
                if (!existing) return { success: false, error: `Agent '${agentId}' not found.`, hint: "Call 'list_agents' to see available agent IDs." };

                bridge.updateAgent(agentId, updates);
                return {
                    success: true,
                    data: { agentId, updatedFields: Object.keys(updates), message: `Agent '${agentId}' updated successfully.` },
                };
            }

            case 'remove_agent': {
                const agentId = args.agentId as string;
                if (!agentId) return { success: false, error: "Missing 'agentId'.", hint: 'Specify which agent to delete.' };

                const existing = bridge.getAgents().find(a => a.id === agentId);
                if (!existing) return { success: false, error: `Agent '${agentId}' not found.`, hint: "Call 'list_agents' to see available agent IDs." };

                bridge.removeAgent(agentId);
                return {
                    success: true,
                    data: { agentId, message: `Agent '${existing.name}' (${existing.codeName}) permanently removed.` },
                };
            }

            case 'toggle_agent_status': {
                const agentId = args.agentId as string;
                const newStatus = args.newStatus as AgentStatus;

                if (!agentId || !newStatus) {
                    return { success: false, error: "Missing 'agentId' or 'newStatus'.", hint: "Both 'agentId' and 'newStatus' are required." };
                }
                if (!['active', 'paused', 'inactive'].includes(newStatus)) {
                    return { success: false, error: `Invalid status '${newStatus}'.`, hint: "Valid statuses: 'active', 'paused', 'inactive'." };
                }

                const existing = bridge.getAgents().find(a => a.id === agentId);
                if (!existing) return { success: false, error: `Agent '${agentId}' not found.` };

                const previousStatus = existing.status;
                bridge.updateAgent(agentId, { status: newStatus });
                return {
                    success: true,
                    data: { agentId, previousStatus, newStatus, message: `Agent '${existing.name}' status changed: ${previousStatus} → ${newStatus}.` },
                };
            }

            // ── AUTH TOOLS ──────────────────────────────────────────────
            case 'authenticate': {
                const password = args.password as string;
                if (!password) return { success: false, error: "Missing 'password'.", hint: 'Provide the admin password.' };

                const result = bridge.login(password);
                return result
                    ? { success: true, data: { authenticated: true, message: 'Session authenticated successfully.' } }
                    : { success: false, error: 'Authentication failed. Invalid credential.', hint: 'Verify the password and retry.' };
            }

            case 'get_auth_status': {
                return {
                    success: true,
                    data: { authenticated: bridge.isAuthenticated(), timestamp: new Date().toISOString() },
                };
            }

            case 'logout': {
                bridge.logout();
                return { success: true, data: { authenticated: false, message: 'Session terminated.' } };
            }

            // ── NAVIGATION TOOLS ────────────────────────────────────────
            case 'navigate_to_page': {
                const route = args.route as string;
                if (!route) return { success: false, error: "Missing 'route'.", hint: "Provide a route like '/', '/admin', '/agent/ig-farmer'." };

                bridge.navigate(route);
                return { success: true, data: { navigatedTo: route, message: `Navigated to '${route}'.` } };
            }

            // ── EXECUTE TOOLS ───────────────────────────────────────────
            case 'execute_agent_task': {
                const agentId = args.agentId as string;
                const taskInput = args.taskInput as string;
                const apiKey = args.apiKey as string | undefined;

                if (!agentId || !taskInput) {
                    return { success: false, error: "Missing 'agentId' or 'taskInput'.", hint: 'Both are required for task execution.' };
                }

                const agent = bridge.getAgents().find(a => a.id === agentId);
                if (!agent) return { success: false, error: `Agent '${agentId}' not found.` };

                if (!agent.url || agent.url.includes('yourdomain.com')) {
                    return {
                        success: false,
                        error: `Agent '${agent.name}' has no deployed backend (URL: ${agent.url}).`,
                        hint: "Only agents with live deployment URLs can execute tasks. Use '/deploy-agent' to deploy.",
                    };
                }

                // Return a deferred execution handle — actual HTTP call must be async
                return {
                    success: true,
                    data: {
                        agentId,
                        agentName: agent.name,
                        targetUrl: `${agent.url}/generate`,
                        taskInput,
                        hasApiKey: !!apiKey,
                        message: `Task dispatched to '${agent.name}'. Backend execution in progress.`,
                        _async: true,
                        _fetchConfig: {
                            method: 'POST',
                            url: `${agent.url}/generate`,
                            headers: {
                                'Content-Type': 'application/json',
                                ...(apiKey ? { 'x-api-key': apiKey } : {}),
                                'x-user-id': apiKey ? `byok-${btoa(apiKey).slice(0, 12)}` : `anon-webmcp`,
                            },
                            body: { product_url_summary: taskInput },
                        },
                    },
                };
            }

            default:
                return { success: false, error: `Tool '${toolName}' is defined but has no executor implementation.` };
        }
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        return {
            success: false,
            error: `Execution error in tool '${toolName}': ${message}`,
            hint: 'This may indicate a bug in the tool executor. Check input parameters.',
        };
    }
}

// ─── Helper: Strip agent data for clean output ───────────────────────────────

function stripForAgent(agent: Agent): Record<string, unknown> {
    return {
        id: agent.id,
        name: agent.name,
        codeName: agent.codeName,
        description: agent.description,
        category: agent.category,
        status: agent.status,
        type: agent.type || 'external',
        url: agent.url,
        icon: agent.icon,
        accentColor: agent.accentColor,
        tags: agent.tags,
        version: agent.version,
        uptime: agent.uptime || null,
        personality: agent.personality
            ? {
                motto: agent.personality.motto,
                style: agent.personality.style,
                traits: agent.personality.traits,
                details: agent.personality.details,
            }
            : null,
    };
}
