# @chris-test/db

Database adapter package for Fide graph runtime queries and persistence.

## Source of Truth

- Master schema file: `manual-migrations/fide-graph-tables.sql`
- Drizzle table definitions: `src/postgres/schema.ts`

This repo currently uses a **single evolving master SQL file**.
Git history is the migration history.

## Local Setup

Set `DATABASE_URL` in `packages/db/.env`.

## Commands

- Apply schema: `pnpm --filter @chris-test/db run db:migrate:local`
- Reset local DB (drop/recreate `public`, then apply schema): `pnpm --filter @chris-test/db run db:reset:local`

## Boundaries

- Schema + table shape: `manual-migrations/fide-graph-tables.sql`, `src/postgres/schema.ts`
- Runtime DB queries: `src/postgres/queries/*`
- Runtime orchestration should live outside this package (for example `@chris-test/graph-ingest`, CLI).
