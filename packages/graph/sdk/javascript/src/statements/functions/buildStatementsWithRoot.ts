import { buildStatement, type FideId, type StatementInput } from "@chris-test/fcp";
import type { StatementBatchWithRoot, StatementBuildOptions } from "../types.js";
import { sha256Hex } from "../utils.js";

/**
 * Build a batch of statements and derive a deterministic batch root.
 *
 * Each input is first converted to a full protocol statement via `buildStatement`.
 * The resulting statement Fide IDs are then canonicalized to produce a stable batch root.
 *
 * Root derivation:
 * - `statementFideIds` are lexicographically sorted
 * - Sorted IDs are joined with `\n`
 * - SHA-256 is computed over that byte sequence
 * - Result is returned as lowercase hex string
 *
 * @param inputs Array of statement inputs.
 * @param options Statement build options passed through to each statement build.
 * @paramDefault inputs [{ subject: { referenceIdentifier: "https://x.com/alice", entityType: "Person", referenceType: "NetworkResource" }, predicate: { referenceIdentifier: "https://schema.org/knows", entityType: "Concept", referenceType: "NetworkResource" }, object: { referenceIdentifier: "https://x.com/bob", entityType: "Person", referenceType: "NetworkResource" } }]
 * @paramDefault options { normalizeReferenceIdentifier: true }
 * @returns Statements, statement IDs (input order), and deterministic root hash.
 * @throws Error if nested statement building fails or if one or more built statements are missing `statementFideId`.
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

/**
 * Backward-compatible alias for `buildStatementsWithRoot`.
 *
 * @param inputs Array of statement inputs.
 * @param options Statement build options passed through to each statement build.
 * @paramDefault inputs [{ subject: { referenceIdentifier: "https://x.com/alice", entityType: "Person", referenceType: "NetworkResource" }, predicate: { referenceIdentifier: "https://schema.org/knows", entityType: "Concept", referenceType: "NetworkResource" }, object: { referenceIdentifier: "https://x.com/bob", entityType: "Person", referenceType: "NetworkResource" } }]
 * @paramDefault options { normalizeReferenceIdentifier: true }
 * @returns Statements, statement IDs (input order), and deterministic root hash.
 * @throws Error if nested statement building fails or if one or more built statements are missing `statementFideId`.
 */
export async function buildCanonicalStatementSet(
  inputs: StatementInput[],
  options?: StatementBuildOptions,
): Promise<StatementBatchWithRoot> {
  return buildStatementsWithRoot(inputs, options);
}
