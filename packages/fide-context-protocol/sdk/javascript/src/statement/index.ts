/**
 * FCP SDK - Statement Module (protocol primitives)
 */
export { buildStatement } from "./functions/buildStatement.js";
export {
  calculateCanonicalStatementSetRoot,
  calculateStatementSetRoot,
} from "./functions/calculateCanonicalStatementSetRoot.js";

export type {
  Statement,
  CanonicalStatementSet,
  StatementBuildOptions,
  StatementInput,
} from "./types.js";
