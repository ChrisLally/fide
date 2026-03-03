import type { CanonicalStatementSet, Statement, StatementInput } from "@chris-test/fcp";

export type {
  StatementInput,
  Statement,
  CanonicalStatementSet,
};

export interface StatementBuildOptions {
  normalizeRawIdentifier?: boolean;
}

export type StatementBatchWithRoot = CanonicalStatementSet;
