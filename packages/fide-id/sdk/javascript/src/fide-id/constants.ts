/**
 * Fide ID constants.
 */
import {
  FIDE_ENTITY_TYPES,
  FIDE_VOCABULARY,
  type FideEntityTypeName,
  type FideEntityTypeSpec,
} from "@chris-test/fide-vocabulary";

const ENTITY_TYPE_ENTRIES = Object.entries(FIDE_ENTITY_TYPES) as [FideEntityTypeName, FideEntityTypeSpec][];

export const FIDE_NAMESPACE_URL = FIDE_VOCABULARY.namespaceUrl;
export const FIDE_SPEC_VERSION = FIDE_VOCABULARY.specVersion;
export const FIDE_SPEC_DATE = FIDE_VOCABULARY.specDate;

export const FIDE_ENTITY_TYPE_MAP = Object.fromEntries(
  ENTITY_TYPE_ENTRIES.map(([name, spec]) => [name, spec.code]),
) as { [K in FideEntityTypeName]: (typeof FIDE_ENTITY_TYPES)[K]["code"] };

export const FIDE_CHAR_TO_ENTITY_TYPE = Object.fromEntries(
  ENTITY_TYPE_ENTRIES.map(([name, spec]) => [spec.code, name]),
) as Record<FideEntityTypeSpec["code"], FideEntityTypeName>;

export const FIDE_ID_PREFIX = "did:fide:0x" as const;
export const FIDE_ID_HEX_LENGTH = 40;
export const FIDE_ID_LENGTH = FIDE_ID_PREFIX.length + FIDE_ID_HEX_LENGTH;
export const FIDE_ID_FINGERPRINT_LENGTH = 36;

/**
 * Prefix map for expanding standards CURIEs to canonical IRIs.
 */
export const FIDE_CURIE_PREFIX_IRIS: Record<string, string> = {
  schema: "https://schema.org/",
  rdf: "https://www.w3.org/1999/02/22-rdf-syntax-ns#",
  rdfs: "https://www.w3.org/2000/01/rdf-schema#",
  xsd: "https://www.w3.org/2001/XMLSchema#",
  org: "https://www.w3.org/ns/org#",
  prov: "https://www.w3.org/ns/prov#",
  sec: "https://w3id.org/security#",
  owl: "https://www.w3.org/2002/07/owl#",
  skos: "https://www.w3.org/2004/02/skos/core#",
} as const;
