/**
 * Normalize raw identifiers.
 * normalizeRawIdentifier: general URL normalization for http(s)-style values.
 * normalizePredicateRawIdentifier: predicate-specific validation and canonicalization.
 */

export type NormalizeRawIdentifierOptions = {
  skipUrlNormalization?: boolean;
};

/**
 * Normalize a raw identifier for general entity usage.
 *
 * For http(s) URLs this canonicalizes protocol/host casing and removes default ports.
 * Non-URL values are returned unchanged.
 *
 * @param rawIdentifier Raw identifier value.
 * @param options Normalization options.
 * @paramDefault rawIdentifier https://x.com/Alice
 * @paramDefault options { skipUrlNormalization: false }
 * @returns Normalized raw identifier.
 */
export function normalizeRawIdentifier(rawIdentifier: string, options?: NormalizeRawIdentifierOptions): string {
  const skipUrlNormalization = options?.skipUrlNormalization === true;
  if (skipUrlNormalization) {
    return rawIdentifier;
  }

  if (!/^https?:\/\//i.test(rawIdentifier)) {
    return rawIdentifier;
  }

  let url: URL;
  try {
    url = new URL(rawIdentifier);
  } catch {
    throw new Error(
      `Invalid URL-like rawIdentifier: ${rawIdentifier}. Expected absolute URL when using http(s) format.`
    );
  }

  const protocol = url.protocol.toLowerCase();
  if (protocol !== "http:" && protocol !== "https:") {
    return rawIdentifier;
  }

  url.protocol = protocol;
  url.hostname = url.hostname.toLowerCase();
  if ((protocol === "https:" && url.port === "443") || (protocol === "http:" && url.port === "80")) {
    url.port = "";
  }

  return url.toString();
}

/**
 * Normalize and validate a predicate raw identifier.
 *
 * Predicates must be canonical absolute `https` URLs without userinfo.
 *
 * @param rawIdentifier Predicate raw identifier.
 * @param options Normalization options.
 * @paramDefault rawIdentifier https://schema.org/name
 * @paramDefault options { skipUrlNormalization: false }
 * @returns Canonical predicate URL string.
 * @throws Error if rawIdentifier is not a valid canonical predicate URL.
 */
export function normalizePredicateRawIdentifier(
  rawIdentifier: string,
  options?: NormalizeRawIdentifierOptions,
): string {
  const skipUrlNormalization = options?.skipUrlNormalization === true;
  if (skipUrlNormalization) {
    let skipUrl: URL;
    try {
      skipUrl = new URL(rawIdentifier);
    } catch {
      throw new Error(
        `Invalid predicate rawIdentifier: ${rawIdentifier}. Expected canonical full URL (e.g. https://schema.org/name).`
      );
    }

    if (skipUrl.protocol.toLowerCase() !== "https:") {
      throw new Error(
        `Invalid predicate rawIdentifier protocol: ${rawIdentifier}. Expected https URL.`
      );
    }

    if (skipUrl.username || skipUrl.password) {
      throw new Error(
        `Invalid predicate rawIdentifier: ${rawIdentifier}. URL userinfo is not allowed.`
      );
    }

    return rawIdentifier;
  }

  const normalized = normalizeRawIdentifier(rawIdentifier, { skipUrlNormalization });

  let url: URL;
  try {
    url = new URL(normalized);
  } catch {
    throw new Error(
      `Invalid predicate rawIdentifier: ${rawIdentifier}. Expected canonical full URL (e.g. https://schema.org/name).`
    );
  }

  if (url.protocol.toLowerCase() !== "https:") {
    throw new Error(
      `Invalid predicate rawIdentifier protocol: ${rawIdentifier}. Expected https URL.`
    );
  }

  if (url.username || url.password) {
    throw new Error(
      `Invalid predicate rawIdentifier: ${rawIdentifier}. URL userinfo is not allowed.`
    );
  }

  url.protocol = "https:";
  url.hostname = url.hostname.toLowerCase();
  if (url.port === "443") {
    url.port = "";
  }

  return url.toString();
}
