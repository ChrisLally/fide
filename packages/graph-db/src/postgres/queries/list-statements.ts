import { sql } from 'drizzle-orm';
import { assertFideId, buildFideIdFromParts, FIDE_ENTITY_TYPE_MAP, parseFideId } from '@chris-test/fcp';
import { db } from '../client.js';
import { decodeCursor, encodeCursor } from '../../utils/cursor.js';

export type GraphStatement = {
  statementFingerprint: string;
  subjectFideId: string;
  subjectReferenceIdentifier: string;
  predicateFideId: string;
  predicateReferenceIdentifier: string;
  objectFideId: string;
  objectReferenceIdentifier: string;
};

export type ListStatementsInput = {
  subjectFideId?: string;
  predicateFideId?: string;
  objectFideId?: string;
  limit?: number;
  cursor?: string;
};

function toFingerprintOrThrow(fideId: string, fieldName: string): string {
  try {
    assertFideId(fideId);
    return parseFideId(fideId).fingerprint;
  } catch {
    throw new Error(`Invalid ${fieldName}: expected did:fide:0x...`);
  }
}

export async function listStatements(input: ListStatementsInput): Promise<{ items: GraphStatement[]; nextCursor: string | null }> {
  const limit = Math.min(Math.max(input.limit ?? 50, 1), 200);
  const cursor = decodeCursor(input.cursor);

  const whereParts: Array<ReturnType<typeof sql>> = [
    sql`s.subject_reference_type <> '00'`,
    sql`s.object_reference_type <> '00'`,
  ];

  if (input.subjectFideId) {
    const fp = toFingerprintOrThrow(input.subjectFideId, 'subjectFideId');
    whereParts.push(sql`subject_fingerprint = ${fp}`);
  }

  if (input.objectFideId) {
    const fp = toFingerprintOrThrow(input.objectFideId, 'objectFideId');
    whereParts.push(sql`object_fingerprint = ${fp}`);
  }

  if (input.predicateFideId) {
    const fp = toFingerprintOrThrow(input.predicateFideId, 'predicateFideId');
    whereParts.push(sql`predicate_fingerprint = ${fp}`);
  }

  if (cursor) {
    whereParts.push(sql`statement_fingerprint > ${cursor.k}`);
  }

  const whereSql = whereParts.length > 0
    ? sql.join(whereParts, sql` and `)
    : sql`true`;

  const rawRows = await db.execute(sql<{
    statement_fingerprint: string;
    subject_fingerprint: string;
    subject_type: string;
    subject_reference_type: string;
    subject_reference_identifier: string;
    predicate_fingerprint: string;
    predicate_reference_identifier: string;
    object_fingerprint: string;
    object_type: string;
    object_reference_type: string;
    object_reference_identifier: string;
  }>`
    select
      s.statement_fingerprint,
      s.subject_fingerprint,
      s.subject_type,
      s.subject_reference_type as subject_reference_type,
      subj_ident.reference_identifier as subject_reference_identifier,
      s.predicate_fingerprint,
      pred_ident.reference_identifier as predicate_reference_identifier,
      s.object_fingerprint,
      s.object_type,
      s.object_reference_type as object_reference_type,
      obj_ident.reference_identifier as object_reference_identifier
    from statements s
    inner join reference_identifiers subj_ident
      on subj_ident.identifier_fingerprint = s.subject_fingerprint
    inner join reference_identifiers pred_ident
      on pred_ident.identifier_fingerprint = s.predicate_fingerprint
    inner join reference_identifiers obj_ident
      on obj_ident.identifier_fingerprint = s.object_fingerprint
    where ${whereSql}
    order by s.statement_fingerprint asc
    limit ${limit + 1}
  `);
  const rows = rawRows as unknown as Array<{
    statement_fingerprint: string;
    subject_fingerprint: string;
    subject_type: string;
    subject_reference_type: string;
    subject_reference_identifier: string;
    predicate_fingerprint: string;
    predicate_reference_identifier: string;
    object_fingerprint: string;
    object_type: string;
    object_reference_type: string;
    object_reference_identifier: string;
  }>;

  const hasMore = rows.length > limit;
  const pageRows = hasMore ? rows.slice(0, limit) : rows;

  const items: GraphStatement[] = pageRows.map((row) => ({
    statementFingerprint: row.statement_fingerprint,
    subjectFideId: buildFideIdFromParts(
      row.subject_type,
      row.subject_reference_type,
      row.subject_fingerprint
    ),
    subjectReferenceIdentifier: row.subject_reference_identifier,
    predicateFideId: buildFideIdFromParts(
      FIDE_ENTITY_TYPE_MAP.Concept,
      FIDE_ENTITY_TYPE_MAP.NetworkResource,
      row.predicate_fingerprint
    ),
    predicateReferenceIdentifier: row.predicate_reference_identifier,
    objectFideId: buildFideIdFromParts(
      row.object_type,
      row.object_reference_type,
      row.object_fingerprint
    ),
    objectReferenceIdentifier: row.object_reference_identifier,
  }));

  const nextCursor = hasMore && pageRows.length > 0
    ? encodeCursor({ k: pageRows[pageRows.length - 1]!.statement_fingerprint })
    : null;

  return { items, nextCursor };
}
