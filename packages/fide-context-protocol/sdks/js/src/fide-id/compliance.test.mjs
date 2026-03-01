import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { calculateFideId, calculateStatementFideId } from "../../dist/index.js";

const here = dirname(fileURLToPath(import.meta.url));
const rawFideIdVectors = await readFile(resolve(here, "./vectors/calculateFideId.v0.json"), "utf8");
const fideIdVectors = JSON.parse(rawFideIdVectors);
const rawStatementVectors = await readFile(resolve(here, "./vectors/calculateStatementFideId.v0.json"), "utf8");
const statementVectors = JSON.parse(rawStatementVectors);
const verbose = process.argv.includes("--verbose");

let failures = 0;
let checks = 0;

function caseLabel(testCase, index) {
  return testCase.id ?? testCase.name ?? `case-${index + 1}`;
}

function assertVectorHeader(doc, fileLabel) {
  if (doc.protocolId !== "FCP" || doc.protocolGeneration !== "1") {
    throw new Error(
      `Invalid vector header in ${fileLabel}: expected protocolId=FCP and protocolGeneration=1`
    );
  }
}

assertVectorHeader(fideIdVectors, "calculateFideId.v0.json");
assertVectorHeader(statementVectors, "calculateStatementFideId.v0.json");

for (const [index, testCase] of fideIdVectors.cases.entries()) {
  const label = caseLabel(testCase, index);
  checks += 1;
  const actual = await calculateFideId(
    testCase.entityType,
    testCase.sourceEntityType,
    testCase.rawIdentifier
  );
  if (actual !== testCase.expectedFideId) {
    failures += 1;
    console.error(
      `[FAIL] ${label}\n  expected: ${testCase.expectedFideId}\n  actual:   ${actual}`
    );
  } else if (verbose) {
    console.log(
      `[PASS] ${label}\n  input:    (${testCase.entityType}, ${testCase.sourceEntityType}, ${JSON.stringify(testCase.rawIdentifier)})\n  expected: ${testCase.expectedFideId}\n  actual:   ${actual}`
    );
  }
}

for (const [index, testCase] of statementVectors.cases.entries()) {
  const label = caseLabel(testCase, index);
  checks += 1;
  const actual = await calculateStatementFideId(
    testCase.subjectFideId,
    testCase.predicateFideId,
    testCase.objectFideId
  );
  if (actual !== testCase.expectedFideId) {
    failures += 1;
    console.error(
      `[FAIL] ${label}\n  expected: ${testCase.expectedFideId}\n  actual:   ${actual}`
    );
  } else if (verbose) {
    console.log(
      `[PASS] ${label}\n  input:    (${JSON.stringify(testCase.subjectFideId)}, ${JSON.stringify(testCase.predicateFideId)}, ${JSON.stringify(testCase.objectFideId)})\n  expected: ${testCase.expectedFideId}\n  actual:   ${actual}`
    );
  }
}

// Policy check: Statement source requires StatementRawIdentifier format.
checks += 1;
try {
  await calculateFideId("Statement", "Statement", "not-a-statement-raw-id");
  failures += 1;
  console.error("[FAIL] statement-raw-identifier-policy expected rejection, but call succeeded");
} catch (error) {
  if (verbose) {
    console.log(`[PASS] statement-raw-identifier-policy rejected invalid input: ${error.message}`);
  }
}

// Policy bypass check: allow invalid Statement rawIdentifier when explicitly skipped.
checks += 1;
try {
  const bypassed = await calculateFideId(
    "Statement",
    "Statement",
    "not-a-statement-raw-id",
    { dangerouslySkipRawIdentifierPolicy: true },
  );
  if (typeof bypassed !== "string" || !bypassed.startsWith("did:fide:0x0000")) {
    failures += 1;
    console.error("[FAIL] statement-raw-identifier-policy-bypass expected Statement ID output");
  } else if (verbose) {
    console.log(`[PASS] statement-raw-identifier-policy-bypass produced ${bypassed}`);
  }
} catch (error) {
  failures += 1;
  console.error(`[FAIL] statement-raw-identifier-policy-bypass threw unexpectedly: ${error.message}`);
}

// Policy check: literal entity allows NetworkResource source.
checks += 1;
try {
  const literalNetworkResource = await calculateFideId(
    "TextLiteral",
    "NetworkResource",
    "https://example.com/value",
  );
  if (typeof literalNetworkResource !== "string" || !literalNetworkResource.startsWith("did:fide:0xa020")) {
    failures += 1;
    console.error("[FAIL] literal-network-resource-policy expected TextLiteral/NetworkResource ID output");
  } else if (verbose) {
    console.log(`[PASS] literal-network-resource-policy produced ${literalNetworkResource}`);
  }
} catch (error) {
  failures += 1;
  console.error(`[FAIL] literal-network-resource-policy threw unexpectedly: ${error.message}`);
}

// Policy check: literal entity rejects non-matching literal and non-NetworkResource source.
checks += 1;
try {
  await calculateFideId("TextLiteral", "DateTimeLiteral", "2026-02-24T00:00:00Z");
  failures += 1;
  console.error("[FAIL] literal-invalid-source-policy expected rejection, but call succeeded");
} catch (error) {
  if (verbose) {
    console.log(`[PASS] literal-invalid-source-policy rejected invalid input: ${error.message}`);
  }
}

// Policy check: NetworkResource source requires absolute URI.
checks += 1;
try {
  await calculateFideId("Person", "NetworkResource", "not-a-uri");
  failures += 1;
  console.error("[FAIL] network-resource-uri-policy expected rejection, but call succeeded");
} catch (error) {
  if (verbose) {
    console.log(`[PASS] network-resource-uri-policy rejected invalid input: ${error.message}`);
  }
}

// Policy check: known URI scheme shape is enforced (acct).
checks += 1;
try {
  await calculateFideId("Person", "NetworkResource", "acct:not-an-account");
  failures += 1;
  console.error("[FAIL] network-resource-known-scheme-policy expected rejection, but call succeeded");
} catch (error) {
  if (verbose) {
    console.log(`[PASS] network-resource-known-scheme-policy rejected invalid input: ${error.message}`);
  }
}

// Option check: normalize http(s) before hashing when requested.
checks += 1;
try {
  const normalizedByOption = await calculateFideId(
    "Person",
    "NetworkResource",
    "HTTPS://Example.COM:443/path",
    { normalizeRawIdentifier: true },
  );
  const preNormalized = await calculateFideId(
    "Person",
    "NetworkResource",
    "https://example.com/path",
  );
  if (normalizedByOption !== preNormalized) {
    failures += 1;
    console.error("[FAIL] normalize-raw-identifier-option expected canonical-equivalent IDs");
  } else if (verbose) {
    console.log(`[PASS] normalize-raw-identifier-option produced ${normalizedByOption}`);
  }
} catch (error) {
  failures += 1;
  console.error(`[FAIL] normalize-raw-identifier-option threw unexpectedly: ${error.message}`);
}

if (failures > 0) {
  process.exit(1);
}

console.log(`[PASS] ${checks} golden vectors`);
