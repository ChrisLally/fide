import { FIDE_ENTITY_TYPE_MAP } from "../constants.js";
import type { FideEntityType, FideIdCalculationOptions } from "../types.js";
import { enforceEntityReferenceTypePolicy } from "../policy/enforceEntityReferenceTypePolicy.js";
import { enforceReferenceIdentifierPolicy } from "../policy/enforceReferenceIdentifierPolicy.js";
import { getSubtleCrypto } from "../utils.js";

// Re-export for backward compatibility
export { FIDE_ENTITY_TYPE_MAP };
export type { FideEntityType };

/**
 * Core primitive: calculate a Fide ID from type codes and reference identifier.
 *
 * Deterministic SHA-256 hash of the reference identifier (UTF-8), then constructs
 * `did:fide:0x` + 2 hex (entity type) + 2 hex (reference type) + first 36 hex of hash = 40 hex total.
 *
 * @param entityType The entity type.
 * @param referenceType The reference type.
 * @param referenceIdentifier The reference identifier string to hash (UTF-8 encoded).
 * @paramDefault entityType Person
 * @paramDefault referenceType NetworkResource
 * @paramDefault referenceIdentifier https://x.com/alice
 * @policy Reference Type Policy | Validates that the entity type and reference type combination is allowed before the Fide ID is derived. | dangerouslySkipReferenceTypePolicy
 * @policy Reference Identifier Policy | Validates the reference identifier shape for supported reference types before hashing. | dangerouslySkipReferenceIdentifierPolicy
 * @returns Promise resolving to the calculated Fide ID with format `did:fide:0x{entityTypeCode}{referenceTypeCode}{fingerprint}`
 * @throws TypeError if referenceIdentifier is not a string
 * @throws Error if entityType or referenceType are invalid
 * @remarks
 * Enforces reference-type policy by default:
 * - non-literal entities -> NetworkResource reference type
 * - literal entities -> matching literal reference type or NetworkResource
 * - Statement -> Statement reference type
 * Also enforces referenceIdentifier policy by default:
 * - Statement reference type -> `subject|predicate|object` Fide ID format.
 * - NetworkResource reference type -> URI format checks (with stricter checks for known schemes).
 *
 * Callers may bypass policies via options when needed.
 * This function does not normalize referenceIdentifier input.
 */
export async function calculateFideId(
  entityType: FideEntityType,
  referenceType: FideEntityType,
  referenceIdentifier: string,
  options?: FideIdCalculationOptions
): Promise<`did:fide:0x${string}`> {
  if (typeof referenceIdentifier !== "string") {
    throw new TypeError(`Invalid referenceIdentifier: expected string, got ${typeof referenceIdentifier}`);
  }

  const entityTypeCode = FIDE_ENTITY_TYPE_MAP[entityType];
  if (!entityTypeCode) {
    throw new Error(`Invalid entityType: ${String(entityType)}`);
  }

  const referenceTypeCode = FIDE_ENTITY_TYPE_MAP[referenceType];
  if (!referenceTypeCode) {
    throw new Error(`Invalid referenceType: ${String(referenceType)}`);
  }

  if (options?.dangerouslySkipReferenceTypePolicy !== true) {
    enforceEntityReferenceTypePolicy(entityType, referenceType);
  }
  if (options?.dangerouslySkipReferenceIdentifierPolicy !== true) {
    enforceReferenceIdentifierPolicy(referenceType, referenceIdentifier);
  }

  const subtle = await getSubtleCrypto();
  const bytes = new TextEncoder().encode(referenceIdentifier);
  const digest = await subtle.digest("SHA-256", bytes);
  const hashHex = Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
  const fingerprint = hashHex.slice(0, 36);

  return `did:fide:0x${entityTypeCode}${referenceTypeCode}${fingerprint}` as `did:fide:0x${string}`;
}
