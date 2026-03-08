# `@fide-work/fcp`

SDK docs: [https://fide.work/fcp/docs/sdk/javascript/](https://fide.work/fcp/docs/sdk/javascript/)
Contribution guide: [https://github.com/fide/fide-context-protocol/CONTRIBUTING.md](https://github.com/fide/fide-context-protocol/CONTRIBUTING.md)

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
  - `dangerouslySkipReferenceTypePolicy`
  - `dangerouslySkipReferenceIdentifierPolicy`
- `calculateFideId(...)` is strict and does not normalize input.
- Normalization remains opt-in for statement builders:
  - `buildStatement(..., { normalizeReferenceIdentifier: true })`
