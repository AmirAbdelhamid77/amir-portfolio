// Validate the Atlas seed proposal without touching the repository.
//
//   node docs/release-readiness-20261106/atlas-seed-dryrun.mjs
//
// It loads the three real Atlas layers, projects them exactly as the app does,
// then applies the proposal in memory and projects again. Nothing is written:
// `content/atlas/*.json` is unchanged, and the seed file is not imported by any
// application code.
import { readFileSync } from "node:fs";
import { projectAtlas, validateDataset } from "../../lib/atlas/model.ts";

const seed = JSON.parse(readFileSync("docs/release-readiness-20261106/atlas-seed-candidate.json", "utf8"));
const layers = ["editorial", "dp600-extension", "dp600-continuation"].map((name) => ({
  name,
  data: JSON.parse(readFileSync(`content/atlas/${name}.json`, "utf8")),
}));

const merged = {
  ...layers[0].data,
  buildVersion: "atlas-dry-run",
  concepts: layers.flatMap((layer) => layer.data.concepts),
  semanticEdges: layers.flatMap((layer) => layer.data.semanticEdges),
  sources: layers.flatMap((layer) => layer.data.sources),
  catalog: layers.flatMap((layer) => layer.data.catalog),
  toc: layers[0].data.toc,
};

const problems = [];
const expect = (label, actual, wanted) => {
  const ok = JSON.stringify(actual) === JSON.stringify(wanted);
  if (!ok) problems.push(`${label}: ${JSON.stringify(actual)} != ${JSON.stringify(wanted)}`);
  console.log(`${ok ? "ok  " : "FAIL"} ${label} = ${JSON.stringify(actual)}`);
};

// 1. Today's projection: nothing is published.
const before = projectAtlas(merged, false);
expect("before: published concepts", before.concepts.length, 0);
expect("before: published edges", before.semanticEdges.length, 0);

// 2. Apply the proposal in memory.
const seeded = structuredClone(merged);
for (const change of seed.concepts) {
  const concept = seeded.concepts.find((entry) => entry.id === change.id);
  if (!concept) problems.push(`missing concept ${change.id}`);
  else {
    const actual = { editorialState: concept.editorialState };
    expect(`concept ${change.id} before`, actual, change.before);
    Object.assign(concept, change.after);
  }
}
for (const change of seed.edges) {
  const edge = seeded.semanticEdges.find((entry) => entry.id === change.id);
  if (!edge) problems.push(`missing edge ${change.id}`);
  else {
    const actual = { editorialState: edge.editorialState, reviewer: edge.reviewer };
    expect(`edge ${change.id} before`, actual, change.before);
    Object.assign(edge, change.after);
  }
}

// 3. With the placeholder reviewer the gate must refuse the publication. That
// refusal is the proof that this file cannot be applied by accident.
let placeholderRejected = false;
try {
  validateDataset(seeded);
} catch (error) {
  placeholderRejected = /human approval/i.test(String(error));
}
expect("placeholder reviewer is rejected by the publication gate", placeholderRejected, true);

// 4. A signed reviewer passes, and the projection then shows exactly the seed.
const signed = structuredClone(seeded);
for (const change of seed.edges) {
  const edge = signed.semanticEdges.find((entry) => entry.id === change.id);
  edge.reviewer = "Human: Dry Run";
}
validateDataset(signed);
const after = projectAtlas(signed, false);
expect("after: published concepts", after.concepts.map((entry) => entry.id).sort(), seed.concepts.map((entry) => entry.id).sort());
expect("after: published edges", after.semanticEdges.map((entry) => entry.id).sort(), seed.edges.map((entry) => entry.id).sort());
expect("after: sources carried", after.sources.map((entry) => entry.id).sort(), seed.sources.map((entry) => entry.id).sort());

// 5. The rest of the corpus stays review-only.
const stillReview = signed.concepts.filter((entry) => entry.editorialState !== "published");
expect("concepts still in review", stillReview.length, merged.concepts.length - seed.concepts.length);
expect(
  "edges still in review",
  signed.semanticEdges.filter((entry) => entry.editorialState !== "published").length,
  merged.semanticEdges.length - seed.edges.length,
);

console.log(`\n${problems.length} problem(s); no file written.`);
if (problems.length) {
  console.error(problems.join("\n"));
  process.exit(1);
}
console.log("PASS: the proposal is minimal, internally consistent, and cannot publish without a Human: reviewer.");
