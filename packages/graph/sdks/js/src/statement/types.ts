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
  normalizeRawIdentifier?: boolean;
}

export type StatementBatchWithRoot = CanonicalStatementSet;
