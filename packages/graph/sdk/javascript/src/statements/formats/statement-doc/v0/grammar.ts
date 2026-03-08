import type { FideEntityType, FideStatementPredicateEntityType, FideStatementPredicateReferenceType } from "@chris-test/fcp";

/**
 * FSD (Fide Statement Definition) grammar constants.
 * Keep this module lexical-only; no parsing logic.
 */

export const FSD_VERSION = "v0" as const;

export const FSD_TOKENS = {
  frontmatterDelimiter: "---",
  itemStart: "[",
  itemEnd: "]",
  itemTypeSeparator: "/",
  itemValueSeparator: ":",
  commentPrefix: "#",
  escape: "\\",
  tripleTerminator: ".",
} as const;

export const FSD_ESCAPES = {
  "\\": "\\",
  "]": "]",
  n: "\n",
} as const;

export const FSD_UNESCAPES: Record<string, string> = {
  "\\": "\\",
  "]": "\\]",
  "\n": "\\n",
};

export const FSD_PREDICATE_DEFAULTS: {
  entityType: FideStatementPredicateEntityType;
  referenceType: FideStatementPredicateReferenceType;
} = {
  entityType: "Concept",
  referenceType: "NetworkResource",
};

export const FSD_DEFAULT_SOURCE_TYPES: {
  subject: FideEntityType;
  object: FideEntityType;
} = {
  subject: "NetworkResource",
  object: "NetworkResource",
};
