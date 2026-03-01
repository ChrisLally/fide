/**
 * FCP SDK Types
 * Central location for all TypeScript type definitions
 */

import { FIDE_ENTITY_TYPE_MAP } from "./constants.js";

/**
 * Valid FCP entity type names derived from `FIDE_ENTITY_TYPE_MAP`.
 * @docs /fcp/docs/entities
 */
export type FideEntityType = keyof typeof FIDE_ENTITY_TYPE_MAP;

/**
 * Allowed entity types for statement predicates.
 *
 * - `Concept`: schema/ontology predicate IRIs (defined terms)
 * @docs /fcp/docs/schema/#predicate
*/
export type FideStatementPredicateEntityType = "Concept";

/**
 * Allowed source types for statement predicates.
 *
 * - `NetworkResource`: predicate IRIs are treated as network-resource-sourced vocabulary terms
 */
export type FideStatementPredicateSourceType = "NetworkResource";

/**
 * Two-character FCP type codes (hex) derived from `FIDE_ENTITY_TYPE_MAP`.
 */
export type FideEntityTypeChar = typeof FIDE_ENTITY_TYPE_MAP[FideEntityType];

/**
 * Full Fide ID format (with did:fide:0x prefix).
 * Length: 11 ("did:fide:0x") + 40 hex = 51 chars.
 */
export type FideId = `did:fide:0x${string}`;

/**
 * Statement raw identifier: pipe-delimited s|p|o (subject, predicate, object Fide IDs).
 * Always 155 chars (51 + 1 + 51 + 1 + 51). No whitespace.
 * TypeScript cannot enforce exact length; this enforces format structure.
 */
export type StatementRawIdentifier = `${FideId}|${FideId}|${FideId}`;

/**
 * Fide ID fingerprint segment (36 hex characters, 18 bytes).
 */
export type FideFingerprint = string;

/**
 * Options for Fide ID calculation helpers.
 *
 * Reserved for forward-compatible toggles without changing function signatures.
 */
export interface FideIdCalculationOptions {
  /**
   * If true, normalize rawIdentifier before policy checks and hashing.
   * Uses `normalizeRawIdentifier`, primarily canonicalizing http(s) URLs.
   * Default is false.
   */
  normalizeRawIdentifier?: boolean;
  /**
   * If true, skip source-type policy enforcement in calculateFideId.
   * Default is false (policy enforced).
   */
  dangerouslySkipSourceTypePolicy?: boolean;
  /**
   * If true, skip rawIdentifier policy enforcement in calculateFideId.
   * Default is false (policy enforced).
   */
  dangerouslySkipRawIdentifierPolicy?: boolean;
}

/**
 * Parsed Fide ID components.
 */
export interface ParsedFideId {
    /** The full Fide ID string */
    fideId: FideId;
    /** Entity type code (2 hex chars from Part 1 of the Fide ID). */
    typeChar: FideEntityTypeChar;
    /** Source type code (2 hex chars from Part 2 of the Fide ID). */
    sourceChar: FideEntityTypeChar;
    /** Resolved entity type name from `FIDE_CHAR_TO_ENTITY_TYPE[typeChar]`. */
    entityType: FideEntityType;
    /** Resolved source type name from `FIDE_CHAR_TO_ENTITY_TYPE[sourceChar]`. */
    sourceType: FideEntityType;
    /** Fingerprint segment (Part 3, 36 hex chars). */
    fingerprint: FideFingerprint;
}
