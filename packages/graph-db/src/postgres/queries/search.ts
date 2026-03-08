import { sql } from 'drizzle-orm';
import { buildFideIdFromParts } from '@chris-test/fcp';
import { db } from '../client.js';
import { decodeCursor, encodeCursor } from '../../utils/cursor.js';

export type SearchGraphInput = {
  q: string;
  type?: string;
  limit?: number;
  cursor?: string;
};

export type GraphSearchResult = {
  fideId: string;
  referenceIdentifier: string;
  type: string;
  referenceType: string;
};

export async function searchEntities(input: SearchGraphInput): Promise<{
  items: GraphSearchResult[];
  nextCursor: string | null;
}> {
  const q = input.q.trim();
  if (!q) {
    throw new Error('q is required');
  }

  const limit = Math.min(Math.max(input.limit ?? 20, 1), 100);
  const cursor = decodeCursor(input.cursor);

  const typeFilterSql = input.type
    ? sql`and entity_type = ${input.type}`
    : sql``;

  const cursorSql = cursor
    ? sql`and entity_fingerprint > ${cursor.k}`
    : sql``;

  const resultRows = await db.execute(sql<{
    entity_type: string;
    entity_reference_type: string;
    entity_fingerprint: string;
    reference_identifier: string;
  }>`
    with entities as (
      select
        s.subject_type as entity_type,
        s.subject_reference_type as entity_reference_type,
        s.subject_fingerprint as entity_fingerprint,
        subj_ident.reference_identifier as reference_identifier
      from statements s
      inner join reference_identifiers subj_ident
        on subj_ident.identifier_fingerprint = s.subject_fingerprint
      where s.subject_reference_type <> '00'
        and s.object_reference_type <> '00'
      union
      select
        s.object_type as entity_type,
        s.object_reference_type as entity_reference_type,
        s.object_fingerprint as entity_fingerprint,
        obj_ident.reference_identifier as reference_identifier
      from statements s
      inner join reference_identifiers obj_ident
        on obj_ident.identifier_fingerprint = s.object_fingerprint
      where s.subject_reference_type <> '00'
        and s.object_reference_type <> '00'
    )
    select distinct on (entity_fingerprint)
      entity_type,
      entity_reference_type,
      entity_fingerprint,
      reference_identifier
    from entities
    where reference_identifier ilike ${`%${q}%`}
      ${typeFilterSql}
      ${cursorSql}
    order by entity_fingerprint asc, reference_identifier asc
    limit ${limit + 1}
  `);
  const rows = resultRows as unknown as Array<{
    entity_type: string;
    entity_reference_type: string;
    entity_fingerprint: string;
    reference_identifier: string;
  }>;

  const hasMore = rows.length > limit;
  const pageRows = hasMore ? rows.slice(0, limit) : rows;

  const items: GraphSearchResult[] = pageRows.map((row) => ({
    fideId: buildFideIdFromParts(
      row.entity_type,
      row.entity_reference_type,
      row.entity_fingerprint
    ),
    referenceIdentifier: row.reference_identifier,
    type: row.entity_type,
    referenceType: row.entity_reference_type,
  }));

  const nextCursor = hasMore && pageRows.length > 0
    ? encodeCursor({ k: pageRows[pageRows.length - 1]!.entity_fingerprint })
    : null;

  return { items, nextCursor };
}
