# FCP SDK Policy Matrix (Draft)

Review note only. This is my current read of the SDK behavior, not a finalized public doc.

## Summary

- Only `calculateFideId()` exposes actual policy-bypass options.
- `buildStatement()` always enforces its statement-level policies.
- `normalizeReferenceIdentifier` is a behavior toggle, not a policy bypass.
- Some validation is format-level rather than policy-level. I kept those separate below.

## Hard-Enforced vs Skippable

| Area | Rule | Where Enforced | Skippable? | Notes |
| --- | --- | --- | --- | --- |
| Fide ID input shape | `referenceIdentifier` must be a string | `calculateFideId()` | No | Format/type check, not really policy |
| Fide ID input shape | `entityType` must exist in `FIDE_ENTITY_TYPE_MAP` | `calculateFideId()` | No | Hard validation |
| Fide ID input shape | `referenceType` must exist in `FIDE_ENTITY_TYPE_MAP` | `calculateFideId()` | No | Hard validation |
| Fide ID policy | entity/reference-type compatibility | `enforceEntityReferenceTypePolicy()` via `calculateFideId()` | Yes | Skipped by `dangerouslySkipReferenceTypePolicy` |
| Fide ID policy | reference identifier policy by reference type | `enforceReferenceIdentifierPolicy()` via `calculateFideId()` | Yes | Skipped by `dangerouslySkipReferenceIdentifierPolicy` |
| Fide ID derivation | UTF-8 -> SHA-256 -> first 36 hex -> `did:fide:0x...` | `calculateFideId()` | No | Core derivation path |
| Statement input shape | `subject`, `predicate`, `object` must be objects | `enforceStatementInputPolicy()` via `buildStatement()` | No | Always enforced in `buildStatement()` |
| Statement input shape | each role must provide string `referenceIdentifier`, `entityType`, `referenceType` | `enforceStatementInputPolicy()` via `buildStatement()` | No | Always enforced in `buildStatement()` |
| Statement predicate structure | predicate `entityType` must be `Concept` | `enforceStatementInputPolicy()` via `buildStatement()` | No | Always enforced |
| Statement predicate structure | predicate `referenceType` must be `NetworkResource` | `enforceStatementInputPolicy()` via `buildStatement()` | No | Always enforced |
| Statement predicate policy | forbidden predicates rejected | `enforceStatementPredicateInputPolicy()` via `buildStatement()` | No | Always enforced |
| Statement predicate policy | redundant base-type assertions rejected | `enforceStatementPredicateInputPolicy()` via `buildStatement()` | No | Always enforced |
| Predicate normalization | predicate is normalized/canonicalized | `normalizePredicateReferenceIdentifier()` in `buildStatement()` | No | Always applied in `buildStatement()` |
| Statement Fide ID policy | non-`Statement` subject/object cannot use `Statement` reference type | `enforceStatementFideIdsPolicy()` via `buildStatement()` | No | Always enforced |
| Statement ID derivation | statement Fide ID derived from subject/predicate/object Fide IDs | `calculateStatementFideId()` via `buildStatement()` | No | Core derivation path |

## What The Bypass Options Actually Skip

### `dangerouslySkipReferenceTypePolicy`

Skips:

- `enforceEntityReferenceTypePolicy(entityType, referenceType)`

That means callers can bypass these normal rules:

- `Statement` must use `Statement` as `referenceType`
- literal entity types must use either:
  - the matching literal type, or
  - `NetworkResource`
- non-literal, non-`Statement` entities must use `NetworkResource`

I agree this is a real policy bypass.

### `dangerouslySkipReferenceIdentifierPolicy`

Skips:

- `enforceReferenceIdentifierPolicy(referenceType, referenceIdentifier)`

That normally enforces:

- for `Statement` reference type:
  - must be `subject|predicate|object`
  - each part must be a valid Fide ID
- for `NetworkResource` reference type:
  - must be an absolute URI
  - known schemes get extra checks:
    - `http`
    - `https`
    - `did`
    - `urn`
    - `acct`
    - `mailto`

I agree this is also a real policy bypass.

## What Is Not Skippable Today

These still happen even if both dangerous flags are used:

- `referenceIdentifier` must still be a string
- `entityType` and `referenceType` must still be valid mapped FCP types
- hashing and final Fide ID formatting still happen

In other words, the dangerous flags bypass semantic policy, not basic function preconditions or derivation.

## Statement Build Path

`buildStatement()` does not expose any dangerous bypass flags of its own.

Current behavior:

1. `enforceStatementInputPolicy(input)`
2. `enforceStatementPredicateInputPolicy(input)`
3. normalize subject/object optionally via `normalizeReferenceIdentifier`
4. normalize predicate via `normalizePredicateReferenceIdentifier`
5. derive all 3 Fide IDs via `calculateFideId(...)`
6. `enforceStatementFideIdsPolicy(subjectFideId, predicateFideId, objectFideId)`
7. derive `statementFideId`

Important nuance:

- `buildStatement()` calls `calculateFideId()` without dangerous skip options.
- so inside normal statement construction, Fide ID policy is effectively always enforced.

I agree with that design if the SDK wants `buildStatement()` to be the safe/default path.

## Batch-Only / Optional Helpers

These are policy helpers, but they are not universally automatic:

- `enforceStatementPredicateBatchPolicy(statements)`
- `getForbiddenPredicateReason(...)`
- `getRedundantTypeAssertionReason(...)`

My read:

- they matter only when a caller explicitly invokes the batch check path
- they are not global enforcement hooks across the whole SDK

## Important Nuance: Reference Identifier Policy Coverage

`enforceReferenceIdentifierPolicy()` only has explicit validation branches for:

- `referenceType === "Statement"`
- `referenceType === "NetworkResource"`

For other reference types, it currently does not apply additional structure checks.

I think this is worth stating explicitly, because someone could assume "reference identifier policy" means every reference type has a concrete validator. That is not true today.

## Naming Notes

I think the new naming is much better overall:

- `referenceIdentifier` is clearer than `rawIdentifier`
- `referenceType` is clearer than `sourceType`

Still inconsistent or worth tightening:

1. `calculateFideId()` JSDoc still says:
   - `@param referenceType The source entity type.`
   - This should say `reference type`, not `source entity type`.

2. `calculateFideId()` JSDoc remarks still say:
   - `Enforces source-type policy by default`
   - This should be `reference-type policy`.

3. `enforceStatementFideIdsPolicy()` error message still says:
   - `Protocol disallows Statement source`
   - This should probably become `Statement reference type` for consistency.

4. `calculateStatementFideId()` JSDoc still says:
   - `Target/Source = 0000`
   - That should probably be `Entity Type/Reference Type = 0000`.

5. Several comments still use `source` conceptually when they now mean `referenceType`.
   - Not broken, but it weakens the rename.

## My Opinion

I agree with the current split:

- `calculateFideId()` is the low-level primitive with dangerous escape hatches
- `buildStatement()` is the safe, opinionated path

I do not think that is confusing as long as you document it clearly.

What I would clarify publicly later:

- "policy bypass options exist only on low-level Fide ID helpers"
- "`buildStatement()` always enforces statement-safe defaults"
- "normalization is optional, but policy enforcement is not optional in `buildStatement()`"
