import {
  calculateFideId,
  calculateStatementFideId,
  normalizeReferenceIdentifier,
  normalizePredicateReferenceIdentifier,
  type FideId,
} from "@chris-test/fide-id";
import { enforceStatementFideIdsPolicy } from "../policy/enforceStatementFideIdsPolicy.js";
import { enforceStatementInputPolicy } from "../policy/enforceStatementInputPolicy.js";
import { enforceStatementPredicateInputPolicy } from "../policy/enforceStatementPredicateInputPolicy.js";
import type { Statement, StatementBuildOptions, StatementInput } from "../types.js";

/**
 * Build a statement object with all required fields.
 *
 * Always computes Fide IDs from referenceIdentifier + entityType + referenceType.
 * Predicates must be canonical full URLs.
 *
 * @param input - Statement input with subject, predicate, and object
 * @paramDefault input { subject: { referenceIdentifier: "https://x.com/alice", entityType: "Person", referenceType: "NetworkResource" }, predicate: { referenceIdentifier: "https://schema.org/knows", entityType: "Concept", referenceType: "NetworkResource" }, object: { referenceIdentifier: "https://x.com/bob", entityType: "Person", referenceType: "NetworkResource" } }
 * @paramDefault options { normalizeReferenceIdentifier: true }
 * @policy Statement Input Policy | Validates the subject, predicate, and object input shape before any Fide IDs are calculated.
 * @policy Statement Predicate Policy | Validates predicate-specific input rules before any Fide IDs are calculated.
 * @policy Statement Fide IDs Policy | Validates the calculated subject, predicate, and object Fide IDs before building the final statement.
 * @policy Nested Fide ID Policies | Calls calculateFideId for each statement part, so reference type and reference identifier policies are also enforced.
 * @returns Complete statement object
 * @throws Error if statement input policy fails, Fide ID format/policy checks fail, or statement ID derivation fails
 */
export async function buildStatement(
  input: StatementInput,
  options?: StatementBuildOptions,
): Promise<Statement> {
  enforceStatementInputPolicy(input);
  enforceStatementPredicateInputPolicy(input);
  const shouldNormalizeReferenceIdentifier = options?.normalizeReferenceIdentifier === true;
  const subjectReferenceIdentifier = shouldNormalizeReferenceIdentifier
    ? normalizeReferenceIdentifier(input.subject.referenceIdentifier)
    : input.subject.referenceIdentifier;
  const predicateReferenceIdentifier = normalizePredicateReferenceIdentifier(
    input.predicate.referenceIdentifier,
    { skipUrlNormalization: !shouldNormalizeReferenceIdentifier },
  );
  const objectReferenceIdentifier = shouldNormalizeReferenceIdentifier
    ? normalizeReferenceIdentifier(input.object.referenceIdentifier)
    : input.object.referenceIdentifier;

  const subjectFideId = await calculateFideId(
    input.subject.entityType,
    input.subject.referenceType,
    subjectReferenceIdentifier
  );

  const predicateFideId: FideId = await calculateFideId(
    input.predicate.entityType,
    input.predicate.referenceType,
    predicateReferenceIdentifier
  );

  const objectFideId = await calculateFideId(
    input.object.entityType,
    input.object.referenceType,
    objectReferenceIdentifier
  );

  enforceStatementFideIdsPolicy(subjectFideId, predicateFideId, objectFideId);

  const statementFideId = await calculateStatementFideId(
    subjectFideId,
    predicateFideId,
    objectFideId
  );

  return {
    subjectFideId,
    subjectReferenceIdentifier,
    predicateFideId,
    predicateReferenceIdentifier,
    objectFideId,
    objectReferenceIdentifier,
    statementFideId,
  };
}
