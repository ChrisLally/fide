import {
  FIDE_ENTITY_TYPE_MAP,
  expandPredicateReferenceIdentifier,
  type FideEntityType,
  type StatementInput,
} from "@chris-test/fcp";
import {
  FSD_DEFAULT_SOURCE_TYPES,
  FSD_ESCAPES,
  FSD_PREDICATE_DEFAULTS,
  FSD_TOKENS,
  FSD_VERSION,
} from "./grammar.js";
import { FsdParseError, type FsdDefaults, type ParseFsdOptions, type ParsedFsdDocument, type FsdNodeToken } from "./schema.js";

const VALID_ENTITY_TYPES = new Set(Object.keys(FIDE_ENTITY_TYPE_MAP));

function parseFrontmatter(lines: string[]): { defaults: FsdDefaults; startLine: number } {
  const defaults: FsdDefaults = {};
  if (lines.length === 0 || lines[0].trim() !== FSD_TOKENS.frontmatterDelimiter) {
    return { defaults, startLine: 1 };
  }

  let i = 1;
  let scope: "subject" | "object" | "predicate" | "meta" | null = null;
  let sawEnd = false;

  for (; i < lines.length; i += 1) {
    const raw = lines[i];
    const line = raw.trimEnd();
    const trimmed = line.trim();

    if (trimmed === FSD_TOKENS.frontmatterDelimiter) {
      sawEnd = true;
      i += 1;
      break;
    }

    if (!trimmed || trimmed.startsWith(FSD_TOKENS.commentPrefix)) continue;

    const typeMatch = line.match(/^type:\s*(.+?)\s*$/);
    if (typeMatch) {
      const typeValue = stripWrappingQuotes(typeMatch[1]);
      if (typeValue !== "fide-statements") {
        throw new FsdParseError({ line: i + 1, reason: `Unsupported statement document type: ${typeValue}` });
      }
      continue;
    }

    const versionMatch = line.match(/^version:\s*(.+?)\s*$/);
    if (versionMatch) {
      const versionValue = stripWrappingQuotes(versionMatch[1]);
      if (versionValue !== "v0") {
        throw new FsdParseError({ line: i + 1, reason: `Unsupported statement document version: ${versionValue}` });
      }
      continue;
    }

    const formatMatch = line.match(/^format:\s*(.+?)\s*$/);
    if (formatMatch) {
      const formatValue = stripWrappingQuotes(formatMatch[1]);
      if (formatValue !== "fsd") {
        throw new FsdParseError({ line: i + 1, reason: `Unsupported statement document format: ${formatValue}` });
      }
      continue;
    }

    if (trimmed === "defaults:") {
      scope = null;
      continue;
    }
    if (trimmed === "meta:") {
      scope = "meta";
      continue;
    }

    const sectionMatch = line.match(/^\s{2}(subject|object|predicate):\s*$/);
    if (sectionMatch) {
      scope = sectionMatch[1] as "subject" | "object" | "predicate";
      defaults[scope] = defaults[scope] ?? {};
      continue;
    }

    const valueMatch = line.match(/^\s{4}(source|entity):\s*(.+?)\s*$/);
    if (valueMatch && (scope === "subject" || scope === "object")) {
      const key = valueMatch[1];
      const rawValue = stripWrappingQuotes(valueMatch[2]);
      assertEntityType(rawValue, i + 1, 1);
      if (key === "source") {
        defaults[scope] = { ...defaults[scope], referenceType: rawValue };
      } else {
        defaults[scope] = { ...defaults[scope], entityType: rawValue };
      }
      continue;
    }

    const prefixMatch = line.match(/^\s{4}prefix\.(\w+):\s*(.+?)\s*$/);
    if (prefixMatch && scope === "predicate") {
      const prefix = prefixMatch[1];
      const base = stripWrappingQuotes(prefixMatch[2]);
      defaults.predicate = defaults.predicate ?? {};
      defaults.predicate.prefixes = { ...(defaults.predicate.prefixes ?? {}), [prefix]: base };
      continue;
    }

    // Optional metadata block for provenance/audit fields.
    if (scope === "meta") {
      const metaKV = line.match(/^\s{2}[A-Za-z0-9_.-]+:\s*(.+?)\s*$/);
      if (metaKV) continue;
    }

    throw new FsdParseError({ line: i + 1, reason: `Unsupported frontmatter line: ${trimmed}` });
  }

  if (!sawEnd) {
    throw new FsdParseError({ line: 1, reason: "Unclosed frontmatter block" });
  }

  return { defaults, startLine: i + 1 };
}

