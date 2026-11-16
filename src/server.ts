import { McpServer } from '@modelcontextprotocol/server';
import { registerTools } from './tools/index.js';

export const SERVER_NAME = 'mcp-server-starter-lite';
export const SERVER_VERSION = '1.0.0';

/** Builds the MCP server and registers every tool in src/tools/index.ts. */
export function buildServer(): McpServer {
    const server = new McpServer(
        { name: SERVER_NAME, version: SERVER_VERSION },
        {
            instructions:
                'Example MCP server. current-time gives the date and time in any IANA time zone; ' +
                'convert-units converts length, mass, volume and temperature.'
        }
    );
    registerTools(server);
    return server;
}
