import type { StatementInput } from "@chris-test/fcp";
import { FSD_PREDICATE_DEFAULTS, FSD_TOKENS, FSD_UNESCAPES } from "./grammar.js";
import type { FormatFsdOptions, ParsedFsdDocument, FsdNodeToken } from "./schema.js";

function escapeFsdValue(input: string): string {
  return input.replace(/\\|\]|\n/g, (match) => FSD_UNESCAPES[match] ?? match);
}

function formatNodeToken(token: FsdNodeToken, role: "subject" | "object", options: FormatFsdOptions): string {
  const defaultSource = options.defaults?.[role]?.referenceType;
  const typeLabel = token.referenceType && token.referenceType !== defaultSource
    ? `${token.entityType}${FSD_TOKENS.itemTypeSeparator}${token.referenceType}`
    : token.entityType;
  return `${FSD_TOKENS.itemStart}${typeLabel}${FSD_TOKENS.itemValueSeparator}${escapeFsdValue(token.referenceIdentifier)}${FSD_TOKENS.itemEnd}`;
}

function formatPredicate(referenceIdentifier: string, options: FormatFsdOptions): string {
  const prefixes = options.defaults?.predicate?.prefixes ?? {};
  for (const [prefix, base] of Object.entries(prefixes)) {
    if (referenceIdentifier.startsWith(base)) {
      return `${prefix}:${referenceIdentifier.slice(base.length)}`;
    }
  }
  return referenceIdentifier;
}

export function formatParsedFsd(document: ParsedFsdDocument, options: FormatFsdOptions = {}): string {
  const includeFrontmatter = options.includeFrontmatter ?? true;
  const includeTerminator = options.includeTerminator ?? false;
  const parts: string[] = [];

  if (includeFrontmatter) {
    parts.push(FSD_TOKENS.frontmatterDelimiter);
    parts.push("defaults:");
    if (document.defaults.subject?.referenceType) {
      parts.push("  subject:");
      parts.push(`    source: ${document.defaults.subject.referenceType}`);
    }
    if (document.defaults.object?.referenceType) {
      parts.push("  object:");
      parts.push(`    source: ${document.defaults.object.referenceType}`);
    }
    const predicatePrefixes = document.defaults.predicate?.prefixes ?? {};
    if (Object.keys(predicatePrefixes).length > 0) {
      parts.push("  predicate:");
      for (const [prefix, base] of Object.entries(predicatePrefixes)) {
        parts.push(`    prefix.${prefix}: ${base}`);
      }
    }
    parts.push(FSD_TOKENS.frontmatterDelimiter);
    parts.push("");
  }

  for (const statement of document.statements) {
    const subject = formatNodeToken(statement.subject, "subject", {
      ...options,
      defaults: document.defaults,
    });
    const predicate = formatPredicate(statement.predicateReferenceIdentifier, {
      ...options,
      defaults: document.defaults,
    });
    const object = formatNodeToken(statement.object, "object", {
      ...options,
      defaults: document.defaults,
    });

    const terminator = includeTerminator ? ` ${FSD_TOKENS.tripleTerminator}` : "";
    parts.push(`${subject} ${predicate} ${object}${terminator}`);
  }

  return `${parts.join("\n")}\n`;
}

export function formatStatementInputsAsFsd(inputs: StatementInput[], options: FormatFsdOptions = {}): string {
  const doc: ParsedFsdDocument = {
    version: "v0",
    defaults: options.defaults ?? {},
    statements: inputs.map((input, i) => {
      if (
        input.predicate.entityType !== FSD_PREDICATE_DEFAULTS.entityType ||
        input.predicate.referenceType !== FSD_PREDICATE_DEFAULTS.referenceType
      ) {
        throw new Error(`Statement ${i + 1} predicate type/source must be ${FSD_PREDICATE_DEFAULTS.entityType}/${FSD_PREDICATE_DEFAULTS.referenceType}`);
      }

      return {
        line: i + 1,
        subject: {
          entityType: input.subject.entityType,
          referenceType: input.subject.referenceType,
          referenceIdentifier: input.subject.referenceIdentifier,
        },
        predicateReferenceIdentifier: input.predicate.referenceIdentifier,
        object: {
          entityType: input.object.entityType,
          referenceType: input.object.referenceType,
          referenceIdentifier: input.object.referenceIdentifier,
        },
      };
    }),
  };

  return formatParsedFsd(doc, options);
}
