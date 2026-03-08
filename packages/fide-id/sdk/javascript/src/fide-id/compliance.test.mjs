import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import {
  calculateFideId,
  calculateStatementFideId,
} from "../../dist/index.js";

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
  if (doc.namespaceUrl !== "https://fide.work/spec/v1/" || doc.specVersion !== "1") {
    throw new Error(
      `Invalid vector header in ${fileLabel}: expected namespaceUrl=https://fide.work/spec/v1/ and specVersion=1`
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
    testCase.referenceType,
    testCase.referenceIdentifier
  );
  if (actual !== testCase.expectedFideId) {
    failures += 1;
    console.error(
      `[FAIL] ${label}\n  expected: ${testCase.expectedFideId}\n  actual:   ${actual}`
    );
  } else if (verbose) {
    console.log(
      `[PASS] ${label}\n  input:    (${testCase.entityType}, ${testCase.referenceType}, ${JSON.stringify(testCase.referenceIdentifier)})\n  expected: ${testCase.expectedFideId}\n  actual:   ${actual}`
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

// Policy check: Statement reference type requires StatementReferenceIdentifier format.
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

// Policy check: Statement reference type rejects malformed triple parts even with separators present.
checks += 1;
try {
  await calculateFideId(
    "Statement",
    "Statement",
    "did:fide:0x10205fcbdc6d73bcfcd2c73eb4795c2f02f1d1c1|not-a-fide-id|did:fide:0x1020f200f70f531f0f9cce26e9f4bf0bfa5f15d6",
  );
  failures += 1;
  console.error("[FAIL] statement-malformed-triple-part-policy expected rejection, but call succeeded");
} catch (error) {
  if (verbose) {
    console.log(`[PASS] statement-malformed-triple-part-policy rejected invalid input: ${error.message}`);
  }
}

// Policy bypass check: allow invalid Statement referenceIdentifier when explicitly skipped.
checks += 1;
try {
  const bypassed = await calculateFideId(
    "Statement",
    "Statement",
    "not-a-statement-raw-id",
    { dangerouslySkipReferenceIdentifierPolicy: true },
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

// Policy check: literal entity allows NetworkResource reference type.
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

// Policy check: literal entity rejects non-matching literal and non-NetworkResource reference type.
checks += 1;
try {
  await calculateFideId("TextLiteral", "DateTimeLiteral", "2026-02-24T00:00:00Z");
  failures += 1;
  console.error("[FAIL] literal-invalid-reference-type-policy expected rejection, but call succeeded");
} catch (error) {
  if (verbose) {
    console.log(`[PASS] literal-invalid-reference-type-policy rejected invalid input: ${error.message}`);
  }
}

// Policy check: IntegerLiteral reference type requires base-10 integer strings.
checks += 1;
try {
  await calculateFideId("IntegerLiteral", "IntegerLiteral", "1e3");
  failures += 1;
  console.error("[FAIL] integer-literal-format-policy expected rejection, but call succeeded");
} catch (error) {
  if (verbose) {
    console.log(`[PASS] integer-literal-format-policy rejected invalid input: ${error.message}`);
  }
}

// Policy check: BoolLiteral reference type only accepts lowercase true/false.
checks += 1;
try {
  await calculateFideId("BoolLiteral", "BoolLiteral", "TRUE");
  failures += 1;
  console.error("[FAIL] bool-literal-format-policy expected rejection, but call succeeded");
} catch (error) {
  if (verbose) {
    console.log(`[PASS] bool-literal-format-policy rejected invalid input: ${error.message}`);
  }
}

// Policy check: DateLiteral reference type requires zero-padded YYYY-MM-DD.
checks += 1;
try {
  await calculateFideId("DateLiteral", "DateLiteral", "2026-3-5");
  failures += 1;
  console.error("[FAIL] date-literal-format-policy expected rejection, but call succeeded");
} catch (error) {
  if (verbose) {
    console.log(`[PASS] date-literal-format-policy rejected invalid input: ${error.message}`);
  }
}

// Policy check: TimeLiteral reference type requires UTC Z format.
checks += 1;
try {
  await calculateFideId("TimeLiteral", "TimeLiteral", "14:30:00");
  failures += 1;
  console.error("[FAIL] time-literal-format-policy expected rejection, but call succeeded");
} catch (error) {
  if (verbose) {
    console.log(`[PASS] time-literal-format-policy rejected invalid input: ${error.message}`);
  }
}

// Policy check: DateTimeLiteral reference type requires UTC Z format.
checks += 1;
try {
  await calculateFideId("DateTimeLiteral", "DateTimeLiteral", "2026-03-05T14:30:00-05:00");
  failures += 1;
  console.error("[FAIL] datetime-literal-format-policy expected rejection, but call succeeded");
} catch (error) {
  if (verbose) {
    console.log(`[PASS] datetime-literal-format-policy rejected invalid input: ${error.message}`);
  }
}

// Policy check: DurationLiteral reference type requires ISO 8601 duration form.
checks += 1;
try {
  await calculateFideId("DurationLiteral", "DurationLiteral", "3 days");
  failures += 1;
  console.error("[FAIL] duration-literal-format-policy expected rejection, but call succeeded");
} catch (error) {
  if (verbose) {
    console.log(`[PASS] duration-literal-format-policy rejected invalid input: ${error.message}`);
  }
}

// Policy check: URILiteral reference type requires a URI string.
checks += 1;
try {
  await calculateFideId("URILiteral", "URILiteral", "example.com/alice");
  failures += 1;
  console.error("[FAIL] uri-literal-format-policy expected rejection, but call succeeded");
} catch (error) {
  if (verbose) {
    console.log(`[PASS] uri-literal-format-policy rejected invalid input: ${error.message}`);
  }
}

// Policy check: JSONLiteral reference type requires canonical JSON string form.
checks += 1;
try {
  await calculateFideId("JSONLiteral", "JSONLiteral", '{"b":2,"a":1}');
  failures += 1;
  console.error("[FAIL] json-literal-format-policy expected rejection, but call succeeded");
} catch (error) {
  if (verbose) {
    console.log(`[PASS] json-literal-format-policy rejected invalid input: ${error.message}`);
  }
}

// Policy check: NetworkResource reference type requires absolute URI.
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

// Policy check: non-canonical http(s) identifiers are rejected.
checks += 1;
try {
  await calculateFideId(
    "Person",
    "NetworkResource",
    "HTTPS://Example.COM:443/path",
  );
  failures += 1;
  console.error("[FAIL] network-resource-http-canonical-policy expected rejection, but call succeeded");
} catch (error) {
  if (verbose) {
    console.log(`[PASS] network-resource-http-canonical-policy rejected invalid input: ${error.message}`);
  }
}

// Policy check: canonical http(s) identifier is accepted.
checks += 1;
try {
  const canonicalHttp = await calculateFideId(
    "Person",
    "NetworkResource",
    "https://example.com/path",
  );
  if (typeof canonicalHttp !== "string" || !canonicalHttp.startsWith("did:fide:0x1020")) {
    failures += 1;
    console.error("[FAIL] network-resource-http-canonical-accept expected Person/NetworkResource ID output");
  } else if (verbose) {
    console.log(`[PASS] network-resource-http-canonical-accept produced ${canonicalHttp}`);
  }
} catch (error) {
  failures += 1;
  console.error(`[FAIL] network-resource-http-canonical-accept threw unexpectedly: ${error.message}`);
}

if (failures > 0) {
  process.exit(1);
}

console.log(`[PASS] ${checks} golden vectors`);
