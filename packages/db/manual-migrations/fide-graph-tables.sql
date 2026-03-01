-- ============================================================================
-- FIDE GRAPH - DATABASE SCHEMA
-- Version: Pure Triple Model (No EvaluationMethod/Attestation Entity Types)
-- Updated: 2026-02-20
-- ============================================================================
-- Intentionally lean for fast local iteration:
-- - Keep only core tables/constraints.
-- - Do not add performance indexes yet.
-- - Add indexes later based on observed query patterns.
--
-- This schema implements the core Fide graph storage model:
--
-- 1. raw_identifiers: Lookup table mapping fingerprints ↔ rawIdentifiers
-- 2. statements: Core statements table (Subject-Predicate-Object as fingerprints)
--    - Includes content and relationship statements
--    - Includes owl:sameAs statements (alias → primary relationships)
--
-- Identity Resolution:
--   - No alias_resolution table
--   - Resolution policy is handled in service logic and computed output tables.
--
-- Start with base tables and indexes only.
-- Add views/materialized views later only if query patterns require them.

-- ============================================================================
-- CLEANUP
-- ============================================================================
DROP TABLE IF EXISTS statement_batch_items CASCADE;
DROP TABLE IF EXISTS statement_batches CASCADE;
DROP TABLE IF EXISTS statements CASCADE;
DROP TABLE IF EXISTS identity_resolutions CASCADE;
DROP TABLE IF EXISTS raw_identifiers CASCADE;

-- Drop old enums
DROP TYPE IF EXISTS entity_type CASCADE;

-- ============================================================================
-- ENUMS
-- ============================================================================

-- Entity Type: First hex digit of Fide ID
-- Encodes the semantic category of an entity
-- Layers: 00 Protocol | 10-1F Agents | 20-2F Network Anchors | 30-3F Knowledge | 40-4F Spacetime | a0-a9 Literals
CREATE TYPE entity_type AS ENUM (
    '00', -- Statement (Protocol)
    '10', -- Person
    '11', -- Organization
    '12', -- SoftwareAgent
    '20', -- NetworkResource (location-anchored; use CreativeWork when work is focus)
    '21', -- PlatformAccount
    '22', -- CryptographicAccount
    '30', -- CreativeWork (work-anchored; use NetworkResource when location is primary)
    '31', -- Concept
    '40', -- Place
    '41', -- Event
    '42', -- Action
    '43', -- PhysicalObject
    'a0', -- TextLiteral
    'a1', -- IntegerLiteral
    'a2', -- DecimalLiteral
    'a3', -- BoolLiteral
    'a4', -- DateLiteral
    'a5', -- TimeLiteral
    'a6', -- DateTimeLiteral
    'a7', -- DurationLiteral
    'a8', -- URILiteral
    'a9'  -- JSONLiteral
);

-- Source Identifier Type:
-- The second hex digit of a Fide ID is the "source type". We keep this DRY:
-- source types reuse the same enum as entity types, since any entity type may be used as a source.

-- 1. RAW IDENTIFIERS (Fingerprint → rawIdentifier Lookup)
-- ============================================================================
-- Maps Fide ID fingerprints back to their rawIdentifiers (human-readable form).
-- Essential for resolving content-addressed hashes back to human-readable form.
--
-- Schema (ALL COLUMNS NOT NULL):
--   identifier_fingerprint: 36-char fingerprint (content hash) - PRIMARY KEY
--   raw_identifier: The source string (e.g., "x.com/alice", "schema:worksFor", "@alice") - NOT NULL
--
-- NOTE: Same rawIdentifier (`raw_identifier`) can have different fingerprints (different contexts).
-- The uniqueness is on identifier_fingerprint (PK), not rawIdentifier (`raw_identifier`).
-- Every fingerprint must have a rawIdentifier (`raw_identifier`) (no nulls).
--
-- Statement raw identifiers: s|p|o (pipe-delimited Fide IDs, 155 chars). Never stored here;
-- statement fingerprints are derived from SHA-256(s|p|o) and never appear in raw_identifiers.
CREATE TABLE raw_identifiers (
    identifier_fingerprint CHAR(36) PRIMARY KEY,
    raw_identifier TEXT NOT NULL
);

