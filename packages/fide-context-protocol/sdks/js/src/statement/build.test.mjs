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
        subject: { rawIdentifier: 'https://x.com/alice', entityType: 'Person', sourceType: 'NetworkResource' },
        predicate: { rawIdentifier: 'https://schema.org/name', entityType: 'Concept', sourceType: 'NetworkResource' },
        object: { rawIdentifier: 'Alice', entityType: 'TextLiteral', sourceType: 'TextLiteral' }
    });

    if (!statement.subjectFideId || !statement.subjectRawIdentifier ||
        !statement.predicateFideId || !statement.predicateRawIdentifier ||
        !statement.objectFideId || !statement.objectRawIdentifier ||
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

// Test 2: Reject Person+Statement (source code 00 forbidden for non-Statement entities)
console.log("\n2. Testing rejection of Person+Statement...");
checks += 1;
try {
    await buildStatement({
        subject: {
            rawIdentifier: "https://x.com/alice",
            entityType: "Person",
            sourceType: "Statement"
        },
        predicate: { rawIdentifier: "https://schema.org/name", entityType: "Concept", sourceType: "NetworkResource" },
        object: { rawIdentifier: "Alice", entityType: "TextLiteral", sourceType: "TextLiteral" }
    });
    failures += 1;
    console.error("  ❌ Should have rejected Person+Statement");
} catch (error) {
    if (error.message.includes("disallows") || error.message.includes("Statement source") || error.message.includes("Invalid sourceEntityType")) {
        console.log("  ✅ Correctly rejected Person+Statement");
    } else {
        failures += 1;
        console.error("  ❌ Wrong error:", error.message);
    }
}

// Test 3: Error when subject/object are malformed (missing entityType/sourceType)
console.log("\n3. Testing error when subject is malformed...");
checks += 1;
try {
    await buildStatement({
        subject: { rawIdentifier: 'https://x.com/alice' }, // Missing entityType, sourceType
        predicate: { rawIdentifier: 'https://schema.org/name', entityType: 'Concept', sourceType: 'NetworkResource' },
        object: { rawIdentifier: 'Alice', entityType: 'TextLiteral', sourceType: 'TextLiteral' }
    });
    failures += 1;
    console.error("  ❌ Should have thrown for malformed subject");
} catch (error) {
    if (error.message?.includes('entityType') || error.message?.includes('sourceEntityType')) {
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
        subject: { rawIdentifier: 'https://x.com/alice', entityType: 'Person', sourceType: 'NetworkResource' },
        predicate: { rawIdentifier: 'schema:name', entityType: 'Concept', sourceType: 'NetworkResource' },
        object: { rawIdentifier: 'Alice', entityType: 'TextLiteral', sourceType: 'TextLiteral' }
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

// Test 5: Do not normalize predicate by default
console.log("\n5. Testing predicate URL behavior without normalization...");
checks += 1;
try {
    const statement = await buildStatement({
        subject: { rawIdentifier: "https://x.com/alice", entityType: "Person", sourceType: "NetworkResource" },
        predicate: { rawIdentifier: "HTTPS://SCHEMA.ORG/name?query=A#Frag", entityType: "Concept", sourceType: "NetworkResource" },
        object: { rawIdentifier: "Alice", entityType: "TextLiteral", sourceType: "TextLiteral" }
    });

    if (statement.predicateRawIdentifier === "HTTPS://SCHEMA.ORG/name?query=A#Frag") {
        console.log("  ✅ Correctly kept predicate rawIdentifier unchanged by default");
    } else {
        failures += 1;
        console.error("  ❌ Unexpected predicate rawIdentifier:", statement.predicateRawIdentifier);
    }
} catch (error) {
    failures += 1;
    console.error("  ❌ Error:", error.message);
}

// Test 6: Reject non-https predicate URL
console.log("\n6. Testing rejection of non-https predicate URL...");
checks += 1;
try {
    await buildStatement({
        subject: { rawIdentifier: "https://x.com/alice", entityType: "Person", sourceType: "NetworkResource" },
        predicate: { rawIdentifier: "http://schema.org/name", entityType: "Concept", sourceType: "NetworkResource" },
        object: { rawIdentifier: "Alice", entityType: "TextLiteral", sourceType: "TextLiteral" }
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

// Test 7: Do not normalize subject/object by default
console.log("\n7. Testing subject/object URL-like behavior without normalization...");
checks += 1;
try {
    const statement = await buildStatement({
        subject: { rawIdentifier: "HTTPS://X.COM:443/JeffBezos", entityType: "Person", sourceType: "NetworkResource" },
        predicate: { rawIdentifier: "https://schema.org/sameAs", entityType: "Concept", sourceType: "NetworkResource" },
        object: { rawIdentifier: "HTTP://EXAMPLE.COM:80/Profile", entityType: "CreativeWork", sourceType: "NetworkResource" }
    });

    if (statement.subjectRawIdentifier !== "HTTPS://X.COM:443/JeffBezos") {
        failures += 1;
        console.error("  ❌ Subject should remain unchanged by default:", statement.subjectRawIdentifier);
    } else if (statement.objectRawIdentifier !== "HTTP://EXAMPLE.COM:80/Profile") {
        failures += 1;
        console.error("  ❌ Object should remain unchanged by default:", statement.objectRawIdentifier);
    } else {
        console.log("  ✅ Correctly kept subject/object rawIdentifiers unchanged by default");
    }
} catch (error) {
    failures += 1;
    console.error("  ❌ Error:", error.message);
}

// Test 8: Normalize URL-like values when requested
console.log("\n8. Testing normalizeRawIdentifier behavior...");
checks += 1;
try {
    const statement = await buildStatement({
        subject: { rawIdentifier: "HTTPS://X.COM:443/JeffBezos", entityType: "Person", sourceType: "NetworkResource" },
        predicate: { rawIdentifier: "https://SCHEMA.ORG/name", entityType: "Concept", sourceType: "NetworkResource" },
        object: { rawIdentifier: "HTTP://EXAMPLE.COM:80/Profile", entityType: "CreativeWork", sourceType: "NetworkResource" }
    }, {
        normalizeRawIdentifier: true
    });

    if (statement.subjectRawIdentifier !== "https://x.com/JeffBezos") {
        failures += 1;
        console.error("  ❌ Subject should have been normalized:", statement.subjectRawIdentifier);
    } else if (statement.objectRawIdentifier !== "http://example.com/Profile") {
        failures += 1;
        console.error("  ❌ Object should have been normalized:", statement.objectRawIdentifier);
    } else if (statement.predicateRawIdentifier !== "https://schema.org/name") {
        failures += 1;
        console.error("  ❌ Predicate should have been normalized:", statement.predicateRawIdentifier);
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
        subject: { rawIdentifier: "https://x.com/alice", entityType: "Person", sourceType: "NetworkResource" },
        predicate: { rawIdentifier: "not-a-url", entityType: "Concept", sourceType: "NetworkResource" },
        object: { rawIdentifier: "Alice", entityType: "TextLiteral", sourceType: "TextLiteral" }
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
