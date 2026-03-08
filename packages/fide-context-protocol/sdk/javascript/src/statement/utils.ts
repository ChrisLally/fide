/**
 * Internal helpers for the statement module. Not exported.
 */

type DigestOnlyCrypto = {
  digest(algorithm: AlgorithmIdentifier, data: BufferSource): Promise<ArrayBuffer>;
};

export function describeValue(value: unknown): string {
  if (value === null) return "null";
  if (value === undefined) return "undefined";
  const kind = typeof value;
  if (kind === "string") return `string(${JSON.stringify(value)})`;
  if (kind === "number" || kind === "boolean" || kind === "bigint") return `${kind}(${String(value)})`;
  if (kind === "function") return "function";
  if (Array.isArray(value)) return `array(len=${value.length})`;
  if (kind === "object") {
    try {
      return `object(${JSON.stringify(value)})`;
    } catch {
      return "object([unserializable])";
    }
  }
  return kind;
}

export async function getSubtleCrypto(): Promise<DigestOnlyCrypto> {
  if (globalThis.crypto?.subtle) {
    return globalThis.crypto.subtle;
  }
  const { webcrypto } = await import("node:crypto");
  return webcrypto.subtle;
}

export async function sha256Hex(input: string): Promise<string> {
  const subtle = await getSubtleCrypto();
  const bytes = new TextEncoder().encode(input);
  const digest = await subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}
