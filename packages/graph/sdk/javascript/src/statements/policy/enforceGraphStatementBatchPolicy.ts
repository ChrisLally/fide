import type { Statement } from "@chris-test/fcp";

export function enforceGraphStatementBatchPolicy(statements: Statement[]): string[] {
  if (!Array.isArray(statements) || statements.length === 0) {
    throw new Error("Invalid graph statement batch: expected one or more statements.");
  }

  return statements.map((statement, index) => {
    if (!statement.statementFideId) {
      throw new Error(`Invalid statement line ${index + 1}: missing computed statementFideId`);
    }
    return statement.statementFideId;
  });
}
