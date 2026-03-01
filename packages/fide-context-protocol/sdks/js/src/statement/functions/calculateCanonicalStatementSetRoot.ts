import { sha256Hex } from "../utils.js";
import type { FideId } from "../../fide-id/types.js";

/**
 * Protocol-level deterministic root for a canonical statement set.
 */
export async function calculateCanonicalStatementSetRoot(statementFideIds: FideId[]): Promise<string> {
  if (!Array.isArray(statementFideIds) || statementFideIds.length === 0) {
    throw new Error("Invalid statement set: expected one or more statement Fide IDs.");
  }

  const canonicalIds = [...statementFideIds].sort();
  return sha256Hex(canonicalIds.join("\n"));
}

// Backward-compatible protocol alias.
export const calculateStatementSetRoot = calculateCanonicalStatementSetRoot;
