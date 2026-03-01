/**
 * FCP SDK Constants
 * Central location for all protocol constants
 */
export const FCP_PROTOCOL_ID = "FCP" as const;
export const FCP_PROTOCOL_GENERATION = "1" as const;
export const FCP_SPEC_DATE = "2026-02-18" as const;

/**
 * Entity Type Map
 * Maps FCP entity type names to their two-character hex codes.
 * Used as both Part 1 (Entity Type) and Part 2 (Identifier Source) in Fide IDs.
 *
 * @pattern Multi-facet identity: A single thing often has multiple IDs. Link via Statements:
 *   - NetworkResource ↔ (represents/delivers) ↔ CreativeWork
 *   - PhysicalObject ↔ (embodies) ↔ CreativeWork
 */
export const FIDE_ENTITY_TYPE_MAP = {
    // 00-0F: FIDE primitives
    /**
     * The atomic unit of the graph. An objective record of a Subject-Predicate-Object assertion.
     *
     * @layer Protocol
     * @standard rdf:Statement
     * @standardFit Exact
     * @litmus Not a verified fact; verification is application-level. Not what it represents.
     */
    Statement: "00",

    // 10-1F: Agents
    /**
     * A person (alive, dead, undead, or fictional).
     *
     * @layer Agents
     * @standard schema:Person
     * @standardFit Exact
     * @litmus Not an account or organization.
     */
    Person: "10",
    /**
     * A structured collective of people or agents that acts as a unit.
     *
     * @layer Agents
     * @standard org:Organization
     * @standardFit Exact
     * @litmus Not a single person or software. Not a query-defined group (e.g. alumni by year); create only when the group itself needs to act.
     */
    Organization: "11",
    /**
     * A running process that acts as an independent actor: bot, AI agent, smart contract. Can hold keys and sign.
     *
     * @layer Agents
     * @standard schema:SoftwareApplication + prov:SoftwareAgent
     * @standardFit Close
     * @litmus Not a person or organization. Not static passive code (use CreativeWork for repos, images, logic).
     */
    SoftwareAgent: "12",

    // 20-2F: Network Anchors
    /**
     * Identity primarily by addressability/resolution (URL, URI, CID, etc.), regardless of authorship.
     * Retrieved/resolved as content or endpoint. A NetworkResource often represents or delivers a CreativeWork.
     *
     * @layer Network Anchors
     * @standard schema:WebPage + schema:WebSite + schema:EntryPoint
     * @standardFit Broad
     * @litmus Not a subset or account. Not an inhabitable spatial context (use Place).
     */
    NetworkResource: "20",
    /**
     * An authority-based account principal (e.g., an email address or a specific GitHub, Google, or Mastodon user ID).
     * The identity exists by the permission of a host system's database.
     *
     * @layer Network Anchors
     * @standard schema:OnlineAccount
     * @standardFit Close
     * @litmus Authenticated by a host authority's database, not purely by mathematics.
     */
    PlatformAccount: "21",
    /**
     * A math-based account principal (e.g., an EVM address, Bitcoin wallet, or did:key).
     * The identity exists mathematically and is authenticated via mathematical signature keys.
     *
     * @layer Network Anchors
     * @standard sec:PublicKey + sec:publicKeyMultibase
     * @standardFit Close
     * @litmus Authenticated via mathematical signature keys, independent of a host authority.
     */
    CryptographicAccount: "22",

    // 30-3F: Knowledge
    /**
     * The most generic kind of creative work, including books, movies, photographs, software programs, etc.
     * Non-expressive digital artifacts (binaries, model weights, dataset snapshots) are CreativeWork with refinement via Statements (artifactKind, mediaType, generatedBy, derivedFrom).
     *
     * @layer Knowledge
     * @standard schema:CreativeWork
     * @standardFit Exact
     * @litmus Not a raw value or formal concept. Not a running agent instance (use SoftwareAgent). Not a resource where location is primary identifier (use NetworkResource).
     */
    CreativeWork: "30",
    /**
     * A formal concept, word, topic, category, or abstract idea defined in a taxonomy.
     *
     * @layer Knowledge
     * @standard schema:DefinedTerm
     * @standardFit Close
     * @litmus Not a plain raw value.
     */
    Concept: "31",
    // 40-4F: Spacetime
    /**
     * A spatial context that can contain presence, co-location, and interaction. Includes physical locations and persistent virtual environments (e.g., a concert venue, a Discord server or channel, a Zoom room, a VRChat instance). Physicality/virtuality is asserted via Statements, not the base type.
     *
     * @layer Spacetime
     * @standard schema:Place + schema:VirtualLocation
     * @standardFit Broad
     * @litmus Not a happening or a physical artifact. Can an Actor have presence there? Is its identity a spatial address rather than a document location or account?
     */
    Place: "40",
    /**
     * An occurrence or happening bounded in time. Can be observed/aggregated; may be caused by Actions, systems, or nature. Occurs at a Place (physical or virtual).
     *
     * @layer Spacetime
     * @standard schema:Event
     * @standardFit Exact
     * @litmus Not a specific exertion of agency (Action).
     */
    Event: "41",
    /**
     * A discrete assertion or commitment attributable to an Agent. Often produces or records a change (e.g., a transaction, API call, signature). Can be linked to Events via Statements (causes, records, resultsIn).
     *
     * @layer Spacetime
     * @standard schema:Action + prov:Activity
     * @standardFit Close
     * @litmus Not a broad temporal happening (Event); must be driven by an Agent.
     */
    Action: "42",
    /**
     * A tangible, inanimate physical object (e.g., hardware, vehicle, physical document, natural object). Physical only. Use Statements (madeBy, manufactured=true) if man-made vs natural matters.
     *
     * @layer Spacetime
     * @standard schema:Product + schema:Thing
     * @standardFit Close
     * @litmus Not a location (where). Not a digital artifact (use CreativeWork).
     */
    PhysicalObject: "43",

    // A0-AF: Literals
    /**
     * A plain text sequence of characters.
     *
     * @layer Literals
     * @standard rdf:Literal + xsd:string
     * @standardFit Exact
     * @litmus Not a Concept.
     */
    TextLiteral: "a0",
    /**
     * A whole number.
     *
     * @layer Literals
     * @standard rdf:Literal + xsd:integer
     * @standardFit Exact
     * @litmus Not a decimal or string.
     */
    IntegerLiteral: "a1",
    /**
     * A decimal or floating-point number.
     *
     * @layer Literals
     * @standard rdf:Literal + xsd:decimal
     * @standardFit Exact
     * @litmus Not an integer.
     */
    DecimalLiteral: "a2",
    /**
     * A true or false value.
     *
     * @layer Literals
     * @standard rdf:Literal + xsd:boolean
     * @standardFit Exact
     * @litmus Not a number or string.
     */
    BoolLiteral: "a3",
    /**
     * A calendar date (YYYY-MM-DD formatted according to ISO 8601).
     *
     * @layer Literals
     * @standard rdf:Literal + xsd:date
     * @standardFit Exact
     * @litmus Not a datetime or time.
     */
    DateLiteral: "a4",
    /**
     * A time of day (formatted according to ISO 8601, represented in UTC).
     *
     * @layer Literals
     * @standard rdf:Literal + xsd:time
     * @standardFit Exact
     * @litmus Not a date or datetime.
     */
    TimeLiteral: "a5",
    /**
     * A specific point in time (ISO 8601 formatted, UTC normalized).
     *
     * @layer Literals
     * @standard rdf:Literal + xsd:dateTime
     * @standardFit Exact
     * @litmus Not a date or time alone.
     */
    DateTimeLiteral: "a6",
    /**
     * A calculated amount of elapsed time (ISO 8601 duration format).
     *
     * @layer Literals
     * @standard rdf:Literal + xsd:duration
     * @standardFit Exact
     * @litmus Not a datetime.
     */
    DurationLiteral: "a7",
    /**
     * A formalized Uniform Resource Identifier string (RFC 3986).
     *
     * @layer Literals
     * @standard rdf:Literal + xsd:anyURI
     * @standardFit Exact
     * @litmus Not plain text.
     */
    URILiteral: "a8",
    /**
     * A structured JSON object represented in canonical string form (RFC 8785).
     *
     * @layer Literals
     * @standard rdf:Literal + rdf:JSON
     * @standardFit Exact
     * @litmus Not a string.
     */
    JSONLiteral: "a9",
} as const;

