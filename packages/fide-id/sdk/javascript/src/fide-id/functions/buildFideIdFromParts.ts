import { FIDE_ID_PREFIX } from "../constants.js";
import { assertFideId } from "./assertFideId.js";
import { parseFideId } from "./parseFideId.js";
import type { FideId } from "../types.js";

/**
 * Build a Fide ID from type code, source code, and fingerprint (no hashing).
 *
 * Use when you already have the fingerprint (e.g. from a database) and need to
 * reconstruct the full Fide ID. For computing a new Fide ID from a reference identifier,
 * use `calculateFideId` instead.
 *
 * @param typeChar Entity type code (2 hex chars, e.g. "10" for Person).
 * @param referenceChar Reference type code (2 hex chars, e.g. "20" for NetworkResource).
 * @param fingerprint Content hash fingerprint (36 hex chars).
 * @paramDefault typeChar 10
 * @paramDefault referenceChar 20
 * @paramDefault fingerprint 5fcbdc6d73bcfcd2c73eb4795c2f02f1d1c1
 * @returns The constructed Fide ID: `did:fide:0x{typeChar}{referenceChar}{fingerprint}`
 * @throws TypeError if any argument is not a string
 * @throws Error if format is invalid or type/source codes are unknown
 */
export function buildFideIdFromParts(
  typeChar: string,
  referenceChar: string,
  fingerprint: string
): FideId {
  if (typeof typeChar !== "string") {
    throw new TypeError(`Invalid typeChar: expected string, got ${typeof typeChar}`);
  }
  if (typeof referenceChar !== "string") {
    throw new TypeError(`Invalid referenceChar: expected string, got ${typeof referenceChar}`);
  }
  if (typeof fingerprint !== "string") {
    throw new TypeError(`Invalid fingerprint: expected string, got ${typeof fingerprint}`);
  }

  const fideId = `${FIDE_ID_PREFIX}${typeChar}${referenceChar}${fingerprint}`;
  assertFideId(fideId);
  parseFideId(fideId);
  return fideId;
}
