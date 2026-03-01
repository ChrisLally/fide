import type { FideEntityType } from "../types.js";
import { assertFideId } from "../functions/assertFideId.js";

function parseUriScheme(rawIdentifier: string): string | null {
  const match = rawIdentifier.match(/^([a-z][a-z0-9+.-]*):(.+)$/i);
  if (!match) {
    return null;
  }
  return match[1]!.toLowerCase();
}

function assertStatementRawIdentifier(rawIdentifier: string): void {
  const parts = rawIdentifier.split("|");
  if (parts.length !== 3) {
    throw new Error(
      `Invalid Statement rawIdentifier: expected "subject|predicate|object" Fide IDs; got ${JSON.stringify(rawIdentifier)}.`,
    );
  }

  const [subject, predicate, object] = parts;
  assertFideId(subject!);
  assertFideId(predicate!);
  assertFideId(object!);
}

function assertNetworkResourceRawIdentifier(rawIdentifier: string): void {
  const scheme = parseUriScheme(rawIdentifier);
  if (!scheme) {
    throw new Error(
      `Invalid NetworkResource rawIdentifier: ${JSON.stringify(rawIdentifier)}. Expected an absolute URI (scheme:value). ` +
        `Use normalizeRawIdentifier(rawIdentifier) before calculateFideId(...) when canonicalizing URLs.`,
    );
  }

  if (scheme === "http" || scheme === "https") {
    let url: URL;
    try {
      url = new URL(rawIdentifier);
    } catch {
      throw new Error(
        `Invalid ${scheme.toUpperCase()} NetworkResource rawIdentifier: ${JSON.stringify(rawIdentifier)}. ` +
          `Use normalizeRawIdentifier(rawIdentifier) before calculateFideId(...).`,
      );
    }
    if (!url.hostname) {
      throw new Error(
        `Invalid ${scheme.toUpperCase()} NetworkResource rawIdentifier: ${JSON.stringify(rawIdentifier)}. Expected hostname.`,
      );
    }
    return;
  }

  if (scheme === "did" && !/^did:[a-z0-9]+:.+/i.test(rawIdentifier)) {
    throw new Error(
      `Invalid DID NetworkResource rawIdentifier: ${JSON.stringify(rawIdentifier)}. Expected did:<method>:<method-specific-id>.`,
    );
  }
  if (scheme === "urn" && !/^urn:[a-z0-9][a-z0-9-]{0,31}:.+/i.test(rawIdentifier)) {
    throw new Error(
      `Invalid URN NetworkResource rawIdentifier: ${JSON.stringify(rawIdentifier)}. Expected urn:<nid>:<nss>.`,
    );
  }
  if (scheme === "acct" && !/^acct:[^@\s]+@[^@\s]+$/i.test(rawIdentifier)) {
    throw new Error(
      `Invalid acct NetworkResource rawIdentifier: ${JSON.stringify(rawIdentifier)}. Expected acct:user@host.`,
    );
  }
  if (scheme === "mailto" && !/^mailto:[^@\s]+@[^@\s]+$/i.test(rawIdentifier)) {
    throw new Error(
      `Invalid mailto NetworkResource rawIdentifier: ${JSON.stringify(rawIdentifier)}. Expected mailto:user@example.com.`,
    );
  }
}

/**
 * Raw identifier policy:
 * - For Statement source type, rawIdentifier must be StatementRawIdentifier (s|p|o Fide IDs).
 * - For NetworkResource source type, rawIdentifier must be an absolute URI.
 *   Known schemes get additional shape checks (http(s), did, urn, acct, mailto).
 */
export function enforceRawIdentifierPolicy(
  sourceEntityType: FideEntityType,
  rawIdentifier: string,
): void {
  if (sourceEntityType === "Statement") {
    assertStatementRawIdentifier(rawIdentifier);
    return;
  }
  if (sourceEntityType === "NetworkResource") {
    assertNetworkResourceRawIdentifier(rawIdentifier);
  }
}
