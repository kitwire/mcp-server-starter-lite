# Instructions for AI coding assistants

This file tells Claude Code, Cursor, Copilot and similar tools how this repo
is organised, so code they add follows the same patterns.

## What this is

A small MCP server on stdio, built on `@modelcontextprotocol/server` v2.
`src/index.ts` starts it, `src/server.ts` builds it, and each file in
`src/tools/` registers one tool.

## Adding a tool

1. Create `src/tools/<name>.ts` exporting a `ToolModule` (copy
   `src/tools/time.ts`).
2. Add it to the `modules` array in `src/tools/index.ts`.
3. Add a test in `test/tools.test.ts`.
4. Run `npm run typecheck && npm test`.

Rules:
- Input schemas use `zod/v4` and `z.object({...})`. Describe every field with
  `.describe()`; the model reads these descriptions.
- Tool names are kebab-case verbs: `search-orders`, `create-invoice`.
- Always set `annotations` (`readOnlyHint`, `destructiveHint`, `openWorldHint`).
- Return `toolError(message)` for expected failures (bad input, not found,
  upstream down). Throw only for real bugs.
- If a tool returns data, add an `outputSchema` and return `structuredContent`
  alongside a short human-readable `text`.
- Never write to stdout (`console.log`). It breaks the stdio protocol. Use
  `log` from `src/lib/log.ts`, which writes to stderr.
- Secrets come from environment variables. Never hard-code them.

## Commands

- `npm test`           runs the server over stdio with a real MCP client
- `npm run typecheck`  TypeScript check
- `npm run build`      compiles to `dist/index.js`, the file clients start
- `npm run inspect`    MCP Inspector against the built server
