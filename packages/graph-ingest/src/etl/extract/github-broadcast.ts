import type { GithubStatementsWebhookPayload, SourceStatementBatchRef } from "../types.js";
import { isStatementBatchPath, rootFromStatementBatchPath } from "../transform/statement-batch-path.js";

function assertNonEmptyString(value: unknown, field: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(`Invalid broadcast payload: expected non-empty string at ${field}`);
  }
  return value;
}

export const parseGithubStatementsBroadcastPayload = (input: unknown): GithubStatementsWebhookPayload => {
  if (!input || typeof input !== 'object') {
    throw new Error('Invalid broadcast payload: expected object');
  }

  const payload = input as Record<string, unknown>;
  const urlBase = assertNonEmptyString(payload.urlBase, 'urlBase');

  if (!payload.metadata || typeof payload.metadata !== 'object') {
    throw new Error('Invalid broadcast payload: expected object at metadata');
  }

  const metadata = payload.metadata as Record<string, unknown>;
  const kind = assertNonEmptyString(metadata.kind, 'metadata.kind');
  if (kind !== "github" && kind !== "direct") {
    throw new Error(`Invalid broadcast payload: unsupported metadata.kind ${kind}`);
  }
  const githubSource = kind === 'github'
    ? {
      kind: "github" as const,
      repoSlug: assertNonEmptyString(metadata.repoSlug, "metadata.repoSlug"),
      repoId: assertNonEmptyString(metadata.repoId, "metadata.repoId"),
      ownerId: assertNonEmptyString(metadata.ownerId, "metadata.ownerId"),
      sha: assertNonEmptyString(metadata.sha, "metadata.sha"),
      runId: assertNonEmptyString(metadata.runId, "metadata.runId"),
    }
    : null;

  if (!Array.isArray(payload.items)) {
    throw new Error('Invalid broadcast payload: expected items array');
  }

  const items = payload.items.map((item, index) => {
    if (!item || typeof item !== 'object') {
      throw new Error(`Invalid broadcast payload: expected object at items[${index}]`);
    }

    const value = item as Record<string, unknown>;
    const urlPath = assertNonEmptyString(value.urlPath, `items[${index}].urlPath`);
    const root = assertNonEmptyString(value.root, `items[${index}].root`);
    const sha256 = assertNonEmptyString(value.sha256, `items[${index}].sha256`);

    if (kind === 'github') {
      if (!isStatementBatchPath(urlPath)) {
        throw new Error(`Invalid statement batch urlPath at items[${index}].urlPath: ${urlPath}`);
      }

      const pathRoot = rootFromStatementBatchPath(urlPath);
      if (pathRoot !== root) {
        throw new Error(
          `Invalid broadcast payload: root/urlPath mismatch at items[${index}] (root=${root}, urlPathRoot=${pathRoot})`
        );
      }
    }

    if (!/^[a-f0-9]{64}$/.test(sha256)) {
      throw new Error(`Invalid broadcast payload: expected sha256 hex at items[${index}].sha256`);
    }

    return { urlPath, root, sha256 };
  });

  if (githubSource) {
    return { urlBase, metadata: githubSource, items };
  }
  return {
    urlBase,
    metadata: {
      kind: "direct",
    },
    items,
  };
};

export const toSourceStatementBatchRefs = (
  payload: GithubStatementsWebhookPayload,
): SourceStatementBatchRef[] => {
  return payload.items.map((item) => ({
    source: payload.metadata.kind === "github" ? "github-broadcast" : "direct-broadcast",
    repoSlug: payload.metadata.kind === "github" ? payload.metadata.repoSlug : null,
    urlBase: payload.urlBase,
    sha: payload.metadata.kind === "github" ? payload.metadata.sha : null,
    urlPath: item.urlPath,
    root: item.root,
    sha256: item.sha256,
  }));
};
