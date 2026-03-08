/**
 * Predicate vocabulary shorthand helpers.
 */

export { FCP_CURIE_PREFIX_IRIS as STANDARD_CURIE_PREFIXES } from "./constants.js";
export { expandPredicateReferenceIdentifier } from "./functions/expandPredicateReferenceIdentifier.js";
export { compactPredicateReferenceIdentifier } from "./functions/compactPredicateReferenceIdentifier.js";

export type {
  ExpandPredicateReferenceIdentifierOptions,
  CompactPredicateReferenceIdentifierOptions,
} from "./types.js";
