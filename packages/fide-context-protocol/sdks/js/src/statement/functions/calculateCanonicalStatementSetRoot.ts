import { sha256Hex } from "../utils.js";
import type { FideId } from "../../fide-id/types.js";

/**
 * Protocol-level deterministic root for a canonical statement set.
 *
 * @param statementFideIds Statement Fide IDs in any order.
 * @paramDefault statementFideIds [\"did:fide:0x0000fe0fcf95627f2769f309f672ff7ff0ca0f44\", \"did:fide:0x00006fd990f48ec1ec4f4e0fb4ef80f238f78339\"]
 * @returns Deterministic SHA-256 root hash for the canonicalized set.
 */
export async function calculateCanonicalStatementSetRoot(statementFideIds: FideId[]): Promise<string> {
  if (!Array.isArray(statementFideIds) || statementFideIds.length === 0) {
    throw new Error("Invalid statement set: expected one or more statement Fide IDs.");
  }

  const canonicalIds = [...statementFideIds].sort();
  return sha256Hex(canonicalIds.join("\n"));
}

/**
 * Backward-compatible alias for `calculateCanonicalStatementSetRoot`.
 *
 * @param statementFideIds Statement Fide IDs in any order.
 * @paramDefault statementFideIds [\"did:fide:0x0000fe0fcf95627f2769f309f672ff7ff0ca0f44\", \"did:fide:0x00006fd990f48ec1ec4f4e0fb4ef80f238f78339\"]
 * @returns Deterministic SHA-256 root hash for the canonicalized set.
 */
export async function calculateStatementSetRoot(statementFideIds: FideId[]): Promise<string> {
  return calculateCanonicalStatementSetRoot(statementFideIds);
}
