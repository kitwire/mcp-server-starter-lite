#!/usr/bin/env node
/**
 * Entry point: an MCP server on stdio.
 *
 * Your MCP client (Claude Desktop, Claude Code, Cursor, VS Code...) starts
 * this file as a child process and talks to it over stdin and stdout.
 *
 * Never write to stdout yourself: it carries the protocol, and a stray
 * console.log would corrupt it. Use log from ./lib/log.js (stderr).
 */
import { serveStdio } from '@modelcontextprotocol/server/stdio';
import { log } from './lib/log.js';
import { buildServer, SERVER_NAME } from './server.js';

void serveStdio(() => buildServer());
log.info('MCP server running on stdio', { name: SERVER_NAME });
