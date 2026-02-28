/**
 * Graph-layer batch root utility for JSONL ingestion payloads.
 *
 * This is graph application logic (wire-batch handling), not a protocol primitive.
 */
export async function calculateGraphStatementBatchRoot(statementFideIds: string[]): Promise<string> {
  if (!Array.isArray(statementFideIds) || statementFideIds.length === 0) {
    throw new Error("Invalid graph statement batch: expected one or more statement Fide IDs.");
  }

  const subtle = globalThis.crypto?.subtle;
  if (!subtle) {
    throw new Error("Web Crypto API unavailable: crypto.subtle is required.");
  }

  const canonicalIds = [...statementFideIds].sort();
  const input = new TextEncoder().encode(canonicalIds.join("\n"));
  const hashBuffer = await subtle.digest("SHA-256", input);
  return Array.from(new Uint8Array(hashBuffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

// Backward-compatible alias while call sites migrate.
export const calculateStatementBatchRoot = calculateGraphStatementBatchRoot;
