import type { StatementInput } from "../types.js";
import { STATEMENT_PREDICATE_POLICY_CONSTANTS } from "./statementPredicatePolicyConstants.js";
import { toCanonicalPredicateIri } from "./toCanonicalPredicateIri.js";

/**
 * Return the policy reason when a statement asserts a redundant base type.
 *
 * A type assertion is redundant only when:
 * - predicate is a supported type-assertion predicate,
 * - subject entity type has one or more exact standard mappings,
 * - object equals one of those exact mapped standard IRIs.
 */
export function getRedundantTypeAssertionReason(input: StatementInput): string | null {
  const predicateIri = toCanonicalPredicateIri(input.predicate.referenceIdentifier);
  if (
    !predicateIri ||
    !STATEMENT_PREDICATE_POLICY_CONSTANTS.typeAssertionPredicateUris.has(predicateIri)
  ) {
    return null;
  }

  const exactStandardUris =
    STATEMENT_PREDICATE_POLICY_CONSTANTS.exactStandardUrisByEntityType[input.subject.entityType];
  if (!exactStandardUris || exactStandardUris.size === 0) {
    return null;
  }

  const objectIri = toCanonicalPredicateIri(input.object.referenceIdentifier);
  if (!objectIri || !exactStandardUris.has(objectIri)) {
    return null;
  }

  return (
    `redundant type assertion ${JSON.stringify(objectIri)} for ${input.subject.entityType}. ` +
    "Exact base type is already encoded in the subject Fide ID; omit this statement."
  );
}
