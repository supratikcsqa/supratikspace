/**
 * WebMCPProvider — Browser-Native Layer
 * ======================================
 * W3C-compliant browser-native integration that registers all Command Centre
 * tools into `navigator.modelContext` for discovery by browser-embedded AI agents.
 *
 * Features:
 * - Registers all 14 tools using navigator.modelContext.registerTool()
 * - Full cleanup on unmount via mc.unregisterTool() to prevent InvalidStateError
 * - Sensitive tools use requestUserInteraction flow
 * - 100% parity with the Server RPC layer (same tool definitions + executor)
 */

import React, { useEffect, useRef, useCallback } from 'react';
import { useAgents } from '../contexts/AgentContext';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
    WEBMCP_TOOLS,
    WebMCPStoreBridge,
    executeWebMCPTool,
} from './tools';

// ─── W3C ModelContext Type Declarations ──────────────────────────────────────

interface ModelContextTool {
    name: string;
    description: string;
    inputSchema: Record<string, unknown>;
    handler: (args: Record<string, unknown>) => Promise<unknown>;
}

interface ModelContext {
    registerTool: (tool: ModelContextTool) => void;
    unregisterTool: (name: string) => void;
    requestUserInteraction?: (options: {
        title: string;
        description: string;
        confirmLabel?: string;
        cancelLabel?: string;
    }) => Promise<{ confirmed: boolean }>;
}

declare global {
    interface Navigator {
        modelContext?: ModelContext;
    }
}

// ─── Provider Component ─────────────────────────────────────────────────────

const WebMCPProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { agents, addAgent, updateAgent, removeAgent } = useAgents();
    const { isAuthenticated, login, logout } = useAuth();
    const navigate = useNavigate();
    const registeredToolsRef = useRef<string[]>([]);
    const bridgeRef = useRef<WebMCPStoreBridge | null>(null);

    // Keep bridge ref current with latest state
    bridgeRef.current = {
        getAgents: () => agents,
        addAgent,
        updateAgent,
        removeAgent,
        isAuthenticated: () => isAuthenticated,
        login,
        logout,
        navigate: (route: string) => navigate(route),
    };

    const registerAllTools = useCallback(() => {
        const mc = navigator.modelContext;
        if (!mc) {
            console.log('[WebMCP] navigator.modelContext not available. Browser-native layer deferred.');
            return;
        }

        console.log('[WebMCP] Registering tools into navigator.modelContext...');

        for (const toolDef of WEBMCP_TOOLS) {
            const handler = async (args: Record<string, unknown>): Promise<unknown> => {
                const bridge = bridgeRef.current;
                if (!bridge) {
                    return { success: false, error: 'WebMCP bridge not initialized.' };
                }

                // User interaction gate for sensitive tools
                if (toolDef.requiresUserInteraction && mc.requestUserInteraction) {
                    try {
                        const interaction = await mc.requestUserInteraction({
                            title: `WebMCP: ${toolDef.name}`,
                            description: `The agent is requesting to execute '${toolDef.name}'. ${toolDef.description}`,
                            confirmLabel: 'Approve',
                            cancelLabel: 'Deny',
                        });
                        if (!interaction.confirmed) {
                            return {
                                success: false,
                                error: `User denied execution of '${toolDef.name}'.`,
                                hint: 'The user must approve this sensitive action before it can proceed.',
                            };
                        }
                    } catch {
                        // If requestUserInteraction is not supported, proceed with caution
                        console.warn(`[WebMCP] requestUserInteraction not supported for '${toolDef.name}'. Proceeding.`);
                    }
                }

                return executeWebMCPTool(toolDef.name, args, bridge);
            };

            try {
                mc.registerTool({
                    name: toolDef.name,
                    description: toolDef.description,
                    inputSchema: toolDef.inputSchema,
                    handler,
                });
                registeredToolsRef.current.push(toolDef.name);
                console.log(`[WebMCP] ✓ Registered: ${toolDef.name}`);
            } catch (err) {
                console.error(`[WebMCP] ✗ Failed to register '${toolDef.name}':`, err);
            }
        }

        console.log(`[WebMCP] ${registeredToolsRef.current.length}/${WEBMCP_TOOLS.length} tools registered successfully.`);
    }, []);

    const unregisterAllTools = useCallback(() => {
        const mc = navigator.modelContext;
        if (!mc) return;

        for (const name of registeredToolsRef.current) {
            try {
                mc.unregisterTool(name);
                console.log(`[WebMCP] ✓ Unregistered: ${name}`);
            } catch (err) {
                console.warn(`[WebMCP] ✗ Failed to unregister '${name}':`, err);
            }
        }
        registeredToolsRef.current = [];
    }, []);

    // Register on mount, unregister on unmount
    useEffect(() => {
        registerAllTools();
        return () => unregisterAllTools();
    }, [registerAllTools, unregisterAllTools]);

    // Also expose tools on the global window object for the RPC layer
    useEffect(() => {
        (window as any).__webmcp_rpc = {
            execute: (toolName: string, args: Record<string, unknown>) => {
                const bridge = bridgeRef.current;
                if (!bridge) return { success: false, error: 'Bridge not initialized.' };
                return executeWebMCPTool(toolName, args, bridge);
            },
            listTools: () => WEBMCP_TOOLS.map(t => ({
                name: t.name,
                description: t.description,
                inputSchema: t.inputSchema,
                category: t.category,
                requiresAuth: t.requiresAuth || false,
            })),
            version: '1.0.0',
            protocol: 'WebMCP',
            application: "Supratik's Command Centre",
        };
        console.log('[WebMCP] Global RPC dispatcher installed at window.__webmcp_rpc');

        return () => {
            delete (window as any).__webmcp_rpc;
        };
    }, []);

    return <>{children}</>;
};

export default WebMCPProvider;