function stripWrappingQuotes(value: string): string {
  if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
    return value.slice(1, -1);
  }
  return value;
}

function assertEntityType(value: string, line: number, column: number): asserts value is FideEntityType {
  if (!VALID_ENTITY_TYPES.has(value)) {
    throw new FsdParseError({ line, column, reason: `Unknown entity/reference type: ${value}` });
  }
}

function unescapeFsdValue(value: string, line: number): string {
  let out = "";
  for (let i = 0; i < value.length; i += 1) {
    const ch = value[i];
    if (ch !== FSD_TOKENS.escape) {
      out += ch;
      continue;
    }

    const next = value[i + 1];
    if (!next) {
      throw new FsdParseError({ line, column: i + 1, reason: "Dangling escape character" });
    }

    const replacement = FSD_ESCAPES[next as keyof typeof FSD_ESCAPES];
    if (replacement === undefined) {
      throw new FsdParseError({ line, column: i + 1, reason: `Unsupported escape sequence: \\${next}` });
    }

    out += replacement;
    i += 1;
  }
  return out;
}

function parseNodeToken(line: string, lineNo: number, start: number): { token: FsdNodeToken; next: number } {
  let cursor = start;
  while (cursor < line.length && /\s/.test(line[cursor])) cursor += 1;

  if (line[cursor] !== FSD_TOKENS.itemStart) {
    throw new FsdParseError({ line: lineNo, column: cursor + 1, reason: `Expected '${FSD_TOKENS.itemStart}'` });
  }

  cursor += 1;
  let raw = "";
  let escaped = false;
  let closed = false;

  for (; cursor < line.length; cursor += 1) {
    const ch = line[cursor];
    if (!escaped && ch === FSD_TOKENS.itemEnd) {
      closed = true;
      cursor += 1;
      break;
    }

    if (!escaped && ch === FSD_TOKENS.escape) {
      escaped = true;
      raw += ch;
      continue;
    }

    escaped = false;
    raw += ch;
  }

  if (!closed) {
    throw new FsdParseError({ line: lineNo, column: start + 1, reason: "Unclosed bracket token" });
  }

  const colonIndex = findUnescapedChar(raw, FSD_TOKENS.itemValueSeparator);
  if (colonIndex <= 0) {
    throw new FsdParseError({ line: lineNo, column: start + 1, reason: "Token must contain type and identifier separated by ':'" });
  }

  const typePart = raw.slice(0, colonIndex).trim();
  const identifierPart = raw.slice(colonIndex + 1);
  const typeSegments = typePart.split(FSD_TOKENS.itemTypeSeparator).map((part) => part.trim()).filter(Boolean);

  if (typeSegments.length === 0 || typeSegments.length > 2) {
    throw new FsdParseError({ line: lineNo, column: start + 1, reason: `Invalid type segment: ${typePart}` });
  }

  const [entityTypeRaw, referenceTypeRaw] = typeSegments;
  assertEntityType(entityTypeRaw, lineNo, start + 1);

  const entityType: FideEntityType = entityTypeRaw;
  let referenceType: FideEntityType | undefined;
  if (referenceTypeRaw) {
    assertEntityType(referenceTypeRaw, lineNo, start + 1);
    referenceType = referenceTypeRaw;
  }

  return {
    token: {
      entityType,
      referenceType,
      referenceIdentifier: unescapeFsdValue(identifierPart, lineNo),
    },
    next: cursor,
  };
}

function findUnescapedChar(input: string, target: string): number {
  let escaped = false;
  for (let i = 0; i < input.length; i += 1) {
    const ch = input[i];
    if (!escaped && ch === target) return i;
    if (!escaped && ch === FSD_TOKENS.escape) {
      escaped = true;
      continue;
    }
    escaped = false;
  }
  return -1;
}

function parsePredicateToken(line: string, lineNo: number, start: number): { raw: string; next: number } {
  let cursor = start;
  while (cursor < line.length && /\s/.test(line[cursor])) cursor += 1;
  if (cursor >= line.length) {
    throw new FsdParseError({ line: lineNo, column: cursor + 1, reason: "Missing predicate token" });
  }

  let end = cursor;
  while (end < line.length && !/\s/.test(line[end])) end += 1;
  return { raw: line.slice(cursor, end), next: end };
}

