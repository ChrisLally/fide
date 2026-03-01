import type { SourceStatementBatchRef } from "../types.js";

export function toRawContentUrl(ref: SourceStatementBatchRef): string {
  const encodedPath = ref.urlPath
    .split('/')
    .map((segment) => encodeURIComponent(segment))
    .join('/');
  const base = ref.urlBase.endsWith('/') ? ref.urlBase.slice(0, -1) : ref.urlBase;
  return `${base}/${encodedPath}`;
}

export async function fetchStatementBatchJsonlFromGitHub(ref: SourceStatementBatchRef): Promise<string> {
  const url = toRawContentUrl(ref);
  const response = await fetch(url, {
    headers: {
      "User-Agent": "fide-indexer/0.1",
      Accept: "text/plain",
    },
  });

  if (!response.ok) {
    throw new Error(`GitHub fetch failed (${response.status}) for ${ref.repoSlug}@${ref.sha}:${ref.urlPath}`);
  }

  return response.text();
}
