import { listSameAsEvaluationInputStatements } from "@chris-test/db";
import { calculateStatementSetRoot, type FideId } from "@chris-test/fcp";
import type { GraphStatementWire } from "@chris-test/graph";

export type SameAsEvaluationInputBatch = {
  statementCount: number;
  statementWires: GraphStatementWire[];
  statementFideIds: string[];
  root: string | null;
};

export async function buildSameAsEvaluationInputBatchFromDb(): Promise<SameAsEvaluationInputBatch> {
  const rows = await listSameAsEvaluationInputStatements();

  const sorted = [...rows].sort((a, b) => a.statementFideId.localeCompare(b.statementFideId));
  const statementWires: GraphStatementWire[] = sorted.map((row) => ({
    s: row.subjectFideId,
    sr: row.subjectReferenceIdentifier,
    p: row.predicateFideId,
    pr: row.predicateReferenceIdentifier,
    o: row.objectFideId,
    or: row.objectReferenceIdentifier,
  }));
  const statementFideIds = sorted.map((row) => row.statementFideId as FideId);

  const root = statementFideIds.length > 0 ? await calculateStatementSetRoot(statementFideIds) : null;

  return {
    statementCount: statementWires.length,
    statementWires,
    statementFideIds,
    root,
  };
}
