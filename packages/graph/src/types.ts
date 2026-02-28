import type { Statement } from "@chris-test/fcp";

/** Graph wire-format statement record used in ingestion JSONL batches. */
export type GraphStatementWire = {
  s: string;
  sr: string;
  p: string;
  pr: string;
  o: string;
  or: string;
};

/** Parsed graph ingestion batch derived from graph wire format. */
export type ParsedGraphStatementBatch = {
  statements: Statement[];
  statementWires: GraphStatementWire[];
  statementFideIds: string[];
  root: string;
};

// Backward-compatible aliases.
export type StatementWire = GraphStatementWire;
export type ParsedStatementBatch = ParsedGraphStatementBatch;
