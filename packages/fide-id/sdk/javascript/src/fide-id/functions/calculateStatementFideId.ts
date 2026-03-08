import { calculateFideId } from "./calculateFideId.js";
import { buildStatementReferenceIdentifier } from "./buildStatementReferenceIdentifier.js";
import type { FideIdCalculationOptions } from "../types.js";

/**
 * Calculate a Fide ID for a Statement from its RDF triple components.
 *
 * Creates a statement Fide ID by hashing the reference identifier: concatenation of
 * subject, predicate, and object Fide IDs in that order, separated by ASCII `|`.
 * No whitespace. This helper always returns the self-referential Statement form (Entity Type/Reference Type = `0000`).
 *
 * @param subjectFideId The subject Fide ID (full format: `did:fide:0x` + 40 hex chars).
 * @param predicateFideId The predicate Fide ID (full format: `did:fide:0x` + 40 hex chars).
 * @param objectFideId The object Fide ID (full format: `did:fide:0x` + 40 hex chars).
 * @paramDefault subjectFideId did:fide:0x10205fcbdc6d73bcfcd2c73eb4795c2f02f1d1c1
 * @paramDefault predicateFideId did:fide:0x312047e49369039d57063d0535a246065fbf9c9e
 * @paramDefault objectFideId did:fide:0x1020f200f70f531f0f9cce26e9f4bf0bfa5f15d6
 * @policy Nested Fide ID Policies | Delegates to calculateFideId with Statement self-reference semantics, so reference type and reference identifier policies are enforced unless explicitly bypassed there.
 * @returns Promise resolving to the calculated statement Fide ID with format `did:fide:0x0000{fingerprint}`
 * @throws TypeError if any Fide ID is not a string
 * @throws Error if any Fide ID format is invalid or not in canonical form
 * @remarks
 * This function only validates Fide ID format and canonicalizes triple hashing.
 * It does not enforce higher-level statement semantics such as predicate-role rules.
 * For non-self-sourced statement IDs (for example `0020`), use `calculateFideId` directly.
 */
export async function calculateStatementFideId(
  subjectFideId: string,
  predicateFideId: string,
  objectFideId: string,
  options?: FideIdCalculationOptions
): Promise<`did:fide:0x${string}`> {
  return calculateFideId(
    "Statement",
    "Statement",
    buildStatementReferenceIdentifier(subjectFideId, predicateFideId, objectFideId),
    options
  );
}
