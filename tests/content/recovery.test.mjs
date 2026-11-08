// Guards for the recovered collections (content-recovery mission, 2026-11-09).
// The publication contract: every recovered record is published with its own
// status, restricted bytes stay out, and the ledger counts reconcile.
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const read = (p) => fs.readFileSync(p, "utf8");
const json = (p) => JSON.parse(read(p));

test("the insight authoring bank publishes all 400 records with verbatim statuses", () => {
  const bank = json("docs/daily-insight-bank-20261106/INSIGHT_BANK.json");
  assert.equal(bank.items.length, 400);
  const statuses = bank.items.reduce((m, i) => ((m[i.reviewStatus] = (m[i.reviewStatus] ?? 0) + 1), m), {});
  assert.deepEqual(statuses, { draft: 397, technical_review: 3 });
  for (const item of bank.items) {
    assert.ok(["draft", "technical_review"].includes(item.reviewStatus), item.id);
    assert.equal(item.scientificallyVerified, false, "no record may claim scientific verification");
    assert.ok(item.title && item.scenario && item.takeaway && item.caveat, item.id);
  }
});

test("the held-article ledger accounts for the dependency holds without their bytes", () => {
  const manifest = json("content/recovery/dependency-manifest.json");
  assert.equal(manifest.summary.files, 79);
  const totalHeld = manifest.summary.byTargetRepo.reduce((sum, repo) => sum + repo.includes, 0);
  assert.equal(totalHeld, 307);
  for (const article of manifest.articles) {
    assert.ok(article.dependencyHolds.length > 0, article.articleId);
    assert.match(article.articleId, /^art:/);
  }
  assert.ok(!fs.existsSync("public/fabric-docs-held"), "held article bytes must not be exported");
});

test("the PL-300 recovery is metadata-only: no question or transcript bytes are committed", () => {
  const index = json("content/recovery/pl300-v88-index.json");
  assert.equal(index.records.length, 1285);
  assert.match(index.schema, /^hansa-restricted-bank-index/);
  const serialized = read("content/recovery/pl300-v88-index.json");
  assert.ok(!serialized.includes("transcript_window_example"));
  assert.ok(!serialized.includes('"stem"'));
});

test("the RTI blueprints back every Knowledge Graph lab destination", () => {
  const blueprints = json("content/recovery/rti-lab-blueprints.json");
  assert.equal(blueprints.length, 18);
  const tree = json("public/graph/tree-rti.json");
  const labHrefs = [...new Set(tree.nodes.filter((n) => n.href?.startsWith("/lab/rti/")).map((n) => n.href))];
  assert.equal(labHrefs.length, 8);
  const titles = new Set(blueprints.map((b) => b.title));
  const slugs = labHrefs.map((href) => href.split("/")[3]);
  const known = {
    "ingest-typed-events": "Shipment XML and typed KQL",
    "activator-rules": "Activator temperature rule",
    "digital-twin-context": "Digital twin context and relationships",
    "kql-series-anomalies": "KQL time series and anomaly chart",
    "official-lab-sequence": "Official Fabric lab sequence",
    "measured-factory-data": "Measured steel-factory energy inspection",
    "aggregates-are-not-events": "Published logistics aggregate context",
    "streaming-spark-internals": "Original Spark optimization exercises",
  };
  for (const slug of slugs) assert.ok(titles.has(known[slug]), `blueprint for ${slug}`);
});

test("no regenerated dataset points at the never-existing /explore/charts chapter routes", () => {
  const tree = json("public/graph/tree.json");
  const stale = tree.nodes.filter((n) => n.href?.startsWith("/explore/charts/"));
  assert.equal(stale.length, 0);
  for (const node of tree.nodes) {
    if (node.subject === "visualization" && node.href?.startsWith("/learn/")) {
      assert.match(node.href, /\/learn\/(ar\/)?[a-z0-9-]+\/$/, node.id);
    }
  }
});
