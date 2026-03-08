import type { FideEntityType } from "../types.js";
import { assertFideId } from "../functions/assertFideId.js";
import { normalizeReferenceIdentifier } from "../functions/normalizeReferenceIdentifier.js";

function parseUriScheme(referenceIdentifier: string): string | null {
  const match = referenceIdentifier.match(/^([a-z][a-z0-9+.-]*):(.+)$/i);
  if (!match) {
    return null;
  }
  return match[1]!.toLowerCase();
}

function assertStatementReferenceIdentifier(referenceIdentifier: string): void {
  const parts = referenceIdentifier.split("|");
  if (parts.length !== 3) {
    throw new Error(
      `Invalid Statement referenceIdentifier: expected "subject|predicate|object" Fide IDs; got ${JSON.stringify(referenceIdentifier)}.`,
    );
  }

  const [subject, predicate, object] = parts;
  assertFideId(subject!);
  assertFideId(predicate!);
  assertFideId(object!);
}

function assertNetworkResourceReferenceIdentifier(referenceIdentifier: string): void {
  const scheme = parseUriScheme(referenceIdentifier);
  if (!scheme) {
    throw new Error(
      `Invalid NetworkResource referenceIdentifier: ${JSON.stringify(referenceIdentifier)}. Expected an absolute URI (scheme:value). ` +
        `Use normalizeReferenceIdentifier(referenceIdentifier) before calculateFideId(...) when canonicalizing URLs.`,
    );
  }

  if (scheme === "http" || scheme === "https") {
    let url: URL;
    try {
      url = new URL(referenceIdentifier);
    } catch {
      throw new Error(
        `Invalid ${scheme.toUpperCase()} NetworkResource referenceIdentifier: ${JSON.stringify(referenceIdentifier)}. ` +
          `Use normalizeReferenceIdentifier(referenceIdentifier) before calculateFideId(...).`,
      );
    }
    if (!url.hostname) {
      throw new Error(
        `Invalid ${scheme.toUpperCase()} NetworkResource referenceIdentifier: ${JSON.stringify(referenceIdentifier)}. Expected hostname.`,
      );
    }
    const normalized = normalizeReferenceIdentifier(referenceIdentifier);
    if (normalized !== referenceIdentifier) {
      throw new Error(
        `Non-canonical ${scheme.toUpperCase()} NetworkResource referenceIdentifier: ${JSON.stringify(referenceIdentifier)}. ` +
          `Expected canonical form ${JSON.stringify(normalized)} before calculateFideId(...).`,
      );
    }
    return;
  }

  if (scheme === "did" && !/^did:[a-z0-9]+:.+/i.test(referenceIdentifier)) {
    throw new Error(
      `Invalid DID NetworkResource referenceIdentifier: ${JSON.stringify(referenceIdentifier)}. Expected did:<method>:<method-specific-id>.`,
    );
  }
  if (scheme === "urn" && !/^urn:[a-z0-9][a-z0-9-]{0,31}:.+/i.test(referenceIdentifier)) {
    throw new Error(
      `Invalid URN NetworkResource referenceIdentifier: ${JSON.stringify(referenceIdentifier)}. Expected urn:<nid>:<nss>.`,
    );
  }
  if (scheme === "acct" && !/^acct:[^@\s]+@[^@\s]+$/i.test(referenceIdentifier)) {
    throw new Error(
      `Invalid acct NetworkResource referenceIdentifier: ${JSON.stringify(referenceIdentifier)}. Expected acct:user@host.`,
    );
  }
  if (scheme === "mailto" && !/^mailto:[^@\s]+@[^@\s]+$/i.test(referenceIdentifier)) {
    throw new Error(
      `Invalid mailto NetworkResource referenceIdentifier: ${JSON.stringify(referenceIdentifier)}. Expected mailto:user@example.com.`,
    );
  }
}

function assertTextLiteralReferenceIdentifier(referenceIdentifier: string): void {
  // Any string is valid; text literals are hashed from the exact text value.
  void referenceIdentifier;
}

function assertIntegerLiteralReferenceIdentifier(referenceIdentifier: string): void {
  if (!/^-?(0|[1-9][0-9]*)$/.test(referenceIdentifier)) {
    throw new Error(
      `Invalid IntegerLiteral referenceIdentifier: ${JSON.stringify(referenceIdentifier)}. Expected a base-10 integer string.`,
    );
  }
}

function assertDecimalLiteralReferenceIdentifier(referenceIdentifier: string): void {
  if (!/^-?(0|[1-9][0-9]*)(\.[0-9]+)?$/.test(referenceIdentifier)) {
    throw new Error(
      `Invalid DecimalLiteral referenceIdentifier: ${JSON.stringify(referenceIdentifier)}. Expected a base-10 decimal string without scientific notation.`,
    );
  }
}

function assertBoolLiteralReferenceIdentifier(referenceIdentifier: string): void {
  if (referenceIdentifier !== "true" && referenceIdentifier !== "false") {
    throw new Error(
      `Invalid BoolLiteral referenceIdentifier: ${JSON.stringify(referenceIdentifier)}. Expected true or false.`,
    );
  }
}

