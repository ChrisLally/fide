import { listSameAsEvaluationInputStatements } from "@chris-test/db";
import { calculateStatementBatchRoot, type StatementWire } from "@chris-test/graph";

export type SameAsEvaluationInputBatch = {
  statementCount: number;
  statementWires: StatementWire[];
  statementFideIds: string[];
  root: string | null;
};

export async function buildSameAsEvaluationInputBatchFromDb(): Promise<SameAsEvaluationInputBatch> {
  const rows = await listSameAsEvaluationInputStatements();

  const sorted = [...rows].sort((a, b) => a.statementFideId.localeCompare(b.statementFideId));
  const statementWires: StatementWire[] = sorted.map((row) => ({
    s: row.subjectFideId,
    sr: row.subjectRawIdentifier,
    p: row.predicateFideId,
    pr: row.predicateRawIdentifier,
    o: row.objectFideId,
    or: row.objectRawIdentifier,
  }));
  const statementFideIds = sorted.map((row) => row.statementFideId);

  const root = statementFideIds.length > 0 ? await calculateStatementBatchRoot(statementFideIds) : null;

  return {
    statementCount: statementWires.length,
    statementWires,
    statementFideIds,
    root,
  };
}
