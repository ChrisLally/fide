# @chris-test/graph-ingest

Indexer runtime package for ETL orchestration around statement batches.

## Scope

Extract:
- GitHub broadcast payload parsing
- GitHub content fetch helpers
- DB-backed sameAs input extraction (`buildSameAsEvaluationInputBatchFromDb`)

Transform:
- Statement batch path validation and root extraction

Load:
- Root-validated statement batch application to DB (`applyStatementBatchForIngest`)

Jobs:
- End-to-end broadcast processing (`processGithubBroadcastPayload`)

Runtime DB helpers:
- SQL execution and client shutdown (`runSqlQuery`, `closeRuntimeDbClient`)

## ETL Layout

- `src/etl/extract/*`
- `src/etl/transform/*`
- `src/etl/load/*`
- `src/etl/jobs/*`
- `src/runtime/*`

## Scripts

- `pnpm --filter @chris-test/graph-ingest run build`
- `pnpm --filter @chris-test/graph-ingest run typecheck`
- `pnpm --filter @chris-test/graph-ingest run build:sameas-input`
- `pnpm --filter @chris-test/graph-ingest run mock:broadcast`

`@chris-test/graph-ingest` owns orchestration and adapter glue.  
Protocol primitives stay in `@chris-test/fcp`.  
Deterministic domain transforms stay in `@chris-test/graph`.  
Schema and query implementation stay in `@chris-test/db`.
