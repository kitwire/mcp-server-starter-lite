import * as z from 'zod/v4';
import { text, toolError, type ToolModule } from './types.js';

/**
 * Example: a pure, deterministic tool with structured output.
 * No I/O, so it is trivial to test and safe to mark read-only and idempotent.
 */

const LINEAR: Record<string, Record<string, number>> = {
    length: { mm: 0.001, cm: 0.01, m: 1, km: 1000, in: 0.0254, ft: 0.3048, yd: 0.9144, mi: 1609.344 },
    mass: { mg: 0.000001, g: 0.001, kg: 1, t: 1000, oz: 0.028349523125, lb: 0.45359237 },
    volume: { ml: 0.001, l: 1, m3: 1000, tsp: 0.00492892, tbsp: 0.0147868, cup: 0.236588, gal: 3.78541 }
};

const TEMP = ['c', 'f', 'k'] as const;

function toKelvin(v: number, unit: string) {
    if (unit === 'c') return v + 273.15;
    if (unit === 'f') return ((v - 32) * 5) / 9 + 273.15;
    return v;
}

function fromKelvin(v: number, unit: string) {
    if (unit === 'c') return v - 273.15;
    if (unit === 'f') return ((v - 273.15) * 9) / 5 + 32;
    return v;
}

export function convert(value: number, from: string, to: string): { result: number; kind: string } | undefined {
    const f = from.toLowerCase();
    const t = to.toLowerCase();
    if ((TEMP as readonly string[]).includes(f) && (TEMP as readonly string[]).includes(t)) {
        return { result: fromKelvin(toKelvin(value, f), t), kind: 'temperature' };
    }
    for (const [kind, table] of Object.entries(LINEAR)) {
        const a = table[f];
        const b = table[t];
        if (a !== undefined && b !== undefined) return { result: (value * a) / b, kind };
    }
    return undefined;
}

const units = [...Object.values(LINEAR).flatMap(t => Object.keys(t)), ...TEMP].join(', ');

export const registerConvertTool: ToolModule = server => {
    server.registerTool(
        'convert-units',
        {
            title: 'Convert units',
            description: `Convert a value between units of length, mass, volume or temperature. Supported: ${units}.`,
            inputSchema: z.object({
                value: z.number().describe('The number to convert'),
                from: z.string().describe('Source unit, e.g. "km" or "f"'),
                to: z.string().describe('Target unit, e.g. "mi" or "c"')
            }),
            outputSchema: z.object({ value: z.number(), from: z.string(), to: z.string(), result: z.number(), kind: z.string() }),
            annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false }
        },
        async ({ value, from, to }) => {
            const out = convert(value, from, to);
            if (!out) return toolError(`Cannot convert "${from}" to "${to}". Supported units: ${units}.`);
            const result = Math.round(out.result * 1e6) / 1e6;
            return {
                ...text(`${value} ${from} = ${result} ${to}`),
                structuredContent: { value, from, to, result, kind: out.kind }
            };
        }
    );
};
