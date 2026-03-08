import { sql } from 'drizzle-orm';
import { assertFideId, buildFideIdFromParts, parseFideId } from '@chris-test/fcp';
import { db } from '../client.js';
import { listStatements, type GraphStatement } from './list-statements.js';

export type GraphEntity = {
  entityFideId: string;
  primaryReferenceIdentifier: string;
  aliases: string[];
  statements: GraphStatement[];
  nextCursor: string | null;
};

export async function getGraphEntityByFideId(input: {
  fideId: string;
  statementsLimit?: number;
  statementsCursor?: string;
}): Promise<GraphEntity | null> {
  let fingerprint: string;
  try {
    assertFideId(input.fideId);
    fingerprint = parseFideId(input.fideId).fingerprint;
  } catch {
    throw new Error('Invalid fideId: expected did:fide:0x...');
  }

  const primaryReferenceRowsResult = await db.execute(sql<{
    reference_identifier: string;
    entity_type: string;
    entity_reference_type: string;
    entity_fingerprint: string;
  }>`
    select
      subj_ident.reference_identifier as reference_identifier,
      s.subject_type as entity_type,
      s.subject_reference_type as entity_reference_type,
      s.subject_fingerprint as entity_fingerprint
    from statements s
    inner join reference_identifiers subj_ident
      on subj_ident.identifier_fingerprint = s.subject_fingerprint
    where s.subject_fingerprint = ${fingerprint}
      and s.subject_reference_type <> '00'
      and s.object_reference_type <> '00'
    union all
    select
      obj_ident.reference_identifier as reference_identifier,
      s.object_type as entity_type,
      s.object_reference_type as entity_reference_type,
      s.object_fingerprint as entity_fingerprint
    from statements s
    inner join reference_identifiers obj_ident
      on obj_ident.identifier_fingerprint = s.object_fingerprint
    where s.object_fingerprint = ${fingerprint}
      and s.subject_reference_type <> '00'
      and s.object_reference_type <> '00'
    order by reference_identifier asc
    limit 1
  `);
  const primaryRows = primaryReferenceRowsResult as unknown as Array<{
    reference_identifier: string;
    entity_type: string;
    entity_reference_type: string;
    entity_fingerprint: string;
  }>;

  const primary = primaryRows[0];
  if (!primary) return null;

  const aliasReferenceRowsResult = await db.execute(sql<{ reference_identifier: string }>`
    select distinct reference_identifier
    from (
      select subj_ident.reference_identifier as reference_identifier
      from statements s
      inner join reference_identifiers subj_ident
        on subj_ident.identifier_fingerprint = s.subject_fingerprint
      where s.subject_fingerprint = ${fingerprint}
        and s.subject_reference_type <> '00'
        and s.object_reference_type <> '00'
      union
      select obj_ident.reference_identifier as reference_identifier
      from statements s
      inner join reference_identifiers obj_ident
        on obj_ident.identifier_fingerprint = s.object_fingerprint
      where s.object_fingerprint = ${fingerprint}
        and s.subject_reference_type <> '00'
        and s.object_reference_type <> '00'
    ) aliases
    order by reference_identifier asc
    limit 200
  `);
  const aliasRows = aliasReferenceRowsResult as unknown as Array<{ reference_identifier: string }>;

  const statementsPage = await listStatements({
    subjectFideId: buildFideIdFromParts(
      primary.entity_type,
      primary.entity_reference_type,
      fingerprint
    ),
    limit: input.statementsLimit ?? 25,
    cursor: input.statementsCursor,
  });

  return {
    entityFideId: buildFideIdFromParts(
      primary.entity_type,
      primary.entity_reference_type,
      primary.entity_fingerprint
    ),
    primaryReferenceIdentifier: primary.reference_identifier,
    aliases: aliasRows.map((row) => row.reference_identifier),
    statements: statementsPage.items,
    nextCursor: statementsPage.nextCursor,
  };
}
