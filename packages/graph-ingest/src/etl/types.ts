export type IndexerSource = 'github-broadcast' | 'direct-broadcast';

export type SourceStatementBatchRef = {
  source: IndexerSource;
  repoSlug: string | null;
  urlBase: string;
  sha: string | null;
  urlPath: string;
  root: string;
  sha256: string;
};

export type GithubStatementsWebhookItem = {
  urlPath: string;
  root: string;
  sha256: string;
};

export type GithubStatementsWebhookMetadata = {
  kind: 'github';
  repoSlug: string;
  repoId: string;
  ownerId: string;
  sha: string;
  runId: string;
};

export type DirectStatementsWebhookMetadata = {
  kind: 'direct';
};

export type GithubStatementsWebhookPayload = {
  urlBase: string;
  metadata: GithubStatementsWebhookMetadata | DirectStatementsWebhookMetadata;
  items: GithubStatementsWebhookItem[];
};
