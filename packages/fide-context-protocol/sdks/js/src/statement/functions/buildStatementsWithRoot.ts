import type { FideId } from "../../fide-id/types.js";
import { buildStatement } from "./buildStatement.js";
import type { StatementBatchWithRoot, StatementBuildOptions, StatementInput } from "../types.js";
import { sha256Hex } from "../utils.js";

/**
 * Build a batch of statements and derive a deterministic batch root.
 *
 * Root derivation:
 * - `statementFideIds` are lexicographically sorted
 * - Sorted IDs are joined with `\n`
 * - SHA-256 is computed over that byte sequence
 * - Result is returned as lowercase hex string
 *
 * @param inputs Array of statement inputs.
 * @returns Statements, statement IDs (input order), and deterministic root hash
 * @throws Error if one or more built statements are missing `statementFideId`
 */
export async function buildStatementsWithRoot(
  inputs: StatementInput[],
  options?: StatementBuildOptions,
): Promise<StatementBatchWithRoot> {
  const statements = await Promise.all(inputs.map((input) => buildStatement(input, options)));
  const statementFideIds = statements
    .map((s) => s.statementFideId)
    .filter((id): id is FideId => !!id);

  if (statementFideIds.length !== statements.length) {
    throw new Error("Batch build failed: one or more statements are missing statementFideId.");
  }

  const canonicalIds = [...statementFideIds].sort();
  const root = await sha256Hex(canonicalIds.join("\n"));

  return {
    statements,
    statementFideIds,
    root,
  };
}
