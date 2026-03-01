/**
 * Internal helpers for the fide-id module. Not exported.
 */

type DigestOnlyCrypto = {
  digest(algorithm: AlgorithmIdentifier, data: BufferSource): Promise<ArrayBuffer>;
};

export async function getSubtleCrypto(): Promise<DigestOnlyCrypto> {
  if (globalThis.crypto?.subtle) {
    return globalThis.crypto.subtle;
  }
  const { webcrypto } = await import("node:crypto");
  return webcrypto.subtle;
}
