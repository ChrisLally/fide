import {
  compactPredicateReferenceIdentifier,
  expandPredicateReferenceIdentifier,
} from "../../dist/index.js";

console.log("🧩 Testing Predicate Vocabulary Helpers\n");

let failures = 0;
let checks = 0;

console.log("1. Testing known prefix expansion...");
checks += 1;
try {
  const expanded = expandPredicateReferenceIdentifier("owl:sameAs");
  if (expanded !== "https://www.w3.org/2002/07/owl#sameAs") {
    failures += 1;
    console.error("  ❌ Expected owl:sameAs expansion");
  } else {
    console.log("  ✅ Expanded owl:sameAs");
  }
} catch (error) {
  failures += 1;
  console.error("  ❌ Error:", error.message);
}

console.log("\n2. Testing known prefix compaction...");
checks += 1;
try {
  const compacted = compactPredicateReferenceIdentifier("https://www.w3.org/2002/07/owl#sameAs");
  if (compacted !== "owl:sameAs") {
    failures += 1;
    console.error("  ❌ Expected owl:sameAs compaction");
  } else {
    console.log("  ✅ Compacted owl:sameAs");
  }
} catch (error) {
  failures += 1;
  console.error("  ❌ Error:", error.message);
}

console.log("\n3. Testing default prov prefix...");
checks += 1;
try {
  const expanded = expandPredicateReferenceIdentifier("prov:hadPrimarySource");
  if (expanded !== "https://www.w3.org/ns/prov#hadPrimarySource") {
    failures += 1;
    console.error("  ❌ Expected prov expansion");
  } else {
    console.log("  ✅ Expanded prov:hadPrimarySource");
  }
} catch (error) {
  failures += 1;
  console.error("  ❌ Error:", error.message);
}

if (failures > 0) {
  console.error(`\n❌ ${failures} test(s) failed`);
  process.exit(1);
}

console.log(`\n✅ All ${checks} predicate vocabulary tests passed`);
