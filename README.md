# MCP Server Starter (lite)

A small TypeScript MCP server that runs over stdio, with two example tools and
tests. Run it in Claude Desktop, Claude Code, Cursor or VS Code, then replace
the examples with your own tools.

Built on the official MCP TypeScript SDK v2 (`@modelcontextprotocol/server`).
MIT licensed.

## Quick start

Requires Node.js 20 or newer. Clone this repository, then:

```bash
npm install
npm test
npm run build
```

`npm test` starts the server as a child process and talks to it over stdio
with the official MCP client, the same way your editor does. No network
needed.

`npm run build` writes `dist/index.js`. That is the file your client starts.

## Connect a client

Each client starts the server itself, so it needs the absolute path to
`dist/index.js`. Run `pwd` in this folder to get it, and run `npm run build`
again after every change.

**Claude Code**

```bash
claude mcp add starter-lite -- node /absolute/path/to/mcp-server-starter-lite/dist/index.js
```

**Claude Desktop**: Settings > Developer > Edit Config opens
`claude_desktop_config.json`. Add the server, then restart Claude Desktop:

```json
{
  "mcpServers": {
    "starter-lite": {
      "command": "node",
      "args": ["/absolute/path/to/mcp-server-starter-lite/dist/index.js"]
    }
  }
}
```

**Cursor**: the same `mcpServers` block in `~/.cursor/mcp.json` (all
projects) or `.cursor/mcp.json` (one project).

**VS Code** (Copilot agent mode): `.vscode/mcp.json`:

```json
{
  "servers": {
    "starter-lite": {
      "type": "stdio",
      "command": "node",
      "args": ["/absolute/path/to/mcp-server-starter-lite/dist/index.js"]
    }
  }
}
```

Then ask your assistant something like "What time is it in Tokyo?" or
"Convert 42 km to miles".

**MCP Inspector**: `npm run inspect` opens the Inspector in your browser,
connected to the built server, so you can call the tools by hand.

## The two tools

| Tool | What it shows |
| --- | --- |
| `current-time` | The smallest useful tool: one input with a default, structured output, and a readable error for an unknown time zone. Copy it to start your own. |
| `convert-units` | A pure function behind a tool: validated input, a lookup table, structured output, and an error the model can recover from. |

## Add your own tool

1. Copy `src/tools/time.ts` to `src/tools/<name>.ts` and rename the function
   and the tool.
2. Add it to the `modules` list in `src/tools/index.ts`.
3. Add a test in `test/tools.test.ts`.
4. Run `npm run typecheck && npm test`, then `npm run build` and restart your
   client.

Rules worth keeping (they are also in `AGENTS.md`, so Claude Code or Cursor
follow them when you ask them to add a tool):

- Describe every input field with `.describe()`. The model reads it to decide
  what to pass.
- Name tools with kebab-case verbs: `search-orders`, `create-invoice`.
- Set `annotations`, so clients know whether a tool only reads or also changes
  things.
- Return `toolError(message)` for expected failures. Throw only for real bugs.
- Never write to stdout (`console.log`). Over stdio, stdout carries the
  protocol and one stray line breaks it. Use `log` from `src/lib/log.ts`,
  which writes to stderr.

## Project layout

```
src/index.ts          stdio entry point
src/server.ts         builds the MCP server and registers the tools
src/tools/index.ts    the list of tools
src/tools/time.ts     current-time
src/tools/convert.ts  convert-units
src/lib/log.ts        logger that writes to stderr
test/tools.test.ts    runs the server over stdio with a real MCP client
AGENTS.md             rules for AI coding assistants
```

## Lite and the full kit

This repo is the free, stdio-only part of the
[MCP Server Starter Kit](https://kitwire.dev). Stdio is enough while the
server runs on your own machine. The full kit is for when it needs to run
somewhere else and be shared:

| | Lite (this repo) | Full kit |
| --- | --- | --- |
| stdio for local clients | Yes | Yes |
| Remote server over Streamable HTTP, stateless 2026-07-28 spec | No | Yes |
| Auth: API keys, or OAuth with per-tool scopes | No | Yes |
| Deploy: Cloudflare Workers, Vercel, Node, Docker | No | Yes |
| Example tools | 2 | 7: notes with per-user storage, an external API with timeouts, unit conversion, caller identity |
| Resources and prompts | No | Yes |
| Storage: Workers KV or Upstash Redis | No | Yes |
| Tests | 7 | 27 |
| Guides | This README | 8 step-by-step guides |
| License | MIT | Commercial, one-time payment |

You can try the full kit before buying: its
[live demo](https://kitwire.dev/docs/try-the-demo/) runs on Cloudflare Workers,
and the page shows how to connect Claude Code, Cursor or VS Code to it.

## License

MIT, see [LICENSE](LICENSE). The full kit is sold separately under its own
license.

---

I'm Bogdan and I make Kitwire. If something in this repo is unclear or does
not work, open an issue and I will fix it.

Bogdan
