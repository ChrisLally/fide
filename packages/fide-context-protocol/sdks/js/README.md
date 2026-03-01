# `@fide-work/fcp`

SDK docs: [https://fide.work/fcp/docs/sdks/js/](https://fide.work/fcp/docs/sdks/js/)

## Scripts

- `pnpm run build`
- `pnpm test`
- `pnpm run test:verbose`
- `pnpm run example`
- `pnpm run example:fide-id`
- `pnpm run example:statement`
- `pnpm run example:schema`

## Predicate Format

Predicates must use canonical full URLs (for example, `https://schema.org/name`).
Shorthand identifiers such as `schema:name` and `schema.org/name` are rejected.

## Defaults

- Policy enforcement is on by default.
- You can bypass policy checks in low-level Fide ID helpers via options:
  - `dangerouslySkipSourceTypePolicy`
  - `dangerouslySkipRawIdentifierPolicy`
- Normalization is opt-in:
  - `calculateFideId(..., { normalizeRawIdentifier: true })`
  - `buildStatement(..., { normalizeRawIdentifier: true })`
