import type { McpServer } from '@modelcontextprotocol/server';
import { registerConvertTool } from './convert.js';
import { registerTimeTool } from './time.js';
import type { ToolModule } from './types.js';

/**
 * The tools this server exposes.
 * To add one: create src/tools/<name>.ts exporting a ToolModule, then add it here.
 * To remove an example: delete it from this list (and its file).
 */
const modules: ToolModule[] = [registerTimeTool, registerConvertTool];

export function registerTools(server: McpServer) {
    for (const register of modules) register(server);
}
