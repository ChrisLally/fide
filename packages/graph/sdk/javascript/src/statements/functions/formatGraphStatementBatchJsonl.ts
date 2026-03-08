import type { GraphStatementWire } from "../types.js";

/**
 * Format graph statement wires as newline-delimited JSON (JSONL).
 *
 * Each wire is serialized as a single JSON object line, and the returned string always ends with a
 * trailing newline to make it suitable for file output and append-friendly pipelines.
 *
 * @param statementWires Graph statement wire records to serialize.
 * @paramDefault statementWires [{ s: "did:fide:0x15a1b2c3d4e5f6789012345678901234567890ab", sr: "https://x.com/alice", p: "did:fide:0x655e4f6fe94f721628ec6c5d88703f1f4f945a2f", pr: "https://schema.org/knows", o: "did:fide:0x15b1b2c3d4e5f6789012345678901234567890cd", or: "https://x.com/bob" }]
 * @returns JSONL string containing one serialized wire per line, with a trailing newline.
 * @throws Error if `statementWires` is empty or not an array.
 */
export function formatGraphStatementBatchJsonl(statementWires: GraphStatementWire[]): string {
  if (!Array.isArray(statementWires) || statementWires.length === 0) {
    throw new Error("Invalid graph statement batch: expected one or more statement wires.");
  }

  return `${statementWires.map((wire) => JSON.stringify(wire)).join("\n")}\n`;
}
