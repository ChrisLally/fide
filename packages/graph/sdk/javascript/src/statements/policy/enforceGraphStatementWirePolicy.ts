import type { GraphStatementWire } from "../types.js";

function assertString(value: unknown, field: keyof GraphStatementWire, lineNumber: number): string {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`Invalid statement line ${lineNumber}: expected non-empty string at ${field}`);
  }
  return value;
}

export function enforceGraphStatementWirePolicy(lineNumber: number, parsed: unknown): GraphStatementWire {
  if (!parsed || typeof parsed !== "object") {
    throw new Error(`Invalid statement line ${lineNumber}: expected object`);
  }

  const obj = parsed as Record<string, unknown>;
  return {
    s: assertString(obj.s, "s", lineNumber),
    sr: assertString(obj.sr, "sr", lineNumber),
    p: assertString(obj.p, "p", lineNumber),
    pr: assertString(obj.pr, "pr", lineNumber),
    o: assertString(obj.o, "o", lineNumber),
    or: assertString(obj.or, "or", lineNumber),
  };
}
