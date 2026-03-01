import { ingestStatementBatch } from "@chris-test/db";
import { parseStatementBatchJsonl } from "@chris-test/graph";

type ApplyStatementBatchParams = {
  expectedRoot: string;
  jsonl: string;
  sourceKind: "github" | "direct";
  urlBase: string;
  urlPath: string;
  metadata:
    | {
        kind: "github";
        repoSlug: string;
        repoId: string;
        ownerId: string;
        sha: string;
        runId: string;
      }
    | {
        kind: "direct";
      };
};

/**
 * Validates the statement batch root and forwards the batch to DB ingestion.
 *
 * @reportContext Ingestion fails fast if computed and expected roots diverge, preventing accidental or tampered batch loads.
 * @reportContext Successful loads return a compact operational summary used by CLI and report generation.
 */
export async function applyStatementBatchForIngest(params: ApplyStatementBatchParams) {
  const parsed = await parseStatementBatchJsonl(params.jsonl);

  if (parsed.root !== params.expectedRoot) {
    throw new Error(
      `Statement batch root mismatch: expected ${params.expectedRoot}, computed ${parsed.root}`,
    );
  }

  const result = await ingestStatementBatch({
    root: parsed.root,
    sourceKind: params.sourceKind,
    urlBase: params.urlBase,
    urlPath: params.urlPath,
    metadata: params.metadata,
    statements: parsed.statements,
  });

  return {
    insertedBatch: result.insertedBatch,
    statementCount: result.statementCount,
    root: parsed.root,
  };
}
