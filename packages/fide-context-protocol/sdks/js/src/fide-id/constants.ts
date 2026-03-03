/**
 * THIS FILE IS AUTO-GENERATED FROM spec/v1/entity-types.json.
 * DO NOT EDIT DIRECTLY. RUN: pnpm run generate:fcp
 */
export const FCP_PROTOCOL_ID = "FCP" as const;
export const FCP_PROTOCOL_GENERATION = "1" as const;
export const FCP_SPEC_DATE = "2026-02-18" as const;

export const FIDE_ENTITY_TYPE_MAP = {
    Statement: "00",
    Person: "10",
    Organization: "11",
    SoftwareAgent: "12",
    NetworkResource: "20",
    PlatformAccount: "21",
    CryptographicAccount: "22",
    CreativeWork: "30",
    Concept: "31",
    Place: "40",
    Event: "41",
    Action: "42",
    PhysicalObject: "43",
    TextLiteral: "a0",
    IntegerLiteral: "a1",
    DecimalLiteral: "a2",
    BoolLiteral: "a3",
    DateLiteral: "a4",
    TimeLiteral: "a5",
    DateTimeLiteral: "a6",
    DurationLiteral: "a7",
    URILiteral: "a8",
    JSONLiteral: "a9",
} as const;

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

export const FIDE_ID_PREFIX = 'did:fide:0x' as const;
export const FIDE_ID_HEX_LENGTH = 40;
export const FIDE_ID_LENGTH = FIDE_ID_PREFIX.length + FIDE_ID_HEX_LENGTH;
export const FIDE_ID_FINGERPRINT_LENGTH = 36;
