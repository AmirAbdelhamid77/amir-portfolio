// FC06 — loader fail-closed behavior.
//
//   node --experimental-strip-types --test tests/fabric-corpus/bindings/
//
// (e) an unknown articleId resolves to an explicit null; unknown subject/topic
//     arguments throw; malformed, missing or internally inconsistent binding
//     files throw with a clear message. Fixtures are temp copies of the real
//     artifacts mutated per case (fs only — no JSON imports).

import assert from "node:assert/strict";
import { existsSync, mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { test } from "node:test";

import * as bindings from "../../../lib/fabric/bindings.ts";
import { createFabricBindingsReader } from "../../../lib/fabric/bindings.ts";
import { collections, primary, secondary, contentFabricDir } from "./helpers.mjs";

const realBindings = createFabricBindingsReader(contentFabricDir);

function fixtureDir(mutate) {
  const dir = mkdtempSync(path.join(os.tmpdir(), "fc06-loader-"));
  mkdirSync(path.join(dir, "bindings"), { recursive: true });
  mkdirSync(path.join(dir, "collections"), { recursive: true });
  const files = {
    "bindings/primary.json": primary,
    "bindings/secondary.json": secondary,
    "collections/collections.json": collections,
  };
  for (const [file, doc] of Object.entries(files)) {
    writeFileSync(path.join(dir, file), JSON.stringify(mutate ? mutate(file, doc) : doc, null, 2) + "\n");
  }
  return dir;
}

function expectThrows(reader, label) {
  assert.throws(
    () => reader.getPrimaryBinding(primary.rows[0].articleId),
    (error) => {
      assert.ok(error instanceof Error);
      assert.match(error.message, /fabric bindings (malformed|missing|unreadable)/, `${label}: ${error.message}`);
      return true;
    },
    `${label} must fail closed`,
  );
}

test("unknown articleId resolves to an explicit null", () => {
  assert.equal(realBindings.getPrimaryBinding("art:totally-unknown/article"), null);
  assert.equal(realBindings.getPrimaryBinding(""), null);
  const known = primary.rows[0];
  const row = realBindings.getPrimaryBinding(known.articleId);
  assert.ok(row, "a bound article must resolve");
  assert.equal(row.bindingId, known.bindingId);
  assert.equal(row.topic, known.topic);
  assert.equal(row.role, "primary");
});

test("unknown subject/topic arguments throw (contract violations, not empty results)", () => {
  assert.throws(() => realBindings.getBindingsForTopic("fabric", "not-a-topic"), /unknown topic/);
  assert.throws(() => realBindings.getBindingsForTopic("no-such-subject", "overview"), /unknown subject/);
  assert.throws(() => realBindings.getCollectionsForTopic("not-a-topic"), /unknown fabric topic/);
  assert.throws(() => realBindings.getHeldCountForTopic("not-a-topic"), /unknown fabric topic/);
});

test("valid non-fabric subjects have no bindings; bound topics resolve", () => {
  assert.deepEqual(realBindings.getBindingsForTopic("sql", "joins"), []);
  const overview = realBindings.getBindingsForTopic("fabric", "overview");
  assert.equal(overview.length, primary.counts.byTopic.overview);
  assert.ok(overview.length > 0);
  assert.equal(realBindings.isBoundFabricTopic("overview"), true);
  assert.equal(realBindings.isBoundFabricTopic("not-a-topic"), false);
});

test("counts and held summaries come from the artifact", () => {
  assert.equal(realBindings.getFabricBindingCounts().primary, primary.rows.length);
  assert.equal(realBindings.getHeldArticles().total, primary.held.total);
  const heldTopic = Object.entries(primary.counts.heldByTopic).find(([, count]) => count > 0);
  assert.ok(heldTopic, "the fixture corpus holds at least one article for some topic");
  assert.equal(realBindings.getHeldCountForTopic(heldTopic[0]), heldTopic[1]);
});

test("a missing content dir throws with a clear message", () => {
  const missing = path.join(os.tmpdir(), "fc06-loader-does-not-exist");
  assert.equal(existsSync(missing), false);
  const reader = createFabricBindingsReader(missing);
  assert.throws(() => reader.getPrimaryBinding("art:any/article"), /fabric bindings missing/);
});

test("malformed JSON fails closed", () => {
  const dir = mkdtempSync(path.join(os.tmpdir(), "fc06-loader-"));
  try {
    mkdirSync(path.join(dir, "bindings"), { recursive: true });
    mkdirSync(path.join(dir, "collections"), { recursive: true });
    writeFileSync(path.join(dir, "bindings", "primary.json"), "{ not json at all");
    const reader = createFabricBindingsReader(dir);
    assert.throws(() => reader.getPrimaryBinding("art:any/article"), /fabric bindings malformed JSON/);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("schema drift fails closed", () => {
  const dir = fixtureDir((file, doc) =>
    file === "bindings/primary.json" ? { ...doc, schema: "hansa.something-else/9" } : doc,
  );
  try {
    expectThrows(createFabricBindingsReader(dir), "wrong primary schema");
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("duplicate primary articleIds fail closed", () => {
  const dir = fixtureDir((file, doc) => {
    if (file !== "bindings/primary.json") return doc;
    const rows = [...doc.rows, doc.rows[0]];
    return { ...doc, rows, counts: { ...doc.counts, primary: rows.length } };
  });
  try {
    expectThrows(createFabricBindingsReader(dir), "duplicate articleId");
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("a counts/rows mismatch fails closed", () => {
  const dir = fixtureDir((file, doc) =>
    file === "bindings/primary.json" ? { ...doc, counts: { ...doc.counts, primary: doc.counts.primary + 7 } } : doc,
  );
  try {
    expectThrows(createFabricBindingsReader(dir), "counts mismatch");
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("a primary row targeting an unknown fabric topic fails closed", () => {
  const dir = fixtureDir((file, doc) => {
    if (file !== "bindings/primary.json") return doc;
    const rows = doc.rows.map((row, index) =>
      index === 0 ? { ...row, topic: "not-a-topic", bindingId: `lb:${row.articleId}@fabric.not-a-topic` } : row,
    );
    return { ...doc, rows };
  });
  try {
    expectThrows(createFabricBindingsReader(dir), "unknown fabric topic");
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("a secondary row with an unknown subject.topic fails closed", () => {
  const dir = fixtureDir((file, doc) => {
    if (file !== "bindings/secondary.json") return doc;
    const rows = doc.rows.map((row, index) =>
      index === 0
        ? { ...row, subject: "not-a-subject", topic: "not-a-topic", bindingId: `lb:${row.articleId}@not-a-subject.not-a-topic` }
        : row,
    );
    return { ...doc, rows };
  });
  try {
    const reader = createFabricBindingsReader(dir);
    assert.throws(() => reader.getSecondaryBindings(secondary.rows[0].articleId), /unknown subject\.topic/);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("a secondary row targeting the fabric subject fails closed", () => {
  const dir = fixtureDir((file, doc) => {
    if (file !== "bindings/secondary.json") return doc;
    const rows = doc.rows.map((row, index) =>
      index === 0
        ? { ...row, subject: "fabric", topic: primary.rows[0].topic, bindingId: `lb:${row.articleId}@fabric.${primary.rows[0].topic}` }
        : row,
    );
    return { ...doc, rows };
  });
  try {
    const reader = createFabricBindingsReader(dir);
    assert.throws(
      () => reader.getSecondaryBindings(secondary.rows[0].articleId),
      /must be cross-subject/,
    );
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("malformed collections (unknown topic) fail closed", () => {
  const dir = fixtureDir((file, doc) => {
    if (file !== "collections/collections.json") return doc;
    const copy = JSON.parse(JSON.stringify(doc));
    copy.collections = copy.collections.map((collection, index) =>
      index === 0 ? { ...collection, topic: "not-a-topic" } : collection,
    );
    return copy;
  });
  try {
    const reader = createFabricBindingsReader(dir);
    assert.throws(() => reader.getCollectionsForTopic(collections.collections[0].topic), /unknown fabric topic/);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("the default export is the same reader surface as the factory", () => {
  for (const name of [
    "getPrimaryBinding",
    "getSecondaryBindings",
    "getSecondaryBindingsByRule",
    "getSecondaryRuleDocs",
    "getBindingsForTopic",
    "getCollectionsForTopic",
    "getHeldCountForTopic",
    "getFabricBindingCounts",
    "getHeldArticles",
    "getFamilyTopicMap",
    "getFabricTopicReadingOverview",
    "isBoundFabricTopic",
  ]) {
    assert.equal(typeof bindings[name], "function", `default reader missing ${name}`);
  }
  assert.ok(bindings.getFamilyTopicMap().length >= 20, "family→topic map must document every family rule");
});
