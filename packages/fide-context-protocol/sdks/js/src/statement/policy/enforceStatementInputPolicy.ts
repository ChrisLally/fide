/**
 * Enforce statement input policy before deriving Fide IDs.
 */
import type { StatementInput } from "../types.js";
import { describeValue } from "../utils.js";

type StatementRole = "subject" | "predicate" | "object";
type StatementField = "rawIdentifier" | "entityType" | "sourceType";

function assertRoleObject(
  input: StatementInput | Record<string, unknown>,
  role: StatementRole,
): void {
  const value = (input as Record<string, unknown>)[role];
  if (value && typeof value === "object") {
    return;
  }
  throw new Error(
    `Invalid statement input: expected ${role} object; got ${describeValue(value)}.`,
  );
}

function assertRoleFieldString(
  input: StatementInput | Record<string, unknown>,
  role: StatementRole,
  field: StatementField,
): void {
  const roleValue = (input as Record<string, unknown>)[role] as
    | Record<string, unknown>
    | undefined;
  const fieldValue = roleValue?.[field];
  if (typeof fieldValue === "string") {
    return;
  }
  throw new Error(
    `Invalid statement input: expected ${role}.${field} as string; got ${describeValue(fieldValue)}.`,
  );
}

export function enforceStatementInputPolicy(input: StatementInput): void {
  if (!input || typeof input !== "object") {
    throw new Error(
      `Invalid statement input: expected object with subject, predicate, and object; got ${describeValue(input)}.`,
    );
  }

  const roles: StatementRole[] = ["subject", "predicate", "object"];
  const fields: StatementField[] = ["rawIdentifier", "entityType", "sourceType"];

  for (const role of roles) {
    assertRoleObject(input, role);
    for (const field of fields) {
      assertRoleFieldString(input, role, field);
    }
  }

  if (input.predicate.entityType !== "Concept") {
    throw new Error(
      `Invalid predicate entityType: ${input.predicate.entityType}. Expected Concept.`,
    );
  }

  if (input.predicate.sourceType !== "NetworkResource") {
    throw new Error(
      `Invalid predicate sourceType: ${input.predicate.sourceType}. Expected NetworkResource.`,
    );
  }

  // Predicate URL validity/canonicalization is enforced by normalizePredicateRawIdentifier()
  // in the statement building path.
}