function resolvePredicateReferenceIdentifier(token: string, defaults: FsdDefaults, options: ParseFsdOptions): string {
  const overrides = {
    ...(defaults.predicate?.prefixes ?? {}),
    ...(options.predicatePrefixes ?? {}),
  };

  return expandPredicateReferenceIdentifier(token, {
    prefixes: Object.keys(overrides).length > 0 ? overrides : undefined,
  });
}

function applyNodeDefaults(role: "subject" | "object", token: FsdNodeToken, defaults: FsdDefaults): FsdNodeToken {
  const section = defaults[role];
  return {
    entityType: token.entityType ?? section?.entityType,
    referenceType: token.referenceType ?? section?.referenceType ?? FSD_DEFAULT_SOURCE_TYPES[role],
    referenceIdentifier: token.referenceIdentifier,
  } as FsdNodeToken;
}

function parseStatementLine(raw: string, lineNo: number, defaults: FsdDefaults, options: ParseFsdOptions) {
  const line = raw.trim();
  if (!line || line.startsWith(FSD_TOKENS.commentPrefix)) return null;

  const subjectNode = parseNodeToken(line, lineNo, 0);
  const predicate = parsePredicateToken(line, lineNo, subjectNode.next);
  const objectNode = parseNodeToken(line, lineNo, predicate.next);

  const trailing = line.slice(objectNode.next).trim();
  if (trailing && trailing !== FSD_TOKENS.tripleTerminator && !trailing.startsWith(`${FSD_TOKENS.tripleTerminator}${FSD_TOKENS.commentPrefix}`) && !trailing.startsWith(FSD_TOKENS.commentPrefix)) {
    throw new FsdParseError({ line: lineNo, column: objectNode.next + 1, reason: `Unexpected trailing content: ${trailing}` });
  }

  let predicateReferenceIdentifier: string;
  try {
    predicateReferenceIdentifier = resolvePredicateReferenceIdentifier(predicate.raw, defaults, options);
  } catch (error) {
    throw new FsdParseError({ line: lineNo, reason: error instanceof Error ? error.message : String(error) });
  }

  return {
    line: lineNo,
    subject: applyNodeDefaults("subject", subjectNode.token, defaults),
    predicateReferenceIdentifier,
    object: applyNodeDefaults("object", objectNode.token, defaults),
  };
}

export function parseFsd(content: string, options: ParseFsdOptions = {}): ParsedFsdDocument {
  const normalized = content.replace(/\r\n?/g, "\n");
  const lines = normalized.split("\n");

  if (options.requireFrontmatter && lines[0]?.trim() !== FSD_TOKENS.frontmatterDelimiter) {
    throw new FsdParseError({ line: 1, reason: "Expected frontmatter block starting with ---" });
  }

  const { defaults, startLine } = parseFrontmatter(lines);
  const statements = [] as ParsedFsdDocument["statements"];

  for (let i = startLine - 1; i < lines.length; i += 1) {
    const parsed = parseStatementLine(lines[i], i + 1, defaults, options);
    if (!parsed) continue;
    statements.push(parsed);
  }

  if (statements.length === 0) {
    throw new FsdParseError({ line: startLine, reason: "No statements found" });
  }

  return {
    version: FSD_VERSION,
    defaults,
    statements,
  };
}

export function parseFsdToStatementInputs(content: string, options: ParseFsdOptions = {}): StatementInput[] {
  const parsed = parseFsd(content, options);
  return parsed.statements.map((item) => ({
    subject: {
      referenceIdentifier: item.subject.referenceIdentifier,
      entityType: item.subject.entityType,
      referenceType: item.subject.referenceType!,
    },
    predicate: {
      referenceIdentifier: item.predicateReferenceIdentifier,
      entityType: FSD_PREDICATE_DEFAULTS.entityType,
      referenceType: FSD_PREDICATE_DEFAULTS.referenceType,
    },
    object: {
      referenceIdentifier: item.object.referenceIdentifier,
      entityType: item.object.entityType,
      referenceType: item.object.referenceType!,
    },
  }));
}
