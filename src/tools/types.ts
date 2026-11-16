import type { McpServer } from '@modelcontextprotocol/server';

/** A tool module registers one or more tools on the server. */
export type ToolModule = (server: McpServer) => void;

/** Shorthand for a plain-text tool result. */
export const text = (value: string) => ({ content: [{ type: 'text' as const, text: value }] });

/** A tool error the model can read and recover from (wrong input, not found...). */
export const toolError = (message: string) => ({
    content: [{ type: 'text' as const, text: message }],
    isError: true
});
