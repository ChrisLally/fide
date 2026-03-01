## Local Development

```bash
pnpm --filter api dev
```

- API: `http://localhost:3200`
- OpenAPI: `http://localhost:3200/openapi.json`

From repo root, convenience scripts are also available:

```bash
pnpm dev:api
pnpm dev:api:tunnel
pnpm dev:api:public
```

Set `CLOUDFLARED_TUNNEL_TOKEN_API` before running tunnel scripts.

## Build Scripts

From `apps/api`:

```bash
pnpm run build
```

- `build`: builds `@chris-test/fcp` first, then runs local TypeScript build for API.
- `build:local`: runs only API TypeScript build (`tsc`).
- `build:api:prod`: delegates to repo root production API build.


From repo root:

```bash
pnpm run build:api:prod
```

## OpenAPI Contract

Export the API contract from `apps/api` into shared contracts:

```bash
pnpm --filter api run openapi:export
```

Generated file:

- `packages/contracts/openapi.json`

## Entrypoints

- Local Node runtime: `src/index.ts`
- Vercel runtime: `api/[...route].ts`
- Cloudflare Worker runtime: `src/worker.ts`

## Cloudflare

For local Worker dev:

```bash
pnpm run dev:cf
```

Production deploys are tag/sync driven:

- Create/push `fide-api/v*` from `fide-internal`
- Sync assembles/pushes to `fide/fide`
- Cloudflare Git integration deploys from `fide/fide` (watch paths)

If deploying manually, set secrets/vars in Cloudflare first:

```bash
wrangler secret put DATABASE_URL
```

Optional feature flag:

```bash
wrangler secret put GRAPH_API_V1_ENABLED
```

## Environment

Copy and edit:

```bash
cp .env.example .env
```

`DATABASE_URL` is not read from `apps/api/.env`; DB configuration is provided by `@chris-test/db` via `packages/db/.env`.
