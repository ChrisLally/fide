import { FCP_CURIE_PREFIX_IRIS } from "../constants.js";
import type { ExpandPredicateReferenceIdentifierOptions } from "../types.js";

/**
 * Expand a prefixed predicate token (e.g. `schema:name`) to a full IRI.
 *
 * If `referenceIdentifier` is already an absolute URL, it is returned unchanged.
 * If `referenceIdentifier` contains a prefix not found in the configured map, throws.
 *
 * @param referenceIdentifier Predicate reference identifier token.
 * @param options Prefix override options.
 * @returns Expanded full IRI or original absolute URL.
 */
export function expandPredicateReferenceIdentifier(
  referenceIdentifier: string,
  options?: ExpandPredicateReferenceIdentifierOptions,
): string {
  if (/^https?:\/\//i.test(referenceIdentifier)) {
    return referenceIdentifier;
  }

  const idx = referenceIdentifier.indexOf(":");
  if (idx <= 0) {
    return referenceIdentifier;
  }

  const prefix = referenceIdentifier.slice(0, idx);
  const local = referenceIdentifier.slice(idx + 1);
  if (!prefix || !local) {
    return referenceIdentifier;
  }

  const map = {
    ...FCP_CURIE_PREFIX_IRIS,
    ...(options?.prefixes ?? {}),
  };
  const base = map[prefix];
  if (!base) {
    throw new Error(
      `Unknown predicate prefix: ${prefix}. Provide a full URL or configure this prefix explicitly.`,
    );
  }

  return `${base}${local}`;
}
