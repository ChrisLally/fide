/**
 * @chris-test/fcp - Fide Context Protocol SDK
 *
 * Core functions for calculating Fide IDs and working with
 * the FCP protocol in JavaScript/TypeScript.
 */

// ============================================================================
// FIDE ID MODULE
// ============================================================================

// Core calculation functions
export {
    calculateFideId,
    calculateStatementFideId,
    buildStatementRawIdentifier,
    normalizeRawIdentifier,
    normalizePredicateRawIdentifier,
} from "./fide-id/index.js";

// Utility functions
export {
    assertFideId,
    buildFideIdFromParts,
    parseFideId,
} from "./fide-id/index.js";

// Constants
export {
    FCP_PROTOCOL_ID,
    FCP_PROTOCOL_GENERATION,
    FCP_SPEC_DATE,
    FIDE_ENTITY_TYPE_MAP,
    FIDE_CHAR_TO_ENTITY_TYPE,
    FIDE_ID_PREFIX,
    FIDE_ID_HEX_LENGTH,
    FIDE_ID_LENGTH,
    FIDE_ID_FINGERPRINT_LENGTH
} from "./fide-id/index.js";

// Types
export type {
    FideEntityType,
    FideStatementPredicateEntityType,
    FideStatementPredicateSourceType,
    FideEntityTypeChar,
    FideId,
    FideFingerprint,
    ParsedFideId,
    StatementRawIdentifier
} from "./fide-id/index.js";

// ============================================================================
// STATEMENT MODULE
// ============================================================================

export {
    buildStatement,
    calculateCanonicalStatementSetRoot,
    calculateStatementSetRoot,
    type StatementInput,
    type Statement,
    type CanonicalStatementSet
} from "./statement/index.js";
