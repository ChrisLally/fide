/**
 * @chris-test/fide-id
 *
 * Core functions for calculating, parsing, and validating Fide IDs in
 * JavaScript/TypeScript.
 */

export {
  calculateFideId,
  calculateStatementFideId,
} from "./fide-id/calculation/index.js";

export {
  normalizeReferenceIdentifier,
  normalizePredicateReferenceIdentifier,
} from "./fide-id/normalization/index.js";

export {
  assertFideId,
  buildFideIdFromParts,
  parseFideId,
} from "./fide-id/validation-parsing/index.js";

export {
  buildStatementReferenceIdentifier,
} from "./fide-id/statement/index.js";

export {
  FIDE_NAMESPACE_URL,
  FIDE_SPEC_VERSION,
  FIDE_SPEC_DATE,
  FIDE_ENTITY_TYPE_MAP,
  FIDE_CHAR_TO_ENTITY_TYPE,
  FIDE_ID_PREFIX,
  FIDE_ID_HEX_LENGTH,
  FIDE_ID_LENGTH,
  FIDE_ID_FINGERPRINT_LENGTH,
} from "./fide-id/index.js";

export type {
  FideEntityType,
  FideStatementPredicateEntityType,
  FideStatementPredicateReferenceType,
} from "./fide-id/index.js";

export type { FideIdCalculationOptions } from "./fide-id/calculation/index.js";

export type {
  NormalizeReferenceIdentifierOptions,
  NormalizePredicateReferenceIdentifierOptions,
} from "./fide-id/normalization/index.js";

export type {
  FideEntityTypeChar,
  FideId,
  FideFingerprint,
  ParsedFideId,
} from "./fide-id/validation-parsing/index.js";

export type { StatementReferenceIdentifier } from "./fide-id/statement/index.js";
