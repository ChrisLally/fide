import {
    buildStatement
} from "../../dist/index.js";

console.log("📝 Testing Statement Building Helpers\n");

let failures = 0;
let checks = 0;

// Test 1: Create statement
console.log("1. Testing buildStatement...");
checks += 1;
try {
    const statement = await buildStatement({
        subject: { referenceIdentifier: 'https://x.com/alice', entityType: 'Person', referenceType: 'NetworkResource' },
        predicate: { referenceIdentifier: 'https://schema.org/name', entityType: 'Concept', referenceType: 'NetworkResource' },
        object: { referenceIdentifier: 'Alice', entityType: 'TextLiteral', referenceType: 'TextLiteral' }
    });

    if (!statement.subjectFideId || !statement.subjectReferenceIdentifier ||
        !statement.predicateFideId || !statement.predicateReferenceIdentifier ||
        !statement.objectFideId || !statement.objectReferenceIdentifier ||
        !statement.statementFideId) {
        failures += 1;
        console.error("  ❌ Missing required fields");
    } else if (!statement.subjectFideId.startsWith('did:fide:0x') ||
        !statement.predicateFideId.startsWith('did:fide:0x') ||
        !statement.objectFideId.startsWith('did:fide:0x') ||
        !statement.statementFideId.startsWith('did:fide:0x')) {
        failures += 1;
        console.error("  ❌ Invalid Fide ID format");
    } else {
        console.log("  ✅ Statement created successfully");
        console.log("     Subject Fide ID:", statement.subjectFideId.slice(0, 30) + "...");
        console.log("     Statement Fide ID:", statement.statementFideId.slice(0, 30) + "...");
    }
} catch (error) {
    failures += 1;
    console.error("  ❌ Error:", error.message);
}

// Test 2: Reject Person+Statement (reference type code 00 forbidden for non-Statement entities)
console.log("\n2. Testing rejection of Person+Statement...");
checks += 1;
try {
    await buildStatement({
        subject: {
            referenceIdentifier: "https://x.com/alice",
            entityType: "Person",
            referenceType: "Statement"
        },
        predicate: { referenceIdentifier: "https://schema.org/name", entityType: "Concept", referenceType: "NetworkResource" },
        object: { referenceIdentifier: "Alice", entityType: "TextLiteral", referenceType: "TextLiteral" }
    });
    failures += 1;
    console.error("  ❌ Should have rejected Person+Statement");
} catch (error) {
    if (error.message.includes("disallows") || error.message.includes("Statement reference type") || error.message.includes("Invalid referenceType")) {
        console.log("  ✅ Correctly rejected Person+Statement");
    } else {
        failures += 1;
        console.error("  ❌ Wrong error:", error.message);
    }
}

// Test 3: Error when subject/object are malformed (missing entityType/referenceType)
console.log("\n3. Testing error when subject is malformed...");
checks += 1;
try {
    await buildStatement({
        subject: { referenceIdentifier: 'https://x.com/alice' }, // Missing entityType, referenceType
        predicate: { referenceIdentifier: 'https://schema.org/name', entityType: 'Concept', referenceType: 'NetworkResource' },
        object: { referenceIdentifier: 'Alice', entityType: 'TextLiteral', referenceType: 'TextLiteral' }
    });
    failures += 1;
    console.error("  ❌ Should have thrown for malformed subject");
} catch (error) {
    if (error.message?.includes('entityType') || error.message?.includes('referenceType')) {
        console.log("  ✅ Correctly rejected malformed subject");
    } else {
        failures += 1;
        console.error("  ❌ Wrong error:", error.message);
    }
}

// Test 4: Reject predicate shorthand (must be canonical URL)
console.log("\n4. Testing rejection of predicate shorthand...");
checks += 1;
try {
    await buildStatement({
        subject: { referenceIdentifier: 'https://x.com/alice', entityType: 'Person', referenceType: 'NetworkResource' },
        predicate: { referenceIdentifier: 'schema:name', entityType: 'Concept', referenceType: 'NetworkResource' },
        object: { referenceIdentifier: 'Alice', entityType: 'TextLiteral', referenceType: 'TextLiteral' }
    });
    failures += 1;
    console.error("  ❌ Should have rejected shorthand predicate");
} catch (error) {
    if (error.message?.includes('canonical full URL') || error.message?.includes('Expected https URL')) {
        console.log("  ✅ Correctly rejected shorthand predicate");
    } else {
        failures += 1;
        console.error("  ❌ Wrong error:", error.message);
    }
}

