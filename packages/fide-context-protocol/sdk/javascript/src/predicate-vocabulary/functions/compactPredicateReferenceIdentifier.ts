import { FCP_CURIE_PREFIX_IRIS } from "../constants.js";
import type { CompactPredicateReferenceIdentifierOptions } from "../types.js";

/**
 * Compact a full predicate IRI (e.g. `https://schema.org/name`) to CURIE form.
 *
 * Returns the original input unchanged when it does not match a configured prefix.
 *
 * @param referenceIdentifier Predicate reference identifier token.
 * @param options Prefix override options.
 * @returns CURIE form or original input.
 */
export function compactPredicateReferenceIdentifier(
  referenceIdentifier: string,
  options?: CompactPredicateReferenceIdentifierOptions,
): string {
  const map = {
    ...FCP_CURIE_PREFIX_IRIS,
    ...(options?.prefixes ?? {}),
  };

  for (const [prefix, base] of Object.entries(map)) {
    if (referenceIdentifier.startsWith(base)) {
      const local = referenceIdentifier.slice(base.length);
      if (local.length > 0) {
        return `${prefix}:${local}`;
      }
    }
  }

  return referenceIdentifier;
}
