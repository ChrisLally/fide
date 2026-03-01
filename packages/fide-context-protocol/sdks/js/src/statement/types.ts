/**
 * Statement module types.
 */
import type {
  FideId,
  FideEntityType,
  FideStatementPredicateEntityType,
  FideStatementPredicateSourceType,
} from "../fide-id/types.js";

/**
 * Input for creating a statement.
 *
 * All triples require rawIdentifier + entityType + sourceType. The SDK always computes
 * Fide IDs internally to avoid trust/validation issues with pre-calculated hashes.
 */
export interface StatementInput {
  /** Subject - raw identifier with entity type and source type */
  subject: { rawIdentifier: string; entityType: FideEntityType; sourceType: FideEntityType };
  /**
   * Predicate - explicit raw identifier with entity type and source type.
   * `rawIdentifier` must be a canonical full URL (https://...).
   * Entity type must be Concept.
   */
  predicate: {
    rawIdentifier: string;
    entityType: FideStatementPredicateEntityType;
    sourceType: FideStatementPredicateSourceType;
  };
  /** Object - raw identifier with entity type and source type */
  object: { rawIdentifier: string; entityType: FideEntityType; sourceType: FideEntityType };
}

/**
 * Statement build options.
 */
export interface StatementBuildOptions {
  /**
   * If true, normalize URL-like raw identifiers before hashing.
   * Predicate URL policy checks are always enforced regardless of this option.
   * Default is false.
   */
  normalizeRawIdentifier?: boolean;
}

/**
 * Complete statement object with all required fields
 *
 * **Important**: Both Fide IDs and raw identifiers are required because:
 * - Fide IDs are one-way hashes - cannot be reversed to get raw identifiers
 * - Protocol specification requires both fields
 * - Indexers need raw identifiers for lookup tables and human-readable display
 * - Enables mapping back to human-readable identifiers for debugging and display
 */
export interface Statement {
  /** Subject Fide ID */
  subjectFideId: FideId;
  /** Subject raw identifier (required - cannot be derived from Fide ID) */
  subjectRawIdentifier: string;
  /** Predicate Fide ID */
  predicateFideId: FideId;
  /** Predicate raw identifier (required - cannot be derived from Fide ID) */
  predicateRawIdentifier: string;
  /** Object Fide ID */
  objectFideId: FideId;
  /** Object raw identifier (required - cannot be derived from Fide ID) */
  objectRawIdentifier: string;
  /** Statement Fide ID (calculated) */
  statementFideId?: FideId;
}

/**
 * Batch build result with deterministic content root.
 */
export interface CanonicalStatementSet {
  statements: Statement[];
  statementFideIds: FideId[];
  /** Deterministic SHA-256 hex hash of ordered statement Fide IDs. */
  root: string;
}

// Backward-compatible alias.
export type StatementBatchWithRoot = CanonicalStatementSet;
