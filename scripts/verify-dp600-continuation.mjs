// Verification gate for the 2026-10-26 continuation layer. Read-only: no build,
// no export, no deploy. Run after `node scripts/build-atlas-preview.mjs` so that both
// the local review artifact and the normal export exist.
import assert from "node:assert/strict";
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { projectAtlas, validateDataset } from "../lib/atlas/model.ts";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const json = path => JSON.parse(readFileSync(resolve(root, path), "utf8"));
const pilot = json("content/atlas/editorial.json");
const extension = json("content/atlas/dp600-extension.json");
const continuation = json("content/atlas/dp600-continuation.json");
const data = {
  ...pilot,
  concepts: [...pilot.concepts, ...extension.concepts, ...continuation.concepts],
  semanticEdges: [...pilot.semanticEdges, ...extension.semanticEdges, ...continuation.semanticEdges],
  sources: [...pilot.sources, ...extension.sources, ...continuation.sources],
  catalog: [...pilot.catalog, ...extension.catalog, ...continuation.catalog],
};

validateDataset(data);
const review = projectAtlas(data, true);
assert.equal(review.concepts.length, 42, "review concept count");
assert.equal(review.semanticEdges.length, 49, "review relation count");
const cited = new Set([...continuation.concepts.flatMap(c => c.sourceIds), ...continuation.semanticEdges.flatMap(e => e.sourceIds)]);
for (const id of cited) assert.ok(review.sources.some(s => s.id === id), "Cited continuation source left the projection: " + id);
assert.equal(projectAtlas(data).concepts.length, 0, "candidate concepts must not reach the public projection");
assert.equal(projectAtlas(data).semanticEdges.length, 0, "candidate relations must not reach the public projection");
assert.equal(projectAtlas(data).catalog.length, 0, "catalogue associations follow their concepts");

const decode = text => text.replace(/&#x27;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, "&").replace(/&#x2F;/g, "/");
const claims = continuation.semanticEdges.map(edge => edge.claim);

assert.ok(existsSync(resolve(root, "build/atlas-preview/out/learn/dp-600/atlas/index.html")), "Build the Atlas local preview first");
const preview = decode(readFileSync(resolve(root, "build/atlas-preview/out/learn/dp-600/atlas/index.html"), "utf8"));
for (const claim of claims) assert.ok(preview.includes(claim), "Review preview is missing a documented claim: " + claim);
assert.ok(preview.includes("Documentation-reviewed local preview") || preview.includes("Local review preview"), "Missing local review notice");

const findings = [];
function walk(folder) {
  for (const entry of readdirSync(folder, { withFileTypes: true })) {
    const path = resolve(folder, entry.name);
    if (entry.isDirectory()) walk(path);
    else if (/\.(html|json|js|txt)$/.test(path)) {
      const text = decode(readFileSync(path, "utf8"));
      const leaked = claims.find(claim => text.includes(claim)) ?? continuation.concepts.map(c => c.id).find(id => text.includes(id));
      if (leaked) findings.push(path.replace(root + "/", "") + " :: " + leaked);
    }
  }
}
walk(resolve(root, "out"));
assert.deepEqual(findings, [], "Unpublished continuation content leaked into the normal export");

console.log(`PASS: ${review.concepts.length} review concepts, ${review.semanticEdges.length} review relations, ${preview.match(/data-testid="review-notice"/g)?.length ?? 1} review notice; public projection empty; ${claims.length} continuation claims present only in build/atlas-preview/out.`);
