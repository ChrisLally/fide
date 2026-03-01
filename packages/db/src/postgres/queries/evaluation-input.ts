import { sql } from 'drizzle-orm';
import { buildFideIdFromParts, FIDE_ENTITY_TYPE_MAP } from '@chris-test/fcp';
import { db } from '../client.js';

const OWL_SAME_AS = 'https://www.w3.org/2002/07/owl#sameAs';
const OWL_DIFFERENT_FROM = 'https://www.w3.org/2002/07/owl#differentFrom';
const SCHEMA_VALID_FROM = 'https://schema.org/validFrom';
const PROV_HAD_PRIMARY_SOURCE = 'https://www.w3.org/ns/prov#hadPrimarySource';
const SCHEMA_ADDITIONAL_PROPERTY = 'https://schema.org/additionalProperty';
const SCHEMA_NAME = 'https://schema.org/name';
const SCHEMA_WORKS_FOR = 'https://schema.org/worksFor';
const SCHEMA_MEMBER_OF = 'https://schema.org/memberOf';
const SCHEMA_AFFILIATION = 'https://schema.org/affiliation';

export type SameAsEvaluationInputStatement = {
  statementFingerprint: string;
  statementFideId: string;
  includedBy: string[];
  subjectFideId: string;
  subjectRawIdentifier: string;
  predicateFideId: string;
  predicateRawIdentifier: string;
  objectFideId: string;
  objectRawIdentifier: string;
};

function mapRows(rows: Array<{
  statement_fingerprint: string;
  included_by: string;
  subject_type: string;
  subject_source_type: string;
  subject_fingerprint: string;
  subject_raw_identifier: string;
  predicate_fingerprint: string;
  predicate_raw_identifier: string;
  object_type: string;
  object_source_type: string;
  object_fingerprint: string;
  object_raw_identifier: string;
}>): SameAsEvaluationInputStatement[] {
  return rows.map((row) => ({
    statementFingerprint: row.statement_fingerprint,
    statementFideId: buildFideIdFromParts(
      FIDE_ENTITY_TYPE_MAP.Statement,
      FIDE_ENTITY_TYPE_MAP.Statement,
      row.statement_fingerprint
    ),
    includedBy: row.included_by.split(',').filter(Boolean),
    subjectFideId: buildFideIdFromParts(
      row.subject_type,
      row.subject_source_type,
      row.subject_fingerprint
    ),
    subjectRawIdentifier: row.subject_raw_identifier,
    predicateFideId: buildFideIdFromParts(
      FIDE_ENTITY_TYPE_MAP.Concept,
      FIDE_ENTITY_TYPE_MAP.NetworkResource,
      row.predicate_fingerprint
    ),
    predicateRawIdentifier: row.predicate_raw_identifier,
    objectFideId: buildFideIdFromParts(
      row.object_type,
      row.object_source_type,
      row.object_fingerprint
    ),
    objectRawIdentifier: row.object_raw_identifier,
  }));
}

