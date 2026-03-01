/**
 * Calculate a Fide ID for a Statement from its RDF triple components.
 *
 * Creates a statement Fide ID by hashing the raw identifier: concatenation of
 * subject, predicate, and object Fide IDs in that order, separated by ASCII `|`.
 * No whitespace. This helper always returns the self-sourced Statement form (Target/Source = `0000`).
 *
 * @param subjectFideId The subject Fide ID (full format: `did:fide:0x` + 40 hex chars).
 * @param predicateFideId The predicate Fide ID (full format: `did:fide:0x` + 40 hex chars).
 * @param objectFideId The object Fide ID (full format: `did:fide:0x` + 40 hex chars).
 * @returns Promise resolving to the calculated statement Fide ID with format `did:fide:0x0000{fingerprint}`
 * @throws TypeError if any Fide ID is not a string
 * @throws Error if any Fide ID format is invalid or not in canonical form
 * @remarks
 * This function only validates Fide ID format and canonicalizes triple hashing.
 * It does not enforce statement role policy (for example allowed predicate entity/source combos).
 * Role policy checks are enforced by `buildStatement`.
 * For non-self-sourced statement IDs (for example `0020`), use `calculateFideId` directly.
 */
import { calculateFideId } from "./calculateFideId.js";
import { buildStatementRawIdentifier } from "./buildStatementRawIdentifier.js";
import type { FideIdCalculationOptions } from "../types.js";

export async function calculateStatementFideId(
  subjectFideId: string,
  predicateFideId: string,
  objectFideId: string,
  options?: FideIdCalculationOptions
): Promise<`did:fide:0x${string}`> {
  return calculateFideId(
    "Statement",
    "Statement",
    buildStatementRawIdentifier(subjectFideId, predicateFideId, objectFideId),
    options
  );
}
