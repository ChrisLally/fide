/**
 * Generated from `packages/fide-vocabulary/spec/v1/vocabulary.json`.
 * Do not edit directly; regenerate from the vocabulary source of truth.
 */
export const FIDE_VOCABULARY = {
  namespaceUrl: "https://fide.work/spec/v1/",
  specVersion: "1",
  specDate: "2026-02-18",
  entityTypes: {
    Statement: {
      code: "00",
      layer: "Graph Structure",
      standards: ["rdf:Statement"] as const,
      standardFit: "Exact",
      description: "A record of a Subject-Predicate-Object assertion.",
      litmus: "Not a verified fact; verification is application-level. Not what it represents.",
    },
    Person: {
      code: "10",
      layer: "Agents",
      standards: ["schema:Person"] as const,
      standardFit: "Exact",
      description: "A person (alive, dead, undead, or fictional).",
      litmus: "Not an account or organization.",
    },
    Organization: {
      code: "11",
      layer: "Agents",
      standards: ["org:Organization"] as const,
      standardFit: "Exact",
      description: "A structured collective of people or agents that acts as a unit.",
      litmus: "Not a single person or software. Not a query-defined group (e.g. alumni by year); create only when the group itself needs to act.",
    },
    SoftwareAgent: {
      code: "12",
      layer: "Agents",
      standards: ["schema:SoftwareApplication","prov:SoftwareAgent"] as const,
      standardFit: "Close",
      description: "A running process that acts as an independent actor: bot, AI agent, smart contract. Can hold keys and sign.",
      litmus: "Not a person or organization. Not static passive code (use CreativeWork for repos, images, logic).",
    },
    NetworkResource: {
      code: "20",
      layer: "Network Anchors",
      standards: ["schema:WebPage","schema:WebSite","schema:EntryPoint"] as const,
      standardFit: "Broad",
      description: "A resource identified primarily by addressability or resolution, such as a URL, URI, or CID.",
      litmus: "Not a subset or account. Not an inhabitable spatial context (use Place).",
    },
    PlatformAccount: {
      code: "21",
      layer: "Network Anchors",
      standards: ["schema:OnlineAccount"] as const,
      standardFit: "Close",
      description: "An authority-based account principal (e.g., an email address or a specific GitHub, Google, or Mastodon user ID). The identity exists by the permission of a host system's database.",
      litmus: "Authenticated by a host authority's database, not purely by mathematics.",
    },
    CryptographicAccount: {
      code: "22",
      layer: "Network Anchors",
      standards: ["sec:PublicKey","sec:publicKeyMultibase"] as const,
      standardFit: "Close",
      description: "A math-based account principal (e.g., an EVM address, Bitcoin wallet, or did:key). The identity exists mathematically and is authenticated via mathematical signature keys.",
      litmus: "Authenticated via mathematical signature keys, independent of a host authority.",
    },
    CreativeWork: {
      code: "30",
      layer: "Knowledge",
      standards: ["schema:CreativeWork"] as const,
      standardFit: "Exact",
      description: "The most generic kind of creative work, including books, movies, photographs, software programs, etc. Non-expressive digital artifacts (binaries, model weights, dataset snapshots) are CreativeWork with refinement via Statements (artifactKind, mediaType, generatedBy, derivedFrom).",
      litmus: "Not a raw value or formal concept. Not a running agent instance (use SoftwareAgent). Not a resource where location is primary identifier (use NetworkResource).",
    },
    Concept: {
      code: "31",
      layer: "Knowledge",
      standards: ["schema:DefinedTerm"] as const,
      standardFit: "Close",
      description: "A formal concept, word, topic, category, or abstract idea defined in a taxonomy.",
      litmus: "Not a plain raw value.",
    },
    Place: {
      code: "40",
      layer: "Spacetime",
      standards: ["schema:Place","schema:VirtualLocation"] as const,
      standardFit: "Broad",
      description: "A spatial context that can contain presence, co-location, and interaction. Includes physical locations and persistent virtual environments (e.g., a concert venue, a Discord server or channel, a Zoom room, a VRChat instance). Physicality/virtuality is asserted via Statements, not the base type.",
      litmus: "Not a happening or a physical artifact. Can an Actor have presence there? Is its identity a spatial address rather than a document location or account?",
    },
    Event: {
      code: "41",
      layer: "Spacetime",
      standards: ["schema:Event"] as const,
      standardFit: "Exact",
      description: "An occurrence or happening bounded in time. Can be observed/aggregated; may be caused by Actions, systems, or nature. Occurs at a Place (physical or virtual).",
      litmus: "Not a specific exertion of agency (Action).",
    },
    Action: {
      code: "42",
      layer: "Spacetime",
      standards: ["schema:Action","prov:Activity"] as const,
      standardFit: "Close",
      description: "A discrete assertion or commitment attributable to an Agent. Often produces or records a change (e.g., a transaction, API call, signature). Can be linked to Events via Statements (causes, records, resultsIn).",
      litmus: "Not a broad temporal happening (Event); must be driven by an Agent.",
    },
    PhysicalObject: {
      code: "43",
      layer: "Spacetime",
      standards: ["schema:Product","schema:Thing"] as const,
      standardFit: "Close",
      description: "A tangible, inanimate physical object (e.g., hardware, vehicle, physical document, natural object). Physical only. Use Statements (madeBy, manufactured=true) if man-made vs natural matters.",
      litmus: "Not a location (where). Not a digital artifact (use CreativeWork).",
    },
    TextLiteral: {
      code: "a0",
      layer: "Literals",
      standards: ["rdf:Literal","xsd:string"] as const,
      standardFit: "Exact",
      description: "A plain text sequence of characters.",
      litmus: "Not a Concept.",
    },
    IntegerLiteral: {
      code: "a1",
      layer: "Literals",
      standards: ["rdf:Literal","xsd:integer"] as const,
      standardFit: "Exact",
      description: "A whole number.",
      litmus: "Not a decimal or string.",
    },
    DecimalLiteral: {
      code: "a2",
      layer: "Literals",
      standards: ["rdf:Literal","xsd:decimal"] as const,
      standardFit: "Exact",
      description: "A decimal or floating-point number.",
      litmus: "Not an integer.",
    },
    BoolLiteral: {
      code: "a3",
      layer: "Literals",
      standards: ["rdf:Literal","xsd:boolean"] as const,
      standardFit: "Exact",
      description: "A true or false value.",
      litmus: "Not a number or string.",
    },
    DateLiteral: {
      code: "a4",
      layer: "Literals",
      standards: ["rdf:Literal","xsd:date"] as const,
      standardFit: "Exact",
      description: "A calendar date (YYYY-MM-DD formatted according to ISO 8601).",
      litmus: "Not a datetime or time.",
    },
    TimeLiteral: {
      code: "a5",
      layer: "Literals",
      standards: ["rdf:Literal","xsd:time"] as const,
      standardFit: "Exact",
      description: "A time of day (formatted according to ISO 8601, represented in UTC).",
      litmus: "Not a date or datetime.",
    },
    DateTimeLiteral: {
      code: "a6",
      layer: "Literals",
      standards: ["rdf:Literal","xsd:dateTime"] as const,
      standardFit: "Exact",
      description: "A specific point in time (ISO 8601 formatted, UTC normalized).",
      litmus: "Not a date or time alone.",
    },
    DurationLiteral: {
      code: "a7",
      layer: "Literals",
      standards: ["rdf:Literal","xsd:duration"] as const,
      standardFit: "Exact",
      description: "A calculated amount of elapsed time (ISO 8601 duration format).",
      litmus: "Not a datetime.",
    },
    URILiteral: {
      code: "a8",
      layer: "Literals",
      standards: ["rdf:Literal","xsd:anyURI"] as const,
      standardFit: "Exact",
      description: "A formalized Uniform Resource Identifier string.",
      litmus: "Not plain text.",
    },
    JSONLiteral: {
      code: "a9",
      layer: "Literals",
      standards: ["rdf:Literal","rdf:JSON"] as const,
      standardFit: "Exact",
      description: "A structured JSON object represented in canonical string form.",
      litmus: "Not a string.",
    },
  },
} as const;