export async function listSameAsEvaluationInputStatements(): Promise<SameAsEvaluationInputStatement[]> {
  const rawRows = await db.execute(sql<{
    statement_fingerprint: string;
    included_by: string;
    subject_type: string;
    subject_source_type: string;
    subject_fingerprint: string;
    subject_raw_identifier: string;
    predicate_fingerprint: string;
    predicate_raw_identifier: string;
    object_type: string;
    object_source_type: string;
    object_fingerprint: string;
    object_raw_identifier: string;
  }>`
    with candidate_sameas as (
      select s.statement_fingerprint, 'candidate_sameas'::text as included_by
      from statements s
      inner join raw_identifiers pred_ident
        on pred_ident.identifier_fingerprint = s.predicate_fingerprint
      where pred_ident.raw_identifier = ${OWL_SAME_AS}
    ),
    candidate_sameas_pairs as (
      select distinct
        s.subject_fingerprint as subject_fp,
        s.object_fingerprint as object_fp
      from statements s
      inner join candidate_sameas cs
        on cs.statement_fingerprint = s.statement_fingerprint
    ),
    valid_from as (
      select s.statement_fingerprint, 'valid_from'::text as included_by
      from statements s
      inner join raw_identifiers pred_ident
        on pred_ident.identifier_fingerprint = s.predicate_fingerprint
      inner join candidate_sameas cs
        on s.subject_type = '00'
       and s.subject_source_type = '00'
       and s.subject_fingerprint = cs.statement_fingerprint
      where pred_ident.raw_identifier = ${SCHEMA_VALID_FROM}
    ),
    citation_subjects as (
      select statement_fingerprint from valid_from
      union
      select statement_fingerprint from candidate_sameas
    ),
    citations as (
      select s.statement_fingerprint, 'citation'::text as included_by
      from statements s
      inner join raw_identifiers pred_ident
        on pred_ident.identifier_fingerprint = s.predicate_fingerprint
      inner join citation_subjects cs
        on s.subject_type = '00'
       and s.subject_source_type = '00'
       and s.subject_fingerprint = cs.statement_fingerprint
      where pred_ident.raw_identifier = ${PROV_HAD_PRIMARY_SOURCE}
    ),
    citation_objects as (
      select distinct
        s.object_fingerprint as object_fp
      from statements s
      inner join citations c
        on c.statement_fingerprint = s.statement_fingerprint
    ),
    report_metadata as (
      select s.statement_fingerprint, 'report_metadata'::text as included_by
      from statements s
      inner join citation_objects co
        on s.subject_fingerprint = co.object_fp
    ),
    report_property_nodes as (
      select distinct
        s.object_fingerprint as object_fp
      from statements s
      inner join report_metadata rm
        on rm.statement_fingerprint = s.statement_fingerprint
      inner join raw_identifiers pred_ident
        on pred_ident.identifier_fingerprint = s.predicate_fingerprint
      where pred_ident.raw_identifier = ${SCHEMA_ADDITIONAL_PROPERTY}
    ),
    report_property_node_statements as (
      select s.statement_fingerprint, 'report_property_node'::text as included_by
      from statements s
      inner join report_property_nodes pn
        on s.subject_fingerprint = pn.object_fp
    ),
    names as (
      select s.statement_fingerprint, 'name'::text as included_by
      from statements s
      inner join raw_identifiers pred_ident
        on pred_ident.identifier_fingerprint = s.predicate_fingerprint
      inner join candidate_sameas_pairs pairs
        on s.subject_fingerprint = pairs.subject_fp
        or s.subject_fingerprint = pairs.object_fp
      where pred_ident.raw_identifier = ${SCHEMA_NAME}
    ),
    affiliations as (
      select s.statement_fingerprint, 'affiliation'::text as included_by
      from statements s
      inner join raw_identifiers pred_ident
        on pred_ident.identifier_fingerprint = s.predicate_fingerprint
      inner join candidate_sameas_pairs pairs
        on s.subject_fingerprint = pairs.subject_fp
        or s.subject_fingerprint = pairs.object_fp
      where pred_ident.raw_identifier in (${SCHEMA_WORKS_FOR}, ${SCHEMA_MEMBER_OF}, ${SCHEMA_AFFILIATION})
    ),
    contradictions as (
      select s.statement_fingerprint, 'contradiction'::text as included_by
      from statements s
      inner join raw_identifiers pred_ident
        on pred_ident.identifier_fingerprint = s.predicate_fingerprint
      inner join candidate_sameas_pairs pairs
        on (
          s.subject_fingerprint = pairs.subject_fp
          and s.object_fingerprint = pairs.object_fp
        ) or (
          s.subject_fingerprint = pairs.object_fp
          and s.object_fingerprint = pairs.subject_fp
        )
      where pred_ident.raw_identifier = ${OWL_DIFFERENT_FROM}
    ),
    selected as (
      select * from candidate_sameas
      union all
      select * from valid_from
      union all
      select * from citations
      union all
      select * from report_metadata
      union all
      select * from report_property_node_statements
      union all
      select * from names
      union all
      select * from affiliations
      union all
      select * from contradictions
    ),
    dedup as (
      select
        statement_fingerprint,
        string_agg(distinct included_by, ',' order by included_by) as included_by
      from selected
      group by statement_fingerprint
    )
    select
      d.statement_fingerprint,
      d.included_by,
      s.subject_type,
      s.subject_source_type,
      s.subject_fingerprint,
      subj_ident.raw_identifier as subject_raw_identifier,
      s.predicate_fingerprint,
      pred_ident.raw_identifier as predicate_raw_identifier,
      s.object_type,
      s.object_source_type,
      s.object_fingerprint,
      obj_ident.raw_identifier as object_raw_identifier
    from dedup d
    inner join statements s
      on s.statement_fingerprint = d.statement_fingerprint
    inner join raw_identifiers subj_ident
      on subj_ident.identifier_fingerprint = s.subject_fingerprint
    inner join raw_identifiers pred_ident
      on pred_ident.identifier_fingerprint = s.predicate_fingerprint
    inner join raw_identifiers obj_ident
      on obj_ident.identifier_fingerprint = s.object_fingerprint
    order by s.statement_fingerprint asc
  `);

  const rows = rawRows as unknown as Array<{
    statement_fingerprint: string;
    included_by: string;
    subject_type: string;
    subject_source_type: string;
    subject_fingerprint: string;
    subject_raw_identifier: string;
    predicate_fingerprint: string;
    predicate_raw_identifier: string;
    object_type: string;
    object_source_type: string;
    object_fingerprint: string;
    object_raw_identifier: string;
  }>;

  return mapRows(rows);
}

