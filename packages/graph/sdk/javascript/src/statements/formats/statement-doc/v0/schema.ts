import type { FideEntityType, StatementInput } from "@chris-test/fcp";

export type FsdNodeRole = "subject" | "object";

export interface FsdNodeDefaults {
  entityType?: FideEntityType;
  referenceType?: FideEntityType;
}

export interface FsdPredicateDefaults {
  /** Prefix map used to resolve shorthand predicates like schema:name. */
  prefixes?: Record<string, string>;
}

export interface FsdDefaults {
  subject?: FsdNodeDefaults;
  object?: FsdNodeDefaults;
  predicate?: FsdPredicateDefaults;
}

export interface FsdNodeToken {
  entityType: FideEntityType;
  referenceType?: FideEntityType;
  referenceIdentifier: string;
}

export interface FsdStatementLine {
  line: number;
  subject: FsdNodeToken;
  predicateReferenceIdentifier: string;
  object: FsdNodeToken;
}

export interface ParsedFsdDocument {
  version: "v0";
  defaults: FsdDefaults;
  statements: FsdStatementLine[];
}

export interface ParseFsdOptions {
  /** Require the file to start with frontmatter. */
  requireFrontmatter?: boolean;
  /** Additional predicate prefixes for shorthand resolution. */
  predicatePrefixes?: Record<string, string>;
}

export interface FormatFsdOptions {
  includeFrontmatter?: boolean;
  defaults?: FsdDefaults;
  includeTerminator?: boolean;
}

export interface FsdParseErrorData {
  line: number;
  column?: number;
  reason: string;
}

export class FsdParseError extends Error {
  line: number;
  column?: number;

  constructor(data: FsdParseErrorData) {
    const where = data.column ? `line ${data.line}, col ${data.column}` : `line ${data.line}`;
    super(`FSD parse error at ${where}: ${data.reason}`);
    this.name = "FsdParseError";
    this.line = data.line;
    this.column = data.column;
  }
}

export type FsdStatementInput = StatementInput;