function assertDateLiteralReferenceIdentifier(referenceIdentifier: string): void {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(referenceIdentifier)) {
    throw new Error(
      `Invalid DateLiteral referenceIdentifier: ${JSON.stringify(referenceIdentifier)}. Expected YYYY-MM-DD.`,
    );
  }
}

function assertTimeLiteralReferenceIdentifier(referenceIdentifier: string): void {
  if (!/^\d{2}:\d{2}:\d{2}Z$/.test(referenceIdentifier)) {
    throw new Error(
      `Invalid TimeLiteral referenceIdentifier: ${JSON.stringify(referenceIdentifier)}. Expected HH:MM:SSZ.`,
    );
  }
}

function assertDateTimeLiteralReferenceIdentifier(referenceIdentifier: string): void {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/.test(referenceIdentifier)) {
    throw new Error(
      `Invalid DateTimeLiteral referenceIdentifier: ${JSON.stringify(referenceIdentifier)}. Expected YYYY-MM-DDTHH:MM:SSZ.`,
    );
  }
}

function assertDurationLiteralReferenceIdentifier(referenceIdentifier: string): void {
  if (!/^P(?=\d|T\d)(\d+Y)?(\d+M)?(\d+D)?(T(\d+H)?(\d+M)?(\d+S)?)?$/.test(referenceIdentifier)) {
    throw new Error(
      `Invalid DurationLiteral referenceIdentifier: ${JSON.stringify(referenceIdentifier)}. Expected ISO 8601 duration format.`,
    );
  }
}

function assertURILiteralReferenceIdentifier(referenceIdentifier: string): void {
  const scheme = parseUriScheme(referenceIdentifier);
  if (!scheme) {
    throw new Error(
      `Invalid URILiteral referenceIdentifier: ${JSON.stringify(referenceIdentifier)}. Expected a URI string.`,
    );
  }
}

function stableJSONStringify(value: unknown): string {
  if (value === null || typeof value !== "object") {
    return JSON.stringify(value);
  }

  if (Array.isArray(value)) {
    return `[${value.map((item) => stableJSONStringify(item)).join(",")}]`;
  }

  const entries = Object.entries(value as Record<string, unknown>).sort(([a], [b]) => a.localeCompare(b));
  return `{${entries.map(([key, val]) => `${JSON.stringify(key)}:${stableJSONStringify(val)}`).join(",")}}`;
}

function assertJSONLiteralReferenceIdentifier(referenceIdentifier: string): void {
  let parsed: unknown;
  try {
    parsed = JSON.parse(referenceIdentifier);
  } catch {
    throw new Error(
      `Invalid JSONLiteral referenceIdentifier: ${JSON.stringify(referenceIdentifier)}. Expected canonical JSON string form.`,
    );
  }

  const canonical = stableJSONStringify(parsed);
  if (canonical !== referenceIdentifier) {
    throw new Error(
      `Invalid JSONLiteral referenceIdentifier: ${JSON.stringify(referenceIdentifier)}. Expected canonical JSON string form ${JSON.stringify(canonical)}.`,
    );
  }
}

/**
 * Reference identifier policy:
 * - For Statement reference type, referenceIdentifier must be StatementReferenceIdentifier (s|p|o Fide IDs).
 * - For NetworkResource reference type, referenceIdentifier must be an absolute URI.
 *   Known schemes get additional shape checks (http(s), did, urn, acct, mailto).
 * - For literal reference types, referenceIdentifier must match the declared literal lexical form.
 */
export function enforceReferenceIdentifierPolicy(
  referenceType: FideEntityType,
  referenceIdentifier: string,
): void {
  if (referenceType === "Statement") {
    assertStatementReferenceIdentifier(referenceIdentifier);
    return;
  }
  if (referenceType === "NetworkResource") {
    assertNetworkResourceReferenceIdentifier(referenceIdentifier);
    return;
  }
  if (referenceType === "TextLiteral") {
    assertTextLiteralReferenceIdentifier(referenceIdentifier);
    return;
  }
  if (referenceType === "IntegerLiteral") {
    assertIntegerLiteralReferenceIdentifier(referenceIdentifier);
    return;
  }
  if (referenceType === "DecimalLiteral") {
    assertDecimalLiteralReferenceIdentifier(referenceIdentifier);
    return;
  }
  if (referenceType === "BoolLiteral") {
    assertBoolLiteralReferenceIdentifier(referenceIdentifier);
    return;
  }
  if (referenceType === "DateLiteral") {
    assertDateLiteralReferenceIdentifier(referenceIdentifier);
    return;
  }
  if (referenceType === "TimeLiteral") {
    assertTimeLiteralReferenceIdentifier(referenceIdentifier);
    return;
  }
  if (referenceType === "DateTimeLiteral") {
    assertDateTimeLiteralReferenceIdentifier(referenceIdentifier);
    return;
  }
  if (referenceType === "DurationLiteral") {
    assertDurationLiteralReferenceIdentifier(referenceIdentifier);
    return;
  }
  if (referenceType === "URILiteral") {
    assertURILiteralReferenceIdentifier(referenceIdentifier);
    return;
  }
  if (referenceType === "JSONLiteral") {
    assertJSONLiteralReferenceIdentifier(referenceIdentifier);
  }
}
