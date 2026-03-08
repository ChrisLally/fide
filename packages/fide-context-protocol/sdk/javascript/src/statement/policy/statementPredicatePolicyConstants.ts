import { FIDE_ENTITY_TYPES } from "@chris-test/fide-vocabulary";
import { STANDARD_CURIE_PREFIXES } from "../../predicate-vocabulary/index.js";

/**
 * Canonical predicate URIs that are not allowed at protocol level.
 */
const FORBIDDEN_PREDICATE_RULES: Record<string, string> = {
  "https://schema.org/identifier":
    "Entity identifiers are implicit in Fide IDs and reference identifiers; do not add redundant identifier predicates.",
  "https://schema.org/sameAs":
    "Use http://www.w3.org/2002/07/owl#sameAs for strict identity assertions; https://schema.org/sameAs is not allowed in FCP statements.",
};

/**
 * Predicates treated as type assertion channels.
 */
const TYPE_ASSERTION_PREDICATE_URIS = new Set<string>([
  "http://www.w3.org/1999/02/22-rdf-syntax-ns#type",
  "https://schema.org/additionalType",
]);

const EXACT_STANDARD_URIS_BY_ENTITY_TYPE: Record<string, Set<string>> = Object.fromEntries(
  Object.entries(FIDE_ENTITY_TYPES).map(([entityType, spec]) => {
    const uris = new Set<string>();
    if (spec.standardFit === "Exact") {
      for (const standard of spec.standards) {
        const [prefix, local] = standard.split(":");
        if (!prefix || !local) continue;
        const base = STANDARD_CURIE_PREFIXES[prefix];
        if (!base) continue;
        uris.add(`${base}${local}`);
      }
    }
    return [entityType, uris];
  }),
);

/**
 * Shared constants for statement predicate policy checks.
 */
export const STATEMENT_PREDICATE_POLICY_CONSTANTS = {
  forbiddenPredicateRules: FORBIDDEN_PREDICATE_RULES,
  typeAssertionPredicateUris: TYPE_ASSERTION_PREDICATE_URIS,
  exactStandardUrisByEntityType: EXACT_STANDARD_URIS_BY_ENTITY_TYPE,
} as const;
