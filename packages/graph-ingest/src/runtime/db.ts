import { pgClient } from "@chris-test/db";

export async function runSqlQuery(sql: string): Promise<Record<string, unknown>[]> {
  return pgClient.unsafe(sql) as Promise<Record<string, unknown>[]>;
}

export async function closeRuntimeDbClient(): Promise<void> {
  await pgClient.end({ timeout: 5 });
}
