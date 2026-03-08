import { FIDE_CHAR_TO_ENTITY_TYPE, FIDE_ID_PREFIX, FIDE_ID_LENGTH } from "../constants.js";
import type { FideEntityTypeChar, FideId } from "../types.js";

/**
 * Assert that a value is a properly formatted Fide ID.
 *
 * Valid format is:
 * `did:fide:0x` prefix followed by exactly 40 hexadecimal characters (case-insensitive).
 *
 * @param value The Fide ID reference (format: did:fide:0x...)
 * @paramDefault value did:fide:0x10205fcbdc6d73bcfcd2c73eb4795c2f02f1d1c1
 * @returns void
 * @throws TypeError if value is not a string
 * @throws Error if value is not a valid Fide ID format
 */
export function assertFideId(value: string): asserts value is FideId {
  if (typeof value !== "string") {
    throw new TypeError(`Invalid Fide ID: expected string, got ${typeof value}`);
  }

  const received = `${FIDE_ID_PREFIX}... (${value.length} chars)`;
  const expected = `${FIDE_ID_PREFIX}... (${FIDE_ID_LENGTH} chars)`;
  const issues: string[] = [];

  if (value.length !== FIDE_ID_LENGTH) {
    issues.push(
      `- Invalid length.\n  Received: ${received}\n  Expected: ${expected}`,
    );
  }
  if (!value.startsWith(FIDE_ID_PREFIX)) {
    issues.push(
      `- Invalid prefix.\n  Received: ${received}\n  Expected: ${expected}`,
    );
  }

  const hex = value.slice(FIDE_ID_PREFIX.length);
  const hasValidHex = /^[0-9a-f]{40}$/i.test(hex);
  if (!hasValidHex) {
    issues.push(
      `- Invalid hexadecimal payload.\n  Received: ${received}\n  Expected: ${expected}`,
    );
  }

  const canCheckTypeCodes =
    value.startsWith(FIDE_ID_PREFIX) &&
    value.length >= FIDE_ID_PREFIX.length + 4 &&
    /^[0-9a-f]{4}/i.test(value.slice(FIDE_ID_PREFIX.length, FIDE_ID_PREFIX.length + 4));
  if (canCheckTypeCodes) {
    const typeChar = value.slice(FIDE_ID_PREFIX.length, FIDE_ID_PREFIX.length + 2) as FideEntityTypeChar;
    const referenceChar = value.slice(FIDE_ID_PREFIX.length + 2, FIDE_ID_PREFIX.length + 4) as FideEntityTypeChar;

    if (!FIDE_CHAR_TO_ENTITY_TYPE[typeChar]) {
      issues.push(
        `- Invalid entity type code.\n  Received: ${typeChar}\n  Expected: one of known Fide entity type codes`,
      );
    }

    if (!FIDE_CHAR_TO_ENTITY_TYPE[referenceChar]) {
      issues.push(
        `- Invalid reference type code.\n  Received: ${referenceChar}\n  Expected: one of known Fide entity type codes`,
      );
    }
  }

  if (issues.length > 0) {
    throw new Error(
      `Invalid Fide ID format.\n${issues.join("\n")}`,
    );
  }
}
