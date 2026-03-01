/**
 * Build a Fide ID from type code, source code, and fingerprint (no hashing).
 *
 * Use when you already have the fingerprint (e.g. from a database) and need to
 * reconstruct the full Fide ID. For computing a new Fide ID from a raw identifier,
 * use `calculateFideId` instead.
 *
 * @param typeChar Entity type code (2 hex chars, e.g. "10" for Person).
 * @param sourceChar Source type code (2 hex chars, e.g. "20" for NetworkResource).
 * @param fingerprint Content hash fingerprint (36 hex chars).
 * @returns The constructed Fide ID: `did:fide:0x{typeChar}{sourceChar}{fingerprint}`
 * @throws TypeError if any argument is not a string
 * @throws Error if format is invalid or type/source codes are unknown
 */
import { FIDE_ID_PREFIX } from "../constants.js";
import { assertFideId } from "./assertFideId.js";
import { parseFideId } from "./parseFideId.js";
import type { FideId } from "../types.js";

export function buildFideIdFromParts(
  typeChar: string,
  sourceChar: string,
  fingerprint: string
): FideId {
  if (typeof typeChar !== "string") {
    throw new TypeError(`Invalid typeChar: expected string, got ${typeof typeChar}`);
  }
  if (typeof sourceChar !== "string") {
    throw new TypeError(`Invalid sourceChar: expected string, got ${typeof sourceChar}`);
  }
  if (typeof fingerprint !== "string") {
    throw new TypeError(`Invalid fingerprint: expected string, got ${typeof fingerprint}`);
  }

  const fideId = `${FIDE_ID_PREFIX}${typeChar}${sourceChar}${fingerprint}`;
  assertFideId(fideId);
  parseFideId(fideId);
  return fideId;
}
