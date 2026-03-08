import type { FideId, Statement, StatementInput } from "@chris-test/fcp";

export type {
  StatementInput,
  Statement,
};

export interface CanonicalStatementSet {
  statements: Statement[];
  statementFideIds: FideId[];
  root: string;
}

export interface StatementBuildOptions {
  normalizeReferenceIdentifier?: boolean;
}

export type StatementBatchWithRoot = CanonicalStatementSet;

export interface GraphStatementWire {
  s: string;
  sr: string;
  p: string;
  pr: string;
  o: string;
  or: string;
}

export interface ParsedGraphStatementBatch {
  statements: Statement[];
  statementWires: GraphStatementWire[];
  statementFideIds: string[];
  root: string;
}
