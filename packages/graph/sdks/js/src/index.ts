/**
 * @chris-test/graph - Graph SDK
 *
 * Graph-layer helpers for statement wire batches.
 */

export {
  buildStatementsWithRoot,
  buildCanonicalStatementSet,
} from "./statement/index.js";

export type {
  StatementInput,
  StatementBuildOptions,
  Statement,
  CanonicalStatementSet,
  StatementBatchWithRoot,
} from "./statement/index.js";
