# `@chris-test/fide-id`

JavaScript/TypeScript SDK for calculating, parsing, and validating `did:fide` identifiers.

## Scripts

- `pnpm run build`
- `pnpm run check-types`
- `pnpm test`
- `pnpm run test:verbose`

## Notes

- Policy enforcement is on by default.
- Low-level helpers may bypass policy checks via:
  - `dangerouslySkipReferenceTypePolicy`
  - `dangerouslySkipReferenceIdentifierPolicy`
- `calculateFideId(...)` hashes the exact `referenceIdentifier` string it receives.
- `normalizeReferenceIdentifier(...)` and predicate shorthand helpers are available separately when callers need them.

## Dependencies

- `@chris-test/fide-vocabulary` provides the entity type registry used by this package.
