# Changelog

## 1.0.0

First release.

- MCP server on stdio, built on the official MCP TypeScript SDK v2
  (`@modelcontextprotocol/server` 2.4).
- Two example tools: `current-time` and `convert-units`, both read-only and
  offline.
- 7 tests that start the server over stdio with the official MCP client.
- Setup for Claude Code, Claude Desktop, Cursor, VS Code and the MCP
  Inspector.
- `AGENTS.md` with the rules for adding tools, for AI coding assistants.
- CI on Node.js 20, 22 and 24.