/**
 * Reverse lookup: character code to entity type name
 */
export const FIDE_CHAR_TO_ENTITY_TYPE: Record<string, keyof typeof FIDE_ENTITY_TYPE_MAP> = {
    "00": "Statement",
    "10": "Person",
    "11": "Organization",
    "12": "SoftwareAgent",
    "20": "NetworkResource",
    "21": "PlatformAccount",
    "22": "CryptographicAccount",
    "30": "CreativeWork",
    "31": "Concept",
    "40": "Place",
    "41": "Event",
    "42": "Action",
    "43": "PhysicalObject",
    "a0": "TextLiteral",
    "a1": "IntegerLiteral",
    "a2": "DecimalLiteral",
    "a3": "BoolLiteral",
    "a4": "DateLiteral",
    "a5": "TimeLiteral",
    "a6": "DateTimeLiteral",
    "a7": "DurationLiteral",
    "a8": "URILiteral",
    "a9": "JSONLiteral",
};

/**
 * Fide ID Prefix
 * All Fide IDs start with this constant prefix (W3C DID format)
 */
export const FIDE_ID_PREFIX = "did:fide:0x" as const;

/**
 * Fide ID Length (excluding prefix)
 * 40 hex characters: 2 (type) + 2 (source) + 36 (fingerprint)
 */
export const FIDE_ID_HEX_LENGTH = 40;

/**
 * Fide ID Length (including prefix)
 * "did:fide:0x" (11) + 40 hex = 51 characters
 */
export const FIDE_ID_LENGTH = FIDE_ID_PREFIX.length + FIDE_ID_HEX_LENGTH;

/**
 * Fingerprint Length
 * First 36 hex characters (18 bytes) of SHA-256 hash
 */
export const FIDE_ID_FINGERPRINT_LENGTH = 36;
