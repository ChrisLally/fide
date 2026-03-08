import { sql } from 'drizzle-orm';
import { char, check, index, pgTable, text, timestamp } from 'drizzle-orm/pg-core';

export const referenceIdentifiers = pgTable('reference_identifiers', {
  identifierFingerprint: char('identifier_fingerprint', { length: 36 }).primaryKey(),
  referenceIdentifier: text('reference_identifier').notNull(),
}, (table) => [
  index('idx_reference_identifiers_reference').on(table.referenceIdentifier),
]);

export const statements = pgTable('statements', {
  statementFingerprint: char('statement_fingerprint', { length: 36 }).primaryKey(),
  subjectType: char('subject_type', { length: 2 }).notNull(),
  subjectReferenceType: char('subject_reference_type', { length: 2 }).notNull(),
  subjectFingerprint: char('subject_fingerprint', { length: 36 }).notNull(),
  predicateFingerprint: char('predicate_fingerprint', { length: 36 }).notNull(),
  objectType: char('object_type', { length: 2 }).notNull(),
  objectReferenceType: char('object_reference_type', { length: 2 }).notNull(),
  objectFingerprint: char('object_fingerprint', { length: 36 }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  check(
    'chk_subject_protocol_self_sourced',
    sql`(
      (${table.subjectType} = '00' AND ${table.subjectReferenceType} = '00') OR
      (${table.subjectType} <> '00' AND ${table.subjectReferenceType} <> '00')
    )`
  ),
  check(
    'chk_object_protocol_self_sourced',
    sql`(
      (${table.objectType} = '00' AND ${table.objectReferenceType} = '00') OR
      (${table.objectType} <> '00' AND ${table.objectReferenceType} <> '00')
    )`
  ),
]);
