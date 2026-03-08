-- ============================================================================
-- FIDE GRAPH - DATABASE SCHEMA
-- Version: Pure Triple Model (No EvaluationMethod/Attestation Entity Types)
-- Updated: 2026-03-07
-- ============================================================================
-- Intentionally lean for fast local iteration:
-- - Keep only core tables/constraints.
-- - Do not add performance indexes yet.
-- - Add indexes later based on observed query patterns.
--
-- This schema implements the core Fide graph storage model:
--
-- 1. reference_identifiers: Lookup table mapping Reference Fingerprints ↔ Reference Identifiers
-- 2. statements: Core statements table (Subject-Predicate-Object as fingerprints)
--    - Includes content and relationship statements
--
-- Start with base tables and indexes only.
-- Add views/materialized views later only if query patterns require them.

-- ============================================================================
-- CLEANUP
-- ============================================================================
DROP TABLE IF EXISTS statements CASCADE;
DROP TABLE IF EXISTS reference_identifiers CASCADE;

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

-- Reference Identifier Type:
-- The second hex digit of a Fide ID is the "reference type". We keep this DRY:
-- reference types reuse the same enum as entity types, since any entity type may be used as a reference.

-- 1. REFERENCE IDENTIFIERS (Reference Fingerprint → Reference Identifier lookup)
-- ============================================================================
-- Maps Fide ID Reference Fingerprints back to their Reference Identifiers (human-readable form).
-- Essential for resolving content-addressed hashes back to human-readable form.
--
-- Schema (ALL COLUMNS NOT NULL):
--   identifier_fingerprint: 36-char Reference Fingerprint (content hash) - PRIMARY KEY
--   reference_identifier: The Reference Identifier string (e.g., "x.com/alice", "schema:worksFor", "@alice") - NOT NULL
--
-- NOTE: The same Reference Identifier (`reference_identifier`) can have different Reference Fingerprints (different contexts).
-- The uniqueness is on identifier_fingerprint (PK), not Reference Identifier (`reference_identifier`).
-- Every Reference Fingerprint must have a Reference Identifier (`reference_identifier`) (no nulls).
--
-- Statement Fide ID Reference Identifiers: s|p|o (pipe-delimited Fide IDs, 155 chars). Never stored here;
-- statement fingerprints are derived from SHA-256(s|p|o) and never appear in reference_identifiers.
CREATE TABLE reference_identifiers (
    identifier_fingerprint CHAR(36) PRIMARY KEY,
    reference_identifier TEXT NOT NULL
);

-- ============================================================================
-- 2. STATEMENTS (Core Statements Table)
-- ============================================================================
-- Core triple store: all statements as Subject-Predicate-Object tuples.
-- Each statement is content-addressed (same triple → same fingerprint).
-- Enables deduplication and agreement queries across multiple signers.
--
-- NOTE: Reference Fingerprints are content-addressed hashes, not foreign keys.
-- statement_fingerprint: SHA-256(subjectFideId|predicateFideId|objectFideId) first 36 hex.
-- Statement Fide ID Reference Identifier format: s|p|o pipe-delimited, no whitespace. Never in reference_identifiers.
-- Subject/predicate/object fingerprints may reference entities, predicates, or other statements.
--
-- SCHEMA INTEGRITY (ALL COLUMNS NOT NULL):
-- - Every statement MUST have subject, predicate, and object (all required, no nulls)
-- - All type and reference_type fields are NOT NULL (enables zero-lookup queries)
-- - All fingerprints are NOT NULL (36-char content hashes)
-- - No defensive null checks needed in service layer (strict schema enforcement)
CREATE TABLE statements (
    statement_fingerprint CHAR(36) PRIMARY KEY,
    subject_type entity_type NOT NULL,
    subject_reference_type entity_type NOT NULL,
    subject_fingerprint CHAR(36) NOT NULL,
    predicate_fingerprint CHAR(36) NOT NULL,
    object_type entity_type NOT NULL,
    object_reference_type entity_type NOT NULL,
    object_fingerprint CHAR(36) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Protocol entity self-sourcing constraint:
    -- Statement entities (type '00') MUST use Statement reference type ('00'),
    -- and non-Statement entities MUST NOT use Statement reference type.
    CONSTRAINT chk_subject_protocol_self_sourced CHECK (
        (subject_type = '00' AND subject_reference_type = '00') OR
        (subject_type <> '00' AND subject_reference_type <> '00')
    ),
    CONSTRAINT chk_object_protocol_self_sourced CHECK (
        (object_type = '00' AND object_reference_type = '00') OR
        (object_type <> '00' AND object_reference_type <> '00')
    )
);

-- ============================================================================
-- TABLE AND COLUMN COMMENTS
-- ============================================================================
COMMENT ON TABLE reference_identifiers IS 'Reference Fingerprint -> Reference Identifier lookup. Maps 36-char Reference Fingerprints to human-readable Reference Identifiers. Statement Fide ID Reference Identifiers (s|p|o pipe-delimited) are derived, not stored.';
COMMENT ON TABLE statements IS 'Core triple store. All statements as Subject-Predicate-Object tuples with fingerprint references. Includes content statements and relationship statements (for example schema:name, schema:citation, owl:sameAs).';
COMMENT ON COLUMN statements.statement_fingerprint IS 'SHA-256(subjectFideId|predicateFideId|objectFideId) first 36 hex. Pipe-delimited Statement Fide ID Reference Identifier format.';

-- ============================================================================
-- SCHEMA INTEGRITY ENFORCEMENT
-- ============================================================================
-- Predicate metadata is represented by predicate_fingerprint + reference_identifiers.
