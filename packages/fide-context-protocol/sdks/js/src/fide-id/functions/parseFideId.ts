import { FIDE_ID_PREFIX, FIDE_CHAR_TO_ENTITY_TYPE } from "../constants.js";
import type { FideId, ParsedFideId, FideEntityTypeChar } from "../types.js";
import { assertFideId } from "./assertFideId.js";

/**
 * Parse a Fide ID into its constituent components.
 *
 * Decomposes a Fide ID into entity type code (2 hex), source type code (2 hex), and fingerprint (36 hex),
 * converting type/source codes to their corresponding entity type names.
 *
 * @param fideId The Fide ID reference (format: did:fide:0x...)
 * @paramDefault fideId did:fide:0x10205fcbdc6d73bcfcd2c73eb4795c2f02f1d1c1
 * @returns Parsed Fide ID components. `entityType` and `sourceType` are resolved via `FIDE_CHAR_TO_ENTITY_TYPE`.
 * @throws Error if invalid Fide ID format or if type characters do not map to known entity types
 */
export function parseFideId(fideId: FideId): ParsedFideId {
  assertFideId(fideId);

  const typeChar = fideId.slice(FIDE_ID_PREFIX.length, FIDE_ID_PREFIX.length + 2) as FideEntityTypeChar;
  const sourceChar = fideId.slice(FIDE_ID_PREFIX.length + 2, FIDE_ID_PREFIX.length + 4) as FideEntityTypeChar;
  const fingerprint = fideId.slice(FIDE_ID_PREFIX.length + 4);

  const entityType = FIDE_CHAR_TO_ENTITY_TYPE[typeChar];
  const sourceType = FIDE_CHAR_TO_ENTITY_TYPE[sourceChar];

  if (!entityType) {
    throw new Error(`Unknown entity type code: ${typeChar}`);
  }
  if (!sourceType) {
    throw new Error(`Unknown source type code: ${sourceType}`);
  }

  return {
    fideId,
    typeChar,
    sourceChar,
    entityType,
    sourceType,
    fingerprint,
  };
}
