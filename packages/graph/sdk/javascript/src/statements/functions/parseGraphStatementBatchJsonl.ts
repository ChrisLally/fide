import { assertFideId, calculateStatementFideId, type FideId, type Statement } from "@chris-test/fcp";
import { enforceGraphStatementBatchPolicy, enforceGraphStatementWirePolicy } from "../policy/index.js";
import type { GraphStatementWire, ParsedGraphStatementBatch } from "../types.js";
import { sha256Hex } from "../utils.js";

async function graphWireToStatement(wire: GraphStatementWire): Promise<Statement> {
  assertFideId(wire.s);
  assertFideId(wire.p);
  assertFideId(wire.o);

  const subjectFideId = wire.s as FideId;
  const predicateFideId = wire.p as FideId;
  const objectFideId = wire.o as FideId;
  const statementFideId = await calculateStatementFideId(subjectFideId, predicateFideId, objectFideId);

  return {
    subjectFideId,
    subjectReferenceIdentifier: wire.sr,
    predicateFideId,
    predicateReferenceIdentifier: wire.pr,
    objectFideId,
    objectReferenceIdentifier: wire.or,
    statementFideId,
  };
}

/**
 * Parse a JSONL graph statement batch into validated wires, statements, IDs, and batch root.
 *
 * Each non-empty line must be a JSON object in Graph wire format. The parser validates wire shape,
 * converts each wire into a protocol statement, derives statement Fide IDs, and computes the
 * deterministic batch root from the sorted statement IDs.
 *
 * @param input JSONL string containing one graph statement wire per line.
 * @paramDefault input "{\"s\":\"did:fide:0x15a1b2c3d4e5f6789012345678901234567890ab\",\"sr\":\"https://x.com/alice\",\"p\":\"did:fide:0x655e4f6fe94f721628ec6c5d88703f1f4f945a2f\",\"pr\":\"https://schema.org/knows\",\"o\":\"did:fide:0x15b1b2c3d4e5f6789012345678901234567890cd\",\"or\":\"https://x.com/bob\"}\n{\"s\":\"did:fide:0x15a1b2c3d4e5f6789012345678901234567890ab\",\"sr\":\"https://x.com/alice\",\"p\":\"did:fide:0x655e4f6fe94f721628ec6c5d88703f1f4f945a2f\",\"pr\":\"https://schema.org/memberOf\",\"o\":\"did:fide:0x11c1d2e3f45678901234567890123456789012ef\",\"or\":\"https://example.com/org/acme\"}"
 * @returns Parsed statement wires, converted statements, calculated statement IDs, and deterministic batch root.
 * @throws Error if the input is empty, a line is invalid JSON, a wire fails policy checks, or statement/Fide ID derivation fails.
 */
export async function parseGraphStatementBatchJsonl(input: string): Promise<ParsedGraphStatementBatch> {
  if (typeof input !== "string" || input.trim().length === 0) {
    throw new Error("Invalid graph statement batch: expected non-empty JSONL string");
  }

  const lines = input
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  if (lines.length === 0) {
    throw new Error("Invalid graph statement batch: no statement lines found");
  }

  const statementWires = lines.map((line, index) => {
    let parsed: unknown;
    try {
      parsed = JSON.parse(line);
    } catch {
      throw new Error(`Invalid statement line ${index + 1}: invalid JSON`);
    }
    return enforceGraphStatementWirePolicy(index + 1, parsed);
  });

  const statements = await Promise.all(statementWires.map((wire) => graphWireToStatement(wire)));
  const statementFideIds = enforceGraphStatementBatchPolicy(statements);
  const root = await sha256Hex([...statementFideIds].sort().join("\n"));

  return { statements, statementWires, statementFideIds, root };
}
