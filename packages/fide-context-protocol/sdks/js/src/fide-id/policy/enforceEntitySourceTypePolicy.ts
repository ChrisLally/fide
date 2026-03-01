import type { FideEntityType } from "../types.js";

function isLiteralEntityType(entityType: FideEntityType): boolean {
  return entityType.endsWith("Literal");
}

/**
 * Fide ID calculation policy:
 * - Literal entities may use matching literal source type or NetworkResource.
 * - Statement IDs are allowed to self-source (Statement/Statement).
 * - All other entities must use NetworkResource source type.
 */
export function enforceEntitySourceTypePolicy(
  entityType: FideEntityType,
  sourceEntityType: FideEntityType,
): void {
  if (entityType === "Statement" && sourceEntityType !== "Statement") {
    throw new Error(
      `Invalid sourceEntityType for Statement: ${sourceEntityType}. Expected Statement.`,
    );
  }
  if (entityType === "Statement") {
    return;
  }

  if (
    isLiteralEntityType(entityType) &&
    sourceEntityType !== entityType &&
    sourceEntityType !== "NetworkResource"
  ) {
    throw new Error(
      `Invalid sourceEntityType for literal ${entityType}: ${sourceEntityType}. Expected matching literal source type or NetworkResource.`,
    );
  }
  if (isLiteralEntityType(entityType)) {
    return;
  }

  if (sourceEntityType !== "NetworkResource") {
    throw new Error(
      `Invalid sourceEntityType for ${entityType}: ${sourceEntityType}. Expected NetworkResource.`,
    );
  }
}
