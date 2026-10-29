import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { performance } from "node:perf_hooks";
import { validateDataset, projectAtlas, defaultView, neighborhood, parseView, viewHref, safeReturn, searchConcepts, parseJourney, emptyJourney } from "../../lib/atlas/model.ts";
const data = JSON.parse(readFileSync("content/atlas/editorial.json", "utf8"));
const preview = projectAtlas(data, true);
test("real documented pilot is valid and public export excludes every unpublished record", () => {
  validateDataset(data); assert.equal(preview.concepts.length, 8); assert.equal(preview.semanticEdges.length, 9);
  const publicGraph = projectAtlas(data); assert.equal(publicGraph.concepts.length, 0); assert.equal(publicGraph.semanticEdges.length, 0); assert.equal(publicGraph.sources.length, 0);
  assert.ok(data.semanticEdges.every(edge => edge.sourceIds.length && edge.conditions && edge.rationale && edge.reviewer.includes("not human")));
});
test("publication, structure, evidence, alias and identity gates fail closed", () => {
  const reject = mutate => { const next = structuredClone(data); mutate(next); assert.throws(() => projectAtlas(next)); };
  reject(d => d.concepts.push(d.concepts[0])); reject(d => d.semanticEdges[0].relationType = "contains");
  reject(d => d.semanticEdges[0].from = "missing"); reject(d => d.semanticEdges[0].to = d.semanticEdges[0].from);
  reject(d => d.semanticEdges[0].sourceIds = []); reject(d => d.semanticEdges[0].conditions = "");
  reject(d => d.semanticEdges[0].direction = "directed"); reject(d => d.concepts[1].aliases.push(d.concepts[0].title));
  reject(d => d.semanticEdges[0].editorialState = "published"); reject(d => d.toc[0].resourceId = "missing");
  reject(d => d.catalog[0].href = "https://unsafe.example/"); reject(d => d.sources[0].url = "https://unsafe.example/");
});
test("directed traversal does not prove an inverse; incoming mode is explicit", () => {
  const view = { ...defaultView(), concept: "concept:fabric:sql-endpoint" };
  assert.equal(neighborhood(preview, view).edges.length, 0);
  const incoming = neighborhood(preview, { ...view, incoming: true });
  assert.ok(incoming.edges.some(edge => edge.id === "edge:fabric:shortcut-sql"));
});
test("filters intersect; symmetric comparisons remain traversable from either endpoint", () => {
  for (const concept of ["concept:fabric:shortcut", "concept:fabric:database-mirroring"]) assert.equal(neighborhood(preview, { ...defaultView(), concept, relation: "contrasts_with", source: "shortcuts" }).edges.length, 1);
  assert.equal(neighborhood(preview, { ...defaultView(), relation: "enables", source: "movement" }).edges.length, 0);
  assert.equal(searchConcepts(preview, "اختصار")[0].id, "concept:fabric:shortcut");
});
test("safe versioned URL state round-trips and rejects malicious return targets", () => {
  const state = { ...defaultView(), concept: "concept:fabric:copy-job", hops: 2, incoming: true, zoom: 1.4, x: -70, edge: "edge:fabric:replication-choice" };
  assert.deepEqual(parseView(viewHref(state).split("?")[1], preview).view, state);
  assert.equal(safeReturn("//evil.example/?concept=x", preview), ""); assert.equal(safeReturn("/contact/?next=evil", preview), "");
  assert.ok(parseView("?v=999", preview).warning); assert.ok(parseView("x".repeat(2049), preview).warning);
  assert.equal(parseView("?concept=unknown&zoom=Infinity", preview).view.concept, defaultView().concept);
});
test("journey storage accepts only bounded known data and never a mastery flag", () => {
  assert.deepEqual(parseJourney(null), emptyJourney()); assert.equal(parseJourney("null"), null);
  assert.equal(parseJourney(JSON.stringify({ ...emptyJourney(), step: 4 })), null);
  assert.equal(parseJourney(JSON.stringify({ ...emptyJourney(), reflection: "x".repeat(1501) })), null);
  assert.equal(parseJourney(JSON.stringify({ ...emptyJourney(), visited: [0,0] })), null);
  assert.equal(parseJourney(JSON.stringify({ ...emptyJourney(), answer: "fake" })), null);
  const valid = { ...emptyJourney(), step: 3, visited: [0,1,2], reflection: "I need a dated transformed result." };
  assert.deepEqual(parseJourney(JSON.stringify(valid)), valid);
});
test("second source reuses canonical identities; 2,000-concept fixture is capped", () => {
  const growth = structuredClone(data); growth.sources.push({ ...growth.sources[0], id: "second-edition" }); growth.concepts[0].sourceIds.push("second-edition");
  validateDataset(growth); assert.equal(growth.concepts.length, data.concepts.length);
  const large = { ...preview, concepts: Array.from({length:2000}, (_,i) => ({ ...preview.concepts[0], id: `concept:test:${i}` })), semanticEdges: Array.from({length:1999}, (_,i) => ({ ...preview.semanticEdges[0], id: `edge:test:${i}`, from: "concept:test:0", to: `concept:test:${i+1}` })) };
  const start = performance.now(), slice = neighborhood(large, { ...defaultView(), concept:"concept:test:0", hops:2 });
  assert.equal(slice.concepts.length,40); assert.ok(slice.edges.length <= 80); assert.equal(slice.hiddenConcepts,1960);
  console.log(`2,000-concept synthetic selector: ${(performance.now()-start).toFixed(2)}ms in this Node run; not a browser/CWV benchmark.`);
});
