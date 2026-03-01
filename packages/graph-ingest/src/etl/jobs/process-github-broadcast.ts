import type { GithubStatementsWebhookPayload } from "../types.js";
import { toSourceStatementBatchRefs } from "../extract/github-broadcast.js";
import { fetchStatementBatchJsonlFromGitHub } from "../extract/github-content.js";
import { applyStatementBatchForIngest } from "../load/apply-statement-batch.js";

export type ProcessedBatchResult = {
  sourceKind: "github" | "direct";
  repoSlug: string | null;
  sha: string | null;
  urlPath: string;
  root: string;
  insertedBatch: boolean;
  statementCount: number;
};

export async function processGithubBroadcastPayload(payload: GithubStatementsWebhookPayload): Promise<ProcessedBatchResult[]> {
  const refs = toSourceStatementBatchRefs(payload);
  const results: ProcessedBatchResult[] = [];

  for (const ref of refs) {
    const jsonl = await fetchStatementBatchJsonlFromGitHub(ref);
    const sourceKind = payload.metadata.kind;
    const metadata = sourceKind === "github"
      ? {
          kind: "github" as const,
          repoSlug: payload.metadata.repoSlug,
          repoId: payload.metadata.repoId,
          ownerId: payload.metadata.ownerId,
          sha: payload.metadata.sha,
          runId: payload.metadata.runId,
        }
        : {
          kind: "direct" as const,
        };
    const applied = await applyStatementBatchForIngest({
      expectedRoot: ref.root,
      jsonl,
      sourceKind,
      urlBase: payload.urlBase,
      urlPath: ref.urlPath,
      metadata,
    });

    results.push({
      sourceKind: payload.metadata.kind,
      repoSlug: ref.repoSlug,
      sha: ref.sha,
      urlPath: ref.urlPath,
      root: ref.root,
      insertedBatch: applied.insertedBatch,
      statementCount: applied.statementCount,
    });
  }

  return results;
}
