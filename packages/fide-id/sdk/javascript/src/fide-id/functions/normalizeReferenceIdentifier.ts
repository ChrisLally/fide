/**
 * Normalize reference identifiers.
 * normalizeReferenceIdentifier: general URL normalization for http(s)-style values.
 * normalizePredicateReferenceIdentifier: predicate-specific validation and canonicalization.
 */
import type {
  NormalizePredicateReferenceIdentifierOptions,
  NormalizeReferenceIdentifierOptions,
} from "../types.js";

/**
 * Normalize a reference identifier for general entity usage.
 *
 * For http(s) URLs this canonicalizes protocol/host casing and removes default ports.
 * Non-URL values are returned unchanged.
 *
 * @param referenceIdentifier Reference identifier value.
 * @param options Normalization options.
 * @paramDefault referenceIdentifier https://x.com/Alice
 * @paramDefault options { skipUrlNormalization: false }
 * @returns Normalized reference identifier.
 */
export function normalizeReferenceIdentifier(referenceIdentifier: string, options?: NormalizeReferenceIdentifierOptions): string {
  const skipUrlNormalization = options?.skipUrlNormalization === true;
  if (skipUrlNormalization) {
    return referenceIdentifier;
  }

  if (!/^https?:\/\//i.test(referenceIdentifier)) {
    return referenceIdentifier;
  }

  let url: URL;
  try {
    url = new URL(referenceIdentifier);
  } catch {
    throw new Error(
      `Invalid URL-like referenceIdentifier: ${referenceIdentifier}. Expected absolute URL when using http(s) format.`
    );
  }

  const protocol = url.protocol.toLowerCase();
  if (protocol !== "http:" && protocol !== "https:") {
    return referenceIdentifier;
  }

  url.protocol = protocol;
  url.hostname = url.hostname.toLowerCase();
  if ((protocol === "https:" && url.port === "443") || (protocol === "http:" && url.port === "80")) {
    url.port = "";
  }

  return url.toString();
}

/**
 * Normalize a predicate reference identifier to canonical URL form.
 *
 * Predicate reference identifiers must be canonical absolute `https` URLs without userinfo.
 *
 * @param referenceIdentifier Predicate reference identifier.
 * @param options Normalization options.
 * @paramDefault referenceIdentifier https://schema.org/name
 * @paramDefault options { skipUrlNormalization: false }
 * @returns Canonical predicate URL string.
 * @throws Error if referenceIdentifier cannot be normalized to a valid canonical predicate URL.
 */
export function normalizePredicateReferenceIdentifier(
  referenceIdentifier: string,
  options?: NormalizePredicateReferenceIdentifierOptions,
): string {
  const skipUrlNormalization = options?.skipUrlNormalization === true;
  if (skipUrlNormalization) {
    let skipUrl: URL;
    try {
      skipUrl = new URL(referenceIdentifier);
    } catch {
      throw new Error(
        `Invalid predicate referenceIdentifier: ${referenceIdentifier}. Expected canonical full URL (e.g. https://schema.org/name).`
      );
    }

    if (skipUrl.protocol.toLowerCase() !== "https:") {
      throw new Error(
        `Invalid predicate referenceIdentifier protocol: ${referenceIdentifier}. Expected https URL.`
      );
    }

    if (skipUrl.username || skipUrl.password) {
      throw new Error(
        `Invalid predicate referenceIdentifier: ${referenceIdentifier}. URL userinfo is not allowed.`
      );
    }

    return referenceIdentifier;
  }

  const normalized = normalizeReferenceIdentifier(referenceIdentifier, { skipUrlNormalization });

  let url: URL;
  try {
    url = new URL(normalized);
  } catch {
    throw new Error(
      `Invalid predicate referenceIdentifier: ${referenceIdentifier}. Expected canonical full URL (e.g. https://schema.org/name).`
    );
  }

  if (url.protocol.toLowerCase() !== "https:") {
    throw new Error(
      `Invalid predicate referenceIdentifier protocol: ${referenceIdentifier}. Expected https URL.`
    );
  }

  if (url.username || url.password) {
    throw new Error(
      `Invalid predicate referenceIdentifier: ${referenceIdentifier}. URL userinfo is not allowed.`
    );
  }

  url.protocol = "https:";
  url.hostname = url.hostname.toLowerCase();
  if (url.port === "443") {
    url.port = "";
  }

  return url.toString();
}
