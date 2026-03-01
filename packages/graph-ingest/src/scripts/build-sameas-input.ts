import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { pgClient } from "@chris-test/db";
import { buildSameAsEvaluationInputBatchFromDb } from "../etl/extract/sameas-input-batch-from-db.js";

function getArg(flag: string): string | null {
  const index = process.argv.indexOf(flag);
  if (index < 0) return null;
  const value = process.argv[index + 1];
  return value ?? null;
}

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const PACKAGE_ROOT = resolve(SCRIPT_DIR, "../..");

async function main(): Promise<void> {
  const outPath = getArg("--out");
  const jsonlPath = getArg("--jsonl-out");
  const statementsDirArg = getArg("--statements-dir");

  const batch = await buildSameAsEvaluationInputBatchFromDb();

  if (batch.root) {
    const now = new Date();
    const year = String(now.getUTCFullYear());
    const month = String(now.getUTCMonth() + 1).padStart(2, "0");
    const day = String(now.getUTCDate()).padStart(2, "0");
    const datePartition = `${year}/${month}/${day}`;

    const defaultStatementsDir = process.env.FCP_STATEMENTS_PATH
      ? resolve(process.cwd(), process.env.FCP_STATEMENTS_PATH)
      : resolve(PACKAGE_ROOT, "../../examples/fide-statements-template/.fide/statements");
    const statementsDir = statementsDirArg
      ? resolve(process.cwd(), statementsDirArg)
      : defaultStatementsDir;
    const autoJsonlPath = join(statementsDir, datePartition, `${batch.root}.jsonl`);
    const absoluteJsonlPath = jsonlPath ? resolve(process.cwd(), jsonlPath) : autoJsonlPath;

    const jsonl = batch.statementWires.map((wire) => JSON.stringify(wire)).join("\n");
    await mkdir(dirname(absoluteJsonlPath), { recursive: true });
    await writeFile(absoluteJsonlPath, `${jsonl}\n`, "utf8");
    console.log(`Wrote JSONL batch: ${absoluteJsonlPath}`);
  } else {
    console.log("No statements found for source batch root; no JSONL file written.");
  }

  const output = JSON.stringify(batch, null, 2);

  if (outPath) {
    const absoluteOutPath = resolve(process.cwd(), outPath);
    await mkdir(dirname(absoluteOutPath), { recursive: true });
    await writeFile(absoluteOutPath, output, "utf8");
  }

  console.log(output);
}

try {
  await main();
} finally {
  await pgClient.end({ timeout: 5 });
}
