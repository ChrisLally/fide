/**
 * Prefix map for expanding standards CURIEs to canonical predicate IRIs.
 */
export const FCP_CURIE_PREFIX_IRIS: Record<string, string> = {
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
