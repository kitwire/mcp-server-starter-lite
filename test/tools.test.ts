import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';
import { Client } from '@modelcontextprotocol/client';
import { StdioClientTransport } from '@modelcontextprotocol/client/stdio';

/**
 * These tests start the real server as a child process and talk to it over
 * stdio with the official MCP client: the same path Claude Desktop, Claude
 * Code, Cursor or VS Code take. No network needed.
 */

const root = fileURLToPath(new URL('..', import.meta.url));

const textOf = (result: { content?: unknown }) =>
    ((result.content as { type: string; text?: string }[]) ?? [])
        .filter(c => c.type === 'text')
        .map(c => c.text)
        .join('\n');

describe('MCP server over stdio', () => {
    let client: Client;

    before(async () => {
        const transport = new StdioClientTransport({
            command: process.execPath,
            args: ['--import', 'tsx', 'src/index.ts'],
            cwd: root,
            stderr: 'pipe'
        });
        client = new Client({ name: 'test-harness', version: '1.0.0' }, { versionNegotiation: { mode: 'auto' } });
        await client.connect(transport);
    });

    after(async () => {
        await client.close();
    });

    it('lists both tools, read-only', async () => {
        const { tools } = await client.listTools();
        assert.deepEqual(tools.map(t => t.name).sort(), ['convert-units', 'current-time']);
        for (const tool of tools) assert.equal(tool.annotations?.readOnlyHint, true);
    });

    it('current-time returns the time in the zone you ask for', async () => {
        const res = await client.callTool({ name: 'current-time', arguments: { timeZone: 'Asia/Tokyo' } });
        assert.equal(res.isError, undefined);
        const out = res.structuredContent as { timeZone: string; iso: string; local: string };
        assert.equal(out.timeZone, 'Asia/Tokyo');
        assert.ok(!Number.isNaN(Date.parse(out.iso)));
        assert.match(textOf(res), /\(Asia\/Tokyo\)$/);
    });

    it('current-time defaults to UTC', async () => {
        const res = await client.callTool({ name: 'current-time', arguments: {} });
        assert.equal((res.structuredContent as { timeZone: string }).timeZone, 'UTC');
    });

    it('current-time reports an unknown zone as a tool error', async () => {
        const res = await client.callTool({ name: 'current-time', arguments: { timeZone: 'Mars/Olympus' } });
        assert.equal(res.isError, true);
        assert.match(textOf(res), /Unknown time zone/);
    });

    it('convert-units returns structured output', async () => {
        const res = await client.callTool({ name: 'convert-units', arguments: { value: 10, from: 'km', to: 'mi' } });
        assert.equal(res.isError, undefined);
        assert.equal((res.structuredContent as { result: number }).result, 6.213712);
        const temp = await client.callTool({ name: 'convert-units', arguments: { value: 100, from: 'c', to: 'f' } });
        assert.equal((temp.structuredContent as { result: number }).result, 212);
    });

    it('convert-units reports units it cannot convert as a tool error', async () => {
        const res = await client.callTool({ name: 'convert-units', arguments: { value: 1, from: 'km', to: 'kg' } });
        assert.equal(res.isError, true);
        assert.match(textOf(res), /Cannot convert/);
    });

    it('rejects invalid input before the tool runs', async () => {
        const res = await client.callTool({ name: 'convert-units', arguments: { value: 'ten', from: 'km', to: 'mi' } });
        assert.equal(res.isError, true);
    });
});
