import { FIDE_ID_PREFIX, FIDE_ID_LENGTH } from "../constants.js";
import type { FideId } from "../types.js";

/**
 * Assert that a value is a properly formatted Fide ID.
 *
 * Valid format is:
 * `did:fide:0x` prefix followed by exactly 40 hexadecimal characters (case-insensitive).
 *
 * @param value The Fide ID reference (format: did:fide:0x...)
 * @returns void
 * @throws TypeError if value is not a string
 * @throws Error if value is not a valid Fide ID format
 */
export function assertFideId(value: string): asserts value is FideId {
  if (typeof value !== "string") {
    throw new TypeError(`Invalid Fide ID: expected string, got ${typeof value}`);
  }
  if (value.length !== FIDE_ID_LENGTH) {
    throw new Error(`Invalid Fide ID format: ${value}. Expected ${FIDE_ID_PREFIX}... (${FIDE_ID_LENGTH} chars)`);
  }
  if (!value.startsWith(FIDE_ID_PREFIX)) {
    throw new Error(`Invalid Fide ID format: ${value}. Expected ${FIDE_ID_PREFIX}... (${FIDE_ID_LENGTH} chars)`);
  }

  const hex = value.slice(FIDE_ID_PREFIX.length);
  if (!/^[0-9a-f]{40}$/i.test(hex)) {
    throw new Error(`Invalid Fide ID format: ${value}. Expected ${FIDE_ID_PREFIX}... (${FIDE_ID_LENGTH} chars)`);
  }
}
