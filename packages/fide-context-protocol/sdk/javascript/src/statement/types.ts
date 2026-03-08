/**
 * Statement module types.
 */
import type {
  FideId,
  FideEntityType,
  FideStatementPredicateEntityType,
  FideStatementPredicateReferenceType,
} from "@chris-test/fide-id";

/**
 * Input for creating a statement.
 *
 * All triples require referenceIdentifier + entityType + referenceType. The SDK always computes
 * Fide IDs internally to avoid trust/validation issues with pre-calculated hashes.
 */
export interface StatementInput {
  /** Subject - reference identifier with entity type and reference type */
  subject: { referenceIdentifier: string; entityType: FideEntityType; referenceType: FideEntityType };
  /**
   * Predicate - explicit reference identifier with entity type and reference type.
   * `referenceIdentifier` must be a canonical full URL (https://...).
   * Entity type must be Concept.
   */
  predicate: {
    referenceIdentifier: string;
    entityType: FideStatementPredicateEntityType;
    referenceType: FideStatementPredicateReferenceType;
  };
  /** Object - reference identifier with entity type and reference type */
  object: { referenceIdentifier: string; entityType: FideEntityType; referenceType: FideEntityType };
}

/**
 * Statement build options.
 */
export interface StatementBuildOptions {
  /**
   * If true, normalize URL-like reference identifiers before hashing.
   * Predicate URL policy checks are always enforced regardless of this option.
   * Default is false.
   */
  normalizeReferenceIdentifier?: boolean;
}

/**
 * Complete statement object with all required fields
 *
 * **Important**: Both Fide IDs and reference identifiers are required because:
 * - Fide IDs are one-way hashes - cannot be reversed to get reference identifiers
 * - Protocol specification requires both fields
 * - Indexers need reference identifiers for lookup tables and human-readable display
 * - Enables mapping back to human-readable identifiers for debugging and display
 */
export interface Statement {
  /** Subject Fide ID */
  subjectFideId: FideId;
  /** Subject reference identifier (required - cannot be derived from Fide ID) */
  subjectReferenceIdentifier: string;
  /** Predicate Fide ID */
  predicateFideId: FideId;
  /** Predicate reference identifier (required - cannot be derived from Fide ID) */
  predicateReferenceIdentifier: string;
  /** Object Fide ID */
  objectFideId: FideId;
  /** Object reference identifier (required - cannot be derived from Fide ID) */
  objectReferenceIdentifier: string;
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
