import { assertFideId, calculateStatementFideId, type FideId, type Statement } from "@chris-test/fcp";
import type { GraphStatementWire, ParsedGraphStatementBatch } from "../types.js";
import { calculateGraphStatementBatchRoot } from "./batch-root.js";

function assertString(value: unknown, field: string, lineNumber: number): string {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`Invalid statement line ${lineNumber}: expected non-empty string at ${field}`);
  }
  return value;
}

function parseLineToGraphWire(line: string, lineNumber: number): GraphStatementWire {
  let parsed: unknown;
  try {
    parsed = JSON.parse(line);
  } catch {
    throw new Error(`Invalid statement line ${lineNumber}: invalid JSON`);
  }

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

/**
 * Converts graph ingestion wire format into protocol-level FCP Statement.
 * @boundary graph -> fcp
 * @consumes GraphStatementWire
 * @produces Statement
 */
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
    subjectRawIdentifier: wire.sr,
    predicateFideId,
    predicateRawIdentifier: wire.pr,
    objectFideId,
    objectRawIdentifier: wire.or,
    statementFideId,
  };
}

/**
 * Parse a Fide graph JSONL statement batch into canonical statements and deterministic root.
 * @boundary graph -> fcp
 * @consumes string (graph JSONL)
 * @produces ParsedGraphStatementBatch
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

  const statementWires = lines.map((line, index) => parseLineToGraphWire(line, index + 1));
  const statements = await Promise.all(statementWires.map((wire) => graphWireToStatement(wire)));

  const statementFideIds = statements.map((statement, index) => {
    if (!statement.statementFideId) {
      throw new Error(`Invalid statement line ${index + 1}: missing computed statementFideId`);
    }
    return statement.statementFideId;
  });

  const root = await calculateGraphStatementBatchRoot(statementFideIds);
  return { statements, statementWires, statementFideIds, root };
}

// Backward-compatible alias while callers migrate.
export const parseStatementBatchJsonl = parseGraphStatementBatchJsonl;
