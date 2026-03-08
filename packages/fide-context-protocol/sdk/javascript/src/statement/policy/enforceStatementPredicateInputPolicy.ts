import type { StatementInput } from "../types.js";
import { getForbiddenPredicateReason } from "./getForbiddenPredicateReason.js";
import { getRedundantTypeAssertionReason } from "./getRedundantTypeAssertionReason.js";

/**
 * Enforce predicate policy for a single statement input.
 *
 * - rejects globally forbidden predicates
 * - rejects redundant base-type assertions derived from exact FCP mappings
 */
export function enforceStatementPredicateInputPolicy(input: StatementInput): void {
  const predicateReferenceIdentifier = input?.predicate?.referenceIdentifier;
  if (typeof predicateReferenceIdentifier !== "string") return;

  const forbiddenReason = getForbiddenPredicateReason(predicateReferenceIdentifier);
  if (forbiddenReason) {
    throw new Error(
      `Invalid predicate ${JSON.stringify(predicateReferenceIdentifier)}: ${forbiddenReason}`,
    );
  }

  const redundancyReason = getRedundantTypeAssertionReason(input);
  if (redundancyReason) {
    throw new Error(
      `Invalid predicate ${JSON.stringify(predicateReferenceIdentifier)}: ${redundancyReason}`,
    );
  }
}
