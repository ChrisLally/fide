import type { Statement } from "../types.js";
import { getForbiddenPredicateReason } from "./getForbiddenPredicateReason.js";

/**
 * Enforce predicate policy for already-built statements (batch context).
 *
 * Batch checks currently apply global forbidden-predicate rules to persisted
 * statement payloads.
 */
export function enforceStatementPredicateBatchPolicy(statements: Statement[]): void {
  for (let i = 0; i < statements.length; i += 1) {
    const predicateReferenceIdentifier = statements[i]?.predicateReferenceIdentifier;
    if (typeof predicateReferenceIdentifier !== "string") continue;

    const reason = getForbiddenPredicateReason(predicateReferenceIdentifier);
    if (reason) {
      throw new Error(
        `Invalid statement line ${i + 1}: predicate ${JSON.stringify(predicateReferenceIdentifier)} is not allowed. ${reason}`,
      );
    }
  }
}
