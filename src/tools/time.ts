import * as z from 'zod/v4';
import { text, toolError, type ToolModule } from './types.js';

/**
 * Example: the smallest useful tool. One input with a default, structured
 * output, and a readable error when the time zone does not exist.
 * Copy this file to start a new tool.
 */
export const registerTimeTool: ToolModule = server => {
    server.registerTool(
        'current-time',
        {
            title: 'Current time',
            description: 'The current date and time in a given IANA time zone.',
            inputSchema: z.object({
                timeZone: z.string().default('UTC').describe('IANA time zone, e.g. "Europe/Berlin" or "America/New_York"')
            }),
            outputSchema: z.object({ timeZone: z.string(), iso: z.string(), local: z.string() }),
            annotations: { readOnlyHint: true, openWorldHint: false }
        },
        async ({ timeZone }) => {
            try {
                const now = new Date();
                const local = now.toLocaleString('en-GB', { timeZone });
                return { ...text(`${local} (${timeZone})`), structuredContent: { timeZone, iso: now.toISOString(), local } };
            } catch {
                return toolError(`Unknown time zone "${timeZone}". Use an IANA name such as "Europe/Berlin".`);
            }
        }
    );
};
