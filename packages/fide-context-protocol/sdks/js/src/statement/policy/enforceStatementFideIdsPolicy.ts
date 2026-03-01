/**
 * Enforce statement ID policy after deriving subject/predicate/object Fide IDs.
 */
import { assertFideId, parseFideId } from "../../fide-id/index.js";

function assertRoleFideIdPolicy(fideId: string, role: "subject" | "object"): void {
  assertFideId(fideId);
  const { typeChar, sourceChar } = parseFideId(fideId);

  if (sourceChar !== "00" || typeChar === "00") {
    return;
  }

  throw new Error(
    `Invalid Fide ID for statement ${role}: ${fideId}. ` +
      `Protocol disallows Statement source (source code 00) for non-Statement entities. ` +
      `Use a concrete source (e.g. Person 0x1020, Organization 0x1120) instead of Statement-derived IDs.`
  );
}

export function enforceStatementFideIdsPolicy(
  subjectFideId: string,
  predicateFideId: string,
  objectFideId: string
): void {
  // Predicate combo policy is enforced at input level (entityType/sourceType).
  // Keep ID-level checks here for subject/object Statement-source restrictions.
  assertRoleFideIdPolicy(subjectFideId, "subject");
  assertRoleFideIdPolicy(objectFideId, "object");
}
