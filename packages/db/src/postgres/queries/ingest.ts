import { eq, sql } from 'drizzle-orm';
import { assertFideId, parseFideId, type Statement } from '@chris-test/fcp';
import { db } from '../client.js';
import {
  referenceIdentifiers,
  statementBatchItems,
  statementBatches,
  statements,
} from '../schema.js';

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

export function normalizeStatementsForIngest(statements: Statement[]): {
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

export async function hasStatementBatchRoot(root: string): Promise<boolean> {
  const rows = await db
    .select({ root: statementBatches.root })
    .from(statementBatches)
    .where(eq(statementBatches.root, root))
    .limit(1);

  return rows.length > 0;
}

export async function insertStatementBatchRoot(input: {
  root: string;
  sourceKind: string;
  urlBase: string;
  urlPath: string;
  metadata: Record<string, unknown>;
}): Promise<void> {
  await db
    .insert(statementBatches)
    .values({
      root: input.root,
      sourceKind: input.sourceKind,
      urlBase: input.urlBase,
      urlPath: input.urlPath,
      metadata: input.metadata,
    })
    .onConflictDoNothing({ target: statementBatches.root });
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

export async function linkStatementsToBatch(batchRoot: string, statementFingerprints: string[]): Promise<void> {
  if (statementFingerprints.length === 0) return;

  await db
    .insert(statementBatchItems)
    .values(statementFingerprints.map((statementFingerprint) => ({
      batchRoot,
      statementFingerprint,
    })))
    .onConflictDoNothing({
      target: [statementBatchItems.batchRoot, statementBatchItems.statementFingerprint],
    });
}

export async function listBatchStatementFingerprints(batchRoot: string): Promise<string[]> {
  const rows = await db
    .select({ statementFingerprint: statementBatchItems.statementFingerprint })
    .from(statementBatchItems)
    .where(eq(statementBatchItems.batchRoot, batchRoot));

  return rows.map((row) => row.statementFingerprint);
}

export async function ingestStatementBatch(input: {
  root: string;
  sourceKind: string;
  urlBase: string;
  urlPath: string;
  metadata: Record<string, unknown>;
  statements: Statement[];
}): Promise<{ insertedBatch: boolean; statementCount: number }> {
  const exists = await hasStatementBatchRoot(input.root);
  if (exists) {
    return { insertedBatch: false, statementCount: 0 };
  }

  const { referenceIdentifiers, statementRows } = normalizeStatementsForIngest(input.statements);
  const statementFingerprints = statementRows.map((row) => row.statementFingerprint);

  await insertStatementBatchRoot({
    root: input.root,
    sourceKind: input.sourceKind,
    urlBase: input.urlBase,
    urlPath: input.urlPath,
    metadata: input.metadata,
  });
  await upsertReferenceIdentifiers(referenceIdentifiers);
  await upsertStatements(statementRows);
  await linkStatementsToBatch(input.root, statementFingerprints);

  return { insertedBatch: true, statementCount: statementFingerprints.length };
}