-- ============================================================================
-- 2. STATEMENTS (Core Statements Table)
-- ============================================================================
-- Core triple store: all statements as Subject-Predicate-Object tuples.
-- Each statement is content-addressed (same triple → same fingerprint).
-- Enables deduplication and agreement queries across multiple signers.
--
-- NOTE: Fingerprints are content-addressed hashes, not foreign keys.
-- statement_fingerprint: SHA-256(subjectFideId|predicateFideId|objectFideId) first 36 hex.
-- Statement raw identifier format: s|p|o pipe-delimited, no whitespace. Never in raw_identifiers.
-- Subject/predicate/object fingerprints may reference entities, predicates, or other statements.
--
-- SCHEMA INTEGRITY (ALL COLUMNS NOT NULL):
-- - Every statement MUST have subject, predicate, and object (all required, no nulls)
-- - All type and source_type fields are NOT NULL (enables zero-lookup queries)
-- - All fingerprints are NOT NULL (36-char content hashes)
-- - No defensive null checks needed in service layer (strict schema enforcement)
CREATE TABLE statements (
    statement_fingerprint CHAR(36) PRIMARY KEY,
    first_created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    subject_type entity_type NOT NULL,
    subject_source_type entity_type NOT NULL,
    subject_fingerprint CHAR(36) NOT NULL,
    predicate_fingerprint CHAR(36) NOT NULL,
    object_type entity_type NOT NULL,
    object_source_type entity_type NOT NULL,
    object_fingerprint CHAR(36) NOT NULL,

    -- Protocol entity self-sourcing constraint: Protocol entities must be self-sourced
    -- Statements (type '00') MUST have Statement source ('00') = 0x0000
    CONSTRAINT chk_subject_protocol_self_sourced CHECK (
        (subject_type = '00' AND subject_source_type = '00') OR
        (subject_type <> '00')
    ),
    CONSTRAINT chk_object_protocol_self_sourced CHECK (
        (object_type = '00' AND object_source_type = '00') OR
        (object_type <> '00')
    )
);

-- ============================================================================
-- 3. STATEMENT BATCHES (Root-level ingest tracking)
-- ============================================================================
-- Tracks first-seen statement batch roots and links batch roots to statement fingerprints.
CREATE TABLE statement_batches (
    root CHAR(64) PRIMARY KEY,
    source_kind TEXT NOT NULL,
    url_base TEXT NOT NULL,
    url_path TEXT NOT NULL,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    first_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE statement_batch_items (
    batch_root CHAR(64) NOT NULL REFERENCES statement_batches(root) ON DELETE CASCADE,
    statement_fingerprint CHAR(36) NOT NULL REFERENCES statements(statement_fingerprint) ON DELETE CASCADE,
    indexed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT pk_statement_batch_items PRIMARY KEY (batch_root, statement_fingerprint)
);

-- ============================================================================
-- 4. IDENTITY RESOLUTIONS (Resolved-only outputs)
-- ============================================================================
-- Resolved-only table produced by identity resolution jobs.
-- Each subject resolves to a canonical statement fingerprint anchor.
CREATE TABLE identity_resolutions (
    subject_type entity_type NOT NULL,
    subject_source_type entity_type NOT NULL,
    subject_fingerprint CHAR(36) NOT NULL,
    resolved_fingerprint CHAR(36) NOT NULL,
    resolved_first_created_at TIMESTAMPTZ NOT NULL,
    method_version TEXT NOT NULL,
    run_id TEXT NOT NULL,
    computed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT pk_identity_resolutions PRIMARY KEY (
        subject_type,
        subject_source_type,
        subject_fingerprint
    )
);

-- ============================================================================
-- NO alias_resolution TABLE
-- ============================================================================
-- Resolution policy is derived from statements and service logic.
-- No separate alias table is required in this schema.

-- ============================================================================
-- TABLE AND COLUMN COMMENTS
-- ============================================================================
COMMENT ON TABLE raw_identifiers IS 'Fingerprint → rawIdentifier lookup. Maps 36-char fingerprints to human-readable identifiers. Statement raw identifiers (s|p|o pipe-delimited) are derived, not stored.';
COMMENT ON TABLE statements IS 'Core triple store. All statements as Subject-Predicate-Object tuples with fingerprint references. Includes content statements and relationship statements (for example schema:name, schema:citation, owl:sameAs).';
COMMENT ON COLUMN statements.statement_fingerprint IS 'SHA-256(subjectFideId|predicateFideId|objectFideId) first 36 hex. Pipe-delimited s|p|o format.';
COMMENT ON TABLE statement_batches IS 'First-seen statement batch roots with source provenance. url_base + url_path identify the fetched batch content location.';
COMMENT ON TABLE identity_resolutions IS 'Resolved-only identity outputs. Canonical resolution is anchored by resolved_fingerprint (statement fingerprint). method_version is the identity-resolution method version applied to this row in the context of its subject_type.';

-- ============================================================================
-- SCHEMA INTEGRITY ENFORCEMENT
-- ============================================================================
-- Predicate metadata is represented by predicate_fingerprint + raw_identifiers.

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================
-- Identity resolution logic is expected to live in service jobs and computed output tables.
