/**
 * WebMCP Module — Barrel Export
 * ==============================
 * Central export point for the Dual-Layer WebMCP Architecture.
 */

export { default as WebMCPProvider } from './WebMCPProvider';
export { WEBMCP_TOOLS, executeWebMCPTool } from './tools';
export { initWebMCPPostMessageListener } from './rpc-handler';
export type { WebMCPToolDefinition, WebMCPToolResult, WebMCPStoreBridge } from './tools';
