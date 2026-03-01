import { readFile } from 'node:fs/promises';
import { processGithubBroadcastPayload } from "../etl/jobs/process-github-broadcast.js";
import { parseGithubStatementsBroadcastPayload } from "../etl/extract/github-broadcast.js";

async function main(): Promise<void> {
  const fixturePath = process.argv[2] ?? 'fixtures/mock-github-statements-broadcast.json';
  const raw = await readFile(fixturePath, 'utf8');
  const payloadUnknown = JSON.parse(raw) as unknown;

  const payload = parseGithubStatementsBroadcastPayload(payloadUnknown);
  const results = await processGithubBroadcastPayload(payload);

  console.log(JSON.stringify({
    source: 'github-broadcast',
    sourceKind: payload.metadata.kind,
    repoSlug: payload.metadata.kind === 'github' ? payload.metadata.repoSlug : null,
    repoId: payload.metadata.kind === 'github' ? payload.metadata.repoId : null,
    ownerId: payload.metadata.kind === 'github' ? payload.metadata.ownerId : null,
    sha: payload.metadata.kind === 'github' ? payload.metadata.sha : null,
    runId: payload.metadata.kind === 'github' ? payload.metadata.runId : null,
    processed: results,
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