// Test 5: Reject non-canonical predicate URL when normalization is disabled
console.log("\n5. Testing predicate URL behavior without normalization...");
checks += 1;
try {
    await buildStatement({
        subject: { referenceIdentifier: "https://x.com/alice", entityType: "Person", referenceType: "NetworkResource" },
        predicate: { referenceIdentifier: "HTTPS://SCHEMA.ORG/name?query=A#Frag", entityType: "Concept", referenceType: "NetworkResource" },
        object: { referenceIdentifier: "Alice", entityType: "TextLiteral", referenceType: "TextLiteral" }
    });
    failures += 1;
    console.error("  ❌ Should have rejected non-canonical predicate URL");
} catch (error) {
    if (error.message?.includes("Non-canonical")) {
        console.log("  ✅ Correctly rejected non-canonical predicate URL");
    } else {
        failures += 1;
        console.error("  ❌ Wrong error:", error.message);
    }
}

// Test 6: Reject non-https predicate URL
console.log("\n6. Testing rejection of non-https predicate URL...");
checks += 1;
try {
    await buildStatement({
        subject: { referenceIdentifier: "https://x.com/alice", entityType: "Person", referenceType: "NetworkResource" },
        predicate: { referenceIdentifier: "http://schema.org/name", entityType: "Concept", referenceType: "NetworkResource" },
        object: { referenceIdentifier: "Alice", entityType: "TextLiteral", referenceType: "TextLiteral" }
    });
    failures += 1;
    console.error("  ❌ Should have rejected non-https predicate URL");
} catch (error) {
    if (error.message?.includes("Expected https URL")) {
        console.log("  ✅ Correctly rejected non-https predicate URL");
    } else {
        failures += 1;
        console.error("  ❌ Wrong error:", error.message);
    }
}

// Test 7: Reject non-canonical subject/object URLs when normalization is disabled
console.log("\n7. Testing subject/object URL-like behavior without normalization...");
checks += 1;
try {
    await buildStatement({
        subject: { referenceIdentifier: "HTTPS://X.COM:443/JeffBezos", entityType: "Person", referenceType: "NetworkResource" },
        predicate: { referenceIdentifier: "https://schema.org/about", entityType: "Concept", referenceType: "NetworkResource" },
        object: { referenceIdentifier: "HTTP://EXAMPLE.COM:80/Profile", entityType: "CreativeWork", referenceType: "NetworkResource" }
    });
    failures += 1;
    console.error("  ❌ Should have rejected non-canonical subject/object URLs");
} catch (error) {
    if (error.message?.includes("Non-canonical")) {
        console.log("  ✅ Correctly rejected non-canonical subject/object URLs");
    } else {
        failures += 1;
        console.error("  ❌ Wrong error:", error.message);
    }
}

// Test 8: Normalize URL-like values when requested
console.log("\n8. Testing normalizeReferenceIdentifier behavior...");
checks += 1;
try {
    const statement = await buildStatement({
        subject: { referenceIdentifier: "HTTPS://X.COM:443/JeffBezos", entityType: "Person", referenceType: "NetworkResource" },
        predicate: { referenceIdentifier: "https://SCHEMA.ORG/name", entityType: "Concept", referenceType: "NetworkResource" },
        object: { referenceIdentifier: "HTTP://EXAMPLE.COM:80/Profile", entityType: "CreativeWork", referenceType: "NetworkResource" }
    }, {
        normalizeReferenceIdentifier: true
    });

    if (statement.subjectReferenceIdentifier !== "https://x.com/JeffBezos") {
        failures += 1;
        console.error("  ❌ Subject should have been normalized:", statement.subjectReferenceIdentifier);
    } else if (statement.objectReferenceIdentifier !== "http://example.com/Profile") {
        failures += 1;
        console.error("  ❌ Object should have been normalized:", statement.objectReferenceIdentifier);
    } else if (statement.predicateReferenceIdentifier !== "https://schema.org/name") {
        failures += 1;
        console.error("  ❌ Predicate should have been normalized:", statement.predicateReferenceIdentifier);
    } else {
        console.log("  ✅ Correctly normalized URL-like values");
    }
} catch (error) {
    failures += 1;
    console.error("  ❌ Error:", error.message);
}

// Test 9: Reject invalid predicate URL
console.log("\n9. Testing rejection of invalid predicate URL...");
checks += 1;
try {
    await buildStatement({
        subject: { referenceIdentifier: "https://x.com/alice", entityType: "Person", referenceType: "NetworkResource" },
        predicate: { referenceIdentifier: "not-a-url", entityType: "Concept", referenceType: "NetworkResource" },
        object: { referenceIdentifier: "Alice", entityType: "TextLiteral", referenceType: "TextLiteral" }
    });
    failures += 1;
    console.error("  ❌ Should have rejected invalid predicate URL");
} catch (error) {
    if (error.message?.includes("canonical full URL")) {
        console.log("  ✅ Correctly rejected invalid predicate URL");
    } else {
        failures += 1;
        console.error("  ❌ Wrong error:", error.message);
    }
}

if (failures > 0) {
    console.error(`\n❌ ${failures} test(s) failed`);
    process.exit(1);
}

console.log(`\n✅ All ${checks} statement building tests passed`);
