import type { FideEntityType } from "../types.js";

function isLiteralEntityType(entityType: FideEntityType): boolean {
  return entityType.endsWith("Literal");
}

/**
 * Fide ID calculation policy:
 * - Literal entities may use matching literal reference type or NetworkResource.
 * - Statement IDs are allowed to self-source (Statement/Statement).
 * - All other entities must use NetworkResource reference type.
 */
export function enforceEntityReferenceTypePolicy(
  entityType: FideEntityType,
  referenceType: FideEntityType,
): void {
  if (entityType === "Statement" && referenceType !== "Statement") {
    throw new Error(
      `Invalid referenceType for Statement: ${referenceType}. Expected Statement.`,
    );
  }
  if (entityType === "Statement") {
    return;
  }

  if (
    isLiteralEntityType(entityType) &&
    referenceType !== entityType &&
    referenceType !== "NetworkResource"
  ) {
    throw new Error(
      `Invalid referenceType for literal ${entityType}: ${referenceType}. Expected matching literal reference type or NetworkResource.`,
    );
  }
  if (isLiteralEntityType(entityType)) {
    return;
  }

  if (referenceType !== "NetworkResource") {
    throw new Error(
      `Invalid referenceType for ${entityType}: ${referenceType}. Expected NetworkResource.`,
    );
  }
}
