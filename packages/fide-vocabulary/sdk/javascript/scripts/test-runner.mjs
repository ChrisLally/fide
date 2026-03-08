#!/usr/bin/env node

import {
  FIDE_ENTITY_TYPES,
  FIDE_VOCABULARY,
  getFideEntityTypeSpecByName,
  getFideEntityTypeSpecByCode,
  listFideEntityTypes,
} from "../dist/index.js";

const verbose = process.argv.includes("--verbose");
let failures = 0;

function pass(label) {
  if (verbose) {
    console.log(`[PASS] ${label}`);
  }
}

function fail(label, message) {
  failures += 1;
  console.error(`[FAIL] ${label}: ${message}`);
}

if (FIDE_VOCABULARY.specVersion !== "1") {
  fail("spec-version", `expected 1, got ${FIDE_VOCABULARY.specVersion}`);
} else {
  pass("spec-version");
}

const entityTypes = listFideEntityTypes();
if (!entityTypes.some((spec) => spec.code === "10") || !entityTypes.some((spec) => spec.code === "00")) {
  fail("entity-type-list", `expected Person and Statement specs in ${JSON.stringify(entityTypes)}`);
} else {
  pass("entity-type-list");
}

const person = getFideEntityTypeSpecByName("Person");
if (person.code !== "10") {
  fail("person-code", `expected 10, got ${person.code}`);
} else {
  pass("person-code");
}

const personByCode = getFideEntityTypeSpecByCode("10");
if (!personByCode || personByCode.description !== person.description) {
  fail("person-code-lookup", `expected code lookup to match Person, got ${JSON.stringify(personByCode)}`);
} else {
  pass("person-code-lookup");
}

if (FIDE_ENTITY_TYPES.Statement.layer !== "Graph Structure") {
  fail("statement-layer", `expected Graph Structure, got ${FIDE_ENTITY_TYPES.Statement.layer}`);
} else {
  pass("statement-layer");
}

if (failures > 0) {
  process.exit(1);
}

if (!verbose) {
  console.log("✅ Vocabulary SDK tests passed");
}
