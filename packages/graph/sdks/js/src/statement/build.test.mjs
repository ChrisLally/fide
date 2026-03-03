import { buildStatementsWithRoot } from "../../dist/index.js";

console.log("🧪 Testing Graph Statement Batch Helpers\n");

let failures = 0;
let checks = 0;

const inputsA = [
  {
    subject: { rawIdentifier: "https://example.org/users/alice", entityType: "Person", sourceType: "NetworkResource" },
    predicate: { rawIdentifier: "https://schema.org/knows", entityType: "Concept", sourceType: "NetworkResource" },
    object: { rawIdentifier: "https://example.org/users/bob", entityType: "Person", sourceType: "NetworkResource" }
  },
  {
    subject: { rawIdentifier: "https://example.org/users/alice", entityType: "Person", sourceType: "NetworkResource" },
    predicate: { rawIdentifier: "https://schema.org/worksFor", entityType: "Concept", sourceType: "NetworkResource" },
    object: { rawIdentifier: "https://example.org/orgs/acme", entityType: "Organization", sourceType: "NetworkResource" }
  }
];

const inputsB = [inputsA[1], inputsA[0]];

console.log("1. buildStatementsWithRoot returns statements + IDs + root");
checks += 1;
try {
  const { statements, statementFideIds, root } = await buildStatementsWithRoot(inputsA, { normalizeRawIdentifier: true });

  if (statements.length !== 2) {
    failures += 1;
    console.error("  ❌ Expected 2 statements");
  } else if (statementFideIds.length !== 2) {
    failures += 1;
    console.error("  ❌ Expected 2 statement Fide IDs");
  } else if (!/^[a-f0-9]{64}$/.test(root)) {
    failures += 1;
    console.error("  ❌ Root is not a 64-char lowercase hex sha256");
  } else {
    console.log("  ✅ Batch output shape looks correct");
  }
} catch (error) {
  failures += 1;
  console.error("  ❌ Error:", error.message);
}

console.log("\n2. root is deterministic regardless of input order");
checks += 1;
try {
  const a = await buildStatementsWithRoot(inputsA, { normalizeRawIdentifier: true });
  const b = await buildStatementsWithRoot(inputsB, { normalizeRawIdentifier: true });

  if (a.root !== b.root) {
    failures += 1;
    console.error("  ❌ Roots differ for equivalent unordered inputs");
  } else {
    console.log("  ✅ Root is deterministic across order");
  }
} catch (error) {
  failures += 1;
  console.error("  ❌ Error:", error.message);
}

if (failures > 0) {
  console.error(`\n❌ ${failures} test(s) failed`);
  process.exit(1);
}

console.log(`\n✅ All ${checks} graph statement batch test(s) passed`);
