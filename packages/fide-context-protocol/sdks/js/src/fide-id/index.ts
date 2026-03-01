/**
 * FCP SDK - Fide ID Module
 * 
 * Re-exports all Fide ID utilities from submodules.
 */

// Core calculation functions
export { calculateFideId } from "./functions/calculateFideId.js";
export { calculateStatementFideId } from "./functions/calculateStatementFideId.js";
export { buildStatementRawIdentifier } from "./functions/buildStatementRawIdentifier.js";
export {
    normalizeRawIdentifier,
    normalizePredicateRawIdentifier,
    type NormalizeRawIdentifierOptions,
} from "./functions/normalizeRawIdentifier.js";

// Utility functions
export { buildFideIdFromParts } from "./functions/buildFideIdFromParts.js";
export { assertFideId } from "./functions/assertFideId.js";
export { parseFideId } from "./functions/parseFideId.js";

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
} from "./constants.js";

// Types
export type {
    FideEntityType,
    FideStatementPredicateEntityType,
    FideStatementPredicateSourceType,
    FideIdCalculationOptions,
    FideEntityTypeChar,
    FideId,
    FideFingerprint,
    ParsedFideId,
    StatementRawIdentifier
} from "./types.js";