/**
 * Returns the exact statement closure needed by OwlSameAs Person v1 evaluation:
 * - candidate owl:sameAs statements from the provided source batch root
 * - schema:validFrom statements where subject is one of those sameAs statements
 * - schema:citation statements where subject is one of those validFrom statements or sameAs statements
 * - supporting name/affiliation statements for sameAs subject/object pairs
 * - explicit owl:differentFrom contradictions for those pairs
 */
export async function listSameAsEvaluationInputStatementsByBatchRoot(batchRoot: string): Promise<SameAsEvaluationInputStatement[]> {
  const rawRows = await db.execute(sql<{
    statement_fingerprint: string;
    included_by: string;
    subject_type: string;
    subject_source_type: string;
    subject_fingerprint: string;
    subject_raw_identifier: string;
    predicate_fingerprint: string;
    predicate_raw_identifier: string;
    object_type: string;
    object_source_type: string;
    object_fingerprint: string;
    object_raw_identifier: string;
  }>`
    with candidate_sameas as (
      select s.statement_fingerprint, 'candidate_sameas'::text as included_by
      from statement_batch_items sbi
      inner join statements s
        on s.statement_fingerprint = sbi.statement_fingerprint
      inner join raw_identifiers pred_ident
        on pred_ident.identifier_fingerprint = s.predicate_fingerprint
      where sbi.batch_root = ${batchRoot}
        and pred_ident.raw_identifier = ${OWL_SAME_AS}
    ),
    candidate_sameas_pairs as (
      select distinct
        s.subject_fingerprint as subject_fp,
        s.object_fingerprint as object_fp
      from statements s
      inner join candidate_sameas cs
        on cs.statement_fingerprint = s.statement_fingerprint
    ),
    valid_from as (
      select s.statement_fingerprint, 'valid_from'::text as included_by
      from statements s
      inner join raw_identifiers pred_ident
        on pred_ident.identifier_fingerprint = s.predicate_fingerprint
      inner join candidate_sameas cs
        on s.subject_type = '00'
       and s.subject_source_type = '00'
       and s.subject_fingerprint = cs.statement_fingerprint
      where pred_ident.raw_identifier = ${SCHEMA_VALID_FROM}
    ),
    citation_subjects as (
      select statement_fingerprint from valid_from
      union
      select statement_fingerprint from candidate_sameas
    ),
    citations as (
      select s.statement_fingerprint, 'citation'::text as included_by
      from statements s
      inner join raw_identifiers pred_ident
        on pred_ident.identifier_fingerprint = s.predicate_fingerprint
      inner join citation_subjects cs
        on s.subject_type = '00'
       and s.subject_source_type = '00'
       and s.subject_fingerprint = cs.statement_fingerprint
      where pred_ident.raw_identifier = ${PROV_HAD_PRIMARY_SOURCE}
    ),
    names as (
      select s.statement_fingerprint, 'name'::text as included_by
      from statements s
      inner join raw_identifiers pred_ident
        on pred_ident.identifier_fingerprint = s.predicate_fingerprint
      inner join candidate_sameas_pairs pairs
        on s.subject_fingerprint = pairs.subject_fp
        or s.subject_fingerprint = pairs.object_fp
      where pred_ident.raw_identifier = ${SCHEMA_NAME}
    ),
    affiliations as (
      select s.statement_fingerprint, 'affiliation'::text as included_by
      from statements s
      inner join raw_identifiers pred_ident
        on pred_ident.identifier_fingerprint = s.predicate_fingerprint
      inner join candidate_sameas_pairs pairs
        on s.subject_fingerprint = pairs.subject_fp
        or s.subject_fingerprint = pairs.object_fp
      where pred_ident.raw_identifier in (${SCHEMA_WORKS_FOR}, ${SCHEMA_MEMBER_OF}, ${SCHEMA_AFFILIATION})
    ),
    contradictions as (
      select s.statement_fingerprint, 'contradiction'::text as included_by
      from statements s
      inner join raw_identifiers pred_ident
        on pred_ident.identifier_fingerprint = s.predicate_fingerprint
      inner join candidate_sameas_pairs pairs
        on (
          s.subject_fingerprint = pairs.subject_fp
          and s.object_fingerprint = pairs.object_fp
        ) or (
          s.subject_fingerprint = pairs.object_fp
          and s.object_fingerprint = pairs.subject_fp
        )
      where pred_ident.raw_identifier = ${OWL_DIFFERENT_FROM}
    ),
    selected as (
      select * from candidate_sameas
      union all
      select * from valid_from
      union all
      select * from citations
      union all
      select * from names
      union all
      select * from affiliations
      union all
      select * from contradictions
    ),
    dedup as (
      select
        statement_fingerprint,
        string_agg(distinct included_by, ',' order by included_by) as included_by
      from selected
      group by statement_fingerprint
    )
    select
      d.statement_fingerprint,
      d.included_by,
      s.subject_type,
      s.subject_source_type,
      s.subject_fingerprint,
      subj_ident.raw_identifier as subject_raw_identifier,
      s.predicate_fingerprint,
      pred_ident.raw_identifier as predicate_raw_identifier,
      s.object_type,
      s.object_source_type,
      s.object_fingerprint,
      obj_ident.raw_identifier as object_raw_identifier
    from dedup d
    inner join statements s
      on s.statement_fingerprint = d.statement_fingerprint
    inner join raw_identifiers subj_ident
      on subj_ident.identifier_fingerprint = s.subject_fingerprint
    inner join raw_identifiers pred_ident
      on pred_ident.identifier_fingerprint = s.predicate_fingerprint
    inner join raw_identifiers obj_ident
      on obj_ident.identifier_fingerprint = s.object_fingerprint
    order by s.statement_fingerprint asc
  `);

  const rows = rawRows as unknown as Array<{
    statement_fingerprint: string;
    included_by: string;
    subject_type: string;
    subject_source_type: string;
    subject_fingerprint: string;
    subject_raw_identifier: string;
    predicate_fingerprint: string;
    predicate_raw_identifier: string;
    object_type: string;
    object_source_type: string;
    object_fingerprint: string;
    object_raw_identifier: string;
  }>;

  return mapRows(rows);
}
