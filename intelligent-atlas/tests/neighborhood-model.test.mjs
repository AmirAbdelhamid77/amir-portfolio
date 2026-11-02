// Pure neighbourhood tests. They prove the local graph uses only recorded
// candidate edges, keeps stored direction explicit, and separates subject
// membership from semantic relations.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import test from "node:test";
import vm from "node:vm";

const require = createRequire(import.meta.url);
const root = path.resolve("intelligent-atlas");
const neighborhood = require(path.join(root, "prototype", "neighborhood-model.js"));

function loadData() {
  const context = { window: {} };
  vm.createContext(context);
  vm.runInContext(readFileSync(path.join(root, "prototype", "data.js"), "utf8"), context);
  return context.window.ATLAS_DATA;
}

const data = loadData();

test("neighbourhood: requires direction is A requires B", () => {
  const join = neighborhood.buildNeighborhood(data, "concept:sql:join");
  const requires = join.groups.find((group) => group.key === "requires");
  assert.ok(requires.entries.some((entry) => entry.id === "concept:sql:grain"));
  const grain = neighborhood.buildNeighborhood(data, "concept:sql:grain");
  const unlocks = grain.groups.find((group) => group.key === "unlocks");
  assert.ok(unlocks.entries.some((entry) => entry.id === "concept:sql:join"));
});

test("neighbourhood: contrast entries keep their candidate edge identity", () => {
  const shortcut = neighborhood.buildNeighborhood(data, "concept:fabric:shortcut");
  const contrasts = shortcut.groups.find((group) => group.key === "contrasts");
  assert.equal(contrasts.count, 2);
  assert.deepEqual(
    contrasts.entries.map((entry) => entry.id).sort(),
    ["concept:fabric:copy-job", "concept:fabric:database-mirroring"],
  );
  assert.ok(contrasts.entries.every((entry) => entry.edgeId.startsWith("assert:ia:")));
});

test("neighbourhood: related edges are not silently promoted to prerequisites", () => {
  const nulls = neighborhood.buildNeighborhood(data, "concept:sql:null");
  const requires = nulls.groups.find((group) => group.key === "requires");
  const related = nulls.groups.find((group) => group.key === "related");
  assert.equal(requires.count, 0);
  assert.ok(related.entries.some((entry) => entry.id === "concept:sql:aggregation"));
  assert.ok(related.entries.every((entry) => entry.relation === "related"));
});

test("neighbourhood: a zero-edge concept is honest and still navigable", () => {
  const kpi = neighborhood.buildNeighborhood(data, "concept:analysis:kpi");
  assert.equal(kpi.total, 0);
  assert.equal(kpi.groups.every((group) => group.count === 0), true);
  assert.ok(kpi.sameSubject.count > 0);
  assert.ok(kpi.sameSubject.starters.length > 0);
  assert.ok(kpi.sameSubject.starters.every((entry) => entry.id !== "concept:analysis:kpi"));
});

test("neighbourhood: limit and expansion expose an explicit remainder", () => {
  const permissions = neighborhood.buildNeighborhood(data, "concept:fabric:permissions", { limit: 2 });
  assert.equal(permissions.total, 4);
  assert.equal(permissions.shown.length, 2);
  assert.equal(permissions.hiddenCount, 2);
  const expanded = neighborhood.buildNeighborhood(data, "concept:fabric:permissions", { limit: 8 });
  assert.equal(expanded.hiddenCount, 0);
  assert.equal(expanded.shown.length, expanded.total);
});

test("neighbourhood: no duplicate edge appears twice", () => {
  for (const concept of data.concepts) {
    const model = neighborhood.buildNeighborhood(data, concept.id, { limit: 20 });
    const ids = [...model.shown, ...model.hidden].map((entry) => entry.edgeId);
    assert.equal(new Set(ids).size, ids.length, concept.id);
  }
});

test("neighbourhood: every shown entry names its relation and direction", () => {
  const model = neighborhood.buildNeighborhood(data, "concept:fabric:permissions", { limit: 20 });
  for (const entry of model.shown) {
    assert.ok(["requires", "unlocks", "contrasts", "related"].includes(entry.group));
    assert.ok(entry.claim && entry.claim.length > 0);
    assert.ok(neighborhood.relationLabel(entry).length > 0);
    assert.ok(neighborhood.directionLabel(entry).length > 0);
  }
});

test("neighbourhood: same-subject navigation excludes semantic neighbours", () => {
  const model = neighborhood.buildNeighborhood(data, "concept:fabric:shortcut");
  const semantic = new Set([...model.shown, ...model.hidden].map((entry) => entry.id));
  assert.ok(model.sameSubject.starters.every((entry) => !semantic.has(entry.id)));
  assert.ok(model.sameSubject.count > 0);
});

test("neighbourhood: subject entrances cover every concept once", () => {
  const entrances = neighborhood.buildSubjectEntrances(data);
  assert.equal(entrances.length, data.domains.length);
  assert.equal(entrances.reduce((sum, entrance) => sum + entrance.count, 0), data.concepts.length);
  for (const entrance of entrances) {
    assert.equal(entrance.starters.length, 3);
    assert.ok(entrance.starters.every((entry) => entry.domain === entrance.id));
  }
});

test("neighbourhood: starters prefer contextually read concepts", () => {
  const entrances = neighborhood.buildSubjectEntrances(data);
  for (const entrance of entrances) {
    if (entrance.readCount === 0) continue;
    assert.equal(entrance.starters[0].read, true, entrance.id);
  }
});

test("neighbourhood: a missing concept returns an empty model, not a guess", () => {
  const missing = neighborhood.buildNeighborhood(data, "concept:missing");
  assert.equal(missing.center, null);
  assert.equal(missing.total, 0);
  assert.equal(missing.shown.length, 0);
});