export const FIDE_ENTITY_TYPES = FIDE_VOCABULARY.entityTypes;
export type FideEntityTypeName = keyof typeof FIDE_ENTITY_TYPES;
export type FideStandardFit = (typeof FIDE_ENTITY_TYPES)[FideEntityTypeName]["standardFit"];
export type FideEntityTypeSpec = (typeof FIDE_ENTITY_TYPES)[FideEntityTypeName];
export type FideEntityTypeCode = FideEntityTypeSpec["code"];

/**
 * Look up the definition for a single Fide entity type by name.
 *
 * @param name The entity type name.
 * @paramDefault name Person
 * @returns The matching entity type definition.
 */
export function getFideEntityTypeSpecByName(name: FideEntityTypeName): FideEntityTypeSpec {
  return FIDE_ENTITY_TYPES[name];
}

/**
 * Look up the definition for a single Fide entity type by hexadecimal code.
 *
 * @param code The 2-character hexadecimal entity type code.
 * @paramDefault code 10
 * @returns The matching entity type definition, if found.
 */
export function getFideEntityTypeSpecByCode(code: FideEntityTypeCode): FideEntityTypeSpec | undefined {
  return Object.values(FIDE_ENTITY_TYPES).find((spec) => spec.code === code);
}

/**
 * List all defined Fide entity type definitions.
 *
 * @returns Entity type definitions in source order.
 */
export function listFideEntityTypes(): FideEntityTypeSpec[] {
  return Object.values(FIDE_ENTITY_TYPES);
}
