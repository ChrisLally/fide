/**
 * Fide ID SDK module exports.
 */

// Core calculation functions
export { calculateFideId } from "./functions/calculateFideId.js";
export { calculateStatementFideId } from "./functions/calculateStatementFideId.js";
export { buildStatementReferenceIdentifier } from "./functions/buildStatementReferenceIdentifier.js";
export {
  normalizeReferenceIdentifier,
  normalizePredicateReferenceIdentifier,
} from "./functions/normalizeReferenceIdentifier.js";

// Utility functions
export { buildFideIdFromParts } from "./functions/buildFideIdFromParts.js";
export { assertFideId } from "./functions/assertFideId.js";
export { parseFideId } from "./functions/parseFideId.js";

// Constants
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
} from "./constants.js";

// Types
export type {
    FideEntityType,
    FideStatementPredicateEntityType,
    FideStatementPredicateReferenceType,
    FideIdCalculationOptions,
    NormalizePredicateReferenceIdentifierOptions,
    NormalizeReferenceIdentifierOptions,
    FideEntityTypeChar,
    FideId,
    FideFingerprint,
    ParsedFideId,
    StatementReferenceIdentifier
} from "./types.js";
