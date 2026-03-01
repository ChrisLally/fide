import { FIDE_ENTITY_TYPE_MAP } from "../constants.js";
import type { FideEntityType, FideIdCalculationOptions } from "../types.js";
import { normalizeRawIdentifier } from "./normalizeRawIdentifier.js";
import { enforceEntitySourceTypePolicy } from "../policy/enforceEntitySourceTypePolicy.js";
import { enforceRawIdentifierPolicy } from "../policy/enforceRawIdentifierPolicy.js";
import { getSubtleCrypto } from "../utils.js";

// Re-export for backward compatibility
export { FIDE_ENTITY_TYPE_MAP };
export type { FideEntityType };

/**
 * Core primitive: calculate a Fide ID from type codes and raw identifier.
 *
 * Deterministic SHA-256 hash of the raw identifier (UTF-8), then constructs
 * `did:fide:0x` + 2 hex (type) + 2 hex (source) + first 36 hex of hash = 40 hex total.
 *
 * @param entityType The entity type.
 * @param sourceEntityType The source entity type.
 * @param rawIdentifier The raw identifier string to hash (UTF-8 encoded).
 * @paramDefault entityType Person
 * @paramDefault sourceEntityType NetworkResource
 * @paramDefault rawIdentifier https://x.com/alice
 * @returns Promise resolving to the calculated Fide ID with format `did:fide:0x{typeCode}{sourceCode}{fingerprint}`
 * @throws TypeError if rawIdentifier is not a string
 * @throws Error if entityType or sourceEntityType are invalid
 * @remarks
 * Enforces source-type policy by default:
 * - non-literal entities -> NetworkResource source
 * - literal entities -> matching literal source or NetworkResource
 * - Statement -> Statement source
 * Also enforces rawIdentifier policy by default:
 * - Statement source -> `subject|predicate|object` Fide ID format.
 * - NetworkResource source -> URI format checks (with stricter checks for known schemes).
 *
 * Callers may bypass policies via options when needed.
 * Canonicalization remains caller responsibility unless `normalizeRawIdentifier` is enabled.
 */
export async function calculateFideId(
  entityType: FideEntityType,
  sourceEntityType: FideEntityType,
  rawIdentifier: string,
  options?: FideIdCalculationOptions
): Promise<`did:fide:0x${string}`> {
  if (typeof rawIdentifier !== "string") {
    throw new TypeError(`Invalid rawIdentifier: expected string, got ${typeof rawIdentifier}`);
  }

  const entityTypeCode = FIDE_ENTITY_TYPE_MAP[entityType];
  if (!entityTypeCode) {
    throw new Error(`Invalid entityType: ${String(entityType)}`);
  }

  const sourceEntityTypeCode = FIDE_ENTITY_TYPE_MAP[sourceEntityType];
  if (!sourceEntityTypeCode) {
    throw new Error(`Invalid sourceEntityType: ${String(sourceEntityType)}`);
  }

  const effectiveRawIdentifier =
    options?.normalizeRawIdentifier === true
      ? normalizeRawIdentifier(rawIdentifier)
      : rawIdentifier;

  if (options?.dangerouslySkipSourceTypePolicy !== true) {
    enforceEntitySourceTypePolicy(entityType, sourceEntityType);
  }
  if (options?.dangerouslySkipRawIdentifierPolicy !== true) {
    enforceRawIdentifierPolicy(sourceEntityType, effectiveRawIdentifier);
  }

  const subtle = await getSubtleCrypto();
  const bytes = new TextEncoder().encode(effectiveRawIdentifier);
  const digest = await subtle.digest("SHA-256", bytes);
  const hashHex = Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
  const fingerprint = hashHex.slice(0, 36);

  return `did:fide:0x${entityTypeCode}${sourceEntityTypeCode}${fingerprint}` as `did:fide:0x${string}`;
}
