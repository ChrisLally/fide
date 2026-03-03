/**
 * FCP SDK - Statement Module (protocol primitives)
 */
export { buildStatement } from "./functions/buildStatement.js";
export { buildStatementsWithRoot, buildCanonicalStatementSet } from "./functions/buildStatementsWithRoot.js";
export {
  calculateCanonicalStatementSetRoot,
  calculateStatementSetRoot,
} from "./functions/calculateCanonicalStatementSetRoot.js";

export type {
  Statement,
  CanonicalStatementSet,
  StatementBatchWithRoot,
  StatementBuildOptions,
  StatementInput,
} from "./types.js";
