import { calculateFideId, calculateStatementFideId } from "../../fide-id/index.js";
import type { FideId } from "../../fide-id/types.js";
import {
  normalizeRawIdentifier,
  normalizePredicateRawIdentifier,
} from "../../fide-id/functions/normalizeRawIdentifier.js";
import { enforceStatementFideIdsPolicy } from "../policy/enforceStatementFideIdsPolicy.js";
import { enforceStatementInputPolicy } from "../policy/enforceStatementInputPolicy.js";
import type { Statement, StatementBuildOptions, StatementInput } from "../types.js";

/**
 * Build a statement object with all required fields.
 *
 * Always computes Fide IDs from rawIdentifier + entityType + sourceType.
 * Predicates must be canonical full URLs.
 *
 * @param input - Statement input with subject, predicate, and object
 * @paramDefault input { subject: { rawIdentifier: "https://x.com/alice", entityType: "Person", sourceType: "NetworkResource" }, predicate: { rawIdentifier: "https://schema.org/knows", entityType: "Concept", sourceType: "NetworkResource" }, object: { rawIdentifier: "https://x.com/bob", entityType: "Person", sourceType: "NetworkResource" } }
 * @paramDefault options { normalizeRawIdentifier: true }
 * @returns Complete statement object
 * @throws Error if statement input policy fails, Fide ID format/policy checks fail, or statement ID derivation fails
 */
export async function buildStatement(
  input: StatementInput,
  options?: StatementBuildOptions,
): Promise<Statement> {
  enforceStatementInputPolicy(input);
  const shouldNormalizeRawIdentifier = options?.normalizeRawIdentifier === true;
  const subjectRawIdentifier = shouldNormalizeRawIdentifier
    ? normalizeRawIdentifier(input.subject.rawIdentifier)
    : input.subject.rawIdentifier;
  const predicateRawIdentifier = normalizePredicateRawIdentifier(
    input.predicate.rawIdentifier,
    { skipUrlNormalization: !shouldNormalizeRawIdentifier },
  );
  const objectRawIdentifier = shouldNormalizeRawIdentifier
    ? normalizeRawIdentifier(input.object.rawIdentifier)
    : input.object.rawIdentifier;

  const subjectFideId = await calculateFideId(
    input.subject.entityType,
    input.subject.sourceType,
    subjectRawIdentifier
  );

  const predicateFideId: FideId = await calculateFideId(
    input.predicate.entityType,
    input.predicate.sourceType,
    predicateRawIdentifier
  );

  const objectFideId = await calculateFideId(
    input.object.entityType,
    input.object.sourceType,
    objectRawIdentifier
  );

  enforceStatementFideIdsPolicy(subjectFideId, predicateFideId, objectFideId);

  const statementFideId = await calculateStatementFideId(
    subjectFideId,
    predicateFideId,
    objectFideId
  );

  return {
    subjectFideId,
    subjectRawIdentifier,
    predicateFideId,
    predicateRawIdentifier,
    objectFideId,
    objectRawIdentifier,
    statementFideId,
  };
}
