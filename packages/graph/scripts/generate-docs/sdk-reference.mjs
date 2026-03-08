#!/usr/bin/env node

import { mkdir, readdir, readFile, unlink, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const PACKAGE_ROOT = resolve(SCRIPT_DIR, "..", "..");
const REPO_ROOT = resolve(PACKAGE_ROOT, "..", "..");
const SDK_ENTRY = resolve(PACKAGE_ROOT, "sdk/javascript/src/index.ts");
const DOCS_ROOT = resolve(PACKAGE_ROOT, "docs/sdk");
const DOCS_OUT = resolve(DOCS_ROOT, "javascript");
const SECTION_BY_FUNCTION = {
  buildStatementsWithRoot: "Statement Batches",
  buildCanonicalStatementSet: "Statement Batches",
  parseGraphStatementBatchJsonl: "JSONL",
  formatGraphStatementBatchJsonl: "JSONL",
};

function run(command, args) {
  const result = spawnSync(command, args, {
    cwd: REPO_ROOT,
    env: process.env,
    stdio: "inherit",
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

async function ensureDocsRoots() {
  await mkdir(DOCS_OUT, { recursive: true });
  await writeFile(
    resolve(DOCS_ROOT, "meta.json"),
    `${JSON.stringify(
      {
        title: "SDK",
        pages: ["javascript"],
      },
      null,
      2,
    )}\n`,
    "utf8",
  );
}

async function clearGeneratedDocs() {
  const files = await readdir(DOCS_OUT);
  for (const file of files) {
    if (!file.endsWith(".mdx") && file !== "meta.json") continue;
    await unlink(resolve(DOCS_OUT, file));
  }
}

async function customizeGeneratedDocs() {
  const files = await readdir(DOCS_OUT);
  for (const file of files) {
    const fullPath = resolve(DOCS_OUT, file);

    if (file === "meta.json") {
      await writeFile(
        fullPath,
        `${JSON.stringify(
          {
            title: "SDK",
            description: "Generated SDK reference",
            root: true,
            icon: "Box",
            pages: [
              "index",
              "--- Statement Batches ---",
              "build-statements-with-root",
              "build-canonical-statement-set",
              "--- JSONL ---",
              "parse-graph-statement-batch-jsonl",
              "format-graph-statement-batch-jsonl",
            ],
          },
          null,
          2,
        )}\n`,
        "utf8",
      );
      continue;
    }

    if (!file.endsWith(".mdx")) continue;

    const source = await readFile(fullPath, "utf8");
    let updated = source;

    if (file !== "index.mdx") {
      updated = updated.replace(
        /<SDKFunctionPageInteractive data=\{(\{[\s\S]*\})\} \/>/,
        (_match, json) => {
          const data = JSON.parse(json);
          data.packageName = "@chris-test/graph";
          const groupedSection = SECTION_BY_FUNCTION[data.name];
          if (groupedSection) {
            data.section = groupedSection;
          }
          return `<SDKFunctionPageInteractive data={${JSON.stringify(data)}} />`;
        },
      );
    } else {
      updated = `---
title: "SDK"
description: "JavaScript SDK reference for Fide Graph."
---

### Statement Batches

  - [\`buildStatementsWithRoot\`](./javascript/build-statements-with-root)
  - [\`buildCanonicalStatementSet\`](./javascript/build-canonical-statement-set)

### JSONL

  - [\`parseGraphStatementBatchJsonl\`](./javascript/parse-graph-statement-batch-jsonl)
  - [\`formatGraphStatementBatchJsonl\`](./javascript/format-graph-statement-batch-jsonl)
`;
    }

    if (updated !== source) {
      await writeFile(fullPath, updated, "utf8");
    }
  }
}

await ensureDocsRoots();
await clearGeneratedDocs();

run("pnpm", [
  "exec",
  "lally",
  "fumadocs",
  "generate",
  "sdk",
  "--app",
  "apps/docs",
  "--entry",
  SDK_ENTRY,
  "--out",
  DOCS_OUT,
  "--package-name",
  "@chris-test/graph",
  "--title",
  "SDK",
  "--component-import-path",
  "@/components/sdk-layout/sdk-function-page-interactive",
  "--component-export-name",
  "SDKFunctionPageInteractive",
  "--component-file-path",
  "src/components/sdk-layout/sdk-function-page-interactive.tsx",
]);

await customizeGeneratedDocs();
