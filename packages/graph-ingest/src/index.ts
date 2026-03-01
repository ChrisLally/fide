/**
 * Indexer package entry point for ETL orchestration around statement batches.
 *
 * @reportRole Orchestrates ingest workflows that validate, transform, and load statement batches.
 * @reportValue Protects data integrity before persistence and provides clear operational outcomes.
 * @reportContext Indexer coordinates extract-transform-load runtime steps and delegates persistence to the DB package.
 * @reportContext Indexer is responsible for validating expected batch roots before loading statements.
 */
export type {
  IndexerSource,
  SourceStatementBatchRef,
  GithubStatementsWebhookItem,
  GithubStatementsWebhookPayload,
} from "./etl/types.js";

export { isStatementBatchPath, rootFromStatementBatchPath } from "./etl/transform/statement-batch-path.js";

export { parseGithubStatementsBroadcastPayload, toSourceStatementBatchRefs } from "./etl/extract/github-broadcast.js";
export { fetchStatementBatchJsonlFromGitHub, toRawContentUrl } from "./etl/extract/github-content.js";
export {
  buildSameAsEvaluationInputBatchFromDb,
  type SameAsEvaluationInputBatch,
} from "./etl/extract/sameas-input-batch-from-db.js";
export { applyStatementBatchForIngest } from "./etl/load/apply-statement-batch.js";
export { processGithubBroadcastPayload, type ProcessedBatchResult } from "./etl/jobs/process-github-broadcast.js";
export { runSqlQuery, closeRuntimeDbClient } from "./runtime/db.js";
