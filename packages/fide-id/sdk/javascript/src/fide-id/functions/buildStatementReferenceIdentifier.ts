import { assertFideId } from "./assertFideId.js";
import type { StatementReferenceIdentifier } from "../types.js";

/**
 * Build the canonical reference identifier string for a Statement.
 *
 * Format: `s|p|o` (subject, predicate, object) separated by ASCII `|`. No whitespace.
 * Always 155 chars. Validated at runtime via assertFideId.
 *
 * @param subjectFideId Subject Fide ID.
 * @param predicateFideId Predicate Fide ID.
 * @param objectFideId Object Fide ID.
 * @paramDefault subjectFideId did:fide:0x10205fcbdc6d73bcfcd2c73eb4795c2f02f1d1c1
 * @paramDefault predicateFideId did:fide:0x312047e49369039d57063d0535a246065fbf9c9e
 * @paramDefault objectFideId did:fide:0x1020f200f70f531f0f9cce26e9f4bf0bfa5f15d6
 * @returns Canonical statement reference identifier in `subject|predicate|object` format.
 */
export function buildStatementReferenceIdentifier(
  subjectFideId: string,
  predicateFideId: string,
  objectFideId: string
): StatementReferenceIdentifier {
  assertFideId(subjectFideId);
  assertFideId(predicateFideId);
  assertFideId(objectFideId);
  return `${subjectFideId}|${predicateFideId}|${objectFideId}`;
}
