/**
 * @chris-test/fcp - Fide Context Protocol SDK
 *
 * Core functions for calculating Fide IDs and working with
 * the FCP protocol in JavaScript/TypeScript.
 */

export {
  calculateFideId,
  calculateStatementFideId,
  normalizeReferenceIdentifier,
  normalizePredicateReferenceIdentifier,
  FIDE_NAMESPACE_URL as FCP_NAMESPACE_URL,
  FIDE_SPEC_VERSION as FCP_SPEC_VERSION,
  FIDE_SPEC_DATE as FCP_SPEC_DATE,
  FIDE_ENTITY_TYPE_MAP,
  FIDE_CHAR_TO_ENTITY_TYPE,
  FIDE_ID_PREFIX,
  FIDE_ID_HEX_LENGTH,
  FIDE_ID_LENGTH,
  FIDE_ID_FINGERPRINT_LENGTH,
} from "@chris-test/fide-id";

export type {
  FideEntityType,
  FideStatementPredicateEntityType,
  FideStatementPredicateReferenceType,
  FideIdCalculationOptions,
  NormalizeReferenceIdentifierOptions,
  NormalizePredicateReferenceIdentifierOptions,
  FideEntityTypeChar,
  FideId,
  FideFingerprint,
  ParsedFideId,
  StatementReferenceIdentifier,
} from "@chris-test/fide-id";

export {
  compactPredicateReferenceIdentifier,
  expandPredicateReferenceIdentifier,
  STANDARD_CURIE_PREFIXES,
} from "./predicate-vocabulary/index.js";

export type {
  CompactPredicateReferenceIdentifierOptions,
  ExpandPredicateReferenceIdentifierOptions,
} from "./predicate-vocabulary/index.js";

export {
  buildStatement,
  calculateCanonicalStatementSetRoot,
  calculateStatementSetRoot,
  type StatementInput,
  type Statement,
  type CanonicalStatementSet,
} from "./statement/index.js";
