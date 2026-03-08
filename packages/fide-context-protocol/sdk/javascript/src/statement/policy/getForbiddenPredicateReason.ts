import { STATEMENT_PREDICATE_POLICY_CONSTANTS } from "./statementPredicatePolicyConstants.js";
import { toCanonicalPredicateIri } from "./toCanonicalPredicateIri.js";

/**
 * Return the protocol-policy reason when a predicate is globally forbidden.
 */
export function getForbiddenPredicateReason(predicateReferenceIdentifier: string): string | null {
  const canonical = toCanonicalPredicateIri(predicateReferenceIdentifier);
  if (!canonical) return null;
  return STATEMENT_PREDICATE_POLICY_CONSTANTS.forbiddenPredicateRules[canonical] ?? null;
}
