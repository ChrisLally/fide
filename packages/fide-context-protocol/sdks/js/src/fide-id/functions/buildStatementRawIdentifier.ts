/**
 * Build the canonical raw identifier string for a Statement.
 *
 * Format: `s|p|o` (subject, predicate, object) separated by ASCII `|`. No whitespace.
 * Always 155 chars. Validated at runtime via assertFideId.
 */
import { assertFideId } from "./assertFideId.js";
import type { StatementRawIdentifier } from "../types.js";

export function buildStatementRawIdentifier(
  subjectFideId: string,
  predicateFideId: string,
  objectFideId: string
): StatementRawIdentifier {
  assertFideId(subjectFideId);
  assertFideId(predicateFideId);
  assertFideId(objectFideId);
  return `${subjectFideId}|${predicateFideId}|${objectFideId}`;
}
