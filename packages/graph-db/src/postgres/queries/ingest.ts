import { sql } from 'drizzle-orm';
import { assertFideId, parseFideId, type Statement } from '@chris-test/fcp';
import { db } from '../client.js';
import { referenceIdentifiers, statements } from '../schema.js';

const STATEMENT_TYPE = '00';
const CONCEPT_TYPE = '31';
const NETWORK_RESOURCE_TYPE = '20';
const SCHEMA_IDENTIFIER = 'https://schema.org/identifier';
const SCHEMA_SAME_AS = 'https://schema.org/sameAs';

export type ReferenceIdentifierUpsertRow = {
  identifierFingerprint: string;
  referenceIdentifier: string;
};

export type StatementUpsertRow = {
  statementFingerprint: string;
  subjectType: string;
  subjectReferenceType: string;
  subjectFingerprint: string;
  predicateFingerprint: string;
  objectType: string;
  objectReferenceType: string;
  objectFingerprint: string;
};

function assertStatementHasId(statement: Statement): asserts statement is Statement & { statementFideId: string } {
  if (!statement.statementFideId) {
    throw new Error('Invalid statement: missing statementFideId.');
  }
}

function assertProtocolRolePolicy(input: {
  subjectType: string;
  subjectReferenceType: string;
  predicateType: string;
  predicateReferenceType: string;
  predicateReferenceIdentifier: string;
  objectType: string;
  objectReferenceType: string;
}): void {
  if (input.predicateType !== CONCEPT_TYPE) {
    throw new Error(`Invalid predicate Fide ID: expected Concept entity type (${CONCEPT_TYPE}).`);
  }

  if (input.predicateReferenceType !== NETWORK_RESOURCE_TYPE) {
    throw new Error(`Invalid predicate Fide ID: expected NetworkResource reference type (${NETWORK_RESOURCE_TYPE}).`);
  }

  if (input.predicateReferenceIdentifier === SCHEMA_IDENTIFIER) {
    throw new Error('Invalid predicate Reference Identifier: schema:identifier is disallowed in FCP statements.');
  }

  if (input.predicateReferenceIdentifier === SCHEMA_SAME_AS) {
    throw new Error('Invalid predicate Reference Identifier: schema:sameAs is disallowed in FCP statements; use owl:sameAs.');
  }

  if (input.subjectType !== STATEMENT_TYPE && input.subjectReferenceType === STATEMENT_TYPE) {
    throw new Error('Invalid subject Fide ID: non-Statement subjects must not use Statement reference type.');
  }

  if (input.objectType !== STATEMENT_TYPE && input.objectReferenceType === STATEMENT_TYPE) {
    throw new Error('Invalid object Fide ID: non-Statement objects must not use Statement reference type.');
  }
}

export function buildIngestRows(statements: Statement[]): {
  referenceIdentifiers: ReferenceIdentifierUpsertRow[];
  statementRows: StatementUpsertRow[];
} {
  const rawByFingerprint = new Map<string, string>();
  const statementByFingerprint = new Map<string, StatementUpsertRow>();

  for (const statement of statements) {
    assertStatementHasId(statement);

    assertFideId(statement.subjectFideId);
    assertFideId(statement.predicateFideId);
    assertFideId(statement.objectFideId);
    assertFideId(statement.statementFideId);

    const subject = parseFideId(statement.subjectFideId);
    const predicate = parseFideId(statement.predicateFideId);
    const object = parseFideId(statement.objectFideId);
    const statementId = parseFideId(statement.statementFideId);

    assertProtocolRolePolicy({
      subjectType: subject.typeChar,
      subjectReferenceType: subject.referenceChar,
      predicateType: predicate.typeChar,
      predicateReferenceType: predicate.referenceChar,
      predicateReferenceIdentifier: statement.predicateReferenceIdentifier,
      objectType: object.typeChar,
      objectReferenceType: object.referenceChar,
    });

    rawByFingerprint.set(subject.fingerprint, statement.subjectReferenceIdentifier);
    rawByFingerprint.set(predicate.fingerprint, statement.predicateReferenceIdentifier);
    rawByFingerprint.set(object.fingerprint, statement.objectReferenceIdentifier);

    statementByFingerprint.set(statementId.fingerprint, {
      statementFingerprint: statementId.fingerprint,
      subjectType: subject.typeChar,
      subjectReferenceType: subject.referenceChar,
      subjectFingerprint: subject.fingerprint,
      predicateFingerprint: predicate.fingerprint,
      objectType: object.typeChar,
      objectReferenceType: object.referenceChar,
      objectFingerprint: object.fingerprint,
    });
  }

  const referenceIdentifiers: ReferenceIdentifierUpsertRow[] = Array.from(rawByFingerprint.entries()).map(([identifierFingerprint, referenceIdentifier]) => ({
    identifierFingerprint,
    referenceIdentifier,
  }));

  const statementRows = Array.from(statementByFingerprint.values());

  return { referenceIdentifiers, statementRows };
}

export async function upsertReferenceIdentifiers(rows: ReferenceIdentifierUpsertRow[]): Promise<void> {
  if (rows.length === 0) return;

  await db
    .insert(referenceIdentifiers)
    .values(rows)
    .onConflictDoUpdate({
      target: referenceIdentifiers.identifierFingerprint,
      set: {
        referenceIdentifier: sql`excluded.reference_identifier`,
      },
    });
}

export async function upsertStatements(rows: StatementUpsertRow[]): Promise<void> {
  if (rows.length === 0) return;

  await db
    .insert(statements)
    .values(rows)
    .onConflictDoNothing({ target: statements.statementFingerprint });
}

export async function ingestStatements(input: {
  statements: Statement[];
}): Promise<{ statementCount: number }> {
  const { referenceIdentifiers, statementRows } = buildIngestRows(input.statements);

  await upsertReferenceIdentifiers(referenceIdentifiers);
  await upsertStatements(statementRows);

  return { statementCount: statementRows.length };
}
